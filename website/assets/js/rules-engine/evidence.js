"use strict";

const normalize=typeof module!=="undefined"&&module.exports?require("./normalize"):window.NetEngineerLabRulesNormalize;
const secretPattern=/(?:^|[._-])(?:password|passwd|secret|secretkey|secret[-_]?key|community|privatekey|private[-_]?key|apikey|api[-_]?key|authkey|auth[-_]?key|token|key)(?:$|[._-])/i;
const normalizedSecretKeys=new Set(["password","passwd","secret","secretkey","clientsecret","community","privatekey","apikey","authkey","accesstoken","refreshtoken","token","key"]);

function maskValue(value){return value===undefined?"[missing]":value===null?null:"[REDACTED]"}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char])}
function isSecretKey(key){return secretPattern.test(key)||normalizedSecretKeys.has(String(key).replace(/[._-]/g,"").toLowerCase())}
function redactSecrets(value,explicit=new Set(),parentPath=""){
  if(Array.isArray(value))return value.map((child,index)=>redactSecrets(child,explicit,`${parentPath}.${index}`));
  if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,child])=>{
    const childPath=parentPath?`${parentPath}.${key}`:key;
    return [key,isSecretKey(key)||explicit.has(key)||explicit.has(childPath)?maskValue(child):redactSecrets(child,explicit,childPath)];
  }));
  return value;
}

function formatEvidence(rule,facts,operatorResult={},customSelectors={}){
  for(const name of Object.keys(customSelectors))if(["facts","operator-evidence"].includes(name))throw new Error(`Cannot override built-in Evidence selector: ${name}`);
  const selectors={facts:()=>facts,"operator-evidence":()=>operatorResult.evidence,...customSelectors};
  const select=selectors[rule.evidence.selector];
  if(typeof select!=="function")throw new Error(`No deterministic Evidence selector: ${rule.evidence.selector}`);
  const source=select({facts,operatorResult,rule});
  if(!source||typeof source!=="object")throw new Error(`${rule.evidence.selector} returned invalid Evidence source`);
  const explicit=new Set(rule.evidence.redactions||[]);
  let present=0;
  const entries=rule.evidence.fields.map(field=>{
    const raw=normalize.getPath(source,field);
    if(raw!==undefined)present++;
    const redacted=explicit.has(field)||isSecretKey(field);
    const value=redacted?maskValue(raw):raw===undefined?"[missing]":redactSecrets(raw,explicit,field);
    return Object.freeze({field,value,displayValue:escapeHtml(typeof value==="object"&&value!==null?normalize.stableStringify(value):value),redacted});
  });
  if(!present)throw new Error(`${rule.id} produced no present Evidence fields`);
  return entries;
}

const api=Object.freeze({escapeHtml,formatEvidence,isSecretKey,maskValue,redactSecrets,secretPattern});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(typeof window!=="undefined")window.NetEngineerLabRulesEvidence=api;
