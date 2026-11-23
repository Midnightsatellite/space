// =====================================================================
// Space today: one anniversary or fact for each day, shown on the start screen
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';

// 'MM-DD': [fly to, year, EN headline, EN text, FR headline, FR text]
const DAYS = {
  '01-01': ['Ceres', 1801, 'Ceres is discovered', 'Giuseppe Piazzi spotted the first object ever found in the asteroid belt. Today we call Ceres a dwarf planet.', 'Découverte de Cérès', 'Giuseppe Piazzi repère le premier objet jamais trouvé dans la ceinture d\'astéroïdes. Aujourd\'hui, Cérès est une planète naine.'],
  '01-04': ['MS2_Spirit', 2004, 'Spirit lands on Mars', 'The rover was meant to work for 90 days. It kept exploring for more than six years.', 'Spirit se pose sur Mars', 'Le rover devait fonctionner 90 jours. Il a exploré pendant plus de six ans.'],
  '01-07': ['Jupiter', 1610, 'Galileo sees Jupiter\'s moons', 'Through his small telescope, Galileo found moons circling another world: proof that not everything goes around Earth.', 'Galilée voit les lunes de Jupiter', 'Avec sa petite lunette, Galilée découvre des lunes autour d\'un autre monde : la preuve que tout ne tourne pas autour de la Terre.'],
  '01-09': ['Phobetor', 1992, 'The first exoplanets are announced', 'Planets were found circling a pulsar, the dead core of an exploded star. Two of them are now called Poltergeist and Phobetor.', 'Annonce des premières exoplanètes', 'Des planètes sont découvertes autour d\'un pulsar, le cœur mort d\'une étoile explosée. Deux d\'entre elles s\'appellent aujourd\'hui Poltergeist et Phobetor.'],
  '01-14': ['Titan', 2005, 'Huygens lands on Titan', 'The European probe touched down on Saturn\'s largest moon: the farthest landing ever made.', 'Huygens se pose sur Titan', 'La sonde européenne atterrit sur la plus grande lune de Saturne : l\'atterrissage le plus lointain jamais réussi.'],
  '01-25': ['MS2_Opportunity', 2004, 'Opportunity lands on Mars', 'Planned for 90 days, Opportunity drove more than a marathon and worked for almost 15 years.', 'Opportunity se pose sur Mars', 'Prévu pour 90 jours, Opportunity a roulé plus qu\'un marathon et travaillé près de 15 ans.'],
  '02-07': ['Shuttle', 1984, 'The first untethered spacewalk', 'Bruce McCandless flew freely away from the Space Shuttle with a jet backpack, attached to nothing.', 'Première sortie sans câble', 'Bruce McCandless s\'éloigne librement de la navette spatiale avec un sac à réaction, sans aucune attache.'],
  '02-12': ['Eros', 2001, 'NEAR lands on an asteroid', 'NEAR Shoemaker was built only to orbit Eros, yet it touched down gently on it: the first landing on an asteroid.', 'NEAR se pose sur un astéroïde', 'NEAR Shoemaker devait seulement tourner autour d\'Éros, mais il s\'y est posé en douceur : le premier atterrissage sur un astéroïde.'],
  '02-14': ['PaleBlueDot', 1990, 'The Pale Blue Dot', 'Voyager 1 turned around and photographed Earth from about 6 billion km away: a tiny speck in a sunbeam.', 'Le point bleu pâle', 'Voyager 1 se retourne et photographie la Terre à environ 6 milliards de km : un minuscule point dans un rayon de soleil.'],
  '02-15': ['Earth', 2013, 'The Chelyabinsk meteor', 'A space rock about 20 m wide exploded over Russia, brighter than the Sun for a moment.', 'Le météore de Tcheliabinsk', 'Un rocher spatial d\'environ 20 m explose au-dessus de la Russie, un instant plus brillant que le Soleil.'],
  '02-18': ['Perseverance', 2021, 'Perseverance lands on Mars', 'The rover landed in Jezero Crater with the Ingenuity helicopter tucked under its belly. On this day in 1930, Pluto was also discovered.', 'Perseverance se pose sur Mars', 'Le rover atterrit dans le cratère Jezero, avec l\'hélicoptère Ingenuity sous le ventre. Ce même jour, en 1930, Pluton était découverte.'],
  '02-20': ['Earth', 1962, 'John Glenn orbits Earth', 'He became the first American to go around Earth, three times in under five hours.', 'John Glenn tourne autour de la Terre', 'Il devient le premier Américain à faire le tour de la Terre, trois fois en moins de cinq heures.'],
  '03-02': ['Pioneer10', 1972, 'Pioneer 10 launches', 'It became the first spacecraft to cross the asteroid belt and fly past Jupiter.', 'Lancement de Pioneer 10', 'Ce sera le premier engin à traverser la ceinture d\'astéroïdes et à survoler Jupiter.'],
  '03-13': ['Uranus', 1781, 'Uranus is discovered', 'William Herschel found the first planet unknown to the ancients, from his garden in Bath.', 'Découverte d\'Uranus', 'William Herschel découvre, depuis son jardin à Bath, la première planète inconnue des Anciens.'],
  '03-18': ['Earth', 1965, 'The first spacewalk', 'Alexei Leonov floated outside his capsule for about 12 minutes, and his suit swelled so much he struggled to get back in.', 'La première sortie dans l\'espace', 'Alexeï Leonov flotte hors de sa capsule environ 12 minutes ; sa combinaison gonfle tant qu\'il peine à rentrer.'],
  '03-23': ['Mir', 2001, 'Mir comes home', 'After 15 years in orbit, the Mir space station was steered down into the Pacific Ocean.', 'Mir revient sur Terre', 'Après 15 ans en orbite, la station Mir est guidée vers l\'océan Pacifique.'],
  '04-10': ['M87', 2019, 'The first photo of a black hole', 'The Event Horizon Telescope showed the glowing ring around the giant black hole in galaxy M87.', 'La première photo d\'un trou noir', 'L\'Event Horizon Telescope dévoile l\'anneau lumineux autour du trou noir géant de la galaxie M87.'],
  '04-12': ['LS_Baikonur', 1961, 'Yuri Gagarin, first human in space', 'He went once around Earth in 108 minutes. Twenty years later to the day, the first Space Shuttle launched.', 'Youri Gagarine, premier humain dans l\'espace', 'Il fait le tour de la Terre en 108 minutes. Vingt ans plus tard, jour pour jour, la première navette spatiale décolle.'],
  '04-19': ['Perseverance', 2021, 'Ingenuity flies on Mars', 'The little helicopter made the first powered flight on another planet, rising 3 metres for about 40 seconds.', 'Ingenuity vole sur Mars', 'Le petit hélicoptère réussit le premier vol motorisé sur une autre planète : 3 mètres de haut pendant environ 40 secondes.'],
  '04-24': ['Hubble', 1990, 'Hubble launches', 'The Space Shuttle Discovery carried the Hubble Space Telescope into orbit. It is still sending pictures today.', 'Lancement de Hubble', 'La navette Discovery place le télescope spatial Hubble en orbite. Il envoie encore des images aujourd\'hui.'],
  '05-05': ['Earth', 1961, 'Alan Shepard, first American in space', 'His flight lasted just 15 minutes, up and back down.', 'Alan Shepard, premier Américain dans l\'espace', 'Son vol ne dure que 15 minutes, aller et retour.'],
  '05-14': ['Skylab', 1973, 'Skylab launches', 'America\'s first space station was launched on the last Saturn V rocket ever flown.', 'Lancement de Skylab', 'La première station spatiale américaine part sur la dernière fusée Saturn V jamais lancée.'],
  '05-25': ['Dragon', 2012, 'A private spacecraft reaches the ISS', 'SpaceX\'s Dragon became the first company-built spacecraft to be berthed at the space station.', 'Un vaisseau privé rejoint l\'ISS', 'Le Dragon de SpaceX devient le premier vaisseau construit par une entreprise amarré à la station.'],
  '05-30': ['Dragon', 2020, 'Crew Dragon carries its first crew', 'Doug Hurley and Bob Behnken launched to the ISS: the first crew in a privately built spaceship.', 'Premier équipage pour Crew Dragon', 'Doug Hurley et Bob Behnken partent vers l\'ISS : le premier équipage dans un vaisseau construit par une entreprise.'],
  '06-16': ['Earth', 1963, 'Valentina Tereshkova, first woman in space', 'She spent almost three days in orbit and went around Earth 48 times.', 'Valentina Terechkova, première femme dans l\'espace', 'Elle passe près de trois jours en orbite et fait 48 fois le tour de la Terre.'],
  '06-18': ['Shuttle', 1983, 'Sally Ride flies to space', 'She became the first American woman in space, aboard the Space Shuttle Challenger.', 'Sally Ride part dans l\'espace', 'Elle devient la première Américaine dans l\'espace, à bord de la navette Challenger.'],
  '06-30': ['Earth', 1908, 'The Tunguska event', 'Something from space exploded over Siberia and flattened about 80 million trees. Today is World Asteroid Day.', 'L\'événement de la Toungouska', 'Un objet venu de l\'espace explose au-dessus de la Sibérie et couche environ 80 millions d\'arbres. C\'est aujourd\'hui la Journée mondiale des astéroïdes.'],
  '07-01': ['Cassini', 2004, 'Cassini arrives at Saturn', 'It spent 13 years exploring the planet, its rings and its moons.', 'Cassini arrive à Saturne', 'La sonde explore la planète, ses anneaux et ses lunes pendant 13 ans.'],
  '07-04': ['Mars', 1997, 'Pathfinder lands on Mars', 'It bounced down on airbags and released Sojourner, the first rover on another planet.', 'Pathfinder se pose sur Mars', 'Il rebondit sur ses airbags et libère Sojourner, le premier rover sur une autre planète.'],
  '07-12': ['JWST', 2022, 'Webb\'s first pictures', 'The James Webb Space Telescope showed its first full-colour images of the deep universe.', 'Les premières images de Webb', 'Le télescope spatial James Webb dévoile ses premières images en couleur de l\'univers lointain.'],
  '07-14': ['Pluto', 2015, 'New Horizons flies past Pluto', 'After nine years of travel, it showed us Pluto\'s giant heart-shaped plain.', 'New Horizons survole Pluton', 'Après neuf ans de voyage, la sonde nous montre la grande plaine en forme de cœur de Pluton.'],
  '07-16': ['Apollo11', 1969, 'Apollo 11 launches', 'Armstrong, Aldrin and Collins left Earth on a Saturn V, heading for the Moon.', 'Lancement d\'Apollo 11', 'Armstrong, Aldrin et Collins quittent la Terre sur une Saturn V, direction la Lune.'],
  '07-20': ['MS_A11', 1969, 'First steps on the Moon', 'Neil Armstrong and Buzz Aldrin landed in the Sea of Tranquillity. Seven years later to the day, Viking 1 landed on Mars.', 'Premiers pas sur la Lune', 'Neil Armstrong et Buzz Aldrin se posent dans la mer de la Tranquillité. Sept ans plus tard, jour pour jour, Viking 1 se pose sur Mars.'],
  '08-06': ['MS2_Curiosity', 2012, 'Curiosity lands on Mars', 'A rocket "sky crane" lowered the car-sized rover on ropes into Gale Crater.', 'Curiosity se pose sur Mars', 'Une « grue volante » à fusées dépose le rover, grand comme une voiture, au bout de câbles dans le cratère Gale.'],
  '08-20': ['Voyager2', 1977, 'Voyager 2 launches', 'It is still the only spacecraft to have visited Uranus and Neptune.', 'Lancement de Voyager 2', 'C\'est encore le seul engin à avoir visité Uranus et Neptune.'],
  '08-24': ['Pluto', 2006, 'Pluto becomes a dwarf planet', 'Astronomers decided on a new definition of "planet", and the Solar System went from nine planets to eight.', 'Pluton devient une planète naine', 'Les astronomes adoptent une nouvelle définition de « planète » : le Système solaire passe de neuf à huit planètes.'],
  '08-25': ['Voyager1', 2012, 'Voyager 1 reaches interstellar space', 'It became the first human-made object to leave the bubble of the Sun\'s wind.', 'Voyager 1 atteint l\'espace interstellaire', 'C\'est le premier objet humain à sortir de la bulle du vent solaire.'],
  '09-05': ['Voyager1', 1977, 'Voyager 1 launches', 'It now travels farther from Earth than anything else humans have built, carrying a golden record.', 'Lancement de Voyager 1', 'Il est aujourd\'hui plus loin de la Terre que tout autre objet humain, avec son disque d\'or à bord.'],
  '09-14': ['OBS_LIGOH', 2015, 'Gravitational waves are detected', 'LIGO felt space itself ripple, from two black holes that merged 1.3 billion years ago.', 'Détection des ondes gravitationnelles', 'LIGO capte une vibration de l\'espace lui-même, venue de deux trous noirs fusionnés il y a 1,3 milliard d\'années.'],
  '09-15': ['Cassini', 2017, 'Cassini\'s grand finale', 'Out of fuel, Cassini dived into Saturn, sending data until the very end.', 'Le grand final de Cassini', 'À court de carburant, Cassini plonge dans Saturne en envoyant des données jusqu\'au bout.'],
  '09-23': ['Neptune', 1846, 'Neptune is discovered', 'Johann Galle found it within one degree of where Urbain Le Verrier\'s maths said it would be.', 'Découverte de Neptune', 'Johann Galle la trouve à moins d\'un degré de l\'endroit calculé par Urbain Le Verrier.'],
  '10-04': ['LS_Baikonur', 1957, 'Sputnik, the first satellite', 'A metal ball the size of a beach ball went into orbit, beeping, and the Space Age began.', 'Spoutnik, le premier satellite', 'Une boule de métal grosse comme un ballon de plage se met en orbite en émettant des bips : l\'ère spatiale commence.'],
  '10-06': ['Peg51b', 1995, 'A planet around a Sun-like star', 'Michel Mayor and Didier Queloz announced 51 Pegasi b, a giant planet hugging its star. It won them a Nobel Prize.', 'Une planète autour d\'une étoile comme le Soleil', 'Michel Mayor et Didier Queloz annoncent 51 Pegasi b, une planète géante collée à son étoile. Un prix Nobel à la clé.'],
  '11-02': ['ISS', 2000, 'The first crew moves into the ISS', 'People have lived on the space station ever since, without a single day empty.', 'Le premier équipage s\'installe dans l\'ISS', 'Depuis, la station est habitée sans interruption, pas un seul jour vide.'],
  '11-12': ['Comet67P', 2014, 'Philae lands on a comet', 'Rosetta\'s little lander bounced twice before stopping on comet 67P: the first landing on a comet.', 'Philae se pose sur une comète', 'Le petit atterrisseur de Rosetta rebondit deux fois avant de s\'arrêter sur la comète 67P : le premier atterrissage sur une comète.'],
  '11-14': ['Mars', 1971, 'Mariner 9 orbits Mars', 'It became the first spacecraft to orbit another planet, and waited out a dust storm that covered the whole planet.', 'Mariner 9 en orbite autour de Mars', 'C\'est le premier engin en orbite autour d\'une autre planète ; il attend la fin d\'une tempête de poussière qui couvre toute la planète.'],
  '11-16': ['OrionCraft', 2022, 'Artemis I launches', 'NASA\'s Moon rocket sent an empty Orion capsule around the Moon and back, ready for crews.', 'Lancement d\'Artemis I', 'La fusée lunaire de la NASA envoie une capsule Orion vide autour de la Lune et retour, pour préparer les vols habités.'],
  '11-20': ['ISS', 1998, 'The first piece of the ISS', 'The Zarya module launched: the first building block of the International Space Station.', 'La première pièce de l\'ISS', 'Le module Zarya décolle : la première brique de la Station spatiale internationale.'],
  '11-26': ['MS2_InSight', 2018, 'InSight lands on Mars', 'It listened to the inside of Mars and recorded more than 1,300 marsquakes.', 'InSight se pose sur Mars', 'Il écoute l\'intérieur de Mars et enregistre plus de 1 300 séismes martiens.'],
  '12-07': ['Earth', 1972, 'The Blue Marble photo', 'The Apollo 17 crew took one of the most famous pictures ever: the whole Earth, fully lit.', 'La photo de la Bille bleue', 'L\'équipage d\'Apollo 17 prend l\'une des photos les plus célèbres : la Terre entière, en pleine lumière.'],
  '12-14': ['MS_A17', 1972, 'The last moonwalk (so far)', 'Gene Cernan was the last person to step off the Moon. No one has walked there since.', 'La dernière marche sur la Lune (pour l\'instant)', 'Gene Cernan est le dernier à quitter le sol lunaire. Personne n\'y a marché depuis.'],
  '12-24': ['Apollo8Trip', 1968, 'Earthrise', 'Apollo 8 became the first crew to circle the Moon, and photographed Earth rising over its horizon.', 'Lever de Terre', 'Apollo 8 est le premier équipage à tourner autour de la Lune, et photographie la Terre qui se lève à l\'horizon.'],
  '12-25': ['JWST', 2021, 'Webb launches', 'The James Webb Space Telescope left on an Ariane 5 rocket from French Guiana.', 'Lancement de Webb', 'Le télescope spatial James Webb décolle sur une Ariane 5 depuis la Guyane.'],
};

