// =====================================================================
// Apollo 8 (first around the Moon, Earthrise), Apollo 13 (the rescue), and a tour of the 6 Apollo landing sites
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies, sim, flyTo, focusSel, camera, controls, glowSprite } = SS;
const { info, INFO } = SS.cosmos;
const { nearLabel, PL } = SS.extras;
const { buildCSM, buildLM, lmLoader } = SS.apollo;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const special = SS.more.special;
const moon = bodies.Moon.obj, moonPivot = moon.parent, MR = 0.27;
const U = Date.UTC;
let focusKey = '';
const NOW = {};
{ const prev = SS.onFocus; SS.onFocus = k => { focusKey = k; prev(k); }; }

// ---------- shared: a spacecraft stack and a route in the Moon's frame ----------
const frame = new THREE.Group(); moonPivot.add(frame);
sim.push(() => { const p = moon.position; frame.rotation.z = Math.atan2(p.y, p.x); });
const RO = 0.37, MX = 3, RE = 1.13;
const orbitPt = (th, out = V(), r = RO) => out.set(MX - r * Math.cos(th), 0, -r * Math.sin(th));
const earthPt = (ph, out = V()) => out.set(RE * Math.cos(ph), 0, -RE * Math.sin(ph));
const PH0 = -2.2, PH1 = PH0 + 3 * Math.PI;
const dashLine = (pts, c) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: c, dashSize: 0.05, gapSize: 0.035, transparent: true, opacity: 0.8 })); l.computeLineDistances(); frame.add(l); return l; };
function makeStack(withLM) {
  const holder = new THREE.Group(); frame.add(holder);
  const stack = new THREE.Group(); stack.scale.setScalar(0.0045); holder.add(stack);
  const csm = buildCSM(); stack.add(csm);
  const lm = new THREE.Group(); lm.rotation.x = Math.PI; lm.position.y = 8.1 + 5.1; stack.add(lm);
  let lmSimple = null; if (withLM) { lmSimple = buildLM(); lm.add(lmSimple); } else lm.visible = false;
  stack.children.forEach(c => c.position.y -= withLM ? 5.3 : 2.7);
  const loadLM = () => { if (!withLM || lm.userData.done) return; lm.userData.done = true; lmLoader().then(m => { lmSimple.visible = false; lm.add(m.clone(true)); }).catch(() => { lm.userData.done = false; }); };
  return { holder, stack, csm, lm, loadLM };
}
const Y = V(0, 1, 0);
function place(holder, P, P2) { holder.position.copy(P); holder.quaternion.setFromUnitVectors(Y, P2.clone().sub(P).normalize()); }
const wp = V(), mp = V();
const nearDir = obj => () => { obj.getWorldPosition(wp); moon.getWorldPosition(mp); return wp.sub(mp).normalize().add(V(0, 1.3, 0)).normalize(); };
const nowLine = (en, fr2) => '<br><b class="apnow" style="display:inline;font-size:13px;color:#ffd27a">' + (fr() ? fr2 : en) + '</b>';
const slow = v => { if ($('speed')) $('speed').value = v; };

