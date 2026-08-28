#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

const base={
  distance:20,attenuation:0.2,spliceCount:6,spliceLoss:0.1,
  connectorCount:4,connectorLoss:0.3,splitter1:0,splitter2:0,
  otherLoss:0,engineeringMargin:3,availableBudget:28,
  txPower:3,rxThreshold:-27
};

const result=engine.calculate(base);
assert.equal(result.ok,true);
assert.equal(result.physicalLoss,5.8);
assert.equal(result.designLoss,8.8);
assert.equal(result.budgetRemaining,19.2);
assert.equal(result.estimatedRxPower,-2.8);
assert.equal(result.rxMargin,24.2);
assert.equal(result.status,"healthy");

assert.equal(engine.calculate({...base,distance:-1}).ok,false);
assert.equal(engine.calculate({...base,distance:Number.NaN}).ok,false);
assert.equal(engine.calculate({...base,distance:Number.POSITIVE_INFINITY}).ok,false);
assert.equal(engine.calculate({...base,availableBudget:5}).status,"failed");
assert.equal(engine.calculate({...base,availableBudget:10}).status,"warning");

const zero={
  distance:0,attenuation:0,spliceCount:0,spliceLoss:0,
  connectorCount:0,connectorLoss:0,splitter1:0,splitter2:0,
  otherLoss:0,engineeringMargin:0,availableBudget:0,
  txPower:0,rxThreshold:0
};
assert.equal(engine.calculate(zero).status,"warning");

assert.equal(engine.calculate({...base,availableBudget:8.8}).budgetRemaining,0);
assert.equal(engine.calculate({...base,availableBudget:8.8}).status,"warning");
assert.equal(engine.calculate({...base,availableBudget:11.8}).budgetRemaining,3);
assert.equal(engine.calculate({...base,availableBudget:11.8}).status,"healthy");

assert.equal(engine.calculate({...base,rxThreshold:-2.8}).rxMargin,0);
assert.equal(engine.calculate({...base,rxThreshold:-2.8}).status,"warning");
assert.equal(engine.calculate({...base,rxThreshold:-5.8}).rxMargin,3);
assert.equal(engine.calculate({...base,rxThreshold:-5.8}).status,"healthy");
assert.equal(engine.calculate({...base,rxThreshold:-2.7}).status,"failed");

console.log("Fiber loss engine tests: PASS");
