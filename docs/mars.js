// =====================================================================
// Mars up close: detailed Perseverance & Curiosity, Ingenuity, landing sites and landmarks
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
let LOAD_PERSEVERANCE = null;
// NASA 3D Resources models for the other landing sites: file, real size in metres (longest side), and the hand-built stand-in to hide
const REAL = { MS2_Opportunity: ['mer.glb', 2.3], MS2_Spirit: ['mer.glb', 2.3], MS2_Viking1: ['viking.glb', 3.0], MS2_Viking2: ['viking.glb', 3.0],
  MS2_InSight: ['insight.glb', 6.0], MS2_Ingenuity: ['ingenuity.glb', 1.2] };
const REAL_PINS = [], realCache = {};
function loadReal() {   // all of them at once (about 4 MB), the first time anything on Mars is visited
  if (loadReal.done) return; loadReal.done = true;
  LOAD_PERSEVERANCE?.();   // its neighbour Perseverance too, so Ingenuity is not seen next to the old stand-in
  const L = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/'));
  for (const [k, pin, lon] of REAL_PINS) { const [file, metres] = REAL[k];
    (realCache[file] ||= L.loadAsync('models/' + file).then(g => g.scene)).then(src => {
      const m = src.clone(true), bb = new THREE.Box3().setFromObject(m), c = bb.getCenter(V()), size = bb.getSize(V());
      m.position.set(-c.x, -bb.min.y, -c.z);                                     // feet or wheels on the ground, centred
      const holder = new THREE.Group(); holder.add(m); holder.scale.setScalar(0.0085 * metres / Math.max(size.x, size.y, size.z)); holder.rotation.y = lon * 0.1;
      m.traverse(o => { if (o.isMesh) { const mats = [].concat(o.material).map(mt => mt.clone()); o.material = mats.length > 1 ? mats : mats[0];
        for (const mt of mats) if (mt.emissive && mt.emissive.getHex() === 0) { mt.emissive.set(0xffffff); if (mt.map) mt.emissiveMap = mt.map; else mt.emissive.copy(mt.color); mt.emissiveIntensity = 0.1; } } });
      for (const ch of pin.children) if (ch.userData.stand) ch.visible = false;
      pin.add(holder); }); }
}
const SS = window.SS;
const { scene, camera, bodies, sim, flyTo, focusSel, glowSprite } = SS;
const { info } = SS.cosmos;
const { nearLabel, PL } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const $ = id => document.getElementById(id);
const special = SS.more.special;
const T = PL.Mars.tilted, mars = T.children[0], R = mars.geometry.parameters.radius;
const surf = (lat, lon) => V(Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.sin(lat * D2R), -Math.cos(lat * D2R) * Math.sin(lon * D2R));   // matches the Mars map

