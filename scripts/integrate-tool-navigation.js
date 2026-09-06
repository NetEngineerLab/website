#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: V2.1-Phase1
 * Modified: 2026-09-05 16:32:00
 * Purpose: Build-time Previous / Next / Related Tools and Workflow context integration.
 */
const fs=require("fs");const path=require("path");
const {stableFileHash}=require("./stable-text-hash");
const {deriveToolGraph,validateWorkflowRegistry}=require("./workflow-registry");
const root=path.resolve(__dirname,"..");const site=path.join(root,"website");
const errors=validateWorkflowRegistry();if(errors.length){console.error(errors.join("\n"));process.exit(1)}
const graph=deriveToolGraph();
const START="<!-- NEL_TOOL_GRAPH_START -->",END="<!-- NEL_TOOL_GRAPH_END -->";
const WORKFLOW_CSS="/assets/css/tool-workflow.css";
const workflowCssHash=stableFileHash(path.join(site,"assets","css","tool-workflow.css"),12);
function esc(v){return String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function href(toolId,zh){const item=graph.tools[toolId];return item?item.routes[zh?"zh-CN":"en"]:"#";}
function copy(toolId,zh){const item=graph.tools[toolId];return item?.translations?.[zh?"zh":"en"]||{};}
function workflowCopy(id,zh){return graph.workflows[id]?.translations?.[zh?"zh":"en"]||{};}
function card(toolId,zh,label){const c=copy(toolId,zh);return `<a class="nel-tool-graph-card" href="${esc(href(toolId,zh))}">${label?`<span class="nel-tool-graph-label">${esc(label)}</span>`:""}<strong>${esc(c.name||toolId)}</strong><span class="nel-tool-graph-description">${esc(c.description||"")}</span></a>`;}
function markup(toolId,zh){
 const node=graph.tools[toolId];if(!node)return "";
 const primary=node.workflows.find(w=>w.workflowId===node.primaryWorkflow)||node.workflows[0]||null;
 const labels=zh?{
  eyebrow:"工程工作流",title:"继续下一步工程任务",position:"当前流程",step:"步骤",of:"/",previous:"上一步",next:"下一步",related:"相关工具",workflows:"同时用于",start:"流程起点",complete:"流程终点",none:"暂无"
 }:{
  eyebrow:"ENGINEERING WORKFLOW",title:"Continue the engineering workflow",position:"Current workflow",step:"Step",of:"of",previous:"Previous",next:"Next",related:"Related tools",workflows:"Also used in",start:"Workflow start",complete:"Workflow complete",none:"None"
 };
 const flow=primary?workflowCopy(primary.workflowId,zh):null;
 const progress=primary?Math.round(primary.step/primary.total*100):0;
 const memberships=node.workflows.filter(m=>m.workflowId!==primary?.workflowId).map(m=>`<span class="nel-workflow-chip">${esc(workflowCopy(m.workflowId,zh).name||m.workflowId)}</span>`).join("");
 const navCards=[];
 if(primary?.previous)navCards.push(card(primary.previous,zh,labels.previous));
 else navCards.push(`<div class="nel-tool-graph-card is-muted"><span class="nel-tool-graph-label">${esc(labels.previous)}</span><strong>${esc(labels.start)}</strong></div>`);
 if(primary?.next)navCards.push(card(primary.next,zh,labels.next));
 else navCards.push(`<div class="nel-tool-graph-card is-muted"><span class="nel-tool-graph-label">${esc(labels.next)}</span><strong>${esc(labels.complete)}</strong></div>`);
 const related=(node.related||[]).filter(id=>graph.tools[id]).slice(0,4).map(id=>card(id,zh,"")).join("");
 return `${START}\n<section class="content-section nel-tool-graph" id="nel-tool-graph" aria-labelledby="nel-tool-graph-title" data-tool-id="${esc(toolId)}" data-primary-workflow="${esc(primary?.workflowId||"")}">\n`+
 `<div class="section-heading"><div><p class="eyebrow">${esc(labels.eyebrow)}</p><h2 id="nel-tool-graph-title">${esc(labels.title)}</h2></div></div>\n`+
 (primary?`<div class="nel-workflow-context"><div><span class="nel-workflow-kicker">${esc(labels.position)}</span><strong>${esc(flow?.name||primary.workflowId)}</strong><p>${esc(flow?.description||"")}</p></div><div class="nel-workflow-step"><strong>${esc(labels.step)} ${primary.step} ${esc(labels.of)} ${primary.total}</strong><div class="nel-workflow-progress" aria-label="${esc(labels.step)} ${primary.step} ${esc(labels.of)} ${primary.total}"><span style="width:${progress}%"></span></div></div></div>`:"")+
 `<div class="nel-tool-graph-nav">${navCards.join("")}</div>\n`+
 (related?`<h3 class="nel-tool-graph-subtitle">${esc(labels.related)}</h3><div class="nel-tool-graph-related">${related}</div>`:"")+
 (memberships?`<div class="nel-workflow-memberships"><span class="nel-workflow-memberships-label">${esc(labels.workflows)}</span>${memberships}</div>`:"")+`\n</section>\n${END}`;
}
function removeLegacyRelatedSections(fragment){
 return fragment.replace(/<section\b[^>]*>[\s\S]*?<\/section>\s*/gi,section=>{
  const legacyId=/\bid=["']related["']/i.test(section);
  const legacyHeading=/(?:>\s*RELATED TOOLS\s*<|>\s*Related engineering tools\s*<|>\s*相关推荐工具\s*<|>\s*相关工程工具\s*<)/i.test(section);
  return legacyId||legacyHeading?"":section;
 });
}
function replaceBlock(html,block){
 const startIndex=html.indexOf(START);
 if(startIndex>=0){
  const prefix=removeLegacyRelatedSections(html.slice(0,startIndex));
  html=prefix+html.slice(startIndex);
 }else html=removeLegacyRelatedSections(html);
 if(html.includes(START)&&html.includes(END))return html.replace(new RegExp(`${START}[\\s\\S]*?${END}`),block);
 const marker="<!-- NEL_FOOTER_START -->";
 if(html.includes(marker))return html.replace(marker,`${block}\n${marker}`);
 return html.replace(/<footer\b/i,`${block}\n<footer`);
}

let changed=0,checked=0;
for(const toolId of Object.keys(graph.tools)){
 for(const zh of [false,true]){
  const file=path.join(site,"tools",toolId,...(zh?["zh","index.html"]:["index.html"]));
  if(!fs.existsSync(file)){console.error(`Missing tool page: ${path.relative(root,file)}`);process.exit(1)}
  checked++;
  const before=fs.readFileSync(file,"utf8");
  let after=replaceBlock(before,markup(toolId,zh));
  const workflowLink=`<link rel="stylesheet" href="${WORKFLOW_CSS}?v=${workflowCssHash}" data-nel-workflow-style>`;
  if(/<link\b[^>]*data-nel-workflow-style[^>]*>/i.test(after))after=after.replace(/<link\b[^>]*data-nel-workflow-style[^>]*>/i,workflowLink);
  else if(/<\/head>/i.test(after))after=after.replace(/<\/head>/i,`${workflowLink}\n</head>`);
  if(after!==before){fs.writeFileSync(file,after,"utf8");changed++;}
 }
}
console.log(`Tool navigation integration PASS (${checked} pages, ${changed} updated)`);
