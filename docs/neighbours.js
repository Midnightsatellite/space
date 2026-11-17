// =====================================================================
// Our galactic neighbourhood: the Local Group · the Andromeda collision · globular clusters · Gaia's galaxy
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { scene, camera, bodies, sim, addLabel, flyTo, focusSel, glowSprite } = SS;
const { info, skyDir, softDot, galaxyPoints, place, deepLabel, gauss } = SS.cosmos;
const { scaleHide } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const $ = id => document.getElementById(id);
const special = SS.more.special;
const tr = t => (SS.tr ? SS.tr(t) : t);
const pointsOf = (arr, color, size, opacity = 1) => {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size, map: softDot, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
};
const mark = (parent, text, pos, key, cls = 'gal') => { const o = new THREE.Object3D(); o.position.copy(pos); parent.add(o); addLabel(o, text, 0, key, cls); return o; };

// =====================================================================
// 1. THE LOCAL GROUP: a map of our galaxy's neighbours (1 million light-years = 900 units)
// =====================================================================
{
  const C = V(-16000, 9000, 0), K = 900;
  const hold = new THREE.Group(); hold.position.copy(C); scene.add(hold); scaleHide.push(hold);
  const spiral = (R, seed, tilt, rot, arms = 4, n = 22000) => { const d = new THREE.Group(); d.rotation.set(tilt, rot, 0); d.add(galaxyPoints({ type: 'spiral', R, n, arms, pitch: 0.24, bulge: 0.16, seed, bright: 1.4 })); d.add(glowSprite(R * 0.7, 'rgba(255,225,180,0.6)', 'rgba(0,0,0,0)', 0.5)); return d; };
  const blob = (R, seed, n = 1500) => { const d = new THREE.Group(); d.add(galaxyPoints({ type: 'elliptical', R, n, seed, bright: 1.6 })); d.add(glowSprite(R * 1.4, 'rgba(255,225,190,0.5)', 'rgba(0,0,0,0)', 0.35)); return d; };
  const at = (ra, dec, mly) => skyDir(ra, dec).multiplyScalar(mly * K);
  // the Milky Way at the centre
  const mw = spiral(150, 81, 0.4, 0); hold.add(mw);
  const ring = new THREE.Mesh(new THREE.RingGeometry(185, 200, 64), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2 + 0.4; hold.add(ring);
  sim.push((dt, t) => ring.scale.setScalar(1 + 0.12 * Math.sin(t * 2.5)));
  mark(hold, '☀ The Milky Way (you are here)', V(0, 210, 0), 'LocalGroup', 'star');
  const MEM = [ // name, RA, Dec, million light-years, kind, size
    ['Andromeda', 10.68, 41.27, 2.5, 'spiral', 220], ['Triangulum', 23.46, 30.66, 2.73, 'spiral', 90],
    ['Large Magellanic Cloud', 80.89, -69.76, 0.16, 'blob', 40], ['Small Magellanic Cloud', 13.19, -72.83, 0.20, 'blob', 26],
    ['M32', 10.67, 40.87, 2.49, 'blob', 18], ['M110', 10.09, 41.69, 2.69, 'blob', 26], ["Barnard's Galaxy", 296.24, -14.80, 1.6, 'blob', 30],
    ['IC 1613', 16.2, 2.12, 2.4, 'blob', 26], ['Leo I', 152.12, 12.31, 0.82, 'blob', 16], ['WLM', 0.49, -15.46, 3.0, 'blob', 24], ['Sextans A', 152.75, -4.69, 4.3, 'blob', 22],
  ];
  const dashes = [];
  let s = 90;
  for (const [name, ra, dec, mly, kind, R] of MEM) {
    const g = kind === 'spiral' ? spiral(R, s++, 1.1, s * 0.7, 2, 16000) : blob(R, s++);
    g.position.copy(at(ra, dec, mly)); hold.add(g);
    if (!['M32', 'M110'].includes(name)) addLabel(g, name, R + 14, 'LocalGroup', name === 'Andromeda' || name === 'Triangulum' ? 'gal' : 'craft');
    if (name === 'Andromeda') dashes.push(g.position.clone());
  }
  { // distance to Andromeda
    const a = dashes[0], line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(), a]), new THREE.LineDashedMaterial({ color: 0x9fb4ff, dashSize: 40, gapSize: 30, transparent: true, opacity: 0.6 }));
    line.computeLineDistances(); hold.add(line);
    mark(hold, '2.5 million light-years', a.clone().multiplyScalar(0.5).add(V(0, 40, 0)), 'LocalGroup', 'craft');
  }
  { // a few hundred faint dwarfs scattered around the two big galaxies
    const arr = [], a = dashes[0];
    for (let i = 0; i < 260; i++) { const c = i % 2 ? a : V(); arr.push(c.x + gauss() * 380, c.y + gauss() * 380, c.z + gauss() * 380); }
    hold.add(pointsOf(arr, 0xcfd8ff, 30, 0.6));
  }
  const mid = dashes[0].clone().multiplyScalar(0.5);
  bodies.LocalGroup = { obj: hold, radius: 2600, view: 4300, selfLit: true, dir: () => { const d = dashes[0].clone().normalize(); return V(0, 1, 0).cross(d).normalize().multiplyScalar(0.8).add(V(0, 0.6, 0)).normalize(); } };
  bodies.LocalGroup.obj = new THREE.Object3D(); bodies.LocalGroup.obj.position.copy(mid); hold.add(bodies.LocalGroup.obj);
  info('LocalGroup', 'The Local Group: our galactic neighbours', 'Our neighbourhood of galaxies', 'about 10 million light-years across',
    'The Milky Way and Andromeda are the two giants of a family of dozens of galaxies, most of them small dwarfs that orbit one or the other. Andromeda is the nearest big spiral, 2.5 million light-years away: the light you see from it tonight left before the first humans walked the Earth.');
}

