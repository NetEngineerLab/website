#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

const base={lengthM:100,sourceV:50,loadW:30,awg:24,pairs:2,tempC:20,contactOhm:0.2,efficiency:90,minV:42};
assert.deepEqual(engine.calculate(base),{ok:true,conductorR:84.22,loopR:8.622,current:0.769,perConductorA:0.384,dropV:6.63,remoteV:43.37,lossW:5.09,lossPct:13.3,status:"warning",warnings:["loss","current"]});
for(const change of [{lengthM:0},{sourceV:0},{loadW:0},{awg:21},{pairs:3},{efficiency:0},{efficiency:101},{lengthM:Number.NaN},{sourceV:Number.POSITIVE_INFINITY}])assert.equal(engine.calculate({...base,...change}).ok,false);
assert.equal(engine.calculate({...base,loadW:Number.NEGATIVE_INFINITY}).ok,false);
const overload=engine.calculate({...base,lengthM:1000,loadW:500});
assert.equal(overload.ok,false);
assert.equal(overload.error,"overload");
const short=engine.calculate({...base,lengthM:10,loadW:10,minV:0});
assert.equal(short.status,"pass");
assert.equal(engine.calculate({...base,minV:43.37}).status,"warning");
assert.equal(engine.calculate({...base,minV:43.38}).status,"fail");
assert.ok(engine.calculate({...base,tempC:51}).warnings.includes("temperature"));

// 1 m of 22 AWG over four powered pairs contributes 0.02648 ohm; the added
// contact resistance makes an exact 1 ohm loop for independent boundary math.
const lossBoundary={lengthM:1,sourceV:50,awg:22,pairs:4,tempC:20,contactOhm:0.97352,efficiency:100,minV:0};
const loadAtLossFraction=fraction=>fraction*(1-fraction)*50*50;
const ten=engine.calculate({...lossBoundary,loadW:loadAtLossFraction(0.1)});
assert.deepEqual({current:ten.current,remoteV:ten.remoteV,lossW:ten.lossW,lossPct:ten.lossPct,status:ten.status},{current:5,remoteV:45,lossW:25,lossPct:10,status:"pass"});
assert.equal(50*ten.current,225+ten.lossW,"source power must equal PD input plus cable loss");
assert.equal(engine.calculate({...lossBoundary,loadW:loadAtLossFraction(0.1001)}).status,"warning");
assert.equal(engine.calculate({...lossBoundary,loadW:loadAtLossFraction(0.2)}).status,"warning");
assert.equal(engine.calculate({...lossBoundary,loadW:loadAtLossFraction(0.2001)}).status,"fail");

console.log("PoE voltage drop engine tests: PASS");
