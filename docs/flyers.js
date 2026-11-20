// =====================================================================
// Spacecraft flying now: Europa Clipper, Psyche, Lucy, Tianwen-2; Sun watchers at L1 (Aditya-L1, SOHO);
// the Lunar Gateway design (paused in 2026); far dwarf planets Sedna, Gonggong and Quaoar.
// Routes: coasting arcs fitted to the real flyby dates (Psyche: a smooth spiral, as it flies on electric thrusters).
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildClipper, buildPsyche, buildLucy, buildTianwen2, buildAditya, buildSOHO, buildGateway } from './craftmodels.js?v=54';
const SS = window.SS;
const { bodies, sim, flyTo, focusSel } = SS;
const { info } = SS.cosmos;
const { smallBody, nearLabel, PL, auToScene, lumpy } = SS.extras;
const special = SS.more.special, D = SS.more.cards2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180, T = (l, lf, v, vf) => [l, lf, v, vf];
const wp = V(), cp = V();
const kepler = (M, e) => { let E = e < 0.8 ? M : Math.PI; for (let k = 0; k < 40; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; };
const toScene = p => { const r = p.length(); return V(p.x, p.z, -p.y).normalize().multiplyScalar(auToScene(r)); };   // ecliptic AU → scene
const keplerAU = ({ a, e, i, node, peri }, tp, t) => {   // heliocentric ecliptic position (AU) at time t (ms)
  const n = 0.01720209895 / Math.pow(a, 1.5), M = (((n * (t - tp) / 864e5) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const E = kepler(M, e), nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)), r = a * (1 - e * Math.cos(E));
  const u = peri * D2R + nu, O = node * D2R, I = i * D2R;
  return V(r * (Math.cos(O) * Math.cos(u) - Math.sin(O) * Math.sin(u) * Math.cos(I)), r * (Math.sin(O) * Math.cos(u) + Math.cos(O) * Math.sin(u) * Math.cos(I)), r * Math.sin(u) * Math.sin(I));
};
const scaled = (o, s) => { o.scale.setScalar(s); return o; };
// a craft that follows a list of legs ({pos(t) → AU vector, t1, t2}); the route is drawn dashed, the craft stays at the ends outside the dates
function routeCraft(key, legs, model, scale, color, label) {
  const pts = []; for (const L of legs) for (let k = 0; k <= 160; k++) pts.push(toScene(L.pos(L.t1 + (L.t2 - L.t1) * k / 160)));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.6 }));
  line.computeLineDistances(); SS.scene.add(line); SS.orbitLines?.push(line); SS.extras.scaleHide.push(line);
  const holder = new THREE.Group(); SS.scene.add(holder); SS.extras.scaleHide.push(holder);
  const craft = scaled(model, scale); holder.add(craft);
  const t0 = legs[0].t1, tN = legs[legs.length - 1].t2;
  sim.push(() => { const t = Math.min(tN, Math.max(t0, SS.getDate())); const L = legs.find(l => t <= l.t2) || legs[legs.length - 1];
    holder.position.copy(toScene(L.pos(t))); craft.lookAt(0, 0, 0); });
  nearLabel(holder, label, 0.5, key, 'small', 90);
  bodies[key] = { obj: holder, radius: 0.3, view: 0.75, dir: t => t.clone().normalize().add(V(0.3, 0.5, 0)).normalize() };
  special[key] = () => flyTo(key);
  return holder;
}
const kleg = (el, tp, t1, t2) => ({ t1, t2, pos: t => keplerAU(el, tp, t) });

// ---------------------------------------------------------------- 1. Europa Clipper: Mars (1 Mar 2025) → Earth (3 Dec 2026) → Jupiter (11 Apr 2030)
// NASA's own 3D model loads the first time Clipper is chosen; far away, the light hand-built model is drawn instead
const clipHand = buildClipper(), clipModel = new THREE.Group(); clipModel.add(clipHand);
{ let state = 0;
  const load = async () => { if (state) return; state = 1;
    const [{ GLTFLoader }, { DRACOLoader }] = await Promise.all([import('three/addons/loaders/GLTFLoader.js'), import('three/addons/loaders/DRACOLoader.js')]);
    const l = new GLTFLoader(), d = new DRACOLoader(); d.setDecoderPath('three/examples/jsm/libs/draco/gltf/'); l.setDRACOLoader(d);
    l.load('models/clipper.glb', g => { const m = g.scene; m.rotation.x = -Math.PI / 2;   // NASA's model has its arrays facing +Z; ours face +Y
      m.traverse(o => { if (!o.isMesh) return; for (const mt of [].concat(o.material)) { mt.metalness = Math.min(mt.metalness ?? 0, 0.35); mt.emissive?.setHex(0x161616); } });
      const lod = new THREE.LOD(); clipModel.remove(clipHand); lod.addLevel(m, 0); lod.addLevel(clipHand, 3); clipModel.add(lod); state = 2;
    }, undefined, () => { state = 0; }); };
  const prev = SS.onFocus; SS.onFocus = key => { if (key === 'Clipper') load(); prev(key); }; }
