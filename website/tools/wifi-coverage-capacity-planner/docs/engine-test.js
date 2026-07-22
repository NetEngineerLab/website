const assert=require("assert");
const E=require("../js/engine.js");
const fs=require("fs");
const path=require("path");

assert(Math.abs(E.fsplAtOneMeter(2400)-40.05)<0.1);
assert.equal(E.referencePhyRate("wifi5",80,2,1),866.6);
assert.equal(E.referencePhyRate("wifi6",80,2,1),1201);
assert.equal(E.referencePhyRate("wifi7",320,2,1),5764.8);

assert.equal(E.validateStandardBand("wifi5","5",80).ok,true);
assert.equal(E.validateStandardBand("wifi5","2.4",80).ok,false);
assert.equal(E.validateStandardBand("wifi7","6",320).ok,true);
assert.equal(E.validateStandardBand("wifi7","5",320).ok,false);

const coverage=E.coveragePlan({
 freqMHz:5500,totalAreaM2:5000,floors:5,pathLossExponent:2.7,
 apTxPowerDbm:18,clientTxPowerDbm:15,apAntennaGainDbi:4,clientAntennaGainDbi:0,
 apCableLossDb:0,clientCableLossDb:0,targetRssiClient:-67,targetRssiAp:-67,
 fadeMarginDb:5,maxDesignRadiusM:22,layoutEfficiencyPct:65,overlapPct:15,
 lightWalls:1,lightWallLossDb:3,mediumWalls:0,mediumWallLossDb:5,
 heavyWalls:0,heavyWallLossDb:10,floorPenetrations:0,floorLossDb:15
});
assert.equal(coverage.ok,true);
assert(coverage.uplinkLimited);
assert(coverage.designRadiusM>5&&coverage.designRadiusM<=22);
assert(coverage.coverageApCount>=5);

const capacity=E.capacityPlan({
 standard:"wifi6",band:"5",channelWidth:40,spatialStreams:2,radiosPerAp:1,
 totalUsers:300,activePct:35,perActiveUserMbps:5,
 protocolEfficiencyPct:55,usableAirtimePct:65,clientMixPct:75,
 maxAssociatedUsersPerAp:45,minimumApCount:2,useCustomPhyRate:false,customPhyRateMbps:0
});
assert.equal(capacity.ok,true);
assert.equal(capacity.autoPhyRateMbps,573.6);
assert(capacity.capacityApCount>=7);
assert(capacity.totalDemandMbps===525);

const combined=E.combinedPlan({coverage,capacity});
assert.equal(combined.ok,true);
assert.equal(combined.finalApCount,Math.max(coverage.coverageApCount,capacity.capacityApCount));
assert.equal(combined.apsByFloor.reduce((a,b)=>a+b,0),combined.finalApCount);

const channel=E.channelPlan({
 finalApCount:combined.finalApCount,floors:5,available20MHzChannels:12,channelWidth:40
});
assert.equal(channel.ok,true);
assert.equal(channel.reusableChannels,6);
assert.equal(channel.rows.length,combined.finalApCount);

const wide=E.channelPlan({finalApCount:20,floors:2,available20MHzChannels:24,channelWidth:160});
assert.equal(wide.reusableChannels,3);
assert(wide.risk==="high"||wide.risk==="critical");


const presets=JSON.parse(fs.readFileSync(path.join(__dirname,"../data/presets.json"),"utf8"));
for(const [name,profile] of Object.entries(presets.profiles)){
 const c=E.coveragePlan(profile);
 assert.equal(c.ok,true,`${name} coverage`);
 const q=E.capacityPlan(profile);
 assert.equal(q.ok,true,`${name} capacity`);
 const m=E.combinedPlan({coverage:c,capacity:q});
 assert.equal(m.ok,true,`${name} combined`);
 const ch=E.channelPlan({
  finalApCount:m.finalApCount,
  floors:c.floors,
  available20MHzChannels:profile.available20MHzChannels,
  channelWidth:profile.channelWidth
 });
 assert.equal(ch.ok,true,`${name} channel`);
 assert(m.finalApCount<=200,`${name} preset AP count sanity`);
 assert(ch.rows.length===m.finalApCount,`${name} channel rows`);
}

console.log(JSON.stringify({
 status:"PASS",
 coverageRadiusM:coverage.designRadiusM,
 coverageAps:coverage.coverageApCount,
 capacityAps:capacity.capacityApCount,
 finalAps:combined.finalApCount,
 reusableChannels:channel.reusableChannels
},null,2));