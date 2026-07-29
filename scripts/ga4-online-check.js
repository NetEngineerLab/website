#!/usr/bin/env node
"use strict";

const https=require("https");

const origin=(process.env.NEL_SITE_URL||"https://www.netengineerlab.com").replace(/\/+$/,"");
const expectedId="G-KGNFX9MD8Q";

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

(async()=>{
 const stamp=Date.now();
 const [home,config,analytics]=await Promise.all([
  get(`${origin}/?ga4-check=${stamp}`),
  get(`${origin}/data/site-config.js?ga4-check=${stamp}`),
  get(`${origin}/assets/js/analytics.js?ga4-check=${stamp}`)
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

 const report={status:errors.length?"FAIL":"PASS",origin,measurementId:expectedId,errors};
 console.log(JSON.stringify(report,null,2));
 if(errors.length)process.exit(1);
})().catch(error=>{
 console.error(JSON.stringify({status:"FAIL",origin,error:error.message},null,2));
 process.exit(1);
});
