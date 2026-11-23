// =====================================================================
// Read aloud: 🔊 on the info card, Space today, One Fact and the quiz.
// Uses the voice built into the visitor's device; the part being read lights up.
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const synth = window.speechSynthesis;

if (synth && window.SpeechSynthesisUtterance) {
  const css = document.createElement('style');
  css.textContent = `
    .saying{background:rgba(255,210,122,.16)!important;box-shadow:0 0 0 2px rgba(255,210,122,.45);border-radius:6px;transition:background .2s}
    #infoSay{position:absolute!important;top:8px;right:76px;z-index:3;width:28px;height:28px;padding:0!important;border-radius:999px;font-size:13px;line-height:26px;text-align:center;cursor:pointer}
    #info > .cat{padding-right:100px!important}
    .sayBtn.on,#infoSay.on{background:#6b5a1f!important;border-color:#ffd27a!important}
    #quizPop h3 .sayBtn{margin-left:auto;margin-right:8px;padding:2px 9px;border-radius:999px;font-size:13px}`;
  document.head.appendChild(css);

  // ---------- the speaker ----------
  let voices = [], cur = null; // cur = { btn, els }
  const loadVoices = () => { voices = synth.getVoices(); };
  loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices);
  // Devices list many novelty or robotic voices (on a Mac: Eddy, Grandpa, Rocko, Zarvox, Bubbles…). Skip those and prefer natural ones.
  const BAD = /eddy|flo\b|reed|rocko|sandy|shelley|grandma|grandpa|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|kathy|espeak|compact/i;
  const NICE = /daniel|serena|kate|stephanie|jamie|oliver|arthur|martha|samantha|ava|zoe|allison|susan|evan|nathan|libby|sonia|ryan|thomas|am[eé]lie|audrey|aur[eé]lie|marie|jacques|denise|henri|eloise|vivienne|r[ée]my|chantal|virginie/i;
  const pickVoice = lang => {
    const two = lang.slice(0, 2), norm = v => (v.lang || '').replace('_', '-').toLowerCase();
    const score = v => (BAD.test(v.name) ? -100 : 0) + (/premium|enhanced|natural|neural|am[eé]lior/i.test(v.name) ? 12 : 0) + (/google|online/i.test(v.name) ? 7 : 0)
      + (NICE.test(v.name) ? 5 : 0) + (norm(v) === lang.toLowerCase() ? 2 : 0) + (v.default ? 1 : 0);
    const best = voices.filter(v => norm(v).startsWith(two)).sort((a, b) => score(b) - score(a))[0];
    return best && score(best) > -50 ? best : null;
  };
  const clean = t => (t || '').replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F/gu, ' ').replace(/~\s*/g, '').replace(/[▶›‹•·]/g, ' ').replace(/\s+/g, ' ').trim();
  function stop() {
    synth.cancel();
    if (cur) { cur.els.forEach(e => e.classList.remove('saying')); cur.btn?.classList.remove('on'); if (cur.btn) cur.btn.textContent = '🔊'; cur = null; }
  }
  // pieces: [[element to light up, text to say], …]
  function say(pieces, btn) {
    const again = cur && cur.btn === btn; stop(); if (again) return;
    pieces = pieces.filter(p => !/🔗/u.test(p[1] || '')).map(([el, t]) => [el, clean(t)]).filter(p => p[1]);
    if (!pieces.length) return;
    const lang = fr() ? 'fr-FR' : 'en-GB', voice = pickVoice(lang);
    const me = cur = { btn, els: pieces.map(p => p[0]).filter(Boolean) };
    if (btn) { btn.classList.add('on'); btn.textContent = '⏹'; }
    pieces.forEach(([el, text], n) => {
      const u = new SpeechSynthesisUtterance(text); u.lang = lang; if (voice) u.voice = voice; u.rate = 0.95;
      u.onstart = () => { if (cur !== me) return; me.els.forEach(e => e.classList.remove('saying'));
        if (el) { el.closest('details')?.setAttribute('open', ''); el.classList.add('saying'); el.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }); } };
      if (n === pieces.length - 1) { u.onend = () => { if (cur === me) stop(); }; u.onerror = u.onend; }
      synth.speak(u);
    });
  }
  const button = (id, cls) => { const b = document.createElement('button'); b.type = 'button'; if (id) b.id = id; b.className = 'sayBtn ' + (cls || ''); b.textContent = '🔊'; b.title = fr() ? 'Lire à voix haute' : 'Read aloud'; return b; };

  // ---------- info card ----------
  const info = $('info');
  const infoPieces = () => {
    const P = [], el = sel => info.querySelector(sel);
    const name = el(':scope > b'), dist = el(':scope > .dist');
    if (name) P.push([name, name.textContent]); if (dist) P.push([dist, dist.textContent]);
    // loose text straight inside the card (the short description): wrap it so it can light up
    for (const n of [...info.childNodes]) if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement('span'); n.replaceWith(s); s.appendChild(n); }
    for (const c of info.children) {
      if (c === name || c === dist || c.matches('.cat,button,script,style') || c.id === 'infoX' || c.id === 'infoMin') continue;
      if (c.tagName === 'SPAN' && !c.children.length) { P.push([c, c.textContent]); continue; }
      if (c.style?.display === 'grid') { for (const t of c.children) { const [l, v] = t.children; P.push([t, l && v ? `${l.textContent}: ${v.textContent}.` : t.textContent]); } continue; }
      if (c.matches('details.pmore')) { for (const li of c.querySelectorAll('li')) P.push([li, li.textContent]); continue; }
      if (c.tagName === 'DETAILS' || c.querySelector('button,a,select,input')) continue; // "On screen", links, controls
      if (c.matches('div,p,ul,span')) P.push([c, c.textContent]);
    }
    return P;
  };
  const addInfoBtn = () => {
    if (!info || info.style.display === 'none' || !info.firstChild || $('infoSay')) return;
    const b = button('infoSay'); b.onclick = e => { e.stopPropagation(); say(infoPieces(), b); }; info.prepend(b);
  };
  if (info) new MutationObserver(() => {
    if (cur && cur.btn?.id === 'infoSay' && (!info.contains(cur.btn) || info.style.display === 'none')) stop(); // new place or card closed
    addInfoBtn();
  }).observe(info, { childList: true, attributes: true, attributeFilter: ['style'] });
  addInfoBtn();

  // ---------- Space today and One Fact ----------
  for (const [boxId, rowSel] of [['today', '.row'], ['fact', '.row']]) {
    const box = $(boxId); if (!box) continue;
    const b = button(null); box.querySelector(rowSel)?.appendChild(b);
    b.onclick = () => say([[box.querySelector('.hook'), box.querySelector('.hook').textContent], [box.querySelector('.txt'), box.querySelector('.txt').textContent]], b);
    new MutationObserver(() => { if (cur?.btn === b && !box.classList.contains('on')) stop(); }).observe(box, { attributes: true, attributeFilter: ['class'] });
    box.querySelector('.hook') && new MutationObserver(() => { if (cur?.btn === b) stop(); }).observe(box.querySelector('.hook'), { childList: true, characterData: true, subtree: true });
  }

  // ---------- quiz: read the question and the three answers ----------
  { const pop = $('quizPop'), qbox = pop?.querySelector('.box');
    if (qbox) {
      new MutationObserver(() => {
        if (cur?.btn && !qbox.contains(cur.btn)) stop(); // next question, score screen or closed
        const h = qbox.querySelector('h3'), q = h?.nextElementSibling, opts = [...qbox.querySelectorAll('.opt[data-o]')];
        if (!h || !q || !opts.length || h.querySelector('.sayBtn')) return;
        const b = button(null); h.insertBefore(b, h.querySelector('#qX'));
        b.onclick = () => say([[q, q.textContent], ...opts.map((o, n) => [o, (n === opts.length - 1 ? (fr() ? 'ou ' : 'or ') : '') + o.textContent])], b);
      }).observe(qbox, { childList: true });
      new MutationObserver(() => { if (!pop.classList.contains('on') && cur?.btn && qbox.contains(cur.btn)) stop(); }).observe(pop, { attributes: true, attributeFilter: ['class'] });
    } }

  // stop when flying somewhere else, changing language or leaving the page
  { const prev = SS.onFocus; SS.onFocus = (...a) => { stop(); return prev(...a); }; }
  { const was = SS.setLang; if (was) SS.setLang = (...a) => { stop(); return was(...a); }; }
  addEventListener('pagehide', stop);
  SS.say = { say, stop };
}
