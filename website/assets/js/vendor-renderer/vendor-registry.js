/**
 * NetEngineerLab
 * Version: V2.1-Phase2
 * Modified: 2026-09-05 16:20:00
 * Purpose: Reusable vendor registry for parser/renderer capabilities.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabVendorRegistry=api})(typeof self!=="undefined"?self:this,function(){
  "use strict";
  const ID=/^[a-z][a-z0-9-]{1,63}$/;
  function create(definitions){
    if(!Array.isArray(definitions)||!definitions.length)throw new Error("vendor_definitions_required");
    const map=new Map();
    for(const item of definitions){
      if(!item||typeof item!=="object"||!ID.test(item.id||""))throw new Error("invalid_vendor_definition");
      if(map.has(item.id))throw new Error("duplicate_vendor_id");
      if(typeof item.label!=="string"||!item.label.trim())throw new Error("invalid_vendor_label");
      if(typeof item.parse!=="function"||typeof item.render!=="function")throw new Error("vendor_parser_renderer_required");
      map.set(item.id,Object.freeze({id:item.id,label:item.label.trim(),parse:item.parse,render:item.render,capabilities:Object.freeze([...(item.capabilities||[])])}));
    }
    const ids=Object.freeze([...map.keys()]);
    function get(id){const value=map.get(id);if(!value)throw new Error("unsupported_vendor");return value}
    return Object.freeze({ids,get,list:()=>Object.freeze(ids.map(id=>map.get(id)))});
  }
  return Object.freeze({create});
});
