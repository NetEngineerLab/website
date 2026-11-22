"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_Mm1=api;
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
  const arrival=unitValue(input&&input.arrival,{per_s:1,per_min:1/60});
  if(!arrival.ok)return arrival;
  const service=unitValue(input&&input.service,{per_s:1,per_min:1/60});
  if(!service.ok)return service;
  if(!(arrival.value>0)||arrival.value>1e12)return fail("arrival-range");
  if(!(service.value>0)||service.value>1e12)return fail("service-range");
  if(!(service.value>arrival.value))return fail("unstable");
  const rho=arrival.value/service.value;
  const sojourn=1/(service.value-arrival.value);
  const wait=rho/(service.value*(1-rho));
  const system=rho/(1-rho);
  const queue=rho*rho/(1-rho);
  if(![rho,sojourn,wait,system,queue].every(Number.isFinite))return fail("overflow");
  return {ok:true,values:{utilization:rho,sojournMs:sojourn*1000,waitMs:wait*1000,systemCount:system,queueCount:queue},display:{utilization:fmt(rho,6),sojournMs:fmt(sojourn*1000,6),waitMs:fmt(wait*1000,6),systemCount:fmt(system,6),queueCount:fmt(queue,6)}};
}
return {calculate};
});
