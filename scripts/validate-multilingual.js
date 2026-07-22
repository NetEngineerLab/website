#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.resolve(__dirname,".."),site=path.join(root,"website");
const config=JSON.parse(fs.readFileSync(path.join(site,"data/locales.json"),"utf8"));
const tools=JSON.parse(fs.readFileSync(path.join(site,"data/tools-catalog.json"),"utf8"));
const defaultLocale=config.locales.find(x=>x.id===config.defaultLocale);
const active=config.locales.filter(x=>x.status==="active");
const folderMap=new Map(config.locales.filter(x=>x.folder).map(x=>[x.folder,x]));
const localeMap=new Map(config.locales.map(x=>[x.id,x]));
const rootDirectoryRoutes=new Set(["about/","contact/","privacy/","terms/"]);
const errors=[],warnings=[];
const posix=v=>v.split(path.sep).join("/");
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
function identify(rel){
 const p=posix(rel),parts=p.split("/");
 if(p.endsWith("/offline.html")||p==="offline.html")return null;
 if(parts[0]==="tools"){
  if(parts.length===2&&parts[1]==="index.html")return{route:"tools/",localeId:defaultLocale.id,kind:"toolsDirectory"};
  if(parts.length===3&&folderMap.has(parts[1])&&parts[2]==="index.html")return{route:"tools/",localeId:folderMap.get(parts[1]).id,kind:"toolsDirectory"};
  if(parts.length===3&&parts[2]==="index.html")return{route:`tools/${parts[1]}/`,localeId:defaultLocale.id,kind:"tool",toolSlug:parts[1]};
  if(parts.length===4&&folderMap.has(parts[2])&&parts[3]==="index.html")return{route:`tools/${parts[1]}/`,localeId:folderMap.get(parts[2]).id,kind:"tool",toolSlug:parts[1]};
  return null;
 }
 if(parts.length===1&&parts[0].endsWith(".html"))return{route:parts[0]==="index.html"?"":parts[0],localeId:defaultLocale.id};
 if(parts.length===2&&parts[1]==="index.html"&&rootDirectoryRoutes.has(`${parts[0]}/`))return{route:`${parts[0]}/`,localeId:defaultLocale.id};
 if(parts.length===2&&folderMap.has(parts[0])&&parts[1].endsWith(".html"))return{route:parts[1]==="index.html"?"":parts[1],localeId:folderMap.get(parts[0]).id};
 if(parts.length===3&&folderMap.has(parts[0])&&parts[2]==="index.html"&&rootDirectoryRoutes.has(`${parts[1]}/`))return{route:`${parts[1]}/`,localeId:folderMap.get(parts[0]).id};
 return null;
}
function urlFor(route,locale){
 if(route==="")return locale.folder?`/${locale.folder}/`:"/";
 if(route==="tools/")return locale.folder?`/tools/${locale.folder}/`:"/tools/";
 if(route.startsWith("tools/")){const slug=route.split("/")[1];return locale.folder?`/tools/${slug}/${locale.folder}/`:`/tools/${slug}/`}
 if(rootDirectoryRoutes.has(route))return locale.folder?`/${locale.folder}/${route}`:`/${route}`;
 return locale.folder?`/${locale.folder}/${route}`:`/${route}`;
}
function attr(html,name){
 const m=html.match(new RegExp(`<meta\\b[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta\\b[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["'][^>]*>`,"i"));
 return m?(m[1]!==undefined?m[1]:m[2]):null;
}
function linkHref(html,rel,hreflang){
 const tags=html.match(/<link\b[^>]*>/gi)||[];
 for(const tag of tags){
  if(!new RegExp(`rel=["'][^"']*\\b${rel}\\b[^"']*["']`,"i").test(tag))continue;
  if(hreflang&&!new RegExp(`hreflang=["']${hreflang.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}["']`,"i").test(tag))continue;
  const m=tag.match(/href=["']([^"']+)["']/i);if(m)return m[1];
 }
 return null;
}
const ids=new Set(),folders=new Set(),hreflangs=new Set();
for(const locale of config.locales){
 if(ids.has(locale.id))errors.push(`duplicate locale id: ${locale.id}`);ids.add(locale.id);
 if(locale.folder&&folders.has(locale.folder))errors.push(`duplicate locale folder: ${locale.folder}`);if(locale.folder)folders.add(locale.folder);
 if(hreflangs.has(locale.hreflang))errors.push(`duplicate hreflang: ${locale.hreflang}`);hreflangs.add(locale.hreflang);
 if(!locale.htmlLang||!locale.hreflang||!locale.catalogKey||!locale.ui)errors.push(`incomplete locale config: ${locale.id}`);
}
for(const tool of tools){
 for(const locale of active){
  const key=locale.catalogKey;
  if(!tool.translations?.[key])errors.push(`missing ${key} translation for ${tool.id}`);
 }
}
const records=[],groups=new Map();
for(const file of walk(site).filter(x=>x.endsWith(".html"))){
 const rel=posix(path.relative(site,file)),info=identify(rel);if(!info)continue;
 records.push({file,rel,info});
 if(!groups.has(info.route))groups.set(info.route,new Map());
 groups.get(info.route).set(info.localeId,rel);
}
for(const [route,group] of groups){
 for(const locale of active)if(!group.has(locale.id))errors.push(`active locale page missing: ${locale.id} ${route||"/"}`);
}
for(const record of records){
 const locale=localeMap.get(record.info.localeId),html=fs.readFileSync(record.file,"utf8");
 const lang=html.match(/<html\b[^>]*lang=["']([^"']+)["']/i)?.[1];
 const dir=html.match(/<html\b[^>]*dir=["']([^"']+)["']/i)?.[1];
 if(lang!==locale.htmlLang)errors.push(`${record.rel}: lang ${lang} != ${locale.htmlLang}`);
 if(dir!==(locale.direction||"ltr"))errors.push(`${record.rel}: dir ${dir} != ${locale.direction||"ltr"}`);
 if(attr(html,"nel-locale")!==locale.id)errors.push(`${record.rel}: nel-locale mismatch`);
 if(attr(html,"nel-route")!==record.info.route)errors.push(`${record.rel}: nel-route mismatch`);
 if(!/data\/locales\.js/i.test(html))errors.push(`${record.rel}: locales.js missing`);
 if(!/data\/site-config\.js/i.test(html))errors.push(`${record.rel}: site-config.js missing`);
 if(!/assets\/js\/analytics\.js/i.test(html))errors.push(`${record.rel}: analytics.js missing`);
 if(!/assets\/js\/adsense\.js/i.test(html))errors.push(`${record.rel}: adsense.js missing`);
 if(!/assets\/js\/site\.js/i.test(html))errors.push(`${record.rel}: shared site.js missing`);
 if(!/locale-menu\.css/i.test(html))errors.push(`${record.rel}: locale-menu.css missing`);
 if(!/data-language-menu/i.test(html))errors.push(`${record.rel}: language menu missing`);
 const canonical=config.siteUrl+urlFor(record.info.route,locale);
 const group=groups.get(record.info.route);
 if(record.info.route==="404.html"){
  if(linkHref(html,"canonical"))errors.push(`${record.rel}: 404 must not have canonical`);
  if(!/name=["']robots["'][^>]*content=["']noindex,follow["']/i.test(html)&&!/content=["']noindex,follow["'][^>]*name=["']robots["']/i.test(html))errors.push(`${record.rel}: 404 must be noindex`);
 }else{
  if(linkHref(html,"canonical")!==canonical)errors.push(`${record.rel}: canonical mismatch`);
  for(const alt of active.filter(x=>group.has(x.id))){
   const expected=config.siteUrl+urlFor(record.info.route,alt);
   if(linkHref(html,"alternate",alt.hreflang)!==expected)errors.push(`${record.rel}: hreflang ${alt.hreflang} mismatch`);
  }
  if(group.has(defaultLocale.id)){
   const expected=config.siteUrl+urlFor(record.info.route,defaultLocale);
   if(linkHref(html,"alternate","x-default")!==expected)errors.push(`${record.rel}: x-default mismatch`);
  }
 }
 if(locale.status!=="active"&&!/name=["']robots["'][^>]*content=["']noindex,follow["']/i.test(html)&&!/content=["']noindex,follow["'][^>]*name=["']robots["']/i.test(html))errors.push(`${record.rel}: planned locale must be noindex`);
}
const sitemap=fs.readFileSync(path.join(site,"sitemap.xml"),"utf8");
const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
if(new Set(locs).size!==locs.length)errors.push("duplicate sitemap URLs");
for(const record of JSON.parse(fs.readFileSync(path.join(site,"data/sitemap-routes.json"),"utf8")).routes){
 const group=groups.get(record.route);
 if(!group)continue;
 for(const locale of active.filter(x=>group.has(x.id))){
  const expected=config.siteUrl+urlFor(record.route,locale);
  if(!locs.includes(expected))errors.push(`sitemap missing ${expected}`);
 }
}
for(const tool of tools.filter(x=>x.status==="active")){
 for(const locale of active){
  if(!groups.get(`tools/${tool.id}/`)?.has(locale.id))continue;
  const name=locale.id===defaultLocale.id?"manifest.webmanifest":`manifest-${locale.folder}.webmanifest`;
  const manifestPath=path.join(site,"tools",tool.id,name);
  if(!fs.existsSync(manifestPath))errors.push(`manifest missing: ${tool.id}/${name}`);
  else{
   const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
   if(manifest.lang!==locale.htmlLang)errors.push(`manifest lang mismatch: ${tool.id}/${name}`);
   if(manifest.start_url!==urlFor(`tools/${tool.id}/`,locale))errors.push(`manifest start_url mismatch: ${tool.id}/${name}`);
  }
 }
}
for(const js of [path.join(site,"assets/js/site.js"),path.join(site,"data/locales.js"),path.join(site,"data/tools-catalog.js")]){
 try{new vm.Script(fs.readFileSync(js,"utf8"),{filename:js})}catch(e){errors.push(`JS syntax: ${path.relative(site,js)} ${e.message}`)}
}
const siteJs=fs.readFileSync(path.join(site,"assets/js/site.js"),"utf8");
if(!siteJs.includes("window.NEL_I18N"))errors.push("site.js is not driven by NEL_I18N");
if(!siteJs.includes("tool.translations"))errors.push("site.js is not driven by tool translations");
const allText=walk(site).filter(x=>/\.(?:html|js|json|xml)$/.test(x)).map(x=>fs.readFileSync(x,"utf8")).join("\n");
if(/netengineerlab\.com\/(?:en\/|tools\/(?:en\/|[^/]+\/en\/))/.test(allText)||/(?:href|src)=["'][^"']*\/tools\/[^"']*\/en\//.test(allText))warnings.push("legacy NetEngineerLab /en/ path remains somewhere; inspect if intentional");
const report={
 version:config.version,
 activeLocales:active.map(x=>x.id),
 plannedLocales:config.locales.filter(x=>x.status!=="active").map(x=>x.id),
 routeGroups:groups.size,
 localizedPages:records.length,
 sitemapUrls:locs.length,
 errors,
 warnings,
 status:errors.length?"FAIL":"PASS"
};
fs.writeFileSync(path.join(root,"docs","MULTILINGUAL_VALIDATION_REPORT.json"),JSON.stringify(report,null,2)+"\n","utf8");
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exit(1);
