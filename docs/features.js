// =====================================================================
// New features: search, reverse time, compare sizes, share links, One Fact mode
// =====================================================================
const SS = window.SS;
const { focusSel } = SS;
const $ = id => document.getElementById(id);
const tr = s => (SS.tr ? SS.tr(s) : s);
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ---------- Styles ----------
const css = document.createElement('style');
css.textContent = `
#search{width:100%;box-sizing:border-box;margin:2px 0 4px;padding:6px 9px;border-radius:8px;border:1px solid rgba(140,160,255,.3);background:rgba(255,255,255,.06);color:#fff;font:inherit;font-size:13px}
#search::placeholder{color:rgba(220,228,255,.55)}
#searchRes{display:none;position:absolute;left:12px;right:12px;bottom:calc(100% - 4px);max-height:240px;overflow:auto;background:rgba(10,14,30,.96);border:1px solid rgba(140,160,255,.25);border-radius:10px;padding:4px;z-index:20}
#searchRes div{padding:5px 8px;border-radius:6px;cursor:pointer;font-size:13px}
#searchRes div small{opacity:.55;margin-left:6px}
#searchRes div:hover,#searchRes div.on{background:rgba(120,150,255,.25)}
#langBtn{position:fixed;top:10px;right:16px;z-index:12;display:flex;border:1px solid rgba(140,160,255,.3);border-radius:999px;overflow:hidden;background:rgba(10,14,30,.7);backdrop-filter:blur(6px)}
#langBtn button{border:0;background:none;color:#cdd6ff;padding:4px 10px;font:600 12px/1.2 inherit;cursor:pointer;margin:0;border-radius:0}
#langBtn button.on{background:#3b4fd8;color:#fff}
#info{top:44px}
#info .share{display:inline-block;margin-top:8px;font-size:12px;color:#ffd27a;cursor:pointer;border:1px solid rgba(255,210,122,.35);border-radius:999px;padding:2px 9px}
#info .share:hover{background:rgba(255,210,122,.12)}
#cmp{position:fixed;inset:0;background:rgba(2,4,12,.72);backdrop-filter:blur(4px);z-index:30;display:none;align-items:center;justify-content:center}
#cmp .box{width:min(860px,94vw);background:rgba(12,16,34,.97);border:1px solid rgba(140,160,255,.25);border-radius:16px;padding:16px 18px;color:#e8ecff}
#cmp .top{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
#cmp h3{margin:0 auto 0 0;font-size:17px}
#cmp select{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(140,160,255,.3);border-radius:8px;padding:5px;font:inherit}
#cmp select option{background:#141a33}
#cmp canvas{width:100%;height:auto;display:block;margin:12px 0 8px;border-radius:10px;background:#04060f}
#cmp .txt{font-size:15px;text-align:center;min-height:2.6em}
#cmp .x{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;margin:0 0 0 6px}
#fact{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);width:min(560px,92vw);z-index:15;opacity:0;pointer-events:none;transition:opacity .5s,transform .5s;
  background:linear-gradient(160deg,rgba(18,22,48,.93),rgba(8,10,24,.93));border:1px solid rgba(255,210,122,.35);border-radius:16px;padding:16px 20px 14px;box-shadow:0 10px 40px rgba(0,0,0,.5);text-align:center}
#fact.on{opacity:1;pointer-events:auto;transform:translateX(-50%)}
#fact .lab{font-size:12px;font-weight:700;letter-spacing:.3em;color:#ffd27a}
#fact .hook{font-size:24px;font-weight:800;color:#fff;margin:6px 0 6px;line-height:1.2}
#fact .txt{font-size:14.5px;line-height:1.5;color:#d8def8}
#fact .row{display:flex;gap:8px;justify-content:center;margin-top:12px}
#fact .row button{margin:0}
#fact .x{position:absolute;top:6px;right:10px;background:none;border:0;color:#aab;font-size:18px;cursor:pointer}
body.clean #langBtn{display:none}
`;
document.head.appendChild(css);

