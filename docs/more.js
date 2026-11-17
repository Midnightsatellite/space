// =====================================================================
// Space Explorer: more objects, new features, One Fact mode, English / French
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { scene, camera, controls, bodies, sim, addLabel, flyTo, focusSel, loadTex, glowSprite, hash } = SS;
const { info, INFO, star, deepLabel, softDot, puff, gauss, galaxy, cloudObject, scatter, pointStar, blackHole, earthOrbiter, place } = SS.cosmos;
const { addMoon, smallBody, exoPlanet, paint, lumpy, addGroup, nearLabel, scaleHide, PL, dps, J2000 } = SS.extras;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const $ = id => document.getElementById(id);
const rnd = (i, s) => hash(i * 1.37 + 3, s * 2.11 + 7);

// =====================================================================
// 1. MORE OBJECTS
// =====================================================================

// ---------- Moons of Saturn and Uranus ----------
addMoon({ planet: 'Saturn', key: 'Mimas', name: 'Mimas', r: 0.09, dist: 6.45, period: 0.942, inTilted: true, incl: 0, tex: paint(601, '#8a8a88', '#dcdcd8', 2.4, 60, ctx => {
  ctx.fillStyle = 'rgba(60,60,60,0.55)'; ctx.beginPath(); ctx.arc(170, 120, 42, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(200,200,200,0.6)'; ctx.beginPath(); ctx.arc(170, 120, 8, 0, 7); ctx.fill(); }),
  cat: 'Moon of Saturn', distStr: 'orbits Saturn at 185,500 km', fact: 'One crater, Herschel, is a third as wide as the whole moon. The impact that made it nearly shattered Mimas.' });
addMoon({ planet: 'Saturn', key: 'Tethys', name: 'Tethys', r: 0.12, dist: 7.3, period: 1.888, inTilted: true, incl: 0.01, tex: paint(611, '#b8b8b4', '#f4f4f0', 1.8, 40), cat: 'Moon of Saturn', distStr: 'orbits Saturn at 294,700 km', fact: 'Made almost entirely of water ice, with a canyon, Ithaca Chasma, about 2,000 km long.' });
addMoon({ planet: 'Saturn', key: 'Dione', name: 'Dione', r: 0.13, dist: 7.9, period: 2.737, inTilted: true, incl: 0.005, tex: paint(621, '#9a9690', '#e8e4dc', 1.8, 50), cat: 'Moon of Saturn', distStr: 'orbits Saturn at 377,400 km', fact: 'Bright cliffs of ice, hundreds of metres high, streak across one side of it.' });
addMoon({ planet: 'Saturn', key: 'Rhea', name: 'Rhea', r: 0.17, dist: 8.6, period: 4.518, inTilted: true, incl: 0.006, tex: paint(631, '#8e8a84', '#dcd8d0', 1.8, 120), cat: 'Moon of Saturn', distStr: 'orbits Saturn at 527,000 km', fact: 'Saturn\'s second-largest moon: a cold, cratered ball of ice and rock about 1,500 km across.' });
addMoon({ planet: 'Saturn', key: 'Iapetus', name: 'Iapetus', r: 0.16, dist: 12.4, period: 79.33, inTilted: true, incl: 0.27, tex: paint(641, '#cfc8bc', '#f2eee6', 1.6, 30, ctx => {
  const g = ctx.createLinearGradient(0, 0, 512, 0); g.addColorStop(0, 'rgba(30,20,12,0.95)'); g.addColorStop(0.42, 'rgba(30,20,12,0.95)'); g.addColorStop(0.55, 'rgba(30,20,12,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 256); ctx.strokeStyle = 'rgba(90,80,70,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 128); ctx.lineTo(512, 128); ctx.stroke(); }),
  cat: 'Moon of Saturn', distStr: 'orbits Saturn at 3.56 million km', fact: 'Two-faced: one half is as dark as coal, the other as bright as snow. A 13 km-high ridge runs around its middle.' });
addMoon({ planet: 'Uranus', key: 'Ariel', name: 'Ariel', r: 0.12, dist: 2.35, period: 2.52, inTilted: true, tex: paint(651, '#7a7672', '#d8d2ca', 2, 25), cat: 'Moon of Uranus', distStr: 'orbits Uranus at 191,000 km', fact: 'The brightest of Uranus\'s moons, criss-crossed by long valleys. It has the youngest surface of them all.' });
addMoon({ planet: 'Uranus', key: 'Umbriel', name: 'Umbriel', r: 0.12, dist: 2.56, period: 4.144, inTilted: true, tex: paint(661, '#2e2c2a', '#6a6660', 2, 90), cat: 'Moon of Uranus', distStr: 'orbits Uranus at 266,000 km', fact: 'The darkest of Uranus\'s big moons, with a strange bright ring on its surface.' });
addMoon({ planet: 'Uranus', key: 'Oberon', name: 'Oberon', r: 0.15, dist: 3.15, period: 13.46, inTilted: true, tex: paint(671, '#5e5650', '#b8aea4', 2, 80), cat: 'Moon of Uranus', distStr: 'orbits Uranus at 584,000 km', fact: 'The outermost of Uranus\'s large moons, with a mountain about 11 km high.' });

// ---------- Comets & asteroids ----------
{ // 67P: two lobes stuck together, like a rubber duck
  const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0x3a3836, roughness: 1 });
  const a = new THREE.Mesh(lumpy(0.14, 0.3, 21, [1.3, 1, 1]), m); a.position.x = -0.1; g.add(a);
  const b = new THREE.Mesh(lumpy(0.1, 0.3, 22, [1.1, 1, 1]), m); b.position.set(0.15, 0.08, 0); g.add(b);
  const c67 = smallBody({ key: 'Comet67P', name: '67P/Churyumov–Gerasimenko', el: { a: 3.46, e: 0.641, i: 7.04, node: 50.14, peri: 12.78 }, mesh: g, color: 0x8fd8ff, perihelionMs: Date.UTC(2021, 10, 2),
    cat: 'Comet', distStr: 'orbits the Sun every 6.4 years', fact: 'In 2014 the Rosetta spacecraft orbited it and dropped the little Philae lander on it: the first landing on a comet.' });
  c67.holder.add(glowSprite(0.8, 'rgba(200,235,255,0.6)', 'rgba(0,0,0,0)', 0.5));
}
smallBody({ key: 'Apophis', name: 'Apophis', el: { a: 0.9224, e: 0.1914, i: 3.34, node: 204.0, peri: 126.7 }, M0: 1.2, color: 0xff9a7a,
  mesh: new THREE.Mesh(lumpy(0.07, 0.25, 31, [1.3, 0.9, 0.9]), new THREE.MeshStandardMaterial({ map: paint(681, '#3a3530', '#857a6e', 4, 20), roughness: 1 })),
  cat: 'Near-Earth asteroid', distStr: 'crosses Earth\'s orbit', fact: 'On 13 April 2029 it will pass just 32,000 km from Earth, closer than many satellites, bright enough to see with the naked eye.' });
smallBody({ key: 'Psyche', name: 'Psyche', el: { a: 2.92, e: 0.134, i: 3.1, node: 150.0, peri: 229.0 }, M0: 3.3, color: 0xc8c8d8,
  mesh: new THREE.Mesh(lumpy(0.17, 0.2, 41, [1.25, 0.95, 0.8]), new THREE.MeshStandardMaterial({ color: 0x8a8a90, metalness: 0.7, roughness: 0.5 })),
  cat: 'Asteroid · metal-rich', distStr: 'about 437 million km from the Sun', fact: 'Rich in metal: it may be the exposed core of a planet that was smashed apart. NASA\'s Psyche spacecraft arrives in 2029.' });
smallBody({ key: 'Eros', name: 'Eros', el: { a: 1.458, e: 0.223, i: 10.83, node: 304.3, peri: 178.9 }, M0: 0.4, color: 0xd0b090,
  mesh: new THREE.Mesh(lumpy(0.08, 0.15, 51, [2.2, 0.8, 0.8]), new THREE.MeshStandardMaterial({ map: paint(691, '#5a4c3c', '#b09878', 3, 40), roughness: 1 })),
  cat: 'Near-Earth asteroid', distStr: 'about 218 million km from the Sun', fact: 'Shaped like a peanut. In 2001 NEAR Shoemaker landed on it: the first spacecraft ever to touch down on an asteroid.' });

// ---------- Stars ----------
star({ key: 'TauCeti', name: 'Tau Ceti', ra: 26.017, dec: -15.938, ly: 11.9, bv: 0.72, R: 0.79, cat: 'Star', dist: '11.9 light-years', fact: 'One of the closest Sun-like stars, a favourite target in the search for alien radio signals.' });
star({ key: 'Mira', name: 'Mira', ra: 34.837, dec: -2.977, ly: 300, bv: 1.5, R: 330, cat: 'Star · red giant', dist: 'about 300 light-years', fact: 'Its brightness rises and falls over 332 days, and it drags a 13 light-year tail of gas behind it, like a comet.' });
star({ key: 'UYScuti', name: 'UY Scuti', ra: 276.367, dec: -12.463, ly: 5900, bv: 2.6, R: 909, cat: 'Star · red supergiant', dist: 'about 5,900 light-years', fact: 'One of the biggest stars known. In place of the Sun, its surface would reach beyond the asteroid belt, almost to Jupiter.' });

// ---------- Exoplanets ----------
const jupTex = loadTex('tex/jupiter.jpg');
star({ key: 'HD189733', name: 'HD 189733', ra: 300.18, dec: 22.71, ly: 64.5, bv: 0.93, R: 0.8, cat: 'Star', dist: '64.5 light-years', fact: 'An orange star with a famous blue planet.' });
exoPlanet({ hostKey: 'HD189733', key: 'HD189733b', name: 'HD 189733 b', r: 0.9, dist: 3.6, period: 2.2, tex: jupTex, tint: 0x5f8cff,
  cat: 'Exoplanet · hot Jupiter', distStr: '64.5 light-years away', fact: 'A deep-blue gas giant where it may rain molten glass, sideways, in winds of about 8,000 km/h.' });
star({ key: 'Cnc55', name: '55 Cancri', ra: 133.149, dec: 28.331, ly: 41, bv: 0.87, R: 0.94, cat: 'Star', dist: '41 light-years', fact: 'A Sun-like star with at least five planets.' });
exoPlanet({ hostKey: 'Cnc55', key: 'Cnc55e', name: '55 Cancri e', r: 0.42, dist: 2.4, period: 0.74, tex: paint(701, '#2a0a04', '#ff7a20', 1.4, 0, ctx => {
  for (let i = 0; i < 80; i++) { ctx.strokeStyle = `rgba(255,${120 + rnd(i, 3) * 100},40,0.6)`; ctx.lineWidth = 1 + rnd(i, 4) * 3; ctx.beginPath(); const x = rnd(i, 1) * 512, y = rnd(i, 2) * 256; ctx.moveTo(x, y); ctx.lineTo(x + (rnd(i, 5) - 0.5) * 80, y + (rnd(i, 6) - 0.5) * 30); ctx.stroke(); } }),
  cat: 'Exoplanet · lava world', distStr: '41 light-years away', fact: 'So close to its star that its surface is probably an ocean of lava. A year there lasts just 18 hours.' });
star({ key: 'Kepler452', name: 'Kepler-452', ra: 296.0, dec: 44.28, ly: 1800, bv: 0.65, R: 1.1, cat: 'Star', dist: 'about 1,800 light-years', fact: 'A slightly older, slightly bigger twin of our Sun.' });
exoPlanet({ hostKey: 'Kepler452', key: 'Kepler452b', name: 'Kepler-452b', r: 0.4, dist: 3.9, period: 385, labelRange: 200, tex: paint(711, '#2a4a3a', '#a8b890', 1.6, 5),
  cat: 'Exoplanet · super-Earth', distStr: 'about 1,800 light-years away', fact: 'Nicknamed "Earth\'s cousin": a bigger world circling a Sun-like star once every 385 days, in the zone where water could be liquid.' });
star({ key: 'TOI700', name: 'TOI-700', ra: 97.096, dec: -65.579, ly: 101.4, bv: 1.5, R: 0.42, cat: 'Star · red dwarf', dist: '101 light-years', fact: 'A quiet red dwarf with four known planets.' });
exoPlanet({ hostKey: 'TOI700', key: 'TOI700d', name: 'TOI-700 d', r: 0.3, dist: 3.0, period: 37.4, tex: paint(721, '#3a4a6a', '#c8d0d8', 1.8, 10),
  cat: 'Exoplanet', distStr: '101 light-years away', fact: 'An Earth-sized planet in its star\'s habitable zone, found by NASA\'s TESS satellite in 2020.' });

star({ key: 'Kepler7', name: 'Kepler-7', ra: 291.582, dec: 41.09, ly: 3000, bv: 0.6, R: 1.84, cat: 'Star', dist: 'about 3,000 light-years', fact: 'A Sun-like star, a little bigger and older than ours.' });
exoPlanet({ hostKey: 'Kepler7', key: 'Kepler7b', name: 'Kepler-7b', r: 1.15, dist: 4.2, period: 4.89, labelRange: 200, tex: jupTex, tint: 0xfff0d8,
  cat: 'Exoplanet · puffy gas giant', distStr: 'about 3,000 light-years away', fact: 'One of the puffiest planets known: about 1.6 times as wide as Jupiter, yet with the density of Styrofoam. It was also the first exoplanet whose clouds were mapped.' });
star({ key: 'HD40307', name: 'HD 40307', ra: 65.69, dec: -60.04, ly: 42, bv: 0.94, R: 0.72, cat: 'Star · orange dwarf', dist: '42 light-years', fact: 'An orange star with at least six planets.' });
exoPlanet({ hostKey: 'HD40307', key: 'HD40307g', name: 'HD 40307 g', r: 0.42, dist: 5.2, period: 197.8, tex: paint(731, '#2a5a6a', '#b8d8d0', 1.6, 8),
  cat: 'Exoplanet · super-Earth', distStr: '42 light-years away', fact: 'A super-Earth about 7 times Earth\'s mass, orbiting in its star\'s habitable zone, where liquid water could exist.' });

// ---------- Nebulae ----------
cloudObject({ key: 'Lagoon', name: 'Lagoon Nebula', ra: 270.9, dec: -24.38, ly: 4100, size: 62, cat: 'Star-forming nebula', dist: 'about 4,100 light-years',
  fact: 'A huge glowing cloud where thousands of new stars are forming. You can see it with binoculars from a dark site.',
  build: (h, s) => {
    scatter(h, 130, s, [0xff4a7a, 0xff6a8a, 0xe04a9a, 0xff8a70], [1.4, 0.8, 0.4], [0.15, 0.38]);
    scatter(h, 30, s * 0.4, [0xfff0d8, 0x9fe0ff], [1, 0.8, 0.4], [0.2, 0.4]);
    for (let i = 0; i < 16; i++) pointStar(h, V(gauss() * s * 0.3, gauss() * s * 0.2, gauss() * 3), '#e8f0ff', 3 + Math.random() * 4);
  } });
cloudObject({ key: 'Horsehead', name: 'Horsehead Nebula', ra: 85.245, dec: -2.458, ly: 1375, size: 40, cat: 'Dark nebula', dist: 'about 1,375 light-years',
  fact: 'A cold, dark cloud of dust shaped like a horse\'s head, standing out against glowing red gas behind it.',
  build: (h, s) => {
    scatter(h, 110, s, [0xff3a4a, 0xd8304a, 0xff5a5a], [1.4, 1, 0.3], [0.18, 0.4]);
    const tex = SS.cosmos.radialTex([[0, 'rgba(255,255,255,1)'], [0.6, 'rgba(255,255,255,0.95)'], [1, 'rgba(255,255,255,0)']]);
    const dark = new THREE.SpriteMaterial({ map: tex, color: 0x000000, transparent: true, opacity: 0.94, depthWrite: false });
    const blob = (x, y, sx, sy = sx) => { const sp = new THREE.Sprite(dark); sp.scale.set(sx * 1.35, sy * 1.35, 1); sp.position.set(x, y, 2); sp.renderOrder = 3; h.add(sp); };
    blob(0, -9, 8, 18); blob(1, 2, 8, 8);                  // neck
    blob(2.5, 6.5, 10, 9); blob(7.5, 3.5, 8, 5.5); blob(10.5, 1.5, 4.5, 3.5);   // head and muzzle
    blob(-0.5, 11.5, 3.5, 5);                               // ear
    for (let i = 0; i < 14; i++) blob(-24 + i * 3.6, -19 - Math.random() * 2, 9, 7);   // dark cloud below
  } });
cloudObject({ key: 'CatsEye', name: "Cat's Eye Nebula", ra: 269.639, dec: 66.633, ly: 3300, size: 24, cat: 'Planetary nebula', dist: 'about 3,300 light-years',
  fact: 'A dying star has puffed off at least 11 shells of gas, about one every 1,500 years, like the rings of an onion.',
  build: (h, s) => {
    for (const [rr, col, n] of [[0.2, 0x60ffb0, 50], [0.32, 0x40d8c0, 60], [0.45, 0xff6a5a, 70]]) for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, r = s * rr + gauss() * 0.5; const p = puff(col, s * 0.18, 0.4); p.position.set(Math.cos(a) * r * 1.35, Math.sin(a) * r, gauss()); h.add(p); }
    pointStar(h, V(), '#ffffff', 3);
  } });

// ---------- Galaxies ----------
galaxy({ key: 'Pinwheel', name: 'Pinwheel Galaxy', ra: 210.802, dec: 54.349, ly: 2.1e7, R: 85, incl: 16, type: 'spiral', n: 32000, arms: 4, pitch: 0.4, bulge: 0.08, seed: 21,
  cat: 'Galaxy · spiral', dist: 'about 21 million light-years', fact: 'Nearly twice as wide as the Milky Way: about 170,000 light-years across, with a trillion stars.' });
{ const cenA = galaxy({ key: 'CenA', name: 'Centaurus A', ra: 201.365, dec: -43.019, ly: 1.2e7, R: 75, incl: 70, type: 'elliptical', n: 26000, seed: 31, bright: 0.8,
    cat: 'Galaxy · giant elliptical', dist: 'about 12 million light-years', fact: 'Crossed by a dark lane of dust left by a spiral galaxy it swallowed. Its black hole fires jets about a million light-years long.' });
  const lane = new THREE.Mesh(new THREE.RingGeometry(75 * 0.12, 75 * 0.55, 96), new THREE.MeshBasicMaterial({ color: 0x060302, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
  lane.rotation.x = -Math.PI / 2 + 0.25; lane.renderOrder = 5; cenA.disk.add(lane);
  for (const sgn of [1, -1]) { const j = glowSprite(1, 'rgba(160,200,255,0.55)', 'rgba(0,0,0,0)', 0.6); j.scale.set(22, 150, 1); j.position.y = sgn * 75; j.material.rotation = 0; cenA.disk.add(j); }
}
{ const cw = galaxy({ key: 'Cartwheel', name: 'Cartwheel Galaxy', ra: 9.42, dec: -33.72, ly: 5e8, R: 22, incl: 40, type: 'elliptical', n: 6000, seed: 41, bright: 1.2,
    cat: 'Galaxy · ring', dist: 'about 500 million light-years', fact: 'About 400 million years ago a smaller galaxy punched straight through it, sending a ring of new stars rippling outward like a stone dropped in a pond.' });
  const n = 9000, pos = new Float32Array(n * 3), col = new Float32Array(n * 3); const c = new THREE.Color();
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, ring = Math.random() < 0.75; const r = ring ? 62 + gauss() * 4 : 22 + Math.random() * 38;
    pos.set([Math.cos(a) * r, gauss() * 1.2, Math.sin(a) * r], i * 3); c.set(ring ? (Math.random() < 0.15 ? '#ff7ab0' : '#9fc0ff') : '#ffd9a0'); col.set([c.r, c.g, c.b], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  cw.disk.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, map: softDot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 })));
  bodies.Cartwheel.radius = 65; bodies.Cartwheel.view = 160;
}

// ---------- Black holes ----------
blackHole({ key: 'TON618', name: 'TON 618', ra: 187.104, dec: 31.477, ly: 1.04e10, rs: 16, jet: true, inclination: 1.1, hot: '#e8f0ff', cool: '#5a8cff',
  cat: 'Ultramassive black hole · quasar', dist: 'light travelled about 10 billion years to reach us', fact: 'One of the most massive black holes known: around 40 billion times the Sun\'s mass. The gas falling into it shines brighter than 100 trillion Suns.' });
bodies.TON618.view = 90;
blackHole({ key: 'V404Cyg', name: 'V404 Cygni', ra: 306.016, dec: 33.867, ly: 7800, rs: 1.6, inclination: 1.2,
  cat: 'Black hole · stellar', dist: 'about 7,800 light-years', fact: 'A black hole about 9 times the Sun\'s mass, slowly stripping gas from a companion star. In 2015 it flared up so brightly that amateur astronomers could see it.' });

// ---------- Spacecraft ----------
const metal = (c, m = 0.8, r = 0.35) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
{ // Parker Solar Probe: the closest dive to the Sun (orbit shown just outside the Sun's surface)
  const g = new THREE.Group();
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 32), new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.9 })); shield.rotation.z = Math.PI / 2; shield.position.x = 0.5; g.add(shield);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 6), metal(0x9aa0aa)); body.rotation.z = Math.PI / 2; g.add(body);
  for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.45), metal(0x1b2f78, 0.6, 0.3)); p.position.set(-0.1, 0, s * 0.55); g.add(p); }
  g.scale.setScalar(0.35); const holder = new THREE.Group(); holder.add(g); scene.add(holder); scaleHide.push(holder);
  const q = 6.2, Q = 13.6, a = (q + Q) / 2, e = (Q - q) / (Q + q), b = a * Math.sqrt(1 - e * e), P = 88, peri = Date.UTC(2024, 11, 24, 11, 53), tilt = 0.06, w = 1.3;
  const pts = []; for (let k = 0; k <= 200; k++) { const E = k / 200 * 6.2832; pts.push(V(a * (Math.cos(E) - e), 0, b * Math.sin(E)).applyAxisAngle(V(0, 1, 0), w).applyAxisAngle(V(1, 0, 0), tilt)); }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.35 })); scene.add(line); SS.orbitLines.push(line); scaleHide.push(line);
  sim.push(() => {
    const M = ((2 * Math.PI * ((SS.getDate() - peri) / 864e5) / P) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    let E = M; for (let i = 0; i < 20; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    holder.position.copy(V(a * (Math.cos(E) - e), 0, b * Math.sin(E)).applyAxisAngle(V(0, 1, 0), w).applyAxisAngle(V(1, 0, 0), tilt));
    holder.lookAt(0, 0, 0); holder.rotateY(-Math.PI / 2);                 // heat shield faces the Sun
  });
  nearLabel(holder, 'Parker Solar Probe', 0.6, 'Parker', 'craft', 60);
  bodies.Parker = { obj: holder, radius: 0.25, view: 2.2, dir: t => { const toSun = t.clone().negate().normalize(); return V(0, 1, 0).cross(toSun).normalize().add(V(0, 0.5, 0)).add(toSun.multiplyScalar(-0.4)).normalize(); } };
  info('Parker', 'Parker Solar Probe', 'Spacecraft · solar probe', 'dives to 6.1 million km from the Sun',
    'The fastest object ever built. On 24 December 2024 it flew through the Sun\'s outer atmosphere at about 690,000 km/h, shielded by a 11 cm-thick carbon heat shield.');
}
{ // Juno, on its long looping polar orbit around Jupiter
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.35, 6), metal(0xc8a040)));
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 8, 0, 6.283, 0, 0.7), new THREE.MeshStandardMaterial({ color: 0xf4f4f4, side: THREE.DoubleSide })); dish.position.y = 0.4; dish.rotation.x = Math.PI; g.add(dish);
  for (let k = 0; k < 3; k++) { const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.03, 0.55), metal(0x1b2f78, 0.6, 0.3)); arm.position.x = 1.45; const p = new THREE.Group(); p.rotation.y = k * 2.094; p.add(arm); g.add(p); }
  g.scale.setScalar(0.12);
  const piv = new THREE.Group(); piv.rotation.z = Math.PI / 2 - 0.1; bodies.Jupiter.obj.add(piv);
  const orb = new THREE.Group(); piv.add(orb); orb.add(g);
  const q = 3.4, Q = 9, a = (q + Q) / 2, e = (Q - q) / (Q + q), b = a * Math.sqrt(1 - e * e);
  const pts = []; for (let k = 0; k <= 160; k++) { const E = k / 160 * 6.2832; pts.push(V(a * (Math.cos(E) - e), 0, b * Math.sin(E))); }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.3 })); orb.add(line); SS.orbitLines.push(line);
  sim.push(() => { const M = ((2 * Math.PI * ((SS.getDate() - J2000) / 864e5) / 33) % 6.2832 + 6.2832) % 6.2832; let E = M; for (let i = 0; i < 20; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    g.position.set(a * (Math.cos(E) - e), 0, b * Math.sin(E)); g.rotation.y += SS.frameDt * 1.5; });
  nearLabel(g, 'Juno', 3.2, 'Juno', 'craft', 40);
  bodies.Juno = { obj: g, radius: 0.15, view: 1.4 };
  info('Juno', 'Juno', 'Spacecraft · Jupiter orbiter', 'in orbit around Jupiter since 2016',
    'Solar-powered, even at Jupiter. It swoops over the planet\'s poles, under the clouds\' cyclones, carrying three LEGO figures: Galileo, Jupiter and Juno.');
}
{ // Perseverance rover in Jezero Crater, Mars
  const rover = new THREE.Group();
  rover.add(new THREE.Mesh(new THREE.BoxGeometry(1, 0.35, 0.7), new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.6 })));
  for (const x of [-0.4, 0, 0.4]) for (const z of [-0.42, 0.42]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 12), metal(0x444444)); w.rotation.x = Math.PI / 2; w.position.set(x, -0.25, z); rover.add(w); }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), metal(0xdddddd)); mast.position.set(0.35, 0.45, 0.2); rover.add(mast);
  rover.scale.setScalar(0.03);
  const mars = PL.Mars.tilted.children[0], R = mars.geometry.parameters.radius, T = PL.Mars.tilted;
  const lat = 18.4 * Math.PI / 180, wp = V(), mp = V(), sl = V(), n = V();
  T.add(rover);
  sim.push(() => {   // shown in Jezero's afternoon so it is always lit (Mars itself keeps spinning)
    T.getWorldPosition(mp); sl.copy(T.worldToLocal(V(0, 0, 0))).normalize();
    const lon = Math.atan2(-sl.z, sl.x) - 0.55;
    n.set(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).normalize();
    rover.position.copy(n).multiplyScalar(R * 1.004); rover.quaternion.setFromUnitVectors(V(0, 1, 0), n);
  });
  nearLabel(rover, 'Perseverance', 6, 'Perseverance', 'craft', 6);
  bodies.Perseverance = { obj: rover, radius: 0.02, view: 0.4, dir: () => { rover.getWorldPosition(wp); T.getWorldPosition(mp); const up = wp.clone().sub(mp).normalize(); return up.add(mp.clone().negate().normalize().multiplyScalar(0.8)).add(V(0, 0.2, 0)).normalize(); } };
  info('Perseverance', 'Perseverance rover', 'Rover · on Mars since 2021', 'Jezero Crater, Mars',
    'A car-sized robot searching an ancient lake bed for signs of past life. It brought the Ingenuity helicopter, the first aircraft to fly on another planet.');
}
earthOrbiter({ key: 'Tiangong', name: 'Tiangong', scale: 0.02, radius: 1.17, incl: 0.72, speed: 0.56, phase: 4, view: 0.2,
  model: () => { const g = new THREE.Group(), w = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 }), pnl = metal(0x1b2f78, 0.6, 0.3);
    const cyl = (r, l) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 16), w);
    const core = cyl(0.22, 1.8); core.rotation.x = Math.PI / 2; g.add(core);
    for (const s of [1, -1]) { const lab = cyl(0.2, 1.6); lab.rotation.z = Math.PI / 2; lab.position.set(s * 0.9, 0, 0.7); g.add(lab);
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.5), pnl); p.position.set(s * 2.2, 0, 0.7); g.add(p); }
    return g; },
  cat: 'Spacecraft · space station', dist: 'about 390 km above Earth', fact: 'China\'s T-shaped space station, permanently crewed since 2022 by teams of three taikonauts.' });

