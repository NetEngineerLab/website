#!/usr/bin/env node
"use strict";
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const engine = require("../website/tools/subnet-calculator/js/engine.js");
const scenarios = require("../website/tools/subnet-calculator/js/scenarios.js");

const root = path.resolve(__dirname, "..");
const pilots = [
  ["subnet-calculator", "id", "Beranda", "Alat"],
  ["subnet-calculator", "pt-br", "Início", "Ferramentas"],
  ["bandwidth-calculator", "id", "Beranda", "Alat"],
  ["bandwidth-calculator", "pt-br", "Início", "Ferramentas"]
];
const damage = /mexp|Lagian|preHAR|30bat|hompers|semnoite|192\.168\.128|10,0\.0|Trigo de pão|PROYEK RECORDS/;
const formula = "2<sup>32\u2212p</sup>";

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
function resolveHref(pageUrl, href) {
  return new URL(href, pageUrl).pathname;
}
function crumbHrefs(html) {
  const nav = html.match(/<nav\b[^>]*\bclass\s*=\s*["'][^"']*\bcrumbs\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);
  assert.ok(nav, "body breadcrumb missing");
  return [...nav[0].matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(match => ({
    href: match[1],
    text: match[2].replace(/<[^>]+>/g, "").trim()
  }));
}

for (const [tool, locale, homeLabel, toolsLabel] of pilots) {
  const rel = `website/tools/${tool}/${locale}/index.html`;
  const html = read(rel);
  const pageUrl = `https://netengineerlab.com/tools/${tool}/${locale}/index.html`;
  const crumbs = crumbHrefs(html);
  assert.equal(crumbs[0].text, homeLabel, `${rel} home label`);
  const homePath = `/${locale}/`;
  const toolsPath = `/tools/${locale}/`;
  assert.equal(resolveHref(pageUrl, crumbs[0].href), homePath, `${rel} home href`);
  assert.equal(crumbs[1].text, toolsLabel, `${rel} tools label`);
  assert.equal(resolveHref(pageUrl, crumbs[1].href), toolsPath, `${rel} tools href`);
  const header = html.match(/<nav\b[^>]*\btool-return-nav\b[^>]*>[\s\S]*?<\/nav>/i)[0];
  const headerHrefs = [...header.matchAll(/\bhref\s*=\s*["']([^"']+)["']/g)].map(match => resolveHref(pageUrl, match[1]));
  assert.deepEqual(headerHrefs.slice(0, 2), [homePath, toolsPath], `${rel} header return nav`);
  assert.doesNotMatch(html, damage, `${rel} technical literal damage`);
}

for (const locale of ["id", "pt-br"]) {
  const html = read(`website/tools/subnet-calculator/${locale}/index.html`);
  assert.ok(html.includes(formula), `${locale} formula`);
  const expected = [...html.matchAll(/data-scenario-expected=""\s*>([^<]*)</g)].map(match => match[1]);
  assert.deepEqual(expected, locale === "id" ? [
    "192.168.10.128/26 · 192.168.10.129 – 192.168.10.190 · 62 dapat dipakai",
    "10.0.0.0/31 · 10.0.0.0 – 10.0.0.1 · 2 dapat dipakai",
    "172.16.0.0/22 · 172.16.0.1 – 172.16.3.254 · 1.022 dapat dipakai"
  ] : [
    "192.168.10.128/26 · 192.168.10.129 – 192.168.10.190 · 62 utilizáveis",
    "10.0.0.0/31 · 10.0.0.0 – 10.0.0.1 · 2 utilizáveis",
    "172.16.0.0/22 · 172.16.0.1 – 172.16.3.254 · 1.022 utilizáveis"
  ]);
}

const stable = {
  "website/tools/subnet-calculator/index.html": ["../../", "../"],
  "website/tools/subnet-calculator/zh/index.html": ["../../../zh/", "../../zh/"],
  "website/tools/subnet-calculator/es/index.html": ["../../../es/", "../../es/"],
  "website/tools/bandwidth-calculator/index.html": ["../../", "../"],
  "website/tools/bandwidth-calculator/zh/index.html": ["../../../zh/", "../../zh/"],
  "website/tools/bandwidth-calculator/es/index.html": ["../../../es/", "../../es/"]
};
for (const [rel, hrefs] of Object.entries(stable)) {
  const html = read(rel);
  assert.deepEqual(crumbHrefs(html).slice(0, 2).map(item => item.href), hrefs, `${rel} existing breadcrumb`);
  assert.doesNotMatch(html, damage, `${rel} existing page damage`);
}
assert.ok(read("website/tools/subnet-calculator/index.html").includes(formula), "English formula");
assert.equal(crumbHrefs(read("website/tools/application-bandwidth-analyzer/index.html"))[0].href, "../", "single tools crumb stays the tools directory");
for (const locale of ["id", "pt-br"]) {
  const html = read(`website/tools/bandwidth-calculator/${locale}/index.html`);
  const eq = html.match(/<div class="eq">([\s\S]*?)<\/div>/)[1];
  assert.match(eq, /÷/, `${locale} bandwidth operators`);
  assert.doesNotMatch(eq, /GNU|meragukan|data bits \./, `${locale} bandwidth equation damage`);
}
assert.match(read("website/tools/bandwidth-calculator/index.html"), /data_bits ÷ \(link_rate × efficiency × utilization\)/, "English bandwidth equation");
assert.match(read("website/tools/bandwidth-calculator/zh/index.html"), /有效业务速率 = 物理速率 × 业务载荷效率 × 允许利用率/, "Chinese bandwidth equation");
assert.match(read("website/tools/bandwidth-calculator/es/index.html"), /bits_de_datos ÷ \(caudal_enlace × eficiencia × utilización\)/, "Spanish bandwidth equation");

for (const locale of ["id", "pt-br"]) {
  assert.equal(fs.existsSync(path.join(root, "website", locale, "index.html")), true, `${locale} home`);
  assert.equal(fs.existsSync(path.join(root, "website", "tools", locale, "index.html")), true, `${locale} tools directory`);
  for (const route of ["about/", "contact/", "privacy/", "terms/"]) {
    assert.equal(fs.existsSync(path.join(root, "website", locale, route, "index.html")), true, `${locale} ${route}`);
  }
  for (const route of ["guides/", "topics/"]) {
    assert.equal(fs.existsSync(path.join(root, "website", locale, route, "index.html")), false, `${locale} ${route} stays unpublished`);
  }
}
for (const [tool, locale] of [["subnet-calculator", "id"], ["subnet-calculator", "pt-br"], ["bandwidth-calculator", "id"], ["bandwidth-calculator", "pt-br"]]) {
  const html = read(`website/tools/${tool}/${locale}/index.html`);
  const pageUrl = `https://netengineerlab.com/tools/${tool}/${locale}/index.html`;
  for (const href of html.match(/href="([^"]+)"/g).map(item => item.slice(6, -1))) {
    if (/^(https?:|mailto:|#|\?)/.test(href)) continue;
    const pathName = new URL(href, pageUrl).pathname;
    assert.doesNotMatch(pathName, /^\/guides\/(id|pt-br)\/|^\/topics\/(id|pt-br)\/|^\/(id|pt-br)\/(guides|topics)\//, `${tool}/${locale} must not link to an unpublished shell: ${pathName}`);
  }
  const footer = html.match(/<nav\b[^>]*\bsite-shell-footer-links\b[^>]*>[\s\S]*?<\/nav>/i)[0];
  const footerHrefs = [...footer.matchAll(/\bhref\s*=\s*["']([^"']+)["']/g)].map(match => resolveHref(pageUrl, match[1]));
  assert.deepEqual(footerHrefs, [`/${locale}/about/`, `/${locale}/contact/`, `/${locale}/privacy/`, `/${locale}/terms/`], `${tool}/${locale} footer`);
  const menu = html.match(/<!-- NEL_LANGUAGE_MENU_START -->([\s\S]*?)<!-- NEL_LANGUAGE_MENU_END -->/)[1];
  assert.match(menu, new RegExp(`href="/tools/${tool}/id/"[^>]*hreflang="id"`));
  assert.match(menu, new RegExp(`href="/tools/${tool}/pt-br/"[^>]*hreflang="pt-BR"`));
}
const linker = fs.readFileSync(path.join(root, "scripts/build-multilingual.js"), "utf8").match(/function linkedLocale\(route,locale\)\{[\s\S]*?\n\}/)[0];
assert.match(linker, /localePageExists\(route,locale\)\?locale:defaultLocale/);
assert.doesNotMatch(linker, /publishesRoute/);

const reference = {};
const loaded = {
  "office-vlan-26": ["192.168.10.128/26", "192.168.10.129", "192.168.10.190", "62"],
  "p2p-link-31": ["10.0.0.0/31", "10.0.0.0", "10.0.0.1", "2"],
  "summary-22": ["172.16.0.0/22", "172.16.0.1", "172.16.3.254", "1022"]
};
for (const [id, inputs] of Object.entries(scenarios.DATA.scenarios)) {
  const result = engine.analyzeIPv4(inputs.ipv4Address, inputs.ipv4Prefix, reference);
  assert.deepEqual([
    `${result.network}/${result.prefix}`,
    result.firstHost,
    result.lastHost,
    String(result.usableHosts)
  ], loaded[id], id);
}
const initial = engine.analyzeIPv4("192.168.10.130", 24, reference);
assert.equal(initial.cidr, "192.168.10.0/24");
assert.equal(initial.mask, "255.255.255.0");
assert.equal(String(initial.usableHosts), "254");
assert.equal(initial.broadcast, "192.168.10.255");

const newTools = [
  "fiber-latency-calculator",
  "ethernet-serialization-delay-calculator",
  "stp-path-cost-calculator",
  "chromatic-dispersion-calculator",
  "copper-propagation-delay-calculator"
];
const visibleEnglish = [
  "Maximum frame rate",
  "Residual CD",
  "Margin to tolerance",
  "Skip to calculator",
  "JavaScript is required",
  "On this page",
  "Delay snapshot",
  "Path snapshot",
  "How to use",
  "Worked examples",
  "Workflow complete",
  "Workflow start",
  "Step 1 of ",
  "Step 2 of ",
  "Reviewed engineering links",
  "L2 throughput at line rate",
  "Enter a whole number",
  "One-way length unit",
  "Pick a line rate"
];
for (const tool of newTools) {
  for (const locale of ["id", "pt-br"]) {
    const rel = `website/tools/${tool}/${locale}/index.html`;
    const html = read(rel);
    for (const phrase of visibleEnglish) assert.doesNotMatch(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${rel} still shows ${phrase}`);
    const cards = [...html.matchAll(/<a class="nel-tool-graph-card" href="([^"]+)"[^>]*>[\s\S]*?<strong>([^<]*)<\/strong>/g)];
    for (const [, href, name] of cards) {
      const localized = /\/(?:id|pt-br)\//.test(href);
      if (localized) assert.doesNotMatch(name, /\(English\)/, `${rel} localized card marked English: ${name}`);
      else assert.match(name, /\(English\)$/, `${rel} untranslated tool must stay explicit English: ${href}`);
    }
  }
}
assert.match(read("website/tools/ethernet-serialization-delay-calculator/id/index.html"), /Laju frame maksimum/);
assert.match(read("website/tools/ethernet-serialization-delay-calculator/pt-br/index.html"), /Taxa máxima de quadros/);
assert.match(read("website/tools/chromatic-dispersion-calculator/id/index.html"), />CD sisa</);
assert.match(read("website/tools/chromatic-dispersion-calculator/pt-br/index.html"), />CD residual</);
assert.match(read("website/tools/ethernet-serialization-delay-calculator/js/app.js"), /\["frameRate","Laju frame maksimum"\]/);
assert.match(read("website/tools/ethernet-serialization-delay-calculator/js/app.js"), /\["frameRate","Taxa máxima de quadros"\]/);
assert.match(read("website/tools/chromatic-dispersion-calculator/js/app.js"), /\["residualCd","CD sisa"\]/);
assert.match(read("website/tools/chromatic-dispersion-calculator/js/app.js"), /\["residualCd","CD residual"\]/);
assert.match(read("website/tools/fiber-latency-calculator/id/index.html"), /<span>Propagasi<\/span><b id="propagation">/);
assert.match(read("website/tools/fiber-latency-calculator/pt-br/index.html"), /<span>Propagação<\/span><b id="propagation">/);
assert.match(read("website/tools/fiber-latency-calculator/js/app.js"), /oneWay: "Latensi satu arah"/);
assert.match(read("website/tools/fiber-latency-calculator/js/app.js"), /oneWay: "Latência de ida"/);
assert.match(read("website/assets/js/tool-shell-v1.9.9-04.js"), /Lewati ke kalkulator/);
assert.match(read("website/assets/js/tool-shell-v1.9.9-04.js"), /Ir para a calculadora/);

const fiber = require("../website/tools/fiber-latency-calculator/js/engine.js");
const fiberBase = {
  distanceUnit: "km", routeFactor: 1, groupIndex: 1.468, equipmentCount: 0, equipmentDelay: 0,
  packetSize: 1500, linkRate: 10, serializationHops: 1
};
const fiber80 = fiber.calculate({...fiberBase, distance: 80});
const fiber100 = fiber.calculate({...fiberBase, distance: 100});
assert.equal(fiber80.oneWayText, "392.94 µs");
assert.equal(fiber80.propagationText, "391.74 µs");
assert.equal(fiber100.oneWayText, "490.87 µs");
assert.equal(fiber100.propagationText, "489.67 µs");
assert.ok(Math.abs(fiber80.oneWayUs - (fiber80.propagationUs + fiber80.serializationUs)) < 1e-9);
assert.notEqual(fiber80.oneWayText, fiber100.propagationText, "80 km one-way must not be compared with the 100 km propagation line");
for (const [locale, marker] of [["", "Maximum frame rate"], ["es", "Tasa máxima de tramas"], ["zh", "最大帧速率"]]) {
  const rel = locale
    ? `website/tools/ethernet-serialization-delay-calculator/${locale}/index.html`
    : "website/tools/ethernet-serialization-delay-calculator/index.html";
  assert.match(read(rel), new RegExp(marker), `${rel} existing language`);
}
for (const [locale, marker] of [["", "Residual CD"], ["es", "CD residual"], ["zh", "残余色散"]]) {
  const rel = locale
    ? `website/tools/chromatic-dispersion-calculator/${locale}/index.html`
    : "website/tools/chromatic-dispersion-calculator/index.html";
  assert.match(read(rel), new RegExp(marker), `${rel} existing language`);
}

const draftRoot = path.join(root, "drafts/locale-rollout");
const draftHits = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html") && damage.test(fs.readFileSync(full, "utf8"))) draftHits.push(path.relative(root, full));
  }
}
if (fs.existsSync(draftRoot)) walk(draftRoot);

const nextTools = [
  "shannon-capacity-calculator",
  "tcp-mathis-throughput-estimator",
  "mm1-queue-delay-calculator",
  "ethernet-line-coding-calculator",
  "dc-feeder-voltage-drop-calculator"
];
const residue = [
  "Load example", "How it is calculated", "Enter a value.", "Engineering workflow",
  "Related tools", "Copy result", "About and applicability", "Skip to calculator",
  "Content reviewed:", "This is an engineering approximation", "Workflow complete",
  "Workflow start", "Current workflow", "On this page", "Check the highlighted"
];
const kept = {
  "shannon-capacity-calculator": ["C = B log2(1+S/N)", "log2(101)", "AWGN", "SNR"],
  "tcp-mathis-throughput-estimator": ["MSS", "RTT", "RFC 6349", "√p"],
  "mm1-queue-delay-calculator": ["M/M/1", "ρ = λ/μ"],
  "ethernet-line-coding-calculator": ["8b/10b", "64b/66b", "10.3125"],
  "dc-feeder-voltage-drop-calculator": ["IEC 60028", "1/58"]
};
for (const tool of nextTools) {
  for (const locale of ["id", "pt-br"]) {
    const rel = `website/tools/${tool}/${locale}/index.html`;
    const html = read(rel);
    for (const phrase of residue) assert.ok(!html.includes(phrase), `${rel} still contains ${phrase}`);
    assert.match(html, locale === "id" ? /Jejak/ : /Trilha/, `${rel} breadcrumb label`);
    for (const literal of kept[tool]) assert.ok(html.includes(literal), `${rel} lost technical literal ${literal}`);
    for (const key of [...html.matchAll(/\bid="out-([^"]+)"/g)].map(match => match[1])) {
      assert.ok(html.includes(`id="lbl-${key}"`), `${rel} missing visible label for ${key}`);
    }
    assert.doesNotMatch(html, /value="(?:per detik|per menit|persen|porcentagem|Linier|Linear)"/, `${rel} translated an option value`);
    for (const card of html.matchAll(/<a class="nel-tool-graph-card" href="(\/tools\/[^"]+)">([\s\S]*?)<\/a>/g)) {
      assert.match(card[2], /\(English\)/, `${rel} unpublished ${card[1]} is not marked English`);
    }
    assert.match(read(`website/tools/${tool}/js/app.js`), /localizedCopy/, `${tool} clipboard labels`);
    assert.doesNotMatch(read(`website/tools/${tool}/js/engine.js`), /Masukkan|Informe um valor|Langkah|Etapa/, `${tool} engine locale text`);
  }
  assert.match(read(`website/tools/${tool}/index.html`), /Load example/, `${tool} English page`);
  assert.match(read(`website/tools/${tool}/es/index.html`), /lang="es"/, `${tool} Spanish page`);
  assert.match(read(`website/tools/${tool}/zh/index.html`), /lang="zh-CN"/, `${tool} Chinese page`);
}
const shannon = require("../website/tools/shannon-capacity-calculator/js/engine.js");
const shannonCase = shannon.calculate({ bandwidth: { value: 20, unit: "MHz" }, snr: 20, snrUnit: "dB" });
assert.equal(shannonCase.display.snrLinear, "100");
assert.ok(Math.abs(shannonCase.values.capacityBps - (20e6 * Math.log2(101))) < 1e-6);
assert.equal(shannon.calculate({ bandwidth: { value: 0, unit: "MHz" }, snr: 20, snrUnit: "dB" }).error, "bandwidth-range");
const mathis = require("../website/tools/tcp-mathis-throughput-estimator/js/engine.js");
const mathisCase = mathis.calculate({ mss: 1460, rtt: { value: 40, unit: "ms" }, loss: { value: 0.01, unit: "percent" }, link: { value: "", unit: "Mbps" } });
assert.equal(mathisCase.display.throughputMbps, "29.2");
assert.equal(mathis.calculate({ mss: 1460, rtt: { value: 0, unit: "ms" }, loss: { value: 0.01, unit: "percent" } }).error, "rtt-range");
const mm1 = require("../website/tools/mm1-queue-delay-calculator/js/engine.js");
const mm1Case = mm1.calculate({ arrival: { value: 800, unit: "per_s" }, service: { value: 1000, unit: "per_s" } });
assert.equal(mm1Case.display.utilization, "0.8");
assert.equal(mm1Case.display.sojournMs, "5");
assert.equal(mm1.calculate({ arrival: { value: 1000, unit: "per_s" }, service: { value: 800, unit: "per_s" } }).error, "unstable");
const line = require("../website/tools/ethernet-line-coding-calculator/js/engine.js");
assert.equal(line.calculate({ payload: { value: 10, unit: "Gbps" }, code: "64b66b" }).display.lineGbps, "10.3125");
assert.equal(line.calculate({ payload: { value: 0, unit: "Gbps" }, code: "64b66b" }).error, "payload-range");
const feeder = require("../website/tools/dc-feeder-voltage-drop-calculator/js/engine.js");
const feederCase = feeder.calculate({ voltage: 48, current: 1, length: { value: 58, unit: "m" }, area: { value: 1, unit: "mm2" }, temperature: 20, alpha: 0.00393, conductors: 1, rho20: 1 / 58 });
assert.equal(feederCase.display.resistanceOhm, "1");
assert.equal(feederCase.display.dropV, "1");
assert.equal(feeder.calculate({ voltage: 48, current: 0, length: { value: 58, unit: "m" }, area: { value: 1, unit: "mm2" }, temperature: 20, alpha: 0.00393, conductors: 1, rho20: 1 / 58 }).display.dropV, "0");
assert.equal(feeder.calculate({ voltage: 48, current: -1, length: { value: 58, unit: "m" }, area: { value: 1, unit: "mm2" }, temperature: 20, alpha: 0.00393, conductors: 1, rho20: 1 / 58 }).error, "current-range");
assert.match(read("website/tools/copper-propagation-delay-calculator/id/index.html"), /ethernet-line-coding-calculator\/id\//);
assert.match(read("website/tools/copper-propagation-delay-calculator/pt-br/index.html"), /ethernet-line-coding-calculator\/pt-br\//);
assert.match(read("website/tools/ethernet-serialization-delay-calculator/es/index.html"), /Tasa máxima de tramas/);
assert.match(read("website/tools/chromatic-dispersion-calculator/zh/index.html"), /残余色散/);

const batchTools = [
  "itu-dwdm-grid-calculator",
  "edfa-ase-osnr-estimator",
  "path-availability-calculator",
  "fiber-loss",
  "pmd-budget-calculator"
];
const batchKept = {
  "itu-dwdm-grid-calculator": ["G.694.1", "193.1", "299792458"],
  "edfa-ase-osnr-estimator": ["6.62607015", "OSNR", "193.1"],
  "path-availability-calculator": ["MTBF", "MTTR", "0.999999"],
  "fiber-loss": ["G.652", "0.35", "dB/km"],
  "pmd-budget-calculator": ["ps/√km", "10.3125", "G.652", "DGD"]
};
for (const tool of batchTools) {
  for (const locale of ["id", "pt-br"]) {
    const rel = `website/tools/${tool}/${locale}/index.html`;
    const html = read(rel);
    for (const phrase of residue) assert.ok(!html.includes(phrase), `${rel} still contains ${phrase}`);
    assert.match(html, locale === "id" ? /Jejak/ : /Trilha/, `${rel} breadcrumb label`);
    for (const literal of batchKept[tool]) assert.ok(html.includes(literal), `${rel} lost technical literal ${literal}`);
    for (const key of [...html.matchAll(/\bid="out-([^"]+)"/g)].map(match => match[1])) {
      assert.ok(html.includes(`id="lbl-${key}"`), `${rel} missing visible label for ${key}`);
    }
    for (const card of html.matchAll(/<a class="nel-tool-graph-card" href="(\/tools\/[^"]+)">([\s\S]*?)<\/a>/g)) {
      if (card[1].includes(`/${locale}/`)) assert.doesNotMatch(card[2], /\(English\)/, `${rel} locale ${card[1]} marked English`);
      else assert.match(card[2], /\(English\)/, `${rel} unpublished ${card[1]} is not marked English`);
    }
    assert.doesNotMatch(read(`website/tools/${tool}/js/engine.js`), /Masukkan|Informe um valor|Langkah|Etapa/, `${tool} engine locale text`);
  }
  assert.match(read(`website/tools/${tool}/index.html`), /lang="en"/, `${tool} English page`);
  assert.match(read(`website/tools/${tool}/es/index.html`), /lang="es"/, `${tool} Spanish page`);
  assert.match(read(`website/tools/${tool}/zh/index.html`), /lang="zh-CN"/, `${tool} Chinese page`);
  assert.doesNotMatch(read(`website/tools/${tool}/index.html`), /pilot-locale-toc\.css/, `${tool} English page linked the locale directory style`);
}
assert.match(read("website/tools/itu-dwdm-grid-calculator/js/app.js"), /localizedCopy/);
assert.match(read("website/tools/edfa-ase-osnr-estimator/js/app.js"), /localizedCopy/);
assert.match(read("website/tools/path-availability-calculator/js/app.js"), /localizedCopy/);
assert.match(read("website/tools/fiber-loss/index.html"), /FTTH Optical Link/);
assert.match(read("website/tools/pmd-budget-calculator/index.html"), /10G long-haul span/);
assert.match(read("website/tools/fiber-loss/es/index.html"), /lang="es"/);
assert.match(read("website/tools/pmd-budget-calculator/zh/index.html"), /lang="zh-CN"/);

const batch2Tools = [
  "pon-splitter-loss",
  "pon-distance",
  "poe-power-budget-calculator",
  "poe-voltage-drop-calculator",
  "pathway-fill-calculator"
];
const batch2Kept = {
  "pon-splitter-loss": ["G.984.2", "10 log10", "1:64"],
  "pon-distance": ["G.984.2", "dB/km", "1:8"],
  "poe-power-budget-calculator": ["802.3bt", "454.74", "15.4"],
  "poe-voltage-drop-calculator": ["37.87", "43.51", "0.393"],
  "pathway-fill-calculator": ["25.4", "10000", "D²"]
};
for (const tool of batch2Tools) {
  for (const locale of ["id", "pt-br"]) {
    const rel = `website/tools/${tool}/${locale}/index.html`;
    const html = read(rel);
    for (const phrase of residue) assert.ok(!html.includes(phrase), `${rel} still contains ${phrase}`);
    assert.match(html, locale === "id" ? /Jejak/ : /Trilha/, `${rel} breadcrumb label`);
    assert.match(html, /pilot-locale-toc\.css/, `${rel} locale directory style`);
    for (const literal of batch2Kept[tool]) assert.ok(html.includes(literal), `${rel} lost technical literal ${literal}`);
    for (const card of html.matchAll(/<a class="nel-tool-graph-card" href="(\/tools\/[^"]+)">([\s\S]*?)<\/a>/g)) {
      if (card[1].includes(`/${locale}/`)) assert.doesNotMatch(card[2], /\(English\)/, `${rel} locale ${card[1]} marked English`);
      else assert.match(card[2], /\(English\)/, `${rel} unpublished ${card[1]} is not marked English`);
    }
    assert.doesNotMatch(read(`website/tools/${tool}/js/engine.js`), /Masukkan|Informe um valor|Langkah|Etapa/, `${tool} engine locale text`);
  }
  assert.match(read(`website/tools/${tool}/index.html`), /lang="en"/, `${tool} English page`);
  assert.match(read(`website/tools/${tool}/es/index.html`), /lang="es"/, `${tool} Spanish page`);
  assert.match(read(`website/tools/${tool}/zh/index.html`), /lang="zh-CN"/, `${tool} Chinese page`);
  assert.doesNotMatch(read(`website/tools/${tool}/index.html`), /pilot-locale-toc\.css/, `${tool} English page linked the locale directory style`);
}
assert.match(read("website/tools/pon-splitter-loss/js/app.js"), /Kaskade splitter masih/);
assert.match(read("website/tools/pon-distance/js/app.js"), /Jarak rencana berada/);
assert.match(read("website/tools/poe-power-budget-calculator/js/app.js"), /Kapasitas cukup/);
assert.match(read("website/tools/poe-voltage-drop-calculator/js/app.js"), /Tegangan ujung jauh di bawah minimum/);
assert.match(read("website/tools/pathway-fill-calculator/js/app.js"), /useLabel/);
assert.match(read("website/tools/pon-splitter-loss/index.html"), /GPON C\+ 1:64 Splitter Design/);
assert.match(read("website/tools/pon-distance/index.html"), /PON Maximum Distance Design/);

console.log(`Pilot locale literal PASS. Unpublished drafts with the same damage markers: ${draftHits.length}. They stay outside website/.`);
