// =====================================================================
// Apophis 2029 · Ride a beam of light · install as an app · feature counting · phone layout
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { scene, camera, bodies, sim, flyTo, focusSel, addLabel, glowSprite } = SS;
const { info, INFO } = SS.cosmos;
const { nearLabel, PL, lumpy, auToScene } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const special = SS.more.special;
const nf = (n, d = 0) => n.toLocaleString(fr() ? 'fr-FR' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
const addOpt = (group, k, t, first) => { const og = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === group) || focusSel.querySelector('optgroup'); const o = document.createElement('option'); o.value = k; o.textContent = t; first ? og.prepend(o) : og.appendChild(o); };

// =====================================================================
// 1. APOPHIS: the asteroid that skims past Earth on Friday 13 April 2029
// =====================================================================
const CLOSEST = Date.UTC(2029, 3, 13, 21, 46);
{
  const holder = bodies.Earth.obj;                                     // Earth's centre, not spinning
  const grp = new THREE.Group(); holder.add(grp); grp.visible = false;
  // closest point on the night side, a little north, just inside the ring of TV satellites (squeezed scale)
  const rock = new THREE.Mesh(lumpy ? lumpy(0.035, 0.35, 99) : new THREE.IcosahedronGeometry(0.035, 1), new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 1 }));
  const ap = new THREE.Group(); ap.add(rock); ap.add(glowSprite(0.12, 'rgba(255,190,140,0.9)', 'rgba(0,0,0,0)', 0.7)); grp.add(ap);
  nearLabel(ap, '☄ Apophis · 13 Apr 2029', 0.12, 'Apophis2029', 'craft', 12);
  const R0 = 1.42, sp = 0.55;                                          // closest distance, speed (scene units per hour)
  const c = V(), dir = V(), side = V();
  const pathPts = [];
  const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: 0xffb37a, dashSize: 0.05, gapSize: 0.04, transparent: true, opacity: 0.8 })); grp.add(line);
  const geo = new THREE.Mesh(new THREE.TorusGeometry(1.61, 0.004, 6, 160), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.5 })); geo.rotation.x = Math.PI / 2; grp.add(geo);
  const gl = new THREE.Object3D(); gl.position.set(1.61, 0, 0); geo.add(gl); addLabel(gl, 'TV & weather satellites (36,000 km)', 0.05, 'Apophis2029', 'craft');
  let built = false;
  function build() {                                                    // fix the geometry once, from where the Sun is at the flyby
    const e = V(); holder.getWorldPosition(e); const night = e.clone().normalize();   // away from the Sun
    const local = holder.worldToLocal(e.clone().add(night)).normalize();
    c.copy(local).add(V(0, 0.35, 0)).normalize().multiplyScalar(R0);
    dir.copy(V(0, 1, 0).cross(c).normalize()).applyAxisAngle(c.clone().normalize(), -0.5).normalize();
    // the path bends a little around Earth (gravity pulls it in)
    pathPts.length = 0; for (let h = -9; h <= 9; h += 0.2) pathPts.push(pos(h, V()));
    line.geometry.setFromPoints(pathPts); line.computeLineDistances(); built = true;
  }
  function pos(h, out) { const bend = 0.12 * Math.exp(-h * h / 6); return out.copy(c).addScaledVector(dir, h * sp).addScaledVector(c.clone().normalize(), -bend); }
  sim.push(dt => {
    if (!grp.visible) return;
    if (!built) build();
    const h = (SS.getDate() - CLOSEST) / 36e5;
    pos(Math.max(-9, Math.min(9, h)), ap.position); rock.rotation.y += dt * 0.5; rock.rotation.x += dt * 0.2;
  });
  bodies.Apophis2029 = { obj: ap, radius: 0.05, view: 3.4, dir: () => { const w = V(); holder.getWorldPosition(w); return w.clone().normalize().add(V(0, 0.9, 0)).normalize(); } };
  const card = () => { const F = fr(), d = Math.ceil((CLOSEST - Date.now()) / 864e5);
    return (d > 0 ? `<b style="display:inline;font-size:13px;color:#ffd27a">⏳ ${F ? `Dans ${nf(d)} jours` : `In ${nf(d)} days`}</b><br>` : '') + (F
      ? "Le vendredi 13 avril 2029, vers 21 h 46 UTC, l'astéroïde Apophis, à peu près de la taille de la tour Eiffel, passera à environ 32 000 km au-dessus de la Terre : plus près que les satellites de télévision et de météo. Environ deux milliards de personnes en Europe, en Afrique et dans une partie de l'Asie pourront le voir à l'œil nu, comme une étoile qui se déplace. Aucun danger : il ne touchera pas la Terre avant au moins 100 ans."
      : "On Friday 13 April 2029, around 21:46 UTC, asteroid Apophis, roughly the size of the Eiffel Tower, will pass about 32,000 km above Earth: closer than our TV and weather satellites. About two billion people across Europe, Africa and parts of Asia could see it with the naked eye, as a star slowly moving across the sky. It is completely safe: it cannot hit Earth for at least the next 100 years."); };
  info('Apophis2029', 'Apophis flies past Earth', 'Asteroid flyby · 13 April 2029', 'about 32,000 km above Earth', card());
  special.Apophis2029 = () => { SS.setDate(CLOSEST - 6 * 36e5); $('speed').value = '0.0416667'; const au = $('auto'); if (au.checked) { au.checked = false; au.dispatchEvent(new Event('change')); } SS.controls.autoRotate = false; grp.visible = true; built = false; setTimeout(() => flyTo('Apophis2029'), 300); };
  { const prev = SS.onFocus; SS.onFocus = key => { if (key === 'Apophis2029') { INFO.Apophis2029.fact = card(); if (SS.more.INFO_EN?.Apophis2029) SS.more.INFO_EN.Apophis2029.fact = INFO.Apophis2029.fact; } else grp.visible = false; prev(key); }; }
  addOpt('Events', 'Apophis2029', '☄ Apophis flies past Earth · 13 Apr 2029', true);
}

