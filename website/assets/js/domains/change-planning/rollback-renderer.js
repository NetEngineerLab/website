/** NetEngineerLab | V2.1-Phase2-ChangePlanningV1 | Vendor-safe teardown + restore rollback renderer */
"use strict";
function cisco(plan){const id=plan.intent.aggregateId,l=[];for(const r of plan.resolutions)l.push(`interface ${r.interfaceName}`,` no channel-group ${id}`," exit");l.push(`no interface ${plan.logicalInterface}`);return l.join("\n")}
function arista(plan){return cisco(plan)}
function huawei(plan){const id=plan.intent.aggregateId,l=[`interface Eth-Trunk${id}`];for(const r of plan.resolutions)l.push(` undo trunkport ${r.interfaceName}`);l.push("quit",`undo interface Eth-Trunk${id}`);return l.join("\n")}
function h3c(plan){const id=plan.intent.aggregateId,l=["system-view"];for(const r of plan.resolutions)l.push(`interface ${r.interfaceName}`," undo port link-aggregation group"," quit");l.push(`undo interface Bridge-Aggregation${id}`);return l.join("\n")}
function juniper(plan){const id=plan.intent.aggregateId,l=[];for(const r of plan.resolutions)l.push(`delete interfaces ${r.interfaceName} ether-options 802.3ad ae${id}`);l.push(`delete interfaces ae${id}`);return l.join("\n")}
const renderers={"cisco-ios":cisco,"huawei-vrp":huawei,"h3c-comware":h3c,"juniper-junos":juniper,"arista-eos":arista};
function teardown(plan){const fn=renderers[plan.vendor];if(!fn)throw new Error(`unsupported_change_rollback_vendor:${plan.vendor}`);return fn(plan)}
function rollback({desiredPlan,currentPlan}){const remove=teardown(desiredPlan),restore=currentPlan?currentPlan.configuration:"";return Object.freeze({strategy:currentPlan?"teardown-desired-then-restore-before":"teardown-created-state",configuration:[remove,restore].filter(Boolean).join("\n\n"),teardown:remove,restore})}
module.exports=Object.freeze({teardown,rollback});
