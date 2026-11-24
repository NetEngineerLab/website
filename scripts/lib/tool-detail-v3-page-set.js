"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const site = path.join(root, "website");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function toolUrl(slug, folder) {
  return "https://netengineerlab.com/tools/" + slug + "/" + (folder ? folder + "/" : "");
}

function loadPageSet(options = {}) {
  const registry = options.registry || readJson("src/registry/tool-registry.json");
  const localeDoc = options.locales || readJson("website/data/locales.json");
  const supplemental = options.supplemental || require("./supplemental-tool-slugs");
  const sitemapRoutes = options.sitemapRoutes || readJson("website/data/sitemap-routes.json");
  const sitemapXml = options.sitemapXml || fs.readFileSync(path.join(site, "sitemap.xml"), "utf8");
  const fileExists = options.fileExists || (rel => fs.existsSync(path.join(root, rel)));
  const locales = localeDoc.locales.filter(locale => locale.status === "active");
  const pilots = localeDoc.locales.filter(locale => locale.status === "pilot");
  const localesFor = slug => [...locales, ...pilots.filter(locale => (locale.pilotRoutes || []).includes("tools/" + slug + "/"))];
  const active = registry.filter(tool => tool.status === "active");
  const seen = new Set();
  for (const tool of active) {
    if (seen.has(tool.id)) throw new Error("duplicate-registry: " + tool.id);
    seen.add(tool.id);
    if (supplemental.has(tool.id)) throw new Error("supplemental-collision: " + tool.id);
  }
  const pages = [];
  function add(slug, locale, supplementalPage) {
    const rel = "website/tools/" + slug + "/" + (locale.folder ? locale.folder + "/" : "") + "index.html";
    const url = toolUrl(slug, locale.folder);
    if (options.dropRoute === url) throw new Error("route-mismatch: " + url);
    if (!fileExists(rel)) {
      if (supplementalPage && slug === "oob-network-design-planner" && locale.id === "es") return;
      throw new Error("missing-page: " + slug + "/" + locale.id);
    }
    pages.push({ slug, locale: locale.id, url, file: rel, supplemental: supplementalPage });
  }
  for (const tool of active) for (const locale of localesFor(tool.id)) add(tool.id, locale, false);
  for (const slug of supplemental) for (const locale of locales) add(slug, locale, true);
  const urls = pages.map(page => page.url);
  if (new Set(urls).size !== urls.length) throw new Error("duplicate-page-url");
  const hubSlugs = new Set((sitemapRoutes.routes || []).filter(record => record.pageType === "hub").map(record => String(record.route || "").split("/")[1]).filter(Boolean));
  const localeFolders = new Set(locales.map(locale => locale.folder).filter(Boolean));
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const seenLoc = new Set();
  const toolLocs = [];
  for (const loc of locs) {
    const match = loc.match(/^https:\/\/netengineerlab\.com\/tools\/([^/]+)\/(?:([^/]+)\/)?$/);
    if (!match) continue;
    const slug = match[1];
    const folder = match[2] || "";
    if (!folder && localeFolders.has(slug)) continue;
    if (hubSlugs.has(slug)) continue;
    if (folder && !localeFolders.has(folder) && !pilots.some(locale => locale.folder === folder && (locale.pilotRoutes || []).includes("tools/" + slug + "/"))) throw new Error("sitemap-extra: " + loc);
    if (seenLoc.has(loc)) throw new Error("duplicate-sitemap-loc: " + loc);
    seenLoc.add(loc);
    toolLocs.push(loc);
  }
  const expected = new Set(urls);
  const published = new Set(toolLocs);
  for (const url of expected) if (!published.has(url)) throw new Error("sitemap-missing: " + url);
  for (const url of published) if (!expected.has(url)) throw new Error("sitemap-extra: " + url);
  const preservedSlugs = options.preserved || new Set(["optical-power-budget"]);
  const preserved = pages.filter(page => preservedSlugs.has(page.slug)).length;
  return { pages, preserved, migrated: pages.length - preserved };
}

module.exports = { loadPageSet, toolUrl };
