#!/usr/bin/env node
"use strict";
const assert=require("assert"),R=require("../website/assets/js/device-platform-catalog/interface-resolver"),E=require("../website/assets/js/domains/interface-vlan/engine");
assert.strictEqual(R.catalog.ids.length,5);
const cases=[
 ["cisco-c9200l-24t-4g",{groupId:"downlink",port:1},"GigabitEthernet1/0/1"],
 ["huawei-s5735-l24t4s-a1",{groupId:"downlink",port:24},"GigabitEthernet0/0/24"],
 ["h3c-s5130s-28p-ei",{groupId:"downlink",port:24},"GigabitEthernet1/0/24"],
 ["juniper-ex3400-24t",{groupId:"downlink",port:0},"ge-0/0/0"],
 ["arista-7050sx3-48yc8",{groupId:"server",port:48},"Ethernet48"]
];
for(const [deviceId,selector,name] of cases){const r=R.resolve({deviceId,selector});assert.strictEqual(r.interfaceName,name);const rt=E.roundTripIntent({deviceId,selector,intent:{description:"Resolved by catalog",mode:"access",accessVlan:120}});assert(rt.equivalent,deviceId);assert.strictEqual(rt.resolution.interfaceName,name)}
assert.strictEqual(R.resolve({deviceId:"cisco-c9200l-24t-4g",selector:{groupId:"uplink",index:4}}).interfaceName,"GigabitEthernet1/1/4");
assert.throws(()=>R.resolve({deviceId:"cisco-c9200l-24t-4g",selector:{groupId:"downlink",port:25}}),/port_out_of_range/);
assert.throws(()=>R.resolve({deviceId:"juniper-ex3400-24t",selector:{groupId:"sfp-uplink",port:0}}),/interface_auto_resolution_not_supported/);
assert.throws(()=>R.resolve({deviceId:"arista-7050sx3-48yc8",selector:{role:"uplink",port:49,media:"sfp28"}}),/port_group_not_found/);
console.log("Device Platform Catalog + Port Map + Interface Resolver: PASS (5 device models + safe bind + range/ambiguity gates)");
