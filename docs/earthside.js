// =====================================================================
// Around Earth: launch sites & NASA centres · the ISS live · satellite swarms · Lagrange points
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { scene, camera, bodies, sim, flyTo, focusSel, glowSprite } = SS;
const { info, skyDir, softDot } = SS.cosmos;
const { nearLabel, PL, J2000, scaleHide } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const $ = id => document.getElementById(id);
const special = SS.more.special;
const tr = t => (SS.tr ? SS.tr(t) : t);
const earthP = PL.Earth, tilted = earthP.tilted, earthMesh = tilted.children[0];
const dps = () => parseFloat($('speed').value);
const days = () => (SS.getDate() - J2000) / 864e5;
const realTime = () => { $('speed').value = '0.0000115741'; const au = $('auto'); if (au.checked) { au.checked = false; au.dispatchEvent(new Event('change')); } SS.controls.autoRotate = false; };
const newGroup = (label, before) => { const og = document.createElement('optgroup'); og.label = label; const b = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === before); b ? b.before(og) : focusSel.appendChild(og); return og; };
const addOpts = (og, items) => { for (const [k, t] of items) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); } };

// a point on (or above) Earth, in the spinning globe's own frame (matches the map painted on it)
function earthLocal(lat, lon, r = 1) {
  const la = lat * D2R, lo = lon * D2R;
  return V(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)).multiplyScalar(r);
}
// hide labels on the far side of the globe
const onEarth = [];
{ const ew = V(), pw = V(), cw = V();
  sim.push(() => { earthMesh.getWorldPosition(ew); camera.getWorldPosition(cw);
    for (const pin of onEarth) { pin.getWorldPosition(pw); const facing = pw.clone().sub(ew).normalize().dot(cw.clone().sub(pw).normalize()) > 0.05;
      if (!facing) for (const c of pin.children) if (c.isCSS2DObject) c.visible = false; } }); }

