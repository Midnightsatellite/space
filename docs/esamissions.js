// =====================================================================
// ESA missions: BepiColombo at Mercury, Hera at the Didymos asteroids, Juice on its way to Jupiter,
// Solar Orbiter round the Sun, Euclid and Gaia at L2, Smile round Earth, Ariane 6 at Kourou,
// and Rosetta with Philae on comet 67P. Real orbits where they are known; craft are drawn much larger than life.
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildBepi, buildHera, buildCubesat, buildJuice, buildSolarOrbiter, buildEuclid, buildGaia, buildSmile, buildAriane6, buildRosetta, buildPhilae } from './craftmodels.js?v=49';
const SS = window.SS;
const { bodies, sim, flyTo, focusSel } = SS;
const { info } = SS.cosmos;
const { smallBody, nearLabel, PL, auToScene, lumpy } = SS.extras;
const special = SS.more.special, D = SS.more.cards2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const T = (l, lf, v, vf) => [l, lf, v, vf];
const wp = V(), cp = V(), q = new THREE.Quaternion();
const kepler = (M, e) => { let E = M; for (let k = 0; k < 30; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; };
const nuOf = (E, e) => 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
// heliocentric ecliptic position (AU) → scene, the same way the site places planets and comets
const helioScene = ({ a, e, i, node, peri }, nu) => {
  const r = a * (1 - e * e) / (1 + e * Math.cos(nu)), u = peri * D2R + nu, O = node * D2R, I = i * D2R;
  const x = r * (Math.cos(O) * Math.cos(u) - Math.sin(O) * Math.sin(u) * Math.cos(I));
  const y = r * (Math.sin(O) * Math.cos(u) + Math.cos(O) * Math.sin(u) * Math.cos(I));
  const z = r * Math.sin(u) * Math.sin(I);
  return V(x, z, -y).normalize().multiplyScalar(auToScene(r));
};
const scaled = (o, s) => { o.scale.setScalar(s); return o; };
const sideView = (obj, centre, up = 0.35) => () => { obj.getWorldPosition(wp); centre.getWorldPosition(cp); return wp.sub(cp).normalize().add(V(0, up, 0)).normalize(); };

// ---------------------------------------------------------------- 1. BepiColombo, arriving at Mercury
{
  const merc = PL.Mercury.holder, R = 0.38;
  const plane = new THREE.Group(); plane.rotation.set(0, 0.6, Math.PI / 2); merc.add(plane);   // a polar orbit
  const craft = scaled(buildBepi(), 0.008); plane.add(craft);
  const a = R * 2.0, e = 0.35, P = 2.3;   // shown as a loose capture orbit (drawn larger than life)
  const pts = []; for (let k = 0; k <= 160; k++) { const nu = k / 160 * Math.PI * 2, r = a * (1 - e * e) / (1 + e * Math.cos(nu)); pts.push(V(Math.cos(nu) * r, 0, Math.sin(nu) * r)); }
  plane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.35 })));
  sim.push(() => { const t = SS.getDate() / 864e5 / P * 2 * Math.PI; const E = kepler(t % (2 * Math.PI), e), nu = nuOf(E, e), r = a * (1 - e * Math.cos(E));
    craft.position.set(Math.cos(nu) * r, 0, Math.sin(nu) * r); craft.rotation.y = -nu; });
  nearLabel(craft, 'BepiColombo', 5, 'BepiColombo', 'craft', 3);
  { const qq = new THREE.Quaternion(); bodies.BepiColombo = { obj: craft, radius: 0.06, view: 0.36, dir: () => V(1, 0.35, 1.2).normalize().applyQuaternion(craft.getWorldQuaternion(qq)) }; }   // the same three-quarter view as ESA's art
  info('BepiColombo', 'BepiColombo', 'Spacecraft · Mercury orbiters (ESA/JAXA)', 'arriving in orbit around Mercury', 'See card.');
}

// ---------------------------------------------------------------- 2. Hera at the Didymos asteroids (real orbit of Didymos)
{
  const g = new THREE.Group();
  const rock = new THREE.MeshStandardMaterial({ color: 0x6a625a, roughness: 1, emissive: 0x141210 });
  const didy = new THREE.Mesh(lumpy(0.06, 0.18, 31, [1, 0.85, 1], true), rock); g.add(didy);
  const dimo = new THREE.Mesh(lumpy(0.014, 0.35, 33, [1.3, 0.9, 1]), rock);
  const moon = new THREE.Group(); moon.add(dimo); dimo.position.x = 0.14; g.add(moon);
  const hera = scaled(buildHera(), 0.014); hera.position.set(0.22, 0.07, 0.12); hera.lookAt(0, 0, 0); g.add(hera);
  for (const [x, y, z] of [[0.17, -0.05, -0.12], [-0.12, 0.08, 0.16]]) { const c = scaled(buildCubesat(), 0.03); c.position.set(x, y, z); g.add(c); }
  sim.push(dt => { moon.rotation.y += dt * 2.0; didy.rotation.y += dt * 10; });
  // Didymos: a 1.6442 AU, e 0.38385, i 3.408°, node 73.196°, peri 319.32°; perihelion about 3 Aug 2018, then every ~770 days
  const sb = smallBody({ key: 'Hera', name: 'Hera · Didymos', el: { a: 1.6442, e: 0.38385, i: 3.408, node: 73.196, peri: 319.32 }, mesh: g, color: 0xffb070,
    perihelionMs: Date.UTC(2018, 7, 3, 10), cat: 'Spacecraft · planetary defence', distStr: 'at the asteroid pair Didymos and Dimorphos', fact: 'See card.' });
  sim.push(() => { g.rotation.y = 0; });   // keep the asteroid system steady (smallBody spins its mesh)
  Object.assign(bodies.Hera, { radius: 0.12, view: 0.55 });
}

