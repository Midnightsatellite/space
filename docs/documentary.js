// Documentary mode: a ~20-minute narrated journey that plays by itself.
// Flights, title cards, narration (the browser's built-in speech voices) and subtitles stay in sync.
const SS = window.SS;
const { controls } = SS;
const $ = id => document.getElementById(id);
const rate = v => { $('speed').value = v; };
const NOW = () => { SS.setDate(Date.now()); rate('0.0416667'); };   // today, 1 hour per second

// ---------------------------------------------------------------------------
// The script
// ---------------------------------------------------------------------------
const CHAPTERS = [
  { key: 'overview', title: 'A Journey Through Space', sub: 'From our Sun to the edge of the observable universe', pre: NOW,
    text: `Welcome to a journey through space. We begin at home, in our Solar System: one star, eight planets, five dwarf planets, and countless moons, comets and asteroids. Everything you see is placed in its true direction in the sky, and the planets sit where they really are today. The distances, though, have been squeezed, so that we can travel between them. If space were shown at its true scale, almost all of it would be empty darkness. So let's set off, and see what is out there.` },
  { key: 'Sun', title: 'The Sun', sub: 'Our star',
    text: `At the centre of everything is the Sun. It is a star, about four and a half billion years old, and so large that one hundred and nine Earths could sit side by side across its face. It holds more than ninety-nine percent of all the mass in the Solar System. Deep in its core, at around fifteen million degrees, hydrogen is fused into helium, releasing the energy that lights and warms our world. That sunlight takes just over eight minutes to reach us.` },
  { key: 'Mercury', title: 'Mercury', sub: 'The smallest planet',
    text: `Mercury is the smallest planet, and the closest to the Sun. It races around its orbit in just eighty-eight days. With almost no atmosphere to hold in heat, its surface swings from around four hundred and thirty degrees in daylight to minus one hundred and eighty at night. Its grey, cratered face looks a lot like our Moon. And yet, in the permanent shadows of craters near its poles, there is ice.` },
  { key: 'Venus', title: 'Venus', sub: 'The hottest planet',
    text: `Venus is almost the same size as Earth, but it could hardly be more different. It is wrapped in a thick atmosphere of carbon dioxide, with clouds of sulfuric acid. The pressure at the surface is around ninety times that on Earth, and the heat, about four hundred and sixty-five degrees, is enough to melt lead. That makes Venus the hottest planet, even though Mercury is closer to the Sun. Venus also spins backwards, and so slowly that one day there lasts longer than its year.` },
  { key: 'Earth', title: 'Earth', sub: 'Our home',
    text: `And this is home. Earth is the third planet from the Sun, and the only place we know of where life exists. Oceans cover about seventy-one percent of its surface. Its axis is tilted by about twenty-three degrees, which gives us our seasons. On the night side you can see the lights of our cities. Everything protecting us from space, the air we breathe, is held in a layer so thin that, at this scale, it would be thinner than the skin of an apple.` },
  { key: 'Moon', title: 'The Moon', sub: 'Our closest neighbour',
    text: `The Moon orbits about three hundred and eighty-four thousand kilometres away. It probably formed four and a half billion years ago, when a planet about the size of Mars crashed into the young Earth, and the debris came together in orbit. The Moon always shows us the same face, and its gravity raises the tides in our oceans. Between nineteen sixty-nine and nineteen seventy-two, twelve astronauts walked on its surface.` },
  { key: 'ISS', title: 'The International Space Station', sub: 'People living in orbit',
    text: `Just four hundred kilometres above us flies the International Space Station. It travels at around twenty-eight thousand kilometres an hour, circling the planet every ninety minutes, so the crew see about sixteen sunrises a day. People have lived on board continuously since November two thousand. Around it, thousands of other satellites carry our phone calls, television, internet and the navigation signals that guide us every day.` },
  { key: 'Mars', title: 'Mars', sub: 'The red planet',
    text: `Mars is about half the size of Earth. Its red colour comes from iron oxide, rust, in its dust. It is home to Olympus Mons, the tallest volcano in the Solar System, about two and a half times the height of Everest, and a canyon system as long as the United States is wide. Dry riverbeds and ancient lake beds show that water once flowed here. Today, robotic rovers explore its surface, searching for signs that life might once have existed. Mars has two tiny moons, Phobos and Deimos.` },
  { key: 'Ceres', title: 'The Asteroid Belt', sub: 'And the dwarf planet Ceres',
    text: `Between Mars and Jupiter lies the asteroid belt: millions of rocky fragments left over from the birth of the planets. In films it looks crowded, but in reality the asteroids are so far apart that spacecraft fly through without any danger. All of them together weigh far less than our Moon. The largest is Ceres, a dwarf planet almost a thousand kilometres across. NASA's Dawn spacecraft found bright patches of salt in its craters, left behind by salty water from below.` },
  { key: 'Jupiter', title: 'Jupiter', sub: 'King of the planets',
    text: `Jupiter is the giant of the Solar System. More than a thousand Earths could fit inside it. It is made mostly of hydrogen and helium, with no solid surface to stand on. Its colourful bands are clouds stretched by winds, and the Great Red Spot is a storm wider than our whole planet, which has been raging for well over a century. Despite its size, Jupiter spins faster than any other planet: a day there lasts less than ten hours.` },
  { key: 'Europa', title: 'Io and Europa', sub: 'Fire and ice',
    text: `Jupiter has nearly a hundred known moons, and some of them are worlds in their own right. Io, squeezed by Jupiter's gravity, is the most volcanic place known, with hundreds of active volcanoes. Europa is covered in a shell of cracked ice. Beneath it lies a salty ocean that may hold twice as much water as all of Earth's oceans combined. That makes it one of the best places to search for life beyond Earth, and NASA's Europa Clipper is on its way there now.` },
  { key: 'Saturn', title: 'Saturn', sub: 'The ringed planet',
    text: `Saturn is perhaps the most beautiful planet. Its rings stretch hundreds of thousands of kilometres across, yet in many places they are only tens of metres thick. They are made of countless pieces of water ice, from grains of dust to chunks as big as houses. Saturn itself is so light for its size that, in a large enough bathtub, it would float. The Cassini spacecraft orbited Saturn for thirteen years, until two thousand and seventeen.` },
  { key: 'Titan', title: 'Titan and Enceladus', sub: 'Saturn\'s remarkable moons',
    text: `Titan, Saturn's largest moon, is bigger than the planet Mercury. It is the only moon with a thick atmosphere, and it has weather: methane rain falls into lakes and seas of liquid methane. In two thousand and five, the Huygens probe landed on its surface. Nearby, the small icy moon Enceladus sprays jets of water from cracks near its south pole, fed by an ocean hidden beneath the ice.` },
  { key: 'Uranus', title: 'Uranus', sub: 'The tilted giant',
    text: `Uranus is an ice giant, made largely of water, ammonia and methane. The methane in its atmosphere gives it this pale blue-green colour. Strangest of all, Uranus is tipped on its side, probably knocked over by a huge collision long ago. As it orbits the Sun, each pole has about forty-two years of continuous sunlight, followed by forty-two years of darkness. Only one spacecraft has ever visited: Voyager two, in nineteen eighty-six.` },
  { key: 'Neptune', title: 'Neptune', sub: 'The windiest world',
    text: `Neptune is the most distant planet, about four and a half billion kilometres from the Sun. It has the fastest winds in the Solar System, reaching around two thousand kilometres an hour. Neptune was found in eighteen forty-six by mathematics: astronomers predicted where it must be before they ever saw it. One year on Neptune lasts a hundred and sixty-five Earth years. Its large moon, Triton, orbits backwards and erupts with geysers of nitrogen.` },
  { key: 'Pluto', title: 'Pluto', sub: 'And the Kuiper Belt',
    text: `Beyond Neptune lies the Kuiper Belt, a vast ring of icy worlds. Its most famous member is Pluto. Discovered in nineteen thirty, it was called the ninth planet until two thousand and six, when it was reclassified as a dwarf planet. In twenty fifteen, the New Horizons spacecraft flew past and revealed a world of mountains made of water ice, and a huge heart-shaped plain of frozen nitrogen. Its moon Charon is half its size.` },
  { key: 'EV_halley86', title: 'Halley\'s Comet', sub: 'February 1986',
    text: `Comets are icy visitors from the outer Solar System. This is Halley's Comet, as it was in nineteen eighty-six. Its heart is a dark, dirty snowball about fifteen kilometres long. As it nears the Sun, ice turns to gas, and sunlight and the solar wind push out tails that can stretch for millions of kilometres, always pointing away from the Sun. Halley returns about every seventy-six years. Its next visit will be in twenty sixty-one.` },
  { key: 'EV_solar', title: 'A Total Solar Eclipse', sub: '2 August 2027',
    text: `Here is a beautiful coincidence. The Sun is about four hundred times wider than the Moon, but also about four hundred times farther away, so in our sky they look almost exactly the same size. When the Moon passes directly in front of the Sun, its shadow falls on Earth. You can see it here, on the second of August twenty twenty-seven, crossing Egypt. Near Luxor, day will turn to night for more than six minutes.` },
  { key: 'Voyager1', title: 'Voyager 1', sub: 'Humanity\'s farthest traveller', pre: NOW,
    text: `Launched in nineteen seventy-seven, Voyager one flew past Jupiter and Saturn, then kept going. In nineteen ninety it turned around and photographed Earth from six billion kilometres away: a pale blue dot. In twenty twelve it crossed into interstellar space. Today it is more than twenty-five billion kilometres from home, so far that its radio signals take nearly a day to reach us. On board is a golden record carrying sounds and music from Earth.` },
  { key: 'scale', title: 'The True Scale', sub: 'How empty space really is',
    text: `Let's pause and see the Solar System at its true scale. If the Sun were the size of a grapefruit, Earth would be a grain of sand fifteen metres away. Jupiter would be a small marble seventy-eight metres away, and Neptune would sit nearly half a kilometre away. And the nearest star? On this scale, it would be about four thousand kilometres away. Space is, above all, empty.` },
  { key: 'Proxima', title: 'Proxima Centauri', sub: 'The nearest star', pre: () => rate('0.0416667'),
    text: `Leaving the Sun behind, we reach the nearest star: Proxima Centauri, four point two light-years away. Its light takes over four years to reach us, and at Voyager's speed, the journey would take more than seventy thousand years. Proxima is a small, cool red dwarf. Circling it is Proxima b, a rocky planet a little heavier than Earth, in the zone where liquid water could exist, if it has kept an atmosphere.` },
  { key: 'TRAPPIST1', title: 'TRAPPIST-1', sub: 'Seven Earth-sized worlds',
    text: `Forty light-years away, a tiny red star called TRAPPIST-1 has seven Earth-sized rocky planets. The star is barely bigger than Jupiter, and all seven planets orbit closer to it than Mercury is to our Sun. The innermost completes a year in just a day and a half. Three of them sit in the zone where water could be liquid, and the James Webb Space Telescope is now studying whether any of them have atmospheres.` },
  { key: 'Betelgeuse', title: 'Betelgeuse', sub: 'A dying giant',
    text: `In the shoulder of Orion shines Betelgeuse, a red supergiant several hundred light-years away. It is enormous: if it took the place of our Sun, its surface would reach beyond the orbit of Mars. In twenty nineteen it dimmed dramatically, which turned out to be a vast cloud of dust it had thrown off. One day, Betelgeuse will explode as a supernova, bright enough to see in daylight. That could happen at any time in the next hundred thousand years.` },
  { key: 'Orion', title: 'The Orion Nebula', sub: 'A stellar nursery',
    text: `This is the Orion Nebula, about thirteen hundred light-years away. It is a vast cloud of gas and dust where new stars are being born, close enough to see with the naked eye as a fuzzy patch in Orion's sword. At its heart, a group of young, hot stars called the Trapezium light up the gas around them. Around many of the newborn stars, telescopes have spotted discs of dust, where new planets may be forming right now.` },
  { key: 'Crab', title: 'The Crab Nebula', sub: 'The wreck of an exploded star',
    text: `In the year ten fifty-four, astronomers in China recorded a new star so bright it was visible in daylight for weeks. What they saw was a supernova, an exploding star. This is what remains: the Crab Nebula, still expanding at about fifteen hundred kilometres per second. At its centre is a pulsar, the collapsed core of the star, just twenty kilometres across, spinning about thirty times every second.` },
  { key: 'SgrA', title: 'Sagittarius A*', sub: 'The black hole at the centre of our galaxy',
    text: `Twenty-six thousand light-years away, at the centre of our Milky Way, lies Sagittarius A star: a supermassive black hole with the mass of about four million Suns. We can't see it directly, but we can see the stars racing around it, which is how astronomers proved it was there. That discovery won the Nobel Prize in twenty twenty. In twenty twenty-two, the Event Horizon Telescope captured the first image of its glowing ring. Our Sun takes about two hundred and thirty million years to circle it once.` },
  { key: 'Andromeda', title: 'The Andromeda Galaxy', sub: 'Our nearest big neighbour',
    text: `This is the Andromeda Galaxy, two and a half million light-years away. The light we see from it left when the earliest humans were walking the Earth. It contains around a trillion stars, and it is the most distant thing you can see with your own eyes on a dark night. Andromeda is moving towards us, and in billions of years it may collide with the Milky Way, merging the two into one giant galaxy.` },
  { key: 'M87BH', title: 'M87*', sub: 'The first black hole ever photographed',
    text: `In the galaxy Messier eighty-seven, fifty-three million light-years away, sits a black hole of six and a half billion Suns. In twenty nineteen, it became the first black hole ever photographed. To do it, astronomers linked radio telescopes across the whole planet into one virtual telescope the size of Earth. From its centre, a jet of particles shoots out at almost the speed of light, stretching thousands of light-years into space.` },
  { key: 'deep', title: 'The Universe', sub: 'Everything we have seen, and far more',
    text: `Here is everything we have visited, every star, nebula, black hole and galaxy, each in its true direction from Earth. And yet this is only a tiny corner. The observable universe is about ninety-three billion light-years across and thirteen point eight billion years old, and it holds hundreds of billions of galaxies, each with billions of stars. Many of those stars have planets. Somewhere out there, there may be others, looking back at us.` },
  { key: 'night', title: 'Look Up', sub: 'The sky from London tonight', pre: () => { SS.setDate(Date.now()); },
    text: `And so we come home, to the sky above London tonight. Every point of light up there is a sun, many with worlds of their own. The planets wander slowly against the stars, and the Moon changes shape night after night. Everything we have travelled through is out there, above your head. So on the next clear night, step outside and look up. Thank you for joining this journey through space.` },
];

