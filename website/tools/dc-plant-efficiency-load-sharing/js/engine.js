/**
 * NetEngineerLab
 * Version: V2.1-Tool30
 * Modified: 2026-09-10 10:52:00
 * Purpose: DC plant efficiency and rectifier load-sharing analysis engine.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.NELDCPlantAnalyzer=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=(v,d=3)=>{const p=10**d;return Math.round((v+Number.EPSILON)*p)/p};
function parseCurrents(v){
  if(Array.isArray(v))return v.map(Number).filter(Number.isFinite);
  return String(v??'').split(/[\s,;|]+/).map(Number).filter(Number.isFinite);
}
function calculate(input={}){
  const errors=[],warnings=[];
  const voltage=num(input.dcVoltage,53.5);
  const ratedA=num(input.moduleRatedA,50);
  const currents=parseCurrents(input.moduleCurrents);
  const measuredAcKW=num(input.measuredAcKW,0);
  const redundancy=Math.max(0,Math.floor(num(input.redundancyModules,1)));
  const shareWarn=clamp(num(input.shareWarnPct,5),0.1,100);
  const shareCritical=clamp(num(input.shareCriticalPct,10),shareWarn,200);
  const targetLoadPct=clamp(num(input.targetModuleLoadPct,65),10,95);
  if(!(voltage>0&&ratedA>0&&currents.length>=2))errors.push('INPUT_REQUIRED');
  if(currents.some(x=>x<0))errors.push('NEGATIVE_CURRENT');
  if(errors.length)return{ok:false,errors,warnings};
  const onlineCount=currents.length,totalA=currents.reduce((a,b)=>a+b,0),meanA=totalA/onlineCount;
  const maxA=Math.max(...currents),minA=Math.min(...currents);
  const moduleLoadPct=currents.map(x=>x/ratedA*100);
  const deviationsPct=currents.map(x=>meanA?Math.abs(x-meanA)/meanA*100:0);
  const signedDeviationPct=currents.map(x=>meanA?(x-meanA)/meanA*100:0);
  const maxDeviationPct=Math.max(...deviationsPct),spreadPct=meanA?(maxA-minA)/meanA*100:0;
  const modules=currents.map((currentA,i)=>({index:i+1,currentA,loadPct:moduleLoadPct[i],deviationPct:signedDeviationPct[i],status:Math.abs(signedDeviationPct[i])>=shareCritical?'critical':Math.abs(signedDeviationPct[i])>=shareWarn?'warning':'balanced'}));
  const overloaded=modules.filter(m=>m.loadPct>100).map(m=>m.index);
  const underperforming=modules.filter(m=>m.deviationPct<=-shareCritical).map(m=>m.index);
  if(maxDeviationPct>=shareCritical)warnings.push('LOAD_SHARE_CRITICAL'); else if(maxDeviationPct>=shareWarn)warnings.push('LOAD_SHARE_WARNING');
  if(overloaded.length)warnings.push('MODULE_OVERLOAD');
  if(meanA/ratedA*100<20)warnings.push('VERY_LOW_AVERAGE_LOAD');
  const dcOutputKW=voltage*totalA/1000;
  let efficiencyPct=null,lossKW=null;
  if(measuredAcKW>0){
    efficiencyPct=dcOutputKW/measuredAcKW*100;
    lossKW=measuredAcKW-dcOutputKW;
    if(efficiencyPct>100.5)warnings.push('MEASUREMENT_INCONSISTENT');
    if(efficiencyPct<85)warnings.push('LOW_EFFICIENCY');
  }
  const installedCapacityA=onlineCount*ratedA;
  const normalLoadPct=installedCapacityA?totalA/installedCapacityA*100:0;
  const remainingAfterFailure=Math.max(0,onlineCount-redundancy);
  const capacityAfterRedundancyA=remainingAfterFailure*ratedA;
  const survivesRedundancy=capacityAfterRedundancyA>=totalA;
  if(!survivesRedundancy)warnings.push('REDUNDANCY_FAIL');
  const loadPctAfterOne=onlineCount>1?totalA/((onlineCount-1)*ratedA)*100:Infinity;
  const loadPctAfterTwo=onlineCount>2?totalA/((onlineCount-2)*ratedA)*100:Infinity;
  const minimumOnlineForLoad=Math.max(1,Math.ceil(totalA/ratedA));
  const minimumInstalledForRedundancy=minimumOnlineForLoad+redundancy;
  const recommendedOnline=Math.max(minimumInstalledForRedundancy,Math.ceil(totalA/(ratedA*(targetLoadPct/100))));
  const recommendedLoadPct=totalA/(recommendedOnline*ratedA)*100;
  const removableModules=Math.max(0,onlineCount-recommendedOnline);
  const health=maxDeviationPct>=shareCritical?'poor':maxDeviationPct>=shareWarn?'caution':'healthy';
  return {ok:true,errors,warnings,dcVoltage:voltage,moduleRatedA:ratedA,onlineCount,totalA,meanA,maxA,minA,maxDeviationPct,spreadPct,modules,overloaded,underperforming,dcOutputKW,measuredAcKW:measuredAcKW||null,efficiencyPct,lossKW,installedCapacityA,normalLoadPct,redundancyModules:redundancy,capacityAfterRedundancyA,survivesRedundancy,loadPctAfterOne,loadPctAfterTwo,minimumOnlineForLoad,minimumInstalledForRedundancy,recommendedOnline,recommendedLoadPct,removableModules,health,shareWarnPct:shareWarn,shareCriticalPct:shareCritical,targetModuleLoadPct:targetLoadPct};
}
return{calculate,parseCurrents};
});
