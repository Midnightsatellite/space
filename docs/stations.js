// =====================================================================
// 🛰 Space stations now: the ISS and China's Tiangong, live.
// Where each one is right now (height, speed, what it is passing over), and where in the world
// people can see it in the next 24 hours: cities with a visible pass (dark for them, station in sunlight).
// Worked out in the browser from today's orbit data (CelesTrak) with satellite.js.
// Also removes "Tonight from London" and "Night sky from London" from the menu (Chris's request).
// =====================================================================
import * as sat from './satellite.min.js';
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const special = SS.more.special;
const { PL } = SS.extras;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const t2 = (F, en, f) => F ? f : en;
const D2R = Math.PI / 180, R2D = 180 / Math.PI, J2000 = Date.UTC(2000, 0, 1, 12), RE = 6371;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------- menu tidy-up
for (const v of ['Tonight', 'night']) focusSel.querySelector(`option[value="${v}"]`)?.remove();

// ---------------------------------------------------------------- stations and cities
const STATIONS = [
  { key: 'ISS', id: 25544, name: ['International Space Station (ISS)', 'Station spatiale internationale (ISS)'], short: 'ISS' },
  { key: 'Tiangong', id: 48274, name: ['Tiangong (China)', 'Tiangong (Chine)'], short: 'Tiangong' },
];
// [name, French name, country, French country, lat, lon, time zone]
const CITIES = [
  ['London', 'Londres', 'UK', 'Royaume-Uni', 51.51, -0.13, 'Europe/London'], ['Paris', 'Paris', 'France', 'France', 48.86, 2.35, 'Europe/Paris'],
  ['Madrid', 'Madrid', 'Spain', 'Espagne', 40.42, -3.70, 'Europe/Madrid'], ['Rome', 'Rome', 'Italy', 'Italie', 41.90, 12.50, 'Europe/Rome'],
  ['Berlin', 'Berlin', 'Germany', 'Allemagne', 52.52, 13.40, 'Europe/Berlin'], ['Geneva', 'Genève', 'Switzerland', 'Suisse', 46.20, 6.15, 'Europe/Zurich'],
  ['Luxembourg', 'Luxembourg', 'Luxembourg', 'Luxembourg', 49.61, 6.13, 'Europe/Luxembourg'], ['Amsterdam', 'Amsterdam', 'Netherlands', 'Pays-Bas', 52.37, 4.90, 'Europe/Amsterdam'],
  ['Stockholm', 'Stockholm', 'Sweden', 'Suède', 59.33, 18.07, 'Europe/Stockholm'], ['Warsaw', 'Varsovie', 'Poland', 'Pologne', 52.23, 21.01, 'Europe/Warsaw'],
  ['Athens', 'Athènes', 'Greece', 'Grèce', 37.98, 23.73, 'Europe/Athens'], ['Istanbul', 'Istanbul', 'Turkey', 'Turquie', 41.01, 28.98, 'Europe/Istanbul'],
  ['Moscow', 'Moscou', 'Russia', 'Russie', 55.76, 37.62, 'Europe/Moscow'], ['Dublin', 'Dublin', 'Ireland', 'Irlande', 53.35, -6.26, 'Europe/Dublin'],
  ['Lisbon', 'Lisbonne', 'Portugal', 'Portugal', 38.72, -9.14, 'Europe/Lisbon'], ['Reykjavik', 'Reykjavik', 'Iceland', 'Islande', 64.15, -21.94, 'Atlantic/Reykjavik'],
  ['Cairo', 'Le Caire', 'Egypt', 'Égypte', 30.04, 31.24, 'Africa/Cairo'], ['Casablanca', 'Casablanca', 'Morocco', 'Maroc', 33.57, -7.59, 'Africa/Casablanca'],
  ['Algiers', 'Alger', 'Algeria', 'Algérie', 36.75, 3.06, 'Africa/Algiers'], ['Dakar', 'Dakar', 'Senegal', 'Sénégal', 14.72, -17.47, 'Africa/Dakar'],
  ['Abidjan', 'Abidjan', 'Ivory Coast', 'Côte d’Ivoire', 5.36, -4.01, 'Africa/Abidjan'], ['Lagos', 'Lagos', 'Nigeria', 'Nigeria', 6.52, 3.38, 'Africa/Lagos'],
  ['Kinshasa', 'Kinshasa', 'DR Congo', 'RD Congo', -4.44, 15.27, 'Africa/Kinshasa'], ['Nairobi', 'Nairobi', 'Kenya', 'Kenya', -1.29, 36.82, 'Africa/Nairobi'],
  ['Addis Ababa', 'Addis-Abeba', 'Ethiopia', 'Éthiopie', 9.03, 38.74, 'Africa/Addis_Ababa'], ['Johannesburg', 'Johannesburg', 'South Africa', 'Afrique du Sud', -26.20, 28.05, 'Africa/Johannesburg'],
  ['Cape Town', 'Le Cap', 'South Africa', 'Afrique du Sud', -33.92, 18.42, 'Africa/Johannesburg'], ['Antananarivo', 'Antananarivo', 'Madagascar', 'Madagascar', -18.88, 47.51, 'Indian/Antananarivo'],
  ['Dubai', 'Dubaï', 'UAE', 'Émirats arabes unis', 25.20, 55.27, 'Asia/Dubai'], ['Riyadh', 'Riyad', 'Saudi Arabia', 'Arabie saoudite', 24.71, 46.68, 'Asia/Riyadh'],
  ['Tehran', 'Téhéran', 'Iran', 'Iran', 35.69, 51.39, 'Asia/Tehran'], ['Karachi', 'Karachi', 'Pakistan', 'Pakistan', 24.86, 67.01, 'Asia/Karachi'],
  ['Delhi', 'Delhi', 'India', 'Inde', 28.61, 77.21, 'Asia/Kolkata'], ['Mumbai', 'Bombay', 'India', 'Inde', 19.08, 72.88, 'Asia/Kolkata'],
  ['Dhaka', 'Dacca', 'Bangladesh', 'Bangladesh', 23.81, 90.41, 'Asia/Dhaka'], ['Bangkok', 'Bangkok', 'Thailand', 'Thaïlande', 13.76, 100.50, 'Asia/Bangkok'],
  ['Singapore', 'Singapour', 'Singapore', 'Singapour', 1.35, 103.82, 'Asia/Singapore'], ['Jakarta', 'Jakarta', 'Indonesia', 'Indonésie', -6.21, 106.85, 'Asia/Jakarta'],
  ['Manila', 'Manille', 'Philippines', 'Philippines', 14.60, 120.98, 'Asia/Manila'], ['Hong Kong', 'Hong Kong', 'China', 'Chine', 22.32, 114.17, 'Asia/Hong_Kong'],
  ['Shanghai', 'Shanghai', 'China', 'Chine', 31.23, 121.47, 'Asia/Shanghai'], ['Beijing', 'Pékin', 'China', 'Chine', 39.90, 116.41, 'Asia/Shanghai'],
  ['Ürümqi', 'Ürümqi', 'China', 'Chine', 43.83, 87.62, 'Asia/Urumqi'], ['Seoul', 'Séoul', 'South Korea', 'Corée du Sud', 37.57, 126.98, 'Asia/Seoul'],
  ['Tokyo', 'Tokyo', 'Japan', 'Japon', 35.68, 139.69, 'Asia/Tokyo'], ['Almaty', 'Almaty', 'Kazakhstan', 'Kazakhstan', 43.24, 76.89, 'Asia/Almaty'],
  ['Novosibirsk', 'Novossibirsk', 'Russia', 'Russie', 55.03, 82.92, 'Asia/Novosibirsk'], ['Ulaanbaatar', 'Oulan-Bator', 'Mongolia', 'Mongolie', 47.89, 106.91, 'Asia/Ulaanbaatar'],
  ['Sydney', 'Sydney', 'Australia', 'Australie', -33.87, 151.21, 'Australia/Sydney'], ['Perth', 'Perth', 'Australia', 'Australie', -31.95, 115.86, 'Australia/Perth'],
  ['Darwin', 'Darwin', 'Australia', 'Australie', -12.46, 130.84, 'Australia/Darwin'], ['Auckland', 'Auckland', 'New Zealand', 'Nouvelle-Zélande', -36.85, 174.76, 'Pacific/Auckland'],
  ['Honolulu', 'Honolulu', 'USA', 'États-Unis', 21.31, -157.86, 'Pacific/Honolulu'], ['Anchorage', 'Anchorage', 'USA', 'États-Unis', 61.22, -149.90, 'America/Anchorage'],
  ['Vancouver', 'Vancouver', 'Canada', 'Canada', 49.28, -123.12, 'America/Vancouver'], ['Los Angeles', 'Los Angeles', 'USA', 'États-Unis', 34.05, -118.24, 'America/Los_Angeles'],
  ['Denver', 'Denver', 'USA', 'États-Unis', 39.74, -104.99, 'America/Denver'], ['Houston', 'Houston', 'USA', 'États-Unis', 29.76, -95.37, 'America/Chicago'],
  ['Chicago', 'Chicago', 'USA', 'États-Unis', 41.88, -87.63, 'America/Chicago'], ['Miami', 'Miami', 'USA', 'États-Unis', 25.76, -80.19, 'America/New_York'],
  ['New York', 'New York', 'USA', 'États-Unis', 40.71, -74.01, 'America/New_York'], ['Montreal', 'Montréal', 'Canada', 'Canada', 45.50, -73.57, 'America/Toronto'],
  ['Mexico City', 'Mexico', 'Mexico', 'Mexique', 19.43, -99.13, 'America/Mexico_City'], ['Havana', 'La Havane', 'Cuba', 'Cuba', 23.11, -82.37, 'America/Havana'],
  ['Bogotá', 'Bogota', 'Colombia', 'Colombie', 4.71, -74.07, 'America/Bogota'], ['Lima', 'Lima', 'Peru', 'Pérou', -12.05, -77.04, 'America/Lima'],
  ['Manaus', 'Manaus', 'Brazil', 'Brésil', -3.12, -60.02, 'America/Manaus'], ['São Paulo', 'São Paulo', 'Brazil', 'Brésil', -23.55, -46.63, 'America/Sao_Paulo'],
  ['Rio de Janeiro', 'Rio de Janeiro', 'Brazil', 'Brésil', -22.91, -43.17, 'America/Sao_Paulo'], ['Buenos Aires', 'Buenos Aires', 'Argentina', 'Argentine', -34.60, -58.38, 'America/Argentina/Buenos_Aires'],
  ['Santiago', 'Santiago', 'Chile', 'Chili', -33.45, -70.67, 'America/Santiago'], ['Kourou', 'Kourou', 'French Guiana', 'Guyane', 5.16, -52.65, 'America/Cayenne'],
  ['Nouméa', 'Nouméa', 'New Caledonia', 'Nouvelle-Calédonie', -22.28, 166.46, 'Pacific/Noumea'], ['Papeete', 'Papeete', 'French Polynesia', 'Polynésie française', -17.53, -149.57, 'Pacific/Tahiti'],
  ['Saint-Denis', 'Saint-Denis', 'Réunion', 'La Réunion', -20.88, 55.45, 'Indian/Reunion'], ['Fort-de-France', 'Fort-de-France', 'Martinique', 'Martinique', 14.60, -61.07, 'America/Martinique'],
].map(([n, nf, c, cf, lat, lon, tz]) => ({ n, nf, c, cf, lat, lon, tz, gd: { latitude: lat * D2R, longitude: lon * D2R, height: 0.05 } }));

