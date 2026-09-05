#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2 | Foundation acceptance gate */
"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const required=[
 "website/assets/js/shared-core/canonical-config-model.js",
 "website/assets/js/vendor-renderer/vendor-registry.js",
 "website/assets/js/vendor-renderer/renderer-engine.js",
 "website/tools/acl-generator-validator/js/vendor-registry.js",
 "website/tools/acl-generator-validator/js/parsers/arista-eos.js",
 "website/tools/acl-generator-validator/js/generators/arista-eos.js"
];
for(const rel of required)assert(fs.existsSync(path.join(root,rel)),`missing ${rel}`);
const engine=require("../website/tools/acl-generator-validator/js/engine");
assert.deepStrictEqual(engine.supportedVendors,["cisco-ios","huawei-vrp","h3c-comware","juniper-junos","arista-eos"]);
const registry=engine.vendorRegistry;
for(const id of engine.supportedVendors){const v=registry.get(id);assert(v.capabilities.includes("semantic-round-trip"));assert.strictEqual(typeof v.parse,"function");assert.strictEqual(typeof v.render,"function")}
const html=fs.readFileSync(path.join(root,"website/tools/acl-generator-validator/index.html"),"utf8");
for(const id of engine.supportedVendors)assert(html.includes(`value="${id}"`),`UI missing ${id}`);
for(const rel of ["../../assets/js/vendor-renderer/vendor-registry.js","../../assets/js/vendor-renderer/renderer-engine.js","js/vendor-registry.js","js/parsers/arista-eos.js","js/generators/arista-eos.js"])assert(html.includes(rel),`HTML missing script ${rel}`);
console.log("V2.1 Phase2 Foundation acceptance: PASS (Shared Core + 5 vendor ACL platform)");
