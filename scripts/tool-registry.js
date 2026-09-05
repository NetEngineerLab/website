#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: V2.1-Phase1
 * Modified: 2026-09-05 16:05:00
 * Purpose: Canonical Tool Registry V2 loader and validation helpers.
 */
const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
function read(rel){return JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));}
function loadToolRegistry(){return read("src/registry/tool-registry.json");}
function loadRegistryConstants(){return read("src/registry/constants.json");}
function publicTool(tool){
 const {schemaVersion,domain,capabilities,maturity,routes,relationships,...legacy}=tool;
 return legacy;
}
function validateToolRegistry(tools=loadToolRegistry(),constants=loadRegistryConstants()){
 const errors=[];const ids=new Set();const orders=new Set();
 if(!Array.isArray(tools)||tools.length===0)return ["registry must contain tools"];
 for(const tool of tools){
  if(tool.schemaVersion!==constants.schemaVersion)errors.push(`${tool.id||"<unknown>"}: schemaVersion mismatch`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.id||""))errors.push(`${tool.id||"<unknown>"}: invalid id`);
  if(ids.has(tool.id))errors.push(`${tool.id}: duplicate id`);ids.add(tool.id);
  if(orders.has(tool.order))errors.push(`${tool.id}: duplicate order ${tool.order}`);orders.add(tool.order);
  if(!constants.status.includes(tool.status))errors.push(`${tool.id}: invalid status`);
  if(!constants.maturity.includes(tool.maturity))errors.push(`${tool.id}: invalid maturity`);
  if(!constants.domains.includes(tool.domain))errors.push(`${tool.id}: invalid domain`);
  if(!Array.isArray(tool.capabilities)||tool.capabilities.length===0)errors.push(`${tool.id}: capabilities required`);
  else for(const c of tool.capabilities)if(!constants.capabilities.includes(c))errors.push(`${tool.id}: invalid capability ${c}`);
  const expectedEn=`/tools/${tool.id}/`, expectedZh=`/tools/${tool.id}/zh/`;
  if(tool.routes?.en!==expectedEn)errors.push(`${tool.id}: EN route mismatch`);
  if(tool.routes?.["zh-CN"]!==expectedZh)errors.push(`${tool.id}: zh-CN route mismatch`);
  if(!tool.translations?.en?.name||!tool.translations?.zh?.name)errors.push(`${tool.id}: bilingual translations required`);
  for(const target of tool.relationships?.related||[])if(!ids.has(target)&&!tools.some(t=>t.id===target))errors.push(`${tool.id}: missing related target ${target}`);
 }
 return errors;
}
module.exports={loadToolRegistry,loadRegistryConstants,publicTool,validateToolRegistry};
if(require.main===module){const errors=validateToolRegistry();if(errors.length){console.error(errors.join("\n"));process.exit(1)}console.log(`Tool Registry V2 PASS (${loadToolRegistry().length} tools)`)}
