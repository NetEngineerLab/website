#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

const base={
  mode:"model",
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
assert.equal(engine.calculate({...base,attenuation:0}).ok,false);
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

for(const invalid of [undefined,null,[],"",{...base,distance:"10"},{...base,measured:undefined}]){
  assert.equal(engine.calculate(invalid).ok,false);
}
for(const [key,value] of [["spliceCount",1.5],["connectorCount",Number.MAX_SAFE_INTEGER+1]]){
  assert.equal(engine.calculate({...base,[key]:value}).ok,false);
}
for(const [key,value] of [["s1",10.4],["s2",1]]){
  assert.equal(engine.calculate({...base,[key]:value}).ok,false);
}
assert.equal(engine.calculate({...base,noSignal:-27,sens:-27}).ok,false);
assert.equal(engine.calculate({...base,sens:-8,over:-8}).ok,false);
assert.equal(engine.calculate({...base,distance:1e308,attenuation:1e308}).ok,false);
assert.equal(engine.calculate({...base,measured:-24-5e-10}).status,"healthy");
assert.equal(engine.calculate({...base,measured:-24-2e-9}).status,"warning");
const measuredOnly=engine.calculate({mode:"measured",measured:-24,sens:-27,over:-8,noSignal:-40,warning:3,distance:"invalid",spliceCount:1.5});
assert.equal(measuredOnly.ok,true);
assert.equal(measuredOnly.status,"healthy");
assert.equal(Object.hasOwn(measuredOnly,"expectedRx"),false);
assert.equal(engine.calculate({...base,mode:"invalid"}).ok,false);
assert.equal(engine.calculate({mode:"measured",measured:1e308,sens:-1e308,over:1e308,noSignal:-1.7e308,warning:3}).ok,false);
assert.equal(engine.calculate({mode:"measured",measured:0,sens:-1e308,over:1e308,noSignal:-1.7e308,warning:3}).ok,false);

console.log("ONU RX power engine tests: PASS");
