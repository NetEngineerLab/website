"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_FeederDrop=api;
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
  const voltage=readNumber(input&&input.voltage);
  if(!voltage.ok)return voltage;
  const current=readNumber(input&&input.current);
  if(!current.ok)return current;
  const length=unitValue(input&&input.length,{m:1,ft:0.3048});
  if(!length.ok)return length;
  const area=unitValue(input&&input.area,{mm2:1,cm2:100});
  if(!area.ok)return area;
  const temperature=readNumber(input&&input.temperature);
  if(!temperature.ok)return temperature;
  const alpha=readNumber(input&&input.alpha);
  if(!alpha.ok)return alpha;
  const conductors=readInt(input&&input.conductors);
  if(!conductors.ok)return conductors;
  const rho=readNumber(input&&input.rho20);
  if(!rho.ok)return rho;
  if(!(voltage.value>0)||voltage.value>2000)return fail("voltage-range");
  if(current.value<0||current.value>100000)return fail("current-range");
  if(!(length.value>0)||length.value>100000)return fail("length-range");
  if(!(area.value>0)||area.value>100000)return fail("area-range");
  if(temperature.value<-50||temperature.value>200)return fail("temperature-range");
  if(alpha.value<0||alpha.value>0.02)return fail("alpha-range");
  if(conductors.value!==1&&conductors.value!==2)return fail("conductor-count");
  if(!(rho.value>0)||rho.value>10)return fail("rho-range");
  const factor=1+alpha.value*(temperature.value-20);
  if(!(factor>0))return fail("temperature-range");
  const resistance=rho.value*factor*conductors.value*length.value/area.value;
  const drop=current.value*resistance;
  const percent=drop/voltage.value*100;
  const end=voltage.value-drop;
  if(![resistance,drop,percent,end].every(Number.isFinite))return fail("overflow");
  return {ok:true,values:{resistanceOhm:resistance,dropV:drop,dropPercent:percent,endVoltage:end},display:{resistanceOhm:fmt(resistance,6),dropV:fmt(drop,6),dropPercent:fmt(percent,4),endVoltage:fmt(end,4)}};
}
return {calculate,constants:{rho20:1/58}};
});
