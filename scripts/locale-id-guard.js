#!/usr/bin/env node
"use strict";

/**
 * Locale id guard.
 *
 * Spanish and Chinese tool pages are translated copies of the English page,
 * but the calculator scripts are shared. A translation pass must therefore
 * never touch element ids, label targets, ARIA references, data-* hooks or
 * inline script code. This guard fails the build when a locale copy drifts
 * from the English page in any of those machine-readable places.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const toolsRoot = path.join(root, "website", "tools");
const LOCALES = ["zh", "es"];
const SAFE_TOKEN = /^[A-Za-z_][A-Za-z0-9_:.-]*$/;
const REFERENCE_ATTRS = ["for", "aria-labelledby", "aria-controls", "aria-describedby", "list", "form"];

function attrValues(html, name) {
  const re = new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "gi");
  return [...html.matchAll(re)].map(match => match[1]);
}

function ids(html) {
  return attrValues(html, "id");
}

function inlineScripts(html) {
  return [...html.matchAll(/<script\b(?![^>]*\bsrc\s*=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1].trim())
    .filter(Boolean)
    // Copy inside string literals may be translated; the code around it may not.
    .map(code => code.replace(/(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g, "\"\"").replace(/\s+/g, " "));
}

function scriptLiterals(toolDir) {
  const literals = new Set();
  const dirs = [path.join(toolDir, "js"), ...LOCALES.map(locale => path.join(toolDir, locale, "js"))];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".js")) continue;
      const source = fs.readFileSync(path.join(dir, file), "utf8");
      for (const match of source.matchAll(/["'`#]([A-Za-z_][A-Za-z0-9_-]*)["'`]/g)) literals.add(match[1]);
    }
  }
  return literals;
}

function checkPage(enHtml, localeHtml, literals, label) {
  const errors = [];
  const enIds = new Set(ids(enHtml));
  const localeIds = ids(localeHtml);
  const localeIdSet = new Set(localeIds);
  for (const id of localeIds) {
    if (!SAFE_TOKEN.test(id)) errors.push(`${label}: id "${id}" is not a machine token (translated?)`);
  }
  // A locale id that the English page does not have is a renamed (translated)
  // hook unless the shared scripts create or read it themselves.
  const ALLOWED_EXTRA = new Set(["latency-workflow-title"]);
  for (const id of localeIdSet) {
    if (!enIds.has(id) && !literals.has(id) && !ALLOWED_EXTRA.has(id) && !/^nel-|^faq|-title$/.test(id)) errors.push(`${label}: #${id} does not exist on the English page (translated id?)`);
  }
  for (const name of REFERENCE_ATTRS) {
    for (const value of attrValues(localeHtml, name)) {
      for (const token of value.split(/\s+/).filter(Boolean)) {
        if (!SAFE_TOKEN.test(token)) errors.push(`${label}: ${name}="${value}" is not a machine token`);
        else if (!localeIdSet.has(token)) errors.push(`${label}: ${name}="${token}" points at no element`);
      }
    }
  }
  const enAdKeys = new Set(attrValues(enHtml, "data-ad-key"));
  for (const key of attrValues(localeHtml, "data-ad-key")) {
    if (!enAdKeys.has(key)) errors.push(`${label}: data-ad-key="${key}" is not used by the English page`);
  }
  const enScripts = inlineScripts(enHtml);
  const localeScripts = inlineScripts(localeHtml);
  for (const code of localeScripts) {
    if (!enScripts.includes(code)) errors.push(`${label}: inline script differs from the English page: ${code.slice(0, 80)}`);
  }
  return errors;
}

function run() {
  const errors = [];
  let pages = 0;
  for (const slug of fs.readdirSync(toolsRoot)) {
    const toolDir = path.join(toolsRoot, slug);
    const enFile = path.join(toolDir, "index.html");
    if (!fs.existsSync(enFile)) continue;
    const enHtml = fs.readFileSync(enFile, "utf8");
    const literals = scriptLiterals(toolDir);
    for (const locale of LOCALES) {
      const file = path.join(toolDir, locale, "index.html");
      if (!fs.existsSync(file)) continue;
      pages += 1;
      errors.push(...checkPage(enHtml, fs.readFileSync(file, "utf8"), literals, `tools/${slug}/${locale}/`));
    }
  }
  return {pages, errors};
}

module.exports = {checkPage, run};

if (require.main === module) {
  const {pages, errors} = run();
  if (errors.length) {
    console.error(errors.join("\n"));
    console.error(`Locale id guard FAIL (${errors.length} problems on ${pages} locale tool pages)`);
    process.exit(1);
  }
  console.log(`Locale id guard PASS (${pages} locale tool pages)`);
}
