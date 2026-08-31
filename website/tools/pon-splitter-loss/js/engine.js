(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELPonSplitterLossEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const ratios={"0":1,"3.7":2,"7.2":4,"10.5":8,"13.8":16,"17":32,"20.5":64,"24":128};
  const nonNegativeKeys=["distance","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","s1","s2","s3","other","penalty","margin","systemReach"];
  const countKeys=["spliceCount","connectorCount"];
  const DB_EPSILON=1e-9;

  function normalizeNearZero(value){
    return Math.abs(value)<=DB_EPSILON?0:value;
  }

  function validate(values){
    return Boolean(values)&&typeof values==="object"&&!Array.isArray(values)
      && nonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
      && countKeys.every(key=>Number.isSafeInteger(values[key]))
      && ["s1","s2","s3"].every(key=>Object.hasOwn(ratios,String(values[key])))
      && ["tx","txMax","sens","over"].every(key=>Number.isFinite(values[key]))
      && values.attenuation>0
      && values.systemReach>=0.1
      && values.tx<=values.txMax
      && values.sens<values.over;
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const r1=ratios[String(values.s1)];
    const r2=ratios[String(values.s2)];
    const r3=ratios[String(values.s3)];
    const totalRatio=r1*r2*r3;
    const splitterLoss=values.s1+values.s2+values.s3;
    const idealLoss=10*Math.log10(totalRatio);
    const excessLoss=Math.max(0,splitterLoss-idealLoss);
    const fiberLoss=values.distance*values.attenuation;
    const spliceTotal=values.spliceCount*values.spliceLoss;
    const connectorTotal=values.connectorCount*values.connectorLoss;
    const fixedPhysical=spliceTotal+connectorTotal+splitterLoss+values.other;
    const physicalLoss=fiberLoss+fixedPhysical;
    const designLoss=physicalLoss+values.margin;
    const rawWindow=values.tx-values.sens;
    const standardBudget=rawWindow-values.penalty;
    const remaining=normalizeNearZero(standardBudget-designLoss);
    const rx=values.tx-physicalLoss;
    const rxMax=values.txMax-physicalLoss;
    const sensMargin=normalizeNearZero(rx-values.sens);
    const overMargin=normalizeNearZero(values.over-rxMax);
    const opticalMax=Math.max(0,(standardBudget-values.margin-fixedPhysical)/values.attenuation);
    const effectiveMax=Math.min(opticalMax,values.systemReach);
    if(![totalRatio,splitterLoss,idealLoss,excessLoss,fiberLoss,spliceTotal,connectorTotal,fixedPhysical,physicalLoss,designLoss,rawWindow,standardBudget,remaining,rx,rxMax,sensMargin,overMargin,opticalMax,effectiveMax].every(Number.isFinite)){
      return{ok:false,error:"invalid-input"};
    }
    let status="healthy";
    if(remaining < -DB_EPSILON || sensMargin < -DB_EPSILON || overMargin < -DB_EPSILON)status="failed";
    else if(remaining < 3-DB_EPSILON || sensMargin < 3-DB_EPSILON || overMargin < 3-DB_EPSILON)status="warning";
    return{ok:true,r1,r2,r3,totalRatio,splitterLoss,idealLoss,excessLoss,fiberLoss,spliceTotal,connectorTotal,fixedPhysical,physicalLoss,designLoss,rawWindow,standardBudget,remaining,rx,rxMax,sensMargin,overMargin,opticalMax,effectiveMax,status};
  }

  return{validate,calculate};
});
