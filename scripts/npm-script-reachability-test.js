"use strict";
const assert = require("node:assert/strict");
const { reachableNpmScripts } = require("./lib/npm-script-reachability");
const scripts = { prepare: "npm run build && npm run gate", build: "node build.js", gate: "npm run required && npm run required-longer", required: "node required.js", "required-longer": "node other.js", unused: "node unused.js" };
assert.deepEqual([...reachableNpmScripts(scripts, "prepare")].sort(), ["build", "gate", "prepare", "required", "required-longer"]);
assert.equal(reachableNpmScripts(scripts, "build").has("required"), false);
assert.equal(reachableNpmScripts({ entry: "echo npm run required", required: "node required.js" }, "entry").has("required"), false);
assert.equal(reachableNpmScripts({ entry: 'echo "x && npm run required"', required: "node required.js" }, "entry").has("required"), false);
for (const entry of ["npm run valid || npm run required", "npm run required; echo done", "npm run required || echo ignored", "echo done; npm run required"]) {
  assert.throws(() => reachableNpmScripts({ entry, valid: "node valid.js", required: "node required.js" }, "entry"), /Unsupported npm script control chain/);
}
assert.throws(() => reachableNpmScripts({ entry: "npm run missing" }, "entry"), /Unknown npm script: entry -> missing/);
assert.throws(() => reachableNpmScripts({ entry: "npm run child", child: "npm run entry" }, "entry"), /npm script cycle: entry -> child -> entry/);
assert.throws(() => reachableNpmScripts({ entry: "npm run valid && npm run missing", valid: "node valid.js" }, "entry"), /Unknown npm script/);
console.log("npm script reachability tests: PASS");
