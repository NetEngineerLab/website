(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const htmlLang=(document.documentElement.lang||"en").toLowerCase();
  const lang=htmlLang.startsWith("zh")?"zh":htmlLang.startsWith("es")?"es":"en";
  const num=id=>Number($(id)?.value||0);
  const fmt=(v,d=2)=>Number(v).toLocaleString(lang==="zh"?"zh-CN":lang==="es"?"es-ES":"en-US",{maximumFractionDigits:d});
  const copy={
    en:{
      gates:"Engineering gates & scenario comparison",
      risk:"Risk level",
      n1:"N-1 available capacity",
      pass:"PASS",
      fail:"FAIL",
      derate:"Environmental derating",
      wet:"Wet-stack risk",
      baFuel:"Before / After fuel",
      baN1:"Before / After N-1 capacity",
      baRun:"Before / After runtime",
      baMissing:"Enter valid Before / After plans to display the delta.",
      json:"Download JSON report",
      csv:"Download CSV check sheet",
      perDay:"L/day",
      overload:"One or more periods exceed rated load.",
      lowLoad:"Low-load periods may create wet-stacking risk.",
      n1fail:"N-1 capacity check failed.",
      levels:{critical:"critical",high:"high",medium:"medium",low:"low",info:"info"},
      scenarios:{baseline:"baseline",peak:"peak",conservative:"conservative",derated:"derated"}
    },
    zh:{
      gates:"工程门禁与方案比较",
      risk:"风险等级",
      n1:"N-1可用容量",
      pass:"通过",
      fail:"未通过",
      derate:"环境降额",
      wet:"湿堆风险",
      baFuel:"改造前 / 改造后油耗",
      baN1:"改造前 / 改造后 N-1 容量",
      baRun:"改造前 / 改造后续航",
      baMissing:"请输入有效的改造前 / 改造后方案以显示差异。",
      json:"下载JSON工程报告",
      csv:"下载CSV校核表",
      perDay:"L/天",
      overload:"存在超过额定负载的时段。",
      lowLoad:"低负载时段可能产生湿堆风险。",
      n1fail:"N-1容量校验未通过。",
      levels:{critical:"严重",high:"高",medium:"中",low:"低",info:"提示"},
      scenarios:{baseline:"基准",peak:"峰值",conservative:"保守",derated:"降额"}
    },
    es:{
      gates:"Compuertas de ingeniería y comparación de escenarios",
      risk:"Nivel de riesgo",
      n1:"Capacidad disponible N-1",
      pass:"CUMPLE",
      fail:"NO CUMPLE",
      derate:"Reducción ambiental",
      wet:"Riesgo de acumulación húmeda",
      baFuel:"Combustible antes / después",
      baN1:"Capacidad N-1 antes / después",
      baRun:"Autonomía antes / después",
      baMissing:"Introduzca planes válidos de antes / después para mostrar la diferencia.",
      json:"Descargar informe JSON",
      csv:"Descargar hoja de verificación CSV",
      perDay:"L/día",
      overload:"Uno o más periodos superan la carga nominal.",
      lowLoad:"Los periodos de baja carga pueden crear riesgo de acumulación húmeda.",
      n1fail:"La comprobación de capacidad N-1 no se cumple.",
      levels:{critical:"crítico",high:"alto",medium:"medio",low:"bajo",info:"informativo"},
      scenarios:{baseline:"referencia",peak:"pico",conservative:"conservador",derated:"reducido"}
    }
  }[lang];
  const level=value=>copy.levels[value]||copy.levels.low;
  const scenarioName=value=>copy.scenarios[value]||value;
  function collect(){
    const b={ratedKW:num("ratedKW"),ratedKVA:num("ratedKVA"),powerFactor:num("powerFactor"),fuel0:num("fuel0"),fuel25:num("fuel25"),fuel50:num("fuel50"),fuel75:num("fuel75"),fuel100:num("fuel100"),segments:[1,2,3,4].map(x=>({name:$(`segName${x}`)?.value||`Period ${x}`,loadKW:num(`segLoad${x}`),hours:num(`segHours${x}`)})).filter(s=>s.hours>0),tankLiters:num("tankLiters"),reservePct:num("reservePct"),unusableLiters:num("unusableLiters"),targetHours:num("targetHours"),fuelPrice:num("fuelPrice"),co2KgPerLiter:num("co2Factor"),generatorCount:num("generatorCount"),rotationHours:num("rotationHours"),batteryUsableKWh:num("batteryKWh"),batteryDischargeEfficiencyPct:num("batteryEff"),ambientTempC:num("ambientTempC"),altitudeM:num("altitudeM"),minimumLoadPct:num("minimumLoadPct")||25,wetStackHoursThreshold:num("wetStackHoursThreshold")||4,redundantGen:num("redundantGen"),requiredGenerators:num("requiredGenerators")||num("requiredGeneradors")||1,startFailurePct:num("startFailurePct")||num("startFalloPct")||2};
    const beforeCount=num("beforeGeneratorCount")||num("beforeGeneradorCount");
    const afterCount=num("afterGeneratorCount")||num("afterGeneradorCount");
    return {...b,before:{...b,generatorCount:beforeCount||b.generatorCount,redundantGen:num("beforeRedundantGen")},after:{...b,generatorCount:afterCount||b.generatorCount,redundantGen:num("afterRedundantGen")}};
  }
  function set(id,value){if($(id))$(id).textContent=value;}
  function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function extras(r){
    let box=$("engineeringExtras");
    if(!box){box=document.createElement("section");box.id="engineeringExtras";box.className="panel";$("result")?.appendChild(box);}
    const ba=r.beforeAfter;
    const fuelLine=ba&&ba.ok?`<div class="kv"><span>${copy.baFuel}</span><b>${fmt(ba.before.fuel,1)} → ${fmt(ba.after.fuel,1)} L (${fmt(ba.delta.fuel,1)} L)</b></div><div class="kv"><span>${copy.baN1}</span><b>${fmt(ba.before.capacity,1)} → ${fmt(ba.after.capacity,1)} kW (${fmt(ba.delta.capacity,1)} kW)</b></div><div class="kv"><span>${copy.baRun}</span><b>${fmt(ba.before.runtime,1)} → ${fmt(ba.after.runtime,1)} h (${fmt(ba.delta.runtime,1)} h)</b></div>`:`<p>${copy.baMissing}</p>`;
    box.innerHTML=`<h2>${copy.gates}</h2><div class="kv"><span>${copy.risk}</span><b>${level(r.risk)} (${r.riskScore})</b></div><div class="kv"><span>${copy.n1}</span><b>${fmt(r.nMinus1Capacity,1)} kW — ${r.nMinus1Pass?copy.pass:copy.fail}</b></div><div class="kv"><span>${copy.derate}</span><b>${fmt(r.environment.totalDeratePct,1)}%</b></div><div class="kv"><span>${copy.wet}</span><b>${level(r.wetStackRisk)}</b></div>${fuelLine}<p>${r.scenarios.map(s=>`${scenarioName(s.name)}: ${fmt(s.targetFuel,1)} L, ${level(s.risk)}`).join(" | ")}</p><button type="button" class="btn" id="downloadJson">${copy.json}</button> <button type="button" class="btn" id="downloadCsv">${copy.csv}</button>`;
    $("downloadJson").onclick=()=>download("generator-fuel-engineering-report.json",window.NELGeneratorFuelEngine.toJSONReport(r),"application/json");
    $("downloadCsv").onclick=()=>download("generator-fuel-check-sheet.csv",window.NELGeneratorFuelEngine.toCSV(r),"text/csv");
  }
  function calc(){
    const r=window.NELGeneratorFuelEngine.calculate(collect());
    $("error").hidden=r.ok;
    if(!r.ok){$("result").hidden=true;return;}
    $("result").hidden=false;
    set("avgLoad",`${fmt(r.avgLoadKW,1)} kW`);
    set("loadPct",`${fmt(r.avgLoadPct,1)}%`);
    set("fuelRate",`${fmt(r.avgFuelLph,2)} L/h`);
    set("dailyFuel",`${fmt(r.fuelPerCycle*24/r.totalHours,1)} ${copy.perDay}`);
    set("runtime",r.runtimeHours==null?"—":`${fmt(r.runtimeHours,1)} h`);
    set("targetFuel",`${fmt(r.targetFuelWithReserve,1)} L`);
    set("additionalFuel",`${fmt(r.additionalFuel,1)} L`);
    set("usableFuel",`${fmt(r.usableFuel,1)} L`);
    set("specificFuel",r.specificFuel==null?"—":`${fmt(r.specificFuel,3)} L/kWh`);
    set("targetCost",fmt(r.targetCost,2));
    set("targetCO2",`${fmt(r.targetCO2,1)} kgCO₂`);
    set("refills",String(r.refills));
    set("perUnit",`${fmt(r.perUnitRunHours,1)} h`);
    set("rotations",String(r.rotations));
    set("batteryDelay",`${fmt(r.batteryAssistHours,1)} h`);
    set("fuelAfterBattery",`${fmt(r.fuelAfterBattery,1)} L`);
    set("fuelSaved",`${fmt(r.batteryFuelSaved,1)} L`);
    const warnings=[];
    if(r.warnings.includes("overload"))warnings.push(copy.overload);
    if(r.warnings.includes("lowLoad"))warnings.push(copy.lowLoad);
    if(r.warnings.includes("nMinus1Capacity"))warnings.push(copy.n1fail);
    $("warnings").textContent=warnings.join(" ");
    $("warnings").hidden=!warnings.length;
    const body=$("profileBody");
    if(body){
      body.innerHTML="";
      r.profile.forEach(s=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`<td>${s.name}</td><td>${fmt(s.loadKW,1)} kW</td><td>${fmt(s.loadPct,1)}%</td><td>${fmt(s.fuelLph,2)} L/h</td><td>${fmt(s.fuelLiters,1)} L</td>`;
        body.appendChild(tr);
      });
    }
    extras(r);
  }
  document.querySelectorAll("[data-input]").forEach(e=>e.addEventListener("input",calc));
  $("calculate")?.addEventListener("click",calc);
  calc();
})();
