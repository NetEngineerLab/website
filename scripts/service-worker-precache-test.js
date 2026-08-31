#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { parsePrecacheAssets, hasPrecacheAsset, precachePathIssues } = require("./service-worker-precache");

const verbose = 'const CACHE = "cache";\nconst CORE = ["./index.html","./js/engine.js?v=abc123"]; self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))));';
assert.deepEqual(parsePrecacheAssets(verbose), ["./index.html", "./js/engine.js?v=abc123"]);
assert.equal(hasPrecacheAsset(verbose, "./js/engine.js"), true);

const compact = 'const C="cache",A=["./index.html","./js/engine.js"]; self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A))));';
assert.equal(hasPrecacheAsset(compact, "./js/engine.js"), true);
assert.equal(hasPrecacheAsset('const CACHE="c"; const CORE = ["./index.html", "./js/engine.js",]; self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));', "./js/engine.js"), true);

for (const bypass of [
  'const CORE = ["./index.html"];\n// "./js/engine.js"',
  'const CORE = ["./index.html"];\nconst decoy = "./js/engine.js";',
  'const CACHE = "real"; const CORE = ["./index.html"];\n// const C="decoy",A=["./js/engine.js"];',
  '// const CACHE="decoy"; const CORE=["./js/engine.js"];\nconst CACHE="real"; const CORE=["./index.html"];',
  '/* const CACHE="decoy"; const CORE=["./js/engine.js"]; */\nconst CACHE="real"; const CORE=["./index.html"];',
  'const CACHE="real"; const CORE=["./index.html"];\n/* const CACHE="decoy"; const CORE=["./js/engine.js"]; */',
  'const decoy = `const CORE=["./js/engine.js"]`; const CACHE="real"; const CORE=["./index.html"];',
  'function decoy(){ const CORE=["./js/engine.js"]; } const CACHE="real"; const CORE=["./index.html"];',
  'const CORE=["./index.html"], A=["./js/engine.js"];',
  'const CORE = ["./index.html", 42];',
  'const CACHE="real"; const CORE=["./js/engine.js"]; const REAL=["./index.html"]; self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(REAL))));',
  'const CACHE="real"; const CORE=["./js/engine.js"]; self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>{ CORE.pop(); return c.addAll(CORE); })));',
  'const CACHE="real"; const CORE=["./js/engine.js"]; const alias=CORE; self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(alias))));',
  'const CACHE="real"; const CORE=["./js/engine.js"]; self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>{ CORE.length=0; return c.addAll(CORE); })));',
  'const CACHE="real"; const CORE=["./js/engine.js"]; self.addEventListener("activate",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));',
  'const CACHE="real"; const CORE=["./js/engine.js"]; const fake={addAll(){return Promise.resolve();}}; self.addEventListener("install",event=>event.waitUntil(fake.addAll(CORE)));',
  'const CACHE="real"; const CORE=["./js/engine.js"]; const fake={addAll(){}}; self.addEventListener("install",()=>{},fake.addAll(CORE));',
  'const CACHE="real"; const CORE=["./js/engine.js"]; self.addEventListener("install",event=>caches.open(CACHE).then(cache=>cache.addAll(CORE)));',
  'const CACHE="real"; const CORE=["./js/engine.js"]; self.addEventListener("install",event=>event.waitUntil(Promise.resolve().then(cache=>cache.addAll(CORE))));',
  'const CACHE="cache",CORE=["./js/engine.js"]; const caches={open(){return Promise.resolve({addAll(){return Promise.resolve();}})}}; self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));',
  'const CACHE="cache",CORE=["./js/engine.js"]; const self={addEventListener(){}}; self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));',
  'const CACHE="cache",CORE=["./js/engine.js"]; self.addEventListener("install",(event,caches)=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));',
  'const CACHE="cache",CORE=["./js/engine.js"]; caches={open(){}}; self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));',
  'const CACHE="cache",CORE=["./js/engine.js"]; self.addEventListener("install",event=>event.waitUntil(Promise.resolve().then(()=>{caches.open(CACHE).then(cache=>cache.addAll(CORE));})));',
  'const CACHE="cache",CORE=["./js/engine.js"]; self.addEventListener("install",event=>event.waitUntil((caches.open(CACHE).then(cache=>cache.addAll(CORE)),Promise.resolve())));'
]) {
  assert.equal(hasPrecacheAsset(bypass, "./js/engine.js"), false);
}

const siteRoot = path.resolve(__dirname, "..", "website");
const toolRoot = path.join(siteRoot, "tools", "fiber-loss");
assert.deepEqual(precachePathIssues(["./", "./zh/", "./index.html", "../../data/locales.js"], toolRoot, siteRoot), []);
for (const invalidPath of [
  "../../../package.json",
  "C:/Windows/System32/drivers/etc/hosts",
  "/etc/passwd",
  "..\\..\\..\\package.json",
  "https://example.com/engine.js",
  "./missing-precache-file.js"
]) {
  assert(precachePathIssues([invalidPath], toolRoot, siteRoot).length > 0, invalidPath);
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nel-sw-precache-"));
try {
  const fixtureSite = path.join(fixtureRoot, "website");
  const fixtureTool = path.join(fixtureSite, "tools", "demo");
  const outside = path.join(fixtureRoot, "outside");
  fs.mkdirSync(fixtureTool, { recursive: true });
  fs.mkdirSync(outside, { recursive: true });
  fs.writeFileSync(path.join(outside, "secret.txt"), "outside deployment root");
  fs.symlinkSync(outside, path.join(fixtureTool, "linked"), process.platform === "win32" ? "junction" : "dir");
  assert(precachePathIssues(["./linked/secret.txt"], fixtureTool, fixtureSite).length > 0);
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("Service Worker precache parser tests: PASS");
