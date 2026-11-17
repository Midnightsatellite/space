// =====================================================================
// Meteor calendar + where the dust comes from · visitors from other stars card · postcard · install button
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { scene, camera, bodies, sim, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const { auToScene, scaleHide, J2000 } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const special = SS.more.special;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const go = k => { focusSel.value = k; SS.go(k); };
const addOpt = (group, k, t, first) => { const og = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === group); if (!og) return; const o = document.createElement('option'); o.value = k; o.textContent = t; first ? og.prepend(o) : og.appendChild(o); };
const moonLit = ms => { const age = (((ms - Date.UTC(2000, 0, 6, 18, 14)) / 864e5 / 29.530588853) % 1 + 1) % 1; return (1 - Math.cos(2 * Math.PI * age)) / 2; };

// =====================================================================
// 1. METEOR SHOWERS: a calendar, and the dust trail Earth flies through
// =====================================================================
const SHOWERS = SS.more.SHOWERS || [];
// rough shape of each parent's orbit (perihelion in AU, eccentricity, tilt in degrees), enough to draw its dust trail
const ORB = { Quadrantids: [0.98, 0.68, 72], Lyrids: [0.92, 0.98, 80], EtaAquariids: [0.586, 0.967, 162], Perseids: [0.96, 0.963, 113], Draconids: [0.996, 0.71, 32],
  Orionids: [0.586, 0.967, 162], Leonids: [0.98, 0.906, 162], Geminids: [0.14, 0.89, 22], Ursids: [0.99, 0.82, 54] };
