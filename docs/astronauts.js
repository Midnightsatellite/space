// =====================================================================
// Astronauts: Artemis II around the Moon (April 2026), the Artemis plan, astronaut facts
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { scene, camera, bodies, sim, flyTo, focusSel, glowSprite } = SS;
const { info } = SS.cosmos;
const { nearLabel } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const $ = id => document.getElementById(id);
const special = SS.more.special;
const BECOME = 'https://www.nasa.gov/humans-in-space/astronauts/';
const link = (t) => ` <a href="${BECOME}" target="_blank" rel="noopener" style="color:#ffd27a">${t}</a>`;

// ---------- the Orion spacecraft: detailed model (crew module + European Service Module) ----------
import { buildOrion } from './craftmodels.js?v=54';

// ---------- Artemis II: launch 1 Apr 2026, around the Moon 6 Apr, splashdown 10 Apr ----------
const LAUNCH = Date.UTC(2026, 3, 1, 22, 35), FLYBY = Date.UTC(2026, 3, 6, 23, 0), SPLASH = Date.UTC(2026, 3, 11, 0, 7);
{
  const moon = bodies.Moon.obj, moonPivot = moon.parent;
  const frame = new THREE.Group(); moonPivot.add(frame);              // turns with the Moon, so the loop always wraps around it
  // free-return "figure of eight": out on one side, behind the Moon, back on the other (Earth at the centre, the Moon 3 units away)
  const P = [[0.15, 0, 1.12], [-1.1, 0, 1.0], [-1.55, 0, 0], [-0.9, 0, -0.95], [0.35, 0, -1.25], [1.15, 0, -0.75], [1.9, 0, -0.05], [2.6, 0, 0.42],
    [3.25, 0, 0.5], [3.62, 0, 0.18], [3.62, 0, -0.18], [3.25, 0, -0.5], [2.6, 0, -0.42], [1.9, 0, 0.05], [1.2, 0, 0.55], [0.85, 0, 0.62]].map(p => V(...p));
  const curve = new THREE.CatmullRomCurve3(P, false, 'centripetal');
  const pts = curve.getSpacedPoints(400);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xffb35a, dashSize: 0.05, gapSize: 0.035, transparent: true, opacity: 0.75 }));
  line.computeLineDistances(); frame.add(line); SS.orbitLines.push(line);
  let uFar = 0, best = -1; for (let i = 0; i <= 400; i++) if (pts[i].x > best) { best = pts[i].x; uFar = i / 400; }   // the point farthest from Earth
  const uHeo = 1 / 15 * 4;                                      // end of the first day in a high orbit around Earth
  const orion = buildOrion(); orion.scale.setScalar(0.012); frame.add(orion);
  const trail = glowSprite(6, 'rgba(255,200,120,0.9)', 'rgba(0,0,0,0)', 0.8); trail.visible = false;   // (the old glow hid the new model, so it is no longer attached)
  nearLabel(orion, 'Orion · Artemis II', 0.07 / 0.012, 'OrionCraft', 'craft', 12);
  const progress = ms => {                                      // where Orion is on the path at a given time
    if (ms <= LAUNCH || ms >= SPLASH) return uFar;              // outside the mission, park it at the Moon flyby
    const day1 = LAUNCH + 864e5;
    if (ms < day1) return uHeo * (ms - LAUNCH) / 864e5;
    if (ms < FLYBY) return uHeo + (uFar - uHeo) * (ms - day1) / (FLYBY - day1);
    return uFar + (1 - uFar) * (ms - FLYBY) / (SPLASH - FLYBY);
  };
  const tan = V(), up = V(0, 1, 0), m = new THREE.Matrix4();
  sim.push(() => {
    const p = moon.position; frame.rotation.z = Math.atan2(p.y, p.x);    // follow the Moon a little above or below Earth's orbit
    const ms = SS.getDate(), live = ms > LAUNCH && ms < SPLASH;
    const u = Math.min(0.999, Math.max(0, progress(ms)));
    orion.position.copy(curve.getPointAt(u)); curve.getTangentAt(u, tan);
    m.lookAt(V(0, 0, 0), tan, up); orion.quaternion.setFromRotationMatrix(m); orion.rotateX(-Math.PI / 2);
    trail.visible = live; line.material.opacity = live ? 0.9 : 0.55;
  });
  const wp = V(), mp = V();
  const sw = V(), ox = V();   // close up, from the sunlit side, with the Moon behind the spacecraft
  bodies.OrionCraft = { obj: orion, radius: 0.03, view: 0.11, dir: () => { orion.getWorldPosition(wp); moon.getWorldPosition(mp); bodies.Sun.obj.getWorldPosition(sw);
    const toSun = sw.sub(wp).normalize(), out = wp.clone().sub(mp).normalize(); ox.set(1, 0, 0).applyQuaternion(orion.getWorldQuaternion(new THREE.Quaternion()));
    const ax = V(0, 1, 0).applyQuaternion(orion.getWorldQuaternion(new THREE.Quaternion()));   // the spacecraft's long axis
    const side = toSun.clone().addScaledVector(ax, -toSun.dot(ax)); if (side.lengthSq() < 0.05) side.copy(ox);   // look at its sunlit side, not down its nose
    return side.normalize().multiplyScalar(0.85).addScaledVector(ax, -0.45).addScaledVector(out, 0.12).normalize(); } };   // a little from behind, like ESA's pictures
  info('OrionCraft', 'Orion · Artemis II', 'Crewed spacecraft · April 2026', 'flew about 6,500 km behind the Moon',
    'The first people to travel to the Moon since 1972. Reid Wiseman (commander), Victor Glover (pilot), Christina Koch and Jeremy Hansen of Canada launched on 1 April 2026, swung around the far side of the Moon on 6 April, and splashed down in the Pacific on 10 April, after 10 days. They travelled 406,771 km (252,756 miles) from Earth, the farthest humans have ever been, and saw parts of the Moon that no human eyes had seen before.' + link('Become an astronaut ›'));
  // a whole-trip view, from high above Earth and the Moon
  const whole = new THREE.Object3D(); frame.add(whole); whole.position.set(1.8, 0, 0);
  bodies.ArtemisTrip = { obj: whole, radius: 2, view: 6.5, selfLit: true, dir: () => { moon.getWorldPosition(mp); bodies.Earth.obj.getWorldPosition(wp); const d = mp.sub(wp).normalize(); return V(0, 1, 0).add(V(-d.z, 0, d.x).multiplyScalar(0.55)).normalize(); } };
  info('ArtemisTrip', 'Artemis II: the trip around the Moon', 'Crewed mission · 1–10 April 2026', 'Earth → around the Moon → Earth',
    'A free-return path: after a day in a high orbit around Earth, one engine burn sent Orion towards the Moon. The Moon\'s gravity swung it around the far side and pointed it straight back home, with no need for another big burn. That is the same kind of path that saved Apollo 13 in 1970.');
}

