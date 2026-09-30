(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.NELHazardEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const STATUS=['normal','abnormal','na','unverified'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const number=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const esc=(v)=>String(v??'');
function phase(item,prefix=''){
  const status=esc(item[prefix+'Status']||item.status||'unverified').toLowerCase();
  if(!STATUS.includes(status))return {status:'unverified',score:null,level:'unknown',critical:false};
  if(status==='na')return {status,score:null,level:'na',critical:false};
  if(status==='unverified')return {status,score:null,level:'unknown',critical:false};
  if(status==='normal')return {status,score:0,level:'low',critical:false};
  const likelihood=clamp(number(item[prefix+'Likelihood']??item.likelihood,1),1,5);
  const impact=clamp(number(item[prefix+'Impact']??item.impact,1),1,5);
  const exposure=clamp(number(item[prefix+'ExposurePct']??item.exposurePct,100),0,100);
  const control=clamp(number(item[prefix+'ControlEffectivenessPct']??item.controlEffectivenessPct,0),0,100);
  const certainty=clamp(number(item[prefix+'CertaintyPct']??item.certaintyPct,100),0,100);
  const raw=likelihood*impact*4;
  const adjusted=clamp(raw*(0.75+exposure/200)*(1-control/200)*(0.5+certainty/200),0,100);
  const hard=Boolean(item.ruleId&&item.criticalTrigger);
  const score=Math.round(adjusted*10)/10;
  const level=hard?'critical':score>=64?'critical':score>=40?'high':score>=20?'medium':'low';
  return {status,likelihood,impact,exposurePct:exposure,controlEffectivenessPct:control,certaintyPct:certainty,rawScore:raw,score,level,critical:hard,ruleId:hard?esc(item.ruleId):'',trigger:hard?esc(item.criticalTrigger):''};
}
function calculate(input={}){
  const items=Array.isArray(input.items)?input.items:[];
  const results=items.map((item,index)=>({index,id:esc(item.id||`hazard-${index+1}`),category:esc(item.category||'custom'),title:esc(item.title||''),owner:esc(item.owner||''),dueDate:esc(item.dueDate||''),reviewDate:esc(item.reviewDate||''),remediationStatus:esc(item.remediationStatus||'open'),before:phase(item,''),after:phase(item,'after')}));
  const applicable=results.filter(x=>x.before.status!=='na');
  const verified=applicable.filter(x=>x.before.status!=='unverified');
  const open=results.filter(x=>x.before.status==='abnormal');
  const unknown=results.filter(x=>x.before.status==='unverified');
  const critical=open.filter(x=>x.before.critical||x.before.level==='critical');
  const sorted=[...open].sort((a,b)=>(b.before.critical-a.before.critical)||(b.before.score-a.before.score));
  const beforeTotal=open.reduce((s,x)=>s+(x.before.score||0),0);
  const afterTotal=open.reduce((s,x)=>s+(x.after.score||0),0);
  const completionPct=applicable.length?Math.round(verified.length/applicable.length*100):0;
  const riskReductionPct=beforeTotal?clamp(Math.round((beforeTotal-afterTotal)/beforeTotal*1000)/10,0,100):0;
  let overall='safe';
  if(critical.length)overall='critical';else if(open.length)overall='action-required';else if(unknown.length)overall='needs-verification';
  return {ok:items.length>0,errors:items.length?[]:['items'],overall,completionPct,counts:{total:items.length,applicable:applicable.length,verified:verified.length,normal:results.filter(x=>x.before.status==='normal').length,abnormal:open.length,na:results.filter(x=>x.before.status==='na').length,unverified:unknown.length,critical:critical.length},beforeTotal:Math.round(beforeTotal*10)/10,afterTotal:Math.round(afterTotal*10)/10,riskReductionPct,results,topRisks:sorted.slice(0,5),unknownItems:unknown};
}
function csvCell(v){const s=String(v??'');return /[",\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
function toCSV(result){const rows=[['Website','https://netengineerlab.com/tools/network-risk-hidden-hazard-assessment-generator/'],[],['Category','Item','Before status','Before score (0-100)','After status','After score (0-100)','Level','Rule ID','Trigger','Owner','Due date','Review date','Remediation status']];for(const x of result.results)rows.push([x.category,x.title,x.before.status,x.before.score??'',x.after.status,x.after.score??'',x.before.level,x.before.ruleId||'',x.before.trigger||'',x.owner,x.dueDate,x.reviewDate,x.remediationStatus]);return rows.map(r=>r.map(csvCell).join(',')).join('\r\n');}
return {calculate,phase,toCSV,csvCell};
});
