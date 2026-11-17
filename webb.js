// =====================================================================
// James Webb Space Telescope: a full observatory card (the NASA 3D model stays as it is)
// =====================================================================
const SS = window.SS;
const { INFO } = SS.cosmos;
const fr = () => SS.lang === 'fr';

const L = { type: ['Type', 'Type'], launch: ['Launch', 'Lancement'], where: ['Home', 'Domicile'], mirror: ['Mirror', 'Miroir'], shield: ['Sunshield', 'Pare-soleil'],
  cold: ['Working temperature', 'Température de travail'], mass: ['Mass', 'Masse'], team: ['Partners', 'Partenaires'] };
const TILES = [
  ['type', 'Infrared space observatory', 'Observatoire spatial infrarouge'],
  ['launch', '25 Dec 2021 · Ariane 5, Guiana Space Centre (Kourou)', '25 déc. 2021 · Ariane 5, Centre spatial guyanais (Kourou)'],
  ['where', 'orbits Sun–Earth L2, about 1.5 million km away', 'en orbite autour du point L2 Soleil-Terre, à environ 1,5 million de km'],
  ['mirror', '6.5 m, 18 gold-coated hexagons', '6,5 m, 18 hexagones dorés'],
  ['shield', '5 layers, about the size of a tennis court', '5 couches, à peu près la taille d\'un court de tennis'],
  ['cold', 'below 50 K (about −223 °C)', 'sous 50 K (environ −223 °C)'],
  ['mass', 'about 6,200 kg', 'environ 6 200 kg'],
  ['team', 'NASA, ESA (Europe) and CSA (Canada)', 'NASA, ESA (Europe) et ASC (Canada)'],
];
const PARTS = [
  ['🪞 Optical Telescope Element: the mirrors and the backplane that holds them, steady to 1/10,000 of the width of a hair.', '🪞 L\'élément télescope optique : les miroirs et la structure qui les porte, stable à un dix-millième de l\'épaisseur d\'un cheveu.'],
  ['🔬 ISIM, the instrument module behind the mirror: NIRCam (near-infrared camera), NIRSpec (spectrograph), MIRI (mid-infrared camera and spectrograph) and FGS/NIRISS (fine guidance and imager).', '🔬 L\'ISIM, le module d\'instruments derrière le miroir : NIRCam (caméra proche infrarouge), NIRSpec (spectrographe), MIRI (caméra et spectrographe infrarouge moyen) et FGS/NIRISS (guidage fin et imageur).'],
  ['☂️ Sunshield: separates the warm Sun-facing side from the cold side, where the telescope sits.', '☂️ Pare-soleil : il sépare le côté chaud, tourné vers le Soleil, du côté froid où se trouve le télescope.'],
  ['🛰 Spacecraft bus: power, steering, radio, computer, rockets and temperature control, with the solar panel always facing the Sun and an antenna pointed at Earth.', '🛰 Plateforme : énergie, pilotage, radio, ordinateur, moteurs et contrôle thermique, avec le panneau solaire toujours face au Soleil et une antenne pointée vers la Terre.'],
];
const FACTS = [
  ['The largest telescope ever sent into space. Too big to launch open, it was folded like origami and unfolded itself in space.', 'Le plus grand télescope jamais envoyé dans l\'espace. Trop grand pour partir déplié, il a été plié comme un origami et s\'est déployé tout seul dans l\'espace.'],
  ['The sunshield\'s Sun side can reach about 85 °C, while the telescope side stays near −233 °C.', 'Côté Soleil, le pare-soleil peut atteindre environ 85 °C, alors que le côté télescope reste vers −233 °C.'],
  ['Infrared light passes through dust clouds that block visible light, so Webb sees stars and planets being born, and the very first galaxies.', 'La lumière infrarouge traverse les nuages de poussière qui bloquent la lumière visible : Webb voit naître étoiles et planètes, et observe les toutes premières galaxies.'],
  ['It has seen galaxies as they were less than 300 million years after the Big Bang.', 'Il a observé des galaxies telles qu\'elles étaient moins de 300 millions d\'années après le Big Bang.'],
  ['In 2022 it found carbon dioxide in the air of a planet around another star, WASP-39 b, a first.', 'En 2022, il a détecté du dioxyde de carbone dans l\'atmosphère d\'une planète autour d\'une autre étoile, WASP-39 b : une première.'],
  ['The gold on its mirrors is about 100 nanometres thick: all 18 segments together hold less than 50 g of gold.', 'L\'or de ses miroirs fait environ 100 nanomètres d\'épaisseur : les 18 segments réunis en contiennent moins de 50 g.'],
  ['A month after launch, on 24 January 2022, it reached L2. Its first full-colour images were shown on 12 July 2022.', 'Un mois après le lancement, le 24 janvier 2022, il a atteint L2. Ses premières images en couleur ont été dévoilées le 12 juillet 2022.'],
  ['Named after James Webb, who ran NASA from 1961 to 1968, during the build-up to Apollo.', 'Il porte le nom de James Webb, qui a dirigé la NASA de 1961 à 1968, pendant la préparation d\'Apollo.'],
];
const card = F => {
  const i = F ? 1 : 0;
  const tiles = TILES.map(([l, en, f]) => `<div style="background:rgba(140,160,255,.08);border-radius:8px;padding:5px 7px"><div style="font-size:10px;letter-spacing:.04em;text-transform:uppercase;opacity:.65">${L[l][i]}</div><div style="font-size:12.5px;line-height:1.3">${F ? f : en}</div></div>`).join('');
  return (F ? 'Le plus puissant télescope spatial jamais construit : il prolonge Hubble et Spitzer et voit l\'Univers en lumière infrarouge, à travers la poussière et jusqu\'aux premières galaxies.'
    : 'The most powerful space telescope ever built: it follows on from Hubble and Spitzer and sees the universe in infrared light, through dust and back to the first galaxies.')
    + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0">${tiles}</div>`
    + `<details class="pmore"><summary style="cursor:pointer;color:#9fd0ff">🧩 ${F ? 'Les quatre grandes parties' : 'The four main parts'}</summary><div style="max-height:min(30vh,240px);overflow:auto"><ul style="margin:6px 0 4px 16px;padding:0;list-style:none">${PARTS.map(p => `<li style="margin:4px 0">${p[i]}</li>`).join('')}</ul></div></details>`
    + `<details class="pmore" ${matchMedia('(min-height:760px) and (min-width:700px)').matches ? 'open' : ''}><summary style="cursor:pointer;color:#9fd0ff">📖 ${F ? 'En savoir plus' : 'More facts'}</summary><div style="max-height:min(30vh,240px);overflow:auto">
      <ul style="margin:6px 0 4px 16px;padding:0">${FACTS.map(f => `<li style="margin:3px 0">${f[i]}</li>`).join('')}</ul>
      <div style="font-size:12px;opacity:.85"><a href="https://science.nasa.gov/mission/webb/spacecraftoverview/" target="_blank" rel="noopener" style="color:#ffd27a">${F ? 'L\'observatoire Webb sur le site de la NASA ›' : 'Webb\'s observatory on NASA\'s website ›'}</a></div></div></details>`;
};
{
  INFO.JWST.cat = 'Spacecraft · infrared space observatory'; if (SS.more.INFO_EN?.JWST) SS.more.INFO_EN.JWST.cat = INFO.JWST.cat;
  const prev = SS.onFocus;
  SS.onFocus = k => {
    if (k === 'JWST') { INFO.JWST.fact = card(fr()); if (SS.more.INFO_EN?.JWST) SS.more.INFO_EN.JWST.fact = card(false); SS.i18nAdd?.({ fact: { JWST: card(true) } }); }
    prev(k);
  };
}
SS.i18nAdd?.({ cat: { 'Spacecraft · infrared space observatory': 'Engin spatial · observatoire spatial infrarouge' } });
await import('./cards2.js' + new URL(import.meta.url).search);
