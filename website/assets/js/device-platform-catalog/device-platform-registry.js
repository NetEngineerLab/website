/** NetEngineerLab | V2.1-Phase2-DeviceCatalogV1 | Verified baseline device catalog */
"use strict";
const M=require("./device-platform-model");
const defs=[
 {id:"cisco-c9200l-24t-4g",vendor:"cisco-ios",model:"C9200L-24T-4G",family:"Catalyst 9200L",platformProfileId:"cisco-ios-campus-switch",portGroups:[
  {id:"downlink",role:"access",media:"copper",count:24,start:1,speedsMbps:[10,100,1000],interfaceType:"gigabit-ethernet",naming:{template:"GigabitEthernet{member}/0/{port}"},member:1,slot:0,resolverConfidence:"verified"},
  {id:"uplink",role:"uplink",media:"sfp",count:4,start:1,speedsMbps:[1000],interfaceType:"gigabit-ethernet",naming:{template:"GigabitEthernet{member}/1/{port}"},member:1,slot:1,resolverConfidence:"platform-convention"}],sources:["Cisco Catalyst 9200 Series hardware/data sheet"],notes:["Catalog models fixed-uplink C9200L-24T-4G. Stack member is fixed to 1 in V1."]},
 {id:"huawei-s5735-l24t4s-a1",vendor:"huawei-vrp",model:"CloudEngine S5735-L24T4S-A1",family:"CloudEngine S5735-L",platformProfileId:"huawei-vrp-campus-switch",portGroups:[
  {id:"downlink",role:"access",media:"copper",count:24,start:1,speedsMbps:[10,100,1000],interfaceType:"gigabit-ethernet",naming:{template:"GigabitEthernet0/0/{port}"},member:1,slot:0,member:1,slot:0,resolverConfidence:"platform-convention"},
  {id:"uplink",role:"uplink",media:"sfp",count:4,start:25,speedsMbps:[1000],interfaceType:"gigabit-ethernet",naming:{template:"GigabitEthernet0/0/{port}"},resolverConfidence:"platform-convention"}],sources:["Huawei CloudEngine S5735-L Series Switches Datasheet"],notes:["24 x 10/100/1000Base-T plus 4 x GE SFP. Port naming follows VRP fixed-switch convention and remains explicitly tagged platform-convention."]},
 {id:"h3c-s5130s-28p-ei",vendor:"h3c-comware",model:"S5130S-28P-EI",family:"S5130S-EI",platformProfileId:"h3c-comware-campus-switch",portGroups:[
  {id:"downlink",role:"access",media:"copper",count:24,start:1,speedsMbps:[10,100,1000],interfaceType:"gigabit-ethernet",naming:{template:"GigabitEthernet{member}/0/{port}"},member:1,slot:0,resolverConfidence:"platform-convention"},
  {id:"uplink",role:"uplink",media:"sfp",count:4,start:25,speedsMbps:[1000],interfaceType:"gigabit-ethernet",naming:{template:"GigabitEthernet{member}/0/{port}"},member:1,slot:0,resolverConfidence:"platform-convention"}],sources:["H3C S5130S-EI product specification"],notes:["24 x 10/100/1000BASE-T plus 4 x 1000BASE-X SFP."]},
 {id:"juniper-ex3400-24t",vendor:"juniper-junos",model:"EX3400-24T",family:"EX3400",platformProfileId:"juniper-junos-els-switch",portGroups:[
  {id:"downlink",role:"access",media:"copper",count:24,start:0,speedsMbps:[10,100,1000],interfaceType:"gigabit-ethernet",naming:{template:"ge-{member}/0/{port}",memberBase:0},member:0,slot:0,resolverConfidence:"verified"},
  {id:"sfp-uplink",role:"uplink",media:"sfp+",count:4,start:0,speedsMbps:[1000,10000],interfaceType:"ten-gigabit-ethernet",naming:null,resolverConfidence:"manual-required",notes:["Physical uplink count is cataloged, but V1 does not auto-bind speed-dependent Junos uplink interface names."]},
  {id:"qsfp-uplink",role:"uplink",media:"qsfp+",count:2,start:0,speedsMbps:[40000],interfaceType:"forty-gigabit-ethernet",naming:null,resolverConfidence:"manual-required"}],sources:["Juniper EX3400 Ethernet Switch Datasheet"],notes:["24 copper access ports, 4 SFP+ and 2 QSFP+ uplinks."]},
 {id:"arista-7050sx3-48yc8",vendor:"arista-eos",model:"7050SX3-48YC8",family:"7050X3",platformProfileId:"arista-eos-switch",portGroups:[
  {id:"server",role:"server",media:"sfp28",count:48,start:1,speedsMbps:[1000,10000,25000],interfaceType:"hundred-gigabit-ethernet",naming:{template:"Ethernet{port}"},resolverConfidence:"platform-convention",member:1,slot:0},
  {id:"uplink",role:"uplink",media:"qsfp28",count:8,start:49,speedsMbps:[40000,100000],interfaceType:"hundred-gigabit-ethernet",naming:{template:"Ethernet{port}"},resolverConfidence:"platform-convention",member:1,slot:0,breakout:{lanes:4,laneSpeedsMbps:[25000],namingTemplate:"Ethernet{port}/{lane}",confidence:"platform-convention"}}],sources:["Arista 7050X3 Series model comparison"],notes:["48 x 25G SFP and 8 x 100G QSFP physical ports; 100G uplink breakout is modeled as 4 x 25G lanes where explicitly selected; other breakout modes remain out of scope."]}
].map(M.normalize);
const byId=new Map(defs.map(d=>[d.id,d]));
function get(id){const d=byId.get(id);if(!d)throw new Error(`unknown_device_platform:${id}`);return d}
function forVendor(v){return Object.freeze(defs.filter(d=>d.vendor===v))}
module.exports=Object.freeze({version:"1.0.0",ids:Object.freeze(defs.map(d=>d.id)),all:Object.freeze(defs),get,forVendor});
