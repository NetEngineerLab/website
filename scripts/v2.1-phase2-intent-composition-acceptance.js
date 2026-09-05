#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),composition=require("../website/assets/js/domains/intent-composition/engine"),lag=require("../website/assets/js/domains/link-aggregation/engine"),ifv=require("../website/assets/js/domains/interface-vlan/engine");
assert.equal(typeof composition.render,"function");assert.equal(typeof lag.renderIntent,"function");assert.equal(typeof ifv.roundTrip,"function");
const r=composition.render({deviceId:"cisco-c9200l-24t-4g",members:[{groupId:"uplink",member:1,port:1},{groupId:"uplink",member:2,port:1}],aggregateId:10,lagMode:"lacp",allowedVlans:[10,20,30,99,100],nativeVlan:99,description:"CORE-UPLINK"});
assert.equal(r.aggregate.equivalent,true);assert.equal(r.trunk.equivalent,true);assert.equal(r.logicalInterface,"Port-channel10");assert.deepEqual(r.steps.map(s=>s.id),["resolve-members","create-aggregate","configure-trunk"]);
const report=path.join(__dirname,"../docs/V2.1_PHASE2_INTENT_COMPOSITION_ACCEPTANCE_REPORT.md");assert.ok(fs.existsSync(report),"acceptance report missing");
console.log("V2.1 Phase2 Intent Composition acceptance: PASS");
