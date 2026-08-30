(function(root,factory){
  const api=factory(
    typeof module==="object"&&module.exports?require("./ir-adapter"):root.NetEngineerLabAclIr,
    typeof module==="object"&&module.exports?require("./parsers/cisco-ios"):root.NetEngineerLabCiscoIosAclParser,
    typeof module==="object"&&module.exports?require("./generators/cisco-ios"):root.NetEngineerLabCiscoIosAclGenerator,
    typeof module==="object"&&module.exports?require("./parsers/huawei-vrp"):root.NetEngineerLabHuaweiVrpAclParser,
    typeof module==="object"&&module.exports?require("./generators/huawei-vrp"):root.NetEngineerLabHuaweiVrpAclGenerator,
    typeof module==="object"&&module.exports?require("./parsers/h3c-comware"):root.NetEngineerLabH3cComwareAclParser,
    typeof module==="object"&&module.exports?require("./generators/h3c-comware"):root.NetEngineerLabH3cComwareAclGenerator,
    typeof module==="object"&&module.exports?require("./parsers/juniper-junos"):root.NetEngineerLabJuniperJunosAclParser,
    typeof module==="object"&&module.exports?require("./generators/juniper-junos"):root.NetEngineerLabJuniperJunosAclGenerator
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.NetEngineerLabAclEngine=api;
})(typeof self!=="undefined"?self:this,function(irApi,ciscoParser,ciscoGenerator,huaweiParser,huaweiGenerator,h3cParser,h3cGenerator,junosParser,junosGenerator){
  "use strict";
  const vendors=Object.freeze({"cisco-ios":Object.freeze({parse:ciscoParser.parse,generate:ciscoGenerator.generate}),"huawei-vrp":Object.freeze({parse:huaweiParser.parse,generate:huaweiGenerator.generate}),"h3c-comware":Object.freeze({parse:h3cParser.parse,generate:h3cGenerator.generate}),"juniper-junos":Object.freeze({parse:junosParser.parse,generate:junosGenerator.generate})});
  function vendor(value){const selected=vendors[value];if(!selected)throw new Error("unsupported_vendor");return selected}
  function parseConfiguration({vendor:vendorId,input}){return vendor(vendorId).parse(input)}
  function generateConfiguration({vendor:vendorId,ir}){return vendor(vendorId).generate(ir)}
  function semanticRoundTrip({vendor:vendorId,ir}){
    const configuration=generateConfiguration({vendor:vendorId,ir});
    const parsed=parseConfiguration({vendor:vendorId,input:configuration});
    const expected=irApi.semanticView(ir),actual=irApi.semanticView(parsed.ir);
    return Object.freeze({equivalent:JSON.stringify(expected)===JSON.stringify(actual),configuration,parsed,expected,actual});
  }
  return Object.freeze({IR_VERSION:irApi.IR_VERSION,generateConfiguration,parseConfiguration,semanticRoundTrip,supportedVendors:Object.freeze(Object.keys(vendors))});
});
