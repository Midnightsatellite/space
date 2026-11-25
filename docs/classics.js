// =====================================================================
// Three more classics from NASA 3D Resources (github.com/nasa/NASA-3D-Resources), full models:
//  · Saturn V, standing on pad 39A at Kennedy Space Center
//  · Stardust, at comet Wild 2 (81P), the comet it flew through in 2004
//  · Deep Impact, at comet Tempel 1 (9P), the comet it hit in 2005
// Each model loads only when you fly to it. Craft are drawn much larger than life.
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const SS = window.SS;
const { bodies, sim, flyTo, focusSel } = SS;
const { info } = SS.cosmos;
const { smallBody, nearLabel, PL, lumpy } = SS.extras;
const special = SS.more.special, D = SS.more.cards2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const T = (l, lf, v, vf) => [l, lf, v, vf];
const q = new THREE.Quaternion(), wp = V(), cp = V();
const loader = new GLTFLoader();
loader.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/').setDecoderConfig({ type: 'wasm' }));   // Stardust and Deep Impact are Draco-compressed
const LOAD = SS.fleet?.LOAD || {};

// a placeholder that turns into the full model the first time you fly to it.
// size = the model's longest side; base = sit it on its lowest point (for a rocket on a pad)
function model(key, file, size, base = false) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.BoxGeometry(size * 0.3, size * (base ? 1 : 0.3), size * 0.3), new THREE.MeshStandardMaterial({ color: 0xcfcfcf, roughness: 0.6 }));
  if (base) stand.position.y = size / 2;
  g.add(stand);
  let state = 0;
  const load = () => {
    if (state) return; state = 1;
    loader.load('models/' + file + new URL(import.meta.url).search, gl => {
      const m = gl.scene; m.updateMatrixWorld(true);
      m.traverse(o => { if (!o.isMesh) return; if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        for (const mt of [].concat(o.material)) { if (mt.metalness > 0.6) mt.metalness = 0.6; mt.side = THREE.DoubleSide; } });
      const box = new THREE.Box3().setFromObject(m), z = box.getSize(V()), k = size / Math.max(z.x, z.y, z.z), c = box.getCenter(V());
      if (base) c.y = box.min.y;
      m.position.sub(c).multiplyScalar(k); m.scale.multiplyScalar(k);
      g.remove(stand); g.add(m); state = 2;
    }, undefined, () => { state = 0; });
  };
  LOAD[key] = load;
  return { g, load };
}
if (!SS.fleet) { const prev = SS.onFocus; SS.onFocus = key => { LOAD[key]?.(); prev(key); }; }

// ---------------------------------------------------------------- 1. NASA's rocket line-up at Cape Canaveral
// Like Kennedy's real Rocket Garden: three rockets side by side, all at one scale (Saturn V 110.6 m),
// drawn far larger than life so they can be seen on the globe. Their real pads are only a few km apart.
const ROCKETS = [   // key, file, metres tall, label, offset along the coast (north +), card category, where
  ['JupiterC', 'jupiterc.glb', 21.2, 'Jupiter-C', -0.05, 'Rocket · launched Explorer 1, 1958', 'Launch Complex 26A, Cape Canaveral'],
  ['SaturnV', 'saturnv.glb', 110.6, 'Saturn V', 0, 'Rocket · NASA’s Moon rocket, 1967–1973', 'pad 39A, Kennedy Space Center'],
  ['SLS', 'sls.glb', 98.1, 'SLS', 0.058, 'Rocket · NASA’s Artemis Moon rocket', 'pad 39B, Kennedy Space Center'],
];
{
  const earthMesh = PL.Earth.tilted.children[0], lat = 28.55 * D2R, lon = -80.6 * D2R, PER_M = 0.075 / 110.6;
  const n = V(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).normalize();
  const north = V(-Math.sin(lat) * Math.cos(lon), Math.cos(lat), Math.sin(lat) * Math.sin(lon)).normalize();
  const loads = [];
  for (const [key, file, m, label, off, cat, where] of ROCKETS) {
    const up = n.clone().addScaledVector(north, off).normalize();
    const site = new THREE.Group(); site.position.copy(up); site.quaternion.setFromUnitVectors(V(0, 1, 0), up); earthMesh.add(site);
    const h = m * PER_M, { g, load } = model(key, file, h, true); site.add(g); loads.push(load);
    const top = new THREE.Object3D(); top.position.y = h * 0.8; site.add(top);
    nearLabel(top, '🚀 ' + label, 0.015, key, 'craft', 3);
    bodies[key] = { obj: top, radius: h * 0.5, view: Math.max(0.08, h * 2.6), dir: () => { site.getWorldQuaternion(q); return V(1, 0.1, 0.7).normalize().applyQuaternion(q); } };
    info(key, label, cat, 'shown at ' + where + ' (with the other rockets, much larger than life)', 'See card.');
    special[key] = () => flyTo(key);
  }
  // flying to any of them loads the whole line-up, so the neighbours are real models too
  for (const [key] of ROCKETS) { const one = LOAD[key]; LOAD[key] = () => { one(); loads.forEach(f => f()); }; }
  // the whole line-up in one view
  const mid = new THREE.Object3D(); mid.position.copy(n.clone().addScaledVector(north, 0).normalize().multiplyScalar(1.03)); earthMesh.add(mid);
  const eastL = V(-Math.sin(lon), 0, -Math.cos(lon));
  bodies.RocketGarden = { obj: mid, radius: 0.1, view: 0.36, dir: () => { earthMesh.getWorldQuaternion(q); const up = mid.getWorldPosition(wp).clone().sub(earthMesh.getWorldPosition(cp)).normalize();
    return eastL.clone().applyQuaternion(q).multiplyScalar(0.9).add(up.multiplyScalar(0.5)).normalize(); } };
  info('RocketGarden', 'NASA rocket line-up', 'Rockets · from the first satellite to Artemis', 'Cape Canaveral, Florida (much larger than life)', 'See card.');
  special.RocketGarden = () => { loads.forEach(f => f()); flyTo('RocketGarden'); };
}

