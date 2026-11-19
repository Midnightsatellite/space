// =====================================================================
// Age & weight on other worlds · space quiz · Pale Blue Dot · today's Sun · 2027 eclipse · tonight's sky · Gargantua-style black holes
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { scene, camera, bodies, sim, flyTo, focusSel, addLabel, glowSprite } = SS;
const { info, INFO } = SS.cosmos;
const { nearLabel, PL, J2000 } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const special = SS.more.special;
const nf = (n, d = 0) => n.toLocaleString(fr() ? 'fr-FR' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
const go = k => { focusSel.value = k; SS.go(k); };

// ---------- shared pop-up window ----------
{
  const css = document.createElement('style');
  css.textContent = `.pop{position:fixed;inset:0;background:rgba(2,4,12,.6);backdrop-filter:blur(3px);z-index:30;display:none;align-items:center;justify-content:center}
  .pop.on{display:flex}
  .pop .box{width:min(520px,94vw);max-height:88vh;overflow:auto;background:rgba(12,16,34,.97);border:1px solid rgba(140,160,255,.25);border-radius:16px;padding:16px 18px;color:#e8ecff;font-size:14px;line-height:1.45}
  .pop h3{margin:0 0 8px;font-size:17px;color:#fff;display:flex;justify-content:space-between;align-items:center}
  .pop input,.pop select{background:#141a33;color:#e6ebff;border:1px solid #2c3766;border-radius:6px;padding:5px 7px;font-size:14px}
  .pop table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px}
  .pop td,.pop th{padding:5px 6px;border-top:1px solid rgba(140,160,255,.15);text-align:left}
  .pop tr.go{cursor:pointer} .pop tr.go:hover{background:rgba(140,160,255,.1)}
  .pop .opt{display:block;width:100%;text-align:left;margin:6px 0;padding:9px 12px;font-size:14px}
  .pop .opt.ok{background:#1f6b3a!important;border-color:#4fd07a!important} .pop .opt.no{background:#6b1f2a!important;border-color:#e0504a!important}
  .pop .big{font-size:34px;font-weight:700;color:#ffd27a;text-align:center;margin:8px 0}`;
  document.head.appendChild(css);
}
function popup(id) {
  const p = document.createElement('div'); p.className = 'pop'; p.id = id; p.innerHTML = '<div class="box"></div>'; document.body.appendChild(p);
  p.onclick = e => { if (e.target === p) p.classList.remove('on'); };
  addEventListener('keydown', e => { if (e.key === 'Escape') p.classList.remove('on'); });
  return p;
}
const row = $('factBtn').parentElement; row.style.flexWrap = 'wrap'; $('ui').style.maxWidth = '400px';
const btn = (id, text) => { const b = document.createElement('button'); b.type = 'button'; b.id = id; b.textContent = text; row.appendChild(b); return b; };

// =====================================================================
// 1. YOUR AGE AND WEIGHT ON OTHER WORLDS
// =====================================================================
{
  const W = [ // key, EN, FR, gravity (Earth = 1), year in Earth days (null = not orbiting the Sun on its own)
    ['Mercury', 'Mercury', 'Mercure', 0.378, 87.969], ['Venus', 'Venus', 'Vénus', 0.904, 224.701], ['Earth', 'Earth', 'Terre', 1, 365.256],
    ['Moon', 'The Moon', 'La Lune', 0.165, null], ['Mars', 'Mars', 'Mars', 0.377, 686.98], ['Jupiter', 'Jupiter', 'Jupiter', 2.528, 4332.59],
    ['Saturn', 'Saturn', 'Saturne', 1.065, 10759.22], ['Uranus', 'Uranus', 'Uranus', 0.886, 30688.5], ['Neptune', 'Neptune', 'Neptune', 1.14, 60182],
    ['Pluto', 'Pluto', 'Pluton', 0.063, 90560], ['Sun', 'The Sun', 'Le Soleil', 27.9, null]];
  const p = popup('agePop'); const box = p.querySelector('.box');
  let bday = '', kg = '', unit = 'kg';
  try { bday = localStorage.getItem('ss_bday') || ''; kg = localStorage.getItem('ss_kg') || ''; unit = localStorage.getItem('ss_unit') || 'kg'; } catch (e) { }
  function render() {
    const F = fr();
    box.innerHTML = `<h3><span>${F ? '🎂 Votre âge et votre poids dans l\'espace' : '🎂 Your age and weight in space'}</span><button type="button" id="ageX">✕</button></h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <label>${F ? 'Date de naissance' : 'Birthday'} <input type="date" id="ageB" value="${bday}"></label>
        <label>${F ? 'Poids' : 'Weight'} <input type="number" id="ageW" min="1" max="500" step="0.1" value="${kg}" style="width:80px"></label>
        <select id="ageU"><option value="kg">kg</option><option value="lb">lb</option><option value="st">st</option></select></div>
      <div id="ageOut"></div>`;
    $('ageU').value = unit;
    $('ageX').onclick = () => p.classList.remove('on');
    for (const id of ['ageB', 'ageW', 'ageU']) $(id).oninput = $(id).onchange = () => { bday = $('ageB').value; kg = $('ageW').value; unit = $('ageU').value;
      try { localStorage.setItem('ss_bday', bday); localStorage.setItem('ss_kg', kg); localStorage.setItem('ss_unit', unit); } catch (e) { } out(); };
    out();
  }
  function out() {
    const F = fr(), o = $('ageOut'); const b = bday ? Date.parse(bday + 'T12:00:00Z') : NaN, w = parseFloat(kg);
    if (isNaN(b) && isNaN(w)) { o.innerHTML = `<p style="opacity:.7">${F ? 'Entrez votre date de naissance et votre poids : rien n\'est envoyé, tout reste sur votre appareil.' : 'Enter your birthday and weight: nothing is sent anywhere, it all stays on your device.'}</p>`; return; }
    const days = (Date.now() - b) / 864e5;
    let rows = '', shareBits = [];
    for (const [k, en, frn, g, yr] of W) {
      const age = !isNaN(b) && yr ? days / yr : null;
      let next = '';
      if (age != null) { const left = (Math.ceil(age + 1e-9) - age) * yr; next = left < 1 ? (F ? 'aujourd\'hui ! 🎉' : 'today! 🎉') : F ? `dans ${nf(left)} j` : `in ${nf(left)} days`; }
      const wt = !isNaN(w) ? `${nf(w * g, unit === 'st' ? 1 : 0)} ${unit}` : '–';
      rows += `<tr class="go" data-k="${k}"><td>${F ? frn : en}</td><td>${age != null ? nf(age, age < 10 ? 2 : 1) : '–'}</td><td style="opacity:.8">${next || '–'}</td><td>${wt}</td></tr>`;
      if (k === 'Mars' && age != null) shareBits.push(F ? `J'ai ${nf(age, 1)} ans sur Mars` : `I'm ${nf(age, 1)} years old on Mars`);
      if (k === 'Jupiter' && age != null) shareBits.push(F ? `${nf(age, 2)} sur Jupiter` : `${nf(age, 2)} on Jupiter`);
    }
    o.innerHTML = `<table><tr><th>${F ? 'Monde' : 'World'}</th><th>${F ? 'Âge' : 'Age'}</th><th>${F ? 'Prochain anniversaire' : 'Next birthday'}</th><th>${F ? 'Poids' : 'Weight'}</th></tr>${rows}</table>
      ${!isNaN(b) ? `<p style="margin:8px 0 0">${F ? `Vous avez vécu <b style="color:#ffd27a">${nf(days)}</b> jours sur Terre, et fait ${nf(days / 365.256, 1)} fois le tour du Soleil (environ ${nf(days * 2.57 / 1000, 1)} milliards de km).` : `You have lived <b style="color:#ffd27a">${nf(days)}</b> days on Earth and travelled ${nf(days / 365.256, 1)} times around the Sun (about ${nf(days * 2.57 / 1000, 1)} billion km).`}</p>` : ''}
      <p style="font-size:12px;opacity:.65;margin:6px 0">${F ? 'Touchez un monde pour y aller. Sur la Lune et le Soleil, pas d\'« année » propre.' : 'Tap a world to fly there. The Moon and the Sun have no "year" of their own.'}</p>
      ${shareBits.length ? `<button type="button" id="ageShare">${F ? '🔗 Copier pour partager' : '🔗 Copy to share'}</button>` : ''}`;
    for (const tr of o.querySelectorAll('tr.go')) tr.onclick = () => { p.classList.remove('on'); go(tr.dataset.k); };
    const sb = $('ageShare'); if (sb) sb.onclick = () => { const t = `${shareBits.join(', ')} 🪐 ${F ? 'Et vous ?' : 'What about you?'} ${location.origin}${location.pathname}?age=1${F ? '&lang=fr' : ''}`;
      (navigator.clipboard?.writeText(t) || Promise.reject()).then(() => sb.textContent = F ? '✓ Copié' : '✓ Copied', () => prompt('', t)); };
  }
  btn('ageBtn', '🎂 My age in space').onclick = () => { render(); p.classList.add('on'); };
  if (new URLSearchParams(location.search).get('age')) setTimeout(() => { render(); p.classList.add('on'); }, 1500);
}

// =====================================================================
// 2. SPACE QUIZ
// =====================================================================
{
  const Q = [ // fly to, question EN, [right, wrong, wrong] EN, question FR, [right, wrong, wrong] FR
    ['Saturn', 'Which planet would float in a giant bathtub?', ['Saturn', 'Jupiter', 'Neptune'], 'Quelle planète flotterait dans une baignoire géante ?', ['Saturne', 'Jupiter', 'Neptune']],
    ['Sun', 'How long does sunlight take to reach Earth?', ['About 8 minutes', 'About 8 seconds', 'About 8 hours'], 'Combien de temps la lumière du Soleil met-elle pour atteindre la Terre ?', ['Environ 8 minutes', 'Environ 8 secondes', 'Environ 8 heures']],
    ['Venus', 'Which is the hottest planet?', ['Venus', 'Mercury', 'Mars'], 'Quelle est la planète la plus chaude ?', ['Vénus', 'Mercure', 'Mars']],
    ['MK_Olympus', 'The tallest volcano in the Solar System is on…', ['Mars', 'Earth', 'Venus'], 'Le plus haut volcan du Système solaire se trouve sur…', ['Mars', 'la Terre', 'Vénus']],
    ['Sun', 'Roughly how many Earths would fit inside the Sun?', ['About 1.3 million', 'About 1,000', 'About 100'], 'Combien de Terres tiendraient à peu près dans le Soleil ?', ['Environ 1,3 million', 'Environ 1 000', 'Environ 100']],
    ['LS_Baikonur', 'Who was the first human in space, in 1961?', ['Yuri Gagarin', 'Neil Armstrong', 'Buzz Aldrin'], 'Qui fut le premier humain dans l\'espace, en 1961 ?', ['Youri Gagarine', 'Neil Armstrong', 'Buzz Aldrin']],
    ['Voyager1', 'In November 2026, Voyager 1 became the first spacecraft…', ['one light-day from Earth', 'to leave the Milky Way', 'to land on a comet'], 'En novembre 2026, Voyager 1 est devenu le premier engin…', ['à un jour-lumière de la Terre', 'à quitter la Voie lactée', 'à se poser sur une comète']],
    ['Proxima', 'Which is the closest star to the Sun?', ['Proxima Centauri', 'Sirius', 'Polaris'], 'Quelle est l\'étoile la plus proche du Soleil ?', ['Proxima du Centaure', 'Sirius', 'L\'étoile polaire']],
    ['Venus', 'On Venus, a day is…', ['longer than its year', 'shorter than an Earth day', 'exactly 24 hours'], 'Sur Vénus, un jour est…', ['plus long que son année', 'plus court qu\'un jour terrestre', 'exactement de 24 heures']],
    ['ISS', 'The word "astronaut" means…', ['star sailor', 'sky walker', 'moon traveller'], 'Le mot « astronaute » veut dire…', ['marin des étoiles', 'marcheur du ciel', 'voyageur de la Lune']],
    ['Jupiter', 'Which planet has the Great Red Spot, a storm wider than Earth?', ['Jupiter', 'Mars', 'Saturn'], 'Quelle planète a la Grande Tache rouge, une tempête plus large que la Terre ?', ['Jupiter', 'Mars', 'Saturne']],
    ['MS_A11', 'How many people have walked on the Moon?', ['12', '6', '24'], 'Combien de personnes ont marché sur la Lune ?', ['12', '6', '24']],
    ['Andromeda', 'Which is our nearest big neighbour galaxy?', ['Andromeda', 'Sombrero', 'Whirlpool'], 'Quelle est la grande galaxie voisine la plus proche ?', ['Andromède', 'Le Sombrero', 'Le Tourbillon']],
    ['MS2_Ingenuity', 'What was Ingenuity the first to do?', ['Fly on another planet', 'Land on the Moon', 'Photograph a black hole'], 'Qu\'est-ce qu\'Ingenuity a été le premier à faire ?', ['Voler sur une autre planète', 'Se poser sur la Lune', 'Photographier un trou noir']],
    ['ISS', 'How often does the ISS go around Earth?', ['About every 90 minutes', 'Once a day', 'Once a week'], 'À quelle fréquence l\'ISS fait-elle le tour de la Terre ?', ['Environ toutes les 90 minutes', 'Une fois par jour', 'Une fois par semaine']],
    ['OrionCraft', 'In April 2026, Artemis II flew its crew…', ['around the Moon', 'onto the Moon', 'to Mars'], 'En avril 2026, Artemis II a emmené son équipage…', ['autour de la Lune', 'sur la Lune', 'vers Mars']],
    ['Neptune', 'Which planet is the farthest from the Sun?', ['Neptune', 'Uranus', 'Saturn'], 'Quelle planète est la plus éloignée du Soleil ?', ['Neptune', 'Uranus', 'Saturne']],
    ['Moon', 'Why do we always see the same side of the Moon?', ['It spins once per orbit', 'It does not spin', 'The other side is dark'], 'Pourquoi voit-on toujours la même face de la Lune ?', ['Elle tourne une fois par orbite', 'Elle ne tourne pas', 'L\'autre face est sombre']],
  ];
  const p = popup('quizPop'); const box = p.querySelector('.box');
  let deck = [], i = 0, score = 0, pool = null, film = false;
  const shuffle = a => { const b = [...a]; for (let k = b.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [b[k], b[j]] = [b[j], b[k]]; } return b; };
  function start(list) { film = Array.isArray(list); pool = film ? list : Q; deck = shuffle(pool).slice(0, 10); i = 0; score = 0; ask(); p.classList.add('on'); }
  function ask() {
    const F = fr(), q = deck[i], opts = shuffle([0, 1, 2]);
    box.innerHTML = `<h3><span>${film ? (F ? '🎬 Quiz cinéma et séries' : '🎬 Film & TV quiz') : (F ? '❓ Quiz de l\'espace' : '❓ Space quiz')} · ${i + 1}/10</span><button type="button" id="qX">✕</button></h3>
      <div style="font-size:16px;margin:6px 0 4px">${F ? q[3] : q[1]}</div>${opts.map(o => `<button type="button" class="opt" data-o="${o}">${(F ? q[4] : q[2])[o]}</button>`).join('')}<div id="qNext"></div>`;
    $('qX').onclick = () => p.classList.remove('on');
    for (const b of box.querySelectorAll('.opt')) b.onclick = () => {
      if (box.querySelector('.opt.ok')) return;
      const right = b.dataset.o === '0'; if (right) score++;
      for (const x of box.querySelectorAll('.opt')) if (x.dataset.o === '0') x.classList.add('ok');
      if (!right) b.classList.add('no');
      if (bodies[q[0]] || special[q[0]]) go(q[0]);
      const nb = document.createElement('button'); nb.type = 'button'; nb.style.marginTop = '8px';
      nb.textContent = i < 9 ? (F ? 'Question suivante ›' : 'Next question ›') : (F ? 'Voir mon score ›' : 'See my score ›');
      nb.onclick = () => { i++; i < 10 ? ask() : end(); }; $('qNext').appendChild(nb);
    };
  }
  function end() {
    const F = fr(), msg = score >= 9 ? (F ? 'Astronaute confirmé ! 🚀' : 'Certified astronaut! 🚀') : score >= 6 ? (F ? 'Belle mission ! 🌟' : 'Great mission! 🌟') : (F ? 'Encore un tour en orbite ? 🌍' : 'Another orbit? 🌍');
    box.innerHTML = `<h3><span>❓ ${F ? 'Votre score' : 'Your score'}</span><button type="button" id="qX">✕</button></h3><div class="big">${score}/10</div><div style="text-align:center">${msg}</div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px"><button type="button" id="qAgain">${F ? '↺ Rejouer' : '↺ Play again'}</button><button type="button" id="qShare">${F ? '🔗 Défier un ami' : '🔗 Challenge a friend'}</button></div>`;
    $('qX').onclick = () => p.classList.remove('on'); $('qAgain').onclick = () => start(film ? pool : undefined);
    $('qShare').onclick = () => { const t = F ? `J'ai eu ${score}/10 au quiz de l'espace de Midnight Satellite 🚀 Tu fais mieux ? ${location.origin}${location.pathname}?quiz=1&lang=fr` : `I scored ${score}/10 on the Midnight Satellite space quiz 🚀 Can you beat me? ${location.origin}${location.pathname}?quiz=1`;
      (navigator.clipboard?.writeText(t) || Promise.reject()).then(() => $('qShare').textContent = F ? '✓ Copié' : '✓ Copied', () => prompt('', t)); };
  }
  btn('quizBtn', '❓ Quiz').onclick = () => start();
  if (new URLSearchParams(location.search).get('quiz')) setTimeout(start, 1500);
  SS.more.quiz = { start, Q };
}

// =====================================================================
// 3. THE PALE BLUE DOT: look back at Earth from Voyager 1
// =====================================================================
{
  const earth = bodies.Earth.obj, vg = bodies.Voyager1.obj, ep = V(), vp = V();
  const mark = new THREE.Object3D(); earth.add(mark);
  const lbl = addLabel(mark, '● Earth: you are here', 0, 'PaleBlueDot', 'star pbdl'); lbl.visible = false;
  let on = false;
  { const st = document.createElement('style'); st.textContent = 'body.pbd .lbl:not(.pbdl){visibility:hidden!important}'; document.head.appendChild(st); }
  const setOn = v => { if (v === on) return; on = v; document.body.classList.toggle('pbd', v);
    SS.orbitLines.forEach(l => { if (v) { l.userData.pbd = l.visible; l.visible = false; } else if (l.userData.pbd !== undefined) { l.visible = l.userData.pbd; delete l.userData.pbd; } }); };
  sim.push(() => { lbl.visible = on && $('labels').checked; });
  bodies.PaleBlueDot = { obj: earth, radius: 1, get view() { earth.getWorldPosition(ep); vg.getWorldPosition(vp); return ep.distanceTo(vp) * 0.97; },
    dir: () => { earth.getWorldPosition(ep); vg.getWorldPosition(vp); return vp.clone().sub(ep).normalize(); } };
  info('PaleBlueDot', 'The Pale Blue Dot', 'Seen from Voyager 1', 'about 6 billion km from Earth, in 1990',
    'On 14 February 1990, as Voyager 1 left the planets behind, it turned its camera around for one last look home. Earth was less than a pixel: a tiny pale blue dot caught in a sunbeam. Carl Sagan, who asked for the photo, pointed out that everyone who has ever lived, every story and every war, happened on that speck, and that it should make us kinder to each other and take better care of it.');
  { const prev = SS.onFocus; SS.onFocus = key => { prev(key); setOn(key === 'PaleBlueDot'); }; }
  const views = focusSel.querySelector('optgroup'); const o = document.createElement('option'); o.value = 'PaleBlueDot'; o.textContent = '🔵 The Pale Blue Dot (from Voyager 1)'; views.appendChild(o);
}

// =====================================================================
// 4. TODAY'S SUN, LIVE FROM NASA'S SOLAR DYNAMICS OBSERVATORY
// =====================================================================
{
  const IMG = { uv: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg', vis: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg' };
  let mode = 'uv';
  const prev = SS.onFocus;
  SS.onFocus = key => {
    prev(key); if (key !== 'Sun') return;
    const el = $('info'); const F = fr(), share = el.querySelector('.share');
    const wrap = document.createElement('div'); wrap.style.marginTop = '8px';
    const stamp = Math.floor(Date.now() / 9e5);   // refresh every 15 minutes
    const draw = () => {
      wrap.innerHTML = `<div style="font-size:11px;letter-spacing:.08em;opacity:.7">${F ? '☀️ LE SOLEIL AUJOURD\'HUI · NASA SDO' : '☀️ TODAY\'S SUN · NASA SDO'}</div>
        <img src="${IMG[mode]}?t=${stamp}" alt="" style="width:100%;max-width:270px;border-radius:50%;display:block;margin:6px auto" onerror="this.replaceWith(Object.assign(document.createElement('div'),{textContent:'${F ? 'Image indisponible pour le moment.' : 'Picture not available right now.'}',style:'opacity:.7;font-size:12px'}))">
        <div style="display:flex;gap:6px;justify-content:center"><button type="button" data-m="uv">${F ? 'Ultraviolet' : 'Ultraviolet'}</button><button type="button" data-m="vis">${F ? 'Lumière visible' : 'Visible light'}</button></div>
        <div style="font-size:11.5px;opacity:.7;margin-top:4px">${mode === 'uv' ? (F ? 'En ultraviolet extrême, on voit la couronne à plus d\'un million de degrés, et les éruptions.' : 'In extreme ultraviolet you see the million-degree corona and flares.') : (F ? 'En lumière visible, on voit les taches solaires.' : 'In visible light you see today\'s sunspots.')}</div>`;
      for (const b of wrap.querySelectorAll('button')) b.onclick = () => { mode = b.dataset.m; draw(); };
    };
    draw(); el.insertBefore(wrap, share || null);
  };
}

// =====================================================================
// 5. THE TOTAL SOLAR ECLIPSE OF 2 AUGUST 2027
// =====================================================================
const ECL = Date.UTC(2027, 7, 2, 10, 7, 50);
{
  const earthMesh = PL.Earth.tilted.children[0];
  const surf = (lat, lon, r = 1.016) => V(Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.sin(lat * D2R), -Math.cos(lat * D2R) * Math.sin(lon * D2R)).multiplyScalar(r);
  const PATH = [[36.9, -30], [36.7, -15], [36.5, -6.3], [36.0, -5.5], [35.7, -2.5], [35.6, -0.6], [35.2, 4], [34.7, 10.8], [33.3, 15], [32.1, 20.1], [29.3, 25],
    [26.8, 30], [25.5, 33.2], [23.6, 35.3], [22.2, 36.6], [20, 39.6], [17.5, 42.5], [15.2, 45.3], [12.5, 48], [10.2, 50.5], [6.5, 54], [2.5, 58]];
  const pts = []; for (let k = 0; k < PATH.length - 1; k++) for (let s = 0; s < 8; s++) { const a = PATH[k], b = PATH[k + 1], t = s / 8; pts.push(surf(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)); }
  pts.push(surf(...PATH.at(-1)));
  const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.006, 6, false), new THREE.MeshBasicMaterial({ color: 0xffc04a, toneMapped: false }));
  earthMesh.add(line); line.visible = false; SS.more.eclLine = line;
  const PLACES = [['Cádiz', 36.53, -6.29, '2 min 46 s'], ['Gibraltar', 36.14, -5.35, '4 min 29 s'], ['Tarifa', 36.01, -5.6, '4 min 39 s'], ['Benghazi', 32.12, 20.07, '6 min 11 s'], ['Luxor', 25.69, 32.64, '6 min 23 s']];
  const pins = PLACES.map(([n, lat, lon, d]) => { const o = new THREE.Object3D(); o.position.copy(surf(lat, lon, 1.02)); earthMesh.add(o); o.add(glowSprite(0.03, '#ffd27a', 'rgba(0,0,0,0)', 1)); const l = addLabel(o, `${n} · ${d}`, 0.04, 'Eclipse2027', 'craft'); o.visible = false; return o; });
  const centre = new THREE.Object3D(); centre.position.copy(surf(25.5, 33.2, 1)); earthMesh.add(centre);
  const show = v => { line.visible = v; pins.forEach(p => p.visible = v); };
  const ep = V(), cp = V();
  bodies.Eclipse2027 = { obj: centre, radius: 0.1, view: 3.2, dir: () => { centre.getWorldPosition(cp); earthMesh.getWorldPosition(ep); return cp.sub(ep).normalize().add(V(0, 0.2, 0)).normalize(); } };
  const card = () => { const F = fr(), d = Math.ceil((ECL - Date.now()) / 864e5);
    return (d > 0 ? `<b style="display:inline;font-size:13px;color:#ffd27a">⏳ ${F ? `Dans ${nf(d)} jours` : `In ${nf(d)} days`}</b><br>` : '') + (F
      ? "La Lune cachera entièrement le Soleil pendant jusqu'à 6 min 23 s près de Louxor, en Égypte : l'éclipse totale la plus longue sur terre ferme facilement accessible de ce siècle. L'ombre traversera le sud de l'Espagne et Gibraltar, puis le Maroc, l'Algérie, la Tunisie, la Libye, l'Égypte, l'Arabie saoudite et le Yémen. Depuis Londres, environ 42 % du Soleil sera caché. Ne regardez jamais le Soleil sans lunettes d'éclipse, sauf pendant la totalité."
      : "The Moon will completely hide the Sun for up to 6 min 23 s near Luxor in Egypt, the longest total eclipse on easy-to-reach land this century. The shadow crosses southern Spain and Gibraltar, then Morocco, Algeria, Tunisia, Libya, Egypt, Saudi Arabia and Yemen. From London, about 42% of the Sun will be covered. Never look at the Sun without eclipse glasses, except during totality.") + (F ? '<br><span style="font-size:11.5px;opacity:.7">La ligne dorée montre le trajet de la totalité (approximatif).</span>' : '<br><span style="font-size:11.5px;opacity:.7">The gold line shows the path of totality (approximate).</span>'); };
  info('Eclipse2027', 'Total solar eclipse · 2 Aug 2027', 'The eclipse of the century', 'greatest eclipse 10:07 UTC, near Luxor, Egypt', card());
  special.Eclipse2027 = () => { SS.setDate(ECL - 25 * 6e4); $('speed').value = '0.000694'; const au = $('auto'); if (au.checked) { au.checked = false; au.dispatchEvent(new Event('change')); } SS.controls.autoRotate = false; show(true); setTimeout(() => flyTo('Eclipse2027'), 400); };
  { const prev = SS.onFocus; SS.onFocus = key => { if (key === 'Eclipse2027') { INFO.Eclipse2027.fact = card(); if (SS.more.INFO_EN?.Eclipse2027) SS.more.INFO_EN.Eclipse2027.fact = INFO.Eclipse2027.fact; } else show(false); prev(key); }; }
  const ev = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Events');
  const o = document.createElement('option'); o.value = 'Eclipse2027'; o.textContent = '🌑 Total solar eclipse · 2 Aug 2027'; (ev || focusSel.querySelector('optgroup')).prepend(o);
}

