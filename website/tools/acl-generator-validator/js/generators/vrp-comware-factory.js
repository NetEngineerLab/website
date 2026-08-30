(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabVrpComwareGeneratorFactory=api})(typeof self!=="undefined"?self:this,function(){
"use strict";
function createGenerator(irApi,{header,minSequence=0,maxSequence=2147483647}){
  const endpoint=value=>value.kind==="any"?"any":`${value.address} ${value.kind==="host"?"0.0.0.0":irApi.prefixToWildcard(value.prefix)}`;
  function generate(input){irApi.validateCompatibleIr(input);const ir=irApi.createIr(input);if(ir.rules.some(rule=>rule.sequence<minSequence||rule.sequence>maxSequence))throw new Error("vendor_sequence_out_of_range");const lines=[header(ir.name)];for(const r of ir.rules){let line=` rule ${r.sequence} ${r.action} ${r.protocol} source ${endpoint(r.source)} destination ${endpoint(r.destination)}`;if(r.destinationPort!==undefined)line+=` destination-port eq ${r.destinationPort}`;if(r.log)line+=" logging";lines.push(line)}lines.push("quit");return `${lines.join("\n")}\n`}
  return Object.freeze({generate});
}
return Object.freeze({createGenerator});
});
