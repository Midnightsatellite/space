// =====================================================================
// Interstellar visitors · Moon landing sites · Meteor showers · "Where are we?" (the Milky Way)
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { scene, camera, bodies, sim, addLabel, flyTo, focusSel, glowSprite } = SS;
const { info, INFO, skyDir, softDot, gauss, galaxyPoints } = SS.cosmos;
const { lumpy, nearLabel, scaleHide, auToScene } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const $ = id => document.getElementById(id);
const addOpts = (og, items) => { for (const [k, t] of items) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); } };
const newGroup = (label, after) => { const og = document.createElement('optgroup'); og.label = label; const a = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === after); a ? a.after(og) : focusSel.appendChild(og); return og; };
const special = {};             // menu entries that set the date or a view before flying
{ const prevGo = SS.go; SS.go = k => { if (special[k]) special[k](); else prevGo(k); }; focusSel.onchange = e => SS.go(e.target.value); }
SS.more.special = special;
const flyLater = (k, ms = 120) => setTimeout(() => { flyTo(k); }, ms);

// =====================================================================
// 4. INTERSTELLAR VISITORS on their real, open (hyperbolic) paths
// =====================================================================
const K = 0.01720209895;                                   // Gauss's constant: Sun's gravity in AU and days
const sceneR = r => (r <= 100 ? auToScene(r) : 150 + 60 * Math.log10(r / 100));
function hyperPos({ q, e, i, node, peri }, H) {
  const a = q / (1 - e), r = a * (1 - e * Math.cosh(H));
  const nu = 2 * Math.atan(Math.sqrt((e + 1) / (e - 1)) * Math.tanh(H / 2));
  const u = nu + peri * D2R, O = node * D2R, I = i * D2R;
  const x = Math.cos(O) * Math.cos(u) - Math.sin(O) * Math.sin(u) * Math.cos(I);
  const y = Math.sin(O) * Math.cos(u) + Math.cos(O) * Math.sin(u) * Math.cos(I);
  const z = Math.sin(u) * Math.sin(I);
  return { v: V(x, z, -y).multiplyScalar(sceneR(r)), r };
}
function visitor({ key, name, el, T, mesh, color, comet, cat, dist, fact }) {
  const a = el.q / (el.e - 1), n = K / Math.sqrt(a * a * a);     // mean motion (radians per day)
  const pts = []; for (let H = -4.2; H <= 4.2; H += 0.02) { const p = hyperPos(el, H); if (p.r < 400) pts.push(p.v); }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color, dashSize: 1.2, gapSize: 0.8, transparent: true, opacity: 0.55 }));
  line.computeLineDistances(); scene.add(line); SS.orbitLines.push(line); scaleHide.push(line);
  const holder = new THREE.Group(); holder.add(mesh); scene.add(holder); scaleHide.push(holder);
  let coma = null; if (comet) { coma = glowSprite(1.4, comet, 'rgba(0,0,0,0)', 0.7); holder.add(coma); }
  const st = { r: 99 };
  sim.push(dt => {
    const M = n * ((SS.getDate() - T) / 864e5); let H = Math.asinh(M / el.e);
    for (let k = 0; k < 30; k++) H -= (el.e * Math.sinh(H) - H - M) / (el.e * Math.cosh(H) - 1);
    const p = hyperPos(el, H); holder.position.copy(p.v); st.r = p.r; mesh.rotation.y += dt * 0.6; mesh.rotation.z += dt * 0.2;
    if (coma) coma.scale.setScalar(Math.min(3, 2.4 / p.r));
  });
  nearLabel(holder, name, 0.7, key, 'small', 120);
  bodies[key] = { obj: holder, radius: 0.3, view: 3, dir: t => { const s = t.clone().negate().normalize(); return V(0, 1, 0).cross(s).normalize().add(V(0, 0.4, 0)).add(s.multiplyScalar(-0.3)).normalize(); } };
  info(key, name, cat, dist, fact);
}
visitor({ key: 'Oumuamua', name: "1I/'Oumuamua", el: { q: 0.25534, e: 1.20113, i: 122.74, node: 24.597, peri: 241.81 }, T: Date.UTC(2017, 8, 9, 12),
  mesh: new THREE.Mesh(lumpy(0.07, 0.15, 61, [6, 1, 1]), new THREE.MeshStandardMaterial({ color: 0x8a5a44, roughness: 1 })), color: 0xff9a7a,
  cat: 'Interstellar object · 2017', dist: 'passed the Sun in September 2017, now leaving for good',
  fact: 'The first object ever seen passing through from another star system, spotted in Hawaii in October 2017. It is up to 10 times longer than it is wide, and it sped up slightly as it left. Its Hawaiian name means "a messenger from afar arriving first".' });
