/* OFFGRID 180 — UI helpers, units, settings, speech, files. */
window.OG = window.OG || {};
(function () {
  OG._routes = [];
  OG.route = function (pattern, fn) { OG._routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$'), fn: fn }); };
  var esc = OG.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  OG.$ = function (sel, el) { return (el || document).querySelector(sel); };
  OG.$$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  OG.native = function () { return window.AndroidApp || null; };
  OG.todayISO = function (d) { d = d || new Date(); var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
  OG.addDays = function (iso, n) { var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return OG.todayISO(d); };
  OG.daysUntil = function (iso) { if (!iso) return Infinity; return Math.round((new Date(iso + 'T00:00:00') - new Date(OG.todayISO() + 'T00:00:00')) / 86400000); };

  /* ---------- defaults ---------- */
  OG.DEFAULT_PROFILE = { name: '', weightKg: 75, heightCm: 175, age: 35, sex: 'male', activity: 'moderate', climate: 'temperate', workHours: 1, cookL: 1, hygieneL: 2 };
  OG.DEFAULT_SETTINGS = { units: 'imperial', fontScale: 1, theme: 'dark', reduceMotion: false, speechRate: 1 };
  OG.profile = function () { return Object.assign({}, OG.DEFAULT_PROFILE, OG.db.get('profile', {})); };
  OG.plan = function () { return Object.assign({ start: OG.todayISO(), days: 180, reserve: 15 }, OG.db.get('plan', {})); };
  OG.settings = function () { return Object.assign({}, OG.DEFAULT_SETTINGS, OG.db.get('settings', {})); };

  /* ---------- units ---------- */
  OG.imperial = function () { return OG.settings().units === 'imperial'; };
  var r = function (x, d) { var p = Math.pow(10, d || 0); return Math.round(x * p) / p; };
  OG.fmt = {
    num: function (x, d) { return (isFinite(x) ? r(x, d) : '∞').toLocaleString(); },
    kg: function (kg, d) { return OG.imperial() ? OG.fmt.num(kg * 2.20462, d == null ? 0 : d) + ' lb' : OG.fmt.num(kg, d == null ? 1 : d) + ' kg'; },
    L: function (l, d) { return OG.imperial() ? OG.fmt.num(l / 3.78541, d == null ? 1 : d) + ' gal' : OG.fmt.num(l, d == null ? 0 : d) + ' L'; },
    m: function (m) {
      if (OG.imperial()) { var mi = m / 1609.34; return mi < 0.2 ? OG.fmt.num(m * 3.28084) + ' ft' : OG.fmt.num(mi, 2) + ' mi'; }
      return m < 1000 ? OG.fmt.num(m) + ' m' : OG.fmt.num(m / 1000, 2) + ' km';
    },
    temp: function (c) { return OG.imperial() ? OG.fmt.num(c * 9 / 5 + 32) + ' °F' : OG.fmt.num(c) + ' °C'; },
    days: function (d) { return !isFinite(d) ? '—' : OG.fmt.num(d) + ' d'; }
  };
  /* Input helpers: show in user units, store metric. */
  OG.u = {
    wIn: function (kg) { return OG.imperial() ? r(kg * 2.20462, 1) : r(kg, 1); },
    wOut: function (v) { return OG.imperial() ? v / 2.20462 : +v; },
    hIn: function (cm) { return OG.imperial() ? r(cm / 2.54, 1) : r(cm, 0); },
    hOut: function (v) { return OG.imperial() ? v * 2.54 : +v; },
    vIn: function (l) { return OG.imperial() ? r(l / 3.78541, 2) : r(l, 2); },
    vOut: function (v) { return OG.imperial() ? v * 3.78541 : +v; },
    wUnit: function () { return OG.imperial() ? 'lb' : 'kg'; }, hUnit: function () { return OG.imperial() ? 'in' : 'cm'; }, vUnit: function () { return OG.imperial() ? 'gal' : 'L'; }
  };

  /* ---------- settings ---------- */
  OG.applySettings = function () {
    var s = OG.settings(), root = document.documentElement;
    root.style.setProperty('--fs', s.fontScale);
    root.dataset.theme = s.theme;
    root.classList.toggle('reduce-motion', !!s.reduceMotion);
    var meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.content = s.theme === 'night' ? '#000000' : s.theme === 'contrast' ? '#000000' : '#101410';
  };

  /* ---------- toast & modal ---------- */
  OG.toast = function (msg, ms) {
    var t = OG.$('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  };
  OG.modal = function (title, html, buttons) {
    var m = OG.$('#modal');
    m.innerHTML = '<div class="modal-card" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><h2>' + esc(title) + '</h2><div class="modal-body">' + html + '</div><div class="row gap end modal-btns"></div></div>';
    var box = OG.$('.modal-btns', m);
    (buttons || [{ label: 'Close' }]).forEach(function (b) {
      var el = document.createElement('button'); el.className = 'btn ' + (b.cls || ''); el.textContent = b.label;
      el.onclick = function () { if (b.fn && b.fn(m) === false) return; OG.closeModal(); };
      box.appendChild(el);
    });
    m.classList.add('open'); var f = OG.$('input,select,textarea,button', m); f && f.focus();
    return m;
  };
  OG.closeModal = function () { var m = OG.$('#modal'); m.classList.remove('open'); m.innerHTML = ''; };
  OG.confirm = function (msg, fn) { OG.modal('Confirm', '<p>' + esc(msg) + '</p>', [{ label: 'Cancel' }, { label: 'Yes', cls: 'primary', fn: fn }]); };

  /* ---------- read aloud (native TTS in the APK, Web Speech in browsers) ---------- */
  OG.speak = function (text) {
    var n = OG.native();
    var rate = OG.settings().speechRate || 1;
    if (n && n.speak) { n.speak(text, rate); return true; }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      // Split long text: some engines stop after ~200 chars.
      (text.match(/[^.!?]+[.!?]*/g) || [text]).forEach(function (s) { var u = new SpeechSynthesisUtterance(s.trim()); u.rate = rate; speechSynthesis.speak(u); });
      return true;
    }
    OG.toast('Read-aloud is not available on this device.'); return false;
  };
  OG.stopSpeak = function () { var n = OG.native(); if (n && n.stopSpeaking) n.stopSpeaking(); if ('speechSynthesis' in window) speechSynthesis.cancel(); };

  /* ---------- files ---------- */
  OG.saveFile = function (name, text, mime) {
    var n = OG.native();
    if (n && n.saveFile) { n.saveFile(name, text, mime || 'application/json'); return; }
    var blob = new Blob([text], { type: mime || 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  OG.pickFile = function (accept, capture) {
    return new Promise(function (res) {
      var i = document.createElement('input'); i.type = 'file'; i.accept = accept || '*/*';
      if (capture) i.setAttribute('capture', 'environment');
      i.onchange = function () { res(i.files && i.files[0]); }; i.click();
    });
  };
  OG.readText = function (file) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = rej; fr.readAsText(file); }); };
  /* Downscale photos so local storage stays small. */
  OG.imageData = function (file, maxDim, quality) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var s = Math.min(1, (maxDim || 640) / Math.max(img.width, img.height)), c = document.createElement('canvas');
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          res({ data: c.toDataURL('image/jpeg', quality || 0.72), w: c.width, h: c.height });
        };
        img.onerror = rej; img.src = fr.result;
      };
      fr.onerror = rej; fr.readAsDataURL(file);
    });
  };

  /* ---------- small builders ---------- */
  OG.card = function (inner, cls) { return '<section class="card ' + (cls || '') + '">' + inner + '</section>'; };
  OG.pill = function (text, kind) { return '<span class="pill ' + (kind || '') + '">' + esc(text) + '</span>'; };
  OG.meter = function (frac, kind) { var p = Math.max(0, Math.min(1, frac || 0)) * 100; return '<div class="meter ' + (kind || '') + '" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(p) + '"><i style="width:' + p + '%"></i></div>'; };
  OG.levelOf = function (frac) { return frac >= 1 ? 'ok' : frac >= 0.5 ? 'warn' : 'bad'; };
  OG.field = function (label, input, hint) { return '<label class="field"><span>' + label + '</span>' + input + (hint ? '<small>' + hint + '</small>' : '') + '</label>'; };
  OG.opt = function (opts, val) { return opts.map(function (o) { var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join(''); };
  OG.formData = function (form) {
    var o = {}; OG.$$('input,select,textarea', form).forEach(function (el) {
      if (!el.name) return;
      o[el.name] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? (el.value === '' ? null : +el.value) : el.value;
    }); return o;
  };
  OG.header = function (title, sub, backTo) {
    return '<header class="page-head">' + (backTo ? '<a class="icon-btn" href="' + backTo + '" aria-label="Back">' + OG.icon('back') + '</a>' : '') +
      '<div><h1>' + esc(title) + '</h1>' + (sub ? '<p class="muted">' + esc(sub) + '</p>' : '') + '</div></header>';
  };
})();