// ---------------------------------------------------------------------------
// UI: control bar, title card, subtitles
// ---------------------------------------------------------------------------
const css = document.createElement('style');
css.textContent = `
#docbar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:20;display:none;align-items:center;gap:8px;background:rgba(10,14,30,.82);backdrop-filter:blur(8px);border:1px solid rgba(140,160,255,.22);border-radius:12px;padding:8px 12px;font-size:13px;color:#dfe6ff;transition:opacity .6s}
#docbar button,#docbar select{background:#24306a;color:#fff;border:1px solid #3a4aa0;border-radius:6px;padding:4px 9px;font-size:13px;cursor:pointer}
#docbar .meta{min-width:230px;max-width:300px}
#docbar .meta b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#docbar .bar{height:4px;background:#2a3366;border-radius:2px;margin-top:4px;overflow:hidden}
#docbar .bar i{display:block;height:100%;width:0;background:#8fb0ff}
#docbar.idle{opacity:0;pointer-events:none}
#doctitle{position:fixed;left:6vw;bottom:22vh;z-index:6;pointer-events:none;opacity:0;transition:opacity 1.2s}
#doctitle .n{font-size:clamp(11px,1vw,15px);letter-spacing:.3em;color:#9fb6ff;text-transform:uppercase}
#doctitle .t{font-size:clamp(30px,4.6vw,72px);font-weight:200;letter-spacing:.04em;color:#fff;text-shadow:0 2px 24px rgba(0,0,0,.9);line-height:1.05}
#doctitle .s{font-size:clamp(14px,1.5vw,22px);color:#cdd8ff;margin-top:6px;text-shadow:0 1px 12px #000}
#docsub{position:fixed;left:50%;bottom:11vh;transform:translateX(-50%);z-index:7;max-width:min(980px,82vw);text-align:center;pointer-events:none;font-size:clamp(15px,1.55vw,24px);line-height:1.4;color:#fff;text-shadow:0 0 6px #000,0 2px 12px #000;opacity:0;transition:opacity .4s}
body.doc #ui, body.doc #info, body.doc #hint, body.doc #note, body.doc #caption, body.doc #labelLayer{display:none!important}
body.doc #clock{opacity:.55}
body.doc.notime #clock{display:none}
body.render #docbar{display:none!important}
`;
document.head.appendChild(css);
const bar = document.createElement('div'); bar.id = 'docbar';
bar.innerHTML = `<button id="dPrev" title="Previous chapter">⏮</button><button id="dPlay">⏸</button><button id="dNext" title="Next chapter">⏭</button>
  <div class="meta"><b id="dName"></b><span id="dTime"></span><div class="bar"><i id="dProg"></i></div></div>
  <select id="dChap" title="Jump to chapter"></select>
  <button id="dVoice" title="Narration on/off">🔊 Voice</button><select id="dVoiceSel" title="Narrator voice"></select>
  <button id="dSubs" title="Subtitles on/off">CC</button><button id="dExit" title="Leave documentary (Esc)">✕</button>`;