const css = document.createElement('style');
css.textContent = `#today{position:fixed;left:50%;top:14px;transform:translateX(-50%) translateY(-12px);width:min(480px,92vw);z-index:16;opacity:0;pointer-events:none;transition:opacity .5s,transform .5s;
  background:rgba(12,16,34,.94);border:1px solid rgba(255,210,122,.35);border-radius:14px;padding:11px 14px;color:#e8ecff;font:14px/1.45 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.4)}
  #today.on{opacity:1;pointer-events:auto;transform:translateX(-50%)}
  #today .lab{font-size:11px;letter-spacing:.08em;color:#ffd27a;text-transform:uppercase}
  #today .hook{font-size:16px;font-weight:600;color:#fff;margin:2px 26px 3px 0}
  #today .x{position:absolute;right:8px;top:7px;background:none;border:0;color:#aab;font-size:16px;cursor:pointer}
  #today .row{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
  body:not(.phone) #today{left:calc(50% + 215px);width:min(460px,calc(100vw - 500px))}
  body.phone #today{top:calc(10px + env(safe-area-inset-top))}
  body.doc #today,body.photo #today,body.cinema #today,body.lightride #today{display:none!important}`;
document.head.appendChild(css);

const box = document.createElement('div'); box.id = 'today';
box.innerHTML = '<button class="x" type="button" id="todayX">✕</button><div class="lab"></div><div class="hook"></div><div class="txt"></div><div class="row"><button type="button" id="todayGo"></button></div>';
document.body.appendChild(box);