// =====================================================================
// 1. APOLLO 8 · 21–27 December 1968: the first people to fly around the Moon
// =====================================================================
const A8 = { launch: U(1968, 11, 21, 12, 51), tli: U(1968, 11, 21, 15, 41), loi: U(1968, 11, 24, 9, 59), rise: U(1968, 11, 24, 16, 40), tei: U(1968, 11, 25, 6, 10), splash: U(1968, 11, 27, 15, 51) };
{
  const c = makeStack(false);
  const out = new THREE.CatmullRomCurve3([earthPt(PH1), V(0.75, 0.03, 1.12), V(1.45, 0.03, 0.82), V(2.15, 0.03, 0.12), V(2.7, 0.02, -0.42), V(3.2, 0, -0.42), orbitPt(Math.PI)], false, 'centripetal');
  const back = new THREE.CatmullRomCurve3([orbitPt(Math.PI), V(3.3, 0, 0.4), V(2.75, 0.02, 0.6), V(1.9, 0.03, 0.3), V(1.15, 0.03, -0.45), V(0.55, 0.03, -1.0), V(0.1, 0.03, -1.04)], false, 'centripetal');
  const ring = []; for (let i = 0; i <= 96; i++) ring.push(orbitPt(i / 96 * 2 * Math.PI));
  const lines = [dashLine(out.getSpacedPoints(300), 0xb8ffc8), dashLine(ring, 0xb8ffc8), dashLine(back.getSpacedPoints(300), 0x9fd0ff)];
  const N = 4, TH0 = Math.PI, TH1 = Math.PI + N * 2 * Math.PI;      // 10 real orbits, drawn as 4
  const P = V(), P2 = V();
  let stage = 'coast';
  const state = ms => {
    const f = (a, b) => Math.min(1, Math.max(0, (ms - a) / (b - a)));
    if (ms < A8.tli) { const ph = PH0 + (PH1 - PH0) * f(A8.launch, A8.tli); earthPt(ph, P); earthPt(ph + 0.02, P2); stage = 'earth'; }
    else if (ms < A8.loi) { const u = Math.min(0.996, f(A8.tli, A8.loi)); out.getPointAt(u, P); out.getPointAt(u + 0.004, P2); stage = 'coast'; }
    else if (ms < A8.tei) { const th = TH0 + (TH1 - TH0) * f(A8.loi, A8.tei); orbitPt(th, P); orbitPt(th + 0.02, P2); stage = ms < U(1968, 11, 25, 3, 30) && ms > U(1968, 11, 25, 2, 0) ? 'xmas' : 'orbit'; }
    else { const u = Math.min(0.996, f(A8.tei, A8.splash)); back.getPointAt(u, P); back.getPointAt(u + 0.004, P2); stage = 'home'; }
  };
  const lbl = nearLabel(c.holder, 'Apollo 8', 0.14, 'Apollo8', 'craft', 12);
  sim.push(() => {
    const ms = SS.getDate(), live = ms > A8.launch && ms < A8.splash, on = (live || focusKey === 'Apollo8' || focusKey === 'Apollo8Trip') && !document.body.classList.contains('earthrise');
    c.holder.visible = on; for (const l of lines) l.visible = on; if (!on) { lbl.visible = false; return; }
    state(Math.min(Math.max(ms, A8.launch + 1), A8.splash - 1)); place(c.holder, P, P2);
  });
  bodies.Apollo8 = { obj: c.holder, radius: 0.05, view: 0.45, dir: nearDir(c.holder) };
  const whole = new THREE.Object3D(); whole.position.set(1.6, 0, 0); frame.add(whole);
  bodies.Apollo8Trip = { obj: whole, radius: 2, view: 6.5, selfLit: true, dir: () => V(0.15, 1, 0.35).normalize() };
  const ST = {
    earth: ['Now: in orbit around Earth, before the first-ever burn towards the Moon.', "En ce moment : en orbite autour de la Terre, avant la toute première poussée vers la Lune."],
    coast: ['Now: on the way to the Moon, the first people ever to leave Earth\'s orbit.', "En ce moment : en route vers la Lune, les premiers humains à quitter l'orbite terrestre."],
    orbit: ['Now: in orbit around the Moon, 10 times in 20 hours.', 'En ce moment : en orbite autour de la Lune, 10 tours en 20 heures.'],
    xmas: ['Now: Christmas Eve broadcast to Earth from lunar orbit.', 'En ce moment : message de la veille de Noël envoyé vers la Terre depuis l\'orbite lunaire.'],
    home: ['Now: on the way home.', 'En ce moment : sur le chemin du retour.'],
  };
  const EN = 'Frank Borman, Jim Lovell and Bill Anders were the first people to leave Earth\'s orbit and the first to see the far side of the Moon with their own eyes. They circled the Moon 10 times on Christmas Eve 1968, and Anders took the famous "Earthrise" photo. There was no Lunar Module on this flight.';
  const FR = "Frank Borman, Jim Lovell et Bill Anders ont été les premiers à quitter l'orbite terrestre et les premiers à voir de leurs yeux la face cachée de la Lune. Ils ont fait 10 fois le tour de la Lune la veille de Noël 1968, et Anders a pris la célèbre photo « Earthrise » (« lever de Terre »). Il n'y avait pas de module lunaire lors de ce vol.";
  const card = () => { state(Math.min(Math.max(SS.getDate(), A8.launch + 1), A8.splash - 1)); return (fr() ? FR : EN) + nowLine(...ST[stage]); };
  for (const k of ['Apollo8', 'Apollo8Trip']) { info(k, k === 'Apollo8' ? 'Apollo 8' : 'Apollo 8: the whole trip', 'Mission · 21–27 December 1968', 'first people around the Moon', EN); if (SS.more.INFO_EN) delete SS.more.INFO_EN[k]; }
  const prev = SS.onFocus; SS.onFocus = k => { if (k === 'Apollo8' || k === 'Apollo8Trip') { const t = card(); INFO[k].fact = t; SS.i18nAdd?.({ fact: { [k]: t } }); } prev(k); };
  NOW.Apollo8 = NOW.Apollo8Trip = () => { state(Math.min(Math.max(SS.getDate(), A8.launch + 1), A8.splash - 1)); return ST[stage]; };
  special.Apollo8 = () => { if (!(SS.getDate() > A8.launch && SS.getDate() < A8.splash)) SS.setDate(A8.rise - 36e5); slow('0.000694'); setTimeout(() => flyTo('Apollo8'), 120); };
  special.Apollo8Trip = () => { SS.setDate(A8.launch + 30 * 6e4); slow('0.25'); setTimeout(() => flyTo('Apollo8Trip'), 120); };
  SS.apollo.A8 = A8;
}

