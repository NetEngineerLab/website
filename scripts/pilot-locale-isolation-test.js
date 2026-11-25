#!/usr/bin/env node
"use strict";
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "website");
const drafts = path.join(root, "drafts", "locale-rollout", "website");
const pilots = new Set(["bandwidth-calculator", "subnet-calculator", "fiber-latency-calculator", "ethernet-serialization-delay-calculator", "stp-path-cost-calculator", "chromatic-dispersion-calculator", "copper-propagation-delay-calculator", "shannon-capacity-calculator", "tcp-mathis-throughput-estimator", "mm1-queue-delay-calculator", "ethernet-line-coding-calculator", "dc-feeder-voltage-drop-calculator", "itu-dwdm-grid-calculator", "edfa-ase-osnr-estimator", "path-availability-calculator", "fiber-loss", "pmd-budget-calculator", "pon-splitter-loss", "pon-distance", "poe-power-budget-calculator", "poe-voltage-drop-calculator", "pathway-fill-calculator", "ospf-cost-calculator", "route-summarization-calculator", "wireless-link-budget-calculator", "pue-data-center-energy-efficiency", "dns-ttl-propagation-calculator"]);
const locales = new Set(["id", "pt-br"]);

assert.ok(fs.existsSync(path.join(drafts, "id", "index.html")), "Indonesian home draft must stay outside website/");
assert.ok(fs.existsSync(path.join(drafts, "pt-br", "index.html")), "Brazilian Portuguese home draft must stay outside website/");
assert.ok(fs.existsSync(path.join(drafts, "tools", "fiber-loss", "id", "index.html")), "non-pilot tool draft must stay outside website/");

function walk(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else found.push(full);
  }
  return found;
}

const published = [];
for (const file of walk(site)) {
  const rel = path.relative(site, file).split(path.sep);
  const localeIndex = rel.findIndex(part => locales.has(part));
  const manifest = /^manifest-(id|pt-br)\.webmanifest$/.test(path.basename(file));
  if (localeIndex === -1 && !manifest) continue;
  const shell = rel.join("/");
  const allowedShell = new Set([
    "id/index.html", "pt-br/index.html", "tools/id/index.html", "tools/pt-br/index.html",
    "id/about/index.html", "id/contact/index.html", "id/privacy/index.html", "id/terms/index.html",
    "pt-br/about/index.html", "pt-br/contact/index.html", "pt-br/privacy/index.html", "pt-br/terms/index.html"
  ]);
  const tool = rel[0] === "tools" ? rel[1] : "";
  assert.ok(allowedShell.has(shell) || pilots.has(tool), `unpublished locale file is still in the publish directory: ${path.relative(root, file)}`);
  published.push(path.relative(root, file));
}
assert.equal(published.filter(file => file.endsWith(`${path.sep}index.html`) || file.endsWith("/index.html")).length, 66);

