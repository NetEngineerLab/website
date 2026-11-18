"use strict";

const assert = require("assert");
const core = require("../website/assets/js/workflow/nel-workflow-core.js");
const wf = require("../website/assets/js/workflow/ftth-pon-v1.js");

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

function project(patch){
  const base = wf.exampleProject();
  const created = wf.create({ ...base, parameters: { ...base.parameters, ...patch } });
  assert.equal(created.ok, true, JSON.stringify(created.errors));
  return created.context;
}

function step(run, id){
  return run.steps.find(item => item.stepId === id);
}

const clock = () => "2026-11-19T00:00:00.000Z";
const first = wf.run(project(), { clock, runId: "run-1" });
assert.equal(first.ok, true);
assert.equal(first.run.status, "complete");
assert.equal(first.run.summary.failed, 0);
const fiber = step(first.run, "fiber-loss").toolRun;
const splitter = step(first.run, "pon-splitter").toolRun;
const budget = step(first.run, "optical-power-budget").toolRun;
const distance = step(first.run, "pon-distance").toolRun;
const odn = step(first.run, "odf-odn").toolRun;
const measured = step(first.run, "measured-rx").toolRun;
close(splitter.outputs.physicalLoss, 25.3);
close(splitter.outputs.remaining, 3.7);
close(fiber.outputs.physicalLoss, splitter.outputs.physicalLoss);
close(budget.outputs.physical, splitter.outputs.physicalLoss);
close(budget.outputs.rx, splitter.outputs.rx);
close(distance.outputs.estimatedRx, splitter.outputs.rx);
assert.equal(odn.outputs.resources.ponPorts, 1);
assert.equal(odn.outputs.resources.servedCapacity, 64);
assert.equal(measured.status, "UNKNOWN");
assert.equal(measured.outputs.cause, null);
assert.equal(JSON.stringify(measured.outputs).includes("root"), false);

const longer = wf.run(project({ distanceKm: 20 }), { clock, runId: "run-2" });
assert.equal(longer.ok, true);
assert.notStrictEqual(step(longer.run, "fiber-loss").toolRun.outputs.fiberLoss, fiber.outputs.fiberLoss);
close(step(longer.run, "fiber-loss").toolRun.outputs.fiberLoss, 5);
close(step(longer.run, "optical-power-budget").toolRun.outputs.fiber, 5);

const partial = wf.rerun(project(), first.run, "optical-power-budget", { clock });
assert.equal(partial.ok, true);
assert.equal(step(partial.run, "fiber-loss").toolRun.outputs.physicalLoss, fiber.outputs.physicalLoss);
assert.equal(step(partial.run, "pon-splitter").toolRun, step(first.run, "pon-splitter").toolRun);
assert.equal(step(partial.run, "optical-power-budget").toolRun.outputs.physical, budget.outputs.physical);

const stale = wf.rerun(project({ distanceKm: 12 }), first.run, "optical-power-budget", { clock });
assert.equal(stale.ok, false);
assert.equal(stale.error, "upstream-inputs-changed");

const blocked = core.proposeParameter(project(), "distanceKm", 4, { source: "derived", note: "tool suggested a shorter span" });
assert.equal(blocked.ok, false);
assert.equal(blocked.error, "user-input-protected");
assert.equal(project().parameters.distanceKm, 10);
const accepted = core.proposeParameter(project(), "distanceKm", 4, { source: "derived", confirm: true, note: "engineer accepted the shorter span" });
assert.equal(accepted.ok, true);
assert.equal(accepted.context.parameters.distanceKm, 4);
assert.equal(accepted.context.locks.distanceKm, "derived");

for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
  const rejected = wf.create({ ...wf.exampleProject(), parameters: { ...wf.exampleProject().parameters, distanceKm: bad } });
  assert.equal(rejected.ok, false);
}

