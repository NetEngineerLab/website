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

console.log("Switch uplink oversubscription engine tests: PASS");
