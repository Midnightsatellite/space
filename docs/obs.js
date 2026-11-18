// =====================================================================
// Big observatories on Earth: optical and radio telescopes, the Event Horizon Telescope dishes,
// and gravitational-wave detectors. Pins on the globe behind their own tick, like the laser stations.
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { camera, bodies, sim, flyTo, focusSel, glowSprite } = SS;
const { info } = SS.cosmos;
const { nearLabel, PL } = SS.extras;
const special = SS.more.special;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180, $ = id => document.getElementById(id);
const earthMesh = PL.Earth.tilted.children[0];
const earthLocal = (lat, lon) => { const la = lat * D2R, lo = lon * D2R; return V(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)); };
const TYPE = { opt: ['#ffd27a', 'Optical telescope', 'Télescope optique'], radio: ['#7fd6ff', 'Radio telescope', 'Radiotélescope'],
  eht: ['#d49bff', 'Event Horizon Telescope dish', 'Antenne de l’Event Horizon Telescope'], gw: ['#8dffb0', 'Gravitational-wave detector', 'Détecteur d’ondes gravitationnelles'],
  hist: ['#ffffff', 'Historic observatory', 'Observatoire historique'] };
// key, name EN, name FR, country EN, country FR, type, lat, lon, note EN, note FR (positions rounded)
const OB = [
  ['Rubin', 'Vera C. Rubin Observatory', 'Observatoire Vera C. Rubin', 'Chile', 'Chili', 'opt', -30.24, -70.75,
    'Films the whole southern sky every few nights with the largest digital camera ever built (3,200 megapixels) for its 10-year Legacy Survey of Space and Time.',
    'Filme tout le ciel austral en quelques nuits avec le plus grand appareil photo numérique jamais construit (3 200 mégapixels), pour son relevé LSST de 10 ans.'],
  ['ELT', 'Extremely Large Telescope (ESO, being built)', 'Extremely Large Telescope (ESO, en construction)', 'Chile', 'Chili', 'opt', -24.59, -70.19,
    'ESO’s giant with a 39 m mirror made of 798 segments, on Cerro Armazones. When finished it will be the largest optical telescope in the world.',
    'Le géant de l’ESO, avec un miroir de 39 m fait de 798 segments, sur le Cerro Armazones. Une fois achevé, ce sera le plus grand télescope optique du monde.'],
  ['VLT', 'Very Large Telescope (ESO)', 'Very Large Telescope (ESO)', 'Chile', 'Chili', 'opt', -24.63, -70.40,
    'Four 8.2 m telescopes on Cerro Paranal that can work together; it took the first picture of a planet around another star in 2004.',
    'Quatre télescopes de 8,2 m sur le Cerro Paranal qui peuvent travailler ensemble ; il a pris en 2004 la première image d’une planète autour d’une autre étoile.'],
  ['Keck', 'W. M. Keck Observatory', 'Observatoire W. M. Keck', 'Hawaii, USA', 'Hawaï, États-Unis', 'opt', 19.83, -155.47,
    'Twin 10 m telescopes on Mauna Kea; their work helped prove there is a giant black hole at the centre of our galaxy.',
    'Deux télescopes jumeaux de 10 m sur le Mauna Kea ; leurs observations ont aidé à prouver qu’un trou noir géant se cache au centre de notre galaxie.'],
  ['GTC', 'Gran Telescopio Canarias', 'Gran Telescopio Canarias', 'La Palma, Spain', 'La Palma, Espagne', 'opt', 28.76, -17.89,
    'A 10.4 m mirror on La Palma in the Canary Islands, one of the largest single optical telescopes.',
    'Un miroir de 10,4 m à La Palma, aux Canaries : l’un des plus grands télescopes optiques à miroir unique.'],
  ['PicDuMidi', 'Pic du Midi Observatory', 'Observatoire du Pic du Midi', 'France', 'France', 'opt', 42.94, 0.14,
    'High in the Pyrenees since 1878; its telescopes mapped the Moon for the Apollo landings.',
    'Perché dans les Pyrénées depuis 1878 ; ses télescopes ont cartographié la Lune pour les alunissages d’Apollo.'],
  ['OHP', 'Haute-Provence Observatory', 'Observatoire de Haute-Provence', 'France', 'France', 'opt', 43.93, 5.71,
    'Where Michel Mayor and Didier Queloz found 51 Pegasi b in 1995, the first planet around a Sun-like star (Nobel Prize 2019).',
    'Là où Michel Mayor et Didier Queloz ont découvert 51 Pegasi b en 1995, la première planète autour d’une étoile comme le Soleil (prix Nobel 2019).'],
  ['Greenwich', 'Royal Observatory Greenwich', 'Observatoire royal de Greenwich', 'London, UK', 'Londres, Royaume-Uni', 'hist', 51.48, 0.00,
    'Founded in 1675; the Prime Meridian, longitude 0°, runs through it, and world time was once set from here.',
    'Fondé en 1675 ; le méridien d’origine, longitude 0°, le traverse, et l’heure du monde y était autrefois réglée.'],
  ['FAST', 'FAST, Five-hundred-metre Aperture Spherical Telescope', 'FAST, radiotélescope sphérique de 500 m', 'Guizhou, China', 'Guizhou, Chine', 'radio', 25.65, 106.86,
    'The world’s largest single-dish radio telescope, set in a natural bowl in the hills; it has found more than 1,000 pulsars.',
    'Le plus grand radiotélescope à antenne unique du monde, niché dans une cuvette naturelle ; il a découvert plus de 1 000 pulsars.'],
  ['ALMA', 'ALMA', 'ALMA', 'Chile', 'Chili', 'eht', -23.02, -67.75,
    '66 antennas 5,000 m up on the Chajnantor plateau, working as one giant telescope; the heart of the Event Horizon Telescope.',
    '66 antennes à 5 000 m d’altitude sur le plateau de Chajnantor, qui travaillent comme un seul télescope géant ; le cœur de l’Event Horizon Telescope.'],
  ['JodrellBank', 'Jodrell Bank (Lovell Telescope)', 'Jodrell Bank (télescope Lovell)', 'England, UK', 'Angleterre, Royaume-Uni', 'radio', 53.24, -2.31,
    'Its 76 m Lovell dish tracked Sputnik’s rocket in 1957; the site is now home to the SKA Observatory’s headquarters.',
    'Sa parabole Lovell de 76 m a suivi la fusée de Spoutnik en 1957 ; le site accueille aujourd’hui le siège de l’observatoire SKA.'],
  ['Parkes', 'Parkes "The Dish"', 'Parkes, « The Dish »', 'Australia', 'Australie', 'radio', -33.00, 148.26,
    'This 64 m dish relayed the TV pictures of Apollo 11’s first steps on the Moon to the world in 1969.',
    'Cette parabole de 64 m a relayé au monde les images télévisées des premiers pas d’Apollo 11 sur la Lune en 1969.'],
  ['GreenBank', 'Green Bank Telescope', 'Télescope de Green Bank', 'West Virginia, USA', 'Virginie-Occidentale, États-Unis', 'radio', 38.43, -79.84,
    'The largest fully steerable radio dish in the world, 100 m across, in a zone where radio transmitters are restricted.',
    'La plus grande parabole entièrement orientable du monde, 100 m de diamètre, dans une zone où les émetteurs radio sont limités.'],
  ['SKALow', 'SKA-Low (being built)', 'SKA-Low (en construction)', 'Western Australia', 'Australie-Occidentale', 'radio', -26.70, 116.66,
    'Part of the Square Kilometre Array: 131,072 antennas shaped like small Christmas trees, listening to low radio frequencies.',
    'Une partie du Square Kilometre Array : 131 072 antennes en forme de petits sapins, à l’écoute des basses fréquences radio.'],
  ['SKAMid', 'SKA-Mid (being built)', 'SKA-Mid (en construction)', 'South Africa', 'Afrique du Sud', 'radio', -30.71, 21.44,
    'The other half of the Square Kilometre Array: about 200 dishes in the Karoo desert, including the 64 of MeerKAT.',
    'L’autre moitié du Square Kilometre Array : environ 200 paraboles dans le désert du Karoo, dont les 64 de MeerKAT.'],
  ['Arecibo', 'Arecibo (collapsed in 2020)', 'Arecibo (effondré en 2020)', 'Puerto Rico', 'Porto Rico', 'radio', 18.35, -66.75,
    'Its 305 m dish sent the Arecibo message to the stars in 1974 and helped rescue SOHO in 1998; it collapsed on 1 December 2020.',
    'Sa parabole de 305 m a envoyé le message d’Arecibo vers les étoiles en 1974 et aidé à sauver SOHO en 1998 ; elle s’est effondrée le 1er décembre 2020.'],
  ['JCMT', 'JCMT and SMA, Mauna Kea', 'JCMT et SMA, Mauna Kea', 'Hawaii, USA', 'Hawaï, États-Unis', 'eht', 19.82, -155.48,
    'Submillimetre telescopes on Mauna Kea that joined the Event Horizon Telescope.', 'Des télescopes submillimétriques du Mauna Kea qui ont rejoint l’Event Horizon Telescope.'],
  ['LMT', 'Large Millimeter Telescope', 'Grand Télescope Millimétrique', 'Mexico', 'Mexique', 'eht', 18.99, -97.31,
    'A 50 m dish on the Sierra Negra volcano, part of the Event Horizon Telescope.', 'Une antenne de 50 m sur le volcan Sierra Negra, membre de l’Event Horizon Telescope.'],
  ['IRAM30', 'IRAM 30 m telescope, Pico Veleta', 'Télescope de 30 m de l’IRAM, Pico Veleta', 'Spain', 'Espagne', 'eht', 37.07, -3.39,
    'A Franco-German-Spanish dish in the Sierra Nevada, part of the Event Horizon Telescope.', 'Une antenne franco-germano-espagnole dans la Sierra Nevada, membre de l’Event Horizon Telescope.'],
  ['NOEMA', 'NOEMA, Plateau de Bure', 'NOEMA, plateau de Bure', 'France', 'France', 'eht', 44.63, 5.91,
    '12 antennas high in the French Alps, the most powerful millimetre array in the northern hemisphere.', '12 antennes dans les Alpes françaises : le réseau millimétrique le plus puissant de l’hémisphère nord.'],
  ['SMT', 'Submillimeter Telescope, Mount Graham', 'Télescope submillimétrique, mont Graham', 'Arizona, USA', 'Arizona, États-Unis', 'eht', 32.70, -109.89,
    'A 10 m dish in Arizona, part of the Event Horizon Telescope.', 'Une antenne de 10 m en Arizona, membre de l’Event Horizon Telescope.'],
  ['SPT', 'South Pole Telescope', 'Télescope du pôle Sud', 'Antarctica', 'Antarctique', 'eht', -89.99, -45.0,
    'A 10 m dish at the South Pole, where the dry, cold air is ideal; part of the Event Horizon Telescope.', 'Une antenne de 10 m au pôle Sud, où l’air sec et froid est idéal ; membre de l’Event Horizon Telescope.'],
  ['GLT', 'Greenland Telescope', 'Télescope du Groenland', 'Greenland', 'Groenland', 'eht', 76.53, -68.69,
    'A 12 m dish at Pituffik Space Base, the northernmost Event Horizon Telescope station.', 'Une antenne de 12 m à la base spatiale de Pituffik, la station la plus au nord de l’Event Horizon Telescope.'],
  ['LIGOH', 'LIGO Hanford', 'LIGO Hanford', 'Washington, USA', 'Washington, États-Unis', 'gw', 46.46, -119.41,
    'One of the two LIGO detectors that made the first detection of gravitational waves on 14 September 2015 (Nobel Prize 2017).',
    'L’un des deux détecteurs LIGO qui ont fait la première détection d’ondes gravitationnelles le 14 septembre 2015 (prix Nobel 2017).'],
  ['LIGOL', 'LIGO Livingston', 'LIGO Livingston', 'Louisiana, USA', 'Louisiane, États-Unis', 'gw', 30.56, -90.77,
    'Its 4 km laser arms can sense a change in length ten thousand times smaller than a proton.', 'Ses bras laser de 4 km détectent une variation de longueur dix mille fois plus petite qu’un proton.'],
  ['Virgo', 'Virgo, near Pisa', 'Virgo, près de Pise', 'Italy', 'Italie', 'gw', 43.63, 10.50,
    'The French-Italian-led detector with 3 km arms; with LIGO it pinpointed the 2017 collision of two neutron stars.',
    'Le détecteur franco-italien aux bras de 3 km ; avec LIGO, il a localisé en 2017 la collision de deux étoiles à neutrons.'],
];

