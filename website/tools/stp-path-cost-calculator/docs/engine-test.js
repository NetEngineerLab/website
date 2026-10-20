#!/usr/bin/env node
"use strict";
const assert=require("assert");
const engine=require("../js/engine.js");

// IEEE 802.1D-2004 / 802.1Q recommended long values
const expected={10:2000000,100:200000,1000:20000,10000:2000,25000:800,40000:500,100000:200,400000:50,800000:25};
for(const [mbps,cost] of Object.entries(expected))assert.equal(engine.longCost(Number(mbps)),cost,`long ${mbps}`);
assert.equal(engine.longCost(0.001),200000000);
assert.equal(engine.longCost(1600000),13);
// IEEE 802.1D-1998 short values
const short={4:250,10:100,16:62,100:19,1000:4,10000:2};
for(const [mbps,cost] of Object.entries(short))assert.equal(engine.costFor(Number(mbps),"short"),cost,`short ${mbps}`);
assert.equal(engine.costFor(25000,"short"),null);

const r=engine.calculate({method:"long",pathA:"10000, 10000",pathB:"1000"});
assert.equal(r.ok,true);
assert.equal(r.totalA,4000);
assert.equal(r.totalB,20000);
assert.equal(r.winner,"A");
assert.equal(r.display.costsA,"2,000 + 2,000");
assert.equal(r.display.difference,"16,000");

const s=engine.calculate({method:"short",pathA:"10000,10000",pathB:"1000"});
assert.equal(s.totalA,4);
assert.equal(s.totalB,4);
assert.equal(s.winner,"tie");
assert.equal(s.status,"warning");

const b=engine.calculate({method:"long",pathA:"1000;1000;1000",pathB:"100"});
assert.equal(b.winner,"A");
assert.equal(engine.calculate({method:"long",pathA:"100",pathB:"1000 1000"}).winner,"B");

assert.equal(engine.calculate({method:"short",pathA:"25000",pathB:"1000"}).error,"short-undefined");
assert.equal(engine.calculate({method:"long",pathA:"",pathB:"1000"}).ok,false);
assert.equal(engine.calculate({method:"long",pathA:"abc",pathB:"1000"}).ok,false);
assert.equal(engine.calculate({method:"long",pathA:"-1000",pathB:"1000"}).ok,false);
assert.equal(engine.calculate({method:"x",pathA:"1000",pathB:"1000"}).ok,false);
assert.equal(engine.calculate(null).ok,false);
console.log("STP path cost engine tests: PASS");
