/* OFFGRID 180 — derived status for the dashboard, alerts and depletion estimates. */
window.OG = window.OG || {};
(function () {
  OG.DEFAULT_TASKS = [
    { id: 't-water', text: 'Treat and store today\'s water; log liters used' },
    { id: 't-food', text: 'Ration meals to plan; log food used' },
    { id: 't-co', text: 'Check CO/smoke alarm and stove ventilation' },
    { id: 't-shelter', text: 'Inspect shelter, guy-lines and drainage' },
    { id: 't-fire', text: 'Fire safety: water bucket, extinguisher, ashes out cold' },
    { id: 't-wx', text: 'Log weather: pressure, temperature, sky' },
    { id: 't-checkin', text: 'Send scheduled check-in to contact' },
    { id: 't-hyg', text: 'Hygiene: wash, change socks, check feet' },
    { id: 't-health', text: 'Health check: wounds, ticks, meds taken' },
    { id: 't-power', text: 'Charge devices; log battery level' },
    { id: 't-mind', text: 'Journal mood and sleep; one enjoyable activity' },
    { id: 't-inv', text: 'Update inventory counts' }
  ];
  OG.tasks = function () { return OG.db.get('tasks', null) || OG.DEFAULT_TASKS; };

  function itemDays(it) { return OG.calc.daysLeft(+it.qty || 0, +it.dailyUse || 0); }
  OG.itemDays = itemDays;

  OG.status = function () {
    var C = OG.calc, p = OG.profile(), plan = OG.plan(), items = OG.db.all('items'), meds = OG.db.all('meds');
    var day = C.planDay(plan.start), started = day >= 1;
    var remaining = Math.max(0, plan.days - Math.max(day, 1) + 1);
    if (!started) remaining = plan.days;
    var kcalDay = C.dailyKcal(p).total, waterDay = C.dailyWater(p).total;

    var foodKcal = 0, waterL = 0;
    items.forEach(function (it) {
      if (+it.kcal > 0) foodKcal += (+it.qty || 0) * (+it.kcal);
      if (+it.liters > 0) waterL += (+it.qty || 0) * (+it.liters);
    });
    var foodDays = foodKcal / kcalDay, waterDays = waterL / waterDay;

    var fuelItems = items.filter(function (i) { return i.cat === 'Fire' && +i.dailyUse > 0; });
    var fuelDays = fuelItems.length ? Math.min.apply(null, fuelItems.map(itemDays)) : null;

    var depletion = items.filter(function (i) { return +i.dailyUse > 0 && !(+i.kcal > 0) && !(+i.liters > 0); })
      .map(function (i) { return { id: i.id, name: i.name, days: itemDays(i), tier: i.tier, kind: 'items' }; })
      .concat(meds.filter(function (m) { return +m.perDay > 0; }).map(function (m) { return { id: m.id, name: m.name, days: C.daysLeft(+m.count || 0, +m.perDay), tier: m.rx ? 1 : 2, kind: 'meds' }; }))
      .sort(function (a, b) { return a.days - b.days; });
    var short = depletion.filter(function (d) { return d.days < remaining; });

    var expired = [], expiring = [];
    items.concat(meds).forEach(function (i) {
      if (!i.expires) return; var d = OG.daysUntil(i.expires);
      if (d < 0) expired.push(i); else if (d <= 30) expiring.push(i);
    });
    var today = OG.todayISO();
    var maintDue = items.filter(function (i) { return +i.maintDays > 0 && (!i.lastMaint || OG.addDays(i.lastMaint, +i.maintDays) <= today); });

    var medDays = meds.filter(function (m) { return +m.perDay > 0; }).map(function (m) { return C.daysLeft(+m.count || 0, +m.perDay); });
    var medMin = medDays.length ? Math.min.apply(null, medDays) : null;
    var medItems = items.filter(function (i) { return i.cat === 'Medical'; });
    var medProblems = medItems.filter(function (i) { return (i.expires && OG.daysUntil(i.expires) < 0) || +i.qty <= 0; }).length;

    // Tier 1 coverage: catalog life-critical items present in inventory (by catalogId or same category name match).
    var t1 = OG.CATALOG.filter(function (c) { return c.tier === 1; });
    var have = t1.filter(function (c) { return items.some(function (i) { return i.catalogId === c.id && +i.qty > 0 && i.condition !== 'Broken'; }); });

    var prog = OG.db.get('progress', {}), totalA = OG.ARTICLES.length;
    var passed = OG.ARTICLES.filter(function (a) { return prog[a.id] && prog[a.id].quiz; }).length;
    var rescue = OG.db.get('rescue', {}), rFields = ['contactName', 'contactPhone', 'checkin', 'missedRule', 'location', 'hospital', 'routes'];
    var rescueFrac = rFields.filter(function (f) { return rescue[f]; }).length / rFields.length;

    var cap = function (x) { return Math.max(0, Math.min(1, x || 0)); };
    var parts = [
      { name: 'Food', w: 25, v: cap(foodDays / remaining) },
      { name: 'Water', w: 25, v: cap(waterDays / remaining) },
      { name: 'Life-critical gear', w: 20, v: cap(have.length / t1.length) },
      { name: 'Medical', w: 10, v: medItems.length || meds.length ? cap(1 - (medProblems + expired.length) / Math.max(1, medItems.length + meds.length)) * (medMin == null ? 1 : cap(medMin / remaining)) : 0 },
      { name: 'Training', w: 10, v: cap(passed / totalA) },
      { name: 'Rescue plan', w: 10, v: rescueFrac }
    ];
    var score = Math.round(parts.reduce(function (a, b) { return a + b.w * b.v; }, 0));

    return {
      day: day, started: started, remaining: remaining, planDays: plan.days, kcalDay: kcalDay, waterDay: waterDay,
      foodKcal: foodKcal, foodDays: foodDays, waterL: waterL, waterDays: waterDays, fuelDays: fuelDays,
      depletion: depletion, short: short, expired: expired, expiring: expiring, maintDue: maintDue,
      medMin: medMin, medProblems: medProblems, t1Have: have.length, t1Total: t1.length,
      trainingPassed: passed, trainingTotal: totalA, rescueFrac: rescueFrac, parts: parts, score: score
    };
  };

  /* Alerts list for dashboard. */
  OG.alerts = function (st) {
    var a = [];
    if (st.foodDays < st.remaining) a.push({ sev: st.foodDays < 14 ? 'bad' : 'warn', text: 'Food covers ' + OG.fmt.days(st.foodDays) + ' of ' + st.remaining + ' days remaining.', href: '#/foodwater' });
    if (st.waterDays < st.remaining) a.push({ sev: st.waterDays < 3 ? 'bad' : 'warn', text: 'Stored water covers ' + OG.fmt.days(st.waterDays) + '. Make sure your water source and treatment cover the rest.', href: '#/foodwater' });
    st.short.slice(0, 5).forEach(function (d) { a.push({ sev: d.days < 7 ? 'bad' : 'warn', text: d.name + ' runs out in ' + OG.fmt.days(d.days) + '.', href: d.kind === 'meds' ? '#/medical/meds' : '#/inventory/item/' + d.id }); });
    st.expired.slice(0, 3).forEach(function (i) { a.push({ sev: 'bad', text: i.name + ' expired ' + i.expires + '.', href: i.perDay != null ? '#/medical/meds' : '#/inventory/item/' + i.id }); });
    st.expiring.slice(0, 3).forEach(function (i) { a.push({ sev: 'warn', text: i.name + ' expires ' + i.expires + '.', href: i.perDay != null ? '#/medical/meds' : '#/inventory/item/' + i.id }); });
    if (st.rescueFrac < 1) a.push({ sev: 'warn', text: 'Rescue plan is incomplete.', href: '#/emergency/plan' });
    return a;
  };
})();
