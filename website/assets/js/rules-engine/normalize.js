"use strict";
{

function pathParts(path){
  if(typeof path!=="string"||!path||!/^(?:[a-zA-Z_][a-zA-Z0-9_-]*|\d+)(?:\.(?:[a-zA-Z_][a-zA-Z0-9_-]*|\d+))*$/.test(path))throw new Error(`Invalid fact path: ${path}`);
  const parts=path.split(".");
  if(parts.some(part=>["__proto__","prototype","constructor"].includes(part)))throw new Error(`Unsafe fact path: ${path}`);
  return parts;
}

function getPath(value,path){
  let current=value;
  for(const part of pathParts(path)){
    if(current===null||current===undefined||!Object.prototype.hasOwnProperty.call(Object(current),part))return undefined;
    current=current[part];
  }
  return current;
}

function stableValue(value){
  if(Array.isArray(value))return value.map(stableValue);
  if(value&&typeof value==="object")return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableValue(value[key])]));
  return value;
}

function stableStringify(value){return JSON.stringify(stableValue(value))}

const api=Object.freeze({getPath,pathParts,stableStringify,stableValue});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(typeof window!=="undefined")window.NetEngineerLabRulesNormalize=api;
}
