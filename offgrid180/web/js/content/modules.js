/* OFFGRID 180 — sections, modules and icon set. */
window.OG = window.OG || {};

/* Simple stroke icons (24x24, currentColor). */
OG.ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4"/><path d="M12 11v10"/>',
  drop: '<path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z"/>',
  med: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 6V4h6v2"/><path d="M12 10v6M9 13h6"/>',
  map: '<path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  grad: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/><path d="M22 9v6"/>',
  check: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 9l2 2 4-4"/><path d="M8 16h8"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  tent: '<path d="M2 20h20"/><path d="M4 20l8-14 8 14"/><path d="M10 4l2 2 2-2"/><path d="M9.5 20l2.5-5 2.5 5"/>',
  food: '<path d="M7 3v8a2 2 0 0 0 4 0V3"/><path d="M9 11v10"/><path d="M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
  fire: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-2 1-6 1-9z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  radio: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8l10-5"/><circle cx="15" cy="14" r="2.5"/><path d="M6 12h4M6 15h4"/>',
  shirt: '<path d="M8 3l-5 3 2 5 3-1v11h8V10l3 1 2-5-5-3c0 2-2 3-4 3s-4-1-4-3z"/>',
  soap: '<rect x="4" y="9" width="16" height="11" rx="3"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="4" r="1.5"/>',
  tool: '<path d="M14 6a4 4 0 0 0 5 5l2 2-8 8-2-2a4 4 0 0 0-5-5L3 11l8-8z"/>',
  cloud: '<path d="M7 18a5 5 0 0 1 0-10 6 6 0 0 1 11 2 4 4 0 0 1 0 8z"/><path d="M10 21l1-2M14 21l1-2"/>',
  clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/><path d="M8 10h8M8 14h8M8 18h5"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  leaf: '<path d="M5 19c0-9 6-15 15-15 0 9-6 15-15 15z"/><path d="M5 19l8-8"/>',
  siren: '<path d="M6 18V12a6 6 0 0 1 12 0v6"/><path d="M4 18h16v3H4z"/><path d="M12 2v2M3 7l1.5 1M21 7l-1.5 1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  speak: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  flash: '<path d="M9 2h6l-1 6h-4z"/><path d="M10 8h4v13h-4z"/>',
  battery: '<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4"/><path d="M5 10h6v4H5z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  pin: '<path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>'
};
OG.icon = function (name, cls) {
  return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (OG.ICONS[name] || OG.ICONS.box) + '</svg>';
};

/* The nine primary navigation sections. */
OG.SECTIONS = [
  { id: 'dashboard', name: 'Dashboard', icon: 'home', blurb: 'Survival command center.' },
  { id: 'library', name: 'Knowledge Library', icon: 'book', blurb: 'Searchable offline survival encyclopedia.' },
  { id: 'inventory', name: 'Equipment Inventory', icon: 'box', blurb: 'Catalog, your gear, condition, expiry and maintenance.' },
  { id: 'foodwater', name: 'Food & Water', icon: 'drop', blurb: '90–180 day calculators, water treatment, food, fuel.' },
  { id: 'medical', name: 'Medical Center', icon: 'med', blurb: 'First aid, medications, hygiene and mental health.' },
  { id: 'maps', name: 'Maps & Navigation', icon: 'map', blurb: 'GPS, compass, waypoints, comms, weather, wildlife.' },
  { id: 'training', name: 'Training Center', icon: 'grad', blurb: 'Courses, quizzes and skill assessments.' },
  { id: 'ops', name: 'Daily Operations', icon: 'check', blurb: 'Daily checklist, logs, maintenance and routines.' },
  { id: 'emergency', name: 'Emergency Center', icon: 'siren', blurb: 'SOS tools and emergency decision trees.' }
];

/* The 16 modules, each linked to the section where it lives. */
OG.MODULES = [
  { id: 'shelter', n: 1, name: 'Shelter & Camp Construction', icon: 'tent', section: 'ops', blurb: 'Site selection, construction, insulation, ventilation, weatherproofing and repairs.' },
  { id: 'water', n: 2, name: 'Water Collection & Purification', icon: 'drop', section: 'foodwater', blurb: 'Sourcing, filtration, disinfection, storage and daily needs.' },
  { id: 'food', n: 3, name: 'Food & Nutrition', icon: 'food', section: 'foodwater', blurb: 'Storage, calories, preservation safety, gardening, fishing and hunting safety.' },
  { id: 'medical', n: 4, name: 'Medical & First Aid', icon: 'med', section: 'medical', blurb: 'Bleeding, wounds, burns, fractures, cold and heat illness, medications, evacuation.' },
  { id: 'fire', n: 5, name: 'Fire & Heat Management', icon: 'fire', section: 'foodwater', blurb: 'Fire starting, cooking, heating, fuel, fire safety and carbon monoxide.' },
  { id: 'power', n: 6, name: 'Power & Energy', icon: 'bolt', section: 'inventory', blurb: 'Solar, batteries, charging, lighting and backup systems.' },
  { id: 'nav', n: 7, name: 'Navigation & Geography', icon: 'compass', section: 'maps', blurb: 'Map and compass, GPS, coordinates, terrain and route planning.' },
  { id: 'comms', n: 8, name: 'Communication & Rescue', icon: 'radio', section: 'maps', blurb: 'Radios, satellite messengers, SOS and distress signals.' },
  { id: 'clothing', n: 9, name: 'Clothing & Personal Protection', icon: 'shirt', section: 'inventory', blurb: 'Layering, footwear, waterproofing and repairs.' },
  { id: 'hygiene', n: 10, name: 'Hygiene & Sanitation', icon: 'soap', section: 'medical', blurb: 'Waste, handwashing, bathing, laundry and disease prevention.' },
  { id: 'tools', n: 11, name: 'Tools & Equipment', icon: 'tool', section: 'inventory', blurb: 'Cutting tools, maintenance, repairs and spare parts.' },
  { id: 'weather', n: 12, name: 'Weather & Environmental Hazards', icon: 'cloud', section: 'maps', blurb: 'Forecasting, storms, floods, extreme temperatures and smoke.' },
  { id: 'planning', n: 13, name: 'Survival Planning & Inventory', icon: 'clip', section: 'inventory', blurb: 'Supply tracking, rotation, depletion and the exit plan.' },
  { id: 'mental', n: 14, name: 'Mental Health & Psychology', icon: 'brain', section: 'medical', blurb: 'Isolation, sleep, stress, routines and decision-making.' },
  { id: 'wildlife', n: 15, name: 'Wildlife & Plant Identification', icon: 'leaf', section: 'maps', blurb: 'Dangerous animals, insects, tracks and plant safety.' },
  { id: 'emergency', n: 16, name: 'Emergency & Evacuation', icon: 'siren', section: 'emergency', blurb: 'Priorities, decision trees, evacuation and rescue preparation.' }
];
OG.moduleById = function (id) { return OG.MODULES.find(function (m) { return m.id === id; }); };
