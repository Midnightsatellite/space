// =====================================================================
// 👽 Is anyone out there? Where life might be, "Our Alien Earth" field sites, and the Wow! signal
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { camera, bodies, sim, flyTo, focusSel, glowSprite } = SS;
const { info, INFO, skyDir, deepLabel } = SS.cosmos;
const { nearLabel, PL } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const special = SS.more.special;
const go = k => { focusSel.value = k; SS.go(k); };

// ---------- 1. where could life be? ----------
const PLACES = [ // fly to, EN name, FR name, EN text, FR text
  ['Perseverance', 'Mars', 'Mars', 'In 2024 Perseverance found a rock with tiny "leopard spots" that, on Earth, are often made by microbes. NASA scientists call it the most promising possible sign of ancient life found so far, but it is not proof.',
    "En 2024, Perseverance a trouvé une roche couverte de minuscules « taches de léopard » qui, sur Terre, sont souvent l'œuvre de microbes. La NASA y voit le signe de vie ancienne le plus prometteur à ce jour, mais pas encore une preuve."],
  ['Europa', 'Europa', 'Europe', 'Hides a salty ocean under its ice, with more water than all of Earth\'s oceans. NASA\'s Europa Clipper reaches Jupiter in April 2030.',
    "Cache un océan salé sous sa glace, avec plus d'eau que tous les océans de la Terre. La sonde Europa Clipper de la NASA atteindra Jupiter en avril 2030."],
  ['Enceladus', 'Enceladus', 'Encelade', 'Sprays its underground ocean into space from cracks at its south pole. The spray contains salt and many of the chemicals life needs.',
    "Projette son océan souterrain dans l'espace par des fissures au pôle Sud. Ces jets contiennent du sel et beaucoup des ingrédients chimiques de la vie."],
  ['Titan', 'Titan', 'Titan', 'Has rain, rivers and seas, but of liquid methane. NASA\'s Dragonfly drone launches in July 2028 and should arrive in 2034.',
    "A de la pluie, des rivières et des mers… de méthane liquide. Le drone Dragonfly de la NASA doit décoller en juillet 2028 et arriver en 2034."],
  ['T1e', 'TRAPPIST-1e', 'TRAPPIST-1e', 'An Earth-sized planet 40 light-years away, in the zone where water could stay liquid. Webb is looking for an atmosphere.',
    "Une planète de la taille de la Terre, à 40 années-lumière, dans la zone où l'eau pourrait rester liquide. Webb cherche à savoir si elle a une atmosphère."],
  ['ProximaB', 'Proxima b', 'Proxima b', 'The closest exoplanet, in its star\'s habitable zone, but blasted by flares from its red dwarf star.',
    "L'exoplanète la plus proche, dans la zone habitable de son étoile, mais frappée par les éruptions de sa naine rouge."],
];
function lifeCard() {
  const F = fr();
  return (F ? "Personne n'a encore trouvé de vie ailleurs que sur Terre. Voici les meilleurs endroits où chercher. Touchez-en un pour y aller." : 'No one has found life beyond Earth yet. These are the best places to look. Tap one to fly there.') +
    PLACES.map(([k, en, frn, te, tf]) => `<div class="ln" data-go="${k}" style="cursor:pointer;padding:5px 0;border-top:1px solid rgba(140,160,255,.15)"><b style="display:inline;font-size:13px">👽 ${F ? frn : en}</b><br><span style="opacity:.85">${F ? tf : te}</span></div>`).join('');
}
bodies.LifeAll = { obj: bodies.Sun.obj, radius: 5, view: 120, dir: () => V(0.2, 0.85, 0.5).normalize() };
info('LifeAll', 'Is anyone out there?', 'The search for life', 'from Mars to other stars', lifeCard());