// ---------------------------------------------------------------- 3. Juice, between its Earth flybys of 28 Sep 2026 and 18 Jan 2029
{
  // an approximate path fitted to both flybys (Earth at longitude 5.0° and 119.4°): a 1.864 AU, e 0.8405, out to 3.4 AU between them
  const el = { a: 1.8639, e: 0.8405, i: 0.3, node: 0, peri: 242.41 };
  const t0 = Date.UTC(2026, 8, 28, 11, 45), t1 = Date.UTC(2029, 0, 18), nu1 = 122.6 * D2R;
  const P = Math.pow(el.a, 1.5) * 365.25 * 864e5, M1 = (() => { const E = 2 * Math.atan2(Math.sqrt(1 - el.e) * Math.sin(nu1 / 2), Math.sqrt(1 + el.e) * Math.cos(nu1 / 2)); return E - el.e * Math.sin(E); })();
  const tp = t0 - M1 / (2 * Math.PI) * P;
  const pts = []; for (let k = 0; k <= 200; k++) pts.push(helioScene(el, nu1 + (2 * Math.PI - 2 * nu1) * k / 200));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0x7fd6ff, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.6 }));
  line.computeLineDistances(); SS.scene.add(line); SS.orbitLines?.push(line); SS.extras.scaleHide.push(line);
  const holder = new THREE.Group(); SS.scene.add(holder); SS.extras.scaleHide.push(holder);
  const craft = scaled(buildJuice(), 0.012); holder.add(craft);
  sim.push(() => { const t = Math.min(t1, Math.max(t0, SS.getDate())); const M = 2 * Math.PI * (t - tp) / P;
    const E = kepler(((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), el.e); holder.position.copy(helioScene(el, nuOf(E, el.e))); craft.lookAt(0, 0, 0); });
  nearLabel(holder, 'Juice', 0.5, 'Juice', 'small', 90);
  bodies.Juice = { obj: holder, radius: 0.3, view: 0.5, dir: t => t.clone().normalize().negate().add(V(0.3, 0.6, 0)).normalize() };   // from the sunny side
  info('Juice', 'Juice', 'Spacecraft · Jupiter Icy Moons Explorer', 'on its way to Jupiter, arriving July 2031', 'See card.');
}

// ---------------------------------------------------------------- 4. Solar Orbiter (perihelia 18 Aug 2026, 6 Feb 2027; Venus flyby 24 Dec 2026)
{
  const outer = new THREE.Group(), inner = new THREE.Group(); outer.add(inner);
  const so = scaled(buildSolarOrbiter(), 0.012); so.rotation.y = -Math.PI / 2; inner.add(so);   // heat shield (+X) turned to face +Z, then pointed at the Sun
  smallBody({ key: 'SolarOrbiter', name: 'Solar Orbiter', el: { a: 0.6053, e: 0.5209, i: 17, node: 128.5, peri: 143 }, mesh: outer, color: 0xffd27a,
    perihelionMs: Date.UTC(2026, 7, 18), cat: 'Spacecraft · Sun explorer (ESA/NASA)', distStr: 'goes round the Sun every ~6 months, as close as 0.29 AU', fact: 'See card.' });
  sim.push(() => { outer.rotation.set(0, 0, 0); outer.updateWorldMatrix(true, false); inner.lookAt(0, 0, 0); });
  Object.assign(bodies.SolarOrbiter, { radius: 0.2, view: 0.5, dir: t => { const toSun = t.clone().negate().normalize(); return V(0, 1, 0).cross(toSun).normalize().add(toSun.multiplyScalar(0.8)).add(V(0, 0.4, 0)).normalize(); } });
}

// ---------------------------------------------------------------- 5. Euclid at L2, and Gaia (retired, drifting away from L2)
{
  const L2 = bodies.LP_L2?.obj, earth = bodies.Earth.obj;
  const euclid = scaled(buildEuclid(), 0.04), gaia = scaled(buildGaia(), 0.022);
  const eh = new THREE.Group(), gh = new THREE.Group(); eh.add(euclid); gh.add(gaia); SS.scene.add(eh, gh); SS.extras.scaleHide.push(eh, gh);
  const ep = V(), lp = V();
  sim.push(() => {
    if (!L2) return; L2.getWorldPosition(lp); earth.getWorldPosition(ep);
    const away = lp.clone().sub(ep).normalize(), side = V(0, 1, 0).cross(away).normalize(), up = away.clone().cross(side);
    const ph = SS.getDate() / 864e5 / 180 * 2 * Math.PI;   // Euclid's halo loop round L2 takes about six months
    eh.position.copy(lp).addScaledVector(side, Math.cos(ph) * 0.7).addScaledVector(up, Math.sin(ph) * 0.45);
    gh.position.copy(lp).addScaledVector(side, -1.6).addScaledVector(away, 0.8).addScaledVector(up, -0.3);
    euclid.lookAt(0, 0, 0); euclid.rotateY(-Math.PI / 2); gaia.lookAt(0, 0, 0); gaia.rotateX(-Math.PI / 2);   // sunshields face the Sun
  });
  nearLabel(eh, 'Euclid', 0.3, 'Euclid', 'craft', 8); nearLabel(gh, 'Gaia', 0.3, 'Gaia', 'craft', 8);
  bodies.Euclid = { obj: eh, radius: 0.15, view: 0.7, dir: t => t.clone().normalize().multiplyScalar(-0.4).add(V(0.6, 0.5, 0)).normalize() };
  bodies.Gaia = { obj: gh, radius: 0.15, view: 0.75, dir: t => t.clone().normalize().multiplyScalar(-0.3).add(V(0.3, 0.8, 0)).normalize() };
  info('Euclid', 'Euclid', 'Space telescope · dark universe', 'at Sun–Earth L2, 1.5 million km beyond Earth', 'See card.');
  info('Gaia', 'Gaia', 'Space telescope · star mapper (retired)', 'retired in 2025, drifting away from L2', 'See card.');
}

