#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");

const root=path.resolve(__dirname,"..");
const releaseVersion=fs.readFileSync(path.join(root,"VERSION"),"utf8").trim();

if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(releaseVersion)){
  throw new Error(`Invalid release version in VERSION: ${releaseVersion}`);
}

function updateJson(rel,update){
  const file=path.join(root,rel);
  const value=JSON.parse(fs.readFileSync(file,"utf8"));
  update(value);
  fs.writeFileSync(file,JSON.stringify(value,null,2)+"\n","utf8");
}

updateJson("package.json",value=>{value.version=releaseVersion});
if(fs.existsSync(path.join(root,"package-lock.json"))){
  updateJson("package-lock.json",value=>{
    value.version=releaseVersion;
    if(value.packages?.[""])value.packages[""].version=releaseVersion;
  });
}
for(const rel of [
  "website/data/site-config.json",
  "website/data/locales.json",
  "website/data/sitemap-routes.json"
])updateJson(rel,value=>{value.version=releaseVersion});

fs.writeFileSync(path.join(root,"website","VERSION"),releaseVersion+"\n","utf8");
console.log(`Release version synchronized: ${releaseVersion}`);