// ---------- 2. "Our Alien Earth": NASA scientists testing life-hunting tools in Earth's harshest places ----------
const earthMesh = PL.Earth.tilted.children[0];
const surf = (lat, lon, r) => V(Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.sin(lat * D2R), -Math.cos(lat * D2R) * Math.sin(lon * D2R)).multiplyScalar(r);
const FIELD = [ // key, name, lat, lon, place, video id, length, EN, FR
  ['AE_Iceland', 'Our Alien Earth: Iceland', 63.9, -22.27, 'Reykjanes lava fields, Iceland', 'our-alien-earth-iceland', '19 min',
    'Dr Amanda Stockton\'s team drives into the lava fields of a recently erupted volcano to see how fast microbes move back in: a clue to how life could survive on volcanic worlds like Mars.',
    "L'équipe d'Amanda Stockton part dans les champs de lave d'un volcan qui vient d'entrer en éruption, pour voir à quelle vitesse les microbes reviennent : un indice sur la vie possible sur des mondes volcaniques comme Mars."],
  ['AE_Greenland', 'Our Alien Earth: Greenland', 65.17, -49.82, 'Isua, Greenland', 'our-alien-earth-greenland', '15 min',
    'Dr Abigail Allwood\'s team tests a disputed claim that these rocks, among the oldest on Earth, hold signs of ancient life. Telling real fossils from look-alikes is exactly what Perseverance must do on Mars.',
    "L'équipe d'Abigail Allwood examine une affirmation contestée : ces roches, parmi les plus vieilles de la Terre, garderaient des traces de vie ancienne. Distinguer vrais fossiles et imitations, c'est exactement ce que Perseverance doit faire sur Mars."],
  ['AE_Greece', 'Our Alien Earth: Greece', 36.53, 25.49, 'undersea volcanoes off Santorini, Greece', 'our-alien-earth-greece', '24 min',
    'Dr Richard Camilli\'s team sends robot submarines to the undersea volcanoes off Santorini: practice for one day exploring the hidden oceans of Europa and Enceladus.',
    "L'équipe de Richard Camilli envoie des sous-marins robotisés explorer les volcans sous-marins au large de Santorin : un entraînement pour explorer un jour les océans cachés d'Europe et d'Encelade."],
  ['AE_Hawaii', 'Our Alien Earth: Mauna Loa', 19.48, -155.6, 'lava tubes of Mauna Loa, Hawaiʻi', 'our-alien-earth-the-lava-tubes-of-mauna-loa-hawaii', '20 min',
    'Four teams of NASA astrobiologists explore caves of lava under Hawaiʻi\'s volcanoes, to learn how life could hide underground on other worlds, like the lava tubes of Mars and the Moon.',
    "Quatre équipes d'astrobiologistes de la NASA explorent des tunnels de lave sous les volcans d'Hawaï, pour comprendre comment la vie pourrait se cacher sous terre sur d'autres mondes, comme dans les tunnels de lave de Mars et de la Lune."],
];
const pins = [];
const vid = (id, len) => ` <a href="https://plus.nasa.gov/video/${id}/" target="_blank" rel="noopener" style="color:#ffd27a">▶ ${fr() ? `Voir l'épisode sur NASA+ (${len}, en anglais)` : `Watch on NASA+ (${len})`}</a>`;
for (const [k, name, lat, lon, where, id, len, en, frt] of FIELD) {
  const n = surf(lat, lon, 1).normalize();
  const pin = new THREE.Group(); pin.position.copy(n).multiplyScalar(1.003); pin.quaternion.setFromUnitVectors(V(0, 1, 0), n); earthMesh.add(pin);
  pin.add(glowSprite(0.024, '#7dff9a', 'rgba(0,0,0,0)', 0.95));
  nearLabel(pin, '👽 ' + name.replace('Our Alien Earth: ', ''), 0.05, k, 'craft', 5); pins.push(pin);
  const wp = V(), ep = V();
  bodies[k] = { obj: pin, radius: 0.05, view: 1.6, dir: () => { pin.getWorldPosition(wp); earthMesh.getWorldPosition(ep); return wp.sub(ep).normalize().add(V(0, 0.2, 0)).normalize(); } };
  info(k, name, 'NASA+ documentary · Our Alien Earth', where, en);
  SS.i18nAdd?.({ fact: { [k]: frt } });
  special[k] = () => { $('speed').value = '0.0000115741'; const au = $('auto'); if (au.checked) { au.checked = false; au.dispatchEvent(new Event('change')); } SS.controls.autoRotate = false; flyTo(k); };
}
{ const ew = V(), pw = V(), cw = V();
  sim.push(() => { earthMesh.getWorldPosition(ew); camera.getWorldPosition(cw);
    for (const p of pins) { p.getWorldPosition(pw); if (pw.clone().sub(ew).normalize().dot(cw.clone().sub(pw).normalize()) < 0.05) for (const c of p.children) if (c.isCSS2DObject) c.visible = false; } }); }

// ---------- 3. the Wow! signal ----------
{
  const o = new THREE.Object3D(); o.position.copy(skyDir(291.3, -27.0).multiplyScalar(1400)); SS.scene.add(o);
  o.add(glowSprite(18, '#ff5a5a', 'rgba(0,0,0,0)', 0.9));
  deepLabel(o, '📡 Wow!', 14, 'Wow', 'neb', 900);
  bodies.Wow = { obj: o, radius: 10, view: 90, selfLit: true };
  info('Wow', 'The Wow! signal', 'Radio mystery · 15 August 1977', 'from the direction of Sagittarius',
    'A powerful radio signal picked up for 72 seconds by the Big Ear radio telescope in Ohio. Astronomer Jerry Ehman circled it on the printout and wrote "Wow!". Nobody has heard it again, and its source is still debated: no one has ever shown it came from aliens.');
}