// ---------------------------------------------------------------- 2 and 3. A probe beside its comet
function atComet({ key, file, name, el, perihelionMs, nucleus, color, cat, distStr, offset }) {
  const g = new THREE.Group();
  const rock = new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 1, emissive: 0x0c0b0a });
  const nuc = new THREE.Mesh(lumpy(nucleus.r, 0.25, nucleus.seed, nucleus.stretch), rock); g.add(nuc);
  const { g: craft } = model(key, file, 0.07); g.add(craft);
  sim.push(dt => { nuc.rotation.y += dt * 0.6; });
  const sb = smallBody({ key, name, el, mesh: g, color, perihelionMs, cat, distStr, fact: 'See card.' });
  const toSun = V(), side = V();
  sim.push(() => {   // keep the comet system steady; the probe waits on the sunlit side, a little off to one side, facing the comet
    g.rotation.y = 0; g.getWorldPosition(cp); toSun.copy(cp).negate().normalize(); side.set(0, 1, 0).cross(toSun).normalize();
    craft.position.copy(toSun).multiplyScalar(offset[0]).addScaledVector(side, offset[2]).add(V(0, offset[1], 0)); craft.lookAt(cp);
  });
  Object.assign(bodies[key], { radius: 0.12, view: 0.5, dir: () => { g.getWorldPosition(cp); const s = cp.clone().negate().normalize(); return s.multiplyScalar(0.75).add(V(0, 1, 0).cross(s).normalize().multiplyScalar(0.6)).add(V(0, 0.3, 0)).normalize(); } });
  special[key] = () => flyTo(key);
}
// Wild 2: a 3.45 AU, e 0.5378, i 3.24°, node 136.10°, peri 41.54° (elements of Nov 2025); perihelion mid-December 2022, every 6.4 years
atComet({ key: 'Stardust', file: 'stardust.glb', name: 'Stardust · comet Wild 2', color: 0x9fe0ff,
  el: { a: 3.45, e: 0.5378, i: 3.24, node: 136.10, peri: 41.54 }, perihelionMs: Date.UTC(2022, 11, 17),
  nucleus: { r: 0.045, seed: 41, stretch: [1.1, 0.85, 1] }, offset: [0.15, 0.03, 0.09],
  cat: 'Spacecraft · NASA comet sample return, 1999–2011', distStr: 'shown at comet Wild 2, which it flew through in 2004' });
// Tempel 1 after its 2024 pass near Jupiter: i 10.47°, node 68.64°, peri 179.54°, next perihelion 12 Feb 2028 at 1.77 AU
atComet({ key: 'DeepImpact', file: 'deepimpact.glb', name: 'Deep Impact · comet Tempel 1', color: 0xffc48a,
  el: { a: 3.2, e: 0.447, i: 10.47, node: 68.64, peri: 179.54 }, perihelionMs: Date.UTC(2028, 1, 12),
  nucleus: { r: 0.05, seed: 9, stretch: [1.35, 0.85, 0.9] }, offset: [0.16, 0.03, -0.09],
  cat: 'Spacecraft · NASA comet impactor, 2005–2013', distStr: 'shown at comet Tempel 1, which it hit in 2005' });

