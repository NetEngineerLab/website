/**
 * NetEngineerLab
 * Version: V2.1-Phase2
 * Modified: 2026-09-05 16:20:00
 * Purpose: Shared parse/render/semantic-round-trip orchestration over a vendor registry.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabVendorRendererEngine=api})(typeof self!=="undefined"?self:this,function(){
  "use strict";
  function create({registry,semanticView}){
    if(!registry||typeof registry.get!=="function"||!Array.isArray(registry.ids))throw new Error("invalid_vendor_registry");
    if(typeof semanticView!=="function")throw new Error("semantic_view_required");
    function parse({vendor,input}){return registry.get(vendor).parse(input)}
    function render({vendor,model}){return registry.get(vendor).render(model)}
    function roundTrip({vendor,model}){const configuration=render({vendor,model});const parsed=parse({vendor,input:configuration});const expected=semanticView(model),actual=semanticView(parsed.ir??parsed.model);return Object.freeze({equivalent:JSON.stringify(expected)===JSON.stringify(actual),configuration,parsed,expected,actual})}
    return Object.freeze({parse,render,roundTrip,supportedVendors:registry.ids});
  }
  return Object.freeze({create});
});
