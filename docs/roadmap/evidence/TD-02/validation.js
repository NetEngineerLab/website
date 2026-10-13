'use strict';
const fs = require('node:fs');
const path = require('node:path');
const mode = process.argv[2];
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const existsRoute = route => fs.existsSync(path.join(root, 'website', route.replace(/^\//, ''), 'index.html'));
const pass = message => console.log(`PASS ${message}`);

if (mode === 'content') {
  const platform = require(path.join(root, 'website/data/content-platform.js'));
  const result = platform.validate();
  if (!result.ok) throw new Error(result.errors.join('\n'));
  const aggregate = platform.aggregate('topic-pon-optical');
  if (aggregate.items.length !== 9) throw new Error(`Expected 9 registered PON resources; found ${aggregate.items.length}`);
  for (const item of aggregate.items) if (item.indexState !== 'INDEXABLE' || !existsRoute(item.route)) throw new Error(`Unpublished or missing asset: ${item.route}`);
  pass(`content registry valid; ${aggregate.items.length} PON assets registered and present`);
} else if (mode === 'calculation') {
  const splitRatio = 8 * 8;
  const designLossDb = 10.5 + 10.5 + 10 * 0.30 + 6 * 0.1 + 4 * 0.3 + 1 + 3;
  if (splitRatio !== 64 || designLossDb !== 29.8) throw new Error('PON worked example mismatch');
  // Illustrative diagnostic record only; these are not measured customer/site data.
  const example = { onuReportedDbm: -27.0, budgetExpectedDbm: -24.5, otdrEventLossDb: 2.2, postRepairMeterDbm: -24.8 };
  const excessLossDb = example.budgetExpectedDbm - example.onuReportedDbm;
  const residualDb = example.budgetExpectedDbm - example.postRepairMeterDbm;
  if (excessLossDb !== 2.5 || Math.abs(residualDb) > 0.31) throw new Error('Illustrative diagnosis arithmetic mismatch');
  console.log('INPUT worked design: 1:8 x 1:8; 10 km x 0.30 dB/km; 6 x 0.1 dB splices; 4 x 0.3 dB connector pairs; 1 dB optical penalty; 3 dB margin');
  console.log('RESULT split=1:64; splitter=21.0 dB; fiber=3.0 dB; splice=0.6 dB; connectors=1.2 dB; penalty=1.0 dB; margin=3.0 dB; designLoss=29.8 dB');
  console.log('INPUT illustrative diagnosis (not field evidence): ONU=-27.0 dBm; budget expected=-24.5 dBm; OTDR observed event=2.2 dB; post-repair power meter=-24.8 dBm');
  console.log('DECISION: initial discrepancy=2.5 dB; verify meter/reference plane, correlate OTDR event with route records, compare to actual ONU datasheet; repair only after field confirmation; post-repair discrepancy=0.3 dB; repeat end-to-end power/loss tests and document');
  console.log('LIMIT: no receiver threshold or root cause inferred; use deployed OLT/ONU specifications and calibrated instruments');
  pass('design and diagnostic example arithmetic');
} else if (mode === 'links') {
  const files = [
    'website/topics/pon-optical/index.html', 'website/zh/topics/pon-optical/index.html',
    'website/guides/pon-splitter-loss-guide/index.html', 'website/zh/guides/pon-splitter-loss-guide/index.html',
    'website/guides/fiber-link-budget-guide/index.html', 'website/zh/guides/fiber-link-budget-guide/index.html',
    ...['pon-splitter-loss','fiber-loss','optical-power-budget','pon-distance','onu-rx-power','otdr-event','odf-odn-resource-planner'].flatMap(id => [`website/tools/${id}/index.html`, `website/tools/${id}/zh/index.html`])
  ];
  let checked = 0;
  for (const file of files) {
    if (!fs.existsSync(path.join(root, file))) continue;
    const html = read(file);
    for (const [, href] of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
      if (/^(?:[a-z]+:|#|mailto:|tel:|javascript:)/i.test(href)) continue;
      const base = 'https://netengineerlab.com/' + path.dirname(file.replace(/^website\//, '')).replace(/\\/g, '/') + '/';
      const url = new URL(href, base);
      if (!/\/(?:topics|guides|tools|cases)\//.test(url.pathname)) continue;
      if (!url.pathname.endsWith('/')) continue;
      const targetExists = existsRoute(url.pathname);
      if (!targetExists) throw new Error(`${file} links to missing route ${href} -> ${url.pathname}`);
      checked++;
    }
  }
  for (const f of ['website/topics/pon-optical/index.html', 'website/zh/topics/pon-optical/index.html']) {
    const html = read(f);
    if (!html.includes('/tools/onu-rx-power') || !html.includes('/tools/otdr-event') || !html.includes('/guides/pon-splitter-loss-guide')) throw new Error(`${f}: required diagnostic/guide links missing`);
  }
  for (const f of ['website/guides/pon-splitter-loss-guide/index.html','website/zh/guides/pon-splitter-loss-guide/index.html']) if (!read(f).includes('/topics/pon-optical/')) throw new Error(`${f}: breadcrumb does not return to hub`);
  pass(`${checked} scoped internal route links resolve; Hub→ONU/OTDR/guide and guide→Hub links present`);
} else if (mode === 'routes') {
  const config = JSON.parse(read('website/data/sitemap-routes.json'));
  const topic = config.routes.find(r => r.id === 'topic-pon-optical');
  if (!topic || topic.route !== 'topics/pon-optical/' || !topic.indexable || topic.status !== 'active') throw new Error('PON topic route is not active/indexable in sitemap source');
  for (const route of ['topics/pon-optical/','zh/topics/pon-optical/']) if (!existsRoute('/' + route)) throw new Error(`Missing built route ${route}`);
  const sitemap = read('website/sitemap.xml');
  for (const url of ['https://netengineerlab.com/topics/pon-optical/','https://netengineerlab.com/zh/topics/pon-optical/']) if (!sitemap.includes(url)) throw new Error(`Generated sitemap missing ${url}`);
  pass('active/indexable source route, English and Chinese HTML, generated sitemap entries');
} else if (mode === 'languages') {
  for (const [file, locale, canonical] of [
    ['website/topics/pon-optical/index.html','en','https://netengineerlab.com/topics/pon-optical/'],
    ['website/zh/topics/pon-optical/index.html','zh-CN','https://netengineerlab.com/zh/topics/pon-optical/']
  ]) {
    const html = read(file);
    for (const text of [`lang="${locale}"`,`name="robots" content="index,follow"`,`rel="canonical" href="${canonical}"`,`hreflang="x-default"`,`hreflang="en"`,`hreflang="zh-CN"`]) if (!html.includes(text)) throw new Error(`${file} missing ${text}`);
    const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    if (!jsonld.some(data => data['@type'] === 'CollectionPage' && data.inLanguage === locale)) throw new Error(`${file} lacks locale CollectionPage JSON-LD`);
  }
  pass('English/Chinese canonical, index robots, reciprocal hreflang, x-default and CollectionPage JSON-LD');
} else if (mode === 'browser') {
  const { chromium } = require('playwright');
  (async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      for (const width of [320,375,768]) {
        const page = await browser.newPage({ viewport: { width, height: 850 } });
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const response = await page.goto('http://127.0.0.1:4174/topics/pon-optical/');
        const state = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth > innerWidth, mainVisible: !!document.querySelector('main') && document.querySelector('main').getBoundingClientRect().width > 0 }));
        if (response.status() !== 200 || state.h1 !== 1 || state.overflow || !state.mainVisible || errors.length) throw new Error(`${width}px: HTTP ${response.status()} ${JSON.stringify(state)} errors=${errors.join(';')}`);
        console.log(`PASS viewport=${width}x850 HTTP=${response.status()} h1=${state.h1} horizontalOverflow=${state.overflow} mainVisible=${state.mainVisible}`);
        await page.close();
      }
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto('http://127.0.0.1:4174/topics/pon-optical/');
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => ({ tag: document.activeElement.tagName, text: (document.activeElement.textContent || '').trim(), visible: document.activeElement.getBoundingClientRect().width > 0, focusVisible: document.activeElement.matches(':focus-visible') }));
      if (focus.tag !== 'A' || !focus.visible || !focus.focusVisible) throw new Error(`Keyboard first Tab did not reach a visible focus-visible link: ${JSON.stringify(focus)}`);
      console.log(`PASS keyboard first Tab tag=${focus.tag} visible=${focus.visible} focusVisible=${focus.focusVisible} text=${focus.text}`);
    } finally { await browser.close(); }
  })().catch(e => { console.error(e); process.exitCode=1; });
} else throw new Error('Usage: node validation.js content|calculation|links|routes|languages|browser');
