"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const D=input.conduit.value*(input.conduit.unit==="inch"?25.4:1);let sum=0;for(const group of input.groups){const d=group.diameter.value*(group.diameter.unit==="inch"?25.4:1);sum+=group.count*d*d;}return {fillPercent:sum/(D*D)*100,cableAreaFactor:sum,conduitDiameterMm:D};}
const normal = {input:{conduit:{value:100,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}],limitPercent:""},changed:{conduit:{value:50,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}],limitPercent:""},converted:{conduit:{value:100/25.4,unit:"inch"},groups:[{diameter:{value:20/25.4,unit:"inch"},count:3}],limitPercent:""},boundary:{conduit:{value:0.001,unit:"mm"},groups:[{diameter:{value:0.001,unit:"mm"},count:1}],limitPercent:"100"},invalid:[{conduit:{value:0,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}]},{conduit:{value:100,unit:"mm"},groups:[{diameter:{value:-1,unit:"mm"},count:3}]},{conduit:{value:100,unit:"mm"},groups:[]},{conduit:{value:"",unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}]},{conduit:{value:100,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:0}]}],primary:"fillPercent",result:engine.calculate({conduit:{value:100,unit:"mm"},groups:[{diameter:{value:20,unit:"mm"},count:3}],limitPercent:""})};
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
console.log("pathway-fill-calculator" + " engine tests PASS");
