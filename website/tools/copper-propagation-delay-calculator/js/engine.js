"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_CopperDelay=api;
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

const C=299792458;
function calculate(input){
  const length=unitValue(input&&input.length,{m:1,ft:0.3048});
  if(!length.ok)return length;
  const vf=readNumber(input&&input.velocityFactor);
  if(!vf.ok)return vf;
  if(!(length.value>0)||length.value>1e9)return fail("length-range");
  if(!(vf.value>0)||vf.value>1)return fail("vf-range");
  const velocity=vf.value*C;
  const delay=length.value/velocity;
  if(!Number.isFinite(delay)||!Number.isFinite(velocity))return fail("overflow");
  return {ok:true,values:{delayNs:delay*1e9,delayUs:delay*1e6,nsPerMeter:1e9/velocity,velocityMps:velocity},display:{delayNs:fmt(delay*1e9,4),delayUs:fmt(delay*1e6,6),nsPerMeter:fmt(1e9/velocity,4),velocityMps:fmt(velocity,3)}};
}
return {calculate,constants:{c:C}};
});
