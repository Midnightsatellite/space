// =====================================================================
// NASA's own 3D models (NASA 3D Resources), placed where each craft really is:
// Mars orbiters (MRO, Odyssey, MAVEN), LRO at the Moon, Cassini at Saturn and Galileo at Jupiter (historic),
// MESSENGER at Mercury (historic), Dawn at Ceres, OSIRIS-APEX on its way to Apophis,
// Wind and DSCOVR at L1, STEREO-A ahead of Earth, Ulysses over the Sun's poles.
// Each model loads the first time its entry is chosen; until then a small stand-in craft is shown.
// Also: a guided tour of the newest missions.
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const SS = window.SS;
const { bodies, sim, flyTo, focusSel } = SS;
const { info } = SS.cosmos;
const { nearLabel, PL, auToScene } = SS.extras;
const special = SS.more.special, D = SS.more.cards2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180, T = (l, lf, v, vf) => [l, lf, v, vf];
const DAY = 864e5, J2000 = Date.UTC(2000, 0, 1, 12);
const wp = V(), cp = V();
const fr = () => SS.lang === 'fr';
const $ = id => document.getElementById(id);
const kepler = (M, e) => { let E = e < 0.8 ? M : Math.PI; for (let k = 0; k < 40; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; };
const nuOf = (E, e) => 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
const toScene = p => { const r = p.length(); return V(p.x, p.z, -p.y).normalize().multiplyScalar(auToScene(r)); };   // ecliptic AU → scene
const keplerAU = ({ a, e, i, node, peri }, tp, t) => {
  const n = 0.01720209895 / Math.pow(a, 1.5), M = (((n * (t - tp) / DAY) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const E = kepler(M, e), nu = nuOf(E, e), r = a * (1 - e * Math.cos(E));
  const u = peri * D2R + nu, O = node * D2R, I = i * D2R;
  return V(r * (Math.cos(O) * Math.cos(u) - Math.sin(O) * Math.sin(u) * Math.cos(I)), r * (Math.sin(O) * Math.cos(u) + Math.cos(O) * Math.sin(u) * Math.cos(I)), r * Math.sin(u) * Math.sin(I));
};

// ---------------------------------------------------------------- shared model loader
const loader = new GLTFLoader();
{ const draco = new DRACOLoader(); draco.setDecoderPath('three/examples/jsm/libs/draco/gltf/'); loader.setDRACOLoader(draco); }
const LOAD = {};
function standIn(size, color) {   // a tiny generic probe shown until the real model arrives
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.5 }), p = new THREE.MeshStandardMaterial({ color: 0x1d2f6e, metalness: 0.3, roughness: 0.4 });
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), m));
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.22), p); w.position.x = s * 0.45; g.add(w); }
  g.scale.setScalar(size); return g;
}
function slot(key, file, size, color = 0xd8b060, bulk = 0) {   // bulk: size the main body, not long wire antennas
  const s = new THREE.Group(), ph = standIn(size, color); s.add(ph);
  let state = 0;
  LOAD[key] = () => {
    if (state) return; state = 1;
    loader.load('models/' + file, gl => {
      const m = gl.scene; m.updateMatrixWorld(true);
      m.traverse(o => { if (!o.isMesh) return;
        if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        for (const mt of [].concat(o.material)) { if (mt.metalness > 0.6) mt.metalness = 0.6; mt.side = THREE.DoubleSide; } });
      const box = new THREE.Box3().setFromObject(m), z = box.getSize(V());
      let k = size / Math.max(z.x, z.y, z.z);
      const c = V(); let wsum = 0;   // centre on the bulk of the craft, not on long booms and antennas
      m.traverse(o => { if (!o.isMesh) return; const b = new THREE.Box3().setFromObject(o), n = o.geometry.attributes.position.count; c.addScaledVector(b.getCenter(V()), n); wsum += n; });
      if (wsum) c.divideScalar(wsum); else box.getCenter(c);
      if (bulk) k /= bulk;   // bulk = the main body's share of the full span (wire antennas left out of the sizing)
      m.position.sub(c).multiplyScalar(k); m.scale.multiplyScalar(k);
      const w = new THREE.Group(); w.add(m); s.remove(ph); s.add(w); state = 2;
    }, undefined, () => { state = 0; });
  };
  return s;
}
{ const prev = SS.onFocus; SS.onFocus = key => { LOAD[key]?.(); prev(key); }; }

// the camera arrives on the sunlit side, pulled out from the world the craft circles
const litDir = (craft, host, out = 0.6) => () => { const toSun = craft.getWorldPosition(wp).clone().negate().normalize();
  const rad = host ? wp.clone().sub(host.getWorldPosition(cp)).normalize() : V(0, 1, 0);
  return toSun.multiplyScalar(0.7).addScaledVector(rad, out).add(V(0, 0.25, 0)).normalize(); };
// a date window: the craft (and its label and orbit) only show while the mission was there
const windows = [];
function dated(key, objs, label, from, to) { windows.push([objs, label, from, to]);
  const mid = from + (to - from) * 0.6;
  special[key] = () => { const t = SS.getDate(); if (t >= from && t <= to) return flyTo(key);
    SS.setDate(mid); requestAnimationFrame(() => requestAnimationFrame(() => flyTo(key))); }; }   // let the planets move to the new date first
sim.push(() => { const t = SS.getDate(); for (const [objs, label, from, to] of windows) { const on = t >= from && t <= to; for (const o of objs) o.visible = on; if (!on && label) label.visible = false; } });

