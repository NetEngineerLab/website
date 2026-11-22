"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_Availability=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
function fail(code){return {ok:false,error:code};}
function readNumber(value){
  if(value==null)return fail("empty");
  if(typeof value==="string"){
    const text=value.trim();
    if(!text)return fail("empty");
    if(!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(text))return fail("invalid-number");
    value=Number(text);
  }
  if(typeof value!=="number"||!Number.isFinite(value))return fail("non-finite");
  return {ok:true,value};
}
function readInt(value){
  const n=readNumber(value);
  if(!n.ok)return n;
  if(!Number.isInteger(n.value))return fail("not-integer");
  return n;
}
function unitValue(node,table){
  if(!node||typeof node!=="object")return fail("empty");
  const n=readNumber(node.value);
  if(!n.ok)return n;
  const factor=table[node.unit];
  if(factor==null)return fail("bad-unit");
  const out=n.value*factor;
  if(!Number.isFinite(out))return fail("overflow");
  return {ok:true,value:out};
}
function fmt(value,digits){
  if(!Number.isFinite(value))return "—";
  const text=value.toFixed(digits);
  return text.replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"");
}

function downtime(a){return (1-a)*365*24*60;}
function pack(a){
  if(!(a>0)||a>1||!Number.isFinite(a))return fail("availability-range");
  return {ok:true,values:{availability:a,unavailability:1-a,downMinutesPerYear:downtime(a)},display:{availability:fmt(a,8),unavailability:fmt(1-a,8),downMinutesPerYear:fmt(downtime(a),6)}};
}
function calculate(input){
  if(!input||(input.kind!=="blocks"&&input.kind!=="mtbf"))return fail("bad-kind");
  if(input.kind==="mtbf"){
    const mtbf=readNumber(input.mtbfHours);
    if(!mtbf.ok)return mtbf;
    const mttr=readNumber(input.mttrHours);
    if(!mttr.ok)return mttr;
    if(!(mtbf.value>0)||mtbf.value>1e12)return fail("mtbf-range");
    if(!(mttr.value>0)||mttr.value>1e9)return fail("mttr-range");
    return pack(mtbf.value/(mtbf.value+mttr.value));
  }
  if(input.mode!=="series"&&input.mode!=="parallel")return fail("bad-mode");
  if(!Array.isArray(input.blocks)||input.blocks.length<1||input.blocks.length>20)return fail("block-count");
  const values=[];
  for(const block of input.blocks){
    const n=readNumber(block);
    if(!n.ok)return n;
    if(!(n.value>0)||n.value>1)return fail("availability-range");
    values.push(n.value);
  }
  let a=input.mode==="series"?1:1;
  if(input.mode==="series"){for(const v of values)a*=v;}
  else{let miss=1;for(const v of values)miss*=(1-v);a=1-miss;}
  if(!Number.isFinite(a))return fail("overflow");
  return pack(a);
}
return {calculate};
});
