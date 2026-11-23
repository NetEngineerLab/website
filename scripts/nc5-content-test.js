'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const Battery = require(path.join(root, 'website/tools/48v-battery-runtime/js/engine.js'));
const Feeder = require(path.join(root, 'website/tools/dc-feeder-voltage-drop-calculator/js/engine.js'));
const Ups = require(path.join(root, 'website/tools/ups-capacity-battery-runtime-calculator/js/engine.js'));
const Rack = require(path.join(root, 'website/tools/network-rack-power-cooling-calculator/js/engine.js'));
const Pue = require(path.join(root, 'website/tools/pue-data-center-energy-efficiency/js/engine.js'));
const Poe = require(path.join(root, 'website/tools/poe-power-budget-calculator/js/engine.js'));
const Drop = require(path.join(root, 'website/tools/poe-voltage-drop-calculator/js/engine.js'));
const Onu = require(path.join(root, 'website/tools/onu-rx-power/js/engine.js'));
let failed = 0;
const check = (name, ok, detail) => { if (!ok) { failed++; console.error('FAIL', name, detail || ''); } else console.log('PASS', name); };
const near = (a, b) => Math.abs(a - b) < 0.02;

const battery = Battery.calculate({ nominalCellV: 2, startCellV: 2.1, cutoffCellV: 1.75, seriesCells: 24, parallelStrings: 1, capacityAh: 100, ratedHours: 10, peukertExponent: 1.15, pathEfficiencyPct: 95, dodPct: 80, agePct: 100, tempPct: 100, curvePct: 100, baseLoadW: 600, loadMarginPct: 0, targetRuntimeH: 4, model: 'peukert', chemistry: 'lead-acid' });
check('battery', battery.ok && battery.runtimeH === 5.584 && battery.simpleRuntimeH === 5.852 && battery.currentAverageA === 13.67 && battery.requiredAhPerString === 74.82);
const small = Feeder.calculate({ voltage: 53.5, current: 80, length: {value: 60, unit: 'm'}, area: {value: 16, unit: 'mm2'}, temperature: 45, alpha: 0.00393, conductors: 2, rho20: 1/58 });
const large = Feeder.calculate({ voltage: 53.5, current: 80, length: {value: 60, unit: 'm'}, area: {value: 25, unit: 'mm2'}, temperature: 45, alpha: 0.00393, conductors: 2, rho20: 1/58 });
check('feeder', small.display.endVoltage === '42.1388' && large.display.endVoltage === '46.2288');
const two = Ups.calculate({ loadKW: 30, loadPowerFactor: 0.9, headroomPct: 0, upsEfficiencyPct: 94, upsOutputPF: 0.9, moduleKVA: 20, redundancyModules: 1, installedModules: 2, batteryBusV: 384, ahPerString: 40, strings: 1, dodPct: 80, batteryEfficiencyPct: 92, agingFactorPct: 100, temperatureFactorPct: 100, targetRuntimeMin: 15, rechargeHours: 8, phase: '3p', outputVoltage: 400 }).scenarios.baseline;
const three = Ups.calculate({ loadKW: 30, loadPowerFactor: 0.9, headroomPct: 0, upsEfficiencyPct: 94, upsOutputPF: 0.9, moduleKVA: 20, redundancyModules: 1, installedModules: 3, batteryBusV: 384, ahPerString: 40, strings: 1, dodPct: 80, batteryEfficiencyPct: 92, agingFactorPct: 100, temperatureFactorPct: 100, targetRuntimeMin: 15, rechargeHours: 8, phase: '3p', outputVoltage: 400 }).scenarios.baseline;
check('ups', near(two.loadKVA, 33.33) && two.survives1 === false && three.survives1 === true && near(two.runtimeMin, 21.25) && two.runtimeMin === three.runtimeMin);
const rack = Rack.calculate({ loadW: 500, qty: 10, util: 80, growth: 0, redundancy: 0, pf: 0.95, voltage: 230, phases: 1, breaker: 16, hours: 0, days: 0, rate: 0, cop: 3, upsEfficiency: 0.95, pduEfficiency: 0.98, latentPct: 0, coolingRedundancy: 0, feedCount: 1, dualPath: false, n1Units: 1, rackU: 42, usedU: 20, ambientC: 24 });
check('rack', rack.status === 'fail' && rack.current === 18.31 && rack.loadPct === 114.4 && rack.coolingW === 1432.15 && rack.tons === 1.222);
const pue = Pue.calculate({ mode: 'energy', total: 120000, it: 80000, periodDays: 30, targetPUE: 1.4, cooling: 25000, ups: 8000, lighting: 2000, distribution: 3000, other: 2000 });
check('pue', pue.pue === 1.5 && pue.nonIT === 40000 && pue.status === 'caution' && near(pue.fixedOverheadPUE, 1.417));
const cameras16 = Poe.calculate({ switchBudget: 370, switchPorts: 24, deviceCount: 16, deviceWatts: 12, cableLossPercent: 15, headroomPercent: 20, standard: 'at' });
const cameras24 = Poe.calculate({ switchBudget: 370, switchPorts: 24, deviceCount: 24, deviceWatts: 12, cableLossPercent: 15, headroomPercent: 20, standard: 'at' });
check('poe budget', cameras16.status === 'pass' && near(cameras16.requiredBudget, 271.06) && cameras24.budgetPass === false && cameras16.maxDevices === 21);
const thin = Drop.calculate({ lengthM: 90, sourceV: 48, loadW: 25.5, awg: 26, pairs: 2, tempC: 45, contactOhm: 0.3, efficiency: 90, minV: 42.5, standard: '802.3at' });
const thick = Drop.calculate({ lengthM: 90, sourceV: 48, loadW: 25.5, awg: 23, pairs: 2, tempC: 45, contactOhm: 0.3, efficiency: 90, minV: 42.5, standard: '802.3at' });
check('poe drop', thin.status === 'fail' && thin.remoteV === 37.87 && thick.status === 'pass' && thick.remoteV === 43.51);
const onu = Onu.calculate({ mode: 'measured', measured: -26, sens: -27, over: -8, warning: 3, noSignal: -40 });
check('onu', onu.status === 'warning' && onu.sensitivityMargin === 1 && onu.overloadMargin === 18);

