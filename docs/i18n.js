// =====================================================================
// English / French language switch
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const INFO = SS.cosmos.INFO;

// ---------- Interface text ----------
const UI = {
  "Drag to rotate · scroll to zoom · right-drag to pan · click a name to fly there": "Faites glisser pour tourner · molette pour zoomer · clic droit pour vous déplacer · cliquez sur un nom pour y aller",
  "by Midnight Satellite": "par Midnight Satellite", "▶ Guided tour": "▶ Visite guidée", "■ Stop tour": "■ Arrêter la visite", "Hide interface (H)": "Masquer l'interface (H)",
  "✨ One Fact": "✨ One Fact", "⚖️ Compare sizes": "⚖️ Comparer les tailles", "Compare sizes": "Comparer les tailles", "vs": "contre",
  "Fly to": "Aller à", "Time speed": "Vitesse du temps", "Date": "Date", "Now": "Maintenant", "Auto-rotate camera": "Rotation auto de la caméra", "Names": "Noms",
  "Constellations": "Constellations", "Zodiac / star signs": "Zodiaque / signes", "Orbit paths": "Orbites", "Ambient sound": "Son d'ambiance",
  "Sizes and distances compressed so everything fits on screen · Planet maps:": "Tailles et distances compressées pour tout faire tenir à l'écran · Cartes des planètes :",
  "(CC BY 4.0), Earth: NASA · Star positions: Hipparcos catalogue ·": "(CC BY 4.0), Terre : NASA · Positions des étoiles : catalogue Hipparcos ·",
  "Midnight Satellite on YouTube": "Midnight Satellite sur YouTube",
  "🔍 Search planets, moons, stars, galaxies…": "🔍 Chercher planètes, lunes, étoiles, galaxies…", "Nothing found": "Aucun résultat",
  "🔗 Copy link to this view": "🔗 Copier le lien de cette vue", "✓ Link copied": "✓ Lien copié", "Copy this link:": "Copiez ce lien :", "Next fact ›": "Fait suivant ›",
  "Paused": "En pause", "Real time": "Temps réel", "1 minute / sec": "1 minute / s", "1 hour / sec": "1 heure / s", "6 hours / sec": "6 heures / s", "1 day / sec": "1 jour / s",
  "3.5 days / sec": "3,5 jours / s", "1 week / sec": "1 semaine / s", "1 month / sec": "1 mois / s", "1 year / sec": "1 an / s",
  "◀ 1 day / sec": "◀ 1 jour / s", "◀ 1 month / sec": "◀ 1 mois / s", "◀ 1 year / sec": "◀ 1 an / s", "Forwards in time": "Vers le futur", "Backwards in time": "Vers le passé",
  "☀ Total / annular solar eclipse": "☀ Éclipse de Soleil totale / annulaire", "☀ Partial solar eclipse": "☀ Éclipse partielle de Soleil",
  "🌑 Total lunar eclipse: blood moon": "🌑 Éclipse totale de Lune : lune de sang", "🌘 Partial lunar eclipse": "🌘 Éclipse partielle de Lune", "🌗 Penumbral lunar eclipse": "🌗 Éclipse pénombrale de Lune",
  "Night sky from London": "Ciel nocturne depuis Londres", "View from the ground": "Vue depuis le sol", "Drag to look around · scroll to zoom": "Faites glisser pour regarder autour · molette pour zoomer",
  "The real sky over London for the date and time shown at the top: stars, planets and the Moon in their true places. Turn on Constellations or Zodiac to trace the patterns.":
    "Le vrai ciel au-dessus de Londres, à la date et à l'heure affichées en haut : étoiles, planètes et Lune à leur place réelle. Activez Constellations ou Zodiaque pour voir les figures.",
  // menu groups
  "Views": "Vues", "Events": "Événements", "The Sun & planets": "Le Soleil et les planètes", "Moons": "Lunes", "Dwarf planets": "Planètes naines", "Comets, asteroids & belts": "Comètes, astéroïdes et ceintures",
  "Spacecraft": "Engins spatiaux", "Stars (nearest first)": "Étoiles (des plus proches aux plus lointaines)", "Exoplanets": "Exoplanètes", "Star clusters & nebulae": "Amas d'étoiles et nébuleuses",
  "Black holes": "Trous noirs", "Zodiac (star signs)": "Zodiaque (signes)", "Galaxies": "Galaxies",
};