visitor({ key: 'Borisov', name: '2I/Borisov', el: { q: 2.0066, e: 3.3565, i: 44.05, node: 308.15, peri: 209.12 }, T: Date.UTC(2019, 11, 8, 13),
  mesh: new THREE.Mesh(lumpy(0.06, 0.3, 62), new THREE.MeshStandardMaterial({ color: 0x4a4440, roughness: 1 })), color: 0x8fd8ff, comet: 'rgba(170,220,255,0.85)',
  cat: 'Interstellar comet · 2019', dist: 'passed the Sun in December 2019, now leaving for good',
  fact: 'The first comet known to come from another star, discovered in August 2019 by amateur astronomer Gennady Borisov with a telescope he built himself. It was unusually rich in carbon monoxide ice.' });
visitor({ key: 'Atlas3I', name: '3I/ATLAS', el: { q: 1.357, e: 6.14, i: 175.11, node: 322.16, peri: 128.01 }, T: Date.UTC(2025, 9, 29, 11),
  mesh: new THREE.Mesh(lumpy(0.07, 0.3, 63), new THREE.MeshStandardMaterial({ color: 0x4a4440, roughness: 1 })), color: 0x9fffb0, comet: 'rgba(170,255,200,0.85)',
  cat: 'Interstellar comet · 2025', dist: 'passed the Sun in October 2025, now leaving for good',
  fact: 'The third interstellar visitor, found on 1 July 2025 by the ATLAS survey telescope in Chile. Racing in at about 58 km/s, it is the fastest yet, and it may be older than our Solar System.' });
{ const og = newGroup('Interstellar visitors', 'Comets, asteroids & belts');
  const IV = [['IV_oum', "'Oumuamua · Oct 2017", 'Oumuamua', Date.UTC(2017, 9, 19)], ['IV_bor', 'Borisov · Dec 2019', 'Borisov', Date.UTC(2019, 11, 8)], ['IV_atl', '3I/ATLAS · Oct 2025', 'Atlas3I', Date.UTC(2025, 9, 29)]];
  addOpts(og, IV.map(x => [x[0], x[1]]));
  for (const [v, , k, ms] of IV) special[v] = () => { SS.setDate(ms); $('speed').value = '0.25'; flyLater(k); };
}