const grp = new THREE.Group(); grp.visible = false; earthMesh.add(grp);
const pins = [];
for (const [k, name, , country, , type, lat, lon, note] of OB) {
  const n = earthLocal(lat, lon), key = 'OBS_' + k, col = TYPE[type][0];
  const pin = new THREE.Group(); pin.position.copy(n).multiplyScalar(1.002); pin.quaternion.setFromUnitVectors(V(0, 1, 0), n); grp.add(pin);
  pin.add(glowSprite(0.018, col, 'rgba(0,0,0,0)', 0.95));
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0009, 0.04, 4), new THREE.MeshBasicMaterial({ color: col })); stalk.position.y = 0.02; pin.add(stalk);
  nearLabel(pin, '🔭 ' + name.replace(/ \(.*\)$/, ''), 0.03, key, 'craft', 0.8);
  pins.push(pin);
  const wp = V(), ep = V();
  bodies[key] = { obj: pin, radius: 0.04, view: 0.7, dir: () => { pin.getWorldPosition(wp); earthMesh.getWorldPosition(ep); return wp.sub(ep).normalize().add(V(0, 0.25, 0)).normalize(); } };
  info(key, name, TYPE[type][1], country, note);
}
{ const ew = V(), pw = V(), cw = V();   // hide labels on the far side of the globe
  sim.push(() => { if (!grp.visible) return; earthMesh.getWorldPosition(ew); camera.getWorldPosition(cw);
    for (const pin of pins) { pin.getWorldPosition(pw); if (pw.clone().sub(ew).normalize().dot(cw.clone().sub(pw).normalize()) <= 0.05) for (const c of pin.children) if (c.isCSS2DObject) c.visible = false; } }); }

