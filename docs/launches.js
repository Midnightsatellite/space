// =====================================================================
// Upcoming launches (from NASA's launch schedule, 17 November 2026)
// =====================================================================
const SS = window.SS;
const $ = id => document.getElementById(id);
const { info, INFO } = SS.cosmos;
const UPDATED = ['17 Nov 2026', '17 nov. 2026'];
const LIST = [ // when (en, fr), name, what (en, fr), where to fly, exact date for a countdown
  ['No earlier than 29 Nov 2026', 'Pas avant le 29 nov. 2026', 'Northrop Grumman CRS-25', 'Cygnus cargo ship to the ISS', 'Cargo Cygnus vers l\'ISS', 'ISS', Date.UTC(2026, 10, 29)],
  ['Autumn 2026', 'Automne 2026', 'Progress 97 (Roscosmos)', 'Russian cargo ship to the ISS', 'Cargo russe vers l\'ISS', 'ISS'],
  ['Late 2026', 'Fin 2026', 'Griffin-1 (Astrobotic)', 'Robotic Moon lander', 'Atterrisseur lunaire robotisé', 'Moon'],
  ['2026', '2026', 'HTV-X2 (JAXA)', 'Japanese cargo ship to the ISS', 'Cargo japonais vers l\'ISS', 'ISS'],
  ['Under review', 'En cours d\'examen', 'Boeing Starliner-1', 'Crew capsule flight to the ISS', 'Capsule pour équipage vers l\'ISS', 'ISS'],
  ['Early 2027', 'Début 2027', 'IM-3 (Intuitive Machines)', 'Robotic Moon lander', 'Atterrisseur lunaire robotisé', 'Moon'],
  ['2027', '2027', 'Artemis III', 'Crewed docking test in orbit around Earth', 'Test d\'amarrage habité en orbite autour de la Terre', 'ArtemisAll'],
  ['2027', '2027', 'IM-4 (Intuitive Machines)', 'Robotic Moon lander', 'Atterrisseur lunaire robotisé', 'Moon'],
  ['2027', '2027', 'Blue Ghost Mission 2 (Firefly)', 'Robotic Moon lander', 'Atterrisseur lunaire robotisé', 'Moon'],
  ['2027', '2027', 'Blue Moon Mark 1 (Blue Origin)', 'Robotic Moon lander', 'Atterrisseur lunaire robotisé', 'Moon'],
  ['2027', '2027', 'SunRISE', 'Six small satellites listening to radio bursts from the Sun', 'Six petits satellites qui écoutent les sursauts radio du Soleil', 'Sun'],
  ['2028', '2028', 'Artemis IV', 'First Artemis Moon landing', 'Premier alunissage Artemis', 'ArtemisIV'],
];
function html() {
  const fr = SS.lang === 'fr', now = Date.now();
  const rows = LIST.map(([w, wf, name, what, whatf, go, at]) => {
    let when = fr ? wf : w;
    if (at) { const d = Math.ceil((at - now) / 864e5); if (d > 1) when += fr ? ` · dans ${d} jours` : ` · in ${d} days`; else if (d >= 0) when += fr ? ' · très bientôt' : ' · any moment now'; }
    return `<div class="ln" data-go="${go}" style="cursor:pointer;padding:4px 0;border-top:1px solid rgba(140,160,255,.15)"><span style="font-size:11px;color:#ffd27a">${when}</span><br><b style="display:inline;font-size:13px">🚀 ${name}</b> <span style="opacity:.75">· ${fr ? whatf : what}</span></div>`;
  }).join('');
  return `${fr ? 'Touchez une mission pour voir sa destination.' : 'Tap a mission to fly to where it is going.'}<div style="max-height:min(52vh,420px);overflow:auto;margin-top:4px">${rows}</div>
    <div style="font-size:11px;opacity:.6;margin-top:6px">${fr ? `D'après le calendrier de la NASA, au ${UPDATED[1]}. Les dates changent souvent :` : `From NASA's schedule, as of ${UPDATED[0]}. Dates often change:`} <a href="https://www.nasa.gov/event-type/launch-schedule/" target="_blank" rel="noopener" style="color:#ffd27a">${fr ? 'calendrier à jour ›' : 'latest schedule ›'}</a></div>`;
}
SS.bodies.Launches = { obj: SS.bodies.Earth.obj, radius: 1, view: 4.2 };
info('Launches', '🗓️ Upcoming launches', 'Launch schedule', 'from Earth to the ISS, the Moon and beyond', html());
{ const prev = SS.onFocus; SS.onFocus = key => {
    if (key === 'Launches') { INFO.Launches.fact = html(); if (SS.more.INFO_EN?.Launches) SS.more.INFO_EN.Launches.fact = INFO.Launches.fact; }
    prev(key);
    if (key !== 'Launches') return;
    for (const el of $('info').querySelectorAll('.ln')) el.onclick = () => { SS.focusSel.value = el.dataset.go; SS.go(el.dataset.go); };
  }; }
{ // menu: first entry of the launch sites group
  const og = [...SS.focusSel.querySelectorAll('optgroup')].find(g => g.label === '🚀 Launch sites & NASA');
  const o = document.createElement('option'); o.value = 'Launches'; o.textContent = '🗓️ Upcoming launches';
  og ? og.prepend(o) : SS.focusSel.appendChild(o);
}
SS.i18nAdd?.({ ui: { '🗓️ Upcoming launches': '🗓️ Prochains lancements' }, name: { '🗓️ Upcoming launches': '🗓️ Prochains lancements' },
  cat: { 'Launch schedule': 'Calendrier des lancements' }, dist: { 'from Earth to the ISS, the Moon and beyond': "de la Terre vers l'ISS, la Lune et au-delà" } });
await import('./fun.js' + new URL(import.meta.url).search);
