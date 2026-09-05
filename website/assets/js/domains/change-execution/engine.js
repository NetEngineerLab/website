/** NetEngineerLab | V2.1-Phase2-MOPV1 | Pre/Post verification + risk + execution runbook */
"use strict";
const delta=require("../minimal-delta/engine"),riskScore=require("./risk-score"),verification=require("./verification"),runbook=require("./runbook"),outputEvaluation=require("../verification-output/engine");
function build(input){const plan=delta.build(input),risk=riskScore.assess(plan),verify=verification.build(plan),mop=runbook.build(plan,risk,verify);return Object.freeze({version:"1.0.0",status:plan.status,changePlan:plan,risk,verification:verify,runbook:mop,forward:plan.forward,rollback:plan.rollback});}
function validate(input){try{const result=build(input);return Object.freeze({valid:result.status!=="blocked",result,violations:result.changePlan.conflicts||Object.freeze([])})}catch(error){return Object.freeze({valid:false,error,violations:Object.freeze([{code:String(error.message||error),severity:"error"}])})}}
function evaluateOutputs(execution,outputs,options){return outputEvaluation.evaluate(execution,outputs,options)}
module.exports=Object.freeze({delta,riskScore,verification,runbook,outputEvaluation,build,validate,evaluateOutputs});
