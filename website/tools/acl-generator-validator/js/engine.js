(function(root,factory){
  const api=factory(
    typeof module==="object"&&module.exports?require("./ir-adapter"):root.NetEngineerLabAclIr,
    typeof module==="object"&&module.exports?require("./parsers/cisco-ios"):root.NetEngineerLabCiscoIosAclParser,
    typeof module==="object"&&module.exports?require("./generators/cisco-ios"):root.NetEngineerLabCiscoIosAclGenerator
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.NetEngineerLabAclEngine=api;
})(typeof self!=="undefined"?self:this,function(irApi,ciscoParser,ciscoGenerator){
  "use strict";
  const vendors=Object.freeze({"cisco-ios":Object.freeze({parse:ciscoParser.parse,generate:ciscoGenerator.generate})});
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