document.body.appendChild(bar);
const titleEl = document.createElement('div'); titleEl.id = 'doctitle'; titleEl.innerHTML = '<div class="n"></div><div class="t"></div><div class="s"></div>'; document.body.appendChild(titleEl);
const subEl = document.createElement('div'); subEl.id = 'docsub'; document.body.appendChild(subEl);
CHAPTERS.forEach((c, i) => { const o = document.createElement('option'); o.value = i; o.textContent = `${i + 1}. ${c.title}`; $('dChap').appendChild(o); });

// panel button
{ const btn = document.createElement('button'); btn.type = 'button'; btn.id = 'docBtn'; btn.textContent = '🎬 Documentary (~20 min)';
  $('tourBtn').parentElement.appendChild(btn); btn.onclick = () => start(0); }

// ---------------------------------------------------------------------------
// Voices
// ---------------------------------------------------------------------------
const synth = window.speechSynthesis;
let voices = [], voice = null, voiceOn = false, subsOn = true;
function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices().filter(v => /^en/i.test(v.lang));
  const pref = ['Daniel', 'Google UK English Male', 'Arthur', 'Oliver', 'Serena', 'Kate', 'Google UK English Female', 'Alex', 'Samantha'];
  voices.sort((a, b) => { const ia = pref.findIndex(p => a.name.includes(p)), ib = pref.findIndex(p => b.name.includes(p)); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
  const sel = $('dVoiceSel'); sel.innerHTML = '';
  voices.forEach((v, i) => { const o = document.createElement('option'); o.value = i; o.textContent = `${v.name} (${v.lang})`; sel.appendChild(o); });
  if (!voice && voices.length) voice = voices[0];
  if (voice) sel.value = voices.indexOf(voice);
}
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; } else { $('dVoice').disabled = true; $('dVoiceSel').style.display = 'none'; }
$('dVoice').textContent = '🔇 Voice';
$('dVoiceSel').onchange = e => { voice = voices[+e.target.value]; };
$('dVoice').onclick = () => { voiceOn = !voiceOn; $('dVoice').textContent = voiceOn ? '🔊 Voice' : '🔇 Voice'; if (!voiceOn) synth?.cancel(); };
$('dSubs').onclick = () => { subsOn = !subsOn; $('dSubs').style.opacity = subsOn ? 1 : 0.45; if (!subsOn) subEl.style.opacity = 0; };

