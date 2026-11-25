const $=id=>document.getElementById(id);
const LANG=(function(){const lang=(document.documentElement.lang||"en").toLowerCase();if(lang.startsWith("zh"))return"zh";if(lang.startsWith("es"))return"es";if(lang==="id"||lang.startsWith("id-"))return"id";if(lang.startsWith("pt"))return"pt-BR";return"en";})();
const LIB=window.NEL_BANDWIDTH_UNITS;
const ENGINE=window.BandwidthEngine;
let activeMode="transfer";
let last=null;

const T={
 zh:{
  copied:"结果已复制",saved:"记录已保存",csv:"CSV已导出",empty:"暂无保存记录。",
  clearHistory:"确定清空全部历史记录吗？",healthy:"配置可用",warning:"需要复核",invalid:"参数无效",
  day:"天",hour:"小时",minute:"分钟",second:"秒",
  checkInput:"请检查输入参数和单位。",
  pass:"容量满足目标",fail:"容量不足",
  transfer:"传输时间",required:"所需带宽",concurrency:"并发容量",volume:"数据量"
 },
 en:{
  copied:"Result copied",saved:"Record saved",csv:"CSV exported",empty:"No saved records.",
  clearHistory:"Clear all saved history?",healthy:"Configuration passes",warning:"Review required",invalid:"Invalid input",
  day:"days",hour:"hours",minute:"minutes",second:"seconds",
  checkInput:"Check the input values and units.",
  pass:"Capacity meets target",fail:"Capacity is insufficient",
  transfer:"Transfer time",required:"Required bandwidth",concurrency:"Concurrent capacity",volume:"Data volume"
 }
};
T.es={copied:"Resultado copiado",saved:"Registro guardado",csv:"CSV exportado",empty:"No hay registros guardados.",clearHistory:"¿Borrar todo el historial guardado?",healthy:"Configuración válida",warning:"Revisar",invalid:"Parámetro no válido",day:"días",hour:"horas",minute:"minutos",second:"segundos",checkInput:"Compruebe los valores y las unidades introducidas.",pass:"La capacidad cumple el objetivo",fail:"La capacidad es insuficiente",transfer:"Tiempo de transferencia",required:"Ancho de banda necesario",concurrency:"Capacidad concurrente",volume:"Volumen de datos"};
T.id={copied:"Hasil disalin",saved:"Catatan disimpan",csv:"CSV diekspor",empty:"Belum ada catatan tersimpan.",clearHistory:"Hapus semua riwayat tersimpan?",healthy:"Konfigurasi memenuhi syarat",warning:"Perlu ditinjau",invalid:"Parameter tidak valid",day:"hari",hour:"jam",minute:"menit",second:"detik",checkInput:"Periksa nilai dan satuan yang dimasukkan.",pass:"Kapasitas memenuhi target",fail:"Kapasitas tidak cukup",transfer:"Waktu transfer",required:"Bandwidth yang diperlukan",concurrency:"Kapasitas pengguna bersamaan",volume:"Volume data"};
T["pt-BR"]={copied:"Resultado copiado",saved:"Registro salvo",csv:"CSV exportado",empty:"Nenhum registro salvo.",clearHistory:"Limpar todo o histórico salvo?",healthy:"Configuração atende",warning:"Revisão necessária",invalid:"Parâmetro inválido",day:"dias",hour:"horas",minute:"minutos",second:"segundos",checkInput:"Verifique os valores e as unidades informados.",pass:"A capacidade atende à meta",fail:"A capacidade é insuficiente",transfer:"Tempo de transferência",required:"Largura de banda necessária",concurrency:"Capacidade simultânea",volume:"Volume de dados"};
const DEFAULT_PROJECT={zh:"未命名",es:"Sin título",id:"Tanpa judul","pt-BR":"Sem título"}[LANG]||"Untitled"; function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function n(id){return Number.parseFloat($(id).value)}
function temp(button,message){const old=button.innerHTML;button.textContent=message;setTimeout(()=>button.innerHTML=old,1300)}
function formatNumber(value,digits=2){
 if(!Number.isFinite(Number(value)))return"∞";
 return Number(value).toLocaleString(LANG==="zh"?"zh-CN":(LANG==="es"?"es-ES":(LANG==="id"?"id-ID":(LANG==="pt-BR"?"pt-BR":"en-US"))),{maximumFractionDigits:digits});
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
  select.innerHTML=Object.entries(LIB.rateUnits).map(([id,item])=>`<option value="${id}" ${id===selected?"selected":""}>${(item[LANG]||item.en)}</option>`).join("");
 });
 document.querySelectorAll("[data-size-units]").forEach(select=>{
  const selected=select.dataset.selected||"GB";
  select.innerHTML=Object.entries(LIB.sizeUnits).map(([id,item])=>`<option value="${id}" ${id===selected?"selected":""}>${(item[LANG]||item.en)}</option>`).join("");
 });
 document.querySelectorAll("[data-time-units]").forEach(select=>{
  const selected=select.dataset.selected||"minute";
  select.innerHTML=Object.entries(LIB.timeUnits).map(([id,item])=>`<option value="${id}" ${id===selected?"selected":""}>${(item[LANG]||item.en)}</option>`).join("");
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

function renderFillSnapshot(payloadPct, overheadPct){
  const p = Math.max(0, Math.min(100, Number(payloadPct) || 0));
  const o = Math.max(0, Math.min(100 - p, Number(overheadPct) || Math.max(0, 100 - p)));
  const h = Math.max(0, 100 - p - o);
  const setTxt = (id, v) => { const el = $(id); if (el) el.textContent = `${formatNumber(v, 2)}%`; };
  setTxt("fillPayload", p);
  setTxt("fillOverhead", o);
  setTxt("fillHeadroom", h);
  const bp = $("fillBarPayload"), bo = $("fillBarOverhead"), bh = $("fillBarHeadroom");
  if (bp) bp.style.width = p + "%";
  if (bo) bo.style.width = o + "%";
  if (bh) bh.style.width = h + "%";
}

function renderStatus(status){
 const badge=$("statusBadge");
 badge.className=`status-badge status ${{healthy:"st-pass",warning:"st-marginal",failed:"st-fail",invalid:"st-fail"}[status]} ${status}`;
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
 renderFillSnapshot(result.linkPayloadEfficiency, result.overheadPercent);
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
 renderFillSnapshot(result.combined*100, Math.max(0,100-result.combined*100));
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
 renderFillSnapshot(result.targetUtilizationPercent, Math.max(0,100-result.targetUtilizationPercent));
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
 renderFillSnapshot(result.combined*100, Math.max(0,100-result.combined*100));
 renderStatus(result.status);
}
function calculate(){
 try {

 try{
  if(activeMode==="transfer"){last={mode:"transfer",result:ENGINE.transferTime(transferInput(),LIB),time:new Date().toISOString()};renderTransfer(last.result)}
  else if(activeMode==="required"){last={mode:"required",result:ENGINE.requiredBandwidth(requiredInput(),LIB),time:new Date().toISOString()};renderRequired(last.result)}
  else if(activeMode==="concurrency"){last={mode:"concurrency",result:ENGINE.concurrentCapacity(concurrencyInput(),LIB),time:new Date().toISOString()};renderConcurrency(last.result)}
  else{last={mode:"volume",result:ENGINE.dataVolume(volumeInput(),LIB),time:new Date().toISOString()};renderVolume(last.result)}
  $("validation").textContent="";
  if(typeof window.nelTrack==="function")window.nelTrack("bandwidth_calculate",{mode:activeMode,status:last.result.status});
 }catch(error){last=null;
  $("validation").textContent=T[LANG].checkInput;
  renderStatus("invalid");
 }

 } finally { window.NELToolInputController?.sync?.(); }
}
function resetAll(){
 $("preset").value="ethernet";
 $("projectName").value=LANG==="id"?"Perencanaan bandwidth":(LANG==="pt-BR"?"Planejamento de banda":"Bandwidth Planning");
 $("transferFileSize").value=10;$("transferFileUnit").value="GB";$("transferLinkRate").value=100;$("transferRateUnit").value="Mbps";$("transferConcurrent").value=1;
 $("requiredFileSize").value=50;$("requiredFileUnit").value="GB";$("requiredTime").value=1;$("requiredTimeUnit").value="hour";$("requiredConcurrent").value=1;
 $("capacityLinkRate").value=1;$("capacityRateUnit").value="Gbps";$("capacityPerUserRate").value=5;$("capacityPerUserUnit").value="Mbps";$("capacityBurst").value=120;$("capacityTargetUsers").value=100;
 $("volumeLinkRate").value=100;$("volumeRateUnit").value="Mbps";$("volumeDuration").value=24;$("volumeTimeUnit").value="hour";
 applyPreset();
}
function reportText(){
 if(!last)return"";
 const project=$("projectName").value.trim()||DEFAULT_PROJECT;
 const label=(en,zh,es,id,pt)=>LANG==="zh"?zh:(LANG==="es"?es:(LANG==="id"?id:(LANG==="pt-BR"?pt:en)));
 const lines=["NetEngineerLab - "+(LANG==="id"?"Kalkulator bandwidth dan waktu transfer":(LANG==="pt-BR"?"Calculadora de largura de banda e tempo de transferência":"Bandwidth & Transfer Time Calculator")),`${label("Project","工程","Proyecto","Proyek","Projeto")}: ${project}`,`${label("Mode","模式","Modo","Mode","Modo")}: ${T[LANG][last.mode]}`];
 const r=last.result;
 if(last.mode==="transfer")lines.push(`${label("Transfer time","Transfer time","Tiempo de transferencia","Waktu transfer","Tempo de transferência")}: ${humanTime(r.time)}`,`${label("Per-transfer payload rate","Per-transfer payload rate","Velocidad de carga por transferencia","Laju payload per transfer","Taxa de payload por transferência")}: ${bestRate(r.perTransferBps)}`,`${label("Aggregate payload rate","Aggregate payload rate","Velocidad de carga agregada","Laju payload agregat","Taxa de payload agregada")}: ${bestRate(r.payloadAggregateBps)}`,`${label("Total data","Total data","Datos totales","Total data","Total de dados")}: ${bestSize(r.totalTransferredBytes)}`);
 if(last.mode==="required")lines.push(`${label("Required link rate","Required link rate","Velocidad de enlace requerida","Laju tautan yang diperlukan","Taxa de enlace necessária")}: ${bestRate(r.requiredLinkBps)}`,`${label("Required payload rate","Required payload rate","Velocidad de carga requerida","Laju payload yang diperlukan","Taxa de payload necessária")}: ${bestRate(r.requiredPayloadBps)}`,`${label("Data time","Data time","Tiempo de datos","Waktu data","Tempo de dados")}: ${formatNumber(r.dataSeconds,3)} s`);
 if(last.mode==="concurrency")lines.push(`${label("Maximum users","Maximum users","Usuarios máximos","Pengguna maksimum","Usuários máximos")}: ${r.maxUsers}`,`${label("Available payload rate","Available payload rate","Velocidad de carga disponible","Laju payload tersedia","Taxa de payload disponível")}: ${bestRate(r.availablePayloadBps)}`,`${label("Headroom","Headroom","Margen","Cadangan","Folga")}: ${bestRate(r.headroomBps)}`);
 if(last.mode==="volume")lines.push(`${label("Transferred payload","Transferred payload","Carga transferida","Payload yang ditransfer","Payload transferido")}: ${bestSize(r.totalBytes)}`,`${label("Payload rate","Payload rate","Velocidad de carga","Laju payload","Taxa de payload")}: ${bestRate(r.payloadBps)}`,`${label("30-day volume","30-day volume","Volumen de 30 días","Volume 30 hari","Volume de 30 dias")}: ${bestSize(r.monthly30Bytes)}`);
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
 history.unshift({mode:last.mode,time:new Date().toISOString(),project:$("projectName").value.trim()||DEFAULT_PROJECT,summary:reportText().split("\n").slice(2,5).join(" | ")});
 localStorage.setItem("bandwidthHistory",JSON.stringify(history.slice(0,12)));renderHistory();temp($("saveBtn"),T[LANG].saved);
}
function renderHistory(){
 const history=getHistory();
 $("historyList").innerHTML=history.length?history.slice(0,6).map(item=>`<article class="history-card"><strong>${esc(item.project)}</strong><span>${new Date(item.time).toLocaleString(LANG==="zh"?"zh-CN":(LANG==="es"?"es-ES":(LANG==="id"?"id-ID":(LANG==="pt-BR"?"pt-BR":"en-US"))))} · ${esc(T[LANG][item.mode])}</span><p>${esc(item.summary)}</p></article>`).join(""):`<div class="history-empty">${T[LANG].empty}</div>`;
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







// Keep the existing calculation/modes/history; share only result lifecycle.
window.NELToolInputController={calculate:calculate,calculateSelector:"#calculateBtn",managesValidation:true,isValid:()=>Boolean(last)&&last.mode===activeMode,invalidate:()=>{last=null;},resultActions:"#copyBtn,#saveBtn,#csvBtn,#printBtn",resultValues:"#transferHeadline,#transferPerRate,#transferAggregateRate,#transferSetup,#transferSerialization,#transferTotalData,#transferEfficiencyResult,#transferOverheadResult,#transferConcurrencyResult,#requiredHeadline,#requiredPayload,#requiredPerTransfer,#requiredDataTime,#requiredSetup,#requiredTotalBits,#requiredCombined,#requiredConcurrentResult,#capacityHeadline,#capacityAvailable,#capacityPerUserEngineered,#capacityUsedTarget,#capacityHeadroom,#capacityTargetUtilization,#capacityCombined,#capacityTargetStatus,#volumeHeadline,#volumePayloadRate,#volumeBits,#volumeDaily,#volumeMonthly,#volumeCombined,#volumeDurationSeconds",resultStatus:"#statusBadge",resultDetails:"",resultMeters:"#transferBar,#requiredBar,#capacityBar,#volumeBar",validation:"#validation",requiredInputs:"#transferFileSize,#transferLinkRate,#transferConcurrent,#requiredFileSize,#requiredTime,#requiredConcurrent,#capacityLinkRate,#capacityPerUserRate,#volumeLinkRate,#volumeDuration",inputControls:".nel-tool-input input,.nel-tool-input select,.nel-tool-input textarea"};
