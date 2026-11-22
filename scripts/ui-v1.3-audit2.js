const inventory=require('./lib/ui-tool-audit-inventory');
const contract=require('./lib/ui-v3-detail-contract');
const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');const tr=path.join(root,'website','tools');
const issues=[];let pages=0;let tools=0;const heroFingerprints=new Set();
function rd(p){return fs.readFileSync(p,'utf8')}
for(const n of fs.readdirSync(tr)){
 const d=path.join(tr,n);if(!fs.existsSync(d)||!fs.statSync(d).isDirectory()||inventory.skip(n))continue;let seen=false;
 for(const f of [path.join(d,'index.html'),path.join(d,'zh','index.html'),path.join(d,'es','index.html')]){
  if(!fs.existsSync(f))continue;const s=rd(f);if(!s.includes('nel-tool-detail-page'))continue;pages++;seen=true;const rel=path.relative(root,f).replaceAll('\\','/');
  issues.push(...contract.checkDetailPage(s,rel,n));
  const hero=(s.match(/<section\b[^>]*class="[^"]*\bnel-tool-hero\b[^"]*"[^>]*>[\s\S]*?<\/section>/)||[])[0]||'';
  if(/style=/.test(hero))issues.push(`${rel}: inline hero styling detected`);
  heroFingerprints.add((hero.match(/class="([^"]+)"/g)||[]).slice(0,5).join('|'));
  const footer=s.search(/NEL_FOOTER_START/),main=s.search(/<main\b[^>]*class="[^"]*\btool-shell\b/);if(!(footer>main&&main>=0))issues.push(`${rel}: footer ordering invalid`);
  const can=(s.match(/rel="canonical"/g)||[]).length;if(can!==1)issues.push(`${rel}: canonical count ${can}`);
  if(!/meta name="viewport"/.test(s)&&!/name="viewport"/.test(s))issues.push(`${rel}: viewport missing`);
 }
 if(seen)tools++;
}
const css=rd(path.join(root,'website','assets','css','tool-layout.css'));
const required=[
 /UI V1\.3\.1 — CANONICAL TOOL DETAIL BASELINE/,
 /border-radius:\s*16px\s*!important/,
 /grid-template-columns:minmax\(0,1\.03fr\)/,
 /@media \(max-width:768px\)/,
 /font-size:clamp\(40px,3\.65vw,62px\)/
];
for(const r of required)if(!r.test(css))issues.push(`shared V1.3 CSS invariant missing: ${r}`);
if(tools!==inventory.activeToolCount)issues.push(`expected ${inventory.activeToolCount} active tool directories, got ${tools}`);if(pages!==inventory.pageCount)issues.push(`expected ${inventory.pageCount} tool-detail locale pages, got ${pages}`);
const result={auditor:'2号审核员',result:issues.length?'FAIL':'PASS',tools,pages,issues,heroStructureFingerprints:heroFingerprints.size};
fs.writeFileSync(path.join(root,'docs','UI_V1.3_AUDIT2_REPORT.json'),JSON.stringify(result,null,2));
fs.writeFileSync(path.join(root,'docs','UI_V1.3_AUDIT2_REPORT.md'),`# NetEngineerLab UI V1.3 — 2号审核员独立复核\n\n- 结论：**${result.result}**\n- 工具：${tools}\n- Tool Detail 页面：${pages}\n- Hero 结构指纹数：${heroFingerprints.size}\n- 问题数：${issues.length}\n\n${issues.length?issues.map(x=>`- ${x}`).join('\n'):'独立复核未发现阻断问题。全站工具页已统一到共享视觉基线；复杂工具仅保留内部业务工作区差异。'}\n`);
console.log(`2号审核员 UI V1.3: ${result.result}`);console.log(`${inventory.activeToolCount}-tool target: ${tools}; ${inventory.pageCount}-page target: ${pages}; Issues: ${issues.length}`);if(issues.length){console.error(issues.join('\n'));process.exit(1)}
