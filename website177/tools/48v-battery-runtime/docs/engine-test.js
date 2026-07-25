const assert=require("assert");
const engine=require("../js/engine.js");
function base(){return{
 chemistry:"lead-acid",model:"simple",nominalCellV:2,floatCellV:2.23,startCellV:2.1,cutoffCellV:1.9,
 seriesCells:24,parallelStrings:2,capacityAh:300,ratedHours:10,peukertExponent:1,
 baseLoadW:2400,loadMarginPct:0,pathEfficiencyPct:100,dodPct:100,agePct:100,tempPct:100,curvePct:100,targetRuntimeH:10
}}
let r=engine.calculate(base());
assert.equal(r.ok,true);
assert.equal(r.nominalV,48);
assert.equal(r.nameplateAh,600);
assert.equal(r.currentAverageA,50);
assert.equal(r.baseLoadCurrentA,50);
assert.equal(r.designLoadCurrentA,50);
assert.equal(r.runtimeH,12);
assert.equal(r.requiredTotalAh,500);
assert.equal(r.requiredParallelStrings,2);

let p=base();p.model="peukert";p.peukertExponent=1;r=engine.calculate(p);
assert.equal(r.runtimeH,12);

let c=base();c.parallelStrings=1;c.dodPct=80;c.agePct=80;c.tempPct=90;c.curvePct=100;r=engine.calculate(c);
assert(Math.abs(r.runtimeH-3.456)<0.001);

let bad=base();bad.cutoffCellV=2.1;bad.startCellV=2.0;r=engine.calculate(bad);
assert.equal(r.ok,false);
assert(r.errors.includes("voltageWindow"));

console.log("48V battery engine tests: PASS");