// ---------- models (built in metres, then shrunk) ----------
const M = (c, m = 0.2, r = 0.6) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
const WHITE = M(0xe9e5dc, 0.1, 0.55), GREY = M(0x8b8f96, 0.6, 0.4), DARK = M(0x2b2d31, 0.4, 0.6), GOLD = M(0xc9a24a, 0.9, 0.3), BLACK = M(0x111111, 0.3, 0.3);
const box = (w, h, d, mat, x, y, z, p) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); p.add(m); return m; };
const cyl = (r1, r2, h, mat, x, y, z, p, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); m.position.set(x, y, z); p.add(m); return m; };
function buildRover({ rtgTilt = 0.5 } = {}) {
  const g = new THREE.Group();
  box(2.1, 0.55, 1.45, WHITE, 0, 1.0, 0, g);                                // body
  box(1.9, 0.08, 1.35, GREY, 0, 1.31, 0, g);                                // deck
  box(0.5, 0.18, 0.4, WHITE, 0.2, 1.42, -0.35, g); box(0.35, 0.14, 0.3, GOLD, -0.35, 1.4, 0.35, g);
  // the nuclear power source (RTG) sticking out at the back, with cooling fins
  const rtg = new THREE.Group(); rtg.position.set(-1.25, 1.15, 0); rtg.rotation.z = rtgTilt; g.add(rtg);
  cyl(0.2, 0.2, 0.7, DARK, 0, 0, 0, rtg); for (let k = 0; k < 8; k++) { const f = box(0.02, 0.62, 0.62, DARK, 0, 0, 0, rtg); f.rotation.y = k * Math.PI / 8; }
  // the mast with its camera head (Mastcam / SuperCam)
  cyl(0.05, 0.06, 1.15, WHITE, 0.75, 1.9, 0.48, g);
  const head = box(0.42, 0.28, 0.56, WHITE, 0.82, 2.55, 0.48, g);
  for (const z of [-0.14, 0.02, 0.18]) { const l = cyl(0.05, 0.05, 0.06, BLACK, 0.18, 0, z - 0.02, head); l.rotation.z = Math.PI / 2; }
  // the high-gain antenna (a flat hexagon on a post)
  cyl(0.03, 0.03, 0.25, GREY, -0.45, 1.45, -0.45, g); const hga = cyl(0.32, 0.32, 0.05, GREY, -0.45, 1.6, -0.45, g, 6); hga.rotation.x = 0.4;
  // the robotic arm folded in front, with its tool turret
  const a1 = box(0.6, 0.08, 0.08, WHITE, 1.25, 0.95, 0.35, g); a1.rotation.z = -0.3;
  const a2 = box(0.9, 0.07, 0.07, WHITE, 1.35, 0.8, -0.05, g); a2.rotation.y = 1.2;
  const tur = box(0.28, 0.28, 0.28, GREY, 1.42, 0.7, -0.45, g); cyl(0.05, 0.05, 0.2, DARK, 0, -0.2, 0, tur);
  // six wheels on a rocker-bogie suspension
  for (const z of [-0.85, 0.85]) {
    const rock = box(1.9, 0.08, 0.08, WHITE, 0, 0.62, z * 0.93, g); rock.rotation.z = 0.08;
    for (const x of [-0.8, 0.05, 0.9]) {
      const w = cyl(0.26, 0.26, 0.25, DARK, x, 0.26, z, g, 20); w.rotation.x = Math.PI / 2;
      const hub = cyl(0.1, 0.1, 0.26, GREY, x, 0.26, z, g, 10); hub.rotation.x = Math.PI / 2;
      box(0.06, 0.4, 0.06, GREY, x, 0.45, z * 0.93, g);
    }
  }
  g.position.y = 0; return g;
}
function buildIngenuity() {
  const g = new THREE.Group();
  box(0.14, 0.14, 0.14, GREY, 0, 0.3, 0, g);
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const l = box(0.02, 0.36, 0.02, WHITE, x * 0.14, 0.15, z * 0.14, g); l.rotation.set(z * 0.45, 0, -x * 0.45); }
  cyl(0.015, 0.015, 0.4, GREY, 0, 0.55, 0, g);
  for (const [y, a] of [[0.47, 0], [0.58, 0.9]]) { const b = box(1.2, 0.012, 0.08, WHITE, 0, y, 0, g); b.rotation.y = a; }
  box(0.42, 0.015, 0.24, M(0x1b2f78, 0.6, 0.3), 0, 0.77, 0, g);   // solar panel on top
  return g;
}

