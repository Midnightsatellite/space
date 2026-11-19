// =====================================================================
// Live space data:
//   ☀ The Sun right now: today's pictures from NASA's Solar Dynamics Observatory, X-ray level and flares,
//     solar wind and the Kp storm level (NOAA Space Weather Prediction Center)
//   🚀 Upcoming rocket launches worldwide with live countdowns (Launch Library 2, The Space Devs)
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const { PL } = SS.extras;
const special = SS.more.special;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const t2 = (F, en, f) => F ? f : en;
const V = (x, y, z) => new THREE.Vector3(x, y, z), D2R = Math.PI / 180;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ago = (ms, F) => { const m = Math.max(0, Math.round((Date.now() - ms) / 60000)); return m < 60 ? t2(F, `${m} min ago`, `il y a ${m} min`) : m < 2880 ? t2(F, `${Math.round(m / 60)} h ago`, `il y a ${Math.round(m / 60)} h`) : t2(F, `${Math.round(m / 1440)} days ago`, `il y a ${Math.round(m / 1440)} jours`); };
let focused = null;
{ const prev = SS.onFocus; SS.onFocus = key => { focused = key; prev(key); }; }

// =====================================================================
// ☀ The Sun right now
// =====================================================================
const sun = { at: 0, data: null, busy: false };
const flareClass = f => { if (!(f > 0)) return '—'; const L = [['X', 1e-4], ['M', 1e-5], ['C', 1e-6], ['B', 1e-7], ['A', 1e-8]]; for (const [c, v] of L) if (f >= v) return c + (f / v).toFixed(1); return 'A0'; };
const flareWords = (c, F) => { const k = String(c)[0]; return { X: t2(F, 'a major flare', 'une éruption majeure'), M: t2(F, 'a medium flare', 'une éruption moyenne'), C: t2(F, 'a small flare', 'une petite éruption') }[k] || t2(F, 'background level', 'niveau de fond'); };
const kpWords = (k, F) => k >= 9 ? t2(F, 'extreme storm (G5)', 'tempête extrême (G5)') : k >= 8 ? t2(F, 'severe storm (G4)', 'tempête sévère (G4)') : k >= 7 ? t2(F, 'strong storm (G3)', 'forte tempête (G3)')
  : k >= 6 ? t2(F, 'moderate storm (G2)', 'tempête modérée (G2)') : k >= 5 ? t2(F, 'minor storm (G1)', 'tempête mineure (G1)') : k >= 4 ? t2(F, 'active', 'actif') : t2(F, 'quiet', 'calme');
