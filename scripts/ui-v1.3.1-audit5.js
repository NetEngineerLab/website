const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const toolsRoot = path.join(root, 'website', 'tools');
const COMPLEX = new Set(['acl-generator-validator','ipv6-nat-planner','network-change-planner-mop-generator','wifi-coverage-capacity-planner']);
const PLATFORM_CLASSES = [
  'breadcrumbs','card','panel','input-panel','result-panel','content-section','start-btn',
  'hero','tool-hero','hero-inner','hero-tags','tool-shell','nel-tool-main','nel-tool-grid','nel-tool-primary-grid',
  'tool-return-nav','site-header','site-footer','site-shell-header','site-shell-footer','site-shell-nav','site-shell-actions','header-cta'
];
const errors=[];
const tools=new Set();
let pages=0, ordinaryPages=0;
const read=p=>fs.readFileSync(p,'utf8');
const rel=p=>path.relative(root,p).replaceAll('\\','/');
const count=(s,re)=>(s.match(re)||[]).length;
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

function walk(dir, ext, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    const p=path.join(dir,name); const st=fs.statSync(p);
    if (st.isDirectory()) walk(p,ext,out); else if (!ext || p.endsWith(ext)) out.push(p);
  }
  return out;
}

for (const tool of fs.readdirSync(toolsRoot)) {
  const dir=path.join(toolsRoot,tool);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory() || tool==='es') continue;
  for (const r of ['index.html',path.join('zh','index.html'),path.join('es','index.html')]) {
    const f=path.join(dir,r); if (!fs.existsSync(f)) continue;
    const h=read(f); if (!h.includes('nel-tool-detail-page')) continue;
    pages++; tools.add(tool); const name=rel(f);
    if (!h.includes('data-nel-template="tool-detail-v1.3.1"')) errors.push(`${name}: template marker is not v1.3.1`);
    if (/data-nel-template="tool-detail-v1\.3"/.test(h)) errors.push(`${name}: obsolete v1.3 template marker remains`);
    const exact=[
      ['header',/NEL_HEADER_START/g,1],['footer',/NEL_FOOTER_START/g,1],['breadcrumb',/class="breadcrumbs tool-return-nav"/g,1],
      ['hero',/<section class="hero nel-tool-hero"/g,1],['h1',/<h1(?:\s|>)/g,1],['header CTA',/class="site-shell-context-action"/g,1],
      ['design tokens',/design-tokens\.css/g,1],['tool design system',/tool-design-system\.css/g,1],['site shell CSS',/site-shell\.css/g,1],['tool layout CSS',/tool-layout\.css/g,1]
    ];
    for (const [label,re,want] of exact) { const got=count(h,re); if (got!==want) errors.push(`${name}: ${label} count ${got}, expected ${want}`); }
    const order=['NEL_HEADER_START','class="breadcrumbs tool-return-nav"','<section class="hero nel-tool-hero"','<main','NEL_FOOTER_START'].map(x=>h.indexOf(x));
    if (!(order[0]>=0 && order[1]>order[0] && order[2]>order[1] && order[3]>order[2] && order[4]>order[3])) errors.push(`${name}: shell order drift`);

    const hm=h.match(/<section class="hero nel-tool-hero"[^>]*><div class="hero-inner">([\s\S]*?)<\/div><\/section>/);
    if (!hm) errors.push(`${name}: canonical hero-inner missing`);
    else {
      const inner=hm[1].trim();
      const canonical=/^<p class="eyebrow"[^>]*>[\s\S]*?<\/p>\s*<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>[\s\S]*?<\/p>\s*<div class="hero-tags">\s*(?:<span[^>]*>[\s\S]*?<\/span>\s*)+<\/div>$/;
      if (!canonical.test(inner)) errors.push(`${name}: hero-inner is not exact MOP sequence eyebrow > h1 > copy > hero-tags`);
      if (/class="(?:hero-badges|hero-card|hero-note|example-tag|tags|chips|chip)"/.test(inner)) errors.push(`${name}: legacy/special hero child remains`);
      const tags=inner.match(/<div class="hero-tags">([\s\S]*?)<\/div>/);
      if (!tags || /<(?!\/?span\b)[a-z][^>]*>/i.test(tags[1])) errors.push(`${name}: hero-tags children must be span only`);
    }

    if (/class="[^"]*\bstart-btn\b/.test(h)) errors.push(`${name}: legacy start-btn in HTML`);
    if (!COMPLEX.has(tool)) {
      ordinaryPages++;
      const canonicalMain=/<main class="tool-shell nel-tool-main nel-tool-grid nel-tool-primary-grid"[^>]*>\s*<section[^>]*class="input-panel card nel-tool-input"[^>]*>[\s\S]*?<\/section>\s*<section[^>]*class="result-panel card nel-tool-result"[^>]*>/;
      if (!canonicalMain.test(h)) errors.push(`${name}: ordinary calculator main DOM is not canonical`);
    } else if (!/<main[^>]*class="[^"]*nel-tool-main[^"]*nel-tool-specialized[^"]*"/.test(h)) {
      errors.push(`${name}: specialized tool lacks nel-tool-specialized marker`);
    }
  }

  // Audit every CSS file inside a tool, not only css/style.css.
  for (const css of walk(dir,'.css')) {
    const s=read(css);
    for (const cls of PLATFORM_CLASSES) {
      const re=new RegExp(`(^|[^\\w-])\\.${esc(cls)}(?![\\w-])`,'m');
      if (re.test(s)) errors.push(`${rel(css)}: tool-local platform selector .${cls} is forbidden`);
    }
  }
}

