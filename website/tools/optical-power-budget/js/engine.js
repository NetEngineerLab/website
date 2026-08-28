(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELOpticalPowerBudgetEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const nonNegativeKeys=["penalty","d","a","sc","sl","cc","cl","s1","s2","s3","other","margin"];

  function validate(values){
    return nonNegativeKeys.every(key=>Number.isFinite(values[key])&&values[key]>=0)
      && ["tx","sens","over"].every(key=>Number.isFinite(values[key]));
  }

  function calculate(values){
    if(!validate(values))return{ok:false,error:"invalid-input"};
    const raw=values.tx-values.sens;
    const standard=Math.max(0,raw-values.penalty);
    const fiber=values.d*values.a;
    const splice=values.sc*values.sl;
    const conn=values.cc*values.cl;
    const split=values.s1+values.s2+values.s3;
    const fixed=splice+conn+split+values.other;
    const physical=fiber+fixed;
    const design=physical+values.margin;
    const remain=standard-design;
    const rx=values.tx-physical;
    const sensM=rx-values.sens;
    const overM=values.over-rx;
    const maxD=values.a>0?Math.max(0,(standard-values.margin-fixed)/values.a):0;
    let st="healthy";
    if(remain<0||sensM<0||overM<0)st="failed";
    else if(remain<3||sensM<3||overM<3)st="warning";
    const usage=standard>0?Math.max(0,design/standard*100):130;
    return{ok:true,raw,standard,fiber,splice,conn,split,fixed,physical,design,remain,rx,sensM,overM,maxD,st,usage};
  }

  return{validate,calculate};
});
