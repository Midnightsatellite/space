// =====================================================================
// Full cards (EN + FR): famous spacecraft, the big moons, famous stars and deep-sky objects
// =====================================================================
const SS = window.SS;
const { INFO } = SS.cosmos;
const fr = () => SS.lang === 'fr';
const T = (l, lf, v, vf) => [l, lf, v, vf];

const D = {
  // ---------------- spacecraft ----------------
  Hubble: { intro: ['Launched in 1990, the telescope that changed how we see the universe, and still at work.', 'Lancé en 1990, le télescope qui a changé notre regard sur l\'Univers, et toujours au travail.'],
    tiles: [T('Type', 'Type', 'Visible and ultraviolet space telescope', 'Télescope spatial visible et ultraviolet'), T('Launch', 'Lancement', '24 Apr 1990 · Space Shuttle Discovery', '24 avr. 1990 · navette Discovery'),
      T('Orbit', 'Orbite', 'about 500 km up, once every ~95 minutes', 'à environ 500 km, un tour toutes les ~95 minutes'), T('Mirror', 'Miroir', '2.4 m', '2,4 m'),
      T('Size', 'Taille', '13.2 m long, like a bus', '13,2 m de long, comme un bus'), T('Status', 'Statut', 'Working on one gyroscope since June 2024, expected into the 2030s', 'Fonctionne sur un seul gyroscope depuis juin 2024, prévu jusque dans les années 2030')],
    facts: [['Its main mirror was ground very slightly wrong. Astronauts fitted corrective optics in 1993, like glasses.', 'Son miroir principal avait été poli très légèrement de travers. Des astronautes lui ont posé une optique correctrice en 1993, comme des lunettes.'],
      ['Shuttle astronauts visited it five times, from 1993 to 2009, to repair and upgrade it in orbit.', 'Les astronautes de la navette lui ont rendu visite cinq fois, de 1993 à 2009, pour le réparer et l\'améliorer en orbite.'],
      ['The Hubble Deep Field (1995) pointed at a tiny, empty-looking patch of sky and found thousands of galaxies.', 'Le Hubble Deep Field (1995) a visé un minuscule coin de ciel qui semblait vide et y a trouvé des milliers de galaxies.'],
      ['It helped show that the universe\'s expansion is speeding up, and pin its age at about 13.8 billion years.', 'Il a aidé à montrer que l\'expansion de l\'Univers accélère et à fixer son âge à environ 13,8 milliards d\'années.'],
      ['Named after Edwin Hubble, who proved in the 1920s that there are galaxies beyond our own.', 'Il porte le nom d\'Edwin Hubble, qui a prouvé dans les années 1920 qu\'il existe des galaxies au-delà de la nôtre.']] },
  ISS: { intro: ['The International Space Station: a home and laboratory in orbit, with people on board every day since 2 November 2000.', 'La Station spatiale internationale : une maison et un laboratoire en orbite, habités chaque jour depuis le 2 novembre 2000.'],
    tiles: [T('Type', 'Type', 'Crewed space station', 'Station spatiale habitée'), T('First part', 'Premier module', 'Zarya, November 1998', 'Zarya, novembre 1998'),
      T('Height', 'Altitude', 'about 400 km', 'environ 400 km'), T('Speed', 'Vitesse', 'about 28,000 km/h, once round Earth every ~90 minutes', 'environ 28 000 km/h, un tour de la Terre toutes les ~90 minutes'),
      T('Size', 'Taille', 'about 109 m across, like a football pitch', 'environ 109 m d\'envergure, comme un terrain de football'), T('Mass', 'Masse', 'about 420 tonnes', 'environ 420 tonnes'),
      T('Partners', 'Partenaires', 'USA, Russia, Europe, Japan and Canada', 'États-Unis, Russie, Europe, Japon et Canada'), T('Future', 'Avenir', 'to be retired around 2030', 'retrait prévu vers 2030')],
    facts: [['The crew see about 16 sunrises and 16 sunsets every day.', 'L\'équipage voit environ 16 levers et 16 couchers de Soleil chaque jour.'],
      ['From the ground it looks like a very bright star moving steadily across the sky, with no flashing lights.', 'Depuis le sol, on la voit comme une étoile très brillante qui traverse le ciel sans clignoter.'],
      ['Inside, it has about as much living space as a six-bedroom house.', 'À l\'intérieur, elle offre à peu près l\'espace d\'une maison de six chambres.'],
      ['Astronauts exercise about two hours a day to keep their bones and muscles strong in weightlessness.', 'Les astronautes font environ deux heures de sport par jour pour garder os et muscles en forme en apesanteur.'],
      ['NASA plans to steer it down into a remote part of the Pacific Ocean with a SpaceX-built deorbit vehicle.', 'La NASA prévoit de la faire retomber dans une zone isolée du Pacifique grâce à un véhicule de désorbitation construit par SpaceX.']] },
  Voyager1: { closed: true, intro: ['The most distant human-made object, travelling through interstellar space since 2012.', 'L\'objet humain le plus lointain, en voyage dans l\'espace interstellaire depuis 2012.'],
    tiles: [T('Launch', 'Lancement', '5 Sep 1977 · Titan IIIE, Cape Canaveral', '5 sept. 1977 · Titan IIIE, cap Canaveral'), T('Visited', 'Visites', 'Jupiter (1979), Saturn (1980)', 'Jupiter (1979), Saturne (1980)'),
      T('Speed', 'Vitesse', 'about 61,000 km/h', 'environ 61 000 km/h'), T('Interstellar since', 'Interstellaire depuis', 'August 2012', 'août 2012'),
      T('Power', 'Énergie', 'plutonium generator, now under half its first power', 'générateur au plutonium, moins de la moitié de sa puissance initiale'), T('Instruments on', 'Instruments allumés', '2 of 10 (plasma waves, magnetic field)', '2 sur 10 (ondes de plasma, champ magnétique)')],
    facts: [['On 14 February 1990 it turned round and took the "Pale Blue Dot" photo of Earth from 6 billion km.', 'Le 14 février 1990, elle s\'est retournée pour prendre la photo du « point bleu pâle », la Terre vue à 6 milliards de km.'],
      ['In November 2026 it became the first spacecraft one light-day from Earth: a radio signal takes 24 hours each way.', 'En novembre 2026, elle est devenue le premier engin à un jour-lumière de la Terre : un signal radio met 24 heures dans chaque sens.'],
      ['Engineers switch instruments off one by one to save power; the latest went off in April 2026.', 'Les ingénieurs éteignent les instruments un par un pour économiser l\'énergie ; le plus récent a été éteint en avril 2026.'],
      ['It carries the Golden Record, a message from Earth with sounds, music and pictures.', 'Elle emporte le disque d\'or, un message de la Terre avec des sons, de la musique et des images.']] },
  Voyager2: { closed: true, intro: ['The only spacecraft ever to visit Uranus and Neptune, now in interstellar space.', 'Le seul engin à avoir visité Uranus et Neptune, aujourd\'hui dans l\'espace interstellaire.'],
    tiles: [T('Launch', 'Lancement', '20 Aug 1977, 16 days before Voyager 1', '20 août 1977, 16 jours avant Voyager 1'), T('Visited', 'Visites', 'Jupiter, Saturn, Uranus (1986), Neptune (1989)', 'Jupiter, Saturne, Uranus (1986), Neptune (1989)'),
      T('Speed', 'Vitesse', 'about 55,000 km/h', 'environ 55 000 km/h'), T('Interstellar since', 'Interstellaire depuis', 'November 2018', 'novembre 2018'),
      T('Instruments on', 'Instruments allumés', '3 of 10 (cosmic rays, magnetic field, plasma waves)', '3 sur 10 (rayons cosmiques, champ magnétique, ondes de plasma)'), T('Power', 'Énergie', 'plutonium generator', 'générateur au plutonium')],
    facts: [['It used a rare line-up of the outer planets that happens about once every 175 years.', 'Elle a profité d\'un alignement rare des planètes extérieures, qui ne se produit qu\'environ tous les 175 ans.'],
      ['It discovered 10 moons of Uranus and 6 of Neptune, and Neptune\'s Great Dark Spot.', 'Elle a découvert 10 lunes d\'Uranus et 6 de Neptune, ainsi que la Grande Tache sombre de Neptune.'],
      ['In 2026 engineers tried a clever power-saving trick on it first, before Voyager 1, to keep its instruments running longer.', 'En 2026, les ingénieurs ont d\'abord testé sur elle une astuce pour économiser l\'énergie, avant Voyager 1, afin de garder ses instruments plus longtemps.']] },
  NewHorizons: { intro: ['The first spacecraft to visit Pluto, now exploring the Kuiper Belt far beyond it.', 'Le premier engin à avoir visité Pluton, qui explore maintenant la ceinture de Kuiper loin au-delà.'],
    tiles: [T('Launch', 'Lancement', '19 Jan 2006 · Atlas V, the fastest launch ever', '19 janv. 2006 · Atlas V, le lancement le plus rapide de l\'histoire'), T('Pluto flyby', 'Survol de Pluton', '14 July 2015, 12,500 km above it', '14 juillet 2015, à 12 500 km'),
      T('Arrokoth flyby', 'Survol d\'Arrokoth', '1 January 2019', '1er janvier 2019'), T('Distance', 'Distance', 'about 9.5 billion km from Earth', 'environ 9,5 milliards de km de la Terre'),
      T('Size', 'Taille', 'about the size of a grand piano, 478 kg', 'à peu près la taille d\'un piano à queue, 478 kg'), T('Status', 'Statut', 'Woke up on 23 June 2026 after a long sleep, healthy', 'Réveillée le 23 juin 2026 après un long sommeil, en bonne santé')],
    facts: [['Arrokoth, a "snowman" made of two joined lumps, is the most distant object ever visited.', 'Arrokoth, un « bonhomme de neige » fait de deux blocs collés, est l\'objet le plus lointain jamais visité.'],
      ['It slept from August 2025 to June 2026, collecting data on dust and gas at the edge of the Solar System.', 'Elle a dormi d\'août 2025 à juin 2026 en collectant des données sur la poussière et le gaz aux confins du Système solaire.'],
      ['Its radio signals take about 9 hours to reach Earth.', 'Ses signaux radio mettent environ 9 heures pour arriver sur Terre.'],
      ['It carries some of the ashes of Clyde Tombaugh, who discovered Pluto in 1930.', 'Elle emporte une partie des cendres de Clyde Tombaugh, qui a découvert Pluton en 1930.']] },
  Juno: { intro: ['NASA\'s solar-powered orbiter at Jupiter, studying the planet\'s insides, storms, auroras and big moons.', 'L\'orbiteur solaire de la NASA autour de Jupiter, qui étudie son intérieur, ses tempêtes, ses aurores et ses grandes lunes.'],
    tiles: [T('Launch', 'Lancement', '5 Aug 2011 · Atlas V', '5 août 2011 · Atlas V'), T('At Jupiter since', 'À Jupiter depuis', '4 July 2016', '4 juillet 2016'),
      T('Power', 'Énergie', 'three 9 m solar wings', 'trois ailes solaires de 9 m'), T('Shield', 'Blindage', 'a titanium vault protects its electronics from radiation', 'un coffre en titane protège son électronique des radiations'),
      T('Status', 'Statut', 'Second extended mission since October 2025', 'Deuxième mission prolongée depuis octobre 2025')],
    facts: [['The first solar-powered spacecraft to work at Jupiter, where sunlight is 25 times weaker than at Earth.', 'Le premier engin solaire à travailler autour de Jupiter, où le Soleil est 25 fois plus faible que sur Terre.'],
      ['It found that Jupiter\'s core is "fuzzy", blended into the layers around it rather than a neat solid ball.', 'Elle a découvert que le cœur de Jupiter est « flou », mélangé aux couches qui l\'entourent plutôt qu\'une boule solide bien nette.'],
      ['It flew close past Ganymede (2021), Europa (2022) and Io (2023–24).', 'Elle est passée tout près de Ganymède (2021), d\'Europe (2022) et d\'Io (2023–24).'],
      ['It carries three LEGO figures: Galileo, the god Jupiter and the goddess Juno.', 'Elle emporte trois figurines LEGO : Galilée, le dieu Jupiter et la déesse Junon.']] },
  Chandra: { intro: ['NASA\'s X-ray eye on the hottest, most violent places in the universe.', 'L\'œil à rayons X de la NASA sur les lieux les plus chauds et les plus violents de l\'Univers.'],
    tiles: [T('Launch', 'Lancement', '23 Jul 1999 · Space Shuttle Columbia', '23 juil. 1999 · navette Columbia'), T('Orbit', 'Orbite', 'up to 139,000 km from Earth, once every 64 hours', 'jusqu\'à 139 000 km de la Terre, un tour toutes les 64 heures'),
      T('Length', 'Longueur', '13.8 m', '13,8 m'), T('Planned life', 'Durée prévue', '5 years, still working after 27', '5 ans, toujours actif après 27'), T('Status', 'Statut', 'Working, on a reduced budget', 'En activité, avec un budget réduit')],
    facts: [['X-rays can\'t pass through our air, so X-ray telescopes have to work in space.', 'Les rayons X ne traversent pas notre atmosphère : les télescopes X doivent donc travailler dans l\'espace.'],
      ['Its mirrors are so smooth that if Earth were as smooth, the highest mountain would be less than 2 m tall.', 'Ses miroirs sont si lisses que si la Terre l\'était autant, sa plus haute montagne ferait moins de 2 m.'],
      ['It launched on the shuttle flight commanded by Eileen Collins, the first woman to command a space shuttle.', 'Il a été lancé lors du vol commandé par Eileen Collins, première femme commandante d\'une navette spatiale.'],
      ['Named after astrophysicist Subrahmanyan Chandrasekhar, who worked out how big a white dwarf star can be.', 'Il porte le nom de l\'astrophysicien Subrahmanyan Chandrasekhar, qui a calculé la masse maximale d\'une naine blanche.']] },
  TESS: { intro: ['NASA\'s planet hunter: it watches whole strips of sky for the tiny dip in starlight when a planet crosses its star.', 'Le chasseur de planètes de la NASA : il surveille de grandes bandes de ciel pour repérer la petite baisse de lumière quand une planète passe devant son étoile.'],
    tiles: [T('Launch', 'Lancement', '18 Apr 2018 · Falcon 9', '18 avr. 2018 · Falcon 9'), T('Orbit', 'Orbite', '13.7 days, in step with the Moon', '13,7 jours, en cadence avec la Lune'),
      T('Cameras', 'Caméras', '4, together covering a 24° × 96° strip', '4, couvrant ensemble une bande de 24° × 96°'), T('Planets', 'Planètes', 'about 700 confirmed and over 5,000 candidates by 2025', 'environ 700 confirmées et plus de 5 000 candidates en 2025'),
      T('Led by', 'Dirigé par', 'MIT, for NASA', 'le MIT, pour la NASA'), T('Status', 'Statut', 'Extended mission', 'Mission prolongée')],
    facts: [['Its looping orbit is half the Moon\'s period, so the Moon\'s pull keeps it stable for decades.', 'Son orbite en boucle dure la moitié de celle de la Lune : l\'attraction lunaire la garde stable pendant des décennies.'],
      ['It found TOI-700 d, an Earth-sized planet in its star\'s habitable zone, in 2020.', 'Il a trouvé TOI-700 d, une planète de la taille de la Terre dans la zone habitable de son étoile, en 2020.'],
      ['A 2026 re-analysis of its data turned up more than 10,000 new candidate planets.', 'En 2026, une nouvelle analyse de ses données a révélé plus de 10 000 nouvelles planètes candidates.']] },

  // ---------------- big moons ----------------
  Io: { intro: ['Jupiter\'s fiery moon, the most volcanic place in the Solar System.', 'La lune de feu de Jupiter, l\'endroit le plus volcanique du Système solaire.'],
    tiles: [T('Diameter', 'Diamètre', '3,643 km', '3 643 km'), T('From Jupiter', 'De Jupiter', '422,000 km', '422 000 km'), T('Orbit', 'Orbite', '1.8 days', '1,8 jour'),
      T('Temperature', 'Température', 'about −130 °C, lava over 1,200 °C', 'environ −130 °C, lave à plus de 1 200 °C'), T('Found', 'Découverte', '1610, Galileo', '1610, Galilée')],
    facts: [['It has more than 400 active volcanoes, some throwing plumes 400 km high.', 'Il a plus de 400 volcans actifs, dont certains projettent des panaches à 400 km de haut.'],
      ['Jupiter\'s gravity squeezes and stretches it every orbit, heating its insides.', 'La gravité de Jupiter l\'étire et le comprime à chaque orbite, ce qui chauffe son intérieur.'],
      ['Sulfur paints its surface yellow, orange and red, like a pizza.', 'Le soufre peint sa surface en jaune, orange et rouge, comme une pizza.']] },
  Europa: { intro: ['An icy moon of Jupiter hiding a salty ocean, one of the best places to look for life.', 'Une lune glacée de Jupiter qui cache un océan salé, l\'un des meilleurs endroits où chercher la vie.'],
    tiles: [T('Diameter', 'Diamètre', '3,122 km, a bit smaller than our Moon', '3 122 km, un peu plus petite que notre Lune'), T('From Jupiter', 'De Jupiter', '671,000 km', '671 000 km'), T('Orbit', 'Orbite', '3.6 days', '3,6 jours'),
      T('Temperature', 'Température', 'about −160 °C', 'environ −160 °C'), T('Found', 'Découverte', '1610, Galileo', '1610, Galilée')],
    facts: [['Its ocean may hold about twice as much water as all of Earth\'s oceans.', 'Son océan pourrait contenir environ deux fois plus d\'eau que tous les océans de la Terre.'],
      ['The ice shell on top is probably 15 to 25 km thick, criss-crossed by long brown cracks.', 'La croûte de glace fait sans doute 15 à 25 km d\'épaisseur, rayée de longues fissures brunes.'],
      ['NASA\'s Europa Clipper arrives at Jupiter in April 2030 to fly past it dozens of times.', 'Europa Clipper, de la NASA, arrive à Jupiter en avril 2030 pour la survoler des dizaines de fois.']] },
  Ganymede: { intro: ['The largest moon in the Solar System, bigger than the planet Mercury.', 'La plus grande lune du Système solaire, plus grande que la planète Mercure.'],
    tiles: [T('Diameter', 'Diamètre', '5,268 km', '5 268 km'), T('From Jupiter', 'De Jupiter', '1.07 million km', '1,07 million de km'), T('Orbit', 'Orbite', '7.2 days', '7,2 jours'),
      T('Temperature', 'Température', 'about −160 °C', 'environ −160 °C'), T('Found', 'Découverte', '1610, Galileo', '1610, Galilée')],
    facts: [['The only moon known to make its own magnetic field, with small auroras of its own.', 'La seule lune connue à produire son propre champ magnétique, avec ses propres petites aurores.'],
      ['A salty ocean is thought to lie deep under its ice.', 'Un océan salé se cacherait loin sous sa glace.'],
      ['ESA\'s JUICE mission will become the first spacecraft to orbit a moon other than ours, around Ganymede.', 'La mission JUICE de l\'ESA sera le premier engin à se placer en orbite autour d\'une autre lune que la nôtre : Ganymède.']] },
  Callisto: { intro: ['The most heavily cratered world in the Solar System, almost unchanged for 4 billion years.', 'Le monde le plus criblé de cratères du Système solaire, presque inchangé depuis 4 milliards d\'années.'],
    tiles: [T('Diameter', 'Diamètre', '4,821 km', '4 821 km'), T('From Jupiter', 'De Jupiter', '1.88 million km', '1,88 million de km'), T('Orbit', 'Orbite', '16.7 days', '16,7 jours'),
      T('Temperature', 'Température', 'about −140 °C', 'environ −140 °C'), T('Found', 'Découverte', '1610, Galileo', '1610, Galilée')],
    facts: [['Its surface is covered in craters, edge to edge: there are almost no volcanoes or mountains to erase them.', 'Sa surface est couverte de cratères d\'un bout à l\'autre : presque aucun volcan ni montagne pour les effacer.'],
      ['It is far enough from Jupiter to escape most of its deadly radiation.', 'Elle est assez loin de Jupiter pour échapper à l\'essentiel de ses radiations mortelles.'],
      ['It may hide an ocean too, deep below the ice.', 'Elle pourrait aussi cacher un océan, loin sous la glace.']] },
  Titan: { intro: ['Saturn\'s giant moon, the only moon with thick air, and with rain, rivers and seas of methane.', 'La lune géante de Saturne, la seule lune avec une atmosphère épaisse, avec de la pluie, des rivières et des mers de méthane.'],
    tiles: [T('Diameter', 'Diamètre', '5,150 km, bigger than Mercury', '5 150 km, plus grande que Mercure'), T('From Saturn', 'De Saturne', '1.22 million km', '1,22 million de km'), T('Orbit', 'Orbite', '15.9 days', '15,9 jours'),
      T('Temperature', 'Température', 'about −179 °C', 'environ −179 °C'), T('Found', 'Découverte', '1655, Christiaan Huygens', '1655, Christiaan Huygens'), T('Air pressure', 'Pression', '1.5 × Earth\'s', '1,5 × celle de la Terre')],
    facts: [['The Huygens probe landed there on 14 January 2005: the most distant landing ever.', 'La sonde Huygens s\'y est posée le 14 janvier 2005 : l\'atterrissage le plus lointain de l\'histoire.'],
      ['With its thick air and weak gravity, a person could fly there with wings strapped to their arms.', 'Avec son air épais et sa faible gravité, on pourrait y voler avec des ailes attachées aux bras.'],
      ['NASA\'s Dragonfly drone is due to launch in July 2028 and arrive in 2034.', 'Le drone Dragonfly de la NASA doit décoller en juillet 2028 et arriver en 2034.']] },
  Enceladus: { intro: ['A small, bright white moon of Saturn that sprays water from an ocean into space.', 'Une petite lune blanche et brillante de Saturne qui projette dans l\'espace l\'eau d\'un océan.'],
    tiles: [T('Diameter', 'Diamètre', '504 km, about the width of Great Britain', '504 km, à peu près la largeur de la Grande-Bretagne'), T('From Saturn', 'De Saturne', '238,000 km', '238 000 km'), T('Orbit', 'Orbite', '1.4 days', '1,4 jour'),
      T('Temperature', 'Température', 'about −198 °C', 'environ −198 °C'), T('Found', 'Découverte', '1789, William Herschel', '1789, William Herschel')],
    facts: [['Geysers shoot out of four long cracks at its south pole, the "tiger stripes".', 'Des geysers jaillissent de quatre longues fissures à son pôle Sud, les « rayures de tigre ».'],
      ['The spray feeds one of Saturn\'s rings, the E ring.', 'Ces jets alimentent l\'un des anneaux de Saturne, l\'anneau E.'],
      ['Cassini flew through the plumes and found salt, organic molecules and phosphorus: key ingredients for life.', 'Cassini a traversé les panaches et y a trouvé du sel, des molécules organiques et du phosphore : des ingrédients clés de la vie.']] },
  Triton: { intro: ['Neptune\'s biggest moon, going round the wrong way: probably a captured Kuiper Belt world.', 'La plus grande lune de Neptune, qui tourne à l\'envers : sans doute un monde de la ceinture de Kuiper capturé.'],
    tiles: [T('Diameter', 'Diamètre', '2,707 km', '2 707 km'), T('From Neptune', 'De Neptune', '355,000 km', '355 000 km'), T('Orbit', 'Orbite', '5.9 days, backwards', '5,9 jours, à l\'envers'),
      T('Temperature', 'Température', 'about −235 °C, one of the coldest surfaces known', 'environ −235 °C, l\'une des surfaces les plus froides connues'), T('Found', 'Découverte', '1846, William Lassell, 17 days after Neptune', '1846, William Lassell, 17 jours après Neptune')],
    facts: [['Voyager 2 saw geysers of nitrogen on it in 1989.', 'Voyager 2 y a vu des geysers d\'azote en 1989.'],
      ['It is slowly spiralling in and may one day be torn apart into a ring around Neptune.', 'Elle se rapproche lentement en spirale et pourrait un jour être déchirée en un anneau autour de Neptune.']] },
  Phobos: { intro: ['Mars\'s larger moon, a dark lumpy rock skimming just 6,000 km above the planet.', 'La plus grande lune de Mars, un rocher sombre et bosselé qui frôle la planète à seulement 6 000 km.'],
    tiles: [T('Size', 'Taille', 'about 27 × 22 × 18 km', 'environ 27 × 22 × 18 km'), T('Orbit', 'Orbite', '7 h 39 min, faster than Mars spins', '7 h 39 min, plus vite que Mars ne tourne'), T('Found', 'Découverte', '1877, Asaph Hall', '1877, Asaph Hall')],
    facts: [['Seen from Mars, it rises in the west and sets in the east, twice a day.', 'Vue de Mars, elle se lève à l\'ouest et se couche à l\'est, deux fois par jour.'],
      ['It is slowly falling towards Mars and will break apart or crash in tens of millions of years.', 'Elle tombe lentement vers Mars et se brisera ou s\'écrasera dans quelques dizaines de millions d\'années.']] },

  // ---------------- stars and deep sky ----------------
  Sirius: { intro: ['The brightest star in our night sky, the "Dog Star" in Canis Major.', 'L\'étoile la plus brillante de notre ciel nocturne, l\'étoile du Chien dans le Grand Chien.'],
    tiles: [T('Distance', 'Distance', '8.6 light-years', '8,6 années-lumière'), T('Type', 'Type', 'hot white star', 'étoile blanche chaude'), T('Mass', 'Masse', 'about 2 Suns', 'environ 2 Soleils'),
      T('Brightness', 'Éclat', 'about 25 × the Sun', 'environ 25 × le Soleil'), T('Surface', 'Surface', 'about 9,700 °C', 'environ 9 700 °C')],
    facts: [['It has a tiny companion, Sirius B: a white dwarf the size of Earth but as heavy as the Sun.', 'Elle a un minuscule compagnon, Sirius B : une naine blanche de la taille de la Terre mais aussi lourde que le Soleil.'],
      ['Ancient Egyptians watched for it rising at dawn, which warned that the Nile flood was coming.', 'Les Égyptiens guettaient son lever à l\'aube, qui annonçait la crue du Nil.']] },
  Betelgeuse: { intro: ['The red shoulder of Orion: a huge, ageing supergiant that will one day explode.', 'L\'épaule rouge d\'Orion : une immense supergéante vieillissante qui explosera un jour.'],
    tiles: [T('Distance', 'Distance', 'about 550 light-years', 'environ 550 années-lumière'), T('Type', 'Type', 'red supergiant', 'supergéante rouge'), T('Size', 'Taille', 'in the Sun\'s place it would reach past Mars', 'à la place du Soleil, elle dépasserait l\'orbite de Mars'),
      T('Surface', 'Surface', 'about 3,300 °C', 'environ 3 300 °C')],
    facts: [['In 2019–2020 it dimmed dramatically: it had puffed out a cloud of dust that blocked some of its light.', 'En 2019–2020, elle a nettement faibli : elle avait expulsé un nuage de poussière qui masquait une partie de sa lumière.'],
      ['When it explodes as a supernova, perhaps within 100,000 years, it will be visible in daylight for weeks.', 'Quand elle explosera en supernova, peut-être d\'ici 100 000 ans, on la verra en plein jour pendant des semaines.']] },
  Polaris: { intro: ['The North Star: it sits almost exactly above Earth\'s North Pole, so it barely moves all night.', 'L\'étoile polaire : elle se trouve presque exactement au-dessus du pôle Nord, et ne bouge presque pas de la nuit.'],
    tiles: [T('Distance', 'Distance', 'about 430 light-years', 'environ 430 années-lumière'), T('Type', 'Type', 'yellow supergiant, pulsing slightly', 'supergéante jaune, qui pulse légèrement'), T('System', 'Système', 'three stars', 'trois étoiles')],
    facts: [['It is not the brightest star: about 50th. It is famous because of where it is.', 'Ce n\'est pas l\'étoile la plus brillante, environ la 50e : elle est célèbre pour sa position.'],
      ['Earth\'s axis slowly wobbles, so in about 12,000 years Vega will be the pole star.', 'L\'axe de la Terre oscille lentement : dans environ 12 000 ans, Véga sera l\'étoile polaire.']] },
  Proxima: { intro: ['The closest star to the Sun: a small, dim red dwarf with planets of its own.', 'L\'étoile la plus proche du Soleil : une petite naine rouge peu lumineuse, avec ses propres planètes.'],
    tiles: [T('Distance', 'Distance', '4.24 light-years', '4,24 années-lumière'), T('Type', 'Type', 'red dwarf', 'naine rouge'), T('Mass', 'Masse', 'about 1/8 of the Sun', 'environ 1/8 du Soleil'),
      T('Planets', 'Planètes', 'at least two, including Proxima b in the habitable zone', 'au moins deux, dont Proxima b dans la zone habitable')],
    facts: [['Too faint to see without a telescope, even though it is our nearest star.', 'Trop faible pour être vue sans télescope, bien qu\'elle soit notre plus proche voisine.'],
      ['Voyager 1 would need about 73,000 years to get there.', 'Voyager 1 mettrait environ 73 000 ans pour y arriver.'],
      ['It throws out powerful flares that could strip the air from its planets.', 'Elle lance de puissantes éruptions qui pourraient arracher l\'atmosphère de ses planètes.']] },
  AlphaCen: { intro: ['Our nearest star system: two Sun-like stars, A and B, with Proxima as a distant third.', 'Notre système stellaire le plus proche : deux étoiles semblables au Soleil, A et B, avec Proxima en troisième, plus loin.'],
    tiles: [T('Distance', 'Distance', '4.37 light-years', '4,37 années-lumière'), T('A and B', 'A et B', 'circle each other every 80 years', 'tournent l\'une autour de l\'autre en 80 ans'), T('In the sky', 'Dans le ciel', '3rd brightest star, too far south to see from the UK', '3e étoile la plus brillante, trop au sud pour être vue du Royaume-Uni')],
    facts: [['In 2025 the James Webb telescope spotted a possible giant planet around Alpha Centauri A.', 'En 2025, le télescope James Webb a repéré une possible planète géante autour d\'Alpha du Centaure A.'],
      ['It is the setting for Avatar\'s Pandora and the San-Ti of 3 Body Problem.', 'C\'est là que se trouvent Pandora dans Avatar et les San-Ti de 3 Body Problem.']] },
  Vega: { intro: ['A bright blue-white star in Lyra, high overhead on summer nights.', 'Une brillante étoile blanc-bleu de la Lyre, haut dans le ciel les nuits d\'été.'],
    tiles: [T('Distance', 'Distance', 'about 25 light-years', 'environ 25 années-lumière'), T('Mass', 'Masse', 'about 2 Suns', 'environ 2 Soleils'), T('Spin', 'Rotation', 'so fast it bulges at the equator', 'si rapide qu\'elle est renflée à l\'équateur')],
    facts: [['It will be the pole star again in about 12,000 years.', 'Elle redeviendra l\'étoile polaire dans environ 12 000 ans.'],
      ['A disc of dust around it was one of the first found around another star (1983).', 'Le disque de poussière qui l\'entoure a été l\'un des premiers découverts autour d\'une autre étoile (1983).'],
      ['In the film Contact, the alien message comes from Vega.', 'Dans le film Contact, le message extraterrestre vient de Véga.']] },
  Orion: { intro: ['A huge cloud of gas and dust where new stars are being born, in Orion\'s sword.', 'Un immense nuage de gaz et de poussière où naissent de nouvelles étoiles, dans l\'épée d\'Orion.'],
    tiles: [T('Distance', 'Distance', 'about 1,350 light-years', 'environ 1 350 années-lumière'), T('Size', 'Taille', 'about 24 light-years across', 'environ 24 années-lumière'), T('See it', 'Pour la voir', 'with the naked eye, as a fuzzy "star" below the belt', 'à l\'œil nu, comme une « étoile » floue sous la ceinture')],
    facts: [['At its heart, four bright young stars, the Trapezium, light the whole cloud.', 'En son cœur, quatre jeunes étoiles brillantes, le Trapèze, éclairent tout le nuage.'],
      ['Hubble found dozens of baby solar systems there: discs of dust that may form planets.', 'Hubble y a trouvé des dizaines de systèmes solaires en formation : des disques de poussière qui pourraient former des planètes.']] },
  Andromeda: { intro: ['Our nearest big neighbour galaxy, and the most distant thing you can see with your own eyes.', 'Notre grande galaxie voisine la plus proche, et l\'objet le plus lointain visible à l\'œil nu.'],
    tiles: [T('Distance', 'Distance', 'about 2.5 million light-years', 'environ 2,5 millions d\'années-lumière'), T('Stars', 'Étoiles', 'about a trillion', 'environ mille milliards'), T('Size', 'Taille', 'about 220,000 light-years across', 'environ 220 000 années-lumière')],
    facts: [['In 1923 Edwin Hubble showed it is a separate galaxy, far outside the Milky Way.', 'En 1923, Edwin Hubble a montré que c\'est une galaxie à part, loin de la Voie lactée.'],
      ['It is heading our way at about 110 km/s; a 2025 study gives about a 50% chance of a merger within 10 billion years.', 'Elle fonce vers nous à environ 110 km/s ; une étude de 2025 donne environ une chance sur deux de fusion d\'ici 10 milliards d\'années.']] },
  SgrA: { intro: ['The supermassive black hole at the centre of our galaxy.', 'Le trou noir supermassif au centre de notre galaxie.'],
    tiles: [T('Distance', 'Distance', 'about 26,700 light-years', 'environ 26 700 années-lumière'), T('Mass', 'Masse', 'about 4 million Suns', 'environ 4 millions de Soleils'), T('First picture', 'Première image', 'May 2022, Event Horizon Telescope', 'mai 2022, Event Horizon Telescope')],
    facts: [['Astronomers weighed it by watching stars whip around it for decades: a Nobel Prize in 2020.', 'Les astronomes l\'ont pesé en observant pendant des décennies des étoiles tourner autour : prix Nobel 2020.'],
      ['It is a quiet eater, swallowing very little gas compared with other giant black holes.', 'C\'est un mangeur discret, qui avale très peu de gaz comparé à d\'autres trous noirs géants.']] },
  M87BH: { intro: ['The first black hole ever photographed, at the heart of the galaxy M87.', 'Le premier trou noir jamais photographié, au cœur de la galaxie M87.'],
    tiles: [T('Distance', 'Distance', 'about 55 million light-years', 'environ 55 millions d\'années-lumière'), T('Mass', 'Masse', 'about 6.5 billion Suns', 'environ 6,5 milliards de Soleils'), T('First picture', 'Première image', 'April 2019, Event Horizon Telescope', 'avril 2019, Event Horizon Telescope')],
    facts: [['The picture needed radio telescopes all over the world working together as one Earth-sized dish.', 'Cette image a demandé des radiotélescopes du monde entier, travaillant ensemble comme une antenne de la taille de la Terre.'],
      ['It fires a jet of particles about 5,000 light-years long, close to the speed of light.', 'Il lance un jet de particules d\'environ 5 000 années-lumière, presque à la vitesse de la lumière.']] },
};