// a craft on a Kepler orbit around a planet or moon; sizes and periods are real, some orbits are drawn smaller (noted on the cards)
function orbiter({ key, host, file, size, rp, ra, P, rot = [0, 0, 0], w = 0, phase = 0, color, label, range = 4, view, opacity = 0.35 }) {
  const plane = new THREE.Group(); plane.rotation.order = 'YXZ'; plane.rotation.set(...rot); host.add(plane);   // rot = [inclination, node, 0]
  const a = (rp + ra) / 2, e = (ra - rp) / (ra + rp);
  const at = nu => { const r = a * (1 - e * e) / (1 + e * Math.cos(nu)); return V(Math.cos(nu + w) * r, 0, Math.sin(nu + w) * r); };
  const pts = []; for (let k = 0; k <= 200; k++) pts.push(at(k / 200 * 2 * Math.PI));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  plane.add(line); SS.orbitLines?.push(line);
  const craft = slot(key, file, size); plane.add(craft);
  sim.push(() => { const M = ((2 * Math.PI * ((SS.getDate() - J2000) / DAY / P + phase)) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    craft.position.copy(at(nuOf(kepler(M, e), e))); craft.lookAt(host.getWorldPosition(cp)); });
  const lab = nearLabel(craft, label, size * 1.6, key, 'craft', range);
  bodies[key] = { obj: craft, radius: size, view, dir: litDir(craft, host) };
  special[key] = special[key] || (() => flyTo(key));
  return { craft, line, plane, lab };
}

// ---------------------------------------------------------------- 1. Mars: MRO, Odyssey, MAVEN (silent since Dec 2025)
{
  const host = PL.Mars.tilted, R = 0.55;   // Mars, its pole along +Y
  orbiter({ key: 'MRO', host, file: 'mro.glb', size: 0.03, rp: R * 1.075, ra: R * 1.094, P: 112 / 1440, rot: [Math.PI / 2, 0.3, 0], color: 0xffb080, label: 'MRO', view: 0.13 });
  orbiter({ key: 'Odyssey', host, file: 'odyssey.glb', size: 0.026, rp: R * 1.118, ra: R * 1.118, P: 2 / 24, rot: [Math.PI / 2, 1.4, 0], phase: 0.4, color: 0xffd27a, label: 'Mars Odyssey', view: 0.12 });
  orbiter({ key: 'MAVEN', host, file: 'maven.glb', size: 0.026, rp: R * 1.044, ra: R * 2.83, P: 3.5 / 24, rot: [75 * D2R, 2.2, 0], w: 1.0, color: 0xa0a0b8, label: 'MAVEN (silent)', view: 0.12, opacity: 0.22 });
  info('MRO', 'Mars Reconnaissance Orbiter', 'Spacecraft · NASA Mars orbiter', 'in a low orbit around Mars, about 300 km up', 'See card.');
  info('Odyssey', '2001 Mars Odyssey', 'Spacecraft · NASA Mars orbiter', 'in orbit around Mars since October 2001', 'See card.');
  info('MAVEN', 'MAVEN', 'Spacecraft · NASA Mars orbiter, contact lost', 'still circling Mars, silent since 6 Dec 2025', 'See card.');
}

// ---------------------------------------------------------------- 2. LRO at the Moon
{
  const moon = bodies.Moon.obj, R = moon.geometry?.parameters?.radius || 0.27;
  const grp = new THREE.Group(); moon.parent.add(grp); sim.push(() => grp.position.copy(moon.position));
  orbiter({ key: 'LRO', host: grp, file: 'lro.glb', size: 0.016, rp: R * 1.03, ra: R * 1.1, P: 2 / 24, rot: [Math.PI / 2, 0.5, 0], color: 0xd0d8ff, label: 'LRO', range: 2, view: 0.07 });
  info('LRO', 'Lunar Reconnaissance Orbiter', 'Spacecraft · NASA Moon orbiter', 'in a low polar orbit around the Moon', 'See card.');
}

// ---------------------------------------------------------------- 3. Cassini at Saturn (2004–2017) and Galileo at Jupiter (1995–2003): historic
{
  const s = PL.Saturn.tilted, Rs = 2.7;
  const c = orbiter({ key: 'Cassini', host: s, file: 'cassini.glb', size: 0.18, rp: Rs * 1.03, ra: Rs * 5, P: 6.5, rot: [62 * D2R, 0.6, 0], w: -0.4, color: 0xffd27a, label: 'Cassini (1997–2017)', range: 40, view: 0.75 });
  dated('Cassini', [c.craft, c.line], c.lab, Date.UTC(2004, 6, 1), Date.UTC(2017, 8, 15, 11, 55));
  info('Cassini', 'Cassini', 'Spacecraft · NASA/ESA/ASI Saturn orbiter (1997–2017)', 'orbited Saturn 2004–2017; shown on its last loops', 'See card.');
  const j = PL.Jupiter.tilted, Rj = 3.2;
  const g = orbiter({ key: 'Galileo', host: j, file: 'galileo.glb', size: 0.16, rp: Rj * 3.5, ra: Rj * 11, P: 60, rot: [0, 0, 0], w: 2.0, color: 0xc8a0ff, label: 'Galileo (1989–2003)', range: 60, view: 0.7 });
  dated('Galileo', [g.craft, g.line], g.lab, Date.UTC(1995, 11, 7), Date.UTC(2003, 8, 21, 18, 57));
  info('Galileo', 'Galileo', 'Spacecraft · NASA Jupiter orbiter (1989–2003)', 'orbited Jupiter 1995–2003', 'See card.');
}

// ---------------------------------------------------------------- 4. MESSENGER at Mercury (2011–2015): historic
{
  const host = PL.Mercury.tilted, R = 0.38;
  const m = orbiter({ key: 'MESSENGER', host, file: 'messenger.glb', size: 0.026, rp: R * 1.08, ra: R * 4, P: 8 / 24, rot: [82.5 * D2R, 1.2, 0], w: 1.2, color: 0xffc070, label: 'MESSENGER (2004–2015)', range: 4, view: 0.12 });
  dated('MESSENGER', [m.craft, m.line], m.lab, Date.UTC(2011, 2, 18), Date.UTC(2015, 3, 30, 19, 26));
  info('MESSENGER', 'MESSENGER', 'Spacecraft · NASA Mercury orbiter (2004–2015)', 'orbited Mercury 2011–2015', 'See card.');
}

// ---------------------------------------------------------------- 5. Dawn, silent in orbit round Ceres since 2018
{
  const host = bodies.Ceres.obj, R = 0.2;
  orbiter({ key: 'Dawn', host, file: 'dawn.glb', size: 0.09, rp: R * 1.075, ra: R * 3, P: 27.2 / 24, rot: [Math.PI / 2, 0.8, 0], w: 0.6, color: 0x9fd0ff, label: 'Dawn (silent)', range: 3, view: 0.26, opacity: 0.25 });
  info('Dawn', 'Dawn', 'Spacecraft · NASA, Vesta and Ceres (2007–2018)', 'still circling Ceres, silent since 2018', 'See card.');
}

// ---------------------------------------------------------------- 6. Craft that circle the Sun: OSIRIS-APEX, STEREO-A, Ulysses
function sunCraft(key, file, size, label, posAU, linePts, color, dashed = true, bulk = 0) {
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePts.map(toScene)),
    dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.55 }) : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }));
  if (dashed) line.computeLineDistances(); SS.scene.add(line); SS.orbitLines?.push(line); SS.extras.scaleHide.push(line);
  const holder = new THREE.Group(); SS.scene.add(holder); SS.extras.scaleHide.push(holder);
  const craft = slot(key, file, size, undefined, bulk); holder.add(craft);
  sim.push(() => { holder.position.copy(toScene(posAU(SS.getDate()))); craft.lookAt(0, 0, 0); });
  nearLabel(holder, label, 0.5, key, 'small', 90);
  bodies[key] = { obj: holder, radius: size, view: size * 5, dir: t => t.clone().normalize().multiplyScalar(-0.6).add(V(0.5, 0.45, 0.3)).normalize() };
  special[key] = () => flyTo(key);
}
{ // OSIRIS-APEX: Earth flybys on 23 Sep 2025 and 17 Mar 2027, then Earth again with Apophis on 13 Apr 2029 (route fitted to those dates)
  const legs = [
    [{ a: 1.46010, e: 0.57418, i: 0, node: 0, peri: 267.403 }, 1754036732502, 1758585600000, 1805241600000],
    [{ a: 0.75851, e: 0.33561, i: 0, node: 0, peri: 11.286 }, 1796496637528, 1805241600000, 1870732800000]];
  const pos = t => { t = Math.min(legs[1][3], Math.max(legs[0][2], t)); const L = t <= legs[0][3] ? legs[0] : legs[1]; return keplerAU(L[0], L[1], t); };
  const pts = []; for (const L of legs) for (let k = 0; k <= 240; k++) pts.push(keplerAU(L[0], L[1], L[2] + (L[3] - L[2]) * k / 240));
  sunCraft('OSIRISAPEX', 'osirisrex.glb', 0.12, 'OSIRIS-APEX', pos, pts, 0xffb070);
  info('OSIRISAPEX', 'OSIRIS-APEX', 'Spacecraft · NASA, to the asteroid Apophis', 'circling the Sun, meeting Apophis in April 2029', 'See card.');
}
{ // STEREO-A: a slightly smaller orbit than Earth's, so it slowly laps us; it passed Earth in August 2023
  const pass = Date.UTC(2023, 7, 12), drift = 21.7;   // degrees a year ahead of Earth (approximate)
  const pos = t => { const d = (t - J2000) / DAY, L = (SS.astro.planetLon('Earth', d) + drift * (t - pass) / (365.25 * DAY)) * D2R; return V(0.96 * Math.cos(L), 0.96 * Math.sin(L), 0); };
  const pts = []; for (let k = 0; k <= 200; k++) { const L = k / 200 * 2 * Math.PI; pts.push(V(0.96 * Math.cos(L), 0.96 * Math.sin(L), 0)); }
  sunCraft('STEREOA', 'stereo.glb', 0.1, 'STEREO-A', pos, pts, 0x9fd0ff, false);
  info('STEREOA', 'STEREO-A', 'Spacecraft · NASA Sun observatory', 'circling the Sun just inside Earth’s orbit, ahead of us', 'See card.');
}
{ // Ulysses: the orbit over the Sun's poles (elements fitted to its 1992–2005 track); silent since 2009
  const el = { a: 3.375, e: 0.6032, i: 79.15, node: 338.15, peri: 358.92 }, tp = J2000 + 1.3906 * 365.25 * DAY;
  const pts = []; for (let k = 0; k <= 300; k++) pts.push(keplerAU(el, tp, tp + k / 300 * 2264.26 * DAY));
  sunCraft('Ulysses', 'ulysses.glb', 0.12, 'Ulysses (silent)', t => keplerAU(el, tp, Math.max(Date.UTC(1992, 1, 8), t)), pts, 0xc0c8e0, false, 0.06);
  info('Ulysses', 'Ulysses', 'Spacecraft · ESA/NASA solar polar explorer (1990–2009)', 'still circling the Sun over its poles, silent since 2009', 'See card.');
}

