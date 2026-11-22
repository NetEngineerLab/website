"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const f=input.anchor.value*(input.anchor.unit==="GHz"?1e-3:1)+input.channel*(input.spacing.value*(input.spacing.unit==="THz"?1000:input.spacing.unit==="MHz"?1e-3:1))/1000;return {frequencyTHz:f,wavelengthNm:299792.458/f,frequencyGHz:f*1000};}
const normal = {input:{anchor:{value:193.1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0},changed:{anchor:{value:193.1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:1},converted:{anchor:{value:193100,unit:"GHz"},spacing:{value:0.1,unit:"THz"},channel:0},boundary:{anchor:{value:400,unit:"THz"},spacing:{value:0.001,unit:"GHz"},channel:-100000},invalid:[{anchor:{value:"",unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0},{anchor:{value:-1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0},{anchor:{value:193.1,unit:"THz"},spacing:{value:0,unit:"GHz"},channel:0},{anchor:{value:193.1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:1.5},{anchor:{value:"1e999",unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0}],primary:"frequencyTHz",result:engine.calculate({anchor:{value:193.1,unit:"THz"},spacing:{value:100,unit:"GHz"},channel:0})};
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
console.log("itu-dwdm-grid-calculator" + " engine tests PASS");
