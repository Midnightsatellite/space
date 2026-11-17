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
  const q = 6.2, Q = 13.6, a = (q + Q) / 2, e = (Q - q) / (Q + q), b = a * Math.sqrt(1 - e * e), P = 88.44, peri = Date.UTC(2026, 8, 4, 14, 53), tilt = 0.06, w = 1.3;
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

// ---------- NASA space telescopes & exoplanet satellites ----------
const SAT = {
  white: new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 }), silver: metal(0xc8ccd4, 0.85, 0.3), gold: metal(0xc8a040, 0.8, 0.35),
  panel: metal(0x1b2f78, 0.6, 0.3), dark: metal(0x30343c, 0.5, 0.5),
};
const mk = {
  box: (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m),
  cyl: (r, l, m, seg = 20, r2 = r) => new THREE.Mesh(new THREE.CylinderGeometry(r2, r, l, seg), m),
  wings: (g, span, w, y = 0) => { for (const s of [1, -1]) { const p = mk.box(span, 0.03, w, SAT.panel); p.position.set(s * (span / 2 + 0.35), y, 0); g.add(p); } },
};
const MODELS = {
  tess: () => { const g = new THREE.Group(); g.add(mk.box(0.7, 0.5, 0.7, SAT.gold)); for (let i = 0; i < 4; i++) { const c = mk.cyl(0.11, 0.5, SAT.dark); c.position.set(-0.24 + (i % 2) * 0.48 - 0.12 + (i > 1 ? 0.24 : 0), 0.5, (i > 1 ? 0.15 : -0.15)); c.rotation.x = (i - 1.5) * 0.12; g.add(c); } mk.wings(g, 1.2, 0.45, -0.1); return g; },
  telescope: (len = 2, r = 0.3, mat = SAT.silver) => { const g = new THREE.Group(); const t = mk.cyl(r, len, mat); t.rotation.z = Math.PI / 2; g.add(t);
    const b = mk.box(0.5, 0.5, 0.5, SAT.gold); b.position.x = -len / 2 - 0.2; g.add(b);
    for (const s of [1, -1]) { const p = mk.box(len * 0.55, 0.03, 0.7, SAT.panel); p.position.set(-len * 0.15, 0, s * (r + 0.45)); g.add(p); } return g; },
  chandra: () => MODELS.telescope(3.6, 0.32, SAT.white),
  fermi: () => { const g = new THREE.Group(); g.add(mk.box(0.9, 0.7, 0.9, SAT.white)); const t = mk.box(0.8, 0.35, 0.8, SAT.gold); t.position.y = 0.52; g.add(t); mk.wings(g, 1.6, 0.6, 0); return g; },
  swift: () => { const g = MODELS.telescope(1.6, 0.36, SAT.white); return g; },
  nustar: () => { const g = new THREE.Group(); g.add(mk.box(0.5, 0.5, 0.5, SAT.gold)); const mast = mk.cyl(0.04, 3.2, SAT.silver, 6); mast.rotation.z = Math.PI / 2; mast.position.x = 1.8; g.add(mast);
    const opt = mk.box(0.35, 0.3, 0.6, SAT.white); opt.position.x = 3.4; g.add(opt); mk.wings(g, 0.9, 0.5, 0); return g; },
  ixpe: () => { const g = new THREE.Group(); g.add(mk.box(0.6, 0.4, 0.6, SAT.gold)); for (let i = 0; i < 3; i++) { const t = mk.cyl(0.1, 0.8, SAT.white); t.position.set(Math.cos(i * 2.09) * 0.18, 1.4, Math.sin(i * 2.09) * 0.18); g.add(t); }
    const boom = mk.cyl(0.05, 1.6, SAT.silver, 6); boom.position.y = 0.8; g.add(boom); mk.wings(g, 0.9, 0.4, 0); return g; },
  spherex: () => { const g = new THREE.Group(); const b = mk.box(0.6, 0.4, 0.6, SAT.gold); b.position.y = -0.5; g.add(b);
    for (let i = 0; i < 3; i++) { const c = mk.cyl(0.35 + i * 0.12, 0.35, SAT.silver, 24, 0.55 + i * 0.12); c.position.y = i * 0.32; g.add(c); } return g; },
  cubesat: (k = 1) => { const g = new THREE.Group(); g.add(mk.box(0.3, 0.3 * k, 0.2, SAT.silver)); mk.wings(g, 0.6, 0.25, 0); return g; },
  pandora: () => { const g = new THREE.Group(); g.add(mk.box(0.5, 0.5, 0.5, SAT.gold)); const t = mk.cyl(0.18, 0.7, SAT.white); t.position.y = 0.55; g.add(t); mk.wings(g, 0.9, 0.45, 0); return g; },
  kepler: () => { const g = new THREE.Group(); const t = mk.cyl(0.45, 1.8, SAT.silver, 24); g.add(t); const b = mk.cyl(0.55, 0.4, SAT.gold, 6); b.position.y = -1.1; g.add(b);
    const sh = mk.box(0.06, 2.2, 1.3, SAT.panel); sh.position.x = -0.62; g.add(sh); return g; },
  spitzer: () => { const g = new THREE.Group(); const t = mk.cyl(0.42, 1.6, SAT.silver, 24); t.position.y = 0.3; g.add(t); const b = mk.cyl(0.5, 0.4, SAT.gold, 8); b.position.y = -0.7; g.add(b);
    const sh = mk.box(0.06, 2.0, 1.2, SAT.panel); sh.position.x = 0.58; g.add(sh); return g; },
};
const earthObj = bodies.Earth.obj, _ep = V();
// satellites circling Earth (sizes greatly exaggerated so they can be seen)
function orbiter({ key, name, model, scale = 0.018, a, e = 0, incl = 0.5, node = 0, period, phase = 0, view = 0.2, cat, dist, fact, range = 5 }) {
  const piv = new THREE.Group(); piv.rotation.set(incl, node, 0); earthObj.add(piv);
  const craft = model(); craft.scale.setScalar(scale); piv.add(craft);
  const b = a * Math.sqrt(1 - e * e);
  let M = phase;
  sim.push(dt => { M += dt * (2 * Math.PI / period); let E = M; for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    craft.position.set(a * (Math.cos(E) - e), 0, b * Math.sin(E)); craft.rotation.y += dt * 0.2; });
  if (e > 0.2 || a > 1.6) { const pts = []; for (let k = 0; k <= 160; k++) { const E = k / 160 * 6.2832; pts.push(V(a * (Math.cos(E) - e), 0, b * Math.sin(E))); }
    const ln = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.2 })); piv.add(ln); SS.orbitLines.push(ln); }
  nearLabel(craft, name, 0.1 / scale, key, 'craft', range);
  bodies[key] = { obj: craft, radius: scale, view, dir: t => { earthObj.getWorldPosition(_ep); return t.clone().sub(_ep).normalize().add(V(0, 0.35, 0)).normalize(); } };
  info(key, name, cat, dist, fact);
}
orbiter({ key: 'TESS', name: 'TESS', model: MODELS.tess, scale: 0.03, a: 1.85, e: 0.48, incl: 0.65, node: 1.2, period: 26, phase: 2, view: 0.35, range: 14,
  cat: 'Spacecraft · planet-hunting telescope', dist: 'loops out almost to the Moon every 13.7 days',
  fact: 'Launched in 2018, its four cameras watch over 85% of the sky for tiny dips in starlight as planets pass their stars. More than 1,000 of its planet discoveries have now been confirmed.' });