// =====================================================================
// 1. LAUNCH SITES & NASA CENTRES
// =====================================================================
const SITES = [ // key, name, lat, lon, kind, category, where, fact
  ['KSC', 'Kennedy Space Center', 28.608, -80.604, 'nasa', 'NASA launch site', 'Florida, USA',
    'Apollo 11 left for the Moon from pad 39A in 1969. The Space Shuttle flew from here, and so did Artemis II in April 2026, from pad 39B.'],
  ['JSC', 'Johnson Space Center', 29.559, -95.090, 'nasa', 'NASA centre · Mission Control', 'Houston, Texas, USA',
    'Home of Mission Control and of NASA\'s astronauts, who train here. "Houston, Tranquility Base here. The Eagle has landed," radioed Neil Armstrong in 1969.'],
  ['JPL', 'Jet Propulsion Laboratory', 34.201, -118.171, 'nasa', 'NASA centre · robot explorers', 'Pasadena, California, USA',
    'Builds and drives NASA\'s robot explorers: the Mars rovers, the Voyagers and Juno. When a rover lands on Mars, this is the room that cheers.'],
  ['GSFC', 'Goddard Space Flight Center', 38.996, -76.852, 'nasa', 'NASA centre · space telescopes', 'Maryland, USA',
    'Runs Hubble and helped build the James Webb Space Telescope, and studies Earth\'s climate from orbit.'],
  ['Kourou', 'Guiana Space Centre', 5.236, -52.769, 'esa', "Europe's spaceport", 'Kourou, French Guiana',
    'Ariane rockets launch from here, close to the equator, where Earth\'s spin gives rockets a free push. James Webb took off from Kourou on Christmas Day 2021.'],
  ['Baikonur', 'Baikonur Cosmodrome', 45.92, 63.34, 'ru', 'Launch site', 'Kazakhstan',
    'The world\'s first spaceport. Sputnik 1 (1957) and Yuri Gagarin, the first human in space (1961), both launched from here.'],
  ['Jiuquan', 'Jiuquan Launch Centre', 40.96, 100.29, 'cn', 'Launch site', 'Gobi Desert, China',
    'China\'s astronauts launch from here on Shenzhou spacecraft to the Tiangong space station.'],
  ['Wenchang', 'Wenchang Launch Site', 19.61, 110.95, 'cn', 'Launch site', 'Hainan island, China',
    'China\'s seaside spaceport for heavy rockets: Chang\'e 5 and 6 left for the Moon from here, and Tianwen-1 for Mars.'],
  ['Sriharikota', 'Satish Dhawan Space Centre', 13.72, 80.23, 'in', 'Launch site', 'Sriharikota, India',
    'India\'s spaceport, on an island in the Bay of Bengal. Chandrayaan-3 launched from here in 2023 on its way to the Moon\'s south pole.'],
  ['Tanegashima', 'Tanegashima Space Center', 30.40, 130.97, 'jp', 'Launch site', 'Tanegashima island, Japan',
    'Often called the most beautiful launch site in the world, on a green island by the sea. Japan\'s SLIM "Moon sniper" launched from here.'],
  ['Starbase', 'Starbase', 25.997, -97.157, 'priv', 'Launch site', 'Texas, USA',
    'Where SpaceX builds and launches Starship, the largest rocket ever flown. Its giant booster is caught back on the tower by two metal arms.'],
];
const COL = { nasa: 0x5aa8ff, esa: 0xffd27a, ru: 0xff6a5a, cn: 0xff4040, in: 0xffa040, jp: 0xffffff, priv: 0x7ad8ff };
{
  const grp = new THREE.Group(); earthMesh.add(grp);
  for (const [k, name, lat, lon, kind, cat, where, fact] of SITES) {
    const n = earthLocal(lat, lon, 1).normalize();
    const pin = new THREE.Group(); pin.position.copy(n).multiplyScalar(1.002); pin.quaternion.setFromUnitVectors(V(0, 1, 0), n); grp.add(pin);
    const col = '#' + new THREE.Color(COL[kind]).getHexString();
    pin.add(glowSprite(0.022, col, 'rgba(0,0,0,0)', 0.95));
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.03, 6), new THREE.MeshBasicMaterial({ color: COL[kind] })); stick.position.y = 0.015; pin.add(stick);
    nearLabel(pin, (kind === 'nasa' && k !== 'KSC' ? '🔵 ' : '🚀 ') + name, 0.05, 'LS_' + k, 'craft', 5);
    onEarth.push(pin);
    const wp = V(), ep = V();
    bodies['LS_' + k] = { obj: pin, radius: 0.05, view: 1.5, dir: () => { pin.getWorldPosition(wp); earthMesh.getWorldPosition(ep); return wp.sub(ep).normalize().add(V(0, 0.25, 0)).normalize(); } };
    info('LS_' + k, name, cat, where, fact);
  }
  const og = newGroup('🚀 Launch sites & NASA', 'Moon landing sites');
  addOpts(og, SITES.map(s => ['LS_' + s[0], s[1]]));
  for (const s of SITES) special['LS_' + s[0]] = () => { realTime(); flyTo('LS_' + s[0]); };
}

