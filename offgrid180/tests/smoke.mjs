// Headless smoke test: node offgrid180/tests/smoke.mjs  (serves web/ on :8765)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/npm-tools/node_modules/playwright'); }
import http from 'http'; import fs from 'fs'; import path from 'path'; import url from 'url';
const root = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'web');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(8765);
const shots = process.env.SHOTS || '';
const browser = await pw.chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, geolocation: { latitude: 45.5946, longitude: -121.1787, accuracy: 8 }, permissions: ['geolocation'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message + ' @ ' + (e.stack||'').split('\n')[1]));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const go = async (h) => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(120); const t = await page.$eval('#main', e => e.innerText); if (/Something went wrong/.test(t)) errors.push('route error ' + h + ': ' + t.slice(0, 200)); return t; };
const shot = async (n) => { if (shots) await page.screenshot({ path: path.join(shots, n + '.png'), fullPage: false }); };

await page.goto('http://localhost:8765/index.html');
await page.waitForSelector('#wf');
await shot('00-welcome');
await page.click('#wf button[type=submit]');
await page.waitForTimeout(200);
// Seed: add catalog items via UI
for (const id of ['rice', 'beans', 'oil', 'water-jugs', 'propane', 'filter-hf', 'ifak', 'plb', 'co-alarm', 'lighters']) {
  await go('#/inventory/item/new?from=' + id); await page.click('#itf button[type=submit]'); await page.waitForTimeout(80);
}
// set propane daily use
await page.evaluate(() => { const it = OG.db.all('items').find(i => i.catalogId === 'propane'); it.dailyUse = 0.4; it.maintDays = 1; OG.db.put('items', it); OG.db.put('meds', { name: 'Test med', perDay: 1, count: 30, rx: true, dose: '10 mg', expires: '2026-01-01' }); });
const routes = ['#/dashboard', '#/library', '#/library/water', '#/article/water-chemical', '#/article/med-bleeding', '#/search?q=bleach', '#/inventory', '#/inventory?cat=Food', '#/catalog', '#/catalog?tier=1&cat=Water', '#/catalog/filter-hf',
  '#/foodwater', '#/calc/profile', '#/calc/plan', '#/calc/food', '#/calc/water', '#/calc/fuel', '#/calc/solar', '#/calc/supplies', '#/calc/depletion',
  '#/medical', '#/medical/meds', '#/medical/info', '#/medical/breathe', '#/maps', '#/maps/position', '#/maps/compass', '#/maps/waypoints', '#/maps/offline', '#/maps/tools', '#/maps/weather',
  '#/training', '#/course/water', '#/course/water/exam', '#/ops', '#/ops/tasks', '#/ops/history', '#/ops/power', '#/ops/journal',
  '#/emergency', '#/emergency/sos', '#/emergency/plan', '#/settings', '#/about'];
for (const t of OG_TREES()) routes.push('#/emergency/tree/' + t);
function OG_TREES() { return ['medical', 'water', 'food', 'shelter', 'fire', 'weather', 'equipment', 'power', 'lost', 'wildlife', 'evac']; }
for (const r of routes) await go(r);
// every article renders
const ids = await page.evaluate(() => OG.ARTICLES.map(a => a.id));
for (const id of ids) await go('#/article/' + id);
// every catalog item
const cids = await page.evaluate(() => OG.CATALOG.map(a => a.id));
for (const id of cids) await go('#/catalog/' + id);
// Interactions
await go('#/dashboard'); await shot('01-dashboard');
const dash = await page.$eval('#main', e => e.innerText);
if (!/Day 1 of 180/.test(dash)) errors.push('dashboard day line missing');
await page.click('[data-task="t-water"]'); await page.waitForTimeout(150);
const checked = await page.evaluate(() => OG.db.get('checks')[OG.todayISO()]['t-water']);
if (!checked) errors.push('checklist did not persist');
await go('#/article/water-boil'); await shot('02-article');
// answer quiz correctly
const q = await page.evaluate(() => OG.articleById('water-boil').quiz.map(x => x[2]));
for (let i = 0; i < q.length; i++) await page.click(`.quiz-opt[data-qi="${i}"][data-oi="${q[i]}"]`);
if (!(await page.evaluate(() => OG.progress()['water-boil'].quiz))) errors.push('quiz pass not saved');
// decision tree walk
await go('#/emergency/tree/medical'); await page.click('[data-to="b"]'); await page.click('[data-to="bleed"]'); await page.waitForTimeout(100);
const tree = await page.$eval('#tree', e => e.innerText); if (!/Stop the bleeding/.test(tree)) errors.push('tree end not reached');
await shot('03-tree');
// waypoint via GPS
await go('#/maps/position'); await page.waitForTimeout(800); const pos = await page.$eval('#pos', e => e.innerText); if (!/45\.5946/.test(pos)) errors.push('GPS position not shown: ' + pos.slice(0, 80));
await page.click('#save'); await page.waitForTimeout(200); await page.fill('#wf input[name=name]', 'Camp'); await page.click('#wf button'); await page.waitForTimeout(200);
if ((await page.evaluate(() => OG.db.all('waypoints').length)) !== 1) errors.push('waypoint not saved');
await shot('04-waypoints');
// calculators produce output
await go('#/calc/water'); const w = await page.$eval('#out', e => e.innerText); if (!/Bleach/.test(w)) errors.push('water calc empty');
await go('#/calc/solar'); await shot('05-solar');
// weather log + trend
await page.evaluate(() => { const t = Date.now(); OG.db.put('weather', { t: t - 3 * 3600e3, date: OG.todayISO(), pressure: 1015 }); OG.db.put('weather', { t, date: OG.todayISO(), pressure: 1010 }); });
await go('#/maps/weather'); if (!/Falling fast/.test(await page.$eval('#main', e => e.innerText))) errors.push('pressure trend missing');
// settings themes
for (const th of ['night', 'contrast', 'light', 'dark']) { await go('#/settings'); await page.selectOption('select[name=theme]', th); await page.waitForTimeout(60); if (th === 'night') { await go('#/dashboard'); await shot('06-night'); } }
// backup round trip
const backup = await page.evaluate(() => JSON.stringify(OG.db.exportAll()));
await page.evaluate(async () => { await OG.db.wipe(); });
await page.evaluate(b => { OG.db.importAll(JSON.parse(b)); return OG.db.flush(); }, backup);
const n = await page.evaluate(() => OG.db.all('items').length); if (n !== 10) errors.push('backup restore items=' + n);
// persistence after reload (IndexedDB)
await page.reload(); await page.waitForTimeout(500);
const n2 = await page.evaluate(() => OG.db.all('items').length); if (n2 !== 10) errors.push('items after reload=' + n2);
// offline: SW should serve the app
await page.waitForTimeout(1000);
const swOk = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!(r && r.active); });
if (!swOk) errors.push('service worker not active');
await ctx.setOffline(true); await page.reload(); await page.waitForTimeout(500);
const off = await page.$eval('#main', e => e.innerText).catch(() => '');
if (!off || /Loading…/.test(off) || !(await page.evaluate(() => !!(window.OG && OG.ARTICLES.length)))) errors.push('offline reload failed: ' + off.slice(0, 120));
await go('#/article/fire-co'); await shot('07-offline-article');
await browser.close(); srv.close();
console.log('routes:', routes.length, 'articles:', ids.length, 'catalog:', cids.length);
if (errors.length) { console.log('FAILURES:\n' + [...new Set(errors)].join('\n')); process.exit(1); }
console.log('SMOKE OK');
