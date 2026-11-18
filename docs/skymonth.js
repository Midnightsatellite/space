// =====================================================================
// What's in the sky this month: Moon phases and planet events worked out from the orbits,
// the main meteor showers, and the eclipses of 2026–2028. Arrows step through the months.
// =====================================================================
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const special = SS.more.special;
const D2R = Math.PI / 180, DAY = 864e5, J2000 = Date.UTC(2000, 0, 1, 12);
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const A = SS.astro;
const norm = x => ((x % 360) + 360) % 360, sgn = x => ((x % 360) + 540) % 360 - 180;
const dOf = t => (t - J2000) / DAY;

// heliocentric distance from the true longitude (a, e, longitude of perihelion)
const EL = { Mercury: [0.387098, 0.20563, 77.456], Venus: [0.723332, 0.006773, 131.533], Earth: [1.000001, 0.016710, 102.947],
  Mars: [1.523679, 0.0934, 336.041], Jupiter: [5.2026, 0.048498, 14.331], Saturn: [9.5549, 0.055546, 93.057] };
const helio = (p, d) => { const L = A.planetLon(p, d), [a, e, w] = EL[p], r = a * (1 - e * e) / (1 + e * Math.cos((L - w) * D2R)); return [r * Math.cos(L * D2R), r * Math.sin(L * D2R)]; };
const elong = (p, t) => { const d = dOf(t), [x, y] = helio(p, d), [ex, ey] = helio('Earth', d); return sgn(Math.atan2(y - ey, x - ex) / D2R - A.sunLon(d)); };   // + east of the Sun (evening)
const moonEl = t => { const d = dOf(t); return norm(A.moonPos(d).lam - A.sunLon(d)); };

const NAMES = { Mercury: ['Mercury', 'Mercure'], Venus: ['Venus', 'Vénus'], Mars: ['Mars', 'Mars'], Jupiter: ['Jupiter', 'Jupiter'], Saturn: ['Saturn', 'Saturne'] };
const SHOWERS = [ // name en, fr, peak [month, day], meteors per hour at best, parent
  ['Quadrantids', 'Quadrantides', [0, 3], 110, 'asteroid 2003 EH1', 'l’astéroïde 2003 EH1'], ['Lyrids', 'Lyrides', [3, 22], 18, 'Comet Thatcher', 'la comète Thatcher'],
  ['Eta Aquariids', 'Êta Aquarides', [4, 6], 50, 'Halley’s Comet', 'la comète de Halley'], ['Perseids', 'Perséides', [7, 12], 100, 'Comet Swift–Tuttle', 'la comète Swift-Tuttle'],
  ['Draconids', 'Draconides', [9, 8], 10, 'Comet Giacobini–Zinner', 'la comète Giacobini-Zinner'], ['Orionids', 'Orionides', [9, 21], 20, 'Halley’s Comet', 'la comète de Halley'],
  ['Leonids', 'Léonides', [10, 17], 15, 'Comet Tempel–Tuttle', 'la comète Tempel-Tuttle'], ['Geminids', 'Géminides', [11, 14], 150, 'asteroid 3200 Phaethon', 'l’astéroïde 3200 Phaéton'],
  ['Ursids', 'Ursides', [11, 22], 10, 'Comet Tuttle', 'la comète Tuttle']];
const ECL = [ // date (UTC), [en, fr] type, [en, fr] where it can be seen
  [[2026, 1, 17], ['Annular solar eclipse', 'Éclipse annulaire de Soleil'], ['Antarctica', 'Antarctique']],
  [[2026, 2, 3], ['Total lunar eclipse', 'Éclipse totale de Lune'], ['East Asia, Australia, the Pacific and the Americas', 'Asie de l’Est, Australie, Pacifique et Amériques']],
  [[2026, 7, 12], ['Total solar eclipse', 'Éclipse totale de Soleil'], ['Greenland, Iceland and Spain', 'Groenland, Islande et Espagne']],
  [[2026, 7, 28], ['Partial lunar eclipse', 'Éclipse partielle de Lune'], ['the Americas, Europe and Africa', 'Amériques, Europe et Afrique']],
  [[2027, 1, 6], ['Annular solar eclipse', 'Éclipse annulaire de Soleil'], ['Chile and Argentina; partial in South America and West Africa', 'Chili et Argentine ; partielle en Amérique du Sud et en Afrique de l’Ouest']],
  [[2027, 1, 20], ['Penumbral lunar eclipse', 'Éclipse pénombrale de Lune'], ['the Americas, Europe, Africa and Asia', 'Amériques, Europe, Afrique et Asie']],
  [[2027, 6, 18], ['Penumbral lunar eclipse (very slight)', 'Éclipse pénombrale de Lune (très faible)'], ['where the Moon is up', 'là où la Lune est levée']],
  [[2027, 7, 2], ['Total solar eclipse, over 6 minutes long', 'Éclipse totale de Soleil, plus de 6 minutes'], ['southern Spain, North Africa, Egypt, Saudi Arabia and Yemen', 'sud de l’Espagne, Afrique du Nord, Égypte, Arabie saoudite et Yémen']],
  [[2027, 7, 17], ['Penumbral lunar eclipse', 'Éclipse pénombrale de Lune'], ['where the Moon is up', 'là où la Lune est levée']],
  [[2028, 0, 12], ['Partial lunar eclipse', 'Éclipse partielle de Lune'], ['where the Moon is up', 'là où la Lune est levée']],
  [[2028, 0, 26], ['Annular solar eclipse', 'Éclipse annulaire de Soleil'], ['South America, then Spain and Portugal at sunset', 'Amérique du Sud, puis Espagne et Portugal au coucher du Soleil']],
  [[2028, 6, 6], ['Partial lunar eclipse', 'Éclipse partielle de Lune'], ['where the Moon is up', 'là où la Lune est levée']],
  [[2028, 6, 22], ['Total solar eclipse', 'Éclipse totale de Soleil'], ['Australia (including Sydney) and New Zealand', 'Australie (dont Sydney) et Nouvelle-Zélande']],
  [[2028, 11, 31], ['Total lunar eclipse', 'Éclipse totale de Lune'], ['where the Moon is up', 'là où la Lune est levée']]];

