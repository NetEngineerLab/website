#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,"..");
const tools=JSON.parse(fs.readFileSync(path.join(root,"src/registry/tool-registry.json"),"utf8")).filter(t=>t.status==="active");
const jobs=JSON.parse(fs.readFileSync(path.join(root,"src/registry/job-registry.json"),"utf8")).jobs;
const jobByTool={};
for(const job of jobs) for(const id of job.toolIds) (jobByTool[id]||(jobByTool[id]=[])).push(job.id);
function level(t){
  if((t.capabilities||[]).some(x=>["plan","design"].includes(x))) return "planner";
  if((t.capabilities||[]).some(x=>["analyze","troubleshoot"].includes(x))) return "analyzer";
  return "calculator";
}
const output={schemaVersion:"2.4.0",tools:{}};
for(const t of tools) output.tools[t.id]={id:t.id,toolLevel:level(t),supportedJobs:jobByTool[t.id]||[],nextTools:(t.relationships?.related||[]).slice(0,3),inputContext:[],outputContext:[]};
fs.writeFileSync(path.join(root,"website/data/v24-tool-metadata.json"),JSON.stringify(output,null,2)+"\n");
console.log(`V2.4 metadata generated (${tools.length} tools; ${jobs.length} jobs)`);
