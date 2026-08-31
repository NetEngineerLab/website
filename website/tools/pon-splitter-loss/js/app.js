const $=id=>document.getElementById(id);
const LANG=document.documentElement.lang.toLowerCase().startsWith("en")?"en":"zh";
const T={
 zh:{
  healthy:"✓ 健康",warning:"⚠ 风险",failed:"✕ 超限",
  invalid:"请检查输入：数量必须为非负整数，衰减系数必须大于0，系统距离至少为0.1 km，分光损耗必须来自支持列表，最大发送功率不得低于最小值，过载门限必须高于灵敏度。",
  copied:"结果已复制",saved:"记录已保存",csv:"CSV 已导出",empty:"暂无记录。完成计算后点击“保存记录”。",confirm:"确定清空全部记录吗？",
  good:"分光级联在当前标准ODN预算内，最小/最大发送功率对应的接收窗口和工程余量满足设计。",
  warn:"链路仍可工作，但剩余预算、灵敏度余量或过载余量偏小。建议复核分光器实测损耗、连接器数量和工程余量。",
  bad:"分光级联或其他无源损耗导致预算超限，预计接收功率可能低于灵敏度或超过过载门限。"
 },
 en:{
  healthy:"✓ Healthy",warning:"⚠ Caution",failed:"✕ Failed",
  invalid:"Check inputs. Counts must be non-negative integers; attenuation must be positive; reach must be at least 0.1 km; splitter loss must be supported; maximum Tx must not be below minimum; overload must be above sensitivity.",
  copied:"Result copied",saved:"Record saved",csv:"CSV exported",empty:"No saved records yet.",confirm:"Clear all saved records?",
  good:"The splitter cascade remains within the current standard ODN budget, and the receive window for minimum/maximum transmit power meets the design margin.",
  warn:"The link remains usable, but budget, sensitivity or overload margin is limited. Verify measured splitter loss, connector count and engineering reserve.",
  bad:"The splitter cascade or other passive losses exceed the budget, or estimated receive power falls outside the receiver window."
 }
};
const splitterPresets={
 custom:null,
 "8x8":{s1:"10.5",s2:"10.5",s3:"0"},
 "1x16":{s1:"13.8",s2:"0",s3:"0"},
 "1x32":{s1:"17",s2:"0",s3:"0"},
 "1x64":{s1:"20.5",s2:"0",s3:"0"},
 "2x8":{s1:"3.7",s2:"10.5",s3:"0"},
 "4x8":{s1:"7.2",s2:"10.5",s3:"0"},
 "4x4x4":{s1:"7.2",s2:"7.2",s3:"7.2"}
};
const systemProfiles={
 custom:null,
 "gpon-b":{tx:1.5,txMax:5,sens:-27,over:-8,penalty:.5},
 "gpon-c":{tx:3,txMax:7,sens:-30,over:-8,penalty:1}
};
const attenuationMap={"1310":0.35,"1490":0.25,"1550":0.20};
let last=null;
const num=id=>Number.parseFloat($(id).value);