// ---------- Artemis IV: planned landing near the south pole (2028) ----------
{
  const moon = bodies.Moon.obj, R = moon.geometry.parameters.radius;
  const lat = -88.5, lon = 0;
  const n = V(Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.sin(lat * D2R), -Math.cos(lat * D2R) * Math.sin(lon * D2R)).normalize();
  const pin = new THREE.Group(); pin.position.copy(n).multiplyScalar(R); pin.quaternion.setFromUnitVectors(V(0, 1, 0), n); moon.add(pin);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.012, 0.015, 40), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.0006; pin.add(ring);
  pin.add(glowSprite(0.006, '#ffd27a', 'rgba(0,0,0,0)', 0.9));
  sim.push((dt, t) => { ring.scale.setScalar(1 + 0.2 * Math.sin(t * 2.5)); });
  nearLabel(pin, 'Artemis IV · planned', 0.024, 'ArtemisIV', 'craft', 1.6);
  const wp = V(), mp = V();
  bodies.ArtemisIV = { obj: pin, radius: 0.02, view: 0.5, dir: () => { pin.getWorldPosition(wp); moon.getWorldPosition(mp); return wp.sub(mp).normalize().add(V(0.3, 0, 0.3)).normalize(); } };
  info('ArtemisIV', 'Artemis IV: back on the Moon', 'Planned crewed landing · 2028', 'near the south pole',
    'NASA plans to land astronauts near the Moon\'s south pole in 2028, where ice hides in craters that never see sunlight. This is where NASA wants to build its Moon Base, a first outpost where astronauts can live and work. Before that, Artemis III (2027) will stay in orbit around Earth so its crew can practise docking Orion with test versions of the SpaceX and Blue Origin landers.');
  // a timeline card for all the Artemis missions, shown with the Moon
  bodies.ArtemisAll = { obj: bodies.Moon.obj, radius: 0.27, view: 1.3 };
  info('ArtemisAll', 'Artemis: back to the Moon', 'NASA\'s Moon programme', 'one mission a year from 2028',
    '<b style="display:inline;font-size:13px">I · Nov 2022</b>: uncrewed test flight around the Moon.<br><b style="display:inline;font-size:13px">II · Apr 2026</b>: Wiseman, Glover, Koch and Hansen fly around the Moon, a human distance record of 406,771 km.<br><b style="display:inline;font-size:13px">III · 2027</b>: Randy Bresnik, Frank Rubio, Andre Douglas and ESA\'s Luca Parmitano test docking with Moon landers, in orbit around Earth.<br><b style="display:inline;font-size:13px">IV · 2028</b>: the first Artemis landing, near the south pole.<br><b style="display:inline;font-size:13px">V · 2028</b>: another landing, then about one mission every year, building a Moon Base.');
}

