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
  const MODELS = { Voyager1: 'models/voyager.glb', Voyager2: 'models/voyager.glb', Hubble: 'models/hubble.glb', ISS: 'models/iss.glb', JWST: 'models/jwst.glb' };
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
  const prev = SS.onFocus; SS.onFocus = key => { prev(key); if (MODELS[key]) swap(key); };
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
