"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const L=input.length.value*(input.length.unit==="ft"?0.3048:1);const A=input.area.value*(input.area.unit==="cm2"?100:1);const R=input.rho20*(1+input.alpha*(input.temperature-20))*input.conductors*L/A;const drop=input.current*R;return {resistanceOhm:R,dropV:drop,dropPercent:drop/input.voltage*100,endVoltage:input.voltage-drop};}
const normal = {input:{voltage:48,current:100,length:{value:50,unit:"m"},area:{value:95,unit:"mm2"},temperature:20,alpha:0.00393,conductors:2,rho20:1/58},changed:{voltage:48,current:200,length:{value:50,unit:"m"},area:{value:95,unit:"mm2"},temperature:20,alpha:0,conductors:2,rho20:1/58},converted:{voltage:48,current:100,length:{value:50/0.3048,unit:"ft"},area:{value:0.95,unit:"cm2"},temperature:20,alpha:0.00393,conductors:2,rho20:1/58},boundary:{voltage:0.001,current:0,length:{value:0.001,unit:"m"},area:{value:0.001,unit:"mm2"},temperature:-50,alpha:0,conductors:1,rho20:0.000001},invalid:[{voltage:0,current:1,length:{value:1,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:1,rho20:1/58},{voltage:48,current:-1,length:{value:1,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:1,rho20:1/58},{voltage:48,current:1,length:{value:0,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:1,rho20:1/58},{voltage:"",current:1,length:{value:1,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:1,rho20:1/58},{voltage:48,current:1,length:{value:1,unit:"m"},area:{value:1,unit:"mm2"},temperature:20,alpha:0,conductors:3,rho20:1/58}],primary:"dropV",result:engine.calculate({voltage:48,current:100,length:{value:50,unit:"m"},area:{value:95,unit:"mm2"},temperature:20,alpha:0.00393,conductors:2,rho20:1/58})};
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
console.log("dc-feeder-voltage-drop-calculator" + " engine tests PASS");