// ---------------------------------------------------------------------------
// Recorded narration (Ming TTS): narration/space-doc-01.m4a … one file per chapter
// ---------------------------------------------------------------------------
const audioFor = i => `narration/space-doc-${String(i + 1).padStart(2, '0')}.mp3`;
const audioOK = []; let anyAudio = false;
Promise.all(CHAPTERS.map((_, i) => fetch(audioFor(i), { method: 'HEAD' }).then(r => audioOK[i] = r.ok).catch(() => audioOK[i] = false)))
  .then(() => { anyAudio = audioOK.some(Boolean); if (anyAudio) { $('dVoice').textContent = '🔊 Narration'; voiceOn = true; $('dVoiceSel').style.display = 'none'; } });
const player = new Audio(); player.preload = 'auto';
let TIMINGS = null; fetch('narration/timings.json').then(r => r.ok ? r.json() : null).then(j => TIMINGS = j).catch(() => {});

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------
const WPS = 2.55;                        // reading pace when the voice is off (words per second)
const FLY = 5, HOLD_END = 4.5;         // seconds of flight before speaking, and pause after
const sentencesOf = t => t.match(/[^.!?]+[.!?]+/g).map(s => s.trim());
const RENDER = !!window.FIXED_DT;          // frame-by-frame video rendering: no live audio, timing from timings.json
const LOG = []; let frame = 0;
let state = null;                         // { i, t, phase, sentences, si, sStart, playing, speaking }
let token = 0;

