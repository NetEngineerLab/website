(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELFiberLossEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const nonNegativeKeys=[
    "distance","attenuation","spliceCount","spliceLoss",
    "connectorCount","connectorLoss","splitter1","splitter2",
    "otherLoss","engineeringMargin","availableBudget"
  ];
  const countKeys=["spliceCount","connectorCount"];
  const DB_EPSILON=1e-9;

  function normalizeNearZero(value){
    return Math.abs(value)<=DB_EPSILON?0:value;
  }

  function validate(values){
    return Boolean(values)&&typeof values==="object"&&!Array.isArray(values)
      && nonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
      && countKeys.every(key=>Number.isSafeInteger(values[key]))
      && Number.isFinite(values.txPower)
      && Number.isFinite(values.rxThreshold);
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const fiberLoss=values.distance*values.attenuation;
    const spliceTotal=values.spliceCount*values.spliceLoss;
    const connectorTotal=values.connectorCount*values.connectorLoss;
    const splitterOtherTotal=values.splitter1+values.splitter2+values.otherLoss;
    const physicalLoss=fiberLoss+spliceTotal+connectorTotal+splitterOtherTotal;
    const designLoss=physicalLoss+values.engineeringMargin;
    const budgetRemaining=normalizeNearZero(values.availableBudget-designLoss);
    const estimatedRxPower=values.txPower-physicalLoss;
    const rxMargin=normalizeNearZero(estimatedRxPower-values.rxThreshold);
    if(![fiberLoss,spliceTotal,connectorTotal,splitterOtherTotal,physicalLoss,designLoss,budgetRemaining,estimatedRxPower,rxMargin].every(Number.isFinite)){
      return{ok:false,error:"invalid-input"};
    }
    let status="healthy";
    if(budgetRemaining < -DB_EPSILON || rxMargin < -DB_EPSILON)status="failed";
    else if(budgetRemaining < 3-DB_EPSILON || rxMargin < 3-DB_EPSILON)status="warning";
    return{
      ok:true,fiberLoss,spliceTotal,connectorTotal,splitterOtherTotal,
      physicalLoss,designLoss,budgetRemaining,estimatedRxPower,rxMargin,status
    };
  }

  return{validate,calculate};
});
