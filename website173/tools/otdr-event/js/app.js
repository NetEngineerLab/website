const $=id=>document.getElementById(id);
const LANG=document.documentElement.lang.toLowerCase().startsWith("en")?"en":"zh";
const RULES=window.NEL_OTDR_RULES;
const ENGINE=window.OTDREngine;
let rows=[];
let lastAnalysis=null;
let rowSequence=0;

const TEXT={
 zh:{
  normal:"正常",attention:"关注",abnormal:"异常",critical:"严重",
  auto:"自动识别",splice:"熔接事件",connector:"活动连接器",mechanical:"机械接头/反射异常",bend:"疑似弯曲",end:"光纤末端/疑似断纤",ghost:"疑似鬼影",unknown:"未知事件",
  reason:{
   manual:"手工指定事件类型",
   near_end_high_loss_or_reflection:"靠近链路末端，且损耗或反射较强",
   multiple_of_strong_reflection:"位置接近前序强反射事件的倍数，且事件损耗很小",
   secondary_wavelength_loss_increase:"第二波长损耗明显高于主波长，符合弯曲敏感特征",
   reflective_high_loss:"存在明显反射且单点损耗较高",
   reflective_event:"存在明显反射",
   low_loss_non_reflective:"低损耗、非反射事件",
   high_loss_non_reflective:"非反射事件但损耗超过正常熔接默认值"
  },
  advice:{
   splice:{normal:"记录并观察，无需立即处理。",attention:"复测事件损耗，检查熔接质量与双向测试差异。",abnormal:"安排复熔或现场复测，检查接续盒和光纤弯曲。",critical:"优先复熔并使用双向OTDR复核，必要时更换受损光纤段。"},
   connector:{normal:"清洁连接器并记录反射水平。",attention:"清洁端面、检查适配器和插芯匹配。",abnormal:"检查端面污染、损伤、UPC/APC混接和连接松动。",critical:"立即处理强反射或过高损耗连接点，避免影响业务稳定。"},
   mechanical:{normal:"复核机械接头并记录。",attention:"检查机械接头压接、匹配液和连接稳定性。",abnormal:"建议更换为熔接或重新制作机械接头。",critical:"优先处理高损耗强反射接头，并复测相邻事件。"},
   bend:{normal:"复核线路走向。",attention:"检查盘纤半径、入户皮线和机柜内尾纤弯曲。",abnormal:"现场释放弯曲、受压或打折点，并比较1310/1550 nm结果。",critical:"优先处理严重弯曲或受压点，防止链路进一步恶化。"},
   end:{normal:"核对链路设计终点。",attention:"确认是否为正常末端并检查末端反射。",abnormal:"检查断纤、脱落、错误端口或末端连接器。",critical:"立即进行分段测试，使用红光笔、光功率计和OTDR定位断点。"},
   ghost:{normal:"降低脉冲宽度并复测。",attention:"检查强反射源，调整量程、脉冲宽度和平均时间。",abnormal:"确认事件是否随测试参数变化，排除鬼影后再判断真实故障。",critical:"优先消除前序强反射点，避免误判远端事件。"},
   unknown:{normal:"记录事件。",attention:"调整测试参数并复测。",abnormal:"结合波形、双向测试和现场资料判断。",critical:"安排现场定位并核对链路拓扑。"}
  },
  deadZone:"与前一事件间距小于衰减盲区默认值，事件损耗可能受叠加影响。",
  eventDeadZone:"与前一事件间距小于事件盲区默认值，两个反射事件可能无法完全分离。",
  copied:"结果已复制",saved:"记录已保存",csv:"CSV已导出",template:"模板已导出",
  emptyHistory:"暂无保存记录。",imported:"CSV导入完成",invalidFile:"CSV格式不正确或没有有效事件。",
  clearConfirm:"确定清空全部事件吗？",historyConfirm:"确定清空全部历史记录吗？",
  noEvents:"请至少添加一条有效事件。"
 },
 en:{
  normal:"Normal",attention:"Attention",abnormal:"Abnormal",critical:"Critical",
  auto:"Auto detect",splice:"Splice event",connector:"Reflective connector",mechanical:"Mechanical / reflective fault",bend:"Possible bend",end:"Fiber end / possible break",ghost:"Possible ghost",unknown:"Unknown event",
  reason:{
   manual:"Event type selected manually",
   near_end_high_loss_or_reflection:"Near the configured link end with high loss or strong reflection",
   multiple_of_strong_reflection:"Position is close to a multiple of an earlier strong reflection and event loss is small",
   secondary_wavelength_loss_increase:"Secondary-wavelength loss is significantly higher than primary-wavelength loss",
   reflective_high_loss:"Reflective event with elevated insertion loss",
   reflective_event:"Reflective event detected",
   low_loss_non_reflective:"Low-loss non-reflective event",
   high_loss_non_reflective:"Non-reflective event above the normal splice-loss default"
  },
  advice:{
   splice:{normal:"Record and monitor; immediate action is normally unnecessary.",attention:"Retest the event and review splice quality and bidirectional differences.",abnormal:"Schedule resplicing or field retest and inspect the closure and nearby bends.",critical:"Prioritize resplicing and verify with bidirectional OTDR; replace damaged fiber if required."},
   connector:{normal:"Clean the connector and record reflectance.",attention:"Clean the end face and inspect the adapter and ferrule match.",abnormal:"Inspect contamination, damage, UPC/APC mismatch and loose connection.",critical:"Correct the strong reflection or excessive insertion loss immediately."},
   mechanical:{normal:"Review and document the mechanical joint.",attention:"Inspect the joint, index-matching material and connection stability.",abnormal:"Rebuild the joint or replace it with a fusion splice.",critical:"Prioritize the high-loss reflective joint and retest adjacent events."},
   bend:{normal:"Review the cable route.",attention:"Inspect bend radius, drop cable and patch-cord routing.",abnormal:"Release bending or compression and compare 1310/1550 nm results.",critical:"Correct the severe bend or compression point before the link deteriorates further."},
   end:{normal:"Confirm the planned link end.",attention:"Verify that the event is a normal end and review end reflection.",abnormal:"Check for a break, disconnection, wrong port or end connector.",critical:"Perform sectional testing with a VFL, power meter and OTDR to locate the break."},
   ghost:{normal:"Reduce pulse width and retest.",attention:"Inspect the strong reflector and adjust range, pulse width and averaging.",abnormal:"Check whether the event moves with test settings before treating it as a real fault.",critical:"Correct the earlier strong reflection before interpreting remote events."},
   unknown:{normal:"Record the event.",attention:"Adjust test settings and retest.",abnormal:"Use the trace, bidirectional testing and route records to identify the event.",critical:"Schedule field localization and verify the physical topology."}
  },
  deadZone:"Spacing from the previous event is below the attenuation-dead-zone default; measured loss may be affected by event overlap.",
  eventDeadZone:"Spacing from the previous event is below the event-dead-zone default; reflective events may not be fully separated.",
  copied:"Result copied",saved:"Record saved",csv:"CSV exported",template:"Template exported",
  emptyHistory:"No saved records.",imported:"CSV import complete",invalidFile:"The CSV format is invalid or contains no valid events.",
  clearConfirm:"Clear all events?",historyConfirm:"Clear all saved history?",
  noEvents:"Add at least one valid event."
 }
};

