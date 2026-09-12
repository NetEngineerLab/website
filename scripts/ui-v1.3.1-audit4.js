const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const toolsRoot=path.join(root,'website','tools');
const COMPLEX=new Set(['acl-generator-validator','ipv6-nat-planner','network-change-planner-mop-generator','wifi-coverage-capacity-planner']);
const LOCAL_PLATFORM_CLASSES=[
  'breadcrumbs','card','panel','input-panel','result-panel','content-section','start-btn',
  'hero','tool-hero','hero-inner','hero-tags','tool-shell','nel-tool-main','nel-tool-grid','nel-tool-primary-grid',
  'tool-return-nav','site-header','site-footer','site-shell-header','site-shell-footer','site-shell-nav','site-shell-actions','header-cta'
];
const errors=[]; const tools=new Set(); let pages=0, ordinaryPages=0;
function read(p){return fs.readFileSync(p,'utf8')}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function count(s,re){return (s.match(re)||[]).length}
function rel(p){return path.relative(root,p).replaceAll('\\','/')}
for(const tool of fs.readdirSync(toolsRoot)){
  const dir=path.join(toolsRoot,tool);
  if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()||tool==='es') continue;
  for(const r of ['index.html',path.join('zh','index.html'),path.join('es','index.html')]){
    const f=path.join(dir,r); if(!fs.existsSync(f)) continue;
    const h=read(f); if(!h.includes('nel-tool-detail-page')) continue;
    pages++; tools.add(tool); const name=rel(f);
    if(!h.includes('data-nel-template="tool-detail-v1.3.1"')) errors.push(`${name}: template marker drift`);
    const order=['NEL_HEADER_START','class="breadcrumbs tool-return-nav"','<section class="hero nel-tool-hero"','<main','NEL_FOOTER_START'].map(x=>h.indexOf(x));
    if(!(order[0]>=0&&order[1]>order[0]&&order[2]>order[1]&&order[3]>order[2]&&order[4]>order[3])) errors.push(`${name}: shell order drift`);
    const exact=[
      ['header',/NEL_HEADER_START/g,1],['footer',/NEL_FOOTER_START/g,1],['breadcrumb',/class="breadcrumbs tool-return-nav"/g,1],
      ['hero',/<section class="hero nel-tool-hero"/g,1],['h1',/<h1(?:\s|>)/g,1],['header CTA',/class="site-shell-context-action"/g,1],
      ['design tokens',/design-tokens\.css/g,1],['tool design system',/tool-design-system\.css/g,1],['site shell CSS',/site-shell\.css/g,1],['tool layout CSS',/tool-layout\.css/g,1]
    ];
    for(const [label,re,want] of exact){const got=count(h,re); if(got!==want) errors.push(`${name}: ${label} count ${got}, expected ${want}`)}
    const hm=h.match(/<section class="hero nel-tool-hero"[^>]*><div class="hero-inner">([\s\S]*?)<\/div><\/section>/);
    if(!hm){errors.push(`${name}: canonical hero-inner missing`)} else {
      const inner=hm[1].trim();
      if(/^<div(?:\s|>)/.test(inner)) errors.push(`${name}: extra wrapper directly inside hero-inner`);
      if(!/^<p class="eyebrow"/.test(inner)) errors.push(`${name}: hero-inner must begin with eyebrow`);
      if(count(inner,/<h1(?:\s|>)/g)!==1) errors.push(`${name}: hero must contain exactly one h1`);
      if(count(inner,/class="hero-tags"/g)!==1) errors.push(`${name}: hero-tags count must be 1`);
      if(/class="(?:tags|chips|chip)"/.test(inner)) errors.push(`${name}: legacy hero tags/chips/chip class remains`);
    }
    if(!COMPLEX.has(tool)){
      ordinaryPages++;
      const canonical=/<main class="tool-shell nel-tool-main nel-tool-grid nel-tool-primary-grid"[^>]*>\s*<section[^>]*class="input-panel card nel-tool-input"[^>]*>[\s\S]*?<\/section>\s*<section[^>]*class="result-panel card nel-tool-result"[^>]*>/;
      if(!canonical.test(h)) errors.push(`${name}: ordinary main/input/result DOM not canonical`);
    } else if(!/<main[^>]*class="[^"]*nel-tool-main[^"]*nel-tool-specialized[^"]*"/.test(h)) {
      errors.push(`${name}: specialized page lacks explicit nel-tool-specialized marker`);
    }
    if(/class="[^"]*\bstart-btn\b/.test(h)) errors.push(`${name}: legacy start-btn in HTML`);
  }
  const css=path.join(dir,'css','style.css');
  if(fs.existsSync(css)){
    const s=read(css);
    for(const cls of LOCAL_PLATFORM_CLASSES){
      const re=new RegExp(`(^|[^\\w-])\\.${esc(cls)}(?![\\w-])`,'m');
      if(re.test(s)) errors.push(`${rel(css)}: local platform selector .${cls} is forbidden by Audit4`);
    }
  }
}
const oldRuntime=path.join(root,'website','assets','js','tool-shell-v1.9.9-03.js');
if(fs.existsSync(oldRuntime)) errors.push('legacy tool-shell-v1.9.9-03.js still exists');
if(tools.size!==35) errors.push(`tool count ${tools.size}, expected 35`);
if(pages!==80) errors.push(`Tool Detail page count ${pages}, expected 80`);
if(ordinaryPages!==72) errors.push(`ordinary page count ${ordinaryPages}, expected 72`);
const result={auditor:'4号审计员',version:'UI V1.3.1 Audit4 Closure',result:errors.length?'FAIL':'PASS',tools:tools.size,pages,ordinaryPages,errors};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT4_REPORT.json'),JSON.stringify(result,null,2));
const mdLines=[
  '# NetEngineerLab UI V1.3.1 — 4号审计员最终源代码复核','',
  `- 结论：**${result.result}**`,`- 工具：${result.tools}`,`- Tool Detail 页面：${result.pages}`,`- 普通计算器页面：${result.ordinaryPages}`,`- 阻断问题：${errors.length}`,'',
  '## Audit4 新增硬门禁','',
  '- Header / Footer / Breadcrumb / Hero / H1 / Header CTA 必须各唯一。',
  '- Hero 内部必须直接采用 MOP 基准结构，不允许额外 wrapper。',
  '- Hero 标签只允许 hero-tags > span，禁止旧 tags/chips/chip。',
  '- 工具本地 CSS 禁止重新定义平台级 Header/Footer/Breadcrumb/Hero/Main/Card/CTA selector。',
  '- 普通计算器必须保持统一 Input → Result 直接双栏 DOM。',
  '- 复杂工具必须显式标记 nel-tool-specialized。',''
];
if(errors.length) mdLines.push(...errors.map(x=>'- '+x));
else mdLines.push('4号审计员确认：Audit3 遗留的局部平台 selector、Hero 多层 wrapper 和旧 chip 标记均已从源代码关闭。');
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT4_REPORT.md'),mdLines.join('\n')+'\n');
console.log(`4号审计员 UI V1.3.1: ${result.result}`);
console.log(`Tools ${result.tools}; Pages ${result.pages}; Ordinary ${result.ordinaryPages}; Errors ${errors.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