// ---------------------------------------------------------------- 7. Wind and DSCOVR at L1
{
  const L1 = bodies.LP_L1?.obj, earth = bodies.Earth.obj;
  const mk = (key, file, size, bulk) => { const h = new THREE.Group(), c = slot(key, file, size, undefined, bulk); h.add(c); SS.scene.add(h); SS.extras.scaleHide.push(h); return [h, c]; };
  const [wh, wc] = mk('Wind', 'wind.glb', 0.06, 0.12), [dh, dc] = mk('DSCOVR', 'dscovr.glb', 0.05);
  const lp = V();
  sim.push(() => {
    if (!L1) return; L1.getWorldPosition(lp);
    const toSun = lp.clone().negate().normalize(), side = V(0, 1, 0).cross(toSun).normalize(), up = toSun.clone().cross(side);
    const d = SS.getDate() / DAY, pw = d / 178 * 2 * Math.PI + 4.1, pd = d / 178 * 2 * Math.PI + 0.9;
    wh.position.copy(lp).addScaledVector(side, Math.cos(pw) * 0.95).addScaledVector(up, Math.sin(pw) * 0.45);
    dh.position.copy(lp).addScaledVector(side, Math.cos(pd) * 0.7).addScaledVector(up, Math.sin(pd) * 0.7);
    wc.lookAt(0, 0, 0); dc.lookAt(earth.getWorldPosition(cp));   // DSCOVR's camera looks back at Earth
  });
  nearLabel(wh, 'Wind', 0.3, 'Wind', 'craft', 8); nearLabel(dh, 'DSCOVR', 0.3, 'DSCOVR', 'craft', 8);
  bodies.Wind = { obj: wh, radius: 0.05, view: 0.32, dir: t => t.clone().normalize().multiplyScalar(-0.5).add(V(0.6, 0.5, 0.2)).normalize() };
  bodies.DSCOVR = { obj: dh, radius: 0.05, view: 0.3, dir: t => t.clone().normalize().multiplyScalar(-0.5).add(V(-0.5, 0.6, 0.2)).normalize() };
  special.Wind = () => flyTo('Wind'); special.DSCOVR = () => flyTo('DSCOVR');
  info('Wind', 'Wind', 'Spacecraft · NASA solar wind monitor', 'at Sun–Earth L1, 1.5 million km towards the Sun', 'See card.');
  info('DSCOVR', 'DSCOVR', 'Spacecraft · NOAA/NASA space weather and Earth camera', 'at Sun–Earth L1, looking back at Earth', 'See card.');
}

