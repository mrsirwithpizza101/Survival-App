/* OFFGRID 180 — local database (IndexedDB, with localStorage fallback).
 * Everything is loaded into memory at start (OG.S) so screens render instantly; writes persist asynchronously. */
window.OG = window.OG || {};
(function () {
  var DB_NAME = 'offgrid180', VER = 1;
  var COLLS = ['items', 'meds', 'waypoints', 'journal', 'weather', 'checkins', 'maps'];
  var idb = null, useLS = false;
  OG.S = { kv: {} };
  COLLS.forEach(function (c) { OG.S[c] = []; });

  function open() {
    return new Promise(function (res) {
      if (!window.indexedDB) { useLS = true; return res(); }
      var rq;
      try { rq = indexedDB.open(DB_NAME, VER); } catch (e) { useLS = true; return res(); }
      rq.onupgradeneeded = function () {
        var d = rq.result;
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
        COLLS.forEach(function (c) { if (!d.objectStoreNames.contains(c)) d.createObjectStore(c, { keyPath: 'id' }); });
      };
      rq.onsuccess = function () { idb = rq.result; res(); };
      rq.onerror = function () { useLS = true; res(); };
      rq.onblocked = function () { useLS = true; res(); };
    });
  }
  function reqP(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  var pending = new Set();
  function tx(store, mode) {
    var t = idb.transaction(store, mode || 'readonly');
    if (mode === 'readwrite') { var p = new Promise(function (res) { t.oncomplete = t.onerror = t.onabort = function () { pending.delete(p); res(); }; }); pending.add(p); }
    return t.objectStore(store);
  }

  function loadAll() {
    if (useLS) {
      try {
        var raw = JSON.parse(localStorage.getItem(DB_NAME) || '{}');
        OG.S.kv = raw.kv || {};
        COLLS.forEach(function (c) { OG.S[c] = raw[c] || []; });
      } catch (e) { }
      return Promise.resolve();
    }
    var ps = COLLS.map(function (c) { return reqP(tx(c).getAll()).then(function (rows) { OG.S[c] = rows || []; }); });
    ps.push(new Promise(function (res) {
      var st = tx('kv'), out = {}, cur = st.openCursor();
      cur.onsuccess = function () { var c = cur.result; if (c) { out[c.key] = c.value; c.continue(); } else { OG.S.kv = out; res(); } };
      cur.onerror = function () { res(); };
    }));
    return Promise.all(ps);
  }
  var lsTimer = null;
  function saveLS() {
    clearTimeout(lsTimer);
    lsTimer = setTimeout(function () {
      try { localStorage.setItem(DB_NAME, JSON.stringify(OG.S)); }
      catch (e) { OG.toast && OG.toast('Storage is full — export a backup and remove photos/maps.'); }
    }, 200);
  }

  OG.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };

  OG.db = {
    init: function () { return open().then(loadAll).then(function () {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () { });
    }); },
    get: function (k, def) { return k in OG.S.kv ? OG.S.kv[k] : def; },
    set: function (k, v) {
      OG.S.kv[k] = v;
      if (useLS) return saveLS();
      try { tx('kv', 'readwrite').put(v, k); } catch (e) { console.warn(e); }
    },
    all: function (c) { return OG.S[c] || []; },
    put: function (c, obj) {
      if (!obj.id) obj.id = OG.uid();
      obj.updated = Date.now();
      var arr = OG.S[c], i = arr.findIndex(function (x) { return x.id === obj.id; });
      if (i >= 0) arr[i] = obj; else arr.push(obj);
      if (useLS) saveLS(); else try { tx(c, 'readwrite').put(obj); } catch (e) { console.warn(e); }
      return obj;
    },
    del: function (c, id) {
      OG.S[c] = OG.S[c].filter(function (x) { return x.id !== id; });
      if (useLS) saveLS(); else try { tx(c, 'readwrite').delete(id); } catch (e) { console.warn(e); }
    },
    exportAll: function () {
      var out = { app: 'OFFGRID 180', version: 1, exported: new Date().toISOString(), kv: OG.S.kv };
      COLLS.forEach(function (c) { out[c] = OG.S[c]; });
      return out;
    },
    importAll: function (data) {
      if (!data || data.app !== 'OFFGRID 180') throw new Error('Not an OFFGRID 180 backup file.');
      Object.keys(data.kv || {}).forEach(function (k) { OG.db.set(k, data.kv[k]); });
      COLLS.forEach(function (c) {
        (data[c] || []).forEach(function (o) { OG.db.put(c, o); });
      });
    },
    wipe: function () {
      OG.S.kv = {}; COLLS.forEach(function (c) { OG.S[c] = []; });
      if (useLS) { localStorage.removeItem(DB_NAME); return Promise.resolve(); }
      var all = ['kv'].concat(COLLS).map(function (c) { return reqP(tx(c, 'readwrite').clear()); });
      return Promise.all(all);
    },
    usingFallback: function () { return useLS; },
    /* Resolves when every pending write has been committed to disk. */
    flush: function () { return useLS ? new Promise(function (r) { setTimeout(r, 250); }) : Promise.all(Array.from(pending)); },
    COLLS: COLLS
  };
})();
