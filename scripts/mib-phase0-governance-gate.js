#!/usr/bin/env node
"use strict";
/**
 * NetEngineerLab
 * Version: Baseline-Recovery-V1
 * Modified: 2026-09-10 15:20:00
 * Purpose: Restore the MIB/OID Phase-0 governance gate without claiming production publication approval.
 */
const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const requiredDocs=[
 "docs/MIB_OID_SOURCE_LICENSE_LEDGER.md",
 "docs/MIB_OID_PARSER_DEPLOYMENT_ADR.md",
 "docs/MIB_OID_DATA_DICTIONARY.md",
 "docs/MIB_OID_THREAT_MODEL.md",
 "docs/MIB_OID_EXPLORER_DEVELOPMENT_PLAN.md"
];
const errors=[];
const text={};
for(const rel of requiredDocs){
 const p=path.join(root,rel);
 if(!fs.existsSync(p)){errors.push(`missing governance document: ${rel}`);continue;}
 const s=fs.readFileSync(p,"utf8"); text[rel]=s;
 if(s.trim().length<800)errors.push(`governance document unexpectedly short: ${rel}`);
}
const ledger=text["docs/MIB_OID_SOURCE_LICENSE_LEDGER.md"]||"";
for(const marker of ["METADATA_LINK_ONLY","BLOCKED_UNVERIFIED","下一门禁","2 号验证官"]){
 if(!ledger.includes(marker))errors.push(`license ledger missing required control marker: ${marker}`);
}
const threat=text["docs/MIB_OID_THREAT_MODEL.md"]||"";
const threatControls=[
 ["fail-closed",["fail-closed","失败","阻断","拒绝"]],
 ["no-store",["no-store"]],
 ["quarantine",["quarantined","quarantine","隔离","撤回"]],
 ["security epoch",["mib-security/"]],
 ["release controller",["release controller"]]
];
for(const [label,markers] of threatControls){
 if(!markers.some(marker=>threat.toLowerCase().includes(marker.toLowerCase())))errors.push(`threat model missing required control topic: ${label}`);
}
const adr=text["docs/MIB_OID_PARSER_DEPLOYMENT_ADR.md"]||"";
for(const marker of ["network","resource","parser"]){
 if(!adr.toLowerCase().includes(marker))errors.push(`parser ADR missing control topic: ${marker}`);
}
// Phase-0 safety invariant: until a separate release approval exists, MIB fact routes must not be publicly shipped.
for(const rel of ["website/mib","website/oid","website/mib-data"]){
 const p=path.join(root,rel);
 if(fs.existsSync(p))errors.push(`Phase-0 gate: public MIB/OID path exists before release approval: ${rel}`);
}
// Prevent accidental registration as a production tool while still in Phase 0.
const regPath=path.join(root,"src/registry/tool-registry.json");
if(fs.existsSync(regPath)){
 const raw=fs.readFileSync(regPath,"utf8");
 if(/mib[-_ ]?oid|oid[-_ ]?explorer|mib[-_ ]?explorer/i.test(raw))errors.push("Phase-0 gate: MIB/OID Explorer is registered as a production tool before release approval");
}
if(errors.length){console.error("MIB/OID Phase-0 governance gate: FAIL");for(const e of errors)console.error(`- ${e}`);process.exit(1);}
console.log(`MIB/OID Phase-0 governance gate: PASS (${requiredDocs.length} governance docs; no public MIB fact routes)`);
