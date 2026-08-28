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

  function validate(values){
    return nonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
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
    const budgetRemaining=values.availableBudget-designLoss;
    const estimatedRxPower=values.txPower-physicalLoss;
    const rxMargin=estimatedRxPower-values.rxThreshold;
    let status="healthy";
    if(budgetRemaining<0||rxMargin<0)status="failed";
    else if(budgetRemaining<3||rxMargin<3)status="warning";
    return{
      ok:true,fiberLoss,spliceTotal,connectorTotal,splitterOtherTotal,
      physicalLoss,designLoss,budgetRemaining,estimatedRxPower,rxMargin,status
    };
  }

  return{validate,calculate};
});