// =====================================================================
// 2. THE MILKY WAY MEETS ANDROMEDA: one possible future
// =====================================================================
{
  const C = V(16000, 9000, 0), R = 300;
  const hold = new THREE.Group(); hold.position.copy(C); scene.add(hold); scaleHide.push(hold);
  const disk = (seed, tilt, arms) => { const o = new THREE.Group(); const d = new THREE.Group(); d.rotation.set(tilt, 0, tilt * 0.4); o.add(d);
    const p = galaxyPoints({ type: 'spiral', R, n: 40000, arms, pitch: 0.24, bulge: 0.16, seed, bright: 1.3 }); d.add(p);
    o.add(glowSprite(R * 0.7, 'rgba(255,225,180,0.6)', 'rgba(0,0,0,0)', 0.5)); hold.add(o); return { o, d, p }; };
  const MW = disk(201, 0.25, 4), M31 = disk(202, 1.05, 2);
  const ell = new THREE.Group(); ell.add(galaxyPoints({ type: 'elliptical', R: R * 1.5, n: 60000, seed: 203, bright: 1.25 })); ell.add(glowSprite(R * 1.8, 'rgba(255,215,170,0.6)', 'rgba(0,0,0,0)', 0.45)); hold.add(ell);
  const lMW = addLabel(MW.o, 'Milky Way', R * 0.9, 'Collision', 'gal'), lM31 = addLabel(M31.o, 'Andromeda', R * 0.9, 'Collision', 'gal'), lE = addLabel(ell, 'Milkomeda?', R * 1.4, 'Collision', 'gal');
  // the caption under the scene
  const cap = document.createElement('div'); cap.id = 'collCap';
  cap.style.cssText = 'position:fixed;left:50%;bottom:64px;transform:translateX(-50%);background:rgba(10,14,30,.78);border:1px solid rgba(140,160,255,.25);border-radius:12px;padding:10px 16px;text-align:center;z-index:6;display:none;max-width:min(560px,90vw);font-size:13px;line-height:1.45;color:#dfe6ff';
  cap.innerHTML = '<div id="collYr" style="font-size:20px;font-weight:700;color:#ffd27a"></div><div id="collTxt"></div><button id="collReplay" type="button" style="margin-top:6px"></button>';
  document.body.appendChild(cap);
  const STEPS = [ // progress, years from now (billions), English, French
    [0, 0, 'Today: Andromeda is 2.5 million light-years away, closing in at about 110 km/s.', "Aujourd'hui : Andromède est à 2,5 millions d'années-lumière, et se rapproche à environ 110 km/s."],
    [0.3, 4.5, 'First close pass: the two galaxies swing through each other and stars are flung out in long tails.', 'Premier passage : les deux galaxies se traversent et des étoiles sont projetées en longues queues.'],
    [0.45, 5, 'They fly apart, slow down, and fall back together.', "Elles s'éloignent, ralentissent, puis retombent l'une vers l'autre."],
    [0.62, 6, 'Merging: the spiral arms are torn apart.', 'Fusion : les bras spiraux sont déchirés.'],
    [0.8, 7, 'One giant egg-shaped galaxy: "Milkomeda". Stars almost never collide: there is too much space between them.', "Une seule galaxie géante en forme d'œuf : « Lactomède ». Les étoiles ne se percutent presque jamais : il y a trop d'espace entre elles."],
  ];
  const NOTE = ['One possible future: a 2025 study gives about a 50% chance that the two galaxies merge within the next 10 billion years.', "Un futur possible : une étude de 2025 donne environ 50 % de chances que les deux galaxies fusionnent dans les 10 prochains milliards d'années."];
  let T = 0, on = false;
  const sm = x => x * x * (3 - 2 * x), lerp = (a, b, k) => a + (b - a) * k, seg = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
  function rel(T) { // Andromeda's position relative to the Milky Way, along a looping path
    if (T < 0.3) { const k = sm(seg(T, 0, 0.3)); return V(lerp(2600, 220, k), lerp(500, 60, k), lerp(-300, -40, k)); }
    if (T < 0.45) { const k = seg(T, 0.3, 0.45), a = k * Math.PI * 1.1; return V(220 * Math.cos(a) - 380 * k, 60 - 80 * k, -40 + 420 * Math.sin(a) * (1 - k * 0.3)); }
    if (T < 0.62) { const k = sm(seg(T, 0.45, 0.62)), a = Math.PI * 1.1 + k * Math.PI * 1.2; const r = lerp(560, 260, k); return V(r * Math.cos(a), lerp(-20, 10, k), r * Math.sin(a)); }
    const k = sm(seg(T, 0.62, 0.8)), a = Math.PI * 2.3 + k * Math.PI * 1.5; const r = lerp(260, 0, k); return V(r * Math.cos(a), 0, r * Math.sin(a));
  }
  function pose(T) {
    const p = rel(T);
    M31.o.position.copy(p).multiplyScalar(0.55); MW.o.position.copy(p).multiplyScalar(-0.45);
    const tide = Math.max(0, 1 - Math.abs(p.length() - 150) / 650) * (T > 0.25 ? 1 : 0);  // stretched when close
    for (const [G, sgn] of [[MW, 1], [M31, -1]]) { G.p.scale.set(1 + 0.7 * tide, 1 + 0.4 * tide, 1 - 0.35 * tide); G.d.rotation.y = sgn * T * 6 + tide * 0.8; }
    const f = sm(seg(T, 0.72, 0.9));                                          // the two disks melt into one ball of stars
    for (const G of [MW, M31]) { G.o.scale.setScalar(Math.max(0.001, 1 - f)); G.o.visible = f < 0.999; }
    ell.scale.setScalar(Math.max(0.001, f)); ell.visible = f > 0.001;
    lMW.element.style.opacity = lM31.element.style.opacity = String(1 - f); lE.element.style.opacity = String(f);
  }
  pose(0);
  function caption() {
    const fr = SS.lang === 'fr'; let st = STEPS[0]; for (const s of STEPS) if (T >= s[0]) st = s;
    const yrs = T < 0.3 ? lerp(0, 4.5, seg(T, 0, 0.3)) : T < 0.45 ? lerp(4.5, 5, seg(T, 0.3, 0.45)) : T < 0.62 ? lerp(5, 6, seg(T, 0.45, 0.62)) : lerp(6, 7, seg(T, 0.62, 0.8));
    $('collYr').textContent = T < 0.01 ? (fr ? "Aujourd'hui" : 'Today') : (fr ? `Dans ≈ ${yrs.toFixed(1).replace('.', ',')} milliards d'années` : `≈ ${yrs.toFixed(1)} billion years from now`);
    $('collTxt').innerHTML = `${fr ? st[3] : st[2]}<div style="opacity:.6;font-size:11px;margin-top:4px">${NOTE[fr ? 1 : 0]}</div>`;
    $('collReplay').textContent = fr ? '↺ Rejouer' : '↺ Replay';
  }
  $('collReplay').onclick = () => { T = 0; };
  sim.push((dt) => { if (!on) return; T = Math.min(1, T + (SS.frameDt || dt) / 40); pose(T); caption(); });
  bodies.Collision = { obj: hold, radius: 900, view: 2600, selfLit: true, dir: () => V(0.25, 0.75, 0.6).normalize() };
  info('Collision', 'Milky Way meets Andromeda', 'One possible future', 'starting 2.5 million light-years apart',
    'Andromeda is heading our way at about 110 km/s. For years astronomers thought a crash in 4–5 billion years was certain; in 2025 a new study using Hubble and Gaia found it is closer to a coin toss. If it happens, the Sun will most likely survive: stars are so far apart that they almost never hit each other.');
  special.Collision = () => { T = 0; flyTo('Collision'); };
  { const prev = SS.onFocus; SS.onFocus = key => { prev(key); on = key === 'Collision'; cap.style.display = on ? 'block' : 'none'; if (on) caption(); }; }
}

