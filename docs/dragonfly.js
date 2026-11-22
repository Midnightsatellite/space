// =====================================================================
// Dragonfly: NASA's nuclear-powered octocopter for Saturn's moon Titan (launch July 2028, arrival 2034).
// Shown on Titan, hovering over the Shangri-La dunes just south of Selk crater, where it is due to land.
// Hand-built from NASA/APL renders (about 3.85 × 3.85 × 1.75 m; four pairs of three-bladed rotors).
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies, focusSel, sim } = SS;
const { info } = SS.cosmos;
const { nearLabel } = SS.extras;
const D = SS.more.cards2, T = (l, lf, v, vf) => [l, lf, v, vf];
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- the rotorcraft, in metres ----------
function buildDragonfly() {
  const g = new THREE.Group();
  const cv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // crinkled insulation foil, warm gold-bronze like the NASA renders
  const foil = cv(256, 256, (c, w, h) => { c.fillStyle = '#b8945c'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const x = Math.random() * w, y = Math.random() * h, l = 6 + Math.random() * 22, a = Math.random() * Math.PI;
      c.strokeStyle = `rgba(${Math.random() < 0.5 ? '255,235,190' : '70,50,25'},${0.15 + Math.random() * 0.25})`; c.lineWidth = 1 + Math.random() * 2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); } });
  foil.wrapS = foil.wrapT = THREE.RepeatWrapping;
  const lit = (o) => { const m = new THREE.MeshStandardMaterial({ metalness: 0.55, roughness: 0.45, ...o }); if (m.map) { m.emissive.set(0xffffff); m.emissiveMap = m.map; m.emissiveIntensity = 0.5; } else { m.emissive.copy(m.color).multiplyScalar(0.45); } return m; };   // stays readable during Titan night
  const body = lit({ map: foil }), alu = lit({ color: 0xc9ccd2 }), dark = lit({ color: 0x2a2c30, metalness: 0.3, roughness: 0.6 }),
    blade = lit({ color: 0xdcdfe4, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }), white = lit({ color: 0xeeeeea, metalness: 0.2, roughness: 0.6 });
  const box = (x, y, z, m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
  const cyl = (r1, r2, h, m, n = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n), m);
  const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };

  // lander body: a long box with a rounded, hooded top
  g.add(at(box(2.1, 0.55, 1.25, body), 0, 0.85, 0));
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.1, 32, 1, false, 0, Math.PI), body);
  g.add(at(hood, 0, 1.12, 0, 0, 0, Math.PI / 2)); hood.rotation.set(Math.PI / 2, 0, Math.PI / 2); hood.scale.set(1, 1, 0.55);
  g.add(at(box(2.14, 0.06, 1.29, alu), 0, 0.58, 0));                                   // base plate
  // MMRTG nuclear power source at the back: a finned cylinder
  const rtg = new THREE.Group(); g.add(at(rtg, -1.25, 1.0, 0, 0, 0, Math.PI / 2));
  rtg.add(cyl(0.2, 0.2, 0.62, dark, 20)); for (let i = 0; i < 8; i++) { const f = box(0.03, 0.62, 0.16, dark); f.position.set(Math.cos(i * Math.PI / 4) * 0.26, 0, Math.sin(i * Math.PI / 4) * 0.26); f.rotation.y = -i * Math.PI / 4; rtg.add(f); }
  // two medium-gain antennas and the high-gain dish on top
  g.add(at(cyl(0.3, 0.12, 0.08, white, 28), 0.35, 1.5, 0)); g.add(at(cyl(0.03, 0.03, 0.2, alu, 8), 0.35, 1.4, 0));
  for (const z of [-0.4, 0.4]) g.add(at(box(0.3, 0.04, 0.18, white), -0.55, 1.47, z));
  // camera / drill heads at the front
  g.add(at(box(0.25, 0.22, 0.3, dark), 1.15, 0.78, 0.25)); g.add(at(cyl(0.06, 0.06, 0.15, white, 12), 1.3, 0.78, 0.25, 0, 0, Math.PI / 2));
  // two landing skids
  for (const z of [-0.5, 0.5]) { g.add(at(cyl(0.035, 0.035, 2.3, alu, 10), 0, 0.05, z, 0, 0, Math.PI / 2));
    for (const x of [-0.7, 0.7]) g.add(at(cyl(0.03, 0.03, 0.6, alu, 8), x, 0.32, z * 0.9, z * 0.4, 0, 0)); }
  // four arms, each with a pair of counter-rotating three-bladed rotors (one above, one below)
  const rotors = [];
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const hx = sx * 1.55, hz = sz * 1.35, arm = new THREE.Group(); g.add(arm);
    const len = Math.hypot(hx * 0.75, hz * 0.6), a = box(len, 0.08, 0.1, alu); a.position.set(hx * 0.62, 1.0, hz * 0.62); a.rotation.y = -Math.atan2(hz, hx); arm.add(a);
    arm.add(at(cyl(0.09, 0.09, 0.5, alu, 12), hx, 1.0, hz));                          // motor housing
    for (const [y, dir] of [[1.28, 1], [0.72, -1]]) { const r = new THREE.Group(); r.position.set(hx, y, hz); r.userData.dir = dir; arm.add(r); rotors.push(r);
      r.add(cyl(0.07, 0.07, 0.08, dark, 12));
      for (let b = 0; b < 3; b++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.015, 0.11), blade); bl.position.x = 0.33; const p = new THREE.Group(); p.rotation.y = b * 2.094; bl.rotation.x = 0.12 * dir; p.add(bl); r.add(p); } }
  }
  g.userData.rotors = rotors;
  return g;
}

