#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

const base={
  tx:3,sens:-30,over:-8,penalty:1.5,d:20,a:0.2,
  sc:6,sl:0.1,cc:4,cl:0.3,s1:17,s2:0,s3:0,
  other:0,margin:3
};

const result=engine.calculate(base);
assert.equal(result.ok,true);
close(result.raw,33);
close(result.standard,31.5);
close(result.physical,22.8);
close(result.design,25.8);
close(result.remain,5.7);
close(result.rx,-19.8);
close(result.sensM,10.2);
close(result.overM,11.8);
close(result.maxD,48.5);
assert.equal(result.st,"healthy");

assert.equal(engine.calculate({...base,d:-1}).ok,false);
assert.equal(engine.calculate({...base,d:Number.NaN}).ok,false);
assert.equal(engine.calculate({...base,d:Number.POSITIVE_INFINITY}).ok,false);

close(engine.calculate({...base,margin:5.7}).remain,3);
assert.equal(engine.calculate({...base,margin:5.7}).st,"healthy");
close(engine.calculate({...base,margin:8.7}).remain,0);
assert.equal(engine.calculate({...base,margin:8.7}).st,"warning");
assert.equal(engine.calculate({...base,margin:8.8}).st,"failed");
close(engine.calculate({...base,over:-19.8}).overM,0);
assert.equal(engine.calculate({...base,over:-19.8}).st,"warning");
close(engine.calculate({...base,over:-16.8}).overM,3);
assert.equal(engine.calculate({...base,over:-16.8}).st,"healthy");
assert.equal(engine.calculate({...base,over:-17}).st,"warning");
assert.equal(engine.calculate({...base,over:-20}).st,"failed");
assert.equal(engine.calculate({...base,a:0}).maxD,0);

console.log("Optical power budget engine tests: PASS");
