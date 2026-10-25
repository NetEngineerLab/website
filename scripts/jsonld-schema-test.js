#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { applyGlossaryToHtml, repairJsonLdHtml } = require("./lib/jsonld-localize");
const { normalizeBreadcrumbs } = require("./lib/seo-resolver");

const siteRoot = path.join(__dirname, "..", "website");

// schema.org types and properties this site actually emits. @-keywords are included.
const SCHEMA_TYPES = new Set([
  "Answer",
  "AboutPage",
  "Article",
  "BreadcrumbList",
  "CollectionPage",
  "FAQPage",
  "ImageObject",
  "ItemList",
  "LearningResource",
  "ListItem",
  "Offer",
  "Organization",
  "Person",
  "Question",
  "WebApplication",
  "WebPage",
  "WebPageElement",
  "WebSite"
]);

const SCHEMA_KEYS = new Set([
  "@context",
  "@graph",
  "@id",
  "@type",
  "acceptedAnswer",
  "alternateName",
  "applicationCategory",
  "applicationSubCategory",
  "author",
  "breadcrumb",
  "browserRequirements",
  "dateModified",
  "datePublished",
  "description",
  "hasPart",
  "headline",
  "inLanguage",
  "isAccessibleForFree",
  "isPartOf",
  "item",
  "itemListElement",
  "logo",
  "mainEntity",
  "mainEntityOfPage",
  "name",
  "numberOfItems",
  "offers",
  "operatingSystem",
  "position",
  "price",
  "priceCurrency",
  "publisher",
  "sameAs",
  "softwareVersion",
  "text",
  "url"
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function jsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html))) blocks.push(match[1].trim());
  return blocks;
}

function checkNode(node, file, errors) {
  if (Array.isArray(node)) {
    node.forEach(item => checkNode(item, file, errors));
    return;
  }
  if (!node || typeof node !== "object") return;
  if (Object.prototype.hasOwnProperty.call(node, "@type")) {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    for (const type of types) {
      if (typeof type !== "string" || !SCHEMA_TYPES.has(type)) {
        errors.push(`${file}: @type ${JSON.stringify(type)} is not an allowlisted schema.org type`);
      }
    }
  }
  for (const key of Object.keys(node)) {
    if (!SCHEMA_KEYS.has(key)) errors.push(`${file}: JSON-LD key ${JSON.stringify(key)} is not an allowlisted schema.org property or @-keyword`);
    checkNode(node[key], file, errors);
  }
}

const sitemapLocs = new Set([...fs.readFileSync(path.join(siteRoot, "sitemap.xml"), "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]));
const errors = [];
let blocks = 0;
let pages = 0;
for (const file of walk(siteRoot)) {
  const rel = path.relative(siteRoot, file).split(path.sep).join("/");
  const html = fs.readFileSync(file, "utf8");
  const found = jsonLdBlocks(html);
  if (!found.length) continue;
  pages += 1;
  for (const body of found) {
    blocks += 1;
    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      errors.push(`${rel}: JSON-LD did not parse (${error.message})`);
      continue;
    }
    checkNode(data, rel, errors);
    checkBreadcrumbs(data, rel, errors);
  }
}
assert.ok(pages > 0 && blocks > 0, "built HTML should contain JSON-LD blocks");
assert.deepEqual(errors, [], errors.slice(0, 20).join("\n"));

const droppedGuides = normalizeBreadcrumbs(
  '<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://netengineerlab.com/"},{"@type":"ListItem","position":2,"name":"Guides","item":"https://netengineerlab.com/guides"},{"@type":"ListItem","position":3,"name":"Page","item":"https://netengineerlab.com/guides/pon-splitter-loss-guide"}]}</script>',
  { canonical: "https://netengineerlab.com/guides/pon-splitter-loss-guide/", siteUrl: "https://netengineerlab.com", sitemapPaths: sitemapLocs }
);
assert.ok(!droppedGuides.includes("/guides\""), "breadcrumb JSON-LD must drop the /guides index");
assert.ok(droppedGuides.includes("https://netengineerlab.com/guides/pon-splitter-loss-guide/"), "breadcrumb JSON-LD must keep the canonical trailing-slash URL");

function checkBreadcrumbs(node, file, sink) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach(item => checkBreadcrumbs(item, file, sink));
    return;
  }
  if (node["@type"] === "BreadcrumbList" && Array.isArray(node.itemListElement)) {
    for (const item of node.itemListElement) {
      const url = item && item.item;
      if (typeof url !== "string" || !sitemapLocs.has(url)) {
        sink.push(`${file}: breadcrumb item URL ${JSON.stringify(url)} is not a sitemap loc`);
      }
    }
  }
  for (const value of Object.values(node)) checkBreadcrumbs(value, file, sink);
}

