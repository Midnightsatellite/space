// =====================================================================
// 🛸 Departures & arrivals: an airport-style board for spaceships.
// Live part (The Space Devs, Launch Library 2): ships docked at the ISS and Tiangong right now,
// ships that recently left, and the next ships launching to a station.
// Fixed part: probes travelling between worlds, where they left from, when, where to and when they arrive.
// =====================================================================
const SS = window.SS;
const { bodies, flyTo, focusSel } = SS;
const { info, INFO } = SS.cosmos;
const special = SS.more.special;
const { PL } = SS.extras;
const $ = id => document.getElementById(id);
const fr = () => SS.lang === 'fr';
const t2 = (F, en, f) => F ? f : en;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DAY = 864e5;

// ---------------------------------------------------------------- where each kind of ship leaves from
// [match, launch site EN, FR, how it comes home EN, FR, typical time from launch to docking EN, FR]
const SHIPS = [
  [/crew dragon/i, 'Florida, USA', 'Floride, États-Unis', 'splashes down in the sea', 'amerrit en mer', 'about a day', 'environ un jour'],
  [/cargo dragon|dragon 2|dragon/i, 'Florida, USA', 'Floride, États-Unis', 'splashes down with science on board', 'amerrit avec des expériences à bord', 'about a day', 'environ un jour'],
  [/soyuz/i, 'Baikonur, Kazakhstan', 'Baïkonour, Kazakhstan', 'lands on the steppe of Kazakhstan', 'atterrit dans la steppe du Kazakhstan', 'about 3 hours', 'environ 3 heures'],
  [/progress/i, 'Baikonur, Kazakhstan', 'Baïkonour, Kazakhstan', 'burns up over the Pacific with the rubbish', 'brûle au-dessus du Pacifique avec les déchets', 'about 3 hours', 'environ 3 heures'],
  [/cygnus/i, 'Florida or Virginia, USA', 'Floride ou Virginie, États-Unis', 'burns up over the Pacific with the rubbish', 'brûle au-dessus du Pacifique avec les déchets', 'about 2 days', 'environ 2 jours'],
  [/shenzhou/i, 'Jiuquan, China', 'Jiuquan, Chine', 'lands in the Gobi desert', 'atterrit dans le désert de Gobi', 'about 6 hours', 'environ 6 heures'],
  [/tianzhou/i, 'Wenchang, Hainan, China', 'Wenchang, Hainan, Chine', 'burns up over the Pacific with the rubbish', 'brûle au-dessus du Pacifique avec les déchets', 'about 3 hours', 'environ 3 heures'],
  [/htv/i, 'Tanegashima, Japan', 'Tanegashima, Japon', 'burns up on re-entry', 'brûle en rentrant', 'about 4 days', 'environ 4 jours'],
  [/dream chaser/i, 'Florida, USA', 'Floride, États-Unis', 'lands on a runway like a plane', 'atterrit sur une piste comme un avion', 'a few days', 'quelques jours'],
  [/starliner/i, 'Florida, USA', 'Floride, États-Unis', 'lands under parachutes in the desert', 'atterrit sous parachutes dans le désert', 'about a day', 'environ un jour'],
];
const shipInfo = s => SHIPS.find(r => r[0].test(s || '')) || [null, '—', '—', '', '', 'a day or two', 'un jour ou deux'];
const STATION_KEY = n => /tiangong|tianhe|css/i.test(n || '') ? 'Tiangong' : 'ISS';
const stationName = (n, F) => STATION_KEY(n) === 'Tiangong' ? 'Tiangong' : t2(F, 'ISS', 'ISS');
// launches that go to a station, matched by name
const TO_STATION = /progress ms|soyuz ms|crew-\d|crs|cygnus|ng-\d|tianzhou|shenzhou|htv|dream chaser|starliner|axiom|ax-\d|vast|haven/i;
const TO_TIANGONG = /tianzhou|shenzhou/i;

