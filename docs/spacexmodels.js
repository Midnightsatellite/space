// =====================================================================
// SpaceX 3D models, in metres: Starman's Tesla Roadster, Crew Dragon, Starship and a Starlink V2 Mini.
// =====================================================================
import * as THREE from 'three';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = (color, metal = 0.4, rough = 0.5, emi = 0x000000, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emi, ...extra });
const mat = { steel: M(0xd9dde3, 0.6, 0.3, 0x8a8e94), white: M(0xf4f4f2, 0.1, 0.5, 0x555555), black: M(0x16161a, 0.3, 0.7, 0x050506),
  tyre: M(0x1b1b1d, 0.05, 0.85, 0x060606), grey: M(0x6c7078, 0.5, 0.5, 0x1a1c20), rim: M(0xb8bcc2, 0.85, 0.25, 0x3a3c40),
  glass: M(0x1c2836, 0.7, 0.08, 0x0a1018, { transparent: true, opacity: 0.55 }), visor: M(0x14110c, 0.95, 0.08, 0x0a0806),
  tower: M(0x8a8f96, 0.6, 0.45, 0x4a4d52), suit: M(0xf2f2ee, 0.05, 0.75, 0x5a5a58), seat: M(0x101012, 0.2, 0.8, 0x040404),
  tail: M(0xff2a1a, 0.3, 0.3, 0xa01008), amber: M(0xffa020, 0.3, 0.3, 0x8a4a00), lamp: M(0xfff6dc, 0.3, 0.2, 0xb0a890),
  gold: M(0xc9a24a, 0.9, 0.3, 0x4a3a10), silver: M(0xc8ccd2, 0.85, 0.25, 0x50545a) };
const box = (x, y, z, m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
const cyl = (r1, r2, h, m, n = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n), m);
const sph = (r, m, ws = 24, hs = 16) => new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), m);
const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const add = (g, ...o) => { for (const k of o) g.add(k); return g; };
const rod = (p, q, r, m, n = 8) => { const d = q.clone().sub(p), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), n), m);
  o.position.copy(p).add(q).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; };
const canvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

