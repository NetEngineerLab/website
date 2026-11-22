"use strict";
const assert = require("assert");
const engine = require("../js/engine.js");
function close(actual, expected, label) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= scale * 1e-9, label + " " + actual + " != " + expected);
}
function reference(input){const H=6.62607015e-34;const f=input.frequency.value*(input.frequency.unit==="GHz"?1e9:1e12);const B=input.bandwidth.value*(input.bandwidth.unit==="MHz"?1e6:input.bandwidth.unit==="Hz"?1:1e9);const G=10**(input.gainDb/10);const F=10**(input.noiseFigureDb/10);const signal=10**((input.powerDbm-30)/10);const ase=input.spans*F*H*f*(G-1)*B;return {osnrDb:10*Math.log10(signal/ase),aseDbm:10*Math.log10(ase)+30,signalMw:signal*1000,aseMw:ase*1000};}
const normal = {input:{powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1},changed:{powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:2},converted:{powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193100,unit:"GHz"},bandwidth:{value:12500,unit:"MHz"},spans:1},boundary:{powerDbm:-80,gainDb:0.001,noiseFigureDb:0,frequency:{value:100,unit:"THz"},bandwidth:{value:0.001,unit:"GHz"},spans:1},invalid:[{powerDbm:"",gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1},{powerDbm:0,gainDb:0,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1},{powerDbm:0,gainDb:20,noiseFigureDb:-1,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1},{powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:0},{powerDbm:"Infinity",gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1}],primary:"osnrDb",result:engine.calculate({powerDbm:0,gainDb:20,noiseFigureDb:5,frequency:{value:193.1,unit:"THz"},bandwidth:{value:12.5,unit:"GHz"},spans:1})};
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
console.log("edfa-ase-osnr-estimator" + " engine tests PASS");
