/* Daily Operations: checklist, logs (water, food, power, journal, check-ins), routines, history. */
(function () {
  var esc = OG.esc;
  OG.route('/ops', function () {
    var st = OG.status(), today = OG.todayISO(), j = OG.db.all('journal').filter(function (x) { return x.date === today; })[0];
    var checks = OG.db.get('checks', {}), streak = 0;
    for (var i = 0; i < 365; i++) { var d = OG.addDays(today, -i), c = checks[d] || {}, n = OG.tasks().filter(function (t) { return c[t.id]; }).length; if (n >= OG.tasks().length * 0.75) streak++; else if (i > 0) break; }
    var ck = OG.db.all('checkins').slice(-1)[0];
    var html = OG.header('Daily Operations', st.started ? 'Day ' + st.day + ' · ' + st.remaining + ' days remaining' : 'Plan starts ' + OG.plan().start) +
      OG.card(OG.checklistHTML() + '<div class="row gap" style="margin-top:8px"><a class="btn" href="#/ops/tasks">' + OG.icon('edit') + ' Edit tasks</a><a class="btn" href="#/ops/history">History · ' + streak + '-day streak</a></div>') +
      '<h2>Quick logs</h2><div class="grid" style="margin-bottom:12px">' +
      '<button class="tile" id="log-water">' + OG.icon('drop') + '<b>Water used</b><small>Subtract from stored water</small></button>' +
      '<button class="tile" id="log-food">' + OG.icon('food') + '<b>Food used</b><small>Subtract from a food item</small></button>' +
      '<a class="tile" href="#/ops/power">' + OG.icon('battery') + '<b>Battery level</b><small>' + (OG.db.get('power') ? OG.db.get('power').pct + '% on ' + OG.db.get('power').date : 'Not logged') + '</small></a>' +
      '<a class="tile" href="#/ops/journal">' + OG.icon('brain') + '<b>Journal</b><small>' + (j ? 'Mood ' + j.mood + '/5 · sleep ' + j.sleep + ' h' : 'Not logged today') + '</small></a>' +
      '<button class="tile" id="log-checkin">' + OG.icon('radio') + '<b>Check-in sent</b><small>' + (ck ? 'Last: ' + new Date(ck.t).toLocaleString() : 'None logged') + '</small></button>' +
      '<a class="tile" href="#/maps/weather">' + OG.icon('cloud') + '<b>Weather</b><small>Log observation</small></a></div>' +
      (st.maintDue.length ? OG.card('<h2>Maintenance due (' + st.maintDue.length + ')</h2><ul class="list">' + st.maintDue.map(function (i) { return '<li><a class="li" href="#/inventory/item/' + i.id + '"><span class="grow">' + esc(i.name) + '<small>every ' + i.maintDays + ' days</small></span></a></li>'; }).join('') + '</ul>') : '') +
      OG.card('<h2>Weekly routine</h2><ul><li><b>Weekly:</b> inventory count, shelter & tool inspection, filter backflush, laundry, chimney check during heating season, review alerts.</li><li><b>Monthly:</b> first-aid kit restock, go-bag check, PLB self-test, rotate stored water (6 months), review exit plan and rescue plan.</li></ul><a class="btn" href="#/calc/depletion">Supply depletion report</a>') +
      OG.moduleBlocks(['shelter']);
    return {
      html: html, mount: function (el) {
        OG.bindChecklist(el);
        var pick = function (filter, title, unitLabel, apply) {
          var list = OG.db.all('items').filter(filter);
          if (!list.length) return OG.toast('Add items first in Inventory.');
          OG.modal(title, OG.field('Item', '<select id="lp">' + list.map(function (i) { return '<option value="' + i.id + '">' + esc(i.name) + ' (' + i.qty + ' ' + esc(i.unit || '') + ')</option>'; }).join('') + '</select>') +
            OG.field('Amount used (' + unitLabel + ')', '<input type="number" step="any" id="la" value="1">'), [{ label: 'Cancel' }, { label: 'Log', cls: 'primary', fn: function (box) {
              var it = list.find(function (x) { return x.id === OG.$('#lp', box).value; }), amt = +OG.$('#la', box).value || 0; apply(it, amt); OG.db.put('items', it); OG.toast('Logged'); setTimeout(OG.refresh, 0);
            } }]);
        };
        OG.$('#log-water', el).onclick = function () { pick(function (i) { return +i.liters > 0; }, 'Log water used', OG.u.vUnit(), function (it, amt) { it.qty = Math.max(0, +it.qty - OG.u.vOut(amt) / it.liters); it.qty = Math.round(it.qty * 100) / 100; }); };
        OG.$('#log-food', el).onclick = function () { pick(function (i) { return +i.kcal > 0; }, 'Log food used', 'item units', function (it, amt) { it.qty = Math.max(0, Math.round((+it.qty - amt) * 100) / 100); }); };
        OG.$('#log-checkin', el).onclick = function () { OG.db.put('checkins', { t: Date.now(), date: OG.todayISO() }); var all = OG.db.get('checks', {}), d = OG.todayISO(); all[d] = all[d] || {}; all[d]['t-checkin'] = true; OG.db.set('checks', all); OG.toast('Check-in logged'); OG.refresh(); };
      }
    };
  });

  OG.route('/ops/tasks', function () {
    var tasks = OG.tasks();
    return {
      html: OG.header('Edit daily tasks', 'One task per line', '#/ops') + OG.card('<textarea id="tt" rows="14">' + esc(tasks.map(function (t) { return t.text; }).join('\n')) + '</textarea><div class="row gap" style="margin-top:8px"><button class="btn primary grow" id="save">Save</button><button class="btn" id="reset">Restore defaults</button></div>'),
      mount: function (el) {
        OG.$('#save', el).onclick = function () {
          var lines = OG.$('#tt', el).value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
          var old = OG.tasks();
          OG.db.set('tasks', lines.map(function (text) { var o = old.find(function (t) { return t.text === text; }); return { id: o ? o.id : 't-' + OG.uid(), text: text }; }));
          OG.toast('Tasks saved'); location.hash = '#/ops';
        };
        OG.$('#reset', el).onclick = function () { OG.db.set('tasks', null); OG.refresh(); };
      }
    };
  });

  OG.route('/ops/history', function () {
    var checks = OG.db.get('checks', {}), tasks = OG.tasks(), today = OG.todayISO(), rows = '';
    for (var i = 0; i < 21; i++) {
      var d = OG.addDays(today, -i), c = checks[d] || {}, n = tasks.filter(function (t) { return c[t.id]; }).length;
      rows += '<tr><td>' + d + '</td><td style="width:50%">' + OG.meter(n / tasks.length, OG.levelOf(n / tasks.length)) + '</td><td>' + n + '/' + tasks.length + '</td></tr>';
    }
    return OG.header('Checklist history', 'Last 21 days', '#/ops') + OG.card('<table>' + rows + '</table>');
  });

  OG.route('/ops/power', function () {
    var p = OG.db.get('power', { pct: 100 }), hist = OG.db.get('powerlog', []);
    return {
      html: OG.header('Battery & energy', 'Log your battery bank / power station level', '#/ops') +
        OG.card('<form id="pf">' + OG.field('Battery bank level (%)', '<input type="range" min="0" max="100" name="pct" value="' + p.pct + '" oninput="this.nextElementSibling.textContent=this.value+\'%\'"><b>' + p.pct + '%</b>') + '<button class="btn primary block">Save</button></form>') +
        OG.card('<h2>History</h2>' + (hist.length ? '<table>' + hist.slice(-14).reverse().map(function (h) { return '<tr><td>' + h.date + '</td><td>' + h.pct + '%</td></tr>'; }).join('') + '</table>' : '<p class="muted">No history.</p>') + '<a href="#/calc/solar">Size your solar system →</a>'),
      mount: function (el) {
        OG.$('#pf', el).onsubmit = function (e) { e.preventDefault(); var pct = +OG.formData(e.target).pct; var rec = { pct: pct, date: OG.todayISO() }; OG.db.set('power', rec); hist.push(rec); OG.db.set('powerlog', hist.slice(-200)); OG.toast('Saved'); location.hash = '#/dashboard'; };
      }
    };
  });

  OG.route('/ops/journal', function () {
    var list = OG.db.all('journal').slice().sort(function (a, b) { return b.date < a.date ? -1 : 1; }), today = OG.todayISO();
    var cur = list.find(function (x) { return x.date === today; }) || { date: today, mood: 3, sleep: 7, energy: 3, notes: '' };
    var html = OG.header('Journal: mood & sleep', 'A daily record helps you notice changes early', '#/ops') +
      '<form class="card" id="jf"><div class="form-grid">' + OG.field('Date', '<input type="date" name="date" value="' + cur.date + '">') +
      OG.field('Mood (1 low – 5 good)', '<select name="mood">' + OG.opt([1, 2, 3, 4, 5], cur.mood) + '</select>') +
      OG.field('Energy (1–5)', '<select name="energy">' + OG.opt([1, 2, 3, 4, 5], cur.energy) + '</select>') +
      OG.field('Sleep (hours)', '<input type="number" step="0.5" name="sleep" value="' + cur.sleep + '">') + '</div>' +
      OG.field('Notes — what went well, what to change tomorrow', '<textarea name="notes" rows="4">' + esc(cur.notes || '') + '</textarea>') + '<button class="btn primary block">Save entry</button></form>';
    var recent = list.slice(0, 7), low = recent.filter(function (x) { return +x.mood <= 2; }).length;
    if (low >= 3) html += OG.card('<h2>Checking in</h2><p>Your mood has been low on ' + low + ' of the last ' + recent.length + ' entries. Reach out to someone you trust, keep your routine, and get daylight and rest. In the U.S. call or text 988 when you have signal. If you feel unsafe, use your SOS device.</p><a class="btn" href="#/medical/breathe">Breathing exercise</a>', 'alert');
    html += OG.card('<h2>Recent</h2>' + (list.length ? '<table><tr><th>Date</th><th>Mood</th><th>Energy</th><th>Sleep</th><th>Notes</th></tr>' + list.slice(0, 30).map(function (x) { return '<tr><td>' + x.date + '</td><td>' + x.mood + '</td><td>' + (x.energy || '') + '</td><td>' + x.sleep + '</td><td>' + esc((x.notes || '').slice(0, 60)) + '</td></tr>'; }).join('') + '</table>' : '<p class="muted">No entries yet.</p>'));
    return {
      html: html, mount: function (el) {
        OG.$('#jf', el).onsubmit = function (e) {
          e.preventDefault(); var d = OG.formData(e.target), ex = OG.db.all('journal').find(function (x) { return x.date === d.date; });
          OG.db.put('journal', Object.assign({}, ex || {}, d));
          if (d.date === OG.todayISO()) { var all = OG.db.get('checks', {}); all[d.date] = all[d.date] || {}; all[d.date]['t-mind'] = true; OG.db.set('checks', all); }
          OG.toast('Saved'); OG.refresh();
        };
      }
    };
  });
})();
