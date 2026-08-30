(function(root,factory){
  const api=factory(typeof module==="object"&&module.exports?require("./ir-adapter"):root.NetEngineerLabAclIr);
  if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabAclRuleOperators=api;
})(typeof self!=="undefined"?self:this,function(irApi){
  "use strict";
  const checks=new Set(["unrestricted-ip-permit","unrestricted-tcp-permit","unrestricted-udp-permit","telnet-permit","ssh-from-any","snmp-from-any","shadowed-rule","duplicate-rule","deny-only-acl","terminal-deny-not-last","missing-explicit-terminal-deny","terminal-deny-without-log"]);
  const isAny=value=>value?.kind==="any";
  const isBroadPermit=(rule,protocol)=>rule.action==="permit"&&rule.protocol===protocol&&isAny(rule.source)&&isAny(rule.destination);
  const evidence=rule=>({sourceLine:rule.sourceLine,sequence:rule.sequence,action:rule.action,protocol:rule.protocol,source:rule.source,destination:rule.destination,destinationPort:rule.destinationPort??null,log:rule.log});
  const endpointRange=value=>{
    if(isAny(value))return [0,0xffffffff];
    const address=irApi.parseIpv4(value.address);if(address===null)return null;
    const prefix=value.kind==="host"?32:value.prefix,mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0;
    return [(address&mask)>>>0,((address&mask)|(~mask))>>>0];
  };
  const endpointContains=(outer,inner)=>{const a=endpointRange(outer),b=endpointRange(inner);return Boolean(a&&b&&a[0]<=b[0]&&a[1]>=b[1])};
  const protocolContains=(outer,inner)=>outer==="ip"||outer===inner;
  const portContains=(outer,inner)=>outer===undefined||outer===inner;
  const contains=(outer,inner)=>protocolContains(outer.protocol,inner.protocol)&&endpointContains(outer.source,inner.source)&&endpointContains(outer.destination,inner.destination)&&portContains(outer.destinationPort,inner.destinationPort);
  const sameMatch=(a,b)=>a.protocol===b.protocol&&JSON.stringify(a.source)===JSON.stringify(b.source)&&JSON.stringify(a.destination)===JSON.stringify(b.destination)&&a.destinationPort===b.destinationPort;
  const portRange=rule=>rule.destinationPort===undefined?[0,65535]:[rule.destinationPort,rule.destinationPort];
  const overlaps=(a,b)=>a[0]<=b[1]&&b[0]<=a[1];
  const clipped=(range,target)=>[Math.max(range[0],target[0]),Math.min(range[1],target[1])];
  const boundaries=(target,ranges)=>[...new Set([target[0],target[1]+1,...ranges.flatMap(range=>{const value=clipped(range,target);return value[0]<=value[1]?[value[0],value[1]+1]:[]})])].sort((a,b)=>a-b);
  const protocolCanCover=(prior,candidate)=>candidate.protocol==="ip"?prior.protocol==="ip":protocolContains(prior.protocol,candidate.protocol);
  const unionCoverage=(priors,candidate)=>{
    const target=[endpointRange(candidate.source),endpointRange(candidate.destination),portRange(candidate)];if(target.some(range=>!range))return [];
    const candidates=priors.map(rule=>({rule,ranges:[endpointRange(rule.source),endpointRange(rule.destination),portRange(rule)]})).filter(item=>protocolCanCover(item.rule,candidate)&&item.ranges.every((range,axis)=>range&&overlaps(range,target[axis])));
    if(!candidates.length)return [];
    if(contains(candidates[0].rule,candidate))return [candidates[0].rule];
    const axes=target.map((range,axis)=>boundaries(range,candidates.map(item=>item.ranges[axis]))),cellCount=axes.reduce((count,points)=>count*(points.length-1),1);
    if(cellCount>250000)throw new Error(`ACL policy analysis complexity limit exceeded: ${cellCount} cells`);
    const used=new Set();
    for(let sourceIndex=0;sourceIndex<axes[0].length-1;sourceIndex++)for(let destinationIndex=0;destinationIndex<axes[1].length-1;destinationIndex++)for(let portIndex=0;portIndex<axes[2].length-1;portIndex++){
      const point=[axes[0][sourceIndex],axes[1][destinationIndex],axes[2][portIndex]],cover=candidates.find(item=>item.ranges.every((range,axis)=>range[0]<=point[axis]&&range[1]>=point[axis]));
      if(!cover)return [];used.add(cover.rule);
    }
    return [...used];
  };
  const coveringRules=(rules,index,action)=>unionCoverage(rules.slice(0,index).filter(prior=>action===undefined||prior.action===action),rules[index]);
  function rulesAt(facts,path){const rules=path.split(".").reduce((value,key)=>value?.[key],facts);if(!Array.isArray(rules))throw new Error("ACL rules path must resolve to an array");if(!rules.length)return [];return irApi.createIr({name:"RULE-CHECK",rules,vendor:"neutral",sourceType:"configuration"}).rules}
  const priorEvidence=prior=>({priorLine:prior.sourceLine,priorSequence:prior.sequence,priorAction:prior.action,priorProtocol:prior.protocol,priorSource:prior.source,priorDestination:prior.destination,priorDestinationPort:prior.destinationPort??null});
  const reachable=(rules,index)=>!coveringRules(rules,index).length;
  const findReachable=(rules,predicate)=>{const index=rules.findIndex((rule,index)=>predicate(rule)&&reachable(rules,index));return index<0?null:rules[index]};
  const terminalRoot=rule=>rule?.action==="deny"&&rule.protocol==="ip"&&isAny(rule.source)&&isAny(rule.destination)?`acl-terminal:${rule.sequence}`:null;
  function matched(rule,extra={},rootCauseKey=`acl:${rule.sequence}`){return {matched:true,rootCauseKey,evidence:{...evidence(rule),...extra}}}
  function aclPolicyCheck(facts,params){
    if(!checks.has(params.check))throw new Error(`Unsupported ACL policy check: ${params.check}`);const rules=rulesAt(facts,params.rulesPath);
    if(!rules.length)return {matched:false};let rule,index;
    switch(params.check){
      case "unrestricted-ip-permit":rule=findReachable(rules,item=>isBroadPermit(item,"ip"));break;
      case "unrestricted-tcp-permit":rule=findReachable(rules,item=>isBroadPermit(item,"tcp")&&item.destinationPort===undefined);break;
      case "unrestricted-udp-permit":rule=findReachable(rules,item=>isBroadPermit(item,"udp")&&item.destinationPort===undefined);break;
      case "telnet-permit":rule=findReachable(rules,item=>item.action==="permit"&&item.protocol==="tcp"&&item.destinationPort===23);break;
      case "ssh-from-any":rule=findReachable(rules,item=>item.action==="permit"&&item.protocol==="tcp"&&item.destinationPort===22&&isAny(item.source));break;
      case "snmp-from-any":rule=findReachable(rules,item=>item.action==="permit"&&item.protocol==="udp"&&item.destinationPort===161&&isAny(item.source));break;
      case "duplicate-rule":for(index=1;index<rules.length;index++){const prior=rules.slice(0,index).find(item=>item.action===rules[index].action&&sameMatch(item,rules[index]));if(prior)return matched(rules[index],priorEvidence(prior))}break;
      case "shadowed-rule":for(index=1;index<rules.length;index++){const covers=coveringRules(rules,index);if(covers.some(item=>item.action!==rules[index].action)){const terminal=covers.find(terminalRoot),root=terminalRoot(terminal)||`acl-shadow:${covers.map(item=>item.sequence).join(",")}`;return matched(rules[index],{...priorEvidence(covers[0]),coveringRules:covers.map(evidence)},root)}}break;
      case "deny-only-acl":if(!rules.some(item=>item.action==="permit"))return matched(rules[0],{ruleCount:rules.length,permitCount:0,denyCount:rules.length,sequences:rules.map(item=>item.sequence)});break;
      case "terminal-deny-not-last":index=rules.findIndex((item,itemIndex)=>item.action==="deny"&&item.protocol==="ip"&&isAny(item.source)&&isAny(item.destination)&&reachable(rules,itemIndex));if(index>=0&&index<rules.length-1)return matched(rules[index],{nextLine:rules[index+1].sourceLine,nextSequence:rules[index+1].sequence},`acl-terminal:${rules[index].sequence}`);break;
      case "missing-explicit-terminal-deny":rule=rules[rules.length-1];if(!(rule.action==="deny"&&rule.protocol==="ip"&&isAny(rule.source)&&isAny(rule.destination)))return matched(rule,{ruleCount:rules.length});break;
      case "terminal-deny-without-log":rule=rules[rules.length-1];if(rule.action==="deny"&&rule.protocol==="ip"&&isAny(rule.source)&&isAny(rule.destination)&&!rule.log)return matched(rule);break;
    }
    return rule?matched(rule):{matched:false};
  }
  const operatorId="acl-policy-check",operatorVersion="1.0.0",descriptor=Object.freeze({id:operatorId,version:operatorVersion,handler:aclPolicyCheck});
  return Object.freeze({aclPolicyCheck,checks:Object.freeze([...checks]),contains,descriptor,endpointContains,operatorId,operatorVersion,reachable,sameMatch,unionCoverage});
});
