#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2-PlatformProfileV1 | Platform profile acceptance gate */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path");const root=path.resolve(__dirname,"..");
const required=["website/assets/js/platform-profiles/platform-profile-model.js","website/assets/js/platform-profiles/platform-profile-registry.js","website/assets/js/platform-profiles/platform-profile-engine.js","scripts/platform-profile-contract-test.js"];
for(const rel of required)assert(fs.existsSync(path.join(root,rel)),`missing ${rel}`);
const P=require("../website/assets/js/platform-profiles/platform-profile-engine"),E=require("../website/assets/js/domains/interface-vlan/engine");
assert.strictEqual(P.registry.ids.length,5);assert.strictEqual(E.platformProfiles,P);
for(const vendor of E.supportedVendors)assert.strictEqual(P.registry.forVendor(vendor).length,1,`${vendor} must have one baseline profile`);
const pkg=require("../package.json");assert(pkg.scripts["prepare:launch"].includes("test:platform-profiles"));assert(pkg.scripts["prepare:launch"].includes("accept:v2.1-phase2-platform-profile"));
console.log("V2.1 Phase2 Platform Profile acceptance: PASS (platform-aware capability gate integrated with Interface/VLAN renderer)");