// ---------------------------------------------------------------- probes between worlds (checked November 2026)
// key: card to fly to (or null), name, from EN/FR, left (ISO date), to EN/FR, toKey, arrives (ISO date), arrive label EN/FR, note EN/FR
const PROBES = [
  { key: 'BepiColombo', name: 'BepiColombo', from: ['Kourou, French Guiana', 'Kourou, Guyane'], left: '2018-10-20', to: ['Mercury', 'Mercure'], toKey: 'Mercury',
    arr: '2026-11-21', arrLbl: ['21 Nov 2026', '21 nov. 2026'], done: true,
    note: ['In orbit. Its two orbiters part on 9–10 December; science starts in April 2027.', 'En orbite. Ses deux sondes se séparent les 9 et 10 décembre ; la science commence en avril 2027.'] },
  { key: 'Hera', name: 'Hera', from: ['Florida, USA', 'Floride, États-Unis'], left: '2024-10-07', to: ['asteroid Didymos', 'astéroïde Didymos'], toKey: 'Hera',
    arr: '2026-11-15', arrLbl: ['Nov 2026', 'nov. 2026'], done: true,
    note: ['Arrived to study the crater NASA’s DART left in 2022. Its two small cubesats go out in early 2027.', 'Arrivée pour étudier le cratère laissé par DART (NASA) en 2022. Ses deux petits cubesats sortent début 2027.'] },
  { key: 'Tianwen2', name: 'Tianwen-2', from: ['Xichang, China', 'Xichang, Chine'], left: '2025-05-28', to: ['asteroid Kamoʻoalewa', 'astéroïde Kamoʻoalewa'], toKey: 'Tianwen2',
    arr: '2026-07-06', arrLbl: ['Jul 2026', 'juil. 2026'], done: true,
    note: ['At the asteroid now. It brings a sample back to Earth in late 2027, then heads for comet 311P.', 'Sur l’astéroïde en ce moment. Il ramène un échantillon sur Terre fin 2027, puis repart vers la comète 311P.'] },
  { key: null, name: ['MMX (Japan)', 'MMX (Japon)'], from: ['Tanegashima, Japan', 'Tanegashima, Japon'], left: '2026-10-20', to: ['Mars and its moon Phobos', 'Mars et sa lune Phobos'], toKey: 'Mars',
    arr: '2027-08-01', arrLbl: ['2027', '2027'],
    note: ['Will scoop a sample from Phobos and bring it back to Earth in 2031.', 'Prélèvera un échantillon sur Phobos et le rapportera sur Terre en 2031.'] },
  { key: null, name: ['ESCAPADE (NASA, 2 probes)', 'ESCAPADE (NASA, 2 sondes)'], from: ['Florida, USA', 'Floride, États-Unis'], left: '2025-11-13', to: ['Mars', 'Mars'], toKey: 'Mars',
    arr: '2027-09-01', arrLbl: ['2027', '2027'],
    note: ['Twin probes that will study how the solar wind strips Mars’s air away.', 'Deux sondes jumelles qui étudieront comment le vent solaire arrache l’air de Mars.'] },
  { key: 'Lucy', name: 'Lucy', from: ['Florida, USA', 'Floride, États-Unis'], left: '2021-10-16', to: ['Eurybates, a Trojan asteroid near Jupiter', 'Eurybates, astéroïde troyen près de Jupiter'], toKey: 'Lucy',
    arr: '2027-08-12', arrLbl: ['Aug 2027', 'août 2027'],
    note: ['The first of five Trojan asteroids it will fly past until 2033.', 'Le premier des cinq astéroïdes troyens qu’elle survolera jusqu’en 2033.'] },
  { key: 'OSIRISAPEX', name: 'OSIRIS-APEX', from: ['Florida, USA', 'Floride, États-Unis'], left: '2016-09-08', to: ['asteroid Apophis', 'astéroïde Apophis'], toKey: 'Apophis2029',
    arr: '2029-04-13', arrLbl: ['Apr 2029', 'avr. 2029'],
    note: ['Meets Apophis just after it skims past Earth on 13 April 2029.', 'Rejoint Apophis juste après son passage très près de la Terre le 13 avril 2029.'] },
  { key: 'PsycheProbe', name: 'Psyche', from: ['Florida, USA', 'Floride, États-Unis'], left: '2023-10-13', to: ['asteroid Psyche', 'astéroïde Psyché'], toKey: 'PsycheProbe',
    arr: '2029-08-01', arrLbl: ['Aug 2029', 'août 2029'],
    note: ['A metal-rich world that may be the core of a baby planet.', 'Un monde riche en métal, peut-être le cœur d’une planète en formation.'] },
  { key: 'Clipper', name: 'Europa Clipper', from: ['Florida, USA', 'Floride, États-Unis'], left: '2024-10-14', to: ['Jupiter (moon Europa)', 'Jupiter (lune Europe)'], toKey: 'Clipper',
    arr: '2030-04-11', arrLbl: ['Apr 2030', 'avr. 2030'],
    note: ['Will fly past Europa about 50 times to look at the ocean under its ice.', 'Survolera Europe une cinquantaine de fois pour étudier l’océan sous sa glace.'] },
  { key: null, name: 'Hayabusa2', from: ['Tanegashima, Japan', 'Tanegashima, Japon'], left: '2014-12-03', to: ['asteroid 1998 KY26', 'astéroïde 1998 KY26'], toKey: null,
    arr: '2031-07-01', arrLbl: ['Jul 2031', 'juil. 2031'],
    note: ['Flew past asteroid Torifune on 5 July 2026; swings by Earth in 2027 and 2028.', 'A survolé l’astéroïde Torifune le 5 juillet 2026 ; repasse près de la Terre en 2027 et 2028.'] },
  { key: 'Juice', name: 'Juice', from: ['Kourou, French Guiana', 'Kourou, Guyane'], left: '2023-04-14', to: ['Jupiter (moon Ganymede)', 'Jupiter (lune Ganymède)'], toKey: 'Juice',
    arr: '2031-07-01', arrLbl: ['Jul 2031', 'juil. 2031'],
    note: ['Will end up orbiting Ganymede, the biggest moon in the Solar System.', 'Finira en orbite autour de Ganymède, la plus grande lune du Système solaire.'] },
];