// =====================================================================
// 5. MOON LANDING SITES
// =====================================================================
{
  const moon = bodies.Moon.obj, R = moon.geometry.parameters.radius;
  const COL = { us: 0xffd27a, ussr: 0xff6a5a, cn: 0xff4040, in: 0xffa040, jp: 0xffffff, priv: 0x7ad8ff };
  const SITES = [
    ['A11', 'Apollo 11', 0.674, 23.473, 'us', 'Crewed landing · 20 July 1969', 'Sea of Tranquillity', 'Neil Armstrong and Buzz Aldrin: the first people to walk on the Moon. "That\'s one small step for man, one giant leap for mankind."'],
    ['A12', 'Apollo 12', -3.012, -23.422, 'us', 'Crewed landing · 19 November 1969', 'Ocean of Storms', 'Landed just 180 m from the robot lander Surveyor 3 and brought pieces of it home.'],
    ['A14', 'Apollo 14', -3.645, -17.471, 'us', 'Crewed landing · 5 February 1971', 'Fra Mauro highlands', 'Alan Shepard hit two golf balls on the Moon.'],
    ['A15', 'Apollo 15', 26.132, 3.634, 'us', 'Crewed landing · 30 July 1971', 'Hadley Rille, at the foot of the Apennine mountains', 'The first mission with the Lunar Roving Vehicle, the Moon buggy.'],
    ['A16', 'Apollo 16', -8.973, 15.5, 'us', 'Crewed landing · 21 April 1972', 'Descartes highlands', 'The only Apollo landing in the bright lunar highlands.'],
    ['A17', 'Apollo 17', 20.191, 30.772, 'us', 'Crewed landing · 11 December 1972', 'Taurus–Littrow valley', 'The last time people walked on the Moon. Geologist Harrison Schmitt was the first scientist there.'],
    ['L9', 'Luna 9', 7.08, -64.37, 'ussr', 'Robotic lander · 3 February 1966', 'Ocean of Storms', 'The Soviet Union\'s Luna 9 made the first soft landing on another world and sent back the first pictures from the surface.'],
    ['L17', 'Lunokhod 1 (Luna 17)', 38.24, -35.0, 'ussr', 'Robotic rover · 17 November 1970', 'Sea of Rains', 'The first robot rover on another world, driven from Earth for about 10 km.'],
    ['S1', 'Surveyor 1', -2.47, -43.34, 'us', 'Robotic lander · 2 June 1966', 'Ocean of Storms', 'NASA\'s first soft landing on the Moon, testing the ground for Apollo.'],
    ['CE3', "Chang'e 3", 44.12, -19.51, 'cn', 'Robotic lander and rover · 14 December 2013', 'Sea of Rains', 'China\'s first Moon landing, with the little Yutu ("Jade Rabbit") rover.'],
    ['CE4', "Chang'e 4", -45.44, 177.6, 'cn', 'Robotic lander and rover · 3 January 2019', 'Von Kármán crater, far side', 'The first landing ever on the far side of the Moon, which always faces away from Earth.'],
    ['CE5', "Chang'e 5", 43.06, -51.92, 'cn', 'Sample return · 1 December 2020', 'Ocean of Storms', 'Brought 1.7 kg of Moon rock back to Earth, the first new samples in 44 years.'],
    ['CE6', "Chang'e 6", -41.64, -153.99, 'cn', 'Sample return · 1 June 2024', 'Apollo crater, far side', 'Brought the first ever rock samples back from the far side of the Moon.'],
    ['CY3', 'Chandrayaan-3', -69.37, 32.32, 'in', 'Robotic lander and rover · 23 August 2023', 'near the south pole', 'India\'s first Moon landing, the first close to the south pole, where ice may hide in shadowed craters.'],
    ['SLIM', 'SLIM', -13.3, 25.25, 'jp', 'Robotic lander · 20 January 2024', 'near Shioli crater', 'Japan\'s "Moon sniper" landed within about 55 m of its target, though it ended up tipped on its nose.'],
    ['IM1', 'Odysseus (IM-1)', -80.13, 1.44, 'priv', 'Robotic lander · 22 February 2024', 'near the south pole', 'The first private spacecraft to land on the Moon (Intuitive Machines), and the first US landing since 1972.'],
    ['BG1', 'Blue Ghost 1', 18.56, 61.81, 'priv', 'Robotic lander · 2 March 2025', 'Sea of Crises', 'Firefly Aerospace\'s lander, the first fully successful commercial Moon landing.'],
  ];
  const grp = new THREE.Group(); moon.add(grp);
  moon.rotation.y = Math.PI;      // turn the Moon so its familiar near side (longitude 0) faces Earth, as in real life
  for (const [k, name, lat, lon, who, cat, where, fact] of SITES) {
    const n = V(Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.sin(lat * D2R), -Math.cos(lat * D2R) * Math.sin(lon * D2R)).normalize();
    const pin = new THREE.Group(); pin.position.copy(n).multiplyScalar(R); pin.quaternion.setFromUnitVectors(V(0, 1, 0), n); grp.add(pin);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.0005, 0.0005, 0.012, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); pole.position.y = 0.006; pin.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 0.004), new THREE.MeshBasicMaterial({ color: COL[who], side: THREE.DoubleSide })); flag.position.set(0.003, 0.0098, 0); pin.add(flag);
    const dot = glowSprite(0.005, '#' + new THREE.Color(COL[who]).getHexString(), 'rgba(0,0,0,0)', 0.9); pin.add(dot);
    nearLabel(pin, name, 0.022, 'MS_' + k, 'craft', 1.6);
    const wp = V(), mp = V();
    bodies['MS_' + k] = { obj: pin, radius: 0.02, view: 0.42, dir: () => { pin.getWorldPosition(wp); moon.getWorldPosition(mp); return wp.sub(mp).normalize(); } };
    info('MS_' + k, name, cat, where, fact);
  }
  { // hide the names of sites on the side of the Moon facing away from you
    const pins = grp.children, mw = V(), pw = V(), cw = V();
    sim.push(() => { moon.getWorldPosition(mw); camera.getWorldPosition(cw);
      for (const pin of pins) { pin.getWorldPosition(pw); const facing = pw.clone().sub(mw).normalize().dot(cw.clone().sub(pw).normalize()) > 0.05;
        for (const c of pin.children) if (c.isCSS2DObject && !facing) c.visible = false; } });
  }
  const og = newGroup('Moon landing sites', 'Moons');
  addOpts(og, SITES.map(s => ['MS_' + s[0], s[1]]));
  for (const st of SITES) special['MS_' + st[0]] = () => { $('speed').value = '0.0000115741'; const au = $('auto'); if (au.checked) { au.checked = false; au.dispatchEvent(new Event('change')); } SS.controls.autoRotate = false; flyTo('MS_' + st[0]); };   // slow time so the Moon holds still under the camera
  SS.more.moonSites = SITES;
}