// ---------- menu ----------
{
  const og = document.createElement('optgroup'); og.label = '🧑‍🚀 Astronauts';
  const after = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Moon landing sites');
  after ? after.before(og) : focusSel.appendChild(og);
  for (const [k, t] of [['ArtemisAll', '📅 Artemis: all the missions'], ['AS_trip', 'Artemis II: the whole trip (Apr 2026)'], ['OrionCraft', 'Artemis II: around the Moon (6 Apr 2026)'], ['ArtemisIV', 'Artemis IV: south pole landing (planned 2028)'], ['ISS', 'ISS: people living in space']]) {
    const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o);
  }
  const slow = v => { $('speed').value = v; };
  special.AS_trip = () => { SS.setDate(LAUNCH + 36e5); slow('0.25'); setTimeout(() => flyTo('ArtemisTrip'), 120); };
  special.OrionCraft = () => { SS.setDate(FLYBY - 2 * 36e5); slow('0.000694'); setTimeout(() => flyTo('OrionCraft'), 120); };
}

// ---------- One Fact cards ----------
{
  const F = SS.more.FACTS, FR = SS.more.FACTS_FR;
  const add = (en, fr) => { F.push(en); if (FR) FR[F.length - 1] = fr; };
  add(['ISS', '"Astronaut" means "star sailor"', 'The word comes from two Greek words: astron, "star", and nautes, "sailor".'],
    ['« Astronaute » veut dire « marin des étoiles »', 'Le mot vient de deux mots grecs : astron, « étoile », et nautes, « marin ».']);
  add(['OrionCraft', 'In 2026, four people went farther than anyone ever', 'Looping around the far side of the Moon on 6 April 2026, the Artemis II crew reached 406,771 km from Earth: a new record for humans.'],
    ['En 2026, quatre humains sont allés plus loin que quiconque', "En contournant la face cachée de la Lune le 6 avril 2026, l'équipage d'Artemis II est allé jusqu'à 406 771 km de la Terre : un nouveau record humain."]);
  add(['OrionCraft', 'The Moon itself steered Artemis II home', 'On a free-return path, the Moon\'s gravity swings the spacecraft around and points it back at Earth, with no big engine burn needed.'],
    ['C\'est la Lune qui a ramené Artemis II', "Sur une trajectoire de retour libre, la gravité de la Lune fait tourner le vaisseau et le renvoie vers la Terre, sans grosse poussée du moteur."]);
  add(['ISS', 'Astronauts see 16 sunrises a day', 'The ISS goes around Earth about every 90 minutes, so the crew sees a sunrise or a sunset roughly every 45 minutes.'],
    ['Les astronautes voient 16 levers de Soleil par jour', "L'ISS fait le tour de la Terre environ toutes les 90 minutes : l'équipage voit un lever ou un coucher de Soleil à peu près toutes les 45 minutes."]);
  add(['ArtemisIV', 'The next Moon landing aims for ice', 'NASA plans to land astronauts near the Moon\'s south pole in 2028, where frozen water hides in craters that never see the Sun.'],
    ['Le prochain alunissage vise la glace', "La NASA prévoit de poser des astronautes près du pôle Sud de la Lune en 2028, là où de l'eau gelée se cache dans des cratères jamais éclairés."]);
}

