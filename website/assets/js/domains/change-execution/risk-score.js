/** NetEngineerLab | V2.1-Phase2-MOPV1 | Deterministic change risk scoring */
"use strict";
function clamp(n){return Math.max(0,Math.min(100,Math.round(n)))}
function band(score){return score>=75?"critical":score>=50?"high":score>=25?"medium":"low"}
function assess(plan){
 const r=plan.reconciliation,s=r.semantic;let score=0;const factors=[];const add=(points,code,message)=>{if(points<=0)return;score+=points;factors.push(Object.freeze({code,points,message}))};
 if(plan.status==="blocked")add(100,"BLOCKED_CONFLICT","Pre-change conflict prevents safe execution");
 if(!r.current.aggregate)add(12,"NEW_AGGREGATE","Creates a new logical aggregate interface");
 add(s.aggregate.members.added.length*8,"MEMBERS_ADDED",`${s.aggregate.members.added.length} aggregate member(s) added`);
 add(s.aggregate.members.removed.length*12,"MEMBERS_REMOVED",`${s.aggregate.members.removed.length} aggregate member(s) removed`);
 if(s.aggregate.mode.changed&&r.current.aggregate)add(18,"LAG_MODE_CHANGE","Changes link aggregation mode");
 add(s.trunk.allowedVlans.added.length>0?Math.min(8,2+s.trunk.allowedVlans.added.length):0,"VLANS_ADDED","Adds VLAN membership");
 add(s.trunk.allowedVlans.removed.length>0?Math.min(18,6+s.trunk.allowedVlans.removed.length*3):0,"VLANS_REMOVED","Removes VLAN membership");
 if(s.trunk.nativeVlan.changed)add(16,"NATIVE_VLAN_CHANGE","Changes native/PVID VLAN");
 if(s.trunk.mode.changed&&r.current.trunk)add(15,"SWITCHPORT_MODE_CHANGE","Changes interface switching mode");
 if(s.trunk.description.changed)add(1,"DESCRIPTION_CHANGE","Changes interface description only");
 if(plan.snapshot.opaqueLines.length)add(Math.min(10,Math.ceil(plan.snapshot.opaqueLines.length/10)),"OPAQUE_CONTEXT","Running config contains unmanaged/opaque context");
 const final=clamp(score);return Object.freeze({version:"1.0.0",score:final,band:band(final),factors:Object.freeze(factors),requiresPeerReview:final>=50,requiresMaintenanceWindow:final>=50,blocked:plan.status==="blocked"});
}
module.exports=Object.freeze({assess,band});
