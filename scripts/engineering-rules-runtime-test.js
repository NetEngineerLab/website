#!/usr/bin/env node
"use strict";

const assert=require("assert");
const crypto=require("crypto");
const fs=require("fs");
const os=require("os");
const path=require("path");
const {getPath,stableStringify}=require("../website/assets/js/rules-engine/normalize");
const {escapeHtml,formatEvidence}=require("../website/assets/js/rules-engine/evidence");
const {evaluateBundle,evaluateRules,validateBundleCompatibility}=require("../website/assets/js/rules-engine/evaluate");
const {scoreFindings}=require("../website/assets/js/rules-engine/score");
const {createReport}=require("../website/assets/js/rules-engine/report");
const {buildRulesBundle,createBundle}=require("./build-rules-bundle");
const {rulesRuntimeAssets}=require("./rules-runtime-assets");
const {stableFileHash}=require("./stable-text-hash");
const root=path.resolve(__dirname,"..");
const policy=JSON.parse(fs.readFileSync(path.join(root,"website","data","engineering-rules","severity-policy.json"),"utf8"));
const content={en:{title:"Test <rule>",finding:"Risk & issue",reason:"Test reason",recommendation:"Use a safer value",fieldExperienceNote:"Verify on site"},zh:{title:"测试规则",finding:"发现风险",reason:"测试原因",recommendation:"使用更安全的值",fieldExperienceNote:"现场复核"}};
const rule=(id,severity,operator,params,dimensions=["security"])=>({id,version:"1.0.0",status:"active",severity,dimensions,condition:{operator,params},content,evidence:{selector:"facts",fields:["device.name","device.password","sourceLine"],redactions:[]}});
const facts={device:{name:"<core&1>",password:"do-not-leak"},sourceLine:17,mode:"permit",loss:6,tags:["remote","management"]};
const rules=[rule("TEST-001","HIGH","equals",{path:"mode",value:"permit"}),rule("TEST-002","MEDIUM","numeric-greater-than",{path:"loss",value:5}),rule("TEST-003","INFO","contains-any",{path:"tags",values:["management"]}),rule("TEST-004","HIGH","equals",{path:"mode",value:"deny"}),{...rule("TEST-005","HIGH","equals",{path:"mode",value:"permit"}),status:"draft"}];

