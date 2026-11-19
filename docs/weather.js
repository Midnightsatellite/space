// =====================================================================
// Live weather on Earth, shown only when people ask for it (🌦 button or the menu):
//   ☁ live clouds (EUMETSAT, via live-cloud-maps, every 3 hours)
//   🌧 rain radar (RainViewer, every 10 minutes)
//   🌀 tropical cyclones happening now (GDACS)
//   🌪 tornado reports in the US, last 72 hours (NOAA / National Weather Service)
//   🔎 the forecast for any city (search), and 🏙 major cities as pins on the globe (Open-Meteo)
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
const state = { clouds: false, radar: false, storms: false, tornado: false, cities: false, quakes: false, volcanoes: false, aurora: false };
const status = { clouds: '', radar: '', storms: '', tornado: '', quakes: '', volcanoes: '', aurora: '' };
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

// ---------------------------------------------------------------- 🌍 Earth right now: earthquakes, volcanoes, aurora
// 🔴 earthquakes of the last 24 hours, magnitude 2.5 and up (USGS)
let quakeGroup = new THREE.Group(), quakeList = [], quakeAt = 0;
const rings = [];
sim.push(() => { const t = performance.now() / 1000; for (const r of rings) { const k = (t * 0.6 + r.userData.ph) % 1; r.scale.setScalar(1 + k * 3); r.material.opacity = 0.7 * (1 - k); } });
const shortPlace = p => String(p || '').replace(/^.* of /, '');
async function loadQuakes() {
  status.quakes = '…'; render();
  try {
    const j = await (await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson')).json();
    earthMesh.remove(quakeGroup); quakeGroup = new THREE.Group(); rings.length = 0;
    quakeList = j.features.filter(f => f.properties.mag != null).sort((a, b) => b.properties.mag - a.properties.mag).slice(0, 150);
    quakeList.forEach((f, i) => {
      const p = f.properties, [lon, lat, depth] = f.geometry.coordinates, key = 'WXQuake' + i, F = fr(), mag = p.mag;
      const col = mag >= 6 ? 0xff3cc8 : mag >= 5 ? 0xff3030 : mag >= 4 ? 0xff9020 : 0xffd23a;
      const up = local(lat, lon), m = new THREE.Group(); m.position.copy(up.clone().multiplyScalar(R * 1.002)); quakeGroup.add(m);
      m.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.0035 * Math.pow(1.45, mag - 2.5), 10, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 })));
      if (mag >= 5) { const ring = new THREE.Mesh(new THREE.RingGeometry(R * 0.012, R * 0.015, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
        ring.quaternion.setFromUnitVectors(V(0, 0, 1), up); ring.userData.ph = Math.random(); m.add(ring); rings.push(ring); }
      if (mag >= 4.5) nearLabel(m, `M${mag.toFixed(1)} · ${shortPlace(p.place)}`, R * 0.02, key, 'small', R * 10);
      bodies[key] = { obj: m, radius: R * 0.02, view: R * 1.5, dir: outward(m) }; special[key] = () => flyTo(key);
      info(key, `${t2(F, 'Earthquake', 'Séisme')} M${mag.toFixed(1)}`, t2(F, 'Live Earth · earthquake', 'Terre en direct · séisme'), esc(p.place || ''),
        `<div>${ago(p.time, F)} · ${t2(F, 'depth', 'profondeur')} ${Math.round(depth)} km</div>
         ${p.tsunami ? `<div style="margin-top:4px;color:#ffb070">🌊 ${t2(F, 'A tsunami message was issued: follow official advice.', 'Un message tsunami a été émis : suivez les consignes officielles.')}</div>` : ''}
         <div style="margin-top:6px"><a href="${esc(p.url)}" target="_blank" rel="noopener">${t2(F, 'Details on USGS ↗', 'Détails sur l’USGS ↗')}</a></div>
         <div style="font-size:11px;opacity:.65;margin-top:6px">${t2(F, 'Magnitude is on a log scale: each step up is about 32 times more energy.', 'La magnitude est logarithmique : chaque point de plus, c’est environ 32 fois plus d’énergie.')}</div>`);
      f._key = key;
    });
    if (state.quakes) earthMesh.add(quakeGroup);
    quakeAt = Date.now(); status.quakes = 'ok';
  } catch (e) { status.quakes = 'err'; }
  render();
}
function setQuakes(on) { state.quakes = on; if (on) { earthMesh.add(quakeGroup); if (Date.now() - quakeAt > 10 * 6e4) loadQuakes(); } else earthMesh.remove(quakeGroup); }

