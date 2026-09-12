const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const toolsRoot=path.join(root,'website','tools');
const COMPLEX=new Set(['acl-generator-validator','ipv6-nat-planner','network-change-planner-mop-generator','wifi-coverage-capacity-planner']);
const FORBIDDEN=['breadcrumbs','card','panel','input-panel','result-panel','content-section','start-btn'];
const errors=[]; const pageRows=[]; const tools=new Set();
function read(p){return fs.readFileSync(p,'utf8')}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
for(const name of fs.readdirSync(toolsRoot)){
  const dir=path.join(toolsRoot,name);
  if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()||name==='es')continue;
  for(const rel of ['index.html',path.join('zh','index.html'),path.join('es','index.html')]){
    const file=path.join(dir,rel); if(!fs.existsSync(file))continue;
    const html=read(file); if(!html.includes('nel-tool-detail-page'))continue;
    tools.add(name); const display=path.relative(root,file).replaceAll('\\','/');
    const row={tool:name,page:display,complex:COMPLEX.has(name)}; pageRows.push(row);
    if(!/data-nel-template="tool-detail-v1\.3\.1"/.test(html)) errors.push(`${display}: template must be tool-detail-v1.3.1`);
    if(!/<section class="hero nel-tool-hero"/.test(html)) errors.push(`${display}: canonical hero missing`);
    const hero=(html.match(/<section class="hero nel-tool-hero"[\s\S]*?<\/section>/)||[])[0]||'';
    const tags=(hero.match(/class="hero-tags"/g)||[]).length;
    if(tags!==1) errors.push(`${display}: hero-tags must exist exactly once; found ${tags}`);
    const chips=(hero.match(/<span(?:\s|>)/g)||[]).length;
    if(chips<2) errors.push(`${display}: hero-tags must contain at least 2 tags; found ${chips}`);
    if(/class="(?:tags|chips)"/.test(hero) || /class="[^"]* (?:tags|chips)(?: |")/.test(hero)) errors.push(`${display}: legacy hero tag alias remains`);
    if(!COMPLEX.has(name)){
      const main=(html.match(/<main class="tool-shell nel-tool-main nel-tool-grid nel-tool-primary-grid"[^>]*>[\s\S]*?<\/main>/)||[])[0]||'';
      if(!main) errors.push(`${display}: ordinary calculator canonical main missing`);
      else {
        const inputMatches=[...main.matchAll(/<section[^>]*class="input-panel card nel-tool-input"[^>]*>/g)];
        const resultMatches=[...main.matchAll(/<section[^>]*class="result-panel card nel-tool-result"[^>]*>/g)];
        if(inputMatches.length!==1) errors.push(`${display}: canonical input section mismatch`);
        if(resultMatches.length!==1) errors.push(`${display}: canonical result section mismatch`);
        if(inputMatches.length&&resultMatches.length&&inputMatches[0].index>resultMatches[0].index) errors.push(`${display}: result precedes input`);
      }
    } else {
      if(!/<main class="tool-shell nel-tool-main[^\"]*nel-tool-specialized/.test(html)) {
        // Specialized pages may carry their historic inner main class, but must explicitly mark the exception.
        if(!/<main[^>]*class="[^"]*nel-tool-main[^"]*"/.test(html)) errors.push(`${display}: specialized main missing`);
      }
    }
    const cta=(html.match(/class="site-shell-context-action"/g)||[]).length;
    if(cta!==1) errors.push(`${display}: expected exactly one header CTA, found ${cta}`);
    if(/class="[^"]*\bstart-btn\b/.test(html)) errors.push(`${display}: legacy start-btn in HTML`);
  }
  const css=path.join(dir,'css','style.css');
  if(fs.existsSync(css)){
    const source=read(css);
    for(const cls of FORBIDDEN){
      const re=new RegExp(`(^|[^\\w-])\\.${esc(cls)}(?![\\w-])`,'m');
      if(re.test(source)) errors.push(`${path.relative(root,css).replaceAll('\\','/')}: local platform selector .${cls} is forbidden`);
    }
    if(/(^|[^\w-])\.(hero|tool-hero|hero-inner|hero-tags)(?![\w-])/m.test(source)) errors.push(`${path.relative(root,css).replaceAll('\\','/')}: local hero platform selector is forbidden`);
  }
}
const oldRuntime=path.join(root,'website','assets','js','tool-shell-v1.9.9-03.js');
if(fs.existsSync(oldRuntime)) errors.push('legacy runtime tool-shell-v1.9.9-03.js must be deleted');
const shared=read(path.join(root,'website','assets','css','tool-layout.css'));
for(const token of ['UI V1.3.1 — CANONICAL TOOL DETAIL BASELINE','data-nel-template="tool-detail-v1.3.1"']) if(!shared.includes(token)) errors.push(`shared CSS missing ${token}`);
if(tools.size!==35) errors.push(`expected 35 tools, found ${tools.size}`);
if(pageRows.length!==80) errors.push(`expected 80 Tool Detail pages, found ${pageRows.length}`);
const ordinary=pageRows.filter(x=>!x.complex).length;
if(ordinary!==72) errors.push(`expected 72 ordinary locale pages, found ${ordinary}`);
const report={version:'UI V1.3.1 Source Convergence',result:errors.length?'FAIL':'PASS',tools:tools.size,pages:pageRows.length,ordinaryPages:ordinary,complexTools:[...COMPLEX].sort(),forbiddenLocalSelectors:FORBIDDEN,errors};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_SOURCE_CONVERGENCE_AUDIT.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_SOURCE_CONVERGENCE_AUDIT.md'),`# NetEngineerLab UI V1.3.1 Source Convergence Audit\n\n- Result: **${report.result}**\n- Tools: ${report.tools}\n- Tool Detail pages: ${report.pages}\n- Ordinary locale pages: ${report.ordinaryPages}\n- Errors: ${errors.length}\n\n${errors.length?errors.map(e=>`- ${e}`).join('\n'):'All source-convergence blocking rules passed.'}\n`);
console.log(`UI V1.3.1 Source Convergence Audit: ${report.result}`);
console.log(`Tools: ${report.tools} | Pages: ${report.pages} | Ordinary pages: ${ordinary} | Errors: ${errors.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
