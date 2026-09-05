/** NetEngineerLab | V2.1-Phase2-PlatformProfileV1 | Canonical platform capability registry */
"use strict";
const model=require("./platform-profile-model");
const YES={"access-port":true,"trunk-port":true,"native-vlan":true,"allowed-vlans":true,"description":true};
const defs=[
 {id:"cisco-ios-campus-switch",vendor:"cisco-ios",platform:"IOS Campus Switching",label:"Cisco IOS Campus Switch",interfaceTypes:["ethernet","gigabit-ethernet","ten-gigabit-ethernet"],interfaceNamePatterns:["^(?:FastEthernet|GigabitEthernet|TenGigabitEthernet)\\d+(?:/\\d+){1,3}$"],aggregateInterfaceNamePatterns:["^Port-channel\\d+$"],capabilities:YES,notes:["Profile targets classic IOS/IOS-XE switchport syntax, not routed-only interfaces."]},
 {id:"huawei-vrp-campus-switch",vendor:"huawei-vrp",platform:"VRP Campus Switching",label:"Huawei VRP Campus Switch",interfaceTypes:["ethernet","gigabit-ethernet","ten-gigabit-ethernet","forty-gigabit-ethernet","hundred-gigabit-ethernet"],interfaceNamePatterns:["^(?:Ethernet|GigabitEthernet|XGigabitEthernet|10GE|40GE|100GE)\\d+(?:/\\d+){1,3}$"],aggregateInterfaceNamePatterns:["^Eth-Trunk\\d+$"],capabilities:YES},
 {id:"h3c-comware-campus-switch",vendor:"h3c-comware",platform:"Comware Campus Switching",label:"H3C Comware Campus Switch",interfaceTypes:["ethernet","gigabit-ethernet","ten-gigabit-ethernet","forty-gigabit-ethernet","hundred-gigabit-ethernet"],interfaceNamePatterns:["^(?:Ethernet|GigabitEthernet|Ten-GigabitEthernet|FortyGigE|HundredGigE)\\d+(?:/\\d+){1,3}$"],aggregateInterfaceNamePatterns:["^Bridge-Aggregation\\d+$"],capabilities:YES},
 {id:"juniper-junos-els-switch",vendor:"juniper-junos",platform:"Junos ELS Switching",label:"Juniper Junos ELS Switch",interfaceTypes:["gigabit-ethernet","ten-gigabit-ethernet","forty-gigabit-ethernet","hundred-gigabit-ethernet"],interfaceNamePatterns:["^(?:ge|xe|et)-\\d+/\\d+/\\d+(?::\\d+)?$"],aggregateInterfaceNamePatterns:["^ae\\d+$"],capabilities:YES,notes:["Profile covers ELS ethernet-switching semantics."]},
 {id:"arista-eos-switch",vendor:"arista-eos",platform:"EOS Switching",label:"Arista EOS Switch",interfaceTypes:["ethernet","gigabit-ethernet","ten-gigabit-ethernet","forty-gigabit-ethernet","hundred-gigabit-ethernet"],interfaceNamePatterns:["^(?:Ethernet|Et)\\d+(?:/\\d+){0,2}$"],aggregateInterfaceNamePatterns:["^Port-Channel\\d+$","^Port-channel\\d+$"],capabilities:YES}
].map(model.normalize);
const byId=new Map(defs.map(v=>[v.id,v]));
const byVendor=new Map(); for(const p of defs){const arr=byVendor.get(p.vendor)||[];arr.push(p);byVendor.set(p.vendor,arr)}
function get(id){const p=byId.get(id);if(!p)throw new Error(`unknown_platform_profile:${id}`);return p}
function forVendor(vendor){return Object.freeze([...(byVendor.get(vendor)||[])])}
module.exports=Object.freeze({version:model.VERSION,ids:Object.freeze(defs.map(v=>v.id)),all:Object.freeze(defs),get,forVendor});