// ---------------------------------------------------------------- Tesla Roadster (2008, the car Starman drives)
export function buildRoadster() {   // nose towards +X, up +Y, 3.95 m long
  const g = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xb3101a, metalness: 0.45, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0x3c0406 });
  // side profile, with both wheel arches cut out; extruded across the car's width and rounded at the edges
  // (the bevel adds 0.1 m all round, so the outline is drawn 0.1 m inside the real car)
  const s = new THREE.Shape();
  s.moveTo(-1.8, 0.24);
  s.lineTo(-1.66, 0.24); s.absarc(-1.17, 0.33, 0.5, Math.PI * 0.95, Math.PI * 0.05, true);
  s.lineTo(0.68, 0.24); s.absarc(1.17, 0.33, 0.5, Math.PI * 0.95, Math.PI * 0.05, true);
  s.lineTo(1.75, 0.26);
  s.bezierCurveTo(1.88, 0.3, 1.9, 0.4, 1.86, 0.46);             // rounded nose
  s.bezierCurveTo(1.6, 0.58, 1.0, 0.7, 0.45, 0.76);              // long low bonnet up to the windscreen
  s.lineTo(-0.75, 0.78);                                          // door tops (the cockpit is open)
  s.bezierCurveTo(-1.0, 0.84, -1.45, 0.86, -1.76, 0.82);         // rear deck over the motor
  s.bezierCurveTo(-1.9, 0.78, -1.92, 0.55, -1.88, 0.4);          // tail
  s.lineTo(-1.8, 0.24);
  const W = 1.8, bev = 0.12;
  const geo = new THREE.ExtrudeGeometry(s, { depth: W - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: 0.1, bevelSegments: 5, curveSegments: 20 });
  geo.translate(0, 0, -(W - 2 * bev) / 2);
  { // shape it like a real car: sides lean inwards towards the top, nose and tail narrow in plan, the top is crowned
    const P = geo.attributes.position, cl = v => Math.min(1, Math.max(0, v));
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i); let z = P.getZ(i);
      z *= (1 - 0.16 * cl((y - 0.45) / 0.45)) * (1 - 0.14 * cl((Math.abs(x) - 1.3) / 0.65) ** 2);
      P.setXYZ(i, x, y + 0.05 * cl((y - 0.5) / 0.4) * (1 - (z / 0.9) ** 2), z);
    }
    geo.computeVertexNormals();
  }
  g.add(new THREE.Mesh(geo, paint));
  // front wing bulges over the wheels and a scooped side intake
  for (const z of [0.66, -0.66]) {
    const f = sph(1, paint, 28, 14); f.scale.set(0.6, 0.12, 0.25); f.position.set(1.15, 0.7, z * 0.95); g.add(f);
    const r = sph(1, paint, 28, 14); r.scale.set(0.62, 0.13, 0.26); r.position.set(-1.2, 0.82, z * 0.95); g.add(r);
    const scoop = sph(1, mat.black, 20, 10); scoop.scale.set(0.3, 0.1, 0.05); scoop.position.set(-0.55, 0.5, Math.sign(z) * 0.86); g.add(scoop);
  }
  // the open cockpit: dark tub, two seats, roll hoops behind them
  add(g, at(box(1.15, 0.05, 1.3, mat.seat), -0.12, 0.865, 0));
  for (const z of [0.36, -0.36]) {
    add(g, at(box(0.55, 0.12, 0.48, mat.seat), -0.1, 0.9, z), at(box(0.14, 0.62, 0.48, mat.seat), -0.48, 1.12, z, 0, 0, 0.18));
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 20, Math.PI), mat.black); at(hoop, -0.72, 1.0, z, 0, Math.PI / 2, 0); g.add(hoop);
  }
  // windscreen: dark frame with tinted glass, raked back
  { const ws = new THREE.Group(); ws.position.set(0.42, 0.82, 0); ws.rotation.z = 0.95; g.add(ws);
    add(ws, at(box(0.03, 0.62, 1.36, mat.glass), 0, 0.31, 0), at(box(0.05, 0.05, 1.4, mat.black), 0, 0.62, 0));
    for (const z of [0.69, -0.69]) ws.add(at(box(0.05, 0.64, 0.05, mat.black), 0, 0.31, z)); }
  for (const z of [0.95, -0.95]) add(g, at(box(0.16, 0.1, 0.06, paint), 0.3, 0.94, z * 0.92), at(box(0.06, 0.08, 0.03, mat.silver), 0.28, 0.94, z * 0.96));   // mirrors
  // lights: swept headlamps, and the Roadster's twin round tail-lamps each side
  for (const z of [0.55, -0.55]) {
    const h = sph(1, mat.lamp, 18, 10); h.scale.set(0.2, 0.05, 0.15); h.position.set(1.7, 0.6, z * 0.92); h.rotation.z = -0.35; g.add(h);
    add(g, at(cyl(0.08, 0.08, 0.05, mat.tail, 20), -1.985, 0.66, z * 1.14, 0, 0, Math.PI / 2), at(cyl(0.07, 0.07, 0.05, mat.amber, 20), -1.985, 0.66, z * 0.82, 0, 0, Math.PI / 2));
  }
  add(g, at(box(0.06, 0.12, 0.75, mat.black), 1.955, 0.36, 0), at(box(0.06, 0.1, 1.2, mat.black), -1.975, 0.3, 0));   // front intake, rear diffuser
  { const plate = canvas(256, 64, (c, w, h) => { c.fillStyle = '#f0f0ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('T E S L A', w / 2, h / 2 + 2); });
    g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.1), new THREE.MeshBasicMaterial({ map: plate })), -2.0, 0.48, 0, 0, -Math.PI / 2, 0)); }
  // wheels: low-profile tyres on silver multi-spoke rims
  for (const x of [1.17, -1.17]) for (const z of [0.79, -0.79]) {
    const w = new THREE.Group(); w.position.set(x, 0.33, z); g.add(w);
    w.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.08, 12, 28), mat.tyre), 0, 0, 0));
    w.add(at(cyl(0.2, 0.2, 0.2, mat.black, 24), 0, 0, 0, Math.PI / 2, 0, 0));
    const face = Math.sign(z) * 0.1;
    w.add(at(cyl(0.05, 0.05, 0.03, mat.rim, 12), 0, 0, face, Math.PI / 2, 0, 0));
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; w.add(at(box(0.2, 0.035, 0.025, mat.rim), Math.cos(a) * 0.11, Math.sin(a) * 0.11, face, 0, 0, a)); }
    w.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.015, 6, 28), mat.rim), 0, 0, face));
  }
  // Starman: white spacesuit, white helmet with a dark visor, right hand on the wheel, left arm on the door
  const sm = new THREE.Group(); sm.position.set(-0.22, 0.89, 0.36); g.add(sm);
  add(sm, at(box(0.32, 0.55, 0.42, mat.suit), -0.12, 0.33, 0, 0, 0, 0.2));                         // torso, leaning back
  add(sm, at(box(0.18, 0.08, 0.36, mat.suit), -0.18, 0.62, 0));                                     // shoulders
  add(sm, at(sph(0.17, mat.suit), -0.06, 0.83, 0), at(sph(0.13, mat.visor, 20, 12), 0.03, 0.83, 0));   // helmet + visor
  { const v = sm.children[sm.children.length - 1]; v.scale.set(1, 0.8, 1.05); }
  for (const z of [0.1, -0.1]) add(sm, rod(V(-0.05, 0.08, z), V(0.48, 0.12, z), 0.075, mat.suit), rod(V(0.48, 0.12, z), V(0.78, -0.18, z), 0.065, mat.suit));   // legs under the dash
  add(sm, rod(V(-0.1, 0.55, -0.2), V(0.22, 0.36, -0.22), 0.055, mat.suit), rod(V(0.22, 0.36, -0.22), V(0.48, 0.5, -0.12), 0.05, mat.suit));   // arm to the wheel
  add(sm, rod(V(-0.12, 0.55, 0.22), V(0.0, 0.3, 0.42), 0.055, mat.suit), rod(V(0.0, 0.3, 0.42), V(0.38, 0.22, 0.52), 0.05, mat.suit));     // arm resting on the door
  add(sm, at(sph(0.06, mat.suit, 10, 8), 0.5, 0.5, -0.12), at(sph(0.06, mat.suit, 10, 8), 0.4, 0.22, 0.53));
  add(g, at(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 24), mat.black), 0.28, 1.07, 0.36, 0, Math.PI / 2, 0.55));   // steering wheel
  return g;
}

