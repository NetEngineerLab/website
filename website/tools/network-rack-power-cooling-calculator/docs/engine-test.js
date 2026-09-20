#!/usr/bin/env node
"use strict";
const assert=require('assert'); const e=require('../js/engine.js');
const base={loadW:500,qty:10,util:70,growth:20,redundancy:20,pf:.9,voltage:230,phases:1,breaker:32,hours:24,days:30,rate:.8,cop:3,rackU:42,usedU:24,ambientC:24,humidity:50,latentPct:10,upsEfficiency:.95,pduEfficiency:.97,coolingRedundancy:20,feedCount:2,dualPath:true,n1Units:2};
const r=e.calculate(base); assert.equal(r.ok,true); assert.equal(r.designW,5040); assert.equal(r.current,24.35); assert.equal(r.status,'pass'); assert(r.sensibleW>r.latentW); assert(r.density>0); assert.equal(r.risk.includes('single-path'),false); assert.equal(r.risk.includes('no-n+1'),false); assert(r.after.coolingW>r.before.coolingW); assert.equal(typeof e.toJSON(r),'string'); assert(e.toCSV(r).includes('designW,5040'));
for(const change of [{loadW:0},{qty:0},{util:0},{util:101},{growth:-1},{pf:0},{phases:2},{breaker:0},{hours:25},{rackU:10,usedU:11},{humidity:101},{upsEfficiency:0},{feedCount:0},{n1Units:1.5}])assert.equal(e.calculate({...base,...change}).ok,false);
assert.equal(e.calculate({...base,breaker:25}).status,'warning'); assert.equal(e.calculate({...base,breaker:24}).status,'fail');
console.log('Network rack power and cooling engine tests: PASS');
