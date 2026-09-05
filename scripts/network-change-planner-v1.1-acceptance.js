#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const files={
 en:path.join(root,"website/tools/network-change-planner-mop-generator/index.html"),
 zh:path.join(root,"website/tools/network-change-planner-mop-generator/zh/index.html"),
 app:path.join(root,"website/tools/network-change-planner-mop-generator/js/app.js"),
 css:path.join(root,"website/tools/network-change-planner-mop-generator/css/style.css")
};
for(const p of Object.values(files))assert(fs.existsSync(p),`missing ${p}`);
const en=fs.readFileSync(files.en,"utf8"),zh=fs.readFileSync(files.zh,"utf8"),app=fs.readFileSync(files.app,"utf8"),css=fs.readFileSync(files.css,"utf8");
for(const id of ["scenarioSelect","inputChecklist","riskReasons","resultExplanation","mopDocument","copyMop","downloadMop","printMop"]){assert(en.includes(`id="${id}"`),`EN missing ${id}`);assert(zh.includes(`id="${id}"`),`ZH missing ${id}`)}
assert(app.includes('const scenarios=['),"scenario library missing");
assert(app.includes('mopMarkdown'),"MOP formatter missing");
assert(app.includes('window.print()'),"print/PDF action missing");
assert(app.includes('riskText='),"risk explanation map missing");
assert(css.includes('@media print'),"print stylesheet missing");
assert(css.includes('@media(max-width:620px)'),"mobile optimization missing");
assert(en.includes('Representative engineering case')&&zh.includes('代表性工程案例'),"case UX localization missing");
assert(en.includes('Flagship V1.1')&&zh.includes('旗舰 V1.1'),"V1.1 scope copy missing");
console.log("Network Change Planner flagship V1.1 product-depth acceptance: PASS");
