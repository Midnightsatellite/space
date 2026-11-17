// =====================================================================
// Midnight Satellite radio · "Watch the Short" links · Photo mode
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const tr = s => (SS.tr ? SS.tr(s) : s);

// ---------- Your videos ----------
const STATIONS = [
  { id: 'songs', name: 'Midnight Satellite songs', tracks: [
    ['e4nBRj_V_XA', 'Low Orbit'], ['TEoIkubWY28', 'Satellite of You'], ['VEeni7Z1OWQ', 'Hold Me in Eternity'], ['ruufYecDzao', 'Every Station Plays You'],
    ['emNfPEYAolc', 'Starfield, Open Wide'], ['upOA1Os0IGg', 'Where the Quiet Goes (Duet)'], ['xlLQwwl2Fb4', "City Lights Don't Sleep"], ['88o6pugbDlw', 'Paper Moons'],
    ['J5cHt2sK_EM', 'Orbit of You'], ['1jYfC6OawpE', 'Red Dust (Mars)'], ['gxrP-sVQeyw', 'Ghost of the Dashboard'], ['Suph8P6oubk', 'Access Granted'], ['BbWWsuWQ0WM', 'Gravity Dunk']] },
  { id: 'ambient', name: 'Deep space ambient', tracks: [
    ['somIxW5teWU', 'Drifting Past the Moon'], ['lM_CfVGoONA', 'Shores of Another World'], ['UnUgwwP_wCQ', 'Ocean & Space'], ['yzBgkph-9sg', 'Deep Space Ambient (8 hours)']] },
  { id: 'lofi', name: 'Lofi Loft', tracks: [
    ['6f8YCRlhRsQ', 'Rainy Night Study'], ['pSBEURkl0aA', 'Rain on the Skylight'], ['9GpirRkdQJs', 'Kettle On'], ['MGxAopOmvY0', 'Snow on the Window']] },
];
const SHORTS = { Saturn: 'Ic_wkzjGEK0' };              // One Fact key → YouTube Short id (add more as you post them)
const DOC_VIDEO = '5dV71tUgTLY';                         // A Journey Through Space
SS.more.SHORTS = SHORTS;

// ---------- Styles ----------
const css = document.createElement('style');
css.textContent = `
#radioPill{position:fixed;right:16px;bottom:34px;z-index:14;display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,rgba(40,30,90,.9),rgba(12,16,40,.9));border:1px solid rgba(255,210,122,.4);
  color:#fff;border-radius:999px;padding:7px 14px;font:600 13px/1 inherit;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.4)}
#radioPill:hover{border-color:#ffd27a}
#radio{position:fixed;right:16px;bottom:34px;z-index:14;width:356px;display:none;background:rgba(10,14,30,.94);backdrop-filter:blur(8px);border:1px solid rgba(255,210,122,.35);border-radius:14px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.5)}
#radio.on{display:block}
#radio.mini{width:200px}
#radio.mini iframe,#radio.mini #radioPlayer{width:200px!important;height:200px!important}
#radio.mini .head span .t,#radio.mini .now,#radio.mini select,#radio.mini #radioYT{display:none}
#radio.mini .ctl{justify-content:center;padding:6px}
#radio .head{cursor:move;user-select:none}
#radio .head{display:flex;align-items:center;gap:8px;padding:8px 10px 6px;font-size:12px;color:#ffd27a;letter-spacing:.12em;font-weight:700}
#radio .head span{flex:1}
#radio .head button{margin:0;padding:2px 8px}
#radioPlayer{width:356px;height:200px;background:#000;display:block}
#radio .now{padding:8px 12px 2px;font-size:13px;color:#e8ecff}
#radio .now b{color:#fff}
#radio .ctl{display:flex;gap:6px;align-items:center;padding:6px 10px 10px;flex-wrap:wrap}
#radio .ctl button{margin:0}
#radio select{flex:1;min-width:120px;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(140,160,255,.3);border-radius:8px;padding:4px}
#radio select option{background:#141a33}
#radio a{color:#ffd27a;font-size:12px;text-decoration:none;white-space:nowrap}
#radio a:hover{text-decoration:underline}
#fact .yt{background:#c4302b!important;border-color:#e0504a!important;color:#fff!important}
body.photo #ui,body.photo #info,body.photo #hint,body.photo #clock,body.photo #note,body.photo #langBtn,body.photo #radioPill,body.photo #fact,body.photo #caption{display:none!important}
body.photo.nolabels .lbl,body.photo.nolabels #labelLayer{visibility:hidden!important}
#photoBar{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:20;display:none;gap:6px;align-items:center;background:rgba(10,14,30,.85);backdrop-filter:blur(8px);
  border:1px solid rgba(140,160,255,.3);border-radius:999px;padding:6px 10px;transition:opacity .6s;font-size:13px;color:#dfe6ff}
body.photo #photoBar{display:flex}
#photoBar.idle{opacity:0}
#photoBar button{margin:0}
#photoBar label{display:flex;gap:4px;align-items:center;margin:0 4px;white-space:nowrap}
#photoFlash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:40;transition:opacity .5s}
`;
document.head.appendChild(css);

