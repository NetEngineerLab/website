#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");

const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const origin="https://netengineerlab.com";
const skipDirs=new Set(["templates","node_modules","design"]);

function walk(dir){
 const output=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(skipDirs.has(entry.name))continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())output.push(...walk(full));
  else if(entry.isFile()&&entry.name.endsWith(".html"))output.push(full);
 }
 return output;
}
function targetExists(urlPath){
 const clean=String(urlPath||"").split(/[?#]/)[0];
 if(clean===""||clean==="/")return fs.existsSync(path.join(site,"index.html"));
 const parts=clean.replace(/^\/+/,"").split("/").filter(Boolean);
 if(!parts.length)return fs.existsSync(path.join(site,"index.html"));
 const target=path.join(site,...parts);
 if(clean.endsWith("/"))return fs.existsSync(path.join(target,"index.html"));
 if(fs.existsSync(target)&&fs.statSync(target).isFile())return true;
 return fs.existsSync(path.join(target,"index.html"));
}
function pageUrl(rel){
 const dir=path.posix.dirname(rel);
 return dir==="."?"/":`/${dir}/`;
}

const failures=[];
for(const file of walk(site)){
 const rel=path.relative(site,file).split(path.sep).join("/");
 const html=fs.readFileSync(file,"utf8").replace(/<!--[\s\S]*?-->/g," ");
 const base=new URL(pageUrl(rel),origin);
 const re=/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi;
 let match;
 while((match=re.exec(html))){
  const raw=match[2].trim();
  if(!raw||raw.startsWith("#")||/^(?:mailto:|tel:|javascript:|data:)/i.test(raw))continue;
  let resolved;
  try{
   if(raw.startsWith("//"))resolved=new URL(`https:${raw}`);
   else resolved=new URL(raw,base);
  }catch{continue}
  if(resolved.origin!==origin)continue;
  const pathname=decodeURIComponent(resolved.pathname);
  if(!targetExists(pathname))failures.push(`${rel} -> ${raw.split(/[?#]/)[0]} => ${pathname}`);
 }
}

if(failures.length){
 console.error(`Internal link check FAIL (${failures.length})`);
 for(const failure of failures)console.error(failure);
 process.exit(1);
}
console.log(`Internal link check PASS (${walk(site).length} HTML files)`);
