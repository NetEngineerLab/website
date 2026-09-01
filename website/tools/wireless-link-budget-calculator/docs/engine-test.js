#!/usr/bin/env node
"use strict";
const assert=require("assert"),engine=require("../js/engine.js");
const base={distanceKm:5,frequencyGHz:5.8,txPower:20,txCableLoss:1,txGain:16,rxGain:16,rxCableLoss:1,extraLoss:2,sensitivity:-75,obstaclePercent:50,clearanceM:10};
assert.deepEqual(engine.calculate(base),{ok:true,distanceKm:5,frequencyGHz:5.8,eirp:35,pathLoss:121.7,rxPower:-73.7,fadeMargin:1.3,fresnelRadius:8.04,requiredClearance:4.82,clearanceMargin:5.18,status:"marginal",warnings:["fade"]});
for(const invalid of [undefined,null,[],"",{...base,distanceKm:0},{...base,frequencyGHz:0},{...base,txPower:undefined},{...base,txPower:"20"},{...base,txCableLoss:-1},{...base,rxCableLoss:-1},{...base,extraLoss:-1},{...base,clearanceM:-1},{...base,obstaclePercent:0},{...base,obstaclePercent:100},{...base,distanceKm:Number.NaN},{...base,frequencyGHz:Number.POSITIVE_INFINITY},{...base,txPower:Number.NEGATIVE_INFINITY},{...base,distanceKm:1e308,frequencyGHz:1e308}])assert.equal(engine.calculate(invalid).ok,false);
const rawRx=20-1+16-engine.fspl(5,5.8)-2+16-1,atMargin=margin=>engine.calculate({...base,sensitivity:rawRx-margin});
for(const [margin,shown,status] of [[20,20,"excellent"],[19.994,19.99,"good"],[10,10,"good"],[9.994,9.99,"marginal"],[0,0,"marginal"],[-.006,-.01,"fail"]]){const r=atMargin(margin);assert.equal(r.fadeMargin,shown);assert.equal(r.status,status)}
const required=engine.fresnel(5,5.8,50)*.6,atClearance=delta=>engine.calculate({...base,sensitivity:rawRx-25,clearanceM:required+delta});
const clear=atClearance(-.001);assert.equal(clear.clearanceMargin,0);assert.equal(clear.status,"excellent");assert.ok(!clear.warnings.includes("fresnel"));
const blocked=atClearance(-.006);assert.equal(blocked.clearanceMargin,-.01);assert.equal(blocked.status,"marginal");assert.ok(blocked.warnings.includes("fresnel"));
assert.deepEqual(engine.calculate({...base,txPower:40,frequencyGHz:60}).warnings,["fade","eirp","oxygen"]);
console.log("Wireless link budget engine tests: PASS");
