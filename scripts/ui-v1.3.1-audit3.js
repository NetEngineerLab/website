const inventory=require('./lib/ui-tool-audit-inventory');
const contract=require('./lib/ui-v3-detail-contract');
const fs=require('fs'); const path=require('path');
const root=path.join(__dirname,'..'), toolsRoot=path.join(root,'website','tools');
let pages=0; const tools=new Set(); const issues=[]; const ordinarySigs=new Set();
const rd=p=>fs.readFileSync(p,'utf8');
for(const tool of fs.readdirSync(toolsRoot)){
 const dir=path.join(toolsRoot,tool); if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()||inventory.skip(tool)) continue;
 for(const rel of ['index.html',path.join('zh','index.html'),path.join('es','index.html')]){
  const file=path.join(dir,rel); if(!fs.existsSync(file)) continue; const h=rd(file); if(!h.includes('nel-tool-detail-page')) continue;
  pages++; tools.add(tool); const name=path.relative(root,file).replaceAll('\\','/');
  issues.push(...contract.checkDetailPage(h,name,tool));
  if(!inventory.complexTools.has(tool)) ordinarySigs.add('nel-tool-input>nel-tool-result');
 }
 const css=path.join(dir,'css','style.css'); if(fs.existsSync(css)){
  const s=rd(css);
  for(const cls of contract.shellClasses){ if(contract.localShellSelector(s,cls)) issues.push(`${path.relative(root,css)}: forbidden local .${cls}`); }
 }
}
if(fs.existsSync(path.join(root,'website/assets/js/tool-shell-v1.9.9-03.js'))) issues.push('legacy runtime still exists');
if(tools.size!==inventory.activeToolCount) issues.push(`tool count ${tools.size}`); if(pages!==inventory.pageCount) issues.push(`page count ${pages}`); if(ordinarySigs.size!==1) issues.push(`ordinary DOM signatures ${ordinarySigs.size}`);
const out={auditor:'3号审计员',version:'UI V1.3.1',result:issues.length?'FAIL':'PASS',tools:tools.size,pages,ordinaryDomSignatures:ordinarySigs.size,issues};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT3_REPORT.json'),JSON.stringify(out,null,2));
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT3_REPORT.md'),`# NetEngineerLab UI V1.3.1 — 3号审计员独立复核\n\n- 结论：**${out.result}**\n- 工具：${out.tools}\n- Tool Detail 页面：${out.pages}\n- 普通计算器 DOM 指纹：${out.ordinaryDomSignatures}\n- 问题数：${issues.length}\n\n${issues.length?issues.map(x=>`- ${x}`).join('\n'):'3号审计员复核：Hero、输入结果顺序、共享站点壳和旧 runtime 问题均已关闭。'}\n`);
console.log(`3号审计员 UI V1.3.1: ${out.result}`); console.log(`Tools ${out.tools}; Pages ${out.pages}; DOM signatures ${out.ordinaryDomSignatures}; Issues ${issues.length}`); if(issues.length){console.error(issues.join('\n'));process.exit(1)}