{ // Nancy Grace Roman Space Telescope, near James Webb at Sun–Earth L2
  const g = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xd8dce4, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide, emissive: 0x3a4050 })); g.add(tube);
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 6), metal(0xc8a040)); bus.position.y = -1.1; g.add(bus);
  const shade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.04), metal(0x1b2f78, 0.6, 0.3)); shade.position.set(0, -0.2, -0.75); g.add(shade);
  g.scale.setScalar(0.06); scene.add(g);
  const e = V(); let a = 2;
  sim.push(dt => { a += dt * 0.25; bodies.Earth.obj.getWorldPosition(e); const away = e.clone().normalize();
    const side = V(0, 1, 0).cross(away).normalize(); g.position.copy(e).addScaledVector(away, 4.0).addScaledVector(side, 1.8).add(V(Math.cos(a) * 0.25, Math.sin(a) * 0.2, 0)); g.lookAt(e.clone().multiplyScalar(3)); g.rotateX(Math.PI / 2); });
  addLabel(g, 'Roman', 1.8 / 0.06 * 0.06, 'Roman', 'craft');
  bodies.Roman = { obj: g, radius: 0.12, view: 0.6, dir: t => t.clone().normalize().add(V(0.4, 0.5, 0)).normalize() };
  info('Roman', 'Nancy Grace Roman Space Telescope', 'Spacecraft · space telescope · launched 2026', 'heading to Sun–Earth L2, about 1.5 million km from Earth',
    'Launched on 30 August 2026. Its camera sees an area 100 times bigger than Hubble\'s, and NASA expects it to discover about 100,000 more exoplanets. Science begins in early 2027.');
}

