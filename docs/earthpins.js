// =====================================================================
// One switch for the pins on the globe (launch sites, NASA centres, "Our Alien Earth" spots, Starship at Starbase),
// so Earth isn't crowded. Off at first; choosing one of these places in the menu switches it on.
// =====================================================================
const SS = window.SS;
const { bodies } = SS;
const special = SS.more.special, $ = id => document.getElementById(id);

const keys = Object.keys(bodies).filter(k => k.startsWith('LS_') || k.startsWith('AE_') || k === 'Starship');
const groups = new Set();
for (const k of keys) { const o = bodies[k].obj; groups.add(k.startsWith('LS_') ? o.parent : k === 'Starship' ? o.parent : o); }

const row = document.createElement('label'); row.innerHTML = '<span>Places on Earth</span> <input id="placesOn" type="checkbox">';
($('ilrsOn') ? $('ilrsOn').parentElement : $('labels').parentElement).before(row);
const box = $('placesOn');
const apply = () => { for (const g of groups) g.visible = box.checked; };
box.onchange = apply; apply();

const on = () => { if (!box.checked) { box.checked = true; apply(); } };
for (const k of keys) { const f = special[k]; special[k] = (...a) => { on(); return f ? f(...a) : SS.flyTo(k); }; }

SS.i18nAdd?.({ ui: { 'Places on Earth': 'Lieux sur Terre' }, name: { 'Places on Earth': 'Lieux sur Terre' } });
