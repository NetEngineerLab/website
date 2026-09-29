"use strict";

// The multilingual build owns sitemap generation. This legacy entry point is
// intentionally a thin delegate so manual runs and CI cannot drift apart.
const path=require("path");
const{execFileSync}=require("child_process");
const repositoryRoot=path.resolve(__dirname,"..","..");

execFileSync(process.execPath,[path.join(repositoryRoot,"scripts","build-multilingual.js")],{
  cwd:repositoryRoot,
  stdio:"inherit"
});
