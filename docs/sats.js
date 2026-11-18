// =====================================================================
// Detailed hand-built models for missions NASA has no 3D file for:
// New Horizons, NuSTAR, IXPE, SPHEREx, Pandora, SPARCS, CUTE  (built from NASA / JPL / ASU / LASP photos and diagrams)
// =====================================================================
import * as THREE from 'three';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = (color, metal = 0.4, rough = 0.5, emi = 0x000000, ei = 1) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emi, emissiveIntensity: ei });
const mat = {
  silver: M(0xdfe3ea, 0.45, 0.32, 0x41454c), alu: M(0xb9bec6, 0.5, 0.4, 0x2c2f34), white: M(0xf4f4f2, 0.1, 0.55, 0x4a4a4a),
  gold: M(0xe8b54a, 0.45, 0.35, 0x5a3c0e), goldD: M(0xb98a2e, 0.45, 0.45, 0x3a2608), black: M(0x1c1c22, 0.3, 0.7, 0x0a0a0e),
  cell: M(0x1d2f74, 0.55, 0.3, 0x0e1a44), cellLine: M(0x9aa6c0, 0.6, 0.4, 0x22262e), dark: M(0x3a3e46, 0.5, 0.5, 0x121418),
  shield: M(0xe6eaf0, 0.4, 0.3, 0x63676e), kapton: M(0xc98a2a, 0.35, 0.55, 0x3e2406), mirror: M(0xcfd6e2, 0.7, 0.18, 0x30343c),
};
const ds = m => { const c = m.clone(); c.side = THREE.DoubleSide; return c; };
const box = (x, y, z, m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
const cyl = (r1, r2, h, m, n = 32, open = false) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n, 1, open), open ? ds(m) : m);
const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const add = (g, ...o) => { for (const k of o) g.add(k); return g; };
// solar panel along +X from origin: cells in a grid with thin frame lines
function panel(len, wid, nx = 4, nz = 2, m = mat.cell) {
  const g = new THREE.Group(); g.add(at(box(len, 0.02, wid, m), len / 2, 0, 0));
  for (let i = 0; i <= nx; i++) g.add(at(box(0.012, 0.026, wid, mat.cellLine), i * len / nx, 0, 0));
  for (let j = 0; j <= nz; j++) g.add(at(box(len, 0.026, 0.012, mat.cellLine), len / 2, 0, -wid / 2 + j * wid / nz));
  return g;
}
// a rod between two points
function rod(p, q, r, m) { const d = q.clone().sub(p), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), m);
  o.position.copy(p).add(q).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; }
// a triangular lattice mast along +Y
function mast(len, rad, bays, r = 0.012, m = mat.alu) {
  const g = new THREE.Group(), h = len / bays, c = [0, 1, 2].map(i => V(Math.cos(i * 2.094) * rad, 0, Math.sin(i * 2.094) * rad));
  for (const k of c) g.add(rod(k, k.clone().setY(len), r * 1.4, m));
  for (let i = 0; i <= bays; i++) for (let j = 0; j < 3; j++) { const a = c[j].clone().setY(i * h), b = c[(j + 1) % 3].clone().setY(i * h); g.add(rod(a, b, r, m));
    if (i < bays) g.add(rod(a, c[(j + 1) % 3].clone().setY((i + 1) * h), r * 0.8, m)); }
  return g;
}
// concentric rings: the front of an X-ray mirror module (nested shells seen end-on)
function shells(R, n, m) { const g = new THREE.Group();
  for (let i = 1; i <= n; i++) { const r = R * i / n; const t = new THREE.Mesh(new THREE.RingGeometry(r - R * 0.035, r, 40), ds(m)); t.rotation.x = -Math.PI / 2; g.add(t); }
  g.add(at(box(R * 2, 0.004, R * 0.06, m), 0, 0.002, 0)); g.add(at(box(R * 0.06, 0.004, R * 2, m), 0, 0.002, 0));   // spider
  return g; }

