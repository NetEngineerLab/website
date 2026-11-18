(function(root, factory){
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NELFtthPonWorkflow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(){
  "use strict";

  const WORKFLOW_ID = "optical-link-design";
  const WORKFLOW_VERSION = "ftth-pon-v1";
  const SPLITTER_DB = ["0", "3.7", "7.2", "10.5", "13.8", "17", "20.5", "24"];
  const UNITS = {
    distanceKm: "km",
    attenuationDbPerKm: "dB/km",
    spliceLossDb: "dB",
    connectorLossDb: "dB",
    splitterDb: "dB",
    otherLossDb: "dB",
    marginDb: "dB",
    penaltyDb: "dB",
    powerDbm: "dBm",
    systemReachKm: "km"
  };

  function engines(){
    const host = typeof globalThis !== "undefined" ? globalThis : window;
    if (typeof module === "object" && module.exports) {
      return {
        fiber: require("../../../tools/fiber-loss/js/engine.js"),
        splitter: require("../../../tools/pon-splitter-loss/js/engine.js"),
        budget: require("../../../tools/optical-power-budget/js/engine.js"),
        distance: require("../../../tools/pon-distance/js/engine.js"),
        odn: require("../../../tools/odf-odn-resource-planner/js/engine.js"),
        onu: require("../../../tools/onu-rx-power/js/engine.js"),
        report: require("../../../tools/engineering-report-batch-export-center/js/engine.js")
      };
    }
    return {
      fiber: host.NELFiberLossEngine,
      splitter: host.NELPonSplitterLossEngine,
      budget: host.NELOpticalPowerBudgetEngine,
      distance: host.NELPonDistanceEngine,
      odn: host.NELOdfOdnEngine,
      onu: host.NELOnuRxPowerEngine,
      report: host.NELReportCenter
    };
  }

  function core(){
    const host = typeof globalThis !== "undefined" ? globalThis : window;
    return host.NELWorkflow || require("./nel-workflow-core.js");
  }

  function finite(value){
    return typeof value === "number" && Number.isFinite(value);
  }

  function integer(value){
    return Number.isSafeInteger(value);
  }

  function catalog(value){
    return SPLITTER_DB.includes(String(value));
  }

  function validateParameters(parameters){
    const errors = [];
    if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) return ["project-parameters-invalid"];
    const nonNegative = ["distanceKm", "spliceLossDb", "connectorLossDb", "otherLossDb", "marginDb", "penaltyDb", "maxOdnLossDb"];
    for (const key of nonNegative) if (!finite(parameters[key]) || parameters[key] < 0) errors.push(`${key}-invalid`);
    if (!finite(parameters.attenuationDbPerKm) || parameters.attenuationDbPerKm <= 0) errors.push("attenuationDbPerKm-invalid");
    if (!integer(parameters.spliceCount) || parameters.spliceCount < 0) errors.push("spliceCount-invalid");
    if (!integer(parameters.connectorCount) || parameters.connectorCount < 0) errors.push("connectorCount-invalid");
    for (const key of ["splitter1Db", "splitter2Db", "splitter3Db"]) if (!catalog(parameters[key])) errors.push(`${key}-unsupported`);
    for (const key of ["txMinDbm", "txMaxDbm", "rxSensitivityDbm", "rxOverloadDbm"]) if (!finite(parameters[key])) errors.push(`${key}-invalid`);
    if (finite(parameters.txMinDbm) && finite(parameters.txMaxDbm) && parameters.txMinDbm > parameters.txMaxDbm) errors.push("tx-window-invalid");
    if (finite(parameters.rxSensitivityDbm) && finite(parameters.rxOverloadDbm) && parameters.rxSensitivityDbm >= parameters.rxOverloadDbm) errors.push("rx-window-invalid");
    if (!finite(parameters.systemReachKm) || parameters.systemReachKm < 0.1) errors.push("systemReachKm-invalid");
    if (!integer(parameters.targetOnu) || parameters.targetOnu <= 0) errors.push("targetOnu-invalid");
    if (!integer(parameters.stages) || parameters.stages < 1 || parameters.stages > 3) errors.push("stages-invalid");
    if (!integer(parameters.ratio1) || parameters.ratio1 <= 0) errors.push("ratio1-invalid");
    if (parameters.stages >= 2 && (!integer(parameters.ratio2) || parameters.ratio2 <= 0)) errors.push("ratio2-invalid");
    if (parameters.stages >= 3 && (!integer(parameters.ratio3) || parameters.ratio3 <= 0)) errors.push("ratio3-invalid");
    if (!integer(parameters.operatorCap) || parameters.operatorCap <= 0) errors.push("operatorCap-invalid");
    if (![1, 2].includes(parameters.protectionFactor)) errors.push("protectionFactor-invalid");
    if (!finite(parameters.reservePct) || parameters.reservePct < 0 || parameters.reservePct >= 100) errors.push("reservePct-invalid");
    if (parameters.measuredRxDbm != null && !finite(parameters.measuredRxDbm)) errors.push("measuredRxDbm-invalid");
    if (parameters.includeStage3InDistanceOther !== true && parameters.includeStage3InDistanceOther !== false) errors.push("includeStage3InDistanceOther-invalid");
    if (parameters.sameBothDirections !== true && parameters.sameBothDirections !== false) errors.push("sameBothDirections-invalid");
    return errors;
  }

  function exampleProject(){
    return {
      id: "ftth-example-class-b",
      name: "FTTH example",
      scenario: "GPON class planning example",
      equipmentClass: "GPON Class B+",
      vendor: "unspecified",
      inputSource: "worked-example",
      parameters: {
        distanceKm: 10,
        attenuationDbPerKm: 0.25,
        spliceCount: 6,
        spliceLossDb: 0.1,
        connectorCount: 4,
        connectorLossDb: 0.3,
        splitter1Db: 10.5,
        splitter2Db: 10.5,
        splitter3Db: 0,
        otherLossDb: 0,
        marginDb: 3,
        penaltyDb: 1,
        txMinDbm: 3,
        txMaxDbm: 7,
        rxSensitivityDbm: -30,
        rxOverloadDbm: -8,
        systemReachKm: 20,
        maxOdnLossDb: 32,
        targetOnu: 64,
        stages: 2,
        ratio1: 8,
        ratio2: 8,
        ratio3: 1,
        operatorCap: 64,
        protectionFactor: 1,
        reservePct: 20,
        maxCableCores: 144,
        odfTrayCapacity: 12,
        spliceTrayCapacity: 12,
        existingOdfPorts: 0,
        existingOdfTrays: 0,
        existingSpliceTrays: 0,
        existingFeederCores: 0,
        existingDistributionCores: 0,
        measuredRxDbm: null,
        warningMarginDb: 3,
        noSignalDbm: -40,
        includeStage3InDistanceOther: false,
        sameBothDirections: true
      },
      units: UNITS,
      assumptions: [
        "Splitter insertion loss must be one of the values already accepted by the PON splitter, PON distance and ONU RX engines.",
        "Fiber Loss available budget is derived from the same transmit minimum, receive sensitivity and optical penalty. It does not replace those user inputs.",
        "Upstream ODN optics copy the downstream window only when sameBothDirections is true."
      ],
      locks: {
        distanceKm: "user",
        attenuationDbPerKm: "user",
        splitter1Db: "user",
        splitter2Db: "user",
        splitter3Db: "user",
        txMinDbm: "user",
        txMaxDbm: "user",
        rxSensitivityDbm: "user",
        rxOverloadDbm: "user",
        measuredRxDbm: "user"
      }
    };
  }

  function shown(value){
    if (!Number.isFinite(value)) return value;
    return Number(value.toFixed(4));
  }

  function keyResult(name, value, unit){
    const display = typeof value === "number" ? shown(value) : value;
    return { name, value: display, unit, validity: Number.isFinite(value) ? "valid" : "invalid" };
  }

  function opticalInputs(parameters, distanceOther){
    return {
      distanceKm: parameters.distanceKm,
      attenuationDbPerKm: parameters.attenuationDbPerKm,
      spliceCount: parameters.spliceCount,
      spliceLossDb: parameters.spliceLossDb,
      connectorCount: parameters.connectorCount,
      connectorLossDb: parameters.connectorLossDb,
      splitter1Db: parameters.splitter1Db,
      splitter2Db: parameters.splitter2Db,
      splitter3Db: parameters.splitter3Db,
      otherLossDb: parameters.otherLossDb,
      distanceOtherLossDb: distanceOther,
      marginDb: parameters.marginDb,
      penaltyDb: parameters.penaltyDb,
      txMinDbm: parameters.txMinDbm,
      txMaxDbm: parameters.txMaxDbm,
      rxSensitivityDbm: parameters.rxSensitivityDbm,
      rxOverloadDbm: parameters.rxOverloadDbm,
      systemReachKm: parameters.systemReachKm
    };
  }

  function failed(toolId, code, inputs, assumptions){
    return core().toolResult({
      ok: false,
      toolId,
      calculationVersion: WORKFLOW_VERSION,
      status: "failed",
      errors: [code],
      inputs,
      assumptions: assumptions || [],
      units: UNITS
    });
  }

  function definition(clock){
    const library = engines();
    const now = clock || (() => new Date().toISOString());
    return {
      id: WORKFLOW_ID,
      version: WORKFLOW_VERSION,
      startedAt: now(),
      steps: [
        {
          id: "fiber-loss",
          toolId: "fiber-loss",
          run(context){
            const p = context.parameters;
            const inputs = opticalInputs(p, p.otherLossDb);
            const availableBudget = p.txMinDbm - p.rxSensitivityDbm - p.penaltyDb;
            const engineInput = {
              distance: p.distanceKm, attenuation: p.attenuationDbPerKm,
              spliceCount: p.spliceCount, spliceLoss: p.spliceLossDb,
              connectorCount: p.connectorCount, connectorLoss: p.connectorLossDb,
              splitter1: p.splitter1Db, splitter2: p.splitter2Db, otherLoss: p.otherLossDb + p.splitter3Db,
              engineeringMargin: p.marginDb, availableBudget, txPower: p.txMinDbm, rxThreshold: p.rxSensitivityDbm
            };
            const output = library.fiber.calculate(engineInput);
            if (!output.ok) return failed("fiber-loss", output.error || "invalid-input", inputs);
            return core().toolResult({
              toolId: "fiber-loss",
              calculationVersion: WORKFLOW_VERSION,
              status: output.status,
              inputs,
              outputs: output,
              units: UNITS,
              assumptions: ["Third-stage splitter loss is included in Fiber Loss otherLoss because that engine has two splitter fields. The user splitter values are unchanged."],
              keyResults: [
                keyResult("physicalLoss", output.physicalLoss, "dB"),
                keyResult("designLoss", output.designLoss, "dB"),
                keyResult("budgetRemaining", output.budgetRemaining, "dB"),
                keyResult("estimatedRxPower", output.estimatedRxPower, "dBm")
              ],
              evidence: ["website/tools/fiber-loss/js/engine.js"]
            });
          }
        },
        {
          id: "pon-splitter",
          toolId: "pon-splitter-loss",
          run(context){
            const p = context.parameters;
            const inputs = opticalInputs(p, p.otherLossDb);
            const output = library.splitter.calculate({
              distance: p.distanceKm, attenuation: p.attenuationDbPerKm,
              spliceCount: p.spliceCount, spliceLoss: p.spliceLossDb,
              connectorCount: p.connectorCount, connectorLoss: p.connectorLossDb,
              s1: p.splitter1Db, s2: p.splitter2Db, s3: p.splitter3Db,
              other: p.otherLossDb, penalty: p.penaltyDb, margin: p.marginDb,
              tx: p.txMinDbm, txMax: p.txMaxDbm, sens: p.rxSensitivityDbm, over: p.rxOverloadDbm,
              systemReach: p.systemReachKm
            });
            if (!output.ok) return failed("pon-splitter-loss", output.error || "invalid-input", inputs);
            return core().toolResult({
              toolId: "pon-splitter-loss",
              calculationVersion: WORKFLOW_VERSION,
              status: output.status,
              inputs, outputs: output, units: UNITS,
              keyResults: [
                keyResult("splitterLoss", output.splitterLoss, "dB"),
                keyResult("totalRatio", output.totalRatio, "1:N"),
                keyResult("designLoss", output.designLoss, "dB"),
                keyResult("remaining", output.remaining, "dB"),
                keyResult("rx", output.rx, "dBm")
              ],
              evidence: ["website/tools/pon-splitter-loss/js/engine.js"]
            });
          }
        },
        {
          id: "optical-power-budget",
          toolId: "optical-power-budget",
          run(context){
            const p = context.parameters;
            const inputs = opticalInputs(p, p.otherLossDb);
            const output = library.budget.calculate({
              penalty: p.penaltyDb, d: p.distanceKm, a: p.attenuationDbPerKm,
              sc: p.spliceCount, sl: p.spliceLossDb, cc: p.connectorCount, cl: p.connectorLossDb,
              s1: p.splitter1Db, s2: p.splitter2Db, s3: p.splitter3Db, other: p.otherLossDb, margin: p.marginDb,
              tx: p.txMinDbm, txMax: p.txMaxDbm, sens: p.rxSensitivityDbm, over: p.rxOverloadDbm
            });
            if (!output.ok) return failed("optical-power-budget", output.error || "invalid-input", inputs);
            return core().toolResult({
              toolId: "optical-power-budget",
              calculationVersion: WORKFLOW_VERSION,
              status: output.st,
              inputs, outputs: output, units: UNITS,
              keyResults: [
                keyResult("physical", output.physical, "dB"),
                keyResult("design", output.design, "dB"),
                keyResult("remain", output.remain, "dB"),
                keyResult("rx", output.rx, "dBm"),
                keyResult("maxD", output.maxD, "km")
              ],
              evidence: ["website/tools/optical-power-budget/js/engine.js"]
            });
          }
        },
        {
          id: "pon-distance",
          toolId: "pon-distance",
          run(context){
            const p = context.parameters;
            const fold = p.includeStage3InDistanceOther === true && p.splitter3Db !== 0;
            if (p.splitter3Db !== 0 && !fold) {
              return failed("pon-distance", "unsupported-third-stage", opticalInputs(p, p.otherLossDb), [
                "PON Maximum Distance models two splitter stages. The third stage was not added to other loss because includeStage3InDistanceOther is false."
              ]);
            }
            const other = p.otherLossDb + (fold ? p.splitter3Db : 0);
            const inputs = opticalInputs(p, other);
            const output = library.distance.calculate({
              planned: p.distanceKm, systemReach: p.systemReachKm, attenuation: p.attenuationDbPerKm,
              spliceCount: p.spliceCount, spliceLoss: p.spliceLossDb,
              connectorCount: p.connectorCount, connectorLoss: p.connectorLossDb,
              s1: p.splitter1Db, s2: p.splitter2Db, other, margin: p.marginDb,
              tx: p.txMinDbm, sens: p.rxSensitivityDbm, over: p.rxOverloadDbm
            });
            if (!output.ok) return failed("pon-distance", output.error || "invalid-input", inputs);
            return core().toolResult({
              toolId: "pon-distance",
              calculationVersion: WORKFLOW_VERSION,
              status: output.status,
              inputs, outputs: output, units: UNITS,
              assumptions: fold ? ["User confirmed the third splitter stage is carried in PON distance other loss."] : [],
              warnings: output.riskLevel === "high" ? ["PON distance risk level is high."] : [],
              keyResults: [
                keyResult("effectiveMax", output.effectiveMax, "km"),
                keyResult("designRemaining", output.designRemaining, "dB"),
                keyResult("estimatedRx", output.estimatedRx, "dBm")
              ],
              evidence: ["website/tools/pon-distance/js/engine.js"]
            });
          }
        },
        {
          id: "odf-odn",
          toolId: "odf-odn-resource-planner",
          run(context){
            const p = context.parameters;
            const inputs = {
              targetOnu: p.targetOnu, stages: p.stages, ratio1: p.ratio1, ratio2: p.ratio2, ratio3: p.ratio3,
              distanceKm: p.distanceKm, splitterLossDb: p.splitter1Db + p.splitter2Db + p.splitter3Db,
              sameBothDirections: p.sameBothDirections
            };
            const down = {
              distanceKm: p.distanceKm, downAttenuation: p.attenuationDbPerKm,
              splitterLoss: p.splitter1Db + p.splitter2Db + p.splitter3Db,
              spliceCount: p.spliceCount, spliceLoss: p.spliceLossDb,
              connectorCount: p.connectorCount, connectorLoss: p.connectorLossDb,
              otherLoss: p.otherLossDb, maxOdnLoss: p.maxOdnLossDb, maxReachKm: p.systemReachKm,
              pathPenalty: p.penaltyDb,
              downTxMin: p.txMinDbm, downTxMax: p.txMaxDbm,
              downRxSensitivity: p.rxSensitivityDbm, downRxOverload: p.rxOverloadDbm
            };
            if (p.sameBothDirections) {
              down.upAttenuation = p.attenuationDbPerKm;
              down.upTxMin = p.txMinDbm;
              down.upTxMax = p.txMaxDbm;
              down.upRxSensitivity = p.rxSensitivityDbm;
              down.upRxOverload = p.rxOverloadDbm;
            }
            const output = library.odn.calculate({
              targetOnu: p.targetOnu, stages: p.stages, r1: p.ratio1, r2: p.ratio2, r3: p.ratio3,
              operatorCap: p.operatorCap, protectionFactor: p.protectionFactor, reservePct: p.reservePct,
              maxCableCores: p.maxCableCores, odfTrayCapacity: p.odfTrayCapacity, spliceTrayCapacity: p.spliceTrayCapacity,
              existingOdfPorts: p.existingOdfPorts, existingOdfTrays: p.existingOdfTrays,
              existingSpliceTrays: p.existingSpliceTrays, existingFeederCores: p.existingFeederCores,
              existingDistributionCores: p.existingDistributionCores,
              scenarios: [Object.assign({ id: "A", name: context.name || "Project" }, down)]
            });
            const resourcesOk = output.resources && output.resources.valid === true;
            const optical = output.scenarios && output.scenarios[0];
            const warnings = [];
            if (optical && optical.status === "INCONCLUSIVE") warnings.push("ODN optical direction is INCONCLUSIVE. No upstream window was invented.");
            if (!resourcesOk) warnings.push("ODN resource inputs did not pass the existing planner.");
            return core().toolResult({
              ok: resourcesOk,
              toolId: "odf-odn-resource-planner",
              calculationVersion: WORKFLOW_VERSION,
              status: resourcesOk ? (optical ? optical.status : "PASS") : "failed",
              inputs, outputs: output, units: UNITS,
              warnings,
              errors: resourcesOk ? [] : ["odn-resource-invalid"],
              assumptions: p.sameBothDirections ? ["Upstream optics reuse the downstream user window because sameBothDirections is true."] : [],
              keyResults: resourcesOk ? [
                keyResult("ponPorts", output.resources.ponPorts, "ports"),
                keyResult("servedCapacity", output.resources.servedCapacity, "ONU"),
                keyResult("minMargin", optical ? optical.minMargin : NaN, "dB")
              ] : [],
              evidence: ["website/tools/odf-odn-resource-planner/js/engine.js"]
            });
          }
        },
        {
          id: "measured-rx",
          toolId: "onu-rx-power",
          required: false,
          run(context){
            const p = context.parameters;
            const inputs = { measuredRxDbm: p.measuredRxDbm, distanceKm: p.distanceKm, splitter1Db: p.splitter1Db, splitter2Db: p.splitter2Db, splitter3Db: p.splitter3Db };
            if (p.measuredRxDbm == null) {
              return core().toolResult({
                ok: true,
                toolId: "onu-rx-power",
                calculationVersion: WORKFLOW_VERSION,
                status: "UNKNOWN",
                inputs,
                outputs: { cause: null },
                warnings: ["No measured receive power was provided."],
                assumptions: ["Evidence is insufficient. No root cause is assigned."],
                keyResults: [{ name: "cause", value: null, unit: "", validity: "unknown" }],
                evidence: ["website/tools/onu-rx-power/js/engine.js"]
              });
            }
            const other = p.otherLossDb + p.splitter3Db;
            const output = library.onu.calculate({
              mode: "model", measured: p.measuredRxDbm, sens: p.rxSensitivityDbm, over: p.rxOverloadDbm,
              noSignal: p.noSignalDbm, warning: p.warningMarginDb,
              distance: p.distanceKm, attenuation: p.attenuationDbPerKm,
              spliceCount: p.spliceCount, spliceLoss: p.spliceLossDb,
              connectorCount: p.connectorCount, connectorLoss: p.connectorLossDb,
              s1: p.splitter1Db, s2: p.splitter2Db, other, tx: p.txMinDbm
            });
            if (!output.ok) return failed("onu-rx-power", output.error || "invalid-input", inputs);
            return core().toolResult({
              toolId: "onu-rx-power",
              calculationVersion: WORKFLOW_VERSION,
              status: output.status,
              inputs, outputs: output, units: UNITS,
              assumptions: p.splitter3Db !== 0 ? ["ONU RX models two splitter fields, so the third stage was added to other loss for this comparison only."] : [],
              keyResults: [
                keyResult("expectedRx", output.expectedRx, "dBm"),
                keyResult("deviation", output.deviation, "dB")
              ],
              evidence: ["website/tools/onu-rx-power/js/engine.js"]
            });
          }
        }
      ]
    };
  }

  function create(fields){
    const errors = validateParameters(fields && fields.parameters);
    if (errors.length) return { ok: false, errors };
    const project = core().createProject(fields);
    if (!project.ok) return { ok: false, errors: [project.error] };
    for (const key of Object.keys(fields.parameters)) {
      if (!project.context.locks[key]) project.context.locks[key] = "user";
    }
    return project;
  }

  function run(context, options){
    const errors = validateParameters(context && context.parameters);
    if (errors.length) return { ok: false, errors };
    const built = definition(options && options.clock);
    if (options && options.runId) built.runId = options.runId;
    return core().runWorkflow(built, context);
  }

  function rerun(context, previousRun, fromStepId, options){
    const errors = validateParameters(context && context.parameters);
    if (errors.length) return { ok: false, errors };
    const built = definition(options && options.clock);
    return core().rerunFrom(built, context, previousRun, fromStepId);
  }

  function buildReport(context, runResult, meta){
    if (!runResult || !runResult.steps) return { ok: false, error: "run-required" };
    const records = core().reportRecords(runResult);
    if (!records.length) return { ok: false, error: "no-reportable-step" };
    const library = engines();
    const bundle = library.report.createBundle(records, {
      title: "FTTH/PON engineering report",
      project: context.name,
      owner: (meta && meta.owner) || "",
      locale: meta && meta.locale === "zh" ? "zh" : "en",
      generatedAt: runResult.startedAt
    });
    return { ok: true, bundle, markdown: library.report.toMarkdown(bundle, "report") };
  }

  return {
    WORKFLOW_ID,
    WORKFLOW_VERSION,
    SPLITTER_DB,
    UNITS,
    exampleProject,
    validateParameters,
    create,
    run,
    rerun,
    buildReport,
    definition
  };
});
