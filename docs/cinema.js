// =====================================================================
// Glow (bloom) · Cinema mode · tidier sky (softer lines, lit night sides, fewer far-away names)
// =====================================================================
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
const SS = window.SS;
const { scene, camera, renderer } = SS;
const $ = id => document.getElementById(id);
const tr = t => (SS.tr ? SS.tr(t) : t);

// =====================================================================
// 1. GLOW: bright things (the Sun, stars, comets, engines) bleed light like a film camera
// =====================================================================
const composer = new EffectComposer(renderer);
const dpr = Math.min(devicePixelRatio || 1, 1.5);
composer.setPixelRatio(dpr); composer.setSize(innerWidth, innerHeight);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.55, 0.5, 0.82);
composer.addPass(bloom);
composer.addPass(new OutputPass());
let glowOn = true, inside = false;
const raw = renderer.render.bind(renderer);
renderer.render = (s, c) => {                        // every normal frame goes through the glow, internal passes draw straight
  if (inside || !glowOn || s !== scene) return raw(s, c);
  inside = true; try { composer.render(); } finally { inside = false; }
};
addEventListener('resize', () => { composer.setSize(innerWidth, innerHeight); bloom.resolution.set(innerWidth / 2, innerHeight / 2); });
{
  const row = document.createElement('label'); row.innerHTML = '<span>Glow</span> <input id="glowOn" type="checkbox">';
  const after = $('swarmsOn')?.parentElement || $('labels').parentElement; after.after(row);
  const box = $('glowOn');
  let saved = null; try { saved = localStorage.getItem('ss_glow'); } catch (e) { }
  glowOn = saved != null ? saved === '1' : false;   // off by default (the user can turn it on; the choice is remembered)
  box.checked = glowOn;
  box.onchange = () => { glowOn = box.checked; try { localStorage.setItem('ss_glow', glowOn ? '1' : '0'); } catch (e) { } };
  // if the device struggles (under ~24 frames a second for a few seconds), switch the glow off once
  if (saved == null) { let n = 0, t0 = performance.now(), checks = 0;
    const watch = () => { n++; const t = performance.now(); if (t - t0 > 4000) { const fps = n * 1000 / (t - t0); n = 0; t0 = t; checks++;
      if (glowOn && fps < 24 && checks > 1) { glowOn = false; box.checked = false; return; } if (checks > 4) return; } requestAnimationFrame(watch); };
    if (!window.FIXED_DT) requestAnimationFrame(watch); }
}
SS.more.glow = { composer, bloom, set: v => { glowOn = v; $('glowOn').checked = v; } };

// =====================================================================
// 2. TIDIER SKY
// =====================================================================
// night sides of planets: a little more starlight so Jupiter & co. never turn into black discs
scene.traverse(o => { if (o.isAmbientLight) o.intensity = 0.42; });
// constellation and zodiac lines: softer, so they frame the view instead of taking it over
const softenLines = () => scene.traverse(o => { if (o.isLineSegments && o.material && !o.userData.soft) {
  const c = o.material.color.getHex(); if (c === 0x5f7fd0) { o.material.opacity = 0.22; o.userData.soft = 1; } if (c === 0xffc861) { o.material.opacity = 0.42; o.userData.soft = 1; } } });
softenLines(); setTimeout(softenLines, 1500); setTimeout(softenLines, 5000);   // the line data arrives a moment after loading
// asteroid belt: round dots instead of little squares
if (window.__belt) { const m = window.__belt.material; m.map = SS.cosmos.softDot; m.transparent = true; m.depthWrite = false; m.size = 0.2; m.needsUpdate = true; }
// a few spacecraft near Earth were drawn too big next to the planet: shrink them
for (const [k, f, view] of [['Satellite', 0.45, 0.4], ['Chandra', 0.55, 0.28], ['TESS', 0.6, 0.25]]) { const b = SS.bodies[k]; if (!b) continue; b.obj.scale.multiplyScalar(f); b.radius *= f; b.view = view; }
// names of small things (spacecraft, small moons) only show up when you are close to them
{
  const wp = new THREE.Vector3(), cp = new THREE.Vector3();
  const RANGE = { craft: 26, moon: 32 };
  SS.sim.push(() => {
    if ($('allNames')?.checked) return;
    camera.getWorldPosition(cp);
    for (const l of SS.labels) {
      if (!l.visible) continue;
      const el = l.element, cl = el.classList; if (cl.contains('focus')) continue;
      const r = cl.contains('craft') ? RANGE.craft : cl.contains('moon') ? RANGE.moon : 0; if (!r) continue;
      if (l.getWorldPosition(wp).distanceTo(cp) > r) l.visible = false;
    }
  });
}

