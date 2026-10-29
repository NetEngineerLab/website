#!/usr/bin/env node
"use strict";
/* Chromatic Dispersion V3 page contract: OPB public skeleton, preserved DOM ids, SEO.
   Parses the three locale documents. Does not execute the calculator.
   Engine bytes are pinned separately. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const engineHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "js/engine.js"))).digest("hex");
assert.strictEqual(engineHash, "72ef42125dcb2633e67704df6b17c9330c4f704454e1c6e6a2b8eed7cafd2c6c");

const VOID = new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]);
const RAW = new Set(["script","style"]);

function parseAttrs(raw) {
  const attrs = {};
  const re = /([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(raw))) {
    attrs[m[1]] = m[2] != null ? m[2] : m[3] != null ? m[3] : m[4] != null ? m[4] : "";
  }
  return attrs;
}

function parseDocument(html) {
  const rootEl = { tag: "#root", attrs: {}, children: [] };
  const stack = [rootEl];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)([^>]*)>/g;
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    const parent = stack[stack.length - 1];
    const text = html.slice(last, m.index);
    if (text.trim()) parent.children.push({ text });
    last = re.lastIndex;
    if (m[0].startsWith("<!--")) continue;
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const attrs = parseAttrs(m[3].replace(/\/\s*$/, ""));
    const node = { tag, attrs, children: [] };
    parent.children.push(node);
    const selfClose = /\/\s*$/.test(m[3]) || VOID.has(tag);
    if (!selfClose) {
      stack.push(node);
      if (RAW.has(tag)) {
        const end = new RegExp("<\\/" + tag + "\\s*>", "i");
        const rest = html.slice(last);
        const found = end.exec(rest);
        if (found) {
          node.children.push({ text: rest.slice(0, found.index) });
          last = last + found.index + found[0].length;
          re.lastIndex = last;
          stack.pop();
        }
      }
    }
  }
  return rootEl;
}

function elements(node) {
  return (node.children || []).filter((child) => child.tag);
}
function cls(node) {
  return new Set(String(node.attrs.class || "").split(/\s+/).filter(Boolean));
}
function has(node, name) {
  return cls(node).has(name);
}
function findAll(node, pred, out = []) {
  if (node.tag && pred(node)) out.push(node);
  for (const child of node.children || []) {
    if (child.tag) findAll(child, pred, out);
  }
  return out;
}
function one(nodes, label) {
  assert.strictEqual(nodes.length, 1, label + " count " + nodes.length);
  return nodes[0];
}
function childTags(node) {
  return elements(node).map((el) => el.tag + (el.attrs.id ? "#" + el.attrs.id : "") + (el.attrs.class ? "." + String(el.attrs.class).split(/\s+/).filter(Boolean).join(".") : ""));
}

const pages = {
  en: {
    file: "index.html",
    robots: "index,follow,max-image-preview:large,max-snippet:-1",
    canonical: "https://netengineerlab.com/tools/chromatic-dispersion-calculator/",
    title: "Chromatic Dispersion Calculator – ps/nm, G.652 D(λ) &amp; CD Limit",
    css: "../optical-power-budget/css/",
    assets: "../../assets/",
    js: ""
  },
  zh: {
    file: "zh/index.html",
    robots: "index,follow,max-image-preview:large,max-snippet:-1",
    canonical: "https://netengineerlab.com/tools/chromatic-dispersion-calculator/zh/",
    title: "色散计算器｜G.652 色散系数、累积色散与色散受限距离",
    css: "../../optical-power-budget/css/",
    assets: "../../../assets/",
    js: "../"
  },
  es: {
    file: "es/index.html",
    robots: "index,follow,max-image-preview:large,max-snippet:-1",
    canonical: "https://netengineerlab.com/tools/chromatic-dispersion-calculator/es/",
    title: "Calculadora de dispersión cromática – ps/nm, D(λ) G.652 y límite",
    css: "../../optical-power-budget/css/",
    assets: "../../../assets/",
    js: "../"
  }
};
const inputIds = ["projectName","mode","wavelength","lambda0","s0","manualD","lengthKm","compensation","tolerance","spectralWidth","calculateBtn","resetBtn","validationMessage"];
const resultIds = ["residualCd","cdMargin","dCoef","fiberCd","maxLength","broadening","usedPct","healthBadge","summaryCard","copyBtn","saveBtn","printBtn","clearHistoryBtn","historyList","mbar-val","mbar-status"];
const blocks = ["about-scope","methodology","examples","limits","faq","history","references","content-review","nel-tool-graph"];

for (const [locale, spec] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, spec.file), "utf8");
  const doc = parseDocument(html);
  const title = one(findAll(doc, (el) => el.tag === "title"), locale + " title");
  assert.strictEqual((title.children.find((c) => c.text) || {}).text, spec.title, locale + " title");
  const robots = one(findAll(doc, (el) => el.tag === "meta" && el.attrs.name === "robots"), locale + " robots");
  assert.strictEqual(robots.attrs.content, spec.robots, locale + " robots");
  assert.ok(!/noindex/.test(robots.attrs.content), locale + " production robots stay indexable");
  const theme = one(findAll(doc, (el) => el.tag === "meta" && el.attrs.name === "theme-color"), locale + " theme-color");
  assert.strictEqual(theme.attrs.content, "#176ff2", locale + " theme-color");
  const canonical = one(findAll(doc, (el) => el.tag === "link" && el.attrs.rel === "canonical"), locale + " canonical");
  assert.strictEqual(canonical.attrs.href, spec.canonical, locale + " canonical");
  for (const lang of ["en", "zh-CN", "es", "x-default"]) {
    const alt = findAll(doc, (el) => el.tag === "link" && el.attrs.rel === "alternate" && el.attrs.hreflang === lang);
    assert.strictEqual(alt.length, 1, locale + " hreflang " + lang);
  }
  assert.ok(!/pages\.dev/.test(html), locale + " preview domain");
  const sheets = findAll(doc, (el) => el.tag === "link" && el.attrs.rel === "stylesheet").map((el) => el.attrs.href);
  for (const file of ["fb.css?v=2a31994efa84", "fb-v3.css?v=52fefac6ca20", "fb-v3-prod.css?v=385403578979"]) {
    assert.ok(sheets.includes(spec.css + file), locale + " " + file);
  }
  assert.ok(sheets.includes(spec.assets + "css/tool-layout.css?v=dfdd771763d6"), locale + " tool-layout");
  assert.ok(!sheets.some((href) => /style\.css|fieldbook\.css|tool-detail-v3\.css/.test(href)), locale + " no parallel skin");
  assert.ok(sheets.some((href) => href.includes("fb-v3.css?v=52fefac6ca20")), locale + " fb-v3.css");
  assert.ok(sheets.some((href) => href.includes("fb-v3-prod.css?v=385403578979")), locale + " fb-v3-prod.css");
  const scripts = findAll(doc, (el) => el.tag === "script" && el.attrs.src).map((el) => el.attrs.src);
  assert.ok(!scripts.some((src) => src.includes("tool-detail-v3.js")), locale + " folds stay closed without the opener");
  assert.ok(scripts.some((src) => src.endsWith("js/engine.js")), locale + " engine.js");
  assert.ok(scripts.some((src) => src.startsWith(spec.js + "js/app.js?v=")), locale + " app.js");

  const body = one(findAll(doc, (el) => el.tag === "body"), locale + " body");
  for (const name of ["nel-tool-detail-page", "nel-opb-v3", "has-mbar", "v3"]) {
    assert.ok(has(body, name), locale + " body." + name);
  }
  assert.ok(!has(body, "nel-tool-v3"), locale + " folds are not auto-opened");

  const hero = one(findAll(doc, (el) => el.tag === "section" && has(el, "hero") && has(el, "nel-tool-hero")), locale + " hero");
  assert.strictEqual(hero.attrs["aria-hidden"], "true", locale + " hero aria-hidden");
  const heroInner = one(elements(hero), locale + " hero-inner");
  assert.ok(heroInner.tag === "div" && has(heroInner, "hero-inner"), locale + " hero-inner");
  const heroKids = elements(heroInner);
  assert.deepStrictEqual(heroKids.map((el) => el.tag + (el.attrs.class ? "." + el.attrs.class.split(/\s+/)[0] : "")), ["p.eyebrow", "h1", "p", "div.hero-tags"], locale + " hero children");
  assert.ok(elements(heroKids[3]).length >= 1 && elements(heroKids[3]).every((el) => el.tag === "span"), locale + " hero tags");
  assert.strictEqual(findAll(hero, (el) => el.tag === "h1").length, 1, locale + " one hero h1");

  const main = one(findAll(doc, (el) => el.tag === "main"), locale + " main");
  assert.strictEqual(main.attrs.id, "calculator", locale + " main id");
  for (const name of ["tool-shell", "nel-tool-main", "nel-tool-grid", "nel-tool-primary-grid"]) {
    assert.ok(has(main, name), locale + " main." + name);
  }
  const mainKids = elements(main);
  const mainShape = mainKids.map((el) => {
    if (has(el, "nel-tool-input")) return "input";
    if (has(el, "nel-tool-result")) return "result";
    if (has(el, "tool-head")) return "tool-head";
    if (has(el, "scenario-section")) return "scenario";
    if (has(el, "mbar")) return "mbar";
    if (has(el, "below")) return "below";
    return el.tag + "." + (el.attrs.class || "");
  });
  assert.deepStrictEqual(mainShape, ["input", "result", "tool-head", "scenario", "mbar", "below"], locale + " main order " + mainShape.join(","));

  const panel = one(elements(mainKids[0]), locale + " fb-panel");
  assert.ok(has(panel, "fb-panel"), locale + " fb-panel");
  const panelKids = elements(panel).map((el) => [...cls(el)][0]);
  assert.deepStrictEqual(panelKids, ["panel-h", "fs", "panel-f"], locale + " panel parts");
  const fields = findAll(panel, (el) => el.tag === "div" && has(el, "fields"));
  assert.ok(fields.length >= 3, locale + " fields groups");
  for (const group of fields) {
    for (const field of elements(group)) {
      assert.ok(has(field, "f"), locale + " .f");
      const bits = elements(field).map((el) => el.tag + (el.attrs.class ? "." + el.attrs.class.split(/\s+/)[0] : ""));
      assert.ok(bits[0] === "label" && bits[1] === "div.inp", locale + " field " + bits.join(","));
      assert.ok(field.attrs.class === "f" || field.attrs.class === "f f-wide", locale + " field class");
    }
  }
  const align = elements(findAll(doc, (el) => el.tag === "head")[0]).find((el) => el.tag === "style");
  assert.ok(align, locale + " alignment style");
  const css = align.children.map((c) => c.text || "").join("");
  assert.ok(css.includes("grid-template-rows:subgrid") && css.includes("grid-row:span 3"), locale + " field subgrid");
  assert.ok(css.includes(".fields>.f[hidden]{display:none}"), locale + " hidden fields stay hidden");
  assert.strictEqual(findAll(doc, (el) => el.attrs.id === "references-title").length, 1, locale + " references title");
  assert.ok(css.includes("grid-template-columns:repeat(3,minmax(0,1fr))"), locale + " three-column actions");
  assert.ok(css.includes("overflow-wrap:anywhere"), locale + " mobile result wrap");

  const result = mainKids[1];
  assert.strictEqual(result.attrs.id, "result", locale + " result id");
  assert.ok(result.attrs["aria-live"] === "polite", locale + " result live");
  const readout = one(elements(result), locale + " readout");
  assert.ok(has(readout, "readout"), locale + " readout");
  const readoutNames = elements(readout).map((el) => [...cls(el)][0]);
  assert.deepStrictEqual(readoutNames.slice(0, 2), ["ro-h", "ro-l1"], locale + " readout head");
  assert.ok(readoutNames.includes("grp") && readoutNames[readoutNames.length - 1] === "ro-acts", locale + " readout tail");
  const acts = elements(readout).find((el) => has(el, "ro-acts"));
  const buttons = elements(acts);
  assert.deepStrictEqual(buttons.map((el) => el.tag + "#" + el.attrs.id), ["button#copyBtn", "button#saveBtn", "button#printBtn"], locale + " actions");

  const below = mainKids[5];
  const belowKids = elements(below);
  assert.ok(belowKids[0].tag === "nav" && has(belowKids[0], "toc"), locale + " toc");
  assert.ok(belowKids[1].tag === "div" && has(belowKids[1], "prose"), locale + " prose");
  const proseIds = new Set(findAll(belowKids[1], (el) => el.attrs.id).map((el) => el.attrs.id));
  const tocHrefs = new Set(findAll(belowKids[0], (el) => el.tag === "a").map((el) => el.attrs.href));
  for (const id of blocks) {
    assert.ok(proseIds.has(id), locale + " prose #" + id);
    assert.ok(tocHrefs.has("#" + id), locale + " toc #" + id);
  }

  const ids = findAll(doc, (el) => el.attrs.id).map((el) => el.attrs.id);
  for (const id of inputIds.concat(resultIds)) {
    assert.strictEqual(ids.filter((value) => value === id).length, 1, locale + " #" + id);
  }
  assert.ok(!ids.includes("txPower"), locale + " no OPB power fields");
  assert.ok(!/method-grid|form-grid|fieldbook\.css|nel-fieldbook|css\/style\.css/.test(html), locale + " old layout");
  assert.ok(html.indexOf('id="calculator"') < html.indexOf('class="below"'), locale + " workbench before folds");
  assert.ok(html.indexOf('class="below"') < html.indexOf("</main>"), locale + " folds inside main");
  const modes = findAll(doc, (el) => el.tag === "button" && el.attrs["data-mode"]).map((el) => el.attrs["data-mode"]);
  assert.ok(modes.includes("model") && modes.includes("manual"), locale + " coefficient cards");
}

const foldCss = fs.readFileSync(path.join(root, "../optical-power-budget/css/fb-v3.css"), "utf8");
assert.ok(/body\.v3 \.below > \.toc\{\s*display:none;/.test(foldCss), "mobile TOC hidden in OPB V3 CSS");
assert.ok(foldCss.includes("@media (min-width:961px)") && foldCss.includes("@media (max-width:768px)"), "desktop TOC and mobile fold breakpoints");
for (const file of ["index.html", "zh/index.html", "es/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(!/<details class="fb-fold[^"]*" id="[^"]+"[^>]*\sopen[\s>]/.test(html), file + " folds default closed");
}

const esHtml = fs.readFileSync(path.join(root, "es/index.html"), "utf8");
assert.ok(esHtml.includes("Continuar el flujo de dispersión cromática"));
assert.ok(esHtml.includes('class="content-section nel-tool-graph"'));
assert.ok(esHtml.includes("nel-tool-graph-related"));
assert.ok(esHtml.includes('aria-label="Paso 2 de 3"'));
assert.ok(esHtml.includes('href="../../fiber-loss/es/"'));
assert.ok(esHtml.includes('href="../../pmd-budget-calculator/es/"'));
assert.ok(esHtml.includes('href="../../optical-power-budget/es/"'));
assert.ok(esHtml.includes('href="../../sfp-qsfp-compatibility-calculator/es/"'));
assert.ok(fs.readFileSync(path.join(root, "index.html"), "utf8").includes("Continue the engineering workflow"));
assert.ok(fs.readFileSync(path.join(root, "zh/index.html"), "utf8").includes("继续下一步工程任务"));

console.log("Chromatic dispersion V3 page contract: PASS");
console.log("engine sha256", engineHash);