// ---------- Names (labels, menu and info cards) ----------
const NAME = {
  "Sun": "Soleil", "The Sun": "Le Soleil", "Mercury": "Mercure", "Venus": "Vénus", "Earth": "Terre", "Moon": "Lune", "The Moon": "La Lune", "Saturn": "Saturne", "Ceres": "Cérès", "Pluto": "Pluton",
  "Dysnomia": "Dysnomie", "Eris": "Éris", "Europa": "Europe", "Ganymede": "Ganymède", "Enceladus": "Encelade", "Tethys": "Téthys", "Rhea": "Rhéa", "Iapetus": "Japet", "Oberon": "Obéron",
  "Halley's Comet": "Comète de Halley", "Kuiper Belt": "Ceinture de Kuiper", "Oort Cloud": "Nuage d'Oort", "Comet 67P": "Comète 67P", "Psyche": "Psyché", "Eros": "Éros",
  "ISS (Space Station)": "ISS (Station spatiale)", "Comms satellite": "Satellite de télécoms", "Communications satellite": "Satellite de télécommunications",
  "James Webb Telescope": "Télescope James Webb", "James Webb Space Telescope": "Télescope spatial James Webb", "James Webb": "James Webb",
  "Parker Solar Probe": "Sonde solaire Parker", "Perseverance rover": "Rover Perseverance", "Tiangong (Space Station)": "Tiangong (station spatiale)",
  "Roman Space Telescope (2026)": "Télescope spatial Roman (2026)", "Nancy Grace Roman Space Telescope": "Télescope spatial Nancy Grace Roman", "Roman": "Roman",
  "Alpha Centauri A & B": "Alpha du Centaure A et B", "Alpha Centauri": "Alpha du Centaure", "Alpha Centauri B": "Alpha du Centaure B", "Barnard's Star": "Étoile de Barnard",
  "Sirius B (white dwarf)": "Sirius B (naine blanche)", "Vega": "Véga", "Spica": "L'Épi (Spica)", "Polaris": "Étoile polaire", "Betelgeuse": "Bételgeuse", "Antares": "Antarès", "Aldebaran": "Aldébaran",
  "Regulus": "Régulus", "Canopus": "Canopus", "UY Scuti (giant)": "UY Scuti (géante)",
  "TRAPPIST-1 system": "Système TRAPPIST-1", "HD 189733 b (blue)": "HD 189733 b (bleue)", "55 Cancri e (lava)": "55 Cancri e (lave)", "Kepler-7b (puffy)": "Kepler-7b (gonflée)",
  "Pleiades": "Pléiades", "Pleiades (Seven Sisters)": "Pléiades (les Sept Sœurs)", "Helix Nebula": "Nébuleuse de l'Hélice", "Orion Nebula": "Nébuleuse d'Orion", "The Orion Nebula": "La nébuleuse d'Orion",
  "Ring Nebula": "Nébuleuse de l'Anneau", "Crab Nebula": "Nébuleuse du Crabe", "The Crab Nebula": "La nébuleuse du Crabe", "Eagle Nebula": "Nébuleuse de l'Aigle", "Carina Nebula": "Nébuleuse de la Carène",
  "Horsehead Nebula": "Nébuleuse de la Tête de Cheval", "Lagoon Nebula": "Nébuleuse de la Lagune", "Cat's Eye Nebula": "Nébuleuse de l'Œil de chat",
  "Sagittarius A* (our galaxy)": "Sagittarius A* (notre galaxie)", "TON 618 (giant)": "TON 618 (géant)", "Sun-like companion": "Compagnon semblable au Soleil", "Blue supergiant HDE 226868": "Supergéante bleue HDE 226868",
  "Aries": "Bélier", "Taurus": "Taureau", "Gemini": "Gémeaux", "Leo": "Lion", "Virgo": "Vierge", "Libra": "Balance", "Scorpio": "Scorpion", "Ophiuchus": "Ophiuchus (Serpentaire)",
  "Sagittarius": "Sagittaire", "Capricorn": "Capricorne", "Aquarius": "Verseau", "Pisces": "Poissons",
  "Large Magellanic Cloud": "Grand Nuage de Magellan", "Small Magellanic Cloud": "Petit Nuage de Magellan", "Andromeda": "Andromède", "Andromeda Galaxy": "Galaxie d'Andromède", "The Andromeda Galaxy": "La galaxie d'Andromède",
  "Triangulum": "Triangle", "Triangulum Galaxy": "Galaxie du Triangle", "Whirlpool": "Tourbillon", "Whirlpool Galaxy": "Galaxie du Tourbillon", "Sombrero Galaxy": "Galaxie du Sombrero",
  "Pinwheel Galaxy": "Galaxie du Moulinet", "Cartwheel Galaxy": "Galaxie de la Roue de chariot",
  "Solar System": "Système solaire", "Deep space (everything)": "Espace lointain (tout)", "True scale (sizes & distances)": "Échelle réelle (tailles et distances)",
  "Total solar eclipse · 2 Aug 2027": "Éclipse totale de Soleil · 2 août 2027", "Total lunar eclipse · 3 Mar 2026": "Éclipse totale de Lune · 3 mars 2026",
  "Apollo 11 · July 1969": "Apollo 11 · juillet 1969", "Halley's Comet · Feb 1986": "Comète de Halley · févr. 1986", "Halley's Comet returns · Jul 2061": "Retour de la comète de Halley · juil. 2061",
  "Total solar eclipse": "Éclipse totale de Soleil", "Total lunar eclipse": "Éclipse totale de Lune", "True scale": "Échelle réelle", "Mars": "Mars", "Jupiter": "Jupiter", "Uranus": "Uranus", "Neptune": "Neptune",
  "at Jupiter": "autour de Jupiter", "on Mars": "sur Mars",
};
function trName(s) {
  if (NAME[s]) return NAME[s];
  let m = s.match(/^([^\w\s(]+\s*)(.+)$/u); if (m && NAME[m[2]]) return m[1] + NAME[m[2]];            // "♈︎ Aries"
  m = s.match(/^(.+) \((.+)\)$/); if (m) return `${trName(m[1])} (${trName(m[2])})`;                // "Io (Jupiter)"
  return s;
}

// ---------- Info cards ----------
const CAT = {
  "Star": "Étoile", "Star · red dwarf": "Étoile · naine rouge", "Star system": "Système stellaire", "Star · orange giant": "Étoile · géante orange", "Star · red giant": "Étoile · géante rouge",
  "Star · blue giant": "Étoile · géante bleue", "Star · giant": "Étoile · géante", "Star · supergiant": "Étoile · supergéante", "Star · red supergiant": "Étoile · supergéante rouge",
  "Star · blue supergiant": "Étoile · supergéante bleue", "Star · white supergiant": "Étoile · supergéante blanche", "Star · ultra-cool red dwarf": "Étoile · naine rouge ultra-froide", "Star · orange dwarf": "Étoile · naine orange",
  "Star cluster": "Amas d'étoiles", "Planetary nebula": "Nébuleuse planétaire", "Star-forming nebula": "Nébuleuse de formation d'étoiles", "Supernova remnant": "Rémanent de supernova", "Dark nebula": "Nébuleuse obscure",
  "Black hole · dormant": "Trou noir · dormant", "Black hole · stellar": "Trou noir · stellaire", "Supermassive black hole": "Trou noir supermassif", "Ultramassive black hole · quasar": "Trou noir ultramassif · quasar",
  "Galaxy · satellite of the Milky Way": "Galaxie · satellite de la Voie lactée", "Galaxy · spiral": "Galaxie · spirale", "Galaxy · giant elliptical": "Galaxie · elliptique géante", "Galaxy · ring": "Galaxie · en anneau",
  "Spacecraft · space station": "Engin spatial · station spatiale", "Spacecraft · space telescope": "Engin spatial · télescope spatial", "Spacecraft": "Engin spatial", "Spacecraft · probe": "Engin spatial · sonde",
  "Spacecraft · solar probe": "Engin spatial · sonde solaire", "Spacecraft · Jupiter orbiter": "Engin spatial · orbiteur de Jupiter", "Spacecraft · space telescope · launched 2026": "Engin spatial · télescope spatial · lancé en 2026",
  "Rover · on Mars since 2021": "Rover · sur Mars depuis 2021", "Planet": "Planète", "Planet · gas giant": "Planète · géante gazeuse", "Planet · ice giant": "Planète · géante de glace", "Dwarf planet": "Planète naine",
  "Moon of Earth": "Lune de la Terre", "Moon of Mars": "Lune de Mars", "Moon of Jupiter": "Lune de Jupiter", "Moon of Saturn": "Lune de Saturne", "Moon of Uranus": "Lune d'Uranus", "Moon of Neptune": "Lune de Neptune",
  "Comet": "Comète", "Asteroid": "Astéroïde", "Near-Earth asteroid": "Astéroïde géocroiseur", "Asteroid · metal-rich": "Astéroïde · riche en métal",
  "Region of the Solar System": "Région du Système solaire", "Region of the Solar System (predicted)": "Région du Système solaire (prédite)",
  "Exoplanet": "Exoplanète", "Exoplanet · hot Jupiter": "Exoplanète · Jupiter chaud", "Exoplanet · lava world": "Exoplanète · monde de lave", "Exoplanet · super-Earth": "Exoplanète · super-Terre",
  "Exoplanet · puffy gas giant": "Exoplanète · géante gazeuse gonflée", "Mission · July 1969": "Mission · juillet 1969", "Event · 2 August 2027": "Événement · 2 août 2027", "Event · 3 March 2026": "Événement · 3 mars 2026",
  "Sizes and distances to scale": "Tailles et distances à l'échelle", "Zodiac constellation · star sign": "Constellation du zodiaque · signe", "Constellation on the zodiac": "Constellation sur le zodiaque",
};
const PLANET_DE = { Earth: "de la Terre", Mars: "de Mars", Jupiter: "de Jupiter", Saturn: "de Saturne", Uranus: "d'Uranus", Neptune: "de Neptune", Sun: "du Soleil" };
const DIST = {
  "150 million km from Earth (8.3 light-minutes)": "150 millions de km de la Terre (8,3 minutes-lumière)", "about 384,400 km from Earth": "environ 384 400 km de la Terre",
  "about 23,460 km from Mars": "environ 23 460 km de Mars", "returns every ~76 years": "revient tous les ~76 ans", "orbits close to Earth's path": "orbite près de la trajectoire de la Terre",
  "30–50 times Earth's distance from the Sun": "30 à 50 fois la distance Terre–Soleil", "roughly 2,000 to 100,000 times Earth's distance from the Sun": "entre 2 000 et 100 000 fois environ la distance Terre–Soleil",
  "about 35,786 km above Earth (geostationary orbit)": "environ 35 786 km au-dessus de la Terre (orbite géostationnaire)", "about 1.5 million km from Earth (Sun–Earth L2)": "environ 1,5 million de km de la Terre (point L2 Soleil–Terre)",
  "Earth to the Moon: about 384,000 km": "De la Terre à la Lune : environ 384 000 km", "Visible from Spain, North Africa and the Middle East": "Visible depuis l'Espagne, l'Afrique du Nord et le Moyen-Orient",
  "Visible from East Asia, Australia, the Pacific and the Americas": "Visible depuis l'Asie de l'Est, l'Australie, le Pacifique et les Amériques",
  "If the Sun were a grapefruit, Earth would be a grain of sand 15 m away": "Si le Soleil était un pamplemousse, la Terre serait un grain de sable à 15 m",
  "orbits the Sun every 6.4 years": "fait le tour du Soleil en 6,4 ans", "crosses Earth's orbit": "croise l'orbite de la Terre",
  "light travelled about 10 billion years to reach us": "sa lumière a voyagé environ 10 milliards d'années pour nous parvenir", "dives to 6.1 million km from the Sun": "plonge à 6,1 millions de km du Soleil",
  "in orbit around Jupiter since 2016": "en orbite autour de Jupiter depuis 2016", "Jezero Crater, Mars": "Cratère Jezero, Mars",
  "heading to Sun–Earth L2, about 1.5 million km from Earth": "en route vers le point L2 Soleil–Terre, à environ 1,5 million de km de la Terre",
};
const num = s => s.replace(/(\d),(?=\d{3})/g, '$1 ').replace(/(\d)\.(\d)/g, '$1,$2');
const big = (n, unit) => { const v = parseFloat(n.replace(/\s/g, '').replace(',', '.')); return unit === 'billion' ? (v >= 2 ? 'milliards' : 'milliard') : (v >= 2 ? 'millions' : 'million'); };
const MONTH = { Jan: 'janv.', Feb: 'févr.', Mar: 'mars', Apr: 'avr.', May: 'mai', Jun: 'juin', Jul: 'juil.', Aug: 'août', Sep: 'sept.', Oct: 'oct.', Nov: 'nov.', Dec: 'déc.' };
const frDate = s => s.replace(/([A-Z][a-z]{2}) (\d+)/g, (_, m, d) => `${d} ${MONTH[m] || m}`);
function trDist(s) {
  if (DIST[s]) return DIST[s];
  let m;
  if ((m = s.match(/^(about )?(.+) light-years away$/))) return `à ${m[1] ? 'environ ' : ''}${num(m[2])} années-lumière`;
  if ((m = s.match(/^(about |over )?(.+) light-years$/))) return `${m[1] ? (m[1] === 'over ' ? 'plus de ' : 'environ ') : ''}${num(m[2])} années-lumière`;
  if ((m = s.match(/^about (\S+) (million|billion) km from the Sun( \(average\))?$/))) return `environ ${num(m[1])} ${big(num(m[1]), m[2])} de km du Soleil${m[3] ? ' (en moyenne)' : ''}`;
  if ((m = s.match(/^over (\S+) billion km from Earth$/))) return `plus de ${num(m[1])} milliards de km de la Terre`;
  if ((m = s.match(/^orbits (\w+) at (\S+)( million)? km$/))) return `orbite autour ${PLANET_DE[m[1]].replace(/^de la /, 'de la ').replace(/^de /, 'de ').replace(/^d'/, "d'")} à ${num(m[2])}${m[3] ? ' ' + big(num(m[2]), 'million') + ' de' : ''} km`;
  if ((m = s.match(/^about (\S+) km above (Earth|Mars)$/))) return `environ ${num(m[1])} km au-dessus ${PLANET_DE[m[2]].replace(/^de /, 'de ')}`;
  if ((m = s.match(/^Star-sign dates: (.+)$/))) return `Dates du signe : ${frDate(m[1])}`;
  if ((m = s.match(/^Sun in front of it: (.+)$/))) return `Soleil devant elle : ${frDate(m[1])}`;
  return s;
}
const FACT = {
  Proxima: "L'étoile la plus proche du Soleil. Elle possède au moins une planète à peu près de la taille de la Terre dans sa zone habitable.",
  AlphaCen: "Une étoile semblable au Soleil avec une partenaire orange. Avec Proxima, c'est notre système stellaire le plus proche.",
  Barnard: "L'étoile qui se déplace le plus vite dans notre ciel : elle avance d'une largeur de Lune tous les 180 ans environ.",
  Sirius: "L'étoile la plus brillante du ciel nocturne. Elle a une minuscule compagne naine blanche, Sirius B.",
  Procyon: "Le « Petit Chien », l'une des étoiles les plus brillantes des ciels d'hiver.",
  Altair: "Elle tourne si vite (un tour en ~9 heures) qu'elle est renflée à l'équateur.",
  Vega: "Elle était l'étoile polaire il y a environ 12 000 ans, et le redeviendra.",
  Fomalhaut: "Entourée d'un large anneau de poussières et de débris.",
  Pollux: "L'étoile géante la plus proche du Soleil.",
  Arcturus: "L'étoile la plus brillante de la moitié nord du ciel.",
  Capella: "On dirait une seule étoile, mais ce sont en réalité deux paires d'étoiles.",
  Aldebaran: "L'« œil » orange du Taureau.",
  Regulus: "Elle tourne si vite qu'elle est presque sur le point de se disloquer.",
  Spica: "En réalité deux étoiles bleues très chaudes qui tournent l'une autour de l'autre en quatre jours.",
  Canopus: "La deuxième étoile la plus brillante du ciel nocturne, utilisée par les sondes pour s'orienter.",
  Polaris: "L'étoile du Nord : elle se trouve presque exactement au-dessus du pôle Nord de la Terre.",
  Betelgeuse: "L'épaule d'Orion. À la place du Soleil, elle dépasserait l'orbite de Mars. Elle explosera un jour en supernova.",
  Antares: "Le « cœur » rouge du Scorpion ; son nom signifie « rivale de Mars ».",
  Rigel: "L'étoile la plus brillante d'Orion, des dizaines de milliers de fois plus lumineuse que le Soleil.",
  Deneb: "L'une des étoiles les plus lumineuses visibles à l'œil nu.",
  Pleiades: "Un jeune amas d'étoiles bleues très chaudes, enveloppé de poussières qui reflètent leur lumière.",
  Helix: "Le gaz expulsé par une étoile mourante semblable au Soleil. On la surnomme « l'Œil de Dieu ».",
  Orion: "La plus proche des grandes pouponnières d'étoiles, visible à l'œil nu comme une « étoile » floue dans l'épée d'Orion.",
  Ring: "Un anneau de fumée lumineux, fait du gaz rejeté par une étoile mourante.",
  Crab: "Les débris d'une étoile qui a explosé en 1054, observée par des astronomes chinois. Un pulsar tourne 30 fois par seconde en son cœur.",
  Eagle: "Elle abrite les célèbres « Piliers de la Création », d'immenses colonnes de gaz où naissent de nouvelles étoiles.",
  Carina: "L'une des plus grandes nébuleuses de notre galaxie, qui abrite l'étoile géante et instable Êta Carinae.",
  GaiaBH1: "L'un des trous noirs connus les plus proches, découvert en 2022. Il est « calme » : pas de disque lumineux, juste une étoile semblable au Soleil qui tourne autour.",
  CygX1: "Le premier objet largement reconnu comme un trou noir. Environ 21 fois la masse du Soleil, il arrache du gaz à sa partenaire, une supergéante bleue.",
  SgrA: "Le trou noir au centre de notre Voie lactée, environ 4 millions de fois la masse du Soleil. Photographié pour la première fois en 2022.",
  LMC: "Une petite galaxie en orbite autour de la nôtre, facile à voir depuis l'hémisphère Sud.",
  SMC: "La petite sœur du Grand Nuage, lentement déchirée par la Voie lactée.",
  Andromeda: "La grande galaxie la plus proche, avec environ mille milliards d'étoiles. Elle se dirige vers la Voie lactée.",
  Triangulum: "La troisième plus grande galaxie de notre Groupe local, pleine de régions de formation d'étoiles.",
  Whirlpool: "Une spirale classique vue de face, attirée par la petite galaxie compagne au bout d'un de ses bras.",
  Sombrero: "Un bulbe brillant traversé par une bande sombre de poussière, comme un chapeau vu de profil.",
  M87: "Une galaxie géante en forme de boule, avec des milliers d'amas d'étoiles, qui abrite le trou noir M87*.",
  M87BH: "Le premier trou noir jamais photographié (2019) : environ 6,5 milliards de fois la masse du Soleil, il projette un jet de particules long de milliers d'années-lumière.",
  ISS: "La Station spatiale internationale, habitée en permanence depuis novembre 2000. Elle fait le tour de la Terre en 90 minutes environ.",
  Hubble: "Lancé en 1990, Hubble a pris certaines des photos les plus célèbres de l'Univers.",
  Satellite: "À cette altitude, un satellite fait un tour par jour, au même rythme que la Terre : il semble immobile dans le ciel.",
  JWST: "Lancé en décembre 2021. Son pare-soleil, grand comme un court de tennis, garde le miroir doré assez froid pour voir la lumière infrarouge des premières galaxies.",
  NewHorizons: "A survolé Pluton en 2015, puis l'objet de la ceinture de Kuiper Arrokoth en 2019.",
  Voyager2: "Lancée en 1977. La seule sonde à avoir visité Uranus et Neptune ; elle est entrée dans l'espace interstellaire en 2018.",
  Voyager1: "Lancée en 1977, c'est l'objet humain le plus lointain. Elle est entrée dans l'espace interstellaire en 2012.",
  Sun: "Il contient 99,8 % de toute la masse du Système solaire.",
  Mercury: "La plus petite planète. Une année y dure seulement 88 jours terrestres.",
  Venus: "La planète la plus chaude, environ 465 °C, sous d'épais nuages d'acide sulfurique.",
  Earth: "Notre maison, et le seul monde connu à abriter la vie.",
  Moon: "Elle montre toujours la même face à la Terre.",
  Mars: "On y trouve Olympus Mons, le plus haut volcan du Système solaire.",
  Jupiter: "La plus grande planète. La Grande Tache rouge est une tempête plus large que la Terre.",
  Saturn: "Ses anneaux sont faits surtout de morceaux de glace d'eau.",
  Uranus: "Elle tourne autour du Soleil couchée sur le côté, inclinée d'environ 98°.",
  Neptune: "La planète la plus venteuse, avec des rafales de plus de 2 000 km/h.",
  Ceres: "Le plus gros objet de la ceinture d'astéroïdes, avec des dépôts de sel brillants dans le cratère Occator.",
  Pluto: "Sa plaine en forme de cœur est faite d'azote gelé. Visitée par New Horizons en 2015.",
  Haumea: "Elle tourne sur elle-même en ~4 heures, ce qui l'étire en forme d'œuf. Elle a aussi un anneau.",
  Makemake: "Un monde glacé et rougeâtre, loin dans la ceinture de Kuiper.",
  Eris: "Presque de la taille de Pluton. Sa découverte a conduit à reclasser Pluton comme planète naine.",
  Phobos: "La plus grande lune de Mars se rapproche lentement en spirale et finira par se briser ou s'écraser sur Mars.",
  Deimos: "Une minuscule lune de 12 km : un rocher bosselé dont on pourrait faire le tour en voiture en un après-midi.",
  Io: "Le monde le plus volcanique connu, avec des centaines de volcans actifs.",
  Europa: "Sa croûte de glace cache un océan salé, l'un des meilleurs endroits pour chercher la vie hors de la Terre.",
  Ganymede: "La plus grande lune du Système solaire, plus grande que la planète Mercure.",
  Callisto: "L'une des surfaces les plus criblées de cratères que l'on connaisse.",
  Enceladus: "Elle projette des jets de glace d'eau dans l'espace depuis des fissures en « rayures de tigre » près de son pôle Sud.",
  Titan: "La seule lune avec une atmosphère épaisse, et elle a des lacs et des mers de méthane liquide.",
  Miranda: "Elle a des falaises d'environ 20 km de haut, parmi les plus hautes connues du Système solaire.",
  Titania: "La plus grande lune d'Uranus, couverte de canyons.",
  Triton: "Elle tourne autour de Neptune à l'envers et a des geysers d'azote. Probablement un objet de la ceinture de Kuiper capturé.",
  Halley: "Visible depuis la Terre tous les 75 à 79 ans. Dernier passage en 1986 ; elle reviendra en 2061. Sa queue pointe toujours à l'opposé du Soleil.",
  Vesta: "Le deuxième plus gros objet de la ceinture d'astéroïdes, avec un immense cratère au pôle Sud. La sonde Dawn de la NASA l'a étudié en 2011–2012.",
  Bennu: "Un tas de gravats en forme de toupie. La sonde OSIRIS-REx de la NASA en a rapporté un échantillon sur Terre en 2023.",
  Kuiper: "Un large anneau de corps glacés au-delà de Neptune : le domaine de Pluton, Haumea, Makemake et d'innombrables comètes.",
  Oort: "Une immense coquille de noyaux de comètes glacés qui entourerait le Système solaire. Trop faible pour être vue ; représentée ici très compressée.",
  ProximaB: "L'exoplanète connue la plus proche : un monde rocheux un peu plus lourd que la Terre, dans la zone habitable de son étoile. On ignore si elle peut garder une atmosphère.",
  TRAPPIST1: "Une petite étoile froide avec sept planètes rocheuses de la taille de la Terre, un record pour une étoile de ce type. Trois sont dans sa zone habitable.",
  T1e: "Rocheuse, de la taille de la Terre et dans la zone habitable : l'une des meilleures candidates à l'eau liquide hors du Système solaire.",
  T1f: "Dans la zone habitable, mais peut-être froide et glacée.", T1g: "La plus grande planète de TRAPPIST-1, au bord froid de la zone habitable.",
  T1b: "L'une des sept planètes rocheuses serrées plus près de leur étoile que Mercure ne l'est du Soleil.",
  Peg51: "Une étoile semblable au Soleil, célèbre pour sa planète « Jupiter chaud ».",
  Peg51b: "La première planète découverte autour d'une étoile semblable au Soleil (1995, prix Nobel 2019). Une géante gazeuse qui fait le tour de son étoile en 4,2 jours.",
  Apollo11: "Neil Armstrong et Buzz Aldrin sont devenus les premiers humains à marcher sur la Lune le 20 juillet 1969, pendant que Michael Collins restait en orbite. La ligne pointillée montre la trajectoire en huit « de libre retour ».",
  EV_solar: "La Lune passe exactement entre le Soleil et la Terre. La tache sombre sur la Terre est l'ombre de la Lune : dedans, le jour devient nuit pendant quelques minutes.",
  EV_lunar: "La Terre passe entre le Soleil et la Lune. La seule lumière qui atteint la Lune traverse l'atmosphère terrestre et la colore en rouge : une « lune de sang ».",
  scaleView: "…et Neptune serait à 450 m. L'étoile la plus proche, Proxima du Centaure, serait à environ 4 000 km. L'espace est surtout vide : zoomez sur un nom pour retrouver chaque minuscule planète.",
  Mimas: "Un de ses cratères, Herschel, fait un tiers de la largeur de la lune entière. L'impact qui l'a créé a failli briser Mimas.",
  Tethys: "Faite presque entièrement de glace d'eau, avec un canyon, Ithaca Chasma, long d'environ 2 000 km.",
  Dione: "De brillantes falaises de glace, hautes de centaines de mètres, strient l'une de ses faces.",
  Rhea: "La deuxième plus grande lune de Saturne : une boule froide et cratérisée de glace et de roche, d'environ 1 500 km.",
  Iapetus: "Deux visages : une moitié est noire comme du charbon, l'autre blanche comme la neige. Une crête de 13 km de haut fait le tour de son équateur.",
  Ariel: "La plus brillante des lunes d'Uranus, sillonnée de longues vallées. C'est elle qui a la surface la plus jeune.",
  Umbriel: "La plus sombre des grandes lunes d'Uranus, avec un étrange anneau brillant à sa surface.",
  Oberon: "La plus lointaine des grandes lunes d'Uranus, avec une montagne d'environ 11 km de haut.",
  Comet67P: "En 2014, la sonde Rosetta s'est mise en orbite autour d'elle et y a largué le petit atterrisseur Philae : le premier atterrissage sur une comète.",
  Apophis: "Le 13 avril 2029, il passera à seulement 32 000 km de la Terre, plus près que de nombreux satellites, assez brillant pour être vu à l'œil nu.",
  Psyche: "Riche en métal : ce pourrait être le noyau mis à nu d'une planète brisée. La sonde Psyche de la NASA y arrive en 2029.",
  Eros: "En forme de cacahuète. En 2001, NEAR Shoemaker s'y est posée : le premier engin à atterrir sur un astéroïde.",
  TauCeti: "L'une des étoiles semblables au Soleil les plus proches, cible favorite de la recherche de signaux radio extraterrestres.",
  Mira: "Son éclat monte et descend sur 332 jours, et elle traîne derrière elle une queue de gaz longue de 13 années-lumière, comme une comète.",
  UYScuti: "L'une des plus grandes étoiles connues. À la place du Soleil, sa surface dépasserait la ceinture d'astéroïdes, presque jusqu'à Jupiter.",
  HD189733: "Une étoile orange avec une célèbre planète bleue.",
  HD189733b: "Une géante gazeuse d'un bleu profond, où il pleuvrait peut-être du verre fondu, à l'horizontale, dans des vents d'environ 8 000 km/h.",
  Cnc55: "Une étoile semblable au Soleil avec au moins cinq planètes.",
  Cnc55e: "Si proche de son étoile que sa surface est probablement un océan de lave. Une année y dure seulement 18 heures.",
  Kepler452: "Une jumelle de notre Soleil, un peu plus âgée et un peu plus grande.",
  Kepler452b: "Surnommée la « cousine de la Terre » : un monde plus grand qui fait le tour d'une étoile semblable au Soleil en 385 jours, là où l'eau pourrait être liquide.",
  TOI700: "Une naine rouge calme, avec quatre planètes connues.",
  TOI700d: "Une planète de la taille de la Terre dans la zone habitable de son étoile, découverte par le satellite TESS de la NASA en 2020.",
  Kepler7: "Une étoile semblable au Soleil, un peu plus grande et plus âgée que le nôtre.",
  Kepler7b: "L'une des planètes les plus gonflées connues : environ 1,6 fois plus large que Jupiter, mais avec la densité du polystyrène. Ce fut aussi la première exoplanète dont on a cartographié les nuages.",
  HD40307: "Une étoile orange avec au moins six planètes.",
  HD40307g: "Une super-Terre d'environ 7 fois la masse de la Terre, dans la zone habitable de son étoile, là où l'eau liquide pourrait exister.",
  Lagoon: "Un immense nuage lumineux où se forment des milliers de nouvelles étoiles. Visible aux jumelles depuis un site sombre.",
  Horsehead: "Un nuage de poussière froid et sombre en forme de tête de cheval, qui se découpe sur du gaz rouge lumineux.",
  CatsEye: "Une étoile mourante a expulsé au moins 11 coquilles de gaz, environ une tous les 1 500 ans, comme les couches d'un oignon.",
  Pinwheel: "Presque deux fois plus large que la Voie lactée : environ 170 000 années-lumière, avec mille milliards d'étoiles.",
  CenA: "Traversée par une bande de poussière laissée par une galaxie spirale qu'elle a avalée. Son trou noir projette des jets longs d'environ un million d'années-lumière.",
  Cartwheel: "Il y a environ 400 millions d'années, une galaxie plus petite l'a traversée de part en part, faisant naître un anneau d'étoiles qui s'étend comme un ricochet dans l'eau.",
  TON618: "L'un des trous noirs les plus massifs connus : environ 40 milliards de fois la masse du Soleil. Le gaz qui y tombe brille plus que 100 000 milliards de Soleils.",
  V404Cyg: "Un trou noir d'environ 9 fois la masse du Soleil, qui arrache lentement du gaz à une étoile compagne. En 2015, il s'est embrasé si fort que des astronomes amateurs ont pu le voir.",
  Parker: "L'objet le plus rapide jamais construit. Le 24 décembre 2024, elle a traversé l'atmosphère extérieure du Soleil à environ 690 000 km/h, protégée par un bouclier thermique en carbone de 11 cm d'épaisseur.",
  Juno: "Alimentée à l'énergie solaire, même à Jupiter. Elle passe au-dessus des pôles de la planète, sous les cyclones des nuages, avec à bord trois figurines LEGO : Galilée, Jupiter et Junon.",
  Perseverance: "Un robot de la taille d'une voiture qui cherche des traces de vie passée dans le lit d'un ancien lac. Il a emporté l'hélicoptère Ingenuity, le premier engin à voler sur une autre planète.",
  Tiangong: "La station spatiale chinoise en forme de T, habitée en permanence depuis 2022 par des équipes de trois taïkonautes.",
  Roman: "Lancé le 30 août 2026. Sa caméra couvre une zone 100 fois plus grande que celle de Hubble, et la NASA s'attend à ce qu'il découvre environ 100 000 exoplanètes de plus. La science commence début 2027.",
};
FACT.T1b = FACT.T1c = FACT.T1d = FACT.T1h = FACT.T1b;
FACT['Oort Cloud'] = FACT.Oort;
const ZOD_FR = { Ari: "Le Bélier.", Tau: "Le Taureau, avec la rouge Aldébaran pour œil et les Pléiades sur l'épaule.", Gem: "Les Gémeaux, repérés par les brillantes Castor et Pollux.",
  Cnc: "Le Cancer (le Crabe) : discret, mais il abrite l'amas de la Ruche.", Leo: "Le Lion, avec la brillante Régulus en son cœur.", Vir: "La Vierge, la plus grande constellation du zodiaque. Son étoile la plus brillante est l'Épi.",
  Lib: "La Balance, le seul signe du zodiaque qui soit un objet plutôt qu'un être vivant.", Sco: "Le Scorpion, avec la supergéante rouge Antarès pour cœur.",
  Sgr: "Le Sagittaire (l'Archer). Il pointe vers le centre de notre galaxie et Sagittarius A*.", Cap: "Le Capricorne, mi-chèvre, mi-poisson.",
  Aqr: "Le Verseau, qui verse l'eau d'une jarre.", Psc: "Les Poissons, deux poissons liés par un cordon." };
function trInfo(key, i) {
  const o = { name: trName(i.name), cat: CAT[i.cat] || i.cat, dist: trDist(i.dist), fact: FACT[key] || i.fact };
  if (key.startsWith('Z_')) {
    const id = key.slice(2), m = i.fact.match(/from (\w{3} \d+ – \w{3} \d+)/);
    o.fact = id === 'Oph' ? "Le Porteur de serpent. Le Soleil la traverse chaque année, mais les 12 signes de l'astrologie l'oublient."
      : `${ZOD_FR[id]} En réalité, le Soleil passe devant elle du ${m ? frDate(m[1]).replace(' – ', ' au ') : '?'}. Les dates ont glissé en environ 2 000 ans, car l'axe de la Terre oscille lentement.`;
  }
  return o;
}

// ---------- Guided tour captions ----------
const TOUR = {
  overview: ["Notre Système solaire", "Huit planètes, cinq planètes naines et d'innombrables petits mondes"], Earth: ["La Terre", "Notre maison, éclairée par le vrai Soleil d'aujourd'hui"],
  ISS: ["La Station spatiale internationale", "Habitée en permanence depuis 2000"], Moon: ["La Lune", "À environ 384 000 km de la Terre"], Mars: ["Mars", "La planète rouge et ses deux petites lunes"],
  Jupiter: ["Jupiter", "La plus grande planète et ses quatre grandes lunes"], Saturn: ["Saturne", "Des anneaux de glace, et Titan avec ses mers de méthane"],
  Neptune: ["Neptune", "Le monde le plus venteux, à 4,5 milliards de km du Soleil"], Pluto: ["Pluton", "Une planète naine au cœur d'azote gelé"],
  Voyager1: ["Voyager 1", "Lancée en 1977, aujourd'hui dans l'espace interstellaire"], Proxima: ["Proxima du Centaure", "L'étoile la plus proche, à 4,24 années-lumière, et sa planète"],
  TRAPPIST1: ["TRAPPIST-1", "Sept mondes de la taille de la Terre autour d'une petite étoile rouge"], Orion: ["La nébuleuse d'Orion", "Une pouponnière où naissent de nouvelles étoiles"],
  Betelgeuse: ["Bételgeuse", "Une supergéante rouge qui explosera un jour"], Crab: ["La nébuleuse du Crabe", "Les restes d'une étoile qui a explosé en 1054"],
  SgrA: ["Sagittarius A*", "Le trou noir au cœur de notre galaxie"], Andromeda: ["La galaxie d'Andromède", "Notre grande voisine, à 2,5 millions d'années-lumière"],
  M87BH: ["M87*", "Le premier trou noir jamais photographié"], deep: ["L'Univers", "Chaque objet est placé dans sa vraie direction dans le ciel"],
};

// ---------- One Fact cards in French ----------
const FACTS_FR = [
  ["Saturne flotterait sur l'eau", "Elle est si légère pour sa taille que, dans une baignoire assez grande, elle flotterait à la surface."],
  ["Les anneaux de Saturne sont ultra-fins", "Ils s'étendent sur environ 280 000 km, mais ne font souvent qu'une dizaine de mètres d'épaisseur."],
  ["Il pleut peut-être des diamants sur Neptune", "Dans ses profondeurs, la pression écrasante pourrait transformer le carbone en diamants qui tombent comme de la grêle."],
  ["Un jour sur Vénus dure plus qu'une année", "Vénus met 243 jours terrestres à tourner sur elle-même, mais seulement 225 jours à faire le tour du Soleil."],
  ["Vénus tourne à l'envers", "Sur Vénus, le Soleil se lève à l'ouest et se couche à l'est."],
  ["Mercure n'est pas la planète la plus chaude", "Vénus est plus chaude, alors qu'elle est deux fois plus loin du Soleil, car son air épais piège la chaleur."],
  ["Les couchers de soleil sur Mars sont bleus", "La fine poussière martienne disperse la lumière rouge et laisse une lueur bleue autour du Soleil couchant."],
  ["Le plus haut volcan est sur Mars", "Olympus Mons mesure environ 22 km de haut : deux fois et demie l'Everest."],
  ["La tempête de Jupiter est plus grande que la Terre", "La Grande Tache rouge est une tempête plus large que notre planète, qui souffle depuis au moins 190 ans."],
  ["Galilée a découvert les lunes de Jupiter en 1610", "Avec une lunette faite maison, il a vu quatre lunes tourner autour de Jupiter : la preuve que tout ne tourne pas autour de la Terre."],
  ["Io est l'endroit le plus volcanique connu", "La gravité de Jupiter la pétrit comme une balle anti-stress et alimente environ 400 volcans actifs."],
  ["Europe a plus d'eau que la Terre", "Sous sa coquille de glace se cache un océan salé contenant environ deux fois plus d'eau que tous les océans terrestres."],
  ["Titan a de la pluie, des rivières et des mers", "Mais elles sont faites de méthane liquide, qui tombe d'un ciel orange à −179 °C."],
  ["Encelade projette de l'eau dans l'espace", "Des geysers à son pôle Sud crachent la glace d'un océan caché et alimentent l'un des anneaux de Saturne."],
  ["Cette lune a deux visages", "Japet est noire comme du charbon d'un côté et blanche comme la neige de l'autre."],
  ["Uranus roule sur le côté", "Inclinée d'environ 98°, chaque pôle connaît 42 ans de jour puis 42 ans de nuit."],
  ["La Lune s'éloigne", "Chaque année, elle s'écarte de la Terre d'environ 3,8 cm, à peu près la vitesse à laquelle poussent vos ongles."],
  ["La Terre n'est pas parfaitement ronde", "Sa rotation la fait gonfler à l'équateur : elle est environ 43 km plus large au milieu que d'un pôle à l'autre."],
  ["Pluton a un cœur", "Un immense glacier d'azote gelé en forme de cœur, large d'environ 1 000 km, photographié par New Horizons en 2015."],
  ["Une année sur Pluton dure 248 ans", "Depuis sa découverte en 1930, Pluton n'a même pas fait la moitié d'un tour du Soleil."],
  ["Le Soleil contient 99,8 % de la masse du Système solaire", "Tout le reste, planètes, lunes et astéroïdes, ne représente que les 0,2 % restants."],
  ["La lumière du Soleil a 8 minutes", "La lumière met environ 8 minutes et 20 secondes pour aller du Soleil jusqu'à vos yeux."],
  ["La comète de Halley revient en 2061", "Elle passe tous les 75 à 79 ans. Si vous la manquez, il faut attendre toute une vie."],
  ["Un astéroïde va frôler la Terre en 2029", "Le 13 avril 2029, Apophis passera plus près que de nombreux satellites, visible sans télescope."],
  ["L'objet le plus rapide jamais construit", "La sonde Parker a atteint environ 690 000 km/h : Paris–New York en moins de 30 secondes."],
  ["Une sonde a quitté le Système solaire", "Voyager 1, lancée en 1977, est entrée dans l'espace interstellaire en 2012 et nous envoie toujours des messages."],
  ["L'ISS fait le tour de la Terre en 90 minutes", "Les astronautes à bord voient environ 16 levers et 16 couchers de soleil chaque jour."],
  ["Un nouveau télescope pourrait trouver 100 000 planètes", "Le télescope spatial Roman de la NASA, lancé en 2026, va scruter d'immenses zones du ciel à la recherche de nouveaux mondes."],
  ["L'étoile la plus proche est à 4,24 années-lumière", "À la vitesse de Voyager 1, il faudrait environ 75 000 ans pour y arriver."],
  ["Bételgeuse va exploser", "Un jour, cette supergéante rouge deviendra une supernova, si brillante qu'on la verra en plein jour."],
  ["Certaines étoiles sont d'une taille inimaginable", "UY Scuti est si énorme qu'environ 750 millions de Soleils pourraient tenir à l'intérieur."],
  ["L'étoile la plus brillante a une partenaire cachée", "Sirius est accompagnée d'une naine blanche, Sirius B : une étoile comprimée à la taille de la Terre."],
  ["Cette planète est aussi légère que du polystyrène", "Kepler-7b est plus large que Jupiter, mais si gonflée que sa densité ressemble à celle de la mousse d'emballage."],
  ["Sur cette planète bleue, il pleut du verre", "HD 189733 b connaîtrait des tempêtes de verre fondu soufflées à l'horizontale à 8 000 km/h."],
  ["Ici, une année dure 18 heures", "55 Cancri e tourne si près de son étoile que sa surface pourrait être un océan de lave."],
  ["Sept planètes de la taille de la Terre, une seule étoile", "Le système TRAPPIST-1 compte sept planètes rocheuses, dont trois là où l'eau liquide pourrait exister."],
  ["On a vu cette étoile exploser en 1054", "Des astronomes chinois ont noté une « étoile invitée » visible en plein jour pendant 23 jours."],
  ["Des étoiles naissent en ce moment même", "La nébuleuse d'Orion est une pouponnière d'étoiles visible à l'œil nu, dans l'épée d'Orion."],
  ["Il y a un trou noir au centre de notre galaxie", "Sagittarius A* pèse environ 4 millions de Soleils, et la Voie lactée tourne autour."],
  ["Nous avons photographié un trou noir", "En 2019, l'Event Horizon Telescope a montré l'ombre de M87*, à 55 millions d'années-lumière."],
  ["Un trou noir peut peser 40 milliards de Soleils", "TON 618 est l'un des plus lourds connus : son bord engloutirait plusieurs fois tout notre Système solaire."],
  ["Andromède fonce vers nous", "Notre galaxie voisine rencontrera la Voie lactée dans environ 4 à 5 milliards d'années."],
  ["Une galaxie percutée par une galaxie", "L'anneau d'étoiles de la Roue de chariot s'est formé quand une galaxie plus petite l'a traversée de part en part."],
  ["On connaît plus de 6 000 exoplanètes", "La première autour d'une étoile semblable au Soleil a été découverte en 1995 ; on en connaît aujourd'hui des milliers, et la plus proche est Proxima b."],
];

// ---------- Applying a language ----------
const INFO_EN = {}; for (const [k, v] of Object.entries(INFO)) INFO_EN[k] = { ...v };
const TOUR_EN = SS.extras.TOUR.map(t => [t[1], t[2]]);
const orig = new WeakMap();
const keep = (node, get) => { if (!orig.has(node)) orig.set(node, get()); return orig.get(node); };
SS.tr = s => (SS.lang === 'fr' ? (UI[s] ?? NAME[s] ?? trName(s)) : s);

function apply(lang) {
  SS.lang = lang; document.documentElement.lang = lang;
  const fr = lang === 'fr';
  // plain text in the panel, buttons, hint and footer
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  for (const n of nodes) {
    if (n.parentElement.closest('script,style,#info,#clock,#doctitle,#dSub,#caption,#fact,#cmp,#searchRes,#docbar,#langBtn,#sunin,#labelLayer,.lbl')) continue;
    const t = n.textContent, tt = t.trim(); if (!tt) continue;
    const en = keep(n, () => t), enT = en.trim();
    const isLbl = n.parentElement.closest('.lbl,#labelLayer');
    const out = fr ? (UI[enT] ?? (isLbl || n.parentElement.closest('option') ? trName(enT) : enT)) : enT;
    n.textContent = en.replace(enT, out);
  }
  // every name floating in the 3D scene (planet names, sky labels, compass points), including hidden ones
  SS.scene.traverse(o => { if (!o.isCSS2DObject) return; const el = o.element; if (el.children.length) return;
    const en = keep(el, () => el.textContent); el.textContent = !fr ? en : el.classList.contains('cardinal') ? (en === 'W' ? 'O' : en) : trName(en); });
  for (const og of document.querySelectorAll('optgroup')) { const en = keep(og, () => og.label); og.label = fr ? (UI[en] ?? en) : en; }
  // documentary button: narration is in English
  const db = $('docBtn'); if (db) { const en = db.textContent.replace(/, en anglais\)$/, ')').replace('Documentaire', 'Documentary'); db.textContent = fr ? en.replace('Documentary', 'Documentaire').replace(/\)$/, ', en anglais)') : en.replace(', en anglais)', ')'); }
  $('search').placeholder = SS.tr('🔍 Search planets, moons, stars, galaxies…');
  // info cards
  for (const [k, v] of Object.entries(INFO_EN)) INFO[k] = fr ? { ...v, ...trInfo(k, v) } : { ...v };
  SS.extras.TOUR.forEach((t, i) => { const f = TOUR[t[0]]; [t[1], t[2]] = fr && f ? f : TOUR_EN[i]; });
  if ($('info').style.display === 'block' && SS.more.current && INFO[SS.more.current]) SS.onFocus(SS.more.current);
  SS.more.refreshFact(); SS.more.redrawCmp(); SS.cosmos.syncSky?.();
  for (const b of document.querySelectorAll('#langBtn button')) b.classList.toggle('on', b.dataset.l === lang);
  try { localStorage.setItem('ss_lang', lang); } catch (e) { }
}
SS.more.factText = i => (SS.lang === 'fr' && FACTS_FR[i] ? [SS.more.FACTS[i][0], ...FACTS_FR[i]] : SS.more.FACTS[i]);
SS.setLang = apply;

{ // EN | FR switch
  const b = document.createElement('div'); b.id = 'langBtn';
  b.innerHTML = '<button type="button" data-l="en" title="English">EN</button><button type="button" data-l="fr" title="Français">FR</button>';
  document.body.appendChild(b);
  b.onclick = e => { const l = e.target.dataset?.l; if (l && l !== SS.lang) apply(l); };
}
let start = 'en';
try { start = new URLSearchParams(location.search).get('lang') || localStorage.getItem('ss_lang') || ((navigator.language || '').startsWith('fr') ? 'fr' : 'en'); } catch (e) { }
apply(start === 'fr' ? 'fr' : 'en');
setTimeout(() => apply(SS.lang), 3000);   // the documentary button finishes its own label a moment after loading
