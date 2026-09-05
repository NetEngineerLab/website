#!/usr/bin/env node
"use strict";
const assert=require("assert"),M=require("../website/assets/js/domains/interface-vlan/model"),E=require("../website/assets/js/domains/interface-vlan/engine");
const vendors=["cisco-ios","huawei-vrp","h3c-comware","juniper-junos","arista-eos"];
assert.deepStrictEqual(E.supportedVendors,vendors);
const names={
 "cisco-ios":["GigabitEthernet1/0/10","GigabitEthernet1/0/48"],
 "huawei-vrp":["GigabitEthernet0/0/10","GigabitEthernet0/0/48"],
 "h3c-comware":["GigabitEthernet1/0/10","GigabitEthernet1/0/48"],
 "juniper-junos":["ge-0/0/10","ge-0/0/48"],
 "arista-eos":["Ethernet10","Ethernet48"]
};
for(const vendor of vendors){
 const [accessName,trunkName]=names[vendor];
 const fixtures=[
  M.create({name:accessName,description:"User access",mode:"access",accessVlan:120}),
  M.create({name:trunkName,description:"Uplink",mode:"trunk",allowedVlans:[10,20,21,22,100,200],nativeVlan:100})
 ];
 for(const model of fixtures){const r=E.roundTrip({vendor,model});assert(r.equivalent,`${vendor} round trip failed\n${r.configuration}\n${JSON.stringify(r.expected)}\n${JSON.stringify(r.actual)}`);assert(r.configuration.length>20)}
}
assert.throws(()=>M.create({name:"Gi1/0/1",mode:"access",accessVlan:0}),/invalid_access_vlan/);
assert.throws(()=>M.create({name:"Gi1/0/1",mode:"trunk",allowedVlans:[10,20],nativeVlan:30}),/native_vlan_must_be_allowed/);
assert.throws(()=>M.create({name:"Gi1/0/1",mode:"access",accessVlan:10,nativeVlan:10}),/access_mode_trunk_fields_not_allowed/);
console.log("Interface/VLAN Renderer contract: PASS (vendor-native access+trunk fixtures x 5 vendors semantic round-trip)");
