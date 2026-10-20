#!/usr/bin/env node
"use strict";
const assert=require("assert");
const engine=require("../js/engine.js");
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
const base={pmdCoef:0.2,lengthKm:80,componentCount:4,componentPmd:0.1,symbolRate:10.3125,tolerancePct:10,maxRatio:3};

const r=engine.calculate(base);
assert.equal(r.ok,true);
near(r.fiberDgd,0.2*Math.sqrt(80),1e-12);
near(r.meanDgd,Math.sqrt(0.04*80+4*0.01),1e-12);
assert.equal(r.display.fiberDgd,"1.789 ps");
assert.equal(r.display.meanDgd,"1.800 ps");
assert.equal(r.display.symbolPeriod,"96.97 ps");
assert.equal(r.display.allowedDgd,"9.70 ps");
assert.equal(r.display.dgdMargin,"7.897 ps");
assert.equal(r.display.maxDgd,"5.40 ps");
assert.equal(r.display.maxLength,"2350 km");
assert.equal(r.status,"healthy");

const legacy=engine.calculate({...base,pmdCoef:0.5,componentCount:0,lengthKm:376});
near(legacy.maxKm,Math.pow(1000/10.3125*0.1/0.5,2),1e-9);
assert.equal(legacy.status,"warning");
const over=engine.calculate({...base,pmdCoef:0.5,componentCount:0,lengthKm:400});
assert.equal(over.status,"failed");

const zero=engine.calculate({...base,pmdCoef:0});
assert.equal(zero.maxLength,undefined);
assert.equal(zero.display.maxLength,"∞");
const comps=engine.calculate({...base,componentCount:10000});
assert.equal(comps.ok,false);
const swamped=engine.calculate({...base,componentCount:100,componentPmd:1});
assert.equal(swamped.maxKm,0);

assert.equal(engine.calculate({...base,lengthKm:0}).ok,false);
assert.equal(engine.calculate({...base,symbolRate:0}).ok,false);
assert.equal(engine.calculate({...base,componentCount:1.5}).ok,false);
assert.equal(engine.calculate({...base,maxRatio:0.5}).ok,false);
assert.equal(engine.calculate(null).ok,false);
console.log("PMD budget engine tests: PASS");

// Audit PMD-1: components alone exceed the budget -> explicit note instead of "0 km".
{
  const c=engine.calculate({...base,componentCount:2,componentPmd:8});
  assert.equal(c.ok,true);
  assert.equal(c.componentsExceed,true);
  assert.equal(c.display.maxLength,"@pmd-components-exceed");
  assert.equal(engine.calculate(base).componentsExceed,false);
}
console.log("PMD components-exceed note OK");
