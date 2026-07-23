#!/usr/bin/env node
"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const{buildReport,evaluateLhr,loadPolicy,validatePolicy}=require("./production-performance-report");

const root=path.resolve(__dirname,"..");
const policy=loadPolicy(path.join(root,"tests","lighthouse","production.lighthouserc.json"));
assert.deepEqual(validatePolicy(policy),[]);
assert.equal(policy.urls.length,4);
assert.equal(policy.numberOfRuns,3);

function fixture(){
  return{
    requestedUrl:"https://netengineerlab.com/",
    finalUrl:"https://netengineerlab.com/",
    categories:{
      performance:{score:0.92},
      accessibility:{score:0.98},
      "best-practices":{score:0.96},
      seo:{score:1}
    },
    audits:{
      "first-contentful-paint":{score:0.9,numericValue:1200},
      "largest-contentful-paint":{score:0.9,numericValue:2100},
      "cumulative-layout-shift":{score:1,numericValue:0.02},
      "total-blocking-time":{score:1,numericValue:80},
      "speed-index":{score:0.9,numericValue:1800},
      "errors-in-console":{score:1,details:{items:[]}},
      "is-on-https":{score:1},
      viewport:{score:1},
      "resource-summary":{details:{items:[
        {resourceType:"total",transferSize:120000},
        {resourceType:"script",transferSize:50000},
        {resourceType:"stylesheet",transferSize:20000},
        {resourceType:"image",transferSize:30000}
      ]}}
    }
  };
}

const passing=evaluateLhr(fixture(),policy.assertions);
assert.deepEqual(passing.errors,[]);

const failing=fixture();
failing.categories.performance.score=0.5;
failing.audits["largest-contentful-paint"].numericValue=6000;
failing.audits["cumulative-layout-shift"].numericValue=0.4;
failing.audits["resource-summary"].details.items.find(item=>item.resourceType==="total").transferSize=900000;
failing.audits["errors-in-console"].details.items.push({description:"fixture error"});
const rejected=evaluateLhr(failing,policy.assertions);
for(const expected of ["categories:performance","largest-contentful-paint","cumulative-layout-shift","resource-summary:total:size","errors-in-console"]){
  assert.ok(rejected.errors.some(error=>error.startsWith(`${expected}:`)),`expected failure for ${expected}`);
}

const missing=fixture();
delete missing.audits.viewport;
assert.ok(evaluateLhr(missing,policy.assertions).errors.some(error=>error.startsWith("viewport:")));

const fixtureDir=fs.mkdtempSync(path.join(os.tmpdir(),"nel-lighthouse-"));
try{
  const manifest=[];
  for(const[urlIndex,url]of policy.urls.entries()){
    for(let runIndex=0;runIndex<policy.numberOfRuns;runIndex+=1){
      const lhr=fixture();
      lhr.requestedUrl=url;
      lhr.finalUrl=url;
      lhr.fetchTime=`2026-07-23T00:0${urlIndex}:${runIndex}0.000Z`;
      lhr.lighthouseVersion="fixture";
      const jsonPath=path.join(fixtureDir,`page-${urlIndex}-run-${runIndex}.json`);
      fs.writeFileSync(jsonPath,JSON.stringify(lhr));
      manifest.push({url,isRepresentativeRun:runIndex===1,jsonPath});
    }
  }
  fs.writeFileSync(path.join(fixtureDir,"manifest.json"),JSON.stringify(manifest));
  const report=buildReport({
    configFile:path.join(root,"tests","lighthouse","production.lighthouserc.json"),
    inputDir:fixtureDir
  });
  assert.equal(report.status,"PASS");
  assert.equal(report.pages.length,policy.urls.length);
  assert.ok(report.pages.every(page=>page.runCount===policy.numberOfRuns));

  const representativePath=manifest.find(entry=>entry.url===policy.urls[0]&&entry.isRepresentativeRun).jsonPath;
  const regression=JSON.parse(fs.readFileSync(representativePath,"utf8"));
  regression.categories.performance.score=0.5;
  fs.writeFileSync(representativePath,JSON.stringify(regression));
  const failedReport=buildReport({
    configFile:path.join(root,"tests","lighthouse","production.lighthouserc.json"),
    inputDir:fixtureDir
  });
  assert.equal(failedReport.status,"FAIL");
  assert.ok(failedReport.errors.some(error=>error.includes("categories:performance")));
}finally{
  fs.rmSync(fixtureDir,{recursive:true,force:true});
}

console.log(`Production performance policy PASS (${policy.urls.length} pages x ${policy.numberOfRuns} runs; policy, median manifest, pass, regression, and missing-audit fixtures verified).`);
