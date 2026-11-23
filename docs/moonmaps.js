// =====================================================================
// Real surface maps for the moons, Pluto and Charon, from NASA 3D Resources (Images and Textures).
// Where the spacecraft never saw a part of a moon (Voyager only saw the southern half of Uranus's moons),
// the gap is filled with a matching cratered surface so the globe has no blank patches.
// =====================================================================
import * as THREE from 'three';
const SS = window.SS;
const { bodies } = SS;
const MAPS = ['Phobos', 'Deimos', 'Io', 'Europa', 'Ganymede', 'Callisto', 'Enceladus', 'Mimas', 'Tethys', 'Dione', 'Rhea', 'Iapetus',
  'Miranda', 'Ariel', 'Umbriel', 'Titania', 'Oberon'];
const put = (mesh, file) => { if (mesh?.material) SS.lazyMap(mesh, 'tex/moons/' + file + '.jpg?v=1', 60); };   // loaded when you come near (the made-up surface shows until then)
for (const k of MAPS) put(bodies[k]?.obj, k.toLowerCase());
// Pluto and Charon live in index.html's dwarfPlanet(): the holder carries Pluto (tilted group) and Charon (on its own pivot)
{ const h = bodies.Pluto?.obj; if (h) { let pluto = null, charon = null;
    h.traverse(o => { if (o.isMesh && o.geometry?.type === 'SphereGeometry') { const r = o.geometry.parameters.radius; if (r > 0.3) pluto = o; else if (r > 0.1 && r < 0.2) charon = o; } });
    put(pluto, 'pluto'); put(charon, 'charon'); } }
