#!/usr/bin/env node
"use strict";
const assert=require("assert");
const engine=require("../js/engine.js");
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
const base={mode:"model",wavelength:1550,lambda0:1310,s0:0.092,manualD:17,lengthKm:80,compensation:0,tolerance:1600,spectralWidth:0.1};

// ITU-T G.652 D(λ) = S0/4 (λ − λ0⁴/λ³)
near(engine.coefficient(1550,1310,0.092),0.023*(1550-Math.pow(1310,4)/Math.pow(1550,3)),1e-12);
near(engine.coefficient(1310,1310,0.092),0,1e-12);
assert.ok(engine.coefficient(1300,1310,0.092)<0);

const r=engine.calculate(base);
assert.equal(r.ok,true);
assert.equal(r.display.dCoef,"17.461 ps/(nm·km)");
assert.equal(r.display.fiberCd,"1396.8 ps/nm");
assert.equal(r.display.cdMargin,"203.2 ps/nm");
assert.equal(r.display.maxLength,"91.63 km");
assert.equal(r.display.broadening,"139.68 ps");
assert.equal(r.display.usedPct,"87.3%");
assert.equal(r.status,"warning");

const comp=engine.calculate({...base,compensation:680});
assert.equal(comp.display.residualCd,"716.8 ps/nm");
assert.equal(comp.status,"healthy");
near(comp.maxKm,(1600+680)/r.D,1e-9);

const fail=engine.calculate({...base,lengthKm:100});
assert.equal(fail.status,"failed");
assert.ok(fail.margin<0);

const manual=engine.calculate({...base,mode:"manual",manualD:4.5,lengthKm:100});
assert.equal(manual.display.fiberCd,"450.0 ps/nm");
const neg=engine.calculate({...base,mode:"manual",manualD:-5,lengthKm:100,compensation:-200});
assert.equal(neg.display.residualCd,"-300.0 ps/nm");
near(neg.maxKm,(1600+200)/5,1e-9);

assert.equal(engine.calculate({...base,lengthKm:0}).ok,false);
assert.equal(engine.calculate({...base,tolerance:0}).ok,false);
assert.equal(engine.calculate({...base,wavelength:900}).ok,false);
assert.equal(engine.calculate({...base,s0:Number.NaN}).ok,false);
assert.equal(engine.calculate({...base,mode:"x"}).ok,false);
assert.equal(engine.calculate(null).ok,false);
console.log("Chromatic dispersion engine tests: PASS");