orbiter({ key: 'Chandra', name: 'Chandra', model: MODELS.chandra, scale: 0.03, a: 1.75, e: 0.35, incl: 0.8, node: 3.4, period: 20, phase: 4, view: 0.4, range: 12,
  cat: 'Spacecraft · X-ray telescope', dist: 'up to 139,000 km from Earth',
  fact: 'NASA\'s X-ray eye, launched in 1999. It sees the hottest, most violent places in the universe, and has even spotted what may be a planet in another galaxy.' });
orbiter({ key: 'Fermi', name: 'Fermi', model: MODELS.fermi, scale: 0.016, a: 1.13, incl: 0.45, node: 0.7, period: 10, phase: 1, cat: 'Spacecraft · gamma-ray telescope', dist: 'about 535 km above Earth',
  fact: 'Launched in 2008, it watches the whole sky in gamma rays, the most energetic light there is, catching exploding stars and black hole jets.' });
orbiter({ key: 'Swift', name: 'Swift', model: MODELS.swift, scale: 0.016, a: 1.14, incl: 0.36, node: 2.1, period: 10.5, phase: 3, cat: 'Spacecraft · gamma-ray burst observatory', dist: 'about 585 km above Earth',
  fact: 'Built to react fast: when a gamma-ray burst flashes anywhere in the sky, it swings round to look within about a minute.' });