// ---------- overview card ----------
bodies.OBS = { obj: bodies.Earth.obj, radius: 1.2, view: 3.2, dir: () => V(-0.6, 0.4, 1).normalize() };
info('OBS', 'Observatories on Earth', 'Observatories', 'around the world', 'See card.');
const T = (l, lf, v, vf) => [l, lf, v, vf];
SS.more.cards2.OBS = { intro: ['Some of the world’s great observatories, from Greenwich, where longitude starts, to the giants in Chile’s deserts. Many sit high on mountains or in deserts, above the clouds and far from city lights.',
    'Quelques-uns des grands observatoires du monde, de Greenwich, où commence la longitude, aux géants des déserts chiliens. Beaucoup sont perchés en montagne ou dans le désert, au-dessus des nuages et loin des lumières des villes.'],
  tiles: [T('Gold pins', 'Repères dorés', 'optical telescopes (visible and infrared light)', 'télescopes optiques (lumière visible et infrarouge)'),
    T('Blue pins', 'Repères bleus', 'radio telescopes', 'radiotélescopes'),
    T('Purple pins', 'Repères violets', 'Event Horizon Telescope dishes', 'antennes de l’Event Horizon Telescope'),
    T('Green pins', 'Repères verts', 'gravitational-wave detectors', 'détecteurs d’ondes gravitationnelles'),
    T('White pin', 'Repère blanc', 'Greenwich, the historic observatory', 'Greenwich, l’observatoire historique'),
    T('Best spot', 'Meilleur endroit', 'Chile’s Atacama Desert, the driest place on Earth outside the poles', 'le désert d’Atacama au Chili, l’endroit le plus sec de la Terre hors des pôles')],
  facts: [['The Event Horizon Telescope links dishes all over the planet into one Earth-sized telescope. In 2019 it showed the first picture of a black hole, in the galaxy M87, and in 2022 the one at the centre of the Milky Way.',
      'L’Event Horizon Telescope relie des antennes du monde entier en un seul télescope de la taille de la Terre. En 2019, il a montré la première image d’un trou noir, dans la galaxie M87, et en 2022 celui du centre de la Voie lactée.'],
    ['Gravitational waves are ripples in space itself, set off when black holes or neutron stars collide. LIGO and Virgo detect them with laser beams kilometres long.',
      'Les ondes gravitationnelles sont des rides de l’espace lui-même, provoquées par la collision de trous noirs ou d’étoiles à neutrons. LIGO et Virgo les détectent avec des faisceaux laser de plusieurs kilomètres.'],
    ['Radio telescopes work in daylight and through clouds, because radio waves pass where light cannot.', 'Les radiotélescopes fonctionnent de jour et à travers les nuages, car les ondes radio passent là où la lumière est arrêtée.']] };

