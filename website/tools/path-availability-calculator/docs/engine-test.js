"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){if(input.kind==="mtbf"){const a=input.mtbfHours/(input.mtbfHours+input.mttrHours);return {availability:a,unavailability:1-a,downMinutesPerYear:(1-a)*525600};}const values=input.blocks.map(Number);let a=1;if(input.mode==="series"){for(const v of values)a*=v;}else{let miss=1;for(const v of values)miss*=1-v;a=1-miss;}return {availability:a,unavailability:1-a,downMinutesPerYear:(1-a)*525600};}
const normal = {input:{kind:"blocks",mode:"parallel",blocks:["0.999","0.999"]},changed:{kind:"blocks",mode:"series",blocks:["0.999","0.999"]},converted:{kind:"mtbf",mtbfHours:8760,mttrHours:4},boundary:{kind:"blocks",mode:"series",blocks:["1"]},invalid:[{kind:"blocks",mode:"parallel",blocks:[]},{kind:"blocks",mode:"parallel",blocks:["0"]},{kind:"blocks",mode:"parallel",blocks:["-1"]},{kind:"mtbf",mtbfHours:0,mttrHours:4},{kind:"mtbf",mtbfHours:"",mttrHours:4}],primary:"availability",result:engine.calculate({kind:"blocks",mode:"parallel",blocks:["0.999","0.999"]})};
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
console.log("path-availability-calculator" + " engine tests PASS");
