/* Food & Water section and the 90–180 day calculators. */
(function () {
  var esc = OG.esc, C = OG.calc;
  var CALCS = [
    ['profile', 'Body & activity profile', 'heart', 'Weight, age, activity, climate, workload — used by every calculator.'],
    ['plan', '90 / 120 / 180-day plan', 'calc', 'Total calories, food, water and protein with your reserve.'],
    ['food', 'Food quantities & storage', 'food', 'Turn calories into kilograms/pounds of staples.'],
    ['water', 'Water & treatment capacity', 'drop', 'Daily need, storage, bleach, tablets, filter capacity.'],
    ['fuel', 'Fuel consumption', 'fire', 'Cooking, boiling, heating, generator — propane, wood, kerosene.'],
    ['solar', 'Solar & battery', 'sun', 'Daily watt-hours, panel and battery size.'],
    ['supplies', 'Medical, hygiene & reserves', 'med', 'Consumables and Tier 1 equipment reserves.'],
    ['depletion', 'Supply depletion', 'clip', 'When each tracked supply runs out.']
  ];
  function kv(name, def) { return Object.assign({}, def, OG.db.get('calc:' + name, {})); }
  function live(el, name, compute) {
    var form = OG.$('form', el);
    var run = function () { var d = OG.formData(form); OG.db.set('calc:' + name, d); OG.$('#out', el).innerHTML = compute(d); };
    form.oninput = run; form.onsubmit = function (e) { e.preventDefault(); run(); }; run();
  }
  var num = function (name, val, attrs) { return '<input type="number" step="any" name="' + name + '" value="' + esc(val == null ? '' : val) + '" ' + (attrs || '') + '>'; };

  OG.route('/foodwater', function () {
    var st = OG.status(), p = OG.profile(), k = C.dailyKcal(p), w = C.dailyWater(p), plan = OG.plan();
    var html = OG.header('Food & Water', 'Daily needs, stored supply and calculators') +
      '<div class="grid" style="margin-bottom:12px">' +
      '<a class="stat" href="#/calc/profile"><div class="l">Daily calories</div><div class="v">' + OG.fmt.num(k.total) + '</div><div class="l">kcal · protein ' + k.proteinTarget + ' g</div></a>' +
      '<a class="stat" href="#/calc/water"><div class="l">Daily water</div><div class="v">' + OG.fmt.L(w.total) + '</div><div class="l">drinking ' + OG.fmt.L(w.drink) + '</div></a>' +
      '<a class="stat" href="#/inventory?cat=Food"><div class="l">Food on hand</div><div class="v">' + OG.fmt.days(st.foodDays) + '</div><div class="l">of ' + st.remaining + ' days needed</div>' + OG.meter(st.foodDays / st.remaining, OG.levelOf(st.foodDays / st.remaining)) + '</a>' +
      '<a class="stat" href="#/inventory?cat=Water"><div class="l">Water stored</div><div class="v">' + OG.fmt.days(st.waterDays) + '</div><div class="l">' + OG.fmt.L(st.waterL) + '</div>' + OG.meter(st.waterDays / st.remaining, OG.levelOf(st.waterDays / st.remaining)) + '</a></div>' +
      (OG.db.get('profile') ? '' : OG.card('<b>Set your profile</b> for accurate numbers — current values are defaults. <a href="#/calc/profile">Set profile →</a>', 'alert')) +
      '<h2>Calculators</h2><div class="grid wide">' + CALCS.map(function (c) { return '<a class="tile" href="#/calc/' + c[0] + '">' + OG.icon(c[2]) + '<b>' + c[1] + '</b><small>' + c[3] + '</small></a>'; }).join('') + '</div>' +
      '<h2 style="margin-top:16px">Guides</h2>' + OG.moduleBlocks(['water', 'food', 'fire']);
    return html;
  });

  OG.route('/calc/profile', function () {
    var p = OG.profile(), U = OG.u;
    var html = OG.header('Body & activity profile', 'Used by all calculators', '#/foodwater') +
      '<form class="card"><div class="form-grid">' +
      OG.field('Weight (' + U.wUnit() + ')', num('weight', U.wIn(p.weightKg), 'min="20"')) +
      OG.field('Height (' + U.hUnit() + ')', num('height', U.hIn(p.heightCm))) +
      OG.field('Age', num('age', p.age, 'min="12" max="100"')) +
      OG.field('Sex (for metabolism)', '<select name="sex">' + OG.opt([['male', 'Male'], ['female', 'Female']], p.sex) + '</select>') +
      OG.field('Activity level', '<select name="activity">' + OG.opt([['sedentary', 'Sedentary'], ['light', 'Light'], ['moderate', 'Moderate (daily chores)'], ['heavy', 'Heavy (labor most days)'], ['extreme', 'Very heavy']], p.activity) + '</select>') +
      OG.field('Climate / conditions', '<select name="climate">' + OG.opt([['temperate', 'Temperate'], ['hot', 'Hot'], ['extreme_heat', 'Extreme heat'], ['cold', 'Cold'], ['extreme_cold', 'Extreme cold']], p.climate) + '</select>') +
      OG.field('Extra hard-labor hours/day', num('workHours', p.workHours, 'min="0" max="16"'), 'Wood cutting, digging, hauling') +
      OG.field('Cooking water (' + U.vUnit() + '/day)', num('cookL', U.vIn(p.cookL))) +
      OG.field('Hygiene water (' + U.vUnit() + '/day)', num('hygieneL', U.vIn(p.hygieneL))) +
      '</div><button class="btn primary block" type="submit">Save profile</button></form><div id="out"></div>';
    return {
      html: html, mount: function (el) {
        var form = OG.$('form', el);
        var read = function () { var d = OG.formData(form); return { weightKg: U.wOut(d.weight || 75), heightCm: U.hOut(d.height || 175), age: d.age || 35, sex: d.sex, activity: d.activity, climate: d.climate, workHours: d.workHours || 0, cookL: U.vOut(d.cookL || 0), hygieneL: U.vOut(d.hygieneL || 0) }; };
        var show = function () {
          var p = read(), k = C.dailyKcal(p), w = C.dailyWater(p);
          OG.$('#out', el).innerHTML = OG.card('<h2>Daily needs (estimate)</h2><table><tr><th>Resting metabolism (Mifflin–St Jeor)</th><td>' + k.bmr + ' kcal</td></tr><tr><th>With activity</th><td>' + k.tdee + ' kcal</td></tr><tr><th>Climate adjustment</th><td>+' + k.climate + ' kcal</td></tr><tr><th>Hard labor</th><td>+' + k.work + ' kcal</td></tr><tr><th><b>Total calories</b></th><td><b>' + k.total + ' kcal/day</b></td></tr><tr><th>Protein</th><td>' + k.proteinMin + '–' + k.proteinTarget + ' g/day</td></tr>' +
            '<tr><th>Drinking water</th><td>' + OG.fmt.L(w.drink, 2) + '</td></tr><tr><th>Cooking + hygiene</th><td>' + OG.fmt.L(w.cook + w.hygiene, 2) + '</td></tr><tr><th><b>Total water</b></th><td><b>' + OG.fmt.L(w.total, 2) + '/day</b></td></tr></table>' +
            '<p class="muted small">Estimates. Ready.gov minimum is 1 gallon (3.8 L) per person per day for drinking and sanitation; double it in hot weather. Track body weight weekly and adjust.</p>');
        };
        form.oninput = show; show();
        form.onsubmit = function (e) { e.preventDefault(); OG.db.set('profile', read()); OG.toast('Profile saved'); };
      }
    };
  });

  OG.route('/calc/plan', function () {
    var p = OG.profile(), plan = OG.plan();
    var html = OG.header('90 / 120 / 180-day plan', 'Totals for one person with your reserve', '#/foodwater') +
      '<form class="card"><div class="form-grid">' + OG.field('Emergency reserve %', num('reserve', plan.reserve, 'min="0" max="200"')) + OG.field('Your plan length', '<select name="days">' + OG.opt([[90, '90 days'], [120, '120 days'], [180, '180 days']], plan.days) + '</select>') + '</div><button class="btn primary block">Save as my plan</button></form><div id="out"></div>';
    return {
      html: html, mount: function (el) {
        var form = OG.$('form', el);
        var show = function () {
          var d = OG.formData(form), mixKg = function (kcal) { return C.foodMix(kcal, C.DEFAULT_MIX).totalKg; };
          var rows = [90, 120, 180].map(function (days) { var t = C.planTotals(p, days, d.reserve || 0); return { days: days, t: t }; });
          OG.$('#out', el).innerHTML = OG.card('<table><tr><th></th>' + rows.map(function (r) { return '<th' + (r.days === +d.days ? ' style="color:var(--acc)"' : '') + '>' + r.days + ' d</th>'; }).join('') + '</tr>' +
            '<tr><th>Calories</th>' + rows.map(function (r) { return '<td>' + OG.fmt.num(r.t.kcal / 1000) + 'k</td>'; }).join('') + '</tr>' +
            '<tr><th>Dry food (default mix)</th>' + rows.map(function (r) { return '<td>' + OG.fmt.kg(mixKg(r.t.kcal)) + '</td>'; }).join('') + '</tr>' +
            '<tr><th>Protein</th>' + rows.map(function (r) { return '<td>' + OG.fmt.kg(r.t.proteinKg, 1) + '</td>'; }).join('') + '</tr>' +
            '<tr><th>All water</th>' + rows.map(function (r) { return '<td>' + OG.fmt.L(r.t.waterL, 0) + '</td>'; }).join('') + '</tr>' +
            '<tr><th>Drinking only</th>' + rows.map(function (r) { return '<td>' + OG.fmt.L(r.t.drinkL, 0) + '</td>'; }).join('') + '</tr></table>' +
            '<p class="muted small">Storing all water for 180 days is rarely practical. Store a reserve and prove a renewable source plus treatment capacity (see Water calculator).</p>');
        };
        form.oninput = show; show();
        form.onsubmit = function (e) { e.preventDefault(); var d = OG.formData(form); OG.db.set('plan', Object.assign(OG.plan(), { reserve: d.reserve || 0, days: +d.days })); OG.toast('Plan saved'); };
      }
    };
  });

  OG.route('/calc/food', function () {
    var plan = OG.plan(), saved = kv('food', Object.assign({ days: plan.days, reserve: plan.reserve }, C.DEFAULT_MIX));
    var html = OG.header('Food quantities & storage', 'Share of calories from each staple', '#/foodwater') +
      '<form class="card"><div class="form-grid">' + OG.field('Days', num('days', saved.days)) + OG.field('Reserve %', num('reserve', saved.reserve)) + '</div><h3>% of calories</h3><div class="form-grid">' +
      C.FOODS.map(function (f) { return OG.field(f.name, num(f.id, saved[f.id] || 0, 'min="0" max="100"')); }).join('') + '</div></form><div id="out"></div>';
    return {
      html: html, mount: function (el) {
        live(el, 'food', function (d) {
          var p = OG.profile(), total = C.dailyKcal(p).total * (d.days || 0) * (1 + (d.reserve || 0) / 100), r = C.foodMix(total, d);
          return OG.card('<h2>' + OG.fmt.num(total / 1000) + 'k kcal total</h2>' + (r.pctSum !== 100 ? '<p class="pill warn">Percentages add to ' + r.pctSum + '% — scaled to 100%.</p>' : '') +
            '<table><tr><th>Food</th><th>%</th><th>Amount</th></tr>' + r.items.map(function (i) { return '<tr><td>' + i.name + '</td><td>' + i.pct + '%</td><td>' + OG.fmt.kg(i.kg) + '</td></tr>'; }).join('') +
            '<tr><th>Total</th><td></td><th>' + OG.fmt.kg(r.totalKg) + '</th></tr></table><p>Protein from this mix: about <b>' + OG.fmt.kg(r.proteinKg, 1) + '</b> (' + Math.round(r.proteinKg * 1000 / (d.days || 1)) + ' g/day).</p>' +
            '<p class="muted small">Calorie values are typical USDA figures. Add a multivitamin and a vitamin C source; budget extra water and fuel for cooking beans and rice. Storage: sealed, cool, dry, rotated (see Long-term food storage).</p>');
        });
      }
    };
  });

  OG.route('/calc/water', function () {
    var p = OG.profile(), w = C.dailyWater(p), plan = OG.plan(), U = OG.u;
    var saved = kv('water', { days: plan.days, storeDays: 14, filterRated: U.vIn(1000), filters: 1, tablets: 0, cloudy: false });
    var html = OG.header('Water & treatment capacity', 'Daily need: ' + OG.fmt.L(w.total, 2), '#/foodwater') +
      '<form class="card"><div class="form-grid">' + OG.field('Plan days', num('days', saved.days)) + OG.field('Days to store as reserve', num('storeDays', saved.storeDays)) +
      OG.field('Filter rated capacity (' + U.vUnit() + ' each)', num('filterRated', saved.filterRated)) + OG.field('Filters you own', num('filters', saved.filters)) +
      OG.field('Purification tablets owned', num('tablets', saved.tablets)) + '</div><label class="check"><input type="checkbox" name="cloudy"' + (saved.cloudy ? ' checked' : '') + '><span>Source water is often cloudy (double bleach)</span></label></form><div id="out"></div>';
    return {
      html: html, mount: function (el) {
        live(el, 'water', function (d) {
          var need = w.total * (d.days || 0), drink = (w.drink + w.cook) * (d.days || 0), store = w.total * (d.storeDays || 0);
          var cap = U.vOut(d.filterRated || 0) * (d.filters || 0), bleach = C.bleachMl(w.drink + w.cook, d.days || 0, d.cloudy);
          var tabsNeed = Math.ceil(drink);
          return OG.card('<table><tr><th>Total water for plan</th><td>' + OG.fmt.L(need, 0) + '</td></tr><tr><th>Needs treatment (drinking + cooking)</th><td>' + OG.fmt.L(drink, 0) + '</td></tr>' +
            '<tr><th>Reserve to store (' + (d.storeDays || 0) + ' days)</th><td><b>' + OG.fmt.L(store, 0) + '</b> ≈ ' + Math.ceil(store / 18.9) + ' × 5-gal containers</td></tr>' +
            '<tr><th>Filter capacity</th><td>' + OG.fmt.L(cap, 0) + ' — ' + (cap >= drink ? OG.pill('covers plan', 'ok') : OG.pill('short ' + OG.fmt.L(drink - cap, 0), 'warn')) + '</td></tr>' +
            '<tr><th>Bleach to disinfect it all (6%)</th><td>' + OG.fmt.num(bleach) + ' mL ≈ ' + OG.fmt.num(bleach / 29.57, 1) + ' fl oz</td></tr>' +
            '<tr><th>Tablets if used for all (1/L typical)</th><td>' + tabsNeed + ' — you have ' + (d.tablets || 0) + '</td></tr></table>' +
            '<p class="muted small">CDC: 8 drops of 6% bleach per gallon (≈2 drops per liter), wait 30 minutes; double for cloudy water after filtering. Bleach loses strength over months — rotate. Check your tablet label: doses and wait times vary.</p>');
        });
      }
    };
  });

  OG.route('/calc/fuel', function () {
    var plan = OG.plan(), saved = kv('fuel', { days: plan.days, reservePct: plan.reserve, burnerBtuH: 10000, cookMin: 45, boilL: 3, heaterBtuH: 0, heatHours: 0, wood: 'mixed', woodEff: 60, genGalH: 0, genHours: 0 });
    var html = OG.header('Fuel consumption', 'Estimates — calibrate with your own stove', '#/foodwater') +
      '<form class="card"><div class="form-grid">' + OG.field('Days', num('days', saved.days)) + OG.field('Reserve %', num('reservePct', saved.reservePct)) +
      OG.field('Stove burner (BTU/h)', num('burnerBtuH', saved.burnerBtuH), 'Typical camp burner 7,000–12,000') + OG.field('Cooking minutes/day', num('cookMin', saved.cookMin)) +
      OG.field('Liters boiled for water/day', num('boilL', saved.boilL)) + OG.field('Heater (BTU/h)', num('heaterBtuH', saved.heaterBtuH), 'Indoor-rated only') + OG.field('Heating hours/day', num('heatHours', saved.heatHours)) +
      OG.field('Firewood type', '<select name="wood">' + OG.opt([['hardwood', 'Hardwood (oak, maple)'], ['mixed', 'Mixed'], ['softwood', 'Softwood (pine, fir)']], saved.wood) + '</select>') +
      OG.field('Wood stove efficiency %', num('woodEff', saved.woodEff)) + OG.field('Generator fuel (gal/h)', num('genGalH', saved.genGalH), 'From manual at your load') + OG.field('Generator hours/day', num('genHours', saved.genHours)) +
      '</div></form><div id="out"></div>';
    return {
      html: html, mount: function (el) {
        live(el, 'fuel', function (d) {
          var r = C.fuel(Object.assign({}, d, { woodEff: (d.woodEff || 60) / 100 }));
          return OG.card('<p>Daily energy: <b>' + OG.fmt.num(r.dayBtu) + ' BTU</b>. Equivalent total for the plan (choose one fuel or mix):</p><table>' +
            '<tr><th>Propane</th><td>' + OG.fmt.kg(r.propaneLb / 2.20462) + ' (' + OG.fmt.num(r.propaneGal, 1) + ' gal) ≈ ' + r.tanks20 + ' × 20 lb tanks</td></tr>' +
            '<tr><th>Kerosene</th><td>' + OG.fmt.num(r.keroseneGal, 1) + ' gal</td></tr><tr><th>Firewood (seasoned)</th><td>' + OG.fmt.num(r.woodCords, 1) + ' cords</td></tr>' +
            (r.generatorGal ? '<tr><th>Generator gasoline</th><td>' + OG.fmt.num(r.generatorGal, 1) + ' gal</td></tr>' : '') + '</table>' +
            '<p class="muted small">Propane 21,548 BTU/lb; kerosene ≈135,000 BTU/gal; seasoned firewood ≈15–24 million BTU per cord by species. Boiling estimated at ≈1,000 BTU per liter. Never use fuel-burning stoves, heaters or generators indoors without proper rating and venting — carbon monoxide kills.</p>');
        });
      }
    };
  });

  var DEFAULT_LOADS = [{ name: 'Phone charging', w: 10, h: 2, qty: 1 }, { name: 'LED lights', w: 5, h: 5, qty: 2 }, { name: 'Radio', w: 5, h: 2, qty: 1 }, { name: 'Satellite messenger / GPS', w: 5, h: 1, qty: 1 }, { name: 'Laptop/tablet', w: 30, h: 1, qty: 0 }];
  OG.route('/calc/solar', function () {
    var saved = Object.assign({ psh: 3, autonomy: 2, battery: 'lifepo4', voltage: 12 }, OG.db.get('calc:solar', {}));
    var loads = OG.db.get('calc:loads', DEFAULT_LOADS);
    var html = OG.header('Solar & battery', 'Size a system for your daily loads', '#/foodwater') +
      '<form class="card"><h3>Loads</h3><table id="loads"><tr><th>Device</th><th>Watts</th><th>h/day</th><th>Qty</th><th></th></tr>' + loads.map(function (l, i) {
        return '<tr><td><input name="n' + i + '" value="' + esc(l.name) + '"></td><td>' + num('w' + i, l.w) + '</td><td>' + num('h' + i, l.h) + '</td><td>' + num('q' + i, l.qty) + '</td><td><button type="button" class="icon-btn" data-rm="' + i + '" aria-label="Remove">✕</button></td></tr>';
      }).join('') + '</table><button type="button" class="btn" id="addload">' + OG.icon('plus') + ' Add device</button>' +
      '<div class="form-grid" style="margin-top:10px">' + OG.field('Winter peak sun hours', num('psh', saved.psh), 'Northern U.S. winter often 2–3') + OG.field('Days of autonomy', num('autonomy', saved.autonomy)) +
      OG.field('Battery type', '<select name="battery">' + OG.opt([['lifepo4', 'LiFePO4 (90% usable)'], ['lithium', 'Other lithium (80%)'], ['agm', 'AGM lead-acid (50%)'], ['flooded', 'Flooded lead-acid (50%)']], saved.battery) + '</select>') +
      OG.field('System voltage', '<select name="voltage">' + OG.opt([12, 24, 48], saved.voltage) + '</select>') + '</div></form><div id="out"></div>';
    return {
      html: html, mount: function (el) {
        var form = OG.$('form', el);
        var readLoads = function () { var d = OG.formData(form), out = []; for (var i = 0; ('n' + i) in d; i++) out.push({ name: d['n' + i], w: d['w' + i] || 0, h: d['h' + i] || 0, qty: d['q' + i] == null ? 1 : d['q' + i] }); return out; };
        var run = function () {
          var d = OG.formData(form), l = readLoads(); OG.db.set('calc:loads', l); OG.db.set('calc:solar', { psh: d.psh, autonomy: d.autonomy, battery: d.battery, voltage: +d.voltage });
          var r = C.solar({ loads: l, psh: d.psh, autonomy: d.autonomy, battery: d.battery, voltage: +d.voltage });
          OG.$('#out', el).innerHTML = OG.card('<table><tr><th>Daily energy</th><td><b>' + r.whDay + ' Wh</b></td></tr><tr><th>Panel size (+20% margin)</th><td><b>' + r.panelW + ' W</b></td></tr><tr><th>Battery (usable ' + Math.round(r.dod * 100) + '%)</th><td><b>' + r.batteryWh + ' Wh</b> ≈ ' + r.batteryAh + ' Ah at ' + d.voltage + ' V</td></tr></table><p class="muted small">Panel W = daily Wh ÷ (sun hours × 0.75 system efficiency). Fuse every battery connection. Avoid charging lithium below freezing.</p>');
        };
        form.oninput = run; run();
        OG.$('#addload', el).onclick = function () { var l = readLoads(); l.push({ name: 'Device', w: 10, h: 1, qty: 1 }); OG.db.set('calc:loads', l); OG.refresh(); };
        OG.$$('[data-rm]', el).forEach(function (b) { b.onclick = function () { var l = readLoads(); l.splice(+b.dataset.rm, 1); OG.db.set('calc:loads', l); OG.refresh(); }; });
      }
    };
  });

  OG.route('/calc/supplies', function () {
    var plan = OG.plan(), rates = OG.db.get('calc:rates', null) || C.SUPPLY_RATES, items = OG.db.all('items');
    var html = OG.header('Medical, hygiene & equipment reserves', 'Edit per-day rates to match your habits', '#/foodwater') +
      '<form class="card"><div class="form-grid">' + OG.field('Days', num('days', plan.days)) + OG.field('Reserve %', num('reserve', plan.reserve)) + '</div><table><tr><th>Item</th><th>Per day</th><th>Need</th></tr>' +
      rates.map(function (r, i) { return '<tr><td>' + esc(r.name) + ' <small class="muted">(' + r.unit + ')</small></td><td style="width:90px">' + num('r' + i, Math.round(r.perDay * 1000) / 1000) + '</td><td id="need' + i + '"></td></tr>'; }).join('') + '</table>' +
      '<button type="button" class="btn" id="reset">Reset rates</button></form>';
    var t1 = OG.CATALOG.filter(function (c) { return c.tier === 1; });
    html += OG.card('<h2>Tier 1 equipment reserves</h2><table><tr><th>Item</th><th>Suggested</th><th>You have</th></tr>' + t1.map(function (c) {
      var need = c.consumable ? Math.ceil(c.per180 * plan.days / 180 * (1 + plan.reserve / 100)) : c.per180;
      var have = items.filter(function (i) { return i.catalogId === c.id && i.condition !== 'Broken'; }).reduce(function (a, i) { return a + (+i.qty || 0); }, 0);
      return '<tr><td><a href="#/catalog/' + c.id + '">' + esc(c.name) + '</a></td><td>' + need + ' ' + c.unit + '</td><td>' + (have >= need ? OG.pill(have, 'ok') : OG.pill(have, have ? 'warn' : 'bad')) + '</td></tr>';
    }).join('') + '</table>');
    return {
      html: html, mount: function (el) {
        var form = OG.$('form', el);
        var run = function () {
          var d = OG.formData(form), nr = rates.map(function (r, i) { return Object.assign({}, r, { perDay: d['r' + i] || 0 }); });
          OG.db.set('calc:rates', nr);
          C.supplies(d.days || 0, d.reserve || 0, nr).forEach(function (s, i) { OG.$('#need' + i, el).textContent = s.qty + ' ' + s.unit; });
        };
        form.oninput = run; run();
        OG.$('#reset', el).onclick = function () { OG.db.set('calc:rates', null); OG.refresh(); };
      }
    };
  });

  OG.route('/calc/depletion', function () {
    var st = OG.status(), today = OG.todayISO();
    var rows = st.depletion.map(function (d) {
      return '<tr><td><a href="' + (d.kind === 'meds' ? '#/medical/meds' : '#/inventory/item/' + d.id) + '">' + esc(d.name) + '</a></td><td>' + OG.fmt.days(d.days) + '</td><td>' + (isFinite(d.days) ? OG.addDays(today, d.days) : '—') + '</td><td>' + (d.days >= st.remaining ? OG.pill('OK', 'ok') : OG.pill('short ' + (st.remaining - d.days) + 'd', d.days < 14 ? 'bad' : 'warn')) + '</td></tr>';
    }).join('');
    return OG.header('Supply depletion', st.remaining + ' plan days remaining', '#/foodwater') +
      OG.card('<table><tr><th>Supply</th><th>Days left</th><th>Runs out</th><th></th></tr>' +
        '<tr><td>Food (all, by calories)</td><td>' + OG.fmt.days(st.foodDays) + '</td><td>' + (isFinite(st.foodDays) ? OG.addDays(today, Math.floor(st.foodDays)) : '—') + '</td><td>' + OG.pill(st.foodDays >= st.remaining ? 'OK' : 'short', OG.levelOf(st.foodDays / st.remaining)) + '</td></tr>' +
        '<tr><td>Stored water</td><td>' + OG.fmt.days(st.waterDays) + '</td><td>' + (isFinite(st.waterDays) ? OG.addDays(today, Math.floor(st.waterDays)) : '—') + '</td><td>' + OG.pill(st.waterDays >= st.remaining ? 'OK' : 'short', OG.levelOf(st.waterDays / st.remaining)) + '</td></tr>' + rows + '</table>' +
        (rows ? '' : '<p class="muted">Set "Daily use" on consumable inventory items and medications to see their run-out dates.</p>'));
  });
})();
