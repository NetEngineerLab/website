const ref=require("../data/ip-reference.js");
const e=require("../js/engine.js");
function assert(name,actual,expected){if(String(actual)!==String(expected)){console.error(name,actual,expected);process.exit(1)}}
let r=e.analyzeIPv4("192.168.10.130",24,ref);
assert("cidr",r.cidr,"192.168.10.0/24");assert("broadcast",r.broadcast,"192.168.10.255");assert("usable",r.usableHosts,254);
r=e.analyzeIPv4("10.0.0.0",31,ref);assert("/31 usable",r.usableHosts,2);assert("/31 first",r.firstHost,"10.0.0.0");assert("/31 last",r.lastHost,"10.0.0.1");
r=e.analyzeIPv4("10.0.0.1","255.255.255.252",ref);assert("mask prefix",r.prefix,30);assert("/30 broadcast",r.broadcast,"10.0.0.3");
const plan=e.planVlsm("10.10.0.0",20,[{name:"A",hosts:500,reserve:10},{name:"B",hosts:200,reserve:10},{name:"C",hosts:50,reserve:5}],0,ref);
assert("vlsm count",plan.allocations.length,3);assert("A cidr",plan.allocations[0].cidr,"10.10.0.0/23");assert("B cidr",plan.allocations[1].cidr,"10.10.2.0/24");assert("C cidr",plan.allocations[2].cidr,"10.10.3.0/26");
const v6=e.analyzeIPv6("2001:db8:1234:5678::1",64,48);assert("ipv6 network",v6.network,"2001:db8:1234:5678::");assert("ipv6 hostbits",v6.hostBits,64);assert("ipv6 subnets",v6.subnetCountFromBase,"65536");
console.log(JSON.stringify({status:"PASS",ipv4:r.cidr,vlsm:plan.allocations.map(x=>x.cidr),ipv6:v6.cidr},null,2));