routeCraft('Clipper', [
  kleg({ a: 1.5990, e: 0.4754, i: 2.043, node: 71.437, peri: 302.428 }, 1728957974649, 1740851820000, 1796332500000),
  kleg({ a: 3.2289, e: 0.7108, i: 2.744, node: 71.414, peri: 330.730 }, 1794501066905, 1796332500000, 1902096000000),
], clipModel, 0.012, 0x8fd0ff, 'Europa Clipper');
bodies.Clipper.dir = t => t.clone().normalize().negate().add(V(0.35, 0.55, 0.2)).normalize();   // look from the sunny side
info('Clipper', 'Europa Clipper', 'Spacecraft · NASA, to Jupiter’s moon Europa', 'on its way to Jupiter, arriving April 2030', 'See card.');

// ---------------------------------------------------------------- 2. Psyche: a spiral out from Mars (15 May 2026) to the asteroid Psyche (2029)
{
  const t1 = 1778846400000, t2 = 1880236800000, r1 = 1.3990, r2 = 2.7259, l1 = 7.697 * D2R, b1 = -1.231 * D2R, b2 = 0.904 * D2R, dth = 305.4 * D2R;
  const N = 400, cum = [0]; for (let k = 0; k < N; k++) { const s = (k + 0.5) / N, r = r1 + (r2 - r1) * (3 * s * s - 2 * s * s * s); cum.push(cum[k] + Math.pow(r, -1.5)); }
  const pos = t => { const s = Math.min(1, Math.max(0, (t - t1) / (t2 - t1))), f = s * N, k = Math.min(N - 1, Math.floor(f));
    const c = (cum[k] + (cum[k + 1] - cum[k]) * (f - k)) / cum[N], r = r1 + (r2 - r1) * (3 * s * s - 2 * s * s * s), l = l1 + dth * c, b = b1 + (b2 - b1) * s;
    return V(r * Math.cos(b) * Math.cos(l), r * Math.cos(b) * Math.sin(l), r * Math.sin(b)); };
  routeCraft('PsycheProbe', [{ t1, t2, pos }], buildPsyche(), 0.012, 0xffc070, 'Psyche (spacecraft)');
  info('PsycheProbe', 'Psyche (spacecraft)', 'Spacecraft · NASA, to the metal asteroid Psyche', 'on its way to the asteroid belt, arriving 2029', 'See card.');
}

// ---------------------------------------------------------------- 3. Lucy: Earth (12 Dec 2024) → the Trojan Eurybates (12 Aug 2027)
routeCraft('Lucy', [kleg({ a: 3.1316, e: 0.7224, i: 1.534, node: 80.225, peri: 316.003 }, 1731374462303, 1733961600000, 1818028800000)],
  buildLucy(), 0.014, 0xc8a0ff, 'Lucy');
info('Lucy', 'Lucy', 'Spacecraft · NASA, to Jupiter’s Trojan asteroids', 'heading for the Trojan asteroids ahead of Jupiter', 'See card.');

// ---------------------------------------------------------------- 4. Tianwen-2 at Kamoʻoalewa, Earth's little quasi-moon (real orbit)
{
  const g = new THREE.Group();
  const rock = new THREE.Mesh(lumpy(0.02, 0.35, 41, [1.4, 0.8, 0.9]), new THREE.MeshStandardMaterial({ color: 0x8a6a58, roughness: 1, emissive: 0x181210 }));
  g.add(rock); const tw = scaled(buildTianwen2(), 0.006); tw.position.set(0.09, 0.03, 0.05); tw.lookAt(0, 0, 0); g.add(tw);
  sim.push(dt => { rock.rotation.y += dt * 12; });
  smallBody({ key: 'Tianwen2', name: 'Tianwen-2 · Kamoʻoalewa', el: { a: 1.00094, e: 0.10269, i: 7.79605, node: 65.7907, peri: 305.0478 }, mesh: g, color: 0xff8a6a,
    perihelionMs: Date.UTC(2024, 9, 4, 19), cat: 'Spacecraft · China, asteroid sample return', distStr: 'at Kamoʻoalewa, which circles the Sun alongside Earth', fact: 'See card.' });
  sim.push(() => { g.rotation.y = 0; });
  Object.assign(bodies.Tianwen2, { radius: 0.1, view: 0.4 });
}

