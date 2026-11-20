// =====================================================================
// Better spacecraft: NASA's own 3D models (NASA 3D Resources) where NASA publishes one,
// and more faithful hand-built models for the rest (NuSTAR, IXPE, SPHEREx, Pandora, SPARCS, CUTE, New Horizons, Tiangong)
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const SS = window.SS;
const { bodies } = SS;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const GLB = { TESS: 'models/tess.glb', Kepler: 'models/kepler.glb', Spitzer: 'models/spitzer.glb', Chandra: 'models/chandra.glb', Fermi: 'models/fermi.glb',
  Swift: 'models/swift.glb', Juno: 'models/juno.glb', Satellite: 'models/tdrs.glb' };

// ---------- materials and parts for the hand-built ones ----------
const M = (color, metal = 0.5, rough = 0.45, emi = 0x000000) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emi });
const silver = M(0xd9dde4, 0.45, 0.35, 0x3a3e44), white = M(0xf2f2f0, 0.15, 0.55, 0x444444), gold = M(0xe0b048, 0.4, 0.4, 0x4a3410), black = M(0x2a2a30, 0.3, 0.6, 0x101014),
  cell = M(0x22306a, 0.5, 0.35, 0x0c1430), grey = M(0x8a9098, 0.6, 0.45, 0x202226), tan = M(0xc8b48a, 0.4, 0.6, 0x2a2416);
