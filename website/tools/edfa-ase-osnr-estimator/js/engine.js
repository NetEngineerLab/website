"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_EdfaOsnr=api;
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

const H=6.62607015e-34;
function calculate(input){
  const power=readNumber(input&&input.powerDbm);
  if(!power.ok)return power;
  const gain=readNumber(input&&input.gainDb);
  if(!gain.ok)return gain;
  const nf=readNumber(input&&input.noiseFigureDb);
  if(!nf.ok)return nf;
  const frequency=unitValue(input&&input.frequency,{THz:1e12,GHz:1e9});
  if(!frequency.ok)return frequency;
  const bandwidth=unitValue(input&&input.bandwidth,{GHz:1e9,MHz:1e6,Hz:1});
  if(!bandwidth.ok)return bandwidth;
  const spans=readInt(input&&input.spans);
  if(!spans.ok)return spans;
  if(power.value<-80||power.value>40)return fail("power-range");
  if(gain.value<=0||gain.value>50)return fail("gain-range");
  if(nf.value<0||nf.value>40)return fail("nf-range");
  if(frequency.value<100e12||frequency.value>400e12)return fail("frequency-range");
  if(bandwidth.value<=0||bandwidth.value>1e13)return fail("bandwidth-range");
  if(spans.value<1||spans.value>10000)return fail("span-range");
  const gLin=10**(gain.value/10);
  const fLin=10**(nf.value/10);
  const signalW=10**((power.value-30)/10);
  const aseOne=fLin*H*frequency.value*(gLin-1)*bandwidth.value;
  const aseW=spans.value*aseOne;
  if(!(aseW>0)||!Number.isFinite(aseW)||!Number.isFinite(signalW))return fail("overflow");
  const osnr=signalW/aseW;
  if(!(osnr>0)||!Number.isFinite(osnr))return fail("overflow");
  const osnrDb=10*Math.log10(osnr);
  return {ok:true,values:{osnrDb,aseDbm:10*Math.log10(aseW)+30,signalMw:signalW*1000,aseMw:aseW*1000},display:{osnrDb:fmt(osnrDb,4),aseDbm:fmt(10*Math.log10(aseW)+30,4),signalMw:fmt(signalW*1000,6),aseMw:fmt(aseW*1000,6)}};
}
return {calculate,constants:{h:H}};
});
