const assert=require("assert");
const E=require("../js/engine.js");

const p=E.parseIPv6("2001:0db8:0000:0000:0000:ff00:0042:8329");
assert.equal(p.canonical,"2001:db8::ff00:42:8329");
assert.equal(p.expanded,"2001:0db8:0000:0000:0000:ff00:0042:8329");

const plan=E.planIPv6({address:"2001:db8:1200::/48",parentPrefix:48,childPrefix:64,startIndex:"0",previewCount:2});
assert.equal(plan.ok,true);
assert.equal(plan.childCount,"65536");
assert.equal(plan.addressesPerChild,"18446744073709551616");
assert.equal(plan.preview[0].cidr,"2001:db8:1200::/64");
assert.equal(plan.preview[1].cidr,"2001:db8:1200:1::/64");

const n44=E.nat44Capacity({
 publicIps:8,subscribers:1000,portStart:1024,portEnd:65535,
 reservePct:10,allocationPct:85,sessionsPerSubscriber:150,safetyPct:25,
 tcpEnabled:true,udpEnabled:true
});
assert.equal(n44.ok,true);
assert.equal(n44.rawPorts,64512);
assert.equal(n44.protocols,2);
assert(n44.requiredPublicIps>0);

const cgn=E.cgnatCapacity({
 subscribers:20000,publicIps:400,portStart:1024,portEnd:65535,
 reservePct:5,allocationPct:100,blockSize:1024,activePct:35,
 peakSessions:250,tcpPct:75,sessionsPerHour:120,eventsPerSession:2,
 bytesPerEvent:180,retentionDays:180
});
assert.equal(cgn.ok,true);
assert.equal(cgn.blocksPerIp,59);
assert.equal(cgn.supportedSubscribers,23600);
assert.equal(cgn.requiredPublicIps,339);

const cases=[
 ["2001:db8::/32","192.0.2.33","2001:db8:c000:221::"],
 ["2001:db8:100::/40","192.0.2.33","2001:db8:1c0:2:21::"],
 ["2001:db8:122::/48","192.0.2.33","2001:db8:122:c000:2:2100::"],
 ["2001:db8:122:300::/56","192.0.2.33","2001:db8:122:3c0:0:221::"],
 ["2001:db8:122:344::/64","192.0.2.33","2001:db8:122:344:c0:2:2100:0"],
 ["2001:db8:122:344::/96","192.0.2.33","2001:db8:122:344::c000:221"]
];
for(const [prefix,ipv4,expected] of cases){
 const r=E.nat64Embed(prefix,ipv4);
 assert.equal(r.ok,true,`${prefix} embed failed`);
 assert.equal(r.ipv6,expected,`${prefix} ${r.ipv6}`);
 const x=E.nat64Extract(prefix,r.ipv6);
 assert.equal(x.ok,true,`${prefix} extract failed`);
 assert.equal(x.ipv4,ipv4);
}
const wkp=E.nat64Embed("64:ff9b::/96","192.0.2.33");
assert.equal(wkp.ipv6,"64:ff9b::c000:221");
assert.equal(wkp.wkpNonGlobalWarning,true);


const noProto=E.nat44Capacity({
 publicIps:1,subscribers:1,portStart:1024,portEnd:65535,
 reservePct:0,allocationPct:100,sessionsPerSubscriber:1,safetyPct:0,
 tcpEnabled:false,udpEnabled:false
});
assert.equal(noProto.ok,false);

const badU=E.nat64Embed("2001:db8:0:0:1200::/96","192.0.2.33");
assert.equal(badU.ok,false);
assert.equal(badU.error,"invalidUOctet");

console.log(JSON.stringify({
 status:"PASS",
 ipv6:plan.parentNetwork,
 childPrefixes:plan.childCount,
 nat44RequiredIPv4:n44.requiredPublicIps,
 cgnBlocksPerIPv4:cgn.blocksPerIp,
 nat64Cases:cases.length
},null,2));