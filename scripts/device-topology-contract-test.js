/** NetEngineerLab | V2.1-Phase2-TopologyV1 | Topology/LAG contract tests */
"use strict";
const assert=require("node:assert/strict"),resolver=require("../website/assets/js/device-topology/interface-topology-resolver"),topologies=require("../website/assets/js/device-topology/topology-registry"),lag=require("../website/assets/js/domains/link-aggregation/engine");
function throws(fn,pattern){assert.throws(fn,pattern)}
assert.equal(topologies.ids.length,5);
assert.equal(resolver.resolve({deviceId:"cisco-c9200l-24t-4g",selector:{groupId:"downlink",member:2,port:24}}).interfaceName,"GigabitEthernet2/0/24");
throws(()=>resolver.resolve({deviceId:"cisco-c9200l-24t-4g",selector:{groupId:"downlink",member:9,port:1}}),/member_out_of_range/);
assert.equal(resolver.resolve({deviceId:"juniper-ex3400-24t",selector:{groupId:"downlink",member:3,port:0}}).interfaceName,"ge-3/0/0");
throws(()=>resolver.resolve({deviceId:"juniper-ex3400-24t",selector:{groupId:"downlink",member:10,port:0}}),/member_out_of_range/);
const bo=resolver.resolve({deviceId:"arista-7050sx3-48yc8",selector:{groupId:"uplink",port:49,lane:4}});assert.equal(bo.parentInterface,"Ethernet49");assert.equal(bo.interfaceName,"Ethernet49/4");
throws(()=>resolver.resolve({deviceId:"arista-7050sx3-48yc8",selector:{groupId:"uplink",port:49,lane:5}}),/breakout_lane_out_of_range/);
const chassis={members:[{id:1,slots:[{id:3,lineCards:[{id:"LC-48X",portGroups:[{id:"front",start:1,count:48,interfaceType:"ten-gigabit-ethernet",speedsMbps:[10000],namingTemplate:"TenGigabitEthernet{member}/{slot}/{port}",breakout:{lanes:4,laneSpeedsMbps:[2500],namingTemplate:"TenGigabitEthernet{member}/{slot}/{port}:{lane}"}}]}]}]}]};
assert.equal(resolver.resolveExplicitTopology({inventory:chassis,selector:{member:1,slot:3,lineCardId:"LC-48X",groupId:"front",port:7}}).interfaceName,"TenGigabitEthernet1/3/7");
assert.equal(resolver.resolveExplicitTopology({inventory:chassis,selector:{member:1,slot:3,lineCardId:"LC-48X",groupId:"front",port:7,lane:2}}).interfaceName,"TenGigabitEthernet1/3/7:2");
const samples={"cisco-ios":["GigabitEthernet1/0/1","GigabitEthernet1/0/2"],"huawei-vrp":["GigabitEthernet0/0/1","GigabitEthernet0/0/2"],"h3c-comware":["GigabitEthernet1/0/1","GigabitEthernet1/0/2"],"juniper-junos":["ge-0/0/0","ge-0/0/1"],"arista-eos":["Ethernet1","Ethernet2"]};
for(const vendor of lag.registry.ids){for(const mode of ["lacp","static"]){const r=lag.roundTrip({vendor,model:{id:10,mode,members:samples[vendor]}});assert.equal(r.equivalent,true,`${vendor} ${mode}`)}}
const ci=lag.renderIntent({deviceId:"cisco-c9200l-24t-4g",id:5,mode:"lacp",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}]});assert.equal(ci.equivalent,true);assert.deepEqual(ci.expected.members,["GigabitEthernet1/1/1","GigabitEthernet2/1/1"]);assert.equal(ci.logicalInterface,"Port-channel5");
throws(()=>lag.renderIntent({deviceId:"arista-7050sx3-48yc8",id:7,members:[{groupId:"server",port:1},{groupId:"uplink",port:49}]}),/aggregate_member_speed_mismatch/);
console.log("Device topology + breakout + five-vendor LAG contract: PASS");
