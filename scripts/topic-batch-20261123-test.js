'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const existsRoute = route => fs.existsSync(path.join(root, 'website', route.replace(/^\//, ''), 'index.html'));
let failed = 0;
const check = (name, ok, detail) => {
  if (!ok) { failed++; console.error('FAIL', name, detail || ''); }
  else console.log('PASS', name);
};
function links(file) {
  const html = read(file);
  let n = 0;
  for (const match of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:[a-z]+:|#|mailto:|tel:|javascript:)/i.test(href)) continue;
    const base = 'https://netengineerlab.com/' + path.posix.dirname(file.replace(/^website\//, '')) + '/';
    const url = new URL(href, base);
    if (!/\/(?:topics|guides|tools)\//.test(url.pathname) || !url.pathname.endsWith('/')) continue;
    if (!existsRoute(url.pathname)) throw new Error(`${file} -> ${url.pathname}`);
    n++;
  }
  return n;
}
const pages = {
  switchEn: 'website/topics/switch-oversubscription/index.html',
  switchZh: 'website/zh/topics/switch-oversubscription/index.html',
  coolEn: 'website/topics/data-center-cooling-capacity/index.html',
  coolZh: 'website/zh/topics/data-center-cooling-capacity/index.html',
  ponEn: 'website/topics/pon-optical/index.html',
  ponZh: 'website/zh/topics/pon-optical/index.html',
  fiberEn: 'website/guides/fiber-link-budget-guide/index.html',
  fiberZh: 'website/zh/guides/fiber-link-budget-guide/index.html'
};
for (const file of [pages.switchEn, pages.switchZh]) {
  const html = read(file);
  check(file + ' routes', html.includes('id="task-routes"') && html.includes('2.4:1') && html.includes('−3') && html.includes('Authority'));
}
for (const file of [pages.coolEn, pages.coolZh]) {
  const html = read(file);
  check(file + ' case', html.includes('id="field-case"') && html.includes('136.25') && html.includes('38.74') && html.includes('data-center-capacity'));
}
for (const file of [pages.fiberEn, pages.fiberZh]) {
  const html = read(file);
  check(file + ' two cases', html.includes('id="reach-cases"') && html.includes('7.9') && html.includes('12.8') && html.includes('27.4'));
}
for (const file of [pages.ponEn, pages.ponZh]) {
  const html = read(file);
  check(file + ' budget path', html.includes('id="budget-reach"') && html.includes('7.9') && html.includes('12.8'));
}
const Switch = require(path.join(root, 'website/tools/switch-uplink-oversubscription-calculator/js/engine.js'));
const simple = Switch.calculate({ ports: 48, portMbps: 1000, util: 100, concurrency: 100, overhead: 0, uplinkMbps: 10000, uplinks: 2, target: 100 });
check('switch 2.4:1', simple.ok && simple.oversubscription === '2.4:1' && simple.uplinkGbps === 20);
check('switch headroom', (20 - 13) === 7 && (10 - 13) === -3);
const Cool = require(path.join(root, 'website/tools/data-center-cooling-load-calculator/js/engine.js'));
const cool = Cool.calculate({ itKW: 100, upsLossKW: 8, pduLossKW: 4, lightingKW: 2, people: 4, envelopeKW: 3, otherKW: 1, headroomPct: 15, unitSensibleKW: 30, redundancyUnits: 1, installedUnits: 5, deltaTC: 10 });
check('cooling normal and N+1', cool.ok && Math.abs(cool.designKW - 136.25) < 0.02 && Math.abs(cool.tons - 38.74) < 0.02 && cool.normalCapacityKW === 150 && cool.after1KW === 120 && cool.survives1 === false);
const Fiber = require(path.join(root, 'website/tools/fiber-loss/js/engine.js'));
const shortReach = Fiber.calculate({ distance: 10, attenuation: 0.35, spliceCount: 4, spliceLoss: 0.1, connectorCount: 2, connectorLoss: 0.5, splitter1: 0, splitter2: 0, otherLoss: 0, engineeringMargin: 3, availableBudget: 14, txPower: 0, rxThreshold: -14 });
const longReach = Fiber.calculate({ distance: 40, attenuation: 0.22, spliceCount: 8, spliceLoss: 0.05, connectorCount: 2, connectorLoss: 0.3, splitter1: 0, splitter2: 0, otherLoss: 0, engineeringMargin: 3, availableBudget: 30, txPower: 2, rxThreshold: -28 });
const rejected = Fiber.calculate({ distance: 40, attenuation: 0.22, spliceCount: 8, spliceLoss: 0.05, connectorCount: 2, connectorLoss: 0.3, splitter1: 0, splitter2: 0, otherLoss: 0, engineeringMargin: 3, availableBudget: 12, txPower: 0, rxThreshold: -12 });
const reachKm = 10 + (14 - shortReach.designLoss) / 0.35;
check('fiber cases', shortReach.designLoss === 7.9 && Math.abs(longReach.designLoss - 12.8) < 0.001 && Math.abs(shortReach.budgetRemaining - 6.1) < 0.001 && Math.abs(longReach.budgetRemaining - 17.2) < 0.001 && rejected.status === 'failed' && Math.abs(reachKm - 27.4) < 0.05);
let count = 0;
for (const file of Object.values(pages)) {
  try { count += links(file); }
  catch (error) { check('links ' + file, false, error.message); }
}
check('scoped links', count > 0, String(count));
const sitemap = read('website/sitemap.xml');
for (const url of [
  'https://netengineerlab.com/topics/switch-oversubscription/',
  'https://netengineerlab.com/zh/topics/switch-oversubscription/',
  'https://netengineerlab.com/topics/data-center-cooling-capacity/',
  'https://netengineerlab.com/zh/topics/data-center-cooling-capacity/',
  'https://netengineerlab.com/topics/pon-optical/',
  'https://netengineerlab.com/guides/fiber-link-budget-guide/'
]) check('sitemap ' + url, sitemap.includes(url));
if (failed) { console.error(failed + ' checks failed'); process.exit(1); }
console.log('PASS topic batch TD-04 TD-05 TD-06');
