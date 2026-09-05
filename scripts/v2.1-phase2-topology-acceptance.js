/** NetEngineerLab | V2.1-Phase2-TopologyV1 | Acceptance gate */
"use strict";
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
const required=["website/assets/js/device-topology/topology-model.js","website/assets/js/device-topology/topology-registry.js","website/assets/js/device-topology/interface-topology-resolver.js","website/assets/js/domains/link-aggregation/model.js","website/assets/js/domains/link-aggregation/vendor-registry.js","website/assets/js/domains/link-aggregation/engine.js"];
for(const f of required)if(!fs.existsSync(path.join(root,f)))throw new Error(`missing:${f}`);
cp.execFileSync(process.execPath,[path.join(root,"scripts/device-topology-contract-test.js")],{stdio:"inherit"});
const lag=require(path.join(root,"website/assets/js/domains/link-aggregation/engine.js")); if(lag.registry.ids.length!==5)throw new Error("five_vendor_lag_required");
console.log("V2.1 Phase2 topology + LAG acceptance: PASS");
