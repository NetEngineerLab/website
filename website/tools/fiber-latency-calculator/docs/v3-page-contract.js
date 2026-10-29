#!/usr/bin/env node
"use strict";
/* Fiber Latency V3 page contract: OPB public skeleton, preserved DOM ids, SEO.
   Does not execute the calculator. Engine bytes are pinned separately. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const engineHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "js/engine.js"))).digest("hex");
assert.strictEqual(engineHash, "11269b52819a4b507b567b6a2ee94d2069cb00d7cb0831cbfe19bd07b4d5df12");

const pages = {
  en: {
    file: "index.html",
    robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    canonical: "https://netengineerlab.com/tools/fiber-latency-calculator/",
    title: "Fiber Latency Calculator – µs per km, One-Way &amp; RTT",
    css: "../optical-power-budget/css/"
  },
  zh: {
    file: "zh/index.html",
    robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    canonical: "https://netengineerlab.com/tools/fiber-latency-calculator/zh/",
    title: "光纤时延计算器｜每公里时延、单向与往返RTT",
    css: "../../optical-power-budget/css/"
  },
  es: {
    file: "es/index.html",
    robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    canonical: "https://netengineerlab.com/tools/fiber-latency-calculator/es/",
    title: "Calculadora de latencia de fibra – µs por km, ida y RTT",
    css: "../../optical-power-budget/css/"
  }
};
const inputIds = ["projectName","distance","distanceUnit","routeFactor","groupIndexPreset","groupIndex","equipmentCount","equipmentDelay","packetSize","linkRate","serializationHops","calculateBtn","resetBtn","validationMessage"];
const resultIds = ["oneWay","rtt","fiberLength","propagation","equipment","serialization","usPerKm","speed","fractionC","versusVacuum","comparisonBody","summaryCard","copyBtn","saveBtn","printBtn","clearHistoryBtn","historyList","mbar-val"];
const blocks = ["about-scope","methodology","faq","history","references","content-review","nel-tool-graph"];
const classes = ["fb-panel","readout","scenario-section","class=\"below\"","class=\"toc\"","class=\"prose\"","fb-fold","fb-fold-sum","fb-fold-title","fb-fold-body","method-defs","class=\"blk faq\"","ref-card","review-grid"];

for (const [locale, spec] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, spec.file), "utf8");
  assert.strictEqual((html.match(/<title>([^<]*)<\/title>/) || [])[1], spec.title, locale + " title");
  assert.ok(html.includes(`name="robots" content="${spec.robots}"`), locale + " robots");
  assert.ok(html.includes(`rel="canonical" href="${spec.canonical}"`), locale + " canonical");
  for (const lang of ["en", "zh-CN", "es", "x-default"]) {
    assert.ok(html.includes(`hreflang="${lang}"`), locale + " hreflang " + lang);
  }
  assert.ok(!/pages\.dev/.test(html), locale + " preview domain");
  assert.ok(!/noindex/.test(html), locale + " noindex");
  assert.ok(html.includes("nel-tool-detail-page nel-opb-v3 has-mbar v3"), locale + " body skeleton");
  assert.ok(html.includes(spec.css + "fb.css?v=2a31994efa84"), locale + " fb.css");
  assert.ok(html.includes(spec.css + "fb-v3.css?v=52fefac6ca20"), locale + " fb-v3.css");
  assert.ok(html.includes(spec.css + "fb-v3-prod.css?v=385403578979"), locale + " fb-v3-prod.css");
  assert.ok(!html.includes("css/style.css"), locale + " old local skin unlinked");
  assert.ok(!html.includes("method-grid"), locale + " old method-grid");
  assert.ok(!html.includes("form-grid"), locale + " old form-grid");
  for (const name of classes) assert.ok(html.includes(name), locale + " missing " + name);
  assert.strictEqual((html.match(/class="below"/g) || []).length, 1, locale + " below");
  assert.strictEqual((html.match(/<nav class="toc"/g) || []).length, 1, locale + " toc");
  assert.strictEqual((html.match(/class="prose"/g) || []).length, 1, locale + " prose");
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const below = html.slice(html.indexOf('class="below"'), html.indexOf("<!-- NEL_FOOTER_START -->"));
  for (const id of inputIds.concat(resultIds)) {
    assert.strictEqual((html.match(new RegExp(`id="${id}"`, "g")) || []).length, 1, locale + " #" + id);
  }
  for (const id of blocks) {
    assert.ok(below.includes(`id="${id}"`), locale + " block #" + id);
    assert.ok(below.includes(`href="#${id}"`), locale + " toc #" + id);
  }
  assert.ok(main.includes('id="calculator"'), locale + " workbench");
  assert.ok(html.indexOf('id="calculator"') < html.indexOf('class="below"'), locale + " workbench before folds");
  assert.ok(!html.includes('id="txPower"') && !html.includes("engineering margin"), locale + " no OPB power fields");
}
assert.ok(fs.readFileSync(path.join(root, "es/index.html"), "utf8").includes("Continuar el flujo de latencia de fibra"));
assert.ok(fs.readFileSync(path.join(root, "index.html"), "utf8").includes("Continue the engineering workflow"));
assert.ok(fs.readFileSync(path.join(root, "zh/index.html"), "utf8").includes("继续下一步工程任务"));

console.log("Fiber latency V3 page contract: PASS");
console.log("engine sha256", engineHash);