// ---------------------------------------------------------------- cards
const closed = true;
Object.assign(D, {
  RocketGarden: { intro: ['Three NASA rockets side by side, at one scale: the little Jupiter-C that launched America’s first satellite in 1958, the giant Saturn V that took astronauts to the Moon, and today’s SLS for Artemis. Kennedy Space Center has a real "Rocket Garden" like this.',
      'Trois fusées de la NASA côte à côte, à la même échelle : la petite Jupiter-C qui a lancé le premier satellite américain en 1958, la géante Saturn V qui a emmené des astronautes sur la Lune, et l’actuelle SLS d’Artemis. Le centre spatial Kennedy a un vrai « jardin des fusées » comme celui-ci.'],
    tiles: [T('Smallest', 'La plus petite', 'Jupiter-C, 21 m', 'Jupiter-C, 21 m'), T('Tallest', 'La plus haute', 'Saturn V, 110.6 m', 'Saturn V, 110,6 m'), T('Scale', 'Échelle', 'all the same, much larger than life', 'la même pour toutes, bien plus grandes qu’en vrai')],
    facts: [['Click a rocket’s name to fly to it and read its story.', 'Cliquez sur le nom d’une fusée pour vous en approcher et lire son histoire.']] },
  JupiterC: { closed, intro: ['On 31 January 1958 this Jupiter-C rocket launched Explorer 1, the first American satellite, less than four months after the Soviet Sputnik. Explorer 1 discovered the Van Allen radiation belts around the Earth.',
      'Le 31 janvier 1958, cette fusée Jupiter-C a lancé Explorer 1, le premier satellite américain, moins de quatre mois après le Spoutnik soviétique. Explorer 1 a découvert les ceintures de radiation de Van Allen autour de la Terre.'],
    tiles: [T('Launch', 'Lancement', '31 Jan 1958, 22:48 local time', '31 janv. 1958, 22 h 48 heure locale'), T('Height', 'Hauteur', '21.2 m', '21,2 m'), T('Pad', 'Pas de tir', 'Launch Complex 26A', 'Complexe de lancement 26A'), T('Built by', 'Construite par', 'the Army team of Wernher von Braun', 'l’équipe de l’armée de Wernher von Braun')],
    facts: [['Explorer 1 weighed only about 14 kg, and it kept circling Earth until 1970.', 'Explorer 1 ne pesait qu’environ 14 kg, et a tourné autour de la Terre jusqu’en 1970.']] },
  SLS: { closed, intro: ['The Space Launch System is NASA’s rocket for the Artemis missions back to the Moon. Its orange core stage carries four RS-25 engines that once flew on the Space Shuttle, with two white solid-rocket boosters at its sides and the Orion capsule on top.',
      'Le Space Launch System est la fusée de la NASA pour les missions Artemis vers la Lune. Son étage central orange porte quatre moteurs RS-25 qui ont autrefois volé sur la navette spatiale, avec deux propulseurs blancs à poudre sur les côtés et la capsule Orion au sommet.'],
    tiles: [T('First flight', 'Premier vol', 'Artemis I, 16 Nov 2022, uncrewed', 'Artemis I, 16 nov. 2022, sans équipage'), T('First crew', 'Premier équipage', 'Artemis II, 1 Apr 2026, around the Moon', 'Artemis II, 1er avril 2026, autour de la Lune'),
      T('Height', 'Hauteur', '98 m', '98 m'), T('Pad', 'Pas de tir', '39B, Kennedy Space Center', '39B, centre spatial Kennedy')],
    facts: [['At lift-off it pushes harder than the Saturn V did, about 39 meganewtons.', 'Au décollage, elle pousse plus fort que la Saturn V, environ 39 méganewtons.'], ['The core stage holds about 2.7 million litres of liquid hydrogen and oxygen.', 'L’étage central contient environ 2,7 millions de litres d’hydrogène et d’oxygène liquides.']] },
  SaturnV: { closed, intro: ['Saturn V is the rocket that took people to the Moon. Standing 110.6 metres tall, taller than Big Ben, it is still one of the most powerful rockets ever flown. Every Apollo Moon crew rode one, including Apollo 11 from pad 39A on 16 July 1969.',
      'Saturn V est la fusée qui a emmené des humains sur la Lune. Haute de 110,6 mètres, plus que Big Ben, elle reste l’une des fusées les plus puissantes jamais lancées. Chaque équipage Apollo parti vers la Lune en a pris une, dont Apollo 11 depuis le pas de tir 39A le 16 juillet 1969.'],
    tiles: [T('First launch', 'Premier lancement', '9 Nov 1967 · Apollo 4, uncrewed', '9 nov. 1967 · Apollo 4, sans équipage'), T('Last launch', 'Dernier lancement', '14 May 1973 · lifting Skylab', '14 mai 1973 · avec Skylab'),
      T('Launches', 'Lancements', '13, none lost', '13, aucun perdu'), T('Weight at lift-off', 'Masse au décollage', 'about 2,900 tonnes', 'environ 2 900 tonnes'), T('Stages', 'Étages', '3, then the Apollo spacecraft on top', '3, puis le vaisseau Apollo au sommet')],
    facts: [['Its five first-stage F-1 engines burned about 15 tonnes of fuel every second.', 'Les cinq moteurs F-1 de son premier étage brûlaient environ 15 tonnes de carburant par seconde.'],
      ['24 astronauts flew to the Moon on Saturn Vs; 12 of them walked on it.', '24 astronautes sont allés vers la Lune sur des Saturn V ; 12 d’entre eux y ont marché.'],
      ['Three are left on display: at Kennedy Space Center, Johnson Space Center and the US Space & Rocket Center in Huntsville.', 'Il en reste trois exposées : au centre spatial Kennedy, au centre spatial Johnson et à l’US Space & Rocket Center de Huntsville.']] },
  Stardust: { closed, intro: ['Stardust flew through the dusty cloud around comet Wild 2 and caught tiny grains of it in a glowing, feather-light material called aerogel. Two years later its capsule parachuted down in the Utah desert: the first comet dust ever brought back to Earth.',
      'Stardust a traversé le nuage de poussière autour de la comète Wild 2 et en a capturé de minuscules grains dans un matériau très léger et lumineux, l’aérogel. Deux ans plus tard, sa capsule s’est posée en parachute dans le désert de l’Utah : la première poussière de comète jamais rapportée sur Terre.'],
    tiles: [T('Launch', 'Lancement', '7 Feb 1999 · Delta II, Cape Canaveral', '7 févr. 1999 · Delta II, cap Canaveral'), T('Through the comet', 'Dans la comète', '2 Jan 2004, about 240 km from it', '2 janv. 2004, à environ 240 km'),
      T('Capsule home', 'Retour de la capsule', '15 Jan 2006 · Utah, USA', '15 janv. 2006 · Utah, États-Unis'), T('Switched off', 'Éteinte', '24 Mar 2011', '24 mars 2011')],
    facts: [['In the comet dust, scientists found glycine, one of the building blocks of life.', 'Dans la poussière de comète, les scientifiques ont trouvé de la glycine, une des briques de la vie.'],
      ['In 2011 it visited a second comet, Tempel 1, and photographed the crater left by Deep Impact.', 'En 2011, elle a visité une seconde comète, Tempel 1, et photographié le cratère laissé par Deep Impact.'],
      ['Volunteers at home searched millions of images of the aerogel for dust tracks ("Stardust@home").', 'Des bénévoles ont fouillé chez eux des millions d’images de l’aérogel pour trouver les traces de poussière (« Stardust@home »).']] },
  DeepImpact: { closed, intro: ['Deep Impact fired a 372 kg copper-tipped impactor into comet Tempel 1 on 4 July 2005, then watched from a safe distance as the crash threw up a huge bright cloud, showing what a comet is made of beneath its surface.',
      'Deep Impact a lancé un impacteur de 372 kg à pointe de cuivre sur la comète Tempel 1 le 4 juillet 2005, puis a observé de loin l’énorme nuage brillant soulevé par le choc, qui a révélé ce qu’il y a sous la surface d’une comète.'],
    tiles: [T('Launch', 'Lancement', '12 Jan 2005 · Delta II, Cape Canaveral', '12 janv. 2005 · Delta II, cap Canaveral'), T('Impact', 'Impact', '4 Jul 2005, at about 37,000 km/h', '4 juil. 2005, à environ 37 000 km/h'),
      T('Second comet', 'Seconde comète', 'Hartley 2, 4 Nov 2010 (as "EPOXI")', 'Hartley 2, 4 nov. 2010 (sous le nom « EPOXI »)'), T('Last contact', 'Dernier contact', 'August 2013', 'août 2013')],
    facts: [['The cloud showed the comet was covered in fine, powdery dust, softer than expected.', 'Le nuage a montré que la comète était couverte d’une poussière fine et poudreuse, plus molle que prévu.'],
      ['The crater was hidden by the dust; Stardust photographed it six years later.', 'Le cratère était caché par la poussière ; Stardust l’a photographié six ans plus tard.'],
      ['It also hunted for planets around other stars, watching stars dim as their planets passed in front.', 'Elle a aussi cherché des planètes autour d’autres étoiles, en guettant les baisses de lumière quand elles passaient devant.']] },
});

