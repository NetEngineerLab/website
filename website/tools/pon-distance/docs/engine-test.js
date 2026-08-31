#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

const base={
  mode:"model",
  tx:1.5,sens:-27,over:-8,planned:5,systemReach:20,attenuation:0.3,
  spliceCount:6,spliceLoss:0.1,connectorCount:4,connectorLoss:0.3,
  s1:10.5,s2:10.5,other:0,margin:3
};

const normal=engine.calculate(base);
assert.equal(normal.ok,true);
close(normal.maxChannelLoss,28.5);
close(normal.fixedPhysical,22.8);
close(normal.fiberAllowanceDesign,2.7);
close(normal.opticalMax,9);
close(normal.effectiveMax,9);
close(normal.plannedPhysical,24.3);
close(normal.designRemaining,1.2);
close(normal.estimatedRx,-22.8);
assert.equal(normal.ratio,64);
assert.equal(normal.limiter,"optical");
assert.equal(normal.status,"healthy");

assert.equal(engine.calculate({...base,planned:-1}).ok,false);
assert.equal(engine.calculate({...base,attenuation:Number.NaN}).ok,false);
assert.equal(engine.calculate({...base,tx:Number.POSITIVE_INFINITY}).ok,false);
assert.equal(engine.calculate(null).ok,false);

const zeroAttenuation=engine.calculate({...base,attenuation:0});
assert.equal(zeroAttenuation.ok,false);

const exactPhysical=engine.calculate({...base,margin:0,planned:19});
close(exactPhysical.physicalHeadroom,0);
close(exactPhysical.estimatedRx,base.sens);
assert.equal(exactPhysical.status,"healthy");
assert.equal(engine.calculate({...base,margin:0,planned:19.000001}).status,"failed");

const exactDesign=engine.calculate({...base,planned:9});
close(exactDesign.designRemaining,0);
assert.equal(exactDesign.status,"healthy");
assert.equal(engine.calculate({...base,planned:9.000001}).status,"failed");

const systemLimited=engine.calculate({...base,tx:5,sens:-33,s1:13.8,s2:0,systemReach:20,planned:20});
assert.equal(systemLimited.limiter,"system");
assert.equal(systemLimited.status,"limited");
assert.equal(engine.calculate({...base,tx:5,sens:-33,s1:13.8,s2:0,systemReach:20,planned:20.000001}).status,"failed");

const thresholdBase={...base,spliceCount:0,connectorCount:0,s1:0,s2:0,other:0,margin:0,attenuation:1,tx:20,sens:0,over:8};
assert.equal(engine.calculate({...thresholdBase,systemReach:19.95}).limiter,"equal");
assert.equal(engine.calculate({...thresholdBase,systemReach:19.949999}).limiter,"system");
assert.equal(engine.calculate({...thresholdBase,systemReach:20.05}).limiter,"equal");
assert.equal(engine.calculate({...thresholdBase,systemReach:20.050001}).limiter,"optical");

for(const invalid of [undefined,null,[],"",{...base,planned:"5"},{...base,tx:undefined}])assert.equal(engine.calculate(invalid).ok,false);
for(const [key,value] of [["spliceCount",1.5],["connectorCount",Number.MAX_SAFE_INTEGER+1]])assert.equal(engine.calculate({...base,[key]:value}).ok,false);
for(const [key,value] of [["s1",10.4],["s2",1]])assert.equal(engine.calculate({...base,[key]:value}).ok,false);
assert.equal(engine.calculate({...base,sens:-8,over:-8}).ok,false);
assert.equal(engine.calculate({...base,distance:1e308,attenuation:1e308}).ok,false);
assert.equal(engine.calculate({...base,systemReach:0.1}).ok,true);
assert.equal(engine.calculate({...base,systemReach:0.099999999}).ok,false);
assert.equal(engine.calculate({...base,systemReach:1e-300}).ok,false);
assert.equal(engine.calculate({...base,tx:5,sens:-33,s1:13.8,s2:0,systemReach:20,planned:20+5e-10}).status,"limited");
assert.equal(engine.calculate({...base,tx:5,sens:-33,s1:13.8,s2:0,systemReach:20,planned:20+1.1e-9}).status,"failed");

console.log("PON maximum distance engine tests: PASS");
