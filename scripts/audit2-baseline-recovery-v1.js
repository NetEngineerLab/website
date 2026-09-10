#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: Baseline-Recovery-V1-AUDIT2
 * Modified: 2026-09-10 15:35:00
 * Purpose: Independent audit of restored historical gates and non-regression wiring.
 */
const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=path.resolve(__dirname,".."); const errors=[];
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const requiredScripts={
 "audit:workflow-ui":"node scripts/workflow-ui-production-audit.js",
 "accept:v2.1-flagship-analytics":"node scripts/network-change-planner-analytics-acceptance.js",
 "validate:mib-governance":"node scripts/mib-phase0-governance-gate.js"
};
for(const [name,cmd] of Object.entries(requiredScripts)){
 if(pkg.scripts?.[name]!==cmd)errors.push(`package gate missing or changed: ${name}`);
 if(!pkg.scripts?.["prepare:launch"]?.includes(`npm run ${name}`))errors.push(`prepare:launch missing gate: ${name}`);
}
for(const rel of [
 "website/assets/css/tool-workflow.css",
 "scripts/workflow-ui-production-audit.js",
 "scripts/network-change-planner-analytics-acceptance.js",
 "scripts/mib-phase0-governance-gate.js",
 "docs/V2.1_FLAGSHIP_V1.1_PRODUCT_ANALYTICS.md",
 "docs/V2.1_FLAGSHIP_V1.1_PRODUCT_ANALYTICS_ACCEPTANCE_REPORT.md",
 "docs/V2.1_WORKFLOW_UI_PRODUCTION_FIX_AUDIT_2.md",
 "docs/NETENGINEERLAB_BASELINE_RECOVERY_V1.md"
]) if(!fs.existsSync(path.join(root,rel)))errors.push(`recovered artifact missing: ${rel}`);
// Independent execution of each restored gate, rather than duplicating their detailed logic.
for(const [label,script] of [
 ["Workflow UI","scripts/workflow-ui-production-audit.js"],
 ["Analytics privacy","scripts/network-change-planner-analytics-acceptance.js"],
 ["MIB governance","scripts/mib-phase0-governance-gate.js"]
]){
 const r=cp.spawnSync(process.execPath,[path.join(root,script)],{cwd:root,encoding:"utf8"});
 if(r.status!==0)errors.push(`${label} restored gate failed: ${(r.stderr||r.stdout||"").trim().split(/\r?\n/).slice(-3).join(" | ")}`);
}
// Ensure today's expansion remains intact and no old fixed tool-count gate was restored.
const registry=JSON.parse(fs.readFileSync(path.join(root,"src/registry/tool-registry.json"),"utf8"));
const tools=Array.isArray(registry)?registry:(registry.tools||[]);
const active=tools.filter(t=>t.status==="active");
if(active.length<32)errors.push(`new tools regressed: expected at least 32 active tools, got ${active.length}`);
if(errors.length){console.error("AUDIT2 Baseline Recovery V1: FAIL");errors.forEach(e=>console.error(`- ${e}`));process.exit(1);}
console.log(`AUDIT2 Baseline Recovery V1: PASS (${active.length} active tools preserved; 3 historical gates independently revalidated)`);
