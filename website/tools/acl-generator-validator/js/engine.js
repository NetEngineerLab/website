/**
 * NetEngineerLab
 * Version: V2.1-Phase2
 * Modified: 2026-09-05 16:20:00
 * Purpose: ACL reference engine using Shared Core + Vendor Renderer Foundation.
 */
(function(root,factory){
  const api=factory(
    typeof module==="object"&&module.exports?require("./ir-adapter"):root.NetEngineerLabAclIr,
    typeof module==="object"&&module.exports?require("./vendor-registry"):root.NetEngineerLabAclVendorRegistry,
    typeof module==="object"&&module.exports?require("../../../assets/js/vendor-renderer/renderer-engine"):root.NetEngineerLabVendorRendererEngine,
    typeof module==="object"&&module.exports?require("../../../assets/js/rules-engine/evaluate"):root.NetEngineerLabRulesEvaluate,
    typeof module==="object"&&module.exports?require("../../../assets/js/rules-engine/score"):root.NetEngineerLabRulesScore,
    typeof module==="object"&&module.exports?require("../../../assets/js/rules-engine/report"):root.NetEngineerLabRulesReport,
    typeof module==="object"&&module.exports?require("./acl-rule-operators"):root.NetEngineerLabAclRuleOperators
  );
  if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabAclEngine=api;
})(typeof self!=="undefined"?self:this,function(irApi,vendorRegistry,rendererEngineApi,evaluateApi,scoreApi,reportApi,aclRuleOperators){
  "use strict";
  const renderer=rendererEngineApi.create({registry:vendorRegistry,semanticView:irApi.semanticView});
  function parseConfiguration({vendor:vendorId,input}){return renderer.parse({vendor:vendorId,input})}
  function generateConfiguration({vendor:vendorId,ir}){return renderer.render({vendor:vendorId,model:ir})}
  function semanticRoundTrip({vendor:vendorId,ir}){return renderer.roundTrip({vendor:vendorId,model:ir})}
  function analyzeConfiguration({vendor:vendorId,input,bundle,locale="en"}){
    const parsed=parseConfiguration({vendor:vendorId,input});
    const findings=evaluateApi.evaluateBundle(bundle,{rules:parsed.ir.rules},{locale,customOperators:{[aclRuleOperators.operatorId]:aclRuleOperators.descriptor}});
    const score=scoreApi.scoreFindings(findings,bundle.severityPolicy),report=reportApi.createReport(findings,score,{locale});
    return Object.freeze({parsed,findings:Object.freeze(findings),score,report});
  }
  return Object.freeze({IR_VERSION:irApi.IR_VERSION,analyzeConfiguration,generateConfiguration,parseConfiguration,semanticRoundTrip,supportedVendors:vendorRegistry.ids,vendorRegistry});
});
