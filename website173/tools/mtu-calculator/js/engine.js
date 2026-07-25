(function(root,factory){
 const engine=factory();
 if(typeof module==="object"&&module.exports)module.exports=engine;
 else root.MTUEngine=engine;
})(typeof self!=="undefined"?self:this,function(){
 const finite=v=>Number.isFinite(Number(v));
 const number=(v,fallback=0)=>finite(v)?Number(v):fallback;
 const clampNonNegative=v=>Math.max(0,number(v));
 const round=(v,d=0)=>Number(number(v).toFixed(d));

 function calculate(input){
  const underlayMtu=clampNonNegative(input.underlayMtu);
  const desiredInnerMtu=clampNonNegative(input.desiredInnerMtu);
  const outerVlanTags=Math.max(0,Math.floor(number(input.outerVlanTags)));
  const strictVlan=Boolean(input.strictVlan);
  const vlanBytes=outerVlanTags*4;
  const layers=(input.layers||[]).map(layer=>({
   ...layer,
   bytes:clampNonNegative(layer.bytes),
   count:Math.max(0,Math.floor(number(layer.count,1))),
  })).filter(layer=>layer.count>0&&layer.bytes>=0);
  const totalLayerOverhead=layers.reduce((sum,layer)=>sum+layer.bytes*layer.count,0);
  const outerPacketLimit=Math.max(0,underlayMtu-(strictVlan?vlanBytes:0));
  const effectiveInnerMtu=Math.max(0,outerPacketLimit-totalLayerOverhead);
  const requiredBaseMtu=desiredInnerMtu+totalLayerOverhead+(strictVlan?vlanBytes:0);
  const currentWireFrameBytes=14+vlanBytes+outerPacketLimit+4;
  const requiredWireFrameBytes=14+vlanBytes+desiredInnerMtu+totalLayerOverhead+4;

  const innerIp=input.innerIp==="ipv6"?"ipv6":"ipv4";
  const ipFixed=innerIp==="ipv6"?40:20;
  const ipExtra=clampNonNegative(input.ipExtraBytes);
  const tcpFixed=20;
  const tcpOptions=clampNonNegative(input.tcpOptionsBytes);
  const udpFixed=8;
  const icmpFixed=8;

  const advertisedMss=Math.max(0,effectiveInnerMtu-ipFixed-tcpFixed);
  const actualTcpData=Math.max(0,effectiveInnerMtu-ipFixed-ipExtra-tcpFixed-tcpOptions);
  const udpPayload=Math.max(0,effectiveInnerMtu-ipFixed-ipExtra-udpFixed);
  const icmpPayload=Math.max(0,effectiveInnerMtu-ipFixed-ipExtra-icmpFixed);
  const desiredAdvertisedMss=Math.max(0,desiredInnerMtu-ipFixed-tcpFixed);
  const fragmentationBytes=Math.max(0,desiredInnerMtu-effectiveInnerMtu);
  const headroomBytes=effectiveInnerMtu-desiredInnerMtu;
  const overheadPercent=underlayMtu>0?totalLayerOverhead/underlayMtu*100:0;

  let status="healthy";
  const warnings=[];
  if(effectiveInnerMtu<=ipFixed+8){
   status="failed";
   warnings.push("headers_exceed_mtu");
  }else if(desiredInnerMtu>effectiveInnerMtu){
   status="failed";
   warnings.push("desired_exceeds_effective");
  }
  if(innerIp==="ipv6"&&effectiveInnerMtu<1280){
   status=status==="failed"?"failed":"warning";
   warnings.push("ipv6_below_1280");
  }
  if(innerIp==="ipv4"&&effectiveInnerMtu<576){
   status=status==="failed"?"failed":"warning";
   warnings.push("ipv4_below_576");
  }
  if(headroomBytes>=0&&headroomBytes<40&&status==="healthy"){
   status="warning";
   warnings.push("low_headroom");
  }
  if(totalLayerOverhead===0&&desiredInnerMtu<=effectiveInnerMtu&&status==="healthy"){
   warnings.push("plain_path");
  }

  const windowsPingPayload=icmpPayload;
  const linuxPingPayload=icmpPayload;
  const commands=innerIp==="ipv4" ? {
   windows:`ping -f -l ${windowsPingPayload} DESTINATION`,
   linux:`ping -M do -s ${linuxPingPayload} DESTINATION`
  } : {
   windows:`ping -6 -l ${windowsPingPayload} DESTINATION`,
   linux:`ping -6 -M do -s ${linuxPingPayload} DESTINATION`
  };

  return {
   underlayMtu,desiredInnerMtu,outerVlanTags,strictVlan,vlanBytes,layers,
   totalLayerOverhead:round(totalLayerOverhead),
   outerPacketLimit:round(outerPacketLimit),
   effectiveInnerMtu:round(effectiveInnerMtu),
   requiredBaseMtu:round(requiredBaseMtu),
   currentWireFrameBytes:round(currentWireFrameBytes),
   requiredWireFrameBytes:round(requiredWireFrameBytes),
   innerIp,ipFixed,ipExtra,tcpFixed,tcpOptions,udpFixed,icmpFixed,
   advertisedMss:round(advertisedMss),
   desiredAdvertisedMss:round(desiredAdvertisedMss),
   actualTcpData:round(actualTcpData),
   udpPayload:round(udpPayload),
   icmpPayload:round(icmpPayload),
   fragmentationBytes:round(fragmentationBytes),
   headroomBytes:round(headroomBytes),
   overheadPercent:round(overheadPercent,2),
   status,warnings,commands
  };
 }
 return {calculate,round};
});