const box = (x, y, z, m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
const cyl = (r1, r2, h, m, n = 24, open = false) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n, 1, open), open ? Object.assign(m.clone(), { side: THREE.DoubleSide }) : m);
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
// a solar wing: a frame of cells along +X from the origin
function wing(len, wid, panels = 3) {
  const g = new THREE.Group(), pw = len / panels;
  for (let i = 0; i < panels; i++) { const p = box(pw * 0.96, 0.03, wid, cell); p.position.x = pw * (i + 0.5); g.add(p);
    const f = box(pw * 0.96, 0.035, 0.03, silver); f.position.set(pw * (i + 0.5), 0, wid / 2); g.add(f); const f2 = f.clone(); f2.position.z = -wid / 2; g.add(f2); }
  const yoke = cyl(0.025, 0.025, 0.4, silver, 6); yoke.rotation.z = Math.PI / 2; yoke.position.x = -0.15; g.add(yoke);
  return g;
}
// a lattice mast along +Y
function truss(len, w, bays) {
  const g = new THREE.Group(), h = len / bays, r = 0.018;
  const c = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([a, b]) => V(a * w / 2, 0, b * w / 2));
  const rod = (p, q) => { const d = q.clone().sub(p), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 4), silver);
    m.position.copy(p).add(q).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(m); };
  for (const k of c) rod(k, k.clone().setY(len));
  for (let i = 0; i <= bays; i++) for (let j = 0; j < 4; j++) { const a = c[j].clone().setY(i * h), b = c[(j + 1) % 4].clone().setY(i * h); rod(a, b);
    if (i < bays) rod(a, c[(j + 1) % 4].clone().setY((i + 1) * h)); }
  return g;
}
const BUILD = {
  NuSTAR: () => {   // bus with one big solar wing, 10 m mast between the optics bench and the focal-plane bench
    const g = new THREE.Group();
    g.add(box(1.2, 1.0, 1.0, gold)); const top = at(box(1.0, 0.25, 0.9, white), 0, 0.62, 0); g.add(top);
    const w = wing(3.2, 1.0, 4); w.position.set(0.6, 0, 0); g.add(w);
    for (const z of [-0.25, 0.25]) { const d = at(cyl(0.16, 0.16, 0.45, black, 16), 0, 0.95, z); g.add(d); }
    const m = truss(6.0, 0.32, 14); m.position.y = 0.75; g.add(m);
    const bench = at(box(1.3, 0.2, 0.8, white), 0, 6.85, 0); g.add(bench);
    for (const z of [-0.22, 0.22]) { const o = at(cyl(0.2, 0.2, 0.55, silver, 24), 0, 7.2, z); g.add(o); const lid = at(cyl(0.2, 0.2, 0.02, black, 24), 0, 7.48, z); g.add(lid); }
    return g;
  },
  IXPE: () => {   // three X-ray mirror modules on top, a 4 m boom down to the bus with detectors and two wings
    const g = new THREE.Group();
    const deck = at(cyl(0.95, 0.95, 0.12, white, 6), 0, 4.6, 0); g.add(deck);
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5, x = Math.cos(a) * 0.5, z = Math.sin(a) * 0.5;
      g.add(at(cyl(0.3, 0.3, 1.2, silver, 24), x, 5.25, z)); g.add(at(cyl(0.3, 0.3, 0.03, black, 24), x, 5.86, z)); }
    const m = truss(3.6, 0.5, 8); m.position.y = 1.0; g.add(m);
    g.add(at(cyl(0.7, 0.7, 1.0, gold, 6), 0, 0.5, 0));
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; g.add(at(cyl(0.12, 0.12, 0.35, black, 12), Math.cos(a) * 0.4, 1.15, Math.sin(a) * 0.4)); }
    for (const s of [1, -1]) { const w = wing(2.4, 0.9, 3); w.rotation.y = s > 0 ? 0 : Math.PI; w.position.set(s * 0.7, 0.5, 0); g.add(w); }
    return g;
  },
  SPHEREx: () => {   // three nested cone-shaped photon shields around the telescope, on a hexagonal bus with a flat solar panel
    const g = new THREE.Group();
    g.add(at(cyl(0.75, 0.75, 0.6, gold, 6), 0, 0, 0));
    g.add(at(cyl(0.3, 0.3, 0.9, black, 20), 0, 0.75, 0));
    for (let i = 0; i < 3; i++) g.add(at(cyl(1.0 + i * 0.28, 0.55 + i * 0.22, 1.5 - i * 0.18, silver, 48, true), 0, 1.1 + i * 0.22, 0));
    const p = box(0.04, 1.2, 1.6, cell); p.position.set(0.95, -0.1, 0); g.add(p);
    return g;
  },
  Pandora: () => {   // small satellite: bus, a 45 cm telescope with a slanted sunshade, one solar panel
    const g = new THREE.Group();
    g.add(box(1.0, 0.9, 0.9, gold));
    g.add(at(cyl(0.32, 0.32, 1.1, white, 24), 0, 1.0, 0)); g.add(at(cyl(0.28, 0.28, 0.02, black, 24), 0, 1.56, 0));
    const shade = box(0.7, 0.5, 0.02, white); shade.position.set(0, 1.75, -0.3); shade.rotation.x = -0.4; g.add(shade);
    const w = wing(1.8, 0.85, 3); w.position.set(0.5, 0, 0); g.add(w);
    return g;
  },
  cube6: () => {   // a 6U CubeSat (10 × 20 × 30 cm) with four deployed solar panels
    const g = new THREE.Group();
    g.add(box(1.0, 3.0, 2.0, silver)); for (const z of [-0.6, 0.6]) g.add(at(box(1.02, 2.6, 0.5, gold), 0, 0, z)); for (const y of [-1.0, 0, 1.0]) g.add(at(box(1.04, 0.06, 2.04, grey), 0, y, 0));
    g.add(at(cyl(0.35, 0.35, 0.1, grey, 20), 0, 1.55, 0)); g.add(at(box(0.6, 0.02, 0.6, black), 0, 1.61, 0));
    for (const s of [1, -1]) for (const k of [0, 1]) { const p = box(0.04, 3.0, 2.0, cell); p.position.set(s * (0.55 + k * 0.05), 0, s * (2.05 + k * 2.05)); g.add(p); }
    return g;
  },
  NewHorizons: () => {   // triangular gold body, 2.1 m dish on top, the RTG sticking out of one corner, LORRI camera
    const g = new THREE.Group();
    const body = cyl(1.1, 1.1, 0.7, M(0xe8bc50, 0.3, 0.45, 0x7a5818), 3); g.add(body); g.add(at(cyl(0.5, 0.6, 0.35, silver, 16), 0, 0.5, 0));
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 10, 0, 6.283, 0, 0.55), M(0xf4f4f4, 0.1, 0.5, 0x8a8a8a)); dish.material.side = THREE.DoubleSide; dish.rotation.x = Math.PI; dish.position.y = 1.35; g.add(dish);
    g.add(at(cyl(0.05, 0.05, 0.5, silver, 8), 0, 0.6, 0));
    const rtg = cyl(0.18, 0.18, 1.2, black, 12); rtg.rotation.z = Math.PI / 2; rtg.position.set(-1.4, -0.1, 0); g.add(rtg);
    for (let k = 0; k < 6; k++) { const fin = box(1.1, 0.02, 0.5, grey); fin.position.set(-1.4, -0.1, 0); fin.rotation.x = k * Math.PI / 6; g.add(fin); }
    g.add(at(cyl(0.12, 0.12, 0.5, white, 12), 0.6, -0.2, 0.5));
    const o = new THREE.Group(); g.rotation.x = Math.PI; o.add(g); return o;   // the old probe model is drawn upside down, so match it
  },
  Tiangong: () => {   // T shape: Tianhe core in the middle, Wentian and Mengtian labs either side, big solar wings
    const g = new THREE.Group();
    const along = (r1, r2, l, m, z) => { const c = cyl(r1, r2, l, m, 24); c.rotation.x = Math.PI / 2; c.position.z = z; g.add(c); return c; };
    along(1.4, 1.4, 6, white, 0); along(1.4, 2.1, 1.2, white, 3.6); along(2.1, 2.1, 4, white, 6.2);   // Tianhe
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 16), white), 0, 0, -3.6));                 // docking hub
    along(1.4, 1.4, 6.5, white, -7.2);                                                                    // Tianzhou cargo ship at the back
    for (const s of [1, -1]) {
      const lab = cyl(2.1, 2.1, 17, white, 24); lab.rotation.z = Math.PI / 2; lab.position.set(s * 10.5, 0, -3.6); g.add(lab);
      for (const d of [1, -1]) { const w = wing(26, 4.2, 6); w.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2; w.position.set(s * 16, 0, -3.6); g.add(w); }
      const w2 = wing(9, 3, 3); w2.rotation.z = Math.PI / 2; w2.rotation.y = s > 0 ? 0 : Math.PI; w2.position.set(s * 2.1, 0, 6.2); g.add(w2);
    }
    return g;
  },
};
Object.assign(BUILD, (await import('./sats.js' + new URL(import.meta.url).search)).SATS);   // detailed NuSTAR, IXPE, SPHEREx, Pandora, SPARCS, CUTE
const PROC = { NuSTAR: 'NuSTAR', IXPE: 'IXPE', SPHEREx: 'SPHEREx', Pandora: 'Pandora', SPARCS: 'SPARCS', CUTE: 'CUTE', NewHorizons: 'NewHorizons', Tiangong: 'Tiangong' };

