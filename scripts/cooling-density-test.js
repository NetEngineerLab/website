'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const engine = require(path.join(root, 'website/tools/data-center-cooling-load-calculator/js/engine.js'));
const base = { itKW: 120, upsLossKW: 6, pduLossKW: 3, lightingKW: 2, people: 4, wPerPerson: 120, envelopeKW: 5, otherKW: 2, headroomPct: 15, unitSensibleKW: 50, redundancyUnits: 1, deltaTC: 10 };
const local = engine.calculate({ ...base, altitudeM: 1000, dryBulbC: 24 });
if (!local.ok || local.recommendedUnits !== 5 || Math.abs(local.pressureKPa - 89.875) > 0.002) {
  console.error('cooling density example failed', local);
  process.exit(1);
}
const pages = {
  'website/tools/data-center-cooling-load-calculator/index.html': ['Dry-air density', 'Local airflow', 'standard-energyplus-conditions.html'],
  'website/tools/data-center-cooling-load-calculator/zh/index.html': ['干空气密度', '当地风量', 'standard-energyplus-conditions.html'],
  'website/tools/data-center-cooling-load-calculator/es/index.html': ['Densidad del aire seco', 'Caudal local', 'standard-energyplus-conditions.html']
};
const app = fs.readFileSync(path.join(root, 'website/tools/data-center-cooling-load-calculator/js/app.js'), 'utf8');
for (const label of ['Altitud', '海拔', 'Altitude', 'Temperatura seca de la sala', '机房干球温度', 'Room dry-bulb']) {
  if (!app.includes(label)) { console.error('app.js missing ' + label); process.exit(1); }
}
for (const [file, labels] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const label of labels) {
    if (!html.includes(label)) { console.error(file + ' missing ' + label); process.exit(1); }
  }
}
console.log('PASS cooling density', local.pressureKPa.toFixed(3), local.densityKgM3.toFixed(4), local.localAirflowM3h.toFixed(1));
