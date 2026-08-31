(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELOpticalPowerBudgetEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const nonNegativeKeys=["penalty","d","a","sc","sl","cc","cl","s1","s2","s3","other","margin"];
  const countKeys=["sc","cc"];
  const DB_EPSILON=1e-9;

  function normalizeNearZero(value){
    return Math.abs(value)<=DB_EPSILON?0:value;
  }

  function validate(values){
    return Boolean(values)&&typeof values==="object"&&!Array.isArray(values)
      && nonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
      && countKeys.every(key=>Number.isSafeInteger(values[key]))
      && ["tx","txMax","sens","over"].every(key=>Number.isFinite(values[key]))
      && values.a>0
      && values.tx<=values.txMax
      && values.sens<values.over;
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const raw=values.tx-values.sens;
    const standard=raw-values.penalty;
    const fiber=values.d*values.a;
    const splice=values.sc*values.sl;
    const conn=values.cc*values.cl;
    const split=values.s1+values.s2+values.s3;
    const fixed=splice+conn+split+values.other;
    const physical=fiber+fixed;
    const design=physical+values.margin;
    const remain=normalizeNearZero(standard-design);
    const rx=values.tx-physical;
    const rxMax=values.txMax-physical;
    const sensM=normalizeNearZero(rx-values.sens);
    const overM=normalizeNearZero(values.over-rxMax);
    const maxD=Math.max(0,(standard-values.margin-fixed)/values.a);
    if(![raw,standard,fiber,splice,conn,split,fixed,physical,design,remain,rx,rxMax,sensM,overM,maxD].every(Number.isFinite)){
      return{ok:false,error:"invalid-input"};
    }
    let st="healthy";
    if(remain < -DB_EPSILON || sensM < -DB_EPSILON || overM < -DB_EPSILON)st="failed";
    else if(remain < 3-DB_EPSILON || sensM < 3-DB_EPSILON || overM < 3-DB_EPSILON)st="warning";
    const usage=standard>0?Math.max(0,design/standard*100):130;
    if(!Number.isFinite(usage))return{ok:false,error:"invalid-input"};
    return{ok:true,raw,standard,fiber,splice,conn,split,fixed,physical,design,remain,rx,rxMax,sensM,overM,maxD,st,usage};
  }

  return{validate,calculate};
});
