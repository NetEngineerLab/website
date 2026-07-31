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
    if (path === "/zh/" || path.indexOf("/zh/") === 0 || /\/zh\/$/.test(path)) {
      return { key: "zh", hreflang: "zh-CN" };
    }
    return { key: "en", hreflang: "en" };
  }

  function translatedPath(path, locale) {
    var rootZh = path === "/zh/" || path.indexOf("/zh/") === 0;
    var base = path.replace(/^\/zh(?=\/)/, "").replace(/\/zh(?=\/|$)/, "").replace(/\/{2,}/g, "/");
    if (!base) base = "/";
    if (locale === "zh") {
      if (base === "/") return "/zh/";
      if (base.indexOf("/tools") === 0) return base.replace(/\/$/, "") + "/zh/";
      return "/zh" + base;
    }
    if (rootZh && base.charAt(0) !== "/") base = "/" + base;
    return base;
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

  document.documentElement.lang = locale.hreflang;
  if (!document.title.trim()) document.title = title;
  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[name="robots"]', { name: "robots", content: config.robots });

  if (config.enableCanonical) {
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonical });
  }

  if (config.enableHreflang) {
    Object.keys(config.locales).forEach(function (key) {
      var item = config.locales[key];
      upsertLink('link[rel="alternate"][hreflang="' + item.hreflang + '"]', {
        rel: "alternate",
        hreflang: item.hreflang,
        href: absolute(translatedPath(path, key))
      });
    });
    upsertLink('link[rel="alternate"][hreflang="x-default"]', {
      rel: "alternate",
      hreflang: "x-default",
      href: absolute(translatedPath(path, config.defaultLocale))
    });
  }

  if (config.enableOpenGraph) {
    [
      ["og:type", "website"], ["og:site_name", config.siteName], ["og:title", title],
      ["og:description", description], ["og:url", canonical], ["og:image", image],
      ["og:locale", locale.key === "zh" ? "zh_CN" : "en_US"]
    ].forEach(function (entry) {
      upsertMeta('meta[property="' + entry[0] + '"]', { property: entry[0], content: entry[1] });
    });
  }

  if (config.enableTwitter) {
    [
      ["twitter:card", config.twitterCard], ["twitter:title", title],
      ["twitter:description", description], ["twitter:image", image]
    ].forEach(function (entry) {
      upsertMeta('meta[name="' + entry[0] + '"]', { name: entry[0], content: entry[1] });
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
