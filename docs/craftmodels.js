// =====================================================================
// Detailed spacecraft models (in metres), redrawn from photos and agency artwork:
// ESA: BepiColombo, Hera (+ cubesats), Juice, Solar Orbiter, Euclid, Gaia, Smile, Ariane 6 on its pad, Philae.
// In flight: Europa Clipper, Psyche, Lucy, Tianwen-2, Aditya-L1, SOHO.
// Same names and axes as the earlier simple models, so the scenes place them the same way.
// =====================================================================
import * as THREE from 'three';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;

// ---------------------------------------------------------------- textures drawn once on canvases
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const tex = (w, h, draw, rep = [1, 1], srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; };
// crinkled thermal blanket (MLI): soft facets and creases over a base colour
function foil(base, light, dark, rep = [1, 1]) {
  return tex(512, 512, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = rnd() * w, y = rnd() * h, r = 20 + rnd() * 70;
      c.fillStyle = rnd() < 0.5 ? light : dark; c.globalAlpha = 0.08 + rnd() * 0.14; c.beginPath();
      c.moveTo(x, y); for (let j = 0; j < 4; j++) c.lineTo(x + (rnd() - 0.5) * r * 2, y + (rnd() - 0.5) * r * 2); c.fill(); }
    c.globalAlpha = 0.35; c.lineWidth = 1.2;
    for (let k = 0; k < 90; k++) { const x = rnd() * w, y = rnd() * h, a = rnd() * PI, l = 20 + rnd() * 80; c.strokeStyle = rnd() < 0.5 ? light : dark;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    c.globalAlpha = 0.22; c.strokeStyle = dark; c.lineWidth = 2;   // blanket seams
    for (let x = 0; x <= w; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y <= h; y += 128) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.globalAlpha = 1;
  }, rep);
}
// solar cells: a grid of cells with thin gaps, bus bars and an outer frame
function cells({ cell = '#1a2560', cell2 = '#24317a', gap = '#8a8f9a', frame = '#c9cdd4', cols = 12, rows = 8, bars = true } = {}, rep = [1, 1]) {
  return tex(512, 512, (c, w, h) => {
    c.fillStyle = gap; c.fillRect(0, 0, w, h);
    const cw = (w - 16) / cols, ch = (h - 16) / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = 8 + i * cw + 1.5, y = 8 + j * ch + 1.5, g = c.createLinearGradient(x, y, x + cw, y + ch);
      g.addColorStop(0, cell); g.addColorStop(0.5 + (rnd() - 0.5) * 0.4, cell2); g.addColorStop(1, cell); c.fillStyle = g; c.fillRect(x, y, cw - 3, ch - 3);
      if (bars) { c.fillStyle = 'rgba(200,205,215,0.35)'; c.fillRect(x, y + (ch - 3) * 0.5, cw - 3, 1); }
    }
    c.strokeStyle = frame; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
  }, rep);
}
// white radiator made of small square mirrors
const tiles = (base = '#e9edf0', line = '#b9c0c6', n = 16) => tex(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); c.strokeStyle = line; c.lineWidth = 1.5;
  for (let k = 0; k <= n; k++) { const p = k / n * w; c.beginPath(); c.moveTo(p, 0); c.lineTo(p, h); c.stroke(); c.beginPath(); c.moveTo(0, p); c.lineTo(w, p); c.stroke(); } });

let _k = null;
const S = (o) => new THREE.MeshStandardMaterial(o);
const K = () => _k || (_k = (() => {
  const k = {};
  k.gold = S({ map: foil('#d9a640', '#ffe48e', '#8a5c14'), color: 0xffffff, metalness: 0.45, roughness: 0.35, emissive: 0x4a3008 });
  k.goldDark = S({ map: foil('#b9842a', '#eebd58', '#644010'), color: 0xffffff, metalness: 0.45, roughness: 0.4, emissive: 0x352206 });
  k.amber = S({ map: foil('#d07a2a', '#f4b464', '#743c10'), color: 0xffffff, metalness: 0.4, roughness: 0.4, emissive: 0x4a2408 });
  k.silver = S({ map: foil('#cfd2d8', '#ffffff', '#858a94'), color: 0xffffff, metalness: 0.4, roughness: 0.32, emissive: 0x3a3d44 });
  k.white = S({ map: foil('#e8e8e4', '#ffffff', '#b8b8b2'), color: 0xffffff, metalness: 0.15, roughness: 0.6, emissive: 0x3c3c3a });
  k.black = S({ map: foil('#1e1f24', '#4a4c56', '#08080a'), color: 0xffffff, metalness: 0.5, roughness: 0.45, emissive: 0x060608 });
  for (const n of ['gold', 'goldDark', 'amber', 'silver', 'white', 'black']) k[n].userData.foil = true;
  k.paint = S({ color: 0xf1f1ee, metalness: 0.05, roughness: 0.55, emissive: 0x454543 });
  k.metal = S({ color: 0xc4c8d0, metalness: 0.5, roughness: 0.35, emissive: 0x2e3036 });
  k.dark = S({ color: 0x2a2c32, metalness: 0.5, roughness: 0.55, emissive: 0x08090b });
  k.grey = S({ color: 0x7c8088, metalness: 0.5, roughness: 0.5, emissive: 0x1c1e22 });
  k.radiator = S({ map: tiles(), color: 0xffffff, metalness: 0.4, roughness: 0.25, emissive: 0x3a3e42 });
  k.mirror = S({ color: 0xdfe6ee, metalness: 1, roughness: 0.06, emissive: 0x30363e });
  k.lens = S({ color: 0x0a0c14, metalness: 0.9, roughness: 0.1, emissive: 0x02030a });
  k.nozzle = S({ color: 0x4a4d55, metalness: 0.85, roughness: 0.35, emissive: 0x101216, side: THREE.DoubleSide });
  k.glow = S({ color: 0x6fb8ff, emissive: 0x3a8cff, emissiveIntensity: 1.6, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
  const P = (o, rep, em = 0x0c1430) => S({ map: cells(o, rep), color: 0xffffff, metalness: 0.45, roughness: 0.3, emissive: em, side: THREE.DoubleSide });
  k.cells = P({});                                                                             // dark blue cells, silver frame
  k.cellsGold = P({ cell: '#1b2350', cell2: '#2b356e', gap: '#6d5a30', frame: '#c9a24a' });       // blue cells, gold frame
  k.cellsBronze = P({ cell: '#7a6248', cell2: '#9a8060', gap: '#c9b48a', frame: '#d8c8a0', cols: 10, rows: 7 }, [1, 1], 0x2a2014);   // Juice: light bronze
  k.cellsGrey = P({ cell: '#8e939c', cell2: '#b4b9c2', gap: '#5c6068', frame: '#d0d4da', cols: 8, rows: 6 }, [1, 1], 0x24262c);       // Psyche, Clipper
  k.cellsViolet = P({ cell: '#3b3470', cell2: '#5a4f9a', gap: '#9a9cb0', frame: '#c8cad8' }, [1, 1], 0x141030);                       // Psyche (other angle), Tianwen-2
  k.cellsDark = P({ cell: '#141826', cell2: '#222a40', gap: '#3a3f4c', frame: '#7d838e', cols: 14, rows: 10 }, [1, 1], 0x06080e);   // Euclid sunshield, Solar Orbiter
  k.cellsBeige = P({ cell: '#8a7e62', cell2: '#a8997a', gap: '#5a5240', frame: '#c8bb98', cols: 6, rows: 6 }, [1, 1], 0x221e14);     // SOHO
  k.cellsCopper = P({ cell: '#5a3420', cell2: '#8a5634', gap: '#c99a5a', frame: '#d9b070', cols: 10, rows: 8 }, [1, 1], 0x24120a);   // BepiColombo MPO: high-temperature cells and mirrors
  k.cellsBack = S({ color: 0x5d636c, metalness: 0.5, roughness: 0.5, emissive: 0x15171a, side: THREE.DoubleSide });
  return k;
})());

// ---------------------------------------------------------------- shapes
// blankets keep the same crinkle size on big and small parts: stretch the texture coordinates by the part's size
const TILE = 1.4, isFoil = m => !Array.isArray(m) && m?.userData?.foil;
function box(x, y, z, m) { const geo = new THREE.BoxGeometry(x, y, z);
  if (isFoil(m)) { const uv = geo.attributes.uv, dims = [[z, y], [z, y], [x, z], [x, z], [x, y], [x, y]];
    for (let f = 0; f < 6; f++) for (let j = 0; j < 4; j++) { const i = f * 4 + j; uv.setXY(i, uv.getX(i) * Math.max(1, dims[f][0] / TILE), uv.getY(i) * Math.max(1, dims[f][1] / TILE)); } }
  return new THREE.Mesh(geo, m); }
function cyl(r1, r2, h, m, n = 32, open = false) { const geo = new THREE.CylinderGeometry(r1, r2, h, n, 1, open);
  if (isFoil(m)) { const uv = geo.attributes.uv, su = Math.max(1, Math.round(2 * PI * Math.max(r1, r2) / TILE)), sv = Math.max(1, h / TILE), side = (n + 1) * 2;
    for (let i = 0; i < side; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); }
  return new THREE.Mesh(geo, m); }
const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const add = (g, ...o) => { for (const k of o) g.add(k); return g; };
const rod = (p, q, r, m, n = 8) => { const d = q.clone().sub(p), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), n), m);
  o.position.copy(p).add(q).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; };
