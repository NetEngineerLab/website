'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const engine = require('../website/tools/pon-splitter-loss/js/engine.js');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const planning = [[2, 3.7], [4, 7.2], [8, 10.5], [16, 13.8], [32, 17], [64, 20.5]];

function rowPattern(n, loss) {
  const ideal = (10 * Math.log10(n)).toFixed(3);
  const excess = (loss - 10 * Math.log10(n)).toFixed(3);
  return new RegExp(`1:${n}[^<]{0,80}${ideal}[^<]{0,80}${loss.toFixed(1)}[^<]{0,40}${excess}`);
}

const worked = engine.calculate({
  distance: 10, attenuation: 0.25, spliceCount: 6, spliceLoss: 0.1,
  connectorCount: 4, connectorLoss: 0.3, s1: 17, s2: 0, s3: 0,
  other: 0, penalty: 1, margin: 3, tx: 3, txMax: 7, sens: -30, over: -8, systemReach: 20
});
assert.equal(worked.ok, true);
assert.equal(worked.totalRatio, 32);
assert.ok(Math.abs(worked.physicalLoss - 21.3) < 1e-9);
assert.ok(Math.abs(worked.rx - -18.3) < 1e-9);
assert.ok(Math.abs(worked.idealLoss - 10 * Math.log10(32)) < 1e-9);

const pages = [
  ['website/tools/pon-splitter-loss/index.html', 'en', ['optical-power-budget/', 'onu-rx-power/', 'pon-fiber-calculators/', 'guides/pon-splitter-loss-guide/#nel-split-ratio', 'topics/pon-optical/']],
  ['website/tools/pon-splitter-loss/zh/index.html', 'zh', ['optical-power-budget/zh/', 'onu-rx-power/zh/', 'pon-fiber-calculators/zh/', 'zh/guides/pon-splitter-loss-guide/#nel-split-ratio', 'zh/topics/pon-optical/']],
  ['website/tools/pon-splitter-loss/es/index.html', 'es', ['optical-power-budget/es/', 'onu-rx-power/es/', 'pon-fiber-calculators/es/', 'es/guides/pon-splitter-loss-guide/#nel-split-ratio', 'es/topics/pon-optical/']],
  ['website/tools/optical-power-budget/index.html', 'en', ['pon-splitter-loss/#nel-split-ratio', 'onu-rx-power/', 'guides/pon-splitter-loss-guide/#nel-split-ratio', 'topics/pon-optical/']],
  ['website/tools/optical-power-budget/zh/index.html', 'zh', ['pon-splitter-loss/zh/#nel-split-ratio', 'onu-rx-power/zh/', 'zh/guides/pon-splitter-loss-guide/#nel-split-ratio', 'zh/topics/pon-optical/']],
  ['website/tools/optical-power-budget/es/index.html', 'es', ['pon-splitter-loss/es/#nel-split-ratio', 'onu-rx-power/es/', 'es/guides/pon-splitter-loss-guide/#nel-split-ratio', 'es/topics/pon-optical/']],
  ['website/tools/onu-rx-power/index.html', 'en', ['pon-splitter-loss/#nel-split-ratio', 'optical-power-budget/', 'guides/pon-splitter-loss-guide/#nel-split-ratio', 'topics/pon-optical/']],
  ['website/tools/onu-rx-power/zh/index.html', 'zh', ['pon-splitter-loss/zh/#nel-split-ratio', 'optical-power-budget/zh/', 'zh/guides/pon-splitter-loss-guide/#nel-split-ratio', 'zh/topics/pon-optical/']],
  ['website/tools/onu-rx-power/es/index.html', 'es', ['pon-splitter-loss/es/#nel-split-ratio', 'optical-power-budget/es/', 'es/guides/pon-splitter-loss-guide/#nel-split-ratio', 'es/topics/pon-optical/']],
  ['website/tools/pon-fiber-calculators/index.html', 'en', ['pon-splitter-loss/#nel-split-ratio', 'optical-power-budget/', 'onu-rx-power/', 'guides/pon-splitter-loss-guide/#nel-split-ratio', 'topics/pon-optical/']],
  ['website/tools/pon-fiber-calculators/zh/index.html', 'zh', ['pon-splitter-loss/zh/#nel-split-ratio', 'optical-power-budget/zh/', 'onu-rx-power/zh/', 'zh/guides/pon-splitter-loss-guide/#nel-split-ratio', 'zh/topics/pon-optical/']],
  ['website/tools/pon-fiber-calculators/es/index.html', 'es', ['pon-splitter-loss/es/#nel-split-ratio', 'optical-power-budget/es/', 'onu-rx-power/es/', 'es/guides/pon-splitter-loss-guide/#nel-split-ratio', 'es/topics/pon-optical/']],
  ['website/guides/pon-splitter-loss-guide/index.html', 'en', ['pon-splitter-loss/#nel-split-ratio', 'optical-power-budget/', 'onu-rx-power/', 'topics/pon-optical/']],
  ['website/zh/guides/pon-splitter-loss-guide/index.html', 'zh', ['pon-splitter-loss/zh/#nel-split-ratio', 'optical-power-budget/zh/', 'onu-rx-power/zh/', 'zh/topics/pon-optical/']],
  ['website/es/guides/pon-splitter-loss-guide/index.html', 'es', ['pon-splitter-loss/es/#nel-split-ratio', 'optical-power-budget/es/', 'onu-rx-power/es/', 'es/topics/pon-optical/']],
  ['website/topics/pon-optical/index.html', 'en', ['pon-splitter-loss/#nel-split-ratio', 'optical-power-budget/', 'onu-rx-power/', 'guides/pon-splitter-loss-guide/#nel-split-ratio']],
  ['website/zh/topics/pon-optical/index.html', 'zh', ['pon-splitter-loss/zh/#nel-split-ratio', 'optical-power-budget/zh/', 'onu-rx-power/zh/', 'guides/pon-splitter-loss-guide/#nel-split-ratio']],
  ['website/es/topics/pon-optical/index.html', 'es', ['pon-splitter-loss/es/#nel-split-ratio', 'optical-power-budget/es/', 'onu-rx-power/es/', 'guides/pon-splitter-loss-guide/#nel-split-ratio']]
];

