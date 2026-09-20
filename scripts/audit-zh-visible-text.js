const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const root = path.join(process.cwd(), 'website', 'tools');
  const pages = [];
  for (const tool of fs.readdirSync(root)) {
    const file = path.join(root, tool, 'zh', 'index.html');
    if (fs.existsSync(file)) pages.push(`/tools/${tool}/zh/`);
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const findings = [];
  for (const url of pages) {
    await page.goto(`http://127.0.0.1:4173${url}`, { waitUntil: 'networkidle' });
    const text = await page.locator('body').innerText();
    const matches = text.match(/[A-Za-z][A-Za-z ,/&+().'-]{18,}/g) || [];
    const suspicious = matches.filter(s => /\b(the|and|for|with|capacity|result|engineering|warning|passed|start|calculate|review|input|output|scenario|website)\b/i.test(s));
    if (suspicious.length) findings.push({ url, samples: [...new Set(suspicious)].slice(0, 8) });
  }
  await browser.close();
  console.log(JSON.stringify({ pages: pages.length, findings }, null, 2));
})();
