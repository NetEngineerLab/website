(function(root,factory){
 const engine=factory();
 if(typeof module==="object"&&module.exports)module.exports=engine;
 else root.OTDREngine=engine;
})(typeof self!=="undefined"?self:this,function(){
 const finite=(v)=>Number.isFinite(Number(v));
 const number=(v,fallback=0)=>finite(v)?Number(v):fallback;
 const round=(v,d=2)=>Number(number(v).toFixed(d));

 function severityRank(value){
  return {normal:0,attention:1,abnormal:2,critical:3}[value]??0;
 }

 function validateInput(events,options){
  if(!Array.isArray(events)||events.length===0||!options||typeof options!=="object"||Array.isArray(options))return false;
  const numeric=[options.linkLengthKm,options.primaryAttenuationDbPerKm,options.secondaryAttenuationDbPerKm,options.ior];
  if(!numeric.every(Number.isFinite)||options.linkLengthKm<0.1||options.primaryAttenuationDbPerKm<=0||options.secondaryAttenuationDbPerKm<=0||options.ior<1)return false;
  const thresholds=options.rules?.thresholds;
  const required=["normalSpliceLossDb","attentionLossDb","criticalLossDb","strongReflectionDb","veryStrongReflectionDb","bendDeltaDb","endLossDb","eventDeadZoneM","attenuationDeadZoneM","ghostDistanceToleranceM","nearEndToleranceM"];
  if(!thresholds||!required.every(key=>Number.isFinite(thresholds[key])))return false;
  const nonNegative=["normalSpliceLossDb","attentionLossDb","criticalLossDb","bendDeltaDb","endLossDb","eventDeadZoneM","attenuationDeadZoneM","ghostDistanceToleranceM","nearEndToleranceM"];
  if(nonNegative.some(key=>thresholds[key]<0)||["strongReflectionDb","veryStrongReflectionDb"].some(key=>thresholds[key]>0))return false;
  if(thresholds.normalSpliceLossDb>thresholds.attentionLossDb||thresholds.attentionLossDb>thresholds.criticalLossDb||thresholds.veryStrongReflectionDb<thresholds.strongReflectionDb||thresholds.eventDeadZoneM>thresholds.attenuationDeadZoneM)return false;
  const allowed=options.rules?.eventTypes;
  const fixedTypes=["auto","splice","connector","mechanical","bend","end","ghost","unknown"];
  if(!Array.isArray(allowed)||new Set(allowed).size!==allowed.length||allowed.some(type=>typeof type!=="string")||allowed.length!==fixedTypes.length||allowed.some(type=>!fixedTypes.includes(type)))return false;
  return events.every(event=>event&&typeof event==="object"&&!Array.isArray(event)
   &&Number.isFinite(event.distanceKm)&&event.distanceKm>=0
   &&Number.isFinite(event.lossPrimaryDb)&&event.lossPrimaryDb>=0
   &&(event.lossSecondaryDb==null||(Number.isFinite(event.lossSecondaryDb)&&event.lossSecondaryDb>=0))
   &&(event.reflectanceDb==null||(Number.isFinite(event.reflectanceDb)&&event.reflectanceDb<=0))
   &&(event.cumulativeLossDb==null||(Number.isFinite(event.cumulativeLossDb)&&event.cumulativeLossDb>=0))
   &&typeof event.manualType==="string"&&allowed.includes(event.manualType));
 }

 function classifyAuto(event,context){
  const r=context.rules.thresholds;
  const distance=number(event.distanceKm);
  const lossP=Math.max(0,number(event.lossPrimaryDb));
  const lossS=finite(event.lossSecondaryDb)?Math.max(0,number(event.lossSecondaryDb)):null;
  const reflectance=finite(event.reflectanceDb)?number(event.reflectanceDb):-80;
  const gapM=context.previousDistanceKm===null?Infinity:(distance-context.previousDistanceKm)*1000;
  const delta=lossS===null?null:lossS-lossP;
  const nearEnd=Math.abs(context.linkLengthKm-distance)*1000<=r.nearEndToleranceM;
  const manual=event.manualType||"auto";

  if(manual!=="auto"){
   return {
    type:manual,
    reason:"manual",
    nearEnd,
    gapM,
    delta
   };
  }

  if(nearEnd&&(lossP>=r.endLossDb||reflectance>=r.veryStrongReflectionDb)){
   return {type:"end",reason:"near_end_high_loss_or_reflection",nearEnd,gapM,delta};
  }

  const ghostCandidate=context.strongReflectorDistancesKm.some(d=>{
   const doubleGap=Math.abs(distance-(d*2))*1000;
   return doubleGap<=r.ghostDistanceToleranceM&&lossP<=r.normalSpliceLossDb;
  });
  if(ghostCandidate&&reflectance>=r.strongReflectionDb){
   return {type:"ghost",reason:"multiple_of_strong_reflection",nearEnd,gapM,delta};
  }

  if(delta!==null&&delta>=r.bendDeltaDb&&reflectance<r.strongReflectionDb){
   return {type:"bend",reason:"secondary_wavelength_loss_increase",nearEnd,gapM,delta};
  }

  if(reflectance>=r.strongReflectionDb){
   if(lossP>=r.attentionLossDb){
    return {type:"mechanical",reason:"reflective_high_loss",nearEnd,gapM,delta};
   }
   return {type:"connector",reason:"reflective_event",nearEnd,gapM,delta};
  }

  if(lossP<=r.normalSpliceLossDb){
   return {type:"splice",reason:"low_loss_non_reflective",nearEnd,gapM,delta};
  }

  return {type:"splice",reason:"high_loss_non_reflective",nearEnd,gapM,delta};
 }

 function severityFor(event,classification,context){
  const r=context.rules.thresholds;
  const loss=Math.max(0,number(event.lossPrimaryDb));
  const refl=finite(event.reflectanceDb)?number(event.reflectanceDb):-80;
  const gapM=classification.gapM;
  let severity="normal";

  if(classification.type==="end"){
   severity="critical";
  }else if(classification.type==="ghost"){
   severity="attention";
  }else if(classification.type==="bend"){
   severity=loss>=r.criticalLossDb?"critical":"abnormal";
  }else if(classification.type==="mechanical"){
   severity=loss>=r.criticalLossDb||refl>=r.veryStrongReflectionDb?"critical":"abnormal";
  }else if(classification.type==="connector"){
   severity=refl>=r.veryStrongReflectionDb||loss>=r.attentionLossDb?"abnormal":"attention";
  }else if(classification.type==="splice"){
   if(loss>=r.criticalLossDb)severity="critical";
   else if(loss>=r.attentionLossDb)severity="abnormal";
   else if(loss>r.normalSpliceLossDb)severity="attention";
  }else{
   severity="attention";
  }

  const deadZoneAffected=gapM<r.attenuationDeadZoneM;
  const eventDeadZoneAffected=gapM<r.eventDeadZoneM;
  if(eventDeadZoneAffected&&severityRank(severity)<severityRank("abnormal"))severity="abnormal";
  else if(deadZoneAffected&&severityRank(severity)<severityRank("attention"))severity="attention";

  return {severity,deadZoneAffected,eventDeadZoneAffected};
 }

 function analyzeEvents(events,options){
  if(!validateInput(events,options))return{ok:false,error:"invalid-input"};
  const rules=options.rules;
  const sorted=(events||[])
   .map((event,index)=>({...event,_inputIndex:index}))
   .sort((a,b)=>number(a.distanceKm)-number(b.distanceKm));

  const strongReflectorDistancesKm=[];
  const analyzed=[];
  let previousDistanceKm=null;

  for(const event of sorted){
   const context={
    rules,
    linkLengthKm:number(options.linkLengthKm),
    previousDistanceKm,
    strongReflectorDistancesKm:[...strongReflectorDistancesKm]
   };
   const classification=classifyAuto(event,context);
   if(previousDistanceKm!==null&&!Number.isFinite(classification.gapM))return{ok:false,error:"derived-overflow"};
   const severity=severityFor(event,classification,context);
   const reflectance=finite(event.reflectanceDb)?number(event.reflectanceDb):-80;
   if(reflectance>=rules.thresholds.strongReflectionDb){
    strongReflectorDistancesKm.push(number(event.distanceKm));
   }
   analyzed.push({
    ...event,
    eventNumber:analyzed.length+1,
    detectedType:classification.type,
    reason:classification.reason,
    gapM:Number.isFinite(classification.gapM)?round(classification.gapM,1):null,
    deltaLossDb:classification.delta===null?null:round(classification.delta,2),
    nearEnd:classification.nearEnd,
    severity:severity.severity,
    deadZoneAffected:severity.deadZoneAffected,
    eventDeadZoneAffected:severity.eventDeadZoneAffected
   });
   previousDistanceKm=number(event.distanceKm);
  }

  const primaryAttenuation=number(options.primaryAttenuationDbPerKm);
  const secondaryAttenuation=number(options.secondaryAttenuationDbPerKm);
  const linkLength=number(options.linkLengthKm);
  const eventLossPrimary=analyzed.reduce((sum,e)=>sum+Math.max(0,number(e.lossPrimaryDb)),0);
  const eventLossSecondary=analyzed.reduce((sum,e)=>sum+(finite(e.lossSecondaryDb)?Math.max(0,number(e.lossSecondaryDb)):0),0);
  const estimatedPrimary=linkLength*primaryAttenuation+eventLossPrimary;
  const estimatedSecondary=linkLength*secondaryAttenuation+eventLossSecondary;
  const cumulativeValues=analyzed.map(e=>finite(e.cumulativeLossDb)?number(e.cumulativeLossDb):null).filter(v=>v!==null);
  const maximumCumulative=cumulativeValues.length?Math.max(...cumulativeValues):null;
  const abnormalCount=analyzed.filter(e=>severityRank(e.severity)>=severityRank("abnormal")).length;
  const criticalCount=analyzed.filter(e=>e.severity==="critical").length;
  const reflectiveCount=analyzed.filter(e=>finite(e.reflectanceDb)&&number(e.reflectanceDb)>=rules.thresholds.strongReflectionDb).length;
  const deadZoneCount=analyzed.filter(e=>e.deadZoneAffected).length;
  const maxLoss=analyzed.length?Math.max(...analyzed.map(e=>Math.max(0,number(e.lossPrimaryDb)))):0;
  const meanSpacing=analyzed.length>1
   ? analyzed.slice(1).reduce((sum,e)=>sum+number(e.gapM),0)/(analyzed.length-1)
   : 0;

  if(![eventLossPrimary,eventLossSecondary,estimatedPrimary,estimatedSecondary,maximumCumulative??0,maxLoss,meanSpacing].every(Number.isFinite))return{ok:false,error:"derived-overflow"};

  return {
   ok:true,
   events:analyzed,
   summary:{
    eventCount:analyzed.length,
    abnormalCount,
    criticalCount,
    reflectiveCount,
    deadZoneCount,
    maxEventLossDb:round(maxLoss,2),
    meanEventSpacingM:round(meanSpacing,1),
    eventLossPrimaryDb:round(eventLossPrimary,2),
    eventLossSecondaryDb:round(eventLossSecondary,2),
    estimatedLinkLossPrimaryDb:round(estimatedPrimary,2),
    estimatedLinkLossSecondaryDb:round(estimatedSecondary,2),
    maximumCumulativeLossDb:maximumCumulative===null?null:round(maximumCumulative,2),
    lastEventDistanceKm:analyzed.length?round(number(analyzed[analyzed.length-1].distanceKm),3):0
   }
  };
 }

 return {analyzeEvents,classifyAuto,severityFor,severityRank,round,validateInput};
});
