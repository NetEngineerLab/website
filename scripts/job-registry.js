#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,"..");
const jobs=JSON.parse(fs.readFileSync(path.join(root,"src/registry/job-registry.json"),"utf8"));
const tools=JSON.parse(fs.readFileSync(path.join(root,"src/registry/tool-registry.json"),"utf8"));
const ids=new Set(tools.filter(t=>t.status==="active").map(t=>t.id));
const jobIds=new Set((jobs.jobs||[]).map(j=>j.id));
const errors=[];
if(jobs.schemaVersion!=="2.4.0")errors.push("schemaVersion must be 2.4.0");
if(!Array.isArray(jobs.jobs)||jobs.jobs.length<5)errors.push("at least five jobs required");
for(const job of jobs.jobs||[]){
  if(!/^[a-z0-9-]+$/.test(job.id||""))errors.push(`${job.id||"<unknown>"}: invalid id`);
  if(!Array.isArray(job.toolIds)||job.toolIds.length<2)errors.push(`${job.id}: at least two tools required`);
  for(const id of job.toolIds||[])if(!ids.has(id))errors.push(`${job.id}: inactive or missing tool ${id}`);
  if(!Array.isArray(job.deliverables)||job.deliverables.length===0)errors.push(`${job.id}: deliverables required`);
  if(job.nextStep!==null&&!jobIds.has(job.nextStep))errors.push(`${job.id}: nextStep must reference an existing job or be null`);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log(`Job Registry V2.4 PASS (${jobs.jobs.length} jobs; ${new Set(jobs.jobs.flatMap(j=>j.toolIds)).size} tools referenced)`);
