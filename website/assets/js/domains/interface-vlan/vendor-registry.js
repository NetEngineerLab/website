/** NetEngineerLab | V2.1-Phase2-InterfaceVlan | Interface/VLAN vendor registry */
"use strict";const registryApi=require("../../vendor-renderer/vendor-registry");
const defs=[
 ["cisco-ios","Cisco IOS"],["huawei-vrp","Huawei VRP"],["h3c-comware","H3C Comware"],["juniper-junos","Juniper Junos"],["arista-eos","Arista EOS"]
].map(([id,label])=>({id,label,parse:require(`./parsers/${id}`).parse,render:require(`./renderers/${id}`).render,capabilities:["parse","render","semantic-round-trip","interface-vlan-v1","access-port","trunk-port"]}));
module.exports=registryApi.create(defs);
