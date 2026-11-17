// =====================================================================
// Voyager 1 & 2, live: real distance from Earth ticking up, the one light-day milestone, the Golden Record
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const D2R = Math.PI / 180, AU = 149597870.7, C = 299792.458, LIGHT_DAY = C * 86400;   // km
const EPS = 23.4393 * D2R;
const eclip = (ra, dec) => { // unit vector, ecliptic frame
  const r = ra * D2R, d = dec * D2R, x = Math.cos(d) * Math.cos(r), y = Math.cos(d) * Math.sin(r), z = Math.sin(d);
  return [x, y * Math.cos(EPS) + z * Math.sin(EPS), -y * Math.sin(EPS) + z * Math.cos(EPS)];
};
const J2000 = Date.UTC(2000, 0, 1, 12);
const earth = ms => { const L = (SS.astro.sunLon((ms - J2000) / 864e5) + 180) * D2R; const d = (ms - J2000) / 864e5, g = (357.529 + 0.98560028 * d) * D2R; const R = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g); return [R * Math.cos(L), R * Math.sin(L), 0]; };
const YR = 365.25 * 864e5;
// direction in the sky (RA, Dec, degrees) and speed away from the Sun (AU per year)
const PROBES = {
  Voyager1: { dir: eclip(258.4, 12.2), v: 3.57, anchor: Date.UTC(2026, 10, 18, 6, 16, 7), anchorKm: LIGHT_DAY },   // NASA: exactly 1 light-day from Earth at 06:16:07 UTC, 18 Nov 2026
  Voyager2: { dir: eclip(302.4, -60.2), v: 3.25, anchor: Date.UTC(2026, 10, 17), anchorKm: 144.2 * AU },
};
for (const k in PROBES) { // fix the distance from the Sun so the distance from Earth matches the anchor
  const P = PROBES[k], e = earth(P.anchor);
  const dot = P.dir[0] * e[0] + P.dir[1] * e[1] + P.dir[2] * e[2], ee = e[0] ** 2 + e[1] ** 2 + e[2] ** 2, D = P.anchorKm / AU;
  P.r0 = dot + Math.sqrt(dot * dot - ee + D * D);
}
function distKm(k, ms) {
  const P = PROBES[k], r = P.r0 + P.v * (ms - P.anchor) / YR, e = earth(ms);
  return Math.hypot(P.dir[0] * r - e[0], P.dir[1] * r - e[1], P.dir[2] * r - e[2]) * AU;
}
SS.more.voyagerKm = distKm;

const fr = () => SS.lang === 'fr';
const num = n => Math.round(n).toLocaleString(fr() ? 'fr-FR' : 'en-GB');
const hms = s => { s = Math.max(0, Math.floor(s)); const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  const p = n => String(n).padStart(2, '0'); return (d ? `${d}${fr() ? ' j ' : 'd '}` : '') + `${p(h)}h ${p(m)}m ${p(x)}s`; };
const MILESTONE = PROBES.Voyager1.anchor;

const GOLDEN = {
  en: `<b style="display:block;font-size:14px;margin-top:2px">💿 The Golden Record</b>Both Voyagers carry a gold-plated copper record, a message for anyone who might find them one day. It holds greetings in 55 languages, 115 pictures of life on Earth, sounds of our planet (rain, whales, a heartbeat, a kiss) and 90 minutes of music, from Bach and Beethoven to Chuck Berry's "Johnny B. Goode". The cover shows how to play it, and a map of 14 pulsars that points back to our Sun. It was put together by a team led by Carl Sagan, and it should last for a billion years.`,
  fr: `<b style="display:block;font-size:14px;margin-top:2px">💿 Le disque d'or</b>Les deux Voyager emportent un disque en cuivre plaqué or, un message pour qui les trouvera peut-être un jour. Il contient des salutations en 55 langues, 115 images de la vie sur Terre, des sons de notre planète (la pluie, les baleines, un battement de cœur, un baiser) et 90 minutes de musique, de Bach et Beethoven à « Johnny B. Goode » de Chuck Berry. La pochette explique comment le lire, avec une carte de 14 pulsars qui mène jusqu'à notre Soleil. Il a été conçu par une équipe menée par Carl Sagan, et devrait durer un milliard d'années.`,
};

