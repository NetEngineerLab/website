(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabVrpComwareParserFactory=api})(typeof self!=="undefined"?self:this,function(){
"use strict";
function createParser(irApi,{vendor,headerPattern,minSequence=0,maxSequence=2147483647}){
  const MAX_INPUT_BYTES=100*1024,MAX_LINES=2000;
  const bytes=value=>{let n=0;for(const c of value){const x=c.codePointAt(0);n+=x<128?1:x<2048?2:x<65536?3:4}return n};
  function endpoint(tokens,index){
    if(tokens[index]==="any")return {value:{kind:"any"},next:index+1};
    const address=tokens[index],prefix=irApi.wildcardToPrefix(tokens[index+1]);
    if(irApi.parseIpv4(address)===null||prefix===null)return null;
    return {value:prefix===32?{kind:"host",address}:{kind:"network",address,prefix},next:index+2};
  }
  function rule(text,line){
    const t=text.trim().toLowerCase().split(/\s+/);if(t.shift()!=="rule")return null;
    const sequence=t.shift();if(!/^\d+$/.test(sequence||"")||Number(sequence)<minSequence||Number(sequence)>maxSequence)return null;
    const action=t.shift(),protocol=t.shift();if(!["permit","deny"].includes(action)||!["ip","tcp","udp","icmp"].includes(protocol))return null;
    if(t.shift()!=="source")return null;let parsed=endpoint(t,0);if(!parsed)return null;const source=parsed.value;t.splice(0,parsed.next);
    if(t.shift()!=="destination")return null;parsed=endpoint(t,0);if(!parsed)return null;const destination=parsed.value;t.splice(0,parsed.next);
    let destinationPort,log=false;
    if(t[0]==="destination-port"&&t[1]==="eq"&&/^\d+$/.test(t[2]||"")&&Number(t[2])<=65535){destinationPort=Number(t[2]);t.splice(0,3)}
    if(t[0]==="logging"){log=true;t.shift()}
    if(t.length)return null;
    return {sequence:Number(sequence),action,protocol,source,destination,...(destinationPort===undefined?{}:{destinationPort}),log,sourceLine:line,raw:text};
  }
  function parse(input){
    const text=String(input??"");if(bytes(text)>MAX_INPUT_BYTES)throw new Error("acl_input_too_large");if(text.includes("\0"))throw new Error("acl_input_contains_nul");
    const lines=text.replace(/\r\n?/g,"\n").split("\n");if(lines.length>MAX_LINES)throw new Error("acl_too_many_lines");
    let name=null,inAcl=false;const rules=[],warnings=[],unparsed=[];
    lines.forEach((raw,i)=>{const line=i+1,s=raw.trim();if(!s||s==="#")return;const h=headerPattern.exec(s);headerPattern.lastIndex=0;
      if(h){if(name)throw new Error("multiple_acls_not_supported");name=h[1];inAcl=true;return}if(/^quit$/i.test(s)){inAcl=false;return}
      if(!inAcl){unparsed.push({line,text:raw,code:"outside_acl"});return}if(/^description\b/i.test(s)){warnings.push({code:"description_ignored",line});return}
      const item=rule(s,line);if(item)rules.push(item);else unparsed.push({line,text:raw,code:"unsupported_syntax"});});
    if(!name)throw new Error(`${vendor}_named_advanced_acl_required`);if(!rules.length)throw new Error("acl_contains_no_supported_rules");
    if(unparsed.length)warnings.push({code:"unsupported_lines_present",count:unparsed.length});
    return Object.freeze({vendor,ir:irApi.createIr({name,rules,vendor,sourceType:"configuration"}),warnings:Object.freeze(warnings),unparsed:Object.freeze(unparsed),coverage:Object.freeze({parsedRules:rules.length,unparsedLines:unparsed.length,complete:unparsed.length===0})});
  }
  return Object.freeze({MAX_INPUT_BYTES,MAX_LINES,parse});
}
return Object.freeze({createParser});
});