const lathe = (pts, m, n = 40) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), n), m);
// a parabolic dish facing +Y with a rim, back ribs and a feed on three struts
function dish(r, depth, m = K().paint, feed = true) {
  const g = new THREE.Group(), pts = []; for (let k = 0; k <= 16; k++) { const t = k / 16; pts.push([r * t, depth * t * t]); }
  const d = lathe(pts, m.clone()); d.material.side = THREE.DoubleSide; g.add(d);
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.025, 6, 48), K().metal), 0, depth, 0, PI / 2, 0, 0));
  if (feed) { const f = V(0, depth + r * 0.55, 0); g.add(at(cyl(r * 0.09, r * 0.05, r * 0.14, K().paint, 16), f.x, f.y, f.z));
    for (let j = 0; j < 3; j++) { const a = j * 2.094; g.add(rod(V(Math.cos(a) * r * 0.85, depth * 0.72, Math.sin(a) * r * 0.85), f, r * 0.012, K().metal, 5)); } }
  return g;
}
// a flat solar panel in the XZ plane (cells on both faces), centred on the origin
const panel = (w, d, m = K().cells, t = 0.04) => { const p = box(w, t, d, [K().metal, K().metal, m, K().cellsBack, K().metal, K().metal]); return p; };
// a wing along +X: a yoke, then n panels, hinge bars between them
function wing(n, w, d, m = K().cells, { yoke = 0.9, gap = 0.08, t = 0.04 } = {}) {
  const g = new THREE.Group(), k = K();
  g.add(rod(V(0, 0, 0), V(yoke, 0, d * 0.3), 0.04, k.metal), rod(V(0, 0, 0), V(yoke, 0, -d * 0.3), 0.04, k.metal));
  for (let i = 0; i < n; i++) { const x = yoke + w / 2 + i * (w + gap); g.add(at(panel(w, d, m, t), x, 0, 0));
    if (i) g.add(at(box(gap, t * 0.8, d * 0.9, k.metal), x - w / 2 - gap / 2, 0, 0)); }
  return g;
}
// a rocket-engine bell along -Y from the origin
const bell = (r0, r1, h, m = K().nozzle) => lathe([[r0, 0], [r0 * 1.05, -h * 0.15], [r1 * 0.75, -h * 0.6], [r1, -h]], m, 32);
// a truss boom from p to q with little cross pieces
function truss(p, q, r, m = K().metal) { const g = new THREE.Group(); g.add(rod(p, q, r, m, 6)); return g; }
// a star tracker: a short black baffle
const tracker = (r = 0.08) => { const g = new THREE.Group(); g.add(cyl(r, r * 1.3, r * 2.5, K().black, 12), at(cyl(r * 0.8, r * 0.8, 0.01, K().lens, 12), 0, r * 1.26, 0)); return g; };
// a box wrapped in blanket, with blanket seams following its size
const foilBox = (x, y, z, m) => { const b = box(x, y, z, m); return b; };
// an octagonal or round drum
const drum = (r, h, m, n = 8) => cyl(r, r, h, m, n);

