// =====================================================================
// Space on screen: films, series, sitcoms, cartoons and anime set on real places in this map, a browse card, and a film & TV quiz
// =====================================================================
const SS = window.SS;
const { bodies, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const special = SS.more.special;
const go = k => { focusSel.value = k; SS.go(k); };

// type: f film · s series · c sitcom · a cartoon · j anime / manga · b book or comic
const ICON = { f: '🎬', s: '📺', c: '😂', a: '✏️', j: '🎌', b: '📖' };
const TYPE = { f: ['film', 'film'], s: ['series', 'série'], c: ['sitcom', 'sitcom'], a: ['cartoon', 'dessin animé'], j: ['anime', 'anime'], b: ['book / comic', 'livre / BD'] };
// place key → [type, title EN, title FR (or ''), year, note EN, note FR]
const M = {
  Mars: [
    ['f', 'The Martian', 'Seul sur Mars', '2015', 'Matt Damon is left behind on Mars and grows potatoes to survive. Directed by Ridley Scott.', 'Matt Damon, oublié sur Mars, fait pousser des pommes de terre pour survivre. Réalisé par Ridley Scott.'],
    ['f', 'Total Recall', '', '1990', 'Arnold Schwarzenegger on a Mars mining colony.', 'Arnold Schwarzenegger dans une colonie minière martienne.'],
    ['f', 'John Carter', '', '2012', 'An American soldier wakes up on "Barsoom", an old dream of Mars.', 'Un soldat américain se réveille sur « Barsoom », une Mars rêvée.'],
    ['f', 'Mars Attacks!', '', '1996', 'Tim Burton\'s comedy: little green Martians invade Earth.', 'La comédie de Tim Burton : de petits Martiens verts envahissent la Terre.'],
    ['f', 'Red Planet / Mission to Mars', 'Planète rouge / Mission to Mars', '2000', 'Two Mars films in the same year.', 'Deux films sur Mars la même année.'],
    ['f', 'Aelita', '', '1924', 'A Soviet silent film, one of the very first trips to Mars on screen.', 'Un film muet soviétique, l\'un des tout premiers voyages vers Mars au cinéma.'],
    ['s', 'Mars', '', '2016–2018', 'National Geographic drama mixed with real interviews about settling Mars.', 'Fiction de National Geographic mêlée à de vraies interviews sur l\'installation sur Mars.'],
    ['c', 'My Favorite Martian', 'Mon Martien favori', '1963–1966', 'A Martian crash-lands and lives with a reporter.', 'Un Martien s\'écrase et vit chez un journaliste.'],
    ['j', 'Cowboy Bebop', '', '1998', 'Bounty hunters in a Solar System where Mars is the big city.', 'Des chasseurs de primes dans un Système solaire où Mars est la grande ville.'],
    ['j', 'Aria', '', '2005–2008', 'Mars, made into an ocean world called Aqua, with a new Venice.', 'Mars, devenue un monde d\'océans appelé Aqua, avec une nouvelle Venise.'],
  ],
  Moon: [
    ['f', 'A Trip to the Moon', 'Le Voyage dans la Lune', '1902', 'Georges Méliès fires a capsule from a cannon into the Man in the Moon\'s eye.', 'Georges Méliès tire un obus d\'un canon, droit dans l\'œil de la Lune.'],
    ['b', 'Destination Moon / Explorers on the Moon', 'Objectif Lune / On a marché sur la Lune', '1953–1954', 'Hergé sends Tintin to the Moon, 15 years before Apollo 11.', 'Hergé envoie Tintin sur la Lune, 15 ans avant Apollo 11.'],
    ['f', '2001: A Space Odyssey', '2001, l\'Odyssée de l\'espace', '1968', 'Stanley Kubrick. A strange black monolith is dug up on the Moon.', 'Stanley Kubrick. Un étrange monolithe noir est déterré sur la Lune.'],
    ['f', 'Moon', '', '2009', 'Sam Rockwell, alone on a mining base on the Moon.', 'Sam Rockwell, seul sur une base minière lunaire.'],
    ['s', 'For All Mankind', '', '2019–', 'What if the Soviets had landed on the Moon first?', 'Et si les Soviétiques avaient marché sur la Lune les premiers ?'],
    ['f', 'Moonfall', '', '2022', 'The Moon falls out of its orbit towards Earth.', 'La Lune quitte son orbite et tombe vers la Terre.'],
  ],
  Apollo11: [['f', 'First Man', '', '2018', 'Ryan Gosling as Neil Armstrong, from test flights to the first steps.', 'Ryan Gosling dans le rôle de Neil Armstrong, des vols d\'essai aux premiers pas.']],
  Apollo13: [['f', 'Apollo 13', '', '1995', 'Tom Hanks as Jim Lovell, with Kevin Bacon, Bill Paxton and Ed Harris.', 'Tom Hanks dans le rôle de Jim Lovell, avec Kevin Bacon, Bill Paxton et Ed Harris.']],
  ISS: [
    ['f', 'Gravity', '', '2013', 'Sandra Bullock and George Clooney adrift after debris wrecks their shuttle.', 'Sandra Bullock et George Clooney à la dérive après que des débris ont détruit leur navette.'],
    ['f', 'Life', 'Life : Origine inconnue', '2017', 'A sample from Mars comes alive on the space station.', 'Un échantillon venu de Mars prend vie à bord de la station.'],
    ['j', 'Planetes', '', '2003', 'Crews who clean up space junk in orbit.', 'Des équipes qui ramassent les débris spatiaux en orbite.'],
  ],
  Earth: [
    ['c', '3rd Rock from the Sun', 'Troisième planète après le Soleil', '1996–2001', 'Aliens disguised as a human family study Earth. John Lithgow.', 'Des extraterrestres déguisés en famille humaine étudient la Terre. John Lithgow.'],
    ['c', 'Mork & Mindy', '', '1978–1982', 'Robin Williams as Mork, from the planet Ork.', 'Robin Williams dans le rôle de Mork, venu de la planète Ork.'],
    ['c', 'ALF', '', '1986–1990', 'A furry alien from the planet Melmac lands in a family garage.', 'Un extraterrestre poilu venu de la planète Melmac atterrit dans un garage.'],
    ['f', 'E.T. the Extra-Terrestrial', 'E.T. l\'extra-terrestre', '1982', 'Steven Spielberg. A boy helps a lost alien phone home.', 'Steven Spielberg. Un garçon aide un extraterrestre perdu à « téléphoner maison ».'],
    ['a', 'Solar Opposites', '', '2020–', 'An alien family stranded in American suburbia.', 'Une famille extraterrestre coincée dans une banlieue américaine.'],
  ],
  Jupiter: [
    ['f', '2010: The Year We Make Contact', '2010 : L\'Année du premier contact', '1984', 'The sequel to 2001: Jupiter is turned into a small star.', 'La suite de 2001 : Jupiter est transformée en petite étoile.'],
    ['f', 'Jupiter Ascending', 'Jupiter : le destin de l\'Univers', '2015', 'Mila Kunis and Channing Tatum; a factory hidden inside Jupiter\'s Great Red Spot.', 'Mila Kunis et Channing Tatum ; une usine cachée dans la Grande Tache rouge de Jupiter.'],
  ],
  Europa: [['f', 'Europa Report', '', '2013', 'A found-footage mission looking for life under Europa\'s ice.', 'Une mission filmée « en direct » qui cherche la vie sous la glace d\'Europe.']],
  Io: [['f', 'Outland', 'Outland… loin de la Terre', '1981', 'Sean Connery is the marshal of a mining base on Io.', 'Sean Connery est le marshal d\'une base minière sur Io.']],
  Saturn: [
    ['f', 'Interstellar', '', '2014', 'A wormhole appears near Saturn and leads to another galaxy. Christopher Nolan.', 'Un trou de ver apparaît près de Saturne et mène à une autre galaxie. Christopher Nolan.'],
    ['f', 'Silent Running', 'Silent Running', '1972', 'The last forests, kept in giant domes on ships near Saturn.', 'Les dernières forêts, gardées sous des dômes géants à bord de vaisseaux près de Saturne.'],
    ['f', 'Beetlejuice', '', '1988', 'A joke Saturn: a desert where giant sandworms live.', 'Une Saturne pour rire : un désert où vivent des vers des sables géants.'],
  ],
  Venus: [
    ['f', 'Planet of Storms', 'La Planète des tempêtes', '1962', 'Soviet cosmonauts explore a stormy, prehistoric Venus.', 'Des cosmonautes soviétiques explorent une Vénus orageuse et préhistorique.'],
    ['j', 'Venus Wars', '', '1989', 'Colonists at war on a Venus made livable after a comet strike.', 'Des colons en guerre sur une Vénus rendue habitable après l\'impact d\'une comète.'],
  ],
  Mercury: [['j', 'Mobile Suit Gundam: The Witch from Mercury', 'Mobile Suit Gundam : The Witch from Mercury', '2022–2023', 'A girl raised in a mining town on Mercury goes to a school in space.', 'Une fille élevée dans une ville minière de Mercure part étudier dans l\'espace.']],
  Sun: [['f', 'Sunshine', '', '2007', 'Danny Boyle. A crew flies a bomb to restart the dying Sun.', 'Danny Boyle. Un équipage apporte une bombe pour relancer le Soleil mourant.']],
  Uranus: [['f', 'Journey to the Seventh Planet', '', '1962', 'Astronauts reach Uranus and find a world that reads their minds.', 'Des astronautes atteignent Uranus et trouvent un monde qui lit dans leurs pensées.']],
  Neptune: [
    ['f', 'Ad Astra', '', '2019', 'Brad Pitt travels to Neptune to find his father. Stops on the Moon and Mars too.', 'Brad Pitt part vers Neptune retrouver son père, avec des escales sur la Lune et Mars.'],
    ['f', 'Event Horizon', 'Event Horizon : le vaisseau de l\'au-delà', '1997', 'A lost ship reappears in orbit around Neptune.', 'Un vaisseau disparu réapparaît en orbite autour de Neptune.'],
  ],
  Ceres: [
    ['s', 'The Expanse', '', '2015–2022', 'Earth, Mars and the Belt at odds; Ceres is a busy station town.', 'La Terre, Mars et la Ceinture en conflit ; Cérès est une ville-station animée.'],
    ['b', 'The Little Prince', 'Le Petit Prince', '1943', 'Saint-Exupéry\'s prince lives on asteroid B 612. A film version came out in 2015.', 'Le prince de Saint-Exupéry vit sur l\'astéroïde B 612. Un film est sorti en 2015.'],
  ],
  Comet67P: [
    ['f', 'Armageddon', '', '1998', 'Bruce Willis and a team of drillers land on an asteroid heading for Earth.', 'Bruce Willis et une équipe de foreurs se posent sur un astéroïde qui fonce vers la Terre.'],
    ['f', 'Deep Impact', '', '1998', 'A comet on a collision course with Earth.', 'Une comète sur une trajectoire de collision avec la Terre.'],
    ['f', 'Don\'t Look Up', 'Don\'t Look Up : Déni cosmique', '2021', 'Leonardo DiCaprio and Jennifer Lawrence try to warn the world about a comet.', 'Leonardo DiCaprio et Jennifer Lawrence tentent d\'alerter le monde sur une comète.'],
  ],
  SgrA: [
    ['f', 'Interstellar', '', '2014', 'Gargantua, a spinning black hole, drawn with help from physicist Kip Thorne.', 'Gargantua, un trou noir en rotation, dessiné avec l\'aide du physicien Kip Thorne.'],
    ['f', 'The Black Hole', 'Le Trou noir', '1979', 'Disney\'s crew finds a lost ship parked at the edge of a black hole.', 'L\'équipage de Disney trouve un vaisseau perdu au bord d\'un trou noir.'],
  ],
  AlphaCen: [
    ['f', 'Avatar', '', '2009, 2022, 2025', 'Pandora is a moon of a giant planet around Alpha Centauri A.', 'Pandora est une lune d\'une planète géante autour d\'Alpha du Centaure A.'],
    ['s', 'Lost in Space', 'Perdus dans l\'espace', '1965 & 2018', 'The Robinson family set off for Alpha Centauri and get lost.', 'La famille Robinson part vers Alpha du Centaure et se perd.'],
    ['s', '3 Body Problem', '', '2024–', 'Netflix. The San-Ti aliens are on their way from Alpha Centauri.', 'Netflix. Les extraterrestres San-Ti arrivent d\'Alpha du Centaure.'],
  ],
  TauCeti: [
    ['f', 'Project Hail Mary', '', '2026', 'Ryan Gosling flies to Tau Ceti to save the Sun, and makes an alien friend, Rocky. By the author of The Martian.', 'Ryan Gosling part vers Tau Ceti pour sauver le Soleil et se fait un ami extraterrestre, Rocky. Par l\'auteur de Seul sur Mars.'],
    ['f', 'Barbarella', '', '1968', 'Jane Fonda in a film based on Jean-Claude Forest\'s French comic; she crash-lands on a planet of Tau Ceti.', 'Jane Fonda, d\'après la BD de Jean-Claude Forest ; elle s\'écrase sur une planète de Tau Ceti.'],
  ],
  Vega: [['f', 'Contact', '', '1997', 'Jodie Foster picks up a radio message from the star Vega.', 'Jodie Foster capte un message radio venu de l\'étoile Véga.']],
  Betelgeuse: [['f', 'The Hitchhiker\'s Guide to the Galaxy', 'H2G2 : le guide du voyageur galactique', '2005', 'Ford Prefect comes from a small planet near Betelgeuse. First a 1978 radio series.', 'Ford Prefect vient d\'une petite planète près de Bételgeuse. D\'abord une série radio en 1978.']],
};
// worlds that only exist on screen
const FICTION = [
  ['f', 'Star Wars', '', '1977–', 'Tatooine has two suns. Real planets like that exist: astronomers call them circumbinary planets.', 'Tatooine a deux soleils. Il existe de vraies planètes comme ça : on les dit circumbinaires.'],
  ['f', 'Dune', '', '1984, 2021, 2024', 'Arrakis, the desert planet of spice and giant sandworms.', 'Arrakis, la planète désert de l\'épice et des vers géants.'],
  ['s', 'Star Trek', '', '1966–', 'Vulcan, Mr Spock\'s home world, and hundreds of others.', 'Vulcain, la planète de M. Spock, et des centaines d\'autres.'],
  ['s', 'Doctor Who', '', '1963–', 'Gallifrey, home of the Time Lords, and many more.', 'Gallifrey, la planète des Seigneurs du Temps, et bien d\'autres.'],
  ['f', 'Forbidden Planet', 'Planète interdite', '1956', 'Altair IV, with Robby the Robot and a young Leslie Nielsen.', 'Altaïr IV, avec Robby le robot et un jeune Leslie Nielsen.'],
  ['a', 'Fantastic Planet', 'La Planète sauvage', '1973', 'René Laloux\'s French cartoon: tiny humans on the planet Ygam.', 'Le film d\'animation de René Laloux : de minuscules humains sur la planète Ygam.'],
  ['f', 'The Fifth Element', 'Le Cinquième Élément', '1997', 'Luc Besson, with Bruce Willis; a holiday on Fhloston Paradise.', 'Luc Besson, avec Bruce Willis ; des vacances sur Fhloston Paradise.'],
  ['f', 'Valerian and the City of a Thousand Planets', 'Valérian et la Cité des mille planètes', '2017', 'Luc Besson, from the French comic by Christin and Mézières.', 'Luc Besson, d\'après la BD de Christin et Mézières.'],
  ['a', 'Ulysses 31', 'Ulysse 31', '1981', 'French–Japanese cartoon: Homer\'s Odyssey retold in space.', 'Dessin animé franco-japonais : l\'Odyssée d\'Homère racontée dans l\'espace.'],
  ['a', 'Once Upon a Time… Space', 'Il était une fois… l\'Espace', '1982', 'Albert Barillé\'s French cartoon about a galaxy at war and in peace.', 'Le dessin animé d\'Albert Barillé, entre guerre et paix dans la galaxie.'],
  ['j', 'UFO Robo Grendizer', 'Goldorak', '1975', 'Duke Fleed (Actarus) flees his destroyed planet; a huge hit in France from 1978.', 'Actarus fuit sa planète détruite ; un immense succès en France dès 1978.'],
  ['j', 'Space Pirate Captain Harlock', 'Albator', '1978', 'Leiji Matsumoto\'s rebel captain and his ship, the Arcadia.', 'Le capitaine rebelle de Leiji Matsumoto et son vaisseau, l\'Arcadia.'],
  ['a', 'Futurama', '', '1999–', 'A delivery crew in the year 3000, visiting Omicron Persei 8 and more.', 'Des livreurs en l\'an 3000, d\'Omicron Persei 8 à bien d\'autres planètes.'],
  ['a', 'Rick and Morty', '', '2013–', 'A mad scientist and his grandson hop between planets and dimensions.', 'Un savant fou et son petit-fils sautent de planète en dimension.'],
  ['f', 'Guardians of the Galaxy', 'Les Gardiens de la Galaxie', '2014, 2017, 2023', 'Xandar, Knowhere, Ego the living planet…', 'Xandar, Knowhere, Ego la planète vivante…'],
  ['f', 'Mickey 17', '', '2025', 'Robert Pattinson on the icy colony world Niflheim.', 'Robert Pattinson sur Niflheim, une colonie glacée.'],
];

// ---------- the "On screen" block at the bottom of a place's card ----------
const row = (e, F) => `<div style="margin:5px 0"><b style="display:inline;font-size:13px">${ICON[e[0]]} ${F && e[2] ? e[2] : e[1]}</b> <span style="color:#ffd27a;font-size:12px">· ${e[3]}</span><br><span style="opacity:.8;font-size:12px">${F ? e[5] : e[4]}</span></div>`;
const block = key => {
  const L = M[key]; if (!L) return null; const F = fr();
  const d = document.createElement('details'); d.className = 'onscreen'; d.style.cssText = 'margin-top:8px;border-top:1px solid rgba(140,160,255,.18);padding-top:6px';
  d.innerHTML = `<summary style="cursor:pointer;color:#9fd0ff">🎬 ${F ? 'À l\'écran' : 'On screen'} (${L.length})</summary><div style="max-height:min(34vh,260px);overflow:auto">${L.map(e => row(e, F)).join('')}</div>`;
  return d;
};
{
  const prev = SS.onFocus;
  SS.onFocus = key => {
    prev(key);
    const el = $('info'); if (el.style.display === 'none' || !M[key]) return;
    el.querySelector('.onscreen')?.remove();
    const b = block(key); const sh = el.querySelector('.share'); sh ? el.insertBefore(b, sh) : el.appendChild(b);
  };
}

// ---------- a browse card: everything, grouped by place ----------
const NAME = { AlphaCen: ['Alpha Centauri', 'Alpha du Centaure'], SgrA: ['Black holes', 'Trous noirs'], Comet67P: ['Comets & asteroids', 'Comètes et astéroïdes'], Ceres: ['The asteroid belt', 'La ceinture d\'astéroïdes'],
  ISS: ['In orbit around Earth', 'En orbite autour de la Terre'], Earth: ['Aliens visiting Earth', 'Des extraterrestres sur Terre'], Apollo11: ['Apollo 11', 'Apollo 11'], Apollo13: ['Apollo 13', 'Apollo 13'] };
const html = () => {
  const F = fr(), nm = k => NAME[k]?.[F ? 1 : 0] || (SS.tr ? SS.tr(INFO[k]?.name || k) : INFO[k]?.name || k);
  const n = Object.values(M).reduce((s, l) => s + l.length, 0) + FICTION.length;
  return `${F ? `${n} films, séries, sitcoms, dessins animés et animes. Touchez un lieu pour y aller.` : `${n} films, series, sitcoms, cartoons and anime. Tap a place to fly there.`}
    <div style="margin:6px 0"><a href="#" id="filmQuiz" style="color:#ffd27a">${F ? '▶ Jouer au quiz cinéma et séries' : '▶ Play the film & TV quiz'}</a></div>
    <div style="max-height:min(52vh,420px);overflow:auto">${Object.entries(M).map(([k, L]) => `<div style="border-top:1px solid rgba(140,160,255,.15);padding:5px 0"><a href="#" class="osgo" data-go="${k}" style="color:#9fd0ff;font-weight:600">🪐 ${nm(k)} ›</a>${L.map(e => row(e, F)).join('')}</div>`).join('')}
    <div style="border-top:1px solid rgba(140,160,255,.15);padding:5px 0"><b style="display:inline;color:#9fd0ff">✨ ${F ? 'Mondes imaginaires' : 'Made-up worlds'}</b>${FICTION.map(e => row(e, F)).join('')}</div></div>
    <div style="font-size:11px;opacity:.6;margin-top:6px">${ICON.f} ${TYPE.f[F ? 1 : 0]} · ${ICON.s} ${TYPE.s[F ? 1 : 0]} · ${ICON.c} ${TYPE.c[F ? 1 : 0]} · ${ICON.a} ${TYPE.a[F ? 1 : 0]} · ${ICON.j} ${TYPE.j[F ? 1 : 0]} · ${ICON.b} ${TYPE.b[F ? 1 : 0]}</div>`;
};
bodies.OnScreen = { obj: SS.bodies.Sun.obj, radius: 3, view: 60 };
info('OnScreen', '🎬 Space on screen', 'Films, series & anime', 'set on real places in this map, and a few made-up ones', html());

// ---------- film & TV quiz ----------
const FQ = [ // fly to, question EN, [right, wrong, wrong], question FR, [right, wrong, wrong]
  ['Mars', 'In The Martian, what does Mark Watney grow to survive on Mars?', ['Potatoes', 'Rice', 'Apples'], 'Dans Seul sur Mars, que fait pousser Mark Watney pour survivre ?', ['Des pommes de terre', 'Du riz', 'Des pommes']],
  ['Saturn', 'In Interstellar, where does the wormhole appear?', ['Near Saturn', 'Near Mars', 'Inside the Sun'], 'Dans Interstellar, où apparaît le trou de ver ?', ['Près de Saturne', 'Près de Mars', 'Dans le Soleil']],
  ['AlphaCen', 'Avatar\'s Pandora is a moon in which real star system?', ['Alpha Centauri', 'Sirius', 'Vega'], 'Pandora, dans Avatar, est une lune de quel vrai système stellaire ?', ['Alpha du Centaure', 'Sirius', 'Véga']],
  ['Vega', 'In Contact (1997), the alien message comes from which star?', ['Vega', 'Betelgeuse', 'Polaris'], 'Dans Contact (1997), le message extraterrestre vient de quelle étoile ?', ['Véga', 'Bételgeuse', 'L\'étoile polaire']],
  ['Betelgeuse', 'In The Hitchhiker\'s Guide to the Galaxy, Ford Prefect comes from near which star?', ['Betelgeuse', 'Proxima Centauri', 'Sirius'], 'Dans H2G2, Ford Prefect vient d\'une planète près de quelle étoile ?', ['Bételgeuse', 'Proxima du Centaure', 'Sirius']],
  ['Moon', 'In Méliès\' A Trip to the Moon (1902), what lands in the Moon\'s eye?', ['A capsule fired from a cannon', 'A comet', 'A hot-air balloon'], 'Dans Le Voyage dans la Lune de Méliès (1902), qu\'est-ce qui atterrit dans l\'œil de la Lune ?', ['Un obus tiré par un canon', 'Une comète', 'Une montgolfière']],
  ['Apollo13', 'Who played astronaut Jim Lovell in Apollo 13 (1995)?', ['Tom Hanks', 'Kevin Bacon', 'Ed Harris'], 'Qui jouait l\'astronaute Jim Lovell dans Apollo 13 (1995) ?', ['Tom Hanks', 'Kevin Bacon', 'Ed Harris']],
  ['Apollo11', 'Who played Neil Armstrong in First Man (2018)?', ['Ryan Gosling', 'Matt Damon', 'Chris Pratt'], 'Qui jouait Neil Armstrong dans First Man (2018) ?', ['Ryan Gosling', 'Matt Damon', 'Chris Pratt']],
  ['TauCeti', 'In Project Hail Mary (2026), Ryland Grace travels to which star?', ['Tau Ceti', 'Alpha Centauri', 'Vega'], 'Dans Project Hail Mary (2026), Ryland Grace part vers quelle étoile ?', ['Tau Ceti', 'Alpha du Centaure', 'Véga']],
  ['Earth', 'Which planet does ALF come from?', ['Melmac', 'Ork', 'Mongo'], 'De quelle planète vient ALF ?', ['Melmac', 'Ork', 'Mongo']],
  ['Io', 'In Outland (1981), Sean Connery keeps order on a mining base on…', ['Io, a moon of Jupiter', 'Mars', 'Titan, a moon of Saturn'], 'Dans Outland (1981), Sean Connery fait régner l\'ordre sur une base minière sur…', ['Io, une lune de Jupiter', 'Mars', 'Titan, une lune de Saturne']],
  ['Ceres', 'Where does the Little Prince live?', ['On asteroid B 612', 'On Mars', 'On the Moon'], 'Où habite le Petit Prince ?', ['Sur l\'astéroïde B 612', 'Sur Mars', 'Sur la Lune']],
  ['ISS', 'In Gravity (2013), what wrecks the astronauts\' space shuttle?', ['Space debris', 'A meteor shower', 'An alien ship'], 'Dans Gravity (2013), qu\'est-ce qui détruit la navette des astronautes ?', ['Des débris spatiaux', 'Une pluie de météores', 'Un vaisseau extraterrestre']],
  ['Comet67P', 'In Armageddon (1998), Bruce Willis and his crew land on…', ['an asteroid', 'Mars', 'the Moon'], 'Dans Armageddon (1998), Bruce Willis et son équipe se posent sur…', ['un astéroïde', 'Mars', 'la Lune']],
  ['Sun', 'In Sunshine (2007), why does the crew fly to the Sun?', ['To restart it with a bomb', 'To mine it', 'To land on Mercury'], 'Dans Sunshine (2007), pourquoi l\'équipage vole-t-il vers le Soleil ?', ['Pour le relancer avec une bombe', 'Pour l\'exploiter', 'Pour se poser sur Mercure']],
  ['Neptune', 'In Ad Astra (2019), Brad Pitt travels to which planet to find his father?', ['Neptune', 'Jupiter', 'Venus'], 'Dans Ad Astra (2019), vers quelle planète Brad Pitt part-il retrouver son père ?', ['Neptune', 'Jupiter', 'Vénus']],
];
const quiz = () => SS.more.quiz?.start(FQ);
{
  const prev = SS.onFocus;
  SS.onFocus = key => {
    if (key === 'OnScreen') { INFO.OnScreen.fact = html(); if (SS.more.INFO_EN?.OnScreen) SS.more.INFO_EN.OnScreen.fact = INFO.OnScreen.fact; }
    prev(key);
    if (key !== 'OnScreen') return;
    for (const a of $('info').querySelectorAll('.osgo')) a.onclick = e => { e.preventDefault(); go(a.dataset.go); };
    const q = $('filmQuiz'); if (q) q.onclick = e => { e.preventDefault(); quiz(); };
  };
}
// a few film questions also join the everyday space quiz
SS.more.quiz?.Q?.push(...FQ.slice(0, 6));
special.FilmQuiz = quiz;
SS.more.media = { M, FICTION, FQ };

// ---------- menu ----------
{
  const og = document.createElement('optgroup'); og.label = '🎬 Space on screen';
  for (const [k, t] of [['OnScreen', '🎬 Films, series & anime'], ['FilmQuiz', '▶ Film & TV quiz']]) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); }
  const after = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === '🧑‍🚀 Astronauts'); after ? after.after(og) : focusSel.appendChild(og);
}
SS.i18nAdd?.({
  ui: { '🎬 Space on screen': '🎬 L\'espace à l\'écran', '🎬 Films, series & anime': '🎬 Films, séries et animes', '▶ Film & TV quiz': '▶ Quiz cinéma et séries' },
  name: { '🎬 Space on screen': '🎬 L\'espace à l\'écran' },
  cat: { 'Films, series & anime': 'Films, séries et animes' },
  dist: { 'set on real places in this map, and a few made-up ones': 'sur de vrais lieux de cette carte, et quelques mondes imaginaires' },
});
await import('./planetinfo.js' + new URL(import.meta.url).search);
