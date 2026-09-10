#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),assert=require("assert/strict");
const root=path.resolve(__dirname,"..");
const pue=require("../website/tools/pue-data-center-energy-efficiency/js/engine.js");
const solar=require("../website/tools/telecom-solar-battery-sizing-calculator/js/engine.js");
const tools=JSON.parse(fs.readFileSync(path.join(root,"src/registry/tool-registry.json"),"utf8"));
const flows=JSON.parse(fs.readFileSync(path.join(root,"src/registry/workflow-registry.json"),"utf8"));
assert.equal(tools.filter(x=>x.status==="active").length,24);
for(const id of ["pue-data-center-energy-efficiency","telecom-solar-battery-sizing-calculator"]){
 const t=tools.find(x=>x.id===id);assert(t&&t.status==="active");
 for(const rel of ["index.html","zh/index.html","js/engine.js","js/app.js","docs/engine-test.js","sw.js"])assert(fs.existsSync(path.join(root,"website/tools",id,rel)),`${id}/${rel}`);
}
const flow=flows.find(x=>x.id==="telecom-power-energy");assert(flow&&flow.status==="active");
assert.deepEqual(flow.steps.map(x=>x.toolId),["network-rack-power-cooling-calculator","48v-battery-runtime","telecom-solar-battery-sizing-calculator","pue-data-center-energy-efficiency"]);
let r=pue.calculate({mode:"power",total:500,it:350,targetPUE:1.4,tariff:.12});assert(r.ok);assert(Math.abs(r.pue-500/350)<1e-12);assert(r.annualTotal===4380000);assert(!pue.calculate({total:100,it:110}).ok);
let s=solar.calculate({telecomKW:2.2,telecomHours:24,transportKW:0,transportHours:24,coolingKW:0,coolingHours:0,auxKW:0,auxHours:0,psh:4.5,moduleW:550,systemEfficiencyPct:80,dustLossPct:0,tempLossPct:0,wiringLossPct:0,controllerLossPct:0,designMarginPct:0,modulesPerString:10,backupHours:0,rainyDays:0,systemVoltage:48,dodPct:80,batteryEfficiencyPct:90,batteryMarginPct:0});
assert(s.ok);assert(Math.abs(s.requiredPV-14.6666666667)<1e-9);assert.equal(s.moduleCount,27);assert.equal(s.installedModules,30);assert.equal(s.strings,3);assert(Math.abs(s.installedPV-16.5)<1e-12);assert(s.dailyGeneration>s.dailyLoad);
for(const id of ["pue-data-center-energy-efficiency","telecom-solar-battery-sizing-calculator"]){for(const rel of ["index.html","zh/index.html"]){const html=fs.readFileSync(path.join(root,"website/tools",id,rel),"utf8");assert((html.match(/<details\b/g)||[]).length>=5);assert((html.match(/https:\/\//g)||[]).length>=3);assert(/Content reviewed: 2026-09-10|内容复核：2026-09-10/.test(html));}}
const prod=JSON.parse(fs.readFileSync(path.join(root,"docs/PRODUCTION_ACCEPTANCE_REPORT.json"),"utf8"));assert.equal(prod.status,"PASS");assert.equal(prod.activeTools,24);assert.equal(prod.htmlPages,62);assert.equal(prod.sitemapUrls,60);assert.equal(prod.errors.length,0);assert.equal(prod.warnings.length,0);
console.log("AUDIT2 PUE + Telecom Solar: PASS (engineering math, stringing, workflow, bilingual content, production report)");
