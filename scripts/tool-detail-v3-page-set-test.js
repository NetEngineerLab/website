#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadPageSet } = require("./lib/tool-detail-v3-page-set");

const root = path.resolve(__dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(root, "src/registry/tool-registry.json"), "utf8"));
const sitemapXml = fs.readFileSync(path.join(root, "website/sitemap.xml"), "utf8");
const ten = [
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

const live = loadPageSet();
const activeFolders = JSON.parse(fs.readFileSync(path.join(root, "website/data/locales.json"), "utf8")).locales.filter(locale => locale.status === "active").map(locale => locale.folder ? locale.folder + "/" : "");
assert.equal(live.preserved, activeFolders.length);
assert.equal(live.migrated, live.pages.length - activeFolders.length);
const urls = new Set(live.pages.map(page => page.url));
for (const id of ten) for (const folder of activeFolders) {
  assert(urls.has("https://netengineerlab.com/tools/" + id + "/" + folder), id + " " + folder);
}
assert(!urls.has("https://netengineerlab.com/tools/oob-network-design-planner/es/"));

function expectThrow(run, code) {
  assert.throws(run, error => error instanceof Error && error.message.startsWith(code + ":"));
}

expectThrow(() => loadPageSet({
  fileExists: rel => rel !== "website/tools/shannon-capacity-calculator/es/index.html" && fs.existsSync(path.join(root, rel))
}), "missing-page");

const dwdmEs = "https://netengineerlab.com/tools/itu-dwdm-grid-calculator/es/";
expectThrow(() => loadPageSet({ sitemapXml: sitemapXml.replace("<loc>" + dwdmEs + "</loc>", "<loc>https://netengineerlab.com/</loc>") }), "sitemap-missing");
expectThrow(() => loadPageSet({ dropRoute: dwdmEs }), "route-mismatch");
expectThrow(() => loadPageSet({
  sitemapXml: sitemapXml.replace("</urlset>", "<url><loc>https://netengineerlab.com/tools/not-a-registered-tool/</loc></url></urlset>")
}), "sitemap-extra");
expectThrow(() => loadPageSet({
  sitemapXml: sitemapXml.replace("<loc>" + dwdmEs + "</loc>", "<loc>" + dwdmEs + "</loc></url><url><loc>" + dwdmEs + "</loc>")
}), "duplicate-sitemap-loc");
expectThrow(() => loadPageSet({
  registry: registry.concat([registry.find(tool => tool.id === "itu-dwdm-grid-calculator")])
}), "duplicate-registry");

const directory = loadPageSet();
assert(!directory.pages.some(page => page.url === "https://netengineerlab.com/tools/zh/" || page.url === "https://netengineerlab.com/tools/es/" || page.url === "https://netengineerlab.com/tools/id/" || page.url === "https://netengineerlab.com/tools/pt-br/"));
console.log("Tool-detail V3 page-set negative regression PASS");