// ---------------------------------------------------------------- live data
const S = { status: 'idle', at: 0, docked: [], left: [], next: [] };
const DCACHE = 'msDock1', LCACHE = 'msLaunches3';
const LL = 'https://ll.thespacedevs.com/2.2.0/';
const getJSON = async u => { const r = await fetch(u); if (!r.ok) throw r.status; return r.json(); };

async function loadDocking() {
  try { const c = JSON.parse(localStorage.getItem(DCACHE) || 'null'); if (c && Date.now() - c.t < 60 * 6e4) return c.list; } catch (e) { }
  const j = await getJSON(LL + 'docking_event/?limit=40&ordering=-docking&mode=detailed');
  if (!j.results) throw 0;
  const list = j.results.map(x => {
    const fv = x.flight_vehicle || {}, sc = fv.spacecraft || {}, cfg = sc.spacecraft_config || {}, loc = x.docking_location || {};
    return { ship: sc.name || cfg.name || '?', type: cfg.name || '', agency: cfg.agency?.abbrev || cfg.agency?.name || '', img: cfg.image_url || '',
      docked: x.docking, left: x.departure, port: loc.name || '', station: loc.spacestation?.name || fv.destination || '', end: fv.mission_end || null };
  });
  try { localStorage.setItem(DCACHE, JSON.stringify({ t: Date.now(), list })); } catch (e) { }
  return list;
}
async function loadLaunchList() {
  try { const c = JSON.parse(localStorage.getItem(LCACHE) || 'null'); if (c && Date.now() - c.t < 3 * 3600e3) return c.list; } catch (e) { }
  // same format as the live launches panel, so both share one cache
  const j = await getJSON(LL + 'launch/upcoming/?limit=14&mode=normal');
  if (!j.results) throw 0;
  const list = j.results.map(x => ({ id: x.id, name: x.name, net: x.net, status: x.status?.abbrev || '', statusName: x.status?.name || '', rocket: x.rocket?.configuration?.full_name || '', lsp: x.launch_service_provider?.name || '',
    mission: x.mission?.name || '', desc: x.mission?.description || '', orbit: x.mission?.orbit?.name || '', pad: x.pad?.name || '', place: x.pad?.location?.name || '',
    lat: parseFloat(x.pad?.latitude), lon: parseFloat(x.pad?.longitude), webcast: x.webcast_live, image: typeof x.image === 'string' ? x.image : (x.image?.image_url || '') }));
  try { localStorage.setItem(LCACHE, JSON.stringify({ t: Date.now(), list })); } catch (e) { }
  return list;
}