// ---------------------------------------------------------------- cards
Object.assign(D, {
  MRO: { intro: ['The Mars Reconnaissance Orbiter carries HiRISE, the most powerful camera ever sent to another planet, sharp enough to see a car-sized object on the ground. It maps the surface, watches the weather and relays messages from the rovers.',
      'Mars Reconnaissance Orbiter emporte HiRISE, la caméra la plus puissante jamais envoyée vers une autre planète, capable de distinguer au sol un objet de la taille d’une voiture. Il cartographie la surface, surveille la météo et relaie les messages des rovers.'],
    tiles: [T('Launch', 'Lancement', '12 Aug 2005 · Atlas V, Cape Canaveral', '12 août 2005 · Atlas V, cap Canaveral'),
      T('At Mars', 'À Mars', 'since 10 Mar 2006', 'depuis le 10 mars 2006'),
      T('Orbit', 'Orbite', 'about 250 to 320 km up, over the poles, every 112 min', 'environ 250 à 320 km, au-dessus des pôles, en 112 min'),
      T('Instruments', 'Instruments', 'HiRISE and CTX cameras, CRISM, SHARAD radar, a climate sounder', 'caméras HiRISE et CTX, CRISM, radar SHARAD, un sondeur climatique'),
      T('Model', 'Modèle', 'NASA 3D Resources', 'NASA 3D Resources')],
    facts: [['It photographed Curiosity hanging under its parachute as it came down to land in 2012.', 'Il a photographié Curiosity suspendu sous son parachute pendant sa descente en 2012.'],
      ['Its radar has found thick sheets of ice buried under the Martian surface.', 'Son radar a trouvé d’épaisses couches de glace enfouies sous la surface martienne.']] },

  Odyssey: { intro: ['2001 Mars Odyssey is the longest-working spacecraft ever at another planet: it reached Mars on 24 October 2001 and passed 25 years in orbit in October 2026. It found that water ice lies just under the surface over large parts of Mars.',
      '2001 Mars Odyssey est l’engin qui travaille depuis le plus longtemps autour d’une autre planète : il a atteint Mars le 24 octobre 2001 et a dépassé 25 ans en orbite en octobre 2026. Il a découvert que de la glace d’eau se cache juste sous la surface sur une grande partie de Mars.'],
    tiles: [T('Launch', 'Lancement', '7 Apr 2001 · Delta II, Cape Canaveral', '7 avr. 2001 · Delta II, cap Canaveral'),
      T('At Mars', 'À Mars', 'since 24 Oct 2001', 'depuis le 24 oct. 2001'),
      T('Record', 'Record', 'longest-serving spacecraft at Mars since Dec 2010', 'plus long service autour de Mars depuis déc. 2010'),
      T('Orbit', 'Orbite', 'about 400 km up, over the poles', 'environ 400 km, au-dessus des pôles'),
      T('Name', 'Nom', 'a nod to the film "2001: A Space Odyssey"', 'un clin d’œil au film « 2001, l’Odyssée de l’espace »')],
    facts: [['It has no fuel gauge: engineers estimate what is left from how fast the tanks warm up.', 'Il n’a pas de jauge de carburant : les ingénieurs estiment ce qui reste d’après la vitesse à laquelle les réservoirs se réchauffent.'],
      ['It still relays data from the rovers on the ground, though its fuel is running low.', 'Il relaie encore les données des rovers au sol, même si son carburant s’épuise.']] },

  MAVEN: { closed: true, intro: ['MAVEN studied how Mars lost most of its air to space. It showed that the solar wind, hitting a planet with no global magnetic field, stripped the atmosphere away over billions of years. Contact was lost on 6 December 2025 and NASA ended the mission in June 2026; it is still circling Mars, silent.',
      'MAVEN étudiait comment Mars a perdu la plus grande partie de son air dans l’espace. Il a montré que le vent solaire, frappant une planète sans champ magnétique global, a arraché l’atmosphère pendant des milliards d’années. Le contact a été perdu le 6 décembre 2025 et la NASA a mis fin à la mission en juin 2026 ; il tourne toujours autour de Mars, silencieux.'],
    tiles: [T('Launch', 'Lancement', '18 Nov 2013 · Atlas V, Cape Canaveral', '18 nov. 2013 · Atlas V, cap Canaveral'),
      T('At Mars', 'À Mars', '21 Sep 2014', '21 sept. 2014'),
      T('Last contact', 'Dernier contact', '6 Dec 2025, behind Mars', '6 déc. 2025, derrière Mars'),
      T('Mission ended', 'Fin de mission', 'June 2026', 'juin 2026'),
      T('Orbit', 'Orbite', 'a long loop dipping low into the upper air', 'une longue boucle plongeant dans la haute atmosphère')],
    facts: [['Investigators think it began spinning unexpectedly, so its solar panels could no longer charge the batteries.', 'Les enquêteurs pensent qu’il s’est mis à tourner sur lui-même, si bien que ses panneaux solaires ne pouvaient plus recharger les batteries.'],
      ['It was the first mission launched entirely to study Mars’s upper atmosphere.', 'Ce fut la première mission lancée uniquement pour étudier la haute atmosphère de Mars.']] },

  LRO: { intro: ['The Lunar Reconnaissance Orbiter has mapped the Moon in more detail than any spacecraft before it. Its pictures help choose landing sites for the Artemis astronauts, and they show the Apollo landers still standing where they were left.',
      'Lunar Reconnaissance Orbiter a cartographié la Lune plus en détail que tout autre engin avant lui. Ses images aident à choisir les sites d’atterrissage des astronautes d’Artemis, et montrent les modules Apollo toujours là où ils ont été laissés.'],
    tiles: [T('Launch', 'Lancement', '18 Jun 2009 · Atlas V, with LCROSS', '18 juin 2009 · Atlas V, avec LCROSS'),
      T('Orbit', 'Orbite', 'low and over the poles', 'basse, au-dessus des pôles'),
      T('Cameras', 'Caméras', 'LROC, sharp enough to see rover tracks', 'LROC, assez précise pour voir des traces de rover'),
      T('Thermometer', 'Thermomètre', 'Diviner, which found some of the coldest places known', 'Diviner, qui a trouvé certains des endroits les plus froids connus')],
    facts: [['In shadowed craters near the poles it measured temperatures around −240 °C, colder than Pluto’s surface.', 'Dans des cratères à l’ombre près des pôles, il a mesuré des températures d’environ −240 °C, plus froides que la surface de Pluton.'],
      ['Its photos show the tracks the Apollo astronauts left on foot and in their Moon buggies.', 'Ses photos montrent les traces laissées par les astronautes d’Apollo à pied et en jeep lunaire.']] },

  Cassini: { closed: true, intro: ['Cassini spent 13 years orbiting Saturn. It dropped Europe’s Huygens probe onto Titan, found geysers of water on the little moon Enceladus, and ended by diving 22 times between Saturn and its rings before plunging into the planet on 15 September 2017. Choosing it takes you back to its time at Saturn.',
      'Cassini a passé 13 ans en orbite autour de Saturne. Il a largué la sonde européenne Huygens sur Titan, découvert des geysers d’eau sur la petite lune Encelade, puis a plongé 22 fois entre Saturne et ses anneaux avant de se jeter dans la planète le 15 septembre 2017. Le choisir vous ramène à son époque autour de Saturne.'],
    tiles: [T('Launch', 'Lancement', '15 Oct 1997 · Titan IVB, Cape Canaveral', '15 oct. 1997 · Titan IVB, cap Canaveral'),
      T('Saturn orbit', 'Orbite de Saturne', '1 Jul 2004', '1er juil. 2004'),
      T('Huygens on Titan', 'Huygens sur Titan', '14 Jan 2005', '14 janv. 2005'),
      T('End', 'Fin', '15 Sep 2017, into Saturn', '15 sept. 2017, dans Saturne'),
      T('Partners', 'Partenaires', 'NASA, ESA and the Italian Space Agency', 'NASA, ESA et l’Agence spatiale italienne'),
      T('Orbit shown', 'Orbite affichée', 'the Grand Finale loops, drawn smaller', 'les boucles du Grand Final, dessinées plus petites')],
    facts: [['It was steered into Saturn on purpose so it could never crash onto Enceladus or Titan, which might harbour life.', 'Il a été dirigé exprès dans Saturne pour ne jamais s’écraser sur Encelade ou Titan, qui pourraient abriter la vie.'],
      ['It found seas of liquid methane and ethane near Titan’s north pole.', 'Il a découvert des mers de méthane et d’éthane liquides près du pôle Nord de Titan.']] },

  Galileo: { closed: true, intro: ['Galileo was the first spacecraft to orbit Jupiter. It dropped a probe into Jupiter’s clouds and found strong signs of a salty ocean under Europa’s ice, all despite its main antenna failing to open. It was sent into Jupiter on 21 September 2003. Choosing it takes you back to its years at Jupiter.',
      'Galileo fut le premier engin à se mettre en orbite autour de Jupiter. Il a largué une sonde dans les nuages de Jupiter et trouvé de solides indices d’un océan salé sous la glace d’Europe, malgré son antenne principale qui ne s’est jamais déployée. Il a été envoyé dans Jupiter le 21 septembre 2003. Le choisir vous ramène à ses années autour de Jupiter.'],
    tiles: [T('Launch', 'Lancement', '18 Oct 1989 · Space Shuttle Atlantis', '18 oct. 1989 · navette Atlantis'),
      T('Jupiter orbit', 'Orbite de Jupiter', '7 Dec 1995, the same day its probe dived in', '7 déc. 1995, le jour où sa sonde a plongé'),
      T('End', 'Fin', '21 Sep 2003, into Jupiter', '21 sept. 2003, dans Jupiter'),
      T('On the way', 'En route', 'first close-up of an asteroid, Gaspra (1991)', 'premier gros plan d’un astéroïde, Gaspra (1991)'),
      T('Orbit shown', 'Orbite affichée', 'a typical loop, drawn smaller', 'une boucle typique, dessinée plus petite')],
    facts: [['It found Dactyl, the first moon ever seen around an asteroid, circling Ida.', 'Il a découvert Dactyl, la première lune jamais vue autour d’un astéroïde, en orbite autour d’Ida.'],
      ['In 1994 it had a direct view of comet Shoemaker–Levy 9 smashing into Jupiter.', 'En 1994, il a vu directement la comète Shoemaker-Levy 9 s’écraser sur Jupiter.']] },

  MESSENGER: { closed: true, intro: ['MESSENGER was the first spacecraft to orbit Mercury. It mapped the whole planet and found water ice hidden in craters near the poles that never see sunlight. Out of fuel, it crashed into Mercury on 30 April 2015. Choosing it takes you back to its years in orbit.',
      'MESSENGER fut le premier engin à se mettre en orbite autour de Mercure. Il a cartographié toute la planète et trouvé de la glace d’eau cachée dans des cratères proches des pôles qui ne voient jamais le Soleil. À court de carburant, il s’est écrasé sur Mercure le 30 avril 2015. Le choisir vous ramène à ses années en orbite.'],
    tiles: [T('Launch', 'Lancement', '3 Aug 2004 · Delta II, Cape Canaveral', '3 août 2004 · Delta II, cap Canaveral'),
      T('Mercury orbit', 'Orbite de Mercure', '18 Mar 2011', '18 mars 2011'),
      T('End', 'Fin', '30 Apr 2015, impact on Mercury', '30 avr. 2015, impact sur Mercure'),
      T('Sunshade', 'Pare-soleil', 'a ceramic-cloth shield facing the Sun', 'un bouclier en tissu céramique face au Soleil'),
      T('Orbit shown', 'Orbite affichée', 'a long loop over the poles, drawn smaller', 'une longue boucle au-dessus des pôles, dessinée plus petite')],
    facts: [['It took six and a half years and six planet flybys to slow down enough to stay at Mercury.', 'Il lui a fallu six ans et demi et six survols de planètes pour ralentir assez et rester autour de Mercure.'],
      ['BepiColombo, arriving in November 2026, is the second mission ever to orbit Mercury.', 'BepiColombo, qui arrive en novembre 2026, est la deuxième mission à se mettre en orbite autour de Mercure.']] },

  Dawn: { closed: true, intro: ['Dawn was the first spacecraft to orbit two different worlds beyond Earth: the giant asteroid Vesta, then the dwarf planet Ceres. It flew on gentle ion engines. It ran out of fuel on 1 November 2018 and will keep circling Ceres silently for decades.',
      'Dawn fut le premier engin à orbiter autour de deux mondes différents au-delà de la Terre : l’astéroïde géant Vesta, puis la planète naine Cérès. Il volait grâce à de doux moteurs ioniques. Il est tombé à court de carburant le 1er novembre 2018 et continuera de tourner autour de Cérès en silence pendant des décennies.'],
    tiles: [T('Launch', 'Lancement', '27 Sep 2007 · Delta II, Cape Canaveral', '27 sept. 2007 · Delta II, cap Canaveral'),
      T('Vesta', 'Vesta', 'in orbit Jul 2011 to Sep 2012', 'en orbite de juil. 2011 à sept. 2012'),
      T('Ceres', 'Cérès', 'in orbit since 6 Mar 2015', 'en orbite depuis le 6 mars 2015'),
      T('End', 'Fin', '1 Nov 2018, out of fuel', '1er nov. 2018, à court de carburant'),
      T('Wingspan', 'Envergure', 'about 20 m with its solar panels', 'environ 20 m avec ses panneaux solaires'),
      T('Orbit shown', 'Orbite affichée', 'its last stretched orbit, drawn smaller', 'sa dernière orbite allongée, dessinée plus petite')],
    facts: [['The bright spots in Ceres’s Occator crater turned out to be salt left behind by salty water.', 'Les taches brillantes du cratère Occator, sur Cérès, se sont révélées être du sel laissé par de l’eau salée.'],
      ['Its last orbit swooped to about 35 km above Ceres, giving its sharpest pictures.', 'Sa dernière orbite descendait à environ 35 km au-dessus de Cérès, offrant ses images les plus nettes.']] },

  OSIRISAPEX: { intro: ['This is the spacecraft that, as OSIRIS-REx, brought pieces of the asteroid Bennu back to Earth in 2023. Renamed OSIRIS-APEX, it is now heading for Apophis, a 340 m asteroid that will pass closer to Earth than some satellites on 13 April 2029. It will study how that close pass shakes and changes the asteroid.',
      'C’est l’engin qui, sous le nom d’OSIRIS-REx, a rapporté sur Terre des morceaux de l’astéroïde Bennu en 2023. Rebaptisé OSIRIS-APEX, il se dirige maintenant vers Apophis, un astéroïde de 340 m qui passera plus près de la Terre que certains satellites le 13 avril 2029. Il étudiera comment ce passage rapproché secoue et transforme l’astéroïde.'],
    tiles: [T('Launch', 'Lancement', '8 Sep 2016 · Atlas V, Cape Canaveral', '8 sept. 2016 · Atlas V, cap Canaveral'),
      T('Bennu sample', 'Échantillon de Bennu', 'landed in Utah, 24 Sep 2023', 'posé dans l’Utah, le 24 sept. 2023'),
      T('Earth flybys', 'Survols de la Terre', '23 Sep 2025; next planned 17 Mar 2027', '23 sept. 2025 ; le prochain prévu le 17 mars 2027'),
      T('Apophis', 'Apophis', 'passes 32,000 km from Earth, 13 Apr 2029', 'passe à 32 000 km de la Terre le 13 avr. 2029'),
      T('At Apophis', 'À Apophis', 'about 18 months of study', 'environ 18 mois d’étude'),
      T('Route shown', 'Trajet affiché', 'fitted to the flyby dates, approximate', 'calé sur les dates de survol, approximatif')],
    facts: [['It passes Earth just behind Apophis in 2029, using Earth’s pull to fall in beside the asteroid.', 'En 2029, il passe près de la Terre juste derrière Apophis, en utilisant l’attraction terrestre pour se placer à côté de l’astéroïde.'],
      ['It can’t bring another sample home, but it plans to fire its thrusters at the surface to stir up the dust.', 'Il ne peut pas rapporter un autre échantillon, mais il prévoit de souffler la surface avec ses propulseurs pour soulever la poussière.']] },

  Wind: { intro: ['Wind has been measuring the solar wind, the stream of particles blowing off the Sun, for more than 30 years. From L1 it sees what is heading our way before it reaches Earth.',
      'Wind mesure le vent solaire, ce flot de particules soufflé par le Soleil, depuis plus de 30 ans. Depuis L1, il voit ce qui arrive vers nous avant que cela n’atteigne la Terre.'],
    tiles: [T('Launch', 'Lancement', '1 Nov 1994 · Delta II, Cape Canaveral', '1er nov. 1994 · Delta II, cap Canaveral'),
      T('At L1', 'À L1', 'since 2004', 'depuis 2004'),
      T('Spins', 'Rotation', 'about once every 3 seconds', 'environ un tour toutes les 3 secondes'),
      T('Model', 'Modèle', 'NASA 3D Resources', 'NASA 3D Resources')],
    facts: [['Before settling at L1 it flew huge looping orbits to explore Earth’s magnetic bubble.', 'Avant de s’installer à L1, il a parcouru d’immenses orbites en boucle pour explorer la bulle magnétique de la Terre.'],
      ['It is one of the oldest NASA spacecraft still working.', 'C’est l’un des plus vieux engins de la NASA encore en service.']] },

  DSCOVR: { intro: ['DSCOVR (Deep Space Climate Observatory) sits at L1 for two jobs: warning of solar storms heading for Earth, and taking pictures of the whole sunlit side of our planet with its EPIC camera, several times a day.',
      'DSCOVR (observatoire climatique de l’espace lointain) se tient à L1 pour deux missions : alerter des tempêtes solaires qui arrivent vers la Terre, et photographier toute la face éclairée de notre planète avec sa caméra EPIC, plusieurs fois par jour.'],
    tiles: [T('Launch', 'Lancement', '11 Feb 2015 · Falcon 9, Cape Canaveral', '11 févr. 2015 · Falcon 9, cap Canaveral'),
      T('At L1', 'À L1', 'since June 2015', 'depuis juin 2015'),
      T('Run by', 'Exploité par', 'NOAA, with NASA', 'la NOAA, avec la NASA'),
      T('Warning time', 'Délai d’alerte', 'about 15 to 60 minutes before a storm hits', 'environ 15 à 60 minutes avant l’arrivée d’une tempête')],
    facts: [['It was first proposed in 1998 as "Triana", then spent years in storage before finally flying.', 'Il a été proposé en 1998 sous le nom de « Triana », puis est resté des années en entrepôt avant de voler enfin.'],
      ['EPIC has filmed the Moon crossing in front of the Earth, its far side lit by the Sun.', 'EPIC a filmé la Lune passant devant la Terre, sa face cachée éclairée par le Soleil.']] },

  STEREOA: { intro: ['STEREO-A watches the Sun from a different angle to Earth, so together with telescopes at home it sees the Sun in 3D. Its orbit is a little smaller than ours, so it slowly pulls ahead; in August 2023 it lapped Earth and came back past us after 17 years.',
      'STEREO-A observe le Soleil sous un autre angle que la Terre : avec les télescopes terrestres, il le voit en 3D. Son orbite est un peu plus petite que la nôtre, alors il prend lentement de l’avance ; en août 2023, il a repassé la Terre après 17 ans.'],
    tiles: [T('Launch', 'Lancement', '25 Oct 2006 · Delta II, with its twin STEREO-B', '25 oct. 2006 · Delta II, avec son jumeau STEREO-B'),
      T('Twin', 'Jumeau', 'STEREO-B lost contact in 2014', 'STEREO-B a perdu le contact en 2014'),
      T('Year', 'Année', 'about 346 days', 'environ 346 jours'),
      T('Position shown', 'Position affichée', 'drifting ahead of Earth, approximate', 'en avance sur la Terre, approximative')],
    facts: [['In February 2011 the two STEREOs were on opposite sides of the Sun, giving the first view of the whole Sun at once.', 'En février 2011, les deux STEREO étaient de part et d’autre du Soleil, offrant la première vue du Soleil tout entier d’un coup.'],
      ['Seeing storms side-on lets forecasters judge how fast they are really heading for Earth.', 'Voir les tempêtes de profil permet aux prévisionnistes de juger leur vraie vitesse vers la Terre.']] },

  Ulysses: { closed: true, intro: ['Ulysses was the first spacecraft to fly over the Sun’s north and south poles. To leave the plane of the planets it first flew to Jupiter, whose gravity flung it onto a steep orbit tilted at almost 80°. It worked for nearly 19 years, until 30 June 2009, and is still circling the Sun.',
      'Ulysses fut le premier engin à survoler les pôles Nord et Sud du Soleil. Pour quitter le plan des planètes, il est d’abord allé vers Jupiter, dont la gravité l’a projeté sur une orbite très inclinée, à presque 80°. Il a fonctionné près de 19 ans, jusqu’au 30 juin 2009, et tourne toujours autour du Soleil.'],
    tiles: [T('Launch', 'Lancement', '6 Oct 1990 · Space Shuttle Discovery', '6 oct. 1990 · navette Discovery'),
      T('Jupiter flyby', 'Survol de Jupiter', '8 Feb 1992', '8 févr. 1992'),
      T('Orbit', 'Orbite', '1.35 to 5.4 AU from the Sun, every 6.2 years', '1,35 à 5,4 UA du Soleil, en 6,2 ans'),
      T('Tilt', 'Inclinaison', 'about 79° to the planets’ plane', 'environ 79° par rapport au plan des planètes'),
      T('Partners', 'Partenaires', 'ESA and NASA', 'ESA et NASA'),
      T('End', 'Fin', '30 Jun 2009', '30 juin 2009')],
    facts: [['It showed that the solar wind blows much faster over the Sun’s poles than near its equator.', 'Il a montré que le vent solaire souffle bien plus vite au-dessus des pôles du Soleil que près de son équateur.'],
      ['By luck it flew through the long tails of comets Hyakutake (1996) and McNaught (2007).', 'Par chance, il a traversé les longues queues des comètes Hyakutake (1996) et McNaught (2007).']] },
});

