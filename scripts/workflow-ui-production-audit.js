#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: V2.1-Workflow-UI-Fix
 * Modified: 2026-09-06 12:50:00
 * Purpose: Production contract for Registry-driven Workflow UI across all bilingual tool pages.
 */
const fs=require("fs");
const path=require("path");
const {stableFileHash}=require("./stable-text-hash");
const {deriveToolGraph}=require("./workflow-registry");
const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const graph=deriveToolGraph();
const cssRel="assets/css/tool-workflow.css";
const cssPath=path.join(site,cssRel);
const errors=[];
if(!fs.existsSync(cssPath))errors.push("missing dedicated workflow stylesheet");
const css=fs.existsSync(cssPath)?fs.readFileSync(cssPath,"utf8"):"";
for(const selector of [".nel-workflow-context",".nel-tool-graph-nav",".nel-tool-graph-related",".nel-tool-graph-card",".nel-workflow-progress",".nel-workflow-chip"]){
 if(!css.includes(selector))errors.push(`workflow stylesheet missing ${selector}`);
}
const hash=fs.existsSync(cssPath)?stableFileHash(cssPath,12):"";
let pages=0;
for(const id of Object.keys(graph.tools)){
 for(const zh of [false,true]){
  pages++;
  const file=path.join(site,"tools",id,...(zh?["zh","index.html"]:["index.html"]));
  if(!fs.existsSync(file)){errors.push(`${id}/${zh?"zh":"en"}: missing page`);continue;}
  const html=fs.readFileSync(file,"utf8");
  const links=html.match(/<link\b[^>]*data-nel-workflow-style[^>]*>/gi)||[];
  if(links.length!==1)errors.push(`${id}/${zh?"zh":"en"}: workflow stylesheet link count ${links.length}`);
  else if(!links[0].includes(`/assets/css/tool-workflow.css?v=${hash}`))errors.push(`${id}/${zh?"zh":"en"}: stale workflow stylesheet hash`);
  for(const marker of ["nel-workflow-context","nel-tool-graph-nav","nel-tool-graph-card","nel-workflow-progress"]){
   if(!html.includes(marker))errors.push(`${id}/${zh?"zh":"en"}: missing ${marker}`);
  }
  if(/<section\b(?=[^>]*\bid=["']related["'])/i.test(html))errors.push(`${id}/${zh?"zh":"en"}: legacy related section remains`);
  const beforeGraph=html.split("<!-- NEL_TOOL_GRAPH_START -->")[0];
  if(/RELATED TOOLS|Related engineering tools|相关推荐工具|相关工程工具/i.test(beforeGraph))errors.push(`${id}/${zh?"zh":"en"}: legacy Related Tools copy remains before Workflow UI`);
  const relatedBlock=html.match(/<div class="nel-tool-graph-related">([\s\S]*?)<\/div>/i)?.[1]||"";
  if(/nel-tool-graph-label/.test(relatedBlock))errors.push(`${id}/${zh?"zh":"en"}: repeated Related label remains inside related cards`);
  if((html.match(/NEL_TOOL_GRAPH_START/g)||[]).length!==1)errors.push(`${id}/${zh?"zh":"en"}: workflow block is not singular`);
 }
}
if(errors.length){console.error(`Workflow UI production audit FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1);}
console.log(`Workflow UI production audit PASS (${pages} bilingual tool pages, CSS ${hash})`);
