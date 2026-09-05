/** NetEngineerLab | V2.1-Phase2-IntentCompositionV1 | Canonical LAG + Interface/VLAN engineering intent */
"use strict";
function vlan(v,name){const n=Number(v);if(!Number.isSafeInteger(n)||n<1||n>4094)throw new Error(`invalid_${name}`);return n}
function create(input){
 if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("invalid_composite_intent");
 if(typeof input.deviceId!=="string"||!input.deviceId.trim())throw new Error("device_id_required");
 if(!Array.isArray(input.members)||input.members.length<2)throw new Error("aggregate_members_min_2");
 const aggregateId=Number(input.aggregateId??input.id);if(!Number.isSafeInteger(aggregateId)||aggregateId<1||aggregateId>65535)throw new Error("invalid_aggregate_id");
 const lagMode=String(input.lagMode||input.mode||"lacp").toLowerCase();if(!["lacp","static"].includes(lagMode))throw new Error("invalid_lag_mode");
 const allowedVlans=Object.freeze([...new Set((input.allowedVlans||[]).map(v=>vlan(v,"allowed_vlan")))].sort((a,b)=>a-b));if(!allowedVlans.length)throw new Error("allowed_vlans_required");
 const nativeVlan=input.nativeVlan==null?null:vlan(input.nativeVlan,"native_vlan");if(nativeVlan!==null&&!allowedVlans.includes(nativeVlan))throw new Error("native_vlan_must_be_allowed");
 const description=input.description==null?null:String(input.description).trim()||null;
 return Object.freeze({version:"1.0.0",deviceId:input.deviceId.trim(),members:Object.freeze(input.members.map(x=>Object.freeze({...x}))),aggregateId,lagMode,allowedVlans,nativeVlan,description});
}
function semanticView(x){const m=create(x);return {deviceId:m.deviceId,aggregateId:m.aggregateId,lagMode:m.lagMode,allowedVlans:[...m.allowedVlans],nativeVlan:m.nativeVlan,description:m.description}}
module.exports=Object.freeze({VERSION:"1.0.0",create,semanticView});
