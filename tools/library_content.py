# Offline Survival Library content. Edit here, then run: python3 tools/library_content.py
# It rewrites the LIBRARY block inside web/index.src.html.
import json, re

G = []  # guides: (topic, title, html)
def g(topic, title, *paras):
    G.append({'t': topic, 'h': title, 'b': ''.join(paras)})
def ul(*items): return '<ul>' + ''.join('<li>%s</li>' % i for i in items) + '</ul>'
def p(x): return '<p>%s</p>' % x

# ---------------- WATER ----------------
g('Water', 'Ranking water sources',
  p('Use the cleanest source you can reach, and treat everything that is not sealed bottled or tap water you trust.'),
  ul('<b>Best:</b> stored tap water, water heater tank, sealed bottled water.',
     '<b>Good:</b> rainwater from a clean roof or tarp (skip the first few minutes of runoff), springs, fast-moving streams.',
     '<b>Last resort:</b> ponds, lakes, slow streams. Let silt settle, pre-filter through cloth, then treat.',
     '<b>Never drink:</b> floodwater, pool or hot-tub water, radiator water, or anything that may contain fuel or chemicals. Filters and bleach do not remove chemicals.'))
g('Water', 'Every way to make water safe',
  ul('<b>Boil:</b> a rolling boil for 1 minute (3 minutes above 6,500 ft). Kills all germs.',
     '<b>Bleach:</b> 8 drops of plain 6% bleach per gallon of clear water (16 if cloudy). Wait 30 minutes.',
     '<b>Hollow-fiber filter</b> (Sawyer, LifeStraw): removes bacteria and parasites but <i>not viruses</i>. For questionable water, filter and then add bleach.',
     '<b>Tablets</b> (chlorine dioxide): follow the label. Some parasites need up to 4 hours.',
     '<b>Sunlight (SODIS):</b> fill clear plastic bottles of 2 liters or less with clear water and lay them in full sun for 6 hours (2 days if cloudy). Use this only when nothing else is available.'),
  p('Pre-filter cloudy water through a T-shirt or coffee filter first. All methods work better on clear water.'))
g('Water', 'Collecting rainwater',
  ul('Use food-grade containers with lids. Trash cans and paint buckets can leach chemicals.',
     'Divert the first flush of runoff, since it carries roof dirt and bird droppings.',
     'Cover containers with screen or cloth to keep out mosquitoes and debris.',
     'Treat rainwater before drinking, like any other untreated source.',
     'Check your state\'s rules on rain collection. Most allow it, and some limit quantity.'))
g('Water', 'Storing water long term',
  ul('Plan on 1 gallon per person per day. Two weeks is the minimum, and longer is better.',
     'Swap out self-filled containers every 6 months. Commercially sealed water lasts years.',
     'Store containers off concrete, out of sun, and away from gasoline or chemicals.',
     'A 55-gallon drum holds about 2 months of drinking water for one person. You\'ll need a siphon or pump.'))

# ---------------- FIRE ----------------
g('Fire & heat', 'Building a fire that lights',
  p('Fire needs heat, fuel and air. Most failures come from wet fuel or starting too big.'),
  ul('<b>Tinder:</b> dry grass, cotton balls with petroleum jelly, dryer lint, birch bark, fatwood shavings.',
     '<b>Kindling:</b> pencil-thin dry sticks, then thumb-thick ones.',
     '<b>Fuel:</b> wrist-thick dead wood that snaps cleanly. Wood that bends is too wet.',
     'Build a small teepee of kindling over the tinder, light it from the upwind side, and add wood gradually.',
     '<b>Ferro rod:</b> hold the striker still and pull the rod back so sparks land in the tinder without scattering it.'),
  p('Check burn bans. Clear 10 ft around the fire, keep water nearby, and drown it, stir it and feel for heat before you leave.'))
