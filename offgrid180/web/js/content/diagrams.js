/* Schematic instructional diagrams (inline SVG, theme-aware, work offline). */
window.OG = window.OG || {};
(function () {
  function svg(title, body, h) {
    return '<figure class="diagram"><svg viewBox="0 0 320 ' + (h || 200) + '" role="img" aria-label="' + title + '">' +
      '<title>' + title + '</title>' + body + '</svg><figcaption>' + title + '</figcaption></figure>';
  }
  function t(x, y, s, a) { return '<text x="' + x + '" y="' + y + '"' + (a ? ' text-anchor="' + a + '"' : '') + '>' + s + '</text>'; }

  OG.DIAGRAMS = {
    aframe: svg('Tarp A-frame on a ridgeline',
      '<line class="dl" x1="20" y1="60" x2="300" y2="60"/>' +
      '<line class="dl" x1="20" y1="60" x2="20" y2="170"/><line class="dl" x1="300" y1="60" x2="300" y2="170"/>' +
      '<polygon class="da" points="80,60 240,60 280,165 40,165" fill-opacity=".15"/>' +
      '<line class="da" x1="160" y1="60" x2="60" y2="165"/><line class="da" x1="160" y1="60" x2="260" y2="165"/>' +
      '<line class="dl" x1="10" y1="170" x2="310" y2="170"/>' +
      t(160, 50, 'Taut ridgeline (above head height)', 'middle') + t(40, 185, 'Stake corners low', 'start') + t(300, 185, 'Back to wind', 'end') +
      t(160, 120, 'Steep pitch sheds rain/snow', 'middle')),
    layers: svg('Clothing layer system',
      '<rect class="dl" x="20" y="30" width="80" height="140" rx="8"/><rect class="dl" x="120" y="30" width="80" height="140" rx="8"/><rect class="da" x="220" y="30" width="80" height="140" rx="8"/>' +
      t(60, 95, 'BASE', 'middle') + t(60, 115, 'wicks sweat', 'middle') + t(60, 132, 'wool/synthetic', 'middle') +
      t(160, 95, 'MID', 'middle') + t(160, 115, 'insulates', 'middle') + t(160, 132, 'fleece/down', 'middle') +
      t(260, 95, 'SHELL', 'middle') + t(260, 115, 'wind & rain', 'middle') + t(260, 132, 'vent it', 'middle') +
      t(160, 192, 'Avoid cotton next to skin in cold or wet conditions', 'middle'), 200),
    waterflow: svg('Water treatment sequence',
      '<rect class="dl" x="5" y="70" width="70" height="50" rx="6"/><rect class="dl" x="85" y="70" width="70" height="50" rx="6"/><rect class="dl" x="165" y="70" width="70" height="50" rx="6"/><rect class="da" x="245" y="70" width="70" height="50" rx="6"/>' +
      t(40, 92, 'SETTLE', 'middle') + t(40, 108, 'let silt drop', 'middle') +
      t(120, 92, 'PREFILTER', 'middle') + t(120, 108, 'cloth/coffee filter', 'middle') +
      t(200, 92, 'FILTER and/or', 'middle') + t(200, 108, 'DISINFECT', 'middle') +
      t(280, 92, 'STORE', 'middle') + t(280, 108, 'clean, covered', 'middle') +
      '<path class="dl" d="M75 95h10M155 95h10M235 95h10"/>' +
      t(160, 150, 'Boiling, chemical or UV kills microbes.', 'middle') + t(160, 168, 'None of these removes chemicals, fuel or heavy metals.', 'middle')),
    firelay: svg('Fire triangle and teepee lay',
      '<polygon class="dl" points="70,30 130,140 10,140"/>' + t(70, 160, 'HEAT', 'middle') + t(10, 90, 'FUEL', 'start') + t(130, 90, 'OXYGEN', 'end') +
      '<line class="da" x1="240" y1="40" x2="200" y2="150"/><line class="da" x1="240" y1="40" x2="280" y2="150"/><line class="da" x1="240" y1="40" x2="225" y2="150"/><line class="da" x1="240" y1="40" x2="258" y2="150"/>' +
      '<circle class="dl" cx="240" cy="135" r="10"/>' + t(240, 175, 'Tinder → kindling → fuel', 'middle') + t(240, 192, 'Clear 10 ft (3 m) around fire', 'middle'), 200),
    tourniquet: svg('Tourniquet placement (limb)',
      '<path class="dl" d="M30 90 Q160 60 290 90 L290 130 Q160 110 30 130 Z"/>' +
      '<rect class="da" x="120" y="70" width="18" height="60" rx="3"/>' + '<circle class="dl" cx="215" cy="108" r="9"/>' +
      t(129, 58, 'Tourniquet', 'middle') + t(215, 140, 'Wound', 'middle') +
      t(160, 165, '2–3 in (5–7 cm) above wound, toward the heart,', 'middle') + t(160, 182, 'not on a joint. Note the time applied.', 'middle'), 200),
    compass: svg('Taking a bearing with a baseplate compass',
      '<rect class="dl" x="110" y="20" width="100" height="170" rx="10"/><circle class="dl" cx="160" cy="120" r="40"/>' +
      '<path class="da" d="M160 20v-10M155 15l5-8 5 8"/><path class="da" d="M160 85l8 35h-16z"/>' +
      t(225, 30, '1 Point arrow at target', 'start') + t(225, 120, '2 Turn dial: N to', 'start') + t(225, 135, '   red needle', 'start') + t(225, 165, '3 Read bearing', 'start') + t(225, 180, '   at index line', 'start') +
      t(10, 120, 'Adjust for', 'start') + t(10, 135, 'declination', 'start'), 210),
    ground: svg('Ground-to-air distress symbols',
      '<path class="da" d="M30 40l30 70 30-70"/>' + t(60, 140, 'V', 'middle') + t(60, 158, 'Require assistance', 'middle') +
      '<path class="da" d="M130 40l60 70M190 40l-60 70"/>' + t(160, 140, 'X', 'middle') + t(160, 158, 'Require medical help', 'middle') +
      '<path class="da" d="M235 75h60M280 60l15 15-15 15"/>' + t(265, 140, '→', 'middle') + t(265, 158, 'Proceeding this way', 'middle') +
      t(160, 190, 'Make symbols large (10 ft / 3 m+) with high contrast', 'middle'), 200),
    solar: svg('Basic off-grid solar system',
      '<rect class="da" x="10" y="30" width="70" height="45"/><path class="da" d="M10 52h70M33 30v45M57 30v45"/>' + t(45, 92, 'Panels', 'middle') +
      '<rect class="dl" x="115" y="35" width="60" height="35" rx="4"/>' + t(145, 57, 'MPPT', 'middle') + t(145, 92, 'Charge ctrl', 'middle') +
      '<rect class="dl" x="115" y="120" width="60" height="45" rx="4"/>' + t(145, 147, 'Battery', 'middle') +
      '<rect class="dl" x="225" y="35" width="70" height="35" rx="4"/>' + t(260, 57, 'Inverter', 'middle') + t(260, 92, 'AC loads', 'middle') +
      '<rect class="dl" x="225" y="120" width="70" height="45" rx="4"/>' + t(260, 147, 'DC loads', 'middle') +
      '<path class="dl" d="M80 52h35M145 70v50M175 140h50M175 52h50"/>' + t(160, 190, 'Fuse every battery connection', 'middle'), 200),
    latrine: svg('Cathole and latrine placement',
      '<line class="dl" x1="10" y1="120" x2="310" y2="120"/>' +
      '<path class="da" d="M30 120c10-20 20-20 30 0"/>' + t(45, 145, 'Water', 'middle') +
      '<path class="dl" d="M250 120v30h20v-30"/>' + t(260, 168, '6–8 in deep', 'middle') + t(260, 182, '(15–20 cm)', 'middle') +
      '<path class="dl" d="M70 100h170" stroke-dasharray="6 4"/>' + t(155, 92, '≥ 200 ft (60 m) from water, camp, trails', 'middle') +
      '<rect class="dl" x="120" y="30" width="40" height="40"/>' + t(140, 25, 'Camp', 'middle'), 200),
    stop: svg('S.T.O.P. when lost',
      '<rect class="da" x="10" y="40" width="70" height="80" rx="8"/><rect class="dl" x="88" y="40" width="70" height="80" rx="8"/><rect class="dl" x="166" y="40" width="70" height="80" rx="8"/><rect class="dl" x="244" y="40" width="70" height="80" rx="8"/>' +
      t(45, 85, 'STOP', 'middle') + t(123, 85, 'THINK', 'middle') + t(201, 85, 'OBSERVE', 'middle') + t(279, 85, 'PLAN', 'middle') +
      t(160, 160, 'Stay put if anyone knows your plan.', 'middle'), 180),
    breathing: svg('Box breathing',
      '<rect class="da" x="90" y="30" width="140" height="140" rx="6"/>' +
      t(160, 22, 'Inhale 4', 'middle') + t(240, 105, 'Hold 4', 'start') + t(160, 190, 'Exhale 4', 'middle') + t(80, 105, 'Hold 4', 'end'), 200)
  };
})();
