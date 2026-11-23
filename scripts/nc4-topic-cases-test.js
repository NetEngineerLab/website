'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const Switch = require(path.join(root, 'website/tools/switch-uplink-oversubscription-calculator/js/engine.js'));
const Cool = require(path.join(root, 'website/tools/data-center-cooling-load-calculator/js/engine.js'));
const Fiber = require(path.join(root, 'website/tools/fiber-loss/js/engine.js'));
let failed = 0;
const check = (name, ok, detail) => { if (!ok) { failed++; console.error('FAIL', name, detail || ''); } else console.log('PASS', name); };
const near = (a, b) => Math.abs(a - b) < 0.02;
const s1 = Switch.calculate({ ports: 24, portMbps: 1000, util: 30, concurrency: 100, overhead: 0, uplinkMbps: 10000, uplinks: 1, target: 80 });
const s1b = Switch.calculate({ ports: 24, portMbps: 1000, util: 30, concurrency: 100, overhead: 0, uplinkMbps: 1000, uplinks: 1, target: 80 });
check('24-port 10G vs 1G', s1.oversubscription === '2.4:1' && s1.demandGbps === 7.2 && s1.status === 'pass' && s1b.oversubscription === '24:1' && s1b.spareGbps === -6.4 && s1b.status === 'fail');
const s2 = Switch.calculate({ ports: 24, portMbps: 2500, util: 20, concurrency: 100, overhead: 0, uplinkMbps: 10000, uplinks: 1, target: 80 });
check('24x2.5G', s2.oversubscription === '6:1' && s2.demandGbps === 12 && s2.spareGbps === -4 && s2.status === 'fail');
const s3 = Switch.calculate({ ports: 48, portMbps: 1000, util: 40, concurrency: 100, overhead: 0, uplinkMbps: 10000, uplinks: 2, target: 80 });
const s3b = Switch.calculate({ ports: 48, portMbps: 1000, util: 40, concurrency: 100, overhead: 0, uplinkMbps: 10000, uplinks: 3, target: 80 });
check('40 percent count', s3.demandGbps === 19.2 && s3.status === 'warning' && s3.requiredUplinks === 3 && s3b.oversubscription === '1.6:1' && s3b.spareGbps === 4.8 && s3b.status === 'pass');
const s4 = Switch.calculate({ ports: 48, portMbps: 1000, util: 25, concurrency: 100, overhead: 0, uplinkMbps: 10000, uplinks: 2, target: 80, engineering: true, growthPct: 20, failedUplinks: 1 });
check('growth N-1', s4.scenarios.conservative.demandGbps === 14.4 && s4.scenarios.conservative.status === 'pass' && s4.scenarios.nMinus1.spareGbps === -6.4 && s4.scenarios.nMinus1.status === 'fail');
const closet = Cool.calculate({ itKW: 5, upsLossKW: 0.4, pduLossKW: 0.2, lightingKW: 0.2, people: 1, envelopeKW: 0.3, otherKW: 0.1, headroomPct: 15, unitSensibleKW: 8, redundancyUnits: 1, installedUnits: 2, deltaTC: 10 });
const one = Cool.calculate({ itKW: 5, upsLossKW: 0.4, pduLossKW: 0.2, lightingKW: 0.2, people: 1, envelopeKW: 0.3, otherKW: 0.1, headroomPct: 15, unitSensibleKW: 8, redundancyUnits: 1, installedUnits: 1, deltaTC: 10 });
check('closet', near(closet.designKW, 7.268) && near(closet.tons, 2.07) && closet.survives1 === true && one.survives1 === false && one.normalCapacityKW === 8);
const air10 = Cool.calculate({ itKW: 18, upsLossKW: 1.44, pduLossKW: 0, lightingKW: 0.48, people: 2, envelopeKW: 0, otherKW: 1.5, headroomPct: 15, unitSensibleKW: 15, redundancyUnits: 1, installedUnits: 2, deltaTC: 10 });
const air6 = Cool.calculate({ itKW: 18, upsLossKW: 1.44, pduLossKW: 0, lightingKW: 0.48, people: 2, envelopeKW: 0, otherKW: 1.5, headroomPct: 15, unitSensibleKW: 15, redundancyUnits: 1, installedUnits: 2, deltaTC: 6 });
check('airflow', near(air10.designKW, 24.909) && Math.round(air10.airflowM3h) === 7428 && Math.round(air6.airflowM3h) === 12380 && air10.survives1 === false);
const extra0 = Cool.calculate({ itKW: 8, upsLossKW: 0.6, pduLossKW: 0.3, lightingKW: 0.4, people: 2, envelopeKW: 0.5, otherKW: 0.2, headroomPct: 15, unitSensibleKW: 8, redundancyUnits: 1, installedUnits: 2, deltaTC: 10 });
const extra3 = Cool.calculate({ itKW: 8, upsLossKW: 0.6, pduLossKW: 0.3, lightingKW: 0.4, people: 2, envelopeKW: 0.5, otherKW: 0.2, headroomPct: 15, unitSensibleKW: 8, redundancyUnits: 1, installedUnits: 2, deltaTC: 10, latentLoadKW: 3 });
check('extra heat', near(extra0.designKW, 11.776) && near(extra3.designKW, 15.226) && Math.abs(extra0.utilPct - 73.6) < 0.05 && Math.abs(extra3.utilPct - 95.2) < 0.05);
const dc = Fiber.calculate({ distance: 0.15, attenuation: 0.35, spliceCount: 2, spliceLoss: 0.1, connectorCount: 4, connectorLoss: 0.75, splitter1: 0, splitter2: 0, otherLoss: 0, engineeringMargin: 1.5, availableBudget: 6, txPower: -1, rxThreshold: -7 });
check('dc fiber', near(dc.designLoss, 4.75) && near(dc.budgetRemaining, 1.25) && dc.status === 'warning');
const om4 = Fiber.calculate({ distance: 0.3, attenuation: 3, spliceCount: 0, spliceLoss: 0.1, connectorCount: 2, connectorLoss: 0.5, splitter1: 0, splitter2: 0, otherLoss: 0, engineeringMargin: 3, availableBudget: 8, txPower: -1, rxThreshold: -9 });
const om4b = Fiber.calculate({ distance: 0.3, attenuation: 3, spliceCount: 0, spliceLoss: 0.1, connectorCount: 4, connectorLoss: 0.75, splitter1: 0, splitter2: 0, otherLoss: 0, engineeringMargin: 3, availableBudget: 8, txPower: -1, rxThreshold: -9 });
check('om4', near(om4.designLoss, 4.9) && om4.status === 'healthy' && near(om4b.designLoss, 6.9) && near(om4b.budgetRemaining, 1.1) && om4b.status === 'warning');
const campus = Fiber.calculate({ distance: 2, attenuation: 0.35, spliceCount: 2, spliceLoss: 0.1, connectorCount: 6, connectorLoss: 0.75, splitter1: 0, splitter2: 0, otherLoss: 0, engineeringMargin: 3, availableBudget: 14, txPower: 0, rxThreshold: -14 });
const campusFail = Fiber.calculate({ distance: 2, attenuation: 0.35, spliceCount: 2, spliceLoss: 0.1, connectorCount: 6, connectorLoss: 0.75, splitter1: 0, splitter2: 0, otherLoss: 0, engineeringMargin: 3, availableBudget: 8, txPower: -3, rxThreshold: -11 });
check('campus', near(campus.designLoss, 8.4) && near(campus.budgetRemaining, 5.6) && campus.status === 'healthy' && near(campusFail.budgetRemaining, -0.4) && campusFail.status === 'failed');
const slugs = [
  '24-port-switch-single-10g-uplink',
  '24-port-2-5g-single-10g-uplink',
  '48-port-switch-40-percent-uplink-count',
  'switch-uplink-20-percent-growth-n-1',
  '5kw-server-closet-cooling-n-plus-one',
  'server-room-airflow-from-delta-t',
  'server-room-extra-sensible-heat-unit-count',
  'data-center-fiber-6db-connector-budget',
  'om4-300m-multimode-link-budget',
  'campus-fiber-six-connector-pairs'
];
const markers = {
  '24-port-switch-single-10g-uplink': ['2.4:1', '24:1', '7.2', '-6.4'],
  '24-port-2-5g-single-10g-uplink': ['6:1', '12 Gbps', '-4'],
  '48-port-switch-40-percent-uplink-count': ['19.2', '1.6:1', '4.8'],
  'switch-uplink-20-percent-growth-n-1': ['14.4', '-6.4', '2.9:1'],
  '5kw-server-closet-cooling-n-plus-one': ['7.268', '2.07'],
  'server-room-airflow-from-delta-t': ['24.909', '7428', '12380'],
  'server-room-extra-sensible-heat-unit-count': ['11.776', '15.226', '95.2'],
  'data-center-fiber-6db-connector-budget': ['4.75', '1.25'],
  'om4-300m-multimode-link-budget': ['4.90', '6.90', '1.10'],
  'campus-fiber-six-connector-pairs': ['8.4', '5.60', '-0.4']
};
const registry = JSON.parse(read('website/data/sitemap-routes.json'));
const titles = new Set();
for (const slug of slugs) {
  for (const locale of ['', 'zh/']) {
    const file = `website/${locale}guides/${slug}/index.html`;
    const html = read(file);
    const title = (html.match(/<title>([^<]+)/) || [])[1];
    const h1s = html.match(/<h1>/g) || [];
    check(file + ' unique title', title && !titles.has(title));
    titles.add(title);
    check(file + ' one h1', h1s.length === 1);
    check(file + ' example label', locale ? html.includes('示例') : html.includes('Example'));
    for (const marker of markers[slug]) check(file + ' ' + marker, html.includes(marker));
    const topic = slug.includes('fiber') || slug.includes('om4') || slug.includes('campus') ? 'pon-optical' : slug.includes('server') || slug.includes('5kw') ? 'data-center-cooling-capacity' : 'switch-oversubscription';
    check(file + ' topic return', html.includes(`/topics/${topic}/`) || html.includes(`topics/${topic}/`));
  }
  const record = registry.routes.find(route => route.route === `guides/${slug}/`);
  check('registry ' + slug, record && record.indexable === true && record.translations.en.title && record.translations.zh.title && record.longTailQuestions.en.length === 1);
}
for (const hub of [
  'website/topics/switch-oversubscription/index.html',
  'website/zh/topics/switch-oversubscription/index.html',
  'website/topics/data-center-cooling-capacity/index.html',
  'website/zh/topics/data-center-cooling-capacity/index.html',
  'website/topics/pon-optical/index.html',
  'website/zh/topics/pon-optical/index.html'
]) check(hub + ' cases', read(hub).includes('id="worked-cases"'));
if (failed) { console.error(failed + ' failed'); process.exit(1); }
console.log('PASS nc4 cases');
