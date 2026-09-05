#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: V2.1-Phase1
 * Modified: 2026-09-05 16:25:00
 * Purpose: Workflow Registry V2 loader, validation and tool-graph derivation.
 */
const fs=require("fs");
const path=require("path");
const {loadToolRegistry,loadRegistryConstants}=require("./tool-registry");
const root=path.resolve(__dirname,"..");
function read(rel){return JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));}
function loadWorkflowRegistry(){return read("src/registry/workflow-registry.json");}
function loadWorkflowSchema(){return read("src/registry/workflow-schema.json");}
function validateWorkflowRegistry(workflows=loadWorkflowRegistry(),tools=loadToolRegistry(),constants=loadRegistryConstants()){
 const errors=[];const ids=new Set();const toolIds=new Set(tools.map(t=>t.id));const activeToolIds=new Set(tools.filter(t=>t.status==="active").map(t=>t.id));
 if(!Array.isArray(workflows)||!workflows.length)return ["workflow registry must contain workflows"];
 const coverage=new Map([...activeToolIds].map(id=>[id,0]));
 for(const flow of workflows){
  if(!flow||typeof flow!=="object"){errors.push("workflow entry must be an object");continue;}
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(flow.id||""))errors.push(`${flow.id||"<unknown>"}: invalid workflow id`);
  if(ids.has(flow.id))errors.push(`${flow.id}: duplicate workflow id`);ids.add(flow.id);
  if(flow.schemaVersion!==constants.schemaVersion)errors.push(`${flow.id}: schemaVersion mismatch`);
  if(!constants.status.includes(flow.status))errors.push(`${flow.id}: invalid status`);
  if(!constants.domains.includes(flow.domain))errors.push(`${flow.id}: invalid domain ${flow.domain}`);
  if(flow.primary!==true)errors.push(`${flow.id}: main workflow must declare primary=true`);
  if(!flow.translations?.en?.name||!flow.translations?.en?.description||!flow.translations?.zh?.name||!flow.translations?.zh?.description)errors.push(`${flow.id}: bilingual workflow copy required`);
  if(!Array.isArray(flow.steps)||flow.steps.length<2){errors.push(`${flow.id}: at least two steps required`);continue;}
  const orders=new Set();const stepTools=new Set();
  for(const step of flow.steps){
   if(!Number.isInteger(step.order)||step.order<1)errors.push(`${flow.id}: invalid step order`);
   if(orders.has(step.order))errors.push(`${flow.id}: duplicate step order ${step.order}`);orders.add(step.order);
   if(!toolIds.has(step.toolId))errors.push(`${flow.id}: missing tool ${step.toolId}`);
   else if(!activeToolIds.has(step.toolId))errors.push(`${flow.id}: workflow step must reference active tool ${step.toolId}`);
   else coverage.set(step.toolId,(coverage.get(step.toolId)||0)+1);
   if(stepTools.has(step.toolId))errors.push(`${flow.id}: duplicate tool step ${step.toolId}`);stepTools.add(step.toolId);
   if(!step.translations?.en?.action||!step.translations?.zh?.action)errors.push(`${flow.id}/${step.toolId}: bilingual step action required`);
  }
  const ordered=[...flow.steps].sort((a,b)=>a.order-b.order);
  ordered.forEach((step,index)=>{if(step.order!==index+1)errors.push(`${flow.id}: step orders must be contiguous from 1`);});
 }
 for(const [toolId,count] of coverage)if(count===0)errors.push(`${toolId}: active tool is not covered by any workflow`);
 return [...new Set(errors)];
}
function deriveToolGraph(workflows=loadWorkflowRegistry(),tools=loadToolRegistry()){
 const activeFlows=workflows.filter(w=>w.status==="active");
 const graph={schemaVersion:"2.1.0",generatedFrom:"Tool Registry V2 + Workflow Registry V2",tools:{},workflows:{}};
 for(const flow of activeFlows){
  const steps=[...flow.steps].sort((a,b)=>a.order-b.order);
  graph.workflows[flow.id]={id:flow.id,domain:flow.domain,translations:flow.translations,steps:steps.map(s=>({order:s.order,toolId:s.toolId,translations:s.translations}))};
 }
 for(const tool of tools.filter(t=>t.status==="active")){
  const memberships=[];
  for(const flow of activeFlows){
   const steps=[...flow.steps].sort((a,b)=>a.order-b.order);const index=steps.findIndex(s=>s.toolId===tool.id);
   if(index<0)continue;
   memberships.push({workflowId:flow.id,step:index+1,total:steps.length,previous:index>0?steps[index-1].toolId:null,next:index<steps.length-1?steps[index+1].toolId:null});
  }
  const primary=memberships[0]||null;
  graph.tools[tool.id]={
   id:tool.id,routes:tool.routes,translations:{en:{name:tool.translations.en.name,description:tool.translations.en.description},zh:{name:tool.translations.zh.name,description:tool.translations.zh.description}},
   related:[...(tool.relationships?.related||[])],workflows:memberships,primaryWorkflow:primary?.workflowId||null,previous:primary?.previous||null,next:primary?.next||null
  };
 }
 return graph;
}
function validateDerivedToolGraph(graph=deriveToolGraph(),tools=loadToolRegistry(),workflows=loadWorkflowRegistry()){
 const errors=[];const activeTools=tools.filter(t=>t.status==="active");const activeIds=new Set(activeTools.map(t=>t.id));const activeFlowIds=new Set(workflows.filter(w=>w.status==="active").map(w=>w.id));
 if(graph.schemaVersion!=="2.1.0")errors.push("tool graph schemaVersion mismatch");
 if(Object.keys(graph.tools||{}).length!==activeTools.length)errors.push(`tool graph tool count mismatch: ${Object.keys(graph.tools||{}).length} != ${activeTools.length}`);
 if(Object.keys(graph.workflows||{}).length!==activeFlowIds.size)errors.push(`tool graph workflow count mismatch: ${Object.keys(graph.workflows||{}).length} != ${activeFlowIds.size}`);
 for(const tool of activeTools){
  const node=graph.tools?.[tool.id];
  if(!node){errors.push(`${tool.id}: missing tool graph node`);continue;}
  if(node.routes?.en!==tool.routes?.en||node.routes?.["zh-CN"]!==tool.routes?.["zh-CN"])errors.push(`${tool.id}: graph routes differ from Tool Registry`);
  const related=node.related||[];const seen=new Set();
  for(const target of related){
   if(target===tool.id)errors.push(`${tool.id}: related target cannot reference itself`);
   if(seen.has(target))errors.push(`${tool.id}: duplicate related target ${target}`);seen.add(target);
   if(!activeIds.has(target))errors.push(`${tool.id}: related target is not active ${target}`);
  }
  if(!Array.isArray(node.workflows)||node.workflows.length===0)errors.push(`${tool.id}: graph has no workflow membership`);
  if(node.primaryWorkflow&&!activeFlowIds.has(node.primaryWorkflow))errors.push(`${tool.id}: invalid primary workflow ${node.primaryWorkflow}`);
  for(const membership of node.workflows||[]){
   if(!activeFlowIds.has(membership.workflowId))errors.push(`${tool.id}: invalid workflow membership ${membership.workflowId}`);
   for(const [kind,target] of [["previous",membership.previous],["next",membership.next]])if(target&&!activeIds.has(target))errors.push(`${tool.id}: ${kind} points to inactive/missing tool ${target}`);
  }
  for(const [kind,target] of [["previous",node.previous],["next",node.next]])if(target&&!activeIds.has(target))errors.push(`${tool.id}: primary ${kind} points to inactive/missing tool ${target}`);
 }
 return [...new Set(errors)];
}
module.exports={loadWorkflowRegistry,loadWorkflowSchema,validateWorkflowRegistry,deriveToolGraph,validateDerivedToolGraph};
if(require.main===module){const errors=[...validateWorkflowRegistry(),...validateDerivedToolGraph()];if(errors.length){console.error(errors.join("\n"));process.exit(1)}console.log(`Workflow Registry V2 PASS (${loadWorkflowRegistry().length} workflows; full active-tool coverage)`);}
