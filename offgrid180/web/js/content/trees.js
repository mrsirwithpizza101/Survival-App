/* Emergency decision trees. Node: {q, o:[[label, nextId]]} or end node {end, a:[actions], sev:'sos'|'urgent'|'act', link}. */
window.OG = window.OG || {};
OG.TREES = [
{ id: 'medical', title: 'Medical emergency', icon: 'med', start: 's', nodes: {
  s: { q: 'Is the scene safe for you to help (no fire, traffic, falling objects, animals, water)?', o: [['Yes', 'b'], ['No', 'unsafe']] },
  unsafe: { end: 'Make the scene safe first', sev: 'urgent', a: ['Do not become a second patient.', 'Move away from the hazard or remove it if you can do so safely.', 'Then restart this guide.'] },
  b: { q: 'Is there severe bleeding (spurting, pooling, soaking through)?', o: [['Yes', 'bleed'], ['No', 'c']] },
  bleed: { end: 'Stop the bleeding NOW', sev: 'sos', link: 'med-bleeding', a: ['Firm direct pressure with both hands.', 'Limb: tourniquet 2–3 in above the wound if pressure fails; note the time.', 'Pack deep wounds with gauze and hold pressure.', 'Activate SOS on your satellite device/PLB.'] },
  c: { q: 'Is the person responsive and breathing normally?', o: [['Responsive and breathing', 'd'], ['Unresponsive but breathing', 'unresp'], ['Not breathing / only gasping', 'cpr']] },
  cpr: { end: 'Start CPR and call for help', sev: 'sos', a: ['Activate SOS / call 911 if any signal.', 'Push hard and fast in the center of the chest: 100–120 per minute, at least 2 in (5 cm) deep.', 'If trained, give 2 breaths after every 30 compressions; otherwise hands-only CPR.', 'Continue until help arrives or you are physically unable.'] },
  unresp: { end: 'Recovery position and SOS', sev: 'sos', a: ['Roll onto their side to keep the airway clear (if no suspected spine injury).', 'Keep warm and monitor breathing constantly.', 'Activate SOS.'] },
  d: { q: 'Any of: chest pain, trouble breathing, face/throat swelling, confusion, stroke signs (face droop, arm weakness, slurred speech), severe abdominal pain?', o: [['Yes', 'redflag'], ['No', 'e']] },
  redflag: { end: 'Life-threatening — get rescue', sev: 'sos', link: 'med-evac', a: ['Activate SOS and stay with the person.', 'Allergic reaction: use prescribed epinephrine auto-injector.', 'Keep them still, warm and comfortable; note times and symptoms.', 'Do not give food or drink if confused.'] },
  e: { q: 'Which best describes the problem?', o: [['Burn', 'burn'], ['Possible broken bone / sprain', 'bone'], ['Too cold / shivering / confused in cold', 'cold'], ['Too hot / heat exhaustion', 'heat'], ['Wound / possible infection', 'wound'], ['Bite or sting', 'bite'], ['Vomiting / diarrhea', 'gi']] },
  burn: { end: 'Burn care', sev: 'act', link: 'med-burns', a: ['Cool running water 10–20 minutes.', 'Remove rings/tight items; don\'t pop blisters.', 'Cover loosely with non-stick dressing.', 'Evacuate if larger than the palm, deep, on face/hands/feet/genitals/joints, electrical/chemical, or any breathing difficulty.'] },
  bone: { end: 'Splint and assess', sev: 'urgent', link: 'med-fractures', a: ['Check circulation, sensation, movement beyond the injury.', 'Splint in position found, joints above and below.', 'Bone through skin, femur/pelvis/spine, or loss of pulse → SOS.', 'Otherwise plan evacuation if you cannot care for yourself.'] },
  cold: { end: 'Hypothermia care', sev: 'urgent', link: 'med-cold', a: ['Get out of wind and wet; insulate from ground.', 'Replace wet clothes with dry.', 'If alert and shivering: warm sweet drinks, food.', 'No shivering, confused or unresponsive → SOS; handle gently.'] },
  heat: { end: 'Heat illness care', sev: 'urgent', link: 'med-heat', a: ['Move to shade; loosen clothing.', 'Cool with water and fanning.', 'Confused + hot skin = heatstroke → SOS, cool aggressively (immersion if possible).', 'Sip water only if fully alert.'] },
  wound: { end: 'Wound care', sev: 'act', link: 'med-wounds', a: ['Pressure to stop bleeding.', 'Irrigate with lots of clean water.', 'Dress and check daily.', 'Spreading redness, red streaks, pus or fever → evacuate.'] },
  bite: { end: 'Bite or sting', sev: 'urgent', link: 'wild-snakes-insects', a: ['Venomous snakebite: keep still and calm, remove rings, no cutting/sucking/tourniquet, evacuate.', 'Mammal bite: wash with soap and water 15 min; seek care for rabies assessment.', 'Swelling of face/throat or trouble breathing → epinephrine if prescribed, SOS.'] },
  gi: { end: 'Prevent dehydration', sev: 'act', link: 'hyg-waste', a: ['Oral rehydration: 1 L clean water + 6 level tsp sugar + ½ level tsp salt (WHO).', 'Small frequent sips.', 'Increase handwashing; check water treatment.', 'Blood in stool, high fever, can\'t keep fluids down >24 h, or confusion → evacuate.'] }
}},
{ id: 'water', title: 'Water contamination', icon: 'drop', start: 's', nodes: {
  s: { q: 'Is anyone sick (vomiting, diarrhea, cramps) after drinking?', o: [['Yes', 'sick'], ['No', 'b']] },
  sick: { end: 'Treat illness, stop the source', sev: 'urgent', link: 'hyg-waste', a: ['Stop using the suspect water now.', 'Rehydrate with treated or stored water / ORS.', 'Severe or bloody diarrhea, high fever or confusion → evacuate.', 'Then continue below to fix the water.'] },
  b: { q: 'What kind of contamination do you suspect?', o: [['Germs (animals, sewage, cloudy, flooding)', 'germs'], ['Chemicals (fuel, oily sheen, odd smell, mining/farm runoff)', 'chem'], ['Not sure', 'unsure']] },
  germs: { end: 'Disinfect before every use', sev: 'act', link: 'water-boil', a: ['Settle and pre-filter cloudy water.', 'Boil 1 min (3 min above 6,500 ft), or bleach 8 drops 6% per gallon and wait 30 min, or filter + disinfect.', 'Sanitize containers.', 'Move collection upstream and away from latrines/animals.'] },
  chem: { end: 'Do not drink — change source', sev: 'urgent', link: 'water-sources', a: ['Boiling and bleach do not remove chemicals; boiling concentrates them.', 'Switch to stored water and rain catchment.', 'Ration effort to reduce water need.', 'If no safe source within your stored supply → plan evacuation.'] },
  unsure: { end: 'Treat as both', sev: 'urgent', a: ['Use stored water first.', 'For new water: choose a different source, then filter AND disinfect.', 'Avoid any water with odor, sheen or nearby chemical sources.'] }
}},
{ id: 'food', title: 'Food shortage', icon: 'food', start: 's', nodes: {
  s: { q: 'How many days of food remain at your normal intake?', o: [['More than 14', 'a'], ['3–14', 'b'], ['Under 3', 'c']] },
  a: { end: 'Adjust early', sev: 'act', link: 'plan-inventory', a: ['Recount inventory and enter it.', 'Reduce waste; protect from pests/spoilage.', 'Start supplementing: fishing/hunting (legal), garden, foraging only with 100% ID.', 'Decide exit/resupply date before reserve is reached.'] },
  b: { end: 'Ration and plan exit/resupply', sev: 'urgent', link: 'plan-exit', a: ['Cut exertion: do essential work only, in cool hours.', 'Ration evenly; prioritize calories with fat and protein.', 'Keep drinking normally.', 'Arrange resupply or schedule exit while you still have energy to travel.'] },
  c: { end: 'Leave or call for help', sev: 'sos', link: 'plan-exit', a: ['Exit now while you can travel safely, or request rescue/resupply.', 'Keep warm and hydrated; rest.', 'Do not eat unknown plants or mushrooms.'] }
}},
{ id: 'shelter', title: 'Shelter damage', icon: 'tent', start: 's', nodes: {
  s: { q: 'Is the structure at risk of collapse or is there an immediate hazard (fire, tree, flooding)?', o: [['Yes', 'out'], ['No', 'b']] },
  out: { end: 'Get out and get safe', sev: 'urgent', a: ['Leave the structure with essentials (go-bag, sleeping bag, light).', 'Move to a safe spot away from trees and water.', 'Set an emergency tarp shelter and insulate from ground.'] },
  b: { q: 'Is the weather cold, wet or windy now?', o: [['Yes', 'cold'], ['No', 'repair']] },
  cold: { end: 'Protect from exposure first', sev: 'urgent', link: 'shelter-build', a: ['Get dry and windproof immediately: tarp, space blanket, vehicle.', 'Change into dry clothes, get into sleeping bag on a pad.', 'Hot drink and food.', 'Repair when weather allows.'] },
  repair: { end: 'Repair systematically', sev: 'act', link: 'shelter-insulation', a: ['Patch holes with tape/patches; replace broken stakes/poles.', 'Re-tension guy-lines; clear snow load.', 'Dig drainage trenches if water is entering.', 'Log the repair and restock the repair kit.'] }
}},
{ id: 'fire', title: 'Fire emergency', icon: 'fire', start: 's', nodes: {
  s: { q: 'What is burning?', o: [['Clothing on a person', 'cloth'], ['Small fire (pan, trash, small area)', 'small'], ['Shelter/structure or spreading fire', 'big'], ['Wildfire nearby / smoke approaching', 'wild']] },
  cloth: { end: 'Stop, Drop and Roll', sev: 'urgent', link: 'med-burns', a: ['Stop, drop and roll, or smother with a blanket.', 'Cool burns with water 10–20 min.', 'Check burn evacuation criteria.'] },
  small: { end: 'Extinguish if safe', sev: 'act', link: 'fire-heat', a: ['Grease fire: cover with lid/fire blanket; never water.', 'Use extinguisher (PASS) with an exit behind you.', 'If it grows, leave and let it go.'] },
  big: { end: 'Get out', sev: 'sos', a: ['Leave immediately with no delay for belongings.', 'Stay low under smoke.', 'Do not re-enter.', 'Treat injuries; call/SOS if anyone is hurt or fire may spread to forest.'] },
  wild: { end: 'Evacuate early', sev: 'sos', link: 'wx-flood', a: ['Leave now by your planned route away from the fire, not uphill toward it.', 'Wear N95, long sleeves, boots.', 'Notify your contact; SOS if trapped.', 'If trapped: seek a large cleared area, body of water or rock area; lie low, cover skin.'] }
}},
{ id: 'weather', title: 'Severe weather', icon: 'cloud', start: 's', nodes: {
  s: { q: 'What is happening?', o: [['Thunder / lightning', 'lightning'], ['Rising water / flash flood', 'flood'], ['High wind', 'wind'], ['Blizzard / extreme cold', 'cold'], ['Extreme heat', 'heat']] },
  lightning: { end: 'Lightning safety', sev: 'urgent', link: 'wx-storms', a: ['Get into a building or hard-topped vehicle.', 'Otherwise leave ridges, open ground, water and lone trees.', 'Wait 30 minutes after the last thunder.'] },
  flood: { end: 'Move to high ground now', sev: 'sos', link: 'wx-flood', a: ['Climb to higher ground immediately; leave gear.', 'Never cross moving water — 6 in can knock you down.', 'Signal for help if stranded.'] },
  wind: { end: 'Secure and shelter', sev: 'urgent', a: ['Move away from trees that could fall.', 'Lower or secure the shelter; stake extra guy-lines.', 'Shelter in a vehicle or low protected spot.'] },
  cold: { end: 'Consolidate warmth', sev: 'urgent', link: 'med-cold', a: ['Stay in shelter; reduce to one insulated space.', 'Eat more, drink warm fluids.', 'Ventilate any heater; CO alarm on.', 'Watch for hypothermia and frostbite.'] },
  heat: { end: 'Stay cool', sev: 'urgent', link: 'med-heat', a: ['Rest in shade during the hottest hours.', 'Drink regularly; use electrolytes.', 'Watch for heat exhaustion/heatstroke.'] }
}},
{ id: 'equipment', title: 'Equipment failure', icon: 'tool', start: 's', nodes: {
  s: { q: 'Is the failed item life-critical (water treatment, heat, shelter, light, communication, medical)?', o: [['Yes', 'crit'], ['No', 'non']] },
  crit: { q: 'Do you have a spare or alternate method?', o: [['Yes', 'alt'], ['No', 'none']] },
  alt: { end: 'Switch and restore redundancy', sev: 'act', link: 'tools-maint', a: ['Switch to the spare/alternate now.', 'Mark the failure in Inventory.', 'Attempt repair with the repair kit.', 'You now have a single point of failure — plan a replacement.'] },
  none: { end: 'Improvise safely, plan replacement', sev: 'urgent', a: ['Water: boil instead of filtering, or use bleach/tablets.', 'Heat: consolidate living space, add insulation, eat more.', 'Light: use phone flashlight sparingly; daylight schedule.', 'If you can\'t safely replace the function → plan exit.'] },
  non: { end: 'Repair or log it', sev: 'act', a: ['Repair when convenient.', 'Update Inventory condition.', 'Add to replacement list.'] }
}},
{ id: 'power', title: 'Power failure', icon: 'bolt', start: 's', nodes: {
  s: { q: 'Is any medical device or critical communication dependent on power?', o: [['Yes', 'crit'], ['No', 'b']] },
  crit: { end: 'Protect critical loads', sev: 'urgent', a: ['Disconnect all non-essential loads.', 'Use power banks for the critical device and radio.', 'Plan evacuation if the medical device will run out.'] },
  b: { q: 'Where is the problem?', o: [['No charge from panels', 'panel'], ['Battery dead or not holding charge', 'batt'], ['Inverter/output not working', 'inv']] },
  panel: { end: 'Check the solar side', sev: 'act', link: 'power-solar', a: ['Clean snow/dust and remove shade.', 'Check connectors and fuses/breakers.', 'Measure panel voltage with multimeter.', 'Check charge controller error codes.'] },
  batt: { end: 'Check the battery', sev: 'act', link: 'power-battery', a: ['Check for loose or corroded terminals (insulated tools).', 'Lithium in cold may refuse to charge — warm it gently.', 'Swollen/hot battery: disconnect and move outside if safe.', 'Reduce load until charge recovers.'] },
  inv: { end: 'Check output', sev: 'act', a: ['Reset inverter; check overload/low-voltage shutdown.', 'Run DC/USB loads directly from battery or power bank.'] }
}},
{ id: 'lost', title: 'Getting lost', icon: 'compass', start: 's', nodes: {
  s: { q: 'STOP: sit down, drink, eat. Do you know the last point where you were sure of your location?', o: [['Yes, and I can see the way back', 'back'], ['Roughly', 'rough'], ['No', 'stay']] },
  back: { end: 'Retrace carefully', sev: 'act', link: 'nav-lost', a: ['Return to the last known point on the same route.', 'Mark your trail as you go.', 'Use My Position to check coordinates against saved waypoints.'] },
  rough: { q: 'Is there enough daylight (2+ hours) and good weather?', o: [['Yes', 'try'], ['No', 'stay']] },
  try: { end: 'Navigate to a handrail', sev: 'urgent', link: 'nav-compass', a: ['Check GPS position vs. camp waypoint (Maps → Waypoints shows bearing and distance).', 'Use a compass bearing toward a large handrail (road, river, ridge).', 'Set a turnaround time; if it passes, stop and shelter.'] },
  stay: { end: 'Stay put and signal', sev: 'urgent', link: 'comms-signals', a: ['Stay where you are, especially if someone knows your plan.', 'Build shelter and insulation before dark.', 'Signal: 3 whistle blasts, mirror, bright colors, SOS light.', 'Activate SOS if injured, in danger or exposed.'] }
}},
{ id: 'wildlife', title: 'Wildlife encounter', icon: 'leaf', start: 's', nodes: {
  s: { q: 'What animal?', o: [['Bear', 'bear'], ['Cougar / mountain lion', 'cougar'], ['Moose / elk / bison', 'moose'], ['Snake', 'snake'], ['Animal acting sick or aggressive (rabies risk)', 'rabid']] },
  bear: { q: 'What is the bear doing?', o: [['Unaware / distant', 'bear1'], ['Approaching or charging', 'bear2'], ['Physically attacking', 'bear3']] },
  bear1: { end: 'Leave quietly', sev: 'act', link: 'wild-bears', a: ['Back away slowly; don\'t run.', 'Give it space; detour widely.', 'Secure food when back at camp.'] },
  bear2: { end: 'Stand ground, prepare spray', sev: 'urgent', link: 'wild-bears', a: ['Don\'t run. Talk calmly, stay together.', 'Spray at 30–60 ft aimed at the bear.', 'Many charges are bluffs.'] },
  bear3: { q: 'Type of bear?', o: [['Brown/grizzly (defensive surprise)', 'grizzly'], ['Black bear', 'black'], ['Unsure', 'unsureb']] },
  grizzly: { end: 'Play dead', sev: 'sos', a: ['Lie flat on your stomach, hands behind neck, legs apart; keep pack on.', 'Stay still until the bear leaves.', 'If attack continues (predatory), fight back hard.', 'SOS for injuries.'] },
  black: { end: 'Fight back', sev: 'sos', a: ['Fight back with anything: rocks, sticks, fists, aim at face.', 'Use bear spray.', 'SOS for injuries.'] },
  unsureb: { end: 'Judge the attack type', sev: 'sos', link: 'wild-bears', a: ['Surprise/defensive attack (you startled it, cubs or food nearby): play dead — flat on stomach, hands behind neck.', 'Stalking, follows you, or attacks your tent at night (predatory): fight back hard regardless of species.', 'Use bear spray if you can.', 'SOS for injuries.'] },
  cougar: { end: 'Appear big; fight if attacked', sev: 'urgent', a: ['Don\'t run or turn your back.', 'Make yourself large, shout, throw objects.', 'Back away slowly.', 'If attacked, fight back; stay on your feet.'] },
  moose: { end: 'Give space', sev: 'urgent', a: ['Back away; put a tree or vehicle between you.', 'If a moose charges, run and get behind something solid.', 'If knocked down, curl up and protect your head.'] },
  snake: { end: 'Back away', sev: 'act', link: 'wild-snakes-insects', a: ['Step back slowly beyond striking distance (more than its length).', 'Don\'t try to kill or move it.', 'If bitten: still, calm, remove rings, evacuate.'] },
  rabid: { end: 'Avoid and protect', sev: 'urgent', a: ['Leave the area.', 'Any bite or scratch: wash 15 min with soap and water, then medical care for rabies.', 'Report to wildlife authorities when possible.'] }
}},
{ id: 'evac', title: 'Evacuation', icon: 'siren', start: 's', nodes: {
  s: { q: 'Is there an immediate threat to life (fire, flood, medical crisis, structural collapse)?', o: [['Yes', 'now'], ['No', 'b']] },
  now: { end: 'Leave now', sev: 'sos', link: 'emerg-evac', a: ['Grab go-bag, meds, phone/messenger.', 'Take the safest planned route.', 'Notify your contact / SOS if you need rescue.'] },
  b: { q: 'Have any exit triggers been reached (supplies below reserve, worsening illness, shelter loss, official evacuation order, mental health decline)?', o: [['Yes', 'plan'], ['No', 'ready']] },
  plan: { end: 'Plan an orderly exit', sev: 'urgent', link: 'plan-exit', a: ['Pick a departure time with good weather and daylight.', 'Pack go-bag and essentials; secure camp.', 'Send route and ETA to your contact.', 'Travel with your SOS device accessible.'] },
  ready: { end: 'Stay ready', sev: 'act', a: ['Check go-bag and routes this week.', 'Review exit triggers.', 'Keep vehicle reserve fuel untouched.'] }
}}
];
