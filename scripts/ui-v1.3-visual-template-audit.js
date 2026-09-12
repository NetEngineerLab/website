const fs=require('fs');const path=require('path');
const root=path.join(__dirname,'..');const toolsRoot=path.join(root,'website','tools');
const errors=[];const warnings=[];const pages=[];const tools=[];
function read(p){return fs.readFileSync(p,'utf8')}
for(const name of fs.readdirSync(toolsRoot)){
  const dir=path.join(toolsRoot,name);if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()||name==='es')continue;
  const candidates=[path.join(dir,'index.html'),path.join(dir,'zh','index.html'),path.join(dir,'es','index.html')];
  let toolPages=0;
  for(const f of candidates){if(!fs.existsSync(f))continue;const s=read(f);if(!s.includes('nel-tool-detail-page'))continue;pages.push(f);toolPages++;
    const rel=path.relative(root,f).replaceAll('\\','/');
    const must=[
      ['template v1.3+',/data-nel-template="tool-detail-v1\.3(?:\.1)?"/],
      ['visual reference',/data-nel-visual="network-change-planner-reference"/],
      ['shared header',/NEL_HEADER_START/],
      ['breadcrumb',/class="breadcrumbs tool-return-nav"/],
      ['canonical hero',/<section class="hero nel-tool-hero"/],
      ['hero inner',/class="hero-inner/],
      ['canonical main',/<main class="tool-shell nel-tool-main/],
      ['shared footer',/NEL_FOOTER_START/]
    ];
    for(const [label,re] of must)if(!re.test(s))errors.push(`${rel}: missing ${label}`);
    if(/class="(?:[^"]*\s)?tool-hero(?:\s[^"]*)?"/.test(s))errors.push(`${rel}: legacy tool-hero class remains`);
    if(/class="(?:[^"]*\s)?(?:tags|chips)(?:\s[^"]*)?"/.test(s))errors.push(`${rel}: legacy hero tag alias remains`);
    const cta=(s.match(/class="site-shell-context-action"/g)||[]).length;if(cta!==1)errors.push(`${rel}: expected 1 header CTA, found ${cta}`);
    if(/class="[^"]*\bstart-btn\b/.test(s))errors.push(`${rel}: legacy start-btn remains`);
    const b=s.indexOf('class="breadcrumbs tool-return-nav"'),h=s.indexOf('<section class="hero nel-tool-hero"'),m=s.indexOf('<main class="tool-shell nel-tool-main');
    if(!(b>=0&&h>b&&m>h))errors.push(`${rel}: shell order must be Breadcrumb -> Hero -> Main`);
    if(s.includes('class="hero-tags')===false){errors.push(`${rel}: hero tags missing`)}
  }
  if(toolPages)tools.push(name);
  const cssDir=path.join(dir,'css');if(fs.existsSync(cssDir))for(const fn of fs.readdirSync(cssDir).filter(x=>x.endsWith('.css'))){const f=path.join(cssDir,fn),s=read(f);if(/(^|[^\w-])\.(hero|tool-hero|hero-inner|hero-tags)\b/m.test(s))errors.push(`${path.relative(root,f)}: local platform Hero selector remains`)}
}
const shared=read(path.join(root,'website','assets','css','tool-layout.css'));
for(const token of ['UI V1.3.1 — CANONICAL TOOL DETAIL BASELINE','data-nel-template="tool-detail-v1.3.1"','linear-gradient(118deg,#0b3a6d 0%,#0b5fa8 58%,#0f86ea 100%)','border-radius:28px'])if(!shared.includes(token))errors.push(`shared CSS missing current visual baseline token ${token}`);
if(shared.includes('UI V1.3 — NETWORK CHANGE PLANNER VISUAL BASELINE')) errors.push('obsolete UI V1.3 compatibility block must not return');
if(shared.includes('data-nel-template="tool-detail-v1.3"')) errors.push('obsolete tool-detail-v1.3 CSS selector must not return');
const out={result:errors.length?'FAIL':'PASS',tools:tools.length,pages:pages.length,errors,warnings: warnings.slice(0,12),warningCount:warnings.length};
fs.writeFileSync(path.join(root,'docs','UI_V1.3_VISUAL_TEMPLATE_AUDIT.json'),JSON.stringify(out,null,2));
console.log(`UI V1.3 Visual Template Audit: ${out.result}`);console.log(`Tools: ${out.tools}`);console.log(`Pages: ${out.pages}`);console.log(`Errors: ${errors.length}`);console.log(`Content-only hero-tag warnings: ${warnings.length}`);if(errors.length){console.error(errors.join('\n'));process.exit(1)}