// 🌋 volcanoes with an eruption going on (Smithsonian Global Volcanism Program, via NASA EONET)
let volcGroup = new THREE.Group(), volcList = [], volcAt = 0;
async function loadVolcanoes() {
  status.volcanoes = '…'; render();
  try {
    const j = await (await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?category=volcanoes&status=open&limit=80')).json();
    earthMesh.remove(volcGroup); volcGroup = new THREE.Group();
    volcList = j.events.map(e => { const g = e.geometry.at(-1); return { title: e.title.replace(/ Volcano/, ''), lat: g.coordinates[1], lon: g.coordinates[0], since: e.geometry[0].date, src: (e.sources.find(s => s.id === 'SIVolcano') || e.sources[0] || {}).url }; })
      .sort((a, b) => new Date(b.since) - new Date(a.since));
    volcList.forEach((v, i) => {
      const key = 'WXVolc' + i, F = fr(), name = v.title.split(',')[0];
      marker(volcGroup, key, v.lat, v.lon, '🌋', R * 0.045, '🌋 ' + name, R * 12);
      info(key, `🌋 ${v.title}`, t2(F, 'Live Earth · volcano erupting', 'Terre en direct · volcan en éruption'), `${Math.abs(v.lat).toFixed(1)}°${v.lat >= 0 ? 'N' : 'S'} ${Math.abs(v.lon).toFixed(1)}°${v.lon >= 0 ? 'E' : (F ? 'O' : 'W')}`,
        `<div>${t2(F, 'Erupting since', 'En éruption depuis le')} ${esc(new Date(v.since).toLocaleDateString(F ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}</div>
         ${v.src ? `<div style="margin-top:6px"><a href="${esc(v.src)}" target="_blank" rel="noopener">${t2(F, 'Smithsonian volcano page ↗', 'Fiche du volcan (Smithsonian) ↗')}</a></div>` : ''}
         <div style="font-size:11px;opacity:.65;margin-top:6px">${t2(F, 'Some of these eruptions are long and slow, with small explosions on and off.', 'Certaines de ces éruptions sont longues et lentes, avec de petites explosions par intermittence.')}</div>`);
      v._key = key;
    });
    if (state.volcanoes) earthMesh.add(volcGroup);
    volcAt = Date.now(); status.volcanoes = 'ok';
  } catch (e) { status.volcanoes = 'err'; }
  render();
}
function setVolcanoes(on) { state.volcanoes = on; if (on) { earthMesh.add(volcGroup); if (Date.now() - volcAt > 60 * 6e4) loadVolcanoes(); } else earthMesh.remove(volcGroup); }

// 🌌 aurora forecast for the next hour (NOAA SWPC OVATION model) and the Kp storm level
const auroraCanvas = document.createElement('canvas'); auroraCanvas.width = 360; auroraCanvas.height = 181;
const auroraTex = new THREE.CanvasTexture(auroraCanvas); auroraTex.colorSpace = THREE.SRGBColorSpace;
const auroraMesh = new THREE.Mesh(new THREE.SphereGeometry(R * 1.018, 128, 64), new THREE.MeshBasicMaterial({ map: auroraTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
let auroraAt = 0, kp = null, auroraTime = '';
const kpWords = (k, F) => k >= 9 ? t2(F, 'extreme storm (G5)', 'tempête extrême (G5)') : k >= 8 ? t2(F, 'severe storm (G4)', 'tempête sévère (G4)') : k >= 7 ? t2(F, 'strong storm (G3)', 'forte tempête (G3)')
  : k >= 6 ? t2(F, 'moderate storm (G2)', 'tempête modérée (G2)') : k >= 5 ? t2(F, 'minor storm (G1)', 'tempête mineure (G1)') : k >= 4 ? t2(F, 'active', 'actif') : t2(F, 'quiet', 'calme');
async function loadAurora() {
  status.aurora = '…'; render();
  try {
    const [a, k] = await Promise.all([fetch('https://services.swpc.noaa.gov/json/ovation_aurora_latest.json').then(r => r.json()), fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json').then(r => r.json()).catch(() => null)]);
    const g = auroraCanvas.getContext('2d'), img = g.createImageData(360, 181);
    for (const [lon, lat, v] of a.coordinates) { if (v < 3) continue;
      const x = Math.round(lon + 180) % 360, y = 90 - lat, i = (y * 360 + x) * 4, t = Math.min(1, v / 60);
      img.data[i] = 60 + 195 * Math.max(0, t - 0.6) * 2.5; img.data[i + 1] = 255 * Math.min(1, 0.4 + t); img.data[i + 2] = 120 * t; img.data[i + 3] = 255 * Math.min(1, 0.15 + t * 1.2); }
    g.putImageData(img, 0, 0); auroraTex.needsUpdate = true;
    if (Array.isArray(k) && k.length) { const last = k.at(-1); kp = typeof last.Kp === 'number' ? last.Kp : parseFloat(Array.isArray(last) ? last[1] : last.Kp); }
    auroraTime = a['Forecast Time'] || ''; auroraAt = Date.now(); status.aurora = 'ok';
  } catch (e) { status.aurora = 'err'; }
  render();
}
function setAurora(on) { state.aurora = on; if (on) { earthMesh.add(auroraMesh); if (Date.now() - auroraAt > 10 * 6e4) loadAurora(); } else earthMesh.remove(auroraMesh); }
setInterval(() => { if (state.quakes) loadQuakes(); if (state.aurora) loadAurora(); if (state.volcanoes && Date.now() - volcAt > 60 * 6e4) loadVolcanoes(); }, 10 * 6e4);

// ---------------------------------------------------------------- 📍 the forecast for a place (Open-Meteo)
const WMO = { 0: ['☀️', 'Clear sky', 'Ciel dégagé'], 1: ['🌤', 'Mainly clear', 'Plutôt dégagé'], 2: ['⛅', 'Partly cloudy', 'Partiellement nuageux'], 3: ['☁️', 'Overcast', 'Couvert'],
  45: ['🌫', 'Fog', 'Brouillard'], 48: ['🌫', 'Freezing fog', 'Brouillard givrant'], 51: ['🌦', 'Light drizzle', 'Bruine légère'], 53: ['🌦', 'Drizzle', 'Bruine'], 55: ['🌧', 'Heavy drizzle', 'Forte bruine'],
  56: ['🌧', 'Freezing drizzle', 'Bruine verglaçante'], 57: ['🌧', 'Freezing drizzle', 'Bruine verglaçante'], 61: ['🌦', 'Light rain', 'Pluie faible'], 63: ['🌧', 'Rain', 'Pluie'], 65: ['🌧', 'Heavy rain', 'Forte pluie'],
  66: ['🌧', 'Freezing rain', 'Pluie verglaçante'], 67: ['🌧', 'Freezing rain', 'Pluie verglaçante'], 71: ['🌨', 'Light snow', 'Neige faible'], 73: ['🌨', 'Snow', 'Neige'], 75: ['❄️', 'Heavy snow', 'Forte neige'], 77: ['🌨', 'Snow grains', 'Grains de neige'],
  80: ['🌦', 'Showers', 'Averses'], 81: ['🌧', 'Showers', 'Averses'], 82: ['⛈', 'Violent showers', 'Averses violentes'], 85: ['🌨', 'Snow showers', 'Averses de neige'], 86: ['🌨', 'Heavy snow showers', 'Fortes averses de neige'],
  95: ['⛈', 'Thunderstorm', 'Orage'], 96: ['⛈', 'Thunderstorm with hail', 'Orage avec grêle'], 99: ['⛈', 'Thunderstorm with heavy hail', 'Orage avec forte grêle'] };
const wmo = (c, F) => { const w = WMO[c] || ['🌡', '—', '—']; return [w[0], F ? w[2] : w[1]]; };
let fc = null;   // last forecast: {lat, lon, place, data} or {err}
const pin = emojiSprite('📍', R * 0.035); pin.center.set(0.5, 0.1);
const pinHolder = new THREE.Group(); pinHolder.add(pin);
async function forecast(lat, lon, name) {
  pinHolder.position.copy(local(lat, lon).multiplyScalar(R * 1.015)); earthMesh.add(pinHolder);
  fc = { lat, lon, place: name || '', loading: true }; openPanel(); render();
  const F = fr();
  const q = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m,precipitation,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4`;
  const g = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&localityLanguage=${F ? 'fr' : 'en'}`;
  try {
    const [d, p] = await Promise.all([fetch(q).then(r => r.json()), name ? null : fetch(g).then(r => r.json()).catch(() => null)]);
    const place = name || (p ? [p.city || p.locality, p.countryName].filter((x, i, a) => x && a.indexOf(x) === i).join(', ') : '');
    fc = { lat, lon, place, data: d };
  } catch (e) { fc = { lat, lon, err: true }; }
  render();
}
// 🔎 city search (Open-Meteo geocoding) and 🏙 major cities as pins
const CITIES = [   // [English, French, lat, lon]
  ['London', 'Londres', 51.507, -0.128], ['Paris', 'Paris', 48.857, 2.352], ['Berlin', 'Berlin', 52.52, 13.405], ['Madrid', 'Madrid', 40.417, -3.704], ['Rome', 'Rome', 41.903, 12.496],
  ['Lisbon', 'Lisbonne', 38.722, -9.139], ['Dublin', 'Dublin', 53.35, -6.26], ['Brussels', 'Bruxelles', 50.85, 4.352], ['Amsterdam', 'Amsterdam', 52.37, 4.895], ['Bern', 'Berne', 46.948, 7.447],
  ['Geneva', 'Genève', 46.204, 6.143], ['Luxembourg', 'Luxembourg', 49.611, 6.13], ['Vienna', 'Vienne', 48.208, 16.373], ['Warsaw', 'Varsovie', 52.23, 21.012], ['Prague', 'Prague', 50.075, 14.438],
  ['Stockholm', 'Stockholm', 59.329, 18.069], ['Oslo', 'Oslo', 59.914, 10.752], ['Copenhagen', 'Copenhague', 55.676, 12.568], ['Helsinki', 'Helsinki', 60.17, 24.938], ['Reykjavik', 'Reykjavik', 64.147, -21.942],
  ['Athens', 'Athènes', 37.984, 23.728], ['Istanbul', 'Istanbul', 41.008, 28.978], ['Moscow', 'Moscou', 55.756, 37.617], ['Kyiv', 'Kyiv', 50.45, 30.524], ['Cairo', 'Le Caire', 30.044, 31.236],
  ['Casablanca', 'Casablanca', 33.573, -7.59], ['Algiers', 'Alger', 36.754, 3.059], ['Tunis', 'Tunis', 36.806, 10.181], ['Dakar', 'Dakar', 14.716, -17.467], ['Lagos', 'Lagos', 6.524, 3.379],
  ['Kinshasa', 'Kinshasa', -4.441, 15.266], ['Addis Ababa', 'Addis-Abeba', 9.03, 38.74], ['Nairobi', 'Nairobi', -1.292, 36.822], ['Johannesburg', 'Johannesburg', -26.204, 28.047], ['Cape Town', 'Le Cap', -33.925, 18.424],
  ['Dubai', 'Dubaï', 25.205, 55.271], ['Riyadh', 'Riyad', 24.713, 46.675], ['Tehran', 'Téhéran', 35.689, 51.389], ['Karachi', 'Karachi', 24.861, 67.01], ['Delhi', 'Delhi', 28.614, 77.209],
  ['Mumbai', 'Bombay', 19.076, 72.878], ['Dhaka', 'Dacca', 23.81, 90.413], ['Bangkok', 'Bangkok', 13.756, 100.502], ['Singapore', 'Singapour', 1.352, 103.82], ['Jakarta', 'Jakarta', -6.208, 106.846],
  ['Manila', 'Manille', 14.6, 120.984], ['Hong Kong', 'Hong Kong', 22.32, 114.17], ['Beijing', 'Pékin', 39.904, 116.407], ['Shanghai', 'Shanghai', 31.23, 121.474], ['Seoul', 'Séoul', 37.567, 126.978],
  ['Tokyo', 'Tokyo', 35.676, 139.65], ['Sydney', 'Sydney', -33.869, 151.209], ['Melbourne', 'Melbourne', -37.814, 144.963], ['Auckland', 'Auckland', -36.848, 174.763], ['Honolulu', 'Honolulu', 21.307, -157.858],
  ['Anchorage', 'Anchorage', 61.218, -149.9], ['Vancouver', 'Vancouver', 49.283, -123.121], ['San Francisco', 'San Francisco', 37.775, -122.419], ['Los Angeles', 'Los Angeles', 34.052, -118.244], ['Mexico City', 'Mexico', 19.433, -99.133],
  ['Chicago', 'Chicago', 41.878, -87.63], ['Toronto', 'Toronto', 43.653, -79.383], ['Montreal', 'Montréal', 45.502, -73.567], ['New York', 'New York', 40.713, -74.006], ['Washington', 'Washington', 38.907, -77.037],
  ['Miami', 'Miami', 25.762, -80.192], ['Havana', 'La Havane', 23.113, -82.366], ['Bogotá', 'Bogota', 4.711, -74.072], ['Lima', 'Lima', -12.046, -77.043], ['Santiago', 'Santiago', -33.449, -70.669],
  ['Buenos Aires', 'Buenos Aires', -34.604, -58.382], ['São Paulo', 'São Paulo', -23.551, -46.633], ['Rio de Janeiro', 'Rio de Janeiro', -22.907, -43.173], ['Brasília', 'Brasilia', -15.794, -47.882], ['Kourou', 'Kourou', 5.16, -52.65],
];
let cityGroup = null;
function buildCities() {
  cityGroup = new THREE.Group();
  CITIES.forEach(([en, f, lat, lon], i) => { const key = 'WXCity' + i, m = new THREE.Group(); m.position.copy(local(lat, lon).multiplyScalar(R * 1.004)); cityGroup.add(m);
    m.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.006, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd36a })));
    nearLabel(m, en, R * 0.012, key, 'small', R * 9);
    bodies[key] = { obj: m, radius: R * 0.02, view: R * 1.4, dir: outward(m) }; special[key] = () => flyTo(key);
    info(key, en, 'Live weather · city', `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`, 'The forecast is in the 🌦 Live weather panel.'); });
  SS.i18nAdd?.({ name: Object.fromEntries(CITIES.filter(c => c[0] !== c[1]).map(c => [c[0], c[1]])), cat: { 'Live weather · city': 'Météo en direct · ville' },
    fact: { 'The forecast is in the 🌦 Live weather panel.': 'La météo est dans le panneau 🌦 Météo en direct.' } });
}
function setCities(on) { state.cities = on; if (on && !cityGroup) buildCities(); if (cityGroup) on ? earthMesh.add(cityGroup) : earthMesh.remove(cityGroup); }
{ const prev = SS.onFocus; SS.onFocus = key => { prev(key); const m = /^WXCity(\d+)$/.exec(key || ''); if (m) { const c = CITIES[+m[1]]; forecast(c[2], c[3], fr() ? c[1] : c[0]); } }; }
// a place the camera can fly to for a searched city
const placeObj = new THREE.Group(); earthMesh.add(placeObj);
bodies.WXPlace = { obj: placeObj, radius: R * 0.02, view: R * 1.6, dir: outward(placeObj) };
function goPlace(lat, lon, name) { placeObj.position.copy(local(lat, lon).multiplyScalar(R)); forecast(lat, lon, name);
  info('WXPlace', name, t2(fr(), 'Live weather · city', 'Météo en direct · ville'), `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : (fr() ? 'O' : 'W')}`,
    t2(fr(), 'The forecast is in the 🌦 Live weather panel.', 'La météo est dans le panneau 🌦 Météo en direct.'));
  flyTo('WXPlace'); }
let search = { q: '', results: [], busy: false }, searchTimer = 0;
async function runSearch(q) {
  const F = fr(), low = q.trim().toLowerCase(); if (low.length < 2) { search.results = []; return render(); }
  const local = CITIES.filter(c => c[0].toLowerCase().startsWith(low) || c[1].toLowerCase().startsWith(low)).slice(0, 3).map(c => ({ name: F ? c[1] : c[0], sub: '', lat: c[2], lon: c[3] }));
  search.busy = true; render();
  try { const j = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=8&language=${F ? 'fr' : 'en'}`)).json();
    const web = (j.results || []).map(r => ({ name: r.name, sub: [r.admin1, r.country].filter(Boolean).join(', '), lat: r.latitude, lon: r.longitude }));
    search.results = [...local, ...web.filter(w => !local.some(l => Math.abs(l.lat - w.lat) < 0.3 && Math.abs(l.lon - w.lon) < 0.3))].slice(0, 8);
  } catch (e) { search.results = local; }
  search.busy = false; if (search.q === q) render();
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
  h += `<div style="margin-top:10px;padding-top:6px;border-top:1px solid rgba(140,160,255,.2);font-size:12px;opacity:.75">🌍 ${t2(F, 'Earth right now', 'La Terre en ce moment')}</div>`;
  h += row('quakes', state.quakes, '🔴 ' + t2(F, 'Earthquakes (last 24 h)', 'Séismes (dernières 24 h)') + dot(status.quakes),
    status.quakes === 'err' ? t2(F, 'Couldn’t load the list.', 'Liste indisponible.') : state.quakes && status.quakes === 'ok' ? `${quakeList.length} ${t2(F, 'of magnitude 2.5 or more', 'de magnitude 2,5 ou plus')}` : t2(F, 'Every quake of magnitude 2.5 or more, sized by strength', 'Chaque séisme de magnitude 2,5 ou plus, à sa taille'));
  if (state.quakes && quakeList.length) h += quakeList.slice(0, 5).map(q => `<div style="margin:3px 0 0 26px;font-size:12px"><a href="#" data-go="${q._key}">M${q.properties.mag.toFixed(1)} · ${esc(shortPlace(q.properties.place))}</a> <span style="opacity:.65">${ago(q.properties.time, F)}</span></div>`).join('');
  h += row('volcanoes', state.volcanoes, '🌋 ' + t2(F, 'Volcanoes erupting now', 'Volcans en éruption') + dot(status.volcanoes),
    status.volcanoes === 'err' ? t2(F, 'Couldn’t load the list.', 'Liste indisponible.') : state.volcanoes && status.volcanoes === 'ok' ? `${volcList.length} ${t2(F, 'ongoing eruptions', 'éruptions en cours')}` : t2(F, 'Ongoing eruptions around the world', 'Éruptions en cours dans le monde'));
  if (state.volcanoes && volcList.length) h += volcList.slice(0, 5).map(v => `<div style="margin:3px 0 0 26px;font-size:12px"><a href="#" data-go="${v._key}">🌋 ${esc(v.title)}</a></div>`).join('');
  h += row('aurora', state.aurora, '🌌 ' + t2(F, 'Aurora forecast', 'Prévision des aurores') + dot(status.aurora),
    status.aurora === 'err' ? t2(F, 'Couldn’t load the forecast.', 'Prévision indisponible.') : state.aurora && kp != null ? `Kp ${kp.toFixed(1)} · ${kpWords(kp, F)} · ${t2(F, 'the green ring shows where the northern and southern lights may be seen in the next hour', 'l’anneau vert montre où les aurores pourraient être visibles dans l’heure')}` : t2(F, 'Where the northern and southern lights are expected in the next hour', 'Où les aurores sont attendues dans l’heure'));
  h += `<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(140,160,255,.2)"><b>🔎 ${t2(F, 'Forecast for a city', 'Météo d’une ville')}</b>
    <input id="wxSearch" type="search" autocomplete="off" placeholder="${t2(F, 'Type a city… (London, Tokyo, Dakar)', 'Tapez une ville… (Paris, Tokyo, Dakar)')}" style="display:block;width:100%;box-sizing:border-box;margin-top:5px;background:#141a33;color:#e6ebff;border:1px solid #2c3766;border-radius:6px;padding:5px 8px;font-size:13px">
    ${search.busy ? `<div style="font-size:12px;opacity:.6;margin-top:3px">⏳</div>` : ''}
    ${search.results.map((r, i) => `<div><a href="#" data-city="${i}" style="display:block;padding:3px 2px;font-size:12.5px">📍 ${esc(r.name)}${r.sub ? ` <span style="opacity:.6">· ${esc(r.sub)}</span>` : ''}</a></div>`).join('')}
    ${search.q.trim().length >= 2 && !search.busy && !search.results.length ? `<div style="font-size:12px;opacity:.6;margin-top:3px">${t2(F, 'No place found', 'Aucun lieu trouvé')}</div>` : ''}</div>`;
  h += row('cities', state.cities, '🏙 ' + t2(F, 'Major cities on the globe', 'Grandes villes sur le globe'), t2(F, 'Capitals and big cities: click a name for its forecast', 'Capitales et grandes villes : cliquez sur un nom pour sa météo'));
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
    ${t2(F, 'forecasts', 'prévisions')} <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo.com</a> · ${t2(F, 'earthquakes', 'séismes')} <a href="https://earthquake.usgs.gov" target="_blank" rel="noopener">USGS</a> · ${t2(F, 'volcanoes', 'volcans')} <a href="https://volcano.si.edu" target="_blank" rel="noopener">Smithsonian GVP</a> via <a href="https://eonet.gsfc.nasa.gov" target="_blank" rel="noopener">NASA EONET</a> · ${t2(F, 'aurora', 'aurores')} <a href="https://www.swpc.noaa.gov" target="_blank" rel="noopener">NOAA SWPC</a> · ${t2(F, 'city search', 'recherche de villes')} <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a> / <a href="https://www.geonames.org" target="_blank" rel="noopener">GeoNames</a>.
    ${t2(F, 'For official warnings, follow your national weather service.', 'Pour les alertes officielles, suivez votre service météo national.')}</div>`;
  const old = $('wxSearch'), focused = document.activeElement === old, pos = old?.selectionStart;
  panel.innerHTML = h;
  const ni = $('wxSearch'); if (ni) { ni.value = search.q; if (focused) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (e) { } } }
}
panel.addEventListener('change', e => { const k = e.target.dataset?.wx; if (!k) return; const on = e.target.checked;
  ({ clouds: setClouds, radar: setRadar, storms: setStorms, tornado: setTornado, cities: setCities, quakes: setQuakes, volcanoes: setVolcanoes, aurora: setAurora })[k](on); render(); });
panel.addEventListener('input', e => { if (e.target.id !== 'wxSearch') return; search.q = e.target.value; clearTimeout(searchTimer); const q = search.q; searchTimer = setTimeout(() => runSearch(q), 350); });
panel.addEventListener('keydown', e => { if (e.target.id === 'wxSearch') { e.stopPropagation(); if (e.key === 'Enter' && search.results[0]) { const r = search.results[0]; search.results = []; search.q = ''; goPlace(r.lat, r.lon, r.name); } } });
panel.addEventListener('click', e => {
  if (e.target.id === 'wxClose') return closePanel();
  if (e.target.id === 'wxNow') { toNow(); return render(); }
  const go = e.target.closest?.('[data-go]'); if (go) { e.preventDefault(); flyTo(go.dataset.go); }
  const ct = e.target.closest?.('[data-city]'); if (ct) { e.preventDefault(); const r = search.results[+ct.dataset.city]; if (r) { search.results = []; search.q = ''; goPlace(r.lat, r.lon, r.name); } }
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
{ const prev = SS.setLang; SS.setLang = (...a) => { const r = prev(...a); if (state.storms && stormAt) loadStorms(); if (state.tornado && tornAt) loadTornado(); if (state.quakes && quakeAt) loadQuakes(); if (state.volcanoes && volcAt) loadVolcanoes(); render(); return r; }; }

// button in the main panel, and an entry in the menu
{ const row = $('factBtn')?.parentElement; if (row) { const b = document.createElement('button'); b.type = 'button'; b.id = 'wxBtn'; b.textContent = '🌦 Live weather'; row.appendChild(b);
    b.onclick = () => panelOpen ? closePanel() : openPanel(); } }
bodies.LiveWeather = { obj: bodies.Earth.obj, radius: bodies.Earth.radius, view: R * 3.2 };
info('LiveWeather', 'Live weather on Earth', 'Earth · live data', 'clouds, rain, storms and forecasts, right now',
  'Turn on live clouds, rain radar, tropical cyclones and US tornado reports in the 🌦 panel, or search any city for its forecast.');
special.LiveWeather = () => { toNow();
  if (!state.clouds) setClouds(true); if (!state.storms) setStorms(true); openPanel(); flyTo('LiveWeather'); };
{ const views = focusSel.querySelector('optgroup'), o = document.createElement('option'); o.value = 'LiveWeather'; o.textContent = '🌦 Live weather on Earth';
  const after = views.querySelector('option[value="SkyMonth"]') || views.querySelector('option[value="Tonight"]'); after ? after.after(o) : views.appendChild(o); }
SS.weather = { setQuakes, setVolcanoes, setAurora, loadAurora, openPanel, closePanel, setClouds, setRadar, setStorms, setTornado, setCities, forecast, goPlace, runSearch, state, status, search };
SS.i18nAdd?.({
  ui: { '🌦 Live weather': '🌦 Météo en direct', '🌦 Live weather on Earth': '🌦 Météo en direct sur Terre' },
  name: { '🌦 Live weather on Earth': '🌦 Météo en direct sur Terre', 'Live weather on Earth': 'Météo en direct sur Terre' },
  cat: { 'Earth · live data': 'Terre · données en direct' },
  dist: { 'clouds, rain, storms and forecasts, right now': 'nuages, pluie, tempêtes et prévisions, en ce moment' },
  fact: { 'Turn on live clouds, rain radar, tropical cyclones and US tornado reports in the 🌦 panel, or search any city for its forecast.':
    'Activez les nuages en direct, le radar de pluie, les cyclones tropicaux et les tornades aux États-Unis dans le panneau 🌦, ou cherchez une ville pour sa météo.' },
});
