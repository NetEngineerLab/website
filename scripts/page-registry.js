#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const{pageSignals,toolPageFile,intentByTool,intentLabels,owner}=require("./seo-geo-coverage-audit");
const SCHEMA_VERSION="2.0.0";
const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");

function readJson(rel){return JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"))}
function invariant(value,message){if(!value)throw new Error(message)}
function nonEmptyString(value){return typeof value==="string"&&value.trim().length>0}
function fillRoute(template,values){
  invariant(nonEmptyString(template),"directory strategy template is missing");
  invariant(!/[\\?#%\u0000-\u001f]/.test(template),`route template contains forbidden characters: ${template}`);
  const tokens=[...template.matchAll(/\{([^}]+)\}/g)].map(match=>match[1]);
  for(const token of tokens)invariant(Object.hasOwn(values,token),`route template token is unsupported: ${token}`);
  const expanded=template.replace(/\{([^}]+)\}/g,(match,token)=>values[token]);
  invariant(!/[\\?#%\u0000-\u001f]/.test(expanded),`expanded route contains forbidden characters: ${expanded}`);
  const route=expanded.replace(/\/{2,}/g,"/");
  invariant(route.startsWith("/")&&route.endsWith("/"),`expanded route must be absolute and trailing-slash: ${route}`);
  invariant(!route.split("/").some(segment=>segment==="."||segment===".."),`expanded route contains traversal segment: ${route}`);
  return route;
}
function validateTranslation(copy,context){
  invariant(copy&&typeof copy==="object"&&!Array.isArray(copy),`${context}: translation must be an object`);
  invariant(nonEmptyString(copy.title),`${context}: title is required`);
  invariant(nonEmptyString(copy.description),`${context}: description is required`);
}
function validateLocalized(value,localeKeys,context,itemValidator){
  invariant(value&&typeof value==="object"&&!Array.isArray(value),`${context} must be an object`);
  const keys=Object.keys(value);
  invariant(keys.length>0,`${context} is empty`);
  for(const key of keys){
    invariant(localeKeys.has(key),`${context} uses unconfigured locale key: ${key}`);
    itemValidator(value[key],`${context}/${key}`);
  }
}
function validateStringArray(value,context,{min=0,prefix}={}){
  invariant(Array.isArray(value)&&value.length>=min,`${context} must contain at least ${min} item(s)`);
  invariant(new Set(value).size===value.length,`${context} contains duplicates`);
  for(const item of value){invariant(nonEmptyString(item),`${context} contains an empty item`);if(prefix)invariant(item.startsWith(prefix),`${context} item must start with ${prefix}`)}
}
function validateLocalPath(value,context,{allowSuffix=true}={}){
  invariant(nonEmptyString(value)&&value.startsWith("/"),`${context} must be an absolute local path`);
  invariant(!/[\\%\u0000-\u001f]/.test(value),`${context} contains forbidden path characters`);
  if(!allowSuffix)invariant(!/[?#]/.test(value),`${context} must not contain query or fragment`);
  const pathname=value.split(/[?#]/,1)[0];
  invariant(!pathname.split("/").some(segment=>segment==="."||segment===".."),`${context} contains traversal segment`);
  const parsed=new URL(value,"https://registry.invalid/");
  invariant(parsed.origin==="https://registry.invalid"&&parsed.pathname===pathname,`${context} normalization differs`);
}
function validateHttpsUrl(value,context){
  let parsed;try{parsed=new URL(value)}catch{throw new Error(`${context} must be a valid HTTPS URL`)}
  invariant(parsed.protocol==="https:"&&nonEmptyString(parsed.hostname)&&parsed.username===""&&parsed.password==="",`${context} must be a valid HTTPS URL without credentials`);
}
function validateDate(value,context){
  invariant(typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value),`${context} must be an ISO date`);
  const parsed=new Date(`${value}T00:00:00Z`);
  invariant(!Number.isNaN(parsed.valueOf())&&parsed.toISOString().slice(0,10)===value,`${context} must be a real calendar date`);
}
function validateFamily(family,schema,localeKeys){
  const allowedKeys=new Set(Object.keys(schema.properties));
  invariant(family&&typeof family==="object"&&!Array.isArray(family),"page family must be an object");
  for(const key of schema.required||[])invariant(Object.hasOwn(family,key),`${family.id||"page family"}: ${key} is required`);
  for(const key of Object.keys(family))invariant(allowedKeys.has(key),`${family.id||"page family"}: unknown field ${key}`);
  invariant(family.schemaVersion===schema.properties.schemaVersion.const,`${family.id}: schemaVersion must be ${SCHEMA_VERSION}`);
  invariant(nonEmptyString(family.id),"page family id must be a non-empty string");
  invariant(new RegExp(schema.properties.id.pattern).test(family.id),`${family.id}: invalid id`);
  invariant(schema.properties.pageType.enum.includes(family.pageType),`${family.id}: invalid pageType ${family.pageType}`);
  invariant(schema.properties.status.enum.includes(family.status),`${family.id}: invalid status ${family.status}`);
  invariant(typeof family.indexable==="boolean",`${family.id}: indexable must be boolean`);
  invariant(typeof family.route==="string",`${family.id}: route must be a string`);
  invariant(new RegExp(schema.properties.route.pattern).test(family.route),`${family.id}: invalid route ${family.route}`);
  invariant(family.status==="active"||family.indexable===false,`${family.id}: ${family.status} page must not be indexable`);
  invariant(family.translations&&typeof family.translations==="object"&&!Array.isArray(family.translations),`${family.id}: translations are required`);
  invariant(Object.keys(family.translations).length>0,`${family.id}: translations are empty`);
  for(const [localeId,copy] of Object.entries(family.translations)){invariant(localeKeys.has(localeId),`${family.id}: unconfigured translation locale: ${localeId}`);validateTranslation(copy,`${family.id}/${localeId}`)}
  validateLocalized(family.searchIntent,localeKeys,`${family.id}: searchIntent`,(value,context)=>invariant(nonEmptyString(value),`${context} is required`));
  validateLocalized(family.primaryTopic,localeKeys,`${family.id}: primaryTopic`,(value,context)=>invariant(nonEmptyString(value),`${context} is required`));
  validateLocalized(family.longTailQuestions,localeKeys,`${family.id}: longTailQuestions`,(value,context)=>validateStringArray(value,context,{min:1}));
  validateStringArray(family.breadcrumb,`${family.id}: breadcrumb`);
  for(const item of family.breadcrumb)invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item),`${family.id}: breadcrumb contains invalid family id`);
  validateStringArray(family.structuredData,`${family.id}: structuredData`,{min:1});
  validateStringArray(family.relatedContent,`${family.id}: relatedContent`,{prefix:"/"});
  family.relatedContent.forEach((item,index)=>validateLocalPath(item,`${family.id}: relatedContent[${index}]`));
  validateStringArray(family.sources,`${family.id}: sources`,{prefix:"https://"});
  family.sources.forEach((item,index)=>validateHttpsUrl(item,`${family.id}: sources[${index}]`));
  invariant(nonEmptyString(family.owner),`${family.id}: owner is required`);
  if(family.publishedAt===null)invariant(family.status==="planned",`${family.id}: only planned pages may have null publishedAt`);
  else validateDate(family.publishedAt,`${family.id}: publishedAt`);
  validateLocalized(family.reviewedAt,localeKeys,`${family.id}: reviewedAt`,(value,context)=>{if(value!==null)validateDate(value,context)});
  invariant(family.withdrawal===null||family.withdrawal&&typeof family.withdrawal==="object"&&!Array.isArray(family.withdrawal),`${family.id}: withdrawal must be null or an object`);
  if(family.status==="retired")invariant(family.withdrawal,`${family.id}: retired page requires withdrawal strategy`);
  else invariant(family.withdrawal===null,`${family.id}: only retired pages may define withdrawal strategy`);
  if(family.withdrawal){
    invariant(Object.keys(family.withdrawal).every(key=>key==="strategy"||key==="targetFamilyId"),`${family.id}: withdrawal contains unknown field`);
    invariant(["redirect","not-found","gone"].includes(family.withdrawal.strategy),`${family.id}: invalid withdrawal strategy`);
    if(family.withdrawal.strategy==="redirect"){
      invariant(nonEmptyString(family.withdrawal.targetFamilyId)&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(family.withdrawal.targetFamilyId),`${family.id}: redirect withdrawal requires targetFamilyId`);
      invariant(family.withdrawal.targetFamilyId!==family.id,`${family.id}: withdrawal redirect must not target itself`);
    }
    else invariant(!Object.hasOwn(family.withdrawal,"targetFamilyId"),`${family.id}: non-redirect withdrawal must not define targetFamilyId`);
  }
  if(Object.hasOwn(family,"changefreq"))invariant(schema.properties.changefreq.enum.includes(family.changefreq),`${family.id}: invalid changefreq`);
  if(Object.hasOwn(family,"priority"))invariant(typeof family.priority==="string"&&new RegExp(schema.properties.priority.pattern).test(family.priority),`${family.id}: invalid priority`);
  if(Object.hasOwn(family,"toolId"))invariant(typeof family.toolId==="string"&&new RegExp(schema.properties.toolId.pattern).test(family.toolId),`${family.id}: invalid toolId`);
  if(family.pageType==="tool")invariant(family.toolId===family.id,`${family.id}: toolId must equal stable tool id`);
  if(family.status==="active"&&family.indexable&&family.pageType!=="tool"){
    invariant(Object.hasOwn(family,"changefreq"),`${family.id}: active public page requires changefreq`);
    invariant(Object.hasOwn(family,"priority"),`${family.id}: active public page requires priority`);
  }
  return family;
}
function publicFamily(route){return{schemaVersion:SCHEMA_VERSION,...route}}
function toolFamily(tool,content){
  invariant(nonEmptyString(tool.id)&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.id),`${tool.id}: invalid id`);
  invariant(content,`${tool.id}: content facts are required`);
  return{
    schemaVersion:SCHEMA_VERSION,
    id:tool.id,
    pageType:"tool",
    status:tool.status,
    indexable:tool.status==="active",
    route:`tools/${tool.id}/`,
    toolId:tool.id,
    translations:Object.fromEntries(Object.entries(tool.translations||{}).map(([locale,copy])=>[locale,{title:copy.name,description:copy.description}])),
    searchIntent:content.searchIntent,
    primaryTopic:content.primaryTopic,
    longTailQuestions:content.longTailQuestions,
    breadcrumb:["home","tools-directory"],
    structuredData:content.structuredData,
    relatedContent:content.relatedContent,
    sources:content.sources,
    owner:content.owner,
    publishedAt:tool.publishedAt,
    reviewedAt:content.reviewedAt,
    withdrawal:tool.withdrawal??null
  };
}
function localizedRoute(family,locale,localeConfig){
  const strategy=localeConfig.directoryStrategy||{};
  const values={localeFolder:locale.folder||"",toolSlug:family.toolId||"",page:family.route};
  if(family.pageType==="home")return fillRoute(strategy.home,values);
  if(family.pageType==="directory"&&family.route==="tools/")return fillRoute(strategy.toolsDirectory,values);
  if(family.pageType==="tool")return fillRoute(strategy.toolPage,values);
  return fillRoute(strategy.rootPage,values);
}
function jsonLdTypes(html){
  const types=new Set();
  const walk=value=>{
    if(!value||typeof value!=="object")return;
    const type=value["@type"];
    for(const item of Array.isArray(type)?type:type?[type]:[])if(nonEmptyString(item))types.add(item);
    for(const child of Object.values(value))walk(child);
  };
  for(const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    try{walk(JSON.parse(match[1].trim()))}catch(error){throw new Error(`invalid JSON-LD while building Page Registry: ${error.message}`)}
  }
  return[...types].sort();
}
function existingIndexPathnames(){
  const output=[];
  const visit=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())visit(full);else if(entry.name==="index.html"){const relative=path.relative(site,full).split(path.sep).join("/");output.push(relative==="index.html"?"/":`/${relative.slice(0,-"index.html".length)}`)}}};
  visit(site);
  return output;
}
function loadRegistryInputs({toolsOverride}={}){
  const localeConfig=readJson("website/data/locales.json");
  const sitemapConfig=readJson("website/data/sitemap-routes.json");
  const tools=toolsOverride||readJson("website/data/tools-catalog.json");
  const schema=readJson("website/data/page-family.schema.json");
  const activeLocales=localeConfig.locales.filter(locale=>locale.status==="active");
  const toolContent=Object.fromEntries(tools.map(tool=>{
    const schemaTypes=new Set();
    const localizedSignals={};
    for(const locale of activeLocales){
      const location=toolPageFile(localeConfig,locale,tool.id,site);
      if(fs.existsSync(location.file)){
        const html=fs.readFileSync(location.file,"utf8");
        localizedSignals[locale.id]=pageSignals(html,`${localeConfig.siteUrl}${location.route}`,{includeInternalLinks:true});
        for(const type of jsonLdTypes(html))schemaTypes.add(type);
      }
    }
    const localeKeys=activeLocales.map(locale=>[locale,locale.catalogKey||locale.id]);
    const configuredContent=tool.pageContent||{};
    const intent=intentLabels[intentByTool[tool.id]];
    return[tool.id,{
      searchIntent:Object.fromEntries(localeKeys.map(([locale,key])=>[key,intent?.[locale.id]||configuredContent.searchIntent?.[key]])),
      primaryTopic:Object.fromEntries(localeKeys.map(([locale,key])=>[key,tool.translations?.[key]?.name])),
      longTailQuestions:Object.fromEntries(localeKeys.map(([locale,key])=>[key,localizedSignals[locale.id]?.longTailQuestions||configuredContent.longTailQuestions?.[key]])),
      structuredData:[...schemaTypes].length?[...schemaTypes]:(configuredContent.structuredData||[]),
      relatedContent:[...new Set(localeKeys.flatMap(([locale])=>localizedSignals[locale.id]?.internalLinks||configuredContent.relatedContent||[]))].sort(),
      sources:[...new Set(localeKeys.flatMap(([locale])=>localizedSignals[locale.id]?.externalReferences||configuredContent.sources||[]))].sort(),
      owner:configuredContent.owner||owner,
      reviewedAt:Object.fromEntries(localeKeys.map(([locale,key])=>[key,localizedSignals[locale.id]?.lastReviewedAt??configuredContent.reviewedAt?.[key]??null]))
    }];
  }));
  return{localeConfig,sitemapConfig,tools,schema,toolContent,existingPathnames:existingIndexPathnames()};
}
function buildPageRegistry({localeConfig,sitemapConfig,tools,schema,toolContent,existingPathnames}){
  invariant(localeConfig&&Array.isArray(localeConfig.locales),"locales.json: locales are required");
  invariant(sitemapConfig&&Array.isArray(sitemapConfig.routes),"sitemap-routes.json: routes are required");
  invariant(Array.isArray(tools),"tools-catalog.json must be an array");
  invariant(toolContent&&typeof toolContent==="object"&&!Array.isArray(toolContent),"tool content facts are required");
  invariant(Array.isArray(existingPathnames),"existing page pathnames are required");
  invariant(sitemapConfig.schemaVersion===SCHEMA_VERSION,`sitemap-routes.json schemaVersion must be ${SCHEMA_VERSION}`);
  const configuredLocales=localeConfig.locales;
  const activeLocales=configuredLocales.filter(locale=>locale.status==="active");
  invariant(activeLocales.length>0,"at least one active locale is required");
  const localeIds=new Set();const localeFolders=new Set();const catalogKeys=new Set();const htmlLangs=new Set();const hreflangs=new Set();
  for(const locale of configuredLocales){
    invariant(locale.status==="active"||locale.status==="planned",`${locale.id||"locale"}: invalid locale status`);
    invariant(nonEmptyString(locale.id)&&/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(locale.id),"locale id is invalid");
    const localeIdKey=locale.id.toLowerCase();invariant(!localeIds.has(localeIdKey),`duplicate locale id: ${locale.id}`);localeIds.add(localeIdKey);
    invariant(typeof locale.folder==="string"&&/^(?:|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(locale.folder),`invalid locale folder: ${locale.id}`);
    invariant(!localeFolders.has(locale.folder),`duplicate locale folder: ${locale.folder||"<root>"}`);localeFolders.add(locale.folder);
    invariant(nonEmptyString(locale.catalogKey),`${locale.id}: catalogKey is required`);
    const catalogKey=locale.catalogKey.toLowerCase();invariant(!catalogKeys.has(catalogKey),`duplicate locale catalogKey: ${locale.catalogKey}`);catalogKeys.add(catalogKey);
    invariant(nonEmptyString(locale.htmlLang)&&/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(locale.htmlLang),`${locale.id}: htmlLang must be a language tag`);
    const htmlLangKey=locale.htmlLang.toLowerCase();invariant(!htmlLangs.has(htmlLangKey),`duplicate locale htmlLang: ${locale.htmlLang}`);htmlLangs.add(htmlLangKey);
    invariant(typeof locale.hreflang!=="string"||locale.hreflang.toLowerCase()!=="x-default",`${locale.id}: hreflang must not use reserved x-default`);
    invariant(nonEmptyString(locale.hreflang)&&/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(locale.hreflang),`${locale.id}: hreflang must be a language tag`);
    const hreflangKey=locale.hreflang.toLowerCase();invariant(!hreflangs.has(hreflangKey),`duplicate locale hreflang: ${locale.hreflang}`);hreflangs.add(hreflangKey);
  }
  const defaultLocale=activeLocales.find(locale=>locale.id===localeConfig.defaultLocale);
  invariant(defaultLocale,"default locale must be active");
  invariant(defaultLocale.folder==="","default locale must use the root folder");
  const siteUrl=new URL(localeConfig.siteUrl);
  invariant(siteUrl.protocol==="https:"&&siteUrl.pathname==="/"&&siteUrl.search===""&&siteUrl.hash===""&&siteUrl.username===""&&siteUrl.password===""&&siteUrl.port==="","siteUrl must be an HTTPS origin without credentials or port");
  const localeKeys=new Set(configuredLocales.flatMap(locale=>[locale.id,locale.catalogKey]));
  const families=[...sitemapConfig.routes.map(publicFamily),...tools.map(tool=>toolFamily(tool,toolContent[tool.id]))].map(family=>validateFamily(family,schema,localeKeys));
  const ids=new Set();
  const routes=new Set();
  for(const family of families){
    invariant(!ids.has(family.id),`duplicate page family id: ${family.id}`);
    invariant(!routes.has(family.route),`duplicate page family route: ${family.route}`);
    ids.add(family.id);routes.add(family.route);
  }
  for(const family of families){
    for(const parentId of family.breadcrumb){
      invariant(ids.has(parentId),`${family.id}: breadcrumb target does not exist: ${parentId}`);
      invariant(parentId!==family.id,`${family.id}: breadcrumb must not reference itself`);
    }
    for(const related of family.relatedContent){
      const pathname=new URL(related,"https://registry.invalid/").pathname;
      invariant(existingPathnames.includes(pathname),`${family.id}: relatedContent target HTML is missing: ${pathname}`);
    }
    if(family.withdrawal?.strategy==="redirect"){
      invariant(ids.has(family.withdrawal.targetFamilyId),`${family.id}: withdrawal target family is missing: ${family.withdrawal.targetFamilyId}`);
      const target=families.find(candidate=>candidate.id===family.withdrawal.targetFamilyId);
      invariant(target.status==="active"&&target.indexable,`${family.id}: withdrawal target family must be active and indexable`);
    }
  }
  const familyMap=new Map(families.map(family=>[family.id,family]));
  const redirects=new Map(families.filter(family=>family.withdrawal?.strategy==="redirect").map(family=>[family.id,family.withdrawal.targetFamilyId]));
  for(const source of redirects.keys()){
    const seen=new Set([source]);let target=redirects.get(source);
    while(redirects.has(target)){invariant(!seen.has(target),`withdrawal redirect cycle detected at ${target}`);seen.add(target);target=redirects.get(target)}
  }
  const pages=[];
  for(const family of families){
    const localized=activeLocales.map(locale=>{
      const key=locale.catalogKey||locale.id;
      const copy=family.translations[key]||family.translations[locale.id];
      invariant(copy,`${family.id}: active locale translation missing: ${locale.id}`);
      validateTranslation(copy,`${family.id}/${locale.id}`);
      invariant(nonEmptyString(family.searchIntent[key]||family.searchIntent[locale.id]),`${family.id}: active locale searchIntent missing: ${locale.id}`);
      invariant(nonEmptyString(family.primaryTopic[key]||family.primaryTopic[locale.id]),`${family.id}: active locale primaryTopic missing: ${locale.id}`);
      validateStringArray(family.longTailQuestions[key]||family.longTailQuestions[locale.id],`${family.id}: active locale longTailQuestions missing: ${locale.id}`,{min:1});
      invariant(Object.hasOwn(family.reviewedAt,key)||Object.hasOwn(family.reviewedAt,locale.id),`${family.id}: active locale reviewedAt missing: ${locale.id}`);
      const pathname=localizedRoute(family,locale,localeConfig);
      const url=new URL(pathname,siteUrl);
      invariant(url.pathname===pathname&&url.search===""&&url.hash==="",`${family.id}/${locale.id}: pathname and URL normalization differ`);
      return{locale,key,copy,pathname,url};
    });
    const defaultRecord=localized.find(record=>record.locale.id===defaultLocale.id);
    const hreflang=Object.fromEntries(localized.map(record=>[record.locale.hreflang,record.url.href]));
    hreflang["x-default"]=defaultRecord.url.href;
    for(const record of localized){
      const{locale,copy,pathname,url}=record;
      const sitemapEligible=family.status==="active"&&family.indexable;
      if(sitemapEligible)invariant(existingPathnames.includes(pathname),`${family.id}/${locale.id}: active indexable target HTML is missing: ${pathname}`);
      let withdrawal=null;
      if(family.withdrawal){
        withdrawal={strategy:family.withdrawal.strategy};
        if(family.withdrawal.strategy==="redirect"){
          const targetFamily=familyMap.get(family.withdrawal.targetFamilyId);
          const targetPathname=localizedRoute(targetFamily,locale,localeConfig);
          invariant(targetPathname!==pathname,`${family.id}/${locale.id}: withdrawal redirect must not target itself`);
          invariant(existingPathnames.includes(targetPathname),`${family.id}/${locale.id}: localized withdrawal target HTML is missing: ${targetPathname}`);
          withdrawal.targetFamilyId=targetFamily.id;
          withdrawal.target=new URL(targetPathname,siteUrl).href;
        }
      }
      pages.push({
        schemaVersion:SCHEMA_VERSION,
        familyId:family.id,
        pageType:family.pageType,
        locale:locale.id,
        htmlLang:locale.htmlLang,
        title:copy.title,
        description:copy.description,
        pathname,
        url:url.href,
        canonical:url.href,
        hreflang:{...hreflang},
        robots:sitemapEligible?"index,follow":"noindex,follow",
        sitemapEligible,
        withdrawal
      });
    }
  }
  const pageUrls=new Set();
  for(const page of pages){invariant(!pageUrls.has(page.url),`duplicate localized page URL: ${page.url}`);pageUrls.add(page.url)}
  return{schemaVersion:SCHEMA_VERSION,families,pages,activeLocales:activeLocales.map(locale=>locale.id),defaultLocale:defaultLocale.id};
}
function loadPageRegistry(){
  return buildPageRegistry(loadRegistryInputs());
}

if(require.main===module){
  const registry=loadPageRegistry();
  console.log(JSON.stringify({schemaVersion:registry.schemaVersion,pageFamilies:registry.families.length,localizedPages:registry.pages.length,sitemapEligible:registry.pages.filter(page=>page.sitemapEligible).length,activeLocales:registry.activeLocales,status:"PASS"},null,2));
}

module.exports={SCHEMA_VERSION,buildPageRegistry,loadPageRegistry,loadRegistryInputs,validateFamily};
