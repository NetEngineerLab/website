#!/usr/bin/env node
"use strict";
const fs=require("fs");
const path=require("path");
const assert=require("assert/strict");
const {loadToolRegistry,publicTool,validateToolRegistry}=require("./tool-registry");
const root=path.resolve(__dirname,"..");
const tools=loadToolRegistry();
assert.deepEqual(validateToolRegistry(tools),[]);
assert.ok(tools.length>=21,"Tool Registry must retain the original 21-tool Phase1 baseline");
assert.equal(tools.filter(t=>t.status==="active").length,22,"Current production baseline must expose 22 active tools");
for(const tool of tools){
 assert.ok(fs.existsSync(path.join(root,`website/tools/${tool.id}/index.html`)),`${tool.id}: EN page missing`);
 assert.ok(fs.existsSync(path.join(root,`website/tools/${tool.id}/zh/index.html`)),`${tool.id}: zh page missing`);
}
const generated=JSON.parse(fs.readFileSync(path.join(root,"website/data/tools-catalog.json"),"utf8"));
assert.deepEqual(generated,tools.map(publicTool).sort((a,b)=>a.order-b.order));
for(const rel of ["website/index.html","website/zh/index.html"]){
 const html=fs.readFileSync(path.join(root,rel),"utf8");
 assert.match(html,/data-tool-count/,`${rel}: home tool count must be registry-driven`);
}
console.log("Tool Registry V2 contract PASS");