function totalMinutes() { const w = CHAPTERS.reduce((a, c) => a + c.text.split(/\s+/).length, 0); return Math.round((w / WPS + CHAPTERS.length * (FLY + HOLD_END)) / 60); }

function start(i) {
  SS.stopTour?.();
  try { player.muted = true; player.src = audioFor(Math.max(0, i)); const p = player.play(); p?.then(() => { player.pause(); player.muted = false; }).catch(() => { player.muted = false; }); } catch (e) { player.muted = false; }
  if (!state) { pathsWere = $('paths').checked; if (pathsWere) $('paths').click(); }
  document.body.classList.add('doc'); bar.style.display = 'flex';
  controls.autoRotate = true; controls.autoRotateSpeed = 0.35;
  rate('0.0416667');
  state = { playing: true }; setChapter(i);
}
let pathsWere = false;
function stop() {
  if (state && pathsWere && !$('paths').checked) $('paths').click();
  token++; synth?.cancel(); player.pause(); state = null;
  document.body.classList.remove('doc'); bar.style.display = 'none';
  titleEl.style.opacity = 0; subEl.style.opacity = 0; controls.autoRotateSpeed = 0.25;
}
function setChapter(i) {
  token++; synth?.cancel(); player.pause();
  if (i >= CHAPTERS.length) { finish(); return; }
  i = Math.max(0, i);
  const c = CHAPTERS[i];
  Object.assign(state, { i, t: 0, phase: 'fly', sentences: sentencesOf(c.text), si: -1, sStart: 0, speaking: false });
  c.pre?.();
  if (audioOK[i] && !RENDER) { player.src = audioFor(i); player.load(); }
  LOG[i] = { start: frame, date: SS.getDate() };
  SS.focusSel.value = c.key; SS.go(c.key);
  $('dChap').value = i; $('dName').textContent = `${i + 1}/${CHAPTERS.length} · ${c.title}`;
  titleEl.querySelector('.n').textContent = `Chapter ${i + 1}`;
  titleEl.querySelector('.t').textContent = c.title; titleEl.querySelector('.s').textContent = c.sub;
  titleEl.style.opacity = 0; subEl.style.opacity = 0;
}
function finish() {
  state.playing = false; $('dPlay').textContent = '▶'; subEl.style.opacity = 0;
  titleEl.querySelector('.n').textContent = ''; titleEl.querySelector('.t').textContent = 'Thank you for watching'; titleEl.querySelector('.s').textContent = '';
  titleEl.style.opacity = 1;
}
function showSentence(k) {
  state.si = k; state.sStart = state.t;
  const s = state.sentences[k];
  if (subsOn) { subEl.textContent = s; subEl.style.opacity = 1; }
  if (voiceOn && synth && voice && !anyAudio) {
    const my = token, u = new SpeechSynthesisUtterance(s);
    u.voice = voice; u.lang = voice.lang; u.rate = 0.95; u.pitch = 1;
    state.speaking = true;
    u.onend = u.onerror = () => { if (my !== token || !state) return; state.speaking = false; nextSentence(); };
    synth.speak(u);
  }
}
function nextSentence() {
  if (state.si + 1 < state.sentences.length) showSentence(state.si + 1);
  else { state.phase = 'hold'; state.holdStart = state.t; subEl.style.opacity = 0; }
}
SS.sim.push(() => {
  if (!state || !state.playing) return;
  frame++;
  const dt = SS.frameDt; state.t += dt;
  const c = CHAPTERS[state.i];
  if (RENDER) {          // fades driven by video time, so they are smooth frame by frame
    titleEl.style.transition = 'none'; subEl.style.transition = 'none';
    const t = state.t, o = Math.max(0, Math.min(1, (t - 0.8) / 1.2, (9.5 - t) / 1.2));
    titleEl.style.opacity = o;
  } else if (state.t > 0.8 && state.t < 8.5) titleEl.style.opacity = 1; else if (state.t >= 8.5) titleEl.style.opacity = 0;
  if (state.phase === 'fly' && state.t > FLY) {
    state.phase = 'talk';
    const tmR = TIMINGS?.[String(state.i + 1).padStart(2, '0')];
    if (RENDER && tmR) { state.audio = true; state.virtual = true; state.talkStart = state.t; state.talkDur = tmR.duration; state.si = -1; LOG[state.i].talk = frame; }
    else if (voiceOn && audioOK[state.i]) {           // recorded narration drives the timing
      state.audio = true; state.virtual = false; const my = token;
      player.currentTime = 0; player.play().catch(() => {});
      player.onended = () => { if (my === token && state) { state.phase = 'hold'; state.holdStart = state.t; subEl.style.opacity = 0; } };
      state.si = -1;
    } else { state.audio = false; showSentence(0); }
  }
  if (state.phase === 'talk' && state.audio) {   // subtitles follow the audio, split by word count
    const pos = state.virtual ? state.t - state.talkStart : player.currentTime, tm = TIMINGS?.[String(state.i + 1).padStart(2, '0')];
    if (state.virtual && pos >= state.talkDur) { state.phase = 'hold'; state.holdStart = state.t; subEl.style.opacity = 0; return; }
    let k = 0;
    if (tm) { while (k + 1 < tm.starts.length && pos >= tm.starts[k + 1] - 0.05) k++; }      // exact sentence start times
    else { const dur = player.duration || 1, w = state.sentences.map(x => x.split(/\s+/).length), tot = w.reduce((a, b) => a + b, 0);
      let acc = 0; for (; k < w.length; k++) { acc += w[k] / tot * dur; if (pos < acc) break; } }
    k = Math.min(k, state.sentences.length - 1);
    if (k !== state.si) { state.si = k; if (subsOn) { subEl.textContent = state.sentences[k]; subEl.style.opacity = 1; } }
  }
  if (state.phase === 'talk' && !state.audio && !(voiceOn && synth && voice && !anyAudio)) {          // timed subtitles when the voice is off
    const words = state.sentences[state.si].split(/\s+/).length;
    if (state.t - state.sStart > words / WPS + 0.35) nextSentence();
  }
  if (state.phase === 'hold' && state.t - state.holdStart > HOLD_END) setChapter(state.i + 1);
  // progress
  const n = state.sentences.length, done = state.phase === 'fly' ? 0 : state.phase === 'hold' ? n : state.si;
  $('dProg').style.width = `${Math.round(100 * (state.i + done / n) / CHAPTERS.length)}%`;
});

