// =====================================================================
// ESA spacecraft models, in metres: BepiColombo (MPO + MOSIF + Mio), Hera, Juice, Solar Orbiter,
// Euclid, Gaia, Smile, Ariane 6 (A64) on its pad, Rosetta and Philae.
// =====================================================================
import * as THREE from 'three';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = (color, metal = 0.4, rough = 0.5, emi = 0x000000, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emi, ...extra });
const canvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const cellsTex = (base, line, gold) => canvas(256, 256, (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h); c.strokeStyle = line; c.lineWidth = 2;
  for (let x = 0; x <= w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  for (let y = 0; y <= h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  if (gold) { c.strokeStyle = gold; c.lineWidth = 5; c.strokeRect(2, 2, w - 4, h - 4); }
});
let _m = null;
const mats = () => _m || (_m = {
  gold: M(0xd8a83c, 0.9, 0.32, 0x5a3e0c), goldD: M(0xa8781e, 0.9, 0.4, 0x3a2606), silver: M(0xcfd3d8, 0.85, 0.25, 0x50545a),
  white: M(0xf2f2ee, 0.1, 0.55, 0x4a4a48), grey: M(0x777b82, 0.5, 0.5, 0x22252a), dark: M(0x24262c, 0.4, 0.6, 0x0a0b0e),
  black: M(0x111114, 0.3, 0.7, 0x050506), kapton: M(0xc8862a, 0.75, 0.35, 0x4a2c08), mli: M(0x2a2a30, 0.6, 0.45, 0x0c0c10),
  cells: M(0xffffff, 0.5, 0.3, 0x1a2a66, { map: cellsTex('#16205a', '#3c4fa0', '#c9a24a'), side: THREE.DoubleSide }),
  cellsB: M(0xffffff, 0.5, 0.3, 0x141a40, { map: cellsTex('#0f1430', '#2a3570', null), side: THREE.DoubleSide }),
  radiator: M(0xe8eef0, 0.3, 0.3, 0x50585c), mirror: M(0xdde4ea, 1, 0.08, 0x404650), heat: M(0xeae6dc, 0.2, 0.7, 0x5a5850),
  rock: M(0x4a4440, 0.05, 1, 0x0c0b0a), lichen: M(0x2f2c2a, 0.05, 1, 0x080707),
});
const box = (x, y, z, m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
const cyl = (r1, r2, h, m, n = 32, open = false) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n, 1, open), m);
const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const add = (g, ...o) => { for (const k of o) g.add(k); return g; };
const rod = (p, q, r, m, n = 8) => { const d = q.clone().sub(p), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), n), m);
  o.position.copy(p).add(q).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; };
const dish = (r, depth, m) => { const pts = []; for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push(new THREE.Vector2(r * t, depth * t * t)); }
  const d = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), m); d.material.side = THREE.DoubleSide; return d; };
// a solar wing along +X from the origin: n panels of w × h, with small gaps and a yoke
const wing = (n, w, h, m, gap = 0.12) => { const g = new THREE.Group(); const y0 = 0.6;
  g.add(rod(V(0, 0, 0), V(y0, 0, 0), 0.05, mats().silver));
  for (let k = 0; k < n; k++) g.add(at(box(w, 0.04, h, m), y0 + w / 2 + k * (w + gap), 0, 0));
  return g; };

// ---------------------------------------------------------------- BepiColombo: the stack as it arrives at Mercury
export function buildBepi() {   // MPO at the bottom (its big solar wing along +X), MOSIF sunshade, Mio on top; stack axis +Y
  const k = mats(), g = new THREE.Group();
  // MPO: a box wrapped in silver-white thermal blanket, a big radiator on one face, a long single solar wing
  add(g, at(box(2.4, 1.7, 3.9, k.radiator), 0, 0.85, 0), at(box(0.04, 1.5, 3.6, M(0xb8c4cc, 0.95, 0.12, 0x3a4248)), -1.23, 0.85, 0));
  const w = wing(3, 2.55, 2.1, k.cells); w.position.set(1.2, 0.85, 0); w.rotation.x = 0.4; g.add(w);
  { const hga = dish(0.5, 0.18, k.white); at(hga, 0.6, 1.75, 1.4, Math.PI, 0, 0); g.add(hga, rod(V(0.6, 1.7, 1.4), V(0.6, 1.95, 1.4), 0.04, k.silver)); }
  // MOSIF: the conical sunshade that protects Mio during the cruise
  add(g, at(cyl(1.0, 1.8, 1.4, M(0xd8d8d0, 0.4, 0.6, 0x55554e), 8), 0, 2.4, 0), at(cyl(1.82, 1.82, 0.08, k.dark, 8), 0, 1.72, 0));
  // Mio (Japan's magnetospheric orbiter): an octagonal drum, mostly hidden under MOSIF
  add(g, at(cyl(0.95, 0.95, 0.9, M(0x2e3550, 0.6, 0.35, 0x0c1022), 8), 0, 3.4, 0), at(cyl(0.3, 0.3, 0.2, k.silver, 16), 0, 3.95, 0));
  return g;
}

