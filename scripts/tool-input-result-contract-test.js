"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function section(html, id) {
  const match = html.match(new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/section>`, "i"));
  assert(match, `missing section ${id}`);
  return match[0];
}

for (const locale of ["", "zh/", "es/"]) {
  const html = read(`website/tools/telecom-ac-dc-breaker-sizing/${locale}index.html`);
  const gates = section(html, "engineering-gates");
  const inputs = [...gates.matchAll(/<input\b[^>]*>/gi)].map(match => match[0]);
  assert(inputs.length >= 10, `${locale || "en"} breaker scenario inputs`);
  for (const input of inputs) {
    const id = input.match(/\bid="([^"]+)"/)[1];
    assert(new RegExp(`<label\\b[^>]*\\bfor="${id}"[^>]*>\\s*\\S`, "i").test(gates), `${locale || "en"} ${id} needs a visible label`);
    assert(!/\baria-label="[^"]*[A-Za-z]{12}/.test(input) || locale === "", `${locale || "en"} ${id} still uses an English aria-label`);
  }
}

const generatorCss = read("website/tools/generator-fuel-runtime-calculator/css/style.css");
assert(!generatorCss.includes("input, select, textarea{width:100%;border:0"), "bare generator inputs must not be forced to border 0");
assert(generatorCss.includes("border:1px solid #cbd7e6"), "generator inputs keep a visible border");
assert(read("website/assets/css/tool-design-system.css").includes("border-width: 1px !important"), "shared tool design system restores input borders");

const generatorEs = read("website/tools/generator-fuel-runtime-calculator/es/index.html");
assert(generatorEs.includes('id="beforeGeneratorCount"'));
assert(generatorEs.includes('id="afterGeneratorCount"'));
assert(generatorEs.includes('id="requiredGenerators"'));
assert(generatorEs.includes('id="startFailurePct"'));
for (const stale of ["beforeGeneradorCount", "afterGeneradorCount", "requiredGeneradors", "startFalloPct"]) {
  assert(!generatorEs.includes(stale), stale);
}

const generatorZh = read("website/tools/generator-fuel-runtime-calculator/zh/index.html");
assert(generatorZh.includes("改造前油机数"));
assert(generatorZh.includes("改造后油机数"));
assert(!generatorZh.includes(">Before generators"));

const generatorApp = read("website/tools/generator-fuel-runtime-calculator/js/app.js");
for (const phrase of [
  "L/día",
  "L/天",
  "Riesgo de acumulación húmeda",
  "Combustible antes / después",
  "Capacidad N-1 antes / después",
  "Los periodos de baja carga pueden crear riesgo de acumulación húmeda.",
  "改造前 / 改造后油耗",
  "改造前 / 改造后 N-1 容量",
  "低负载时段可能产生湿堆风险。"
]) {
  assert(generatorApp.includes(phrase), phrase);
}

const breakerApp = read("website/tools/telecom-ac-dc-breaker-sizing/js/app.js");
assert(breakerApp.includes("r.riskLevel"));
assert(breakerApp.includes("informativo"));
assert(breakerApp.includes("La capacidad del conductor"));
assert(!breakerApp.includes("${r.riskLevel}") || breakerApp.includes("level(riskValue)"), "risk output must be translated, not raw undefined");

const breaker = require(path.join(root, "website/tools/telecom-ac-dc-breaker-sizing/js/engine.js"));
const result = breaker.calculate({
  loadKW: 12,
  acVoltage: 230,
  phase: "1p",
  powerFactor: 0.95,
  efficiencyPct: 94,
  headroomPct: 25,
  deratingPct: 100,
  dcLoadA: 80,
  dcHeadroomPct: 25,
  growthPct: 20,
  conservativePct: 35
});
assert.equal(result.ok, true);
assert.equal(typeof result.riskLevel, "string");
assert.notEqual(result.riskLevel, "undefined");
assert.ok(["info", "low", "medium", "high", "critical"].includes(result.riskLevel));
assert.equal(result.summary.riskLevel, result.riskLevel);

const solarApp = read("website/tools/telecom-solar-battery-sizing-calculator/js/app.js");
assert(solarApp.includes("kWh/día"));
assert(solarApp.includes("kWh/天"));
assert(solarApp.includes('day:"kWh/day"'));
assert(!solarApp.includes('+ " kWh/day"') && !solarApp.includes("+ ' kWh/day'"));
assert(solarApp.includes("L/año"));
assert(solarApp.includes("L/年"));

const pueApp = read("website/tools/pue-data-center-energy-efficiency/js/app.js");
assert(pueApp.includes("Refrigeración"));
assert(pueApp.includes("制冷"));
assert(pueApp.includes("El PUE es inferior a 1."));

const upsApp = read("website/tools/ups-capacity-battery-runtime-calculator/js/app.js");
assert(upsApp.includes("Antes / después: carga de referencia"));
assert(upsApp.includes("改造前 / 改造后：基线与保守负载"));
assert(!upsApp.includes("Before / After："));

console.log("tool input result contract: PASS");
