#!/usr/bin/env node
"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const routes = JSON.parse(fs.readFileSync(path.join(root, "website/data/sitemap-routes.json"), "utf8"));

const pages = [
  ["website/guides/fiber-loss-per-kilometer/index.html", "en", "guides/fiber-loss-per-kilometer/"],
  ["website/zh/guides/fiber-loss-per-kilometer/index.html", "zh", "zh/guides/fiber-loss-per-kilometer/"],
  ["website/es/guides/fiber-loss-per-kilometer/index.html", "es", "es/guides/fiber-loss-per-kilometer/"],
  ["website/guides/onu-rx-power-troubleshooting/index.html", "en", "guides/onu-rx-power-troubleshooting/"],
  ["website/zh/guides/onu-rx-power-troubleshooting/index.html", "zh", "zh/guides/onu-rx-power-troubleshooting/"],
  ["website/es/guides/onu-rx-power-troubleshooting/index.html", "es", "es/guides/onu-rx-power-troubleshooting/"]
];

function meta(html, name) {
  const tag = html.match(new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "i"));
  return tag ? (tag[0].match(/\bcontent=["']([^"']*)["']/i) || [])[1] : "";
}

for (const [file, locale, route] of pages) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const family = routes.routes.find(item => route.endsWith(item.route) && item.route.endsWith(route.slice(route.indexOf("guides/"))));
  assert.ok(family, file + " missing registry family");
  const translation = family.translations[locale];
  const title = (html.match(/<title>(.*?)<\/title>/) || [])[1];
  assert.equal(title, translation.title, file + " title");
  assert.equal(meta(html, "description"), translation.description, file + " description");
  assert.ok(html.includes(`href="https://netengineerlab.com/${route}"`), file + " canonical");
  assert.ok(html.includes('rel="alternate"'), file + " hreflang");
  assert.equal((html.match(/<h1>/g) || []).length, 1, file + " one h1");
  for (const leaked of ["608", "9.49", "28.64", "1417", "impressions", "展示"]) {
    assert.equal(html.includes(leaked), false, file + " leaked private search text " + leaked);
  }
}

const fiberNumbers = ["0.30", "0.40", "12", "3.60", "4.80", "4.90", "0.408", "−4.90", "0.35", "0.25", "UNKNOWN", "G.652"];
for (const file of pages.filter(item => item[0].includes("fiber-loss-per-kilometer")).map(item => item[0])) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const token of fiberNumbers) assert.ok(html.includes(token), file + " missing " + token);
  assert.ok(html.includes("https://www.itu.int/rec/T-REC-G.652/en"), file + " G.652 source");
  assert.ok(html.includes("optical-power-budget/"), file + " power budget link");
  assert.ok(html.includes("fiber-loss/"), file + " fiber calculator link");
  assert.ok(html.includes("onu-rx-power-troubleshooting/"), file + " troubleshooting link");
}

const onuTokens = ["UNKNOWN", "G.984.2", "G.9807.1"];
for (const file of pages.filter(item => item[0].includes("onu-rx-power-troubleshooting")).map(item => item[0])) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const token of onuTokens) assert.ok(html.includes(token), file + " missing " + token);
  assert.equal(html.includes("-27 dBm"), false, file + " reused an example threshold");
  assert.equal(html.includes("−27"), false, file + " reused an example threshold");
  assert.ok(html.includes("fiber-loss-per-kilometer/"), file + " per-km link");
  assert.ok(html.includes("onu-rx-power/"), file + " calculator link");
  assert.ok(html.includes("onu-receive-level-warning-margin/"), file + " warning example link");
  assert.ok(html.includes("optical-power-budget/"), file + " budget link");
}

const linked = [
  ["website/tools/fiber-loss/index.html", "guides/fiber-loss-per-kilometer/"],
  ["website/tools/fiber-loss/zh/index.html", "zh/guides/fiber-loss-per-kilometer/"],
  ["website/tools/fiber-loss/es/index.html", "es/guides/fiber-loss-per-kilometer/"],
  ["website/tools/optical-power-budget/index.html", "guides/fiber-loss-per-kilometer/"],
  ["website/tools/optical-power-budget/zh/index.html", "zh/guides/fiber-loss-per-kilometer/"],
  ["website/tools/optical-power-budget/es/index.html", "es/guides/fiber-loss-per-kilometer/"],
  ["website/tools/onu-rx-power/index.html", "guides/onu-rx-power-troubleshooting/"],
  ["website/tools/onu-rx-power/zh/index.html", "zh/guides/onu-rx-power-troubleshooting/"],
  ["website/tools/onu-rx-power/es/index.html", "es/guides/onu-rx-power-troubleshooting/"],
  ["website/guides/fiber-link-budget-guide/index.html", "fiber-loss-per-kilometer/"],
  ["website/zh/guides/fiber-link-budget-guide/index.html", "fiber-loss-per-kilometer/"],
  ["website/topics/pon-optical/index.html", "guides/fiber-loss-per-kilometer/"],
  ["website/topics/pon-optical/index.html", "guides/onu-rx-power-troubleshooting/"],
  ["website/zh/topics/pon-optical/index.html", "guides/fiber-loss-per-kilometer/"],
  ["website/es/topics/pon-optical/index.html", "guides/onu-rx-power-troubleshooting/"]
];
for (const [file, href] of linked) {
  assert.ok(fs.readFileSync(path.join(root, file), "utf8").includes(href), file + " missing " + href);
}

const expected = {
  "website/tools/pon-splitter-loss/js/engine.js": "c33958d704aee5fdc4c0325347f43941ba9955d79c62c87dafa2abac5332d0ab",
  "website/tools/optical-power-budget/js/engine.js": "5e03675c092d8afb3412717dbc340abcc32c1b8db9d34f84c7d0822eea37cd22",
  "website/tools/onu-rx-power/js/engine.js": "872ecd6d2578c2be79818e7d3f4bcabf1191d03ee41264fe096054642b95c818"
};
for (const [file, hash] of Object.entries(expected)) {
  const digest = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex");
  assert.equal(digest, hash, file + " engine changed");
}

assert.equal(Number((0.3 * 12).toFixed(2)), 3.6);
assert.equal(Number((0.4 * 12).toFixed(2)), 4.8);
assert.equal(Number((3.6 + 1 + 0.3).toFixed(2)), 4.9);
assert.equal(Number((4.9 / 12).toFixed(3)), 0.408);
assert.equal(Number((0 - 4.9).toFixed(2)), -4.9);

console.log("PASS fiber and ONU content 3.60 4.90 -4.90");
