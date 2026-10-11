const { chromium } = require('@playwright/test');
const crypto = require('node:crypto');
const fs = require('node:fs');

const locales = [
  { id: 'en', prefix: '' },
  { id: 'zh', prefix: 'zh/' },
];
const slugs = [
  'switch-oversubscription',
  'data-center-cooling-capacity',
  'telecom-power-energy',
];
const widths = [320, 375, 390, 768, 1440];
const screenshotWidths = new Map([
  ['en/switch-oversubscription', widths],
  ['zh/switch-oversubscription', widths],
  ['en/data-center-cooling-capacity', [390, 1440]],
  ['zh/data-center-cooling-capacity', [390, 1440]],
  ['en/telecom-power-energy', [390, 1440]],
  ['zh/telecom-power-energy', [390, 1440]],
]);
const baseUrl = process.env.UI_PREVIEW_URL || 'http://127.0.0.1:4173';
const outputDir = 'artifacts/ui-evidence';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const failures = [];
  const routes = [];

  for (const locale of locales) {
    const homePath = locale.id === 'zh' ? '/zh/' : '/';
    const homePage = await context.newPage();
    await homePage.goto(`${baseUrl}${homePath}`, { waitUntil: 'domcontentloaded' });
    const topicAnchorExists = await homePage.locator('#topics').count() > 0;
    await homePage.close();

    for (const slug of slugs) {
      const route = `/${locale.prefix}topics/${slug}/`;
      const sourcePath = `website/${locale.prefix}topics/${slug}/index.html`;
      const sourceHtml = fs.readFileSync(sourcePath, 'utf8');
      const canonical = sourceHtml.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] || null;
      const schemaPayloads = [...sourceHtml.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
      const schemaFingerprint = sha256(schemaPayloads.join('\n'));
      const page = await context.newPage();
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
      const base = await page.evaluate(() => {
        const breadcrumb = document.querySelector('.topic-hub-breadcrumb');
        const links = [...(breadcrumb?.querySelectorAll('a') || [])].map(anchor => ({
          text: anchor.textContent.trim(),
          href: anchor.href,
        }));
        return {
          title: document.title,
          h1: document.querySelector('main h1')?.textContent.trim() || '',
          mainTextLength: document.querySelector('main')?.innerText.trim().length || 0,
          topicCss: [...document.styleSheets].some(sheet => sheet.href?.includes('/assets/css/topic-hub.css')),
          bodyClass: document.body.classList.contains('topic-hub-page'),
          canonical: document.querySelector('link[rel="canonical"]')?.href || null,
          schemaScripts: document.querySelectorAll('script[type="application/ld+json"]').length,
          breadcrumbLinks: links,
          breadcrumbCurrent: breadcrumb?.querySelector('[aria-current="page"]')?.textContent.trim() || '',
        };
      });

      const expectedHome = new URL(homePath, baseUrl).href;
      const expectedTopics = `${expectedHome}#topics`;
      const firstCrumb = base.breadcrumbLinks[0]?.href;
      const topicsCrumb = base.breadcrumbLinks[1]?.href;
      if (response?.status() !== 200) failures.push({ route, issue: `HTTP ${response?.status()}` });
      if (!base.h1 || !base.mainTextLength) failures.push({ route, issue: 'missing visible heading or content' });
      if (!base.topicCss || !base.bodyClass) failures.push({ route, issue: 'shared topic presentation not loaded' });
      if (base.breadcrumbLinks.length !== 2 || firstCrumb !== expectedHome || topicsCrumb !== expectedTopics || !topicAnchorExists) {
        failures.push({ route, issue: 'breadcrumb does not return to the correct locale home/topics section' });
      }
      if (!canonical || base.canonical !== canonical || !schemaPayloads.length || !base.schemaScripts) {
        failures.push({ route, issue: 'canonical or existing structured data is missing' });
      }

      const measurements = [];
      for (const width of widths) {
        await page.setViewportSize({ width, height: width < 500 ? 900 : 1000 });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const measurement = await page.evaluate(() => {
          const bounds = selector => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const rect = element.getBoundingClientRect();
            return { left: +rect.left.toFixed(1), right: +rect.right.toFixed(1), width: +rect.width.toFixed(1) };
          };
          return {
            viewport: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            header: bounds('.site-shell-header-inner'),
            footer: bounds('.site-shell-footer-inner'),
            content: bounds('main'),
          };
        });
        measurements.push(measurement);
        if (measurement.scrollWidth > width + 1) failures.push({ route, width, issue: `horizontal overflow ${measurement.scrollWidth}px` });
        if (!measurement.header || !measurement.footer || Math.abs(measurement.header.left - measurement.footer.left) > 0.6 || Math.abs(measurement.header.right - measurement.footer.right) > 0.6) {
          failures.push({ route, width, issue: 'header/footer inner edges do not align' });
        }

        if ((screenshotWidths.get(`${locale.id}/${slug}`) || []).includes(width)) {
          const rejectConsent = page.locator('.nel-cookie-reject');
          if (await rejectConsent.isVisible().catch(() => false)) await rejectConsent.click();
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.screenshot({ path: `${outputDir}/topic-${locale.id}-${slug}-${width}.png` });
        }
      }

      routes.push({
        locale: locale.id,
        slug,
        path: route,
        status: response?.status(),
        ...base,
        schemaFingerprint,
        widths: measurements,
      });
      await page.close();
    }
  }

  await context.close();
  await browser.close();
  const result = { routes: routes.length, viewports: routes.length * widths.length, failures, routesDetail: routes };
  fs.writeFileSync(`${outputDir}/topic-family-results.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ routes: result.routes, viewports: result.viewports, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})();