// ---------------------------------------------------------------- 5. Aditya-L1 and SOHO, watching the Sun from L1
{
  const L1 = bodies.LP_L1?.obj, earth = bodies.Earth.obj;
  const ad = scaled(buildAditya(), 0.04), so = scaled(buildSOHO(), 0.03);
  const ah = new THREE.Group(), sh = new THREE.Group(); ah.add(ad); sh.add(so); SS.scene.add(ah, sh); SS.extras.scaleHide.push(ah, sh);
  const lp = V(), ep = V();
  sim.push(() => {
    if (!L1) return; L1.getWorldPosition(lp); earth.getWorldPosition(ep);
    const toSun = lp.clone().negate().normalize(), side = V(0, 1, 0).cross(toSun).normalize(), up = toSun.clone().cross(side);
    const d = SS.getDate() / 864e5, pa = d / 178 * 2 * Math.PI, ps = d / 178 * 2 * Math.PI + 2.2;   // halo loops of about six months
    ah.position.copy(lp).addScaledVector(side, Math.cos(pa) * 0.8).addScaledVector(up, Math.sin(pa) * 0.5);
    sh.position.copy(lp).addScaledVector(side, Math.cos(ps) * 1.1).addScaledVector(up, Math.sin(ps) * 0.6);
    ad.lookAt(0, 0, 0); so.lookAt(0, 0, 0);   // instruments (+Z) point at the Sun
  });
  nearLabel(ah, 'Aditya-L1', 0.3, 'Aditya', 'craft', 8); nearLabel(sh, 'SOHO', 0.3, 'SOHO', 'craft', 8);
  bodies.Aditya = { obj: ah, radius: 0.15, view: 0.7, dir: t => t.clone().normalize().multiplyScalar(0.4).add(V(0.6, 0.5, 0)).normalize() };
  bodies.SOHO = { obj: sh, radius: 0.15, view: 0.7, dir: t => t.clone().normalize().multiplyScalar(0.4).add(V(-0.5, 0.6, 0)).normalize() };
  special.Aditya = () => flyTo('Aditya'); special.SOHO = () => flyTo('SOHO');
  info('Aditya', 'Aditya-L1', 'Spacecraft · India’s Sun observatory', 'at Sun–Earth L1, 1.5 million km towards the Sun', 'See card.');
  info('SOHO', 'SOHO', 'Spacecraft · Sun observatory (ESA/NASA)', 'at Sun–Earth L1 since 1996', 'See card.');
}

// ---------------------------------------------------------------- 6. Lunar Gateway (paused): the planned 7-day orbit round the Moon
{
  const moon = bodies.Moon.obj, R = moon.geometry?.parameters?.radius || 0.27;
  const grp = new THREE.Group(); moon.parent.add(grp);
  const plane = new THREE.Group(); plane.rotation.y = 0.3; grp.add(plane);
  const rp = R * 1.35, ra = R * 3.6, a = (rp + ra) / 2, e = (ra - rp) / (ra + rp), w = Math.PI / 2;   // closest over the north pole, farthest over the south pole
  const at = nu => { const r = a * (1 - e * e) / (1 + e * Math.cos(nu)); return V(Math.cos(nu + w) * r, Math.sin(nu + w) * r, 0); };
  const pts = []; for (let k = 0; k <= 160; k++) pts.push(at(k / 160 * 2 * Math.PI));
  plane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xbfbfff, dashSize: 0.03, gapSize: 0.03, transparent: true, opacity: 0.45 })));
  plane.children[0].computeLineDistances(); SS.orbitLines?.push(plane.children[0]);
  const gw = scaled(buildGateway(), 0.0013); plane.add(gw);
  const P = 6.6 * 864e5;
  sim.push(() => { grp.position.copy(moon.position); const M = 2 * Math.PI * ((SS.getDate() / P) % 1), E = kepler(M, e);
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)); gw.position.copy(at(nu)); gw.lookAt(grp.getWorldPosition(cp)); });
  nearLabel(gw, 'Gateway (paused)', 6, 'Gateway', 'craft', 3);
  bodies.Gateway = { obj: gw, radius: 0.05, view: 0.25, dir: t => t.clone().negate().normalize().add(V(0.4, 0.3, 0)).normalize() };
  let gwLoaded = false;   // NASA's detailed Gateway model (3.5 MB) loads the first time it is chosen
  special.Gateway = () => { if (!gwLoaded) { gwLoaded = true; new GLTFLoader().load('models/gateway.glb', gl => { for (const c of [...gw.children]) gw.remove(c); gw.add(gl.scene); }); } flyTo('Gateway'); };
  info('Gateway', 'Lunar Gateway', 'Space station design · paused in 2026', 'planned orbit around the Moon', 'See card.');
}

