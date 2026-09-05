#!/usr/bin/env node
"use strict";
/** NetEngineerLab | Version: V2.1-Phase1 | Modified: 2026-09-05 16:25:00 | Purpose: Workflow/Tool Graph contract test. */
const fs=require("fs");const path=require("path");
const {loadWorkflowRegistry,validateWorkflowRegistry,deriveToolGraph,validateDerivedToolGraph}=require("./workflow-registry");
const {loadToolRegistry}=require("./tool-registry");
const root=path.resolve(__dirname,"..");const errors=[...validateWorkflowRegistry()];const graph=deriveToolGraph();errors.push(...validateDerivedToolGraph(graph));
const activeTools=loadToolRegistry().filter(t=>t.status==="active");
const generatedPath=path.join(root,"website/data/tool-graph.json");
if(!fs.existsSync(generatedPath))errors.push("generated tool-graph.json is missing");
else{
 const generated=JSON.parse(fs.readFileSync(generatedPath,"utf8"));
 if(JSON.stringify(generated)!==JSON.stringify(graph))errors.push("generated tool graph differs from canonical registries; run build:tool-graph");
}
const covered=new Set();for(const flow of loadWorkflowRegistry().filter(w=>w.status==="active"))for(const step of flow.steps)covered.add(step.toolId);
for(const tool of activeTools)if(!covered.has(tool.id))errors.push(`${tool.id}: missing workflow coverage`);
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log(`Workflow contract PASS (${loadWorkflowRegistry().filter(w=>w.status==="active").length} active workflows / ${activeTools.length}/${activeTools.length} active tools covered / generated graph exact)`);