const TYPE_OPTIONS=["auto","splice","connector","mechanical","bend","end","ghost","unknown"];

function value(id){return Number.parseFloat($(id).value)}
function finite(v){return Number.isFinite(Number(v))}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function severityLabel(s){return TEXT[LANG][s]||s}
function typeLabel(t){return TEXT[LANG][t]||t}
function temp(button,message){const old=button.innerHTML;button.textContent=message;setTimeout(()=>button.innerHTML=old,1300)}

function thresholdValues(){
 return {
  normalSpliceLossDb:value("normalSpliceLoss"),
  attentionLossDb:value("attentionLoss"),
  criticalLossDb:value("criticalLoss"),
  strongReflectionDb:value("strongReflection"),
  veryStrongReflectionDb:value("veryStrongReflection"),
  bendDeltaDb:value("bendDelta"),
  endLossDb:value("endLoss"),
  eventDeadZoneM:value("eventDeadZone"),
  attenuationDeadZoneM:value("attenuationDeadZone"),
  ghostDistanceToleranceM:value("ghostTolerance"),
  nearEndToleranceM:value("nearEndTolerance")
 };
}

function analysisRules(){
 return {...RULES,thresholds:thresholdValues()};
}

function createRow(data={}){
 rowSequence+=1;
 const row={
  id:rowSequence,
  distanceKm:data.distanceKm??"",
  lossPrimaryDb:data.lossPrimaryDb??"",
  lossSecondaryDb:data.lossSecondaryDb??"",
  reflectanceDb:data.reflectanceDb??"",
  cumulativeLossDb:data.cumulativeLossDb??"",
  manualType:data.manualType??"auto",
  note:data.note??""
 };
 rows.push(row);
 renderEventRows();
}

