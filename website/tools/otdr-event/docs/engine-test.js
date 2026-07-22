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
 rules,linkLengthKm:10,primaryAttenuationDbPerKm:.35,secondaryAttenuationDbPerKm:.22
});
const expected=["splice","bend","connector","splice","end"];
const actual=result.events.map(e=>e.detectedType);
if(JSON.stringify(actual)!==JSON.stringify(expected)){
 console.error("Unexpected event types",actual);process.exit(1);
}
if(result.summary.eventCount!==5||result.summary.criticalCount!==2||result.summary.abnormalCount!==3){
 console.error("Unexpected summary",result.summary);process.exit(1);
}
console.log(JSON.stringify({types:actual,summary:result.summary},null,2));
