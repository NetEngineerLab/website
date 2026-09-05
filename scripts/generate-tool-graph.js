#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: V2.1-Phase1
 * Modified: 2026-09-05 16:25:00
 * Purpose: Generate browser-consumable workflow/tool graph data.
 */
const fs=require("fs");const path=require("path");
const {loadWorkflowRegistry,validateWorkflowRegistry,deriveToolGraph}=require("./workflow-registry");
const root=path.resolve(__dirname,"..");const errors=validateWorkflowRegistry();
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
const graph=deriveToolGraph();
const json=JSON.stringify(graph,null,2)+"\n";
fs.writeFileSync(path.join(root,"website/data/tool-graph.json"),json,"utf8");
fs.writeFileSync(path.join(root,"website/data/tool-graph.js"),`window.NEL_TOOL_GRAPH=${JSON.stringify(graph)};\nwindow.dispatchEvent(new Event("nel:tool-graph-ready"));\n`,"utf8");
console.log(`Generated tool graph: ${Object.keys(graph.tools).length} tools / ${loadWorkflowRegistry().length} workflows`);