const glossary = [
  ["FAQ", "Preguntas frecuentes"],
  ["FAQ", "常见问题"],
  ["of", "de"],
  ["Run", "Ejecutar"],
  ["soft", "sdet"],
  ["off", "def"]
];
const sample = [
  "<h2>FAQ</h2><p>Professional software offers a Runtime estimate.</p>",
  '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","name":"FAQ","description":"Professional","softwareVersion":"1.0.0","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}</script>'
].join("");
const localized = applyGlossaryToHtml(sample, glossary);
assert.match(localized, /<h2>Preguntas frecuentes<\/h2>/, "visible copy may be glossary-translated");
const localizedData = JSON.parse(jsonLdBlocks(localized)[0]);
assert.equal(localizedData["@type"], "FAQPage");
assert.equal(localizedData.name, "Preguntas frecuentes");
assert.equal(localizedData.softwareVersion, "1.0.0");
assert.equal(localizedData.offers["@type"], "Offer");
assert.equal(Object.prototype.hasOwnProperty.call(localizedData, "sdetwareVersion"), false);
assert.equal(Object.prototype.hasOwnProperty.call(localizedData, "defers"), false);

const broken = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Preguntas frecuentesPage","sdetwareVersion":"1.1.1","defers":{"@type":"Offer","name":"FAQ"}}</script><script type="application/ld+json">{"@graph":[{"@type":"常见问题Page","name":"常见问题"}]}</script>';
const repaired = repairJsonLdHtml(broken);
const repairedBlocks = jsonLdBlocks(repaired).map(body => JSON.parse(body));
assert.equal(repairedBlocks[0]["@type"], "FAQPage");
assert.equal(repairedBlocks[0].softwareVersion, "1.1.1");
assert.equal(repairedBlocks[0].offers["@type"], "Offer");
assert.equal(repairedBlocks[0].offers.name, "FAQ");
assert.equal(repairedBlocks[1]["@graph"][0]["@type"], "FAQPage");
assert.doesNotMatch(repaired, /Preguntas frecuentesPage|常见问题Page|sdetwareVersion|"defers"/);

// One visible FAQ per page. Guide and topic mains are the centered column, so a
// FAQ, cluster link, or related-pages block after </main> is the unstyled
// duplicate this build step must not emit. Calculator mains are a two-column
// grid; their single supporting FAQ stays a body > .content-section, which the
// tool stylesheet centers. Nesting that section would put it in the grid.
const FAQ_HEADING = /<h([1-3])\b[^>]*>\s*((?:Frequently asked questions|常见问题|Preguntas frecuentes)(?:\s+[^<]{0,40})?)\s*<\/h\1>/gi;
const FAQ_DETAILS = /<details\b[^>]*>[\s\S]*?<summary\b[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/details>/gi;
const FAQ_PAIRS = /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi;

function faqPlain(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagBounds(html, tag, openEnd) {
  const pattern = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  pattern.lastIndex = openEnd;
  let depth = 1;
  let match;
  while ((match = pattern.exec(html))) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) return { innerEnd: match.index, end: pattern.lastIndex };
  }
  return null;
}

