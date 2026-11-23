#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const engine = require(path.join(root, "website/tools/stp-path-cost-calculator/js/engine.js"));

let failed = 0;
const check = (name, ok, detail) => {
  if (!ok) {
    failed += 1;
    console.error("FAIL", name, detail || "");
  } else {
    console.log("PASS", name);
  }
};
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const frozen = "f5dac5b1767f171d474338c4f7b58648d4b83ec01ad7666a94d3a046543f2a14";
const engineFile = read("website/tools/stp-path-cost-calculator/js/engine.js");
check("frozen engine", crypto.createHash("sha256").update(engineFile).digest("hex") === frozen);

const longTopo = engine.calculate({method: "long", pathA: "10000, 10000", pathB: "1000"});
const shortTopo = engine.calculate({method: "short", pathA: "10000, 10000", pathB: "1000"});
const longAdd = engine.calculate({method: "long", pathA: "1000, 1000, 1000", pathB: "100"});
const shortAdd = engine.calculate({method: "short", pathA: "1000, 1000, 1000", pathB: "100"});
check("long topology", longTopo.ok && longTopo.totalA === 4000 && longTopo.totalB === 20000 && longTopo.winner === "A" && longTopo.display.difference === "16,000");
check("short topology", shortTopo.ok && shortTopo.totalA === 4 && shortTopo.totalB === 4 && shortTopo.winner === "tie" && shortTopo.status === "warning");
check("long addition", longAdd.ok && longAdd.totalA === 60000 && longAdd.totalB === 200000 && longAdd.winner === "A");
check("short addition", shortAdd.ok && shortAdd.totalA === 12 && shortAdd.totalB === 19 && shortAdd.winner === "A");
check("long formula rows", [
  [10, 2000000], [100, 200000], [1000, 20000], [10000, 2000], [25000, 800],
  [40000, 500], [100000, 200], [400000, 50], [1000000, 20], [10000000, 2]
].every(([mbps, cost]) => engine.longCost(mbps) === cost));
check("short rejects 25G", engine.calculate({method: "short", pathA: "25000", pathB: "1000"}).error === "short-undefined");

const pages = {
  en: "website/guides/stp-path-cost-explained/index.html",
  zh: "website/zh/guides/stp-path-cost-explained/index.html",
  es: "website/es/guides/stp-path-cost-explained/index.html"
};
const h1 = {
  en: "STP Path Cost Explained: Reference Table, Root Path Cost and Calculation",
  zh: "STP 路径开销说明：参考表、根路径开销与计算",
  es: "Coste de ruta STP: tabla de referencia, coste a la raíz y cálculo"
};
const canonical = {
  en: "https://netengineerlab.com/guides/stp-path-cost-explained/",
  zh: "https://netengineerlab.com/zh/guides/stp-path-cost-explained/",
  es: "https://netengineerlab.com/es/guides/stp-path-cost-explained/"
};
const toolBack = {
  en: 'href="../../guides/stp-path-cost-explained/"',
  zh: 'href="../../../zh/guides/stp-path-cost-explained/"',
  es: 'href="../../../es/guides/stp-path-cost-explained/"'
};
const markers = {
  en: ["4,000", "20,000", "16,000", "60,000", "200,000", "10000, 10000", "1000, 1000, 1000", "Table 17-3", "802.1D-1998", "Dot1t", "Rapid PVST+"],
  zh: ["4,000", "20,000", "16,000", "60,000", "200,000", "10000, 10000", "1000, 1000, 1000", "表 17-3", "802.1D-1998", "Dot1t", "Rapid PVST+"],
  es: ["4,000", "20,000", "16,000", "60,000", "200,000", "10000, 10000", "1000, 1000, 1000", "tabla 17-3", "802.1D-1998", "Dot1t", "Rapid PVST+"]
};

for (const [locale, file] of Object.entries(pages)) {
  const html = read(file);
  const found = ((html.match(/<h1>([^<]+)<\/h1>/) || [])[1] || "");
  check(file + " h1", found === h1[locale], found);
  check(file + " canonical", html.includes(`rel="canonical" href="${canonical[locale]}"`));
  check(file + " hreflang en", html.includes('hreflang="en" href="https://netengineerlab.com/guides/stp-path-cost-explained/"'));
  check(file + " hreflang zh", html.includes('hreflang="zh-CN" href="https://netengineerlab.com/zh/guides/stp-path-cost-explained/"'));
  check(file + " hreflang es", html.includes('hreflang="es" href="https://netengineerlab.com/es/guides/stp-path-cost-explained/"'));
  check(file + " x-default", html.includes('hreflang="x-default" href="https://netengineerlab.com/guides/stp-path-cost-explained/"'));
  check(file + " shell", html.includes('class="guide-shell"') && html.includes("guide-related-side") && !html.includes("guide-content"));
  for (const marker of markers[locale]) check(file + " " + marker, html.includes(marker));
  check(file + " separates modes", html.includes("id=\"long\"") && html.includes("id=\"short\"") && html.includes("id=\"modes\""));
  const banned = ["default on modern RSTP", "现代 RSTP/MSTP 默认", "predeterminado en RSTP/MSTP", "RSTP/MSTP use the same", "RSTP/MSTP 采用同样", "RSTP/MSTP usan los mismos"];
  check(file + " no protocol default conflation", banned.every(phrase => !html.includes(phrase)));
  const aside = (html.match(/<aside class="guide-toc guide-related-side"[\s\S]*?<\/aside>/) || [])[0] || "";
  const links = [...aside.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)];
  check(file + " sidebar count", links.length === 2, String(links.length));
  for (const [, href, text] of links) {
    const target = path.resolve(path.dirname(path.join(root, file)), href, "index.html");
    const targetHtml = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
    const targetH1 = ((targetHtml.match(/<h1[^>]*>([^<]+)/) || [])[1] || "").replace(/&amp;/g, "&");
    check(file + " sidebar " + href, targetH1 === text.replace(/&amp;/g, "&"), targetH1);
  }
  const toolFile = locale === "en"
    ? "website/tools/stp-path-cost-calculator/index.html"
    : `website/tools/stp-path-cost-calculator/${locale}/index.html`;
  const toolHtml = read(toolFile);
  check(toolFile + " links article", toolHtml.includes(toolBack[locale]) && toolHtml.includes(h1[locale]));
  check(toolFile + " no RSTP default", !toolHtml.includes("default on modern RSTP") && !toolHtml.includes("现代 RSTP/MSTP 默认") && !toolHtml.includes("predeterminado en RSTP/MSTP"));
}

const registry = JSON.parse(read("website/data/sitemap-routes.json"));
const record = registry.routes.find(route => route.route === "guides/stp-path-cost-explained/");
check("registry record", Boolean(record && record.indexable && record.translations.en && record.translations.zh && record.translations.es && record.sources.length === 5));
for (const index of ["website/guides/index.html", "website/zh/guides/index.html", "website/es/guides/index.html"]) {
  check(index + " lists article", read(index).includes("stp-path-cost-explained/"));
}

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("PASS stp path cost article");
