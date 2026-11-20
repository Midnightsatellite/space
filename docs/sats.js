// =====================================================================
// Detailed hand-built models for missions NASA has no 3D file for:
// Tiangong, New Horizons, NuSTAR, IXPE, SPHEREx, Pandora, SPARCS, CUTE  (built from NASA / JPL / ASU / LASP photos and diagrams)
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

  // Tiangong today: a T shape, drawn from the China Manned Space Engineering Office renders. Tianhe core module (16.6 m) with its
  // docking hub at the front; the Wentian and Mengtian labs (about 17.9 m each) on either side of the hub, each ending in a long
  // truss mast with two pairs of flexible solar blankets (dark cells on an orange frame, grey hinge bands) above and below;
  // Tianhe's own two orange wings behind the T; a Shenzhou at the front and one underneath, a Tianzhou cargo ship at the back.
  Tiangong: () => {
    const g = new THREE.Group(), band = M(0xc9cdd3, 0.3, 0.5, 0x2a2c30);
    const cv = (w, h, draw, rep = [1, 1]) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; };
    let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    // white module skin: panel seams, handrails and little boxes, like the renders
    const wh = new THREE.MeshStandardMaterial({ map: cv(512, 256, (c, w, h) => { c.fillStyle = '#f1f1ee'; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(120,124,130,0.45)'; c.lineWidth = 1.5; for (let x = 0; x <= w; x += w / 12) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
        for (let y = 0; y <= h; y += h / 3) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
        c.strokeStyle = 'rgba(200,160,60,0.7)'; c.lineWidth = 2; for (let k = 0; k < 6; k++) { const x = rnd() * w, y = rnd() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + rnd() * 40, y); c.stroke(); }
        for (let k = 0; k < 14; k++) { c.fillStyle = rnd() < 0.3 ? 'rgba(60,64,72,0.75)' : 'rgba(170,174,182,0.7)'; c.fillRect(rnd() * w, rnd() * h, 8 + rnd() * 22, 6 + rnd() * 14); } }, [2, 1]),
      color: 0xffffff, metalness: 0.1, roughness: 0.55, emissive: 0x3c3c3a });
    // flexible solar blanket: dark cells on an orange grid, orange ends, two grey hinge bands
    const blanketMap = cv(256, 1024, (c, w, h) => { c.fillStyle = '#d4742c'; c.fillRect(0, 0, w, h);
      const cols = 5, rows = 34, cw = (w - 12) / cols, ch = (h - 60) / rows;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const v = 26 + Math.floor(rnd() * 10); c.fillStyle = `rgb(${v + 8},${v},${v - 4})`; c.fillRect(6 + i * cw + 1.5, 30 + j * ch + 1.5, cw - 3, ch - 3); }
      c.fillStyle = '#e8792a'; c.fillRect(0, 0, w, 30); c.fillRect(0, h - 30, w, 30);
      c.fillStyle = '#b4b8be'; c.fillRect(0, h * 0.22, w, ch * 1.6); });
    const blanket = new THREE.MeshStandardMaterial({ map: blanketMap, color: 0xffffff, metalness: 0.3, roughness: 0.45, emissive: 0xffffff, emissiveMap: blanketMap, emissiveIntensity: 0.32, side: THREE.DoubleSide });   // glows a little so the orange grid still shows on the shaded side
    const flag = new THREE.MeshBasicMaterial({ map: cv(96, 64, (c, w, h) => { c.fillStyle = '#de2910'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffde00';
      const star = (x, y, r) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.fill(); };
      star(16, 16, 10); for (const [x, y] of [[32, 6], [38, 13], [38, 22], [32, 28]]) star(x, y, 3.2); }), polygonOffset: true, polygonOffsetFactor: -2 });
    const along = (o, axis) => { if (axis === 'x') o.rotation.z = Math.PI / 2; else if (axis === 'z') o.rotation.x = Math.PI / 2; return o; };
    const tube = (r1, r2, len, axis, x, y, z, m = wh) => { const c = along(cyl(r1, r2, len, m, 40), axis); c.position.set(x, y, z); g.add(c); return c; };
    const ring = (r, axis, x, y, z) => tube(r * 1.02, r * 1.02, 0.14, axis, x, y, z, band);
    const decal = (w, h, x, y, z, ry, rx = 0) => { const d = new THREE.Mesh(new THREE.PlaneGeometry(w, h), flag); d.position.set(x, y, z); d.rotation.set(rx, ry, 0); g.add(d); };
    // a blanket wing: one long sheet from p along dir, facing normal
    const sheet = (p, dir, len, wid, normal) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(wid, len), blanket);
      const side = dir.clone().cross(normal).normalize(); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, dir, normal));
      m.position.copy(p).addScaledVector(dir, len / 2); g.add(m); return m; };
    // Tianhe core: hub sphere at z = 0, narrow cabin, cone, wide cabin, aft service section
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1.45, 40, 24), wh));
    tube(1.4, 1.4, 5.0, 'z', 0, 0, 3.9); tube(1.4, 2.1, 1.2, 'z', 0, 0, 7.0); tube(2.1, 2.1, 4.6, 'z', 0, 0, 9.9); tube(1.4, 1.4, 1.6, 'z', 0, 0, 13.0);
    for (const z of [2.0, 4.2, 6.3, 8.0, 10.2, 12.1]) ring(z < 7.5 ? 1.4 : 2.1, 'z', 0, 0, z);
    for (const sx of [1, -1]) g.add(at(box(0.08, 2.4, 3.8, mat.alu), sx * 2.15, 0.4, 9.9));          // radiators on the wide cabin
    decal(0.9, 0.6, 0, 1.425, 5.0, 0, -Math.PI / 2);                                                 // flag on Tianhe
    // Tianhe's own two orange wings, sticking out sideways behind the T
    for (const sx of [1, -1]) { g.add(at(box(2.2, 0.25, 0.25, mat.alu), sx * 3.2, 0, 12.4)); sheet(V(sx * 4.2, 0, 12.4), V(sx, 0, 0), 12, 3.2, V(0, 1, 0)); }
    // the big robotic arm, raised over the core, with its joints
    { const a = V(0.9, 1.3, 2.8), b = V(1.8, 4.6, 6.2), c = V(1.4, 3.3, 10.6);
      g.add(rod(a, b, 0.17, wh), rod(b, c, 0.17, wh), at(new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), mat.alu), b.x, b.y, b.z),
        at(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mat.alu), a.x, a.y, a.z), at(cyl(0.35, 0.35, 0.5, mat.alu, 16), c.x, c.y, c.z)); }
    // a small dish antenna on the hub
    { const d = cyl(0.7, 0.15, 0.3, mat.mirror, 24, true); d.position.set(-0.6, 2.3, 0.4); d.rotation.x = -0.4; g.add(d, rod(V(-0.5, 1.4, 0.2), V(-0.6, 2.2, 0.4), 0.06, mat.alu)); }
    // the two lab modules on the sides of the hub, each ending in a truss mast with four solar blankets
    for (const sx of [1, -1]) {
      tube(1.4, 1.4, 2.2, 'x', sx * 2.5, 0, 0); tube(1.4, 2.1, 1.2, 'x', sx * 4.2, 0, 0); tube(2.1, 2.1, 11.5, 'x', sx * 10.6, 0, 0); tube(1.6, 1.6, 1.4, 'x', sx * 17.0, 0, 0);
      tube(1.2, 1.6, 1.0, 'x', sx * 18.2, 0, 0); tube(1.2, 1.2, 0.8, 'x', sx * 19.1, 0, 0, mat.alu);
      for (const x of [5.5, 8.5, 11.5, 14.5]) ring(2.1, 'x', sx * x, 0, 0);
      decal(0.9, 0.6, sx * 9.0, 0.3, 2.105, sx > 0 ? 0 : 0);                                         // flag on each lab
      // exposed experiment platform: a white grid of payload boxes (Wentian) or a dark payload rack (Mengtian)
      if (sx > 0) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.add(at(box(0.95, 0.95, 0.95, wh), sx * (15.6 + i * 1.0), 2.6, -0.5 + j * 1.0));
      else g.add(at(box(2.6, 1.2, 1.8, mat.dark), sx * 15.2, 2.5, 0.6), at(box(2.4, 0.15, 2.6, mat.alu), sx * 15.2, 1.95, 0.6));
      g.add(at(box(1.8, 0.1, 2.2, mat.alu), sx * 13.6, -2.2, 0));                                    // small radiator / platform underneath
      // the mast: a lattice truss up and down from the far end, two blankets on each side of it
      for (const sy of [1, -1]) {
        const m = mast(27, 0.35, 18, 0.03); m.position.set(sx * 17.0, sy * 1.7, 0); if (sy < 0) m.rotation.z = Math.PI; g.add(m);
        for (const dz of [-2.55, 2.55]) sheet(V(sx * 17.0, sy * 3.0, dz), V(0, sy, 0), 25, 4.6, V(0, 0, 1));
        g.add(at(box(0.6, 0.6, 0.6, mat.alu), sx * 17.0, sy * 1.9, 0));
      }
    }
    // a Shenzhou: orbital module, re-entry capsule, service module with its two blue panels
    const shenzhou = (p, dir, up) => { const s = new THREE.Group();
      s.add(at(new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), wh), 0, 1.3, 0)); s.add(at(cyl(1.25, 0.9, 2.2, M(0x8a8f96, 0.4, 0.5, 0x202226), 24), 0, 3.3, 0));
      s.add(at(cyl(1.4, 1.4, 2.9, wh, 24), 0, 5.9, 0)); s.add(at(cyl(1.45, 1.45, 0.1, band, 24), 0, 4.45, 0));
      for (const sx of [1, -1]) { const p2 = panel(7.5, 2.0, 4, 1); p2.rotation.y = sx > 0 ? 0 : Math.PI; p2.position.set(sx * 1.4, 6.0, 0); s.add(p2); }
      s.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(up.clone().cross(dir), dir, up)); s.position.copy(p); g.add(s); };
    shenzhou(V(0, 0, -1.2), V(0, 0, -1), V(0, 1, 0));            // front port
    shenzhou(V(0, -1.2, 0), V(0, -1, 0), V(0, 0, 1));            // radial port underneath
    // a Tianzhou cargo ship at the back, with its blue panels
    tube(1.7, 1.7, 9.0, 'z', 0, 0, 18.4); tube(1.4, 1.7, 0.8, 'z', 0, 0, 13.6);
    for (const sx of [1, -1]) { const p3 = panel(6.5, 2.4, 3, 1); p3.rotation.y = sx > 0 ? 0 : Math.PI; p3.position.set(sx * 1.7, 0, 20); g.add(p3); }
    return g;
  },

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
  SPARCS: () => {   // 6U CubeSat (36.6 × 22.6 × 10 cm) from Arizona State University, drawn from the mission's renders
    const g = new THREE.Group(), L = 3.66, W = 2.26, H = 1.0;
    const cv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
    // brushed-aluminium skin with fastener rows
    const skin = new THREE.MeshStandardMaterial({ map: cv(256, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#dfe1e4'); gr.addColorStop(1, '#f1f2f3');
        c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(90,94,100,0.6)'; for (let x = 8; x < w; x += 20) { c.fillRect(x, 5, 2, 2); c.fillRect(x, h - 7, 2, 2); }
        c.strokeStyle = 'rgba(120,124,130,0.5)'; c.strokeRect(3, 3, w - 6, h - 6); }), color: 0xffffff, metalness: 0.3, roughness: 0.45, emissive: 0xffffff, emissiveIntensity: 0.38 });
    skin.emissiveMap = skin.map;   // stays silver-white even on the shaded side, like the renders
    // the solar wings: light grey with faint cell seams (as seen in the renders)
    const wingMat = new THREE.MeshStandardMaterial({ map: cv(256, 256, (c, w, h) => { c.fillStyle = '#b9bdc3'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(150,154,160,0.6)';
        for (let x = 0; x <= w; x += w / 6) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } c.strokeStyle = 'rgba(200,204,210,0.8)'; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); }),
      color: 0xffffff, metalness: 0.3, roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0.3, side: THREE.DoubleSide });
    wingMat.emissiveMap = wingMat.map;
    const aluB = M(0xd6d9de, 0.35, 0.45, 0x8a8d92), recess = M(0x55585e, 0.4, 0.6, 0x26282c);
    const copper = M(0xc8642c, 0.6, 0.35, 0x3a1a08);
    add(g, box(W, H, L, skin));
    for (const x of [-1, 1]) for (const y of [-1, 1]) g.add(at(box(0.08, 0.08, L + 0.04, aluB), x * W / 2, y * H / 2, 0));   // corner rails
    for (const z of [-1.2, 0, 1.2]) add(g, at(box(W + 0.02, H + 0.02, 0.03, aluB), 0, 0, z));                                  // frame ribs
    // front end (+Z): the round telescope cover with radial vanes, and a small port below
    { const f = new THREE.Group(); f.position.z = L / 2 + 0.02; g.add(f);
      add(f, box(W * 0.92, H * 0.92, 0.04, aluB), at(cyl(0.44, 0.44, 0.06, mat.dark, 40), 0.25, 0.08, 0.03, Math.PI / 2, 0, 0), at(cyl(0.38, 0.38, 0.07, mat.black, 40), 0.25, 0.08, 0.04, Math.PI / 2, 0, 0));
      for (let i = 0; i < 12; i++) { const v = box(0.36, 0.025, 0.02, mat.alu); v.position.set(0.25, 0.08, 0.08); v.rotation.z = i * Math.PI / 12; f.add(v); }
      add(f, at(cyl(0.09, 0.09, 0.08, mat.alu, 20), 0.25, 0.08, 0.09, Math.PI / 2, 0, 0), at(cyl(0.12, 0.12, 0.06, mat.black, 20), -0.65, -0.25, 0.04, Math.PI / 2, 0, 0)); }
    // back end (−Z): the open electronics frame with its copper bracket, camera port and connectors
    { const k = new THREE.Group(); k.position.z = -L / 2 - 0.02; g.add(k);
      add(k, box(W * 0.95, H * 0.95, 0.05, aluB), at(box(W * 0.6, H * 0.6, 0.02, recess), 0.15, 0.05, -0.03), at(box(1.0, 0.12, 0.08, copper), -0.2, -0.36, -0.04), at(box(0.12, 0.6, 0.08, copper), -0.7, -0.1, -0.04));
      add(k, at(cyl(0.2, 0.2, 0.1, mat.alu, 24), 0.1, 0.05, -0.05, Math.PI / 2, 0, 0), at(cyl(0.13, 0.13, 0.12, mat.black, 24), 0.1, 0.05, -0.06, Math.PI / 2, 0, 0));
      for (let i = 0; i < 4; i++) k.add(at(box(0.1, 0.07, 0.06, mat.silver), 0.55 + i * 0.12, 0.3, -0.03)); }
    // two long wings, three hinged panels each, folded out from the sides
    for (const sx of [1, -1]) { const w = new THREE.Group(); w.position.set(sx * W / 2, 0, -0.35); w.rotation.z = sx * 0.05; g.add(w);
      const pw = L * 0.78, pl = L * 0.72;
      for (let i = 0; i < 3; i++) { const x = sx * (0.12 + pl / 2 + i * (pl + 0.1)); w.add(at(box(pl, 0.04, pw, wingMat), x, 0, 0));
        for (const z of [-pw * 0.3, pw * 0.3]) w.add(at(box(0.1, 0.08, 0.14, mat.alu), sx * (0.07 + i * (pl + 0.1)), 0, z)); } }
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
