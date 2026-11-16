/* Maps & Navigation: GPS position, coordinates, compass, waypoints + offline plot, imported maps, weather log. */
(function () {
  var esc = OG.esc, C = OG.calc;
  OG.WP_TYPES = ['Camp', 'Water', 'Cache', 'Trailhead', 'Hospital', 'Ranger/Sheriff', 'Evacuation route', 'Rally point', 'Hazard', 'Game/Fishing', 'Other'];
  OG.lastFix = function () { return OG.db.get('lastfix', null); };
  OG.coordsHTML = function (f) {
    var u = C.toUTM(f.lat, f.lon);
    return '<div class="coords">' + f.lat.toFixed(5) + ', ' + f.lon.toFixed(5) + '</div><table class="small"><tr><th>DMS</th><td>' + C.toDMS(f.lat, true) + ' · ' + C.toDMS(f.lon, false) + '</td></tr>' +
      '<tr><th>UTM (WGS84)</th><td>' + u.zone + u.band + ' ' + u.easting + 'E ' + u.northing + 'N</td></tr>' +
      '<tr><th>Accuracy</th><td>±' + OG.fmt.m(f.acc || 0) + (f.alt != null ? ' · altitude ' + OG.fmt.m(f.alt) : '') + '</td></tr><tr><th>Time</th><td>' + new Date(f.t).toLocaleString() + '</td></tr></table>';
  };
  OG.getFix = function (cb, err) {
    if (!navigator.geolocation) { err && err('This device has no GPS access.'); return; }
    navigator.geolocation.getCurrentPosition(function (p) {
      var f = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, alt: p.coords.altitude, t: Date.now() };
      OG.db.set('lastfix', f); cb(f);
    }, function (e) { err && err(e.code === 1 ? 'Location permission denied.' : 'No GPS fix yet — go to open sky and try again.'); }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 });
  };

  OG.route('/maps', function () {
    var f = OG.lastFix(), wps = OG.db.all('waypoints'), maps = OG.db.all('maps');
    return OG.header('Maps & Navigation', 'GPS works without cell service') +
      OG.card('<h2>My position</h2>' + (f ? OG.coordsHTML(f) : '<p class="muted">No fix saved yet.</p>') + '<a class="btn primary block" href="#/maps/position">' + OG.icon('pin') + ' Get live position</a>') +
      '<div class="grid" style="margin-bottom:12px">' +
      '<a class="tile" href="#/maps/compass">' + OG.icon('compass') + '<b>Compass</b><small>Heading & bearing to waypoint</small></a>' +
      '<a class="tile" href="#/maps/waypoints">' + OG.icon('pin') + '<b>Waypoints (' + wps.length + ')</b><small>Saved places + offline plot</small></a>' +
      '<a class="tile" href="#/maps/offline">' + OG.icon('map') + '<b>Offline maps (' + maps.length + ')</b><small>Import your map images</small></a>' +
      '<a class="tile" href="#/maps/weather">' + OG.icon('cloud') + '<b>Weather</b><small>Log, pressure trend, forecast</small></a>' +
      '<a class="tile" href="#/maps/tools">' + OG.icon('calc') + '<b>Nav calculators</b><small>Distance, bearing, travel time</small></a></div>' +
      OG.moduleBlocks(['nav', 'comms', 'weather', 'wildlife']);
  });

  OG.route('/maps/position', function () {
    var watch = null;
    return {
      html: OG.header('Live position', 'Uses GPS only — works offline', '#/maps') + OG.card('<div id="pos"><p class="muted">Waiting for GPS… go to open sky for best accuracy.</p></div><div class="row gap"><button class="btn primary grow" id="save">' + OG.icon('pin') + ' Save as waypoint</button><button class="btn" id="copy">Copy</button></div><p class="muted small">Battery tip: GPS stops when you leave this screen.</p>'),
      mount: function (el) {
        var cur = null;
        if (!navigator.geolocation) { OG.$('#pos', el).innerHTML = '<p>GPS not available on this device.</p>'; return; }
        watch = navigator.geolocation.watchPosition(function (p) {
          cur = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, alt: p.coords.altitude, t: Date.now() };
          OG.db.set('lastfix', cur); OG.$('#pos', el).innerHTML = OG.coordsHTML(cur);
        }, function (e) { OG.$('#pos', el).innerHTML = '<p class="pill bad">' + (e.code === 1 ? 'Location permission denied — allow it in phone settings.' : 'No fix yet. Keep waiting in open sky.') + '</p>'; }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 60000 });
        OG.$('#save', el).onclick = function () { if (!cur) return OG.toast('No fix yet'); location.hash = '#/maps/waypoints?lat=' + cur.lat + '&lon=' + cur.lon; };
        OG.$('#copy', el).onclick = function () { if (!cur) return; var s = cur.lat.toFixed(5) + ', ' + cur.lon.toFixed(5); (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(function () { OG.toast('Copied ' + s); }).catch(function () { OG.toast(s, 5000); }); };
      },
      unmount: function () { if (watch != null) navigator.geolocation.clearWatch(watch); }
    };
  });

  OG.route('/maps/compass', function (q) {
    var handler = null, decl = OG.db.get('declination', 0), target = q.get('to') ? OG.db.all('waypoints').find(function (w) { return w.id === q.get('to'); }) : null;
    var html = OG.header('Compass', 'Phone compass — confirm with a real compass', '#/maps') +
      OG.card('<svg class="compass-rose" viewBox="-110 -110 220 220" aria-hidden="true"><circle r="100" fill="none" stroke="var(--line)" stroke-width="3"/><g id="rose">' +
        ['N', 'E', 'S', 'W'].map(function (d, i) { return '<text x="0" y="-78" text-anchor="middle" fill="' + (d === 'N' ? 'var(--bad)' : 'var(--fg)') + '" font-size="20" font-weight="800" transform="rotate(' + i * 90 + ')">' + d + '</text>'; }).join('') +
        Array.from({ length: 36 }, function (_, i) { return '<line y1="-100" y2="' + (i % 9 === 0 ? -88 : -94) + '" stroke="var(--muted)" transform="rotate(' + i * 10 + ')"/>'; }).join('') +
        '</g><g id="tgt" style="display:none"><path d="M0 -70 L10 -50 L-10 -50 Z" fill="var(--ok)"/></g><path d="M0 -60 L8 0 L0 -8 L-8 0 Z" fill="var(--acc)"/></svg>' +
        '<p style="text-align:center"><span id="hd" class="coords">—</span></p><p id="tinfo" style="text-align:center" class="muted"></p>' +
        '<div class="row gap"><label class="field grow"><span>Declination (° east +, west −)</span><input type="number" step="0.1" id="decl" value="' + decl + '"></label><button class="btn" id="start">Start compass</button></div>' +
        '<p class="muted small">Find declination for your area on a current topo map or NOAA\'s calculator (Pacific Northwest ≈ +14 to +15°). Hold the phone flat, away from metal. Calibrate by moving it in a figure-8.</p>' +
        '<label class="field"><span>Bearing to waypoint</span><select id="wsel"><option value="">— none —</option>' + OG.db.all('waypoints').map(function (w) { return '<option value="' + w.id + '"' + (target && target.id === w.id ? ' selected' : '') + '>' + esc(w.name) + '</option>'; }).join('') + '</select></label>');
    return {
      html: html, mount: function (el) {
        var rose = OG.$('#rose', el), tgt = OG.$('#tgt', el), heading = null;
        var update = function () {
          var d = +OG.$('#decl', el).value || 0, t = OG.db.all('waypoints').find(function (w) { return w.id === OG.$('#wsel', el).value; }), f = OG.lastFix();
          if (heading != null) { var trueH = (heading + d + 360) % 360; rose.setAttribute('transform', 'rotate(' + (-trueH) + ')'); OG.$('#hd', el).textContent = Math.round(trueH) + '° ' + C.cardinal(trueH) + ' (true)'; }
          if (t && f) {
            var b = C.bearing(f, t), dist = C.distance(f, t); tgt.style.display = '';
            tgt.setAttribute('transform', 'rotate(' + (b - (heading == null ? 0 : (heading + d))) + ')');
            OG.$('#tinfo', el).textContent = t.name + ': ' + Math.round(b) + '° true (' + Math.round((b - d + 360) % 360) + '° magnetic) · ' + OG.fmt.m(dist) + ' from last fix';
          } else { tgt.style.display = 'none'; OG.$('#tinfo', el).textContent = t && !f ? 'Get a GPS position first.' : ''; }
        };
        OG.$('#decl', el).oninput = function () { OG.db.set('declination', +this.value || 0); update(); };
        OG.$('#wsel', el).onchange = update;
        handler = function (e) {
          var h = null;
          if (e.webkitCompassHeading != null) h = e.webkitCompassHeading;
          else if (e.absolute && e.alpha != null) h = (360 - e.alpha) % 360;
          if (h == null) return; heading = h; update();
        };
        var start = function () {
          var go = function () { window.addEventListener('deviceorientationabsolute', handler); window.addEventListener('deviceorientation', handler); OG.$('#start', el).textContent = 'Running'; };
          if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(go).catch(function () { OG.toast('Compass permission denied'); });
          else go();
          setTimeout(function () { var hd = OG.$('#hd', el); if (heading == null && hd) hd.textContent = 'No compass sensor data'; }, 3000);
        };
        OG.$('#start', el).onclick = start; start(); update();
      },
      unmount: function () { window.removeEventListener('deviceorientationabsolute', handler); window.removeEventListener('deviceorientation', handler); }
    };
  });

  function plot(canvas, wps, fix) {
    var pts = wps.map(function (w) { return { lat: w.lat, lon: w.lon, name: w.name, type: w.type }; });
    if (fix) pts.push({ lat: fix.lat, lon: fix.lon, name: 'You', me: true });
    var ctx = canvas.getContext('2d'), dpr = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);
    var cs = getComputedStyle(document.documentElement);
    ctx.fillStyle = cs.getPropertyValue('--bg2'); ctx.fillRect(0, 0, W, H);
    if (!pts.length) { ctx.fillStyle = cs.getPropertyValue('--muted'); ctx.fillText('No waypoints yet', 20, 30); return; }
    var lat0 = pts.reduce(function (a, p) { return a + p.lat; }, 0) / pts.length, kx = Math.cos(lat0 * Math.PI / 180);
    var xs = pts.map(function (p) { return p.lon * kx; }), ys = pts.map(function (p) { return p.lat; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var span = Math.max(maxX - minX, maxY - minY, 0.002), pad = 30, s = Math.min(W - 2 * pad, H - 2 * pad) / span;
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    var X = function (p) { return W / 2 + (p.lon * kx - cx) * s; }, Y = function (p) { return H / 2 - (p.lat - cy) * s; };
    // scale bar
    var mPerDeg = 111320, barM = Math.pow(10, Math.floor(Math.log10(span * mPerDeg / 3))), barPx = barM / mPerDeg * s;
    ctx.strokeStyle = cs.getPropertyValue('--fg'); ctx.fillStyle = cs.getPropertyValue('--fg'); ctx.lineWidth = 2; ctx.font = '12px system-ui';
    ctx.beginPath(); ctx.moveTo(12, H - 14); ctx.lineTo(12 + barPx, H - 14); ctx.stroke(); ctx.fillText(OG.fmt.m(barM), 14, H - 20);
    ctx.fillText('N ↑', W - 34, 18);
    pts.forEach(function (p) {
      ctx.beginPath(); ctx.fillStyle = p.me ? cs.getPropertyValue('--bad') : p.type === 'Water' ? '#4aa3df' : p.type === 'Hazard' ? cs.getPropertyValue('--warn') : cs.getPropertyValue('--acc');
      ctx.arc(X(p), Y(p), p.me ? 7 : 5, 0, 7); ctx.fill();
      ctx.fillStyle = cs.getPropertyValue('--fg'); ctx.fillText(p.name, X(p) + 8, Y(p) + 4);
    });
  }

  OG.route('/maps/waypoints', function (q) {
    var wps = OG.db.all('waypoints'), f = OG.lastFix();
    var html = OG.header('Waypoints', wps.length + ' saved · plot works offline', '#/maps') +
      '<canvas class="plot" id="plot" aria-label="Waypoint plot"></canvas>' +
      OG.card('<h2>' + (q.get('lat') ? 'Save this position' : 'Add waypoint') + '</h2><form id="wf"><div class="form-grid">' +
        OG.field('Name', '<input name="name" required placeholder="e.g., Spring above camp">') +
        OG.field('Type', '<select name="type">' + OG.opt(OG.WP_TYPES, 'Camp') + '</select>') +
        OG.field('Latitude', '<input type="number" step="any" name="lat" required value="' + esc(q.get('lat') || (f ? f.lat.toFixed(6) : '')) + '">') +
        OG.field('Longitude', '<input type="number" step="any" name="lon" required value="' + esc(q.get('lon') || (f ? f.lon.toFixed(6) : '')) + '">') + '</div>' +
        OG.field('Notes', '<input name="notes" placeholder="seasonal flow, access, hazards">') + '<button class="btn primary block">Save waypoint</button></form>') +
      OG.card('<h2>Saved</h2>' + (wps.length ? '<ul class="list">' + wps.map(function (w) {
        var info = f ? OG.fmt.m(C.distance(f, w)) + ' · ' + Math.round(C.bearing(f, w)) + '° ' + C.cardinal(C.bearing(f, w)) : w.lat.toFixed(5) + ', ' + w.lon.toFixed(5);
        return '<li class="li"><span class="grow"><b>' + esc(w.name) + '</b> ' + OG.pill(w.type) + '<small>' + info + (w.notes ? ' · ' + esc(w.notes) : '') + '</small></span><a class="icon-btn" href="#/maps/compass?to=' + w.id + '" aria-label="Navigate to ' + esc(w.name) + '">' + OG.icon('compass') + '</a><button class="icon-btn" data-del="' + w.id + '" aria-label="Delete ' + esc(w.name) + '">' + OG.icon('trash') + '</button></li>';
      }).join('') + '</ul>' : '<p class="muted">Save camp, water sources, caches, trailheads, the nearest hospital and evacuation points.</p>') +
        (f ? '<p class="muted small">Distances from your last GPS fix (' + new Date(f.t).toLocaleString() + ').</p>' : ''));
    return {
      html: html, mount: function (el) {
        var draw = function () { plot(OG.$('#plot', el), OG.db.all('waypoints'), OG.lastFix()); };
        draw(); window.addEventListener('resize', draw);
        OG.$('#wf', el).onsubmit = function (e) {
          e.preventDefault(); var d = OG.formData(e.target);
          if (Math.abs(d.lat) > 90 || Math.abs(d.lon) > 180) return OG.toast('Check the coordinates');
          OG.db.put('waypoints', d); OG.toast('Waypoint saved'); location.hash = '#/maps/waypoints';
        };
        OG.$$('[data-del]', el).forEach(function (b) { b.onclick = function () { OG.confirm('Delete this waypoint?', function () { OG.db.del('waypoints', b.dataset.del); OG.refresh(); }); }; });
      }
    };
  });

  OG.route('/maps/offline', function () {
    var maps = OG.db.all('maps');
    var html = OG.header('Offline maps', 'Import map images you downloaded while online', '#/maps') +
      OG.card('<p>Save topo maps as images or screenshots (USGS topoView, CalTopo, Gaia, state agency maps) while you have internet, then import them here. They stay on this device. Always carry paper maps too.</p><button class="btn primary" id="imp">' + OG.icon('plus') + ' Import map image</button>') +
      maps.map(function (m) {
        return OG.card('<div class="row between"><h2>' + esc(m.name) + '</h2><button class="icon-btn" data-del="' + m.id + '" aria-label="Delete map">' + OG.icon('trash') + '</button></div><div style="overflow:auto;max-height:70vh"><img class="mapimg" src="' + m.data + '" alt="' + esc(m.name) + '" data-zoom="1"></div><div class="row gap"><button class="btn" data-z="' + m.id + '" data-f="1.5">Zoom +</button><button class="btn" data-z="' + m.id + '" data-f="0.67">Zoom −</button></div>');
      }).join('');
    return {
      html: html, mount: function (el) {
        OG.$('#imp', el).onclick = function () {
          OG.pickFile('image/*').then(function (f) { if (!f) return; return OG.imageData(f, 3000, 0.85).then(function (img) {
            OG.modal('Name this map', '<input id="mapname" value="' + esc(f.name.replace(/\.[^.]+$/, '')) + '">', [{ label: 'Save', cls: 'primary', fn: function (box) {
              OG.db.put('maps', { name: OG.$('#mapname', box).value || 'Map', data: img.data, w: img.w, h: img.h }); setTimeout(OG.refresh, 0); } }]);
          }); }).catch(function () { OG.toast('Could not import that image.'); });
        };
        OG.$$('[data-z]', el).forEach(function (b) { b.onclick = function () { var img = b.closest('.card').querySelector('img'), z = Math.max(1, Math.min(6, (+img.dataset.zoom) * (+b.dataset.f))); img.dataset.zoom = z; img.style.width = (z * 100) + '%'; img.style.maxWidth = 'none'; }; });
        OG.$$('[data-del]', el).forEach(function (b) { b.onclick = function () { OG.confirm('Delete this map?', function () { OG.db.del('maps', b.dataset.del); OG.refresh(); }); }; });
      }
    };
  });

  OG.route('/maps/tools', function () {
    var f = OG.lastFix();
    var html = OG.header('Navigation calculators', '', '#/maps') +
      OG.card('<h2>Distance & bearing</h2><form id="db"><div class="form-grid">' + OG.field('From lat', '<input type="number" step="any" name="a" value="' + (f ? f.lat.toFixed(5) : '') + '">') + OG.field('From lon', '<input type="number" step="any" name="b" value="' + (f ? f.lon.toFixed(5) : '') + '">') +
        OG.field('To lat', '<input type="number" step="any" name="c">') + OG.field('To lon', '<input type="number" step="any" name="d">') + '</div></form><p id="dbo"></p>') +
      OG.card('<h2>Travel time (Naismith\'s rule)</h2><form id="tt"><div class="form-grid">' + OG.field('Distance (' + (OG.imperial() ? 'mi' : 'km') + ')', '<input type="number" step="any" name="d" value="5">') + OG.field('Ascent (' + (OG.imperial() ? 'ft' : 'm') + ')', '<input type="number" step="any" name="u" value="1000">') +
        OG.field('Load / terrain', '<select name="k">' + OG.opt([[1, 'Light pack, trail'], [1.25, 'Heavy pack'], [1.5, 'Rough/brush'], [2, 'Snow or injured']], 1) + '</select>') + '</div></form><p id="tto"></p>');
    return {
      html: html, mount: function (el) {
        var dbf = OG.$('#db', el), ttf = OG.$('#tt', el);
        dbf.oninput = function () { var d = OG.formData(dbf); if ([d.a, d.b, d.c, d.d].some(function (x) { return x == null; })) return; var A = { lat: d.a, lon: d.b }, B = { lat: d.c, lon: d.d }, br = C.bearing(A, B); OG.$('#dbo', el).innerHTML = '<b>' + OG.fmt.m(C.distance(A, B)) + '</b> at <b>' + Math.round(br) + '° ' + C.cardinal(br) + '</b> (true). Subtract east declination for magnetic.'; };
        ttf.oninput = function () { var d = OG.formData(ttf), km = OG.imperial() ? d.d * 1.60934 : d.d, up = OG.imperial() ? d.u * 0.3048 : d.u, h = (km / 5 + up / 600) * (+d.k); OG.$('#tto', el).innerHTML = 'About <b>' + Math.floor(h) + ' h ' + Math.round((h % 1) * 60) + ' min</b> moving time. Add breaks and keep a turnaround time.'; };
        ttf.oninput();
      }
    };
  });

  /* Weather: offline log + optional online forecast. */
  OG.route('/maps/weather', function () {
    var logs = OG.db.all('weather').slice().sort(function (a, b) { return a.t - b.t; }), fc = OG.db.get('forecast', null), imp = OG.imperial();
    var last = logs.slice(-1)[0], prev = null;
    if (last) prev = logs.slice().reverse().find(function (l) { return l !== last && last.t - l.t >= 2.5 * 3600e3 && last.t - l.t <= 6 * 3600e3 && l.pressure && last.pressure; });
    var trend = '';
    if (last && prev) {
      var dp = (last.pressure - prev.pressure) / ((last.t - prev.t) / 3600e3) * 3;
      trend = dp <= -3 ? OG.pill('Falling fast (' + dp.toFixed(1) + ' hPa/3h) — storm likely, secure camp', 'bad') : dp <= -1 ? OG.pill('Falling (' + dp.toFixed(1) + ' hPa/3h) — weather may worsen', 'warn') : dp >= 1 ? OG.pill('Rising (' + dp.toFixed(1) + ' hPa/3h) — likely improving', 'ok') : OG.pill('Steady', '');
    }
    var html = OG.header('Weather', 'Offline log + optional forecast', '#/maps') +
      OG.card('<h2>Log an observation</h2><form id="wx"><div class="form-grid">' +
        OG.field('Pressure (' + (imp ? 'inHg' : 'hPa') + ')', '<input type="number" step="any" name="p">') + OG.field('Temperature (' + (imp ? '°F' : '°C') + ')', '<input type="number" step="any" name="temp">') +
        OG.field('Wind', '<select name="wind">' + OG.opt(['Calm', 'Light', 'Moderate', 'Strong', 'Gale'], 'Light') + '</select>') +
        OG.field('Sky', '<select name="sky">' + OG.opt(['Clear', 'High thin clouds', 'Thickening clouds', 'Overcast', 'Towering clouds', 'Fog'], 'Clear') + '</select>') +
        OG.field('Precipitation', '<select name="precip">' + OG.opt(['None', 'Drizzle', 'Rain', 'Heavy rain', 'Snow', 'Hail', 'Thunder'], 'None') + '</select>') + '</div><button class="btn primary block">Save observation</button></form>' + (trend ? '<p><b>3-hour pressure trend:</b> ' + trend + '</p>' : '<p class="muted small">Log pressure at least twice, 3 hours apart, to see the trend.</p>')) +
      OG.card('<h2>Recent observations</h2>' + (logs.length ? '<table><tr><th>When</th><th>Pressure</th><th>Temp</th><th>Sky / wind / precip</th></tr>' + logs.slice(-12).reverse().map(function (l) {
        return '<tr><td>' + new Date(l.t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + '</td><td>' + (l.pressure ? (imp ? (l.pressure / 33.8639).toFixed(2) : l.pressure.toFixed(0)) : '—') + '</td><td>' + (l.tempC != null ? OG.fmt.temp(l.tempC) : '—') + '</td><td>' + esc([l.sky, l.wind, l.precip].join(' · ')) + '</td></tr>';
      }).join('') + '</table>' : '<p class="muted">No observations yet.</p>')) +
      OG.card('<h2>Forecast (optional, needs internet)</h2>' + (fc ? fcHTML(fc) : '<p class="muted">No saved forecast.</p>') + '<button class="btn" id="getfc">Download 7-day forecast for my last GPS position</button><p class="muted small">Source: Open-Meteo (free, no account). Saved for offline viewing. Always check official NWS alerts on a NOAA weather radio.</p>');
    function fcHTML(fc) {
      var d = fc.daily; return '<p class="small muted">Saved ' + new Date(fc.saved).toLocaleString() + ' for ' + fc.lat.toFixed(3) + ', ' + fc.lon.toFixed(3) + '</p><table><tr><th>Day</th><th>High/Low</th><th>Precip</th><th>Wind max</th></tr>' +
        d.time.map(function (t, i) { return '<tr><td>' + t.slice(5) + '</td><td>' + OG.fmt.temp(d.temperature_2m_max[i]) + ' / ' + OG.fmt.temp(d.temperature_2m_min[i]) + '</td><td>' + d.precipitation_sum[i] + ' mm</td><td>' + Math.round(d.wind_speed_10m_max[i]) + ' km/h</td></tr>'; }).join('') + '</table>';
    }
    return {
      html: html, mount: function (el) {
        OG.$('#wx', el).onsubmit = function (e) {
          e.preventDefault(); var d = OG.formData(e.target);
          var p = d.p == null ? null : (imp ? d.p * 33.8639 : d.p), tc = d.temp == null ? null : (imp ? (d.temp - 32) * 5 / 9 : d.temp);
          OG.db.put('weather', { t: Date.now(), date: OG.todayISO(), pressure: p, tempC: tc, wind: d.wind, sky: d.sky, precip: d.precip }); OG.toast('Observation saved'); OG.refresh();
        };
        OG.$('#getfc', el).onclick = function () {
          var f = OG.lastFix(); if (!f) return OG.toast('Get a GPS position first (Maps → My position).');
          if (!navigator.onLine) return OG.toast('No internet — forecast unavailable. Use your weather log and NOAA radio.');
          fetch('https://api.open-meteo.com/v1/forecast?latitude=' + f.lat.toFixed(3) + '&longitude=' + f.lon.toFixed(3) + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto')
            .then(function (r) { if (!r.ok) throw 0; return r.json(); })
            .then(function (j) { OG.db.set('forecast', { saved: new Date().toISOString(), lat: f.lat, lon: f.lon, daily: j.daily }); OG.toast('Forecast saved for offline use'); OG.refresh(); })
            .catch(function () { OG.toast('Could not download the forecast. Try again with a better connection.'); });
        };
      }
    };
  });
})();
