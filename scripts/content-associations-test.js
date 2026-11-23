#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {readData, fileFor, linksFor, relHref, START, END} = require("./build-content-associations");

const root = path.resolve(__dirname, "..");
let failed = 0;

function check(name, ok, detail) {
  if (!ok) {
    failed += 1;
    console.error("FAIL", name, detail || "");
  }
}

function decode(value) {
  return String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function h1(file) {
  const html = fs.readFileSync(file, "utf8");
  return decode((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "");
}

function blockOf(html) {
  const match = html.match(new RegExp(`${START}([\\s\\S]*?)${END}`));
  return match ? match[1] : "";
}

function hasException(page, rule, locale) {
  return (page.exceptions || []).some(item => item.rule === rule && (!item.locales || item.locales.includes(locale)) && item.reason && item.reason.length > 24);
}

function count(links, kind) {
  return links.filter(link => link.kind === kind).length;
}

function needle(route) {
  const parts = String(route).split("/").filter(Boolean);
  return parts.length ? `${parts[parts.length - 1]}/` : route;
}

function assertCoverage(page, locale, html, links) {
  if (page.kind === "article") {
    check(`${page.id} ${locale} tools`, count(links, "tool") >= 2 || hasException(page, "articleMinTools", locale));
    check(`${page.id} ${locale} articles`, count(links, "article") >= 2 || hasException(page, "articleMinArticles", locale));
    check(`${page.id} ${locale} return`, links.some(link => link.kind === "topic" || link.role === "return") || hasException(page, "articleTopic", locale));
  }
  if (page.kind === "tool") {
    check(`${page.id} ${locale} guide`, links.some(link => link.kind === "article" && link.role === "guide") || hasException(page, "toolGuide", locale));
    check(`${page.id} ${locale} example`, links.some(link => link.role === "example") || hasException(page, "toolExample", locale));
    check(`${page.id} ${locale} topic`, links.some(link => link.kind === "topic") || hasException(page, "toolTopic", locale));
  }
  if (page.kind === "topic") {
    check(`${page.id} ${locale} tools`, count(links, "tool") >= 2 || hasException(page, "topicTools", locale));
    check(`${page.id} ${locale} guides`, count(links, "article") >= 2 || hasException(page, "topicArticles", locale));
  }
}

const data = readData();
check("schema", data.schemaVersion === "1.0.0");
check("primary count", data.pages.filter(page => page.tier === "primary" && page.status === "active").length === 10);
const ratio = fs.readFileSync(fileFor("/guides/switch-oversubscription-ratio/", "en"), "utf8");
check("burst 15 uses 39.7 and 6.05", ratio.includes("39.7%") && ratio.includes("6.05 Gbps") && ratio.includes("15%"));
check("burst 0 stays 34.6 and 7.09", ratio.includes("34.6%") && ratio.includes("7.09 Gbps"));
check("pr72 excluded", (data.dependencies || []).some(item => item.id === "PR72" && item.status === "excluded"));
check("dns pending", data.pages.some(page => page.route === "/guides/dns-ttl-explained/" && page.status === "pending"));
check("no dns file on this tree", !fs.existsSync(fileFor("/guides/dns-ttl-explained/", "en")));
const newRoutes = data.pages.filter(page => page.tier === "integrated-new" || page.tier === "pending-new").map(page => page.route);
check("fiber slot", newRoutes.includes("/guides/fiber-loss-per-kilometer/"));
check("onu slot", newRoutes.includes("/guides/onu-rx-power-troubleshooting/"));
check("stp slot", newRoutes.includes("/guides/stp-path-cost-explained/"));
check("dns slot", newRoutes.includes("/guides/dns-ttl-explained/"));
const fiber = fs.readFileSync(fileFor("/guides/fiber-loss-per-kilometer/", "en"), "utf8");
check("fiber coefficient stays 0.30", fiber.includes("0.30") && fiber.includes("3.60") && fiber.includes("4.90") && fiber.includes("0.408"));
check("blended 0.408 is not the coefficient", fiber.includes("not the fiber coefficient"));
check("G.652.D cites clause 8 Table 2", fiber.includes("clause 8") && fiber.includes("Table 2") && fiber.includes("0.40") && !fiber.includes("2016"));
function metaDesc(html) {
  const tag = html.match(/<meta[^>]*name="description"[^>]*>/i) || html.match(/<meta[^>]*content="[^"]*"[^>]*name="description"[^>]*>/i);
  const raw = tag ? tag[0] : "";
  return ((raw.match(/content="([^"]*)"/) || [])[1] || "");
}
check("splitter tool description 173", metaDesc(fs.readFileSync(fileFor("/tools/pon-splitter-loss/", "en"), "utf8")).length === 173);
check("onu tool description 173", metaDesc(fs.readFileSync(fileFor("/tools/onu-rx-power/", "en"), "utf8")).length === 173);
check("fiber tool description 179", metaDesc(fs.readFileSync(fileFor("/tools/fiber-loss/", "en"), "utf8")).length === 179);
check("fiber es tool description 171", metaDesc(fs.readFileSync(fileFor("/tools/fiber-loss/", "es"), "utf8")).length === 171);

const seenRoutes = new Set();
for (const page of data.pages) {
  check(`${page.id} id`, page.id && !seenRoutes.has(page.id));
  seenRoutes.add(page.id);
  if (page.status === "pending") {
    check(`${page.id} pending reason`, (page.exceptions || []).length > 0 && page.dependency);
    check(`${page.id} not injected`, page.locales.every(locale => {
      const file = fileFor(page.route, locale);
      return !fs.existsSync(file) || !fs.readFileSync(file, "utf8").includes(`data-association-id="${page.id}"`);
    }));
    continue;
  }
  check(`${page.id} active`, page.status === "active" && page.locales.length > 0);
  if (page.mode === "verify") {
    for (const locale of page.locales) {
      const file = fileFor(page.route, locale);
      check(`${page.id} ${locale} file`, fs.existsSync(file));
      if (!fs.existsSync(file)) continue;
      const html = fs.readFileSync(file, "utf8");
      const links = linksFor(page, locale);
      for (const link of links) check(`${page.id} ${locale} has ${link.route}`, html.includes(needle(link.route)));
      for (const rejected of page.rejected || []) {
        const scoped = !rejected.locales || rejected.locales.includes(locale);
        if (scoped) check(`${page.id} ${locale} rejects ${rejected.route}`, !html.includes(needle(rejected.route)));
      }
      assertCoverage(page, locale, html, links);
    }
    continue;
  }
  const own = new Set((page.links || []).map(link => link.route));
  check(`${page.id} no self`, !own.has(page.route));
  for (const rejected of page.rejected || []) {
    check(`${page.id} rejected absent`, !own.has(rejected.route), rejected.route);
  }
  for (const locale of page.locales) {
    const file = fileFor(page.route, locale);
    check(`${page.id} ${locale} file`, fs.existsSync(file), file);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    const links = linksFor(page, locale);
    const fragment = blockOf(html);
    if (!links.length) {
      check(`${page.id} ${locale} empty requires exception`, hasException(page, "noApplicableLinks", locale) && !fragment.includes("<a "));
      continue;
    }
    check(`${page.id} ${locale} block`, fragment.includes(`data-association-id="${page.id}"`));
    const anchors = [];
    for (const link of links) {
      const anchor = link.anchors[locale];
      const href = relHref(file, fileFor(link.route, locale));
      check(`${page.id} ${locale} href ${link.route}`, fragment.includes(`href="${href}"`), href);
      check(`${page.id} ${locale} anchor ${link.route}`, fragment.includes(anchor));
      const title = h1(fileFor(link.route, locale));
      check(`${page.id} ${locale} not exact h1 ${link.route}`, anchor !== title, `${anchor} == ${title}`);
      anchors.push(anchor);
    }
    check(`${page.id} ${locale} diverse anchors`, new Set(anchors).size === anchors.length);
    if (page.kind === "article") {
      check(`${page.id} ${locale} tools`, count(links, "tool") >= 2 || hasException(page, "articleMinTools", locale));
      check(`${page.id} ${locale} articles`, count(links, "article") >= 2 || hasException(page, "articleMinArticles", locale));
      check(`${page.id} ${locale} return`, links.some(link => link.kind === "topic" || link.role === "return") || hasException(page, "articleTopic", locale));
    }
    if (page.kind === "tool") {
      check(`${page.id} ${locale} guide`, links.some(link => link.kind === "article" && link.role === "guide") || hasException(page, "toolGuide", locale));
      check(`${page.id} ${locale} example`, links.some(link => link.role === "example") || hasException(page, "toolExample", locale));
      check(`${page.id} ${locale} topic`, links.some(link => link.kind === "topic") || hasException(page, "toolTopic", locale));
    }
    if (page.kind === "topic") {
      check(`${page.id} ${locale} tools`, count(links, "tool") >= 2 || hasException(page, "topicTools", locale));
      check(`${page.id} ${locale} guides`, count(links, "article") >= 2 || hasException(page, "topicArticles", locale));
    }
  }
}

const engines = [
  "website/tools/stp-path-cost-calculator/js/engine.js",
  "website/tools/dns-ttl-propagation-calculator/js/engine.js",
  "website/tools/ethernet-serialization-delay-calculator/js/engine.js"
];
for (const relative of engines) {
  check(`${relative} untouched by association ids`, !fs.readFileSync(path.join(root, relative), "utf8").includes("NEL_CONTENT_ASSOCIATIONS"));
}
for (const item of data.knownLanguageMismatches || []) {
  const html = fs.readFileSync(fileFor(item.route, item.locale), "utf8");
  check(`known language mismatch remains ${item.href}`, html.includes(item.href));
}

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("PASS content associations");
