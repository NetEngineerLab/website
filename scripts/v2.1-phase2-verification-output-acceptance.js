#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2-VerificationV1 | Acceptance gate */
"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),p=require("node:path"),root=p.resolve(__dirname,"..");
for(const rel of ["website/assets/js/domains/verification-output/parser.js","website/assets/js/domains/verification-output/evaluator.js","website/assets/js/domains/verification-output/engine.js","scripts/verification-output-evaluation-contract-test.js","docs/V2.1_PHASE2_VERIFICATION_OUTPUT_EVALUATION.md"]){assert.ok(fs.existsSync(p.join(root,rel)),`missing ${rel}`)}
const pkg=require("../package.json");assert.ok(pkg.scripts["test:verification-output-evaluation"]);assert.ok(pkg.scripts["prepare:launch"].includes("test:verification-output-evaluation"));assert.ok(pkg.scripts["prepare:launch"].includes("accept:v2.1-phase2-verification-output"));
const engine=require("../website/assets/js/domains/change-execution/engine");assert.equal(typeof engine.evaluateOutputs,"function");
console.log("V2.1 Phase2 Verification Output + Execution Evaluation acceptance: PASS");
