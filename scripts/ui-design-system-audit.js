#!/usr/bin/env node
"use strict";

const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const site=path.join(root,"website");
const docs=path.join(root,"docs");

function walk(dir){
 const out=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())out.push(...walk(full)); else out.push(full);
 }
 return out;
}
function rel(file){return path.relative(root,file).split(path.sep).join("/")}
function has(html,re){return re.test(html)}
function issue(level,file,code,message){return{level,file,code,message}}
function stripComments(s){return s.replace(/\/\*[\s\S]*?\*\//g,"").trim()}
function splitSelectors(s){return stripComments(s).split(",").map(x=>x.trim()).filter(Boolean)}

const issues=[];
const htmlFiles=walk(site).filter(f=>f.endsWith(".html")&&!f.includes(`${path.sep}templates${path.sep}`));
const publicPages=[];
const toolPages=[];
for(const file of htmlFiles){
 const html=fs.readFileSync(file,"utf8");
 if(!/data-nel-route=/.test(html))continue;
 const r=rel(file); publicPages.push(r);
 const is404=/data-nel-route=["']404\.html["']/.test(html);
 if(!is404){
  if(!has(html,/<meta\b(?=[^>]*name=["']viewport["'])(?=[^>]*content=["'][^"']*width=device-width)[^>]*>/i))issues.push(issue("error",r,"VIEWPORT","Missing responsive viewport meta."));
  if(!has(html,/class=["'][^"']*site-shell-header\b/i))issues.push(issue("error",r,"HEADER","Shared site-shell header missing."));
  if(!has(html,/class=["'][^"']*site-shell-footer\b/i))issues.push(issue("error",r,"FOOTER","Shared site-shell footer missing."));
  if(!has(html,/site-shell\.css\?v=/i))issues.push(issue("error",r,"SHELL_CSS","Versioned shared site-shell.css missing."));
 }
 const toolMatch=r.match(/^website\/tools\/([^/]+)\/(?:([^/]+)\/)?index\.html$/);
 if(toolMatch && !["zh","es"].includes(toolMatch[1])){
  toolPages.push(r);
  if(!has(html,/tool-design-system\.css\?v=/i))issues.push(issue("error",r,"TOOL_DESIGN_CSS","tool-design-system.css missing."));
  if(!has(html,/tool-layout\.css\?v=/i))issues.push(issue("error",r,"TOOL_LAYOUT_CSS","tool-layout.css compliance layer missing or unversioned."));
  if(!has(html,/class=["'][^"']*\btool-return-nav\b/i))issues.push(issue("error",r,"RETURN_NAV","Visible tool return/breadcrumb navigation missing."));
  if(!has(html,/class=["'][^"']*\btool-return-link\b/i))issues.push(issue("error",r,"RETURN_LINK","Back-to-tools link missing."));
  if(!has(html,/aria-current=["']page["']/i))issues.push(issue("error",r,"CURRENT_PAGE","Current tool is not marked in navigation/breadcrumb."));
 }
}

const tokensPath=path.join(site,"assets/css/design-tokens.css");
const tokens=fs.readFileSync(tokensPath,"utf8");
if(!/--nel-content-max:\s*1400px\s*;/.test(tokens))issues.push(issue("error",rel(tokensPath),"CONTENT_WIDTH","--nel-content-max must be exactly 1400px."));
if(!/--nel-radius-card:\s*18px\s*;/.test(tokens))issues.push(issue("error",rel(tokensPath),"CARD_RADIUS_TOKEN","Canonical card radius token missing."));
if(!/--nel-shadow-card:\s*0\s+18px\s+48px/.test(tokens))issues.push(issue("error",rel(tokensPath),"CARD_SHADOW_TOKEN","Canonical card shadow token missing."));
const layoutPath=path.join(site,"assets/css/tool-layout.css");
const layout=fs.readFileSync(layoutPath,"utf8");
if(!/--nel-tool-max-width:\s*var\(--nel-content-max,\s*1400px\)/.test(layout))issues.push(issue("error",rel(layoutPath),"LAYOUT_TOKEN","Tool layout must derive from the canonical 1400px content token."));
if(!/main\s*>\s*\.tool-hero[\s\S]{0,220}width:\s*100%\s*!important/.test(layout))issues.push(issue("error",rel(layoutPath),"NESTED_HERO","Nested Hero must not subtract the page gutter twice."));

// V1.1 source-clean audit. Shared compliance CSS is no longer allowed to be
// the only reason an old tool appears aligned: local source must be clean too.
const primaryTokens=[".breadcrumbs",".hero-inner",".shell",".tool-shell",".workspace",".calculator-shell",".content",".content-section",".wrap",".acl-shell",".planner-shell",".mode-tabs"];
const internalExcludes=[" h1"," h2"," h3","hero-description","hero-copy","ad-slot",".summary",".metric",".formula",".input-wrap",".result-box"];
const shellSelectorRe=/(^|[\s>+~])(?:\.site-header|\.top-nav|\.nav|\.brand|\.language|\.cta|footer|\.site-footer|\.footer-links|\.footer-main)(?:\b|:)/i;
const baseCard=new Set([".card",".panel",".input-panel",".result-panel",".input-card",".result-card",".config-panel",".analysis-panel"]);
const cssFiles=walk(path.join(site,"tools")).filter(f=>f.endsWith(".css")&&/\/css\/style\.css$/.test(f.replace(/\\/g,"/")));
let sourceCssChecked=0;
for(const file of cssFiles){
 const css=fs.readFileSync(file,"utf8");
 const r=rel(file); sourceCssChecked++;
 for(const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  const selectors=splitSelectors(m[1]);
  if(!selectors.length)continue;
  const body=m[2];
  for(const sel of selectors){
   if(shellSelectorRe.test(sel))issues.push(issue("error",r,"LOCAL_SHELL_STYLE",`Tool CSS still owns shared Header/Nav/Footer selector: ${sel}`));
  }
  const isPrimary=selectors.some(sel=>{
   const low=sel.toLowerCase();
   return !internalExcludes.some(x=>low.includes(x)) && primaryTokens.some(x=>low.includes(x));
  });
  if(isPrimary){
   const legacy=[...body.matchAll(/max-width\s*:\s*(1\d{3})px/gi)].map(x=>Number(x[1])).filter(v=>v!==1400);
   if(legacy.length)issues.push(issue("error",r,"LEGACY_PRIMARY_WIDTH",`Primary page geometry still uses numeric legacy max-width: ${[...new Set(legacy)].join(", ")}px.`));
  }
  const baseOnly=selectors.every(sel=>{
   const low=sel.toLowerCase();
   return baseCard.has(low) || [...baseCard].some(x=>low.startsWith(x+":"));
  });
  if(baseOnly){
   if(/border-radius\s*:\s*(?:1[4-9]|2[0-4])px/i.test(body))issues.push(issue("error",r,"LEGACY_CARD_RADIUS","Base card still uses a literal radius instead of --nel-radius-card."));
   const shadow=body.match(/box-shadow\s*:\s*([^;}]+)/i);
   if(shadow && !/^(?:none|var\(--nel-shadow-card\))$/i.test(shadow[1].trim()))issues.push(issue("error",r,"LEGACY_CARD_SHADOW","Base card still uses a local shadow instead of --nel-shadow-card."));
  }
 }
}

const errors=issues.filter(x=>x.level==="error");
const warnings=issues.filter(x=>x.level==="warning");
const report={
 standard:"NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.1",
 generatedAt:new Date().toISOString(),
 publicPages:publicPages.length,
 toolPages:toolPages.length,
 sourceCssChecked,
 errors:errors.length,
 warnings:warnings.length,
 status:errors.length?"FAIL":"PASS",
 issues
};
fs.writeFileSync(path.join(docs,"UI_DESIGN_SYSTEM_AUDIT_REPORT.json"),JSON.stringify(report,null,2)+"\n");
const lines=[
 "# NetEngineerLab UI Design System Audit Report",
 "",
 `- Standard: ${report.standard}`,
 `- Public pages checked: ${report.publicPages}`,
 `- Tool detail pages checked: ${report.toolPages}`,
 `- Tool source CSS checked: ${report.sourceCssChecked}`,
 `- Errors: ${report.errors}`,
 `- Warnings: ${report.warnings}`,
 `- Result: **${report.status}**`,
 "",
 "## V1.1 source-clean gates",
 "",
 "- Shared Header/Nav/Footer selectors are forbidden in tool-local CSS.",
 "- Primary page geometry must use the canonical 1400px design token, not legacy numeric widths.",
 "- Base cards must use shared radius/shadow tokens when those properties are declared locally.",
 "",
 "## Findings",
 ""
];
if(!issues.length)lines.push("No issues detected. Legacy source CSS cleanup is complete for the audited rules.");
else for(const x of issues)lines.push(`- **${x.level.toUpperCase()} · ${x.code}** — \`${x.file}\`: ${x.message}`);
fs.writeFileSync(path.join(docs,"UI_DESIGN_SYSTEM_AUDIT_REPORT.md"),lines.join("\n")+"\n");
console.log(JSON.stringify({status:report.status,publicPages:report.publicPages,toolPages:report.toolPages,sourceCssChecked:report.sourceCssChecked,errors:report.errors,warnings:report.warnings},null,2));
if(errors.length)process.exit(1);
