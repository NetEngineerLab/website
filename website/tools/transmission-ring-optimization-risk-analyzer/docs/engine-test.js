const assert=require('assert');const E=require('../js/engine.js');
let r=E.calculate({nodeCount:8,linkCapacityGbps:100,maxPlanningUtilPct:80,upgradeFactor:2,demandsText:'1,5,30,critical\n2,6,25,normal\n3,7,20,normal\n4,8,15,normal'});assert(r.ok);assert(r.failureMatrix.length===8);assert(r.worstFailure.maxUtilPct>=r.normal.maxUtilPct);assert(r.optimization.afterWorstUtilPct<=r.optimization.beforeWorstUtilPct+1e-9);
r=E.calculate({nodeCount:4,linkCapacityGbps:10,maxPlanningUtilPct:80,demandsText:'1,3,20,critical'});assert(r.ok&&r.worstFailure.maxUtilPct>100&&r.riskScore>0);
r=E.calculate({nodeCount:2,linkCapacityGbps:100,demandsText:'1,2,10'});assert(!r.ok);
console.log('Transmission ring optimization engine: PASS');
