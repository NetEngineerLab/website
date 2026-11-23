#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const {stableFileHash} = require("./stable-text-hash");
const {
  HOME_STYLESHEET,
  OBSOLETE_HOME_STYLESHEET,
  linkedStylesheets,
  stylesheetApplicabilityErrors,
  homepageStyleErrors
} = require("./lib/home-style-contract");

const root = path.resolve(__dirname, "..");
const freshCss = fs.readFileSync(path.join(root, "website", HOME_STYLESHEET), "utf8");
const obsoleteCss = fs.readFileSync(path.join(root, "website", OBSOLETE_HOME_STYLESHEET), "utf8");
const freshHash = stableFileHash(path.join(root, "website", HOME_STYLESHEET), 12);
const {parseCatalog} = require("./production-online-check");
const monitorSource = fs.readFileSync(path.join(root, "scripts/production-online-check.js"), "utf8");

function cssResult(text, actualHash = freshHash) {
  return {status: 200, text, actualHash, expectedHash: freshHash};
}

assert.deepEqual(stylesheetApplicabilityErrors(freshCss), [], "checked-out home-fresh.css must satisfy the live homepage contract");
const obsoleteErrors = stylesheetApplicabilityErrors(obsoleteCss);
assert.ok(obsoleteErrors.length > 0, "home-mobile-layout.css must fail the live homepage contract");
assert.ok(obsoleteErrors.some(error => error.includes("body.home-fresh")), obsoleteErrors.join("; "));
assert.ok(stylesheetApplicabilityErrors("").some(error => error.includes("body.home-fresh")));
assert.ok(stylesheetApplicabilityErrors(freshCss.replaceAll("body.home-fresh", ".home-page")).some(error => error.includes("body.home-fresh")));

const widenedPhone = freshCss.replace("@media (max-width:640px)", "@media (max-width:800px)");
assert.ok(stylesheetApplicabilityErrors(widenedPhone).some(error => error.includes("max-width <=640px")), "a tablet query must not satisfy the phone layout");

const twoColumnPhone = freshCss.replace(".hf-search{grid-template-columns:minmax(0,1fr)}", ".hf-search{grid-template-columns:repeat(2,minmax(0,1fr))}");
const twoColumnErrors = stylesheetApplicabilityErrors(twoColumnPhone);
for (const selector of [".hf-caps", ".hf-steps", ".hf-split", ".hf-grid", ".hf-search"]) {
  assert.ok(twoColumnErrors.some(error => error.includes(`single-column ${selector}`)), `${selector}: ${twoColumnErrors.join("; ")}`);
}

const removedPhone = freshCss.replace(/@media \(max-width:640px\)\{[\s\S]*?\n\}/, "");
assert.ok(stylesheetApplicabilityErrors(removedPhone).some(error => error.includes("single-column .hf-caps")), "deleting the phone breakpoint must fail");

for (const [file, pathname, pageUrl] of [
  ["website/index.html", "/", "https://netengineerlab.com/"],
  ["website/zh/index.html", "/zh/", "https://netengineerlab.com/zh/"],
  ["website/es/index.html", "/es/", "https://netengineerlab.com/es/"]
]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const links = linkedStylesheets(html, pageUrl);
  assert.equal(links.some(link => link.pathname === HOME_STYLESHEET), true, `${pathname} must link ${HOME_STYLESHEET}`);
  assert.equal(links.some(link => link.pathname === OBSOLETE_HOME_STYLESHEET), false, `${pathname} must not depend on ${OBSOLETE_HOME_STYLESHEET}`);
  assert.deepEqual(homepageStyleErrors({pathname, html, pageUrl, css: cssResult(freshCss)}), [], pathname);

  const stripped = html.replace(/<link\b[^>]*home-fresh\.css[^>]*>/i, "");
  const missing = homepageStyleErrors({pathname, html: stripped, pageUrl, css: null});
  assert.ok(missing.some(error => error.includes(`missing ${HOME_STYLESHEET}`)), missing.join("; "));
  assert.equal(missing.some(error => error.includes(OBSOLETE_HOME_STYLESHEET)), false);

  const obsoleteOnly = stripped.replace("</head>", `<link rel="stylesheet" href="${pathname === "/" ? "" : "../"}${OBSOLETE_HOME_STYLESHEET}?v=9969972f2232"></head>`);
  const obsoletePage = homepageStyleErrors({pathname, html: obsoleteOnly, pageUrl, css: cssResult(obsoleteCss)});
  assert.ok(obsoletePage.some(error => error.includes(`missing ${HOME_STYLESHEET}`)), obsoletePage.join("; "));
  assert.ok(obsoletePage.some(error => error.includes("does not style body.home-fresh")), obsoletePage.join("; "));
}

const english = fs.readFileSync(path.join(root, "website/index.html"), "utf8");
const hashedButUseless = homepageStyleErrors({
  pathname: "/",
  html: english,
  pageUrl: "https://netengineerlab.com/",
  css: {status: 200, text: obsoleteCss, actualHash: freshHash, expectedHash: freshHash}
});
assert.equal(hashedButUseless.some(error => error.includes("hash")), false, "a matching hash must not hide CSS that does not apply");
assert.ok(hashedButUseless.some(error => error.includes("body.home-fresh")), hashedButUseless.join("; "));

const wrongHash = homepageStyleErrors({
  pathname: "/",
  html: english,
  pageUrl: "https://netengineerlab.com/",
  css: cssResult(freshCss, "000000000000")
});
assert.deepEqual(wrongHash, ["/: assets/css/home-fresh.css hash 000000000000, expected " + freshHash]);

const unavailable = homepageStyleErrors({
  pathname: "/",
  html: english,
  pageUrl: "https://netengineerlab.com/",
  css: {status: 404, text: "", actualHash: "", expectedHash: freshHash}
});
assert.ok(unavailable.some(error => error.includes("HTTP 404")));
assert.ok(unavailable.some(error => error.includes("body.home-fresh")));

assert.equal(monitorSource.includes(OBSOLETE_HOME_STYLESHEET), false, "production monitor must not require the obsolete stylesheet");
assert.equal(monitorSource.includes("homepageStyleErrors"), true);
assert.equal(monitorSource.includes("auditHomepageStyles(homePages)"), true);
assert.equal(monitorSource.includes("homepage stylesheet loads and applies"), true);

const catalogSource = fs.readFileSync(path.join(root, "website/data/tools-catalog.js"), "utf8");
const catalogJson = JSON.parse(fs.readFileSync(path.join(root, "website/data/tools-catalog.json"), "utf8")).filter(tool => tool.status === "active");
assert.deepEqual(parseCatalog(catalogSource).map(tool => tool.id), catalogJson.map(tool => tool.id));
assert.deepEqual(parseCatalog(`${catalogSource}\nwindow.dispatchEvent(new Event("nel:tools-ready"));`).map(tool => tool.id), catalogJson.map(tool => tool.id));
assert.deepEqual(parseCatalog('window.NEL_TOOLS=[{"id":"a","name":"x]y"}];\nwindow.dispatchEvent(new Event("nel:tools-ready"));'), [{id: "a", name: "x]y"}]);
for (const broken of ["", "window.NEL_TOOLS=", "window.NEL_TOOLS=[{]", "var OTHER=[]"]) {
  assert.throws(() => parseCatalog(broken), /Unable to parse window\.NEL_TOOLS|JSON/, broken);
}

console.log(`Homepage style contract PASS (${stylesheetApplicabilityErrors(freshCss).length} live errors, ${obsoleteErrors.length} obsolete-file errors, hash ${freshHash}, ${catalogJson.length} tools).`);
