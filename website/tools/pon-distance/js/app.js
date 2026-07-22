const $=id=>document.getElementById(id);
const LANG=document.documentElement.lang.toLowerCase().startsWith("en")?"en":"zh";
const T={
 zh:{
  healthy:"✓ 满足设计",warning:"⚠ 仅物理可达",failed:"✕ 预算不足",limited:"◇ 系统距离受限",
  invalid:"请检查输入：距离、数量、损耗、余量和系统距离上限必须为有效非负数；dBm功率可以为负数。",
  copied:"结果已复制",saved:"记录已保存",csv:"CSV 已导出",empty:"暂无记录。完成计算后点击“保存记录”。",confirm:"确定清空全部记录吗？",
  opticalLimiter:"限制因素：光功率预算。无源损耗和工程余量决定了当前可用距离。",
  systemLimiter:"限制因素：系统/协议距离上限。光功率预算允许更远距离，但实际有效距离受系统能力限制。",
  equalLimiter:"光功率预算距离与系统距离上限基本相同。",
  healthyText:"规划距离不超过有效最大距离，且已保留设定的工程余量。当前设计满足预算要求。",
  warningText:"规划距离的物理损耗尚未超过设备预算，但无法完整保留设定的工程余量。建议缩短距离、降低分光损耗或增加设备预算。",
  failedText:"规划距离下的物理链路损耗已经超过设备最大通道预算，预计接收光功率低于灵敏度。",
  limitedText:"光功率预算允许当前距离，但有效最大距离由系统/协议距离上限控制。应同时核对OLT配置、测距能力和网络规划限制。",
  causesHealthy:["核对实际光缆路由是否与规划距离一致","保留维护连接、老化和温度变化余量","上线后用光功率计和OTDR复核"],
  causesWarning:["减少分光级联或采用更低损耗器件","检查连接器和熔接点数量是否可优化","提高工程预算或缩短规划距离"],
  causesFailed:["降低总分光比或减少级联","缩短光纤距离或采用更低衰减光缆","核对设备最小发送功率和接收灵敏度","检查固定损耗参数是否过大"],
  causesLimited:["核对设备支持的最大逻辑/测距距离","检查OLT端口及配置模板","不要只依据光预算决定可部署距离"]
 },
 en:{
  healthy:"✓ Design passes",warning:"⚠ Physical reach only",failed:"✕ Insufficient budget",limited:"◇ System reach limited",
  invalid:"Check inputs. Distance, counts, losses, margin and system reach must be valid non-negative values. dBm values may be negative.",
  copied:"Result copied",saved:"Record saved",csv:"CSV exported",empty:"No saved records yet.",confirm:"Clear all saved records?",
  opticalLimiter:"Limiting factor: optical power budget. Passive losses and engineering margin determine the available reach.",
  systemLimiter:"Limiting factor: system/protocol reach. The optical budget permits a longer route, but effective reach is capped by system capability.",
  equalLimiter:"Optical-budget reach and system reach are approximately equal.",
  healthyText:"The planned distance is within the effective maximum reach and retains the configured engineering margin.",
  warningText:"The planned link is physically within the equipment budget, but the full engineering margin is not retained. Reduce distance or passive loss.",
  failedText:"Physical link loss at the planned distance exceeds the maximum channel budget, so receive power falls below sensitivity.",
  limitedText:"The optical budget supports the planned route, but effective reach is controlled by the configured system/protocol limit.",
  causesHealthy:["Confirm that the actual route matches the planned distance","Retain margin for maintenance, ageing and temperature","Verify with a power meter and OTDR after deployment"],
  causesWarning:["Reduce splitter cascade or use lower-loss components","Optimize connector and splice count","Increase budget or shorten the route"],
  causesFailed:["Reduce total split ratio or cascade stages","Shorten the route or use lower-attenuation fiber","Verify minimum transmit power and sensitivity","Review fixed-loss assumptions"],
  causesLimited:["Verify maximum logical/ranging capability","Check OLT port and profile configuration","Do not use optical budget as the only reach criterion"]
 }
};
const attenuationMap={"1310":0.35,"1490":0.30,"1550":0.20};
const ratioMap={"0":1,"3.7":2,"7.2":4,"10.5":8,"13.8":16,"17":32,"20.5":64};
const presets={
 custom:null,
 "gpon-b":{tx:1.5,sens:-27,over:-8,system:20,wave:"1490",planned:5,s1:"10.5",s2:"10.5",margin:3},
 "gpon-c":{tx:3,sens:-30,over:-8,system:20,wave:"1490",planned:10,s1:"10.5",s2:"10.5",margin:3},
 epon:{tx:2,sens:-27,over:-3,system:20,wave:"1490",planned:5,s1:"10.5",s2:"10.5",margin:3},
 longreach:{tx:5,sens:-33,over:-8,system:40,wave:"1490",planned:25,s1:"13.8",s2:"0",margin:3}
};
let last=null;
function n(id){return Number.parseFloat($(id).value)}
function validate(){
 const non=["plannedDistance","systemReach","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","splitter1","splitter2","otherLoss","margin"];
 const signed=["txPower","rxSensitivity","rxOverload"];
 return non.every(id=>Number.isFinite(n(id))&&n(id)>=0)&&signed.every(id=>Number.isFinite(n(id)));
}
function setAttenuation(){
 const wave=$("wavelength").value;
 if(attenuationMap[wave]!==undefined){$("attenuation").value=attenuationMap[wave].toFixed(2);$("attenuation").readOnly=true}else{$("attenuation").readOnly=false}
}
function applyPreset(){
 const p=presets[$("preset").value];if(!p)return;
 $("txPower").value=p.tx;$("rxSensitivity").value=p.sens;$("rxOverload").value=p.over;$("systemReach").value=p.system;$("wavelength").value=p.wave;$("plannedDistance").value=p.planned;$("splitter1").value=p.s1;$("splitter2").value=p.s2;$("margin").value=p.margin;setAttenuation();calculate();
}
function calculate(){
 if(!validate()){$("validation").textContent=T[LANG].invalid;return}$("validation").textContent="";
 const v={
  project:$("projectName").value.trim()||"Untitled",tx:n("txPower"),sens:n("rxSensitivity"),over:n("rxOverload"),
  planned:n("plannedDistance"),systemReach:n("systemReach"),attenuation:n("attenuation"),wavelength:$("wavelength").value,
  spliceCount:n("spliceCount"),spliceLoss:n("spliceLoss"),connectorCount:n("connectorCount"),connectorLoss:n("connectorLoss"),
  s1:n("splitter1"),s2:n("splitter2"),other:n("otherLoss"),margin:n("margin")
 };
 const maxChannelLoss=v.tx-v.sens;
 const spliceTotal=v.spliceCount*v.spliceLoss,connectorTotal=v.connectorCount*v.connectorLoss,splitterTotal=v.s1+v.s2;
 const fixedPhysical=spliceTotal+connectorTotal+splitterTotal+v.other;
 const fiberAllowanceDesign=maxChannelLoss-fixedPhysical-v.margin;
 const opticalMax=v.attenuation>0?Math.max(0,fiberAllowanceDesign/v.attenuation):0;
 const effectiveMax=Math.min(opticalMax,v.systemReach);
 const plannedFiber=v.planned*v.attenuation;
 const plannedPhysical=fixedPhysical+plannedFiber;
 const plannedDesign=plannedPhysical+v.margin;
 const physicalHeadroom=maxChannelLoss-plannedPhysical;
 const designRemaining=maxChannelLoss-plannedDesign;
 const estimatedRx=v.tx-plannedPhysical;
 const overloadMargin=v.over-estimatedRx;
 const ratio=(ratioMap[String(v.s1)]||1)*(ratioMap[String(v.s2)]||1);
 let limiter="equal";
 if(opticalMax<v.systemReach-0.05)limiter="optical";
 else if(v.systemReach<opticalMax-0.05)limiter="system";
 let status="healthy";
 if(physicalHeadroom<0||estimatedRx<v.sens)status="failed";
 else if(designRemaining<0)status="warning";
 else if(limiter==="system"&&v.planned<=effectiveMax)status="limited";
 last={...v,maxChannelLoss,spliceTotal,connectorTotal,splitterTotal,fixedPhysical,fiberAllowanceDesign,opticalMax,effectiveMax,plannedFiber,plannedPhysical,plannedDesign,physicalHeadroom,designRemaining,estimatedRx,overloadMargin,ratio,limiter,status,timestamp:new Date().toISOString()};
 const set=(id,x)=>$(id).textContent=x.toFixed(2);
 set("effectiveMax",effectiveMax);set("opticalMax",opticalMax);set("systemReachResult",v.systemReach);set("plannedDistanceResult",v.planned);
 set("maxChannelLoss",maxChannelLoss);set("fixedPhysical",fixedPhysical);set("fiberAllowance",Math.max(0,fiberAllowanceDesign));set("plannedFiber",plannedFiber);
 set("plannedPhysical",plannedPhysical);set("plannedDesign",plannedDesign);set("designRemaining",designRemaining);set("estimatedRx",estimatedRx);set("physicalHeadroom",physicalHeadroom);
 set("spliceTotal",spliceTotal);set("connectorTotal",connectorTotal);set("splitterTotal",splitterTotal);set("otherResult",v.other);set("marginResult",v.margin);
 $("splitRatio").textContent="1:"+ratio;
 const summary=$("summaryCard"),diag=$("diagnosis");summary.className="summary-card "+status;diag.className="diagnosis "+status;$("healthBadge").textContent=T[LANG][status];
 $("diagnosisText").textContent=T[LANG][status+"Text"];
 $("limiterText").textContent=limiter==="optical"?T[LANG].opticalLimiter:limiter==="system"?T[LANG].systemLimiter:T[LANG].equalLimiter;
 const causes=T[LANG]["causes"+status[0].toUpperCase()+status.slice(1)];
 $("causeList").innerHTML=causes.map((x,i)=>`<li><b>${i+1}.</b> ${x}</li>`).join("");
 const scale=Math.max(v.systemReach,opticalMax,v.planned,1);
 $("effectiveBar").style.width=Math.min(100,effectiveMax/scale*100)+"%";
 $("plannedMarker").style.left=`calc(${Math.min(100,v.planned/scale*100)}% - 2px)`;
 $("distanceScaleMax").textContent=scale.toFixed(1)+" km";
 if(typeof nelTrack==="function")nelTrack("pon_max_distance_calculate",{status,limiter,optical_max:Number(opticalMax.toFixed(2)),effective_max:Number(effectiveMax.toFixed(2)),planned_distance:Number(v.planned.toFixed(2))});
}
function reset(){
 $("preset").value="gpon-b";$("projectName").value="PON Maximum Distance Design";$("txPower").value=1.5;$("rxSensitivity").value=-27;$("rxOverload").value=-8;$("systemReach").value=20;
 $("plannedDistance").value=5;$("wavelength").value="1490";setAttenuation();$("spliceCount").value=6;$("spliceLoss").value=.10;$("connectorCount").value=4;$("connectorLoss").value=.30;$("splitter1").value="10.5";$("splitter2").value="10.5";$("otherLoss").value=0;$("margin").value=3;calculate();
}
function report(){
 if(!last)calculate();const r=last;
 return["NetEngineerLab - PON Maximum Distance Calculator",`${LANG==="zh"?"工程":"Project"}: ${r.project}`,`${LANG==="zh"?"光预算最大距离":"Optical maximum distance"}: ${r.opticalMax.toFixed(2)} km`,`${LANG==="zh"?"系统距离上限":"System reach cap"}: ${r.systemReach.toFixed(2)} km`,`${LANG==="zh"?"有效最大距离":"Effective maximum distance"}: ${r.effectiveMax.toFixed(2)} km`,`${LANG==="zh"?"规划距离":"Planned distance"}: ${r.planned.toFixed(2)} km`,`${LANG==="zh"?"规划距离剩余设计预算":"Design budget remaining"}: ${r.designRemaining.toFixed(2)} dB`,`${LANG==="zh"?"预计接收光功率":"Estimated RX"}: ${r.estimatedRx.toFixed(2)} dBm`,`${LANG==="zh"?"状态":"Status"}: ${T[LANG][r.status]}`].join("\n")
}
function temp(btn,msg){const old=btn.innerHTML;btn.textContent=msg;setTimeout(()=>btn.innerHTML=old,1400)}
async function copyResult(){const txt=report();try{await navigator.clipboard.writeText(txt)}catch{const a=document.createElement("textarea");a.value=txt;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}temp($("copyBtn"),T[LANG].copied)}
function getHistory(){try{return JSON.parse(localStorage.getItem("ponMaximumDistanceHistory")||"[]")}catch{return[]}}
function save(){if(!last)calculate();const h=getHistory();h.unshift(last);localStorage.setItem("ponMaximumDistanceHistory",JSON.stringify(h.slice(0,12)));renderHistory();temp($("saveBtn"),T[LANG].saved)}
function renderHistory(){const h=getHistory(),c=$("historyList");if(!h.length){c.innerHTML=`<div class="history-empty">${T[LANG].empty}</div>`;return}c.innerHTML=h.slice(0,6).map(r=>`<article class="history-item"><h3>${esc(r.project)}</h3><p>${new Date(r.timestamp).toLocaleString(LANG==="zh"?"zh-CN":"en-US")}</p><p>${LANG==="zh"?"有效最大距离":"Effective max"}: <strong>${r.effectiveMax.toFixed(2)} km</strong></p><p>${LANG==="zh"?"规划距离":"Planned"}: ${r.planned.toFixed(2)} km</p><p>${T[LANG][r.status]}</p></article>`).join("")}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function clearHistory(){if(confirm(T[LANG].confirm)){localStorage.removeItem("ponMaximumDistanceHistory");renderHistory()}}
function csv(){
 if(!last)calculate();const r=last,rows=[["Project",r.project],["Optical maximum distance km",r.opticalMax.toFixed(2)],["System reach cap km",r.systemReach.toFixed(2)],["Effective maximum distance km",r.effectiveMax.toFixed(2)],["Planned distance km",r.planned.toFixed(2)],["Maximum channel loss dB",r.maxChannelLoss.toFixed(2)],["Fixed physical loss dB",r.fixedPhysical.toFixed(2)],["Planned physical loss dB",r.plannedPhysical.toFixed(2)],["Design remaining dB",r.designRemaining.toFixed(2)],["Estimated RX dBm",r.estimatedRx.toFixed(2)],["Status",T[LANG][r.status]]];
 const text="\uFEFF"+rows.map(x=>x.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"),blob=new Blob([text],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pon_maximum_distance_report.csv";a.click();URL.revokeObjectURL(a.href);temp($("csvBtn"),T[LANG].csv)
}
["txPower","rxSensitivity","rxOverload","plannedDistance","systemReach","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","splitter1","splitter2","otherLoss","margin"].forEach(id=>$(id).addEventListener("input",()=>{clearTimeout(window.__ponDist);window.__ponDist=setTimeout(calculate,160)}));
$("wavelength").addEventListener("change",()=>{setAttenuation();calculate()});$("preset").addEventListener("change",applyPreset);$("calculateBtn").addEventListener("click",calculate);$("resetBtn").addEventListener("click",reset);$("copyBtn").addEventListener("click",copyResult);$("saveBtn").addEventListener("click",save);$("csvBtn").addEventListener("click",csv);$("printBtn").addEventListener("click",()=>print());$("clearHistoryBtn").addEventListener("click",clearHistory);
setAttenuation();calculate();renderHistory();