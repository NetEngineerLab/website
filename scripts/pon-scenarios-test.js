#!/usr/bin/env node
"use strict";
// PON cluster: recompute every one-click scenario with the tool engine, compare with docs/scenarios-fixtures.json,
// the loader data and the en/zh/es pages; check the PON toolkit links and the CTR meta length limits.
const assert=require("assert");const fs=require("fs");const path=require("path");
const ROOT=path.join(__dirname,"..","website","tools");
const f2=x=>Number(x).toFixed(2);
const RUN={
 "pon-splitter-loss":(e,i)=>{const n=k=>Number(i[k]);const r=e.calculate({project:"x",distance:n("distance"),attenuation:n("attenuation"),spliceCount:n("spliceCount"),spliceLoss:n("spliceLoss"),connectorCount:n("connectorCount"),connectorLoss:n("connectorLoss"),s1:n("splitter1"),s2:n("splitter2"),s3:n("splitter3"),other:n("otherLoss"),penalty:n("opticalPenalty"),margin:n("margin"),tx:n("txPower"),txMax:n("txMaxPower"),sens:n("rxSensitivity"),over:n("rxOverload"),systemReach:n("systemReach"),aging:n("aging"),temperature:n("temperature"),maintenance:n("maintenance"),protection:n("protection"),wavelength:String(i.wavelength)});
  return{checks:{ratioResult:"1:"+r.totalRatio,splitterLossResult:f2(r.splitterLoss),designLoss:f2(r.designLoss),remaining:f2(r.remaining)},status:r.status};},
 "onu-rx-power":(e,i)=>{const n=k=>Number(i[k]);const r=e.calculate({project:"x",mode:"model",measured:n("measuredRx"),sens:n("rxSensitivity"),over:n("rxOverload"),noSignal:n("noSignalThreshold"),warning:n("warningMargin"),tx:n("txPower"),distance:n("distance"),attenuation:n("attenuation"),spliceCount:n("spliceCount"),spliceLoss:n("spliceLoss"),connectorCount:n("connectorCount"),connectorLoss:n("connectorLoss"),s1:n("splitter1"),s2:n("splitter2"),other:n("otherLoss"),wavelength:String(i.wavelength)});
  return{checks:{measuredResult:f2(n("measuredRx")),sensitivityMargin:f2(r.sensitivityMargin),expectedRx:f2(r.expectedRx),deviation:f2(r.deviation)},status:r.status};},
 "pon-distance":(e,i)=>{const n=k=>Number(i[k]);const v={project:"x",tx:n("txPower"),sens:n("rxSensitivity"),over:n("rxOverload"),planned:n("plannedDistance"),systemReach:n("systemReach"),attenuation:n("attenuation"),wavelength:String(i.wavelength),spliceCount:n("spliceCount"),spliceLoss:n("spliceLoss"),connectorCount:n("connectorCount"),connectorLoss:n("connectorLoss"),agingLoss:0,temperatureLoss:0,maintenanceLoss:0,protectionRequired:false,protectionPresent:false,dualUplinkRequired:false,dualUplinkPresent:false,s1:n("splitter1"),s2:n("splitter2"),other:n("otherLoss"),margin:n("margin")};
  assert.ok(e.validate(v));const r=e.calculate(v);
  return{checks:{effectiveMax:f2(r.effectiveMax),opticalMax:f2(r.opticalMax),designRemaining:f2(r.designRemaining),estimatedRx:f2(r.estimatedRx)},status:r.status};}
};
// Hand-checked anchors (splitter dB sums and simple budgets), independent of the engines.
const ANCHORS={"gpon-cplus-1x64":{ratioResult:"1:64",splitterLossResult:"20.50"},"gpon-bplus-1x32-cascade":{ratioResult:"1:32",splitterLossResult:"17.70"},"gpon-bplus-1x128-overbudget":{ratioResult:"1:128",splitterLossResult:"24.20"},
 "gpon-bplus-1x32-normal":{sensitivityMargin:"5.00"},"gpon-cplus-1x64-weak":{sensitivityMargin:"1.50"},"rural-1x16-long-reach":{effectiveMax:"40.00"}};
