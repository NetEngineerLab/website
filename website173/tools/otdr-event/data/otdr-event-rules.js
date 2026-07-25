(function(root,factory){
 const rules=factory();
 if(typeof module==="object"&&module.exports)module.exports=rules;
 else root.NEL_OTDR_RULES=rules;
})(typeof self!=="undefined"?self:this,function(){
 return {
  version:"1.0.0",
  notice:{
   zh:"以下阈值属于可编辑工程默认值，不是所有运营商、厂家和验收场景的统一判定标准。",
   en:"These thresholds are editable engineering defaults, not universal pass/fail criteria for every operator, vendor or acceptance scenario."
  },
  thresholds:{
   normalSpliceLossDb:0.20,
   attentionLossDb:0.50,
   criticalLossDb:1.00,
   strongReflectionDb:-35,
   veryStrongReflectionDb:-25,
   bendDeltaDb:0.30,
   endLossDb:3.00,
   eventDeadZoneM:10,
   attenuationDeadZoneM:50,
   ghostDistanceToleranceM:50,
   nearEndToleranceM:100
  },
  fiberAttenuationDbPerKm:{
   "1310":0.35,
   "1490":0.25,
   "1550":0.22,
   "1625":0.25
  },
  pulseWidthOptionsNs:[5,10,30,50,100,300,500,1000,3000,10000],
  eventTypes:[
   "auto","splice","connector","mechanical","bend","end","ghost","unknown"
  ]
 };
});