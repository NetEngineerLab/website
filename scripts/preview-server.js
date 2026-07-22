#!/usr/bin/env node
"use strict";

const http=require("http");
const fs=require("fs");
const path=require("path");

const root=path.resolve(__dirname,"../website");
const requestedPort=Number(process.env.PORT||4173);
const host=process.env.HOST||"127.0.0.1";

const mimeTypes={
  ".html":"text/html; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".xml":"application/xml; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
  ".ico":"image/x-icon",
  ".webmanifest":"application/manifest+json",
  ".txt":"text/plain; charset=utf-8",
  ".csv":"text/csv; charset=utf-8"
};

function escapeRegex(value){return value.replace(/[.+?^${}()|[\]\\]/g,"\\$&")}
function compileTokenPattern(pattern,hostMode=false){
  let out="";
  for(let i=0;i<pattern.length;){
    const ch=pattern[i];
    if(ch==="*"){out+="(.*)";i++;continue}
    if(ch===":"){
      const match=pattern.slice(i+1).match(/^[A-Za-z][A-Za-z0-9_]*/);
      if(match){out+=hostMode?"([^./]+)":"([^/]+)";i+=match[0].length+1;continue}
    }
    out+=escapeRegex(ch);i++;
  }
  return new RegExp(`^${out}$`);
}
function compileRulePattern(raw){
  if(/^https:\/\//i.test(raw)){
    const parsed=new URL(raw.replace(/:([A-Za-z][A-Za-z0-9_]*)/g,"PLACEHOLDER_$1"));
    const hostPattern=parsed.hostname.replace(/PLACEHOLDER_([A-Za-z][A-Za-z0-9_]*)/g,":$1");
    const pathPattern=parsed.pathname;
    return request=>compileTokenPattern(hostPattern,true).test(request.hostname)&&compileTokenPattern(pathPattern).test(request.pathname);
  }
  const regex=compileTokenPattern(raw);
  return request=>regex.test(request.pathname);
}
function parseHeadersFile(file){
  if(!fs.existsSync(file))return[];
  const rules=[];let current=null;
  for(const original of fs.readFileSync(file,"utf8").split(/\r?\n/)){
    if(!original.trim()||original.trimStart().startsWith("#"))continue;
    if(!/^\s/.test(original)){
      current={pattern:original.trim(),match:compileRulePattern(original.trim()),headers:[]};
      rules.push(current);continue;
    }
    if(!current)continue;
    const line=original.trim();const index=line.indexOf(":");
    if(index<=0)continue;
    current.headers.push([line.slice(0,index).trim(),line.slice(index+1).trim()]);
  }
  return rules;
}
function parseRedirectsFile(file){
  if(!fs.existsSync(file))return[];
  const rules=[];
  for(const original of fs.readFileSync(file,"utf8").split(/\r?\n/)){
    const line=original.trim();
    if(!line||line.startsWith("#"))continue;
    const parts=line.split(/\s+/);
    if(parts.length<2)continue;
    const [source,target,statusText="302"]=parts;
    const names=[];
    let expression="";
    for(let i=0;i<source.length;){
      if(source[i]==="*"){names.push("splat");expression+="(.*)";i++;continue}
      if(source[i]===":"){
        const match=source.slice(i+1).match(/^[A-Za-z][A-Za-z0-9_]*/);
        if(match){names.push(match[0]);expression+="([^/]+)";i+=match[0].length+1;continue}
      }
      expression+=escapeRegex(source[i]);i++;
    }
    rules.push({source,target,status:Number(statusText)||302,regex:new RegExp(`^${expression}$`),names});
  }
  return rules;
}
function redirectFor(pathname,rules){
  for(const rule of rules){
    const match=pathname.match(rule.regex);if(!match)continue;
    const values={};rule.names.forEach((name,index)=>{values[name]=match[index+1]||""});
    let location=rule.target;
    for(const [name,value] of Object.entries(values))location=location.replaceAll(`:${name}`,value);
    return{status:rule.status,location};
  }
  return null;
}
function safePath(urlPath){
  let decoded;
  try{decoded=decodeURIComponent(urlPath)}catch{return null}
  const clean=decoded.split("?")[0].replace(/\\/g,"/");
  const full=path.resolve(root,"."+clean);
  return full===root||full.startsWith(root+path.sep)?full:null;
}
function applyHeaders(res,request,headerRules){
  const collected=new Map();
  for(const rule of headerRules){
    if(!rule.match(request))continue;
    for(const [name,value] of rule.headers){
      const key=name.toLowerCase();
      if(name.startsWith("!")){collected.delete(name.slice(1).trim().toLowerCase());continue}
      if(collected.has(key))collected.set(key,`${collected.get(key)}, ${value}`);
      else collected.set(key,value);
    }
  }
  for(const [name,value] of collected)res.setHeader(name,value);
}

const headerRules=parseHeadersFile(path.join(root,"_headers"));
const redirectRules=parseRedirectsFile(path.join(root,"_redirects"));

const server=http.createServer((req,res)=>{
  const origin=`http://${req.headers.host||`${host}:${requestedPort}`}`;
  let parsed;
  try{parsed=new URL(req.url||"/",origin)}catch{res.writeHead(400);return res.end("Bad request")}
  const requestInfo={hostname:parsed.hostname,pathname:parsed.pathname};

  const redirect=redirectFor(parsed.pathname,redirectRules);
  if(redirect){
    applyHeaders(res,requestInfo,headerRules);
    res.statusCode=redirect.status;
    res.setHeader("Location",redirect.location+(parsed.search||""));
    return res.end();
  }

  let target=safePath(parsed.pathname);
  if(!target){res.writeHead(400);return res.end("Bad request")}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory()){
    if(!parsed.pathname.endsWith("/")){
      applyHeaders(res,requestInfo,headerRules);
      res.statusCode=308;res.setHeader("Location",parsed.pathname+"/"+(parsed.search||""));return res.end();
    }
    target=path.join(target,"index.html");
  }else if(!path.extname(target)&&fs.existsSync(target+".html")){
    target=target+".html";
  }

  let status=200;
  if(!fs.existsSync(target)||!fs.statSync(target).isFile()){
    const segments=parsed.pathname.split("/").filter(Boolean);
    const chinese=segments.includes("zh");
    target=path.join(root,chinese?"zh/404.html":"404.html");
    status=404;
  }

  const stat=fs.statSync(target);
  res.statusCode=status;
  res.setHeader("Content-Type",mimeTypes[path.extname(target).toLowerCase()]||"application/octet-stream");
  res.setHeader("Content-Length",String(stat.size));
  applyHeaders(res,requestInfo,headerRules);

  if(req.method==="HEAD")return res.end();
  if(req.method!=="GET"){res.statusCode=405;res.setHeader("Allow","GET, HEAD");return res.end("Method not allowed")}
  fs.createReadStream(target).pipe(res);
});

server.listen(requestedPort,host,()=>{
  const address=server.address();
  const actualPort=typeof address==="object"&&address?address.port:requestedPort;
  console.log(`NetEngineerLab preview: http://${host}:${actualPort}/`);
});

function shutdown(){server.close(()=>process.exit(0))}
process.on("SIGTERM",shutdown);
process.on("SIGINT",shutdown);
