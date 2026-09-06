#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=process.cwd();
const appPath=path.join(root,"website/tools/network-change-planner-mop-generator/js/app.js");
const htmlPath=path.join(root,"website/tools/network-change-planner-mop-generator/index.html");
const app=fs.readFileSync(appPath,"utf8");
const html=fs.readFileSync(htmlPath,"utf8");
const required=[
 "change_planner_view",
 "change_planner_case_load",
 "change_planner_sample_load",
 "change_planner_plan",
 "change_planner_section",
 "change_planner_export",
 "change_planner_verify",
 "change_planner_funnel"
];
const steps=[
 "tool_opened","case_loaded","input_ready","plan_built","risk_reviewed",
 "rollback_viewed","mop_viewed","mop_used","verification_started",
 "verification_evidence_complete","verification_decided"
];
const errors=[];
for(const event of required)if(!app.includes(`"${event}"`))errors.push(`missing analytics event ${event}`);
for(const step of steps)if(!app.includes(`"${step}"`))errors.push(`missing funnel step ${step}`);
for(const marker of ["copy_forward","copy_rollback","copy_mop","download_markdown","print_pdf"])if(!app.includes(`"${marker}"`))errors.push(`missing export action ${marker}`);
for(const id of ["planBtn","copyRollback","copyMop","downloadMop","printMop","verifyBtn"])if(!html.includes(`id="${id}"`))errors.push(`missing tracked UI target ${id}`);
// Privacy contract: analytics payload objects must not include raw config/output/MOP text fields.
const payloads=[...app.matchAll(/track\("change_planner_[^"]+",\{([^}]*)\}\)/g)].map(m=>m[1]);
const forbidden=["runningConfig:","configuration:","command:","output:","mop:","description:","interface:"];
for(const payload of payloads){for(const token of forbidden){if(payload.includes(token))errors.push(`privacy violation in analytics payload: ${token}`)}}
if(payloads.length<10)errors.push(`expected at least 10 analytics payload calls, found ${payloads.length}`);
if(!app.includes('tool:"network_change_planner"'))errors.push("missing stable tool analytics dimension");
if(!app.includes('locale:zh?"zh":"en"'))errors.push("missing locale analytics dimension");
if(errors.length){console.error("Network Change Planner analytics acceptance: FAIL");for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log("Network Change Planner analytics acceptance: PASS");
console.log(`Events: ${required.length}; funnel steps: ${steps.length}; privacy payload contract: PASS`);