// ---------- the sites ----------
const SITES = [ // key, name, lat, lon (east), kind, model, category, where, fact
  ['Perseverance', 'Perseverance', 18.44, 77.45, 'live', 'rover', 'Rover · on Mars since 2021', 'Jezero Crater, Mars',
    'A car-sized robot exploring an ancient river delta and lake bed for signs of past life, and collecting rock samples. On 11 October 2026 it broke the record for the longest drive on another world, passing Opportunity\'s 45.16 km. It brought the Ingenuity helicopter with it.'],
  ['MS2_Ingenuity', 'Ingenuity', 18.47, 77.40, 'us', 'heli', 'Helicopter · 2021–2024', 'Jezero Crater, Mars',
    'On 19 April 2021 this 1.8 kg helicopter made the first powered flight on another planet. Planned for 5 test flights, it flew 72 times before a damaged rotor blade grounded it in January 2024.'],
  ['MS2_Curiosity', 'Curiosity', -4.59, 137.44, 'live', 'rover', 'Rover · on Mars since 2012', 'Gale Crater, Mars',
    'Landed on 6 August 2012 and still exploring, slowly climbing Mount Sharp, a 5 km-high mountain of rock layers that record Mars\'s watery past. It passed 5,000 Martian days on the job in 2026.'],
  ['MS2_Opportunity', 'Opportunity', -1.95, 354.47, 'us', 'real', 'Rover · 2004–2018', 'Meridiani Planum, Mars',
    'Built to last 90 days, it kept going for almost 15 years and drove 45.16 km, a marathon. A planet-wide dust storm ended its mission in 2018.'],
  ['MS2_Spirit', 'Spirit', -14.57, 175.47, 'us', 'real', 'Rover · 2004–2010', 'Gusev Crater, Mars',
    'Opportunity\'s twin. It found signs of ancient hot springs before getting stuck in soft sand in 2009.'],
  ['MS2_Sojourner', 'Sojourner (Pathfinder)', 19.13, 326.78, 'us', 'pin', 'First Mars rover · 1997', 'Ares Vallis, Mars',
    'Landed on 4 July 1997: the first rover on another planet, about the size of a microwave oven.'],
  ['MS2_Viking1', 'Viking 1', 22.27, 312.05, 'us', 'real', 'Lander · 1976', 'Chryse Planitia, Mars',
    'NASA\'s first Mars landing, on 20 July 1976. It sent back the first clear colour pictures of the Martian surface.'],
  ['MS2_Viking2', 'Viking 2', 47.64, 134.29, 'us', 'real', 'Lander · 1976', 'Utopia Planitia, Mars',
    'Landed on 3 September 1976 and photographed thin white frost on the ground during the Martian winter.'],
  ['MS2_Mars3', 'Mars 3', -45.0, 202.0, 'ussr', 'pin', 'Lander · 1971', 'Terra Sirenum, Mars',
    'The Soviet Union\'s Mars 3 made the first soft landing on Mars on 2 December 1971, but fell silent after about 20 seconds.'],
  ['MS2_Phoenix', 'Phoenix', 68.22, 234.25, 'us', 'pin', 'Lander · 2008', 'near the north pole, Mars',
    'Dug into the ground near the north pole and found real water ice just under the surface.'],
  ['MS2_InSight', 'InSight', 4.50, 135.62, 'us', 'real', 'Lander · 2018–2022', 'Elysium Planitia, Mars',
    'Listened to the inside of Mars and recorded more than 1,300 marsquakes.'],
  ['MS2_Zhurong', 'Zhurong', 25.07, 109.93, 'cn', 'pin', 'Rover · 2021', 'Utopia Planitia, Mars',
    'China\'s first Mars rover, named after a god of fire. China became the first country to orbit, land and drive on Mars on its very first try.'],
];
const MARKS = [ // landmarks
  ['MK_Olympus', 'Olympus Mons', 18.65, 226.2, 'Volcano', 'the tallest volcano in the Solar System',
    'About 22 km high, nearly three times the height of Mount Everest, and around 600 km wide.'],
  ['MK_Valles', 'Valles Marineris', -13.9, 300.8, 'Canyon', 'along the equator of Mars',
    'A canyon system about 4,000 km long and up to 7 km deep. On Earth it would stretch across the whole United States.'],
  ['MK_Hellas', 'Hellas Basin', -42.4, 70.5, 'Impact crater', 'southern Mars',
    'A giant crater about 2,300 km wide and 7 km deep, left by a huge impact billions of years ago.'],
  ['MK_NPole', 'North polar ice cap', 86, 0, 'Ice cap', 'the north pole of Mars',
    'A cap of water ice about 1,000 km across, topped with a frost of frozen carbon dioxide in winter.'],
];
const COL = { live: '#7dff9a', us: '#ffd27a', ussr: '#ff6a5a', cn: '#ff4040' };

// remove the old, simple Perseverance
{ const old = bodies.Perseverance?.obj; if (old) { old.traverse(o => { if (o.isCSS2DObject) o.element.remove(); }); old.parent?.remove(old); } }

