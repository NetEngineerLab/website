"use strict";

const assert = require("node:assert/strict");
const engine = require("../js/engine.js");

const base = {
  moduleA: {
    formFactor: "SFP+",
    aggregateRateGbps: 10,
    lanes: 1,
    media: "SMF",
    wavelengthNm: 1310,
    connector: "LC",
    txMinDbm: -8.2,
    rxSensitivityDbm: -14.4,
    rxOverloadDbm: 0.5
  },
  moduleB: {
    formFactor: "SFP+",
    aggregateRateGbps: 10,
    lanes: 1,
    media: "SMF",
    wavelengthNm: 1310,
    connector: "LC",
    txMinDbm: -8.2,
    rxSensitivityDbm: -14.4,
    rxOverloadDbm: 0.5
  },
  link: {
    fiberType: "SMF",
    connector: "LC",
    distanceKm: 10,
    attenuationDbPerKm: 0.35,
    connectorCount: 2,
    connectorLossDb: 0.3,
    spliceCount: 2,
    spliceLossDb: 0.1,
    engineeringMarginDb: 1.5
  }
};

const pass = engine.calculate(base);
assert.equal(pass.status, "PASS");
assert.equal(pass.compatible, true);
assert.equal(pass.budget.physicalLossDb.toFixed(2), "4.30");
assert.equal(pass.budget.designMarginDb.toFixed(2), "0.40");

const wavelengthFail = engine.calculate({
  ...base,
  moduleB: { ...base.moduleB, wavelengthNm: 1550 }
});
assert.equal(wavelengthFail.status, "FAIL");
assert.equal(wavelengthFail.compatible, false);

const fiberFail = engine.calculate({
  ...base,
  link: { ...base.link, fiberType: "MMF" }
});
assert.equal(fiberFail.status, "FAIL");

const rateFail = engine.calculate({
  ...base,
  moduleB: { ...base.moduleB, formFactor: "SFP28", aggregateRateGbps: 25 }
});
assert.equal(rateFail.status, "FAIL");

const budgetFail = engine.calculate({
  ...base,
  link: { ...base.link, distanceKm: 20 }
});
assert.equal(budgetFail.status, "FAIL");

console.log("PASS: SFP/QSFP compatibility and optical-budget engine tests.");
