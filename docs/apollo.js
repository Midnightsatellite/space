// =====================================================================
// Apollo 11, rebuilt: a proper Saturn V upper stack (LM · CM · SM), the real July 1969 timeline,
// nose first along the route: out to the Moon, into lunar orbit, back home
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const SS = window.SS;
const { bodies, sim, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const special = SS.more.special;

// ---------- the real timeline (UTC) ----------
const T = {
  launch: Date.UTC(1969, 6, 16, 13, 32), tli: Date.UTC(1969, 6, 16, 16, 22), loi: Date.UTC(1969, 6, 19, 17, 21),
  undock: Date.UTC(1969, 6, 20, 17, 44), land: Date.UTC(1969, 6, 20, 20, 17), liftoff: Date.UTC(1969, 6, 21, 17, 54),
  dock: Date.UTC(1969, 6, 21, 21, 35), tei: Date.UTC(1969, 6, 22, 4, 55), splash: Date.UTC(1969, 6, 24, 16, 50),
};

// ---------- the spacecraft, built nose-up (+Y = direction of travel), sizes in metres ----------
const M = (color, metal, rough, emi = 0x000000) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emi });
function buildCSM() {
  const g = new THREE.Group();
  const silver = M(0xe6e9ef, 0.75, 0.25, 0x5a5d64), white = M(0xf4f4f4, 0.25, 0.5, 0x6a6a6a), dark = M(0x2a2a2e, 0.6, 0.5), bellM = M(0x8a8f99, 0.7, 0.35, 0x3a3d44);
  // Service Module: 3.9 m wide, 7.5 m long with its engine bell
  const sm = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 4.0, 40), white); sm.position.y = 2.0; g.add(sm);
  for (let k = 0; k < 6; k++) {                                         // the radiator panels and stripes
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.6, 0.9), M(0xc9ccd2, 0.6, 0.35, 0x45474c)); const a = k * Math.PI / 3;
    s.position.set(Math.cos(a) * 1.95, 2.0, Math.sin(a) * 1.95); s.rotation.y = -a; g.add(s);
  }
  for (let k = 0; k < 4; k++) {                                         // the four thruster quads
    const q = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 0.35), dark); const a = k * Math.PI / 2 + Math.PI / 4;
    q.position.set(Math.cos(a) * 2.05, 3.1, Math.sin(a) * 2.05); g.add(q);
  }
  const ant = new THREE.Group(); ant.position.set(0, 0.3, -1.95); g.add(ant);   // the high-gain antenna
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), dark); boom.rotation.x = Math.PI / 2; boom.position.z = -0.8; ant.add(boom);
  for (const [x, y] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), M(0xe8e8e8, 0.4, 0.5, 0x333333)); d.position.set(x, y, -1.65); d.rotation.x = Math.PI; ant.add(d); }
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.25, 2.6, 32, 1, true), bellM); bell.material.side = THREE.DoubleSide; bell.position.y = -1.3; g.add(bell);
  const throat = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.55, 0.4, 24), dark); throat.position.y = 0.15; g.add(throat);
  // Command Module: shiny cone, 3.9 m wide, 3.2 m tall, with its docking probe on top
  const heat = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 0.25, 40), M(0x6b4a2e, 0.3, 0.8)); heat.position.y = 4.12; g.add(heat);
  const cm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 1.95, 3.0, 40), silver); cm.position.y = 5.75; g.add(cm);
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.35, 24), silver); nose.position.y = 7.42; g.add(nose);
  for (const a of [0.6, 2.2]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), M(0x0a0f1a, 0.9, 0.1)); w.position.set(Math.cos(a) * 1.15, 5.7, Math.sin(a) * 1.15); w.lookAt(w.position.clone().multiplyScalar(3).setY(5.7)); g.add(w); }
  const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 0.5, 8), dark); probe.position.y = 7.85; g.add(probe);
  return g;   // spans y = -2.6 … 8.1
}
function buildLM() {   // simple Lunar Module, upright (+Y up), used until the NASA model arrives
  const g = new THREE.Group();
  const gold = M(0xc99a32, 0.85, 0.35, 0x3a2a08), foil = M(0x2a2620, 0.7, 0.5), grey = M(0xb8bcc4, 0.6, 0.45, 0x2a2a2a);
  const desc = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 1.7, 8), gold); desc.position.y = 1.4; g.add(desc);
  const asc = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), grey); asc.scale.set(1.1, 0.85, 1); asc.position.y = 3.3; g.add(asc);
  const tun = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 16), foil); tun.position.y = 4.8; g.add(tun);
  for (let k = 0; k < 4; k++) {                                         // legs folded for the trip
    const a = k * Math.PI / 2 + Math.PI / 4, leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), foil);
    leg.position.set(Math.cos(a) * 2.2, 1.2, Math.sin(a) * 2.2); leg.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); g.add(leg);
  }
  return g;   // y = 0 … 5.1, docking tunnel on top
}

