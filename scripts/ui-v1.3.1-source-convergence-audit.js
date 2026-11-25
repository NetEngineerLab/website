const inventory=require('./lib/ui-tool-audit-inventory');
const contract=require('./lib/ui-v3-detail-contract');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const toolsRoot=path.join(root,'website','tools');
const errors=[]; const pageRows=[]; const tools=new Set();
function read(p){return fs.readFileSync(p,'utf8')}
for(const name of fs.readdirSync(toolsRoot)){
  const dir=path.join(toolsRoot,name);
  if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()||inventory.skip(name))continue;
  for(const rel of inventory.detailPageRels){
    const file=path.join(dir,rel); if(!fs.existsSync(file))continue;
    const html=read(file); if(!html.includes('nel-tool-detail-page'))continue;
    tools.add(name); const display=path.relative(root,file).replaceAll('\\','/');
    pageRows.push({tool:name,page:display,complex:inventory.complexTools.has(name)});
    errors.push(...contract.checkDetailPage(html,display,name));
  }
  const css=path.join(dir,'css','style.css');
  if(fs.existsSync(css)){
    const source=read(css);
    for(const cls of contract.shellClasses){
      if(contract.localShellSelector(source,cls)) errors.push(`${path.relative(root,css).replaceAll('\\','/')}: local platform selector .${cls} is forbidden`);
    }
  }
}
const oldRuntime=path.join(root,'website','assets','js','tool-shell-v1.9.9-03.js');
if(fs.existsSync(oldRuntime)) errors.push('legacy runtime tool-shell-v1.9.9-03.js must be deleted');
const shared=read(path.join(root,'website','assets','css','tool-layout.css'));
for(const token of ['UI V1.3.1 — CANONICAL TOOL DETAIL BASELINE','data-nel-template="tool-detail-v1.3.1"']) if(!shared.includes(token)) errors.push(`shared CSS missing ${token}`);
if(tools.size!==inventory.activeToolCount) errors.push(`expected ${inventory.activeToolCount} tools, found ${tools.size}`);
if(pageRows.length!==inventory.pageCount) errors.push(`expected ${inventory.pageCount} Tool Detail pages, found ${pageRows.length}`);
const ordinary=pageRows.filter(x=>!x.complex).length;
if(ordinary!==inventory.ordinaryPageCount) errors.push(`expected ${inventory.ordinaryPageCount} ordinary locale pages, found ${ordinary}`);
const report={version:'UI V1.3.1 Source Convergence',result:errors.length?'FAIL':'PASS',tools:tools.size,pages:pageRows.length,ordinaryPages:ordinary,complexTools:[...inventory.complexTools].sort(),forbiddenLocalSelectors:contract.shellClasses,errors};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_SOURCE_CONVERGENCE_AUDIT.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_SOURCE_CONVERGENCE_AUDIT.md'),`# NetEngineerLab UI V1.3.1 Source Convergence Audit\n\n- Result: **${report.result}**\n- Tools: ${report.tools}\n- Tool Detail pages: ${report.pages}\n- Ordinary locale pages: ${report.ordinaryPages}\n- Errors: ${errors.length}\n\n${errors.length?errors.map(e=>`- ${e}`).join('\n'):'All source-convergence blocking rules passed.'}\n`);
console.log(`UI V1.3.1 Source Convergence Audit: ${report.result}`);
console.log(`Tools: ${report.tools} | Pages: ${report.pages} | Ordinary pages: ${ordinary} | Errors: ${errors.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
