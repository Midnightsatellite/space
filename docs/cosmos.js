// Deep space: real star catalogue sky, Milky Way, named stars, nebulae, black holes,
// galaxies and spacecraft. Real sky directions (RA/Dec), log-compressed distances.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const SS = window.SS;
const { scene, camera, bodies, sim, addLabel, loadTex, buildSatellite, glowSprite, hash } = SS;

// ---------- Coordinates ----------
const EPS = THREE.MathUtils.degToRad(23.44);           // tilt of Earth's axis vs. the ecliptic (our scene's flat plane)
function skyDir(raDeg, decDeg) {
  const ra = THREE.MathUtils.degToRad(raDeg), de = THREE.MathUtils.degToRad(decDeg);
  const x = Math.cos(de) * Math.cos(ra), y = Math.cos(de) * Math.sin(ra), z = Math.sin(de);
  const ye = y * Math.cos(EPS) + z * Math.sin(EPS), ze = -y * Math.sin(EPS) + z * Math.cos(EPS);
  return new THREE.Vector3(x, ze, -ye);
}
const sceneDist = ly => 350 + 260 * Math.log10(1 + ly);   // compressed: 4 ly → ~540, 2.5 million ly → ~2010
const place = (ra, dec, ly) => skyDir(ra, dec).multiplyScalar(sceneDist(ly));

// ---------- Info card ----------
const INFO = {};
const infoEl = document.getElementById('info');
SS.onFocus = key => {
  const i = INFO[key];
  if (!i) { infoEl.style.display = 'none'; return; }
  infoEl.innerHTML = `<div class="cat">${i.cat}</div><b>${i.name}</b><div class="dist">${i.dist}</div>${i.fact}`;
  infoEl.style.display = 'block';
};
function info(key, name, cat, dist, fact) { INFO[key] = { name, cat, dist, fact }; }

// Labels for far objects only show when the camera is reasonably close, to keep the sky readable
const deepLabels = [];
function deepLabel(obj, text, y, key, cls, range) { const l = addLabel(obj, text, y, key, cls); deepLabels.push({ l, obj, range }); return l; }

// ---------- Star colour from B–V index ----------
function bvToColor(bv) {
  bv = Math.max(-0.4, Math.min(2.0, bv));
  const T = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
  const t = T / 100; let r, g, b;
  if (t <= 66) { r = 255; g = 99.47 * Math.log(t) - 161.12; b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04; }
  else { r = 329.7 * Math.pow(t - 60, -0.1332); g = 288.12 * Math.pow(t - 60, -0.0755); b = 255; }
  const c = v => Math.max(0, Math.min(255, v)) / 255;
  const col = new THREE.Color(c(r), c(g), c(b)); const hsl = {}; col.getHSL(hsl);
  return col.setHSL(hsl.h, Math.min(1, hsl.s * 1.9), Math.min(hsl.l, 0.62));
}

// ---------- Sky: real stars (Hipparcos, mag ≤ 8) + Milky Way, always infinitely far away ----------
const sky = new THREE.Group(); scene.add(sky);
const SKY_R = 15000;
sim.push(() => sky.position.copy(camera.position));

