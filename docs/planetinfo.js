// =====================================================================
// Planet fact sheets: key numbers, more facts and the missions that went there (EN + FR)
// Numbers from NASA's planetary fact sheets; moon counts as of November 2026
// =====================================================================
const SS = window.SS;
const { INFO } = SS.cosmos;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';

// tile labels
const L = { size: ['Diameter', 'Diamètre'], day: ['Day', 'Jour'], year: ['Year', 'Année'], moons: ['Moons', 'Lunes'], temp: ['Temperature', 'Température'],
  grav: ['Gravity', 'Gravité'], light: ['Sunlight takes', 'La lumière met'], age: ['Age', 'Âge'], dist: ['From Earth', 'De la Terre'] };
// key: { intro, tiles: [[label, EN, FR]], facts: [[EN, FR]], went: [EN, FR] }
const D = {
  Sun: {
    intro: ['Our star: a ball of hot hydrogen and helium that holds 99.8% of all the mass in the Solar System.', "Notre étoile : une boule d'hydrogène et d'hélium brûlants qui contient 99,8 % de toute la masse du Système solaire."],
    tiles: [['size', '1.39 million km (109 Earths)', '1,39 million de km (109 Terres)'], ['day', '25 days at the equator, 35 at the poles', '25 jours à l\'équateur, 35 aux pôles'],
      ['temp', '5,500 °C on the surface, 15 million °C in the core', '5 500 °C en surface, 15 millions de °C au cœur'], ['grav', '28 × Earth', '28 × la Terre'],
      ['age', 'about 4.6 billion years', 'environ 4,6 milliards d\'années'], ['light', '8 min 20 s to reach Earth', '8 min 20 s pour atteindre la Terre']],
    facts: [['About 1.3 million Earths would fit inside it.', 'Environ 1,3 million de Terres tiendraient à l\'intérieur.'],
      ['Every second it turns about 4 million tonnes of matter into energy.', 'Chaque seconde, il transforme environ 4 millions de tonnes de matière en énergie.'],
      ['Light made in the core can take over 100,000 years to reach the surface, then just 8 minutes to reach us.', 'La lumière née au cœur peut mettre plus de 100 000 ans à atteindre la surface, puis 8 minutes seulement pour nous parvenir.'],
      ['In about 5 billion years it will swell into a red giant, then shrink to a white dwarf.', 'Dans environ 5 milliards d\'années, il gonflera en géante rouge, puis rétrécira en naine blanche.']],
    went: ['Parker Solar Probe (closest ever, 2024), Solar Orbiter, SOHO, SDO', 'Parker Solar Probe (au plus près jamais, 2024), Solar Orbiter, SOHO, SDO'] },
  Mercury: {
    intro: ['The smallest planet and the closest to the Sun, a cratered world that looks a lot like our Moon.', 'La plus petite planète et la plus proche du Soleil, un monde criblé de cratères qui ressemble beaucoup à notre Lune.'],
    tiles: [['size', '4,879 km (0.38 × Earth)', '4 879 km (0,38 × la Terre)'], ['day', '176 Earth days, sunrise to sunrise', '176 jours terrestres, d\'un lever de Soleil au suivant'],
      ['year', '88 days', '88 jours'], ['moons', 'none', 'aucune'], ['temp', '−180 °C at night, 430 °C by day', '−180 °C la nuit, 430 °C le jour'], ['grav', '0.38 × Earth', '0,38 × la Terre'],
      ['light', '3 min 13 s', '3 min 13 s']],
    facts: [['Its year is shorter than its day: it goes round the Sun twice in one sunrise-to-sunrise.', 'Son année est plus courte que son jour : il fait deux fois le tour du Soleil entre deux levers de Soleil.'],
      ['Almost no air, so nothing holds the heat at night: the biggest temperature swing of any planet.', 'Presque pas d\'air pour garder la chaleur la nuit : le plus grand écart de température de toutes les planètes.'],
      ['Craters near its poles, always in shadow, hold water ice.', 'Des cratères près de ses pôles, toujours dans l\'ombre, contiennent de la glace d\'eau.'],
      ['Its iron core takes up about 85% of its width.', 'Son noyau de fer occupe environ 85 % de son diamètre.']],
    went: ['Mariner 10 (1974–75), MESSENGER (orbited 2011–2015), BepiColombo (ESA/JAXA, due to enter orbit on 21 November 2026)', 'Mariner 10 (1974–75), MESSENGER (en orbite 2011–2015), BepiColombo (ESA/JAXA, doit se placer en orbite le 21 novembre 2026)'] },
  Venus: {
    intro: ['Almost Earth\'s twin in size, but the hottest planet, hidden under thick clouds of sulfuric acid.', 'Presque la jumelle de la Terre par la taille, mais la planète la plus chaude, cachée sous d\'épais nuages d\'acide sulfurique.'],
    tiles: [['size', '12,104 km (0.95 × Earth)', '12 104 km (0,95 × la Terre)'], ['day', 'spins once in 243 Earth days, backwards', 'un tour sur elle-même en 243 jours terrestres, à l\'envers'],
      ['year', '225 days', '225 jours'], ['moons', 'none', 'aucune'], ['temp', 'about 465 °C, day and night', 'environ 465 °C, jour et nuit'], ['grav', '0.90 × Earth', '0,90 × la Terre'],
      ['light', '6 min', '6 min']],
    facts: [['Its spin is so slow that a day lasts longer than its year.', 'Elle tourne si lentement qu\'un jour y dure plus longtemps que son année.'],
      ['It spins the other way, so the Sun rises in the west.', 'Elle tourne dans l\'autre sens : le Soleil s\'y lève à l\'ouest.'],
      ['The air pressure on the ground is about 92 times Earth\'s, like being 900 m under the sea.', 'La pression au sol est environ 92 fois celle de la Terre, comme à 900 m sous la mer.'],
      ['The brightest planet in our sky, often called the morning or evening star.', 'La planète la plus brillante de notre ciel, souvent appelée l\'étoile du berger.']],
    went: ['Venera 7 (1970, first landing on another planet), Magellan (radar maps, 1990–94), Akatsuki (Japan, 2015–24)', 'Venera 7 (1970, premier atterrissage sur une autre planète), Magellan (cartes radar, 1990–94), Akatsuki (Japon, 2015–24)'] },
  Earth: {
    intro: ['Our home, and the only world known to have life.', 'Notre maison, et le seul monde où l\'on connaisse la vie.'],
    tiles: [['size', '12,742 km', '12 742 km'], ['day', '23 h 56 min', '23 h 56 min'], ['year', '365.25 days', '365,25 jours'], ['moons', '1', '1'],
      ['temp', 'about 15 °C on average', 'environ 15 °C en moyenne'], ['grav', '1 g (9.8 m/s²)', '1 g (9,8 m/s²)'], ['light', '8 min 20 s', '8 min 20 s']],
    facts: [['About 71% of the surface is covered by water.', 'Environ 71 % de la surface est couverte d\'eau.'],
      ['Its tilt of 23.4° is what gives us the seasons.', 'Son inclinaison de 23,4° nous donne les saisons.'],
      ['Its magnetic field shields us from the solar wind, and makes the northern and southern lights.', 'Son champ magnétique nous protège du vent solaire et crée les aurores boréales et australes.'],
      ['The densest planet in the Solar System.', 'La planète la plus dense du Système solaire.']],
    went: ['Seen from space since 1946; the ISS has had people on board non-stop since November 2000', 'Photographiée depuis l\'espace depuis 1946 ; l\'ISS est habitée sans interruption depuis novembre 2000'] },
  Moon: {
    intro: ['Earth\'s only natural satellite, and the only other world people have walked on.', 'Le seul satellite naturel de la Terre, et le seul autre monde où des humains ont marché.'],
    tiles: [['size', '3,474 km (0.27 × Earth)', '3 474 km (0,27 × la Terre)'], ['day', '29.5 Earth days, sunrise to sunrise', '29,5 jours terrestres, d\'un lever de Soleil au suivant'],
      ['year', 'goes round Earth in 27.3 days', 'fait le tour de la Terre en 27,3 jours'], ['temp', '−173 °C at night, 127 °C by day', '−173 °C la nuit, 127 °C le jour'],
      ['grav', '0.17 × Earth (about 1/6)', '0,17 × la Terre (environ 1/6)'], ['dist', '384,400 km on average', '384 400 km en moyenne']],
    facts: [['It drifts about 3.8 cm further from Earth every year.', 'Elle s\'éloigne de la Terre d\'environ 3,8 cm par an.'],
      ['It probably formed when a Mars-sized world hit the young Earth.', 'Elle s\'est sans doute formée quand un monde de la taille de Mars a percuté la jeune Terre.'],
      ['Footprints left by the Apollo astronauts can last millions of years: there is no wind to blow them away.', 'Les traces de pas des astronautes d\'Apollo peuvent durer des millions d\'années : aucun vent pour les effacer.'],
      ['Its pull, with the Sun\'s, makes the tides.', 'Son attraction, avec celle du Soleil, crée les marées.']],
    went: ['Luna 2 (1959, first to reach it), 12 Apollo astronauts (1969–72), Chang\'e 4 (2019, first far-side landing), Artemis II (crew flyby, April 2026)', 'Luna 2 (1959, premier à l\'atteindre), 12 astronautes d\'Apollo (1969–72), Chang\'e 4 (2019, premier atterrissage sur la face cachée), Artemis II (survol habité, avril 2026)'] },
  Mars: {
    intro: ['The red planet: rusty dust, giant volcanoes and canyons, and signs that rivers and lakes once flowed.', 'La planète rouge : une poussière couleur rouille, des volcans et des canyons géants, et des traces d\'anciennes rivières et de lacs.'],
    tiles: [['size', '6,779 km (0.53 × Earth)', '6 779 km (0,53 × la Terre)'], ['day', '24 h 37 min', '24 h 37 min'], ['year', '687 days', '687 jours'], ['moons', '2 (Phobos and Deimos)', '2 (Phobos et Deimos)'],
      ['temp', 'about −63 °C on average', 'environ −63 °C en moyenne'], ['grav', '0.38 × Earth', '0,38 × la Terre'], ['light', '12 min 40 s', '12 min 40 s']],
    facts: [['Olympus Mons is about 22 km high, about 2.5 times the height of Everest.', 'Olympus Mons culmine à environ 22 km, soit environ 2,5 fois l\'Everest.'],
      ['Valles Marineris is a canyon about 4,000 km long, as wide as the United States.', 'Valles Marineris est un canyon d\'environ 4 000 km de long, aussi large que les États-Unis.'],
      ['Dust storms can cover the whole planet for weeks.', 'Des tempêtes de poussière peuvent couvrir toute la planète pendant des semaines.'],
      ['Its polar caps are made of water ice and frozen carbon dioxide.', 'Ses calottes polaires sont faites de glace d\'eau et de dioxyde de carbone gelé.']],
    went: ['Viking 1 & 2 (1976), Sojourner, Spirit, Opportunity, Curiosity and Perseverance rovers, Ingenuity helicopter, China\'s Zhurong (2021)', 'Viking 1 et 2 (1976), les rovers Sojourner, Spirit, Opportunity, Curiosity et Perseverance, l\'hélicoptère Ingenuity, le rover chinois Zhurong (2021)'] },
  Jupiter: {
    intro: ['The biggest planet, a giant ball of hydrogen and helium with no solid surface.', 'La plus grande planète, une boule géante d\'hydrogène et d\'hélium sans surface solide.'],
    tiles: [['size', '139,820 km (11 × Earth)', '139 820 km (11 × la Terre)'], ['day', '9 h 56 min, the shortest of any planet', '9 h 56 min, le plus court de toutes les planètes'],
      ['year', '11.9 years', '11,9 ans'], ['moons', '101 known', '101 connues'], ['temp', 'about −110 °C at the cloud tops', 'environ −110 °C au sommet des nuages'],
      ['grav', '2.5 × Earth', '2,5 × la Terre'], ['light', '43 min', '43 min']],
    facts: [['About 1,300 Earths would fit inside it.', 'Environ 1 300 Terres tiendraient à l\'intérieur.'],
      ['The Great Red Spot is a storm wider than Earth, watched for over 150 years.', 'La Grande Tache rouge est une tempête plus large que la Terre, observée depuis plus de 150 ans.'],
      ['Ganymede, its largest moon, is bigger than the planet Mercury.', 'Ganymède, sa plus grande lune, est plus grande que la planète Mercure.'],
      ['It has faint rings, discovered by Voyager 1 in 1979.', 'Elle a de fins anneaux, découverts par Voyager 1 en 1979.']],
    went: ['Pioneer 10 & 11, Voyager 1 & 2, Galileo (1995–2003), Juno (in orbit since 2016); Europa Clipper and ESA\'s JUICE are on the way', 'Pioneer 10 et 11, Voyager 1 et 2, Galileo (1995–2003), Juno (en orbite depuis 2016) ; Europa Clipper et JUICE (ESA) sont en route'] },
  Saturn: {
    intro: ['The ringed giant, light enough to float in a giant bathtub.', 'La géante aux anneaux, assez légère pour flotter dans une baignoire géante.'],
    tiles: [['size', '116,460 km (9 × Earth)', '116 460 km (9 × la Terre)'], ['day', '10 h 33 min', '10 h 33 min'], ['year', '29.4 years', '29,4 ans'], ['moons', '285 known, the most of any planet', '285 connues, le record des planètes'],
      ['temp', 'about −140 °C at the cloud tops', 'environ −140 °C au sommet des nuages'], ['grav', '1.07 × Earth', '1,07 × la Terre'], ['light', '1 h 20 min', '1 h 20 min']],
    facts: [['Its rings are about 280,000 km wide but mostly only about 10 m thick.', 'Ses anneaux font environ 280 000 km de large, mais souvent seulement une dizaine de mètres d\'épaisseur.'],
      ['The rings are mostly chunks of water ice, from tiny grains to boulders the size of houses.', 'Les anneaux sont surtout des morceaux de glace d\'eau, de minuscules grains à des blocs grands comme des maisons.'],
      ['A six-sided storm, the hexagon, spins around its north pole.', 'Une tempête à six côtés, l\'hexagone, tourne autour de son pôle Nord.'],
      ['Titan has a thick atmosphere and seas of liquid methane; Enceladus sprays water into space.', 'Titan a une atmosphère épaisse et des mers de méthane liquide ; Encelade projette de l\'eau dans l\'espace.']],
    went: ['Pioneer 11, Voyager 1 & 2, Cassini–Huygens (2004–2017, Huygens landed on Titan in 2005); Dragonfly to Titan is planned', 'Pioneer 11, Voyager 1 et 2, Cassini-Huygens (2004–2017, Huygens s\'est posé sur Titan en 2005) ; le drone Dragonfly vers Titan est prévu'] },
  Uranus: {
    intro: ['An ice giant that rolls around the Sun on its side.', 'Une géante de glace qui roule autour du Soleil, couchée sur le côté.'],
    tiles: [['size', '50,724 km (4 × Earth)', '50 724 km (4 × la Terre)'], ['day', '17 h 14 min, backwards', '17 h 14 min, à l\'envers'], ['year', '84 years', '84 ans'], ['moons', '29 known', '29 connues'],
      ['temp', 'about −195 °C', 'environ −195 °C'], ['grav', '0.89 × Earth', '0,89 × la Terre'], ['light', '2 h 40 min', '2 h 40 min']],
    facts: [['Tilted about 98°, each pole gets about 42 years of daylight, then 42 years of night.', 'Inclinée d\'environ 98°, chaque pôle connaît environ 42 ans de jour, puis 42 ans de nuit.'],
      ['The first planet found with a telescope, by William Herschel in 1781.', 'La première planète découverte au télescope, par William Herschel en 1781.'],
      ['Methane in its air gives it its pale blue-green colour.', 'Le méthane de son atmosphère lui donne sa couleur bleu-vert pâle.'],
      ['It has 13 known rings, dark and thin.', 'Elle a 13 anneaux connus, sombres et fins.']],
    went: ['Only Voyager 2, which flew past in January 1986', 'Seulement Voyager 2, qui l\'a survolée en janvier 1986'] },
  Neptune: {
    intro: ['The farthest planet, a deep-blue ice giant with the fastest winds in the Solar System.', 'La planète la plus lointaine, une géante de glace d\'un bleu profond, aux vents les plus rapides du Système solaire.'],
    tiles: [['size', '49,244 km (3.9 × Earth)', '49 244 km (3,9 × la Terre)'], ['day', '16 h 6 min', '16 h 6 min'], ['year', '165 years', '165 ans'], ['moons', '16 known', '16 connues'],
      ['temp', 'about −200 °C', 'environ −200 °C'], ['grav', '1.14 × Earth', '1,14 × la Terre'], ['light', '4 h 10 min', '4 h 10 min']],
    facts: [['Found by maths before anyone saw it: Urbain Le Verrier worked out where it must be, and Johann Galle spotted it in 1846.', 'Trouvée par le calcul avant d\'être vue : Urbain Le Verrier a calculé sa position, et Johann Galle l\'a repérée en 1846.'],
      ['It finished its first full orbit since its discovery in 2011.', 'Elle a bouclé son premier tour complet depuis sa découverte en 2011.'],
      ['Winds blow at over 2,000 km/h.', 'Les vents y soufflent à plus de 2 000 km/h.'],
      ['Its largest moon, Triton, orbits backwards and has geysers of nitrogen.', 'Sa plus grande lune, Triton, tourne à l\'envers et a des geysers d\'azote.']],
    went: ['Only Voyager 2, which flew past in August 1989', 'Seulement Voyager 2, qui l\'a survolée en août 1989'] },
  Pluto: {
    intro: ['A dwarf planet in the Kuiper Belt, with a heart of frozen nitrogen.', 'Une planète naine de la ceinture de Kuiper, avec un cœur d\'azote gelé.'],
    tiles: [['size', '2,377 km (smaller than our Moon)', '2 377 km (plus petite que notre Lune)'], ['day', '6.4 Earth days, backwards', '6,4 jours terrestres, à l\'envers'], ['year', '248 years', '248 ans'],
      ['moons', '5 (the biggest is Charon)', '5 (la plus grande est Charon)'], ['temp', 'about −230 °C', 'environ −230 °C'], ['grav', '0.06 × Earth', '0,06 × la Terre'], ['light', 'about 5.5 hours', 'environ 5 h 30']],
    facts: [['Found by Clyde Tombaugh in 1930, and called a dwarf planet since 2006.', 'Découverte par Clyde Tombaugh en 1930, et classée planète naine depuis 2006.'],
      ['Its moon Charon is so big that the two circle a point in space between them.', 'Sa lune Charon est si grande que les deux tournent autour d\'un point situé entre elles.'],
      ['It has mountains of water ice as high as the Alps.', 'Elle a des montagnes de glace d\'eau aussi hautes que les Alpes.'],
      ['Some of Clyde Tombaugh\'s ashes flew past it on New Horizons.', 'Une partie des cendres de Clyde Tombaugh l\'a survolée à bord de New Horizons.']],
    went: ['Only New Horizons, which flew past in July 2015', 'Seulement New Horizons, qui l\'a survolée en juillet 2015'] },
  Ceres: {
    intro: ['The largest object in the asteroid belt, and the only dwarf planet in the inner Solar System.', 'Le plus gros objet de la ceinture d\'astéroïdes, et la seule planète naine du Système solaire intérieur.'],
    tiles: [['size', '940 km', '940 km'], ['day', '9 h 4 min', '9 h 4 min'], ['year', '4.6 years', '4,6 ans'], ['moons', 'none', 'aucune'],
      ['temp', 'about −105 °C', 'environ −105 °C'], ['grav', '0.03 × Earth', '0,03 × la Terre'], ['light', 'about 23 min', 'environ 23 min']],
    facts: [['Found by Giuseppe Piazzi on 1 January 1801; it was called a planet for about 50 years.', 'Découverte par Giuseppe Piazzi le 1er janvier 1801 ; on l\'a appelée planète pendant une cinquantaine d\'années.'],
      ['It holds about a quarter of all the mass of the asteroid belt.', 'Elle contient environ un tiers de la masse de toute la ceinture d\'astéroïdes.'],
      ['The bright spots in Occator crater are salty deposits left by briny water.', 'Les taches brillantes du cratère Occator sont des dépôts de sel laissés par une eau salée.']],
    went: ['NASA\'s Dawn, in orbit from 2015 to 2018', 'La sonde Dawn de la NASA, en orbite de 2015 à 2018'] },
};

