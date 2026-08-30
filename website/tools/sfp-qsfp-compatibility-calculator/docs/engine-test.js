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
    txMaxDbm: 0.5,
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
    txMaxDbm: 0.5,
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
assert.equal(pass.budget.directions.aToB.designMarginDb.toFixed(2), "0.40");

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

const minimumRate = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, formFactor: "SFP", aggregateRateGbps: 0.1 },
  moduleB: { ...base.moduleB, formFactor: "SFP", aggregateRateGbps: 0.1 }
});
assert.equal(minimumRate.status, "PASS");

for (const aggregateRateGbps of [0.099999999, "1e-300"]) {
  const belowMinimumRate = engine.calculate({
    ...base,
    moduleA: { ...base.moduleA, formFactor: "SFP", aggregateRateGbps },
    moduleB: { ...base.moduleB, formFactor: "SFP", aggregateRateGbps }
  });
  assert.equal(belowMinimumRate.status, "FAIL");
  assert(belowMinimumRate.errors.includes("moduleA.aggregateRateGbps"));
  assert.equal(belowMinimumRate.checks.find(check => check.id === "input").pass, false);
}

const budgetFail = engine.calculate({
  ...base,
  link: { ...base.link, distanceKm: 20 }
});
assert.equal(budgetFail.status, "FAIL");

const overloadFail = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, txMaxDbm: 2 },
  link: { ...base.link, distanceKm: 0, connectorCount: 0, spliceCount: 0 }
});
assert.equal(overloadFail.status, "FAIL");
assert.equal(overloadFail.budget.directions.aToB.overloadHeadroomDb, -1.5);

const missingMaximum = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, txMaxDbm: undefined }
});
assert.equal(missingMaximum.status, "FAIL");

for (const invalid of ["", null, NaN]) {
  const invalidMinimum = engine.calculate({ ...base, moduleA: { ...base.moduleA, txMinDbm: invalid } });
  assert.equal(invalidMinimum.status, "FAIL");
}

const invalidLanes = engine.calculate({ ...base, moduleA: { ...base.moduleA, lanes: NaN } });
assert.equal(invalidLanes.status, "FAIL");

const missingMedia = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, media: undefined },
  moduleB: { ...base.moduleB, media: undefined }
});
assert.equal(missingMedia.status, "FAIL");

const invalidDistance = engine.calculate({ ...base, link: { ...base.link, distanceKm: NaN } });
assert.equal(invalidDistance.status, "FAIL");

for (const [field, invalid] of [["lanes", true], ["txMinDbm", false]]) {
  const invalidType = engine.calculate({ ...base, moduleA: { ...base.moduleA, [field]: invalid } });
  assert.equal(invalidType.status, "FAIL");
}

const arrayDistance = engine.calculate({ ...base, link: { ...base.link, distanceKm: [10] } });
assert.equal(arrayDistance.status, "FAIL");

for (const [path, invalid] of [
  ["formFactor", ["SFP+"]],
  ["media", ["SMF"]],
  ["connector", ["LC"]]
]) {
  const invalidEnum = engine.calculate({
    ...base,
    moduleA: { ...base.moduleA, [path]: invalid },
    moduleB: { ...base.moduleB, [path]: invalid }
  });
  assert.equal(invalidEnum.status, "FAIL");
}

const arrayFiber = engine.calculate({
  ...base,
  link: { ...base.link, fiberType: ["SMF"] }
});
assert.equal(arrayFiber.status, "FAIL");

let enumToStringCalled = false;
const hostileEnum = {
  toString() {
    enumToStringCalled = true;
    return "SFP+";
  }
};
const objectEnum = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, formFactor: hostileEnum },
  moduleB: { ...base.moduleB, formFactor: hostileEnum }
});
assert.equal(objectEnum.status, "FAIL");
assert.equal(enumToStringCalled, false);

const unknownConnector = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, connector: "BANANA" },
  moduleB: { ...base.moduleB, connector: "BANANA" },
  link: { ...base.link, connector: "BANANA" }
});
assert.equal(unknownConnector.status, "FAIL");