// ---------- swap: hide the old meshes, add the new model at the same size and centre ----------
const loader = new GLTFLoader(); loader.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/').setDecoderConfig({ type: 'wasm' }));
const done = {}, cache = {}, bb = new THREE.Box3(), sz = V();
const worldSize = o => { bb.makeEmpty(); o.updateWorldMatrix(true, true); o.traverse(c => { if (c.isMesh && c.visible) bb.expandByObject(c, false); }); return bb.isEmpty() ? 0 : bb.getSize(sz).length(); };
function fit(obj, model, grow) {
  const old = worldSize(obj);
  obj.traverse(c => { if (c.isMesh) c.visible = false; });
  const wrap = new THREE.Group(); wrap.add(model); obj.add(wrap); wrap.updateWorldMatrix(true, true);
  const now = worldSize(wrap); if (now > 0 && old > 0) wrap.scale.multiplyScalar(old / now * grow);
  wrap.updateWorldMatrix(true, true); bb.setFromObject(wrap); const c = bb.getCenter(V()); obj.worldToLocal(c); wrap.position.sub(c);
}
function swap(key) {
  if (done[key] || !bodies[key]) return; done[key] = true;
  const obj = bodies[key].obj;
  if (PROC[key]) { fit(obj, BUILD[PROC[key]](), 1.25); return; }
  const url = GLB[key]; if (!url) return;
  (cache[url] ||= new Promise((ok, no) => loader.load(url, g => ok(g.scene), undefined, no))).then(m => {
    const c = m.clone(true); c.traverse(o => { if (!o.isMesh || !o.material) return; const mt = o.material = o.material.clone();     // no reflections in space here, so tone down mirror-like metal and add a little glow in its own colour
      if ('metalness' in mt) mt.metalness = Math.min(mt.metalness, 0.45);
      if (mt.emissive && mt.emissive.getHex() === 0) { mt.emissive.copy(mt.color); if (mt.map) mt.emissiveMap = mt.map; mt.emissiveIntensity = 0.22; } });
    fit(obj, c, 1.2);
  }).catch(e => { console.warn('model', key, e); done[key] = false; });
}
// hand-built ones straight away; NASA models when visited, then the rest quietly in the background
for (const k of Object.keys(PROC)) swap(k);
if (bodies.SPARCS) { const sp = V(), su = V(), eo = V();   // SPARCS: look at its sunlit side (it flies a dawn-dusk orbit, always in sunlight)
  bodies.SPARCS.dir = () => { const o = bodies.SPARCS.obj; o.getWorldPosition(sp); bodies.Sun.obj.getWorldPosition(su); bodies.Earth?.obj.getWorldPosition(eo);
    const toSun = su.sub(sp).normalize(), out = sp.clone().sub(eo).normalize();
    return toSun.multiplyScalar(0.75).addScaledVector(out, 0.55).add(V(0, 0.15, 0)).normalize(); }; }
{ const prev = SS.onFocus; SS.onFocus = k => { prev(k); if (GLB[k]) swap(k); }; }
setTimeout(() => { let i = 0; const keys = Object.keys(GLB); const next = () => { if (i < keys.length) { swap(keys[i++]); setTimeout(next, 1500); } }; next(); }, 12000);
SS.more.nasa2 = { swap, BUILD };
await import('./webb.js' + new URL(import.meta.url).search);