const cases = {
  '48v-string-four-hour-runtime': ['5.584', '5.852', '13.67', '74.82', 'telecom-power-energy', '48v-battery-runtime'],
  'dc-feeder-46v-floor': ['42.1388', '46.2288', '11.361207', '7.271172', 'telecom-power-energy', 'dc-feeder-voltage-drop-calculator'],
  'ups-battery-minutes-versus-n-plus-one': ['33.33', '21.25', '15.36', '28.23', 'data-center-capacity', 'ups-capacity-battery-runtime-calculator'],
  'rack-breaker-before-cooling': ['18.31', '114.4', '4296.46', '1432.15', 'data-center-capacity', 'network-rack-power-cooling-calculator'],
  'monthly-energy-pue-not-redundancy': ['1.50', '40000', '66.67', '1.417', 'data-center-capacity', 'pue-data-center-energy-efficiency'],
  'poe-switch-budget-16-versus-24-cameras': ['271.06', '73.26', '406.59', '98.94', 'ip-camera-network-bandwidth-poe', 'poe-power-budget-calculator'],
  'poe-voltage-after-90m': ['37.87', '43.51', '10.13', '4.49', 'ip-camera-network-bandwidth-poe', 'poe-voltage-drop-calculator'],
  'onu-receive-level-warning-margin': ['-26', '1 dB', '18 dB', 'pon-optical', 'onu-rx-power']
};
const registry = JSON.parse(read('website/data/sitemap-routes.json'));
const titles = new Set();
for (const [slug, markers] of Object.entries(cases)) {
  const topic = markers.at(-2);
  const tool = markers.at(-1);
  for (const locale of ['', 'zh/', 'es/']) {
    const file = `website/${locale}guides/${slug}/index.html`;
    const html = read(file);
    const title = (html.match(/<title>([^<]+)/) || [])[1];
    check(file + ' unique title', title && !titles.has(title));
    titles.add(title);
    check(file + ' one h1', (html.match(/<h1>/g) || []).length === 1);
    const exampleLabel = locale === 'zh/' ? '示例' : locale === 'es/' ? 'Ejemplo' : 'Example';
    check(file + ' example', html.includes(exampleLabel));
    check(file + ' shell', html.includes('class="guide-shell"') && !html.includes('guide-content') && !html.includes('guide-primary-cta'));
    check(file + ' topic', html.includes(`topics/${topic}/`));
    check(file + ' tool', locale === 'es/' ? html.includes(`tools/${tool}/es/`) : html.includes(`/tools/${tool}/`));
    check(file + ' canonical', html.includes(`rel="canonical" href="https://netengineerlab.com/${locale}guides/${slug}/"`));
    check(file + ' hreflang es', html.includes('hreflang="es" href="https://netengineerlab.com/es/guides/' + slug + '/"'));
    for (const marker of markers.slice(0, 4)) check(file + ' ' + marker, html.includes(marker));
    const aside = (html.match(/<aside class="guide-toc guide-related-side"[\s\S]*?<\/aside>/) || [])[0] || '';
    check(file + ' sidebar', aside.includes('guide-related-side'));
    const links = [...aside.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)];
    check(file + ' sidebar count', links.length >= 2 && links.length <= 5, String(links.length));
    check(file + ' sidebar not self', !aside.includes(slug));
    if (locale === 'es/') check(file + ' sidebar stays in Spanish', !aside.includes('/zh/') && !aside.includes('/guides/') );
    for (const [, href, text] of links) {
      const target = path.resolve(path.dirname(path.join(root, file)), href, 'index.html');
      const targetHtml = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
      const h1 = ((targetHtml.match(/<h1[^>]*>([^<]+)/) || [])[1] || '').replace(/&amp;/g, '&');
      check(file + ' link ' + href, h1 && text.replace(/&amp;/g, '&') === h1, text + ' vs ' + h1);
    }
  }
  const record = registry.routes.find(route => route.route === `guides/${slug}/`);
  check('registry ' + slug, Boolean(record && record.indexable === true && record.translations.en.title && record.translations.zh.title && record.translations.es.title && record.longTailQuestions.en.length === 1 && record.longTailQuestions.es.length === 1));
}
for (const file of [
  'website/guides/index.html',
  'website/zh/guides/index.html',
  'website/es/guides/index.html',
  'website/topics/telecom-power-energy/index.html',
  'website/zh/topics/telecom-power-energy/index.html',
  'website/es/topics/telecom-power-energy/index.html',
  'website/topics/data-center-capacity/index.html',
  'website/zh/topics/data-center-capacity/index.html',
  'website/es/topics/data-center-capacity/index.html',
  'website/topics/ip-camera-network-bandwidth-poe/index.html',
  'website/zh/topics/ip-camera-network-bandwidth-poe/index.html',
  'website/es/topics/ip-camera-network-bandwidth-poe/index.html',
  'website/topics/pon-optical/index.html',
  'website/zh/topics/pon-optical/index.html',
  'website/es/topics/pon-optical/index.html'
]) {
  const html = read(file);
  check(file + ' links a new guide', Object.keys(cases).some(slug => html.includes(slug)));
}
const builder = read('scripts/build-multilingual.js');
check('builder does not stamp guide-primary-cta', !builder.includes('guide-primary-cta'));
for (const file of ['website/guides/generator-fuel-runtime-planning/index.html', 'website/zh/guides/generator-fuel-runtime-planning/index.html']) {
  const html = read(file);
  check(file + ' stays a plain article', html.includes('class="guide-article"') && !html.includes('guide-primary-cta') && !html.includes('class="guide-cta"'));
}
if (failed) { console.error(failed + ' failed'); process.exit(1); }
console.log('PASS nc5 content');