// ---------- Fly-to menu entries for the new objects ----------
{
  const add = (group, items, before) => { const og = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === group); if (!og) return;
    for (const [k, t] of items) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); } };
  add('Moons', [['Mimas', 'Mimas (Saturn)'], ['Tethys', 'Tethys (Saturn)'], ['Dione', 'Dione (Saturn)'], ['Rhea', 'Rhea (Saturn)'], ['Iapetus', 'Iapetus (Saturn)'], ['Ariel', 'Ariel (Uranus)'], ['Umbriel', 'Umbriel (Uranus)'], ['Oberon', 'Oberon (Uranus)']]);
  add('Comets, asteroids & belts', [['Comet67P', 'Comet 67P'], ['Apophis', 'Apophis'], ['Psyche', 'Psyche'], ['Eros', 'Eros']]);
  add('Spacecraft', [['Parker', 'Parker Solar Probe'], ['Juno', 'Juno (at Jupiter)'], ['Perseverance', 'Perseverance (on Mars)'], ['Tiangong', 'Tiangong (Space Station)'], ['Roman', 'Roman Space Telescope (2026)']]);
  add('Stars (nearest first)', [['TauCeti', 'Tau Ceti'], ['Mira', 'Mira'], ['UYScuti', 'UY Scuti (giant)']]);
  add('Exoplanets', [['HD189733b', 'HD 189733 b (blue)'], ['Cnc55e', '55 Cancri e (lava)'], ['TOI700d', 'TOI-700 d'], ['HD40307g', 'HD 40307 g'], ['Kepler452b', 'Kepler-452b'], ['Kepler7b', 'Kepler-7b (puffy)']]);
  add('Star clusters & nebulae', [['Horsehead', 'Horsehead Nebula'], ['Lagoon', 'Lagoon Nebula'], ['CatsEye', "Cat's Eye Nebula"]]);
  add('Black holes', [['V404Cyg', 'V404 Cygni'], ['TON618', 'TON 618 (giant)']]);
  add('Galaxies', [['CenA', 'Centaurus A'], ['Pinwheel', 'Pinwheel Galaxy'], ['Cartwheel', 'Cartwheel Galaxy']]);
  // keep stars in distance order
  const st = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Stars (nearest first)');
  const order = ['Proxima', 'AlphaCen', 'Barnard', 'Sirius', 'Procyon', 'TauCeti', 'Altair', 'Vega', 'Fomalhaut', 'Pollux', 'Arcturus', 'Capella', 'Aldebaran', 'Regulus', 'Spica', 'Mira', 'Canopus', 'Polaris', 'Betelgeuse', 'Antares', 'Rigel', 'Deneb', 'UYScuti'];
  if (st) [...st.children].sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value)).forEach(o => st.appendChild(o));
}

SS.more = {}; SS.features = SS.features || null;
await import('./features.js');
