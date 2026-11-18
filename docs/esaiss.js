// =====================================================================
// Europe on the ISS (from ESA's International Space Station pages): Columbus, the Cupola and nodes,
// the European Robotic Arm, the ACES atomic clocks, the ATV cargo ships, European astronauts and what comes next.
// Each entry flies to the ISS from its own angle and opens a full card (EN + FR).
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { info } = SS.cosmos;
const special = SS.more.special, D = SS.more.cards2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const T = (l, lf, v, vf) => [l, lf, v, vf];

const VIEWS = {   // [key, menu text, category, distance line, camera distance, camera nudge]
  ESA_Europe: ['Europe’s part of the ISS', 'Space agency · ISS partner', 'ESA, one of five ISS partners', 0.3, V(0, 0, 0)],
  ESA_Columbus: ['Columbus laboratory', 'ISS module · European laboratory', 'on the ISS, about 400 km above Earth', 0.16, V(0.5, 0.2, 0.3)],
  ESA_Cupola: ['Cupola and the Harmony & Tranquility nodes', 'ISS modules · built in Europe', 'on the ISS, about 400 km above Earth', 0.17, V(-0.4, -0.3, 0.4)],
  ESA_ERA: ['European Robotic Arm', 'Robot arm · ISS Russian segment', 'on the Nauka module, about 400 km above Earth', 0.17, V(-0.5, 0.3, -0.4)],
  ESA_ACES: ['ACES atomic clocks', 'Experiment · time and gravity', 'outside Columbus, about 400 km above Earth', 0.15, V(0.3, -0.5, -0.3)],
  ESA_ATV: ['ATV cargo ships (2008–2014)', 'Cargo spacecraft · retired', 'flew to the ISS 5 times, 2008–2014', 0.24, V(0, 0.5, -0.6)],
  ESA_Astronauts: ['European astronauts', 'People · ESA astronaut corps', 'on the ISS since 2001', 0.26, V(0.6, 0.4, 0)],
  ESA_Next: ['Next: European cargo ships', 'Future · cargo to and from orbit', 'first flights planned before 2030', 0.32, V(-0.6, 0.5, 0.2)],
};
for (const [k, [name, cat, dist, view, nudge]] of Object.entries(VIEWS)) {
  bodies[k] = { obj: bodies.ISS.obj, radius: bodies.ISS.radius, view, dir: t => bodies.ISS.dir(t).add(nudge).normalize() };
  info(k, name, cat, dist, 'See card.');
  special[k] = () => flyTo(k);
}

