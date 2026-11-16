/* Settings: accessibility, units, display modes, backups, updates. */
(function () {
  OG.RELEASES_URL = 'https://github.com/mrsirwithpizza101/Survival-App/releases?q=offgrid180';
  OG.route('/settings', function () {
    var s = OG.settings(), plan = OG.plan(), last = OG.db.get('lastBackup', null);
    var html = OG.header('Settings', 'Accessibility, display, backups') +
      '<form class="card" id="sf"><h2>Display & accessibility</h2>' +
      OG.field('Text size: <b id="fsv">' + Math.round(s.fontScale * 100) + '%</b>', '<input type="range" name="fontScale" min="0.85" max="1.6" step="0.05" value="' + s.fontScale + '" aria-label="Text size">') +
      OG.field('Display mode', '<select name="theme">' + OG.opt([['dark', 'Dark (OLED, saves battery)'], ['night', 'Low-light red (keeps night vision)'], ['contrast', 'High contrast'], ['light', 'Light (bright sun)']], s.theme) + '</select>') +
      OG.field('Units', '<select name="units">' + OG.opt([['imperial', 'Imperial (lb, gal, °F, mi)'], ['metric', 'Metric (kg, L, °C, km)']], s.units) + '</select>') +
      OG.field('Read-aloud speed', '<select name="speechRate">' + OG.opt([[0.8, 'Slow'], [1, 'Normal'], [1.25, 'Fast']], s.speechRate) + '</select>') +
      '<label class="check"><input type="checkbox" name="reduceMotion"' + (s.reduceMotion ? ' checked' : '') + '><span>Reduce motion and animations</span></label>' +
      '<button type="button" class="btn" id="tts">' + OG.icon('speak') + ' Test read-aloud</button></form>' +
      OG.card('<h2>Survival plan</h2><p>' + plan.days + ' days from ' + plan.start + ' · reserve ' + plan.reserve + '%</p><form id="pf"><div class="form-grid">' +
        OG.field('Start date', '<input type="date" name="start" value="' + plan.start + '">') + OG.field('Length', '<select name="days">' + OG.opt([[90, '90 days'], [120, '120 days'], [180, '180 days']], plan.days) + '</select>') +
        OG.field('Reserve %', '<input type="number" name="reserve" value="' + plan.reserve + '">') + '</div><button class="btn primary">Save plan</button> <a class="btn" href="#/calc/profile">Body profile</a></form>') +
      OG.card('<h2>Backup & restore</h2><p>All data stays on this device. Export a backup regularly and keep a copy on another device or SD card.</p><p class="muted small">Last backup: ' + (last || 'never') + (OG.db.usingFallback() ? ' · storage: basic mode' : ' · storage: IndexedDB') + '</p>' +
        '<div class="row gap"><button class="btn primary" id="exp">Export backup (.json)</button><button class="btn" id="imp">Import backup</button></div><p id="usage" class="muted small"></p>') +
      OG.card('<h2>Updates</h2><p>Version <b>' + OG.VERSION + '</b>. The app never needs internet to work. When you are online you can check for a newer version.</p><button class="btn" id="upd">Check for updates</button>') +
      OG.card('<h2>Danger zone</h2><button class="btn danger" id="wipe">' + OG.icon('trash') + ' Erase all data on this device</button>');
    return {
      html: html, mount: function (el) {
        var sf = OG.$('#sf', el);
        sf.oninput = sf.onchange = function () {
          var d = OG.formData(sf); d.fontScale = +d.fontScale; d.speechRate = +d.speechRate;
          OG.db.set('settings', Object.assign(OG.settings(), d)); OG.applySettings(); OG.$('#fsv', el).textContent = Math.round(d.fontScale * 100) + '%';
        };
        OG.$('#tts', el).onclick = function () { OG.speak('Read aloud is working. OFFGRID 180 can read any guide or emergency procedure.'); };
        OG.$('#pf', el).onsubmit = function (e) { e.preventDefault(); var d = OG.formData(e.target); OG.db.set('plan', { start: d.start, days: +d.days, reserve: +d.reserve || 0 }); OG.toast('Plan saved'); OG.refresh(); };
        OG.$('#exp', el).onclick = function () { OG.saveFile('offgrid180-backup-' + OG.todayISO() + '.json', JSON.stringify(OG.db.exportAll())); OG.db.set('lastBackup', new Date().toLocaleString()); setTimeout(OG.refresh, 500); };
        OG.$('#imp', el).onclick = function () {
          OG.pickFile('application/json,.json').then(function (f) { return f && OG.readText(f); }).then(function (txt) {
            if (!txt) return; var data = JSON.parse(txt);
            OG.confirm('Import this backup? Matching records will be replaced; others are kept.', function () { try { OG.db.importAll(data); OG.db.flush().then(function () { OG.applySettings(); OG.toast('Backup imported'); OG.refresh(); }); } catch (e) { OG.toast(e.message); } });
          }).catch(function () { OG.toast('That file is not a valid backup.'); });
        };
        if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) { OG.$('#usage', el).textContent = 'Using ' + (e.usage / 1048576).toFixed(1) + ' MB of local storage.'; });
        OG.$('#upd', el).onclick = function () {
          if (!navigator.onLine) return OG.toast('Offline — connect to the internet to check for updates.');
          var n = OG.native(); if (n && n.openUrl) n.openUrl(OG.RELEASES_URL);
          else if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.getRegistration().then(function (r) { r && r.update(); OG.toast('Checking… the update loads next time you open the app.'); });
          else window.open(OG.RELEASES_URL, '_blank');
        };
        OG.$('#wipe', el).onclick = function () { OG.confirm('Erase ALL inventory, logs, plans and progress? Export a backup first.', function () { OG.db.wipe().then(function () { location.hash = '#/welcome'; location.reload(); }); }); };
      }
    };
  });
})();
