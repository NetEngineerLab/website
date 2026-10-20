"use strict";

// Shared SEO resolver used by the multilingual build. It fills metadata and
// structured data the page templates do not already emit, and it keeps
// breadcrumb URLs on absolute trailing-slash sitemap locations.

const JSONLD_SCRIPT = /<script\b([^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi;

const LABELS = {
  en: { home: "Home", tools: "Tools", topics: "Topics", faq: "Frequently asked questions" },
  zh: { home: "首页", tools: "工具", topics: "专题", faq: "常见问题" },
  es: { home: "Inicio", tools: "Herramientas", topics: "Temas", faq: "Preguntas frecuentes" }
};

const GUIDE_MARKDOWN = {
  "switch-oversubscription-ratio.md": "guides/switch-oversubscription-ratio/",
  "48-port-switch-oversubscription.md": "guides/48-port-switch-oversubscription/",
  "48-port-switch-2x10g-enough.md": "guides/48-port-switch-2x10g-enough/",
  "switch-oversubscription-n-1.md": "guides/switch-oversubscription-n-1/",
  "data-center-cooling-load-calculation.md": "guides/data-center-cooling-load-calculation/",
  "data-center-cooling-n-plus-one.md": "guides/data-center-cooling-n-plus-one/",
  "server-room-cooling-tons.md": "guides/how-many-tons-of-cooling-for-server-room/",
  "server-room-heat-load.md": "guides/server-room-heat-load-calculation/"
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function textContent(html) {
  return decodeEntities(String(html || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function pageTitle(html) {
  return textContent((String(html).match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
}

function pageDescription(html) {
  const tag = (String(html).match(/<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/i) || [])[0] || "";
  return decodeEntities((tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [])[1] || "");
}

function labelsFor(localeId) {
  return LABELS[localeId] || LABELS.en;
}

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach(item => walk(item, visit));
    return;
  }
  visit(node);
  for (const value of Object.values(node)) walk(value, visit);
}

function typesOf(node, set = new Set()) {
  walk(node, item => {
    if (!item["@type"]) return;
    const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
    types.forEach(type => set.add(type));
  });
  return set;
}

function jsonLdScripts(html) {
  const scripts = [];
  const pattern = new RegExp(JSONLD_SCRIPT.source, "gi");
  let match;
  while ((match = pattern.exec(html))) {
    let data = null;
    try { data = JSON.parse(match[2].trim()); } catch { data = null; }
    scripts.push({ attrs: match[1], body: match[2], data, index: match.index });
  }
  return scripts;
}

function hasType(html, type) {
  return jsonLdScripts(html).some(script => {
    if (!script.data || !typesOf(script.data).has(type)) return false;
    if (type !== "BreadcrumbList") return true;
    let usable = false;
    walk(script.data, node => {
      if (node["@type"] === "BreadcrumbList" && Array.isArray(node.itemListElement) && node.itemListElement.some(item => item && item.item)) usable = true;
    });
    return usable;
  });
}

function ensureMetaName(html, name, content) {
  if (!content) return html;
  const pattern = new RegExp(`<meta\\b[^>]*\\bname\\s*=\\s*["']${name}["'][^>]*>`, "i");
  if (pattern.test(html)) return html;
  return html.replace(/<\/head>/i, `<meta name="${name}" content="${escapeHtml(content)}">\n</head>`);
}

function ensureRobots(html, { indexable }) {
  if (!indexable) return html;
  if (/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*>/i.test(html)) return html;
  return html.replace(/<\/head>/i, '<meta name="robots" content="index,follow,max-image-preview:large">\n</head>');
}

function ensureTwitter(html, imageUrl) {
  const title = pageTitle(html);
  const description = pageDescription(html);
  const imageTag = (html.match(/<meta\b[^>]*\bproperty\s*=\s*["']og:image["'][^>]*>/i) || [])[0] || "";
  const image = decodeEntities((imageTag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [])[1] || "") || imageUrl;
  html = ensureMetaName(html, "twitter:card", "summary_large_image");
  html = ensureMetaName(html, "twitter:title", title);
  html = ensureMetaName(html, "twitter:description", description);
  html = ensureMetaName(html, "twitter:image", image);
  return html;
}

function absoluteDirectoryUrl(value, siteUrl) {
  if (typeof value !== "string" || !value.trim()) return null;
  let parsed;
  try { parsed = new URL(value, `${siteUrl}/`); } catch { return null; }
  let origin;
  try { origin = new URL(siteUrl).origin; } catch { return null; }
  if (parsed.origin !== origin) return null;
  let pathname = parsed.pathname || "/";
  if (pathname !== "/" && !pathname.endsWith("/")) pathname += "/";
  if (pathname === "/guides/" || pathname === "/zh/guides/" || pathname === "/es/guides/") return { drop: true };
  const url = pathname === "/" ? `${siteUrl}/` : `${siteUrl}${pathname}`;
  return { url, pathname };
}

function normalizeBreadcrumbs(html, { canonical, siteUrl, sitemapPaths }) {
  return html.replace(JSONLD_SCRIPT, (whole, attrs, body) => {
    let data;
    try { data = JSON.parse(body.trim()); } catch { return whole; }
    let changed = false;
    const visit = node => {
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (!node || typeof node !== "object") return;
      if (node["@type"] === "BreadcrumbList" && Array.isArray(node.itemListElement)) {
        const kept = [];
        for (const item of node.itemListElement) {
          if (!item || typeof item !== "object") continue;
          const raw = typeof item.item === "string" ? item.item : "";
          const resolved = absoluteDirectoryUrl(raw, siteUrl);
          if (!resolved || resolved.drop) { changed = true; continue; }
          if (sitemapPaths && !sitemapPaths.has(resolved.url)) { changed = true; continue; }
          if (item.item !== resolved.url) changed = true;
          kept.push({ ...item, item: resolved.url });
        }
        if (kept.length && (!sitemapPaths || sitemapPaths.has(canonical))) {
          kept[kept.length - 1] = { ...kept[kept.length - 1], item: canonical };
          kept.forEach((item, index) => { item.position = index + 1; });
        } else if (kept.length) {
          kept.forEach((item, index) => { item.position = index + 1; });
        }
        if (JSON.stringify(kept) !== JSON.stringify(node.itemListElement)) changed = true;
        node.itemListElement = kept;
      }
      for (const value of Object.values(node)) visit(value);
    };
    visit(data);
    if (data && data["@type"] === "BreadcrumbList" && (!Array.isArray(data.itemListElement) || !data.itemListElement.length)) return "";
    if (data && Array.isArray(data["@graph"])) {
      const graph = data["@graph"].filter(node => !(node && node["@type"] === "BreadcrumbList" && (!Array.isArray(node.itemListElement) || !node.itemListElement.length)));
      if (graph.length !== data["@graph"].length) {
        data["@graph"] = graph;
        changed = true;
      }
    }
    if (!changed) return whole;
    return `<script${attrs}>${JSON.stringify(data)}</script>`;
  });
}

function breadcrumbList(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function insertJsonLd(html, data, attr = "") {
  const extra = attr ? ` ${attr}` : "";
  return html.replace(/<\/head>/i, `<script type="application/ld+json"${extra}>${JSON.stringify(data)}</script>\n</head>`);
}

function ensureToolSchemas(html, options) {
  const { canonical, localeId, homeUrl, toolsUrl, name, description, calculatorHub, middleLabel } = options;
  const labels = labelsFor(localeId);
  if (!hasType(html, "BreadcrumbList")) {
    const crumbs = [
      { name: labels.home, url: homeUrl },
      { name: middleLabel || labels.tools, url: toolsUrl },
      { name: name, url: canonical }
    ];
    html = insertJsonLd(html, breadcrumbList(crumbs));
  }
  if (!calculatorHub && !hasType(html, "WebApplication") && !hasType(html, "SoftwareApplication")) {
    html = insertJsonLd(html, {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name,
      url: canonical,
      description,
      applicationCategory: "UtilitiesApplication",
      applicationSubCategory: "Network Engineering Calculator",
      operatingSystem: "Any",
      inLanguage: localeId === "zh" ? "zh-CN" : localeId === "es" ? "es" : "en",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "NetEngineerLab", url: options.siteUrl + "/" }
    });
  }
  return html;
}

function ensureGuideSchemas(html, options) {
  const { canonical, localeId, homeUrl, name, description, inLanguage } = options;
  const labels = labelsFor(localeId);
  if (!hasType(html, "Article")) {
    html = insertJsonLd(html, {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: name,
      name,
      description,
      url: canonical,
      inLanguage,
      mainEntityOfPage: canonical,
      author: { "@type": "Organization", name: "NetEngineerLab", url: options.siteUrl + "/" },
      publisher: { "@type": "Organization", name: "NetEngineerLab", url: options.siteUrl + "/" }
    });
  }
  if (!hasType(html, "BreadcrumbList")) {
    html = insertJsonLd(html, breadcrumbList([
      { name: labels.home, url: homeUrl },
      { name, url: canonical }
    ]));
  }
  return html;
}

function collectFaq(data, out = []) {
  walk(data, node => {
    if (node["@type"] !== "FAQPage" || !Array.isArray(node.mainEntity)) return;
    for (const question of node.mainEntity) {
      const name = typeof question?.name === "string" ? question.name.trim() : "";
      const answer = typeof question?.acceptedAnswer?.text === "string" ? question.acceptedAnswer.text.trim() : "";
      if (name && answer) out.push({ name, answer });
    }
  });
  return out;
}

function stripFaqNodes(node) {
  if (Array.isArray(node)) return node.map(stripFaqNodes).filter(Boolean);
  if (!node || typeof node !== "object") return node;
  if (node["@type"] === "FAQPage") return null;
  const copy = Array.isArray(node) ? [] : { ...node };
  if (Array.isArray(node["@graph"])) copy["@graph"] = node["@graph"].map(stripFaqNodes).filter(Boolean);
  return copy;
}

const DETAILS_RE = /<details\b[^>]*>[\s\S]*?<summary\b[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/details>/gi;
const FAQ_HEADING_SOURCE = "<h([1-3])\\b[^>]*>\\s*(Frequently asked questions|常见问题|Preguntas frecuentes)(?:\\s+[^<]{0,40})?\\s*<\\/h\\1>";
const INJECTED_FAQ_RE = /<section\b[^>]*\bdata-nel-faq\s*=\s*["']visible["'][^>]*>[\s\S]*?<\/section>\s*/gi;

function browserText(html) {
  return decodeEntities(String(html || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\u00a0/g, " ").trim();
}

function visibleFaq(html) {
  const found = [];
  const pattern = new RegExp(DETAILS_RE.source, "gi");
  let match;
  while ((match = pattern.exec(html))) {
    const name = browserText(match[1]);
    const answer = browserText(match[2]);
    if (name && answer) found.push({ name, answer, index: match.index, end: pattern.lastIndex });
  }
  return found;
}

function faqTokens(value) {
  return new Set(browserText(value).toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "").split(/[^\p{L}\p{N}]+/u).filter(token => token.length > 2));
}

function faqSimilar(left, right) {
  const a = faqTokens(left);
  const b = faqTokens(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

function elementBounds(html, tag, openEnd) {
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

function mainBounds(html) {
  const open = html.match(/<main\b[^>]*>/i);
  if (!open) return null;
  const innerStart = open.index + open[0].length;
  const bounds = elementBounds(html, "main", innerStart);
  if (!bounds) return null;
  // Calculator mains are a two-column grid. Supporting FAQ and related-link
  // sections stay body children so tool CSS can center them; nesting those
  // sections puts them in the grid. Every other main is the page column.
  const tool = /\b(?:tool-shell|nel-tool-grid|nel-tool-main|calculator-shell)\b/.test(open[0])
    || /\bid\s*=\s*["']calculator["']/i.test(open[0]);
  return {
    innerStart,
    innerEnd: bounds.innerEnd,
    end: bounds.end,
    tool,
    shell: !tool
  };
}

function faqHeadings(html) {
  return [...html.matchAll(new RegExp(FAQ_HEADING_SOURCE, "gi"))];
}

function injectedSections(html) {
  const sections = [];
  const pattern = new RegExp(INJECTED_FAQ_RE.source, "gi");
  let match;
  while ((match = pattern.exec(html))) {
    sections.push({ index: match.index, html: match[0], questions: visibleFaq(match[0]) });
  }
  return sections;
}

function dropInjectedFaq(html) {
  const injected = injectedSections(html);
  if (!injected.length) return { html, droppedQuestions: [] };
  let without = html;
  for (const section of injected.slice().sort((left, right) => right.index - left.index)) {
    without = without.slice(0, section.index) + without.slice(section.index + section.html.length);
  }
  const droppedQuestions = injected.flatMap(section => section.questions);
  // Another heading or an authored details list means this section is the
  // duplicate. Questions that existed only inside it must not be copied back.
  if (faqHeadings(without).length || /<details\b/i.test(without)) return { html: without, droppedQuestions };
  const main = mainBounds(without);
  if (!main || main.tool) return { html, droppedQuestions: [] };
  const block = injected[0].html.trim() + "\n";
  return {
    html: without.slice(0, main.innerEnd) + block + without.slice(main.innerEnd),
    droppedQuestions: []
  };
}

function authoredFaq(html) {
  const heading = new RegExp(FAQ_HEADING_SOURCE, "i").exec(html);
  if (!heading) return null;
  const headingEnd = heading.index + heading[0].length;
  const rest = html.slice(headingEnd);
  const nextHeading = rest.search(/<h2\b/i);
  const region = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;
  const details = visibleFaq(region).map(item => ({ name: item.name, answer: item.answer, end: headingEnd + item.end }));
  if (details.length) {
    return { kind: "details", questions: details.map(item => ({ name: item.name, answer: item.answer })), insertAt: details[details.length - 1].end };
  }
  const pairs = [];
  const pattern = /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  let end = headingEnd;
  while ((match = pattern.exec(region))) {
    const name = browserText(match[1]);
    const answer = browserText(match[2]);
    if (!name || !answer) continue;
    pairs.push({ name, answer });
    end = headingEnd + pattern.lastIndex;
  }
  if (!pairs.length) return null;
  return { kind: "headings", questions: pairs, insertAt: end };
}

function unwrapSupplementalFaq(html) {
  const pattern = /<section\b[^>]*\bclass\s*=\s*["'][^"']*\bseo-p1p2-content\b[^"']*["'][^>]*>/gi;
  const sections = [];
  const removed = [];
  let match;
  while ((match = pattern.exec(html))) {
    const bounds = elementBounds(html, "section", pattern.lastIndex);
    if (bounds) sections.push({ innerStart: pattern.lastIndex, innerEnd: bounds.innerEnd });
  }
  let next = html;
  for (const section of sections.reverse()) {
    const inner = next.slice(section.innerStart, section.innerEnd).replace(new RegExp(DETAILS_RE.source, "gi"), (whole, question, answer) => {
      const name = browserText(question);
      const text = browserText(answer);
      if (!name || !text) return whole;
      removed.push({ name, answer: text });
      return `<p><strong>${escapeHtml(name)}</strong> ${escapeHtml(text)}</p>`;
    });
    next = next.slice(0, section.innerStart) + inner + next.slice(section.innerEnd);
  }
  return { html: next, removed };
}

function detailMarkup(question) {
  return `<details><summary>${escapeHtml(question.name)}</summary><p>${escapeHtml(question.answer)}</p></details>`;
}

function faqSchema(questions) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(question => ({
      "@type": "Question",
      name: question.name,
      acceptedAnswer: { "@type": "Answer", text: question.answer }
    }))
  };
}

function stripFaqScripts(html) {
  return html.replace(JSONLD_SCRIPT, (whole, attrs, body) => {
    let data;
    try { data = JSON.parse(body.trim()); } catch { return whole; }
    if (data && data["@type"] === "FAQPage") return "";
    const stripped = stripFaqNodes(data);
    if (!stripped || (stripped["@graph"] && !stripped["@graph"].length && Object.keys(stripped).every(key => key === "@context" || key === "@graph"))) return "";
    if (JSON.stringify(stripped) === JSON.stringify(data)) return whole;
    return `<script${attrs}>${JSON.stringify(stripped)}</script>`;
  });
}

function insertInContent(html, block) {
  const main = mainBounds(html);
  if (main && main.shell) return html.slice(0, main.innerEnd) + block + html.slice(main.innerEnd);
  if (/<!-- NEL_FOOTER_START -->/i.test(html)) return html.replace(/<!-- NEL_FOOTER_START -->/i, `${block}<!-- NEL_FOOTER_START -->`);
  if (main) return html.slice(0, main.innerEnd) + block + html.slice(main.innerEnd);
  return html.replace(/<\/body>/i, `${block}</body>`);
}

function syncVisibleFaq(html, localeId) {
  const dropped = dropInjectedFaq(dedupeFaqId(html));
  html = dedupeFaqId(dropped.html);
  const droppedNames = new Set(dropped.droppedQuestions.map(item => item.name));
  const unwrapped = unwrapSupplementalFaq(html);
  html = unwrapped.html;
  const supplemental = unwrapped.removed;
  const fromSchema = [];
  for (const script of jsonLdScripts(html)) {
    if (script.data) collectFaq(script.data, fromSchema);
  }
  let faq = authoredFaq(html);
  let visible = faq ? faq.questions : [];
  if (!visible.length) {
    const details = visibleFaq(html);
    if (details.length) {
      visible = details.map(item => ({ name: item.name, answer: item.answer }));
      faq = { kind: "details", questions: visible, insertAt: details[details.length - 1].end };
    }
  }
  if (new Set(visible.map(item => item.name)).size !== visible.length) return fromSchema.length ? stripFaqScripts(html) : html;
  const additions = [];
  for (const question of fromSchema) {
    if (!question.name || !question.answer) continue;
    if (droppedNames.has(question.name)) continue;
    if (visible.some(item => item.name === question.name || faqSimilar(item.name, question.name) >= 0.6)) continue;
    if (supplemental.some(item => item.name === question.name || faqSimilar(item.name, question.name) >= 0.6)) continue;
    if (additions.some(item => item.name === question.name || faqSimilar(item.name, question.name) >= 0.6)) continue;
    additions.push(question);
  }
  if (!visible.length && !additions.length) return fromSchema.length ? stripFaqScripts(html) : html;
  let next = html;
  if (!visible.length) {
    const labels = labelsFor(localeId);
    const block = `<section class="content-section faq-section" data-nel-faq="visible"><h2>${escapeHtml(labels.faq)}</h2><div class="faq-grid">${additions.map(detailMarkup).join("")}</div></section>\n`;
    next = insertInContent(next, block);
  } else if (additions.length) {
    const markup = faq.kind === "headings"
      ? additions.map(question => `<h3>${escapeHtml(question.name)}</h3><p>${escapeHtml(question.answer)}</p>`).join("")
      : additions.map(detailMarkup).join("");
    next = next.slice(0, faq.insertAt) + markup + next.slice(faq.insertAt);
  }
  const questions = [...visible, ...additions];
  next = next.replace(/\n?<script\b[^>]*\bdata-nel-schema\s*=\s*["']faq["'][^>]*>[\s\S]*?<\/script>/i, "");
  next = stripFaqScripts(next);
  next = insertJsonLd(next, faqSchema(questions), 'data-nel-schema="faq"');
  return dedupeFaqId(next);
}

function dedupeFaqId(html) {
  const marks = html.match(/\bid=["']faq["']/gi) || [];
  if (marks.length < 2) return html;
  return html.replace(/(<section\b[^>]*\bfaq-section\b[^>]*)\sid=["']faq["']/gi, "$1");
}

function replaceMarkdownLinks(html, { locale, urlForRoute, relativeUrl, route }) {
  const currentUrl = urlForRoute(route, locale);
  return html.replace(/<a\b([^>]*?)\bhref\s*=\s*(["'])([^"']+\.md(?:\?[^"']*)?)\2([^>]*)>([\s\S]*?)<\/a>/gi, (whole, before, quote, href, after, inner) => {
    const file = href.split("?")[0].split("/").pop();
    const guide = GUIDE_MARKDOWN[file];
    if (guide) {
      const target = relativeUrl(currentUrl, urlForRoute(guide, locale));
      return `<a${before} href=${quote}${target}${quote}${after}>${inner}</a>`;
    }
    return inner;
  });
}

function contentFingerprint(html) {
  const title = pageTitle(html);
  const description = pageDescription(html);
  const body = String(html)
    .replace(/<!-- NEL_HEADER_START -->[\s\S]*?<!-- NEL_HEADER_END -->/g, " ")
    .replace(/<!-- NEL_FOOTER_START -->[\s\S]*?<!-- NEL_FOOTER_END -->/g, " ")
    .replace(/<!-- NEL_TOOL_RETURN_START -->[\s\S]*?<!-- NEL_TOOL_RETURN_END -->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${title}\n${description}\n${body}`;
}

const CLUSTER_LINKS = [
  {
    calculators: "tools/pon-fiber-calculators/",
    topics: ["topics/pon-optical/"],
    calc: {
      en: "These calculators are the measurement checklist. For design method, loss budgets and field troubleshooting, continue in the PON optical topic.",
      zh: "本页是计算器清单。设计方法、损耗预算和现场排障请继续阅读 PON 光网络专题。",
      es: "Esta página es la lista de calculadoras. El método de diseño, el presupuesto de pérdidas y el diagnóstico de campo están en el tema de PON óptico."
    },
    topic: {
      en: "To run the splitter, power-budget, distance, latency and OTDR calculators as a set, open the PON and fiber calculators hub.",
      zh: "若要成套使用分光、光功率预算、距离、时延和 OTDR 计算器，请打开 PON 与光纤计算器入口。",
      es: "Para usar juntas las calculadoras de divisor, presupuesto, distancia, latencia y OTDR, abra el hub de calculadoras PON y de fibra."
    }
  },
  {
    calculators: "tools/switching-bandwidth-calculators/",
    topics: ["topics/switch-oversubscription/"],
    calc: {
      en: "This hub is the calculator list for uplink, bandwidth and addressing math. Worked examples, LAG behavior and N-1 method live in the switch oversubscription topic.",
      zh: "本页汇总上联、带宽和编址计算。案例、LAG 行为与 N-1 方法在交换机超售比专题。",
      es: "Este hub lista las calculadoras de uplink, ancho de banda y direccionamiento. Los ejemplos, LAG y el método N-1 están en el tema de sobresuscripción."
    },
    topic: {
      en: "For the calculator checklist — oversubscription, bandwidth, subnet, VLAN and fabric capacity — open the switching and bandwidth calculators hub.",
      zh: "超售比、带宽、子网、VLAN 和织物容量计算器清单见交换与带宽计算器入口。",
      es: "La lista de calculadoras de sobresuscripción, ancho de banda, subred, VLAN y fabric está en el hub de conmutación y ancho de banda."
    }
  },
  {
    calculators: "tools/datacenter-power-calculators/",
    topics: ["topics/data-center-capacity/", "topics/data-center-cooling-capacity/"],
    calc: {
      en: "This page lists the power and cooling calculators. Capacity tradeoffs across IT load, space and uplinks are in the data center capacity topic; cooling formulas and N+1 checks are in the cooling capacity topic.",
      zh: "本页列出电源与制冷计算器。IT 负荷、空间与上联的容量取舍见数据中心容量专题；制冷公式和 N+1 校核见制冷容量专题。",
      es: "Esta página lista las calculadoras de energía y refrigeración. Las compensaciones de carga, espacio y uplinks están en el tema de capacidad del centro de datos; las fórmulas y N+1, en el tema de refrigeración."
    },
    topic: {
      "topics/data-center-capacity/": {
        en: "The matching calculator list — PoE, rack power, UPS, generator, rectifier and PUE — is the data center power and cooling calculators hub, separate from this planning topic.",
        zh: "对应的计算器清单（PoE、机柜功率、UPS、油机、整流器与 PUE）在数据中心电源与制冷计算器入口，与本规划专题分工不同。",
        es: "La lista de calculadoras (PoE, rack, UPS, generador, rectificador y PUE) está en el hub de energía y refrigeración, con un propósito distinto de este tema."
      },
      "topics/data-center-cooling-capacity/": {
        en: "Run the cooling-load, airflow, rack and PUE calculators from the data center power and cooling calculators hub. This topic keeps the method and examples.",
        zh: "制冷负荷、气流、机柜和 PUE 计算请从数据中心电源与制冷计算器入口进入。本专题保留方法与案例。",
        es: "Ejecute las calculadoras de carga térmica, caudal, rack y PUE desde el hub de energía y refrigeración. Este tema conserva el método y los ejemplos."
      }
    }
  }
];

function clusterSentence(entry, localeId, side, topicRoute) {
  const pack = side === "calc" ? entry.calc : entry.topic[topicRoute] || entry.topic;
  return pack[localeId] || pack.en;
}

function ensureClusterLinks(html, { route, locale, urlForRoute, relativeUrl, pageExists, fallbackLocale }) {
  html = html.replace(/<p class="hub-return" data-nel-cluster-link>[\s\S]*?<\/p>\s*/gi, "");
  const localeId = locale.id;
  const currentUrl = urlForRoute(route, locale);
  const published = target => {
    if (!pageExists || pageExists(target, locale)) return locale;
    if (fallbackLocale && (!pageExists || pageExists(target, fallbackLocale))) return fallbackLocale;
    return null;
  };
  const links = [];
  for (const entry of CLUSTER_LINKS) {
    if (route === entry.calculators) {
      const topicLocale = published(entry.topics[0]);
      if (topicLocale) links.push(`<a href="${escapeHtml(relativeUrl(currentUrl, urlForRoute(entry.topics[0], topicLocale)))}">${escapeHtml(clusterSentence(entry, localeId, "calc"))}</a>`);
      if (entry.topics[1]) {
        const coolingLocale = published(entry.topics[1]);
        if (coolingLocale) {
          const more = localeId === "zh" ? "制冷容量专题" : localeId === "es" ? "Tema de capacidad de refrigeración" : "Cooling capacity topic";
          links.push(`<a href="${escapeHtml(relativeUrl(currentUrl, urlForRoute(entry.topics[1], coolingLocale)))}">${escapeHtml(more)}</a>`);
        }
      }
      break;
    }
    if (entry.topics.includes(route)) {
      const calcLocale = published(entry.calculators);
      if (calcLocale) links.push(`<a href="${escapeHtml(relativeUrl(currentUrl, urlForRoute(entry.calculators, calcLocale)))}">${escapeHtml(clusterSentence(entry, localeId, "topic", route))}</a>`);
      break;
    }
  }
  if (!links.length) return html;
  const block = `<p class="hub-return" data-nel-cluster-link>${links.join(" ")}</p>\n`;
  return insertInContent(html, block);
}

const EDITORIAL_LINKS = [
  { source: "topics/ip-camera-network-bandwidth-poe/", target: "guides/ip-camera-network-bandwidth-poe/", en: "Camera bandwidth, PoE and NVR method", zh: "摄像头带宽、PoE 与 NVR 方法" },
  { source: "tools/ip-camera-network-planner/", target: "guides/ip-camera-network-bandwidth-poe/", en: "Read the IP camera bandwidth and PoE guide", zh: "阅读 IP 摄像头带宽与 PoE 指南" },
  { source: "tools/ip-camera-network-planner/", target: "topics/ip-camera-network-bandwidth-poe/", en: "Open the IP camera planning topic", zh: "打开 IP 摄像头规划专题" },
  { source: "tools/bandwidth-calculator/", target: "guides/bandwidth-transfer-time-guide/", en: "Bandwidth and transfer-time method", zh: "带宽与传输时间方法" },
  { source: "tools/subnet-calculator/", target: "guides/subnet-calculator-guide/", en: "How to calculate an IPv4 subnet", zh: "如何计算 IPv4 子网" },
  { source: "tools/pon-splitter-loss/", target: "guides/pon-splitter-loss-guide/", en: "PON splitter loss method", zh: "PON 分光损耗方法" },
  { source: "topics/pon-optical/", target: "guides/pon-splitter-loss-guide/", en: "Splitter cascade and ODN margin guide", zh: "分光级联与 ODN 余量指南" },
  { source: "topics/switch-oversubscription/", target: "guides/10g-vs-25g-uplinks/", en: "When to move a 10G uplink to 25G", zh: "何时把 10G 上联升到 25G" },
  { source: "tools/switching-bandwidth-calculators/", target: "guides/10g-vs-25g-uplinks/", en: "10G versus 25G uplink guide", zh: "10G 与 25G 上联指南" },
  { source: "tools/switching-bandwidth-calculators/", target: "guides/lacp-member-congestion/", en: "Why one LACP member is congested", zh: "为什么一条 LACP 成员链路拥塞" },
  { source: "topics/network-monitoring-observability/", target: "troubleshoot/evpn-control-plane-up-data-plane-down/", en: "EVPN control plane up, data plane down", zh: "EVPN 控制面正常而数据面中断" },
  { source: "topics/network-monitoring-observability/", target: "cases/evpn-ce-ping-failure/", en: "EVPN CE ping failure case", zh: "EVPN CE ping 失败案例" },
  { source: "topics/data-center-capacity/", target: "tools/engineering-report-batch-export-center/", en: "Batch engineering report export", zh: "工程报告批量导出" },
  { source: "tools/fiber-loss/", target: "guides/fiber-link-budget-guide/", en: "Fiber link budget method", zh: "光纤链路预算方法" },
  { source: "tools/optical-power-budget/", target: "guides/fiber-link-budget-guide/", en: "Fiber link budget method: loss, margin and maximum distance", zh: "光纤链路预算方法：损耗、余量与最大距离" },
  { source: "guides/fiber-link-budget-guide/", target: "tools/optical-power-budget/", en: "Check the full power window with the Optical Power Budget Calculator", zh: "用光功率预算计算器核对完整收发功率窗口" },
  { source: "topics/telecom-power-energy/", target: "tools/network-asset-lifecycle-tracker/", en: "Network asset lifecycle tracker", zh: "网络资产生命周期跟踪" },
  { source: "topics/telecom-power-energy/", target: "tools/oob-network-design-planner/", en: "Out-of-band network design workshop", zh: "带外网络设计工作坊" },
  { source: "tools/engineering-report-batch-export-center/", target: "tools/network-capacity-forecast-planner/", en: "Capacity forecast planner", zh: "容量预测规划", es: "Planificador de previsión de capacidad" }
];

function ensureEditorialLinks(html, { route, locale, urlForRoute, relativeUrl, pageExists }) {
  html = html.replace(/<section\b[^>]*\bdata-nel-editorial-links\b[^>]*>[\s\S]*?<\/section>\s*/gi, "");
  const additions = EDITORIAL_LINKS.filter(link => link.source === route && (link[locale.id] || link.en));
  if (!additions.length && route !== "tools/") return html;
  const currentUrl = urlForRoute(route, locale);
  const items = [];
  for (const link of additions) {
    if (!pageExists(link.target, locale)) continue;
    const href = relativeUrl(currentUrl, urlForRoute(link.target, locale));
    if (html.includes(href) || html.includes(urlForRoute(link.target, locale))) continue;
    items.push(`<a href="${escapeHtml(href)}">${escapeHtml(link[locale.id] || link.en)}</a>`);
  }
  if (route === "tools/" && locale.id !== "es") {
    for (const slug of ["network-asset-lifecycle-tracker", "oob-network-design-planner"]) {
      const target = `tools/${slug}/`;
      if (!pageExists(target, locale)) continue;
      const href = relativeUrl(currentUrl, urlForRoute(target, locale));
      if (html.includes(`>${slug}<`) || html.includes(href)) continue;
      const label = slug === "network-asset-lifecycle-tracker"
        ? (locale.id === "zh" ? "网络资产生命周期跟踪" : "Network asset lifecycle tracker")
        : (locale.id === "zh" ? "带外网络设计工作坊" : "OOB network design workshop");
      items.push(`<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`);
    }
  }
  if (route === "tools/" && locale.id === "es" && pageExists("tools/engineering-report-batch-export-center/", locale)) {
    const href = relativeUrl(currentUrl, urlForRoute("tools/engineering-report-batch-export-center/", locale));
    if (!html.includes(href)) items.push(`<a href="${escapeHtml(href)}">${escapeHtml("Centro de exportación de informes")}</a>`);
  }
  if (!items.length) return html;
  const heading = locale.id === "zh" ? "相关页面" : locale.id === "es" ? "Páginas relacionadas" : "Related pages";
  const block = `<section class="content-section" data-nel-editorial-links><h2>${heading}</h2><p>${items.join(" · ")}</p></section>\n`;
  return insertInContent(html, block);
}

function renderLlmsTxt({ siteUrl, toolCatalog, routes, activeLocales }) {
  const lines = [
    "# NetEngineerLab",
    "",
    "> Free network engineering calculators, topic hubs and guides for fiber, PON, switching, data-center power and telecom planning. Published in English, Chinese (zh-CN) and Spanish where a translation exists.",
    "",
    `Canonical site: ${siteUrl}/`,
    `Chinese homepage: ${siteUrl}/zh/`,
    `Spanish homepage: ${siteUrl}/es/`,
    `Tools directory: ${siteUrl}/tools/`,
    `Chinese tools directory: ${siteUrl}/tools/zh/`,
    `Spanish tools directory: ${siteUrl}/tools/es/`,
    `Topics: ${siteUrl}/topics/`,
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
    "## Languages",
    "",
    "Active locales are English (`en`), Chinese (`zh-CN`) and Spanish (`es`). `x-default` is English. A tool or guide has an hreflang alternate only when that locale page exists. Tool URLs stay `/tools/<slug>/`, `/tools/<slug>/zh/` and `/tools/<slug>/es/`.",
    "",
    "## Tools",
    ""
  ];
  const tools = toolCatalog.filter(tool => tool.status === "active").slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
  for (const tool of tools) {
    const name = tool.translations?.en?.name || tool.id;
    const locales = activeLocales
      .filter(locale => locale.id === "en" || tool.translations?.[locale.catalogKey] || tool.translations?.[locale.id])
      .map(locale => locale.id)
      .join(", ");
    lines.push(`- ${name} (${locales}): ${siteUrl}/tools/${tool.id}/`);
  }
  lines.push("", "## Calculator hubs", "");
  lines.push(`- PON and fiber calculators: ${siteUrl}/tools/pon-fiber-calculators/`);
  lines.push(`- Switching and bandwidth calculators: ${siteUrl}/tools/switching-bandwidth-calculators/`);
  lines.push(`- Data center power and cooling calculators: ${siteUrl}/tools/datacenter-power-calculators/`);
  lines.push("", "Calculator hubs list tools. Topic hubs explain the design and troubleshooting path. They link to each other and do not share a title.", "");
  lines.push("## Topics", "");
  for (const route of routes.filter(item => item.route.startsWith("topics/") && item.indexable !== false)) {
    const title = route.translations?.en?.title || route.route;
    lines.push(`- ${title}: ${siteUrl}/${route.route}`);
  }
  lines.push("", "## Guides", "");
  for (const route of routes.filter(item => item.route.startsWith("guides/") && item.indexable !== false)) {
    const title = route.translations?.en?.title || route.route;
    lines.push(`- ${title}: ${siteUrl}/${route.route}`);
  }
  lines.push("", "## Usage notes", "", "Calculations are engineering aids. Validate assumptions, vendor specifications, standards and field conditions before deployment.", "");
  return lines.join("\n");
}

module.exports = {
  absoluteDirectoryUrl,
  contentFingerprint,
  ensureClusterLinks,
  ensureEditorialLinks,
  ensureGuideSchemas,
  ensureRobots,
  ensureToolSchemas,
  ensureTwitter,
  labelsFor,
  normalizeBreadcrumbs,
  pageDescription,
  pageTitle,
  replaceMarkdownLinks,
  renderLlmsTxt,
  syncVisibleFaq,
  visibleFaq
};
