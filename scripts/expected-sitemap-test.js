#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const {expectedSitemapPathnames, sitemapPathnamesFromXml} = require("./lib/expected-sitemap");

const root = path.resolve(__dirname, "..");
const sitemapXml = fs.readFileSync(path.join(root, "website", "sitemap.xml"), "utf8");
const actual = sitemapPathnamesFromXml(sitemapXml);
const expected = expectedSitemapPathnames();
const actualSet = new Set(actual);
const missing = [...expected].filter(pathname => !actualSet.has(pathname)).sort();
const extra = [...actualSet].filter(pathname => !expected.has(pathname)).sort();

assert.equal(actual.length, actualSet.size, "built sitemap contains duplicate URLs");
assert.deepEqual(missing, [], `built sitemap is missing expected URLs: ${missing.join(", ")}`);
assert.deepEqual(extra, [], `built sitemap has unexpected URLs: ${extra.join(", ")}`);
assert.equal(expected.size, actualSet.size);

assert.equal(expected.has("/es/guides/10g-vs-25g-uplinks/"), false);
assert.equal(expected.has("/es/topics/switch-oversubscription/"), false);
assert.equal(expected.has("/zh/guides/10g-vs-25g-uplinks/"), false);
assert.equal(expected.has("/guides/onu-rx-power-range/"), false, "duplicate guide is a 301 to the fiber link budget guide");
assert.equal(actualSet.has("/guides/onu-rx-power-range/"), false);
assert.equal(expected.has("/zh/tools/pon-fiber-calculators/"), false);
assert.equal(expected.has("/tools/pon-fiber-calculators/zh/"), true);
assert.equal(expected.has("/tools/pon-fiber-calculators/es/"), true);
assert.equal(expected.has("/guides/10g-vs-25g-uplinks/"), true);
assert.equal(expected.has("/zh/guides/switch-oversubscription-ratio/"), true);
assert.equal(expected.has("/tools/application-bandwidth-analyzer/"), true);
assert.equal(expected.has("/tools/application-bandwidth-analyzer/zh/"), true);
assert.equal(expected.has("/tools/ip-camera-network-planner/"), true);
assert.equal(expected.has("/tools/ip-camera-network-planner/es/"), false);

console.log(`Expected sitemap set PASS (${expected.size} URLs match website/sitemap.xml).`);
