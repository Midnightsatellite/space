// =====================================================================
// More craft from NASA 3D Resources (github.com/nasa/NASA-3D-Resources):
//  · NASA's Earth watchers in their real orbits (heights compressed like the ISS: 1 + km/2500 Earth radii in low orbit)
//  · space history: Skylab, Mir, the Space Shuttle, Apollo–Soyuz, Pioneer 10, Magellan, Mars Global Surveyor, NEAR Shoemaker, LADEE
// Each model loads only when you fly to it.
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies, focusSel } = SS;
const { info } = SS.cosmos;
const { PL, auToScene } = SS.extras;
const { orbiter } = SS.fleet;
const D = SS.more.cards2, T = (l, lf, v, vf) => [l, lf, v, vf];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const low = km => 1 + km / 2500;                                         // low Earth orbit, as the ISS is drawn
const high = km => 1.8 + 1.6 * Math.log10(km / 2000);                    // compressed for high orbits (GEO ≈ 3.8)

// ---------------------------------------------------------------- 1. Earth watchers
const earth = PL.Earth.tilted;   // equator in its XZ plane, pole along +Y
const EW = [ // key, file, name, km, inclination°, period (min), label colour, cat, dist
  ['Terra', 'terra', 'Terra', 705, 98.2, 99, 0x9fd0ff, 'Satellite · NASA Earth observer', 'about 705 km up, over the poles'],
  ['Aqua', 'aqua', 'Aqua', 705, 98.2, 99, 0x9fd0ff, 'Satellite · NASA Earth observer', 'about 705 km up, over the poles'],
  ['Aura', 'aura', 'Aura', 705, 98.2, 99, 0x9fd0ff, 'Satellite · NASA Earth observer', 'about 705 km up, over the poles'],
  ['Landsat8', 'landsat8', 'Landsat 8', 705, 98.2, 99, 0x9fd0ff, 'Satellite · NASA/USGS land imager', 'about 705 km up, over the poles'],
  ['ICESat2', 'icesat2', 'ICESat-2', 496, 92, 94, 0x9fd0ff, 'Satellite · NASA ice laser', 'about 500 km up, over the poles'],
  ['GPM', 'gpm', 'GPM', 407, 65, 93, 0x9fd0ff, 'Satellite · NASA/JAXA rain radar', 'about 400 km up'],
  ['SuomiNPP', 'suominpp', 'Suomi NPP', 824, 98.7, 101, 0x9fd0ff, 'Satellite · NASA/NOAA weather and climate', 'about 824 km up, over the poles'],
  ['OCO2', 'oco2', 'OCO-2', 705, 98.2, 99, 0x9fd0ff, 'Satellite · NASA carbon dioxide watcher', 'about 705 km up, over the poles'],
  ['Sentinel6', 'sentinel6', 'Sentinel-6', 1336, 66, 112, 0x9fd0ff, 'Satellite · sea-level mission (NASA/ESA/EUMETSAT/NOAA)', 'about 1,336 km up'],
  ['SDO', 'sdo', 'Solar Dynamics Observatory', 35786, 28.5, 1436, 0xffd27a, 'Satellite · NASA Sun observatory', 'in a geosynchronous orbit, 35,800 km up'],
  ['GOES', 'goes', 'GOES', 35786, 0, 1436, 0x9fd0ff, 'Satellite · NOAA/NASA weather satellite', 'geostationary, 35,786 km above the equator'],
];
EW.forEach(([k, file, name, km, inc, min, color, cat, dist], i) => {
  const r = km < 3000 ? low(km) : high(km), s = km < 3000 ? 0.03 : 0.06;
  orbiter({ key: k, host: earth, file: file + '.glb', size: s, rp: r, ra: r, P: min / 1440, rot: [inc * D2R, i * 0.57, 0], phase: i * 0.137, color, label: name, range: km < 3000 ? 3 : 8, view: s * 4.5, opacity: 0.18 });
  info(k, name, cat, dist, 'See card.');
});

