#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const {spawn,spawnSync}=require("child_process");

const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const docs=path.join(root,"docs");
const expectedVersion="1.7.5";
const expectedOrigin="https://netengineerlab.com";
const sharedRuntimeAssets=[
  {sitePath:"data/locales.js",cachePath:"../../data/locales.js"},
  {sitePath:"data/site-config.js",cachePath:"../../data/site-config.js"},
  {sitePath:"assets/css/locale-menu.css",cachePath:"../../assets/css/locale-menu.css"},
  {sitePath:"assets/js/analytics.js",cachePath:"../../assets/js/analytics.js"},
  {sitePath:"assets/js/adsense.js",cachePath:"../../assets/js/adsense.js"},
  {sitePath:"assets/js/site.js",cachePath:"../../assets/js/site.js"},
  {sitePath:"assets/js/tool-integration.js",cachePath:"../../assets/js/tool-integration.js"}
];
const managedHtmlAssets=[...sharedRuntimeAssets.map(item=>item.sitePath),"data/tools-catalog.js"];
const errors=[];
const warnings=[];
const checks=[];

function record(name,ok,detail=""){
  checks.push({name,status:ok?"PASS":"FAIL",detail});
  if(!ok)errors.push(`${name}${detail?`: ${detail}`:""}`);
}
function warn(name,detail){warnings.push(`${name}: ${detail}`)}
function read(file){return fs.readFileSync(file,"utf8")}
function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}
function exists(rel){return fs.existsSync(path.join(root,rel))}
function resolveSiteTarget(fromFile,raw){
  const clean=raw.split("#")[0].split("?")[0];
  if(!clean)return null;
  let pathname=clean;
  if(/^https?:\/\//i.test(clean)){
    let parsed;
    try{parsed=new URL(clean)}catch{return null}
    if(parsed.origin!==expectedOrigin)return null;
    pathname=parsed.pathname;
  }
  let target;
  if(pathname.startsWith("/"))target=path.resolve(site,"."+pathname);
  else target=path.resolve(path.dirname(fromFile),pathname);
  if(pathname.endsWith("/"))target=path.join(target,"index.html");
  else if(!path.extname(target)&&fs.existsSync(target+".html"))target=target+".html";
  return target;
}
function linkAudit(){
  const htmlFiles=walk(site).filter(file=>file.endsWith(".html")&&!file.endsWith("offline.html"));
  let linkCount=0,anchorCount=0;
  for(const file of htmlFiles){
    const html=read(file);
    const rel=path.relative(site,file).split(path.sep).join("/");
    const ids=new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match=>match[1]));
    const allIds=[...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match=>match[1]);
    if(new Set(allIds).size!==allIds.length)errors.push(`${rel}: duplicate HTML id`);
    for(const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']/gi)){
      const raw=match[1].trim();linkCount++;
      if(!raw){errors.push(`${rel}: empty href/src`);continue}
      if(raw==="#"){errors.push(`${rel}: placeholder href=#`);continue}
      if(/^(?:mailto:|tel:|data:|javascript:|blob:|\/\/)/i.test(raw))continue;
      if(raw.startsWith("#")){
        anchorCount++;
        if(raw.length>1&&!ids.has(decodeURIComponent(raw.slice(1))))errors.push(`${rel}: missing anchor ${raw}`);
        continue;
      }
      if(/^https?:\/\//i.test(raw)){
        try{if(new URL(raw).origin!==expectedOrigin)continue}catch{errors.push(`${rel}: invalid URL ${raw}`);continue}
      }
      const target=resolveSiteTarget(file,raw);
      if(!target)continue;
      if(!target.startsWith(site+path.sep)&&target!==site){errors.push(`${rel}: link escapes website ${raw}`);continue}
      if(!fs.existsSync(target)){errors.push(`${rel}: missing local target ${raw}`);continue}
      const fragment=raw.includes("#")?decodeURIComponent(raw.split("#")[1]||""):"";
      if(fragment&&target.endsWith(".html")){
        anchorCount++;
        const targetHtml=read(target);
        const targetIds=new Set([...targetHtml.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(item=>item[1]));
        if(!targetIds.has(fragment))errors.push(`${rel}: missing target anchor ${raw}`);
      }
    }
  }
  return{htmlPages:htmlFiles.length,linkCount,anchorCount};
}
function validateJsonFile(rel){
  try{return JSON.parse(read(path.join(root,rel)))}catch(error){errors.push(`${rel}: invalid JSON ${error.message}`);return{}}
}
function assetDigest(file){
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0,12);
}
function auditVersionedAssets(){
  const issues=[];
  let references=0;
  const htmlFiles=walk(site).filter(file=>file.endsWith(".html")&&!file.endsWith("offline.html"));
  for(const file of htmlFiles){
    const html=read(file);
    const rel=path.relative(site,file).split(path.sep).join("/");
    for(const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)){
      const raw=match[1];
      const clean=raw.split(/[?#]/)[0].replace(/\\/g,"/");
      if(!managedHtmlAssets.some(asset=>clean.endsWith(asset)))continue;
      references++;
      const version=raw.match(/[?&]v=([a-f0-9]{12})(?:[&#]|$)/i)?.[1]?.toLowerCase();
      if(!version){issues.push(`${rel}: missing content hash for ${raw}`);continue}
      const target=resolveSiteTarget(file,raw);
      if(!target||!fs.existsSync(target)){issues.push(`${rel}: versioned asset target missing ${raw}`);continue}
      const expected=assetDigest(target);
      if(version!==expected)issues.push(`${rel}: stale content hash for ${raw}; expected ${expected}`);
    }
  }
  const catalogOrder=["index.html","zh/index.html","tools/index.html","tools/zh/index.html"].every(rel=>{
    const html=read(path.join(site,rel));
    const catalog=html.indexOf("tools-catalog.js?v=");
    const runtime=html.indexOf("assets/js/site.js?v=");
    return catalog>=0&&runtime>=0&&catalog<runtime;
  });
  const sharedVersion=crypto.createHash("sha256").update(sharedRuntimeAssets.map(item=>assetDigest(path.join(site,...item.sitePath.split("/")))).join(":"),"utf8").digest("hex").slice(0,12);
  const serviceWorkers=walk(path.join(site,"tools")).filter(file=>file.endsWith(`${path.sep}sw.js`));
  const serviceWorkerIssues=[];
  for(const file of serviceWorkers){
    const text=read(file);
    const rel=path.relative(site,file).split(path.sep).join("/");
    for(const asset of sharedRuntimeAssets){
      const expected=`${asset.cachePath}?v=${assetDigest(path.join(site,...asset.sitePath.split("/")))}`;
      if(!text.includes(expected))serviceWorkerIssues.push(`${rel}: missing ${expected}`);
    }
    if(!text.includes(`-${sharedVersion}\",A=`))serviceWorkerIssues.push(`${rel}: cache name does not include ${sharedVersion}`);
  }
  return{references,issues,catalogOrder,serviceWorkers:serviceWorkers.length,serviceWorkerIssues};
}
function runEngineTests(){
  const tests={
    OTDR:"website/tools/otdr-event/docs/engine-test.js",
    MTU_MSS:"website/tools/mtu-calculator/docs/engine-test.js",
    IP_Subnet:"website/tools/subnet-calculator/docs/engine-test.js",
    Bandwidth:"website/tools/bandwidth-calculator/docs/engine-test.js",
    Battery_48V:"website/tools/48v-battery-runtime/docs/engine-test.js",
    IPv6_NAT:"website/tools/ipv6-nat-planner/docs/engine-test.js",
    WiFi_Coverage_Capacity:"website/tools/wifi-coverage-capacity-planner/docs/engine-test.js"
  };
  const results={};
  for(const [name,rel] of Object.entries(tests)){
    const file=path.join(root,rel);
    const result=spawnSync(process.execPath,[file],{cwd:path.dirname(file),encoding:"utf8",timeout:60000});
    results[name]={status:result.status===0?"PASS":"FAIL",output:(result.stdout||result.stderr||"").trim()};
    if(result.status!==0)errors.push(`${name} engine test failed`);
  }
  return results;
}
function waitForServer(child){
  return new Promise((resolve,reject)=>{
    let stdout="",stderr="";
    const timer=setTimeout(()=>reject(new Error(`preview startup timeout ${stderr}`)),15000);
    child.stdout.on("data",chunk=>{
      stdout+=chunk.toString();
      const match=stdout.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
      if(match){clearTimeout(timer);resolve(Number(match[1]))}
    });
    child.stderr.on("data",chunk=>{stderr+=chunk.toString()});
    child.once("exit",code=>{if(!stdout.includes("NetEngineerLab preview")){clearTimeout(timer);reject(new Error(`preview exited ${code}: ${stderr}`))}});
  });
}
async function get(url,options={}){
  const response=await fetch(url,{redirect:"manual",...options});
  const text=options.method==="HEAD"?"":await response.text();
  return{response,text};
}
async function httpAudit(sitemapUrls){
  const child=spawn(process.execPath,[path.join(root,"scripts/preview-server.js")],{
    cwd:root,env:{...process.env,PORT:"0",HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]
  });
  let port;
  const results={routes:0,redirects:0,assets:0,notFound:0,securityHeaders:false,cacheHeaders:false};
  try{
    port=await waitForServer(child);
    const base=`http://127.0.0.1:${port}`;
    for(const liveUrl of sitemapUrls){
      const pathname=new URL(liveUrl).pathname;
      const {response,text}=await get(base+pathname);
      if(response.status!==200)errors.push(`local route ${pathname}: HTTP ${response.status}`);
      if(!/text\/html/i.test(response.headers.get("content-type")||""))errors.push(`local route ${pathname}: content-type is not HTML`);
      if(!/<html\b/i.test(text))errors.push(`local route ${pathname}: HTML document missing`);
      results.routes++;
    }
    for(const [source,target] of [
      ["/about.html","/about/"],["/contact.html","/contact/"],["/privacy.html","/privacy/"],["/terms.html","/terms/"],
      ["/zh/about.html","/zh/about/"],["/zh/contact.html","/zh/contact/"],["/zh/privacy.html","/zh/privacy/"],["/zh/terms.html","/zh/terms/"]
    ]){
      const {response}=await get(base+source);
      if(response.status!==301)errors.push(`${source}: expected 301, got ${response.status}`);
      if(response.headers.get("location")!==target)errors.push(`${source}: redirect target ${response.headers.get("location")} != ${target}`);
      results.redirects++;
    }
    for(const pathname of ["/missing-v173-test/","/zh/missing-v173-test/"]){
      const {response,text}=await get(base+pathname);
      if(response.status!==404)errors.push(`${pathname}: expected 404, got ${response.status}`);
      if(!/noindex,follow/i.test(text))errors.push(`${pathname}: 404 noindex missing`);
      results.notFound++;
    }
    for(const pathname of ["/robots.txt","/sitemap.xml","/assets/css/site.css","/data/site-config.js","/tools/wifi-coverage-capacity-planner/sw.js","/.well-known/security.txt"]){
      const {response}=await get(base+pathname);
      if(response.status!==200)errors.push(`${pathname}: expected 200, got ${response.status}`);
      results.assets++;
    }
    const home=(await get(base+"/",{method:"HEAD"})).response;
    const requiredHeaders={
      "x-content-type-options":"nosniff",
      "x-frame-options":"SAMEORIGIN",
      "referrer-policy":"strict-origin-when-cross-origin"
    };
    results.securityHeaders=Object.entries(requiredHeaders).every(([name,value])=>(home.headers.get(name)||"").includes(value));
    if(!results.securityHeaders)errors.push("preview security headers are incomplete");
    const asset=(await get(base+"/assets/css/site.css",{method:"HEAD"})).response;
    results.cacheHeaders=/max-age=86400/i.test(asset.headers.get("cache-control")||"");
    if(!results.cacheHeaders)errors.push("asset cache header is missing");
    const sw=(await get(base+"/tools/wifi-coverage-capacity-planner/sw.js",{method:"HEAD"})).response;
    if(!/no-cache|no-store|max-age=0/i.test(sw.headers.get("cache-control")||""))errors.push("service worker must be served with revalidation/no-cache");
  }finally{
    child.kill("SIGTERM");
  }
  return results;
}

(async()=>{
  const packageJson=validateJsonFile("package.json");
  const siteConfig=validateJsonFile("website/data/site-config.json");
  const localeConfig=validateJsonFile("website/data/locales.json");
  const sitemapConfig=validateJsonFile("website/data/sitemap-routes.json");
  const tools=validateJsonFile("website/data/tools-catalog.json");

  record("package version",packageJson.version===expectedVersion,packageJson.version||"missing");
  record("site-config version",siteConfig.version===expectedVersion,siteConfig.version||"missing");
  record("locale version",localeConfig.version===expectedVersion,localeConfig.version||"missing");
  record("sitemap config version",sitemapConfig.version===expectedVersion,sitemapConfig.version||"missing");
  record("production origin",siteConfig.siteUrl===expectedOrigin,siteConfig.siteUrl||"missing");
  record("active tool count",Array.isArray(tools)&&tools.filter(item=>item.status==="active").length===12,String(Array.isArray(tools)?tools.filter(item=>item.status==="active").length:0));
  record("no planned tool placeholders",Array.isArray(tools)&&tools.every(item=>item.status==="active"));

  for(const rel of [".node-version",".nvmrc",".gitignore",".gitattributes","VERSION",".github/workflows/production-quality-gate.yml",".github/workflows/production-online-monitor.yml",".github/workflows/production-performance-monitor.yml","scripts/production-online-check.js","scripts/production-online-revalidation-test.js","scripts/production-performance-report.js","scripts/production-performance-test.js","tests/lighthouse/production.lighthouserc.json","website/_headers","website/_redirects","website/robots.txt","website/sitemap.xml","website/.well-known/security.txt"]){
    record(`required file ${rel}`,exists(rel));
  }
  record("Node version pin",read(path.join(root,".node-version")).trim()==="22.16.0",read(path.join(root,".node-version")).trim());
  const nodeMajor=Number(process.versions.node.split(".")[0]);
  record("local Node.js >=20",nodeMajor>=20,process.versions.node);

  const analytics=siteConfig.analytics||{};
  const adsense=siteConfig.adsense||{};
  record("GA4 configuration",!analytics.enabled||(/^G-[A-Z0-9]+$/i.test(analytics.measurementId||"")&&!/X{3,}/.test(analytics.measurementId||"")),analytics.enabled?"enabled and valid":"disabled");
  record("AdSense configuration",!adsense.enabled||(/^ca-pub-\d{10,20}$/.test(adsense.client||"")&&!/X{3,}/.test(adsense.client||"")),adsense.enabled?"enabled and valid":"disabled");

  const websiteTextFiles=walk(site).filter(file=>/\.(?:html|css|js|json|xml|txt|webmanifest)$/i.test(file));
  const forbidden=[];
  for(const file of websiteTextFiles){
    const text=read(file);
    if(/http:\/\/(?:localhost|127\.0\.0\.1)/i.test(text))forbidden.push(path.relative(site,file));
  }
  record("no local development URLs in website",forbidden.length===0,forbidden.join(", "));

  const assetAudit=auditVersionedAssets();
  record("content-hashed shared asset URLs",assetAudit.issues.length===0,assetAudit.issues.length?assetAudit.issues.slice(0,5).join("; "):`${assetAudit.references} references`);
  record("tools catalog loads before site runtime",assetAudit.catalogOrder);
  record("service-worker content-hash cache",assetAudit.serviceWorkerIssues.length===0,assetAudit.serviceWorkerIssues.length?assetAudit.serviceWorkerIssues.slice(0,5).join("; "):`${assetAudit.serviceWorkers} service workers`);

  const sitemap=read(path.join(site,"sitemap.xml"));
  const sitemapUrls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
  record("sitemap URL count",sitemapUrls.length===36,String(sitemapUrls.length));
  record("sitemap URLs unique",new Set(sitemapUrls).size===sitemapUrls.length);
  record("sitemap HTTPS production origin",sitemapUrls.every(url=>url.startsWith(expectedOrigin+"/")));
  const robots=read(path.join(site,"robots.txt"));
  record("robots sitemap declaration",robots.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`));

  const headers=read(path.join(site,"_headers"));
  record("pages.dev production noindex",headers.includes("https://:project.pages.dev/*")&&headers.includes("X-Robots-Tag: noindex"));
  record("pages.dev branch noindex",headers.includes("https://:version.:project.pages.dev/*"));
  record("service-worker revalidation header",/\/tools\/(?:\*|:tool)\/sw\.js/.test(headers)&&/Cache-Control:\s*(?:no-cache|public, max-age=0)/i.test(headers));

  const linkSummary=linkAudit();
  record("local link and anchor audit",!errors.some(item=>/missing local target|missing anchor|placeholder href|duplicate HTML id|empty href\/src|link escapes/.test(item)),`${linkSummary.htmlPages} pages, ${linkSummary.linkCount} links`);

  const engineResults=runEngineTests();
  record("all calculation engines",Object.values(engineResults).every(item=>item.status==="PASS"));

  const httpResults=await httpAudit(sitemapUrls);
  record("local HTTP production simulation",!errors.some(item=>/^local route|expected 301|expected 404|preview security|asset cache|service worker/.test(item)),`${httpResults.routes} routes`);

  const report={
    version:expectedVersion,
    generatedAt:new Date().toISOString(),
    node:process.versions.node,
    siteUrl:siteConfig.siteUrl,
    htmlPages:linkSummary.htmlPages,
    linksChecked:linkSummary.linkCount,
    activeTools:Array.isArray(tools)?tools.filter(item=>item.status==="active").length:0,
    sitemapUrls:sitemapUrls.length,
    engines:engineResults,
    http:httpResults,
    checks,
    errors:[...new Set(errors)],
    warnings:[...new Set(warnings)],
    status:errors.length?"FAIL":"PASS"
  };
  fs.writeFileSync(path.join(docs,"PRODUCTION_ACCEPTANCE_REPORT.json"),JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(errors.length)process.exit(1);
})().catch(error=>{
  errors.push(error.stack||error.message||String(error));
  const report={version:expectedVersion,generatedAt:new Date().toISOString(),errors,warnings,status:"FAIL"};
  fs.writeFileSync(path.join(docs,"PRODUCTION_ACCEPTANCE_REPORT.json"),JSON.stringify(report,null,2)+"\n");
  console.error(error);process.exit(1);
});