// =====================================================================
// BepiColombo, the cruise stack as in ESA's art: MTM at the bottom (+ two long wings), MPO, MOSIF sunshade, Mio inside
// stack axis +Y, MTM wings along ±X
// =====================================================================
export function buildBepi() {
  const k = K(), g = new THREE.Group();
  // Mercury Transfer Module: box with a white shield, four ion thrusters underneath (glowing)
  add(g, at(box(3.6, 2.2, 3.4, k.white), 0, 1.1, 0), at(box(3.62, 0.25, 3.42, k.metal), 0, 2.25, 0));
  add(g, at(box(0.03, 1.6, 2.6, k.radiator), 1.82, 1.1, 0), at(box(0.03, 1.6, 2.6, k.radiator), -1.82, 1.1, 0));
  for (const [x, z] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) {
    add(g, at(cyl(0.32, 0.36, 0.25, k.dark, 24), x, -0.1, z), at(cyl(0.3, 0.3, 0.02, k.metal, 24), x, -0.24, z));
    const plume = lathe([[0.27, 0], [0.33, -0.3], [0.42, -0.9], [0.46, -1.5], [0.38, -2.1], [0.2, -2.5], [0.0, -2.7]], k.glow, 24); plume.position.set(x, -0.25, z); g.add(plume);
  }
  for (const sx of [1, -1]) {   // two 14 m wings of five panels, rotated a little toward the Sun
    const w = wing(5, 2.55, 2.2, k.cellsGold, { yoke: 1.1, gap: 0.12 }); w.position.set(sx * 1.8, 1.1, 0); w.rotation.set(0.35, sx > 0 ? 0 : PI, 0); g.add(w);
  }
  // Mercury Planetary Orbiter: silver blanket box, big radiator with fins, one three-panel wing, steerable dish on a mast
  add(g, at(box(2.4, 1.8, 2.2, k.silver), 0, 3.3, 0), at(box(0.04, 1.7, 2.1, k.radiator), -1.22, 3.3, 0));
  for (let j = 0; j < 7; j++) g.add(at(box(0.5, 0.02, 2.0, k.metal), -1.47, 2.55 + j * 0.25, 0));
  { const w = wing(3, 2.4, 1.9, k.cellsCopper, { yoke: 0.7 }); w.position.set(1.2, 3.6, 0.6); w.rotation.set(1.1, 0, 0.55); g.add(w);   // the MPO wing, tilted up as in the art
    for (let i = 0; i < 3; i++) { const sh = at(box(2.4, 0.02, 0.35, k.mirror), 0.7 + 1.2 + i * 2.48, 0.03, 0.95); w.add(sh); } }    // optical solar reflector strips
  { const mast = rod(V(0.5, 4.2, -0.8), V(0.5, 5.2, -1.6), 0.05, k.metal); const d = dish(0.5, 0.16); d.position.set(0.5, 5.25, -1.65); d.rotation.set(-0.9, 0, 0.3); g.add(mast, d); }
  g.add(rod(V(-0.9, 4.1, 0.6), V(-3.6, 4.6, 0.6), 0.03, k.metal), at(box(0.18, 0.18, 0.18, k.white), -3.6, 4.6, 0.6));   // magnetometer boom
  // MOSIF: the white cone sunshade over Mio (octagonal)
  add(g, at(cyl(1.1, 1.75, 1.9, k.white, 8), 0, 5.2, 0), at(cyl(1.12, 1.12, 0.06, k.metal, 8), 0, 6.15, 0), at(cyl(1.78, 1.78, 0.08, k.metal, 8), 0, 4.25, 0));
  add(g, at(cyl(0.9, 0.9, 0.25, k.dark, 8), 0, 6.3, 0), at(cyl(0.25, 0.25, 0.35, k.metal, 16), 0, 6.55, 0));   // top of Mio peeking out
  return g;
}

// =====================================================================
// Hera: gold box, two long wings (±X), a white dish on the front (+Z), camera and the two cubesats it carries
// =====================================================================
export function buildHera() {
  const k = K(), g = new THREE.Group();
  add(g, at(box(1.6, 1.7, 1.6, k.gold), 0, 0, 0), at(box(1.64, 0.12, 1.64, k.metal), 0, 0.88, 0), at(box(1.64, 0.12, 1.64, k.metal), 0, -0.88, 0));
  add(g, at(box(0.02, 1.2, 1.2, k.radiator), 0.81, 0, 0), at(box(0.02, 1.2, 1.2, k.radiator), -0.81, 0, 0));
  for (const sx of [1, -1]) { const w = wing(4, 1.15, 1.05, k.cells, { yoke: 0.35, gap: 0.06 }); w.position.set(sx * 0.82, 0.1, 0); w.rotation.y = sx > 0 ? 0 : PI; g.add(w); }
  { const d = dish(0.56, 0.18); d.position.set(0, 0.1, 0.82); d.rotation.x = PI / 2; g.add(d); }                 // 1.13 m high-gain antenna
  add(g, at(box(0.32, 0.32, 0.3, k.black), 0.5, 0.55, 0.85), at(cyl(0.1, 0.1, 0.2, k.dark, 16), 0.5, 0.55, 1.05, PI / 2, 0, 0), at(cyl(0.08, 0.08, 0.01, k.lens, 16), 0.5, 0.55, 1.15, PI / 2, 0, 0));   // Asteroid Framing Camera
  for (const [x, y] of [[-0.55, 0.55], [0.55, -0.55]]) g.add(at(tracker(0.07), x, y, 0.85, PI / 2, 0, 0));
  add(g, at(cyl(0.16, 0.16, 0.06, k.metal, 16), 0, -0.95, 0), at(bell(0.08, 0.14, 0.3), 0, -0.98, 0));
  for (const sz of [1, -1]) g.add(at(box(0.36, 0.24, 0.12, k.silver), -0.4, -0.5, sz * 0.86));   // the two cubesat dispensers
  return g;
}
export function buildCubesat() {   // Milani / Juventas: a 6U cubesat with two small wings
  const k = K(), g = new THREE.Group();
  add(g, at(box(0.22, 0.34, 0.11, k.metal), 0, 0, 0), at(box(0.2, 0.32, 0.005, k.cells), 0, 0, 0.056));
  for (const sx of [1, -1]) g.add(at(panel(0.34, 0.2, k.cells, 0.01), sx * 0.29, 0, 0));
  return g;
}

// =====================================================================
// Juice: silver box, 2.5 m dish on top (+Y), two wings (±X) of five light bronze panels each in a cross, long booms
// =====================================================================
export function buildJuice() {
  const k = K(), g = new THREE.Group();
  add(g, at(box(2.4, 2.2, 2.6, k.silver), 0, 0, 0), at(box(2.44, 0.14, 2.64, k.metal), 0, 1.12, 0), at(box(2.44, 0.14, 2.64, k.metal), 0, -1.12, 0));
  add(g, at(box(0.03, 1.8, 2.2, k.radiator), 1.21, 0, 0), at(box(2.0, 1.8, 0.03, k.white), 0, 0, 1.31));
  for (let j = 0; j < 4; j++) g.add(at(box(0.3, 0.3, 0.12, k.black), -0.8 + j * 0.5, 0.6, 1.36));   // remote-sensing instruments on the nadir face
  g.add(at(cyl(0.35, 0.35, 0.2, k.gold, 16), 0.5, -0.4, 1.38, PI / 2, 0, 0));
  { const d = dish(1.27, 0.38); d.position.y = 1.2; g.add(d); g.add(at(dish(0.3, 0.08, k.paint, false), 0.95, 1.25, 0.9)); }   // HGA and MGA
  add(g, at(cyl(0.5, 0.6, 0.2, k.metal, 24), 0, -1.25, 0), at(bell(0.12, 0.35, 0.6), 0, -1.35, 0));
  for (const sx of [1, -1]) {   // each wing: 2 panels in line, then a cross of 3 (the outer panel flanked above and below)
    const w = new THREE.Group(); w.position.set(sx * 1.2, 0, 0); w.rotation.y = sx > 0 ? 0 : PI; g.add(w);
    w.add(rod(V(0, 0, 0), V(0.8, 0, 0), 0.06, k.metal));
    for (let j = 0; j < 3; j++) w.add(at(panel(2.5, 3.4, k.cellsBronze, 0.05), 2.1 + j * 2.6, 0, 0));
    for (const sz of [1, -1]) w.add(at(panel(2.5, 2.6, k.cellsBronze, 0.05), 4.7, 0, sz * 3.05));
  }
  g.add(rod(V(0, -0.3, -1.3), V(0, -0.3, -11.8), 0.04, k.metal)); g.add(at(box(0.3, 0.3, 0.3, k.white), 0, -0.3, -11.8), at(box(0.2, 0.2, 0.2, k.white), 0, -0.3, -7.5));   // magnetometer boom
  g.add(rod(V(-1.1, 0.8, 1.3), V(-1.1, 0.8, 9.0), 0.03, k.goldDark), rod(V(1.1, 0.8, 1.3), V(1.1, 0.8, 9.0), 0.03, k.goldDark));   // RIME radar antenna
  for (const [x, z] of [[1.0, -1.0], [-1.0, -1.0], [0, 1.0]]) g.add(rod(V(x * 1.1, 1.0, z * 1.2), V(x * 3, 2.2, z * 3), 0.015, k.metal));  // RPWI probes
  return g;
}

