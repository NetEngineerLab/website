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

  function number(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalized(value) {
    return String(value == null ? "" : value).trim().toUpperCase();
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

    const rateA = number(a.aggregateRateGbps, 0);
    const rateB = number(b.aggregateRateGbps, 0);
    const lanesA = number(a.lanes, factorA ? factorA.lanes : 0);
    const lanesB = number(b.lanes, factorB ? factorB.lanes : 0);
    const mediaA = normalized(a.media);
    const mediaB = normalized(b.media);
    const fiber = normalized(link.fiberType);
    const wavelengthA = number(a.wavelengthNm, 0);
    const wavelengthB = number(b.wavelengthNm, 0);

    checks.push({
      id: "rate",
      pass: rateA > 0 && rateB > 0 && Math.abs(rateA - rateB) < 0.01,
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

    const optical = mediaA === "SMF" || mediaA === "MMF";
    if (optical) {
      checks.push({
        id: "fiber",
        pass: mediaA === fiber && mediaB === fiber,
        detail: `${mediaA}/${mediaB} modules on ${fiber || "unknown"}`
      });
      checks.push({
        id: "wavelength",
        pass: wavelengthA > 0 && wavelengthB > 0 && Math.abs(wavelengthA - wavelengthB) <= 20,
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

    const distanceKm = Math.max(0, number(link.distanceKm, 0));
    const attenuation = Math.max(0, number(link.attenuationDbPerKm, fiber === "MMF" ? 3 : 0.35));
    const connectorLoss = Math.max(0, number(link.connectorCount, 2)) *
      Math.max(0, number(link.connectorLossDb, 0.3));
    const spliceLoss = Math.max(0, number(link.spliceCount, 0)) *
      Math.max(0, number(link.spliceLossDb, 0.1));
    const otherLoss = Math.max(0, number(link.otherLossDb, 0));
    const physicalLossDb = distanceKm * attenuation + connectorLoss + spliceLoss + otherLoss;

    const txMin = Math.min(number(a.txMinDbm, 0), number(b.txMinDbm, 0));
    const rxSensitivity = Math.max(number(a.rxSensitivityDbm, -99), number(b.rxSensitivityDbm, -99));
    const rxOverload = Math.min(number(a.rxOverloadDbm, 99), number(b.rxOverloadDbm, 99));
    const engineeringMargin = Math.max(0, number(link.engineeringMarginDb, 3));
    const estimatedRxDbm = txMin - physicalLossDb;
    const sensitivityMarginDb = estimatedRxDbm - rxSensitivity;
    const designMarginDb = sensitivityMarginDb - engineeringMargin;
    const overloadHeadroomDb = rxOverload - estimatedRxDbm;

    if (optical) {
      checks.push({
        id: "sensitivity",
        pass: designMarginDb >= 0,
        detail: `${designMarginDb.toFixed(2)} dB design margin`
      });
      checks.push({
        id: "overload",
        pass: overloadHeadroomDb >= 0,
        detail: `${overloadHeadroomDb.toFixed(2)} dB overload headroom`
      });
    }

    const failed = checks.filter((check) => !check.pass);
    if (rateA && rateB && rateA !== rateB) {
      warnings.push("Different aggregate rates need explicit host-side rate adaptation; passive fiber cannot translate Ethernet rates.");
    }
    if (lanesA !== lanesB) {
      warnings.push("Lane counts differ; a supported breakout or gearbox is required.");
    }
    if (factorA && rateA / Math.max(lanesA, 1) > factorA.maxLaneGbps + 0.01) errors.push("moduleA.rate");
    if (factorB && rateB / Math.max(lanesB, 1) > factorB.maxLaneGbps + 0.01) errors.push("moduleB.rate");

    let status = "PASS";
    if (errors.length || failed.some((check) => ["rate", "media", "fiber", "wavelength", "sensitivity", "overload"].includes(check.id))) {
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
        overloadHeadroomDb
      }
    };
  }

  return { FORM_FACTORS, calculate };
});

