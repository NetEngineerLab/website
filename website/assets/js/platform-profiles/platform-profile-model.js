/**
 * NetEngineerLab
 * Version: V2.1-Phase2-PlatformProfileV1
 * Modified: 2026-09-05 17:28:00
 * Purpose: Shared platform profile model for vendor/platform/interface capability validation.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabPlatformProfileModel=api})(typeof self!=="undefined"?self:this,function(){
  "use strict";
  const VERSION="1.1.0";
  const IFACE_TYPES=new Set(["ethernet","gigabit-ethernet","ten-gigabit-ethernet","forty-gigabit-ethernet","hundred-gigabit-ethernet"]);
  const FEATURES=["access-port","trunk-port","native-vlan","allowed-vlans","description"];
  function reqText(v,n){if(typeof v!=="string"||!v.trim())throw new Error(`invalid_${n}`);return v.trim()}
  function normalize(input){
    if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("invalid_platform_profile");
    const id=reqText(input.id,"platform_profile_id"),vendor=reqText(input.vendor,"vendor"),platform=reqText(input.platform,"platform"),label=reqText(input.label||input.platform,"label");
    const types=(input.interfaceTypes||[]).map(v=>reqText(v,"interface_type")); if(!types.length||types.some(v=>!IFACE_TYPES.has(v)))throw new Error("invalid_interface_types");
    const patterns=(input.interfaceNamePatterns||[]).map(v=>new RegExp(v)); if(!patterns.length)throw new Error("interface_name_patterns_required");
    const aggregatePatterns=(input.aggregateInterfaceNamePatterns||[]).map(v=>new RegExp(v));
    const caps={}; for(const f of FEATURES)caps[f]=Boolean(input.capabilities&&input.capabilities[f]);
    return Object.freeze({version:VERSION,id,vendor,platform,label,interfaceTypes:Object.freeze(types),interfaceNamePatterns:Object.freeze(patterns),aggregateInterfaceNamePatterns:Object.freeze(aggregatePatterns),capabilities:Object.freeze(caps),notes:Object.freeze([...(input.notes||[])])});
  }
  function supports(profile,feature){if(!FEATURES.includes(feature))throw new Error("unknown_platform_feature");return Boolean(profile.capabilities[feature])}
  function interfaceNameSupported(profile,name){const n=String(name||"");return profile.interfaceNamePatterns.some(re=>re.test(n))||profile.aggregateInterfaceNamePatterns.some(re=>re.test(n))}
  function aggregateInterfaceNameSupported(profile,name){return profile.aggregateInterfaceNamePatterns.some(re=>re.test(String(name||"")))}
  function validateInterfaceVlan(profile,model){
    const m=model&&model.payload?{name:model.name,...model.payload}:model; if(!m||typeof m!=="object")throw new Error("invalid_interface_vlan_model");
    const violations=[];
    if(!interfaceNameSupported(profile,m.name))violations.push({code:"interface_name_not_supported",field:"name",value:m.name});
    if(m.description&&!supports(profile,"description"))violations.push({code:"description_not_supported"});
    if(m.mode==="access"&&!supports(profile,"access-port"))violations.push({code:"access_port_not_supported"});
    if(m.mode==="trunk"&&!supports(profile,"trunk-port"))violations.push({code:"trunk_port_not_supported"});
    if(m.mode==="trunk"&&Array.isArray(m.allowedVlans)&&m.allowedVlans.length&&!supports(profile,"allowed-vlans"))violations.push({code:"allowed_vlans_not_supported"});
    if(m.mode==="trunk"&&m.nativeVlan!=null&&!supports(profile,"native-vlan"))violations.push({code:"native_vlan_not_supported"});
    return Object.freeze({valid:violations.length===0,violations:Object.freeze(violations)});
  }
  return Object.freeze({VERSION,FEATURES:Object.freeze(FEATURES),normalize,supports,interfaceNameSupported,aggregateInterfaceNameSupported,validateInterfaceVlan});
});