// ---------- 🎵 Midnight Satellite radio ----------
const pill = document.createElement('button'); pill.id = 'radioPill'; pill.type = 'button'; pill.textContent = '🎵 Midnight Satellite radio';
const box = document.createElement('div'); box.id = 'radio';
box.innerHTML = `<div class="head"><span>🎵<span class="t"> MIDNIGHT SATELLITE RADIO</span></span><button id="radioSmall" type="button">▢</button><button id="radioMin" type="button" title="">—</button></div>
<div id="radioPlayer"></div>
<div class="now"><span id="radioNowL">Now playing:</span> <b id="radioNow">…</b></div>
<div class="ctl"><button id="radioPrev" type="button">⏮</button><button id="radioPlay" type="button">⏯</button><button id="radioNext" type="button">⏭</button>
<select id="radioSt"></select><a id="radioYT" target="_blank" rel="noopener">▶ YouTube</a></div>`;
document.body.append(pill, box);
const stSel = $('radioSt');
STATIONS.forEach((s, i) => { const o = document.createElement('option'); o.value = i; o.textContent = s.name; stSel.appendChild(o); });
let player = null, ready = false, station = 0, order = [], idx = 0, apiLoading = false;
const shuffle = n => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const cur = () => STATIONS[station].tracks[order[idx]];
function showNow() { const t = cur(); $('radioNow').textContent = t[1]; $('radioYT').href = `https://www.youtube.com/watch?v=${t[0]}`; }
function playTrack() { showNow(); if (ready) player.loadVideoById(cur()[0]); }
function pickStation(i) { station = i; order = shuffle(STATIONS[i].tracks.length); idx = 0; if (STATIONS[i].id === 'songs') { const lo = order.indexOf(0); [order[0], order[lo]] = [order[lo], order[0]]; } playTrack(); }
function loadApi() {
  if (apiLoading) return; apiLoading = true;
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('radioPlayer', { width: 356, height: 200, host: 'https://www.youtube-nocookie.com', videoId: cur()[0],
      playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
      events: { onReady: () => { ready = true; player.playVideo(); },
        onStateChange: e => { if (e.data === 0) { idx = (idx + 1) % order.length; playTrack(); } if (e.data === 1) { const a = $('sound'); if (a?.checked) { a.checked = false; a.dispatchEvent(new Event('change')); } } },
        onError: () => { idx = (idx + 1) % order.length; playTrack(); } } });
  };
  const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
  setTimeout(() => { if (!ready) $('radioNow').textContent = cur()[1] + ' · ' + tr('open on YouTube ↗'); }, 9000);
}
function openRadio() { box.classList.add('on'); pill.style.display = 'none'; if (!order.length) { order = shuffle(STATIONS[0].tracks.length); const lo = order.indexOf(0); [order[0], order[lo]] = [order[lo], order[0]]; showNow(); }
  if (!player) loadApi(); else if (ready) player.playVideo(); }