const pins = [], lockFor = {};
const wp = V(), mp = V();
for (const [k, name, lat, lon, kind, model, cat, where, fact] of SITES) {
  const n = surf(lat, lon);
  const pin = new THREE.Group(); pin.position.copy(n).multiplyScalar(R * 1.001); pin.quaternion.setFromUnitVectors(V(0, 1, 0), n); mars.add(pin);
  if (model === 'rover') { const r = buildRover(); r.scale.setScalar(0.0085); r.rotation.y = lon * 0.1; pin.add(r);
    if (k === 'Perseverance') { const ry = r.rotation.y; LOAD_PERSEVERANCE = () => {   // NASA's full model, loaded on the first visit; it is in metres like ours
      if (r.userData.real) return; r.userData.real = true;
      new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/')).load('models/perseverance.glb', gl => {
        const m = gl.scene, bb = new THREE.Box3().setFromObject(m), c = bb.getCenter(V());
        m.position.set(-c.x, -bb.min.y, -c.z);                                     // wheels on the ground, centred
        const holder = new THREE.Group(); holder.add(m); holder.scale.setScalar(0.0085); holder.rotation.y = ry;
        m.traverse(o => { if (o.isMesh) for (const mt of [].concat(o.material)) if (mt.emissive && mt.emissive.getHex() === 0) { mt.emissive.set(0xffffff); if (mt.map) mt.emissiveMap = mt.map; else mt.emissive.copy(mt.color); mt.emissiveIntensity = 0.1; } });
        r.visible = false; pin.add(holder); }); }; } }
  else if (model === 'real') { REAL_PINS.push([k, pin, lon]); }
  if (model === 'heli') REAL_PINS.push([k, pin, lon]);
  if (model === 'heli') { const h = buildIngenuity(); h.scale.setScalar(0.0085); h.position.set(0.045, 0, 0.02); h.userData.stand = true; pin.add(h); }
  pin.add(glowSprite(model === 'pin' ? 0.012 : 0.006, COL[kind], 'rgba(0,0,0,0)', 0.9));
  if (model === 'pin') cyl(0.0004, 0.0004, 0.012, M(0xffffff), 0, 0.006, 0, pin, 6);
  nearLabel(pin, name, model === 'pin' ? 0.02 : 0.035, k, 'craft', 2.2);
  pins.push(pin); lockFor[k] = lon;
  bodies[k] = { obj: pin, radius: 0.02, view: model === 'pin' ? 0.55 : model === 'real' ? (k === 'MS2_InSight' ? 0.11 : 0.07) : 0.07, dir: () => { pin.getWorldPosition(wp); T.getWorldPosition(mp); const up = wp.clone().sub(mp).normalize(); const sun = mp.clone().negate().normalize();
    const t = sun.sub(up.clone().multiplyScalar(sun.dot(up))); if (t.lengthSq() < 1e-6) t.set(1, 0, 0); t.normalize();
    return model === 'pin' ? up.add(t.multiplyScalar(0.35)).normalize() : up.multiplyScalar(0.5).add(t.multiplyScalar(0.9)).normalize(); } };
  info(k, name, cat, where, fact); if (SS.more.INFO_EN) delete SS.more.INFO_EN[k];
}
for (const [k, name, lat, lon, cat, where, fact] of MARKS) {
  const n = surf(lat, lon);
  const o = new THREE.Object3D(); o.position.copy(n).multiplyScalar(R * 1.002); mars.add(o);
  nearLabel(o, '▲ ' + name, 0.03, k, 'neb', 3); pins.push(o); lockFor[k] = lon;
  bodies[k] = { obj: o, radius: 0.1, view: 1.1, dir: () => { o.getWorldPosition(wp); T.getWorldPosition(mp); const up = wp.clone().sub(mp).normalize(); return up.add(mp.clone().negate().normalize().multiplyScalar(0.3)).normalize(); } };
  info(k, name, cat, where, fact);
}
// hide names on the far side of Mars
{ const cw = V();
  sim.push(() => { T.getWorldPosition(mp); camera.getWorldPosition(cw);
    for (const p of pins) { p.getWorldPosition(wp); if (wp.clone().sub(mp).normalize().dot(cw.clone().sub(wp).normalize()) < 0.05) for (const c of p.children) if (c.isCSS2DObject) c.visible = false; } }); }
