// Extras: real dates & positions, moons, comets, belts, exoplanets, eclipses, missions,
// night sky from London, true-scale mode, ambient sound and a guided tour.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const SS = window.SS;
const { scene, camera, controls, bodies, sim, addLabel, flyTo, focusSel, loadTex, rockyTex, glowSprite, ringMesh, PLANETS, sun, hash } = SS;
const { info, INFO, star, skyDir, deepLabel, softDot, gauss, bvToColor } = SS.cosmos;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const PL = Object.fromEntries(PLANETS.map(p => [p.name, p]));
const $ = id => document.getElementById(id);
// names that only appear when the camera is close, to keep wide views tidy
const nearLabels = [];
function nearLabel(obj, text, y, key, cls, range) { const l = addLabel(obj, text, y, key, cls); nearLabels.push([l, obj, range]); return l; }
function limitExisting(obj, range) { for (const c of obj.children) if (c.isCSS2DObject) nearLabels.push([c, obj, range]); }
{ const a = V(), b = V();
  sim.push(() => { const on = $('labels').checked; camera.getWorldPosition(a);
    for (const [l, o, r] of nearLabels) l.visible = on && o.getWorldPosition(b).distanceTo(a) < r; }); }

// =====================================================================
// 1. TIME: a simulated clock driving real positions
// =====================================================================
const J2000 = Date.UTC(2000, 0, 1, 12);
let simMs = Date.now();
const rateSel = $('speed'), dateIn = $('date'), clockEl = $('clock');
const dps = () => parseFloat(rateSel.value);                     // simulated days per real second
const days = () => (simMs - J2000) / 864e5;
SS.setDate = ms => { simMs = ms; };
SS.getDate = () => simMs;
const pad = n => String(n).padStart(2, '0');
function toLocalInput(ms) { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
dateIn.onchange = () => { const t = Date.parse(dateIn.value); if (!isNaN(t)) simMs = t; };
$('now').onclick = () => { simMs = Date.now(); rateSel.value = '0.0000115741'; };
let eventText = '';
let frameN = 0;
sim.unshift(() => {                                               // runs before everything else each frame
  const r = dps();
  SS.timeMult = r === 0 ? 0 : Math.min(5, Math.max(0.03, r / 3.5));
  simMs += SS.frameDt * r * 864e5;
  if (frameN++ % 6 === 0) {
    const d = new Date(simMs);
    clockEl.innerHTML = d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) +
      (eventText ? `<br><span class="ev">${eventText}</span>` : '');
    if (document.activeElement !== dateIn) dateIn.value = toLocalInput(simMs);
  }
});

// ---- Planet positions (JPL approximate Keplerian elements, J2000) ----
const EL = { // a, e, L0, L rate (deg/century), long. of perihelion, its rate
  Mercury: [0.38709927, 0.20563593, 252.25032350, 149472.67411175, 77.45779628, 0.16047689],
  Venus: [0.72333566, 0.00677672, 181.97909950, 58517.81538729, 131.60246718, 0.00268329],
  Earth: [1.00000261, 0.01671123, 100.46457166, 35999.37244981, 102.93768193, 0.32327364],
  Mars: [1.52371034, 0.09339410, -4.55343205, 19140.30268499, -23.94362959, 0.44441088],
  Jupiter: [5.20288700, 0.04838624, 34.39644051, 3034.74612775, 14.72847983, 0.21252668],
  Saturn: [9.53667594, 0.05386179, 49.95424423, 1222.49362201, 92.59887831, -0.41897216],
  Uranus: [19.18916464, 0.04725744, 313.23810451, 428.48202785, 170.95427630, 0.40805281],
  Neptune: [30.06992276, 0.00859048, -55.12002969, 218.45945325, 44.96476227, -0.32241464],
};
function solveKepler(M, e) { let E = e > 0.8 ? Math.PI : M; for (let i = 0; i < 30; i++) { const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); E -= dE; if (Math.abs(dE) < 1e-10) break; } return E; }
function planetLon(name, d) {
  const [a, e, L0, Lr, w0, wr] = EL[name]; const T = d / 36525;
  const L = L0 + Lr * T, w = w0 + wr * T;
  const M = (((L - w) % 360) + 360) % 360 * D2R;
  const E = solveKepler(M, e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  return ((nu * R2D + w) % 360 + 360) % 360;
}
// Sun & Moon as seen from Earth (degrees) — Paul Schlyter's method, accurate to a few arcminutes
const norm = x => ((x % 360) + 360) % 360;
function sunLon(d0) {
  const d = d0 + 1.5, w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = norm(356.0470 + 0.9856002585 * d) * D2R;
  const E = solveKepler(M, e), xv = Math.cos(E) - e, yv = Math.sqrt(1 - e * e) * Math.sin(E);
  return norm(Math.atan2(yv, xv) * R2D + w);
}
function moonPos(d0) {
  const d = d0 + 1.5;
  const N = norm(125.1228 - 0.0529538083 * d) * D2R, i = 5.1454 * D2R, w = norm(318.0634 + 0.1643573223 * d) * D2R, e = 0.0549;
  const Mdeg = norm(115.3654 + 13.0649929509 * d), M = Mdeg * D2R;
  const E = solveKepler(M, e), xv = Math.cos(E) - e, yv = Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv), r = Math.hypot(xv, yv);
  const xh = r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i));
  const yh = r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i));
  const zh = r * Math.sin(v + w) * Math.sin(i);
  let lon = Math.atan2(yh, xh) * R2D, lat = Math.atan2(zh, Math.hypot(xh, yh)) * R2D;
  const Ms = norm(356.0470 + 0.9856002585 * d), ws = 282.9404 + 4.70935e-5 * d;
  const Ls = Ms + ws, Lm = Mdeg + w * R2D + N * R2D, D = (Lm - Ls) * D2R, F = (Lm - N * R2D) * D2R, Mm = M, Mss = Ms * D2R;
  lon += -1.274 * Math.sin(Mm - 2 * D) + 0.658 * Math.sin(2 * D) - 0.186 * Math.sin(Mss) - 0.059 * Math.sin(2 * Mm - 2 * D) - 0.057 * Math.sin(Mm - 2 * D + Mss)
    + 0.053 * Math.sin(Mm + 2 * D) + 0.046 * Math.sin(2 * D - Mss) + 0.041 * Math.sin(Mm - Mss) - 0.035 * Math.sin(D) - 0.031 * Math.sin(Mm + Mss)
    - 0.015 * Math.sin(2 * F - 2 * D) + 0.011 * Math.sin(Mm - 4 * D);
  lat += -0.173 * Math.sin(F - 2 * D) - 0.055 * Math.sin(Mm - F - 2 * D) - 0.046 * Math.sin(Mm + F - 2 * D) + 0.033 * Math.sin(F + 2 * D) + 0.017 * Math.sin(2 * Mm + F);
  return { lam: norm(lon), bet: lat };
}
const gmst = d => ((280.46061837 + 360.98564736629 * d) % 360 + 360) % 360;
const sepDeg = (l1, b1, l2, b2) => Math.acos(Math.min(1, Math.sin(b1 * D2R) * Math.sin(b2 * D2R) + Math.cos(b1 * D2R) * Math.cos(b2 * D2R) * Math.cos((l1 - l2) * D2R))) * R2D;
SS.astro = { planetLon, sunLon, moonPos, gmst };

// Earth: correct axis direction (north pole leans toward ecliptic longitude 90°) and real spin
const earthP = PL.Earth, earthMesh = earthP.tilted.children[0], earthClouds = earthP.tilted.children[1];
earthP.tilted.rotation.set(-23.44 * D2R, 0, 0);
const moonMesh = bodies.Moon.obj, moonPivot = moonMesh.parent;
moonPivot.rotation.set(0, 0, 0);
let cloudDrift = 0;
sim.push(() => {
  const d = days();
  for (const P of PLANETS) { P.pivot.rotation.y = planetLon(P.name, d) * D2R; P.holder.rotation.y = -P.pivot.rotation.y; }   // axes stay fixed in space
  if (dps() <= 0.05) { earthMesh.rotation.y = gmst(d) * D2R; cloudDrift += SS.frameDt * 0.002; earthClouds.rotation.y = earthMesh.rotation.y + cloudDrift; }
  const m = moonPos(d);
  moonPivot.rotation.y = m.lam * D2R;
  moonMesh.position.set(3 * Math.cos(m.bet * D2R), 3 * Math.sin(m.bet * D2R), 0);
});

