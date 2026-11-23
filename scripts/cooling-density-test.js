'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const engine = require(path.join(root, 'website/tools/data-center-cooling-load-calculator/js/engine.js'));
function dryAir(z, t) {
  const pressurePa = 101325 * Math.pow(1 - 2.25577e-5 * z, 5.2559);
  const densityKgM3 = pressurePa / (287.058 * (t + 273.15));
  return { pressureKPa: pressurePa / 1000, densityKgM3, ratio: densityKgM3 / (101325 / (287.058 * 293.15)) };
}
const base = { itKW: 120, upsLossKW: 6, pduLossKW: 3, lightingKW: 2, people: 4, wPerPerson: 120, envelopeKW: 5, otherKW: 2, headroomPct: 15, unitSensibleKW: 50, redundancyUnits: 1, deltaTC: 10 };
const plain = engine.calculate(base);
const air = dryAir(1000, 24);
const local = plain.airflowM3h * (1.2 / air.densityKgM3);
if (plain.recommendedUnits !== 5 || Math.abs(air.pressureKPa - 89.875) > 0.002 || Math.abs(air.densityKgM3 - 1.0536) > 0.001 || Math.abs(local - 54087.7) > 1) {
  console.error('cooling density example failed', plain.recommendedUnits, air, local);
  process.exit(1);
}
if (Math.abs(dryAir(0, 20).ratio - 1) > 1e-12) { console.error('standard-air ratio is not 1'); process.exit(1); }
const app = fs.readFileSync(path.join(root, 'website/tools/data-center-cooling-load-calculator/js/app.js'), 'utf8');
for (const token of ['2.25577e-5', '5.2559', '287.058', '1.2/dryAir.densityKgM3']) {
  if (!app.includes(token)) { console.error('app.js missing ' + token); process.exit(1); }
}
const engineText = fs.readFileSync(path.join(root, 'website/tools/data-center-cooling-load-calculator/js/engine.js'), 'utf8');
if (engineText.includes('altitudeM') || engineText.includes('2.25577e-5')) { console.error('density math must stay out of the frozen engine'); process.exit(1); }
const pages = {
  'website/tools/data-center-cooling-load-calculator/index.html': ['Dry-air density', 'Local airflow', 'standard-energyplus-conditions.html'],
  'website/tools/data-center-cooling-load-calculator/zh/index.html': ['干空气密度', '当地风量', 'standard-energyplus-conditions.html'],
  'website/tools/data-center-cooling-load-calculator/es/index.html': ['Densidad del aire seco', 'Caudal local', 'standard-energyplus-conditions.html']
};
for (const label of ['Altitud', '海拔', 'Altitude']) {
  if (!app.includes(label)) { console.error('app.js missing ' + label); process.exit(1); }
}
for (const [file, labels] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const label of labels) if (!html.includes(label)) { console.error(file + ' missing ' + label); process.exit(1); }
}
console.log('PASS cooling density', air.pressureKPa.toFixed(3), air.densityKgM3.toFixed(4), local.toFixed(1));
