(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.NELIPv6NATEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const MASK128=(1n<<128n)-1n;
  const SUPPORTED_NAT64_PREFIXES=[32,40,48,56,64,96];
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const num=(v,fallback=0)=>{const n=Number(v);return Number.isFinite(n)?n:fallback};
  const ceilDiv=(a,b)=>b<=0?0:Math.ceil(a/b);
  const maskBits=n=>n<=0?0n:(1n<<BigInt(n))-1n;

  function parseIPv4(input){
    const text=String(input??"").trim();
    const parts=text.split(".");
    if(parts.length!==4)throw new Error("invalidIPv4");
    let value=0;
    const octets=parts.map(part=>{
      if(!/^\d{1,3}$/.test(part))throw new Error("invalidIPv4");
      const n=Number(part);
      if(n<0||n>255)throw new Error("invalidIPv4");
      value=value*256+n;
      return n;
    });
    return{value:value>>>0,octets,text:octets.join(".")};
  }

  function ipv4ToText(value){
    const v=Number(value)>>>0;
    return[(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255].join(".");
  }

  function classifyIPv4(value){
    const v=Number(value)>>>0;
    const inRange=(start,prefix)=>{
      const bits=32-prefix;
      const size=2**bits;
      return v>=start&&v<start+size;
    };
    const ranges=[
      [0x00000000,8,"this-network"],
      [0x0a000000,8,"private"],
      [0x64400000,10,"shared-cgn"],
      [0x7f000000,8,"loopback"],
      [0xa9fe0000,16,"link-local"],
      [0xac100000,12,"private"],
      [0xc0000000,24,"ietf-protocol"],
      [0xc0000200,24,"documentation"],
      [0xc0a80000,16,"private"],
      [0xc6120000,15,"benchmark"],
      [0xc6336400,24,"documentation"],
      [0xcb007100,24,"documentation"],
      [0xe0000000,4,"multicast"],
      [0xf0000000,4,"reserved"]
    ];
    for(const [start,prefix,type] of ranges)if(inRange(start,prefix))return{type,global:false};
    return{type:"global",global:true};
  }

  function normalizeIPv4Tail(text){
    if(!text.includes("."))return text;
    const lastColon=text.lastIndexOf(":");
    if(lastColon<0)throw new Error("invalidIPv6");
    const v4=parseIPv4(text.slice(lastColon+1)).value;
    const replacement=((v4>>>16)&0xffff).toString(16)+":"+(v4&0xffff).toString(16);
    return text.slice(0,lastColon+1)+replacement;
  }

  function parseIPv6(input){
    let text=String(input??"").trim().toLowerCase();
    if(!text)throw new Error("invalidIPv6");
    const zone=text.indexOf("%");
    if(zone>=0)text=text.slice(0,zone);
    let suppliedPrefix=null;
    if(text.includes("/")){
      const pieces=text.split("/");
      if(pieces.length!==2||!/^\d{1,3}$/.test(pieces[1]))throw new Error("invalidPrefix");
      suppliedPrefix=Number(pieces[1]);
      if(suppliedPrefix<0||suppliedPrefix>128)throw new Error("invalidPrefix");
      text=pieces[0];
    }
    text=normalizeIPv4Tail(text);
    if((text.match(/::/g)||[]).length>1)throw new Error("invalidIPv6");
    let groups=[];
    if(text.includes("::")){
      const [left,right]=text.split("::");
      const l=left?left.split(":"):[];
      const r=right?right.split(":"):[];
      if(l.some(x=>!x)||r.some(x=>!x))throw new Error("invalidIPv6");
      const missing=8-l.length-r.length;
      if(missing<1)throw new Error("invalidIPv6");
      groups=[...l,...Array(missing).fill("0"),...r];
    }else{
      groups=text.split(":");
      if(groups.length!==8)throw new Error("invalidIPv6");
    }
    if(groups.length!==8)throw new Error("invalidIPv6");
    let value=0n;
    const nums=groups.map(group=>{
      if(!/^[0-9a-f]{1,4}$/.test(group))throw new Error("invalidIPv6");
      const n=parseInt(group,16);
      value=(value<<16n)|BigInt(n);
      return n;
    });
    return{value,groups:nums,suppliedPrefix,expanded:nums.map(n=>n.toString(16).padStart(4,"0")).join(":"),canonical:compressIPv6Groups(nums)};
  }

  function compressIPv6Groups(groups){
    const clean=groups.map(n=>Number(n).toString(16));
    let bestStart=-1,bestLen=0;
    for(let i=0;i<8;){
      if(Number(groups[i])!==0){i++;continue}
      let j=i;
      while(j<8&&Number(groups[j])===0)j++;
      const len=j-i;
      if(len>=2&&len>bestLen){bestStart=i;bestLen=len}
      i=j;
    }
    if(bestStart<0)return clean.join(":");
    const left=clean.slice(0,bestStart).join(":");
    const right=clean.slice(bestStart+bestLen).join(":");
    if(!left&&!right)return"::";
    if(!left)return"::"+right;
    if(!right)return left+"::";
    return left+"::"+right;
  }

  function bigintToIPv6(value){
    let v=BigInt(value)&MASK128;
    const groups=new Array(8);
    for(let i=7;i>=0;i--){groups[i]=Number(v&0xffffn);v>>=16n}
    return{groups,expanded:groups.map(n=>n.toString(16).padStart(4,"0")).join(":"),canonical:compressIPv6Groups(groups)};
  }

  function prefixMask(prefix){
    const p=Number(prefix);
    if(p<=0)return 0n;
    if(p>=128)return MASK128;
    return(MASK128<<BigInt(128-p))&MASK128;
  }

  function networkOf(value,prefix){return BigInt(value)&prefixMask(prefix)}
  function lastOf(value,prefix){return networkOf(value,prefix)|(MASK128^prefixMask(prefix))}

  function classifyIPv6(value){
    const v=BigInt(value);
    const match=(prefixVal,prefix)=>networkOf(v,prefix)===networkOf(prefixVal,prefix);
    if(v===0n)return"unspecified";
    if(v===1n)return"loopback";
    if(match(parseIPv6("ff00::").value,8))return"multicast";
    if(match(parseIPv6("fe80::").value,10))return"link-local";
    if(match(parseIPv6("fc00::").value,7))return"unique-local";
    if(match(parseIPv6("2001:db8::").value,32))return"documentation";
    if(match(parseIPv6("::ffff:0:0").value,96))return"ipv4-mapped";
    if(match(parseIPv6("64:ff9b::").value,96))return"nat64-wkp";
    if(match(parseIPv6("64:ff9b:1::").value,48))return"nat64-local-use";
    if(match(parseIPv6("2000::").value,3))return"global-unicast";
    return"other";
  }

  function planIPv6(input){
    try{
      const parsed=parseIPv6(input.address);
      const parentPrefix=Number(input.parentPrefix??parsed.suppliedPrefix??48);
      const childPrefix=Number(input.childPrefix??64);
      if(parentPrefix<0||parentPrefix>128||childPrefix<parentPrefix||childPrefix>128)throw new Error("invalidPrefix");
      const parentNetwork=networkOf(parsed.value,parentPrefix);
      const parentLast=lastOf(parsed.value,parentPrefix);
      const childSize=1n<<BigInt(128-childPrefix);
      const childCount=1n<<BigInt(childPrefix-parentPrefix);
      const addressCount=1n<<BigInt(128-childPrefix);
      const containingIndex=(parsed.value-parentNetwork)/childSize;
      const containingNetwork=parentNetwork+containingIndex*childSize;
      const previewCount=clamp(Math.floor(num(input.previewCount,8)),1,32);
      let startIndex=0n;
      try{startIndex=BigInt(String(input.startIndex??"0").trim()||"0")}catch{throw new Error("invalidIndex")}
      if(startIndex<0n||startIndex>=childCount)throw new Error("invalidIndex");
      const preview=[];
      for(let i=0;i<previewCount;i++){
        const idx=startIndex+BigInt(i);
        if(idx>=childCount)break;
        const net=parentNetwork+idx*childSize;
        preview.push({
          index:idx.toString(),
          cidr:`${bigintToIPv6(net).canonical}/${childPrefix}`,
          first:bigintToIPv6(net).canonical,
          last:bigintToIPv6(net+childSize-1n).canonical
        });
      }
      const previous=containingIndex>0n?`${bigintToIPv6(containingNetwork-childSize).canonical}/${childPrefix}`:null;
      const next=containingIndex+1n<childCount?`${bigintToIPv6(containingNetwork+childSize).canonical}/${childPrefix}`:null;
      return{
        ok:true,
        input:parsed.canonical,
        expanded:parsed.expanded,
        type:classifyIPv6(parsed.value),
        parentPrefix,childPrefix,
        parentNetwork:`${bigintToIPv6(parentNetwork).canonical}/${parentPrefix}`,
        parentFirst:bigintToIPv6(parentNetwork).canonical,
        parentLast:bigintToIPv6(parentLast).canonical,
        childCount:childCount.toString(),
        childCountPower:childPrefix-parentPrefix,
        addressesPerChild:addressCount.toString(),
        addressesPower:128-childPrefix,
        containingIndex:containingIndex.toString(),
        containingCidr:`${bigintToIPv6(containingNetwork).canonical}/${childPrefix}`,
        previous,next,preview
      };
    }catch(error){return{ok:false,error:error.message||"invalidIPv6"}}
  }

  function nat44Capacity(input){
    const publicIps=Math.max(0,Math.floor(num(input.publicIps)));
    const subscribers=Math.max(0,Math.floor(num(input.subscribers)));
    const portStart=Math.floor(num(input.portStart,1024));
    const portEnd=Math.floor(num(input.portEnd,65535));
    const reservePct=clamp(num(input.reservePct,10),0,99.9);
    const allocationPct=clamp(num(input.allocationPct,85),1,100);
    const safetyPct=clamp(num(input.safetyPct,20),0,500);
    const sessionsPerSubscriber=Math.max(0,num(input.sessionsPerSubscriber,300));
    const protocols=(input.tcpEnabled?1:0)+(input.udpEnabled?1:0);
    if(publicIps<1||portStart<0||portEnd>65535||portEnd<portStart||sessionsPerSubscriber<=0||protocols<1)return{ok:false,error:"invalidNAT"};
    const rawPorts=portEnd-portStart+1;
    const usablePerProtocol=Math.floor(rawPorts*(1-reservePct/100)*(allocationPct/100));
    const mappingsPerIp=usablePerProtocol*protocols;
    const totalMappings=publicIps*mappingsPerIp;
    const requiredMappings=Math.ceil(subscribers*sessionsPerSubscriber*(1+safetyPct/100));
    const requiredPublicIps=ceilDiv(requiredMappings,mappingsPerIp);
    const maxSubscribers=Math.floor(totalMappings/(sessionsPerSubscriber*(1+safetyPct/100)));
    const usagePct=totalMappings?requiredMappings/totalMappings*100:Infinity;
    return{
      ok:true,publicIps,subscribers,portStart,portEnd,rawPorts,protocols,
      usablePerProtocol,mappingsPerIp,totalMappings,requiredMappings,
      requiredPublicIps,maxSubscribers,
      sharingRatio:publicIps?subscribers/publicIps:0,
      mappingsPerSubscriber:subscribers?totalMappings/subscribers:0,
      usagePct,
      risk:usagePct>100?"critical":usagePct>80?"high":usagePct>60?"medium":"low"
    };
  }

  function cgnatCapacity(input){
    const subscribers=Math.max(0,Math.floor(num(input.subscribers)));
    const publicIps=Math.max(0,Math.floor(num(input.publicIps)));
    const portStart=Math.floor(num(input.portStart,1024));
    const portEnd=Math.floor(num(input.portEnd,65535));
    const reservePct=clamp(num(input.reservePct,10),0,99.9);
    const allocationPct=clamp(num(input.allocationPct,95),1,100);
    const blockSize=Math.max(1,Math.floor(num(input.blockSize,1024)));
    const activePct=clamp(num(input.activePct,35),0,100);
    const peakSessions=Math.max(0,num(input.peakSessions,250));
    const tcpPct=clamp(num(input.tcpPct,75),0,100);
    const sessionsPerHour=Math.max(0,num(input.sessionsPerHour,120));
    const eventsPerSession=Math.max(0,num(input.eventsPerSession,2));
    const bytesPerEvent=Math.max(0,num(input.bytesPerEvent,180));
    const retentionDays=Math.max(0,num(input.retentionDays,180));
    if(publicIps<1||subscribers<1||portStart<0||portEnd>65535||portEnd<portStart)return{ok:false,error:"invalidCGN"};
    const rawPorts=portEnd-portStart+1;
    const usablePorts=Math.floor(rawPorts*(1-reservePct/100)*(allocationPct/100));
    const blocksPerIp=Math.floor(usablePorts/blockSize);
    if(blocksPerIp<1)return{ok:false,error:"blockTooLarge"};
    const supportedSubscribers=publicIps*blocksPerIp;
    const requiredPublicIps=ceilDiv(subscribers,blocksPerIp);
    const spareSubscribers=supportedSubscribers-subscribers;
    const unusedPortsPerIp=usablePorts-blocksPerIp*blockSize;
    const tcpPeak=Math.ceil(peakSessions*tcpPct/100);
    const udpPeak=Math.ceil(peakSessions*(1-tcpPct/100));
    const blockUsagePct=Math.max(tcpPeak,udpPeak)/blockSize*100;
    const activeSubscribers=Math.ceil(subscribers*activePct/100);
    const activeMappings=Math.ceil(activeSubscribers*peakSessions);
    const dailyEvents=Math.ceil(activeSubscribers*sessionsPerHour*24*eventsPerSession);
    const dailyLogBytes=dailyEvents*bytesPerEvent;
    const retentionBytes=dailyLogBytes*retentionDays;
    const capacityPct=subscribers/supportedSubscribers*100;
    const portRisk=blockUsagePct>100?"critical":blockUsagePct>80?"high":blockUsagePct>60?"medium":"low";
    const subscriberRisk=capacityPct>100?"critical":capacityPct>85?"high":capacityPct>70?"medium":"low";
    return{
      ok:true,subscribers,publicIps,rawPorts,usablePorts,blockSize,blocksPerIp,
      supportedSubscribers,requiredPublicIps,spareSubscribers,unusedPortsPerIp,
      sharingRatio:subscribers/publicIps,capacityPct,
      activeSubscribers,activeMappings,tcpPeak,udpPeak,blockUsagePct,portRisk,subscriberRisk,
      dailyEvents,dailyLogBytes,retentionBytes
    };
  }

  function nat64Embed(prefixInput,ipv4Input){
    try{
      const parsedPrefix=parseIPv6(prefixInput);
      const prefixLength=parsedPrefix.suppliedPrefix;
      if(prefixLength===null||!SUPPORTED_NAT64_PREFIXES.includes(prefixLength))throw new Error("unsupportedNAT64Prefix");
      const prefixNetwork=networkOf(parsedPrefix.value,prefixLength);
      if(prefixLength===96&&Number((prefixNetwork>>56n)&0xffn)!==0)throw new Error("invalidUOctet");
      const ipv4=parseIPv4(ipv4Input);
      const v4=BigInt(ipv4.value);
      let address=prefixNetwork;
      if(prefixLength===96){
        address|=v4;
      }else{
        const firstLen=64-prefixLength;
        const remaining=32-firstLen;
        if(firstLen>0){
          const first=v4>>BigInt(remaining);
          address|=first<<64n;
        }
        if(remaining>0){
          const rest=v4&maskBits(remaining);
          const shift=BigInt(128-(72+remaining));
          address|=rest<<shift;
        }
      }
      const result=bigintToIPv6(address);
      const prefixCanonical=`${bigintToIPv6(prefixNetwork).canonical}/${prefixLength}`;
      const isWkp=prefixLength===96&&prefixNetwork===parseIPv6("64:ff9b::").value;
      const isLocalUse=prefixLength===48&&prefixNetwork===parseIPv6("64:ff9b:1::").value;
      const class4=classifyIPv4(ipv4.value);
      return{
        ok:true,prefix:prefixCanonical,prefixLength,ipv4:ipv4.text,
        ipv4Type:class4.type,ipv4Global:class4.global,
        ipv6:result.canonical,expanded:result.expanded,
        isWkp,isLocalUse,
        wkpNonGlobalWarning:isWkp&&!class4.global
      };
    }catch(error){return{ok:false,error:error.message||"invalidNAT64"}}
  }

  function nat64Extract(prefixInput,ipv6Input){
    try{
      const parsedPrefix=parseIPv6(prefixInput);
      const prefixLength=parsedPrefix.suppliedPrefix;
      if(prefixLength===null||!SUPPORTED_NAT64_PREFIXES.includes(prefixLength))throw new Error("unsupportedNAT64Prefix");
      const prefixNetwork=networkOf(parsedPrefix.value,prefixLength);
      if(prefixLength===96&&Number((prefixNetwork>>56n)&0xffn)!==0)throw new Error("invalidUOctet");
      const address=parseIPv6(ipv6Input).value;
      if(networkOf(address,prefixLength)!==prefixNetwork)throw new Error("prefixMismatch");
      let v4=0n;
      if(prefixLength===96){
        v4=address&0xffffffffn;
      }else{
        const firstLen=64-prefixLength;
        const remaining=32-firstLen;
        let first=0n,rest=0n;
        if(firstLen>0)first=(address>>64n)&maskBits(firstLen);
        if(remaining>0){
          const shift=BigInt(128-(72+remaining));
          rest=(address>>shift)&maskBits(remaining);
        }
        v4=(first<<BigInt(remaining))|rest;
      }
      const ipv4=ipv4ToText(Number(v4));
      return{ok:true,ipv4,ipv4Type:classifyIPv4(Number(v4)).type};
    }catch(error){return{ok:false,error:error.message||"invalidNAT64"}}
  }

  function formatBytes(bytes){
    const n=Number(bytes);
    if(!Number.isFinite(n)||n<0)return"—";
    const units=["B","KB","MB","GB","TB","PB"];
    let v=n,i=0;
    while(v>=1000&&i<units.length-1){v/=1000;i++}
    return`${v.toFixed(v>=100?0:v>=10?1:2)} ${units[i]}`;
  }

  return{
    parseIPv4,ipv4ToText,classifyIPv4,
    parseIPv6,bigintToIPv6,networkOf,lastOf,classifyIPv6,planIPv6,
    nat44Capacity,cgnatCapacity,nat64Embed,nat64Extract,formatBytes,
    SUPPORTED_NAT64_PREFIXES
  };
});