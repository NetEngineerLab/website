'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const Engine = require(path.join(root, 'website/tools/pon-splitter-loss/js/engine.js'));
let failed = 0;
const check = (name, ok, detail) => { if (!ok) { failed++; console.error('FAIL', name, detail || ''); } else console.log('PASS', name); };
const base = { distance: 8, attenuation: 0.35, spliceCount: 4, spliceLoss: 0.1, connectorCount: 4, connectorLoss: 0.5, s3: 0, other: 0, penalty: 1, margin: 3, systemReach: 20, tx: 3, txMax: 7, sens: -27, over: -8 };
const one = Engine.calculate({ ...base, s1: 20.5, s2: 0 });
const two = Engine.calculate({ ...base, s1: 10.5, s2: 10.5 });
const mixed = Engine.calculate({ ...base, s1: 13.8, s2: 7.2 });
check('one stage', one.ok && one.totalRatio === 64 && one.splitterLoss === 20.5 && one.physicalLoss === 25.7 && one.designLoss === 28.7 && one.standardBudget === 29 && Math.abs(one.remaining - 0.3) < 1e-9 && one.status === 'warning');
check('two stage', two.ok && two.totalRatio === 64 && two.splitterLoss === 21 && two.designLoss === 29.2 && two.status === 'failed' && mixed.splitterLoss === 21 && mixed.status === 'failed');
const slug = 'pon-split-one-stage-versus-two-stage';
const markers = ['20.5', '21.0', '28.7', '29.2', '0.30', '-0.20', '8.86', '7.43'];
const registry = JSON.parse(read('website/data/sitemap-routes.json'));
for (const locale of ['', 'zh/', 'es/']) {
  const file = `website/${locale}guides/${slug}/index.html`;
  const html = read(file);
  check(file + ' one h1', (html.match(/<h1>/g) || []).length === 1);
  check(file + ' example', locale === 'zh/' ? html.includes('示例') : locale === 'es/' ? html.includes('Ejemplo') : html.includes('Example'));
  check(file + ' shell', html.includes('class="guide-shell"') && html.includes('guide-related-side') && !html.includes('guide-primary-cta'));
  check(file + ' topic', html.includes('topics/pon-optical/'));
  check(file + ' tool', locale === 'es/' ? html.includes('tools/pon-splitter-loss/es/') : html.includes('tools/pon-splitter-loss/'));
  check(file + ' canonical', html.includes(`https://netengineerlab.com/${locale}guides/${slug}/`));
  check(file + ' hreflang es', html.includes(`hreflang="es" href="https://netengineerlab.com/es/guides/${slug}/"`));
  for (const marker of markers) check(file + ' ' + marker, html.includes(marker));
  const aside = (html.match(/<aside class="guide-toc guide-related-side"[\s\S]*?<\/aside>/) || [])[0] || '';
  const links = [...aside.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)];
  check(file + ' sidebar', links.length >= 2 && links.length <= 5 && !aside.includes(slug), String(links.length));
  if (locale === 'es/') check(file + ' spanish links', !aside.includes('/zh/'));
  for (const [, href, text] of links) {
    const target = path.resolve(path.dirname(path.join(root, file)), href, 'index.html');
    const targetHtml = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    const h1 = ((targetHtml.match(/<h1[^>]*>([^<]+)/) || [])[1] || '').replace(/&amp;/g, '&');
    check(file + ' ' + href, h1 && text.replace(/&amp;/g, '&') === h1);
  }
}
const record = registry.routes.find(route => route.route === `guides/${slug}/`);
check('registry', Boolean(record && record.translations.en && record.translations.zh && record.translations.es && record.longTailQuestions.es.length === 1));
for (const file of ['website/topics/pon-optical/index.html', 'website/zh/topics/pon-optical/index.html', 'website/es/topics/pon-optical/index.html', 'website/guides/index.html', 'website/zh/guides/index.html', 'website/es/guides/index.html']) {
  check(file + ' links the comparison', read(file).includes(slug));
}
if (failed) { console.error(failed + ' failed'); process.exit(1); }
console.log('PASS nc6 content');
