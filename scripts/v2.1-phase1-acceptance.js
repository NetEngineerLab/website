#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: V2.1-Phase1
 * Modified: 2026-09-05 16:25:00
 * Purpose: Final V2.1 Phase1 canonical-source and foundation acceptance gate.
 */
const fs=require("fs");const path=require("path");
const {loadToolRegistry,validateToolRegistry,publicTool}=require("./tool-registry");
const {loadWorkflowRegistry,validateWorkflowRegistry,deriveToolGraph,validateDerivedToolGraph}=require("./workflow-registry");
const root=path.resolve(__dirname,".."),site=path.join(root,"website");const errors=[];
function read(rel){return fs.readFileSync(path.join(root,rel),"utf8");}
function json(rel){return JSON.parse(read(rel));}
const tools=loadToolRegistry(),activeTools=tools.filter(t=>t.status==="active"),workflows=loadWorkflowRegistry().filter(w=>w.status==="active"),graph=deriveToolGraph();
errors.push(...validateToolRegistry(tools),...validateWorkflowRegistry(),...validateDerivedToolGraph(graph));
const expectedCatalog=tools.map(publicTool).sort((a,b)=>a.order-b.order);const generatedCatalog=json("website/data/tools-catalog.json");
if(JSON.stringify(generatedCatalog)!==JSON.stringify(expectedCatalog))errors.push("tools-catalog.json is not an exact Tool Registry V2 projection");
const generatedGraph=json("website/data/tool-graph.json");if(JSON.stringify(generatedGraph)!==JSON.stringify(graph))errors.push("tool-graph.json is not an exact Registry-derived graph");
const siteJs=read("website/assets/js/site.js");
if(!siteJs.includes("window.NEL_TOOLS"))errors.push("site search/directory runtime does not consume generated tools catalog");
if(!siteJs.includes("[data-tool-count]"))errors.push("tool-count runtime is not catalog-driven");
const home=read("website/index.html"),toolsDir=read("website/tools/index.html");
for(const [label,html] of [["home",home],["tools directory",toolsDir]])if(!html.includes("tools-catalog.js?v="))errors.push(`${label}: generated tools catalog asset missing`);
const sitemap=read("website/sitemap.xml");const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);const locSet=new Set(locs);const siteUrl=json("website/data/locales.json").siteUrl.replace(/\/$/,"");
for(const tool of activeTools){for(const route of [tool.routes.en,tool.routes["zh-CN"]]){const url=siteUrl+route;if(!locSet.has(url))errors.push(`${tool.id}: sitemap missing ${url}`);}}
if(locs.length!==locSet.size)errors.push("sitemap contains duplicate URLs");
let navPages=0;
for(const tool of activeTools)for(const locale of ["en","zh"]){const rel=locale==="en"?`website/tools/${tool.id}/index.html`:`website/tools/${tool.id}/zh/index.html`;if(!fs.existsSync(path.join(root,rel))){errors.push(`${tool.id}/${locale}: production page missing`);continue;}const html=read(rel);navPages++;if((html.match(/NEL_TOOL_GRAPH_START/g)||[]).length!==1||(html.match(/NEL_TOOL_GRAPH_END/g)||[]).length!==1)errors.push(`${tool.id}/${locale}: registry navigation block must occur exactly once`);if(!html.includes(`data-tool-id="${tool.id}"`))errors.push(`${tool.id}/${locale}: registry navigation tool id missing`);if(/<section\b(?=[^>]*\bid=["']related["'])/i.test(html))errors.push(`${tool.id}/${locale}: legacy related section remains`);}
const expectedActiveCount=activeTools.length;
const staleCountPatterns=[/\b20\s+(?:Production\s+)?tools\b/ig,/\b20\s+已上线/g];
for(const rel of ["website/index.html","website/tools/index.html","website/zh/index.html","website/tools/zh/index.html"]){const html=read(rel);for(const re of staleCountPatterns)if(re.test(html))errors.push(`${rel}: stale hard-coded 20-tool copy remains`);}
const result={version:"V2.1-Phase1",status:errors.length?"FAIL":"PASS",registeredTools:tools.length,activeTools:expectedActiveCount,activeWorkflows:workflows.length,workflowCoverage:Object.keys(graph.tools).filter(id=>graph.tools[id].workflows.length>0).length,toolGraphPages:navPages,sitemapUrls:locs.length,canonicalToolSource:"src/registry/tool-registry.json",canonicalWorkflowSource:"src/registry/workflow-registry.json",generatedCatalog:"website/data/tools-catalog.json",generatedToolGraph:"website/data/tool-graph.json",errors};
fs.writeFileSync(path.join(root,"docs/V2.1_PHASE1_ACCEPTANCE_REPORT.json"),JSON.stringify(result,null,2)+"\n","utf8");
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log(`V2.1 Phase1 Acceptance PASS (${expectedActiveCount} tools / ${workflows.length} workflows / ${navPages} bilingual tool pages / ${locs.length} sitemap URLs)`);
