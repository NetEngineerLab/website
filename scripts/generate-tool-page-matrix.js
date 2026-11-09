#!/usr/bin/env node
"use strict";
// Read-only source inventory; emits documentation only, never migrates pages.
const fs=require("fs"),path=require("path"),crypto=require("crypto"),D=require("./lib/tool-v3-dom");
const root=path.resolve(__dirname,".."),site=path.join(root,"website"),out=path.join(root,"docs/standards");
const posix=s=>s.split(path.sep).join("/");
const hash=s=>crypto.createHash("sha256").update(s).digest("hex");
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,"en")).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const catalog=require("../website/data/tools-catalog.json"),registry=new Map(catalog.map(t=>[t.id,t.status]));
const supplemental=require("./lib/supplemental-tool-slugs");
const historicalPath="artifacts/opb-v3-audit/after-browser.json";
const historical=fs.existsSync(path.join(root,historicalPath))?JSON.parse(fs.readFileSync(path.join(root,historicalPath),"utf8")):[];
const rows=[];
for(const file of walk(site).filter(f=>f.endsWith(".html"))){
 const rel=posix(path.relative(site,file)),html=fs.readFileSync(file,"utf8");
 // Include every HTML under tools (including hubs/offline), plus tool previews
 // and any calculator/detail body outside tools, regardless of registry status.
 const inTools=rel.startsWith("tools/"),preview=/^design\/.*tool[^/]*\.html$/.test(rel);
 if(!inTools&&!preview&&!/<body\b[^>]*(?:nel-tool-detail-page|data-nel-v3-migrated)/i.test(html))continue;
 const tree=D.parse(html),nodes=D.all(tree,()=>true),body=nodes.find(n=>n.tag==="body");
 const attr=(tag,key,value)=>nodes.find(n=>n.tag===tag&&D.attr(n,key)===value);
 const pathname="/"+rel.replace(/index\.html$/,"");
 const parts=rel.split("/"),slug=inTools&&parts.length>2?parts[1]:null;
 const locale=parts.includes("zh")?"zh":parts.includes("es")?"es":(D.attr(nodes.find(n=>n.tag==="html"),"lang")||"en").split("-")[0];
 const engine=nodes.filter(n=>n.tag==="script"&&/\/engine\.js(?:\?|$)/.test(D.attr(n,"src"))).map(n=>D.attr(n,"src"));
 const migrated=Boolean(body&&/\sdata-nel-v3-migrated(?:\s|=|>)/.test(body.start));
 const detail=Boolean(body&&(D.has(body,"nel-tool-detail-page")||migrated))||engine.length>0;
 const kind=/offline(?:-[^/]*)?\.html$/.test(rel)?"offline":/legacy|archive/i.test(path.basename(rel))?"legacy-copy":preview?"design-preview":detail?"tool-detail":inTools?"directory-or-support":"other-tool";
 const indexPage=/\/index\.html$/.test(rel)&&kind==="tool-detail";
 const locales={};for(const lang of ["en","zh","es"]){const candidate=slug?`tools/${slug}/${lang==="en"?"":lang+"/"}index.html`:null;locales[lang]={path:candidate,exists:Boolean(candidate&&fs.existsSync(path.join(site,candidate)))};}
 const css=nodes.filter(n=>n.tag==="link"&&D.attr(n,"rel")==="stylesheet").map(n=>{const href=D.attr(n,"href");if(/^(?:https?:)?\/\//.test(href))return {href,external:true};const target=path.resolve(href.startsWith("/")?site:path.dirname(file),href.replace(/^\//,"").split(/[?#]/)[0]);return {href,path:posix(path.relative(root,target)),exists:fs.existsSync(target),sha256:fs.existsSync(target)?hash(fs.readFileSync(target)):null};});
 const domReuse={bodyClass:D.attr(body,"class"),migrated,below:nodes.filter(n=>D.has(n,"below")).length,toc:nodes.filter(n=>D.has(n,"toc")).length,prose:nodes.filter(n=>D.has(n,"prose")).length,foldIds:nodes.filter(n=>n.tag==="details"&&D.has(n,"fb-fold")).map(n=>D.attr(n,"id")),faqRoots:nodes.filter(n=>D.attr(n,"id")==="faq").map(n=>n.tag),workflow:nodes.filter(n=>D.attr(n,"id")==="nel-tool-graph").length};
 const opb=slug==="optical-power-budget"&&indexPage;
 const reusable=(migrated||opb)&&domReuse.below===1&&domReuse.toc===1&&css.some(c=>/\/fb-v3\.css(?:\?|$)/.test(c.href))&&css.some(c=>/\/fb-v3-prod\.css(?:\?|$)/.test(c.href));
 const scope=kind==="tool-detail"?"core":kind==="legacy-copy"?"archive":kind==="design-preview"?"preview":"support";
 const status=scope!=="core"?"EXCLUDED":reusable?"B":"C";
 const matches=indexPage?historical.filter(r=>r.tool===slug&&r.locale===locale):[];
 const canonical=D.attr(attr("link","rel","canonical"),"href");
 rows.push({source:"website/"+rel,title:D.text(nodes.find(n=>n.tag==="title")||{children:[]}),sourceSha256:hash(html),url:"https://netengineerlab.com"+pathname,canonical:canonical||null,locale,locales,registry:registry.get(slug)||null,supplemental:supplemental.has(slug),kind,scope,status,verificationPending:scope==="core",staticShellCandidate:reusable,statusReason:status==="B"?"provisional B; current runtime/cache/layout/15-dimension verification pending":"non-core supporting/archive/preview path; outside automatic migration, not status D",domReuse,css,engine,inputs:nodes.filter(n=>["input","select","textarea"].includes(n.tag)).map(n=>({tag:n.tag,id:D.attr(n,"id"),type:D.attr(n,"type")})),seo:{canonical:canonical||null,robots:D.attr(attr("meta","name","robots"),"content"),lang:D.attr(nodes.find(n=>n.tag==="html"),"lang"),hreflang:nodes.filter(n=>n.tag==="link"&&D.attr(n,"hreflang")).map(n=>({locale:D.attr(n,"hreflang"),href:D.attr(n,"href")})),faqSchema:/["']@type["']\s*:\s*["']FAQPage["']/.test(html)},mobile:{currentAudit:"PENDING",historicalWidths:matches.map(r=>r.width),historicalEvidence:matches.length?historicalPath:null,historicalSourceHashBound:false},functionality:{currentAudit:"PENDING",engineSourceExists:engine.map(src=>fs.existsSync(path.resolve(path.dirname(file),src.split(/[?#]/)[0]))),historicalCalculationRecords:matches.filter(r=>r.calculate).length},newIndependentAudit:"PENDING"});
}
rows.sort((a,b)=>a.source.localeCompare(b.source,"en"));
const dimensions=["dom","layout","tokens","components","inputs","outputs","risk","toc","folds","mobile","i18n","seo-geo","a11y","automation","acceptance"];
// Acceptance binds the page plus its local CSS/JS and tool SW, not just HTML.
function dependenciesFor(row){
 const dependencies=new Map(),file=path.join(root,row.source),tree=D.parse(fs.readFileSync(file,"utf8"));
 function add(raw,base){
  if(!raw||/^(?:[a-z]+:|\/\/|#)/i.test(raw))return;
  const clean=raw.split(/[?#]/)[0],target=path.resolve(raw.startsWith("/")?site:path.dirname(base),clean.replace(/^\//,""));
  if(!target.startsWith(site+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile())return;
  const source=posix(path.relative(root,target));if(dependencies.has(source))return;
  const bytes=fs.readFileSync(target);dependencies.set(source,{source,sha256:hash(bytes)});
  if(target.endsWith(".css"))for(const match of bytes.toString("utf8").matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/gi))add(match[1],target);
 }
 for(const n of D.all(tree,()=>true))if(n.tag==="script")add(D.attr(n,"src"),file);else if(n.tag==="link"&&D.attr(n,"rel")==="stylesheet")add(D.attr(n,"href"),file);
 const slug=row.source.match(/^website\/tools\/([^/]+)\//)?.[1];if(slug)add(`/tools/${slug}/sw.js`,file);
 return [...dependencies.values()].sort((a,b)=>a.source.localeCompare(b.source,"en"));
}
for(const row of rows){row.dependencies=dependenciesFor(row);row.dependencyFingerprint=hash(JSON.stringify(row.dependencies));}
const overrideArg=process.argv.indexOf("--status-evidence");
const overrideSource=overrideArg>=0?process.argv[overrideArg+1]:"docs/standards/TOOL_PAGE_STATUS_EVIDENCE.json";
if(!overrideSource)throw Error("--status-evidence requires an input JSON path");
const overrideFile=path.resolve(root,overrideSource),statusEvidence={source:posix(path.relative(root,overrideFile)),exists:fs.existsSync(overrideFile),sha256:null,applied:[],rejected:[]};
if(statusEvidence.exists){
 const raw=fs.readFileSync(overrideFile,"utf8"),input=JSON.parse(raw);statusEvidence.sha256=hash(raw);
 if(!Array.isArray(input.entries))throw Error("status evidence must contain entries[]");
 const seen=new Set();
 for(const entry of input.entries){
  if(seen.has(entry.source))throw Error("duplicate status evidence source: "+entry.source);seen.add(entry.source);
  const row=rows.find(r=>r.source===entry.source),reasons=[];
  if(!row||row.scope!=="core")reasons.push("not a core page");
  if(!["A","D"].includes(entry.status))reasons.push("only independent A/D overrides supported");
  if(entry.reviewer!=="independent_audit")reasons.push("independent reviewer missing");
  if(row&&entry.sourceSha256!==row.sourceSha256)reasons.push("page source hash drift");
  const suppliedDependencies=Array.isArray(entry.dependencies)?[...entry.dependencies].sort((a,b)=>a.source.localeCompare(b.source,"en")):null;
  if(row&&entry.dependencyFingerprint!==row.dependencyFingerprint&&(!suppliedDependencies||JSON.stringify(suppliedDependencies)!==JSON.stringify(row.dependencies)))reasons.push("dependency hash drift or incomplete binding");
  const evidenceFile=entry.evidence&&path.resolve(root,entry.evidence);
  if(!evidenceFile||!evidenceFile.startsWith(root+path.sep)||!fs.existsSync(evidenceFile))reasons.push("evidence file missing");
  else if(entry.evidenceSha256!==hash(fs.readFileSync(evidenceFile)))reasons.push("evidence hash drift");
  if(entry.status==="A"&&(entry.verdict!=="PASS"||!Array.isArray(entry.dimensions)||!dimensions.every(d=>entry.dimensions.includes(d))))reasons.push("A requires PASS for all 15 dimensions");
  if(entry.status==="D"&&(entry.verdict!=="ISSUE"||!entry.issue))reasons.push("D requires a concrete independently confirmed issue");
  if(reasons.length){statusEvidence.rejected.push({source:entry.source,status:entry.status,reasons});if(row&&row.scope==="core"){row.status="B";row.verificationPending=true;row.statusReason="stale/unusable independent evidence: "+reasons.join("; ");}continue;}
  row.status=entry.status;row.verificationPending=entry.status!=="A";row.newIndependentAudit=entry.status==="A"?"PASS":"ISSUE";row.statusReason=entry.status==="D"?entry.issue:"independent all-15-dimension PASS bound to current page/dependency hashes";
  row.statusEvidence={source:entry.evidence,sha256:entry.evidenceSha256,reviewer:entry.reviewer,dimensions:entry.dimensions||[],issue:entry.issue||null};statusEvidence.applied.push({source:entry.source,status:entry.status});
 }
}
const baselineFiles=["website/tools/optical-power-budget/index.html","website/tools/optical-power-budget/zh/index.html","website/tools/optical-power-budget/es/index.html","website/tools/optical-power-budget/css/fb.css","website/tools/optical-power-budget/css/fb-v3.css","website/tools/optical-power-budget/css/fb-v3-prod.css","website/tools/optical-power-budget/js/app-v3.js",...['en','zh','es'].map(l=>`artifacts/opb-v3-validation/production-reference/${l}.html`),...['fb.css','fb-v3.css','fb-v3-prod.css'].map(f=>`artifacts/opb-v3-validation/production-reference/${f}`),"artifacts/opb-v3-audit/production-app-v3.js","artifacts/opb-v3-audit/production-interaction.json"];
const baselineEvidence=baselineFiles.map(source=>({source,exists:fs.existsSync(path.join(root,source)),sha256:fs.existsSync(path.join(root,source))?hash(fs.readFileSync(path.join(root,source))):null}));
const counts=rows.reduce((a,r)=>(a[r.status]++,a),{A:0,B:0,C:0,D:0,EXCLUDED:0});
const data={schemaVersion:1,generator:"scripts/generate-tool-page-matrix.js",scope:"all website/tools HTML + tool design previews + tool-detail bodies outside tools; site guides/topics/home are not tool-detail pages",newIndependentAudit:"PENDING",dimensions,statusEvidence,statusDefinitions:{A:"已经符合 OPB V3 标准",B:"部分符合，需要局部迁移",C:"旧模板，需要完整结构迁移",D:"存在功能或架构问题，需要先修复",EXCLUDED:"non-core support/archive/preview inventory, outside A/B/C/D"},counts,baselineEvidence,rows};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,"TOOL_PAGE_MIGRATION_MATRIX.json"),JSON.stringify(data,null,2)+"\n");
const esc=s=>String(s).replace(/\|/g,"\\|").replace(/\n/g," ");
let md="# Tool page migration matrix\n\n机器来源：[JSON inventory](TOOL_PAGE_MIGRATION_MATRIX.json)，重建：`node scripts/generate-tool-page-matrix.js`。全站新审计 **PENDING**；A仅来自当前哈希绑定的独立15维签收，数量见下表。历史浏览器记录未绑定当前 SHA，只作历史证据。B为部分静态合同符合、局部工作待复核的保守暂列，verificationPending独立记录，不是验收通过或不存在问题的证明；已确认且当前哈希绑定的缺陷必须记D。\n\n用户分类原义：A=已经符合 OPB V3 标准；B=部分符合，需要局部迁移；C=旧模板，需要完整结构迁移；D=存在功能或架构问题，需要先修复。D不能代表excluded。scope独立分类core/support/archive/preview；非核心附表状态EXCLUDED，不计入A/B/C/D，也不算未迁移工具。C不能仅凭缺template推断。\n\n范围覆盖 website/tools 全部 HTML、设计工具预览及工具目录外带详情body的页面，包含非 registry 页面。全站首页/指南/专题不属于工具页迁移范围。仅 EN/ZH 的 supplemental 不自动补 ES。实际URL为部署路径推导，正式URL为源码canonical声明，不冒充已上线探测结果。\n\n计数："+Object.entries(counts).map(([k,v])=>`${k}=${v}`).join("，")+`；共 ${rows.length} 个实际 HTML。输入/engine路径、CSS引用顺序与hash、robots/hreflang、DOM与历史证据逐页保存在 JSON。\n\n## Core逐页矩阵\n\n`;
md+=`状态证据输入：\`${statusEvidence.source}\`（${statusEvidence.exists?"存在":"尚未提供"}）；有效覆盖 ${statusEvidence.applied.length}、拒绝/漂移 ${statusEvidence.rejected.length}。拒绝原因见JSON；漂移页回B待验。\n\n`;
md+="| 实际URL / 源文件 | locale / 三语路径存在 | 类别/来源 | DOM / CSS复用 | 移动 / 功能 | SEO源码 | 状态 |\n| --- | --- | --- | --- | --- | --- | --- |\n";
for(const r of rows.filter(r=>r.scope==="core")){const locales=Object.entries(r.locales).map(([l,v])=>`${l}:${v.exists?v.path:"缺失"}`).join("<br>");md+=`| ${esc(r.title)}<br>[${esc(r.url)}](${r.url})<br>[source](../../${r.source}) | ${r.locale}<br>${locales} | ${r.kind}<br>${r.registry|| (r.supplemental?"supplemental":"unregistered")} | below/toc/prose=${r.domReuse.below}/${r.domReuse.toc}/${r.domReuse.prose}<br>V3 CSS=${r.css.filter(c=>/fb-v3/.test(c.href)).length} | 当前审计=${r.newIndependentAudit}<br>历史width=${r.mobile.historicalWidths.join(",")||"无"}<br>engine=${r.engine.length} | canonical=${r.canonical?`[正式声明](${r.canonical})`:"无"}<br>robots=${esc(r.seo.robots||"缺失")}<br>FAQ=${r.seo.faqSchema} | ${r.status}<br>verificationPending=${r.verificationPending}<br>${esc(r.statusReason)} |\n`;}
md+="\n## 非核心附表（不自动迁移）\n\n| 页面/源文件 | scope / kind | 正式canonical声明 | 翻译 / 状态 |\n| --- | --- | --- | --- |\n";
for(const r of rows.filter(r=>r.scope!=="core"))md+=`| ${esc(r.title)}<br>[${r.url}](${r.url})<br>[source](../../${r.source}) | ${r.scope}<br>${r.kind} | ${r.canonical||"无"} | ${r.scope==="preview"?"三语不适用":"见JSON现存路径；不算新工具"}<br>EXCLUDED |\n`;
md+="\n逐页 SHA256 与基准证据 SHA256 见 JSON；当前代码变更后应重新生成，不能用旧 MD 数量推断新产物已验收。D 页即使 canonical 指向生产工具，也仍是实际设计/辅助路径，不授予迁移或发布授权。\n";
fs.writeFileSync(path.join(out,"TOOL_PAGE_MIGRATION_MATRIX.md"),md);
console.log(JSON.stringify({rows:rows.length,counts,baselineEvidence:baselineEvidence.length}));