// ---------------------------------------------------------------- Hera: box body, two 5-panel wings, a dish, and its two cubesats nearby
export function buildHera() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(1.6, 1.7, 1.6, k.gold), 0, 0, 0), at(box(1.62, 0.2, 1.62, k.dark), 0, -0.9, 0));
  for (const sx of [1, -1]) { const w = wing(3, 1.3, 1.1, k.cells, 0.08); w.position.set(sx * 0.8, 0.2, 0); w.rotation.y = sx > 0 ? 0 : Math.PI; g.add(w); }
  { const d = dish(0.56, 0.2, k.white); at(d, 0, 0.86, 0.3, 0, 0, 0); d.rotation.x = -0.3; g.add(d); }
  add(g, at(box(0.3, 0.3, 0.25, k.black), 0.45, 0.2, 0.86), at(cyl(0.09, 0.09, 0.2, k.dark, 16), 0.45, 0.2, 1.0, Math.PI / 2, 0, 0));   // Asteroid Framing Camera
  return g;
}
export function buildCubesat() { const k = mats(), g = new THREE.Group();   // a 6U cubesat with two small wings
  add(g, at(box(0.22, 0.34, 0.11, k.silver), 0, 0, 0));
  for (const sx of [1, -1]) g.add(at(box(0.34, 0.01, 0.2, k.cells), sx * 0.29, 0, 0)); return g; }

// ---------------------------------------------------------------- Juice: huge cross of solar wings, 2.5 m dish, long booms
export function buildJuice() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(2.4, 2.0, 2.6, k.gold), 0, 0, 0), at(box(2.42, 0.25, 2.62, k.dark), 0, -1.05, 0));
  { const d = dish(1.25, 0.4, k.white); at(d, 0, 1.0, 0, 0, 0, 0); g.add(d); g.add(at(cyl(0.08, 0.08, 0.5, k.silver, 12), 0, 1.4, 0)); }
  // 10 panels in a cross: two wings of five, each wing a 2 + 1 + 2 cross of panels
  for (const sx of [1, -1]) {
    const w = new THREE.Group(); w.position.set(sx * 1.2, 0, 0); w.rotation.y = sx > 0 ? 0 : Math.PI; g.add(w);
    w.add(rod(V(0, 0, 0), V(0.8, 0, 0), 0.06, k.silver));
    for (let j = 0; j < 3; j++) w.add(at(box(2.5, 0.05, 3.4, k.cells), 2.1 + j * 2.6, 0, 0));
    for (const sz of [1, -1]) w.add(at(box(2.5, 0.05, 2.6, k.cells), 4.7, 0, sz * 3.05));
  }
  g.add(rod(V(0, -0.3, -1.3), V(0, -0.3, -11.8), 0.04, k.silver)); g.add(at(box(0.3, 0.3, 0.3, k.white), 0, -0.3, -11.8));   // magnetometer boom
  g.add(rod(V(-1.1, 0.8, 1.3), V(-1.1, 0.8, 9.0), 0.03, k.goldD)); g.add(rod(V(1.1, 0.8, 1.3), V(1.1, 0.8, 9.0), 0.03, k.goldD));   // RIME radar antenna
  return g;
}

