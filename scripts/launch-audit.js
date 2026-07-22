#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const vm=require("vm");

const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const errors=[];
const warnings=[];
const expectedVersion="1.7.3";
const expectedOrigin="https://netengineerlab.com";

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)])}
function read(file){return fs.readFileSync(file,"utf8")}
function json(rel){try{return JSON.parse(read(path.join(root,rel)))}catch(error){errors.push(`${rel}: ${error.message}`);return{}}}

const packageJson=json("package.json");
const config=json("website/data/locales.json");
const siteConfig=json("website/data/site-config.json");
const sitemapConfig=json("website/data/sitemap-routes.json");
const tools=json("website/data/tools-catalog.json");

for(const [name,value] of [["package",packageJson.version],["locales",config.version],["site-config",siteConfig.version],["sitemap-routes",sitemapConfig.version]]){
  if(value!==expectedVersion)errors.push(`${name} version ${value||"missing"} != ${expectedVersion}`);
}
if(siteConfig.siteUrl!==expectedOrigin)errors.push(`site URL ${siteConfig.siteUrl||"missing"} != ${expectedOrigin}`);
if(!Array.isArray(tools)||tools.filter(item=>item.status==="active").length!==12)errors.push("active tool count is not 12");
if(Array.isArray(tools)&&tools.some(item=>item.status!=="active"))errors.push("planned tools remain in production catalog");

const htmlFiles=walk(site).filter(file=>file.endsWith(".html")&&!file.endsWith("offline.html"));
for(const file of htmlFiles){
  const rel=path.relative(site,file).split(path.sep).join("/");
  const html=read(file);
  const is404=rel==="404.html"||rel==="zh/404.html"||/\/404\.html$/.test(rel);
  if(!/<title>[^<]{3,}<\/title>/i.test(html))errors.push(`${rel}: title missing`);
  if(!/<meta\b[^>]*name=["']description["']/i.test(html))errors.push(`${rel}: description missing`);
  if(!is404&&!/<link\b[^>]*rel=["'][^"']*canonical/i.test(html))errors.push(`${rel}: canonical missing`);
  if(is404&&!/noindex,follow/i.test(html))errors.push(`${rel}: 404 noindex missing`);
  if(is404&&/<link\b[^>]*rel=["'][^"']*canonical/i.test(html))errors.push(`${rel}: 404 canonical must be absent`);
  if(!/data\/site-config\.js/i.test(html))errors.push(`${rel}: global site config missing`);
  if(!/assets\/js\/analytics\.js/i.test(html))errors.push(`${rel}: analytics loader missing`);
  if(!/assets\/js\/adsense\.js/i.test(html))errors.push(`${rel}: ads loader missing`);
  if(!new RegExp(`NetEngineerLab Config-Driven Multilingual V${expectedVersion.replaceAll(".","\\.")}`).test(html))errors.push(`${rel}: framework version meta mismatch`);
  if(/href\s*=\s*["']#["']/i.test(html))errors.push(`${rel}: placeholder href=#`);
  const ids=[...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match=>match[1]);
  if(new Set(ids).size!==ids.length)errors.push(`${rel}: duplicate HTML id`);
  if(!/<meta\b[^>]*(?:property=["']og:title["']|name=["']twitter:card["'])/i.test(html))warnings.push(`${rel}: social metadata incomplete`);
  for(const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    try{JSON.parse(block[1].trim())}catch(error){errors.push(`${rel}: invalid JSON-LD ${error.message}`)}
  }
}

for(const required of [
  ".node-version",".nvmrc","VERSION",".gitignore",".gitattributes",".github/workflows/production-quality-gate.yml",
  "website/_headers","website/_redirects","website/robots.txt","website/sitemap.xml","website/data/site-config.json",
  "website/assets/images/og-netengineerlab.png","website/.well-known/security.txt",
  "scripts/production-acceptance.js","scripts/remote-acceptance.js","scripts/release-manifest.js"
]){
  if(!fs.existsSync(path.join(root,required)))errors.push(`missing launch file: ${required}`);
}
for(const js of ["website/assets/js/site.js","website/assets/js/analytics.js","website/assets/js/adsense.js","website/data/site-config.js"]){
  try{new vm.Script(read(path.join(root,js)),{filename:js})}catch(error){errors.push(`${js}: ${error.message}`)}
}

if(siteConfig.analytics?.enabled&&(!/^G-[A-Z0-9]+$/i.test(siteConfig.analytics.measurementId||"")||/X{3,}/.test(siteConfig.analytics.measurementId||"")))errors.push("GA4 enabled with invalid/placeholder measurement ID");
if(siteConfig.adsense?.enabled&&(!/^ca-pub-\d{10,20}$/.test(siteConfig.adsense.client||"")||/X{3,}/.test(siteConfig.adsense.client||"")))errors.push("AdSense enabled with invalid/placeholder client ID");

const sitemap=read(path.join(site,"sitemap.xml"));
const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
if(locs.length!==36)errors.push(`sitemap URL count ${locs.length} != 36`);
if(new Set(locs).size!==locs.length)errors.push("duplicate sitemap URLs");
if(!locs.every(url=>url.startsWith(expectedOrigin+"/")))errors.push("sitemap contains non-production URL");
for(const route of ["/about/","/contact/","/privacy/","/terms/","/zh/about/","/zh/contact/","/zh/privacy/","/zh/terms/"]){
  if(!locs.some(url=>url.endsWith(route)))errors.push(`sitemap missing ${route}`);
}
const headers=read(path.join(site,"_headers"));
if(!headers.includes("https://:project.pages.dev/*")||!headers.includes("https://:version.:project.pages.dev/*"))errors.push("pages.dev noindex rules missing");
if(!headers.includes("/tools/*/sw.js")||!/max-age=0/.test(headers))errors.push("service-worker cache revalidation rule missing");

const report={
  version:expectedVersion,
  generatedAt:new Date().toISOString(),
  htmlPages:htmlFiles.length,
  activeTools:Array.isArray(tools)?tools.filter(item=>item.status==="active").length:0,
  sitemapUrls:locs.length,
  analyticsEnabled:!!siteConfig.analytics?.enabled,
  adsenseEnabled:!!siteConfig.adsense?.enabled,
  errors:[...new Set(errors)],
  warnings:[...new Set(warnings)],
  status:errors.length?"FAIL":"PASS"
};
fs.writeFileSync(path.join(root,"docs","LAUNCH_AUDIT_REPORT.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exit(1);
