const $=id=>document.getElementById(id);
const LANG=document.documentElement.lang.toLowerCase().startsWith("en")?"en":"zh";
const LIB=window.NEL_MTU_LIBRARY;
const ENGINE=window.MTUEngine;
let layers=[];
let sequence=0;
let last=null;

const T={
 zh:{
  healthy:"✓ 配置可用",warning:"⚠ 需要复核",failed:"✕ 存在分片风险",
  layer:"封装层",bytes:"单层字节",count:"数量",total:"合计",remove:"删除",
  copied:"结果已复制",saved:"记录已保存",csv:"CSV已导出",empty:"暂无保存记录。",
  clearHistory:"确定清空全部历史记录吗？",
  warnings:{
   headers_exceed_mtu:"有效MTU无法容纳当前协议头。",
   desired_exceeds_effective:"目标内层MTU高于当前有效MTU，可能分片或丢包。",
   ipv6_below_1280:"有效IPv6 MTU低于1280字节，应核对链路和隧道设计。",
   ipv4_below_576:"有效IPv4 MTU低于576字节，兼容性风险较高。",
   low_headroom:"目标MTU距离有效上限不足40字节，建议预留余量。",
   plain_path:"当前未配置额外封装。"
  }
 },
 en:{
  healthy:"✓ Configuration passes",warning:"⚠ Review required",failed:"✕ Fragmentation risk",
  layer:"Encapsulation layer",bytes:"Bytes per layer",count:"Count",total:"Total",remove:"Remove",
  copied:"Result copied",saved:"Record saved",csv:"CSV exported",empty:"No saved records.",
  clearHistory:"Clear all saved history?",
  warnings:{
   headers_exceed_mtu:"The effective MTU cannot carry the configured protocol headers.",
   desired_exceeds_effective:"The target inner MTU exceeds the effective MTU and may fragment or drop.",
   ipv6_below_1280:"The effective IPv6 MTU is below 1280 bytes; review the tunnel and path design.",
   ipv4_below_576:"The effective IPv4 MTU is below 576 bytes and has elevated compatibility risk.",
   low_headroom:"The target MTU is within 40 bytes of the effective limit; retain more headroom.",
   plain_path:"No additional encapsulation is configured."
  }
 }
};

function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function num(id){return Number.parseFloat($(id).value)}
function layerLabel(id){return LIB.layers[id]?.[LANG]||id}
function temp(button,message){const old=button.innerHTML;button.textContent=message;setTimeout(()=>button.innerHTML=old,1300)}