// ---------------------------------------------------------------- Solar Orbiter: heat shield in front (+X), bus, two tilting wings, boom
export function buildSolarOrbiter() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(1.6, 2.4, 2.1, k.mli), -1.0, 0, 0));
  { const hs = at(box(0.3, 3.1, 2.4, k.black), 0.5, 0, 0); g.add(hs); g.add(at(box(0.02, 3.0, 2.3, M(0x2a2622, 0.2, 0.9, 0x080706)), 0.66, 0, 0)); }
  for (const [y, z] of [[0.6, 0.4], [-0.5, -0.5], [0.1, -0.2], [-0.9, 0.6]]) g.add(at(cyl(0.07, 0.07, 0.04, k.gold, 12), 0.68, y, z, 0, 0, Math.PI / 2));   // feedthrough doors
  for (const sz of [1, -1]) { const w = new THREE.Group(); w.position.set(-1.0, 0, sz * 1.05); g.add(w);
    w.add(rod(V(0, 0, 0), V(0, 0, sz * 0.7), 0.05, k.silver));
    w.rotation.z = 0.45; for (let j = 0; j < 3; j++) w.add(at(box(0.05, 1.2, 2.1, k.cells), 0, 0, sz * (1.8 + j * 2.15))); }
  g.add(rod(V(-1.8, 0.6, 0), V(-6.2, 0.6, 0), 0.04, k.silver)); g.add(at(box(0.25, 0.25, 0.25, k.white), -6.2, 0.6, 0));   // 4.4 m instrument boom
  { const d = dish(0.55, 0.2, k.white); at(d, -1.0, 1.4, 0.6, 0, 0, Math.PI / 2 + 0.6); g.add(d); }
  return g;
}

// ---------------------------------------------------------------- Euclid: telescope tube under a slanted sunshield of solar cells
export function buildEuclid() {
  const k = mats(), g = new THREE.Group();
  add(g, at(cyl(1.55, 1.55, 1.0, k.goldD, 6), 0, 0.5, 0));                                   // service module
  add(g, at(cyl(0.85, 0.85, 2.6, M(0x1a1a1e, 0.5, 0.4, 0x060608)), -0.2, 2.3, 0.3));          // payload module / telescope baffle
  add(g, at(cyl(0.7, 0.7, 0.05, k.mirror), -0.2, 3.62, 0.3));
  { const sh = at(box(0.12, 3.6, 3.1, k.cellsB), 1.05, 2.0, 0); sh.rotation.z = 0.12; g.add(sh); }  // sunshield
  for (const sz of [1, -1]) g.add(at(box(0.08, 0.6, 0.12, k.silver), 0.95, 0.9, sz * 1.2));
  return g;
}

// ---------------------------------------------------------------- Gaia: a 10 m sunshield skirt with a cylinder on top
export function buildGaia() {
  const k = mats(), g = new THREE.Group();
  { const skirt = cyl(5.0, 5.0, 0.06, k.cellsB, 12); g.add(skirt);
    const top = at(new THREE.Mesh(new THREE.CircleGeometry(5.0, 12), M(0xd8d0bc, 0.4, 0.6, 0x4a463c, { side: THREE.DoubleSide })), 0, 0.04, 0, -Math.PI / 2, 0, 0); g.add(top);
    for (let j = 0; j < 12; j++) { const a = j / 12 * Math.PI * 2 + Math.PI / 12; g.add(rod(V(0, 0.05, 0), V(Math.cos(a) * 4.9, 0.05, Math.sin(a) * 4.9), 0.04, k.silver)); } }
  add(g, at(cyl(1.75, 1.75, 1.6, k.gold, 12), 0, 0.85, 0), at(cyl(1.95, 1.75, 1.4, M(0x2a2a30, 0.6, 0.4, 0x0a0a0e), 12), 0, 2.35, 0), at(cyl(1.95, 1.95, 0.05, k.dark, 12), 0, 3.07, 0));
  { const d = at(box(1.4, 0.05, 0.5, k.cells), 0, -0.12, 0); g.add(d); }   // phased-array antenna under the skirt
  return g;
}

// ---------------------------------------------------------------- Smile: box body, two wings, magnetometer boom, X-ray imager
export function buildSmile() {
  const k = mats(), g = new THREE.Group();
  add(g, at(box(1.6, 1.4, 1.6, k.gold), 0, 0, 0), at(box(1.4, 1.2, 1.3, k.silver), 0, 1.3, 0));
  for (const sx of [1, -1]) { const w = wing(2, 1.6, 1.3, k.cells, 0.06); w.position.set(sx * 0.8, 0, 0); w.rotation.y = sx > 0 ? 0 : Math.PI; g.add(w); }
  add(g, at(box(0.5, 0.5, 1.1, k.black), 0.3, 1.5, 0.75), at(cyl(0.3, 0.3, 0.3, k.dark, 20), -0.35, 1.95, 0.4));   // SXI and UVI
  g.add(rod(V(0, -0.7, -0.8), V(0, -0.7, -3.8), 0.03, k.silver)); g.add(at(box(0.15, 0.15, 0.15, k.white), 0, -0.7, -3.8));
  return g;
}

