/**
 * NetEngineerLab
 * Version: V2.1-Power-Tool-32
 * Modified: 2026-09-10 10:55:00
 * Purpose: Generator + UPS transfer and ride-through planning engine.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.NELGeneratorUpsRideThroughEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function calculate(i={}){
 const errors=[],warnings=[];
 const criticalLoadKW=num(i.criticalLoadKW,80);
 const upsUsableKW=num(i.upsUsableKW,100);
 const upsAutonomyMin=num(i.upsAutonomyMin,10);
 const batterySocPct=clamp(num(i.batterySocPct,100),1,100);
 const genRatedKW=num(i.generatorRatedKW,120);
 const genCount=Math.max(1,Math.floor(num(i.generatorCount,2)));
 const redundantGen=Math.max(0,Math.floor(num(i.redundantGen,1)));
 const genUsablePct=clamp(num(i.genUsablePct,80),10,100);
 const stepFactor=clamp(num(i.stepFactor,1.15),1,2);
 const outageDetectSec=Math.max(0,num(i.outageDetectSec,1));
 const startDelaySec=Math.max(0,num(i.startDelaySec,5));
 const crankSec=Math.max(0,num(i.crankSec,10));
 const successfulAttempt=Math.max(1,Math.floor(num(i.successfulAttempt,1)));
 const retryIntervalSec=Math.max(0,num(i.retryIntervalSec,10));
 const warmupSec=Math.max(0,num(i.warmupSec,15));
 const atsTransferSec=Math.max(0,num(i.atsTransferSec,3));
 const stabilizeSec=Math.max(0,num(i.stabilizeSec,10));
 const reserveSec=Math.max(0,num(i.reserveSec,60));
 if(!(criticalLoadKW>0&&upsUsableKW>0&&upsAutonomyMin>0&&genRatedKW>0))errors.push('capacity');
 if(redundantGen>=genCount)errors.push('redundancy');
 if(successfulAttempt>5)errors.push('attempts');
 if(errors.length)return{ok:false,errors,warnings};
 const effectiveUpsAutonomySec=upsAutonomyMin*60*(batterySocPct/100);
 const retryDelayTotal=(successfulAttempt-1)*retryIntervalSec;
 const crankTotal=successfulAttempt*crankSec;
 const transferWindowSec=outageDetectSec+startDelaySec+crankTotal+retryDelayTotal+warmupSec+atsTransferSec+stabilizeSec;
 const requiredRideThroughSec=transferWindowSec+reserveSec;
 const rideThroughMarginSec=effectiveUpsAutonomySec-requiredRideThroughSec;
 const upsLoadPct=criticalLoadKW/upsUsableKW*100;
 const remainingGenerators=genCount-redundantGen;
 const generatorUsableKW=remainingGenerators*genRatedKW*(genUsablePct/100);
 const generatorDesignLoadKW=criticalLoadKW*stepFactor;
 const generatorLoadPct=generatorDesignLoadKW/generatorUsableKW*100;
 const upsCapacityPass=criticalLoadKW<=upsUsableKW;
 const rideThroughPass=rideThroughMarginSec>=0;
 const generatorCapacityPass=generatorUsableKW>=generatorDesignLoadKW;
 const overallPass=upsCapacityPass&&rideThroughPass&&generatorCapacityPass;
 const latestSafeTransferSec=Math.max(0,effectiveUpsAutonomySec-reserveSec);
 const maxExtraDelaySec=Math.max(0,rideThroughMarginSec);
 const batteryUsedPct=transferWindowSec/effectiveUpsAutonomySec*100;
 let risk='healthy';
 if(!overallPass)risk='high';
 else if(rideThroughMarginSec<120||upsLoadPct>85||generatorLoadPct>85||successfulAttempt>1)risk='caution';
 if(!upsCapacityPass)warnings.push('upsCapacity');
 if(!rideThroughPass)warnings.push('rideThrough');
 if(!generatorCapacityPass)warnings.push('generatorCapacity');
 if(upsLoadPct>85)warnings.push('upsHighLoad');
 if(generatorLoadPct>85)warnings.push('generatorHighLoad');
 if(successfulAttempt>1)warnings.push('retryExposure');
 if(batterySocPct<80)warnings.push('lowSoc');
 const timeline=[
  {event:'utilityFailure',atSec:0},
  {event:'upsRideThrough',atSec:outageDetectSec},
  {event:'generatorStartCommand',atSec:outageDetectSec+startDelaySec},
  {event:'generatorAvailable',atSec:outageDetectSec+startDelaySec+crankTotal+retryDelayTotal+warmupSec},
  {event:'atsTransferComplete',atSec:outageDetectSec+startDelaySec+crankTotal+retryDelayTotal+warmupSec+atsTransferSec},
  {event:'stableOnGenerator',atSec:transferWindowSec}
 ];
 return{ok:true,errors,warnings,criticalLoadKW,upsUsableKW,upsAutonomyMin,batterySocPct,effectiveUpsAutonomySec,upsLoadPct,genRatedKW,genCount,redundantGen,remainingGenerators,genUsablePct,generatorUsableKW,stepFactor,generatorDesignLoadKW,generatorLoadPct,successfulAttempt,transferWindowSec,reserveSec,requiredRideThroughSec,rideThroughMarginSec,latestSafeTransferSec,maxExtraDelaySec,batteryUsedPct,upsCapacityPass,rideThroughPass,generatorCapacityPass,overallPass,risk,timeline};
}
return{calculate};
});
