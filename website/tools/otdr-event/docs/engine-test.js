const rules=require("../data/otdr-event-rules.js");
const engine=require("../js/engine.js");
const events=[
 {distanceKm:0.150,lossPrimaryDb:0.12,lossSecondaryDb:0.14,reflectanceDb:-50,cumulativeLossDb:0.12,manualType:"auto"},
 {distanceKm:2.400,lossPrimaryDb:0.25,lossSecondaryDb:0.68,reflectanceDb:-55,cumulativeLossDb:0.37,manualType:"auto"},
 {distanceKm:5.600,lossPrimaryDb:0.45,lossSecondaryDb:0.48,reflectanceDb:-32,cumulativeLossDb:0.82,manualType:"auto"},
 {distanceKm:8.200,lossPrimaryDb:1.20,lossSecondaryDb:1.35,reflectanceDb:-48,cumulativeLossDb:2.02,manualType:"auto"},
 {distanceKm:10.000,lossPrimaryDb:4.50,lossSecondaryDb:4.70,reflectanceDb:-20,cumulativeLossDb:6.52,manualType:"auto"}
];
const result=engine.analyzeEvents(events,{
 rules,linkLengthKm:10,primaryAttenuationDbPerKm:.35,secondaryAttenuationDbPerKm:.22,ior:1.468
});
const expected=["splice","bend","connector","splice","end"];
const actual=result.events.map(e=>e.detectedType);
if(JSON.stringify(actual)!==JSON.stringify(expected)){
 console.error("Unexpected event types",actual);process.exit(1);
}
if(result.summary.eventCount!==5||result.summary.criticalCount!==2||result.summary.abnormalCount!==3){
 console.error("Unexpected summary",result.summary);process.exit(1);
}
const options={rules,linkLengthKm:10,primaryAttenuationDbPerKm:.35,secondaryAttenuationDbPerKm:.22,ior:1.468};
if(engine.analyzeEvents(events,options).ok!==true)process.exit(1);
for(const bad of [
 [[],options],
 [events,{...options,linkLengthKm:0.099}],
 [events,{...options,primaryAttenuationDbPerKm:0}],
 [[{...events[0],distanceKm:NaN}],options],
 [[{...events[0],manualType:"unsupported"}],options],
 [[{...events[0],manualType:false}],options],
 [[{...events[0],reflectanceDb:1}],options],
 [events,{...options,rules:{...rules,thresholds:{normalSpliceLossDb:2}}}],
 [events,{...options,rules:{...rules,eventTypes:"auto"}}],
 [events,{...options,rules:{...rules,thresholds:{...rules.thresholds,normalSpliceLossDb:2,attentionLossDb:.5,criticalLossDb:.1}}}],
 [events,{...options,rules:{...rules,eventTypes:["evil"]}}],
 [events,{...options,rules:{...rules,thresholds:{...rules.thresholds,normalSpliceLossDb:-3,attentionLossDb:-2,criticalLossDb:-1,bendDeltaDb:-1,endLossDb:-1,eventDeadZoneM:-2,attenuationDeadZoneM:-1,ghostDistanceToleranceM:-1,nearEndToleranceM:-1}}}],
 [events,{...options,linkLengthKm:1e308,primaryAttenuationDbPerKm:1e308}]
 ,[[{distanceKm:0,lossPrimaryDb:.1,manualType:"auto"},{distanceKm:1e308,lossPrimaryDb:.1,manualType:"auto"}],options]
])if(engine.analyzeEvents(...bad).ok!==false)process.exit(1);
console.log(JSON.stringify({types:actual,summary:result.summary},null,2));