// ---------- switch, menu ----------
const row = document.createElement('label'); row.innerHTML = '<span>Observatories</span> <input id="obsOn" type="checkbox">';
($('ilrsOn') ? $('ilrsOn').parentElement : $('labels').parentElement).after(row);
const box = $('obsOn'); box.onchange = () => { grp.visible = box.checked; };
const on = () => { if (!box.checked) { box.checked = true; box.onchange(); } };
special.OBS = () => { on(); flyTo('OBS'); };
for (const o of OB) special['OBS_' + o[0]] = () => { on(); flyTo('OBS_' + o[0]); };
{
  const og = document.createElement('optgroup'); og.label = '🔭 Observatories on Earth';
  const before = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === '📡 Laser ranging stations (ILRS)') || [...focusSel.querySelectorAll('optgroup')].find(g => g.label === '🌍 Around Earth');
  before ? before.after(og) : focusSel.appendChild(og);
  const add = (k, t) => { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); };
  add('OBS', '🔭 All observatories: what do they see?');
  for (const o of OB) add('OBS_' + o[0], o[1] + ' (' + o[3] + ')');
}

// ---------- French ----------
{
  const name = { 'Observatories on Earth': 'Observatoires sur Terre', '🔭 Observatories on Earth': '🔭 Observatoires sur Terre', '🔭 All observatories: what do they see?': '🔭 Tous les observatoires : que voient-ils ?', Observatories: 'Observatoires' };
  const cat = {}, dist = {}, fact = {};
  for (const t of Object.values(TYPE)) cat[t[1]] = t[2]; cat.Observatories = 'Observatoires'; dist['around the world'] = 'dans le monde entier';
  for (const [k, en, fr, c, cf, , , , , nf] of OB) {
    name[en] = fr; name[en + ' (' + c + ')'] = fr + ' (' + cf + ')'; name['🔭 ' + en.replace(/ \(.*\)$/, '')] = '🔭 ' + fr.replace(/ \(.*\)$/, '');
    dist[c] = cf; fact['OBS_' + k] = nf;
  }
  SS.i18nAdd?.({ ui: { Observatories: 'Observatoires', '🔭 Observatories on Earth': '🔭 Observatoires sur Terre', ...Object.fromEntries(Object.entries(name).filter(([k]) => k.includes('('))) }, name, cat, dist, fact });
}
