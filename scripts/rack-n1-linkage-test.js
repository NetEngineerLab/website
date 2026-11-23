'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const engine = require(path.join(root, 'website/tools/network-rack-power-cooling-calculator/js/engine.js'));
const base = { loadW: 500, qty: 10, util: 80, growth: 0, redundancy: 0, pf: 0.95, voltage: 230, phases: 1, breaker: 16, hours: 24, days: 30, rate: 0.15, cop: 3, rackU: 42, usedU: 20, coolingRedundancy: 25, n1Units: 2 };
const plain = engine.calculate({ ...base, usedU: 42, coolingRedundancy: 0, n1Units: 1 });
const linked = engine.calculate(base);
if (!plain.ok || !linked.ok) { console.error('engine rejected the rack example'); process.exit(1); }
if (plain.designW !== linked.designW || plain.coolingW !== linked.coolingW) { console.error('N+1 inputs changed the base power or cooling result'); process.exit(1); }
if (linked.density !== Number((linked.designW / 20).toFixed(2))) { console.error('density is not design power per used U', linked.density); process.exit(1); }
if (linked.n1CoolingW !== Number((linked.coolingW * 1.25).toFixed(2))) { console.error('N+1 cooling is not the extra percent on the same cooling input', linked.n1CoolingW, linked.coolingW); process.exit(1); }
if (linked.risk.includes('no-n+1')) { console.error('two counted units should clear the N+1 flag'); process.exit(1); }
if (!plain.risk.includes('no-n+1')) { console.error('one counted unit should keep the existing N+1 flag'); process.exit(1); }
const app = fs.readFileSync(path.join(root, 'website/tools/network-rack-power-cooling-calculator/js/app.js'), 'utf8');
for (const id of ['heatW', 'density', 'n1CoolingW']) {
  if (!app.includes(id)) { console.error('app.js does not render ' + id); process.exit(1); }
}
const pages = {
  'website/tools/network-rack-power-cooling-calculator/index.html': ['Rack height', 'Used rack units', 'Extra cooling capacity', 'Cooling units counted', 'Room heat', 'Rack density', 'N+1 cooling input'],
  'website/tools/network-rack-power-cooling-calculator/zh/index.html': ['机柜高度', '已用U位', '额外制冷比例', '计入的制冷台数', '机房热负荷', '机柜功率密度', 'N+1制冷输入'],
  'website/tools/network-rack-power-cooling-calculator/es/index.html': ['Altura del rack', 'U ocupadas', 'Capacidad extra de refrigeración', 'Unidades de refrigeración contadas', 'Calor de sala', 'Densidad del rack', 'Entrada de refrigeración N+1']
};
for (const [file, labels] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const label of labels) {
    if (!html.includes(label)) { console.error(file + ' missing ' + label); process.exit(1); }
  }
  for (const id of ['rackU', 'usedU', 'coolingRedundancy', 'n1Units', 'heatW', 'density', 'n1CoolingW']) {
    if (!html.includes('id="' + id + '"')) { console.error(file + ' missing #' + id); process.exit(1); }
  }
}
console.log('PASS rack N+1 linkage', linked.designW, linked.heatW, linked.density, linked.n1CoolingW);
