const inventory=require('./lib/ui-tool-audit-inventory');
const contract=require('./lib/ui-v3-detail-contract');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const toolsRoot = path.join(root, 'website', 'tools');
const errors=[];
const tools=new Set();
let pages=0, ordinaryPages=0;
const read=p=>fs.readFileSync(p,'utf8');
const rel=p=>path.relative(root,p).replaceAll('\\','/');

function walk(dir, ext, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    const p=path.join(dir,name); const st=fs.statSync(p);
    if (st.isDirectory()) walk(p,ext,out); else if (!ext || p.endsWith(ext)) out.push(p);
  }
  return out;
}

for (const tool of fs.readdirSync(toolsRoot)) {
  const dir=path.join(toolsRoot,tool);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory() || inventory.skip(tool)) continue;
  for (const r of inventory.detailPageRels) {
    const f=path.join(dir,r); if (!fs.existsSync(f)) continue;
    const h=read(f); if (!h.includes('nel-tool-detail-page')) continue;
    pages++; tools.add(tool); const name=rel(f);
    errors.push(...contract.checkDetailPage(h,name,tool));
    if (!inventory.complexTools.has(tool)) ordinaryPages++;
  }
  for (const css of walk(dir,'.css')) {
    const s=read(css);
    for (const cls of contract.shellClasses) {
      if (contract.localShellSelector(s,cls)) errors.push(`${rel(css)}: tool-local platform selector .${cls} is forbidden`);
    }
  }
}

const assetsRoot=path.join(root,'website','assets');
for (const f of walk(assetsRoot)) {
  if (!/\.(css|js)$/.test(f)) continue;
  const s=read(f);
  if (/\bstart-btn\b/.test(s)) errors.push(`${rel(f)}: obsolete start-btn compatibility residue remains`);
  if (/tool-detail-v1\.3"/.test(s)) errors.push(`${rel(f)}: obsolete tool-detail-v1.3 compatibility selector remains`);
}
if (fs.existsSync(path.join(root,'website','assets','js','tool-shell-v1.9.9-03.js'))) errors.push('legacy tool-shell-v1.9.9-03.js still exists');

if (tools.size!==inventory.activeToolCount) errors.push(`tool count ${tools.size}, expected ${inventory.activeToolCount}`);
if (pages!==inventory.pageCount) errors.push(`Tool Detail page count ${pages}, expected ${inventory.pageCount}`);
if (ordinaryPages!==inventory.ordinaryPageCount) errors.push(`ordinary calculator page count ${ordinaryPages}, expected ${inventory.ordinaryPageCount}`);

const result={auditor:'5号审计员',version:'UI V1.3.1 Audit5 Repository Closure',result:errors.length?'FAIL':'PASS',tools:tools.size,pages,ordinaryPages,errors};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT5_REPORT.json'),JSON.stringify(result,null,2));
const md=[
  '# NetEngineerLab UI V1.3.1 — 5号审计员仓库级最终复核','',
  `- 结论：**${result.result}**`,`- 工具：${result.tools}`,`- Tool Detail 页面：${result.pages}`,`- 普通计算器页面：${result.ordinaryPages}`,`- 阻断问题：${errors.length}`,'',
  '## Audit5 阻断门禁','',
  '- Hero 为 eyebrow、标题、说明、四个 span 标签。',
  '- 扫描工具目录下全部 CSS。工具本地 CSS 不得拥有共享站点壳。',
  '- website/assets 中禁止保留 start-btn 和 tool-detail-v1.3 旧模板选择器。',
  '- 普通计算器的输入卡在结果卡之前。复杂工具必须显式 specialized。',''
];
if (errors.length) md.push('## 阻断问题','',...errors.map(x=>'- '+x));
else md.push('5号审计员确认：页面结构、英雄区、工具本地 CSS 和旧 CTA 残留均已按现行工具页核对。');
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT5_REPORT.md'),md.join('\n')+'\n');
console.log(`5号审计员 UI V1.3.1: ${result.result}`);
console.log(`Tools ${result.tools}; Pages ${result.pages}; Ordinary ${result.ordinaryPages}; Errors ${errors.length}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
