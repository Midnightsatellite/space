// =====================================================================
// 🐾 Animals in space: the flies, monkeys, dogs, a cat, tortoises, spiders, jellyfish and
// water bears that went before (and alongside) people. Each story flies to its launch site
// and draws the flight: a hop to the edge of space, or the orbit, with a little capsule on it.
// A guided tour walks through them in order.
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const { PL } = SS.extras;
const special = SS.more.special;
const fr = () => SS.lang === 'fr';
const V = (x, y, z) => new THREE.Vector3(x, y, z), D2R = Math.PI / 180, RE = 6371;

const earthMesh = PL.Earth.tilted.children[0], R = earthMesh.geometry.parameters.radius;
const local = (lat, lon) => { const a = lat * D2R, o = lon * D2R; return V(Math.cos(a) * Math.cos(o), Math.sin(a), -Math.cos(a) * Math.sin(o)); };

// key, emoji, year, [name en, fr], [site en, fr], lat, lon, flight, [story en, fr], [[fact en, fr], ...]
// flight: ['hop', apogee km] · ['orbit', perigee km, apogee km, inclination °] · ['moon'] · ['iss']
const SITES = {
  ws: [['White Sands, New Mexico, USA', 'White Sands, Nouveau-Mexique, États-Unis'], 32.38, -106.48],
  ky: [['Kapustin Yar, USSR (now Russia)', 'Kapoustine Iar, URSS (aujourd’hui Russie)'], 48.57, 45.77],
  bk: [['Baikonur, USSR (now Kazakhstan)', 'Baïkonour, URSS (aujourd’hui Kazakhstan)'], 45.92, 63.34],
  cc: [['Cape Canaveral, Florida, USA', 'Cap Canaveral, Floride, États-Unis'], 28.47, -80.56],
  hm: [['Hammaguir, Algeria (French launch base)', 'Hammaguir, Algérie (base de lancement française)'], 30.89, -3.06],
};
const S = [
  ['AN_Flies', '🪰', 1947, ['Fruit flies', 'Des mouches du vinaigre'], 'ws', ['hop', 109],
    ['The very first animals in space were fruit flies. On 20 February 1947 an American V-2 rocket carried them, with some rye and cotton seeds, about 109 km up, just past the edge of space. The capsule came down by parachute and the flies were alive: proof that living things could survive the trip and its radiation.',
     'Les tout premiers animaux dans l’espace étaient des mouches du vinaigre. Le 20 février 1947, une fusée V-2 américaine les a emportées, avec des graines de seigle et de coton, à environ 109 km d’altitude, juste au-delà de la limite de l’espace. La capsule est redescendue en parachute et les mouches étaient vivantes : la preuve que des êtres vivants pouvaient survivre au voyage et à ses radiations.'],
    [['Fruit flies were chosen because their genes are well known and resemble ours in surprising ways.', 'On a choisi des mouches du vinaigre car leurs gènes sont bien connus et ressemblent étonnamment aux nôtres.'],
     ['The flight lasted only a few minutes, but no living thing had ever been that high before.', 'Le vol n’a duré que quelques minutes, mais aucun être vivant n’était jamais monté aussi haut.']]],
  ['AN_Albert', '🐒', 1949, ['Albert II, the first monkey', 'Albert II, le premier singe'], 'ws', ['hop', 134],
    ['On 14 June 1949 a rhesus monkey called Albert II rode a V-2 rocket to about 134 km, becoming the first monkey, and the first mammal, in space. Sensors recorded his heartbeat and breathing all the way up. Sadly his parachute failed and he did not survive the landing.',
     'Le 14 juin 1949, un singe rhésus nommé Albert II est monté à bord d’une V-2 jusqu’à environ 134 km, devenant le premier singe, et le premier mammifère, dans l’espace. Des capteurs ont enregistré son cœur et sa respiration pendant toute la montée. Hélas, son parachute ne s’est pas ouvert et il n’a pas survécu à l’atterrissage.'],
    [['His heartbeat data showed doctors that a mammal could stay healthy in the first moments of spaceflight.', 'Ses données cardiaques ont montré aux médecins qu’un mammifère restait en bonne santé dans les premiers instants d’un vol spatial.']]],
  ['AN_Dezik', '🐕', 1951, ['Dezik and Tsygan, the first dogs', 'Dezik et Tsygan, les premiers chiens'], 'ky', ['hop', 101],
    ['The Soviet Union chose stray dogs, reasoning that life on the streets had made them tough. On 22 July 1951 Dezik and Tsygan flew to about 100 km on an R-1 rocket and parachuted back safely, the first dogs to reach space and return.',
     'L’Union soviétique choisissait des chiens errants, pensant que la vie dans la rue les avait endurcis. Le 22 juillet 1951, Dezik et Tsygan sont montés à environ 100 km sur une fusée R-1 et sont redescendus sains et saufs en parachute : les premiers chiens à atteindre l’espace et à en revenir.'],
    [['Tsygan was adopted afterwards by one of the scientists, Anatoli Blagonravov.', 'Tsygan a ensuite été adoptée par l’un des scientifiques, Anatoli Blagonravov.'],
     ['Small female dogs were preferred: they fitted the capsule and its toilet harness better.', 'On préférait de petites chiennes : elles tenaient mieux dans la capsule et son harnais sanitaire.']]],
  ['AN_Laika', '🐶', 1957, ['Laika, the first animal in orbit', 'Laïka, le premier animal en orbite'], 'bk', ['orbit', 212, 1660, 65.3],
    ['On 3 November 1957, just a month after Sputnik 1, the Soviet Union launched Sputnik 2 with a small stray dog called Laika on board. She became the first animal to orbit the Earth. There was no way to bring the capsule back, and in 2002 it was revealed that she died of overheating within hours of launch. Her flight showed that a living creature could survive launch and weightlessness, and opened the way for Yuri Gagarin.',
     'Le 3 novembre 1957, un mois à peine après Spoutnik 1, l’Union soviétique a lancé Spoutnik 2 avec à bord une petite chienne errante nommée Laïka. Elle est devenue le premier animal à tourner autour de la Terre. Rien n’était prévu pour ramener la capsule, et on a appris en 2002 qu’elle était morte de chaleur quelques heures après le lancement. Son vol a montré qu’un être vivant pouvait supporter le lancement et l’apesanteur, et a ouvert la voie à Youri Gagarine.'],
    [['Sputnik 2 kept circling for five months, about 2,570 orbits, before burning up on 14 April 1958.', 'Spoutnik 2 a continué de tourner pendant cinq mois, environ 2 570 orbites, avant de se consumer le 14 avril 1958.'],
     ['A monument to Laika, standing on a rocket, was unveiled in Moscow in 2008.', 'Un monument à Laïka, debout sur une fusée, a été inauguré à Moscou en 2008.']]],
  ['AN_Belka', '🐕', 1960, ['Belka and Strelka', 'Belka et Strelka'], 'bk', ['orbit', 306, 339, 65],
    ['On 19 August 1960 two dogs, Belka and Strelka, spent a day in orbit aboard Korabl-Sputnik 2, with 40 mice, 2 rats, a rabbit, flies and plants. After 17 orbits the capsule came back down by parachute and everyone was alive: the first living creatures to go into orbit and return safely. Eight months later, Yuri Gagarin flew in the same kind of spacecraft.',
     'Le 19 août 1960, deux chiennes, Belka et Strelka, ont passé une journée en orbite à bord de Korabl-Spoutnik 2, avec 40 souris, 2 rats, un lapin, des mouches et des plantes. Après 17 orbites, la capsule est redescendue en parachute et tout le monde était vivant : les premiers êtres vivants à aller en orbite et à revenir sains et saufs. Huit mois plus tard, Youri Gagarine volait dans le même type de vaisseau.'],
    [['Strelka later had puppies; one, Pushinka, was given to US President Kennedy’s daughter Caroline in 1961.', 'Strelka a ensuite eu des chiots ; l’un d’eux, Pouchinka, a été offert en 1961 à Caroline, la fille du président américain Kennedy.'],
     ['Both dogs are preserved and on display at the Memorial Museum of Cosmonautics in Moscow.', 'Les deux chiennes sont conservées et exposées au musée de la Cosmonautique de Moscou.']]],
  ['AN_Ham', '🐒', 1961, ['Ham, the chimpanzee', 'Ham, le chimpanzé'], 'cc', ['hop', 253],
    ['On 31 January 1961 a chimpanzee called Ham flew a Mercury capsule to 253 km and back in about 16 and a half minutes. He had been trained to pull levers when lights flashed, and he kept doing it in space, proving that a pilot could work normally while weightless. Three months later Alan Shepard became the first American in space in the same kind of capsule.',
     'Le 31 janvier 1961, un chimpanzé nommé Ham a fait un vol de 16 minutes et demie à bord d’une capsule Mercury, jusqu’à 253 km d’altitude. On lui avait appris à tirer des leviers quand des lumières clignotaient, et il a continué dans l’espace : la preuve qu’un pilote pouvait travailler normalement en apesanteur. Trois mois plus tard, Alan Shepard devenait le premier Américain dans l’espace dans le même type de capsule.'],
    [['Ham landed in the Atlantic and was picked up safely; he lived until 1983, mostly at a zoo in North Carolina.', 'Ham a amerri dans l’Atlantique et a été récupéré sain et sauf ; il a vécu jusqu’en 1983, surtout dans un zoo de Caroline du Nord.'],
     ['In November 1961 another chimpanzee, Enos, became the first ape to orbit the Earth, circling it twice.', 'En novembre 1961, un autre chimpanzé, Enos, est devenu le premier singe à tourner autour de la Terre, deux fois.']]],
  ['AN_Felicette', '🐈', 1963, ['Félicette, the only cat in space', 'Félicette, la seule chatte de l’espace'], 'hm', ['hop', 157],
    ['On 18 October 1963 France sent a small black-and-white stray cat called Félicette on a Véronique rocket from the Sahara. She reached about 157 km, floated for five minutes, and came back by parachute alive after a 15-minute flight. She is still the only cat ever to fly to space. Electrodes recorded her brain activity to see how weightlessness affects the nervous system.',
     'Le 18 octobre 1963, la France a envoyé une petite chatte errante noire et blanche, Félicette, sur une fusée Véronique depuis le Sahara. Elle est montée à environ 157 km, a flotté cinq minutes, puis est redescendue vivante en parachute après un vol de 15 minutes. C’est toujours le seul chat à être allé dans l’espace. Des électrodes enregistraient son activité cérébrale pour étudier l’effet de l’apesanteur sur le système nerveux.'],
    [['For years she was forgotten; in 2019 a bronze statue of Félicette was unveiled at the International Space University in Strasbourg.', 'Elle a longtemps été oubliée ; en 2019, une statue en bronze de Félicette a été inaugurée à l’Université internationale de l’espace, à Strasbourg.'],
     ['Sadly she was put to sleep two months after the flight so scientists could study her brain.', 'Malheureusement, elle a été endormie deux mois après le vol pour que les scientifiques étudient son cerveau.']]],
  ['AN_Tortoises', '🐢', 1968, ['Two tortoises around the Moon', 'Deux tortues autour de la Lune'], 'bk', ['moon'],
    ['Before any human went to the Moon, two Russian tortoises did. The Soviet probe Zond 5, launched in September 1968, carried them with flies, worms and seeds around the far side of the Moon and back to Earth, splashing down in the Indian Ocean on 21 September. They were the first living things to travel around the Moon and return, and both survived, a little thinner.',
     'Avant qu’un humain n’aille vers la Lune, deux tortues russes l’ont fait. La sonde soviétique Zond 5, lancée en septembre 1968, les a emmenées avec des mouches, des vers et des graines autour de la face cachée de la Lune, puis de retour sur Terre, avec un amerrissage dans l’océan Indien le 21 septembre. Ce furent les premiers êtres vivants à faire le tour de la Lune et à revenir, et les deux ont survécu, un peu amaigries.'],
    [['Zond 5 passed about 1,950 km above the Moon’s surface.', 'Zond 5 est passée à environ 1 950 km de la surface de la Lune.'],
     ['Three months later, Apollo 8 carried the first people around the Moon.', 'Trois mois plus tard, Apollo 8 emmenait les premiers humains autour de la Lune.']]],
  ['AN_Spiders', '🕷️', 1973, ['Arabella and Anita, the spiders', 'Arabella et Anita, les araignées'], 'cc', ['orbit', 422, 442, 50],
    ['A school student, Judith Miles, asked: can a spider spin a web without gravity? In 1973 two garden spiders, Arabella and Anita, flew to the Skylab space station to find out. Their first webs were messy, but within days they were spinning almost normal ones, using thinner silk. They did not survive the mission, but they showed how well animals can adapt.',
     'Une lycéenne, Judith Miles, s’est demandé : une araignée peut-elle tisser une toile sans pesanteur ? En 1973, deux épeires, Arabella et Anita, sont parties pour la station spatiale Skylab afin de le découvrir. Leurs premières toiles étaient désordonnées, mais en quelques jours elles en tissaient de presque normales, avec un fil plus fin. Elles n’ont pas survécu à la mission, mais elles ont montré à quel point les animaux savent s’adapter.'],
    [['Arabella is preserved at the Smithsonian National Air and Space Museum in Washington.', 'Arabella est conservée au musée national de l’Air et de l’Espace du Smithsonian, à Washington.']]],
  ['AN_Jellyfish', '🪼', 1991, ['Jellyfish on the Space Shuttle', 'Des méduses dans la navette spatiale'], 'cc', ['orbit', 287, 296, 39],
    ['In June 1991 the Space Shuttle Columbia carried 2,478 tiny moon jellyfish polyps into orbit. They multiplied to around 60,000 during the nine-day flight. Jellyfish born in space later struggled to sense up and down back on Earth, because the little gravity sensors they rely on had grown without gravity: a warning for future babies born in space.',
     'En juin 1991, la navette spatiale Columbia a emporté en orbite 2 478 minuscules polypes de méduses. Ils se sont multipliés jusqu’à environ 60 000 pendant les neuf jours du vol. Les méduses nées dans l’espace avaient ensuite du mal à distinguer le haut du bas sur Terre, car leurs petits capteurs de gravité s’étaient formés sans pesanteur : un avertissement pour de futurs bébés nés dans l’espace.'],
    [['Jellyfish sense gravity with tiny crystals that roll inside special cells, much like our inner ear.', 'Les méduses perçoivent la gravité grâce à de minuscules cristaux qui roulent dans des cellules spéciales, un peu comme notre oreille interne.']]],
  ['AN_Tardigrades', '🔬', 2007, ['Water bears in open space', 'Les tardigrades dans l’espace'], 'bk', ['orbit', 260, 280, 63],
    ['Tardigrades, or water bears, are animals smaller than a grain of sand. In September 2007 thousands of dried-out tardigrades rode outside the European-Russian capsule Foton-M3, exposed to the vacuum and cold of open space for ten days. Back on Earth, many woke up when given water and even had young. Some had survived the Sun’s full ultraviolet light, which would kill almost anything else.',
     'Les tardigrades, ou oursons d’eau, sont des animaux plus petits qu’un grain de sable. En septembre 2007, des milliers de tardigrades desséchés ont voyagé à l’extérieur de la capsule européo-russe Foton-M3, exposés au vide et au froid de l’espace pendant dix jours. De retour sur Terre, beaucoup se sont réveillés une fois réhydratés et ont même eu des petits. Certains avaient survécu au rayonnement ultraviolet du Soleil, qui tue presque tout le reste.'],
    [['They were the first animals known to survive the bare vacuum of space.', 'Ce furent les premiers animaux connus à survivre au vide de l’espace, sans aucune protection.']]],
  ['AN_ISS', '🐭', 2026, ['Animals on the Space Station today', 'Les animaux de la Station spatiale aujourd’hui'], null, ['iss'],
    ['Animals still fly today, to help keep astronauts healthy. On the International Space Station, mice live in special habitats so scientists can study how weightlessness weakens bones and muscles, and how to prevent it. Fish, worms, ants and even bobtail squid have flown there too, each answering a different question about life away from Earth.',
     'Des animaux volent encore aujourd’hui, pour aider à garder les astronautes en bonne santé. Sur la Station spatiale internationale, des souris vivent dans des habitats spéciaux pour que les scientifiques étudient comment l’apesanteur affaiblit les os et les muscles, et comment l’empêcher. Des poissons, des vers, des fourmis et même des calmars ont aussi séjourné à bord, chacun répondant à une question différente sur la vie loin de la Terre.'],
    [['Mice age faster in orbit in some ways, so a few weeks in space can teach what takes months on Earth.', 'Les souris vieillissent plus vite en orbite à certains égards : quelques semaines dans l’espace peuvent apprendre ce qui prend des mois sur Terre.']]],
];
const KEYS = S.map(s => s[0]);