{ // Milky Way band
  const tex = new THREE.TextureLoader().load('data/milkyway.jpg'); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending,
    uniforms: { map: { value: tex }, eps: { value: EPS } },
    vertexShader: `varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D map; uniform float eps; varying vec3 vD;
      void main(){ vec3 d=normalize(vD);
        float xe=d.x, ze=d.y, ye=-d.z;
        float x=xe, y=ye*cos(eps)-ze*sin(eps), z=ye*sin(eps)+ze*cos(eps);
        float ra=atan(y,x), de=asin(clamp(z,-1.,1.));
        vec2 uv=vec2((ra+3.14159265)/6.2831853, (de+1.5707963)/3.14159265);
        vec3 c=texture2D(map,uv).rgb*0.55;
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(SKY_R * 1.02, 64, 32), mat);
  m.renderOrder = -10; sky.add(m);
}

fetch('data/stars.json').then(r => r.json()).then(a => {
  const n = a.length / 4;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = skyDir(a[i * 4], a[i * 4 + 1]).multiplyScalar(SKY_R);
    pos.set([v.x, v.y, v.z], i * 3);
    const mag = a[i * 4 + 2], c = bvToColor(a[i * 4 + 3]);
    const bright = Math.pow(10, -0.4 * (mag - 6.5));        // relative flux
    const k = Math.min(1.6, 0.25 + Math.sqrt(bright) * 0.45);
    col.set([c.r * k, c.g * k, c.b * k], i * 3);
    size[i] = Math.max(1.2, 3.6 - mag * 0.42) * Math.min(devicePixelRatio, 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    vertexShader: `attribute float size; varying vec3 vC; void main(){ vC=color; gl_PointSize=size; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vC; void main(){ vec2 p=gl_PointCoord-.5; float d=length(p); float a=smoothstep(.5,0.,d); a*=a; gl_FragColor=vec4(vC*a,a); }`
  });
  const pts = new THREE.Points(g, mat); pts.renderOrder = -9; sky.add(pts);
});

// ---------- Constellations & the zodiac ----------
const ZODIAC = [
  // id, name, symbol, star-sign dates (astrology), when the Sun is really in front of it, ecliptic longitude where the Sun enters it
  ['Ari', 'Aries', '♈', 'Mar 21 – Apr 19', 'Apr 18 – May 13', 28.6, 'The Ram.'],
  ['Tau', 'Taurus', '♉', 'Apr 20 – May 20', 'May 13 – Jun 21', 53.5, 'The Bull, with red Aldebaran as its eye and the Pleiades on its shoulder.'],
  ['Gem', 'Gemini', '♊', 'May 21 – Jun 20', 'Jun 21 – Jul 20', 90.4, 'The Twins, marked by the bright stars Castor and Pollux.'],
  ['Cnc', 'Cancer', '♋', 'Jun 21 – Jul 22', 'Jul 20 – Aug 10', 118.2, 'The Crab: faint, but home to the Beehive star cluster.'],
  ['Leo', 'Leo', '♌', 'Jul 23 – Aug 22', 'Aug 10 – Sep 16', 138.2, 'The Lion, with bright Regulus at its heart.'],
  ['Vir', 'Virgo', '♍', 'Aug 23 – Sep 22', 'Sep 16 – Oct 30', 174.0, 'The Maiden, the largest zodiac constellation. Its brightest star is Spica.'],
  ['Lib', 'Libra', '♎', 'Sep 23 – Oct 22', 'Oct 30 – Nov 23', 217.8, 'The Scales, the only zodiac sign that is an object rather than a creature.'],
  ['Sco', 'Scorpio', '♏', 'Oct 23 – Nov 21', 'Nov 23 – Nov 29', 241.1, 'The Scorpion, with the red supergiant Antares as its heart.'],
  ['Oph', 'Ophiuchus', '⛎', 'not one of the 12 signs', 'Nov 29 – Dec 17', 247.7, 'The Serpent Bearer. The Sun passes through it every year, but astrology\'s 12 signs leave it out.'],
  ['Sgr', 'Sagittarius', '♐', 'Nov 22 – Dec 21', 'Dec 17 – Jan 20', 266.3, 'The Archer. It points toward the centre of our galaxy and Sagittarius A*.'],
  ['Cap', 'Capricorn', '♑', 'Dec 22 – Jan 19', 'Jan 20 – Feb 16', 299.7, 'The Sea-Goat, half goat and half fish.'],
  ['Aqr', 'Aquarius', '♒', 'Jan 20 – Feb 18', 'Feb 16 – Mar 11', 327.9, 'The Water-Bearer, pouring water from a jar.'],
  ['Psc', 'Pisces', '♓', 'Feb 19 – Mar 20', 'Mar 11 – Apr 18', 351.6, 'The Fishes, two fish tied together by a cord.'],
];
const zodiacIds = new Set(ZODIAC.map(z => z[0]));
const zodMarkers = {};
const conGrp = new THREE.Group(); conGrp.visible = false; sky.add(conGrp);
const zodGrp = new THREE.Group(); zodGrp.visible = false; sky.add(zodGrp);
const conLabels = [], zodLabels = [];
function skyLabel(grp, list, text, ra, dec, cls) {
  const el = document.createElement('div'); el.className = cls; el.textContent = text;
  const o = new CSS2DObject(el); o.position.copy(skyDir(ra, dec).multiplyScalar(SKY_R * 0.97)); o.visible = false;
  grp.add(o); list.push(o); return o;
}
fetch('data/constellations.json').then(r => r.json()).then(data => {
  const all = [], zod = [];
  for (const [id, segs] of Object.entries(data.lines)) {
    const out = zodiacIds.has(id) ? zod : all;
    for (let i = 0; i < segs.length; i += 4) {
      const a = skyDir(segs[i], segs[i + 1]).multiplyScalar(SKY_R * 0.98), b = skyDir(segs[i + 2], segs[i + 3]).multiplyScalar(SKY_R * 0.98);
      out.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const lines = (p, color, op) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false })); };
  conGrp.add(lines(all, 0x5f7fd0, 0.4));
  conGrp.add(lines(zod, 0x5f7fd0, 0.4));
  zodGrp.add(lines(zod, 0xffc861, 0.85));
  for (const [id, name, ra, dec] of data.names) {
    if (!zodiacIds.has(id)) skyLabel(conGrp, conLabels, name, ra, dec, 'con');
  }
  for (const z of ZODIAC) {
    const n = data.names.find(d => d[0] === z[0]);
    skyLabel(zodGrp, zodLabels, z[2] + '\uFE0E ' + z[1], n[2], n[3], 'zod');
    skyLabel(conGrp, conLabels, z[1], n[2], n[3], 'con');
    zodMarkers[z[0]].position.copy(skyDir(n[2], n[3]).multiplyScalar(400));
  }
  syncSky();
});
{ // the ecliptic: the Sun's yearly path across the sky, which the zodiac sits along
  const pts = Array.from({ length: 361 }, (_, i) => { const a = i / 360 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * SKY_R * 0.975, 0, Math.sin(a) * SKY_R * 0.975); });
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xffc861, dashSize: 120, gapSize: 120, transparent: true, opacity: 0.45, depthWrite: false }));
  l.computeLineDistances(); zodGrp.add(l);
}
const conBox = document.getElementById('const'), zodBox = document.getElementById('zodiac'), sunIn = document.getElementById('sunin');
function syncSky() {
  conGrp.visible = conBox.checked; zodGrp.visible = zodBox.checked;
  conLabels.forEach(l => l.visible = conBox.checked && !zodBox.checked);
  zodLabels.forEach(l => l.visible = zodBox.checked);
  sunIn.style.display = zodBox.checked ? 'block' : 'none';
}
conBox.onchange = syncSky; zodBox.onchange = syncSky;

// Start Earth at today's real place in its orbit, so "the Sun is in…" matches the real sky right now
{
  const now = new Date(), eq = new Date(Date.UTC(now.getUTCFullYear(), 2, 20, 12));
  const lamSun = ((now - eq) / 864e5 / 365.25 * 360 % 360 + 360) % 360;
  bodies.Earth.obj.parent.rotation.y = THREE.MathUtils.degToRad(lamSun + 180);
}
// Which zodiac constellation the Sun sits in front of, seen from Earth
{
  const e = new THREE.Vector3(); let acc = 0;
  sim.push((dt, t) => {
    if (!zodBox.checked || (acc++ % 10)) return;
    bodies.Earth.obj.getWorldPosition(e);
    const lam = (THREE.MathUtils.radToDeg(Math.atan2(e.z, -e.x)) + 360) % 360;   // direction Earth → Sun
    let cur = ZODIAC[ZODIAC.length - 1];
    for (const z of ZODIAC) if (lam >= z[5]) cur = z;
    if (lam < ZODIAC[0][5]) cur = ZODIAC[ZODIAC.length - 1];
    sunIn.innerHTML = `From Earth, the Sun is in front of <b>${cur[2]}\uFE0E ${cur[1]}</b>`;
  });
}
// Fly-to for each sign: look from behind Earth's side of the Sun toward the constellation
for (const z of ZODIAC) {
  const key = 'Z_' + z[0];
  const marker = new THREE.Object3D(); scene.add(marker); zodMarkers[z[0]] = marker;
  bodies[key] = { obj: marker, radius: 1, view: 470, dir: t => t.clone().normalize().negate().add(new THREE.Vector3(0, 0.004, 0)).normalize() };
  info(key, `${z[2]}\uFE0E ${z[1]}`, z[0] === 'Oph' ? 'Constellation on the zodiac' : 'Zodiac constellation · star sign',
    z[0] === 'Oph' ? `Sun in front of it: ${z[4]}` : `Star-sign dates: ${z[3]}`,
    z[6] + (z[0] === 'Oph' ? '' : ` The Sun is really in front of it from ${z[4]}. The dates have drifted over about 2,000 years because Earth's axis slowly wobbles.`));
}
const prevFocus = SS.onFocus;
SS.onFocus = key => { if (key.startsWith('Z_') && !zodBox.checked) { zodBox.checked = true; syncSky(); } prevFocus(key); };

// ---------- Shared textures ----------
function radialTex(stops, size = 256) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const c = cv.getContext('2d'), g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  c.fillStyle = g; c.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}
const softDot = radialTex([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,255,255,0.8)'], [0.5, 'rgba(255,255,255,0.18)'], [1, 'rgba(255,255,255,0)']]);

// Cloudy puff textures for nebulae (a few noisy variants)
function noise2(x, y) { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); }
function vn(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = noise2(xi, yi), b = noise2(xi + 1, yi), c = noise2(xi, yi + 1), d = noise2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function puffTex(seed) {
  const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x / S - 0.5, dy = y / S - 0.5, r = Math.sqrt(dx * dx + dy * dy) * 2;
    let n = 0, a = 0.5, f = 4; for (let o = 0; o < 5; o++) { n += a * vn(x / S * f + seed * 7.1, y / S * f + seed * 3.3); f *= 2; a *= 0.5; }
    const fall = Math.max(0, 1 - r); const v = Math.max(0, fall * fall * (n * 1.6 - 0.25));
    const i = (y * S + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.min(255, v * 255);
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(cv);
}
const PUFFS = [0, 1, 2, 3, 4, 5].map(puffTex);
function puff(color, size, opacity = 0.5, rot = Math.random() * 6.28) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: PUFFS[Math.floor(Math.random() * PUFFS.length)], color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, rotation: rot }));
  s.scale.setScalar(size); return s;
}
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// ---------- Named stars ----------
const grayTex = loadTex('tex/star-gray.jpg'); grayTex.colorSpace = THREE.NoColorSpace;
function starMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: grayTex }, c: { value: color.clone() } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 c; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){ float g=texture2D(map,vUv).r; float mu=max(dot(normalize(vN),normalize(cameraPosition-vW)),0.);
        float limb=0.45+0.55*pow(mu,0.6);
        vec3 col=c*(0.8+0.35*g)*limb + vec3(0.12)*pow(mu,3.)*g;
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`
  });
}
function star({ key, name, ra, dec, ly, bv, R, cat = 'Star', dist, fact, companion = null }) {
  const holder = new THREE.Group(); holder.position.copy(place(ra, dec, ly)); scene.add(holder);
  const col = bvToColor(bv);
  const r = 2.2 * Math.pow(R, 0.33);
  const body = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), starMaterial(col));
  holder.add(body);
  const hex = '#' + col.getHexString();
  holder.add(glowSprite(r * 4, hex, 'rgba(0,0,0,0)', 0.6));
  const halo2 = glowSprite(r * 10, 'rgba(255,255,255,0.12)', 'rgba(0,0,0,0)', 0.3); halo2.material.color = col; holder.add(halo2);
  sim.push(dt => body.rotation.y += dt * 0.05);
  if (companion) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(companion.r, 32, 16), starMaterial(bvToColor(companion.bv)));
    const piv = new THREE.Group(); holder.add(piv); c.position.x = companion.d; piv.add(c);
    c.add(glowSprite(companion.r * 5, '#' + bvToColor(companion.bv).getHexString(), 'rgba(0,0,0,0)', 0.7));
    piv.rotation.x = 0.4; sim.push(dt => piv.rotation.y += dt * companion.speed);
    if (companion.name) deepLabel(c, companion.name, companion.r + 1.2, key, 'star', 300);
  }
  deepLabel(holder, name, r + 2.5, key, 'star', 420);
  bodies[key] = { obj: holder, radius: r, view: Math.max(r * 5, 10), selfLit: true };
  info(key, name, cat, dist, fact);
  return holder;
}
const P = await fetch('data/positions.json').then(r => r.json());
const S = (n) => ({ ra: P[n][0], dec: P[n][1], bv: P[n][2] });

star({ key: 'Proxima', name: 'Proxima Centauri', ra: 217.429, dec: -62.680, ly: 4.24, bv: 1.82, R: 0.15, cat: 'Star · red dwarf', dist: '4.24 light-years', fact: 'The closest star to the Sun. It has at least one roughly Earth-sized planet in its habitable zone.' });
star({ key: 'AlphaCen', name: 'Alpha Centauri A & B', ...S('Rigil Kentaurus'), ly: 4.37, R: 1.22, cat: 'Star system', dist: '4.37 light-years', fact: 'A Sun-like star with an orange partner. Together with Proxima, it is our nearest star system.', companion: { name: 'Alpha Centauri B', r: 2.0, bv: 0.9, d: 9, speed: 0.08 } });
star({ key: 'Barnard', name: "Barnard's Star", ra: 269.452, dec: 4.693, ly: 5.96, bv: 1.73, R: 0.19, cat: 'Star · red dwarf', dist: '5.96 light-years', fact: 'The fastest-moving star across our sky, drifting about a Moon-width every 180 years.' });
star({ key: 'Sirius', name: 'Sirius', ...S('Sirius'), ly: 8.6, R: 1.71, cat: 'Star', dist: '8.6 light-years', fact: 'The brightest star in the night sky. It has a tiny white dwarf companion, Sirius B.', companion: { name: 'Sirius B (white dwarf)', r: 0.5, bv: -0.1, d: 7, speed: 0.1 } });
star({ key: 'Procyon', name: 'Procyon', ...S('Procyon'), ly: 11.5, R: 2.05, dist: '11.5 light-years', cat: 'Star', fact: 'The "Little Dog Star", one of the brightest in winter skies.' });
star({ key: 'Altair', name: 'Altair', ...S('Altair'), ly: 16.7, R: 1.8, dist: '16.7 light-years', cat: 'Star', fact: 'Spins so fast (once every ~9 hours) that it bulges at its equator.' });
star({ key: 'Vega', name: 'Vega', ...S('Vega'), ly: 25, R: 2.4, dist: '25 light-years', cat: 'Star', fact: 'Was the North Star about 12,000 years ago, and will be again.' });
star({ key: 'Fomalhaut', name: 'Fomalhaut', ...S('Fomalhaut'), ly: 25, R: 1.84, dist: '25 light-years', cat: 'Star', fact: 'Surrounded by a wide ring of dust and debris.' });
star({ key: 'Pollux', name: 'Pollux', ...S('Pollux'), ly: 34, R: 9, dist: '34 light-years', cat: 'Star · orange giant', fact: 'The closest giant star to the Sun.' });
star({ key: 'Arcturus', name: 'Arcturus', ...S('Arcturus'), ly: 36.7, R: 25, dist: '36.7 light-years', cat: 'Star · orange giant', fact: 'The brightest star in the northern half of the sky.' });
star({ key: 'Capella', name: 'Capella', ...S('Capella'), ly: 42.9, R: 12, dist: '42.9 light-years', cat: 'Star system', fact: 'Looks like one star, but is really two pairs of stars.' });
star({ key: 'Aldebaran', name: 'Aldebaran', ...S('Aldebaran'), ly: 65, R: 44, dist: '65 light-years', cat: 'Star · red giant', fact: 'The orange "eye" of Taurus the Bull.' });
star({ key: 'Regulus', name: 'Regulus', ...S('Regulus'), ly: 79, R: 3.1, dist: '79 light-years', cat: 'Star', fact: 'Spins so quickly it is close to flying apart.' });
star({ key: 'Spica', name: 'Spica', ...S('Spica'), ly: 250, R: 7.5, dist: '250 light-years', cat: 'Star · blue giant', fact: 'Actually two hot blue stars orbiting each other every four days.' });
star({ key: 'Canopus', name: 'Canopus', ...S('Canopus'), ly: 310, R: 71, dist: '310 light-years', cat: 'Star · giant', fact: 'The second-brightest star in the night sky, used by spacecraft to navigate.' });
star({ key: 'Polaris', name: 'Polaris', ...S('Polaris'), ly: 433, R: 46, dist: '433 light-years', cat: 'Star · supergiant', fact: 'The North Star: it sits almost exactly above Earth\'s north pole.' });
star({ key: 'Betelgeuse', name: 'Betelgeuse', ...S('Betelgeuse'), ly: 550, R: 760, dist: 'about 550 light-years', cat: 'Star · red supergiant', fact: 'Orion\'s shoulder. If placed where the Sun is, it would reach past Mars. It will one day explode as a supernova.' });
star({ key: 'Antares', name: 'Antares', ...S('Antares'), ly: 550, R: 680, dist: 'about 550 light-years', cat: 'Star · red supergiant', fact: 'The red "heart" of Scorpius; its name means "rival of Mars".' });
star({ key: 'Rigel', name: 'Rigel', ...S('Rigel'), ly: 860, R: 79, dist: 'about 860 light-years', cat: 'Star · blue supergiant', fact: 'Orion\'s brightest star, tens of thousands of times more luminous than the Sun.' });
star({ key: 'Deneb', name: 'Deneb', ...S('Deneb'), ly: 2600, R: 200, dist: 'about 2,600 light-years', cat: 'Star · white supergiant', fact: 'One of the most luminous stars you can see with the naked eye.' });

// ---------- Star cluster & nebulae ----------
function cloudObject({ key, name, ra, dec, ly, size, cat, dist, fact, build }) {
  const holder = new THREE.Group(); holder.position.copy(place(ra, dec, ly)); scene.add(holder);
  // face the cloud toward the Sun so it looks like the Earth view
  holder.lookAt(0, 0, 0);
  build(holder, size);
  deepLabel(holder, name, size * 0.7, key, 'neb', 600);
  bodies[key] = { obj: holder, radius: size, view: size * 2.6, selfLit: true };
  info(key, name, cat, dist, fact);
}
function scatter(holder, n, size, colors, spread = [1, 0.7, 0.5], op = [0.25, 0.55], sz = [0.25, 0.7]) {
  for (let i = 0; i < n; i++) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    const p = puff(c, size * (sz[0] + Math.random() * (sz[1] - sz[0])), op[0] + Math.random() * (op[1] - op[0]));
    p.position.set(gauss() * size * 0.3 * spread[0], gauss() * size * 0.3 * spread[1], gauss() * size * 0.3 * spread[2]);
    holder.add(p);
  }
}
function pointStar(holder, pos, color, s) { const g = glowSprite(s, color, 'rgba(0,0,0,0)', 1); g.position.copy(pos); holder.add(g); return g; }

cloudObject({ key: 'Pleiades', name: 'Pleiades (Seven Sisters)', ra: P.M45[0], dec: P.M45[1], ly: 444, size: 30, cat: 'Star cluster', dist: '444 light-years',
  fact: 'A young cluster of hot blue stars wrapped in dust that reflects their light.',
  build: (h, s) => {
    scatter(h, 40, s, [0x5f86ff, 0x7aa0ff, 0x4a6ad8], [1, 0.8, 0.5], [0.12, 0.3]);
    for (let i = 0; i < 14; i++) pointStar(h, new THREE.Vector3(gauss() * s * 0.25, gauss() * s * 0.2, gauss() * s * 0.15), '#cfe0ff', 3 + Math.random() * 6);
  } });
cloudObject({ key: 'Helix', name: 'Helix Nebula', ra: 337.411, dec: -20.837, ly: 650, size: 32, cat: 'Planetary nebula', dist: 'about 650 light-years',
  fact: 'Gas puffed off by a dying Sun-like star. Nicknamed the "Eye of God".',
  build: (h, s) => {
    for (let i = 0; i < 120; i++) { const a = Math.random() * 6.28, r = s * (0.32 + Math.random() * 0.1) + gauss() * 1.2;
      const p = puff(i % 3 ? 0xff5a3a : 0xffa060, s * 0.35, 0.35); p.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.85, gauss() * 1.5); h.add(p); }
    scatter(h, 40, s * 0.55, [0x3fc8d8, 0x6ad8ff, 0x2a90c0], [1, 0.9, 0.3], [0.2, 0.4]);
    pointStar(h, new THREE.Vector3(), '#e8f0ff', 3);
  } });
cloudObject({ key: 'Orion', name: 'Orion Nebula', ra: P.M42[0], dec: P.M42[1], ly: 1344, size: 55, cat: 'Star-forming nebula', dist: '1,344 light-years',
  fact: 'The nearest big stellar nursery, visible to the naked eye as the fuzzy "star" in Orion\'s sword.',
  build: (h, s) => {
    scatter(h, 110, s, [0xff3d6e, 0xff5a5a, 0xd83a8a, 0xff8a5a], [1, 0.8, 0.4], [0.15, 0.4]);
    scatter(h, 40, s * 0.5, [0x5ad8d0, 0x8fe8ff, 0xfff0d0], [1, 0.8, 0.4], [0.2, 0.45]);
    for (const p of [[0, 0, 0], [1.2, 0.6, 0], [-0.9, 0.8, 0.3], [0.3, -1.1, 0]]) pointStar(h, new THREE.Vector3(...p), '#e6efff', 5);  // Trapezium
  } });
cloudObject({ key: 'Ring', name: 'Ring Nebula', ra: P.M57[0], dec: P.M57[1], ly: 2300, size: 22, cat: 'Planetary nebula', dist: 'about 2,300 light-years',
  fact: 'A glowing smoke ring of gas thrown off by a dying star.',
  build: (h, s) => {
    for (let i = 0; i < 90; i++) { const a = Math.random() * 6.28, r = s * 0.33 + gauss() * 0.8;
      const p = puff(i % 4 ? 0xff7040 : 0xffc060, s * 0.3, 0.45); p.position.set(Math.cos(a) * r * 1.2, Math.sin(a) * r, gauss()); h.add(p); }
    scatter(h, 30, s * 0.55, [0x40d0e0, 0x80f0ff], [1.2, 1, 0.3], [0.25, 0.45]);
    pointStar(h, new THREE.Vector3(), '#ffffff', 2);
  } });
cloudObject({ key: 'Crab', name: 'Crab Nebula', ra: P.M1[0], dec: P.M1[1], ly: 6500, size: 28, cat: 'Supernova remnant', dist: 'about 6,500 light-years',
  fact: 'Wreckage of a star that exploded in 1054, seen by astronomers in China. A pulsar spins 30 times a second at its heart.',
  build: (h, s) => {
    scatter(h, 90, s, [0xff6a30, 0xff4a40, 0xffb060], [1.3, 0.9, 0.8], [0.25, 0.5], [0.15, 0.45]);
    scatter(h, 40, s * 0.6, [0x6aa0ff, 0xa0c8ff], [1.2, 0.9, 0.8], [0.2, 0.4]);
    const pulsar = pointStar(h, new THREE.Vector3(), '#ffffff', 4);
    sim.push((dt, t) => pulsar.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 3)));
  } });
cloudObject({ key: 'Eagle', name: 'Eagle Nebula', ra: P.M16[0], dec: P.M16[1], ly: 7000, size: 50, cat: 'Star-forming nebula', dist: 'about 7,000 light-years',
  fact: 'Home of the famous "Pillars of Creation", towering columns of gas where new stars are forming.',
  build: (h, s) => {
    scatter(h, 100, s, [0x40c0a0, 0x60a8c0, 0xc8a050, 0xff7050], [1, 1, 0.4], [0.15, 0.35]);
    // three pillars: dense columns of warm-brown glow
    for (const [x, hgt] of [[-6, 22], [2, 14], [9, 10]]) for (let i = 0; i < 18; i++) {
      const p = puff(0xd08040, 6 + Math.random() * 4, 0.45); p.position.set(x + gauss() * 1.2, -12 + (i / 18) * hgt, gauss()); h.add(p); }
    for (let i = 0; i < 12; i++) pointStar(h, new THREE.Vector3(gauss() * s * 0.25, gauss() * s * 0.25, gauss() * 3), '#e8f0ff', 3 + Math.random() * 3);
  } });
cloudObject({ key: 'Carina', name: 'Carina Nebula', ra: 161.265, dec: -59.867, ly: 8500, size: 75, cat: 'Star-forming nebula', dist: 'about 8,500 light-years',
  fact: 'One of the largest nebulae in our galaxy, home to the giant unstable star Eta Carinae.',
  build: (h, s) => {
    scatter(h, 150, s, [0xff8a40, 0xff5a30, 0xffc070, 0x60b0c8, 0xc04060], [1.3, 0.8, 0.4], [0.12, 0.35]);
    pointStar(h, new THREE.Vector3(3, 2, 0), '#fff4e0', 12);   // Eta Carinae
    for (let i = 0; i < 20; i++) pointStar(h, new THREE.Vector3(gauss() * s * 0.3, gauss() * s * 0.2, gauss() * 4), '#dfe8ff', 3 + Math.random() * 4);
  } });

// ---------- Black holes ----------
const bhUniforms = { time: { value: 0 } };
sim.push(dt => bhUniforms.time.value += dt);
function diskMaterial(hot, cool, inner, outer) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { time: bhUniforms.time, hot: { value: new THREE.Color(hot) }, cool: { value: new THREE.Color(cool) }, rin: { value: inner }, rout: { value: outer }, center: { value: new THREE.Vector3() }, normal: { value: new THREE.Vector3(0, 1, 0) } },
    vertexShader: `varying vec3 vL; varying vec3 vW; void main(){ vL=position; vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform float time; uniform vec3 hot, cool, center, normal; uniform float rin, rout; varying vec3 vL; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      void main(){
        float r=length(vL.xy); float t=(r-rin)/(rout-rin);
        float a=atan(vL.y,vL.x);
        float spin=time*(1.6/(0.3+t));                      // inner parts orbit faster
        float s=n(vec2(a*6.+spin, t*14.))*0.6+n(vec2(a*16.+spin*1.7, t*40.))*0.4;
        vec3 c=mix(hot,cool,smoothstep(0.,1.,t));
        float I=pow(1.-t,2.4)*(0.45+1.0*s)*smoothstep(0.,0.05,t);
        vec3 radial=normalize(vW-center); vec3 tang=normalize(cross(normal,radial));
        float dop=1.+0.75*dot(tang,normalize(cameraPosition-vW));   // approaching side is brighter
        gl_FragColor=vec4(c*I*dop*1.05, 1.);
        #include <colorspace_fragment>
      }`
  });
}
function blackHole({ key, name, ra, dec, ly, rs, cat, dist, fact, disk = true, ringOnly = false, hot = '#fff3d8', cool = '#ff5a10', jet = false, companion = null, inclination = 1.25 }) {
  const holder = new THREE.Group(); holder.position.copy(place(ra, dec, ly)); scene.add(holder); holder.lookAt(0, 0, 0);
  const horizon = new THREE.Mesh(new THREE.SphereGeometry(rs, 48, 24), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  horizon.renderOrder = 1; holder.add(horizon);
  const tilt = new THREE.Group(); tilt.rotation.x = inclination; tilt.rotation.z = 0.3; holder.add(tilt);
  if (disk) {
    const mat = diskMaterial(hot, cool, rs * 1.5, rs * 7);
    const d = new THREE.Mesh(new THREE.RingGeometry(rs * 1.5, rs * 7, 160, 8), mat);
    d.renderOrder = 2; tilt.add(d);
    sim.push(() => { holder.getWorldPosition(mat.uniforms.center.value); mat.uniforms.normal.value.set(0, 0, 1).applyQuaternion(d.getWorldQuaternion(new THREE.Quaternion())); });
  }
  // Light bent around the hole: photon ring + the far side of the disk lensed over the top and bottom
  const halo = new THREE.Group(); holder.add(halo);
  const ringMat = new THREE.MeshBasicMaterial({ map: radialTex([[0, 'rgba(0,0,0,0)'], [0.55, 'rgba(0,0,0,0)'], [0.62, 'rgba(255,230,190,1)'], [0.7, 'rgba(255,150,60,0.55)'], [1, 'rgba(255,90,20,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: (disk || ringOnly) ? 1 : 0.35 });
  if (ringOnly) ringMat.color.set(0xffa860);
  const photon = new THREE.Mesh(new THREE.PlaneGeometry(rs * (ringOnly ? 6 : 4.2), rs * (ringOnly ? 6 : 4.2)), ringMat); photon.renderOrder = 3; halo.add(photon);
  if (disk) {
    const arcMat = diskMaterial(hot, cool, rs * 1.3, rs * 3.6);
    const arc = new THREE.Mesh(new THREE.RingGeometry(rs * 1.3, rs * 3.6, 128, 4), arcMat); arc.renderOrder = 3;
    arc.scale.set(1, 0.55, 1); halo.add(arc);
    sim.push(() => { holder.getWorldPosition(arcMat.uniforms.center.value); arcMat.uniforms.normal.value.set(0, 0, 1).applyQuaternion(arc.getWorldQuaternion(new THREE.Quaternion())); });
  }
  sim.push(() => halo.lookAt(camera.position));
  if (jet) for (const sgn of [1, -1]) for (let i = 0; i < 40; i++) {
    const p = puff(0x7fb0ff, rs * (0.8 + i * 0.06), 0.35 * (1 - i / 40)); p.position.set(0, 0, sgn * (rs * 2 + i * rs * 0.9)); tilt.add(p);
  }
  if (companion) {
    const piv = new THREE.Group(); holder.add(piv); piv.rotation.x = 0.3;
    const c = new THREE.Mesh(new THREE.SphereGeometry(companion.r, 48, 24), starMaterial(bvToColor(companion.bv)));
    c.position.x = companion.d; piv.add(c); c.add(glowSprite(companion.r * 5, '#' + bvToColor(companion.bv).getHexString(), 'rgba(0,0,0,0)', 0.7));
    sim.push(dt => piv.rotation.y += dt * companion.speed);
    if (companion.stream) { // gas pulled from the star into the disk
      const n = 600, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const f = i / n, a = f * 2.4, r = companion.d * (1 - f) + rs * 2 * f;
        pos.set([Math.cos(-a) * r + gauss() * 0.3 * (1 - f), gauss() * 0.3 * (1 - f), Math.sin(-a) * r + gauss() * 0.3 * (1 - f)], i * 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      piv.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fc4ff, size: 0.35, map: softDot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    }
    if (companion.name) deepLabel(c, companion.name, companion.r + 1.5, key, 'star', 300);
  }
  deepLabel(holder, name, rs * 5, key, 'bh', 600);
  bodies[key] = { obj: holder, radius: rs, view: rs * (disk ? 16 : 10) + (companion ? companion.d : 0), selfLit: true };
  info(key, name, cat, dist, fact);
  return holder;
}
blackHole({ key: 'GaiaBH1', name: 'Gaia BH1', ra: 262.171, dec: -0.581, ly: 1560, rs: 1.2, disk: false, cat: 'Black hole · dormant', dist: 'about 1,560 light-years',
  fact: 'One of the nearest known black holes, found in 2022. It is "quiet": no glowing disk, just a Sun-like star orbiting it.',
  companion: { name: 'Sun-like companion', r: 2.2, bv: 0.65, d: 14, speed: 0.15 } });
blackHole({ key: 'CygX1', name: 'Cygnus X-1', ra: 299.590, dec: 35.202, ly: 7200, rs: 2, inclination: 1.3, cat: 'Black hole · stellar', dist: 'about 7,200 light-years',
  fact: 'The first object widely accepted as a black hole. About 21 times the Sun\'s mass, it pulls gas off a blue supergiant partner.',
  companion: { name: 'Blue supergiant HDE 226868', r: 7, bv: -0.3, d: 32, speed: 0.08, stream: true } });
const sgr = blackHole({ key: 'SgrA', name: 'Sagittarius A*', ra: 266.417, dec: -29.008, ly: 26670, rs: 7, cat: 'Supermassive black hole', dist: 'about 26,700 light-years',
  fact: 'The black hole at the centre of our Milky Way, about 4 million times the Sun\'s mass. First imaged in 2022.', hot: '#ffe8c0', cool: '#c03a10', inclination: 1.32 });
// a swarm of stars racing around Sgr A* (like the real S-stars)
{ const piv = new THREE.Group(); sgr.add(piv);
  for (let i = 0; i < 14; i++) { const o = new THREE.Group(); o.rotation.set(Math.random() * 3, Math.random() * 3, 0); piv.add(o);
    const s = glowSprite(2.5, '#dfe8ff', 'rgba(0,0,0,0)', 1); const r = 28 + Math.random() * 35; s.position.x = r; o.add(s);
    const sp = 0.6 * Math.pow(30 / r, 1.5); sim.push(dt => o.rotation.y += dt * sp); } }

// ---------- Galaxies ----------
const galMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
  uniforms: { scale: { value: innerHeight / 2 } },
  vertexShader: `attribute float size; varying vec3 vC; uniform float scale;
    void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=color*smoothstep(15.,80.,-mv.z); gl_PointSize=clamp(size*scale/-mv.z,1.,64.); gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vC; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d); gl_FragColor=vec4(vC*a*a,1.); }`
});
addEventListener('resize', () => galMat.uniforms.scale.value = innerHeight / 2);

function galaxyPoints({ type, R, n, arms = 2, pitch = 0.35, bulge = 0.18, seed = 1, warm = '#ffd9a0', coolC = '#a8c4ff', bright = 1, hole = 0 }) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
  const W = new THREE.Color(warm), C = new THREE.Color(coolC), Pk = new THREE.Color('#ff7ab0'), tmp = new THREE.Color();
  let rnd = seed * 9301 + 49297; const rand = () => (rnd = (rnd * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) {
    let x, y, z, c, s = 1, k = 1; const u = rand();
    if (type === 'elliptical') {
      const r = R * Math.pow(rand(), 2.2) + R * 0.03 + hole * (1 - rand() * 0.3); const th = rand() * 6.28, ph = Math.acos(2 * rand() - 1);
      x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph) * 0.75; z = r * Math.sin(ph) * Math.sin(th);
      c = tmp.copy(W).lerp(new THREE.Color('#ffbf80'), rand() * 0.5); k = 0.5 + 0.6 * (1 - r / R); s = 1.4;
    } else if (type === 'irregular') {
      const blob = Math.floor(rand() * 6); const bx = (hash(blob, seed) - 0.5) * R, bz = (hash(seed, blob) - 0.5) * R * 0.8;
      if (u < 0.35) { x = gauss() * R * 0.4; z = gauss() * R * 0.1; } else { x = bx + gauss() * R * 0.18; z = bz + gauss() * R * 0.18; }
      y = gauss() * R * 0.06; c = tmp.copy(C).lerp(W, rand() * 0.6); if (rand() < 0.04) { c = Pk; s = 2; }
    } else if (u < bulge) { // bulge
      const r = Math.abs(gauss()) * R * (type === 'sombrero' ? 0.32 : 0.13);
      const th = rand() * 6.28, ph = Math.acos(2 * rand() - 1);
      x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph) * (type === 'sombrero' ? 0.7 : 0.55); z = r * Math.sin(ph) * Math.sin(th);
      c = W; k = 1.1; s = 1.5;
    } else { // disk with spiral arms
      const r = R * Math.pow(rand(), 0.75);
      const arm = Math.floor(rand() * arms);
      const onArm = rand() < 0.72;
      const th = arm * 6.283 / arms + Math.log(Math.max(r, R * 0.05) / (R * 0.05)) / Math.tan(pitch) + (onArm ? gauss() * 0.28 : rand() * 6.28);
      x = r * Math.cos(th); z = r * Math.sin(th); y = gauss() * R * 0.018;
      c = tmp.copy(W).lerp(C, Math.min(1, r / R * 1.6)); k = onArm ? 1 : 0.5;
      if (onArm && rand() < 0.035) { c = Pk; s = 2.2; k = 1.4; }
    }
    pos.set([x, y, z], i * 3);
    const b = k * bright * 0.5; col.set([c.r * b, c.g * b, c.b * b], i * 3);
    size[i] = R * 0.02 * s * (0.6 + rand() * 0.8);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  return new THREE.Points(g, galMat);
}
function galaxy({ key, name, ra, dec, ly, R, incl, pa = 0, cat, dist, fact, ...opts }) {
  const holder = new THREE.Group(); holder.position.copy(place(ra, dec, ly)); scene.add(holder);
  // orient: tilt the disk away from face-on (toward Earth) by its real inclination
  const los = holder.position.clone().normalize().negate();
  const perp = new THREE.Vector3(0, 1, 0).cross(los).normalize().applyAxisAngle(los, pa);
  const normal = los.clone().applyAxisAngle(perp, THREE.MathUtils.degToRad(incl));
  const disk = new THREE.Group(); disk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal); holder.add(disk);
  disk.add(galaxyPoints({ R, ...opts }));
  holder.add(glowSprite(R * (opts.type === 'elliptical' ? 1.1 : 0.6), 'rgba(255,225,180,0.6)', 'rgba(0,0,0,0)', opts.type === 'elliptical' ? 0.3 : 0.5));
  sim.push(dt => disk.children[0].rotation.y += dt * 0.004);
  deepLabel(holder, name, R * 0.6, key, 'gal', 900);
  bodies[key] = { obj: holder, radius: R, view: R * 2.4, selfLit: true };
  info(key, name, cat, dist, fact);
  return { holder, disk };
}
galaxy({ key: 'LMC', name: 'Large Magellanic Cloud', ra: 80.894, dec: -69.756, ly: 160000, R: 32, incl: 35, type: 'irregular', n: 16000, seed: 3, bright: 1.8, cat: 'Galaxy · satellite of the Milky Way', dist: 'about 160,000 light-years', fact: 'A small galaxy orbiting ours, easy to see from the Southern Hemisphere.' });
galaxy({ key: 'SMC', name: 'Small Magellanic Cloud', ra: 13.187, dec: -72.829, ly: 200000, R: 20, incl: 60, type: 'irregular', n: 9000, seed: 5, bright: 1.8, cat: 'Galaxy · satellite of the Milky Way', dist: 'about 200,000 light-years', fact: 'The Large Cloud\'s little sibling, slowly being pulled apart by the Milky Way.' });
galaxy({ key: 'Andromeda', name: 'Andromeda Galaxy', ra: P.M31[0], dec: P.M31[1], ly: 2.5e6, R: 115, incl: 70, pa: 0.6, type: 'spiral', n: 45000, arms: 2, pitch: 0.28, bulge: 0.22, cat: 'Galaxy · spiral', dist: 'about 2.5 million light-years', fact: 'The nearest large galaxy, with around a trillion stars. It is heading toward the Milky Way.' });
galaxy({ key: 'Triangulum', name: 'Triangulum Galaxy', ra: P.M33[0], dec: P.M33[1], ly: 2.73e6, R: 55, incl: 55, pa: 1.2, type: 'spiral', n: 20000, arms: 2, pitch: 0.42, bulge: 0.08, cat: 'Galaxy · spiral', dist: 'about 2.7 million light-years', fact: 'The third-largest galaxy in our Local Group, full of star-forming regions.' });
const m51 = galaxy({ key: 'Whirlpool', name: 'Whirlpool Galaxy', ra: P.M51[0], dec: P.M51[1], ly: 2.3e7, R: 70, incl: 20, type: 'spiral', n: 28000, arms: 2, pitch: 0.3, bulge: 0.14, cat: 'Galaxy · spiral', dist: 'about 23 million light-years', fact: 'A classic face-on spiral, tugged by the small companion galaxy at the end of one arm.' });
{ const comp = galaxyPoints({ type: 'elliptical', R: 18, n: 5000, seed: 9 }); comp.position.set(75, 0, 20); m51.disk.add(comp); }
const somb = galaxy({ key: 'Sombrero', name: 'Sombrero Galaxy', ra: P.M104[0], dec: P.M104[1], ly: 3.1e7, R: 60, incl: 84, type: 'sombrero', n: 26000, arms: 2, pitch: 0.18, bulge: 0.42, cat: 'Galaxy · spiral', dist: 'about 31 million light-years', fact: 'A bright bulging core crossed by a dark lane of dust, like a hat seen edge-on.' });
{ // dark dust lane
  const lane = new THREE.Mesh(new THREE.RingGeometry(60 * 0.45, 60 * 0.95, 96), new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }));
  lane.rotation.x = -Math.PI / 2; lane.renderOrder = 5; somb.disk.add(lane);
}
const m87 = galaxy({ key: 'M87', name: 'Messier 87', ra: P.M87[0], dec: P.M87[1], ly: 5.35e7, R: 110, incl: 40, type: 'elliptical', n: 30000, seed: 11, bright: 0.55, hole: 60, cat: 'Galaxy · giant elliptical', dist: 'about 53 million light-years', fact: 'A giant ball-shaped galaxy with thousands of star clusters, and home to the black hole M87*.' });
const m87bh = blackHole({ key: 'M87BH', name: 'M87*', ra: P.M87[0], dec: P.M87[1], ly: 5.35e7, rs: 8, jet: true, disk: false, ringOnly: true, inclination: 0.3, hot: '#fff0d0', cool: '#ff7a20', cat: 'Supermassive black hole', dist: 'about 53 million light-years',
  fact: 'The first black hole ever photographed (2019): about 6.5 billion times the Sun\'s mass, firing a jet of particles thousands of light-years long.' });
bodies.M87BH.view = 45;

// ---------- Spacecraft ----------
const earth = bodies.Earth.obj;
const gold = new THREE.MeshStandardMaterial({ color: 0xd8a640, metalness: 0.9, roughness: 0.35 });
const silver = new THREE.MeshStandardMaterial({ color: 0xd4d8e0, metalness: 0.85, roughness: 0.3 });
const white = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
const panel = new THREE.MeshStandardMaterial({ color: 0x1b2f78, metalness: 0.6, roughness: 0.3, emissive: 0x0a1440, emissiveIntensity: 0.5 });
const panelGold = new THREE.MeshStandardMaterial({ color: 0x8a6a2a, metalness: 0.7, roughness: 0.35, emissive: 0x2a1a05, emissiveIntensity: 0.4 });
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (r, l, m, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, seg), m);

function buildISS() {
  const g = new THREE.Group();
  g.add(box(4.4, 0.12, 0.12, silver));                                       // main truss
  for (const x of [-1.7, -1.1, 1.1, 1.7]) for (const z of [-1, 1]) {           // 8 big solar wings
    const w = box(0.42, 0.02, 1.7, panelGold); w.position.set(x, 0, z * 1.0); g.add(w); }
  for (const x of [-0.5, 0.5]) { const r = box(0.5, 0.02, 0.9, white); r.position.set(x, -0.1, 0.6); g.add(r); }  // radiators
  const modules = [[0, 0, -0.3, 1.6], [0, 0, 0.9, 1.0], [0.55, 0, -0.6, 0.7], [-0.55, 0, -0.6, 0.7]];
  for (const [x, y, z, l] of modules) { const m = cyl(0.17, l, white); m.rotation.x = Math.PI / 2; m.position.set(x, y, z); g.add(m); }
  return g;
}
function buildHubble() {
  const g = new THREE.Group();
  const tube = cyl(0.35, 2.2, silver, 24); tube.rotation.z = Math.PI / 2; g.add(tube);
  const aft = cyl(0.37, 0.6, white, 24); aft.rotation.z = Math.PI / 2; aft.position.x = -1.3; g.add(aft);
  const door = new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), silver); door.position.set(1.15, 0.3, 0); door.rotation.y = Math.PI / 2; door.rotation.x = -0.8; g.add(door);
  for (const z of [-1, 1]) { const w = box(1.5, 0.02, 0.55, panel); w.position.set(-0.3, 0, z * 0.75); g.add(w); }
  return g;
}
function buildJWST() {
  const g = new THREE.Group();
  for (let l = 0; l < 5; l++) { // 5-layer sunshield (kite shape)
    const s = new THREE.Shape(); s.moveTo(-2.2, 0); s.lineTo(0, 1.1); s.lineTo(2.2, 0); s.lineTo(0, -1.1); s.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshStandardMaterial({ color: l ? 0xb8a8d8 : 0xd8c8f0, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.y = -0.05 * l; g.add(m);
  }
  const mirror = new THREE.Group(); mirror.position.set(0, 0.9, 0); mirror.rotation.x = 0.15; g.add(mirror);
  const hexGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.04, 6); hexGeo.rotateX(Math.PI / 2); hexGeo.rotateZ(Math.PI / 6);
  const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xffc040, metalness: 1, roughness: 0.15, emissive: 0x402800, emissiveIntensity: 0.4 });
  const dx = 0.4, dy = 0.46;
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
    const s = -q - r; if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > 2 || (q === 0 && r === 0)) continue;
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) === 2 && (q === 0 || r === 0 || s === 0) && Math.abs(q - r) !== 0) { /* keep */ }
    const hx = new THREE.Mesh(hexGeo, mirrorMat); hx.position.set(dx * q * 1.0, dy * (r + q / 2), 0);
    if (Math.abs(q) + Math.abs(r) + Math.abs(s) <= 4) mirror.add(hx);
  }
  for (const a of [0, 2.1, 4.2]) { const strut = cyl(0.015, 1.2, silver, 6); strut.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.5); strut.lookAt(0, 0, 1.1); strut.rotateX(Math.PI / 2); mirror.add(strut); }
  const sec = cyl(0.08, 0.04, mirrorMat); sec.rotation.x = Math.PI / 2; sec.position.z = 1.1; mirror.add(sec);
  return g;
}
function buildProbe(kind) { // Voyager / New Horizons style: dish + bus + RTG boom
  const g = new THREE.Group();
  const dish = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 12, 0, 6.283, 0, 0.6), new THREE.MeshStandardMaterial({ color: 0xf4f4f4, side: THREE.DoubleSide, roughness: 0.5 }));
  dish.rotation.x = Math.PI; dish.position.y = 0.6; g.add(dish);
  const bus = kind === 'nh' ? new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 3), gold) : new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.45, 10), silver);
  bus.position.y = -0.3; g.add(bus);
  const boom = cyl(0.04, 2.6, silver, 6); boom.rotation.z = Math.PI / 2; boom.position.set(-1.4, -0.3, 0); g.add(boom);
  const rtg = cyl(0.15, 0.7, new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.6, roughness: 0.5 })); rtg.rotation.z = Math.PI / 2; rtg.position.set(-2.4, -0.3, 0); g.add(rtg);
  if (kind !== 'nh') { const mag = cyl(0.015, 6, silver, 4); mag.rotation.z = Math.PI / 2; mag.position.set(3.2, -0.3, 0); g.add(mag); }
  return g;
}

const _e = new THREE.Vector3();
// look at a craft from above it, with Earth filling the background
const earthBack = target => { earth.getWorldPosition(_e); return target.clone().sub(_e).normalize().add(new THREE.Vector3(0, 0.35, 0)).normalize(); };
function earthOrbiter({ key, name, model, scale, radius, incl, speed, phase = 0, cat, dist, fact, view }) {
  const o = new THREE.Group(); o.rotation.set(incl, phase, 0.4); earth.add(o);
  const craft = model(); craft.scale.setScalar(scale); o.add(craft);
  let a = phase * 3; const c = new THREE.Vector3();
  sim.push(dt => { a += dt * speed; craft.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius); earth.getWorldPosition(c); });
  addLabel(craft, name, 0.08 / scale, key, 'craft');
  bodies[key] = { obj: craft, radius: scale, view, dir: earthBack };
  info(key, name, cat, dist, fact);
}
earthOrbiter({ key: 'ISS', name: 'ISS', model: buildISS, scale: 0.022, radius: 1.16, incl: 0.9, speed: 0.55, cat: 'Spacecraft · space station', dist: 'about 400 km above Earth', view: 0.22,
  fact: 'The International Space Station, with people living aboard continuously since November 2000. It circles Earth about every 90 minutes.' });
earthOrbiter({ key: 'Hubble', name: 'Hubble', model: buildHubble, scale: 0.022, radius: 1.24, incl: 0.5, speed: 0.48, phase: 2, cat: 'Spacecraft · space telescope', dist: 'about 540 km above Earth', view: 0.2,
  fact: 'Launched in 1990, Hubble has taken some of the most famous pictures of the universe.' });
bodies.Satellite.dir = earthBack;
INFO.Satellite = { name: 'Communications satellite', cat: 'Spacecraft', dist: 'about 35,786 km above Earth (geostationary orbit)', fact: 'At this height a satellite circles once a day, matching Earth\'s spin, so it seems to hang still in the sky.' };

{ // Swarm of small satellites in low orbit (Starlink and others)
  for (let shell = 0; shell < 10; shell++) {
    const o = new THREE.Group(); o.rotation.set(0.3 + shell * 0.13, shell * 0.7, 0); earth.add(o);
    const n = 50, pos = new Float32Array(n * 3), r = 1.07 + (shell % 3) * 0.015;
    for (let i = 0; i < n; i++) { const a = i / n * 6.283; pos.set([Math.cos(a) * r, 0, Math.sin(a) * r], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    o.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 0.008, map: softDot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    sim.push(dt => o.rotation.y += dt * (0.6 + shell * 0.01));
  }
}

{ // James Webb Space Telescope at Sun–Earth L2, on the far side of Earth from the Sun
  const jw = buildJWST(); jw.scale.setScalar(0.06); scene.add(jw);
  const e = new THREE.Vector3(); let a = 0;
  sim.push(dt => { a += dt * 0.3; earth.getWorldPosition(e); const away = e.clone().normalize();
    jw.position.copy(e).addScaledVector(away, 4.2).add(new THREE.Vector3(Math.cos(a) * 0.4, Math.sin(a) * 0.3, 0));
    jw.lookAt(0, 0, 0); jw.rotateX(-Math.PI / 2); });     // sunshield faces the Sun
  addLabel(jw, 'James Webb', 1.6, 'JWST', 'craft');
  bodies.JWST = { obj: jw, radius: 0.13, view: 0.6, dir: t => t.clone().normalize().add(new THREE.Vector3(0, 0.6, 0)).normalize() };  // view the mirror side
  info('JWST', 'James Webb Space Telescope', 'Spacecraft · space telescope', 'about 1.5 million km from Earth (Sun–Earth L2)',
    'Launched in December 2021. Its tennis-court-sized sunshield keeps the gold mirror cold enough to see infrared light from the first galaxies.');
}

function farProbe({ key, name, kind, ra, dec, r, cat, dist, fact }) {
  const p = buildProbe(kind); p.scale.setScalar(0.5); p.position.copy(skyDir(ra, dec).multiplyScalar(r)); scene.add(p);
  p.lookAt(0, 0, 0); p.rotateX(Math.PI / 2);             // dish points home
  const trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), p.position.clone()]),
    new THREE.LineDashedMaterial({ color: 0x7fe0b0, dashSize: 3, gapSize: 3, transparent: true, opacity: 0.35 }));
  trail.computeLineDistances(); scene.add(trail); SS.orbitLines.push(trail);
  addLabel(p, name, 2.2, key, 'craft');
  bodies[key] = { obj: p, radius: 1.5, view: 6 };
  info(key, name, cat, dist, fact);
}
farProbe({ key: 'NewHorizons', name: 'New Horizons', kind: 'nh', ra: 295, dec: -21, r: 120, cat: 'Spacecraft · probe', dist: 'over 9 billion km from Earth',
  fact: 'Flew past Pluto in 2015, then the Kuiper Belt object Arrokoth in 2019.' });
farProbe({ key: 'Voyager2', name: 'Voyager 2', kind: 'v', ra: 302, dec: -60, r: 215, cat: 'Spacecraft · probe', dist: 'over 21 billion km from Earth',
  fact: 'Launched in 1977. The only spacecraft to visit Uranus and Neptune; it entered interstellar space in 2018.' });
farProbe({ key: 'Voyager1', name: 'Voyager 1', kind: 'v', ra: 258, dec: 12, r: 235, cat: 'Spacecraft · probe', dist: 'over 25 billion km from Earth',
  fact: 'Launched in 1977, it is the most distant human-made object. It crossed into interstellar space in 2012.' });

// ---------- Solar System facts ----------
const ss = (k, n, c, d, f) => info(k, n, c, d, f);
ss('Sun', 'The Sun', 'Star', '150 million km from Earth (8.3 light-minutes)', 'Holds 99.8% of all the mass in the Solar System.');
ss('Mercury', 'Mercury', 'Planet', 'about 58 million km from the Sun', 'The smallest planet. A year there lasts just 88 Earth days.');
ss('Venus', 'Venus', 'Planet', 'about 108 million km from the Sun', 'The hottest planet, around 465 °C, under thick clouds of sulfuric acid.');
ss('Earth', 'Earth', 'Planet', 'about 150 million km from the Sun', 'Our home, and the only world known to have life.');
ss('Moon', 'The Moon', 'Moon of Earth', 'about 384,400 km from Earth', 'Always shows the same face to Earth.');
ss('Mars', 'Mars', 'Planet', 'about 228 million km from the Sun', 'Home to Olympus Mons, the tallest volcano in the Solar System.');
ss('Jupiter', 'Jupiter', 'Planet · gas giant', 'about 778 million km from the Sun', 'The largest planet. The Great Red Spot is a storm wider than Earth.');
ss('Saturn', 'Saturn', 'Planet · gas giant', 'about 1.4 billion km from the Sun', 'Its rings are made mostly of chunks of water ice.');
ss('Uranus', 'Uranus', 'Planet · ice giant', 'about 2.9 billion km from the Sun', 'Rolls around the Sun on its side, tilted about 98°.');
ss('Neptune', 'Neptune', 'Planet · ice giant', 'about 4.5 billion km from the Sun', 'The windiest planet, with gusts over 2,000 km/h.');
ss('Ceres', 'Ceres', 'Dwarf planet', 'about 414 million km from the Sun', 'The largest object in the asteroid belt, with bright salt deposits in Occator crater.');
ss('Pluto', 'Pluto', 'Dwarf planet', 'about 5.9 billion km from the Sun (average)', 'Its heart-shaped plain is made of frozen nitrogen. Visited by New Horizons in 2015.');
ss('Haumea', 'Haumea', 'Dwarf planet', 'about 6.5 billion km from the Sun (average)', 'Spins once every ~4 hours, stretching it into an egg shape. It also has a ring.');
ss('Makemake', 'Makemake', 'Dwarf planet', 'about 6.8 billion km from the Sun (average)', 'A reddish, icy world far out in the Kuiper Belt.');
ss('Eris', 'Eris', 'Dwarf planet', 'about 10 billion km from the Sun (average)', 'Almost Pluto\'s size. Its discovery led to Pluto being reclassified as a dwarf planet.');

// ---------- Rebuild the Fly-to menu in groups ----------
{
  const groups = [
    ['Views', [['overview', 'Solar System'], ['deep', 'Deep space (everything)']]],
    ['The Sun & planets', ['Sun', 'Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']],
    ['Dwarf planets', ['Ceres', 'Pluto', 'Haumea', 'Makemake', 'Eris']],
    ['Spacecraft', [['ISS', 'ISS (Space Station)'], 'Hubble', ['Satellite', 'Comms satellite'], ['JWST', 'James Webb Telescope'], 'New Horizons|NewHorizons', 'Voyager 2|Voyager2', 'Voyager 1|Voyager1']],
    ['Stars (nearest first)', ['Proxima Centauri|Proxima', 'Alpha Centauri|AlphaCen', "Barnard's Star|Barnard", 'Sirius', 'Procyon', 'Altair', 'Vega', 'Fomalhaut', 'Pollux', 'Arcturus', 'Capella', 'Aldebaran', 'Regulus', 'Spica', 'Canopus', 'Polaris', 'Betelgeuse', 'Antares', 'Rigel', 'Deneb']],
    ['Star clusters & nebulae', ['Pleiades', 'Helix Nebula|Helix', 'Orion Nebula|Orion', 'Ring Nebula|Ring', 'Crab Nebula|Crab', 'Eagle Nebula|Eagle', 'Carina Nebula|Carina']],
    ['Black holes', ['Gaia BH1|GaiaBH1', 'Cygnus X-1|CygX1', 'Sagittarius A* (our galaxy)|SgrA', 'M87*|M87BH']],
    ['Zodiac (star signs)', ZODIAC.map(z => [`Z_${z[0]}`, `${z[2]}\uFE0E ${z[1]}`])],
    ['Galaxies', ['Large Magellanic Cloud|LMC', 'Small Magellanic Cloud|SMC', 'Andromeda', 'Triangulum', 'Whirlpool', 'Sombrero', 'Messier 87|M87']],
  ];
  const sel = SS.focusSel; sel.innerHTML = '';
  for (const [label, items] of groups) {
    const og = document.createElement('optgroup'); og.label = label;
    for (const it of items) {
      let key, text;
      if (Array.isArray(it)) [key, text] = it;
      else if (it.includes('|')) [text, key] = it.split('|');
      else key = text = it;
      const o = document.createElement('option'); o.value = key; o.textContent = text; og.appendChild(o);
    }
    sel.appendChild(og);
  }
  sel.value = 'overview';
}

// Show far-away labels only when the camera is near enough, so the sky doesn't fill with names
const camPos = new THREE.Vector3(), objPos = new THREE.Vector3();
sim.push(() => {
  const on = document.getElementById('labels').checked;
  camera.getWorldPosition(camPos);
  for (const d of deepLabels) d.l.visible = on && d.obj.getWorldPosition(objPos).distanceTo(camPos) < d.range;
});

// ---------- Share building blocks with the extras module, then load it ----------
SS.cosmos = { info, INFO, star, skyDir, place, sceneDist, deepLabel, softDot, puff, gauss, starMaterial, bvToColor, radialTex, syncSky, zodBox, ZODIAC };
await import('./extras.js');
