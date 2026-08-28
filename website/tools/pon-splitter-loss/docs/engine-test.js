#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

const base={
  distance:10,attenuation:0.25,spliceCount:6,spliceLoss:0.1,
  connectorCount:4,connectorLoss:0.3,s1:10.5,s2:10.5,s3:0,
  other:0,penalty:1,margin:3,tx:3,sens:-30,over:-8,systemReach:20
};

const result=engine.calculate(base);
assert.equal(result.ok,true);
assert.equal(result.totalRatio,64);
close(result.splitterLoss,21);
close(result.fiberLoss,2.5);
close(result.physicalLoss,25.3);
close(result.designLoss,28.3);
close(result.standardBudget,32);
close(result.remaining,3.7);
close(result.rx,-22.3);
close(result.opticalMax,24.8);
close(result.effectiveMax,20);
assert.equal(result.status,"healthy");

assert.equal(engine.calculate({...base,distance:-1}).ok,false);
assert.equal(engine.calculate({...base,distance:Number.NaN}).ok,false);
assert.equal(engine.calculate({...base,distance:Number.POSITIVE_INFINITY}).ok,false);
close(engine.calculate({...base,margin:3.7}).remaining,3);
assert.equal(engine.calculate({...base,margin:3.7}).status,"healthy");
close(engine.calculate({...base,margin:6.7}).remaining,0);
assert.equal(engine.calculate({...base,margin:6.7}).status,"warning");
assert.equal(engine.calculate({...base,margin:6.8}).status,"failed");
close(engine.calculate({...base,over:-22.3}).overMargin,0);
assert.equal(engine.calculate({...base,over:-22.3}).status,"warning");
close(engine.calculate({...base,over:-19.3}).overMargin,3);
assert.equal(engine.calculate({...base,over:-19.3}).status,"healthy");
assert.equal(engine.calculate({...base,attenuation:0}).opticalMax,0);
assert.equal(engine.calculate({...base,systemReach:0}).effectiveMax,0);

console.log("PON splitter loss engine tests: PASS");
