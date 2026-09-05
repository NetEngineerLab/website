/**
 * NetEngineerLab
 * Version: V2.1-Phase2-InterfaceVlan
 * Modified: 2026-09-05 16:48:00
 * Purpose: Canonical Interface/VLAN configuration model for cross-vendor rendering.
 */
(function(root,factory){const api=factory(typeof module==="object"&&module.exports?require("../../shared-core/canonical-config-model"):root.NetEngineerLabCanonicalConfigModel);if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabInterfaceVlanModel=api})(typeof self!=="undefined"?self:this,function(canonical){
  "use strict";
  const DOMAIN="interface-vlan",FAMILY="l2-switchport",MODEL_VERSION="1.0.0";
  const MODES=new Set(["access","trunk"]);
  function vlan(value,name="vlan") { const n=Number(value); if(!Number.isSafeInteger(n)||n<1||n>4094)throw new Error(`invalid_${name}`); return n; }
  function vlans(values){ if(!Array.isArray(values)||!values.length)throw new Error("allowed_vlans_required"); return Object.freeze([...new Set(values.map(v=>vlan(v)))].sort((a,b)=>a-b)); }
  function cleanText(value,name,optional=false){ if(value==null&&optional)return null; if(typeof value!=="string"||!value.trim())throw new Error(`invalid_${name}`); return value.trim(); }
  function normalize(input){
    if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("invalid_interface_vlan_model");
    const name=cleanText(input.name||input.interfaceName,"interface_name");
    const mode=String(input.mode||"").toLowerCase(); if(!MODES.has(mode))throw new Error("invalid_switchport_mode");
    const description=cleanText(input.description,"description",true);
    if(mode==="access"){
      const accessVlan=vlan(input.accessVlan,"access_vlan");
      if(input.allowedVlans!=null||input.nativeVlan!=null)throw new Error("access_mode_trunk_fields_not_allowed");
      return Object.freeze({modelVersion:MODEL_VERSION,domain:DOMAIN,family:FAMILY,name,mode,description,accessVlan});
    }
    const allowedVlans=vlans(input.allowedVlans);
    const nativeVlan=input.nativeVlan==null?null:vlan(input.nativeVlan,"native_vlan");
    if(nativeVlan!==null&&!allowedVlans.includes(nativeVlan))throw new Error("native_vlan_must_be_allowed");
    if(input.accessVlan!=null)throw new Error("trunk_mode_access_vlan_not_allowed");
    return Object.freeze({modelVersion:MODEL_VERSION,domain:DOMAIN,family:FAMILY,name,mode,description,allowedVlans,nativeVlan});
  }
  function create(input){ const m=normalize(input); const payload={mode:m.mode,description:m.description,...(m.mode==="access"?{accessVlan:m.accessVlan}:{allowedVlans:m.allowedVlans,nativeVlan:m.nativeVlan})}; return canonical.create({domain:DOMAIN,family:FAMILY,name:m.name,payload,metadata:{domainModelVersion:MODEL_VERSION}}); }
  function fromCanonical(model){ canonical.validate(model); if(model.domain!==DOMAIN||model.family!==FAMILY)throw new Error("incompatible_interface_vlan_domain"); return normalize({name:model.name,...model.payload}); }
  function semanticView(model){ const m=model.modelVersion===canonical.MODEL_VERSION&&model.payload?fromCanonical(model):normalize(model); return m.mode==="access"?{domain:DOMAIN,family:FAMILY,name:m.name,mode:m.mode,description:m.description,accessVlan:m.accessVlan}:{domain:DOMAIN,family:FAMILY,name:m.name,mode:m.mode,description:m.description,allowedVlans:[...m.allowedVlans],nativeVlan:m.nativeVlan}; }
  return Object.freeze({DOMAIN,FAMILY,MODEL_VERSION,create,normalize,fromCanonical,semanticView,vlan});
});
