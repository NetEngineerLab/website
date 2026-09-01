#!/usr/bin/env node
"use strict";

const assert=require("assert");
const fs=require("fs");
const path=require("path");
const{buildPageRegistry,loadPageRegistry,loadRegistryInputs}=require("./page-registry");

const root=path.resolve(__dirname,"..");
const data=name=>JSON.parse(fs.readFileSync(path.join(root,"website","data",name),"utf8"));
const base=loadRegistryInputs();
const clone=value=>JSON.parse(JSON.stringify(value));
function mustFail(mutate,pattern){const fixture=clone(base);mutate(fixture);assert.throws(()=>buildPageRegistry(fixture),pattern)}

const registry=loadPageRegistry();
const activeLocaleCount=base.localeConfig.locales.filter(locale=>locale.status==="active").length;
const expectedFamilies=base.sitemapConfig.routes.length+base.tools.length;
const expectedPages=expectedFamilies*activeLocaleCount;
const expectedEligible=registry.families.filter(family=>family.status==="active"&&family.indexable).length*activeLocaleCount;
assert.strictEqual(registry.families.length,expectedFamilies,"Page Registry family count must be source-driven");
assert.strictEqual(registry.pages.length,expectedPages,"localized page count must be family x active locale");
assert.strictEqual(registry.pages.filter(page=>page.sitemapEligible).length,expectedEligible);
assert.strictEqual(registry.pages.find(page=>page.familyId==="acl-generator-validator"&&page.locale==="zh").pathname,"/tools/acl-generator-validator/zh/");
assert.strictEqual(registry.pages.find(page=>page.familyId==="about"&&page.locale==="zh").pathname,"/zh/about/");
assert(registry.pages.every(page=>page.title&&page.description&&page.url.startsWith("https://netengineerlab.com/")));
assert(registry.pages.every(page=>page.canonical===page.url),"each localized page canonical must equal its URL");
const aclZh=registry.pages.find(page=>page.familyId==="acl-generator-validator"&&page.locale==="zh");
assert.deepStrictEqual(aclZh.hreflang,{en:"https://netengineerlab.com/tools/acl-generator-validator/","zh-CN":"https://netengineerlab.com/tools/acl-generator-validator/zh/","x-default":"https://netengineerlab.com/tools/acl-generator-validator/"});

const sitemap=fs.readFileSync(path.join(root,"website","sitemap.xml"),"utf8");
const actual=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]).sort();
const expected=registry.pages.filter(page=>page.sitemapEligible).map(page=>page.url).sort();
assert.deepStrictEqual(actual,expected,"Page Registry eligible URLs must equal sitemap.xml exactly");

