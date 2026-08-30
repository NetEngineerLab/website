(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.NetEngineerLabAclIr=api;
})(typeof self!=="undefined"?self:this,function(){
  "use strict";
  const IR_VERSION="1.0.0";
  const actions=new Set(["permit","deny"]);
  const protocols=new Set(["ip","tcp","udp","icmp"]);

  function strictInteger(value,error){
    if(typeof value==="number"){if(Number.isSafeInteger(value))return value;throw new Error(error)}
    if(typeof value==="string"&&/^(?:0|[1-9]\d*)$/.test(value)){
      const parsed=Number(value);if(Number.isSafeInteger(parsed))return parsed;
    }
    throw new Error(error);
  }
  function validateCompatibleIr(ir){
    if(!ir||typeof ir!=="object"||Array.isArray(ir))throw new Error("invalid_ir");
    if(ir.irVersion!==IR_VERSION)throw new Error("incompatible_ir_version");
    if(ir.domain!=="acl")throw new Error("incompatible_ir_domain");
    if(ir.family!=="ipv4")throw new Error("incompatible_ir_family");
    return ir;
  }

  function parseIpv4(value){
    if(typeof value!=="string")return null;
    const parts=value.split(".");
    if(parts.length!==4)return null;
    const octets=parts.map(part=>/^\d{1,3}$/.test(part)?Number(part):NaN);
    if(octets.some(part=>!Number.isInteger(part)||part<0||part>255))return null;
    return octets.reduce((result,part)=>((result<<8)|part)>>>0,0)>>>0;
  }
  function formatIpv4(value){const n=value>>>0;return [n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".")}
  function wildcardToPrefix(value){
    const wildcard=parseIpv4(value);if(wildcard===null)return null;
    const mask=(~wildcard)>>>0;let prefix=0,seenZero=false;
    for(let bit=31;bit>=0;bit--){if((mask>>>bit)&1){if(seenZero)return null;prefix++}else seenZero=true}
    return prefix;
  }
  function prefixToWildcard(prefix){
    if(!Number.isInteger(prefix)||prefix<0||prefix>32)throw new Error("invalid_prefix");
    const mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0;
    return formatIpv4((~mask)>>>0);
  }
  function normalizeEndpoint(endpoint){
    if(!endpoint||typeof endpoint!=="object"||Array.isArray(endpoint)||typeof endpoint.kind!=="string")throw new Error("invalid_endpoint");
    if(endpoint.kind==="any")return Object.freeze({kind:"any"});
    if(endpoint.kind==="host"){
      if(parseIpv4(endpoint.address)===null)throw new Error("invalid_host");
      return Object.freeze({kind:"host",address:formatIpv4(parseIpv4(endpoint.address))});
    }
    if(endpoint.kind==="network"){
      const address=parseIpv4(endpoint.address),prefix=strictInteger(endpoint.prefix,"invalid_network");
      if(address===null||prefix<0||prefix>32)throw new Error("invalid_network");
      const mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0;
      return Object.freeze({kind:"network",address:formatIpv4((address&mask)>>>0),prefix});
    }
    throw new Error("unsupported_endpoint_kind");
  }
  function normalizePort(port){
    if(port===undefined||port===null)return undefined;
    if(typeof port==="string"&&!/^(?:0|[1-9]\d*)$/.test(port))throw new Error("named_ports_not_supported");
    const number=strictInteger(port,"invalid_port");if(number<0||number>65535)throw new Error("invalid_port");return number;
  }
  function normalizeRule(rule,index=0){
    if(!rule||typeof rule!=="object"||Array.isArray(rule)||typeof rule.action!=="string"||typeof rule.protocol!=="string")throw new Error("invalid_rule");
    const action=rule.action.toLowerCase(),protocol=rule.protocol.toLowerCase();
    if(!actions.has(action))throw new Error("invalid_action");
    if(!protocols.has(protocol))throw new Error("unsupported_protocol");
    const sequence=rule.sequence===undefined?10*(index+1):strictInteger(rule.sequence,"invalid_sequence");
    if(sequence<0||sequence>2147483647)throw new Error("invalid_sequence");
    const destinationPort=normalizePort(rule.destinationPort);
    if(destinationPort!==undefined&&!new Set(["tcp","udp"]).has(protocol))throw new Error("port_requires_tcp_or_udp");
    const sourceLine=rule.sourceLine==null?null:strictInteger(rule.sourceLine,"invalid_source_line");
    if(sourceLine!==null&&sourceLine<1)throw new Error("invalid_source_line");
    if(rule.raw!=null&&typeof rule.raw!=="string")throw new Error("invalid_raw");
    if(rule.log!==undefined&&typeof rule.log!=="boolean")throw new Error("invalid_log");
    return Object.freeze({sequence,action,protocol,source:normalizeEndpoint(rule.source),destination:normalizeEndpoint(rule.destination),...(destinationPort===undefined?{}:{destinationPort}),log:rule.log===true,sourceLine,raw:rule.raw==null?null:String(rule.raw)});
  }
  function createIr({name,rules,vendor="neutral",sourceType="parameters"}){
    const input=arguments[0];
    if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("invalid_ir_parameters");
    if(input.irVersion!==undefined||input.domain!==undefined||input.family!==undefined){
      validateCompatibleIr({irVersion:input.irVersion??IR_VERSION,domain:input.domain??"acl",family:input.family??"ipv4"});
    }
    if(typeof name!=="string"||typeof vendor!=="string"||typeof sourceType!=="string")throw new Error("invalid_ir_parameters");
    const cleanName=name.trim();
    if(!/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(cleanName))throw new Error("invalid_acl_name");
    if(!Array.isArray(rules)||rules.length===0)throw new Error("acl_requires_rules");
    const normalized=rules.map(normalizeRule).sort((left,right)=>left.sequence-right.sequence);
    const sequences=new Set();for(const rule of normalized){if(sequences.has(rule.sequence))throw new Error("duplicate_sequence");sequences.add(rule.sequence)}
    return Object.freeze({irVersion:IR_VERSION,domain:"acl",family:"ipv4",name:cleanName,vendor:String(vendor),sourceType:String(sourceType),rules:Object.freeze(normalized)});
  }
  function semanticView(ir){
    validateCompatibleIr(ir);
    const normalized=createIr({...ir,vendor:"neutral",sourceType:"semantic"});
    return {irVersion:normalized.irVersion,domain:normalized.domain,family:normalized.family,name:normalized.name,rules:normalized.rules.map(({sourceLine,raw,...rule})=>rule)};
  }
  return Object.freeze({IR_VERSION,createIr,formatIpv4,parseIpv4,prefixToWildcard,semanticView,strictInteger,validateCompatibleIr,wildcardToPrefix});
});
