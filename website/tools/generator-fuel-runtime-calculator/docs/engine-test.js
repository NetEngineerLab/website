const assert=require('assert');const E=require('../js/engine.js');
const base={ratedKW:30,fuel0:1.5,fuel25:2.5,fuel50:4.2,fuel75:5.8,fuel100:7.4,segments:[{name:'day',loadKW:18,hours:12},{name:'night',loadKW:12,hours:12}],tankLiters:120,reservePct:10,targetHours:24,fuelPrice:1.2,generatorCount:1,batteryUsableKWh:0};
let r=E.calculate(base);assert(r.ok);assert(Math.abs(r.profile[0].fuelLph-4.84)<0.02);assert(r.avgFuelLph>4&&r.avgFuelLph<5);assert(r.runtimeHours>20);assert(r.targetFuelWithReserve>r.rawTargetFuel);assert(r.specificFuel>0);
assert(Math.abs(E.interpolate([[0,1],[25,2],[50,4],[75,6],[100,8]],37.5)-3)<1e-9);
r=E.calculate({...base,segments:[{name:'bad',loadKW:35,hours:24}]});assert(r.ok&&r.warnings.includes('overload'));
r=E.calculate({...base,segments:[{name:'a',loadKW:10,hours:20},{name:'b',loadKW:10,hours:10}]});assert(!r.ok&&r.errors.includes('profileHours'));
r=E.calculate({...base,batteryUsableKWh:15,batteryDischargeEfficiencyPct:90});assert(r.batteryAssistHours>0&&r.fuelAfterBattery<r.rawTargetFuel);
r=E.calculate({...base,targetHours:72,tankLiters:40});assert(r.refills>=1);
console.log('Generator fuel engine: PASS');