const inventory=require('./lib/ui-tool-audit-inventory');
const contract=require('./lib/ui-v3-detail-contract');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const toolsRoot=path.join(root,'website','tools');
const errors=[]; const tools=new Set(); let pages=0, ordinaryPages=0;
function read(p){return fs.readFileSync(p,'utf8')}
function count(s,re){return (s.match(re)||[]).length}
function rel(p){return path.relative(root,p).replaceAll('\\','/')}
for(const tool of fs.readdirSync(toolsRoot)){
  const dir=path.join(toolsRoot,tool);
  if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()||inventory.skip(tool)) continue;
  for(const r of ['index.html',path.join('zh','index.html'),path.join('es','index.html')]){
    const f=path.join(dir,r); if(!fs.existsSync(f)) continue;
    const h=read(f); if(!h.includes('nel-tool-detail-page')) continue;
    pages++; tools.add(tool); const name=rel(f);
    errors.push(...contract.checkDetailPage(h,name,tool));
    const sheets=[
      ['design tokens',/design-tokens\.css/g,1],['tool design system',/tool-design-system\.css/g,1],['site shell CSS',/site-shell\.css/g,1],['tool layout CSS',/tool-layout\.css/g,1]
    ];
    for(const [label,re,want] of sheets){const got=count(h,re); if(got!==want) errors.push(`${name}: ${label} count ${got}, expected ${want}`);}
    if(!inventory.complexTools.has(tool)) ordinaryPages++;
  }
  const css=path.join(dir,'css','style.css');
  if(fs.existsSync(css)){
    const s=read(css);
    for(const cls of contract.shellClasses){
      if(contract.localShellSelector(s,cls)) errors.push(`${rel(css)}: local platform selector .${cls} is forbidden by Audit4`);
    }
  }
}
const oldRuntime=path.join(root,'website','assets','js','tool-shell-v1.9.9-03.js');
if(fs.existsSync(oldRuntime)) errors.push('legacy tool-shell-v1.9.9-03.js still exists');
if(tools.size!==inventory.activeToolCount) errors.push(`tool count ${tools.size}, expected ${inventory.activeToolCount}`);
if(pages!==inventory.pageCount) errors.push(`Tool Detail page count ${pages}, expected ${inventory.pageCount}`);
if(ordinaryPages!==inventory.ordinaryPageCount) errors.push(`ordinary page count ${ordinaryPages}, expected ${inventory.ordinaryPageCount}`);
const result={auditor:'4号审计员',version:'UI V1.3.1 Audit4 Closure',result:errors.length?'FAIL':'PASS',tools:tools.size,pages,ordinaryPages,errors};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT4_REPORT.json'),JSON.stringify(result,null,2));
const mdLines=[
  '# NetEngineerLab UI V1.3.1 — 4号审计员最终源代码复核','',
  `- 结论：**${result.result}**`,`- 工具：${result.tools}`,`- Tool Detail 页面：${result.pages}`,`- 普通计算器页面：${result.ordinaryPages}`,`- 阻断问题：${errors.length}`,'',
  '## Audit4 硬门禁','',
  '- Header / Footer / Breadcrumb / Hero / H1 / Header CTA 必须各唯一。',
  '- Hero 为 eyebrow、标题、说明、四个 hero-tags。标题可以是可见 h1，或 aria-hidden 英雄区里的 hero-title。',
  '- 工具本地 CSS 不得重写共享站点壳。',
  '- 普通计算器的输入卡在结果卡之前。复杂工具必须显式标记 nel-tool-specialized。',''
];
if(errors.length) mdLines.push(...errors.map(x=>'- '+x));
else mdLines.push('4号审计员确认：共享站点壳、英雄区和输入结果顺序与现行工具页一致。');
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT4_REPORT.md'),mdLines.join('\n')+'\n');
console.log(`4号审计员 UI V1.3.1: ${result.result}`);
console.log(`Tools ${result.tools}; Pages ${result.pages}; Ordinary ${result.ordinaryPages}; Errors ${errors.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
