#!/usr/bin/env node
"use strict";
/**
 * Guards the Fieldbook preview rule: count fields must reach the engine
 * WITHOUT Math.trunc, so decimals like 1.5 fail Number.isSafeInteger.
 */
const assert = require("assert");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const uiSrc = fs.readFileSync(path.join(root, "fb-v3-opb.js"), "utf8");
assert.equal(
  /Math\.trunc\s*\(/.test(uiSrc),
  false,
  "fb-v3-opb.js must not call Math.trunc on count inputs before validation"
);
assert.match(uiSrc, /function count\(/);
assert.match(uiSrc, /setExportEnabled/);
assert.match(uiSrc, /Invalid input/);

const eng = require(path.join(root, "opb-engine-copy.js"));
assert.ok(eng && typeof eng.calculate === "function");

const base = {
  tx: 3, txMax: 7, sens: -30, over: -8, penalty: 1,
  d: 10, a: 0.3, sc: 6, sl: 0.1, cc: 4, cl: 0.3,
  s1: 10.5, s2: 10.5, s3: 0, other: 0, margin: 3
};

assert.equal(eng.calculate(base).ok, true);
assert.equal(eng.calculate({ ...base, sc: 1.5 }).ok, false, "decimal spliceCount must be invalid");
assert.equal(eng.calculate({ ...base, cc: 1.5 }).ok, false, "decimal connectorCount must be invalid");
assert.equal(eng.calculate({ ...base, sc: -1 }).ok, false);
assert.equal(eng.calculate({ ...base, cc: -1 }).ok, false);
assert.equal(eng.calculate({ ...base, sc: Number.NaN }).ok, false);
assert.equal(eng.calculate({ ...base, sc: 6 }).ok, true);
assert.equal(eng.calculate({ ...base, cc: 4 }).ok, true);

// Sanity: the OLD bug path — trunc before validate would wrongly accept 1.5
assert.equal(eng.calculate({ ...base, sc: Math.trunc(1.5) }).ok, true);

// Default GPON C+ reference case
const r = eng.calculate(base);
assert.ok(Math.abs(r.physical - 25.8) < 1e-9);
assert.ok(Math.abs(r.design - 28.8) < 1e-9);
assert.ok(Math.abs(r.remain - 3.2) < 1e-9);
assert.ok(Math.abs(r.rx - -22.8) < 1e-9);
assert.ok(Math.abs(r.sensM - 7.2) < 1e-9);
assert.ok(Math.abs(r.overM - 10.8) < 1e-9);

console.log("count-input-guard-test: PASS");
