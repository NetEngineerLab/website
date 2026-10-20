#!/usr/bin/env node
"use strict";
const assert=require("assert");
const engine=require("../js/engine.js");
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);

const small=engine.calculate({frameBytes:64,rateGbps:10,hops:3});
assert.equal(small.ok,true);
assert.equal(small.display.perHop,"51.20 ns");
assert.equal(small.display.totalDelay,"153.60 ns");
assert.equal(small.display.wireTime,"67.20 ns");
assert.equal(small.display.wireBytes,"84 B");
assert.equal(small.display.frameRate,"14,880,952 fps");
assert.equal(small.display.efficiency,"76.19%");

const big=engine.calculate({frameBytes:1518,rateGbps:10,hops:3});
assert.equal(big.display.perHop,"1.214 µs");
assert.equal(big.display.totalDelay,"3.643 µs");
assert.equal(big.display.frameRate,"812,743 fps");
assert.equal(big.display.efficiency,"98.70%");

const gig=engine.calculate({frameBytes:1518,rateGbps:1,hops:1});
assert.equal(gig.display.perHop,"12.144 µs");
assert.equal(engine.calculate({frameBytes:64,rateGbps:1,hops:1}).display.frameRate,"1,488,095 fps");
const slow=engine.calculate({frameBytes:1518,rateGbps:0.01,hops:2});
assert.equal(slow.display.perHop,"1.214 ms");
near(engine.calculate({frameBytes:9018,rateGbps:10,hops:1}).frameNs,7214.4,1e-6);

assert.equal(engine.calculate({frameBytes:63,rateGbps:10,hops:1}).ok,false);
assert.equal(engine.calculate({frameBytes:64.5,rateGbps:10,hops:1}).ok,false);
assert.equal(engine.calculate({frameBytes:64,rateGbps:0,hops:1}).ok,false);
assert.equal(engine.calculate({frameBytes:64,rateGbps:10,hops:0}).ok,false);
assert.equal(engine.calculate(null).ok,false);
console.log("Ethernet serialization engine tests: PASS");
