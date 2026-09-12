const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'website', 'tools');
const ignored = new Set(['es', 'zh']);
const toolDirs = fs.readdirSync(root, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !ignored.has(e.name))
  .map((e) => e.name)
  .sort();

const pages = [];
for (const tool of toolDirs) {
  for (const rel of ['index.html', path.join('zh','index.html'), path.join('es','index.html')]) {
    const file = path.join(root, tool, rel);
    if (fs.existsSync(file)) pages.push({tool, rel, file});
  }
}

const failures = [];
function need(ok, page, rule) { if (!ok) failures.push(`${page.tool}/${page.rel}: ${rule}`); }
function classAttr(re) { return new RegExp(`class=["'][^"']*\\b${re}\\b[^"']*["']`, 'i'); }

for (const page of pages) {
  const html = fs.readFileSync(page.file, 'utf8');
  need(/<body[^>]*data-nel-template=["']tool-detail-v1\.(?:2\.2|3(?:\.1)?)["']/i.test(html), page, 'missing supported data-nel-template (v1.2.2 or v1.3)');
  need(/<header[^>]*site-shell-header/i.test(html), page, 'missing shared header');
  need(/<nav[^>]*tool-return-nav/i.test(html), page, 'missing return/breadcrumb navigation');
  need(/<section[^>]*class=["'][^"']*\bnel-tool-hero\b[^"']*["']/i.test(html), page, 'missing canonical V1.2.2 hero');
  need(!/<main[\s\S]{0,3000}<section[^>]*class=["'][^"']*\bnel-tool-hero\b/i.test(html), page, 'hero remains nested inside main');
  need(/<main[^>]*class=["'][^"']*\btool-shell\b[^"']*\bnel-tool-main\b[^"']*["']/i.test(html), page, 'main is not canonical tool-shell/nel-tool-main');
  need(/<footer[^>]*site-shell-footer/i.test(html), page, 'missing shared footer');
  need(/tool-layout\.css/i.test(html), page, 'missing final tool layout stylesheet');

  const mainTag = (html.match(/<main\b[^>]*>/i) || [''])[0];
  const isGrid = /\bnel-tool-grid\b/i.test(mainTag);
  const isSpecialized = /\bnel-tool-specialized\b/i.test(mainTag);
  need(isGrid || isSpecialized, page, 'main must declare nel-tool-grid or nel-tool-specialized');

  if (isGrid) {
    need(/<main[^>]*\bnel-tool-grid\b[^>]*>[\s\S]*?\bnel-tool-input\b/i.test(html), page, 'grid page missing canonical input card');
    need(/<main[^>]*\bnel-tool-grid\b[^>]*>[\s\S]*?\bnel-tool-result\b/i.test(html), page, 'grid page missing canonical result card');
    // The old wrappers were the root cause of the two-template visual split.
    need(!/<main[^>]*>\s*<div[^>]*class=["'][^"']*\b(?:grid|tool-layout|layout)\b[^"']*["']/i.test(html), page, 'legacy primary wrapper still nested directly under main');
    need(!/class=["'][^"']*\b(?:wrap|workspace|calculator-shell)\b[^"']*["'][^>]*\bnel-tool-main\b/i.test(mainTag), page, 'legacy main identity remains on canonical grid page');
  }

  const contextActions = html.match(/class=["'][^"']*site-shell-context-action[^"']*["']/gi) || [];
  need(contextActions.length === 1, page, `expected exactly one shared context CTA container, found ${contextActions.length}`);
  need(!/class=["'][^"']*\bstart-btn\b[^"']*["']/i.test(html), page, 'legacy .start-btn CTA remains in static HTML');

  const headerPos = html.search(/<header[^>]*site-shell-header/i);
  const navPos = html.search(/<nav[^>]*tool-return-nav/i);
  const heroPos = html.search(/<section[^>]*class=["'][^"']*\bnel-tool-hero\b/i);
  const mainPos = html.search(/<main[^>]*class=["'][^"']*\bnel-tool-main\b/i);
  const footerPos = html.search(/<footer[^>]*site-shell-footer/i);
  need(headerPos >= 0 && navPos > headerPos && heroPos > navPos && mainPos > heroPos && footerPos > mainPos, page, 'canonical Header > Return > Hero > Main > Footer order violated');
}

const report = {
  version: 'UI V1.2.2 compatibility gate (accepts V1.3)',
  tools: toolDirs.length,
  pages: pages.length,
  errors: failures.length,
  status: failures.length ? 'FAIL' : 'PASS',
  failures
};
fs.writeFileSync(path.join(__dirname,'..','docs','UI_V1.2.2_TEMPLATE_RUNTIME_AUDIT.json'), JSON.stringify(report,null,2));
console.log(`Tool Page Template compatibility Audit: ${report.status}`);
console.log(`Tools: ${report.tools} | Pages: ${report.pages} | Errors: ${report.errors}`);
if (failures.length) {
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
