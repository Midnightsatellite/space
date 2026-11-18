// =====================================================================
// SpaceX: Starman's Tesla Roadster (on its real orbit round the Sun), a Crew Dragon docked to the ISS,
// Starship and its launch tower at Starbase, and a train of Starlink satellites in low orbit.
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies, sim, flyTo, focusSel } = SS;
const { info } = SS.cosmos;
const { smallBody, nearLabel, PL } = SS.extras;
const special = SS.more.special, D = SS.more.cards2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const M = (color, metal = 0.4, rough = 0.5, emi = 0x000000) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emi });
const mat = { steel: M(0xd9dde3, 0.6, 0.3, 0x8a8e94), white: M(0xf4f4f2, 0.1, 0.5, 0x555555), black: M(0x16161a, 0.3, 0.7, 0x050506),
  red: M(0xc0141c, 0.35, 0.3, 0x4a0608), tyre: M(0x1a1a1a, 0.1, 0.9), grey: M(0x6c7078, 0.5, 0.5, 0x1a1c20), cell: M(0x1d2f74, 0.55, 0.3, 0x0e1a44),
  glass: M(0x223344, 0.6, 0.1, 0x0a1018), visor: M(0x3a2a10, 0.9, 0.15, 0x1a1206), tower: M(0x8a8f96, 0.6, 0.45, 0x4a4d52) };
const box = (x, y, z, m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
const cyl = (r1, r2, h, m, n = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n), m);
const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const add = (g, ...o) => { for (const k of o) g.add(k); return g; };
const rod = (p, q, r, m) => { const d = q.clone().sub(p), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), m);
  o.position.copy(p).add(q).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; };
const T = (l, lf, v, vf) => [l, lf, v, vf];

import { buildRoadster, buildDragon, buildStarship, buildStarlink } from './spacexmodels.js?v=38';
export { buildRoadster, buildDragon, buildStarship, buildStarlink };

// ---------------------------------------------------------------- 1. Starman's Roadster round the Sun
{
  const car = buildRoadster(); car.scale.setScalar(0.07); const holder = new THREE.Group(); holder.add(car);
  sim.push(dt => { car.rotation.x += dt * 0.03; car.rotation.z += dt * 0.02; });
  // elements from JPL Horizons (via where-is-tesla-roadster.space); last perihelion about 20 Sep 2025, next about 1 Apr 2027
  smallBody({ key: 'Roadster', name: 'Starman’s Roadster', el: { a: 1.3253, e: 0.2559, i: 1.074, node: 316.80, peri: 177.90 }, mesh: holder, color: 0xff4040,
    perihelionMs: Date.UTC(2025, 8, 20, 21), cat: 'Spacecraft · car in space', distStr: 'orbits the Sun every 557 days, out past Mars',
    fact: 'A red sports car with a dummy astronaut at the wheel, launched in 2018 on the first Falcon Heavy. It will circle the Sun for millions of years.' });
  bodies.Roadster.view = 0.9; bodies.Roadster.radius = 0.2;
}

// ---------------------------------------------------------------- 2. Crew Dragon docked to the ISS
{
  const iss = bodies.ISS.obj, dr = buildDragon(true);
  const holder = new THREE.Group(); holder.scale.setScalar(1 / 24.5); holder.position.set(0, 0, -1.12); holder.rotation.x = Math.PI / 2; holder.add(dr); dr.position.y = -6.45;   // nose into the front port
  iss.add(holder);
  const dq = new THREE.Quaternion();   // look at the capsule from the side, a little towards the trunk, so its windows and lettering show
  bodies.Dragon = { obj: holder, radius: 0.007, view: 0.03, dir: () => { dr.getWorldQuaternion(dq); return V(0.8, -0.27, 0.53).applyQuaternion(dq).normalize(); } };
  info('Dragon', 'Crew Dragon', 'Spacecraft · crew capsule', 'docked to the ISS, about 400 km above Earth',
    'SpaceX’s capsule that carries astronauts to and from the International Space Station. Four people ride inside, and it docks on its own.');
}