orbiter({ key: 'NuSTAR', name: 'NuSTAR', model: MODELS.nustar, scale: 0.014, a: 1.14, incl: 0.1, node: 4, period: 10.6, phase: 5, cat: 'Spacecraft · X-ray telescope', dist: 'about 610 km above Earth',
  fact: 'Unfolded a 10-metre mast in space to focus high-energy X-rays, the light that pours out from around black holes.' });
orbiter({ key: 'IXPE', name: 'IXPE', model: MODELS.ixpe, scale: 0.015, a: 1.135, incl: 0.05, node: 1, period: 10.5, phase: 0.5, cat: 'Spacecraft · X-ray telescope', dist: 'about 600 km above Earth',
  fact: 'Launched in 2021 with three X-ray telescopes that measure the direction light waves vibrate, revealing the shape of space around black holes and dead stars.' });
orbiter({ key: 'SPHEREx', name: 'SPHEREx', model: MODELS.spherex, scale: 0.017, a: 1.15, incl: 1.5, node: 2.6, period: 11, phase: 2.5, cat: 'Spacecraft · sky-mapping telescope', dist: 'about 650 km above Earth, over the poles',
  fact: 'Launched in 2025, it maps the entire sky in 102 colours of infrared light, looking for the ices that may carry water to new planets.' });
orbiter({ key: 'Pandora', name: 'Pandora', model: MODELS.pandora, scale: 0.014, a: 1.12, incl: 1.7, node: 0.4, period: 10.2, phase: 4.2, cat: 'Spacecraft · exoplanet satellite · launched 2026', dist: 'about 600 km above Earth',
  fact: 'A small satellite launched on 11 January 2026. It stares at stars for long stretches to study the air of the planets passing in front of them, and the stars\' own flickers.' });
orbiter({ key: 'SPARCS', name: 'SPARCS', model: () => MODELS.cubesat(1.4), scale: 0.012, a: 1.12, incl: 1.68, node: 0.5, period: 10.2, phase: 4.6, cat: 'Spacecraft · CubeSat · launched 2026', dist: 'about 600 km above Earth',
  fact: 'A CubeSat about the size of a cereal box, launched on 11 January 2026. It keeps watch on 20 small red stars to measure the ultraviolet flares that hit their planets.' });
orbiter({ key: 'CUTE', name: 'CUTE', model: () => MODELS.cubesat(1.4), scale: 0.012, a: 1.11, incl: 1.7, node: 3, period: 10, phase: 1.5, cat: 'Spacecraft · CubeSat', dist: 'about 500 km above Earth',
  fact: 'A tiny CubeSat launched in 2021 that watches hot planets lose their atmospheres, which stream away like a comet\'s tail.' });
{ // retired telescopes trailing behind Earth around the Sun
  const trail = (key, name, model, lagDeg, fact, cat, dist) => {
    const m = model(); m.scale.setScalar(0.12); scene.add(m); scaleHide.push(m);
    sim.push(dt => { earthObj.getWorldPosition(_ep); const ang = Math.atan2(-_ep.z, _ep.x) - lagDeg * Math.PI / 180, r = _ep.length(); m.position.set(Math.cos(ang) * r, 0.4, -Math.sin(ang) * r); m.rotation.y += dt * 0.05; });
    nearLabel(m, name, 2.4, key, 'craft', 40);
    bodies[key] = { obj: m, radius: 0.2, view: 1.1 }; info(key, name, cat, dist, fact);
  };
  trail('Kepler', 'Kepler', MODELS.kepler, 55, 'From 2009 to 2018 it watched over 150,000 stars and found more than 2,600 planets, the most of any mission, proving there are more planets than stars in our galaxy.',
    'Spacecraft · planet hunter · retired 2018', 'drifting around the Sun, trailing behind Earth');
  trail('Spitzer', 'Spitzer', MODELS.spitzer, 95, 'An infrared telescope (2003–2020). It was the first to see light directly from an exoplanet, made the first weather map of one, and weighed the seven TRAPPIST-1 planets.',
    'Spacecraft · infrared telescope · retired 2020', 'drifting around the Sun, trailing behind Earth');
}