// ---------- on Titan: Shangri-La dunes, just south of Selk crater (about 6° N, 199° W) ----------
const titan = bodies.Titan?.obj;
if (titan) {
  const R = 0.37, lat = 6 * Math.PI / 180, lon = -199 * Math.PI / 180;
  const n = V(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).normalize();
  const pin = new THREE.Group(); pin.position.copy(n).multiplyScalar(R); pin.quaternion.setFromUnitVectors(V(0, 1, 0), n); titan.add(pin);
  const craft = buildDragonfly(), holder = new THREE.Group(); holder.add(craft); holder.scale.setScalar(0.006); pin.add(holder);   // about 0.023 across, enlarged to be seen
  // gentle hops: lift off, hover, set down (Titan's thick air and low gravity make flying easy)
  sim.push(() => { const t = performance.now() / 1000, cyc = (t % 24) / 24;
    const h = cyc < 0.1 ? 0 : cyc < 0.3 ? (cyc - 0.1) / 0.2 : cyc < 0.8 ? 1 : cyc < 0.95 ? 1 - (cyc - 0.8) / 0.15 : 0;
    holder.position.y = 0.022 * (h * h * (3 - 2 * h));
    const spin = h > 0 || (cyc > 0.07 && cyc < 0.97); for (const r of craft.userData.rotors) if (spin) r.rotation.y += 0.9 * r.userData.dir; });
  nearLabel(pin, 'Dragonfly', 0.06, 'Dragonfly', 'craft', 3);
  const wp = V(), tp = V();
  bodies.Dragonfly = { obj: pin, radius: 0.03, view: 0.13, dir: () => {   // from the sunlit side, a little above the dunes
    pin.getWorldPosition(wp); titan.getWorldPosition(tp); const up = wp.clone().sub(tp).normalize(), sun = wp.clone().negate().normalize();
    const side = sun.sub(up.clone().multiplyScalar(sun.dot(up))); if (side.lengthSq() < 1e-6) side.set(1, 0, 0); side.normalize();
    return up.multiplyScalar(0.55).add(side.multiplyScalar(0.85)).normalize(); } };
  info('Dragonfly', 'Dragonfly', 'Spacecraft · NASA rotorcraft for Titan', 'launch July 2028 · shown at its Titan landing site', 'See card.');

  Object.assign(D, {
    Dragonfly: { intro: ['Dragonfly is a car-sized, nuclear-powered octocopter that NASA will send to Saturn’s moon Titan, the first time it flies a science vehicle on another world’s skies. Titan has a thick nitrogen atmosphere and low gravity, so flying is easier there than on Earth. It will hop between sites to study the chemistry that comes before life.',
        'Dragonfly est un octocoptère à propulsion nucléaire, de la taille d’une voiture, que la NASA enverra sur Titan, la lune de Saturne : la première fois qu’elle fera voler un engin scientifique dans le ciel d’un autre monde. Titan a une atmosphère épaisse d’azote et une faible gravité : y voler est plus facile que sur Terre. Il sautera de site en site pour étudier la chimie qui précède la vie.'],
      tiles: [T('Launch', 'Lancement', 'July 2028 · SpaceX Falcon Heavy, Kennedy Space Center', 'juillet 2028 · SpaceX Falcon Heavy, Kennedy Space Center'),
        T('Arrival', 'Arrivée', '2034, after about 6 years', '2034, après environ 6 ans'),
        T('Landing site', 'Site d’atterrissage', 'Shangri-La dunes, just south of Selk crater', 'les dunes de Shangri-La, juste au sud du cratère Selk'),
        T('Size', 'Taille', '3.85 × 3.85 m, 1.75 m tall', '3,85 × 3,85 m, 1,75 m de haut'),
        T('Rotors', 'Rotors', '8: four pairs, counter-rotating, three blades each', '8 : quatre paires contrarotatives, à trois pales'),
        T('Power', 'Énergie', 'a nuclear MMRTG (no solar panels: Titan is too dim)', 'un générateur nucléaire MMRTG (pas de panneaux : Titan est trop sombre)'),
        T('Mission', 'Mission', 'more than 3 years on Titan', 'plus de 3 ans sur Titan'),
        T('Built by', 'Construit par', 'Johns Hopkins APL, for NASA · about $3.35 billion', 'Johns Hopkins APL, pour la NASA · environ 3,35 milliards $')],
      facts: [['The dunes of Shangri-La are not made of rock sand but most likely of grains of frozen hydrocarbons.', 'Les dunes de Shangri-La ne sont pas faites de sable de roche mais très probablement de grains d’hydrocarbures gelés.'],
        ['It will fly to dozens of places, covering more than 100 km in all, far more than any rover could drive.', 'Il volera vers des dizaines de sites, sur plus de 100 km au total, bien plus qu’un rover ne pourrait parcourir.'],
        ['It follows Europe’s Huygens probe, which landed on Titan in January 2005.', 'Il suit la sonde européenne Huygens, posée sur Titan en janvier 2005.'],
        ['You can send your name with it: NASA collects names at nasa.gov/dragonfly until 15 January 2027.', 'Vous pouvez envoyer votre nom avec lui : la NASA collecte les noms sur nasa.gov/dragonfly jusqu’au 15 janvier 2027.']] },
  });

  // menu: with the missions in flight
  const og = [...focusSel.querySelectorAll('optgroup')].find(g => g.label.includes('Missions in flight'));
  if (og) { const o = document.createElement('option'); o.value = 'Dragonfly'; o.textContent = 'Dragonfly to Titan (2028–2034)'; const after = og.querySelector('option[value="Lucy"]'); after ? after.after(o) : og.appendChild(o); }

  SS.i18nAdd?.({
    name: { 'Dragonfly to Titan (2028–2034)': 'Dragonfly vers Titan (2028–2034)' },
    cat: { 'Spacecraft · NASA rotorcraft for Titan': 'Engin spatial · giravion de la NASA pour Titan' },
    dist: { 'launch July 2028 · shown at its Titan landing site': 'lancement en juillet 2028 · montré sur son site d’atterrissage sur Titan' },
  });
}
