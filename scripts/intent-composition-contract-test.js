#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2-IntentCompositionV1 | Five-vendor composite intent contract */
"use strict";
const assert=require("node:assert/strict"),composition=require("../website/assets/js/domains/intent-composition/engine"),profiles=require("../website/assets/js/platform-profiles/platform-profile-engine");
const cases=[
 {deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],logical:"Port-channel10"},
 {deviceId:"huawei-s5735-l24t4s-a1",members:[{groupId:"uplink",port:25},{groupId:"uplink",port:26}],logical:"Eth-Trunk10"},
 {deviceId:"h3c-s5130s-28p-ei",members:[{groupId:"uplink",member:1,port:25},{groupId:"uplink",member:1,port:26}],logical:"Bridge-Aggregation10"},
 {deviceId:"juniper-ex3400-24t",members:[{groupId:"downlink",member:0,port:0},{groupId:"downlink",member:1,port:0}],logical:"ae10"},
 {deviceId:"arista-7050sx3-48yc8",members:[{groupId:"server",port:1},{groupId:"server",port:2}],logical:"Port-Channel10"}
];
for(const c of cases){
 const r=composition.render({...c,aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,30,99,100],nativeVlan:99,description:"CORE-UPLINK"});
 assert.equal(r.logicalInterface,c.logical);assert.equal(r.aggregate.equivalent,true);assert.equal(r.trunk.equivalent,true);assert.equal(r.steps.length,3);assert.deepEqual(r.steps[2].dependsOn,["create-aggregate"]);assert.match(r.configuration,/10/);
 const p=profiles.resolve({vendor:r.vendor,profileId:r.platformProfileId});assert.equal(profiles.registry.get(p.id).id,p.id);
}
assert.equal(composition.validate({deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],aggregateId:10,allowedVlans:[10,20],nativeVlan:99}).valid,false);
assert.equal(composition.validate({deviceId:"arista-7050sx3-48yc8",members:[{groupId:"server",port:1},{groupId:"uplink",port:49}],aggregateId:10,allowedVlans:[10]}).valid,false);
console.log("Intent Composition V1 contract: PASS (5 vendors + dependency ordering + LAG/trunk semantic round-trip + fail-closed conflicts)");
