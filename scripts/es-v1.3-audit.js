#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,".."),site=path.join(root,"website");
const localeConfig=JSON.parse(fs.readFileSync(path.join(site,"data/locales.json"),"utf8"));
const locale=localeConfig.locales.find(x=>x.id==="es");
const registry=JSON.parse(fs.readFileSync(path.join(root,"src/registry/tool-registry.json"),"utf8"));
const first10=["fiber-loss","optical-power-budget","pon-splitter-loss","bandwidth-calculator","subnet-calculator","vlan-ip-capacity-planner","poe-power-budget-calculator","pue-data-center-energy-efficiency","ups-capacity-battery-runtime-calculator","wireless-link-budget-calculator"];
const errors=[],info=[];
const read=p=>fs.readFileSync(p,"utf8");
const isNoindex=h=>/name=["']robots["'][^>]*content=["'][^"']*noindex|content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots/i.test(h);
const attr=(tag,name)=>(tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`,`i`))||[])[1]||"";
const canonical=h=>{const t=(h.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i)||[])[0]||"";return attr(t,"href")};
const hreflangs=h=>Object.fromEntries([...h.matchAll(/<link\b(?=[^>]*rel=["']alternate["'])[^>]*>/gi)].map(m=>[attr(m[0],"hreflang"),attr(m[0],"href")]).filter(x=>x[0]&&x[1]));
const localAssetMissing=(html,file)=>{
  const refs=[];
  for(const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)){
    const u=m[1]; if(!u||/^(?:https?:|data:|#|mailto:|tel:)/i.test(u))continue;
    if(!/\.(?:js|css|webmanifest)(?:\?|$)/i.test(u))continue;
    const clean=u.split(/[?#]/)[0];
    const target=clean.startsWith("/")?path.join(site,clean.replace(/^\//,"")):path.resolve(path.dirname(file),clean);
    if(!fs.existsSync(target))refs.push(u);
  }
  return refs;
};
if(!locale)errors.push("Spanish locale missing");
if(locale&&locale.status!=="active")errors.push(`Spanish locale must be active for launch; got ${locale.status}`);
const core=[
 ["es/index.html","https://netengineerlab.com/es/"],
 ["es/about/index.html","https://netengineerlab.com/es/about/"],
 ["es/contact/index.html","https://netengineerlab.com/es/contact/"],
 ["es/privacy/index.html","https://netengineerlab.com/es/privacy/"],
 ["es/terms/index.html","https://netengineerlab.com/es/terms/"],
 ["tools/es/index.html","https://netengineerlab.com/tools/es/"]
];
const launchPages=[...core,...first10.map(id=>[`tools/${id}/es/index.html`,`https://netengineerlab.com/tools/${id}/es/`])];
for(const [rel,url] of launchPages){
  const file=path.join(site,rel); if(!fs.existsSync(file)){errors.push(`Missing launch page: ${rel}`);continue}
  const h=read(file);
  if(isNoindex(h))errors.push(`Launch page remains noindex: ${rel}`);
  if(canonical(h)!==url)errors.push(`Canonical mismatch: ${rel} => ${canonical(h)}`);
  const langs=hreflangs(h); if(langs.es!==url)errors.push(`Spanish hreflang missing/self mismatch: ${rel}`);
  if(!langs.en||!langs["zh-CN"]||!langs["x-default"])errors.push(`Required hreflang set incomplete: ${rel}`);
  const missing=localAssetMissing(h,file); if(missing.length)errors.push(`${rel}: missing local asset(s): ${missing.join(", ")}`);
}
const notFound=path.join(site,"es","404.html");
if(!fs.existsSync(notFound))errors.push("Missing es/404.html"); else if(!isNoindex(read(notFound)))errors.push("Spanish 404 must remain noindex");
const actualToolDirs=fs.readdirSync(path.join(site,"tools"),{withFileTypes:true}).filter(x=>x.isDirectory()&&fs.existsSync(path.join(site,"tools",x.name,"es","index.html"))).map(x=>x.name).sort();
const expectedToolDirs=[...first10].sort();
if(JSON.stringify(actualToolDirs)!==JSON.stringify(expectedToolDirs))errors.push(`Spanish tool publish set mismatch: ${actualToolDirs.join(",")}`);
for(const id of first10){
  const t=registry.find(x=>x.id===id); if(!t?.translations?.es)errors.push(`Missing es catalog copy: ${id}`);
  if(t?.routes?.es!==`/tools/${id}/es/`)errors.push(`Missing es route: ${id}`);
  for(const field of ["searchIntent","longTailQuestions","reviewedAt"]){if(!t?.pageContent?.[field]?.es)errors.push(`Missing ${field}.es: ${id}`)}
  const file=path.join(site,"tools",id,"es","index.html"),h=read(file);
  if(!/name=["']nel-translation-status["'][^>]*content=["']launch["']|content=["']launch["'][^>]*name=["']nel-translation-status["']/i.test(h))errors.push(`Tool not marked launch: ${id}`);
  if(!h.includes("/assets/js/es-launch-runtime.js"))errors.push(`Spanish dynamic runtime missing: ${id}`);
  if(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]{0,200}(?:Why size both|Why add headroom|Can this replace)/i.test(h))errors.push(`English FAQ JSON-LD leakage: ${id}`);
}
const sitemap=read(path.join(site,"sitemap.xml"));
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const esUrls=urls.filter(u=>/\/es\/$/.test(u)||/netengineerlab\.com\/es\/(?:$|about\/|contact\/|privacy\/|terms\/)/.test(u));
const expectedUrls=launchPages.map(x=>x[1]).sort();
if(JSON.stringify([...esUrls].sort())!==JSON.stringify(expectedUrls))errors.push(`Spanish sitemap set mismatch: expected ${expectedUrls.length}, got ${esUrls.length}`);
const footer=read(path.join(site,"templates/footer-es.html"));
for(const word of [">Privacy<",">Terms<","Professional online tools"]){if(footer.includes(word))errors.push(`Spanish footer leakage: ${word}`)}
const forbidden=["Deployment preset","Core inputs","Calculation mode","Period energy","Period days","Electricity tariff","Non-IT overhead breakdown","Recalculate","Planned endpoints","Usable IPs / VLAN","Why size both kW and kVA?"];
for(const id of first10){const h=read(path.join(site,"tools",id,"es","index.html"));for(const word of forbidden){if(h.includes(word))errors.push(`${id}: untranslated launch phrase: ${word}`)}}
info.push(`Locale status: ${locale?.status||"missing"}`);
info.push(`Spanish indexed launch pages: ${launchPages.length}`);
info.push(`Spanish flagship tools: ${first10.length}/${registry.filter(x=>x.status==="active").length}`);
info.push(`Spanish sitemap URLs: ${esUrls.length}`);
info.push(`Unpublished active tools remain without /es/: ${registry.filter(x=>x.status==="active").length-first10.length}`);
console.log(JSON.stringify({result:errors.length?"FAIL":"PASS",info,errors},null,2));
process.exit(errors.length?1:0);
