// =====================================================================
// Parker Solar Probe: NASA's own 3D model, a full mission card and the next close pass
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { INFO } = SS.cosmos;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const special = SS.more.special;

// close passes (perihelia) repeat every ~88.44 days; perihelion 29 was on 4 Sep 2026 at 14:53 UTC
const P29 = Date.UTC(2026, 8, 4, 14, 53), PER = 88.44 * 864e5;
const nextPass = from => { const n = Math.ceil((from - P29) / PER); return { n: 29 + n, t: P29 + n * PER }; };

// ---------- the NASA model (NASA Visualization Technology Applications and Development), swapped in on the first visit ----------
{
  const holder = bodies.Parker.obj; let done = false;
  const load = () => {
    if (done) return; done = true;
    const l = new GLTFLoader(); l.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/').setDecoderConfig({ type: 'wasm' }));
    l.load('models/parker.glb', g => {
      const m = g.scene;
      m.traverse(c => { if (c.isMesh && c.material) { if (c.material.emissive) { c.material.emissive.setHex(0xffffff); c.material.emissiveIntensity = 0.12; } } });
      const box = new THREE.Box3().setFromObject(m), c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
      m.position.sub(c);
      const wrap = new THREE.Group(); wrap.add(m); wrap.scale.setScalar(0.55 / Math.max(size.x, size.y, size.z));
      wrap.rotation.y = -Math.PI / 2;                                   // the heat shield (model −Z) faces the Sun
      holder.traverse(o => { if (o.isMesh) o.visible = false; });
      holder.add(wrap);
    }, undefined, e => { console.warn('parker model', e); done = false; });
  };
  const prev = SS.onFocus; SS.onFocus = k => { if (k === 'Parker' || k === 'ParkerNext') load(); prev(k); };
  SS.more.parkerLoad = load;
}

// ---------- the mission card ----------
const L = { type: ['Type', 'Type'], launch: ['Launch', 'Lancement'], close: ['Closest to the Sun', 'Au plus près du Soleil'], speed: ['Top speed', 'Vitesse maximale'],
  shield: ['Heat shield', 'Bouclier thermique'], mass: ['Mass', 'Masse'], orbit: ['One orbit', 'Une orbite'], status: ['Status', 'Statut'] };
