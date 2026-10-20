#!/usr/bin/env node
"use strict";
// Typical engineering scenarios: recompute every scenario with the tool engine and
// compare it with docs/scenarios-fixtures.json, js/scenarios.js and the en/zh/es pages.
const assert=require("assert");const fs=require("fs");const path=require("path");
const ROOT=path.join(__dirname,"..","website","tools");
const fx2=v=>Number(v).toFixed(2);const en1=v=>Number(v).toLocaleString("en-US",{maximumFractionDigits:1});
const RUN={
 "fiber-loss":(e,i)=>{const v={};for(const k of ["distance","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","splitter1","splitter2","otherLoss","engineeringMargin","availableBudget","txPower","rxThreshold"])v[k]=Number(i[k]);const r=e.calculate(v);return{checks:{designLoss:fx2(r.designLoss),budgetRemaining:fx2(r.budgetRemaining),estimatedRxPower:fx2(r.estimatedRxPower)},status:r.status};},
 "subnet-calculator":(e,i)=>{const r=e.analyzeIPv4(i.ipv4Address,Number(i.ipv4Prefix));return{checks:{ipv4Cidr:r.cidr,ipv4Broadcast:r.broadcast,ipv4UsableRaw:String(r.usableHosts)},status:null};},
 "poe-power-budget-calculator":(e,i)=>{const r=e.calculate({switchBudget:i.switchBudget,switchPorts:i.switchPorts,deviceCount:i.deviceCount,deviceWatts:i.deviceWatts,cableLossPercent:i.cableLoss,headroomPercent:i.headroom,standard:i.standard});return{checks:{required:en1(r.requiredBudget)+" W",maximum:String(r.maxDevices)},status:r.status};}
};
// Independent hand-checked anchors (not produced by the engine).
const ANCHORS={"gpon-bplus-20km-1x32":{designLoss:"29.00"},"p2p-link-31":{ipv4Broadcast:"10.0.0.1",ipv4UsableRaw:"2"},"summary-22":{ipv4Cidr:"172.16.0.0/22",ipv4UsableRaw:"1022"},"office-vlan-26":{ipv4Cidr:"192.168.10.128/26",ipv4Broadcast:"192.168.10.191"},"bt-24-ptz-cameras":{required:"1,280 W"}};
let n=0;
for(const slug of Object.keys(RUN)){
 const dir=path.join(ROOT,slug);
 const engine=require(path.join(dir,"js/engine.js"));
 const loader=require(path.join(dir,"js/scenarios.js"));
 const fixtures=JSON.parse(fs.readFileSync(path.join(dir,"docs/scenarios-fixtures.json"),"utf8"));
 assert.ok(fixtures.length>=2&&fixtures.length<=3,slug+" needs 2-3 scenarios");
 for(const f of fixtures){
  assert.deepStrictEqual(loader.DATA.scenarios[f.id],f.inputs,`${slug}/${f.id}: loader inputs drifted from fixture`);
  const got=RUN[slug](engine,f.inputs);
  assert.deepStrictEqual(got.checks,f.checks,`${slug}/${f.id}: engine output drifted`);
  assert.strictEqual(got.status,f.status,`${slug}/${f.id}: status drifted`);
  for(const [k,v] of Object.entries(ANCHORS[f.id]||{}))assert.strictEqual(f.checks[k],v,`${slug}/${f.id}: anchor ${k}`);
  n++;
 }
 for(const [lang,folder] of [["en",""],["zh","zh/"],["es","es/"]]){
  const html=fs.readFileSync(path.join(dir,folder,"index.html"),"utf8");
  const block=(html.match(/<!-- NEL_SCENARIOS_START -->([\s\S]*?)<!-- NEL_SCENARIOS_END -->/)||[])[1];
  assert.ok(block,`${slug} ${lang}: scenarios block missing`);
  for(const f of fixtures){
   assert.ok(block.includes(`href="?scenario=${f.id}#calculator"`),`${slug} ${lang}: link ${f.id}`);
   const head=f.headline[lang].replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
   assert.ok(block.includes(head),`${slug} ${lang}: headline ${f.id}`);
  }
  const std=(html.match(/<!-- NEL_STANDARDS_START -->([\s\S]*?)<!-- NEL_STANDARDS_END -->/)||[])[1];
  assert.ok(std&&/<a href="https:\/\/(www\.itu\.int|www\.rfc-editor\.org|standards\.ieee\.org)\//.test(std),`${slug} ${lang}: standards block`);
  const formula=html.search(/<section[^>]*id="methodology"|<section class="content nel-tool-supporting-section">/);
  assert.ok(formula>=0&&html.indexOf("NEL_STANDARDS_START")>formula,`${slug} ${lang}: standards must follow the formula section`);
  assert.ok(/src="(\.\.\/)?js\/scenarios\.js/.test(html),`${slug} ${lang}: loader script`);
 }
}
console.log(`tool scenarios: ${n} scenarios x 3 locales OK`);
