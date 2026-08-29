#!/usr/bin/env node
"use strict";

const fs=require("fs");
const https=require("https");
const path=require("path");

const root=path.resolve(__dirname,"..");

function monitorConfig(env=process.env){
 const siteConfig=JSON.parse(fs.readFileSync(path.join(root,"website","data","site-config.json"),"utf8"));
 const configuredOrigin=String(env.NEL_SITE_URL||siteConfig.siteUrl||"");
 const expectedId=String(env.NEL_GA4_MEASUREMENT_ID||siteConfig.analytics?.measurementId||"");
 let parsed;
 try{parsed=new URL(configuredOrigin)}catch{throw new Error(`Invalid production origin: ${configuredOrigin||"missing"}`)}
 if(parsed.protocol!=="https:"||parsed.username||parsed.password||parsed.pathname!=="/"||parsed.search||parsed.hash){
  throw new Error(`Invalid production origin: ${configuredOrigin||"missing"}`);
 }
 const origin=parsed.origin;
 if(!/^G-[A-Z0-9]+$/.test(expectedId))throw new Error(`Invalid GA4 measurement ID: ${expectedId||"missing"}`);
 return{origin,expectedId};
}

function errorMessage(error){
 return error?.message||error?.code||error?.cause?.message||String(error);
}

function get(url){
 return new Promise((resolve,reject)=>{
  https.get(url,{headers:{"user-agent":"NetEngineerLab-GA4-Monitor/1.0","cache-control":"no-cache"}},response=>{
   let body="";
   response.setEncoding("utf8");
   response.on("data",chunk=>body+=chunk);
   response.on("end",()=>resolve({status:response.statusCode||0,body}));
  }).on("error",reject);
 });
}

async function checkGa4({origin,expectedId},request=get){
 const stamp=Date.now();
 const [home,config,analytics]=await Promise.all([
  request(`${origin}/?ga4-check=${stamp}`),
  request(`${origin}/data/site-config.js?ga4-check=${stamp}`),
  request(`${origin}/assets/js/analytics.js?ga4-check=${stamp}`)
 ]);
 const errors=[];
 if(home.status!==200)errors.push(`home HTTP ${home.status}`);
 if(config.status!==200)errors.push(`site-config.js HTTP ${config.status}`);
 if(analytics.status!==200)errors.push(`analytics.js HTTP ${analytics.status}`);
 if(!config.body.includes('"enabled":true'))errors.push("production analytics is not enabled");
 if(!config.body.includes(expectedId))errors.push(`production measurement ID is not ${expectedId}`);
 if(config.body.includes("G-XXXXXXXXXX"))errors.push("production still contains the placeholder measurement ID");
 if(!analytics.body.includes("NEL_LOAD_ANALYTICS"))errors.push("production analytics loader is missing");
 if(analytics.body.includes("document.currentScript"))errors.push("production analytics loader still uses document.currentScript");
 if(!analytics.body.includes("script[data-nel-analytics]"))errors.push("production duplicate-loader guard is missing");
 if(!home.body.includes("assets/js/analytics.js"))errors.push("home page does not reference the shared analytics loader");

 return{status:errors.length?"FAIL":"PASS",origin,measurementId:expectedId,errors};
}

async function main(){
 const config=monitorConfig();
 const report=await checkGa4(config);
 console.log(JSON.stringify(report,null,2));
 if(report.errors.length)process.exitCode=1;
}

module.exports={checkGa4,errorMessage,monitorConfig};

if(require.main===module){
 main().catch(error=>{
  let origin="unknown";
  try{origin=monitorConfig().origin}catch{}
  console.error(JSON.stringify({status:"FAIL",origin,error:errorMessage(error)},null,2));
  process.exitCode=1;
 });
}
