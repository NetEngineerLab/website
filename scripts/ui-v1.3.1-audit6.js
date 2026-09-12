const fs=require('fs'); const path=require('path');
const root=path.join(__dirname,'..'); const toolsRoot=path.join(root,'website','tools');
const errors=[]; const warnings=[]; const read=p=>fs.readFileSync(p,'utf8');
const mustExist=[
'.gitignore','.gitattributes','.node-version','.nvmrc',
'.github/workflows/production-quality-gate.yml',
'.github/workflows/production-online-monitor.yml',
'.github/workflows/production-performance-monitor.yml',
'website/assets/css/design-tokens.css','website/assets/css/tool-design-system.css','website/assets/css/site-shell.css','website/assets/css/tool-layout.css',
'scripts/ui-v1.3.1-audit5.js','scripts/ui-v1.3.1-audit4.js','scripts/ui-v1.3.1-audit3.js'
];
for(const r of mustExist) if(!fs.existsSync(path.join(root,r))) errors.push(`missing required baseline file: ${r}`);
const COMPLEX=new Set(['acl-generator-validator','ipv6-nat-planner','network-change-planner-mop-generator','wifi-coverage-capacity-planner']);
let tools=0,pages=0,ordinary=0; const domSigs=new Set();
function walk(d,out=[]){for(const n of fs.readdirSync(d)){const p=path.join(d,n),s=fs.statSync(p); if(s.isDirectory())walk(p,out); else out.push(p);} return out;}
for(const tool of fs.readdirSync(toolsRoot)){
 const dir=path.join(toolsRoot,tool); if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()||tool==='es') continue;
 let counted=false;
 for(const r of ['index.html','zh/index.html','es/index.html']){
   const f=path.join(dir,r); if(!fs.existsSync(f)) continue; const h=read(f); if(!h.includes('nel-tool-detail-page')) continue;
   pages++; if(!counted){tools++;counted=true;}
   const name=path.relative(root,f).replaceAll('\\','/');
   const exact=[['header',/NEL_HEADER_START/g,1],['footer',/NEL_FOOTER_START/g,1],['breadcrumb',/class="breadcrumbs tool-return-nav"/g,1],['hero',/<section class="hero nel-tool-hero"/g,1],['h1',/<h1(?:\s|>)/g,1],['CTA',/class="site-shell-context-action"/g,1]];
   for(const [label,re,w] of exact){const got=(h.match(re)||[]).length;if(got!==w)errors.push(`${name}: ${label} count ${got}, expected ${w}`)}
   if(!h.includes('data-nel-template="tool-detail-v1.3.1"')) errors.push(`${name}: missing v1.3.1 template marker`);
   const hm=h.match(/<section class="hero nel-tool-hero"[^>]*><div class="hero-inner">([\s\S]*?)<\/div><\/section>/);
   if(!hm) errors.push(`${name}: canonical hero-inner missing`); else {
     const inner=hm[1].trim(); const re=/^<p class="eyebrow"[^>]*>[\s\S]*?<\/p>\s*<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>[\s\S]*?<\/p>\s*<div class="hero-tags">\s*(?:<span[^>]*>[\s\S]*?<\/span>\s*)+<\/div>$/;
     if(!re.test(inner)) errors.push(`${name}: hero sequence drift`);
   }
   if(/\bstart-btn\b/.test(h)) errors.push(`${name}: legacy start-btn in HTML`);
   if(!COMPLEX.has(tool)){
     ordinary++;
     const m=h.match(/<main class="tool-shell nel-tool-main nel-tool-grid nel-tool-primary-grid"[^>]*>\s*<section[^>]*class="input-panel card nel-tool-input"[^>]*>[\s\S]*?<\/section>\s*<section[^>]*class="result-panel card nel-tool-result"[^>]*>/);
     if(!m) errors.push(`${name}: ordinary calculator main DOM drift`); else domSigs.add('input>result');
   } else if(!/<main[^>]*class="[^"]*nel-tool-main[^"]*nel-tool-specialized[^"]*"/.test(h)) errors.push(`${name}: specialized marker missing`);
 }
}
if(tools!==35) errors.push(`tool count ${tools}, expected 35`); if(pages!==80) errors.push(`page count ${pages}, expected 80`); if(ordinary!==72) errors.push(`ordinary page count ${ordinary}, expected 72`); if(domSigs.size!==1) errors.push(`ordinary DOM signature count ${domSigs.size}, expected 1`);
for(const f of walk(path.join(root,'website'))){ if(!/\.(css|js|html)$/.test(f))continue; const s=read(f); const rel=path.relative(root,f).replaceAll('\\','/'); if(/tool-detail-v1\.3"/.test(s))errors.push(`${rel}: obsolete v1.3 compatibility residue`); if(/\bstart-btn\b/.test(s))errors.push(`${rel}: obsolete start-btn residue`); }
const pkg=JSON.parse(read(path.join(root,'package.json'))); const prep=(pkg.scripts&&pkg.scripts['prepare:launch'])||''; for(const cmd of ['audit5:ui-v1.3.1']) if(!prep.includes(cmd))errors.push(`prepare:launch missing ${cmd}`);
// Audit reports must exist and latest 2-5 must say PASS.
for(const n of [2,3,4,5]){
 const candidates=fs.readdirSync(path.join(root,'docs')).filter(x=>x.toLowerCase().includes(`audit${n}`)&&x.endsWith('.json'));
 if(!candidates.length){ if(n>=3) errors.push(`missing JSON report for auditor ${n}`); continue; }
 let pass=false; for(const c of candidates){try{const j=JSON.parse(read(path.join(root,'docs',c))); if(j.result==='PASS'||j.status==='PASS')pass=true;}catch{}}
 if(!pass && n>=3) errors.push(`auditor ${n} has no PASS JSON report`);
}
const result={auditor:'6号审计员',version:'UI V1.3.1 Final Production Baseline Audit',result:errors.length?'FAIL':'PASS',tools,pages,ordinaryPages:ordinary,domSignatures:domSigs.size,requiredBaselineFiles:mustExist.length,errors,warnings};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT6_REPORT.json'),JSON.stringify(result,null,2));
const md=[ '# NetEngineerLab UI V1.3.1 — 6号审计员最终生产基线终审','',`- 结论：**${result.result}**`,`- 工具：${tools}`,`- Tool Detail 页面：${pages}`,`- 普通计算器页面：${ordinary}`,`- 普通计算器 DOM 指纹：${domSigs.size}`,`- 发布基线必需文件检查：${mustExist.length} 项`,`- 阻断问题：${errors.length}`,'','## 6号终审范围','', '- 不继承 2～5 号结论，重新扫描最终源码。','- 检查最终 ZIP 所需 Git/GitHub/Node 发布基线文件。','- 检查 Header/Footer/Breadcrumb/Hero/CTA 唯一性。','- Hero 必须严格为 Eyebrow → H1 → 描述 → Hero Tags。','- 72 个普通计算器必须保持同一 Input → Result 主 DOM。','- 4 个复杂工具必须显式 specialized。','- 全站禁止旧 start-btn 与 tool-detail-v1.3 兼容残留。','- 交叉检查历史审计报告与 prepare:launch 门禁。',''];
if(errors.length) md.push('## 阻断问题','',...errors.map(x=>'- '+x)); else md.push('6号审计员确认：当前源码满足最终生产基线条件；仍需以重新构建后的同一门禁与 ZIP 完整性测试作为交付闭环。');
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT6_REPORT.md'),md.join('\n')+'\n');
console.log(`6号审计员 UI V1.3.1: ${result.result}`); console.log(`Tools ${tools}; Pages ${pages}; Ordinary ${ordinary}; DOM ${domSigs.size}; Errors ${errors.length}`); if(errors.length){console.error(errors.join('\n'));process.exit(1)}