function setAttenuation(){
 const wave=$("wavelength").value;
 if(attenuationMap[wave]!==undefined){
  $("attenuation").value=attenuationMap[wave].toFixed(2);
  $("attenuation").readOnly=true;
 }else{
  $("attenuation").readOnly=false;
 }
}
function applySplitterPreset(){
 const p=splitterPresets[$("preset").value];
 if(!p)return;
 $("splitter1").value=p.s1;$("splitter2").value=p.s2;$("splitter3").value=p.s3;
 calculate();
}
function applySystemProfile(){
 const p=systemProfiles[$("systemProfile").value];
 if(!p)return;
 $("txPower").value=p.tx;$("txMaxPower").value=p.txMax;$("rxSensitivity").value=p.sens;$("rxOverload").value=p.over;$("opticalPenalty").value=p.penalty;
 calculate();
}
function invalidate(){
 last=null;
 $("ratioResult").textContent="—";
 ["splitterLossResult","remaining","rxPower","maxDistance","standardBudget","opticalMaxDistance","idealLoss","excessLoss","physicalLoss","designLoss","sensMargin","overMargin","fiberLoss","spliceTotal","connectorTotal","otherResult","opticalPenaltyResult","marginResult"].forEach(id=>$(id).textContent="—");
 ["stage1Ratio","stage2Ratio","stage3Ratio","stage1Loss","stage2Loss","stage3Loss"].forEach(id=>$(id).textContent="—");
 $("summaryCard").className="summary-card";$("healthBadge").textContent=LANG==="zh"?"输入无效":"Invalid input";
 $("diagnosis").className="diagnosis";$("diagnosisText").textContent=T[LANG].invalid;
 ["copyBtn","saveBtn","csvBtn"].forEach(id=>$(id).disabled=true);
}
function calculate(){
 const v={
  project:$("projectName").value.trim()||"Untitled",
  distance:num("distance"),attenuation:num("attenuation"),
  spliceCount:num("spliceCount"),spliceLoss:num("spliceLoss"),
  connectorCount:num("connectorCount"),connectorLoss:num("connectorLoss"),
  s1:num("splitter1"),s2:num("splitter2"),s3:num("splitter3"),
  other:num("otherLoss"),penalty:num("opticalPenalty"),margin:num("margin"),
  tx:num("txPower"),txMax:num("txMaxPower"),sens:num("rxSensitivity"),over:num("rxOverload"),
  systemReach:num("systemReach"),wavelength:$("wavelength").value
 };
 const result=window.NELPonSplitterLossEngine.calculate(v);
 if(!result.ok){invalidate();$("validation").textContent=T[LANG].invalid;return}
 $("validation").textContent="";
 const {r1,r2,r3,totalRatio,splitterLoss,idealLoss,excessLoss,fiberLoss,spliceTotal,connectorTotal,fixedPhysical,physicalLoss,designLoss,rawWindow,standardBudget,remaining,rx,rxMax,sensMargin,overMargin,opticalMax,effectiveMax,status}=result;
 last={...v,totalRatio,splitterLoss,idealLoss,excessLoss,fiberLoss,spliceTotal,connectorTotal,fixedPhysical,physicalLoss,designLoss,rawWindow,standardBudget,remaining,rx,rxMax,sensMargin,overMargin,opticalMax,effectiveMax,status,timestamp:new Date().toISOString()};
 const set=(id,x)=>$(id).textContent=x.toFixed(2);
 $("ratioResult").textContent="1:"+totalRatio;
 set("splitterLossResult",splitterLoss);set("remaining",remaining);$("rxPower").textContent=`${rx.toFixed(2)} to ${rxMax.toFixed(2)}`;set("maxDistance",effectiveMax);
 set("standardBudget",standardBudget);set("opticalMaxDistance",opticalMax);
 set("idealLoss",idealLoss);set("excessLoss",excessLoss);set("physicalLoss",physicalLoss);set("designLoss",designLoss);
 set("sensMargin",sensMargin);set("overMargin",overMargin);
 set("fiberLoss",fiberLoss);set("spliceTotal",spliceTotal);set("connectorTotal",connectorTotal);
 set("otherResult",v.other);set("opticalPenaltyResult",v.penalty);set("marginResult",v.margin);
 ["copyBtn","saveBtn","csvBtn"].forEach(id=>$(id).disabled=false);
 const card=$("summaryCard"),diag=$("diagnosis");
 card.className="summary-card "+status;diag.className="diagnosis "+status;
 $("healthBadge").textContent=T[LANG][status];
 $("diagnosisText").textContent=status==="healthy"?T[LANG].good:status==="warning"?T[LANG].warn:T[LANG].bad;
 ["stage1Ratio","stage2Ratio","stage3Ratio"].forEach((id,i)=>$(id).textContent="1:"+[r1,r2,r3][i]);
 ["stage1Loss","stage2Loss","stage3Loss"].forEach((id,i)=>$(id).textContent=[v.s1,v.s2,v.s3][i].toFixed(2)+" dB");
 if(typeof window.nelTrack==="function"){
  window.nelTrack("pon_splitter_calculate",{status,total_ratio:totalRatio,standard_budget:Number(standardBudget.toFixed(2)),remaining:Number(remaining.toFixed(2))});
 }
}
function reset(){
 $("preset").value="8x8";$("systemProfile").value="gpon-c";
 $("projectName").value="GPON C+ 1:64 Splitter Design";
 $("distance").value=10;$("wavelength").value="1490";setAttenuation();
 $("spliceCount").value=6;$("spliceLoss").value=.10;$("connectorCount").value=4;$("connectorLoss").value=.30;
 $("splitter1").value="10.5";$("splitter2").value="10.5";$("splitter3").value="0";
 $("otherLoss").value=0;$("opticalPenalty").value=1;$("margin").value=3;$("systemReach").value=20;
 $("txPower").value=3;$("txMaxPower").value=7;$("rxSensitivity").value=-30;$("rxOverload").value=-8;
 calculate();
}
function report(){
 if(!last)calculate();if(!last)return null;const r=last;
 return[
  "NetEngineerLab - PON Splitter Loss Calculator",
  `${LANG==="zh"?"工程":"Project"}: ${r.project}`,
  `${LANG==="zh"?"总分光比":"Total split ratio"}: 1:${r.totalRatio}`,
  `${LANG==="zh"?"分光器总损耗":"Splitter loss"}: ${r.splitterLoss.toFixed(2)} dB`,
  `${LANG==="zh"?"标准ODN预算":"Standard ODN budget"}: ${r.standardBudget.toFixed(2)} dB`,
  `${LANG==="zh"?"物理ODN损耗":"Physical ODN loss"}: ${r.physicalLoss.toFixed(2)} dB`,
  `${LANG==="zh"?"设计ODN损耗":"Design ODN loss"}: ${r.designLoss.toFixed(2)} dB`,
  `${LANG==="zh"?"剩余预算":"Remaining budget"}: ${r.remaining.toFixed(2)} dB`,
  `${LANG==="zh"?"预计接收功率范围":"Estimated RX range"}: ${r.rx.toFixed(2)} to ${r.rxMax.toFixed(2)} dBm`,
  `${LANG==="zh"?"有效最大距离":"Effective max distance"}: ${r.effectiveMax.toFixed(2)} km`,
  `${LANG==="zh"?"状态":"Status"}: ${T[LANG][r.status]}`
 ].join("\n");
}
function temp(btn,msg){const old=btn.innerHTML;btn.textContent=msg;setTimeout(()=>btn.innerHTML=old,1400)}
async function copyResult(){
 const txt=report();
 if(!txt)return;
 try{await navigator.clipboard.writeText(txt)}
 catch{const area=document.createElement("textarea");area.value=txt;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}
 temp($("copyBtn"),T[LANG].copied);
}
function getHistory(){try{return JSON.parse(localStorage.getItem("ponSplitterHistory")||"[]")}catch{return[]}}
function save(){
 if(!last)calculate();if(!last)return;const history=getHistory();history.unshift(last);
 localStorage.setItem("ponSplitterHistory",JSON.stringify(history.slice(0,12)));renderHistory();temp($("saveBtn"),T[LANG].saved);
}
function renderHistory(){
 const history=getHistory(),container=$("historyList");
 if(!history.length){container.innerHTML=`<div class="history-empty">${T[LANG].empty}</div>`;return}
 container.innerHTML=history.slice(0,6).map(r=>`<article class="history-item"><h3>${escapeHtml(r.project)}</h3><p>${new Date(r.timestamp).toLocaleString(LANG==="zh"?"zh-CN":"en-US")}</p><p>${LANG==="zh"?"总分光比":"Ratio"}: <strong>1:${r.totalRatio}</strong></p><p>${LANG==="zh"?"剩余预算":"Remaining"}: ${r.remaining.toFixed(2)} dB</p><p>${T[LANG][r.status]}</p></article>`).join("");
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function clearHistory(){if(confirm(T[LANG].confirm)){localStorage.removeItem("ponSplitterHistory");renderHistory()}}
function exportCsv(){
 if(!last)calculate();if(!last)return;const r=last;
 const rows=[["Project",r.project],["Total ratio","1:"+r.totalRatio],["Splitter loss dB",r.splitterLoss.toFixed(2)],["Standard ODN budget dB",r.standardBudget.toFixed(2)],["Physical ODN loss dB",r.physicalLoss.toFixed(2)],["Design ODN loss dB",r.designLoss.toFixed(2)],["Remaining budget dB",r.remaining.toFixed(2)],["Estimated minimum RX dBm",r.rx.toFixed(2)],["Estimated maximum RX dBm",r.rxMax.toFixed(2)],["Optical maximum distance km",r.opticalMax.toFixed(2)],["Effective maximum distance km",r.effectiveMax.toFixed(2)],["Status",T[LANG][r.status]]];
 const csv="\uFEFF"+rows.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="pon_splitter_loss_report.csv";a.click();URL.revokeObjectURL(a.href);temp($("csvBtn"),T[LANG].csv);
}
["projectName","distance","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","splitter1","splitter2","splitter3","otherLoss","opticalPenalty","margin","systemReach","txPower","txMaxPower","rxSensitivity","rxOverload"].forEach(id=>$(id).addEventListener("input",()=>{invalidate();clearTimeout(window.__pon);window.__pon=setTimeout(calculate,160)}));
$("wavelength").addEventListener("change",()=>{setAttenuation();calculate()});
$("preset").addEventListener("change",applySplitterPreset);
$("systemProfile").addEventListener("change",applySystemProfile);
$("calculateBtn").addEventListener("click",calculate);
$("resetBtn").addEventListener("click",reset);
$("copyBtn").addEventListener("click",copyResult);
$("saveBtn").addEventListener("click",save);
$("csvBtn").addEventListener("click",exportCsv);
$("printBtn").addEventListener("click",()=>window.print());
$("clearHistoryBtn").addEventListener("click",clearHistory);
setAttenuation();calculate();renderHistory();