// =====================================================================
// 2. ECLIPSES: real Sun–Moon geometry drives shadows on Earth and the Moon
// =====================================================================
const earthU = earthMesh.material.uniforms;
const moonMat = new THREE.ShaderMaterial({
  uniforms: { map: { value: loadTex('tex/moon.jpg') }, axis: { value: V(1, 0, 0) }, mOff: { value: V(0, 0, 0) }, moonC: { value: V(0, 0, 0) }, moonR: { value: 0.27 }, on: { value: 0 } },
  vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vW;
    void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
  fragmentShader: `uniform sampler2D map; uniform vec3 axis, mOff, moonC; uniform float moonR, on; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
    void main(){
      vec3 tex=texture2D(map,vUv).rgb; float dif=max(dot(normalize(vN),normalize(-vW)),0.);
      vec3 lit=tex*(dif*1.25+0.012);
      vec3 f=vW-moonC; vec3 fp=f-axis*dot(f,axis);
      float dist=length(mOff+fp/moonR*0.26);                 // degrees from the centre of Earth's shadow
      vec3 shaded=lit*mix(0.45,1.,smoothstep(0.7,1.28,dist));
      vec3 blood=tex*vec3(0.62,0.17,0.07)*0.42*(0.6+0.4*dif);  // sunlight bent through Earth's atmosphere
      vec3 col=mix(blood,shaded,smoothstep(0.64,0.76,dist));
      gl_FragColor=vec4(mix(lit,col,on),1.);
      #include <colorspace_fragment>
    }`
});
moonMesh.material = moonMat;
{ const cm = earthClouds.material;
  for (const k of ['eclAxis', 'eclOn', 'eclUmbra', 'eclPen']) cm.uniforms[k] = earthU[k];
  cm.fragmentShader = cm.fragmentShader.replace('uniform float time;', 'uniform float time; uniform vec3 eclAxis; uniform float eclOn, eclUmbra, eclPen;')
    .replace('gl_FragColor=vec4(col,a*0.92);', 'vec3 rl=vW-eclAxis; vec3 pp=rl-L*dot(rl,L); col*=mix(1.,mix(0.03,1.,smoothstep(eclUmbra,eclPen,length(pp))),eclOn);\n        gl_FragColor=vec4(col,a*0.92);');
  cm.needsUpdate = true; }
function eclipseState(d) {
  const s = sunLon(d), m = moonPos(d);
  return { solar: sepDeg(m.lam, m.bet, s, 0), lunar: sepDeg(m.lam, m.bet, s + 180, 0), m, s };
}
const eW = V(), mW = V();
sim.push(() => {
  const st = eclipseState(days());
  PL.Earth.holder.getWorldPosition(eW); moonMesh.getWorldPosition(mW);
  const s = eW.clone().negate().normalize();                    // Earth → Sun
  const rel = mW.clone().sub(eW);
  const perp = rel.clone().sub(s.clone().multiplyScalar(rel.dot(s)));
  const u = perp.lengthSq() > 1e-8 ? perp.normalize() : V(0, 1, 0);
  // solar eclipse: Moon's shadow axis passes ~60.3·tan(α) Earth radii from Earth's centre
  const off = 60.27 * Math.tan(st.solar * D2R);
  earthU.eclOn.value = (st.solar < 1.6 && off < 1.7) ? 1 : 0;
  earthU.eclAxis.value.copy(eW).addScaledVector(u, off);
  // lunar eclipse
  moonMat.uniforms.on.value = st.lunar < 1.65 ? 1 : 0;
  moonMat.uniforms.axis.value.copy(s).negate();
  moonMat.uniforms.moonC.value.copy(mW);
  const perp2 = rel.clone().sub(s.clone().negate().multiplyScalar(rel.dot(s.clone().negate())));
  moonMat.uniforms.mOff.value.copy(perp2.lengthSq() > 1e-8 ? perp2.normalize() : V(0, 1, 0)).multiplyScalar(st.lunar);
  eventText = st.solar < 0.27 ? '☀ Total / annular solar eclipse' : st.solar < 0.55 ? '☀ Partial solar eclipse'
    : st.lunar < 0.46 ? '🌑 Total lunar eclipse: blood moon' : st.lunar < 0.97 ? '🌘 Partial lunar eclipse' : st.lunar < 1.55 ? '🌗 Penumbral lunar eclipse' : '';
});

