/** NetEngineerLab | V2.1-Phase2-MOPV1 | Execution runbook generator */
"use strict";
function build(plan,risk,verification){
 const steps=[];let n=1;const push=(kind,title,payload={})=>steps.push(Object.freeze({order:n++,kind,title,...payload}));
 push("control","Change authorization",{instruction:risk.requiresPeerReview?"Obtain peer review/change approval before execution":"Standard operator approval"});
 for(const x of verification.pre)push("precheck",x.id,{command:x.command,successCriteria:x.expectation,onFailure:"STOP - do not apply change"});
 if(plan.status==="noop")push("decision","No configuration change required",{instruction:"Current canonical state already matches desired intent."});
 else if(plan.status==="blocked")push("decision","Change blocked",{instruction:"Resolve all blocking conflicts before execution."});
 else {
  push("execute","Apply minimal forward delta",{configuration:plan.forward.configuration,successCriteria:"CLI accepts the intended minimal delta without unexpected errors"});
  for(const x of verification.post)push("postcheck",x.id,{command:x.command,successCriteria:x.expectation,onFailure:"Evaluate rollback triggers immediately"});
  push("decision","Rollback gate",{triggers:verification.rollbackTriggers,instruction:"If any rollback trigger is met, stop forward execution and apply rollback configuration."});
  push("rollback","Rollback configuration",{configuration:plan.rollback.configuration,successCriteria:"Pre-change managed canonical state is restored"});
 }
 return Object.freeze({version:"1.0.0",title:`MOP - ${plan.reconciliation.desiredPlan.vendor} ${plan.reconciliation.desiredPlan.logicalInterface}`,status:plan.status,risk,steps:Object.freeze(steps)});
}
module.exports=Object.freeze({build});
