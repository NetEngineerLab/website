#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {repairPageLayout} = require("./lib/page-layout");
const {stableFileHash} = require("./stable-text-hash");

const root = path.resolve(__dirname, "..");
const siteRoot = path.join(root, "website");
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function walk(dir) {
  const output = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...walk(full));
    else output.push(full);
  }
  return output;
}

function loadsConsentScript(html) {
  return /<script\b[^>]*\bsrc\s*=\s*["'][^"']*cookie-consent\.js/i.test(html);
}

function linksConsentStylesheet(html) {
  return /<link\b[^>]*\bhref\s*=\s*["'][^"']*cookie-consent\.css/i.test(html);
}

function mainInner(html) {
  const match = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
  return match ? match[0] : "";
}

const fixture = `<!doctype html><html><head><title>Fixture</title></head><body><main class="tool-shell"><section class="input-panel card nel-tool-input"><button class="btn" id="calculate">Calculate</button></section></main><p class="hub-return">Forma parte de las calculadoras.</p><section class="panel" id="before-after-inputs"><input data-input id="beforeGeneradorCount" value="1"><input data-input id="afterGeneradorCount" value="2"></section><section class="panel"><input data-input id="ambientTempC"><input data-input id="requiredGeneradors"><input data-input id="startFalloPct"></section><script src="/assets/js/cookie-consent.js?v=1"></script></body></html>`;
const repaired = repairPageLayout(fixture, "tools/generator-fuel-runtime-calculator/es/index.html", {cookieCssHref: "/assets/css/cookie-consent.css?v=test"});
const repairedMain = mainInner(repaired);
assert(linksConsentStylesheet(repaired), "fixture: consent stylesheet must be added with the script");
assert(repairedMain.includes('id="before-after-inputs"'), "fixture: before/after inputs must move inside main");
assert(repairedMain.includes('id="ambientTempC"'), "fixture: derating inputs must move inside main");
assert(repairedMain.includes('id="beforeGeneratorCount"'), "fixture: Spanish before-generator id must match the calculator script");
assert(repairedMain.includes('id="afterGeneratorCount"'), "fixture: Spanish after-generator id must match the calculator script");
assert(repairedMain.includes('id="requiredGenerators"'), "fixture: required generator id must match the calculator script");
assert(repairedMain.includes('id="startFailurePct"'), "fixture: start-failure id must match the calculator script");
assert(repairedMain.includes('class="hub-return"'), "fixture: cluster line must move inside main");
assert(!/<\/main>[\s\S]*id="before-after-inputs"/i.test(repaired), "fixture: before/after section must not remain after main");
const calculateAt = repairedMain.indexOf('id="calculate"');
assert(calculateAt > repairedMain.indexOf('id="before-after-inputs"'), "fixture: moved inputs stay in the input card ahead of calculate");
const untouched = repairPageLayout(repaired, "tools/generator-fuel-runtime-calculator/es/index.html", {cookieCssHref: "/assets/css/cookie-consent.css?v=test"});
assert(untouched === repaired, "layout repair must be idempotent");
const noScript = repairPageLayout("<html><head></head><body><main></main></body></html>", "index.html", {cookieCssHref: "/assets/css/cookie-consent.css?v=test"});
assert(!linksConsentStylesheet(noScript), "pages without the consent script must not gain the stylesheet");

const consentSource = fs.readFileSync(path.join(siteRoot, "assets/js/cookie-consent.js"), "utf8");
assert(consentSource.includes("focus({preventScroll:true})"), "cookie banner focus must not scroll the page");
assert(!/querySelector\("\.nel-cookie-reject"\)\.focus\(\)/.test(consentSource), "decline button must not be focused without preventScroll");
const buildSource = fs.readFileSync(path.join(root, "scripts/build-multilingual.js"), "utf8");
assert(buildSource.includes("repairPageLayout"), "multilingual build must apply layout repairs");

const toolPages = ["", "zh/", "es/"].flatMap(locale => [
  `tools/generator-fuel-runtime-calculator/${locale}index.html`,
  `tools/telecom-ac-dc-breaker-sizing/${locale}index.html`
]);
for (const rel of toolPages) {
  const html = fs.readFileSync(path.join(siteRoot, rel), "utf8");
  const main = mainInner(html);
  assert(main, `${rel}: main element missing`);
  if (rel.includes("generator-fuel-runtime-calculator")) {
    for (const id of ["before-after-inputs", "beforeGeneratorCount", "afterGeneratorCount", "ambientTempC", "requiredGenerators", "startFailurePct"]) {
      assert(main.includes(`id="${id}"`), `${rel}: #${id} must be inside main`);
      assert(!html.slice(html.search(/<\/main>/i)).includes(`id="${id}"`), `${rel}: #${id} must not remain after </main>`);
    }
    assert(main.includes('class="hub-return"'), `${rel}: cluster line must sit inside main`);
  } else {
    assert(main.includes('id="engineering-gates"'), `${rel}: #engineering-gates must be inside main`);
    assert(!html.slice(html.search(/<\/main>/i)).includes('id="engineering-gates"'), `${rel}: #engineering-gates must not remain after </main>`);
    assert(main.includes('class="hub-return"'), `${rel}: cluster line must sit inside main`);
  }
}

const consentCssHash = stableFileHash(path.join(siteRoot, "assets/css/cookie-consent.css"), 12);
const consentJsHash = stableFileHash(path.join(siteRoot, "assets/js/cookie-consent.js"), 12);
let consentPages = 0;
for (const file of walk(siteRoot)) {
  if (!file.endsWith(".html") || file.includes(`${path.sep}templates${path.sep}`)) continue;
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file);
  const cssVersions = [...html.matchAll(/cookie-consent\.css(?:\?v=([^"'#\s]*))?/gi)].map(match => match[1] || "");
  const jsVersions = [...html.matchAll(/cookie-consent\.js(?:\?v=([^"'#\s]*))?/gi)].map(match => match[1] || "");
  if (!cssVersions.length && !jsVersions.length) continue;
  consentPages += 1;
  assert(cssVersions.length > 0 && jsVersions.length > 0, `${rel}: cookie consent css and js must be referenced together`);
  assert(cssVersions.every(version => version === consentCssHash), `${rel}: cookie-consent.css must use content hash ${consentCssHash}`);
  assert(jsVersions.every(version => version === consentJsHash), `${rel}: cookie-consent.js must use content hash ${consentJsHash}`);
}
assert(consentPages > 40, `expected the consent assets on the published page set, found ${consentPages}`);
const sampleWorker = fs.readFileSync(path.join(siteRoot, "tools/subnet-calculator/sw.js"), "utf8");
assert(sampleWorker.includes(`../../assets/css/cookie-consent.css?v=${consentCssHash}`), "service worker cache must name cookie-consent.css by content hash");
assert(sampleWorker.includes(`../../assets/js/cookie-consent.js?v=${consentJsHash}`), "service worker cache must name cookie-consent.js by content hash");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Layout regression PASS (${consentPages} consent pages, ${toolPages.length} tool pages)`);