// Repository-wide compatibility residue checks.
const assetsRoot=path.join(root,'website','assets');
for (const f of walk(assetsRoot)) {
  if (!/\.(css|js)$/.test(f)) continue;
  const s=read(f);
  if (/\bstart-btn\b/.test(s)) errors.push(`${rel(f)}: obsolete start-btn compatibility residue remains`);
  if (/tool-detail-v1\.3"/.test(s)) errors.push(`${rel(f)}: obsolete tool-detail-v1.3 compatibility selector remains`);
}
if (fs.existsSync(path.join(root,'website','assets','js','tool-shell-v1.9.9-03.js'))) errors.push('legacy tool-shell-v1.9.9-03.js still exists');

if (tools.size!==35) errors.push(`tool count ${tools.size}, expected 35`);
if (pages!==80) errors.push(`Tool Detail page count ${pages}, expected 80`);
if (ordinaryPages!==72) errors.push(`ordinary calculator page count ${ordinaryPages}, expected 72`);

const result={auditor:'5号审计员',version:'UI V1.3.1 Audit5 Repository Closure',result:errors.length?'FAIL':'PASS',tools:tools.size,pages,ordinaryPages,errors};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT5_REPORT.json'),JSON.stringify(result,null,2));
const md=[
  '# NetEngineerLab UI V1.3.1 — 5号审计员仓库级最终复核','',
  `- 结论：**${result.result}**`,`- 工具：${result.tools}`,`- Tool Detail 页面：${result.pages}`,`- 普通计算器页面：${result.ordinaryPages}`,`- 阻断问题：${errors.length}`,'',
  '## Audit5 新增阻断门禁','',
  '- Hero 必须精确采用 MOP 四段结构：Eyebrow → H1 → 描述 → Hero Tags；不允许额外 Hero Card / Note / Badge。',
  '- Hero Tags 只能直接包含 span。',
  '- 扫描工具目录下全部 CSS，而不是仅 css/style.css；工具本地 CSS 不得拥有平台级组件。',
  '- website/assets 中禁止保留 start-btn 兼容 CSS/JS。',
  '- website/assets 中禁止保留 tool-detail-v1.3 旧模板兼容选择器。',
  '- Header / Footer / Breadcrumb / Hero / H1 / Header CTA / 共享 CSS 均必须唯一。',
  '- 普通计算器继续保持统一 Input → Result 双栏 DOM；复杂工具必须显式 specialized。',''
];
if (errors.length) md.push('## 阻断问题','',...errors.map(x=>'- '+x));
else md.push('5号审计员确认：页面结构、Hero 内部结构、工具本地 CSS、共享资源兼容层和旧 CTA runtime 均已完成仓库级收敛。');
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT5_REPORT.md'),md.join('\n')+'\n');
console.log(`5号审计员 UI V1.3.1: ${result.result}`);
console.log(`Tools ${result.tools}; Pages ${result.pages}; Ordinary ${result.ordinaryPages}; Errors ${errors.length}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
