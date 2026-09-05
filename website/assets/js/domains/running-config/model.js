/** NetEngineerLab | V2.1-Phase2-RunningConfigV1 | Canonical supported running-config snapshot */
"use strict";
function freezeList(xs){return Object.freeze((xs||[]).map(x=>Object.freeze({...x,members:x.members?Object.freeze([...x.members]):x.members,allowedVlans:x.allowedVlans?Object.freeze([...x.allowedVlans]):x.allowedVlans}))) }
function create(input){
 if(!input||typeof input!=="object")throw new Error("invalid_running_config_snapshot");
 const diagnostics=Object.freeze((input.diagnostics||[]).map(x=>Object.freeze({...x})));
 return Object.freeze({
  version:"1.0.0",vendor:String(input.vendor||""),deviceId:input.deviceId||null,
  aggregates:freezeList(input.aggregates),interfaceVlans:freezeList(input.interfaceVlans),
  knownVlans:Object.freeze([...new Set((input.knownVlans||[]).map(Number).filter(v=>Number.isInteger(v)&&v>=1&&v<=4094))].sort((a,b)=>a-b)),
  memberBindings:freezeList(input.memberBindings),reservedAggregateIds:Object.freeze([...new Set((input.reservedAggregateIds||[]).map(Number))].sort((a,b)=>a-b)),
  opaqueLines:Object.freeze([...(input.opaqueLines||[])]),diagnostics,
  safe:!diagnostics.some(x=>x.severity==="error")
 });
}
module.exports=Object.freeze({VERSION:"1.0.0",create});