async function loadSun() {
  if (sun.busy) return; sun.busy = true;
  const J = u => fetch(u).then(r => r.json()).catch(() => null);
  const [xr, fl, ws, mg, kp] = await Promise.all([J('https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json'), J('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json'),
    J('https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json'), J('https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json'), J('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json')]);
  const long = Array.isArray(xr) ? xr.filter(x => x.energy === '0.1-0.8nm') : [];
  const flares = Array.isArray(fl) ? fl.filter(f => f.max_class) : [];
  const big = flares.slice().sort((a, b) => (b.max_xrlong || 0) - (a.max_xrlong || 0))[0];
  const k = Array.isArray(kp) && kp.length ? kp.at(-1) : null;
  sun.data = { now: long.at(-1)?.flux, nowT: long.at(-1)?.time_tag, big, last: flares.at(-1), speed: Array.isArray(ws) ? ws[0]?.proton_speed : null, bz: Array.isArray(mg) ? mg[0]?.bz_gsm : null,
    kp: k ? (typeof k.Kp === 'number' ? k.Kp : parseFloat(k[1])) : null };
  sun.at = Date.now(); sun.busy = false;
  if (focused === 'SunLive') { INFO.SunLive.fact = sunCard(); SS.onFocus('SunLive'); }
}
function sunCard() {
  const F = fr(), d = sun.data, stamp = Math.floor(Date.now() / 9e5);
  const img = (code, cap) => `<figure style="margin:0;flex:1;text-align:center"><img src="https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_${code}.jpg?t=${stamp}" alt="${esc(cap)}" style="width:100%;border-radius:8px;display:block" loading="lazy"><figcaption style="font-size:10.5px;opacity:.7;margin-top:2px">${cap}</figcaption></figure>`;
  let h = `<div style="display:flex;gap:6px;margin-top:4px">${img('0193', t2(F, 'Corona (ultraviolet)', 'Couronne (ultraviolet)'))}${img('HMIIC', t2(F, 'Surface and sunspots', 'Surface et taches'))}</div>`;
  if (!d) return h + `<div style="margin-top:8px;opacity:.7">⏳ ${t2(F, 'Getting the latest readings…', 'Récupération des dernières mesures…')}</div>`;
  const row = (ic, a, b) => `<div style="margin-top:5px">${ic} <b style="display:inline;font-size:12.5px">${a}</b> ${b}</div>`;
  const now = flareClass(d.now);
  h += row('☀', t2(F, 'X-rays now:', 'Rayons X maintenant :'), `${now} · ${flareWords(now, F)}`);
  if (d.big) h += row('💥', t2(F, 'Biggest flare this week:', 'Plus grosse éruption de la semaine :'), `${esc(d.big.max_class)} · ${ago(Date.parse(d.big.max_time), F)}`);
  if (d.last && d.last !== d.big) h += row('⚡', t2(F, 'Latest flare:', 'Dernière éruption :'), `${esc(d.last.max_class)} · ${ago(Date.parse(d.last.max_time), F)}`);
  if (d.speed != null) h += row('💨', t2(F, 'Solar wind:', 'Vent solaire :'), `${Math.round(d.speed)} km/s${d.bz != null ? ` · Bz ${d.bz} nT${d.bz <= -10 ? t2(F, ' (good for aurora)', ' (favorable aux aurores)') : ''}` : ''}`);
  if (d.kp != null) h += row('🧭', t2(F, 'Magnetic storm level:', 'Niveau d’orage magnétique :'), `Kp ${d.kp.toFixed(1)} · ${kpWords(d.kp, F)}`);
  h += `<div style="font-size:11px;opacity:.65;margin-top:8px">${t2(F, 'Flares are graded A, B, C, M and X, each ten times stronger than the one before. Pictures: NASA/SDO. Readings: NOAA SWPC.', 'Les éruptions sont classées A, B, C, M et X, chacune dix fois plus forte que la précédente. Images : NASA/SDO. Mesures : NOAA SWPC.')}</div>`;
  return h;
}
bodies.SunLive = { obj: bodies.Sun.obj, radius: bodies.Sun.radius, view: bodies.Sun.view || bodies.Sun.radius * 3.2 };
info('SunLive', 'The Sun right now', 'Live data · our star today', 'pictures and readings from the last few minutes', sunCard());
{ const prev = SS.onFocus; SS.onFocus = key => { if (key === 'SunLive') { INFO.SunLive.fact = sunCard(); if (SS.more.INFO_EN?.SunLive) SS.more.INFO_EN.SunLive.fact = INFO.SunLive.fact; if (Date.now() - sun.at > 5 * 6e4) loadSun(); } prev(key); }; }
special.SunLive = () => flyTo('SunLive');