const sitemap = fs.readFileSync(path.join(site, "sitemap.xml"), "utf8");
for (const url of [
  "https://netengineerlab.com/tools/bandwidth-calculator/id/",
  "https://netengineerlab.com/tools/bandwidth-calculator/pt-br/",
  "https://netengineerlab.com/tools/subnet-calculator/id/",
  "https://netengineerlab.com/tools/subnet-calculator/pt-br/",
  "https://netengineerlab.com/tools/fiber-latency-calculator/id/",
  "https://netengineerlab.com/tools/fiber-latency-calculator/pt-br/",
  "https://netengineerlab.com/tools/ethernet-serialization-delay-calculator/id/",
  "https://netengineerlab.com/tools/ethernet-serialization-delay-calculator/pt-br/",
  "https://netengineerlab.com/tools/stp-path-cost-calculator/id/",
  "https://netengineerlab.com/tools/stp-path-cost-calculator/pt-br/",
  "https://netengineerlab.com/tools/chromatic-dispersion-calculator/id/",
  "https://netengineerlab.com/tools/chromatic-dispersion-calculator/pt-br/",
  "https://netengineerlab.com/tools/copper-propagation-delay-calculator/id/",
  "https://netengineerlab.com/tools/copper-propagation-delay-calculator/pt-br/",
  "https://netengineerlab.com/tools/shannon-capacity-calculator/id/",
  "https://netengineerlab.com/tools/shannon-capacity-calculator/pt-br/",
  "https://netengineerlab.com/tools/tcp-mathis-throughput-estimator/id/",
  "https://netengineerlab.com/tools/tcp-mathis-throughput-estimator/pt-br/",
  "https://netengineerlab.com/tools/mm1-queue-delay-calculator/id/",
  "https://netengineerlab.com/tools/mm1-queue-delay-calculator/pt-br/",
  "https://netengineerlab.com/tools/ethernet-line-coding-calculator/id/",
  "https://netengineerlab.com/tools/ethernet-line-coding-calculator/pt-br/",
  "https://netengineerlab.com/tools/dc-feeder-voltage-drop-calculator/id/",
  "https://netengineerlab.com/tools/dc-feeder-voltage-drop-calculator/pt-br/",
  "https://netengineerlab.com/tools/itu-dwdm-grid-calculator/id/",
  "https://netengineerlab.com/tools/itu-dwdm-grid-calculator/pt-br/",
  "https://netengineerlab.com/tools/edfa-ase-osnr-estimator/id/",
  "https://netengineerlab.com/tools/edfa-ase-osnr-estimator/pt-br/",
  "https://netengineerlab.com/tools/path-availability-calculator/id/",
  "https://netengineerlab.com/tools/path-availability-calculator/pt-br/",
  "https://netengineerlab.com/tools/fiber-loss/id/",
  "https://netengineerlab.com/tools/fiber-loss/pt-br/",
  "https://netengineerlab.com/tools/pmd-budget-calculator/id/",
  "https://netengineerlab.com/tools/pmd-budget-calculator/pt-br/",
  "https://netengineerlab.com/tools/pon-splitter-loss/id/",
  "https://netengineerlab.com/tools/pon-splitter-loss/pt-br/",
  "https://netengineerlab.com/tools/pon-distance/id/",
  "https://netengineerlab.com/tools/pon-distance/pt-br/",
  "https://netengineerlab.com/tools/poe-power-budget-calculator/id/",
  "https://netengineerlab.com/tools/poe-power-budget-calculator/pt-br/",
  "https://netengineerlab.com/tools/poe-voltage-drop-calculator/id/",
  "https://netengineerlab.com/tools/poe-voltage-drop-calculator/pt-br/",
  "https://netengineerlab.com/tools/pathway-fill-calculator/id/",
  "https://netengineerlab.com/tools/pathway-fill-calculator/pt-br/",
  "https://netengineerlab.com/tools/ospf-cost-calculator/id/",
  "https://netengineerlab.com/tools/ospf-cost-calculator/pt-br/",
  "https://netengineerlab.com/tools/route-summarization-calculator/id/",
  "https://netengineerlab.com/tools/route-summarization-calculator/pt-br/",
  "https://netengineerlab.com/tools/wireless-link-budget-calculator/id/",
  "https://netengineerlab.com/tools/wireless-link-budget-calculator/pt-br/",
  "https://netengineerlab.com/tools/pue-data-center-energy-efficiency/id/",
  "https://netengineerlab.com/tools/pue-data-center-energy-efficiency/pt-br/",
  "https://netengineerlab.com/tools/dns-ttl-propagation-calculator/id/",
  "https://netengineerlab.com/tools/dns-ttl-propagation-calculator/pt-br/"
]) assert.ok(sitemap.includes(`<loc>${url}</loc>`), url);
for (const url of [
  "https://netengineerlab.com/id/",
  "https://netengineerlab.com/pt-br/",
  "https://netengineerlab.com/tools/id/",
  "https://netengineerlab.com/tools/pt-br/",
  "https://netengineerlab.com/id/about/",
  "https://netengineerlab.com/id/contact/",
  "https://netengineerlab.com/id/privacy/",
  "https://netengineerlab.com/id/terms/",
  "https://netengineerlab.com/pt-br/about/",
  "https://netengineerlab.com/pt-br/contact/",
  "https://netengineerlab.com/pt-br/privacy/",
  "https://netengineerlab.com/pt-br/terms/"
]) assert.ok(sitemap.includes(`<loc>${url}</loc>`), url);
for (const blocked of ["https://netengineerlab.com/guides/id/", "https://netengineerlab.com/topics/id/", "https://netengineerlab.com/tools/optical-power-budget/id/"]) {
  assert.ok(!sitemap.includes(`<loc>${blocked}</loc>`), blocked);
}

const bandwidth = fs.readFileSync(path.join(site, "tools", "bandwidth-calculator", "js", "app.js"), "utf8");
const subnet = fs.readFileSync(path.join(site, "tools", "subnet-calculator", "js", "app.js"), "utf8");
assert.match(bandwidth, /minute:"menit"/);
assert.match(bandwidth, /minute:"minutos"/);
assert.match(subnet, /invalidIPv4:"Masukkan alamat IPv4/);
assert.match(subnet, /invalidIPv4:"Informe um endereço IPv4/);
assert.doesNotMatch(fs.readFileSync(path.join(site, "tools", "bandwidth-calculator", "js", "engine.js"), "utf8"), /menit|minutos/);
assert.doesNotMatch(fs.readFileSync(path.join(site, "tools", "subnet-calculator", "js", "engine.js"), "utf8"), /Masukkan|Informe um endereço/);

console.log("Pilot locale isolation PASS");
