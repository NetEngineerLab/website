#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const{stableFileHash,stableHash}=require("./stable-text-hash");

const root=path.resolve(__dirname,"..");
const websiteRoot=path.join(root,"website");
const docsRoot=path.join(root,"docs");
const reportFile=path.join(docsRoot,"PRODUCTION_ONLINE_REPORT.json");
const expectedOrigin="https://netengineerlab.com";
const expectedWwwOrigin="https://www.netengineerlab.com";
const version=fs.readFileSync(path.join(root,"VERSION"),"utf8").trim();
const startedAt=Date.now();

const managedAssets=[
  "data/locales.js",
  "data/site-config.js",
  "data/tools-catalog.js",
  "assets/css/locale-menu.css",
  "assets/js/analytics.js",
  "assets/js/adsense.js",
  "assets/js/site.js",
  "assets/js/tool-integration.js"
];
const homeReadinessAssets=[
  "data/locales.js",
  "data/site-config.js",
  "data/tools-catalog.js",
  "assets/css/locale-menu.css",
  "assets/js/analytics.js",
  "assets/js/adsense.js",
  "assets/js/site.js"
];
const expectedCategoryCounts={optical:2,pon:2,maintenance:2,network:4,power:1,wireless:1};
const expectedHashes=new Map(managedAssets.map(rel=>[rel,contentHash(path.join(websiteRoot,rel))]));
const expectedTools=JSON.parse(fs.readFileSync(path.join(websiteRoot,"data/tools-catalog.json"),"utf8")).filter(tool=>tool.status==="active");
const expectedToolIds=expectedTools.map(tool=>tool.id);
const deploymentMarker=fullHash(Buffer.from([version,...expectedHashes.values()].join(":"))).slice(0,12);

function contentHash(file){return stableFileHash(file,12)}
function fullHash(value){return stableHash(value)}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function unique(items){return[...new Set(items)]}
function parseNumberArg(name,fallback,{min=0,max=Number.MAX_SAFE_INTEGER}={}){
  const prefix=`--${name}=`;
  const raw=process.argv.slice(2).find(value=>value.startsWith(prefix))?.slice(prefix.length);
  const value=raw===undefined?fallback:Number(raw);
  if(!Number.isFinite(value)||value<min||value>max)throw new Error(`Invalid --${name}: ${raw}`);
  return Math.floor(value);
}
function parseTextArg(name,fallback){
  const prefix=`--${name}=`;
  return process.argv.slice(2).find(value=>value.startsWith(prefix))?.slice(prefix.length)||fallback;
}

const base=parseTextArg("base",process.env.BASE_URL||expectedOrigin).replace(/\/$/,"");
const attempts=parseNumberArg("attempts",Number(process.env.ONLINE_CHECK_ATTEMPTS||1),{min:1,max:60});
const intervalMs=parseNumberArg("interval-ms",Number(process.env.ONLINE_CHECK_INTERVAL_MS||15000),{min:0,max:60000});
const timeoutMs=parseNumberArg("timeout-ms",Number(process.env.ONLINE_CHECK_TIMEOUT_MS||12000),{min:1000,max:60000});
const baseUrl=new URL(base);
const localHosts=new Set(["127.0.0.1","localhost","::1"]);
const localMode=localHosts.has(baseUrl.hostname);

if(baseUrl.protocol!=="https:"&&!localMode)throw new Error("Online checks require HTTPS unless the target is localhost");

