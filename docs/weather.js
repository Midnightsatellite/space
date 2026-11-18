// =====================================================================
// Live weather on Earth, shown only when people ask for it (🌦 button or the menu):
//   ☁ live clouds (EUMETSAT, via live-cloud-maps, every 3 hours)
//   🌧 rain radar (RainViewer, every 10 minutes)
//   🌀 tropical cyclones happening now (GDACS)
//   🌪 tornado reports in the US, last 72 hours (NOAA / National Weather Service)
//   📍 click anywhere on Earth for the forecast (Open-Meteo)
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies, sim, flyTo, focusSel, camera } = SS;
const { info } = SS.cosmos;
const { nearLabel, PL } = SS.extras;
const special = SS.more.special;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const V = (x, y, z) => new THREE.Vector3(x, y, z), D2R = Math.PI / 180;
const earthMesh = PL.Earth.tilted.children[0], earthClouds = PL.Earth.tilted.children[1];
const R = earthMesh.geometry.parameters.radius;
const local = (lat, lon) => { const a = lat * D2R, o = lon * D2R; return V(Math.cos(a) * Math.cos(o), Math.sin(a), -Math.cos(a) * Math.sin(o)); };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const t2 = (F, en, f) => F ? f : en;
const when = (ms, F) => new Date(ms).toLocaleString(F ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
const ago = (ms, F) => { const m = Math.max(0, Math.round((Date.now() - ms) / 60000)); return m < 60 ? t2(F, `${m} min ago`, `il y a ${m} min`) : t2(F, `${Math.round(m / 60)} h ago`, `il y a ${Math.round(m / 60)} h`); };

const toNow = () => { SS.setDate(Date.now()); const sp = $('speed'); if (sp) { sp.value = '0.0000115741'; sp.dispatchEvent(new Event('change')); } };   // today, turning at its real speed
const state = { clouds: false, radar: false, storms: false, tornado: false, click: false };
const status = { clouds: '', radar: '', storms: '', tornado: '' };
let panelOpen = false;

// ---------------------------------------------------------------- ☁ live clouds
const cloudMat = new THREE.MeshLambertMaterial({ transparent: true, depthWrite: false, opacity: 0.95 });
const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(R * 1.012, 128, 64), cloudMat);
let cloudAt = 0;
function loadClouds() {
  const stamp = Math.floor(Date.now() / (3 * 36e5));   // new picture every 3 hours
  status.clouds = '…'; render();
  new THREE.TextureLoader().setCrossOrigin('anonymous').load(`https://clouds.matteason.co.uk/images/4096x2048/clouds-alpha.png?t=${stamp}`, tex => {
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    cloudMat.map?.dispose(); cloudMat.map = tex; cloudMat.needsUpdate = true; cloudAt = Date.now(); status.clouds = 'ok'; render();
  }, undefined, () => { status.clouds = 'err'; render(); });
}
function setClouds(on) {
  state.clouds = on;
  if (on) { earthMesh.add(cloudMesh); if (earthClouds) earthClouds.visible = false; if (Date.now() - cloudAt > 3 * 36e5) loadClouds(); }
  else { earthMesh.remove(cloudMesh); if (earthClouds) earthClouds.visible = true; }
}