const boundary = { en: 'not an acceptance measurement', zh: '不是验收测量', es: 'medición de aceptación' };
for (const [file, lang, links] of pages) {
  const html = read(file);
  assert.ok(html.includes('id="nel-split-ratio"'), file + ' missing ratio section');
  assert.ok(html.includes('10 log10(N)'), file + ' missing ideal formula');
  assert.ok(html.includes(boundary[lang]), file + ' missing measurement boundary');
  assert.ok(html.includes('21.3 dB') && html.includes('-18.3 dBm'), file + ' missing worked receive power');
  for (const [n, loss] of planning) assert.match(html, rowPattern(n, loss), file + ' missing 1:' + n);
  for (const link of links) assert.ok(html.includes(link), file + ' missing ' + link);
  assert.ok(!/展示排名|impressions|6\.61/.test(html), file + ' exposes private search metrics');
}

const hashes = JSON.parse(read('reports/new-ten-tools-20261119/engine-hashes-before.json')).engines || JSON.parse(read('reports/new-ten-tools-20261119/engine-hashes-before.json'));
for (const file of [
  'website/tools/pon-splitter-loss/js/engine.js',
  'website/tools/optical-power-budget/js/engine.js',
  'website/tools/onu-rx-power/js/engine.js'
]) {
  const digest = crypto.createHash('sha256').update(read(file)).digest('hex');
  const expected = hashes[file] || hashes.engines?.[file];
  assert.equal(digest, expected, file + ' frozen engine changed');
}

const registry = JSON.parse(read('website/data/sitemap-routes.json'));
for (const id of ['guide-pon-splitter-loss-guide', 'topic-pon-optical', 'hub-pon-fiber-calculators']) {
  const route = registry.routes.find((item) => item.id === id);
  for (const locale of ['en', 'zh', 'es']) {
    assert.ok(route.translations[locale].title.includes(locale === 'en' ? 'PON' : locale === 'zh' ? 'PON' : 'PON') || route.translations[locale].title.length > 10);
    assert.ok(route.translations[locale].description.includes('10 log10(N)'), id + ' ' + locale + ' registry description');
  }
}

console.log('PASS pon optical seo', worked.physicalLoss, worked.rx);