// ---------------------------------------------------------------- 7. Far dwarf planets
{
  const ball = (r, color, extra) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.9, emissive: color, emissiveIntensity: 0.12 }))); extra?.(g); return g; };
  const moonlet = (g, r, d, c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 8), new THREE.MeshStandardMaterial({ color: c, roughness: 1, emissive: c, emissiveIntensity: 0.1 })); m.position.set(d, 0.05, 0); g.add(m); };
  smallBody({ key: 'Sedna', name: 'Sedna', el: { a: 506, e: 0.8496, i: 11.9307, node: 144.248, peri: 311.352 }, mesh: ball(0.32, 0xb0503a), color: 0xc86a50,
    perihelionMs: Date.UTC(2076, 6, 18), cat: 'Dwarf planet · sednoid', distStr: 'about 84 AU from the Sun now; up to 937 AU', fact: 'See card.' });
  smallBody({ key: 'Gonggong', name: 'Gonggong', el: { a: 66.895, e: 0.50318, i: 30.8664, node: 336.8401, peri: 206.6442 }, mesh: ball(0.34, 0x9a5240, g => moonlet(g, 0.07, 0.75, 0x8a6a60)), color: 0xb06a58,
    perihelionMs: Date.UTC(1857, 1, 18), cat: 'Dwarf planet · scattered disc', distStr: 'about 33 to 101 AU from the Sun', fact: 'See card.' });
  smallBody({ key: 'Quaoar', name: 'Quaoar', el: { a: 43.163, e: 0.036646, i: 7.9912, node: 189.005, peri: 163.784 }, color: 0xb08070,
    mesh: ball(0.31, 0x9a7262, g => { moonlet(g, 0.06, 0.9, 0x887870);
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.33, 64), new THREE.MeshBasicMaterial({ color: 0xd8c8b8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })); ring.rotation.x = Math.PI / 2; g.add(ring); }),
    perihelionMs: Date.UTC(2079, 8, 21), cat: 'Dwarf planet · Kuiper Belt', distStr: 'about 42 to 45 AU from the Sun', fact: 'See card.' });
  for (const k of ['Sedna', 'Gonggong', 'Quaoar']) Object.assign(bodies[k], { radius: 0.4, view: 3 });
}