// ---------------------------------------------------------------- menu: a 🚀 NASA rockets group, and the comet probes in 🏛 Space history
{
  const hist = focusSel.querySelector('option[value="Skylab"]')?.parentElement;
  const og = document.createElement('optgroup'); og.label = '🚀 NASA rockets'; hist ? hist.before(og) : focusSel.appendChild(og);
  for (const [k, t] of [['RocketGarden', '🚀 NASA rocket line-up'], ['JupiterC', 'Jupiter-C (Explorer 1, 1958)'], ['SaturnV', 'Saturn V (1967–1973)'], ['SLS', 'SLS (Artemis)']]) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); }
  const add = (k, t, before) => { if (!hist || !bodies[k]) return; const o = document.createElement('option'); o.value = k; o.textContent = t; const b = hist.querySelector(`option[value="${before}"]`); b ? b.before(o) : hist.appendChild(o); };
  add('Stardust', 'Stardust at comet Wild 2 (1999–2011)', 'LADEE');
  add('DeepImpact', 'Deep Impact at comet Tempel 1 (2005–2013)', 'LADEE');
}

SS.i18nAdd?.({
  ui: { '🚀 NASA rockets': '🚀 Fusées de la NASA', '🚀 NASA rocket line-up': '🚀 Les fusées de la NASA côte à côte' },
  name: { '🚀 NASA rockets': '🚀 Fusées de la NASA', '🚀 NASA rocket line-up': '🚀 Les fusées de la NASA côte à côte', 'NASA rocket line-up': 'Les fusées de la NASA côte à côte', 'Mercury-Redstone (Alan Shepard, 1961)': 'Mercury-Redstone (Alan Shepard, 1961)', 'Mercury-Atlas (John Glenn, 1962)': 'Mercury-Atlas (John Glenn, 1962)', 'Stardust at comet Wild 2 (1999–2011)': 'Stardust à la comète Wild 2 (1999–2011)',
    'Deep Impact at comet Tempel 1 (2005–2013)': 'Deep Impact à la comète Tempel 1 (2005–2013)', 'Stardust · comet Wild 2': 'Stardust · comète Wild 2', 'Deep Impact · comet Tempel 1': 'Deep Impact · comète Tempel 1' },
  cat: { 'Rocket · NASA’s Moon rocket, 1967–1973': 'Fusée · la fusée lunaire de la NASA, 1967–1973', 'Rocket · launched Explorer 1, 1958': 'Fusée · a lancé Explorer 1, 1958', 'Rocket · first American in space, 1961': 'Fusée · premier Américain dans l’espace, 1961', 'Rocket · first American in orbit, 1962': 'Fusée · premier Américain en orbite, 1962', 'Rocket · NASA’s Artemis Moon rocket': 'Fusée · la fusée lunaire Artemis de la NASA', 'Rockets · from the first satellite to Artemis': 'Fusées · du premier satellite à Artemis', 'Spacecraft · NASA comet sample return, 1999–2011': 'Engin spatial · retour d’échantillons de comète (NASA), 1999–2011',
    'Spacecraft · NASA comet impactor, 2005–2013': 'Engin spatial · impacteur de comète (NASA), 2005–2013' },
  dist: { 'Cape Canaveral, Florida (much larger than life)': 'cap Canaveral, Floride (bien plus grandes qu’en vrai)',
    ...Object.fromEntries(ROCKETS.map(r => ['shown at ' + r[6] + ' (with the other rockets, much larger than life)', 'montrée à ' + r[6].replace('Launch Complex', 'complexe de lancement').replace('pad', 'pas de tir').replace('Kennedy Space Center', 'centre spatial Kennedy').replace('Cape Canaveral', 'cap Canaveral') + ' (avec les autres fusées, bien plus grande qu’en vrai)'])), 'shown at comet Wild 2, which it flew through in 2004': 'montrée à la comète Wild 2, qu’elle a traversée en 2004',
    'shown at comet Tempel 1, which it hit in 2005': 'montrée à la comète Tempel 1, qu’elle a percutée en 2005' },
});
