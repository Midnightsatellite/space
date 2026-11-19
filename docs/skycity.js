// =====================================================================
// Tonight from my city: pick any city (or use your location) for the Tonight card and the night-sky view,
// with sunset, darkness and sunrise times there, and the Space Station's visible passes over it
// (computed in the browser from today's orbit data, CelesTrak, with satellite.js).
// =====================================================================
import * as sat from './satellite.min.js';
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const special = SS.more.special;
const obs = SS.extras.observer;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const t2 = (F, en, f) => F ? f : en;
const D2R = Math.PI / 180, R2D = 180 / Math.PI, J2000 = Date.UTC(2000, 0, 1, 12), RE = 6371;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
obs.tz = obs.tz || 'Europe/London';
try { const o = JSON.parse(localStorage.getItem('msObserver') || 'null'); if (o && isFinite(o.lat) && isFinite(o.lon)) Object.assign(obs, o); } catch (e) { }
let focused = null;
{ const prev = SS.onFocus; SS.onFocus = key => { focused = key; prev(key); }; }
const cityName = F => esc(F ? (obs.nameFr || obs.name) : obs.name);

// ---------------------------------------------------------------- the Sun from the observer
function sunEci(t) { const d = (t - J2000) / 864e5, L = SS.astro.sunLon(d) * D2R, e = 23.439 * D2R; return [Math.cos(L), Math.cos(e) * Math.sin(L), Math.sin(e) * Math.sin(L)]; }
function sunAlt(t) { const [x, y, z] = sunEci(t), ra = Math.atan2(y, x), dec = Math.asin(z), g = sat.gstime(new Date(t)), H = g + obs.lon * D2R - ra, la = obs.lat * D2R;
  return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H)) * R2D; }
function crossing(t0, t1, level, down) { let p = sunAlt(t0) - level;   // first time the Sun crosses `level` going down (or up)
  for (let t = t0 + 12e4; t <= t1; t += 12e4) { const v = sunAlt(t) - level; if (down ? p > 0 && v <= 0 : p < 0 && v >= 0) { let a = t - 12e4, b = t; for (let k = 0; k < 12; k++) { const m = (a + b) / 2, w = sunAlt(m) - level; (down ? w > 0 : w < 0) ? a = m : b = m; } return b; } p = v; }
  return null; }
const hhmm = t => { try { return new Date(t).toLocaleTimeString(fr() ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit', timeZone: obs.tz }); } catch (e) { return new Date(t).toLocaleTimeString(fr() ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' }); } };
const dayname = t => { try { return new Date(t).toLocaleDateString(fr() ? 'fr-FR' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: obs.tz }); } catch (e) { return new Date(t).toDateString(); } };
function sunTimes() {
  const now = Date.now(), night = sunAlt(now) < -0.833;
  const set = night ? crossing(now - 20 * 36e5, now, -0.833, true) : crossing(now, now + 30 * 36e5, -0.833, true);
  if (!set) return null;
  return { set, dark: crossing(set, set + 6 * 36e5, -12, true), rise: crossing(set, set + 30 * 36e5, -0.833, false) };
}