// ---------------------------------------------------------------- 🌧 rain radar: map tiles stitched, then turned into a globe picture
const radarCanvas = document.createElement('canvas'); radarCanvas.width = 2048; radarCanvas.height = 1024;
const radarTex = new THREE.CanvasTexture(radarCanvas); radarTex.colorSpace = THREE.SRGBColorSpace;
const radarMesh = new THREE.Mesh(new THREE.SphereGeometry(R * 1.005, 128, 64), new THREE.MeshBasicMaterial({ map: radarTex, transparent: true, depthWrite: false, opacity: 0.9 }));
let radarAt = 0, radarFrame = 0, radarBusy = false;
async function loadRadar() {
  if (radarBusy) return; radarBusy = true; status.radar = '…'; render();
  try {
    const meta = await (await fetch('https://api.rainviewer.com/public/weather-maps.json')).json();
    const f = meta.radar.past[meta.radar.past.length - 1];
    const Z = 3, N = 1 << Z, T = 256, merc = document.createElement('canvas'); merc.width = merc.height = N * T;
    const g = merc.getContext('2d');
    await Promise.all(Array.from({ length: N * N }, (_, i) => new Promise(res => {
      const x = i % N, y = Math.floor(i / N), img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => { g.drawImage(img, x * T, y * T); res(); }; img.onerror = res;
      img.src = `${meta.host}${f.path}/${T}/${Z}/${x}/${y}/2/1_1.png`;
    })));
    const out = radarCanvas.getContext('2d'), W = radarCanvas.width, H = radarCanvas.height, M = merc.width;
    out.clearRect(0, 0, W, H);
    for (let row = 0; row < H; row++) {   // each row of the globe picture comes from the matching row of the flat (Mercator) map
      const lat = 90 - (row + 0.5) / H * 180; if (Math.abs(lat) > 85) continue;
      const my = (1 - Math.log(Math.tan(Math.PI / 4 + lat * D2R / 2)) / Math.PI) / 2 * M;
      out.drawImage(merc, 0, Math.floor(my), M, 1, 0, row, W, 1);
    }
    radarTex.needsUpdate = true; radarAt = Date.now(); radarFrame = f.time * 1000; status.radar = 'ok';
  } catch (e) { status.radar = 'err'; }
  radarBusy = false; render();
}
function setRadar(on) { state.radar = on; if (on) { earthMesh.add(radarMesh); if (Date.now() - radarAt > 10 * 6e4) loadRadar(); } else earthMesh.remove(radarMesh); }

// ---------------------------------------------------------------- markers (cyclones, tornado reports, forecast pin)
function emojiSprite(ch, size) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.font = '100px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: true, transparent: true })); s.scale.setScalar(size); return s;
}
const sevFR = t => String(t || '').replace('Tropical Depression', 'Dépression tropicale').replace('Tropical Storm', 'Tempête tropicale').replace('Super Typhoon', 'Super typhon').replace('Typhoon', 'Typhon')
  .replace('Hurricane', 'Ouragan').replace(/Category (\d)/, 'catégorie $1').replace('maximum wind speed of', 'vents maximaux de');
const sev = (t, F) => F ? sevFR(t) : String(t || '');
const ALERT = { Green: ['Green', 'Vert'], Orange: ['Orange', 'Orange'], Red: ['Red', 'Rouge'] };
const outward = obj => () => obj.getWorldPosition(V()).sub(earthMesh.getWorldPosition(V())).normalize().add(V(0, 0.15, 0)).normalize();
function marker(group, key, lat, lon, ch, size, label, range) {
  const m = new THREE.Group(); m.position.copy(local(lat, lon).multiplyScalar(R * 1.02)); group.add(m);
  const s = emojiSprite(ch, size); m.add(s);
  nearLabel(m, label, size * 0.8, key, 'small', range);
  bodies[key] = { obj: m, radius: size, view: R * 1.6, dir: outward(m) };
  special[key] = () => flyTo(key);
  return { m, s };
}

