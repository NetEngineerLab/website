#!/usr/bin/env node
"use strict";

const assert=require("assert");
const path=require("path");
const {buildReport,pageSignals,scoreCoverage,toolPageFile}=require("./seo-geo-coverage-audit");

const rich=`<html><body><h2>Method</h2><h2>Results</h2><h2>Limits</h2><h2>Next steps</h2>
  <a href="/tools/one/">One</a><a href="/tools/two/">Two</a>
  <a href="https://ietf.org/a">A</a><a href="https://ieee.org/b">B</a><a href="https://itu.int/c">C</a>
  ${Array.from({length:5},(_,index)=>`<details><summary>Question ${index}?</summary><p>Answer ${index}</p></details>`).join("")}
  <p>Last reviewed: 2026-08-29 ${"engineering explanation ".repeat(70)}</p>
  <script type="application/ld+json">{"@type":"FAQPage"}</script></body></html>`;
const thin="<html><body><h2>Result</h2><p>Short page.</p></body></html>";
const richSignals=pageSignals(rich);
const thinSignals=pageSignals(thin);

assert.strictEqual(richSignals.faqCount,5);
assert.strictEqual(richSignals.externalReferenceCount,3);
assert.strictEqual(richSignals.internalLinkCount,2);
assert.strictEqual(richSignals.faqSchema,true);
assert.strictEqual(richSignals.reviewMarker,true);
assert.strictEqual(richSignals.lastReviewedAt,"2026-08-29");
assert.strictEqual(new Set(richSignals.externalReferences).size,3);
assert.strictEqual(scoreCoverage({en:richSignals,zh:richSignals}).priority,"maintain");
assert.strictEqual(scoreCoverage({en:thinSignals,zh:thinSignals}).priority,"high");
assert(scoreCoverage({en:thinSignals,zh:thinSignals}).score>scoreCoverage({en:richSignals,zh:richSignals}).score);

const paths=[];
const report=buildReport({
  catalog:[
    {id:"optical-power-budget",order:2,status:"active",category:"optical",translations:{en:{name:"Power Budget"},zhCN:{name:"光功率预算"}}},
    {id:"fiber-loss",order:1,status:"active",category:"optical",translations:{en:{name:"Fiber Loss"},zhCN:{name:"光纤损耗"}}},
    {id:"inactive-tool",order:0,status:"planned",category:"test",translations:{}}
  ],
  localeConfig:{siteUrl:"https://netengineerlab.com",directoryStrategy:{toolPage:"/utilities/{localeFolder}/{toolSlug}/"},locales:[
    {id:"en",folder:"",catalogKey:"en",status:"active"},
    {id:"zh",folder:"cn",catalogKey:"zhCN",status:"active"},
    {id:"es",folder:"es",catalogKey:"es",status:"planned"}
  ]},
  readPage:file=>{paths.push(file);return rich},
  generatedAt:"2026-08-29T00:00:00.000Z"
});
assert.deepStrictEqual(report.summary,{activeTools:2,localePages:4,priorityCounts:{high:0,medium:0,maintain:2}});
assert.deepStrictEqual(report.nextBatch,["fiber-loss","optical-power-budget"]);
assert.deepStrictEqual(report.tools[0].searchIntent,{id:"calculation",en:"calculation",zh:"计算"});
assert.deepStrictEqual(report.tools[0].targetTopic,{en:"Fiber Loss",zh:"光纤损耗"});
assert.strictEqual(report.tools[0].contentOwner,"NetEngineerLab Editorial");
assert.deepStrictEqual(report.tools[0].lastReviewedAt,{en:"2026-08-29",zh:"2026-08-29"});
assert.strictEqual(report.tools[0].locales.en.longTailQuestions.length,5);
assert(paths.some(file=>file.endsWith(path.join("utilities","fiber-loss","index.html"))));
assert(paths.some(file=>file.endsWith(path.join("utilities","cn","fiber-loss","index.html"))));
assert.strictEqual(paths.length,4,"planned locale and inactive tool must not be audited");

const scoped=`<html><body><header><a href="/about/">Shell link</a></header>
  <div class="page breadcrumbs compact"><a href="../../">Home</a><a href="https://netengineerlab.com/tools/">Tools</a></div><main>
  <a href="../related/">Related tool</a><a href="#calculator">Self anchor</a>
  <p>{"@type":"FAQPage"}</p></main><footer><a href="/terms/">Footer link</a></footer></body></html>`;
const scopedSignals=pageSignals(scoped,"https://netengineerlab.com/tools/example/");
assert.strictEqual(scopedSignals.internalLinkCount,1,"relative content link must count; shell and self links must not");
assert.strictEqual(scopedSignals.faqSchema,false,"ordinary body text must not impersonate JSON-LD");
for(const className of ["breadcrumb-help","breadcrumbs-panel"]){
  const negative=pageSignals(`<html><body><div class="${className}"><a href="/keep/">Keep</a></div></body></html>`,"https://netengineerlab.com/tools/example/");
  assert.strictEqual(negative.internalLinkCount,1,`${className} is not an exact breadcrumb class token`);
}
const nestedSchema=pageSignals(`<html><body><script type="application/ld+json">{"@graph":[{"@type":"FAQPage"}]}</script></body></html>`);
assert.strictEqual(nestedSchema.faqSchema,true,"nested JSON-LD FAQPage must be detected");
assert.throws(()=>toolPageFile({directoryStrategy:{toolPage:"/tools/{toolSlug}/"}},{folder:""},"fiber-loss"),/must contain/);

console.log("SEO/GEO coverage audit tests: PASS");
