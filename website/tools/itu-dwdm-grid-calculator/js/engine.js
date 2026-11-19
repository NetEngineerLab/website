"use strict";
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NEL_DwdmGrid=api;
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

const C_NM_THZ=299792458/1000;
function calculate(input){
  const anchor=unitValue(input&&input.anchor,{THz:1,GHz:1e-3});
  if(!anchor.ok)return anchor;
  const spacing=unitValue(input&&input.spacing,{GHz:1,THz:1000,MHz:1e-3});
  if(!spacing.ok)return spacing;
  const channel=readInt(input&&input.channel);
  if(!channel.ok)return channel;
  if(anchor.value<100||anchor.value>400)return fail("anchor-range");
  if(spacing.value<=0||spacing.value>10000)return fail("spacing-range");
  if(channel.value<-100000||channel.value>100000)return fail("channel-range");
  const frequency=anchor.value+channel.value*spacing.value/1000;
  if(!(frequency>0)||frequency>1000)return fail("frequency-range");
  const wavelength=C_NM_THZ/frequency;
  if(!Number.isFinite(wavelength))return fail("overflow");
  const rows=[];
  for(let n=channel.value-2;n<=channel.value+2;n++){
    const f=anchor.value+n*spacing.value/1000;
    if(f>0)rows.push([String(n),fmt(f,6),fmt(C_NM_THZ/f,6)]);
  }
  return {ok:true,values:{frequencyTHz:frequency,wavelengthNm:wavelength,frequencyGHz:frequency*1000},display:{frequencyTHz:fmt(frequency,6),wavelengthNm:fmt(wavelength,6),frequencyGHz:fmt(frequency*1000,3)},table:rows};
}
return {calculate,constants:{c:299792458,anchorTHz:193.1}};
});