// =====================================================================
// 3. GLOBULAR CLUSTERS: ancient balls of stars around the galaxy
// =====================================================================
function globular({ key, name, ra, dec, ly, R, n, cat, dist, fact }) {
  const h = new THREE.Group(); h.position.copy(place(ra, dec, ly)); scene.add(h);
  h.add(galaxyPoints({ type: 'elliptical', R, n, seed: R * 7 + n, warm: '#ffe6b8', bright: 1.8 }));
  h.add(glowSprite(R * 1.1, 'rgba(255,236,200,0.85)', 'rgba(0,0,0,0)', 0.6));
  deepLabel(h, name, R * 1.1, key, 'neb', 700);
  bodies[key] = { obj: h, radius: R, view: R * 3.2, selfLit: true };
  info(key, name, cat, dist, fact);
}
globular({ key: 'OmegaCen', name: 'Omega Centauri', ra: 201.697, dec: -47.48, ly: 17700, R: 12, n: 9000, cat: 'Globular cluster', dist: 'about 17,700 light-years',
  fact: 'The biggest star cluster of the Milky Way: about 10 million stars in a ball. In 2024, Hubble found fast stars at its heart pointing to a black hole at least 8,200 times heavier than the Sun. It may be the leftover core of a small galaxy our galaxy swallowed.' });