const card = (k, F) => {
  const d = D[k], i = F ? 1 : 0;
  const tiles = d.tiles.map(t => `<div style="background:rgba(140,160,255,.08);border-radius:8px;padding:5px 7px"><div style="font-size:10px;letter-spacing:.04em;text-transform:uppercase;opacity:.65">${t[i]}</div><div style="font-size:12.5px;line-height:1.3">${t[2 + i]}</div></div>`).join('');
  const open = !d.closed && matchMedia('(min-height:760px) and (min-width:700px)').matches;
  return `${d.intro[i]}<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0">${tiles}</div>
    <details class="pmore" ${open ? 'open' : ''}><summary style="cursor:pointer;color:#9fd0ff">📖 ${F ? 'En savoir plus' : 'More facts'}</summary><div style="max-height:min(30vh,240px);overflow:auto">
    <ul style="margin:6px 0 4px 16px;padding:0">${d.facts.map(f => `<li style="margin:3px 0">${f[i]}</li>`).join('')}</ul></div></details>`;
};
{
  const prev = SS.onFocus;
  SS.onFocus = k => {
    if (D[k] && INFO[k]) { INFO[k].fact = card(k, fr()); if (SS.more.INFO_EN?.[k]) SS.more.INFO_EN[k].fact = card(k, false); SS.i18nAdd?.({ fact: { [k]: card(k, true) } }); }
    prev(k);
  };
}
// phone: keep the card below the date, and give it a close button
{
  const st = document.createElement('style');
  st.textContent = `#infoX{float:right;margin:-4px -6px 0 8px;padding:2px 9px;border-radius:999px;font-size:13px;line-height:1.4}
  @media (max-width:760px), (max-height:520px){ #info{top:62px!important;max-height:min(52vh,460px)!important} }`;
  document.head.appendChild(st);
  const prev = SS.onFocus;
  SS.onFocus = k => {
    prev(k);
    const el = document.getElementById('info'); if (el.style.display === 'none' || el.querySelector('#infoX')) return;
    const x = document.createElement('button'); x.type = 'button'; x.id = 'infoX'; x.textContent = '✕'; x.title = fr() ? 'Fermer' : 'Close';
    x.onclick = () => { el.style.display = 'none'; }; el.prepend(x);
  };
}
SS.more.cards2 = D;
await import('./missions.js' + new URL(import.meta.url).search);