$('dPlay').onclick = () => {
  if (!state) return;
  if (!state.playing && state.i >= CHAPTERS.length - 1 && state.phase === 'hold') { setChapter(0); state.playing = true; $('dPlay').textContent = '⏸'; return; }
  state.playing = !state.playing; $('dPlay').textContent = state.playing ? '⏸' : '▶';
  if (synth) state.playing ? synth.resume() : synth.pause();
  if (state.audio && state.phase === 'talk') state.playing ? player.play() : player.pause();
};
$('dPrev').onclick = () => state && setChapter(state.i - 1);
$('dNext').onclick = () => state && setChapter(state.i + 1);
$('dChap').onchange = e => state && setChapter(+e.target.value);
$('dExit').onclick = stop;
$('dTime').textContent = ` · about ${totalMinutes()} min`;
setTimeout(() => { if (TIMINGS) { const sec = Object.values(TIMINGS).reduce((a, v) => a + v.duration, 0) + CHAPTERS.length * (FLY + HOLD_END); $('dTime').textContent = ` · ${Math.round(sec / 60)} min`; $('docBtn').textContent = `🎬 Documentary (${Math.round(sec / 60)} min)`; } }, 3000);
addEventListener('keydown', e => {
  if (!state) return;
  if (e.key === 'Escape') stop();
  if (e.key === ' ' && document.activeElement?.tagName !== 'SELECT') { e.preventDefault(); $('dPlay').click(); }
  if (e.key === 'ArrowRight') $('dNext').click();
  if (e.key === 'ArrowLeft') $('dPrev').click();
});
// hide the control bar while the mouse is still, so screen recordings are clean
{ let idle; const wake = () => { bar.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => state?.playing && bar.classList.add('idle'), 2500); };
  addEventListener('pointermove', wake); addEventListener('keydown', wake); }

SS.documentary = { CHAPTERS, start, stop, LOG, getState: () => state, getFrame: () => frame, setFrame: f => { frame = f; }, timingsReady: () => !!TIMINGS };

await import('./more.js' + new URL(import.meta.url).search);
