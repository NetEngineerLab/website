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

const sharedSiteJs=fs.readFileSync(path.join(root,"website","assets","js","site.js"),"utf8");
assert.match(sharedSiteJs,/document\.addEventListener\("DOMContentLoaded",init/);
assert.doesNotMatch(sharedSiteJs,/window\.addEventListener\("load",init/);
assert.match(sharedSiteJs,/<h2>\$\{copy\.name\|\|tool\.id\}<\/h2>/);

const toolsCss=fs.readFileSync(path.join(root,"website","assets","css","site.css"),"utf8");
assert.match(toolsCss,/--muted:#53677f/);
assert.match(toolsCss,/\.filter\.active \.filter-count\{background:var\(--primary-dark\)/);
assert.match(toolsCss,/\.tool-card h2\{/);

const wifiApp=fs.readFileSync(path.join(root,"website","tools","wifi-coverage-capacity-planner","js","app.js"),"utf8");
for(const marker of ['setAttribute("role","tab")','setAttribute("role","tabpanel")','label.htmlFor=control.id']){
  assert.ok(wifiApp.includes(marker),`missing Wi-Fi accessibility marker: ${marker}`);
}
const wifiCss=fs.readFileSync(path.join(root,"website","tools","wifi-coverage-capacity-planner","css","style.css"),"utf8");
assert.match(wifiCss,/--muted:#526b82/);
assert.match(wifiCss,/\.eyebrow\{[^}]*color:#1d5f9f/);

const fiberCss=fs.readFileSync(path.join(root,"website","tools","fiber-loss","css","style.css"),"utf8");
for(const marker of [".tool-hero h1{font-size:28px",".brand img{width:36px;height:36px}",".input-panel,.result-panel{padding:16px 12px}"]){
  assert.ok(fiberCss.includes(marker),`missing fiber-loss mobile marker: ${marker}`);
}

for(const rel of ["website/tools/index.html","website/tools/zh/index.html","website/tools/wifi-coverage-capacity-planner/zh/index.html"]){
  const html=fs.readFileSync(path.join(root,rel),"utf8");
  assert.match(html,/<img alt=""[^>]*logo\.svg/);
  assert.match(html,/class="language-trigger"[^>]*aria-label="(?:Language: English|语言: 简体中文)"/);
}

console.log(`Production performance policy PASS (${policy.urls.length} pages x ${policy.numberOfRuns} runs; policy, median manifest, pass, regression, missing-audit, accessibility, CLS timing, and mobile-layout fixtures verified).`);