const card = (k, F) => {
  const d = D[k], i = F ? 1 : 0;
  const tiles = d.tiles.map(([l, en, f]) => `<div style="background:rgba(140,160,255,.08);border-radius:8px;padding:5px 7px"><div style="font-size:10px;letter-spacing:.04em;text-transform:uppercase;opacity:.65">${L[l][i]}</div><div style="font-size:12.5px;line-height:1.3">${F ? f : en}</div></div>`).join('');
  return `${d.intro[i]}<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0">${tiles}</div>
    <details class="pmore" ${matchMedia('(min-height:760px)').matches ? 'open' : ''} style="margin-top:4px"><summary style="cursor:pointer;color:#9fd0ff">📖 ${F ? 'En savoir plus' : 'More facts'}</summary>
    <div style="max-height:min(30vh,240px);overflow:auto"><ul style="margin:6px 0 4px 16px;padding:0">${d.facts.map(f => `<li style="margin:3px 0">${f[i]}</li>`).join('')}</ul>
    <div style="font-size:12px;opacity:.85"><b style="display:inline;font-size:12px">🚀 ${F ? 'Ils y sont allés' : 'Visited by'}:</b> ${d.went[i]}</div></div></details>`;
};
{
  const prev = SS.onFocus;
  SS.onFocus = key => {
    if (D[key] && INFO[key]) {
      INFO[key].fact = card(key, fr()); if (SS.more.INFO_EN?.[key]) SS.more.INFO_EN[key].fact = card(key, false);
      SS.i18nAdd?.({ fact: { [key]: card(key, true) } });
    }
    prev(key);
  };
}
// the info card can get tall now: let it scroll instead of running off the screen
{ const st = document.createElement('style'); st.textContent = '#info{max-height:calc(100vh - 70px);overflow:auto}'; document.head.appendChild(st); }
SS.more.planetInfo = D;
await import('./parker.js' + new URL(import.meta.url).search);