Object.assign(D, {
  ESA_Europe: { intro: ['The European Space Agency (ESA) is one of the five partners that run the International Space Station, with the USA, Russia, Japan and Canada. Around half of the station’s pressurised living and working space was built in Europe.',
      'L’Agence spatiale européenne (ESA) est l’un des cinq partenaires qui exploitent la Station spatiale internationale, avec les États-Unis, la Russie, le Japon et le Canada. Près de la moitié de l’espace pressurisé où l’on vit et travaille à bord a été construit en Europe.'],
    tiles: [T('Partner since', 'Partenaire depuis', 'the 1998 Intergovernmental Agreement', 'l’accord intergouvernemental de 1998'),
      T('Own laboratory', 'Laboratoire', 'Columbus, since February 2008', 'Columbus, depuis février 2008'),
      T('Built in Europe', 'Construit en Europe', 'Columbus, Cupola, Harmony, Tranquility, the European Robotic Arm', 'Columbus, Cupola, Harmony, Tranquility, le bras robotique européen'),
      T('Cargo ships', 'Cargos', '5 ATVs, 2008–2014', '5 ATV, 2008–2014'),
      T('Control centre', 'Centre de contrôle', 'Columbus Control Centre, Oberpfaffenhofen, near Munich', 'Centre de contrôle Columbus, Oberpfaffenhofen, près de Munich'),
      T('Astronauts', 'Astronautes', 'Europeans on board since 2001', 'des Européens à bord depuis 2001')],
    facts: [['Europe paid for part of its share with "barter": it built the Harmony and Tranquility nodes for NASA, and NASA launched Columbus on the Space Shuttle.', 'L’Europe a payé une partie de sa place par du « troc » : elle a construit les nœuds Harmony et Tranquility pour la NASA, et la NASA a lancé Columbus avec la navette spatiale.'],
      ['ESA also built the main computers of Russia’s Zvezda module, which help steer the whole station.', 'L’ESA a aussi construit les ordinateurs principaux du module russe Zvezda, qui aident à piloter toute la station.'],
      ['Much of the European hardware was built by Thales Alenia Space in Turin and Airbus in Bremen.', 'Une grande partie du matériel européen a été construite par Thales Alenia Space à Turin et Airbus à Brême.'],
      ['The ATV cargo ship led to the European Service Module that now powers NASA’s Orion capsule to the Moon.', 'Le cargo ATV a donné naissance au module de service européen qui propulse aujourd’hui la capsule Orion de la NASA vers la Lune.']] },

  ESA_Columbus: { intro: ['Columbus is Europe’s own laboratory on the ISS, attached to the Harmony node. Inside, ten cupboard-sized racks hold experiments on biology, the human body, fluids and materials; outside, platforms face space and Earth.',
      'Columbus est le laboratoire de l’Europe sur l’ISS, fixé au nœud Harmony. À l’intérieur, dix baies de la taille d’une armoire accueillent des expériences de biologie, sur le corps humain, les fluides et les matériaux ; à l’extérieur, des plateformes font face à l’espace et à la Terre.'],
    tiles: [T('Launch', 'Lancement', '7 Feb 2008 · Space Shuttle Atlantis (STS-122)', '7 févr. 2008 · navette Atlantis (STS-122)'),
      T('Attached', 'Installé', '11 Feb 2008, on Harmony’s starboard side', '11 févr. 2008, sur le côté tribord d’Harmony'),
      T('Size', 'Taille', '6.9 m long, 4.5 m across', '6,9 m de long, 4,5 m de diamètre'),
      T('Mass', 'Masse', 'about 10.3 tonnes empty, 12.8 t with its first racks', 'environ 10,3 tonnes à vide, 12,8 t avec ses premières baies'),
      T('Inside', 'À l’intérieur', '10 racks, each up to about 1 tonne', '10 baies, chacune jusqu’à environ 1 tonne'),
      T('Outside', 'À l’extérieur', '4 external platforms, plus the Bartolomeo platform', '4 plateformes externes, plus la plateforme Bartolomeo'),
      T('Built by', 'Construit par', 'Airbus in Bremen, with Thales Alenia Space in Turin', 'Airbus à Brême, avec Thales Alenia Space à Turin'),
      T('Controlled from', 'Contrôlé depuis', 'Columbus Control Centre (DLR), Oberpfaffenhofen', 'Centre de contrôle Columbus (DLR), Oberpfaffenhofen')],
    facts: [['ESA astronauts Hans Schlegel (Germany) and Léopold Eyharts (France) flew up with it and set it up; Eyharts then stayed aboard.', 'Les astronautes de l’ESA Hans Schlegel (Allemagne) et Léopold Eyharts (France) l’ont accompagné et installé ; Eyharts est ensuite resté à bord.'],
      ['It was designed to last 10 years and is still working after more than 18.', 'Il était conçu pour durer 10 ans et fonctionne toujours après plus de 18 ans.'],
      ['Its racks include Biolab, the European Physiology Module and the European Drawer Rack. The Fluid Science Laboratory was retired in October 2026 after 18 years.', 'Ses baies comprennent Biolab, le module de physiologie européen et l’European Drawer Rack. Le laboratoire de science des fluides a été retiré en octobre 2026 après 18 ans.'],
      ['Outside, on the Earth-facing side, ASIM hunts lightning-like flashes above thunderstorms, next to the ACES atomic clocks.', 'Dehors, côté Terre, ASIM traque les flashs lumineux au-dessus des orages, à côté des horloges atomiques ACES.']] },

  ESA_Cupola: { intro: ['The Cupola is the station’s famous bay window: seven windows looking down at Earth, built in Italy for ESA. It sits on Tranquility (Node 3), one of two connecting modules Europe built for NASA, along with Harmony (Node 2).',
      'La Cupola est la célèbre baie vitrée de la station : sept fenêtres tournées vers la Terre, construites en Italie pour l’ESA. Elle est fixée sur Tranquility (nœud 3), l’un des deux modules de liaison construits par l’Europe pour la NASA, avec Harmony (nœud 2).'],
    tiles: [T('Cupola', 'Cupola', 'launched 8 Feb 2010 with Tranquility (STS-130)', 'lancée le 8 févr. 2010 avec Tranquility (STS-130)'),
      T('Windows', 'Fenêtres', '6 side windows and a round top window, each with a shutter', '6 fenêtres latérales et une fenêtre ronde au sommet, chacune avec un volet'),
      T('Record', 'Record', 'the largest window ever flown in space', 'la plus grande fenêtre jamais envoyée dans l’espace'),
      T('Used for', 'Sert à', 'watching Earth, photos, and driving the Canadarm2 robot arm', 'observer la Terre, photographier, et piloter le bras robotique Canadarm2'),
      T('Harmony (Node 2)', 'Harmony (nœud 2)', 'arrived Oct 2007 (STS-120): hub for the US, Japanese and European labs', 'arrivé en oct. 2007 (STS-120) : carrefour des labos américain, japonais et européen'),
      T('Tranquility (Node 3)', 'Tranquility (nœud 3)', 'arrived Feb 2010: life support, exercise machines and a toilet', 'arrivé en févr. 2010 : support vie, appareils de sport et toilettes')],
    facts: [['Crew Dragon and other visiting capsules dock at Harmony’s front and top ports.', 'Crew Dragon et les autres capsules en visite s’amarrent aux ports avant et supérieur d’Harmony.'],
      ['Two astronauts can float inside the Cupola together; it is the favourite spot on board for photos of Earth.', 'Deux astronautes peuvent flotter ensemble dans la Cupola ; c’est l’endroit préféré à bord pour photographier la Terre.'],
      ['The shutters close to protect the glass from tiny bits of space debris when no one is looking out.', 'Les volets se ferment pour protéger les vitres des minuscules débris spatiaux quand personne ne regarde dehors.'],
      ['Tranquility recycles air and water: it turns sweat and urine back into drinking water.', 'Tranquility recycle l’air et l’eau : elle retransforme la sueur et l’urine en eau potable.']] },

  ESA_ERA: { intro: ['The European Robotic Arm (ERA) works on the Russian part of the station, where the Canadian and Japanese arms cannot reach. It "walks" end over end between fixing points, like a caterpillar.',
      'Le bras robotique européen (ERA) travaille sur la partie russe de la station, là où les bras canadien et japonais ne peuvent pas aller. Il « marche » en se retournant d’un point d’ancrage à l’autre, comme une chenille.'],
    tiles: [T('Launch', 'Lancement', '21 Jul 2021 · on Russia’s Nauka module (Proton rocket)', '21 juil. 2021 · sur le module russe Nauka (fusée Proton)'),
      T('Length', 'Longueur', '11.3 m', '11,3 m'),
      T('Joints', 'Articulations', '7, with a "hand" at each end', '7, avec une « main » à chaque bout'),
      T('Can move', 'Peut déplacer', 'up to 8,000 kg', 'jusqu’à 8 000 kg'),
      T('Controlled', 'Commandé', 'from inside the station, or by a spacewalker outside', 'depuis l’intérieur, ou par un astronaute en sortie extravéhiculaire'),
      T('Built by', 'Construit par', 'Airbus in the Netherlands, for ESA', 'Airbus aux Pays-Bas, pour l’ESA')],
    facts: [['It can carry a spacewalking cosmonaut from one work site to another.', 'Il peut transporter un cosmonaute en sortie d’un chantier à l’autre.'],
      ['It waited nearly 20 years for its ride: it was first meant to fly in the early 2000s.', 'Il a attendu près de 20 ans son voyage : il devait d’abord partir au début des années 2000.'],
      ['Cameras at its ends let it inspect the outside of the station.', 'Des caméras à ses extrémités lui permettent d’inspecter l’extérieur de la station.']] },

  ESA_ACES: { intro: ['ACES (Atomic Clock Ensemble in Space) carries the most precise clocks ever sent to space, mounted outside Columbus. It sends its time to clocks on the ground to test Einstein: clocks higher up, where gravity is weaker, should tick slightly faster.',
      'ACES (Atomic Clock Ensemble in Space) emporte les horloges les plus précises jamais envoyées dans l’espace, fixées à l’extérieur de Columbus. Elle envoie son heure aux horloges au sol pour tester Einstein : plus haut, là où la gravité est plus faible, une horloge doit battre un tout petit peu plus vite.'],
    tiles: [T('Launch', 'Lancement', '21 Apr 2025 · Falcon 9 (SpaceX CRS-32)', '21 avr. 2025 · Falcon 9 (SpaceX CRS-32)'),
      T('Installed', 'Installée', '25 Apr 2025, Earth-facing side of Columbus', '25 avr. 2025, côté Terre de Columbus'),
      T('Clock 1', 'Horloge 1', 'PHARAO, laser-cooled caesium atoms (CNES, France)', 'PHARAO, atomes de césium refroidis par laser (CNES, France)'),
      T('Clock 2', 'Horloge 2', 'Space Hydrogen Maser (Safran, Switzerland)', 'maser à hydrogène spatial (Safran, Suisse)'),
      T('Precision', 'Précision', 'about 1 second in 300 million years', 'environ 1 seconde en 300 millions d’années'),
      T('Size', 'Taille', 'about 240 kg, 600 W', 'environ 240 kg, 600 W')],
    facts: [['PHARAO is the first cold-atom caesium clock ever to orbit Earth.', 'PHARAO est la première horloge à atomes froids de césium à tourner autour de la Terre.'],
      ['ACES compares clocks on different continents, which could help redefine the second.', 'ACES compare des horloges sur différents continents, ce qui pourrait aider à redéfinir la seconde.'],
      ['Canadarm2 lifted it out of a Dragon cargo ship’s trunk and placed it next to ASIM, ESA’s thunderstorm watcher.', 'Le Canadarm2 l’a sortie du coffre d’un cargo Dragon et posée à côté d’ASIM, l’observateur d’orages de l’ESA.'],
      ['ESA and France’s space agency CNES agreed in 2009 to fly PHARAO on Columbus.', 'L’ESA et le CNES se sont mis d’accord en 2009 pour faire voler PHARAO sur Columbus.']] },

  ESA_ATV: { closed: true, intro: ['The Automated Transfer Vehicle (ATV) was Europe’s heavy cargo ship. Each one flew up on an Ariane 5, docked to the station on its own, delivered food, water, air and fuel, pushed the ISS to a higher orbit, then burned up over the Pacific.',
      'L’ATV (Automated Transfer Vehicle) était le cargo lourd de l’Europe. Chacun montait sur une Ariane 5, s’amarrait seul à la station, livrait nourriture, eau, air et carburant, remontait l’orbite de l’ISS, puis se désintégrait au-dessus du Pacifique.'],
    tiles: [T('ATV-1', 'ATV-1', 'Jules Verne · launched 9 Mar 2008', 'Jules Verne · lancé le 9 mars 2008'),
      T('ATV-2', 'ATV-2', 'Johannes Kepler · 16 Feb 2011', 'Johannes Kepler · 16 févr. 2011'),
      T('ATV-3', 'ATV-3', 'Edoardo Amaldi · 23 Mar 2012', 'Edoardo Amaldi · 23 mars 2012'),
      T('ATV-4', 'ATV-4', 'Albert Einstein · 5 Jun 2013', 'Albert Einstein · 5 juin 2013'),
      T('ATV-5', 'ATV-5', 'Georges Lemaître · 29 Jul 2014', 'Georges Lemaître · 29 juil. 2014'),
      T('Size', 'Taille', 'about 10 m long, 4.5 m wide, 22 m across its solar wings', 'environ 10 m de long, 4,5 m de diamètre, 22 m d’envergure'),
      T('Launcher', 'Lanceur', 'Ariane 5, from Kourou, French Guiana', 'Ariane 5, depuis Kourou, Guyane'),
      T('Mission control', 'Contrôle', 'ATV Control Centre, Toulouse (CNES)', 'Centre de contrôle ATV, Toulouse (CNES)')],
    facts: [['Five launches in six years: the most complex spacecraft Europe had ever built.', 'Cinq lancements en six ans : l’engin spatial le plus complexe jamais construit en Europe.'],
      ['Georges Lemaître, named after the Belgian father of the Big Bang theory, was the heaviest load an Ariane 5 ever lifted.', 'Georges Lemaître, du nom du père belge de la théorie du Big Bang, a été la plus lourde charge jamais lancée par une Ariane 5.'],
      ['The last ATV broke up on 15 February 2015, ending the programme.', 'Le dernier ATV s’est désintégré le 15 février 2015, mettant fin au programme.'],
      ['Its design lives on in the European Service Module that pushes Orion to the Moon.', 'Sa conception continue de vivre dans le module de service européen qui propulse Orion vers la Lune.']] },

  ESA_Astronauts: { intro: ['European astronauts have lived and worked on the ISS since 2001, doing science for hundreds of experiments, going on spacewalks and commanding the station.',
      'Des astronautes européens vivent et travaillent sur l’ISS depuis 2001 : ils mènent des centaines d’expériences, sortent dans l’espace et commandent la station.'],
    tiles: [T('Latest', 'Dernière mission', 'Sophie Adenot (France), εpsilon, Feb–Oct 2026', 'Sophie Adenot (France), εpsilon, févr.–oct. 2026'),
      T('Record', 'Record', 'longest European spaceflight: εpsilon, nearly 8 months', 'plus long vol européen : εpsilon, près de 8 mois'),
      T('First European commander', 'Premier commandant européen', 'Frank De Winne (Belgium), 2009', 'Frank De Winne (Belgique), 2009'),
      T('First European woman commander', 'Première commandante européenne', 'Samantha Cristoforetti (Italy), 2022', 'Samantha Cristoforetti (Italie), 2022'),
      T('French on the ISS', 'Français sur l’ISS', 'Claudie Haigneré 2001, Léopold Eyharts 2008, Thomas Pesquet 2016 and 2021, Sophie Adenot 2026', 'Claudie Haigneré 2001, Léopold Eyharts 2008, Thomas Pesquet 2016 et 2021, Sophie Adenot 2026'),
      T('Trained at', 'Formés à', 'European Astronaut Centre, Cologne', 'Centre des astronautes européens, Cologne')],
    facts: [['Sophie Adenot launched on 13 February 2026 on Crew Dragon (Crew-12) and became the first French woman to walk in space.', 'Sophie Adenot a décollé le 13 février 2026 à bord de Crew Dragon (Crew-12) et est devenue la première Française à sortir dans l’espace.'],
      ['She did three spacewalks in 14 days, 19 hours and 42 minutes outside in all.', 'Elle a fait trois sorties en 14 jours, soit 19 heures et 42 minutes dehors au total.'],
      ['Her mission beat the old European record, Luca Parmitano’s Beyond mission, by more than 35 days.', 'Sa mission a battu l’ancien record européen, la mission Beyond de Luca Parmitano, de plus de 35 jours.'],
      ['Thomas Pesquet commanded the station during his Alpha mission in 2021.', 'Thomas Pesquet a commandé la station pendant sa mission Alpha en 2021.']] },

  ESA_Next: { intro: ['Europe wants its own ships to carry cargo up to the ISS and, for the first time, bring it back down. ESA picked two companies to develop them, and plans to buy their service, first for the ISS and then for commercial stations after it retires.',
      'L’Europe veut ses propres vaisseaux pour monter du fret vers l’ISS et, pour la première fois, le redescendre. L’ESA a choisi deux entreprises pour les développer et prévoit d’acheter leur service, d’abord pour l’ISS puis pour des stations commerciales après sa retraite.'],
    tiles: [T('Contracts', 'Contrats', '22 May 2024, €25 million each', '22 mai 2024, 25 millions d’euros chacun'),
      T('Company 1', 'Entreprise 1', 'The Exploration Company (Germany/France), Nyx capsule', 'The Exploration Company (Allemagne/France), capsule Nyx'),
      T('Company 2', 'Entreprise 2', 'Thales Alenia Space (Italy/France)', 'Thales Alenia Space (Italie/France)'),
      T('Next step', 'Étape suivante', 'two demonstration flights to the ISS, agreed in November 2025', 'deux vols de démonstration vers l’ISS, décidés en novembre 2025'),
      T('Goal', 'Objectif', 'a cargo service to and from orbit by 2030', 'un service de fret aller-retour d’ici 2030'),
      T('After the ISS', 'Après l’ISS', 'serve the commercial space stations that follow it', 'desservir les stations commerciales qui lui succéderont')],
    facts: [['Europe has never had its own way to bring cargo back down from orbit: the ATVs could only go up, then burned up.', 'L’Europe n’a jamais eu son propre moyen de redescendre du fret depuis l’orbite : les ATV ne faisaient que monter, puis se désintégraient.'],
      ['ESA has said it will be a customer for the new ships after the demonstrations.', 'L’ESA s’est engagée à être cliente des nouveaux vaisseaux après les démonstrations.'],
      ['The ISS is due to be retired around 2030 and steered into the Pacific Ocean.', 'L’ISS doit être retirée vers 2030 et dirigée vers l’océan Pacifique.']] },
});

