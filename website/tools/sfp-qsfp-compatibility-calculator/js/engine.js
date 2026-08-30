(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NELSfpQsfpEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const FORM_FACTORS = {
    SFP: { lanes: 1, maxLaneGbps: 1.25 },
    "SFP+": { lanes: 1, maxLaneGbps: 10.3125 },
    SFP28: { lanes: 1, maxLaneGbps: 25.78125 },
    "QSFP+": { lanes: 4, maxLaneGbps: 10.3125 },
    QSFP28: { lanes: 4, maxLaneGbps: 25.78125 },
    "QSFP-DD": { lanes: 8, maxLaneGbps: 53.125 }
  };
  const DB_EPSILON = 1e-9;
  const MIN_AGGREGATE_RATE_GBPS = 0.1;

  function normalizeNearZeroDb(value) {
    return Math.abs(value) <= DB_EPSILON ? 0 : value;
  }

  function number(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    if (typeof value !== "string") return NaN;
    const source = value.trim();
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(source)) return NaN;
    const parsed = Number(source);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function optionalNumber(value, fallback) {
    return value === undefined ? fallback : number(value);
  }

  function normalized(value) {
    return typeof value === "string" ? value.trim().toUpperCase() : "";
  }

  function sameConnector(a, b) {
    const left = normalized(a);
    const right = normalized(b);
    if (!left || !right) return true;
    if (left === right) return true;
    return (left === "LC" && right === "LC-DUPLEX") ||
      (right === "LC" && left === "LC-DUPLEX");
  }

  function calculate(input) {
    const a = input && input.moduleA ? input.moduleA : {};
    const b = input && input.moduleB ? input.moduleB : {};
    const link = input && input.link ? input.link : {};
    const errors = [];
    const warnings = [];
    const checks = [];

    const factorA = FORM_FACTORS[normalized(a.formFactor)];
    const factorB = FORM_FACTORS[normalized(b.formFactor)];
    if (!factorA) errors.push("moduleA.formFactor");
    if (!factorB) errors.push("moduleB.formFactor");

    const rateA = number(a.aggregateRateGbps);
    const rateB = number(b.aggregateRateGbps);
    const lanesA = number(a.lanes);
    const lanesB = number(b.lanes);
    const mediaA = normalized(a.media);
    const mediaB = normalized(b.media);
    const fiber = normalized(link.fiberType);
    const wavelengthA = number(a.wavelengthNm);
    const wavelengthB = number(b.wavelengthNm);
    const allowedMedia = new Set(["SMF", "MMF", "DAC", "AOC"]);
    const allowedConnectors = new Set(["LC", "LC-DUPLEX", "MPO", "RJ45"]);
    const opticalConnectors = new Set(["LC", "LC-DUPLEX", "MPO"]);
    if (!Number.isFinite(rateA) || rateA < MIN_AGGREGATE_RATE_GBPS) errors.push("moduleA.aggregateRateGbps");
    if (!Number.isFinite(rateB) || rateB < MIN_AGGREGATE_RATE_GBPS) errors.push("moduleB.aggregateRateGbps");
    if (!Number.isInteger(lanesA) || lanesA < 1 || lanesA > 8) errors.push("moduleA.lanes");
    if (!Number.isInteger(lanesB) || lanesB < 1 || lanesB > 8) errors.push("moduleB.lanes");
    if (factorA && lanesA !== factorA.lanes) errors.push("moduleA.formFactorLanes");
    if (factorB && lanesB !== factorB.lanes) errors.push("moduleB.formFactorLanes");
    if (!allowedMedia.has(mediaA)) errors.push("moduleA.media");
    if (!allowedMedia.has(mediaB)) errors.push("moduleB.media");
    if (!allowedConnectors.has(normalized(a.connector))) errors.push("moduleA.connector");
    if (!allowedConnectors.has(normalized(b.connector))) errors.push("moduleB.connector");
    if (!allowedConnectors.has(normalized(link.connector))) errors.push("link.connector");
    if (factorA && Number.isFinite(rateA) && Number.isFinite(lanesA) && rateA / lanesA > factorA.maxLaneGbps + 0.01) errors.push("moduleA.rate");
    if (factorB && Number.isFinite(rateB) && Number.isFinite(lanesB) && rateB / lanesB > factorB.maxLaneGbps + 0.01) errors.push("moduleB.rate");

    checks.push({
      id: "rate",
      pass: rateA >= MIN_AGGREGATE_RATE_GBPS && rateB >= MIN_AGGREGATE_RATE_GBPS && Math.abs(rateA - rateB) < 0.01,
      detail: `${rateA} Gbps ↔ ${rateB} Gbps`
    });
    checks.push({
      id: "lanes",
      pass: lanesA === lanesB,
      detail: `${lanesA} lane(s) ↔ ${lanesB} lane(s)`
    });
    checks.push({
      id: "media",
      pass: mediaA === mediaB,
      detail: `${mediaA || "unknown"} ↔ ${mediaB || "unknown"}`
    });

    const optical = [mediaA, mediaB].some(media => media === "SMF" || media === "MMF");
    if (optical) {
      if (!Number.isFinite(wavelengthA) || wavelengthA < 800 || wavelengthA > 2000) errors.push("moduleA.wavelengthNm");
      if (!Number.isFinite(wavelengthB) || wavelengthB < 800 || wavelengthB > 2000) errors.push("moduleB.wavelengthNm");
      if (fiber !== "SMF" && fiber !== "MMF") errors.push("link.fiberType");
      if (!opticalConnectors.has(normalized(a.connector))) errors.push("moduleA.opticalConnector");
      if (!opticalConnectors.has(normalized(b.connector))) errors.push("moduleB.opticalConnector");
      if (!opticalConnectors.has(normalized(link.connector))) errors.push("link.opticalConnector");
      checks.push({
        id: "fiber",
        pass: mediaA === fiber && mediaB === fiber,
        detail: `${mediaA}/${mediaB} modules on ${fiber || "unknown"}`
      });
      checks.push({
        id: "wavelength",
        pass: wavelengthA > 0 && wavelengthB > 0 && wavelengthA === wavelengthB,
        detail: `${wavelengthA} nm ↔ ${wavelengthB} nm`
      });
      checks.push({
        id: "connector",
        pass: sameConnector(a.connector, b.connector) &&
          sameConnector(a.connector, link.connector),
        detail: `${a.connector || "unknown"} ↔ ${b.connector || "unknown"}`
      });
    } else if (mediaA === "DAC" || mediaA === "AOC") {
      warnings.push("Integrated DAC/AOC assemblies require host-side form-factor and vendor-coding verification.");
    }

    const distanceKm = number(link.distanceKm);
    const attenuation = number(link.attenuationDbPerKm);
    const connectorCount = number(link.connectorCount);
    const connectorLossEach = number(link.connectorLossDb);
    const spliceCount = number(link.spliceCount);
    const spliceLossEach = number(link.spliceLossDb);
    const otherLoss = optionalNumber(link.otherLossDb, 0);
    const engineeringMargin = number(link.engineeringMarginDb);
    if (!Number.isFinite(distanceKm) || distanceKm < 0) errors.push("link.distanceKm");
    if (!Number.isFinite(attenuation) || attenuation < 0) errors.push("link.attenuationDbPerKm");
    if (!Number.isSafeInteger(connectorCount) || connectorCount < 0) errors.push("link.connectorCount");
    if (!Number.isFinite(connectorLossEach) || connectorLossEach < 0) errors.push("link.connectorLossDb");
    if (!Number.isSafeInteger(spliceCount) || spliceCount < 0) errors.push("link.spliceCount");
    if (!Number.isFinite(spliceLossEach) || spliceLossEach < 0) errors.push("link.spliceLossDb");
    if (!Number.isFinite(otherLoss) || otherLoss < 0) errors.push("link.otherLossDb");
    if (!Number.isFinite(engineeringMargin) || engineeringMargin < 0) errors.push("link.engineeringMarginDb");
    const connectorLoss = connectorCount * connectorLossEach;
    const spliceLoss = spliceCount * spliceLossEach;
    const physicalLossDb = distanceKm * attenuation + connectorLoss + spliceLoss + otherLoss;
    if (!Number.isFinite(physicalLossDb)) errors.push("link.physicalLossDb");

    const txMinA = number(a.txMinDbm);
    const txMinB = number(b.txMinDbm);
    const txMaxA = number(a.txMaxDbm);
    const txMaxB = number(b.txMaxDbm);
    const rxSensitivityA = number(a.rxSensitivityDbm);
    const rxSensitivityB = number(b.rxSensitivityDbm);
    const rxOverloadA = number(a.rxOverloadDbm);
    const rxOverloadB = number(b.rxOverloadDbm);
    const powerRangesValid = [txMinA, txMinB, txMaxA, txMaxB, rxSensitivityA, rxSensitivityB, rxOverloadA, rxOverloadB]
      .every(value => Number.isFinite(value) && value >= -200 && value <= 200) &&
      txMaxA >= txMinA && txMaxB >= txMinB && rxOverloadA >= rxSensitivityA && rxOverloadB >= rxSensitivityB;
    if (optical && !powerRangesValid) errors.push("opticalPowerRange");
    const direction = (txMin, txMax, rxSensitivity, rxOverload) => {
      const estimatedRxMinDbm = txMin - physicalLossDb;
      const estimatedRxMaxDbm = txMax - physicalLossDb;
      const sensitivityMarginDb = estimatedRxMinDbm - rxSensitivity;
      return {
        estimatedRxMinDbm,
        estimatedRxMaxDbm,
        sensitivityMarginDb,
        designMarginDb: normalizeNearZeroDb(sensitivityMarginDb - engineeringMargin),
        overloadHeadroomDb: normalizeNearZeroDb(rxOverload - estimatedRxMaxDbm)
      };
    };
    const aToB = direction(txMinA, txMaxA, rxSensitivityB, rxOverloadB);
    const bToA = direction(txMinB, txMaxB, rxSensitivityA, rxOverloadA);
    const directionValuesFinite = [aToB, bToA].every(result => Object.values(result).every(Number.isFinite));
    if (optical && !directionValuesFinite) errors.push("opticalBudget.nonFinite");
    const estimatedRxDbm = Math.min(aToB.estimatedRxMinDbm, bToA.estimatedRxMinDbm);
    const sensitivityMarginDb = Math.min(aToB.sensitivityMarginDb, bToA.sensitivityMarginDb);
    const designMarginDb = Math.min(aToB.designMarginDb, bToA.designMarginDb);
    const overloadHeadroomDb = Math.min(aToB.overloadHeadroomDb, bToA.overloadHeadroomDb);

    checks.push({
      id: "input",
      pass: errors.length === 0,
      detail: errors.length ? errors.join(", ") : "Required values are valid"
    });
    if (optical) {
      checks.push({
        id: "powerRange",
        pass: powerRangesValid,
        detail: `A Tx ${txMinA}…${txMaxA} dBm; B Tx ${txMinB}…${txMaxB} dBm`
      });
      checks.push({
        id: "sensitivity",
        pass: powerRangesValid && directionValuesFinite && designMarginDb >= 0,
        detail: `A→B ${aToB.designMarginDb.toFixed(2)} dB; B→A ${bToA.designMarginDb.toFixed(2)} dB`
      });
      checks.push({
        id: "overload",
        pass: powerRangesValid && directionValuesFinite && overloadHeadroomDb >= 0,
        detail: `A→B ${aToB.overloadHeadroomDb.toFixed(2)} dB; B→A ${bToA.overloadHeadroomDb.toFixed(2)} dB`
      });
    }

    const failed = checks.filter((check) => !check.pass);
    if (rateA && rateB && rateA !== rateB) {
      warnings.push("Different aggregate rates need explicit host-side rate adaptation; passive fiber cannot translate Ethernet rates.");
    }
    if (lanesA !== lanesB) {
      warnings.push("Lane counts differ; a supported breakout or gearbox is required.");
    }
    let status = "PASS";
    if (errors.length || failed.some((check) => ["rate", "media", "fiber", "wavelength", "connector", "sensitivity", "overload"].includes(check.id))) {
      status = "FAIL";
    } else if (failed.length || warnings.length) {
      status = "WARNING";
    }

    return {
      status,
      compatible: status === "PASS",
      checks,
      warnings,
      errors,
      budget: {
        physicalLossDb,
        estimatedRxDbm,
        sensitivityMarginDb,
        engineeringMarginDb: engineeringMargin,
        designMarginDb,
        overloadHeadroomDb,
        directions: { aToB, bToA }
      }
    };
  }

  return { FORM_FACTORS, calculate };
});