// ---------------------------------------------------------------- cards
Object.assign(D, {
  Clipper: { intro: ['Europa Clipper is the biggest spacecraft NASA has ever sent to another planet. It is going to Jupiter’s moon Europa, which hides a salty ocean under its ice, to find out whether that ocean could support life. It swings past Earth on 3 December 2026 for one last boost.',
      'Europa Clipper est le plus grand engin que la NASA ait jamais envoyé vers une autre planète. Il part vers Europe, la lune de Jupiter qui cache un océan salé sous sa glace, pour savoir si cet océan pourrait abriter la vie. Il frôle la Terre le 3 décembre 2026 pour un dernier élan.'],
    tiles: [T('Launch', 'Lancement', '14 Oct 2024 · Falcon Heavy, Kennedy', '14 oct. 2024 · Falcon Heavy, Kennedy'),
      T('Mars flyby', 'Survol de Mars', '1 Mar 2025, 884 km up', '1er mars 2025, à 884 km'),
      T('Earth flyby', 'Survol de la Terre', '3 Dec 2026', '3 déc. 2026'),
      T('Jupiter orbit', 'Orbite de Jupiter', '11 Apr 2030', '11 avr. 2030'),
      T('Europa flybys', 'Survols d’Europe', '49, some as low as 25 km', '49, certains à seulement 25 km'),
      T('Size', 'Taille', '30.5 m wide with its solar wings, about 6,000 kg', '30,5 m d’envergure, environ 6 000 kg'),
      T('Instruments', 'Instruments', '9, plus a gravity experiment', '9, plus une expérience de gravité'),
      T('Route shown', 'Trajet affiché', 'fitted to the real flyby dates', 'calé sur les vraies dates de survol')],
    facts: [['Europa’s ocean may hold about twice as much water as all of Earth’s oceans.', 'L’océan d’Europe contiendrait environ deux fois plus d’eau que tous les océans de la Terre.'],
      ['Its electronics sit inside a thick metal vault to survive Jupiter’s fierce radiation.', 'Son électronique est enfermée dans un épais coffre métallique pour survivre aux radiations intenses de Jupiter.'],
      ['Rather than orbit Europa, it loops round Jupiter and dives past Europa again and again, escaping the worst radiation in between.', 'Au lieu d’orbiter autour d’Europe, il boucle autour de Jupiter et frôle Europe encore et encore, en fuyant le pire des radiations entre deux passages.'],
      ['The Earth flyby is the only chance to check its magnetometer against a well-known magnetic field.', 'Le survol de la Terre est la seule occasion de vérifier son magnétomètre dans un champ magnétique bien connu.']] },

  PsycheProbe: { intro: ['NASA’s Psyche spacecraft is flying to Psyche, a 222 km asteroid that may be the bare metal core of a planet that never finished forming. It pushes itself with gentle electric thrusters that fire xenon.',
      'La sonde Psyche de la NASA vole vers Psyché, un astéroïde de 222 km qui pourrait être le noyau métallique mis à nu d’une planète inachevée. Elle avance grâce à de doux propulseurs électriques qui éjectent du xénon.'],
    tiles: [T('Launch', 'Lancement', '13 Oct 2023 · Falcon Heavy, Kennedy', '13 oct. 2023 · Falcon Heavy, Kennedy'),
      T('Mars flyby', 'Survol de Mars', '15 May 2026, 4,609 km up', '15 mai 2026, à 4 609 km'),
      T('Arrival', 'Arrivée', '2029', '2029'),
      T('Engines', 'Moteurs', 'Hall-effect thrusters, a first beyond the Moon', 'propulseurs à effet Hall, une première au-delà de la Lune'),
      T('Asteroid size', 'Taille de l’astéroïde', 'about 278 × 238 × 171 km', 'environ 278 × 238 × 171 km'),
      T('Route shown', 'Trajet affiché', 'a smooth spiral from Mars, approximate', 'une spirale douce depuis Mars, approximative')],
    facts: [['The Mars flyby gave it a boost of about 1,600 km/h without using any fuel.', 'Le survol de Mars lui a donné un coup de pouce d’environ 1 600 km/h sans consommer de carburant.'],
      ['It tested laser communication from deep space, beaming down data far faster than radio.', 'Il a testé les communications laser depuis l’espace lointain, envoyant des données bien plus vite que par radio.'],
      ['Its glow is blue: the colour of the xenon in its thrusters.', 'Sa lueur est bleue : la couleur du xénon dans ses propulseurs.']] },

  Lucy: { intro: ['Lucy is the first mission to Jupiter’s Trojan asteroids, two swarms of ancient rocks that share Jupiter’s orbit. It is named after the famous Lucy fossil, because these asteroids are "fossils" from when the planets formed.',
      'Lucy est la première mission vers les astéroïdes troyens de Jupiter, deux essaims de roches anciennes qui partagent l’orbite de Jupiter. Elle porte le nom du célèbre fossile Lucy, car ces astéroïdes sont des « fossiles » de la naissance des planètes.'],
    tiles: [T('Launch', 'Lancement', '16 Oct 2021 · Atlas V, Cape Canaveral', '16 oct. 2021 · Atlas V, cap Canaveral'),
      T('Dinkinesh', 'Dinkinesh', '1 Nov 2023, found a surprise moon, Selam', '1er nov. 2023, avec une lune surprise, Selam'),
      T('Donaldjohanson', 'Donaldjohanson', '20 Apr 2025, from 960 km', '20 avr. 2025, à 960 km'),
      T('Eurybates and Queta', 'Eurybates et Queta', '12 Aug 2027: first Trojan', '12 août 2027 : premier troyen'),
      T('Then', 'Ensuite', 'Polymele (Sep 2027), Leucus (Apr 2028), Orus (Nov 2028)', 'Polymele (sept. 2027), Leucus (avr. 2028), Orus (nov. 2028)'),
      T('Last target', 'Dernière cible', 'Patroclus and Menoetius, 3 Mar 2033', 'Patrocle et Ménétios, 3 mars 2033'),
      T('Solar arrays', 'Panneaux solaires', 'two round wings, 7.3 m across each', 'deux ailes rondes de 7,3 m chacune'),
      T('Route shown', 'Trajet affiché', 'Earth flyby of Dec 2024 to Eurybates', 'du survol de la Terre de déc. 2024 à Eurybates')],
    facts: [['It will visit more separate asteroids than any mission before it.', 'Elle visitera plus d’astéroïdes différents que n’importe quelle mission avant elle.'],
      ['In December 2030 it comes back past Earth, the first spacecraft to return to Earth from Jupiter’s distance.', 'En décembre 2030, elle repassera près de la Terre : le premier engin à revenir vers la Terre depuis la distance de Jupiter.'],
      ['The Lucy fossil was named after the Beatles song "Lucy in the Sky with Diamonds".', 'Le fossile Lucy doit son nom à la chanson des Beatles « Lucy in the Sky with Diamonds ».']] },

  Tianwen2: { intro: ['Tianwen-2 is China’s first asteroid sample-return mission. It reached Kamoʻoalewa, a tiny asteroid that circles the Sun alongside Earth like a little "quasi-moon", in July 2026, and is studying it before grabbing a sample to bring home.',
      'Tianwen-2 est la première mission chinoise de retour d’échantillons d’astéroïde. Elle a rejoint en juillet 2026 Kamoʻoalewa, un minuscule astéroïde qui tourne autour du Soleil aux côtés de la Terre comme une petite « quasi-lune », et l’étudie avant d’en prélever un échantillon.'],
    tiles: [T('Launch', 'Lancement', '28 May 2025 (UTC) · Long March 3B, Xichang', '28 mai 2025 (UTC) · Longue Marche 3B, Xichang'),
      T('Arrival', 'Arrivée', 'July 2026', 'juillet 2026'),
      T('Kamoʻoalewa', 'Kamoʻoalewa', 'only about 20 m across, spins in about half an hour', 'environ 20 m seulement, tourne en une demi-heure environ'),
      T('Leaves the asteroid', 'Départ', 'planned April 2027', 'prévu en avril 2027'),
      T('Sample home', 'Retour de l’échantillon', 'late 2027, by capsule', 'fin 2027, en capsule'),
      T('Next target', 'Cible suivante', 'comet 311P/PANSTARRS, around 2035', 'la comète 311P/PANSTARRS, vers 2035')],
    facts: [['Kamoʻoalewa may be a chip knocked off the Moon by an impact; the sample should tell.', 'Kamoʻoalewa pourrait être un éclat arraché à la Lune par un impact ; l’échantillon devrait le dire.'],
      ['Its first close-up showed it is much smaller than telescopes on Earth had estimated.', 'Sa première image rapprochée a montré qu’il est bien plus petit que ne l’estimaient les télescopes terrestres.'],
      ['China becomes the third nation, after Japan and the USA, to try bringing asteroid material home.', 'La Chine devient le troisième pays, après le Japon et les États-Unis, à tenter de rapporter de la matière d’astéroïde.']] },

  Aditya: { intro: ['Aditya-L1 is India’s first space observatory for the Sun. From L1, between Earth and the Sun, it watches the Sun non-stop, with no night and no eclipses in the way.',
      'Aditya-L1 est le premier observatoire spatial de l’Inde consacré au Soleil. Depuis L1, entre la Terre et le Soleil, il observe le Soleil sans interruption, sans nuit ni éclipse pour le gêner.'],
    tiles: [T('Launch', 'Lancement', '2 Sep 2023 · PSLV, Sriharikota', '2 sept. 2023 · PSLV, Sriharikota'),
      T('At L1', 'À L1', 'since 6 Jan 2024', 'depuis le 6 janv. 2024'),
      T('Agency', 'Agence', 'ISRO, India', 'ISRO, Inde'),
      T('Instruments', 'Instruments', '7, including the VELC coronagraph and the SUIT ultraviolet telescope', '7, dont le coronographe VELC et le télescope ultraviolet SUIT'),
      T('Name', 'Nom', '"Aditya" means the Sun in Sanskrit', '« Aditya » signifie le Soleil en sanskrit')],
    facts: [['L1 is about 1.5 million km from Earth, roughly four times farther than the Moon.', 'L1 se trouve à environ 1,5 million de km de la Terre, environ quatre fois plus loin que la Lune.'],
      ['Solar storms pass L1 about an hour before they reach Earth, giving a short warning.', 'Les tempêtes solaires passent L1 environ une heure avant d’atteindre la Terre, ce qui donne une courte alerte.']] },

  SOHO: { intro: ['SOHO (Solar and Heliospheric Observatory), from ESA and NASA, has watched the Sun from L1 since 1996, far longer than planned. Its pictures help forecast solar storms, and people looking through them online have found thousands of comets.',
      'SOHO (Observatoire solaire et héliosphérique), de l’ESA et de la NASA, observe le Soleil depuis L1 depuis 1996, bien plus longtemps que prévu. Ses images aident à prévoir les tempêtes solaires, et des internautes y ont découvert des milliers de comètes.'],
    tiles: [T('Launch', 'Lancement', '2 Dec 1995 · Atlas, Cape Canaveral', '2 déc. 1995 · Atlas, cap Canaveral'),
      T('At L1', 'À L1', 'since early 1996', 'depuis début 1996'),
      T('Comets found', 'Comètes découvertes', 'more than 5,000', 'plus de 5 000'),
      T('Instruments', 'Instruments', '12, including the LASCO coronagraph', '12, dont le coronographe LASCO'),
      T('Planned life', 'Durée prévue', '2 years; still working after 30', '2 ans ; toujours actif après 30')],
    facts: [['In 1998 contact was lost for weeks; engineers found it with the Arecibo radio telescope and brought it back.', 'En 1998, le contact a été perdu pendant des semaines ; les ingénieurs l’ont retrouvé grâce au radiotélescope d’Arecibo et l’ont sauvé.'],
      ['It is the most prolific comet discoverer in history, mostly sungrazing comets spotted by amateurs.', 'C’est le plus grand découvreur de comètes de l’histoire, surtout des comètes rasantes repérées par des amateurs.']] },

  Gateway: { closed: true, intro: ['The Lunar Gateway was planned as a small space station orbiting the Moon, where astronauts would stop between Earth and the lunar surface. On 24 March 2026 NASA paused it to focus on building a base on the Moon’s surface instead. This is the design as it stood.',
      'Le Lunar Gateway devait être une petite station spatiale en orbite autour de la Lune, une escale pour les astronautes entre la Terre et la surface lunaire. Le 24 mars 2026, la NASA l’a mis en pause pour se concentrer plutôt sur une base à la surface de la Lune. Voici le projet tel qu’il était.'],
    tiles: [T('Status', 'Statut', 'paused on 24 Mar 2026', 'mis en pause le 24 mars 2026'),
      T('Orbit planned', 'Orbite prévue', 'a stretched 7-day loop, about 3,000 to 70,000 km from the Moon', 'une boucle allongée de 7 jours, d’environ 3 000 à 70 000 km de la Lune'),
      T('NASA parts', 'Modules NASA', 'Power and Propulsion Element, HALO living module', 'module de puissance et de propulsion, module d’habitation HALO'),
      T('ESA parts', 'Modules ESA', 'Lunar I-Hab and Lunar View (ESPRIT)', 'Lunar I-Hab et Lunar View (ESPRIT)'),
      T('Canada', 'Canada', 'Canadarm3 robot arm', 'le bras robotique Canadarm3'),
      T('Crew', 'Équipage', 'up to 4, for weeks at a time', 'jusqu’à 4, pendant quelques semaines')],
    facts: [['The partners’ hardware is being looked at for other uses, such as supporting the planned Moon base.', 'Le matériel des partenaires est étudié pour d’autres usages, comme soutenir la future base lunaire.'],
      ['Its odd orbit would always keep it in view of Earth, so it never lost contact.', 'Son orbite étrange l’aurait toujours gardé en vue de la Terre, sans jamais perdre le contact.']] },

  Sedna: { intro: ['Sedna is one of the most distant known worlds in the Solar System, a reddish dwarf planet about 1,000 km across. Its extremely stretched orbit takes about 11,400 years and never comes close to Neptune.',
      'Sedna est l’un des mondes connus les plus lointains du système solaire, une planète naine rougeâtre d’environ 1 000 km. Son orbite extrêmement allongée dure environ 11 400 ans et ne passe jamais près de Neptune.'],
    tiles: [T('Discovered', 'Découverte', '14 Nov 2003', '14 nov. 2003'),
      T('Size', 'Taille', 'about 1,000 km', 'environ 1 000 km'),
      T('Closest to the Sun', 'Au plus près du Soleil', '76 AU, around July 2076', '76 UA, vers juillet 2076'),
      T('Farthest', 'Au plus loin', 'about 937 AU', 'environ 937 UA'),
      T('One orbit', 'Une orbite', 'about 11,400 years', 'environ 11 400 ans'),
      T('Named after', 'Nom', 'the Inuit goddess of the sea', 'la déesse inuite de la mer')],
    facts: [['Nothing we know of could have pulled it onto this orbit; it may be a clue to a passing star long ago, or a hidden planet.', 'Rien de connu n’a pu la placer sur cette orbite : c’est peut-être l’indice d’une étoile passée près de nous jadis, ou d’une planète cachée.'],
      ['From Sedna the Sun would look like a very bright star.', 'Depuis Sedna, le Soleil ressemblerait à une étoile très brillante.']] },

  Gonggong: { intro: ['Gonggong is a reddish dwarf planet in the scattered disc beyond Neptune, about 1,230 km across, with a small moon called Xiangliu. It goes round the Sun three times for every ten trips of Neptune.',
      'Gonggong est une planète naine rougeâtre du disque des objets épars, au-delà de Neptune, d’environ 1 230 km, avec une petite lune appelée Xiangliu. Elle fait trois fois le tour du Soleil pendant que Neptune en fait dix.'],
    tiles: [T('Discovered', 'Découverte', '17 Jul 2007', '17 juil. 2007'),
      T('Size', 'Taille', 'about 1,230 km', 'environ 1 230 km'),
      T('Distance', 'Distance', '33 to 101 AU from the Sun', '33 à 101 UA du Soleil'),
      T('One orbit', 'Une orbite', 'about 550 years', 'environ 550 ans'),
      T('Tilt', 'Inclinaison', 'about 31° to the planets’ plane', 'environ 31° par rapport au plan des planètes'),
      T('Named after', 'Nom', 'a Chinese water god, in 2020', 'un dieu chinois de l’eau, en 2020')],
    facts: [['Its nickname before it had a name was "Snow White".', 'Avant d’avoir un nom, on la surnommait « Blanche-Neige ».'],
      ['It was last closest to the Sun in 1857.', 'Elle est passée au plus près du Soleil pour la dernière fois en 1857.']] },

  Quaoar: { intro: ['Quaoar is a dwarf planet in the Kuiper Belt, about 1,110 km across, on an almost circular orbit. In 2023 astronomers found it has a ring much farther out than rings are supposed to be able to survive.',
      'Quaoar est une planète naine de la ceinture de Kuiper, d’environ 1 110 km, sur une orbite presque circulaire. En 2023, des astronomes ont découvert qu’elle a un anneau bien plus éloigné que ce que les anneaux sont censés supporter.'],
    tiles: [T('Discovered', 'Découverte', '2002', '2002'),
      T('Size', 'Taille', 'about 1,110 km', 'environ 1 110 km'),
      T('Distance', 'Distance', 'about 42 to 45 AU from the Sun', 'environ 42 à 45 UA du Soleil'),
      T('One orbit', 'Une orbite', 'about 284 years', 'environ 284 ans'),
      T('Moon', 'Lune', 'Weywot', 'Weywot'),
      T('Named after', 'Nom', 'the Tongva people’s creator force', 'la force créatrice du peuple tongva')],
    facts: [['Its ring orbits about seven times Quaoar’s radius away, where a ring should normally clump into a moon.', 'Son anneau tourne à environ sept fois le rayon de Quaoar, là où un anneau devrait normalement s’agglomérer en lune.'],
      ['The ring was found by watching stars blink as Quaoar passed in front of them.', 'L’anneau a été découvert en observant des étoiles clignoter quand Quaoar passait devant elles.']] },
});