globular({ key: 'M13', name: 'M13 (Hercules Cluster)', ra: 250.423, dec: 36.461, ly: 22200, R: 8, n: 5000, cat: 'Globular cluster', dist: 'about 22,000 light-years',
  fact: 'Several hundred thousand stars. On 16 November 1974, the Arecibo radio telescope beamed a picture message towards it, with our numbers, DNA and a little stick-figure human. It will take about 22,000 years to get there.' });
globular({ key: 'Tuc47', name: '47 Tucanae', ra: 6.024, dec: -72.081, ly: 15000, R: 9, n: 6000, cat: 'Globular cluster', dist: 'about 15,000 light-years',
  fact: 'The second-brightest globular cluster in the sky, visible to the naked eye from the Southern Hemisphere, right next to the Small Magellanic Cloud.' });
globular({ key: 'M4', name: 'M4', ra: 245.897, dec: -26.526, ly: 6000, R: 6, n: 3500, cat: 'Globular cluster', dist: 'about 6,000 light-years',
  fact: 'One of the closest globular clusters. It holds some of the oldest stars known, around 12 to 13 billion years old, and an ancient planet nicknamed "Methuselah" that circles a pair of dead stars.' });

// =====================================================================
// 4. GAIA'S MILKY WAY: star streams left by swallowed galaxies, on the "Where are we?" map
// =====================================================================
{
  const hold = bodies.MilkyWay.obj, R = 1500;
  const extra = new THREE.Group(); extra.visible = false; hold.add(extra);
  // Sagittarius stream: a ribbon looping over the poles of the galaxy
  const arr = [], tilt = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), 1.35);
  for (let i = 0; i < 9000; i++) {
    const a = Math.random() * Math.PI * 4, r = R * (1.15 + 0.3 * Math.sin(a * 0.5) + gauss() * 0.06);
    const p = V(r * Math.cos(a), gauss() * R * 0.05, r * Math.sin(a)).applyQuaternion(tilt); arr.push(p.x, p.y, p.z);
  }
  extra.add(pointsOf(arr, 0xff9ad0, R * 0.03, 0.75));
  // the Sagittarius dwarf galaxy itself, being torn apart below the disk
  const sgrPos = V(R * 1.15, 0, 0).applyQuaternion(tilt).applyAxisAngle(V(0, 1, 0), 0.0);
  const sgr = new THREE.Group(); sgr.position.copy(sgrPos); hold.add(sgr);
  sgr.add(galaxyPoints({ type: 'elliptical', R: R * 0.08, n: 3000, seed: 311, bright: 1.6 })); sgr.scale.set(1, 0.6, 2.2);
  const sgrL = new THREE.Object3D(); sgrL.position.copy(sgrPos).add(V(0, R * 0.16, 0)); hold.add(sgrL); addLabel(sgrL, 'Sagittarius Dwarf', 0, 'SgrDwarf', 'gal');
  const strL = new THREE.Object3D(); strL.position.copy(V(-R * 1.25, 0, 0).applyQuaternion(tilt)); extra.add(strL); addLabel(strL, 'Sagittarius stream', 0, 'GaiaMap', 'craft');
  // Gaia–Enceladus: the scattered stars of a galaxy that crashed into ours long ago
  const halo = [];
  for (let i = 0; i < 7000; i++) { const r = R * (0.15 + Math.pow(Math.random(), 0.7) * 0.85), th = Math.random() * 6.28, ph = Math.acos(2 * Math.random() - 1); halo.push(r * Math.sin(ph) * Math.cos(th) * 1.3, r * Math.cos(ph) * 0.7, r * Math.sin(ph) * Math.sin(th) * 0.8); }
  extra.add(pointsOf(halo, 0xffb070, R * 0.022, 0.45));
  const geL = new THREE.Object3D(); geL.position.set(R * 0.2, R * 0.62, -R * 0.4); extra.add(geL); addLabel(geL, 'Gaia–Enceladus debris', 0, 'GaiaMap', 'craft');
  bodies.GaiaMap = { obj: hold, radius: R, view: R * 3.3, selfLit: true, dir: () => V(0.85, 0.32, 0.42).normalize() };
  bodies.SgrDwarf = { obj: sgr, radius: R * 0.2, view: R * 1.4, selfLit: true, dir: () => V(0.5, 0.3, 0.8).normalize() };
  info('GaiaMap', "Gaia's Milky Way", 'Our galaxy, as mapped by Gaia', 'nearly 2 billion stars measured',
    'From 2013 to 2025, ESA\'s Gaia telescope measured the positions and motions of nearly 2 billion stars from L2. It revealed the galaxy\'s history: in pink, the stream of stars ripped from the Sagittarius dwarf galaxy; in orange, the remains of Gaia–Enceladus, a galaxy that crashed into ours about 10 billion years ago. Gaia was switched off on 27 March 2025, and its data is still being released.');
  info('SgrDwarf', 'Sagittarius Dwarf Galaxy', 'Dwarf galaxy · being swallowed', 'about 70,000 light-years away, on the far side of the galaxy\'s centre',
    'A small galaxy that is being pulled apart by the Milky Way. Its stars are strung out in a stream that wraps all the way around our galaxy, and its passes through our disk may have helped ripple the Milky Way\'s spiral arms.');
  { const prev = SS.onFocus; SS.onFocus = key => { prev(key); extra.visible = key === 'GaiaMap' || key === 'SgrDwarf'; }; }
}

