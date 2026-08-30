(function(root,factory){
  const api=factory(typeof module==="object"&&module.exports?require("../ir-adapter"):root.NetEngineerLabAclIr);
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.NetEngineerLabCiscoIosAclParser=api;
})(typeof self!=="undefined"?self:this,function(irApi){
  "use strict";
  const MAX_INPUT_BYTES=100*1024,MAX_LINES=2000;
  function utf8Bytes(value){
    let bytes=0;for(const character of value){const code=character.codePointAt(0);bytes+=code<=0x7f?1:code<=0x7ff?2:code<=0xffff?3:4}return bytes;
  }
  function endpoint(tokens,index){
    const token=tokens[index];
    if(token==="any")return {endpoint:{kind:"any"},next:index+1};
    if(token==="host"&&irApi.parseIpv4(tokens[index+1])!==null)return {endpoint:{kind:"host",address:tokens[index+1]},next:index+2};
    const prefix=irApi.wildcardToPrefix(tokens[index+1]);
    if(irApi.parseIpv4(token)!==null&&prefix!==null)return {endpoint:{kind:"network",address:token,prefix},next:index+2};
    return null;
  }
  function parseRule(text,line){
    const tokens=text.trim().split(/\s+/).map(token=>token.toLowerCase());let index=0,sequence;
    if(/^\d+$/.test(tokens[0]))sequence=Number(tokens[index++]);
    const action=tokens[index++],protocol=tokens[index++];
    if(!["permit","deny"].includes(action)||!["ip","tcp","udp","icmp"].includes(protocol))return null;
    const source=endpoint(tokens,index);if(!source)return null;index=source.next;
    const destination=endpoint(tokens,index);if(!destination)return null;index=destination.next;
    let destinationPort,log=false;
    if(tokens[index]==="eq"){destinationPort=tokens[index+1];if(!/^\d+$/.test(destinationPort||"")||Number(destinationPort)>65535)return null;index+=2}
    if(tokens[index]==="log"){log=true;index++}
    if(index!==tokens.length)return null;
    return {sequence,action,protocol,source:source.endpoint,destination:destination.endpoint,...(destinationPort===undefined?{}:{destinationPort}),log,sourceLine:line,raw:text};
  }
  function parse(input){
    const text=String(input??"");
    if(utf8Bytes(text)>MAX_INPUT_BYTES)throw new Error("acl_input_too_large");
    if(text.includes("\0"))throw new Error("acl_input_contains_nul");
    const lines=text.replace(/\r\n?/g,"\n").split("\n");if(lines.length>MAX_LINES)throw new Error("acl_too_many_lines");
    let name=null,inAcl=false;const rules=[],warnings=[],unparsed=[];
    lines.forEach((raw,offset)=>{
      const line=offset+1,trimmed=raw.trim();if(!trimmed||trimmed.startsWith("!"))return;
      const header=/^ip access-list extended ([A-Za-z][A-Za-z0-9_.-]{0,63})$/i.exec(trimmed);
      if(header){if(name!==null)throw new Error("multiple_acls_not_supported");name=header[1];inAcl=true;return}
      if(/^(?:exit|end)$/i.test(trimmed)){inAcl=false;return}
      if(!inAcl){unparsed.push({line,text:raw,code:"outside_acl"});return}
      if(/^remark(?:\s|$)/i.test(trimmed)){warnings.push({code:"remark_ignored",line});return}
      const rule=parseRule(trimmed,line);if(rule)rules.push(rule);else unparsed.push({line,text:raw,code:"unsupported_syntax"});
    });
    if(!name)throw new Error("cisco_ios_named_extended_acl_required");
    if(!rules.length)throw new Error("acl_contains_no_supported_rules");
    const sequenceStyles=new Set(rules.map(rule=>rule.sequence===undefined?"implicit":"explicit"));
    if(sequenceStyles.size>1)throw new Error("mixed_sequence_style_not_supported");
    const ir=irApi.createIr({name,rules,vendor:"cisco-ios",sourceType:"configuration"});
    if(unparsed.length)warnings.push({code:"unsupported_lines_present",count:unparsed.length});
    return Object.freeze({vendor:"cisco-ios",ir,warnings:Object.freeze(warnings),unparsed:Object.freeze(unparsed),coverage:Object.freeze({parsedRules:rules.length,unparsedLines:unparsed.length,complete:unparsed.length===0})});
  }
  return Object.freeze({MAX_INPUT_BYTES,MAX_LINES,parse,parseRule,utf8Bytes});
});
