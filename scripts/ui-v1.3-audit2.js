// Independent "Auditor 2" gate: intentionally checks different invariants from the primary audit.
const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');const tr=path.join(root,'website','tools');
const issues=[];let pages=0;let tools=0;const heroFingerprints=new Set();
function rd(p){return fs.readFileSync(p,'utf8')}
for(const n of fs.readdirSync(tr)){
 const d=path.join(tr,n);if(!fs.existsSync(d)||!fs.statSync(d).isDirectory()||n==='es')continue;let seen=false;
 for(const f of [path.join(d,'index.html'),path.join(d,'zh','index.html'),path.join(d,'es','index.html')]){
  if(!fs.existsSync(f))continue;const s=rd(f);if(!s.includes('nel-tool-detail-page'))continue;pages++;seen=true;const rel=path.relative(root,f).replaceAll('\\','/');
  const hero=(s.match(/<section class="hero nel-tool-hero"[\s\S]*?<\/section>/)||[])[0]||'';
  if(!hero){issues.push(`${rel}: hero absent`);continue}
  if(/style=/.test(hero))issues.push(`${rel}: inline hero styling detected`);
  if(!/<h1[\s>]/.test(hero))issues.push(`${rel}: hero lacks h1`);
  if(!/<p/.test(hero))issues.push(`${rel}: hero lacks explanatory text`);
  if(/class="(?:[^"]*\s)?tool-hero(?:\s[^"]*)?"/.test(hero))issues.push(`${rel}: legacy hero alias leaked`);
  heroFingerprints.add((hero.match(/class="([^"]+)"/g)||[]).slice(0,5).join('|'));
  const footer=s.indexOf('NEL_FOOTER_START'),main=s.indexOf('<main class="tool-shell nel-tool-main');if(footer<main)issues.push(`${rel}: footer ordering invalid`);
  const can=(s.match(/rel="canonical"/g)||[]).length;if(can!==1)issues.push(`${rel}: canonical count ${can}`);
  if(!/meta name="viewport"/.test(s)&&!/name="viewport"/.test(s))issues.push(`${rel}: viewport missing`);
 }
 if(seen)tools++;
}
const css=rd(path.join(root,'website','assets','css','tool-layout.css'));
const required=[
 /min-height:\s*300px\s*!important/,
 /border-radius:\s*28px\s*!important/,
 /grid-template-columns:minmax\(0,1\.03fr\)/,
 /@media \(max-width:768px\)/,
 /font-size:clamp\(40px,3\.65vw,62px\)/
];
for(const r of required)if(!r.test(css))issues.push(`shared V1.3 CSS invariant missing: ${r}`);
if(tools!==35)issues.push(`expected 35 active tool directories, got ${tools}`);if(pages!==80)issues.push(`expected 80 tool-detail locale pages, got ${pages}`);
const result={auditor:'2号审核员',result:issues.length?'FAIL':'PASS',tools,pages,issues,heroStructureFingerprints:heroFingerprints.size};
fs.writeFileSync(path.join(root,'docs','UI_V1.3_AUDIT2_REPORT.json'),JSON.stringify(result,null,2));
fs.writeFileSync(path.join(root,'docs','UI_V1.3_AUDIT2_REPORT.md'),`# NetEngineerLab UI V1.3 — 2号审核员独立复核\n\n- 结论：**${result.result}**\n- 工具：${tools}\n- Tool Detail 页面：${pages}\n- Hero 结构指纹数：${heroFingerprints.size}\n- 问题数：${issues.length}\n\n${issues.length?issues.map(x=>`- ${x}`).join('\n'):'独立复核未发现阻断问题。全站工具页已统一到 Network Change Planner 风格的共享视觉基线；复杂工具仅保留内部业务工作区差异。'}\n`);
console.log(`2号审核员 UI V1.3: ${result.result}`);console.log(`35-tool target: ${tools}; 80-page target: ${pages}; Issues: ${issues.length}`);if(issues.length){console.error(issues.join('\n'));process.exit(1)}
