(function(root,factory){
 const engine=factory();
 if(typeof module==="object"&&module.exports)module.exports=engine;
 else root.BandwidthEngine=engine;
})(typeof self!=="undefined"?self:this,function(){
 const finite=v=>Number.isFinite(Number(v));
 const number=(v,fallback=0)=>finite(v)?Number(v):fallback;
 const clamp=(v,min,max)=>Math.min(max,Math.max(min,number(v)));
 const round=(v,d=4)=>Number(number(v).toFixed(d));

 function toBps(value,unit,library){
  const factor=library.rateUnits[unit]?.factor;
  if(!factor)throw new Error("invalid_rate_unit");
  return Math.max(0,number(value))*factor;
 }
 function fromBps(bps,unit,library){
  const factor=library.rateUnits[unit]?.factor;
  if(!factor)throw new Error("invalid_rate_unit");
  return number(bps)/factor;
 }
 function toBytes(value,unit,library){
  const factor=library.sizeUnits[unit]?.factor;
  if(!factor)throw new Error("invalid_size_unit");
  return Math.max(0,number(value))*factor;
 }
 function fromBytes(bytes,unit,library){
  const factor=library.sizeUnits[unit]?.factor;
  if(!factor)throw new Error("invalid_size_unit");
  return number(bytes)/factor;
 }
 function toSeconds(value,unit,library){
  const factor=library.timeUnits[unit]?.factor;
  if(!factor)throw new Error("invalid_time_unit");
  return Math.max(0,number(value))*factor;
 }
 function fractions(input){
  const efficiency=clamp(input.efficiencyPercent,0,100)/100;
  const utilization=clamp(input.utilizationPercent,0,100)/100;
  const burst=clamp(input.burstFactorPercent??100,1,1000)/100;
  return {efficiency,utilization,burst,combined:efficiency*utilization};
 }
 function humanTime(seconds){
  const s=Math.max(0,number(seconds));
  const days=Math.floor(s/86400);
  const hours=Math.floor((s%86400)/3600);
  const minutes=Math.floor((s%3600)/60);
  const secs=s%60;
  return {seconds:s,days,hours,minutes,secs:round(secs,2)};
 }
 function transferTime(input,library){
  const fileBytes=toBytes(input.fileSize,input.fileUnit,library);
  const linkBps=toBps(input.linkRate,input.rateUnit,library);
  const concurrent=Math.max(1,Math.floor(number(input.concurrentTransfers,1)));
  const {efficiency,utilization,combined}=fractions(input);
  const payloadAggregateBps=linkBps*combined;
  const perTransferBps=payloadAggregateBps/concurrent;
  const serializationSeconds=perTransferBps>0?(fileBytes*8)/perTransferBps:Infinity;
  const setupSeconds=Math.max(0,number(input.rttMs))*Math.max(0,number(input.setupRtts))/1000;
  const totalSeconds=serializationSeconds+setupSeconds;
  const totalTransferredBytes=concurrent*fileBytes;
  const aggregateCompletionSeconds=payloadAggregateBps>0?(totalTransferredBytes*8)/payloadAggregateBps+setupSeconds:Infinity;
  const linkPayloadEfficiency=combined*100;
  const overheadPercent=100-linkPayloadEfficiency;
  const status=!Number.isFinite(totalSeconds)?"invalid":(combined<0.5?"warning":"healthy");
  return {
   fileBytes,linkBps,concurrent,efficiency,utilization,combined,
   payloadAggregateBps,perTransferBps,serializationSeconds,setupSeconds,totalSeconds,
   aggregateCompletionSeconds,totalTransferredBytes,linkPayloadEfficiency,overheadPercent,
   time:humanTime(totalSeconds),status
  };
 }
 function requiredBandwidth(input,library){
  const fileBytes=toBytes(input.fileSize,input.fileUnit,library);
  const targetSeconds=toSeconds(input.targetTime,input.timeUnit,library);
  const concurrent=Math.max(1,Math.floor(number(input.concurrentTransfers,1)));
  const {efficiency,utilization,combined}=fractions(input);
  const setupSeconds=Math.max(0,number(input.rttMs))*Math.max(0,number(input.setupRtts))/1000;
  const dataSeconds=targetSeconds-setupSeconds;
  const totalBits=fileBytes*8*concurrent;
  const requiredPayloadBps=dataSeconds>0?totalBits/dataSeconds:Infinity;
  const requiredLinkBps=combined>0?requiredPayloadBps/combined:Infinity;
  const perTransferPayloadBps=concurrent?requiredPayloadBps/concurrent:0;
  const status=!Number.isFinite(requiredLinkBps)?"invalid":(requiredLinkBps>=100000000000?"warning":"healthy");
  return {
   fileBytes,targetSeconds,concurrent,efficiency,utilization,combined,setupSeconds,dataSeconds,
   totalBits,requiredPayloadBps,requiredLinkBps,perTransferPayloadBps,status
  };
 }
 function concurrentCapacity(input,library){
  const linkBps=toBps(input.linkRate,input.rateUnit,library);
  const perUserBps=toBps(input.perUserRate,input.perUserRateUnit,library);
  const {efficiency,utilization,burst,combined}=fractions(input);
  const availablePayloadBps=linkBps*combined;
  const engineeredPerUserBps=perUserBps*burst;
  const maxUsers=engineeredPerUserBps>0?Math.floor(availablePayloadBps/engineeredPerUserBps):0;
  const usedByTarget=engineeredPerUserBps*Math.max(0,Math.floor(number(input.targetUsers,0)));
  const targetUtilizationPercent=linkBps>0?usedByTarget/linkBps*100:0;
  const headroomBps=Math.max(0,availablePayloadBps-usedByTarget);
  const targetPass=usedByTarget<=availablePayloadBps;
  return {
   linkBps,perUserBps,efficiency,utilization,burst,combined,availablePayloadBps,
   engineeredPerUserBps,maxUsers,usedByTarget,targetUtilizationPercent,headroomBps,targetPass,
   status:targetPass?"healthy":"warning"
  };
 }
 function dataVolume(input,library){
  const linkBps=toBps(input.linkRate,input.rateUnit,library);
  const durationSeconds=toSeconds(input.duration,input.timeUnit,library);
  const {efficiency,utilization,combined}=fractions(input);
  const payloadBps=linkBps*combined;
  const totalBytes=payloadBps*durationSeconds/8;
  const totalBits=payloadBps*durationSeconds;
  const dailyBytes=durationSeconds>0?totalBytes*86400/durationSeconds:0;
  const monthly30Bytes=dailyBytes*30;
  return {
   linkBps,durationSeconds,efficiency,utilization,combined,payloadBps,totalBytes,totalBits,
   dailyBytes,monthly30Bytes,status:"healthy"
  };
 }
 return {
  toBps,fromBps,toBytes,fromBytes,toSeconds,fractions,humanTime,
  transferTime,requiredBandwidth,concurrentCapacity,dataVolume,round
 };
});