// =====================================================================
// 6. TONIGHT FROM LONDON
// =====================================================================
{
  const AU = { Mercury: 0.387, Venus: 0.723, Mars: 1.524, Jupiter: 5.203, Saturn: 9.537 };
  const SHOW = [['Quadrantids', 'Quadrantides', 0, 3, [11, 28], [0, 12]], ['Lyrids', 'Lyrides', 3, 22, [3, 14], [3, 30]], ['Eta Aquariids', 'Êta Aquarides', 4, 6, [3, 19], [4, 28]],
    ['Perseids', 'Perséides', 7, 12, [6, 17], [7, 24]], ['Orionids', 'Orionides', 9, 21, [9, 2], [10, 7]], ['Leonids', 'Léonides', 10, 17, [10, 6], [10, 30]],
    ['Geminids', 'Géminides', 11, 14, [11, 4], [11, 17]], ['Ursids', 'Ursides', 11, 22, [11, 17], [11, 26]]];
  const NAMES = { Mercury: ['Mercury', 'Mercure'], Venus: ['Venus', 'Vénus'], Mars: ['Mars', 'Mars'], Jupiter: ['Jupiter', 'Jupiter'], Saturn: ['Saturn', 'Saturne'] };
  function card() {
    const F = fr(), now = Date.now(), d = (now - J2000) / 864e5, A = SS.astro;
    const sun = A.sunLon(d), moon = A.moonPos(d).lam, el = ((moon - sun) % 360 + 360) % 360, lit = (1 - Math.cos(el * D2R)) / 2;
    const PH = [['🌑', 'New Moon', 'Nouvelle lune'], ['🌒', 'Waxing crescent', 'Premier croissant'], ['🌓', 'First quarter', 'Premier quartier'], ['🌔', 'Waxing gibbous', 'Gibbeuse croissante'],
      ['🌕', 'Full Moon', 'Pleine lune'], ['🌖', 'Waning gibbous', 'Gibbeuse décroissante'], ['🌗', 'Last quarter', 'Dernier quartier'], ['🌘', 'Waning crescent', 'Dernier croissant']][Math.round(el / 45) % 8];
    const E = A.planetLon('Earth', d) * D2R, ex = Math.cos(E), ey = Math.sin(E);
    const eve = [], morn = [];
    for (const k in AU) { const L = A.planetLon(k, d) * D2R, px = AU[k] * Math.cos(L) - ex, py = AU[k] * Math.sin(L) - ey;
      const lon = Math.atan2(py, px) / D2R, diff = ((lon - sun) % 360 + 540) % 360 - 180;
      if (Math.abs(diff) > 18) (diff > 0 ? eve : morn).push(NAMES[k][F ? 1 : 0]); }
    const t = new Date(now), doy = (m, dd) => (Date.UTC(2001, m, dd) - Date.UTC(2001, 0, 1)) / 864e5, today = doy(t.getUTCMonth(), t.getUTCDate());
    const sh = SHOW.filter(s => { const a = doy(...s[4]), b = doy(...s[5]); return a <= b ? today >= a && today <= b : today >= a || today <= b; })
      .map(s => { const pk = doy(s[2], s[3]), dd = Math.round(today - pk); return `${F ? s[1] : s[0]}${Math.abs(dd) <= 1 ? (F ? ' (au pic !)' : ' (peaking!)') : dd < 0 ? (F ? ` (pic dans ${-dd} j)` : ` (peak in ${-dd} days)`) : ''}`; });
    const list = a => a.length ? a.join(', ') : (F ? 'aucune planète brillante' : 'no bright planets');
    return `<div style="font-size:34px;line-height:1">${PH[0]}</div><b style="display:inline;font-size:13px">${F ? PH[2] : PH[1]}</b> · ${F ? `${nf(lit * 100)} % éclairée` : `${nf(lit * 100)}% lit`}
      <div style="margin-top:6px">🌆 <b style="display:inline;font-size:13px">${F ? 'Le soir' : 'Evening'}</b> ${F ? '(après le coucher du Soleil) :' : '(after sunset):'} ${list(eve)}</div>
      <div>🌅 <b style="display:inline;font-size:13px">${F ? 'Le matin' : 'Morning'}</b> ${F ? '(avant le lever du Soleil) :' : '(before sunrise):'} ${list(morn)}</div>
      <div>☄ <b style="display:inline;font-size:13px">${F ? 'Étoiles filantes' : 'Meteors'}</b>${F ? ' :' : ':'} ${sh.length ? sh.join(', ') : (F ? 'pas de grande pluie en ce moment' : 'no major shower right now')}</div>
      ${SS.tonightExtra ? SS.tonightExtra() : ''}
      <button type="button" id="tonightSky" style="margin-top:8px">${F ? '🔭 Voir le ciel de ce soir' : '🔭 See tonight\'s sky'}</button>`;
  }
  bodies.Tonight = { obj: bodies.Moon.obj, radius: 0.27, view: 1.4 };
  info('Tonight', 'Tonight from London', 'What to look for', 'with your own eyes, weather permitting', card());
  { const prev = SS.onFocus; SS.onFocus = key => { if (key === 'Tonight') { INFO.Tonight.fact = card(); if (SS.more.INFO_EN?.Tonight) SS.more.INFO_EN.Tonight.fact = INFO.Tonight.fact; } prev(key);
      if (key === 'Tonight') { const b = $('tonightSky'); if (b) b.onclick = () => { SS.setDate(Date.now()); go('night'); }; } }; }
  special.Tonight = () => { SS.setDate(Date.now()); flyTo('Tonight'); };
  const views = focusSel.querySelector('optgroup'); const o = document.createElement('option'); o.value = 'Tonight'; o.textContent = '🌙 Tonight from London'; views.appendChild(o);
}

