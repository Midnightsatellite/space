// =====================================================================
// 🎬 Record a Short: records a vertical 9:16 clip (720×1280, 30 fps) of the 3D view,
// with a slow camera spin and the plain-text tag "@MidnightSatellite" in the bottom-right corner,
// ready for YouTube Shorts and TikTok. The recording happens in the visitor's own browser.
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const T = (en, f) => fr() ? f : en;
const W = 720, H = 1280, FPS = 30;

const css = document.createElement('style');
css.textContent = `#shortPop{position:fixed;inset:0;background:rgba(2,4,12,.55);z-index:45;display:none;align-items:center;justify-content:center}
  #shortPop.on{display:flex}
  #shortPop .box{width:min(400px,92vw);max-height:90vh;overflow:auto;background:rgba(12,16,34,.97);border:1px solid rgba(140,160,255,.3);border-radius:14px;padding:14px 16px;color:#e8ecff;font:14px/1.5 system-ui,sans-serif}
  #shortPop h3{margin:0 0 8px;font-size:16px;color:#fff;display:flex;justify-content:space-between;align-items:center}
  #shortPop .opts{display:flex;gap:8px;margin:8px 0}
  #shortPop .opts button.sel{background:#3b4fb0;border-color:#9fb0ff}
  #shortPop label{display:flex;gap:8px;align-items:center;margin:6px 0}
  #shortPop video{display:block;width:100%;max-height:52vh;border-radius:10px;background:#000;margin:8px 0}
  #shortPop .go{display:inline-block;padding:7px 14px;border-radius:9px;border:1px solid #ffd27a;background:#6b5a1f;color:#fff;text-decoration:none;cursor:pointer;font-weight:600}
  #shortPop .note{font-size:12px;color:#aab3d8}
  #shortRec{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:46;display:none;gap:10px;align-items:center;background:rgba(20,6,10,.9);border:1px solid #ff6b6b;border-radius:999px;padding:6px 8px 6px 14px;color:#fff;font:600 14px system-ui,sans-serif}
  #shortRec.on{display:flex} #shortRec i{width:10px;height:10px;border-radius:50%;background:#ff3b3b;animation:shortBlink 1s infinite}
  #shortRec button{border-radius:999px;padding:3px 10px}
  #shortFrame{position:fixed;top:0;bottom:0;left:50%;transform:translateX(-50%);aspect-ratio:9/16;max-width:100vw;border:2px dashed rgba(255,210,122,.55);z-index:44;pointer-events:none;display:none;box-shadow:0 0 0 100vmax rgba(0,0,0,.35)}
  #shortFrame.on{display:block}
  @keyframes shortBlink{50%{opacity:.25}}`;
document.head.appendChild(css);

const pop = document.createElement('div'); pop.id = 'shortPop'; pop.innerHTML = '<div class="box"></div>';
const recBar = document.createElement('div'); recBar.id = 'shortRec'; recBar.innerHTML = '<i></i><span id="shortTime">0:00</span><button type="button" id="shortStop"></button>';
const frame = document.createElement('div'); frame.id = 'shortFrame';
document.body.append(pop, recBar, frame);
pop.onclick = e => { if (e.target === pop) close(); };

const can = document.createElement('canvas'); can.width = W; can.height = H;
const ctx = can.getContext('2d');
let rec = null, length = 15, spin = true, lastUrl = null;

const pickType = () => ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm']
  .find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
const supported = () => !!(window.MediaRecorder && can.captureStream);

// copy each freshly drawn 3D frame into the vertical canvas, straight after the scene renders
function drawFrame() {
  const src = SS.renderer.domElement, sw = src.width, sh = src.height;
  let cw = sh * 9 / 16, ch = sh;                      // crop a 9:16 slice from the middle
  if (cw > sw) { cw = sw; ch = sw * 16 / 9; }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, W, H);
  const tag = '@MidnightSatellite';
  ctx.font = '600 30px system-ui, -apple-system, Segoe UI, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText(tag, W - 30, H - 38);
  ctx.fillStyle = '#fff'; ctx.fillText(tag, W - 32, H - 40);
}
{ const r = SS.renderer, orig = r.render.bind(r);
  r.render = (scene, cam) => { orig(scene, cam); if (rec && cam === SS.camera) drawFrame(); }; }

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function start() {
  close();
  const type = pickType(), stream = can.captureStream(FPS);
  let mr; try { mr = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 8e6 } : { videoBitsPerSecond: 8e6 }); } catch (e) { mr = new MediaRecorder(stream); }
  const chunks = [], t0 = performance.now(), wasSpin = SS.controls.autoRotate, wasSpeed = SS.controls.autoRotateSpeed;
  if (spin) { SS.controls.autoRotate = true; SS.controls.autoRotateSpeed = 0.6; }
  document.body.classList.add('clean'); frame.classList.add('on'); recBar.classList.add('on');
  $('shortStop').textContent = T('■ Stop', '■ Arrêter');
  mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  mr.onstop = () => {
    clearInterval(rec.timer); rec = null;
    SS.controls.autoRotate = wasSpin; SS.controls.autoRotateSpeed = wasSpeed;
    document.body.classList.remove('clean'); frame.classList.remove('on'); recBar.classList.remove('on');
    done(new Blob(chunks, { type: (mr.mimeType || type || 'video/webm').split(';')[0] }));
  };
  rec = { mr, timer: setInterval(() => { const s = (performance.now() - t0) / 1000; $('shortTime').textContent = fmt(s) + ' / ' + fmt(length); if (s >= length) stop(); }, 200) };
  drawFrame(); mr.start(500);
}
function stop() { if (rec && rec.mr.state !== 'inactive') rec.mr.stop(); }
$('shortStop').onclick = stop;

