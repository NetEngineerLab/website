'use strict';

const inventory = require('./ui-tool-audit-inventory');

// The shipped tool page puts the one h1 in the tool head, or inside the hero.
// The hero itself is eyebrow, a title (h1 or p.hero-title), one description, and four tags.
function checkDetailPage(html, rel, tool) {
  const errors = [];
  const need = (ok, message) => { if (!ok) errors.push(`${rel}: ${message}`); };
  need(/data-nel-template="tool-detail-v1\.3\.1"/.test(html), 'template must be tool-detail-v1.3.1');
  need(!/data-nel-template="tool-detail-v1\.3"/.test(html), 'obsolete v1.3 template marker remains');
  need(/data-nel-visual="network-change-planner-reference"/.test(html), 'missing visual reference');
  const counts = [
    ['header', /NEL_HEADER_START/g, 1],
    ['footer', /NEL_FOOTER_START/g, 1],
    ['breadcrumb', /class="breadcrumbs tool-return-nav"/g, 1],
    ['hero', /<section\b[^>]*class="[^"]*\bnel-tool-hero\b/g, 1],
    ['h1', /<h1(?:\s|>)/g, 1],
    ['header CTA', /class="site-shell-context-action"/g, 1]
  ];
  for (const [label, re, want] of counts) {
    const got = (html.match(re) || []).length;
    need(got === want, `${label} count ${got}, expected ${want}`);
  }
  const positions = [
    /<!-- NEL_HEADER_START -->/,
    /class="breadcrumbs tool-return-nav"/,
    /<section\b[^>]*class="[^"]*\bnel-tool-hero\b/,
    /<main\b[^>]*class="[^"]*\btool-shell\b[^"]*\bnel-tool-main\b/,
    /<!-- NEL_FOOTER_START -->/
  ].map(re => html.search(re));
  need(positions.every((pos, index) => pos >= 0 && (index === 0 || pos > positions[index - 1])), 'shell order must be header, return, hero, main, footer');

  const hero = (html.match(/<section\b[^>]*class="[^"]*\bnel-tool-hero\b[^"]*"[^>]*>[\s\S]*?<\/section>/) || [''])[0];
  const inner = (hero.match(/<div class="hero-inner">([\s\S]*?)<\/div>\s*<\/section>/) || [])[1] || '';
  need(Boolean(inner), 'canonical hero-inner missing');
  if (inner) {
    const eyebrow = inner.indexOf('class="eyebrow"');
    const h1At = inner.indexOf('<h1');
    const titleAt = inner.indexOf('class="hero-title"');
    const title = [h1At, titleAt].filter(index => index >= 0);
    const titleStart = title.length ? Math.min(...title) : -1;
    const titleEnd = h1At >= 0 ? inner.indexOf('</h1>') : inner.indexOf('</p>', titleStart);
    const description = titleEnd >= 0 ? inner.indexOf('<p', titleEnd) : -1;
    const tagsAt = inner.indexOf('class="hero-tags"');
    need(eyebrow >= 0 && titleStart > eyebrow && description > titleStart && tagsAt > description, 'hero sequence must be eyebrow, title, description, tags');
    const tags = (inner.match(/<div class="hero-tags">([\s\S]*?)<\/div>/) || [])[1] || '';
    const spans = [...tags.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/g)];
    need(spans.length === 4, `hero-tags count ${spans.length}, expected 4`);
    for (const span of spans) {
      const text = span[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
      need([...text].length <= 32, `hero tag too long (${[...text].length}): ${text}`);
    }
    need(!/class="(?:tags|chips|chip|hero-badges|hero-card|hero-note|hero-copy|hero-description)"/.test(inner), 'legacy hero child remains');
  }

  const mainTag = (html.match(/<main\b[^>]*>/) || [''])[0];
  const grid = /\bnel-tool-grid\b/.test(mainTag) && /\bnel-tool-primary-grid\b/.test(mainTag);
  const specialized = /\bnel-tool-specialized\b/.test(mainTag);
  if (inventory.complexTools.has(tool)) need(specialized, 'specialized tool lacks nel-tool-specialized');
  else {
    need(grid, 'ordinary main must declare nel-tool-grid and nel-tool-primary-grid');
    const inputAt = html.search(/<section\b[^>]*class="[^"]*\bnel-tool-input\b/);
    const resultAt = html.search(/<section\b[^>]*class="[^"]*\bnel-tool-result\b/);
    need(inputAt >= 0 && resultAt > inputAt, 'ordinary calculator input must precede result');
  }
  need(!/class="[^"]*\bstart-btn\b/.test(html), 'legacy start-btn in HTML');
  return errors;
}

// Tool stylesheets own the workbench. They do not own the shared site chrome.
const shellClasses = ['site-shell-header', 'site-shell-footer', 'site-shell-nav', 'site-shell-actions', 'site-shell-context-action', 'tool-return-nav', 'start-btn'];

function localShellSelector(css, className) {
  const re = new RegExp(`(^|[^\\w-])\\.${className}(?![\\w-])`, 'm');
  return re.test(css);
}

module.exports = { checkDetailPage, shellClasses, localShellSelector };
