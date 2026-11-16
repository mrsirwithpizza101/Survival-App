/* Knowledge Library, articles, quizzes and global search. */
(function () {
  var esc = OG.esc;
  OG.articleById = function (id) { return OG.ARTICLES.find(function (a) { return a.id === id; }); };
  OG.levelPill = function (a) { return a.level === 'verified' ? OG.pill('Verified', 'ok') : OG.pill('General guidance', 'acc'); };
  OG.progress = function () { return OG.db.get('progress', {}); };
  OG.setProgress = function (id, patch) { var p = OG.progress(); p[id] = Object.assign({}, p[id], patch); OG.db.set('progress', p); };

  OG.articleList = function (list) {
    var prog = OG.progress();
    return '<ul class="list">' + list.map(function (a) {
      var pr = prog[a.id] || {}, m = OG.moduleById(a.module);
      return '<li><a class="li" href="#/article/' + a.id + '">' + OG.icon(m ? m.icon : 'book') + '<span class="grow">' + esc(a.title) + '<small>' + (m ? esc(m.name) : '') + '</small></span>' +
        (pr.quiz ? OG.pill('passed', 'ok') : pr.read ? OG.pill('read') : '') + '</a></li>';
    }).join('') + '</ul>';
  };
  /* Module block used by section pages. */
  OG.moduleBlocks = function (ids) {
    return ids.map(function (id) {
      var m = OG.moduleById(id), arts = OG.ARTICLES.filter(function (a) { return a.module === id; });
      return OG.card('<div class="row gap">' + OG.icon(m.icon) + '<h2 style="margin:0">' + m.n + '. ' + esc(m.name) + '</h2></div><p class="muted">' + esc(m.blurb) + '</p>' + OG.articleList(arts));
    }).join('');
  };

  OG.route('/library', function (q) {
    var html = OG.header('Knowledge Library', OG.ARTICLES.length + ' offline guides across 16 modules') +
      '<div class="searchbox"><input type="search" id="lib-q" placeholder="Search guides, steps, warnings…" aria-label="Search the library"></div>' +
      '<div id="lib-results"></div><div id="lib-modules"><div class="grid">' + OG.MODULES.map(function (m) {
        var n = OG.ARTICLES.filter(function (a) { return a.module === m.id; }).length;
        return '<a class="tile" href="#/library/' + m.id + '">' + OG.icon(m.icon) + '<b>' + m.n + '. ' + esc(m.name) + '</b><small>' + n + ' guides</small></a>';
      }).join('') + '</div></div>' +
      OG.card('<p class="small muted">' + OG.pill('Verified', 'ok') + ' matches the named authoritative source (CDC, Red Cross, NWS, USDA…). ' + OG.pill('General guidance', 'acc') + ' is widely taught field practice — verify locally and practice under supervision.</p>');
    return {
      html: html, mount: function (el) {
        var inp = OG.$('#lib-q', el), res = OG.$('#lib-results', el), mods = OG.$('#lib-modules', el);
        inp.oninput = function () {
          var hits = OG.searchArticles(inp.value);
          mods.hidden = !!inp.value.trim();
          res.innerHTML = inp.value.trim() ? OG.card('<h2>' + hits.length + ' results</h2>' + OG.articleList(hits)) : '';
        };
      }
    };
  });

  OG.route('/library/:mod', function (mod) {
    var m = OG.moduleById(mod); if (!m) return OG.card('Module not found.');
    var sec = OG.SECTIONS.find(function (s) { return s.id === m.section; });
    return OG.header(m.n + '. ' + m.name, m.blurb, '#/library') + OG.card(OG.articleList(OG.ARTICLES.filter(function (a) { return a.module === mod; }))) +
      '<a class="btn block" href="#/' + sec.id + '">' + OG.icon(sec.icon) + ' Open ' + sec.name + ' tools</a>';
  });

  function textOf(a) { return [a.title, a.explain, a.why, a.materials.join(' '), a.steps.join(' '), a.mistakes.join(' '), a.warnings.join(' '), a.emergency.join(' '), a.source].join(' ').toLowerCase(); }
  OG.searchArticles = function (q) {
    var words = q.toLowerCase().split(/\s+/).filter(Boolean); if (!words.length) return [];
    return OG.ARTICLES.map(function (a) {
      var t = textOf(a), title = a.title.toLowerCase(), s = 0;
      words.forEach(function (w) { if (t.indexOf(w) >= 0) s += 1; if (title.indexOf(w) >= 0) s += 3; });
      return { a: a, s: words.every(function (w) { return t.indexOf(w) >= 0; }) ? s : 0 };
    }).filter(function (x) { return x.s > 0; }).sort(function (x, y) { return y.s - x.s; }).map(function (x) { return x.a; });
  };

  OG.quizHTML = function (a) {
    return a.quiz.map(function (q, qi) {
      return '<div class="quiz" data-q="' + qi + '"><p><b>' + (qi + 1) + '. ' + esc(q[0]) + '</b></p>' + q[1].map(function (o, oi) {
        return '<button class="btn quiz-opt" data-qi="' + qi + '" data-oi="' + oi + '">' + esc(o) + '</button>';
      }).join('') + '<p class="muted small qwhy" hidden></p></div>';
    }).join('') + '<p id="quiz-result" class="small" aria-live="polite"></p>';
  };
  OG.bindQuiz = function (el, a, onPass) {
    var answers = {};
    OG.$$('.quiz-opt', el).forEach(function (b) {
      b.onclick = function () {
        var qi = +b.dataset.qi, oi = +b.dataset.oi, q = a.quiz[qi];
        if (qi in answers) return;
        answers[qi] = oi === q[2];
        var box = b.closest('.quiz');
        OG.$$('.quiz-opt', box).forEach(function (x) { if (+x.dataset.oi === q[2]) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); x.disabled = true; });
        var why = OG.$('.qwhy', box); why.hidden = false; why.textContent = (answers[qi] ? 'Correct. ' : 'Not quite. ') + q[3];
        if (Object.keys(answers).length === a.quiz.length) {
          var ok = Object.keys(answers).every(function (k) { return answers[k]; });
          var resEl = OG.$('#quiz-result', el); if (!resEl) return;
          resEl.innerHTML = ok ? '<b style="color:var(--ok)">Passed — lesson complete.</b>' : '<b style="color:var(--warn)">Review the guide and try again.</b> <button class="btn" id="quiz-retry">Retry</button>';
          if (ok && OG.articleById(a.id)) { OG.setProgress(a.id, { quiz: true, read: true, passedOn: OG.todayISO() }); onPass && onPass(); }
          var r = OG.$('#quiz-retry', el); if (r) r.onclick = function () { OG.refresh(); };
        }
      };
    });
  };

  OG.route('/article/:id', function (id, q) {
    var a = OG.articleById(id); if (!a) return OG.card('Guide not found.');
    var m = OG.moduleById(a.module), pr = OG.progress()[id] || {}, skills = pr.skills || {};
    var list = function (arr, ordered) { var t = ordered ? 'ol' : 'ul'; return '<' + t + '>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</' + t + '>'; };
    var h = function (n, title, icon) { return '<h2>' + OG.icon(icon || 'book') + n + '. ' + title + '</h2>'; };
    var back = q.get('from') ? '#' + q.get('from') : '#/library/' + a.module;
    var html = OG.header(a.title, m.name, back) +
      '<article class="card article"><div class="row gap">' + OG.levelPill(a) + '<span class="small muted">Source: ' + esc(a.source) + '</span></div>' +
      '<div class="row gap" style="margin-top:8px"><button class="btn" id="read-btn">' + OG.icon('speak') + ' Read aloud</button><button class="btn" id="print-btn">Print / save PDF</button></div>' +
      h(1, 'What it is', 'book') + '<p>' + esc(a.explain) + '</p>' +
      h(2, 'Why it matters', 'star') + '<p>' + esc(a.why) + '</p>' +
      h(3, 'Materials', 'box') + list(a.materials) +
      h(4, 'Step by step', 'check') + list(a.steps, true) +
      h(5, 'Diagram', 'map') + (a.diagram && OG.DIAGRAMS[a.diagram] ? OG.DIAGRAMS[a.diagram] : '<p class="muted small">No diagram for this guide. Practice it hands-on with an instructor.</p>') +
      h(6, 'Common mistakes', 'alert') + list(a.mistakes) +
      h(7, 'Safety warnings', 'alert') + '<div class="warnbox">' + list(a.warnings) + '</div>' +
      h(8, 'Emergency considerations', 'siren') + '<div class="infobox">' + list(a.emergency) + '</div>' +
      h(9, 'Practical skills checklist', 'check') + a.checklist.map(function (c, i) {
        return '<label class="check' + (skills[i] ? ' done' : '') + '"><input type="checkbox" data-skill="' + i + '"' + (skills[i] ? ' checked' : '') + '><span>' + esc(c) + '</span></label>';
      }).join('') +
      h(10, 'Knowledge assessment', 'grad') + (pr.quiz ? '<p>' + OG.pill('Passed ' + (pr.passedOn || ''), 'ok') + ' You can retake it below.</p>' : '') + OG.quizHTML(a) +
      '</article>';
    return {
      html: html, mount: function (el) {
        if (!pr.read) OG.setProgress(id, { read: true });
        OG.$('#read-btn', el).onclick = function () { OG.speak(OG.$('article', el).innerText); };
        OG.$('#print-btn', el).onclick = function () { window.print(); };
        OG.$$('[data-skill]', el).forEach(function (cb) { cb.onchange = function () { var s = (OG.progress()[id] || {}).skills || {}; s[cb.dataset.skill] = cb.checked; OG.setProgress(id, { skills: s }); cb.parentNode.classList.toggle('done', cb.checked); }; });
        OG.bindQuiz(el, a);
      }
    };
  });

  /* Global search across everything. */
  OG.route('/search', function (q) {
    var html = OG.header('Search everything', 'Guides, equipment, emergency procedures, your inventory and waypoints') +
      '<input type="search" id="gq" placeholder="e.g. bleach, tourniquet, propane, bear" aria-label="Search" value="' + esc(q.get('q') || '') + '"><div id="gres" style="margin-top:12px"></div>';
    return {
      html: html, mount: function (el) {
        var inp = OG.$('#gq', el), out = OG.$('#gres', el);
        function run() {
          var v = inp.value.trim().toLowerCase(); if (!v) { out.innerHTML = '<p class="muted">Type to search. Works offline.</p>'; return; }
          var has = function (s) { return String(s || '').toLowerCase().indexOf(v) >= 0; };
          var arts = OG.searchArticles(v);
          var trees = OG.TREES.filter(function (t) { return has(t.title) || Object.keys(t.nodes).some(function (k) { var n = t.nodes[k]; return has(n.q) || has(n.end) || (n.a || []).some(has); }); });
          var cat = OG.CATALOG.filter(function (c) { return has(c.name) || has(c.desc) || has(c.cat); });
          var inv = OG.db.all('items').filter(function (i) { return has(i.name) || has(i.notes) || has(i.location); });
          var wps = OG.db.all('waypoints').filter(function (w) { return has(w.name) || has(w.notes); });
          var sec = function (t, body, n) { return n ? OG.card('<h2>' + t + ' (' + n + ')</h2>' + body) : ''; };
          out.innerHTML = (sec('Emergency procedures', '<ul class="list">' + trees.map(function (t) { return '<li><a class="li" href="#/emergency/tree/' + t.id + '">' + OG.icon(t.icon) + '<span class="grow">' + esc(t.title) + '</span></a></li>'; }).join('') + '</ul>', trees.length) +
            sec('Guides', OG.articleList(arts), arts.length) +
            sec('Your inventory', '<ul class="list">' + inv.map(function (i) { return '<li><a class="li" href="#/inventory/item/' + i.id + '"><span class="grow">' + esc(i.name) + '<small>' + esc(i.qty + ' ' + (i.unit || '')) + '</small></span></a></li>'; }).join('') + '</ul>', inv.length) +
            sec('Equipment catalog', '<ul class="list">' + cat.map(function (c) { return '<li><a class="li" href="#/catalog/' + c.id + '">' + OG.icon(c.icon) + '<span class="grow">' + esc(c.name) + '<small>Tier ' + c.tier + ' · ' + c.cat + '</small></span></a></li>'; }).join('') + '</ul>', cat.length) +
            sec('Waypoints', '<ul class="list">' + wps.map(function (w) { return '<li><a class="li" href="#/maps/waypoints"><span class="grow">' + esc(w.name) + '<small>' + w.lat.toFixed(5) + ', ' + w.lon.toFixed(5) + '</small></span></a></li>'; }).join('') + '</ul>', wps.length)) || '<p class="muted">No matches.</p>';
        }
        inp.oninput = run; run(); inp.focus();
      }
    };
  });
})();
