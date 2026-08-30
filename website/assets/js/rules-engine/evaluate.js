"use strict";

const normalize=typeof module!=="undefined"&&module.exports?require("./normalize"):window.NetEngineerLabRulesNormalize;
const evidenceApi=typeof module!=="undefined"&&module.exports?require("./evidence"):window.NetEngineerLabRulesEvidence;
const runtimeApiVersion="1.0.0";

const builtInOperators=Object.freeze({
  equals:(facts,params)=>Object.is(normalize.getPath(facts,params.path),params.value),
  "not-equals":(facts,params)=>{const value=normalize.getPath(facts,params.path);return value!==undefined&&!Object.is(value,params.value)},
  "numeric-less-than":(facts,params)=>{const value=normalize.getPath(facts,params.path);return Number.isFinite(value)&&value<params.value},
  "numeric-greater-than":(facts,params)=>{const value=normalize.getPath(facts,params.path);return Number.isFinite(value)&&value>params.value},
  "contains-any":(facts,params)=>{const value=normalize.getPath(facts,params.path);return Array.isArray(value)&&params.values.some(item=>value.includes(item))}
});

function evaluateRules(rules,facts,{locale="en",customOperators={},customEvidenceSelectors={}}={}){
  if(!Array.isArray(rules))throw new Error("Rules must be an array");
  if(!facts||typeof facts!=="object"||Array.isArray(facts))throw new Error("Facts must be an object");
  if(!["en","zh"].includes(locale))throw new Error(`Unsupported finding locale: ${locale}`);
  for(const name of Object.keys(customOperators))if(Object.hasOwn(builtInOperators,name))throw new Error(`Cannot override built-in operator: ${name}`);
  const handlers={...builtInOperators,...customOperators};
  return rules.filter(rule=>rule.status==="active").map(rule=>{
    const handler=handlers[rule.condition.operator];
    if(typeof handler!=="function")throw new Error(`No deterministic handler for operator: ${rule.condition.operator}`);
    const outcome=handler(facts,rule.condition.params,rule);
    if(typeof outcome!=="boolean"&&!(outcome&&typeof outcome==="object"&&typeof outcome.matched==="boolean"))throw new Error(`${rule.condition.operator} returned an invalid outcome`);
    const matched=typeof outcome==="object"&&outcome!==null?outcome.matched===true:outcome===true;
    if(!matched)return null;
    const content=rule.content[locale];
    if(!content)throw new Error(`${rule.id} lacks ${locale} content`);
    return Object.freeze({
      ruleId:rule.id,ruleVersion:rule.version,severity:rule.severity,dimensions:[...rule.dimensions],
      title:content.title,finding:content.finding,reason:content.reason,recommendation:content.recommendation,
      fieldExperienceNote:content.fieldExperienceNote,
      rootCauseKey:typeof outcome==="object"&&outcome?.rootCauseKey?String(outcome.rootCauseKey):rule.id,
      evidence:evidenceApi.formatEvidence(rule,facts,typeof outcome==="object"?outcome:{},customEvidenceSelectors)
    });
  }).filter(Boolean);
}

function validateBundleCompatibility(bundle){
  if(!bundle||bundle.bundleVersion!==runtimeApiVersion||bundle.runtimeApiVersion!==runtimeApiVersion||bundle.ruleSchemaVersion!==runtimeApiVersion)throw new Error("Rules bundle/runtime API version mismatch");
  if(String(bundle.scorePolicyVersion||"").split("-")[0]!==runtimeApiVersion)throw new Error("Score policy/runtime API version mismatch");
  if(bundle.severityPolicy?.runtimeApiVersion!==runtimeApiVersion||bundle.operatorRegistry?.runtimeApiVersion!==runtimeApiVersion)throw new Error("Rules bundle component runtime version mismatch");
  return true;
}

function evaluateBundle(bundle,facts,options={}){validateBundleCompatibility(bundle);return evaluateRules(bundle.rules,facts,options)}

const api=Object.freeze({builtInOperators,evaluateBundle,evaluateRules,runtimeApiVersion,validateBundleCompatibility});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(typeof window!=="undefined")window.NetEngineerLabRulesEvaluate=api;
