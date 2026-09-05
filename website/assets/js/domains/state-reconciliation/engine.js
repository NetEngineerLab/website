/** NetEngineerLab | V2.1-Phase2-StateReconciliationV1 | Reconcile parsed running state with desired composite intent */
"use strict";
const composition=require("../intent-composition/engine");
function sorted(xs){return [...new Set(xs||[])].sort()}
function sortedNums(xs){return [...new Set(xs||[])].sort((a,b)=>a-b)}
function order(xs){return xs.sort((a,b)=>typeof a==="number"&&typeof b==="number"?a-b:String(a).localeCompare(String(b)))}
function diffSet(before,after){const b=new Set(before),a=new Set(after);return Object.freeze({added:Object.freeze(order([...a].filter(x=>!b.has(x)))),removed:Object.freeze(order([...b].filter(x=>!a.has(x)))),unchanged:Object.freeze(order([...a].filter(x=>b.has(x))))})}
function reconcile({snapshot,desired}){
 if(!snapshot||snapshot.safe===false)throw new Error("unsafe_running_config_snapshot");
 const desiredPlan=composition.buildPlan(desired);if(snapshot.vendor!==desiredPlan.vendor)throw new Error("snapshot_desired_vendor_mismatch");if(snapshot.deviceId&&snapshot.deviceId!==desiredPlan.device.id)throw new Error("snapshot_desired_device_mismatch");
 const id=desiredPlan.intent.aggregateId,currentAggregate=snapshot.aggregates.find(x=>x.id===id)||null,currentVlan=snapshot.interfaceVlans.find(x=>x.name.toLowerCase()===desiredPlan.logicalInterface.toLowerCase())||null;
 const desiredMembers=sorted(desiredPlan.resolutions.map(x=>x.interfaceName)),currentMembers=sorted(currentAggregate?currentAggregate.members:[]),desiredVlans=sortedNums(desiredPlan.intent.allowedVlans),currentVlans=sortedNums(currentVlan&&currentVlan.mode==="trunk"?currentVlan.allowedVlans:[]);
 const semantic=Object.freeze({
  aggregate:Object.freeze({existsBefore:Boolean(currentAggregate),id,logicalInterface:desiredPlan.logicalInterface,mode:Object.freeze({before:currentAggregate?currentAggregate.mode:null,after:desiredPlan.intent.lagMode,changed:!currentAggregate||currentAggregate.mode!==desiredPlan.intent.lagMode}),members:diffSet(currentMembers,desiredMembers)}),
  trunk:Object.freeze({existsBefore:Boolean(currentVlan),mode:Object.freeze({before:currentVlan?currentVlan.mode:null,after:"trunk",changed:!currentVlan||currentVlan.mode!=="trunk"}),allowedVlans:diffSet(currentVlans,desiredVlans),nativeVlan:Object.freeze({before:currentVlan?currentVlan.nativeVlan:null,after:desiredPlan.intent.nativeVlan,changed:(currentVlan?currentVlan.nativeVlan:null)!==desiredPlan.intent.nativeVlan}),description:Object.freeze({before:(currentVlan&&currentVlan.description)||(currentAggregate&&currentAggregate.description)||null,after:desiredPlan.intent.description,changed:((currentVlan&&currentVlan.description)||(currentAggregate&&currentAggregate.description)||null)!==desiredPlan.intent.description})})
 });
 const unrelatedBindings=snapshot.memberBindings.filter(x=>desiredMembers.includes(x.interfaceName)&&x.aggregateId!==id);
 const conflicts=[];for(const b of unrelatedBindings)conflicts.push(Object.freeze({code:"MEMBER_BOUND_TO_OTHER_AGGREGATE",severity:"error",interfaceName:b.interfaceName,aggregateId:b.aggregateId}));
 if(snapshot.knownVlans.length){for(const v of desiredVlans)if(!snapshot.knownVlans.includes(v))conflicts.push(Object.freeze({code:"VLAN_NOT_PRESENT",severity:"error",vlan:v}))}
 const drift=Boolean(!currentAggregate||!currentVlan||semantic.aggregate.mode.changed||semantic.aggregate.members.added.length||semantic.aggregate.members.removed.length||semantic.trunk.mode.changed||semantic.trunk.allowedVlans.added.length||semantic.trunk.allowedVlans.removed.length||semantic.trunk.nativeVlan.changed||semantic.trunk.description.changed);
 return Object.freeze({version:"1.0.0",status:conflicts.length?"blocked":drift?"drift":"in-sync",snapshot,desiredPlan,current:Object.freeze({aggregate:currentAggregate,trunk:currentVlan}),semantic,conflicts:Object.freeze(conflicts),drift});
}
module.exports=Object.freeze({reconcile,diffSet});
