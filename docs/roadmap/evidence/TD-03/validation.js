'use strict';
const fs = require('node:fs');
const path = require('node:path');
const mode = process.argv[2];
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const existsRoute = route => fs.existsSync(path.join(root, 'website', route.replace(/^\//, ''), 'index.html'));
const pass = message => console.log(`PASS ${message}`);
const pages = [
  'website/topics/telecom-power-energy/index.html',
  'website/zh/topics/telecom-power-energy/index.html'
];

function near(actual, expected, tolerance) {
  if (Math.abs(actual - expected) > tolerance) throw new Error(`${actual} is not within ${tolerance} of ${expected}`);
}

if (mode === 'content') {
  for (const file of pages) {
    const html = read(file);
    for (const id of ['id="task-routes"', 'id="exceptions"', 'id="ownership"', 'id="field-case"']) {
      if (!html.includes(id)) throw new Error(`${file} missing ${id}`);
    }
    if (!html.includes('datacenter-power-calculators')) throw new Error(`${file} missing data-center UPS boundary`);
    if (!/1,000 Ah/.test(html) || !html.includes('324.3')) throw new Error(`${file} missing rectifier or battery check`);
    if (!html.includes('111.5') || !html.includes('6.64')) throw new Error(`${file} missing generator or solar field check`);
  }
  const en = read(pages[0]);
  for (const href of [
    '../../guides/telecom-rectifier-dc-power-sizing/',
    '../../tools/telecom-rectifier-dc-power-sizing/',
    '../../tools/48v-battery-runtime/',
    '../../guides/generator-fuel-runtime-planning/',
    '../../tools/generator-fuel-runtime-calculator/',
    '../../tools/telecom-solar-battery-sizing-calculator/',
    '../../tools/datacenter-power-calculators/'
  ]) if (!en.includes(href)) throw new Error(`English hub missing start or check link ${href}`);
  pass('English and Chinese hubs name four tasks, checks, exceptions, ownership, field case and UPS boundary');
} else if (mode === 'calculation') {
  const G = require(path.join(root, 'website/tools/generator-fuel-runtime-calculator/js/engine.js'));
  const gen = G.calculate({
    ratedKW: 30, fuel0: 1.5, fuel25: 2.5, fuel50: 4.2, fuel75: 5.8, fuel100: 7.4,
    segments: [{ name: 'day', loadKW: 18, hours: 12 }, { name: 'night', loadKW: 12, hours: 12 }],
    tankLiters: 120, reservePct: 10, targetHours: 24, fuelPrice: 1.2, generatorCount: 1, batteryUsableKWh: 0
  });
  if (!gen.ok) throw new Error('generator engine rejected the field case');
  near(gen.avgFuelLph, 4.18, 0.005);
  near(gen.targetFuelWithReserve, 111.5, 0.05);
  near(gen.runtimeHours, 25.8, 0.05);
  const shortTankHours = 100 / gen.avgFuelLph;
  if (!(shortTankHours < 24)) throw new Error('100 L usable tank should miss the 24 h check');
  const rectifier = (180 * 1.15 + 60 * 1.25) * 1.15;
  const batteryAh = (180 * 4) / (0.8 * 0.9);
  near(rectifier, 324.3, 0.05);
  near(batteryAh, 1000, 0.05);
  const S = require(path.join(root, 'website/tools/telecom-solar-battery-sizing-calculator/js/engine.js'));
  const solar = S.calculate({
    telecomKW: 0.8, telecomHours: 24, auxKW: 0.1, auxHours: 24,
    psh: 3.5, moduleW: 550, systemEfficiencyPct: 80, designMarginPct: 15,
    backupHours: 48, dodPct: 80, batteryEfficiencyPct: 92, batteryMarginPct: 10, systemVoltage: 48
  });
  if (!solar.ok) throw new Error('solar engine rejected the field case');
  near(solar.dailyLoad, 21.6, 0.001);
  near(solar.requiredPV, 8.87, 0.01);
  if (solar.moduleCount !== 17) throw new Error(`expected 17 modules, got ${solar.moduleCount}`);
  near(solar.installedPV, 9.35, 0.001);
  near(solar.batteryAh, 1345, 1);
  const lowSunKWh = solar.installedPV * 2.0 * 0.8;
  near(lowSunKWh, 14.96, 0.01);
  near(solar.dailyLoad - lowSunKWh, 6.64, 0.01);
  console.log(`RESULT rectifier=${rectifier.toFixed(1)} A; battery=${batteryAh.toFixed(0)} Ah; fuel=${gen.avgFuelLph.toFixed(2)} L/h; reserve=${gen.targetFuelWithReserve.toFixed(1)} L; runtime=${gen.runtimeHours.toFixed(1)} h; shortTank=${shortTankHours.toFixed(1)} h; pv=${solar.requiredPV.toFixed(2)} kW; modules=${solar.moduleCount}; installed=${solar.installedPV.toFixed(2)} kWp; batteryAh=${solar.batteryAh.toFixed(0)}; lowSun=${lowSunKWh.toFixed(2)} kWh; shortfall=${(solar.dailyLoad - lowSunKWh).toFixed(2)} kWh`);
  pass('rectifier, battery, generator and solar field arithmetic matches the published hub');
} else if (mode === 'links') {
  let checked = 0;
  for (const file of pages) {
    const html = read(file);
    for (const [, href] of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
      if (/^(?:[a-z]+:|#|mailto:|tel:|javascript:)/i.test(href)) continue;
      const base = 'https://netengineerlab.com/' + path.dirname(file.replace(/^website\//, '')).replace(/\\/g, '/') + '/';
      const url = new URL(href, base);
      if (!/\/(?:topics|guides|tools|cases)\//.test(url.pathname)) continue;
      if (!url.pathname.endsWith('/')) continue;
      if (!existsRoute(url.pathname)) throw new Error(`${file} links to missing route ${href} -> ${url.pathname}`);
      checked++;
    }
  }
  pass(`${checked} scoped hub links resolve`);
} else if (mode === 'routes') {
  const config = JSON.parse(read('website/data/sitemap-routes.json'));
  const topic = config.routes.find(r => r.id === 'topic-telecom-power-energy');
  if (!topic || topic.route !== 'topics/telecom-power-energy/' || !topic.indexable || topic.status !== 'active') throw new Error('telecom power topic route is not active/indexable');
  for (const route of ['topics/telecom-power-energy/', 'zh/topics/telecom-power-energy/']) if (!existsRoute('/' + route)) throw new Error(`Missing built route ${route}`);
  const sitemap = read('website/sitemap.xml');
  for (const url of ['https://netengineerlab.com/topics/telecom-power-energy/', 'https://netengineerlab.com/zh/topics/telecom-power-energy/']) {
    if (!sitemap.includes(url)) throw new Error(`Generated sitemap missing ${url}`);
  }
  pass('active/indexable source route, English and Chinese HTML, generated sitemap entries');
} else if (mode === 'languages') {
  for (const [file, locale, canonical] of [
    ['website/topics/telecom-power-energy/index.html', 'en', 'https://netengineerlab.com/topics/telecom-power-energy/'],
    ['website/zh/topics/telecom-power-energy/index.html', 'zh-CN', 'https://netengineerlab.com/zh/topics/telecom-power-energy/']
  ]) {
    const html = read(file);
    for (const text of [`lang="${locale}"`, 'name="robots" content="index,follow"', `rel="canonical" href="${canonical}"`, 'hreflang="x-default"', 'hreflang="en"', 'hreflang="zh-CN"']) {
      if (!html.includes(text)) throw new Error(`${file} missing ${text}`);
    }
    const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    if (!jsonld.some(data => data['@type'] === 'CollectionPage' && data.inLanguage === locale)) throw new Error(`${file} lacks locale CollectionPage JSON-LD`);
  }
  pass('English/Chinese canonical, index robots, reciprocal hreflang, x-default and CollectionPage JSON-LD');
} else if (mode === 'browser') {
  const { chromium } = require('playwright');
  (async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      for (const [label, url] of [['en', 'http://127.0.0.1:4175/topics/telecom-power-energy/'], ['zh', 'http://127.0.0.1:4175/zh/topics/telecom-power-energy/']]) {
        for (const width of [320, 375, 768]) {
          const page = await browser.newPage({ viewport: { width, height: 850 } });
          const errors = [];
          page.on('pageerror', e => errors.push(e.message));
          const response = await page.goto(url);
          const state = await page.evaluate(() => ({
            h1: document.querySelectorAll('h1').length,
            overflow: document.documentElement.scrollWidth > window.innerWidth,
            mainVisible: !!document.querySelector('main') && document.querySelector('main').getBoundingClientRect().width > 0,
            tasks: !!document.getElementById('task-routes')
          }));
          if (response.status() !== 200 || state.h1 !== 1 || state.overflow || !state.mainVisible || !state.tasks || errors.length) {
            throw new Error(`${label} ${width}px: HTTP ${response.status()} ${JSON.stringify(state)} errors=${errors.join(';')}`);
          }
          console.log(`PASS ${label} viewport=${width}x850 HTTP=${response.status()} h1=${state.h1} horizontalOverflow=${state.overflow} tasks=${state.tasks}`);
          await page.close();
        }
      }
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto('http://127.0.0.1:4175/topics/telecom-power-energy/');
      await page.keyboard.press('Tab');
      const first = await page.evaluate(() => ({
        tag: document.activeElement.tagName,
        text: (document.activeElement.textContent || '').trim().slice(0, 80),
        visible: document.activeElement.getBoundingClientRect().width > 0,
        focusVisible: document.activeElement.matches(':focus-visible')
      }));
      if (!first.visible || !first.focusVisible) throw new Error(`First Tab is not a visible focus-visible control: ${JSON.stringify(first)}`);
      const accept = page.getByRole('button', { name: 'Accept' });
      if (await accept.count()) await accept.click();
      let task = null;
      for (let step = 0; step < 50; step++) {
        await page.keyboard.press('Tab');
        task = await page.evaluate(() => ({
          tag: document.activeElement.tagName,
          text: (document.activeElement.textContent || '').trim().slice(0, 80),
          href: document.activeElement.getAttribute && document.activeElement.getAttribute('href'),
          inTasks: !!document.activeElement.closest('#task-routes'),
          visible: document.activeElement.getBoundingClientRect().width > 0,
          focusVisible: document.activeElement.matches(':focus-visible')
        }));
        if (task.inTasks && /telecom-rectifier-dc-power-sizing\/$/.test(task.href || '')) break;
      }
      if (!task || task.tag !== 'A' || !task.inTasks || !task.visible || !task.focusVisible) throw new Error(`Tab did not reach a visible task-route link: ${JSON.stringify(task)}`);
      await page.keyboard.press('Enter');
      await page.waitForURL(/\/guides\/telecom-rectifier-dc-power-sizing\/$/);
      if (page.url().includes('/zh/')) throw new Error(`English task link opened ${page.url()}`);
      console.log(`PASS keyboard first Tab tag=${first.tag} text=${first.text}; task link tag=${task.tag} focusVisible=${task.focusVisible} text=${task.text}; enter=${page.url()}`);
    } finally { await browser.close(); }
  })().catch(e => { console.error(e); process.exitCode = 1; });
} else throw new Error('Usage: node docs/roadmap/evidence/TD-03/validation.js content|calculation|links|routes|languages|browser');
