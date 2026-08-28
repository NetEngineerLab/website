#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const{stableFileHash,stableHash}=require("./stable-text-hash");

const packageRoot=path.resolve(__dirname,"..");
const siteRoot=path.join(packageRoot,"website");
const dataDir=path.join(siteRoot,"data");
const templateDir=path.join(siteRoot,"templates");
const localeConfig=JSON.parse(fs.readFileSync(path.join(dataDir,"locales.json"),"utf8"));
const toolCatalog=JSON.parse(fs.readFileSync(path.join(dataDir,"tools-catalog.json"),"utf8"));
const sitemapConfig=JSON.parse(fs.readFileSync(path.join(dataDir,"sitemap-routes.json"),"utf8"));
const defaultLocale=localeConfig.locales.find(item=>item.id===localeConfig.defaultLocale);
if(!defaultLocale)throw new Error("Default locale is missing from locales.json");
const folderMap=new Map(localeConfig.locales.filter(item=>item.folder).map(item=>[item.folder,item]));
const localeMap=new Map(localeConfig.locales.map(item=>[item.id,item]));
const activeLocales=localeConfig.locales.filter(item=>item.status==="active");
const activeTools=toolCatalog.filter(item=>item.status==="active");
const rootDirectoryRoutes=new Set(["about/","contact/","privacy/","terms/"]);
const sharedRuntimeAssets=[
 {sitePath:"data/locales.js",cachePath:"../../data/locales.js"},
 {sitePath:"data/site-config.js",cachePath:"../../data/site-config.js"},
 {sitePath:"assets/css/locale-menu.css",cachePath:"../../assets/css/locale-menu.css"},
 {sitePath:"assets/css/design-tokens.css",cachePath:"../../assets/css/design-tokens.css"},
 {sitePath:"assets/css/site-shell.css",cachePath:"../../assets/css/site-shell.css"},
 {sitePath:"assets/css/tool-design-system-v1.9.9-03.css",cachePath:"../../assets/css/tool-design-system-v1.9.9-03.css"},
 {sitePath:"assets/js/analytics.js",cachePath:"../../assets/js/analytics.js"},
 {sitePath:"assets/js/adsense.js",cachePath:"../../assets/js/adsense.js"},
 {sitePath:"assets/js/site.js",cachePath:"../../assets/js/site.js"},
 {sitePath:"assets/js/tool-integration.js",cachePath:"../../assets/js/tool-integration.js"},
 {sitePath:"assets/js/tool-shell-v1.9.9-04.js",cachePath:"../../assets/js/tool-shell-v1.9.9-04.js"}
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
function decodeEntities(value){
 return String(value??"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#0?39;|&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
}
function toolCopy(tool,locale){
 const translations=tool.translations||{};
 const fallback=localeMap.get(localeConfig.fallbackLocale)||defaultLocale;
 return translations[locale.catalogKey]
  ||translations[locale.id]
  ||translations[fallback.catalogKey]
  ||translations[fallback.id]
  ||translations.en
  ||{};
}
function renderToolCards(currentInfo,locale,mode){
 const currentUrl=urlForRoute(currentInfo.route,locale);
 const fallback=localeMap.get(localeConfig.fallbackLocale)||defaultLocale;
 const ui=Object.assign({openTool:"Open tool",planned:"In development"},fallback.ui||{},locale.ui||{});
 const tools=toolCatalog
  .slice()
  .sort((a,b)=>a.order-b.order)
  .filter(tool=>mode==="active"?tool.status==="active":mode==="planned"?tool.status==="planned":true);
 return tools.map(tool=>{
  const copy=toolCopy(tool,locale);
  const active=tool.status==="active";
  const tags=(copy.tags||[]).map(tag=>`<span>${escapeHtml(tag)}</span>`).join("");
  const href=relativeUrl(currentUrl,urlForRoute(`tools/${tool.id}/`,locale));
  return `<article class="${active?"tool-card":"tool-card planned"}" data-category="${escapeHtml(tool.category)}">
    <div class="tool-icon">${escapeHtml(tool.icon)}</div><h2>${escapeHtml(copy.name||tool.id)}</h2><p>${escapeHtml(copy.description||"")}</p>
    <div class="tool-tags">${tags}</div>
    ${active?`<a class="open" href="${escapeHtml(href)}">${escapeHtml(ui.openTool)}</a>`:`<div class="status">${escapeHtml(ui.planned)}</div>`}
   </article>`;
 }).join("");
}
function prerenderToolGrid(html,currentInfo,locale){
 const grid=html.match(/<div\b(?=[^>]*\bdata-tool-grid(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)[^>]*>/i);
 if(!grid)return html;
 const mode=grid[0].match(/\bdata-mode\s*=\s*["']([^"']+)["']/i)?.[1]||"all";
 const rendered=`<!-- NEL_TOOL_GRID_START -->${renderToolCards(currentInfo,locale,mode)}<!-- NEL_TOOL_GRID_END -->`;
 const marker=/<!-- NEL_TOOL_GRID_START -->[\s\S]*?<!-- NEL_TOOL_GRID_END -->/i;
 if(marker.test(html))html=html.replace(marker,rendered);
 else{
  const contentStart=grid.index+grid[0].length;
  const tail=html.slice(contentStart);
  const emptyClose=tail.match(/^(\s*)<\/div>/i);
  if(!emptyClose)throw new Error(`Tool grid must be empty or contain NEL tool-grid markers: ${currentInfo.route}`);
  html=html.slice(0,contentStart)+rendered+tail.slice(emptyClose[1].length);
 }
 if(currentInfo.kind!=="toolsDirectory")return html;
 const counts=toolCatalog.reduce((map,tool)=>{
  map[tool.category]=(map[tool.category]||0)+1;
  return map;
 },{});
 html=html.replace(/<span\b([^>]*\bdata-category-count\s*=\s*["']([^"']+)["'][^>]*)>[\s\S]*?<\/span>/gi,(whole,attrs,category)=>{
  const count=category==="all"?toolCatalog.length:(counts[category]||0);
  return `<span${attrs}>${count}</span>`;
 });
 const allButton=html.match(/<button\b(?=[^>]*\bdata-filter\s*=\s*["']all["'])[^>]*>/i)?.[0]||"";
 const allLabel=allButton.match(/\bdata-filter-label\s*=\s*["']([^"']+)["']/i)?.[1]||"all";
 html=html.replace(/<p\b([^>]*\bdata-filter-status(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*)>[\s\S]*?<\/p>/i,(whole,attrs)=>{
  const template=attrs.match(/\bdata-template\s*=\s*["']([^"']+)["']/i)?.[1]||"{count} tools · {category}";
  const status=template.replace("{count}",String(toolCatalog.length)).replace("{category}",allLabel);
  return `<p${attrs}>${status}</p>`;
 });
 return html;
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
function ensureOpenGraphMeta(html,canonical){
 const ensure=(property,content)=>{
  const pattern=new RegExp(`<meta\\b[^>]*\\bproperty\\s*=\\s*["']${property}["'][^>]*>`,"i");
  if(pattern.test(html)){
   html=html.replace(pattern,tag=>/\bcontent\s*=\s*["'][^"']*["']/i.test(tag)
    ?tag.replace(/\bcontent\s*=\s*["'][^"']*["']/i,`content="${escapeHtml(content)}"`)
    :tag.replace(/\s*\/?\s*>$/,` content="${escapeHtml(content)}">`));
  }else{
   html=html.replace(/<\/head>/i,`<meta property="${property}" content="${escapeHtml(content)}">\n</head>`);
  }
 };
 ensure("og:url",canonical);
 if(!/<meta\b[^>]*\bproperty\s*=\s*["']og:image["'][^>]*>/i.test(html)){
  ensure("og:image",`${localeConfig.siteUrl}/assets/images/og-netengineerlab.png`);
 }
 return html;
}
function ensureWebPageSchema(html,canonical,locale){
 let hasPrimaryEntity=false;
 for(const block of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{
   const visit=node=>{
    if(Array.isArray(node)){node.forEach(visit);return}
    if(!node||typeof node!=="object")return;
    if(node.url===canonical&&node.inLanguage===locale.htmlLang)hasPrimaryEntity=true;
    Object.values(node).forEach(visit);
   };
   visit(JSON.parse(block[1].trim()));
  }catch{}
 }
 if(hasPrimaryEntity)return html;
 const title=decodeEntities(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"NetEngineerLab");
 const descriptionTag=(html.match(/<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/i)||[])[0]||"";
 const description=decodeEntities(descriptionTag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1]||"");
 const schema={
  "@context":"https://schema.org",
  "@type":"WebPage",
  name:title,
  url:canonical,
  description,
  inLanguage:locale.htmlLang,
  isPartOf:{"@type":"WebSite",name:"NetEngineerLab",url:localeConfig.siteUrl+urlForRoute("",locale)}
 };
 return html.replace(/<\/head>/i,`<script type="application/ld+json" data-nel-schema="webpage">${JSON.stringify(schema)}</script>\n</head>`);
}
function replaceLanguageMenu(html,menuMarkup){
 const marker=/<!-- NEL_LANGUAGE_MENU_START -->[\s\S]*?<!-- NEL_LANGUAGE_MENU_END -->/i;
 const nestedWrapper=/<div\b[^>]*class\s*=\s*["'][^"']*\blanguage-menu\b[^"']*["'][^>]*>\s*<button\b[^>]*class\s*=\s*["'][^"']*\blanguage-trigger\b[^"']*["'][^>]*>[\s\S]*?<\/button>\s*<div\b[^>]*class\s*=\s*["'][^"']*\blanguage-options\b[^"']*["'][^>]*>\s*(<!-- NEL_LANGUAGE_MENU_START -->[\s\S]*?<!-- NEL_LANGUAGE_MENU_END -->)[\s\S]*?<\/div>\s*<\/div>/i;
 if(nestedWrapper.test(html))html=html.replace(nestedWrapper,"$1");
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
  const escaped=path.posix.basename(targetRel).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  html=html.replace(new RegExp(`<link\\b[^>]*href\\s*=\\s*["'][^"']*${escaped}[^"']*["'][^>]*>\\s*`,"gi"),"");
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
function renderShellTemplate(kind,locale,tokens){
 const file=path.join(templateDir,`${kind}-${locale.id}.html`);
 if(!fs.existsSync(file))throw new Error(`Missing ${kind} template for active locale ${locale.id}: ${posix(path.relative(packageRoot,file))}`);
 let template=fs.readFileSync(file,"utf8").trim();
 for(const [name,value] of Object.entries(tokens))template=template.replaceAll(`{{${name}}}`,value);
 const unresolved=[...template.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map(match=>match[1]);
 if(unresolved.length)throw new Error(`${posix(path.relative(packageRoot,file))}: unresolved tokens ${unresolved.join(", ")}`);
 return template;
}
function injectSiteShell(html,currentRel,currentInfo){
 const locale=localeMap.get(currentInfo.localeId);
 const currentUrl=urlForRoute(currentInfo.route,locale);
 const href=route=>escapeHtml(relativeUrl(currentUrl,urlForRoute(route,locale)));
 const current=route=>currentInfo.route===route?' aria-current="page"':"";
 if(currentInfo.kind==="tool"&&!/<main\b[^>]*\bid=["'][^"']+["']/i.test(html))html=html.replace(/<main\b/i,'<main id="calculator"');
 const mainId=(html.match(/<main\b[^>]*\bid=["']([^"']+)["']/i)||[])[1]||"calculator";
 const contextAction=currentInfo.kind==="tool"
  ?`<a href="#${escapeHtml(mainId)}">${locale.id===defaultLocale.id?"Start calculating":"开始计算"}</a>`
  :"";
 const tokens={
  HOME_HREF:href(""),
  TOOLS_HREF:href("tools/"),
  ABOUT_HREF:href("about/"),
  CONTACT_HREF:href("contact/"),
  PRIVACY_HREF:href("privacy/"),
  TERMS_HREF:href("terms/"),
  LOGO_HREF:escapeHtml(relativeFile(currentRel,"assets/images/logo.svg")),
  HOME_CURRENT:current(""),
  TOOLS_CURRENT:currentInfo.route==="tools/"||currentInfo.kind==="tool"?' aria-current="page"':"",
  ABOUT_CURRENT:current("about/"),
  CONTACT_CURRENT:current("contact/"),
  CONTEXT_ACTION:contextAction
 };
 const header=`<!-- NEL_HEADER_START -->\n${renderShellTemplate("header",locale,tokens)}\n<!-- NEL_HEADER_END -->`;
 const footer=`<!-- NEL_FOOTER_START -->\n${renderShellTemplate("footer",locale,tokens)}\n<!-- NEL_FOOTER_END -->`;
 const headerMarkers=/<!-- NEL_HEADER_START -->[\s\S]*?<!-- NEL_HEADER_END -->/i;
 const footerMarkers=/<!-- NEL_FOOTER_START -->[\s\S]*?<!-- NEL_FOOTER_END -->/i;
 if(headerMarkers.test(html))html=html.replace(headerMarkers,header);
 else if(/<header\b[\s\S]*?<\/header>/i.test(html))html=html.replace(/<header\b[\s\S]*?<\/header>/i,header);
 else throw new Error(`${currentRel}: header missing`);
 if(footerMarkers.test(html))html=html.replace(footerMarkers,footer);
 else if(/<footer\b[\s\S]*?<\/footer>/i.test(html))html=html.replace(/<footer\b[\s\S]*?<\/footer>/i,footer);
 else throw new Error(`${currentRel}: footer missing`);
 return html;
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
   const compactHead=/const C=(["'])(.*?)\1,A=(\[[\s\S]*?\]);/;
   const verboseHead=/const CACHE\s*=\s*(["'])(.*?)\1;\s*const CORE\s*=\s*(\[[\s\S]*?\]);/;
   const compactMatch=sw.match(compactHead);
   const verboseMatch=sw.match(verboseHead);
   const match=compactMatch||verboseMatch;
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
    const cacheName=`nel-${tool.id}-locale-v${localeConfig.version}-${sharedRuntimeVersion()}`;
    const replacement=compactMatch
     ?`const C=${JSON.stringify(cacheName)},A=${JSON.stringify(assets)};`
     :`const CACHE = ${JSON.stringify(cacheName)};\nconst CORE = ${JSON.stringify(assets,null,2)};`;
    sw=sw.replace(compactMatch?compactHead:verboseHead,replacement);
    fs.writeFileSync(swPath,sw,"utf8");
   }
  }
 }
}
function generateSitemap(groups){
 const lines=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
 const toolRecords=activeTools.map(tool=>({route:`tools/${tool.id}/`,changefreq:"monthly",priority:"0.9"}));
 const records=[...sitemapConfig.routes,...toolRecords];
 const seen=new Set();
 for(const record of records){
  if(seen.has(record.route))throw new Error(`Duplicate sitemap route: ${record.route}`);
  seen.add(record.route);
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
  html=injectSiteShell(html,record.rel,record.info);
  html=replaceLanguageMenu(html,menuMarkup(record.info,group));
  if(record.info.kind==="home"||record.info.kind==="toolsDirectory")html=prerenderToolGrid(html,record.info,locale);
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
  if(record.info.route!=="404.html")html=ensureOpenGraphMeta(html,canonical);
  if(record.info.route!=="404.html")html=ensureWebPageSchema(html,canonical,locale);
  html=html.replace(/<\/head>/i,seo.join("\n")+"\n</head>");
  html=updateJsonLd(html,locale,canonical);
  html=ensureAsset(html,record.rel,"assets/css/locale-menu.css","css");
  html=ensureAsset(html,record.rel,"assets/css/design-tokens.css","css");
  html=ensureAsset(html,record.rel,"assets/css/site-shell.css","css");
  html=ensureAsset(html,record.rel,"data/locales.js","js");
  html=ensureAsset(html,record.rel,"data/site-config.js","js");
  html=ensureAsset(html,record.rel,"assets/js/analytics.js","js");
  html=ensureAsset(html,record.rel,"assets/js/adsense.js","js");
  if(record.info.kind==="home"||record.info.kind==="toolsDirectory")html=ensureAsset(html,record.rel,"data/tools-catalog.js","js");
  html=ensureAsset(html,record.rel,"assets/js/site.js","js");
  html=versionExistingAsset(html,"assets/css/tool-design-system-v1.9.9-03.css");
  html=versionExistingAsset(html,"assets/js/tool-integration.js");
  html=versionExistingAsset(html,"assets/js/tool-shell-v1.9.9-04.js");
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
