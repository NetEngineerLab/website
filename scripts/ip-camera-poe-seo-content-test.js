#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const assert = require("assert");
const Poe = require("../website/tools/poe-power-budget-calculator/js/engine.js");
const Drop = require("../website/tools/poe-voltage-drop-calculator/js/engine.js");

const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
let failed = 0;
const check = (name, ok, detail) => {
  if (!ok) {
    failed += 1;
    console.error("FAIL", name, detail || "");
  } else {
    console.log("PASS", name);
  }
};

const guides = [
  "website/guides/ip-camera-network-bandwidth-poe/index.html",
  "website/zh/guides/ip-camera-network-bandwidth-poe/index.html",
  "website/es/guides/ip-camera-network-bandwidth-poe/index.html"
];
const topics = [
  "website/topics/ip-camera-network-bandwidth-poe/index.html",
  "website/zh/topics/ip-camera-network-bandwidth-poe/index.html",
  "website/es/topics/ip-camera-network-bandwidth-poe/index.html"
];
const articles = [...guides, ...topics];
const ids = ["formula", "count", "codec", "streams", "uplink", "margin", "poe", "example", "calculators", "mistakes", "faq"];
const numbers = ["72.0", "82.8", "99.36", "64.0", "88.32", "43.2", "20.736", "271.06", "406.59", "37.87", "43.51", "0.075", "0.045", "0.24", "1.15", "1.20", "1.25", "0.0108"];
const fixedPercentBan = [/saves?\s+\d+\s*%/i, /节省\s*\d+\s*%/, /ahorra(?:r)?\s+un\s+\d+\s*%/i, /固定节省\s*\d+/];
const privateMetrics = ["229", "1247", "5.76"];

const sixteen = Poe.calculate({switchBudget: 370, switchPorts: 24, deviceCount: 16, deviceWatts: 12, cableLossPercent: 15, headroomPercent: 20, standard: "at"});
const twentyFour = Poe.calculate({switchBudget: 370, switchPorts: 24, deviceCount: 24, deviceWatts: 12, cableLossPercent: 15, headroomPercent: 20, standard: "at"});
const twentyFourExample = Poe.calculate({switchBudget: 370, switchPorts: 24, deviceCount: 24, deviceWatts: 15, cableLossPercent: 5, headroomPercent: 20, standard: "at"});
check("engine 16 cameras", sixteen.status === "pass" && sixteen.requiredBudget.toFixed(2) === "271.06", String(sixteen.requiredBudget));
check("engine 24 cameras", twentyFour.budgetPass === false && twentyFour.requiredBudget.toFixed(2) === "406.59", String(twentyFour.requiredBudget));
check("engine additive loss is not the model", twentyFourExample.requiredBudget.toFixed(2) === "454.74", String(twentyFourExample.requiredBudget));
const thin = Drop.calculate({lengthM: 90, sourceV: 48, loadW: 25.5, awg: 26, pairs: 2, tempC: 45, contactOhm: 0.3, efficiency: 90, minV: 42.5, standard: "802.3at"});
const thick = Drop.calculate({lengthM: 90, sourceV: 48, loadW: 25.5, awg: 23, pairs: 2, tempC: 45, contactOhm: 0.3, efficiency: 90, minV: 42.5, standard: "802.3at"});
check("engine 26 AWG", thin.remoteV === 37.87 && thin.dropV === 10.13, JSON.stringify({remoteV: thin.remoteV, dropV: thin.dropV}));
check("engine 23 AWG", thick.remoteV === 43.51 && thick.dropV === 4.49, JSON.stringify({remoteV: thick.remoteV, dropV: thick.dropV}));

for (const rel of articles) {
  const html = read(rel);
  check(rel + " one h1", (html.match(/<h1[\s>]/g) || []).length === 1);
  check(rel + " guide shell", html.includes('class="guide-shell"') && !html.includes("guide-related-side"));
  for (const id of ids) check(rel + " #" + id, html.includes('id="' + id + '"'));
  for (const value of numbers) check(rel + " " + value, html.includes(value));
  check(rel + " no fixed percent", fixedPercentBan.every(pattern => !pattern.test(html)));
  check(rel + " no private metrics", privateMetrics.every(value => !html.includes(value)));
  check(rel + " power link", /poe-power-budget-calculator/.test(html));
  check(rel + " voltage link", /poe-voltage-drop-calculator/.test(html));
  check(rel + " case links", html.includes("poe-switch-budget-16-versus-24-cameras") && html.includes("poe-voltage-after-90m"));
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  check(rel + " self canonical", Boolean(canonical) && html.includes(canonical));
  const langs = [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(match => match[1]);
  check(rel + " hreflang", ["en", "zh-CN", "es", "x-default"].every(lang => langs.includes(lang)), langs.join(","));
}

const toolPages = [
  ["website/tools/poe-power-budget-calculator/index.html", "guides/ip-camera-network-bandwidth-poe/", "454.74"],
  ["website/tools/poe-power-budget-calculator/zh/index.html", "zh/guides/ip-camera-network-bandwidth-poe/", "1 − 线缆损耗比例"],
  ["website/tools/poe-power-budget-calculator/es/index.html", "es/guides/ip-camera-network-bandwidth-poe/", "1 − fracción de pérdida"],
  ["website/tools/poe-voltage-drop-calculator/index.html", "guides/ip-camera-network-bandwidth-poe/", "37.87"],
  ["website/tools/poe-voltage-drop-calculator/zh/index.html", "zh/guides/ip-camera-network-bandwidth-poe/", "37.87"],
  ["website/tools/poe-voltage-drop-calculator/es/index.html", "es/guides/ip-camera-network-bandwidth-poe/", "37.87"]
];
for (const [rel, guide, marker] of toolPages) {
  const html = read(rel);
  check(rel + " guide link", html.includes(guide));
  check(rel + " marker", html.includes(marker));
  check(rel + " separates bandwidth", /Mbit\/s|吞吐量|ancho de banda/.test(html));
  const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  const langs = [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(match => match[1]);
  check(rel + " canonical", Boolean(canonical));
  check(rel + " hreflang", ["en", "zh-CN", "es", "x-default"].every(lang => langs.includes(lang)));
}

const planner = read("website/tools/ip-camera-network-planner/index.html");
check("planner coefficients frozen in page", planner.includes("h264:0.075,h265:0.045,mjpeg:0.24") && planner.includes("count*poe*1.25") && planner.includes("*1.2"));
for (const rel of [
  "website/tools/poe-power-budget-calculator/js/engine.js",
  "website/tools/poe-voltage-drop-calculator/js/engine.js",
  "website/tools/ip-camera-network-planner/index.html"
]) {
  const current = crypto.createHash("sha256").update(read(rel)).digest("hex");
  let head = "";
  try {
    head = require("child_process").execFileSync("git", ["show", "HEAD:" + rel], {cwd: root, encoding: "utf8"});
  } catch (error) {
    head = "";
  }
  const previous = crypto.createHash("sha256").update(head).digest("hex");
  check(rel + " frozen", current === previous);
}

const registry = JSON.parse(read("website/data/sitemap-routes.json"));
for (const id of ["guide-ip-camera-network-bandwidth-poe", "topic-ip-camera-network-bandwidth-poe"]) {
  const record = registry.routes.find(item => item.id === id);
  for (const locale of ["en", "zh", "es"]) {
    check(id + " " + locale, Boolean(record.translations[locale].title && record.translations[locale].description && record.searchIntent[locale] && record.longTailQuestions[locale].length === 1));
  }
}

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("PASS ip-camera poe seo content");