// =====================================================================
// 2. APOLLO 13 · 11–17 April 1970: "Houston, we've had a problem"
// =====================================================================
const A13 = { launch: U(1970, 3, 11, 19, 13), tli: U(1970, 3, 11, 21, 49), boom: U(1970, 3, 14, 3, 8), peri: U(1970, 3, 15, 0, 21), smOff: U(1970, 3, 17, 13, 14), lmOff: U(1970, 3, 17, 16, 43), splash: U(1970, 3, 17, 18, 7) };
{
  const c = makeStack(true);
  const pts = [earthPt(PH1), V(0.75, -0.03, 1.12), V(1.45, -0.03, 0.82), V(2.15, -0.03, 0.12), V(2.7, -0.02, -0.38), V(3.13, 0, -0.27), V(3.32, 0, 0), V(3.13, 0, 0.27), V(2.75, -0.02, 0.55), V(1.9, -0.03, 0.3), V(1.15, -0.03, -0.45), V(0.55, -0.03, -1.0), V(0.1, -0.03, -1.04)];
  const path = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const sp = path.getSpacedPoints(600); let uP = 0, best = -1; sp.forEach((p, i) => { if (p.x > best) { best = p.x; uP = i / 600; } });
  const line = dashLine(sp, 0xffa060);
  // the damaged side of the Service Module (a whole panel blew off) and a flash
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.0), new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 1, side: THREE.DoubleSide })); hole.position.set(0, 2.0 - 5.3, 1.97); c.stack.add(hole); hole.visible = false;
  const flash = glowSprite(0.06, 'rgba(255,240,220,1)', 'rgba(0,0,0,0)', 1); c.holder.add(flash); flash.visible = false;
  const P = V(), P2 = V();
  let stage = 'coast';
  const state = ms => {
    const f = (a, b) => Math.min(1, Math.max(0, (ms - a) / (b - a)));
    if (ms < A13.tli) { const ph = PH0 + (PH1 - PH0) * f(A13.launch, A13.tli); earthPt(ph, P); earthPt(ph + 0.02, P2); stage = 'earth'; return; }
    const u = Math.min(0.996, ms < A13.peri ? uP * f(A13.tli, A13.peri) : uP + (1 - uP) * f(A13.peri, A13.splash));
    path.getPointAt(u, P); path.getPointAt(u + 0.004, P2);
    stage = ms < A13.boom ? 'coast' : ms < A13.peri - 6 * 36e5 ? 'boom' : ms < A13.peri + 6 * 36e5 ? 'moon' : ms < A13.smOff ? 'cold' : ms < A13.lmOff ? 'smoff' : 'reentry';
  };
  const lbl = nearLabel(c.holder, 'Apollo 13', 0.14, 'Apollo13', 'craft', 12);
  sim.push(() => {
    const ms = SS.getDate(), live = ms > A13.launch && ms < A13.splash, on = (live || focusKey === 'Apollo13' || focusKey === 'Apollo13Trip') && !document.body.classList.contains('earthrise');
    c.holder.visible = on; line.visible = on; if (!on) { lbl.visible = false; return; }
    const m = Math.min(Math.max(ms, A13.launch + 1), A13.splash - 1); state(m); place(c.holder, P, P2);
    c.csm.visible = m < A13.smOff; hole.visible = m > A13.boom && m < A13.smOff; c.lm.visible = m < A13.lmOff;
    const since = (m - A13.boom) / 36e5; flash.visible = since > 0 && since < 1.5; if (flash.visible) flash.material.opacity = 1 - since / 1.5;
  });
  bodies.Apollo13 = { obj: c.holder, radius: 0.05, view: 0.45, dir: nearDir(c.holder) };
  const whole = new THREE.Object3D(); whole.position.set(1.6, 0, 0); frame.add(whole);
  bodies.Apollo13Trip = { obj: whole, radius: 2, view: 6.5, selfLit: true, dir: () => V(-0.15, 1, 0.35).normalize() };
  const ST = {
    earth: ['Now: in orbit around Earth, all going well.', 'En ce moment : en orbite autour de la Terre, tout va bien.'],
    coast: ['Now: on the way to the Moon, heading for a landing at Fra Mauro.', 'En ce moment : en route vers la Lune, pour se poser à Fra Mauro.'],
    boom: ['Now: an oxygen tank has exploded. The crew are living in the Lunar Module Aquarius, used as a lifeboat.', "En ce moment : un réservoir d'oxygène a explosé. L'équipage vit dans le module lunaire Aquarius, utilisé comme canot de sauvetage."],
    moon: ['Now: swinging around the far side, the farthest any humans had ever been (400,171 km), until Artemis II.', "En ce moment : passage derrière la face cachée, le plus loin que des humains soient jamais allés (400 171 km), jusqu'à Artemis II."],
    cold: ['Now: heading home, cold and short of power, with water near freezing.', "En ce moment : retour vers la Terre, dans le froid et presque sans électricité, l'eau proche du gel."],
    smoff: ['Now: the damaged Service Module has been let go, and the crew see the blown-out side for the first time.', "En ce moment : le module de service endommagé a été largué, et l'équipage voit pour la première fois le flanc arraché."],
    reentry: ['Now: Aquarius has been let go. Odyssey brings the crew home.', 'En ce moment : Aquarius a été largué. Odyssey ramène l\'équipage sur Terre.'],
  };
  const EN = 'Jim Lovell, Jack Swigert and Fred Haise were on their way to land on the Moon when an oxygen tank exploded on 14 April 1970. "Houston, we\'ve had a problem." They cancelled the landing, used the Lunar Module Aquarius as a lifeboat, and let the Moon\'s gravity swing them around and back towards Earth. They splashed down safely on 17 April.';
  const FR = "Jim Lovell, Jack Swigert et Fred Haise étaient en route pour se poser sur la Lune quand un réservoir d'oxygène a explosé le 14 avril 1970. « Houston, nous avons eu un problème. » Ils ont renoncé à l'alunissage, se sont servis du module lunaire Aquarius comme canot de sauvetage, et ont laissé la gravité de la Lune les faire tourner autour d'elle et les renvoyer vers la Terre. Ils ont amerri sains et saufs le 17 avril.";
  const card = () => { state(Math.min(Math.max(SS.getDate(), A13.launch + 1), A13.splash - 1)); return (fr() ? FR : EN) + nowLine(...ST[stage]); };
  for (const k of ['Apollo13', 'Apollo13Trip']) { info(k, k === 'Apollo13' ? 'Apollo 13' : 'Apollo 13: the whole trip', 'Mission · 11–17 April 1970', 'the rescue around the Moon', EN); if (SS.more.INFO_EN) delete SS.more.INFO_EN[k]; }
  const prev = SS.onFocus; SS.onFocus = k => { if (k === 'Apollo13' || k === 'Apollo13Trip') { c.loadLM(); const t = card(); INFO[k].fact = t; SS.i18nAdd?.({ fact: { [k]: t } }); } prev(k); };
  NOW.Apollo13 = NOW.Apollo13Trip = () => { state(Math.min(Math.max(SS.getDate(), A13.launch + 1), A13.splash - 1)); return ST[stage]; };
  special.Apollo13 = () => { if (!(SS.getDate() > A13.launch && SS.getDate() < A13.splash)) SS.setDate(A13.boom - 36e5); slow('0.000694'); setTimeout(() => flyTo('Apollo13'), 120); };
  special.Apollo13Trip = () => { SS.setDate(A13.launch + 30 * 6e4); slow('0.25'); setTimeout(() => flyTo('Apollo13Trip'), 120); };
}