g('Fire & heat', 'Staying warm without power',
  ul('Pick one small room and close it off. Hang blankets over doors and windows.',
     'Dress in layers: a synthetic or wool base, a fleece or down middle, and a wind- or waterproof shell. Cotton loses warmth when wet.',
     'Wear a hat, eat calories and drink warm fluids.',
     'Put insulation <i>under</i> you when you sleep. The ground or floor steals the most heat.',
     '<b>Never</b> use grills, camp stoves, generators or outdoor propane heaters indoors. Carbon monoxide kills silently. Use a battery CO alarm.',
     'Only use an indoor-rated heater (for example "Mr. Heater Buddy" style), with ventilation and a CO alarm, and follow the label.'))

# ---------------- SHELTER ----------------
g('Shelter', 'Shelter priorities outdoors',
  ul('Get out of wind and wet first. Exposure kills faster than hunger.',
     'Use what exists: a car, a building or a rock overhang, before you build anything.',
     'Tarp A-frame: tie a ridgeline between two trees at chest height, drape the tarp over it, and stake the edges low on the windward side.',
     'Avoid dry creek beds (flash floods), lone tall trees (lightning) and dead branches overhead.',
     'Insulate from the ground with a pad, pine boughs or a thick pile of leaves.'))
g('Shelter', 'Stuck in a car in winter',
  ul('Stay with the car. It is easier to find than a person.',
     'Run the engine about 10 minutes each hour for heat, and keep the exhaust pipe clear of snow to prevent CO poisoning.',
     'Crack a downwind window slightly. Turn on the dome light at night so rescuers can see you.',
     'Keep a car kit: blankets, water, snacks, a shovel, a flashlight, a phone charger and cat litter or sand for traction.'))

# ---------------- FOOD ----------------
g('Food', 'Storing food for 90+ days',
  ul('Aim for about 2,000 calories per adult per day. That is roughly 180,000 calories per person for 90 days.',
     'Staples: white rice, dried beans and lentils, oats, pasta, flour, sugar, salt, oil, powdered milk, canned meat and vegetables, and peanut butter.',
     'Store food cool, dark and dry. Mylar bags with oxygen absorbers inside buckets keep rice and beans 20+ years. Don\'t add absorbers to sugar or salt.',
     'Rotate: eat the oldest first, and buy what your household actually eats.',
     'Add vitamins, spices and comfort foods. Morale matters on long timelines.'))
g('Food', 'Home canning safely',
  ul('Use tested recipes only (USDA Complete Guide to Home Canning, or Ball). Botulism from bad canning can kill.',
     '<b>Low-acid foods</b> (vegetables, beans, meat, soups) must be <b>pressure canned</b>. Water-bath canning is only for high-acid foods like fruit, jams and pickles.',
     'Adjust time and pressure for your altitude.',
     'Discard any jar with a bulging lid, leaks, spurting liquid or a bad smell. Do not taste it.'))
g('Food', 'Growing food fast',
  ul('Fast crops: radishes (~30 days), lettuce and greens (30–45), bush beans (~55), zucchini (~50).',
     'Calorie crops: potatoes, winter squash, dry beans and corn.',
     'Store non-hybrid (open-pollinated) seeds in a cool, dry place. You can save seed from their harvest.',
     'Containers on a sunny porch work. 6+ hours of sun is ideal.'))
g('Food', 'Wild food: read this first',
  p('<b>Never eat a wild plant or mushroom unless you are 100% sure what it is.</b> Deadly look-alikes are common. Water hemlock and death cap mushrooms kill. Apps and the "edibility test" are not reliable.'),
  ul('Fish and game provide far more calories than foraging. Follow your state\'s fishing and hunting licenses and seasons.',
     'Learn 3–5 easy, safe local plants from an in-person class or a trusted regional field guide before you need them.',
     'Cook all wild meat and fish thoroughly.'))

# ---------------- MEDICAL ----------------
g('Medical', 'Cleaning and closing wounds',
  ul('Stop the bleeding first with firm pressure.',
     'Rinse the wound with lots of clean (boiled and cooled, or bottled) water. Irrigating with a squeeze bottle works best.',
     'Remove visible dirt. Cover with a clean dressing and change it daily or whenever it gets wet.',
     'Don\'t tightly close dirty, deep or bite wounds. Trapped bacteria cause serious infection.',
     '<b>Infection warning signs:</b> spreading redness, red streaks, pus, increasing pain, or fever. Get medical care.',
     'Keep tetanus shots current. A booster is needed every 10 years, or 5 years for a dirty wound.'))