// ---------------------------------------------------------------- 2. History in Earth orbit (shown as if still flying)
const HIST = [
  ['Skylab', 'skylab', 'Skylab (1973–1979)', 435, 50, 93, 'Space station · NASA, 1973–1979', 'shown in its orbit, about 435 km up'],
  ['Mir', 'mir', 'Mir (1986–2001)', 390, 51.6, 92, 'Space station · Soviet Union / Russia, 1986–2001', 'shown in its orbit, about 390 km up'],
  ['Shuttle', 'shuttle', 'Space Shuttle (1981–2011)', 400, 28.5, 92, 'Spacecraft · NASA reusable spaceplane, 1981–2011', 'shown in a typical orbit, about 400 km up'],
  ['ApolloSoyuz', 'apollosoyuz', 'Apollo–Soyuz (1975)', 220, 51.8, 89, 'Spacecraft · USA–USSR docking, July 1975', 'shown in its orbit, about 220 km up'],
];
HIST.forEach(([k, file, name, km, inc, min, cat, dist], i) => {
  orbiter({ key: k, host: earth, file: file + '.glb', size: k === 'Shuttle' ? 0.05 : 0.04, rp: low(km), ra: low(km), P: min / 1440, rot: [inc * D2R, 1.1 + i * 0.9, 0], phase: 0.5 + i * 0.21, color: 0xd8c8a0, label: name, range: 3, view: 0.18, opacity: 0.14 });
  info(k, name, cat, dist, 'See card.');
});

// ---------------------------------------------------------------- 3. Deep-space history
{ // Magellan at Venus (1990–1994): polar orbit 294 × 8,543 km, every 3.26 hours
  const R = 0.95; orbiter({ key: 'Magellan', host: PL.Venus.tilted, file: 'magellan.glb', size: 0.05, rp: R * 1.06, ra: R * (1 + 8543 / 6052), P: 3.26 / 24, rot: [Math.PI / 2, 0.4, 0], w: 1.2, color: 0xffd09a, label: 'Magellan (1990–1994)', range: 4, view: 0.22, opacity: 0.2 });
  info('Magellan', 'Magellan', 'Spacecraft · NASA Venus radar mapper, 1990–1994', 'shown in its orbit around Venus', 'See card.');
}
{ // Mars Global Surveyor (1997–2006): polar mapping orbit about 378 km up
  const R = 0.55; orbiter({ key: 'MGS', host: PL.Mars.tilted, file: 'mgs.glb', size: 0.028, rp: R * 1.11, ra: R * 1.11, P: 117 / 1440, rot: [Math.PI / 2, 2.6, 0], phase: 0.7, color: 0xffb080, label: 'Mars Global Surveyor (1997–2006)', range: 3, view: 0.12, opacity: 0.18 });
  info('MGS', 'Mars Global Surveyor', 'Spacecraft · NASA Mars orbiter, 1997–2006', 'shown in its mapping orbit around Mars', 'See card.');
}
{ // NEAR Shoemaker at Eros (2000–2001)
  const e = bodies.Eros?.obj; if (e) { orbiter({ key: 'NEAR', host: e, file: 'near.glb', size: 0.035, rp: 0.24, ra: 0.24, P: 1, rot: [1.2, 0, 0], color: 0xffd27a, label: 'NEAR Shoemaker (2000–2001)', range: 3, view: 0.16, opacity: 0.25 });
    info('NEAR', 'NEAR Shoemaker', 'Spacecraft · NASA asteroid orbiter and lander, 1996–2001', 'shown in its orbit around the asteroid Eros', 'See card.'); }
}
{ // LADEE at the Moon (2013–2014): low, near-equatorial, retrograde
  const moon = bodies.Moon.obj, R = moon.geometry?.parameters?.radius || 0.27;
  const grp = new THREE.Group(); moon.parent.add(grp); SS.sim.push(() => grp.position.copy(moon.position));
  orbiter({ key: 'LADEE', host: grp, file: 'ladee.glb', size: 0.014, rp: R * 1.03, ra: R * 1.05, P: 2 / 24, rot: [Math.PI - 0.05, 0.8, 0], color: 0xd0d8ff, label: 'LADEE (2013–2014)', range: 2, view: 0.06, opacity: 0.2 });
  info('LADEE', 'LADEE', 'Spacecraft · NASA Moon orbiter, 2013–2014', 'shown in its low orbit around the Moon', 'Studied the Moon’s thin atmosphere and dust.');
}
{ // Pioneer 10: silent since 2003, about 140 AU out, heading towards Aldebaran (ecliptic longitude about 78°, latitude +3°)
  const L = 78 * D2R, B = 3 * D2R, d = auToScene(140);
  const ec = V(Math.cos(B) * Math.cos(L), Math.cos(B) * Math.sin(L), Math.sin(B));
  const host = new THREE.Group(); host.position.copy(V(ec.x, ec.z, -ec.y).multiplyScalar(d)); SS.scene.add(host);
  orbiter({ key: 'Pioneer10', host, file: 'pioneer10.glb', size: 0.6, rp: 0.001, ra: 0.001, P: 1e6, color: 0xc8b090, label: 'Pioneer 10', range: 400, view: 2.4, opacity: 0 });
  info('Pioneer10', 'Pioneer 10', 'Spacecraft · NASA, silent since 2003', 'about 140 AU from the Sun, heading towards Aldebaran', 'See card.');
}

