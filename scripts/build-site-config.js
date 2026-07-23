#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,".."),jsonPath=path.join(root,"website/data/site-config.json"),jsPath=path.join(root,"website/data/site-config.js");
const config=JSON.parse(fs.readFileSync(jsonPath,"utf8"));
if(!/^https:\/\/[^/]+$/.test(config.siteUrl||""))throw new Error("site-config.json siteUrl must be an HTTPS origin without a trailing slash");
if(config.analytics?.enabled&&(!/^G-[A-Z0-9]+$/i.test(config.analytics.measurementId||"")||/X{3,}/i.test(config.analytics.measurementId||"")))throw new Error("GA4 is enabled but measurementId is invalid or still a placeholder");
if(config.adsense?.enabled&&!/^ca-pub-\d{10,20}$/.test(config.adsense.client||""))throw new Error("AdSense is enabled but client is invalid");
fs.writeFileSync(jsPath,`window.NEL_SITE_CONFIG=${JSON.stringify(config)};\n`,`utf8`);
console.log(JSON.stringify({version:config.version,analyticsEnabled:!!config.analytics?.enabled,adsenseEnabled:!!config.adsense?.enabled},null,2));
