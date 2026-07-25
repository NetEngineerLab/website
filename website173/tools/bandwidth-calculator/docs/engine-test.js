const lib=require("../data/bandwidth-units.js");
const e=require("../js/engine.js");
function close(name,actual,expected,tol=1e-6){if(Math.abs(actual-expected)>tol){console.error(name,actual,expected);process.exit(1)}}
function equal(name,actual,expected){if(String(actual)!==String(expected)){console.error(name,actual,expected);process.exit(1)}}
let transfer=e.transferTime({fileSize:1,fileUnit:"GB",linkRate:100,rateUnit:"Mbps",efficiencyPercent:100,utilizationPercent:100,concurrentTransfers:1,rttMs:0,setupRtts:0},lib);
close("1GB/100Mbps",transfer.totalSeconds,80);
transfer=e.transferTime({fileSize:1,fileUnit:"GiB",linkRate:1,rateUnit:"Gbps",efficiencyPercent:80,utilizationPercent:100,concurrentTransfers:1,rttMs:0,setupRtts:0},lib);
close("1GiB/1Gbps@80%",transfer.totalSeconds,10.73741824,1e-8);
const required=e.requiredBandwidth({fileSize:10,fileUnit:"GB",targetTime:10,timeUnit:"minute",efficiencyPercent:80,utilizationPercent:90,concurrentTransfers:1,rttMs:0,setupRtts:0},lib);
close("required",required.requiredLinkBps,185185185.1851852,1e-3);
const capacity=e.concurrentCapacity({linkRate:1,rateUnit:"Gbps",perUserRate:5,perUserRateUnit:"Mbps",efficiencyPercent:95,utilizationPercent:90,burstFactorPercent:100,targetUsers:100},lib);
equal("users",capacity.maxUsers,171);equal("target pass",capacity.targetPass,true);
const volume=e.dataVolume({linkRate:100,rateUnit:"Mbps",duration:1,timeUnit:"hour",efficiencyPercent:95,utilizationPercent:90},lib);
close("volume",volume.totalBytes,38475000000,1e-3);
console.log(JSON.stringify({status:"PASS",transferSeconds:80,requiredMbps:required.requiredLinkBps/1e6,users:capacity.maxUsers,volumeGB:volume.totalBytes/1e9},null,2));