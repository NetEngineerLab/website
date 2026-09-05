#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2-RunningConfigV1 | Acceptance gate */
"use strict";
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const required=[
 "website/assets/js/domains/running-config/model.js","website/assets/js/domains/running-config/parser.js","website/assets/js/domains/running-config/engine.js",
 "website/assets/js/domains/state-reconciliation/engine.js","website/assets/js/domains/minimal-delta/engine.js","website/assets/js/domains/minimal-delta/renderers.js",
 "scripts/running-config-reconciliation-contract-test.js","docs/V2.1_PHASE2_RUNNING_CONFIG_RECONCILIATION.md","docs/V2.1_PHASE2_RUNNING_CONFIG_ACCEPTANCE_REPORT.md"
];
for(const rel of required)assert.equal(fs.existsSync(path.join(root,rel)),true,`missing ${rel}`);
const pkg=require(path.join(root,"package.json"));assert.ok(pkg.scripts["test:running-config-reconciliation"]);assert.ok(pkg.scripts["prepare:launch"].includes("test:running-config-reconciliation"));assert.ok(pkg.scripts["prepare:launch"].includes("accept:v2.1-phase2-running-config"));
cp.execFileSync(process.execPath,[path.join(root,"scripts/running-config-reconciliation-contract-test.js")],{stdio:"inherit",cwd:root});
const change=require(path.join(root,"website/assets/js/domains/change-planning/engine.js"));assert.equal(typeof change.buildFromRunningConfig,"function");
console.log("V2.1 Phase2 Running Config + Reconciliation + Minimal Delta: ACCEPTED");