// =====================================================================
// 2. THE ISS, LIVE (where it really is right now)
// =====================================================================
{
  const live = new THREE.Group(); earthMesh.add(live); live.visible = false;
  const dot = glowSprite(0.05, '#ff5a5a', 'rgba(0,0,0,0)', 1); live.add(dot);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.036, 32), new THREE.MeshBasicMaterial({ color: 0xff7a7a, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })); live.add(ring);
  const lbl = nearLabel(live, 'ISS · live', 0.07, 'ISSlive', 'craft', 8);
  // a line straight down to the spot on Earth it is flying over
  const dropG = new THREE.BufferGeometry().setFromPoints([V(), V()]);
  const drop = new THREE.Line(dropG, new THREE.LineDashedMaterial({ color: 0xff8a8a, dashSize: 0.01, gapSize: 0.008, transparent: true, opacity: 0.8 })); earthMesh.add(drop); drop.visible = false;
  const from = V(), to = V(); let t0 = 0, last = null, timer = null, failed = false;
  const LONDON = [51.5074, -0.1278];
  const km = (a1, o1, a2, o2) => { const p = D2R; const h = Math.sin((a2 - a1) * p / 2) ** 2 + Math.cos(a1 * p) * Math.cos(a2 * p) * Math.sin((o2 - o1) * p / 2) ** 2; return 2 * 6371 * Math.asin(Math.sqrt(h)); };
  const fmt = n => Math.round(n).toLocaleString(SS.lang === 'fr' ? 'fr-FR' : 'en-GB');
  function card() {
    const fr = SS.lang === 'fr';
    let body;
    if (last) {
      const lat = last.latitude, lon = last.longitude, d = km(LONDON[0], LONDON[1], lat, lon);
      const ns = fr ? (lat >= 0 ? 'N' : 'S') : (lat >= 0 ? 'N' : 'S'), ew = fr ? (lon >= 0 ? 'E' : 'O') : (lon >= 0 ? 'E' : 'W');
      const sun = last.visibility === 'daylight' ? (fr ? 'en plein soleil' : 'in sunlight') : (fr ? "dans l'ombre de la Terre" : "in Earth's shadow");
      body = fr
        ? `En ce moment, l'ISS survole <b style="display:inline;font-size:13px">${Math.abs(lat).toFixed(1)}° ${ns}, ${Math.abs(lon).toFixed(1)}° ${ew}</b>, à ${fmt(last.altitude)} km d'altitude et ${fmt(last.velocity)} km/h, ${sun}. Elle est à ${fmt(d)} km de Londres.${d < 2000 ? ' Elle passe tout près : levez les yeux !' : ''} Position mise à jour toutes les 5 secondes.`
        : `Right now the ISS is above <b style="display:inline;font-size:13px">${Math.abs(lat).toFixed(1)}° ${ns}, ${Math.abs(lon).toFixed(1)}° ${ew}</b>, ${fmt(last.altitude)} km up, flying at ${fmt(last.velocity)} km/h, ${sun}. It is ${fmt(d)} km from London.${d < 2000 ? ' It is passing close by: look up!' : ''} Position updated every 5 seconds.`;
    } else body = failed ? (fr ? "Impossible de joindre le service de suivi de l'ISS pour le moment. Réessayez dans un instant." : 'The ISS tracking service cannot be reached right now. Try again in a moment.')
      : (fr ? "Recherche de l'ISS…" : 'Finding the ISS…');
    if (SS.getFocus && SS.getFocus() === 'ISSlive') $('info').innerHTML = `<div class="cat">${fr ? 'Station spatiale · en direct' : 'Space station · live'}</div><b>${fr ? "L'ISS en direct" : 'The ISS, live'}</b><div class="dist">${fr ? 'où elle est vraiment, maintenant' : 'where it really is, right now'}</div>${body}`;
  }
  async function poll() {
    try {
      const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544', { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json(); last = j; failed = false;
      from.copy(live.visible ? live.position : earthLocal(j.latitude, j.longitude, 1.12));
      to.copy(earthLocal(j.latitude, j.longitude, 1.12)); t0 = performance.now();
      if (!live.visible) { live.position.copy(to); from.copy(to); live.visible = true; drop.visible = true; if (SS.getFocus() === 'ISSlive') flyTo('ISSlive'); }
    } catch (e) { failed = true; }
    card();
  }
  sim.push((dt, t) => {
    if (!live.visible) return;
    const k = Math.min(1, (performance.now() - t0) / 5000);
    live.position.lerpVectors(from, to, k).setLength(1.12);
    ring.lookAt(camera.position); ring.scale.setScalar(1 + 0.3 * Math.sin(t * 4));
    const p = dropG.attributes.position; p.setXYZ(0, live.position.x, live.position.y, live.position.z);
    const g = live.position.clone().setLength(1.003); p.setXYZ(1, g.x, g.y, g.z); p.needsUpdate = true; drop.computeLineDistances();
  });
  const wp = V(), ep = V();
  bodies.ISSlive = { obj: live, radius: 0.05, view: 2.2, dir: () => { live.getWorldPosition(wp); earthMesh.getWorldPosition(ep); return wp.sub(ep).normalize().add(V(0, 0.3, 0)).normalize(); } };
  info('ISSlive', 'The ISS, live', 'Space station · live', 'where it really is, right now', 'Finding the ISS…');
  const stop = () => { clearInterval(timer); timer = null; };
  special.ISSlive = () => {
    SS.setDate(Date.now()); realTime(); stop(); timer = setInterval(poll, 5000);
    flyTo('ISSlive'); poll();
  };
  { const prev = SS.onFocus; SS.onFocus = key => { prev(key); if (key === 'ISSlive') card(); else if (timer) { stop(); live.visible = false; drop.visible = false; } }; }
  SS.more.issLive = { poll, card };
}

