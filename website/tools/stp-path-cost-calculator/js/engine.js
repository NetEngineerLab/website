(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELStpPathCostEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  // Long (32-bit) method, IEEE 802.1D-2004 / 802.1Q: cost = 20,000,000,000 / speed in kb/s, limited to 1..200,000,000.
  // Short (16-bit) method, IEEE 802.1D-1998 recommended values.
  const SHORT={4:250,10:100,16:62,100:19,1000:4,10000:2};
  function longCost(mbps){
    const c=Math.round(2e10/(mbps*1000));
    return Math.min(200000000,Math.max(1,c));
  }
  function parseList(text){
    if(typeof text!=="string")return null;
    const parts=text.split(/[\s,;]+/).filter(Boolean);
    if(!parts.length||parts.length>32)return null;
    const nums=parts.map(Number);
    return nums.every(n=>Number.isFinite(n)&&n>0&&n<=1.6e6)?nums:null;
  }
  function costFor(mbps,method){
    if(method==="long")return longCost(mbps);
    return Object.prototype.hasOwnProperty.call(SHORT,mbps)?SHORT[mbps]:null;
  }
  function validate(v){
    return !!v&&typeof v==="object"&&(v.method==="long"||v.method==="short")&&!!parseList(v.pathA)&&!!parseList(v.pathB);
  }
  function calculate(v){
    if(!validate(v))return{ok:false,error:"invalid-input"};
    const a=parseList(v.pathA),b=parseList(v.pathB);
    const ca=a.map(s=>costFor(s,v.method)),cb=b.map(s=>costFor(s,v.method));
    if(ca.includes(null)||cb.includes(null))return{ok:false,error:"short-undefined"};
    const ta=ca.reduce((x,y)=>x+y,0),tb=cb.reduce((x,y)=>x+y,0);
    const winner=ta<tb?"A":tb<ta?"B":"tie";
    const fmt=(n)=>n.toLocaleString("en-US");
    return{ok:true,costsA:ca,costsB:cb,totalA:ta,totalB:tb,winner,status:winner==="tie"?"warning":"healthy",
      display:{
        totalA:fmt(ta),totalB:fmt(tb),
        costsA:ca.map(fmt).join(" + "),costsB:cb.map(fmt).join(" + "),
        difference:fmt(Math.abs(ta-tb))
      }};
  }
  return{SHORT,longCost,parseList,costFor,validate,calculate};
});
