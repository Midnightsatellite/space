// =====================================================================
// Read aloud with Chris's recorded Ming narration (audio/<card>-<lang>.m4a).
// 🔊 appears only on cards that have a recording; the part being read lights up.
// audio/index.json: { "<card>": { "en": { "p": ["name","intro","f0",…], "t": [start seconds…] }, "fr": {…} } }
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const V = new URL(import.meta.url).search;

const css = document.createElement('style');
css.textContent = `
  .saying{background:rgba(255,210,122,.16)!important;box-shadow:0 0 0 2px rgba(255,210,122,.45);border-radius:6px;transition:background .2s}
  #infoSay{position:absolute!important;top:8px;right:76px;z-index:3;width:28px;height:28px;padding:0!important;border-radius:999px;font-size:13px;line-height:26px;text-align:center;cursor:pointer}
  #infoSay.on{background:#6b5a1f!important;border-color:#ffd27a!important}
  #info.hasSay > .cat{padding-right:100px!important}`;
document.head.appendChild(css);

let index = null, asked = false;
const getIndex = () => { if (!asked) { asked = true; fetch('audio/index.json' + V).then(r => r.ok ? r.json() : {}).then(j => { index = j; addBtn(); }, () => { index = {}; }); } };

const info = $('info');
let cur = null; // { audio, btn, els, raf }
function stop() {
  if (!cur) return;
  cur.audio.pause(); cancelAnimationFrame(cur.raf);
  cur.els.flat().forEach(e => e?.classList.remove('saying'));
  cur.btn.classList.remove('on'); cur.btn.textContent = '🔊'; cur = null;
}
// the element(s) each recorded paragraph belongs to
function target(id) {
  if (id === 'name') return [info.querySelector(':scope > b'), info.querySelector(':scope > .dist')];
  if (id === 'intro') {
    for (const n of [...info.childNodes]) if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement('span'); s.className = 'sayIntro'; n.replaceWith(s); s.appendChild(n); }
    const s = info.querySelector(':scope > .sayIntro');
    return [s || [...info.children].find(c => c.matches('div,p') && !c.matches('.cat,.dist') && c.style.display !== 'grid' && !c.querySelector('button,a,select'))];
  }
  const m = /^f(\d+)$/.exec(id); if (m) return [info.querySelectorAll('details.pmore li')[+m[1]]];
  return [];
}
function play(key, lang, btn) {
  if (cur && cur.btn === btn) { stop(); return; }
  stop();
  const rec = index[key][lang], audio = new Audio(`audio/${key}-${lang}.m4a${V}`);
  const els = rec.p.map(target);
  const me = cur = { audio, btn, els, raf: 0, at: -1 };
  btn.classList.add('on'); btn.textContent = '⏹';
  const tick = () => {
    if (cur !== me) return;
    let i = 0; while (i + 1 < rec.t.length && audio.currentTime >= rec.t[i + 1]) i++;
    if (i !== me.at) {
      els.flat().forEach(e => e?.classList.remove('saying')); me.at = i;
      for (const e of els[i] || []) if (e) { e.closest('details')?.setAttribute('open', ''); e.classList.add('saying'); }
      els[i]?.[0]?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    }
    me.raf = requestAnimationFrame(tick);
  };
  audio.onended = () => { if (cur === me) stop(); };
  audio.onerror = () => { if (cur === me) stop(); };
  audio.play().then(tick, () => { if (cur === me) stop(); });
}
function addBtn() {
  if (!info || info.style.display === 'none' || !info.firstChild) return;
  const key = SS.more.current, lang = fr() ? 'fr' : 'en', has = index?.[key]?.[lang];
  const old = $('infoSay');
  if (!has) { old?.remove(); info.classList.remove('hasSay'); return; }
  if (old && old.dataset.k === key + lang) return;
  old?.remove();
  const b = document.createElement('button'); b.type = 'button'; b.id = 'infoSay'; b.dataset.k = key + lang; b.textContent = '🔊';
  b.title = fr() ? 'Écouter' : 'Listen';
  b.onclick = e => { e.stopPropagation(); play(key, lang, b); };
  info.prepend(b); info.classList.add('hasSay');
}
if (info) new MutationObserver(() => {
  if (cur && (!info.contains(cur.btn) || info.style.display === 'none')) stop(); // flew elsewhere or closed the card
  if (index) addBtn(); else if (info.style.display !== 'none') getIndex();
}).observe(info, { childList: true, attributes: true, attributeFilter: ['style'] });

{ const was = SS.setLang; if (was) SS.setLang = (...a) => { stop(); const r = was(...a); addBtn(); return r; }; }
addEventListener('pagehide', stop);
SS.say = { stop, now: () => cur };