// ---------------------------------------------------------------- Ariane 64 on the pad at ELA-4 (62 m)
export function buildAriane6() {
  const k = mats(), g = new THREE.Group();
  const body = M(0xf2f2ee, 0.15, 0.5, 0x6a6a68), boost = M(0xe6e6e2, 0.2, 0.55, 0x5a5a58);
  add(g, at(cyl(14, 14, 2, k.grey, 24), 0, 1, 0), at(box(16, 6, 16, M(0x5e6268, 0.4, 0.6, 0x2a2c30)), 0, 5, 0));   // pad and table
  const y0 = 8;
  add(g, at(cyl(2.7, 2.7, 30, body, 40), 0, y0 + 15, 0));                                            // core stage (Vulcain 2.1)
  add(g, at(cyl(2.7, 2.7, 3, k.dark, 40), 0, y0 + 30.5, 0));                                          // interstage
  add(g, at(cyl(2.7, 2.7, 9, body, 40), 0, y0 + 36.5, 0));                                            // upper stage (Vinci)
  add(g, at(cyl(2.7, 2.7, 14, body, 40), 0, y0 + 48, 0));                                             // long fairing
  { const nose = new THREE.Mesh(new THREE.SphereGeometry(2.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), body); nose.scale.y = 2.2; nose.position.y = y0 + 55; g.add(nose); }
  for (let j = 0; j < 4; j++) { const a = j * Math.PI / 2 + Math.PI / 4, x = Math.cos(a) * 4.2, z = Math.sin(a) * 4.2;   // four P120C boosters
    add(g, at(cyl(1.7, 1.7, 13.5, boost, 24), x, y0 + 7, z), at(cyl(0.02, 1.7, 3, boost, 24), x, y0 + 15.2, z), at(cyl(1.0, 1.3, 1.2, k.dark, 16), x, y0 - 0.4, z)); }
  add(g, at(cyl(1.1, 1.4, 1.6, k.dark, 20), 0, y0 - 0.6, 0));                                         // Vulcain nozzle
  { const logo = canvas(256, 512, (c, w, h) => { c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, w, h); c.save(); c.translate(w / 2, h / 2); c.rotate(-Math.PI / 2);
      c.fillStyle = '#1b3f91'; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ARIANE 6', 0, 0); c.restore(); });
    const m = M(0xffffff, 0.15, 0.5, 0x5a5a58, { map: logo }); const p = new THREE.Mesh(new THREE.CylinderGeometry(2.72, 2.72, 12, 40, 1, true, -0.5, 1.0), m); p.position.y = y0 + 18; g.add(p); }
  // the four lightning masts round the pad
  for (const [x, z] of [[-30, -30], [30, -30], [-30, 30], [30, 30]]) g.add(at(cyl(0.6, 0.9, 85, k.grey, 8), x, 42.5, z));
  return g;
}

// ---------------------------------------------------------------- Rosetta (as it came to rest on the comet) and Philae
export function buildRosetta() {   // wings along X (32 m tip to tip), dish on +Z
  const k = mats(), g = new THREE.Group();
  add(g, at(box(2.8, 2.0, 2.1, k.kapton), 0, 0, 0), at(box(2.82, 0.2, 2.12, k.dark), 0, 1.05, 0));
  for (const sx of [1, -1]) { const w = wing(5, 2.25, 2.3, k.cells, 0.1); w.position.set(sx * 1.4, 0, 0); w.rotation.y = sx > 0 ? 0 : Math.PI; g.add(w); }
  { const d = dish(1.1, 0.35, k.white); at(d, 0, 0, 1.3, -Math.PI / 2, 0, 0); g.add(d); }
  return g;
}
export function buildPhilae() {   // a 1 m box with solar cells, three splayed legs and a drill
  const k = mats(), g = new THREE.Group();
  const top = at(cyl(0.6, 0.6, 0.8, M(0xffffff, 0.5, 0.3, 0x1a2a66, { map: cellsTex('#16205a', '#3c4fa0', null) }), 6), 0, 0.9, 0); g.add(top);
  for (let j = 0; j < 3; j++) { const a = j * 2.094; g.add(rod(V(Math.cos(a) * 0.3, 0.55, Math.sin(a) * 0.3), V(Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9), 0.035, k.silver));
    g.add(at(cyl(0.12, 0.12, 0.04, k.silver, 12), Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9)); }
  return g;
}