// ---------- menu ----------
{
  const og = document.createElement('optgroup'); og.label = '🌌 Our galactic neighbourhood';
  const after = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Galaxies');
  after ? after.before(og) : focusSel.appendChild(og);
  for (const [k, t] of [['LocalGroup', 'The Local Group (our neighbours)'], ['Collision', '💥 Milky Way meets Andromeda'], ['GaiaMap', "✨ Gaia's map of the Milky Way"], ['SgrDwarf', 'Sagittarius Dwarf (being swallowed)'],
    ['OmegaCen', 'Omega Centauri'], ['M13', 'M13 (Hercules Cluster)'], ['Tuc47', '47 Tucanae'], ['M4', 'M4']]) {
    const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o);
  }
}

// ---------- One Fact cards ----------
{
  const F = SS.more.FACTS, FR = SS.more.FACTS_FR;
  const add = (en, fr) => { F.push(en); if (FR) FR[F.length - 1] = fr; };
  add(['Collision', 'Our galaxy might crash into Andromeda', 'A 2025 study found about a 50% chance that the Milky Way and Andromeda merge within the next 10 billion years.'],
    ['Notre galaxie pourrait percuter Andromède', "Une étude de 2025 donne environ 50 % de chances que la Voie lactée et Andromède fusionnent dans les 10 prochains milliards d'années."]);
  add(['M13', 'We sent a message to the stars in 1974', 'The Arecibo message was beamed at the star cluster M13. It will take about 22,000 years to get there.'],
    ['Nous avons envoyé un message aux étoiles en 1974', "Le message d'Arecibo a été envoyé vers l'amas d'étoiles M13. Il mettra environ 22 000 ans à y arriver."]);
  add(['OmegaCen', 'A ball of 10 million stars', 'Omega Centauri packs about 10 million stars together, with a hidden black hole at its heart.'],
    ['Une boule de 10 millions d\'étoiles', "Omega Centauri rassemble environ 10 millions d'étoiles, avec un trou noir caché en son cœur."]);
  add(['GaiaMap', 'Our galaxy is a cannibal', 'Gaia showed that the Milky Way grew by swallowing smaller galaxies, and their stars still drift through ours in long streams.'],
    ['Notre galaxie est cannibale', "Gaia a montré que la Voie lactée a grandi en avalant des galaxies plus petites, dont les étoiles dérivent encore dans la nôtre en longs courants."]);
}

