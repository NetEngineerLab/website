"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const rtt=input.rtt.value*(input.rtt.unit==="us"?1e-6:input.rtt.unit==="s"?1:0.001);const p=input.loss.value*(input.loss.unit==="probability"?1:0.01);const bps=(input.mss*8)/(rtt*Math.sqrt(p));return {throughputMbps:bps/1e6,throughputBps:bps};}
const normal = {input:{mss:1460,rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"},link:{value:"",unit:"Mbps"}},changed:{mss:1460,rtt:{value:80,unit:"ms"},loss:{value:0.01,unit:"percent"},link:{value:"",unit:"Mbps"}},converted:{mss:1460,rtt:{value:40000,unit:"us"},loss:{value:0.0001,unit:"probability"},link:{value:"",unit:"Mbps"}},boundary:{mss:1,rtt:{value:100,unit:"s"},loss:{value:0.999999,unit:"probability"},link:{value:"",unit:"Mbps"}},invalid:[{mss:0,rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"}},{mss:1460,rtt:{value:0,unit:"ms"},loss:{value:0.01,unit:"percent"}},{mss:1460,rtt:{value:40,unit:"ms"},loss:{value:0,unit:"percent"}},{mss:1460.5,rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"}},{mss:"",rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"}}],primary:"throughputMbps",result:engine.calculate({mss:1460,rtt:{value:40,unit:"ms"},loss:{value:0.01,unit:"percent"},link:{value:"",unit:"Mbps"}})};
const expected = reference(normal.input);
assert.equal(normal.result.ok, true);
for (const [key, value] of Object.entries(expected)) close(normal.result.values[key], value, key);
const changed = engine.calculate(normal.changed);
assert.equal(changed.ok, true);
assert.notStrictEqual(changed.values[normal.primary], normal.result.values[normal.primary]);
for (const bad of normal.invalid) assert.equal(engine.calculate(bad).ok, false, JSON.stringify(bad));
const converted = engine.calculate(normal.converted);
assert.equal(converted.ok, true);
close(converted.values[normal.primary], reference(normal.converted)[normal.primary], "unit");
const boundary = engine.calculate(normal.boundary);
assert.equal(boundary.ok, true);
assert.ok(Object.values(boundary.values).every((value) => value == null || Number.isFinite(value)));
console.log("tcp-mathis-throughput-estimator" + " engine tests PASS");
