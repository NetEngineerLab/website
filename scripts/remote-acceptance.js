#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");

const root=path.resolve(__dirname,"..");
const docs=path.join(root,"docs");
const expectedOrigin="https://netengineerlab.com";
const args=process.argv.slice(2);
const baseArg=args.find(value=>value.startsWith("--base="));
const base=(baseArg?baseArg.slice(7):process.env.BASE_URL||expectedOrigin).replace(/\/$/,"");
const errors=[];
const warnings=[];
const checks=[];

function record(name,ok,detail=""){
  checks.push({name,status:ok?"PASS":"FAIL",detail});
  if(!ok)errors.push(`${name}${detail?`: ${detail}`:""}`);
}
async function request(pathname,options={}){
  const response=await fetch(base+pathname,{redirect:"manual",...options});
  const text=options.method==="HEAD"?"":await response.text();
  return{response,text};
}
function headerIncludes(response,name,value){return(response.headers.get(name)||"").toLowerCase().includes(value.toLowerCase())}

(async()=>{
  let parsed;
  try{parsed=new URL(base)}catch{throw new Error(`Invalid --base URL: ${base}`)}
  record("HTTPS base URL",parsed.protocol==="https:",base);

  const home=await request("/");
  record("home HTTP 200",home.response.status===200,String(home.response.status));
  record("home canonical",home.text.includes(`<link rel="canonical" href="${base}/">`)||home.text.includes(`<link href="${base}/" rel="canonical">`));
  record("security header nosniff",headerIncludes(home.response,"x-content-type-options","nosniff"));
  record("security header frame",headerIncludes(home.response,"x-frame-options","sameorigin"));
  record("security header referrer",headerIncludes(home.response,"referrer-policy","strict-origin-when-cross-origin"));

  const robots=await request("/robots.txt");
  record("robots HTTP 200",robots.response.status===200,String(robots.response.status));
  record("robots Sitemap",robots.text.includes(`Sitemap: ${base}/sitemap.xml`));

  const sitemapResponse=await request("/sitemap.xml");
  record("sitemap HTTP 200",sitemapResponse.response.status===200,String(sitemapResponse.response.status));
  const urls=[...sitemapResponse.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
  record("sitemap URL count",urls.length===36,String(urls.length));
  record("sitemap URLs unique",new Set(urls).size===urls.length);
  record("sitemap URLs use deployment origin",urls.every(url=>url.startsWith(base+"/")));

  let pagesOk=0;
  for(const url of urls){
    const live=new URL(url);
    const result=await request(live.pathname);
    if(result.response.status!==200)errors.push(`${live.pathname}: HTTP ${result.response.status}`);
    else pagesOk++;
    if(!/text\/html/i.test(result.response.headers.get("content-type")||""))errors.push(`${live.pathname}: non-HTML content type`);
    if(!result.text.includes(`href="${url}"`)&&!result.text.includes(`href='${url}'`))warnings.push(`${live.pathname}: exact canonical not found by simple check`);
  }
  record("all Sitemap pages return 200",pagesOk===urls.length,`${pagesOk}/${urls.length}`);

  for(const [source,target] of [
    ["/about.html","/about/"],["/contact.html","/contact/"],["/privacy.html","/privacy/"],["/terms.html","/terms/"],
    ["/zh/about.html","/zh/about/"],["/zh/contact.html","/zh/contact/"],["/zh/privacy.html","/zh/privacy/"],["/zh/terms.html","/zh/terms/"]
  ]){
    const result=await request(source);
    const statusOk=[301,308].includes(result.response.status);
    const location=result.response.headers.get("location")||"";
    const targetOk=location===target||location===base+target;
    if(!statusOk||!targetOk)errors.push(`${source}: ${result.response.status} -> ${location}`);
  }
  record("legacy redirects",!errors.some(item=>item.startsWith("/about.html")||item.startsWith("/contact.html")||item.startsWith("/privacy.html")||item.startsWith("/terms.html")||item.startsWith("/zh/")));

  for(const pathname of ["/v173-live-404-test/","/zh/v173-live-404-test/"]){
    const result=await request(pathname);
    if(result.response.status!==404)errors.push(`${pathname}: expected 404, got ${result.response.status}`);
    if(!/noindex,follow/i.test(result.text))errors.push(`${pathname}: noindex missing`);
  }
  record("real 404 responses",!errors.some(item=>item.includes("v173-live-404-test")));

  const security=await request("/.well-known/security.txt");
  record("security.txt HTTP 200",security.response.status===200,String(security.response.status));
  record("security.txt canonical",security.text.includes(`Canonical: ${base}/.well-known/security.txt`));

  const sw=await request("/tools/wifi-coverage-capacity-planner/sw.js",{method:"HEAD"});
  record("service-worker revalidation",/no-cache|max-age=0/i.test(sw.response.headers.get("cache-control")||""),sw.response.headers.get("cache-control")||"missing");

  const report={
    version:"1.7.5",
    base,
    generatedAt:new Date().toISOString(),
    sitemapUrls:urls.length,
    checks,
    errors:[...new Set(errors)],
    warnings:[...new Set(warnings)],
    status:errors.length?"FAIL":"PASS"
  };
  fs.writeFileSync(path.join(docs,"REMOTE_ACCEPTANCE_REPORT.json"),JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(errors.length)process.exit(1);
})().catch(error=>{
  const report={version:"1.7.5",base,generatedAt:new Date().toISOString(),errors:[error.stack||error.message||String(error)],warnings,status:"FAIL"};
  fs.writeFileSync(path.join(docs,"REMOTE_ACCEPTANCE_REPORT.json"),JSON.stringify(report,null,2)+"\n");
  console.error(error);process.exit(1);
});
