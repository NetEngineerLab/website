#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const{stableFileHash,stableHash}=require("./stable-text-hash");

const packageRoot=path.resolve(__dirname,"..");
const siteRoot=path.join(packageRoot,"website");
const dataDir=path.join(siteRoot,"data");
const localeConfig=JSON.parse(fs.readFileSync(path.join(dataDir,"locales.json"),"utf8"));
const toolCatalog=JSON.parse(fs.readFileSync(path.join(dataDir,"tools-catalog.json"),"utf8"));
const sitemapConfig=JSON.parse(fs.readFileSync(path.join(dataDir,"sitemap-routes.json"),"utf8"));
const defaultLocale=localeConfig.locales.find(item=>item.id===localeConfig.defaultLocale);
if(!defaultLocale)throw new Error("Default locale is missing from locales.json");
const folderMap=new Map(localeConfig.locales.filter(item=>item.folder).map(item=>[item.folder,item]));
const localeMap=new Map(localeConfig.locales.map(item=>[item.id,item]));
const activeLocales=localeConfig.locales.filter(item=>item.status==="active");
const rootDirectoryRoutes=new Set(["about/","contact/","privacy/","terms/"]);
const sharedRuntimeAssets=[
 {sitePath:"data/locales.js",cachePath:"../../data/locales.js"},
 {sitePath:"data/site-config.js",cachePath:"../../data/site-config.js"},
 {sitePath:"assets/css/locale-menu.css",cachePath:"../../assets/css/locale-menu.css"},
 {sitePath:"assets/js/analytics.js",cachePath:"../../assets/js/analytics.js"},
 {sitePath:"assets/js/adsense.js",cachePath:"../../assets/js/adsense.js"},
 {sitePath:"assets/js/site.js",cachePath:"../../assets/js/site.js"},
 {sitePath:"assets/js/tool-integration.js",cachePath:"../../assets/js/tool-integration.js"}
];
const assetVersionCache=new Map();
function isRootDirectoryRoute(route){return rootDirectoryRoutes.has(route)}

