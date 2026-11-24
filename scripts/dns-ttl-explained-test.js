#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const {execFileSync} = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const engineRel = "website/tools/dns-ttl-propagation-calculator/js/engine.js";
const headEngine = execFileSync("git", ["show", `HEAD:${engineRel}`], {cwd: root, encoding: "utf8"});
assert.equal(read(engineRel), headEngine, "frozen DNS TTL engine must stay unchanged");

const guides = [
  ["website/guides/dns-ttl-explained/index.html", "https://netengineerlab.com/guides/dns-ttl-explained/", "/tools/dns-ttl-propagation-calculator/"],
  ["website/zh/guides/dns-ttl-explained/index.html", "https://netengineerlab.com/zh/guides/dns-ttl-explained/", "/tools/dns-ttl-propagation-calculator/zh/"],
  ["website/es/guides/dns-ttl-explained/index.html", "https://netengineerlab.com/es/guides/dns-ttl-explained/", "/tools/dns-ttl-propagation-calculator/es/"]
];
const tools = [
  ["website/tools/dns-ttl-propagation-calculator/index.html", "/guides/dns-ttl-explained/"],
  ["website/tools/dns-ttl-propagation-calculator/zh/index.html", "/zh/guides/dns-ttl-explained/"],
  ["website/tools/dns-ttl-propagation-calculator/es/index.html", "/es/guides/dns-ttl-explained/"]
];
const markers = ["300", "600", "3600", "14400", "86400", "5", "10", "60", "240", "1440"];
const banned = ["6.55", "0.41%", "1228", "30062", "60038"];

for (const [rel, canon, toolHref] of guides) {
  const html = read(rel);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${rel} h1 count`);
  assert.match(html, new RegExp(`rel="canonical" href="${canon.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  for (const lang of ["en", "zh-CN", "es", "x-default"]) assert.match(html, new RegExp(`hreflang="${lang}"`));
  assert.match(html, /class="guide-toc guide-related-side"/);
  assert.doesNotMatch(html, /guide-primary-cta|guide-content/);
  assert.match(html, /3600 - 600 = 3000/);
  assert.match(html, /86400 - 3600 = 82800/);
  assert.match(html, /RFC 2308/);
  assert.match(html, /RFC 8767/);
  for (const marker of markers) assert.ok(html.includes(marker), `${rel} missing ${marker}`);
  assert.ok(html.includes(toolHref) || html.includes(toolHref.replace(/^\//, "")), `${rel} tool link`);
  assert.doesNotMatch(html, /subnet-calculator-guide|bandwidth-transfer-time-guide|topics\/dns/);
  for (const secret of banned) assert.equal(html.includes(secret), false, `${rel} published private metric ${secret}`);
}
assert.equal(fs.existsSync(path.join(root, "website/topics/dns")), false);
assert.equal(fs.existsSync(path.join(root, "website/zh/topics/dns")), false);
assert.equal(fs.existsSync(path.join(root, "website/es/topics/dns")), false);
const registry = JSON.parse(read("website/data/sitemap-routes.json"));
const family = registry.routes.find(item => item.id === "guide-dns-ttl-explained");
assert.deepEqual(family.relatedContent, ["/tools/dns-ttl-propagation-calculator/"]);
for (const [rel, guideHref] of tools) {
  const html = read(rel);
  assert.match(html, new RegExp(`href="(?:\\.\\./)*${guideHref.replace(/^\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  for (const marker of ["300", "600", "3600", "14400", "86400"]) assert.ok(html.includes(marker), `${rel} missing ${marker}`);
  for (const secret of banned) assert.equal(html.includes(secret), false, `${rel} published private metric ${secret}`);
}
const enGuide = read(guides[0][0]);
const zhGuide = read(guides[1][0]);
const esGuide = read(guides[2][0]);
assert.match(enGuide, /not a network-wide cutover|not a clock for worldwide DNS synchronization/);
assert.match(zhGuide, /不是全网同步/);
assert.match(esGuide, /No es un reloj de sincronización mundial|no está sincronizada/);
assert.match(enGuide, /300 \/ 60 = 5 minutes/);
assert.match(enGuide, /1440 x 60 = 86400/);

console.log("PASS dns ttl explained");
