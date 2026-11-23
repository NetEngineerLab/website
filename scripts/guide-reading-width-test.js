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
  for (const locale of ["", "zh/"]) {
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
      }
    }
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