export const SATS = {

  // New Horizons: about the size of a grand piano, 478 kg. A thick triangular gold body, the 2.1 m white dish on one face
  // (with its feed tripod), the ribbed RTG power unit sticking out of one corner, the LORRI telescope and Ralph on the sides.
  NewHorizons: () => {
    const g = new THREE.Group(), R = 1.25, T = 0.75;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, T, 3), mat.gold); body.rotation.x = Math.PI / 2; g.add(body);
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.01, R * 1.01, 0.05, 3), mat.goldD); edge.rotation.x = Math.PI / 2; edge.position.z = T / 2; g.add(edge);
    const edge2 = edge.clone(); edge2.position.z = -T / 2; g.add(edge2);
    // corners of the triangle (in the XY plane); the cylinder's first vertex points along +Y after the rotation
    const corner = i => { const a = -Math.PI / 2 + (i % 3) * 2.094; return V(Math.cos(a) * R, Math.sin(a) * R, 0); };   // the triangle's 3 corners
    // black radiator panels and boxes on the side faces
    for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2.094 + Math.PI / 3 * 0, n = V(Math.cos(a + Math.PI), Math.sin(a + Math.PI), 0);
      const mid = corner(i).add(corner(i + 1)).multiplyScalar(0.5), f = box(0.9, 0.4, 0.02, mat.black); f.position.copy(mid).addScaledVector(mid.clone().normalize(), 0.01);
      f.lookAt(mid.clone().multiplyScalar(2)); g.add(f); }
    // LORRI: the long-range camera, a round opening on one side face
    { const mid = corner(1).add(corner(2)).multiplyScalar(0.5), dir = mid.clone().normalize();
      const lorri = cyl(0.16, 0.16, 0.25, mat.silver, 24); lorri.quaternion.setFromUnitVectors(V(0, 1, 0), dir); lorri.position.copy(mid).addScaledVector(dir, 0.1).add(V(0.25, 0, -0.1)); g.add(lorri);
      const lens = cyl(0.12, 0.12, 0.02, mat.black, 24); lens.quaternion.copy(lorri.quaternion); lens.position.copy(lorri.position).addScaledVector(dir, 0.13); g.add(lens);
      const ralph = box(0.3, 0.25, 0.25, mat.silver); ralph.position.copy(mid).addScaledVector(dir, 0.12).add(V(-0.35, 0, 0.12)); g.add(ralph);
      const ap = cyl(0.07, 0.07, 0.02, mat.black, 16); ap.quaternion.setFromUnitVectors(V(0, 1, 0), dir); ap.position.copy(ralph.position).addScaledVector(dir, 0.13); g.add(ap); }
    // the RTG: a finned cylinder sticking out from one corner
    { const c = corner(0), dir = c.clone().normalize(), rtg = new THREE.Group();
      rtg.add(at(cyl(0.05, 0.1, 0.3, mat.alu, 12), 0, 0.15, 0));                       // mounting cone
      rtg.add(at(cyl(0.13, 0.13, 0.95, mat.dark, 20), 0, 0.78, 0));
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; rtg.add(at(box(0.015, 0.9, 0.14, mat.silver), Math.cos(a) * 0.19, 0.78, Math.sin(a) * 0.19, 0, -a, 0)); }
      for (const y of [0.3, 0.55, 0.8, 1.05, 1.27]) rtg.add(at(cyl(0.2, 0.2, 0.025, mat.alu, 20), 0, y, 0));
      rtg.quaternion.setFromUnitVectors(V(0, 1, 0), dir); rtg.position.copy(c).addScaledVector(dir, -0.28); g.add(rtg); }
    // thrusters and star trackers
    for (const i of [1, 2]) { const c = corner(i); g.add(at(cyl(0.04, 0.07, 0.12, mat.dark, 10), c.x * 0.95, c.y * 0.95, -T / 2 - 0.06, Math.PI / 2, 0, 0)); }
    g.add(at(cyl(0.07, 0.09, 0.15, mat.black, 12), 0.2, -0.3, -T / 2 - 0.08, Math.PI / 2, 0, 0));
    // the 2.1 m dish on the +Z face, its feed tripod and the small medium-gain dish in front
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.6, 48, 12, 0, 6.283, 0, 0.72), ds(M(0xf6f6f4, 0.1, 0.55, 0x8c8c8c)));
    dish.rotation.x = -Math.PI / 2; dish.position.z = T / 2 + 1.6 + 0.05; g.add(dish);
    const rimZ = T / 2 + 0.05 + 1.6 * (1 - Math.cos(0.72)), rimR = 1.6 * Math.sin(0.72);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(rimR, 0.025, 6, 64), mat.white); rim.position.z = rimZ; g.add(rim);
    g.add(at(cyl(0.2, 0.25, 0.25, mat.white, 20), 0, 0, T / 2 + 0.15, Math.PI / 2, 0, 0));
    const tip = V(0, 0, rimZ + 0.75);
    for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + k * 2.094; g.add(rod(V(Math.cos(a) * rimR * 0.92, Math.sin(a) * rimR * 0.92, rimZ - 0.02), tip, 0.015, mat.alu)); }
    g.add(at(cyl(0.14, 0.14, 0.05, mat.white, 20), tip.x, tip.y, tip.z, Math.PI / 2, 0, 0));
    g.add(at(cyl(0.03, 0.03, 0.25, mat.alu, 8), tip.x, tip.y, tip.z + 0.14, Math.PI / 2, 0, 0));
    return g;
  },

  // NuSTAR: 10.9 m long once deployed. One end: the optics bench with two X-ray telescopes (133 nested shells each).
  // Middle: the 10 m deployable lattice mast. Other end: Orbital's spacecraft bus with the focal plane (CdZnTe detectors)
  // and a single solar array wing.
  NuSTAR: () => {
    const g = new THREE.Group(), L = 9.6, w = 0.5;
    // square lattice mast along +X
    const m = new THREE.Group(), bays = 40, h = L / bays, c = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([a, b]) => V(0, a * w / 2, b * w / 2));
    for (const k of c) m.add(rod(k, k.clone().setX(L), 0.016, mat.alu));
    for (let i = 0; i <= bays; i++) for (let j = 0; j < 4; j++) { const a = c[j].clone().setX(i * h), b = c[(j + 1) % 4].clone().setX(i * h); m.add(rod(a, b, 0.009, mat.alu));
      if (i < bays) m.add(rod(a, c[(j + 1) % 4].clone().setX((i + 1) * h), 0.007, mat.alu)); }
    m.position.x = -L / 2; g.add(m);
    // optics bench at +X: gold-wrapped frame holding the two telescopes, fronts facing outwards
    const ox = L / 2 + 0.35;
    add(g, at(box(0.7, 1.15, 1.6, mat.gold), ox, 0, 0), at(box(0.04, 1.2, 1.65, mat.white), ox - 0.37, 0, 0));
    for (const z of [-0.42, 0.42]) {
      add(g, at(cyl(0.42, 0.42, 0.9, mat.gold, 6), ox + 0.15, 0, z, 0, 0, Math.PI / 2), at(cyl(0.43, 0.43, 0.05, mat.silver, 6), ox + 0.6, 0, z, 0, 0, Math.PI / 2));
      const sh = shells(0.36, 7, mat.mirror); sh.rotation.z = -Math.PI / 2; sh.position.set(ox + 0.63, 0, z); g.add(sh);
      add(g, at(cyl(0.36, 0.36, 0.01, mat.black, 6), ox + 0.62, 0, z, 0, 0, Math.PI / 2));
    }
    add(g, at(box(0.12, 0.12, 0.12, mat.black), ox - 0.2, 0.62, 0.7));   // metrology laser target
    // spacecraft bus + focal plane bench at -X
    const bx = -L / 2 - 0.55;
    add(g, at(cyl(0.6, 0.6, 1.0, mat.gold, 8), bx, 0, 0, 0, 0, Math.PI / 2), at(cyl(0.61, 0.61, 0.05, mat.white, 8), bx + 0.52, 0, 0, 0, 0, Math.PI / 2));
    add(g, at(box(0.3, 0.9, 1.2, mat.white), bx + 0.62, 0, 0));
    for (const z of [-0.3, 0.3]) add(g, at(cyl(0.16, 0.16, 0.25, mat.dark, 20), bx + 0.85, 0, z, 0, 0, Math.PI / 2));   // the two focal plane modules
    add(g, at(cyl(0.06, 0.08, 0.15, mat.black, 12), bx - 0.2, 0.62, 0.25), at(cyl(0.06, 0.08, 0.15, mat.black, 12), bx - 0.35, 0.62, -0.2));   // star trackers
    add(g, at(box(0.15, 0.15, 0.15, mat.black), bx + 0.4, 0.55, -0.55));   // metrology laser
    add(g, at(cyl(0.12, 0.12, 0.05, mat.white, 16), bx - 0.4, -0.6, 0));   // antenna
    // one solar array wing, five panels, standing out from the bus
    const p = panel(3.4, 1.0, 5, 2); p.rotation.z = Math.PI / 2 + 0.35; p.position.set(bx - 0.1, 0.6, 0); g.add(p);
    add(g, at(box(0.06, 0.4, 0.06, mat.alu), bx - 0.05, 0.6, 0, 0, 0, 0.35));
    return g;
  },
  // IXPE: 5.2 m tall once its boom is out. Top: three mirror module assemblies (Marshall) on a triangular optics deck.
  // Middle: 4 m coilable boom. Bottom: Ball spacecraft bus with the three Italian detector units on top and two solar arrays.
  IXPE: () => {
    const g = new THREE.Group();
    // bus
    add(g, at(cyl(0.55, 0.55, 0.75, mat.gold, 8), 0, 0.375, 0, 0, Math.PI / 8, 0), at(cyl(0.56, 0.56, 0.06, mat.white, 8), 0, 0.78, 0, 0, Math.PI / 8, 0));
    add(g, at(box(0.5, 0.3, 0.02, mat.white), 0, 0.42, 0.53), at(cyl(0.12, 0.12, 0.06, mat.white, 20), -0.42, 0.2, 0.3, Math.PI / 2, 0, 0));   // radiator, antenna
    add(g, at(cyl(0.05, 0.07, 0.12, mat.black, 12), 0.35, 0.86, -0.25), at(cyl(0.05, 0.07, 0.12, mat.black, 12), 0.25, 0.86, -0.38));          // star trackers
    // detector units on top of the bus, under the mirror modules
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + Math.PI / 2, x = Math.cos(a) * 0.3, z = Math.sin(a) * 0.3;
      add(g, at(box(0.22, 0.22, 0.22, mat.gold), x, 0.92, z), at(cyl(0.07, 0.07, 0.04, mat.black, 16), x, 1.05, z)); }
    // boom canister and the coilable mast
    add(g, at(cyl(0.2, 0.2, 0.25, mat.dark, 16), 0, 0.92, 0));
    const ms = mast(3.75, 0.36, 26, 0.011, mat.alu); ms.position.y = 1.05; g.add(ms);
    // optics deck: triangle plate with the three mirror modules sticking up
    const tri = new THREE.Shape(); for (let i = 0; i < 3; i++) { const a = i * 2.094 + Math.PI / 2 - 0.5, b = a + 1.0, R = 0.9;
      if (i === 0) tri.moveTo(Math.cos(a) * R, Math.sin(a) * R); else tri.lineTo(Math.cos(a) * R, Math.sin(a) * R); tri.lineTo(Math.cos(b) * R, Math.sin(b) * R); }
    const deck = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.06, bevelEnabled: false }), mat.white); deck.rotation.x = -Math.PI / 2; deck.position.y = 4.8; g.add(deck);
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + Math.PI / 2, x = Math.cos(a) * 0.46, z = -Math.sin(a) * 0.46;
      add(g, at(cyl(0.26, 0.26, 0.62, mat.gold, 32), x, 5.17, z), at(cyl(0.27, 0.27, 0.05, mat.silver, 32), x, 5.5, z), at(cyl(0.255, 0.255, 0.01, mat.black, 32), x, 5.53, z));
      const sh = shells(0.24, 6, mat.mirror); sh.position.set(x, 5.54, z); g.add(sh);
      add(g, at(cyl(0.27, 0.27, 0.05, mat.silver, 32), x, 4.88, z)); }
    // two solar arrays, deployed flat either side of the bus
    for (const s of [1, -1]) { const p = panel(1.3, 0.75, 4, 2); p.rotation.y = s > 0 ? 0 : Math.PI; p.rotation.x = 0.35 * s; p.position.set(s * 0.6, 0.45, 0); g.add(p);
      g.add(at(box(0.12, 0.04, 0.04, mat.alu), s * 0.56, 0.45, 0)); }
    const o = new THREE.Group(); g.rotation.z = Math.PI / 2; g.position.x = 2.6; o.add(g); return o;   // lie it on its side, like NASA's pictures
  },

  // SPHEREx: 2.6 m tall, 3.2 m across. Three nested cone-shaped photon shields (silver honeycomb) around a 20 cm telescope,
  // V-groove radiators under them, a white hexagonal BAE Systems bus, and one fixed solar panel on the side.
  SPHEREx: () => {
    const g = new THREE.Group();
    // bus
    add(g, at(cyl(0.62, 0.62, 0.62, mat.white, 6), 0, 0, 0), at(cyl(0.63, 0.63, 0.04, mat.alu, 6), 0, 0.33, 0), at(cyl(0.63, 0.63, 0.04, mat.alu, 6), 0, -0.33, 0));
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; if (i === 0) continue;
      add(g, at(box(0.36, 0.36, 0.01, i % 2 ? mat.gold : mat.silver), Math.cos(a) * 0.54, 0, Math.sin(a) * 0.54, 0, -a + Math.PI / 2, 0)); }
    add(g, at(cyl(0.08, 0.08, 0.2, mat.alu, 12), -0.2, -0.43, 0.2), at(cyl(0.11, 0.06, 0.06, mat.white, 16), -0.2, -0.55, 0.2));   // antenna
    // strut ring and V-groove radiator stack (flat cones)
    add(g, at(cyl(0.5, 0.62, 0.18, mat.alu, 6, true), 0, 0.44, 0));
    for (let i = 0; i < 3; i++) add(g, at(cyl(1.05 - i * 0.05, 0.55, 0.12, mat.mirror, 48, true), 0, 0.6 + i * 0.1, 0));
    // telescope inside
    add(g, at(cyl(0.22, 0.22, 0.55, mat.black, 24), 0, 0.95, 0), at(cyl(0.2, 0.2, 0.02, mat.mirror, 24), 0, 1.23, 0));
    // the three photon shields: open cones, wide at the top, each with a rolled rim
    const sh = [[1.62, 0.75, 1.9, 0.95], [1.38, 0.68, 1.75, 1.0], [1.14, 0.6, 1.55, 1.05]];
    for (const [rt, rb, h, y] of sh) {
      g.add(at(cyl(rt, rb, h, mat.shield, 64, true), 0, y + h / 2, 0));
      const rim = new THREE.Mesh(new THREE.TorusGeometry(rt, 0.022, 6, 64), mat.alu); rim.rotation.x = Math.PI / 2; rim.position.y = y + h; g.add(rim);
      for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, c = Math.cos(a), sn = Math.sin(a); g.add(rod(V(c * (rb + 0.01), y, sn * (rb + 0.01)), V(c * (rt + 0.01), y + h, sn * (rt + 0.01)), 0.008, mat.alu)); }
    }
    // one flat solar panel on the side of the bus
    const p = panel(1.7, 1.15, 5, 3); p.rotation.z = -Math.PI / 2; p.position.set(0.66, 0.35, 0); g.add(p);
    g.add(at(box(0.06, 0.06, 0.4, mat.alu), 0.64, 0, 0));
    return g;
  },

  // Pandora: about the size of a mini fridge, 325 kg. A Blue Canyon Technologies bus, a 45 cm all-aluminium
  // Cassegrain telescope with a long baffle, and solar arrays.
  Pandora: () => {
    const g = new THREE.Group();
    add(g, box(1.0, 0.75, 0.8, mat.black), at(box(1.02, 0.04, 0.82, mat.alu), 0, 0.38, 0), at(box(1.02, 0.04, 0.82, mat.alu), 0, -0.38, 0));
    add(g, at(box(0.6, 0.5, 0.01, mat.silver), 0, 0, 0.405), at(box(0.01, 0.4, 0.5, mat.gold), -0.505, 0, 0));
    add(g, at(cyl(0.05, 0.06, 0.1, mat.dark, 12), 0.35, 0.45, 0.3), at(cyl(0.05, 0.06, 0.1, mat.dark, 12), 0.35, 0.45, -0.3));   // star trackers
    // instrument box with the near-IR and visible channels, then the telescope
    add(g, at(box(0.7, 0.3, 0.6, mat.gold), 0, 0.55, 0));
    add(g, at(cyl(0.3, 0.3, 0.9, mat.white, 40), 0, 1.15, 0), at(cyl(0.31, 0.31, 0.04, mat.alu, 40), 0, 0.72, 0), at(cyl(0.31, 0.31, 0.04, mat.alu, 40), 0, 1.6, 0));
    add(g, at(cyl(0.27, 0.27, 0.01, mat.black, 40), 0, 1.6, 0), at(cyl(0.05, 0.05, 0.02, mat.mirror, 16), 0, 1.62, 0));
    for (let k = 0; k < 3; k++) { const a = k * 2.094; g.add(rod(V(0, 1.62, 0), V(Math.cos(a) * 0.27, 1.62, Math.sin(a) * 0.27), 0.006, mat.dark)); }
    // baffle: an open tube cut at a slant, so the long side shades the opening from the Sun
    const bf = new THREE.CylinderGeometry(0.32, 0.32, 0.7, 40, 6, true), pos = bf.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), z = pos.getZ(i); if (y > 0) pos.setY(i, y - 0.25 + z * 0.55); }
    bf.computeVertexNormals(); const baf = new THREE.Mesh(bf, ds(mat.alu)); baf.position.y = 1.95; g.add(baf);
    // two solar wings, each two panels, out to the sides
    for (const s of [1, -1]) { const p = panel(1.4, 0.7, 4, 2); p.rotation.y = s > 0 ? 0 : Math.PI; p.position.set(s * 0.52, -0.1, 0); g.add(p); g.add(at(box(0.08, 0.05, 0.05, mat.alu), s * 0.52, -0.1, 0)); }
    add(g, at(cyl(0.09, 0.09, 0.03, mat.white, 16), -0.3, -0.42, 0.2), at(box(0.04, 0.2, 0.04, mat.alu), 0.3, -0.48, -0.2));   // antennas
    return g;
  },

  // SPARCS: a 6U CubeSat (about 10 × 22 × 37 cm) from Arizona State. Anodised aluminium frame, a 9 cm UV telescope
  // looking out of one end, Blue Canyon XB1 avionics, two star trackers and long deployable solar panels.
  SPARCS: () => {
    const g = new THREE.Group(), L = 3.66, W = 2.26, H = 1.0;
    add(g, box(W, H, L, mat.alu));
    for (const x of [-1, 1]) for (const y of [-1, 1]) g.add(at(box(0.08, 0.08, L + 0.02, mat.silver), x * W / 2, y * H / 2, 0));   // rails
    add(g, at(box(W * 0.8, 0.01, L * 0.75, mat.silver), 0, H / 2 + 0.005, 0), at(box(W * 0.3, 0.02, L * 0.3, mat.white), -0.4, H / 2 + 0.01, -0.6));
    // telescope end: round 9 cm aperture with a dark baffle, plus the star tracker windows
    add(g, at(cyl(0.48, 0.48, 0.06, mat.dark, 40), 0.35, 0, L / 2 + 0.03, Math.PI / 2, 0, 0), at(cyl(0.4, 0.4, 0.07, mat.black, 40), 0.35, 0, L / 2 + 0.04, Math.PI / 2, 0, 0));
    add(g, at(cyl(0.11, 0.11, 0.08, mat.alu, 20), 0.35, 0, L / 2 + 0.06, Math.PI / 2, 0, 0));   // secondary mirror holder
    add(g, at(cyl(0.18, 0.18, 0.1, mat.black, 20), -0.7, 0.2, L / 2 + 0.04, Math.PI / 2, 0, 0), at(cyl(0.18, 0.18, 0.1, mat.black, 20), -0.7, 0.2, -L / 2 - 0.04, Math.PI / 2, 0, 0));
    add(g, at(box(0.5, 0.4, 0.02, mat.gold), -0.2, 0.05, -L / 2 - 0.01));
    // two long solar panels deployed out from the bottom edges
    for (const s of [1, -1]) { const p = panel(4.2, L * 0.95, 6, 3); p.rotation.y = s > 0 ? 0 : Math.PI; p.position.set(s * W / 2, -H / 2, 0); g.add(p); }
    return g;
  },

  // CUTE: a 6U CubeSat (about 36 cm long) from Colorado. Inside, a rectangular 20.6 × 8.4 cm Cassegrain telescope
  // feeds a near-ultraviolet spectrograph. Blue Canyon XB1 bus, two long deployable solar panels.
  CUTE: () => {
    const g = new THREE.Group(), L = 3.55, W = 2.26, H = 1.0;
    add(g, box(W, H, L, mat.goldD));
    for (const x of [-1, 1]) for (const y of [-1, 1]) g.add(at(box(0.08, 0.08, L + 0.02, mat.alu), x * W / 2, y * H / 2, 0));
    add(g, at(box(W * 0.9, 0.012, L * 0.85, mat.kapton), 0, H / 2 + 0.006, 0), at(box(W * 0.9, 0.012, L * 0.85, mat.kapton), 0, -H / 2 - 0.006, 0));
    // telescope end: the rectangular aperture behind a door
    add(g, at(box(2.06, 0.84, 0.05, mat.dark), 0, 0, L / 2 + 0.025), at(box(1.9, 0.72, 0.06, mat.black), 0, 0, L / 2 + 0.03), at(box(0.42, 0.22, 0.07, mat.alu), 0, 0, L / 2 + 0.04));
    add(g, at(cyl(0.15, 0.15, 0.08, mat.black, 20), 0.75, 0.2, -L / 2 - 0.04, Math.PI / 2, 0, 0), at(box(0.6, 0.3, 0.02, mat.white), -0.4, 0, -L / 2 - 0.01));
    add(g, at(box(0.03, 0.02, 1.2, mat.alu), -0.9, H / 2 + 0.02, 0));   // UHF antenna
    // two long panels, hinged along the long edges and swung out
    for (const s of [1, -1]) { const p = panel(3.4, L * 0.95, 6, 2); p.rotation.y = s > 0 ? 0 : Math.PI; p.rotation.x = 0; p.rotation.z = s * 0.12; p.position.set(s * W / 2, H / 2, 0); g.add(p); }
    return g;
  },
};