// ---------------------------------------------------------------- menu groups
{
  const mk = (label, after, items) => { const og = document.createElement('optgroup'); og.label = label;
    const groups = [...focusSel.querySelectorAll('optgroup')], b = groups.find(g => g.label === after);
    b ? b.after(og) : focusSel.appendChild(og);
    for (const [k, t] of items) if (bodies[k]) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); } return og; };
  mk('🛸 Missions in flight', '🇪🇺 ESA missions', [['Clipper', 'Europa Clipper'], ['PsycheProbe', 'Psyche (spacecraft)'], ['Lucy', 'Lucy, to the Trojan asteroids'],
    ['Tianwen2', 'Tianwen-2 at Kamoʻoalewa'], ['Aditya', 'Aditya-L1 at L1'], ['SOHO', 'SOHO at L1'], ['Gateway', 'Lunar Gateway (paused)']]);
  mk('🪐 Far dwarf planets', '🛸 Missions in flight', [['Sedna', 'Sedna'], ['Gonggong', 'Gonggong'], ['Quaoar', 'Quaoar']]);
}

// ---------------------------------------------------------------- French
SS.i18nAdd?.({
  ui: { '🛸 Missions in flight': '🛸 Missions en vol', '🪐 Far dwarf planets': '🪐 Planètes naines lointaines' },
  name: { '🛸 Missions in flight': '🛸 Missions en vol', '🪐 Far dwarf planets': '🪐 Planètes naines lointaines', 'Psyche (spacecraft)': 'Psyché (sonde)', 'Lucy, to the Trojan asteroids': 'Lucy, vers les astéroïdes troyens',
    'Tianwen-2 at Kamoʻoalewa': 'Tianwen-2 à Kamoʻoalewa', 'Tianwen-2 · Kamoʻoalewa': 'Tianwen-2 · Kamoʻoalewa', 'Aditya-L1 at L1': 'Aditya-L1 au point L1', 'SOHO at L1': 'SOHO au point L1',
    'Lunar Gateway (paused)': 'Lunar Gateway (en pause)', 'Gateway (paused)': 'Gateway (en pause)', 'Lunar Gateway': 'Lunar Gateway' },
  cat: { 'Spacecraft · NASA, to Jupiter’s moon Europa': 'Engin spatial · NASA, vers Europe, lune de Jupiter', 'Spacecraft · NASA, to the metal asteroid Psyche': 'Engin spatial · NASA, vers l’astéroïde métallique Psyché',
    'Spacecraft · NASA, to Jupiter’s Trojan asteroids': 'Engin spatial · NASA, vers les astéroïdes troyens de Jupiter', 'Spacecraft · China, asteroid sample return': 'Engin spatial · Chine, retour d’échantillons d’astéroïde',
    'Spacecraft · India’s Sun observatory': 'Engin spatial · observatoire solaire de l’Inde', 'Spacecraft · Sun observatory (ESA/NASA)': 'Engin spatial · observatoire solaire (ESA/NASA)',
    'Space station design · paused in 2026': 'Projet de station spatiale · en pause depuis 2026', 'Dwarf planet · sednoid': 'Planète naine · sednoïde', 'Dwarf planet · scattered disc': 'Planète naine · disque des objets épars',
    'Dwarf planet · Kuiper Belt': 'Planète naine · ceinture de Kuiper' },
  dist: { 'on its way to Jupiter, arriving April 2030': 'en route vers Jupiter, arrivée en avril 2030', 'on its way to the asteroid belt, arriving 2029': 'en route vers la ceinture d’astéroïdes, arrivée en 2029',
    'heading for the Trojan asteroids ahead of Jupiter': 'en route vers les astéroïdes troyens qui précèdent Jupiter', 'at Kamoʻoalewa, which circles the Sun alongside Earth': 'à Kamoʻoalewa, qui tourne autour du Soleil aux côtés de la Terre',
    'at Sun–Earth L1, 1.5 million km towards the Sun': 'au point L1 Soleil–Terre, à 1,5 million de km vers le Soleil', 'at Sun–Earth L1 since 1996': 'au point L1 Soleil–Terre depuis 1996',
    'planned orbit around the Moon': 'orbite prévue autour de la Lune', 'about 84 AU from the Sun now; up to 937 AU': 'environ 84 UA du Soleil aujourd’hui ; jusqu’à 937 UA',
    'about 33 to 101 AU from the Sun': 'environ 33 à 101 UA du Soleil', 'about 42 to 45 AU from the Sun': 'environ 42 à 45 UA du Soleil' },
});
