#!/usr/bin/env node
"use strict";

const crypto=require("crypto");
const {spawnSync}=require("child_process");
const fs=require("fs");
const path=require("path");
const {stableStringify}=require("../website/assets/js/rules-engine/normalize");
const root=path.resolve(__dirname,"..");
const defaultDataRoot=path.join(root,"website","data","engineering-rules");
const defaultOutputRoot=path.join(root,"website","assets","generated","rules-engine");
const runtimeApiVersion="1.0.0";
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));

function loadRules(dataRoot){
  const rules=[];
  for(const entry of fs.readdirSync(dataRoot,{withFileTypes:true}).filter(item=>item.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name))){
    const file=path.join(dataRoot,entry.name,"rules.json");
    if(!fs.existsSync(file))continue;
    const domainRules=read(file);
    if(!Array.isArray(domainRules))throw new Error(`${entry.name}/rules.json must be an array`);
    rules.push(...domainRules);
  }
  return rules.sort((a,b)=>a.id.localeCompare(b.id));
}

function createBundle({ruleSchema,severityPolicy,operatorRegistry,rules}){
  const versions=[ruleSchema.properties?.schemaVersion?.const,severityPolicy.schemaVersion,operatorRegistry.schemaVersion,severityPolicy.runtimeApiVersion,operatorRegistry.runtimeApiVersion];
  if(versions.some(version=>version!==runtimeApiVersion))throw new Error(`Rules bundle version mismatch: ${versions.join(", ")} vs runtime ${runtimeApiVersion}`);
  if(String(severityPolicy.scorePolicyVersion||"").split("-")[0]!==runtimeApiVersion)throw new Error(`Score policy version mismatch: ${severityPolicy.scorePolicyVersion} vs runtime ${runtimeApiVersion}`);
  if(!Array.isArray(rules))throw new Error("Rules bundle rules must be an array");
  return {bundleVersion:runtimeApiVersion,runtimeApiVersion,ruleSchemaVersion:versions[0],scorePolicyVersion:severityPolicy.scorePolicyVersion,ruleSchema,severityPolicy,operatorRegistry,rules};
}

function renderBundle(bundle){
  const json=stableStringify(bundle);
  return `"use strict";\n(function(root){\n  const value=${json};\n  const freeze=item=>{if(item&&typeof item==="object"&&!Object.isFrozen(item)){Object.values(item).forEach(freeze);Object.freeze(item)}return item};\n  const bundle=freeze(value);\n  if(typeof module!=="undefined"&&module.exports)module.exports=bundle;\n  if(root)root.NetEngineerLabRulesBundle=bundle;\n})(typeof window!=="undefined"?window:globalThis);\n`;
}

function buildRulesBundle({dataRoot=defaultDataRoot,outputRoot=defaultOutputRoot,write=true}={}){
  const bundle=createBundle({ruleSchema:read(path.join(dataRoot,"rule-schema.json")),severityPolicy:read(path.join(dataRoot,"severity-policy.json")),operatorRegistry:read(path.join(dataRoot,"operator-registry.json")),rules:loadRules(dataRoot)});
  const content=renderBundle(bundle);
  const hash=crypto.createHash("sha256").update(content,"utf8").digest("hex").slice(0,12);
  const fileName=`rules-bundle.${hash}.js`;
  if(write){
    fs.mkdirSync(outputRoot,{recursive:true});
    for(const name of fs.readdirSync(outputRoot))if(/^rules-bundle\.[a-f0-9]{12}\.js$/.test(name)&&name!==fileName)fs.rmSync(path.join(outputRoot,name));
    fs.writeFileSync(path.join(outputRoot,fileName),content);
  }
  return {bundle,content,hash,fileName,file:path.join(outputRoot,fileName)};
}

if(require.main===module){
  const validation=spawnSync(process.execPath,[path.join(__dirname,"engineering-rules-contract-test.js")],{stdio:"inherit"});
  if(validation.status!==0)process.exit(validation.status||1);
  const result=buildRulesBundle();
  console.log(JSON.stringify({file:path.relative(root,result.file).split(path.sep).join("/"),hash:result.hash,rules:result.bundle.rules.length,operators:result.bundle.operatorRegistry.operators.length},null,2));
}
module.exports={buildRulesBundle,createBundle,loadRules,renderBundle,runtimeApiVersion};
