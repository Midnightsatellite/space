// =====================================================================
// 📰 Space news: the latest headlines from space news sites (Spaceflight News API, free).
// Each headline opens the full article on its own site. Updated every 30 minutes at most.
// =====================================================================
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const special = SS.more.special;
const { PL } = SS.extras;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const t2 = (F, en, f) => F ? f : en;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const N = { list: [], at: 0, status: 'idle', site: 'all' };
const CACHE = 'msNews1';
async function load(force) {
  if (N.status === 'busy') return;
  try { const c = JSON.parse(localStorage.getItem(CACHE) || 'null'); if (!force && c && Date.now() - c.t < 30 * 6e4) { N.list = c.list; N.at = c.t; N.status = 'ok'; refresh(); return; } } catch (e) { }
  N.status = 'busy'; refresh();
  try {
    const r = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=24'); if (!r.ok) throw 0;
    const j = await r.json();
    N.list = (j.results || []).map(a => ({ id: a.id, title: a.title, url: a.url, img: a.image_url || '', site: a.news_site || '', when: a.published_at, sum: a.summary || '' }));
    N.at = Date.now(); N.status = 'ok';
    try { localStorage.setItem(CACHE, JSON.stringify({ t: N.at, list: N.list })); } catch (e) { }
  } catch (e) { N.status = N.list.length ? 'ok' : 'err'; }
  refresh();
}
const ago = (iso, F) => { const m = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 6e4));
  if (m < 60) return t2(F, `${m} min ago`, `il y a ${m} min`); const h = Math.round(m / 60); if (h < 48) return t2(F, `${h} h ago`, `il y a ${h} h`); const d = Math.round(h / 24); return t2(F, `${d} days ago`, `il y a ${d} jours`); };

function card() {
  const F = fr();
  let h = `<div style="font-size:12px;opacity:.85">${t2(F, 'The latest headlines from space news sites. Tap one to read the full article on its site (in English).', 'Les dernières actualités des sites spécialisés. Touchez un titre pour lire l’article complet sur son site (en anglais).')}</div>`;
  if (!N.list.length) return h + `<div style="margin-top:10px;opacity:.7">${N.status === 'err' ? t2(F, 'News is not available right now. Try again in a few minutes.', 'Actualités indisponibles pour le moment. Réessayez dans quelques minutes.') : '⏳ ' + t2(F, 'Getting the news…', 'Chargement des actualités…')}</div>`;
  const sites = [...new Set(N.list.map(a => a.site))];
  h += `<div style="margin-top:6px">${['all', ...sites].map(s => { const on = N.site === s;
    return `<button type="button" data-nsite="${esc(s)}" style="margin:2px 3px 2px 0;padding:2px 8px;border-radius:12px;font-size:11.5px;cursor:pointer;border:1px solid ${on ? '#9fd0ff' : 'rgba(140,160,255,.3)'};background:${on ? 'rgba(80,120,220,.55)' : 'rgba(40,50,90,.4)'};color:#fff">${s === 'all' ? t2(F, 'All', 'Tout') : esc(s)}</button>`; }).join('')}</div>`;
  for (const a of N.list.filter(a => N.site === 'all' || a.site === N.site).slice(0, 15)) {
    h += `<a href="${esc(a.url)}" target="_blank" rel="noopener" style="display:flex;gap:9px;align-items:flex-start;padding:8px 0;border-top:1px solid #ffffff1a;color:inherit;text-decoration:none">
      ${a.img ? `<img src="${esc(a.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" style="width:74px;height:50px;object-fit:cover;border-radius:6px;flex:none;background:#223" onerror="this.remove()">` : ''}
      <span style="min-width:0"><b style="display:block;font-size:12.5px;line-height:1.3;color:#cfe6ff">${esc(a.title)}</b>
      <span style="font-size:11px;opacity:.65">${esc(a.site)} · ${ago(a.when, F)}</span></span></a>`;
  }
  return h + `<div style="font-size:10.5px;opacity:.6;margin-top:8px">${t2(F, 'Headlines: Spaceflight News API. Articles belong to their sites.', 'Titres : Spaceflight News API. Les articles appartiennent à leurs sites.')}</div>`;
}
let focused = null;
function refresh() { if (focused !== 'News') return; const box = $('info'), y = box?.scrollTop || 0; INFO.News.fact = card(); if (SS.more.INFO_EN?.News) SS.more.INFO_EN.News.fact = INFO.News.fact; SS.onFocus('News'); if (box) box.scrollTop = y; }

bodies.News = { obj: bodies.Earth.obj, radius: bodies.Earth.radius, view: PL.Earth.tilted.children[0].geometry.parameters.radius * 4 };
info('News', 'Space news', 'Live · headlines', 'the latest from space news sites', card());
{ const prev = SS.onFocus; SS.onFocus = key => { focused = key; if (key === 'News') { INFO.News.fact = card(); if (SS.more.INFO_EN?.News) SS.more.INFO_EN.News.fact = INFO.News.fact; } prev(key); if (key === 'News' && Date.now() - N.at > 30 * 6e4) load(); }; }
special.News = () => { load(); flyTo('News'); };
document.addEventListener('click', e => { const b = e.target.closest?.('#info [data-nsite]'); if (!b || focused !== 'News') return; e.preventDefault(); N.site = b.dataset.nsite; refresh(); });

{ const views = focusSel.querySelector('optgroup'), o = document.createElement('option'); o.value = 'News'; o.textContent = '📰 Space news';
  const after = views.querySelector('option[value="Departures"]'); after ? after.after(o) : views.appendChild(o); }
{ const after = $('rocketsBtn') || $('boardBtn'); if (after) { const b = document.createElement('button'); b.type = 'button'; b.id = 'newsBtn'; b.textContent = '📰 News';
  b.onclick = () => { focusSel.value = 'News'; SS.go('News'); }; after.after(b); } }
SS.i18nAdd?.({ ui: { '📰 Space news': '📰 Actualités spatiales', '📰 News': '📰 Actus' },
  name: { 'Space news': 'Actualités spatiales' }, cat: { 'Live · headlines': 'En direct · les titres' },
  dist: { 'the latest from space news sites': 'les dernières nouvelles des sites spécialisés' } });
SS.more.news = { load, N };
