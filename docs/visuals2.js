// =====================================================================
// A real photo of the Milky Way as the sky, and NASA's own 3D models of famous spacecraft
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const SS = window.SS;
const { scene, camera, bodies } = SS;
const $ = id => document.getElementById(id);

// ---------- 1. the Milky Way all around you (Solar System Scope, CC BY 4.0), placed by real galactic coordinates ----------
{
  const tex = new THREE.TextureLoader().load('tex/milkyway.jpg'); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const e = 23.4393 * Math.PI / 180;
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false,
    uniforms: { map: { value: tex }, k: { value: 2.0 }, ce: { value: Math.cos(e) }, se: { value: Math.sin(e) } },
    vertexShader: 'varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform sampler2D map; uniform float k, ce, se; varying vec3 vD;
      void main(){
        vec3 d=normalize(vD);
        vec3 ecl=vec3(d.x,-d.z,d.y);                                   // scene -> ecliptic
        vec3 eq=vec3(ecl.x, ecl.y*ce-ecl.z*se, ecl.y*se+ecl.z*ce);       // ecliptic -> equatorial
        vec3 g=vec3(-0.0548755604*eq.x-0.8734370902*eq.y-0.4838350155*eq.z,
                     0.4941094279*eq.x-0.4448296300*eq.y+0.7469822445*eq.z,
                    -0.8676661490*eq.x-0.1980763734*eq.y+0.4559837762*eq.z);  // equatorial -> galactic
        float l=atan(g.y,g.x), b=asin(clamp(g.z,-1.,1.));
        vec2 uv=vec2(0.5-l/6.2831853, 0.5-b/3.1415927);
        vec3 c=texture2D(map,uv).rgb;
        gl_FragColor=vec4(c*k,1.);
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(30000, 64, 32), mat); sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  SS.sim.push(() => sky.position.copy(camera.position));
  const row = document.createElement('label'); row.innerHTML = '<span>Milky Way photo</span> <input id="mwOn" type="checkbox">';
  ($('glowOn')?.parentElement || $('labels').parentElement).after(row);
  let on = true; try { on = localStorage.getItem('ss_mw') !== '0'; } catch (e2) { }
  $('mwOn').checked = on; sky.visible = on;
  $('mwOn').onchange = () => { sky.visible = $('mwOn').checked; try { localStorage.setItem('ss_mw', sky.visible ? '1' : '0'); } catch (e2) { } };
  // hide it in the "night sky from London" view, which draws its own sky
  SS.more.skyPhoto = sky;
}

// ---------- 2. NASA 3D models, loaded only when you visit them ----------
{
  const loader = new GLTFLoader();
  loader.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/').setDecoderConfig({ type: 'wasm' }));
  const MODELS = { Voyager1: 'models/voyager.glb', Voyager2: 'models/voyager.glb', Hubble: 'models/hubble.glb', ISS: 'models/iss.glb', JWST: 'models/jwst.glb' };
  const done = {}, cache = {};
  const box = new THREE.Box3(), size = new THREE.Vector3();
  const worldSize = o => { box.makeEmpty(); o.updateWorldMatrix(true, true); o.traverse(c => { if (c.isMesh && c.visible) box.expandByObject(c, false); }); return box.isEmpty() ? 0 : box.getSize(size).length(); };
  function swap(key) {
    if (done[key] || !bodies[key]) return; done[key] = true;
    const obj = bodies[key].obj, url = MODELS[key];
    const old = worldSize(obj);
    (cache[url] ||= new Promise((ok, no) => loader.load(url, g => ok(g.scene), undefined, no))).then(model => {
      const m = model.clone(true);
      obj.traverse(c => { if (c.isMesh) c.visible = false; });         // hide the hand-made model (its name stays)
      obj.add(m); m.updateWorldMatrix(true, true);
      const now = worldSize(m); if (now > 0 && old > 0) m.scale.multiplyScalar(old / now * 1.15);
      // centre it on the old position
      m.updateWorldMatrix(true, true); box.setFromObject(m); const c = box.getCenter(new THREE.Vector3()); obj.worldToLocal(c); m.position.sub(c);
    }).catch(err => { console.warn('model', key, err); done[key] = false; });
  }
  const prev = SS.onFocus; SS.onFocus = key => { prev(key); if (MODELS[key]) swap(key); };
  SS.more.nasaModels = { swap };
}

// ---------- credits ----------
{
  const note = $('note'); if (note) { const s = document.createElement('span'); s.id = 'creditMore'; note.appendChild(s);
    const set = () => { s.textContent = SS.lang === 'fr' ? ' · Ciel : Solar System Scope (CC BY 4.0) · Modèles 3D : NASA' : ' · Sky: Solar System Scope (CC BY 4.0) · 3D models: NASA'; };
    set(); $('langBtn')?.addEventListener('click', () => setTimeout(set, 50)); }
}
SS.i18nAdd?.({ ui: { 'Milky Way photo': 'Photo de la Voie lactée' } });