// ---------------------------------------------------------------- 6. Smile: a long oval orbit round Earth, high over the North Pole
{
  const tilted = PL.Earth.tilted, altS = km => 1 + 0.115 * Math.log(1 + km / 180);   // the same squeezed heights as the satellite swarms
  const plane = new THREE.Group(); plane.rotation.y = 0.8; tilted.add(plane);
  const a = (5000 + 121000) / 2 + 6371, e = (121000 - 5000) / (121000 + 5000 + 2 * 6371), w = -110 * D2R;   // apogee near 70° N
  const at = nu => { const r = a * (1 - e * e) / (1 + e * Math.cos(nu)); return V(Math.cos(nu + w), Math.sin(nu + w), 0).multiplyScalar(altS(r - 6371)); };
  const pts = []; for (let k = 0; k <= 200; k++) pts.push(at(k / 200 * Math.PI * 2));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x9fe6c8, transparent: true, opacity: 0.4 })); plane.add(line);
  const craft = scaled(buildSmile(), 0.014); plane.add(craft);
  const P = 52 * 3600e3;
  sim.push(() => { const M = 2 * Math.PI * (SS.getDate() / P % 1); const E = kepler(M, e), nu = nuOf(E, e); craft.position.copy(at(nu)); bodies.Earth.obj.getWorldPosition(cp); craft.lookAt(cp); });
  nearLabel(craft, 'Smile', 12, 'Smile', 'craft', 2);
  bodies.Smile = { obj: craft, radius: 0.05, view: 0.3, dir: sideView(craft, bodies.Earth.obj, 0.4) };
  info('Smile', 'Smile', 'Spacecraft · solar wind and Earth’s magnetic shield (ESA/China)', 'loops from 5,000 to 121,000 km above Earth', 'See card.');
}

// ---------------------------------------------------------------- 7. Ariane 6 on its pad, ELA-4 at Europe's Spaceport
{
  const earthMesh = PL.Earth.tilted.children[0], lat = 5.26 * D2R, lon = -52.79 * D2R;
  const n = V(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).normalize();
  const site = new THREE.Group(); site.position.copy(n); site.quaternion.setFromUnitVectors(V(0, 1, 0), n); earthMesh.add(site);
  site.add(scaled(buildAriane6(), 0.0006));
  const top = new THREE.Object3D(); top.position.y = 0.045; site.add(top);
  nearLabel(top, '🚀 Ariane 6', 0.015, 'Ariane6', 'craft', 3);
  bodies.Ariane6 = { obj: top, radius: 0.03, view: 0.14, dir: () => { site.getWorldQuaternion(q); return V(1, 0.35, 0.6).normalize().applyQuaternion(q); } };
  info('Ariane6', 'Ariane 6', 'Rocket · Europe’s heavy launcher', 'ELA-4 pad, Europe’s Spaceport, Kourou, French Guiana', 'See card.');
}

// ---------------------------------------------------------------- 8. Rosetta and Philae, at rest on comet 67P
{
  const comet = bodies.Comet67P?.obj, g = comet?.children[0];
  if (g) {
    g.updateWorldMatrix(true, true);
    const rc = new THREE.Raycaster(), meshes = g.children.filter(c => c.isMesh);
    const land = (obj, from, scale) => {   // drop a craft onto the comet's surface from a point outside it, towards the small lobe's centre
      const c = V(0.15, 0.08, 0), o = from.clone(), dirL = c.clone().sub(o).normalize();
      const ow = g.localToWorld(o.clone()), dw = g.localToWorld(c.clone()).sub(ow).normalize();
      rc.set(ow, dw); const hit = rc.intersectObjects(meshes, false)[0];
      const p = hit ? g.worldToLocal(hit.point.clone()) : c.clone().addScaledVector(dirL, -0.11);
      obj.scale.setScalar(scale); obj.position.copy(p); obj.quaternion.setFromUnitVectors(V(0, 1, 0), dirL.clone().negate()); g.add(obj); return obj;
    };
    const ros = buildRosetta(); land(ros, V(0.16, 0.5, 0.05), 0.0022); ros.rotateZ(0.5); ros.translateY(0.004);   // resting on one wing, in the Ma'at region
    new GLTFLoader().load('models/rosetta.glb', gl => { for (const c of [...ros.children]) ros.remove(c); ros.add(gl.scene); });   // NASA's 3D model replaces the simple one
    const phi = buildPhilae(); land(phi, V(0.35, 0.15, 0.3), 0.012);                                                // tucked in a shadowy crack at Abydos
    const lab = new THREE.Object3D(); lab.position.copy(ros.position).add(V(0, 0.03, 0)); g.add(lab);
    nearLabel(lab, 'Rosetta & Philae', 0.02, 'Rosetta', 'craft', 2);
    bodies.Rosetta = { obj: comet, radius: 0.3, view: 0.75, dir: t => { const toSun = t.clone().negate().normalize(); return toSun.add(V(0, 0.6, 0)).normalize(); } };
    info('Rosetta', 'Rosetta & Philae', 'Spacecraft · comet orbiter and lander (2004–2016)', 'at rest on comet 67P/Churyumov–Gerasimenko', 'See card.');
  }
}
for (const k of ['BepiColombo', 'Juice', 'Euclid', 'Gaia', 'Smile', 'Ariane6', 'Rosetta']) if (bodies[k]) special[k] = () => flyTo(k);