async function requestAbsolute(url,{method="GET",redirect="manual"}={}){
  const response=await fetch(url,{
    method,
    redirect,
    signal:AbortSignal.timeout(timeoutMs),
    headers:{
      "accept":method==="HEAD"?"*/*":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "cache-control":"no-cache",
      "user-agent":`NetEngineerLab-Production-Monitor/${version}`
    }
  });
  return{response,text:method==="HEAD"?"":await response.text(),url};
}
function requestPath(pathname,options){return requestAbsolute(new URL(pathname,`${base}/`).href,options)}
function probePath(pathname,attempt){
  const url=new URL(pathname,`${base}/`);
  url.searchParams.set("nel-monitor",`${deploymentMarker}-${attempt}`);
  return`${url.pathname}${url.search}`;
}
function headerIncludes(response,name,value){return(response.headers.get(name)||"").toLowerCase().includes(value.toLowerCase())}
function hasServiceWorkerRevalidation(cacheControl="",etag=""){
  const cacheRevalidates=/\b(?:no-cache|no-store)\b|max-age\s*=\s*0\b/i.test(cacheControl);
  const validEtag=/^(?:W\/)?"[^"\r\n]*"$/i.test(etag.trim());
  return cacheRevalidates||validEtag;
}
function countMatches(text,pattern){return(text.match(pattern)||[]).length}
function hasCanonical(html,url){
  return[...html.matchAll(/<link\b[^>]*>/gi)].some(match=>{
    const tag=match[0];
    return/\brel\s*=\s*["'][^"']*canonical[^"']*["']/i.test(tag)&&new RegExp(`\\bhref\\s*=\\s*["']${url.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}["']`,"i").test(tag);
  });
}
function extractAssetRefs(html,pageUrl){
  const pageOrigin=new URL(pageUrl).origin;
  const refs=[];
  for(const match of html.matchAll(/<(script|link)\b[^>]*>/gi)){
    const tag=match[0];
    const attr=match[1].toLowerCase()==="script"?"src":"href";
    const value=tag.match(new RegExp(`\\b${attr}\\s*=\\s*["']([^"']+)["']`,"i"))?.[1];
    if(!value)continue;
    let url;
    try{url=new URL(value,pageUrl)}catch{continue}
    if(url.origin!==pageOrigin)continue;
    refs.push({raw:value,pathname:url.pathname,version:url.searchParams.get("v")||"",url:url.href});
  }
  return refs;
}
function managedRelFromPathname(pathname){
  const normalized=pathname.replace(/^\//,"");
  return expectedHashes.has(normalized)?normalized:null;
}
function checkPageAssetVersions(html,pageUrl){
  const errors=[];
  let references=0;
  for(const ref of extractAssetRefs(html,pageUrl)){
    const rel=managedRelFromPathname(ref.pathname);
    if(!rel)continue;
    references++;
    const expected=expectedHashes.get(rel);
    if(ref.version!==expected)errors.push(`${new URL(pageUrl).pathname}: ${rel} expected ?v=${expected}, got ${ref.version||"missing"}`);
  }
  return{errors,references};
}
function assetOrderOk(html,pageUrl){
  const refs=extractAssetRefs(html,pageUrl);
  const catalog=refs.findIndex(ref=>ref.pathname==="/data/tools-catalog.js");
  const runtime=refs.findIndex(ref=>ref.pathname==="/assets/js/site.js");
  return catalog>=0&&runtime>=0&&catalog<runtime;
}
function requiredAssetsMatch(html,pageUrl,assets){
  const refs=extractAssetRefs(html,pageUrl);
  const errors=[];
  for(const rel of assets){
    const ref=refs.find(item=>item.pathname===`/${rel}`);
    const expected=expectedHashes.get(rel);
    if(!ref)errors.push(`${new URL(pageUrl).pathname}: missing ${rel}`);
    else if(ref.version!==expected)errors.push(`${new URL(pageUrl).pathname}: ${rel} is ${ref.version||"unversioned"}, waiting for ${expected}`);
  }
  return errors;
}
async function mapLimit(items,limit,worker){
  const output=new Array(items.length);
  let next=0;
  async function run(){
    while(next<items.length){
      const index=next++;
      output[index]=await worker(items[index],index);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));
  return output;
}
function parseCatalog(source){
  const match=source.match(/window\.NEL_TOOLS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
  if(!match)throw new Error("Unable to parse window.NEL_TOOLS");
  return JSON.parse(match[1]);
}

async function readinessCheck(attempt){
  const errors=[];
  let home;
  let toolsDirectory;
  const requestProbe=pathname=>requestPath(probePath(pathname,attempt));
  try{[home,toolsDirectory]=await Promise.all([requestProbe("/"),requestProbe("/tools/zh/")])}
  catch(error){return{ready:false,errors:[error.message||String(error)]}}
  if(home.response.status!==200)errors.push(`/: HTTP ${home.response.status}`);
  if(toolsDirectory.response.status!==200)errors.push(`/tools/zh/: HTTP ${toolsDirectory.response.status}`);
  if(home.response.status===200)errors.push(...requiredAssetsMatch(home.text,`${base}/`,homeReadinessAssets));
  if(toolsDirectory.response.status===200){
    errors.push(...requiredAssetsMatch(toolsDirectory.text,`${base}/tools/zh/`,["data/tools-catalog.js","assets/js/site.js"]));
    if(!assetOrderOk(toolsDirectory.text,`${base}/tools/zh/`))errors.push("/tools/zh/: tools catalog is not before site runtime");
  }
  if(errors.length)return{ready:false,errors,home,toolsDirectory};

  let sitemapResponse;
  try{sitemapResponse=await requestProbe("/sitemap.xml")}
  catch(error){return{ready:false,errors:[error.message||String(error)],home,toolsDirectory}}
  if(sitemapResponse.response.status!==200)errors.push(`/sitemap.xml: HTTP ${sitemapResponse.response.status}`);
  const sitemapUrls=[...sitemapResponse.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
  if(sitemapUrls.length!==36)errors.push(`/sitemap.xml: expected 36 URLs, got ${sitemapUrls.length}`);

  const pageResults=await mapLimit(sitemapUrls,8,async canonical=>{
    const pathname=new URL(canonical).pathname;
    try{return{canonical,pathname,...await requestProbe(pathname)}}
    catch(error){return{canonical,pathname,error}}
  });
  for(const result of pageResults){
    if(result.error){errors.push(`${result.pathname}: ${result.error.message||String(result.error)}`);continue}
    if(result.response.status!==200){errors.push(`${result.pathname}: HTTP ${result.response.status}`);continue}
    errors.push(...checkPageAssetVersions(result.text,`${base}${result.pathname}`).errors);
  }

  const remoteAssets=await mapLimit(managedAssets,6,async rel=>{
    const expected=expectedHashes.get(rel);
    try{
      const result=await requestProbe(`/${rel}?v=${expected}`);
      return{rel,expected,status:result.response.status,actual:fullHash(Buffer.from(result.text)).slice(0,12),text:result.text};
    }catch(error){return{rel,expected,error}}
  });
  for(const item of remoteAssets){
    if(item.error)errors.push(`${item.rel}: ${item.error.message||String(item.error)}`);
    else if(item.status!==200||item.actual!==item.expected)errors.push(`${item.rel}: HTTP ${item.status}, hash ${item.actual}, waiting for ${item.expected}`);
  }

  const catalogAsset=remoteAssets.find(item=>item.rel==="data/tools-catalog.js");
  let tools=[];
  if(catalogAsset&&!catalogAsset.error&&catalogAsset.status===200){
    try{tools=parseCatalog(catalogAsset.text)}catch(error){errors.push(error.message||String(error))}
  }
  if(JSON.stringify(tools.map(tool=>tool.id))!==JSON.stringify(expectedToolIds))errors.push(`tools catalog: waiting for ${expectedToolIds.length} checked-out tools`);

  const serviceWorkers=await mapLimit(expectedTools,6,async tool=>{
    const rel=`tools/${tool.id}/sw.js`;
    try{
      const result=await requestProbe(`/${rel}`);
      const local=fs.readFileSync(path.join(websiteRoot,rel));
      return{
        rel,
        status:result.response.status,
        expected:fullHash(local),
        actual:fullHash(Buffer.from(result.text)),
        cacheControl:result.response.headers.get("cache-control")||"",
        etag:result.response.headers.get("etag")||""
      };
    }catch(error){return{rel,error}}
  });
  for(const item of serviceWorkers){
    if(item.error)errors.push(`${item.rel}: ${item.error.message||String(item.error)}`);
    else{
      if(item.status!==200||item.actual!==item.expected)errors.push(`${item.rel}: waiting for checked-out Service Worker`);
      if(!hasServiceWorkerRevalidation(item.cacheControl,item.etag))errors.push(`${item.rel}: waiting for Cache-Control or ETag revalidation header`);
    }
  }

  return{ready:errors.length===0,errors,home,toolsDirectory,sitemapResponse,sitemapUrls,pageResults,remoteAssets,tools,serviceWorkers};
}

function createCheckContext(){
  const checks=[];
  const errors=[];
  const warnings=[];
  function record(name,ok,detail=""){
    checks.push({name,status:ok?"PASS":"FAIL",detail});
    if(!ok)errors.push(`${name}${detail?`: ${detail}`:""}`);
  }
  return{checks,errors,warnings,record};
}

async function runFullCheck(readiness,readyAttempt){
  const context=createCheckContext();
  const{checks,errors,warnings,record}=context;
  const home=readiness.home;
  const homeUrl=`${base}/`;

  record("checked-out version",version==="1.7.5",version);
  record("production HTTPS or local test",baseUrl.protocol==="https:"||localMode,base);
  record("deployment matches checked-out asset hashes",readiness.ready,`attempt ${readyAttempt}/${attempts}`);
  record("home HTTP 200",home.response.status===200,String(home.response.status));
  record("home canonical",hasCanonical(home.text,`${expectedOrigin}/`),expectedOrigin);
  record("security header nosniff",headerIncludes(home.response,"x-content-type-options","nosniff"));
  record("security header frame",headerIncludes(home.response,"x-frame-options","sameorigin"));
  record("security header referrer",headerIncludes(home.response,"referrer-policy","strict-origin-when-cross-origin"));

  if(!localMode&&baseUrl.origin===expectedOrigin){
    try{
      const alias=await requestAbsolute(`${expectedWwwOrigin}/`);
      const location=alias.response.headers.get("location")||"";
      const ok=alias.response.status===200||([301,308].includes(alias.response.status)&&location.startsWith(expectedOrigin));
      record("www domain available",ok,`${alias.response.status}${location?` -> ${location}`:""}`);
    }catch(error){record("www domain available",false,error.message||String(error))}
  }else record("www domain available",true,"skipped for local/custom target");

  const robots=await requestPath("/robots.txt");
  record("robots HTTP 200",robots.response.status===200,String(robots.response.status));
  record("robots Sitemap",robots.text.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`));

  const sitemapResponse=readiness.sitemapResponse;
  record("sitemap HTTP 200",sitemapResponse.response.status===200,String(sitemapResponse.response.status));
  const sitemapUrls=readiness.sitemapUrls;
  record("sitemap URL count",sitemapUrls.length===36,String(sitemapUrls.length));
  record("sitemap URLs unique",new Set(sitemapUrls).size===sitemapUrls.length);
  record("sitemap production origin",sitemapUrls.every(url=>url.startsWith(`${expectedOrigin}/`)));

  const pageResults=readiness.pageResults;
  let pagesOk=0;
  let versionedReferences=0;
  let toolPages=0;
  let toolPagesWithControls=0;
  const assetErrors=[];
  const orderErrors=[];
  const pageMap=new Map();

  for(const result of pageResults){
    pageMap.set(result.pathname,result);
    if(result.error){errors.push(`${result.pathname}: ${result.error.message||String(result.error)}`);continue}
    if(result.response.status!==200)errors.push(`${result.pathname}: HTTP ${result.response.status}`);
    else pagesOk++;
    if(!/text\/html/i.test(result.response.headers.get("content-type")||""))errors.push(`${result.pathname}: non-HTML content type`);
    if(!hasCanonical(result.text,result.canonical))warnings.push(`${result.pathname}: canonical differs from Sitemap URL`);
    const assetAudit=checkPageAssetVersions(result.text,`${base}${result.pathname}`);
    versionedReferences+=assetAudit.references;
    assetErrors.push(...assetAudit.errors);
    if(["/","/zh/","/tools/","/tools/zh/"].includes(result.pathname)&&!assetOrderOk(result.text,`${base}${result.pathname}`))orderErrors.push(result.pathname);
    if(!["/tools/","/tools/zh/"].includes(result.pathname)&&/^\/tools\/[^/]+\/(?:zh\/)?$/.test(result.pathname)){
      toolPages++;
      const controls=countMatches(result.text,/<(?:input|select|textarea)\b/gi);
      const buttons=countMatches(result.text,/<button\b/gi);
      if(controls>0&&buttons>0&&result.text.includes("assets/js/tool-integration.js?v="))toolPagesWithControls++;
      else errors.push(`${result.pathname}: expected controls and versioned tool integration runtime`);
    }
  }
  record("all Sitemap pages return 200",pagesOk===sitemapUrls.length,`${pagesOk}/${sitemapUrls.length}`);
  errors.push(...assetErrors);
  record("content-hashed shared asset URLs",assetErrors.length===0,`${versionedReferences} references`);
  errors.push(...orderErrors.map(pathname=>`${pathname}: tools catalog must load before site runtime`));
  record("tools catalog before site runtime",orderErrors.length===0,"4 directory/home pages");
  record("tool pages expose working controls",toolPages===24&&toolPagesWithControls===toolPages,`${toolPagesWithControls}/${toolPages}`);

  const catalogAsset=readiness.remoteAssets.find(item=>item.rel==="data/tools-catalog.js");
  record("tools catalog HTTP 200",catalogAsset.status===200,String(catalogAsset.status));
  const tools=readiness.tools;
  record("active tools online",tools.length===12&&tools.every(tool=>tool.status==="active"),String(tools.length));
  record("tool IDs unique",new Set(tools.map(tool=>tool.id)).size===tools.length);
  const actualCounts=tools.reduce((counts,tool)=>{counts[tool.category]=(counts[tool.category]||0)+1;return counts},{});
  record("tool category counts",JSON.stringify(actualCounts)===JSON.stringify(expectedCategoryCounts),JSON.stringify(actualCounts));
  const sitemapPaths=new Set(sitemapUrls.map(url=>new URL(url).pathname));
  const catalogRoutesOk=tools.every(tool=>sitemapPaths.has(`/tools/${tool.id}/`)&&sitemapPaths.has(`/tools/${tool.id}/zh/`));
  record("catalog tool routes in Sitemap",catalogRoutesOk,`${tools.length*2} routes`);

  const remoteAssets=readiness.remoteAssets;
  const remoteAssetErrors=[];
  for(const item of remoteAssets){
    if(item.error)remoteAssetErrors.push(`${item.rel}: ${item.error.message||String(item.error)}`);
    else if(item.status!==200||item.actual!==item.expected)remoteAssetErrors.push(`${item.rel}: HTTP ${item.status}, hash ${item.actual}, expected ${item.expected}`);
  }
  errors.push(...remoteAssetErrors);
  record("versioned assets match checked-out files",remoteAssetErrors.length===0,`${remoteAssets.length} assets`);

  const serviceWorkers=readiness.serviceWorkers;
  const serviceWorkerErrors=[];
  for(const item of serviceWorkers){
    if(item.error)serviceWorkerErrors.push(`${item.rel}: ${item.error.message||String(item.error)}`);
    else{
      if(item.status!==200||item.actual!==item.expected)serviceWorkerErrors.push(`${item.rel}: deployed file differs from checked-out build`);
      if(!hasServiceWorkerRevalidation(item.cacheControl,item.etag))serviceWorkerErrors.push(`${item.rel}: Cache-Control or ETag revalidation header missing`);
    }
  }
  errors.push(...serviceWorkerErrors);
  record("service workers match and revalidate",serviceWorkerErrors.length===0,`${serviceWorkers.length} service workers`);

  for(const [source,target] of [
    ["/about.html","/about/"],["/contact.html","/contact/"],["/privacy.html","/privacy/"],["/terms.html","/terms/"],
    ["/zh/about.html","/zh/about/"],["/zh/contact.html","/zh/contact/"],["/zh/privacy.html","/zh/privacy/"],["/zh/terms.html","/zh/terms/"]
  ]){
    const result=await requestPath(source);
    const location=result.response.headers.get("location")||"";
    if(![301,308].includes(result.response.status)||![target,`${base}${target}`,`${expectedOrigin}${target}`].includes(location))errors.push(`${source}: ${result.response.status} -> ${location}`);
  }
  record("legacy redirects",!errors.some(item=>/^\/(?:zh\/)?(?:about|contact|privacy|terms)\.html:/.test(item)));

  for(const pathname of ["/v174-online-monitor-404/","/zh/v174-online-monitor-404/"]){
    const result=await requestPath(pathname);
    if(result.response.status!==404)errors.push(`${pathname}: expected 404, got ${result.response.status}`);
    if(!/noindex,follow/i.test(result.text))errors.push(`${pathname}: noindex missing`);
  }
  record("real 404 responses",!errors.some(item=>item.includes("v174-online-monitor-404")));

  const security=await requestPath("/.well-known/security.txt");
  record("security.txt HTTP 200",security.response.status===200,String(security.response.status));
  record("security.txt canonical",security.text.includes(`Canonical: ${expectedOrigin}/.well-known/security.txt`));

  const status=errors.length?"FAIL":"PASS";
  return{
    version,
    base,
    generatedAt:new Date().toISOString(),
    readyAttempt,
    configuredAttempts:attempts,
    durationMs:Date.now()-startedAt,
    summary:{sitemapUrls:sitemapUrls.length,activeTools:tools.length,toolPages,versionedReferences,managedAssets:remoteAssets.length,serviceWorkers:serviceWorkers.length},
    checks,
    errors:unique(errors),
    warnings:unique(warnings),
    status
  };
}