const key = d => String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
let fly = null;
function fill() {
  const F = fr(), d = new Date(), e = DAYS[key(d)];
  const date = d.toLocaleDateString(F ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long' });
  let lab, hook, txt;
  if (e) {
    const ago = d.getFullYear() - e[1];
    lab = F ? `L'espace aujourd'hui · ${date} ${e[1]} · il y a ${ago} ans` : `Space today · ${date} ${e[1]} · ${ago} years ago`;
    [fly, hook, txt] = [e[0], F ? e[4] : e[2], F ? e[5] : e[3]];
  } else { // no anniversary today: the fact of the day, the same for everyone
    const n = SS.more.FACTS.length, i = (dayOfYear(d) * 7) % n, f = SS.more.factText(i);
    lab = F ? `L'espace aujourd'hui · ${date} · le fait du jour` : `Space today · ${date} · fact of the day`;
    [fly, hook, txt] = [f[0], f[1], f[2]];
  }
  box.querySelector('.lab').textContent = lab; box.querySelector('.hook').textContent = hook; box.querySelector('.txt').textContent = txt;
  $('todayGo').textContent = F ? '▶ Y aller' : '▶ Fly there';
}
const show = () => { fill(); box.classList.add('on'); };
const hide = () => { box.classList.remove('on'); try { localStorage.setItem('ms_today', key(new Date())); } catch (e) {} };
$('todayX').onclick = hide;
$('todayGo').onclick = () => { if (fly) { $('focus').value = fly; SS.go(fly); } box.classList.remove('on'); };

// a button to open it again (desktop panel row; the phone layout moves it to Play)
{ const row = $('factBtn')?.parentElement; if (row) { const b = document.createElement('button'); b.type = 'button'; b.id = 'todayBtn'; b.textContent = '🗓 Space today'; b.onclick = show; row.prepend(b); } }

// show it once the page is up, unless it was closed earlier today or a quiz/share link is opening something else
{ let seen = null; try { seen = localStorage.getItem('ms_today'); } catch (e) {}
  const q = new URLSearchParams(location.search);
  if (seen !== key(new Date()) && !q.get('quiz') && !q.get('focus') && !q.get('doc')) {
    const wait = setInterval(() => { if (SS.doc2) { clearInterval(wait); setTimeout(show, 2500); setTimeout(() => box.classList.remove('on'), 22500); } }, 500);
  } }

// keep the language in step
{ const was = SS.setLang; if (was) SS.setLang = (...a) => { const r = was(...a); if (box.classList.contains('on')) fill(); return r; }; }
SS.i18nAdd?.({ ui: { '🗓 Space today': '🗓 L\'espace aujourd\'hui' } });
SS.more.today = { show, DAYS };