// ---------------------------------------------------------------- cards
Object.assign(D, {
  BepiColombo: { intro: ['BepiColombo is two spacecraft travelling as one: Europe’s Mercury Planetary Orbiter (MPO) and Japan’s Mio, shielded by a sunshade. After eight years and nine planet flybys, it enters orbit around Mercury on 21 November 2026.',
      'BepiColombo, ce sont deux sondes qui voyagent ensemble : l’orbiteur planétaire européen MPO et l’orbiteur japonais Mio, protégé par un pare-soleil. Après huit ans et neuf survols de planètes, il se met en orbite autour de Mercure le 21 novembre 2026.'],
    tiles: [T('Launch', 'Lancement', '20 Oct 2018 · Ariane 5, Kourou', '20 oct. 2018 · Ariane 5, Kourou'),
      T('Partners', 'Partenaires', 'ESA and Japan’s space agency JAXA', 'l’ESA et l’agence spatiale japonaise JAXA'),
      T('Flybys', 'Survols', '1 of Earth, 2 of Venus, 6 of Mercury', '1 de la Terre, 2 de Vénus, 6 de Mercure'),
      T('Engine module dropped', 'Module de propulsion largué', '3 Sep 2026', '3 sept. 2026'),
      T('Mercury orbit', 'Orbite de Mercure', '21 Nov 2026', '21 nov. 2026'),
      T('Orbiters separate', 'Séparation', '9–10 Dec 2026', '9–10 déc. 2026'),
      T('Mio’s orbit', 'Orbite de Mio', 'about 590 × 11,640 km, over the poles', 'environ 590 × 11 640 km, au-dessus des pôles'),
      T('Science starts', 'Début de la science', 'April 2027', 'avril 2027')],
    facts: [['It will be only the second mission ever to orbit Mercury, after NASA’s MESSENGER.', 'Ce sera seulement la deuxième mission à orbiter autour de Mercure, après MESSENGER de la NASA.'],
      ['Its arrival slipped from December 2025 to November 2026 after a power problem in 2024 limited its electric thrusters.', 'Son arrivée a glissé de décembre 2025 à novembre 2026 après un problème d’alimentation en 2024 qui a limité ses propulseurs électriques.'],
      ['MPO will map Mercury’s surface and insides; Mio will study its magnetic field and the solar wind around it.', 'MPO cartographiera la surface et l’intérieur de Mercure ; Mio étudiera son champ magnétique et le vent solaire autour.'],
      ['Named after Giuseppe "Bepi" Colombo, the Italian scientist who worked out how to use planet flybys to reach Mercury.', 'Elle porte le nom de Giuseppe « Bepi » Colombo, le scientifique italien qui a trouvé comment utiliser les survols de planètes pour atteindre Mercure.'],
      ['Germany’s DLR built two of its instruments: the MERTIS heat camera and the BELA laser altimeter.', 'Le DLR allemand a construit deux de ses instruments : la caméra thermique MERTIS et l’altimètre laser BELA.']] },

  Hera: { intro: ['Hera is Europe’s planetary defence mission. In 2022 NASA’s DART crashed into Dimorphos, the little moon of asteroid Didymos, on purpose. Hera is arriving now to measure the crater, weigh Dimorphos and see exactly how much its orbit changed.',
      'Hera est la mission européenne de défense planétaire. En 2022, la sonde DART de la NASA s’est écrasée volontairement sur Dimorphos, la petite lune de l’astéroïde Didymos. Hera arrive maintenant pour mesurer le cratère, peser Dimorphos et voir de combien son orbite a changé.'],
    tiles: [T('Launch', 'Lancement', '7 Oct 2024 · Falcon 9, Cape Canaveral', '7 oct. 2024 · Falcon 9, cap Canaveral'),
      T('Mars flyby', 'Survol de Mars', 'March 2025', 'mars 2025'),
      T('Arrival', 'Arrivée', 'late 2026', 'fin 2026'),
      T('Didymos', 'Didymos', 'about 780 m across', 'environ 780 m de diamètre'),
      T('Dimorphos', 'Dimorphos', 'about 150 m across', 'environ 150 m de diamètre'),
      T('DART impact', 'Impact de DART', '26 Sep 2022: orbit shortened by about 33 minutes', '26 sept. 2022 : orbite raccourcie d’environ 33 minutes'),
      T('Cubesats', 'Cubesats', 'Milani and Juventas', 'Milani et Juventas'),
      T('Mission control', 'Contrôle', 'ESOC, Darmstadt, Germany', 'ESOC, Darmstadt, Allemagne')],
    facts: [['Neither asteroid is a danger to Earth, which made them a safe place for the first real test of pushing an asteroid aside.', 'Aucun des deux astéroïdes ne menace la Terre, ce qui en faisait un endroit sûr pour le premier vrai test de déviation d’astéroïde.'],
      ['Hera will spend about six months getting closer and closer, ending less than about 1 km from the surface.', 'Hera passera environ six mois à s’approcher de plus en plus, jusqu’à moins d’environ 1 km de la surface.'],
      ['Its cubesat Juventas carries a radar to look inside an asteroid for the first time.', 'Son cubesat Juventas emporte un radar pour regarder pour la première fois à l’intérieur d’un astéroïde.'],
      ['Didymos spins once every 2 hours 16 minutes and goes round the Sun every 770 days.', 'Didymos tourne sur lui-même en 2 heures 16 minutes et fait le tour du Soleil en 770 jours.']] },

  Juice: { intro: ['Juice (Jupiter Icy Moons Explorer) is heading for Jupiter to study its big icy moons Ganymede, Callisto and Europa, which may hide oceans under their ice. It borrows speed from planets on the way: it flew past Earth on 28 September 2026 and comes back once more in January 2029.',
      'Juice (Jupiter Icy Moons Explorer) part vers Jupiter étudier ses grandes lunes glacées Ganymède, Callisto et Europe, qui cachent peut-être des océans sous leur glace. Elle emprunte de la vitesse aux planètes en route : elle a frôlé la Terre le 28 septembre 2026 et y reviendra une dernière fois en janvier 2029.'],
    tiles: [T('Launch', 'Lancement', '14 Apr 2023 · Ariane 5, Kourou', '14 avr. 2023 · Ariane 5, Kourou'),
      T('Flybys', 'Survols', 'Moon and Earth (Aug 2024, a world first), Venus (Aug 2025), Earth (Sep 2026)', 'Lune et Terre (août 2024, une première), Vénus (août 2025), Terre (sept. 2026)'),
      T('Last Earth flyby', 'Dernier survol de la Terre', '18 Jan 2029', '18 janv. 2029'),
      T('Jupiter arrival', 'Arrivée à Jupiter', 'July 2031', 'juillet 2031'),
      T('Moon flybys', 'Survols de lunes', '35 flybys of Ganymede, Callisto and Europa', '35 survols de Ganymède, Callisto et Europe'),
      T('Ganymede orbit', 'Orbite de Ganymède', 'from December 2034', 'à partir de décembre 2034'),
      T('Instruments', 'Instruments', '10', '10'),
      T('Route shown', 'Trajet affiché', 'approximate, between the 2026 and 2029 Earth flybys', 'approximatif, entre les survols de la Terre de 2026 et 2029')],
    facts: [['On 28 September 2026 it passed just 8,640 km above the Indian Ocean.', 'Le 28 septembre 2026, elle est passée à seulement 8 640 km au-dessus de l’océan Indien.'],
      ['It will be the first spacecraft to orbit a moon of another planet: Ganymede, the largest moon in the Solar System.', 'Ce sera le premier engin à se mettre en orbite autour de la lune d’une autre planète : Ganymède, la plus grande lune du système solaire.'],
      ['Its huge solar wings must catch enough sunlight at Jupiter, where the Sun is 25 times dimmer than at Earth.', 'Ses immenses ailes solaires doivent capter assez de lumière à Jupiter, où le Soleil est 25 fois plus faible que sur Terre.'],
      ['The final Earth flyby in 2029 stretches its orbit all the way out to Jupiter.', 'Le dernier survol de la Terre, en 2029, étire son orbite jusqu’à Jupiter.']] },

  SolarOrbiter: { intro: ['Solar Orbiter swoops closer to the Sun than Mercury, hiding behind a heat shield, and is slowly tilting its orbit to look down on the Sun’s poles, which no camera had ever seen before.',
      'Solar Orbiter plonge plus près du Soleil que Mercure, abrité derrière un bouclier thermique, et incline peu à peu son orbite pour regarder les pôles du Soleil, qu’aucune caméra n’avait jamais vus.'],
    tiles: [T('Launch', 'Lancement', '10 Feb 2020 · Atlas V, Cape Canaveral', '10 févr. 2020 · Atlas V, cap Canaveral'),
      T('Partners', 'Partenaires', 'ESA with NASA', 'l’ESA avec la NASA'),
      T('Closest to the Sun', 'Au plus près du Soleil', '0.29 AU, about 43 million km', '0,29 UA, environ 43 millions de km'),
      T('One orbit', 'Une orbite', 'about 6 months', 'environ 6 mois'),
      T('Tilt', 'Inclinaison', '17° now, 24° after the Venus flyby on 24 Dec 2026, 33° by 2029', '17° aujourd’hui, 24° après le survol de Vénus du 24 déc. 2026, 33° en 2029'),
      T('Next closest pass', 'Prochain passage au plus près', '6 Feb 2027', '6 févr. 2027'),
      T('Instruments', 'Instruments', '10: six cameras and telescopes, four that sample the solar wind', '10 : six caméras et télescopes, quatre qui analysent le vent solaire')],
    facts: [['In 2025 it took the first ever pictures of the Sun’s south pole.', 'En 2025, il a pris les toutes premières images du pôle sud du Soleil.'],
      ['Its heat shield faces sunlight up to about 13 times stronger than on Earth; small doors open in it to let the telescopes look out.', 'Son bouclier affronte une lumière jusqu’à environ 13 fois plus forte que sur Terre ; de petites portes s’y ouvrent pour laisser regarder les télescopes.'],
      ['Each pass of Venus pulls its orbit further out of the planets’ flat plane.', 'Chaque passage près de Vénus sort un peu plus son orbite du plan des planètes.'],
      ['It has spotted "campfires": countless tiny flares all over the Sun’s surface.', 'Il a repéré des « feux de camp » : d’innombrables minuscules éruptions partout à la surface du Soleil.']] },

  Euclid: { intro: ['Euclid is making the biggest 3D map of the dark universe: billions of galaxies across a third of the sky, to learn what dark matter and dark energy are.',
      'Euclid dresse la plus grande carte en 3D de l’Univers sombre : des milliards de galaxies sur un tiers du ciel, pour comprendre ce que sont la matière noire et l’énergie noire.'],
    tiles: [T('Launch', 'Lancement', '1 Jul 2023 · Falcon 9, Cape Canaveral', '1er juil. 2023 · Falcon 9, cap Canaveral'),
      T('Where', 'Où', 'around Sun–Earth L2, 1.5 million km away', 'autour du point L2 Soleil–Terre, à 1,5 million de km'),
      T('Mirror', 'Miroir', '1.2 m', '1,2 m'),
      T('Cameras', 'Instruments', 'VIS (visible light) and NISP (near-infrared)', 'VIS (lumière visible) et NISP (proche infrarouge)'),
      T('Survey', 'Relevé', 'about a third of the sky over 6 years', 'environ un tiers du ciel en 6 ans'),
      T('Neighbours', 'Voisins', 'James Webb, and Gaia until 2025', 'James Webb, et Gaia jusqu’en 2025')],
    facts: [['Dark matter and dark energy make up about 95% of the universe, yet no one knows what they are.', 'La matière noire et l’énergie noire forment environ 95 % de l’Univers, et pourtant personne ne sait ce qu’elles sont.'],
      ['Euclid measures how galaxies’ shapes are slightly bent by the gravity of unseen matter in front of them.', 'Euclid mesure comment la forme des galaxies est légèrement déformée par la gravité de la matière invisible devant elles.'],
      ['Its slanted sunshield, covered in solar cells, keeps the telescope cold and steady.', 'Son pare-soleil incliné, couvert de cellules solaires, garde le télescope froid et stable.']] },

  Gaia: { closed: true, intro: ['Gaia measured the positions, distances and motions of nearly 2 billion stars, the best map of our galaxy ever made. It stopped observing in January 2025, was switched off on 27 March 2025, and its next big catalogue comes out on 2 December 2026.',
      'Gaia a mesuré la position, la distance et le mouvement de près de 2 milliards d’étoiles : la meilleure carte de notre galaxie jamais réalisée. Il a cessé d’observer en janvier 2025, a été éteint le 27 mars 2025, et son prochain grand catalogue sort le 2 décembre 2026.'],
    tiles: [T('Launch', 'Lancement', '19 Dec 2013 · Soyuz, Kourou', '19 déc. 2013 · Soyouz, Kourou'),
      T('Observed', 'Observations', 'July 2014 to 15 January 2025', 'de juillet 2014 au 15 janvier 2025'),
      T('Switched off', 'Éteint', '27 Mar 2025', '27 mars 2025'),
      T('Stars measured', 'Étoiles mesurées', 'nearly 2 billion', 'près de 2 milliards'),
      T('Sunshield', 'Pare-soleil', 'about 10 m across', 'environ 10 m de diamètre'),
      T('Next data', 'Prochaines données', 'Data Release 4, 2 Dec 2026 (66 months of data)', 'Data Release 4, 2 déc. 2026 (66 mois de données)'),
      T('Final catalogue', 'Catalogue final', 'not before the end of 2030', 'pas avant fin 2030')],
    facts: [['Before it was switched off, it was nudged away from L2 so it would not drift back into the way of other telescopes.', 'Avant d’être éteint, il a été poussé loin de L2 pour ne pas revenir gêner les autres télescopes.'],
      ['It found a black hole 33 times the Sun’s mass hiding in our galaxy, Gaia BH3.', 'Il a trouvé un trou noir de 33 masses solaires caché dans notre galaxie, Gaia BH3.'],
      ['The Milky Way picture on this site uses Gaia’s data.', 'L’image de la Voie lactée de ce site utilise les données de Gaia.']] },

  Smile: { intro: ['Smile (Solar wind Magnetosphere Ionosphere Link Explorer) is a European–Chinese mission that takes X-ray and ultraviolet pictures of Earth’s invisible magnetic shield as the solar wind hits it, and watches the northern lights for 45 hours at a time.',
      'Smile (Solar wind Magnetosphere Ionosphere Link Explorer) est une mission européenne et chinoise qui photographie en rayons X et en ultraviolet le bouclier magnétique invisible de la Terre quand le vent solaire le frappe, et observe les aurores boréales pendant 45 heures d’affilée.'],
    tiles: [T('Launch', 'Lancement', '19 May 2026 · Vega-C, Kourou', '19 mai 2026 · Vega-C, Kourou'),
      T('Partners', 'Partenaires', 'ESA and the Chinese Academy of Sciences', 'l’ESA et l’Académie chinoise des sciences'),
      T('Orbit', 'Orbite', 'about 5,000 to 121,000 km, tilted 70°', 'environ 5 000 à 121 000 km, inclinée de 70°'),
      T('One loop', 'Un tour', 'about two days', 'environ deux jours'),
      T('Instruments', 'Instruments', '4: X-ray imager, UV camera, magnetometer, ion analyser', '4 : imageur X, caméra UV, magnétomètre, analyseur d’ions'),
      T('Mission', 'Durée', '3 years', '3 ans')],
    facts: [['From the top of its orbit, high over the North Pole, it sees the whole sunward edge of Earth’s magnetic field at once.', 'Du haut de son orbite, loin au-dessus du pôle Nord, il voit d’un coup tout le bord du champ magnétique terrestre tourné vers le Soleil.'],
      ['It sends its data down mostly when it swoops low over Antarctica.', 'Il envoie surtout ses données quand il passe au plus bas au-dessus de l’Antarctique.'],
      ['Its first ultraviolet footage showed an auroral substorm lighting up the polar sky.', 'Ses premières images ultraviolettes ont montré une sous-tempête aurorale illuminant le ciel polaire.']] },

  Ariane6: { intro: ['Ariane 6 is Europe’s heavy rocket, launched from Europe’s Spaceport in French Guiana. It comes in two versions: Ariane 62 with two boosters and Ariane 64 with four, shown here.',
      'Ariane 6 est le lanceur lourd européen, tiré depuis le port spatial de l’Europe en Guyane. Il existe en deux versions : Ariane 62 avec deux propulseurs d’appoint et Ariane 64 avec quatre, montré ici.'],
    tiles: [T('First flight', 'Premier vol', '9 Jul 2024 (Ariane 62)', '9 juil. 2024 (Ariane 62)'),
      T('First Ariane 64', 'Première Ariane 64', '12 Feb 2026, with 32 Amazon Leo satellites', '12 févr. 2026, avec 32 satellites Amazon Leo'),
      T('Height', 'Hauteur', '56 m (Ariane 62) or 62 m (Ariane 64 with the long fairing)', '56 m (Ariane 62) ou 62 m (Ariane 64 avec la longue coiffe)'),
      T('Main engine', 'Moteur principal', 'Vulcain 2.1 (liquid hydrogen and oxygen)', 'Vulcain 2.1 (hydrogène et oxygène liquides)'),
      T('Upper stage', 'Étage supérieur', 'Vinci, which can restart in space', 'Vinci, rallumable dans l’espace'),
      T('Launch pad', 'Pas de tir', 'ELA-4, Kourou', 'ELA-4, Kourou')],
    facts: [['Ariane 64 can lift more than 20 tonnes to low orbit, about twice as much as Ariane 62.', 'Ariane 64 peut placer plus de 20 tonnes en orbite basse, environ deux fois plus qu’Ariane 62.'],
      ['Amazon has booked 18 Ariane 6 launches for its Leo internet satellites.', 'Amazon a réservé 18 lancements d’Ariane 6 pour ses satellites Internet Leo.'],
      ['Being close to the equator gives every launch a free push from Earth’s spin.', 'La proximité de l’équateur donne à chaque lancement un coup de pouce gratuit grâce à la rotation de la Terre.'],
      ['On the pad the rocket stands inside a 90 m mobile gantry, which rolls back on rails before launch.', 'Sur le pas de tir, la fusée se tient dans un portique mobile de 90 m, qui recule sur des rails avant le décollage.']] },

  Rosetta: { closed: true, intro: ['Rosetta chased comet 67P for ten years, orbited it for two, and dropped the little Philae lander on it: the first landing on a comet. Both are still there, resting on the comet’s surface.',
      'Rosetta a poursuivi la comète 67P pendant dix ans, l’a accompagnée deux ans et y a largué le petit atterrisseur Philae : le premier atterrissage sur une comète. Tous deux y sont encore, posés à sa surface.'],
    tiles: [T('Launch', 'Lancement', '2 Mar 2004 · Ariane 5, Kourou', '2 mars 2004 · Ariane 5, Kourou'),
      T('Arrived at 67P', 'Arrivée à 67P', '6 Aug 2014', '6 août 2014'),
      T('Philae landed', 'Atterrissage de Philae', '12 Nov 2014', '12 nov. 2014'),
      T('Philae found', 'Philae retrouvé', 'September 2016, wedged in a dark crack', 'septembre 2016, coincé dans une fissure sombre'),
      T('Mission end', 'Fin de mission', '30 Sep 2016, Rosetta set down on the comet', '30 sept. 2016, Rosetta posée sur la comète'),
      T('Comet size', 'Taille de la comète', 'about 4 km long, shaped like a rubber duck', 'environ 4 km de long, en forme de canard en caoutchouc'),
      T('Rosetta’s wings', 'Ailes de Rosetta', '32 m tip to tip', '32 m d’envergure')],
    facts: [['Philae bounced twice before stopping in the shadows, so its batteries ran down after about 60 hours of work.', 'Philae a rebondi deux fois avant de s’arrêter à l’ombre : ses batteries se sont vidées après environ 60 heures de travail.'],
      ['Rosetta found that the comet’s water is different from Earth’s oceans, so comets like this one probably did not bring us our water.', 'Rosetta a découvert que l’eau de la comète est différente de celle des océans terrestres : les comètes comme celle-ci ne nous ont sans doute pas apporté notre eau.'],
      ['It also detected glycine, a building block of life, and phosphorus around the comet.', 'Elle a aussi détecté de la glycine, une brique du vivant, et du phosphore autour de la comète.'],
      ['The models here are drawn far larger than life: the real craft would be invisible specks on the comet.', 'Les modèles sont ici bien plus grands que nature : les vrais engins seraient des points invisibles sur la comète.']] },
});