g('Medical', 'Broken bones, sprains and splints',
  ul('Splint a suspected fracture in the position you found it, and include the joint above and below the break.',
     'Pad the splint. Sticks, rolled magazines or a SAM splint work, tied with cloth strips.',
     'Check fingers or toes for color, warmth and feeling before and after splinting. Loosen it if they turn pale, blue or numb.',
     '<b>Sprains:</b> rest, ice wrapped in cloth for 20 minutes at a time, light compression, and elevate.',
     'An open fracture (bone through skin), a deformed limb with no pulse, or a suspected neck or back injury needs emergency care. Don\'t move a possible spine injury unless there is danger.'))
g('Medical', 'Allergic reactions and anaphylaxis',
  ul('<b>Signs of anaphylaxis:</b> trouble breathing, swelling of the face or throat, hives with dizziness, or vomiting after a sting or food.',
     'Use the person\'s epinephrine auto-injector (EpiPen) in the outer thigh right away, then call 911.',
     'A second dose may be needed after 5–15 minutes if there is no improvement and a second injector is available.',
     'Antihistamines help hives but do <b>not</b> replace epinephrine for anaphylaxis.'))
g('Medical', 'Bites and stings',
  ul('<b>Snakebite:</b> keep calm and still, remove rings, and keep the limb at about heart level. Get to a hospital. Do <b>not</b> cut, suck, ice or use a tourniquet.',
     '<b>Bee sting:</b> scrape the stinger out, wash and cool it. Watch for anaphylaxis.',
     '<b>Ticks:</b> grip close to the skin with tweezers and pull straight out. Watch for a rash or fever over the next weeks.',
     '<b>Animal bites:</b> wash with soap and water for 15 minutes. Rabies risk means medical care is needed.'))
g('Medical', 'Cold injuries: frostbite and hypothermia',
  ul('<b>Frostbite:</b> numb, white or gray, waxy skin. Don\'t rub it. Rewarm in warm (not hot) water only if it won\'t refreeze.',
     '<b>Hypothermia:</b> shivering, confusion, clumsiness. Remove wet clothes, insulate the person from the ground, warm the core and give warm sweet drinks if fully alert.',
     'Severe hypothermia (shivering has stopped, very drowsy): handle gently and get help urgently.'))
g('Medical', 'Seizures, diabetes and shock',
  ul('<b>Seizure:</b> move hard objects away, cushion the head, and don\'t put anything in the mouth. Time it. Call 911 if it lasts over 5 minutes.',
     '<b>Low blood sugar</b> (shaky, sweaty, confused diabetic who can swallow): give sugar such as juice, regular soda or glucose tabs, then food.',
     '<b>Shock</b> (pale, cold, clammy, fast pulse after injury): lay the person flat, keep them warm, control bleeding and get help.'))
g('Medical', 'Medications in a long emergency',
  ul('Ask your doctor about a 90-day supply of essential prescriptions.',
     'Store medications cool and dry. Insulin can be kept cool without power using evaporative cooling pouches.',
     'Keep a written list of each person\'s medications, doses, allergies and conditions.',
     'Don\'t use fish or veterinary antibiotics on people. The wrong drug or dose can be dangerous.'))
g('Medical', 'Stress, sleep and kids',
  ul('Keep routines for meals, sleep and small chores. Routine lowers stress for everyone, especially kids.',
     'Limit doom-scrolling. Check official sources at set times.',
     'Talk to kids honestly at their level, and give them jobs. Feeling useful helps.',
     'Watch for people withdrawing, not sleeping or talking about hopelessness. Stay connected. In the U.S., call or text 988 for crisis support when phones work.'))

# ---------------- NAVIGATION ----------------
g('Navigation', 'Your phone\'s GPS works without signal',
  p('GPS comes from satellites, not cell towers. Download offline maps (Organic Maps, OsmAnd or Google Maps offline areas) and your blue dot still works with no service.'),
  ul('Airplane mode with location on saves a lot of battery and still allows GPS.',
     'This app\'s Compass mode guides you to any point with no signal.'))
