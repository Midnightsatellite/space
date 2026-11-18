// =====================================================================
// More spacecraft, in metres: Europa Clipper, Psyche, Lucy, Tianwen-2, Aditya-L1, SOHO and the Lunar Gateway design.
// =====================================================================
import * as THREE from 'three';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = (color, metal = 0.4, rough = 0.5, emi = 0x000000, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emi, ...extra });
const canvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const grid = (base, line) => canvas(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); c.strokeStyle = line; c.lineWidth = 2;
  for (let x = 0; x <= w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
const fan = () => canvas(256, 256, (c, w, h) => {   // a round UltraFlex array: dark blue gores with gold spokes
  c.fillStyle = '#121a46'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a24a'; c.lineWidth = 3;
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.cos(a) * w, h / 2 + Math.sin(a) * h); c.stroke(); }
  c.strokeStyle = '#33438c'; c.lineWidth = 1; for (let r = 12; r < w / 2; r += 12) { c.beginPath(); c.arc(w / 2, h / 2, r, 0, 7); c.stroke(); } });
let _m = null;
const mats = () => _m || (_m = {
  gold: M(0xd8a83c, 0.9, 0.32, 0x5a3e0c), silver: M(0xcfd3d8, 0.85, 0.25, 0x50545a), white: M(0xf2f2ee, 0.1, 0.55, 0x4a4a48),
  grey: M(0x7a7e86, 0.5, 0.5, 0x23262b), dark: M(0x24262c, 0.4, 0.6, 0x0a0b0e), black: M(0x111114, 0.3, 0.7, 0x050506),
  cells: M(0xffffff, 0.5, 0.3, 0x1a2a66, { map: grid('#16205a', '#3c4fa0'), side: THREE.DoubleSide }),
  fan: M(0xffffff, 0.5, 0.35, 0x1a2a66, { map: fan(), side: THREE.DoubleSide }),
  mli: M(0x2c2c34, 0.6, 0.45, 0x0c0c10), blanket: M(0xe4e4dc, 0.3, 0.7, 0x55554f), orange: M(0xd87830, 0.3, 0.6, 0x4a2008),
});
const box = (x, y, z, m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
const cyl = (r1, r2, h, m, n = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n), m);
const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const add = (g, ...o) => { for (const k of o) g.add(k); return g; };
const rod = (p, q, r, m, n = 8) => { const d = q.clone().sub(p), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), n), m);
  o.position.copy(p).add(q).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; };
const dish = (r, depth, m) => { const pts = []; for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push(new THREE.Vector2(r * t, depth * t * t)); }
  return new THREE.Mesh(new THREE.LatheGeometry(pts, 40), m.clone ? Object.assign(m.clone(), { side: THREE.DoubleSide }) : m); };
const wing = (n, w, h, m, gap = 0.1, yoke = 0.8) => { const g = new THREE.Group();
  g.add(rod(V(0, 0, 0), V(yoke, 0, 0), 0.06, mats().silver));
  for (let k = 0; k < n; k++) g.add(at(box(w, 0.05, h, m), yoke + w / 2 + k * (w + gap), 0, 0)); return g; };
const pair = (g, make, x0) => { for (const sx of [1, -1]) { const w = make(); w.position.x = sx * x0; w.rotation.y = sx > 0 ? 0 : Math.PI; g.add(w); } };

// ---------------------------------------------------------------- Europa Clipper: 30.5 m of solar wings, a 3 m dish, an 8.5 m magnetometer boom
export function buildClipper() {
  const k = mats(), g = new THREE.Group();
  add(g, at(cyl(0.85, 0.85, 3.0, k.silver, 24), 0, 0, 0), at(box(1.8, 1.0, 1.8, k.blanket), 0, 1.6, 0));   // propulsion module + vault
  { const d = dish(1.5, 0.45, k.white); at(d, 0, 2.15, 0); g.add(d); }
  pair(g, () => wing(5, 2.05, 4.1, k.cells, 0.08, 1.2), 0.9);                                                   // two 5-panel wings
  g.add(rod(V(0, -0.6, 0.9), V(0, -0.6, 9.4), 0.04, k.silver)); g.add(at(box(0.25, 0.25, 0.25, k.white), 0, -0.6, 9.4));
  add(g, at(box(0.6, 0.5, 0.5, k.dark), 1.0, 1.3, 0.8), at(box(0.12, 0.12, 3.0, k.silver), -1.0, 1.3, 1.5));   // cameras, radar mast
  return g;
}