// =====================================================================
// 3. CINEMA MODE: black bars, film grain, slow camera, a self-running tour of the best views
// =====================================================================
{
  const css = document.createElement('style');
  css.textContent = `
  .cineBar{position:fixed;left:0;right:0;height:max(0px,calc((100vh - 100vw / 2.39) / 2));background:#000;z-index:30;pointer-events:none;transition:height 1s}
  #cineTop{top:0} #cineBot{bottom:0}
  body:not(.cinema) .cineBar{height:0}
  #cineGrain,#cineVig{position:fixed;inset:0;pointer-events:none;z-index:29;display:none}
  body.cinema #cineGrain,body.cinema #cineVig{display:block}
  #cineVig{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)}
  #cineGrain{opacity:.07;mix-blend-mode:overlay;background-size:160px 160px}
  body.cinema #photoBar{display:none!important}
  #cineCap{position:fixed;left:6vw;bottom:calc(max(0px,(100vh - 100vw / 2.39) / 2) + 4vh);z-index:31;pointer-events:none;opacity:0;transition:opacity 1.6s;font-family:Inter,-apple-system,Helvetica,Arial,sans-serif;text-shadow:0 2px 12px rgba(0,0,0,.8)}
  #cineCap .n{font-size:clamp(22px,3.2vw,46px);font-weight:300;letter-spacing:.06em;color:#fff}
  #cineCap .c{font-size:clamp(11px,1vw,15px);letter-spacing:.3em;text-transform:uppercase;color:#ffd27a;margin-top:4px}
  #cineCap .s{font-size:clamp(10px,.8vw,12px);letter-spacing:.2em;color:rgba(230,236,255,.6);margin-top:10px}
  body.cinema #cineCap{display:block} body:not(.cinema) #cineCap{display:none}
  #cineExit{position:fixed;top:calc(max(0px,(100vh - 100vw / 2.39) / 2) + 14px);right:16px;z-index:32;display:none;opacity:0;transition:opacity .5s}
  body.cinema #cineExit{display:block} #cineExit.show{opacity:1}`;
  document.head.appendChild(css);
  const top = document.createElement('div'); top.className = 'cineBar'; top.id = 'cineTop';
  const bot = document.createElement('div'); bot.className = 'cineBar'; bot.id = 'cineBot';
  const vig = document.createElement('div'); vig.id = 'cineVig';
  const grain = document.createElement('div'); grain.id = 'cineGrain';
  const cap = document.createElement('div'); cap.id = 'cineCap'; cap.innerHTML = '<div class="n"></div><div class="c"></div><div class="s">MIDNIGHT SATELLITE</div>';
  const ex = document.createElement('button'); ex.id = 'cineExit'; ex.type = 'button';
  document.body.append(top, bot, vig, grain, cap, ex);
  // film grain: a small noise tile, redrawn a few times a second
  const gc = document.createElement('canvas'); gc.width = gc.height = 160; const gx = gc.getContext('2d'); const img = gx.createImageData(160, 160);
  let grainT = 0;
  const drawGrain = () => { for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } gx.putImageData(img, 0, 0); grain.style.backgroundImage = `url(${gc.toDataURL()})`; };

  const TOUR = ['Saturn', 'Earth', 'Jupiter', 'Orion', 'Moon', 'Pleiades', 'Neptune', 'Andromeda', 'Crab', 'Mars', 'Carina', 'SgrA', 'Uranus', 'Eagle', 'M87BH', 'Ring', 'Whirlpool', 'Sun', 'Helix', 'LMC', 'TON618', 'MilkyWay'];
  let on = false, i = 0, timer = null, idle = null, prevGlow = true, prevPhotoCine = true;
  const showCap = k => {
    const inf = SS.cosmos.INFO[k]; if (!inf) { cap.style.opacity = 0; return; }
    cap.querySelector('.n').textContent = tr(inf.name); cap.querySelector('.c').textContent = tr(inf.cat);
    cap.style.opacity = 0; setTimeout(() => { if (on) cap.style.opacity = 1; }, 2600); setTimeout(() => { if (on) cap.style.opacity = 0; }, 9500);
  };
  function next() {
    const list = TOUR.filter(k => SS.bodies[k]); const k = list[i++ % list.length];
    const cine = $('phCine'); cine.checked = false;              // let the flight finish before the slow drift starts
    SS.go(k); showCap(k);
    setTimeout(() => { if (on) cine.checked = true; }, 4200);
  }
  function enter() {
    if (on) return; on = true; i = Math.floor(Math.random() * 6);
    prevGlow = $('glowOn').checked; SS.more.glow.set(true);
    $('phNames').checked = false; prevPhotoCine = $('phCine').checked;
    SS.more.photo.enter(); document.body.classList.add('cinema', 'nolabels');
    $('speed').value = '0.0416667';
    drawGrain(); next(); timer = setInterval(next, 16000);
    ex.textContent = tr('✕ Exit cinema (Esc)');
  }
  function exit() {
    if (!on) return; on = false; clearInterval(timer); cap.style.opacity = 0;
    document.body.classList.remove('cinema'); $('phCine').checked = prevPhotoCine; SS.more.photo.exit(); SS.more.glow.set(prevGlow);
  }
  SS.sim.push(dt => { if (!on) return; grainT += dt; if (grainT > 0.12) { grainT = 0; drawGrain(); } });
  ex.onclick = exit;
  addEventListener('keydown', e => { if (on && e.key === 'Escape') exit(); });
  addEventListener('pointermove', () => { if (!on) return; ex.classList.add('show'); clearTimeout(idle); idle = setTimeout(() => ex.classList.remove('show'), 2200); });
  const b = document.createElement('button'); b.type = 'button'; b.id = 'cineBtn'; b.textContent = '🎬 Cinema';
  $('photoBtn').after(b); b.onclick = enter;
  SS.more.cinema = { enter, exit };
}

SS.i18nAdd?.({ ui: { Glow: 'Halo lumineux', '🎬 Cinema': '🎬 Cinéma', '✕ Exit cinema (Esc)': '✕ Quitter le mode cinéma (Échap)' } });
await import('./mars.js' + new URL(import.meta.url).search);