let timer = null;
function live(k) {
  const box = $('vgLive'); if (!box) return;
  const now = Date.now(), km = distKm(k, now), lt = km / C;
  const L = fr()
    ? { now: 'En ce moment, à', from: 'de la Terre', sig: 'Un signal radio met', reach: 'pour lui parvenir', au: 'UA', speed: k === 'Voyager1' ? 'Il s\'éloigne du Soleil à environ 61 000 km/h.' : 'Il s\'éloigne du Soleil à environ 55 000 km/h.' }
    : { now: 'Right now,', from: 'from Earth', sig: 'A radio signal takes', reach: 'to reach it', au: 'AU', speed: k === 'Voyager1' ? 'It is moving away from the Sun at about 61,000 km/h.' : 'It is moving away from the Sun at about 55,000 km/h.' };
  let mile = '';
  if (k === 'Voyager1') {
    const left = (MILESTONE - now) / 1000;
    mile = left > 0
      ? `<div style="margin-top:6px;color:#ffd27a">${fr() ? '⏳ Premier objet humain à 1 jour-lumière de la Terre dans' : '⏳ First human-made object 1 light-day from Earth in'} <b style="display:inline;font-size:13px;color:#ffd27a">${hms(left)}</b></div>`
      : `<div style="margin-top:6px;color:#ffd27a">${fr() ? '🎉 Depuis le 18 novembre 2026, Voyager 1 est à plus d\'un jour-lumière de la Terre : le premier objet humain aussi loin.' : '🎉 Since 18 November 2026, Voyager 1 has been more than one light-day from Earth: the first human-made object ever this far.'}</div>`;
  }
  box.innerHTML = `<div style="font-size:11px;opacity:.7;margin-top:8px">${L.now}</div>
    <div style="font:700 21px/1.15 ui-monospace,Menlo,monospace;color:#9fd0ff;letter-spacing:.02em">${num(km)} km</div>
    <div style="font-size:11px;opacity:.7">${L.from} · ${(km / AU).toFixed(3).replace('.', fr() ? ',' : '.')} ${L.au}</div>
    <div style="margin-top:6px">${L.sig} <b style="display:inline;font-size:13px">${hms(lt)}</b> ${L.reach}. ${L.speed}</div>${mile}`;
}
{
  const prev = SS.onFocus;
  SS.onFocus = key => {
    prev(key);
    clearInterval(timer); timer = null;
    if (key !== 'Voyager1' && key !== 'Voyager2') return;
    const el = $('info'), share = el.querySelector('.share');
    const box = document.createElement('div'); box.id = 'vgLive';
    const btn = document.createElement('button'); btn.type = 'button'; btn.id = 'vgGold'; btn.style.cssText = 'margin-top:8px;display:block';
    btn.textContent = fr() ? '💿 Le disque d\'or' : '💿 The Golden Record';
    const gold = document.createElement('div'); gold.style.cssText = 'display:none;margin-top:6px;font-size:12.5px'; gold.innerHTML = GOLDEN[fr() ? 'fr' : 'en'];
    btn.onclick = () => { gold.style.display = gold.style.display === 'none' ? 'block' : 'none'; };
    el.insertBefore(box, share || null); el.insertBefore(btn, share || null); el.insertBefore(gold, share || null);
    live(key); timer = setInterval(() => live(key), 250);
  };
}

// menu: put the live Voyager entries at the top of the Spacecraft group
{
  const og = [...SS.focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Spacecraft');
  if (og) for (const [k, t] of [['Voyager1', '📡 Voyager 1, live distance']]) { const o = [...og.querySelectorAll('option')].find(x => x.value === k); if (o) { o.textContent = t; og.prepend(o); } }
}

// ---------- One Fact cards ----------
{
  const F = SS.more.FACTS, FR = SS.more.FACTS_FR;
  const add = (en, fr2) => { F.push(en); if (FR) FR[F.length - 1] = fr2; };
  add(['Voyager1', 'Voyager 1 is now one light-day away', 'On 18 November 2026 it became the first human-made object so far that its radio signals take a whole day to reach us.'],
    ['Voyager 1 est maintenant à un jour-lumière', "Le 18 novembre 2026, il est devenu le premier objet humain si loin que ses signaux radio mettent une journée entière à nous parvenir."]);
  add(['Voyager1', 'A record for aliens is flying between the stars', 'Both Voyagers carry a Golden Record with music, greetings in 55 languages and a map back to our Sun.'],
    ['Un disque pour les extraterrestres vole entre les étoiles', "Les deux Voyager emportent un disque d'or avec de la musique, des salutations en 55 langues et une carte pour retrouver notre Soleil."]);
  add(['Voyager1', "Voyager's power is slowly running out", 'Its nuclear battery gave 470 watts in 1977 and loses about 4 watts a year, so instruments are switched off one by one.'],
    ['L\'énergie de Voyager s\'épuise lentement', "Sa pile nucléaire donnait 470 watts en 1977 et en perd environ 4 par an : ses instruments sont éteints un à un."]);
}
SS.i18nAdd?.({ ui: { '📡 Voyager 1, live distance': '📡 Voyager 1, distance en direct' }, name: { '📡 Voyager 1, live distance': '📡 Voyager 1, distance en direct' },
  dist: { 'over 25 billion km from Earth': 'à plus de 25 milliards de km de la Terre', 'over 21 billion km from Earth': 'à plus de 21 milliards de km de la Terre' } });
