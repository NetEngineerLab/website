#!/usr/bin/env node
"use strict";
const fs=require("fs");const path=require("path");const {deriveToolGraph}=require("./workflow-registry");
const root=path.resolve(__dirname,".."),site=path.join(root,"website"),graph=deriveToolGraph();const errors=[];let pages=0;
for(const id of Object.keys(graph.tools))for(const zh of [false,true]){
 const file=path.join(site,"tools",id,...(zh?["zh","index.html"]:["index.html"]));pages++;
 if(!fs.existsSync(file)){errors.push(`${id}: missing ${zh?"zh":"en"} page`);continue;}
 const html=fs.readFileSync(file,"utf8");
 if((html.match(/NEL_TOOL_GRAPH_START/g)||[]).length!==1||(html.match(/NEL_TOOL_GRAPH_END/g)||[]).length!==1)errors.push(`${id}/${zh?"zh":"en"}: tool graph block count invalid`);
 if(!html.includes(`data-tool-id="${id}"`))errors.push(`${id}/${zh?"zh":"en"}: tool graph data id missing`);
 if(/<section\b(?=[^>]*\bid=["']related["'])/i.test(html))errors.push(`${id}/${zh?"zh":"en"}: legacy related section remains`);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}console.log(`Tool navigation contract PASS (${pages} bilingual pages)`);
