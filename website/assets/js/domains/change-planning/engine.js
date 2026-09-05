/** NetEngineerLab | V2.1-Phase2-ChangePlanningV1 | Plan, conflicts, impact, diff, forward and rollback */
"use strict";
const model=require("./model"),composition=require("../intent-composition/engine"),diff=require("./diff"),rollbackRenderer=require("./rollback-renderer"),minimalDelta=require("../minimal-delta/engine");
function conflict(code,message,details={}){return Object.freeze({code,severity:"error",message,details:Object.freeze({...details})})}
function warning(code,message,details={}){return Object.freeze({code,severity:"warning",message,details:Object.freeze({...details})})}
function build(input){
 const request=model.create(input),desiredPlan=composition.buildPlan(request.desired),currentPlan=request.currentIntent?composition.buildPlan(request.currentIntent):null;
 const errors=[],warnings=[],observed=request.observed,currentId=currentPlan?currentPlan.intent.aggregateId:null;
 if(observed.reservedAggregateIds.includes(desiredPlan.intent.aggregateId)&&desiredPlan.intent.aggregateId!==currentId)errors.push(conflict("AGGREGATE_ID_IN_USE","Target aggregate ID is already reserved",{aggregateId:desiredPlan.intent.aggregateId}));
 const desiredNames=desiredPlan.resolutions.map(r=>r.interfaceName);
 for(const name of desiredNames){
  if(observed.protectedInterfaces.includes(name))errors.push(conflict("PROTECTED_INTERFACE","Target member is protected",{interfaceName:name}));
  for(const b of observed.memberBindings.filter(x=>x.interfaceName===name&&x.aggregateId!==desiredPlan.intent.aggregateId))errors.push(conflict("MEMBER_BOUND_TO_OTHER_AGGREGATE","Target member already belongs to another aggregate",{interfaceName:name,aggregateId:b.aggregateId}));
 }
 if(observed.knownVlans.length&&!request.options.allowUnknownVlans){for(const v of desiredPlan.intent.allowedVlans)if(!observed.knownVlans.includes(v))errors.push(conflict("VLAN_NOT_PRESENT","Target VLAN is not present in observed VLAN inventory",{vlan:v}))}
 if(currentPlan){
  const oldNames=currentPlan.resolutions.map(r=>r.interfaceName);
  if(currentPlan.intent.aggregateId!==desiredPlan.intent.aggregateId)warnings.push(warning("AGGREGATE_ID_REPLACEMENT","Change replaces the aggregate logical interface",{before:currentPlan.logicalInterface,after:desiredPlan.logicalInterface}));
  if(oldNames.some(x=>!desiredNames.includes(x))||desiredNames.some(x=>!oldNames.includes(x)))warnings.push(warning("AGGREGATE_MEMBERSHIP_CHANGE","Aggregate membership changes can interrupt traffic",{before:oldNames,after:desiredNames}));
 }
 const beforeConfig=currentPlan?currentPlan.configuration:"",afterConfig=desiredPlan.configuration,semanticDiff=diff.semantic(currentPlan?currentPlan.intent:null,desiredPlan.intent),configurationDiff=diff.lineDiff(beforeConfig,afterConfig);
 const impacts=Object.freeze({
  deviceId:desiredPlan.device.id,vendor:desiredPlan.vendor,
  physicalInterfaces:Object.freeze([...new Set([...(currentPlan?currentPlan.resolutions.map(r=>r.interfaceName):[]),...desiredNames])]),
  logicalInterfaces:Object.freeze([...new Set([...(currentPlan?[currentPlan.logicalInterface]:[]),desiredPlan.logicalInterface])]),
  vlans:Object.freeze([...new Set([...(currentPlan?currentPlan.intent.allowedVlans:[]),...desiredPlan.intent.allowedVlans])].sort((a,b)=>a-b)),
  lag:Object.freeze({before:currentPlan?currentPlan.logicalInterface:null,after:desiredPlan.logicalInterface})
 });
 const rollback=rollbackRenderer.rollback({desiredPlan,currentPlan});
 const forwardPrefix=currentPlan?rollbackRenderer.teardown(currentPlan):"";
 const forwardConfiguration=[forwardPrefix,desiredPlan.configuration].filter(Boolean).join("\n\n");
 const phases=Object.freeze([
  Object.freeze({id:"precheck",order:1,kind:"validation",status:errors.length?"blocked":"ready"}),
  Object.freeze({id:"resolve-members",order:2,kind:"resolution",dependsOn:Object.freeze(["precheck"]),targets:Object.freeze(desiredNames)}),
  Object.freeze({id:"apply-aggregate",order:3,kind:"link-aggregation",dependsOn:Object.freeze(["resolve-members"]),target:desiredPlan.logicalInterface}),
  Object.freeze({id:"apply-trunk",order:4,kind:"interface-vlan",dependsOn:Object.freeze(["apply-aggregate"]),target:desiredPlan.logicalInterface}),
  Object.freeze({id:"verify",order:5,kind:"semantic-round-trip",dependsOn:Object.freeze(["apply-trunk"]),checks:Object.freeze(["lag","interface-vlan"])})
 ]);
 return Object.freeze({version:"1.0.0",status:errors.length?"blocked":"ready",request,device:desiredPlan.device,desiredPlan,currentPlan,conflicts:Object.freeze(errors),warnings:Object.freeze(warnings),impacts,semanticDiff,configurationDiff,phases,forward:Object.freeze({configuration:forwardConfiguration}),rollback});
}
function validate(input){try{const plan=build(input);return Object.freeze({valid:plan.status==="ready",plan,violations:plan.conflicts})}catch(error){return Object.freeze({valid:false,violations:Object.freeze([{code:String(error.message||error),severity:"error"}]),error})}}
function buildFromRunningConfig(input){return minimalDelta.build(input)}
module.exports=Object.freeze({model,diff,rollbackRenderer,minimalDelta,build,buildFromRunningConfig,validate});
