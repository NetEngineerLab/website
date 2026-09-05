/** NetEngineerLab | V2.1-Phase2-DeviceCatalogV1 | Safe physical interface resolver */
"use strict";
const catalog=require("./device-platform-registry"),topologyResolver=require("../device-topology/interface-topology-resolver");
function findGroup(device,selector){
 let matches=device.portGroups;
 if(selector.groupId)matches=matches.filter(g=>g.id===selector.groupId);
 if(selector.role)matches=matches.filter(g=>g.role===selector.role);
 if(selector.media)matches=matches.filter(g=>g.media===selector.media);
 if(matches.length!==1)throw new Error(matches.length?"ambiguous_port_group":"port_group_not_found"); return matches[0];
}
function renderName(group,physicalPort,selector={}){if(!group.naming||!group.naming.template)throw new Error(`interface_auto_resolution_not_supported:${group.id}`);const member=selector.member??group.member??1,slot=selector.slot??group.slot??0;return group.naming.template.replaceAll("{member}",String(member)).replaceAll("{slot}",String(slot)).replace("{port}",String(physicalPort))}
function resolve({deviceId,selector}){return topologyResolver.resolve({deviceId,selector})}
function bindInterfaceVlan({deviceId,selector,intent}){const r=resolve({deviceId,selector});if(!intent||typeof intent!=="object")throw new Error("interface_vlan_intent_required");return Object.freeze({resolution:r,modelInput:Object.freeze({...intent,name:r.interfaceName})})}
module.exports=Object.freeze({catalog,resolve,bindInterfaceVlan});
