(function(){"use strict";
const $=id=>document.getElementById(id),num=id=>Number($(id)?.value||0);
const htmlLang=(document.documentElement.lang||"en").toLowerCase();
const lang=htmlLang.startsWith("zh")?"zh":htmlLang.startsWith("es")?"es":"en";
const fmt=(v,d=2)=>Number(v).toLocaleString(lang==="zh"?"zh-CN":lang==="es"?"es-ES":"en-US",{maximumFractionDigits:d});
const unit={
  en:{day:"kWh/day",yr:"kWh/yr",lyr:"L/yr",co2:"kgCO₂/yr",pay:"yr",min:"min. "},
  zh:{day:"kWh/天",yr:"kWh/年",lyr:"L/年",co2:"kgCO₂/年",pay:"年",min:"最低需求 "},
  es:{day:"kWh/día",yr:"kWh/año",lyr:"L/año",co2:"kgCO₂/año",pay:"años",min:"mín. "}
}[lang];
function collect(){let o={};document.querySelectorAll("[data-input]").forEach(e=>o[e.id]=e.type==="number"?Number(e.value):e.value);return o}
function set(id,v){$(id).textContent=v}
function calc(){
  const r=window.NELSolarEngine.calculate(collect());
  if(!r.ok){$("error").hidden=false;$("result").hidden=true;return}
  $("error").hidden=true;$("result").hidden=false;
  set("dailyLoad",fmt(r.dailyLoad,2)+" "+unit.day);
  set("avgLoad",fmt(r.avgLoad,2)+" kW");
  set("netEff",fmt(r.netEff*100,1)+"%");
  set("requiredPV",fmt(r.requiredPV,2)+" kWp");
  set("modules",r.installedModules+" × "+num("moduleW")+" W ("+unit.min+r.moduleCount+")");
  set("stringing",r.strings+" × "+r.modulesPerString);
  set("battery",fmt(r.batteryNominal,2)+" kWh");
  set("batteryAh",fmt(r.batteryAh,0)+" Ah @ "+num("systemVoltage")+" V");
  set("generation",fmt(r.dailyGeneration,2)+" "+unit.day);
  set("annualGen",fmt(r.annualGeneration,0)+" "+unit.yr);
  set("coverage",fmt(r.coverage,1)+"%");
  set("balance",(r.balance>=0?"+":"")+fmt(r.balance,2)+" "+unit.day);
  set("supplement",fmt(r.gridSupplement||r.generatorSupplement,2)+" "+unit.day);
  set("savings",fmt(r.savings,0));
  set("payback",r.payback==null?"—":fmt(r.payback,1)+" "+unit.pay);
  set("co2",fmt(r.co2,0)+" "+unit.co2);
  set("diesel",fmt(r.dieselSaved,0)+" "+unit.lyr);
  set("pvGap",(r.pvGap>0?"+":"")+fmt(r.pvGap,2)+" kWp");
  set("battGap",(r.battGap>0?"+":"")+fmt(r.battGap,2)+" kWh");
  set("extraLoad",fmt(r.surplusContinuousW,0)+" W");
  $("coverageBar").style.width=Math.min(100,r.coverage)+"%";
}
document.querySelectorAll("[data-input]").forEach(e=>e.addEventListener("input",calc));
$("calculate").addEventListener("click",calc);
calc();
})();