const fmt = (t, F) => new Date(t).toLocaleDateString(F ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
function crossings(f, t0, t1, step, target, win = 40) {   // times where f (degrees) passes through target, rising
  const out = []; let pt = t0, pv = sgn(f(t0) - target);
  for (let t = t0 + step; t <= t1; t += step) { const v = sgn(f(t) - target);
    if (pv < 0 && v >= 0 && v - pv < win) { let a = pt, b = t; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; sgn(f(m) - target) < 0 ? a = m : b = m; } out.push((a + b) / 2); }
    pt = t; pv = v; }
  return out;
}

let offset = 0;   // months from now
function card() {
  const F = fr(), C = F ? ' : ' : ': ', now = new Date(), y = now.getUTCFullYear(), m = now.getUTCMonth() + offset;
  const t0 = Date.UTC(y, m, 1), t1 = Date.UTC(y, m + 1, 1), mid = (t0 + t1) / 2;
  const title = new Date(t0).toLocaleDateString(F ? 'fr-FR' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const row = (ic, txt) => `<div style="margin-top:3px">${ic} ${txt}</div>`;
  const head = h => `<b style="display:block;font-size:13px;margin-top:9px;color:#9fd0ff">${h}</b>`;
  // Moon
  const PH = [[0, '🌑', 'New Moon', 'Nouvelle lune'], [90, '🌓', 'First quarter', 'Premier quartier'], [180, '🌕', 'Full Moon', 'Pleine lune'], [270, '🌗', 'Last quarter', 'Dernier quartier']];
  const ph = []; for (const [g, ic, en, f] of PH) for (const t of crossings(moonEl, t0, t1, 3 * 3600e3, g)) ph.push([t, `${ic} ${F ? f : en} · ${fmt(t, F)}`]);
  ph.sort((a, b) => a[0] - b[0]);
  // planets: where they are mid-month, and this month's events
  const where = [], ev = [];
  for (const p of Object.keys(NAMES)) {
    const n = NAMES[p][F ? 1 : 0], e = elong(p, mid), inner = p === 'Mercury' || p === 'Venus';
    where.push(Math.abs(e) < 15 ? `${n}${C}${F ? 'trop près du Soleil' : 'too close to the Sun'}` : !inner && Math.abs(e) > 150 ? `${n}${C}${F ? 'visible toute la nuit' : 'up all night'}`
      : e > 0 ? `${n}${C}${F ? 'le soir' : 'evening'}` : `${n}${C}${F ? 'le matin' : 'morning'}`);
    let prev = elong(p, t0 - DAY), cur = elong(p, t0);
    for (let t = t0; t < t1; t += DAY) {
      const next = elong(p, t + DAY), day = fmt(t, F);
      if (prev * cur < 0 || (cur === 0)) {   // passes the Sun's direction or the opposite point
        if (Math.abs(cur) < 30) ev.push([t, `☀ ${n}${C}${inner ? (F ? 'passe devant ou derrière le Soleil, invisible' : 'passes in line with the Sun, out of sight') : (F ? 'derrière le Soleil, invisible' : 'behind the Sun, out of sight')} · ${day}`]);
        else ev.push([t, `⭐ ${n}${C}${F ? 'à l’opposition, au plus brillant, visible toute la nuit' : 'at opposition: biggest and brightest, up all night'} · ${day}`]);
      }
      if (inner && Math.abs(cur) > Math.abs(prev) && Math.abs(cur) >= Math.abs(next) && Math.abs(cur) > 15)
        ev.push([t, `↔ ${n}${C}${F ? `au plus loin du Soleil (${Math.round(Math.abs(cur))}°), ${cur > 0 ? 'le soir' : 'le matin'}` : `farthest from the Sun (${Math.round(Math.abs(cur))}°), in the ${cur > 0 ? 'evening' : 'morning'}`} · ${day}`]);
      prev = cur; cur = next;
    }
  }
  ev.sort((a, b) => a[0] - b[0]);
  const met = SHOWERS.filter(s => s[2][0] === ((m % 12) + 12) % 12).map(s => `☄ ${F ? s[1] : s[0]} · ${F ? 'pic le' : 'peak'} ${fmt(Date.UTC(y, m, s[2][1]), F)} · ${F ? `jusqu’à ~${s[3]} par heure` : `up to ~${s[3]} an hour`} (${F ? s[5] : s[4]})`);
  const ecl = ECL.filter(([[Y, M, Dd]]) => { const t = Date.UTC(Y, M, Dd); return t >= t0 && t < t1; }).map(([[Y, M, Dd], k, w]) => `🌘 ${F ? k[1] : k[0]} · ${fmt(Date.UTC(Y, M, Dd), F)} · ${F ? w[1] : w[0]}`);
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px">
      <button type="button" id="skyPrev" aria-label="${F ? 'Mois précédent' : 'Previous month'}">◀</button>
      <b style="display:inline;font-size:15px;text-transform:capitalize">${title}</b>
      <button type="button" id="skyNext" aria-label="${F ? 'Mois suivant' : 'Next month'}">▶</button></div>
    ${head(F ? '🌙 La Lune' : '🌙 The Moon')}${ph.map(x => row('', x[1])).join('')}
    ${head(F ? '🪐 Les planètes (au milieu du mois)' : '🪐 The planets (mid-month)')}${where.map(x => row('·', x)).join('')}
    ${ev.length ? head(F ? '📅 Événements' : '📅 Events') + ev.map(x => row('', x[1])).join('') : ''}
    ${head(F ? '☄ Étoiles filantes' : '☄ Meteor showers')}${met.length ? met.map(x => row('', x)).join('') : row('', F ? 'pas de grande pluie ce mois-ci' : 'no major shower this month')}
    ${ecl.length ? head(F ? '🌘 Éclipses' : '🌘 Eclipses') + ecl.map(x => row('', x)).join('') + row('⚠', F ? 'Ne regardez jamais le Soleil sans lunettes d’éclipse certifiées.' : 'Never look at the Sun without certified eclipse glasses.') : ''}
    <div style="font-size:11px;opacity:.65;margin-top:8px">${F ? 'Dates en temps universel (UTC), calculées à partir des orbites ; à un jour près pour les planètes.' : 'Dates in UTC, worked out from the orbits; planet events to within about a day.'}</div>`;
}
bodies.SkyMonth = { obj: bodies.Moon.obj, radius: 0.27, view: 1.6 };
info('SkyMonth', 'What’s in the sky this month', 'Sky calendar', 'Moon, planets, meteors and eclipses', card());
const refresh = () => { INFO.SkyMonth.fact = card(); if (SS.more.INFO_EN?.SkyMonth) SS.more.INFO_EN.SkyMonth.fact = INFO.SkyMonth.fact; };
{ const prev = SS.onFocus; SS.onFocus = key => { if (key === 'SkyMonth') refresh(); prev(key);
    if (key === 'SkyMonth') { const step = k => () => { offset += k; SS.onFocus('SkyMonth'); }; const a = $('skyPrev'), b = $('skyNext'); if (a) a.onclick = step(-1); if (b) b.onclick = step(1); } }; }
special.SkyMonth = () => { offset = 0; SS.setDate(Date.now()); flyTo('SkyMonth'); };
{ const views = focusSel.querySelector('optgroup'), o = document.createElement('option'); o.value = 'SkyMonth'; o.textContent = '🗓 What’s in the sky this month';
  const tn = views.querySelector('option[value="Tonight"]'); tn ? tn.after(o) : views.appendChild(o); }
SS.i18nAdd?.({
  ui: { '🗓 What’s in the sky this month': '🗓 Le ciel de ce mois-ci' },
  name: { '🗓 What’s in the sky this month': '🗓 Le ciel de ce mois-ci', 'What’s in the sky this month': 'Le ciel de ce mois-ci' },
  cat: { 'Sky calendar': 'Calendrier du ciel' },
  dist: { 'Moon, planets, meteors and eclipses': 'Lune, planètes, étoiles filantes et éclipses' },
});
