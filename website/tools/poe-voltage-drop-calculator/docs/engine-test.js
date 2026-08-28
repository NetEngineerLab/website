#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

const base={lengthM:100,sourceV:50,loadW:30,awg:24,pairs:2,tempC:20,contactOhm:0.2,efficiency:90,minV:42};
assert.deepEqual(engine.calculate(base),{ok:true,conductorR:84.22,loopR:8.622,current:0.769,perConductorA:0.384,dropV:6.63,remoteV:43.37,lossW:5.09,lossPct:14.5,status:"warning",warnings:["loss","current"]});
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

console.log("PoE voltage drop engine tests: PASS");
