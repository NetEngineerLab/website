"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_Mathis=api;
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
  const mss=readInt(input&&input.mss);
  if(!mss.ok)return mss;
  const rtt=unitValue(input&&input.rtt,{ms:0.001,us:1e-6,s:1});
  if(!rtt.ok)return rtt;
  const loss=unitValue(input&&input.loss,{probability:1,percent:0.01});
  if(!loss.ok)return loss;
  if(mss.value<1||mss.value>65535)return fail("mss-range");
  if(!(rtt.value>0)||rtt.value>100)return fail("rtt-range");
  if(!(loss.value>0)||loss.value>=1)return fail("loss-range");
  const throughput=(mss.value*8)/(rtt.value*Math.sqrt(loss.value));
  if(!Number.isFinite(throughput))return fail("overflow");
  const out={ok:true,values:{throughputMbps:throughput/1e6,throughputBps:throughput},display:{throughputMbps:fmt(throughput/1e6,6),throughputBps:fmt(throughput,3)}};
  if(input.link&&String(input.link.value).trim()!==""){
    const link=unitValue(input.link,{Mbps:1e6,Gbps:1e9,Kbps:1e3});
    if(!link.ok)return link;
    if(!(link.value>0)||link.value>1e15)return fail("link-range");
    const bdpBytes=link.value*rtt.value/8;
    out.values.bdpBytes=bdpBytes;
    out.values.bdpPackets=bdpBytes/mss.value;
    out.display.bdpBytes=fmt(bdpBytes,3);
    out.display.bdpPackets=fmt(bdpBytes/mss.value,4);
  }else{
    out.values.bdpBytes=null;out.values.bdpPackets=null;out.display.bdpBytes="—";out.display.bdpPackets="—";
  }
  return out;
}
return {calculate};
});
