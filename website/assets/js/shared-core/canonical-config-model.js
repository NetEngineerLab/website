/**
 * NetEngineerLab
 * Version: V2.1-Phase2
 * Modified: 2026-09-05 16:20:00
 * Purpose: Generic versioned canonical configuration envelope shared by vendor-rendered tools.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.NetEngineerLabCanonicalConfigModel=api})(typeof self!=="undefined"?self:this,function(){
  "use strict";
  const MODEL_VERSION="1.0.0";
  function text(value,name){if(typeof value!=="string"||!value.trim())throw new Error(`invalid_${name}`);return value.trim()}
  function validate(model){
    if(!model||typeof model!=="object"||Array.isArray(model))throw new Error("invalid_canonical_model");
    if(model.modelVersion!==MODEL_VERSION)throw new Error("incompatible_canonical_model_version");
    text(model.domain,"domain");text(model.family,"family");text(model.name,"name");
    if(model.payload===undefined)throw new Error("canonical_payload_required");
    return model;
  }
  function create({domain,family,name,payload,metadata={}}){
    if(!metadata||typeof metadata!=="object"||Array.isArray(metadata))throw new Error("invalid_canonical_metadata");
    return Object.freeze({modelVersion:MODEL_VERSION,domain:text(domain,"domain"),family:text(family,"family"),name:text(name,"name"),payload,metadata:Object.freeze({...metadata})});
  }
  return Object.freeze({MODEL_VERSION,create,validate});
});
