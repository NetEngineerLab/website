#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2-ChangePlanningV1 | Five-vendor change-plan contract */
"use strict";
const assert=require("node:assert/strict"),planner=require("../website/assets/js/domains/change-planning/engine");
const cases=[
 {deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],logical:"Port-channel10",rollback:/no interface Port-channel10/},
 {deviceId:"huawei-s5735-l24t4s-a1",members:[{groupId:"uplink",port:25},{groupId:"uplink",port:26}],logical:"Eth-Trunk10",rollback:/undo interface Eth-Trunk10/},
 {deviceId:"h3c-s5130s-28p-ei",members:[{groupId:"uplink",member:1,port:25},{groupId:"uplink",member:1,port:26}],logical:"Bridge-Aggregation10",rollback:/undo interface Bridge-Aggregation10/},
 {deviceId:"juniper-ex3400-24t",members:[{groupId:"downlink",member:0,port:0},{groupId:"downlink",member:1,port:0}],logical:"ae10",rollback:/delete interfaces ae10/},
 {deviceId:"arista-7050sx3-48yc8",members:[{groupId:"server",port:1},{groupId:"server",port:2}],logical:"Port-Channel10",rollback:/no interface Port-Channel10/}
];
for(const c of cases){
 const desired={...c,aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,30,99,100],nativeVlan:99,description:"CORE-UPLINK"};
 const p=planner.build({desired,observed:{knownVlans:[10,20,30,99,100,200]}});
 assert.equal(p.status,"ready");assert.equal(p.desiredPlan.logicalInterface,c.logical);assert.equal(p.conflicts.length,0);assert.equal(p.phases.length,5);assert.equal(p.phases[4].id,"verify");assert.deepEqual(p.impacts.vlans,[10,20,30,99,100]);assert.match(p.forward.configuration,/10/);assert.match(p.rollback.configuration,c.rollback);assert.equal(p.configurationDiff.removed.length,0);assert.ok(p.configurationDiff.added.length>0);
}
const base={deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,99],nativeVlan:99,description:"OLD"};
const desired={...base,allowedVlans:[10,20,30,99,100],description:"NEW"};
const changed=planner.build({desired,currentIntent:base,observed:{knownVlans:[10,20,30,99,100]}});
assert.equal(changed.status,"ready");assert.deepEqual(changed.semanticDiff.allowedVlans.added,[30,100]);assert.equal(changed.semanticDiff.description.changed,true);assert.match(changed.rollback.restore,/description OLD/);assert.match(changed.forward.configuration,/description NEW/);
const reserved=planner.build({desired:{...desired,aggregateId:20},observed:{reservedAggregateIds:[20],knownVlans:[10,20,30,99,100]}});assert.equal(reserved.status,"blocked");assert.equal(reserved.conflicts[0].code,"AGGREGATE_ID_IN_USE");
const missing=planner.build({desired,observed:{knownVlans:[10,20,99]}});assert.equal(missing.status,"blocked");assert.ok(missing.conflicts.some(x=>x.code==="VLAN_NOT_PRESENT"));
const memberBound=planner.build({desired,observed:{knownVlans:[10,20,30,99,100],memberBindings:[{interfaceName:"GigabitEthernet1/1/1",aggregateId:7}]}});assert.equal(memberBound.status,"blocked");assert.ok(memberBound.conflicts.some(x=>x.code==="MEMBER_BOUND_TO_OTHER_AGGREGATE"));
console.log("Change Planning V1 contract: PASS (5 vendors + impact + conflict + before/after diff + forward + rollback)");