// the main ISS card: point to Europe's part
D.ISS?.facts.push(['Europe built its Columbus lab, the Cupola window, two connecting nodes and a robot arm: see "🇪🇺 Europe on the ISS" in the menu.',
  'L’Europe a construit son laboratoire Columbus, la fenêtre Cupola, deux nœuds de liaison et un bras robotique : voir « 🇪🇺 L’Europe sur l’ISS » dans le menu.']);

// the Europe entries (and the Crew Dragon) show NASA's detailed ISS model too, not just the simple one
{ const prev = SS.onFocus; SS.onFocus = k => { prev(k); if (k.startsWith('ESA_') || k === 'Dragon') SS.more.nasaModels?.swap('ISS'); }; }

// ---------------------------------------------------------------- menu group, after SpaceX
{
  const og = document.createElement('optgroup'); og.label = '🇪🇺 Europe on the ISS';
  const groups = [...focusSel.querySelectorAll('optgroup')];
  const before = groups.find(g => g.label === '🚀 SpaceX') || groups.find(g => g.label === '🌍 Around Earth');
  before ? before.after(og) : focusSel.appendChild(og);
  for (const [k, [name]] of Object.entries(VIEWS)) { const o = document.createElement('option'); o.value = k; o.textContent = name; og.appendChild(o); }
}

