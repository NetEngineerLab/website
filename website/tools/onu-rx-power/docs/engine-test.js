#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

const base={
  measured:-18,sens:-27,over:-8,noSignal:-40,warning:3,
  tx:1.5,distance:10,attenuation:0.3,spliceCount:6,spliceLoss:0.1,
  connectorCount:4,connectorLoss:0.3,s1:10.5,s2:10.5,other:0
};

const result=engine.calculate(base);
assert.equal(result.ok,true);
assert.equal(result.status,"healthy");
close(result.sensitivityMargin,9);
close(result.overloadMargin,10);
close(result.receiverWindow,19);
close(result.modeledLoss,25.8);
close(result.expectedRx,-24.3);
close(result.deviation,6.3);
close(result.inferredExtra,0);
assert.equal(result.ratio,64);

assert.equal(engine.calculate({...base,distance:-1}).ok,false);
assert.equal(engine.calculate({...base,distance:Number.NaN}).ok,false);
assert.equal(engine.calculate({...base,distance:Number.POSITIVE_INFINITY}).ok,false);
assert.equal(engine.calculate({...base,measured:-40}).status,"nosignal");
assert.equal(engine.calculate({...base,measured:-39.9}).status,"failed");
assert.equal(engine.calculate({...base,measured:-27.1}).status,"failed");
close(engine.calculate({...base,measured:-27}).sensitivityMargin,0);
assert.equal(engine.calculate({...base,measured:-27}).status,"warning");
close(engine.calculate({...base,measured:-24}).sensitivityMargin,3);
assert.equal(engine.calculate({...base,measured:-24}).status,"healthy");
close(engine.calculate({...base,measured:-11}).overloadMargin,3);
assert.equal(engine.calculate({...base,measured:-11}).status,"healthy");
close(engine.calculate({...base,measured:-8}).overloadMargin,0);
assert.equal(engine.calculate({...base,measured:-8}).status,"warning");
assert.equal(engine.calculate({...base,measured:-7.9}).status,"overload");
close(engine.calculate({...base,measured:-30}).inferredExtra,5.7);

console.log("ONU RX power engine tests: PASS");
