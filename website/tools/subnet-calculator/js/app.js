const $=id=>document.getElementById(id);
const LANG=document.documentElement.lang.toLowerCase().startsWith("en")?"en":"zh";
const ENGINE=window.SubnetEngine;
const REF=window.NEL_IP_REFERENCE;
let activeMode="ipv4";
let vlsmRows=[];
let sequence=0;
let last=null;

const T={
 zh:{
  invalidIPv4:"请输入有效IPv4地址和CIDR/掩码。",
  invalidIPv6:"请输入有效IPv6地址和前缀长度。",
  copied:"结果已复制",saved:"记录已保存",csv:"CSV已导出",empty:"暂无保存记录。",
  clearHistory:"确定清空全部历史记录吗？",
  remove:"删除",allocationFailed:"地址空间不足",private:"私有地址",public:"公网地址",
  shared:"运营商共享地址",loopback:"环回地址",linklocal:"链路本地地址",multicast:"组播地址",
  reserved:"保留地址",unique_local:"唯一本地地址",global:"全局单播",unspecified:"未指定地址"
 },
 en:{
  invalidIPv4:"Enter a valid IPv4 address and CIDR prefix or subnet mask.",
  invalidIPv6:"Enter a valid IPv6 address and prefix length.",
  copied:"Result copied",saved:"Record saved",csv:"CSV exported",empty:"No saved records.",
  clearHistory:"Clear all saved history?",
  remove:"Remove",allocationFailed:"Insufficient address space",private:"Private",public:"Public",
  shared:"Shared address space",loopback:"Loopback",linklocal:"Link-local",multicast:"Multicast",
  reserved:"Reserved",unique_local:"Unique local",global:"Global unicast",unspecified:"Unspecified"
 }
};
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function temp(button,message){const old=button.innerHTML;button.textContent=message;setTimeout(()=>button.innerHTML=old,1300)}
function formatInteger(value){try{return BigInt(value).toLocaleString("en-US")}catch{return Number(value).toLocaleString("en-US")}}
function scopeLabel(scope){const key=scope?.type||scope||"public";return T[LANG][key]||scope?.[LANG]||key}
function setMode(mode){
 activeMode=mode;
 document.querySelectorAll("[data-mode]").forEach(button=>button.classList.toggle("active",button.dataset.mode===mode));
 ["ipv4","ipv6","vlsm"].forEach(name=>$(`${name}Panel`).hidden=name!==mode);
 ["ipv4Result","ipv6Result","vlsmResult"].forEach(name=>$(name).hidden=!name.toLowerCase().startsWith(mode));
 if(mode==="ipv4")calculateIPv4();
 else if(mode==="ipv6")calculateIPv6();
 else calculateVlsm();
}
function prefixFromUi(){
 const mode=$("ipv4PrefixMode").value;
 return mode==="mask"?$("ipv4Mask").value:Number($("ipv4Prefix").value);
}
function syncMaskPrefix(){
 if($("ipv4PrefixMode").value==="cidr"){
  $("prefixField").hidden=false;$("maskField").hidden=true;
 }else{
  $("prefixField").hidden=true;$("maskField").hidden=false;
 }
 calculateIPv4();
}
function calculateIPv4(){
 try{
  const result=ENGINE.analyzeIPv4($("ipv4Address").value,prefixFromUi(),REF);
  last={mode:"ipv4",result,time:new Date().toISOString()};
  $("ipv4Validation").textContent="";
  const values={
   ipv4Cidr:result.cidr,ipv4Network:result.network,ipv4Broadcast:result.broadcast,
   ipv4First:result.firstHost,ipv4Last:result.lastHost,ipv4MaskResult:result.mask,
   ipv4Wildcard:result.wildcard,ipv4Total:formatInteger(result.totalAddresses),
   ipv4Usable:formatInteger(result.usableHosts),ipv4Scope:scopeLabel(result.scope),
   ipv4Previous:result.previousNetwork?`${result.previousNetwork}/${result.prefix}`:"—",
   ipv4Next:result.nextNetwork?`${result.nextNetwork}/${result.prefix}`:"—",
   ipv4Reverse:result.reverseZone||"—",
   ipv4BinaryIp:result.binary.ip,ipv4BinaryMask:result.binary.mask,
   ipv4BinaryNetwork:result.binary.network,ipv4BinaryBroadcast:result.binary.broadcast
  };
  Object.entries(values).forEach(([id,value])=>$(id).textContent=value);
  const hostBits=32-result.prefix;
  $("ipv4BitBar").innerHTML=`<span class="network-bits" style="width:${result.prefix/32*100}%">${LANG==="zh"?"网络位":"Network"} ${result.prefix}</span><span class="host-bits" style="width:${hostBits/32*100}%">${LANG==="zh"?"主机位":"Host"} ${hostBits}</span>`;
  if(typeof window.nelTrack==="function")window.nelTrack("subnet_ipv4_calculate",{prefix:result.prefix,usable:result.usableHosts});
 }catch{
  $("ipv4Validation").textContent=T[LANG].invalidIPv4;
 }
}
function calculateIPv6(){
 try{
  const result=ENGINE.analyzeIPv6($("ipv6Address").value,Number($("ipv6Prefix").value),Number($("ipv6BasePrefix").value));
  last={mode:"ipv6",result,time:new Date().toISOString()};
  $("ipv6Validation").textContent="";
  $("ipv6Cidr").textContent=result.cidr;
  $("ipv6Network").textContent=result.network;
  $("ipv6Last").textContent=result.lastAddress;
  $("ipv6Total").textContent=formatInteger(result.totalAddresses);
  $("ipv6SubnetCount").textContent=formatInteger(result.subnetCountFromBase);
  $("ipv6HostBits").textContent=result.hostBits;
  $("ipv6Scope").textContent=scopeLabel(result.scope);
  $("ipv6BitBar").innerHTML=`<span class="network-bits" style="width:${result.prefix/128*100}%">${LANG==="zh"?"网络位":"Network"} ${result.prefix}</span><span class="host-bits" style="width:${result.hostBits/128*100}%">${LANG==="zh"?"接口标识位":"Interface ID"} ${result.hostBits}</span>`;
  if(typeof window.nelTrack==="function")window.nelTrack("subnet_ipv6_calculate",{prefix:result.prefix});
 }catch{
  $("ipv6Validation").textContent=T[LANG].invalidIPv6;
 }
}
function addVlsmRow(name="",hosts=0,reserve=1){
 sequence++;
 vlsmRows.push({id:sequence,name,hosts,reserve});
 renderVlsmRows();calculateVlsm();
}
function removeVlsmRow(id){
 vlsmRows=vlsmRows.filter(row=>row.id!==id);
 renderVlsmRows();calculateVlsm();
}
function syncVlsmRows(){
 vlsmRows=vlsmRows.map(row=>({
  id:row.id,
  name:$(`vlsm-name-${row.id}`)?.value||"",
  hosts:Number($(`vlsm-hosts-${row.id}`)?.value||0),
  reserve:Number($(`vlsm-reserve-${row.id}`)?.value||0)
 }));
}
function renderVlsmRows(){
 const body=$("vlsmInputBody");
 if(!vlsmRows.length){
  body.innerHTML=`<tr><td colspan="5" class="empty-row">${LANG==="zh"?"暂无子网需求。":"No subnet requirements yet."}</td></tr>`;
  return;
 }
 body.innerHTML=vlsmRows.map((row,index)=>`<tr>
  <td>${index+1}</td>
  <td><input id="vlsm-name-${row.id}" value="${esc(row.name)}" aria-label="${LANG==="zh"?"子网名称":"Subnet name"}"></td>
  <td><input id="vlsm-hosts-${row.id}" type="number" min="0" step="1" value="${row.hosts}" aria-label="${LANG==="zh"?"主机需求":"Host requirement"}"></td>
  <td><input id="vlsm-reserve-${row.id}" type="number" min="0" step="1" value="${row.reserve}" aria-label="${LANG==="zh"?"预留地址":"Reserved addresses"}"></td>
  <td><button class="delete-row" data-delete="${row.id}" aria-label="${T[LANG].remove}">×</button></td>
 </tr>`).join("");
 body.querySelectorAll("input").forEach(input=>input.addEventListener("input",()=>{
  syncVlsmRows();clearTimeout(window.__vlsm);window.__vlsm=setTimeout(calculateVlsm,120);
 }));
 body.querySelectorAll("[data-delete]").forEach(button=>button.addEventListener("click",()=>removeVlsmRow(Number(button.dataset.delete))));
}
function calculateVlsm(){
 try{
  syncVlsmRows();
  const result=ENGINE.planVlsm($("vlsmBaseAddress").value,Number($("vlsmBasePrefix").value),vlsmRows,0,REF);
  last={mode:"vlsm",result,time:new Date().toISOString()};
  $("vlsmValidation").textContent="";
  $("vlsmBaseCidr").textContent=result.base.cidr;
  $("vlsmUsed").textContent=formatInteger(result.usedAddresses);
  $("vlsmRemaining").textContent=formatInteger(result.remainingAddresses);
  $("vlsmUtilization").textContent=result.utilizationPercent.toFixed(2)+"%";
  $("vlsmAllocationBody").innerHTML=result.allocations.map((item,index)=>`<tr>
   <td>${index+1}</td><td>${esc(item.name)}</td><td>${item.hosts}</td><td>${item.reserve}</td>
   <td>${item.cidr}</td><td>${item.firstHost}</td><td>${item.lastHost}</td><td>${item.broadcast}</td><td>${item.usableHosts}</td>
  </tr>`).join("")+(result.errors.length?result.errors.map(error=>`<tr class="error-row"><td>!</td><td>${esc(error.name)}</td><td colspan="7">${T[LANG].allocationFailed} /${error.requiredPrefix}</td></tr>`).join(""):"");
  const pct=Math.max(0,Math.min(100,result.utilizationPercent));
  $("vlsmBar").style.width=pct+"%";
  if(typeof window.nelTrack==="function")window.nelTrack("subnet_vlsm_calculate",{subnets:result.allocations.length,errors:result.errors.length});
 }catch{
  $("vlsmValidation").textContent=T[LANG].invalidIPv4;
 }
}
function loadSampleVlsm(){
 vlsmRows=[];sequence=0;
 [["Core",500,10],["Office",200,10],["WiFi",100,10],["CCTV",50,5],["Management",20,5]].forEach(([name,hosts,reserve])=>{sequence++;vlsmRows.push({id:sequence,name,hosts,reserve})});
 renderVlsmRows();calculateVlsm();
}
function resetAll(){
 $("ipv4Address").value="192.168.10.130";$("ipv4PrefixMode").value="cidr";$("ipv4Prefix").value=24;$("ipv4Mask").value="255.255.255.0";
 $("ipv6Address").value="2001:db8:1234:5678::1";$("ipv6Prefix").value=64;$("ipv6BasePrefix").value=48;
 $("vlsmBaseAddress").value="10.10.0.0";$("vlsmBasePrefix").value=20;syncMaskPrefix();loadSampleVlsm();calculateIPv6();
}
function reportText(){
 if(!last)return"";
 if(last.mode==="ipv4"){
  const r=last.result;return[`NetEngineerLab - IP Subnet Calculator`,`CIDR: ${r.cidr}`,`Network: ${r.network}`,`Broadcast: ${r.broadcast}`,`Host range: ${r.firstHost} - ${r.lastHost}`,`Mask: ${r.mask}`,`Wildcard: ${r.wildcard}`,`Usable hosts: ${r.usableHosts}`].join("\n");
 }
 if(last.mode==="ipv6"){
  const r=last.result;return[`NetEngineerLab - IPv6 Prefix Calculator`,`CIDR: ${r.cidr}`,`Network: ${r.network}`,`Last address: ${r.lastAddress}`,`Host bits: ${r.hostBits}`,`Address count: ${r.totalAddresses}`].join("\n");
 }
 const r=last.result;
 return [`NetEngineerLab - VLSM Planner`,`Base: ${r.base.cidr}`,`Used: ${r.usedAddresses}`,`Remaining: ${r.remainingAddresses}`,...r.allocations.map(item=>`${item.name}: ${item.cidr} ${item.firstHost}-${item.lastHost}`)].join("\n");
}
async function copyResult(){
 const text=reportText();if(!text)return;
 try{await navigator.clipboard.writeText(text)}
 catch{const area=document.createElement("textarea");area.value=text;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}
 temp($("copyBtn"),T[LANG].copied);
}
function exportCsv(){
 if(!last)return;
 let rows=[];
 if(last.mode==="ipv4"){
  const r=last.result;rows=[["CIDR",r.cidr],["Network",r.network],["Broadcast",r.broadcast],["First host",r.firstHost],["Last host",r.lastHost],["Mask",r.mask],["Wildcard",r.wildcard],["Usable hosts",r.usableHosts]];
 }else if(last.mode==="ipv6"){
  const r=last.result;rows=[["CIDR",r.cidr],["Network",r.network],["Last address",r.lastAddress],["Total addresses",r.totalAddresses],["Host bits",r.hostBits],["Scope",r.scope]];
 }else{
  rows=[["Name","Hosts","Reserve","CIDR","First host","Last host","Broadcast","Usable"]];
  last.result.allocations.forEach(item=>rows.push([item.name,item.hosts,item.reserve,item.cidr,item.firstHost,item.lastHost,item.broadcast,item.usableHosts]));
 }
 const csv="\uFEFF"+rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download=`ip_subnet_${last.mode}.csv`;a.click();URL.revokeObjectURL(a.href);temp($("csvBtn"),T[LANG].csv);
}
function getHistory(){try{return JSON.parse(localStorage.getItem("ipSubnetHistory")||"[]")}catch{return[]}}
function saveHistory(){
 if(!last)return;
 const history=getHistory();
 history.unshift({mode:last.mode,time:new Date().toISOString(),summary:reportText().split("\n").slice(1,4).join(" | ")});
 localStorage.setItem("ipSubnetHistory",JSON.stringify(history.slice(0,12)));renderHistory();temp($("saveBtn"),T[LANG].saved);
}
function renderHistory(){
 const history=getHistory();
 $("historyList").innerHTML=history.length?history.slice(0,6).map(item=>`<article class="history-card"><strong>${item.mode.toUpperCase()}</strong><span>${new Date(item.time).toLocaleString(LANG==="zh"?"zh-CN":"en-US")}</span><p>${esc(item.summary)}</p></article>`).join(""):`<div class="history-empty">${T[LANG].empty}</div>`;
}
function clearHistory(){
 if(!confirm(T[LANG].clearHistory))return;
 localStorage.removeItem("ipSubnetHistory");renderHistory();
}
document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.mode)));
["ipv4Address","ipv4Prefix","ipv4Mask"].forEach(id=>$(id).addEventListener("input",()=>{clearTimeout(window.__ipv4);window.__ipv4=setTimeout(calculateIPv4,100)}));
$("ipv4PrefixMode").addEventListener("change",syncMaskPrefix);
["ipv6Address","ipv6Prefix","ipv6BasePrefix"].forEach(id=>$(id).addEventListener("input",()=>{clearTimeout(window.__ipv6);window.__ipv6=setTimeout(calculateIPv6,100)}));
["vlsmBaseAddress","vlsmBasePrefix"].forEach(id=>$(id).addEventListener("input",()=>{clearTimeout(window.__vlsmBase);window.__vlsmBase=setTimeout(calculateVlsm,100)}));
$("addVlsmBtn").addEventListener("click",()=>addVlsmRow("",10,1));
$("sampleVlsmBtn").addEventListener("click",loadSampleVlsm);
$("calculateBtn").addEventListener("click",()=>activeMode==="ipv4"?calculateIPv4():activeMode==="ipv6"?calculateIPv6():calculateVlsm());
$("resetBtn").addEventListener("click",resetAll);
$("copyBtn").addEventListener("click",copyResult);
$("saveBtn").addEventListener("click",saveHistory);
$("csvBtn").addEventListener("click",exportCsv);
$("printBtn").addEventListener("click",()=>window.print());
$("clearHistoryBtn").addEventListener("click",clearHistory);
resetAll();setMode("ipv4");renderHistory();