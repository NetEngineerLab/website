#!/usr/bin/env node
"use strict";
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "website");
const drafts = path.join(root, "drafts", "locale-rollout", "website");
const pilots = new Set(["bandwidth-calculator", "subnet-calculator"]);
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
  const tool = rel[0] === "tools" ? rel[1] : "";
  assert.ok(pilots.has(tool), `unpublished locale file is still in the publish directory: ${path.relative(root, file)}`);
  published.push(path.relative(root, file));
}
assert.equal(published.filter(file => file.endsWith(`${path.sep}index.html`) || file.endsWith("/index.html")).length, 4);

const sitemap = fs.readFileSync(path.join(site, "sitemap.xml"), "utf8");
for (const url of [
  "https://netengineerlab.com/tools/bandwidth-calculator/id/",
  "https://netengineerlab.com/tools/bandwidth-calculator/pt-br/",
  "https://netengineerlab.com/tools/subnet-calculator/id/",
  "https://netengineerlab.com/tools/subnet-calculator/pt-br/"
]) assert.ok(sitemap.includes(`<loc>${url}</loc>`), url);
for (const blocked of ["https://netengineerlab.com/id/", "https://netengineerlab.com/pt-br/", "https://netengineerlab.com/tools/id/", "https://netengineerlab.com/tools/fiber-loss/id/"]) {
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
