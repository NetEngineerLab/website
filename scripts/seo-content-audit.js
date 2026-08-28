#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");

const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const origin="https://netengineerlab.com";
const errors=[];
const warnings=[];

const read=file=>fs.readFileSync(file,"utf8");
const decode=value=>String(value||"")
  .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
  .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
const tags=(html,name)=>[...html.matchAll(new RegExp(`<${name}\\b[^>]*>`,"gi"))].map(match=>match[0]);
const attr=(tag,name)=>decode(tag?.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`,"i"))?.[1]);
const meta=(html,key,value)=>tags(html,"meta").filter(tag=>attr(tag,key).toLowerCase()===value.toLowerCase());
const links=(html,rel)=>tags(html,"link").filter(tag=>attr(tag,"rel").toLowerCase().split(/\s+/).includes(rel));
const textContent=html=>decode(html
  .replace(/<script\b[\s\S]*?<\/script>/gi," ")
  .replace(/<style\b[\s\S]*?<\/style>/gi," ")
  .replace(/<[^>]+>/g," "));
const routeToFile=url=>{
  const pathname=new URL(url).pathname;
  return path.join(site,...pathname.split("/").filter(Boolean),"index.html");
};
const localeConfig=JSON.parse(read(path.join(site,"data","locales.json")));
const sitemapConfig=JSON.parse(read(path.join(site,"data","sitemap-routes.json")));
const toolCatalog=JSON.parse(read(path.join(site,"data","tools-catalog.json")));
const activeLocales=localeConfig.locales.filter(locale=>locale.status==="active");
const defaultLocale=activeLocales.find(locale=>locale.id===localeConfig.defaultLocale);
const rootRoutes=new Set(sitemapConfig.routes.map(item=>item.route));
const urlForRoute=(route,locale)=>{
  if(route==="")return locale.folder?`/${locale.folder}/`:"/";
  if(route==="tools/")return locale.folder?`/tools/${locale.folder}/`:"/tools/";
  if(route.startsWith("tools/")){
    const slug=route.split("/")[1];
    return locale.folder?`/tools/${slug}/${locale.folder}/`:`/tools/${slug}/`;
  }
  if(rootRoutes.has(route))return locale.folder?`/${locale.folder}/${route}`:`/${route}`;
  throw new Error(`Unsupported configured route: ${route}`);
};
const expectedRoutes=[
  ...sitemapConfig.routes.map(item=>item.route),
  ...toolCatalog.filter(tool=>tool.status==="active").map(tool=>`tools/${tool.id}/`)
];
const expectedRecords=expectedRoutes.flatMap(route=>activeLocales.map(locale=>({
  route,locale,url:`${localeConfig.siteUrl}${urlForRoute(route,locale)}`
})));
const expectedByUrl=new Map(expectedRecords.map(record=>[record.url,record]));

const sitemap=read(path.join(site,"sitemap.xml"));
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>decode(match[1]));
const pages=[];
const actualSet=new Set(urls);
const expectedSet=new Set(expectedByUrl.keys());
if(urls.length!==actualSet.size)errors.push("sitemap contains duplicate URLs");
for(const url of expectedSet)if(!actualSet.has(url))errors.push(`sitemap missing expected URL: ${url}`);
for(const url of actualSet)if(!expectedSet.has(url))errors.push(`sitemap contains unexpected URL: ${url}`);

for(const url of urls){
  const record=expectedByUrl.get(url);
  if(!record)continue;
  const file=routeToFile(url);
  const rel=path.relative(site,file).split(path.sep).join("/");
  if(!fs.existsSync(file)){errors.push(`${url}: file missing (${rel})`);continue}
  const html=read(file);
  const isZh=record.locale.id==="zh";
  const expectedLang=record.locale.htmlLang;
  const titleMatches=[...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(match=>decode(match[1]));
  const descriptions=meta(html,"name","description").map(tag=>attr(tag,"content"));
  const canonicals=links(html,"canonical").map(tag=>attr(tag,"href"));
  const h1s=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(match=>textContent(match[1]));
  const htmlLang=attr(html.match(/<html\b[^>]*>/i)?.[0],"lang");
  const alternates=new Map(links(html,"alternate").filter(tag=>attr(tag,"hreflang")).map(tag=>[attr(tag,"hreflang"),attr(tag,"href")]));
  const expectedAlternates=new Map(activeLocales.map(locale=>[locale.hreflang,`${localeConfig.siteUrl}${urlForRoute(record.route,locale)}`]));
  expectedAlternates.set("x-default",`${localeConfig.siteUrl}${urlForRoute(record.route,defaultLocale)}`);

  if(titleMatches.length!==1)errors.push(`${rel}: expected one title, found ${titleMatches.length}`);
  if(descriptions.length!==1)errors.push(`${rel}: expected one description, found ${descriptions.length}`);
  if(canonicals.length!==1||canonicals[0]!==url)errors.push(`${rel}: canonical must equal ${url}`);
  if(h1s.length!==1)errors.push(`${rel}: expected one h1, found ${h1s.length}`);
  if(htmlLang!==expectedLang)errors.push(`${rel}: html lang ${htmlLang||"missing"} != ${expectedLang}`);
  for(const [hreflang,href] of expectedAlternates){
    if(alternates.get(hreflang)!==href)errors.push(`${rel}: hreflang ${hreflang} must equal ${href}`);
  }
  if(alternates.size!==expectedAlternates.size)errors.push(`${rel}: expected exactly three hreflang links`);

  const ogTitle=meta(html,"property","og:title");
  const ogDescription=meta(html,"property","og:description");
  const ogImage=meta(html,"property","og:image");
  const ogUrl=meta(html,"property","og:url");
  if(ogTitle.length!==1||!attr(ogTitle[0],"content"))errors.push(`${rel}: one non-empty og:title required`);
  if(ogDescription.length!==1||!attr(ogDescription[0],"content"))errors.push(`${rel}: one non-empty og:description required`);
  if(ogImage.length!==1||!attr(ogImage[0],"content").startsWith(`${origin}/`))errors.push(`${rel}: one production og:image required`);
  if(ogUrl.length!==1||attr(ogUrl[0],"content")!==url)errors.push(`${rel}: og:url must equal canonical`);

  let schemaCount=0;
  const schemaEntities=[];
  let webpageSchema=null;
  for(const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    schemaCount++;
    try{
      const schema=JSON.parse(block[1].trim());
      const visit=node=>{
        if(Array.isArray(node)){node.forEach(visit);return}
        if(!node||typeof node!=="object")return;
        if(node["@type"])schemaEntities.push(node);
        Object.values(node).forEach(visit);
      };
      visit(schema);
      if(/\bdata-nel-schema=["']webpage["']/i.test(block[0]))webpageSchema=schema;
    }catch(error){errors.push(`${rel}: invalid JSON-LD (${error.message})`)}
  }
  if(!schemaCount)errors.push(`${rel}: JSON-LD structured data required`);
  if(schemaCount&&!schemaEntities.some(entity=>entity.url===url&&entity.inLanguage===expectedLang)){
    errors.push(`${rel}: JSON-LD must contain a primary entity with canonical url and language`);
  }

  const body=textContent(html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]||"");
  const bodyLength=body.length;
  if(bodyLength<300)warnings.push(`${rel}: thin visible content (${bodyLength} characters)`);
  const title=titleMatches[0]||"";
  const description=descriptions[0]||"";
  if(webpageSchema&&(webpageSchema.url!==url||webpageSchema.inLanguage!==expectedLang||webpageSchema.name!==title||webpageSchema.description!==description)){
    errors.push(`${rel}: generated WebPage schema must match canonical, language, title and description`);
  }
  const descriptionMin=isZh?22:50;
  const descriptionMax=isZh?100:180;
  if(title.length<15||title.length>75)warnings.push(`${rel}: title length ${title.length}`);
  if(description.length<descriptionMin||description.length>descriptionMax)warnings.push(`${rel}: description length ${description.length}`);
  pages.push({url,rel,route:record.route,locale:record.locale.id,title,description,h1:h1s[0]||"",bodyLength,schemaCount});
}

for(const page of pages.filter(item=>item.locale===defaultLocale.id)){
  const zhLocale=activeLocales.find(locale=>locale.id==="zh");
  const zhUrl=`${localeConfig.siteUrl}${urlForRoute(page.route,zhLocale)}`;
  const pair=pages.find(item=>item.url===zhUrl);
  if(!pair){errors.push(`${page.rel}: Chinese pair missing`);continue}
  if(page.title===pair.title)warnings.push(`${page.rel}: EN/ZH title is identical`);
  if(page.description===pair.description)warnings.push(`${page.rel}: EN/ZH description is identical`);
}

const duplicateDescriptions=new Map();
for(const page of pages){
  const key=`${page.locale}:${page.description.toLowerCase()}`;
  if(!page.description)continue;
  duplicateDescriptions.set(key,[...(duplicateDescriptions.get(key)||[]),page.rel]);
}
for(const duplicates of duplicateDescriptions.values()){
  if(duplicates.length>1)warnings.push(`duplicate meta description: ${duplicates.join(", ")}`);
}

const report={
  generatedAt:new Date().toISOString(),
  sitemapPages:urls.length,
  auditedPages:pages.length,
  expectedPages:expectedRecords.length,
  localePages:Object.fromEntries(activeLocales.map(locale=>[locale.id,pages.filter(page=>page.locale===locale.id).length])),
  errors:[...new Set(errors)],
  warnings:[...new Set(warnings)],
  status:errors.length?"FAIL":"PASS"
};
fs.writeFileSync(path.join(root,"docs","SEO_CONTENT_AUDIT_REPORT.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exit(1);
