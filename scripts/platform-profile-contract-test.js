#!/usr/bin/env node
"use strict";
const assert=require("assert"),profiles=require("../website/assets/js/platform-profiles/platform-profile-engine"),M=require("../website/assets/js/domains/interface-vlan/model"),E=require("../website/assets/js/domains/interface-vlan/engine");
const cases=[
 ["cisco-ios","cisco-ios-campus-switch","GigabitEthernet1/0/48"],
 ["huawei-vrp","huawei-vrp-campus-switch","GigabitEthernet0/0/48"],
 ["h3c-comware","h3c-comware-campus-switch","GigabitEthernet1/0/48"],
 ["juniper-junos","juniper-junos-els-switch","ge-0/0/48"],
 ["arista-eos","arista-eos-switch","Ethernet48"]
];
assert.strictEqual(profiles.registry.ids.length,5);
const aggregateNames=[["cisco-ios","cisco-ios-campus-switch","Port-channel10"],["huawei-vrp","huawei-vrp-campus-switch","Eth-Trunk10"],["h3c-comware","h3c-comware-campus-switch","Bridge-Aggregation10"],["juniper-junos","juniper-junos-els-switch","ae10"],["arista-eos","arista-eos-switch","Port-Channel10"]];
for(const [vendor,profileId,name] of aggregateNames){const m=M.create({name,mode:"trunk",allowedVlans:[10,20,99],nativeVlan:99});assert(profiles.validateInterfaceVlan({vendor,profileId,model:m}).result.valid,`${profileId} should accept aggregate ${name}`);assert(E.roundTrip({vendor,profileId,model:m}).equivalent)}
for(const [vendor,profileId,name] of cases){
 const profile=profiles.resolve({vendor,profileId}); assert.strictEqual(profile.vendor,vendor);
 const access=M.create({name,description:"Access",mode:"access",accessVlan:120});
 const trunk=M.create({name,description:"Uplink",mode:"trunk",allowedVlans:[10,20,100],nativeVlan:100});
 for(const configModel of [access,trunk]){const validation=profiles.validateInterfaceVlan({vendor,profileId,model:configModel});assert(validation.result.valid,`${profileId} should accept ${name}`);const rt=E.roundTrip({vendor,profileId,model:configModel});assert(rt.equivalent);assert.strictEqual(rt.platformProfile,profileId)}
}
assert.throws(()=>E.render({vendor:"juniper-junos",profileId:"juniper-junos-els-switch",model:M.create({name:"GigabitEthernet1/0/1",mode:"access",accessVlan:10})}),/interface_name_not_supported/);
assert.throws(()=>profiles.resolve({vendor:"huawei-vrp",profileId:"cisco-ios-campus-switch"}),/platform_profile_vendor_mismatch/);
console.log("Platform Profile V1 contract: PASS (5 vendor profiles + interface naming + capability gate + semantic round-trip)");
