#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const vm=require("vm");

const root=path.resolve(__dirname,"..");
const expectedId="G-KGNFX9MD8Q";
const errors=[];

function read(rel){
 return fs.readFileSync(path.join(root,rel),"utf8");
}

function assert(condition,message){
 if(!condition)errors.push(message);
}

const config=JSON.parse(read("website/data/site-config.json"));
const generated=read("website/data/site-config.js");
const analytics=read("website/assets/js/analytics.js");
const consent=read("website/assets/js/cookie-consent.js");

assert(config.analytics&&config.analytics.enabled===true,"analytics.enabled must be true");
assert(config.analytics&&config.analytics.measurementId===expectedId,`measurementId must be ${expectedId}`);
assert(generated.includes(`"enabled":true`),"generated site-config.js must enable analytics");
assert(generated.includes(expectedId),"generated site-config.js must contain the production measurement ID");
assert(!generated.includes("G-XXXXXXXXXX"),"generated site-config.js must not contain the placeholder measurement ID");
assert(!analytics.includes("document.currentScript"),"analytics.js must not depend on document.currentScript");
assert(analytics.includes('script[data-nel-analytics]'),"analytics.js must prevent duplicate Google tag loaders");
assert(analytics.includes("script.dataset.nelAnalytics"),"analytics.js must identify its Google tag loader");
assert(analytics.includes("location.hostname.toLowerCase()"),"analytics.js must enforce the production-domain guard");
assert(analytics.includes('analytics_storage:"denied"'),"Consent Mode must default analytics storage to denied");
assert(consent.includes('analytics_storage:ok?"granted":"denied"'),"cookie consent must update analytics storage");
assert(consent.includes("window.NEL_LOAD_ANALYTICS"),"accepted consent must start the analytics loader");

const appended=[];
const existingScripts=[];
const document={
 querySelector(selector){
  return selector==="script[data-nel-analytics]"&&existingScripts.length?existingScripts[0]:null;
 },
 createElement(tag){
  assert(tag==="script","analytics loader must create a script element");
  return {dataset:{}};
 },
 head:{
  appendChild(script){
   existingScripts.push(script);
   appended.push(script);
  }
 }
};
const window={
 NEL_SITE_CONFIG:config,
 dataLayer:[],
 location:{hostname:"www.netengineerlab.com"}
};
window.window=window;

const context={
 window,
 document,
 location:window.location,
 URL,
 Date,
 Set,
 encodeURIComponent
};

try{
 vm.runInNewContext(analytics,context,{filename:"website/assets/js/analytics.js"});
}catch(error){
 errors.push(`analytics.js execution failed: ${error.message}`);
}

assert(typeof window.NEL_LOAD_ANALYTICS==="function","valid production config must expose NEL_LOAD_ANALYTICS");
assert(appended.length===0,"Google tag must not load before consent");

if(typeof window.NEL_LOAD_ANALYTICS==="function"){
 window.NEL_LOAD_ANALYTICS();
 window.NEL_LOAD_ANALYTICS();
}

assert(appended.length===1,"accepted consent must load exactly one Google tag script");
if(appended[0]){
 assert(appended[0].src===`https://www.googletagmanager.com/gtag/js?id=${expectedId}`,"Google tag URL is incorrect");
 assert(appended[0].dataset.nelAnalytics===expectedId,"Google tag dataset marker is incorrect");
}

const queued=window.dataLayer.map(item=>Array.from(item));
assert(queued.some(item=>item[0]==="consent"&&item[1]==="default"),"default Consent Mode command missing");
assert(queued.some(item=>item[0]==="config"&&item[1]===expectedId),"GA4 config command missing");

if(errors.length){
 console.error(JSON.stringify({status:"FAIL",errors},null,2));
 process.exit(1);
}

console.log(`GA4 configuration PASS (${expectedId}; consent-gated; duplicate-safe).`);
