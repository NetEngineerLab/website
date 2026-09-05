/** NetEngineerLab | V2.1-Phase2-ChangePlanningV1 | Canonical network change-plan input model */
"use strict";
const compositionModel=require("../intent-composition/model");
function ints(values,name,min=1,max=65535){return Object.freeze([...new Set((values||[]).map(v=>{const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)throw new Error(`invalid_${name}`);return n}))].sort((a,b)=>a-b))}
function strings(values,name){return Object.freeze([...new Set((values||[]).map(v=>{const s=String(v||"").trim();if(!s)throw new Error(`invalid_${name}`);return s}))].sort())}
function create(input){
 if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("invalid_change_plan_input");
 const desired=compositionModel.create(input.desired||input.intent||input);
 const currentIntent=input.currentIntent==null?null:compositionModel.create(input.currentIntent);
 if(currentIntent&&currentIntent.deviceId!==desired.deviceId)throw new Error("current_desired_device_mismatch");
 const observed=input.observed&&typeof input.observed==="object"?input.observed:{};
 const bindings=Object.freeze((observed.memberBindings||[]).map(x=>{const interfaceName=String(x.interfaceName||"").trim(),aggregateId=Number(x.aggregateId);if(!interfaceName||!Number.isSafeInteger(aggregateId)||aggregateId<1)throw new Error("invalid_observed_member_binding");return Object.freeze({interfaceName,aggregateId})}));
 return Object.freeze({
  version:"1.0.0",desired,currentIntent,
  observed:Object.freeze({
   reservedAggregateIds:ints(observed.reservedAggregateIds,"reserved_aggregate_id"),
   knownVlans:ints(observed.knownVlans,"known_vlan",1,4094),
   memberBindings:bindings,
   protectedInterfaces:strings(observed.protectedInterfaces,"protected_interface")
  }),
  options:Object.freeze({allowUnknownVlans:Boolean(input.options&&input.options.allowUnknownVlans)})
 });
}
module.exports=Object.freeze({VERSION:"1.0.0",create});
