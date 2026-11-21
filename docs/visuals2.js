// =====================================================================
// A real photo of the Milky Way as the sky, and NASA's own 3D models of famous spacecraft
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const SS = window.SS;
const { scene, camera, bodies } = SS;
const $ = id => document.getElementById(id);

// ---------- 1. the Milky Way all around you: NASA's Deep Star Maps 2020 (built from ESA Gaia, Hipparcos and Tycho-2), in real sky coordinates ----------
{
  const loader = new THREE.TextureLoader();
  const prep = t => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = Math.min(8, SS.renderer.capabilities.getMaxAnisotropy()); t.generateMipmaps = true; return t; };
  const tex = prep(loader.load('tex/milkyway4k.jpg'));
  const e = 23.4393 * Math.PI / 180;
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false,
    uniforms: { map: { value: tex }, k: { value: 1.7 }, ce: { value: Math.cos(e) }, se: { value: Math.sin(e) } },
    vertexShader: 'varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform sampler2D map; uniform float k, ce, se; varying vec3 vD;
      void main(){
        vec3 d=normalize(vD);
        vec3 ecl=vec3(d.x,-d.z,d.y);                                   // scene -> ecliptic
        vec3 eq=vec3(ecl.x, ecl.y*ce-ecl.z*se, ecl.y*se+ecl.z*ce);       // ecliptic -> equatorial
        float ra=atan(eq.y,eq.x), dec=asin(clamp(eq.z,-1.,1.));
        vec2 uv=vec2(0.5-ra/6.2831853, 0.5+dec/3.1415927);                // the image has north at the top (textures load flipped)
        vec2 uv2=vec2(fract(uv.x+0.5)-0.5, uv.y);                        // avoid a seam where the map wraps round
        vec2 u=fwidth(uv.x)<fwidth(uv2.x)+1e-6?uv:uv2;
        vec3 c=texture2D(map,u).rgb;
        gl_FragColor=vec4(c*k,1.);
        #include <colorspace_fragment>
      }`,
  });
  // on a big screen, swap in the sharper 8K map once the page has settled
  const big = SS.renderer.capabilities.maxTextureSize >= 8192 && !matchMedia('(pointer:coarse)').matches && Math.max(screen.width, screen.height) * devicePixelRatio > 1400;
  if (big) setTimeout(() => loader.load('tex/milkyway8k.jpg', t => { mat.uniforms.map.value = prep(t); tex.dispose(); }), 6000);
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
  const MODELS = { Voyager1: 'models/voyager.glb', Voyager2: 'models/voyager.glb', Hubble: 'models/hubble.glb', ISS: 'models/iss.glb?v=61', JWST: 'models/jwst.glb' };
  const done = {}, cache = {}, onModel = {};
  const box = new THREE.Box3(), size = new THREE.Vector3();
  const worldSize = o => { box.makeEmpty(); o.updateWorldMatrix(true, true); o.traverse(c => { let k = false; for (let p = c; p && p !== o; p = p.parent) if (p.userData.keep) k = true; if (c.isMesh && c.visible && !k) box.expandByObject(c, false); }); return box.isEmpty() ? 0 : box.getSize(size).length(); };
  function swap(key) {
    if (done[key] || !bodies[key]) return; done[key] = true;
    const obj = bodies[key].obj, url = MODELS[key];
    const old = worldSize(obj);
    (cache[url] ||= new Promise((ok, no) => loader.load(url, g => ok(g.scene), undefined, no))).then(model => {
      const m = model.clone(true);
      const kept = c => { for (let o = c; o && o !== obj; o = o.parent) if (o.userData.keep) return true; return false; };
      obj.traverse(c => { if (c.isMesh && !kept(c)) c.visible = false; });   // hide the hand-made model (its name stays), not craft docked to it
      obj.add(m); m.updateWorldMatrix(true, true);
      const now = worldSize(m); if (now > 0 && old > 0) m.scale.multiplyScalar(old / now * 1.15);
      // centre it on the old position
      m.updateWorldMatrix(true, true); box.setFromObject(m); const c = box.getCenter(new THREE.Vector3()); obj.worldToLocal(c); m.position.sub(c);
      done[key] = m; for (const f of (onModel[key] || [])) f(m);
    }).catch(err => { console.warn('model', key, err); done[key] = false; });
  }
  // ISS: NASA's full station model, with the eight main solar-array blades in their real copper-gold colour
  { const b = bodies.ISS; if (b) { const V = () => new THREE.Vector3();   // fly in from the sunlit side, a little above, so the copper blades face the camera
      b.dir = () => { const p = b.obj.getWorldPosition(V()), su = bodies.Sun.obj.getWorldPosition(V()).sub(p).normalize(), out = p.clone().sub(bodies.Earth.obj.getWorldPosition(V())).normalize();
        return su.multiplyScalar(0.6).addScaledVector(out, 0.7).normalize(); }; } }
  onModel.ISS = [m => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 1024; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, '#8c3f1c'); gr.addColorStop(0.5, '#b35d2c'); gr.addColorStop(1, '#93441f');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 1024);
    for (let i = 0; i < 6000; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,190,130' : '60,20,5'},0.06)`; x.fillRect(Math.random() * 256, Math.random() * 1024, 3, 2); }
    x.fillStyle = 'rgba(55,22,8,0.75)'; for (let y = 0; y < 1024; y += 8) x.fillRect(0, y, 256, 1);          // rows of cells
    x.fillStyle = 'rgba(55,22,8,0.5)'; for (let u = 0; u < 256; u += 32) x.fillRect(u, 0, 1, 1024);
    x.fillStyle = 'rgba(40,16,6,0.9)'; for (let y = 0; y < 1024; y += 128) x.fillRect(0, y, 256, 3);        // panel joints
    x.fillStyle = 'rgba(225,215,200,0.9)'; x.fillRect(0, 0, 256, 6); x.fillRect(0, 1018, 256, 6); x.fillRect(0, 0, 4, 1024); x.fillRect(252, 0, 4, 1024);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const copper = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.45, roughness: 0.38, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.3, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });   // drawn in front of the grey backing sheet
    const bb = new THREE.Box3(), sz = new THREE.Vector3();
    m.traverse(o => {
      if (!o.isMesh || o.material?.name !== 'shiny_panel') return;
      const g = o.geometry; g.computeBoundingBox(); bb.copy(g.boundingBox); bb.getSize(sz);
      const ax = [0, 1, 2].sort((a, b) => sz.getComponent(b) - sz.getComponent(a));   // long axis, short axis
      if (sz.getComponent(ax[0]) < 20) return;                                       // only the big blades
      const pos = g.attributes.position, uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        uv[2 * i] = (pos.getComponent(i, ax[1]) - bb.min.getComponent(ax[1])) / sz.getComponent(ax[1]);
        uv[2 * i + 1] = (pos.getComponent(i, ax[0]) - bb.min.getComponent(ax[0])) / sz.getComponent(ax[0]); }
      o.geometry = g.clone(); o.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); o.material = copper;
    });
    // the rest of the station: keep it readable on the night side too
    m.traverse(o => { if (o.isMesh && o.material !== copper) for (const mt of [].concat(o.material)) if (mt.emissive && mt.emissive.getHex() === 0) {
      if (mt.map) { mt.emissive.set(0xffffff); mt.emissiveMap = mt.map; } else mt.emissive.copy(mt.color); mt.emissiveIntensity = 0.12; } });
  }];
  const prev = SS.onFocus; SS.onFocus = key => { prev(key); if (MODELS[key]) swap(key); };
  { const wp = new THREE.Vector3(); setInterval(() => {   // also load the real model when the camera simply comes close (e.g. passing the ISS while looking at Earth)
      for (const key in MODELS) { if (done[key] || !bodies[key]) continue; const b = bodies[key];
        if (SS.camera.position.distanceTo(b.obj.getWorldPosition(wp)) < Math.max(0.6, (b.view || 0.2) * 5)) swap(key); } }, 1000); }
  SS.more.nasaModels = { swap, onModel, done };
}

// ---------- credits ----------
{
  const note = $('note'); if (note) { const s = document.createElement('span'); s.id = 'creditMore'; note.appendChild(s);
    const set = () => { s.textContent = SS.lang === 'fr' ? ' · Ciel : NASA/Goddard SVS, données ESA/Gaia/DPAC · Modèles 3D : NASA' : ' · Sky: NASA/Goddard SVS, ESA/Gaia/DPAC data · 3D models: NASA'; };
    set(); $('langBtn')?.addEventListener('click', () => setTimeout(set, 50)); }
}
SS.i18nAdd?.({ ui: { 'Milky Way photo': 'Photo de la Voie lactée' } });
await import('./apollo.js' + new URL(import.meta.url).search);