g('Navigation', 'Map and compass basics',
  ul('Hold the compass flat, point the direction-of-travel arrow at your target and turn the bezel until the orienting arrow boxes the red needle. Then follow the arrow.',
     'Declination: true north and magnetic north differ by up to about 15°+ in parts of the U.S. Your topo map shows the local value.',
     'Use handrails such as roads, rivers and ridges, plus catching features that tell you you\'ve gone too far.'))
g('Navigation', 'Finding north with no compass',
  ul('<b>Shadow stick:</b> put a stick upright, mark the shadow tip, wait 15–20 minutes and mark again. The line from the first mark to the second runs roughly west to east.',
     '<b>North Star:</b> follow the two outer stars of the Big Dipper\'s cup about 5 cup-lengths to Polaris.',
     'The sun rises roughly in the east and sets roughly in the west. At midday in the U.S. it\'s due south.'))

# ---------------- COMMUNICATION ----------------
g('Communication', 'Staying in touch when networks fail',
  ul('Texts often get through when calls don\'t. Keep messages short.',
     'Pick an out-of-area contact everyone checks in with.',
     'A NOAA weather radio gets official alerts with no cell or internet.',
     'Agree on meeting places and check-in times, for example on the hour, in case radios are the only link.'))
g('Communication', 'Radios explained (cheapest to best)',
  ul('<b>FRS walkie-talkies:</b> no license, cheap, about 0.5–2 miles in real use.',
     '<b>GMRS:</b> more power and repeaters. Needs an FCC license (no exam, covers your family).',
     '<b>CB:</b> no license. Truckers often still monitor channel 19.',
     '<b>Meshtastic:</b> small LoRa radios paired to your phone send texts over miles with no network. No license needed in the U.S. band.',
     '<b>Ham (amateur) radio:</b> the longest range, up to worldwide. Needs a Technician exam, and local emergency nets exist.'))
g('Communication', 'Signaling for rescue',
  ul('Three of anything means distress: three whistle blasts, three fires in a triangle or three flashes.',
     'A signal mirror can be seen for miles in sun.',
     'Make large ground signals with contrasting materials. A big X means you need help.',
     'Many newer phones can text emergency services by satellite. Check your phone\'s Emergency SOS settings.'))

# ---------------- POWER ----------------
g('Power', 'Power without the grid',
  ul('A phone charge is about 10–15 Wh. A 20,000 mAh power bank gives about 4 charges.',
     'A 100 W solar panel gives roughly 300–500 Wh on a sunny day, enough for phones, lights and a radio.',
     'Portable power stations (300–2,000 Wh) run CPAP machines, fridges for short periods and laptops. Recharge them by solar or car.',
     'A car can charge devices. Run the engine outdoors only, never in a garage.'))
g('Power', 'Generator safety',
  ul('Run generators outdoors, at least 20 ft from doors and windows, and pointed away from the house.',
     '<b>Never backfeed</b> a house through an outlet. It can electrocute line workers. Use a transfer switch installed by an electrician.',
     'Store fuel in approved cans away from living areas, and add stabilizer for storage.',
     'Let the engine cool before refueling.'))

# ---------------- SANITATION ----------------
g('Sanitation', 'Toilets and waste without water',
  ul('<b>Bucket toilet:</b> line a 5-gallon bucket with two heavy bags and add sawdust, kitty litter or peat after each use.',
     'Keeping urine separate (a second container) cuts smell and volume a lot.',
     'Tie off full bags and store them sealed, away from water sources and living areas.',
     'Bury waste only if allowed: 6–8 inches deep and 200 ft from water.',
     'Wash hands every time. Diarrhea spreads fast without running water.'))
g('Sanitation', 'Hygiene on a small water budget',
  ul('A tippy-tap or a jug with a spigot makes handwashing easy.',
     'Use wipes and a basin for sponge baths. Brush teeth with treated water.',
     'Use separate cloths for dishes and for washing people.',
     'Stock menstrual products (or reusable cups and pads), diapers and a supply of trash bags.'))