// ---------------------------------------------------------------- Crew Dragon (capsule on +Y, trunk below)
function dragonSkin() {   // painted details wrapped round the capsule: SuperDraco bays, windows, thrusters, flag and lettering
  return canvas(2048, 1024, (c, w, h) => {
    const Y = f => h * (1 - f);                                                    // f = height up the capsule, 0 at the base
    c.fillStyle = '#f4f4f2'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(150,150,150,0.28)'; c.lineWidth = 3;                    // faint panel lines
    for (let k = 0; k < 16; k++) { c.beginPath(); c.moveTo(k * w / 16, Y(0.08)); c.lineTo(k * w / 16, Y(0.92)); c.stroke(); }
    for (const f of [0.42, 0.7]) { c.beginPath(); c.moveTo(0, Y(f)); c.lineTo(w, Y(f)); c.stroke(); }
    c.fillStyle = '#1a1a1d'; c.fillRect(0, Y(0.04), w, h * 0.04);                 // dark band just above the heat shield
    for (let k = 0; k < 4; k++) {                                                  // four SuperDraco bays, swept like eyebrows, low on the sides
      const x = (k + 0.5) * w / 4; c.fillStyle = '#17171a';
      c.beginPath(); c.moveTo(x - 170, Y(0.06)); c.quadraticCurveTo(x, Y(0.5), x + 170, Y(0.06)); c.quadraticCurveTo(x, Y(0.24), x - 170, Y(0.06)); c.fill();
      c.fillStyle = '#2c2c31'; for (const d of [-60, 60]) { c.beginPath(); c.arc(x + d, Y(0.17), 22, 0, 7); c.fill(); }
    }
    for (let k = 0; k < 4; k++) {                                                  // four windows between the bays
      const x = k * w / 4 + 30; c.fillStyle = '#121620';
      c.beginPath(); c.ellipse(x, Y(0.5), 44, 40, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(90,120,160,0.45)'; c.beginPath(); c.ellipse(x - 12, Y(0.52), 16, 12, 0, 0, 7); c.fill();
    }
    c.fillStyle = '#121620'; c.beginPath(); c.ellipse(w * 0.62, Y(0.36), 36, 32, 0, 0, 7); c.fill();   // hatch window
    c.strokeStyle = '#b8b8b8'; c.lineWidth = 4; c.strokeRect(w * 0.62 - 90, Y(0.62), 180, h * 0.42);   // side hatch outline
    c.fillStyle = '#2a2a30';                                                       // Draco thrusters near the top
    for (let k = 0; k < 16; k++) { c.beginPath(); c.arc((k + 0.25) * w / 16, Y(0.84), 10, 0, 7); c.fill(); }
    const txt = (t, x, f, size) => { c.save(); c.translate(x, Y(f)); c.rotate(-Math.PI / 2);   // lettering that reads up towards the nose
      c.fillStyle = '#1e3e8c'; c.font = size; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, 0, 0); c.restore(); };
    txt('SPACEX', w * 0.4, 0.6, 'bold 74px sans-serif'); txt('D R A G O N', w * 0.12, 0.32, '40px sans-serif');
    const fx = w * 0.27, fy = Y(0.72), fw = 96, fh = 60;                          // US flag
    for (let k = 0; k < 13; k++) { c.fillStyle = k % 2 ? '#fff' : '#b22234'; c.fillRect(fx, fy + k * fh / 13, fw, fh / 13 + 0.5); }
    c.fillStyle = '#3c3b6e'; c.fillRect(fx, fy, fw * 0.42, fh * 0.54);
  });
}
function trunkSkin() {   // the unpressurised trunk: solar cells on one half, ribbed white panels on the other
  return canvas(1024, 256, (c, w, h) => {
    c.fillStyle = '#e9eae8'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#c9cac8'; c.lineWidth = 2; for (let x = 0; x < w; x += 8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    c.fillStyle = '#16204a'; c.fillRect(0, h * 0.06, w / 2, h * 0.88);
    c.strokeStyle = '#3a4a8a'; c.lineWidth = 1.5;
    for (let x = 0; x <= w / 2; x += 16) { c.beginPath(); c.moveTo(x, h * 0.06); c.lineTo(x, h * 0.94); c.stroke(); }
    for (let y = h * 0.06; y <= h * 0.94; y += 14) { c.beginPath(); c.moveTo(0, y); c.lineTo(w / 2, y); c.stroke(); }
  });
}
export function buildDragon(noseOpen = true) {
  const g = new THREE.Group();
  // trunk (2.8 m) with four fins round its base
  { const t = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 2.8, 48, 1, true), M(0xffffff, 0.2, 0.55, 0x444444, { map: trunkSkin(), side: THREE.DoubleSide }));
    t.position.y = 1.4; g.add(t); g.add(at(cyl(1.85, 1.85, 0.05, mat.grey, 48), 0, 0.02, 0)); }
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(0.8, 0); fin.lineTo(0.8, 0.3); fin.lineTo(0, 1.6); fin.lineTo(0, 0);
  const finGeo = new THREE.ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: false }); finGeo.translate(0, 0, -0.04);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, f = new THREE.Mesh(finGeo, mat.white); f.position.set(Math.cos(a) * 1.82, 0.05, Math.sin(a) * 1.82); f.rotation.y = -a; g.add(f); }
  // heat-shield rim, then the capsule: one smooth curve from the 4 m base up to the nose
  add(g, at(cyl(1.98, 1.9, 0.28, mat.black, 48), 0, 2.94, 0));
  const prof = [[1.98, 0], [2.0, 0.12], [1.97, 0.4], [1.88, 0.9], [1.72, 1.5], [1.48, 2.05], [1.16, 2.5], [0.92, 2.76]].map(([r, y]) => new THREE.Vector2(r, y));
  const cap = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), M(0xffffff, 0.12, 0.5, 0x4a4a4a, { map: dragonSkin() }));
  cap.position.y = 3.08; g.add(cap);
  add(g, at(cyl(0.7, 0.92, 0.12, mat.black, 48), 0, 5.9, 0));
  add(g, at(cyl(0.55, 0.62, 0.32, mat.grey, 32), 0, 6.1, 0), at(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 32), mat.silver), 0, 6.27, 0, Math.PI / 2, 0, 0));   // docking adapter
  // the nose cone: a smooth dome that swings open on a hinge for docking
  const noseG = new THREE.Group(); noseG.position.set(0, 5.95, 0.9); g.add(noseG);
  const dome = new THREE.Mesh(new THREE.LatheGeometry([[0.92, 0], [0.86, 0.22], [0.68, 0.45], [0.38, 0.6], [0.0, 0.65]].map(([r, y]) => new THREE.Vector2(r, y)), 48), M(0xf4f4f2, 0.12, 0.5, 0x4a4a4a, { side: THREE.DoubleSide }));
  dome.position.z = -0.9; noseG.add(dome);
  if (noseOpen) noseG.rotation.x = 1.75;
  return g;
}

