(function(){
"use strict";
const $=id=>document.getElementById(id);
const lang=(document.documentElement.lang||"en").toLowerCase().startsWith("zh")?"zh":"en";
const T={
 en:{
  waiting:"Enter parameters and calculate.",invalid:"Please check the highlighted input fields.",
  hours:"hours",days:"days",meets:"Target met",notMet:"Target not met",
  healthy:"Estimated runtime",modelSimple:"Simplified Ah/energy model",modelPeukert:"Peukert-adjusted estimate",
  copied:"Result copied.",saved:"Record saved.",cleared:"History cleared.",noHistory:"No saved project records.",
  confirmClear:"Clear all saved records?",equipment:"Equipment",quantity:"Qty",unitCurrent:"Unit current",totalCurrent:"Total current",remove:"Remove",
  warnings:{
   highRate:"The per-string discharge rate is high. Manufacturer constant-power or constant-current discharge tables are essential.",
   mediumRate:"The discharge rate is above a light standby rate; verify the selected battery's published discharge table.",
   targetNotMet:"The estimated runtime is shorter than the target runtime.",
   currentRise:"For a constant-power load, battery current rises materially as the bus approaches cutoff voltage.",
   manyParallel:"Five or more parallel strings require careful current sharing, protection, cabling and maintenance design.",
   agedBattery:"The remaining-capacity factor is below 70%; replacement risk should be reviewed.",
   lowTemperature:"The temperature factor significantly reduces available capacity.",
   leadAcidDeepDischarge:"The selected usable depth exceeds 80% for a lead-acid preset. Confirm cycle life and end-voltage requirements.",
   lithiumBms:"For lithium systems, verify BMS cutoff, module parallel limits, current sharing and vendor runtime data.",
   peukertApproximation:"Peukert correction is an engineering estimate. Constant-power ICT loads and real discharge curves may differ.",
   manufacturerCurve:"Final sizing must be checked against manufacturer discharge data at the required end voltage and temperature.",
   noPowerFactor:"A -48 V DC load has no AC power factor input. Use DC watts or DC amperes; path efficiency represents DC losses."
  }
 },
 zh:{
  waiting:"请输入参数并执行计算。",invalid:"请检查标记的输入参数。",
  hours:"小时",days:"天",meets:"满足目标",notMet:"未满足目标",
  healthy:"预计续航时间",modelSimple:"简化Ah/能量模型",modelPeukert:"Peukert放电倍率修正估算",
  copied:"结果已复制。",saved:"记录已保存。",cleared:"历史记录已清空。",noHistory:"暂无已保存的工程记录。",
  confirmClear:"确认清空全部历史记录？",equipment:"设备",quantity:"数量",unitCurrent:"单台电流",totalCurrent:"总电流",remove:"删除",
  warnings:{
   highRate:"单组电池放电倍率较高，必须使用厂家恒功率或恒电流放电表复核。",
   mediumRate:"当前放电倍率已高于轻载备用场景，请核对所选电池的厂家放电数据。",
   targetNotMet:"预计续航时间短于目标续航时间。",
   currentRise:"恒功率负载下，母线电压接近截止值时电池电流会明显增大。",
   manyParallel:"并联组数达到5组或以上，应重点校核均流、保护、线缆及维护方案。",
   agedBattery:"剩余容量系数低于70%，应评估蓄电池更换风险。",
   lowTemperature:"温度修正系数较低，可用容量明显下降。",
   leadAcidDeepDischarge:"铅酸电池预设的可用放电深度超过80%，请核对循环寿命及终止电压要求。",
   lithiumBms:"锂电系统必须核对BMS截止条件、模块并联限制、均流能力和厂家续航数据。",
   peukertApproximation:"Peukert修正属于工程估算，恒功率ICT负载与实际放电曲线可能存在差异。",
   manufacturerCurve:"最终选型必须按目标终止电压和温度，使用电池厂家放电表校核。",
   noPowerFactor:"-48V直流负载不存在交流功率因数。请输入直流功率或直流电流；路径效率仅表示直流侧损耗。"
  }
 }
}[lang];

const state={rows:[],last:null};
const fieldIds=["projectName","batteryPreset","model","nominalCellV","floatCellV","startCellV","cutoffCellV","seriesCells","parallelStrings","capacityAh","ratedHours","peukertExponent","loadMode","loadPowerW","loadCurrentA","loadMarginPct","pathEfficiencyPct","dodPct","agePct","tempPct","curvePct","targetRuntimeH"];

function val(id){return Number($(id).value)}
function format(n,d=2){return Number(n).toLocaleString(lang==="zh"?"zh-CN":"en-US",{maximumFractionDigits:d})}
function runtimeText(h){
 if(!Number.isFinite(h))return"—";
 if(h<24)return`${format(h,2)} ${T.hours}`;
 const days=Math.floor(h/24), hours=h-days*24;
 return `${days} ${T.days} ${format(hours,1)} ${T.hours}`;
}
function toast(message){
 const el=$("toast");el.textContent=message;el.classList.add("show");
 setTimeout(()=>el.classList.remove("show"),1800);
}
function equipmentOptions(selected){
 return window.NEL_BATTERY_PRESETS.equipment.map(item=>`<option value="${item.id}" ${item.id===selected?"selected":""}>${item.label[lang]}</option>`).join("");
}
function addEquipment(id="olt-chassis",qty=1,amps){
 const preset=window.NEL_BATTERY_PRESETS.equipment.find(x=>x.id===id)||window.NEL_BATTERY_PRESETS.equipment.at(-1);
 state.rows.push({
  uid:globalThis.crypto?.randomUUID?globalThis.crypto.randomUUID():String(Date.now()+Math.random()),
  id:preset.id,
  qty:Number(qty)||1,
  amps:Number.isFinite(Number(amps))?Number(amps):preset.amps
 });
 renderEquipment();
}
function renderEquipment(){
 const body=$("equipmentBody");
 body.innerHTML=state.rows.map(row=>`<tr data-uid="${row.uid}">
  <td data-label="${T.equipment}"><select class="eq-type">${equipmentOptions(row.id)}</select></td>
  <td data-label="${T.quantity}"><input class="eq-qty" type="number" min="0" step="1" value="${row.qty}"></td>
  <td data-label="${T.unitCurrent}"><div class="input-wrap compact"><input class="eq-amps" type="number" min="0" step="0.1" value="${row.amps}"><span>A</span></div></td>
  <td data-label="${T.totalCurrent}" class="eq-total">${format(row.qty*row.amps,1)} A</td>
  <td><button type="button" class="remove-row" aria-label="${T.remove}">×</button></td>
 </tr>`).join("");
 body.querySelectorAll("tr").forEach(tr=>{
  const row=state.rows.find(x=>x.uid===tr.dataset.uid);
  tr.querySelector(".eq-type").addEventListener("change",e=>{
   const p=window.NEL_BATTERY_PRESETS.equipment.find(x=>x.id===e.target.value);
   row.id=e.target.value;if(p&&p.id!=="custom")row.amps=p.amps;
   renderEquipment();calculate();
  });
  tr.querySelector(".eq-qty").addEventListener("input",e=>{
   row.qty=Math.max(0,Number(e.target.value)||0);
   tr.querySelector(".eq-total").textContent=`${format(row.qty*row.amps,1)} A`;
   calculate();
  });
  tr.querySelector(".eq-amps").addEventListener("input",e=>{
   row.amps=Math.max(0,Number(e.target.value)||0);
   tr.querySelector(".eq-total").textContent=`${format(row.qty*row.amps,1)} A`;
   calculate();
  });
  tr.querySelector(".remove-row").addEventListener("click",()=>{
   state.rows=state.rows.filter(x=>x.uid!==row.uid);renderEquipment();calculate();
  });
 });
 $("equipmentTotal").textContent=`${format(equipmentCurrent(),1)} A`;
}
function equipmentCurrent(){return state.rows.reduce((sum,row)=>sum+row.qty*row.amps,0)}
function updateLoadMode(){
 const mode=$("loadMode").value;
 $("equipmentSection").hidden=mode!=="equipment";
 $("currentField").hidden=mode!=="current";
}
function applyPreset(key){
 const p=window.NEL_BATTERY_PRESETS.batteries[key];if(!p)return;
 ["nominalCellV","floatCellV","startCellV","cutoffCellV","seriesCells","capacityAh","ratedHours","peukertExponent","dodPct","agePct","tempPct","curvePct","pathEfficiencyPct"].forEach(id=>$(id).value=p[id]);
 $("chemistry").value=p.chemistry;
 calculate();
}
function collect(){
 const loadMode=$("loadMode").value;
 const nominalV=val("nominalCellV")*val("seriesCells");
 let baseLoadW=0;
 let baseLoadCurrentA=0;
 if(loadMode==="equipment")baseLoadCurrentA=equipmentCurrent();
 if(loadMode==="current")baseLoadCurrentA=val("loadCurrentA");
 baseLoadW=baseLoadCurrentA*nominalV;
 return{
  projectName:$("projectName").value.trim()||"NetEngineerLab Battery Project",
  chemistry:$("chemistry").value,model:$("model").value,
  nominalCellV:val("nominalCellV"),floatCellV:val("floatCellV"),startCellV:val("startCellV"),cutoffCellV:val("cutoffCellV"),
  seriesCells:val("seriesCells"),parallelStrings:val("parallelStrings"),capacityAh:val("capacityAh"),ratedHours:val("ratedHours"),peukertExponent:val("peukertExponent"),
  baseLoadW,baseLoadCurrentA,loadMarginPct:val("loadMarginPct"),pathEfficiencyPct:val("pathEfficiencyPct"),
  dodPct:val("dodPct"),agePct:val("agePct"),tempPct:val("tempPct"),curvePct:val("curvePct"),targetRuntimeH:val("targetRuntimeH"),
  loadMode,equipmentRows:state.rows.map(x=>({...x}))
 };
}
function clearErrors(){document.querySelectorAll(".invalid").forEach(x=>x.classList.remove("invalid"))}
function calculate(){
 clearErrors();
 const input=collect();
 const result=window.NELBatteryEngine.calculate(input);
 if(!result.ok){
  result.errors.forEach(id=>{const el=$(id);if(el)el.closest(".field")?.classList.add("invalid")});
  $("runtimeValue").textContent="—";$("statusBadge").textContent=T.invalid;
  return;
 }
 state.last={input,result};
 renderResult(input,result);
}
function renderResult(input,r){
 $("runtimeValue").textContent=runtimeText(r.runtimeH);
 $("runtimeModel").textContent=r.model==="simple"?T.modelSimple:T.modelPeukert;
 const met=r.targetRuntimeH<=0||r.runtimeH>=r.targetRuntimeH;
 $("statusBadge").textContent=met?T.meets:T.notMet;
 $("summaryCard").className=`summary-card ${met?"healthy":"warning"}`;
 const set=(id,value)=>$(id).textContent=value;
 set("nominalVoltage",`${format(r.nominalV)} V`);
 set("floatVoltage",`${format(r.floatV)} V`);
 set("cutoffVoltage",`${format(r.cutoffV)} V`);
 set("designLoad",`${format(r.designLoadCurrentA,1)} A / ${format(r.designLoadW/1000,2)} kW`);
 set("averageCurrent",`${format(r.currentAverageA)} A`);
 set("cutoffCurrent",`${format(r.currentCutoffA)} A`);
 set("nameplateEnergy",`${format(r.nameplateWh/1000,2)} kWh`);
 set("usableEnergy",`${format(r.deliveredWh/1000,2)} kWh`);
 set("correctedCapacity",`${format(r.effectiveAh,1)} Ah`);
 set("cRate",`${format(r.cRate,3)} C`);
 set("cellCount",`${r.seriesCells} × ${r.parallelStrings} = ${r.cellsTotal}`);
 set("usableFactor",`${format(r.usableFactor,1)}%`);
 set("simpleRuntime",runtimeText(r.simpleRuntimeH));
 set("peukertRuntime",runtimeText(r.peukertRuntimeH));
 set("requiredTotalAh",r.targetRuntimeH?`${format(r.requiredTotalAh,0)} Ah`:"—");
 set("requiredAhPerString",r.targetRuntimeH?`${format(r.requiredAhPerString,0)} Ah`:"—");
 set("requiredStrings",r.targetRuntimeH?String(r.requiredParallelStrings):"—");
 const gapText=r.targetRuntimeH?`${r.targetGapH>=0?"+":""}${format(r.targetGapH,2)} h`:"—";
 set("targetGap",gapText);set("targetCoverageGap",gapText);
 const pct=r.targetRuntimeH>0?Math.min(100,r.runtimeH/r.targetRuntimeH*100):100;
 $("targetBar").style.width=`${Math.max(0,pct)}%`;
 $("targetBar").className=`bar-fill ${met?"":"danger"}`;

 const breakdown=[
  [lang==="zh"?"基础直流负载电流":"Base DC load current",`${format(r.baseLoadCurrentA,1)} A`],
  [lang==="zh"?"基础直流负载功率（48V换算）":"Base DC load power (nominal-voltage conversion)",`${format(r.baseLoadW,0)} W`],
  [lang==="zh"?"含余量设计电流":"Design current with margin",`${format(r.designLoadCurrentA,1)} A`],
  [lang==="zh"?"含余量设计功率":"Design power with margin",`${format(r.designLoadW,0)} W`],
  [lang==="zh"?"电池侧输入功率":"Battery-side power",`${format(r.batteryPowerW,0)} W`],
  [lang==="zh"?"平均放电电压":"Average discharge voltage",`${format(r.averageV,2)} V`],
  [lang==="zh"?"单组平均电流":"Average current per string",`${format(r.currentPerStringA,2)} A`],
  [lang==="zh"?"铭牌总容量":"Total nameplate capacity",`${format(r.nameplateAh,0)} Ah`],
  [lang==="zh"?"综合可用系数":"Combined usable factor",`${format(r.usableFactor,2)}%`]
 ];
 $("breakdownBody").innerHTML=breakdown.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join("");
 $("warningList").innerHTML=r.warnings.map(w=>`<li class="${w.severity}">${T.warnings[w.code]||w.code}</li>`).join("");
 $("equipmentTotal").textContent=`${format(equipmentCurrent(),1)} A`;
}
function reportText(){
 if(!state.last)return"";
 const {input:i,result:r}=state.last;
 return[
  `NetEngineerLab -48V Telecom Battery Runtime Calculator V1.1`,
  `${lang==="zh"?"工程名称":"Project"}: ${i.projectName}`,
  `${lang==="zh"?"计算模型":"Model"}: ${r.model}`,
  `${lang==="zh"?"电池配置":"Battery bank"}: ${r.seriesCells}S × ${r.parallelStrings}P, ${r.capacityAh} Ah/string`,
  `${lang==="zh"?"标称电压":"Nominal voltage"}: ${r.nominalV} V`,
  `${lang==="zh"?"设计负载电流":"Design load current"}: ${r.designLoadCurrentA} A`,
  `${lang==="zh"?"设计负载功率":"Design load power"}: ${r.designLoadW} W`,
  `${lang==="zh"?"平均电流":"Average current"}: ${r.currentAverageA} A`,
  `${lang==="zh"?"预计续航":"Estimated runtime"}: ${r.runtimeH} h`,
  `${lang==="zh"?"可用能量":"Delivered usable energy"}: ${r.deliveredWh} Wh`,
  `${lang==="zh"?"目标续航":"Target runtime"}: ${r.targetRuntimeH} h`,
  `${lang==="zh"?"所需总容量":"Required total capacity"}: ${r.requiredTotalAh} Ah`,
  `${lang==="zh"?"所需并联组数":"Required parallel strings"}: ${r.requiredParallelStrings}`,
  `${lang==="zh"?"说明":"Note"}: ${T.warnings.manufacturerCurve}`
 ].join("\n");
}
async function copyResult(){
 if(!state.last)return;
 try{await navigator.clipboard.writeText(reportText());toast(T.copied)}
 catch{const ta=document.createElement("textarea");ta.value=reportText();document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast(T.copied)}
}
function saveHistory(){
 if(!state.last)return;
 const list=JSON.parse(localStorage.getItem("nelBatteryHistory")||"[]");
 list.unshift({ts:new Date().toISOString(),input:state.last.input,result:state.last.result});
 localStorage.setItem("nelBatteryHistory",JSON.stringify(list.slice(0,12)));
 renderHistory();toast(T.saved);
}
function renderHistory(){
 const list=JSON.parse(localStorage.getItem("nelBatteryHistory")||"[]");
 const root=$("historyList");
 if(!list.length){root.innerHTML=`<div class="empty">${T.noHistory}</div>`;return}
 root.innerHTML=list.map((item,index)=>`<article class="history-item">
  <div><strong>${item.input.projectName}</strong><small>${new Date(item.ts).toLocaleString()}</small></div>
  <div><b>${runtimeText(item.result.runtimeH)}</b><span>${format(item.result.designLoadW,0)} W · ${item.result.seriesCells}S×${item.result.parallelStrings}P</span></div>
  <button data-history="${index}" type="button">${lang==="zh"?"载入":"Load"}</button>
 </article>`).join("");
 root.querySelectorAll("[data-history]").forEach(btn=>btn.addEventListener("click",()=>loadHistory(list[Number(btn.dataset.history)])));
}
function loadHistory(item){
 const i=item.input;
 Object.keys(i).forEach(k=>{if($(k)&&typeof i[k]!=="object")$(k).value=i[k]});
 state.rows=(i.equipmentRows||[]).map(x=>({
  ...x,
  amps:Number.isFinite(Number(x.amps))?Number(x.amps):(Number(x.watts)||0)/48,
  uid:globalThis.crypto?.randomUUID?globalThis.crypto.randomUUID():String(Date.now()+Math.random())
 }));
 updateLoadMode();renderEquipment();calculate();scrollTo({top:0,behavior:"smooth"});
}
function exportCsv(){
 if(!state.last)return;
 const {input:i,result:r}=state.last;
 const rows=[
  ["Project",i.projectName],["Model",r.model],["Series cells",r.seriesCells],["Parallel strings",r.parallelStrings],
  ["Capacity Ah/string",r.capacityAh],["Nominal voltage V",r.nominalV],["Design current A",r.designLoadCurrentA],["Design load W",r.designLoadW],
  ["Average current A",r.currentAverageA],["Runtime h",r.runtimeH],["Target h",r.targetRuntimeH],
  ["Required total Ah",r.requiredTotalAh],["Required strings",r.requiredParallelStrings]
 ];
 const csv=rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="netengineerlab-48v-battery-runtime.csv";a.click();URL.revokeObjectURL(a.href);
}
function reset(){
 $("batteryPreset").value="vrla2v";applyPreset("vrla2v");
 $("projectName").value="Telecom DC Backup Design";
 $("parallelStrings").value=2;$("loadMode").value="equipment";$("loadMarginPct").value=15;$("targetRuntimeH").value=8;
 state.rows=[];addEquipment("olt-chassis",1);addEquipment("transport",2);addEquipment("monitor",1);
 updateLoadMode();renderEquipment();calculate();
}

$("batteryPreset").innerHTML=Object.entries(window.NEL_BATTERY_PRESETS.batteries).map(([key,p])=>`<option value="${key}">${p.label[lang]}</option>`).join("");
$("batteryPreset").addEventListener("change",e=>applyPreset(e.target.value));
$("loadMode").addEventListener("change",()=>{updateLoadMode();calculate()});
$("addEquipmentBtn").addEventListener("click",()=>{addEquipment("custom",1,0);calculate()});
$("calculateBtn").addEventListener("click",calculate);
$("resetBtn").addEventListener("click",reset);
$("copyBtn").addEventListener("click",copyResult);
$("saveBtn").addEventListener("click",saveHistory);
$("csvBtn").addEventListener("click",exportCsv);
$("printBtn").addEventListener("click",()=>window.print());
$("clearHistoryBtn").addEventListener("click",()=>{if(confirm(T.confirmClear)){localStorage.removeItem("nelBatteryHistory");renderHistory();toast(T.cleared)}});
fieldIds.forEach(id=>$(id)?.addEventListener("input",()=>{if(id==="batteryPreset")return;calculate()}));
document.querySelectorAll("[data-advanced-toggle]").forEach(btn=>btn.addEventListener("click",()=>{
 const panel=$("advancedPanel"),open=panel.hidden;panel.hidden=!open;btn.setAttribute("aria-expanded",String(open));
}));
reset();renderHistory();
})();