// =====================================================================
// 3. SATELLITE SWARMS: Starlink, GPS, the geostationary ring, space junk
// =====================================================================
const alt = km => 1 + 0.115 * Math.log(1 + km / 180);         // squeezed heights, so everything fits inside the Moon's orbit
const swarm = new THREE.Group(); swarm.visible = false; tilted.add(swarm);
const dotMat = (color, size, opacity = 1) => new THREE.PointsMaterial({ color, size, map: softDot, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
const spinners = [];
function shell({ planes, per, incl, km, color, size, periodMin, seed = 1 }) {
  const r = alt(km), mat = dotMat(color, size);
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let p = 0; p < planes; p++) {
    const node = new THREE.Group(); node.rotation.y = p / planes * Math.PI * 2; swarm.add(node);
    const plane = new THREE.Group(); plane.rotation.x = incl * D2R; node.add(plane);
    const spin = new THREE.Group(); spin.rotation.y = rnd() * 6.28; plane.add(spin);
    const pos = new Float32Array(per * 3);
    for (let i = 0; i < per; i++) { const a = i / per * Math.PI * 2; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 2] = Math.sin(a) * r; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    spin.add(new THREE.Points(g, mat));
    spinners.push([spin, periodMin]);
  }
}
shell({ planes: 72, per: 22, incl: 53, km: 550, color: 0xbfe0ff, size: 0.028, periodMin: 95, seed: 3 });
shell({ planes: 36, per: 20, incl: 43, km: 540, color: 0xbfe0ff, size: 0.028, periodMin: 95, seed: 4 });
shell({ planes: 24, per: 18, incl: 70, km: 570, color: 0xbfe0ff, size: 0.028, periodMin: 96, seed: 5 });
shell({ planes: 12, per: 20, incl: 97.6, km: 560, color: 0xbfe0ff, size: 0.028, periodMin: 95, seed: 6 });
shell({ planes: 6, per: 5, incl: 55, km: 20200, color: 0x8affa0, size: 0.1, periodMin: 718, seed: 7 });
{ // geostationary ring: it turns with Earth, so each satellite stays above the same spot
  const n = 560, r = alt(35786), pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 0.004; pos[i * 3 + 2] = Math.sin(a) * r; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const geo = new THREE.Points(g, dotMat(0xffd27a, 0.07)); earthMesh.add(geo); swarm.userData.geo = geo; geo.visible = false;
}
{ // space junk: a haze of old rocket stages, dead satellites and fragments
  for (let k = 0; k < 6; k++) {
    const n = 1400, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = alt(300 + Math.pow(Math.random(), 1.6) * 1700), z = (Math.random() - 0.5) * 0.02;
      pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = z; pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const node = new THREE.Group(); node.rotation.y = Math.random() * 6.28; swarm.add(node);
    const plane = new THREE.Group(); plane.rotation.x = (20 + Math.random() * 80) * D2R; node.add(plane);
    const spin = new THREE.Group(); plane.add(spin); spin.add(new THREE.Points(g, dotMat(0xb0a49a, 0.016, 0.8)));
    spinners.push([spin, 100]);
  }
}
sim.push(() => {
  if (!swarm.visible) return;
  for (const [s, pm] of spinners) s.rotation.y -= Math.min(1.2, (2 * Math.PI) / (pm / 1440) * dps()) * SS.frameDt;
});
{ // a few labels, and the info card
  const lab = (text, p) => { const o = new THREE.Object3D(); o.position.copy(p); swarm.add(o); nearLabel(o, text, 0, 'Swarms', 'craft', 9); return o; };
  lab('Starlink', V(alt(550) * 0.72, alt(550) * 0.72, 0)); lab('GPS', V(-alt(20200) * 0.7, alt(20200) * 0.7, 0));
  lab('Geostationary ring', V(0, 0.03, alt(35786))); lab('Space junk', V(alt(1200) * 0.5, -alt(1200) * 0.86, 0));
  bodies.Swarms = { obj: bodies.Earth.obj, radius: 1.7, view: 6, dir: t => t.clone().negate().normalize().add(V(0.5, 0.55, 0)).normalize() };
  info('Swarms', 'Satellites around Earth', 'Satellite swarms', 'from 400 km up to 36,000 km',
    'Blue: Starlink, about 10,000 working internet satellites, the biggest fleet ever. Green: the GPS satellites that tell your phone where it is. Gold: the geostationary ring, 36,000 km up, where satellites go round once a day and seem to hang still over one spot, for TV and weather. Grey: space junk. About 40,000 objects are tracked, and there are over a million fragments bigger than 1 cm.');
  const autoRow = $('labels').parentElement;
  const row = document.createElement('label'); row.innerHTML = '<span>Satellite swarms</span> <input id="swarmsOn" type="checkbox">';
  ($('allNames') ? $('allNames').parentElement : autoRow).after(row);
  const box = $('swarmsOn');
  box.onchange = () => { swarm.visible = box.checked; swarm.userData.geo.visible = box.checked; };
  special.Swarms = () => { box.checked = true; box.onchange(); $('speed').value = '0.000694'; flyTo('Swarms'); };
}

// =====================================================================
// 4. LAGRANGE POINTS: five "parking spots" where the Sun's and Earth's pulls balance
// =====================================================================
{
  const earthHolder = bodies.Earth.obj;
  const LP = [['L1', 'L1', 'Sun–Earth L1', 'about 1.5 million km towards the Sun',
      'A spot between the Sun and Earth where a spacecraft can hover and watch the Sun non-stop. SOHO has been there since 1996, warning us of solar storms.'],
    ['L2', 'L2', 'Sun–Earth L2', 'about 1.5 million km beyond Earth',
      'On the night side of Earth, with the Sun, Earth and Moon all behind you: the perfect cold, dark spot for telescopes. James Webb works here, Gaia mapped the galaxy from here, and Roman is heading here.'],
    ['L3', 'L3', 'Sun–Earth L3', 'on the far side of the Sun',
      'Hidden behind the Sun, always out of sight from Earth. Science fiction once put a secret "Counter-Earth" here, but nothing is there.'],
    ['L4', 'L4', 'Sun–Earth L4', '60° ahead of Earth on its orbit',
      'One of two truly stable points: things placed here stay put. A small asteroid, 2010 TK7, was found loitering around it in 2010.'],
    ['L5', 'L5', 'Sun–Earth L5', '60° behind Earth on its orbit',
      'The other stable point. ESA\'s Vigil mission plans to go here to watch solar storms side-on before they turn towards Earth.']];
  const marks = {};
  for (const [k, short, name, dist, fact] of LP) {
    const o = new THREE.Group(); scene.add(o); scaleHide.push(o);
    const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: 0xb48cff, wireframe: true, transparent: true, opacity: 0.85 })); o.add(d);
    o.add(glowSprite(0.7, 'rgba(190,150,255,0.9)', 'rgba(0,0,0,0)', 0.7));
    nearLabel(o, '◆ ' + short, 0.6, 'LP_' + k, 'craft', k === 'L3' ? 90 : 40);
    marks[k] = { o, d };
    bodies['LP_' + k] = { obj: o, radius: 0.4, view: k === 'L1' || k === 'L2' ? 12 : 45, dir: t => (k === 'L1' || k === 'L2' ? t.clone().normalize().add(V(0, 0.8, 0)) : t.clone().normalize().multiplyScalar(0.35).add(V(0, 1, 0))).normalize() };
    info('LP_' + k, name, 'Lagrange point', dist, fact);
  }
  const e = V();
  sim.push((dt, t) => {
    earthHolder.getWorldPosition(e); const R = e.length(), lam = Math.atan2(-e.z, e.x), away = e.clone().normalize();
    const at = l => V(Math.cos(l) * R, 0, -Math.sin(l) * R);
    marks.L1.o.position.copy(e).addScaledVector(away, -4.2); marks.L2.o.position.copy(e).addScaledVector(away, 4.2);
    marks.L3.o.position.copy(at(lam + Math.PI)); marks.L4.o.position.copy(at(lam + Math.PI / 3)); marks.L5.o.position.copy(at(lam - Math.PI / 3));
    for (const k in marks) marks[k].d.rotation.y = t * 0.8;
  });
  const og = newGroup('🌍 Around Earth', 'Moon landing sites');
  addOpts(og, [['ISSlive', '🔴 The ISS, live right now'], ['Swarms', '🛰️ Satellite swarms (Starlink, GPS…)'], ...LP.map(l => ['LP_' + l[0], '◆ Lagrange point ' + l[0]])]);
  // keep the Astronauts group next to the Earth groups
  const astro = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === '🧑‍🚀 Astronauts'); if (astro) og.after(astro);
}

