(function(){"use strict";
const $=id=>document.getElementById(id), n=id=>Number($(id)?.value||0), fmt=(v,d=1)=>Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
const htmlLang=(document.documentElement.lang||"").toLowerCase();
const lang=htmlLang.startsWith("zh")?"zh":htmlLang.startsWith("es")?"es":"en";
const copy={
  en:{
    gates:"Engineering gates & scenarios",
    risk:"Risk",
    pass:"PASS",
    fail:"FAIL",
    conductor:"conductor",
    drop:"voltage drop",
    before:"Before / After design current",
    json:"Download JSON report",
    csv:"Download CSV check sheet",
    fallback:"Planning candidate only; verify conductor, voltage drop, fault and selectivity requirements.",
    levels:{info:"info",low:"low",medium:"medium",high:"high",critical:"critical"}
  },
  zh:{
    gates:"工程门禁与场景",
    risk:"风险",
    pass:"通过",
    fail:"不通过",
    conductor:"导体",
    drop:"压降",
    before:"优化前 / 优化后设计电流",
    json:"下载 JSON 报告",
    csv:"下载 CSV 校核表",
    fallback:"该结果仅为规划候选值；请复核导体、压降、故障电流和选择性要求。",
    levels:{info:"提示",low:"低",medium:"中",high:"高",critical:"严重"}
  },
  es:{
    gates:"Compuertas de ingeniería y escenarios",
    risk:"Riesgo",
    pass:"CUMPLE",
    fail:"NO CUMPLE",
    conductor:"conductor",
    drop:"caída de tensión",
    before:"Corriente de diseño antes / después",
    json:"Descargar informe JSON",
    csv:"Descargar hoja de verificación CSV",
    fallback:"Solo un candidato de planificación; verifique el conductor, la caída de tensión, la corriente de defecto y la selectividad.",
    levels:{info:"informativo",low:"bajo",medium:"medio",high:"alto",critical:"crítico"}
  }
}[lang];
const riskText={
  zh:{
    CONDUCTOR_AMPACITY:"导体载流量低于保守场景设计电流",
    VOLTAGE_DROP:"馈线估算压降超出规划范围",
    INTERRUPTING_RATING:"断路器分断能力低于预期故障电流",
    N1_CAPACITY:"N-1 电源容量无法承载保守场景负载",
    CONTINUOUS_LOADING:"断路器持续负载率超过 80%",
    DC_MARGIN:"直流支路持续电流余量不足",
    MISSING_FAULT_DATA:"尚未填写故障电流或分断能力"
  },
  es:{
    CONDUCTOR_AMPACITY:"La capacidad del conductor es inferior a la corriente de diseño del escenario conservador",
    VOLTAGE_DROP:"La caída de tensión estimada del alimentador supera el margen de planificación",
    INTERRUPTING_RATING:"El poder de corte del interruptor es inferior a la corriente de defecto prevista",
    N1_CAPACITY:"La capacidad de alimentación N-1 no puede llevar la carga del escenario conservador",
    CONTINUOUS_LOADING:"El interruptor supera el 80% de carga continua",
    DC_MARGIN:"La rama de CC tiene un margen limitado de corriente continua",
    MISSING_FAULT_DATA:"No se indicó la corriente de defecto ni el poder de corte"
  }
};
function level(value){return copy.levels[value]||copy.levels.low;}
function collect(){const b={loadKW:n("loadKW"),acVoltage:n("acV"),phase:$("phase")?.value,powerFactor:n("pf"),efficiencyPct:n("eff"),headroomPct:n("head"),deratingPct:n("der"),dcVoltage:n("dcV"),dcLoadA:n("dcA"),dcHeadroomPct:n("dcHead"),growthPct:n("growthPct")||20,conservativePct:n("conservativePct")||35,ambientC:n("ambientC")||30,altitudeM:n("altitudeM"),conductorAmpacityA:n("conductorA"),conductorLengthM:n("lengthM"),conductorAreaMm2:n("areaMm2"),faultCurrentKA:n("faultKA"),breakerInterruptKA:n("interruptKA"),sourceUnits:n("sourceUnits")||1,unitRatingA:n("unitRatingA")||0};return {...b,before:b,after:{...b,growthPct:0,conservativePct:0,sourceUnits:Math.max(2,b.sourceUnits)}};}
function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function riskLine(item){
  if(lang==="en")return `${level(item.severity)}: ${item.message}`;
  if(item.code==="VOLTAGE_DROP"&&item.severity==="medium"){
    const text=lang==="zh"?"馈线估算压降高于 2%":"La caída de tensión estimada del alimentador supera el 2%";
    return `${level(item.severity)}: ${text}`;
  }
  if(item.code==="VOLTAGE_DROP"&&item.severity==="high"){
    const text=lang==="zh"?"馈线估算压降超过 3%":"La caída de tensión estimada del alimentador supera el 3%";
    return `${level(item.severity)}: ${text}`;
  }
  const text=(riskText[lang]&&riskText[lang][item.code])||item.message;
  return `${level(item.severity)}: ${text}`;
}
function run(){
  const r=window.NELACDCBreakerEngine.calculate(collect());
  if(!r.ok)return;
  [["acbase",r.baseA," A"],["acdesign",r.designA," A"],["breaker",r.suggestedBreakerA," A"],["kva",r.apparentKVA," kVA"],["dcd",r.dcDesignA," A"],["dcb",r.suggestedDCBreakerA||"—",r.suggestedDCBreakerA?" A":""]].forEach(([id,v,u])=>{if($(id))$(id).textContent=(typeof v==="number"?fmt(v):v)+u;});
  if($("warn")){
    const lines=(r.risks||[]).map(riskLine);
    $("warn").replaceChildren();
    if(!lines.length)$("warn").textContent=copy.fallback;
    else lines.forEach((line,index)=>{
      if(index)$("warn").appendChild(document.createElement("br"));
      $("warn").appendChild(document.createTextNode(line));
    });
  }
  let box=$("engineeringExtras");
  if(!box){box=document.createElement("section");box.id="engineeringExtras";box.className="content-section";document.querySelector(".result-panel")?.appendChild(box);}
  const riskValue=r.riskLevel||r.summary?.riskLevel;
  box.innerHTML=`<h2>${copy.gates}</h2><p>${copy.risk}: <strong>${level(riskValue)}</strong>; N-1: <strong>${r.summary.n1Pass?copy.pass:copy.fail}</strong>; ${copy.conductor}: <strong>${r.scenarios.conservative.conductorPass?copy.pass:copy.fail}</strong>; ${copy.drop}: <strong>${fmt(r.scenarios.conservative.dropPct,2)}%</strong></p><p>${copy.before}: ${fmt(r.beforeAfter.before.designA,1)} A → ${fmt(r.beforeAfter.after.designA,1)} A</p><button type="button" id="downloadJson" class="btn">${copy.json}</button> <button type="button" id="downloadCsv" class="btn">${copy.csv}</button>`;
  $("downloadJson").onclick=()=>download("acdc-breaker-report.json",JSON.stringify(r,null,2),"application/json");
  $("downloadCsv").onclick=()=>download("acdc-breaker-check.csv",r.exportCSV(),"text/csv");
}
document.querySelectorAll("input,select").forEach(e=>e.addEventListener("input",run));
$("calculate")?.addEventListener("click",run);
run();
})();