function removeRow(id){
 rows=rows.filter(row=>row.id!==id);
 renderEventRows();
 analyze();
}

function syncRowsFromDom(){
 rows=rows.map(row=>({
  id:row.id,
  distanceKm:$(`distance-${row.id}`)?.value??"",
  lossPrimaryDb:$(`loss-primary-${row.id}`)?.value??"",
  lossSecondaryDb:$(`loss-secondary-${row.id}`)?.value??"",
  reflectanceDb:$(`reflectance-${row.id}`)?.value??"",
  cumulativeLossDb:$(`cumulative-${row.id}`)?.value??"",
  manualType:$(`manual-${row.id}`)?.value??"auto",
  note:$(`note-${row.id}`)?.value??""
 }));
}

function renderEventRows(){
 const body=$("eventInputBody");
 if(!rows.length){
  body.innerHTML=`<tr><td colspan="8" class="table-empty">${TEXT[LANG].noEvents}</td></tr>`;
  return;
 }
 body.innerHTML=rows.map((row,index)=>`<tr>
  <td class="event-index">${index+1}</td>
  <td><input id="distance-${row.id}" type="number" min="0" step="0.001" value="${escapeHtml(row.distanceKm)}" aria-label="${LANG==="zh"?"事件距离":"Event distance"}"></td>
  <td><input id="loss-primary-${row.id}" type="number" min="0" step="0.01" value="${escapeHtml(row.lossPrimaryDb)}" aria-label="${LANG==="zh"?"主波长损耗":"Primary wavelength loss"}"></td>
  <td><input id="loss-secondary-${row.id}" type="number" min="0" step="0.01" value="${escapeHtml(row.lossSecondaryDb)}" aria-label="${LANG==="zh"?"第二波长损耗":"Secondary wavelength loss"}"></td>
  <td><input id="reflectance-${row.id}" type="number" step="0.1" value="${escapeHtml(row.reflectanceDb)}" aria-label="${LANG==="zh"?"反射率":"Reflectance"}"></td>
  <td><input id="cumulative-${row.id}" type="number" min="0" step="0.01" value="${escapeHtml(row.cumulativeLossDb)}" aria-label="${LANG==="zh"?"累计损耗":"Cumulative loss"}"></td>
  <td><select id="manual-${row.id}" aria-label="${LANG==="zh"?"手工事件类型":"Manual event type"}">${TYPE_OPTIONS.map(type=>`<option value="${type}" ${type===row.manualType?"selected":""}>${typeLabel(type)}</option>`).join("")}</select></td>
  <td class="row-actions"><input id="note-${row.id}" type="text" value="${escapeHtml(row.note)}" placeholder="${LANG==="zh"?"备注":"Note"}"><button type="button" class="delete-row" data-delete="${row.id}" aria-label="${LANG==="zh"?"删除事件":"Delete event"}">×</button></td>
 </tr>`).join("");

 body.querySelectorAll("input,select").forEach(control=>control.addEventListener("input",()=>{
  syncRowsFromDom();
  clearTimeout(window.__otdrAnalyze);
  window.__otdrAnalyze=setTimeout(analyze,180);
 }));
 body.querySelectorAll("[data-delete]").forEach(button=>button.addEventListener("click",()=>removeRow(Number(button.dataset.delete))));
}

function options(){
 const primary=$("primaryWavelength").value;
 const secondary=$("secondaryWavelength").value;
 return {
  rules:analysisRules(),
  linkLengthKm:value("linkLength"),
  primaryWavelength:primary,
  secondaryWavelength:secondary,
  primaryAttenuationDbPerKm:value("primaryAttenuation"),
  secondaryAttenuationDbPerKm:value("secondaryAttenuation"),
  pulseWidthNs:value("pulseWidth"),
  ior:value("ior")
 };
}

