(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.NELPUEEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const n=v=>Number(v);
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function calc(input={}){
  const mode=input.mode||"power";
  const total=n(input.total), it=n(input.it);
  const periodDays=Math.max(1,n(input.periodDays)||30);
  const errors=[];
  if(!(total>0))errors.push("total");
  if(!(it>0))errors.push("it");
  if(total>0&&it>total)errors.push("it_gt_total");
  if(errors.length)return{ok:false,errors};
  const pue=total/it, nonIT=total-it, itShare=it/total*100, overheadPct=nonIT/it*100;
  const annualFactor=mode==="power"?8760:365/periodDays;
  const annualTotal=total*annualFactor, annualIT=it*annualFactor, annualNonIT=nonIT*annualFactor;
  const tariff=Math.max(0,n(input.tariff)||0);
  const annualCost=annualTotal*tariff;
  const targetPUE=Math.max(1,n(input.targetPUE)||1.4);
  const targetAnnualTotal=annualIT*targetPUE;
  const savingsKWh=Math.max(0,annualTotal-targetAnnualTotal);
  const savingsCost=savingsKWh*tariff;
  const growthPct=n(input.itGrowthPct)||20;
  const grownIT=annualIT*(1+growthPct/100);
  const fixedOverheadPUE=(grownIT+annualNonIT)/grownIT;
  const parts={cooling:n(input.cooling)||0,ups:n(input.ups)||0,lighting:n(input.lighting)||0,distribution:n(input.distribution)||0,other:n(input.other)||0};
  const partSum=Object.values(parts).reduce((a,b)=>a+Math.max(0,b),0);
  const breakdownGap=nonIT-partSum;
  const annualWaterL=Math.max(0,n(input.annualWaterL)||0);
  const annualCO2kg=Math.max(0,n(input.annualCO2kg)||0);
  const wue=annualWaterL>0?annualWaterL/annualIT:null;
  const cue=annualCO2kg>0?annualCO2kg/annualIT:null;
  let status="poor"; if(pue<=targetPUE)status="healthy"; else if(pue<=targetPUE+0.2)status="caution";
  const trend=String(input.monthlyPUE||"").split(/[,;\s]+/).map(Number).filter(v=>Number.isFinite(v)&&v>=1&&v<10).slice(0,12);
  const trendStats=trend.length?{count:trend.length,avg:trend.reduce((a,b)=>a+b,0)/trend.length,min:Math.min(...trend),max:Math.max(...trend),latest:trend.at(-1)}:null;
  const warnings=[];
  if(partSum>nonIT*1.02)warnings.push("breakdown_exceeds_overhead");
  if(pue<1)warnings.push("invalid_pue");
  if(mode==="energy"&&periodDays<1)warnings.push("period");
  return{ok:true,mode,pue,nonIT,itShare,overheadPct,annualTotal,annualIT,annualNonIT,annualCost,targetPUE,targetAnnualTotal,savingsKWh,savingsCost,growthPct,grownIT,fixedOverheadPUE,parts,partSum,breakdownGap,status,wue,cue,trend,trendStats,warnings};
 }
 return{calculate:calc};
});