// ---------- 👻 Galaxy of Horrors (from NASA's exoplanet "Galaxy of Horrors" tour) ----------
// HD 80606 b: swings from far out to scorching close on a wildly stretched orbit
star({ key: 'HD80606', name: 'HD 80606', ra: 140.656, dec: 50.604, ly: 217, bv: 0.76, R: 0.98, cat: 'Star', dist: '217 light-years', fact: 'A Sun-like star with a planet on one of the most stretched-out orbits known.' });
{ const host = bodies.HD80606.obj, piv = new THREE.Group(); piv.rotation.set(0.25, 1.1, 0); host.add(piv);
  const p = new THREE.Mesh(new THREE.SphereGeometry(0.85, 48, 24), SS.extras.litMaterial(jupTex, out => host.getWorldPosition(out))); p.material.uniforms.tint.value.set(0xff9a60); piv.add(p);
  const a = 7, e = 0.93, b = a * Math.sqrt(1 - e * e);
  const pts = []; for (let k = 0; k <= 240; k++) { const E = k / 240 * 6.2832; pts.push(V(a * (Math.cos(E) - e), 0, b * Math.sin(E))); }
  const ln = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xff9a60, transparent: true, opacity: 0.35 })); piv.add(ln);
  const glow = glowSprite(3, 'rgba(255,120,60,0.8)', 'rgba(0,0,0,0)', 0.7); p.add(glow);
  let M = 2.5; sim.push(dt => { M += Math.min(1.2, 2 * Math.PI / 111.4 * dps()) * SS.frameDt; let E = M; for (let i = 0; i < 25; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    p.position.set(a * (Math.cos(E) - e), 0, b * Math.sin(E)); const r = p.position.length(); glow.material.opacity = Math.max(0, Math.min(0.9, (1.6 - r) / 1.2)); p.rotation.y += SS.frameDt * 0.3; });
  deepLabel(p, 'HD 80606 b', 1.3, 'HD80606b', 'exo', 200);
  bodies.HD80606b = { obj: p, radius: 0.85, view: 5 };
  info('HD80606b', 'HD 80606 b', 'Exoplanet · roasted planet', '217 light-years away',
    'Its orbit is so stretched that it swoops from far out to scorching close to its star. In just hours it heats by hundreds of degrees, unleashing supersonic winds and shockwave storms.');
}
// AU Microscopii: a young, angry star inside a ghostly disk of dust
star({ key: 'AUMic', name: 'AU Microscopii', ra: 311.29, dec: -31.34, ly: 31.7, bv: 1.44, R: 0.75, cat: 'Star · young red dwarf', dist: '31.7 light-years', fact: 'Only about 22 million years old, and prone to violent flares.' });
exoPlanet({ hostKey: 'AUMic', key: 'AUMicb', name: 'AU Mic b', r: 0.45, dist: 3.2, period: 8.46, tex: paint(741, '#2a3040', '#8a96b0', 1.6, 0), tint: 0xb0c0ff,
  cat: 'Exoplanet · Neptune-sized', distStr: '31.7 light-years away', fact: 'A planet trapped inside a giant disk of dust around one of the youngest planetary systems ever seen, blasted by X-ray flares from its furious star.' });
{ const host = bodies.AUMic.obj, n = 22000, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, r = 6 + Math.pow(Math.random(), 0.7) * 22; pos.set([Math.cos(a) * r, gauss() * 0.25 * (r / 10), Math.sin(a) * r], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const disk = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xd8c8ff, size: 0.3, map: softDot, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }));
  disk.rotation.x = 0.15; host.add(disk);
  const flare = glowSprite(8, 'rgba(255,170,120,0.9)', 'rgba(0,0,0,0)', 0); host.add(flare);
  sim.push((dt, t) => { const f = Math.max(0, Math.sin(t * 0.9) - 0.85) * 6; flare.material.opacity = f; });
  bodies.AUMic.view = 34;
}
// The pulsar planets: Poltergeist, Phobetor and Draugr circle a dead star, "Lich"
{ const holder = new THREE.Group(); holder.position.copy(place(195.015, 12.683, 2300)); scene.add(holder);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 12), new THREE.MeshBasicMaterial({ color: 0xe8f0ff })); holder.add(core);
  holder.add(glowSprite(3, 'rgba(170,200,255,0.9)', 'rgba(0,0,0,0)', 0.9));
  const beams = new THREE.Group(); holder.add(beams); beams.rotation.z = 0.5;
  for (const s of [1, -1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.9, 9, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fc4ff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    c.position.y = s * 4.5; c.rotation.x = s > 0 ? Math.PI : 0; beams.add(c); }
  sim.push(dt => { beams.rotation.y += dt * 9; });
  deepLabel(holder, 'Lich (PSR B1257+12)', 1.8, 'Lich', 'star', 300);
  bodies.Lich = { obj: holder, radius: 1, view: 16, selfLit: true };
  info('Lich', 'Lich (PSR B1257+12)', 'Pulsar · dead star', 'about 2,300 light-years', 'The spinning core of an exploded star, sweeping beams of radiation around 160 times a second. Its planets were the very first ever found beyond our Solar System, in 1992.');
  const ghostTex = paint(751, '#2a2a34', '#7a7a8a', 2.2, 60);
  for (const [k, nm, r, d, per, fact] of [
    ['Draugr', 'Draugr', 0.12, 2.4, 25.3, 'One of the smallest planets known, about twice the mass of our Moon, bathed in the pulsar\'s deadly radiation.'],
    ['Poltergeist', 'Poltergeist', 0.3, 3.6, 66.5, 'A "zombie world" circling a dead star. It was among the first planets ever discovered beyond our Solar System.'],
    ['Phobetor', 'Phobetor', 0.29, 4.6, 98.2, 'Named after a Greek god of nightmares. It and its neighbours may have formed from the wreckage of the star\'s explosion.']]) {
    const piv = new THREE.Group(); piv.rotation.set(0.2, hash(d, r) * 6.28, 0); holder.add(piv);
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), SS.extras.litMaterial(ghostTex, out => holder.getWorldPosition(out))); m.material.uniforms.tint.value.set(0xa8b8ff); m.position.x = d; piv.add(m);
    const pts = Array.from({ length: 96 }, (_, i) => V(Math.cos(i / 96 * 6.283) * d, 0, Math.sin(i / 96 * 6.283) * d));
    piv.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x9fb0ff, transparent: true, opacity: 0.22 })));
    sim.push(() => { piv.rotation.y += Math.min(1.2, 2 * Math.PI / per * dps()) * SS.frameDt; });
    deepLabel(m, nm, r + 0.4, k, 'exo', 60);
    bodies[k] = { obj: m, radius: r, view: Math.max(1.4, r * 6) }; info(k, nm, 'Exoplanet · pulsar planet', 'about 2,300 light-years away', fact);
  }
}
// Kepler-70 b: a world that may have survived a trip inside its star
star({ key: 'Kepler70', name: 'Kepler-70', ra: 296.356, dec: 41.093, ly: 3850, bv: -0.3, R: 0.2, cat: 'Star · hot subdwarf', dist: 'about 3,850 light-years', fact: 'The scorching bare core of a star that swelled into a red giant and then lost its outer layers.' });
exoPlanet({ hostKey: 'Kepler70', key: 'Kepler70b', name: 'Kepler-70 b', r: 0.2, dist: 1.4, period: 0.24, labelRange: 60, tex: paint(761, '#3a0a00', '#ffb040', 1.2, 0), tint: 0xffc080,
  cat: 'Exoplanet · possible inferno world', distStr: 'about 3,850 light-years away', fact: 'Possibly the hottest planet known, around 6,800 °C. It may once have been Jupiter-sized before spending time inside its star when the star swelled up.' });
