(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELPonSplitterLossEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const ratios={"0":1,"3.7":2,"7.2":4,"10.5":8,"13.8":16,"17":32,"20.5":64,"24":128};
  const nonNegativeKeys=["distance","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","s1","s2","s3","other","penalty","margin","systemReach"];

  function validate(values){
    return nonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
      && ["tx","sens","over"].every(key=>Number.isFinite(values[key]));
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const r1=ratios[String(values.s1)]||1;
    const r2=ratios[String(values.s2)]||1;
    const r3=ratios[String(values.s3)]||1;
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
    const standardBudget=Math.max(0,rawWindow-values.penalty);
    const remaining=standardBudget-designLoss;
    const rx=values.tx-physicalLoss;
    const sensMargin=rx-values.sens;
    const overMargin=values.over-rx;
    const opticalMax=values.attenuation>0?Math.max(0,(standardBudget-values.margin-fixedPhysical)/values.attenuation):0;
    const effectiveMax=Math.min(opticalMax,values.systemReach);
    let status="healthy";
    if(remaining<0||sensMargin<0||overMargin<0)status="failed";
    else if(remaining<3||sensMargin<3||overMargin<3)status="warning";
    return{ok:true,r1,r2,r3,totalRatio,splitterLoss,idealLoss,excessLoss,fiberLoss,spliceTotal,connectorTotal,fixedPhysical,physicalLoss,designLoss,rawWindow,standardBudget,remaining,rx,sensMargin,overMargin,opticalMax,effectiveMax,status};
  }

  return{validate,calculate};
});
