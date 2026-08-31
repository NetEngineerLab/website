#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

const base={
  tx:3,txMax:7,sens:-30,over:-8,penalty:1.5,d:20,a:0.2,
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
close(result.rxMax,-15.8);
close(result.sensM,10.2);
close(result.overM,7.8);
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
close(engine.calculate({...base,over:-15.8}).overM,0);
assert.equal(engine.calculate({...base,over:-15.8}).st,"warning");
close(engine.calculate({...base,over:-12.8}).overM,3);
assert.equal(engine.calculate({...base,over:-12.8}).st,"healthy");
assert.equal(engine.calculate({...base,over:-13}).st,"warning");
assert.equal(engine.calculate({...base,over:-16}).st,"failed");
assert.equal(engine.calculate({...base,a:0}).ok,false);

for(const invalid of [undefined,null,[],"",{...base,d:"20"},{...base,txMax:undefined}]){
  assert.equal(engine.calculate(invalid).ok,false);
}
for(const [key,value] of [["sc",1.5],["cc",Number.MAX_SAFE_INTEGER+1]]){
  assert.equal(engine.calculate({...base,[key]:value}).ok,false);
}
assert.equal(engine.calculate({...base,tx:8,txMax:7}).ok,false);
assert.equal(engine.calculate({...base,sens:-8,over:-8}).ok,false);
assert.equal(engine.calculate({...base,d:1e308,a:1e308}).ok,false);

const exactZeroWithFloatNoise=engine.calculate({
  ...base,tx:0.3,txMax:0.3,sens:0,over:1,
  penalty:0,d:1,a:0.1,sc:0,sl:0,cc:1,cl:0.2,
  s1:0,s2:0,s3:0,other:0,margin:0
});
assert.equal(exactZeroWithFloatNoise.sensM,0);
assert.equal(exactZeroWithFloatNoise.st,"warning");

console.log("Optical power budget engine tests: PASS");