# ---------------- SECURITY ----------------
g('Security', 'Home security basics',
  ul('Keep your supplies out of sight and don\'t post about them.',
     'Reinforce doors with 3-inch strike-plate screws and a door bar. Add motion lights.',
     'Get to know your neighbors. A watchful street is the best security.',
     'Avoid confrontation. Leaving is often safer than defending stuff.'))
g('Security', 'Firearm safety rules (for owners)',
  ul('Treat every gun as loaded.',
     'Never point it at anything you aren\'t willing to destroy.',
     'Keep your finger off the trigger until you are ready to shoot.',
     'Know your target and what is beyond it.',
     'Store guns locked and unloaded, away from kids and anyone at risk.'))

# ---------------- EVACUATION ----------------
g('Evacuation', 'Go-bag for each person',
  ul('Water (1 liter+), a filter, 3 days of no-cook food, and medications (7+ days).',
     'A flashlight or headlamp, batteries, a power bank and cables.',
     'A change of clothes, rain layer, warm hat, and sturdy shoes by the bed.',
     'A first-aid kit, N95 masks, hygiene items and glasses.',
     'Copies of IDs, insurance and prescriptions; cash in small bills; a paper map with routes marked.',
     'Pet food, leash and carrier, and kids\' comfort items.'))
g('Evacuation', 'Leaving safely',
  ul('Leave early, as soon as you are told to go or it feels wrong. Roads clog fast.',
     'Know 2 routes out, and keep the tank at least half full.',
     'Text your out-of-area contact your plan and route.',
     'Follow official detours. Don\'t drive into floodwater or around barricades.'))

# ---------------- HAZARDS ----------------
g('Hazards', 'Earthquake',
  ul('Drop, cover and hold on under a sturdy table, away from windows.',
     'Afterward, check for gas leaks. If you smell gas, leave and shut it off from outside.',
     'Expect aftershocks. Wear shoes because of broken glass.'))
g('Hazards', 'Wildfire and smoke',
  ul('Sign up for county alerts. Use the "Ready, Set, Go" approach and leave early.',
     'Wear N95 masks for smoke. Close windows and run a HEPA purifier or a box fan with a furnace filter.',
     'Before leaving, close windows and doors and move flammables away from the house.'))
g('Hazards', 'Flood',
  ul('Turn around, don\'t drown. 6 inches of moving water can knock you down, and 12 inches can float a car.',
     'Move to higher ground. Avoid walking through floodwater, which may be contaminated or electrified.',
     'After a flood, throw out food that touched floodwater and treat all water.'))
g('Hazards', 'Winter storm and extreme heat',
  ul('<b>Winter:</b> stay inside, keep pipes from freezing (let faucets drip), and watch for CO from heaters.',
     '<b>Heat:</b> stay hydrated, find the coolest room, use wet cloths and fans, and check on elderly neighbors.',
     'Heat stroke (hot skin and confusion) is an emergency. Cool the person fast.'))
g('Hazards', 'Nuclear or radiation emergency',
  p('Official guidance (Ready.gov): <b>Get inside. Stay inside. Stay tuned.</b>'),
  ul('Go to the middle of a sturdy building or a basement, away from windows and outer walls.',
     'Stay inside for at least 24 hours unless officials say otherwise.',
     'If you were outside, remove your outer clothing, bag it, and shower or wipe exposed skin.',
     'Take potassium iodide only if public health officials tell you to.'))
g('Hazards', 'Chemical release',
  ul('Follow official instructions to shelter in place or evacuate.',
     'Shelter in place: go to an interior room, close windows and vents, turn off the HVAC, and seal gaps with plastic and tape.',
     'If you\'re outside, move upwind and uphill, away from the source.'))
g('Hazards', 'Civil unrest',
  ul('Avoid crowds and protests. Change routes around trouble.',
     'Keep a low profile, and keep your vehicle fueled and your go-bag ready.',
     'Stay informed through local official sources.'))