// ---------------------------------------------------------------- menu: a group after "Europe on the ISS"
{
  const og = document.createElement('optgroup'); og.label = '🇪🇺 ESA missions';
  const groups = [...focusSel.querySelectorAll('optgroup')];
  const before = groups.find(g => g.label === '🇪🇺 Europe on the ISS') || groups.find(g => g.label === '🚀 SpaceX');
  before ? before.after(og) : focusSel.appendChild(og);
  for (const [k, t] of [['BepiColombo', 'BepiColombo at Mercury'], ['Hera', 'Hera at the asteroid Didymos'], ['Juice', 'Juice on its way to Jupiter'], ['SolarOrbiter', 'Solar Orbiter round the Sun'],
    ['Euclid', 'Euclid at L2'], ['Gaia', 'Gaia (retired)'], ['Smile', 'Smile round Earth'], ['Ariane6', 'Ariane 6 at Kourou'], ['Rosetta', 'Rosetta & Philae on comet 67P']]) {
    if (!bodies[k]) continue; const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); }
}

// ---------------------------------------------------------------- French
SS.i18nAdd?.({
  ui: { '🇪🇺 ESA missions': '🇪🇺 Missions de l’ESA' },
  name: { '🇪🇺 ESA missions': '🇪🇺 Missions de l’ESA', 'BepiColombo at Mercury': 'BepiColombo à Mercure', 'Hera at the asteroid Didymos': 'Hera à l’astéroïde Didymos', 'Juice on its way to Jupiter': 'Juice en route vers Jupiter',
    'Solar Orbiter round the Sun': 'Solar Orbiter autour du Soleil', 'Euclid at L2': 'Euclid au point L2', 'Gaia (retired)': 'Gaia (retiré)', 'Smile round Earth': 'Smile autour de la Terre',
    'Ariane 6 at Kourou': 'Ariane 6 à Kourou', 'Rosetta & Philae on comet 67P': 'Rosetta et Philae sur la comète 67P', 'Hera · Didymos': 'Hera · Didymos', 'Rosetta & Philae': 'Rosetta et Philae', '🚀 Ariane 6': '🚀 Ariane 6' },
  cat: { 'Spacecraft · Mercury orbiters (ESA/JAXA)': 'Engin spatial · orbiteurs de Mercure (ESA/JAXA)', 'Spacecraft · planetary defence': 'Engin spatial · défense planétaire',
    'Spacecraft · Jupiter Icy Moons Explorer': 'Engin spatial · explorateur des lunes glacées de Jupiter', 'Spacecraft · Sun explorer (ESA/NASA)': 'Engin spatial · explorateur du Soleil (ESA/NASA)',
    'Space telescope · dark universe': 'Télescope spatial · Univers sombre', 'Space telescope · star mapper (retired)': 'Télescope spatial · cartographe des étoiles (retiré)',
    'Spacecraft · solar wind and Earth’s magnetic shield (ESA/China)': 'Engin spatial · vent solaire et bouclier magnétique terrestre (ESA/Chine)', 'Rocket · Europe’s heavy launcher': 'Fusée · lanceur lourd européen',
    'Spacecraft · comet orbiter and lander (2004–2016)': 'Engin spatial · orbiteur et atterrisseur de comète (2004–2016)' },
  dist: { 'arriving in orbit around Mercury': 'en train de se mettre en orbite autour de Mercure', 'at the asteroid pair Didymos and Dimorphos': 'auprès du couple d’astéroïdes Didymos et Dimorphos',
    'on its way to Jupiter, arriving July 2031': 'en route vers Jupiter, arrivée en juillet 2031', 'goes round the Sun every ~6 months, as close as 0.29 AU': 'tourne autour du Soleil en ~6 mois, jusqu’à 0,29 UA',
    'at Sun–Earth L2, 1.5 million km beyond Earth': 'au point L2 Soleil–Terre, à 1,5 million de km au-delà de la Terre', 'retired in 2025, drifting away from L2': 'retiré en 2025, s’éloigne de L2',
    'loops from 5,000 to 121,000 km above Earth': 'boucle de 5 000 à 121 000 km au-dessus de la Terre', 'ELA-4 pad, Europe’s Spaceport, Kourou, French Guiana': 'pas de tir ELA-4, port spatial de l’Europe, Kourou, Guyane',
    'at rest on comet 67P/Churyumov–Gerasimenko': 'posés sur la comète 67P/Tchourioumov-Guérassimenko' },
});
