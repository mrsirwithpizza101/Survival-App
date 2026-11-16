/* Medical Center: first aid, medications, medical info card, hygiene, mental health tools. */
(function () {
  var esc = OG.esc;
  OG.route('/medical', function () {
    var meds = OG.db.all('meds'), st = OG.status();
    var quick = [['med-bleeding', 'Severe bleeding'], ['med-burns', 'Burns'], ['med-fractures', 'Fractures & sprains'], ['med-cold', 'Hypothermia & frostbite'], ['med-heat', 'Heat illness'], ['med-wounds', 'Wounds & infection']];
    return OG.header('Medical Center', 'First aid, medications, hygiene and mental health') +
      OG.card('<div class="warnbox">This app does not diagnose or prescribe. For life threats, activate SOS / call 911. Take a Wilderness First Aid course before your stay.</div>' +
        '<a class="btn danger big" href="#/emergency/tree/medical">' + OG.icon('siren') + ' Guided medical emergency</a>') +
      '<div class="grid" style="margin-bottom:12px">' + quick.map(function (q) { return '<a class="tile" href="#/article/' + q[0] + '?from=/medical">' + OG.icon('med') + '<b>' + q[1] + '</b></a>'; }).join('') + '</div>' +
      '<div class="grid wide" style="margin-bottom:12px">' +
      '<a class="tile" href="#/medical/meds">' + OG.icon('clip') + '<b>Medications (' + meds.length + ')</b><small>' + (st.medMin == null ? 'Track counts, doses and expiry' : 'Shortest supply: ' + OG.fmt.days(st.medMin)) + '</small></a>' +
      '<a class="tile" href="#/medical/info">' + OG.icon('heart') + '<b>My medical info card</b><small>Allergies, conditions, blood type — shown on the SOS screen</small></a>' +
      '<a class="tile" href="#/medical/breathe">' + OG.icon('brain') + '<b>Breathing exercise</b><small>Guided box breathing for stress</small></a>' +
      '<a class="tile" href="#/ops/journal">' + OG.icon('book') + '<b>Mood & sleep journal</b><small>Daily log in Daily Operations</small></a>' +
      '<a class="tile" href="#/calc/supplies">' + OG.icon('calc') + '<b>Medical & hygiene supplies</b><small>How much to stock</small></a></div>' +
      OG.card('<h2>Mental health support</h2><p>Isolation is hard. Keep routines, stay in contact, and reach out early. In the U.S. call or text <b>988</b> (Suicide & Crisis Lifeline) when you have signal. If you are in immediate danger, use your satellite SOS.</p>') +
      OG.moduleBlocks(['medical', 'hygiene', 'mental']);
  });

  function medForm(m) {
    m = m || { name: '', dose: '', perDay: 1, count: 0, rx: true };
    return '<form id="mf">' + OG.field('Medication', '<input name="name" required value="' + esc(m.name) + '">') + '<div class="form-grid">' +
      OG.field('Dose / instructions', '<input name="dose" value="' + esc(m.dose || '') + '" placeholder="e.g., 10 mg each morning">') +
      OG.field('Doses per day', '<input type="number" step="any" name="perDay" value="' + esc(m.perDay) + '">') +
      OG.field('Count on hand (doses)', '<input type="number" step="any" name="count" value="' + esc(m.count) + '">') +
      OG.field('Expires', '<input type="date" name="expires" value="' + esc(m.expires || '') + '">') +
      OG.field('Storage', '<input name="storage" value="' + esc(m.storage || '') + '" placeholder="cool, dry, original bottle">') + '</div>' +
      '<label class="check"><input type="checkbox" name="rx"' + (m.rx ? ' checked' : '') + '><span>Prescription (critical)</span></label>' +
      OG.field('Notes (purpose, interactions, prescriber)', '<textarea name="notes" rows="2">' + esc(m.notes || '') + '</textarea>') + '</form>';
  }
  OG.route('/medical/meds', function () {
    var meds = OG.db.all('meds').slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    var html = OG.header('Medications', 'Count, daily use and expiry', '#/medical') +
      '<button class="btn primary" id="add">' + OG.icon('plus') + ' Add medication</button>' +
      OG.card(meds.length ? '<ul class="list">' + meds.map(function (m) {
        var d = OG.calc.daysLeft(+m.count || 0, +m.perDay || 0), exp = m.expires ? OG.daysUntil(m.expires) : null;
        return '<li class="li"><span class="grow"><b>' + esc(m.name) + '</b> ' + (m.rx ? OG.pill('Rx', 'acc') : '') + '<small>' + esc(m.dose || '') + ' · ' + (m.count || 0) + ' doses · ' + OG.fmt.days(d) + ' left' + (m.expires ? ' · exp ' + m.expires : '') + '</small>' +
          (exp != null && exp < 0 ? OG.pill('expired', 'bad') : '') + (d < OG.status().remaining ? OG.pill('runs out before plan ends', 'warn') : '') + '</span>' +
          '<button class="btn" data-take="' + m.id + '">Took dose</button><button class="icon-btn" data-edit="' + m.id + '" aria-label="Edit ' + esc(m.name) + '">' + OG.icon('edit') + '</button></li>';
      }).join('') + '</ul>' : '<p class="muted">No medications recorded. Discuss a 3–6 month supply and emergency plan with your doctor before you go.</p>', '') +
      OG.card('<h2>Medication safety</h2><ul><li>Keep medicines in original labeled containers, dry, away from heat and freezing.</li><li>Never change prescription doses without medical advice.</li><li>Ask a pharmacist before combining over-the-counter drugs.</li><li>Expired medicines may be less effective; plan replacements.</li></ul><a href="#/article/med-medications">Full guide →</a>');
    return {
      html: html, mount: function (el) {
        var open = function (m) {
          OG.modal(m ? 'Edit medication' : 'Add medication', medForm(m), [
            m ? { label: 'Delete', cls: 'danger', fn: function () { OG.db.del('meds', m.id); OG.refresh(); } } : { label: 'Cancel' },
            { label: 'Save', cls: 'primary', fn: function (box) { var d = OG.formData(OG.$('#mf', box)); if (!d.name) { OG.toast('Name required'); return false; } OG.db.put('meds', Object.assign({}, m || {}, d)); OG.refresh(); } }]);
        };
        OG.$('#add', el).onclick = function () { open(null); };
        OG.$$('[data-edit]', el).forEach(function (b) { b.onclick = function () { open(OG.db.all('meds').find(function (x) { return x.id === b.dataset.edit; })); }; });
        OG.$$('[data-take]', el).forEach(function (b) { b.onclick = function () { var m = OG.db.all('meds').find(function (x) { return x.id === b.dataset.take; }); m.count = Math.max(0, (+m.count || 0) - 1); OG.db.put('meds', m); OG.toast('Dose logged'); OG.refresh(); }; });
      }
    };
  });

  OG.route('/medical/info', function () {
    var i = OG.db.get('medinfo', {});
    var f = function (n, l, ph) { return OG.field(l, '<textarea name="' + n + '" rows="2" placeholder="' + (ph || '') + '">' + esc(i[n] || '') + '</textarea>'); };
    var html = OG.header('My medical info card', 'Shown on the SOS screen for rescuers', '#/medical') +
      '<form class="card">' + OG.field('Full name', '<input name="name" value="' + esc(i.name || '') + '">') + '<div class="form-grid">' +
      OG.field('Date of birth', '<input type="date" name="dob" value="' + esc(i.dob || '') + '">') + OG.field('Blood type', '<input name="blood" value="' + esc(i.blood || '') + '">') + '</div>' +
      f('allergies', 'Allergies', 'Medications, foods, stings') + f('conditions', 'Medical conditions') + f('meds', 'Current medications', 'Name, dose') +
      f('contacts', 'Emergency contacts', 'Name, phone, relationship') + f('notes', 'Other (implants, pregnancy, doctor)') +
      '<button class="btn primary block">Save</button></form>';
    return { html: html, mount: function (el) { OG.$('form', el).onsubmit = function (e) { e.preventDefault(); OG.db.set('medinfo', OG.formData(e.target)); OG.toast('Saved'); }; } };
  });

  OG.route('/medical/breathe', function () {
    var timer = null;
    return {
      html: OG.header('Box breathing', 'In 4 · hold 4 · out 4 · hold 4', '#/medical') + OG.card(OG.DIAGRAMS.breathing +
        '<p id="phase" class="tree-node" style="text-align:center;font-size:2rem" aria-live="assertive">Ready</p><p id="count" style="text-align:center;font-size:3rem;font-weight:800">4</p>' +
        '<div class="row gap"><button class="btn primary grow" id="go">Start (3 min)</button><button class="btn" id="stop">Stop</button></div><p class="muted small">Slow breathing lowers heart rate and helps you think clearly. Stop if you feel dizzy.</p>'),
      mount: function (el) {
        var phases = ['Breathe in', 'Hold', 'Breathe out', 'Hold'];
        OG.$('#go', el).onclick = function () {
          clearInterval(timer); var t = 0, end = 180;
          var tick = function () {
            var ph = Math.floor(t / 4) % 4, c = 4 - (t % 4);
            OG.$('#phase', el).textContent = phases[ph]; OG.$('#count', el).textContent = c;
            if (t % 4 === 0 && OG.native() && OG.native().vibrate) OG.native().vibrate(60); else if (t % 4 === 0 && navigator.vibrate) navigator.vibrate(60);
            if (++t > end) { clearInterval(timer); OG.$('#phase', el).textContent = 'Done — well done.'; }
          };
          tick(); timer = setInterval(tick, 1000);
        };
        OG.$('#stop', el).onclick = function () { clearInterval(timer); OG.$('#phase', el).textContent = 'Stopped'; };
      },
      unmount: function () { clearInterval(timer); }
    };
  });
})();
