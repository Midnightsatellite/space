// =====================================================================
// ILRS laser ranging stations: telescopes that fire laser pulses at satellites (and the Moon's mirrors)
// and time the echo to measure distances to within millimetres. Stations from the ILRS operational table.
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
const earthLocal = (lat, lon, r = 1) => { const la = lat * D2R, lo = lon * D2R; return V(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)).multiplyScalar(r); };

// monument, code, place, country, lat, lon (site positions rounded to about 0.1°)
const ST = [
  [1824, 'GLSL', 'Golosiiv', 'Ukraine', 50.36, 30.50], [1868, 'KOML', 'Komsomolsk-na-Amure', 'Russia', 50.69, 136.74],
  [1873, 'SIML', 'Simeiz', 'Ukraine', 44.41, 33.99], [1874, 'MDVS', 'Mendeleevo', 'Russia', 56.03, 37.22],
  [1879, 'ALTL', 'Altay', 'Russia', 51.7, 85.8], [1884, 'RIGL', 'Riga', 'Latvia', 56.95, 24.06],
  [1886, 'ARKL', 'Arkhyz', 'Russia', 43.65, 41.43], [1887, 'BAIL', 'Baikonur', 'Kazakhstan', 45.92, 63.34],
  [1888, 'SVEL', 'Svetloe', 'Russia', 60.53, 29.78], [1889, 'ZELL', 'Zelenchukskaya', 'Russia', 43.79, 41.56],
  [1890, 'BADL', 'Badary', 'Russia', 51.77, 102.23], [1891, 'IRKL', 'Irkutsk', 'Russia', 52.22, 104.32],
  [1893, 'KTZL', 'Katzively', 'Ukraine', 44.39, 33.97], [7045, 'APOL', 'Apache Point, New Mexico', 'USA', 32.78, -105.82],
  [7090, 'YARL', 'Yarragadee', 'Australia', -29.05, 115.35], [7105, 'GODL', 'Greenbelt, Maryland', 'USA', 39.02, -76.83],
  [7110, 'MONL', 'Monument Peak, California', 'USA', 32.89, -116.42], [7119, 'HA4T', 'Haleakala, Hawaii', 'USA', 20.71, -156.26],
  [7124, 'THTL', 'Tahiti', 'French Polynesia', -17.58, -149.61], [7237, 'CHAL', 'Changchun', 'China', 43.79, 125.44],
  [7249, 'BEIL', 'Beijing', 'China', 39.61, 115.89], [7306, 'TKBL', 'Tsukuba', 'Japan', 36.10, 140.09],
  [7329, 'NTSC', 'Xi’an', 'China', 34.37, 109.22], [7394, 'SEJL', 'Sejong City', 'South Korea', 36.52, 127.30],
  [7396, 'JFNL', 'Wuhan', 'China', 30.52, 114.49], [7403, 'AREL', 'Arequipa', 'Peru', -16.47, -71.49],
  [7406, 'SJUL', 'San Juan', 'Argentina', -31.51, -68.62], [7407, 'BRAL', 'Brasília', 'Brazil', -15.95, -47.88],
  [7501, 'HARL', 'Hartebeesthoek', 'South Africa', -25.89, 27.69], [7503, 'HRTL', 'Hartebeesthoek (2nd)', 'South Africa', -25.89, 27.69],
  [7701, 'IZ1L', 'Izaña, Tenerife', 'Spain', 28.30, -16.51], [7810, 'ZIML', 'Zimmerwald', 'Switzerland', 46.88, 7.47],
  [7811, 'BORL', 'Borowiec', 'Poland', 52.28, 17.07], [7817, 'YEBL', 'Yebes', 'Spain', 40.52, -3.09],
  [7819, 'KUN2', 'Kunming', 'China', 25.03, 102.80], [7821, 'SHA2', 'Shanghai', 'China', 31.10, 121.19],
  [7824, 'SFEL', 'San Fernando', 'Spain', 36.47, -6.21], [7825, 'STL3', 'Mount Stromlo', 'Australia', -35.32, 149.01],
  [7827, 'SOSW', 'Wettzell (SOS-W)', 'Germany', 49.14, 12.88], [7838, 'SISL', 'Simosato', 'Japan', 33.58, 135.94],
  [7839, 'GRZL', 'Graz', 'Austria', 47.07, 15.49], [7840, 'HERL', 'Herstmonceux', 'United Kingdom', 50.87, 0.34],
  [7841, 'POT3', 'Potsdam', 'Germany', 52.38, 13.06], [7845, 'GRSM', 'Grasse', 'France', 43.75, 6.92],
  [7941, 'MATM', 'Matera', 'Italy', 40.65, 16.70], [8834, 'WETL', 'Wettzell (WLRS)', 'Germany', 49.14, 12.88],
];
const MOON = { APOL: 1, GRSM: 1, MATM: 1, WETL: 1 };   // stations that also bounce lasers off the Moon's mirrors
const NOTE = {
  APOL: ['APOLLO: a 3.5 m telescope that times laser pulses to the Apollo mirrors on the Moon to about a millimetre.', 'APOLLO : un télescope de 3,5 m qui chronomètre des impulsions laser vers les miroirs d’Apollo sur la Lune, au millimètre près.'],
  GRSM: ['Côte d’Azur Observatory: one of the few stations that regularly hit the mirrors left on the Moon.', 'Observatoire de la Côte d’Azur : l’une des rares stations qui visent régulièrement les miroirs laissés sur la Lune.'],
  MATM: ['MLRO, Italy’s Matera Laser Ranging Observatory, ranges both satellites and the Moon.', 'Le MLRO, l’observatoire laser de Matera en Italie, vise à la fois les satellites et la Lune.'],
  HERL: ['Herstmonceux, in East Sussex, at the old home of the Royal Greenwich Observatory.', 'Herstmonceux, dans le Sussex de l’Est, sur l’ancien site de l’Observatoire royal de Greenwich.'],
  GODL: ['At NASA Goddard, where the ILRS central bureau and its data centre are based.', 'À la NASA Goddard, où se trouvent le bureau central de l’ILRS et son centre de données.'],
  YARL: ['One of the most productive stations in the network, in the remote Western Australian outback.', 'L’une des stations les plus productives du réseau, dans l’outback reculé d’Australie occidentale.'],
  BAIL: ['Next to the Baikonur Cosmodrome, where Sputnik and Gagarin were launched.', 'À côté du cosmodrome de Baïkonour, d’où sont partis Spoutnik et Gagarine.'],
  HA4T: ['On top of the Haleakala volcano in Maui, above the clouds.', 'Au sommet du volcan Haleakala, à Maui, au-dessus des nuages.'],
};
const FR_C = { Ukraine: 'Ukraine', Russia: 'Russie', Latvia: 'Lettonie', Kazakhstan: 'Kazakhstan', USA: 'États-Unis', Australia: 'Australie', 'French Polynesia': 'Polynésie française',
  China: 'Chine', Japan: 'Japon', 'South Korea': 'Corée du Sud', Peru: 'Pérou', Argentina: 'Argentine', Brazil: 'Brésil', 'South Africa': 'Afrique du Sud', Spain: 'Espagne',
  Switzerland: 'Suisse', Poland: 'Pologne', Germany: 'Allemagne', 'United Kingdom': 'Royaume-Uni', Austria: 'Autriche', France: 'France', Italy: 'Italie' };
