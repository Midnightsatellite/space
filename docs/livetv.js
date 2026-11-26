// =====================================================================
// 📺 Live TV: a small window on the page that plays a launch's YouTube live stream (or NASA's live channel),
// so you can watch without leaving the explorer. Drag it by its title bar; ▢ makes it bigger or smaller.
// The Midnight Satellite radio pauses while it plays.
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const t2 = (F, en, f) => F ? f : en;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// YouTube channels whose current live stream can be shown when a launch has no stream of its own
const CHANNELS = [
  { id: 'spaceaffairs', ch: 'UCjgjQf5OMZizKBSjmwUFiuA', name: ['Space Affairs live', 'Space Affairs en direct'] },
  { id: 'nasa', ch: 'UCLA_DiR1FfKNvjuUpBHmylQ', name: ['NASA live', 'NASA en direct'] },
  { id: 'spacex', ch: 'UCtI0Hodo5o5dUb67FeUjDeA', name: ['SpaceX live', 'SpaceX en direct'] },
];
// a YouTube link → its video id (watch?v=, youtu.be/, /live/, /embed/)
const ytId = u => { const m = /(?:v=|youtu\.be\/|\/live\/|\/embed\/|\/shorts\/)([\w-]{11})/.exec(u || ''); return m ? m[1] : null; };

const css = document.createElement('style');
css.textContent = `
#liveTV{position:fixed;right:372px;bottom:40px;z-index:15;width:400px;display:none;background:rgba(10,14,30,.95);backdrop-filter:blur(8px);border:1px solid rgba(255,90,90,.45);border-radius:14px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.55)}
#liveTV.on{display:block}
#liveTV.big{width:min(760px,calc(100vw - 32px))}
#liveTV .head{display:flex;align-items:center;gap:8px;padding:8px 10px 6px;font-size:12px;color:#ff8a8a;letter-spacing:.1em;font-weight:700;cursor:move;user-select:none}
#liveTV .head span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#liveTV .head button{margin:0;padding:2px 8px}
#liveTV .frame{position:relative;width:100%;aspect-ratio:16/9;background:#000}
#liveTV iframe,#liveTV #tvPlayer{position:absolute;inset:0;width:100%;height:100%;border:0}
#liveTV .bar{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:12px;color:#e8ecff}
#liveTV .bar select{flex:1;min-width:0}
#liveTV .bar a{color:#9fd0ff;white-space:nowrap}
#liveTV .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff4d4d;margin-right:6px;animation:tvPulse 1.4s infinite}
@keyframes tvPulse{50%{opacity:.25}}
@media (max-width:1150px) and (min-width:701px){#liveTV{right:16px;bottom:auto;top:70px}}
@media (max-width:700px){#liveTV,#liveTV.big{left:8px!important;right:8px!important;width:auto;top:auto!important;bottom:calc(64px + env(safe-area-inset-bottom))!important}}`;
document.head.appendChild(css);

const box = document.createElement('div'); box.id = 'liveTV';
box.innerHTML = `<div class="head"><span><i class="dot"></i><b id="tvTitle">LIVE</b></span><button id="tvBig" type="button">▢</button><button id="tvClose" type="button">✕</button></div>
<div class="frame" id="tvFrame"></div>
<div id="tvNote" style="display:none;padding:6px 10px 0;font-size:11.5px;color:#ffd27a"></div>
<div class="bar"><select id="tvSel"></select><a id="tvYT" target="_blank" rel="noopener">YouTube ↗</a></div>`;
document.body.appendChild(box);