const adjacentCwdm = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, wavelengthNm: 1270 },
  moduleB: { ...base.moduleB, wavelengthNm: 1290 }
});
assert.equal(adjacentCwdm.status, "FAIL");

const opticalRj45 = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, connector: "RJ45" },
  moduleB: { ...base.moduleB, connector: "RJ45" },
  link: { ...base.link, connector: "RJ45" }
});
assert.equal(opticalRj45.status, "FAIL");

const connectorMismatch = engine.calculate({
  ...base,
  moduleB: { ...base.moduleB, connector: "MPO" }
});
assert.equal(connectorMismatch.status, "FAIL");
assert.equal(connectorMismatch.checks.find(check => check.id === "connector").pass, false);

const unsafeConnectorCount = engine.calculate({
  ...base,
  link: { ...base.link, connectorCount: "9007199254740993" }
});
assert.equal(unsafeConnectorCount.status, "FAIL");

const sfpWrongLanes = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, lanes: 4 },
  moduleB: { ...base.moduleB, lanes: 4 }
});
assert.equal(sfpWrongLanes.status, "FAIL");

const qsfpWrongLanes = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, formFactor: "QSFP+", lanes: 1 },
  moduleB: { ...base.moduleB, formFactor: "QSFP+", lanes: 1 }
});
assert.equal(qsfpWrongLanes.status, "FAIL");

for (const wavelengthNm of [1, 1e300]) {
  const invalidWavelength = engine.calculate({
    ...base,
    moduleA: { ...base.moduleA, wavelengthNm },
    moduleB: { ...base.moduleB, wavelengthNm }
  });
  assert.equal(invalidWavelength.status, "FAIL");
  assert.equal(invalidWavelength.checks.find(check => check.id === "input").pass, false);
}

const derivedOverflow = engine.calculate({
  ...base,
  link: { ...base.link, distanceKm: 1e308, attenuationDbPerKm: 1e308 }
});
assert.equal(derivedOverflow.status, "FAIL");
assert(derivedOverflow.errors.includes("link.physicalLossDb"));
assert.equal(derivedOverflow.checks.find(check => check.id === "input").pass, false);

const nonOpticalMissingMedia = engine.calculate({
  ...base,
  moduleA: { ...base.moduleA, media: undefined },
  moduleB: { ...base.moduleB, media: undefined }
});
assert.equal(nonOpticalMissingMedia.checks.find(check => check.id === "input").pass, false);

const asymmetricSensitivity = engine.calculate({
  ...base,
  moduleB: { ...base.moduleB, rxSensitivityDbm: -10 }
});
assert.equal(asymmetricSensitivity.status, "FAIL");
assert(asymmetricSensitivity.budget.directions.aToB.designMarginDb < 0);

const exactZeroMargins = engine.calculate({
  moduleA: {
    ...base.moduleA,
    txMinDbm: -0.1,
    txMaxDbm: 0.5,
    rxSensitivityDbm: -0.7,
    rxOverloadDbm: 0.2
  },
  moduleB: {
    ...base.moduleB,
    txMinDbm: -0.1,
    txMaxDbm: 0.5,
    rxSensitivityDbm: -0.7,
    rxOverloadDbm: 0.2
  },
  link: {
    ...base.link,
    distanceKm: 1,
    attenuationDbPerKm: 0.1,
    connectorCount: 1,
    connectorLossDb: 0.2,
    spliceCount: 0,
    spliceLossDb: 0.1,
    engineeringMarginDb: 0.3
  }
});
assert.equal(exactZeroMargins.status, "PASS");
assert.equal(exactZeroMargins.budget.designMarginDb, 0);
assert.equal(exactZeroMargins.budget.overloadHeadroomDb, 0);
assert.equal(exactZeroMargins.checks.find(check => check.id === "sensitivity").pass, true);
assert.equal(exactZeroMargins.checks.find(check => check.id === "overload").pass, true);

console.log("PASS: SFP/QSFP compatibility and optical-budget engine tests.");
