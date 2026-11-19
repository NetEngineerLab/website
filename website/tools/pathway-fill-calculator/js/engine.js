"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_PathwayFill=api;
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
  const conduit=unitValue(input&&input.conduit,{mm:1,inch:25.4});
  if(!conduit.ok)return conduit;
  if(!(conduit.value>0)||conduit.value>10000)return fail("conduit-range");
  if(!Array.isArray(input.groups)||input.groups.length<1||input.groups.length>4)return fail("group-count");
  let sumD2=0;
  for(const group of input.groups){
    const diameter=unitValue(group&&group.diameter,{mm:1,inch:25.4});
    if(!diameter.ok)return diameter;
    const count=readInt(group&&group.count);
    if(!count.ok)return count;
    if(!(diameter.value>0)||diameter.value>5000)return fail("diameter-range");
    if(count.value<1||count.value>100000)return fail("count-range");
    sumD2+=count.value*diameter.value*diameter.value;
  }
  if(!Number.isFinite(sumD2))return fail("overflow");
  const fill=sumD2/(conduit.value*conduit.value)*100;
  const out={ok:true,values:{fillPercent:fill,cableAreaFactor:sumD2,conduitDiameterMm:conduit.value},display:{fillPercent:fmt(fill,4),cableAreaFactor:fmt(sumD2,4),conduitDiameterMm:fmt(conduit.value,4)}};
  if(input.limitPercent!=null&&String(input.limitPercent).trim()!==""){
    const limit=readNumber(input.limitPercent);
    if(!limit.ok)return limit;
    if(!(limit.value>0)||limit.value>100)return fail("limit-range");
    out.values.marginPercent=limit.value-fill;
    out.display.marginPercent=fmt(limit.value-fill,4);
    out.status=fill>limit.value?"over-limit":"within-limit";
  }else{
    out.values.marginPercent=null;out.display.marginPercent="—";out.status="no-limit";
  }
  return out;
}
return {calculate};
});