// ---------------------------------------------------------------- 3. Starship at Starbase
{
  const earthMesh = PL.Earth.tilted.children[0], lat = 25.997 * D2R, lon = -97.157 * D2R;
  const n = V(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).normalize();
  const site = new THREE.Group(); site.position.copy(n).multiplyScalar(1.0); site.quaternion.setFromUnitVectors(V(0, 1, 0), n); earthMesh.add(site);
  const ship = buildStarship(); ship.scale.setScalar(0.00042); site.add(ship);
  const top = new THREE.Object3D(); top.position.y = 0.05; site.add(top);
  nearLabel(top, '🚀 Starship', 0.02, 'Starship', 'craft', 3);
  const wp = V(), ep = V();
  const q = new THREE.Quaternion();
  bodies.Starship = { obj: top, radius: 0.035, view: 0.16, dir: () => { site.getWorldQuaternion(q); return V(1, 0.3, 0.25).normalize().applyQuaternion(q); } };   // from the side, a little above
  info('Starship', 'Starship', 'Rocket · fully reusable (in testing)', 'Starbase, Texas, USA',
    'The biggest and most powerful rocket ever flown: 124 m of stainless steel. In September 2026 it reached orbit for the first time.');
}

// ---------------------------------------------------------------- 4. Starlink: a "train" of real-looking satellites in low orbit
{
  const earth = bodies.Earth.obj, R = 1.12, N = 18, gap = 0.03, sc = 0.0008;
  const plane = new THREE.Group(); plane.rotation.set(53 * D2R, 1.3, 0); earth.add(plane);
  const spin = new THREE.Group(); plane.add(spin);
  const sats = [];
  for (let i = 0; i < N; i++) {
    const a = i * gap, s = buildStarlink(); s.scale.setScalar(sc);
    s.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
    const up = V(Math.cos(a), 0, Math.sin(a)), fwd = V(-Math.sin(a), 0, Math.cos(a));
    s.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, -1, 0), up, fwd));
    s.rotation.y += (i % 3 - 1) * 0.04; spin.add(s); sats.push(s);
  }
  sim.push(dt => { spin.rotation.y -= dt * 0.54; });
  const mid = sats[N >> 1];
  nearLabel(sats[N - 1], 'Starlink', 30 / sc * 0.0008, 'Starlink', 'craft', 0.6);
  const e = V(), m = V();
  bodies.Starlink = { obj: mid, radius: 0.03, view: 0.12,
    dir: () => { earth.getWorldPosition(e); mid.getWorldPosition(m); const out = m.clone().sub(e).normalize(); const along = V(0, 1, 0).applyQuaternion(plane.getWorldQuaternion(new THREE.Quaternion())); return out.multiplyScalar(0.9).add(along.multiplyScalar(0.6)).normalize(); } };
}
info('Starlink', 'Starlink', 'Satellite constellation · internet', 'about 340–570 km above Earth',
  'A "train" of Starlink V2 Mini satellites soon after launch, each a flat body with two big solar wings about 30 m across. More than 11,000 of them now circle Earth.');
special.Starlink = () => flyTo('Starlink');

