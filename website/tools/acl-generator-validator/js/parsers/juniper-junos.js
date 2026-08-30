(function(root,factory){const api=factory(typeof module==="object"&&module.exports?require("../ir-adapter"):root.NetEngineerLabAclIr);if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabJuniperJunosAclParser=api})(typeof self!=="undefined"?self:this,function(irApi){
"use strict";
const MAX_INPUT_BYTES=100*1024,MAX_LINES=2000;
const bytes=value=>{let n=0;for(const c of value){const x=c.codePointAt(0);n+=x<128?1:x<2048?2:x<65536?3:4}return n};
function endpoint(cidr){const m=/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d|[12]\d|3[0-2])$/.exec(cidr);if(!m||irApi.parseIpv4(m[1])===null)return null;const prefix=Number(m[2]);return prefix===32?{kind:"host",address:m[1]}:{kind:"network",address:m[1],prefix}}
function parse(input){
  const text=String(input??"");if(bytes(text)>MAX_INPUT_BYTES)throw new Error("acl_input_too_large");if(text.includes("\0"))throw new Error("acl_input_contains_nul");const lines=text.replace(/\r\n?/g,"\n").split("\n");if(lines.length>MAX_LINES)throw new Error("acl_too_many_lines");
  let name=null,lastSequence=-1;const terms=new Map(),unparsed=[],warnings=[];
  lines.forEach((raw,i)=>{const line=i+1,s=raw.trim();if(!s||s.startsWith("#"))return;const m=/^set firewall family inet filter ([A-Za-z][A-Za-z0-9_.-]{0,63}) term rule-(\d+) (from|then) (.+)$/i.exec(s);if(!m){unparsed.push({line,text:raw,code:"unsupported_syntax"});return}
    if(name&&name!==m[1])throw new Error("multiple_acls_not_supported");name=m[1];const sequence=Number(m[2]);if(!Number.isSafeInteger(sequence)||sequence<0||sequence>2147483647)throw new Error("invalid_sequence");if(!terms.has(sequence)){if(sequence<=lastSequence)throw new Error("unsupported_term_order");lastSequence=sequence}
    const term=terms.get(sequence)||{sequence,source:{kind:"any"},destination:{kind:"any"},log:false,sourceLine:line,raw:[]};term.raw.push(s);const body=m[4].toLowerCase();
    if(m[3].toLowerCase()==="from"){
      let x;if((x=/^protocol (tcp|udp|icmp)$/.exec(body))){if(term.protocol)term.invalid=true;term.protocol=x[1]}else if((x=/^source-address (.+)$/.exec(body))){const value=endpoint(x[1]);if(!value||term.sourceSet)term.invalid=true;else{term.source=value;term.sourceSet=true}}else if((x=/^destination-address (.+)$/.exec(body))){const value=endpoint(x[1]);if(!value||term.destinationSet)term.invalid=true;else{term.destination=value;term.destinationSet=true}}else if((x=/^destination-port (\d+)$/.exec(body))&&Number(x[1])<=65535){if(term.destinationPort!==undefined)term.invalid=true;term.destinationPort=Number(x[1])}else term.invalid=true;
    }else if(body==="accept"||body==="discard"){const value=body==="accept"?"permit":"deny";if(term.action)term.invalid=true;term.action=value}else if(body==="log")term.log=true;else term.invalid=true;terms.set(sequence,term);
  });
  if(!name)throw new Error("juniper_junos_set_acl_required");const rules=[];for(const term of terms.values()){term.protocol??="ip";if(term.invalid||!term.action){unparsed.push({line:term.sourceLine,text:term.raw.join(" | "),code:"incomplete_or_conflicting_term"});continue}delete term.sourceSet;delete term.destinationSet;term.raw=term.raw.join("\n");rules.push(term)}
  if(!rules.length)throw new Error("acl_contains_no_supported_rules");if(unparsed.length)warnings.push({code:"unsupported_lines_present",count:unparsed.length});
  return Object.freeze({vendor:"juniper-junos",ir:irApi.createIr({name,rules,vendor:"juniper-junos",sourceType:"configuration"}),warnings:Object.freeze(warnings),unparsed:Object.freeze(unparsed),coverage:Object.freeze({parsedRules:rules.length,unparsedLines:unparsed.length,complete:unparsed.length===0})});
}
return Object.freeze({MAX_INPUT_BYTES,MAX_LINES,parse});
});