# ---------------- LONG TERM ----------------
g('Long term (90+ days)', 'Living through a long disruption',
  ul('Set household roles: water, food, security, health, kids and comms.',
     'Build a steady water supply from a well, rain catchment or spring, plus a good filter.',
     'Start a garden early. Food takes months to produce.',
     'Learn skills that trade well: first aid, repair, gardening, sewing, canning and radio.',
     'Build community. Groups fare far better than lone households.'))
g('Long term (90+ days)', 'Useful barter items',
  ul('Water filters and purification tablets, batteries, lighters and matches.',
     'Coffee, salt, sugar, spices and hygiene items (soap, toilet paper, menstrual products).',
     'Fuel, seeds, basic tools, and first-aid supplies.',
     'Skills are worth more than stuff: medical, mechanical, food production.'))

# ---------------- GEAR TIERS ----------------
GEAR = [
 ('Water filtering', [('Budget', 'Squeeze or straw filter (Sawyer Squeeze, LifeStraw)', '$20–40'),
                      ('Mid', 'Gravity bag filter (Platypus GravityWorks, Sawyer gravity kit)', '$60–130'),
                      ('Premium', 'Countertop gravity system or pump purifier (MSR Guardian)', '$250–400')]),
 ('Water storage', [('Budget', '7-gallon jugs ×2–4', '$20–80'),
                    ('Mid', '55-gallon drum + siphon pump', '$100–150'),
                    ('Premium', 'Rain catchment + 250–500 gal tank', '$400–1,500')]),
 ('Cooking', [('Budget', 'Single-burner butane stove + canisters', '$25–50'),
              ('Mid', 'Two-burner propane stove + 20 lb tank', '$100–180'),
              ('Premium', 'Wood/biomass stove with USB charging, or solar oven', '$150–350')]),
 ('Light', [('Budget', 'LED headlamps (AA/AAA)', '$10–25'),
            ('Mid', 'Rechargeable lanterns + headlamps', '$40–80'),
            ('Premium', 'Solar lantern system + rechargeable lights', '$100–200')]),
 ('Power', [('Budget', '20,000 mAh power bank + 20 W folding solar', '$70–100'),
            ('Mid', '300–500 Wh power station + 100 W panel', '$300–600'),
            ('Premium', '1–2 kWh power station + 200–400 W solar, or a dual-fuel generator', '$1,000–2,500')]),
 ('Communication', [('Budget', 'Hand-crank NOAA radio; FRS walkie-talkie pair', '$30–60'),
                    ('Mid', 'GMRS handhelds (license) or Meshtastic radios', '$60–200'),
                    ('Premium', 'Ham or mobile GMRS radio, or a satellite messenger (Garmin inReach + plan)', '$300–600')]),
 ('Navigation', [('Budget', 'Baseplate compass + printed local maps', '$15–30'),
                 ('Mid', 'Handheld GPS (Garmin eTrex)', '$100–200'),
                 ('Premium', 'Satellite messenger with SOS + subscription', '$300–500')]),
 ('First aid', [('Budget', 'Pre-made kit + genuine CAT tourniquet', '$60–90'),
                ('Mid', 'Trauma kit (IFAK) + expanded meds + splint', '$120–250'),
                ('Premium', 'Comprehensive medical bag + AED', '$1,000–1,800')]),
 ('Shelter & sleep', [('Budget', 'Wool blankets, tarp, mylar bivvies', '$30–70'),
                      ('Mid', '0–20°F sleeping bags + pads (per person)', '$100–250'),
                      ('Premium', '4-season tent + cold-rated bags', '$400–900')]),
 ('Food', [('Budget', 'Bulk rice, beans, oats in sealed buckets', '~$1–2 per lb'),
           ('Mid', 'Mix of pantry staples + freeze-dried meals', '~$3–6 per meal'),
           ('Premium', '3–12 month freeze-dried supply + garden + canning setup', '$1,000+')]),
 ('Tools', [('Budget', 'Multitool, fixed-blade knife, duct tape, paracord', '$50–80'),
            ('Mid', 'Quality multitool, folding saw, shovel, hatchet', '$150–250'),
            ('Premium', 'Full hand-tool kit + chainsaw', '$500+')]),
 ('Security', [('Budget', 'Door bar, 3" strike screws, solar motion lights', '$30–60'),
               ('Mid', 'Cameras with local storage', '$100–250'),
               ('Premium', 'Safe + monitored alarm system', '$500+')]),
]