// ---------------------------------------------------------------- menu
{
  const groups = [...focusSel.querySelectorAll('optgroup')], after = groups.find(g => g.label === '🛸 Missions in flight');
  const og = document.createElement('optgroup'); og.label = '🛰 NASA science fleet';
  after ? after.after(og) : focusSel.appendChild(og);
  for (const [k, t] of [['NewTour', '▶ Tour: the new missions'], ['MRO', 'Mars Reconnaissance Orbiter'], ['Odyssey', '2001 Mars Odyssey'], ['MAVEN', 'MAVEN (silent since 2025)'], ['LRO', 'Lunar Reconnaissance Orbiter'],
    ['OSIRISAPEX', 'OSIRIS-APEX, to Apophis'], ['Dawn', 'Dawn at Ceres (silent)'], ['Wind', 'Wind at L1'], ['DSCOVR', 'DSCOVR at L1'], ['STEREOA', 'STEREO-A, ahead of Earth'],
    ['Ulysses', 'Ulysses, over the Sun’s poles (silent)'], ['Cassini', 'Cassini at Saturn (1997–2017)'], ['Galileo', 'Galileo at Jupiter (1989–2003)'], ['MESSENGER', 'MESSENGER at Mercury (2004–2015)']]) {
    if (k !== 'NewTour' && !bodies[k]) continue; const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); }
}