// ---------------------------------------------------------------- cards
Object.assign(D, {
  Roadster: { intro: ['On 6 February 2018 the first Falcon Heavy rocket sent a red Tesla Roadster sports car, with a mannequin called Starman in a SpaceX suit at the wheel, into orbit around the Sun. It is still out there.',
      'Le 6 février 2018, la première fusée Falcon Heavy a envoyé en orbite autour du Soleil une voiture de sport Tesla Roadster rouge, avec au volant un mannequin en combinaison SpaceX appelé Starman. Elle y est toujours.'],
    tiles: [T('Launch', 'Lancement', '6 Feb 2018 · Falcon Heavy’s first flight, pad 39A, Kennedy Space Center', '6 févr. 2018 · premier vol de la Falcon Heavy, pas de tir 39A, centre spatial Kennedy'),
      T('Orbit', 'Orbite', 'round the Sun every 557 days, tilted about 1°', 'autour du Soleil en 557 jours, inclinée d’environ 1°'),
      T('Closest to the Sun', 'Au plus près du Soleil', '0.986 AU (147.5 million km), just inside Earth’s orbit', '0,986 UA (147,5 millions de km), juste à l’intérieur de l’orbite terrestre'),
      T('Farthest', 'Au plus loin', '1.664 AU (249 million km), beyond Mars', '1,664 UA (249 millions de km), au-delà de Mars'),
      T('Next perihelion', 'Prochain périhélie', 'about 1 April 2027', 'vers le 1er avril 2027'),
      T('Laps done', 'Tours accomplis', 'about 5.5 laps of the Sun by mid-2026', 'environ 5,5 tours du Soleil à la mi-2026'),
      T('Next near Earth', 'Prochain passage', '2047, about 5 million km away', '2047, à environ 5 millions de km'),
      T('Tracking', 'Suivi', 'no radio: its position is calculated from its orbit', 'aucune radio : sa position est calculée à partir de son orbite')],
    facts: [['It was a test payload: a new rocket’s first flight usually carries a block of concrete, so SpaceX sent the boss’s own car instead.', 'C’était une charge d’essai : le premier vol d’une nouvelle fusée emporte d’habitude un bloc de béton, alors SpaceX a envoyé la voiture du patron.'],
      ['“Don’t Panic!” is written on the dashboard, a nod to The Hitchhiker’s Guide to the Galaxy, and a circuit board says “Made on Earth by humans”.', '« Don’t Panic! » (Pas de panique !) est écrit sur le tableau de bord, un clin d’œil au Guide du voyageur galactique, et un circuit imprimé porte « Fabriqué sur Terre par des humains ».'],
      ['Cameras sent back live pictures of Starman with Earth behind him for a few hours after launch.', 'Des caméras ont envoyé des images en direct de Starman avec la Terre derrière lui pendant quelques heures après le lancement.'],
      ['Its path crosses the orbit of Mars, but it will not come near Mars or hit it any time soon.', 'Sa trajectoire croise l’orbite de Mars, mais elle ne s’approchera pas de Mars et ne la percutera pas avant très longtemps.'],
      ['In January 2025 astronomers spotted a "new asteroid", 2018 CN41. It turned out to be the Roadster, and the listing was withdrawn.', 'En janvier 2025, des astronomes ont repéré un « nouvel astéroïde », 2018 CN41. C’était en fait le Roadster, et l’annonce a été retirée.'],
      ['Scientists expect sunlight and radiation to be slowly breaking down its paint, tyres and seats.', 'Les scientifiques pensent que la lumière du Soleil et les radiations dégradent peu à peu sa peinture, ses pneus et ses sièges.']] },

  Dragon: { intro: ['Crew Dragon is SpaceX’s capsule for astronauts. Since 2020 it has carried most crews to the International Space Station, launched on a Falcon 9 rocket from Florida, and it docks to the station on its own.',
      'Crew Dragon est la capsule de SpaceX pour les astronautes. Depuis 2020, elle transporte la plupart des équipages vers la Station spatiale internationale, lancée par une fusée Falcon 9 depuis la Floride, et s’amarre seule à la station.'],
    tiles: [T('First crew', 'Premier équipage', 'Demo-2, 30 May 2020: Bob Behnken and Doug Hurley', 'Demo-2, 30 mai 2020 : Bob Behnken et Doug Hurley'),
      T('Size', 'Taille', 'about 8 m tall with its trunk, 4 m wide', 'environ 8 m de haut avec sa soute, 4 m de large'),
      T('Seats', 'Places', '4 astronauts', '4 astronautes'),
      T('Rocket', 'Fusée', 'Falcon 9, whose first stage lands and flies again', 'Falcon 9, dont le premier étage atterrit et revole'),
      T('Fleet', 'Flotte', 'Endeavour, Resilience, Endurance, Freedom and Grace', 'Endeavour, Resilience, Endurance, Freedom et Grace'),
      T('At the ISS now', 'À l’ISS en ce moment', 'Crew-13, docked since 1 Oct 2026', 'Crew-13, amarré depuis le 1er oct. 2026'),
      T('Landing', 'Retour', 'splashdown under parachutes, now off California', 'amerrissage sous parachutes, désormais au large de la Californie'),
      T('Safety', 'Sécurité', '8 SuperDraco engines can pull the capsule away from a failing rocket', '8 moteurs SuperDraco peuvent éloigner la capsule d’une fusée en panne')],
    facts: [['Demo-2 was the first time a private company flew astronauts to orbit, and the first crew launch from the USA since the Space Shuttle retired in 2011.', 'Demo-2 a été le premier vol d’astronautes en orbite par une entreprise privée, et le premier lancement habité depuis les États-Unis depuis la retraite de la navette en 2011.'],
      ['Crew-12, launched on 13 February 2026, included French ESA astronaut Sophie Adenot. They came home on 8 October 2026 after about eight months, splashing down off Los Angeles.', 'Crew-12, lancé le 13 février 2026, comptait l’astronaute française de l’ESA Sophie Adenot. L’équipage est rentré le 8 octobre 2026 après environ huit mois, amerrissant au large de Los Angeles.'],
      ['The trunk carries solar cells on one side and radiators on the other, and is dropped before re-entry.', 'La soute porte des cellules solaires d’un côté et des radiateurs de l’autre ; elle est larguée avant la rentrée.'],
      ['The nose cone swings open like a lid to uncover the docking port.', 'Le cône avant s’ouvre comme un couvercle pour dégager le port d’amarrage.'],
      ['Private crews fly it too: Polaris Dawn made the first commercial spacewalk in 2024, and Fram2 flew over both poles in 2025.', 'Des équipages privés l’utilisent aussi : Polaris Dawn a fait la première sortie spatiale commerciale en 2024, et Fram2 a survolé les deux pôles en 2025.'],
      ['A cargo version, without seats or windows, carries supplies and experiments to the station.', 'Une version cargo, sans sièges ni hublots, apporte du ravitaillement et des expériences à la station.']] },

  Starship: { intro: ['Starship is SpaceX’s giant rocket, built at Starbase in Texas to be fully reusable. NASA plans to use it to land astronauts on the Moon, and SpaceX hopes to send it to Mars.',
      'Starship est la fusée géante de SpaceX, construite à Starbase au Texas pour être entièrement réutilisable. La NASA prévoit de l’utiliser pour poser des astronautes sur la Lune, et SpaceX espère l’envoyer vers Mars.'],
    tiles: [T('Height', 'Hauteur', '124 m for the new Version 3, taller than the Statue of Liberty with its pedestal', '124 m pour la nouvelle version 3, plus haute que la statue de la Liberté avec son socle'),
      T('Stages', 'Étages', 'Super Heavy booster (33 Raptor engines) + Starship (6 engines)', 'propulseur Super Heavy (33 moteurs Raptor) + Starship (6 moteurs)'),
      T('Made of', 'Matériau', 'stainless steel, with black heat tiles on one side of the ship', 'acier inoxydable, avec des tuiles thermiques noires sur un côté du vaisseau'),
      T('Flights', 'Vols', '14 test flights so far, the first in April 2023', '14 vols d’essai à ce jour, le premier en avril 2023'),
      T('First orbit', 'Première orbite', 'Flight 14, 28 Sep 2026: reached orbit and released 26 Starlink V3 satellites', 'Vol 14, 28 sept. 2026 : a atteint l’orbite et largué 26 satellites Starlink V3'),
      T('Catching', 'Récupération', 'the tower’s two "chopsticks" arms caught a returning booster for the first time in Oct 2024', 'les deux bras « baguettes » de la tour ont rattrapé un propulseur pour la première fois en oct. 2024'),
      T('For NASA', 'Pour la NASA', 'the lunar lander for Artemis Moon landings', 'l’atterrisseur lunaire des missions Artemis')],
    facts: [['It is the biggest and most powerful rocket ever flown, about twice as powerful as the Saturn V that took Apollo to the Moon.', 'C’est la fusée la plus grande et la plus puissante jamais lancée, environ deux fois plus puissante que la Saturn V qui a emmené Apollo vers la Lune.'],
      ['Version 3 first flew on 22 May 2026, from a brand-new launch pad at Starbase.', 'La version 3 a volé pour la première fois le 22 mai 2026, depuis un pas de tir tout neuf à Starbase.'],
      ['On Flight 13 (24 July 2026) it released 20 of the newest Starlinks, which talked by laser to satellites already in orbit, and the ship splashed down so gently it stayed afloat in the Indian Ocean.', 'Lors du vol 13 (24 juillet 2026), il a largué 20 des Starlink les plus récents, qui ont communiqué par laser avec des satellites déjà en orbite, et le vaisseau a amerri si doucement qu’il est resté à flot dans l’océan Indien.'],
      ['On Flight 14 one of the ship’s six engines failed on the way up, but it still reached orbit. Controllers cut the planned 10-hour flight to about 3 hours and brought it down in the Pacific.', 'Lors du vol 14, l’un des six moteurs du vaisseau est tombé en panne pendant la montée, mais il a quand même atteint l’orbite. Les contrôleurs ont réduit le vol prévu de 10 heures à environ 3 heures et l’ont fait redescendre dans le Pacifique.'],
      ['The ship falls back belly-first like a skydiver, steering with its four flaps, then flips upright and fires its engines just before landing.', 'Le vaisseau retombe à plat ventre comme un parachutiste, en se dirigeant avec ses quatre volets, puis se redresse et rallume ses moteurs juste avant de se poser.'],
      ['To reach the Moon, Starship must be refuelled in orbit by other Starships: something never done before.', 'Pour aller jusqu’à la Lune, Starship doit être ravitaillé en orbite par d’autres Starship : une première.']] },

  Starlink: { intro: ['Starlink is SpaceX’s internet from space: thousands of flat satellites in low orbit beaming broadband to dishes on the ground, and now directly to some mobile phones.',
      'Starlink, c’est l’Internet depuis l’espace de SpaceX : des milliers de satellites plats en orbite basse qui envoient du haut débit vers des antennes au sol, et désormais directement vers certains téléphones.'],
    tiles: [T('In orbit', 'En orbite', 'more than 11,000 satellites (late 2026)', 'plus de 11 000 satellites (fin 2026)'),
      T('Launched', 'Lancés', 'about 13,000 since May 2019', 'environ 13 000 depuis mai 2019'),
      T('Height', 'Altitude', 'mostly about 340–570 km', 'surtout entre environ 340 et 570 km'),
      T('Share', 'Part', 'most of all the working satellites in the sky', 'la majorité des satellites en service dans le ciel'),
      T('First batch', 'Premier lot', '60 satellites, May 2019', '60 satellites, mai 2019'),
      T('Lifetime', 'Durée de vie', 'about 5 years, then they burn up in the atmosphere', 'environ 5 ans, puis ils brûlent dans l’atmosphère'),
      T('New', 'Nouveau', 'bigger V3 satellites launched by Starship from 2026', 'des satellites V3 plus grands lancés par Starship depuis 2026')],
    facts: [['Low orbit means a short trip for the signal, so the internet feels quick, but each satellite only covers a small patch, so thousands are needed.', 'Une orbite basse veut dire un trajet court pour le signal, donc un Internet rapide, mais chaque satellite ne couvre qu’une petite zone : il en faut des milliers.'],
      ['The satellites pass data between each other with lasers, so a signal can cross an ocean without touching the ground.', 'Les satellites se passent les données par laser : un signal peut traverser un océan sans toucher le sol.'],
      ['Soon after launch they travel in a line, like a string of pearls across the night sky: a "Starlink train".', 'Juste après le lancement, ils voyagent en file, comme un collier de perles dans le ciel nocturne : un « train Starlink ».'],
      ['Astronomers worry: bright satellite trails cross telescope pictures, so SpaceX added darker coatings and visors.', 'Les astronomes s’inquiètent : les traînées brillantes des satellites traversent les images des télescopes, alors SpaceX a ajouté des revêtements plus sombres et des pare-soleil.'],
      ['Each satellite can steer itself with a small electric thruster to dodge debris and, at the end, to come down.', 'Chaque satellite peut se diriger avec un petit propulseur électrique pour éviter les débris et, à la fin, redescendre.']] },
});

