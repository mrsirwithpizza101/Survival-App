/* Dashboard — Survival Command Center. */
(function () {
  function checklistHTML(limit) {
    var today = OG.todayISO(), checks = OG.db.get('checks', {})[today] || {}, tasks = OG.tasks();
    var done = tasks.filter(function (t) { return checks[t.id]; }).length;
    return '<div class="row between"><h2>Today\'s checklist</h2><span class="pill ' + OG.levelOf(done / tasks.length) + '">' + done + '/' + tasks.length + '</span></div>' + OG.meter(done / tasks.length, OG.levelOf(done / tasks.length)) +
      '<div>' + tasks.slice(0, limit || tasks.length).map(function (t) {
        return '<label class="check' + (checks[t.id] ? ' done' : '') + '"><input type="checkbox" data-task="' + t.id + '"' + (checks[t.id] ? ' checked' : '') + '><span>' + OG.esc(t.text) + '</span></label>';
      }).join('') + '</div>' + (limit && tasks.length > limit ? '<a href="#/ops">All ' + tasks.length + ' tasks →</a>' : '');
  }
  OG.checklistHTML = checklistHTML;
  OG.bindChecklist = function (el) {
    OG.$$('[data-task]', el).forEach(function (cb) {
      cb.onchange = function () {
        var all = OG.db.get('checks', {}), d = OG.todayISO(); all[d] = all[d] || {};
        all[d][cb.dataset.task] = cb.checked; OG.db.set('checks', all); OG.refresh();
      };
    });
  };

  OG.route('/dashboard', function () {
    var st = OG.status(), plan = OG.plan(), C = OG.calc;
    var dayLine = st.started ? (st.day > plan.days ? 'Plan complete (day ' + st.day + ')' : 'Day ' + st.day + ' of ' + plan.days) : 'Plan starts ' + plan.start;
    var power = OG.db.get('power', null), wx = OG.db.all('weather').slice(-1)[0], fc = OG.db.get('forecast', null);
    var alerts = OG.alerts(st);
    var stat = function (href, label, value, sub, frac) {
      return '<a class="stat" href="' + href + '"><div class="l">' + label + '</div><div class="v">' + value + '</div><div class="l">' + sub + '</div>' + (frac != null ? OG.meter(frac, OG.levelOf(frac)) : '') + '</a>';
    };
    var html = '<div class="card"><div class="row between"><div><div class="muted small">SURVIVAL DAY</div><h1>' + dayLine + '</h1><div class="muted">' + st.remaining + ' days remaining · ' + plan.reserve + '% reserve</div></div>' +
      '<div style="text-align:right"><div class="score" aria-label="Preparedness score">' + st.score + '</div><div class="muted small">preparedness</div></div></div>' +
      OG.meter(st.started ? Math.min(1, st.day / plan.days) : 0) + '</div>' +
      '<a class="btn danger big" href="#/emergency" style="margin-bottom:12px">' + OG.icon('siren') + ' EMERGENCY CENTER</a>' +
      '<div class="grid" style="margin-bottom:12px">' +
      stat('#/foodwater', 'Food', OG.fmt.days(st.foodDays), OG.fmt.num(st.foodKcal / 1000, 0) + 'k kcal stored', st.foodDays / st.remaining) +
      stat('#/foodwater', 'Water', OG.fmt.days(st.waterDays), OG.fmt.L(st.waterL) + ' stored', st.waterDays / st.remaining) +
      stat('#/inventory?cat=Fire', 'Fuel', st.fuelDays == null ? '—' : OG.fmt.days(st.fuelDays), st.fuelDays == null ? 'set daily use on fuel items' : 'shortest fuel supply', st.fuelDays == null ? null : st.fuelDays / st.remaining) +
      stat('#/ops/power', 'Energy', power ? power.pct + '%' : '—', power ? 'battery bank · ' + power.date : 'tap to log battery', power ? power.pct / 100 : null) +
      '<span class="stat" id="dev-batt"><div class="l">This device</div><div class="v">—</div><div class="l">phone battery</div></span>' +
      stat('#/medical/meds', 'Medical', st.medMin == null ? (st.medProblems ? st.medProblems + ' issues' : 'OK') : OG.fmt.days(st.medMin), st.medMin == null ? 'supplies status' : 'shortest medication', st.medMin == null ? null : st.medMin / st.remaining) +
      stat('#/maps/weather', 'Weather', wx ? (wx.pressure ? wx.pressure + ' hPa' : (wx.tempC != null ? OG.fmt.temp(wx.tempC) : 'logged')) : (fc ? 'forecast' : '—'), wx ? 'last log ' + wx.date : (fc ? 'saved ' + fc.saved.slice(0, 10) : 'log observations'), null) +
      '</div>';
    if (alerts.length) html += OG.card('<h2>Alerts</h2><ul class="list">' + alerts.map(function (a) { return '<li><a class="li" href="' + a.href + '">' + OG.pill(a.sev === 'bad' ? 'urgent' : 'watch', a.sev) + '<span class="grow">' + OG.esc(a.text) + '</span></a></li>'; }).join('') + '</ul>', alerts.some(function (a) { return a.sev === 'bad'; }) ? 'alert' : '');
    if (st.maintDue.length) html += OG.card('<h2>Maintenance due</h2><ul class="list">' + st.maintDue.slice(0, 8).map(function (i) {
      return '<li class="li"><span class="grow">' + OG.esc(i.name) + '<small>every ' + i.maintDays + ' days · last ' + (i.lastMaint || 'never') + '</small></span><button class="btn" data-maint="' + i.id + '">Done</button></li>';
    }).join('') + '</ul>');
    html += OG.card(checklistHTML(6));
    html += OG.card('<h2>Preparedness breakdown</h2>' + st.parts.map(function (p) {
      return '<div class="row between small"><span>' + p.name + '</span><span>' + Math.round(p.v * 100) + '%</span></div>' + OG.meter(p.v, OG.levelOf(p.v));
    }).join('') + '<p class="muted small">Food and water compare stored supply to days remaining. Life-critical gear: ' + st.t1Have + ' of ' + st.t1Total + ' Tier 1 catalog items in your inventory.</p>');
    html += '<h2>Sections</h2><div class="grid">' + OG.SECTIONS.filter(function (s) { return s.id !== 'dashboard'; }).map(function (s) {
      return '<a class="tile" href="#/' + s.id + '">' + OG.icon(s.icon) + '<b>' + s.name + '</b><small>' + s.blurb + '</small></a>';
    }).join('') + '</div>';
    return {
      html: html, mount: function (el) {
        OG.bindChecklist(el);
        OG.$$('[data-maint]', el).forEach(function (b) { b.onclick = function () { var it = OG.db.all('items').find(function (x) { return x.id === b.dataset.maint; }); it.lastMaint = OG.todayISO(); OG.db.put('items', it); OG.toast('Maintenance logged'); OG.refresh(); }; });
        var box = OG.$('#dev-batt', el);
        if (navigator.getBattery) navigator.getBattery().then(function (b) { OG.$('.v', box).textContent = Math.round(b.level * 100) + '%'; OG.$$('.l', box)[1].textContent = b.charging ? 'charging' : 'phone battery'; }).catch(function () { });
        else { var n = OG.native(), b = n && n.battery ? n.battery() : -1; if (b >= 0) OG.$('.v', box).textContent = b + '%'; }
      }
    };
  });
})();
