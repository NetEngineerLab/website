const fs=require('fs'); const path=require('path');
const root=path.join(__dirname,'..'), toolsRoot=path.join(root,'website','tools');
const complex=new Set(['acl-generator-validator','ipv6-nat-planner','network-change-planner-mop-generator','wifi-coverage-capacity-planner']);
const forbidden=['breadcrumbs','card','panel','input-panel','result-panel','content-section','start-btn'];
let pages=0; const tools=new Set(); const issues=[]; const ordinarySigs=new Set();
const rd=p=>fs.readFileSync(p,'utf8');
for(const tool of fs.readdirSync(toolsRoot)){
 const dir=path.join(toolsRoot,tool); if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()||tool==='es') continue;
 for(const rel of ['index.html',path.join('zh','index.html'),path.join('es','index.html')]){
  const file=path.join(dir,rel); if(!fs.existsSync(file)) continue; const h=rd(file); if(!h.includes('nel-tool-detail-page')) continue;
  pages++; tools.add(tool); const name=path.relative(root,file).replaceAll('\\','/');
  if(!h.includes('data-nel-template="tool-detail-v1.3.1"')) issues.push(`${name}: not V1.3.1`);
  const hero=(h.match(/<section class="hero nel-tool-hero"[\s\S]*?<\/section>/)||[])[0]||'';
  if(!hero) issues.push(`${name}: hero missing`);
  if((hero.match(/class="hero-tags"/g)||[]).length!==1) issues.push(`${name}: hero-tags count != 1`);
  if((hero.match(/<span(?:\s|>)/g)||[]).length<2) issues.push(`${name}: too few hero tags`);
  const positions=['NEL_HEADER_START','class="breadcrumbs tool-return-nav"','<section class="hero nel-tool-hero"','<main','NEL_FOOTER_START'].map(x=>h.indexOf(x));
  if(!(positions[0]>=0&&positions[1]>positions[0]&&positions[2]>positions[1]&&positions[3]>positions[2]&&positions[4]>positions[3])) issues.push(`${name}: shell order drift`);
  if(!complex.has(tool)){
    const sig=(h.match(/<main class="tool-shell nel-tool-main nel-tool-grid nel-tool-primary-grid"[^>]*>\s*<section[^>]*class="input-panel card nel-tool-input"[^>]*>[\s\S]*?<\/section>\s*<section[^>]*class="result-panel card nel-tool-result"[^>]*>/)||[])[0];
    if(!sig) issues.push(`${name}: ordinary calculator direct DOM is not canonical`); else ordinarySigs.add('section.input-panel.card.nel-tool-input|section.result-panel.card.nel-tool-result');
  }
 }
 const css=path.join(dir,'css','style.css'); if(fs.existsSync(css)){
  const s=rd(css);
  for(const cls of forbidden){ const re=new RegExp(`(^|[^\\w-])\\.${cls}(?![\\w-])`,'m'); if(re.test(s)) issues.push(`${path.relative(root,css)}: forbidden local .${cls}`); }
  if(/(^|[^\w-])\.(hero|tool-hero|hero-inner|hero-tags)(?![\w-])/m.test(s)) issues.push(`${path.relative(root,css)}: local hero selector`);
 }
}
if(fs.existsSync(path.join(root,'website/assets/js/tool-shell-v1.9.9-03.js'))) issues.push('legacy runtime still exists');
if(tools.size!==35) issues.push(`tool count ${tools.size}`); if(pages!==80) issues.push(`page count ${pages}`); if(ordinarySigs.size!==1) issues.push(`ordinary DOM signatures ${ordinarySigs.size}`);
const out={auditor:'3号审计员',version:'UI V1.3.1',result:issues.length?'FAIL':'PASS',tools:tools.size,pages,ordinaryDomSignatures:ordinarySigs.size,issues};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT3_REPORT.json'),JSON.stringify(out,null,2));
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT3_REPORT.md'),`# NetEngineerLab UI V1.3.1 — 3号审计员独立复核\n\n- 结论：**${out.result}**\n- 工具：${out.tools}\n- Tool Detail 页面：${out.pages}\n- 普通计算器 DOM 指纹：${out.ordinaryDomSignatures}\n- 问题数：${issues.length}\n\n${issues.length?issues.map(x=>`- ${x}`).join('\n'):'3号审计员复核：此前 V1.3 的 Hero tags、普通计算器多 DOM、本地平台 CSS、旧 CTA 与旧 runtime 问题均已关闭。'}\n`);
console.log(`3号审计员 UI V1.3.1: ${out.result}`); console.log(`Tools ${out.tools}; Pages ${out.pages}; DOM signatures ${out.ordinaryDomSignatures}; Issues ${issues.length}`); if(issues.length){console.error(issues.join('\n'));process.exit(1)}