// ---------- Search box ----------
const ui = $('ui');
{
  const wrap = document.createElement('div'); wrap.style.position = 'relative';
  wrap.innerHTML = '<input id="search" type="search" autocomplete="off" spellcheck="false"><div id="searchRes"></div>';
  ui.insertBefore(wrap, ui.children[1]);
  const inp = $('search'), res = $('searchRes'); let hits = [], sel = 0;
  const all = () => [...focusSel.querySelectorAll('option')].map(o => ({ key: o.value, text: o.textContent, group: o.parentElement.label || '' }));
  const show = () => {
    const q = fold(inp.value.trim()); if (!q) { res.style.display = 'none'; return; }
    hits = all().filter(o => fold(o.text).includes(q) || fold(o.key).includes(q)).sort((a, b) => fold(a.text).indexOf(q) - fold(b.text).indexOf(q)).slice(0, 12);
    sel = 0;
    res.innerHTML = hits.length ? hits.map((h, i) => `<div data-i="${i}" class="${i ? '' : 'on'}">${h.text}<small>${h.group}</small></div>`).join('') : `<div style="opacity:.6;cursor:default">${tr('Nothing found')}</div>`;
    res.style.display = 'block';
  };
  const pick = i => { const h = hits[i]; if (!h) return; focusSel.value = h.key; SS.go(h.key); inp.value = ''; res.style.display = 'none'; inp.blur(); };
  inp.addEventListener('input', show);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') pick(sel);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : hits.length - 1)) % Math.max(1, hits.length); [...res.children].forEach((c, i) => c.classList.toggle('on', i === sel)); }
    else if (e.key === 'Escape') { inp.value = ''; res.style.display = 'none'; }
    e.stopPropagation();
  });
  res.addEventListener('mousedown', e => { const d = e.target.closest('[data-i]'); if (d) { e.preventDefault(); pick(+d.dataset.i); } });
  inp.addEventListener('blur', () => setTimeout(() => res.style.display = 'none', 150));
  SS.more.searchInput = inp;
}

// ---------- Reverse time ----------
{
  const sp = $('speed'), keepV = sp.value;
  const og = document.createElement('optgroup'); og.label = 'Backwards in time';
  for (const [v, t] of [['-1', '◀ 1 day / sec'], ['-30', '◀ 1 month / sec'], ['-365', '◀ 1 year / sec']]) { const o = document.createElement('option'); o.value = v; o.textContent = t; og.appendChild(o); }
  sp.appendChild(og);
  const fw = document.createElement('optgroup'); fw.label = 'Forwards in time';
  [...sp.querySelectorAll(':scope > option')].forEach(o => fw.appendChild(o)); sp.insertBefore(fw, og); sp.value = keepV;
}

// ---------- Buttons row: One Fact & Compare sizes ----------
{
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:2px';
  row.innerHTML = '<button id="factBtn" type="button">✨ One Fact</button><button id="cmpBtn" type="button">⚖️ Compare sizes</button>';
  const first = $('tourBtn').parentElement; first.after(row);
}

