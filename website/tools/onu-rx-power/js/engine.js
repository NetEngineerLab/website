(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELOnuRxPowerEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const splitterRatios={"0":1,"3.7":2,"7.2":4,"10.5":8,"13.8":16,"17":32,"20.5":64};
  const modelNonNegativeKeys=["distance","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","s1","s2","other"];
  const countKeys=["spliceCount","connectorCount"];
  const DB_EPSILON=1e-9;

  function normalizeNearZero(value){
    return Math.abs(value)<=DB_EPSILON?0:value;
  }

  function validate(values){
    return Boolean(values)&&typeof values==="object"&&!Array.isArray(values)
      && ["measured","sens","over","noSignal","warning"].every(key=>Number.isFinite(values[key]))
      && values.warning>=0
      && values.noSignal<values.sens
      && values.sens<values.over
      && (values.mode==="measured"||(values.mode==="model"
        && modelNonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
        && countKeys.every(key=>Number.isSafeInteger(values[key]))
        && ["s1","s2"].every(key=>Object.hasOwn(splitterRatios,String(values[key])))
        && Number.isFinite(values.tx)
        && values.attenuation>0));
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const sensitivityMargin=normalizeNearZero(values.measured-values.sens);
    const overloadMargin=normalizeNearZero(values.over-values.measured);
    const receiverWindow=values.over-values.sens;
    if(![sensitivityMargin,overloadMargin,receiverWindow].every(Number.isFinite))return{ok:false,error:"invalid-input"};
    let status="healthy";
    if(values.measured<=values.noSignal)status="nosignal";
    else if(sensitivityMargin<-DB_EPSILON)status="failed";
    else if(overloadMargin<-DB_EPSILON)status="overload";
    else if(sensitivityMargin+DB_EPSILON<values.warning||overloadMargin+DB_EPSILON<values.warning)status="warning";
    if(values.mode==="measured")return{ok:true,sensitivityMargin,overloadMargin,receiverWindow,status};
    const fiberLoss=values.distance*values.attenuation;
    const spliceTotal=values.spliceCount*values.spliceLoss;
    const connectorTotal=values.connectorCount*values.connectorLoss;
    const splitterLoss=values.s1+values.s2;
    const modeledLoss=fiberLoss+spliceTotal+connectorTotal+splitterLoss+values.other;
    const expectedRx=values.tx-modeledLoss;
    const deviation=normalizeNearZero(values.measured-expectedRx);
    const inferredExtra=Math.max(0,expectedRx-values.measured);
    const ratio=splitterRatios[String(values.s1)]*splitterRatios[String(values.s2)];
    if(![sensitivityMargin,overloadMargin,receiverWindow,fiberLoss,spliceTotal,connectorTotal,splitterLoss,modeledLoss,expectedRx,deviation,inferredExtra,ratio].every(Number.isFinite)){
      return{ok:false,error:"invalid-input"};
    }
    return{ok:true,sensitivityMargin,overloadMargin,receiverWindow,status,fiberLoss,spliceTotal,connectorTotal,splitterLoss,modeledLoss,expectedRx,deviation,inferredExtra,ratio};
  }

  return{validate,calculate};
});
