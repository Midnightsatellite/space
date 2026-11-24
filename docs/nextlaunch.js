// =====================================================================
// nextlaunch.js — Next launch: live countdown to the next rocket launch worldwide, with the next few after it.
// Data: Launch Library 2 by The Space Devs (free, updates on its own). Cached for 30 minutes per visitor.
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const API = 'https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=8&mode=detailed';
const KEY = 'ms_launches', TTL = 30 * 60 * 1000;

const css = document.createElement('style');
css.textContent = `#launchPop{position:fixed;inset:0;background:rgba(2,4,12,.55);z-index:40;display:none;align-items:center;justify-content:center}
  #launchPop.on{display:flex}
  #launchPop .box{width:min(480px,94vw);max-height:84vh;overflow:auto;background:rgba(12,16,34,.97);border:1px solid rgba(255,210,122,.35);border-radius:14px;padding:14px 16px;color:#e8ecff;font:14px/1.45 system-ui,sans-serif}
  #launchPop h3{margin:0 0 8px;font-size:16px;color:#fff;display:flex;justify-content:space-between;align-items:center}
  #launchPop .lab{font-size:11px;letter-spacing:.08em;color:#ffd27a;text-transform:uppercase}
  #launchPop .nm{font-size:17px;font-weight:600;color:#fff;margin:2px 0}
  #launchPop .cd{font:600 26px/1.2 ui-monospace,Menlo,monospace;color:#ffd27a;margin:6px 0}
  #launchPop .meta{color:#b9c2e8;font-size:13px}
  #launchPop img{width:100%;max-height:170px;object-fit:cover;border-radius:10px;margin:8px 0 4px}
  #launchPop .row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 4px}
  #launchPop a.btn{display:inline-block;padding:4px 10px;border-radius:8px;border:1px solid rgba(140,160,255,.35);color:#fff;text-decoration:none;background:rgba(60,80,170,.35)}
  #launchPop ul{list-style:none;padding:0;margin:10px 0 0;border-top:1px solid rgba(140,160,255,.2)}
  #launchPop li{padding:7px 0;border-bottom:1px solid rgba(140,160,255,.12);font-size:13px}
  #launchPop li b{color:#fff} #launchPop li span{color:#ffd27a;float:right;margin-left:8px}
  #launchPop .src{font-size:11px;color:#8890b0;margin-top:8px} #launchPop .src a{color:#8890b0}`;
document.head.appendChild(css);

const pop = document.createElement('div'); pop.id = 'launchPop';
pop.innerHTML = '<div class="box"><h3><span></span><button type="button" id="launchX">✕</button></h3><div class="body"></div></div>';
document.body.appendChild(pop);
$('launchX').onclick = () => close();
pop.onclick = e => { if (e.target === pop) close(); };

let list = null, timer = 0;
async function load() {
  try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && Date.now() - c.at < TTL) return c.list; } catch (e) {}
  const r = await fetch(API); if (!r.ok) throw new Error(r.status);
  const j = await r.json();
  const out = (j.results || []).map(x => ({
    name: x.name, net: x.net, status: x.status?.abbrev || '', rocket: x.rocket?.configuration?.name || '',
    who: x.launch_service_provider?.name || '', pad: [x.pad?.name, x.pad?.location?.name].filter(Boolean).join(', '),
    img: x.image?.thumbnail_url || x.image?.image_url || '', mission: x.mission?.description || '',
    video: ([...(x.vid_urls || [])].filter(v => /youtu/.test(v.url)).sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))[0] || {}).url || '',
  }));
  try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), list: out })); } catch (e) {}
  return out;
}
const when = iso => new Date(iso).toLocaleString(fr() ? 'fr-FR' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function countdown(iso) {
  let s = Math.round((new Date(iso) - Date.now()) / 1000), neg = s < 0; s = Math.abs(s);
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60, p = n => String(n).padStart(2, '0');
  return (neg ? 'T+ ' : 'T− ') + (d ? `${d}${fr() ? 'j' : 'd'} ` : '') + `${p(h)}:${p(m)}:${p(x)}`;
}
function render() {
  const F = fr(), body = pop.querySelector('.body');
  pop.querySelector('h3 span').textContent = F ? '🚀 Prochain lancement' : '🚀 Next launch';
  if (!list) { body.innerHTML = `<div class="meta">${F ? 'Chargement…' : 'Loading…'}</div>`; return; }
  // the next one that has not flown yet (allow 2 hours after liftoff, so a launch in progress still shows)
  const up = list.filter(l => new Date(l.net) > Date.now() - 2 * 3600e3 && !/^(Success|Failure|Partial Failure)$/.test(l.status));
  if (!up.length) { body.innerHTML = `<div class="meta">${F ? 'Aucun lancement trouvé pour le moment.' : 'No upcoming launch found right now.'}</div>`; return; }
  const n = up[0];
  const watch = n.video || 'https://www.youtube.com/results?search_query=' + encodeURIComponent('Space Affairs live ' + n.name.split('|').pop().trim());
  const sure = /^(Go|TBC)$/.test(n.status) ? '' : ` <span class="meta">(${F ? 'date à confirmer' : 'date not yet confirmed'})</span>`;
  body.innerHTML = `<div class="lab">${esc(n.who)}</div><div class="nm">${esc(n.name)}</div>
    <div class="cd" id="launchCd">${countdown(n.net)}</div>
    <div class="meta">${when(n.net)}${sure}<br>🚀 ${esc(n.rocket)} · 📍 ${esc(n.pad)}</div>
    ${n.img ? `<img src="${esc(n.img)}" alt="" loading="lazy">` : ''}
    ${n.mission ? `<div class="meta">${esc(n.mission)}</div>` : ''}
    <div class="row"><a class="btn" href="${esc(watch)}" target="_blank" rel="noopener">▶ ${F ? 'Regarder en direct' : 'Watch live'}</a></div>
    <ul>${up.slice(1, 5).map(l => `<li><span>${when(l.net)}</span><b>${esc(l.name)}</b><br>${esc(l.pad)}</li>`).join('')}</ul>
    <div class="src">${F ? 'Données' : 'Data'}: <a href="https://thespacedevs.com" target="_blank" rel="noopener">The Space Devs</a> · ${F ? 'les horaires peuvent changer' : 'times can change'}</div>`;
  clearInterval(timer); timer = setInterval(() => { const c = $('launchCd'); if (c) c.textContent = countdown(n.net); }, 1000);
}
async function open() {
  pop.classList.add('on'); render();
  if (!list) try { list = await load(); } catch (e) { list = []; }
  render();
}
function close() { pop.classList.remove('on'); clearInterval(timer); }

// button in the panel (the phone layout moves it to Play)
{ const row = $('factBtn')?.parentElement; if (row) { const b = document.createElement('button'); b.type = 'button'; b.id = 'launchBtn'; b.textContent = '🚀 Next launch'; b.onclick = open; row.insertBefore(b, $('factBtn')); } }
SS.i18nAdd?.({ ui: { '🚀 Next launch': '🚀 Prochain lancement' } });
{ const was = SS.setLang; if (was) SS.setLang = (...a) => { const r = was(...a); if (pop.classList.contains('on')) render(); return r; }; }
if (new URLSearchParams(location.search).get('launch')) { const w = setInterval(() => { if (SS.doc2) { clearInterval(w); open(); } }, 500); }
SS.more.launches = { open };
