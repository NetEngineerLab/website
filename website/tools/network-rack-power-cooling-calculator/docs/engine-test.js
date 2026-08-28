#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

const base={loadW:500,qty:10,util:70,growth:20,redundancy:20,pf:0.9,voltage:230,phases:1,breaker:32,hours:24,days:30,rate:0.8,cop:3};
assert.deepEqual(engine.calculate(base),{ok:true,connectedW:5000,actualW:3500,designW:5040,designKW:5.04,va:5600,current:24.35,loadPct:76.1,btu:17197.2,coolingW:1680,tons:1.433,daily:84,monthly:2520,cost:2016,status:"pass"});
for(const change of [{loadW:0},{qty:0},{util:0},{util:101},{growth:-1},{redundancy:-1},{pf:0},{pf:1.01},{voltage:0},{phases:2},{breaker:0},{hours:-1},{hours:25},{days:32},{rate:-1},{cop:0},{loadW:Number.NaN}])assert.equal(engine.calculate({...base,...change}).ok,false);
assert.equal(engine.calculate({...base,qty:Number.POSITIVE_INFINITY}).ok,false);
assert.equal(engine.calculate({...base,voltage:Number.NEGATIVE_INFINITY}).ok,false);
const boundary={...base,loadW:800,qty:1,util:100,growth:0,redundancy:0,pf:1,voltage:100,phases:1,hours:0,days:0,rate:0,cop:1};
assert.equal(engine.calculate({...boundary,breaker:10}).status,"pass");
assert.equal(engine.calculate({...boundary,breaker:9.999}).status,"warning");
assert.equal(engine.calculate({...boundary,breaker:8}).status,"warning");
assert.equal(engine.calculate({...boundary,breaker:7.999}).status,"fail");
assert.equal(engine.calculate({...boundary,phases:3,voltage:400,breaker:2}).ok,true);

console.log("Network rack power and cooling engine tests: PASS");
