'use strict';const assert=require('assert');const E=require('../js/engine.js');
let r=E.calculate({rackCount:12,avgRackKW:8,headroomPct:15,supplyTempC:20,returnTempC:32,bypassPct:10,recirculationPct:5,unitAirflowM3h:18000,unitSensibleKW:60,redundancyUnits:1});
assert(r.ok);assert(r.itKW===96);assert(r.designKW>110&&r.designKW<111);assert(r.requiredSupplyAirflowM3h>30000);assert(r.recommendedUnits===3);assert(r.survivesOne);assert(r.containmentIndexPct>85&&r.containmentIndexPct<86);
r=E.calculate({rackCount:20,avgRackKW:10,headroomPct:20,supplyTempC:20,returnTempC:30,bypassPct:30,recirculationPct:20,unitAirflowM3h:12000,unitSensibleKW:50,redundancyUnits:1,installedUnits:4,inletLimitC:21});assert(r.ok);assert(r.risk==='high');assert(r.warnings.includes('airflowDeficit')||r.warnings.includes('coolingDeficit'));assert(r.warnings.includes('inletTemperature'));
r=E.calculate({rackCount:10,avgRackKW:0,supplyTempC:25,returnTempC:20,unitAirflowM3h:10000,unitSensibleKW:30});assert(!r.ok);
console.log('Data Center Airflow / Containment engine: PASS');
