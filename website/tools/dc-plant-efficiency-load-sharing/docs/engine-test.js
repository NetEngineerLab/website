'use strict';const assert=require('assert');const E=require('../js/engine.js');
let r=E.calculate({dcVoltage:53.5,moduleRatedA:50,moduleCurrents:'44,43,41,40,39,33',measuredAcKW:13.2,redundancyModules:1,shareWarnPct:5,shareCriticalPct:10,targetModuleLoadPct:65});
assert(r.ok);assert.strictEqual(r.onlineCount,6);assert(Math.abs(r.totalA-240)<1e-9);assert(r.maxDeviationPct>15);assert(r.underperforming.includes(6));assert(r.survivesRedundancy);assert(r.efficiencyPct>90&&r.efficiencyPct<100);assert.strictEqual(r.recommendedOnline,8);
r=E.calculate({dcVoltage:53.5,moduleRatedA:50,moduleCurrents:'40,40,40,40,40,40',redundancyModules:1});assert(r.ok&&r.health==='healthy'&&r.maxDeviationPct===0);
r=E.calculate({dcVoltage:53.5,moduleRatedA:50,moduleCurrents:'50,50,50,50',redundancyModules:1});assert(r.ok&&!r.survivesRedundancy&&r.warnings.includes('REDUNDANCY_FAIL'));
console.log('DC plant efficiency/load-sharing engine: PASS');
