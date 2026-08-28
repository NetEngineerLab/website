#!/usr/bin/env node
"use strict";

const path=require("path");
const {spawn}=require("child_process");

const root=path.resolve(__dirname,"..");
const preview=spawn(process.execPath,[path.join(root,"scripts","preview-server.js")],{
  cwd:root,
  env:{...process.env,HOST:"127.0.0.1",PORT:"4173"},
  stdio:["ignore","pipe","pipe"]
});

function waitForPreview(){
  return new Promise((resolve,reject)=>{
    let output="";
    const timer=setTimeout(()=>reject(new Error(`Preview startup timeout: ${output}`)),30000);
    preview.stdout.on("data",chunk=>{
      output+=chunk.toString();
      if(output.includes("http://127.0.0.1:4173/")){clearTimeout(timer);resolve()}
    });
    preview.stderr.on("data",chunk=>{output+=chunk.toString()});
    preview.once("exit",code=>{clearTimeout(timer);reject(new Error(`Preview exited before tests (${code}): ${output}`))});
  });
}

function stopPreview(){
  return new Promise(resolve=>{
    if(preview.exitCode!==null)return resolve();
    const timer=setTimeout(()=>{if(preview.exitCode===null)preview.kill("SIGKILL")},3000);
    preview.once("exit",()=>{clearTimeout(timer);resolve()});
    preview.kill("SIGTERM");
  });
}

(async()=>{
  let status=1;
  try{
    await waitForPreview();
    const cli=require.resolve("@playwright/test/cli");
    const runner=spawn(process.execPath,[cli,"test",...process.argv.slice(2)],{cwd:root,stdio:"inherit"});
    status=await new Promise(resolve=>runner.once("exit",code=>resolve(code??1)));
  }catch(error){
    console.error(error.message);
  }finally{
    await stopPreview();
  }
  process.exit(status);
})();
