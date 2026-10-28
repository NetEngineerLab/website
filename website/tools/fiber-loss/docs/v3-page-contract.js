#!/usr/bin/env node
"use strict";
/* Fiber Loss V3 page contract: fold skeleton, preserved DOM ids, and SEO policy.
   Does not execute the calculator. Engine bytes are pinned separately. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const engineHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "js/engine.js"))).digest("hex");
assert.strictEqual(engineHash, "817a8e83f75586651cbd469d96b10b1a39109958f0f3cc847e04b22d215c7f1a");

const pages = {
  en: { file: "index.html", robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1", canonical: "https://netengineerlab.com/tools/fiber-loss/", title: "Fiber Loss Calculator &amp; Optical Link Budget | NetEngineerLab" },
  zh: { file: "zh/index.html", robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1", canonical: "https://netengineerlab.com/tools/fiber-loss/zh/", title: "光纤链路损耗计算器 | Fiber Loss Calculator | NetEngineerLab" },
  es: { file: "es/index.html", robots: "index,follow,max-image-preview:large,max-snippet:-1", canonical: "https://netengineerlab.com/tools/fiber-loss/es/", title: "Pérdidas de fibra y presupuesto óptico | NetEngineerLab" }
};
const inputIds = ["preset","projectName","distance","wavelength","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","splitter1","splitter2","otherLoss","engineeringMargin","availableBudget","txPower","rxThreshold","calculateBtn","resetBtn"];
const resultIds = ["fiberLoss","spliceTotal","connectorTotal","splitterOtherTotal","fiberLossDiagram","spliceLossDiagram","connectorLossDiagram","physicalLoss","designLoss","budgetRemaining","estimatedRxPower","rxMargin","healthBadge","budgetRemainingText","diagnosisText","validationMessage","summaryCard","diagnosisBox","historyList","copyBtn","saveBtn","printBtn","clearHistoryBtn"];
const foldIds = ["scenarios","pon-toolkit","history","methodology","standards","references","faq","nel-tool-graph"];

for (const [locale, spec] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, spec.file), "utf8");
  assert.strictEqual((html.match(/<title>([^<]*)<\/title>/) || [])[1], spec.title, locale + " title");
  assert.ok(html.includes(`content="${spec.robots}" name="robots"`) || html.includes(`name="robots" content="${spec.robots}"`), locale + " robots");
  assert.ok(html.includes(`rel="canonical" href="${spec.canonical}"`), locale + " canonical");
  for (const lang of ["en", "zh-CN", "es", "x-default"]) {
    assert.ok(html.includes(`hreflang="${lang}"`), locale + " hreflang " + lang);
  }
  assert.ok(!/pages\.dev/.test(html), locale + " preview domain");
  assert.ok(!/noindex/.test(html), locale + " noindex");
  assert.strictEqual((html.match(/class="below"/g) || []).length, 1, locale + " below");
  assert.strictEqual((html.match(/<nav class="toc"/g) || []).length, 1, locale + " toc");
  assert.strictEqual((html.match(/class="prose"/g) || []).length, 1, locale + " prose");
  assert.strictEqual((html.match(/class="fb-fold blk"/g) || []).length, foldIds.length, locale + " folds");
  assert.ok(html.includes("nel-fieldbook"), locale + " fieldbook skin");
  assert.ok(html.includes("nel-opb-v3"), locale + " platform fieldbook shell");
  assert.ok(html.includes("assets/css/fieldbook.css"), locale + " shared fieldbook stylesheet");
  assert.ok(!html.includes("tool-detail-v3.css"), locale + " half-migrated shell removed");
  assert.ok(!html.includes("fb-v3.css"), locale + " must not use OPB stylesheet");
  assert.ok(!html.includes("optical-power-budget/css/"), locale + " must not link OPB assets");
  assert.strictEqual((html.match(/data-language-menu/g) || []).length, 1, locale + " one language menu");
  assert.ok(!html.includes('id="langToggle"'), locale + " no legacy toggle");
  const main = html.slice(html.indexOf('<main'), html.indexOf("</main>"));
  const below = html.slice(html.indexOf('class="below"'), html.indexOf("<!-- NEL_FOOTER_START -->"));
  for (const id of inputIds.concat(resultIds)) {
    assert.ok(html.includes(`id="${id}"`), locale + " missing #" + id);
  }
  for (const id of foldIds) {
    assert.ok(below.includes(`id="${id}"`), locale + " fold #" + id);
    assert.ok(below.includes(`href="#${id}"`), locale + " toc #" + id);
  }
  assert.ok(main.includes('id="calculator"'), locale + " workbench");
  assert.ok(html.indexOf('id="calculator"') < html.indexOf('class="below"'), locale + " workbench before folds");
  assert.strictEqual((html.match(/<!-- NEL_SCENARIOS_START -->/g) || []).length, 1);
  assert.strictEqual((html.match(/<!-- NEL_TOOL_GRAPH_START -->/g) || []).length, 1);
  assert.ok(html.includes('href="?scenario=gpon-bplus-20km-1x32#calculator"'));
}

console.log("Fiber loss V3 page contract: PASS");