const lmLoader = (() => { let pr; return () => pr ||= new Promise((ok, no) => { const l = new GLTFLoader();
  l.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/').setDecoderConfig({ type: 'wasm' }));
  l.load('models/apollo-lm.glb', g => { g.scene.traverse(c => { if (c.isMesh && c.material) { c.material.side = THREE.FrontSide; if (c.material.emissive && c.material.emissive.getHex() === 0) c.material.emissive.setHex(0x2a2620); } }); ok(g.scene); }, undefined, e => { pr = null; no(e); }); }); })();
SS.apollo = { buildCSM, buildLM, lmLoader, T };
{
  const old = bodies.Apollo11.obj, moon = bodies.Moon.obj, moonPivot = moon.parent;
  const frame = new THREE.Group(); moonPivot.add(frame);                // turns with the Moon (Moon at x = 3, radius 0.27; Earth radius 1)
  if (SS.apolloGroup) { SS.apolloGroup.visible = false; for (const c of SS.apolloGroup.children) if (c.isLine) { c.visible = false; const i = SS.orbitLines.indexOf(c); if (i >= 0) SS.orbitLines.splice(i, 1); } }
  frame.add(old);                                                       // keep the old object (its label & menu entry), swap what it shows
  old.traverse(c => { if (c.isMesh) c.visible = false; });
  // the new stack inside the old holder (which is scaled 0.035): about 0.08 scene units nose to tail
  const stack = new THREE.Group(); stack.scale.setScalar(0.0045 / 0.035); old.add(stack);
  const csm = buildCSM(); stack.add(csm);
  const lmHolder = new THREE.Group(); lmHolder.rotation.x = Math.PI; lmHolder.position.y = 8.1 + 5.1; stack.add(lmHolder);   // LM upside-down, tunnel to the CM nose
  const lmSimple = buildLM(); lmHolder.add(lmSimple);
  stack.position.y = -0.0; stack.children.forEach(c => c.position.y -= 5.3);                   // centre the whole stack on the holder

  // ---------- the route, in the Moon's frame ----------
  const RO = 0.37, MX = 3;                                               // lunar orbit radius, Moon distance
  const orbitPt = (th, out = V()) => out.set(MX - RO * Math.cos(th), 0, -RO * Math.sin(th));   // th = 0 near side, π far side (westward over the near side, as Apollo flew)
  const RE = 1.13;
  const earthPt = (ph, out = V()) => out.set(RE * Math.cos(ph), 0, -RE * Math.sin(ph));        // parking orbit, eastward
  const PH0 = -2.2, PH1 = PH0 + 1.5 * 2 * Math.PI;                       // 1½ turns around Earth before the burn to the Moon
  const out = new THREE.CatmullRomCurve3([earthPt(PH1), V(0.75, 0, 1.12), V(1.45, 0, 0.82), V(2.15, 0, 0.12), V(2.7, 0, -0.42), V(3.2, 0, -0.42), orbitPt(Math.PI)], false, 'centripetal');
  const back = new THREE.CatmullRomCurve3([orbitPt(Math.PI), V(3.3, 0, 0.4), V(2.75, 0, 0.6), V(1.9, 0, 0.3), V(1.15, 0, -0.45), V(0.55, 0, -1.0), V(0.1, 0, -1.04)], false, 'centripetal');
  const dash = (pts, c) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: c, dashSize: 0.05, gapSize: 0.035, transparent: true, opacity: 0.7 })); l.computeLineDistances(); frame.add(l); SS.orbitLines.push(l); return l; };
  const ring = []; for (let i = 0; i <= 96; i++) ring.push(orbitPt(i / 96 * 2 * Math.PI));
  const lines = [dash(out.getSpacedPoints(300), 0xffd27a), dash(ring, 0xffd27a), dash(back.getSpacedPoints(300), 0x9fd0ff)];
  const N_ORB = 6;                                                      // 30 real orbits, shown as 6 so it stays readable at high speed
  const TH_LOI = Math.PI, TH_TEI = Math.PI + N_ORB * 2 * Math.PI;

  // ---------- where is it, which way does it point, which stage is it in ----------
  const P = V(), P2 = V(), D = V(), Y = V(0, 1, 0);
  function stateAt(ms) {
    const f = (a, b) => Math.min(1, Math.max(0, (ms - a) / (b - a)));
    let stage, lm = true;
    if (ms < T.launch) { orbitPt(TH_LOI + 0.6, P); orbitPt(TH_LOI + 0.62, P2); stage = 'park'; }
    else if (ms < T.tli) { const ph = PH0 + (PH1 - PH0) * f(T.launch, T.tli); earthPt(ph, P); earthPt(ph + 0.02, P2); stage = 'earth'; }
    else if (ms < T.loi) { const u = f(T.tli, T.loi); out.getPointAt(u, P); out.getPointAt(Math.min(1, u + 0.004), P2); if (u > 0.996) { out.getPointAt(0.996, P); out.getPointAt(1, P2); } stage = 'coast'; }
    else if (ms < T.tei) { const th = TH_LOI + (TH_TEI - TH_LOI) * f(T.loi, T.tei); orbitPt(th, P); orbitPt(th + 0.02, P2); lm = ms < T.undock; stage = ms < T.undock ? 'orbit' : ms < T.land ? 'descent' : ms < T.liftoff ? 'surface' : ms < T.dock ? 'ascent' : 'orbit2'; }
    else if (ms < T.splash) { const u = f(T.tei, T.splash); back.getPointAt(u, P); back.getPointAt(Math.min(1, u + 0.004), P2); if (u > 0.996) { back.getPointAt(0.996, P); back.getPointAt(1, P2); } lm = false; stage = 'home'; }
    else { orbitPt(TH_LOI + 0.6, P); orbitPt(TH_LOI + 0.62, P2); stage = 'park'; }
    D.subVectors(P2, P).normalize();
    return { stage, lm };
  }
  let stageNow = 'park';
  sim.push(() => {   // runs after the old loop, so it wins
    const p = moon.position; frame.rotation.z = Math.atan2(p.y, p.x);
    const ms = SS.getDate(), s = stateAt(ms);
    old.position.copy(P); old.quaternion.setFromUnitVectors(Y, D);
    lmHolder.visible = s.lm; stageNow = s.stage;
    const live = ms > T.launch && ms < T.splash;
    for (const l of lines) l.material.opacity = live ? 0.85 : 0.5;
  });
  const wp = V(), mp = V();
  bodies.Apollo11.radius = 0.05; bodies.Apollo11.view = 0.45;
  bodies.Apollo11.dir = () => { old.getWorldPosition(wp); moon.getWorldPosition(mp); return wp.sub(mp).normalize().add(V(0, 1.3, 0)).normalize(); };
  const whole = new THREE.Object3D(); whole.position.set(1.6, 0, 0); frame.add(whole);
  bodies.Apollo11Trip = { obj: whole, radius: 2, view: 6.5, selfLit: true, dir: () => { moon.getWorldPosition(mp); bodies.Earth.obj.getWorldPosition(wp); const d = mp.sub(wp).normalize(); return V(0, 1, 0).add(V(-d.z, 0, d.x).multiplyScalar(0.5)).normalize(); } };

  // ---------- NASA's own Lunar Module model, loaded on the first visit ----------
  let loaded = false;
  const loadLM = () => { if (loaded) return; loaded = true; lmLoader().then(m => { lmSimple.visible = false; lmHolder.add(m.clone(true)); }).catch(e => { console.warn('apollo LM', e); loaded = false; }); };

  // ---------- the card: real dates, and what is happening at the shown date ----------
  const STAGE = {
    park: ['Shown in orbit around the Moon. Pick “Apollo 11: the whole trip” to fly it day by day.', "Montré en orbite autour de la Lune. Choisissez « Apollo 11 : tout le voyage » pour le suivre jour après jour."],
    earth: ['Now: in orbit around Earth, checking every system before the burn to the Moon.', "En ce moment : en orbite autour de la Terre, vérification de tous les systèmes avant la poussée vers la Lune."],
    coast: ['Now: coasting to the Moon (3 days), the Lunar Module docked to the nose of Columbia.', "En ce moment : en route vers la Lune (3 jours), le module lunaire arrimé au nez de Columbia."],
    orbit: ['Now: in orbit around the Moon, about 110 km above it.', "En ce moment : en orbite autour de la Lune, à environ 110 km d'altitude."],
    descent: ['Now: the Eagle has undocked and is going down to the surface.', "En ce moment : Eagle s'est détaché et descend vers la surface."],
    surface: ['Now: Eagle is on the Moon. Michael Collins circles alone in Columbia.', "En ce moment : Eagle est sur la Lune. Michael Collins tourne seul à bord de Columbia."],
    ascent: ['Now: Eagle has lifted off and is chasing Columbia to dock again.', "En ce moment : Eagle a redécollé et rejoint Columbia pour s'y amarrer."],
    orbit2: ['Now: all three together again in Columbia; Eagle has been left behind.', "En ce moment : les trois astronautes de nouveau à bord de Columbia ; Eagle a été abandonné."],
    home: ['Now: on the way home (2½ days).', 'En ce moment : sur le chemin du retour (2 jours et demi).'],
  };
  const EN = 'Neil Armstrong, Buzz Aldrin and Michael Collins launched on 16 July 1969. After 3 days they went into orbit around the Moon. On 20 July Armstrong and Aldrin landed in the Lunar Module Eagle and became the first people to walk on the Moon, while Collins stayed in orbit in the Command Module Columbia. They splashed down in the Pacific on 24 July. Gold line: the way out. Blue line: the way home.';
  const FR = "Neil Armstrong, Buzz Aldrin et Michael Collins ont décollé le 16 juillet 1969. Après 3 jours, ils se sont placés en orbite autour de la Lune. Le 20 juillet, Armstrong et Aldrin se sont posés à bord du module lunaire Eagle et sont devenus les premiers humains à marcher sur la Lune, pendant que Collins restait en orbite dans le module de commande Columbia. Ils ont amerri dans le Pacifique le 24 juillet. Ligne dorée : l'aller. Ligne bleue : le retour.";
  info('Apollo11', 'Apollo 11', 'Mission · 16–24 July 1969', 'Earth to the Moon: about 384,000 km', EN);
  if (SS.more.INFO_EN) delete SS.more.INFO_EN.Apollo11;
  const now = l => '<br><b id="a11now" style="display:inline;font-size:13px;color:#ffd27a">' + STAGE[stageNow][l] + '</b>';
  info('Apollo11Trip', 'Apollo 11: the whole trip', 'Mission · 16–24 July 1969', 'Earth → orbit around the Moon → Earth', EN);
  if (SS.more.INFO_EN) delete SS.more.INFO_EN.Apollo11Trip;
  let cur = '';
  const refresh = () => { for (const k of ['Apollo11', 'Apollo11Trip']) { INFO[k].fact = EN + now(0); SS.i18nAdd?.({ fact: { [k]: FR + now(1) } }); } };
  const prev = SS.onFocus;
  SS.onFocus = key => { cur = key; if (key === 'Apollo11' || key === 'Apollo11Trip') { loadLM(); stateAt(SS.getDate()); refresh(); } prev(key); };
  let last = '';
  setInterval(() => {   // keep the "Now:" line up to date while the card is open
    if (cur !== 'Apollo11' && cur !== 'Apollo11Trip') return;
    if (stageNow === last) return; last = stageNow; refresh();
    const el = document.getElementById('a11now'); if (el) el.textContent = STAGE[stageNow][fr() ? 1 : 0];
  }, 500);

  // ---------- menu ----------
  const sp = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Spacecraft');
  const o = document.createElement('option'); o.value = 'A11_trip'; o.textContent = 'Apollo 11: the whole trip (16–24 Jul 1969)';
  const a11 = sp?.querySelector('option[value="Apollo11"]'); a11 ? a11.after(o) : sp?.prepend(o);
  const slow = v => { if ($('speed')) $('speed').value = v; };
  special.A11_trip = () => { SS.setDate(T.launch + 30 * 6e4); slow('0.25'); setTimeout(() => flyTo('Apollo11Trip'), 120); };
}

SS.i18nAdd?.({
  ui: { 'Apollo 11: the whole trip (16–24 Jul 1969)': 'Apollo 11 : tout le voyage (16–24 juil. 1969)' },
  name: { 'Apollo 11: the whole trip': 'Apollo 11 : tout le voyage' },
  cat: { 'Mission · 16–24 July 1969': 'Mission · 16–24 juillet 1969' },
  dist: { 'Earth → orbit around the Moon → Earth': 'Terre → orbite autour de la Lune → Terre' },
});

await import('./apollo2.js' + new URL(import.meta.url).search);