const STATUS={"gpon-bplus-1x128-overbudget":"failed","short-drop-overload":"overload"};
let n=0;
for(const slug of Object.keys(RUN)){
 const dir=path.join(ROOT,slug);
 const engine=require(path.join(dir,"js/engine.js"));
 const loader=require(path.join(dir,"js/scenarios.js"));
 const fixtures=JSON.parse(fs.readFileSync(path.join(dir,"docs/scenarios-fixtures.json"),"utf8"));
 assert.ok(fixtures.length>=2&&fixtures.length<=3,slug);
 for(const f of fixtures){
  assert.deepStrictEqual(loader.DATA.scenarios[f.id],f.inputs,`${slug}/${f.id}: loader drift`);
  const got=RUN[slug](engine,f.inputs);
  assert.deepStrictEqual(got.checks,f.checks,`${slug}/${f.id}: engine drift`);
  assert.strictEqual(got.status,f.status,`${slug}/${f.id}: status drift`);
  for(const [k,v] of Object.entries(ANCHORS[f.id]||{}))assert.strictEqual(f.checks[k],v,`${slug}/${f.id}: anchor ${k}`);
  if(STATUS[f.id])assert.strictEqual(f.status,STATUS[f.id],`${slug}/${f.id}: expected status`);
  n++;
 }
 for(const folder of ["","zh/","es/"]){
  const html=fs.readFileSync(path.join(dir,folder,"index.html"),"utf8");
  const block=(html.match(/<!-- NEL_SCENARIOS_START -->([\s\S]*?)<!-- NEL_SCENARIOS_END -->/)||[])[1];
  assert.ok(block,`${slug} ${folder}: scenarios block`);
  const lang=folder?folder.slice(0,2):"en";
  for(const f of fixtures){assert.ok(block.includes(`href="?scenario=${f.id}#calculator"`));assert.ok(block.includes(f.headline[lang].replace(/&/g,"&amp;")),`${slug} ${lang} headline ${f.id}`);}
  assert.ok(/src="(\.\.\/)?js\/scenarios\.js/.test(html));
 }
}
// PON toolkit links: every cluster page links to the other cluster tools in its own locale.
const CLUSTER=["pon-splitter-loss","pon-distance","onu-rx-power","optical-power-budget","fiber-loss"];
for(const slug of CLUSTER)for(const folder of ["","zh/","es/"]){
 const html=fs.readFileSync(path.join(ROOT,slug,folder,"index.html"),"utf8");
 const block=(html.match(/<!-- NEL_PON_LINKS_START -->([\s\S]*?)<!-- NEL_PON_LINKS_END -->/)||[])[1];
 assert.ok(block,`${slug} ${folder}: PON links block`);
 for(const other of CLUSTER.filter(s=>s!==slug))assert.ok(new RegExp(`href="(?:/tools/|(?:\\.\\./)+)${other}/${folder}"`).test(block),`${slug} ${folder} -> ${other}`);
 assert.ok(block.includes("pon-splitter-loss-guide")&&block.includes("fiber-link-budget-guide"),`${slug} ${folder}: guides`);
}
// CTR meta: within the SEO audit limits and distinct per page.
const titles=new Set();
for(const slug of ["poe-power-budget-calculator","pon-splitter-loss","onu-rx-power","switch-uplink-oversubscription-calculator","dns-ttl-propagation-calculator","pon-distance"])for(const folder of ["","zh/","es/"]){
 const html=fs.readFileSync(path.join(ROOT,slug,folder,"index.html"),"utf8");
 const title=html.match(/<title>([^<]*)<\/title>/)[1];const desc=html.match(/<meta[^>]*name="description"[^>]*>/)[0].match(/content="([^"]*)"/)[1];
 const zh=folder==="zh/";
 assert.ok(title.length>=15&&title.length<=75,`${slug} ${folder} title length ${title.length}`);
 assert.ok(desc.length>=(zh?22:50)&&desc.length<=(zh?100:180),`${slug} ${folder} description length ${desc.length}`);
 assert.ok(!titles.has(title),`duplicate title ${title}`);titles.add(title);
 const og=html.match(/<meta[^>]*property="og:title"[^>]*>/)[0];assert.ok(og.includes(`content="${title.replace(/&/g,"&amp;")}"`),`${slug} ${folder} og:title`);
}
// Distinct query focus: only pon-distance targets "PON Calculator"; only onu-rx-power targets "PON Power Calculator".
const t=(s)=>fs.readFileSync(path.join(ROOT,s,"index.html"),"utf8").match(/<title>([^<]*)/)[1];
assert.ok(t("pon-distance").startsWith("PON Calculator"));assert.ok(t("onu-rx-power").startsWith("PON Power Calculator"));
assert.ok(!/^PON (Power )?Calculator/.test(t("pon-splitter-loss")));
console.log(`PON scenarios: ${n} scenarios x 3 locales, toolkit links and CTR meta OK`);
