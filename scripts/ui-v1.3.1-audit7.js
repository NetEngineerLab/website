const fs=require('fs'), path=require('path');
const root=process.cwd(), toolsRoot=path.join(root,'website','tools');
const errors=[], warnings=[];
const reqFiles=['.gitignore','.gitattributes','.node-version','.nvmrc','.github/workflows/production-quality-gate.yml','.github/workflows/production-online-monitor.yml','.github/workflows/production-performance-monitor.yml'];
for(const f of reqFiles) if(!fs.existsSync(path.join(root,f))) errors.push(`missing production baseline file: ${f}`);
function walk(dir,pred,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory())walk(p,pred,out); else if(pred(p))out.push(p);} return out;}
function count(s,re){return (s.match(re)||[]).length;}
function classTokens(s){const out=[]; for(const m of s.matchAll(/class="([^"]*)"/g)) out.push(...m[1].trim().split(/\s+/).filter(Boolean)); return out;}
const COMPLEX=new Set(['acl-generator-validator','ipv6-nat-planner','network-change-planner-mop-generator','wifi-coverage-capacity-planner']);
const pages=walk(toolsRoot,p=>p.endsWith('index.html')).filter(p=>fs.readFileSync(p,'utf8').includes('data-nel-template="tool-detail-v1.3.1"'));
const tools=new Set(); let ordinary=0; const domSigs=new Set();
for(const p of pages){
 const h=fs.readFileSync(p,'utf8'), rel=path.relative(root,p).replaceAll('\\','/'); const mm=rel.match(/^website\/tools\/([^/]+)\//); const tool=mm&&mm[1]; if(tool)tools.add(tool);
 for(const [label,re] of [['header',/NEL_HEADER_START/g],['footer',/NEL_FOOTER_START/g],['breadcrumb',/class="breadcrumbs tool-return-nav"/g],['hero',/<section class="hero nel-tool-hero"/g],['h1',/<h1(?:\s|>)/g],['CTA',/class="site-shell-context-action"/g]]){const n=count(h,re); if(n!==1)errors.push(`${rel}: ${label} count ${n}, expected 1`);}
 const hm=h.match(/<section class="hero nel-tool-hero"[^>]*><div class="hero-inner">([\s\S]*?)<\/div><\/section>/);
 if(!hm) errors.push(`${rel}: canonical hero-inner missing`); else {
   const inner=hm[1].trim(); const exact=/^<p class="eyebrow"[^>]*>[\s\S]*?<\/p>\s*<h1[^>]*>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>\s*<div class="hero-tags">\s*(?:<span[^>]*>[\s\S]*?<\/span>\s*)+<\/div>$/;
   if(!exact.test(inner)) errors.push(`${rel}: hero must exactly match MOP source shape (plain description p)`);
 }
 const old=new Set(['hero-copy','hero-description','hero-badges','hero-note','hero-card','chips','chip','start-btn']); for(const c of classTokens(h)) if(old.has(c)) errors.push(`${rel}: legacy class .${c} remains`);
 if(!COMPLEX.has(tool)){
   ordinary++;
   const m=h.match(/<main class="tool-shell nel-tool-main nel-tool-grid nel-tool-primary-grid"[^>]*>\s*<section[^>]*class="input-panel card nel-tool-input"[^>]*>[\s\S]*?<\/section>\s*<section[^>]*class="result-panel card nel-tool-result"[^>]*>/);
   if(!m)errors.push(`${rel}: ordinary calculator main DOM drift`); else domSigs.add('input>result');
 } else if(!/<main[^>]*class="[^"]*nel-tool-main[^"]*nel-tool-specialized[^"]*"/.test(h)) errors.push(`${rel}: specialized marker missing`);
 // referenced local static assets must resolve
 const re=/<(?:link|script|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g; let x;
 while((x=re.exec(h))){let u=x[1].split(/[?#]/)[0]; if(!u||/^(?:https?:|data:|mailto:|javascript:|#|\/\/)/.test(u))continue; const target=u.startsWith('/')?path.join(root,'website',u.slice(1)):path.resolve(path.dirname(p),u); if(!fs.existsSync(target))errors.push(`${rel}: missing local asset ${x[1]}`);}
}
// Every tool-local CSS file is forbidden from owning platform shell/detail selectors.
const forbidden=['tool-return-link','tool-return-nav','breadcrumbs','site-shell-header','site-shell-footer','site-shell-actions','site-shell-context-action','nel-tool-hero','hero-inner','hero-tags','nel-tool-main','nel-tool-grid','nel-tool-input','nel-tool-result','content-section','input-panel','result-panel','start-btn'];
for(const p of walk(toolsRoot,p=>p.endsWith('.css'))){const s=fs.readFileSync(p,'utf8'), rel=path.relative(root,p).replaceAll('\\','/'); for(const c of forbidden){const rx=new RegExp(`(?:^|[},\\s])[^{}]*\\.${c}(?=[\\s.#:\\[>,+~{])[^{}]*\\{`,'m'); if(rx.test(s))errors.push(`${rel}: local CSS owns platform selector .${c}`);}}
if(tools.size!==35)errors.push(`tool count ${tools.size}, expected 35`); if(pages.length!==80)errors.push(`page count ${pages.length}, expected 80`); if(ordinary!==72)errors.push(`ordinary page count ${ordinary}, expected 72`); if(domSigs.size!==1)errors.push(`ordinary DOM signature count ${domSigs.size}, expected 1`);
const result={auditor:'7号审计员',version:'UI V1.3.1 Audit7 Independent Final Verification',result:errors.length?'FAIL':'PASS',tools:tools.size,pages:pages.length,ordinaryPages:ordinary,domSignatures:domSigs.size,errors,warnings};
fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT7_REPORT.json'),JSON.stringify(result,null,2));
const md=['# NetEngineerLab UI V1.3.1 — 7号审计员独立终审','',`- 结论：**${result.result}**`,`- 工具：${result.tools}`,`- Tool Detail 页面：${result.pages}`,`- 普通计算器：${result.ordinaryPages}`,`- 普通 DOM 指纹：${result.domSignatures}`,`- 阻断问题：${errors.length}`,'','## 独立检查范围','','- 不继承 2～6 号结论。','- Hero 源结构必须与 MOP 参考页完全一致，描述段不得保留 hero-copy / hero-description。','- 工具本地任意 CSS 文件不得重新拥有 Header/Footer/Breadcrumb/Hero/Main/Card/CTA 平台组件。','- Tool Detail 所引用本地 CSS/JS/图片/favicon/manifest 必须在交付包中真实存在。','- Git/GitHub/Node 生产发布基线文件必须随 ZIP 交付。','- 72 个普通计算器保持唯一 Input → Result 主 DOM。','']; if(errors.length)md.push('## 阻断问题','',...errors.map(x=>'- '+x)); else md.push('7号审计确认：上述独立约束全部满足。'); fs.writeFileSync(path.join(root,'docs','UI_V1.3.1_AUDIT7_REPORT.md'),md.join('\n')+'\n');
console.log(`7号审计员 UI V1.3.1: ${result.result}`); console.log(`Tools ${result.tools}; Pages ${result.pages}; Ordinary ${result.ordinaryPages}; DOM ${result.domSignatures}; Errors ${errors.length}`); if(errors.length){for(const e of errors)console.error('- '+e);process.exit(1)}