assert.strictEqual(getPath(facts,"device.name"),"<core&1>");
assert.strictEqual(getPath(facts,"missing.path"),undefined);
assert.throws(()=>getPath(facts,"__proto__.polluted"),/Unsafe/);
assert.strictEqual(stableStringify({b:1,a:{d:2,c:3}}),'{"a":{"c":3,"d":2},"b":1}');
const findings=evaluateRules(rules,facts,{locale:"en"});
assert.deepStrictEqual(findings.map(item=>item.ruleId),["TEST-001","TEST-002","TEST-003"]);
assert.strictEqual(findings[0].evidence[0].displayValue,"&lt;core&amp;1&gt;");
assert.strictEqual(findings[0].evidence[1].value,"[REDACTED]");
assert(!JSON.stringify(findings).includes("do-not-leak"));
assert.strictEqual(escapeHtml('<script>alert("x")</script>'),'&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
assert.throws(()=>formatEvidence({...rules[0],evidence:{...rules[0].evidence,selector:"unknown"}},facts),/No deterministic Evidence selector/);
assert.throws(()=>formatEvidence({...rules[0],evidence:{selector:"facts",fields:["missing.one","missing.two"],redactions:[]}},facts),/no present Evidence fields/);
const nestedEvidence=formatEvidence({...rules[0],evidence:{selector:"facts",fields:["device"],redactions:[]}},facts);
assert.strictEqual(nestedEvidence[0].value.password,"[REDACTED]");
assert(!JSON.stringify(nestedEvidence).includes("do-not-leak"));
assert.throws(()=>formatEvidence(rules[0],facts,{}, {facts:()=>facts}),/Cannot override/);
const secretEvidence=formatEvidence({...rules[0],evidence:{selector:"facts",fields:["secrets"],redactions:["publicLabel"]}},{secrets:{apiKey:"one",api_key:"two","api-key":"three",key:"four",publicLabel:"five",nested:{clientSecret:"six"}}});
assert(!JSON.stringify(secretEvidence).match(/one|two|three|four|five|six/));
assert.strictEqual(secretEvidence[0].value.apiKey,"[REDACTED]");
const customSelectorRule={...rules[0],evidence:{selector:"custom-facts",fields:["line"],redactions:[]}};
assert.strictEqual(formatEvidence(customSelectorRule,facts,{}, {"custom-facts":()=>({line:42})})[0].value,42);
assert.strictEqual(evaluateRules([rule("TEST-006","HIGH","not-equals",{path:"missing",value:"x"})],facts).length,0);
assert.throws(()=>evaluateRules([rules[0]],facts,{customOperators:{equals:()=>true}}),/Cannot override/);
assert.throws(()=>evaluateRules([{...rules[0],condition:{operator:"custom",params:{}}}],facts,{customOperators:{custom:()=>"yes"}}),/invalid outcome/);

const customRule={...rule("ACL-001","CRITICAL","acl-shadowed-by-prior-rule",{rulesPath:"acl.rules"},["connectivity","security"]),evidence:{selector:"operator-evidence",fields:["sourceLine","priorLine"],redactions:[]}};
const customFindings=evaluateRules([customRule],facts,{customOperators:{"acl-shadowed-by-prior-rule":()=>({matched:true,rootCauseKey:"acl-shadow",evidence:{sourceLine:20,priorLine:10}})}});
assert.strictEqual(customFindings[0].evidence[1].value,10);
assert.throws(()=>evaluateRules([customRule],facts),/No deterministic handler/);
const score=scoreFindings([...findings,...customFindings],policy);
assert.strictEqual(score.passFail,null);assert.strictEqual(score.counts.CRITICAL,1);assert(score.overall<=policy.severities.CRITICAL.overallScoreCap);
assert.strictEqual(score.trace.find(item=>item.severity==="INFO").appliedDeduction,0);
const dedup=scoreFindings(Array.from({length:4},(_,index)=>({...findings[0],ruleId:`DUP-${index}`,rootCauseKey:"same"})),policy);
assert.strictEqual(dedup.trace.reduce((sum,item)=>sum+item.appliedDeduction,0),policy.rootCauseDeduplication.maximumSameRootCauseDeduction);
assert.throws(()=>scoreFindings([{...findings[0],dimensions:["unknown"]}],policy),/Unknown finding dimension/);
const report=createReport(findings,score,{locale:"en"});
assert.strictEqual(report.generatedAt,null);assert.strictEqual(report.summary.passFail,null);assert.strictEqual(report.findings[0].titleHtml,"Test &lt;rule&gt;");
const zhFindings=evaluateRules([rules[0]],facts,{locale:"zh"});
const zhReport=createReport(zhFindings,scoreFindings(zhFindings,policy),{locale:"zh"});
assert.strictEqual(zhFindings[0].title,"测试规则");assert.strictEqual(zhReport.locale,"zh");assert.strictEqual(zhReport.findings[0].finding,"发现风险");

const outputRoot=fs.mkdtempSync(path.join(os.tmpdir(),"nel-rules-bundle-"));
try{
  fs.writeFileSync(path.join(outputRoot,"rules-bundle.000000000000.js"),"old");
  fs.writeFileSync(path.join(outputRoot,"keep.txt"),"keep");
  const first=buildRulesBundle({outputRoot});const second=buildRulesBundle({outputRoot});
  assert.strictEqual(first.content,second.content);assert.strictEqual(first.fileName,second.fileName);
  assert.strictEqual(first.hash,crypto.createHash("sha256").update(first.content,"utf8").digest("hex").slice(0,12));
  assert.deepStrictEqual(fs.readdirSync(outputRoot).sort(),["keep.txt",first.fileName].sort());assert.strictEqual(first.bundle.rules.length,0);assert(!first.content.includes("website/data/engineering-rules"));
  delete require.cache[require.resolve(first.file)];const loaded=require(first.file);assert(Object.isFrozen(loaded)&&Object.isFrozen(loaded.severityPolicy));
  validateBundleCompatibility(loaded);assert.deepStrictEqual(evaluateBundle(loaded,facts),[]);
  assert.throws(()=>validateBundleCompatibility({...loaded,runtimeApiVersion:"9.9.9"}),/version mismatch/);
  const invalidPolicy=structuredClone(first.bundle.severityPolicy);invalidPolicy.schemaVersion="2.0.0";
  assert.throws(()=>createBundle({ruleSchema:first.bundle.ruleSchema,severityPolicy:invalidPolicy,operatorRegistry:first.bundle.operatorRegistry,rules:[]}),/version mismatch/);
  const incompatibleScorePolicy=structuredClone(first.bundle.severityPolicy);incompatibleScorePolicy.scorePolicyVersion="9.9.9-incompatible";
  assert.throws(()=>createBundle({ruleSchema:first.bundle.ruleSchema,severityPolicy:incompatibleScorePolicy,operatorRegistry:first.bundle.operatorRegistry,rules:[]}),/version mismatch/);
}finally{fs.rmSync(outputRoot,{recursive:true,force:true})}

const site=path.join(root,"website");
const generated=buildRulesBundle({write:false});
const actualBundles=fs.readdirSync(path.join(site,"assets","generated","rules-engine")).filter(name=>/^rules-bundle\.[a-f0-9]{12}\.js$/.test(name));
assert.deepStrictEqual(actualBundles,[generated.fileName]);
const runtimeAssets=rulesRuntimeAssets(site);
const activeTools=JSON.parse(fs.readFileSync(path.join(site,"data","tools-catalog.json"),"utf8")).filter(tool=>tool.status==="active");
for(const tool of activeTools){
  const sw=fs.readFileSync(path.join(site,"tools",tool.id,"sw.js"),"utf8");
  for(const asset of runtimeAssets){
    const expected=`${asset.cachePath}?v=${stableFileHash(path.join(site,...asset.sitePath.split("/")),12)}`;
    assert(sw.includes(expected),`${tool.id} Service Worker missing ${expected}`);
  }
}
const htmlFiles=[];
const walk=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);entry.isDirectory()?walk(file):entry.name.endsWith(".html")&&htmlFiles.push(file)}};
walk(site);
for(const file of htmlFiles)assert(!fs.readFileSync(file,"utf8").includes("data/engineering-rules/"),`${file} references rule source JSON`);
console.log("Engineering rules runtime tests: PASS (Evaluator, Evidence, Score, Report, deterministic bundle).");
