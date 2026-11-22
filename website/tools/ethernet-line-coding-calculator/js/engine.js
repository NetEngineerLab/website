"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_LineCoding=api;
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

const CODES={
  "8b10b":{num:10,den:8},
  "64b66b":{num:66,den:64},
  "64b66b-rs528":{num:66*528,den:64*514},
  "64b66b-rs544":{num:66*544,den:64*514}
};
function calculate(input){
  const payload=unitValue(input&&input.payload,{Gbps:1,Mbps:1e-3,Tbps:1000});
  if(!payload.ok)return payload;
  const code=CODES[input&&input.code];
  if(!code)return fail("bad-code");
  if(!(payload.value>0)||payload.value>100000)return fail("payload-range");
  const line=payload.value*code.num/code.den;
  if(!Number.isFinite(line))return fail("overflow");
  const ratio=code.num/code.den;
  return {ok:true,values:{lineGbps:line,overheadPercent:(ratio-1)*100,efficiencyPercent:100/ratio,expansion:ratio},display:{lineGbps:fmt(line,6),overheadPercent:fmt((ratio-1)*100,4),efficiencyPercent:fmt(100/ratio,4),expansion:fmt(ratio,6)}};
}
return {calculate,codes:CODES};
});