function closeRadio() { box.classList.remove('on'); pill.style.display = ''; if (ready) player.pauseVideo(); }   // the player is only ever hidden while paused
pill.onclick = openRadio; $('radioMin').onclick = closeRadio;
$('radioNext').onclick = () => { idx = (idx + 1) % order.length; playTrack(); };
$('radioPrev').onclick = () => { idx = (idx - 1 + order.length) % order.length; playTrack(); };
$('radioPlay').onclick = () => { if (!ready) return; player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); };
stSel.onchange = () => pickStation(+stSel.value);
SS.i18nAdd?.({ ui: { Bigger: 'Agrandir', Smaller: 'Réduire' } });
{ // compact mode (the YouTube player stays at least 200×200, as YouTube requires), remembered between visits
  const setMini = on => { box.classList.toggle('mini', on); $('radioSmall').textContent = on ? '⤢' : '▢'; $('radioSmall').title = tr(on ? 'Bigger' : 'Smaller'); try { localStorage.setItem('ss_radiomini', on ? '1' : '0'); } catch (e) { } };
  try { setMini(localStorage.getItem('ss_radiomini') === '1'); } catch (e) { setMini(false); }
  $('radioSmall').onclick = () => setMini(!box.classList.contains('mini'));
  // drag the radio by its title bar to anywhere on screen
  const head = box.querySelector('.head'); let drag = null;
  head.addEventListener('pointerdown', e => { if (e.target.tagName === 'BUTTON') return; const r = box.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }; head.setPointerCapture(e.pointerId); });
  head.addEventListener('pointermove', e => { if (!drag) return; const r = box.getBoundingClientRect();
    const x = Math.min(innerWidth - r.width, Math.max(0, e.clientX - drag.dx)), y = Math.min(innerHeight - r.height, Math.max(0, e.clientY - drag.dy));
    Object.assign(box.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' }); });
  head.addEventListener('pointerup', () => { drag = null; });
}
SS.more.radio = { openRadio, closeRadio, STATIONS };

// ---------- ▶️ "Watch the Short" on One Fact cards, and the documentary link ----------
{
  const row = document.querySelector('#fact .row');
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'yt'; btn.id = 'factYT'; row.appendChild(btn);
  const sync = () => { const k = SS.more.currentFactKey?.(); const id = k && SHORTS[k]; btn.style.display = id ? '' : 'none'; btn.textContent = tr('▶ Watch the Short'); btn.onclick = () => window.open(`https://www.youtube.com/shorts/${id}`, '_blank', 'noopener'); };
  SS.more.syncShortBtn = sync;
  const note = $('note');
  if (note) { const a = document.createElement('a'); a.href = `https://www.youtube.com/watch?v=${DOC_VIDEO}`; a.target = '_blank'; a.rel = 'noopener'; a.style.color = 'inherit'; a.textContent = tr('🎬 Watch the documentary on YouTube'); a.id = 'docYT';
    note.append(' · ', a); }
}

// ---------- 📸 Photo mode ----------
{
  const bar = document.createElement('div'); bar.id = 'photoBar';
  bar.innerHTML = `<button id="phSave" type="button">📸 Save picture</button><button id="phSave916" type="button">📱 Save 9:16</button>
  <label><input id="phCine" type="checkbox" checked> <span>Cinematic camera</span></label><label><input id="phNames" type="checkbox"> <span>Names</span></label><label><input id="phOrbits" type="checkbox"> <span>Orbit lines</span></label><button id="phExit" type="button">✕ Exit (Esc)</button>`;
  const flash = document.createElement('div'); flash.id = 'photoFlash';
  document.body.append(bar, flash);
  const row = $('factBtn').parentElement; const b = document.createElement('button'); b.type = 'button'; b.id = 'photoBtn'; b.textContent = '📸 Photo mode'; row.appendChild(b);
  let on = false, prev = null, idle, t0 = 0, baseDist = null;
  const wake = () => { bar.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => on && bar.classList.add('idle'), 2500); };
  const setOrbits = v => SS.orbitLines.forEach(l => { if (l.userData.phPrev === undefined) l.userData.phPrev = l.visible; l.visible = v ? l.userData.phPrev : false; });
  function enter() {
    setOrbits($('phOrbits').checked);
    on = true; document.body.classList.add('photo'); document.body.classList.toggle('nolabels', !$('phNames').checked);
    prev = { auto: SS.controls.autoRotate, speed: SS.controls.autoRotateSpeed }; baseDist = null; t0 = performance.now(); wake();
  }
  function exit() { if (!on) return; on = false; SS.orbitLines.forEach(l => { if (l.userData.phPrev !== undefined) { l.visible = l.userData.phPrev; delete l.userData.phPrev; } }); document.body.classList.remove('photo', 'nolabels'); SS.controls.autoRotate = prev.auto; SS.controls.autoRotateSpeed = prev.speed; }
  b.onclick = enter; $('phExit').onclick = exit;
  $('phOrbits').onchange = () => { SS.orbitLines.forEach(l => { if (l.userData.phPrev !== undefined) { l.visible = $('phOrbits').checked ? l.userData.phPrev : false; } }); };
  $('phNames').onchange = () => document.body.classList.toggle('nolabels', !$('phNames').checked);
  addEventListener('keydown', e => { if (on && e.key === 'Escape') exit(); });
  addEventListener('pointermove', () => on && wake());
  SS.sim.push(dt => {       // slow orbit and a gentle push in / pull out
    if (!on || !$('phCine').checked) { baseDist = null; return; }
    SS.controls.autoRotate = true; SS.controls.autoRotateSpeed = 0.35;
    const off = SS.camera.position.clone().sub(SS.controls.target), d = off.length();
    if (baseDist == null) baseDist = d;
    const want = baseDist * (1 + 0.08 * Math.sin((performance.now() - t0) / 1000 * 0.16));
    SS.camera.position.copy(SS.controls.target).addScaledVector(off.normalize(), d + (want - d) * Math.min(1, dt * 0.8));
  });
  addEventListener('wheel', () => { if (on) baseDist = null; }, { passive: true });
  function save(vertical) {
    const r = SS.renderer; r.render(SS.scene, SS.camera);            // draw a fresh frame and copy it straight away
    const src = r.domElement, W = src.width, H = src.height;
    const cw = vertical ? Math.round(Math.min(W, H * 9 / 16)) : W, ch = vertical ? Math.round(cw * 16 / 9) : H;
    const sx = (W - cw) / 2, sy = (H - Math.min(H, ch)) / 2;
    const c = document.createElement('canvas'); c.width = cw; c.height = Math.min(H, ch); const g = c.getContext('2d');
    g.drawImage(src, sx, sy, cw, c.height, 0, 0, cw, c.height);
    const fs = Math.max(14, Math.round(c.width / (vertical ? 28 : 70)));
    g.font = `600 ${fs}px Inter, -apple-system, Helvetica, Arial, sans-serif`; g.textAlign = 'right'; g.fillStyle = 'rgba(255,210,122,0.85)';
    g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = fs * 0.4;
    g.fillText('Midnight Satellite', c.width - fs, c.height - fs * 1.9);
    g.font = `${Math.round(fs * 0.7)}px Inter, -apple-system, Helvetica, Arial, sans-serif`; g.fillStyle = 'rgba(230,236,255,0.75)';
    g.fillText('midnightsatellite.github.io/space', c.width - fs, c.height - fs * 0.8);
    const name = (SS.cosmos.INFO[SS.more.current]?.name || 'space').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    c.toBlob(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `midnight-satellite-${name}${vertical ? '-9x16' : ''}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
    flash.style.transition = 'none'; flash.style.opacity = 0.7; requestAnimationFrame(() => { flash.style.transition = 'opacity .5s'; flash.style.opacity = 0; });
  }
  $('phSave').onclick = () => save(false); $('phSave916').onclick = () => save(true);
  SS.more.photo = { enter, exit, save };
}

await import('./explore.js' + new URL(import.meta.url).search);
SS.setLang?.(SS.lang);    // translate the new buttons
