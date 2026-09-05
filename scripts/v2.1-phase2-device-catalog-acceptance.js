#!/usr/bin/env node
"use strict";
const assert=require("assert"),C=require("../website/assets/js/device-platform-catalog/device-platform-registry"),P=require("../website/assets/js/platform-profiles/platform-profile-registry"),R=require("../website/assets/js/device-platform-catalog/interface-resolver"),E=require("../website/assets/js/domains/interface-vlan/engine");
assert.strictEqual(C.ids.length,5);for(const d of C.all){const p=P.get(d.platformProfileId);assert.strictEqual(p.vendor,d.vendor);assert(d.portGroups.length>0);assert(d.sources.length>0)}
const out=E.renderIntent({deviceId:"cisco-c9200l-24t-4g",selector:{groupId:"downlink",port:24},intent:{description:"User access",mode:"access",accessVlan:20}});assert(out.configuration.includes("GigabitEthernet1/0/24"));assert.strictEqual(out.resolution.platformProfileId,"cisco-ios-campus-switch");
assert.throws(()=>R.resolve({deviceId:"juniper-ex3400-24t",selector:{groupId:"sfp-uplink",port:0}}),/auto_resolution_not_supported/);
console.log("V2.1 Phase2 Device Catalog acceptance: PASS (device -> port map -> resolver -> profile -> renderer)");