// =====================================================================
// Solar Orbiter: black heat shield in front (+X), dark-gold bus, two wings of three dark panels (±Z), boom and antennas
// =====================================================================
export function buildSolarOrbiter() {
  const k = K(), g = new THREE.Group();
  add(g, at(box(1.6, 2.4, 2.1, k.goldDark), -1.0, 0, 0), at(box(1.64, 0.12, 2.14, k.metal), -1.0, 1.24, 0));
  add(g, at(box(1.4, 0.02, 1.8, k.radiator), -1.0, -1.21, 0));
  // heat shield: a 3.1 × 2.4 m titanium sandwich, black front, with feedthrough doors for the telescopes
  add(g, at(box(0.32, 3.1, 2.4, k.black), 0.5, 0, 0), at(box(0.02, 3.0, 2.3, S({ color: 0x1c1a18, metalness: 0.2, roughness: 0.9, emissive: 0x050404 })), 0.67, 0, 0));
  for (let j = 0; j < 6; j++) g.add(rod(V(0.33, -1.4 + j * 0.56, 1.1), V(-0.2, -1.2 + j * 0.48, 1.0), 0.02, k.metal), rod(V(0.33, -1.4 + j * 0.56, -1.1), V(-0.2, -1.2 + j * 0.48, -1.0), 0.02, k.metal));
  for (const [y, z, r] of [[0.7, 0.45, 0.13], [-0.55, -0.5, 0.1], [0.1, -0.25, 0.08], [-0.9, 0.6, 0.09], [0.95, -0.7, 0.07]]) g.add(at(cyl(r, r, 0.04, k.gold, 16), 0.69, y, z, 0, 0, PI / 2));
  for (const sz of [1, -1]) { const w = new THREE.Group(); w.position.set(-1.0, 0, sz * 1.06); w.rotation.set(0, 0, 0.45); g.add(w);
    w.add(rod(V(0, 0, 0), V(0, 0, sz * 0.7), 0.05, k.metal));
    for (let j = 0; j < 3; j++) w.add(at(panel(1.2, 2.1, k.cellsDark, 0.04), 0, 0, sz * (1.8 + j * 2.15), 0, 0, PI / 2)); }
  g.add(rod(V(-1.8, 0.6, 0), V(-6.2, 0.6, 0), 0.04, k.metal)); add(g, at(box(0.25, 0.25, 0.25, k.white), -6.2, 0.6, 0), at(box(0.18, 0.18, 0.18, k.white), -4.6, 0.6, 0));   // instrument boom
  for (const a of [0, 2.1, 4.2]) g.add(rod(V(-1.0, 0, 0), V(-1.0 + 0.0, Math.cos(a) * 6.5, Math.sin(a) * 6.5), 0.012, k.metal));   // three RPW antennas
  { const d = dish(0.55, 0.18); d.position.set(-1.0, 1.55, 0.7); d.rotation.set(0.3, 0, 0.6); g.add(d, rod(V(-1.0, 1.2, 0.5), V(-1.0, 1.5, 0.68), 0.04, k.metal)); }
  return g;
}

// =====================================================================
// Euclid: gold service module (+ underside), silver telescope, tall sunshield covered in dark solar cells on +X
// =====================================================================
export function buildEuclid() {
  const k = K(), g = new THREE.Group();
  add(g, at(cyl(1.55, 1.55, 1.0, k.gold, 6), 0, 0.5, 0), at(cyl(1.57, 1.57, 0.06, k.metal, 6), 0, 1.0, 0), at(cyl(1.3, 1.3, 0.04, k.goldDark, 6), 0, -0.02, 0));
  add(g, at(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 8, 32), k.metal), 0, -0.05, 0, PI / 2, 0, 0), at(cyl(0.45, 0.45, 0.06, k.dark, 24), 0, -0.05, 0));   // launcher interface ring
  for (const [x, z] of [[1.0, 0.9], [-1.1, 0.6], [0.2, -1.3]]) g.add(at(cyl(0.2, 0.2, 0.25, k.white, 16), x, -0.12, z));   // thruster pods
  // payload module: silver-white telescope baffle and focal-plane boxes
  add(g, at(cyl(0.9, 0.9, 2.7, k.silver, 24), -0.25, 2.4, 0.15), at(cyl(0.92, 0.92, 0.08, k.metal, 24), -0.25, 3.78, 0.15), at(cyl(0.75, 0.75, 0.02, k.mirror, 24), -0.25, 3.78, 0.15));
  add(g, at(box(1.2, 0.9, 0.8, k.white), -0.55, 1.5, -0.85), at(box(0.8, 0.7, 0.6, k.silver), 0.2, 1.4, -1.1));
  // the sunshield: a tall slightly bent wall of solar cells with a metal edge frame
  { const sh = new THREE.Group(); sh.position.set(1.0, 2.0, 0); sh.rotation.z = 0.1; g.add(sh);
    sh.add(at(box(0.08, 3.7, 3.2, [k.cellsDark, k.metal, k.metal, k.metal, k.metal, k.metal]), 0, 0, 0));
    for (const z of [-1.62, 1.62]) sh.add(at(box(0.12, 3.75, 0.05, k.metal), -0.02, 0, z));
    for (let j = 0; j < 4; j++) sh.add(rod(V(-0.05, -1.5 + j * 1.0, 1.4), V(-0.8, -1.2 + j * 0.9, 1.0), 0.025, k.metal)); }
  add(g, at(dish(0.35, 0.1), 0.3, -0.25, 1.1, PI, 0, 0));   // K-band antenna under the service module
  return g;
}

