(function () {
  "use strict";
var nelCurrentValid=false;
window.NELToolInputController={calculate:function(){run();},managesValidation:true,isValid:function(){return nelCurrentValid;},invalidate:function(){nelCurrentValid=false;window.lastResult=null;},resultActions:"#coolJson,#coolCsv",resultValues:"#base,#design,#units,#n1,#util,#btu,#tons,#air,#density,#localAir,#ratio",resultDetails:"#coolingRows",validation:"",inputControls:".input-panel input,.input-panel select,.input-panel textarea"};



function nelInputError(ok){const l=(document.documentElement.lang||"en").toLowerCase();const msg=l.startsWith("zh")?"请检查输入：数值不能为负，必填负载与容量必须大于 0。":l.startsWith("es")?"Revise las entradas: los valores no pueden ser negativos y las cargas y capacidades obligatorias deben ser mayores que cero.":l.startsWith("id")?"Periksa masukan: nilai tidak boleh negatif, dan beban serta kapasitas wajib harus lebih dari 0.":l.startsWith("pt")?"Confira as entradas: os valores não podem ser negativos, e as cargas e capacidades obrigatórias devem ser maiores que zero.":"Check the inputs: values cannot be negative, and required loads and capacities must be greater than zero.";let el=document.getElementById("nelInputError");if(ok){if(el)el.hidden=true;return;}if(!el){el=document.createElement("p");el.id="nelInputError";el.className="nel-input-error";el.setAttribute("role","alert");el.style.cssText="color:#b42318;font-weight:700;background:#fdecec;border:1px solid #f4c7c3;border-radius:10px;padding:10px 12px;margin:10px 0";const anchor=document.getElementById("calculate");if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(el,anchor);else(document.querySelector("main")||document.body).prepend(el);}el.textContent=msg;el.hidden=false;}


  const $ = (id) => document.getElementById(id);
  const numberValue = (id) => Number($(id)?.value || 0);
  const optionalNumber = (id) => { const value = $(id)?.value; return value == null || String(value).trim() === "" ? undefined : Number(value); };
  function localDryAir(altitudeM, dryBulbC) {
    if (altitudeM == null && dryBulbC == null) return null;
    const z = altitudeM == null ? 0 : altitudeM;
    const t = dryBulbC == null ? 20 : dryBulbC;
    if (!Number.isFinite(z) || !Number.isFinite(t) || z < -500 || z > 11000 || t < -20 || t > 50) return { ok: false };
    const pressurePa = 101325 * Math.pow(1 - 2.25577e-5 * z, 5.2559);
    const densityKgM3 = pressurePa / (287.058 * (t + 273.15));
    return { ok: true, pressureKPa: pressurePa / 1000, densityKgM3, densityRatio: densityKgM3 / (101325 / (287.058 * 293.15)) };
  }
  const format = (value, digits = 1) => Number(value).toLocaleString(idLang ? "id-ID" : ptLang ? "pt-BR" : undefined, { maximumFractionDigits: digits });
  const lang = (document.documentElement.lang || "").toLowerCase();
  const zh = lang.startsWith("zh");
  const es = lang.startsWith("es");
  const idLang = lang.startsWith("id");
  const ptLang = lang.startsWith("pt");

  const copy = zh
    ? {
        title: "工程场景与环境校核",
        intro: "补充峰值、保守场景和场地边界。自动项留空即可，计算时采用当前 IT 负载。",
        peak: "峰值 IT 负载",
        peakHint: "留空时自动采用当前 IT 负载",
        conservative: "保守场景 IT 负载",
        conservativeHint: "留空时自动采用峰值 IT 负载",
        extra: "附加场景显热负荷",
        extraHint: "可选；不增加附加显热时留空",
        humidity: "相对湿度",
        humidityHint: "用于环境风险提示",
        altitude: "海拔",
        altitudeHint: "留空则风量仍按现有 1.2 kg/m³。填写后按标准大气压和干空气理想气体计算。",
        dryBulb: "机房干球温度",
        dryBulbHint: "只填海拔时按 20°C。这是机房温度，不是室外递减率。",
        frame: "场地允许的最大空调台数",
        frameHint: "可选；留空表示不限制台数",
      }
    : es
    ? {
        title: "Escenarios y ambiente",
        intro: "Añada el pico, el caso conservador y los límites del sitio. Deje los campos automáticos en blanco para usar la carga IT actual.",
        peak: "Carga IT pico",
        peakHint: "En blanco usa la carga IT actual",
        conservative: "Carga IT del caso conservador",
        conservativeHint: "En blanco usa la carga IT pico",
        extra: "Carga sensible adicional del escenario",
        extraHint: "Opcional; déjelo en blanco si no hay carga sensible extra",
        humidity: "Humedad relativa",
        humidityHint: "Se usa para el aviso ambiental",
        altitude: "Altitud",
        altitudeHint: "En blanco, el caudal sigue usando 1.2 kg/m³. Con un valor se calcula la densidad del aire seco.",
        dryBulb: "Temperatura seca de la sala",
        dryBulbHint: "Si solo indica altitud, se usan 20°C. Es la temperatura de la sala, no el gradiente exterior.",
        frame: "Máximo de unidades permitido por el sitio",
        frameHint: "Opcional; en blanco no limita el número de unidades",
      }
    : idLang
    ? {
        title: "Skenario rekayasa dan lingkungan",
        intro: "Tambahkan beban puncak, kasus konservatif, dan batas lokasi. Biarkan bidang otomatis kosong untuk memakai beban IT saat ini.",
        peak: "Beban IT puncak",
        peakHint: "Kosong memakai beban IT saat ini",
        conservative: "Beban IT kasus konservatif",
        conservativeHint: "Kosong memakai beban IT puncak",
        extra: "Beban sensibel tambahan skenario",
        extraHint: "Opsional; kosongkan jika tidak ada beban sensibel tambahan",
        humidity: "Kelembapan relatif",
        humidityHint: "Dipakai untuk pemeriksaan risiko lingkungan",
        altitude: "Ketinggian",
        altitudeHint: "Kosong mempertahankan aliran 1.2 kg/m³. Nilai yang diisi memakai tekanan atmosfer standar dan gas ideal udara kering.",
        dryBulb: "Suhu bola kering ruang",
        dryBulbHint: "Kosong memakai 20°C jika ketinggian diisi. Ini suhu ruang, bukan laju penurunan udara luar.",
        frame: "Jumlah unit pendingin maksimum yang diizinkan lokasi",
        frameHint: "Opsional; kosong berarti tidak membatasi jumlah unit",
      }
    : ptLang
    ? {
        title: "Cenários de engenharia e ambiente",
        intro: "Acrescente o pico, o caso conservador e os limites do local. Deixe os campos automáticos em branco para usar a carga de TI atual.",
        peak: "Carga de TI de pico",
        peakHint: "Em branco usa a carga de TI atual",
        conservative: "Carga de TI do caso conservador",
        conservativeHint: "Em branco usa a carga de TI de pico",
        extra: "Carga sensível adicional do cenário",
        extraHint: "Opcional; deixe em branco se não houver carga sensível extra",
        humidity: "Umidade relativa",
        humidityHint: "Usada na verificação de risco ambiental",
        altitude: "Altitude",
        altitudeHint: "Em branco, a vazão continua em 1.2 kg/m³. Um valor usa a pressão da atmosfera padrão e o gás ideal do ar seco.",
        dryBulb: "Temperatura de bulbo seco da sala",
        dryBulbHint: "Em branco usa 20°C quando a altitude é informada. É a temperatura da sala, não o gradiente externo.",
        frame: "Máximo de unidades de resfriamento permitido pelo local",
        frameHint: "Opcional; em branco não limita a quantidade de unidades",
      }
    : {
        title: "Engineering scenarios & environment",
        intro: "Add peak, conservative-case and site limits. Leave automatic fields blank to use the current IT load.",
        peak: "Peak IT load",
        peakHint: "Leave blank to use the current IT load",
        conservative: "Conservative-case IT load",
        conservativeHint: "Leave blank to use the peak IT load",
        extra: "Additional scenario sensible load",
        extraHint: "Optional; leave blank when no extra sensible load applies",
        humidity: "Relative humidity",
        humidityHint: "Used for environmental risk checks",
        altitude: "Altitude",
        altitudeHint: "Blank keeps the existing 1.2 kg/m³ airflow. A value uses standard-atmosphere pressure and dry-air ideal gas.",
        dryBulb: "Room dry-bulb",
        dryBulbHint: "Blank uses 20°C when altitude is entered. This is the room temperature, not the outdoor lapse rate.",
        frame: "Maximum cooling units allowed by the site",
        frameHint: "Optional; leave blank for no unit-count limit",
      };

  const field = (label, hint, id, value, unit, extra = "") => `
    <div class="field f cooling-gate-field">
      <label for="${id}">${label}${unit ? ` (${unit})` : ""}</label>
      <div class="inp input-wrap"><input id="${id}" data-input type="number" value="${value}" ${extra} aria-describedby="${id}Hint"></div>
      <small id="${id}Hint" class="hint">${hint}</small>
    </div>`;

  function updateAutomaticPlaceholders() {
    const current = Math.max(0, numberValue("itKW"));
    const peak = $("peakITKW");
    const conservative = $("conservativeITKW");
    const auto = zh ? "自动" : es ? "Automático" : idLang ? "Otomatis" : ptLang ? "Automático" : "Auto";
    if (peak) peak.placeholder = `${auto}: ${format(current)} kW`;
    if (conservative) conservative.placeholder = `${auto}: ${format(numberValue("peakITKW") || current)} kW`;
  }

  function ensureScenarioFields() {
    if ($("cooling-gates")) return;
    const section = document.createElement("section");
    section.id = "cooling-gates";
    section.className = "cooling-gates";
    section.innerHTML = `
      <div class="cooling-gates-heading">
        <h3>${copy.title}</h3>
        <p>${copy.intro}</p>
      </div>
      <div class="form-grid cooling-gates-grid">
        ${field(copy.peak, copy.peakHint, "peakITKW", "", "kW", 'min="0" step="0.1"')}
        ${field(copy.conservative, copy.conservativeHint, "conservativeITKW", "", "kW", 'min="0" step="0.1"')}
        ${field(copy.extra, copy.extraHint, "latentLoadKW", "", "kW", 'min="0" step="0.1" placeholder="0"')}
        ${field(copy.humidity, copy.humidityHint, "relativeHumidityPct", "50", "%", 'min="0" max="100" step="1"')}
        ${field(copy.altitude, copy.altitudeHint, "altitudeM", "", "m", 'step="1"')}
        ${field(copy.dryBulb, copy.dryBulbHint, "dryBulbC", "", "°C", 'step="0.1"')}
        ${field(copy.frame, copy.frameHint, "frameMaxUnits", "", "", 'min="0" step="1" placeholder="' + (zh ? "不限制" : es ? "Sin límite" : idLang ? "Tanpa batas" : ptLang ? "Sem limite" : "No limit") + '"')}
      </div>`;

    const inputPanel = document.querySelector(".nel-tool-input");
    const note = inputPanel?.querySelector(".note");
    if (inputPanel) inputPanel.insertBefore(section, note || inputPanel.querySelector("#calculate"));
    updateAutomaticPlaceholders();
  }

  function collect() {
    return {
      itKW: numberValue("itKW"),
      peakITKW: numberValue("peakITKW"),
      conservativeITKW: numberValue("conservativeITKW"),
      upsLossKW: numberValue("upsLoss"),
      pduLossKW: numberValue("pduLoss"),
      lightingKW: numberValue("lighting"),
      people: numberValue("people"),
      wPerPerson: numberValue("personW"),
      envelopeKW: numberValue("envelope"),
      otherKW: numberValue("other"),
      headroomPct: numberValue("headroom"),
      unitSensibleKW: numberValue("unitKW"),
      redundancyUnits: numberValue("red"),
      installedUnits: numberValue("installed"),
      deltaTC: numberValue("deltaT"),
      latentLoadKW: numberValue("latentLoadKW"),
      relativeHumidityPct: numberValue("relativeHumidityPct"),
      frameMaxUnits: numberValue("frameMaxUnits"),
    };
  }

  function download(name, content, type) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type }));
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  const riskLabel = (risk) => zh ? ({ low: "低", medium: "中", high: "高" }[risk] || risk) : es ? ({ low: "bajo", medium: "medio", high: "alto" }[risk] || risk) : idLang ? ({ low: "rendah", medium: "sedang", high: "tinggi" }[risk] || risk) : ptLang ? ({ low: "baixo", medium: "médio", high: "alto" }[risk] || risk) : risk;
  const warningLabel = (warning) => {
    if (es) return ({ n1Fail: "capacidad insuficiente tras el fallo de una unidad", n2Fail: "capacidad insuficiente tras el fallo de dos unidades", highUtil: "utilización normal alta", lowUtil: "utilización normal baja", frameLimit: "supera el máximo de unidades del sitio", humidityRisk: "humedad relativa alta", atmosphere: "altitud o temperatura fuera del modelo" })[warning] || warning;
    if (idLang) return ({ n1Fail: "kapasitas tidak cukup setelah satu unit gagal", n2Fail: "kapasitas tidak cukup setelah dua unit gagal", highUtil: "utilisasi normal tinggi", lowUtil: "utilisasi normal rendah", frameLimit: "melebihi jumlah unit maksimum di lokasi", humidityRisk: "kelembapan relatif tinggi", atmosphere: "ketinggian atau suhu di luar model" })[warning] || warning;
    if (ptLang) return ({ n1Fail: "capacidade insuficiente após a falha de uma unidade", n2Fail: "capacidade insuficiente após a falha de duas unidades", highUtil: "utilização normal alta", lowUtil: "utilização normal baixa", frameLimit: "excede o máximo de unidades do local", humidityRisk: "umidade relativa alta", atmosphere: "altitude ou temperatura fora do modelo" })[warning] || warning;
    if (!zh) return warning;
    return ({
      n1Fail: "单台故障后容量不足",
      n2Fail: "两台故障后容量不足",
      highUtil: "正常负载率偏高",
      lowUtil: "正常负载率偏低",
      frameLimit: "超过场地允许的最大空调台数",
      humidityRisk: "相对湿度偏高",
    })[warning] || warning;
  };
  const scenarioLabel = (name) => {
    if (es) return ({ baseline: "Base", peak: "Pico", conservative: "Conservador" })[name] || name;
    if (idLang) return ({ baseline: "Dasar", peak: "Puncak", conservative: "Konservatif" })[name] || name;
    if (ptLang) return ({ baseline: "Base", peak: "Pico", conservative: "Conservador" })[name] || name;
    if (!zh) return name;
    return ({ baseline: "当前基线", peak: "峰值场景", conservative: "保守场景" })[name] || name;
  };

  function run(event) {try{
    ensureScenarioFields();
    if (["itKW", "peakITKW"].includes(event?.target?.id)) updateAutomaticPlaceholders();
    const result = window.NELCoolingSizingEngine.calculate(collect());
    const dryAir = localDryAir(optionalNumber("altitudeM"), optionalNumber("dryBulbC"));
    if (dryAir && dryAir.ok === false) { nelCurrentValid=false; nelInputError(false); window.lastResult=null; for (const id of ["base","design","units","n1","util","btu","tons","air","density","localAir","ratio"]) if ($(id)) $(id).textContent="—"; return; }
    if (dryAir) { result.densityKgM3=dryAir.densityKgM3; result.densityRatio=dryAir.densityRatio; result.localAirflowM3h=result.airflowM3h*(1.2/dryAir.densityKgM3); }
    nelCurrentValid=result.ok!==false;
    if ($("result")) $("result").hidden = false;
    nelInputError(result.ok);
    if (!result.ok) {window.lastResult=null;for(const id of ["base","design","units","n1","util","btu","tons","air","density","localAir","ratio"])if($(id))$(id).textContent="—";if($("coolingRows"))$("coolingRows").replaceChildren();for(const id of ["coolJson","coolCsv"])if($(id))$(id).disabled=true;return;}window.lastResult=result;

    [
      ["base", result.totalBaseKW, " kW"],
      ["design", result.designKW, " kW"],
      ["units", result.recommendedUnits, ""],
      ["n1", zh ? (result.survives1 ? "通过" : "不通过") : es ? (result.survives1 ? "Cumple" : "No cumple") : idLang ? (result.survives1 ? "LULUS" : "GAGAL") : ptLang ? (result.survives1 ? "APROVADO" : "REPROVADO") : (result.survives1 ? "PASS" : "FAIL"), ""],
      ["util", result.utilPct, "%"],
      ["btu", result.btuH, " BTU/h"],
      ["tons", result.tons, " RT"],
      ["air", result.airflowM3h, " m³/h"],
      ["density", result.densityKgM3 == null ? "—" : format(result.densityKgM3, 3), result.densityKgM3 == null ? "" : " kg/m³"],
      ["localAir", result.localAirflowM3h == null ? "—" : format(result.localAirflowM3h, 0), result.localAirflowM3h == null ? "" : " m³/h"],
      ["ratio", result.densityRatio == null ? "—" : format(result.densityRatio, 3), ""],
    ].forEach(([id, value, unit]) => {
      if ($(id)) $(id).textContent = (typeof value === "number" ? format(value) : value) + unit;
    });

    if ($("warn")) {
      const warnings = result.warnings.map(warningLabel);
      $("warn").className = result.risk === "low" ? "ok" : "warn";
      const densityNote = result.densityKgM3 == null ? "" : (zh ? " 干空气密度只改当地风量，台数仍按输入的千瓦计算。" : es ? " La densidad del aire seco solo cambia el caudal local; el número de unidades sigue los kilovatios introducidos." : idLang ? " Kepadatan udara kering hanya mengubah aliran udara setempat. Jumlah unit tetap mengikuti kilowatt yang dimasukkan." : ptLang ? " A densidade do ar seco só altera a vazão local. A quantidade de unidades continua seguindo os quilowatts informados." : " Dry-air density changes only the local airflow. Unit count still follows the entered kilowatts.");
      $("warn").textContent = (zh
        ? `风险等级：${riskLabel(result.risk)}${warnings.length ? ` · ${warnings.join("；")}` : " · 未发现附加风险"}`
        : es
        ? `Riesgo: ${riskLabel(result.risk)}${warnings.length ? ` · ${warnings.join(", ")}` : " · Sin avisos adicionales"}`
        : idLang
        ? `Risiko: ${riskLabel(result.risk)}${warnings.length ? ` · ${warnings.join(", ")}` : " · Tidak ada peringatan tambahan"}`
        : ptLang
        ? `Risco: ${riskLabel(result.risk)}${warnings.length ? ` · ${warnings.join(", ")}` : " · Nenhum aviso adicional"}`
        : `Risk: ${result.risk}${warnings.length ? ` · ${warnings.join(", ")}` : " · No additional warnings"}`) + densityNote;
    }

    let report = $("cooling-report");
    if (!report) {
      report = document.createElement("section");
      report.id = "cooling-report";
      report.className = "bw-workspace-table nel-tool-result";
      document.querySelector("main>.workspace")?.appendChild(report);
    }
    report.innerHTML = `
      <h2 class="ro-h">${zh ? "场景与方案" : es ? "Escenarios y plan" : "Scenarios & plan"}</h2>
      <p>${zh ? "基线与保守场景对比" : es ? "Comparación de la base y del caso conservador" : "Baseline and conservative-case comparison"}</p>
      <div class="table-wrap"><table><thead><tr><th>${zh?"场景":es?"Escenario":"Scenario"}</th><th>RT</th><th>${zh?"风险":es?"Riesgo":"Risk"}</th></tr></thead><tbody id="coolingRows">${result.scenarios.map(s=>`<tr><td>${scenarioLabel(s.name)}</td><td>${format(s.tons,1)} RT</td><td>${riskLabel(s.risk)}</td></tr>`).join("")}</tbody></table></div>
      <div class="bw-actions"><button id="coolJson" class="btn" type="button">${zh ? "下载 JSON 工程报告" : es ? "Descargar informe JSON" : "Download JSON report"}</button>
      <button id="coolCsv" class="btn" type="button">${zh ? "下载 CSV 校核表" : es ? "Descargar hoja CSV" : "Download CSV check sheet"}</button></div>`;
    $("coolJson").onclick = () => {if(!nelCurrentValid)return;download("cooling-engineering-report.json", window.NELCoolingSizingEngine.toJSON(result), "application/json")};
    $("coolCsv").onclick = () => {if(!nelCurrentValid)return;download("cooling-check-sheet.csv", window.NELCoolingSizingEngine.toCSV(result), "text/csv")};
  }finally{window.NELToolInputController.sync?.();}}

  document.addEventListener("input", run);document.addEventListener("change", run);
  $("calculate")?.addEventListener("click", run);
  run();
})();