// ---------------------------------------------------------------- Psyche: box body, two X-shaped five-panel wings (24.8 m), Hall thrusters
export function buildPsyche() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(2.2, 2.4, 2.2, k.gold), 0, 0, 0), at(box(2.22, 0.3, 2.22, k.dark), 0, -1.2, 0));
  for (const x of [-0.45, 0.45]) g.add(at(cyl(0.2, 0.25, 0.25, k.black, 16), x, -1.45, 0));   // Hall-effect thrusters
  for (const sx of [1, -1]) {   // each wing: a long arm of three panels with a cross of two more near the tip
    const w = new THREE.Group(); w.position.x = sx * 1.1; w.rotation.y = sx > 0 ? 0 : Math.PI; g.add(w);
    w.add(rod(V(0, 0, 0), V(0.9, 0, 0), 0.06, k.silver));
    for (let j = 0; j < 3; j++) w.add(at(box(3.2, 0.05, 2.2, k.cells), 2.6 + j * 3.3, 0, 0));
    for (const sz of [1, -1]) w.add(at(box(3.2, 0.05, 2.2, k.cells), 5.9, 0, sz * 2.25));
  }
  { const d = dish(1.0, 0.3, k.white); at(d, 0, 1.2, 0.4); g.add(d); }
  g.add(rod(V(0, 0.9, -1.1), V(0, 0.9, -5.2), 0.03, k.silver)); g.add(at(box(0.2, 0.2, 0.2, k.white), 0, 0.9, -5.2));
  return g;
}

// ---------------------------------------------------------------- Lucy: two round 7.3 m UltraFlex wings, a 2 m dish, a turning instrument platform
export function buildLucy() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(1.6, 1.8, 1.6, k.gold), 0, 0, 0), at(cyl(0.8, 0.9, 0.4, k.dark, 24), 0, -1.1, 0));
  { const d = dish(1.0, 0.32, k.white); at(d, 0, 0.95, 0); g.add(d); }
  for (const sx of [1, -1]) {
    g.add(rod(V(sx * 0.8, 0, 0), V(sx * 2.4, 0, 0), 0.06, k.silver));
    const f = new THREE.Mesh(new THREE.CircleGeometry(3.65, 10), k.fan); at(f, sx * 6.05, 0, 0, Math.PI / 2, 0, 0); g.add(f);
    g.add(at(new THREE.Mesh(new THREE.TorusGeometry(3.65, 0.06, 6, 10), k.silver), sx * 6.05, 0, 0, Math.PI / 2, 0, 0));
  }
  add(g, at(box(0.9, 0.5, 0.7, k.black), 0, -0.2, 1.2), at(cyl(0.12, 0.12, 0.4, k.dark, 12), 0.25, -0.2, 1.65, Math.PI / 2, 0, 0));   // pointing platform + cameras
  return g;
}

// ---------------------------------------------------------------- Tianwen-2: box body, two wings, a sample-return capsule on top, sampling arms below
export function buildTianwen2() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(1.8, 1.6, 1.8, k.gold), 0, 0, 0));
  pair(g, () => wing(3, 1.7, 1.5, k.cells, 0.08, 0.6), 0.9);
  add(g, at(cyl(0.45, 0.6, 0.6, M(0xb08a5a, 0.4, 0.6, 0x2a1e10), 24), 0, 1.1, 0), at(new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(0xb08a5a, 0.4, 0.6, 0x2a1e10)), 0, 1.4, 0));   // return capsule
  for (const z of [-0.5, 0.5]) { g.add(rod(V(0.3, -0.8, z), V(0.9, -1.8, z), 0.05, k.silver)); g.add(at(cyl(0.12, 0.08, 0.2, k.dark, 12), 0.9, -1.9, z)); }
  { const d = dish(0.6, 0.2, k.white); at(d, -0.6, 0.85, -0.5); d.rotation.z = 0.4; g.add(d); }
  return g;
}