// ---------------------------------------------------------------- the flight drawn on the globe
const fx = new THREE.Group(); earthMesh.add(fx); fx.visible = false;
const lineMat = new THREE.LineBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0.9 });
const sprite = (emoji, size) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.font = '96px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(emoji, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.scale.setScalar(size); return s; };
const capsule = new THREE.Mesh(new THREE.SphereGeometry(R * 0.012, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
let path = null, rider = null, tStart = 0;
const anchors = {};
for (const [k, , , , site] of S) { if (!site) continue; const a = new THREE.Object3D(); a.position.copy(local(SITES[site][1], SITES[site][2]).multiplyScalar(R)); earthMesh.add(a); anchors[k] = a; }

function draw(k) {
  fx.clear(); path = null; rider = null;
  const st = S.find(s => s[0] === k); if (!st || !st[4]) { fx.visible = false; return; }
  const [, emoji, , , site, fl] = st, s = local(SITES[site][1], SITES[site][2]), pts = [];
  if (fl[0] === 'hop') {   // straight up, a gentle arc, and down again a few hundred km away (heights drawn 4× so they show)
    const east = V(0, 1, 0).cross(s).normalize(), h = fl[1] / RE * 4, span = 0.05;
    for (let i = 0; i <= 80; i++) { const u = i / 80, ang = u * span, alt = 1 + h * Math.sin(Math.PI * u);
      pts.push(s.clone().multiplyScalar(Math.cos(ang)).add(east.clone().multiplyScalar(Math.sin(ang))).normalize().multiplyScalar(R * alt)); }
  } else if (fl[0] === 'orbit') {   // a circle through the launch site at the real inclination, at the mean height (drawn 2× so it shows)
    const inc = fl[3] * D2R, y = V(0, 1, 0); let best = null, bd = 9;
    for (let a = 0; a < 360; a += 0.5) { const p = V(0, 1, 0).cross(s).normalize(), q = s.clone().cross(p).normalize();
      const n = p.clone().multiplyScalar(Math.cos(a * D2R)).add(q.clone().multiplyScalar(Math.sin(a * D2R))); const d = Math.abs(n.dot(y) - Math.cos(inc)); if (d < bd) { bd = d; best = n; } }
    const u = s.clone(), w = best.clone().cross(u).normalize(), r = R * (1 + (fl[1] + fl[2]) / 2 / RE * 2);
    for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2; pts.push(u.clone().multiplyScalar(Math.cos(a) * r).add(w.clone().multiplyScalar(Math.sin(a) * r))); }
  } else { fx.visible = false; return; }
  path = pts; tStart = performance.now();
  fx.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  const pad = sprite('🚀', R * 0.05); pad.position.copy(s.clone().multiplyScalar(R * 1.004)); pad.center.set(0.5, 0.1); fx.add(pad);
  rider = sprite(emoji, R * 0.07); fx.add(rider, capsule); fx.visible = true;
}
SS.sim?.push?.(() => {
  if (!rider || !path) return;
  const loop = path.length > 100 ? 14000 : 7000, u = ((performance.now() - tStart) % loop) / loop, p = path[Math.min(path.length - 1, Math.floor(u * (path.length - 1)))];
  capsule.position.copy(p); rider.position.copy(p).multiplyScalar(1.025);
});

// ---------------------------------------------------------------- cards
const T = (en, f) => fr() ? f : en;
function overview() {
  return `<div style="font-size:13px;margin:4px 0 8px">${T('Before people flew, animals tested whether a living body could survive launch, weightlessness and the trip home. Pick a story:', 'Avant les humains, des animaux ont permis de vérifier qu’un corps vivant pouvait supporter le lancement, l’apesanteur et le retour. Choisissez une histoire :')}</div>
    ${S.map(s => `<div style="margin:3px 0"><a style="color:#9cc4ff" href="#" data-animal="${s[0]}">${s[1]} <b style="display:inline">${s[2] === 2026 ? T('Today', 'Aujourd’hui') : s[2]}</b> · ${T(s[3][0], s[3][1])}</a></div>`).join('')}
    <div style="margin-top:9px"><a style="color:#9cc4ff" href="#" data-animal-tour="1">▶ ${T('Take the tour', 'Faire la visite')}</a></div>`;
}
function card(k) {
  const i = KEYS.indexOf(k), s = S[i], F = fr(), site = s[4] ? SITES[s[4]][0][F ? 1 : 0] : '';
  const next = S[i + 1], fl = s[5];
  const how = fl[0] === 'hop' ? T(`A short hop to about ${fl[1]} km and straight back down (drawn 4× higher so you can see it).`, `Un court saut jusqu’à environ ${fl[1]} km, puis retour direct (dessiné 4× plus haut pour être visible).`)
    : fl[0] === 'orbit' ? T(`In orbit, ${fl[1]}–${fl[2]} km up, tilted ${Math.round(fl[3])}° to the equator (drawn 2× higher).`, `En orbite, à ${fl[1]}–${fl[2]} km d’altitude, inclinée de ${Math.round(fl[3])}° sur l’équateur (dessinée 2× plus haut).`) : '';
  return `<div style="font-size:44px;line-height:1;margin:2px 0 6px">${s[1]}</div>
    <div>${T(s[6][0], s[6][1])}</div>
    ${how ? `<div style="margin-top:6px;font-size:12px;opacity:.8">${site ? '🚀 ' + site + ' · ' : ''}${how}</div>` : ''}
    ${s[7].map(f => `<div style="margin-top:6px;font-size:13px">• ${T(f[0], f[1])}</div>`).join('')}
    <div style="margin-top:9px;display:flex;justify-content:space-between;gap:8px"><a style="color:#9cc4ff" href="#" data-animal="AN_All">← ${T('All animals in space', 'Tous les animaux de l’espace')}</a>
    ${next ? `<a style="color:#9cc4ff" href="#" data-animal="${next[0]}">${T('Next', 'Suivant')} ${next[1]} ▶</a>` : ''}</div>`;
}
const sub = s => s[2] === 2026 ? T('Today · Life sciences', 'Aujourd’hui · Sciences de la vie') : `${s[2]} · ${T('Animals in space', 'Animaux dans l’espace')}`;
const fill = k => {
  if (k === 'AN_All') { info('AN_All', T('🐾 Animals in space', '🐾 Les animaux dans l’espace'), T('History · 1947 to today', 'Histoire · de 1947 à aujourd’hui'), T('the creatures that flew before us', 'les créatures qui ont volé avant nous'), overview()); return; }
  const s = S.find(x => x[0] === k); info(k, `${s[1]} ${T(s[3][0], s[3][1])}`, sub(s), s[4] ? SITES[s[4]][0][fr() ? 1 : 0] : T('International Space Station', 'Station spatiale internationale'), card(k));
};

// ---------------------------------------------------------------- bodies, focus, menu, tour
const dirOut = a => () => a.getWorldPosition(V()).sub(earthMesh.getWorldPosition(V())).normalize().add(V(0, 0.25, 0)).normalize();
bodies.AN_All = { obj: earthMesh, radius: R, view: R * 3.2 };
for (const s of S) {
  const [k, , , , site, fl] = s;
  if (fl[0] === 'moon') bodies[k] = { obj: bodies.Moon.obj, radius: bodies.Moon.radius, view: bodies.Moon.view || bodies.Moon.radius * 4 };
  else if (fl[0] === 'iss') bodies[k] = { obj: bodies.ISS.obj, radius: bodies.ISS.radius, view: bodies.ISS.view || 0.22, dir: bodies.ISS.dir };
  else bodies[k] = { obj: anchors[k], radius: R * 0.02, view: R * (fl[0] === 'hop' ? 0.9 : 2.6), dir: dirOut(anchors[k]) };
  fill(k);
}
fill('AN_All');
{ const prev = SS.onFocus; SS.onFocus = key => {
    if (key === 'AN_All' || KEYS.includes(key)) { fill(key); if (SS.more.INFO_EN?.[key]) SS.more.INFO_EN[key] = { ...INFO[key] }; draw(key); }
    else if (fx.visible) { fx.visible = false; rider = null; }
    prev(key); }; }
special.AN_Tour = () => {
  const list = S.map(s => [s[0], `${s[1]} ${T(s[3][0], s[3][1])}`, s[2] === 2026 ? T('Today', 'Aujourd’hui') : String(s[2]), 10]);
  SS.startTour(list); const b = document.getElementById('tourBtn'); if (b) b.textContent = (SS.tr || (x => x))('■ Stop tour');
};
document.addEventListener('click', e => {
  const a = e.target.closest?.('[data-animal]'); if (a) { e.preventDefault(); focusSel.value = a.dataset.animal; flyTo(a.dataset.animal); return; }
  const t = e.target.closest?.('[data-animal-tour]'); if (t) { e.preventDefault(); special.AN_Tour(); }
});
{ const og = document.createElement('optgroup'); og.label = '🐾 Animals in space';
  const after = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === '🛰 NASA science fleet'); after ? after.after(og) : focusSel.appendChild(og);
  for (const [k, t] of [['AN_Tour', '▶ Tour: animals in space'], ['AN_All', 'All the stories, 1947 to today'], ...S.map(s => [s[0], `${s[1]} ${s[2] === 2026 ? 'Today' : s[2]} · ${s[3][0]}`])]) {
    const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); } }
SS.i18nAdd?.({
  ui: { '🐾 Animals in space': '🐾 Les animaux dans l’espace', '▶ Tour: animals in space': '▶ Visite : les animaux dans l’espace', 'All the stories, 1947 to today': 'Toutes les histoires, de 1947 à aujourd’hui',
    ...Object.fromEntries(S.map(s => [`${s[1]} ${s[2] === 2026 ? 'Today' : s[2]} · ${s[3][0]}`, `${s[1]} ${s[2] === 2026 ? 'Aujourd’hui' : s[2]} · ${s[3][1]}`])) },
  name: { '🐾 Animals in space': '🐾 Les animaux dans l’espace', '▶ Tour: animals in space': '▶ Visite : les animaux dans l’espace', 'All the stories, 1947 to today': 'Toutes les histoires, de 1947 à aujourd’hui',
    ...Object.fromEntries(S.map(s => [`${s[1]} ${s[2] === 2026 ? 'Today' : s[2]} · ${s[3][0]}`, `${s[1]} ${s[2] === 2026 ? 'Aujourd’hui' : s[2]} · ${s[3][1]}`])) },
});
SS.animals = { draw, KEYS };
