"use strict";

const HOME_STYLESHEET = "assets/css/home-fresh.css";
const OBSOLETE_HOME_STYLESHEET = "assets/css/home-mobile-layout.css";

function linkedStylesheets(html, pageUrl) {
  const refs = [];
  for (const match of String(html || "").matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\brel\s*=\s*["'][^"']*\bstylesheet\b[^"']*["']/i.test(tag)) continue;
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    let url;
    try {
      url = new URL(href, pageUrl);
    } catch {
      continue;
    }
    refs.push({
      href,
      pathname: decodeURIComponent(url.pathname).replace(/^\/+/, ""),
      version: url.searchParams.get("v") || "",
      abs: url.href
    });
  }
  return refs;
}

function stripComments(css) {
  return String(css || "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function mediaBlocks(css) {
  const blocks = [];
  const re = /@media\b([^{]*)\{/g;
  let match;
  while ((match = re.exec(css))) {
    let index = match.index + match[0].length;
    let depth = 1;
    while (index < css.length && depth) {
      if (css[index] === "{") depth++;
      else if (css[index] === "}") depth--;
      index++;
    }
    blocks.push({
      query: match[1],
      body: css.slice(match.index + match[0].length, index - 1),
      start: match.index,
      end: index
    });
  }
  return blocks;
}

function withoutMedia(css, blocks) {
  let text = css;
  for (const block of [...blocks].reverse()) {
    text = text.slice(0, block.start) + text.slice(block.end);
  }
  return text;
}

function maxWidthPx(query) {
  const match = String(query).match(/max-width\s*:\s*(\d+(?:\.\d+)?)px/i);
  return match ? Number(match[1]) : null;
}

function declarations(ruleBody) {
  const map = new Map();
  for (const part of String(ruleBody).split(";")) {
    const index = part.indexOf(":");
    if (index < 0) continue;
    map.set(part.slice(0, index).trim().toLowerCase(), part.slice(index + 1).trim().replace(/\s+/g, " "));
  }
  return map;
}

function rules(css) {
  const found = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(css))) {
    found.push({selector: match[1], declarations: declarations(match[2])});
  }
  return found;
}

function declarationFor(css, selectorFragment, property) {
  for (const rule of rules(css)) {
    if (!rule.selector.includes(selectorFragment)) continue;
    const value = rule.declarations.get(property);
    if (value) return value;
  }
  return "";
}

function trackCount(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  if (!normalized || normalized === "none") return 0;
  const compact = normalized.replace(/\s+/g, "");
  const repeat = compact.match(/^repeat\((\d+),/);
  if (repeat) return Number(repeat[1]);
  if (/^(?:1fr|minmax\(0,1fr\)|auto|100%)$/.test(compact)) return 1;
  let depth = 0;
  let tracks = 1;
  for (const character of normalized) {
    if (character === "(") depth++;
    else if (character === ")") depth--;
    else if (character === " " && depth === 0) tracks++;
  }
  return tracks;
}

function stylesheetApplicabilityErrors(css) {
  const errors = [];
  const clean = stripComments(css);
  const blocks = mediaBlocks(clean);
  const base = withoutMedia(clean, blocks);
  if (!/body\.home-fresh\b/.test(clean)) errors.push("stylesheet has no body.home-fresh rules");
  const background = declarationFor(base, "body.home-fresh", "background");
  if (!/#f4f8fc\b/i.test(background)) errors.push("missing body.home-fresh background #f4f8fc");
  if (declarationFor(base, ".hf-hero h1", "font-size").replace(/\s+/g, "") !== "48px") {
    errors.push("missing body.home-fresh h1 font-size 48px");
  }
  if (trackCount(declarationFor(base, ".hf-caps", "grid-template-columns")) !== 2) {
    errors.push("missing desktop two-column .hf-caps");
  }
  const tablet = blocks.filter(block => maxWidthPx(block.query) === 960);
  if (!tablet.some(block => trackCount(declarationFor(block.body, ".hf-hero", "grid-template-columns")) === 1 && declarationFor(block.body, ".hf-hero-art", "display") === "none" && declarationFor(block.body, ".hf-hero h1", "font-size").replace(/\s+/g, "") === "34px")) {
    errors.push("missing max-width 960px stacked hero, hidden art, and 34px heading");
  }
  const phone = blocks.filter(block => {
    const width = maxWidthPx(block.query);
    return width !== null && width <= 640;
  });
  for (const selector of [".hf-caps", ".hf-steps", ".hf-split", ".hf-grid", ".hf-search"]) {
    if (!phone.some(block => trackCount(declarationFor(block.body, selector, "grid-template-columns")) === 1)) {
      errors.push(`missing max-width <=640px single-column ${selector}`);
    }
  }
  return errors;
}

function homepageStyleErrors({pathname = "/", html, pageUrl, css}) {
  const errors = [];
  const links = linkedStylesheets(html, pageUrl);
  const live = links.find(link => link.pathname === HOME_STYLESHEET);
  const obsolete = links.find(link => link.pathname === OBSOLETE_HOME_STYLESHEET);
  if (!live) {
    errors.push(`${pathname}: missing ${HOME_STYLESHEET}`);
    if (obsolete) errors.push(`${pathname}: ${OBSOLETE_HOME_STYLESHEET} does not style body.home-fresh`);
    return errors;
  }
  if (!css) {
    errors.push(`${pathname}: ${HOME_STYLESHEET} was not fetched`);
    return errors;
  }
  if (css.status !== 200) errors.push(`${pathname}: ${HOME_STYLESHEET} HTTP ${css.status}`);
  if (css.actualHash !== css.expectedHash) errors.push(`${pathname}: ${HOME_STYLESHEET} hash ${css.actualHash || "missing"}, expected ${css.expectedHash}`);
  for (const item of stylesheetApplicabilityErrors(css.text || "")) errors.push(`${pathname}: ${item}`);
  return errors;
}

module.exports = {
  HOME_STYLESHEET,
  OBSOLETE_HOME_STYLESHEET,
  linkedStylesheets,
  stylesheetApplicabilityErrors,
  homepageStyleErrors,
  trackCount
};