function currentEvents(){
 syncRowsFromDom();
 return rows.map(row=>({
  ...row,
  distanceKm:Number.parseFloat(row.distanceKm),
  lossPrimaryDb:Number.parseFloat(row.lossPrimaryDb),
  lossSecondaryDb:row.lossSecondaryDb===""?null:Number.parseFloat(row.lossSecondaryDb),
  reflectanceDb:row.reflectanceDb===""?null:Number.parseFloat(row.reflectanceDb),
  cumulativeLossDb:row.cumulativeLossDb===""?null:Number.parseFloat(row.cumulativeLossDb)
 }));
}

function analyze(){
 const events=currentEvents().filter(event=>finite(event.distanceKm)&&finite(event.lossPrimaryDb));
 if(!events.length){
  lastAnalysis=null;
  renderEmptyResults();
  return;
 }
 const result=ENGINE.analyzeEvents(events,options());
 lastAnalysis={
  ...result,
  meta:{
   project:$("projectName").value.trim()||"Untitled",
   primaryWavelength:$("primaryWavelength").value,
   secondaryWavelength:$("secondaryWavelength").value,
   pulseWidthNs:value("pulseWidth"),
   ior:value("ior"),
   linkLengthKm:value("linkLength"),
   timestamp:new Date().toISOString()
  }
 };
 renderSummary(lastAnalysis);
 renderTopology(lastAnalysis.events);
 renderResultsTable(lastAnalysis.events);
 renderDiagnostics(lastAnalysis);
 if(typeof window.nelTrack==="function"){
  window.nelTrack("otdr_event_analyze",{
   event_count:lastAnalysis.summary.eventCount,
   abnormal_count:lastAnalysis.summary.abnormalCount,
   critical_count:lastAnalysis.summary.criticalCount
  });
 }
}

function renderEmptyResults(){
 ["eventCount","abnormalCount","criticalCount","maxEventLoss","estimatedPrimaryLoss","estimatedSecondaryLoss","reflectiveCount","deadZoneCount"].forEach(id=>$(id).textContent="0");
 $("overallStatus").textContent="—";
 $("overallStatus").className="status-badge";
 $("topology").innerHTML=`<div class="topology-empty">${TEXT[LANG].noEvents}</div>`;
 $("resultBody").innerHTML=`<tr><td colspan="10" class="table-empty">${TEXT[LANG].noEvents}</td></tr>`;
 $("diagnosisList").innerHTML="";
}

function overallSeverity(summary){
 if(summary.criticalCount>0)return"critical";
 if(summary.abnormalCount>0)return"abnormal";
 if(summary.deadZoneCount>0)return"attention";
 return"normal";
}

function renderSummary(result){
 const s=result.summary;
 $("eventCount").textContent=s.eventCount;
 $("abnormalCount").textContent=s.abnormalCount;
 $("criticalCount").textContent=s.criticalCount;
 $("maxEventLoss").textContent=s.maxEventLossDb.toFixed(2);
 $("estimatedPrimaryLoss").textContent=s.estimatedLinkLossPrimaryDb.toFixed(2);
 $("estimatedSecondaryLoss").textContent=s.estimatedLinkLossSecondaryDb.toFixed(2);
 $("reflectiveCount").textContent=s.reflectiveCount;
 $("deadZoneCount").textContent=s.deadZoneCount;
 const overall=overallSeverity(s);
 $("overallStatus").textContent=severityLabel(overall);
 $("overallStatus").className=`status-badge ${overall}`;
}

function renderTopology(events){
 const linkLength=Math.max(value("linkLength"),events.at(-1)?.distanceKm||1,1);
 const topology=$("topology");
 topology.innerHTML=`<div class="fiber-line"></div>${events.map(event=>{
  const left=Math.max(1,Math.min(99,event.distanceKm/linkLength*100));
  return `<button class="event-marker ${event.severity}" style="left:${left}%" title="${escapeHtml(typeLabel(event.detectedType))} · ${event.distanceKm.toFixed(3)} km">
   <span>${event.eventNumber}</span><small>${event.distanceKm.toFixed(2)} km</small>
  </button>`;
 }).join("")}<div class="topology-start">OTDR</div><div class="topology-end">${linkLength.toFixed(2)} km</div>`;
}

function diagnosticText(event){
 const type=event.detectedType;
 const severity=event.severity;
 const reason=TEXT[LANG].reason[event.reason]||event.reason;
 const advice=(TEXT[LANG].advice[type]||TEXT[LANG].advice.unknown)[severity];
 const extra=[];
 if(event.eventDeadZoneAffected)extra.push(TEXT[LANG].eventDeadZone);
 else if(event.deadZoneAffected)extra.push(TEXT[LANG].deadZone);
 return {reason,advice,extra:extra.join(" ")};
}

