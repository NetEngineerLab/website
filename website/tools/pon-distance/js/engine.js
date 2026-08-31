(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELPonDistanceEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const splitterRatios={"0":1,"3.7":2,"7.2":4,"10.5":8,"13.8":16,"17":32,"20.5":64};
  const nonNegativeKeys=["planned","systemReach","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","s1","s2","other","margin"];
  const countKeys=["spliceCount","connectorCount"];
  const DB_EPSILON=1e-9;

  function validate(values){
    return Boolean(values)&&typeof values==="object"&&!Array.isArray(values)
      && nonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
      && countKeys.every(key=>Number.isSafeInteger(values[key]))
      && ["s1","s2"].every(key=>Object.hasOwn(splitterRatios,String(values[key])))
      && ["tx","sens","over"].every(key=>Number.isFinite(values[key]))
      && values.attenuation>0
      && values.systemReach>=0.1
      && values.sens<values.over;
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const maxChannelLoss=values.tx-values.sens;
    const spliceTotal=values.spliceCount*values.spliceLoss;
    const connectorTotal=values.connectorCount*values.connectorLoss;
    const splitterTotal=values.s1+values.s2;
    const fixedPhysical=spliceTotal+connectorTotal+splitterTotal+values.other;
    const fiberAllowanceDesign=maxChannelLoss-fixedPhysical-values.margin;
    const opticalMax=values.attenuation>0?Math.max(0,fiberAllowanceDesign/values.attenuation):0;
    const effectiveMax=Math.min(opticalMax,values.systemReach);
    const plannedFiber=values.planned*values.attenuation;
    const plannedPhysical=fixedPhysical+plannedFiber;
    const plannedDesign=plannedPhysical+values.margin;
    const physicalHeadroom=maxChannelLoss-plannedPhysical;
    const designRemaining=maxChannelLoss-plannedDesign;
    const estimatedRx=values.tx-plannedPhysical;
    const overloadMargin=values.over-estimatedRx;
    const ratio=splitterRatios[String(values.s1)]*splitterRatios[String(values.s2)];
    if(![maxChannelLoss,spliceTotal,connectorTotal,splitterTotal,fixedPhysical,fiberAllowanceDesign,opticalMax,effectiveMax,plannedFiber,plannedPhysical,plannedDesign,physicalHeadroom,designRemaining,estimatedRx,overloadMargin,ratio].every(Number.isFinite))return{ok:false,error:"invalid-input"};
    let limiter="equal";
    if(opticalMax<values.systemReach-0.05)limiter="optical";
    else if(values.systemReach<opticalMax-0.05)limiter="system";
    let status="healthy";
    if(values.planned>effectiveMax+DB_EPSILON||physicalHeadroom<-DB_EPSILON||estimatedRx<values.sens-DB_EPSILON)status="failed";
    else if(designRemaining<-DB_EPSILON)status="warning";
    else if(limiter==="system"&&values.planned<=effectiveMax+DB_EPSILON)status="limited";
    return{ok:true,maxChannelLoss,spliceTotal,connectorTotal,splitterTotal,fixedPhysical,fiberAllowanceDesign,opticalMax,effectiveMax,plannedFiber,plannedPhysical,plannedDesign,physicalHeadroom,designRemaining,estimatedRx,overloadMargin,ratio,limiter,status};
  }

  return{validate,calculate};
});
