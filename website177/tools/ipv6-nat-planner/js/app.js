(function(){
"use strict";
const E=window.NELIPv6NATEngine;
const P=window.NEL_IPV6_NAT_PRESETS;
const $=id=>document.getElementById(id);
const lang=(document.documentElement.lang||"en").toLowerCase().startsWith("zh")?"zh":"en";
const locale=lang==="zh"?"zh-CN":"en-US";
const state={last:{},activeTab:"ipv6"};

const T={
 en:{
  errors:{
   invalidIPv6:"Enter a valid IPv6 address or prefix.",
   invalidPrefix:"The child prefix must be equal to or longer than the parent prefix.",
   invalidIndex:"The preview start index is outside the parent prefix.",
   invalidIPv4:"Enter a valid IPv4 address.",
   invalidNAT:"Check the public IPv4, port range and session inputs.",
   invalidCGN:"Check the subscriber, public IPv4 and port-range inputs.",
   blockTooLarge:"The selected deterministic port block is larger than the usable port range.",
   unsupportedNAT64Prefix:"RFC 6052 mapping supports /32, /40, /48, /56, /64 or /96.",
   invalidUOctet:"For a /96 network-specific prefix, bits 64–71 (the u octet) must be zero.",
   prefixMismatch:"The IPv6 address does not belong to the selected translation prefix.",
   invalidNAT64:"Check the NAT64 prefix and address."
  },
  types:{
   "unspecified":"Unspecified","loopback":"Loopback","multicast":"Multicast",
   "link-local":"Link-local","unique-local":"Unique local","documentation":"Documentation",
   "ipv4-mapped":"IPv4-mapped","nat64-wkp":"NAT64 well-known prefix",
   "nat64-local-use":"NAT64 local-use prefix","global-unicast":"Global unicast","other":"Other",
   "global":"Global IPv4","private":"Private IPv4","shared-cgn":"Shared CGN space",
   "documentation":"Documentation","loopback":"Loopback","link-local":"Link-local",
   "multicast":"Multicast","reserved":"Reserved","benchmark":"Benchmark",
   "ietf-protocol":"IETF protocol assignment","this-network":"This network"
  },
  risk:{low:"Low",medium:"Medium",high:"High",critical:"Critical"},
  copied:"Result copied.",csv:"CSV exported.",saved:"Project saved.",cleared:"History cleared.",
  noHistory:"No saved planning projects.",load:"Load",delete:"Delete",
  confirmClear:"Clear all saved projects?",
  wkpWarning:"The RFC 6052 well-known prefix must not be used to represent non-global IPv4 addresses.",
  localUseNote:"64:ff9b:1::/48 is reserved for local-use IPv4/IPv6 translation within a domain.",
  portNamespace:"TCP and UDP have independent port namespaces; enabled protocols are counted separately.",
  deterministicNote:"A deterministic block normally reserves the same numeric block independently for each enabled transport protocol.",
  engineering:"Editable engineering estimate—not a vendor capacity guarantee or deployment approval."
 },
 zh:{
  errors:{
   invalidIPv6:"请输入有效的IPv6地址或前缀。",
   invalidPrefix:"子前缀长度必须大于或等于父前缀长度。",
   invalidIndex:"预览起始序号超出父前缀范围。",
   invalidIPv4:"请输入有效的IPv4地址。",
   invalidNAT:"请检查公网IPv4、端口范围及会话参数。",
   invalidCGN:"请检查用户数、公网IPv4及端口范围。",
   blockTooLarge:"确定性端口块大于可用端口范围。",
   unsupportedNAT64Prefix:"RFC 6052映射仅支持/32、/40、/48、/56、/64或/96。",
   invalidUOctet:"使用/96网络专用前缀时，第64—71位的u字节必须为零。",
   prefixMismatch:"IPv6地址不属于所选转换前缀。",
   invalidNAT64:"请检查NAT64前缀和地址。"
  },
  types:{
   "unspecified":"未指定地址","loopback":"环回地址","multicast":"组播地址",
   "link-local":"链路本地地址","unique-local":"唯一本地地址","documentation":"文档示例地址",
   "ipv4-mapped":"IPv4映射地址","nat64-wkp":"NAT64知名前缀",
   "nat64-local-use":"NAT64本地使用前缀","global-unicast":"全球单播地址","other":"其他地址",
   "global":"全球IPv4","private":"私网IPv4","shared-cgn":"CGN共享地址空间",
   "reserved":"保留地址","benchmark":"基准测试地址",
   "ietf-protocol":"IETF协议分配地址","this-network":"本网络地址"
  },
  risk:{low:"低",medium:"中",high:"高",critical:"严重"},
  copied:"结果已复制。",csv:"CSV已导出。",saved:"规划项目已保存。",cleared:"历史记录已清空。",
  noHistory:"暂无已保存的规划项目。",load:"载入",delete:"删除",
  confirmClear:"确认清空全部规划记录？",
  wkpWarning:"RFC 6052知名前缀不能用于表示非全球IPv4地址。",
  localUseNote:"64:ff9b:1::/48用于域内本地IPv4/IPv6转换。",
  portNamespace:"TCP和UDP拥有相互独立的端口命名空间，启用的协议分别计算容量。",
  deterministicNote:"确定性端口块通常在各传输协议中独立保留相同的数字端口块。",
  engineering:"结果为可编辑工程估算，不代表设备厂商容量承诺或正式部署审批。"
 }
}[lang];

function format(n,d=2){
 const v=Number(n);
 if(!Number.isFinite(v))return"—";
 return v.toLocaleString(locale,{maximumFractionDigits:d});
}
function formatInteger(n){return Number(n).toLocaleString(locale,{maximumFractionDigits:0})}
function exactCount(text,power){
 const s=String(text);
 if(s.length<=15)return Number(s).toLocaleString(locale);
 return `2^${power} (${s})`;
}
function toast(message){
 const el=$("toast");el.textContent=message;el.classList.add("show");
 setTimeout(()=>el.classList.remove("show"),1800);
}
function errorText(code){return T.errors[code]||code||"Error"}
function setText(id,value){const el=$(id);if(el)el.textContent=value}
function setRisk(id,risk){
 const el=$(id);if(!el)return;
 el.className=`risk-badge ${risk}`;
 el.textContent=T.risk[risk]||risk;
}
function showError(id,code){
 const el=$(id);el.hidden=false;el.textContent=errorText(code);
}
function clearError(id){const el=$(id);el.hidden=true;el.textContent=""}
function copyText(text){
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);
 const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();
 return Promise.resolve();
}
function downloadCsv(rows,name){
 const csv=rows.map(row=>row.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);toast(T.csv);
}
function tabName(){
 return document.querySelector(`[data-tab="${state.activeTab}"]`)?.textContent.trim()||state.activeTab;
}
function activateTab(name){
 state.activeTab=name;
 document.querySelectorAll("[data-tab]").forEach(btn=>{
  const active=btn.dataset.tab===name;
  btn.classList.toggle("active",active);btn.setAttribute("aria-selected",String(active));
 });
 document.querySelectorAll("[data-panel]").forEach(panel=>panel.hidden=panel.dataset.panel!==name);
 history.replaceState(null,"",`#${name}`);
}
document.querySelectorAll("[data-tab]").forEach(btn=>btn.addEventListener("click",()=>activateTab(btn.dataset.tab)));

function fillFields(prefix,data){
 Object.entries(data).forEach(([key,value])=>{
  const el=$(`${prefix}${key}`);
  if(!el)return;
  if(el.type==="checkbox")el.checked=Boolean(value);
  else el.value=value;
 });
}

/* IPv6 planner */
function applyIPv6Preset(key){
 const p=P.ipv6[key];if(!p)return;
 fillFields("v6",p);calculateIPv6();
}
function calculateIPv6(){
 clearError("v6Error");
 const result=E.planIPv6({
  address:$("v6address").value,
  parentPrefix:$("v6parentPrefix").value,
  childPrefix:$("v6childPrefix").value,
  startIndex:$("v6startIndex").value,
  previewCount:$("v6previewCount").value
 });
 if(!result.ok){showError("v6Error",result.error);return}
 state.last.ipv6=result;
 setText("v6Canonical",result.input);
 setText("v6Expanded",result.expanded);
 setText("v6Type",T.types[result.type]||result.type);setText("v6TypeBadge",T.types[result.type]||result.type);
 setText("v6ParentNetwork",result.parentNetwork);
 setText("v6ParentLast",result.parentLast);
 setText("v6ChildCount",exactCount(result.childCount,result.childCountPower));
 setText("v6AddressesPerChild",exactCount(result.addressesPerChild,result.addressesPower));
 setText("v6Containing",result.containingCidr);
 setText("v6ContainingIndex",result.containingIndex);
 setText("v6Previous",result.previous||"—");
 setText("v6Next",result.next||"—");
 $("v6PreviewBody").innerHTML=result.preview.map(row=>`<tr><td>${row.index}</td><td><code>${row.cidr}</code></td><td><code>${row.first}</code></td><td><code>${row.last}</code></td></tr>`).join("");
}
function ipv6Report(r){
 return[
  ["Canonical IPv6",r.input],["Expanded IPv6",r.expanded],["Type",T.types[r.type]||r.type],
  ["Parent network",r.parentNetwork],["Parent last",r.parentLast],
  ["Child prefix count",r.childCount],["Addresses per child",r.addressesPerChild],
  ["Containing child",r.containingCidr],["Containing index",r.containingIndex],
  ["Previous",r.previous||""],["Next",r.next||""]
 ];
}

/* NAT44 */
function applyNat44Preset(key){
 const p=P.nat44[key];if(!p)return;
 fillFields("n44",p);calculateNat44();
}
function calculateNat44(){
 clearError("n44Error");
 const r=E.nat44Capacity({
  publicIps:$("n44publicIps").value,subscribers:$("n44subscribers").value,
  portStart:$("n44portStart").value,portEnd:$("n44portEnd").value,
  reservePct:$("n44reservePct").value,allocationPct:$("n44allocationPct").value,
  sessionsPerSubscriber:$("n44sessionsPerSubscriber").value,safetyPct:$("n44safetyPct").value,
  tcpEnabled:$("n44tcpEnabled").checked,udpEnabled:$("n44udpEnabled").checked
 });
 if(!r.ok){showError("n44Error",r.error);return}
 state.last.nat44=r;
 setText("n44RawPorts",formatInteger(r.rawPorts));
 setText("n44UsablePorts",formatInteger(r.usablePerProtocol));
 setText("n44Protocols",String(r.protocols));
 setText("n44MappingsPerIp",formatInteger(r.mappingsPerIp));
 setText("n44TotalMappings",formatInteger(r.totalMappings));
 setText("n44RequiredMappings",formatInteger(r.requiredMappings));setText("n44DemandLabel",formatInteger(r.requiredMappings));
 setText("n44RequiredPublicIps",formatInteger(r.requiredPublicIps));
 setText("n44MaxSubscribers",formatInteger(r.maxSubscribers));
 setText("n44SharingRatio",`${format(r.sharingRatio,1)} : 1`);
 setText("n44MappingsPerSubscriber",format(r.mappingsPerSubscriber,0));
 setText("n44Usage",`${format(r.usagePct,1)}%`);
 setRisk("n44Risk",r.risk);
 $("n44Bar").style.width=`${Math.min(100,Math.max(0,r.usagePct))}%`;
 $("n44Bar").className=`bar-fill ${r.risk}`;
 setText("n44NamespaceNote",T.portNamespace);
}
function nat44Report(r){
 return[
  ["Public IPv4",r.publicIps],["Subscribers",r.subscribers],["Raw ports/protocol",r.rawPorts],
  ["Usable ports/protocol/IP",r.usablePerProtocol],["Enabled protocol pools",r.protocols],
  ["Mappings/public IPv4",r.mappingsPerIp],["Total mapping capacity",r.totalMappings],
  ["Required mappings",r.requiredMappings],["Required public IPv4",r.requiredPublicIps],
  ["Maximum subscribers",r.maxSubscribers],["Sharing ratio",r.sharingRatio],
  ["Capacity usage %",r.usagePct],["Risk",T.risk[r.risk]]
 ];
}

/* CGNAT */
function applyCgnPreset(key){
 const p=P.cgnat[key];if(!p)return;
 fillFields("cgn",p);calculateCgn();
}
function calculateCgn(){
 clearError("cgnError");
 const r=E.cgnatCapacity({
  subscribers:$("cgnsubscribers").value,publicIps:$("cgnpublicIps").value,
  portStart:$("cgnportStart").value,portEnd:$("cgnportEnd").value,
  reservePct:$("cgnreservePct").value,allocationPct:$("cgnallocationPct").value,
  blockSize:$("cgnblockSize").value,activePct:$("cgnactivePct").value,
  peakSessions:$("cgnpeakSessions").value,tcpPct:$("cgntcpPct").value,
  sessionsPerHour:$("cgnsessionsPerHour").value,eventsPerSession:$("cgneventsPerSession").value,
  bytesPerEvent:$("cgnbytesPerEvent").value,retentionDays:$("cgnretentionDays").value
 });
 if(!r.ok){showError("cgnError",r.error);return}
 state.last.cgnat=r;
 setText("cgnUsablePorts",formatInteger(r.usablePorts));
 setText("cgnBlocksPerIp",formatInteger(r.blocksPerIp));
 setText("cgnSupportedSubscribers",formatInteger(r.supportedSubscribers));
 setText("cgnRequiredPublicIps",formatInteger(r.requiredPublicIps));
 setText("cgnSpareSubscribers",formatInteger(r.spareSubscribers));
 setText("cgnUnusedPorts",formatInteger(r.unusedPortsPerIp));
 setText("cgnSharingRatio",`${format(r.sharingRatio,1)} : 1`);
 setText("cgnCapacityPct",`${format(r.capacityPct,1)}%`);
 setText("cgnTcpPeak",formatInteger(r.tcpPeak));
 setText("cgnUdpPeak",formatInteger(r.udpPeak));
 setText("cgnBlockUsage",`${format(r.blockUsagePct,1)}%`);
 setText("cgnActiveSubscribers",formatInteger(r.activeSubscribers));
 setText("cgnActiveMappings",formatInteger(r.activeMappings));
 setText("cgnDailyEvents",formatInteger(r.dailyEvents));
 setText("cgnDailyLogs",E.formatBytes(r.dailyLogBytes));
 setText("cgnRetentionLogs",E.formatBytes(r.retentionBytes));
 setRisk("cgnSubscriberRisk",r.subscriberRisk);
 setRisk("cgnPortRisk",r.portRisk);
 $("cgnCapacityBar").style.width=`${Math.min(100,Math.max(0,r.capacityPct))}%`;
 $("cgnCapacityBar").className=`bar-fill ${r.subscriberRisk}`;
 $("cgnPortBar").style.width=`${Math.min(100,Math.max(0,r.blockUsagePct))}%`;
 $("cgnPortBar").className=`bar-fill ${r.portRisk}`;
 setText("cgnDeterministicNote",T.deterministicNote);
}
function cgnReport(r){
 return[
  ["Subscribers",r.subscribers],["Public IPv4",r.publicIps],["Usable ports/IP",r.usablePorts],
  ["Port block size",r.blockSize],["Blocks/public IPv4",r.blocksPerIp],
  ["Supported subscribers",r.supportedSubscribers],["Required public IPv4",r.requiredPublicIps],
  ["Spare subscribers",r.spareSubscribers],["Sharing ratio",r.sharingRatio],
  ["Subscriber capacity %",r.capacityPct],["TCP peak mappings/subscriber",r.tcpPeak],
  ["UDP peak mappings/subscriber",r.udpPeak],["Port block usage %",r.blockUsagePct],
  ["Active mappings",r.activeMappings],["Daily log events",r.dailyEvents],
  ["Daily log volume",E.formatBytes(r.dailyLogBytes)],["Retention volume",E.formatBytes(r.retentionBytes)]
 ];
}

/* NAT64 */
function applyNat64Preset(key){
 const p=P.nat64[key];if(!p)return;
 fillFields("n64",p);calculateNat64();
}
function calculateNat64(){
 clearError("n64Error");
 const r=E.nat64Embed($("n64prefix").value,$("n64ipv4").value);
 if(!r.ok){showError("n64Error",r.error);return}
 state.last.nat64=r;
 setText("n64PrefixResult",r.prefix);
 setText("n64Ipv4Result",r.ipv4);
 setText("n64Ipv4Type",T.types[r.ipv4Type]||r.ipv4Type);
 setText("n64Ipv6Result",r.ipv6);
 setText("n64Expanded",r.expanded);
 $("n64reverseIpv6").value=r.ipv6;
 const notes=[];
 if(r.isLocalUse)notes.push(T.localUseNote);
 if(r.wkpNonGlobalWarning)notes.push(T.wkpWarning);
 notes.push(T.engineering);
 $("n64Warnings").innerHTML=notes.map(x=>`<li>${x}</li>`).join("");
 calculateNat64Reverse();
}
function calculateNat64Reverse(){
 clearError("n64ReverseError");
 const r=E.nat64Extract($("n64prefix").value,$("n64reverseIpv6").value);
 if(!r.ok){showError("n64ReverseError",r.error);setText("n64ReverseIpv4","—");return}
 state.last.nat64Reverse=r;
 setText("n64ReverseIpv4",r.ipv4);
 setText("n64ReverseType",T.types[r.ipv4Type]||r.ipv4Type);
}
function nat64Report(r){
 return[
  ["Translation prefix",r.prefix],["Prefix length",r.prefixLength],["IPv4",r.ipv4],
  ["IPv4 type",T.types[r.ipv4Type]||r.ipv4Type],["Synthesized IPv6",r.ipv6],
  ["Expanded IPv6",r.expanded],["WKP",r.isWkp],["Local-use prefix",r.isLocalUse]
 ];
}

/* Actions */
function activeReport(){
 const key=state.activeTab;
 const r=state.last[key==="cgn"?"cgnat":key];
 if(!r)return[];
 if(key==="ipv6")return ipv6Report(r);
 if(key==="nat44")return nat44Report(r);
 if(key==="cgn")return cgnReport(r);
 if(key==="nat64")return nat64Report(r);
 return[];
}
function copyActive(){
 const rows=activeReport();
 if(!rows.length)return;
 const text=[`NetEngineerLab ${tabName()}`,...rows.map(row=>`${row[0]}: ${row[1]}`),T.engineering].join("\n");
 copyText(text).then(()=>toast(T.copied));
}
function csvActive(){
 const rows=activeReport();
 if(!rows.length)return;
 downloadCsv([["Field","Value"],...rows],"netengineerlab-ipv6-nat-planning.csv");
}
function collectInputs(){
 const values={};
 document.querySelectorAll("input[id],select[id]").forEach(el=>{
  if(el.closest("[data-panel]")){
   values[el.id]=el.type==="checkbox"?el.checked:el.value;
  }
 });
 return values;
}
function saveProject(){
 const history=JSON.parse(localStorage.getItem("nelIpv6NatHistory")||"[]");
 history.unshift({
  id:Date.now(),time:new Date().toISOString(),name:$("projectName").value.trim()||"IPv6 & NAT Planning",
  activeTab:state.activeTab,inputs:collectInputs()
 });
 localStorage.setItem("nelIpv6NatHistory",JSON.stringify(history.slice(0,12)));
 renderHistory();toast(T.saved);
}
function loadProject(item){
 Object.entries(item.inputs||{}).forEach(([id,value])=>{
  const el=$(id);if(!el)return;
  if(el.type==="checkbox")el.checked=Boolean(value);else el.value=value;
 });
 $("projectName").value=item.name||"IPv6 & NAT Planning";
 activateTab(item.activeTab||"ipv6");
 calculateAll();
 scrollTo({top:0,behavior:"smooth"});
}
function renderHistory(){
 const history=JSON.parse(localStorage.getItem("nelIpv6NatHistory")||"[]");
 const root=$("historyList");
 if(!history.length){root.innerHTML=`<div class="empty">${T.noHistory}</div>`;return}
 root.innerHTML=history.map((item,index)=>`<article class="history-item">
  <div><strong>${escapeHtml(item.name)}</strong><small>${new Date(item.time).toLocaleString(locale)}</small></div>
  <span>${escapeHtml(item.activeTab)}</span>
  <button type="button" data-load="${index}">${T.load}</button>
  <button type="button" class="danger-button" data-delete="${index}">${T.delete}</button>
 </article>`).join("");
 root.querySelectorAll("[data-load]").forEach(btn=>btn.addEventListener("click",()=>loadProject(history[Number(btn.dataset.load)])));
 root.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{
  history.splice(Number(btn.dataset.delete),1);localStorage.setItem("nelIpv6NatHistory",JSON.stringify(history));renderHistory();
 }));
}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function calculateAll(){calculateIPv6();calculateNat44();calculateCgn();calculateNat64()}
function resetAll(){
 $("projectName").value="IPv6 & NAT Planning Project";
 $("v6Preset").value="enterprise";applyIPv6Preset("enterprise");
 $("n44Preset").value="smallEnterprise";applyNat44Preset("smallEnterprise");
 $("cgnPreset").value="deterministic1024";applyCgnPreset("deterministic1024");
 $("n64Preset").value="localUse";applyNat64Preset("localUse");
}