// =====================================================================
// 6. METEOR SHOWERS: radiants in the sky, with meteors when they are active
// =====================================================================
const SHOWERS = [ // key, name, RA, Dec, peak [month, day], start, end, rate per hour, parent, constellation
  ['Quadrantids', 'Quadrantids', 230, 49, [0, 3], [11, 28], [0, 12], 110, 'asteroid 2003 EH1', 'Boötes'],
  ['Lyrids', 'Lyrids', 271, 34, [3, 22], [3, 14], [3, 30], 18, 'Comet Thatcher', 'Lyra'],
  ['EtaAquariids', 'Eta Aquariids', 338, -1, [4, 6], [3, 19], [4, 28], 50, "Halley's Comet", 'Aquarius'],
  ['Perseids', 'Perseids', 48, 58, [7, 12], [6, 17], [7, 24], 100, 'Comet Swift–Tuttle', 'Perseus'],
  ['Draconids', 'Draconids', 262, 54, [9, 8], [9, 6], [9, 10], 10, 'Comet Giacobini–Zinner', 'Draco'],
  ['Orionids', 'Orionids', 95, 16, [9, 21], [9, 2], [10, 7], 20, "Halley's Comet", 'Orion'],
  ['Leonids', 'Leonids', 152, 22, [10, 17], [10, 6], [10, 30], 15, 'Comet Tempel–Tuttle', 'Leo'],
  ['Geminids', 'Geminids', 112, 33, [11, 14], [11, 4], [11, 17], 150, 'asteroid 3200 Phaethon', 'Gemini'],
  ['Ursids', 'Ursids', 217, 76, [11, 22], [11, 17], [11, 26], 10, 'Comet Tuttle', 'Ursa Minor'],
];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
{
  const SKY = 12000;
  const grp = new THREE.Group(); scene.add(grp); scaleHide.push(grp);
  const doy = (m, d) => (Date.UTC(2001, m, d) - Date.UTC(2001, 0, 1)) / 864e5;
  const activity = (sh, ms) => {                      // 0 outside the active window, 1 at the peak
    const t = new Date(ms), now = doy(t.getUTCMonth(), t.getUTCDate()) + t.getUTCHours() / 24;
    const wrap = x => ((x % 365) + 365) % 365, peak = doy(...sh[4]), s = doy(...sh[5]), e = doy(...sh[6]);
    const inWin = wrap(now - s) <= wrap(e - s); if (!inWin) return 0;
    const dp = Math.min(wrap(now - peak), wrap(peak - now)), half = Math.max(1, Math.max(wrap(peak - s), wrap(e - peak)));
    return Math.max(0.08, Math.exp(-3 * (dp / half) * (dp / half)) * (sh[0] === 'Quadrantids' || sh[0] === 'Draconids' ? Math.exp(-dp * 0.8) : 1));
  };
  const radiants = SHOWERS.map(sh => {
    const dir = skyDir(sh[2], sh[3]).normalize(), o = new THREE.Object3D(); o.position.copy(dir).multiplyScalar(SKY); grp.add(o);
    const lbl = addLabel(o, `☄ ${sh[1]}`, 0, 'MET_' + sh[0], 'neb'); lbl.visible = false; lbl.element.style.pointerEvents = 'none';
    INFO['MET_' + sh[0]] = { name: sh[1], cat: 'Meteor shower', dist: `Peak ${sh[4][1]} ${MON[sh[4][0]]} · active ${sh[5][1]} ${MON[sh[5][0]]} – ${sh[6][1]} ${MON[sh[6][0]]}`,
      fact: `Up to about ${sh[7]} meteors an hour at the peak, under a dark sky. They seem to come from ${sh[9]}, but you can see them anywhere in the sky. They are grains of dust from ${sh[8]}, burning up as Earth ploughs through its trail.` };
    return { sh, dir, lbl, o };
  });
  // meteors: short bright streaks flying away from the radiant
  const MAXM = 40, mGeo = new THREE.BufferGeometry(), mPos = new Float32Array(MAXM * 6), mCol = new Float32Array(MAXM * 6);
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3)); mGeo.setAttribute('color', new THREE.BufferAttribute(mCol, 3));
  const lines = new THREE.LineSegments(mGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); lines.frustumCulled = false; grp.add(lines);
  const meteors = [];
  let acc = 0;
  sim.push(dt => {
    grp.position.copy(camera.position);
    const ms = SS.getDate(), on = $('labels').checked, slow = Math.abs(parseFloat($('speed').value)) <= 0.05;
    let total = 0;
    for (const r of radiants) { const a = activity(r.sh, ms); r.a = a; r.lbl.visible = on && a > 0; total += a * r.sh[7]; }
    // spawn: a few per second at a strong peak (sped up so you can see them), only when time runs near real time
    acc += dt * (slow ? total / 40 : 0);
    while (acc > 1 && meteors.length < MAXM) {
      acc -= 1; const pick = radiants.filter(r => r.a > 0); if (!pick.length) break;
      let r = pick[0], x = Math.random() * pick.reduce((s, p) => s + p.a * p.sh[7], 0); for (const p of pick) { x -= p.a * p.sh[7]; if (x <= 0) { r = p; break; } }
      const side = V(gauss(), gauss(), gauss()).cross(r.dir).normalize();
      const start = r.dir.clone().addScaledVector(side, 0.05 + Math.random() * 0.4).normalize(), vel = start.clone().sub(r.dir).normalize();
      meteors.push({ p: start, v: vel, t: 0, life: 0.5 + Math.random() * 0.6, sp: 0.18 + Math.random() * 0.2 });
    }
    if (acc > 1) acc = 1;
    let k = 0;
    for (let i = meteors.length - 1; i >= 0; i--) { const m = meteors[i]; m.t += dt; if (m.t > m.life) { meteors.splice(i, 1); continue; } }
    for (const m of meteors) {
      const head = m.p.clone().addScaledVector(m.v, m.sp * m.t).normalize().multiplyScalar(SKY * 0.98), tail = m.p.clone().addScaledVector(m.v, Math.max(0, m.sp * m.t - 0.06)).normalize().multiplyScalar(SKY * 0.98);
      const f = Math.sin(Math.PI * m.t / m.life);
      mPos.set([head.x, head.y, head.z, tail.x, tail.y, tail.z], k * 6); mCol.set([f, f, f * 0.9, 0, 0, 0], k * 6); k++;
    }
    for (let i = k; i < MAXM; i++) mPos.fill(0, i * 6, i * 6 + 6);
    mGeo.attributes.position.needsUpdate = true; mGeo.attributes.color.needsUpdate = true;
  });
  // menu: jump to the next peak, at 1 a.m. London time, and look up from London
  const og = newGroup('Meteor showers', 'Events');
  addOpts(og, SHOWERS.map(s => ['MET_' + s[0], `☄ ${s[1]} · ${s[4][1]} ${MON[s[4][0]]}`]));
  for (const sh of SHOWERS) special['MET_' + sh[0]] = () => {
    const now = new Date(SS.getDate()); let y = now.getUTCFullYear(); let t = Date.UTC(y, sh[4][0], sh[4][1], 1); if (t < SS.getDate() - 864e5) t = Date.UTC(y + 1, sh[4][0], sh[4][1], 1);
    SS.setDate(t); $('speed').value = '0.0000115741'; focusSel.value = 'MET_' + sh[0]; SS.extras.goNight?.() ?? SS.go('night');
    setTimeout(() => { const i = INFO['MET_' + sh[0]], tr = SS.tr || (x => x);
      SS.extras.showInfo(i.name, i.cat, i.dist, i.fact + ' ' + tr(`Tip: drag the view to find the ☄ ${sh[1]} label.`)); SS.more.current = 'MET_' + sh[0]; }, 300);
  };
  SS.more.SHOWERS = SHOWERS;
}

