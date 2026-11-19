"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const l=input.arrival.value*(input.arrival.unit==="per_min"?1/60:1);const m=input.service.value*(input.service.unit==="per_min"?1/60:1);const rho=l/m;return {utilization:rho,sojournMs:1000/(m-l),waitMs:1000*rho/(m*(1-rho)),systemCount:rho/(1-rho),queueCount:rho*rho/(1-rho)};}
const normal = {input:{arrival:{value:800,unit:"per_s"},service:{value:1000,unit:"per_s"}},changed:{arrival:{value:500,unit:"per_s"},service:{value:1000,unit:"per_s"}},converted:{arrival:{value:48000,unit:"per_min"},service:{value:60000,unit:"per_min"}},boundary:{arrival:{value:1,unit:"per_s"},service:{value:1.000001,unit:"per_s"}},invalid:[{arrival:{value:0,unit:"per_s"},service:{value:1000,unit:"per_s"}},{arrival:{value:1000,unit:"per_s"},service:{value:1000,unit:"per_s"}},{arrival:{value:-1,unit:"per_s"},service:{value:1000,unit:"per_s"}},{arrival:{value:"",unit:"per_s"},service:{value:1000,unit:"per_s"}},{arrival:{value:"bad",unit:"per_s"},service:{value:1000,unit:"per_s"}}],primary:"sojournMs",result:engine.calculate({arrival:{value:800,unit:"per_s"},service:{value:1000,unit:"per_s"}})};
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
console.log("mm1-queue-delay-calculator" + " engine tests PASS");
