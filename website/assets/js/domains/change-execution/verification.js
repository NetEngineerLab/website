/** NetEngineerLab | V2.1-Phase2-MOPV1 | Vendor pre/post verification plans */
"use strict";
function q(v){return String(v)}
function commands(vendor,logical,members){
 const first=members[0];
 if(vendor==="cisco-ios")return {aggregate:`show etherchannel summary`,detail:`show interfaces ${logical}`,trunk:`show interfaces trunk`,member:first?`show interfaces ${first}`:null,vlan:`show vlan brief`};
 if(vendor==="arista-eos")return {aggregate:`show port-channel dense`,detail:`show interfaces ${logical}`,trunk:`show interfaces ${logical} trunk`,member:first?`show interfaces ${first}`:null,vlan:`show vlan`};
 if(vendor==="huawei-vrp")return {aggregate:`display eth-trunk ${logical.replace(/\D/g,"")}`,detail:`display interface ${logical}`,trunk:`display port vlan ${logical}`,member:first?`display interface ${first}`:null,vlan:`display vlan`};
 if(vendor==="h3c-comware")return {aggregate:`display link-aggregation verbose bridge-aggregation ${logical.replace(/\D/g,"")}`,detail:`display interface ${logical}`,trunk:`display port trunk`,member:first?`display interface ${first}`:null,vlan:`display vlan`};
 if(vendor==="juniper-junos")return {aggregate:`show interfaces ${logical} extensive`,detail:`show interfaces ${logical} terse`,trunk:`show ethernet-switching interface ${logical}`,member:first?`show interfaces ${first} terse`:null,vlan:`show vlans`};
 throw new Error(`unsupported_verification_vendor:${vendor}`);
}
function build(plan){
 const r=plan.reconciliation,logical=r.desiredPlan.logicalInterface,members=r.desiredPlan.resolutions.map(x=>x.interfaceName),c=commands(r.desiredPlan.vendor,logical,members),expectedMembers=members.length,vlans=r.desiredPlan.intent.allowedVlans;
 const mk=(id,phase,command,expectation,required=true)=>Object.freeze({id,phase,command,expectation,required});
 const pre=Object.freeze([
  mk("pre-aggregate-state","pre",c.aggregate,"Capture current aggregate/member state"),
  mk("pre-logical-state","pre",c.detail,`Capture current state of ${logical}`),
  mk("pre-trunk-state","pre",c.trunk,"Capture current trunk/VLAN state"),
  mk("pre-member-state","pre",c.member,"Confirm candidate member link state and errors",Boolean(c.member)),
  mk("pre-vlan-inventory","pre",c.vlan,`Confirm target VLANs exist: ${vlans.join(",")}`)
 ].filter(x=>x.command));
 const post=Object.freeze([
  mk("post-aggregate-up","post",c.aggregate,`Aggregate ${logical} is present and has ${expectedMembers} intended member(s)`),
  mk("post-logical-up","post",c.detail,`${logical} is operational/up with no new interface errors`),
  mk("post-trunk-state","post",c.trunk,`${logical} trunk allows VLANs ${vlans.join(",")}${r.desiredPlan.intent.nativeVlan!=null?`; native/PVID ${r.desiredPlan.intent.nativeVlan}`:""}`),
  mk("post-vlan-inventory","post",c.vlan,"Target VLAN inventory remains present")
 ]);
 const triggers=Object.freeze([
  Object.freeze({code:"AGGREGATE_DOWN",severity:"critical",condition:`${logical} is down or absent after change`,action:"rollback"}),
  Object.freeze({code:"MEMBER_COUNT_MISMATCH",severity:"critical",condition:`Active/bundled member count is below ${expectedMembers}`,action:"rollback"}),
  Object.freeze({code:"TRUNK_SEMANTIC_MISMATCH",severity:"critical",condition:"Post-check VLAN/native-PVID state does not match desired intent",action:"rollback"}),
  Object.freeze({code:"UNEXPECTED_MEMBER",severity:"high",condition:"Aggregate contains a member outside the intended member set",action:"rollback"}),
  Object.freeze({code:"NEW_INTERFACE_ERRORS",severity:"high",condition:"Member or logical interface reports new link/errors attributable to the change",action:"rollback"})
 ]);
 return Object.freeze({version:"1.0.0",pre,post,rollbackTriggers:triggers});
}
module.exports=Object.freeze({build,commands});