// ---------------------------------------------------------------- Starship on the pad, with the catch tower
export function buildStarship() {
  const g = new THREE.Group();
  add(g, at(cyl(9, 9, 6, mat.grey, 24), 0, 3, 0), at(cyl(5.2, 6, 4, mat.tower, 24), 0, 8, 0));
  const y0 = 10;
  add(g, at(cyl(4.5, 4.5, 71, mat.steel, 40), 0, y0 + 35.5, 0));
  for (let k = 0; k < 3; k++) { const a = k * 2.094; g.add(at(box(0.4, 5, 4, mat.grey), Math.cos(a) * 5.4, y0 + 66, Math.sin(a) * 5.4, 0, -a, 0)); }
  add(g, at(cyl(4.6, 4.6, 2.5, mat.grey, 40), 0, y0 + 72, 0));
  const s0 = y0 + 73.3;
  add(g, at(cyl(4.5, 4.5, 38, mat.steel, 40), 0, s0 + 19, 0));
  { const nose = new THREE.Mesh(new THREE.SphereGeometry(4.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat.steel); nose.scale.y = 3.1; nose.position.y = s0 + 38; g.add(nose); }
  { const tiles = new THREE.Mesh(new THREE.CylinderGeometry(4.53, 4.53, 38, 40, 1, true, Math.PI / 2, Math.PI), M(0x22232a, 0.3, 0.6, 0x1a1b20)); tiles.position.y = s0 + 19; g.add(tiles); }
  for (const [y, h, w] of [[s0 + 4, 9, 4.5], [s0 + 44, 5, 2.5]]) for (const sx of [1, -1]) g.add(at(box(w, h, 0.4, mat.black), sx * (4.5 + w / 2), y, 0));
  const tz = 22; add(g, at(box(9, 145, 9, M(0x6a6e76, 0.5, 0.6, 0x3a3d42)), 0, 72.5, tz));
  for (let y = 5; y < 145; y += 10) g.add(rod(V(4.6, y, tz - 4.6), V(-4.6, y + 10, tz - 4.6), 0.3, mat.tower, 6));
  for (const sx of [1, -1]) add(g, at(box(2, 3, 20, mat.tower), sx * 6, 118, tz - 12, 0, sx * -0.25, 0));
  return g;
}

// ---------------------------------------------------------------- Starlink V2 Mini: a flat body and two big solar wings
let cellTex = null;
const solarCells = () => cellTex || (cellTex = canvas(512, 128, (c, w, h) => {
  c.fillStyle = '#121a3c'; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#3a4c94'; c.lineWidth = 1.5;
  for (let x = 0; x <= w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  for (let y = 0; y <= h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.strokeStyle = '#a89058'; c.lineWidth = 4; for (let x = 0; x <= w; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
}));
export function buildStarlink() {   // wings along X, antennas face Earth (-Y), about 30 m across
  const g = new THREE.Group();
  const cells = M(0xffffff, 0.5, 0.3, 0x2a3a78, { map: solarCells(), side: THREE.DoubleSide });
  add(g, at(box(4.1, 0.32, 2.7, mat.grey), 0, 0, 0));                                           // flat chassis
  add(g, at(box(4.12, 0.04, 2.72, M(0xd8d6cc, 0.6, 0.35, 0x606058)), 0, 0.18, 0));             // sun-side cover
  for (const [x, z] of [[-1.0, -0.65], [1.0, -0.65], [-1.0, 0.65], [1.0, 0.65]]) g.add(at(box(1.7, 0.05, 1.1, M(0xeceae2, 0.2, 0.5, 0x60605a)), x, -0.19, z));   // phased-array antennas
  for (const x of [-1.7, 1.7]) g.add(at(cyl(0.12, 0.16, 0.25, mat.silver, 12), x, -0.3, 1.2));   // laser links to other satellites
  for (const sx of [1, -1]) {
    g.add(rod(V(sx * 2.05, 0, 0), V(sx * 3.2, 0, 0), 0.05, mat.silver));
    const p = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.06, 4.1), cells); p.position.set(sx * 9.4, 0, 0); p.rotation.x = 0.25; g.add(p);
    g.add(at(box(12.4, 0.08, 0.08, mat.silver), sx * 9.4, 0, 2.05 * Math.cos(0.25)));
  }
  return g;
}
