"use strict";

const fs = require("fs");
const path = require("path");
const {loadPageRegistry} = require("../page-registry");
const supplementalSlugs = require("./supplemental-tool-slugs");

const packageRoot = path.resolve(__dirname, "..", "..");
const defaultSiteRoot = path.join(packageRoot, "website");

function toolPathname(slug, locale) {
  return locale && locale.folder ? `/tools/${slug}/${locale.folder}/` : `/tools/${slug}/`;
}

/**
 * Pathnames the multilingual build writes into sitemap.xml.
 *
 * Page Registry is the source for each public route's real languages and URL
 * pattern (tool and calculator hubs stay /tools/<slug>/ and
 * /tools/<slug>/<locale>/; guides and topics stay /<locale>/<route>).
 * Published planners that are intentionally outside the tool catalog are
 * included only for locales that have a real page, using that same tool URL
 * pattern. An active locale is not crossed with every route.
 */
function expectedSitemapPathnames({siteRoot = defaultSiteRoot, pageRegistry, localeConfig} = {}) {
  const registry = pageRegistry || loadPageRegistry();
  const locales = localeConfig || JSON.parse(fs.readFileSync(path.join(siteRoot, "data", "locales.json"), "utf8"));
  const activeLocales = locales.locales.filter(locale => locale.status === "active");
  const paths = new Set(
    registry.pages.filter(page => page.sitemapEligible).map(page => page.pathname)
  );
  for (const slug of supplementalSlugs) {
    for (const locale of activeLocales) {
      const folder = locale.folder ? `${locale.folder}/` : "";
      if (!fs.existsSync(path.join(siteRoot, "tools", slug, folder, "index.html"))) continue;
      paths.add(toolPathname(slug, locale));
    }
  }
  return paths;
}

function sitemapPathnamesFromXml(xml) {
  return [...String(xml).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
}

module.exports = {
  expectedSitemapPathnames,
  sitemapPathnamesFromXml,
  supplementalSlugs,
  toolPathname
};
