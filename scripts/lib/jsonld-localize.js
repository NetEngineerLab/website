"use strict";

// Glossary passes must not rewrite schema.org structure. A previous i18n step
// applied literal substring replacements to whole HTML documents, including
// <script type="application/ld+json">. "FAQ" became "Preguntas frecuentes" or
// "常见问题" (so FAQPage was no longer a type), and "of" became "de" (so
// softwareVersion and offers became sdetwareVersion and defers).
// Only human-readable string values may be localized.

const JSONLD_SCRIPT = /<script\b([^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi;

const LOCALIZABLE_VALUE_KEYS = new Set([
  "alternateName",
  "description",
  "headline",
  "name",
  "text"
]);

const TYPE_REPAIRS = {
  "Preguntas frecuentesPage": "FAQPage",
  "常见问题Page": "FAQPage"
};

const KEY_REPAIRS = {
  sdetwareVersion: "softwareVersion",
  defers: "offers"
};

function applyGlossary(text, pairs) {
  let out = String(text);
  for (const [from, to] of pairs) {
    if (!from || from === to) continue;
    out = out.split(from).join(to);
  }
  return out;
}

function localizeJsonLd(node, translate) {
  if (Array.isArray(node)) return node.map(item => localizeJsonLd(item, translate));
  if (!node || typeof node !== "object") return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    const schemaKey = KEY_REPAIRS[key] || key;
    if (schemaKey === "@type") {
      if (typeof value === "string") out[schemaKey] = TYPE_REPAIRS[value] || value;
      else if (Array.isArray(value)) out[schemaKey] = value.map(item => typeof item === "string" ? (TYPE_REPAIRS[item] || item) : localizeJsonLd(item, translate));
      else out[schemaKey] = localizeJsonLd(value, translate);
      continue;
    }
    if (LOCALIZABLE_VALUE_KEYS.has(schemaKey) && typeof value === "string") {
      out[schemaKey] = translate(value);
      continue;
    }
    out[schemaKey] = localizeJsonLd(value, translate);
  }
  return out;
}

function applyGlossaryToHtml(html, pairs) {
  const blocks = [];
  const masked = String(html).replace(JSONLD_SCRIPT, (whole, attrs, body) => {
    let replacement = whole;
    try {
      const data = JSON.parse(body.trim());
      replacement = `<script${attrs}>${JSON.stringify(localizeJsonLd(data, value => applyGlossary(value, pairs)))}</script>`;
    } catch {
      // Leave unparseable JSON-LD untouched instead of substring-replacing it.
    }
    const token = `\u0000JSONLD${blocks.length}\u0000`;
    blocks.push(replacement);
    return token;
  });
  return applyGlossary(masked, pairs).replace(/\u0000JSONLD(\d+)\u0000/g, (_match, index) => blocks[Number(index)]);
}

function repairJsonLdHtml(html) {
  return String(html).replace(JSONLD_SCRIPT, (whole, attrs, body) => {
    let data;
    try {
      data = JSON.parse(body.trim());
    } catch {
      return whole;
    }
    const repaired = localizeJsonLd(data, value => value);
    if (JSON.stringify(repaired) === JSON.stringify(data)) return whole;
    return `<script${attrs}>${JSON.stringify(repaired)}</script>`;
  });
}

module.exports = {
  KEY_REPAIRS,
  LOCALIZABLE_VALUE_KEYS,
  TYPE_REPAIRS,
  applyGlossaryToHtml,
  localizeJsonLd,
  repairJsonLdHtml
};