// keep the "Now:" line fresh while one of the mission cards is open
setInterval(() => {
  const f = NOW[focusKey]; if (!f || $('info').style.display === 'none') return;
  const el = $('info').querySelector('.apnow'); const t = f()[fr() ? 1 : 0]; if (el && el.textContent !== t) el.textContent = t;
}, 1000);

// =====================================================================
// 3. EARTHRISE: watch Earth come up over the Moon's horizon, from Apollo 8's orbit (24 Dec 1968)
// =====================================================================
{
  let on = false, t = 0, t0 = 0, fov0 = 45;
  const loGeo = moon.geometry; let hiGeo = null;
  const earthBits = () => [PL.Earth.tilted, ...(SS.atmos || []).filter(a => a.parent === bodies.Earth.obj)];
  const M = V(), E = V(), d = V(), n0 = V(), n = V(), pos = V();
  const cap = document.createElement('div'); cap.id = 'riseCap';
  cap.style.cssText = 'position:fixed;left:50%;bottom:9%;transform:translateX(-50%);text-align:center;color:#fff;text-shadow:0 2px 12px #000;z-index:6;pointer-events:none;display:none;font-size:15px;max-width:90vw';
  document.body.appendChild(cap);
  const caption = () => { cap.innerHTML = fr() ? '<b style="font-size:22px">Lever de Terre</b><br>Comme vu par Apollo 8, la veille de Noël 1968 · la Terre est dessinée plus petite ici que dans le reste de la carte, plus proche de ce qu’ils ont vu · Échap pour sortir'
    : '<b style="font-size:22px">Earthrise</b><br>As seen by Apollo 8 on Christmas Eve 1968 · Earth is drawn smaller here than in the rest of the map, closer to what they saw · Esc to leave'; };
  const hdir = V(), side = V(), tgt = V(), hidden = [];
  const H = 0.007, DIP = Math.acos(MR / (MR + H)), PITCH = -(DIP - 9 * Math.PI / 180);
  function frameCam(dt) {
    t = (performance.now() - t0) / 1000;
    moon.getWorldPosition(M); bodies.Earth.obj.getWorldPosition(E); d.subVectors(E, M).normalize();
    n0.crossVectors(d, Y).normalize().negate();
    const a = 0.22 - Math.min(t / 24, 1) * 0.2;                       // slides along the orbit, so Earth climbs out from behind the horizon
    n.copy(n0).multiplyScalar(Math.cos(a)).addScaledVector(d, -Math.sin(a)).normalize();
    pos.copy(M).addScaledVector(n, MR + H);
    hdir.copy(d).addScaledVector(n, -d.dot(n)).normalize();             // level view towards Earth, then tilt down so the horizon sits low
    tgt.copy(pos).addScaledVector(hdir, Math.cos(PITCH)).addScaledVector(n, Math.sin(PITCH));
    camera.position.copy(pos); camera.up.copy(n); camera.lookAt(tgt);
  }
  function start() {
    if (on) return; on = true; t = 0; t0 = performance.now();
    moon.geometry = hiGeo ||= new THREE.SphereGeometry(MR, 512, 256);
    SS.setDate(A8.rise); slow('0'); SS.cancelTween?.();
    const au = $('auto'); if (au?.checked) { au.checked = false; au.dispatchEvent(new Event('change')); } controls.autoRotate = false;
    for (const o of earthBits()) o.scale.setScalar(0.13);
    hidden.length = 0;                                                  // hide orbit lines and the satellites around Earth, which are drawn far too big for this view
    const keep = new Set([PL.Earth.tilted, moonPivot, ...earthBits()]);
    for (const c of bodies.Earth.obj.children) if (!keep.has(c) && c.visible) { hidden.push(c); c.visible = false; }
    for (const l of SS.orbitLines) if (l.visible) { hidden.push(l); l.visible = false; }
    for (const c of frame.children) if (c.visible) { hidden.push(c); c.visible = false; }
    fov0 = camera.fov; camera.fov = 34; camera.updateProjectionMatrix();
    $('info').style.display = 'none'; document.body.classList.add('lightride', 'earthrise'); caption(); cap.style.display = 'block';
    SS.cameraOverride = frameCam;
  }
  function stop() {
    if (!on) return; on = false; SS.cameraOverride = null; camera.up.set(0, 1, 0); moon.geometry = loGeo;
    for (const o of earthBits()) o.scale.setScalar(1);
    for (const o of hidden) o.visible = true; hidden.length = 0;
    camera.fov = fov0; camera.updateProjectionMatrix(); cap.style.display = 'none'; document.body.classList.remove('lightride', 'earthrise');
    controls.target.copy(M); flyTo('Moon');
  }
  { const st = document.createElement('style'); st.textContent = 'body.earthrise #labelLayer,body.earthrise #clock{display:none!important}'; document.head.appendChild(st); }
  addEventListener('keydown', e => { if (on && e.key === 'Escape') stop(); });
  addEventListener('pointerdown', e => { if (on && e.target.tagName === 'CANVAS') stop(); });
  special.Earthrise = start;
  { const prevGo = SS.go; SS.go = k => { if (on && k !== 'Earthrise') stop(); prevGo(k); }; focusSel.onchange = e => SS.go(e.target.value); }
  SS.more.earthrise = { start, stop };
}

