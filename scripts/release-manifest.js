#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const crypto=require("crypto");

const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const docs=path.join(root,"docs");
const version=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8")).version;

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}
function sha(file){return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}

const files=walk(site).sort();
const entries=files.map(file=>({
  path:path.relative(site,file).split(path.sep).join("/"),
  bytes:fs.statSync(file).size,
  sha256:sha(file)
}));
const treeMaterial=entries.map(entry=>`${entry.path}\0${entry.sha256}\n`).join("");
const treeSha256=crypto.createHash("sha256").update(treeMaterial).digest("hex");
const criticalPaths=[
  "index.html","zh/index.html","tools/index.html","tools/zh/index.html",
  "robots.txt","sitemap.xml","_headers","_redirects","data/site-config.json",
  "tools/ipv6-nat-planner/index.html","tools/ipv6-nat-planner/zh/index.html",
  "tools/wifi-coverage-capacity-planner/index.html","tools/wifi-coverage-capacity-planner/zh/index.html"
];
const critical={};
for(const rel of criticalPaths){
  const file=path.join(site,rel);
  if(fs.existsSync(file))critical[rel]={bytes:fs.statSync(file).size,sha256:sha(file)};
}
const manifest={
  version,
  generatedAt:new Date().toISOString(),
  websiteFileCount:entries.length,
  websiteBytes:entries.reduce((sum,item)=>sum+item.bytes,0),
  treeSha256,
  critical,
  files:entries
};
fs.writeFileSync(path.join(docs,"RELEASE_MANIFEST.json"),JSON.stringify(manifest,null,2)+"\n");
console.log(JSON.stringify({version,websiteFileCount:manifest.websiteFileCount,websiteBytes:manifest.websiteBytes,treeSha256},null,2));
