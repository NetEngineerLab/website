(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.NELOdfOdnEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const CABLE_STANDARDS=[4,6,8,12,24,36,48,72,96,144,288];
const STATUS_RANK={PASS:4,WARNING:3,FAIL:2,INCONCLUSIVE:1};
const n=(v,d=NaN)=>v===''||v===null||v===undefined?d:Number(v);
const round=(v,p=2)=>Number.isFinite(v)?Math.round(v*10**p)/10**p:null;
const ceilDiv=(a,b)=>Math.ceil(a/b);
function cablePlan(required,maxCableCores=144){
  required=Math.max(0,Math.ceil(n(required,0)));maxCableCores=n(maxCableCores,144);
  const allowed=CABLE_STANDARDS.filter(x=>x<=maxCableCores);
  if(!allowed.length)return {required,provided:0,cables:[],multiCable:false,error:'maxCableCores'};
  const max=allowed.at(-1),cables=[];let remaining=required;
  while(remaining>max){cables.push(max);remaining-=max;}
  if(remaining>0)cables.push(allowed.find(x=>x>=remaining)||max);
  return {required,provided:cables.reduce((a,b)=>a+b,0),cables,multiCable:cables.length>1,error:null};
}
function resourcePlan(input={}){
  const errors=[],target=n(input.targetOnu),stages=n(input.stages),r1=n(input.r1),r2=n(input.r2),r3=n(input.r3),operatorCap=n(input.operatorCap),reservePct=n(input.reservePct),protectionFactor=n(input.protectionFactor),odfTrayCapacity=n(input.odfTrayCapacity),spliceTrayCapacity=n(input.spliceTrayCapacity);
  const posInt=(v,key)=>{if(!Number.isInteger(v)||v<=0)errors.push(key)};
  posInt(target,'targetOnu');if(!Number.isInteger(stages)||stages<1||stages>3)errors.push('stages');posInt(r1,'r1');if(stages>=2)posInt(r2,'r2');if(stages>=3)posInt(r3,'r3');posInt(operatorCap,'operatorCap');
  if(!Number.isFinite(reservePct)||reservePct<0||reservePct>=100)errors.push('reservePct');if(![1,2].includes(protectionFactor))errors.push('protectionFactor');posInt(odfTrayCapacity,'odfTrayCapacity');posInt(spliceTrayCapacity,'spliceTrayCapacity');
  const safeTarget=Number.isInteger(target)&&target>0?target:0,safeStages=[1,2,3].includes(stages)?stages:1,safeR1=Number.isInteger(r1)&&r1>0?r1:1,safeR2=Number.isInteger(r2)&&r2>0?r2:1,safeR3=Number.isInteger(r3)&&r3>0?r3:1,safeCap=Number.isInteger(operatorCap)&&operatorCap>0?operatorCap:1;
  const totalSplit=safeR1*(safeStages>=2?safeR2:1)*(safeStages>=3?safeR3:1),effectiveOnuPerPort=Math.min(totalSplit,safeCap),ponPorts=safeTarget>0?ceilDiv(safeTarget,effectiveOnuPerPort):0;
  const reserveRate=Number.isFinite(reservePct)&&reservePct>=0&&reservePct<100?reservePct/100:0,maxCableCores=n(input.maxCableCores,144),safeProtection=[1,2].includes(protectionFactor)?protectionFactor:1;
  const branches=[ponPorts,ponPorts*safeR1,ponPorts*safeR1*(safeStages>=2?safeR2:1)];
  const labels=['feeder','distribution','drop'];
  const segments={};
  labels.forEach((label,i)=>{const working=Math.ceil(branches[i]*safeProtection),planned=ceilDiv(working,1-reserveRate);segments[label]={workingCores:working,plannedCores:planned,...cablePlan(planned,maxCableCores)};if(segments[label].error)errors.push(`${label}Cable`);});
  const splitterCounts={level1:ponPorts,level2:safeStages>=2?ponPorts*safeR1:0,level3:safeStages>=3?ponPorts*safeR1*safeR2:0};
  const odfPorts=ponPorts,safeOdfTray=Number.isInteger(odfTrayCapacity)&&odfTrayCapacity>0?odfTrayCapacity:1,safeSpliceTray=Number.isInteger(spliceTrayCapacity)&&spliceTrayCapacity>0?spliceTrayCapacity:1;
  const odfTrays=ceilDiv(odfPorts,safeOdfTray),spliceTrays=ceilDiv(segments.feeder.plannedCores+segments.distribution.plannedCores,safeSpliceTray);
  const existing={odfPorts:Math.max(0,n(input.existingOdfPorts,0)),odfTrays:Math.max(0,n(input.existingOdfTrays,0)),spliceTrays:Math.max(0,n(input.existingSpliceTrays,0)),feederCores:Math.max(0,n(input.existingFeederCores,0)),distributionCores:Math.max(0,n(input.existingDistributionCores,0))};
  const required={odfPorts,odfTrays,spliceTrays,feederCores:segments.feeder.plannedCores,distributionCores:segments.distribution.plannedCores};
  const gaps=Object.fromEntries(Object.keys(required).map(k=>[k,Math.max(0,required[k]-existing[k])]));
  const servedCapacity=ponPorts*effectiveOnuPerPort;if(servedCapacity<safeTarget)errors.push('capacity');
  return {valid:errors.length===0,errors:[...new Set(errors)],targetOnu:safeTarget,stages:safeStages,ratios:[safeR1,safeR2,safeR3].slice(0,safeStages),totalSplit,effectiveOnuPerPort,ponPorts,servedCapacity,splitterCounts,segments,odfPorts,odfTrays,spliceTrays,required,existing,gaps,protectionFactor:safeProtection,reserveRate};
}
function direction(s,dir){
  const distance=n(s.distanceKm),alpha=n(dir==='down'?s.downAttenuation:s.upAttenuation),splitterLoss=n(s.splitterLoss),spliceLoss=n(s.spliceCount,0)*n(s.spliceLoss,0),connectorLoss=n(s.connectorCount,0)*n(s.connectorLoss,0),other=n(s.otherLoss,0);
  const values=[distance,alpha,splitterLoss],physical=values.every(Number.isFinite)?distance*alpha+splitterLoss+spliceLoss+connectorLoss+other:NaN;
  const allowances=n(s.agingAllowance,0)+n(s.temperatureAllowance,0)+n(s.maintenanceAllowance,0)+n(s.repairAllowance,0),design=physical+allowances,maxOdn=n(s.maxOdnLoss),pathPenalty=n(s.pathPenalty,0);
  const txMin=n(s[dir+'TxMin']),txMax=n(s[dir+'TxMax']),rxSensitivity=n(s[dir+'RxSensitivity']),rxOverload=n(s[dir+'RxOverload']);
  const missing=[];for(const [key,value] of Object.entries({distance,alpha,splitterLoss,maxOdn,txMin,txMax,rxSensitivity,rxOverload}))if(!Number.isFinite(value))missing.push(key);
  const standardHeadroom=maxOdn-design,lowRx=txMin-physical,sensitivityHeadroom=txMin-physical-pathPenalty-rxSensitivity-allowances,highRx=txMax-physical,overloadHeadroom=rxOverload-highRx;
  return {physicalLoss:round(physical),designLoss:round(design),standardHeadroom:round(standardHeadroom),lowRx:round(lowRx),sensitivityHeadroom:round(sensitivityHeadroom),highRx:round(highRx),overloadHeadroom:round(overloadHeadroom),missing};
}
function opticalScenario(s={},index=0){
  const down=direction(s,'down'),up=direction(s,'up'),distance=n(s.distanceKm),maxReach=n(s.maxReachKm),missing=[...new Set([...down.missing,...up.missing,...(!Number.isFinite(maxReach)?['maxReach']:[])])];
  const margins=[down.standardHeadroom,up.standardHeadroom,down.sensitivityHeadroom,up.sensitivityHeadroom,down.overloadHeadroom,up.overloadHeadroom],minMargin=margins.filter(Number.isFinite).reduce((a,b)=>Math.min(a,b),Infinity);
  let status='PASS';if(missing.length)status='INCONCLUSIVE';else if(distance>maxReach||margins.some(x=>x<0))status='FAIL';else if(minMargin<3)status='WARNING';
  const diagnostics=[];
  if(missing.length)diagnostics.push(`missing:${missing.join(',')}`);
  if(down.standardHeadroom<0||up.standardHeadroom<0)diagnostics.push(`odn-over:${round(Math.abs(Math.min(down.standardHeadroom,up.standardHeadroom)))}dB`);
  if(distance>maxReach)diagnostics.push(`reach-over:${round(distance-maxReach)}km`);
  if(down.sensitivityHeadroom<0||up.sensitivityHeadroom<0)diagnostics.push(`weak-light:${round(Math.abs(Math.min(down.sensitivityHeadroom,up.sensitivityHeadroom)))}dB`);
  if(down.overloadHeadroom<0||up.overloadHeadroom<0)diagnostics.push(`overload:add-attenuation-or-verify-optics:${round(Math.abs(Math.min(down.overloadHeadroom,up.overloadHeadroom)))}dB`);
  if(status==='WARNING')diagnostics.push(`margin-below-planning-threshold:${round(3-minMargin)}dB`);
  return {id:s.id||String.fromCharCode(65+index),name:s.name||`Plan ${String.fromCharCode(65+index)}`,status,minMargin:round(minMargin),distanceKm:distance,maxReachKm:maxReach,down,up,diagnostics};
}
function calculate(input={}){
  const raw=Array.isArray(input.scenarios)?input.scenarios:[],scenarios=raw.map((s,i)=>{const optical=opticalScenario(s,i),resources=resourcePlan({...input,...s}),resourceGap=Object.values(resources.gaps).reduce((a,b)=>a+b,0),overbuild=Math.max(0,resources.servedCapacity-resources.targetOnu);if(!resources.valid){optical.status='INCONCLUSIVE';optical.diagnostics.push(`resource-input:${resources.errors.join(',')}`)}return {...optical,resources,resourceGap,overbuild};});
  const recommended=scenarios.filter(x=>x.status!=='INCONCLUSIVE'&&x.resources.valid).sort((a,b)=>(STATUS_RANK[b.status]-STATUS_RANK[a.status])||(a.resourceGap-b.resourceGap)||(a.overbuild-b.overbuild)||(b.minMargin-a.minMargin)||(a.resources.ponPorts-b.resources.ponPorts))[0]||null;
  const resources=recommended?.resources||scenarios[0]?.resources||resourcePlan(input),bomResources=resources;
  return {ok:scenarios.length>0&&scenarios.some(x=>x.resources.valid),resources,scenarios,recommended:recommended?recommended.id:null,bom:{ponPorts:bomResources.ponPorts,splitters:bomResources.splitterCounts,onu:bomResources.targetOnu,cables:Object.fromEntries(Object.entries(bomResources.segments).map(([k,v])=>[k,v.cables])),odfPorts:bomResources.odfPorts,odfTrays:bomResources.odfTrays,spliceTrays:bomResources.spliceTrays,note:'Planning BOM only; not a procurement quotation.'},metadata:{canonical:'https://netengineerlab.com/tools/odf-odn-resource-planner/',sources:['ITU-T G.984.2','ITU-T G.9807.1','ITU-T G.652','ITU-T G.657','ITU-T G.671'],reviewedAt:'2026-09-30',planningThreshold:'3 dB is a NetEngineerLab planning threshold; verify equipment values against vendor datasheets.'}};
}
function csvCell(v){const s=String(v??'');return /[",\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
function toCSV(r,context={}){const source=context.source||r.metadata.canonical,input=context.input||{};const rows=[['Source',source],['Canonical',r.metadata.canonical],['Reviewed',r.metadata.reviewedAt],['Input JSON',JSON.stringify(input)],[],['Resource','Required','Existing','Gap'],...Object.keys(r.resources.required).map(k=>[k,r.resources.required[k],r.resources.existing[k],r.resources.gaps[k]]),[],['BOM item','Planning quantity'],['PON ports',r.bom.ponPorts],['Level 1 splitters',r.bom.splitters.level1],['Level 2 splitters',r.bom.splitters.level2],['Level 3 splitters',r.bom.splitters.level3],['ONU',r.bom.onu],['Feeder cables',r.bom.cables.feeder.join(' + ')],['Distribution cables',r.bom.cables.distribution.join(' + ')],['Drop cables',r.bom.cables.drop.join(' + ')],['ODF ports',r.bom.odfPorts],['ODF trays',r.bom.odfTrays],['Splice trays',r.bom.spliceTrays],['Boundary',r.bom.note],[],['Plan','Status','Minimum margin dB','Resource gap','Overbuild','Down design loss dB','Up design loss dB'],...r.scenarios.map(x=>[x.name,x.status,x.minMargin,x.resourceGap,x.overbuild,x.down.designLoss,x.up.designLoss]),[],['Result JSON',JSON.stringify(r)]];return rows.map(row=>row.map(csvCell).join(',')).join('\r\n');}
return {CABLE_STANDARDS,cablePlan,resourcePlan,direction,scenario:opticalScenario,calculate,toCSV};
});