// ---------------------------------------------------------------- Aditya-L1: a gold cube with one solar wing and its telescopes facing the Sun (+Z)
export function buildAditya() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(1.7, 1.7, 1.7, k.gold), 0, 0, 0));
  { const w = wing(2, 1.5, 1.3, k.cells, 0.06, 0.6); w.position.x = 0.85; g.add(w); }
  add(g, at(cyl(0.22, 0.22, 0.9, k.white, 20), -0.4, 0.3, 1.2, Math.PI / 2, 0, 0), at(cyl(0.15, 0.15, 0.6, k.dark, 16), 0.35, 0.35, 1.05, Math.PI / 2, 0, 0),
    at(box(0.4, 0.3, 0.4, k.silver), 0.3, -0.45, 1.0));   // VELC coronagraph, SUIT telescope, X-ray instruments
  g.add(rod(V(0, 0.85, 0), V(0, 6.8, 0), 0.03, k.silver)); g.add(at(box(0.15, 0.15, 0.15, k.white), 0, 6.8, 0));   // 6 m magnetometer boom
  return g;
}

// ---------------------------------------------------------------- SOHO: a big service module, the payload module, two wings (9.5 m)
export function buildSOHO() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(3.6, 1.6, 3.6, k.gold), 0, 0, 0), at(box(3.2, 1.8, 2.4, k.blanket), 0, 1.7, 0));
  pair(g, () => wing(2, 1.45, 2.0, k.cells, 0.06, 0.5), 1.8);
  for (const [x, z] of [[-0.8, 1.2], [0.2, 1.2], [1.0, 1.2]]) g.add(at(cyl(0.18, 0.18, 0.5, k.dark, 16), x, 1.8, z + 0.25, Math.PI / 2, 0, 0));   // telescopes facing the Sun (+Z)
  { const d = dish(0.55, 0.15, k.white); at(d, 0, -0.85, -1.2, Math.PI, 0, 0); g.add(d); }
  return g;
}

// ---------------------------------------------------------------- Lunar Gateway (the 2025 design): PPE, HALO, Lunar I-Hab, Lunar View, Canadarm3
export function buildGateway() {
  const k = mats(), g = new THREE.Group(), mod = (r, len, m) => cyl(r, r, len, m, 28);
  const z0 = 0;
  // Power and Propulsion Element with two long roll-out solar arrays
  add(g, at(box(3.0, 3.0, 4.0, k.blanket), 0, 0, z0), at(cyl(0.5, 0.7, 0.6, k.dark, 16), 0, 0, z0 - 2.3, Math.PI / 2, 0, 0));
  for (const sx of [1, -1]) { g.add(rod(V(sx * 1.5, 0, z0), V(sx * 3, 0, z0), 0.08, k.silver)); g.add(at(box(19, 0.05, 3.2, k.cells), sx * 12.5, 0, z0)); }
  // HALO, then ESA's Lunar I-Hab along the same axis, Lunar View off to the side
  add(g, at(mod(1.5, 7.0, k.white), 0, 0, z0 + 5.5, Math.PI / 2, 0, 0), at(mod(2.2, 6.4, k.blanket), 0, 0, z0 + 12.2, Math.PI / 2, 0, 0));
  add(g, at(mod(1.5, 4.5, k.white), 0, 3.6, z0 + 6.0), at(mod(0.7, 0.6, k.silver), 0, 0, z0 + 15.7, Math.PI / 2, 0, 0));
  // Canadarm3 on HALO
  add(g, rod(V(1.5, 0.4, z0 + 4.0), V(4.5, 3.5, z0 + 6.0), 0.18, k.white), rod(V(4.5, 3.5, z0 + 6.0), V(6.5, 1.0, z0 + 10.0), 0.15, k.white), at(box(0.6, 0.6, 0.6, k.dark), 6.5, 1.0, z0 + 10.0));
  { const d = dish(0.9, 0.25, k.white); at(d, -1.6, 2.0, z0 + 3.0, 0, 0, 0.6); g.add(d); }
  return g;
}