let launchItem = null;   // { id (video), title } for the launch being watched
function options() {
  const F = fr(), sel = $('tvSel'), keep = sel.value;
  sel.innerHTML = (launchItem ? `<option value="launch">🚀 ${esc(launchItem.title)}</option>` : '') + CHANNELS.map(c => `<option value="${c.id}">📡 ${esc(c.name[F ? 1 : 0])}</option>`).join('');
  if ([...sel.options].some(o => o.value === keep)) sel.value = keep;
}
// the YouTube player API (shared with the radio): wait until it is there
let apiP = null;
const ytApi = () => apiP || (apiP = new Promise(res => {
  if (window.YT?.Player) return res(window.YT);
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) { const sc = document.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(sc); }
  const t = setInterval(() => { if (window.YT?.Player) { clearInterval(t); res(window.YT); } }, 200);
}));
let player = null, showing = null;
const note = (en, f) => { const n = $('tvNote'); n.textContent = en ? t2(fr(), en, f) : ''; n.style.display = en ? '' : 'none'; };
async function show(v) {
  const F = fr(), c = CHANNELS.find(c => c.id === v) || CHANNELS[0], isLaunch = v === 'launch' && launchItem;
  showing = v;
  $('tvYT').href = isLaunch ? `https://www.youtube.com/watch?v=${launchItem.id}` : `https://www.youtube.com/channel/${c.ch}/live`;
  $('tvSel').value = v;
  $('tvTitle').textContent = isLaunch ? launchItem.title : c.name[F ? 1 : 0];
  const radio = $('radio'); if (radio?.classList.contains('on')) SS.more.radio?.closeRadio?.();   // pause the radio while live TV plays
  box.classList.add('on'); note(t2(F, 'Connecting…', 'Connexion…'), 'Connexion…');
  const YT = await ytApi(); if (showing !== v) return;
  try { player?.destroy(); } catch (e) { }
  $('tvFrame').innerHTML = '<div id="tvPlayer"></div>';
  let fellBack = false;
  // a channel that is not live right now makes YouTube say "This video is unavailable": show its latest videos instead
  const fallback = () => { if (fellBack || isLaunch) { note('This stream isn’t available. Try YouTube ↗', 'Ce direct n’est pas disponible. Essayez YouTube ↗'); return; }
    fellBack = true; note(`Not live right now: showing ${c.name[0].replace(' live', '')}’s latest videos. The window switches to the live stream when you reopen it during a launch.`,
      `Pas en direct pour le moment : voici les dernières vidéos de ${c.name[0].replace(' live', '')}. Rouvrez la fenêtre pendant un lancement pour voir le direct.`);
    $('tvYT').href = `https://www.youtube.com/channel/${c.ch}/videos`;
    player.loadPlaylist({ listType: 'playlist', list: 'UU' + c.ch.slice(2) }); };
  player = new YT.Player('tvPlayer', { width: '100%', height: '100%', host: 'https://www.youtube-nocookie.com',
    videoId: isLaunch ? launchItem.id : 'live_stream',
    playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, ...(isLaunch ? {} : { channel: c.ch }) },
    events: { onReady: e => { note(); e.target.playVideo(); }, onError: fallback,
      onStateChange: e => { if (e.data === 1 && !fellBack) note(); } } });
}
function close() { showing = null; box.classList.remove('on'); try { player?.destroy(); } catch (e) { } player = null; $('tvFrame').innerHTML = ''; }

// play a launch: its own stream when the schedule has one, otherwise Space Affairs, who stream most launches
function playLaunch(video, title) {
  const id = ytId(video);
  launchItem = id ? { id, title: title || 'Launch' } : null;
  options(); show(id ? 'launch' : 'spaceaffairs');
}
function playChannel(which = 'spaceaffairs') { options(); show(which); }

$('tvSel').onchange = e => show(e.target.value);
$('tvClose').onclick = close;
$('tvBig').onclick = () => { box.classList.toggle('big'); $('tvBig').textContent = box.classList.contains('big') ? '▣' : '▢'; };
{ // drag by the title bar
  const head = box.querySelector('.head'); let drag = null;
  head.addEventListener('pointerdown', e => { if (e.target.tagName === 'BUTTON' || innerWidth <= 700) return; const r = box.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }; head.setPointerCapture(e.pointerId); });
  head.addEventListener('pointermove', e => { if (!drag) return; const r = box.getBoundingClientRect();
    Object.assign(box.style, { left: Math.min(innerWidth - r.width, Math.max(0, e.clientX - drag.dx)) + 'px', top: Math.min(innerHeight - r.height, Math.max(0, e.clientY - drag.dy)) + 'px', right: 'auto', bottom: 'auto' }); });
  head.addEventListener('pointerup', () => { drag = null; });
}
{ const prev = SS.setLang; if (prev) SS.setLang = (...a) => { const r = prev(...a); if (box.classList.contains('on')) { const v = $('tvSel').value; options(); $('tvSel').value = v; } return r; }; }

// "▶ Watch live" on a launch card now plays here instead of opening a new tab
document.addEventListener('click', e => {
  const a = e.target.closest?.('a[data-watch]'); if (!a) return;
  e.preventDefault();   // no stream listed yet: Space Affairs' live channel plays instead
  const title = a.dataset.title || document.querySelector('#info > b')?.textContent?.replace(/^🚀\s*/, '') || '';
  playLaunch(a.getAttribute('href'), title);
});
SS.i18nAdd?.({ ui: { 'YouTube ↗': 'YouTube ↗' } });
SS.tv = { playLaunch, playChannel, close, ytId };