function addLayer(type="custom",count=1,bytes=null){
 sequence+=1;
 const standard=LIB.layers[type]||LIB.layers.custom;
 layers.push({id:sequence,type,count,bytes:bytes===null?standard.bytes:bytes});
 renderLayers();calculate();
}
function removeLayer(id){
 layers=layers.filter(layer=>layer.id!==id);
 renderLayers();calculate();
}
function syncLayers(){
 layers=layers.map(layer=>({
  ...layer,
  type:$(`layer-type-${layer.id}`)?.value||layer.type,
  bytes:Number.parseFloat($(`layer-bytes-${layer.id}`)?.value)||0,
  count:Math.max(0,Math.floor(Number.parseFloat($(`layer-count-${layer.id}`)?.value)||0))
 }));
}
function typeOptions(selected){
 return Object.entries(LIB.layers).map(([id,item])=>`<option value="${id}" ${id===selected?"selected":""}>${esc(item[LANG])}</option>`).join("");
}
function renderLayers(){
 const body=$("layerBody");
 if(!layers.length){
  body.innerHTML=`<tr><td colspan="5" class="empty-row">${LANG==="zh"?"未添加额外封装层。":"No additional encapsulation layers."}</td></tr>`;
  return;
 }
 body.innerHTML=layers.map(layer=>`<tr>
  <td><select id="layer-type-${layer.id}" aria-label="${T[LANG].layer}">${typeOptions(layer.type)}</select><small>${esc(LIB.layers[layer.type]?.source||"")}</small></td>
  <td><input id="layer-bytes-${layer.id}" type="number" min="0" step="1" value="${layer.bytes}" aria-label="${T[LANG].bytes}"></td>
  <td><input id="layer-count-${layer.id}" type="number" min="0" step="1" value="${layer.count}" aria-label="${T[LANG].count}"></td>
  <td><strong>${layer.bytes*layer.count}</strong> B</td>
  <td><button class="delete-layer" data-delete="${layer.id}" aria-label="${T[LANG].remove}">×</button></td>
 </tr>`).join("");
 body.querySelectorAll("select").forEach(select=>select.addEventListener("change",()=>{
  const id=Number(select.id.split("-").at(-1));
  const layer=layers.find(item=>item.id===id);
  if(layer){
   layer.type=select.value;
   layer.bytes=LIB.layers[select.value]?.bytes||0;
  }
  renderLayers();calculate();
 }));
 body.querySelectorAll("input").forEach(input=>input.addEventListener("input",()=>{
  syncLayers();renderLayerTotalsOnly();clearTimeout(window.__mtu);window.__mtu=setTimeout(calculate,120);
 }));
 body.querySelectorAll("[data-delete]").forEach(button=>button.addEventListener("click",()=>removeLayer(Number(button.dataset.delete))));
}
function renderLayerTotalsOnly(){
 layers.forEach(layer=>{
  const row=$(`layer-type-${layer.id}`)?.closest("tr");
  if(row)row.children[3].innerHTML=`<strong>${layer.bytes*layer.count}</strong> B`;
 });
}
function loadPreset(){
 const preset=LIB.presets[$("preset").value];
 if(!preset)return;
 $("underlayMtu").value=preset.underlayMtu;
 $("desiredInnerMtu").value=preset.desiredInnerMtu;
 $("innerIp").value=preset.innerIp;
 layers=[];sequence=0;
 preset.layers.forEach(([type,count])=>{sequence+=1;layers.push({id:sequence,type,count,bytes:LIB.layers[type].bytes})});
 renderLayers();calculate();
}
function inputModel(){
 syncLayers();
 return {
  underlayMtu:num("underlayMtu"),
  desiredInnerMtu:num("desiredInnerMtu"),
  outerVlanTags:num("outerVlanTags"),
  strictVlan:$("vlanMode").value==="strict",
  innerIp:$("innerIp").value,
  ipExtraBytes:num("ipExtraBytes"),
  tcpOptionsBytes:num("tcpOptionsBytes"),
  layers:layers.map(layer=>({
   type:layer.type,label:layerLabel(layer.type),bytes:layer.bytes,count:layer.count
  }))
 };
}
function calculate(){
 last=ENGINE.calculate(inputModel());
 renderResult(last);
 if(typeof window.nelTrack==="function"){
  window.nelTrack("mtu_mss_calculate",{
   status:last.status,
   effective_mtu:last.effectiveInnerMtu,
   overhead:last.totalLayerOverhead,
   mss:last.advertisedMss
  });
 }
}
function setText(id,value){$(id).textContent=value}
function renderResult(r){
 setText("effectiveMtu",r.effectiveInnerMtu);
 setText("totalOverhead",r.totalLayerOverhead);
 setText("recommendedMss",r.advertisedMss);
 setText("actualTcpPayload",r.actualTcpData);
 setText("udpPayload",r.udpPayload);
 setText("icmpPayload",r.icmpPayload);
 setText("requiredUnderlay",r.requiredBaseMtu);
 setText("outerPacketLimit",r.outerPacketLimit);
 setText("headroom",r.headroomBytes);
 setText("fragmentationBytes",r.fragmentationBytes);
 setText("currentFrame",r.currentWireFrameBytes);
 setText("requiredFrame",r.requiredWireFrameBytes);
 setText("overheadPercent",r.overheadPercent.toFixed(2));
 setText("ipHeader",r.ipFixed+r.ipExtra);
 setText("tcpHeader",r.tcpFixed+r.tcpOptions);
 setText("windowsPing",r.commands.windows);
 setText("linuxPing",r.commands.linux);

 const card=$("summaryCard");
 card.className=`summary-card ${r.status}`;
 $("statusBadge").className=`status-badge ${r.status}`;
 $("statusBadge").textContent=T[LANG][r.status];

 const used=Math.max(0,Math.min(100,(r.totalLayerOverhead/Math.max(1,r.underlayMtu))*100));
 $("overheadBar").style.width=used+"%";
 $("mtuBar").style.width=Math.max(0,Math.min(100,r.effectiveInnerMtu/Math.max(1,r.underlayMtu)*100))+"%";

 $("warningList").innerHTML=r.warnings.map(code=>`<li>${esc(T[LANG].warnings[code]||code)}</li>`).join("");
 if(!r.warnings.length)$("warningList").innerHTML=`<li>${LANG==="zh"?"当前参数未发现明显风险。":"No material risk was found with the current inputs."}</li>`;

 $("breakdownBody").innerHTML=[
  [LANG==="zh"?"基础Underlay MTU":"Base underlay MTU",r.underlayMtu],
  [LANG==="zh"?"严格VLAN扣减":"Strict VLAN deduction",r.strictVlan?r.vlanBytes:0],
  ...r.layers.map(layer=>[`${esc(layer.label)} × ${layer.count}`,layer.bytes*layer.count]),
  [LANG==="zh"?"总封装开销":"Total encapsulation overhead",r.totalLayerOverhead],
  [LANG==="zh"?"有效内层MTU":"Effective inner MTU",r.effectiveInnerMtu]
 ].map(([name,bytes],index)=>`<tr class="${index>=r.layers.length+2?"total-row":""}"><td>${name}</td><td>${bytes} B</td></tr>`).join("");

 renderStack(r);
}
function renderStack(r){
 const items=[
  {name:LANG==="zh"?"物理链路":"Physical link",bytes:r.underlayMtu},
  ...(r.strictVlan&&r.vlanBytes?[{name:`VLAN × ${r.outerVlanTags}`,bytes:r.vlanBytes}]:[]),
  ...r.layers.map(layer=>({name:layer.label,bytes:layer.bytes*layer.count})),
  {name:LANG==="zh"?"有效内层IP":"Effective inner IP",bytes:r.effectiveInnerMtu}
 ];
 $("stackDiagram").innerHTML=items.map((item,index)=>`<div class="stack-item ${index===items.length-1?"inner":""}"><strong>${esc(item.name)}</strong><span>${item.bytes} B</span></div>`).join('<span class="stack-arrow">→</span>');
}
function resetAll(){
 $("preset").value="plain";$("projectName").value="MTU and MSS Design";
 $("underlayMtu").value=1500;$("desiredInnerMtu").value=1500;$("outerVlanTags").value=0;$("vlanMode").value="expand";
 $("innerIp").value="ipv4";$("ipExtraBytes").value=0;$("tcpOptionsBytes").value=0;
 layers=[];sequence=0;renderLayers();calculate();
}
function reportText(){
 if(!last)calculate();
 return [
  "NetEngineerLab - MTU & MSS Calculator",
  `${LANG==="zh"?"工程":"Project"}: ${$("projectName").value.trim()||"Untitled"}`,
  `${LANG==="zh"?"基础Underlay MTU":"Base underlay MTU"}: ${last.underlayMtu} B`,
  `${LANG==="zh"?"总封装开销":"Total overhead"}: ${last.totalLayerOverhead} B`,
  `${LANG==="zh"?"有效内层MTU":"Effective inner MTU"}: ${last.effectiveInnerMtu} B`,
  `${LANG==="zh"?"推荐TCP MSS":"Recommended TCP MSS"}: ${last.advertisedMss} B`,
  `${LANG==="zh"?"实际TCP数据":"Actual TCP data"}: ${last.actualTcpData} B`,
  `${LANG==="zh"?"ICMP测试载荷":"ICMP test payload"}: ${last.icmpPayload} B`,
  `${LANG==="zh"?"所需Underlay MTU":"Required underlay MTU"}: ${last.requiredBaseMtu} B`,
  `${LANG==="zh"?"状态":"Status"}: ${T[LANG][last.status]}`
 ].join("\n");
}
async function copyResult(){
 const text=reportText();
 try{await navigator.clipboard.writeText(text)}
 catch{const area=document.createElement("textarea");area.value=text;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}
 temp($("copyBtn"),T[LANG].copied);
}
function exportCsv(){
 if(!last)calculate();
 const rows=[
  ["Project",$("projectName").value.trim()||"Untitled"],
  ["Base underlay MTU",last.underlayMtu],
  ["Total overhead",last.totalLayerOverhead],
  ["Effective inner MTU",last.effectiveInnerMtu],
  ["Recommended TCP MSS",last.advertisedMss],
  ["Actual TCP payload",last.actualTcpData],
  ["UDP payload",last.udpPayload],
  ["ICMP payload",last.icmpPayload],
  ["Required underlay MTU",last.requiredBaseMtu],
  ["Status",T[LANG][last.status]]
 ];
 const csv="\uFEFF"+rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="mtu_mss_report.csv";a.click();URL.revokeObjectURL(a.href);temp($("csvBtn"),T[LANG].csv);
}
function getHistory(){try{return JSON.parse(localStorage.getItem("mtuMssHistory")||"[]")}catch{return[]}}
function saveHistory(){
 if(!last)calculate();
 const history=getHistory();
 history.unshift({
  project:$("projectName").value.trim()||"Untitled",
  time:new Date().toISOString(),
  effective:last.effectiveInnerMtu,
  mss:last.advertisedMss,
  overhead:last.totalLayerOverhead,
  status:last.status
 });
 localStorage.setItem("mtuMssHistory",JSON.stringify(history.slice(0,12)));
 renderHistory();temp($("saveBtn"),T[LANG].saved);
}
function renderHistory(){
 const history=getHistory();
 $("historyList").innerHTML=history.length?history.slice(0,6).map(item=>`<article class="history-card"><strong>${esc(item.project)}</strong><span>${new Date(item.time).toLocaleString(LANG==="zh"?"zh-CN":"en-US")}</span><p>MTU ${item.effective} · MSS ${item.mss} · ${item.overhead} B</p><small>${T[LANG][item.status]}</small></article>`).join(""):`<div class="history-empty">${T[LANG].empty}</div>`;
}
function clearHistory(){
 if(!confirm(T[LANG].clearHistory))return;
 localStorage.removeItem("mtuMssHistory");renderHistory();
}
["underlayMtu","desiredInnerMtu","outerVlanTags","vlanMode","innerIp","ipExtraBytes","tcpOptionsBytes"].forEach(id=>$(id).addEventListener("input",()=>{clearTimeout(window.__mtuInput);window.__mtuInput=setTimeout(calculate,100)}));
$("preset").addEventListener("change",loadPreset);
$("addLayerBtn").addEventListener("click",()=>addLayer("custom",1,0));
$("calculateBtn").addEventListener("click",calculate);
$("resetBtn").addEventListener("click",resetAll);
$("copyBtn").addEventListener("click",copyResult);
$("saveBtn").addEventListener("click",saveHistory);
$("csvBtn").addEventListener("click",exportCsv);
$("printBtn").addEventListener("click",()=>window.print());
$("clearHistoryBtn").addEventListener("click",clearHistory);
resetAll();renderHistory();