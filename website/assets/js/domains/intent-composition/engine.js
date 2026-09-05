/** NetEngineerLab | V2.1-Phase2-IntentCompositionV1 | Intent graph, dependency ordering and five-vendor composition */
"use strict";
const model=require("./model"),catalog=require("../../device-platform-catalog/device-platform-registry"),lag=require("../link-aggregation/engine"),ifvlan=require("../interface-vlan/engine");
function joinBlocks(vendor,blocks){const clean=blocks.filter(Boolean).map(x=>String(x).trim());if(vendor==="juniper-junos")return clean.join("\n");return clean.join("\n\n")}
function buildPlan(input){
 const intent=model.create(input),device=catalog.get(intent.deviceId);
 const aggregate=lag.renderIntent({deviceId:intent.deviceId,members:intent.members,id:intent.aggregateId,mode:intent.lagMode,description:null});
 const trunkModel=ifvlan.model.create({name:aggregate.logicalInterface,mode:"trunk",allowedVlans:intent.allowedVlans,nativeVlan:intent.nativeVlan,description:intent.description});
 const trunk=ifvlan.roundTrip({vendor:device.vendor,profileId:device.platformProfileId,model:trunkModel});
 if(!trunk.equivalent)throw new Error("composite_trunk_semantic_round_trip_failed");
 const steps=Object.freeze([
  Object.freeze({id:"resolve-members",dependsOn:Object.freeze([]),kind:"resolution",output:aggregate.resolutions}),
  Object.freeze({id:"create-aggregate",dependsOn:Object.freeze(["resolve-members"]),kind:"link-aggregation",logicalInterface:aggregate.logicalInterface,configuration:aggregate.configuration}),
  Object.freeze({id:"configure-trunk",dependsOn:Object.freeze(["create-aggregate"]),kind:"interface-vlan",logicalInterface:aggregate.logicalInterface,configuration:trunk.configuration})
 ]);
 return Object.freeze({intent,device,vendor:device.vendor,platformProfileId:device.platformProfileId,logicalInterface:aggregate.logicalInterface,resolutions:aggregate.resolutions,aggregate,trunk,steps,configuration:joinBlocks(device.vendor,[aggregate.configuration,trunk.configuration])});
}
function render(input){return buildPlan(input)}
function validate(input){try{const plan=buildPlan(input);return Object.freeze({valid:true,violations:Object.freeze([]),plan})}catch(error){return Object.freeze({valid:false,violations:Object.freeze([{code:String(error.message||error)}]),error})}}
module.exports=Object.freeze({model,buildPlan,render,validate});
