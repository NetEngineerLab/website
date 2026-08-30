(function(root,factory){const api=factory(typeof module==="object"&&module.exports?require("../ir-adapter"):root.NetEngineerLabAclIr);if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabJuniperJunosAclGenerator=api})(typeof self!=="undefined"?self:this,function(irApi){
"use strict";
function cidr(value){return value.kind==="host"?`${value.address}/32`:`${value.address}/${value.prefix}`}
function generate(input){
  irApi.validateCompatibleIr(input);const ir=irApi.createIr(input),lines=[];
  for(const rule of ir.rules){const base=`set firewall family inet filter ${ir.name} term rule-${rule.sequence}`;
    if(rule.protocol!=="ip")lines.push(`${base} from protocol ${rule.protocol}`);
    if(rule.source.kind!=="any")lines.push(`${base} from source-address ${cidr(rule.source)}`);
    if(rule.destination.kind!=="any")lines.push(`${base} from destination-address ${cidr(rule.destination)}`);
    if(rule.destinationPort!==undefined)lines.push(`${base} from destination-port ${rule.destinationPort}`);
    if(rule.log)lines.push(`${base} then log`);lines.push(`${base} then ${rule.action==="permit"?"accept":"discard"}`);
  }
  return `${lines.join("\n")}\n`;
}
return Object.freeze({generate});
});
