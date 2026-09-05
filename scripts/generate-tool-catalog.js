#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: V2.1-Phase1
 * Modified: 2026-09-05 16:05:00
 * Purpose: Generate production tool catalog from canonical Tool Registry V2.
 */
const fs=require("fs");
const path=require("path");
const {loadToolRegistry,publicTool,validateToolRegistry}=require("./tool-registry");
const root=path.resolve(__dirname,"..");
const tools=loadToolRegistry();
const errors=validateToolRegistry(tools);
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
const publicCatalog=tools.map(publicTool).sort((a,b)=>a.order-b.order);
fs.writeFileSync(path.join(root,"website/data/tools-catalog.json"),JSON.stringify(publicCatalog,null,2)+"\n","utf8");
fs.writeFileSync(path.join(root,"website/data/tools-catalog.js"),`window.NEL_TOOLS=${JSON.stringify(publicCatalog)};\nwindow.dispatchEvent(new Event("nel:tools-ready"));\n`,"utf8");
console.log(`Generated tools-catalog from Tool Registry V2: ${publicCatalog.length} tools`);