// 🌀 tropical cyclones now (GDACS: Global Disaster Alert and Coordination System, UN and European Commission)
let stormGroup = new THREE.Group(), stormList = [], stormAt = 0;
const spinners = [];
sim.push(dt => { for (const s of spinners) s.material.rotation -= dt * 2; });
async function loadStorms() {
  status.storms = '…'; render();
  try {
    const j = await (await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=TC&alertlevel=green;orange;red')).json();
    earthMesh.remove(stormGroup); stormGroup = new THREE.Group(); spinners.length = 0;
    stormList = j.features.filter(f => String(f.properties.iscurrent) === 'true').slice(0, 20);
    stormList.forEach((f, i) => {
      const p = f.properties, [lon, lat] = f.geometry.coordinates, key = 'WXStorm' + i;
      const name = (p.eventname || p.name || '').replace(/-\d+$/, ''), col = { Red: '#ff5050', Orange: '#ffa040' }[p.alertlevel] || '#7be07b';
      const { s } = marker(stormGroup, key, lat, lon, '🌀', R * 0.16, '🌀 ' + name, R * 40); spinners.push(s);
      const where = (p.affectedcountries || []).map(c => c.countryname).filter(Boolean).join(', ') || p.country || '';
      const F = fr();
      info(key, t2(F, 'Tropical cyclone ', 'Cyclone tropical ') + name, t2(F, 'Live weather · tropical cyclone', 'Météo en direct · cyclone tropical'),
        `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`,
        `<div>${esc(sev(p.severitydata?.severitytext, F))}</div>
         <div style="margin-top:6px">${t2(F, 'Alert level: ', 'Niveau d’alerte : ')}<b style="display:inline;color:${col}">${esc((ALERT[p.alertlevel] || [p.alertlevel, p.alertlevel])[F ? 1 : 0])}</b></div>
         ${where ? `<div>${t2(F, 'Area: ', 'Zone : ')}${esc(where)}</div>` : ''}
         <div>${t2(F, 'Since', 'Depuis le')} ${esc(new Date(p.fromdate + 'Z').toLocaleDateString(F ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long' }))} · ${t2(F, 'track by', 'suivi par')} ${esc(p.source || 'GDACS')}</div>
         <div style="margin-top:6px"><a href="${esc(p.url?.report || 'https://www.gdacs.org')}" target="_blank" rel="noopener">${t2(F, 'Full report on GDACS ↗', 'Rapport complet sur GDACS ↗')}</a></div>
         <div style="font-size:11px;opacity:.65;margin-top:6px">${t2(F, 'Position from the latest advisory. For warnings, follow your national weather service.', 'Position du dernier bulletin. Pour les alertes, suivez votre service météo national.')}</div>`);
      stormList[i]._name = name; stormList[i]._key = key; stormList[i]._col = col;
    });
    if (state.storms) earthMesh.add(stormGroup);
    stormAt = Date.now(); status.storms = 'ok';
  } catch (e) { status.storms = 'err'; }
  render();
}
function setStorms(on) { state.storms = on; if (on) { earthMesh.add(stormGroup); if (Date.now() - stormAt > 30 * 6e4) loadStorms(); } else earthMesh.remove(stormGroup); }

// 🌪 US tornado reports, last 72 hours (NWS Local Storm Reports; preliminary)
let tornGroup = new THREE.Group(), tornList = [], tornAt = 0;
async function loadTornado() {
  status.tornado = '…'; render();
  try {
    const u = "https://mapservices.weather.noaa.gov/vector/rest/services/obs/nws_local_storm_reports/MapServer/2/query?where=descript+IN+('Tornado','Funnel+Cloud','Waterspout')&outFields=descript,loc_desc,state,lsr_validtime,remarks,magnitude&orderByFields=lsr_validtime+DESC&f=geojson";
    const j = await (await fetch(u)).json();
    earthMesh.remove(tornGroup); tornGroup = new THREE.Group();
    tornList = (j.features || []).slice(0, 60);
    tornList.forEach((f, i) => {
      const p = f.properties, [lon, lat] = f.geometry.coordinates, key = 'WXTorn' + i, F = fr();
      const kind = { Tornado: ['Tornado', 'Tornade'], 'Funnel Cloud': ['Funnel cloud', 'Nuage en entonnoir'], Waterspout: ['Waterspout', 'Trombe marine'] }[p.descript] || [p.descript, p.descript];
      marker(tornGroup, key, lat, lon, p.descript === 'Tornado' ? '🌪' : '☁', R * 0.07, `🌪 ${p.loc_desc}, ${p.state}`, R * 8);
      info(key, `${kind[F ? 1 : 0]} · ${p.loc_desc}, ${p.state}`, t2(F, 'Live weather · storm report (USA)', 'Météo en direct · rapport d’orage (États-Unis)'), when(p.lsr_validtime, F),
        `<div>${esc(p.remarks || '')}</div><div style="font-size:11px;opacity:.65;margin-top:6px">${t2(F, 'Preliminary report from the US National Weather Service; it may later be confirmed, rated or removed.', 'Rapport préliminaire du Service météorologique national américain ; il peut être confirmé, classé ou retiré plus tard.')}</div>`);
      tornList[i]._key = key; tornList[i]._kind = kind;
    });
    if (state.tornado) earthMesh.add(tornGroup);
    tornAt = Date.now(); status.tornado = 'ok';
  } catch (e) { status.tornado = 'err'; }
  render();
}
function setTornado(on) { state.tornado = on; if (on) { earthMesh.add(tornGroup); if (Date.now() - tornAt > 15 * 6e4) loadTornado(); } else earthMesh.remove(tornGroup); }

// keep the live layers fresh while they are on
setInterval(() => { if (state.clouds && Date.now() - cloudAt > 3 * 36e5) loadClouds(); if (state.radar) loadRadar();
  if (state.storms) loadStorms(); if (state.tornado) loadTornado(); }, 10 * 6e4);

// ---------------------------------------------------------------- 📍 click Earth for the forecast (Open-Meteo)
const WMO = { 0: ['☀️', 'Clear sky', 'Ciel dégagé'], 1: ['🌤', 'Mainly clear', 'Plutôt dégagé'], 2: ['⛅', 'Partly cloudy', 'Partiellement nuageux'], 3: ['☁️', 'Overcast', 'Couvert'],
  45: ['🌫', 'Fog', 'Brouillard'], 48: ['🌫', 'Freezing fog', 'Brouillard givrant'], 51: ['🌦', 'Light drizzle', 'Bruine légère'], 53: ['🌦', 'Drizzle', 'Bruine'], 55: ['🌧', 'Heavy drizzle', 'Forte bruine'],
  56: ['🌧', 'Freezing drizzle', 'Bruine verglaçante'], 57: ['🌧', 'Freezing drizzle', 'Bruine verglaçante'], 61: ['🌦', 'Light rain', 'Pluie faible'], 63: ['🌧', 'Rain', 'Pluie'], 65: ['🌧', 'Heavy rain', 'Forte pluie'],
  66: ['🌧', 'Freezing rain', 'Pluie verglaçante'], 67: ['🌧', 'Freezing rain', 'Pluie verglaçante'], 71: ['🌨', 'Light snow', 'Neige faible'], 73: ['🌨', 'Snow', 'Neige'], 75: ['❄️', 'Heavy snow', 'Forte neige'], 77: ['🌨', 'Snow grains', 'Grains de neige'],
  80: ['🌦', 'Showers', 'Averses'], 81: ['🌧', 'Showers', 'Averses'], 82: ['⛈', 'Violent showers', 'Averses violentes'], 85: ['🌨', 'Snow showers', 'Averses de neige'], 86: ['🌨', 'Heavy snow showers', 'Fortes averses de neige'],
  95: ['⛈', 'Thunderstorm', 'Orage'], 96: ['⛈', 'Thunderstorm with hail', 'Orage avec grêle'], 99: ['⛈', 'Thunderstorm with heavy hail', 'Orage avec forte grêle'] };
const wmo = (c, F) => { const w = WMO[c] || ['🌡', '—', '—']; return [w[0], F ? w[2] : w[1]]; };
let fc = null;   // last forecast: {lat, lon, place, data} or {err}
const pin = emojiSprite('📍', R * 0.09); pin.center.set(0.5, 0.1);
const pinHolder = new THREE.Group(); pinHolder.add(pin);
async function forecast(lat, lon) {
  pinHolder.position.copy(local(lat, lon).multiplyScalar(R * 1.015)); earthMesh.add(pinHolder);
  fc = { lat, lon, loading: true }; openPanel(); render();
  const F = fr();
  const q = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m,precipitation,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4`;
  const g = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&localityLanguage=${F ? 'fr' : 'en'}`;
  try {
    const [d, p] = await Promise.all([fetch(q).then(r => r.json()), fetch(g).then(r => r.json()).catch(() => null)]);
    const place = p ? [p.city || p.locality, p.principalSubdivision, p.countryName].filter((x, i, a) => x && a.indexOf(x) === i).join(', ') : '';
    fc = { lat, lon, place, data: d };
  } catch (e) { fc = { lat, lon, err: true }; }
  render();
}
{ // a click (not a drag) on the Earth while the forecast tool is on
  const ray = new THREE.Raycaster(); let down = null;
  addEventListener('pointerdown', e => { down = e.target.tagName === 'CANVAS' ? [e.clientX, e.clientY] : null; }, true);
  addEventListener('pointerup', e => {
    if (!state.click || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = e.target.getBoundingClientRect?.(); if (!r || e.target.tagName !== 'CANVAS') return;
    ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
    const hit = ray.intersectObject(earthMesh, false)[0]; if (!hit) return;
    const p = earthMesh.worldToLocal(hit.point.clone()).normalize();
    forecast(Math.asin(p.y) / D2R, Math.atan2(-p.z, p.x) / D2R);
  }, true);
}

// ---------------------------------------------------------------- the side panel
const panel = document.createElement('div'); panel.id = 'wxPanel';
panel.style.cssText = 'position:fixed;right:16px;top:44px;width:300px;max-width:calc(100vw - 32px);max-height:62vh;overflow:auto;background:rgba(10,14,30,.84);backdrop-filter:blur(8px);border:1px solid rgba(140,160,255,.22);border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.45;z-index:7;display:none;color:#e8ecff';
document.body.appendChild(panel);
{ const st = document.createElement('style'); st.textContent = 'body.clean #wxPanel{display:none!important} #wxPanel a{color:#9fd0ff} #wxPanel button:not(#wxClose){background:#24306a;color:#fff;border:1px solid #3a4aa0;border-radius:6px;padding:2px 7px;font-size:12px;cursor:pointer}'; document.head.appendChild(st); }
const dot = s => s === 'ok' ? '' : s === '…' ? ' <span style="opacity:.6">⏳</span>' : s === 'err' ? ' <span style="color:#ff8080">⚠</span>' : '';
function row(id, on, label, sub) {
  return `<label style="display:flex;gap:8px;align-items:flex-start;margin-top:7px;cursor:pointer"><input type="checkbox" data-wx="${id}" ${on ? 'checked' : ''} style="margin-top:3px">
    <span><b style="font-weight:600">${label}</b>${sub ? `<br><span style="font-size:11.5px;opacity:.72">${sub}</span>` : ''}</span></label>`;
}
function render() {
  if (!panelOpen) return;
  const F = fr(), off = Math.abs(SS.getDate() - Date.now()) > 36e5 * 6;
  let h = `<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:15px">🌦 ${t2(F, 'Live weather on Earth', 'Météo en direct sur Terre')}</b>
    <button type="button" id="wxClose" aria-label="${t2(F, 'Close', 'Fermer')}" style="background:none;border:none;color:#fff;font-size:16px;cursor:pointer">✕</button></div>`;
  if (off) h += `<div style="margin-top:6px;font-size:12px;background:rgba(255,200,80,.12);border-radius:6px;padding:5px 7px">${t2(F, 'These layers show today’s weather, but the scene’s clock is elsewhere, so day and night won’t match.', 'Ces couches montrent la météo d’aujourd’hui, mais l’horloge de la scène est ailleurs : le jour et la nuit ne correspondront pas.')} <button type="button" id="wxNow">${t2(F, 'Go to now, real time', 'Maintenant, en temps réel')}</button></div>`;
  h += row('clouds', state.clouds, '☁ ' + t2(F, 'Live clouds', 'Nuages en direct') + dot(status.clouds),
    status.clouds === 'err' ? t2(F, 'Couldn’t load the cloud map, try again later.', 'Carte des nuages indisponible, réessayez plus tard.') : t2(F, 'Satellite cloud map, updated every 3 hours', 'Carte satellite des nuages, mise à jour toutes les 3 heures'));
  h += row('radar', state.radar, '🌧 ' + t2(F, 'Rain radar', 'Radar de pluie') + dot(status.radar),
    status.radar === 'err' ? t2(F, 'Couldn’t load the radar, try again later.', 'Radar indisponible, réessayez plus tard.') : (radarFrame && state.radar ? t2(F, 'Radar picture ', 'Image radar ') + ago(radarFrame, F) + ' · ' : '') + t2(F, 'only where ground radars exist', 'seulement là où il y a des radars au sol'));
  h += row('storms', state.storms, '🌀 ' + t2(F, 'Tropical cyclones now', 'Cyclones tropicaux en cours') + dot(status.storms),
    status.storms === 'err' ? t2(F, 'Couldn’t load the storm list.', 'Liste des tempêtes indisponible.') : state.storms && status.storms === 'ok' ? (stormList.length ? '' : t2(F, 'None active right now', 'Aucun en ce moment')) : t2(F, 'Hurricanes, typhoons and cyclones worldwide', 'Ouragans, typhons et cyclones dans le monde'));
  if (state.storms && stormList.length) h += stormList.map(s => `<div style="margin:3px 0 0 26px"><a href="#" data-go="${s._key}" style="color:${s._col}">🌀 ${esc(s._name)}</a> <span style="font-size:11.5px;opacity:.72">${esc(sev(s.properties.severitydata?.severitytext, F).replace(/\s*\(.*\)/, ''))}</span></div>`).join('');
  h += row('tornado', state.tornado, '🌪 ' + t2(F, 'Tornado reports (USA, last 3 days)', 'Tornades signalées (États-Unis, 3 derniers jours)') + dot(status.tornado),
    status.tornado === 'err' ? t2(F, 'Couldn’t load the reports.', 'Rapports indisponibles.') : state.tornado && status.tornado === 'ok' ? (tornList.length ? `${tornList.length} ${t2(F, 'reports', 'rapports')}` : t2(F, 'No tornadoes reported in the last 3 days', 'Aucune tornade signalée ces 3 derniers jours')) : t2(F, 'Preliminary reports from the US weather service', 'Rapports préliminaires du service météo américain'));
  if (state.tornado && tornList.length) h += tornList.slice(0, 8).map(t => `<div style="margin:3px 0 0 26px;font-size:12px"><a href="#" data-go="${t._key}">${esc(t._kind[F ? 1 : 0])} · ${esc(t.properties.loc_desc)}, ${esc(t.properties.state)}</a> <span style="opacity:.65">${ago(t.properties.lsr_validtime, F)}</span></div>`).join('');
  h += row('click', state.click, '📍 ' + t2(F, 'Click Earth for the forecast', 'Cliquez sur la Terre pour la météo'), t2(F, 'Turn this on, then click any place on the globe', 'Activez, puis cliquez n’importe où sur le globe'));
  if (fc) {
    const ll = `${Math.abs(fc.lat).toFixed(1)}°${fc.lat >= 0 ? 'N' : 'S'} ${Math.abs(fc.lon).toFixed(1)}°${fc.lon >= 0 ? 'E' : (F ? 'O' : 'W')}`;
    h += `<div style="margin-top:9px;padding-top:8px;border-top:1px solid rgba(140,160,255,.2)"><b>📍 ${esc(fc.place || ll)}</b>${fc.place ? `<br><span style="font-size:11.5px;opacity:.65">${ll}</span>` : ''}`;
    if (fc.loading) h += `<div style="opacity:.7">⏳ ${t2(F, 'Getting the forecast…', 'Récupération des prévisions…')}</div>`;
    else if (fc.err || !fc.data?.current) h += `<div style="color:#ff9090">${t2(F, 'Couldn’t get the forecast, try again.', 'Prévisions indisponibles, réessayez.')}</div>`;
    else {
      const c = fc.data.current, d = fc.data.daily, [ic, tx] = wmo(c.weather_code, F);
      h += `<div style="display:flex;align-items:center;gap:10px;margin-top:4px"><span style="font-size:34px">${ic}</span><span><b style="font-size:22px">${Math.round(c.temperature_2m)}°C</b><br>${tx}</span></div>
        <div style="font-size:12px;opacity:.85">${t2(F, 'Feels like', 'Ressenti')} ${Math.round(c.apparent_temperature)}°C · ${t2(F, 'humidity', 'humidité')} ${c.relative_humidity_2m}% · ${t2(F, 'wind', 'vent')} ${Math.round(c.wind_speed_10m)} km/h (${t2(F, 'gusts', 'rafales')} ${Math.round(c.wind_gusts_10m)})</div>
        <div style="font-size:11.5px;opacity:.6">${t2(F, 'Local time', 'Heure locale')} ${esc(c.time.slice(11, 16))}</div>
        <div style="display:flex;gap:6px;margin-top:6px">${d.time.map((day, i) => { const [di] = wmo(d.weather_code[i], F);
          const name = i === 0 ? t2(F, 'Today', 'Auj.') : new Date(day + 'T12:00Z').toLocaleDateString(F ? 'fr-FR' : 'en-GB', { weekday: 'short', timeZone: 'UTC' });
          return `<div style="flex:1;text-align:center;background:rgba(255,255,255,.05);border-radius:6px;padding:4px 2px"><div style="font-size:11px;opacity:.75">${name}</div><div style="font-size:20px">${di}</div>
            <div style="font-size:12px">${Math.round(d.temperature_2m_max[i])}° <span style="opacity:.6">${Math.round(d.temperature_2m_min[i])}°</span></div>
            ${d.precipitation_probability_max?.[i] != null ? `<div style="font-size:10.5px;opacity:.7">💧${d.precipitation_probability_max[i]}%</div>` : ''}</div>`; }).join('')}</div>`;
    }
    h += `</div>`;
  }
  h += `<div style="font-size:10.5px;opacity:.55;margin-top:9px;line-height:1.35">${t2(F, 'Sources', 'Sources')}: ${t2(F, 'clouds', 'nuages')} <a href="https://github.com/matteason/live-cloud-maps" target="_blank" rel="noopener">live-cloud-maps</a> (${t2(F, 'contains modified EUMETSAT data', 'contient des données EUMETSAT modifiées')}) ·
    ${t2(F, 'Weather data by', 'Données radar par')} <a href="https://www.rainviewer.com" target="_blank" rel="noopener">RainViewer</a> ·
    ${t2(F, 'cyclones', 'cyclones')} <a href="https://www.gdacs.org" target="_blank" rel="noopener">GDACS</a> · ${t2(F, 'tornadoes', 'tornades')} <a href="https://www.weather.gov" target="_blank" rel="noopener">NOAA/NWS</a> ·
    ${t2(F, 'forecasts', 'prévisions')} <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo.com</a> · ${t2(F, 'places', 'lieux')} <a href="https://www.bigdatacloud.com" target="_blank" rel="noopener">BigDataCloud</a>.
    ${t2(F, 'For official warnings, follow your national weather service.', 'Pour les alertes officielles, suivez votre service météo national.')}</div>`;
  panel.innerHTML = h;
}
panel.addEventListener('change', e => { const k = e.target.dataset?.wx; if (!k) return; const on = e.target.checked;
  ({ clouds: setClouds, radar: setRadar, storms: setStorms, tornado: setTornado, click: v => { state.click = v; if (!v) earthMesh.remove(pinHolder); } })[k](on); render(); });
panel.addEventListener('click', e => {
  if (e.target.id === 'wxClose') return closePanel();
  if (e.target.id === 'wxNow') { toNow(); return render(); }
  const go = e.target.closest?.('[data-go]'); if (go) { e.preventDefault(); flyTo(go.dataset.go); }
});
function openPanel() { panelOpen = true; panel.style.display = 'block'; render(); }
function closePanel() { panelOpen = false; panel.style.display = 'none'; }
setInterval(render, 60000);   // keep the "x min ago" fresh
setInterval(() => {   // sit under the info card; if there's no room, put the card away
  if (!panelOpen) return; const i = $('info'), shown = i && getComputedStyle(i).display !== 'none';
  let top = shown ? i.getBoundingClientRect().bottom + 8 : 44;
  if (innerHeight - top - 64 < 180 && shown) { i.style.display = 'none'; top = 44; }
  panel.style.top = top + 'px'; panel.style.maxHeight = (innerHeight - top - 64) + 'px';
}, 300);
{ const prev = SS.setLang; SS.setLang = (...a) => { const r = prev(...a); if (state.storms && stormAt) loadStorms(); if (state.tornado && tornAt) loadTornado(); render(); return r; }; }

// button in the main panel, and an entry in the menu
{ const row = $('factBtn')?.parentElement; if (row) { const b = document.createElement('button'); b.type = 'button'; b.id = 'wxBtn'; b.textContent = '🌦 Live weather'; row.appendChild(b);
    b.onclick = () => panelOpen ? closePanel() : openPanel(); } }
bodies.LiveWeather = { obj: bodies.Earth.obj, radius: bodies.Earth.radius, view: R * 3.2 };
info('LiveWeather', 'Live weather on Earth', 'Earth · live data', 'clouds, rain, storms and forecasts, right now',
  'Turn on live clouds, rain radar, tropical cyclones and US tornado reports in the 🌦 panel, or click anywhere on Earth for its forecast.');
special.LiveWeather = () => { toNow();
  if (!state.clouds) setClouds(true); if (!state.storms) setStorms(true); openPanel(); flyTo('LiveWeather'); };
{ const views = focusSel.querySelector('optgroup'), o = document.createElement('option'); o.value = 'LiveWeather'; o.textContent = '🌦 Live weather on Earth';
  const after = views.querySelector('option[value="SkyMonth"]') || views.querySelector('option[value="Tonight"]'); after ? after.after(o) : views.appendChild(o); }
SS.weather = { openPanel, closePanel, setClouds, setRadar, setStorms, setTornado, forecast, state, status };
SS.i18nAdd?.({
  ui: { '🌦 Live weather': '🌦 Météo en direct', '🌦 Live weather on Earth': '🌦 Météo en direct sur Terre' },
  name: { '🌦 Live weather on Earth': '🌦 Météo en direct sur Terre', 'Live weather on Earth': 'Météo en direct sur Terre' },
  cat: { 'Earth · live data': 'Terre · données en direct' },
  dist: { 'clouds, rain, storms and forecasts, right now': 'nuages, pluie, tempêtes et prévisions, en ce moment' },
  fact: { 'Turn on live clouds, rain radar, tropical cyclones and US tornado reports in the 🌦 panel, or click anywhere on Earth for its forecast.':
    'Activez les nuages en direct, le radar de pluie, les cyclones tropicaux et les tornades aux États-Unis dans le panneau 🌦, ou cliquez n’importe où sur la Terre pour sa météo.' },
});
