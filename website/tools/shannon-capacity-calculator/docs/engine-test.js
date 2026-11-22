"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const unit={Hz:1,kHz:1e3,MHz:1e6,GHz:1e9}[input.bandwidth.unit];const B=input.bandwidth.value*unit;const linear=input.snrUnit==="dB"?10**(input.snr/10):input.snr;const C=B*Math.log2(1+linear);return {capacityMbps:C/1e6,capacityBps:C,snrLinear:linear,spectral:Math.log2(1+linear)};}
const normal = {input:{bandwidth:{value:20,unit:"MHz"},snr:20,snrUnit:"dB"},changed:{bandwidth:{value:40,unit:"MHz"},snr:20,snrUnit:"dB"},converted:{bandwidth:{value:20000,unit:"kHz"},snr:100,snrUnit:"linear"},boundary:{bandwidth:{value:1e-9,unit:"Hz"},snr:-40,snrUnit:"dB"},invalid:[{bandwidth:{value:0,unit:"MHz"},snr:20,snrUnit:"dB"},{bandwidth:{value:-1,unit:"MHz"},snr:20,snrUnit:"dB"},{bandwidth:{value:20,unit:"MHz"},snr:-41,snrUnit:"dB"},{bandwidth:{value:"",unit:"MHz"},snr:20,snrUnit:"dB"},{bandwidth:{value:20,unit:"MHz"},snr:-1,snrUnit:"linear"}],primary:"capacityMbps",result:engine.calculate({bandwidth:{value:20,unit:"MHz"},snr:20,snrUnit:"dB"})};
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
console.log("shannon-capacity-calculator" + " engine tests PASS");
