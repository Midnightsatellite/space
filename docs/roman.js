// =====================================================================
// Nancy Grace Roman Space Telescope: NASA's 3D model, pointed the right way, and a full mission card
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const SS = window.SS;
const { bodies, sim } = SS;
const { INFO } = SS.cosmos;
const fr = () => SS.lang === 'fr';
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- model: NASA's Roman model (B), solar panels (+Y) facing the Sun, telescope opening (−X) looking out to space ----------
{
  const g = bodies.Roman.obj; let model = null, done = false;
  const hold = new THREE.Group(); SS.scene.add(hold);
  const load = () => {
    if (done) return; done = true;
    const l = new GLTFLoader(); l.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/').setDecoderConfig({ type: 'wasm' }));
    l.load('models/roman.glb', res => {
      const m = res.scene, box = new THREE.Box3().setFromObject(m), size = box.getSize(V());
      m.position.sub(box.getCenter(V())); m.traverse(c => { if (c.isMesh && c.material?.emissive) { c.material.emissive.setHex(0xffffff); c.material.emissiveIntensity = 0.1; } });
      model = new THREE.Group(); model.add(m); model.scale.setScalar(0.16 / Math.max(size.x, size.y, size.z)); hold.add(model);
      g.traverse(o => { if (o.isMesh) o.visible = false; });
    }, undefined, e => { console.warn('roman model', e); done = false; });
  };
  const sunDir = V(), side = V(), pt = V(), m4 = new THREE.Matrix4(), X = V(), Z = V();
  sim.push((dt, t) => {
    hold.position.copy(g.getWorldPosition(pt));
    if (!model) return;
    sunDir.copy(hold.position).negate().normalize();                       // the Sun is at the centre of the scene
    side.crossVectors(V(0, 1, 0), sunDir).normalize();
    const a = 0.35 * Math.sin(t * 0.05);                                    // slowly sweeps the sky, always side-on to the Sun
    X.copy(side).multiplyScalar(-Math.cos(a)).addScaledVector(V(0, 1, 0), -Math.sin(a)).normalize();   // −X (the opening) looks along +side
    X.addScaledVector(sunDir, -X.dot(sunDir)).normalize();
    Z.crossVectors(X, sunDir).normalize();
    m4.makeBasis(X, sunDir, Z); hold.quaternion.setFromRotationMatrix(m4);
  });
  const prev = SS.onFocus; SS.onFocus = k => { if (k === 'Roman') load(); prev(k); };
}

// ---------- the mission card ----------
const L = { type: ['Type', 'Type'], launch: ['Launch', 'Lancement'], where: ['Home', 'Destination'], mirror: ['Mirror', 'Miroir'], camera: ['Camera', 'Caméra'],
  view: ['Field of view', 'Champ de vision'], mission: ['Main mission', 'Mission principale'], status: ['Status', 'Statut'] };
