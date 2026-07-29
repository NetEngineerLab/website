(function(){
 "use strict";
 const zh=document.documentElement.lang.toLowerCase().startsWith("zh");
 const $=id=>document.getElementById(id);
 const E=window.PoeBudgetEngine;
 let last;
 const text=zh?{
  pass:"容量充足",warning:"余量偏低",fail:"配置不满足",ports:"端口不足",budget:"功率预算不足",standard:"单端口等级不足",
  copied:"已复制",csv:"已导出",recommend:"建议升级到",unsupported:"超过 802.3bt Type 4 的标准 PD 功率"
 }:{
  pass:"Capacity available",warning:"Low headroom",fail:"Configuration fails",ports:"Not enough ports",budget:"Power budget exceeded",standard:"Per-port standard is insufficient",
  copied:"Copied",csv:"Exported",recommend:"Upgrade to",unsupported:"Exceeds standard 802.3bt Type 4 PD power"
 };
 const fmt=(v,d=1)=>Number(v).toLocaleString(zh?"zh-CN":"en-US",{maximumFractionDigits:d});
 function values(){return{
  switchBudget:$("switchBudget").value,switchPorts:$("switchPorts").value,deviceCount:$("deviceCount").value,
  deviceWatts:$("deviceWatts").value,cableLossPercent:$("cableLoss").value,headroomPercent:$("headroom").value,
  standard:$("standard").value
 }}
 function calculate(track=true){
  last=E.calculate(values());
  $("required").textContent=fmt(last.requiredBudget)+" W";
  $("load").textContent=fmt(last.loadWatts)+" W";
  $("perDevice").textContent=fmt(last.sourcePerDevice,2)+" W";
  $("remaining").textContent=(last.remaining>=0?fmt(last.remaining):"−"+fmt(Math.abs(last.remaining)))+" W";
  $("utilization").textContent=Number.isFinite(last.utilization)?fmt(last.utilization)+"%":"—";
  $("maximum").textContent=fmt(last.maxDevices,0);
  $("portsUsed").textContent=`${last.count} / ${last.ports}`;
  $("status").className="status "+last.status;
  $("status").textContent=text[last.status];
  $("bar").style.width=Math.min(100,Math.max(0,last.utilization||0))+"%";
  const issues=[];
  if(!last.portPass)issues.push(text.ports);
  if(!last.budgetPass)issues.push(text.budget);
  if(!last.standardPass)issues.push(last.recommended==="unsupported"?text.unsupported:`${text.standard} — ${text.recommend} ${E.STANDARDS[last.recommended].label}`);
  $("advice").textContent=issues.join(" · ")||(zh?"配置满足端口、总功率和单端口供电等级要求。":"The design meets port-count, total-budget and per-port power requirements.");
  if(track&&typeof window.nelTrack==="function")window.nelTrack("poe_budget_calculate",{status:last.status,standard:last.inputStandard});
 }
 const presets={
  cameras:[120,8,8,12.95,10,20,"af"],
  ptz:[370,16,8,30,12,20,"bt3"],
  wifi:[740,24,16,25.5,10,25,"at"],
  mixed:[370,24,12,18,12,25,"at"]
 };
 function preset(){
  const p=presets[$("preset").value];if(!p)return;
  ["switchBudget","switchPorts","deviceCount","deviceWatts","cableLoss","headroom","standard"].forEach((id,i)=>$(id).value=p[i]);
  calculate();
 }
 function report(){
  if(!last)calculate(false);
  return[
   "NetEngineerLab PoE Power Budget Calculator",
   `${zh?"所需交换机预算":"Required switch budget"}: ${fmt(last.requiredBudget)} W`,
   `${zh?"设备负载":"PD load"}: ${fmt(last.loadWatts)} W`,
   `${zh?"预算利用率":"Budget utilization"}: ${fmt(last.utilization)}%`,
   `${zh?"最多设备":"Maximum devices"}: ${last.maxDevices}`,
   `${zh?"状态":"Status"}: ${text[last.status]}`
  ].join("\n");
 }
 async function copy(){try{await navigator.clipboard.writeText(report())}catch{const a=document.createElement("textarea");a.value=report();document.body.append(a);a.select();document.execCommand("copy");a.remove()}$("copy").textContent=text.copied}
 function csv(){const b=new Blob(["\uFEFFMetric,Value\n"+report().split("\n").slice(1).map(x=>`"${x.replaceAll('"','""')}"`).join("\n")],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="poe-power-budget.csv";a.click();URL.revokeObjectURL(a.href);$("csv").textContent=text.csv}
 document.querySelectorAll("input,select").forEach(x=>x.addEventListener("input",()=>calculate(false)));
 $("preset").addEventListener("change",preset);$("calculate").addEventListener("click",()=>calculate());$("copy").addEventListener("click",copy);$("csv").addEventListener("click",csv);
 preset();
})();
