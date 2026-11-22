#!/usr/bin/env node
"use strict";
const { spawnSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ids = [
  "itu-dwdm-grid-calculator",
  "edfa-ase-osnr-estimator",
  "ethernet-line-coding-calculator",
  "tcp-mathis-throughput-estimator",
  "mm1-queue-delay-calculator",
  "path-availability-calculator",
  "dc-feeder-voltage-drop-calculator",
  "pathway-fill-calculator",
  "copper-propagation-delay-calculator",
  "shannon-capacity-calculator"
];
const before = JSON.parse(fs.readFileSync(path.join(root, "reports/new-ten-tools-20261119/engine-hashes-before.json"), "utf8"));
const mismatches = [];
for (const [rel, hash] of Object.entries(before.engines)) {
  const file = path.join(root, rel);
  const now = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  if (now !== hash) mismatches.push(rel);
}
if (mismatches.length) {
  console.error("Frozen engine hash mismatch:");
  for (const rel of mismatches) console.error("  " + rel);
  process.exit(1);
}
let failed = 0;
for (const id of ids) {
  const file = path.join(root, "website/tools", id, "docs/engine-test.js");
  const run = spawnSync(process.execPath, [file], { cwd: root, encoding: "utf8" });
  process.stdout.write(run.stdout || "");
  process.stderr.write(run.stderr || "");
  if (run.status !== 0) failed += 1;
}
if (failed) {
  console.error(failed + " new-tool engine tests failed");
  process.exit(1);
}
console.log("New ten tools 2026-11-19 PASS (10 engines; " + Object.keys(before.engines).length + " frozen engines unchanged)");
