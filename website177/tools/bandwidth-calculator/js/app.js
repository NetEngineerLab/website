const $=id=>document.getElementById(id);
const LANG=document.documentElement.lang.toLowerCase().startsWith("en")?"en":"zh";
const LIB=window.NEL_BANDWIDTH_UNITS;
const ENGINE=window.BandwidthEngine;
let activeMode="transfer";
let last=null;

const T={
 zh:{
  copied:"结果已复制",saved:"记录已保存",csv:"CSV已导出",empty:"暂无保存记录。",
  clearHistory:"确定清空全部历史记录吗？",healthy:"配置可用",warning:"需要复核",invalid:"参数无效",
  day:"天",hour:"小时",minute:"分钟",second:"秒",
  pass:"容量满足目标",fail:"容量不足",
  transfer:"传输时间",required:"所需带宽",concurrency:"并发容量",volume:"数据量"
 },
 en:{
  copied:"Result copied",saved:"Record saved",csv:"CSV exported",empty:"No saved records.",
  clearHistory:"Clear all saved history?",healthy:"Configuration passes",warning:"Review required",invalid:"Invalid input",
  day:"days",hour:"hours",minute:"minutes",second:"seconds",
  pass:"Capacity meets target",fail:"Capacity is insufficient",
  transfer:"Transfer time",required:"Required bandwidth",concurrency:"Concurrent capacity",volume:"Data volume"
 }
};
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function n(id){return Number.parseFloat($(id).value)}
function temp(button,message){const old=button.innerHTML;button.textContent=message;setTimeout(()=>button.innerHTML=old,1300)}
function formatNumber(value,digits=2){
 if(!Number.isFinite(Number(value)))return"∞";
 return Number(value).toLocaleString(LANG==="zh"?"zh-CN":"en-US",{maximumFractionDigits:digits});
}
function bestRate(bps){
 const abs=Math.abs(bps);
 for(const unit of ["Tbps","Gbps","Mbps","Kbps","bps"]){
  const f=LIB.rateUnits[unit].factor;
  if(abs>=f||unit==="bps")return`${formatNumber(bps/f,3)} ${unit}`;
 }
}
function bestSize(bytes){
 const abs=Math.abs(bytes);
 for(const unit of ["PB","TB","GB","MB","KB","B"]){
  const f=LIB.sizeUnits[unit].factor;
  if(abs>=f||unit==="B")return`${formatNumber(bytes/f,3)} ${unit}`;
 }
}
function humanTime(time){
 const parts=[];
 if(time.days)parts.push(`${time.days} ${T[LANG].day}`);
 if(time.hours)parts.push(`${time.hours} ${T[LANG].hour}`);
 if(time.minutes)parts.push(`${time.minutes} ${T[LANG].minute}`);
 if(time.secs||!parts.length)parts.push(`${formatNumber(time.secs,2)} ${T[LANG].second}`);
 return parts.join(" ");
}
function setMode(mode){
 activeMode=mode;
 document.querySelectorAll("[data-mode]").forEach(button=>button.classList.toggle("active",button.dataset.mode===mode));
 ["transfer","required","concurrency","volume"].forEach(name=>{
  $(`${name}Panel`).hidden=name!==mode;
  $(`${name}Result`).hidden=name!==mode;
  $(`${name}Metrics`).hidden=name!==mode;
 });
 calculate();
}
function populateUnitSelects(){
 document.querySelectorAll("[data-rate-units]").forEach(select=>{
  const selected=select.dataset.selected||"Mbps";
  select.innerHTML=Object.entries(LIB.rateUnits).map(([id,item])=>`<option value="${id}" ${id===selected?"selected":""}>${item[LANG]}</option>`).join("");
 });
 document.querySelectorAll("[data-size-units]").forEach(select=>{
  const selected=select.dataset.selected||"GB";
  select.innerHTML=Object.entries(LIB.sizeUnits).map(([id,item])=>`<option value="${id}" ${id===selected?"selected":""}>${item[LANG]}</option>`).join("");
 });
 document.querySelectorAll("[data-time-units]").forEach(select=>{
  const selected=select.dataset.selected||"minute";
  select.innerHTML=Object.entries(LIB.timeUnits).map(([id,item])=>`<option value="${id}" ${id===selected?"selected":""}>${item[LANG]}</option>`).join("");
 });
}
function applyPreset(){
 const preset=LIB.presets[$("preset").value];
 if(!preset)return;
 document.querySelectorAll("[data-efficiency]").forEach(input=>input.value=preset.efficiency);
 document.querySelectorAll("[data-utilization]").forEach(input=>input.value=preset.utilization);
 document.querySelectorAll("[data-rtt]").forEach(input=>input.value=preset.rttMs);
 document.querySelectorAll("[data-setup-rtts]").forEach(input=>input.value=preset.setupRtts);
 calculate();
}
function transferInput(){
 return{
  fileSize:n("transferFileSize"),fileUnit:$("transferFileUnit").value,
  linkRate:n("transferLinkRate"),rateUnit:$("transferRateUnit").value,
  efficiencyPercent:n("transferEfficiency"),utilizationPercent:n("transferUtilization"),
  concurrentTransfers:n("transferConcurrent"),rttMs:n("transferRtt"),setupRtts:n("transferSetupRtts")
 };
}
function requiredInput(){
 return{
  fileSize:n("requiredFileSize"),fileUnit:$("requiredFileUnit").value,
  targetTime:n("requiredTime"),timeUnit:$("requiredTimeUnit").value,
  efficiencyPercent:n("requiredEfficiency"),utilizationPercent:n("requiredUtilization"),
  concurrentTransfers:n("requiredConcurrent"),rttMs:n("requiredRtt"),setupRtts:n("requiredSetupRtts")
 };
}
function concurrencyInput(){
 return{
  linkRate:n("capacityLinkRate"),rateUnit:$("capacityRateUnit").value,
  perUserRate:n("capacityPerUserRate"),perUserRateUnit:$("capacityPerUserUnit").value,
  efficiencyPercent:n("capacityEfficiency"),utilizationPercent:n("capacityUtilization"),
  burstFactorPercent:n("capacityBurst"),targetUsers:n("capacityTargetUsers")
 };
}
function volumeInput(){
 return{
  linkRate:n("volumeLinkRate"),rateUnit:$("volumeRateUnit").value,
  duration:n("volumeDuration"),timeUnit:$("volumeTimeUnit").value,
  efficiencyPercent:n("volumeEfficiency"),utilizationPercent:n("volumeUtilization")
 };
}
function renderStatus(status){
 const badge=$("statusBadge");
 badge.className=`status-badge ${status}`;
 badge.textContent=T[LANG][status]||status;
}
function renderTransfer(result){
 $("transferHeadline").textContent=humanTime(result.time);
 $("transferPerRate").textContent=bestRate(result.perTransferBps);
 $("transferAggregateRate").textContent=bestRate(result.payloadAggregateBps);
 $("transferSetup").textContent=`${formatNumber(result.setupSeconds,3)} s`;
 $("transferSerialization").textContent=humanTime(ENGINE.humanTime(result.serializationSeconds));
 $("transferTotalData").textContent=bestSize(result.totalTransferredBytes);
 $("transferEfficiencyResult").textContent=`${formatNumber(result.linkPayloadEfficiency,2)}%`;
 $("transferOverheadResult").textContent=`${formatNumber(result.overheadPercent,2)}%`;
 $("transferConcurrencyResult").textContent=result.concurrent;
 $("transferBar").style.width=Math.max(0,Math.min(100,result.linkPayloadEfficiency))+"%";
 renderStatus(result.status);
}
function renderRequired(result){
 $("requiredHeadline").textContent=bestRate(result.requiredLinkBps);
 $("requiredPayload").textContent=bestRate(result.requiredPayloadBps);
 $("requiredPerTransfer").textContent=bestRate(result.perTransferPayloadBps);
 $("requiredDataTime").textContent=`${formatNumber(result.dataSeconds,3)} s`;
 $("requiredSetup").textContent=`${formatNumber(result.setupSeconds,3)} s`;
 $("requiredTotalBits").textContent=bestSize(result.totalBits/8);
 $("requiredCombined").textContent=`${formatNumber(result.combined*100,2)}%`;
 $("requiredConcurrentResult").textContent=result.concurrent;
 $("requiredBar").style.width=Math.max(0,Math.min(100,result.combined*100))+"%";
 renderStatus(result.status);
}
function renderConcurrency(result){
 $("capacityHeadline").textContent=formatNumber(result.maxUsers,0);
 $("capacityAvailable").textContent=bestRate(result.availablePayloadBps);
 $("capacityPerUserEngineered").textContent=bestRate(result.engineeredPerUserBps);
 $("capacityUsedTarget").textContent=bestRate(result.usedByTarget);
 $("capacityHeadroom").textContent=bestRate(result.headroomBps);
 $("capacityTargetUtilization").textContent=`${formatNumber(result.targetUtilizationPercent,2)}%`;
 $("capacityCombined").textContent=`${formatNumber(result.combined*100,2)}%`;
 $("capacityTargetStatus").textContent=result.targetPass?T[LANG].pass:T[LANG].fail;
 $("capacityTargetStatus").className=`inline-status ${result.targetPass?"healthy":"warning"}`;
 $("capacityBar").style.width=Math.max(0,Math.min(100,result.targetUtilizationPercent))+"%";
 renderStatus(result.status);
}
function renderVolume(result){
 $("volumeHeadline").textContent=bestSize(result.totalBytes);
 $("volumePayloadRate").textContent=bestRate(result.payloadBps);
 $("volumeBits").textContent=`${formatNumber(result.totalBits,0)} bit`;
 $("volumeDaily").textContent=bestSize(result.dailyBytes);
 $("volumeMonthly").textContent=bestSize(result.monthly30Bytes);
 $("volumeCombined").textContent=`${formatNumber(result.combined*100,2)}%`;
 $("volumeDurationSeconds").textContent=`${formatNumber(result.durationSeconds,0)} s`;
 $("volumeBar").style.width=Math.max(0,Math.min(100,result.combined*100))+"%";
 renderStatus(result.status);
}
function calculate(){
 try{
  if(activeMode==="transfer"){last={mode:"transfer",result:ENGINE.transferTime(transferInput(),LIB),time:new Date().toISOString()};renderTransfer(last.result)}
  else if(activeMode==="required"){last={mode:"required",result:ENGINE.requiredBandwidth(requiredInput(),LIB),time:new Date().toISOString()};renderRequired(last.result)}
  else if(activeMode==="concurrency"){last={mode:"concurrency",result:ENGINE.concurrentCapacity(concurrencyInput(),LIB),time:new Date().toISOString()};renderConcurrency(last.result)}
  else{last={mode:"volume",result:ENGINE.dataVolume(volumeInput(),LIB),time:new Date().toISOString()};renderVolume(last.result)}
  $("validation").textContent="";
  if(typeof window.nelTrack==="function")window.nelTrack("bandwidth_calculate",{mode:activeMode,status:last.result.status});
 }catch(error){
  $("validation").textContent=LANG==="zh"?"请检查输入参数和单位。":"Check the input values and units.";
  renderStatus("invalid");
 }
}
function resetAll(){
 $("preset").value="ethernet";
 $("projectName").value="Bandwidth Planning";
 $("transferFileSize").value=10;$("transferFileUnit").value="GB";$("transferLinkRate").value=100;$("transferRateUnit").value="Mbps";$("transferConcurrent").value=1;
 $("requiredFileSize").value=50;$("requiredFileUnit").value="GB";$("requiredTime").value=1;$("requiredTimeUnit").value="hour";$("requiredConcurrent").value=1;
 $("capacityLinkRate").value=1;$("capacityRateUnit").value="Gbps";$("capacityPerUserRate").value=5;$("capacityPerUserUnit").value="Mbps";$("capacityBurst").value=120;$("capacityTargetUsers").value=100;
 $("volumeLinkRate").value=100;$("volumeRateUnit").value="Mbps";$("volumeDuration").value=24;$("volumeTimeUnit").value="hour";
 applyPreset();
}
function reportText(){
 if(!last)return"";
 const project=$("projectName").value.trim()||"Untitled";
 const lines=["NetEngineerLab - Bandwidth & Transfer Time Calculator",`${LANG==="zh"?"工程":"Project"}: ${project}`,`${LANG==="zh"?"模式":"Mode"}: ${T[LANG][last.mode]}`];
 const r=last.result;
 if(last.mode==="transfer")lines.push(`Transfer time: ${humanTime(r.time)}`,`Per-transfer payload rate: ${bestRate(r.perTransferBps)}`,`Aggregate payload rate: ${bestRate(r.payloadAggregateBps)}`,`Total data: ${bestSize(r.totalTransferredBytes)}`);
 if(last.mode==="required")lines.push(`Required link rate: ${bestRate(r.requiredLinkBps)}`,`Required payload rate: ${bestRate(r.requiredPayloadBps)}`,`Data time: ${formatNumber(r.dataSeconds,3)} s`);
 if(last.mode==="concurrency")lines.push(`Maximum users: ${r.maxUsers}`,`Available payload rate: ${bestRate(r.availablePayloadBps)}`,`Headroom: ${bestRate(r.headroomBps)}`);
 if(last.mode==="volume")lines.push(`Transferred payload: ${bestSize(r.totalBytes)}`,`Payload rate: ${bestRate(r.payloadBps)}`,`30-day volume: ${bestSize(r.monthly30Bytes)}`);
 return lines.join("\n");
}
async function copyResult(){
 const text=reportText();if(!text)return;
 try{await navigator.clipboard.writeText(text)}
 catch{const area=document.createElement("textarea");area.value=text;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}
 temp($("copyBtn"),T[LANG].copied);
}
function exportCsv(){
 if(!last)return;
 const rows=reportText().split("\n").map(line=>{const i=line.indexOf(":");return i>=0?[line.slice(0,i),line.slice(i+1).trim()]:[line,""]});
 const csv="\uFEFF"+rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download=`bandwidth_${last.mode}.csv`;a.click();URL.revokeObjectURL(a.href);temp($("csvBtn"),T[LANG].csv);
}
function getHistory(){try{return JSON.parse(localStorage.getItem("bandwidthHistory")||"[]")}catch{return[]}}
function saveHistory(){
 if(!last)return;
 const history=getHistory();
 history.unshift({mode:last.mode,time:new Date().toISOString(),project:$("projectName").value.trim()||"Untitled",summary:reportText().split("\n").slice(2,5).join(" | ")});
 localStorage.setItem("bandwidthHistory",JSON.stringify(history.slice(0,12)));renderHistory();temp($("saveBtn"),T[LANG].saved);
}
function renderHistory(){
 const history=getHistory();
 $("historyList").innerHTML=history.length?history.slice(0,6).map(item=>`<article class="history-card"><strong>${esc(item.project)}</strong><span>${new Date(item.time).toLocaleString(LANG==="zh"?"zh-CN":"en-US")} · ${esc(T[LANG][item.mode])}</span><p>${esc(item.summary)}</p></article>`).join(""):`<div class="history-empty">${T[LANG].empty}</div>`;
}
function clearHistory(){
 if(!confirm(T[LANG].clearHistory))return;
 localStorage.removeItem("bandwidthHistory");renderHistory();
}
populateUnitSelects();
document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.mode)));
document.querySelectorAll("input,select").forEach(control=>{
 if(control.id==="preset")return;
 control.addEventListener("input",()=>{clearTimeout(window.__bw);window.__bw=setTimeout(calculate,100)});
});
$("preset").addEventListener("change",applyPreset);
$("calculateBtn").addEventListener("click",calculate);
$("resetBtn").addEventListener("click",resetAll);
$("copyBtn").addEventListener("click",copyResult);
$("saveBtn").addEventListener("click",saveHistory);
$("csvBtn").addEventListener("click",exportCsv);
$("printBtn").addEventListener("click",()=>window.print());
$("clearHistoryBtn").addEventListener("click",clearHistory);
resetAll();setMode("transfer");renderHistory();