// ---------------------------------------------------------------- menu: a SpaceX group
{
  const og = document.createElement('optgroup'); og.label = '🚀 SpaceX';
  const before = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === '🌍 Around Earth');
  before ? before.after(og) : focusSel.appendChild(og);
  for (const [k, t] of [['Starship', 'Starship at Starbase'], ['Dragon', 'Crew Dragon (at the ISS)'], ['Roadster', 'Starman’s Tesla Roadster (2018)'], ['Starlink', 'Starlink satellites']]) {
    const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); }
}

// ---------------------------------------------------------------- French
SS.i18nAdd?.({
  ui: { '🚀 SpaceX': '🚀 SpaceX' },
  name: { 'Starship at Starbase': 'Starship à Starbase', 'Crew Dragon (at the ISS)': 'Crew Dragon (à l’ISS)', 'Starman’s Tesla Roadster (2018)': 'La Tesla Roadster de Starman (2018)',
    'Starlink satellites': 'Satellites Starlink', 'Starman’s Roadster': 'La Roadster de Starman', '🚀 Starship': '🚀 Starship', 'Crew Dragon': 'Crew Dragon', 'Starship': 'Starship', 'Starlink': 'Starlink' },
  cat: { 'Spacecraft · car in space': 'Engin spatial · voiture dans l’espace', 'Spacecraft · crew capsule': 'Engin spatial · capsule habitée',
    'Rocket · fully reusable (in testing)': 'Fusée · entièrement réutilisable (en essais)', 'Satellite constellation · internet': 'Constellation de satellites · Internet' },
  dist: { 'orbits the Sun every 557 days, out past Mars': 'tourne autour du Soleil en 557 jours, jusqu’au-delà de Mars', 'docked to the ISS, about 400 km above Earth': 'amarrée à l’ISS, à environ 400 km au-dessus de la Terre',
    'Starbase, Texas, USA': 'Starbase, Texas, États-Unis', 'about 340–570 km above Earth': 'à environ 340–570 km au-dessus de la Terre' },
  fact: { Roadster: 'Une voiture de sport rouge avec un mannequin astronaute au volant, lancée en 2018 par la première Falcon Heavy. Elle tournera autour du Soleil pendant des millions d’années.',
    Dragon: 'La capsule de SpaceX qui emmène les astronautes vers la Station spatiale internationale et les ramène. Quatre personnes y prennent place, et elle s’amarre toute seule.',
    Starship: 'La fusée la plus grande et la plus puissante jamais lancée : 124 m d’acier inoxydable. En septembre 2026, elle a atteint l’orbite pour la première fois.',
    Starlink: 'Un « train » de satellites Starlink V2 Mini peu après leur lancement : chacun est un corps plat avec deux grandes ailes solaires d’environ 30 m d’envergure. Plus de 11 000 tournent aujourd’hui autour de la Terre.' },
});