const third = wf.run(project({ splitter3Db: 3.7 }), { clock, runId: "run-3" });
assert.equal(third.run.status, "aborted");
assert.equal(step(third.run, "pon-distance").toolRun.errors[0], "unsupported-third-stage");
assert.equal(step(third.run, "odf-odn").toolRun.status, "not-run");
const folded = wf.run(project({ splitter3Db: 3.7, includeStage3InDistanceOther: true }), { clock, runId: "run-4" });
assert.equal(folded.run.status, "complete");
assert.ok(step(folded.run, "pon-distance").toolRun.assumptions.some(item => item.includes("third splitter")));

const compared = wf.run(project({ measuredRxDbm: -22.3 }), { clock, runId: "run-5" });
assert.equal(step(compared.run, "measured-rx").toolRun.status, "healthy");
close(step(compared.run, "measured-rx").toolRun.outputs.expectedRx, -22.3);
close(step(compared.run, "measured-rx").toolRun.outputs.deviation, 0);

const oneWay = wf.run(project({ sameBothDirections: false }), { clock, runId: "run-6" });
assert.equal(step(oneWay.run, "odf-odn").toolRun.outputs.scenarios[0].status, "INCONCLUSIVE");
assert.equal(step(oneWay.run, "odf-odn").toolRun.ok, true);

const changedOdn = project({ operatorCap: 32, maxOdnLossDb: 10 });
const resumed = wf.rerun(changedOdn, first.run, "measured-rx", { clock });
assert.equal(resumed.ok, false);
assert.equal(resumed.error, "upstream-inputs-changed");
assert.equal(resumed.stepId, "odf-odn");
const fullOdn = wf.run(changedOdn, { clock, runId: "run-odn-change" });
assert.equal(step(fullOdn.run, "odf-odn").toolRun.outputs.resources.ponPorts, 2);
assert.equal(step(fullOdn.run, "odf-odn").toolRun.outputs.scenarios[0].status, "FAIL");
assert.equal(wf.create({ ...wf.exampleProject(), parameters: { ...wf.exampleProject().parameters, splitter1Db: 24 } }).ok, false);
const renamed = project();
renamed.name = "Renamed span";
const renamedResume = wf.rerun(renamed, first.run, "measured-rx", { clock });
assert.equal(renamedResume.ok, false);
assert.equal(renamedResume.error, "upstream-inputs-changed");
assert.equal(renamedResume.stepId, "odf-odn");
const renamedFull = wf.run(renamed, { clock, runId: "run-rename" });
assert.equal(step(renamedFull.run, "odf-odn").toolRun.outputs.scenarios[0].name, "Renamed span");
assert.ok(!wf.buildReport(renamed, renamedFull.run).markdown.includes("FTTH example"));

const report = wf.buildReport(project(), first.run, { owner: "design" });
assert.equal(report.ok, true);
assert.equal(report.bundle.schemaVersion, "1.0.0");
assert.equal(report.bundle.project, "FTTH example");
assert.ok(report.markdown.includes("fiber-loss"));
assert.ok(report.markdown.includes("optical-power-budget"));
assert.ok(report.markdown.includes("UNKNOWN"));

const storage = core.createMemoryStorage();
const store = core.createProjectStore(storage);
const saved = store.save(project(), first.run);
assert.equal(saved.ok, true);
const restored = store.restore("ftth-example-class-b");
assert.equal(restored.ok, true);
assert.equal(restored.project.parameters.distanceKm, 10);
const replay = wf.run(restored.project, { clock, runId: "run-restored" });
close(step(replay.run, "optical-power-budget").toolRun.outputs.rx, budget.outputs.rx);
const exported = store.exportDocument();
const other = core.createProjectStore(core.createMemoryStorage());
assert.equal(other.importDocument("{").ok, false);
assert.equal(other.importDocument(exported.json).ok, true);
assert.equal(other.restore("ftth-example-class-b").project.name, "FTTH example");
store.save(project({ distanceKm: 11 }), first.run);
assert.equal(store.restore("ftth-example-class-b").versions.length, 2);

console.log("FTTH/PON workflow V1 tests: PASS");
