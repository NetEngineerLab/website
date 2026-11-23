#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {refreshServiceWorkerCacheName} = require("./service-worker-precache");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "website");
const dataPath = path.join(site, "data", "content-associations.json");
const START = "<!-- NEL_CONTENT_ASSOCIATIONS_START -->";
const END = "<!-- NEL_CONTENT_ASSOCIATIONS_END -->";
const GRAPH_END = "<!-- NEL_TOOL_GRAPH_END -->";

function readData() {
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[character]));
}

function fileFor(route, locale) {
  const parts = String(route).split("/").filter(Boolean);
  if (parts.length < 2) return "";
  const [section, slug] = parts;
  if (section === "tools") {
    return locale === "en"
      ? path.join(site, "tools", slug, "index.html")
      : path.join(site, "tools", slug, locale, "index.html");
  }
  return locale === "en"
    ? path.join(site, section, slug, "index.html")
    : path.join(site, locale, section, slug, "index.html");
}

function relHref(fromFile, toFile) {
  const fromDir = path.posix.dirname(fromFile.split(path.sep).join("/"));
  const toDir = path.posix.dirname(toFile.split(path.sep).join("/"));
  let relative = path.posix.relative(fromDir, toDir);
  if (!relative) relative = ".";
  if (!relative.endsWith("/")) relative += "/";
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return relative;
}

function linksFor(page, locale) {
  return (page.links || []).filter(link => {
    const locales = link.locales || page.locales || [];
    if (!locales.includes(locale)) return false;
    return fs.existsSync(fileFor(link.route, locale));
  });
}

function labels(locale) {
  if (locale === "zh") {
    return {aria: "已复核的工程关联", title: "已复核的工程关联"};
  }
  if (locale === "es") {
    return {aria: "Enlaces de ingeniería revisados", title: "Enlaces de ingeniería revisados"};
  }
  return {aria: "Reviewed engineering links", title: "Reviewed engineering links"};
}

function block(page, locale, links) {
  const copy = labels(locale);
  const items = links.map(link => {
    const anchor = link.anchors && link.anchors[locale];
    if (!anchor) throw new Error(`${page.id} ${locale} missing anchor for ${link.route}`);
    const href = relHref(fileFor(page.route, locale), fileFor(link.route, locale));
    return `<li><a href="${esc(href)}">${esc(anchor)}</a></li>`;
  }).join("");
  return `<nav class="nel-content-associations" data-association-id="${esc(page.id)}" aria-label="${esc(copy.aria)}"><h2>${esc(copy.title)}</h2><ul>${items}</ul></nav>`;
}

function insert(html, markup) {
  const wrapped = `${START}\n${markup}\n${END}`;
  if (html.includes(START) && html.includes(END)) {
    return html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), wrapped);
  }
  if (html.includes(GRAPH_END)) return html.replace(GRAPH_END, `${GRAPH_END}\n${wrapped}`);
  const main = html.lastIndexOf("</main>");
  if (main >= 0) return `${html.slice(0, main)}${wrapped}\n${html.slice(main)}`;
  throw new Error("no association insertion point");
}

function removeBlock(html) {
  if (!html.includes(START)) return html;
  return html.replace(new RegExp(`\\n?${START}[\\s\\S]*?${END}\\n?`), "\n");
}

function applyPage(page) {
  const touchedTools = new Set();
  if (page.status !== "active" || page.mode === "verify") return touchedTools;
  for (const locale of page.locales || []) {
    const file = fileFor(page.route, locale);
    if (!fs.existsSync(file)) throw new Error(`${page.id} missing ${path.relative(root, file)}`);
    const before = fs.readFileSync(file, "utf8");
    const links = linksFor(page, locale);
    const after = links.length ? insert(before, block(page, locale, links)) : removeBlock(before);
    if (after !== before) fs.writeFileSync(file, after);
    if (page.route.startsWith("/tools/")) touchedTools.add(page.route.split("/").filter(Boolean)[1]);
  }
  return touchedTools;
}

function main() {
  const data = readData();
  const tools = new Set();
  for (const page of data.pages) {
    for (const slug of applyPage(page)) tools.add(slug);
  }
  let refreshed = 0;
  for (const slug of tools) {
    const swPath = path.join(site, "tools", slug, "sw.js");
    if (!fs.existsSync(swPath)) continue;
    const before = fs.readFileSync(swPath, "utf8");
    const after = refreshServiceWorkerCacheName(before, path.join(site, "tools", slug), site);
    if (after !== before) {
      fs.writeFileSync(swPath, after);
      refreshed += 1;
    }
  }
  console.log(`Content associations wrote ${data.pages.filter(page => page.status === "active").length} active records; service workers refreshed ${refreshed}`);
}

if (require.main === module) main();

module.exports = {readData, fileFor, linksFor, relHref, START, END};
