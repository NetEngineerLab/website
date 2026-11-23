'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const Pue = require(path.join(root, 'website/tools/pue-data-center-energy-efficiency/js/engine.js'));
let failed = 0;
const check = (name, ok, detail) => { if (!ok) { failed++; console.error('FAIL', name, detail || ''); } else console.log('PASS', name); };

const period = Pue.calculate({ mode: 'energy', total: 150000, it: 100000, periodDays: 30, cooling: 32000, ups: 10000, lighting: 3000, distribution: 3000, other: 2000, tariff: 0, itGrowthPct: 0, targetPUE: 1.5 });
const snapshot = Pue.calculate({ mode: 'power', total: 560, it: 400, cooling: 90, ups: 40, lighting: 10, distribution: 12, other: 8 });
check('period engine', period.ok && period.pue === 1.5 && period.nonIT === 50000 && period.annualTotal === 1825000 && period.breakdownGap === 0);
check('snapshot engine', snapshot.ok && snapshot.pue === 1.4 && snapshot.nonIT === 160 && snapshot.breakdownGap === 0);

const slug = 'data-center-pue-calculation';
const markers = ['1.50', '150000', '100000', '32000', '50000', '0.32', '0.18', '1.40', '560', '400', '1825000', 'kWh', 'kW', 'ISO/IEC 30134-2:2026', 'https://www.iso.org/standard/30134-2'];
const banned = ['64134', '62.19', '行业平均PUE', 'average PUE', 'typical PUE', 'promedio del sector es', '节能 30', 'save 30'];
const h1 = {
  '': 'Data Center PUE Calculation: Formula, Measurement and Worked Examples',
  'zh/': '数据中心 PUE 计算：公式、测量与演算示例',
  'es/': 'Cálculo del PUE del centro de datos: fórmula, medición y ejemplos resueltos'
};
for (const locale of ['', 'zh/', 'es/']) {
  const file = `website/${locale}guides/${slug}/index.html`;
  const html = read(file);
  const title = (html.match(/<h1>([^<]+)/) || [])[1];
  check(file + ' h1', title === h1[locale], title);
  check(file + ' one h1', (html.match(/<h1>/g) || []).length === 1);
  check(file + ' canonical', html.includes(`rel="canonical" href="https://netengineerlab.com/${locale}guides/${slug}/"`));
  check(file + ' hreflang', html.includes('hreflang="es" href="https://netengineerlab.com/es/guides/' + slug + '/"') && html.includes('hreflang="zh-CN"'));
  check(file + ' shell', html.includes('class="guide-shell"') && html.includes('guide-related-side') && !html.includes('guide-primary-cta'));
  const articleEnd = html.indexOf('</article>');
  const asideAt = html.indexOf('guide-related-side');
  check(file + ' aside after article', articleEnd > 0 && asideAt > articleEnd);
  for (const marker of markers) check(file + ' ' + marker, html.includes(marker));
  for (const phrase of banned) check(file + ' bans ' + phrase, !html.includes(phrase));
  check(file + ' assumption', locale === 'zh/' ? html.includes('不是测量') : locale === 'es/' ? html.includes('no medido') : html.includes('not a measurement'));
  check(file + ' no savings percent', !/\d+(?:\.\d+)?\s*%\s*(?:saving|savings|ahorro|节能)/i.test(html));
  const aside = (html.match(/<aside class="guide-toc guide-related-side"[\s\S]*?<\/aside>/) || [''])[0];
  const links = [...aside.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)];
  check(file + ' sidebar count', links.length >= 2 && links.length <= 5, String(links.length));
  if (locale === 'es/') check(file + ' sidebar stays in Spanish', !aside.includes('/zh/') && !aside.includes('/guides/'));
  for (const [, href, text] of links) {
    const target = path.resolve(path.dirname(path.join(root, file)), href, 'index.html');
    const targetHtml = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    const targetH1 = ((targetHtml.match(/<h1[^>]*>([^<]+)/) || [])[1] || '').replace(/&amp;/g, '&');
    check(file + ' link ' + href, targetH1 && text.replace(/&amp;/g, '&') === targetH1, text + ' vs ' + targetH1);
  }
  check(file + ' calculator', html.includes('pue-data-center-energy-efficiency'));
  check(file + ' cooling calculator', html.includes('data-center-cooling-load-calculator'));
  check(file + ' cooling topic', html.includes('topics/data-center-cooling-capacity/'));
}

