#!/usr/bin/env node
"use strict";
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {isolateServiceWorkerCache}=require('./lib/service-worker-cache-isolation');
const {toolPagePrecacheAssets}=require('./lib/tool-page-precache-assets');
const {parsePrecacheAssets}=require('./service-worker-precache');
const registry=require('../src/registry/tool-registry.json').filter(tool=>tool.status==='active');
const origin='https://nel.test';

async function exercise(source,slug,scenario){
 const cacheName=source.match(/const (?:CACHE|C)\s*=\s*["']([^"']+)/)[1];
 const scope=origin+'/tools/'+slug+'/';
 const current=new Map(),foreign=new Map();const opened=[],network=[],deleted=[];
 const oldCache='nel-'+slug+'-locale-v-old',foreignName='nel-other-tool-locale-v-old';
 const asset=origin+'/assets/css/fb-v3-prod.css?v=current';
 const reply=body=>({body,ok:true,clone(){return reply(body)}});
 if(scenario==='old-query')current.set(asset.replace('current','old'),'current-old-query');
 else current.set(asset,'current-version');
 foreign.set(asset,'foreign-exact-query');foreign.set(asset.replace('current','old'),'foreign-old-query');
 current.set(scope+'zh/','current-navigation');foreign.set(scope+'zh/','foreign-navigation');
 const handlers={};
 const cache={match:async(request,options)=>{
  const url=new URL(typeof request==='string'?request:request.url,scope).href;
  const entry=[...current].find(([key])=>options?.ignoreSearch?key.split('?')[0]===url.split('?')[0]:key===url);
  return entry?reply(entry[1]):undefined;
 },put:async(request,response)=>current.set(typeof request==='string'?request:request.url,response.body)};
 vm.runInNewContext(source,{
  URL,console,location:new URL(scope),self:{addEventListener:(name,callback)=>handlers[name]=callback,clients:{claim:async()=>{}},skipWaiting:async()=>{}},
  caches:{open:async name=>{opened.push(name);assert.equal(name,cacheName,'must open this tool current cache');return cache},match:()=>{throw new Error('global cross-tool lookup')},keys:async()=>[cacheName,oldCache,foreignName],delete:async name=>{deleted.push(name);assert.notEqual(name,foreignName,'activation must preserve other tool caches');return true}},
  fetch:async request=>{network.push(request.url);if(scenario==='offline'||scenario==='navigation')throw new Error('offline');return reply('network-current-version')}
 });
 let activation;handlers.activate({waitUntil:promise=>activation=promise});await activation;
 assert(!deleted.includes(foreignName));
 const navigation=scenario==='navigation';const request={method:'GET',url:navigation?scope+'zh/?planning=custom':asset,mode:navigation?'navigate':'cors'};
 let pending;handlers.fetch({request,respondWith:promise=>pending=promise});assert(pending,slug+' fetch handler');
 const response=await pending;
 assert(response,slug+'/'+scenario+' must return a response');
 assert.equal(response.body,scenario==='old-query'?'network-current-version':navigation?'current-navigation':'current-version',slug+'/'+scenario);
 assert(opened.length>0);if(scenario==='old-query')assert.equal(network.length,1,'new fingerprint must reach network when only an old fingerprint is cached');
 assert.equal(foreign.get(asset),'foreign-exact-query','foreign tool data must be retained');
}

(async()=>{let workers=0,checks=0;for(const tool of registry){
 const file=path.resolve(__dirname,'../website/tools',tool.id,'sw.js');if(!fs.existsSync(file))continue;
 const source=fs.readFileSync(file,'utf8');assert.equal(isolateServiceWorkerCache(source),source,tool.id+' generated cache isolation is missing or non-idempotent');
 const assets=parsePrecacheAssets(source),toolRoot=path.dirname(file),siteRoot=path.resolve(__dirname,'../website');
 for(const locale of ['', 'zh', 'es']){const pageFile=path.join(toolRoot,locale,'index.html');if(!fs.existsSync(pageFile))continue;for(const asset of toolPagePrecacheAssets(fs.readFileSync(pageFile,'utf8'),pageFile,toolRoot,siteRoot))assert(assets.includes(asset),tool.id+'/'+locale+' exact HTML resource must be precached: '+asset);}
 for(const scenario of ['foreign-collision','old-query','offline','navigation']){await exercise(source,tool.id,scenario);checks++;}workers++;
 }assert.equal(workers,46);console.log(`Service Worker cache isolation PASS: ${workers} actual workers, ${checks} behaviors; own-cache resources, exact fingerprints, offline navigation, foreign data retained.`);
})().catch(error=>{console.error(error);process.exitCode=1});