function pageMain(html) {
  const open = html.match(/<main\b[^>]*>/i);
  if (!open) return null;
  const innerStart = open.index + open[0].length;
  const bounds = tagBounds(html, "main", innerStart);
  if (!bounds) return null;
  const tool = /\b(?:tool-shell|nel-tool-grid|nel-tool-main|calculator-shell)\b/.test(open[0])
    || /\bid\s*=\s*["']calculator["']/i.test(open[0]);
  return { innerStart, innerEnd: bounds.innerEnd, tool };
}

function questionsIn(region) {
  const details = [...region.matchAll(new RegExp(FAQ_DETAILS.source, "gi"))]
    .map(match => ({ question: faqPlain(match[1]), answer: faqPlain(match[2]) }))
    .filter(item => item.question && item.answer);
  if (details.length) return details;
  return [...region.matchAll(new RegExp(FAQ_PAIRS.source, "gi"))]
    .map(match => ({ question: faqPlain(match[1]), answer: faqPlain(match[2]) }))
    .filter(item => item.question && item.answer);
}

function faqSchemas(html) {
  const found = [];
  const walkNode = node => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walkNode);
      return;
    }
    if (node["@type"] === "FAQPage" && Array.isArray(node.mainEntity)) found.push(node);
    if (node["@graph"]) walkNode(node["@graph"]);
  };
  for (const body of jsonLdBlocks(html)) {
    try { walkNode(JSON.parse(body)); } catch { /* schema parse errors are reported above */ }
  }
  return found;
}

const faqErrors = [];
let faqPages = 0;
for (const file of walk(siteRoot)) {
  const rel = path.relative(siteRoot, file).split(path.sep).join("/");
  if (rel.includes("offline.html")) continue;
  const html = fs.readFileSync(file, "utf8");
  const headings = [...html.matchAll(new RegExp(FAQ_HEADING.source, "gi"))];
  if (headings.length) faqPages += 1;
  if (headings.length > 1) faqErrors.push(`${rel}: ${headings.length} FAQ headings`);
  const injected = [...html.matchAll(/<section\b[^>]*\bdata-nel-faq\s*=\s*["']visible["']/gi)];
  if (injected.length > 1) faqErrors.push(`${rel}: ${injected.length} injected FAQ sections`);
  const main = pageMain(html);
  if (main && !main.tool) {
    for (const heading of headings) {
      if (heading.index < main.innerStart || heading.index > main.innerEnd) {
        faqErrors.push(`${rel}: FAQ heading is outside <main>`);
      }
    }
    for (const marker of ["data-nel-faq=\"visible\"", "data-nel-editorial-links", "data-nel-cluster-link"]) {
      let from = 0;
      let index = html.indexOf(marker, from);
      while (index !== -1) {
        if (index < main.innerStart || index > main.innerEnd) faqErrors.push(`${rel}: ${marker} is outside <main>`);
        from = index + marker.length;
        index = html.indexOf(marker, from);
      }
    }
  }
  const schemas = faqSchemas(html);
  if (schemas.length > 1) faqErrors.push(`${rel}: ${schemas.length} FAQPage schemas`);
  let regionQuestions = [];
  if (headings.length === 1) {
    const start = headings[0].index + headings[0][0].length;
    const rest = html.slice(start);
    const nextHeading = rest.search(/<h2\b/i);
    regionQuestions = questionsIn(nextHeading >= 0 ? rest.slice(0, nextHeading) : rest);
  }
  if (schemas.length === 1) {
    const visible = regionQuestions.length ? regionQuestions : questionsIn(html);
    const entities = schemas[0].mainEntity.map(entity => ({
      question: faqPlain(entity?.name),
      answer: faqPlain(entity?.acceptedAnswer?.text)
    }));
    if (!visible.length) faqErrors.push(`${rel}: FAQPage has no matching visible FAQ`);
    else if (entities.length !== visible.length || entities.some((entity, index) => entity.question !== visible[index].question || entity.answer !== visible[index].answer)) {
      faqErrors.push(`${rel}: FAQPage does not match the visible FAQ (${entities.length} schema, ${visible.length} visible)`);
    }
  } else if (regionQuestions.length) {
    faqErrors.push(`${rel}: visible FAQ has no FAQPage schema`);
  }
}
assert.deepEqual(faqErrors, [], faqErrors.slice(0, 20).join("\n"));

console.log(`JSON-LD schema tests: PASS (${pages} pages, ${blocks} blocks; glossary does not rewrite keys or @type; ${faqPages} pages have one FAQ heading).`);