// when you visit a site, turn Mars so it is early afternoon there, and hold it
let lockLon = null;
const sl = V();
sim.push(() => {
  if (lockLon == null) return;
  sl.copy(T.worldToLocal(V(0, 0, 0))).normalize();
  const sunLon = Math.atan2(-sl.z, sl.x);
  mars.rotation.y = sunLon - 0.45 - lockLon * D2R;
});
{ const prev = SS.onFocus; SS.onFocus = key => { prev(key); lockLon = key in lockFor ? lockFor[key] : null; if (key === 'Perseverance') LOAD_PERSEVERANCE?.(); if (key === 'Mars' || key in lockFor) loadReal(); }; }
const visit = k => () => { lockLon = lockFor[k]; $('speed').value = '0.000694'; const au = $('auto'); if (au.checked) { au.checked = false; au.dispatchEvent(new Event('change')); } SS.controls.autoRotate = false; setTimeout(() => flyTo(k), 250); };
for (const k in lockFor) special[k] = visit(k);

// ---------- menu ----------
{
  const og = document.createElement('optgroup'); og.label = '🔴 Mars: rovers & landmarks';
  const after = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Moon landing sites');
  after ? after.after(og) : focusSel.appendChild(og);
  for (const s of SITES) { const o = document.createElement('option'); o.value = s[0]; o.textContent = (s[4] === 'live' ? '🟢 ' : '') + s[1]; og.appendChild(o); }
  for (const m of MARKS) { const o = document.createElement('option'); o.value = m[0]; o.textContent = '▲ ' + m[1]; og.appendChild(o); }
  // the old "Perseverance (on Mars)" entry in Spacecraft now leads here too
}

// ---------- One Fact cards ----------
{
  const F = SS.more.FACTS, FR = SS.more.FACTS_FR;
  const add = (en, fr) => { F.push(en); if (FR) FR[F.length - 1] = fr; };
  add(['Perseverance', 'A robot holds the off-world driving record', 'On 11 October 2026 Perseverance passed 45.16 km on Mars, the farthest any vehicle has driven on another world.'],
    ['Un robot détient le record de conduite hors de la Terre', "Le 11 octobre 2026, Perseverance a dépassé 45,16 km sur Mars : la plus longue distance jamais parcourue par un véhicule sur un autre monde."]);
  add(['MS2_Ingenuity', 'The first aircraft on another planet', 'The tiny Ingenuity helicopter was meant to fly 5 times on Mars. It flew 72.'],
    ['Le premier aéronef sur une autre planète', "Le petit hélicoptère Ingenuity devait voler 5 fois sur Mars. Il a volé 72 fois."]);
  add(['MK_Olympus', 'Mars has a volcano three times taller than Everest', 'Olympus Mons rises about 22 km, the tallest volcano in the Solar System.'],
    ["Mars a un volcan trois fois plus haut que l'Everest", "Olympus Mons s'élève à environ 22 km : le plus haut volcan du Système solaire."]);
}