const COL = { Quadrantids: 0x9fd0ff, Lyrids: 0xc8b0ff, EtaAquariids: 0xffd27a, Perseids: 0x8fffd0, Draconids: 0xff9fb0, Orionids: 0xffd27a, Leonids: 0xffb070, Geminids: 0xa0ffb0, Ursids: 0xb0e0ff };
const parentFr = p => p.replace("Halley's Comet", 'la comète de Halley').replace(/^Comet /, 'la comète ').replace(/^asteroid /, "l'astéroïde ");
const nextPeak = (sh, from) => { const y = new Date(from).getUTCFullYear(); let t = Date.UTC(y, sh[4][0], sh[4][1], 2); if (t < from - 864e5) t = Date.UTC(y + 1, sh[4][0], sh[4][1], 2); return t; };
{
  const streams = {};
  const earthAt = ms => { const d = (ms - J2000) / 864e5, lam = SS.astro.planetLon('Earth', d) * D2R; return { N: V(Math.cos(lam), 0, -Math.sin(lam)), T: V(-Math.sin(lam), 0, -Math.cos(lam)) }; };
  function build(sh) {
    const [k] = sh, [q, e, inc] = ORB[k] || [0.9, 0.9, 60];
    const g = new THREE.Group(); g.visible = false; scene.add(g); scaleHide.push(g);
    const { N, T } = earthAt(nextPeak(sh, Date.now()));
    const W = T.clone().multiplyScalar(Math.cos(inc * D2R)).add(V(0, Math.sin(inc * D2R), 0)).normalize();
    const p = q * (1 + e), nu0 = Math.acos(Math.max(-1, Math.min(1, (p - 1) / e)));
    const rMax = 8, cMax = Math.min(1, (p / rMax - 1) / e), nuMax = e < 1 && q * (1 + e) / (1 - e) < rMax ? Math.PI : Math.acos(Math.max(-1, cMax));
    const at = nu => { const r = p / (1 + e * Math.cos(nu)), a = nu - nu0; return N.clone().multiplyScalar(Math.cos(a)).addScaledVector(W, Math.sin(a)).multiplyScalar(auToScene(r)); };
    const line = []; for (let i = 0; i <= 400; i++) line.push(at(-nuMax + 2 * nuMax * i / 400));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line), new THREE.LineBasicMaterial({ color: COL[k], transparent: true, opacity: 0.35 })));
    const n = 7000, pos = new Float32Array(n * 3), rnd = () => (Math.random() + Math.random() + Math.random() - 1.5);
    for (let i = 0; i < n; i++) {
      const nu = i < n * 0.35 ? nu0 + rnd() * 0.25 : -nuMax + 2 * nuMax * Math.random();      // thicker where Earth crosses it
      const c = at(nu), s = 0.015 * c.length() + 0.25; pos.set([c.x + rnd() * s, c.y + rnd() * s, c.z + rnd() * s], i * 3);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: COL[k], size: 0.22, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })));
    const cross = new THREE.Object3D(); cross.position.copy(at(nu0)); g.add(cross);
    return { g, cross };
  }
  for (const sh of SHOWERS) {
    const [k, name, , , pk, , , rate, parent] = sh, key = 'MD_' + k;
    let s = null; const get = () => s ||= (streams[k] = build(sh));
    const holder = new THREE.Object3D(); scene.add(holder);
    bodies[key] = { obj: holder, radius: 4, view: 46, selfLit: true, dir: () => V(0.25, 1, 0.45).normalize() };
    const card = () => {
      const date = fr() ? `${pk[1]} ${MON_FR[pk[0]]}` : `${pk[1]} ${MON[pk[0]]}`;
      return fr() ? `Chaque année vers le ${date}, la Terre traverse cette traînée de poussière laissée par ${parentFr(parent)}. Des grains, souvent plus petits qu'un grain de sable, entrent dans l'atmosphère à des dizaines de km/s et brûlent : ce sont les étoiles filantes, jusqu'à environ ${rate} par heure au maximum sous un ciel bien noir. La forme dessinée est approximative.`
        : `Every year around ${date}, Earth ploughs through this trail of dust left behind by ${parent}. Grains, often smaller than a grain of sand, hit the air at tens of km per second and burn up as shooting stars: up to about ${rate} an hour at the peak, under a really dark sky. The shape drawn is approximate.`;
    };
    info(key, `${name}: where the dust comes from`, 'Meteor shower', `the trail of ${parent}`, card());
    SS.i18nAdd?.({ name: { [`${name}: where the dust comes from`]: `${name} : d'où vient la poussière` }, dist: { [`the trail of ${parent}`]: `la traînée de ${parentFr(parent)}` } });
    special[key] = () => {
      const st = get(); for (const o of Object.values(streams)) o.g.visible = false; st.g.visible = true;
      holder.position.copy(st.cross.position); SS.setDate(nextPeak(sh, Date.now())); if ($('speed')) $('speed').value = '0.0416667';
      INFO[key].fact = card(); if (SS.more.INFO_EN?.[key]) SS.more.INFO_EN[key].fact = INFO[key].fact; SS.i18nAdd?.({ fact: { [key]: card() } });
      setTimeout(() => flyTo(key), 120);
    };
  }
  { const prev = SS.onFocus; SS.onFocus = k => { if (!k.startsWith('MD_')) for (const o of Object.values(streams)) o.g.visible = false; prev(k); }; }

  // ---------- the calendar card ----------
  const html = () => {
    const now = Date.now(), F = fr();
    const rows = SHOWERS.map(sh => ({ sh, t: nextPeak(sh, now) })).sort((a, b) => a.t - b.t).map(({ sh, t }) => {
      const [k, name, , , pk, , , rate] = sh, days = Math.floor((t - now) / 864e5), lit = Math.round(moonLit(t) * 100), y = new Date(t).getUTCFullYear();
      const when = (F ? `vers le ${pk[1]} ${MON_FR[pk[0]]} ${y}` : `around ${pk[1]} ${MON[pk[0]]} ${y}`) + (days <= 1 ? (F ? ' · <b style="display:inline;color:#8fffb0">cette nuit !</b>' : ' · <b style="display:inline;color:#8fffb0">tonight!</b>') : F ? ` · dans ${days} jours` : ` · in ${days} days`);
      const moon = lit < 30 ? (F ? `Lune ${lit} % : ciel sombre 👍` : `Moon ${lit}% lit: dark sky 👍`) : lit > 65 ? (F ? `Lune ${lit} % : lumineuse` : `Moon ${lit}% lit: bright`) : (F ? `Lune ${lit} %` : `Moon ${lit}% lit`);
      return `<div style="padding:5px 0;border-top:1px solid rgba(140,160,255,.15)"><span style="font-size:11px;color:#ffd27a">${when}</span><br><b style="display:inline;font-size:13px">☄ ${name}</b> <span style="opacity:.75">· ${F ? `jusqu'à ~${rate}/h` : `up to ~${rate}/h`} · ${moon}</span><br>
        <a href="#" class="mgo" data-go="MET_${k}" style="color:#9fd0ff">${F ? '🔭 dans le ciel de Londres' : '🔭 in the London sky'}</a> · <a href="#" class="mgo" data-go="MD_${k}" style="color:#9fd0ff">${F ? "🌌 d'où vient la poussière" : '🌌 where the dust comes from'}</a></div>`;
    }).join('');
    return (F ? "Les prochains pics. Le meilleur moment est en général après minuit, loin des lumières de la ville, en laissant 20 minutes à vos yeux pour s'habituer au noir."
      : 'The next peaks. The best time is usually after midnight, away from city lights, giving your eyes 20 minutes to get used to the dark.') + `<div style="max-height:min(52vh,420px);overflow:auto;margin-top:4px">${rows}</div>`;
  };
  bodies.MeteorCal = { obj: bodies.Earth.obj, radius: 1, view: 4.2 };
  info('MeteorCal', '📅 Meteor shower calendar', 'Shooting stars', 'when Earth crosses the dust of comets', html());
  const prev = SS.onFocus; SS.onFocus = key => {
    if (key === 'MeteorCal') { INFO.MeteorCal.fact = html(); if (SS.more.INFO_EN?.MeteorCal) SS.more.INFO_EN.MeteorCal.fact = INFO.MeteorCal.fact; }
    prev(key);
    if (key === 'MeteorCal') for (const a of $('info').querySelectorAll('.mgo')) a.onclick = e => { e.preventDefault(); go(a.dataset.go); };
  };
  addOpt('Meteor showers', 'MeteorCal', '📅 Meteor shower calendar', true);
}

// =====================================================================
// 2. VISITORS FROM OTHER STARS: one card comparing all three
// =====================================================================
{
  const LIST = [['IV_oum', "1I/'Oumuamua", ['found 19 Oct 2017 in Hawaii', 'trouvé le 19 oct. 2017 à Hawaï'], 26, ['long and thin, no tail; sped up slightly as it left', 'long et fin, sans queue ; a légèrement accéléré en repartant']],
    ['IV_bor', '2I/Borisov', ['found 30 Aug 2019 by an amateur in Crimea', 'trouvé le 30 août 2019 par un amateur en Crimée'], 32, ['a real comet with a tail, rich in carbon monoxide', 'une vraie comète avec une queue, riche en monoxyde de carbone']],
    ['IV_atl', '3I/ATLAS', ['found 1 Jul 2025 in Chile', 'trouvé le 1er juil. 2025 au Chili'], 58, ['the fastest; passed the Sun on 29 Oct 2025, rich in carbon dioxide', 'le plus rapide ; passé près du Soleil le 29 oct. 2025, riche en dioxyde de carbone']]];
  const html = () => {
    const F = fr(), i = F ? 1 : 0;
    return (F ? "Seulement trois objets venus d'autres étoiles ont été vus traverser notre Système solaire. Ils vont trop vite pour que le Soleil les retienne et repartent pour toujours. Vitesse loin du Soleil :" : 'Only three objects from other stars have ever been seen passing through our Solar System. They move too fast for the Sun to hold on to them, and leave for good. Speed far from the Sun:')
      + LIST.map(([k, n, f, v, d]) => `<div class="vgo" data-go="${k}" style="cursor:pointer;padding:5px 0;border-top:1px solid rgba(140,160,255,.15)"><b style="display:inline;font-size:13px">${n}</b> <span style="color:#ffd27a">· ${v} km/s</span><br><span style="opacity:.8;font-size:12px">${f[i]} · ${d[i]}</span>
        <div style="height:5px;margin-top:3px;border-radius:3px;background:linear-gradient(90deg,#9fd0ff,#ffd27a);width:${Math.round(v / 58 * 100)}%"></div></div>`).join('')
      + `<div style="font-size:11px;opacity:.6;margin-top:6px">${F ? 'Touchez un nom pour voir sa trajectoire.' : 'Tap a name to see its path.'}</div>`;
  };
  bodies.VisitorsAll = { obj: bodies.Sun.obj, radius: 3, view: 60 };
  info('VisitorsAll', '🌠 Visitors from other stars', 'Interstellar objects', '3 found so far: 2017, 2019, 2025', html());
  const prev = SS.onFocus; SS.onFocus = key => {
    if (key === 'VisitorsAll') { INFO.VisitorsAll.fact = html(); if (SS.more.INFO_EN?.VisitorsAll) SS.more.INFO_EN.VisitorsAll.fact = INFO.VisitorsAll.fact; }
    prev(key);
    if (key === 'VisitorsAll') for (const el of $('info').querySelectorAll('.vgo')) el.onclick = () => go(el.dataset.go);
  };
  addOpt('Interstellar visitors', 'VisitorsAll', '🌠 All three visitors compared', true);
}

// =====================================================================
// 3. POSTCARD: save the view as a picture with the Midnight Satellite mark
// =====================================================================
const row = $('factBtn').parentElement;
const btn = (id, text) => { const b = document.createElement('button'); b.type = 'button'; b.id = id; b.textContent = text; row.appendChild(b); return b; };
{
  const b = btn('postBtn', '📸 Postcard');
  b.onclick = async () => {
    const r = SS.renderer, src = r.domElement;
    r.render(scene, camera);                                            // draw a fresh frame, then copy it straight away
    const W = Math.min(1920, src.width), H = Math.round(src.height * W / src.width);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.drawImage(src, 0, 0, W, H);
    const k = SS.getFocus?.(), inf = $('info'), title = (inf.style.display !== 'none' && inf.querySelector('b')?.textContent) || (k && INFO[k]?.name) || (fr() ? 'Le Système solaire' : 'The Solar System');
    const g = x.createLinearGradient(0, H * 0.72, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)'); x.fillStyle = g; x.fillRect(0, H * 0.7, W, H * 0.3);
    const s = W / 1280;
    x.fillStyle = '#fff'; x.font = `600 ${Math.round(34 * s)}px system-ui,-apple-system,Segoe UI,sans-serif`; x.textBaseline = 'alphabetic';
    x.fillText(title, 36 * s, H - 70 * s);
    x.fillStyle = '#cfe0ff'; x.font = `${Math.round(18 * s)}px system-ui,-apple-system,Segoe UI,sans-serif`; x.fillText(($('clock')?.textContent || '').trim(), 36 * s, H - 40 * s);
    x.textAlign = 'right'; x.fillStyle = '#ffd27a'; x.font = `600 ${Math.round(20 * s)}px system-ui,-apple-system,Segoe UI,sans-serif`; x.fillText('🛰 Midnight Satellite', W - 36 * s, H - 70 * s);
    x.fillStyle = '#cfe0ff'; x.font = `${Math.round(15 * s)}px system-ui,-apple-system,Segoe UI,sans-serif`; x.fillText('midnightsatellite.github.io/space', W - 36 * s, H - 42 * s);
    const name = 'midnight-satellite-' + String(k || 'space').replace(/[^\w-]+/g, '-').toLowerCase() + '.png';
    c.toBlob(async blob => {
      const file = new File([blob], name, { type: 'image/png' });
      try { if (navigator.canShare?.({ files: [file] }) && matchMedia('(pointer:coarse)').matches) { await navigator.share({ files: [file], title }); return; } } catch (e) { if (e.name === 'AbortError') return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  };
}

// =====================================================================
// 4. INSTALL AS AN APP: a real button (or the steps, where the browser has no install prompt)
// =====================================================================
{
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const b = btn('installBtn', '📲 Install app');
  if (standalone) b.style.display = 'none';
  addEventListener('appinstalled', () => { b.style.display = 'none'; });
  const pop = document.createElement('div'); pop.className = 'pop'; pop.innerHTML = '<div class="box"></div>'; document.body.appendChild(pop);
  pop.onclick = e => { if (e.target === pop || e.target.id === 'insX') pop.classList.remove('on'); };
  b.onclick = async () => {
    const ev = window.__bip;
    if (ev) { ev.prompt(); try { const r = await ev.userChoice; if (r.outcome === 'accepted') b.style.display = 'none'; } catch (e) { } window.__bip = null; return; }
    const F = fr(), ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), android = /Android/.test(ua), safari = /Safari/.test(ua) && !/Chrome|CriOS|Edg/.test(ua);
    const steps = ios ? (F ? ['Touchez le bouton Partager ⬆︎ (en bas ou en haut de Safari).', 'Choisissez « Sur l\'écran d\'accueil ».', 'Touchez « Ajouter ».'] : ['Tap the Share button ⬆︎ (at the bottom or top of Safari).', 'Choose “Add to Home Screen”.', 'Tap “Add”.'])
      : android ? (F ? ['Touchez le menu ⋮ de Chrome (en haut à droite).', 'Choisissez « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ».'] : ['Tap Chrome’s ⋮ menu (top right).', 'Choose “Install app” or “Add to Home screen”.'])
      : safari ? (F ? ['Dans le menu Fichier de Safari, choisissez « Ajouter au Dock… ».', 'Cliquez sur « Ajouter ».'] : ['In Safari’s File menu, choose “Add to Dock…”.', 'Click “Add”.'])
      : (F ? ["Dans Chrome ou Edge, cliquez sur l'icône d'installation à droite de la barre d'adresse (un petit écran avec une flèche).", 'Ou ouvrez le menu ⋮, puis « Enregistrer et partager » › « Installer la page en tant qu\'application ».'] : ['In Chrome or Edge, click the install icon on the right of the address bar (a small screen with an arrow).', 'Or open the ⋮ menu, then “Cast, save and share” › “Install page as app”.']);
    pop.firstChild.innerHTML = `<h3><span>📲 ${F ? "Installer l'application" : 'Install the app'}</span><button type="button" id="insX">✕</button></h3>
      <p style="margin:0 0 6px">${F ? "Space Explorer s'ouvre alors en plein écran, comme une vraie application, avec sa propre icône." : 'Space Explorer then opens full screen like a real app, with its own icon.'}</p><ol style="margin:6px 0 0 18px;padding:0">${steps.map(s => `<li style="margin:5px 0">${s}</li>`).join('')}</ol>`;
    pop.classList.add('on');
  };
  addEventListener('keydown', e => { if (e.key === 'Escape') pop.classList.remove('on'); });
}

SS.i18nAdd?.({
  ui: { '📸 Postcard': '📸 Carte postale', '📲 Install app': "📲 Installer l'appli", '📅 Meteor shower calendar': '📅 Calendrier des étoiles filantes', '🌠 All three visitors compared': '🌠 Les trois visiteurs comparés' },
  name: { '📅 Meteor shower calendar': '📅 Calendrier des étoiles filantes', '🌠 Visitors from other stars': "🌠 Visiteurs venus d'autres étoiles" },
  cat: { 'Shooting stars': 'Étoiles filantes', 'Meteor shower': "Pluie d'étoiles filantes", 'Interstellar objects': 'Objets interstellaires' },
  dist: { 'when Earth crosses the dust of comets': 'quand la Terre traverse la poussière des comètes', '3 found so far: 2017, 2019, 2025': '3 trouvés à ce jour : 2017, 2019, 2025' },
});
await import('./media.js' + new URL(import.meta.url).search);
