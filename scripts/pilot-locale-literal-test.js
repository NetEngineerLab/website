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
console.log(`Pilot locale literal PASS. Unpublished drafts with the same damage markers: ${draftHits.length}. They stay outside website/.`);