// =====================================================================
// 4. MOON LANDINGS TOUR: all six Apollo landing sites, in order, on the day each crew landed
// =====================================================================
const LANDINGS = [
  ['MS_A11', U(1969, 6, 20, 20, 17), ['Apollo 11 · 20 July 1969', 'Sea of Tranquillity · Armstrong and Aldrin, the first steps'], ['Apollo 11 · 20 juillet 1969', 'Mer de la Tranquillité · Armstrong et Aldrin, les premiers pas']],
  ['MS_A12', U(1969, 10, 19, 6, 54), ['Apollo 12 · 19 November 1969', 'Ocean of Storms · a pinpoint landing next to Surveyor 3'], ['Apollo 12 · 19 novembre 1969', 'Océan des Tempêtes · un atterrissage de précision près de Surveyor 3']],
  ['MS_A14', U(1971, 1, 5, 9, 18), ['Apollo 14 · 5 February 1971', 'Fra Mauro · where Apollo 13 should have landed; Shepard hits two golf balls'], ['Apollo 14 · 5 février 1971', 'Fra Mauro · là où Apollo 13 aurait dû se poser ; Shepard frappe deux balles de golf']],
  ['MS_A15', U(1971, 6, 30, 22, 16), ['Apollo 15 · 30 July 1971', 'Hadley Rille · the first drive in the Moon buggy'], ['Apollo 15 · 30 juillet 1971', 'Rainure de Hadley · la première sortie en jeep lunaire']],
  ['MS_A16', U(1972, 3, 21, 2, 23), ['Apollo 16 · 21 April 1972', 'Descartes · the only landing in the bright highlands'], ['Apollo 16 · 21 avril 1972', 'Descartes · le seul alunissage dans les hauts plateaux clairs']],
  ['MS_A17', U(1972, 11, 11, 19, 54), ['Apollo 17 · 11 December 1972', 'Taurus–Littrow · the last people on the Moon, so far'], ['Apollo 17 · 11 décembre 1972', 'Taurus–Littrow · les derniers humains sur la Lune, pour l\'instant']],
];
{
  let list = null, idx = -1;
  sim.push(() => {
    const tour = SS.extras.getTour?.(); if (!tour || tour.list !== list) { list = list && !tour ? null : list; return; }
    if (tour.i !== idx) { idx = tour.i; const L = LANDINGS[idx]; if (L) { SS.setDate(L[1] + 3 * 36e5); slow('0.0000115741'); } }
  });
  special.LandingsTour = () => {
    list = LANDINGS.map(([k, , en, f]) => [k, ...(fr() ? f : en), 12]); idx = -1;
    SS.startTour(list); const b = $('tourBtn'); if (b) b.textContent = (SS.tr || (x => x))('■ Stop tour');
  };
}