// =====================================================================
// 3. MOONS of other planets
// =====================================================================
function litMaterial(tex, getLight) {    // simple diffuse lighting from a chosen star position
  const m = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, lightPos: { value: V(0, 0, 0) }, tint: { value: new THREE.Color(1, 1, 1) } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 lightPos; uniform vec3 tint; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){ float d=max(dot(normalize(vN),normalize(lightPos-vW)),0.); gl_FragColor=vec4(texture2D(map,vUv).rgb*tint*(d*1.3+0.02),1.);
      #include <colorspace_fragment>
      }`
  });
  if (getLight) sim.push(() => getLight(m.uniforms.lightPos.value));
  return m;
}
function addMoon({ planet, key, name, r, dist, period, incl = 0.05, tex, cat, distStr, fact, inTilted = false, spinPhase = 0 }) {
  const host = inTilted ? PL[planet].tilted : bodies[planet].obj;
  const piv = new THREE.Group(); piv.rotation.x = incl; piv.rotation.y = hash(r * 100, dist) * 6.28; host.add(piv);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
  mesh.position.x = dist; piv.add(mesh);
  const pts = Array.from({ length: 128 }, (_, i) => V(Math.cos(i / 128 * 6.283) * dist, 0, Math.sin(i / 128 * 6.283) * dist));
  const ln = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x9aa6c8, transparent: true, opacity: 0.16 }));
  piv.add(ln); SS.orbitLines.push(ln);
  sim.push(() => { const w = Math.sign(period) * Math.min(1.5, 2 * Math.PI / Math.abs(period) * dps()); piv.rotation.y += w * SS.frameDt; });
  nearLabel(mesh, name, r + 0.3, key, 'moon', 45);
  bodies[key] = { obj: mesh, radius: r };
  info(key, name, cat, distStr, fact);
  return mesh;
}
const paint = (seed, dark, light, scale, craters, fn) => rockyTex({ seed, dark, light, scale, craters, paint: fn });
const rnd = (i, s) => hash(i * 1.37 + 3, s * 2.11 + 7);
addMoon({ planet: 'Mars', key: 'Phobos', name: 'Phobos', r: 0.07, dist: 0.85, period: 0.319, tex: paint(301, '#4a3c33', '#8a7466', 2.4, 40), cat: 'Moon of Mars', distStr: 'about 6,000 km above Mars', fact: 'Mars\'s larger moon is slowly spiralling inward and will one day break apart or crash into Mars.' });
addMoon({ planet: 'Mars', key: 'Deimos', name: 'Deimos', r: 0.045, dist: 1.25, period: 1.263, tex: paint(311, '#5a4a3e', '#9a8676', 2.4, 25), cat: 'Moon of Mars', distStr: 'about 23,460 km from Mars', fact: 'A tiny moon, just 12 km across: a lumpy rock you could drive around in an afternoon.' });
addMoon({ planet: 'Jupiter', key: 'Io', name: 'Io', r: 0.26, dist: 4.6, period: 1.769, tex: paint(201, '#9a6a1a', '#f4e27c', 2.6, 0, ctx => {
  for (let i = 0; i < 60; i++) { const x = rnd(i, 1) * 512, y = 30 + rnd(i, 2) * 196, rr = 2 + rnd(i, 3) * 7;
    ctx.fillStyle = 'rgba(40,20,10,0.75)'; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(200,60,20,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, rr * 2.4, 0, 7); ctx.stroke(); } }),
  cat: 'Moon of Jupiter', distStr: 'orbits Jupiter at 422,000 km', fact: 'The most volcanic world known, with hundreds of active volcanoes.' });
addMoon({ planet: 'Jupiter', key: 'Europa', name: 'Europa', r: 0.23, dist: 5.7, period: 3.551, tex: paint(211, '#b9a68c', '#f3eee6', 1.4, 3, ctx => {
  ctx.strokeStyle = 'rgba(150,80,45,0.55)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 70; i++) { ctx.beginPath(); let x = rnd(i, 5) * 512, y = rnd(i, 6) * 256; ctx.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (rnd(i, k) - 0.5) * 90; y += (rnd(k, i) - 0.5) * 40; ctx.lineTo(x, y); } ctx.stroke(); } }),
  cat: 'Moon of Jupiter', distStr: 'orbits Jupiter at 671,000 km', fact: 'Its icy crust hides a salty ocean, one of the best places to look for life beyond Earth.' });
addMoon({ planet: 'Jupiter', key: 'Ganymede', name: 'Ganymede', r: 0.38, dist: 7.1, period: 7.155, tex: paint(221, '#5e5448', '#c8bcac', 1.8, 50), cat: 'Moon of Jupiter', distStr: 'orbits Jupiter at 1.07 million km', fact: 'The largest moon in the Solar System, bigger than the planet Mercury.' });
addMoon({ planet: 'Jupiter', key: 'Callisto', name: 'Callisto', r: 0.35, dist: 8.9, period: 16.69, tex: paint(231, '#2e2a26', '#6a6258', 2.0, 220), cat: 'Moon of Jupiter', distStr: 'orbits Jupiter at 1.88 million km', fact: 'One of the most heavily cratered surfaces known.' });
addMoon({ planet: 'Saturn', key: 'Enceladus', name: 'Enceladus', r: 0.13, dist: 6.9, period: 1.37, inTilted: true, incl: 0, tex: paint(241, '#cfd8de', '#ffffff', 1.6, 20, ctx => {
  ctx.strokeStyle = 'rgba(80,150,200,0.85)'; ctx.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(60 + i * 30, 215 + i * 4); ctx.bezierCurveTo(200, 205 + i * 5, 320, 225 + i * 3, 450, 212 + i * 4); ctx.stroke(); } }),
  cat: 'Moon of Saturn', distStr: 'orbits Saturn at 238,000 km', fact: 'Shoots jets of water ice into space from "tiger stripe" cracks near its south pole.' });
const titan = addMoon({ planet: 'Saturn', key: 'Titan', name: 'Titan', r: 0.37, dist: 9.6, period: 15.945, inTilted: true, incl: 0.006, tex: paint(251, '#b06a22', '#e9a650', 0.8, 0), cat: 'Moon of Saturn', distStr: 'orbits Saturn at 1.22 million km', fact: 'The only moon with a thick atmosphere, and it has lakes and seas of liquid methane.' });
titan.add(glowSprite(1.25, 'rgba(255,170,80,0.5)', 'rgba(0,0,0,0)', 0.6));
addMoon({ planet: 'Uranus', key: 'Miranda', name: 'Miranda', r: 0.08, dist: 2.1, period: 1.413, inTilted: true, tex: paint(261, '#6d6a66', '#c9c5be', 3, 30), cat: 'Moon of Uranus', distStr: 'orbits Uranus at 130,000 km', fact: 'Has cliffs about 20 km high, among the tallest known in the Solar System.' });
addMoon({ planet: 'Uranus', key: 'Titania', name: 'Titania', r: 0.15, dist: 2.8, period: 8.706, inTilted: true, tex: paint(271, '#6f6862', '#bdb3aa', 2, 60), cat: 'Moon of Uranus', distStr: 'orbits Uranus at 436,000 km', fact: 'Uranus\'s largest moon, covered in canyons.' });
addMoon({ planet: 'Neptune', key: 'Triton', name: 'Triton', r: 0.21, dist: 3.3, period: -5.877, incl: 0.4, tex: paint(281, '#a8857a', '#f0e0d8', 1.8, 10), cat: 'Moon of Neptune', distStr: 'orbits Neptune at 355,000 km', fact: 'Orbits Neptune backwards and has nitrogen geysers. Probably a captured Kuiper Belt object.' });

// =====================================================================
// 4. COMETS, ASTEROIDS, KUIPER BELT, OORT CLOUD
// =====================================================================
// AU → our compressed scene distance (matches the planets' display orbits)
const AUMAP = [[0, 0], [0.39, 10], [0.72, 14], [1, 19], [1.52, 25], [2.77, 31.5], [5.2, 38], [9.54, 52], [19.2, 66], [30.1, 78], [39.5, 88], [50, 102], [68, 125], [100, 150]];
function auToScene(r) { for (let i = 1; i < AUMAP.length; i++) if (r <= AUMAP[i][0]) { const [a0, s0] = AUMAP[i - 1], [a1, s1] = AUMAP[i]; return s0 + (s1 - s0) * (r - a0) / (a1 - a0); } return 150 + (r - 100) * 0.8; }
const eclToScene = (x, y, z) => V(x, z, -y);
function orbitXYZ({ a, e, i, node, peri }, E) {
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const O = node * D2R, w = peri * D2R, I = i * D2R;
  const x = (Math.cos(O) * Math.cos(w) - Math.sin(O) * Math.sin(w) * Math.cos(I)) * xp + (-Math.cos(O) * Math.sin(w) - Math.sin(O) * Math.cos(w) * Math.cos(I)) * yp;
  const y = (Math.sin(O) * Math.cos(w) + Math.cos(O) * Math.sin(w) * Math.cos(I)) * xp + (-Math.sin(O) * Math.sin(w) + Math.cos(O) * Math.cos(w) * Math.cos(I)) * yp;
  const z = (Math.sin(w) * Math.sin(I)) * xp + (Math.cos(w) * Math.sin(I)) * yp;
  const r = Math.hypot(x, y, z);
  return { v: eclToScene(x, y, z).normalize().multiplyScalar(auToScene(r)), r };
}
const scaleHide = [];          // things hidden in true-scale mode
function smallBody({ key, name, el, mesh, color, cat, distStr, fact, perihelionMs = null, M0 = 0 }) {
  const P = Math.pow(el.a, 1.5) * 365.25;   // days
  const pts = []; for (let k = 0; k <= 480; k++) pts.push(orbitXYZ(el, k / 480 * 6.2832).v);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 }));
  scene.add(line); SS.orbitLines.push(line); scaleHide.push(line);
  const holder = new THREE.Group(); scene.add(holder); holder.add(mesh); scaleHide.push(holder);
  const state = { r: el.a };
  sim.push(() => {
    const d = days();
    const M = perihelionMs != null ? 2 * Math.PI * ((simMs - perihelionMs) / 864e5) / P : M0 + 2 * Math.PI * d / P;
    const E = solveKepler(((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), el.e);
    const o = orbitXYZ(el, E); holder.position.copy(o.v); state.r = o.r;
    mesh.rotation.y += SS.frameDt * 0.5;
  });
  nearLabel(holder, name, 0.6, key, 'small', 90);
  bodies[key] = { obj: holder, radius: 0.3, view: 3, dir: t => { const toSun = t.clone().negate().normalize(); return V(0, 1, 0).cross(toSun).normalize().add(V(0, 0.35, 0)).add(toSun.multiplyScalar(-0.35)).normalize(); } };
  info(key, name, cat, distStr, fact);
  return { holder, state };
}
function lumpy(r, k, seed, stretch = [1, 1, 1], top = false) {
  const g = new THREE.SphereGeometry(r, 48, 32), p = g.attributes.position, v = V();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let f = 1 + k * (hash(Math.floor(v.x * 6 + seed), Math.floor(v.y * 6 + v.z * 3)) - 0.5);
    if (top) f *= 1 + 0.32 * (1 - Math.abs(v.y)) - 0.18 * Math.abs(v.y);   // spinning-top ridge
    p.setXYZ(i, v.x * r * f * stretch[0], v.y * r * f * stretch[1], v.z * r * f * stretch[2]);
  }
  g.computeVertexNormals(); return g;
}
// Halley's Comet (real orbit: perihelion 9 Feb 1986, next mid-2061)
const halleyMesh = new THREE.Mesh(lumpy(0.16, 0.35, 5, [1.6, 0.9, 0.9]), new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 1 }));
const halley = smallBody({ key: 'Halley', name: "Halley's Comet", el: { a: 17.83, e: 0.967, i: 162.26, node: 58.42, peri: 111.33 }, mesh: halleyMesh, color: 0x8fd8ff, perihelionMs: Date.UTC(1986, 1, 9),
  cat: 'Comet', distStr: 'returns every ~76 years', fact: 'Seen from Earth every 75–79 years. Last visit 1986; it returns in 2061. Its tail always points away from the Sun.' });
{ // tails: a narrow blue ion tail and a wider, curving yellowish dust tail, always pointing away from the Sun
  const tailMat = (col, strength) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { c: { value: new THREE.Color(col) }, k: { value: strength } },
    vertexShader: `varying float vT; varying vec3 vN; varying vec3 vW; void main(){ vT=uv.y; vN=normalize(mat3(modelMatrix)*normal); vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform vec3 c; uniform float k; varying float vT; varying vec3 vN; varying vec3 vW;
      void main(){ float edge=pow(abs(dot(normalize(vN),normalize(cameraPosition-vW))),1.2); float a=pow(vT,1.6)*edge*k; gl_FragColor=vec4(c*a,a); }`
  });
  const cone = (r, mat, bend) => { const g = new THREE.ConeGeometry(r, 1, 48, 24, true); g.translate(0, -0.5, 0); g.rotateX(-Math.PI / 2);
    if (bend) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setX(i, p.getX(i) + bend * z * z); } }
    return new THREE.Mesh(g, mat); };
  const tails = new THREE.Group(); halley.holder.add(tails);
  tails.add(cone(0.05, tailMat(0x8fd0ff, 0.9), 0)); tails.add(cone(0.13, tailMat(0xffe6b8, 0.55), 0.18));
  const dust = new THREE.Points((() => { const n = 3000, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const t = Math.pow(Math.random(), 1.4); pos.set([gauss() * 0.02 * (1 + t * 3) + 0.18 * t * t, gauss() * 0.02 * (1 + t * 3), t], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g; })(),
    new THREE.PointsMaterial({ color: 0xfff0d0, size: 0.25, map: softDot, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  tails.add(dust);
  const coma = glowSprite(1, 'rgba(200,235,255,0.9)', 'rgba(0,0,0,0)', 0.75); halley.holder.add(coma);
  const w = V();
  sim.push(() => {
    const r = halley.state.r, len = Math.min(30, 7 / (r * r));
    tails.visible = len > 0.4; coma.scale.setScalar(Math.min(2.4, 1.1 / r));
    halley.holder.getWorldPosition(w); tails.lookAt(w.clone().multiplyScalar(2));      // point away from the Sun
    tails.scale.set(len * 0.5, len * 0.5, len);
    bodies.Halley.view = Math.max(3, len * 1.15);
  });
}
smallBody({ key: 'Vesta', name: 'Vesta', el: { a: 2.362, e: 0.089, i: 7.14, node: 103.8, peri: 151.2 }, M0: 2.0, color: 0xb0a090,
  mesh: new THREE.Mesh(lumpy(0.2, 0.25, 9, [1.05, 0.9, 1]), new THREE.MeshStandardMaterial({ map: paint(321, '#6a645c', '#c2b8aa', 2.4, 60), roughness: 1 })),
  cat: 'Asteroid', distStr: 'about 353 million km from the Sun', fact: 'The second-largest object in the asteroid belt, with a huge crater at its south pole. NASA\'s Dawn orbited it in 2011–2012.' });
smallBody({ key: 'Bennu', name: 'Bennu', el: { a: 1.126, e: 0.204, i: 6.03, node: 2.06, peri: 66.2 }, M0: 4.0, color: 0xc0a080,
  mesh: new THREE.Mesh(lumpy(0.09, 0.2, 13, [1, 1, 1], true), new THREE.MeshStandardMaterial({ map: paint(331, '#2a2826', '#6a645e', 4, 30), roughness: 1 })),
  cat: 'Near-Earth asteroid', distStr: 'orbits close to Earth\'s path', fact: 'A rubble-pile shaped like a spinning top. NASA\'s OSIRIS-REx brought a sample of it back to Earth in 2023.' });

// Kuiper Belt and Oort Cloud
function cloudPoints(n, fn, color, size, op) {
  const pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) pos.set(fn(i), i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size, map: softDot, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
}
const kuiper = cloudPoints(9000, () => { const a = Math.random() * 6.283, r = auToScene(30 + Math.pow(Math.random(), 0.8) * 20 + (Math.random() < 0.15 ? Math.random() * 15 : 0)), y = gauss() * r * 0.06;
  return [Math.cos(a) * r, y, Math.sin(a) * r]; }, 0x9fb0d0, 0.32, 0.55);
scene.add(kuiper); scaleHide.push(kuiper); sim.push(dt => kuiper.rotation.y += dt * 0.002);
const oort = cloudPoints(9000, () => { const r = 290 + Math.random() * 120, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
  return [r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)]; }, 0x8094c0, 1.1, 0.35);
scene.add(oort); scaleHide.push(oort);
{ const k = new THREE.Object3D(); k.position.set(0, 14, -95); scene.add(k); nearLabel(k, 'Kuiper Belt', 0, 'Kuiper', 'small', 400); scaleHide.push(k);
  bodies.Kuiper = { obj: new THREE.Object3D(), radius: 50, view: 230, dir: () => V(0.25, 0.85, 0.45).normalize() };
  info('Kuiper', 'Kuiper Belt', 'Region of the Solar System', '30–50 times Earth\'s distance from the Sun',
    'A wide ring of icy bodies beyond Neptune: home of Pluto, Haumea, Makemake and countless comets.');
  const o = new THREE.Object3D(); o.position.set(0, 380, 0); scene.add(o); nearLabel(o, 'Oort Cloud', 0, 'Oort', 'small', 2000); scaleHide.push(o);
  bodies.Oort = { obj: new THREE.Object3D(), radius: 400, view: 1150, dir: () => V(0.4, 0.45, 0.8).normalize() };
  info('Oort Cloud', 'Oort Cloud', 'Region of the Solar System (predicted)', 'roughly 2,000 to 100,000 times Earth\'s distance from the Sun',
    'A vast shell of icy comet nuclei thought to surround the Solar System. Too faint to see directly; shown here hugely compressed.');
  INFO.Oort = INFO['Oort Cloud']; }

// =====================================================================
// 5. EXOPLANETS
// =====================================================================
function exoPlanet({ hostKey, key, name, r, dist, period, tex, cat, distStr, fact, labelRange = 150, tint }) {
  const host = bodies[hostKey].obj;
  const piv = new THREE.Group(); piv.rotation.set(0.15, hash(dist, r) * 6.28, 0); host.add(piv);
  const mat = litMaterial(tex, out => host.getWorldPosition(out)); if (tint) mat.uniforms.tint.value.set(tint);
  const p = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), mat); p.position.x = dist; piv.add(p);
  const pts = Array.from({ length: 128 }, (_, i) => V(Math.cos(i / 128 * 6.283) * dist, 0, Math.sin(i / 128 * 6.283) * dist));
  const ln = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x9fd0a0, transparent: true, opacity: 0.25 })); piv.add(ln);
  sim.push(() => { piv.rotation.y += Math.min(1.2, 2 * Math.PI / period * dps()) * SS.frameDt; p.rotation.y += SS.frameDt * 0.2; });
  deepLabel(p, name, r + 0.45, key, 'exo', labelRange);
  const hp = V();
  bodies[key] = { obj: p, radius: r, view: Math.max(r * 5, 1.6), dir: t => { host.getWorldPosition(hp); const toStar = hp.sub(t).normalize(); return toStar.multiplyScalar(0.75).add(V(0, 0.45, 0)).add(V(0, 1, 0).cross(toStar).multiplyScalar(0.5)).normalize(); } };
  info(key, name, cat, distStr, fact);
  return p;
}
exoPlanet({ hostKey: 'Proxima', key: 'ProximaB', name: 'Proxima b', r: 0.33, dist: 3.3, period: 11.2, tex: paint(401, '#5a3020', '#b07850', 1.8, 20),
  cat: 'Exoplanet', distStr: '4.24 light-years away', fact: 'The closest known exoplanet: a rocky world a little heavier than Earth, in its star\'s habitable zone. Whether it can hold an atmosphere is unknown.' });
star({ key: 'TRAPPIST1', name: 'TRAPPIST-1', ra: 346.622, dec: -5.041, ly: 40.7, bv: 1.95, R: 0.12, cat: 'Star · ultra-cool red dwarf', dist: '40.7 light-years',
  fact: 'A small, cool star with seven Earth-sized rocky planets, the most found around a single star like this. Three are in its habitable zone.' });
bodies.TRAPPIST1.view = 22;
{ const T = bodies.TRAPPIST1.obj;
  const hz = new THREE.Mesh(new THREE.RingGeometry(4.3, 7.5, 96), new THREE.MeshBasicMaterial({ color: 0x40d070, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }));
  hz.rotation.x = -Math.PI / 2 + 0.15; T.add(hz);
  const P7 = [['b', 1.12, 2.2, 1.51, '#7a3a22', '#d08a5a'], ['c', 1.10, 2.9, 2.42, '#6a4030', '#c09070'], ['d', 0.79, 3.8, 4.05, '#5a5048', '#b0a090'],
    ['e', 0.92, 4.8, 6.10, '#2a4a6a', '#9ab8c8'], ['f', 1.05, 6.0, 9.21, '#3a4a5a', '#c8d8e0'], ['g', 1.13, 7.0, 12.35, '#40505a', '#d8e4ea'], ['h', 0.76, 8.6, 18.77, '#6a7078', '#e8eef2']];
  const facts = { e: 'Rocky, Earth-sized and in the habitable zone: one of the best candidates for liquid water outside our Solar System.', f: 'In the habitable zone, but may be cold and icy.', g: 'The largest TRAPPIST-1 planet, on the cold outer edge of the habitable zone.' };
  P7.forEach(([l, rr, dd, per, dark, light], i) => exoPlanet({ hostKey: 'TRAPPIST1', key: 'T1' + l, name: 'TRAPPIST-1' + l, r: 0.22 * rr, dist: dd, period: per, labelRange: 60,
    tex: paint(500 + i, dark, light, 1.8, 15), cat: 'Exoplanet', distStr: '40.7 light-years away', fact: facts[l] || 'One of seven rocky planets packed closer to their star than Mercury is to the Sun.' }));
}
star({ key: 'Peg51', name: '51 Pegasi', ra: 344.367, dec: 20.769, ly: 50.6, bv: 0.67, R: 1.27, cat: 'Star', dist: '50.6 light-years', fact: 'A Sun-like star, famous for its "hot Jupiter" planet.' });
exoPlanet({ hostKey: 'Peg51', key: 'Peg51b', name: '51 Pegasi b', r: 0.95, dist: 4.4, period: 4.23, tex: loadTex('tex/jupiter.jpg'), tint: 0xffb080,
  cat: 'Exoplanet · hot Jupiter', distStr: '50.6 light-years away', fact: 'The first planet found around a Sun-like star (1995, Nobel Prize 2019). A gas giant that circles its star every 4.2 days.' });

// =====================================================================
// 6. MISSIONS: Apollo 11, and the real routes of Voyager & New Horizons
// =====================================================================
{
  const g = new THREE.Group(); moonPivot.add(g); SS.apolloGroup = g;
  const curve = new THREE.CatmullRomCurve3([V(1.15, 0, 0.05), V(1.5, 0, 0.55), V(2.2, 0, 0.75), V(2.85, 0, 0.5), V(3.25, 0, 0.32), V(3.48, 0, 0), V(3.25, 0, -0.32),
    V(2.85, 0, -0.5), V(2.2, 0, -0.75), V(1.5, 0, -0.55), V(1.15, 0, -0.05)], true, 'catmullrom', 0.5);
  const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(300)), new THREE.LineDashedMaterial({ color: 0xffd27a, dashSize: 0.05, gapSize: 0.04, transparent: true, opacity: 0.7 }));
  path.computeLineDistances(); g.add(path); SS.orbitLines.push(path);
  const craft = new THREE.Group();
  const cm = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 24), new THREE.MeshStandardMaterial({ color: 0xd8dce4, metalness: 0.85, roughness: 0.25 })); cm.rotation.z = -Math.PI / 2; cm.position.x = 1.3; craft.add(cm);
  const sm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.0, 24), new THREE.MeshStandardMaterial({ color: 0xe8e8ea, metalness: 0.6, roughness: 0.35 })); sm.rotation.z = Math.PI / 2; sm.position.x = 0.55; craft.add(sm);
  const lm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.6), new THREE.MeshStandardMaterial({ color: 0xc8a040, metalness: 0.8, roughness: 0.35 })); lm.position.x = -0.25; craft.add(lm);
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0x999999 })); leg.position.set(-0.25 + x * 0.3, -0.35, z * 0.3); leg.rotation.set(z * 0.5, 0, -x * 0.5); craft.add(leg); }
  craft.scale.setScalar(0.035); g.add(craft);
  sim.push((dt, t) => { const u = (t % 30) / 30; craft.position.copy(curve.getPointAt(u)); craft.lookAt(g.localToWorld(curve.getPointAt((u + 0.003) % 1))); craft.rotateY(-Math.PI / 2); });
  nearLabel(craft, 'Apollo 11', 4, 'Apollo11', 'craft', 12);
  bodies.Apollo11 = { obj: craft, radius: 0.05, view: 0.6, dir: () => V(0.3, 0.8, 0.5).normalize() };
  info('Apollo11', 'Apollo 11', 'Mission · July 1969', 'Earth to the Moon: about 384,000 km',
    'Neil Armstrong and Buzz Aldrin became the first people to walk on the Moon on 20 July 1969, while Michael Collins orbited above. The dashed line shows the "free-return" figure-of-eight route.');
  scaleHide.push(g);
}
{ // real flight paths through the planets at their actual flyby dates
  for (const c of [...scene.children]) if (c.isLine && c.material?.isLineDashedMaterial && c.material.color.getHex() === 0x7fe0b0) { scene.remove(c); SS.orbitLines.splice(SS.orbitLines.indexOf(c), 1); }
  const at = (planet, y, m, d) => { const dd = (Date.UTC(y, m - 1, d) - J2000) / 864e5, lam = planetLon(planet, dd) * D2R, R = PL[planet].d; return V(Math.cos(lam) * R, 0, -Math.sin(lam) * R); };
  const route = (pts, key) => {
    const end = bodies[key].obj.position.clone();
    const curve = new THREE.CatmullRomCurve3([...pts, pts[pts.length - 1].clone().lerp(end, 0.35).setY(end.y * 0.2), end], false, 'centripetal');
    const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(500)), new THREE.LineBasicMaterial({ color: 0x7fe0b0, transparent: true, opacity: 0.45 }));
    scene.add(ln); SS.orbitLines.push(ln); scaleHide.push(ln);
  };
  route([at('Earth', 1977, 9, 5), at('Jupiter', 1979, 3, 5), at('Saturn', 1980, 11, 12)], 'Voyager1');
  route([at('Earth', 1977, 8, 20), at('Jupiter', 1979, 7, 9), at('Saturn', 1981, 8, 25), at('Uranus', 1986, 1, 24), at('Neptune', 1989, 8, 25)], 'Voyager2');
  route([at('Earth', 2006, 1, 19), at('Jupiter', 2007, 2, 28)], 'NewHorizons');
  for (const k of ['Voyager1', 'Voyager2', 'NewHorizons']) scaleHide.push(bodies[k].obj);
}

for (const k of ['ISS', 'Hubble', 'Satellite', 'JWST']) limitExisting(bodies[k].obj, 14);

// =====================================================================
// 7. EVENTS (jump to a date)
// =====================================================================
function refineEclipse(ms, kind) { // search ±1 day for the moment of best alignment
  let best = ms, bv = 1e9;
  for (let k = -144; k <= 144; k++) { const t = ms + k * 600000, st = eclipseState((t - J2000) / 864e5), v = kind === 'solar' ? st.solar : st.lunar; if (v < bv) { bv = v; best = t; } }
  return best;
}
const sideDir = (from, to, side = 0.55, up = 0.25) => { const f = to.clone().sub(from).normalize(); return f.clone().multiplyScalar(0.8).add(V(0, 1, 0).cross(f).normalize().multiplyScalar(side)).add(V(0, up, 0)).normalize(); };
const EVENTS = {
  EV_solar: { label: 'Total solar eclipse · 2 Aug 2027', ms: Date.UTC(2027, 7, 2, 10, 7), kind: 'solar',
    view: { obj: () => PL.Earth.holder, dist: 3.6, dir: () => { PL.Earth.holder.getWorldPosition(eW); return sideDir(eW, V(0, 0, 0), 0.42, 0.12); } },
    info: ['Total solar eclipse', 'Event · 2 August 2027', 'Visible from Spain, North Africa and the Middle East', 'The Moon passes exactly between the Sun and Earth. The dark spot on Earth is the Moon\'s shadow: inside it, day turns to night for a few minutes.'] },
  EV_lunar: { label: 'Total lunar eclipse · 3 Mar 2026', ms: Date.UTC(2026, 2, 3, 11, 33), kind: 'lunar',
    view: { obj: () => moonMesh, dist: 1.4, dir: () => { moonMesh.getWorldPosition(mW); PL.Earth.holder.getWorldPosition(eW); return sideDir(mW, eW, 0.35, 0.1); } },
    info: ['Total lunar eclipse', 'Event · 3 March 2026', 'Visible from East Asia, Australia, the Pacific and the Americas', 'Earth passes between the Sun and the Moon. The only sunlight reaching the Moon is bent through Earth\'s atmosphere, turning it red: a "blood moon".'] },
  EV_apollo: { label: 'Apollo 11 · July 1969', ms: Date.UTC(1969, 6, 20, 20, 17), focus: 'Apollo11' },
  EV_halley86: { label: "Halley's Comet · Feb 1986", ms: Date.UTC(1986, 1, 9), focus: 'Halley' },
  EV_halley61: { label: "Halley's Comet returns · Jul 2061", ms: Date.UTC(2061, 6, 28), focus: 'Halley' },
};
for (const [k, ev] of Object.entries(EVENTS)) if (ev.view) {
  bodies[k] = { obj: new THREE.Object3D(), radius: 1, view: ev.view.dist, dir: ev.view.dir };
  sim.push(() => ev.view.obj().getWorldPosition(bodies[k].obj.position));
  info(k, ...[ev.info[0], ev.info[1], ev.info[2], ev.info[3]]);
}
for (const [k, ev] of Object.entries(EVENTS)) if (ev.view) scene.add(bodies[k].obj);
function runEvent(k) {
  const ev = EVENTS[k];
  simMs = ev.kind ? refineEclipse(ev.ms, ev.kind) : ev.ms;
  rateSel.value = ev.kind ? '0.000694' : '0';
  pendingFly = ev.focus || k;          // fly next frame, after everything has moved to the new date
}
let pendingFly = null;

// =====================================================================
// 8. NIGHT SKY FROM LONDON
// =====================================================================
const LONDON = { lat: 51.5074, lon: -0.1278 };
let nightOn = false, az = 180, alt = 22, fovNight = 60; const nightHidden = [];
const ground = new THREE.Group(); ground.visible = false; scene.add(ground);
const GR = 0.0058;
{
  const dome = new THREE.Mesh(new THREE.SphereGeometry(GR, 48, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x030504, side: THREE.DoubleSide }));
  ground.add(dome);
  // generic city skyline silhouette with a few lit windows
  const cv = document.createElement('canvas'); cv.width = 4096; cv.height = 128; const c = cv.getContext('2d');
  let x = 0, i = 0;
  while (x < 4096) {
    const w = 18 + hash(i, 1) * 60, h = 10 + Math.pow(hash(i, 2), 2.2) * 95;
    c.fillStyle = '#05070a'; c.fillRect(x, 128 - h, w, h);
    if (hash(i, 3) > 0.85) { c.beginPath(); c.moveTo(x + w / 2 - 4, 128 - h); c.lineTo(x + w / 2, 128 - h - 22); c.lineTo(x + w / 2 + 4, 128 - h); c.fill(); }
    for (let k = 0; k < h * w / 120; k++) if (hash(i * 31 + k, 4) > 0.82) { c.fillStyle = 'rgba(255,205,120,0.85)'; c.fillRect(x + 3 + hash(k, i) * (w - 6), 128 - h + 4 + hash(i, k) * (h - 8), 2, 2); }
    x += w + (hash(i, 5) > 0.7 ? hash(i, 6) * 40 : 0); i++;
  }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const H = GR * Math.tan(5 * D2R);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(GR * 0.99, GR * 0.99, H, 256, 1, true), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  ring.position.y = H / 2; ground.add(ring);
}
const skyMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.BackSide,
  uniforms: { sunAlt: { value: -30 }, sunDir: { value: V(1, 0, 0) }, zen: { value: V(0, 1, 0) } },
  vertexShader: `varying vec3 vD; void main(){ vD=normalize((modelMatrix*vec4(position,1.)).xyz-cameraPosition); gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform float sunAlt; uniform vec3 sunDir, zen; varying vec3 vD;
    void main(){ float h=max(dot(vD,zen),0.); float day=smoothstep(-12.,4.,sunAlt);
      vec3 zc=mix(vec3(0.02,0.04,0.12),vec3(0.18,0.38,0.85),smoothstep(-4.,10.,sunAlt));
      vec3 hc=mix(vec3(0.9,0.45,0.2),vec3(0.65,0.8,1.),smoothstep(0.,15.,sunAlt));
      vec3 col=mix(hc,zc,pow(h,0.45)); float glow=pow(max(dot(vD,sunDir),0.),8.)*0.6;
      float a=day*(0.55+0.4*smoothstep(-2.,8.,sunAlt))+glow*day;
      gl_FragColor=vec4(col+glow,clamp(a,0.,0.96)); }`
});
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(GR * 0.95, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), skyMat); ground.add(skyDome);
const cardinals = ['N', 'E', 'S', 'W'].map(t => { const el = document.createElement('div'); el.className = 'cardinal'; el.textContent = t; const o = new CSS2DObject(el); scene.add(o); o.visible = false; return o; });
const cpos = V(), zen = V(), north = V(), east = V(), look = V();
function nightCam() {
  const d = days();
  PL.Earth.holder.getWorldPosition(eW);
  const lst = gmst(d) + LONDON.lon;
  zen.copy(skyDir(lst, LONDON.lat));
  const ncp = skyDir(0, 90);
  north.copy(ncp).sub(zen.clone().multiplyScalar(ncp.dot(zen))).normalize();
  east.crossVectors(north, zen).normalize();
  cpos.copy(eW).addScaledVector(zen, 1.012);
  const ca = Math.cos(alt * D2R);
  look.copy(north).multiplyScalar(ca * Math.cos(az * D2R)).addScaledVector(east, ca * Math.sin(az * D2R)).addScaledVector(zen, Math.sin(alt * D2R));
  camera.position.copy(cpos); camera.up.copy(zen); camera.lookAt(cpos.clone().add(look));
  if (camera.fov !== fovNight) { camera.fov = fovNight; camera.updateProjectionMatrix(); }
  ground.position.copy(cpos); ground.quaternion.setFromUnitVectors(V(0, 1, 0), zen);
  const sd = eW.clone().negate().normalize();
  skyMat.uniforms.sunAlt.value = Math.asin(sd.dot(zen)) * R2D; skyMat.uniforms.sunDir.value.copy(sd); skyMat.uniforms.zen.value.copy(zen);
  [north, east, north.clone().negate(), east.clone().negate()].forEach((v, i) => cardinals[i].position.copy(cpos).addScaledVector(v, GR * 0.9).addScaledVector(zen, GR * 0.03));
}
function enterNight() {
  if (nightOn) return; nightOn = true;
  const london = new Date(simMs).toLocaleString('en-GB', { timeZone: 'Europe/London', hour: 'numeric', hour12: false });
  const hr = parseInt(london, 10);
  if (hr >= 7 && hr < 17) { const dd = new Date(simMs); simMs = Date.UTC(dd.getUTCFullYear(), dd.getUTCMonth(), dd.getUTCDate(), 21, 30); }
  rateSel.value = '0.000694';
  for (const a of PL.Earth.holder.children) if (a.userData?.isAtmo) a.visible = false;
  earthClouds.visible = false;
  ground.visible = true; cardinals.forEach(c => c.visible = true);
  nightHidden.length = 0;
  const hideN = o => { if (o && o.visible) { o.visible = false; nightHidden.push(o); } };
  SS.orbitLines.forEach(hideN); hideN(window.__belt); hideN(kuiper); hideN(oort); hideN(bodies.JWST.obj); hideN(SS.apolloGroup);
  for (const ch of PL.Earth.holder.children) if (ch.type === 'Group' && ch !== PL.Earth.tilted && ch !== moonPivot) hideN(ch);
  controls.enabled = false; camera.near = 0.0004; camera.updateProjectionMatrix();
  SS.cancelTween(); SS.cameraOverride = nightCam;
  showInfo('Night sky from London', 'View from the ground', 'Drag to look around · scroll to zoom',
    'The real sky over London for the date and time shown at the top: stars, planets and the Moon in their true places. Turn on Constellations or Zodiac to trace the patterns.');
}
function exitNight() {
  if (!nightOn) return; nightOn = false;
  for (const a of PL.Earth.holder.children) if (a.userData?.isAtmo) a.visible = true;
  earthClouds.visible = true; ground.visible = false; cardinals.forEach(c => c.visible = false);
  nightHidden.forEach(o => o.visible = true); nightHidden.length = 0;
  controls.enabled = true; camera.near = 0.02; camera.fov = 45; camera.updateProjectionMatrix(); camera.up.set(0, 1, 0);
  SS.cameraOverride = null; controls.target.copy(eW);
}
{ let drag = null; const el = SS.renderer.domElement;
  el.addEventListener('pointerdown', e => { if (nightOn) drag = [e.clientX, e.clientY]; });
  addEventListener('pointerup', () => drag = null);
  addEventListener('pointermove', e => { if (!nightOn || !drag) return; const k = fovNight / innerHeight;
    az = (az - (e.clientX - drag[0]) * k + 360) % 360; alt = Math.max(-5, Math.min(89, alt + (e.clientY - drag[1]) * k)); drag = [e.clientX, e.clientY]; });
  el.addEventListener('wheel', e => { if (nightOn) { fovNight = Math.max(12, Math.min(90, fovNight * (e.deltaY > 0 ? 1.08 : 0.93))); e.preventDefault(); } }, { passive: false });
}
const infoEl = $('info');
function showInfo(name, cat, dist, fact) { infoEl.innerHTML = `<div class="cat">${cat}</div><b>${name}</b><div class="dist">${dist}</div>${fact}`; infoEl.style.display = 'block'; }

// =====================================================================
// 9. TRUE SCALE MODE
// =====================================================================
const TRUE = { Mercury: [0.387, 2440], Venus: [0.723, 6052], Earth: [1, 6371], Mars: [1.524, 3390], Jupiter: [5.203, 69911], Saturn: [9.537, 58232], Uranus: [19.19, 25362], Neptune: [30.07, 24622] };
const U = 19, KM_AU = 1.496e8;
let scaleOn = false; const saved = [];
bodies.scaleView = { obj: new THREE.Object3D(), radius: 1, view: 1000, dir: () => V(0.12, 0.55, 0.83).normalize() };
info('scaleView', 'True scale', 'Sizes and distances to scale', 'If the Sun were a grapefruit, Earth would be a grain of sand 15 m away',
  '…and Neptune would be 450 m away. The nearest star, Proxima Centauri, would be about 4,000 km away. Space is mostly empty: zoom in on a name to find each tiny planet.');
function enterScale() {
  if (scaleOn) return; scaleOn = true;
  const hide = o => { saved.push([o, o.visible]); o.visible = false; };
  for (const P of PLANETS) {
    const [au, km] = TRUE[P.name], f = (km / KM_AU * U) / P.r;
    saved.push([P.holder, 'x', P.holder.position.x]); P.holder.position.x = au * U;
    P.tilted.scale.setScalar(f);
    for (const ch of P.holder.children) { if (ch === P.tilted || ch.isCSS2DObject) continue; if (ch.userData?.isAtmo) ch.scale.setScalar(f); else hide(ch); }
    for (const ch of P.tilted.children) if (ch.type === 'Group') hide(ch);
    P.line.scale.setScalar(au * U / P.d);
  }
  sun.scale.setScalar((696340 / KM_AU * U) / 5);
  for (const n of ['Ceres', 'Pluto', 'Haumea', 'Makemake', 'Eris']) hide(bodies[n].obj.parent.parent);
  hide(window.__belt); hide(bodies.JWST.obj); scaleHide.forEach(hide);
  flyTo('scaleView');
}
function exitScale() {
  if (!scaleOn) return; scaleOn = false;
  for (const P of PLANETS) { P.tilted.scale.setScalar(1); P.line.scale.setScalar(1); for (const ch of P.holder.children) if (ch.userData?.isAtmo) ch.scale.setScalar(1); }
  sun.scale.setScalar(1);
  while (saved.length) { const s = saved.pop(); if (s[1] === 'x') s[0].position.x = s[2]; else s[0].visible = s[1]; }
}

// =====================================================================
// 10. AMBIENT SOUND (generated live, no audio files)
// =====================================================================
let actx = null;
function startSound() {
  if (actx) { actx.resume(); return; }
  actx = new (window.AudioContext || window.webkitAudioContext)();
  const master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
  master.gain.linearRampToValueAtTime(0.5, actx.currentTime + 4);
  const verb = actx.createConvolver(); { const len = actx.sampleRate * 5, b = actx.createBuffer(2, len, actx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5); } verb.buffer = b; }
  const wet = actx.createGain(); wet.gain.value = 0.6; verb.connect(wet); wet.connect(master);
  const pad = (f, g, det) => { const o = actx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = det;
    const gn = actx.createGain(); gn.gain.value = g; const lfo = actx.createOscillator(); lfo.frequency.value = 0.03 + Math.random() * 0.05;
    const lg = actx.createGain(); lg.gain.value = g * 0.6; lfo.connect(lg); lg.connect(gn.gain); o.connect(gn); gn.connect(master); gn.connect(verb); o.start(); lfo.start(); };
  [[55, 0.16, 0], [55, 0.12, 7], [82.41, 0.1, -5], [110, 0.05, 3], [164.8, 0.025, 0]].forEach(a => pad(...a));
  // soft filtered noise "solar wind"
  const nb = actx.createBuffer(1, actx.sampleRate * 4, actx.sampleRate), nd = nb.getChannelData(0); let last = 0;
  for (let i = 0; i < nd.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; nd[i] = last * 3; }
  const ns = actx.createBufferSource(); ns.buffer = nb; ns.loop = true; const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
  const nl = actx.createOscillator(); nl.frequency.value = 0.02; const nlg = actx.createGain(); nlg.gain.value = 250; nl.connect(nlg); nlg.connect(lp.frequency);
  const ng = actx.createGain(); ng.gain.value = 0.1; ns.connect(lp); lp.connect(ng); ng.connect(master); ns.start(); nl.start();
  // occasional distant chimes
  const notes = [440, 523.25, 587.33, 659.25, 783.99, 880];
  const chime = () => { if (!actx || actx.state !== 'running') return setTimeout(chime, 4000);
    const o = actx.createOscillator(); o.type = 'sine'; o.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    const g = actx.createGain(); g.gain.setValueAtTime(0, actx.currentTime); g.gain.linearRampToValueAtTime(0.05, actx.currentTime + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 6);
    o.connect(g); g.connect(verb); g.connect(master); o.start(); o.stop(actx.currentTime + 6.2); setTimeout(chime, 5000 + Math.random() * 9000); };
  setTimeout(chime, 3000);
}

// =====================================================================
// 11. GUIDED TOUR
// =====================================================================
const TOUR = [
  ['overview', 'Our Solar System', 'Eight planets, five dwarf planets, and countless smaller worlds', 9],
  ['Earth', 'Earth', 'Our home, seen in real sunlight for today\'s date', 8],
  ['ISS', 'International Space Station', 'People have lived aboard continuously since 2000', 7],
  ['Moon', 'The Moon', 'About 384,000 km from Earth', 7],
  ['Mars', 'Mars', 'The red planet, with its two tiny moons', 7],
  ['Jupiter', 'Jupiter', 'The largest planet, and its four great moons', 8],
  ['Saturn', 'Saturn', 'Rings of ice, and Titan with its methane seas', 8],
  ['Neptune', 'Neptune', 'The windiest world, 4.5 billion km from the Sun', 7],
  ['Pluto', 'Pluto', 'A dwarf planet with a heart of frozen nitrogen', 7],
  ['Voyager1', 'Voyager 1', 'Launched in 1977, now in interstellar space', 7],
  ['Proxima', 'Proxima Centauri', 'The nearest star, 4.24 light-years away, and its planet', 8],
  ['TRAPPIST1', 'TRAPPIST-1', 'Seven Earth-sized worlds around one small red star', 8],
  ['Orion', 'The Orion Nebula', 'A nursery where new stars are being born', 8],
  ['Betelgeuse', 'Betelgeuse', 'A red supergiant that will one day explode', 7],
  ['Crab', 'The Crab Nebula', 'What remains of a star that exploded in 1054', 7],
  ['SgrA', 'Sagittarius A*', 'The black hole at the heart of our galaxy', 9],
  ['Andromeda', 'The Andromeda Galaxy', 'Our nearest big neighbour, 2.5 million light-years away', 9],
  ['M87BH', 'M87*', 'The first black hole ever photographed', 8],
  ['deep', 'The universe', 'Everything here sits in its true direction in the sky', 10],
];
const VIDEO_TOUR = [
  ['overview', 'Our Solar System', 'Real planet positions for today', 7],
  ['Earth', 'Earth', 'Our home, in real sunlight', 6],
  ['Saturn', 'Saturn', 'Rings of ice, and Titan with its methane seas', 6],
  ['TRAPPIST1', 'TRAPPIST-1', 'Seven Earth-sized worlds, 40 light-years away', 6],
  ['Orion', 'The Orion Nebula', 'A nursery where new stars are born', 6],
  ['SgrA', 'Sagittarius A*', 'The black hole at the heart of our galaxy', 7],
  ['Andromeda', 'The Andromeda Galaxy', '2.5 million light-years away', 7],
  ['M87BH', 'M87*', 'The first black hole ever photographed', 6],
  ['deep', 'The universe', 'Everything in its true direction in the sky', 7],
];
SS.VIDEO_TOUR = VIDEO_TOUR;
const capEl = $('caption'), capT = capEl.querySelector('.t'), capS = capEl.querySelector('.s');
let tour = null;
function startTour(list = TOUR) {
  exitNight(); exitScale();
  tour = { i: -1, t: 0, prevAuto: controls.autoRotate, list };
  rateSel.value = '0.0416667';          // 1 hour per second: Earth turns gently, planets hold still
  controls.autoRotate = true; controls.autoRotateSpeed = 0.6;
  infoEl.style.display = 'none'; nextStop();
}
function nextStop() {
  tour.i++; tour.t = 0;
  if (tour.i >= tour.list.length) return stopTour();
  const [k] = tour.list[tour.i]; focusSel.value = k; flyTo(k); infoEl.style.display = 'none';
  capEl.style.opacity = 0;
}
function stopTour() {
  if (!tour) return; controls.autoRotate = tour.prevAuto; controls.autoRotateSpeed = 0.25; tour = null; capEl.style.opacity = 0; $('tourBtn').textContent = '▶ Guided tour';
}
sim.push(() => {
  if (!tour) return;
  tour.t += SS.frameDt;
  const [, title, sub, dwell] = tour.list[tour.i];
  if (tour.t > 1.6 && capEl.style.opacity !== '1' && tour.t < dwell - 1.2) { capT.textContent = title; capS.textContent = sub; capEl.style.opacity = 1; infoEl.style.display = 'none'; }
  if (tour.t > dwell - 1.2 && capEl.style.opacity !== '0') capEl.style.opacity = 0;
  if (tour.t > dwell) nextStop();
});
SS.startTour = startTour;

// =====================================================================
// UI: menu groups, buttons, hooks
// =====================================================================
function addGroup(label, items, afterLabel) {
  const og = document.createElement('optgroup'); og.label = label;
  for (const [k, t] of items) { const o = document.createElement('option'); o.value = k; o.textContent = t; og.appendChild(o); }
  const after = [...focusSel.querySelectorAll('optgroup')].find(g => g.label === afterLabel);
  if (after) after.after(og); else focusSel.appendChild(og);
}
{ const views = focusSel.querySelector('optgroup');
  for (const [k, t] of [['night', 'Night sky from London'], ['scale', 'True scale (sizes & distances)']]) { const o = document.createElement('option'); o.value = k; o.textContent = t; views.appendChild(o); } }
addGroup('Events', [['EV_solar', EVENTS.EV_solar.label], ['EV_lunar', EVENTS.EV_lunar.label], ['EV_apollo', EVENTS.EV_apollo.label], ['EV_halley86', EVENTS.EV_halley86.label], ['EV_halley61', EVENTS.EV_halley61.label]], 'Views');
addGroup('Moons', [['Moon', 'The Moon'], ['Phobos', 'Phobos (Mars)'], ['Deimos', 'Deimos (Mars)'], ['Io', 'Io (Jupiter)'], ['Europa', 'Europa (Jupiter)'], ['Ganymede', 'Ganymede (Jupiter)'], ['Callisto', 'Callisto (Jupiter)'],
  ['Enceladus', 'Enceladus (Saturn)'], ['Titan', 'Titan (Saturn)'], ['Miranda', 'Miranda (Uranus)'], ['Titania', 'Titania (Uranus)'], ['Triton', 'Triton (Neptune)']], 'The Sun & planets');
addGroup('Comets, asteroids & belts', [['Halley', "Halley's Comet"], ['Vesta', 'Vesta'], ['Bennu', 'Bennu'], ['Kuiper', 'Kuiper Belt'], ['Oort', 'Oort Cloud']], 'Dwarf planets');
addGroup('Exoplanets', [['ProximaB', 'Proxima b'], ['TRAPPIST1', 'TRAPPIST-1 system'], ['T1e', 'TRAPPIST-1e'], ['Peg51b', '51 Pegasi b']], 'Stars (nearest first)');
{ const sp = focusSel.querySelector('optgroup[label="Spacecraft"]'); const o = document.createElement('option'); o.value = 'Apollo11'; o.textContent = 'Apollo 11 (1969)'; sp.insertBefore(o, sp.firstChild); }
// the Moon was in "The Sun & planets"; keep it only under Moons
{ const sp = focusSel.querySelector('optgroup[label="The Sun & planets"] option[value="Moon"]'); if (sp) sp.remove(); }

function go(v) {
  if (tour && !tour.self) stopTour();
  if (v === 'night') { exitScale(); enterNight(); return; }
  exitNight();
  if (v === 'scale') { enterScale(); return; }
  exitScale();
  if (EVENTS[v]) { runEvent(v); return; }
  flyTo(v);
}
focusSel.onchange = e => go(e.target.value);
const prevOnFocus = SS.onFocus;
SS.onFocus = key => { if (key !== 'scaleView') exitScale(); exitNight(); prevOnFocus(key); };

// panel controls
{
  const ui = $('ui');
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:2px';
  row.innerHTML = '<button id="tourBtn" type="button">▶ Guided tour</button><button id="cleanBtn" type="button">Hide interface (H)</button>';
  ui.insertBefore(row, ui.children[1]);
  $('tourBtn').onclick = () => { if (tour) stopTour(); else { startTour(); $('tourBtn').textContent = '■ Stop tour'; } };
  const toggleClean = () => document.body.classList.toggle('clean');
  $('cleanBtn').onclick = toggleClean;
  addEventListener('keydown', e => { if (e.key === 'h' || e.key === 'H') { if (document.activeElement?.tagName !== 'INPUT') toggleClean(); } if (e.key === 'Escape') { document.body.classList.remove('clean'); stopTour(); } });
  const snd = document.createElement('label'); snd.innerHTML = 'Ambient sound <input id="sound" type="checkbox">'; ui.appendChild(snd);
  $('sound').onchange = e => { if (e.target.checked) startSound(); else actx?.suspend(); };
}

sim.push(() => { if (pendingFly) { const k = pendingFly; pendingFly = null; flyTo(k); } });

sim.push(() => {
  const on = $('labels').checked;
  for (const l of SS.labels) {
    let p = l.parent, ok = true; while (p) { if (!p.visible) { ok = false; break; } p = p.parent; }
    if (!ok) { if (l.visible) { l.visible = false; l.userData.ah = true; } }
    else if (l.userData.ah) { l.userData.ah = false; l.visible = on; }
  }
});

{ const layer = [...document.body.children].find(el => el.querySelector && el.querySelector('.lbl')); if (layer) layer.id = 'labelLayer'; }

SS.go = go; SS.stopTour = stopTour;
await import('./documentary.js');
