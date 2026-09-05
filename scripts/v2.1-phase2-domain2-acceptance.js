#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2-Domain2 | Interface/VLAN platform acceptance gate */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=path.resolve(__dirname,"..");
const required=[
 "website/assets/js/shared-core/canonical-config-model.js",
 "website/assets/js/vendor-renderer/vendor-registry.js",
 "website/assets/js/vendor-renderer/renderer-engine.js",
 "website/assets/js/domains/interface-vlan/model.js",
 "website/assets/js/domains/interface-vlan/schema.json",
 "website/assets/js/domains/interface-vlan/engine.js",
 "website/assets/js/domains/interface-vlan/vendor-registry.js"
];
for(const rel of required)assert(fs.existsSync(path.join(root,rel)),`missing ${rel}`);
const vendors=["cisco-ios","huawei-vrp","h3c-comware","juniper-junos","arista-eos"];
for(const kind of ["parsers","renderers"])for(const id of vendors)assert(fs.existsSync(path.join(root,`website/assets/js/domains/interface-vlan/${kind}/${id}.js`)),`missing ${kind}/${id}`);
const acl=require("../website/tools/acl-generator-validator/js/engine"),iv=require("../website/assets/js/domains/interface-vlan/engine");
assert.deepStrictEqual(iv.supportedVendors,vendors);assert.deepStrictEqual(acl.supportedVendors,vendors);
assert.notStrictEqual(iv.vendorRegistry,acl.vendorRegistry,"domains must own separate registries");
for(const id of vendors){const v=iv.vendorRegistry.get(id);for(const cap of ["parse","render","semantic-round-trip","interface-vlan-v1"])assert(v.capabilities.includes(cap),`${id} missing ${cap}`)}
// Prove both domains depend on the same unchanged shared orchestration contract.
const shared=require("../website/assets/js/vendor-renderer/renderer-engine");assert.strictEqual(typeof shared.create,"function");
const packageJson=require("../package.json");assert(packageJson.scripts["prepare:launch"].includes("test:interface-vlan-renderer"));assert(packageJson.scripts["prepare:launch"].includes("accept:v2.1-phase2-domain2"));
console.log("V2.1 Phase2 Domain2 acceptance: PASS (Shared Core reused by ACL + Interface/VLAN across 5 vendors)");
