(function(root,factory){
 const engine=factory();
 if(typeof module==="object"&&module.exports)module.exports=engine;
 else root.SubnetEngine=engine;
})(typeof self!=="undefined"?self:this,function(){
 const finite=v=>Number.isFinite(Number(v));
 const number=(v,fallback=0)=>finite(v)?Number(v):fallback;

 function parseIPv4(value){
  const parts=String(value||"").trim().split(".");
  if(parts.length!==4)return null;
  const octets=parts.map(part=>{
   if(!/^\d{1,3}$/.test(part))return NaN;
   const n=Number(part);
   return n>=0&&n<=255?n:NaN;
  });
  if(octets.some(n=>!Number.isInteger(n)))return null;
  return (((octets[0]<<24)>>>0)|((octets[1]<<16)>>>0)|((octets[2]<<8)>>>0)|octets[3])>>>0;
 }
 function formatIPv4(value){
  const n=Number(value)>>>0;
  return [n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
 }
 function maskFromPrefix(prefix){
  const p=Math.max(0,Math.min(32,Math.floor(number(prefix))));
  return p===0?0:(0xffffffff<<(32-p))>>>0;
 }
 function prefixFromMask(maskValue){
  const mask=typeof maskValue==="string"?parseIPv4(maskValue):Number(maskValue)>>>0;
  if(mask===null)return null;
  let seenZero=false,count=0;
  for(let i=31;i>=0;i--){
   const bit=(mask>>>i)&1;
   if(bit===1){
    if(seenZero)return null;
    count++;
   }else seenZero=true;
  }
  return count;
 }
 function wildcardFromPrefix(prefix){return (~maskFromPrefix(prefix))>>>0}
 function binaryIPv4(value){
  const n=Number(value)>>>0;
  return [24,16,8,0].map(shift=>((n>>>shift)&255).toString(2).padStart(8,"0")).join(".");
 }
 function totalAddresses(prefix){
  const p=Math.max(0,Math.min(32,Math.floor(number(prefix))));
  return 2**(32-p);
 }
 function usableHosts(prefix){
  const p=Math.max(0,Math.min(32,Math.floor(number(prefix))));
  if(p===32)return 1;
  if(p===31)return 2;
  return Math.max(0,totalAddresses(p)-2);
 }
 function scopeIPv4(ip,reference){
  const value=typeof ip==="string"?parseIPv4(ip):Number(ip)>>>0;
  if(value===null)return {type:"invalid"};
  for(const item of reference.ipv4Scopes||[]){
   const [networkText,prefixText]=item.cidr.split("/");
   const network=parseIPv4(networkText),prefix=Number(prefixText),mask=maskFromPrefix(prefix);
   if((value&mask)===network)return item;
  }
  return {type:"public",zh:"公网地址",en:"Public"};
 }
 function reverseZone(network,prefix){
  if(prefix%8!==0||prefix>24)return null;
  const octets=formatIPv4(network).split(".");
  const count=prefix/8;
  return octets.slice(0,count).reverse().join(".")+".in-addr.arpa";
 }
 function analyzeIPv4(ipText,prefixInput,reference){
  const ip=parseIPv4(ipText);
  if(ip===null)throw new Error("invalid_ipv4");
  let prefix;
  if(typeof prefixInput==="string"&&prefixInput.includes(".")){
   prefix=prefixFromMask(prefixInput);
   if(prefix===null)throw new Error("invalid_mask");
  }else{
   prefix=Math.floor(number(prefixInput,-1));
   if(prefix<0||prefix>32)throw new Error("invalid_prefix");
  }
  const mask=maskFromPrefix(prefix);
  const wildcard=wildcardFromPrefix(prefix);
  const network=(ip&mask)>>>0;
  const broadcast=(network|wildcard)>>>0;
  const total=totalAddresses(prefix);
  const usable=usableHosts(prefix);
  let first,last;
  if(prefix===32){first=last=network}
  else if(prefix===31){first=network;last=broadcast}
  else{first=(network+1)>>>0;last=(broadcast-1)>>>0}
  const blockSize=prefix===0?4294967296:(wildcard+1);
  const previous=network>=blockSize?(network-blockSize)>>>0:null;
  const next=broadcast<0xffffffff?(broadcast+1)>>>0:null;
  return {
   ip:formatIPv4(ip),prefix,mask:formatIPv4(mask),wildcard:formatIPv4(wildcard),
   network:formatIPv4(network),broadcast:formatIPv4(broadcast),
   firstHost:formatIPv4(first),lastHost:formatIPv4(last),
   totalAddresses:total,usableHosts:usable,blockSize,
   previousNetwork:previous===null?null:formatIPv4(previous),
   nextNetwork:next===null?null:formatIPv4(next),
   cidr:`${formatIPv4(network)}/${prefix}`,
   scope:scopeIPv4(ip,reference),
   reverseZone:reverseZone(network,prefix),
   binary:{
    ip:binaryIPv4(ip),mask:binaryIPv4(mask),network:binaryIPv4(network),broadcast:binaryIPv4(broadcast)
   }
  };
 }

 function requiredPrefixForHosts(hosts,reserve=0){
  const requested=Math.max(0,Math.ceil(number(hosts)));
  const reserved=Math.max(0,Math.ceil(number(reserve)));
  const needed=requested+reserved;
  if(needed<=1)return 32;
  if(needed<=2)return 31;
  let hostBits=2;
  while((2**hostBits)-2<needed&&hostBits<32)hostBits++;
  return 32-hostBits;
 }
 function alignNetwork(value,prefix){
  return (Number(value)>>>0)&maskFromPrefix(prefix);
 }
 function nextAligned(value,prefix){
  const size=totalAddresses(prefix);
  const n=Number(value);
  return Math.ceil(n/size)*size;
 }
 function planVlsm(baseIpText,basePrefixInput,requests,reservePerSubnet=0,reference){
  const base=analyzeIPv4(baseIpText,basePrefixInput,reference);
  const baseStart=parseIPv4(base.network);
  const baseEnd=parseIPv4(base.broadcast);
  const normalized=(requests||[]).map((item,index)=>({
   inputIndex:index,
   name:String(item.name||`Subnet ${index+1}`),
   hosts:Math.max(0,Math.ceil(number(item.hosts))),
   reserve:Math.max(0,Math.ceil(number(item.reserve,reservePerSubnet)))
  })).filter(item=>item.hosts>=0);
  normalized.forEach(item=>{
   item.prefix=requiredPrefixForHosts(item.hosts,item.reserve);
   item.total=totalAddresses(item.prefix);
   item.usable=usableHosts(item.prefix);
  });
  normalized.sort((a,b)=>a.prefix-b.prefix||b.hosts-a.hosts||a.inputIndex-b.inputIndex);
  let cursor=baseStart;
  const allocations=[];
  const errors=[];
  for(const item of normalized){
   const start=nextAligned(cursor,item.prefix);
   const size=totalAddresses(item.prefix);
   const end=start+size-1;
   if(start>0xffffffff||end>baseEnd){
    errors.push({name:item.name,code:"insufficient_space",requiredPrefix:item.prefix});
    continue;
   }
   const result=analyzeIPv4(formatIPv4(start),item.prefix,reference);
   allocations.push({...item,...result,startValue:start,endValue:end});
   cursor=end+1;
  }
  const used=allocations.reduce((sum,item)=>sum+item.totalAddresses,0);
  return {
   base,
   allocations,
   errors,
   usedAddresses:used,
   remainingAddresses:Math.max(0,base.totalAddresses-used),
   utilizationPercent:base.totalAddresses?Number((used/base.totalAddresses*100).toFixed(2)):0
  };
 }

 function expandIPv6(address){
  let input=String(address||"").trim().toLowerCase();
  if(!input)return null;
  if(input.includes("."))return null;
  if((input.match(/::/g)||[]).length>1)return null;
  let parts;
  if(input.includes("::")){
   const [left,right]=input.split("::");
   const l=left?left.split(":"):[];
   const r=right?right.split(":"):[];
   const missing=8-l.length-r.length;
   if(missing<1)return null;
   parts=[...l,...Array(missing).fill("0"),...r];
  }else{
   parts=input.split(":");
   if(parts.length!==8)return null;
  }
  if(parts.length!==8||parts.some(part=>!/^[0-9a-f]{1,4}$/.test(part)))return null;
  return parts.map(part=>part.padStart(4,"0"));
 }
 function ipv6ToBigInt(address){
  const groups=expandIPv6(address);
  if(!groups)return null;
  return groups.reduce((value,group)=>(value<<16n)+BigInt(parseInt(group,16)),0n);
 }
 function bigIntToIPv6(value){
  let v=BigInt(value);
  const groups=[];
  for(let i=0;i<8;i++){
   groups.unshift(Number(v&0xffffn).toString(16));
   v>>=16n;
  }
  let bestStart=-1,bestLength=0,currentStart=-1,currentLength=0;
  groups.forEach((group,index)=>{
   if(group==="0"){
    if(currentStart===-1){currentStart=index;currentLength=1}else currentLength++;
    if(currentLength>bestLength){bestStart=currentStart;bestLength=currentLength}
   }else{currentStart=-1;currentLength=0}
  });
  if(bestLength<2)return groups.join(":");
  const before=groups.slice(0,bestStart).join(":");
  const after=groups.slice(bestStart+bestLength).join(":");
  if(!before&&!after)return "::";
  if(!before)return `::${after}`;
  if(!after)return `${before}::`;
  return `${before}::${after}`;
 }
 function analyzeIPv6(address,prefixInput,basePrefixInput=0){
  const value=ipv6ToBigInt(address);
  if(value===null)throw new Error("invalid_ipv6");
  const prefix=Math.floor(number(prefixInput,-1));
  const basePrefix=Math.floor(number(basePrefixInput,0));
  if(prefix<0||prefix>128||basePrefix<0||basePrefix>prefix)throw new Error("invalid_ipv6_prefix");
  const hostBits=128-prefix;
  const mask=prefix===0?0n:((1n<<BigInt(prefix))-1n)<<BigInt(hostBits);
  const network=value&mask;
  const last=network+((1n<<BigInt(hostBits))-1n);
  const addressCount=1n<<BigInt(hostBits);
  const subnetCount=1n<<BigInt(prefix-basePrefix);
  const linkLocal=(value>>118n)===0b1111111010n;
  const multicast=(value>>120n)===0xffn;
  const uniqueLocal=(value>>121n)===0b1111110n;
  let scope="global";
  if(value===0n)scope="unspecified";
  else if(value===1n)scope="loopback";
  else if(linkLocal)scope="linklocal";
  else if(multicast)scope="multicast";
  else if(uniqueLocal)scope="unique_local";
  return {
   address:bigIntToIPv6(value),prefix,basePrefix,
   network:bigIntToIPv6(network),lastAddress:bigIntToIPv6(last),
   cidr:`${bigIntToIPv6(network)}/${prefix}`,
   totalAddresses:addressCount.toString(),
   subnetCountFromBase:subnetCount.toString(),
   hostBits,scope
  };
 }
 return {
  parseIPv4,formatIPv4,maskFromPrefix,prefixFromMask,wildcardFromPrefix,
  binaryIPv4,totalAddresses,usableHosts,scopeIPv4,analyzeIPv4,
  requiredPrefixForHosts,planVlsm,expandIPv6,ipv6ToBigInt,bigIntToIPv6,analyzeIPv6
 };
});