// =====================================================================
// Gaia: 10 m sunshield skirt (12 silver panels with gold tips and spokes), black and silver tent on top
// =====================================================================
export function buildGaia() {
  const k = K(), g = new THREE.Group();
  { const top = S({ map: foil('#b9bcc0', '#f4f5f6', '#6d7076'), color: 0xffffff, metalness: 0.75, roughness: 0.35, emissive: 0x2a2c30, side: THREE.DoubleSide });
    const skirt = new THREE.Mesh(new THREE.CircleGeometry(5.0, 12), top); skirt.rotation.x = -PI / 2; g.add(skirt);
    const under = new THREE.Mesh(new THREE.CircleGeometry(4.98, 12), k.cellsDark); under.rotation.x = PI / 2; under.position.y = -0.03; g.add(under);
    for (let j = 0; j < 12; j++) { const a = j / 12 * PI * 2, b = a + PI / 12;
      g.add(rod(V(0, 0.04, 0), V(Math.cos(a) * 4.98, 0.04, Math.sin(a) * 4.98), 0.035, k.metal));
      const tip = new THREE.Mesh(new THREE.CircleGeometry(0.7, 3), k.gold); tip.rotation.set(-PI / 2, 0, b); tip.position.set(Math.cos(b) * 4.35, 0.05, Math.sin(b) * 4.35); g.add(tip); }
    g.add(at(new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.04, 6, 12), k.gold), 0, 0, 0, PI / 2, 0, PI / 12)); }
  // service module (gold, under the tent) and the tent itself: a black thermal tent held by a silver frame
  add(g, at(cyl(1.75, 1.75, 0.9, k.gold, 12), 0, 0.45, 0));
  add(g, at(cyl(1.85, 1.85, 2.3, k.black, 12), 0, 2.05, 0), at(cyl(1.88, 1.88, 0.08, k.metal, 12), 0, 3.2, 0), at(cyl(1.88, 1.88, 0.08, k.metal, 12), 0, 0.92, 0));
  for (let j = 0; j < 12; j++) { const a = j / 12 * PI * 2; g.add(rod(V(Math.cos(a) * 1.88, 0.9, Math.sin(a) * 1.88), V(Math.cos(a) * 1.88, 3.2, Math.sin(a) * 1.88), 0.03, k.metal)); }
  for (const a of [0.3, 2.4, 4.4]) g.add(at(box(0.9, 0.7, 0.04, k.silver), Math.cos(a) * 1.9, 2.0, Math.sin(a) * 1.9, 0, -a + PI / 2, 0));   // silver panels on the tent
  add(g, at(cyl(1.3, 1.3, 0.05, k.dark, 24), 0, 3.25, 0));
  return g;
}

// =====================================================================
// Smile: gold drum body, orange-brown lower box, two 3-panel wings (±X), magnetometer boom, X-ray imager and UV camera
// =====================================================================
export function buildSmile() {
  const k = K(), g = new THREE.Group();
  add(g, at(drum(1.0, 1.4, k.gold, 12), 0, 0.3, 0), at(cyl(1.02, 1.02, 0.06, k.metal, 12), 0, 1.0, 0), at(cyl(1.02, 1.02, 0.06, k.metal, 12), 0, -0.4, 0));
  add(g, at(box(1.3, 0.9, 1.3, k.amber), 0, -0.9, 0), at(cyl(0.45, 0.6, 0.25, k.metal, 24), 0, -1.45, 0));   // propulsion module (orange blanket)
  add(g, at(box(0.5, 0.45, 1.1, k.white), 0.25, 1.35, 0.55), at(box(0.42, 0.37, 0.02, k.lens), 0.25, 1.35, 1.11));   // Soft X-ray Imager
  add(g, at(cyl(0.18, 0.18, 0.45, k.black, 20), -0.45, 1.3, 0.45, 0.5, 0, 0), at(box(0.25, 0.2, 0.25, k.silver), -0.35, 1.15, -0.4));   // UV imager, ion analyser
  add(g, at(box(0.02, 0.4, 0.5, k.white), 0.0, 0.3, 1.0));   // the white label patch seen in ESA's pictures
  for (const sx of [1, -1]) { const w = wing(3, 1.25, 1.0, k.cells, { yoke: 0.45, gap: 0.05 }); w.position.set(sx * 0.98, 0.3, 0); w.rotation.y = sx > 0 ? 0 : PI; g.add(w); }
  g.add(rod(V(0.4, 1.0, -0.7), V(2.6, 3.6, -1.8), 0.025, k.metal), at(box(0.12, 0.12, 0.12, k.white), 2.6, 3.6, -1.8));   // 3 m magnetometer boom
  return g;
}

