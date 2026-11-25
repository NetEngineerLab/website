(function(){"use strict";
var nelCurrentValid=false;
window.NELToolInputController={calculate:function(){run();},managesValidation:true,isValid:function(){return nelCurrentValid;},invalidate:function(){nelCurrentValid=false;window.lastResult=null;},resultActions:"#downloadJson,#downloadCsv",resultValues:"#acbase,#acdesign,#breaker,#kva,#dcd,#dcb",resultDetails:"#engineeringExtras",validation:"#warn",inputControls:".input-panel input,.input-panel select,.input-panel textarea"};



function nelInputError(ok){const l=(document.documentElement.lang||"en").toLowerCase();const msg=l.startsWith("zh")?"请检查输入：数值不能为负，必填负载与容量必须大于 0。":l.startsWith("es")?"Revise las entradas: los valores no pueden ser negativos y las cargas y capacidades obligatorias deben ser mayores que cero.":l.startsWith("id")?"Periksa masukan: nilai tidak boleh negatif, dan beban serta kapasitas wajib harus lebih dari 0.":l.startsWith("pt")?"Confira as entradas: os valores não podem ser negativos, e as cargas e capacidades obrigatórias devem ser maiores que zero.":"Check the inputs: values cannot be negative, and required loads and capacities must be greater than zero.";let el=document.getElementById("nelInputError");if(ok){if(el)el.hidden=true;return;}if(!el){el=document.createElement("p");el.id="nelInputError";el.className="nel-input-error";el.setAttribute("role","alert");el.style.cssText="color:#b42318;font-weight:700;background:#fdecec;border:1px solid #f4c7c3;border-radius:10px;padding:10px 12px;margin:10px 0";const anchor=document.getElementById("calculate");if(anchor&&anchor.parentNode)(anchor.closest(".input-actions")||anchor).parentNode.insertBefore(el,anchor.closest(".input-actions")||anchor);else(document.querySelector("main")||document.body).prepend(el);}el.textContent=msg;el.hidden=false;}

const $=id=>document.getElementById(id), n=id=>Number($(id)?.value||0), fmt=(v,d=1)=>Number(v).toLocaleString(lang==="id"?"id-ID":lang==="pt"?"pt-BR":undefined,{maximumFractionDigits:d});
const htmlLang=(document.documentElement.lang||"").toLowerCase();
const lang=htmlLang.startsWith("zh")?"zh":htmlLang.startsWith("es")?"es":htmlLang.startsWith("id")?"id":htmlLang.startsWith("pt")?"pt":"en";
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
  },
  id:{
    gates:"Gerbang rekayasa dan skenario",
    risk:"Risiko",
    pass:"LULUS",
    fail:"GAGAL",
    conductor:"konduktor",
    drop:"jatuh tegangan",
    before:"Arus desain sebelum / sesudah",
    json:"Unduh laporan JSON",
    csv:"Unduh lembar pemeriksaan CSV",
    fallback:"Hanya kandidat perencanaan; periksa konduktor, jatuh tegangan, arus gangguan, dan selektivitas.",
    levels:{info:"info",low:"rendah",medium:"sedang",high:"tinggi",critical:"kritis"}
  },
  pt:{
    gates:"Verificações de engenharia e cenários",
    risk:"Risco",
    pass:"APROVADO",
    fail:"REPROVADO",
    conductor:"condutor",
    drop:"queda de tensão",
    before:"Corrente de projeto antes / depois",
    json:"Baixar relatório JSON",
    csv:"Baixar folha de verificação CSV",
    fallback:"Apenas um candidato de planejamento; verifique o condutor, a queda de tensão, a corrente de falta e a seletividade.",
    levels:{info:"informativo",low:"baixo",medium:"médio",high:"alto",critical:"crítico"}
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
  },
  id:{
    CONDUCTOR_AMPACITY:"Ampasitas konduktor di bawah arus desain skenario konservatif",
    VOLTAGE_DROP:"Perkiraan jatuh tegangan penyulang melebihi margin perencanaan",
    INTERRUPTING_RATING:"Kemampuan pemutusan pemutus di bawah arus gangguan yang diperkirakan",
    N1_CAPACITY:"Kapasitas catu N-1 tidak menanggung beban skenario konservatif",
    CONTINUOUS_LOADING:"Pemutus melewati 80% beban kontinu",
    DC_MARGIN:"Cabang DC kekurangan margin arus kontinu",
    MISSING_FAULT_DATA:"Arus gangguan atau kemampuan pemutusan belum diisi"
  },
  pt:{
    CONDUCTOR_AMPACITY:"A ampacidade do condutor fica abaixo da corrente de projeto do cenário conservador",
    VOLTAGE_DROP:"A queda de tensão estimada do alimentador ultrapassa a margem de planejamento",
    INTERRUPTING_RATING:"A capacidade de interrupção do disjuntor fica abaixo da corrente de falta prevista",
    N1_CAPACITY:"A capacidade da alimentação N-1 não sustenta a carga do cenário conservador",
    CONTINUOUS_LOADING:"O disjuntor passa de 80% da carga contínua",
    DC_MARGIN:"O ramal CC tem margem limitada de corrente contínua",
    MISSING_FAULT_DATA:"A corrente de falta ou a capacidade de interrupção não foi informada"
  }
};
function level(value){return copy.levels[value]||copy.levels.low;}
function collect(){const b={loadKW:n("loadKW"),acVoltage:n("acV"),phase:$("phase")?.value,powerFactor:n("pf"),efficiencyPct:n("eff"),headroomPct:n("head"),deratingPct:n("der"),dcVoltage:n("dcV"),dcLoadA:n("dcA"),dcHeadroomPct:n("dcHead"),growthPct:n("growthPct"),conservativePct:n("conservativePct"),ambientC:n("ambientC"),altitudeM:n("altitudeM"),conductorAmpacityA:n("conductorA"),conductorLengthM:n("lengthM"),conductorAreaMm2:n("areaMm2"),faultCurrentKA:n("faultKA"),breakerInterruptKA:n("interruptKA"),sourceUnits:n("sourceUnits")||1,unitRatingA:n("unitRatingA")||0};return {...b,before:b,after:{...b,growthPct:0,conservativePct:0,sourceUnits:Math.max(2,b.sourceUnits)}};}
function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function riskLine(item){
  if(lang==="en")return `${level(item.severity)}: ${item.message}`;
  if(item.code==="VOLTAGE_DROP"&&item.severity==="medium"){
    const text=lang==="zh"?"馈线估算压降高于 2%":lang==="id"?"Perkiraan jatuh tegangan penyulang di atas 2%":lang==="pt"?"A queda de tensão estimada do alimentador passa de 2%":"La caída de tensión estimada del alimentador supera el 2%";
    return `${level(item.severity)}: ${text}`;
  }
  if(item.code==="VOLTAGE_DROP"&&item.severity==="high"){
    const text=lang==="zh"?"馈线估算压降超过 3%":lang==="id"?"Perkiraan jatuh tegangan penyulang di atas 3%":lang==="pt"?"A queda de tensão estimada do alimentador passa de 3%":"La caída de tensión estimada del alimentador supera el 3%";
    return `${level(item.severity)}: ${text}`;
  }
  const text=(riskText[lang]&&riskText[lang][item.code])||item.message;
  return `${level(item.severity)}: ${text}`;
}
function run(){try{
  const r=window.NELACDCBreakerEngine.calculate(collect());nelCurrentValid=r.ok!==false;
  nelInputError(r.ok);
  if(!r.ok){["acbase","acdesign","breaker","kva","dcd","dcb"].forEach(id=>{if($(id))$(id).textContent="—";});if($("warn"))$("warn").textContent="";const extras=$("engineeringExtras");if(extras)extras.replaceChildren();return;}
  [["acbase",r.baseA,"A"],["acdesign",r.designA,"A"],["breaker",r.suggestedBreakerA,"A"],["kva",r.apparentKVA,"kVA"],["dcd",r.dcDesignA,"A"],["dcb",r.suggestedDCBreakerA||"—",r.suggestedDCBreakerA?"A":""]].forEach(([id,v,u])=>{const el=$(id); if(!el)return; const val=(typeof v==="number"?fmt(v):v); if(u){el.innerHTML="<span>"+val+"</span><small>"+u+"</small>";} else el.textContent=val;});
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
  box.innerHTML=`<h2 class="ro-h">${copy.gates}</h2><p>${copy.risk}: <strong>${level(riskValue)}</strong>; N-1: <strong>${r.summary.n1Pass?copy.pass:copy.fail}</strong>; ${copy.conductor}: <strong>${r.scenarios.conservative.conductorPass?copy.pass:copy.fail}</strong>; ${copy.drop}: <strong>${fmt(r.scenarios.conservative.dropPct,2)}%</strong></p><p>${copy.before}: <span class="bw-value-pair">${fmt(r.beforeAfter.before.designA,1)} A</span> → <span class="bw-value-pair">${fmt(r.beforeAfter.after.designA,1)} A</span></p><button type="button" id="downloadJson" class="btn">${copy.json}</button> <button type="button" id="downloadCsv" class="btn">${copy.csv}</button>`;
  const bar=document.createElement("div");bar.className="bw-extra-actions";box.append(bar);bar.append($("downloadJson"),$("downloadCsv"));
  $("downloadJson").onclick=()=>download("acdc-breaker-report.json",JSON.stringify(r,null,2),"application/json");
  $("downloadCsv").onclick=()=>download("acdc-breaker-check.csv",r.exportCSV(),"text/csv");
}finally{window.NELToolInputController.sync?.();}}
const bwInitialInputs=Object.fromEntries(Array.from(document.querySelectorAll(".input-panel input,.input-panel select")).map(e=>[e.id,{value:e.value,checked:e.checked,type:e.type}]));document.querySelectorAll("input,select").forEach(e=>e.addEventListener("input",run));
$("calculate")?.addEventListener("click",run);document.getElementById("reset")?.addEventListener("click",()=>{Object.entries(bwInitialInputs).forEach(([id,d])=>{const e=$(id);if(e){e.value=d.value;if(d.type==="checkbox")e.checked=d.checked;}});run();});
run();
})();

(function(){const b=document.getElementById("calculate");if(!b)return;const label=b.innerHTML;let timer;b.addEventListener("click",()=>{clearTimeout(timer);b.setAttribute("aria-live","polite");b.textContent=document.documentElement.lang.startsWith("zh")?"已重新计算":document.documentElement.lang.startsWith("es")?"Recalculado":document.documentElement.lang.startsWith("id")?"Dihitung ulang":document.documentElement.lang.toLowerCase().startsWith("pt")?"Recalculado":"Recalculated";timer=setTimeout(()=>b.innerHTML=label,1100);});})();
