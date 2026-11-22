"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const L=input.length.value*(input.length.unit==="ft"?0.3048:1);const v=input.velocityFactor*299792458;const delay=L/v;return {delayNs:delay*1e9,delayUs:delay*1e6,nsPerMeter:1e9/v,velocityMps:v};}
const normal = {input:{length:{value:100,unit:"m"},velocityFactor:0.65},changed:{length:{value:250,unit:"m"},velocityFactor:0.65},converted:{length:{value:100/0.3048,unit:"ft"},velocityFactor:0.65},boundary:{length:{value:1e9,unit:"m"},velocityFactor:1},invalid:[{length:{value:0,unit:"m"},velocityFactor:0.65},{length:{value:-1,unit:"m"},velocityFactor:0.65},{length:{value:100,unit:"m"},velocityFactor:0},{length:{value:100,unit:"m"},velocityFactor:1.1},{length:{value:"",unit:"m"},velocityFactor:0.65}],primary:"delayNs",result:engine.calculate({length:{value:100,unit:"m"},velocityFactor:0.65})};
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
console.log("copper-propagation-delay-calculator" + " engine tests PASS");
