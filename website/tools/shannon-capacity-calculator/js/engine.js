"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_Shannon=api;
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

function calculate(input){
  const bandwidth=unitValue(input&&input.bandwidth,{Hz:1,kHz:1e3,MHz:1e6,GHz:1e9});
  if(!bandwidth.ok)return bandwidth;
  const snr=readNumber(input&&input.snr);
  if(!snr.ok)return snr;
  if(!(bandwidth.value>0)||bandwidth.value>1e15)return fail("bandwidth-range");
  let linear;
  if(input.snrUnit==="dB"){
    if(snr.value<-40||snr.value>200)return fail("snr-range");
    linear=10**(snr.value/10);
  }else if(input.snrUnit==="linear"){
    if(snr.value<0||snr.value>1e20)return fail("snr-range");
    linear=snr.value;
  }else return fail("bad-unit");
  const capacity=bandwidth.value*Math.log2(1+linear);
  if(!Number.isFinite(capacity)||!Number.isFinite(linear))return fail("overflow");
  return {ok:true,values:{capacityMbps:capacity/1e6,capacityBps:capacity,snrLinear:linear,spectral:Math.log2(1+linear)},display:{capacityMbps:fmt(capacity/1e6,6),capacityBps:fmt(capacity,3),snrLinear:fmt(linear,6),spectral:fmt(Math.log2(1+linear),6)}};
}
return {calculate};
});
