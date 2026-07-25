const $=id=>document.getElementById(id);
const LANG=document.documentElement.lang.toLowerCase().startsWith("en")?"en":"zh";
const T={
 zh:{
  healthy:"✓ 正常",warning:"⚠ 弱光预警",failed:"✕ 严重弱光",overload:"⚡ 光功率过高",nosignal:"○ 疑似无光",
  invalid:"请检查输入：距离、数量和损耗必须为有效非负数；dBm功率值可以为负数。",
  copied:"结果已复制",saved:"记录已保存",csv:"CSV 已导出",empty:"暂无记录。完成诊断后点击“保存记录”。",confirm:"确定清空全部记录吗？",
  healthyText:"实测接收光功率位于设备工作窗口内，并保留了足够余量。若业务仍异常，应继续检查ONU注册、误码、光模块状态和上层业务配置。",
  warningText:"实测光功率仍高于接收灵敏度，但余量偏小，属于弱光预警。建议安排主动维护，优先检查活动连接器、尾纤弯曲、分光级联和熔接点。",
  failedText:"实测光功率低于接收灵敏度，链路可能出现频繁掉线、注册失败或误码。应尽快定位额外损耗或分光设计问题。",
  overloadText:"实测光功率高于接收机过载门限，存在接收饱和风险。应核对光模块等级、直连场景和是否需要合适的光衰减器。",
  nosignalText:"实测值达到疑似无光门限。优先检查光纤断裂、连接器脱落、错误端口、OLT发光异常、严重弯曲或分光器故障。",
  causesHealthy:["检查ONU在线状态和注册日志","检查误码、丢包及业务配置","核对实测值是否稳定波动"],
  causesWarning:["清洁SC/APC连接器和适配器","检查皮线光缆弯曲与受压","检查分光器级联及端口","复测熔接点与尾纤损耗"],
  causesFailed:["使用OTDR定位异常损耗或断点","检查主干、配线和入户段连接","核对分光比是否超设计","检查OLT发光功率和ONU门限"],
  causesOverload:["核对设备光模块等级是否匹配","避免高功率光模块短距离直连","按规范增加合适光衰减器","确认测量点和仪表量程"],
  causesNoSignal:["确认OLT端口是否正常发光","检查光纤跳接和端口对应关系","检查断纤、脱落和严重弯曲","使用红光笔/OTDR逐段定位"]
 },
 en:{
  healthy:"✓ Normal",warning:"⚠ Weak-light caution",failed:"✕ Critical weak light",overload:"⚡ Optical overload",nosignal:"○ Possible no signal",
  invalid:"Check inputs. Distance, counts and losses must be valid non-negative values. dBm power values may be negative.",
  copied:"Result copied",saved:"Record saved",csv:"CSV exported",empty:"No saved records yet.",confirm:"Clear all saved records?",
  healthyText:"Measured receive power is inside the receiver window with adequate margin. If service is still abnormal, check ONU registration, errors, optics and service configuration.",
  warningText:"Measured power remains above sensitivity, but margin is limited. Schedule proactive maintenance and inspect connectors, bending, splitter cascade and splices.",
  failedText:"Measured power is below receiver sensitivity and may cause drops, registration failure or errors. Locate excess loss or splitter design problems promptly.",
  overloadText:"Measured power exceeds the receiver overload threshold and may saturate the receiver. Verify optical class, short-reach direct links and attenuation requirements.",
  nosignalText:"The measured value reaches the possible no-signal threshold. Check fiber breaks, disconnected connectors, wrong ports, OLT laser faults, severe bending or splitter failure.",
  causesHealthy:["Check ONU online and registration logs","Check errors, packet loss and service settings","Confirm that measured power is stable"],
  causesWarning:["Clean SC/APC connectors and adapters","Inspect drop cable bending or crushing","Review splitter cascade and ports","Retest splices and patch cords"],
  causesFailed:["Use OTDR to locate excess loss or breaks","Inspect feeder, distribution and drop sections","Verify split ratio against design","Check OLT transmit power and ONU threshold"],
  causesOverload:["Verify optical module class compatibility","Avoid high-power short direct connections","Add a suitable attenuator when required","Confirm measurement point and meter range"],
  causesNoSignal:["Confirm that the OLT port is transmitting","Verify patching and port mapping","Inspect breaks, disconnections and severe bends","Use a VFL or OTDR for sectional testing"]
 }
};
const attenuationMap={"1310":0.35,"1490":0.30,"1550":0.20};
const splitterRatios={"0":1,"3.7":2,"7.2":4,"10.5":8,"13.8":16,"17":32,"20.5":64};
const presets={
 custom:null,
 "gpon-b":{measured:-18,sens:-27,over:-8,noSignal:-40,warning:3,tx:1.5,wave:"1490",distance:10,s1:"10.5",s2:"10.5"},
 "gpon-c":{measured:-22,sens:-30,over:-8,noSignal:-40,warning:3,tx:3,wave:"1490",distance:15,s1:"17",s2:"0"},
 epon:{measured:-19,sens:-27,over:-3,noSignal:-40,warning:3,tx:2,wave:"1490",distance:10,s1:"13.8",s2:"0"},
 customWeak:{measured:-26,sens:-27,over:-8,noSignal:-40,warning:3,tx:1.5,wave:"1490",distance:10,s1:"13.8",s2:"0"}
};
let last=null;
function n(id){return Number.parseFloat($(id).value)}
function validate(){
 const non=["warningMargin","distance","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","splitter1","splitter2","otherLoss"];
 const signed=["measuredRx","rxSensitivity","rxOverload","noSignalThreshold","txPower"];
 return non.every(id=>Number.isFinite(n(id))&&n(id)>=0)&&signed.every(id=>Number.isFinite(n(id)));
}
function setAttenuation(){
 const wave=$("wavelength").value;
 if(attenuationMap[wave]!==undefined){$("attenuation").value=attenuationMap[wave].toFixed(2);$("attenuation").readOnly=true}else{$("attenuation").readOnly=false}
}
function applyPreset(){
 const p=presets[$("preset").value];if(!p)return;
 $("measuredRx").value=p.measured;$("rxSensitivity").value=p.sens;$("rxOverload").value=p.over;$("noSignalThreshold").value=p.noSignal;$("warningMargin").value=p.warning;
 $("txPower").value=p.tx;$("wavelength").value=p.wave;$("distance").value=p.distance;$("splitter1").value=p.s1;$("splitter2").value=p.s2;setAttenuation();calculate();
}
function setMode(mode){
 document.querySelectorAll(".mode-tab").forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active))});
 $("modelFields").classList.toggle("hidden",mode==="measured");
 $("modeHint").textContent=mode==="measured"
  ?(LANG==="zh"?"仅依据实测光功率和接收机门限进行快速诊断。":"Quick diagnosis from measured power and receiver limits.")
  :(LANG==="zh"?"同时建立链路模型，比较理论接收功率与实测值。":"Build a link model and compare expected versus measured receive power.");
 calculate();
}
function currentMode(){return document.querySelector(".mode-tab.active")?.dataset.mode||"model"}
function calculate(){
 if(!validate()){$("validation").textContent=T[LANG].invalid;return}$("validation").textContent="";
 const v={
  project:$("projectName").value.trim()||"Untitled",mode:currentMode(),measured:n("measuredRx"),sens:n("rxSensitivity"),over:n("rxOverload"),noSignal:n("noSignalThreshold"),warning:n("warningMargin"),
  tx:n("txPower"),distance:n("distance"),attenuation:n("attenuation"),spliceCount:n("spliceCount"),spliceLoss:n("spliceLoss"),connectorCount:n("connectorCount"),connectorLoss:n("connectorLoss"),
  s1:n("splitter1"),s2:n("splitter2"),other:n("otherLoss"),wavelength:$("wavelength").value
 };
 const sensitivityMargin=v.measured-v.sens;
 const overloadMargin=v.over-v.measured;
 const receiverWindow=v.over-v.sens;
 let status="healthy";
 if(v.measured<=v.noSignal)status="nosignal";
 else if(v.measured<v.sens)status="failed";
 else if(v.measured>v.over)status="overload";
 else if(sensitivityMargin<v.warning||overloadMargin<v.warning)status="warning";
 const fiberLoss=v.distance*v.attenuation,spliceTotal=v.spliceCount*v.spliceLoss,connectorTotal=v.connectorCount*v.connectorLoss,splitterLoss=v.s1+v.s2;
 const modeledLoss=fiberLoss+spliceTotal+connectorTotal+splitterLoss+v.other;
 const expectedRx=v.tx-modeledLoss;
 const deviation=v.measured-expectedRx;
 const inferredExtra=Math.max(0,expectedRx-v.measured);
 const ratio=(splitterRatios[String(v.s1)]||1)*(splitterRatios[String(v.s2)]||1);
 last={...v,sensitivityMargin,overloadMargin,receiverWindow,status,fiberLoss,spliceTotal,connectorTotal,splitterLoss,modeledLoss,expectedRx,deviation,inferredExtra,ratio,timestamp:new Date().toISOString()};
 const set=(id,x)=>$(id).textContent=x.toFixed(2);
 set("measuredResult",v.measured);set("sensitivityMargin",sensitivityMargin);set("overloadMargin",overloadMargin);set("receiverWindow",receiverWindow);
 set("expectedRx",expectedRx);set("deviation",deviation);set("inferredExtra",inferredExtra);set("modeledLoss",modeledLoss);set("fiberLoss",fiberLoss);set("spliceTotal",spliceTotal);set("connectorTotal",connectorTotal);set("splitterLoss",splitterLoss);$("splitRatio").textContent="1:"+ratio;
 const summary=$("summaryCard"),diag=$("diagnosis"),badge=$("healthBadge");summary.className="summary-card "+status;diag.className="diagnosis "+status;badge.textContent=T[LANG][status];
 $("diagnosisText").textContent=T[LANG][status+"Text"];
 const causes=T[LANG]["causes"+status[0].toUpperCase()+status.slice(1)];
 $("causeList").innerHTML=causes.map((x,i)=>`<li><b>${i+1}.</b> ${x}</li>`).join("");
 const min=v.noSignal,max=v.over+5,clamped=Math.max(min,Math.min(max,v.measured)),pos=(clamped-min)/(max-min)*100;$("gaugeMarker").style.left=`calc(${pos}% - 2px)`;
 $("gaugePower").textContent=v.measured.toFixed(2)+" dBm";
 $("modelResults").classList.toggle("hidden",v.mode==="measured");
 if(typeof nelTrack==="function")nelTrack("onu_rx_diagnosis",{status,mode:v.mode,measured_rx:Number(v.measured.toFixed(2)),split_ratio:ratio});
}
function reset(){
 $("preset").value="gpon-b";$("projectName").value="ONU Optical Power Check";$("measuredRx").value=-18;$("rxSensitivity").value=-27;$("rxOverload").value=-8;$("noSignalThreshold").value=-40;$("warningMargin").value=3;
 $("txPower").value=1.5;$("distance").value=10;$("wavelength").value="1490";setAttenuation();$("spliceCount").value=6;$("spliceLoss").value=.10;$("connectorCount").value=4;$("connectorLoss").value=.30;$("splitter1").value="10.5";$("splitter2").value="10.5";$("otherLoss").value=0;setMode("model");
}
function report(){
 if(!last)calculate();const r=last;
 return["NetEngineerLab - ONU RX Power Diagnosis",`${LANG==="zh"?"工程":"Project"}: ${r.project}`,`${LANG==="zh"?"实测接收功率":"Measured RX"}: ${r.measured.toFixed(2)} dBm`,`${LANG==="zh"?"灵敏度余量":"Sensitivity margin"}: ${r.sensitivityMargin.toFixed(2)} dB`,`${LANG==="zh"?"过载余量":"Overload margin"}: ${r.overloadMargin.toFixed(2)} dB`,`${LANG==="zh"?"理论接收功率":"Expected RX"}: ${r.expectedRx.toFixed(2)} dBm`,`${LANG==="zh"?"实测偏差":"Measured deviation"}: ${r.deviation.toFixed(2)} dB`,`${LANG==="zh"?"推算额外损耗":"Inferred excess loss"}: ${r.inferredExtra.toFixed(2)} dB`,`${LANG==="zh"?"状态":"Status"}: ${T[LANG][r.status]}`].join("\n")
}
function temp(btn,msg){const old=btn.innerHTML;btn.textContent=msg;setTimeout(()=>btn.innerHTML=old,1400)}
async function copyResult(){const txt=report();try{await navigator.clipboard.writeText(txt)}catch{const a=document.createElement("textarea");a.value=txt;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}temp($("copyBtn"),T[LANG].copied)}
function getHistory(){try{return JSON.parse(localStorage.getItem("onuRxDiagnosisHistory")||"[]")}catch{return[]}}
function save(){if(!last)calculate();const h=getHistory();h.unshift(last);localStorage.setItem("onuRxDiagnosisHistory",JSON.stringify(h.slice(0,12)));renderHistory();temp($("saveBtn"),T[LANG].saved)}
function renderHistory(){const h=getHistory(),c=$("historyList");if(!h.length){c.innerHTML=`<div class="history-empty">${T[LANG].empty}</div>`;return}c.innerHTML=h.slice(0,6).map(r=>`<article class="history-item"><h3>${esc(r.project)}</h3><p>${new Date(r.timestamp).toLocaleString(LANG==="zh"?"zh-CN":"en-US")}</p><p>${LANG==="zh"?"实测功率":"Measured"}: <strong>${r.measured.toFixed(2)} dBm</strong></p><p>${LANG==="zh"?"灵敏度余量":"Sensitivity margin"}: ${r.sensitivityMargin.toFixed(2)} dB</p><p>${T[LANG][r.status]}</p></article>`).join("")}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function clearHistory(){if(confirm(T[LANG].confirm)){localStorage.removeItem("onuRxDiagnosisHistory");renderHistory()}}
function csv(){
 if(!last)calculate();const r=last,rows=[["Project",r.project],["Measured RX dBm",r.measured.toFixed(2)],["Receiver sensitivity dBm",r.sens],["Overload threshold dBm",r.over],["Sensitivity margin dB",r.sensitivityMargin.toFixed(2)],["Overload margin dB",r.overloadMargin.toFixed(2)],["Expected RX dBm",r.expectedRx.toFixed(2)],["Deviation dB",r.deviation.toFixed(2)],["Inferred excess loss dB",r.inferredExtra.toFixed(2)],["Status",T[LANG][r.status]]];
 const text="\uFEFF"+rows.map(x=>x.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");const blob=new Blob([text],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="onu_rx_power_diagnosis.csv";a.click();URL.revokeObjectURL(a.href);temp($("csvBtn"),T[LANG].csv)
}
["measuredRx","rxSensitivity","rxOverload","noSignalThreshold","warningMargin","txPower","distance","attenuation","spliceCount","spliceLoss","connectorCount","connectorLoss","splitter1","splitter2","otherLoss"].forEach(id=>$(id).addEventListener("input",()=>{clearTimeout(window.__onu);window.__onu=setTimeout(calculate,160)}));
$("wavelength").addEventListener("change",()=>{setAttenuation();calculate()});$("preset").addEventListener("change",applyPreset);document.querySelectorAll(".mode-tab").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
$("calculateBtn").addEventListener("click",calculate);$("resetBtn").addEventListener("click",reset);$("copyBtn").addEventListener("click",copyResult);$("saveBtn").addEventListener("click",save);$("csvBtn").addEventListener("click",csv);$("printBtn").addEventListener("click",()=>print());$("clearHistoryBtn").addEventListener("click",clearHistory);
setAttenuation();calculate();renderHistory();