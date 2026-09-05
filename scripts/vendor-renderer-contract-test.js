#!/usr/bin/env node
/** NetEngineerLab | V2.1-Phase2 | Shared Vendor Renderer contract tests */
"use strict";
const assert=require("assert");
const canonical=require("../website/assets/js/shared-core/canonical-config-model");
const registryApi=require("../website/assets/js/vendor-renderer/vendor-registry");
const rendererApi=require("../website/assets/js/vendor-renderer/renderer-engine");
const model=canonical.create({domain:"demo",family:"text",name:"sample",payload:{value:"x"}});
assert.strictEqual(canonical.validate(model),model);
assert.throws(()=>canonical.validate({...model,modelVersion:"9"}),/version/);
const registry=registryApi.create([{id:"vendor-a",label:"Vendor A",parse:input=>({model:canonical.create({domain:"demo",family:"text",name:"sample",payload:{value:String(input)}})}),render:m=>m.payload.value,capabilities:["parse","render"]}]);
assert.deepStrictEqual(registry.ids,["vendor-a"]);
assert.strictEqual(registry.get("vendor-a").label,"Vendor A");
assert.throws(()=>registry.get("missing"),/unsupported_vendor/);
const renderer=rendererApi.create({registry,semanticView:m=>m.payload});
assert.strictEqual(renderer.render({vendor:"vendor-a",model}),"x");
assert.strictEqual(renderer.roundTrip({vendor:"vendor-a",model}).equivalent,true);
console.log("Vendor Renderer Foundation contract: PASS");