const TILES = [
  ['type', 'Infrared space telescope', 'Télescope spatial infrarouge'],
  ['launch', '30 Aug 2026 · Falcon Heavy, Kennedy Space Center pad 39A', '30 août 2026 · Falcon Heavy, pas de tir 39A du centre spatial Kennedy'],
  ['where', 'Sun–Earth L2, about 1.5 million km from Earth', 'Point L2 Soleil-Terre, à environ 1,5 million de km de la Terre'],
  ['mirror', '2.4 m, the same size as Hubble\'s', '2,4 m, la même taille que celui de Hubble'],
  ['camera', '300 megapixels (Wide Field Instrument)', '300 mégapixels (instrument grand champ)'],
  ['view', 'at least 100 × Hubble\'s', 'au moins 100 × celui de Hubble'],
  ['mission', '5 years', '5 ans'],
  ['status', 'Commissioning · first images expected in early 2027', 'Mise en service · premières images attendues début 2027'],
];
const FACTS = [
  ['Named after Nancy Grace Roman, NASA\'s first chief astronomer, known as the "mother of Hubble".', 'Il porte le nom de Nancy Grace Roman, première astronome en chef de la NASA, surnommée la « mère de Hubble ».'],
  ['It can survey the sky about 1,000 times faster than Hubble and may measure light from a billion galaxies.', 'Il peut cartographier le ciel environ 1 000 fois plus vite que Hubble et pourrait mesurer la lumière d\'un milliard de galaxies.'],
  ['It could find about 100,000 new planets, including some that drift between the stars with no sun.', 'Il pourrait trouver environ 100 000 nouvelles planètes, dont certaines qui errent entre les étoiles, sans soleil.'],
  ['Its coronagraph blocks a star\'s glare to photograph giant planets and dusty discs around it directly.', 'Son coronographe masque l\'éclat d\'une étoile pour photographier directement des planètes géantes et des disques de poussière autour d\'elle.'],
  ['It will help solve two big mysteries: dark energy, which speeds up the expansion of the universe, and dark matter.', 'Il aidera à percer deux grands mystères : l\'énergie noire, qui accélère l\'expansion de l\'Univers, et la matière noire.'],
  ['Built under budget and launched nine months ahead of schedule.', 'Construit sous le budget prévu et lancé avec neuf mois d\'avance.'],
  ['Commissioning so far: first test starlight in September, final commissioning phase from 22 October, instruments synchronised in November 2026.', 'Mise en service : premières lumières d\'essai en septembre, phase finale à partir du 22 octobre, instruments synchronisés en novembre 2026.'],
];
const card = F => {
  const i = F ? 1 : 0;
  const tiles = TILES.map(([l, en, f]) => `<div style="background:rgba(140,160,255,.08);border-radius:8px;padding:5px 7px"><div style="font-size:10px;letter-spacing:.04em;text-transform:uppercase;opacity:.65">${L[l][i]}</div><div style="font-size:12.5px;line-height:1.3">${F ? f : en}</div></div>`).join('');
  return (F ? 'Le nouveau grand télescope de la NASA, successeur de Hubble et Webb : un œil grand angle pour l\'énergie noire, les exoplanètes et l\'astrophysique infrarouge.'
    : 'NASA\'s newest flagship telescope, after Hubble and Webb: a wide-angle eye for dark energy, exoplanets and infrared astrophysics.')
    + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0">${tiles}</div>`
    + `<details class="pmore" ${matchMedia('(min-height:760px)').matches ? 'open' : ''}><summary style="cursor:pointer;color:#9fd0ff">📖 ${F ? 'En savoir plus' : 'More facts'}</summary><div style="max-height:min(30vh,240px);overflow:auto">
      <ul style="margin:6px 0 4px 16px;padding:0">${FACTS.map(f => `<li style="margin:3px 0">${f[i]}</li>`).join('')}</ul>
      <div style="font-size:12px;opacity:.85"><b style="display:inline;font-size:12px">🔗</b> <a href="https://science.nasa.gov/blogs/roman/" target="_blank" rel="noopener" style="color:#ffd27a">${F ? 'Suivre le blog Roman de la NASA ›' : 'Follow NASA\'s Roman blog ›'}</a></div></div></details>`;
};
{
  INFO.Roman.cat = 'Space telescope · launched 30 Aug 2026'; INFO.Roman.dist = 'at Sun–Earth L2, about 1.5 million km from Earth';
  if (SS.more.INFO_EN?.Roman) { SS.more.INFO_EN.Roman.cat = INFO.Roman.cat; SS.more.INFO_EN.Roman.dist = INFO.Roman.dist; }
  const prev = SS.onFocus;
  SS.onFocus = k => {
    if (k === 'Roman') { INFO.Roman.fact = card(fr()); if (SS.more.INFO_EN?.Roman) SS.more.INFO_EN.Roman.fact = card(false); SS.i18nAdd?.({ fact: { Roman: card(true) } }); }
    prev(k);
  };
  bodies.Roman.view = 0.45;
}
SS.i18nAdd?.({
  cat: { 'Space telescope · launched 30 Aug 2026': 'Télescope spatial · lancé le 30 août 2026' },
  dist: { 'at Sun–Earth L2, about 1.5 million km from Earth': 'au point L2 Soleil-Terre, à environ 1,5 million de km de la Terre' },
});