/* Bind */
$("v6Preset").addEventListener("change",e=>applyIPv6Preset(e.target.value));
$("n44Preset").addEventListener("change",e=>applyNat44Preset(e.target.value));
$("cgnPreset").addEventListener("change",e=>applyCgnPreset(e.target.value));
$("n64Preset").addEventListener("change",e=>applyNat64Preset(e.target.value));
$("v6Calculate").addEventListener("click",calculateIPv6);
$("n44Calculate").addEventListener("click",calculateNat44);
$("cgnCalculate").addEventListener("click",calculateCgn);
$("n64Calculate").addEventListener("click",calculateNat64);
$("n64ReverseCalculate").addEventListener("click",calculateNat64Reverse);
$("copyBtn").addEventListener("click",copyActive);
$("csvBtn").addEventListener("click",csvActive);
$("saveBtn").addEventListener("click",saveProject);
$("printBtn").addEventListener("click",()=>window.print());
$("resetBtn").addEventListener("click",resetAll);
$("clearHistoryBtn").addEventListener("click",()=>{if(confirm(T.confirmClear)){localStorage.removeItem("nelIpv6NatHistory");renderHistory();toast(T.cleared)}});

document.querySelectorAll("[data-panel] input,[data-panel] select").forEach(el=>{
 el.addEventListener("change",()=>{
  if(el.id.endsWith("Preset"))return;
  if(el.closest('[data-panel="ipv6"]'))calculateIPv6();
  if(el.closest('[data-panel="nat44"]'))calculateNat44();
  if(el.closest('[data-panel="cgn"]'))calculateCgn();
  if(el.closest('[data-panel="nat64"]')){
   if(el.id==="n64reverseIpv6")calculateNat64Reverse();else calculateNat64();
  }
 });
});

const initial=location.hash.replace("#","");
activateTab(["ipv6","nat44","cgn","nat64"].includes(initial)?initial:"ipv6");
resetAll();renderHistory();
})();