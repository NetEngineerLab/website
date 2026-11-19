"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const ratios={"8b10b":[10,8],"64b66b":[66,64],"64b66b-rs528":[66*528,64*514],"64b66b-rs544":[66*544,64*514]};const factor=input.payload.unit==="Mbps"?1e-3:input.payload.unit==="Tbps"?1000:1;const ratio=ratios[input.code][0]/ratios[input.code][1];const line=input.payload.value*factor*ratio;return {lineGbps:line,overheadPercent:(ratio-1)*100,efficiencyPercent:100/ratio,expansion:ratio};}
const normal = {input:{payload:{value:10,unit:"Gbps"},code:"64b66b"},changed:{payload:{value:40,unit:"Gbps"},code:"64b66b"},converted:{payload:{value:10000,unit:"Mbps"},code:"64b66b"},boundary:{payload:{value:100000,unit:"Gbps"},code:"8b10b"},invalid:[{payload:{value:0,unit:"Gbps"},code:"64b66b"},{payload:{value:-1,unit:"Gbps"},code:"64b66b"},{payload:{value:"",unit:"Gbps"},code:"64b66b"},{payload:{value:10,unit:"Gbps"},code:"nope"},{payload:{value:"1e999",unit:"Gbps"},code:"64b66b"}],primary:"lineGbps",result:engine.calculate({payload:{value:10,unit:"Gbps"},code:"64b66b"})};
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
console.log("ethernet-line-coding-calculator" + " engine tests PASS");