function done(blob) {
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  const url = lastUrl = URL.createObjectURL(blob), mp4 = /mp4/.test(blob.type);
  const place = (SS.cosmos?.INFO?.[SS.more?.current]?.name || 'Space').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
  const name = `MidnightSatellite-${place}.${mp4 ? 'mp4' : 'webm'}`;
  const box = pop.querySelector('.box');
  box.innerHTML = `<h3><span>🎬 ${T('Your Short is ready', 'Votre Short est prêt')}</span><button type="button" data-x>✕</button></h3>
    <video src="${url}" controls playsinline loop muted autoplay></video>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><a class="go" href="${url}" download="${name}">⬇ ${T('Save video', 'Enregistrer la vidéo')}</a>
    <button type="button" data-again>↺ ${T('Record again', 'Recommencer')}</button></div>
    <div class="note" style="margin-top:8px">${T('Vertical 9:16, ready for YouTube Shorts and TikTok. Add your music in the app when you post it.', 'Format vertical 9:16, prêt pour YouTube Shorts et TikTok. Ajoutez votre musique dans l’application au moment de publier.')}
    ${mp4 ? '' : T(' This browser saves it as .webm: YouTube accepts it; for TikTok, record in Safari or a recent Chrome to get .mp4.', ' Ce navigateur l’enregistre en .webm : YouTube l’accepte ; pour TikTok, enregistrez dans Safari ou un Chrome récent pour obtenir un .mp4.')}</div>`;
  box.querySelector('[data-x]').onclick = close; box.querySelector('[data-again]').onclick = open;
  pop.classList.add('on');
}
function open() {
  const box = pop.querySelector('.box');
  if (!supported()) {
    box.innerHTML = `<h3><span>🎬 ${T('Record a Short', 'Enregistrer un Short')}</span><button type="button" data-x>✕</button></h3><div>${T('This browser cannot record video. Try Safari, Chrome or Edge on a computer.', 'Ce navigateur ne peut pas enregistrer de vidéo. Essayez Safari, Chrome ou Edge sur un ordinateur.')}</div>`;
  } else {
    box.innerHTML = `<h3><span>🎬 ${T('Record a Short', 'Enregistrer un Short')}</span><button type="button" data-x>✕</button></h3>
      <div>${T('Records what is on screen as a vertical video for YouTube Shorts and TikTok. Fly somewhere first, then press Start.', 'Enregistre ce qui est à l’écran en vidéo verticale pour YouTube Shorts et TikTok. Allez d’abord quelque part, puis appuyez sur Démarrer.')}</div>
      <div class="opts">${[15, 30, 60].map(s => `<button type="button" data-len="${s}" class="${s === length ? 'sel' : ''}">${s} s</button>`).join('')}</div>
      <label><input type="checkbox" data-spin ${spin ? 'checked' : ''}> ${T('Slow camera spin', 'Rotation lente de la caméra')}</label>
      <div class="note">${T('The dashed frame shows what will be in the video. You can still drag and zoom while it records.', 'Le cadre en pointillés montre ce qui sera dans la vidéo. Vous pouvez toujours tourner et zoomer pendant l’enregistrement.')}</div>
      <div style="margin-top:10px"><button type="button" class="go" data-start>● ${T('Start recording', 'Démarrer l’enregistrement')}</button></div>`;
    for (const b of box.querySelectorAll('[data-len]')) b.onclick = () => { length = +b.dataset.len; open(); };
    box.querySelector('[data-spin]').onchange = e => { spin = e.target.checked; };
    box.querySelector('[data-start]').onclick = start;
  }
  box.querySelector('[data-x]').onclick = close;
  pop.classList.add('on');
}
function close() { pop.classList.remove('on'); }

// button next to Photo mode (the phone layout moves it to Play)
{ const after = $('photoBtn'); if (after) { const b = document.createElement('button'); b.type = 'button'; b.id = 'shortBtn'; b.textContent = '🎬 Record a Short'; b.onclick = open; after.after(b); } }
SS.i18nAdd?.({ ui: { '🎬 Record a Short': '🎬 Enregistrer un Short' } });
addEventListener('keydown', e => { if (e.key === 'Escape' && rec) stop(); });
SS.more.shorts = { open, start, stop };
