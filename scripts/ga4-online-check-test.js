#!/usr/bin/env node
"use strict";

const assert=require("assert");
const {checkGa4,errorMessage,monitorConfig}=require("./ga4-online-check");

const configured=monitorConfig({});
assert.strictEqual(configured.origin,"https://netengineerlab.com","monitor must use the configured canonical origin");
assert.strictEqual(configured.expectedId,"G-KGNFX9MD8Q","monitor must use the configured measurement ID");

const overridden=monitorConfig({
 NEL_SITE_URL:"https://preview.example.com/",
 NEL_GA4_MEASUREMENT_ID:"G-TEST123"
});
assert.deepStrictEqual(overridden,{
 origin:"https://preview.example.com",
 expectedId:"G-TEST123"
});
for(const invalid of [
 "http://netengineerlab.com",
 "https://user:pass@netengineerlab.com",
 "https://netengineerlab.com/path",
 "https://netengineerlab.com/?preview=1",
 "https://netengineerlab.com/#preview"
]){
 assert.throws(()=>monitorConfig({NEL_SITE_URL:invalid}),/Invalid production origin/);
}
assert.throws(()=>monitorConfig({NEL_GA4_MEASUREMENT_ID:"UA-INVALID"}),/Invalid GA4 measurement ID/);
assert.strictEqual(errorMessage({code:"ECONNRESET"}),"ECONNRESET");

function passingRequest(url){
 if(url.includes("/data/site-config.js")){
  return Promise.resolve({status:200,body:'{"enabled":true,"measurementId":"G-KGNFX9MD8Q"}'});
 }
 if(url.includes("/assets/js/analytics.js")){
  return Promise.resolve({status:200,body:'window.NEL_LOAD_ANALYTICS=()=>{};document.querySelector("script[data-nel-analytics]");'});
 }
 return Promise.resolve({status:200,body:'<script src="assets/js/analytics.js"></script>'});
}

(async()=>{
 const pass=await checkGa4(configured,passingRequest);
 assert.deepStrictEqual(pass.errors,[]);
 assert.strictEqual(pass.status,"PASS");

 const redirect=await checkGa4(configured,async()=>({status:301,body:""}));
 assert.strictEqual(redirect.status,"FAIL");
 assert(redirect.errors.includes("home HTTP 301"));
 assert(redirect.errors.includes("site-config.js HTTP 301"));
 assert(redirect.errors.includes("analytics.js HTTP 301"));

 const cases=[
  ["analytics disabled",async url=>url.includes("site-config.js")?{status:200,body:'{"enabled":false,"measurementId":"G-KGNFX9MD8Q"}'}:passingRequest(url),"production analytics is not enabled"],
  ["measurement ID missing",async url=>url.includes("site-config.js")?{status:200,body:'{"enabled":true,"measurementId":"G-WRONG"}'}:passingRequest(url),"production measurement ID is not G-KGNFX9MD8Q"],
  ["placeholder ID",async url=>url.includes("site-config.js")?{status:200,body:'{"enabled":true,"measurementId":"G-XXXXXXXXXX"}'}:passingRequest(url),"production still contains the placeholder measurement ID"],
  ["loader missing",async url=>url.includes("analytics.js")?{status:200,body:'document.querySelector("script[data-nel-analytics]");'}:passingRequest(url),"production analytics loader is missing"],
  ["legacy loader",async url=>url.includes("analytics.js")?{status:200,body:'window.NEL_LOAD_ANALYTICS=()=>document.currentScript;document.querySelector("script[data-nel-analytics]");'}:passingRequest(url),"production analytics loader still uses document.currentScript"],
  ["duplicate guard missing",async url=>url.includes("analytics.js")?{status:200,body:'window.NEL_LOAD_ANALYTICS=()=>{};'}:passingRequest(url),"production duplicate-loader guard is missing"],
  ["home reference missing",async url=>(!url.includes("site-config.js")&&!url.includes("analytics.js"))?{status:200,body:"<main>home</main>"}:passingRequest(url),"home page does not reference the shared analytics loader"]
 ];
 for(const [name,request,expectedError] of cases){
  const report=await checkGa4(configured,request);
  assert(report.errors.includes(expectedError),`${name} must report: ${expectedError}`);
 }

 console.log("GA4 online monitor tests: PASS");
})().catch(error=>{
 console.error(error);
 process.exit(1);
});
