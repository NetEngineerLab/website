#!/usr/bin/env node
"use strict";

const assert=require("assert");
const engine=require("../js/engine.js");

assert.deepEqual(engine.calculate({users:200,perUser:1,infra:20,growth:20,maxHosts:200,vlanStart:100}),{ok:true,plannedHosts:504,vlanCount:3,prefix:"/24",usablePerVlan:254,totalUsable:762,headroom:258,utilization:66.1,vlanRange:"100–102",status:"pass"});
for(const input of [
  {users:-1,perUser:0,infra:0,growth:0,maxHosts:254,vlanStart:1},
  {users:1,perUser:-1,infra:0,growth:0,maxHosts:254,vlanStart:1},
  {users:1,perUser:0,infra:0,growth:-1,maxHosts:254,vlanStart:1},
  {users:1,perUser:0,infra:0,growth:0,maxHosts:1,vlanStart:1},
  {users:1,perUser:0,infra:0,growth:0,maxHosts:65535,vlanStart:1},
  {users:1,perUser:0,infra:0,growth:0,maxHosts:254,vlanStart:0}
])assert.equal(engine.calculate(input).ok,false);
assert.equal(engine.calculate({users:Number.NaN,perUser:0,infra:0,growth:0,maxHosts:254,vlanStart:1}).ok,false);
assert.equal(engine.calculate({users:1,perUser:Number.POSITIVE_INFINITY,infra:0,growth:0,maxHosts:254,vlanStart:1}).ok,false);
assert.equal(engine.calculate({users:1,perUser:0,infra:Number.NEGATIVE_INFINITY,growth:0,maxHosts:254,vlanStart:1}).ok,false);
const capacity=users=>engine.calculate({users,perUser:0,infra:0,growth:0,maxHosts:254,vlanStart:1});
assert.equal(capacity(200).status,"pass");
assert.equal(capacity(220).status,"warning");
assert.equal(capacity(240).status,"fail");
assert.equal(engine.calculate({users:600,perUser:0,infra:0,growth:0,maxHosts:2,vlanStart:4000}).ok,false);
assert.equal(capacity(0).vlanCount,1);

console.log("VLAN and IP capacity engine tests: PASS");