// =====================================================================
// 7. "WHERE ARE WE?": a map of the Milky Way with the Sun marked
// =====================================================================
{
  const R = 1500, C = V(0, 16000, -9000);              // drawn well away from everything else
  const hold = new THREE.Group(); hold.position.copy(C); hold.rotation.x = 0.55; scene.add(hold); scaleHide.push(hold);
  const pts = galaxyPoints({ type: 'spiral', R, n: 90000, arms: 4, pitch: 0.22, bulge: 0.16, seed: 77, bright: 1.25 }); hold.add(pts);
  const bar = galaxyPoints({ type: 'elliptical', R: R * 0.22, n: 9000, seed: 78, bright: 1.1 }); bar.scale.set(1.9, 0.5, 0.6); bar.rotation.y = 0.45; hold.add(bar);
  hold.add(glowSprite(R * 0.7, 'rgba(255,220,170,0.55)', 'rgba(0,0,0,0)', 0.6));
  // labels for the main features (placed along the drawn spiral)
  const armAt = (arm, r) => { const th = arm * 6.283 / 4 + Math.log(Math.max(r, R * 0.05) / (R * 0.05)) / Math.tan(0.22); return V(r * Math.cos(th), 0, r * Math.sin(th)); };
  const mk = (name, pos, key, cls = 'gal') => { const o = new THREE.Object3D(); o.position.copy(pos); hold.add(o); addLabel(o, name, 0, key, cls); return o; };
  mk('Perseus Arm', armAt(0, R * 0.82), 'MilkyWay'); mk('Scutum–Centaurus Arm', armAt(1, R * 0.62), 'MilkyWay');
  mk('Sagittarius Arm', armAt(2, R * 0.55), 'MilkyWay'); mk('Norma Arm', armAt(3, R * 0.45), 'MilkyWay');
  mk('Sagittarius A* (centre)', V(0, R * 0.05, 0), 'SgrA', 'bh');
  // the Sun: about 26,700 light-years out (a little over half way), in the small Orion Spur between two arms
  const sunPos = armAt(0, R * 0.53).lerp(armAt(3, R * 0.53), 0.5).setLength(R * 0.53).setY(R * 0.01);
  const sun = new THREE.Object3D(); sun.position.copy(sunPos); hold.add(sun);
  const ring = new THREE.Mesh(new THREE.RingGeometry(R * 0.035, R * 0.045, 48), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; sun.add(ring); sun.add(glowSprite(R * 0.06, 'rgba(255,230,150,1)', 'rgba(0,0,0,0)', 1));
  sim.push((dt, t) => { ring.scale.setScalar(1 + 0.25 * Math.sin(t * 3)); });
  addLabel(sun, '☀ You are here', R * 0.04, 'MilkyWay', 'star');
  bodies.MilkyWay = { obj: hold, radius: R, view: R * 2.6, selfLit: true, dir: () => V(0.15, 0.95, 0.35).normalize() };
  info('MilkyWay', 'The Milky Way: where are we?', 'Our galaxy', 'about 100,000 light-years across',
    'Our Sun is one of 100–400 billion stars, about 26,700 light-years from the centre, in a small spur between two big spiral arms. It takes about 230 million years to go once around the galaxy: the last time we were here, the first dinosaurs were appearing.');
  const views = focusSel.querySelector('optgroup'); addOpts(views, [['MilkyWay', '🌌 Where are we? (the Milky Way)']]);
}

// ---------- French ----------
SS.i18nAdd?.({
  ui: { 'Interstellar visitors': 'Visiteurs interstellaires', 'Moon landing sites': 'Sites d\'alunissage', 'Meteor showers': 'Pluies de météores',
    'Perseus Arm': 'Bras de Persée', 'Scutum–Centaurus Arm': 'Bras de l\'Écu–Centaure', 'Sagittarius Arm': 'Bras du Sagittaire', 'Norma Arm': 'Bras de la Règle',
    'Sagittarius A* (centre)': 'Sagittarius A* (centre)', '☀ You are here': '☀ Vous êtes ici', '🌌 Where are we? (the Milky Way)': '🌌 Où sommes-nous ? (la Voie lactée)' },
  name: { "1I/'Oumuamua": "1I/'Oumuamua", "'Oumuamua · Oct 2017": "'Oumuamua · oct. 2017", 'Borisov · Dec 2019': 'Borisov · déc. 2019', '3I/ATLAS · Oct 2025': '3I/ATLAS · oct. 2025',
    'The Milky Way: where are we?': 'La Voie lactée : où sommes-nous ?', 'Lunokhod 1 (Luna 17)': 'Lunokhod 1 (Luna 17)',
    Quadrantids: 'Quadrantides', Lyrids: 'Lyrides', 'Eta Aquariids': 'Êta Aquarides', Perseids: 'Perséides', Draconids: 'Draconides', Orionids: 'Orionides', Leonids: 'Léonides', Geminids: 'Géminides', Ursids: 'Ursides',
    '☄ Quadrantids': '☄ Quadrantides', '☄ Lyrids': '☄ Lyrides', '☄ Eta Aquariids': '☄ Êta Aquarides', '☄ Perseids': '☄ Perséides', '☄ Draconids': '☄ Draconides', '☄ Orionids': '☄ Orionides', '☄ Leonids': '☄ Léonides', '☄ Geminids': '☄ Géminides', '☄ Ursids': '☄ Ursides' },
  cat: { 'Interstellar object · 2017': 'Objet interstellaire · 2017', 'Interstellar comet · 2019': 'Comète interstellaire · 2019', 'Interstellar comet · 2025': 'Comète interstellaire · 2025',
    'Crewed landing · 20 July 1969': 'Alunissage habité · 20 juillet 1969', 'Crewed landing · 19 November 1969': 'Alunissage habité · 19 novembre 1969', 'Crewed landing · 5 February 1971': 'Alunissage habité · 5 février 1971',
    'Crewed landing · 30 July 1971': 'Alunissage habité · 30 juillet 1971', 'Crewed landing · 21 April 1972': 'Alunissage habité · 21 avril 1972', 'Crewed landing · 11 December 1972': 'Alunissage habité · 11 décembre 1972',
    'Robotic lander · 3 February 1966': 'Atterrisseur robotisé · 3 février 1966', 'Robotic rover · 17 November 1970': 'Rover robotisé · 17 novembre 1970', 'Robotic lander · 2 June 1966': 'Atterrisseur robotisé · 2 juin 1966',
    'Robotic lander and rover · 14 December 2013': 'Atterrisseur et rover · 14 décembre 2013', 'Robotic lander and rover · 3 January 2019': 'Atterrisseur et rover · 3 janvier 2019',
    'Sample return · 1 December 2020': 'Retour d\'échantillons · 1er décembre 2020', 'Sample return · 1 June 2024': 'Retour d\'échantillons · 1er juin 2024',
    'Robotic lander and rover · 23 August 2023': 'Atterrisseur et rover · 23 août 2023', 'Robotic lander · 20 January 2024': 'Atterrisseur robotisé · 20 janvier 2024',
    'Robotic lander · 22 February 2024': 'Atterrisseur robotisé · 22 février 2024', 'Robotic lander · 2 March 2025': 'Atterrisseur robotisé · 2 mars 2025',
    'Meteor shower': 'Pluie de météores', 'Our galaxy': 'Notre galaxie' },
  dist: { 'passed the Sun in September 2017, now leaving for good': 'a frôlé le Soleil en septembre 2017, et repart pour toujours',
    'passed the Sun in December 2019, now leaving for good': 'a frôlé le Soleil en décembre 2019, et repart pour toujours',
    'passed the Sun in October 2025, now leaving for good': 'a frôlé le Soleil en octobre 2025, et repart pour toujours',
    'Sea of Tranquillity': 'Mer de la Tranquillité', 'Ocean of Storms': 'Océan des Tempêtes', 'Fra Mauro highlands': 'Hauts plateaux de Fra Mauro', 'Hadley Rille, at the foot of the Apennine mountains': 'Rille Hadley, au pied des monts Apennins',
    'Descartes highlands': 'Hauts plateaux de Descartes', 'Taurus–Littrow valley': 'Vallée de Taurus–Littrow', 'Sea of Rains': 'Mer des Pluies', 'Von Kármán crater, far side': 'Cratère Von Kármán, face cachée',
    'Apollo crater, far side': 'Cratère Apollo, face cachée', 'near the south pole': 'près du pôle Sud', 'near Shioli crater': 'près du cratère Shioli', 'Sea of Crises': 'Mer des Crises',
    'about 100,000 light-years across': 'environ 100 000 années-lumière de diamètre' },
  fact: {
    Oumuamua: "Le premier objet jamais vu venant d'un autre système stellaire, repéré à Hawaï en octobre 2017. Il est jusqu'à 10 fois plus long que large, et il a légèrement accéléré en repartant. Son nom hawaïen signifie « un messager venu de loin, arrivé le premier ».",
    Borisov: "La première comète connue venant d'une autre étoile, découverte en août 2019 par l'astronome amateur Gennady Borisov avec un télescope qu'il a construit lui-même. Elle était inhabituellement riche en glace de monoxyde de carbone.",
    Atlas3I: "Le troisième visiteur interstellaire, découvert le 1er juillet 2025 par le télescope ATLAS au Chili. Arrivé à environ 58 km/s, c'est le plus rapide, et il pourrait être plus vieux que notre Système solaire.",
    MS_A11: "Neil Armstrong et Buzz Aldrin, les premiers humains à marcher sur la Lune. « C'est un petit pas pour l'homme, un bond de géant pour l'humanité. »",
    MS_A12: "Posé à seulement 180 m de la sonde robotique Surveyor 3, dont l'équipage a rapporté des morceaux.", MS_A14: "Alan Shepard a frappé deux balles de golf sur la Lune.",
    MS_A15: "La première mission avec le rover lunaire, la « jeep » de la Lune.", MS_A16: "Le seul alunissage Apollo dans les hauts plateaux clairs de la Lune.",
    MS_A17: "La dernière fois que des humains ont marché sur la Lune. Le géologue Harrison Schmitt fut le premier scientifique à y aller.",
    MS_L9: "Luna 9, soviétique, a réussi le premier atterrissage en douceur sur un autre monde et envoyé les premières photos depuis la surface.",
    MS_L17: "Le premier rover robotisé sur un autre monde, piloté depuis la Terre sur environ 10 km.", MS_S1: "Le premier atterrissage en douceur de la NASA sur la Lune, pour tester le sol avant Apollo.",
    MS_CE3: "Le premier alunissage de la Chine, avec le petit rover Yutu (« Lapin de jade »).", MS_CE4: "Le tout premier atterrissage sur la face cachée de la Lune, celle qu'on ne voit jamais depuis la Terre.",
    MS_CE5: "A rapporté 1,7 kg de roches lunaires sur Terre, les premiers nouveaux échantillons depuis 44 ans.", MS_CE6: "A rapporté les tout premiers échantillons de la face cachée de la Lune.",
    MS_CY3: "Le premier alunissage de l'Inde, le premier près du pôle Sud, où de la glace pourrait se cacher dans des cratères dans l'ombre.",
    MS_SLIM: "Le « sniper lunaire » japonais s'est posé à environ 55 m de sa cible, mais s'est retrouvé sur le nez.",
    MS_IM1: "Le premier engin privé à se poser sur la Lune (Intuitive Machines), et le premier alunissage américain depuis 1972.",
    MS_BG1: "L'atterrisseur de Firefly Aerospace, le premier alunissage commercial entièrement réussi.",
    MilkyWay: "Notre Soleil est l'une des 100 à 400 milliards d'étoiles, à environ 26 700 années-lumière du centre, dans un petit éperon entre deux grands bras spiraux. Il met environ 230 millions d'années à faire le tour de la galaxie : la dernière fois que nous étions ici, les premiers dinosaures apparaissaient.",
  },
});
{ // French text for the meteor shower cards
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const CONST = { Boötes: 'du Bouvier', Lyra: 'de la Lyre', Aquarius: 'du Verseau', Perseus: 'de Persée', Draco: 'du Dragon', Orion: "d'Orion", Leo: 'du Lion', Gemini: 'des Gémeaux', 'Ursa Minor': 'de la Petite Ourse' };
  const PAR = { 'asteroid 2003 EH1': "l'astéroïde 2003 EH1", 'Comet Thatcher': 'la comète Thatcher', "Halley's Comet": 'la comète de Halley', 'Comet Swift–Tuttle': 'la comète Swift–Tuttle',
    'Comet Giacobini–Zinner': 'la comète Giacobini–Zinner', 'Comet Tempel–Tuttle': 'la comète Tempel–Tuttle', 'asteroid 3200 Phaethon': "l'astéroïde 3200 Phaéton", 'Comet Tuttle': 'la comète Tuttle' };
  const dist = {}, fact = {}, ui = {};
  for (const sh of SHOWERS) {
    const i = INFO['MET_' + sh[0]];
    dist[i.dist] = `Pic le ${sh[4][1]} ${MOIS[sh[4][0]]} · active du ${sh[5][1]} ${MOIS[sh[5][0]]} au ${sh[6][1]} ${MOIS[sh[6][0]]}`;
    fact['MET_' + sh[0]] = `Jusqu'à environ ${sh[7]} météores par heure au pic, sous un ciel bien noir. Elles semblent venir ${CONST[sh[9]]}, mais on peut en voir partout dans le ciel. Ce sont des grains de poussière laissés par ${PAR[sh[8]]}, qui brûlent quand la Terre traverse sa traînée.`;
    ui[`Tip: drag the view to find the ☄ ${sh[1]} label.`] = `Astuce : faites glisser la vue pour trouver l'étiquette ☄ ${SS.tr ? '' : ''}${({ Quadrantids: 'Quadrantides', Lyrids: 'Lyrides', 'Eta Aquariids': 'Êta Aquarides', Perseids: 'Perséides', Draconids: 'Draconides', Orionids: 'Orionides', Leonids: 'Léonides', Geminids: 'Géminides', Ursids: 'Ursides' })[sh[1]]}.`;
    const opt = `☄ ${sh[1]} · ${sh[4][1]} ${MON[sh[4][0]]}`; ui[opt] = `☄ ${({ Quadrantids: 'Quadrantides', Lyrids: 'Lyrides', 'Eta Aquariids': 'Êta Aquarides', Perseids: 'Perséides', Draconids: 'Draconides', Orionids: 'Orionides', Leonids: 'Léonides', Geminids: 'Géminides', Ursids: 'Ursides' })[sh[1]]} · ${sh[4][1]} ${MOIS[sh[4][0]]}`;
  }
  SS.i18nAdd?.({ dist, fact, ui });
}

await import('./astronauts.js' + new URL(import.meta.url).search);
