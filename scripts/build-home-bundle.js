#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../website/assets/css");
const parts = ["design-tokens.css", "site.css", "site-shell.css", "locale-menu.css", "home-fresh.css", "geist.css"];
let blob = "/* Homepage bundle. Regenerate with: node scripts/build-home-bundle.js\n   Source order: tokens, site, shell, locale menu, home, Geist. */\n";
for (const name of parts) {
  let text = fs.readFileSync(path.join(dir, name), "utf8");
  if (!text.endsWith("\n")) text += "\n";
  blob += `\n/* ${name} */\n${text}`;
}
const out = path.join(dir, "home-bundle.css");
if (process.argv.includes("--check")) {
  const current = fs.readFileSync(out, "utf8");
  if (current !== blob) {
    console.error("home-bundle.css is stale. Run node scripts/build-home-bundle.js");
    process.exit(1);
  }
  console.log("home-bundle.css matches its source files");
} else {
  fs.writeFileSync(out, blob);
  console.log(`wrote ${out} (${blob.length} bytes)`);
}
