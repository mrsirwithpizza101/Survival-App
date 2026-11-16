/* OFFGRID 180 — router and boot. */
(function () {
  var routes = OG._routes;
  var speaking = false, current = null;

  function render() {
    var hash = location.hash.replace(/^#/, '') || '/dashboard';
    var path = hash.split('?')[0], query = new URLSearchParams(hash.split('?')[1] || '');
    var main = OG.$('#main');
    if (current && current.unmount) try { current.unmount(); } catch (e) { }
    current = null;
    OG.stopSpeak(); speaking = false;
    for (var i = 0; i < routes.length; i++) {
      var m = path.match(routes[i].re);
      if (m) {
        var out;
        try { out = routes[i].fn.apply(null, m.slice(1).map(decodeURIComponent).concat([query])); }
        catch (e) { console.error(e); out = OG.card('<h2>Something went wrong</h2><p class="muted">' + OG.esc(e.message) + '</p><a class="btn" href="#/dashboard">Go to Dashboard</a>'); }
        if (typeof out === 'string') out = { html: out };
        main.innerHTML = out.html;
        current = out;
        if (out.mount) try { out.mount(main, query); } catch (e) { console.error(e); }
        markNav(path);
        main.focus({ preventScroll: true });
        window.scrollTo(0, 0);
        return;
      }
    }
    location.replace('#/dashboard');
  }
  OG.render = render;
  OG.refresh = function () { var y = window.scrollY; render(); window.scrollTo(0, y); };

  function markNav(path) {
    var sec = path.split('/')[1];
    OG.$$('.tabbar a, .drawer a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#/' + sec); });
  }

  function buildNav() {
    var tabs = [['dashboard', 'home', 'Home'], ['foodwater', 'drop', 'Food & Water'], ['inventory', 'box', 'Inventory'], ['ops', 'check', 'Daily Ops'], ['library', 'book', 'Library']];
    OG.$('#tabbar').innerHTML = tabs.map(function (t) { return '<a href="#/' + t[0] + '">' + OG.icon(t[1]) + '<span>' + t[2] + '</span></a>'; }).join('');
    OG.$('#drawer').innerHTML = '<h2>OFFGRID 180</h2>' + OG.SECTIONS.map(function (s) {
      return '<a href="#/' + s.id + '">' + OG.icon(s.icon) + '<span>' + s.name + '</span></a>';
    }).join('') + '<hr style="border-color:var(--line)"><a href="#/search">' + OG.icon('search') + '<span>Search everything</span></a><a href="#/settings">' + OG.icon('gear') + '<span>Settings, backup & accessibility</span></a><a href="#/about">' + OG.icon('alert') + '<span>About & safety disclaimer</span></a>';
    OG.$('#btn-search').innerHTML = OG.icon('search');
    OG.$('#btn-speak').innerHTML = OG.icon('speak');
  }
  function toggleDrawer(open) {
    var d = OG.$('#drawer'), s = OG.$('#scrim'), b = OG.$('#btn-menu');
    d.hidden = !open; s.hidden = !open; b.setAttribute('aria-expanded', open);
    if (open) { var f = OG.$('a', d); f && f.focus(); }
  }

  function netStatus() {
    var el = OG.$('#net'); var on = navigator.onLine;
    el.textContent = on ? 'online' : 'offline'; el.title = on ? 'Internet available — optional features enabled' : 'Offline — all core features work';
  }

  OG.route('/about', function () {
    return OG.header('About OFFGRID 180', 'Version ' + OG.VERSION, '#/dashboard') +
      OG.card('<h2>Safety disclaimer</h2><p>OFFGRID 180 is a planning and reference tool. It is <b>not a substitute</b> for professional medical training, emergency services, or official weather and evacuation guidance. In an emergency, contact emergency services (911 in the U.S.) or activate your satellite SOS device.</p><p>The app never diagnoses illness, never identifies plants as safe to eat, and labels every guide as <b>Verified</b> (matches the named authoritative source) or <b>General guidance</b> (widely taught field practice). Calculators give estimates — adjust with real usage.</p><p>Take hands-on training: a Wilderness First Aid course, Stop the Bleed, and practice every skill before you depend on it.</p>', 'alert') +
      OG.card('<h2>What works offline</h2><p>Everything core: the library, calculators, inventory, checklists, logs, decision trees, SOS tools, GPS position, compass and waypoints. Data lives only on this device; export backups in Settings.</p><h2>Optional (needs internet)</h2><p>Weather forecast download, and installing updates. These are never needed for emergency features.</p>') +
      OG.card('<h2>Not included yet</h2><ul><li>Real photographs: the catalog uses drawn icons and diagrams. Add your own photos to each inventory item.</li><li>Built-in topographic maps: import your own downloaded map images in Maps & Navigation, and carry paper maps.</li><li>Plant and animal identification from photos (intentionally — unreliable and unsafe).</li></ul>');
  });

  function boot() {
    OG.VERSION = window.OG_BUILD || 'dev';
    buildNav(); netStatus();
    window.addEventListener('online', netStatus); window.addEventListener('offline', netStatus);
    OG.$('#btn-menu').onclick = function () { toggleDrawer(OG.$('#drawer').hidden); };
    OG.$('#scrim').onclick = function () { toggleDrawer(false); };
    OG.$('#drawer').addEventListener('click', function (e) { if (e.target.closest('a')) toggleDrawer(false); });
    OG.$('#btn-search').onclick = function () { location.hash = '#/search'; };
    OG.$('#btn-speak').onclick = function () {
      if (speaking) { OG.stopSpeak(); speaking = false; return; }
      var t = OG.$('#main').innerText.replace(/\s+\n/g, '\n'); speaking = OG.speak(t);
    };
    OG.$('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') OG.closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { OG.closeModal(); toggleDrawer(false); } });
    window.addEventListener('hashchange', render);
    // Android back button: close overlays, then go back, then exit.
    window.__back = function () {
      if (OG.$('#modal').classList.contains('open')) { OG.closeModal(); return true; }
      if (!OG.$('#drawer').hidden) { toggleDrawer(false); return true; }
      if (current && current.back && current.back()) return true;
      var h = location.hash || '#/dashboard';
      if (h !== '#/dashboard' && h !== '#/' && h !== '') { history.length > 1 ? history.back() : (location.hash = '#/dashboard'); return true; }
      return false;
    };
    OG.db.init().then(function () {
      OG.applySettings();
      if (!OG.db.get('welcomed')) location.hash = '#/welcome';
      render();
    });
    if ('serviceWorker' in navigator && !OG.native() && /^https:|localhost|127\.0\.0\.1/.test(location.href)) {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        reg.addEventListener('updatefound', function () {
          var w = reg.installing; w && w.addEventListener('statechange', function () {
            if (w.state === 'installed' && navigator.serviceWorker.controller) OG.toast('Update downloaded — it will load next time you open the app.', 5000);
          });
        });
      }).catch(function () { });
    }
  }
  OG.route('/welcome', function () {
    return {
      html: OG.card('<h1>Welcome to OFFGRID 180</h1><p>Your offline survival companion for 90–180 days of independent living. Everything you enter stays on this device.</p>' +
        '<div class="warnbox"><b>Important:</b> this app supports planning and reference. It is not a substitute for professional medical training or emergency services. Always have a way to call for help.</div>' +
        '<h2>Quick setup</h2><form id="wf"><div class="form-grid">' +
        OG.field('Units', '<select name="units">' + OG.opt([['imperial', 'Imperial (lb, gal, °F)'], ['metric', 'Metric (kg, L, °C)']], OG.settings().units) + '</select>') +
        OG.field('Plan length', '<select name="days">' + OG.opt([[90, '90 days'], [120, '120 days'], [180, '180 days']], 180) + '</select>') +
        OG.field('Start date', '<input type="date" name="start" value="' + OG.todayISO() + '">') +
        OG.field('Emergency reserve %', '<input type="number" name="reserve" value="15" min="0" max="100">') +
        '</div><button class="btn primary big" type="submit">Start</button></form><p class="muted small">Next: set your body profile in Food & Water → Calculators, add gear in Inventory, and fill in your rescue plan in the Emergency Center.</p>'),
      mount: function (el) {
        OG.$('#wf', el).onsubmit = function (e) {
          e.preventDefault(); var d = OG.formData(e.target);
          OG.db.set('settings', Object.assign(OG.settings(), { units: d.units }));
          OG.db.set('plan', { start: d.start, days: +d.days, reserve: +d.reserve || 0 });
          OG.db.set('welcomed', true); OG.applySettings(); location.hash = '#/dashboard';
        };
      }
    };
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