// ---------------------------------------------------------------- guided tour of the newest missions (today's positions)
{
  const STOPS = [
    ['Juice', ['Juice', 'ESA, on its way to Jupiter’s icy moons'], ['Juice', 'ESA, en route vers les lunes glacées de Jupiter']],
    ['Clipper', ['Europa Clipper', 'NASA’s biggest planetary spacecraft, heading for Europa’s ocean'], ['Europa Clipper', 'le plus grand engin planétaire de la NASA, vers l’océan d’Europe']],
    ['BepiColombo', ['BepiColombo', 'Europe and Japan, arriving at Mercury'], ['BepiColombo', 'l’Europe et le Japon, arrivée à Mercure']],
    ['SolarOrbiter', ['Solar Orbiter', 'the first close look at the Sun’s poles'], ['Solar Orbiter', 'le premier regard rapproché sur les pôles du Soleil']],
    ['Aditya', ['Aditya-L1', 'India’s Sun watcher at L1'], ['Aditya-L1', 'l’observatoire solaire de l’Inde à L1']],
    ['DSCOVR', ['DSCOVR', 'a camera watching the whole sunlit Earth from L1'], ['DSCOVR', 'une caméra qui regarde toute la Terre éclairée depuis L1']],
    ['Smile', ['Smile', 'ESA and China, filming Earth’s magnetic shield'], ['Smile', 'l’ESA et la Chine, filmant le bouclier magnétique de la Terre']],
    ['Euclid', ['Euclid', 'mapping dark matter from L2'], ['Euclid', 'cartographie la matière noire depuis L2']],
    ['LRO', ['Lunar Reconnaissance Orbiter', 'scouting the Moon for Artemis'], ['Lunar Reconnaissance Orbiter', 'repère la Lune pour Artemis']],
    ['Tianwen2', ['Tianwen-2', 'China’s visit to Earth’s little quasi-moon'], ['Tianwen-2', 'la visite chinoise à la petite quasi-lune de la Terre']],
    ['MRO', ['Mars Reconnaissance Orbiter', 'the sharpest camera ever sent to another planet'], ['Mars Reconnaissance Orbiter', 'la caméra la plus précise jamais envoyée vers une autre planète']],
    ['Odyssey', ['2001 Mars Odyssey', '25 years at Mars, a record'], ['2001 Mars Odyssey', '25 ans autour de Mars, un record']],
    ['Hera', ['Hera', 'ESA, on its way to the asteroid DART struck'], ['Hera', 'ESA, en route vers l’astéroïde percuté par DART']],
    ['PsycheProbe', ['Psyche', 'electric thrusters pushing towards a metal world'], ['Psyche', 'des propulseurs électriques vers un monde de métal']],
    ['OSIRISAPEX', ['OSIRIS-APEX', 'after Bennu, heading for Apophis'], ['OSIRIS-APEX', 'après Bennu, cap sur Apophis']],
    ['Lucy', ['Lucy', 'off to Jupiter’s Trojan asteroids'], ['Lucy', 'en route vers les astéroïdes troyens de Jupiter']],
    ['Voyager1', ['Voyager 1', 'now more than one light-day from Earth'], ['Voyager 1', 'désormais à plus d’un jour-lumière de la Terre']],
  ];
  special.NewTour = () => {
    const t = SS.getDate(); if (Math.abs(t - Date.now()) > 30 * DAY) SS.setDate(Date.now());
    const list = STOPS.filter(([k]) => bodies[k]).map(([k, en, f]) => [k, ...(fr() ? f : en), 9]);
    for (const [k] of list) LOAD[k]?.();
    SS.startTour(list); const b = $('tourBtn'); if (b) b.textContent = (SS.tr || (x => x))('■ Stop tour');
  };
}