// ---------- menu ----------
{
  const sp = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Spacecraft');
  const a11t = sp?.querySelector('option[value="A11_trip"]');
  const opts = [['Apollo8Trip', 'Apollo 8: first around the Moon (Dec 1968)'], ['Earthrise', '🌍 Earthrise over the Moon (Apollo 8)'], ['Apollo13Trip', 'Apollo 13: the rescue (Apr 1970)'], ['LandingsTour', '▶ Tour: the 6 Moon landings']];
  let after = a11t || sp?.firstChild;
  for (const [k, t] of opts) { const o = document.createElement('option'); o.value = k; o.textContent = t; if (after) { after.after(o); after = o; } else sp?.appendChild(o); }
  const ml = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Moon landing sites');
  if (ml) { const o = document.createElement('option'); o.value = 'LandingsTour'; o.textContent = '▶ Tour: the 6 Moon landings'; ml.prepend(o); }
}

SS.i18nAdd?.({
  ui: { 'Apollo 8: first around the Moon (Dec 1968)': 'Apollo 8 : premiers autour de la Lune (déc. 1968)', '🌍 Earthrise over the Moon (Apollo 8)': '🌍 Lever de Terre sur la Lune (Apollo 8)',
    'Apollo 13: the rescue (Apr 1970)': 'Apollo 13 : le sauvetage (avr. 1970)', '▶ Tour: the 6 Moon landings': '▶ Visite : les 6 alunissages' },
  name: { 'Apollo 8: the whole trip': 'Apollo 8 : tout le voyage', 'Apollo 13: the whole trip': 'Apollo 13 : tout le voyage' },
  cat: { 'Mission · 21–27 December 1968': 'Mission · 21–27 décembre 1968', 'Mission · 11–17 April 1970': 'Mission · 11–17 avril 1970' },
  dist: { 'first people around the Moon': 'les premiers humains autour de la Lune', 'the rescue around the Moon': 'le sauvetage autour de la Lune' },
});
await import('./more3.js' + new URL(import.meta.url).search);
