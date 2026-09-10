/**
 * NetEngineerLab
 * Version: V2.1-Power-Tool-31
 * Modified: 2026-09-10 10:48:00
 * Purpose: Data-center airflow and containment planning engine.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.NELAirflowContainmentEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ceil=(v)=>Math.ceil(v-1e-12);
function calculate(i={}){
  const errors=[],warnings=[];
  const rackCount=Math.max(1,Math.floor(num(i.rackCount,12)));
  const avgRackKW=num(i.avgRackKW,8);
  const directItKW=num(i.totalItKW,0);
  const itKW=directItKW>0?directItKW:rackCount*avgRackKW;
  const headroomPct=clamp(num(i.headroomPct,15),0,100);
  const supplyC=num(i.supplyTempC,20);
  const returnC=num(i.returnTempC,32);
  const deltaTC=returnC-supplyC;
  const bypassPct=clamp(num(i.bypassPct,10),0,80);
  const recircPct=clamp(num(i.recirculationPct,5),0,80);
  const unitAirflowM3h=num(i.unitAirflowM3h,18000);
  const unitSensibleKW=num(i.unitSensibleKW,60);
  const redundancyUnits=Math.max(0,Math.floor(num(i.redundancyUnits,1)));
  const installedUnits=Math.max(0,Math.floor(num(i.installedUnits,0)));
  const inletLimitC=num(i.inletLimitC,27);
  const rho=1.2, cp=1.006;
  if(!(itKW>0))errors.push('itLoad');
  if(!(deltaTC>0))errors.push('temperatureDelta');
  if(!(unitAirflowM3h>0&&unitSensibleKW>0))errors.push('coolingUnit');
  if(bypassPct>=80||recircPct>=80)errors.push('airflowFraction');
  if(errors.length)return{ok:false,errors,warnings};

  const designKW=itKW*(1+headroomPct/100);
  const idealRackAirflowM3h=designKW*3600/(rho*cp*deltaTC);
  const effectiveDelivery=1-bypassPct/100;
  const requiredSupplyAirflowM3h=idealRackAirflowM3h/effectiveDelivery;
  const airflowPerRackM3h=idealRackAirflowM3h/rackCount;
  const airflowPerKW=requiredSupplyAirflowM3h/designKW;
  const mixedInletC=supplyC+(recircPct/100)*(returnC-supplyC);
  const containmentIndexPct=(1-bypassPct/100)*(1-recircPct/100)*100;
  const airflowActive=ceil(requiredSupplyAirflowM3h/unitAirflowM3h);
  const coolingActive=ceil(designKW/unitSensibleKW);
  const activeUnits=Math.max(airflowActive,coolingActive);
  const recommendedUnits=activeUnits+redundancyUnits;
  const selectedUnits=installedUnits||recommendedUnits;
  const installedAirflowM3h=selectedUnits*unitAirflowM3h;
  const installedCoolingKW=selectedUnits*unitSensibleKW;
  const afterOneAirflowM3h=Math.max(0,(selectedUnits-1)*unitAirflowM3h);
  const afterOneCoolingKW=Math.max(0,(selectedUnits-1)*unitSensibleKW);
  const airflowMarginPct=(installedAirflowM3h/requiredSupplyAirflowM3h-1)*100;
  const coolingMarginPct=(installedCoolingKW/designKW-1)*100;
  const survivesOne=afterOneAirflowM3h>=requiredSupplyAirflowM3h&&afterOneCoolingKW>=designKW;
  const limitingDimension=airflowActive>coolingActive?'airflow':coolingActive>airflowActive?'sensibleCapacity':'balanced';
  let risk='healthy';
  if(mixedInletC>inletLimitC||airflowMarginPct<0||coolingMarginPct<0||!survivesOne)risk='high';
  else if(bypassPct>20||recircPct>15||containmentIndexPct<70||airflowMarginPct<10)risk='caution';
  if(bypassPct>20)warnings.push('highBypass');
  if(recircPct>15)warnings.push('highRecirculation');
  if(mixedInletC>inletLimitC)warnings.push('inletTemperature');
  if(!survivesOne&&redundancyUnits>0)warnings.push('n1Fail');
  if(airflowMarginPct<0)warnings.push('airflowDeficit');
  if(coolingMarginPct<0)warnings.push('coolingDeficit');
  if(deltaTC<6)warnings.push('lowDeltaT');
  if(deltaTC>18)warnings.push('highDeltaT');
  return {ok:true,warnings,rackCount,itKW,designKW,deltaTC,idealRackAirflowM3h,requiredSupplyAirflowM3h,airflowPerRackM3h,airflowPerKW,mixedInletC,containmentIndexPct,airflowActive,coolingActive,activeUnits,recommendedUnits,selectedUnits,installedAirflowM3h,installedCoolingKW,airflowMarginPct,coolingMarginPct,afterOneAirflowM3h,afterOneCoolingKW,survivesOne,limitingDimension,risk,bypassPct,recircPct,supplyC,returnC,inletLimitC};
}
return{calculate};
});
