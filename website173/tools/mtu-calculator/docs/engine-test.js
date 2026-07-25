const lib=require("../data/mtu-overhead-library.js");
const engine=require("../js/engine.js");
function assert(name,actual,expected){if(actual!==expected){console.error(name,actual,expected);process.exit(1)}}
let r=engine.calculate({underlayMtu:1500,desiredInnerMtu:1492,outerVlanTags:0,strictVlan:false,innerIp:"ipv4",ipExtraBytes:0,tcpOptionsBytes:0,layers:[{bytes:8,count:1}]});
assert("PPPoE effective",r.effectiveInnerMtu,1492);assert("PPPoE MSS",r.advertisedMss,1452);assert("PPPoE ping",r.icmpPayload,1464);
r=engine.calculate({underlayMtu:1500,desiredInnerMtu:1450,outerVlanTags:0,strictVlan:false,innerIp:"ipv4",ipExtraBytes:0,tcpOptionsBytes:0,layers:[{bytes:50,count:1}]});
assert("VXLAN effective",r.effectiveInnerMtu,1450);assert("VXLAN MSS",r.advertisedMss,1410);
r=engine.calculate({underlayMtu:1500,desiredInnerMtu:1500,outerVlanTags:2,strictVlan:true,innerIp:"ipv4",ipExtraBytes:0,tcpOptionsBytes:0,layers:[]});
assert("QinQ strict effective",r.effectiveInnerMtu,1492);assert("QinQ required",r.requiredBaseMtu,1508);assert("QinQ failed",r.status,"failed");
r=engine.calculate({underlayMtu:1500,desiredInnerMtu:1500,outerVlanTags:0,strictVlan:false,innerIp:"ipv6",ipExtraBytes:0,tcpOptionsBytes:0,layers:[]});
assert("IPv6 MSS",r.advertisedMss,1440);assert("IPv6 ping",r.icmpPayload,1452);
console.log(JSON.stringify({status:"PASS",pppoe:{mtu:1492,mss:1452},vxlan:{mtu:1450,mss:1410},ipv6:{mss:1440}},null,2));