// ---------------------------------------------------------------- cards
const closed = true;
Object.assign(D, {
  Terra: { intro: ['The flagship of NASA’s Earth Observing System. Every day it watches land, oceans, clouds, fires and ice with five instruments, including MODIS, which images the whole planet every one to two days.',
      'Le vaisseau amiral du système d’observation de la Terre de la NASA. Chaque jour, il observe terres, océans, nuages, feux et glaces avec cinq instruments, dont MODIS, qui photographie toute la planète tous les un à deux jours.'],
    tiles: [T('Launch', 'Lancement', '18 Dec 1999 · Atlas IIAS, Vandenberg', '18 déc. 1999 · Atlas IIAS, Vandenberg'), T('Orbit', 'Orbite', '705 km, over the poles', '705 km, au-dessus des pôles'), T('Crosses the equator', 'Passe l’équateur', 'every morning, about 10:30', 'chaque matin vers 10 h 30')],
    facts: [['It was planned for 6 years; it has worked for more than 25.', 'Prévu pour 6 ans, il fonctionne depuis plus de 25 ans.']] },
  Aqua: { intro: ['Aqua follows Earth’s water: clouds, rain, snow, sea ice, ocean temperature and water vapour, crossing the equator every afternoon.',
      'Aqua suit l’eau de la Terre : nuages, pluie, neige, banquise, température des océans et vapeur d’eau, en passant l’équateur chaque après-midi.'],
    tiles: [T('Launch', 'Lancement', '4 May 2002 · Delta II, Vandenberg', '4 mai 2002 · Delta II, Vandenberg'), T('Orbit', 'Orbite', '705 km, over the poles', '705 km, au-dessus des pôles'), T('Crosses the equator', 'Passe l’équateur', 'every afternoon, about 13:30', 'chaque après-midi vers 13 h 30')],
    facts: [['It carries a second MODIS camera; with Terra, the whole Earth is imaged morning and afternoon.', 'Il emporte une seconde caméra MODIS : avec Terra, toute la Terre est photographiée matin et après-midi.']] },
  Aura: { intro: ['Aura watches the air we breathe: the ozone layer that shields us from ultraviolet light, air pollution, and the gases that warm the climate.',
      'Aura surveille l’air que nous respirons : la couche d’ozone qui nous protège des ultraviolets, la pollution de l’air et les gaz qui réchauffent le climat.'],
    tiles: [T('Launch', 'Lancement', '15 Jul 2004 · Delta II, Vandenberg', '15 juil. 2004 · Delta II, Vandenberg'), T('Orbit', 'Orbite', '705 km, over the poles', '705 km, au-dessus des pôles')],
    facts: [['It has tracked the slow healing of the ozone hole over Antarctica.', 'Il a suivi la lente guérison du trou de la couche d’ozone au-dessus de l’Antarctique.']] },
  Landsat8: { intro: ['Landsat 8 photographs every piece of land on Earth every 16 days. The Landsat series, run by NASA and the US Geological Survey, has watched forests, cities, farms and glaciers change since 1972: the longest record of Earth’s land from space.',
      'Landsat 8 photographie chaque morceau de terre tous les 16 jours. La série Landsat, menée par la NASA et l’US Geological Survey, observe forêts, villes, champs et glaciers depuis 1972 : la plus longue archive des terres vues de l’espace.'],
    tiles: [T('Launch', 'Lancement', '11 Feb 2013 · Atlas V, Vandenberg', '11 févr. 2013 · Atlas V, Vandenberg'), T('Orbit', 'Orbite', '705 km, over the poles', '705 km, au-dessus des pôles'), T('Revisit', 'Retour', 'every 16 days (8 with Landsat 9)', 'tous les 16 jours (8 avec Landsat 9)')],
    facts: [['Its pictures are free for everyone, used for farming, forestry, maps and disaster response.', 'Ses images sont gratuites pour tous, utilisées en agriculture, forêts, cartographie et secours.']] },
  ICESat2: { intro: ['ICESat-2 measures the height of ice sheets, glaciers, sea ice and even forests with a laser, ATLAS, that fires 10,000 pulses of green light every second and times their return.',
      'ICESat-2 mesure la hauteur des calottes, glaciers, banquises et même des forêts avec un laser, ATLAS, qui tire 10 000 impulsions de lumière verte par seconde et chronomètre leur retour.'],
    tiles: [T('Launch', 'Lancement', '15 Sep 2018 · the last Delta II, Vandenberg', '15 sept. 2018 · la dernière Delta II, Vandenberg'), T('Orbit', 'Orbite', 'about 500 km, nearly over the poles', 'environ 500 km, presque au-dessus des pôles')],
    facts: [['It can measure the height of the ice to within a few centimetres.', 'Il mesure la hauteur de la glace à quelques centimètres près.']] },
  GPM: { intro: ['The Global Precipitation Measurement core satellite, from NASA and Japan’s JAXA, carries a rain radar that looks inside storms, measuring rain and snow from the tropics to the polar circles.',
      'Le satellite central GPM (mesure mondiale des précipitations), de la NASA et de la JAXA japonaise, porte un radar qui regarde à l’intérieur des tempêtes et mesure pluie et neige des tropiques aux cercles polaires.'],
    tiles: [T('Launch', 'Lancement', '27 Feb 2014 · H-IIA, Tanegashima, Japan', '27 févr. 2014 · H-IIA, Tanegashima, Japon'), T('Orbit', 'Orbite', 'about 400 km, tilted 65°', 'environ 400 km, inclinée à 65°')],
    facts: [['Its data help forecast floods and hurricanes.', 'Ses données aident à prévoir crues et ouragans.']] },
  SuomiNPP: { intro: ['Suomi NPP bridges weather forecasting and climate science. Its VIIRS camera can see city lights at night, and made NASA’s famous "Black Marble" pictures of Earth at night.',
      'Suomi NPP fait le lien entre météo et science du climat. Sa caméra VIIRS voit les lumières des villes la nuit et a produit les célèbres images « Black Marble » de la Terre de nuit.'],
    tiles: [T('Launch', 'Lancement', '28 Oct 2011 · Delta II, Vandenberg', '28 oct. 2011 · Delta II, Vandenberg'), T('Orbit', 'Orbite', '824 km, over the poles', '824 km, au-dessus des pôles'), T('Name', 'Nom', 'Verner Suomi, father of satellite meteorology', 'Verner Suomi, père de la météorologie par satellite')],
    facts: [['It is the forerunner of NOAA’s JPSS weather satellites.', 'Il est le précurseur des satellites météo JPSS de la NOAA.']] },
  OCO2: { intro: ['The Orbiting Carbon Observatory-2 measures carbon dioxide in the air around the whole planet, showing where it is released and where forests and oceans soak it up.',
      'L’Orbiting Carbon Observatory-2 mesure le dioxyde de carbone dans l’air autour de toute la planète, montrant où il est émis et où forêts et océans l’absorbent.'],
    tiles: [T('Launch', 'Lancement', '2 Jul 2014 · Delta II, Vandenberg', '2 juil. 2014 · Delta II, Vandenberg'), T('Orbit', 'Orbite', '705 km, over the poles', '705 km, au-dessus des pôles')],
    facts: [['It replaced the first OCO, lost when its rocket failed in 2009.', 'Il a remplacé le premier OCO, perdu lors de l’échec de sa fusée en 2009.']] },
  Sentinel6: { intro: ['Sentinel-6 Michael Freilich measures the height of the sea surface with a radar, to within a few centimetres, continuing a sea-level record that began in 1992. It is a partnership of NASA, ESA, EUMETSAT, NOAA and the EU’s Copernicus programme.',
      'Sentinel-6 Michael Freilich mesure la hauteur de la surface des océans au radar, à quelques centimètres près, poursuivant un relevé du niveau des mers commencé en 1992. C’est un partenariat NASA, ESA, EUMETSAT, NOAA et Copernicus (UE).'],
    tiles: [T('Launch', 'Lancement', '21 Nov 2020 · Falcon 9, Vandenberg', '21 nov. 2020 · Falcon 9, Vandenberg'), T('Orbit', 'Orbite', '1,336 km, tilted 66°', '1 336 km, inclinée à 66°')],
    facts: [['Its measurements show the oceans rising by several millimetres a year.', 'Ses mesures montrent les océans monter de plusieurs millimètres par an.']] },
  SDO: { intro: ['The Solar Dynamics Observatory watches the Sun non-stop in many colours of light, taking a new picture every few seconds. Many of the Sun images in this explorer come from it.',
      'Le Solar Dynamics Observatory observe le Soleil sans interruption dans de nombreuses couleurs de lumière, avec une nouvelle image toutes les quelques secondes. Beaucoup d’images du Soleil de cet explorateur viennent de lui.'],
    tiles: [T('Launch', 'Lancement', '11 Feb 2010 · Atlas V, Cape Canaveral', '11 févr. 2010 · Atlas V, Cap Canaveral'), T('Orbit', 'Orbite', 'geosynchronous, 35,800 km up, tilted 28.5°', 'géosynchrone, 35 800 km, inclinée à 28,5°')],
    facts: [['Its orbit keeps it in constant contact with one ground station in New Mexico, to send down its huge stream of pictures.', 'Son orbite le garde en contact permanent avec une station au Nouveau-Mexique, pour envoyer son énorme flot d’images.']] },
  GOES: { intro: ['GOES weather satellites hover over the same spot above the equator, 35,786 km up, watching storms, hurricanes and fires across the Americas. NOAA runs them; NASA builds and launches them. The series began in 1975.',
      'Les satellites météo GOES restent au-dessus du même point de l’équateur, à 35 786 km, et surveillent tempêtes, ouragans et incendies sur les Amériques. La NOAA les exploite ; la NASA les construit et les lance. La série a commencé en 1975.'],
    tiles: [T('Orbit', 'Orbite', 'geostationary: one turn a day, matching Earth’s spin', 'géostationnaire : un tour par jour, au rythme de la Terre'), T('First', 'Premier', 'GOES-1, 1975', 'GOES-1, 1975')],
    facts: [['From that height a satellite sees almost a whole hemisphere at once.', 'De cette hauteur, un satellite voit presque tout un hémisphère d’un coup.']] },
  Skylab: { closed, intro: ['Skylab was America’s first space station, built from a leftover Saturn V rocket stage. Three crews lived aboard in 1973 and 1974, the last for 84 days, studying the Sun, Earth and how the body copes in space.',
      'Skylab fut la première station spatiale américaine, construite à partir d’un étage de Saturn V inutilisé. Trois équipages y ont vécu en 1973 et 1974, le dernier pendant 84 jours, pour étudier le Soleil, la Terre et le corps humain en apesanteur.'],
    tiles: [T('Launch', 'Lancement', '14 May 1973 · the last Saturn V', '14 mai 1973 · la dernière Saturn V'), T('Crews', 'Équipages', '3 crews of 3, 1973–1974', '3 équipages de 3, 1973–1974'), T('End', 'Fin', 'fell back on 11 Jul 1979, over Western Australia', 'retombée le 11 juil. 1979, sur l’Australie occidentale')],
    facts: [['A shield tore off during launch; the first crew rigged a sunshade to save the station.', 'Un bouclier s’est arraché au lancement ; le premier équipage a installé un pare-soleil pour sauver la station.']] },
  Mir: { closed, intro: ['Mir ("peace" or "world" in Russian) was built in orbit module by module from 1986, the first station assembled in space. It was lived in for about 12½ years in all, nearly ten of them without a break, by cosmonauts and visitors from many countries, including NASA astronauts.',
      'Mir (« paix » ou « monde » en russe) a été assemblée en orbite module par module à partir de 1986 : la première station construite dans l’espace. Elle a été habitée environ 12 ans et demi au total, dont près de dix sans interruption, par des cosmonautes et des visiteurs de nombreux pays, dont des astronautes de la NASA.'],
    tiles: [T('First module', 'Premier module', '20 Feb 1986', '20 févr. 1986'), T('End', 'Fin', 'brought down into the Pacific, 23 Mar 2001', 'désorbitée dans le Pacifique, 23 mars 2001'), T('Record', 'Record', 'Valeri Polyakov: 437 days in a row aboard', 'Valeri Poliakov : 437 jours d’affilée à bord')],
    facts: [['Its lessons, and its partnership with NASA, led straight to the ISS.', 'Ses leçons, et son partenariat avec la NASA, ont mené directement à l’ISS.']] },
  Shuttle: { closed, intro: ['The Space Shuttle was the first reusable spaceplane: it launched like a rocket and landed like a glider. Five orbiters flew 135 missions, launching Hubble, building the ISS and carrying 355 different people to space.',
      'La navette spatiale fut le premier avion spatial réutilisable : elle décollait comme une fusée et atterrissait comme un planeur. Cinq orbiteurs ont fait 135 missions, lancé Hubble, construit l’ISS et emmené 355 personnes dans l’espace.'],
    tiles: [T('First flight', 'Premier vol', 'Columbia, 12 Apr 1981', 'Columbia, 12 avril 1981'), T('Last flight', 'Dernier vol', 'Atlantis, landed 21 Jul 2011', 'Atlantis, posée le 21 juil. 2011'), T('Orbiters', 'Orbiteurs', 'Columbia, Challenger, Discovery, Atlantis, Endeavour', 'Columbia, Challenger, Discovery, Atlantis, Endeavour')],
    facts: [['Two were lost with their crews: Challenger in 1986 and Columbia in 2003.', 'Deux ont été perdues avec leur équipage : Challenger en 1986 et Columbia en 2003.'],
      ['This model shows it ready for launch, on its orange fuel tank between two rocket boosters.', 'Ce modèle la montre prête au lancement, sur son réservoir orange entre deux propulseurs.']] },
  ApolloSoyuz: { closed, intro: ['In July 1975, at the height of the Cold War, an American Apollo and a Soviet Soyuz docked in orbit. Tom Stafford and Alexei Leonov shook hands through the hatch: the first international space mission.',
      'En juillet 1975, en pleine guerre froide, un Apollo américain et un Soyouz soviétique se sont amarrés en orbite. Tom Stafford et Alexeï Leonov se sont serré la main à travers l’écoutille : la première mission spatiale internationale.'],
    tiles: [T('Docking', 'Amarrage', '17 Jul 1975', '17 juil. 1975'), T('Crews', 'Équipages', 'Stafford, Brand, Slayton · Leonov, Kubasov', 'Stafford, Brand, Slayton · Leonov, Koubassov'), T('Together', 'Ensemble', 'about two days docked', 'environ deux jours amarrés')],
    facts: [['A docking module between the ships let the crews pass despite different air in each craft.', 'Un module d’amarrage entre les vaisseaux permettait de passer malgré un air différent dans chacun.']] },
  Magellan: { closed, intro: ['Venus is hidden under thick clouds, so Magellan mapped it by radar, which sees through them. It mapped about 98% of the surface, revealing volcanoes, lava plains and very few craters.',
      'Vénus est cachée sous d’épais nuages : Magellan l’a donc cartographiée au radar, qui les traverse. Il a cartographié environ 98 % de la surface, révélant volcans, plaines de lave et très peu de cratères.'],
    tiles: [T('Launch', 'Lancement', '4 May 1989 · from Space Shuttle Atlantis', '4 mai 1989 · depuis la navette Atlantis'), T('At Venus', 'À Vénus', '10 Aug 1990 to 12 Oct 1994', '10 août 1990 au 12 oct. 1994'), T('End', 'Fin', 'steered down into the atmosphere', 'plongé volontairement dans l’atmosphère')],
    facts: [['It was the first planetary probe launched from a Space Shuttle.', 'Ce fut la première sonde planétaire lancée depuis une navette spatiale.']] },
  MGS: { closed, intro: ['Mars Global Surveyor mapped Mars for nine years. Its laser made the first precise height map of the whole planet, and its camera spotted fresh gullies that hinted at recent water.',
      'Mars Global Surveyor a cartographié Mars pendant neuf ans. Son laser a produit la première carte précise du relief de toute la planète, et sa caméra a repéré de jeunes ravines suggérant de l’eau récente.'],
    tiles: [T('Launch', 'Lancement', '7 Nov 1996 · Delta II', '7 nov. 1996 · Delta II'), T('At Mars', 'À Mars', '11 Sep 1997 to Nov 2006', '11 sept. 1997 à nov. 2006'), T('Orbit', 'Orbite', 'about 378 km, over the poles, every 2 hours', 'environ 378 km, au-dessus des pôles, en 2 heures')],
    facts: [['It slowed into its mapping orbit by skimming the top of Mars’s air for over a year ("aerobraking").', 'Il a rejoint son orbite en frôlant le haut de l’atmosphère martienne pendant plus d’un an (« aérofreinage »).']] },
  NEAR: { closed, intro: ['NEAR Shoemaker was the first spacecraft to orbit an asteroid, Eros, and then the first to land on one, though it was never designed to land.',
      'NEAR Shoemaker fut le premier engin à se mettre en orbite autour d’un astéroïde, Éros, puis le premier à s’y poser, alors qu’il n’était pas conçu pour atterrir.'],
    tiles: [T('Launch', 'Lancement', '17 Feb 1996 · Delta II', '17 févr. 1996 · Delta II'), T('At Eros', 'À Éros', 'orbit from 14 Feb 2000', 'en orbite dès le 14 févr. 2000'), T('Landing', 'Atterrissage', '12 Feb 2001', '12 févr. 2001'), T('Name', 'Nom', 'planetary geologist Gene Shoemaker', 'le géologue planétaire Gene Shoemaker')],
    facts: [['It kept sending data for about two weeks after touching down.', 'Il a continué à envoyer des données environ deux semaines après s’être posé.']] },
  LADEE: { closed, intro: ['LADEE studied the Moon’s extremely thin atmosphere and the dust floating above its surface, flying very low over the Moon.',
      'LADEE a étudié l’atmosphère extrêmement ténue de la Lune et la poussière flottant au-dessus de sa surface, en volant très bas.'],
    tiles: [T('Launch', 'Lancement', '6 Sep 2013 · Minotaur V, Wallops Island', '6 sept. 2013 · Minotaur V, Wallops Island'), T('End', 'Fin', 'planned impact on the far side, 18 Apr 2014', 'impact prévu sur la face cachée, 18 avril 2014')],
    facts: [['It tested laser communication with Earth, sending data at 622 megabits per second.', 'Il a testé la communication laser avec la Terre, à 622 mégabits par seconde.']] },
  Pioneer10: { closed, intro: ['Pioneer 10 was the first spacecraft to cross the asteroid belt and the first to visit Jupiter. It carries a gold plaque showing who sent it and from where, in case anyone ever finds it.',
      'Pioneer 10 fut le premier engin à traverser la ceinture d’astéroïdes et le premier à visiter Jupiter. Il porte une plaque dorée montrant qui l’a envoyé et d’où, au cas où quelqu’un la trouverait un jour.'],
    tiles: [T('Launch', 'Lancement', '3 Mar 1972 (UTC) · Atlas-Centaur', '3 mars 1972 (UTC) · Atlas-Centaur'), T('Jupiter', 'Jupiter', '3 Dec 1973, the first close look', '3 déc. 1973, la première vue rapprochée'), T('Last signal', 'Dernier signal', '23 Jan 2003', '23 janv. 2003'), T('Heading', 'Direction', 'towards Aldebaran, in Taurus', 'vers Aldébaran, dans le Taureau')],
    facts: [['At its speed it would take about two million years to pass Aldebaran.', 'À sa vitesse, il lui faudrait environ deux millions d’années pour passer près d’Aldébaran.']] },
});