// ---------- One Fact cards ----------
{
  const F = SS.more.FACTS, FR = SS.more.FACTS_FR;
  const add = (en, fr) => { F.push(en); if (FR) FR[F.length - 1] = fr; };
  add(['Swarms', 'One company flies most of the satellites in the sky', 'SpaceX now has about 10,000 working Starlink satellites: more than all other satellites put together.'],
    ['Une seule entreprise possède la plupart des satellites', "SpaceX a maintenant environ 10 000 satellites Starlink en service : plus que tous les autres satellites réunis."]);
  add(['Swarms', 'Over a million bits of junk circle Earth', 'More than 1.2 million fragments bigger than 1 cm whizz around Earth, each fast enough to wreck a satellite.'],
    ['Plus d\'un million de débris tournent autour de la Terre', "Plus de 1,2 million de fragments de plus d'un centimètre filent autour de la Terre, assez vite pour détruire un satellite."]);
  add(['LS_Kourou', 'Rockets love the equator', 'Earth spins fastest at the equator, about 1,670 km/h, so rockets launched from Kourou in French Guiana get a free push.'],
    ["Les fusées adorent l'équateur", "La Terre tourne le plus vite à l'équateur, à environ 1 670 km/h : les fusées lancées depuis Kourou, en Guyane, profitent d'un élan gratuit."]);
  add(['LP_L2', 'Webb is parked at a balancing point', 'At L2, 1.5 million km away, the pulls of the Sun and Earth balance so a spacecraft can circle along with Earth.'],
    ["Webb est garé sur un point d'équilibre", "Au point L2, à 1,5 million de km, les attractions du Soleil et de la Terre s'équilibrent : un vaisseau peut y tourner au même rythme que la Terre."]);
}

