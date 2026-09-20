const assert=require('assert');const E=require('../js/engine.js');
const base={ratedKW:30,fuel0:1.5,fuel25:2.5,fuel50:4.2,fuel75:5.8,fuel100:7.4,segments:[{name:'day',loadKW:18,hours:12},{name:'night',loadKW:12,hours:12}],tankLiters:120,reservePct:10,targetHours:24,fuelPrice:1.2,generatorCount:1,batteryUsableKWh:0};
let r=E.calculate(base);assert(r.ok);assert(Math.abs(r.profile[0].fuelLph-4.84)<0.02);assert(r.avgFuelLph>4&&r.avgFuelLph<5);assert(r.runtimeHours>20);assert(r.targetFuelWithReserve>r.rawTargetFuel);assert(r.specificFuel>0);
assert(Math.abs(E.interpolate([[0,1],[25,2],[50,4],[75,6],[100,8]],37.5)-3)<1e-9);
r=E.calculate({...base,segments:[{name:'bad',loadKW:35,hours:24}]});assert(r.ok&&r.warnings.includes('overload'));
r=E.calculate({...base,segments:[{name:'a',loadKW:10,hours:20},{name:'b',loadKW:10,hours:10}]});assert(!r.ok&&r.errors.includes('profileHours'));
r=E.calculate({...base,batteryUsableKWh:15,batteryDischargeEfficiencyPct:90});assert(r.batteryAssistHours>0&&r.fuelAfterBattery<r.rawTargetFuel);
r=E.calculate({...base,targetHours:72,tankLiters:40});assert(r.refills>=1);
// Engineering maturity gates: scenarios, environmental derating, N-1, wet-stack and export contracts.
r=E.calculate({...base,generatorCount:2,redundantGen:1,ambientTempC:45,altitudeM:2500,segments:[{loadKW:28,hours:24}]});assert(r.ok&&r.scenarios.length===4);assert(r.environment.totalDeratePct>0);assert(r.nMinus1Capacity>0&&r.nMinus1Pass===false);assert(r.risk&&r.wetStackRisk);assert(E.toJSONReport(r).includes('generator-fuel-report/1.0.0'));assert(E.toCSV(r).includes('nMinus1Pass'));
r=E.calculate({...base,segments:[{loadKW:5,hours:8},{loadKW:18,hours:16}],wetStackHoursThreshold:4});assert(r.wetStackRisk==='high');
const before={...base,generatorCount:1},after={...base,generatorCount:2,redundantGen:1};const delta=E.compareBeforeAfter(before,after);assert(delta.ok&&Object.hasOwn(delta,'delta'));
console.log('Generator fuel engine: PASS');
