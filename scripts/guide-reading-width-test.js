#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const {chromium} = require("playwright");

const root = path.resolve(__dirname, "..");
const siteRoot = path.join(root, "website");
const widths = [320, 375, 768, 1024, 1280];

function pages() {
  const routes = [];
  for (const locale of ["", "zh/", "es/"]) {
    for (const section of ["guides", "topics"]) {
      const dir = path.join(siteRoot, locale, section);
      if (!fs.existsSync(dir)) continue;
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        if (!entry.isDirectory()) continue;
        const file = path.join(dir, entry.name, "index.html");
        if (fs.existsSync(file)) routes.push(`/${locale}${section}/${entry.name}/`);
      }
    }
  }
  return routes.sort();
}

function listen() {
  const types = {".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".json": "application/json"};
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const rel = urlPath.endsWith("/") ? `${urlPath}index.html` : urlPath;
    const file = path.normalize(path.join(siteRoot, rel));
    if (!file.startsWith(siteRoot)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, {"content-type": types[path.extname(file)] || "application/octet-stream"});
      res.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function measure(page) {
  return page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const reading = document.querySelector("article.guide-article, main.guide-content > article, main");
    const broken = [];
    const roots = [h1, document.querySelector(".guide-hero")].filter(Boolean);
    for (const rootNode of roots) {
      const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const source = node.textContent;
        const pattern = /[A-Za-z]{6,}/g;
        let match;
        while ((match = pattern.exec(source))) {
          const range = document.createRange();
          range.setStart(node, match.index);
          range.setEnd(node, match.index + match[0].length);
          if (range.getClientRects().length > 1) broken.push(match[0]);
        }
      }
    }
    const widthOf = element => element ? Math.round(element.getBoundingClientRect().width) : 0;
    return {
      h1: widthOf(h1),
      reading: widthOf(reading),
      broken,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
}

async function measureColumn(page) {
  return page.evaluate(() => {
    const hub = document.querySelector(".hub-return");
    const article = document.querySelector(".guide-article");
    const related = document.querySelector("main.guide-shell > .content-section");
    const box = element => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {left: Math.round(rect.left), right: Math.round(rect.right)};
    };
    const previous = hub && hub.previousElementSibling;
    return {
      direct: Boolean(hub && hub.parentElement && hub.parentElement.classList.contains("guide-shell")),
      column: Boolean(previous && previous.classList.contains("guide-layout")),
      hub: box(hub),
      article: box(article),
      related: box(related),
      tools: box(document.querySelector("main .topic-tools"))
    };
  });
}

async function main() {
  const routes = pages();
  if (routes.length < 20) {
    console.error(`expected the guide and topic page set, found ${routes.length}`);
    process.exit(1);
  }
  const server = await listen();
  const {port} = server.address();
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();
  const failures = [];
  try {
    for (const width of widths) {
      await page.setViewportSize({width, height: 900});
      for (const route of routes) {
        const response = await page.goto(`http://127.0.0.1:${port}${route}`, {waitUntil: "domcontentloaded"});
        if (!response || response.status() !== 200) {
          failures.push(`${width} ${route} status ${response ? response.status() : "none"}`);
          continue;
        }
        const info = await measure(page);
        const wide = width >= 1024;
        const readingFloor = wide ? 600 : width - 80;
        const titleFloor = wide ? 480 : Math.min(240, width - 56);
        if (info.overflow > 1) failures.push(`${width} ${route} horizontal overflow ${info.overflow}`);
        if (info.h1 < titleFloor) failures.push(`${width} ${route} h1 width ${info.h1} < ${titleFloor}`);
        if (info.reading < readingFloor) failures.push(`${width} ${route} reading width ${info.reading} < ${readingFloor}`);
        if (info.broken.length) failures.push(`${width} ${route} title word split ${info.broken.join(", ")}`);
        const column = await measureColumn(page);
        if (column.direct && column.hub && column.column && column.article) {
          if (Math.abs(column.hub.left - column.article.left) > 2 || Math.abs(column.hub.right - column.article.right) > 2) {
            failures.push(`${width} ${route} cluster link ${column.hub.left}-${column.hub.right} article ${column.article.left}-${column.article.right}`);
          }
          if (column.related && (Math.abs(column.hub.left - column.related.left) > 2 || Math.abs(column.hub.right - column.related.right) > 2)) {
            failures.push(`${width} ${route} cluster link ${column.hub.left}-${column.hub.right} related ${column.related.left}-${column.related.right}`);
          }
        }
        if (column.direct && column.hub && !column.column && column.tools) {
          if (Math.abs(column.hub.left - column.tools.left) > 2 || Math.abs(column.hub.right - column.tools.right) > 2) {
            failures.push(`${width} ${route} cluster link ${column.hub.left}-${column.hub.right} tools ${column.tools.left}-${column.tools.right}`);
          }
        }
      }
    }
    for (const width of [1024, 375]) {
      await page.setViewportSize({width, height: 900});
      for (const route of ["/guides/generator-fuel-runtime-planning/", "/zh/guides/generator-fuel-runtime-planning/"]) {
        await page.goto(`http://127.0.0.1:${port}${route}`, {waitUntil: "domcontentloaded"});
        const paint = await page.evaluate(() => {
          const heading = document.getElementById("calculate");
          const block = heading && heading.nextElementSibling;
          const link = block && block.querySelector("a");
          const blue = [];
          const nodes = block ? [block, ...block.querySelectorAll("*")] : [];
          for (const el of nodes) {
            const style = getComputedStyle(el);
            const image = style.backgroundImage;
            const color = style.backgroundColor;
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            const alpha = match && match[4] !== undefined ? Number(match[4]) : 1;
            const saturated = match && alpha > 0.04 && Number(match[3]) > Number(match[1]) + 25 && Number(match[3]) > 80;
            if ((image && image !== "none") || saturated) blue.push(`${el.tagName}.${el.className} ${color} ${image}`);
          }
          const linkStyle = link ? getComputedStyle(link) : null;
          return {
            missing: !block || !link,
            blue,
            display: linkStyle && linkStyle.display,
            decoration: linkStyle && linkStyle.textDecorationLine,
            h1: Math.round(document.querySelector("h1").getBoundingClientRect().width),
            article: Math.round((document.querySelector("article") || document.querySelector("main")).getBoundingClientRect().width)
          };
        });
        if (paint.missing) failures.push(`${width} ${route} calculator prompt missing`);
        if (paint.blue.length) failures.push(`${width} ${route} blue background ${paint.blue.join(" | ")}`);
        if (paint.display !== "inline") failures.push(`${width} ${route} calculator link display ${paint.display}`);
        if (!paint.decoration || !paint.decoration.includes("underline")) failures.push(`${width} ${route} calculator link decoration ${paint.decoration}`);
        if (width === 1024 && (paint.h1 < 480 || paint.article < 600)) failures.push(`${width} ${route} column regressed h1 ${paint.h1} article ${paint.article}`);
      }
    }
    await page.setViewportSize({width: 1024, height: 900});
    await page.goto(`http://127.0.0.1:${port}/guides/switch-oversubscription-ratio/`, {waitUntil: "domcontentloaded"});
    const button = await page.evaluate(() => {
      const link = document.querySelector(".guide-cta a");
      return link ? getComputedStyle(link).backgroundColor : "";
    });
    if (button !== "rgb(23, 111, 242)") failures.push(`other guide buttons changed: ${button}`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`Guide reading width PASS (${routes.length} pages × ${widths.join("/")} )`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
