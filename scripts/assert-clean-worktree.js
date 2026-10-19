#!/usr/bin/env node
"use strict";

const {execFileSync}=require("child_process");

const output=execFileSync("git",["status","--porcelain"],{encoding:"utf8"});
if(output.trim()){
 console.error("The worktree is dirty. A production build must leave tracked files unchanged.");
 console.error(output.trimEnd());
 process.exit(1);
}
console.log("Worktree clean.");