// ---------------------------------------------------------------- the Sun (same low-precision method as the rest of the site)
function sunEci(t) { const d = (t - J2000) / 864e5, L = SS.astro.sunLon(d) * D2R, e = 23.439 * D2R; return [Math.cos(L), Math.cos(e) * Math.sin(L), Math.sin(e) * Math.sin(L)]; }
function sunAlt(t, lat, lon) { const [x, y, z] = sunEci(t), ra = Math.atan2(y, x), dec = Math.asin(z), H = sat.gstime(new Date(t)) + lon * D2R - ra, la = lat * D2R;
  return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H)) * R2D; }

// ---------------------------------------------------------------- orbit data
const recs = {}, tleAt = {};
async function loadTLE(st) {
  const ck = 'msTle' + st.id;
  try { const c = JSON.parse(localStorage.getItem(ck) || 'null'); if (c && Date.now() - c.t < 6 * 36e5) { recs[st.key] = sat.twoline2satrec(c.l1, c.l2); tleAt[st.key] = c.t; return true; } } catch (e) { }
  try {
    const lines = (await (await fetch(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${st.id}&FORMAT=TLE`)).text()).trim().split(/\r?\n/).map(s => s.trim());
    const l1 = lines.find(l => l.startsWith('1 ')), l2 = lines.find(l => l.startsWith('2 ')); if (!l1 || !l2) return false;
    recs[st.key] = sat.twoline2satrec(l1, l2); tleAt[st.key] = Date.now();
    try { localStorage.setItem(ck, JSON.stringify({ t: tleAt[st.key], l1, l2 })); } catch (e) { }
    return true;
  } catch (e) { return false; }
}

// where a station is right now
function now(st) {
  const rec = recs[st.key]; if (!rec) return null;
  const d = new Date(), pv = sat.propagate(rec, d); if (!pv?.position) return null;
  const g = sat.eciToGeodetic(pv.position, sat.gstime(d)), v = pv.velocity;
  const lat = g.latitude * R2D, lon = ((g.longitude * R2D + 540) % 360) - 180;
  let best = null, bd = 1e9;
  for (const c of CITIES) { const dd = dist(lat, lon, c.lat, c.lon); if (dd < bd) { bd = dd; best = c; } }
  return { lat, lon, h: g.height, v: Math.hypot(v.x, v.y, v.z) * 3600, city: best, km: bd };
}
function dist(a, b, c, d) { const p = D2R, x = Math.sin((c - a) * p / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin((d - b) * p / 2) ** 2; return 2 * RE * Math.asin(Math.sqrt(x)); }

// visible passes over all the cities in the next 24 hours
function passes(st) {
  const rec = recs[st.key]; if (!rec) return [];
  const out = [], cur = new Map(), t0 = Date.now();
  for (let t = t0; t < t0 + 24 * 36e5; t += 30000) {
    const d = new Date(t), pv = sat.propagate(rec, d); if (!pv?.position) continue;
    const p = pv.position, ecf = sat.eciToEcf(p, sat.gstime(d));
    const s = sunEci(t), dot = p.x * s[0] + p.y * s[1] + p.z * s[2], lit = dot > 0 || Math.sqrt(Math.max(0, p.x * p.x + p.y * p.y + p.z * p.z - dot * dot)) > RE;
    for (const c of CITIES) {
      let vis = false, el = 0, az = 0;
      if (lit) { const la = sat.ecfToLookAngles(c.gd, ecf); el = la.elevation * R2D; az = la.azimuth * R2D; vis = el > 10 && sunAlt(t, c.lat, c.lon) < -6; }
      const k = cur.get(c);
      if (vis) { if (!k) cur.set(c, { c, start: t, end: t, max: el, from: az, to: az }); else { k.end = t; k.to = az; if (el > k.max) k.max = el; } }
      else if (k) { if (k.end - k.start >= 60000) out.push(k); cur.delete(c); }
    }
  }
  for (const k of cur.values()) out.push(k);
  return out.sort((a, b) => a.start - b.start);
}

// ---------------------------------------------------------------- the card
const state = { status: 'idle', passes: {} };
const COMPASS = { en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'], fr: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] };
const dir = az => COMPASS[fr() ? 'fr' : 'en'][Math.round(((az % 360) + 360) % 360 / 45) % 8];
const local = (t, tz, F) => { const o = { hour: '2-digit', minute: '2-digit', timeZone: tz }, today = new Date().toLocaleDateString('en-GB', { timeZone: tz }), day = new Date(t).toLocaleDateString('en-GB', { timeZone: tz });
  return (day === today ? '' : (new Date(t).toLocaleDateString(F ? 'fr-FR' : 'en-GB', { weekday: 'short', timeZone: tz }) + ' ')) + new Date(t).toLocaleTimeString(F ? 'fr-FR' : 'en-GB', o); };
const high = (el, F) => el >= 60 ? t2(F, 'almost overhead', 'presque au zénith') : el >= 35 ? t2(F, 'high in the sky', 'haut dans le ciel') : t2(F, 'low in the sky', 'bas dans le ciel');

function whereText(st, F) {
  const w = now(st); if (!w) return '';
  const c = w.city, cn = F ? `${c.nf}, ${c.cf}` : `${c.n}, ${c.c}`;
  const over = w.km < 700 ? t2(F, `passing near <b>${esc(cn)}</b>`, `passe près de <b>${esc(cn)}</b>`)
    : t2(F, `about ${Math.round(w.km / 100) * 100} km from ${esc(cn)}`, `à environ ${Math.round(w.km / 100) * 100} km de ${esc(cn)}`);
  const ll = `${Math.abs(w.lat).toFixed(1)}°${w.lat >= 0 ? 'N' : 'S'} ${Math.abs(w.lon).toFixed(1)}°${w.lon >= 0 ? 'E' : t2(F, 'W', 'O')}`;
  return `${over}<br><span style="opacity:.8">${ll} · ${Math.round(w.h)} km ${t2(F, 'up', 'd’altitude')} · ${Math.round(w.v).toLocaleString(F ? 'fr-FR' : 'en-GB')} km/h</span>`;
}
function card() {
  const F = fr();
  if (state.status !== 'ok') return `<div style="opacity:.75">${state.status === 'err' ? t2(F, 'Couldn’t get today’s orbit data, try again later.', 'Données d’orbite indisponibles, réessayez plus tard.') : '⏳ ' + t2(F, 'Getting today’s orbit data…', 'Récupération des orbites du jour…')}</div>`;
  return STATIONS.map(st => {
    const ps = (state.passes[st.key] || []).filter(p => p.end > Date.now());
    // one pass per city (the best one), the highest passes first, then the soonest
    const seen = new Set(), list = ps.filter(p => p.max >= 20).sort((a, b) => b.max - a.max).filter(p => !seen.has(p.c) && seen.add(p.c)).slice(0, 8).sort((a, b) => a.start - b.start);
    return `<div data-say="${st.key}" style="margin-top:8px;padding-top:7px;border-top:1px solid rgba(140,160,255,.2)">
      <a href="#" data-go="${st.key}" style="color:#9fd0ff"><b style="display:inline;font-size:13.5px">🛰 ${esc(st.name[F ? 1 : 0])}</b></a>
      <div style="font-size:12.5px;margin-top:2px" data-where="${st.key}">${whereText(st, F)}</div>
      <div style="font-size:12px;margin-top:6px;color:#ffd27a">${t2(F, 'Where to see it in the next 24 hours', 'Où la voir dans les prochaines 24 heures')}</div>
      ${list.length ? list.map(p => `<div style="font-size:12px;margin-top:2px">🌍 <b style="display:inline;font-size:12px">${esc(F ? p.c.nf : p.c.n)}</b> <span style="opacity:.75">(${esc(F ? p.c.cf : p.c.c)})</span> · ${local(p.start, p.c.tz, F)} · ${high(p.max, F)} · ${Math.max(1, Math.round((p.end - p.start) / 6e4))} min, ${t2(F, 'from', 'du')} ${dir(p.from)} ${t2(F, 'to', 'au')} ${dir(p.to)}</div>`).join('')
        : `<div style="font-size:12px;opacity:.75">${t2(F, 'No good passes over the listed cities in the next 24 hours.', 'Aucun bon passage au-dessus des villes de la liste dans les prochaines 24 heures.')}</div>`}
    </div>`;
  }).join('') + `<div style="margin-top:8px;font-size:12px"><a href="#" data-go="ISSPasses">📍 ${t2(F, 'Passes over your own city', 'Passages au-dessus de votre ville')}</a></div>
    <div data-say="tip" style="font-size:10.5px;opacity:.6;margin-top:6px">${t2(F, 'Times are local to each city. A station looks like a bright star gliding across the sky with no blinking lights; you can see it when it is dark where you are but the station is still in sunlight. Orbit data: CelesTrak.', 'Heures locales de chaque ville. Une station ressemble à une étoile brillante qui glisse dans le ciel sans clignoter ; on la voit quand il fait nuit chez soi alors qu’elle est encore au soleil. Orbites : CelesTrak.')}</div>`;
}

async function load() {
  if (state.status === 'busy' || (state.status === 'ok' && Date.now() - state.at < 30 * 6e4)) return;
  state.status = 'busy';
  const ok = (await Promise.all(STATIONS.map(loadTLE))).some(Boolean);
  if (!ok) { state.status = 'err'; return refresh(); }
  await new Promise(r => setTimeout(r, 30));
  for (const st of STATIONS) state.passes[st.key] = passes(st);
  state.status = 'ok'; state.at = Date.now(); refresh();
}
let focused = null;
function refresh() { if (focused === 'Stations') { INFO.Stations.fact = card(); if (SS.more.INFO_EN?.Stations) SS.more.INFO_EN.Stations.fact = INFO.Stations.fact; SS.onFocus('Stations'); } }

const R = PL.Earth.tilted.children[0].geometry.parameters.radius;
bodies.Stations = { obj: bodies.Earth.obj, radius: bodies.Earth.radius, view: R * 3.4 };
info('Stations', 'Space stations now', 'Live data · ISS and Tiangong', 'where they are, and where to see them', card());
{ const prev = SS.onFocus; SS.onFocus = key => { focused = key; if (key === 'Stations') { INFO.Stations.fact = card(); if (SS.more.INFO_EN?.Stations) SS.more.INFO_EN.Stations.fact = INFO.Stations.fact; } prev(key); }; }
special.Stations = () => { load(); flyTo('Stations'); };
// keep "where it is now" ticking while the card is open
setInterval(() => { if (focused !== 'Stations' || state.status !== 'ok') return; const F = fr(); for (const st of STATIONS) { const el = document.querySelector(`[data-where="${st.key}"]`); if (el) el.innerHTML = whereText(st, F); } }, 3000);
document.addEventListener('click', e => { const a = e.target.closest?.('#info [data-go]'); if (!a || focused !== 'Stations') return; e.preventDefault(); const k = a.dataset.go; focusSel.value = k; SS.go(k); });

// menu entry and a button (the phone layout moves the button to Play)
{ const views = focusSel.querySelector('optgroup'), o = document.createElement('option'); o.value = 'Stations'; o.textContent = '🛰 Space stations now';
  const after = views.querySelector('option[value="ISSPasses"]'); after ? after.before(o) : views.appendChild(o); }
{ const lb = $('launchBtn'); if (lb) { const b = document.createElement('button'); b.type = 'button'; b.id = 'stationsBtn'; b.textContent = '🛰 Space stations';
  b.onclick = () => { focusSel.value = 'Stations'; SS.go('Stations'); }; lb.after(b); } }
SS.i18nAdd?.({ ui: { '🛰 Space stations now': '🛰 Stations spatiales en direct', '🛰 Space stations': '🛰 Stations spatiales' },
  name: { 'Space stations now': 'Stations spatiales en direct' },
  cat: { 'Live data · ISS and Tiangong': 'Données en direct · ISS et Tiangong' },
  dist: { 'where they are, and where to see them': 'où elles sont, et où les voir' } });
