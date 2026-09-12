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
for (const page of pages) {
  const html = fs.readFileSync(page.file, 'utf8');
  need(/<body[^>]*data-nel-template=["']tool-detail-v1\.2["']/i.test(html), page, 'missing data-nel-template=tool-detail-v1.2');
  need(/<header[^>]*site-shell-header/i.test(html), page, 'missing shared header');
  need(/<nav[^>]*tool-return-nav/i.test(html), page, 'missing return/breadcrumb navigation');
  need(/<section[^>]*class=["'][^"']*nel-tool-hero[^"']*["']/i.test(html), page, 'missing V1.2 hero hook');
  need(!/<main[\s\S]{0,3000}<section[^>]*class=["'][^"']*nel-tool-hero/i.test(html), page, 'hero remains nested inside main');
  need(/<main[^>]*class=["'][^"']*nel-tool-main[^"']*["']/i.test(html), page, 'missing V1.2 main hook');
  need(/nel-tool-primary-grid|nel-tool-specialized/i.test(html), page, 'missing primary workspace semantic hook');
  need(/<footer[^>]*site-shell-footer/i.test(html), page, 'missing shared footer');
  need(/tool-layout\.css/i.test(html), page, 'missing final tool layout stylesheet');
  const headerPos = html.search(/<header[^>]*site-shell-header/i);
  const navPos = html.search(/<nav[^>]*tool-return-nav/i);
  const heroPos = html.search(/<section[^>]*class=[\"'][^\"']*nel-tool-hero/i);
  const mainPos = html.search(/<main[^>]*class=[\"'][^\"']*nel-tool-main/i);
  const footerPos = html.search(/<footer[^>]*site-shell-footer/i);
  need(headerPos >= 0 && navPos > headerPos && heroPos > navPos && mainPos > heroPos && footerPos > mainPos, page, 'canonical Header > Return > Hero > Main > Footer order violated');
}

const report = {
  version: 'UI V1.2',
  tools: toolDirs.length,
  pages: pages.length,
  errors: failures.length,
  status: failures.length ? 'FAIL' : 'PASS',
  failures
};
fs.writeFileSync(path.join(__dirname,'..','docs','UI_V1.2_TEMPLATE_UNIFICATION_RUNTIME_AUDIT.json'), JSON.stringify(report,null,2));
console.log(`Tool Page Template V1.2 Audit: ${report.status}`);
console.log(`Tools: ${report.tools} | Pages: ${report.pages} | Errors: ${report.errors}`);
if (failures.length) {
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