const FR_P = { 'Apache Point, New Mexico': 'Apache Point, Nouveau-Mexique', 'Greenbelt, Maryland': 'Greenbelt, Maryland', 'Monument Peak, California': 'Monument Peak, Californie',
  'Haleakala, Hawaii': 'Haleakala, Hawaï', 'Hartebeesthoek (2nd)': 'Hartebeesthoek (2e)', 'Izaña, Tenerife': 'Izaña, Tenerife', 'Mount Stromlo': 'Mont Stromlo', Beijing: 'Pékin' };

// ---------- pins on the globe (hidden until switched on) ----------
const grp = new THREE.Group(); grp.visible = false; earthMesh.add(grp);
const pins = [];
for (const [mon, code, place, country, lat, lon] of ST) {
  const n = earthLocal(lat, lon, 1).normalize(), key = 'SLR_' + code;
  const pin = new THREE.Group(); pin.position.copy(n).multiplyScalar(1.002); pin.quaternion.setFromUnitVectors(V(0, 1, 0), n); grp.add(pin);
  pin.add(glowSprite(0.016, MOON[code] ? '#ffe27a' : '#7dffb0', 'rgba(0,0,0,0)', 0.95));
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.0008, 0.0008, 0.05, 4), new THREE.MeshBasicMaterial({ color: MOON[code] ? 0xffe27a : 0x7dffb0, transparent: true, opacity: 0.8 })); beam.position.y = 0.025; pin.add(beam);
  nearLabel(pin, '📡 ' + place, 0.04, key, 'craft', 3);
  pins.push(pin);
  const wp = V(), ep = V();
  bodies[key] = { obj: pin, radius: 0.04, view: 1.4, dir: () => { pin.getWorldPosition(wp); earthMesh.getWorldPosition(ep); return wp.sub(ep).normalize().add(V(0, 0.25, 0)).normalize(); } };
  const extra = NOTE[code] ? ' ' + NOTE[code][0] : '';
  info(key, place, 'Laser ranging station · ' + code + ' · ' + mon, place.includes(',') ? country : place + ', ' + country,
    `One of about 45 stations of the International Laser Ranging Service. It fires short laser pulses at satellites carrying mirrors and times the echo, to measure their distance to within millimetres${MOON[code] ? ', and it can even reach the mirrors on the Moon' : ''}.${extra}`);
}
// hide labels on the far side of the globe
{ const ew = V(), pw = V(), cw = V();
  sim.push(() => { if (!grp.visible) return; earthMesh.getWorldPosition(ew); camera.getWorldPosition(cw);
    for (const pin of pins) { pin.getWorldPosition(pw); if (pw.clone().sub(ew).normalize().dot(cw.clone().sub(pw).normalize()) <= 0.05) for (const c of pin.children) if (c.isCSS2DObject) c.visible = false; } }); }

