(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.PoeBudgetEngine=api})(typeof self!=="undefined"?self:this,function(){
 "use strict";
 const STANDARDS={
  af:{label:"IEEE 802.3af (PoE)",pse:15.4,pd:12.95},
  at:{label:"IEEE 802.3at (PoE+)",pse:30,pd:25.5},
  bt3:{label:"IEEE 802.3bt Type 3 (PoE++)",pse:60,pd:51},
  bt4:{label:"IEEE 802.3bt Type 4 (PoE++)",pse:90,pd:71}
 };
 const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,n(v)));
 function recommendedStandard(watts){
  const w=Math.max(0,n(watts));
  return Object.entries(STANDARDS).find(([,s])=>w<=s.pd)?.[0]||"unsupported";
 }
 function calculate(input){
  const budget=Math.max(0,n(input.switchBudget));
  const ports=Math.max(1,Math.floor(n(input.switchPorts,1)));
  const count=Math.max(1,Math.floor(n(input.deviceCount,1)));
  const deviceWatts=Math.max(0,n(input.deviceWatts));
  const cableLoss=clamp(input.cableLossPercent,0,40)/100;
  const headroom=clamp(input.headroomPercent,0,80)/100;
  const standard=STANDARDS[input.standard]||STANDARDS.at;
  const sourcePerDevice=deviceWatts/(1-cableLoss);
  const loadWatts=sourcePerDevice*count;
  const requiredBudget=loadWatts*(1+headroom);
  const remaining=budget-requiredBudget;
  const utilization=budget?requiredBudget/budget*100:Infinity;
  const maxByBudget=sourcePerDevice>0?Math.floor(budget/((1+headroom)*sourcePerDevice)):0;
  const maxDevices=Math.max(0,Math.min(ports,maxByBudget));
  const portPass=count<=ports;
  const budgetPass=requiredBudget<=budget;
  const standardPass=deviceWatts<=standard.pd;
  const status=portPass&&budgetPass&&standardPass?(utilization<=80?"pass":"warning"):"fail";
  return{
   budget,ports,count,deviceWatts,cableLossPercent:cableLoss*100,headroomPercent:headroom*100,
   sourcePerDevice,loadWatts,requiredBudget,remaining,utilization,maxByBudget,maxDevices,
   portPass,budgetPass,standardPass,status,standard,inputStandard:input.standard,
   recommended:recommendedStandard(deviceWatts)
  };
 }
 return{STANDARDS,recommendedStandard,calculate};
});
