"use strict";

/**
 * Layout repairs applied to published HTML so later multilingual builds
 * cannot ship a consent script without its stylesheet, or leave calculator
 * inputs outside <main>.
 */

const TARGET_TOOL = /(?:^|\/)(?:generator-fuel-runtime-calculator|telecom-ac-dc-breaker-sizing)\//;
const STRAY_SECTION_IDS = ["before-after-inputs", "engineering-gates"];

function repairGeneratorInputIds(html) {
  return html
    .replace(/\bid=(["'])beforeGeneradorCount\1/g, 'id="beforeGeneratorCount"')
    .replace(/\bid=(["'])afterGeneradorCount\1/g, 'id="afterGeneratorCount"')
    .replace(/\bid=(["'])requiredGeneradors\1/g, 'id="requiredGenerators"')
    .replace(/\bid=(["'])startFalloPct\1/g, 'id="startFailurePct"');
}

// Every page that ships the consent-gated analytics loader must also ship the
// consent banner; otherwise accepted visitors are never measured there and the
// visitor cannot revisit the choice on that page.
function ensureCookieConsentScript(html, cookieJsSrc) {
  if (!/<script\b[^>]*\bsrc\s*=\s*["'][^"']*assets\/js\/analytics\.js/i.test(html)) return html;
  if (/<script\b[^>]*\bsrc\s*=\s*["'][^"']*cookie-consent\.js/i.test(html)) return html;
  if (!cookieJsSrc) throw new Error("cookieJsSrc is required when analytics.js is present without cookie-consent.js");
  if (!/<\/body>/i.test(html)) throw new Error("Page loads analytics.js but has no </body> for the consent script");
  return html.replace(/<\/body>(?![\s\S]*<\/body>)/i, `<script src="${cookieJsSrc}"></script>\n</body>`);
}

function ensureCookieConsentStyles(html, cookieCssHref) {
  if (!/<script\b[^>]*\bsrc\s*=\s*["'][^"']*cookie-consent\.js/i.test(html)) return html;
  if (/<link\b[^>]*\bhref\s*=\s*["'][^"']*cookie-consent\.css/i.test(html)) return html;
  if (!cookieCssHref) throw new Error("cookieCssHref is required when cookie-consent.js is present");
  const link = `<link rel="stylesheet" href="${cookieCssHref}">`;
  if (!/<\/head>/i.test(html)) throw new Error("Page loads cookie-consent.js but has no </head> for the stylesheet");
  return html.replace(/<\/head>/i, `${link}\n</head>`);
}

function sectionAt(html, start) {
  const open = /^<section\b[^>]*>/i.exec(html.slice(start));
  if (!open) return null;
  const tag = /<\/?section\b[^>]*>/gi;
  tag.lastIndex = start + open[0].length;
  let depth = 1;
  let match;
  while ((match = tag.exec(html))) {
    if (/^<\//.test(match[0])) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      const end = match.index + match[0].length;
      return {start, end, html: html.slice(start, end)};
    }
  }
  return null;
}

function extractSectionById(html, id) {
  const re = new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i");
  const match = re.exec(html);
  if (!match) return null;
  return sectionAt(html, match.index);
}

function extractDeratingPanel(html) {
  const re = /<section\b[^>]*\bclass=["'][^"']*\bpanel\b[^"']*["'][^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    const section = sectionAt(html, match.index);
    if (!section) continue;
    if (/id=["']ambientTempC["']/i.test(section.html) && !/id=["']before-after-inputs["']/i.test(section.html)) return section;
    re.lastIndex = section.end;
  }
  return null;
}

function takeMatch(html, found) {
  if (!found) return {html, taken: ""};
  return {html: html.slice(0, found.start) + html.slice(found.end), taken: found.html};
}

function relocateStrayToolSections(html) {
  const mainClose = html.search(/<\/main>/i);
  if (mainClose < 0) return html;
  let head = html.slice(0, mainClose);
  let tail = html.slice(mainClose);
  const moved = [];
  for (const id of STRAY_SECTION_IDS) {
    const next = takeMatch(tail, extractSectionById(tail, id));
    if (next.taken) {
      moved.push(next.taken);
      tail = next.html;
    }
  }
  const derate = takeMatch(tail, extractDeratingPanel(tail));
  if (derate.taken) {
    moved.push(derate.taken);
    tail = derate.html;
  }
  const hubRe = /<p\b(?![^>]*\bdata-nel-cluster-link\b)[^>]*\bclass=["'][^"']*\bhub-return\b[^"']*["'][^>]*>[\s\S]*?<\/p>\s*/i;
  const hub = tail.match(hubRe);
  let hubHtml = "";
  if (hub) {
    hubHtml = hub[0].trim();
    tail = tail.replace(hub[0], "");
  }
  if (!moved.length && !hubHtml) return html;
  if (moved.length) {
    const buttonRe = /<button\b[^>]*\bid=["']calculate["'][^>]*>[\s\S]*?<\/button>/i;
    const button = head.match(buttonRe);
    if (!button) throw new Error("Calculator inputs were outside <main> but the calculate button is missing");
    head = head.replace(button[0], `${moved.join("")}${button[0]}`);
  }
  if (hubHtml) head += `${hubHtml}\n`;
  return head + tail;
}

function repairPageLayout(html, rel, options = {}) {
  let next = repairGeneratorInputIds(html);
  next = ensureCookieConsentScript(next, options.cookieJsSrc);
  next = ensureCookieConsentStyles(next, options.cookieCssHref);
  if (TARGET_TOOL.test(String(rel || "").replace(/\\/g, "/"))) next = relocateStrayToolSections(next);
  return next;
}

module.exports = {
  repairPageLayout,
  repairGeneratorInputIds,
  ensureCookieConsentScript,
  ensureCookieConsentStyles,
  relocateStrayToolSections
};