// ---------- French ----------
const _U = { '🚀 Launch sites & NASA': '🚀 Bases de lancement et NASA', '🌍 Around Earth': '🌍 Autour de la Terre', '🔴 The ISS, live right now': "🔴 L'ISS en direct",
    '🛰️ Satellite swarms (Starlink, GPS…)': '🛰️ Essaims de satellites (Starlink, GPS…)', 'Satellite swarms': 'Essaims de satellites',
    '◆ Lagrange point L1': '◆ Point de Lagrange L1', '◆ Lagrange point L2': '◆ Point de Lagrange L2', '◆ Lagrange point L3': '◆ Point de Lagrange L3', '◆ Lagrange point L4': '◆ Point de Lagrange L4', '◆ Lagrange point L5': '◆ Point de Lagrange L5',
    'Starlink': 'Starlink', 'GPS': 'GPS', 'Geostationary ring': 'Anneau géostationnaire', 'Space junk': 'Débris spatiaux', 'ISS · live': 'ISS · en direct' };
SS.i18nAdd?.({ ui: _U, name: _U });
SS.i18nAdd?.({
  name: { 'Kennedy Space Center': 'Centre spatial Kennedy', 'Johnson Space Center': 'Centre spatial Johnson', 'Jet Propulsion Laboratory': 'Jet Propulsion Laboratory (JPL)', 'Goddard Space Flight Center': 'Centre Goddard',
    'Guiana Space Centre': 'Centre spatial guyanais', 'Baikonur Cosmodrome': 'Cosmodrome de Baïkonour', 'Jiuquan Launch Centre': 'Base de lancement de Jiuquan', 'Wenchang Launch Site': 'Base de lancement de Wenchang',
    'Satish Dhawan Space Centre': 'Centre spatial Satish Dhawan', 'Tanegashima Space Center': 'Centre spatial de Tanegashima', 'Starbase': 'Starbase',
    'The ISS, live': "L'ISS en direct", 'Satellites around Earth': 'Les satellites autour de la Terre',
    'Sun–Earth L1': 'Point L1 Soleil–Terre', 'Sun–Earth L2': 'Point L2 Soleil–Terre', 'Sun–Earth L3': 'Point L3 Soleil–Terre', 'Sun–Earth L4': 'Point L4 Soleil–Terre', 'Sun–Earth L5': 'Point L5 Soleil–Terre',
    '🚀 Kennedy Space Center': '🚀 Centre spatial Kennedy', '🔵 Johnson Space Center': '🔵 Centre spatial Johnson', '🔵 Jet Propulsion Laboratory': '🔵 JPL', '🔵 Goddard Space Flight Center': '🔵 Centre Goddard',
    '🚀 Guiana Space Centre': '🚀 Centre spatial guyanais', '🚀 Baikonur Cosmodrome': '🚀 Baïkonour', '🚀 Jiuquan Launch Centre': '🚀 Jiuquan', '🚀 Wenchang Launch Site': '🚀 Wenchang',
    '🚀 Satish Dhawan Space Centre': '🚀 Sriharikota', '🚀 Tanegashima Space Center': '🚀 Tanegashima', '🚀 Starbase': '🚀 Starbase' },
  cat: { 'NASA launch site': 'Base de lancement de la NASA', 'NASA centre · Mission Control': 'Centre de la NASA · contrôle de mission', 'NASA centre · robot explorers': 'Centre de la NASA · explorateurs robotisés',
    'NASA centre · space telescopes': 'Centre de la NASA · télescopes spatiaux', "Europe's spaceport": "Le port spatial de l'Europe", 'Launch site': 'Base de lancement',
    'Space station · live': 'Station spatiale · en direct', 'Satellite swarms': 'Essaims de satellites', 'Lagrange point': 'Point de Lagrange' },
  dist: { 'Florida, USA': 'Floride, États-Unis', 'Houston, Texas, USA': 'Houston, Texas, États-Unis', 'Pasadena, California, USA': 'Pasadena, Californie, États-Unis', 'Maryland, USA': 'Maryland, États-Unis',
    'Kourou, French Guiana': 'Kourou, Guyane', 'Kazakhstan': 'Kazakhstan', 'Gobi Desert, China': 'Désert de Gobi, Chine', 'Hainan island, China': 'Île de Hainan, Chine', 'Sriharikota, India': 'Sriharikota, Inde',
    'Tanegashima island, Japan': 'Île de Tanegashima, Japon', 'Texas, USA': 'Texas, États-Unis', 'where it really is, right now': 'où elle est vraiment, maintenant',
    'from 400 km up to 36,000 km': 'de 400 km à 36 000 km d\'altitude', 'about 1.5 million km towards the Sun': 'à environ 1,5 million de km, vers le Soleil', 'about 1.5 million km beyond Earth': 'à environ 1,5 million de km derrière la Terre',
    'on the far side of the Sun': 'de l\'autre côté du Soleil', '60° ahead of Earth on its orbit': '60° devant la Terre sur son orbite', '60° behind Earth on its orbit': '60° derrière la Terre sur son orbite' },
  fact: {
    LS_KSC: "Apollo 11 est partie vers la Lune depuis le pas de tir 39A en 1969. La navette spatiale décollait d'ici, tout comme Artemis II en avril 2026, depuis le pas de tir 39B.",
    LS_JSC: "Le centre de contrôle de mission et la maison des astronautes de la NASA, qui s'y entraînent. « Houston, ici la base de la Tranquillité. L'Aigle s'est posé », annonçait Neil Armstrong en 1969.",
    LS_JPL: "Construit et pilote les explorateurs robotisés de la NASA : les rovers martiens, les Voyager et Juno. Quand un rover se pose sur Mars, c'est cette salle qui applaudit.",
    LS_GSFC: "Pilote Hubble, a aidé à construire le télescope James Webb, et étudie le climat de la Terre depuis l'espace.",
    LS_Kourou: "Les fusées Ariane décollent d'ici, près de l'équateur, où la rotation de la Terre leur donne un élan gratuit. James Webb a décollé de Kourou le jour de Noël 2021.",
    LS_Baikonur: "Le tout premier port spatial du monde. Spoutnik 1 (1957) et Youri Gagarine, le premier humain dans l'espace (1961), sont partis d'ici.",
    LS_Jiuquan: "Les astronautes chinois décollent d'ici à bord des vaisseaux Shenzhou vers la station spatiale Tiangong.",
    LS_Wenchang: "Le port spatial chinois en bord de mer, pour les fusées lourdes : Chang'e 5 et 6 sont partis d'ici vers la Lune, et Tianwen-1 vers Mars.",
    LS_Sriharikota: "Le port spatial indien, sur une île du golfe du Bengale. Chandrayaan-3 en est parti en 2023, direction le pôle Sud de la Lune.",
    LS_Tanegashima: "Souvent appelée la plus belle base de lancement du monde, sur une île verdoyante au bord de la mer. Le « sniper lunaire » japonais SLIM est parti d'ici.",
    LS_Starbase: "C'est là que SpaceX construit et lance Starship, la plus grande fusée jamais lancée. Son énorme propulseur est rattrapé au vol par la tour, avec deux bras métalliques.",
    Swarms: "En bleu : Starlink, environ 10 000 satellites Internet en service, la plus grande flotte jamais vue. En vert : les satellites GPS qui indiquent à votre téléphone où il se trouve. En or : l'anneau géostationnaire, à 36 000 km, où les satellites font un tour par jour et semblent immobiles au-dessus d'un point, pour la télé et la météo. En gris : les débris spatiaux. Environ 40 000 objets sont suivis, et il y a plus d'un million de fragments de plus d'un centimètre.",
    LP_L1: "Un point entre le Soleil et la Terre où un vaisseau peut rester et observer le Soleil sans interruption. SOHO y est depuis 1996 et nous prévient des tempêtes solaires.",
    LP_L2: "Du côté nuit de la Terre, avec le Soleil, la Terre et la Lune derrière soi : l'endroit froid et sombre idéal pour les télescopes. James Webb y travaille, Gaia y a cartographié la galaxie, et Roman est en route.",
    LP_L3: "Caché derrière le Soleil, jamais visible depuis la Terre. La science-fiction y a imaginé une « anti-Terre » secrète, mais il n'y a rien.",
    LP_L4: "L'un des deux points vraiment stables : ce qu'on y place y reste. Un petit astéroïde, 2010 TK7, a été découvert en train d'y rôder en 2010.",
    LP_L5: "L'autre point stable. La mission Vigil de l'ESA prévoit d'y aller pour observer de côté les tempêtes solaires avant qu'elles ne se dirigent vers la Terre.",
  },
});

await import('./neighbours.js' + new URL(import.meta.url).search);