async function load() {
  if (S.status === 'busy' || (S.status === 'ok' && Date.now() - S.at < 30 * 6e4)) return;
  S.status = 'busy'; refresh();
  const [dock, launches] = await Promise.allSettled([loadDocking(), loadLaunchList()]);
  const now = Date.now();
  if (dock.status === 'fulfilled') {
    const seen = new Set();
    // docked now: no departure yet, docked within the last 14 months (older open entries are stale)
    S.docked = dock.value.filter(d => !d.left && d.docked && now - Date.parse(d.docked) < 430 * DAY && Date.parse(d.docked) <= now)
      .filter(d => { const k = d.ship + d.station; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => STATION_KEY(a.station).localeCompare(STATION_KEY(b.station)) || Date.parse(b.docked) - Date.parse(a.docked));
    S.left = dock.value.filter(d => d.left && now - Date.parse(d.left) < 45 * DAY && Date.parse(d.left) <= now).sort((a, b) => Date.parse(b.left) - Date.parse(a.left)).slice(0, 5);
  }
  if (launches.status === 'fulfilled') {
    S.next = launches.value.filter(x => TO_STATION.test(x.name) || /iss|space station|tiangong/i.test(x.orbit + ' ' + x.desc.slice(0, 160)))
      .filter(x => Date.parse(x.net) > now - 6 * 3600e3).slice(0, 5);
  }
  S.status = dock.status === 'fulfilled' || launches.status === 'fulfilled' ? 'ok' : 'err';
  S.at = now; refresh();
}

// ---------------------------------------------------------------- the board
const date = (iso, F, withTime) => iso ? new Date(iso).toLocaleString(F ? 'fr-FR' : 'en-GB', withTime ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const days = (a, b) => Math.max(0, Math.floor((b - a) / DAY));
const pill = (txt, col) => `<span style="display:inline-block;padding:1px 7px;border-radius:9px;font-size:10.5px;font-weight:600;background:${col}22;color:${col};border:1px solid ${col}66;white-space:nowrap">${txt}</span>`;
const go = (key, txt) => key && (bodies[key] || special[key]) ? `<a href="#" data-go="${key}" style="color:#8fd0ff">${txt}</a>` : txt;
const row = (head, line2, status, bar) => `<div style="padding:7px 0;border-top:1px solid #ffffff1a">
  <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b style="font-size:13px">${head}</b>${status}</div>
  <div style="font-size:11.5px;opacity:.85;margin-top:2px;line-height:1.45">${line2}</div>${bar || ''}</div>`;
const H = t => `<div style="margin:12px 0 2px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.65">${t}</div>`;
const progress = f => `<div style="height:4px;border-radius:2px;background:#ffffff1a;margin-top:5px"><div style="height:4px;border-radius:2px;width:${Math.round(Math.min(1, Math.max(0, f)) * 100)}%;background:#7fc8ff"></div></div>`;

function card() {
  const F = fr(), now = Date.now(), A = '→';
  let h = `<div style="font-size:12px;opacity:.85">${t2(F, 'Like an airport board, for spaceships: who is docked at the space stations, who is on the way, and the probes travelling between worlds.', 'Comme un tableau d’aéroport, pour les vaisseaux : qui est amarré aux stations, qui arrive, et les sondes en route entre les mondes.')}</div>`;

  // --- stations
  h += H(t2(F, '🛬 Docked at the stations now', '🛬 Amarrés aux stations en ce moment'));
  if (S.status === 'busy' && !S.docked.length) h += `<div style="font-size:12px;opacity:.7;padding:6px 0">${t2(F, 'Loading live data…', 'Chargement des données en direct…')}</div>`;
  else if (S.status === 'err') h += `<div style="font-size:12px;opacity:.7;padding:6px 0">${t2(F, 'Live data is not available right now. Try again in a few minutes.', 'Données en direct indisponibles pour le moment. Réessayez dans quelques minutes.')}</div>`;
  else if (!S.docked.length) h += `<div style="font-size:12px;opacity:.7;padding:6px 0">—</div>`;
  for (const d of S.docked) {
    const si = shipInfo(d.ship + ' ' + d.type), stK = STATION_KEY(d.station), n = days(Date.parse(d.docked), now);
    h += row(`${esc(d.ship)} <span style="font-weight:400;opacity:.7">${A} ${go(stK, stationName(d.station, F))}</span>`,
      `${t2(F, 'From', 'Départ')} ${esc(t2(F, si[1], si[2]))} · ${t2(F, 'docked', 'amarré le')} ${date(d.docked, F)}${d.port ? ' · ' + esc(d.port) : ''}${d.end ? ` · ${t2(F, 'leaves about', 'repart vers le')} ${date(d.end, F)}` : ''}${si[3] ? `<br><span style="opacity:.75">${t2(F, 'At the end it', 'À la fin, il')} ${t2(F, si[3], si[4])}.</span>` : ''}`,
      pill(t2(F, `Docked · day ${n + 1}`, `Amarré · jour ${n + 1}`), '#6fdc8c'));
  }

  // --- next to a station
  if (S.next.length) {
    h += H(t2(F, '🛫 Next ships to a station', '🛫 Prochains départs vers une station'));
    for (const x of S.next) {
      const si = shipInfo(x.name), tk = TO_TIANGONG.test(x.name) ? 'Tiangong' : 'ISS', ms = Date.parse(x.net) - now;
      const st = /go/i.test(x.status) ? pill(t2(F, 'Go', 'Feu vert'), '#6fdc8c') : /tbd|tbc/i.test(x.status) ? pill(t2(F, 'Date to confirm', 'Date à confirmer'), '#f3c969') : pill(esc(x.status || '—'), '#9fb4c8');
      h += row(`${esc(x.name.split('|').pop().trim())} <span style="font-weight:400;opacity:.7">${A} ${go(tk, tk)}</span>`,
        `${esc(x.rocket)} ${t2(F, 'from', 'depuis')} ${esc(x.place || x.pad)} · ${date(x.net, F, true)}${ms > 0 ? ` (${t2(F, 'in', 'dans')} ${ms > DAY ? Math.round(ms / DAY) + t2(F, ' days', ' jours') : Math.round(ms / 3600e3) + ' h'})` : ''}<br><span style="opacity:.75">${t2(F, 'Docks', 'Amarrage')} ${t2(F, si[5], si[6])} ${t2(F, 'after launch', 'après le décollage')}.</span>`, st);
    }
  }

  // --- recently left
  if (S.left.length) {
    h += H(t2(F, '↩ Recently left', '↩ Partis récemment'));
    for (const d of S.left) {
      const si = shipInfo(d.ship + ' ' + d.type), stK = STATION_KEY(d.station);
      h += row(`${esc(d.ship)} <span style="font-weight:400;opacity:.7">${go(stK, stationName(d.station, F))} ${A} ${t2(F, 'Earth', 'Terre')}</span>`,
        `${t2(F, 'Stayed', 'Resté')} ${days(Date.parse(d.docked), Date.parse(d.left))} ${t2(F, 'days', 'jours')} · ${t2(F, 'left', 'parti le')} ${date(d.left, F)}${si[3] ? ` · ${t2(F, si[3], si[4])}` : ''}`,
        pill(t2(F, 'Departed', 'Parti'), '#9fb4c8'));
    }
  }

  // --- probes
  h += H(t2(F, '🌌 Between worlds', '🌌 Entre les mondes'));
  for (const p of PROBES) {
    const t0 = Date.parse(p.left), t1 = Date.parse(p.arr), here = p.done || now >= t1;
    const yrs = (t1 - now) / (365.25 * DAY), mo = Math.max(1, Math.round(yrs * 12));
    const left = yrs < 1 ? t2(F, `${mo} month${mo > 1 ? 's' : ''} to go`, `encore ${mo} mois`) : t2(F, `${(Math.round(yrs * 10) / 10)} years to go`, `encore ${String(Math.round(yrs * 10) / 10).replace('.', ',')} ans`);
    const status = here ? pill(t2(F, 'Arrived', 'Arrivé'), '#6fdc8c') : pill(`${t2(F, 'In flight', 'En vol')} · ${left}`, '#7fc8ff');
    h += row(`${go(p.key, esc(Array.isArray(p.name) ? t2(F, p.name[0], p.name[1]) : p.name))} <span style="font-weight:400;opacity:.7">${A} ${go(p.toKey, esc(t2(F, p.to[0], p.to[1])))}</span>`,
      `${t2(F, 'From', 'Départ')} ${esc(t2(F, p.from[0], p.from[1]))} · ${date(p.left, F)} · ${t2(F, here ? 'arrived' : 'arrives', here ? 'arrivée' : 'arrivée prévue')} ${esc(t2(F, p.arrLbl[0], p.arrLbl[1]))}<br><span style="opacity:.75">${esc(t2(F, p.note[0], p.note[1]))}</span>`,
      status, here ? '' : progress((now - t0) / (t1 - t0)));
  }
  h += `<div style="font-size:10.5px;opacity:.6;margin-top:8px">${t2(F, 'Station ships and launches: The Space Devs (Launch Library 2), updated live. Dates are in your own time zone. Probe arrival dates are the agencies’ plans and can move.', 'Vaisseaux et lancements : The Space Devs (Launch Library 2), en direct. Dates dans votre fuseau horaire. Les dates d’arrivée des sondes sont celles prévues par les agences et peuvent changer.')}</div>`;
  return h;
}

let focused = null;
function refresh() { if (focused === 'Departures') { INFO.Departures.fact = card(); if (SS.more.INFO_EN?.Departures) SS.more.INFO_EN.Departures.fact = INFO.Departures.fact; SS.onFocus('Departures'); } }

const R = PL.Earth.tilted.children[0].geometry.parameters.radius;
bodies.Departures = { obj: bodies.Earth.obj, radius: bodies.Earth.radius, view: R * 5 };
info('Departures', 'Departures & arrivals', 'Spaceships · live board', 'stations, ships and probes on the move', card());
{ const prev = SS.onFocus; SS.onFocus = key => { focused = key; if (key === 'Departures') { INFO.Departures.fact = card(); if (SS.more.INFO_EN?.Departures) SS.more.INFO_EN.Departures.fact = INFO.Departures.fact; } prev(key); }; }
special.Departures = () => { load(); flyTo('Departures'); };
document.addEventListener('click', e => { const a = e.target.closest?.('#info [data-go]'); if (!a || focused !== 'Departures') return; e.preventDefault(); const k = a.dataset.go; focusSel.value = k; SS.go(k); });
{ const prev = SS.setLang; if (prev) SS.setLang = (...a) => { const r = prev(...a); refresh(); return r; }; }

// menu entry and a button next to 🛰 Space stations (the phone layout moves it to Play)
{ const views = focusSel.querySelector('optgroup'), o = document.createElement('option'); o.value = 'Departures'; o.textContent = '🛸 Departures & arrivals';
  const after = views.querySelector('option[value="Stations"]'); after ? after.after(o) : views.appendChild(o); }
{ const sb = $('stationsBtn') || $('launchBtn'); if (sb) { const b = document.createElement('button'); b.type = 'button'; b.id = 'boardBtn'; b.textContent = '🛸 Departures';
  b.onclick = () => { focusSel.value = 'Departures'; SS.go('Departures'); }; sb.after(b); } }
SS.i18nAdd?.({ ui: { '🛸 Departures & arrivals': '🛸 Départs et arrivées', '🛸 Departures': '🛸 Départs' },
  name: { 'Departures & arrivals': 'Départs et arrivées' },
  cat: { 'Spaceships · live board': 'Vaisseaux · tableau en direct' },
  dist: { 'stations, ships and probes on the move': 'stations, vaisseaux et sondes en route' } });
if (new URLSearchParams(location.search).get('board')) setTimeout(() => { focusSel.value = 'Departures'; SS.go('Departures'); }, 1500);
SS.more.board = { load, PROBES, S };
