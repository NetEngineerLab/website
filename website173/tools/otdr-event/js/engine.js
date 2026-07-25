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
  const rules=options.rules;
  const sorted=(events||[])
   .map((event,index)=>({...event,_inputIndex:index}))
   .filter(event=>finite(event.distanceKm)&&number(event.distanceKm)>=0)
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

  return {
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

 return {analyzeEvents,classifyAuto,severityFor,severityRank,round};
});