#!/usr/bin/env node
"use strict";
const assert=require("assert");
const engine=require("../js/engine.js");
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const base={ranks:8,paramsBillion:7,bytesPerParam:2,linkGbps:400,efficiencyPct:100,latencyUs:0};

const r=engine.calculate(base);
assert.equal(r.ok,true);
assert.equal(r.display.bufferSize,"14.000 GB");
assert.equal(r.display.busFactor,"1.7500");
assert.equal(r.display.perRank,"24.500 GB");
assert.equal(r.display.fabricTraffic,"196.000 GB");
assert.equal(r.display.totalTime,"490.000 ms");
assert.equal(r.display.busBw,"50.00 GB/s");
assert.equal(r.display.algBw,"28.57 GB/s");
near(r.busBw,50e9);

const d=engine.calculate({...base,efficiencyPct:80,latencyUs:5});
near(d.bwTime,0.6125);
near(d.latTime,70e-6);
assert.equal(d.display.totalTime,"612.570 ms");
assert.ok(d.busBw<40e9&&d.busBw>39.99e9);

near(engine.calculate({...base,ranks:2}).factor,1);
near(engine.calculate({...base,ranks:4}).factor,1.5);
near(engine.calculate({...base,ranks:128}).factor,2*127/128);
near(engine.calculate({...base,bytesPerParam:4}).S,28e9);

assert.equal(engine.calculate({...base,ranks:1}).ok,false);
assert.equal(engine.calculate({...base,ranks:8.5}).ok,false);
assert.equal(engine.calculate({...base,bytesPerParam:3}).ok,false);
assert.equal(engine.calculate({...base,linkGbps:0}).ok,false);
assert.equal(engine.calculate({...base,efficiencyPct:0}).ok,false);
assert.equal(engine.calculate({...base,latencyUs:-1}).ok,false);
assert.equal(engine.calculate(null).ok,false);
console.log("All-reduce engine tests: PASS");
