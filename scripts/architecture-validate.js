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

const report={
  version:releaseVersion,
  generatedAt:new Date().toISOString(),
  activeTools:activeTools.length,
  errors:[...new Set(errors)],
  warnings:[...new Set(warnings)],
  status:errors.length?"FAIL":"PASS"
};
fs.writeFileSync(path.join(root,"docs","ARCHITECTURE_VALIDATION_REPORT.json"),JSON.stringify(report,null,2)+"\n","utf8");
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exit(1);