// ---------------------------------------------------------------- the Space Station's passes
let rec = null, tleAt = 0, passes = null, passesFor = '';
async function loadTLE() {
  try { const c = JSON.parse(localStorage.getItem('msIssTle') || 'null'); if (c && Date.now() - c.t < 6 * 36e5) { rec = sat.twoline2satrec(c.l1, c.l2); tleAt = c.t; return true; } } catch (e) { }
  try { const txt = await (await fetch('https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE')).text(); const lines = txt.trim().split(/\r?\n/).map(s => s.trim());
    const l1 = lines.find(l => l.startsWith('1 ')), l2 = lines.find(l => l.startsWith('2 ')); if (!l1 || !l2) return false;
    rec = sat.twoline2satrec(l1, l2); tleAt = Date.now(); try { localStorage.setItem('msIssTle', JSON.stringify({ t: tleAt, l1, l2 })); } catch (e) { } return true; } catch (e) { return false; }
}
const COMPASS = { en: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'], fr: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'] };
const dir = az => COMPASS[fr() ? 'fr' : 'en'][Math.round(((az % 360) + 360) % 360 / 22.5) % 16];
function computePasses(hours = 72) {
  if (!rec) return [];
  const gd = { longitude: obs.lon * D2R, latitude: obs.lat * D2R, height: 0.05 }, out = []; let cur = null;
  for (let t = Date.now() - 6e4 * 5; t < Date.now() + hours * 36e5; t += 20000) {
    const date = new Date(t), pv = sat.propagate(rec, date); if (!pv || !pv.position) continue;
    const p = pv.position, g = sat.gstime(date), la = sat.ecfToLookAngles(gd, sat.eciToEcf(p, g)), el = la.elevation * R2D;
    let vis = false;
    if (el > 10) { const s = sunEci(t), dot = p.x * s[0] + p.y * s[1] + p.z * s[2], r2 = p.x * p.x + p.y * p.y + p.z * p.z, lit = dot > 0 || Math.sqrt(Math.max(0, r2 - dot * dot)) > RE;
      vis = lit && sunAlt(t) < -6; }
    if (vis) { const az = la.azimuth * R2D; if (!cur) cur = { start: t, from: az, max: el, end: t, to: az }; else { cur.end = t; cur.to = az; if (el > cur.max) cur.max = el; } }
    else if (cur) { if (cur.end - cur.start >= 40000) out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out;
}
async function ensurePasses() {
  const key = `${obs.lat.toFixed(2)},${obs.lon.toFixed(2)}`;
  if (passes && passesFor === key) return;
  passes = 'busy'; passesFor = key;
  if (!rec || Date.now() - tleAt > 6 * 36e5) { const ok = await loadTLE(); if (!ok) { passes = 'err'; refresh(); return; } }
  await new Promise(r => setTimeout(r, 30));
  passes = computePasses(); refresh();
}
function passList(max, F) {
  if (passes === 'busy' || passes == null) return `<div style="opacity:.7">⏳ ${t2(F, 'Working out the passes…', 'Calcul des passages…')}</div>`;
  if (passes === 'err') return `<div style="opacity:.7">${t2(F, 'Couldn’t get today’s orbit data, try again later.', 'Données d’orbite indisponibles, réessayez plus tard.')}</div>`;
  if (!passes.length) return `<div style="opacity:.75">${t2(F, 'No visible passes in the next 3 days (it has to be dark for you, with the station still in sunlight).', 'Aucun passage visible dans les 3 prochains jours (il faut qu’il fasse nuit chez vous et que la station soit encore au soleil).')}</div>`;
  return passes.slice(0, max).map(p => { const mins = Math.max(1, Math.round((p.end - p.start) / 6e4)), bright = p.max > 50;
    return `<div style="margin-top:3px;font-size:12.5px">🛰 <b style="display:inline;font-size:12.5px">${dayname(p.start)} ${hhmm(p.start)}</b> · ${mins} min · ${t2(F, 'from', 'du')} ${dir(p.from)} ${t2(F, 'to', 'au')} ${dir(p.to)}, ${t2(F, 'up to', 'jusqu’à')} ${Math.round(p.max)}°${bright ? ` <span style="color:#ffd27a">★ ${t2(F, 'very bright', 'très brillant')}</span>` : ''}</div>`; }).join('');
}

// ---------------------------------------------------------------- the city block shown in the cards
function cityBlock(F, passMax) {
  const st = sunTimes();
  const sun = st ? `🌇 ${t2(F, 'Sunset', 'Coucher')} ${hhmm(st.set)}${st.dark ? ` · 🌌 ${t2(F, 'dark from', 'nuit noire dès')} ${hhmm(st.dark)}` : ` · 🌌 ${t2(F, 'never fully dark', 'jamais tout à fait noir')}`}${st.rise ? ` · 🌄 ${t2(F, 'sunrise', 'lever')} ${hhmm(st.rise)}` : ''}`
    : (sunAlt(Date.now()) > 0 ? `☀ ${t2(F, 'The Sun doesn’t set here today', 'Le Soleil ne se couche pas ici aujourd’hui')}` : `🌑 ${t2(F, 'Polar night: the Sun doesn’t rise today', 'Nuit polaire : le Soleil ne se lève pas aujourd’hui')}`);
  return `<div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(140,160,255,.2)">
    <div>📍 <b style="display:inline;font-size:13px">${cityName(F)}</b> · <a href="#" id="tnChange">${t2(F, 'change city', 'changer de ville')}</a></div>
    <div id="tnPick" style="display:none;margin-top:4px">
      <input id="tnSearch" type="search" autocomplete="off" placeholder="${t2(F, 'Type a city…', 'Tapez une ville…')}" style="width:100%;box-sizing:border-box;background:#141a33;color:#e6ebff;border:1px solid #2c3766;border-radius:6px;padding:4px 7px;font-size:13px">
      <div id="tnRes" style="margin-top:2px"></div>
      <button type="button" id="tnGeo" style="margin-top:4px">📍 ${t2(F, 'Use my location', 'Utiliser ma position')}</button></div>
    <div style="margin-top:5px;font-size:12.5px">${sun}</div>
    <div style="margin-top:6px"><b style="display:inline;font-size:12.5px">🛰 ${t2(F, 'Space Station passes you can see', 'Passages visibles de la Station spatiale')}</b></div>
    ${passList(passMax, F)}
    <div style="font-size:10.5px;opacity:.6;margin-top:5px">${t2(F, 'Times are local to the city. The station looks like a bright star gliding across the sky with no blinking lights. Orbit data: CelesTrak.', 'Heures locales de la ville. La station ressemble à une étoile brillante qui glisse dans le ciel, sans clignoter. Données d’orbite : CelesTrak.')}</div></div>`;
}
SS.tonightExtra = () => { ensurePasses(); return cityBlock(fr(), 3); };

// a card of its own for the passes, on the Space Station
bodies.ISSPasses = { obj: bodies.ISS.obj, radius: bodies.ISS.radius, view: bodies.ISS.view || 0.22, dir: bodies.ISS.dir };
const passCard = () => cityBlock(fr(), 8);
info('ISSPasses', 'Space Station passes over your city', 'Live data · when to look up', 'the next 3 days', passCard());
{ const prev = SS.onFocus; SS.onFocus = key => { if (key === 'ISSPasses') { ensurePasses(); INFO.ISSPasses.fact = passCard(); if (SS.more.INFO_EN?.ISSPasses) SS.more.INFO_EN.ISSPasses.fact = INFO.ISSPasses.fact; } prev(key); }; }
special.ISSPasses = () => { SS.setDate(Date.now()); flyTo('ISSPasses'); };
function refresh() { if (focused === 'Tonight' || focused === 'ISSPasses') SS.onFocus(focused); }
function setObserver(o) {
  Object.assign(obs, o); passes = null; passesFor = '';
  try { localStorage.setItem('msObserver', JSON.stringify({ name: obs.name, nameFr: obs.nameFr, lat: obs.lat, lon: obs.lon, tz: obs.tz })); } catch (e) { }
  renameMenus(); refresh();
}

// ---------------------------------------------------------------- picking a city (Open-Meteo geocoding), or the visitor's own location
let tmr = 0, results = [];
document.addEventListener('click', e => {
  if (e.target.id === 'tnChange') { e.preventDefault(); const p = $('tnPick'); if (p) { p.style.display = p.style.display === 'none' ? 'block' : 'none'; $('tnSearch')?.focus(); } return; }
  if (e.target.id === 'tnGeo') { e.preventDefault(); if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(p => setObserver({ name: 'your location', nameFr: 'votre position', lat: p.coords.latitude, lon: p.coords.longitude, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      () => { const r = $('tnRes'); if (r) r.textContent = t2(fr(), 'Location not available.', 'Position indisponible.'); }, { timeout: 10000 }); return; }
  const c = e.target.closest?.('[data-tn]'); if (c) { e.preventDefault(); const r = results[+c.dataset.tn]; if (r) setObserver(r); }
});
document.addEventListener('input', e => {
  if (e.target.id !== 'tnSearch') return; const q = e.target.value.trim(); clearTimeout(tmr);
  tmr = setTimeout(async () => {
    const box = $('tnRes'); if (!box) return; if (q.length < 2) { box.innerHTML = ''; return; }
    try { const F = fr(), j = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=${F ? 'fr' : 'en'}`)).json();
      results = (j.results || []).map(r => ({ name: r.name, nameFr: r.name, lat: r.latitude, lon: r.longitude, tz: r.timezone || 'UTC', sub: [r.admin1, r.country].filter(Boolean).join(', ') }));
      box.innerHTML = results.length ? results.map((r, i) => `<div><a href="#" data-tn="${i}" style="font-size:12.5px">📍 ${esc(r.name)} <span style="opacity:.6">· ${esc(r.sub)}</span></a></div>`).join('') : `<div style="font-size:12px;opacity:.6">${t2(F, 'No place found', 'Aucun lieu trouvé')}</div>`;
    } catch (err) { box.textContent = '…'; }
  }, 350);
});
document.addEventListener('keydown', e => { if (e.target.id === 'tnSearch') { e.stopPropagation(); if (e.key === 'Enter' && results[0]) setObserver(results[0]); } }, true);

// ---------------------------------------------------------------- menu names follow the chosen city
function renameMenus() {
  const F = fr(), n = F ? (obs.nameFr || obs.name) : obs.name, london = obs.name === 'London';
  const t = focusSel.querySelector('option[value="Tonight"]'), ns = focusSel.querySelector('option[value="night"]');
  if (t) t.textContent = london ? (F ? '🌙 Ce soir depuis Londres' : '🌙 Tonight from London') : (F ? `🌙 Ce soir depuis ${n}` : `🌙 Tonight from ${n}`);
  if (ns) ns.textContent = london ? (F ? 'Le ciel nocturne depuis Londres' : 'Night sky from London') : (F ? `Le ciel nocturne depuis ${n}` : `Night sky from ${n}`);
  if (INFO.Tonight) { INFO.Tonight.name = london ? 'Tonight from London' : (F ? `Ce soir depuis ${n}` : `Tonight from ${n}`); if (SS.more.INFO_EN?.Tonight) SS.more.INFO_EN.Tonight.name = london ? 'Tonight from London' : `Tonight from ${obs.name}`; }
}
{ const prev = SS.setLang; SS.setLang = (...a) => { const r = prev(...a); renameMenus(); return r; }; }
renameMenus();
{ const views = focusSel.querySelector('optgroup'), o = document.createElement('option'); o.value = 'ISSPasses'; o.textContent = '🛰 Space Station passes over my city';
  const t = views.querySelector('option[value="Tonight"]'); t ? t.after(o) : views.appendChild(o); }
SS.i18nAdd?.({
  ui: { '🛰 Space Station passes over my city': '🛰 Passages de la Station spatiale chez moi' },
  name: { '🛰 Space Station passes over my city': '🛰 Passages de la Station spatiale chez moi', 'Space Station passes over your city': 'Passages de la Station spatiale au-dessus de chez vous' },
  cat: { 'Live data · when to look up': 'Données en direct · quand lever les yeux' },
  dist: { 'the next 3 days': 'les 3 prochains jours' },
});
SS.skycity = { setObserver, computePasses, sunTimes, obs, loadTLE, get passes() { return passes; } };
