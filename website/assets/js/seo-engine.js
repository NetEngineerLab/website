(function (window, document) {
  "use strict";

  var config = window.NetEngineerLabSEO;
  if (!config || document.documentElement.hasAttribute("data-seo-disabled")) return;

  function cleanPath(pathname) {
    var path = (pathname || "/").replace(/\/index\.html$/i, "/").replace(/\/{2,}/g, "/");
    if (!/\.[a-z0-9]+$/i.test(path) && path.slice(-1) !== "/") path += "/";
    return path || "/";
  }

  function absolute(path) {
    if (/^https?:\/\//i.test(path)) return path;
    return config.origin.replace(/\/$/, "") + (path.charAt(0) === "/" ? path : "/" + path);
  }

  function localeInfo(path) {
    var declared = (document.documentElement.getAttribute("data-nel-locale") || "").toLowerCase();
    if (declared && config.locales[declared]) return { key: declared, hreflang: config.locales[declared].hreflang };
    if (path === "/zh/" || path.indexOf("/zh/") === 0 || /\/zh\/$/.test(path)) {
      return { key: "zh", hreflang: "zh-CN" };
    }
    if (config.locales.es && (path === "/es/" || path.indexOf("/es/") === 0 || /\/es\/$/.test(path))) {
      return { key: "es", hreflang: "es" };
    }
    return { key: "en", hreflang: "en" };
  }

  function translatedPath(path, locale) {
    var base = path.replace(/^\/(?:zh|es)(?=\/)/, "").replace(/\/(?:zh|es)(?=\/$)/, "").replace(/\/{2,}/g, "/");
    if (!base) base = "/";
    if (base.charAt(0) !== "/") base = "/" + base;
    if (locale === config.defaultLocale) return base;
    if (base === "/") return "/" + locale + "/";
    if (base.indexOf("/tools") === 0) return base.replace(/\/$/, "") + "/" + locale + "/";
    return "/" + locale + base;
  }

  // Static pages already ship the canonical, hreflang, description and robots
  // tags produced by the build. Only fill tags that are missing so the runtime
  // can never rewrite the published SEO signals.
  function ensureMeta(selector, attrs) {
    if (document.head.querySelector(selector)) return null;
    return upsertMeta(selector, attrs);
  }

  function ensureLink(selector, attrs) {
    if (document.head.querySelector(selector)) return null;
    return upsertLink(selector, attrs);
  }

  function upsertMeta(selector, attrs) {
    var node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement("meta");
      document.head.appendChild(node);
    }
    Object.keys(attrs).forEach(function (name) { node.setAttribute(name, attrs[name]); });
    return node;
  }

  function upsertLink(selector, attrs) {
    var node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement("link");
      document.head.appendChild(node);
    }
    Object.keys(attrs).forEach(function (name) { node.setAttribute(name, attrs[name]); });
    return node;
  }

  var path = cleanPath(window.location.pathname);
  var locale = localeInfo(path);
  var defaults = config.defaults[locale.key] || config.defaults[config.defaultLocale];
  var canonical = absolute(path);
  var title = document.title.trim() || defaults.title;
  var descriptionNode = document.head.querySelector('meta[name="description"]');
  var description = (descriptionNode && descriptionNode.getAttribute("content")) || defaults.description;
  var image = absolute(config.socialImage);

  if (!document.documentElement.getAttribute("lang")) document.documentElement.lang = locale.hreflang;
  if (!document.title.trim()) document.title = title;
  ensureMeta('meta[name="description"]', { name: "description", content: description });
  ensureMeta('meta[name="robots"]', { name: "robots", content: config.robots });

  if (config.enableCanonical) {
    ensureLink('link[rel="canonical"]', { rel: "canonical", href: canonical });
  }

  if (config.enableHreflang && !document.head.querySelector('link[rel="alternate"][hreflang]')) {
    Object.keys(config.locales).forEach(function (key) {
      var item = config.locales[key];
      ensureLink('link[rel="alternate"][hreflang="' + item.hreflang + '"]', {
        rel: "alternate",
        hreflang: item.hreflang,
        href: absolute(translatedPath(path, key))
      });
    });
    ensureLink('link[rel="alternate"][hreflang="x-default"]', {
      rel: "alternate",
      hreflang: "x-default",
      href: absolute(translatedPath(path, config.defaultLocale))
    });
  }

  if (config.enableOpenGraph) {
    [
      ["og:type", "website"], ["og:site_name", config.siteName], ["og:title", title],
      ["og:description", description], ["og:url", canonical], ["og:image", image],
      ["og:locale", locale.key === "zh" ? "zh_CN" : locale.key === "es" ? "es_ES" : "en_US"]
    ].forEach(function (entry) {
      ensureMeta('meta[property="' + entry[0] + '"]', { property: entry[0], content: entry[1] });
    });
  }

  if (config.enableTwitter) {
    [
      ["twitter:card", config.twitterCard], ["twitter:title", title],
      ["twitter:description", description], ["twitter:image", image]
    ].forEach(function (entry) {
      ensureMeta('meta[name="' + entry[0] + '"]', { name: entry[0], content: entry[1] });
    });
  }

  if (config.enableWebPageSchema && !document.head.querySelector("[data-nel-seo-schema]")) {
    var schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.setAttribute("data-nel-seo-schema", "webpage");
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: description,
      url: canonical,
      inLanguage: locale.hreflang,
      isPartOf: { "@type": "WebSite", name: config.siteName, url: config.origin + "/" }
    });
    document.head.appendChild(schema);
  }

  if (config.debug && window.console) {
    console.info("[NetEngineerLab SEO]", { version: config.version, canonical: canonical, locale: locale.hreflang });
  }
})(window, document);
