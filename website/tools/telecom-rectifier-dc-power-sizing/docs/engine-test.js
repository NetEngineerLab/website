const assert=require('assert');const E=require('../js/engine.js');
let r=E.calculate({dcVoltage:53.5,loadCurrentA:180,batteryChargeCurrentA:60,moduleCurrentA:50,redundancyModules:1,headroomPct:15,efficiencyPct:94,acVoltage:230,powerFactor:.95,phase:'1p'});
assert(r.ok&&r.recommendedModules>=7&&r.survives1&&r.scenarios.length===4&&r.riskLevel);
assert(r.scenarios.some(s=>s.name==='recharge-peak')&&r.scenarios.some(s=>s.name==='conservative'));
r=E.calculate({dcVoltage:53.5,loadCurrentA:240,batteryChargeCurrentA:60,moduleCurrentA:50,installedModules:6,redundancyModules:2,headroomPct:10,ambientTempC:45,altitudeM:2000,frameMaxModules:6});
assert(r.ok&&r.risks.includes('N-1-fail')&&r.risks.includes('frame-limit')&&r.deratePct<100);
assert(E.toJSON(r).includes('scenarios')&&E.toCSV(r).includes('scenario'));
console.log('Rectifier sizing deep engine: PASS');