// ---------- overview card ----------
const ov = new THREE.Object3D(); earthMesh.add(ov);
bodies.ILRS = { obj: bodies.Earth.obj, radius: 1.2, view: 3.2, dir: () => V(0.3, 0.6, 1).normalize() };
const T = (l, lf, v, vf) => [l, lf, v, vf];
SS.more.cards2.ILRS = { intro: ['The International Laser Ranging Service links about 45 observatories that fire laser pulses at satellites with mirrors, and at the mirrors left on the Moon, then time the echo to measure the distance to within millimetres.',
    'Le Service international de télémétrie laser (ILRS) relie environ 45 observatoires qui tirent des impulsions laser vers des satellites équipés de miroirs, et vers les miroirs laissés sur la Lune, puis chronomètrent l’écho pour mesurer la distance au millimètre près.'],
  tiles: [T('What', 'Quoi', 'satellite laser ranging (SLR) and lunar laser ranging (LLR)', 'télémétrie laser sur satellites (SLR) et sur la Lune (LLR)'),
    T('Stations', 'Stations', 'about 45, on every continent except Antarctica', 'environ 45, sur tous les continents sauf l’Antarctique'),
    T('Accuracy', 'Précision', 'a few millimetres to satellites', 'quelques millimètres pour les satellites'),
    T('Targets', 'Cibles', 'over 100 satellites with retroreflectors, and the mirror panels on the Moon', 'plus de 100 satellites à rétroréflecteurs, et les panneaux de miroirs sur la Lune'),
    T('Part of', 'Rattaché à', 'the International Association of Geodesy', 'l’Association internationale de géodésie'),
    T('Colours', 'Couleurs', 'green pins: satellites · gold pins: also the Moon', 'repères verts : satellites · repères dorés : aussi la Lune')],
  facts: [['A retroreflector is a "corner cube" mirror that sends light straight back where it came from, whatever angle it arrives at.', 'Un rétroréflecteur est un miroir en « coin de cube » qui renvoie la lumière exactement d’où elle vient, quel que soit son angle d’arrivée.'],
    ['LAGEOS, launched in 1976, is a 60 cm brass-and-aluminium ball covered in 426 of these mirrors, like a giant golf ball. It will stay in orbit for millions of years.', 'LAGEOS, lancé en 1976, est une boule de 60 cm en laiton et aluminium couverte de 426 de ces miroirs, comme une balle de golf géante. Il restera en orbite pendant des millions d’années.'],
    ['Apollo 11, 14 and 15 left mirror panels on the Moon, and two Soviet Lunokhod rovers carry them too. They are still used today.', 'Apollo 11, 14 et 15 ont laissé des panneaux de miroirs sur la Lune, et deux rovers soviétiques Lunokhod en portent aussi. Ils servent encore aujourd’hui.'],
    ['Thanks to these echoes we know the Moon is drifting away from Earth by about 3.8 cm a year.', 'Grâce à ces échos, on sait que la Lune s’éloigne de la Terre d’environ 3,8 cm par an.'],
    ['Laser ranging measures continents drifting, the shape of the Earth and sea level, and checks the orbits of GPS and Galileo satellites.', 'La télémétrie laser mesure la dérive des continents, la forme de la Terre et le niveau de la mer, et vérifie les orbites des satellites GPS et Galileo.'],
    ['Tiangong-2, China’s second space lab (2016–2019), carried mirrors so laser stations could check its GPS-computed orbit.', 'Tiangong-2, le deuxième laboratoire spatial chinois (2016–2019), portait des miroirs pour que les stations laser vérifient son orbite calculée par GPS.']] };
