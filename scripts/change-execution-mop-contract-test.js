#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2-MOPV1 | Five-vendor verification/risk/runbook contract */
"use strict";
const assert=require("node:assert/strict"),composition=require("../website/assets/js/domains/intent-composition/engine"),engine=require("../website/assets/js/domains/change-execution/engine");
const cases=[
 {vendor:"cisco-ios",deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],inventory:"vlan 10,20,30,99,100",pre:/show etherchannel summary/,post:/show interfaces trunk/},
 {vendor:"huawei-vrp",deviceId:"huawei-s5735-l24t4s-a1",members:[{groupId:"uplink",port:25},{groupId:"uplink",port:26}],inventory:"vlan batch 10 20 30 99 100",pre:/display eth-trunk/,post:/display port vlan/},
 {vendor:"h3c-comware",deviceId:"h3c-s5130s-28p-ei",members:[{groupId:"uplink",member:1,port:25},{groupId:"uplink",member:1,port:26}],inventory:"vlan 10\nvlan 20\nvlan 30\nvlan 99\nvlan 100",pre:/display link-aggregation verbose/,post:/display port trunk/},
 {vendor:"juniper-junos",deviceId:"juniper-ex3400-24t",members:[{groupId:"downlink",member:0,port:0},{groupId:"downlink",member:1,port:0}],inventory:"set vlans V10 vlan-id 10\nset vlans V20 vlan-id 20\nset vlans V30 vlan-id 30\nset vlans V99 vlan-id 99\nset vlans V100 vlan-id 100",pre:/show interfaces ae10 extensive/,post:/show ethernet-switching interface ae10/},
 {vendor:"arista-eos",deviceId:"arista-7050sx3-48yc8",members:[{groupId:"server",port:1},{groupId:"server",port:2}],inventory:"vlan 10,20,30,99,100",pre:/show port-channel dense/,post:/show interfaces Port-Channel10 trunk/}
];
for(const c of cases){
 const before={deviceId:c.deviceId,members:c.members,aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,99],nativeVlan:99,description:"OLD"};
 const desired={...before,allowedVlans:[10,20,30,99,100],description:"NEW"};
 const running=c.inventory+"\n"+composition.buildPlan(before).configuration+"\n! unmanaged context";
 const x=engine.build({vendor:c.vendor,deviceId:c.deviceId,runningConfig:running,desired});
 assert.equal(x.status,"ready",c.vendor);assert.ok(x.risk.score>=1&&x.risk.score<75,c.vendor);assert.ok(["low","medium","high"].includes(x.risk.band));
 assert.ok(x.verification.pre.length>=4);assert.ok(x.verification.post.length>=3);assert.ok(x.verification.rollbackTriggers.length>=4);
 assert.match(x.verification.pre.map(z=>z.command).join("\n"),c.pre);assert.match(x.verification.post.map(z=>z.command).join("\n"),c.post);
 assert.ok(x.runbook.steps.some(s=>s.kind==="execute"));assert.ok(x.runbook.steps.some(s=>s.kind==="rollback"));assert.ok(x.runbook.steps.filter(s=>s.kind==="precheck").every(s=>s.onFailure));
 assert.equal(x.forward.configuration,x.changePlan.forward.configuration);assert.equal(x.rollback.configuration,x.changePlan.rollback.configuration);
}
// No-op must remain safe and must not invent config execution.
{
 const c=cases[0],desired={deviceId:c.deviceId,members:c.members,aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,99],nativeVlan:99,description:"SAME"};
 const running=c.inventory+"\n"+composition.buildPlan(desired).configuration;const x=engine.build({vendor:c.vendor,deviceId:c.deviceId,runningConfig:running,desired});
 assert.equal(x.status,"noop");assert.equal(x.forward.configuration,"");assert.ok(x.runbook.steps.some(s=>s.title==="No configuration change required"));assert.ok(!x.runbook.steps.some(s=>s.kind==="execute"));
}
// A conflict must force critical risk and a blocked runbook.
{
 const desired={deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,99],nativeVlan:99,description:"CORE"};
 const running=`vlan 10,20,99\ninterface Port-channel7\n exit\ninterface GigabitEthernet1/1/1\n channel-group 7 mode active\n exit`;
 const x=engine.build({vendor:"cisco-ios",deviceId:desired.deviceId,runningConfig:running,desired});assert.equal(x.status,"blocked");assert.equal(x.risk.band,"critical");assert.equal(x.risk.requiresPeerReview,true);assert.ok(x.runbook.steps.some(s=>s.title==="Change blocked"));assert.ok(!x.runbook.steps.some(s=>s.kind==="execute"));
}
console.log("Pre/Post Verification + Risk Score + Execution Runbook V1: PASS (5 vendors + noop + blocked)");
