#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const vm=require("vm");

const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const errors=[];
const warnings=[];

function read(file){return fs.readFileSync(file,"utf8")}
function json(rel){return JSON.parse(read(path.join(root,rel)))}
function rel(file){return path.relative(root,file).split(path.sep).join("/")}
function requireFile(file){if(!fs.existsSync(file))errors.push(`${rel(file)}: missing`)}
function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}
function metaContent(html,name){
  const tag=(html.match(new RegExp(`<meta\\b[^>]*name=["']${name}["'][^>]*>`,"i"))||[])[0]||"";
  return (tag.match(/content=["']([^"']*)["']/i)||[])[1]||"";
}
function validatePwaRegistration(toolId,toolRoot,localePath){
  const pageFile=path.join(toolRoot,...localePath.split("/"));
  const html=read(pageFile);
  const scriptMatch=html.match(/<script\b[^>]*src=["']([^"']*js\/pwa\.js[^"']*)["'][^>]*>/i);
  if(!scriptMatch){errors.push(`${rel(pageFile)}: PWA loader missing`);return}
  const pageUrl=new URL(`https://netengineerlab.com/tools/${toolId}/${localePath==="index.html"?"":"zh/"}`);
  const scriptUrl=new URL(scriptMatch[1],pageUrl);
  const registrations=[];
  const sandbox={
    URL,
    location:{protocol:"https:",href:pageUrl.href},
    navigator:{serviceWorker:{register:value=>{registrations.push(new URL(value,pageUrl).pathname);return Promise.resolve()}}},
    document:{
      currentScript:{src:scriptUrl.href},
      querySelector:selector=>selector==='meta[name="app-base"]'?{content:metaContent(html,"app-base")}:null
    },
    addEventListener:(name,callback)=>{if(name==="load"){sandbox.document.currentScript=null;callback()}}
  };
  sandbox.window=sandbox;
  try{vm.runInNewContext(read(path.join(toolRoot,"js","pwa.js")),sandbox,{filename:rel(path.join(toolRoot,"js","pwa.js"))})}
  catch(error){errors.push(`${rel(pageFile)}: PWA execution failed: ${error.message}`);return}
  const expected=`/tools/${toolId}/sw.js`;
  if(!registrations.includes(expected))errors.push(`${rel(pageFile)}: Service Worker registration ${registrations.join(", ")||"missing"} != ${expected}`);
}

const releaseVersion=read(path.join(root,"VERSION")).trim();
const packageJson=json("package.json");
const localeConfig=json("website/data/locales.json");
const siteConfig=json("website/data/site-config.json");
const sitemapConfig=json("website/data/sitemap-routes.json");
const tools=json("website/data/tools-catalog.json");
const migrationState=json("docs/architecture-migration-state.json");
const pendingEngineMigrations=new Set(migrationState.pendingEngineMigrations||[]);

for(const [name,value] of [
  ["package.json",packageJson.version],
  ["website/VERSION",read(path.join(site,"VERSION")).trim()],
  ["website/data/locales.json",localeConfig.version],
  ["website/data/site-config.json",siteConfig.version],
  ["website/data/sitemap-routes.json",sitemapConfig.version]
])if(value!==releaseVersion)errors.push(`${name}: version ${value||"missing"} != ${releaseVersion}`);

if(!Array.isArray(tools)||!tools.length)errors.push("website/data/tools-catalog.json: no tools found");
const activeTools=Array.isArray(tools)?tools.filter(tool=>tool.status==="active"):[];
const activeLocales=Array.isArray(localeConfig.locales)?localeConfig.locales.filter(locale=>locale.status==="active"):[];

for(const locale of activeLocales){
  requireFile(path.join(site,"templates",`header-${locale.id}.html`));
  requireFile(path.join(site,"templates",`footer-${locale.id}.html`));
}
for(const relPath of ["website/assets/css/design-tokens.css","website/assets/css/site-shell.css"])requireFile(path.join(root,relPath));

for(const tool of activeTools){
  const toolRoot=path.join(site,"tools",tool.id);
  for(const required of ["index.html","js/app.js","js/engine.js","docs/engine-test.js","js/pwa.js","manifest.webmanifest","sw.js"]){
    const file=path.join(toolRoot,...required.split("/"));
    if(required==="js/engine.js"&&!fs.existsSync(file)&&pendingEngineMigrations.has(tool.id)){
      warnings.push(`${rel(file)}: pending registered migration`);
    }else requireFile(file);
  }
  if(!fs.existsSync(toolRoot))continue;
  const sources=[];
  const visit=dir=>{
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      const full=path.join(dir,entry.name);
      if(entry.isDirectory())visit(full);
      else if(/\.(?:html|js)$/i.test(entry.name))sources.push(read(full));
    }
  };
  visit(toolRoot);
  if(!sources.some(source=>/serviceWorker\.register\s*\(/.test(source))){
    errors.push(`website/tools/${tool.id}: Service Worker is not registered`);
  }

  for(const localePath of ["index.html","zh/index.html"]){
    const file=path.join(toolRoot,...localePath.split("/"));
    if(!fs.existsSync(file)){errors.push(`${rel(file)}: missing`);continue}
    const html=read(file);
    for(const [name,pattern] of [
      ["title",/<title>[^<]+<\/title>/i],
      ["description",/<meta\b[^>]*name=["']description["']/i],
      ["viewport",/<meta\b[^>]*name=["']viewport["']/i],
      ["canonical",/<link\b[^>]*rel=["'][^"']*canonical/i],
      ["hreflang en",/hreflang=["']en["']/i],
      ["hreflang zh-CN",/hreflang=["']zh-CN["']/i],
      ["hreflang x-default",/hreflang=["']x-default["']/i]
    ])if(!pattern.test(html))errors.push(`${rel(file)}: ${name} missing`);
  }
  if(fs.existsSync(path.join(toolRoot,"js","pwa.js"))){
    validatePwaRegistration(tool.id,toolRoot,"index.html");
    validatePwaRegistration(tool.id,toolRoot,"zh/index.html");
  }

  const offline=path.join(toolRoot,"offline.html");
  if(fs.existsSync(offline)){
    const html=read(offline);
    if(!/<meta\b[^>]*name=["']viewport["']/i.test(html))errors.push(`${rel(offline)}: viewport missing`);
    if(!/noindex,follow/i.test(html))errors.push(`${rel(offline)}: noindex,follow missing`);
  }else warnings.push(`${rel(offline)}: missing offline fallback`);
}

for(const toolId of pendingEngineMigrations){
  if(!activeTools.some(tool=>tool.id===toolId))errors.push(`migration state references inactive or missing tool: ${toolId}`);
  if(fs.existsSync(path.join(site,"tools",toolId,"js","engine.js")))errors.push(`migration state is stale; engine already exists: ${toolId}`);
}

function shellRegion(html,name){
  const start=`<!-- NEL_${name}_START -->`;
  const end=`<!-- NEL_${name}_END -->`;
  const startCount=html.split(start).length-1;
  const endCount=html.split(end).length-1;
  if(startCount!==1||endCount!==1)return null;
  return html.slice(html.indexOf(start)+start.length,html.indexOf(end));
}
function shellSignature(fragment,isHeader){
  let value=fragment;
  if(isHeader)value=value.replace(/<div\b[^>]*class=["'][^"']*\bsite-shell-context-action\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i,'<div class="site-shell-context-action"></div>');
  value=value
    .replace(/<!--[^]*?-->/g,"")
    .replace(/\s(?:href|src|lang|hreflang|aria-label)=["'][^"']*["']/gi,match=>` ${match.trim().split("=")[0]}=""`)
    .replace(/\saria-current=["'][^"']*["']/gi,"")
    .replace(/>[^<]*</g,"><")
    .replace(/\s+/g," ")
    .replace(/>\s+</g,"><")
    .trim();
  return value;
}

const publicHtml=walk(site).filter(file=>file.endsWith(".html")&&!file.endsWith(`${path.sep}offline.html`)&&!file.includes(`${path.sep}templates${path.sep}`));
const headerSignatures=new Set();
const footerSignatures=new Set();
for(const file of publicHtml){
  const html=read(file);
  const fileRel=rel(file);
  const header=shellRegion(html,"HEADER");
  const footer=shellRegion(html,"FOOTER");
  if(!header)errors.push(`${fileRel}: exactly one generated Header region is required`);
  else headerSignatures.add(shellSignature(header,true));
  if(!footer)errors.push(`${fileRel}: exactly one generated Footer region is required`);
  else footerSignatures.add(shellSignature(footer,false));
  if(!/design-tokens\.css\?v=[a-f0-9]{12}/i.test(html))errors.push(`${fileRel}: content-hashed design-tokens.css missing`);
  if(!/site-shell\.css\?v=[a-f0-9]{12}/i.test(html))errors.push(`${fileRel}: content-hashed site-shell.css missing`);
  if(header&&!/class=["'][^"']*\bsite-shell-menu-toggle\b/i.test(header))errors.push(`${fileRel}: navigation toggle missing`);
  if(header&&(header.match(/<nav\b/gi)||[]).length!==1)errors.push(`${fileRel}: Header must contain exactly one navigation`);
  if(footer&&(footer.match(/<nav\b/gi)||[]).length!==1)errors.push(`${fileRel}: Footer must contain exactly one navigation`);
}
if(headerSignatures.size!==1)errors.push(`generated Header DOM signatures differ: ${headerSignatures.size}`);
if(footerSignatures.size!==1)errors.push(`generated Footer DOM signatures differ: ${footerSignatures.size}`);

const invalidBaseRoutes=(sitemapConfig.routes||[]).filter(record=>/^tools\/[^/]+\/$/.test(record.route||""));
if(invalidBaseRoutes.length)errors.push(`website/data/sitemap-routes.json: tool routes are not allowed: ${invalidBaseRoutes.map(item=>item.route).join(", ")}`);
function publicUrl(route,locale){
  const folder=locale.folder?`${locale.folder}/`:"";
  if(route==="")return `${localeConfig.siteUrl}/${folder}`;
  if(route==="tools/")return locale.folder?`${localeConfig.siteUrl}/tools/${locale.folder}/`:`${localeConfig.siteUrl}/tools/`;
  if(route.startsWith("tools/")){
    const slug=route.split("/")[1];
    return locale.folder?`${localeConfig.siteUrl}/tools/${slug}/${locale.folder}/`:`${localeConfig.siteUrl}/tools/${slug}/`;
  }
  return `${localeConfig.siteUrl}/${folder}${route}`;
}
const expectedSitemap=new Set();
for(const record of sitemapConfig.routes||[])for(const locale of activeLocales)expectedSitemap.add(publicUrl(record.route,locale));
for(const tool of activeTools)for(const locale of activeLocales)expectedSitemap.add(publicUrl(`tools/${tool.id}/`,locale));
const sitemapText=read(path.join(site,"sitemap.xml"));
const actualSitemap=[...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
const actualSet=new Set(actualSitemap);
const missingSitemap=[...expectedSitemap].filter(url=>!actualSet.has(url));
const extraSitemap=[...actualSet].filter(url=>!expectedSitemap.has(url));
if(actualSitemap.length!==actualSet.size)errors.push("website/sitemap.xml: duplicate URLs");
if(missingSitemap.length)errors.push(`website/sitemap.xml: missing URLs: ${missingSitemap.join(", ")}`);
if(extraSitemap.length)errors.push(`website/sitemap.xml: extra URLs: ${extraSitemap.join(", ")}`);

const report={
  version:releaseVersion,
  generatedAt:new Date().toISOString(),
  activeTools:activeTools.length,
  publicPages:publicHtml.length,
  sitemapUrls:actualSitemap.length,
  errors:[...new Set(errors)],
  warnings:[...new Set(warnings)],
  status:errors.length?"FAIL":"PASS"
};
fs.writeFileSync(path.join(root,"docs","ARCHITECTURE_VALIDATION_REPORT.json"),JSON.stringify(report,null,2)+"\n","utf8");
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exit(1);
