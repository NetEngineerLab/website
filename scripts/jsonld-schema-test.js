#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { applyGlossaryToHtml, repairJsonLdHtml } = require("./lib/jsonld-localize");

const siteRoot = path.join(__dirname, "..", "website");

// schema.org types and properties this site actually emits. @-keywords are included.
const SCHEMA_TYPES = new Set([
  "Answer",
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
  }
}
assert.ok(pages > 0 && blocks > 0, "built HTML should contain JSON-LD blocks");
assert.deepEqual(errors, [], errors.slice(0, 20).join("\n"));

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

console.log(`JSON-LD schema tests: PASS (${pages} pages, ${blocks} blocks; glossary does not rewrite keys or @type).`);
