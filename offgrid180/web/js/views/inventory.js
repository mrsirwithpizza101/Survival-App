/* Equipment Inventory: your gear, catalog, tiers, condition, expiry, maintenance, photos. */
(function () {
  var esc = OG.esc;
  var TIER = { 1: 'Tier 1 · Life-critical', 2: 'Tier 2 · Sustainability', 3: 'Tier 3 · Comfort' };

  function itemStatus(i) {
    var out = [];
    if (i.expires) { var d = OG.daysUntil(i.expires); if (d < 0) out.push(OG.pill('expired', 'bad')); else if (d <= 30) out.push(OG.pill('expires ' + d + 'd', 'warn')); }
    if (+i.maintDays > 0 && (!i.lastMaint || OG.addDays(i.lastMaint, +i.maintDays) <= OG.todayISO())) out.push(OG.pill('maintenance', 'warn'));
    if (i.condition === 'Poor' || i.condition === 'Broken') out.push(OG.pill(i.condition, 'bad'));
    if (+i.dailyUse > 0) { var dl = OG.itemDays(i), rem = OG.status.cache ? OG.status.cache.remaining : OG.plan().days; out.push(OG.pill(OG.fmt.days(dl) + ' left', dl < rem ? 'warn' : 'ok')); }
    return out.join(' ');
  }

  OG.route('/inventory', function (q) {
    OG.status.cache = OG.status();
    var cat = q.get('cat') || '', items = OG.db.all('items').slice().sort(function (a, b) { return (a.tier || 3) - (b.tier || 3) || a.name.localeCompare(b.name); });
    var cats = OG.CATALOG_CATS.filter(function (c) { return items.some(function (i) { return i.cat === c; }); });
    var shown = cat ? items.filter(function (i) { return i.cat === cat; }) : items;
    var html = OG.header('Equipment Inventory', items.length + ' items tracked') +
      '<div class="row gap" style="margin-bottom:12px"><a class="btn primary" href="#/inventory/item/new">' + OG.icon('plus') + ' Add item</a><a class="btn" href="#/catalog">' + OG.icon('book') + ' Equipment catalog</a><button class="btn" id="csv">Export CSV</button></div>' +
      '<input type="search" id="inv-q" placeholder="Filter my inventory" aria-label="Filter inventory" style="margin-bottom:8px">' +
      '<div class="chips"><a class="chip' + (!cat ? ' on' : '') + '" href="#/inventory">All</a>' + cats.map(function (c) { return '<a class="chip' + (c === cat ? ' on' : '') + '" href="#/inventory?cat=' + encodeURIComponent(c) + '">' + c + '</a>'; }).join('') + '</div>';
    if (!items.length) html += OG.card('<h2>No gear yet</h2><p>Start from the catalog — it lists life-critical, sustainability and comfort equipment with suggested quantities for your plan length. Or add your own items.</p><a class="btn primary" href="#/catalog">Browse catalog</a>');
    [1, 2, 3].forEach(function (t) {
      var list = shown.filter(function (i) { return (+i.tier || 3) === t; }); if (!list.length) return;
      html += OG.card('<h2>' + TIER[t] + '</h2><ul class="list inv-list">' + list.map(function (i) {
        return '<li data-name="' + esc((i.name + ' ' + i.cat + ' ' + (i.location || '')).toLowerCase()) + '"><div class="li">' +
          (i.photo ? '<img class="thumb" src="' + i.photo + '" alt="">' : '<span class="thumb">' + OG.icon((OG.CATALOG.find(function (c) { return c.id === i.catalogId; }) || {}).icon || 'box') + '</span>') +
          '<a class="grow" href="#/inventory/item/' + i.id + '" style="color:inherit;text-decoration:none">' + esc(i.name) + '<small>' + esc(OG.fmt.num(+i.qty, 2) + ' ' + (i.unit || '') + ' · ' + i.cat + (i.location ? ' · ' + i.location : '')) + '</small><span>' + itemStatus(i) + '</span></a>' +
          '<button class="icon-btn" data-dec="' + i.id + '" aria-label="Use one ' + esc(i.name) + '">−</button><button class="icon-btn" data-inc="' + i.id + '" aria-label="Add one ' + esc(i.name) + '">+</button></div></li>';
      }).join('') + '</ul>');
    });
    html += '<h2>Modules in this section</h2>' + OG.moduleBlocks(['tools', 'planning', 'power', 'clothing']);
    return {
      html: html, mount: function (el) {
        OG.$('#inv-q', el).oninput = function (e) { var v = e.target.value.toLowerCase(); OG.$$('.inv-list > li', el).forEach(function (li) { li.hidden = v && li.dataset.name.indexOf(v) < 0; }); };
        OG.$$('[data-inc],[data-dec]', el).forEach(function (b) {
          b.onclick = function () {
            var id = b.dataset.inc || b.dataset.dec, it = OG.db.all('items').find(function (x) { return x.id === id; });
            it.qty = Math.max(0, (+it.qty || 0) + (b.dataset.inc ? 1 : -1)); OG.db.put('items', it); OG.refresh();
          };
        });
        OG.$('#csv', el).onclick = function () {
          var cols = ['name', 'cat', 'tier', 'qty', 'unit', 'dailyUse', 'kcal', 'liters', 'condition', 'expires', 'maintDays', 'lastMaint', 'replaceBy', 'location', 'notes'];
          var csv = cols.join(',') + '\n' + OG.db.all('items').map(function (i) { return cols.map(function (c) { return '"' + String(i[c] == null ? '' : i[c]).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
          OG.saveFile('offgrid180-inventory-' + OG.todayISO() + '.csv', csv, 'text/csv');
        };
      }
    };
  });

  /* Edit / add item */
  OG.route('/inventory/item/:id', function (id, q) {
    var isNew = id === 'new', it = isNew ? { name: '', cat: q.get('cat') || 'Tools', tier: 2, qty: 1, unit: 'each', condition: 'Good' } : OG.db.all('items').find(function (x) { return x.id === id; });
    if (!it) return OG.card('Item not found. <a href="#/inventory">Back</a>');
    var pre = q.get('from') ? OG.CATALOG.find(function (c) { return c.id === q.get('from'); }) : null;
    if (isNew && pre) {
      var plan = OG.plan(), scale = pre.consumable ? plan.days / 180 * (1 + plan.reserve / 100) : 1;
      it = { name: pre.name, cat: pre.cat, tier: pre.tier, qty: Math.ceil(pre.per180 * scale), unit: pre.unit, condition: 'Good', catalogId: pre.id, maintDays: pre.maintDays || '', kcal: pre.kcal || '',
        liters: pre.id === 'water-jugs' ? 18.9 : '', notes: pre.use, lastMaint: pre.maintDays ? OG.todayISO() : '', dailyUse: pre.consumable && !pre.kcal ? Math.round(pre.per180 / 180 * 100) / 100 : '' };
    }
    var cat = OG.CATALOG.find(function (c) { return c.id === it.catalogId; });
    var html = OG.header(isNew ? 'Add item' : it.name, isNew ? 'Track quantity, condition, expiry and maintenance' : TIER[it.tier || 3], '#/inventory') +
      '<form id="itf" class="card"><div id="photo-box">' + (it.photo ? '<img class="photo" src="' + it.photo + '" alt="Photo of ' + esc(it.name) + '">' : '') + '</div>' +
      '<div class="row gap" style="margin:8px 0"><button type="button" class="btn" id="ph">' + OG.icon('cam') + ' ' + (it.photo ? 'Replace photo' : 'Add photo') + '</button>' + (it.photo ? '<button type="button" class="btn" id="phx">Remove photo</button>' : '') + '</div>' +
      OG.field('Name', '<input name="name" required value="' + esc(it.name) + '">') +
      '<div class="form-grid">' +
      OG.field('Category', '<select name="cat">' + OG.opt(OG.CATALOG_CATS, it.cat) + '</select>') +
      OG.field('Priority tier', '<select name="tier">' + OG.opt([[1, '1 Life-critical'], [2, '2 Sustainability'], [3, '3 Comfort']], it.tier) + '</select>') +
      OG.field('Quantity', '<input type="number" step="any" name="qty" value="' + esc(it.qty) + '">') +
      OG.field('Unit', '<input name="unit" value="' + esc(it.unit || '') + '" placeholder="kg, cans, L, each">') +
      OG.field('Daily use (units/day)', '<input type="number" step="any" name="dailyUse" value="' + esc(it.dailyUse || '') + '">', 'For depletion alerts') +
      OG.field('Calories per unit', '<input type="number" step="any" name="kcal" value="' + esc(it.kcal || '') + '">', 'Food only (e.g., rice ≈ 3,600 per kg)') +
      OG.field('Liters per unit', '<input type="number" step="any" name="liters" value="' + esc(it.liters || '') + '">', 'Water only (5 gal = 18.9 L)') +
      OG.field('Condition', '<select name="condition">' + OG.opt(['New', 'Good', 'Fair', 'Poor', 'Broken'], it.condition) + '</select>') +
      OG.field('Expires', '<input type="date" name="expires" value="' + esc(it.expires || '') + '">') +
      OG.field('Replace by', '<input type="date" name="replaceBy" value="' + esc(it.replaceBy || '') + '">') +
      OG.field('Maintain every (days)', '<input type="number" name="maintDays" value="' + esc(it.maintDays || '') + '">') +
      OG.field('Last maintained', '<input type="date" name="lastMaint" value="' + esc(it.lastMaint || '') + '">') +
      OG.field('Storage location', '<input name="location" value="' + esc(it.location || '') + '">') +
      '</div>' + OG.field('Notes', '<textarea name="notes" rows="3">' + esc(it.notes || '') + '</textarea>') +
      '<div class="row gap"><button class="btn primary grow" type="submit">Save</button>' + (isNew ? '' : '<button type="button" class="btn danger" id="del">' + OG.icon('trash') + ' Delete</button>') + '</div></form>' +
      (cat ? OG.card('<h2>From the catalog</h2><p><b>Use:</b> ' + esc(cat.use) + '</p><p><b>Maintenance:</b> ' + esc(cat.maint) + '</p><p><b>Replace:</b> ' + esc(cat.replace) + '</p><a href="#/article/' + cat.article + '">Related guide →</a>') : '');
    var photo = it.photo || null;
    return {
      html: html, mount: function (el) {
        var form = OG.$('#itf', el);
        OG.$('#ph', el).onclick = function () {
          OG.pickFile('image/*', true).then(function (f) { if (!f) return; return OG.imageData(f, 640); }).then(function (img) {
            if (!img) return; photo = img.data; OG.$('#photo-box', el).innerHTML = '<img class="photo" src="' + photo + '" alt="">';
          }).catch(function () { OG.toast('Could not read that image.'); });
        };
        var px = OG.$('#phx', el); if (px) px.onclick = function () { photo = null; OG.$('#photo-box', el).innerHTML = ''; };
        form.onsubmit = function (e) {
          e.preventDefault(); var d = OG.formData(form);
          var obj = Object.assign({}, isNew ? {} : it, d, { photo: photo, tier: +d.tier, catalogId: it.catalogId || null });
          if (!obj.name.trim()) { OG.toast('Name is required'); return; }
          OG.db.put('items', obj); OG.toast('Saved'); location.hash = '#/inventory';
        };
        var del = OG.$('#del', el); if (del) del.onclick = function () { OG.confirm('Delete ' + it.name + '?', function () { OG.db.del('items', it.id); location.hash = '#/inventory'; }); };
      }
    };
  });

  /* Equipment catalog */
  OG.route('/catalog', function (q) {
    var tier = q.get('tier') || '', cat = q.get('cat') || '', plan = OG.plan(), items = OG.db.all('items');
    var list = OG.CATALOG.filter(function (c) { return (!tier || c.tier === +tier) && (!cat || c.cat === cat); });
    var link = function (t, c) { var p = []; if (t) p.push('tier=' + t); if (c) p.push('cat=' + encodeURIComponent(c)); return '#/catalog' + (p.length ? '?' + p.join('&') : ''); };
    var html = OG.header('Equipment catalog', OG.CATALOG.length + ' items · quantities scaled to your ' + plan.days + '-day plan', '#/inventory') +
      '<input type="search" id="cq" placeholder="Search catalog" aria-label="Search catalog" style="margin-bottom:8px">' +
      '<div class="chips">' + [['', 'All tiers'], ['1', 'Tier 1'], ['2', 'Tier 2'], ['3', 'Tier 3']].map(function (t) { return '<a class="chip' + (tier === t[0] ? ' on' : '') + '" href="' + link(t[0], cat) + '">' + t[1] + '</a>'; }).join('') + '</div>' +
      '<div class="chips"><a class="chip' + (!cat ? ' on' : '') + '" href="' + link(tier, '') + '">All</a>' + OG.CATALOG_CATS.map(function (c) { return '<a class="chip' + (c === cat ? ' on' : '') + '" href="' + link(tier, c) + '">' + c + '</a>'; }).join('') + '</div>' +
      OG.card('<ul class="list cat-list">' + list.map(function (c) {
        var owned = items.some(function (i) { return i.catalogId === c.id; });
        var qty = c.consumable ? Math.ceil(c.per180 * plan.days / 180 * (1 + plan.reserve / 100)) : c.per180;
        return '<li data-name="' + esc((c.name + ' ' + c.desc + ' ' + c.cat).toLowerCase()) + '"><a class="li" href="#/catalog/' + c.id + '"><span class="thumb">' + OG.icon(c.icon) + '</span><span class="grow">' + esc(c.name) + '<small>' + TIER[c.tier] + ' · suggest ' + qty + ' ' + c.unit + '</small></span>' + (owned ? OG.pill('owned', 'ok') : '') + '</a></li>';
      }).join('') + '</ul>') + '<p class="muted small">Suggested quantities are planning estimates for one person; consumables scale with plan length and reserve. Photos: the catalog uses icons — add your own photos to items in your inventory.</p>';
    return { html: html, mount: function (el) { OG.$('#cq', el).oninput = function (e) { var v = e.target.value.toLowerCase(); OG.$$('.cat-list > li', el).forEach(function (li) { li.hidden = v && li.dataset.name.indexOf(v) < 0; }); }; } };
  });
  OG.route('/catalog/:id', function (id) {
    var c = OG.CATALOG.find(function (x) { return x.id === id; }); if (!c) return OG.card('Not found');
    var plan = OG.plan(), qty = c.consumable ? Math.ceil(c.per180 * plan.days / 180 * (1 + plan.reserve / 100)) : c.per180;
    var a = OG.articleById(c.article);
    return OG.header(c.name, TIER[c.tier] + ' · ' + c.cat, '#/catalog') +
      OG.card('<div class="row gap"><span class="thumb" style="width:72px;height:72px">' + OG.icon(c.icon) + '</span><p class="grow">' + esc(c.desc) + '</p></div>' +
        '<table><tr><th>Suggested for ' + plan.days + ' days</th><td>' + qty + ' ' + esc(c.unit) + (c.consumable ? ' (incl. ' + plan.reserve + '% reserve)' : '') + '</td></tr>' +
        '<tr><th>How to use</th><td>' + esc(c.use) + '</td></tr><tr><th>Maintenance</th><td>' + esc(c.maint) + '</td></tr><tr><th>Replace when</th><td>' + esc(c.replace) + '</td></tr>' +
        (c.kcal ? '<tr><th>Calories</th><td>' + c.kcal + ' kcal per ' + esc(c.unit.replace(/s$/, '')) + '</td></tr>' : '') + '</table>' +
        '<div class="row gap" style="margin-top:12px"><a class="btn primary" href="#/inventory/item/new?from=' + c.id + '">' + OG.icon('plus') + ' Add to my inventory</a>' + (a ? '<a class="btn" href="#/article/' + a.id + '?from=/catalog/' + c.id + '">Guide: ' + esc(a.title) + '</a>' : '') + '</div>');
  });
})();