// ---------- menu, cards with live links ----------
{
  const og = document.createElement('optgroup'); og.label = '👽 Is anyone out there?';
  const after = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === '🌌 Our galactic neighbourhood');
  after ? after.before(og) : focusSel.appendChild(og);
  for (const [k, t] of [['LifeAll', '🔎 Where could life be?'], ...FIELD.map(f => [f[0], '🌍 ' + f[1]]), ['Wow', '📡 The Wow! signal (1977)']]) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); }
  const prev = SS.onFocus;
  SS.onFocus = key => {
    if (key === 'LifeAll') { INFO.LifeAll.fact = lifeCard(); if (SS.more.INFO_EN?.LifeAll) SS.more.INFO_EN.LifeAll.fact = INFO.LifeAll.fact; }
    prev(key);
    const el = $('info');
    if (key === 'LifeAll') for (const d of el.querySelectorAll('.ln')) d.onclick = () => go(d.dataset.go);
    const f = FIELD.find(x => x[0] === key);
    if (f) { const s = el.querySelector('.share'); const a = document.createElement('div'); a.innerHTML = vid(f[5], f[6]); a.style.marginTop = '6px'; el.insertBefore(a, s || null); }
  };
}

// ---------- One Fact cards ----------
{
  const F = SS.more.FACTS, FR = SS.more.FACTS_FR;
  const add = (en, frc) => { F.push(en); if (FR) FR[F.length - 1] = frc; };
  add(['Enceladus', 'A moon sprays its ocean into space', 'Saturn\'s moon Enceladus shoots water from its hidden ocean out of cracks at its south pole.'],
    ['Une lune projette son océan dans l\'espace', "Encelade, une lune de Saturne, fait jaillir l'eau de son océan caché par des fissures au pôle Sud."]);
  add(['Wow', 'A 72-second signal still puzzles astronomers', 'In 1977 a radio telescope caught a strong signal from Sagittarius, nicknamed "Wow!". It has never been heard again.'],
    ['Un signal de 72 secondes intrigue encore', "En 1977, un radiotélescope a capté un signal puissant venant du Sagittaire, surnommé « Wow! ». On ne l'a jamais réentendu."]);
}

// ---------- French ----------
SS.i18nAdd?.({
  ui: { '👽 Is anyone out there?': '👽 Y a-t-il quelqu\'un ?', '🔎 Where could life be?': '🔎 Où pourrait-il y avoir de la vie ?', '📡 The Wow! signal (1977)': '📡 Le signal Wow! (1977)',
    '🌍 Our Alien Earth: Iceland': '🌍 Our Alien Earth : Islande', '🌍 Our Alien Earth: Greenland': '🌍 Our Alien Earth : Groenland', '🌍 Our Alien Earth: Greece': '🌍 Our Alien Earth : Grèce', '🌍 Our Alien Earth: Mauna Loa': '🌍 Our Alien Earth : Mauna Loa' },
  name: { 'Is anyone out there?': 'Y a-t-il quelqu\'un ?', 'The Wow! signal': 'Le signal Wow!', '👽 Iceland': '👽 Islande', '👽 Greenland': '👽 Groenland', '👽 Greece': '👽 Grèce', '👽 Mauna Loa': '👽 Mauna Loa',
    'Our Alien Earth: Iceland': 'Our Alien Earth : Islande', 'Our Alien Earth: Greenland': 'Our Alien Earth : Groenland', 'Our Alien Earth: Greece': 'Our Alien Earth : Grèce', 'Our Alien Earth: Mauna Loa': 'Our Alien Earth : Mauna Loa' },
  cat: { 'The search for life': 'La recherche de la vie', 'NASA+ documentary · Our Alien Earth': 'Documentaire NASA+ · Our Alien Earth', 'Radio mystery · 15 August 1977': 'Mystère radio · 15 août 1977' },
  dist: { 'from Mars to other stars': "de Mars jusqu'aux autres étoiles", 'Reykjanes lava fields, Iceland': 'Champs de lave de Reykjanes, Islande', 'Isua, Greenland': 'Isua, Groenland',
    'undersea volcanoes off Santorini, Greece': 'Volcans sous-marins au large de Santorin, Grèce', 'lava tubes of Mauna Loa, Hawaiʻi': 'Tunnels de lave du Mauna Loa, Hawaï', 'from the direction of Sagittarius': 'en direction du Sagittaire' },
  fact: { Wow: "Un signal radio puissant capté pendant 72 secondes par le radiotélescope Big Ear, dans l'Ohio. L'astronome Jerry Ehman l'a entouré sur le relevé et a écrit « Wow! ». Personne ne l'a réentendu, et son origine fait encore débat : rien n'a jamais montré qu'il venait d'extraterrestres." },
});
