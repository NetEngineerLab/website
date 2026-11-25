#!/usr/bin/env node
"use strict";
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const tools = [
  "subnet-calculator",
  "bandwidth-calculator",
  "fiber-latency-calculator",
  "ethernet-serialization-delay-calculator",
  "stp-path-cost-calculator",
  "chromatic-dispersion-calculator",
  "copper-propagation-delay-calculator",
  "shannon-capacity-calculator",
  "tcp-mathis-throughput-estimator",
  "mm1-queue-delay-calculator",
  "ethernet-line-coding-calculator",
  "dc-feeder-voltage-drop-calculator",
  "itu-dwdm-grid-calculator",
  "edfa-ase-osnr-estimator",
  "path-availability-calculator",
  "fiber-loss",
  "pmd-budget-calculator",
  "pon-splitter-loss",
  "pon-distance",
  "poe-power-budget-calculator",
  "poe-voltage-drop-calculator",
  "pathway-fill-calculator",
  "ospf-cost-calculator",
  "route-summarization-calculator",
  "wireless-link-budget-calculator",
  "pue-data-center-energy-efficiency",
  "dns-ttl-propagation-calculator"
];
const sheet = fs.readFileSync(path.join(root, "website/assets/css/pilot-locale-toc.css"), "utf8");
assert.match(sheet, /html:is\(:lang\(id\), :lang\(pt-BR\)\)/);
assert.match(sheet, /font-size:\s*15px !important/);
assert.match(sheet, /font-weight:\s*700 !important/);
assert.doesNotMatch(sheet, /\.toc h4[\s\S]*font-size:\s*15px/);
assert.doesNotMatch(sheet, /:lang\(en\)|:lang\(es\)|:lang\(zh\)/);

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
for (const tool of tools) {
  for (const locale of ["id", "pt-br"]) {
    const rel = `website/tools/${tool}/${locale}/index.html`;
    const html = read(rel);
    assert.match(html, /pilot-locale-toc\.css/, `${rel} missing directory style`);
    assert.match(html, /<nav\b[^>]*\bclass="[^"]*\btoc\b/, `${rel} directory missing`);
  }
  for (const locale of ["", "es", "zh"]) {
    const rel = locale
      ? `website/tools/${tool}/${locale}/index.html`
      : `website/tools/${tool}/index.html`;
    assert.doesNotMatch(read(rel), /pilot-locale-toc\.css/, `${rel} must keep the shared directory type`);
  }
}
console.log("Pilot locale directory type PASS");