// ---------- Compare sizes ----------
const SIZES = [ // key, radius in km, colour
  ['Sun', 696340, '#ffb347'], ['Mercury', 2440, '#9c9590'], ['Venus', 6052, '#e8c98a'], ['Earth', 6371, '#3d7bd9'], ['Moon', 1737, '#c9c5be'], ['Mars', 3390, '#c1440e'],
  ['Jupiter', 69911, '#d8b48a'], ['Saturn', 58232, '#e3cf9c'], ['Uranus', 25362, '#a6e1e6'], ['Neptune', 24622, '#3f6fe0'],
  ['Ceres', 470, '#8f8a84'], ['Pluto', 1188, '#d9c2a8'], ['Eris', 1163, '#e8e6e4'],
  ['Io', 1822, '#e9d36a'], ['Europa', 1561, '#d9cbb4'], ['Ganymede', 2634, '#9e9284'], ['Titan', 2575, '#d8963c'], ['Triton', 1353, '#d4bfb6'],
  ['Proxima', 107200, '#ff7a4a'], ['Sirius', 1190000, '#cfe0ff'], ['Vega', 1640000, '#dbe6ff'], ['Arcturus', 17700000, '#ffb36a'], ['Rigel', 55000000, '#b8ccff'],
  ['Betelgeuse', 532000000, '#ff7040'], ['UYScuti', 633000000, '#ff6a3a'],
  ['ProximaB', 7500, '#b07850'], ['T1e', 5860, '#7aa0b8'], ['Kepler452b', 9600, '#7a9a80'], ['HD189733b', 81000, '#5f8cff'], ['Kepler7b', 103000, '#ffe8c8'], ['Cnc55e', 11900, '#ff7a20'],
];
const cmp = document.createElement('div'); cmp.id = 'cmp';
cmp.innerHTML = '<div class="box"><div class="top"><h3 id="cmpTitle"></h3><select id="cmpA"></select><span id="cmpVs"></span><select id="cmpB"></select><button class="x" id="cmpX">✕</button></div><canvas id="cmpC" width="1640" height="620"></canvas><div class="txt" id="cmpTxt"></div></div>';
document.body.appendChild(cmp);
const nameOf = k => (SS.cosmos.INFO[k]?.name || k).replace(/^The /, '');
function fillCmp() {
  for (const id of ['cmpA', 'cmpB']) { const s = $(id), v = s.value; s.innerHTML = SIZES.map(([k]) => `<option value="${k}">${nameOf(k)}</option>`).join(''); if (v) s.value = v; }
  $('cmpTitle').textContent = tr('Compare sizes'); $('cmpVs').textContent = tr('vs');
}
const fmt = (x, d = 1) => (SS.lang === 'fr' ? x.toLocaleString('fr-FR', { maximumFractionDigits: d }) : x.toLocaleString('en-GB', { maximumFractionDigits: d }));
function bigNum(x) {
  if (x >= 1e9) return fmt(x / 1e9, 1) + (SS.lang === 'fr' ? ' milliards' : ' billion');
  if (x >= 1e6) return fmt(x / 1e6, 1) + (SS.lang === 'fr' ? ' millions' : ' million');
  return fmt(Math.round(x), 0);
}
const frPlural = n => (/^[A-Z][a-zéèêëàâîïôöûüç]+$/i.test(n) && !/[sx]$/.test(n) && !/\d/.test(n) ? n + 's' : n);
function drawCmp() {
  const a = SIZES.find(s => s[0] === $('cmpA').value), b = SIZES.find(s => s[0] === $('cmpB').value);
  const c = $('cmpC'), g = c.getContext('2d'), W = c.width, H = c.height; g.clearRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + 0.5 * ((i * 37) % 10) / 10})`; g.fillRect((i * 997) % W, (i * 613) % H, 1.5, 1.5); }
  const big = Math.max(a[1], b[1]), maxR = Math.min(H * 0.4, W * 0.22), k = maxR / big;
  const ra = Math.max(1.5, a[1] * k), rb = Math.max(1.5, b[1] * k), base = H * 0.88;
  const xa = W * 0.5 - 30 - ra, xb = W * 0.5 + 30 + rb;
  const disc = (x, r, col) => { const gr = g.createRadialGradient(x - r * 0.35, base - r - r * 0.35, r * 0.1, x, base - r, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, col); gr.addColorStop(1, '#000000');
    g.fillStyle = gr; g.beginPath(); g.arc(x, base - r, r, 0, 7); g.fill(); if (r < 6) { g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.arc(x, base - r, 14, 0, 7); g.stroke(); } };
  disc(xa, ra, a[2]); disc(xb, rb, b[2]);
  g.font = '600 30px Inter, -apple-system, sans-serif'; g.fillStyle = '#e8ecff'; g.textAlign = 'center';
  g.fillText(nameOf(a[0]), xa, Math.min(base - 2 * ra - 18, base - 40)); g.fillText(nameOf(b[0]), xb, Math.min(base - 2 * rb - 18, base - 40));
  g.font = '24px Inter, -apple-system, sans-serif'; g.fillStyle = '#9fb0e0';
  g.fillText(`${fmt(Math.round(a[1] * 2), 0)} km`, xa, base + 40); g.fillText(`${fmt(Math.round(b[1] * 2), 0)} km`, xb, base + 40);
  const [L, S] = a[1] >= b[1] ? [a, b] : [b, a], ratio = L[1] / S[1], vol = ratio ** 3;
  const fr = SS.lang === 'fr';
  $('cmpTxt').innerHTML = a[0] === b[0] ? '' : (fr
    ? `<b>${nameOf(L[0])}</b> est <b>${fmt(ratio, ratio < 10 ? 1 : 0)} fois plus large</b> que ${({ Sun: 'le Soleil', Earth: 'la Terre', Moon: 'la Lune' })[S[0]] || nameOf(S[0])}.<br>Environ <b>${bigNum(vol)}</b> ${frPlural(nameOf(S[0]))} pourraient tenir à l'intérieur.`
    : `<b>${nameOf(L[0])}</b> is <b>${fmt(ratio, ratio < 10 ? 1 : 0)} times wider</b> than ${nameOf(S[0])}.<br>About <b>${bigNum(vol)}</b> ${nameOf(S[0])}s could fit inside it.`)
    + (Math.min(ra, rb) <= 1.5 ? `<br><small style="opacity:.6">${fr ? 'Le plus petit est trop petit pour être visible à cette échelle : ce n\'est qu\'un point.' : 'The smaller one is too tiny to see at this scale: it is just a dot.'}</small>` : '');
}
function openCmp(a = 'Earth', b = 'Jupiter') { fillCmp(); $('cmpA').value = a; $('cmpB').value = b; cmp.style.display = 'flex'; drawCmp(); }
$('cmpA').onchange = $('cmpB').onchange = drawCmp;
$('cmpX').onclick = () => cmp.style.display = 'none';
cmp.onclick = e => { if (e.target === cmp) cmp.style.display = 'none'; };
$('cmpBtn').onclick = () => { const k = SS.more.current; openCmp(SIZES.some(s => s[0] === k) && k !== 'Earth' ? k : 'Earth', SIZES.some(s => s[0] === k) && k !== 'Earth' ? 'Earth' : 'Jupiter'); };
SS.more.openCmp = openCmp; SS.more.redrawCmp = () => { if (cmp.style.display === 'flex') { fillCmp(); drawCmp(); } };

