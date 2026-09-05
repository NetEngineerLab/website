#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),planner=require("../website/assets/js/domains/change-planning/engine");
assert.equal(typeof planner.build,"function");assert.equal(typeof planner.validate,"function");assert.equal(typeof planner.rollbackRenderer.rollback,"function");
const p=planner.build({desired:{deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,30,99,100],nativeVlan:99,description:"CORE-UPLINK"},observed:{knownVlans:[10,20,30,99,100]}});
assert.equal(p.status,"ready");assert.ok(p.forward.configuration);assert.ok(p.rollback.configuration);assert.ok(p.configurationDiff.added.length);assert.equal(p.phases[0].id,"precheck");assert.equal(p.phases.at(-1).id,"verify");
const report=path.join(__dirname,"../docs/V2.1_PHASE2_CHANGE_PLANNING_ACCEPTANCE_REPORT.md");assert.ok(fs.existsSync(report),"acceptance report missing");
console.log("V2.1 Phase2 Change Planning acceptance: PASS");
