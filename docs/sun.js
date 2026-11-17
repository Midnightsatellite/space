// =====================================================================
// A better Sun: boiling surface, sunspots, darker edges, a streaming corona and glowing prominences
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const sun = SS.bodies.Sun.obj, R = sun.geometry.parameters.radius;
const NOISE = `
  float h3(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float n3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
  float fbm(vec3 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*n3(p); p*=2.03; a*=0.5; } return v; }`;

// ---------- the surface ----------
const surface = new THREE.ShaderMaterial({
  uniforms: { map: { value: sun.material.map }, t: { value: 0 } },
  vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vWN; varying vec3 vW;
    void main(){ vUv=uv; vN=normal; vWN=normalize(mat3(modelMatrix)*normal); vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
  fragmentShader: `uniform sampler2D map; uniform float t; varying vec2 vUv; varying vec3 vN; varying vec3 vWN; varying vec3 vW;
    ${NOISE}
    void main(){
      vec3 tex=texture2D(map,vUv).rgb;
      // boiling granules, slowly churning
      float g=fbm(vN*26.0+vec3(0.0,0.0,t*0.06)); float g2=fbm(vN*9.0-vec3(t*0.02));
      float gran=0.55+0.7*g+0.2*g2;
      // bright active regions (faculae) and sunspots, kept away from the poles
      float band=(1.0-smoothstep(0.4,0.62,abs(vN.y)))*smoothstep(0.06,0.16,abs(vN.y));
      float act=fbm(vN*3.2+vec3(5.0,1.0,t*0.004));
      float sp=n3(vN*12.0+vec3(13.0,7.0,t*0.003))*band*smoothstep(0.55,0.7,n3(vN*2.5+vec3(3.0,9.0,1.0)));
      float pen=smoothstep(0.62,0.67,sp), umb=smoothstep(0.7,0.74,sp);
      vec3 col=mix(vec3(0.9,0.28,0.03),vec3(1.0,0.6,0.16),smoothstep(0.2,0.9,tex.r))*gran;
      col+=vec3(0.22,0.14,0.04)*smoothstep(0.55,0.75,act)*band;
      col*=mix(1.0,0.45,pen); col*=mix(1.0,0.12,umb);
      // darker, redder edges (limb darkening)
      float mu=max(dot(normalize(vWN),normalize(cameraPosition-vW)),0.0);
      col*=0.32+0.68*pow(mu,0.55); col=mix(col*vec3(1.0,0.55,0.25),col,smoothstep(0.0,0.5,mu));
      gl_FragColor=vec4(col*0.82,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
sun.material = surface;

// ---------- the corona and prominences, on a sheet that always faces you ----------
const corona = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { t: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform float t; varying vec2 vUv;
    ${NOISE}
    void main(){
      vec2 p=(vUv-0.5)*9.0; float r=length(p), a=atan(p.y,p.x);
      if(r<0.985) discard;
      float h=r-1.0;
      // the faint corona with long streamers
      float s=fbm(vec3(cos(a)*3.0,sin(a)*3.0,t*0.015));
      float stream=pow(s,2.6)*exp(-h*1.1)*0.6;
      float glow=exp(-h*4.0)*0.35+exp(-h*0.8)*0.05;
      vec3 col=vec3(1.0,0.82,0.6)*(glow+stream);
      // prominences: glowing loops of gas standing on the edge
      float prom=0.0;
      for(int i=0;i<3;i++){ float fi=float(i);
        float ang=fi*2.1+0.4+0.05*sin(t*0.05+fi); float w=0.06+0.03*fract(fi*0.618);
        vec2 c=vec2(cos(ang),sin(ang))*1.0;                          // foot point centre on the edge
        vec2 q=p-c; vec2 tang=vec2(-sin(ang),cos(ang)), nrm=vec2(cos(ang),sin(ang));
        vec2 l=vec2(dot(q,tang),dot(q,nrm));
        float d=abs(length(vec2(l.x,l.y*0.8))-w);                  // a loop
        float flick=0.7+0.3*n3(vec3(l*12.0,t*0.3+fi));
        prom+=exp(-d*d*9000.0)*step(-0.01,l.y)*flick;
      }
      col+=vec3(1.0,0.22,0.08)*prom*0.8;
      float alpha=clamp(glow+stream+prom,0.0,1.0);
      gl_FragColor=vec4(col,alpha);
    }`,
});
const sheet = new THREE.Mesh(new THREE.PlaneGeometry(R * 9, R * 9), corona); sheet.renderOrder = 5; sun.add(sheet);
const q = new THREE.Quaternion();
SS.sim.push((dt, t) => { surface.uniforms.t.value = t; corona.uniforms.t.value = t; sheet.quaternion.copy(sun.getWorldQuaternion(q).invert().multiply(SS.camera.quaternion)); });
// the old flat glow sprites can be gentler now that the corona and the glow effect do the work
for (const c of sun.children) if (c.isSprite) c.material.opacity *= 0.3;
