/* OFFGRID 180 — calculators. Pure functions (no DOM), also loadable in Node for tests.
 * All results are planning ESTIMATES. Sources noted per function. */
(function (root) {
  var C = {};
  var r1 = function (x) { return Math.round(x * 10) / 10; };
  C.LB_PER_KG = 2.20462; C.L_PER_GAL = 3.78541; C.CM_PER_IN = 2.54;

  /* Mifflin–St Jeor resting energy (kcal/day). */
  C.bmr = function (p) {
    var base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
    return Math.round(base + (p.sex === 'female' ? -161 : 5));
  };
  C.ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, heavy: 1.725, extreme: 1.9 };
  C.CLIMATE_KCAL = { temperate: 0, hot: 0.05, cold: 0.10, extreme_cold: 0.25 }; // general estimate
  C.CLIMATE_WATER_L = { temperate: 0, cold: 0.25, hot: 1.0, extreme_heat: 2.0, extreme_cold: 0.5 };

  /* Daily calories: BMR × activity, + climate %, + extra heavy-labor hours (≈250 kcal/h above baseline). */
  C.dailyKcal = function (p) {
    var b = C.bmr(p), act = C.ACTIVITY[p.activity] || 1.55;
    var tdee = b * act;
    var climate = tdee * (C.CLIMATE_KCAL[p.climate] || 0);
    var work = (p.workHours || 0) * 250;
    var total = Math.round(tdee + climate + work);
    var proteinMin = Math.round(0.8 * p.weightKg), proteinWork = Math.round((p.workHours > 2 || act >= 1.725 ? 1.4 : 1.0) * p.weightKg);
    return { bmr: b, tdee: Math.round(tdee), climate: Math.round(climate), work: work, total: total, proteinMin: proteinMin, proteinTarget: proteinWork };
  };

  /* Daily water (liters). Drinking ≈ 35 mL/kg × activity, + climate; never below the Ready.gov 1 gal/day minimum overall. */
  C.WATER_ACT = { sedentary: 1, light: 1.1, moderate: 1.25, heavy: 1.5, extreme: 1.75 };
  C.dailyWater = function (p) {
    var drink = 0.035 * p.weightKg * (C.WATER_ACT[p.activity] || 1.25) + (C.CLIMATE_WATER_L[p.climate] || 0) + (p.workHours || 0) * 0.5;
    drink = Math.max(drink, 2);
    var cook = p.cookL != null ? +p.cookL : 1;
    var hyg = p.hygieneL != null ? +p.hygieneL : 2;
    var total = drink + cook + hyg;
    var fema = C.L_PER_GAL; // Ready.gov minimum (drinking + sanitation)
    return { drink: r1(drink), cook: r1(cook), hygiene: r1(hyg), total: r1(Math.max(total, fema)), femaMin: r1(fema) };
  };

  /* Whole-plan totals with configurable reserve %. */
  C.planTotals = function (p, days, reservePct) {
    var k = C.dailyKcal(p), w = C.dailyWater(p), f = 1 + (reservePct || 0) / 100;
    return {
      days: days, reservePct: reservePct || 0,
      kcal: Math.round(k.total * days * f), waterL: Math.round(w.total * days * f),
      drinkL: Math.round(w.drink * days * f), proteinKg: r1(k.proteinTarget * days * f / 1000),
      daily: { kcal: k.total, waterL: w.total }
    };
  };

  /* Staple foods, kcal per kg (USDA FoodData Central, typical values, dry/as sold). */
  C.FOODS = [
    { id: 'rice', name: 'White rice', kcalKg: 3600, proteinPct: 7 },
    { id: 'beans', name: 'Dried beans/lentils', kcalKg: 3400, proteinPct: 23 },
    { id: 'oats', name: 'Rolled oats', kcalKg: 3800, proteinPct: 13 },
    { id: 'pasta', name: 'Pasta', kcalKg: 3700, proteinPct: 13 },
    { id: 'flour', name: 'White flour', kcalKg: 3640, proteinPct: 10 },
    { id: 'oil', name: 'Cooking oil', kcalKg: 8840, proteinPct: 0 },
    { id: 'pb', name: 'Peanut butter', kcalKg: 5900, proteinPct: 25 },
    { id: 'milk', name: 'Nonfat dry milk', kcalKg: 3600, proteinPct: 35 },
    { id: 'sugar', name: 'Sugar/honey', kcalKg: 3500, proteinPct: 0 },
    { id: 'meat', name: 'Canned meat/fish', kcalKg: 2000, proteinPct: 22 },
    { id: 'freeze', name: 'Freeze-dried meals', kcalKg: 4300, proteinPct: 15 }
  ];
  C.DEFAULT_MIX = { rice: 30, beans: 15, oats: 10, pasta: 5, oil: 10, pb: 8, milk: 5, sugar: 5, meat: 7, freeze: 5 };
  /* Split total kcal by % of calories from each food → kg needed. */
  C.foodMix = function (totalKcal, mix) {
    var sum = 0, out = [], prot = 0;
    Object.keys(mix).forEach(function (k) { sum += +mix[k] || 0; });
    C.FOODS.forEach(function (f) {
      var pct = +mix[f.id] || 0; if (!pct) return;
      var kcal = totalKcal * pct / (sum || 100);
      var kg = kcal / f.kcalKg; prot += kg * f.proteinPct / 100;
      out.push({ id: f.id, name: f.name, pct: Math.round(pct * 100 / (sum || 100)), kcal: Math.round(kcal), kg: r1(kg) });
    });
    return { items: out, totalKg: r1(out.reduce(function (a, b) { return a + b.kg; }, 0)), proteinKg: r1(prot), pctSum: sum };
  };

  /* Fuel. Propane 21,548 BTU/lb, 4.24 lb/gal; kerosene ≈135,000 BTU/gal; seasoned firewood BTU/cord by type (estimates). */
  C.WOOD = { hardwood: 24e6, mixed: 20e6, softwood: 15e6 };
  C.fuel = function (o) {
    var days = o.days || 180;
    var cookBtu = (o.burnerBtuH || 10000) * (o.cookMin || 45) / 60;
    var boilBtu = (o.boilL || 0) * 1000; // ≈1,000 BTU per liter brought to boil on a camp stove (estimate)
    var heatBtu = (o.heaterBtuH || 0) * (o.heatHours || 0);
    var dayBtu = cookBtu + boilBtu + heatBtu;
    var totalBtu = dayBtu * days * (1 + (o.reservePct || 0) / 100);
    var propaneLb = totalBtu / 21548;
    var woodEff = o.woodEff || 0.6, woodBtu = C.WOOD[o.wood || 'mixed'];
    var genGal = (o.genGalH || 0) * (o.genHours || 0) * days * (1 + (o.reservePct || 0) / 100);
    return {
      dayBtu: Math.round(dayBtu), totalBtu: Math.round(totalBtu),
      propaneLb: Math.round(propaneLb), propaneGal: r1(propaneLb / 4.24), tanks20: Math.ceil(propaneLb / 20),
      keroseneGal: r1(totalBtu / 135000), woodCords: r1(totalBtu / (woodBtu * woodEff)),
      generatorGal: r1(genGal)
    };
  };

  /* Solar & battery sizing (NREL-style rule of thumb). */
  C.BATTERY_DOD = { lifepo4: 0.9, lithium: 0.8, agm: 0.5, flooded: 0.5 };
  C.solar = function (o) {
    var wh = (o.loads || []).reduce(function (a, l) { return a + (+l.w || 0) * (+l.h || 0) * (+l.qty || 1); }, 0);
    var eff = o.eff || 0.75, psh = o.psh || 3, dod = C.BATTERY_DOD[o.battery || 'lifepo4'], v = o.voltage || 12, auto = o.autonomy || 2;
    var panelW = wh / (psh * eff) * 1.2; // +20% margin
    var battWh = wh * auto / dod;
    return { whDay: Math.round(wh), panelW: Math.ceil(panelW / 10) * 10, batteryWh: Math.round(battWh), batteryAh: Math.ceil(battWh / v), dod: dod };
  };

  /* Consumable hygiene & medical supplies — per-day estimates the user can edit. */
  C.SUPPLY_RATES = [
    { id: 'tp', name: 'Toilet paper', unit: 'rolls', perDay: 0.25 },
    { id: 'soap', name: 'Bar soap', unit: 'bars', perDay: 1 / 15 },
    { id: 'toothpaste', name: 'Toothpaste (100 mL)', unit: 'tubes', perDay: 1 / 60 },
    { id: 'toothbrush', name: 'Toothbrush', unit: 'each', perDay: 1 / 90 },
    { id: 'trash', name: 'Trash bags', unit: 'bags', perDay: 0.5 },
    { id: 'gloves', name: 'Nitrile gloves', unit: 'pairs', perDay: 0.5 },
    { id: 'bandaids', name: 'Adhesive bandages', unit: 'each', perDay: 0.3 },
    { id: 'gauze', name: 'Gauze pads', unit: 'each', perDay: 0.15 },
    { id: 'ibuprofen', name: 'Pain reliever doses (as label allows)', unit: 'doses', perDay: 0.3 },
    { id: 'vitamins', name: 'Multivitamin', unit: 'tablets', perDay: 1 },
    { id: 'ors', name: 'Oral rehydration packets', unit: 'packets', perDay: 0.05 },
    { id: 'sanitizer', name: 'Hand sanitizer', unit: 'liters', perDay: 0.01 },
    { id: 'laundry', name: 'Laundry soap loads', unit: 'loads', perDay: 2 / 7 },
    { id: 'sunscreen', name: 'Sunscreen', unit: 'oz', perDay: 0.3 },
    { id: 'repellent', name: 'Insect repellent', unit: 'oz', perDay: 0.15 }
  ];
  C.supplies = function (days, reservePct, rates) {
    var f = 1 + (reservePct || 0) / 100;
    return (rates || C.SUPPLY_RATES).map(function (s) { return { id: s.id, name: s.name, unit: s.unit, perDay: s.perDay, qty: Math.ceil(s.perDay * days * f) }; });
  };

  /* Bleach for treating water: CDC 8 drops (≈0.4 mL) 6% per gallon; doubled for cloudy water. */
  C.bleachMl = function (litersPerDay, days, cloudy) {
    var gal = litersPerDay * days / C.L_PER_GAL; return Math.round(gal * 0.4 * (cloudy ? 2 : 1));
  };

  /* Days remaining for a consumable. */
  C.daysLeft = function (qty, perDay) { if (!perDay || perDay <= 0) return Infinity; return Math.floor(qty / perDay); };

  /* Plan day: day 1 is the start date. */
  C.planDay = function (startISO, now) {
    if (!startISO) return 0;
    var s = new Date(startISO + 'T00:00:00'), n = now ? new Date(now) : new Date();
    n.setHours(0, 0, 0, 0);
    return Math.floor((n - s) / 86400000) + 1;
  };

  /* Haversine distance (m) and initial bearing (deg). */
  C.distance = function (a, b) {
    var R = 6371000, toR = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  C.bearing = function (a, b) {
    var toR = Math.PI / 180, y = Math.sin((b.lon - a.lon) * toR) * Math.cos(b.lat * toR);
    var x = Math.cos(a.lat * toR) * Math.sin(b.lat * toR) - Math.sin(a.lat * toR) * Math.cos(b.lat * toR) * Math.cos((b.lon - a.lon) * toR);
    return (Math.atan2(y, x) / toR + 360) % 360;
  };
  C.cardinal = function (deg) { return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8]; };

  /* Lat/lon (WGS84) → UTM. Standard Transverse Mercator series (Snyder 1987). */
  C.toUTM = function (lat, lon) {
    var a = 6378137, f = 1 / 298.257223563, k0 = 0.9996, e2 = f * (2 - f), ep2 = e2 / (1 - e2), toR = Math.PI / 180;
    var zone = Math.floor((lon + 180) / 6) + 1;
    if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) zone = 32;
    if (lat >= 72 && lat < 84) { if (lon >= 0 && lon < 9) zone = 31; else if (lon >= 9 && lon < 21) zone = 33; else if (lon >= 21 && lon < 33) zone = 35; else if (lon >= 33 && lon < 42) zone = 37; }
    var lon0 = ((zone - 1) * 6 - 180 + 3) * toR, phi = lat * toR, lam = lon * toR;
    var N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi)), T = Math.tan(phi) * Math.tan(phi), Cc = ep2 * Math.cos(phi) * Math.cos(phi), A = Math.cos(phi) * (lam - lon0);
    var M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * phi - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * phi) + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * phi) - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * phi));
    var E = k0 * N * (A + (1 - T + Cc) * A * A * A / 6 + (5 - 18 * T + T * T + 72 * Cc - 58 * ep2) * Math.pow(A, 5) / 120) + 500000;
    var Nn = k0 * (M + N * Math.tan(phi) * (A * A / 2 + (5 - T + 9 * Cc + 4 * Cc * Cc) * Math.pow(A, 4) / 24 + (61 - 58 * T + T * T + 600 * Cc - 330 * ep2) * Math.pow(A, 6) / 720));
    if (lat < 0) Nn += 10000000;
    var bands = 'CDEFGHJKLMNPQRSTUVWXX', band = lat < -80 || lat > 84 ? '?' : bands.charAt(Math.floor((lat + 80) / 8));
    return { zone: zone, band: band, easting: Math.round(E), northing: Math.round(Nn) };
  };
  C.toDMS = function (dec, isLat) {
    var h = dec < 0 ? (isLat ? 'S' : 'W') : (isLat ? 'N' : 'E'), a = Math.abs(dec), d = Math.floor(a), mf = (a - d) * 60, m = Math.floor(mf), s = r1((mf - m) * 60);
    if (s >= 60) { s = 0; m += 1; } if (m >= 60) { m = 0; d += 1; }
    return d + '° ' + m + '′ ' + s + '″ ' + h;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = C;
  else { root.OG = root.OG || {}; root.OG.calc = C; }
})(this);
