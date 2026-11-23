// =====================================================================
// Panels: a working close button and a fold button on the info card,
// a fold button on the left panel, and a smaller info card on phones
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

const css = document.createElement('style');
css.textContent = `
  #info{padding-top:12px}
  #infoX,#infoMin{position:absolute!important;top:8px;float:none!important;margin:0!important;z-index:3;width:28px;height:28px;padding:0!important;border-radius:999px;font-size:13px;line-height:26px;text-align:center;cursor:pointer}
  #infoX{right:8px} #infoMin{right:42px}
  #info > .cat{padding-right:66px}
  #info.mini > :not(.cat):not(b):not(.dist):not(.sayIntro):not(#infoX):not(#infoMin):not(#infoSay){display:none!important}
  #info.mini{max-height:none!important;overflow:visible!important}
  #uiMin{float:right;margin:-2px -4px 0 10px;width:26px;height:24px;padding:0;border-radius:8px;font-size:14px;line-height:22px;cursor:pointer}
  #ui.min > :not(h1){display:none!important}
  #ui.min{min-width:0!important;gap:0!important;bottom:52px!important;z-index:12!important}
  #ui.min h1{margin:0;cursor:pointer}
  body.phone #info{font-size:12px!important;line-height:1.4!important;max-height:38vh!important;overflow:auto!important;top:calc(54px + env(safe-area-inset-top))!important;right:8px!important;left:auto!important;max-width:min(330px,calc(100vw - 16px))!important;padding:10px 12px!important}
  body.phone #info b{font-size:15px}
  body.phone #info .tiles,body.phone #info [class*=tile]{font-size:11.5px}
`;
document.head.appendChild(css);

// ---------- info card: ✕ closes, ▾ folds it down to its title ----------
const info = $('info');
let mini = false;
function buttons() {
  if (!info || info.style.display === 'none' || !info.firstChild) return;
  if (!$('infoX')) { const x = document.createElement('button'); x.type = 'button'; x.id = 'infoX'; x.textContent = '✕'; info.prepend(x); }
  $('infoX').title = fr() ? 'Fermer' : 'Close';
  $('infoX').onclick = e => { e.stopPropagation(); info.style.display = 'none'; };
  if (!$('infoMin')) { const m = document.createElement('button'); m.type = 'button'; m.id = 'infoMin'; info.prepend(m); }
  const m = $('infoMin'); m.textContent = mini ? '▸' : '▾'; m.title = mini ? (fr() ? 'Tout afficher' : 'Show all') : (fr() ? 'Réduire' : 'Fold away');
  m.onclick = e => { e.stopPropagation(); mini = !mini; info.classList.toggle('mini', mini); buttons(); };
  info.classList.toggle('mini', mini);
}
if (info) { new MutationObserver(() => buttons()).observe(info, { childList: true, attributes: true, attributeFilter: ['style'] }); buttons(); }

// ---------- left panel: – folds it down to its title, click the title to open again ----------
{
  const ui = $('ui'), h = ui?.querySelector('h1');
  if (ui && h) {
    const b = document.createElement('button'); b.type = 'button'; b.id = 'uiMin'; h.appendChild(b);
    const set = on => { ui.classList.toggle('min', on); b.textContent = on ? '+' : '–'; b.title = on ? (fr() ? 'Ouvrir le panneau' : 'Open the panel') : (fr() ? 'Réduire le panneau' : 'Fold the panel away'); store('ms_uimin', on ? '1' : '0'); };
    b.onclick = e => { e.stopPropagation(); set(!ui.classList.contains('min')); };
    h.addEventListener('click', () => { if (ui.classList.contains('min')) set(false); });
    set(store('ms_uimin') === '1' && !document.body.classList.contains('phone'));
    const was = SS.setLang; if (was) SS.setLang = (...a) => { const r = was(...a); set(ui.classList.contains('min')); buttons(); return r; };
  }
}