// =====================================================================
// Ariane 64 on the ELA-4 pad at Kourou: the rocket, the rolled-back mobile gantry, four lightning masts, the flame trench
// =====================================================================
export function buildAriane6() {
  const k = K(), g = new THREE.Group();
  const body = S({ color: 0xf4f4f1, metalness: 0.1, roughness: 0.5, emissive: 0x666664 }), concrete = S({ color: 0x9a9b98, metalness: 0.05, roughness: 0.95, emissive: 0x2a2a28 });
  const steel = S({ color: 0x8a8e94, metalness: 0.7, roughness: 0.45, emissive: 0x24262a }), cladding = S({ color: 0xd7d9db, metalness: 0.35, roughness: 0.6, emissive: 0x3a3b3c });
  add(g, at(box(90, 2, 70, concrete), 0, 1, 0), at(box(18, 7, 18, concrete), 0, 5.5, 0), at(box(14, 1, 70, S({ color: 0x3c3d3e, roughness: 1, emissive: 0x0c0c0c })), 0, 2.05, 0));   // pad, launch table, flame trench
  const y0 = 9;
  add(g, at(cyl(2.7, 2.7, 30, body, 48), 0, y0 + 15, 0), at(cyl(2.72, 2.72, 3, k.dark, 48), 0, y0 + 31.5, 0));   // core stage, interstage
  add(g, at(cyl(2.7, 2.7, 9, body, 48), 0, y0 + 37.5, 0));                                                        // upper stage
  add(g, at(cyl(2.7, 2.7, 13, body, 48), 0, y0 + 48.5, 0));                                                       // long fairing
  { const nose = lathe([[2.7, 0], [2.6, 2.5], [2.2, 5.0], [1.4, 7.2], [0.5, 8.4], [0, 8.7]], body, 48); nose.position.y = y0 + 55; g.add(nose); }
  for (let j = 0; j < 4; j++) { const a = j * PI / 2 + PI / 4, x = Math.cos(a) * 4.45, z = Math.sin(a) * 4.45;   // four P120C boosters
    add(g, at(cyl(1.7, 1.7, 13.5, body, 32), x, y0 + 6.75, z), at(lathe([[1.7, 0], [1.4, 1.6], [0.7, 3.0], [0, 3.4]], body, 32), x, y0 + 13.5, z), at(bell(0.9, 1.25, 1.6), x, y0, z));
    g.add(rod(V(x * 0.7, y0 + 12, z * 0.7), V(x * 0.95, y0 + 12, z * 0.95), 0.2, steel)); }
  g.add(at(bell(1.0, 1.35, 2.2), 0, y0, 0));
  // markings: ESA and Ariane 6 lettering, CNES/ArianeGroup style blue band
  { const mk = (txt, h, color = '#1b3f91') => tex(256, 1024, (c, w, H) => { c.fillStyle = '#f4f4f1'; c.fillRect(0, 0, w, H); c.save(); c.translate(w / 2, H / 2); c.rotate(-PI / 2);
      c.fillStyle = color; c.font = `bold ${h}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 0); c.restore(); });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(2.705, 2.705, 16, 48, 1, true, -0.45, 0.9), S({ map: mk('ariane 6', 140), metalness: 0.1, roughness: 0.5, emissive: 0x555553, emissiveMap: null })); p1.position.y = y0 + 18; g.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(2.705, 2.705, 9, 48, 1, true, -0.45, 0.9), S({ map: mk('esa', 150, '#003247'), metalness: 0.1, roughness: 0.5, emissive: 0x555553 })); p2.position.y = y0 + 48; g.add(p2); }
  // mobile gantry, rolled back on its rails: a 90 m tall box building with a darker door side
  const gx = -34, gz = -8;
  add(g, at(box(26, 90, 30, cladding), gx, 47, gz), at(box(26.2, 6, 30.2, steel), gx, 92, gz), at(box(0.3, 70, 18, S({ color: 0x6d7175, metalness: 0.5, roughness: 0.6, emissive: 0x1a1b1c })), gx + 13.1, 40, gz));
  for (let j = 0; j < 12; j++) g.add(at(box(26.3, 0.4, 30.3, steel), gx, 8 + j * 7, gz));
  for (const z of [-20, 4]) g.add(at(box(4, 0.8, 70, steel), gx + (z > 0 ? 6 : -6), 2.4, 0));   // rails
  // four lattice lightning masts round the pad
  for (const [x, z] of [[-26, -26], [26, -26], [-26, 26], [26, 26]]) {
    const m = new THREE.Group(); m.position.set(x, 2, z); g.add(m); const H = 100;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) m.add(rod(V(a * 1.6, 0, b * 1.6), V(a * 0.35, H, b * 0.35), 0.18, steel, 4));
    for (let j = 0; j < 14; j++) { const y = j * H / 14, s = 1.6 - (1.25 * j / 14); m.add(at(box(s * 2, 0.15, 0.15, steel), 0, y, s), at(box(s * 2, 0.15, 0.15, steel), 0, y, -s), at(box(0.15, 0.15, s * 2, steel), s, y, 0), at(box(0.15, 0.15, s * 2, steel), -s, y, 0)); }
    m.add(at(cyl(0.12, 0.12, 12, steel, 6), 0, H + 6, 0)); }
  return g;
}

// =====================================================================
// Rosetta (kept for older scenes; the site now uses NASA's own model) and Philae
// =====================================================================
export function buildRosetta() {   // wings along X (32 m tip to tip), dish on +Z
  const k = K(), g = new THREE.Group();
  add(g, at(box(2.8, 2.0, 2.1, k.goldDark), 0, 0, 0), at(box(2.84, 0.15, 2.14, k.metal), 0, 1.05, 0));
  for (const sx of [1, -1]) { const w = wing(5, 2.25, 2.3, k.cells, { yoke: 0.7, gap: 0.1 }); w.position.set(sx * 1.4, 0, 0); w.rotation.y = sx > 0 ? 0 : PI; g.add(w); }
  { const d = dish(1.1, 0.32); d.position.set(0, 0, 1.15); d.rotation.x = PI / 2; g.add(d); }
  return g;
}
export function buildPhilae() {   // about 1 m: a polygonal box covered in solar cells on gold, three splayed legs, the drill and harpoon tubes
  const k = K(), g = new THREE.Group();
  const top = at(cyl(0.55, 0.62, 0.8, [k.cells, k.cells, k.gold], 6), 0, 0.95, 0); g.add(top);
  add(g, at(cyl(0.64, 0.64, 0.06, k.metal, 6), 0, 0.53, 0), at(cyl(0.12, 0.12, 0.5, k.metal, 12), 0.25, 0.4, 0.2), at(cyl(0.06, 0.06, 0.35, k.dark, 12), -0.25, 0.4, -0.1));
  for (let j = 0; j < 3; j++) { const a = j * 2.094; g.add(rod(V(Math.cos(a) * 0.3, 0.55, Math.sin(a) * 0.3), V(Math.cos(a) * 0.95, 0.02, Math.sin(a) * 0.95), 0.035, k.metal));
    g.add(at(cyl(0.14, 0.14, 0.04, k.metal, 12), Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95)); }
  g.add(rod(V(0, 1.35, 0.3), V(0.1, 1.9, 0.5), 0.015, k.metal), rod(V(0, 1.35, -0.3), V(-0.1, 1.85, -0.5), 0.015, k.metal));   // antennas
  return g;
}

// =====================================================================
// Europa Clipper: tall body with a 3 m dish on top (+Y), two huge 5-panel wings (±X), magnetometer boom, radar antennas
// =====================================================================
export function buildClipper() {
  const k = K(), g = new THREE.Group();
  add(g, at(cyl(0.75, 0.75, 3.0, k.silver, 24), 0, 0, 0), at(cyl(1.2, 1.2, 0.6, k.metal, 12), 0, -1.3, 0));   // propulsion module and electronics vault
  add(g, at(box(1.8, 1.4, 1.8, k.white), 0, 1.0, 0), at(box(1.84, 0.08, 1.84, k.metal), 0, 1.72, 0), at(box(1.6, 1.2, 0.02, k.radiator), 0, 1.0, 0.91));
  add(g, at(box(0.5, 0.4, 0.6, k.black), 0.6, 0.4, 0.95), at(box(0.4, 0.4, 0.4, k.gold), -0.6, 0.35, 0.95), at(cyl(0.12, 0.12, 0.3, k.dark, 16), 0.1, 0.2, 1.05, PI / 2, 0, 0));   // instruments
  { const d = dish(1.5, 0.45); d.position.y = 1.8; g.add(d); }
  add(g, at(bell(0.15, 0.32, 0.6), 0, -1.6, 0));
  for (const sx of [1, -1]) {   // 30.5 m tip to tip: each wing five big panels in a row (2 × 2.5 m wide strips)
    const w = wing(5, 2.05, 4.1, k.cellsGrey, { yoke: 1.4, gap: 0.08 }); w.position.set(sx * 0.8, -0.5, 0); w.rotation.y = sx > 0 ? 0 : PI; g.add(w); }
  g.add(rod(V(0, -1.2, -0.8), V(0, -1.6, -9.3), 0.035, k.metal), at(box(0.18, 0.18, 0.18, k.white), 0, -1.6, -9.3));   // 8.5 m magnetometer boom
  for (const sx of [1, -1]) for (const sz of [1, -1]) g.add(rod(V(sx * 3.2, -0.45, sz * 0.4), V(sx * 3.3, -0.45, sz * 8.8), 0.02, k.white));   // REASON radar antennas along the wings
  return g;
}

// =====================================================================
// Psyche: box body, 2 m dish (+Y), two cross-shaped wings of five panels (±X), the gold DSOC laser telescope, Hall thrusters
// =====================================================================
export function buildPsyche() {
  const k = K(), g = new THREE.Group();
  add(g, at(box(2.2, 2.4, 2.2, k.black), 0, 0, 0), at(box(2.24, 0.1, 2.24, k.metal), 0, 1.22, 0), at(box(0.02, 1.9, 1.9, k.radiator), 1.11, 0, 0), at(box(0.02, 1.9, 1.9, k.radiator), -1.11, 0, 0));
  for (let j = 0; j < 4; j++) g.add(at(box(1.8, 0.03, 0.04, k.metal), 0, -0.8 + j * 0.55, 1.11));
  { const d = dish(1.0, 0.3); d.position.set(0, 1.3, 0.2); d.rotation.x = -0.25; g.add(d); }
  add(g, at(cyl(0.25, 0.25, 0.9, k.gold, 20), -0.6, 1.4, -0.6, 0.4, 0, 0), at(cyl(0.2, 0.2, 0.02, k.lens, 20), -0.6, 1.83, -0.43, 0.4, 0, 0));   // DSOC
  add(g, at(box(0.4, 0.4, 0.6, k.silver), 0.7, 1.4, -0.7), at(cyl(0.18, 0.18, 0.3, k.white, 16), 0.7, 1.4, -1.1, PI / 2, 0, 0));   // imagers, spectrometer
  for (const [x, z] of [[0.5, 0.5], [-0.5, -0.5]]) add(g, at(cyl(0.22, 0.22, 0.1, k.metal, 20), x, -1.26, z), at(cyl(0.12, 0.12, 0.02, k.glow, 20), x, -1.33, z));   // SPT-140 Hall thrusters
  g.add(rod(V(0, -1.0, -1.1), V(0, -1.0, -3.2), 0.03, k.metal), at(box(0.15, 0.15, 0.15, k.white), 0, -1.0, -3.2));   // magnetometer boom
  for (const sx of [1, -1]) {   // each wing: a cross of five panels — three in line, and one above and one below the middle
    const w = new THREE.Group(); w.position.set(sx * 1.1, 0, 0); w.rotation.y = sx > 0 ? 0 : PI; g.add(w);
    w.add(rod(V(0, 0, 0), V(0.9, 0, 0), 0.05, k.metal));
    for (let j = 0; j < 3; j++) w.add(at(panel(2.4, 2.4, k.cellsGrey, 0.05), 2.1 + j * 2.48, 0, 0));
    for (const sz of [1, -1]) w.add(at(panel(2.4, 2.4, k.cellsGrey, 0.05), 4.58, 0, sz * 2.48));
  }
  return g;
}

// =====================================================================
// Lucy: a silver-white body, 2 m dish (+Z), two 7.3 m round UltraFlex arrays (±X) — orange gores with gold ribs, as in NASA's art
// =====================================================================
function ultraflex(r, look) {   // a 10-sided folding fan array facing ±Z
  const k = K(), g = new THREE.Group();
  const T = look === 'orange'
    ? tex(512, 512, (c, w, h) => { c.fillStyle = '#c76d12'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffcc55'; c.lineWidth = 1.5;
        for (let x = 0; x < w; x += 18) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 18) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } })
    : tex(512, 512, (c, w, h) => { c.fillStyle = '#3a3a8a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#8c8fd8'; c.lineWidth = 1.2;
        for (let x = 0; x < w; x += 14) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 14) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
  const face = new THREE.Mesh(new THREE.CircleGeometry(r, 10), S({ map: T, color: 0xffffff, metalness: 0.4, roughness: 0.35, emissive: look === 'orange' ? 0x3a1a02 : 0x0c0c30, side: THREE.DoubleSide }));
  g.add(face);
  const ribM = look === 'orange' ? S({ color: 0xffc23a, metalness: 0.8, roughness: 0.3, emissive: 0x4a3008 }) : k.paint;
  for (let j = 0; j < 10; j++) { const a = j / 10 * PI * 2 + PI / 10; g.add(rod(V(0, 0, 0.02), V(Math.cos(a) * r, Math.sin(a) * r, 0.02), r * 0.012, ribM, 5)); }
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.008, 4, 10), ribM), 0, 0, 0.01, 0, 0, PI / 10));
  g.add(at(cyl(r * 0.12, r * 0.12, 0.12, k.black, 20), 0, 0, 0, PI / 2, 0, 0));   // hub
  return g;
}
export function buildLucy() {
  const k = K(), g = new THREE.Group();
  add(g, at(cyl(0.9, 0.9, 2.2, k.silver, 24), 0, 0, 0), at(box(1.6, 1.0, 1.6, k.white), 0, 1.4, 0), at(cyl(0.92, 0.92, 0.06, k.metal, 24), 0, 1.1, 0));
  { const d = dish(1.0, 0.3); d.position.set(0, 0.2, 0.95); d.rotation.x = PI / 2; g.add(d); }
  add(g, at(box(0.7, 0.6, 0.5, k.white), 0, 2.1, 0.3), at(cyl(0.2, 0.2, 0.5, k.black, 16), 0.2, 2.2, 0.55, PI / 2, 0, 0), at(box(0.3, 0.3, 0.3, k.gold), -0.3, 2.3, 0.5));   // instrument pointing platform
  for (const sx of [1, -1]) { const arm = rod(V(sx * 0.9, 0, 0), V(sx * 1.6, 0, 0), 0.06, k.metal); g.add(arm);
    const a = ultraflex(3.65, 'orange'); a.position.set(sx * 5.25, 0, 0); a.rotation.y = 0.12 * sx; g.add(a); }
  return g;
}

// =====================================================================
// Tianwen-2: gold body, two round violet-blue arrays (±X), a white dish, four landing legs and the sampling arm
// =====================================================================
export function buildTianwen2() {
  const k = K(), g = new THREE.Group();
  add(g, at(box(1.8, 1.4, 1.8, k.gold), 0, 0, 0), at(box(1.84, 0.08, 1.84, k.metal), 0, 0.74, 0), at(box(1.2, 0.6, 1.2, k.goldDark), 0, 1.05, 0));
  { const d = dish(0.7, 0.22); d.position.set(0.3, 0.4, -1.0); d.rotation.x = -PI / 2 - 0.3; g.add(d, rod(V(0.3, 0.3, -0.9), V(0.3, 0.38, -1.0), 0.04, k.metal)); }
  for (const sx of [1, -1]) { g.add(rod(V(sx * 0.9, 0.2, 0), V(sx * 1.7, 0.2, 0), 0.05, k.metal)); const a = ultraflex(1.9, 'violet'); a.position.set(sx * 3.6, 0.2, 0); a.rotation.y = PI / 2 * 0 + 0.2 * sx; g.add(a); }
  for (const [x, z] of [[0.9, 0.9], [-0.9, 0.9], [0.9, -0.9], [-0.9, -0.9]]) { g.add(rod(V(x * 0.8, -0.6, z * 0.8), V(x * 1.5, -1.5, z * 1.5), 0.04, k.metal)); g.add(at(cyl(0.16, 0.16, 0.04, k.metal, 12), x * 1.5, -1.52, z * 1.5)); }
  g.add(rod(V(0.6, -0.5, 0.6), V(1.3, -0.9, 1.4), 0.04, k.metal), rod(V(1.3, -0.9, 1.4), V(1.0, -1.5, 1.8), 0.035, k.metal), at(cyl(0.12, 0.08, 0.2, k.silver, 12), 1.0, -1.6, 1.8));   // sampling arm
  return g;
}

// =====================================================================
// Aditya-L1: white box with an open frame top and telescope apertures (+Y, towards the Sun), one 2-panel wing (+X),
// a 6 m magnetometer boom (-X) and a dish
// =====================================================================
export function buildAditya() {
  const k = K(), g = new THREE.Group();
  add(g, at(box(1.6, 1.4, 1.6, k.white), 0, 0, 0), at(box(1.64, 0.08, 1.64, k.metal), 0, 0.72, 0), at(box(1.64, 0.08, 1.64, k.metal), 0, -0.72, 0));
  for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]]) g.add(rod(V(x, 0.72, z), V(x * 0.9, 1.5, z * 0.9), 0.035, k.metal));   // the open frame above
  { const c = [[-0.72, -0.72], [0.72, -0.72], [0.72, 0.72], [-0.72, 0.72]]; for (let j = 0; j < 4; j++) g.add(rod(V(c[j][0], 1.5, c[j][1]), V(c[(j + 1) % 4][0], 1.5, c[(j + 1) % 4][1]), 0.025, k.metal)); }
  add(g, at(cyl(0.35, 0.35, 0.8, k.silver, 24), -0.2, 1.1, 0.1), at(new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 8, 24), k.metal), -0.2, 1.5, 0.1, PI / 2, 0, 0), at(cyl(0.3, 0.3, 0.02, k.lens, 24), -0.2, 1.5, 0.1));   // VELC coronagraph
  add(g, at(box(0.35, 0.5, 0.35, k.gold), 0.45, 1.0, -0.4), at(cyl(0.1, 0.1, 0.02, k.lens, 16), 0.45, 1.26, -0.4), at(box(0.3, 0.3, 0.3, k.black), 0.45, 0.95, 0.45));   // SUIT and others
  { const w = wing(2, 1.5, 1.1, k.cells, { yoke: 0.5, gap: 0.06 }); w.position.set(0.8, 0.1, 0); w.rotation.x = 1.25; g.add(w); }
  g.add(rod(V(-0.8, 0.3, 0.3), V(-6.0, 1.2, 1.1), 0.03, k.metal), at(box(0.14, 0.14, 0.14, k.white), -6.0, 1.2, 1.1), at(box(0.12, 0.12, 0.12, k.white), -3.5, 0.77, 0.72));   // magnetometer boom
  { const d = dish(0.38, 0.12); d.position.set(0.5, -0.9, 0.7); d.rotation.set(PI - 0.5, 0, 0.3); g.add(d, rod(V(0.5, -0.72, 0.5), V(0.5, -0.85, 0.65), 0.03, k.metal)); }
  return g;
}

// =====================================================================
// SOHO: gold service module, silver-black payload module with the instrument barrels (+Y towards the Sun),
// two wings of two beige panels (±X), small dish
// =====================================================================
export function buildSOHO() {
  const k = K(), g = new THREE.Group();
  add(g, at(box(2.4, 1.2, 1.8, k.gold), 0, -0.6, 0), at(box(2.44, 0.06, 1.84, k.metal), 0, 0.02, 0));                 // service module
  add(g, at(cyl(1.05, 1.05, 2.4, k.black, 8), 0, 1.25, 0, 0, PI / 8, 0), at(cyl(1.07, 1.07, 0.08, k.metal, 8), 0, 2.48, 0, 0, PI / 8, 0));   // payload module
  for (let j = 0; j < 8; j++) { const a = j / 8 * PI * 2; g.add(at(box(0.04, 2.3, 0.04, k.metal), Math.cos(a) * 1.0, 1.25, Math.sin(a) * 1.0)); }
  for (const [x, z, r, h] of [[0.4, 0.3, 0.22, 1.2], [-0.4, 0.2, 0.18, 1.0], [0.1, -0.5, 0.15, 0.8], [-0.5, -0.4, 0.14, 0.9], [0.55, -0.35, 0.12, 0.7]])
    add(g, at(cyl(r, r, h, k.goldDark, 16), x, 2.5 + h / 2 - 0.1, z), at(cyl(r * 0.8, r * 0.8, 0.02, k.lens, 16), x, 2.5 + h - 0.09, z));   // LASCO, EIT, UVCS... barrels
  add(g, at(box(0.6, 0.6, 0.4, k.silver), 0.6, 1.4, 1.0), at(cyl(0.15, 0.15, 0.04, k.mirror, 16), 0.6, 1.5, 1.22, PI / 2, 0, 0));   // the round port seen in the pictures
  for (const sx of [1, -1]) { const w = wing(2, 2.0, 1.7, k.cellsBeige, { yoke: 0.5, gap: 0.08 }); w.position.set(sx * 1.2, -0.6, 0); w.rotation.set(0.3, sx > 0 ? 0 : PI, 0); g.add(w); }
  { const d = dish(0.5, 0.15); d.position.set(0, -1.3, 0.6); d.rotation.x = PI - 0.4; g.add(d, rod(V(0, -1.2, 0.3), V(0, -1.28, 0.55), 0.04, k.metal)); }
  return g;
}

export { buildGateway } from './flyermodels.js?v=40';
