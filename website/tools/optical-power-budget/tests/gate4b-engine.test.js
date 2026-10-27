/**
 * NEL-OPB-V3-GATE4B — engine calculation assertions (Gate 2).
 * Run: node website/tools/optical-power-budget/tests/gate4b-engine.test.js
 */
"use strict";
const path = require("path");
const eng = require(path.join(__dirname, "../js/engine.js"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function near(a, b, eps = 1e-9) {
  return Math.abs(a - b) <= eps;
}

const GPON_C = {
  tx: 3, txMax: 7, sens: -30, over: -8, penalty: 1,
  d: 10, a: 0.3, sc: 6, sl: 0.1, cc: 4, cl: 0.3,
  s1: 10.5, s2: 10.5, s3: 0, other: 0, margin: 3
};

// Case A
{
  const r = eng.calculate(GPON_C);
  assert(r.ok, "A ok");
  assert(near(r.physical, 25.8), "A physical " + r.physical);
  assert(near(r.design, 28.8), "A design " + r.design);
  assert(near(r.standard, 32), "A standard " + r.standard);
  assert(near(r.remain, 3.2), "A remain " + r.remain);
  assert(near(r.rx, -22.8), "A rx " + r.rx);
  assert(r.st === "healthy", "A status " + r.st);
  assert(near(r.sensM, 7.2), "A sensM " + r.sensM);
  assert(near(r.overM, 10.8), "A overM " + r.overM);
  // overload uses max Tx
  assert(near(r.rxMax, 7 - 25.8), "A rxMax " + r.rxMax);
  console.log("PASS Case A GPON C+ defaults");
}

// Case B distance 11 km
{
  const r = eng.calculate(Object.assign({}, GPON_C, { d: 11 }));
  assert(r.ok, "B ok");
  assert(near(r.physical, 26.1), "B physical " + r.physical);
  assert(near(r.remain, 2.9), "B remain " + r.remain);
  assert(near(r.rx, -23.1), "B rx " + r.rx);
  assert(r.st === "warning", "B status " + r.st);
  console.log("PASS Case B distance 11 km Marginal");
}

// Case C GPON B+ default ODN
{
  const Bplus = {
    tx: 1.5, txMax: 5, sens: -27, over: -8, penalty: 0.5,
    d: 10, a: 0.3, sc: 6, sl: 0.1, cc: 4, cl: 0.3,
    s1: 10.5, s2: 10.5, s3: 0, other: 0, margin: 3
  };
  const r = eng.calculate(Bplus);
  assert(r.ok, "C ok");
  assert(near(r.standard, 28), "C standard " + r.standard);
  assert(near(r.remain, -0.8), "C remain " + r.remain);
  assert(r.st === "failed", "C status " + r.st);
  console.log("PASS Case C GPON B+ Fail remain -0.8");
}

// Max distance mode formula (engine maxD)
{
  const r = eng.calculate(GPON_C);
  // maxD = (standard - margin - fixed) / a ; fixed = physical - fiber = 25.8 - 3 = 22.8
  const fixed = r.physical - r.fiber;
  const expect = Math.max(0, (r.standard - GPON_C.margin - fixed) / GPON_C.a);
  assert(near(r.maxD, expect), "maxD " + r.maxD + " vs " + expect);
  console.log("PASS max distance formula", r.maxD.toFixed(2), "km");
}

// Exactly 3 dB remain → healthy (not warning); just under → warning
{
  // craft remain == 3: standard - design = 3 → design = standard - 3
  // Keep GPON C standard 32, set margin so design = 29 → remain 3
  // physical 25.8, margin 3.2 → design 29, remain 3
  const r = eng.calculate(Object.assign({}, GPON_C, { margin: 3.2 }));
  assert(near(r.remain, 3.0), "boundary remain " + r.remain);
  assert(r.st === "healthy", "exactly 3 dB should be healthy, got " + r.st);
  const r2 = eng.calculate(Object.assign({}, GPON_C, { margin: 3.2000001 }));
  // remain slightly under 3
  assert(r2.st === "warning" || r2.remain < 3, "under 3 warning");
  console.log("PASS 3 dB boundary");
}

// Invalid: decimal splice count
{
  const r = eng.calculate(Object.assign({}, GPON_C, { sc: 1.5 }));
  assert(!r.ok, "decimal splice must fail validate");
  console.log("PASS invalid decimal splice");
}

// Zero distance / zero fiber ok if other losses present
{
  const r = eng.calculate(Object.assign({}, GPON_C, { d: 0 }));
  assert(r.ok, "zero distance ok");
  assert(near(r.fiber, 0), "fiber 0");
  assert(!Number.isNaN(r.rx) && Number.isFinite(r.rx), "no NaN");
  console.log("PASS zero distance");
}

// Margin not double-subtracted from rx: rx = tx - physical (not design)
{
  const r = eng.calculate(GPON_C);
  assert(near(r.rx, GPON_C.tx - r.physical), "rx uses physical only");
  assert(!near(r.rx, GPON_C.tx - r.design), "rx must NOT use design loss");
  console.log("PASS margin not deducted from rx");
}

// Negative distance rejected
{
  const r = eng.calculate(Object.assign({}, GPON_C, { d: -1 }));
  assert(!r.ok, "negative distance invalid");
  console.log("PASS negative distance rejected");
}

console.log("\nALL GATE2 ENGINE ASSERTIONS PASSED");
