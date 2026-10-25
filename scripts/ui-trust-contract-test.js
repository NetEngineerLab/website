#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert/strict");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "website");
const catalog = JSON.parse(fs.readFileSync(path.join(site, "data/tools-catalog.json"), "utf8"));
const active = catalog.filter(tool => tool.status === "active");
const countFor = locale => active.filter(tool => locale === "en" || Boolean(tool.translations?.[locale])).length;

function read(rel) {
  const file = path.join(root, rel);
  assert.ok(fs.existsSync(file), `${rel} must exist`);
  return fs.readFileSync(file, "utf8");
}

const banned = [/MIB\/OID/i, /fault cases/i, /故障案例/, /casos de fallo/i];
for (const rel of ["website/about/index.html", "website/zh/about/index.html", "website/es/about/index.html"]) {
  const html = read(rel);
  assert.match(html, /"@type"\s*:\s*"AboutPage"/, `${rel}: AboutPage JSON-LD`);
  assert.match(html, /rel="canonical"/, `${rel}: canonical`);
  assert.match(html, /hreflang="en"/, `${rel}: hreflang en`);
  assert.match(html, /hreflang="zh-CN"/, `${rel}: hreflang zh`);
  assert.match(html, /hreflang="es"/, `${rel}: hreflang es`);
  assert.match(html, /netengineerlab@outlook\.com/, `${rel}: published contact address`);
  for (const pattern of banned) assert.doesNotMatch(html, pattern, `${rel}: banned phrase ${pattern}`);
  assert.doesNotMatch(html, /\b20\s+(?:bilingual\s+)?tools\b/i, `${rel}: stale tool count`);
}


for (const [rel, locale] of [["website/tools/index.html","en"],["website/tools/zh/index.html","zh"],["website/tools/es/index.html","es"]]) {
  const html = read(rel);
  assert.match(html, /data-tool-count/, `${rel}: tools directory count marker`);
  const found = [...html.matchAll(/<(?:strong|span|b)\b[^>]*\bdata-tool-count\b[^>]*>\s*(\d+)\s*</gi)].map(m => m[1]);
  assert.ok(found.length > 0, `${rel}: tool count value`);
  for (const value of found) assert.equal(value, String(countFor(locale)), `${rel}: directory count ${value}`);
}

const marker = /<(?:strong|span|b)\b[^>]*\bdata-(?:tool-count|localized-tool-count)\b[^>]*>\s*(\d+)\s*</gi;
const countPages = [
  ["website/index.html", "en"],
  ["website/zh/index.html", "zh"],
  ["website/es/index.html", "es"],
  ["website/about/index.html", "en"],
  ["website/zh/about/index.html", "zh"],
  ["website/es/about/index.html", "es"],
  ["website/terms/index.html", "en"],
  ["website/zh/terms/index.html", "zh"]
];
for (const [rel, locale] of countPages) {
  const html = read(rel);
  const expected = String(countFor(locale));
  const found = [...html.matchAll(marker)].map(match => match[1]);
  assert.ok(found.length > 0, `${rel}: tool count marker`);
  for (const value of found) assert.equal(value, expected, `${rel}: marker ${value} != ${expected}`);
  assert.doesNotMatch(html, /Filter\s+40|37 ENGINEERING|20个工具|20 bilingual/i, `${rel}: stale baked count`);
}

const hero = read("website/assets/images/network-topology-hero.svg");
assert.doesNotMatch(hero, /37|ENGINEERING TOOLS|NETWORK TOPOLOGY|ONLINE/i, "hero svg must not bake a count or English caption");

const hubs = [
  "pon-fiber-calculators",
  "switching-bandwidth-calculators",
  "datacenter-power-calculators"
];
for (const slug of hubs) {
  for (const rel of [
    `website/tools/${slug}/index.html`,
    `website/tools/${slug}/zh/index.html`,
    `website/tools/${slug}/es/index.html`
  ]) {
    const html = read(rel);
    assert.match(html, /assets\/css\/site\.css/, `${rel}: site stylesheet`);
    assert.match(html, /calculator-hub\.css/, `${rel}: hub stylesheet`);
  }
}
assert.match(read("website/assets/css/calculator-hub.css"), /font-family:\s*var\(--nel-font-family/, "hub stylesheet sets the site font");

for (const rel of [
  "website/tools/fiber-latency-calculator/index.html",
  "website/tools/fiber-latency-calculator/zh/index.html"
]) {
  const html = read(rel);
  const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(match => match[1].replace(/<[^>]+>/g, ""));
  const workflow = headings.filter(text => /Continue the .+ workflow/i.test(text) || /继续.+工作流/.test(text) || /继续下一步工程任务/.test(text));
  assert.equal(workflow.length, 1, `${rel}: one workflow heading, got ${JSON.stringify(workflow)}`);
}
const esLatency = read("website/tools/fiber-latency-calculator/es/index.html");
assert.match(esLatency, /Continuar el flujo de latencia de fibra/, "Spanish fiber latency keeps its only workflow section");
const esLoss = read("website/tools/fiber-loss/es/index.html");
assert.match(esLoss, /aria-label="Paso \d+ de \d+"/, "Spanish workflow progress keeps its step label");
assert.doesNotMatch(esLoss, /aria-label="Progress"/, "Spanish workflow progress must not fall back to Progress");

const progressPages = [
  "website/tools/fiber-latency-calculator/index.html",
  "website/tools/fiber-latency-calculator/zh/index.html",
  "website/tools/fiber-loss/es/index.html"
];
for (const rel of progressPages) {
  const html = read(rel);
  if (!html.includes("nel-workflow-progress")) continue;
  assert.match(html, /class="[^"]*nel-workflow-progress[^"]*"[^>]*role="progressbar"/, `${rel}: progressbar role`);
  assert.match(html, /nel-workflow-progress[^>]*aria-label="/, `${rel}: progressbar needs an accessible name`);
}

const latencyJs = read("website/tools/fiber-latency-calculator/js/app.js");
assert.match(latencyJs, /function clearResults\(/);
assert.match(latencyJs, /if\s*\(!result\.ok\)\{\s*clearResults\(\)/);
const lossJs = read("website/tools/fiber-loss/js/app.js");
assert.match(lossJs, /function clearInvalidResult\(/);
assert.match(lossJs, /clearInvalidResult\(values\)/);

console.log(`UI trust contract PASS (${countFor("en")} active tools)`);
