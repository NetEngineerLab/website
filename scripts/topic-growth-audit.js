#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const registry=JSON.parse(fs.readFileSync(path.join(site,"data","sitemap-routes.json"),"utf8"));
const ids=new Set([
 "topic-switch-oversubscription",
 "guide-switch-oversubscription-ratio",
 "guide-48-port-switch-oversubscription",
 "guide-48-port-switch-2x10g-enough",
 "guide-switch-oversubscription-n-1"
]);
const records=registry.routes.filter(record=>ids.has(record.id));
const errors=[];
const image="https://netengineerlab.com/assets/images/og-netengineerlab.png";
const assets=[
 "/topics/switch-oversubscription/",
 "/guides/switch-oversubscription-ratio/",
 "/guides/48-port-switch-oversubscription/",
 "/guides/48-port-switch-2x10g-enough/",
 "/guides/switch-oversubscription-n-1/",
 "/tools/switch-uplink-oversubscription-calculator/"
];
function check(condition,message){if(!condition)errors.push(message)}
function fileFor(route,locale){
 const localRoute=locale==="zh"?`zh/${route}`:route;
 return path.join(site,...localRoute.split("/"),"index.html");
}
for(const record of records){
 const own=`/${record.route}`;
 const expected=assets.filter(route=>route!==own).sort();
 check(JSON.stringify([...(record.relatedContent||[])].sort())===JSON.stringify(expected),`${record.id}: relatedContent is incomplete`);
 for(const locale of ["en","zh"]){
  const file=fileFor(record.route,locale);
  check(fs.existsSync(file),`${record.id}/${locale}: page missing`);
  if(!fs.existsSync(file))continue;
  const html=fs.readFileSync(file,"utf8");
  const label=`${record.id}/${locale}`;
  check(html.includes(`<meta property="og:image" content="${image}">`),`${label}: og:image missing`);
  check(html.includes('<meta name="twitter:card" content="summary_large_image">'),`${label}: twitter card missing`);
  check(html.includes(`<meta name="twitter:image" content="${image}">`),`${label}: twitter image missing`);
  const script=(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)||[])[1];
  let graph=[];
  try{graph=JSON.parse(script)["@graph"]}catch{errors.push(`${label}: invalid JSON-LD`)}
  check(Array.isArray(graph),`${label}: JSON-LD graph missing`);
  if(Array.isArray(graph)){
   const types=graph.flatMap(node=>Array.isArray(node["@type"])?node["@type"]:[node["@type"]]);
   check(types.includes("WebPage"),`${label}: WebPage schema missing`);
   check(types.includes("BreadcrumbList"),`${label}: BreadcrumbList schema missing`);
   check(types.includes(record.pageType==="hub"?"CollectionPage":"Article"),`${label}: primary schema missing`);
   for(const node of graph.filter(node=>["WebPage","CollectionPage","Article"].some(type=>(Array.isArray(node["@type"])?node["@type"]:[node["@type"]]).includes(type)))){
    check(Boolean(node.url),`${label}: ${node["@type"]} url missing`);
    check(Boolean(node.inLanguage),`${label}: ${node["@type"]} inLanguage missing`);
   }
  }
  check(!html.includes("data-center-convergence-fabric-capacity-planner"),`${label}: obsolete Fabric tool slug`);
  if(locale==="zh"){
   for(const phrase of ["Focused 2×10G capacity decision guide","Explore all resources in this topic","Professional online tools for telecom and network engineers","Primary navigation","Open navigation"]){
    check(!html.includes(phrase),`${label}: untranslated UI/content: ${phrase}`);
   }
  }
 }
}
for(const rel of ["topics/switch-oversubscription/index.html","zh/topics/switch-oversubscription/index.html"]){
 const html=fs.readFileSync(path.join(site,...rel.split("/")),"utf8");
 for(const markdown of ["switch-oversubscription-ratio.md","48-port-switch-oversubscription.md","48-port-switch-2x10g-enough.md","switch-oversubscription-n-1.md"]){
  check(html.includes(`https://github.com/NetEngineerLab/website/blob/main/docs/guides/switching/${markdown}`),`${rel}: GitHub resource missing: ${markdown}`);
 }
 check(!html.includes('href="https://github.com/"'),`${rel}: GitHub placeholder remains`);
}
const sitemap=fs.readFileSync(path.join(site,"sitemap.xml"),"utf8");
check(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'),"sitemap: xhtml namespace missing");
check((sitemap.match(/<url>/g)||[]).length===(sitemap.match(/<\/url>/g)||[]).length,"sitemap: unbalanced url elements");
if(errors.length){
 console.error(`Topic growth audit failed (${errors.length})`);
 for(const error of errors)console.error(`- ${error}`);
 process.exit(1);
}
console.log(`Topic growth audit PASS: ${records.length} registry records / ${records.length*2} localized pages.`);
