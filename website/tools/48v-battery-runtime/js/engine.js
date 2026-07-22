(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELBatteryEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const num=(v,fallback=0)=>{const n=Number(v);return Number.isFinite(n)?n:fallback};
  const round=(v,d=2)=>Number(Number(v).toFixed(d));
  function validate(i){
    const errors=[];
    const positive=["nominalCellV","startCellV","cutoffCellV","seriesCells","parallelStrings","capacityAh","ratedHours","pathEfficiencyPct","dodPct","agePct","tempPct","curvePct"];
    positive.forEach(k=>{if(!(num(i[k])>0))errors.push(k)});
    if(!(num(i.peukertExponent)>=1&&num(i.peukertExponent)<=1.5))errors.push("peukertExponent");
    if(!(num(i.startCellV)>num(i.cutoffCellV)))errors.push("voltageWindow");
    if(!(num(i.pathEfficiencyPct)<=100&&num(i.dodPct)<=100&&num(i.agePct)<=100&&num(i.tempPct)<=150&&num(i.curvePct)<=150))errors.push("factorRange");
    if(!(num(i.baseLoadW)>0))errors.push("baseLoadW");
    return errors;
  }
  function calculate(input){
    const i={...input};
    const errors=validate(i);
    if(errors.length)return{ok:false,errors};

    const nominalCellV=num(i.nominalCellV), startCellV=num(i.startCellV), cutoffCellV=num(i.cutoffCellV);
    const seriesCells=Math.max(1,Math.round(num(i.seriesCells)));
    const parallelStrings=Math.max(1,Math.round(num(i.parallelStrings)));
    const capacityAh=num(i.capacityAh), ratedHours=num(i.ratedHours);
    const k=num(i.peukertExponent,1.1);
    const nominalV=nominalCellV*seriesCells;
    const startV=startCellV*seriesCells;
    const cutoffV=cutoffCellV*seriesCells;
    const averageV=(startV+cutoffV)/2;
    const floatV=num(i.floatCellV,startCellV)*seriesCells;

    const baseLoadW=num(i.baseLoadW);
    const baseLoadCurrentA=baseLoadW/nominalV;
    const loadMargin=num(i.loadMarginPct)/100;
    const designLoadW=baseLoadW*(1+loadMargin);
    const designLoadCurrentA=designLoadW/nominalV;
    const efficiency=clamp(num(i.pathEfficiencyPct)/100,0.01,1);
    const batteryPowerW=designLoadW/efficiency;

    const currentStartA=batteryPowerW/startV;
    const currentAverageA=batteryPowerW/averageV;
    const currentCutoffA=batteryPowerW/cutoffV;
    const currentPerStringA=currentAverageA/parallelStrings;

    const dod=clamp(num(i.dodPct)/100,0.01,1);
    const age=clamp(num(i.agePct)/100,0.01,1);
    const temperature=clamp(num(i.tempPct)/100,0.01,1.5);
    const curve=clamp(num(i.curvePct)/100,0.01,1.5);
    const usableFactor=dod*age*temperature*curve;

    const nameplateAh=capacityAh*parallelStrings;
    const correctedAh=nameplateAh*usableFactor;
    const nameplateWh=nominalV*nameplateAh;
    const correctedBatteryWh=averageV*correctedAh;
    const correctedLoadWh=correctedBatteryWh*efficiency;

    const simpleRuntimeH=correctedAh/currentAverageA;
    const ratedCurrentPerStringA=capacityAh/ratedHours;
    const rawPeukertH=ratedHours*Math.pow(ratedCurrentPerStringA/currentPerStringA,k);
    const peukertRuntimeH=rawPeukertH*usableFactor;
    const model=i.model==="simple"?"simple":"peukert";
    const runtimeH=model==="simple"?simpleRuntimeH:peukertRuntimeH;
    const effectiveAh=runtimeH*currentAverageA;
    const deliveredWh=runtimeH*designLoadW;

    const targetRuntimeH=Math.max(0,num(i.targetRuntimeH));
    let requiredTotalAh=0,requiredAhPerString=0,requiredParallelStrings=0;
    if(targetRuntimeH>0){
      if(model==="simple"){
        requiredTotalAh=targetRuntimeH*currentAverageA/usableFactor;
        requiredAhPerString=requiredTotalAh/parallelStrings;
        requiredParallelStrings=Math.ceil(requiredTotalAh/capacityAh);
      }else{
        const requiredPerStringCurrent=currentAverageA/parallelStrings;
        requiredAhPerString=ratedHours*requiredPerStringCurrent*Math.pow(targetRuntimeH/(ratedHours*usableFactor),1/k);
        requiredTotalAh=requiredAhPerString*parallelStrings;
        const nFloat=(ratedHours*currentAverageA/capacityAh)*Math.pow(targetRuntimeH/(ratedHours*usableFactor),1/k);
        requiredParallelStrings=Math.ceil(nFloat);
      }
    }

    const cRate=currentPerStringA/capacityAh;
    const currentRisePct=(currentCutoffA/currentStartA-1)*100;
    const targetGapH=runtimeH-targetRuntimeH;
    const cellsTotal=seriesCells*parallelStrings;

    const warnings=[];
    const chemistry=i.chemistry||"custom";
    if(cRate>=0.2)warnings.push({code:"highRate",severity:"high"});
    else if(cRate>=0.1)warnings.push({code:"mediumRate",severity:"medium"});
    if(targetRuntimeH>0&&runtimeH<targetRuntimeH)warnings.push({code:"targetNotMet",severity:"high"});
    if(currentRisePct>=20)warnings.push({code:"currentRise",severity:"medium"});
    if(parallelStrings>=5)warnings.push({code:"manyParallel",severity:"medium"});
    if(age<0.7)warnings.push({code:"agedBattery",severity:"high"});
    if(temperature<0.8)warnings.push({code:"lowTemperature",severity:"medium"});
    if(chemistry==="lead-acid"&&dod>0.8)warnings.push({code:"leadAcidDeepDischarge",severity:"medium"});
    if(chemistry==="lifepo4")warnings.push({code:"lithiumBms",severity:"medium"});
    if(model==="peukert")warnings.push({code:"peukertApproximation",severity:"info"});
    warnings.push({code:"manufacturerCurve",severity:"info"});
    warnings.push({code:"noPowerFactor",severity:"info"});

    return{
      ok:true,model,
      nominalV:round(nominalV),floatV:round(floatV),startV:round(startV),cutoffV:round(cutoffV),averageV:round(averageV),
      baseLoadW:round(baseLoadW),baseLoadCurrentA:round(baseLoadCurrentA),designLoadW:round(designLoadW),designLoadCurrentA:round(designLoadCurrentA),batteryPowerW:round(batteryPowerW),
      currentStartA:round(currentStartA),currentAverageA:round(currentAverageA),currentCutoffA:round(currentCutoffA),currentPerStringA:round(currentPerStringA),
      nameplateAh:round(nameplateAh),correctedAh:round(correctedAh),effectiveAh:round(effectiveAh),
      nameplateWh:round(nameplateWh),correctedBatteryWh:round(correctedBatteryWh),correctedLoadWh:round(correctedLoadWh),deliveredWh:round(deliveredWh),
      usableFactor:round(usableFactor*100,2),simpleRuntimeH:round(simpleRuntimeH,3),peukertRuntimeH:round(peukertRuntimeH,3),runtimeH:round(runtimeH,3),
      ratedCurrentPerStringA:round(ratedCurrentPerStringA),cRate:round(cRate,4),currentRisePct:round(currentRisePct,2),
      targetRuntimeH:round(targetRuntimeH),targetGapH:round(targetGapH,3),
      requiredTotalAh:round(requiredTotalAh),requiredAhPerString:round(requiredAhPerString),requiredParallelStrings,
      seriesCells,parallelStrings,cellsTotal,capacityAh:round(capacityAh),ratedHours:round(ratedHours),peukertExponent:round(k,3),
      warnings
    };
  }
  return{calculate,round};
});