function posix(value){return value.split(path.sep).join("/")}
function walk(dir){
 const output=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())output.push(...walk(full));
  else output.push(full);
 }
 return output;
}
function escapeHtml(value){
 return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
}
function identifyPage(rel){
 const clean=posix(rel).replace(/^\/+/,"");
 if(clean.endsWith("/offline.html")||clean==="offline.html")return null;
 const parts=clean.split("/");
 if(parts[0]==="tools"){
  if(parts.length===2&&parts[1]==="index.html"){
   return{route:"tools/",localeId:defaultLocale.id,kind:"toolsDirectory"};
  }
  if(parts.length===3&&folderMap.has(parts[1])&&parts[2]==="index.html"){
   return{route:"tools/",localeId:folderMap.get(parts[1]).id,kind:"toolsDirectory"};
  }
  if(parts.length===3&&parts[2]==="index.html"){
   return{route:`tools/${parts[1]}/`,localeId:defaultLocale.id,kind:"tool",toolSlug:parts[1]};
  }
  if(parts.length===4&&folderMap.has(parts[2])&&parts[3]==="index.html"){
   return{route:`tools/${parts[1]}/`,localeId:folderMap.get(parts[2]).id,kind:"tool",toolSlug:parts[1]};
  }
  return null;
 }
 if(parts.length===1&&parts[0].endsWith(".html")){
  return{route:parts[0]==="index.html"?"":parts[0],localeId:defaultLocale.id,kind:parts[0]==="index.html"?"home":"rootPage"};
 }
 if(parts.length===2&&parts[1]==="index.html"&&rootDirectoryRoutes.has(`${parts[0]}/`)){
  return{route:`${parts[0]}/`,localeId:defaultLocale.id,kind:"rootPage"};
 }
 if(parts.length===2&&folderMap.has(parts[0])&&parts[1].endsWith(".html")){
  return{route:parts[1]==="index.html"?"":parts[1],localeId:folderMap.get(parts[0]).id,kind:parts[1]==="index.html"?"home":"rootPage"};
 }
 if(parts.length===3&&folderMap.has(parts[0])&&parts[2]==="index.html"&&rootDirectoryRoutes.has(`${parts[1]}/`)){
  return{route:`${parts[1]}/`,localeId:folderMap.get(parts[0]).id,kind:"rootPage"};
 }
 return null;
}
function fileForRoute(route,locale){
 if(route==="")return locale.folder?`${locale.folder}/index.html`:"index.html";
 if(route==="tools/")return locale.folder?`tools/${locale.folder}/index.html`:"tools/index.html";
 if(route.startsWith("tools/")){
  const slug=route.split("/")[1];
  return locale.folder?`tools/${slug}/${locale.folder}/index.html`:`tools/${slug}/index.html`;
 }
 if(isRootDirectoryRoute(route))return locale.folder?`${locale.folder}/${route}index.html`:`${route}index.html`;
 return locale.folder?`${locale.folder}/${route}`:route;
}
function urlForRoute(route,locale){
 if(route==="")return locale.folder?`/${locale.folder}/`:"/";
 if(route==="tools/")return locale.folder?`/tools/${locale.folder}/`:"/tools/";
 if(route.startsWith("tools/")){
  const slug=route.split("/")[1];
  return locale.folder?`/tools/${slug}/${locale.folder}/`:`/tools/${slug}/`;
 }
 if(isRootDirectoryRoute(route))return locale.folder?`/${locale.folder}/${route}`:`/${route}`;
 return locale.folder?`/${locale.folder}/${route}`:`/${route}`;
}
function relativeUrl(fromUrl,toUrl){
 const fromDir=fromUrl.endsWith("/")?fromUrl:path.posix.dirname(fromUrl);
 let rel=path.posix.relative(fromDir,toUrl);
 if(!rel)rel="./";
 if(toUrl.endsWith("/")&&!rel.endsWith("/"))rel+="/";
 return rel;
}
function relativeFile(fromRel,targetRel){
 let rel=path.posix.relative(path.posix.dirname(fromRel),targetRel);
 return rel||path.posix.basename(targetRel);
}
function assetVersion(targetRel){
 const clean=String(targetRel||"").split(/[?#]/)[0].replace(/^\/+/,"");
 if(assetVersionCache.has(clean))return assetVersionCache.get(clean);
 const file=path.join(siteRoot,...clean.split("/"));
 if(!fs.existsSync(file))throw new Error(`Versioned asset is missing: ${clean}`);
 const version=stableFileHash(file,12);
 assetVersionCache.set(clean,version);
 return version;
}
function versionedRelativeFile(currentRel,targetRel){
 return `${relativeFile(currentRel,targetRel)}?v=${assetVersion(targetRel)}`;
}
function versionExistingAsset(html,targetRel){
 const escaped=targetRel.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const pattern=new RegExp(`((?:src|href)\\s*=\\s*["'][^"']*${escaped})(?:\\?[^"']*)?(["'])`,"gi");
 return html.replace(pattern,`$1?v=${assetVersion(targetRel)}$2`);
}
function versionRelativeAsset(html,currentRel,targetRel){
 const relative=relativeFile(currentRel,targetRel);
 const escaped=relative.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const pattern=new RegExp(`((?:src|href)\\s*=\\s*["']${escaped})(?:\\?[^"']*)?(["'])`,"gi");
 return html.replace(pattern,`$1?v=${assetVersion(targetRel)}$2`);
}
function sharedRuntimeVersion(){
 return stableHash(sharedRuntimeAssets.map(item=>assetVersion(item.sitePath)).join(":"),12);
}
function removeHeadLinks(html){
 return html.replace(/<link\b[^>]*>/gi,tag=>{
  const isCanonical=/\brel\s*=\s*["'][^"']*\bcanonical\b[^"']*["']/i.test(tag);
  const isAlternate=/\brel\s*=\s*["'][^"']*\balternate\b[^"']*["']/i.test(tag)&&/\bhreflang\s*=/i.test(tag);
  return isCanonical||isAlternate?"":tag;
 });
}
function removeNelMeta(html){
 return html.replace(/<meta\b[^>]*\bname\s*=\s*["']nel-(?:locale|route|available-locales|framework)["'][^>]*>\s*/gi,"");
}
function setHtmlAttributes(html,locale,route){
 return html.replace(/<html\b([^>]*)>/i,(match,attrs)=>{
  let next=attrs.replace(/\s+lang\s*=\s*["'][^"']*["']/i,"").replace(/\s+dir\s*=\s*["'][^"']*["']/i,"").replace(/\s+data-nel-locale\s*=\s*["'][^"']*["']/i,"").replace(/\s+data-nel-route\s*=\s*["'][^"']*["']/i,"");
  return `<html${next} lang="${escapeHtml(locale.htmlLang)}" dir="${escapeHtml(locale.direction||"ltr")}" data-nel-locale="${escapeHtml(locale.id)}" data-nel-route="${escapeHtml(route)}">`;
 });
}
function setRobots(html,locale,route){
 const planned=locale.status!=="active";
 if(route==="404.html"){
  if(/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*>/i.test(html))return html.replace(/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*>/i,'<meta name="robots" content="noindex,follow">');
  return html.replace(/<\/head>/i,'<meta name="robots" content="noindex,follow">\n</head>');
 }
 if(planned){
  if(/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*>/i.test(html)){
   return html.replace(/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*>/i,'<meta name="robots" content="noindex,follow">');
  }
  return html.replace(/<\/head>/i,'<meta name="robots" content="noindex,follow">\n</head>');
 }
 return html.replace(/<meta\b([^>]*\bname\s*=\s*["']robots["'][^>]*)>/i,tag=>{
  return /\bnoindex\b/i.test(tag)?'<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">':tag;
 });
}
function routeFromSitePath(sitePath){
 let clean=String(sitePath||"/").replace(/^\/+|\/+$/g,"");
 let parts=clean?clean.split("/"):[];
 const knownFolders=new Set(localeConfig.locales.filter(item=>item.folder).map(item=>item.folder));
 if(parts[0]==="en")parts=parts.slice(1);
 else if(knownFolders.has(parts[0]))parts=parts.slice(1);
 if(parts[0]==="tools"){
  if(parts[1]==="en"||knownFolders.has(parts[1]))parts=["tools",...parts.slice(2)];
  else if(parts[2]==="en"||knownFolders.has(parts[2]))parts=[parts[0],parts[1],...parts.slice(3)];
 }
 if(!parts.length)return"";
 if(parts[0]==="tools"&&parts.length===1)return"tools/";
 if(parts[0]==="tools"&&parts.length>=2)return`tools/${parts[1]}/`;
 if(parts.length===1&&rootDirectoryRoutes.has(`${parts[0]}/`))return`${parts[0]}/`;
 return parts.join("/");
}
function localizeSiteUrl(value,locale){
 if(typeof value!=="string"||!value.startsWith(localeConfig.siteUrl))return value;
 try{
  const parsed=new URL(value);
  const route=routeFromSitePath(parsed.pathname);
  return localeConfig.siteUrl+urlForRoute(route,locale)+parsed.search+parsed.hash;
 }catch{return value}
}
function updateJsonLd(html,locale,canonical){
 return html.replace(/<script\b([^>]*type\s*=\s*["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi,(whole,attrs,body)=>{
  try{
   const data=JSON.parse(body.trim());
   const visit=node=>{
    if(Array.isArray(node)){node.forEach(visit);return}
    if(!node||typeof node!=="object")return;
    if(Object.prototype.hasOwnProperty.call(node,"inLanguage"))node.inLanguage=locale.htmlLang;
    for(const key of ["url","item"]){
     if(typeof node[key]==="string"&&node[key].startsWith(localeConfig.siteUrl))node[key]=localizeSiteUrl(node[key],locale);
    }
    if(node["@type"]==="Organization"&&node.name==="NetEngineerLab")node.url=localeConfig.siteUrl+urlForRoute("",locale);
    Object.values(node).forEach(visit);
   };
   visit(data);
   if(data&&typeof data==="object"&&!Array.isArray(data)&&typeof data.url==="string")data.url=canonical;
   return `<script${attrs}>${JSON.stringify(data)}</script>`;
  }catch{return whole}
 });
}
function replaceLanguageMenu(html,menuMarkup){
 const marker=/<!-- NEL_LANGUAGE_MENU_START -->[\s\S]*?<!-- NEL_LANGUAGE_MENU_END -->/i;
 if(marker.test(html))return html.replace(marker,menuMarkup);
 const anchor=/<a\b[^>]*class\s*=\s*["'][^"']*\blanguage\b[^"']*["'][^>]*>[\s\S]*?<\/a>/i;
 if(anchor.test(html))return html.replace(anchor,menuMarkup);
 const actions=/<div\b[^>]*class\s*=\s*["'][^"']*\bactions\b[^"']*["'][^>]*>/i;
 if(actions.test(html))return html.replace(actions,match=>match+menuMarkup);
 return html;
}
function normalizeBrandLogoAlt(html){
 return html.replace(/(<img\b[^>]*\balt\s*=\s*)(["'])NetEngineerLab\2/gi,'$1$2$2');
}
function rewriteInternalAnchors(html,currentRel,currentInfo,groups){
 const currentLocale=localeMap.get(currentInfo.localeId);
 const currentUrl=urlForRoute(currentInfo.route,currentLocale);
 return html.replace(/<a\b([^>]*?)\bhref\s*=\s*(["'])(.*?)\2([^>]*)>/gi,(whole,before,quote,href,after)=>{
  if(!href||/^(?:[a-z]+:|\/\/|#)/i.test(href))return whole;
  const match=href.match(/^([^?#]*)([?#].*)?$/);
  const pathPart=match?match[1]:href;
  const suffix=match&&match[2]?match[2]:"";
  if(!pathPart)return whole;
  let targetRel;
  if(pathPart.startsWith("/")){
   targetRel=pathPart.replace(/^\/+/,"");
  }else{
   targetRel=path.posix.normalize(path.posix.join(path.posix.dirname(currentRel),pathPart));
  }
  if(pathPart.endsWith("/"))targetRel=path.posix.join(targetRel,"index.html");
  const targetInfo=identifyPage(targetRel);
  if(!targetInfo)return whole;
  const group=groups.get(targetInfo.route);
  if(!group||!group.has(currentLocale.id))return whole;
  const localized=urlForRoute(targetInfo.route,currentLocale);
  const rewritten=relativeUrl(currentUrl,localized)+suffix;
  return `<a${before}href=${quote}${rewritten}${quote}${after}>`;
 });
}
function ensureAsset(html,currentRel,targetRel,type){
 const href=versionedRelativeFile(currentRel,targetRel);
 if(type==="css"){
  html=html.replace(/<link\b[^>]*href\s*=\s*["'][^"']*locale-menu\.css[^"']*["'][^>]*>\s*/gi,"");
  return html.replace(/<\/head>/i,`<link rel="stylesheet" href="${href}">\n</head>`);
 }
 const escaped=path.posix.basename(targetRel).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 html=html.replace(new RegExp(`<script\\b[^>]*src\\s*=\\s*["'][^"']*${escaped}[^"']*["'][^>]*><\\/script>\\s*`,"gi"),"");
 return html.replace(/<\/head>/i,`<script defer src="${href}"></script>\n</head>`);
}
function menuMarkup(currentInfo,group){
 const currentLocale=localeMap.get(currentInfo.localeId);
 const available=activeLocales.filter(locale=>group.has(locale.id));
 const currentUrl=urlForRoute(currentInfo.route,currentLocale);
 const options=available.map(locale=>{
  const href=relativeUrl(currentUrl,urlForRoute(currentInfo.route,locale));
  const current=locale.id===currentLocale.id;
  return `<a class="language-option" role="menuitem" href="${escapeHtml(href)}" lang="${escapeHtml(locale.htmlLang)}" hreflang="${escapeHtml(locale.hreflang)}"${current?' aria-current="page"':""}><span>${escapeHtml(locale.nativeLabel)}</span><small>${escapeHtml(locale.label)}</small></a>`;
 }).join("");
 const label=currentLocale.ui?.language||"Language";
 const accessibleLabel=`${label}: ${currentLocale.nativeLabel}`;
 return `<!-- NEL_LANGUAGE_MENU_START --><div class="language-menu" data-language-menu data-open="false"><button class="language-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${escapeHtml(accessibleLabel)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3.1a15.7 15.7 0 0 0-1.4-3.4A8.1 8.1 0 0 1 18.9 8ZM12 4c.9 1.1 1.6 2.4 2 4h-4c.4-1.6 1.1-2.9 2-4ZM4.3 14a8.4 8.4 0 0 1 0-4h3.4a16 16 0 0 0 0 4H4.3Zm.8 2h3.1a15.7 15.7 0 0 0 1.4 3.4A8.1 8.1 0 0 1 5.1 16Zm3.1-8H5.1a8.1 8.1 0 0 1 4.5-3.4A15.7 15.7 0 0 0 8.2 8ZM12 20c-.9-1.1-1.6-2.4-2-4h4c-.4 1.6-1.1 2.9-2 4Zm2.4-.6a15.7 15.7 0 0 0 1.4-3.4h3.1a8.1 8.1 0 0 1-4.5 3.4ZM16.3 14a14 14 0 0 0 0-4h3.4a8.4 8.4 0 0 1 0 4h-3.4ZM9.7 10h4.6a12 12 0 0 1 0 4H9.7a12 12 0 0 1 0-4Z"/></svg><span class="language-current">${escapeHtml(currentLocale.nativeLabel)}</span><span class="language-caret" aria-hidden="true">▾</span></button><div class="language-options" role="menu" hidden>${options}</div></div><!-- NEL_LANGUAGE_MENU_END -->`;
}
function updateManifestLink(html,currentRel,info){
 if(info.kind!=="tool")return html;
 const locale=localeMap.get(info.localeId);
 const fileName=locale.id===defaultLocale.id?"manifest.webmanifest":`manifest-${locale.folder}.webmanifest`;
 const manifestRel=`tools/${info.toolSlug}/${fileName}`;
 const href=relativeFile(currentRel,manifestRel);
 html=html.replace(/<link\b[^>]*\brel\s*=\s*["'][^"']*\bmanifest\b[^"']*["'][^>]*>\s*/gi,"");
 return html.replace(/<\/head>/i,`<link rel="manifest" href="${href}">\n</head>`);
}
function generateRuntimeFiles(){
 fs.writeFileSync(path.join(dataDir,"locales.js"),`window.NEL_I18N=${JSON.stringify(localeConfig)};\nwindow.NEL_LOCALES=window.NEL_I18N.locales;\n`,"utf8");
 fs.writeFileSync(path.join(dataDir,"tools-catalog.js"),`window.NEL_TOOLS=${JSON.stringify(toolCatalog)};\n`,"utf8");
}
function generateManifests(groups){
 for(const tool of toolCatalog.filter(item=>item.status==="active")){
  const toolRoot=path.join(siteRoot,"tools",tool.id);
  const baseManifestPath=path.join(toolRoot,"manifest.webmanifest");
  if(!fs.existsSync(toolRoot)||!fs.existsSync(baseManifestPath))continue;
  let template={};
  try{template=JSON.parse(fs.readFileSync(baseManifestPath,"utf8"))}catch{}
  for(const locale of activeLocales){
   const route=`tools/${tool.id}/`;
   if(!groups.get(route)?.has(locale.id))continue;
   const translation=tool.translations?.[locale.catalogKey]||tool.translations?.[locale.id]||tool.translations?.[localeConfig.fallbackLocale]||{};
   const manifest={
    ...template,
    id:urlForRoute(route,locale),
    scope:`/tools/${tool.id}/`,
    name:`NetEngineerLab ${translation.name||tool.id}`,
    short_name:translation.name||tool.id,
    description:translation.description||"",
    lang:locale.htmlLang,
    start_url:urlForRoute(route,locale)
   };
   const fileName=locale.id===defaultLocale.id?"manifest.webmanifest":`manifest-${locale.folder}.webmanifest`;
   fs.writeFileSync(path.join(toolRoot,fileName),JSON.stringify(manifest,null,2)+"\n","utf8");
  }
  const swPath=path.join(toolRoot,"sw.js");
  if(fs.existsSync(swPath)){
   let sw=fs.readFileSync(swPath,"utf8");
   const head=/const C=(["'])(.*?)\1,A=(\[[\s\S]*?\]);/;
   const match=sw.match(head);
   if(match){
    let assets=[];
    try{assets=JSON.parse(match[3])}catch{}
    const folders=localeConfig.locales.filter(item=>item.folder).map(item=>item.folder);
    assets=assets.filter(item=>!folders.some(folder=>item===`./${folder}/index.html`)&&!/^\.\/manifest-[^/]+\.webmanifest$/.test(item));
    if(!assets.includes("./index.html"))assets.unshift("./index.html");
    if(!assets.includes("./manifest.webmanifest"))assets.push("./manifest.webmanifest");
    assets=assets.filter(item=>!sharedRuntimeAssets.some(asset=>item.split("?")[0]===asset.cachePath));
    for(const sharedAsset of sharedRuntimeAssets){
     assets.push(`${sharedAsset.cachePath}?v=${assetVersion(sharedAsset.sitePath)}`);
    }
    for(const locale of activeLocales.filter(item=>item.id!==defaultLocale.id)){
     if(groups.get(`tools/${tool.id}/`)?.has(locale.id)){
      assets.push(`./${locale.folder}/index.html`,`./manifest-${locale.folder}.webmanifest`);
     }
    }
    assets=assets.map(item=>{
     const clean=item.split("?")[0];
     if(clean!=="./css/style.css"&&clean!=="./js/app.js")return item;
     const targetRel=`tools/${tool.id}/${clean.slice(2)}`;
     return fs.existsSync(path.join(siteRoot,...targetRel.split("/")))?`${clean}?v=${assetVersion(targetRel)}`:item;
    });
    assets=[...new Set(assets)];
    const replacement=`const C="nel-${tool.id}-locale-v${localeConfig.version}-${sharedRuntimeVersion()}",A=${JSON.stringify(assets)};`;
    sw=sw.replace(head,replacement);
    fs.writeFileSync(swPath,sw,"utf8");
   }
  }
 }
}
function generateSitemap(groups){
 const lines=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
 for(const record of sitemapConfig.routes){
  const group=groups.get(record.route);
  if(!group)continue;
  for(const locale of activeLocales){
   if(!group.has(locale.id))continue;
   lines.push(`  <url><loc>${localeConfig.siteUrl}${urlForRoute(record.route,locale)}</loc><changefreq>${record.changefreq}</changefreq><priority>${record.priority}</priority></url>`);
  }
 }
 lines.push("</urlset>","");
 fs.writeFileSync(path.join(siteRoot,"sitemap.xml"),lines.join("\n"),"utf8");
}
function build(){
 generateRuntimeFiles();
 const htmlFiles=walk(siteRoot).filter(file=>file.endsWith(".html"));
 const records=[];
 const groups=new Map();
 for(const file of htmlFiles){
  const rel=posix(path.relative(siteRoot,file));
  const info=identifyPage(rel);
  if(!info)continue;
  records.push({file,rel,info});
  if(!groups.has(info.route))groups.set(info.route,new Map());
  groups.get(info.route).set(info.localeId,rel);
 }
 for(const record of records){
  const locale=localeMap.get(record.info.localeId);
  const group=groups.get(record.info.route);
  if(!locale||!group)continue;
  let html=fs.readFileSync(record.file,"utf8");
  html=rewriteInternalAnchors(html,record.rel,record.info,groups);
  html=replaceLanguageMenu(html,menuMarkup(record.info,group));
  html=normalizeBrandLogoAlt(html);
  html=removeHeadLinks(removeNelMeta(html));
  html=setHtmlAttributes(html,locale,record.info.route);
  html=setRobots(html,locale,record.info.route);
  const canonical=localeConfig.siteUrl+urlForRoute(record.info.route,locale);
  const available=activeLocales.filter(item=>group.has(item.id));
  const seo=[
   `<meta name="nel-framework" content="NetEngineerLab Config-Driven Multilingual V${localeConfig.version}">`,
   `<meta name="nel-locale" content="${escapeHtml(locale.id)}">`,
   `<meta name="nel-route" content="${escapeHtml(record.info.route)}">`,
   `<meta name="nel-available-locales" content="${escapeHtml(available.map(item=>item.id).join(","))}">`
  ];
  if(record.info.route!=="404.html"){
   seo.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`);
   seo.push(...available.map(item=>`<link rel="alternate" hreflang="${escapeHtml(item.hreflang)}" href="${escapeHtml(localeConfig.siteUrl+urlForRoute(record.info.route,item))}">`));
   if(group.has(defaultLocale.id))seo.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(localeConfig.siteUrl+urlForRoute(record.info.route,defaultLocale))}">`);
  }
  html=html.replace(/<\/head>/i,seo.join("\n")+"\n</head>");
  html=updateJsonLd(html,locale,canonical);
  html=ensureAsset(html,record.rel,"assets/css/locale-menu.css","css");
  html=ensureAsset(html,record.rel,"data/locales.js","js");
  html=ensureAsset(html,record.rel,"data/site-config.js","js");
  html=ensureAsset(html,record.rel,"assets/js/analytics.js","js");
  html=ensureAsset(html,record.rel,"assets/js/adsense.js","js");
  if(record.info.kind==="home"||record.info.kind==="toolsDirectory")html=ensureAsset(html,record.rel,"data/tools-catalog.js","js");
  html=ensureAsset(html,record.rel,"assets/js/site.js","js");
  html=versionExistingAsset(html,"assets/js/tool-integration.js");
  if(record.info.kind==="tool"){
   const toolBase=`tools/${record.info.toolSlug}`;
   for(const localAsset of [`${toolBase}/css/style.css`,`${toolBase}/js/app.js`]){
    if(fs.existsSync(path.join(siteRoot,...localAsset.split("/"))))html=versionRelativeAsset(html,record.rel,localAsset);
   }
  }
  html=updateManifestLink(html,record.rel,record.info);
  html=html.replace(/<head>([\s\S]*?)<\/head>/i,(whole,body)=>`<head>${body.replace(/(?:\r?\n[ \t]*){3,}/g,"\n\n")}</head>`);
  fs.writeFileSync(record.file,html,"utf8");
 }
 generateManifests(groups);
 generateSitemap(groups);
 const report={
  version:localeConfig.version,
  activeLocales:activeLocales.map(item=>item.id),
  plannedLocales:localeConfig.locales.filter(item=>item.status!=="active").map(item=>item.id),
  routeGroups:groups.size,
  localizedPages:records.length,
  sitemapUrls:(fs.readFileSync(path.join(siteRoot,"sitemap.xml"),"utf8").match(/<loc>/g)||[]).length
 };
 fs.writeFileSync(path.join(packageRoot,"docs","MULTILINGUAL_BUILD_REPORT.json"),JSON.stringify(report,null,2)+"\n","utf8");
 console.log(JSON.stringify(report,null,2));
}
build();