// ---------------------------------------------------------------- French
SS.i18nAdd?.({
  ui: { '🛰 NASA science fleet': '🛰 Flotte scientifique de la NASA', '▶ Tour: the new missions': '▶ Visite : les nouvelles missions' },
  name: { '🛰 NASA science fleet': '🛰 Flotte scientifique de la NASA', '▶ Tour: the new missions': '▶ Visite : les nouvelles missions', 'MAVEN (silent since 2025)': 'MAVEN (silencieux depuis 2025)', 'MAVEN (silent)': 'MAVEN (silencieux)',
    'OSIRIS-APEX, to Apophis': 'OSIRIS-APEX, vers Apophis', 'Dawn at Ceres (silent)': 'Dawn à Cérès (silencieux)', 'Dawn (silent)': 'Dawn (silencieux)', 'Wind at L1': 'Wind au point L1', 'DSCOVR at L1': 'DSCOVR au point L1',
    'STEREO-A, ahead of Earth': 'STEREO-A, en avance sur la Terre', 'Ulysses, over the Sun’s poles (silent)': 'Ulysses, au-dessus des pôles du Soleil (silencieux)', 'Ulysses (silent)': 'Ulysses (silencieux)',
    'Cassini at Saturn (1997–2017)': 'Cassini à Saturne (1997–2017)', 'Galileo at Jupiter (1989–2003)': 'Galileo à Jupiter (1989–2003)', 'MESSENGER at Mercury (2004–2015)': 'MESSENGER à Mercure (2004–2015)' },
  cat: { 'Spacecraft · NASA Mars orbiter': 'Engin spatial · orbiteur martien de la NASA', 'Spacecraft · NASA Mars orbiter, contact lost': 'Engin spatial · orbiteur martien de la NASA, contact perdu',
    'Spacecraft · NASA Moon orbiter': 'Engin spatial · orbiteur lunaire de la NASA', 'Spacecraft · NASA/ESA/ASI Saturn orbiter (1997–2017)': 'Engin spatial · orbiteur de Saturne NASA/ESA/ASI (1997–2017)',
    'Spacecraft · NASA Jupiter orbiter (1989–2003)': 'Engin spatial · orbiteur de Jupiter de la NASA (1989–2003)', 'Spacecraft · NASA Mercury orbiter (2004–2015)': 'Engin spatial · orbiteur de Mercure de la NASA (2004–2015)',
    'Spacecraft · NASA, Vesta and Ceres (2007–2018)': 'Engin spatial · NASA, Vesta et Cérès (2007–2018)', 'Spacecraft · NASA, to the asteroid Apophis': 'Engin spatial · NASA, vers l’astéroïde Apophis',
    'Spacecraft · NASA Sun observatory': 'Engin spatial · observatoire solaire de la NASA', 'Spacecraft · ESA/NASA solar polar explorer (1990–2009)': 'Engin spatial · explorateur des pôles solaires ESA/NASA (1990–2009)',
    'Spacecraft · NASA solar wind monitor': 'Engin spatial · sentinelle du vent solaire de la NASA', 'Spacecraft · NOAA/NASA space weather and Earth camera': 'Engin spatial · météo spatiale et caméra terrestre NOAA/NASA' },
  dist: { 'in a low orbit around Mars, about 300 km up': 'en orbite basse autour de Mars, à environ 300 km', 'in orbit around Mars since October 2001': 'en orbite autour de Mars depuis octobre 2001',
    'still circling Mars, silent since 6 Dec 2025': 'tourne toujours autour de Mars, silencieux depuis le 6 déc. 2025', 'in a low polar orbit around the Moon': 'en orbite polaire basse autour de la Lune',
    'orbited Saturn 2004–2017; shown on its last loops': 'en orbite autour de Saturne de 2004 à 2017 ; montré sur ses dernières boucles', 'orbited Jupiter 1995–2003': 'en orbite autour de Jupiter de 1995 à 2003',
    'orbited Mercury 2011–2015': 'en orbite autour de Mercure de 2011 à 2015', 'still circling Ceres, silent since 2018': 'tourne toujours autour de Cérès, silencieux depuis 2018',
    'circling the Sun, meeting Apophis in April 2029': 'en orbite autour du Soleil, rendez-vous avec Apophis en avril 2029', 'circling the Sun just inside Earth’s orbit, ahead of us': 'tourne autour du Soleil juste à l’intérieur de l’orbite terrestre, devant nous',
    'still circling the Sun over its poles, silent since 2009': 'tourne toujours autour du Soleil en passant au-dessus de ses pôles, silencieux depuis 2009',
    'at Sun–Earth L1, 1.5 million km towards the Sun': 'au point L1 Soleil–Terre, à 1,5 million de km vers le Soleil', 'at Sun–Earth L1, looking back at Earth': 'au point L1 Soleil–Terre, tourné vers la Terre' },
});