// ---------- Share link in the info card ----------
{
  const prev = SS.onFocus;
  SS.onFocus = key => {
    SS.more.current = key; prev(key);
    const el = $('info');
    if (el.style.display === 'block' && SS.cosmos.INFO[key] && !key.startsWith('EV_')) {
      const s = document.createElement('div'); s.className = 'share'; s.textContent = tr('🔗 Copy link to this view');
      s.onclick = () => { const u = `${location.origin}${location.pathname}?go=${encodeURIComponent(key)}${SS.lang === 'fr' ? '&lang=fr' : ''}`;
        (navigator.clipboard?.writeText(u) || Promise.reject()).then(() => s.textContent = tr('✓ Link copied'), () => prompt(tr('Copy this link:'), u)); };
      el.appendChild(s);
    }
  };
}

// ---------- One Fact mode ----------
const FACTS = [
  ['Saturn', 'Saturn would float in water', 'It is so light for its size that, in a big enough bathtub, it would bob on the surface.'],
  ['Saturn', 'Saturn\'s rings are paper-thin', 'They stretch about 280,000 km across, but in most places they are only around 10 metres thick.'],
  ['Neptune', 'It may rain diamonds on Neptune', 'Deep inside, crushing pressure could squeeze carbon into diamonds that sink like hailstones.'],
  ['Venus', 'A day on Venus is longer than its year', 'Venus takes 243 Earth days to spin once, but only 225 days to go around the Sun.'],
  ['Venus', 'Venus spins backwards', 'On Venus, the Sun rises in the west and sets in the east.'],
  ['Mercury', 'Mercury is not the hottest planet', 'Venus is hotter, even though it is twice as far from the Sun, because its thick air traps the heat.'],
  ['Mars', 'Sunsets on Mars are blue', 'Fine Martian dust scatters red light away, leaving a cool blue glow around the setting Sun.'],
  ['Mars', 'The tallest volcano is on Mars', 'Olympus Mons is about 22 km high: two and a half times taller than Mount Everest.'],
  ['Jupiter', 'Jupiter\'s storm is bigger than Earth', 'The Great Red Spot is a storm wider than our whole planet, raging for at least 190 years.'],
  ['Jupiter', 'Galileo found Jupiter\'s moons in 1610', 'With a homemade telescope, he spotted four moons circling Jupiter: proof that not everything goes around Earth.'],
  ['Io', 'Io is the most volcanic place we know', 'Jupiter\'s gravity squeezes it like a stress ball, powering about 400 active volcanoes.'],
  ['Europa', 'Europa has more water than Earth', 'Under its icy shell lies a salty ocean holding about twice as much water as all of Earth\'s oceans.'],
  ['Titan', 'Titan has rain, rivers and seas', 'But they are made of liquid methane, falling from orange skies at −179 °C.'],
  ['Enceladus', 'Enceladus shoots water into space', 'Geysers at its south pole spray ice from a hidden ocean, feeding one of Saturn\'s rings.'],
  ['Iapetus', 'This moon has two faces', 'Iapetus is coal-black on one side and snow-white on the other.'],
  ['Uranus', 'Uranus rolls on its side', 'Tilted about 98°, each pole gets 42 years of sunlight followed by 42 years of darkness.'],
  ['Moon', 'The Moon is drifting away', 'Every year it moves about 3.8 cm further from Earth, about as fast as your fingernails grow.'],
  ['Earth', 'Earth is not perfectly round', 'Its spin makes it bulge at the equator: it is about 43 km wider around the middle than pole to pole.'],
  ['Pluto', 'Pluto has a heart', 'A huge heart-shaped glacier of frozen nitrogen, about 1,000 km wide, seen by New Horizons in 2015.'],
  ['Pluto', 'A year on Pluto lasts 248 Earth years', 'Since its discovery in 1930, Pluto has not yet completed even half of one orbit.'],
  ['Sun', 'The Sun holds 99.8% of the Solar System\'s mass', 'Everything else, all the planets, moons and asteroids, makes up the last 0.2%.'],
  ['Sun', 'Sunlight is 8 minutes old', 'Light takes about 8 minutes 20 seconds to travel from the Sun to your eyes.'],
  ['Halley', 'Halley\'s Comet comes back in 2061', 'It visits every 75–79 years. If you miss it, you wait a lifetime.'],
  ['Apophis', 'An asteroid will skim past Earth in 2029', 'On 13 April 2029, Apophis will pass closer than many satellites, visible without a telescope.'],
  ['Parker', 'The fastest object ever built', 'Parker Solar Probe reached about 690,000 km/h: London to New York in under 30 seconds.'],
  ['Voyager1', 'A spacecraft has left the Solar System', 'Voyager 1, launched in 1977, crossed into interstellar space in 2012 and is still sending messages home.'],
  ['ISS', 'The ISS circles Earth every 90 minutes', 'Astronauts on board see about 16 sunrises and 16 sunsets every day.'],
  ['Roman', 'A new telescope could find 100,000 planets', 'NASA\'s Roman Space Telescope, launched in 2026, will scan huge patches of sky for new worlds.'],
  ['Proxima', 'The nearest star is 4.24 light-years away', 'Travelling as fast as Voyager 1, it would take about 75,000 years to get there.'],
  ['Betelgeuse', 'Betelgeuse will explode', 'One day this red supergiant will go supernova, shining so bright you could see it in daylight.'],
  ['UYScuti', 'Some stars are unimaginably big', 'UY Scuti is so huge that around 750 million Suns could fit inside it.'],
  ['Sirius', 'The brightest star has a hidden partner', 'Sirius is orbited by a white dwarf, Sirius B: a star squeezed down to the size of Earth.'],
  ['Kepler7b', 'This planet is as light as Styrofoam', 'Kepler-7b is wider than Jupiter but so puffy that its density is like packing foam.'],
  ['HD189733b', 'On this blue planet it rains glass', 'HD 189733 b may have storms of molten glass blown sideways at 8,000 km/h.'],
  ['Cnc55e', 'A year here lasts 18 hours', '55 Cancri e circles its star so closely that its surface may be an ocean of lava.'],
  ['T1e', 'Seven Earth-sized planets, one star', 'The TRAPPIST-1 system has seven rocky planets, and three sit where liquid water could exist.'],
  ['Crab', 'People saw this star explode in 1054', 'Chinese astronomers recorded a "guest star" bright enough to see in daylight for 23 days.'],
  ['Orion', 'Stars are being born right now', 'The Orion Nebula is a stellar nursery you can see with the naked eye, in Orion\'s sword.'],
  ['SgrA', 'There is a black hole at the centre of our galaxy', 'Sagittarius A* weighs about 4 million Suns, and the Milky Way spins around it.'],
  ['M87BH', 'We have photographed a black hole', 'In 2019 the Event Horizon Telescope showed the shadow of M87*, 55 million light-years away.'],
  ['TON618', 'Black holes can weigh 40 billion Suns', 'TON 618 is one of the heaviest known: its edge would swallow our whole Solar System many times over.'],
  ['Andromeda', 'Andromeda is coming towards us', 'Our neighbour galaxy will meet the Milky Way in about 4–5 billion years.'],
  ['Cartwheel', 'A galaxy hit by a galaxy', 'The Cartwheel\'s ring of stars rippled out after a smaller galaxy punched straight through it.'],
  ['ProximaB', 'There are more than 6,000 known exoplanets', 'The first around a Sun-like star was found in 1995; now we know thousands, and the closest is Proxima b.'],
  ['Kepler', 'There are more planets than stars', 'The Kepler telescope found over 2,600 planets and showed that, on average, every star in our galaxy has at least one.'],
  ['TESS', 'One satellite has found over 1,000 planets', 'Since 2018, TESS has watched nearby stars for tiny dips in their light: more than 1,000 of its planets are now confirmed.'],
];
SS.more.FACTS = FACTS;
const fact = document.createElement('div'); fact.id = 'fact';
fact.innerHTML = '<button class="x" id="factX">✕</button><div class="lab">ONE FACT</div><div class="hook"></div><div class="txt"></div><div class="row"><button id="factNext" type="button"></button><button id="factCmp" type="button"></button></div>';
document.body.appendChild(fact);
let deck = [], curFact = null;
function showFact(i) {
  curFact = i; const [k] = FACTS[i]; const [, hook, text] = SS.more.factText(i);
  fact.querySelector('.hook').textContent = hook; fact.querySelector('.txt').textContent = text;
  $('factNext').textContent = tr('Next fact ›'); $('factCmp').textContent = tr('⚖️ Compare sizes');
  $('factCmp').style.display = SIZES.some(s => s[0] === k) ? '' : 'none';
  fact.classList.remove('on'); setTimeout(() => fact.classList.add('on'), 1600);
  focusSel.value = k; SS.go(k);
  setTimeout(() => { $('info').style.display = 'none'; }, 1700);
}
SS.more.factText = i => FACTS[i];
function nextFact() { if (!deck.length) deck = FACTS.map((_, i) => i).sort(() => Math.random() - 0.5); showFact(deck.pop()); }
$('factBtn').onclick = nextFact; $('factNext').onclick = nextFact;
$('factX').onclick = () => { fact.classList.remove('on'); curFact = null; };
$('factCmp').onclick = () => { const k = FACTS[curFact][0]; openCmp(k === 'Earth' ? 'Moon' : k, k === 'Earth' ? 'Mars' : 'Earth'); };
SS.more.refreshFact = () => { if (curFact != null) { const [, hook, text] = SS.more.factText(curFact); fact.querySelector('.hook').textContent = hook; fact.querySelector('.txt').textContent = text; $('factNext').textContent = tr('Next fact ›'); $('factCmp').textContent = tr('⚖️ Compare sizes'); } };
// hide the fact card when the person flies somewhere else
{ const prevGo = SS.go; SS.go = k => { if (curFact != null && FACTS[curFact][0] !== k) { fact.classList.remove('on'); curFact = null; } prevGo(k); }; focusSel.onchange = e => SS.go(e.target.value); }
SS.more.showFact = showFact;

// ---------- Language switch + link parameters ----------
await import('./i18n.js?v=4');
{
  const q = new URLSearchParams(location.search);
  const go = q.get('go'), f = q.get('fact');
  if (go && (SS.bodies[go] || [...focusSel.options].some(o => o.value === go))) setTimeout(() => { focusSel.value = go; SS.go(go); }, 600);
  else if (f != null) setTimeout(() => { const i = FACTS.findIndex(x => x[0] === f); i >= 0 ? showFact(i) : nextFact(); }, 600);
}
SS.features = { openCmp, showFact, nextFact };
