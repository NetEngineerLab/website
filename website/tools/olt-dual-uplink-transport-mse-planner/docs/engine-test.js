const assert=require('assert');const E=require('../js/engine.js');
let r=E.calculate({oltCount:10,trafficPerOltGbps:5,uplinkRateGbps:10,mode:'load-sharing',channelRateGbps:100,channelUtilLimitPct:80,msePortRateGbps:100,msePortUtilLimitPct:80,reservePct:20,boardPorts:8,mseCount:2,physicalDiversity:true,separateRing:true,separateSystem:true});assert(r.ok&&r.oltPhysicalUplinkPorts===20&&r.diversityPass&&r.channelPass&&r.msePass);assert(r.channelsRequiredPerSide===1&&r.msePortsRequiredPerSide===1);
r=E.calculate({oltCount:20,trafficPerOltGbps:8,uplinkRateGbps:10,channelRateGbps:100,channelUtilLimitPct:80,msePortRateGbps:100,msePortUtilLimitPct:80,reservePct:20,physicalDiversity:false,separateRing:false,separateSystem:false});assert(r.ok&&r.riskScore>=80&&r.warnings.includes('falseDualUplinkRisk'));
r=E.calculate({oltCount:0,trafficPerOltGbps:5});assert(!r.ok);
console.log('OLT dual-uplink transport/MSE engine: PASS');
