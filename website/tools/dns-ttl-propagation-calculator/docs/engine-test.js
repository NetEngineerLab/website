#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

const base={oldTtl:3600,newTtl:300,elapsed:1200,authDelay:60,lowerBefore:2,negativeTtl:600};
assert.deepEqual(engine.calculate(base),{ok:true,remaining:40,typical:21,worst:41,lowerAt:2,stableAfter:10,oldQueries:24,newQueries:288,queryIncrease:12,status:"pass"});
for(const change of [{oldTtl:-1},{newTtl:0},{elapsed:-1},{authDelay:-1},{lowerBefore:-1},{negativeTtl:-1},{newTtl:Number.NaN},{elapsed:Number.POSITIVE_INFINITY}])assert.equal(engine.calculate({...base,...change}).ok,false);
assert.equal(engine.calculate({...base,authDelay:Number.NEGATIVE_INFINITY}).ok,false);
assert.equal(engine.calculate({...base,lowerBefore:1}).status,"pass");
assert.equal(engine.calculate({...base,lowerBefore:0.999999}).status,"warning");
assert.equal(engine.calculate({...base,elapsed:5000}).remaining,0);
assert.equal(engine.calculate({...base,oldTtl:0}).oldQueries,86400);
assert.equal(engine.calculate({...base,negativeTtl:7200}).worst,121);

console.log("DNS TTL propagation engine tests: PASS");