// ---------- French ----------
SS.i18nAdd?.({
  ui: { '🔴 Mars: rovers & landmarks': '🔴 Mars : rovers et sites remarquables', '🟢 Perseverance': '🟢 Perseverance', '🟢 Curiosity': '🟢 Curiosity',
    '▲ Olympus Mons': '▲ Olympus Mons', '▲ Valles Marineris': '▲ Valles Marineris', '▲ Hellas Basin': '▲ Bassin d\'Hellas', '▲ North polar ice cap': '▲ Calotte polaire nord', 'Sojourner (Pathfinder)': 'Sojourner (Pathfinder)' },
  name: { 'Hellas Basin': 'Bassin d\'Hellas', 'North polar ice cap': 'Calotte polaire nord', '▲ Hellas Basin': '▲ Bassin d\'Hellas', '▲ North polar ice cap': '▲ Calotte polaire nord', 'Perseverance rover': 'Le rover Perseverance' },
  cat: { 'Rover · on Mars since 2021': 'Rover · sur Mars depuis 2021', 'Helicopter · 2021–2024': 'Hélicoptère · 2021–2024', 'Rover · on Mars since 2012': 'Rover · sur Mars depuis 2012', 'Rover · 2004–2018': 'Rover · 2004–2018',
    'Rover · 2004–2010': 'Rover · 2004–2010', 'First Mars rover · 1997': 'Premier rover martien · 1997', 'Lander · 1976': 'Atterrisseur · 1976', 'Lander · 1971': 'Atterrisseur · 1971', 'Lander · 2008': 'Atterrisseur · 2008',
    'Lander · 2018–2022': 'Atterrisseur · 2018–2022', 'Rover · 2021': 'Rover · 2021', Volcano: 'Volcan', Canyon: 'Canyon', 'Impact crater': "Cratère d'impact", 'Ice cap': 'Calotte glaciaire' },
  dist: { 'Jezero Crater, Mars': 'Cratère Jezero, Mars', 'Gale Crater, Mars': 'Cratère Gale, Mars', 'Meridiani Planum, Mars': 'Meridiani Planum, Mars', 'Gusev Crater, Mars': 'Cratère Gusev, Mars', 'Ares Vallis, Mars': 'Ares Vallis, Mars',
    'Chryse Planitia, Mars': 'Chryse Planitia, Mars', 'Utopia Planitia, Mars': 'Utopia Planitia, Mars', 'Terra Sirenum, Mars': 'Terra Sirenum, Mars', 'near the north pole, Mars': 'près du pôle Nord, Mars', 'Elysium Planitia, Mars': 'Elysium Planitia, Mars',
    'the tallest volcano in the Solar System': 'le plus haut volcan du Système solaire', 'along the equator of Mars': "le long de l'équateur de Mars", 'southern Mars': 'le sud de Mars', 'the north pole of Mars': 'le pôle Nord de Mars' },
  fact: {
    Perseverance: "Un robot de la taille d'une voiture qui explore un ancien delta et le fond d'un lac à la recherche de traces de vie passée, et qui prélève des échantillons de roche. Le 11 octobre 2026, il a battu le record de la plus longue distance parcourue sur un autre monde, dépassant les 45,16 km d'Opportunity. Il a emmené avec lui l'hélicoptère Ingenuity.",
    MS2_Ingenuity: "Le 19 avril 2021, cet hélicoptère de 1,8 kg a réalisé le premier vol motorisé sur une autre planète. Prévu pour 5 vols d'essai, il a volé 72 fois avant qu'une pale abîmée ne le cloue au sol en janvier 2024.",
    MS2_Curiosity: "Posé le 6 août 2012 et toujours en activité, il gravit lentement le mont Sharp, une montagne de 5 km de couches de roche qui racontent le passé humide de Mars. Il a passé le cap des 5 000 jours martiens en 2026.",
    MS2_Opportunity: "Conçu pour 90 jours, il a fonctionné près de 15 ans et parcouru 45,16 km, un marathon. Une tempête de poussière planétaire a mis fin à sa mission en 2018.",
    MS2_Spirit: "Le jumeau d'Opportunity. Il a trouvé des traces d'anciennes sources chaudes avant de s'enliser dans du sable mou en 2009.",
    MS2_Sojourner: "Posé le 4 juillet 1997 : le premier rover sur une autre planète, de la taille d'un four à micro-ondes.",
    MS2_Viking1: "Le premier atterrissage de la NASA sur Mars, le 20 juillet 1976. Il a envoyé les premières photos nettes en couleur du sol martien.",
    MS2_Viking2: "Posé le 3 septembre 1976, il a photographié une fine couche de givre blanc pendant l'hiver martien.",
    MS2_Mars3: "La sonde soviétique Mars 3 a réussi le premier atterrissage en douceur sur Mars le 2 décembre 1971, mais s'est tue au bout d'environ 20 secondes.",
    MS2_Phoenix: "A creusé le sol près du pôle Nord et trouvé de la vraie glace d'eau juste sous la surface.",
    MS2_InSight: "A écouté l'intérieur de Mars et enregistré plus de 1 300 séismes martiens.",
    MS2_Zhurong: "Le premier rover martien chinois, qui porte le nom d'un dieu du feu. La Chine est devenue le premier pays à se mettre en orbite, se poser et rouler sur Mars dès son premier essai.",
    MK_Olympus: "Environ 22 km de haut, près de trois fois la hauteur de l'Everest, et environ 600 km de large.",
    MK_Valles: "Un ensemble de canyons d'environ 4 000 km de long et jusqu'à 7 km de profondeur. Sur Terre, il traverserait tous les États-Unis.",
    MK_Hellas: "Un cratère géant d'environ 2 300 km de large et 7 km de profondeur, laissé par un énorme impact il y a des milliards d'années.",
    MK_NPole: "Une calotte de glace d'eau d'environ 1 000 km de large, recouverte en hiver d'un givre de dioxyde de carbone gelé.",
  },
});
await import('./launches.js' + new URL(import.meta.url).search);
