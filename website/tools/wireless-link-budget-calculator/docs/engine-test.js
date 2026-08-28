#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

const base={distanceKm:5,frequencyGHz:5.8,txPower:20,txCableLoss:1,txGain:16,rxGain:16,rxCableLoss:1,extraLoss:2,sensitivity:-75,obstaclePercent:50,clearanceM:10};
assert.deepEqual(engine.calculate(base),{ok:true,distanceKm:5,frequencyGHz:5.8,eirp:35,pathLoss:121.7,rxPower:-73.7,fadeMargin:1.3,fresnelRadius:8.04,requiredClearance:4.82,clearanceMargin:5.18,status:"marginal",warnings:["fade"]});
assert.equal(engine.calculate({...base,distanceKm:0}).ok,false);
assert.equal(engine.calculate({...base,distanceKm:Number.NaN}).ok,false);
assert.equal(engine.calculate({...base,frequencyGHz:Number.POSITIVE_INFINITY}).ok,false);
assert.equal(engine.calculate({...base,txPower:Number.NEGATIVE_INFINITY}).ok,false);
assert.equal(engine.calculate({...base,obstaclePercent:0}).ok,false);
assert.equal(engine.calculate({...base,obstaclePercent:100}).ok,false);

const rawRx=20-1+16-engine.fspl(5,5.8)-2+16-1;
const atMargin=margin=>engine.calculate({...base,clearanceM:0,sensitivity:rawRx-margin});
assert.equal(atMargin(20).status,"excellent");
assert.equal(atMargin(19.999).status,"good");
assert.equal(atMargin(10).status,"good");
assert.equal(atMargin(9.999).status,"marginal");
assert.equal(atMargin(0).status,"marginal");
assert.equal(atMargin(-0.001).status,"fail");
assert.equal(engine.calculate({...base,sensitivity:rawRx-25,clearanceM:0.1}).status,"marginal");
assert.deepEqual(engine.calculate({...base,txPower:40,frequencyGHz:60}).warnings,["fade","eirp","oxygen"]);

console.log("Wireless link budget engine tests: PASS");