const TILES = [
  ['type', 'Orbiter, round the Sun', 'Orbiteur, autour du Soleil'],
  ['launch', '12 Aug 2018, 07:31 UTC · Delta IV Heavy, Cape Canaveral', '12 août 2018, 07 h 31 UTC · Delta IV Heavy, cap Canaveral'],
  ['close', 'about 6.1 million km from the surface', 'environ 6,1 millions de km de la surface'],
  ['speed', 'about 692,000 km/h', 'environ 692 000 km/h'],
  ['shield', '11.4 cm of carbon foam, takes up to about 1,377 °C', '11,4 cm de mousse de carbone, résiste jusqu\'à environ 1 377 °C'],
  ['mass', '685 kg at launch', '685 kg au lancement'],
  ['orbit', 'about 88 days', 'environ 88 jours'],
  ['status', 'Extended mission, into 2029', 'Mission prolongée, jusqu\'en 2029'],
];
const FACTS = [
  ['In April 2021 it became the first spacecraft to fly through the corona, the Sun\'s outer atmosphere: "touching the Sun".', 'En avril 2021, elle est devenue le premier engin à traverser la couronne, l\'atmosphère extérieure du Soleil : elle a « touché le Soleil ».'],
  ['On 24 December 2024 it set two records: the closest pass to the Sun and the fastest human-made object. It has matched them on every close pass since.', 'Le 24 décembre 2024, elle a battu deux records : le passage le plus proche du Soleil et l\'objet le plus rapide jamais construit. Elle les égale à chaque passage depuis.'],
  ['At top speed it would cross from London to Paris in under 2 seconds.', 'À pleine vitesse, elle irait de Londres à Paris en moins de 2 secondes.'],
  ['Behind its shield, the instruments stay at about room temperature.', 'Derrière son bouclier, les instruments restent à peu près à température ambiante.'],
  ['Seven flybys of Venus, the last in November 2024, used Venus\'s gravity to shrink its orbit closer and closer.', 'Sept survols de Vénus, le dernier en novembre 2024, ont utilisé la gravité de Vénus pour resserrer son orbite.'],
  ['Named after Eugene Parker, who predicted the solar wind in 1958. He watched the launch, aged 91: the first NASA spacecraft named after a living person.', 'Nommée d\'après Eugene Parker, qui avait prédit le vent solaire en 1958. Il a assisté au lancement à 91 ans : le premier engin de la NASA baptisé du nom d\'une personne vivante.'],
  ['It carries a memory card with the names of over 1.1 million people.', 'Elle emporte une carte mémoire avec les noms de plus de 1,1 million de personnes.'],
  ['It found "switchbacks": sudden S-shaped kinks in the Sun\'s magnetic field, carried out by the solar wind.', 'Elle a découvert des « switchbacks » : de brusques zigzags du champ magnétique du Soleil, emportés par le vent solaire.'],
];
const INSTR = ['FIELDS (electric and magnetic fields) · ISʘIS (energetic particles) · WISPR (cameras) · SWEAP (solar wind)', 'FIELDS (champs électriques et magnétiques) · ISʘIS (particules énergétiques) · WISPR (caméras) · SWEAP (vent solaire)'];
const fmt = (t, F) => new Date(t).toLocaleDateString(F ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
function card(F) {
  const i = F ? 1 : 0, nx = nextPass(Date.now()), days = Math.ceil((nx.t - Date.now()) / 864e5);
  const tiles = TILES.map(([l, en, f]) => `<div style="background:rgba(140,160,255,.08);border-radius:8px;padding:5px 7px"><div style="font-size:10px;letter-spacing:.04em;text-transform:uppercase;opacity:.65">${L[l][i]}</div><div style="font-size:12.5px;line-height:1.3">${F ? f : en}</div></div>`).join('');
  return (F ? 'En mission pour « toucher le Soleil », la sonde Parker plonge dans la couronne solaire à chaque orbite, bien à l\'intérieur de l\'orbite de Mercure, pour comprendre d\'où vient le vent solaire.'
    : 'On a mission to "touch the Sun", Parker dives through the Sun\'s corona on every orbit, well inside the orbit of Mercury, to find out where the solar wind comes from.')
    + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0">${tiles}</div>`
    + `<div style="padding:6px 8px;border-radius:8px;background:rgba(255,190,100,.12);margin-bottom:6px">☀️ <b style="display:inline;font-size:13px">${F ? `Prochain passage au plus près (n° ${nx.n})` : `Next close pass (no. ${nx.n})`}</b><br>${F ? `vers le ${fmt(nx.t, true)} · dans ${days} jours` : `around ${fmt(nx.t, false)} · in ${days} days`} · <a href="#" id="pspGo" style="color:#ffd27a">${F ? 'voir ›' : 'watch it ›'}</a></div>`
    + `<details class="pmore" ${matchMedia('(min-height:760px) and (min-width:700px)').matches ? 'open' : ''}><summary style="cursor:pointer;color:#9fd0ff">📖 ${F ? 'En savoir plus' : 'More facts'}</summary><div style="max-height:min(30vh,240px);overflow:auto">
      <ul style="margin:6px 0 4px 16px;padding:0">${FACTS.map(f => `<li style="margin:3px 0">${f[i]}</li>`).join('')}</ul>
      <div style="font-size:12px;opacity:.85"><b style="display:inline;font-size:12px">🔬 ${F ? 'Instruments' : 'Instruments'}:</b> ${INSTR[i]}</div>
      <div style="font-size:12px;opacity:.85;margin-top:4px"><b style="display:inline;font-size:12px">🛠 ${F ? 'Construite et pilotée par' : 'Built and run by'}:</b> ${F ? 'le laboratoire de physique appliquée de l\'université Johns Hopkins, pour la NASA' : 'Johns Hopkins University Applied Physics Laboratory, for NASA'}</div></div></details>`;
}
{
  const set = k => { INFO[k].fact = card(fr()); if (SS.more.INFO_EN?.[k]) SS.more.INFO_EN[k].fact = card(false); SS.i18nAdd?.({ fact: { [k]: card(true) } }); };
  INFO.Parker.cat = 'Spacecraft · solar probe · active'; INFO.Parker.dist = 'dives to about 6.1 million km from the Sun';
  if (SS.more.INFO_EN?.Parker) { SS.more.INFO_EN.Parker.cat = INFO.Parker.cat; SS.more.INFO_EN.Parker.dist = INFO.Parker.dist; }
  const prev = SS.onFocus;
  SS.onFocus = k => {
    if (k === 'Parker') set('Parker');
    prev(k);
    if (k === 'Parker') { const a = $('pspGo'); if (a) a.onclick = e => { e.preventDefault(); special.ParkerNext(); }; }
  };
  // jump to a few hours before the next close pass, slow time down, and follow the probe
  special.ParkerNext = () => {
    SS.setDate(nextPass(Date.now()).t - 10 * 36e5); if ($('speed')) $('speed').value = '0.0416667';
    focusSel.value = 'Parker'; SS.more.parkerLoad?.(); setTimeout(() => flyTo('Parker'), 120);
  };
  const sp = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Spacecraft');
  const after = sp?.querySelector('option[value="Parker"]');
  const o = document.createElement('option'); o.value = 'ParkerNext'; o.textContent = '☀️ Parker: the next dive past the Sun';
  after ? after.after(o) : sp?.appendChild(o);
}
SS.i18nAdd?.({
  ui: { '☀️ Parker: the next dive past the Sun': '☀️ Parker : le prochain plongeon près du Soleil' },
  cat: { 'Spacecraft · solar probe · active': 'Engin spatial · sonde solaire · en activité' },
  dist: { 'dives to about 6.1 million km from the Sun': 'plonge à environ 6,1 millions de km du Soleil' },
});
await import('./roman.js' + new URL(import.meta.url).search);