// =====================================================================
// 7. GARGANTUA-STYLE BLACK HOLES: the disk bent over the top and under the bottom
// =====================================================================
{
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { t: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform float t; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      vec3 heat(float k){ return mix(vec3(1.0,0.38,0.08), vec3(1.0,0.93,0.78), clamp(k,0.,1.)); }
      void main(){
        vec2 p=(vUv-0.5)*20.0; float r=length(p), a=atan(p.y,p.x);
        float shadow=2.6;
        // turbulent streaks that flow around the hole
        float flow=0.65+0.35*noise(vec2(a*6.0 - t*1.5, log(max(r,0.1))*8.0));
        float dop=1.0+0.55*(-p.x/max(r,0.5));                     // the side coming towards us is brighter
        // the disk seen almost edge-on, crossing in front of the hole
        float y=p.y-0.06*p.x, thick=0.10+0.035*abs(p.x);
        float front=(1.0-smoothstep(0.0,thick,abs(y)))*(1.0-smoothstep(3.0,10.0,abs(p.x)));
        // the far side of the disk, lensed into a halo over the top and under the bottom
        float halo=smoothstep(2.75,3.05,r)*(1.0-smoothstep(3.0,5.8,r))*(0.55+0.45*abs(p.y)/max(r,0.01));
        halo*=(p.y>0.0?1.0:0.7);
        float ring=exp(-pow((r-2.72)*9.0,2.0))*1.4;                // photon ring
        float I=(front*1.5+halo*1.25)*flow*dop+ring;
        vec3 col=heat(I*0.8)*I*1.6;
        float a1=clamp(I,0.0,1.0);
        if(r<shadow && front<0.05){ gl_FragColor=vec4(0.,0.,0.,1.); return; }
        gl_FragColor=vec4(col,a1);
      }`,
  });
  sim.push((dt, tt) => { mat.uniforms.t.value = tt; });
  for (const k of ['SgrA', 'TON618', 'CygX1', 'V404Cyg', 'M87BH']) {
    const h = bodies[k]?.obj; if (!h) continue;
    const hor = h.children.find(c => c.isMesh && c.geometry.type === 'SphereGeometry'); if (!hor) continue;
    const rs = hor.geometry.parameters.radius;
    h.traverse(o => { if (o.isMesh && (o.geometry.type === 'RingGeometry' || o.geometry.type === 'PlaneGeometry')) o.visible = false; });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(rs * 7.7, rs * 7.7), mat); plane.renderOrder = 20; h.add(plane);
    sim.push(() => { plane.quaternion.copy(h.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(camera.quaternion)); });
  }
}

// ---------- French ----------
SS.i18nAdd?.({
  ui: { '🎂 My age in space': '🎂 Mon âge dans l\'espace', '❓ Quiz': '❓ Quiz', '🔵 The Pale Blue Dot (from Voyager 1)': '🔵 Le point bleu pâle (depuis Voyager 1)', '● Earth: you are here': '● La Terre : vous êtes ici',
    '🌑 Total solar eclipse · 2 Aug 2027': '🌑 Éclipse totale de Soleil · 2 août 2027', '🌙 Tonight from London': '🌙 Ce soir depuis Londres' },
  name: { 'The Pale Blue Dot': 'Le point bleu pâle', '● Earth: you are here': '● La Terre : vous êtes ici', 'Total solar eclipse · 2 Aug 2027': 'Éclipse totale de Soleil · 2 août 2027', 'Tonight from London': 'Ce soir depuis Londres' },
  cat: { 'Seen from Voyager 1': 'Vue depuis Voyager 1', 'The eclipse of the century': "L'éclipse du siècle", 'What to look for': 'Que regarder' },
  dist: { 'about 6 billion km from Earth, in 1990': 'à environ 6 milliards de km de la Terre, en 1990', 'greatest eclipse 10:07 UTC, near Luxor, Egypt': 'maximum à 10 h 07 UTC, près de Louxor, en Égypte', 'with your own eyes, weather permitting': 'à l\'œil nu, si la météo le permet' },
  fact: { PaleBlueDot: "Le 14 février 1990, alors que Voyager 1 laissait les planètes derrière lui, il a retourné sa caméra pour un dernier regard vers la maison. La Terre faisait moins d'un pixel : un minuscule point bleu pâle pris dans un rayon de Soleil. Carl Sagan, qui avait demandé cette photo, a rappelé que tous ceux qui ont jamais vécu, toutes les histoires et toutes les guerres, sont nés sur ce grain de poussière, et que cela devrait nous rendre plus bienveillants les uns envers les autres et nous pousser à en prendre soin." },
});
await import('./sun.js' + new URL(import.meta.url).search);