function renderResultsTable(events){
 $("resultBody").innerHTML=events.map(event=>{
  const detail=diagnosticText(event);
  const secondary=finite(event.lossSecondaryDb)?Number(event.lossSecondaryDb).toFixed(2):"—";
  const reflectance=finite(event.reflectanceDb)?Number(event.reflectanceDb).toFixed(1):"—";
  return `<tr>
   <td>${event.eventNumber}</td>
   <td>${Number(event.distanceKm).toFixed(3)}</td>
   <td>${Number(event.lossPrimaryDb).toFixed(2)}</td>
   <td>${secondary}</td>
   <td>${reflectance}</td>
   <td><span class="type-pill">${typeLabel(event.detectedType)}</span></td>
   <td><span class="severity-pill ${event.severity}">${severityLabel(event.severity)}</span></td>
   <td>${event.gapM===null?"—":Number(event.gapM).toFixed(1)}</td>
   <td>${escapeHtml(detail.reason)}${detail.extra?`<small class="row-note">${escapeHtml(detail.extra)}</small>`:""}</td>
   <td>${escapeHtml(detail.advice)}</td>
  </tr>`;
 }).join("");
}

function renderDiagnostics(result){
 const issues=result.events.filter(event=>event.severity!=="normal");
 if(!issues.length){
  $("diagnosisList").innerHTML=`<article class="diagnosis-card normal"><strong>${severityLabel("normal")}</strong><p>${LANG==="zh"?"未发现超过当前工程阈值的异常事件。仍应结合原始波形、双向测试和现场资料确认。":"No events exceed the current engineering thresholds. Confirm with the original trace, bidirectional testing and route records."}</p></article>`;
  return;
 }
 $("diagnosisList").innerHTML=issues.map(event=>{
  const detail=diagnosticText(event);
  return `<article class="diagnosis-card ${event.severity}">
   <div><span>#${event.eventNumber}</span><strong>${typeLabel(event.detectedType)}</strong><em>${severityLabel(event.severity)}</em></div>
   <p>${event.distanceKm.toFixed(3)} km · ${escapeHtml(detail.reason)}</p>
   <p><b>${LANG==="zh"?"建议":"Action"}：</b>${escapeHtml(detail.advice)}</p>
  </article>`;
 }).join("");
}

function setWavelengthAttenuation(){
 const p=$("primaryWavelength").value;
 const s=$("secondaryWavelength").value;
 if(RULES.fiberAttenuationDbPerKm[p]!==undefined)$("primaryAttenuation").value=RULES.fiberAttenuationDbPerKm[p];
 if(RULES.fiberAttenuationDbPerKm[s]!==undefined)$("secondaryAttenuation").value=RULES.fiberAttenuationDbPerKm[s];
 analyze();
}

function loadSample(){
 rows=[];
 rowSequence=0;
 [
  {distanceKm:0.150,lossPrimaryDb:0.12,lossSecondaryDb:0.14,reflectanceDb:-50,cumulativeLossDb:0.12,manualType:"auto",note:""},
  {distanceKm:2.400,lossPrimaryDb:0.25,lossSecondaryDb:0.68,reflectanceDb:-55,cumulativeLossDb:0.37,manualType:"auto",note:""},
  {distanceKm:5.600,lossPrimaryDb:0.45,lossSecondaryDb:0.48,reflectanceDb:-32,cumulativeLossDb:0.82,manualType:"auto",note:""},
  {distanceKm:8.200,lossPrimaryDb:1.20,lossSecondaryDb:1.35,reflectanceDb:-48,cumulativeLossDb:2.02,manualType:"auto",note:""},
  {distanceKm:10.000,lossPrimaryDb:4.50,lossSecondaryDb:4.70,reflectanceDb:-20,cumulativeLossDb:6.52,manualType:"auto",note:""}
 ].forEach(createRow);
 analyze();
}