function writeReport(report){
  fs.mkdirSync(docsRoot,{recursive:true});
  fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(process.env.GITHUB_STEP_SUMMARY){
    const passed=report.checks?.filter(check=>check.status==="PASS").length||0;
    const failed=report.checks?.filter(check=>check.status==="FAIL").length||report.errors?.length||0;
    const icon=report.status==="PASS"?"✅":"❌";
    const lines=[
      `## ${icon} NetEngineerLab V${report.version} production monitor`,
      "",
      `- Status: **${report.status}**`,
      `- Target: \`${report.base}\``,
      `- Deployment ready attempt: ${report.readyAttempt||"not ready"}/${report.configuredAttempts}`,
      `- Checks: ${passed} passed, ${failed} failed`,
      `- Duration: ${Math.round((report.durationMs||0)/1000)} seconds`
    ];
    if(report.errors?.length){
      lines.push("","### Failures",...report.errors.slice(0,12).map(error=>`- ${error.replace(/\|/g,"\\|")}`));
    }
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join("\n")+"\n");
  }
}

async function main(){
  let readiness;
  let readyAttempt=0;
  for(let attempt=1;attempt<=attempts;attempt++){
    readiness=await readinessCheck(attempt);
    if(readiness.ready){readyAttempt=attempt;console.log(`Deployment ready on attempt ${attempt}/${attempts}.`);break}
    console.warn(`Deployment not ready on attempt ${attempt}/${attempts}: ${readiness.errors.slice(0,4).join("; ")}`);
    if(attempt<attempts)await sleep(intervalMs);
  }
  if(!readyAttempt){
    const report={
      version,
      base,
      generatedAt:new Date().toISOString(),
      readyAttempt:0,
      configuredAttempts:attempts,
      durationMs:Date.now()-startedAt,
      checks:[{name:"deployment matches checked-out asset hashes",status:"FAIL",detail:`not ready after ${attempts} attempts`}],
      errors:unique(readiness?.errors||["Deployment readiness check failed"]),
      warnings:[],
      status:"FAIL"
    };
    writeReport(report);
    process.exit(1);
  }
  const report=await runFullCheck(readiness,readyAttempt);
  writeReport(report);
  if(report.status!=="PASS")process.exit(1);
}

if(require.main===module)main().catch(error=>{
  const report={version,base,generatedAt:new Date().toISOString(),readyAttempt:0,configuredAttempts:attempts,durationMs:Date.now()-startedAt,checks:[],errors:[error.stack||error.message||String(error)],warnings:[],status:"FAIL"};
  writeReport(report);
  process.exit(1);
});

module.exports={hasServiceWorkerRevalidation};
