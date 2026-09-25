(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const numberValue = (id) => Number($(id)?.value || 0);
  const format = (value, digits = 1) => Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });
  const zh = (document.documentElement.lang || "").startsWith("zh");

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
        frame: "场地允许的最大空调台数",
        frameHint: "可选；留空表示不限制台数",
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
        frame: "Maximum cooling units allowed by the site",
        frameHint: "Optional; leave blank for no unit-count limit",
      };

  const field = (label, hint, id, value, unit, extra = "") => `
    <div class="field cooling-gate-field">
      <label for="${id}">${label}${unit ? ` (${unit})` : ""}</label>
      <input id="${id}" data-input type="number" value="${value}" ${extra} aria-describedby="${id}Hint">
      <small id="${id}Hint" class="hint">${hint}</small>
    </div>`;

  function updateAutomaticPlaceholders() {
    const current = Math.max(0, numberValue("itKW"));
    const peak = $("peakITKW");
    const conservative = $("conservativeITKW");
    if (peak) peak.placeholder = `${zh ? "自动" : "Auto"}: ${format(current)} kW`;
    if (conservative) conservative.placeholder = `${zh ? "自动" : "Auto"}: ${format(numberValue("peakITKW") || current)} kW`;
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
        ${field(copy.frame, copy.frameHint, "frameMaxUnits", "", "", 'min="0" step="1" placeholder="' + (zh ? "不限制" : "No limit") + '"')}
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

  const riskLabel = (risk) => (zh ? ({ low: "低", medium: "中", high: "高" }[risk] || risk) : risk);
  const warningLabel = (warning) => {
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
    if (!zh) return name;
    return ({ baseline: "当前基线", peak: "峰值场景", conservative: "保守场景" })[name] || name;
  };

  function run(event) {
    ensureScenarioFields();
    if (["itKW", "peakITKW"].includes(event?.target?.id)) updateAutomaticPlaceholders();
    const result = window.NELCoolingSizingEngine.calculate(collect());
    if ($("result")) $("result").hidden = !result.ok;
    if (!result.ok) return;

    [
      ["base", result.totalBaseKW, " kW"],
      ["design", result.designKW, " kW"],
      ["units", result.recommendedUnits, ""],
      ["n1", zh ? (result.survives1 ? "通过" : "不通过") : (result.survives1 ? "PASS" : "FAIL"), ""],
      ["util", result.utilPct, "%"],
      ["btu", result.btuH, " BTU/h"],
      ["tons", result.tons, " RT"],
      ["air", result.airflowM3h, " m³/h"],
    ].forEach(([id, value, unit]) => {
      if ($(id)) $(id).textContent = (typeof value === "number" ? format(value) : value) + unit;
    });

    if ($("warn")) {
      const warnings = result.warnings.map(warningLabel);
      $("warn").className = result.risk === "low" ? "ok" : "warn";
      $("warn").textContent = zh
        ? `风险等级：${riskLabel(result.risk)}${warnings.length ? ` · ${warnings.join("；")}` : " · 未发现附加风险"}`
        : `Risk: ${result.risk}${warnings.length ? ` · ${warnings.join(", ")}` : " · No additional warnings"}`;
    }

    let report = $("cooling-report");
    if (!report) {
      report = document.createElement("section");
      report.id = "cooling-report";
      report.className = "panel";
      $("result")?.appendChild(report);
    }
    report.innerHTML = `
      <h2>${zh ? "场景与方案" : "Scenarios & plan"}</h2>
      <p>${zh ? "基线与保守场景对比" : "Baseline and conservative-case comparison"}</p>
      <p>${result.scenarios.map((scenario) => `${scenarioLabel(scenario.name)}：${format(scenario.tons, 1)} RT / ${zh ? "风险" : "risk"} ${riskLabel(scenario.risk)}`).join(" · ")}</p>
      <button id="coolJson" class="btn" type="button">${zh ? "下载 JSON 工程报告" : "Download JSON report"}</button>
      <button id="coolCsv" class="btn" type="button">${zh ? "下载 CSV 校核表" : "Download CSV check sheet"}</button>`;
    $("coolJson").onclick = () => download("cooling-engineering-report.json", window.NELCoolingSizingEngine.toJSON(result), "application/json");
    $("coolCsv").onclick = () => download("cooling-check-sheet.csv", window.NELCoolingSizingEngine.toCSV(result), "text/csv");
  }

  document.addEventListener("input", run);
  $("calculate")?.addEventListener("click", run);
  run();
})();
