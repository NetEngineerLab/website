#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2-RunningConfigV1 | Five-vendor snapshot/reconciliation/minimal-delta contract */
"use strict";
const assert=require("node:assert/strict"),composition=require("../website/assets/js/domains/intent-composition/engine"),delta=require("../website/assets/js/domains/minimal-delta/engine");
const cases=[
 {vendor:"cisco-ios",deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],inventory:"vlan 10,20,30,99,100,200",add:/switchport trunk allowed vlan/,rb:/switchport trunk allowed vlan/},
 {vendor:"huawei-vrp",deviceId:"huawei-s5735-l24t4s-a1",members:[{groupId:"uplink",port:25},{groupId:"uplink",port:26}],inventory:"vlan batch 10 20 30 99 100 200",add:/port trunk allow-pass vlan/,rb:/undo port trunk allow-pass vlan/},
 {vendor:"h3c-comware",deviceId:"h3c-s5130s-28p-ei",members:[{groupId:"uplink",member:1,port:25},{groupId:"uplink",member:1,port:26}],inventory:"vlan 10\nvlan 20\nvlan 30\nvlan 99\nvlan 100\nvlan 200",add:/port trunk permit vlan/,rb:/undo port trunk permit vlan/},
 {vendor:"juniper-junos",deviceId:"juniper-ex3400-24t",members:[{groupId:"downlink",member:0,port:0},{groupId:"downlink",member:1,port:0}],inventory:"set vlans V10 vlan-id 10\nset vlans V20 vlan-id 20\nset vlans V30 vlan-id 30\nset vlans V99 vlan-id 99\nset vlans V100 vlan-id 100\nset vlans V200 vlan-id 200",add:/vlan members (30|100)/,rb:/delete interfaces ae10 unit 0 family ethernet-switching vlan members/},
 {vendor:"arista-eos",deviceId:"arista-7050sx3-48yc8",members:[{groupId:"server",port:1},{groupId:"server",port:2}],inventory:"vlan 10,20,30,99,100,200",add:/switchport trunk allowed vlan/,rb:/switchport trunk allowed vlan/}
];
for(const c of cases){
 const before={deviceId:c.deviceId,members:c.members,aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,99],nativeVlan:99,description:"OLD"};
 const desired={...before,allowedVlans:[10,20,30,99,100],description:"NEW"};
 const running=c.inventory+"\n"+composition.buildPlan(before).configuration+"\n! unmanaged-marker preserve-me";
 const p=delta.build({vendor:c.vendor,deviceId:c.deviceId,runningConfig:running,desired});
 assert.equal(p.status,"ready",c.vendor);assert.equal(p.snapshot.safe,true);assert.equal(p.reconciliation.status,"drift");assert.deepEqual(p.reconciliation.semantic.trunk.allowedVlans.added,[30,100]);assert.equal(p.reconciliation.semantic.trunk.description.changed,true);assert.match(p.forward.configuration,c.add);assert.match(p.rollback.configuration,c.rb);assert.ok(p.opaquePreserved>=1);assert.doesNotMatch(p.forward.configuration,/no interface|undo interface|delete interfaces ae10$/m,"minimal delta must not tear down aggregate");
 const same=delta.build({vendor:c.vendor,deviceId:c.deviceId,runningConfig:c.inventory+"\n"+composition.buildPlan(desired).configuration,desired});assert.equal(same.status,"noop",`${c.vendor} should be in sync`);assert.equal(same.forward.configuration,"");assert.equal(same.rollback.configuration,"");
}
// Snapshot-derived conflict: desired member is already bound to another aggregate in running config.
const desired={deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,99],nativeVlan:99,description:"CORE"};
const conflictRunning=`vlan 10,20,99\ninterface Port-channel7\n exit\ninterface GigabitEthernet1/1/1\n channel-group 7 mode active\n exit`;
const blocked=delta.build({vendor:"cisco-ios",deviceId:"cisco-c9200l-24t-4g",runningConfig:conflictRunning,desired});assert.equal(blocked.status,"blocked");assert.ok(blocked.conflicts.some(x=>x.code==="MEMBER_BOUND_TO_OTHER_AGGREGATE"));
console.log("Running Config + Reconciliation + Minimal Delta V1: PASS (5 vendors + noop + conflict + rollback + opaque preservation)");