function resetAll(){
 $("projectName").value="OTDR Link Event Analysis";
 $("primaryWavelength").value="1310";
 $("secondaryWavelength").value="1550";
 $("linkLength").value=10;
 $("pulseWidth").value=100;
 $("ior").value=1.468;
 $("primaryAttenuation").value=0.35;
 $("secondaryAttenuation").value=0.22;
 const defaults=RULES.thresholds;
 $("normalSpliceLoss").value=defaults.normalSpliceLossDb;
 $("attentionLoss").value=defaults.attentionLossDb;
 $("criticalLoss").value=defaults.criticalLossDb;
 $("strongReflection").value=defaults.strongReflectionDb;
 $("veryStrongReflection").value=defaults.veryStrongReflectionDb;
 $("bendDelta").value=defaults.bendDeltaDb;
 $("endLoss").value=defaults.endLossDb;
 $("eventDeadZone").value=defaults.eventDeadZoneM;
 $("attenuationDeadZone").value=defaults.attenuationDeadZoneM;
 $("ghostTolerance").value=defaults.ghostDistanceToleranceM;
 $("nearEndTolerance").value=defaults.nearEndToleranceM;
 loadSample();
}

function clearEvents(){
 if(!confirm(TEXT[LANG].clearConfirm))return;
 rows=[];rowSequence=0;renderEventRows();analyze();
}

function csvRows(){
 if(!lastAnalysis)analyze();
 if(!lastAnalysis)return[];
 return lastAnalysis.events.map(event=>({
  distance_km:event.distanceKm,
  loss_primary_db:event.lossPrimaryDb,
  loss_secondary_db:finite(event.lossSecondaryDb)?event.lossSecondaryDb:"",
  reflectance_db:finite(event.reflectanceDb)?event.reflectanceDb:"",
  cumulative_loss_db:finite(event.cumulativeLossDb)?event.cumulativeLossDb:"",
  manual_type:event.manualType||"auto",
  detected_type:event.detectedType,
  severity:event.severity,
  note:event.note||""
 }));
}

function downloadCsv(filename,records){
 const headers=Object.keys(records[0]||{distance_km:""});
 const csv="\uFEFF"+[headers.join(","),...records.map(record=>headers.map(key=>`"${String(record[key]??"").replaceAll('"','""')}"`).join(","))].join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);
}

function exportCsv(){
 const records=csvRows();
 if(!records.length)return;
 downloadCsv("otdr_event_analysis.csv",records);
 temp($("exportBtn"),TEXT[LANG].csv);
}

function exportTemplate(){
 downloadCsv("otdr_event_import_template.csv",[{
  distance_km:0.15,loss_primary_db:0.12,loss_secondary_db:0.14,reflectance_db:-50,cumulative_loss_db:0.12,manual_type:"auto",note:""
 }]);
 temp($("templateBtn"),TEXT[LANG].template);
}

function parseCsvLine(line){
 const values=[];let value="";let quoted=false;
 for(let i=0;i<line.length;i++){
  const c=line[i];
  if(c==='"'){
   if(quoted&&line[i+1]==='"'){value+='"';i++}
   else quoted=!quoted;
  }else if(c===","&&!quoted){values.push(value);value=""}
  else value+=c;
 }
 values.push(value);
 return values;
}

function importCsv(file){
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const lines=String(reader.result).replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean);
   const headers=parseCsvLine(lines.shift()).map(h=>h.trim().toLowerCase());
   const records=lines.map(line=>{
    const values=parseCsvLine(line);const item={};
    headers.forEach((header,index)=>item[header]=values[index]??"");
    return item;
   }).filter(item=>finite(item.distance_km)&&finite(item.loss_primary_db));
   if(!records.length)throw new Error("invalid");
   rows=[];rowSequence=0;
   records.forEach(item=>createRow({
    distanceKm:item.distance_km,
    lossPrimaryDb:item.loss_primary_db,
    lossSecondaryDb:item.loss_secondary_db,
    reflectanceDb:item.reflectance_db,
    cumulativeLossDb:item.cumulative_loss_db,
    manualType:TYPE_OPTIONS.includes(item.manual_type)?item.manual_type:"auto",
    note:item.note||""
   }));
   analyze();
   temp($("importBtn"),TEXT[LANG].imported);
  }catch{
   alert(TEXT[LANG].invalidFile);
  }
 };
 reader.readAsText(file);
}

