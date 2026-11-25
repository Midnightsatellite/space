// =====================================================================
// Phone layout: a bottom tab bar (Explore · Watch · Play · Settings) with a slide-up sheet,
// instead of the one long desktop panel. The big-screen layout is untouched.
// Existing buttons and switches are moved into the sheet, so they keep working exactly as before.
// =====================================================================
const SS = window.SS;
const isPhone = () => matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 1024px)').matches;
if (isPhone()) build();

function build() {
  const $ = id => document.getElementById(id);
  const fr = () => SS.lang === 'fr';
  const T = {
    explore: ['Explore', 'Explorer'], watch: ['Watch', 'Regarder'], play: ['Play', 'Jouer'], settings: ['Settings', 'Réglages'],
    back: ['‹ Back', '‹ Retour'], show: ['Show on screen', 'Afficher'], time: ['Time', 'Temps'], about: ['About', 'À propos'],
    solar: ['Solar System', 'Système solaire'], flight: ['Spaceflight', 'Vols spatiaux'], deep: ['Stars & beyond', 'Étoiles et au-delà'],
    events: ['Sky events', 'Événements du ciel'], earth: ['On Earth', 'Sur Terre'], other: ['More', 'Plus'],
  };
  const t = k => T[k][fr() ? 1 : 0];

  // the 34 "Fly to" groups, gathered into a few big sections (matched on the English group names)
  const SECTIONS = [
    ['solar', '☀️', ['Views', 'The Sun & planets', 'Moons', 'Dwarf planets', 'Far dwarf planets', 'Comets, asteroids & belts', 'Interstellar visitors', 'Moon landing sites', 'Mars: rovers & landmarks']],
    ['flight', '🚀', ['Missions in flight', 'Launch sites & NASA', 'Around Earth', 'SpaceX', 'Europe on the ISS', 'ESA missions', 'NASA science fleet', 'Spacecraft', 'Space telescopes & satellites', 'Astronauts', 'Animals in space', 'Animaux']],
    ['deep', '✨', ['Stars (nearest first)', 'Exoplanets', 'Galaxy of Horrors', 'Star clusters & nebulae', 'Black holes', 'Is anyone out there?', 'Our galactic neighbourhood', 'Galaxies']],
    ['events', '📅', ['Events', 'Meteor showers', 'Zodiac (star signs)']],
    ['earth', '🌍', ['Observatories on Earth', 'Laser ranging stations (ILRS)', 'Space on screen']],
  ];
  const focus = $('focus');
  const groups = () => [...focus.querySelectorAll('optgroup')];
  // remember each group's English name once, since the French switch renames them
  for (const g of groups()) g.dataset.en ||= g.label.replace(/^[^A-Za-z]+/, '').trim();
  const sectionOf = g => { const n = (g.dataset.en ||= g.label.replace(/^[^A-Za-zÀ-ÿ]+/, '').trim()); for (const [k, , list] of SECTIONS) if (list.some(x => n.toLowerCase().includes(x.toLowerCase()))) return k; return 'other'; };

  // ---------- markup ----------
  const css = document.createElement('style'); css.textContent = `
    body.phone #ui, body.phone #uiToggle, body.phone #note { display: none !important; }
    body.phone #radioPill { bottom: calc(70px + env(safe-area-inset-bottom)) !important; right: 10px !important; font-size: 12px !important; padding: 6px 12px !important; }
    #tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; display: flex; background: rgba(8,10,24,.94); backdrop-filter: blur(10px);
      border-top: 1px solid rgba(140,160,255,.18); padding: 4px 4px calc(4px + env(safe-area-inset-bottom)); }
    #tabbar button { flex: 1; background: none; border: 0; color: #aab3d8; font: 600 11px system-ui, sans-serif; padding: 6px 0 4px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    #tabbar button span { font-size: 21px; line-height: 1; }
    #tabbar button.on { color: #ffd27a; }
    #sheet { position: fixed; left: 0; right: 0; bottom: calc(58px + env(safe-area-inset-bottom)); z-index: 59; max-height: 68vh; overflow: auto; -webkit-overflow-scrolling: touch;
      background: rgba(10,12,30,.97); border-radius: 18px 18px 0 0; border: 1px solid rgba(140,160,255,.18); border-bottom: 0; padding: 8px 14px 16px; color: #e8ecff;
      font: 15px system-ui, sans-serif; transform: translateY(110%); transition: transform .25s ease; }
    #sheet.open { transform: none; }
    #sheet .grab { width: 40px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.25); margin: 2px auto 10px; }
    #sheet h3 { margin: 14px 2px 8px; font: 700 12px system-ui; letter-spacing: .08em; text-transform: uppercase; color: #ffd27a; }
    #sheet .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    #sheet .tile, #sheet .grid > button { background: rgba(60,75,160,.28); border: 1px solid rgba(140,160,255,.22); color: #eef; border-radius: 12px;
      padding: 14px 10px; font: 600 14px system-ui; text-align: left; min-height: 52px; margin: 0; width: 100%; }
    #sheet .row { display: flex; align-items: center; justify-content: space-between; padding: 13px 4px; border-bottom: 1px solid rgba(255,255,255,.07); font-size: 15px; }
    #sheet .row:active { background: rgba(255,255,255,.06); }
    #sheet .row small { color: #8f98c0; }
    #sheet .back { background: none; border: 0; color: #9fb0ff; font: 600 15px system-ui; padding: 6px 2px; }
    #sheet label { display: flex !important; align-items: center; justify-content: space-between; padding: 11px 2px; border-bottom: 1px solid rgba(255,255,255,.07); margin: 0 !important; font-size: 15px; }
    #sheet input[type=checkbox] { width: 22px; height: 22px; }
    #sheet select, #sheet input[type=datetime-local] { font-size: 15px; max-width: 58%; background: rgba(60,75,160,.28); color: #eef; border: 1px solid rgba(140,160,255,.3); border-radius: 10px; padding: 7px 8px; }
    #sheet #now { background: rgba(60,75,160,.4); color: #eef; border: 1px solid rgba(140,160,255,.3); border-radius: 10px; padding: 7px 12px; font-size: 14px; margin-left: 6px; }
    #sheet label:has(#date) { flex-wrap: wrap; gap: 6px; }
    #sheet #search { width: 100%; box-sizing: border-box; font-size: 16px; padding: 11px 12px; border-radius: 12px; margin: 0 0 4px; }
    #sheet #searchRes { position: static !important; max-height: none !important; }
    #sheet .credits { font-size: 11px; color: #8f98c0; line-height: 1.5; margin-top: 14px; }
    #sheet .credits a { color: #ffd27a; }
    body.phone #fact { bottom: calc(66px + env(safe-area-inset-bottom)) !important; }
  `; document.head.appendChild(css);
  document.body.classList.add('phone');

  const bar = document.createElement('div'); bar.id = 'tabbar';
  const sheet = document.createElement('div'); sheet.id = 'sheet';
  document.body.append(sheet, bar);
  const panes = {};
  for (const k of ['explore', 'watch', 'play', 'settings']) { const p = document.createElement('div'); p.hidden = true; panes[k] = p; }

  // Explore: search on top, then the sections
  const searchBox = $('search')?.parentElement;
  const browse = document.createElement('div');
  if (searchBox) panes.explore.append(searchBox);
  panes.explore.append(browse);

  // Watch and Play: the existing buttons, as big tiles
  const tiles = (pane, ids, title) => { const h = document.createElement('h3'); h.dataset.k = title; const g = document.createElement('div'); g.className = 'grid';
    for (const id of ids) { const b = $(id); if (b) { g.append(b); b.addEventListener('click', () => setTimeout(close, 50)); } }
    pane.append(h, g); };
  tiles(panes.watch, ['tourBtn', 'docBtn', 'doc2Btn', 'cineBtn'], 'watch');
  tiles(panes.play, ['todayBtn', 'launchBtn', 'stationsBtn', 'boardBtn', 'rocketsBtn', 'factBtn', 'quizBtn', 'cmpBtn', 'ageBtn', 'photoBtn', 'shortBtn', 'postBtn', 'wxBtn'], 'play');

  // Settings: time, then every switch, then app + credits
  { const p = panes.settings, ui = $('ui');
    const h1 = document.createElement('h3'); h1.dataset.k = 'time'; p.append(h1);
    for (const id of ['speed', 'date']) { const l = $(id)?.closest('label'); if (l) p.append(l); }
    const h2 = document.createElement('h3'); h2.dataset.k = 'show'; p.append(h2);
    for (const l of [...ui.querySelectorAll('label')]) if (l.querySelector('input[type=checkbox]')) p.append(l);
    const h3 = document.createElement('h3'); h3.dataset.k = 'about'; p.append(h3);
    const g = document.createElement('div'); g.className = 'grid'; for (const id of ['installBtn', 'cleanBtn']) { const b = $(id); if (b) g.append(b); } p.append(g);
    const note = $('note'); if (note) { const c = document.createElement('div'); c.className = 'credits'; c.innerHTML = note.innerHTML; p.append(c); } }

  for (const p of Object.values(panes)) sheet.append(p);
  sheet.prepend(Object.assign(document.createElement('div'), { className: 'grab' }));

  // ---------- Explore browsing: sections → groups → places ----------
  function showSections() {
    browse.innerHTML = '';
    const all = groups(), used = new Set();
    for (const [k, icon] of [...SECTIONS, ['other', '•', []]]) {
      const gs = all.filter(g => sectionOf(g) === k); if (!gs.length) continue;
      const h = document.createElement('h3'); h.textContent = `${icon} ${t(k)}`; browse.append(h);
      const grid = document.createElement('div'); grid.className = 'grid'; browse.append(grid);
      for (const g of gs) { used.add(g); const b = document.createElement('button'); b.className = 'tile'; b.type = 'button'; b.textContent = g.label; b.onclick = () => showGroup(g); grid.append(b); }
    }
  }
  function showGroup(g) {
    browse.innerHTML = '';
    const back = document.createElement('button'); back.className = 'back'; back.type = 'button'; back.textContent = t('back'); back.onclick = showSections;
    const h = document.createElement('h3'); h.textContent = g.label; browse.append(back, h);
    for (const o of [...g.children]) {
      const r = document.createElement('div'); r.className = 'row'; r.textContent = o.textContent; r.onclick = () => go(o.value); browse.append(r); }
    sheet.scrollTop = 0;
  }
  function go(v) { focus.value = v; focus.dispatchEvent(new Event('change', { bubbles: true })); close(); }
  // a search result tapped: close the sheet so the flight can be seen
  $('searchRes')?.addEventListener('click', () => setTimeout(close, 50));

  // ---------- tabs ----------
  let cur = null;
  const TABS = [['explore', '🔭'], ['watch', '🎬'], ['play', '✨'], ['settings', '⚙️']];
  function drawBar() { bar.innerHTML = ''; for (const [k, ic] of TABS) { const b = document.createElement('button'); b.type = 'button'; b.className = cur === k ? 'on' : '';
      b.innerHTML = `<span>${ic}</span>${t(k)}`; b.onclick = () => cur === k ? close() : open(k); bar.append(b); } }
  function relabel() { for (const h of sheet.querySelectorAll('h3[data-k]')) h.textContent = t(h.dataset.k); drawBar(); if (cur === 'explore') showSections(); }
  function open(k) { cur = k; for (const [n, p] of Object.entries(panes)) p.hidden = n !== k; if (k === 'explore') showSections(); sheet.classList.add('open'); sheet.scrollTop = 0; drawBar(); }
  function close() { cur = null; sheet.classList.remove('open'); drawBar(); }
  // closing by touching the 3D view
  document.querySelector('canvas')?.addEventListener('pointerdown', () => { if (cur) close(); });
  // "Hide interface" also hides the tab bar
  const unhide = Object.assign(document.createElement('button'), { type: 'button', textContent: '☰' });   // the way back from "Hide interface" (no H key on a phone)
  Object.assign(unhide.style, { position: 'fixed', right: '12px', bottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 61, display: 'none', width: '44px', height: '44px',
    borderRadius: '22px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(8,10,24,.6)', color: '#fff', fontSize: '20px' });
  unhide.onclick = () => document.body.classList.remove('clean'); document.body.append(unhide);
  new MutationObserver(() => { const c = document.body.classList.contains('clean'); bar.style.display = c ? 'none' : ''; unhide.style.display = c ? 'block' : 'none'; if (c) close(); })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });
  relabel();
  // English / French switch
  const prev = SS.setLang; if (prev) SS.setLang = (...a) => { const r = prev(...a); setTimeout(relabel, 30); return r; };
  SS.mobile = { open, close };
}