function publicHtml(pathname){
  const relative=pathname==="/"?"index.html":`${pathname.replace(/^\//,"")}index.html`;
  return fs.readFileSync(path.join(root,"website",...relative.split("/")),"utf8");
}
for(const page of registry.pages.filter(page=>page.sitemapEligible)){
  const html=publicHtml(page.pathname);
  const canonicalTag=(html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)||[])[0]||"";
  const canonical=(canonicalTag.match(/\bhref=["']([^"']+)["']/i)||[])[1]||"";
  assert.strictEqual(canonical,page.canonical,`${page.pathname}: registry canonical must equal HTML metadata`);
  const alternates={};
  for(const match of html.matchAll(/<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>/gi)){
    const lang=(match[0].match(/\bhreflang=["']([^"']+)["']/i)||[])[1];
    const href=(match[0].match(/\bhref=["']([^"']+)["']/i)||[])[1];
    if(lang&&href)alternates[lang]=href;
  }
  assert.deepStrictEqual(alternates,page.hreflang,`${page.pathname}: registry hreflang must equal HTML metadata`);
}
for(const page of registry.pages.filter(page=>page.pageType!=="tool")){
  const html=publicHtml(page.pathname);
  const title=(html.match(/<title>([^<]+)<\/title>/i)||[])[1]||"";
  const descriptionTag=(html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i)||[])[0]||"";
  const description=(descriptionTag.match(/\bcontent=["']([^"']*)["']/i)||[])[1]||"";
  assert.strictEqual(title,page.title,`${page.pathname}: registry title must equal HTML metadata`);
  assert.strictEqual(description,page.description,`${page.pathname}: registry description must equal HTML metadata`);
}
for(const page of registry.pages.filter(page=>page.pageType==="directory")){
  const html=publicHtml(page.pathname);
  const block=(html.match(/<script\b(?=[^>]*data-nel-launch-schema=["']itemlist["'])[^>]*>([\s\S]*?)<\/script>/i)||[])[1];
  assert(block,`${page.pathname}: ItemList JSON-LD is required`);
  const itemList=JSON.parse(block);
  const activeTools=base.tools.filter(tool=>tool.status==="active");
  assert.strictEqual(itemList.numberOfItems,activeTools.length,`${page.pathname}: ItemList count must equal active tools`);
  assert.strictEqual(itemList.itemListElement.length,activeTools.length,`${page.pathname}: ItemList entries must equal active tools`);
  assert(itemList.itemListElement.some(item=>item.url.includes("/tools/acl-generator-validator/")),`${page.pathname}: ACL tool missing from ItemList`);
}

mustFail(fixture=>{fixture.sitemapConfig.schemaVersion="1.0.0"},/schemaVersion/);
mustFail(fixture=>{fixture.sitemapConfig.routes[0].pageType="unknown"},/invalid pageType/);
mustFail(fixture=>{fixture.sitemapConfig.routes[0].status="planned"},/must not be indexable/);
mustFail(fixture=>{fixture.sitemapConfig.routes[0].indexable="true"},/indexable must be boolean/);
mustFail(fixture=>{fixture.sitemapConfig.routes[0].priority="2.0"},/invalid priority/);
mustFail(fixture=>{fixture.sitemapConfig.routes[0].changefreq="sometimes"},/invalid changefreq/);
mustFail(fixture=>{delete fixture.sitemapConfig.routes[0].changefreq},/requires changefreq/);
mustFail(fixture=>{delete fixture.sitemapConfig.routes[0].priority},/requires priority/);
mustFail(fixture=>{delete fixture.sitemapConfig.routes[0].translations.zh},/primaryTopic|active locale translation missing/);
mustFail(fixture=>{fixture.sitemapConfig.routes[1].id=fixture.sitemapConfig.routes[0].id},/duplicate page family id/);
mustFail(fixture=>{fixture.tools[0].id="../escape"},/invalid id/);
mustFail(fixture=>{fixture.localeConfig.directoryStrategy.toolPage="/tools/{toolSlug}/"},/duplicate localized page URL/);
mustFail(fixture=>{fixture.localeConfig.siteUrl="http://netengineerlab.com"},/HTTPS origin/);
mustFail(fixture=>{fixture.localeConfig.siteUrl="https://user:pass@netengineerlab.com/"},/without credentials/);
mustFail(fixture=>{fixture.localeConfig.locales[1].folder="../zh"},/invalid locale folder/);
mustFail(fixture=>{fixture.localeConfig.locales[1].id=fixture.localeConfig.locales[0].id},/duplicate locale id/);
mustFail(fixture=>{fixture.localeConfig.locales[1].hreflang="EN"},/duplicate locale hreflang/);
mustFail(fixture=>{fixture.localeConfig.locales[1].hreflang="not a lang"},/hreflang must be a language tag/);
mustFail(fixture=>{fixture.localeConfig.locales[1].hreflang="x-default"},/must not use reserved x-default/);
mustFail(fixture=>{delete fixture.localeConfig.locales[1].htmlLang},/htmlLang must be a language tag/);
mustFail(fixture=>{fixture.localeConfig.locales[1].htmlLang="en"},/duplicate locale htmlLang/);
mustFail(fixture=>{fixture.localeConfig.locales[1].htmlLang="EN"},/duplicate locale htmlLang/);
mustFail(fixture=>{fixture.localeConfig.locales[1].htmlLang="not a lang"},/language tag/);
mustFail(fixture=>{fixture.sitemapConfig.routes[0].translations.xx=fixture.sitemapConfig.routes[0].translations.en},/unconfigured translation locale/);
mustFail(fixture=>{fixture.localeConfig.directoryStrategy.toolPage="/{localeFolder}/x/../tools/{toolSlug}/"},/traversal segment/);
mustFail(fixture=>{fixture.localeConfig.directoryStrategy.toolPage="/{localeFolder}/tools/%2e%2e/{toolSlug}/"},/forbidden characters/);
mustFail(fixture=>{fixture.localeConfig.directoryStrategy.toolPage="/{localeFolder}\\tools/{toolSlug}/"},/forbidden characters/);
mustFail(fixture=>{fixture.existingPathnames=fixture.existingPathnames.filter(item=>item!=="/tools/fiber-loss/")},/target HTML is missing/);
mustFail(fixture=>{fixture.tools[0].status="retired";fixture.tools[0].withdrawal=null},/requires withdrawal strategy/);
mustFail(fixture=>{fixture.tools[0].status="retired";fixture.tools[0].withdrawal={strategy:"redirect"}},/requires targetFamilyId/);
mustFail(fixture=>{fixture.tools[0].status="retired";fixture.tools[0].withdrawal={strategy:"redirect",target:"/../secret"}},/unknown field/);
mustFail(fixture=>{fixture.tools[0].status="retired";fixture.tools[0].withdrawal={strategy:"redirect",targetFamilyId:fixture.tools[0].id}},/must not target itself/);
mustFail(fixture=>{fixture.tools[0].status="retired";fixture.tools[0].withdrawal={strategy:"redirect",targetFamilyId:"missing-family"}},/target family is missing/);
mustFail(fixture=>{fixture.tools[0].status="retired";fixture.tools[0].withdrawal={strategy:"redirect",targetFamilyId:fixture.tools[1].id};fixture.tools[1].status="retired";fixture.tools[1].withdrawal={strategy:"redirect",targetFamilyId:fixture.tools[0].id}},/target family must be active|redirect cycle/);
mustFail(fixture=>{fixture.tools[0].publishedAt="2026-02-30"},/real calendar date/);
mustFail(fixture=>{fixture.tools[0].status="retired";fixture.tools[0].withdrawal={strategy:"gone",targetFamilyId:fixture.tools[1].id}},/must not define targetFamilyId/);
mustFail(fixture=>{delete fixture.toolContent[fixture.tools[0].id].searchIntent.zh},/active locale searchIntent missing/);
mustFail(fixture=>{fixture.sitemapConfig.routes[1].breadcrumb=["../bad"]},/breadcrumb contains invalid/);
mustFail(fixture=>{fixture.toolContent[fixture.tools[0].id].sources=["https://"]},/valid HTTPS URL/);
mustFail(fixture=>{fixture.toolContent[fixture.tools[0].id].relatedContent=["/../../secret"]},/traversal segment/);

const plannedTools=clone(base.tools);
plannedTools[0].status="planned";
plannedTools[0].publishedAt=null;
const plannedRegistry=buildPageRegistry(loadRegistryInputs({toolsOverride:plannedTools}));
assert.strictEqual(plannedRegistry.families.find(family=>family.id===plannedTools[0].id).status,"planned","load chain must retain planned families");
assert(plannedRegistry.pages.filter(page=>page.familyId===plannedTools[0].id).every(page=>!page.sitemapEligible&&page.robots==="noindex,follow"));

const retiredTools=clone(base.tools);
retiredTools[0].status="retired";
retiredTools[0].withdrawal={strategy:"redirect",targetFamilyId:retiredTools[1].id};
const retiredRegistry=buildPageRegistry(loadRegistryInputs({toolsOverride:retiredTools}));
const retiredPages=retiredRegistry.pages.filter(page=>page.familyId===retiredTools[0].id);
assert.strictEqual(retiredPages.find(page=>page.locale==="en").withdrawal.target,`https://netengineerlab.com/tools/${retiredTools[1].id}/`);
assert.strictEqual(retiredPages.find(page=>page.locale==="zh").withdrawal.target,`https://netengineerlab.com/tools/${retiredTools[1].id}/zh/`);
assert(retiredPages.every(page=>!page.sitemapEligible&&page.robots==="noindex,follow"));

console.log(`Page Registry contract tests: PASS (${registry.families.length} families; ${registry.pages.length} localized pages; sitemap exact).`);
