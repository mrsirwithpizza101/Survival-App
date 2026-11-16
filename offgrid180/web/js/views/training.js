/* Training Center: progressive courses, lessons, quizzes, completion tracking and skill assessments. */
(function () {
  var esc = OG.esc;
  function courseStats(c) {
    var p = OG.progress(), passed = 0, read = 0, skills = 0, skillsTotal = 0;
    c.lessons.forEach(function (id) {
      var a = OG.articleById(id), pr = p[id] || {}; if (!a) return;
      if (pr.quiz) passed++; if (pr.read) read++;
      skillsTotal += a.checklist.length; skills += Object.keys(pr.skills || {}).filter(function (k) { return pr.skills[k]; }).length;
    });
    return { passed: passed, read: read, total: c.lessons.length, skills: skills, skillsTotal: skillsTotal, done: passed === c.lessons.length };
  }
  OG.route('/training', function () {
    var all = OG.COURSES.map(function (c) { return { c: c, s: courseStats(c) }; });
    var done = all.filter(function (x) { return x.s.done; }).length;
    var html = OG.header('Training Center', done + ' of ' + OG.COURSES.length + ' courses complete') +
      OG.card('<p>Each course is a set of guides. Read each one, tick the skills you have practiced hands-on, and pass its knowledge check. Practice skills in a safe setting before you rely on them.</p>' + OG.meter(done / OG.COURSES.length));
    ['Beginner', 'Intermediate'].forEach(function (lvl) {
      html += '<h2>' + lvl + '</h2><div class="grid wide" style="margin-bottom:12px">' + all.filter(function (x) { return x.c.level === lvl; }).map(function (x) {
        return '<a class="tile" href="#/course/' + x.c.id + '">' + OG.icon(x.c.icon) + '<b>' + esc(x.c.title) + '</b><small>' + x.s.passed + '/' + x.s.total + ' lessons passed · skills ' + x.s.skills + '/' + x.s.skillsTotal + '</small>' + OG.meter(x.s.passed / x.s.total, x.s.done ? '' : 'warn') + (x.s.done ? OG.pill('Complete', 'ok') : '') + '</a>';
      }).join('') + '</div>';
    });
    return html;
  });

  OG.route('/course/:id', function (id) {
    var c = OG.COURSES.find(function (x) { return x.id === id; }); if (!c) return OG.card('Course not found');
    var s = courseStats(c), p = OG.progress();
    return OG.header(c.title, c.level + ' · ' + s.passed + '/' + s.total + ' lessons passed', '#/training') +
      OG.card('<h2>Lessons</h2><ol class="list">' + c.lessons.map(function (lid, i) {
        var a = OG.articleById(lid), pr = p[lid] || {};
        return '<li><a class="li" href="#/article/' + lid + '?from=/course/' + id + '"><b>' + (i + 1) + '</b><span class="grow">' + esc(a.title) + '<small>' + a.steps.length + ' steps · ' + a.quiz.length + ' questions</small></span>' + (pr.quiz ? OG.pill('passed', 'ok') : pr.read ? OG.pill('read') : OG.pill('start', 'acc')) + '</a></li>';
      }).join('') + '</ol>') +
      OG.card('<h2>Skill assessment</h2><p>Hands-on skills you have marked as practiced: <b>' + s.skills + ' of ' + s.skillsTotal + '</b>.</p>' + OG.meter(s.skills / Math.max(1, s.skillsTotal)) + '<p class="muted small">Tick skills inside each lesson once you can do them without notes.</p>') +
      '<a class="btn primary block" href="#/course/' + id + '/exam">' + OG.icon('grad') + ' Take the course exam</a>';
  });

  /* Course exam: every question from every lesson, shuffled. */
  OG.route('/course/:id/exam', function (id) {
    var c = OG.COURSES.find(function (x) { return x.id === id; }); if (!c) return OG.card('Course not found');
    var qs = []; c.lessons.forEach(function (lid) { var a = OG.articleById(lid); a.quiz.forEach(function (q) { qs.push({ q: q, lid: lid }); }); });
    qs.sort(function () { return Math.random() - 0.5; });
    var pseudo = { id: 'exam-' + id, quiz: qs.map(function (x) { return x.q; }) };
    return {
      html: OG.header(c.title + ' — exam', qs.length + ' questions · pass with 80%', '#/course/' + id) + OG.card(OG.quizHTML(pseudo) + '<div id="exam-score"></div>'),
      mount: function (el) {
        var answered = 0, right = 0;
        OG.$$('.quiz-opt', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var qi = +b.dataset.qi; if (b.dataset.done) return;
            OG.$$('.quiz-opt[data-qi="' + qi + '"]', el).forEach(function (x) { x.dataset.done = 1; });
            answered++; if (+b.dataset.oi === pseudo.quiz[qi][2]) right++;
            if (answered === qs.length) {
              var pct = Math.round(right / qs.length * 100), ok = pct >= 80;
              OG.$('#exam-score', el).innerHTML = '<h2 style="color:var(--' + (ok ? 'ok' : 'warn') + ')">' + pct + '% — ' + (ok ? 'Passed. All lessons marked complete.' : 'Review the lessons and retake.') + '</h2>';
              if (ok) c.lessons.forEach(function (lid) { OG.setProgress(lid, { quiz: true, read: true, passedOn: OG.todayISO() }); });
              var ex = OG.db.get('exams', {}); ex[id] = { pct: pct, date: OG.todayISO() }; OG.db.set('exams', ex);
            }
          });
        });
        OG.bindQuiz(el, pseudo);
        var r = OG.$('#quiz-result', el); if (r) r.hidden = true;
      }
    };
  });
})();
