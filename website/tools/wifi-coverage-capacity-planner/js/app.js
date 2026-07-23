(function(){
"use strict";

const E=window.NELWiFiPlannerEngine;
const P=window.NEL_WIFI_PRESETS;
const $=id=>document.getElementById(id);
const lang=(document.documentElement.lang||"en").toLowerCase().startsWith("zh")?"zh":"en";
const locale=lang==="zh"?"zh-CN":"en-US";
const state={activeTab:"coverage",coverage:null,capacity:null,combined:null,channel:null};

const T={
 en:{
  errors:{
   invalidCoverage:"Check the coverage area, RF parameters, path-loss exponent and design-radius cap.",
   invalidCapacity:"Check the user, throughput and PHY-rate inputs.",
   invalidStandardBand:"The selected Wi-Fi generation does not support this design band.",
   invalidChannelWidth:"The selected channel width is not available for this Wi-Fi generation.",
   invalid320MHz:"A 320 MHz planning channel requires Wi-Fi 7 in the 6 GHz band.",
   incompletePlan:"Coverage and capacity results are required before the combined plan."
  },
  warnings:{
   uplinkLimited:"The client-to-AP uplink is the coverage bottleneck. Client transmit power often limits the practical cell edge.",
   radiusCapped:"The RF-model radius exceeds the design-radius cap; the cap is controlling AP spacing.",
   highObstacleLoss:"The entered obstacle loss is high. Validate wall and floor assumptions with a site survey.",
   pathLossExponent:"The path-loss exponent is outside a common indoor planning range; verify the environment model.",
   smallCell:"The calculated cell radius is below 5 m. Check target RSSI, obstacles and transmit powers.",
   highActiveRatio:"The busy-hour active-user ratio is high; validate it with measured concurrency.",
   lowThroughputHeadroom:"Per-AP throughput headroom is below 15%. Add capacity or reduce the target channel utilization.",
   clientCountNearLimit:"Associated users per AP are close to the configured engineering limit.",
   wideChannelDense:"Very wide channels can reduce reuse options in dense deployments.",
   customPhy:"A custom PHY rate is being used instead of the built-in reference table.",
   highFinalUtilization:"The combined plan leaves high throughput utilization per AP.",
   coverageBottleneck:"Coverage requires more APs than capacity.",
   capacityBottleneck:"Capacity requires more APs than RF coverage.",
   highReusePressure:"Multiple APs must reuse each channel group; co-channel contention risk is high.",
   fewWideChannels:"The selected wide channel leaves fewer than three reusable channel groups.",
   regulatoryChannels:"Available channels are editable. Map channel groups to locally permitted channels, DFS rules, indoor/outdoor power class and AFC requirements."
  },
  risk:{low:"Low",medium:"Medium",high:"High",critical:"Critical"},
  bottleneck:{coverage:"Coverage",capacity:"Capacity",balanced:"Balanced"},
  copied:"Result copied.",csv:"CSV exported.",saved:"Project saved.",cleared:"History cleared.",
  noHistory:"No saved Wi-Fi planning projects.",load:"Load",delete:"Delete",
  confirmClear:"Clear all saved Wi-Fi planning projects?",
  engineering:"Results are engineering estimates. Final AP design requires a regulatory review, vendor data and an on-site predictive/active survey."
 },
 zh:{
  errors:{
   invalidCoverage:"请检查覆盖面积、射频参数、路径损耗指数和设计半径上限。",
   invalidCapacity:"请检查用户数、吞吐需求和PHY速率参数。",
   invalidStandardBand:"所选Wi-Fi代际不支持当前规划频段。",
   invalidChannelWidth:"所选Wi-Fi代际不支持当前信道宽度。",
   invalid320MHz:"320MHz规划信道需要Wi-Fi 7并使用6GHz频段。",
   incompletePlan:"必须先获得覆盖和容量结果，才能生成综合方案。"
  },
  warnings:{
   uplinkLimited:"客户端到AP的上行链路成为覆盖瓶颈，终端发射功率通常会限制实际小区边缘。",
   radiusCapped:"射频模型半径超过设计半径上限，当前AP间距由上限值控制。",
   highObstacleLoss:"输入的障碍物损耗较高，应通过现场勘察校核墙体和楼板参数。",
   pathLossExponent:"路径损耗指数超出常见室内规划范围，请复核环境模型。",
   smallCell:"计算覆盖半径低于5米，请检查目标RSSI、障碍损耗和发射功率。",
   highActiveRatio:"忙时活跃用户比例较高，应使用实际并发数据复核。",
   lowThroughputHeadroom:"单AP吞吐余量低于15%，应增加容量或降低目标信道利用率。",
   clientCountNearLimit:"每AP关联用户数接近设定的工程上限。",
   wideChannelDense:"高密环境使用超宽信道会减少可复用信道数量。",
   customPhy:"当前使用自定义PHY速率，而不是内置参考速率表。",
   highFinalUtilization:"综合方案中每AP吞吐利用率较高。",
   coverageBottleneck:"覆盖需求的AP数量高于容量需求。",
   capacityBottleneck:"容量需求的AP数量高于射频覆盖需求。",
   highReusePressure:"多个AP需要复用同一信道组，同频竞争风险较高。",
   fewWideChannels:"所选超宽信道可形成的复用信道组少于3个。",
   regulatoryChannels:"可用信道数为可编辑参数。实际信道组必须映射到当地允许的信道、DFS规则、室内外功率等级及AFC要求。"
  },
  risk:{low:"低",medium:"中",high:"高",critical:"严重"},
  bottleneck:{coverage:"覆盖",capacity:"容量",balanced:"均衡"},
  copied:"结果已复制。",csv:"CSV已导出。",saved:"规划项目已保存。",cleared:"历史记录已清空。",
  noHistory:"暂无已保存的Wi-Fi规划项目。",load:"载入",delete:"删除",
  confirmClear:"确认清空全部Wi-Fi规划记录？",
  engineering:"结果属于工程估算，最终AP方案需完成法规核对、厂家参数校核以及现场预测/主动勘测。"
 }
}[lang];

const allInputIds=[
 "profilePreset","standard","band","channelWidth","spatialStreams","radiosPerAp",
 "freqMHz","totalAreaM2","floors","apTxPowerDbm","clientTxPowerDbm",
 "apAntennaGainDbi","clientAntennaGainDbi","apCableLossDb","clientCableLossDb",
 "targetRssiClient","targetRssiAp","fadeMarginDb","pathLossExponent","maxDesignRadiusM",
 "layoutEfficiencyPct","overlapPct","lightWalls","lightWallLossDb","mediumWalls",
 "mediumWallLossDb","heavyWalls","heavyWallLossDb","floorPenetrations","floorLossDb",
 "totalUsers","activePct","perActiveUserMbps","protocolEfficiencyPct","usableAirtimePct",
 "clientMixPct","maxAssociatedUsersPerAp","minimumApCount","useCustomPhyRate",
 "customPhyRateMbps","available20MHzChannels"
];

function val(id){return Number($(id).value)}
function format(value,digits=2){
 const n=Number(value);
 if(!Number.isFinite(n))return"—";
 return n.toLocaleString(locale,{maximumFractionDigits:digits});
}
function formatInt(value){return format(value,0)}
function setText(id,value){const el=$(id);if(el)el.textContent=value}
function showError(id,code){const el=$(id);el.hidden=false;el.textContent=T.errors[code]||code}
function clearError(id){const el=$(id);el.hidden=true;el.textContent=""}
function toast(message){
 const el=$("toast");el.textContent=message;el.classList.add("show");
 setTimeout(()=>el.classList.remove("show"),1800);
}
function setRisk(id,risk){
 const el=$(id);if(!el)return;
 el.className=`risk-badge ${risk}`;
 el.textContent=T.risk[risk]||risk;
}
function warningsHtml(items){
 return(items||[]).map(item=>`<li class="${item.severity}">${T.warnings[item.code]||item.code}</li>`).join("");
}
function escapeHtml(text){
 return String(text).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
function copyText(text){
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);
 const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);
 ta.select();document.execCommand("copy");ta.remove();return Promise.resolve();
}
function downloadCsv(rows,name){
 const csv=rows.map(row=>row.map(value=>`"${String(value??"").replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();
 URL.revokeObjectURL(a.href);toast(T.csv);
}

function activateTab(name){
 state.activeTab=name;
 document.querySelectorAll("[data-tab]").forEach(btn=>{
  const active=btn.dataset.tab===name;
  btn.classList.toggle("active",active);
  btn.setAttribute("aria-selected",String(active));
  btn.tabIndex=active?0:-1;
 });
 document.querySelectorAll("[data-panel]").forEach(panel=>panel.hidden=panel.dataset.panel!==name);
 history.replaceState(null,"",`#${name}`);
}

function initializeAccessibility(){
 document.querySelectorAll(".field").forEach(field=>{
  const label=[...field.children].find(child=>child.matches("label"));
  const control=field.querySelector(".input-wrap input,.input-wrap select,.input-wrap textarea,.checks input,.checks select");
  if(label&&control?.id&&!label.htmlFor)label.htmlFor=control.id;
 });

 const tabs=[...document.querySelectorAll("[data-tab]")];
 tabs.forEach((tab,index)=>{
  const name=tab.dataset.tab;
  tab.setAttribute("role","tab");
  tab.id=`planner-tab-${name}`;
  tab.setAttribute("aria-controls",`planner-panel-${name}`);
  tab.addEventListener("keydown",event=>{
   const keys=["ArrowLeft","ArrowRight","Home","End"];
   if(!keys.includes(event.key))return;
   event.preventDefault();
   const current=tabs.indexOf(tab);
   const target=event.key==="Home"?0:event.key==="End"?tabs.length-1:
    (current+(event.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
   tabs[target].focus();
   activateTab(tabs[target].dataset.tab);
  });
 });
 document.querySelectorAll("[data-panel]").forEach(panel=>{
  const name=panel.dataset.panel;
  panel.id=`planner-panel-${name}`;
  panel.setAttribute("role","tabpanel");
  panel.setAttribute("aria-labelledby",`planner-tab-${name}`);
 });
}

function updateBandAndWidthOptions(applyBandDefaults=false){
 const standard=$("standard").value;
 const validBands=E.STANDARD_BANDS[standard]||[];
 [...$("band").options].forEach(option=>option.disabled=!validBands.includes(option.value));
 if(!validBands.includes($("band").value))$("band").value=validBands[0];

 const band=$("band").value;
 const widths=Object.keys(E.PHY_PER_STREAM_MBPS[standard]||{}).map(Number);
 [...$("channelWidth").options].forEach(option=>{
  const width=Number(option.value);
  option.disabled=!widths.includes(width)||(width===320&&!(standard==="wifi7"&&band==="6"));
 });
 if($("channelWidth").selectedOptions[0]?.disabled){
  const first=[...$("channelWidth").options].find(option=>!option.disabled);
  if(first)$("channelWidth").value=first.value;
 }
 if(applyBandDefaults){
  const defaults=P.bandDefaults[band];
  if(defaults){
   $("freqMHz").value=defaults.freqMHz;
   $("available20MHzChannels").value=defaults.available20MHzChannels;
  }
 }
 updatePhyReference();
}

function updatePhyReference(){
 const standard=$("standard").value;
 const width=val("channelWidth");
 const streams=val("spatialStreams");
 const radios=val("radiosPerAp");
 const rate=E.referencePhyRate(standard,width,streams,radios);
 setText("referencePhyHint",Number.isFinite(rate)?`${format(rate,1)} Mbps`:"—");
 $("customPhyField").hidden=!$("useCustomPhyRate").checked;
}

function applyProfile(key){
 const profile=P.profiles[key];if(!profile)return;
 Object.entries(profile).forEach(([id,value])=>{
  const el=$(id);if(!el)return;
  if(el.type==="checkbox")el.checked=Boolean(value);else el.value=value;
 });
 updateBandAndWidthOptions(false);
 calculateAll();
}

function coverageInput(){
 return{
  freqMHz:val("freqMHz"),totalAreaM2:val("totalAreaM2"),floors:val("floors"),
  apTxPowerDbm:val("apTxPowerDbm"),clientTxPowerDbm:val("clientTxPowerDbm"),
  apAntennaGainDbi:val("apAntennaGainDbi"),clientAntennaGainDbi:val("clientAntennaGainDbi"),
  apCableLossDb:val("apCableLossDb"),clientCableLossDb:val("clientCableLossDb"),
  targetRssiClient:val("targetRssiClient"),targetRssiAp:val("targetRssiAp"),
  fadeMarginDb:val("fadeMarginDb"),pathLossExponent:val("pathLossExponent"),
  maxDesignRadiusM:val("maxDesignRadiusM"),layoutEfficiencyPct:val("layoutEfficiencyPct"),
  overlapPct:val("overlapPct"),lightWalls:val("lightWalls"),
  lightWallLossDb:val("lightWallLossDb"),mediumWalls:val("mediumWalls"),
  mediumWallLossDb:val("mediumWallLossDb"),heavyWalls:val("heavyWalls"),
  heavyWallLossDb:val("heavyWallLossDb"),floorPenetrations:val("floorPenetrations"),
  floorLossDb:val("floorLossDb")
 };
}

function capacityInput(){
 return{
  standard:$("standard").value,band:$("band").value,channelWidth:val("channelWidth"),
  spatialStreams:val("spatialStreams"),radiosPerAp:val("radiosPerAp"),
  totalUsers:val("totalUsers"),activePct:val("activePct"),
  perActiveUserMbps:val("perActiveUserMbps"),
  protocolEfficiencyPct:val("protocolEfficiencyPct"),
  usableAirtimePct:val("usableAirtimePct"),clientMixPct:val("clientMixPct"),
  maxAssociatedUsersPerAp:val("maxAssociatedUsersPerAp"),
  minimumApCount:val("minimumApCount"),
  useCustomPhyRate:$("useCustomPhyRate").checked,
  customPhyRateMbps:val("customPhyRateMbps")
 };
}

function renderCoverage(r){
 setText("coverageApCount",formatInt(r.coverageApCount));
 setText("designRadius",`${format(r.designRadiusM,1)} m`);
 setText("rfRadius",`${format(r.rfRadiusM,1)} m`);
 setText("downlinkRadius",`${format(r.downlinkRadiusM,1)} m`);
 setText("uplinkRadius",`${format(r.uplinkRadiusM,1)} m`);
 setText("apEirp",`${format(r.apEirpDbm,1)} dBm`);
 setText("clientEirp",`${format(r.clientEirpDbm,1)} dBm`);
 setText("downlinkBudget",`${format(r.downlinkBudgetDb,1)} dB`);
 setText("uplinkBudget",`${format(r.uplinkBudgetDb,1)} dB`);
 setText("obstacleLoss",`${format(r.obstacleLossDb,1)} dB`);
 setText("fspl1m",`${format(r.fspl1mDb,1)} dB`);
 setText("effectiveArea",`${format(r.effectiveAreaPerApM2,0)} m²`);
 setText("apsPerFloor",formatInt(r.apsPerFloor));
 setText("areaPerFloor",`${format(r.areaPerFloorM2,0)} m²`);
 $("coverageWarnings").innerHTML=warningsHtml(r.warnings);
}

function renderCapacity(r){
 setText("capacityApCount",formatInt(r.capacityApCount));
 setText("phyRate",`${format(r.phyRateMbps,1)} Mbps`);
 setText("autoPhyRate",`${format(r.autoPhyRateMbps,1)} Mbps`);
 setText("effectiveThroughput",`${format(r.effectiveThroughputMbps,1)} Mbps`);
 setText("totalDemand",`${format(r.totalDemandMbps,1)} Mbps`);
 setText("activeUsers",format(r.activeUsers,1));
 setText("throughputApCount",formatInt(r.throughputApCount));
 setText("clientApCount",formatInt(r.associatedUserApCount));
 setText("associatedUsersPerAp",format(r.associatedUsersPerAp,1));
 setText("activeUsersPerAp",format(r.activeUsersPerAp,1));
 setText("demandPerAp",`${format(r.demandPerApMbps,1)} Mbps`);
 setText("throughputHeadroom",`${format(r.throughputHeadroomPct,1)}%`);
 $("capacityHeadroomBar").style.width=`${Math.min(100,Math.max(0,r.throughputHeadroomPct))}%`;
 $("capacityHeadroomBar").className=`bar-fill ${r.throughputHeadroomPct<15?"critical":r.throughputHeadroomPct<30?"high":"low"}`;
 $("capacityWarnings").innerHTML=warningsHtml(r.warnings);
}

function renderCombined(r){
 setText("finalApCount",formatInt(r.finalApCount));
 setText("summaryBottleneck",T.bottleneck[r.bottleneck]||r.bottleneck);
 setText("summaryCoverageAps",formatInt(r.coverageApCount));
 setText("summaryCapacityAps",formatInt(r.capacityApCount));
 setText("summaryThroughputAps",formatInt(r.throughputApCount));
 setText("summaryClientAps",formatInt(r.associatedUserApCount));
 setText("summaryAssociatedPerAp",format(r.associatedUsersPerFinalAp,1));
 setText("summaryActivePerAp",format(r.activeUsersPerFinalAp,1));
 setText("summaryDemandPerAp",`${format(r.demandPerFinalApMbps,1)} Mbps`);
 setText("summaryThroughputUtilization",`${format(r.throughputUtilizationPct,1)}%`);setText("summaryThroughputUtilizationBarLabel",`${format(r.throughputUtilizationPct,1)}%`);
 setText("summaryFloorAllocation",r.apsByFloor.map((count,index)=>`F${index+1}: ${count}`).join(" · "));
 $("summaryUtilBar").style.width=`${Math.min(100,Math.max(0,r.throughputUtilizationPct))}%`;
 $("summaryUtilBar").className=`bar-fill ${r.throughputUtilizationPct>85?"critical":r.throughputUtilizationPct>70?"high":r.throughputUtilizationPct>50?"medium":"low"}`;
 $("summaryWarnings").innerHTML=warningsHtml(r.warnings);
}

function renderChannel(r){
 setText("reusableChannels",formatInt(r.reusableChannels));
 setText("apsPerChannel",format(r.apsPerChannel,2));
 setText("channelReuseLoad",`${format(r.reuseLoadPct,0)}%`);
 setText("channelWidthResult",`${formatInt(r.channelWidth)} MHz`);
 setText("channelInventory",`${formatInt(r.available20MHzChannels)} × 20 MHz`);
 setRisk("channelRisk",r.risk);
 $("channelBar").style.width=`${Math.min(100,Math.max(0,r.reuseLoadPct/3))}%`;
 $("channelBar").className=`bar-fill ${r.risk}`;
 $("channelPlanBody").innerHTML=r.rows.slice(0,64).map(row=>`<tr><td>AP-${row.ap}</td><td>${row.floor}</td><td>${row.channelGroup}</td></tr>`).join("");
 $("channelWarnings").innerHTML=warningsHtml(r.warnings);
}

function calculateAll(){
 clearError("coverageError");clearError("capacityError");clearError("channelError");

 const coverage=E.coveragePlan(coverageInput());
 state.coverage=coverage;
 if(!coverage.ok){
  showError("coverageError",coverage.error);
  return;
 }
 renderCoverage(coverage);

 const capacity=E.capacityPlan(capacityInput());
 state.capacity=capacity;
 if(!capacity.ok){
  showError("capacityError",capacity.error);
  return;
 }
 renderCapacity(capacity);

 const combined=E.combinedPlan({coverage,capacity});
 state.combined=combined;
 if(!combined.ok)return;
 renderCombined(combined);

 const channel=E.channelPlan({
  finalApCount:combined.finalApCount,
  floors:coverage.floors,
  available20MHzChannels:val("available20MHzChannels"),
  channelWidth:val("channelWidth")
 });
 state.channel=channel;
 if(!channel.ok){
  showError("channelError",channel.error);
  return;
 }
 renderChannel(channel);
}

function activeRows(){
 const tab=state.activeTab;
 if(tab==="coverage"&&state.coverage?.ok){
  const r=state.coverage;
  return[
   ["Coverage AP count",r.coverageApCount],["Design radius m",r.designRadiusM],
   ["RF radius m",r.rfRadiusM],["Downlink radius m",r.downlinkRadiusM],
   ["Uplink radius m",r.uplinkRadiusM],["AP EIRP dBm",r.apEirpDbm],
   ["Client EIRP dBm",r.clientEirpDbm],["Obstacle loss dB",r.obstacleLossDb],
   ["Effective area/AP m2",r.effectiveAreaPerApM2],["APs/floor",r.apsPerFloor]
  ];
 }
 if(tab==="capacity"&&state.capacity?.ok){
  const r=state.capacity;
  return[
   ["Capacity AP count",r.capacityApCount],["Reference PHY Mbps",r.phyRateMbps],
   ["Effective throughput/AP Mbps",r.effectiveThroughputMbps],["Total demand Mbps",r.totalDemandMbps],
   ["Throughput AP count",r.throughputApCount],["Client-count AP count",r.associatedUserApCount],
   ["Associated users/AP",r.associatedUsersPerAp],["Active users/AP",r.activeUsersPerAp],
   ["Throughput headroom %",r.throughputHeadroomPct]
  ];
 }
 if(tab==="channel"&&state.channel?.ok){
  const r=state.channel;
  return[
   ["Final AP count",r.finalApCount],["Available 20 MHz channels",r.available20MHzChannels],
   ["Channel width MHz",r.channelWidth],["Reusable channel groups",r.reusableChannels],
   ["APs/channel group",r.apsPerChannel],["Reuse risk",T.risk[r.risk]]
  ];
 }
 if(tab==="summary"&&state.combined?.ok){
  const r=state.combined;
  return[
   ["Final AP count",r.finalApCount],["Bottleneck",T.bottleneck[r.bottleneck]],
   ["Coverage AP count",r.coverageApCount],["Capacity AP count",r.capacityApCount],
   ["Associated users/final AP",r.associatedUsersPerFinalAp],
   ["Active users/final AP",r.activeUsersPerFinalAp],
   ["Demand/final AP Mbps",r.demandPerFinalApMbps],
   ["Throughput utilization %",r.throughputUtilizationPct],
   ["Floor allocation",r.apsByFloor.map((count,index)=>`F${index+1}:${count}`).join(" ")]
  ];
 }
 return[];
}

function copyActive(){
 const rows=activeRows();if(!rows.length)return;
 const text=[
  "NetEngineerLab Wi-Fi Coverage & Capacity Planner",
  `${lang==="zh"?"工程名称":"Project"}: ${$("projectName").value}`,
  ...rows.map(row=>`${row[0]}: ${row[1]}`),
  T.engineering
 ].join("\n");
 copyText(text).then(()=>toast(T.copied));
}
function csvActive(){
 const rows=activeRows();if(!rows.length)return;
 downloadCsv([["Field","Value"],...rows],"netengineerlab-wifi-planning.csv");
}
function collectInputs(){
 const result={};
 allInputIds.forEach(id=>{
  const el=$(id);if(!el)return;
  result[id]=el.type==="checkbox"?el.checked:el.value;
 });
 return result;
}
function saveProject(){
 const list=JSON.parse(localStorage.getItem("nelWifiPlannerHistory")||"[]");
 list.unshift({
  time:new Date().toISOString(),
  name:$("projectName").value.trim()||"Wi-Fi Planning Project",
  activeTab:state.activeTab,
  inputs:collectInputs()
 });
 localStorage.setItem("nelWifiPlannerHistory",JSON.stringify(list.slice(0,12)));
 renderHistory();toast(T.saved);
}
function loadProject(item){
 Object.entries(item.inputs||{}).forEach(([id,value])=>{
  const el=$(id);if(!el)return;
  if(el.type==="checkbox")el.checked=Boolean(value);else el.value=value;
 });
 $("projectName").value=item.name||"Wi-Fi Planning Project";
 updateBandAndWidthOptions(false);activateTab(item.activeTab||"coverage");calculateAll();
 scrollTo({top:0,behavior:"smooth"});
}
function renderHistory(){
 const list=JSON.parse(localStorage.getItem("nelWifiPlannerHistory")||"[]");
 const root=$("historyList");
 if(!list.length){root.innerHTML=`<div class="empty">${T.noHistory}</div>`;return}
 root.innerHTML=list.map((item,index)=>`<article class="history-item">
  <div><strong>${escapeHtml(item.name)}</strong><small>${new Date(item.time).toLocaleString(locale)}</small></div>
  <span>${escapeHtml(item.activeTab)}</span>
  <button data-load="${index}">${T.load}</button>
  <button class="danger-button" data-delete="${index}">${T.delete}</button>
 </article>`).join("");
 root.querySelectorAll("[data-load]").forEach(btn=>btn.addEventListener("click",()=>loadProject(list[Number(btn.dataset.load)])));
 root.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{
  list.splice(Number(btn.dataset.delete),1);
  localStorage.setItem("nelWifiPlannerHistory",JSON.stringify(list));renderHistory();
 }));
}

initializeAccessibility();
document.querySelectorAll("[data-tab]").forEach(btn=>btn.addEventListener("click",()=>activateTab(btn.dataset.tab)));
$("profilePreset").addEventListener("change",event=>applyProfile(event.target.value));
$("standard").addEventListener("change",()=>{updateBandAndWidthOptions(false);calculateAll()});
$("band").addEventListener("change",()=>{updateBandAndWidthOptions(true);calculateAll()});
$("channelWidth").addEventListener("change",()=>{updatePhyReference();calculateAll()});
$("spatialStreams").addEventListener("input",()=>{updatePhyReference();calculateAll()});
$("radiosPerAp").addEventListener("input",()=>{updatePhyReference();calculateAll()});
$("useCustomPhyRate").addEventListener("change",()=>{updatePhyReference();calculateAll()});
$("calculateBtn").addEventListener("click",calculateAll);
$("copyBtn").addEventListener("click",copyActive);
$("csvBtn").addEventListener("click",csvActive);
$("saveBtn").addEventListener("click",saveProject);
$("printBtn").addEventListener("click",()=>window.print());
$("resetBtn").addEventListener("click",()=>applyProfile("office5"));
$("clearHistoryBtn").addEventListener("click",()=>{
 if(confirm(T.confirmClear)){
  localStorage.removeItem("nelWifiPlannerHistory");renderHistory();toast(T.cleared);
 }
});

allInputIds.forEach(id=>{
 const el=$(id);
 if(!el||["profilePreset","standard","band","channelWidth","spatialStreams","radiosPerAp","useCustomPhyRate"].includes(id))return;
 el.addEventListener("change",calculateAll);
});

const initial=location.hash.replace("#","");
activateTab(["coverage","capacity","channel","summary"].includes(initial)?initial:"coverage");
applyProfile("office5");
renderHistory();
})();
