/* Emergency Center: SOS tools, decision trees, rescue plan. Works fully offline; no cloud or AI dependency. */
(function () {
  var esc = OG.esc;
  OG.route('/emergency', function () {
    var rescue = OG.db.get('rescue', {}), wps = OG.db.all('waypoints').filter(function (w) { return /Hospital|Ranger|Evacuation|Rally/.test(w.type); });
    return OG.header('Emergency Center', 'Immediate safety first. When in doubt, call for help early.') +
      '<div class="emerg-grid" style="margin-bottom:12px">' +
      '<a class="btn danger" href="#/emergency/sos">' + OG.icon('siren') + 'SOS tools & my location</a>' +
      '<a class="btn danger" href="tel:911">' + OG.icon('radio') + 'Call 911<small>needs cell signal</small></a>' +
      '<a class="btn danger" href="#/emergency/tree/medical">' + OG.icon('med') + 'Medical emergency</a>' +
      '<a class="btn" href="#/emergency/tree/evac">' + OG.icon('alert') + 'Evacuate?</a></div>' +
      OG.card('<h2>If life is at risk</h2><ol><li>Make the scene safe.</li><li>Stop severe bleeding; check breathing.</li><li>Activate your satellite messenger / PLB SOS, or call 911 if you have signal. Give coordinates from the SOS screen.</li><li>Protect from cold, heat and wet while you wait.</li></ol>', 'alert') +
      '<h2>Decision guides</h2><div class="grid" style="margin-bottom:12px">' + OG.TREES.map(function (t) { return '<a class="tile" href="#/emergency/tree/' + t.id + '">' + OG.icon(t.icon) + '<b>' + esc(t.title) + '</b></a>'; }).join('') + '</div>' +
      OG.card('<div class="row between"><h2>My rescue plan</h2>' + OG.pill(Math.round(OG.status().rescueFrac * 100) + '% complete', OG.levelOf(OG.status().rescueFrac)) + '</div>' +
        (rescue.contactName ? '<p>Contact: <b>' + esc(rescue.contactName) + '</b> ' + esc(rescue.contactPhone || '') + '<br>Check-ins: ' + esc(rescue.checkin || '—') + '</p>' : '<p class="muted">Who knows where you are, when to expect check-ins, and what to do if you go silent?</p>') +
        '<a class="btn block" href="#/emergency/plan">' + OG.icon('edit') + ' Edit rescue & exit plan</a>') +
      (wps.length ? OG.card('<h2>Evacuation points</h2><ul class="list">' + wps.map(function (w) { return '<li><a class="li" href="#/maps/compass?to=' + w.id + '">' + OG.icon('compass') + '<span class="grow">' + esc(w.name) + '<small>' + w.type + '</small></span></a></li>'; }).join('') + '</ul>') : '') +
      OG.card('<h2>Safety essentials</h2><ul><li><a href="#/article/fire-co">Carbon monoxide</a>: never run stoves, heaters or generators in enclosed spaces.</li><li><a href="#/article/water-filters">Water treatment</a>: boiling/bleach kill germs, not chemicals.</li><li><a href="#/article/food-preserve">Food preservation</a>: pressure-can low-acid foods; if in doubt, throw it out.</li><li><a href="#/article/med-medications">Medication safety</a> and <a href="#/article/wild-bears">wildlife precautions</a>.</li><li><a href="#/article/wx-flood">Weather evacuation</a>, <a href="#/article/fire-heat">fire prevention</a>, <a href="#/article/comms-checkin">backup communication</a> and a <a href="#/article/plan-exit">realistic exit plan</a>.</li></ul>') +
      OG.moduleBlocks(['emergency']);
  });

  OG.route('/emergency/tree/:id', function (id) {
    var t = OG.TREES.find(function (x) { return x.id === id; }); if (!t) return OG.card('Not found');
    var stack = [t.start];
    function nodeHTML() {
      var key = stack[stack.length - 1], n = t.nodes[key];
      if (n.end) {
        var cls = 'sev-' + n.sev, label = n.sev === 'sos' ? 'GET HELP NOW' : n.sev === 'urgent' ? 'URGENT' : 'ACTION';
        return '<section class="card ' + cls + '"><span class="pill ' + (n.sev === 'sos' ? 'bad' : n.sev === 'urgent' ? 'warn' : 'ok') + '">' + label + '</span><h2 class="tree-node">' + esc(n.end) + '</h2><ol>' + n.a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
          (n.sev === 'sos' ? '<a class="btn danger big" href="#/emergency/sos">' + OG.icon('siren') + ' SOS tools & coordinates</a>' : '') +
          (n.link ? '<a class="btn block" style="margin-top:8px" href="#/article/' + n.link + '?from=/emergency/tree/' + id + '">Full guide</a>' : '') + '</section>';
      }
      return '<section class="card"><p class="tree-node"><b>' + esc(n.q) + '</b></p>' + n.o.map(function (o) { return '<button class="btn big" style="margin:6px 0" data-to="' + o[1] + '">' + esc(o[0]) + '</button>'; }).join('') + '</section>';
    }
    var view = {
      html: OG.header(t.title, 'Step-by-step decision guide', '#/emergency') + '<div id="tree"></div><div class="row gap"><button class="btn" id="tback">← Previous</button><button class="btn" id="trestart">Restart</button><button class="btn" id="tread">' + OG.icon('speak') + ' Read</button></div><p class="muted small">Guidance only — not a substitute for training or emergency services.</p>',
      mount: function (el) {
        var box = OG.$('#tree', el);
        var draw = function () {
          box.innerHTML = nodeHTML();
          OG.$$('[data-to]', box).forEach(function (b) { b.onclick = function () { stack.push(b.dataset.to); draw(); box.scrollIntoView(); }; });
          OG.$('#tback', el).disabled = stack.length < 2;
        };
        OG.$('#tback', el).onclick = function () { if (stack.length > 1) { stack.pop(); draw(); } };
        OG.$('#trestart', el).onclick = function () { stack = [t.start]; draw(); };
        OG.$('#tread', el).onclick = function () { OG.speak(box.innerText); };
        draw();
      },
      back: function () { if (stack.length > 1) { stack.pop(); OG.$('#tree') && view.mount(OG.$('#main')); return true; } return false; }
    };
    return view;
  });

  /* SOS tools: coordinates, medical card, light & sound signals. */
  var strobeTimer = null, audioCtx = null;
  function stopSignals() {
    clearTimeout(strobeTimer); strobeTimer = null;
    var n = OG.native(); if (n && n.torch) try { n.torch(false); } catch (e) { }
    var s = OG.$('.strobe'); if (s) s.remove();
    if (audioCtx) { try { audioCtx.close(); } catch (e) { } audioCtx = null; }
  }
  function sosPattern(on, off) {
    // Morse SOS: dot = 1 unit, dash = 3, intra-letter gap 1, letter gap 3, word gap 7.
    var u = 250, seq = [], push = function (len) { seq.push([true, len * u], [false, u]); };
    [1, 1, 1].forEach(push); seq[seq.length - 1][1] = 3 * u; [3, 3, 3].forEach(push); seq[seq.length - 1][1] = 3 * u; [1, 1, 1].forEach(push); seq[seq.length - 1][1] = 7 * u;
    var i = 0; (function step() { var s = seq[i++ % seq.length]; s[0] ? on() : off(); strobeTimer = setTimeout(step, s[1]); })();
  }
  OG.route('/emergency/sos', function () {
    var f = OG.lastFix(), mi = OG.db.get('medinfo', {}), r = OG.db.get('rescue', {});
    var html = OG.header('SOS tools', 'Show this screen to rescuers', '#/emergency') +
      OG.card('<h2>My location</h2><div id="loc">' + (f ? OG.coordsHTML(f) : '<p class="muted">No saved position.</p>') + '</div><button class="btn primary block" id="fix">' + OG.icon('pin') + ' Update GPS position</button>' +
        '<p class="small">Tell rescuers: your coordinates (decimal degrees), the nature of the emergency, number of people, injuries, and your device type.</p><button class="btn block" id="msg">Copy SOS message</button>', 'alert') +
      '<div class="emerg-grid" style="margin-bottom:12px"><button class="btn danger" id="light">' + OG.icon('flash') + 'SOS light signal</button><button class="btn danger" id="whistle">' + OG.icon('speak') + 'Whistle: 3 blasts</button><button class="btn" id="stop">Stop signals</button></div>' +
      OG.card('<h2>Medical info</h2>' + (mi.name || mi.allergies || mi.conditions ? '<table><tr><th>Name</th><td>' + esc(mi.name || '') + '</td></tr><tr><th>DOB / blood</th><td>' + esc((mi.dob || '') + ' ' + (mi.blood || '')) + '</td></tr><tr><th>Allergies</th><td>' + esc(mi.allergies || 'none listed') + '</td></tr><tr><th>Conditions</th><td>' + esc(mi.conditions || '') + '</td></tr><tr><th>Medications</th><td>' + esc(mi.meds || '') + '</td></tr><tr><th>Contacts</th><td>' + esc(mi.contacts || '') + '</td></tr></table>' : '<p class="muted">Not filled in. <a href="#/medical/info">Add medical info</a></p>')) +
      OG.card('<h2>Signals that need no power</h2><ul><li>Three of anything = distress: 3 whistle blasts, 3 fires in a triangle, 3 flashes.</li><li>Ground symbols: <b>V</b> need assistance, <b>X</b> need medical help — 10 ft (3 m)+ in the open.</li><li>Signal mirror toward aircraft; bright clothing or tarp spread out.</li></ul>' + OG.DIAGRAMS.ground + (r.contactName ? '<p>Rescue contact: <b>' + esc(r.contactName) + '</b> ' + esc(r.contactPhone || '') + '</p>' : ''));
    return {
      html: html, mount: function (el) {
        var cur = f;
        OG.$('#fix', el).onclick = function () { OG.$('#loc', el).innerHTML = '<p class="muted">Getting GPS fix… stay in open sky.</p>'; OG.getFix(function (x) { cur = x; OG.$('#loc', el).innerHTML = OG.coordsHTML(x); }, function (m) { OG.$('#loc', el).innerHTML = '<p class="pill bad">' + m + '</p>' + (cur ? OG.coordsHTML(cur) : ''); }); };
        OG.$('#msg', el).onclick = function () {
          var s = 'SOS. ' + (mi.name ? mi.name + '. ' : '') + (cur ? 'Location ' + cur.lat.toFixed(5) + ', ' + cur.lon.toFixed(5) + ' (±' + Math.round(cur.acc || 0) + ' m) at ' + new Date(cur.t).toLocaleString() + '. ' : '') + 'Emergency: ____. People: 1. Injuries: ____.' + (mi.allergies ? ' Allergies: ' + mi.allergies + '.' : '');
          (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(function () { OG.toast('Copied — paste into your satellite messenger'); }).catch(function () { OG.modal('SOS message', '<textarea rows="5">' + esc(s) + '</textarea>'); });
        };
        OG.$('#light', el).onclick = function () {
          stopSignals(); var n = OG.native(), hasTorch = n && n.torch && n.hasTorch && n.hasTorch();
          var scr = document.createElement('div'); scr.className = 'strobe'; scr.innerHTML = '<button class="btn" style="background:#333;color:#fff">Tap to stop</button>';
          scr.onclick = stopSignals; document.body.appendChild(scr);
          sosPattern(function () { scr.classList.add('on'); if (hasTorch) n.torch(true); }, function () { scr.classList.remove('on'); if (hasTorch) n.torch(false); });
        };
        OG.$('#whistle', el).onclick = function () {
          stopSignals(); var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return OG.toast('Sound not available');
          audioCtx = new AC(); var t0 = audioCtx.currentTime;
          for (var rep = 0; rep < 5; rep++) for (var i = 0; i < 3; i++) {
            var o = audioCtx.createOscillator(), g = audioCtx.createGain(), start = t0 + rep * 6 + i * 1.2;
            o.type = 'square'; o.frequency.value = 3150; g.gain.setValueAtTime(0.0001, start); g.gain.exponentialRampToValueAtTime(0.9, start + 0.02); g.gain.setValueAtTime(0.9, start + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, start + 0.85);
            o.connect(g); g.connect(audioCtx.destination); o.start(start); o.stop(start + 0.9);
          }
          OG.toast('Whistle pattern playing (30 s). Turn volume up. A real whistle is louder.');
        };
        OG.$('#stop', el).onclick = stopSignals;
      },
      unmount: stopSignals
    };
  });

  OG.route('/emergency/plan', function () {
    var r = OG.db.get('rescue', {});
    var t = function (n, l, ph, rows) { return OG.field(l, '<textarea name="' + n + '" rows="' + (rows || 2) + '" placeholder="' + esc(ph || '') + '">' + esc(r[n] || '') + '</textarea>'); };
    var html = OG.header('Rescue & exit plan', 'Give a copy to your emergency contact', '#/emergency') +
      '<form class="card" id="rf"><div class="form-grid">' + OG.field('Emergency contact', '<input name="contactName" value="' + esc(r.contactName || '') + '">') + OG.field('Contact phone/email', '<input name="contactPhone" value="' + esc(r.contactPhone || '') + '">') + '</div>' +
      t('location', 'Where I am (address, coordinates, access road, vehicle)', 'Cabin at …, gate code …, gray Ford Transit') +
      t('checkin', 'Check-in schedule & method', 'Daily OK message at 7 pm via satellite messenger') +
      t('missedRule', 'If I miss a check-in, my contact should…', 'Wait 24 h, then call the county sheriff with my coordinates and this plan') +
      t('hospital', 'Nearest hospital, ranger station, sheriff (phone & distance)', '') +
      t('routes', 'Exit routes (primary & alternate) with travel times', '', 3) +
      t('triggers', 'Exit triggers (when I leave no matter what)', 'Water/food below reserve; injury I can\'t self-treat; shelter loss; wildfire/flood warning; persistent low mood', 3) +
      t('devices', 'Devices (PLB ID, satellite messenger, radio channels)', '') +
      t('notes', 'Other notes', '') + '<button class="btn primary block">Save plan</button></form><button class="btn block" id="share">Export plan as text to share</button>';
    return {
      html: html, mount: function (el) {
        OG.$('#rf', el).onsubmit = function (e) { e.preventDefault(); OG.db.set('rescue', OG.formData(e.target)); OG.toast('Rescue plan saved'); };
        OG.$('#share', el).onclick = function () {
          var d = OG.formData(OG.$('#rf', el)), mi = OG.db.get('medinfo', {}), plan = OG.plan();
          var txt = 'OFFGRID 180 — RESCUE PLAN\n\nPerson: ' + (mi.name || '') + '\nPlan: ' + plan.days + ' days from ' + plan.start + '\n\n' + [['Contact', d.contactName + ' ' + d.contactPhone], ['Location', d.location], ['Check-ins', d.checkin], ['If check-in missed', d.missedRule], ['Nearest help', d.hospital], ['Exit routes', d.routes], ['Exit triggers', d.triggers], ['Devices', d.devices], ['Medical', 'Allergies: ' + (mi.allergies || '-') + '; Conditions: ' + (mi.conditions || '-') + '; Meds: ' + (mi.meds || '-')], ['Notes', d.notes]].map(function (x) { return x[0].toUpperCase() + ':\n' + (x[1] || '-'); }).join('\n\n');
          OG.saveFile('rescue-plan.txt', txt, 'text/plain');
        };
      }
    };
  });
})();