// ---------------------------------------------------------------- menu
{
  const mk = (label, afterLabel, items) => { const og = document.createElement('optgroup'); og.label = label;
    const after = [...focusSel.querySelectorAll('optgroup')].find(g => g.label.includes(afterLabel)); after ? after.after(og) : focusSel.appendChild(og);
    for (const [k, t] of items) if (bodies[k]) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); } };
  mk('🌍 Watching Earth (NASA)', 'NASA science fleet', EW.map(([k, , n]) => [k, n]));
  mk('🏛 Space history', 'Watching Earth', [['Skylab', 'Skylab (1973–1979)'], ['Mir', 'Mir (1986–2001)'], ['Shuttle', 'Space Shuttle (1981–2011)'], ['ApolloSoyuz', 'Apollo–Soyuz (1975)'],
    ['Pioneer10', 'Pioneer 10 (1972–2003)'], ['Magellan', 'Magellan at Venus (1990–1994)'], ['MGS', 'Mars Global Surveyor (1997–2006)'], ['NEAR', 'NEAR Shoemaker at Eros (2000–2001)'], ['LADEE', 'LADEE at the Moon (2013–2014)']]);
}

// ---------------------------------------------------------------- French
SS.i18nAdd?.({
  ui: { '🌍 Watching Earth (NASA)': '🌍 Observer la Terre (NASA)', '🏛 Space history': '🏛 Histoire spatiale' },
  name: { '🌍 Watching Earth (NASA)': '🌍 Observer la Terre (NASA)', '🏛 Space history': '🏛 Histoire spatiale', 'Solar Dynamics Observatory': 'Solar Dynamics Observatory',
    'Space Shuttle (1981–2011)': 'Navette spatiale (1981–2011)', 'Pioneer 10 (1972–2003)': 'Pioneer 10 (1972–2003)', 'Magellan at Venus (1990–1994)': 'Magellan à Vénus (1990–1994)',
    'NEAR Shoemaker at Eros (2000–2001)': 'NEAR Shoemaker à Éros (2000–2001)', 'LADEE at the Moon (2013–2014)': 'LADEE à la Lune (2013–2014)', 'Space Shuttle': 'Navette spatiale' },
  cat: { 'Satellite · NASA Earth observer': 'Satellite · observation de la Terre (NASA)', 'Satellite · NASA/USGS land imager': 'Satellite · imageur des terres (NASA/USGS)', 'Satellite · NASA ice laser': 'Satellite · laser des glaces (NASA)',
    'Satellite · NASA/JAXA rain radar': 'Satellite · radar de pluie (NASA/JAXA)', 'Satellite · NASA/NOAA weather and climate': 'Satellite · météo et climat (NASA/NOAA)', 'Satellite · NASA carbon dioxide watcher': 'Satellite · surveillance du CO₂ (NASA)',
    'Satellite · sea-level mission (NASA/ESA/EUMETSAT/NOAA)': 'Satellite · niveau des mers (NASA/ESA/EUMETSAT/NOAA)', 'Satellite · NASA Sun observatory': 'Satellite · observatoire solaire (NASA)', 'Satellite · NOAA/NASA weather satellite': 'Satellite · météo (NOAA/NASA)',
    'Space station · NASA, 1973–1979': 'Station spatiale · NASA, 1973–1979', 'Space station · Soviet Union / Russia, 1986–2001': 'Station spatiale · URSS / Russie, 1986–2001', 'Spacecraft · NASA reusable spaceplane, 1981–2011': 'Engin spatial · avion spatial réutilisable (NASA), 1981–2011',
    'Spacecraft · USA–USSR docking, July 1975': 'Engin spatial · amarrage États-Unis–URSS, juillet 1975', 'Spacecraft · NASA Venus radar mapper, 1990–1994': 'Engin spatial · cartographe radar de Vénus (NASA), 1990–1994',
    'Spacecraft · NASA Mars orbiter, 1997–2006': 'Engin spatial · orbiteur martien (NASA), 1997–2006', 'Spacecraft · NASA asteroid orbiter and lander, 1996–2001': 'Engin spatial · orbiteur et atterrisseur d’astéroïde (NASA), 1996–2001',
    'Spacecraft · NASA Moon orbiter, 2013–2014': 'Engin spatial · orbiteur lunaire (NASA), 2013–2014', 'Spacecraft · NASA, silent since 2003': 'Engin spatial · NASA, silencieux depuis 2003' },
  dist: { 'about 705 km up, over the poles': 'à environ 705 km, au-dessus des pôles', 'about 500 km up, over the poles': 'à environ 500 km, au-dessus des pôles', 'about 400 km up': 'à environ 400 km',
    'about 824 km up, over the poles': 'à environ 824 km, au-dessus des pôles', 'about 1,336 km up': 'à environ 1 336 km', 'in a geosynchronous orbit, 35,800 km up': 'en orbite géosynchrone, à 35 800 km',
    'geostationary, 35,786 km above the equator': 'géostationnaire, à 35 786 km au-dessus de l’équateur', 'shown in its orbit, about 435 km up': 'montré sur son orbite, à environ 435 km', 'shown in its orbit, about 390 km up': 'montré sur son orbite, à environ 390 km',
    'shown in a typical orbit, about 400 km up': 'montrée sur une orbite typique, à environ 400 km', 'shown in its orbit, about 220 km up': 'montré sur son orbite, à environ 220 km', 'shown in its orbit around Venus': 'montré sur son orbite autour de Vénus',
    'shown in its mapping orbit around Mars': 'montré sur son orbite de cartographie autour de Mars', 'shown in its orbit around the asteroid Eros': 'montré sur son orbite autour de l’astéroïde Éros',
    'shown in its low orbit around the Moon': 'montré sur son orbite basse autour de la Lune', 'about 140 AU from the Sun, heading towards Aldebaran': 'à environ 140 UA du Soleil, en route vers Aldébaran' },
  fact: { LADEE: 'A étudié l’atmosphère ténue de la Lune et sa poussière.' },
});