// =====================================================================
// 2. RIDE A BEAM OF LIGHT from the Sun to the edge of the planets
// =====================================================================
{
  const AU_S = 499.005;                                                 // seconds light takes to cross 1 AU
  const STOPS = [['Mercury', 0.387, 'Mercure'], ['Venus', 0.723, 'Vénus'], ['Earth', 1, 'la Terre'], ['Mars', 1.524, 'Mars'], ['Jupiter', 5.203, 'Jupiter'],
    ['Saturn', 9.537, 'Saturne'], ['Uranus', 19.19, 'Uranus'], ['Neptune', 30.07, 'Neptune'], ['Pluto', 39.5, 'Pluton']];
  const css = document.createElement('style');
  css.textContent = `#lightHud{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:20;display:none;background:rgba(10,14,30,.82);border:1px solid rgba(255,210,122,.35);border-radius:14px;padding:10px 16px;text-align:center;color:#e8ecff;font-size:13px;min-width:min(420px,92vw)}
  #lightHud.on{display:block} #lightHud .t{font:700 26px/1.1 ui-monospace,Menlo,monospace;color:#fff6d0} #lightHud .p{color:#ffd27a;font-weight:600;margin:4px 0;min-height:1.2em}
  #lightHud button{margin:6px 3px 0} #lightHud button.sel{border-color:#ffd27a;color:#ffd27a}`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'lightHud'; document.body.appendChild(hud);
  const photon = new THREE.Group(); photon.visible = false; scene.add(photon);
  photon.add(glowSprite(1.4, 'rgba(255,255,240,1)', 'rgba(255,220,120,0)', 1)); photon.add(glowSprite(4, 'rgba(255,230,160,0.5)', 'rgba(0,0,0,0)', 0.6));
  const trailG = new THREE.BufferGeometry().setFromPoints([V(), V()]);
  const trail = new THREE.Line(trailG, new THREE.LineBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0.8 })); trail.visible = false; scene.add(trail);
  let on = false, tSec = 0, mult = 60, dir = V(1, 0, 0), passed = -1, last = 0;
  const hms = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = Math.floor(s % 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; };
  function drawHud() {
    const F = fr(), au = tSec / AU_S, km = au * 149597870.7;
    const st = passed >= 0 ? STOPS[passed] : null, nx = STOPS[passed + 1];
    hud.innerHTML = `<div style="font-size:11px;letter-spacing:.15em;opacity:.7">${F ? '⚡ À LA VITESSE DE LA LUMIÈRE' : '⚡ AT THE SPEED OF LIGHT'}</div>
      <div class="t">${hms(tSec)}</div><div>${km < 1e9 ? `${nf(km / 1e6, 1)} ${F ? 'millions de km' : 'million km'}` : `${nf(km / 1e9, 2)} ${F ? 'milliards de km' : 'billion km'}`} ${F ? 'depuis le Soleil' : 'from the Sun'}</div>
      <div class="p">${st ? (F ? `✓ Orbite de ${st[2]} passée` : `✓ Passed ${st[0]}'s orbit`) : ''}${nx ? ` · ${F ? `${nx[2]} dans` : `${nx[0]} in`} ${hms((nx[1] * AU_S - tSec) / 1)}` : (F ? " · Prochain arrêt : Voyager 1, à environ 24 h de lumière, puis l'étoile la plus proche, à 4,2 ans." : ' · Next: Voyager 1, about 24 light-hours away, then the nearest star, 4.2 years.')}</div>
      <div>${[1, 60, 600].map(m => `<button type="button" data-m="${m}" class="${m === mult ? 'sel' : ''}">${m === 1 ? (F ? 'Vitesse réelle' : 'Real speed') : '×' + m}</button>`).join('')}<button type="button" id="lightX">✕ ${F ? 'Quitter' : 'Exit'}</button></div>`;
    for (const b of hud.querySelectorAll('button[data-m]')) b.onclick = () => { mult = +b.dataset.m; drawHud(); };
    $('lightX').onclick = stop;
  }
  const want = V(), look = V(), sunP = V();
  function frame(dt) {
    tSec += dt * mult;
    const au = Math.min(tSec / AU_S, 41); if (tSec / AU_S >= 41) mult = 0;
    const r = auToScene(au); photon.position.copy(dir).multiplyScalar(r);
    const p = trailG.attributes.position; p.setXYZ(0, 0, 0, 0); p.setXYZ(1, photon.position.x, photon.position.y, photon.position.z); p.needsUpdate = true;
    while (passed + 1 < STOPS.length && au >= STOPS[passed + 1][1]) passed++;
    const back = 6 + r * 0.25;
    want.copy(photon.position).addScaledVector(dir, -back).add(V(0, back * 0.35, 0));
    camera.position.lerp(want, Math.min(1, dt * 3)); look.copy(photon.position).addScaledVector(dir, back * 0.6); camera.lookAt(look);
    const now = performance.now(); if (now - last > 200) { last = now; drawHud(); }
  }
  function start() {
    // aim the beam at where Earth is now, so it passes close to home
    const e = V(); bodies.Earth.obj.getWorldPosition(e); dir.copy(e).setY(0).normalize();
    tSec = 0; passed = -1; mult = 60; on = true; photon.visible = trail.visible = true; hud.classList.add('on');
    $('info').style.display = 'none'; document.body.classList.add('lightride');
    SS.cameraOverride = (dt) => { const s = Math.min(0.1, dt); frame(s); }; drawHud();
  }
  function stop() { if (!on) return; on = false; SS.cameraOverride = null; photon.visible = trail.visible = false; hud.classList.remove('on'); document.body.classList.remove('lightride'); SS.controls.target.set(0, 0, 0); flyTo('overview'); }
  addEventListener('keydown', e => { if (on && e.key === 'Escape') stop(); });
  special.LightRide = start;
  const views = focusSel.querySelector('optgroup'); const o = document.createElement('option'); o.value = 'LightRide'; o.textContent = '⚡ Ride a beam of light'; views.appendChild(o);
  { const st = document.createElement('style'); st.textContent = 'body.lightride #ui,body.lightride #info,body.lightride #hint{display:none!important}'; document.head.appendChild(st); }
  SS.more.lightRide = { start, stop };
}

// =====================================================================
// 3. INSTALL AS AN APP (home screen icon, full screen)
// =====================================================================
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });

// =====================================================================
// 4. COUNT WHICH FEATURES PEOPLE USE (GoatCounter events: no personal data)
// =====================================================================
{
  const count = (name, title) => { try { window.goatcounter?.count?.({ path: 'ev-' + name, title: title || name, event: true }); } catch (e) { } };
  const BTN = { radioPill: 'radio', postBtn: 'postcard', installBtn: 'install', quizBtn: 'quiz', ageBtn: 'age-in-space', cineBtn: 'cinema', photoBtn: 'photo-mode', factBtn: 'one-fact', langBtn: 'language', ageShare: 'share-age', qShare: 'share-quiz', vgGold: 'golden-record', glowOn: 'glow-toggle', swarmsOn: 'swarms-toggle' };
  document.addEventListener('click', e => { const b = e.target.closest('button,input,a'); if (!b) return; if (BTN[b.id]) count(BTN[b.id]); else if (b.classList.contains('share')) count('share-link'); else if (b.href?.includes('youtube')) count('youtube-link'); else if (b.href?.includes('plus.nasa.gov')) count('nasa-plus'); }, true);
  const prevGo = SS.go; SS.go = k => { if (k && !document.body.classList.contains('cinema')) count('go-' + k, k); prevGo(k); }; focusSel.onchange = e => SS.go(e.target.value);
}

// =====================================================================
// 5. PHONE LAYOUT: the panel folds into a button on small screens
// =====================================================================
{
  const st = document.createElement('style');
  st.textContent = `#uiToggle{display:none}
  @media (max-width:760px), (max-height:520px){
    #uiToggle{display:block;position:fixed;left:10px;bottom:10px;z-index:15;padding:9px 14px;border-radius:999px;font-size:14px}
    #ui{display:none!important;max-height:72vh;overflow:auto;left:8px!important;right:8px;bottom:58px!important;max-width:none!important}
    body.uiopen #ui{display:flex!important}
    #info{max-width:62vw!important;font-size:12px!important;top:40px!important;right:8px!important;max-height:45vh;overflow:auto}
    #hint{display:none!important}
    #note{font-size:9px!important;bottom:52px!important;left:8px!important;right:8px!important;text-align:center;opacity:.7}
    #radioPill{bottom:10px!important;right:10px!important;padding:8px 12px!important;font-size:12px!important}
    .pop .box{font-size:13px}
  }`;
  document.head.appendChild(st);
  const b = document.createElement('button'); b.id = 'uiToggle'; b.type = 'button'; document.body.appendChild(b);
  const label = () => { b.textContent = document.body.classList.contains('uiopen') ? (fr() ? '✕ Fermer' : '✕ Close') : (fr() ? '☰ Menu' : '☰ Menu'); };
  b.onclick = () => { document.body.classList.toggle('uiopen'); label(); }; label();
  const small = () => matchMedia('(max-width:760px), (max-height:520px)').matches;
  focusSel.addEventListener('change', () => { if (small()) { document.body.classList.remove('uiopen'); label(); } });
  $('langBtn')?.addEventListener('click', () => setTimeout(label, 50));
}

// ---------- One Fact cards & French ----------
{
  const F = SS.more.FACTS, FR = SS.more.FACTS_FR;
  const add = (en, frc) => { F.push(en); if (FR) FR[F.length - 1] = frc; };
  add(['Apophis2029', 'An asteroid will fly below our satellites', 'On 13 April 2029, Apophis passes about 32,000 km above Earth, closer than TV satellites, and is safe.'],
    ['Un astéroïde passera sous nos satellites', "Le 13 avril 2029, Apophis passera à environ 32 000 km de la Terre, plus près que les satellites de télévision, sans danger."]);
  add(['Sun', 'Sunlight is 8 minutes old', 'Light from the Sun takes about 8 minutes 20 seconds to reach us, so we always see the Sun as it was a little while ago.'],
    ['La lumière du Soleil a 8 minutes', "La lumière du Soleil met environ 8 minutes et 20 secondes à nous parvenir : on voit toujours le Soleil tel qu'il était un peu plus tôt."]);
}
SS.i18nAdd?.({
  ui: { '☄ Apophis flies past Earth · 13 Apr 2029': '☄ Apophis frôle la Terre · 13 avr. 2029', '⚡ Ride a beam of light': '⚡ Chevaucher un rayon de lumière' },
  name: { 'Apophis flies past Earth': 'Apophis frôle la Terre', '☄ Apophis · 13 Apr 2029': '☄ Apophis · 13 avr. 2029', 'TV & weather satellites (36,000 km)': 'Satellites TV et météo (36 000 km)' },
  cat: { 'Asteroid flyby · 13 April 2029': "Passage d'astéroïde · 13 avril 2029" },
  dist: { 'about 32,000 km above Earth': 'à environ 32 000 km de la Terre' },
});
await import('./visuals2.js' + new URL(import.meta.url).search);
