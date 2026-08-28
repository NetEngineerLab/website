(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELOnuRxPowerEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const splitterRatios={"0":1,"3.7":2,"7.2":4,"10.5":8,"13.8":16,"17":32,"20.5":64};
  const nonNegativeKeys=["warning","distance","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","s1","s2","other"];

  function validate(values){
    return nonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
      && ["measured","sens","over","noSignal","tx"].every(key=>Number.isFinite(values[key]));
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const sensitivityMargin=values.measured-values.sens;
    const overloadMargin=values.over-values.measured;
    const receiverWindow=values.over-values.sens;
    let status="healthy";
    if(values.measured<=values.noSignal)status="nosignal";
    else if(values.measured<values.sens)status="failed";
    else if(values.measured>values.over)status="overload";
    else if(sensitivityMargin<values.warning||overloadMargin<values.warning)status="warning";
    const fiberLoss=values.distance*values.attenuation;
    const spliceTotal=values.spliceCount*values.spliceLoss;
    const connectorTotal=values.connectorCount*values.connectorLoss;
    const splitterLoss=values.s1+values.s2;
    const modeledLoss=fiberLoss+spliceTotal+connectorTotal+splitterLoss+values.other;
    const expectedRx=values.tx-modeledLoss;
    const deviation=values.measured-expectedRx;
    const inferredExtra=Math.max(0,expectedRx-values.measured);
    const ratio=(splitterRatios[String(values.s1)]||1)*(splitterRatios[String(values.s2)]||1);
    return{ok:true,sensitivityMargin,overloadMargin,receiverWindow,status,fiberLoss,spliceTotal,connectorTotal,splitterLoss,modeledLoss,expectedRx,deviation,inferredExtra,ratio};
  }

  return{validate,calculate};
});
