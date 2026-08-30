(function(root,factory){
  const api=factory(typeof module==="object"&&module.exports?require("../ir-adapter"):root.NetEngineerLabAclIr);
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.NetEngineerLabCiscoIosAclGenerator=api;
})(typeof self!=="undefined"?self:this,function(irApi){
  "use strict";
  function endpoint(value){
    if(value.kind==="any")return "any";
    if(value.kind==="host")return `host ${value.address}`;
    if(value.kind==="network")return `${value.address} ${irApi.prefixToWildcard(value.prefix)}`;
    throw new Error("unsupported_endpoint_kind");
  }
  function generate(input){
    irApi.validateCompatibleIr(input);
    const ir=irApi.createIr(input);
    if(ir.rules.some(rule=>rule.sequence<1))throw new Error("cisco_sequence_must_be_positive");
    const lines=[`ip access-list extended ${ir.name}`];
    for(const rule of ir.rules){
      let line=` ${rule.sequence} ${rule.action} ${rule.protocol} ${endpoint(rule.source)} ${endpoint(rule.destination)}`;
      if(rule.destinationPort!==undefined)line+=` eq ${rule.destinationPort}`;
      if(rule.log)line+=" log";
      lines.push(line);
    }
    lines.push("exit");return `${lines.join("\n")}\n`;
  }
  return Object.freeze({generate});
});