// WASP-12 b: a planet being eaten, stretched into an egg
star({ key: 'WASP12', name: 'WASP-12', ra: 97.637, dec: 29.672, ly: 1400, bv: 0.57, R: 1.6, cat: 'Star', dist: 'about 1,400 light-years', fact: 'A hot star slowly devouring its closest planet.' });
{ const p = exoPlanet({ hostKey: 'WASP12', key: 'WASP12b', name: 'WASP-12 b', r: 0.75, dist: 4.2, period: 1.09, tex: jupTex, tint: 0xff8a50,
    cat: 'Exoplanet · being eaten', distStr: 'about 1,400 light-years away', fact: 'So close to its star that gravity stretches it into an egg shape and strips its gas away. Its orbit is shrinking: in a few million years it will plunge in.' });
  p.scale.set(1.35, 1, 1);
  const stream = new THREE.Group(); p.parent.add(stream);
  for (let i = 0; i < 40; i++) { const u = i / 40; const s = puff(0xff9a60, 1.4 - u * 0.8, 0.28); s.position.set(4.2 * (1 - u) - u * 0.4, gauss() * 0.08, -Math.sin(u * 3) * 0.9 * u); stream.add(s); }
  sim.push(() => { stream.visible = p.visible; });
}
// TrES-2 b: darker than coal
star({ key: 'TrES2', name: 'TrES-2', ra: 286.808, dec: 49.317, ly: 750, bv: 0.62, R: 1.0, cat: 'Star', dist: 'about 750 light-years', fact: 'A Sun-like star with the darkest planet ever found.' });
{ const p = exoPlanet({ hostKey: 'TrES2', key: 'TrES2b', name: 'TrES-2 b', r: 0.75, dist: 3.8, period: 2.47, tex: paint(771, '#020202', '#1a0a06', 1, 0), tint: 0x302020,
    cat: 'Exoplanet · darkest planet known', distStr: 'about 750 light-years away', fact: 'The planet of eternal night: it reflects less light than coal, yet its air is as hot as lava, glowing a faint dull red.' });
  p.add(glowSprite(2.2, 'rgba(160,30,10,0.55)', 'rgba(0,0,0,0)', 0.45));
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
  { // a group of its own for the telescopes and satellites
    const og = document.createElement('optgroup'); og.label = 'Space telescopes & satellites';
    for (const [k, t] of [['Hubble', 'Hubble'], ['JWST', 'James Webb Telescope'], ['Roman', 'Roman Space Telescope (2026)'], ['TESS', 'TESS (planet hunter)'], ['Kepler', 'Kepler (retired)'], ['Spitzer', 'Spitzer (retired)'],
      ['Chandra', 'Chandra (X-rays)'], ['Fermi', 'Fermi (gamma rays)'], ['Swift', 'Swift'], ['NuSTAR', 'NuSTAR'], ['IXPE', 'IXPE'], ['SPHEREx', 'SPHEREx'], ['Pandora', 'Pandora (2026)'], ['SPARCS', 'SPARCS (2026)'], ['CUTE', 'CUTE']]) {
      const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o);
      if (['Hubble', 'JWST', 'Roman'].includes(k)) focusSel.querySelector(`optgroup[label="Spacecraft"] option[value="${k}"]`)?.remove(); }
    [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Spacecraft').after(og);
  }
  { const og = document.createElement('optgroup'); og.label = '👻 Galaxy of Horrors';
    for (const [k, t] of [['HD80606b', 'HD 80606 b (roasted planet)'], ['AUMicb', 'AU Mic b (flares of fury)'], ['Lich', 'Lich: the zombie worlds'], ['Poltergeist', 'Poltergeist'], ['Phobetor', 'Phobetor'], ['Draugr', 'Draugr'],
      ['Kepler70b', "Kepler-70 b (Kepler's inferno)"], ['WASP12b', 'WASP-12 b (being eaten)'], ['TrES2b', 'TrES-2 b (eternal darkness)'], ['HD189733b', 'HD 189733 b (rains of glass)'], ['CygX1', 'Cygnus X-1 (devoured by gravity)']]) {
      const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); }
    [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Exoplanets').after(og); }
  // keep stars in distance order
  const st = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === 'Stars (nearest first)');
  const order = ['Proxima', 'AlphaCen', 'Barnard', 'Sirius', 'Procyon', 'TauCeti', 'Altair', 'Vega', 'Fomalhaut', 'Pollux', 'Arcturus', 'Capella', 'Aldebaran', 'Regulus', 'Spica', 'Mira', 'Canopus', 'Polaris', 'Betelgeuse', 'Antares', 'Rigel', 'Deneb', 'UYScuti'];
  if (st) [...st.children].sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value)).forEach(o => st.appendChild(o));
}

SS.more = {}; SS.features = SS.features || null;
await import('./features.js' + new URL(import.meta.url).search);
