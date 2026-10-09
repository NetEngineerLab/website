#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

const base={ports:48,portMbps:1000,util:30,concurrency:50,overhead:10,uplinkMbps:10000,uplinks:2,target:80};
assert.deepEqual(engine.calculate(base),{ok:true,offeredGbps:48,demandGbps:7.92,uplinkGbps:20,safeGbps:16,oversubscription:"2.4:1",demandUtil:39.6,requiredUplinks:1,spareGbps:8.08,status:"pass"});
for(const change of [{ports:0},{portMbps:0},{util:0},{util:101},{concurrency:0},{concurrency:101},{overhead:-1},{uplinkMbps:0},{uplinks:0},{target:0},{target:101},{ports:Number.NaN}])assert.equal(engine.calculate({...base,...change}).ok,false);
assert.equal(engine.calculate({...base,portMbps:Number.POSITIVE_INFINITY}).ok,false);
assert.equal(engine.calculate({...base,uplinkMbps:Number.NEGATIVE_INFINITY}).ok,false);
const boundary={ports:1,portMbps:1000,util:100,concurrency:100,overhead:0,uplinkMbps:1000,uplinks:1};
assert.equal(engine.calculate({...boundary,target:100}).status,"pass");
assert.equal(engine.calculate({...boundary,target:80}).status,"warning");
assert.equal(engine.calculate({...boundary,target:100,overhead:0.01}).status,"fail");
assert.equal(engine.calculate({...boundary,target:50}).requiredUplinks,2);

for(const change of [{uplinks:1,failedUplinks:1},{uplinks:3,failedUplinks:3},{uplinks:2,failedUplinks:5}]){
  const input={...base,...change,engineering:true},report=engine.buildReport(input),s=report.result.scenarios.nMinus1;
  assert.equal(s.activeUplinks,0);
  assert.equal(s.capacityState,"unavailable");
  assert.equal(s.demandUtil,null);
  assert.equal(s.oversubscription,null);
  assert.equal(s.status,"fail");
  assert.equal(report.result.checks.n1,false);
  assert(s.warnings.includes("noAvailableUplinks"));
  assert(report.result.warnings.includes("noAvailableUplinks"));
  const json=engine.toJSON(report),csv=engine.toCSV(report),decoded=JSON.parse(json).result.scenarios.nMinus1;
  assert.equal(decoded.demandUtil,null);
  assert.equal(decoded.oversubscription,null);
  assert.equal(decoded.capacityState,"unavailable");
  assert(!/Infinity|NaN/.test(json+csv));
  const rows=csv.split("\n"),header=rows[0].split(","),row=rows.find(x=>x.startsWith("N-1,")).split(",");
  assert.deepEqual(header.slice(0,7),["scenario","peakDemandGbps","uplinkGbps","safeGbps","requiredUplinks","demandUtil","status"]);
  assert.deepEqual(header.slice(7),["activeUplinks","capacityState","oversubscription"]);
  assert.equal(row[5],"N/A");
  assert.deepEqual(row.slice(6),["fail","0","unavailable","N/A"]);
}
const normal=engine.calculate({...base,engineering:true,failedUplinks:1,growthPct:0});
assert.equal(normal.scenarios.nMinus1.activeUplinks,1);
assert.equal(normal.scenarios.nMinus1.capacityState,"available");
assert.equal(normal.scenarios.nMinus1.demandUtil,79.2);
assert.equal(normal.scenarios.nMinus1.oversubscription,"4.8:1");
assert.equal(normal.scenarios.nMinus1.status,"pass");
assert(!normal.scenarios.nMinus1.warnings.includes("noAvailableUplinks"));
assert.equal(JSON.parse(engine.toJSON(engine.buildReport({...base,growthPct:0}))).result.scenarios.nMinus1.demandUtil,79.2);
assert(engine.toCSV(normal).includes("N-1,7.92,10,8,1,79.2,pass,1,available,4.8:1"));

console.log("Switch uplink oversubscription engine tests: PASS");