// ---------------------------------------------------------------- French
SS.i18nAdd?.({
  ui: { '🇪🇺 Europe on the ISS': '🇪🇺 L’Europe sur l’ISS' },
  name: { 'Europe’s part of the ISS': 'La part de l’Europe dans l’ISS', 'Columbus laboratory': 'Le laboratoire Columbus', 'Cupola and the Harmony & Tranquility nodes': 'La Cupola et les nœuds Harmony et Tranquility',
    'European Robotic Arm': 'Le bras robotique européen', 'ACES atomic clocks': 'Les horloges atomiques ACES', 'ATV cargo ships (2008–2014)': 'Les cargos ATV (2008–2014)',
    'European astronauts': 'Les astronautes européens', 'Next: European cargo ships': 'Bientôt : des cargos européens', '🇪🇺 Europe on the ISS': '🇪🇺 L’Europe sur l’ISS' },
  cat: { 'Space agency · ISS partner': 'Agence spatiale · partenaire de l’ISS', 'ISS module · European laboratory': 'Module de l’ISS · laboratoire européen', 'ISS modules · built in Europe': 'Modules de l’ISS · construits en Europe',
    'Robot arm · ISS Russian segment': 'Bras robotique · segment russe de l’ISS', 'Experiment · time and gravity': 'Expérience · temps et gravité', 'Cargo spacecraft · retired': 'Vaisseau cargo · retiré du service',
    'People · ESA astronaut corps': 'Personnes · corps des astronautes de l’ESA', 'Future · cargo to and from orbit': 'Avenir · fret aller-retour vers l’orbite' },
  dist: { 'ESA, one of five ISS partners': 'l’ESA, l’un des cinq partenaires de l’ISS', 'on the ISS, about 400 km above Earth': 'sur l’ISS, à environ 400 km au-dessus de la Terre',
    'on the Nauka module, about 400 km above Earth': 'sur le module Nauka, à environ 400 km au-dessus de la Terre', 'outside Columbus, about 400 km above Earth': 'à l’extérieur de Columbus, à environ 400 km au-dessus de la Terre',
    'flew to the ISS 5 times, 2008–2014': 'cinq vols vers l’ISS, 2008–2014', 'on the ISS since 2001': 'sur l’ISS depuis 2001', 'first flights planned before 2030': 'premiers vols prévus avant 2030' },
});
