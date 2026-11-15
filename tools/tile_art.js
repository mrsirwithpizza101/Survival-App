/* Original flat illustrations for the home tiles (drawn for this app, no outside images).
   Each is a 160x96 scene. Edit freely: build_web.py inlines this file into the page. */
var TILE_ART=(function(){
function bg(id,a,b){return '<defs><linearGradient id="g'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs><rect width="160" height="96" fill="url(#g'+id+')"/>'}
function svg(x){return '<svg viewBox="0 0 160 96" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'+x+'</svg>'}
var A={};
A.map=svg(bg('map','#1d4ed8','#0ea5e9')+
 '<path d="M28 22 L58 14 L92 24 L130 14 L130 76 L92 86 L58 76 L28 84Z" fill="#e0f2fe"/><path d="M58 14 L58 76 M92 24 L92 86" stroke="#7dd3fc" stroke-width="2"/>'+
 '<path d="M30 60 C50 52 64 66 84 56 S118 44 128 50" stroke="#38bdf8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40 30 L52 42 M70 28 L80 40 M104 30 L116 40" stroke="#86efac" stroke-width="6" stroke-linecap="round"/>'+
 '<path d="M96 34 c0-10 18-10 18 0 c0 9-9 18-9 18 s-9-9-9-18z" fill="#facc15" stroke="#111" stroke-width="2"/><circle cx="105" cy="34" r="3.5" fill="#111"/>');
A.med=svg(bg('med','#991b1b','#ef4444')+
 '<circle cx="80" cy="48" r="32" fill="#fff"/><path d="M72 28h16v12h12v16H88v12H72V56H60V40h12z" fill="#dc2626"/>'+
 '<path d="M6 70 H40 L48 58 L56 82 L64 66 H96" stroke="#fecaca" stroke-width="3" fill="none" stroke-linejoin="round" opacity=".7"/>'+
 '<path d="M118 66 H154" stroke="#fecaca" stroke-width="3" opacity=".7"/>');
A.triage=svg(bg('tri','#3f0d12','#7f1d1d')+
 '<g transform="rotate(-12 50 50)"><rect x="24" y="24" width="34" height="50" rx="5" fill="#ef4444"/><circle cx="41" cy="32" r="3" fill="#3f0d12"/></g>'+
 '<g transform="rotate(-3 80 50)"><rect x="62" y="20" width="34" height="50" rx="5" fill="#facc15"/><circle cx="79" cy="28" r="3" fill="#3f0d12"/></g>'+
 '<g transform="rotate(8 112 50)"><rect x="98" y="22" width="34" height="50" rx="5" fill="#22c55e"/><circle cx="115" cy="30" r="3" fill="#3f0d12"/></g>'+
 '<path d="M30 70 h80" stroke="#fff" stroke-width="2" opacity=".25"/>');
A.water=svg(bg('wat','#0369a1','#22d3ee')+
 '<path d="M80 12 C80 12 56 42 56 56 a24 24 0 0 0 48 0 C104 42 80 12 80 12z" fill="#e0f2fe"/><path d="M68 58 a12 12 0 0 0 12 12" stroke="#7dd3fc" stroke-width="4" fill="none" stroke-linecap="round"/>'+
 '<path d="M0 80 q20-8 40 0 t40 0 t40 0 t40 0 V96 H0z" fill="#0c4a6e" opacity=".55"/><path d="M0 86 q20-8 40 0 t40 0 t40 0 t40 0 V96 H0z" fill="#082f49" opacity=".6"/>');
A.food=svg(bg('food','#c2410c','#fb923c')+
 '<ellipse cx="80" cy="74" rx="62" ry="10" fill="#7c2d12" opacity=".35"/>'+
 '<path d="M52 30 c16-12 36-2 34 16 c-2 14-18 22-30 16 l-10 12 a6 6 0 1 1-6-6 l10-10 c-8-8-6-20 2-28z" fill="#fde68a"/><path d="M58 36 c10-6 22 0 20 12" stroke="#f59e0b" stroke-width="3" fill="none"/>'+
 '<path d="M104 32 l10 44" stroke="#ea580c" stroke-width="12" stroke-linecap="round"/><path d="M104 30 l-6-12 M106 28 l2-14 M108 30 l10-10" stroke="#22c55e" stroke-width="4" stroke-linecap="round"/>'+
 '<rect x="122" y="44" width="22" height="32" rx="3" fill="#e5e7eb"/><rect x="122" y="52" width="22" height="12" fill="#ef4444"/>');
A.calc=svg(bg('calc','#0f766e','#2dd4bf')+
 '<rect x="56" y="12" width="48" height="72" rx="8" fill="#ecfeff"/><rect x="62" y="18" width="36" height="16" rx="3" fill="#134e4a"/><text x="94" y="31" font-size="11" font-family="monospace" fill="#5eead4" text-anchor="end">8</text>'+
 '<g fill="#14b8a6"><rect x="62" y="40" width="10" height="9" rx="2"/><rect x="75" y="40" width="10" height="9" rx="2"/><rect x="88" y="40" width="10" height="9" rx="2"/><rect x="62" y="53" width="10" height="9" rx="2"/><rect x="75" y="53" width="10" height="9" rx="2"/><rect x="88" y="53" width="10" height="22" rx="2" fill="#f59e0b"/><rect x="62" y="66" width="23" height="9" rx="2"/></g>'+
 '<path d="M124 30 c0 0-10 13-10 19 a10 10 0 0 0 20 0 c0-6-10-19-10-19z" fill="#cffafe"/>');
A.buy=svg(bg('buy','#b45309','#facc15')+
 '<path d="M50 38 c0-14 12-24 30-24 s30 10 30 24" stroke="#78350f" stroke-width="6" fill="none"/>'+
 '<rect x="40" y="34" width="80" height="54" rx="12" fill="#78350f"/><rect x="52" y="52" width="56" height="24" rx="6" fill="#92400e"/><path d="M80 34 v18" stroke="#451a03" stroke-width="3"/>'+
 '<rect x="70" y="58" width="20" height="6" rx="3" fill="#facc15"/>');
A.checklist=svg(bg('chk','#4338ca','#818cf8')+
 '<rect x="58" y="8" width="44" height="80" rx="9" fill="#1e1b4b"/><rect x="62" y="16" width="36" height="62" rx="3" fill="#e0e7ff"/>'+
 '<path d="M80 26 v26 M70 42 l10 10 l10-10" stroke="#4338ca" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="68" y="60" width="24" height="5" rx="2.5" fill="#4338ca"/>'+
 '<circle cx="128" cy="30" r="12" fill="#22c55e"/><path d="M122 30 l4 4 l8-8" stroke="#fff" stroke-width="3" fill="none"/>');
A.grid=svg(bg('grid','#0f172a','#334155')+
 '<circle cx="128" cy="20" r="8" fill="#e2e8f0" opacity=".9"/><circle cx="124" cy="18" r="8" fill="#1e293b"/>'+
 '<path d="M44 90 L52 20 L60 90 M40 30 H64 M42 44 H62" stroke="#94a3b8" stroke-width="3" fill="none"/><path d="M64 30 Q90 46 116 32" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="4 4"/>'+
 '<path d="M98 36 L86 58 H98 L90 80" stroke="#facc15" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M80 34 L112 82" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>'+
 '<rect x="118" y="62" width="12" height="20" rx="2" fill="#f1f5f9"/><path d="M124 62 q-4-6 0-12 q4 6 0 12" fill="#facc15"/>');
A.plan=svg(bg('plan','#6d28d9','#c084fc')+
 '<path d="M80 14 L124 46 V86 H36 V46Z" fill="#f5f3ff"/><path d="M80 10 L130 46" stroke="#4c1d95" stroke-width="6" stroke-linecap="round"/><path d="M80 10 L30 46" stroke="#4c1d95" stroke-width="6" stroke-linecap="round"/>'+
 '<g fill="#7c3aed"><circle cx="62" cy="56" r="6"/><rect x="55" y="63" width="14" height="20" rx="6"/><circle cx="80" cy="52" r="7"/><rect x="72" y="60" width="16" height="23" rx="7"/><circle cx="97" cy="60" r="5"/><rect x="91" y="66" width="12" height="17" rx="5"/></g>');
A.start=svg(bg('brief','#115e59','#14b8a6')+
 '<path d="M80 40 L64 90 M80 40 L96 90 M70 70 H90" stroke="#ccfbf1" stroke-width="4" fill="none"/><circle cx="80" cy="38" r="6" fill="#facc15"/>'+
 '<path d="M64 26 a22 22 0 0 0 0 24 M96 26 a22 22 0 0 1 0 24" stroke="#ccfbf1" stroke-width="4" fill="none" stroke-linecap="round"/>'+
 '<path d="M52 16 a36 36 0 0 0 0 44 M108 16 a36 36 0 0 1 0 44" stroke="#99f6e4" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>');
A.gun=svg(bg('sec','#292524','#78716c')+
 '<path d="M80 10 L114 22 V48 C114 68 98 82 80 88 C62 82 46 68 46 48 V22Z" fill="#e7e5e4"/><path d="M80 18 L106 27 V48 C106 63 94 74 80 80Z" fill="#d6d3d1"/>'+
 '<rect x="68" y="44" width="24" height="20" rx="4" fill="#44403c"/><path d="M73 44 v-6 a7 7 0 0 1 14 0 v6" stroke="#44403c" stroke-width="4" fill="none"/><circle cx="80" cy="53" r="3" fill="#facc15"/>');
A.library=svg(bg('lib','#a16207','#facc15')+
 '<rect x="30" y="20" width="16" height="62" rx="2" fill="#7c2d12"/><rect x="48" y="26" width="14" height="56" rx="2" fill="#1e3a8a"/><rect x="64" y="16" width="18" height="66" rx="2" fill="#14532d"/>'+
 '<g transform="rotate(14 98 50)"><rect x="88" y="20" width="16" height="62" rx="2" fill="#7f1d1d"/></g><rect x="112" y="30" width="16" height="52" rx="2" fill="#1f2937"/>'+
 '<path d="M24 84 H136" stroke="#422006" stroke-width="5" stroke-linecap="round"/><path d="M34 30 h8 M68 26 h10 M116 40 h8" stroke="#fde68a" stroke-width="2"/>');
A.fuel=svg(bg('fuel','#14532d','#22c55e')+
 '<rect x="34" y="26" width="40" height="58" rx="6" fill="#f0fdf4"/><rect x="40" y="34" width="28" height="16" rx="3" fill="#166534"/><path d="M74 40 h8 a6 6 0 0 1 6 6 v24 a5 5 0 0 0 10 0 V44 l-8-10" stroke="#f0fdf4" stroke-width="4" fill="none" stroke-linecap="round"/>'+
 '<rect x="106" y="34" width="28" height="44" rx="6" fill="#052e16"/><rect x="113" y="28" width="14" height="7" rx="2" fill="#052e16"/><path d="M122 42 L114 58 H121 L117 72 L128 54 H121 Z" fill="#facc15"/>');
return A})();
