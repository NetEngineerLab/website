#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");
const en=read("website/tools/network-change-planner-mop-generator/index.html");
const zh=read("website/tools/network-change-planner-mop-generator/zh/index.html");
const app=read("website/tools/network-change-planner-mop-generator/js/app.js");
const css=read("website/tools/network-change-planner-mop-generator/css/style.css");
for(const [name,html] of [["EN",en],["ZH",zh]]){
  for(const id of ["plannerStatus","inputChecklist","nextAction","riskCard","forwardSection","rollbackSection","runbookSection","verificationSection","verificationProgress","mopDocument"]){
    assert(html.includes(`id="${id}"`),`${name} missing UX landmark ${id}`);
  }
  assert((html.match(/class="mini-field"/g)||[]).length===4,`${name} must visibly label member/port inputs`);
  assert(html.includes("example-badge"),`${name} must disclose example data`);
  assert(html.includes("sample-warning"),`${name} must warn engineers to replace demo running config`);
  assert(html.includes("plan-nav"),`${name} must expose direct navigation to risk/rollback/runbook/verification`);
}
assert(app.includes('updateVerificationProgress'),"live verification evidence progress missing");
assert(app.includes('step2')&&app.includes('classList.add("complete")'),"guided step progression missing");
assert(app.includes('window.matchMedia("(max-width: 920px)")'),"mobile result handoff missing");
assert(app.includes('Example loaded')&&app.includes('已载入示例'),"example-state status copy missing");
assert(css.includes('.mini-field'),"member/port visual labels missing");
assert(css.includes('.next-action'),"next-action callout missing");
assert(css.includes('.plan-nav'),"plan section shortcuts missing");
assert(css.includes('.verification-progress'),"verification progress styling missing");
assert(css.includes('.sample-warning'),"example safety disclosure styling missing");
console.log("Network Change Planner V1.1 real-engineer UX audit acceptance: PASS");