// ---------- French ----------
const _U = { '🌌 Our galactic neighbourhood': '🌌 Notre voisinage galactique', 'The Local Group (our neighbours)': 'Le Groupe local (nos voisines)', '💥 Milky Way meets Andromeda': '💥 La Voie lactée rencontre Andromède',
    "✨ Gaia's map of the Milky Way": '✨ La Voie lactée vue par Gaia', 'Sagittarius Dwarf (being swallowed)': 'Naine du Sagittaire (en train d\'être avalée)',
    '☀ The Milky Way (you are here)': '☀ La Voie lactée (vous êtes ici)', '2.5 million light-years': "2,5 millions d'années-lumière", 'Milky Way': 'Voie lactée', 'Milkomeda?': 'Lactomède ?',
    'Sagittarius stream': 'Courant du Sagittaire', 'Gaia–Enceladus debris': 'Débris de Gaia–Encelade', 'Sagittarius Dwarf': 'Naine du Sagittaire' };
SS.i18nAdd?.({ ui: _U, name: _U });
SS.i18nAdd?.({
  name: { 'The Local Group: our galactic neighbours': 'Le Groupe local : nos galaxies voisines', 'Milky Way meets Andromeda': 'La Voie lactée rencontre Andromède', "Gaia's Milky Way": 'La Voie lactée de Gaia',
    'Sagittarius Dwarf Galaxy': 'Galaxie naine du Sagittaire', 'M13 (Hercules Cluster)': 'M13 (amas d\'Hercule)', 'Large Magellanic Cloud': 'Grand Nuage de Magellan', 'Small Magellanic Cloud': 'Petit Nuage de Magellan',
    Andromeda: 'Andromède', Triangulum: 'Triangle', "Barnard's Galaxy": 'Galaxie de Barnard', 'Omega Centauri': 'Omega Centauri', '47 Tucanae': '47 Tucanae' },
  cat: { 'Our neighbourhood of galaxies': 'Notre voisinage de galaxies', 'One possible future': 'Un futur possible', 'Globular cluster': 'Amas globulaire',
    'Our galaxy, as mapped by Gaia': 'Notre galaxie, cartographiée par Gaia', 'Dwarf galaxy · being swallowed': 'Galaxie naine · en train d\'être avalée' },
  dist: { 'about 10 million light-years across': "environ 10 millions d'années-lumière de diamètre", 'starting 2.5 million light-years apart': "au départ à 2,5 millions d'années-lumière l'une de l'autre",
    'about 17,700 light-years': 'environ 17 700 années-lumière', 'about 22,000 light-years': 'environ 22 000 années-lumière', 'about 15,000 light-years': 'environ 15 000 années-lumière', 'about 6,000 light-years': 'environ 6 000 années-lumière',
    'nearly 2 billion stars measured': 'près de 2 milliards d\'étoiles mesurées', "about 70,000 light-years away, on the far side of the galaxy's centre": "à environ 70 000 années-lumière, de l'autre côté du centre de la galaxie" },
  fact: {
    LocalGroup: "La Voie lactée et Andromède sont les deux géantes d'une famille de plusieurs dizaines de galaxies, surtout de petites naines qui tournent autour de l'une ou de l'autre. Andromède est la grande spirale la plus proche, à 2,5 millions d'années-lumière : la lumière que vous voyez d'elle ce soir est partie avant que les premiers humains ne marchent sur Terre.",
    Collision: "Andromède fonce vers nous à environ 110 km/s. Pendant des années, les astronomes ont cru une collision certaine dans 4 à 5 milliards d'années ; en 2025, une nouvelle étude utilisant Hubble et Gaia a montré que c'est plutôt pile ou face. Si cela arrive, le Soleil survivra très probablement : les étoiles sont si éloignées qu'elles ne se percutent presque jamais.",
    OmegaCen: "Le plus grand amas d'étoiles de la Voie lactée : environ 10 millions d'étoiles en boule. En 2024, Hubble y a trouvé des étoiles rapides trahissant un trou noir au moins 8 200 fois plus lourd que le Soleil. Ce pourrait être le cœur d'une petite galaxie avalée par la nôtre.",
    M13: "Plusieurs centaines de milliers d'étoiles. Le 16 novembre 1974, le radiotélescope d'Arecibo a envoyé vers lui un message en image, avec nos nombres, l'ADN et un petit bonhomme. Il mettra environ 22 000 ans à y arriver.",
    Tuc47: "Le deuxième amas globulaire le plus brillant du ciel, visible à l'œil nu depuis l'hémisphère Sud, juste à côté du Petit Nuage de Magellan.",
    M4: "L'un des amas globulaires les plus proches. Il abrite certaines des plus vieilles étoiles connues, âgées de 12 à 13 milliards d'années, et une planète très ancienne surnommée « Mathusalem », qui tourne autour d'un couple d'étoiles mortes.",
    GaiaMap: "De 2013 à 2025, le télescope Gaia de l'ESA a mesuré la position et le mouvement de près de 2 milliards d'étoiles depuis le point L2. Il a révélé l'histoire de la galaxie : en rose, le courant d'étoiles arrachées à la galaxie naine du Sagittaire ; en orange, les restes de Gaia–Encelade, une galaxie qui a percuté la nôtre il y a environ 10 milliards d'années. Gaia a été éteint le 27 mars 2025, et ses données continuent d'être publiées.",
    SgrDwarf: "Une petite galaxie en train d'être déchirée par la Voie lactée. Ses étoiles s'étirent en un courant qui fait tout le tour de notre galaxie, et ses passages à travers notre disque ont peut-être contribué à onduler les bras spiraux de la Voie lactée.",
  },
});
await import('./voyager.js' + new URL(import.meta.url).search);