function reportText(){
 if(!lastAnalysis)analyze();
 if(!lastAnalysis)return"";
 const s=lastAnalysis.summary;
 const lines=[
  "NetEngineerLab - OTDR Event Analyzer",
  `${LANG==="zh"?"工程":"Project"}: ${lastAnalysis.meta.project}`,
  `${LANG==="zh"?"主/第二波长":"Primary / secondary wavelength"}: ${lastAnalysis.meta.primaryWavelength} / ${lastAnalysis.meta.secondaryWavelength} nm`,
  `${LANG==="zh"?"链路长度":"Link length"}: ${lastAnalysis.meta.linkLengthKm.toFixed(3)} km`,
  `${LANG==="zh"?"事件数量":"Event count"}: ${s.eventCount}`,
  `${LANG==="zh"?"异常/严重":"Abnormal / critical"}: ${s.abnormalCount} / ${s.criticalCount}`,
  `${LANG==="zh"?"预计主波长总损耗":"Estimated primary loss"}: ${s.estimatedLinkLossPrimaryDb.toFixed(2)} dB`
 ];
 lastAnalysis.events.forEach(event=>{
  lines.push(`#${event.eventNumber} ${event.distanceKm.toFixed(3)} km | ${typeLabel(event.detectedType)} | ${severityLabel(event.severity)} | ${event.lossPrimaryDb.toFixed(2)} dB`);
 });
 return lines.join("\n");
}

async function copyResult(){
 const text=reportText();if(!text)return;
 try{await navigator.clipboard.writeText(text)}
 catch{const area=document.createElement("textarea");area.value=text;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}
 temp($("copyBtn"),TEXT[LANG].copied);
}

function getHistory(){
 try{return JSON.parse(localStorage.getItem("otdrEventHistory")||"[]")}
 catch{return[]}
}

function saveHistory(){
 if(!lastAnalysis)analyze();
 if(!lastAnalysis)return;
 const history=getHistory();
 history.unshift({
  project:lastAnalysis.meta.project,
  timestamp:lastAnalysis.meta.timestamp,
  eventCount:lastAnalysis.summary.eventCount,
  abnormalCount:lastAnalysis.summary.abnormalCount,
  criticalCount:lastAnalysis.summary.criticalCount,
  estimatedLoss:lastAnalysis.summary.estimatedLinkLossPrimaryDb
 });
 localStorage.setItem("otdrEventHistory",JSON.stringify(history.slice(0,12)));
 renderHistory();temp($("saveBtn"),TEXT[LANG].saved);
}

function renderHistory(){
 const history=getHistory();
 $("historyList").innerHTML=history.length?history.slice(0,6).map(item=>`<article class="history-card">
  <strong>${escapeHtml(item.project)}</strong>
  <span>${new Date(item.timestamp).toLocaleString(LANG==="zh"?"zh-CN":"en-US")}</span>
  <p>${LANG==="zh"?"事件":"Events"} ${item.eventCount} · ${LANG==="zh"?"异常":"Abnormal"} ${item.abnormalCount} · ${LANG==="zh"?"严重":"Critical"} ${item.criticalCount}</p>
  <small>${LANG==="zh"?"预计损耗":"Estimated loss"} ${Number(item.estimatedLoss).toFixed(2)} dB</small>
 </article>`).join(""):`<div class="history-empty">${TEXT[LANG].emptyHistory}</div>`;
}

function clearHistory(){
 if(!confirm(TEXT[LANG].historyConfirm))return;
 localStorage.removeItem("otdrEventHistory");renderHistory();
}

document.querySelectorAll(".config-input").forEach(input=>input.addEventListener("input",()=>{clearTimeout(window.__otdrConfig);window.__otdrConfig=setTimeout(analyze,180)}));
$("primaryWavelength").addEventListener("change",setWavelengthAttenuation);
$("secondaryWavelength").addEventListener("change",setWavelengthAttenuation);
$("addEventBtn").addEventListener("click",()=>createRow());
$("sampleBtn").addEventListener("click",loadSample);
$("analyzeBtn").addEventListener("click",analyze);
$("resetBtn").addEventListener("click",resetAll);
$("clearEventsBtn").addEventListener("click",clearEvents);
$("copyBtn").addEventListener("click",copyResult);
$("saveBtn").addEventListener("click",saveHistory);
$("exportBtn").addEventListener("click",exportCsv);
$("templateBtn").addEventListener("click",exportTemplate);
$("printBtn").addEventListener("click",()=>window.print());
$("importBtn").addEventListener("click",()=>$("csvFile").click());
$("csvFile").addEventListener("change",event=>{const file=event.target.files?.[0];if(file)importCsv(file);event.target.value=""});
$("clearHistoryBtn").addEventListener("click",clearHistory);
resetAll();
renderHistory();