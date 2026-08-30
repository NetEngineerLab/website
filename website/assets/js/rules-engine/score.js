"use strict";

function scoreFindings(findings,policy){
  if(!Array.isArray(findings))throw new Error("Findings must be an array");
  const dimensions=Object.fromEntries(policy.dimensions.map(id=>[id,{score:policy.baseScore,deduction:0,findings:0}]));
  const rootDeductions=new Map();
  const trace=[];
  let overallCap=policy.baseScore;
  for(const finding of findings){
    const severity=policy.severities[finding.severity];
    if(!severity)throw new Error(`Unknown finding severity: ${finding.severity}`);
    const root=String(finding.rootCauseKey||finding.ruleId);
    const used=rootDeductions.get(root)||0;
    const allowed=Math.max(0,policy.rootCauseDeduplication.maximumSameRootCauseDeduction-used);
    const applied=Math.min(severity.deduction,allowed);
    rootDeductions.set(root,used+applied);
    if(severity.overallScoreCap!==null)overallCap=Math.min(overallCap,severity.overallScoreCap);
    for(const dimension of finding.dimensions){
      if(!dimensions[dimension])throw new Error(`Unknown finding dimension: ${dimension}`);
      dimensions[dimension].deduction+=applied;
      dimensions[dimension].findings++;
    }
    trace.push(Object.freeze({ruleId:finding.ruleId,severity:finding.severity,rootCauseKey:root,requestedDeduction:severity.deduction,appliedDeduction:applied,dimensions:[...finding.dimensions]}));
  }
  for(const value of Object.values(dimensions)){value.score=Math.max(0,policy.baseScore-value.deduction);Object.freeze(value)}
  const average=Object.values(dimensions).reduce((sum,value)=>sum+value.score,0)/policy.dimensions.length;
  const overall=Math.max(0,Math.min(overallCap,Math.round(average)));
  return Object.freeze({
    policyVersion:policy.scorePolicyVersion,overall,
    passFail:policy.displayPassFail&&policy.passThreshold!==null?(overall>=policy.passThreshold?"PASS":"FAIL"):null,
    counts:Object.freeze(Object.fromEntries(["CRITICAL","HIGH","MEDIUM","INFO"].map(level=>[level,findings.filter(item=>item.severity===level).length]))),
    dimensions:Object.freeze(dimensions),trace:Object.freeze(trace),disclaimer:Object.freeze({...policy.disclaimer})
  });
}

const api=Object.freeze({scoreFindings});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(typeof window!=="undefined")window.NetEngineerLabRulesScore=api;