info('ILRS', 'Laser ranging stations (ILRS)', 'Laser ranging network', 'about 45 stations around the world', 'See card.');

// ---------- switch, menu ----------
const row = document.createElement('label'); row.innerHTML = '<span>Laser ranging stations</span> <input id="ilrsOn" type="checkbox">';
($('swarmsOn') ? $('swarmsOn').parentElement : $('labels').parentElement).after(row);
const box = $('ilrsOn'); box.onchange = () => { grp.visible = box.checked; };
const on = () => { if (!box.checked) { box.checked = true; box.onchange(); } };
special.ILRS = () => { on(); flyTo('ILRS'); };
for (const s of ST) special['SLR_' + s[1]] = () => { on(); flyTo('SLR_' + s[1]); };
{
  const og = document.createElement('optgroup'); og.label = '📡 Laser ranging stations (ILRS)';
  const before = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === '🌍 Around Earth');
  before ? before.after(og) : focusSel.appendChild(og);
  const add = (k, t) => { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); };
  add('ILRS', '📡 All stations: what is laser ranging?');
  for (const s of [...ST].sort((a, b) => a[2].localeCompare(b[2]))) add('SLR_' + s[1], s[2] + ' (' + s[3] + ')');
}

// ---------- French ----------
{
  const name = { 'Laser ranging stations (ILRS)': 'Stations de télémétrie laser (ILRS)', '📡 All stations: what is laser ranging?': '📡 Toutes les stations : qu’est-ce que la télémétrie laser ?',
    '📡 Laser ranging stations (ILRS)': '📡 Stations de télémétrie laser (ILRS)', 'Laser ranging stations': 'Stations de télémétrie laser' };
  const cat = { 'Laser ranging network': 'Réseau de télémétrie laser' }, dist = { 'about 45 stations around the world': 'environ 45 stations dans le monde' }, fact = {};
  for (const [mon, code, place, country] of ST) {
    const pf = FR_P[place] || place, cf = FR_C[country] || country;
    name['📡 ' + place] = '📡 ' + pf; name[place] = pf; name[place + ' (' + country + ')'] = pf + ' (' + cf + ')';
    cat['Laser ranging station · ' + code + ' · ' + mon] = 'Station de télémétrie laser · ' + code + ' · ' + mon;
    dist[place.includes(',') ? country : place + ', ' + country] = place.includes(',') ? cf : pf + ', ' + cf;
    fact['SLR_' + code] = `L’une des quelque 45 stations du Service international de télémétrie laser. Elle tire de courtes impulsions laser vers des satellites équipés de miroirs et chronomètre l’écho, pour mesurer leur distance au millimètre près${MOON[code] ? ', et elle peut même atteindre les miroirs posés sur la Lune' : ''}.${NOTE[code] ? ' ' + NOTE[code][1] : ''}`;
  }
  SS.i18nAdd?.({ ui: { 'Laser ranging stations': 'Stations de télémétrie laser', '📡 Laser ranging stations (ILRS)': '📡 Stations de télémétrie laser (ILRS)', ...Object.fromEntries(Object.entries(name).filter(([k]) => k.includes('('))) }, name, cat, dist, fact });
}