// =====================================================================
// 🚀 Upcoming launches
// =====================================================================
const L = { at: 0, list: [], busy: false, err: false, sel: null };
const CACHE = 'msLaunches2';
async function loadLaunches(force) {
  if (L.busy) return;
  try { const c = JSON.parse(localStorage.getItem(CACHE) || 'null'); if (!force && c && Date.now() - c.t < 20 * 6e4) { L.list = c.list; L.at = c.t; return; } } catch (e) { }
  L.busy = true;
  try {
    const j = await (await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=14&mode=normal')).json();
    if (!j.results) throw 0;
    L.list = j.results.map(x => ({ id: x.id, name: x.name, net: x.net, status: x.status?.abbrev || '', statusName: x.status?.name || '', rocket: x.rocket?.configuration?.full_name || '', lsp: x.launch_service_provider?.name || '',
      mission: x.mission?.name || '', desc: x.mission?.description || '', orbit: x.mission?.orbit?.name || '', pad: x.pad?.name || '', place: x.pad?.location?.name || '',
      lat: parseFloat(x.pad?.latitude), lon: parseFloat(x.pad?.longitude), webcast: x.webcast_live }));
    L.at = Date.now(); L.err = false;
    try { localStorage.setItem(CACHE, JSON.stringify({ t: L.at, list: L.list })); } catch (e) { }
  } catch (e) { L.err = true; }
  L.busy = false;
  if (focused === 'LiveLaunches') { INFO.LiveLaunches.fact = launchCard(); SS.onFocus('LiveLaunches'); }
}
const when = (iso, F) => new Date(iso).toLocaleString(F ? 'fr-FR' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const countdown = (ms, F) => { const s = Math.round((ms - Date.now()) / 1000), a = Math.abs(s), d = Math.floor(a / 86400), h = Math.floor(a % 86400 / 3600), m = Math.floor(a % 3600 / 60), ss = a % 60;
  const txt = (d ? `${d}${t2(F, 'd', 'j')} ` : '') + `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; return s >= 0 ? `T−${txt}` : `T+${txt}`; };
const STATUS = { Go: ['Go for launch', 'Feu vert'], TBC: ['To be confirmed', 'À confirmer'], TBD: ['Date not fixed', 'Date non fixée'], Hold: ['On hold', 'En attente'], 'In Flight': ['In flight', 'En vol'], Success: ['Success', 'Réussi'], Failure: ['Failure', 'Échec'] };
function launchCard() {
  const F = fr();
  if (!L.list.length) return L.err ? `<div style="color:#ff9090">${t2(F, 'Couldn’t load the launch list, try again later.', 'Liste des lancements indisponible, réessayez plus tard.')}</div>` : `<div style="opacity:.7">⏳ ${t2(F, 'Getting the launch list…', 'Récupération des lancements…')}</div>`;
  const list = L.list.filter(x => Date.parse(x.net) > Date.now() - 3 * 36e5).slice(0, 10);
  return list.map((x, i) => { const st = STATUS[x.status]?.[F ? 1 : 0] || x.statusName, go = x.status === 'Go';
    return `<div style="margin-top:7px;padding-top:6px;border-top:1px solid rgba(140,160,255,.15)"><a href="#" data-launch="${esc(x.id)}" style="color:#9fd0ff"><b style="display:inline;font-size:12.5px">🚀 ${esc(x.name)}</b></a>
      <div style="font-size:12px">${esc(when(x.net, F))} · <span data-net="${esc(x.net)}" style="font-variant-numeric:tabular-nums;color:${go ? '#7be07b' : '#ffd27a'}">${countdown(Date.parse(x.net), F)}</span></div>
      <div style="font-size:11.5px;opacity:.75">${esc(x.place)}${st ? ` · ${esc(st)}` : ''}</div></div>`; }).join('')
    + `<div style="font-size:11px;opacity:.6;margin-top:8px">${t2(F, 'Times in your own time zone. Launch dates often slip. Data: The Space Devs (Launch Library 2).', 'Heures dans votre fuseau horaire. Les dates glissent souvent. Données : The Space Devs (Launch Library 2).')}</div>`;
}
bodies.LiveLaunches = { obj: bodies.Earth.obj, radius: bodies.Earth.radius, view: (PL.Earth.tilted.children[0].geometry.parameters.radius) * 3.4 };
info('LiveLaunches', 'Upcoming rocket launches', 'Live data · launches worldwide', 'the next rockets to leave Earth', launchCard());
{ const prev = SS.onFocus; SS.onFocus = key => { if (key === 'LiveLaunches') { INFO.LiveLaunches.fact = launchCard(); if (SS.more.INFO_EN?.LiveLaunches) SS.more.INFO_EN.LiveLaunches.fact = INFO.LiveLaunches.fact; if (Date.now() - L.at > 20 * 6e4) loadLaunches(); } prev(key); }; }
special.LiveLaunches = () => { loadLaunches(); flyTo('LiveLaunches'); };
setInterval(() => { const F = fr(); for (const el of document.querySelectorAll('[data-net]')) el.textContent = countdown(Date.parse(el.dataset.net), F); }, 1000);

// a pin at the launch pad, and a card for one launch
const earthMesh = PL.Earth.tilted.children[0], R = earthMesh.geometry.parameters.radius;
const local = (lat, lon) => { const a = lat * D2R, o = lon * D2R; return V(Math.cos(a) * Math.cos(o), Math.sin(a), -Math.cos(a) * Math.sin(o)); };
const padPin = new THREE.Group(); earthMesh.add(padPin); padPin.visible = false;
{ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.font = '100px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🚀', 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true })); s.scale.setScalar(R * 0.06); s.center.set(0.5, 0.15); padPin.add(s); }
bodies.LaunchPad = { obj: padPin, radius: R * 0.02, view: R * 1.7, dir: () => padPin.getWorldPosition(V()).sub(earthMesh.getWorldPosition(V())).normalize().add(V(0, 0.15, 0)).normalize() };
function showLaunch(id) {
  const x = L.list.find(l => l.id === id); if (!x) return; const F = fr();
  if (isFinite(x.lat)) { padPin.position.copy(local(x.lat, x.lon).multiplyScalar(R * 1.01)); padPin.visible = true; }
  info('LaunchPad', '🚀 ' + x.name, t2(F, 'Upcoming launch', 'Prochain lancement'), esc(`${x.pad}, ${x.place}`),
    `<div style="font-size:13px"><span data-net="${esc(x.net)}" style="font-variant-numeric:tabular-nums">${countdown(Date.parse(x.net), F)}</span> · ${esc(when(x.net, F))}</div>
     <div style="margin-top:5px">${t2(F, 'Rocket', 'Fusée')}: ${esc(x.rocket)} · ${esc(x.lsp)}</div>
     ${x.orbit && x.orbit !== 'Unknown' ? `<div>${t2(F, 'Orbit', 'Orbite')}: ${esc(x.orbit)}</div>` : ''}
     ${x.desc && x.desc !== 'Details TBD.' ? `<div style="margin-top:5px;font-size:12px;opacity:.85">${esc(x.desc)}</div>` : ''}
     <div style="margin-top:7px"><a href="#" data-back-launches="1">${t2(F, '← All upcoming launches', '← Tous les prochains lancements')}</a></div>`);
  flyTo('LaunchPad');
}
document.addEventListener('click', e => {
  const a = e.target.closest?.('[data-launch]'); if (a) { e.preventDefault(); showLaunch(a.dataset.launch); return; }
  const b = e.target.closest?.('[data-back-launches]'); if (b) { e.preventDefault(); padPin.visible = false; flyTo('LiveLaunches'); }
});
{ const prev = SS.onFocus; SS.onFocus = key => { if (key !== 'LaunchPad') padPin.visible = false; prev(key); }; }

// ---------------------------------------------------------------- menu and French
{ focusSel.querySelector('option[value="Launches"]')?.remove();   // the live list replaces the hand-made one
  const views = focusSel.querySelector('optgroup'); let after = views.querySelector('option[value="LiveWeather"]') || views.lastElementChild;
  for (const [k, t] of [['SunLive', '☀ The Sun right now'], ['LiveLaunches', '🚀 Upcoming rocket launches']]) { const o = document.createElement('option'); o.value = k; o.textContent = t; after.after(o); after = o; } }
SS.i18nAdd?.({
  ui: { '☀ The Sun right now': '☀ Le Soleil en ce moment', '🚀 Upcoming rocket launches': '🚀 Prochains lancements de fusées' },
  name: { '☀ The Sun right now': '☀ Le Soleil en ce moment', '🚀 Upcoming rocket launches': '🚀 Prochains lancements de fusées', 'The Sun right now': 'Le Soleil en ce moment', 'Upcoming rocket launches': 'Prochains lancements de fusées' },
  cat: { 'Live data · our star today': 'Données en direct · notre étoile aujourd’hui', 'Live data · launches worldwide': 'Données en direct · lancements dans le monde' },
  dist: { 'pictures and readings from the last few minutes': 'images et mesures des dernières minutes', 'the next rockets to leave Earth': 'les prochaines fusées à quitter la Terre' },
});
SS.live = { loadSun, loadLaunches, sun, L, showLaunch };