const backlinks = [
  ['website/tools/pue-data-center-energy-efficiency/index.html', '/guides/data-center-pue-calculation/'],
  ['website/tools/pue-data-center-energy-efficiency/zh/index.html', '/zh/guides/data-center-pue-calculation/'],
  ['website/tools/pue-data-center-energy-efficiency/es/index.html', '/es/guides/data-center-pue-calculation/'],
  ['website/tools/data-center-cooling-load-calculator/index.html', 'guides/data-center-pue-calculation/'],
  ['website/tools/data-center-cooling-load-calculator/zh/index.html', 'zh/guides/data-center-pue-calculation/'],
  ['website/tools/data-center-cooling-load-calculator/es/index.html', 'es/guides/data-center-pue-calculation/'],
  ['website/topics/data-center-cooling-capacity/index.html', 'guides/data-center-pue-calculation/'],
  ['website/zh/topics/data-center-cooling-capacity/index.html', 'guides/data-center-pue-calculation/'],
  ['website/guides/data-center-cooling-load-calculation/index.html', 'data-center-pue-calculation/'],
  ['website/zh/guides/data-center-cooling-load-calculation/index.html', 'data-center-pue-calculation/'],
  ['website/guides/server-room-heat-load-calculation/index.html', 'data-center-pue-calculation/'],
  ['website/zh/guides/server-room-heat-load-calculation/index.html', 'data-center-pue-calculation/'],
  ['website/guides/monthly-energy-pue-not-redundancy/index.html', 'data-center-pue-calculation/'],
  ['website/guides/index.html', 'data-center-pue-calculation/'],
  ['website/zh/guides/index.html', 'data-center-pue-calculation/'],
  ['website/es/guides/index.html', 'data-center-pue-calculation/']
];
for (const [file, needle] of backlinks) check('backlink ' + file, read(file).includes(needle));

const registry = JSON.parse(read('website/data/sitemap-routes.json'));
const record = registry.routes.find(route => route.route === `guides/${slug}/`);
check('registry', Boolean(record && record.indexable === true && record.translations.en.title && record.translations.zh.title && record.translations.es.title && record.longTailQuestions.en.length === 1 && record.longTailQuestions.zh.length === 1 && record.longTailQuestions.es.length === 1 && record.sources.includes('https://www.iso.org/standard/30134-2')));
check('old monthly source corrected', registry.routes.find(route => route.route === 'guides/monthly-energy-pue-not-redundancy/').sources.includes('https://www.iso.org/standard/30134-2'));
check('field case untouched', read('website/topics/data-center-cooling-capacity/index.html').includes('136.25') && read('website/topics/data-center-cooling-capacity/index.html').includes('id="field-case"'));
check('monthly example untouched', read('website/guides/monthly-energy-pue-not-redundancy/index.html').includes('120000') && read('website/guides/monthly-energy-pue-not-redundancy/index.html').includes('1.417'));
check('density not called a capacity derate', read(`website/guides/${slug}/index.html`).includes('does not derate cooling capacity'));
for (const locale of ['website/topics/data-center-cooling-capacity/index.html', 'website/zh/topics/data-center-cooling-capacity/index.html']) {
  const topic = read(locale);
  for (const id of ['intro', 'user-questions', 'principle', 'task-routes', 'field-case', 'worked-cases', 'method', 'faq', 'further']) {
    check(locale + ' #' + id, topic.includes('id="' + id + '"'));
  }
  check(locale + ' keeps hall numbers', topic.includes('136.25') && topic.includes('38.74') && topic.includes('data-center-capacity'));
}
check('topic density is airflow only', read('website/topics/data-center-cooling-capacity/index.html').includes('not a cooling-capacity derating') && read('website/zh/topics/data-center-cooling-capacity/index.html').includes('不是制冷容量降额'));
check('guide returns to the cooling topic', read(`website/guides/${slug}/index.html`).includes('topics/data-center-cooling-capacity/') && read(`website/zh/guides/${slug}/index.html`).includes('topics/data-center-cooling-capacity/') && read(`website/es/guides/${slug}/index.html`).includes('topics/data-center-cooling-capacity/'));
check('no spanish cooling topic', !require('fs').existsSync('website/es/topics/data-center-cooling-capacity/index.html'));

if (failed) { console.error(failed + ' failed'); process.exit(1); }
console.log('PASS pue calculation guide');
