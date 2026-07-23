#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");

const root=path.resolve(__dirname,"..");
const version=fs.readFileSync(path.join(root,"VERSION"),"utf8").trim();
const defaultConfig=path.join(root,"tests","lighthouse","production.lighthouserc.json");
const defaultInput=path.join(root,"artifacts","lighthouse");
const reportFile=path.join(root,"docs","PRODUCTION_PERFORMANCE_REPORT.json");

function parseArg(name,fallback){
  const prefix=`--${name}=`;
  return process.argv.slice(2).find(value=>value.startsWith(prefix))?.slice(prefix.length)||fallback;
}
function readJson(file){return JSON.parse(fs.readFileSync(file,"utf8"))}
function round(value,digits=0){
  if(!Number.isFinite(value))return null;
  const scale=10**digits;
  return Math.round(value*scale)/scale;
}
function ruleParts(raw){
  if(typeof raw==="string")return{level:raw,options:{}};
  if(Array.isArray(raw))return{level:raw[0],options:raw[1]||{}};
  return{level:"off",options:{}};
}
function assertionValue(lhr,id,options){
  if(id.startsWith("categories:"))return lhr.categories?.[id.slice(11)]?.score;
  const resource=id.match(/^resource-summary:([^:]+):size$/);
  if(resource){
    const item=lhr.audits?.["resource-summary"]?.details?.items?.find(entry=>entry.resourceType===resource[1]);
    return item?.transferSize;
  }
  const audit=lhr.audits?.[id];
  if(!audit)return null;
  if(Object.hasOwn(options,"maxLength"))return Array.isArray(audit.details?.items)?audit.details.items.length:0;
  if(Object.hasOwn(options,"maxNumericValue"))return audit.numericValue;
  return audit.score;
}
function describeExpectation(options){
  if(Object.hasOwn(options,"minScore"))return`>= ${options.minScore}`;
  if(Object.hasOwn(options,"maxNumericValue"))return`<= ${options.maxNumericValue}`;
  if(Object.hasOwn(options,"maxLength"))return`length <= ${options.maxLength}`;
  return"score = 1";
}
function evaluateLhr(lhr,assertions){
  const errors=[];
  const warnings=[];
  const results=[];
  for(const[id,raw]of Object.entries(assertions)){
    const{level,options}=ruleParts(raw);
    if(level==="off")continue;
    const actual=assertionValue(lhr,id,options);
    let passed=actual!==null&&actual!==undefined;
    if(passed&&Object.hasOwn(options,"minScore"))passed=actual>=options.minScore;
    else if(passed&&Object.hasOwn(options,"maxNumericValue"))passed=actual<=options.maxNumericValue;
    else if(passed&&Object.hasOwn(options,"maxLength"))passed=actual<=options.maxLength;
    else if(passed)passed=actual===1;
    const result={id,level,actual:round(actual,3),expected:describeExpectation(options),passed};
    results.push(result);
    if(!passed){
      const message=`${id}: ${actual===null||actual===undefined?"missing":round(actual,3)} (expected ${result.expected})`;
      (level==="error"?errors:warnings).push(message);
    }
  }
  return{results,errors,warnings};
}
function pageSummary(lhr,runCount,assertions){
  const evaluation=evaluateLhr(lhr,assertions);
  const audit=id=>lhr.audits?.[id]?.numericValue;
  const resource=type=>lhr.audits?.["resource-summary"]?.details?.items?.find(item=>item.resourceType===type)?.transferSize;
  return{
    url:lhr.finalUrl||lhr.requestedUrl,
    runCount,
    lighthouseVersion:lhr.lighthouseVersion||"unknown",
    fetchTime:lhr.fetchTime||null,
    scores:{
      performance:round((lhr.categories?.performance?.score||0)*100),
      accessibility:round((lhr.categories?.accessibility?.score||0)*100),
      bestPractices:round((lhr.categories?.["best-practices"]?.score||0)*100),
      seo:round((lhr.categories?.seo?.score||0)*100)
    },
    metrics:{
      firstContentfulPaintMs:round(audit("first-contentful-paint")),
      largestContentfulPaintMs:round(audit("largest-contentful-paint")),
      cumulativeLayoutShift:round(audit("cumulative-layout-shift"),3),
      totalBlockingTimeMs:round(audit("total-blocking-time")),
      speedIndexMs:round(audit("speed-index"))
    },
    transferBytes:{
      total:round(resource("total")),
      script:round(resource("script")),
      stylesheet:round(resource("stylesheet")),
      image:round(resource("image"))
    },
    assertions:evaluation.results,
    errors:evaluation.errors,
    warnings:evaluation.warnings,
    status:evaluation.errors.length?"FAIL":"PASS"
  };
}
function normalizeUrl(value){
  const url=new URL(value);
  url.hash="";
  url.search="";
  return url.href;
}
function selectManifestEntries(manifest){
  const groups=new Map();
  for(const entry of manifest){
    const key=normalizeUrl(entry.url);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(entry);
  }
  return[...groups.entries()].map(([url,entries])=>({
    url,
    runCount:entries.length,
    entry:entries.find(item=>item.isRepresentativeRun)||entries[Math.floor(entries.length/2)]
  }));
}
function resolveJsonPath(inputDir,value){return path.isAbsolute(value)?value:path.resolve(inputDir,value)}
function loadPolicy(configFile=defaultConfig){
  const config=readJson(configFile);
  return{
    config,
    urls:config.ci?.collect?.url||[],
    numberOfRuns:config.ci?.collect?.numberOfRuns||0,
    assertions:config.ci?.assert?.assertions||{}
  };
}
function validatePolicy(policy){
  const errors=[];
  if(policy.urls.length!==4)errors.push(`expected 4 representative URLs, got ${policy.urls.length}`);
  if(new Set(policy.urls.map(normalizeUrl)).size!==policy.urls.length)errors.push("representative URLs must be unique");
  if(!policy.urls.every(url=>url.startsWith("https://netengineerlab.com/")))errors.push("all performance URLs must use the production origin");
  if(policy.numberOfRuns<3)errors.push("numberOfRuns must be at least 3");
  for(const id of ["categories:performance","categories:accessibility","categories:best-practices","categories:seo","largest-contentful-paint","cumulative-layout-shift","total-blocking-time","resource-summary:total:size","errors-in-console"]){
    if(!Object.hasOwn(policy.assertions,id))errors.push(`required performance assertion missing: ${id}`);
  }
  return errors;
}
function buildReport({configFile=defaultConfig,inputDir=defaultInput}={}){
  const policy=loadPolicy(configFile);
  const errors=validatePolicy(policy);
  const warnings=[];
  const pages=[];
  const manifestFile=path.join(inputDir,"manifest.json");
  if(!fs.existsSync(manifestFile))errors.push(`Lighthouse manifest missing: ${path.relative(root,manifestFile)}`);
  else{
    const selected=selectManifestEntries(readJson(manifestFile));
    const selectedByUrl=new Map(selected.map(item=>[normalizeUrl(item.url),item]));
    for(const expectedUrl of policy.urls){
      const selectedRun=selectedByUrl.get(normalizeUrl(expectedUrl));
      if(!selectedRun){errors.push(`${expectedUrl}: representative Lighthouse run missing`);continue}
      if(selectedRun.runCount<policy.numberOfRuns)errors.push(`${expectedUrl}: expected ${policy.numberOfRuns} runs, got ${selectedRun.runCount}`);
      try{
        const lhr=readJson(resolveJsonPath(inputDir,selectedRun.entry.jsonPath));
        const page=pageSummary(lhr,selectedRun.runCount,policy.assertions);
        pages.push(page);
        errors.push(...page.errors.map(error=>`${expectedUrl}: ${error}`));
        warnings.push(...page.warnings.map(warning=>`${expectedUrl}: ${warning}`));
      }catch(error){errors.push(`${expectedUrl}: ${error.message||String(error)}`)}
    }
  }
  return{
    version,
    generatedAt:new Date().toISOString(),
    source:"Lighthouse CI median representative runs",
    configuredPages:policy.urls.length,
    configuredRunsPerPage:policy.numberOfRuns,
    pages,
    errors:[...new Set(errors)],
    warnings:[...new Set(warnings)],
    status:errors.length?"FAIL":"PASS"
  };
}
function writeReport(report){
  fs.mkdirSync(path.dirname(reportFile),{recursive:true});
  fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(process.env.GITHUB_STEP_SUMMARY){
    const lines=[
      `## ${report.status==="PASS"?"✅":"❌"} NetEngineerLab V${report.version} production performance`,
      "",
      `- Status: **${report.status}**`,
      `- Pages: ${report.pages.length}/${report.configuredPages}`,
      `- Runs per page: ${report.configuredRunsPerPage}`,
      "",
      "| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | Transfer |",
      "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
      ...report.pages.map(page=>`| ${new URL(page.url).pathname} | ${page.scores.performance} | ${page.scores.accessibility} | ${page.scores.bestPractices} | ${page.scores.seo} | ${page.metrics.largestContentfulPaintMs} ms | ${page.metrics.cumulativeLayoutShift} | ${page.transferBytes.total} B |`)
    ];
    if(report.errors.length)lines.push("","### Failures",...report.errors.slice(0,20).map(error=>`- ${error.replace(/\|/g,"\\|")}`));
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join("\n")+"\n");
  }
}
function verifyExisting(){
  if(!fs.existsSync(reportFile)){console.error("Production performance report is missing.");return 1}
  const report=readJson(reportFile);
  console.log(`Production performance report: ${report.status}`);
  if(report.status!=="PASS"){
    for(const error of report.errors||[])console.error(`- ${error}`);
    return 1;
  }
  return 0;
}

if(require.main===module){
  if(process.argv.includes("--verify-existing"))process.exitCode=verifyExisting();
  else{
    const report=buildReport({
      configFile:path.resolve(parseArg("config",defaultConfig)),
      inputDir:path.resolve(parseArg("input",defaultInput))
    });
    writeReport(report);
    if(process.argv.includes("--enforce")&&report.status!=="PASS")process.exitCode=1;
  }
}

module.exports={assertionValue,buildReport,evaluateLhr,loadPolicy,pageSummary,selectManifestEntries,validatePolicy};
