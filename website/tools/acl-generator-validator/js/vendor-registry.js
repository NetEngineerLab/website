/**
 * NetEngineerLab
 * Version: V2.1-Phase2
 * Modified: 2026-09-05 16:20:00
 * Purpose: ACL domain vendor registry backed by the shared Vendor Renderer Foundation.
 */
(function(root,factory){const api=factory(
 typeof module==="object"&&module.exports?require("../../../assets/js/vendor-renderer/vendor-registry"):root.NetEngineerLabVendorRegistry,
 typeof module==="object"&&module.exports?require("./parsers/cisco-ios"):root.NetEngineerLabCiscoIosAclParser,typeof module==="object"&&module.exports?require("./generators/cisco-ios"):root.NetEngineerLabCiscoIosAclGenerator,
 typeof module==="object"&&module.exports?require("./parsers/huawei-vrp"):root.NetEngineerLabHuaweiVrpAclParser,typeof module==="object"&&module.exports?require("./generators/huawei-vrp"):root.NetEngineerLabHuaweiVrpAclGenerator,
 typeof module==="object"&&module.exports?require("./parsers/h3c-comware"):root.NetEngineerLabH3cComwareAclParser,typeof module==="object"&&module.exports?require("./generators/h3c-comware"):root.NetEngineerLabH3cComwareAclGenerator,
 typeof module==="object"&&module.exports?require("./parsers/juniper-junos"):root.NetEngineerLabJuniperJunosAclParser,typeof module==="object"&&module.exports?require("./generators/juniper-junos"):root.NetEngineerLabJuniperJunosAclGenerator,
 typeof module==="object"&&module.exports?require("./parsers/arista-eos"):root.NetEngineerLabAristaEosAclParser,typeof module==="object"&&module.exports?require("./generators/arista-eos"):root.NetEngineerLabAristaEosAclGenerator
);if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabAclVendorRegistry=api})(typeof self!=="undefined"?self:this,function(registryApi,ciscoP,ciscoG,huaweiP,huaweiG,h3cP,h3cG,junosP,junosG,aristaP,aristaG){
 "use strict";const cap=["parse","render","semantic-round-trip","ipv4-acl-v1"];return registryApi.create([
  {id:"cisco-ios",label:"Cisco IOS",parse:ciscoP.parse,render:ciscoG.generate,capabilities:cap},{id:"huawei-vrp",label:"Huawei VRP",parse:huaweiP.parse,render:huaweiG.generate,capabilities:cap},{id:"h3c-comware",label:"H3C Comware",parse:h3cP.parse,render:h3cG.generate,capabilities:cap},{id:"juniper-junos",label:"Juniper Junos",parse:junosP.parse,render:junosG.generate,capabilities:cap},{id:"arista-eos",label:"Arista EOS",parse:aristaP.parse,render:aristaG.generate,capabilities:cap}
 ])
});
