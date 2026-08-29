#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const {walkSchema}=require("./schema-walk");

const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const origin="https://netengineerlab.com";
const owner="NetEngineerLab Editorial";

const intentByTool=Object.freeze({
  "fiber-loss":"calculation",
  "optical-power-budget":"validation",
  "pon-splitter-loss":"planning",
  "onu-rx-power":"diagnosis",
  "pon-distance":"planning",
  "otdr-event":"diagnosis",
  "mtu-calculator":"calculation",
  "subnet-calculator":"planning",
  "bandwidth-calculator":"calculation",
  "48v-battery-runtime":"sizing",
  "ipv6-nat-planner":"planning",
  "wifi-coverage-capacity-planner":"planning",
  "poe-power-budget-calculator":"sizing",
  "sfp-qsfp-compatibility-calculator":"validation",
  "wireless-link-budget-calculator":"validation",
  "poe-voltage-drop-calculator":"calculation",
  "network-rack-power-cooling-calculator":"sizing",
  "vlan-ip-capacity-planner":"planning",
  "switch-uplink-oversubscription-calculator":"sizing",
  "dns-ttl-propagation-calculator":"planning"
});
const intentLabels=Object.freeze({
  calculation:{en:"calculation",zh:"计算"},
  validation:{en:"validation",zh:"验证"},
  planning:{en:"planning",zh:"规划"},
  diagnosis:{en:"diagnosis",zh:"故障诊断"},
  sizing:{en:"sizing and selection",zh:"选型"}
});

const read=file=>fs.readFileSync(file,"utf8");
const decode=value=>String(value||"")
  .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
  .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
const textContent=html=>decode(String(html||"")
  .replace(/<script\b[\s\S]*?<\/script>/gi," ")
  .replace(/<style\b[\s\S]*?<\/style>/gi," ")
  .replace(/<[^>]+>/g," "));