// ---------- French ----------
SS.i18nAdd?.({
  ui: { '🧑‍🚀 Astronauts': '🧑‍🚀 Astronautes', 'Artemis II: the whole trip (Apr 2026)': 'Artemis II : tout le voyage (avr. 2026)', 'Artemis II: around the Moon (6 Apr 2026)': 'Artemis II : autour de la Lune (6 avr. 2026)',
    'Artemis IV: south pole landing (planned 2028)': 'Artemis IV : alunissage au pôle Sud (prévu en 2028)', '📅 Artemis: all the missions': '📅 Artemis : toutes les missions', 'ISS: people living in space': "ISS : des humains qui vivent dans l'espace" },
  name: { 'Artemis: back to the Moon': 'Artemis : retour sur la Lune', 'Orion · Artemis II': 'Orion · Artemis II', 'Artemis IV · planned': 'Artemis IV · prévu', 'Artemis II: the trip around the Moon': 'Artemis II : le voyage autour de la Lune', 'Artemis IV: back on the Moon': 'Artemis IV : le retour sur la Lune' },
  cat: { "NASA's Moon programme": 'Le programme lunaire de la NASA', 'Crewed spacecraft · April 2026': 'Vaisseau habité · avril 2026', 'Crewed mission · 1–10 April 2026': 'Mission habitée · 1er–10 avril 2026', 'Planned crewed landing · 2028': 'Alunissage habité prévu · 2028' },
  dist: { 'one mission a year from 2028': 'une mission par an à partir de 2028', 'flew about 6,500 km behind the Moon': 'est passé à environ 6 500 km derrière la Lune', 'Earth → around the Moon → Earth': 'Terre → autour de la Lune → Terre' },
  fact: {
    OrionCraft: "Les premiers humains à aller vers la Lune depuis 1972. Reid Wiseman (commandant), Victor Glover (pilote), Christina Koch et le Canadien Jeremy Hansen ont décollé le 1er avril 2026, ont contourné la face cachée de la Lune le 6 avril, et ont amerri dans le Pacifique le 10 avril, après 10 jours. Ils ont voyagé jusqu'à 406 771 km de la Terre, plus loin que quiconque, et ont vu des régions de la Lune qu'aucun œil humain n'avait jamais vues." + link('Devenir astronaute ›'),
    ArtemisTrip: "Une trajectoire de retour libre : après une journée sur une orbite haute autour de la Terre, une seule poussée du moteur a envoyé Orion vers la Lune. La gravité de la Lune l'a fait tourner derrière la face cachée et l'a renvoyé droit vers la Terre, sans autre grosse poussée. C'est le même genre de trajectoire qui a sauvé Apollo 13 en 1970.",
    ArtemisIV: "La NASA prévoit de poser des astronautes près du pôle Sud de la Lune en 2028, là où de la glace se cache dans des cratères jamais éclairés par le Soleil. C'est là que la NASA veut construire sa base lunaire, un premier avant-poste où des astronautes pourront vivre et travailler. Avant cela, Artemis III (2027) restera en orbite autour de la Terre pour que son équipage s'entraîne à amarrer Orion à des versions d'essai des atterrisseurs de SpaceX et Blue Origin.",
    ArtemisAll: '<b style="display:inline;font-size:13px">I · nov. 2022</b> : vol d\'essai sans équipage autour de la Lune.<br><b style="display:inline;font-size:13px">II · avr. 2026</b> : Wiseman, Glover, Koch et Hansen font le tour de la Lune, record de distance humaine : 406 771 km.<br><b style="display:inline;font-size:13px">III · 2027</b> : Randy Bresnik, Frank Rubio, Andre Douglas et Luca Parmitano (ESA) testent l\'amarrage aux atterrisseurs lunaires, en orbite autour de la Terre.<br><b style="display:inline;font-size:13px">IV · 2028</b> : le premier alunissage Artemis, près du pôle Sud.<br><b style="display:inline;font-size:13px">V · 2028</b> : un autre alunissage, puis environ une mission par an pour construire une base lunaire.',
  },
});
await import('./earthside.js' + new URL(import.meta.url).search);