# ---------------- APPS ----------------
APPS = [
 ('Maps & navigation', [('Organic Maps', 'Free', 'Offline maps with driving, walking and biking directions. Simple and private.'),
                        ('OsmAnd', 'Free / paid', 'Offline maps, routing, contour lines (paid) and trip recording.'),
                        ('Google Maps', 'Free', 'Download offline areas. Live traffic and closures when online.'),
                        ('Waze', 'Free', 'Crowd-reported crashes, closures and police. Needs data.'),
                        ('Gaia GPS', 'Free / paid', 'Topo maps and offline backcountry navigation.'),
                        ('CalTopo', 'Free / paid', 'Detailed topo, slope and fire maps; planning on desktop.'),
                        ('Avenza Maps', 'Free / paid', 'Official USGS and Forest Service PDF maps that work offline.')]),
 ('Alerts & safety', [('FEMA', 'Free', 'Weather alerts, shelter locations and disaster tips.'),
                      ('American Red Cross: Emergency', 'Free', 'Alerts and preparedness for 35+ disaster types.'),
                      ('American Red Cross: First Aid', 'Free', 'Step-by-step first aid that works offline.'),
                      ('Watch Duty', 'Free', 'Live wildfire maps and evacuation info.'),
                      ('MyShake', 'Free', 'Earthquake early warning for CA, OR and WA.'),
                      ('NOAA weather radio apps', 'Free', 'Official National Weather Service alerts.')]),
 ('Off-grid communication', [('Meshtastic', 'Free app (needs radio)', 'Text over miles with small LoRa radios. No cell network.'),
                             ('Zello', 'Free', 'Push-to-talk walkie-talkie over any Wi-Fi or data.'),
                             ('Briar', 'Free', 'Messaging over Bluetooth or Wi-Fi when the internet is down.')]),
 ('Knowledge (offline)', [('Kiwix', 'Free', 'Wikipedia, WikiMed, iFixit and more stored on your phone.'),
                          ('iNaturalist', 'Free', 'Identify plants and animals. Don\'t eat anything based on an app.'),
                          ('Google Translate', 'Free', 'Download languages for offline translation.')]),
 ('Files & organizing', [('Files by Google', 'Free', 'Clean up storage and share files phone-to-phone with no internet (Quick Share).'),
                         ('Google Drive scan / Adobe Scan', 'Free', 'Scan IDs, insurance and prescriptions to PDF.'),
                         ('Syncthing', 'Free', 'Sync folders device-to-device without the cloud.'),
                         ('Obsidian', 'Free', 'Offline notes and plans on your phone.'),
                         ('Bitwarden', 'Free / paid', 'Password vault, including recovery codes.')]),
]

data = {'guides': G,
        'gear': [{'c': c, 'tiers': [{'t': t, 'x': x, 'p': pr} for t, x, pr in tiers]} for c, tiers in GEAR],
        'apps': [{'c': c, 'list': [{'n': n, 'cost': cost, 'd': d} for n, cost, d in lst]} for c, lst in APPS]}

if __name__ == '__main__':
    path = 'web/index.src.html'
    src = open(path, encoding='utf-8').read()
    block = '/*LIBRARY_START*/var LIB=' + json.dumps(data, ensure_ascii=False) + ';/*LIBRARY_END*/'
    if '/*LIBRARY_START*/' in src:
        src = re.sub(r'/\*LIBRARY_START\*/.*?/\*LIBRARY_END\*/', lambda m: block, src, flags=re.S)
    else:
        src = src.replace('/* ================= AEGIS home-screen shell ================= */', block + '\n/* ================= AEGIS home-screen shell ================= */', 1)
    open(path, 'w', encoding='utf-8').write(src)
    print(len(G), 'guides,', sum(len(t) for _, t in GEAR), 'gear items,', sum(len(l) for _, l in APPS), 'apps')