const attr=(tag,name)=>decode(tag?.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`,"i"))?.[1]);
const tags=(html,name)=>[...String(html||"").matchAll(new RegExp(`<${name}\\b[^>]*>`,"gi"))].map(match=>match[0]);

const stripShell=html=>String(html||"")
  .replace(/<header\b[\s\S]*?<\/header>/gi," ")
  .replace(/<footer\b[\s\S]*?<\/footer>/gi," ")
  .replace(/<nav\b[\s\S]*?<\/nav>/gi," ")
  .replace(/<(div|ol|ul)\b(?=[^>]*\bclass=["'](?:breadcrumbs?|[^"']+\sbreadcrumbs?)(?:\s[^"']*)?["'])[^>]*>[\s\S]*?<\/\1>/gi," ");

function parseReviewDate(text){
  const iso=text.match(/(?:last\s+(?:updated|reviewed)|updated\s+on|content\s+reviewed)\s*[:：]?\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
  if(iso)return iso;
  const zh=text.match(/(?:最后更新|更新时间|复核日期|内容复核)\s*[:：]?\s*(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})日?/);
  if(!zh)return null;
  return `${zh[1]}-${zh[2].padStart(2,"0")}-${zh[3].padStart(2,"0")}`;
}

function pageSignals(html,pageUrl=`${origin}/`){
  const rawBody=html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]||"";
  const body=stripShell(rawBody);
  const questions=[...body.matchAll(/<details\b[^>]*>[\s\S]*?<summary\b[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/details>/gi)]
    .map(match=>textContent(match[1])).filter(Boolean);
  const currentUrl=new URL(pageUrl);
  const resolvedLinks=tags(body,"a").map(tag=>attr(tag,"href")).map(href=>{
    try{return new URL(href,currentUrl)}catch{return null}
  }).filter(url=>url&&/^https?:$/.test(url.protocol));
  const externalReferences=[...new Set(resolvedLinks.filter(url=>url.origin!==currentUrl.origin).map(url=>url.href))];
  const internalLinks=[...new Set(resolvedLinks
    .filter(url=>url.origin===currentUrl.origin&&url.pathname!==currentUrl.pathname)
    .map(url=>`${url.pathname}${url.search}${url.hash}`))];
  const headings=[...body.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)].map(match=>textContent(match[1]));
  let faqSchema=false;
  for(const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    try{walkSchema(JSON.parse(block[1].trim()),node=>{if(node["@type"]==="FAQPage")faqSchema=true})}catch{}
  }
  const lastReviewedAt=parseReviewDate(textContent(body));
  return {
    visibleCharacters:textContent(body).length,
    sectionHeadings:headings.length,
    longTailQuestions:questions,
    faqCount:questions.length,
    faqSchema,
    externalReferences,
    externalReferenceCount:externalReferences.length,
    internalLinkCount:internalLinks.length,
    lastReviewedAt,
    reviewMarker:Boolean(lastReviewedAt)
  };
}

function toolPageFile(localeConfig,locale,toolSlug,siteRoot=site){
  const template=localeConfig.directoryStrategy?.toolPage;
  if(!template||!template.includes("{toolSlug}")||!template.includes("{localeFolder}")){
    throw new Error("locales.json directoryStrategy.toolPage must contain {toolSlug} and {localeFolder}");
  }
  const route=template.replaceAll("{toolSlug}",toolSlug).replaceAll("{localeFolder}",locale.folder||"").replace(/\/{2,}/g,"/");
  const relative=route.replace(/^\/+|\/+$/g,"");
  const file=path.resolve(siteRoot,...relative.split("/").filter(Boolean),"index.html");
  const safeRoot=`${path.resolve(siteRoot)}${path.sep}`;
  if(!file.startsWith(safeRoot))throw new Error(`Configured tool route escapes website root: ${route}`);
  return {file,route:`/${relative}/`.replace(/\/{2,}/g,"/")};
}

function scoreCoverage(locales){
  const values=Object.values(locales);
  const minFaq=Math.min(...values.map(value=>value.faqCount));
  const minRefs=Math.min(...values.map(value=>value.externalReferenceCount));
  const minHeadings=Math.min(...values.map(value=>value.sectionHeadings));
  const minInternal=Math.min(...values.map(value=>value.internalLinkCount));
  const minChars=Math.min(...values.map(value=>value.visibleCharacters));
  const missingSchema=values.some(value=>!value.faqSchema);
  const missingReview=values.some(value=>!value.reviewMarker);
  const gaps=[];
  let score=0;
  if(minFaq<5){score+=(5-minFaq)*8;gaps.push(`${5-minFaq} FAQ(s) below the five-question target`)}
  if(missingSchema){score+=20;gaps.push("FAQPage missing in at least one locale")}
  if(minRefs<3){score+=(3-minRefs)*6;gaps.push(`${3-minRefs} authoritative reference(s) below the three-source target`)}
  if(minHeadings<4){score+=(4-minHeadings)*3;gaps.push("limited visible method/result/limitation structure")}
  if(minInternal<2){score+=(2-minInternal)*3;gaps.push("fewer than two contextual internal links")}
  if(minChars<1200){score+=Math.ceil((1200-minChars)/200)*3;gaps.push("thin visible explanatory content in at least one locale")}
  if(missingReview){score+=4;gaps.push("visible review/update marker missing")}
  const priority=score>=30?"high":score>=15?"medium":"maintain";
  return {score,priority,gaps};
}

function buildReport({catalog,localeConfig,readPage,generatedAt=new Date().toISOString()}){
  const activeLocales=localeConfig.locales.filter(locale=>locale.status==="active");
  const tools=catalog.filter(tool=>tool.status==="active").map(tool=>{
    if(!intentByTool[tool.id])throw new Error(`Missing search intent for active tool: ${tool.id}`);
    const locales=Object.fromEntries(activeLocales.map(locale=>{
      const location=toolPageFile(localeConfig,locale,tool.id);
      return [locale.id,pageSignals(readPage(location.file),`${localeConfig.siteUrl||origin}${location.route}`)];
    }));
    const coverage=scoreCoverage(locales);
    return {
      id:tool.id,
      catalogOrder:tool.order,
      category:tool.category,
      searchIntent:{id:intentByTool[tool.id],...intentLabels[intentByTool[tool.id]]},
      targetTopic:Object.fromEntries(activeLocales.map(locale=>{
        const translation=tool.translations[locale.catalogKey||locale.id];
        if(!translation?.name)throw new Error(`Missing ${locale.id} target topic for active tool: ${tool.id}`);
        return [locale.id,translation.name];
      })),
      contentOwner:owner,
      lastReviewedAt:Object.fromEntries(activeLocales.map(locale=>[locale.id,locales[locale.id].lastReviewedAt])),
      locales,
      ...coverage
    };
  }).sort((a,b)=>b.score-a.score||a.catalogOrder-b.catalogOrder);
  const counts=tools.reduce((result,tool)=>{result[tool.priority]++;return result},{high:0,medium:0,maintain:0});
  return {
    generatedAt,
    methodology:{
      scope:"Active bilingual tool pages configured by locales.json and tools-catalog.json",
      meaning:"Rule-based content-gap priority; not a ranking, traffic, or conversion forecast",
      thresholds:{faqQuestions:5,externalReferences:3,sectionHeadings:4,contextualInternalLinks:2,visibleCharactersPerLocale:1200},
      limitations:["No Search Console, analytics, backlink, search-volume, or live ranking data is used.","Source authority is counted as unique external references; editorial quality still requires human review.","lastReviewedAt remains null until a formal content review is recorded."]
    },
    summary:{activeTools:tools.length,localePages:tools.length*activeLocales.length,priorityCounts:counts},
    nextBatch:tools.slice(0,5).map(tool=>tool.id),
    tools
  };
}

function main(){
  const localeConfig=JSON.parse(read(path.join(site,"data","locales.json")));
  const catalog=JSON.parse(read(path.join(site,"data","tools-catalog.json")));
  const report=buildReport({catalog,localeConfig,readPage:read});
  const output=path.join(root,"docs","SEO_GEO_COVERAGE_REPORT.json");
  fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({output:path.relative(root,output),...report.summary,nextBatch:report.nextBatch},null,2));
}

if(require.main===module)main();
module.exports={buildReport,pageSignals,parseReviewDate,scoreCoverage,toolPageFile,intentByTool};
