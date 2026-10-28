/* Optical Power Budget V3 UI — production. Uses js/engine.js. */
(function () {
  "use strict";
  const eng = window.NELOpticalPowerBudgetEngine;
  const LOCALE = (document.documentElement.getAttribute("data-nel-locale")
    || (document.documentElement.lang || "en").toLowerCase().slice(0, 2)
    || "en");
  const I18N = {
    en: {
      pass: "Pass", marginal: "Marginal", fail: "Fail", invalid: "Invalid",
      invalidInput: "Invalid input",
      invalidMsg: "Counts must be non-negative integers; losses/distance finite and ≥ 0; attenuation > 0; Tx max ≥ Tx min; overload above sensitivity.",
      cannotCompute: "Cannot compute",
      remainLbl: "Remaining vs class budget",
      sensLbl: "Receiver sensitivity margin",
      overLbl: "Overload margin",
      allOk: "All three checks ≥ 3 dB.",
      warnReason: "At least one check is between 0 and 3 dB.",
      failReason: "At least one check is below 0 dB.",
      modeVerify: "Verify whether an existing link meets the equipment power budget.",
      modeDistance: "Estimate maximum fiber distance from equipment budget and fixed losses.",
      copied: "Copied", copyFailed: "Copy failed", saved: "Saved", csv: "CSV exported",
      recordSaved: "Record saved",
      fixFirst: "Fix inputs first",
      emptyHist: "No saved records yet. Calculate and click Save.",
      clearHist: "Clear all saved records?",
      tightestIs: "Tightest is ",
      tightestAt: " at ",
      tightestLbl: "Tightest margin · ",
      maxDistReason: "Estimated maximum reach is ",
      maxDistReasonTail: " km for the current fixed losses and margins.",
      maxDistLbl: "Estimated maximum distance",
      budgetUsed: "Budget used ",
      fiberLbl: "Fiber ",
      splittersLbl: "Splitters",
      connectorsLbl: "Connectors ",
      splicesLbl: "Splices ",
      eqnVerify: "= class {standard} − design {design} · remain {remain} · sens {sens} · overload {over}",
      eqnDistance: "= (class {standard} − margin {margin} − fixed {fixed}) / attenuation {atten} · entered distance {distance} km",
      eqnRx: "= Tx min {tx} − physical {physical}",
      eqnWindow: "= Tx min…max − physical (min {rx} · max {rxMax})",
      eqnPhysical: "fiber + splices + connectors + splitters + other",
      eqnDesign: "= physical {physical} + margin {margin} (penalty is taken off the budget)",
      eqnSens: "= Rx {rx} − sensitivity {sens}",
      eqnOver: "= overload {over} − (Tx max {txMax} − physical)",
      reportTitle: "NetEngineerLab — Optical Power Budget Calculator",
      reportMode: "Mode: ",
      reportModeVerify: "Link budget verification",
      reportModeDistance: "Maximum distance estimation",
      reportStatus: "Status: ",
      reportClass: "Class budget: ",
      reportPhysical: "Physical loss: ",
      reportDesign: "Design loss: ",
      reportRemain: "Remaining: ",
      reportRx: "Est. Rx: ",
      reportRxJoin: " to ",
      reportSens: "Sensitivity margin: ",
      reportOver: "Overload margin: ",
      reportMax: "Estimated maximum distance: ",
      reportWave: "Wavelength: ",
      csvField: "Field",
      csvValue: "Value",
      csvNames: ["Project", "Mode", "Minimum Tx Power dBm", "Maximum Tx Power dBm", "Receiver Sensitivity dBm", "Overload Threshold dBm", "Optical Path Penalty dB", "Engineering Margin dB", "Fiber Distance km", "Fiber Attenuation dB/km", "Wavelength nm", "Standard ODN Budget dB", "Physical Loss dB", "Design Loss dB", "Remaining Budget dB", "Estimated Minimum RX dBm", "Estimated Maximum RX dBm", "Sensitivity Margin dB", "Overload Margin dB", "Maximum Distance km", "Status"]
    },
    zh: {
      pass: "健康", marginal: "风险", fail: "超限", invalid: "无效",
      invalidInput: "输入无效",
      invalidMsg: "请检查输入：数量须为非负整数；距离与损耗须为有效非负数；衰减系数须大于 0；最大发送功率不得低于最小发送功率；过载门限须高于灵敏度。",
      cannotCompute: "无法计算",
      remainLbl: "相对等级预算剩余",
      sensLbl: "接收灵敏度余量",
      overLbl: "过载余量",
      allOk: "三项检查均 ≥ 3 dB。",
      warnReason: "至少一项检查在 0–3 dB 之间。",
      failReason: "至少一项检查低于 0 dB。",
      modeVerify: "验证现有链路是否满足设备光功率预算。",
      modeDistance: "根据设备预算和固定损耗反推最大光纤距离。",
      copied: "已复制", copyFailed: "复制失败", saved: "已保存", csv: "CSV 已导出",
      recordSaved: "记录已保存",
      fixFirst: "请先修正输入",
      emptyHist: "暂无记录。完成计算后点击“保存”。",
      clearHist: "确定清空全部记录吗？",
      tightestIs: "最紧项为",
      tightestAt: "，",
      tightestLbl: "最紧余量 · ",
      maxDistReason: "按当前固定损耗与余量，估算最大传输距离为 ",
      maxDistReasonTail: " km。",
      maxDistLbl: "估算最大距离",
      budgetUsed: "预算使用 ",
      fiberLbl: "光纤 ",
      splittersLbl: "分光器",
      connectorsLbl: "连接器 ",
      splicesLbl: "熔接 ",
      eqnVerify: "= 等级 {standard} − 设计 {design} · 剩余 {remain} · 灵敏度 {sens} · 过载 {over}",
      eqnDistance: "= (等级 {standard} − 余量 {margin} − 固定 {fixed}) / 衰减 {atten} · 输入距离 {distance} km",
      eqnRx: "= 最小发送 {tx} − 物理 {physical}",
      eqnWindow: "= 最小…最大发送 − 物理（最小 {rx} · 最大 {rxMax}）",
      eqnPhysical: "光纤 + 熔接 + 连接器 + 分光器 + 其他",
      eqnDesign: "= 物理 {physical} + 余量 {margin}（光学代价从预算中扣除）",
      eqnSens: "= 接收 {rx} − 灵敏度 {sens}",
      eqnOver: "= 过载 {over} −（最大发送 {txMax} − 物理）",
      reportTitle: "NetEngineerLab — 光功率预算计算器",
      reportMode: "模式：",
      reportModeVerify: "链路预算校核",
      reportModeDistance: "最大距离估算",
      reportStatus: "状态：",
      reportClass: "等级预算：",
      reportPhysical: "物理损耗：",
      reportDesign: "设计损耗：",
      reportRemain: "剩余：",
      reportRx: "估算接收：",
      reportRxJoin: " … ",
      reportSens: "灵敏度余量：",
      reportOver: "过载余量：",
      reportMax: "估算最大距离：",
      reportWave: "波长：",
      csvField: "字段",
      csvValue: "数值",
      csvNames: ["项目", "模式", "最小发送功率 dBm", "最大发送功率 dBm", "接收灵敏度 dBm", "过载门限 dBm", "光学代价 dB", "工程余量 dB", "光纤距离 km", "光纤衰减 dB/km", "波长 nm", "标准 ODN 预算 dB", "物理损耗 dB", "设计损耗 dB", "剩余预算 dB", "估算最小接收 dBm", "估算最大接收 dBm", "灵敏度余量 dB", "过载余量 dB", "最大距离 km", "状态"]
    },
    es: {
      pass: "Correcto", marginal: "Marginal", fail: "Fallo", invalid: "Inválido",
      invalidInput: "Entrada inválida",
      invalidMsg: "Revise las entradas: los recuentos deben ser enteros no negativos; distancia y pérdidas finitas y ≥ 0; atenuación > 0; Tx máx ≥ Tx mín; sobrecarga por encima de la sensibilidad.",
      cannotCompute: "No se puede calcular",
      remainLbl: "Restante frente al presupuesto de clase",
      sensLbl: "Margen de sensibilidad",
      overLbl: "Margen de sobrecarga",
      allOk: "Las tres comprobaciones son ≥ 3 dB.",
      warnReason: "Al menos una comprobación está entre 0 y 3 dB.",
      failReason: "Al menos una comprobación es inferior a 0 dB.",
      modeVerify: "Compruebe si el enlace cumple el presupuesto de potencia del equipo.",
      modeDistance: "Estime la distancia máxima de fibra a partir del presupuesto y las pérdidas fijas.",
      copied: "Copiado", copyFailed: "Error al copiar", saved: "Guardado", csv: "CSV exportado",
      recordSaved: "Registro guardado",
      fixFirst: "Corrija las entradas primero",
      emptyHist: "Aún no hay registros. Calcule y pulse Guardar.",
      clearHist: "¿Borrar todos los registros guardados?",
      tightestIs: "El más ajustado es ",
      tightestAt: " a ",
      tightestLbl: "Margen más ajustado · ",
      maxDistReason: "El alcance máximo estimado es ",
      maxDistReasonTail: " km con las pérdidas fijas y márgenes actuales.",
      maxDistLbl: "Distancia máxima estimada",
      budgetUsed: "Presupuesto usado ",
      fiberLbl: "Fibra ",
      splittersLbl: "Divisores",
      connectorsLbl: "Conectores ",
      splicesLbl: "Empalmes ",
      eqnVerify: "= clase {standard} − diseño {design} · restante {remain} · sens. {sens} · sobrecarga {over}",
      eqnDistance: "= (clase {standard} − margen {margin} − fijos {fixed}) / atenuación {atten} · distancia introducida {distance} km",
      eqnRx: "= Tx mín {tx} − física {physical}",
      eqnWindow: "= Tx mín…máx − física (mín {rx} · máx {rxMax})",
      eqnPhysical: "fibra + empalmes + conectores + divisores + otras",
      eqnDesign: "= física {physical} + margen {margin} (la penalización se resta del presupuesto)",
      eqnSens: "= Rx {rx} − sensibilidad {sens}",
      eqnOver: "= sobrecarga {over} − (Tx máx {txMax} − física)",
      reportTitle: "NetEngineerLab — Calculadora de presupuesto de potencia óptica",
      reportMode: "Modo: ",
      reportModeVerify: "Verificación del presupuesto del enlace",
      reportModeDistance: "Estimación de distancia máxima",
      reportStatus: "Estado: ",
      reportClass: "Presupuesto de clase: ",
      reportPhysical: "Pérdida física: ",
      reportDesign: "Pérdida de diseño: ",
      reportRemain: "Restante: ",
      reportRx: "Rx est.: ",
      reportRxJoin: " … ",
      reportSens: "Margen de sensibilidad: ",
      reportOver: "Margen de sobrecarga: ",
      reportMax: "Distancia máxima estimada: ",
      reportWave: "Longitud de onda: ",
      csvField: "Campo",
      csvValue: "Valor",
      csvNames: ["Proyecto", "Modo", "Potencia Tx mínima dBm", "Potencia Tx máxima dBm", "Sensibilidad del receptor dBm", "Umbral de sobrecarga dBm", "Penalización de trayecto dB", "Margen de ingeniería dB", "Distancia de fibra km", "Atenuación de fibra dB/km", "Longitud de onda nm", "Presupuesto ODN estándar dB", "Pérdida física dB", "Pérdida de diseño dB", "Presupuesto restante dB", "Rx mínima estimada dBm", "Rx máxima estimada dBm", "Margen de sensibilidad dB", "Margen de sobrecarga dB", "Distancia máxima km", "Estado"]
    }
  };
  const T = I18N[LOCALE] || I18N.en;

  if (!eng) {
    console.error("OPB engine missing");
    return;
  }

  const PRESETS = {
    custom: null,
    "gpon-c": { tx: 3, txMax: 7, sens: -30, over: -8, penalty: 1, margin: 3, wave: "1490", d: 10, a: 0.3, sc: 6, sl: 0.1, cc: 4, cl: 0.3, s1: 10.5, s2: 10.5, s3: 0, other: 0 },
    "gpon-b": { tx: 1.5, txMax: 5, sens: -27, over: -8, penalty: 0.5, margin: 3, wave: "1490", d: 10, a: 0.3, sc: 6, sl: 0.1, cc: 4, cl: 0.3, s1: 10.5, s2: 10.5, s3: 0, other: 0 },
    epon: { tx: 2, txMax: 7, sens: -27, over: -3, penalty: 0.5, margin: 3, wave: "1490", d: 10, a: 0.3, sc: 6, sl: 0.1, cc: 4, cl: 0.3, s1: 10.5, s2: 10.5, s3: 0, other: 0 },
    datacenter: { tx: -1, txMax: 0, sens: -7, over: 0, penalty: 0, margin: 1.5, wave: "1310", d: 0.5, a: 0.35, sc: 2, sl: 0.1, cc: 2, cl: 0.3, s1: 0, s2: 0, s3: 0, other: 0 }
  };

  const ATT = { "1310": 0.35, "1490": 0.3, "1550": 0.2, "1625": 0.25 };
  const DESC = {
    en: {
      custom: "Custom values — edit any field. Confirm against equipment datasheets before design sign-off.",
      "gpon-c": "GPON C+ reference: Tx min <b>+3 dBm</b>, sensitivity <b>−30 dBm</b>, overload <b>−8 dBm</b>, path penalty <b>1 dB</b>, class budget <b>32 dB</b>. Confirm against the datasheet.",
      "gpon-b": "GPON B+ reference: Tx min <b>+1.5 dBm</b>, sensitivity <b>−27 dBm</b>, overload <b>−8 dBm</b>, path penalty <b>0.5 dB</b>, class budget <b>28 dB</b>. Confirm against the datasheet.",
      epon: "EPON reference planning window. Confirm OLT/ONU datasheet before design sign-off.",
      datacenter: "Short-reach data-center style window (planning demo). Confirm transceiver datasheet."
    },
    zh: {
      custom: "自定义数值 — 可编辑任意字段。设计签发前请以设备规格书为准。",
      "gpon-c": "GPON C+ 参考：最小发送 <b>+3 dBm</b>，灵敏度 <b>−30 dBm</b>，过载 <b>−8 dBm</b>，光学代价 <b>1 dB</b>，等级预算 <b>32 dB</b>。请以设备规格书为准。",
      "gpon-b": "GPON B+ 参考：最小发送 <b>+1.5 dBm</b>，灵敏度 <b>−27 dBm</b>，过载 <b>−8 dBm</b>，光学代价 <b>0.5 dB</b>，等级预算 <b>28 dB</b>。请以设备规格书为准。",
      epon: "EPON 规划参考窗口。设计签发前请核对 OLT/ONU 规格书。",
      datacenter: "数据中心短距示意窗口（规划演示）。请以光模块规格书为准。"
    },
    es: {
      custom: "Valores personalizados: edite cualquier campo. Confirme con la hoja de datos antes de firmar el diseño.",
      "gpon-c": "Referencia GPON C+: Tx mín <b>+3 dBm</b>, sensibilidad <b>−30 dBm</b>, sobrecarga <b>−8 dBm</b>, penalización <b>1 dB</b>, presupuesto de clase <b>32 dB</b>. Confirme con la hoja de datos.",
      "gpon-b": "Referencia GPON B+: Tx mín <b>+1.5 dBm</b>, sensibilidad <b>−27 dBm</b>, sobrecarga <b>−8 dBm</b>, penalización <b>0.5 dB</b>, presupuesto de clase <b>28 dB</b>. Confirme con la hoja de datos.",
      epon: "Ventana de planificación EPON. Confirme la hoja de datos OLT/ONU antes de firmar el diseño.",
      datacenter: "Ventana de corto alcance tipo centro de datos (demo de planificación). Confirme la hoja del transceptor."
    }
  };
  const DESC_L = DESC[LOCALE] || DESC.en;
  function fill(template, map) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) => map[key]);
  }
  const MODE_HELP = {
    verify: T.modeVerify,
    distance: T.modeDistance
  };
  const HISTORY_KEY = "opticalBudgetHistory";

  const $ = (id) => document.getElementById(id);
  const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "—");
  let activePreset = "gpon-c";
  let activeMode = "verify";
  let applying = false;
  let shareTimer = null;
  let last = null;

  function num(id) {
    const el = $(id);
    if (!el) return NaN;
    return parseFloat(String(el.value).replace(/[−–]/g, "-").replace(/,/g, ""));
  }

  // Count fields: pass the raw parsed number to the engine.
  // Do NOT Math.trunc first — truncating hid decimals (e.g. 1.5 → 1) and
  // defeated Number.isSafeInteger checks in the engine and markFieldErrors.
  function count(id) {
    return num(id);
  }

  function readValues() {
    return {
      project: ($("projectName") && $("projectName").value.trim()) || "Untitled project",
      tx: num("txPower"),
      txMax: num("txMaxPower"),
      sens: num("rxSensitivity"),
      over: num("rxOverload"),
      penalty: num("opticalPenalty"),
      d: num("distance"),
      a: num("attenuation"),
      sc: count("spliceCount"),
      sl: num("spliceLoss"),
      cc: count("connectorCount"),
      cl: num("connectorLoss"),
      s1: num("splitter1"),
      s2: num("splitter2"),
      s3: num("splitter3"),
      other: num("otherLoss"),
      margin: num("engineeringMargin")
    };
  }

  function setExportEnabled(on) {
    document.querySelectorAll("[data-ro-act=\"copy\"], [data-ro-act=\"save\"], [data-ro-act=\"csv\"]").forEach((el) => {
      el.disabled = !on;
      el.setAttribute("aria-disabled", on ? "false" : "true");
    });
  }

  function setFields(p) {
    applying = true;
    if ($("projectName") && p.project != null) $("projectName").value = p.project;
    $("txPower").value = p.tx;
    $("txMaxPower").value = p.txMax;
    $("rxSensitivity").value = p.sens;
    $("rxOverload").value = p.over;
    $("opticalPenalty").value = p.penalty;
    $("engineeringMargin").value = p.margin;
    $("wavelength").value = p.wave;
    $("distance").value = p.d;
    $("attenuation").value = p.a;
    $("spliceCount").value = p.sc;
    $("spliceLoss").value = p.sl;
    $("connectorCount").value = p.cc;
    $("connectorLoss").value = p.cl;
    $("splitter1").value = String(p.s1);
    $("splitter2").value = String(p.s2);
    $("splitter3").value = String(p.s3);
    $("otherLoss").value = p.other;
    applying = false;
  }

  function setPresetUI(key) {
    activePreset = key;
    document.querySelectorAll("[data-preset]").forEach((el) => {
      const on = el.getAttribute("data-preset") === key;
      el.classList.toggle("on", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const desc = $("preset-desc");
    if (desc) desc.innerHTML = DESC_L[key] || DESC_L.custom;
  }

  function applyPreset(key) {
    const p = PRESETS[key];
    setPresetUI(key);
    if (p) setFields(p);
    calc();
  }

  function markCustomIfEdited() {
    if (applying) return;
    if (activePreset !== "custom") setPresetUI("custom");
  }

  function setMode(mode) {
    activeMode = mode === "distance" ? "distance" : "verify";
    document.querySelectorAll(".tabs [data-mode]").forEach((el) => {
      const on = el.getAttribute("data-mode") === activeMode;
      el.classList.toggle("on", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
    });
    const help = $("mode-help");
    if (help) help.textContent = MODE_HELP[activeMode];
    document.body.dataset.opbMode = activeMode;
    calc();
  }

  function statusMeta(st) {
    if (st === "healthy") return { cls: "st-pass", label: T.pass, icon: "✓" };
    if (st === "warning") return { cls: "st-marginal", label: T.marginal, icon: "!" };
    if (st === "failed") return { cls: "st-fail", label: T.fail, icon: "✕" };
    return { cls: "st-fail", label: T.invalidInput, icon: "?" };
  }

  function syncHealthBadge(stOrInvalid) {
    const badge = $("healthBadge");
    if (!badge) return;
    if (stOrInvalid === "invalid") {
      badge.className = "status st-fail";
      badge.innerHTML = '<span class="st-ico" aria-hidden="true">?</span> ' + T.invalidInput;
      return;
    }
    const meta = statusMeta(stOrInvalid);
    badge.className = "status " + meta.cls;
    badge.textContent = meta.label;
  }

  function invalidate() {
    last = null;
    setExportEnabled(false);
    syncHealthBadge("invalid");
    setText("remainingBudget", "—");
    setText("estimatedRx", "—");
    setText("physicalLoss", "—");
    const v = $("validation");
    if (v) {
      v.hidden = true;
      v.textContent = "";
    }
  }

  function tightest(remain, sensM, overM) {
    const rows = [
      { key: "remain", label: T.remainLbl, value: remain },
      { key: "sens", label: T.sensLbl, value: sensM },
      { key: "over", label: T.overLbl, value: overM }
    ];
    rows.sort((a, b) => a.value - b.value);
    return rows[0];
  }

  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
  }

  function setHTML(id, html) {
    const el = $(id);
    if (el) el.innerHTML = html;
  }

  function showInvalid(msg) {
    last = null;
    setExportEnabled(false);
    document.querySelectorAll("[data-status]").forEach((el) => {
      if (el.id === "healthBadge") return;
      el.className = "status st-fail";
      el.innerHTML = '<span class="st-ico" aria-hidden="true">?</span> ' + T.invalidInput;
    });
    syncHealthBadge("invalid");
    setHTML("ro-reason", "<b>" + T.invalidInput + ".</b> " + msg);
    setText("ro-main-lbl", T.cannotCompute);
    setHTML("ro-main-big", "—<small>dB</small>");
    $("ro-main-big") && ($("ro-main-big").style.color = "");
    setText("ro-main-eqn", "");
    if ($("ro-meter-bar")) $("ro-meter-bar").style.width = "0%";
    setText("ro-meter-left", "—");
    setText("ro-meter-right", "—");
    ["ro-rx", "physicalLoss", "ro-design", "ro-sensM", "ro-overM", "remainingBudget", "ro-ck-sens", "ro-ck-over"].forEach((id) => setText(id, "—"));
    setText("estimatedRx", "—");
    setText("mbar-val", "—");
    const box = $("validation");
    if (box) {
      box.hidden = false;
      box.textContent = msg || T.invalidMsg;
    }
  }

  function calc() {
    clearErrors();
    const v = readValues();
    const result = eng.calculate(v);
    if (!result.ok) {
      showInvalid(T.invalidMsg);
      markFieldErrors(v);
      return null;
    }
    const { standard, physical, design, remain, rx, sensM, overM, fiber, splice, conn, split, st, usage, maxD } = result;
    last = Object.assign({ wave: $("wavelength").value, mode: activeMode }, v, result);
    setExportEnabled(true);
    const meta = statusMeta(st);
    const tight = tightest(remain, sensM, overM);
    const tone =
      st === "healthy" ? "#059669" : st === "warning" ? "#B45309" : "#DC2626";

    document.querySelectorAll("[data-status]").forEach((el) => {
      el.className = "status " + meta.cls;
      el.innerHTML = '<span class="st-ico" aria-hidden="true">' + meta.icon + "</span> " + meta.label;
    });
    const vbox = $("validation");
    if (vbox) {
      vbox.hidden = true;
      vbox.textContent = "";
    }

    const reasonLead =
      st === "healthy"
        ? T.allOk
        : st === "warning"
          ? T.warnReason
          : T.failReason;

    if (activeMode === "distance") {
      setHTML(
        "ro-reason",
        "<b>" +
          reasonLead +
          "</b> " +
          T.maxDistReason +
          fmt(maxD) +
          T.maxDistReasonTail
      );
      setText("ro-main-lbl", T.maxDistLbl);
      setHTML("ro-main-big", fmt(maxD) + "<small>km</small>");
      $("ro-main-big").style.color = tone;
      setText(
        "ro-main-eqn",
        fill(T.eqnDistance, {
          standard: fmt(standard),
          margin: fmt(v.margin),
          fixed: fmt(result.fixed),
          atten: fmt(v.a),
          distance: fmt(v.d)
        })
      );
      setText("mbar-val", fmt(maxD) + " km");
    } else {
      setHTML(
        "ro-reason",
        "<b>" +
          reasonLead +
          "</b> " +
          T.tightestIs +
          tight.label +
          T.tightestAt +
          fmt(tight.value) +
          " dB."
      );
      setText("ro-main-lbl", T.tightestLbl + tight.label);
      setHTML("ro-main-big", fmt(tight.value) + "<small>dB</small>");
      $("ro-main-big").style.color = tone;
      setText(
        "ro-main-eqn",
        fill(T.eqnVerify, {
          standard: fmt(standard),
          design: fmt(design),
          remain: fmt(remain),
          sens: fmt(sensM),
          over: fmt(overM)
        })
      );
      setText("mbar-val", fmt(tight.value) + " dB");
    }

    const u = Math.max(0, Math.min(130, usage));
    $("ro-meter-bar").style.width = Math.min(100, u) + "%";
    setText("ro-meter-left", T.budgetUsed + Math.round(u) + "%");
    setText("ro-meter-right", fmt(design) + " / " + fmt(standard) + " dB");

    setHTML("ro-rx", fmt(rx) + "<small>dBm</small>");
    const rxMax = result.rxMax;
    setText("estimatedRx", fmt(rx) + " … " + fmt(rxMax));
    setText("ro-rx-window-eqn", fill(T.eqnWindow, { rx: fmt(rx), rxMax: fmt(rxMax) }));
    setHTML("physicalLoss", fmt(physical) + "<small>dB</small>");
    setHTML("ro-design", fmt(design) + "<small>dB</small>");
    setText("ro-rx-eqn", fill(T.eqnRx, { tx: fmt(v.tx), physical: fmt(physical) }));
    setText("ro-physical-eqn", T.eqnPhysical);
    setText("ro-design-eqn", fill(T.eqnDesign, { physical: fmt(physical), margin: fmt(v.margin) }));

    setHTML("ro-sensM", fmt(sensM) + "<small>dB</small>");
    setHTML("ro-overM", fmt(overM) + "<small>dB</small>");
    setText("ro-sensM-eqn", fill(T.eqnSens, { rx: fmt(rx), sens: fmt(v.sens) }));
    setText("ro-overM-eqn", fill(T.eqnOver, { over: fmt(v.over), txMax: fmt(v.txMax) }));

    setText("remainingBudget", fmt(remain));
    setText("ro-ck-sens", fmt(sensM) + " dB");
    setText("ro-ck-over", fmt(overM) + " dB");

    const maxPart = Math.max(fiber, splice, conn, split, 0.001);
    setBar("wf-fiber", fiber, maxPart, T.fiberLbl + fmt(v.d, 2) + " km × " + fmt(v.a));
    setBar("wf-split", split, maxPart, T.splittersLbl);
    setBar("wf-conn", conn, maxPart, T.connectorsLbl + v.cc + " × " + fmt(v.cl));
    setBar("wf-splice", splice, maxPart, T.splicesLbl + v.sc + " × " + fmt(v.sl));

    return result;
  }

  function setBar(prefix, value, maxPart, label) {
    const row = $(prefix);
    if (!row) return;
    const span = row.querySelector("span");
    const i = row.querySelector("i");
    const em = row.querySelector("em");
    if (span) span.textContent = label;
    if (i) i.style.width = Math.max(2, (value / maxPart) * 100) + "%";
    if (em) em.textContent = fmt(value) + " dB";
  }

  function clearErrors() {
    document.querySelectorAll(".f.has-error").forEach((el) => el.classList.remove("has-error"));
    const box = $("validation");
    if (box) {
      box.hidden = true;
      box.textContent = "";
    }
  }

  function markFieldErrors(v) {
    const box = $("validation");
    if (box) {
      box.hidden = false;
      box.textContent =
        "Invalid input: check non-negative losses, integer splice/connector counts, Tx max ≥ Tx min, and overload above sensitivity.";
    }
    const map = {
      "txPower": Number.isFinite(v.tx),
      "txMaxPower": Number.isFinite(v.txMax) && v.txMax >= v.tx,
      "rxSensitivity": Number.isFinite(v.sens),
      "rxOverload": Number.isFinite(v.over) && v.over > v.sens,
      "opticalPenalty": Number.isFinite(v.penalty) && v.penalty >= 0,
      "engineeringMargin": Number.isFinite(v.margin) && v.margin >= 0,
      "distance": Number.isFinite(v.d) && v.d >= 0,
      "attenuation": Number.isFinite(v.a) && v.a > 0,
      "spliceCount": Number.isSafeInteger(v.sc) && v.sc >= 0,
      "spliceLoss": Number.isFinite(v.sl) && v.sl >= 0,
      "connectorCount": Number.isSafeInteger(v.cc) && v.cc >= 0,
      "connectorLoss": Number.isFinite(v.cl) && v.cl >= 0,
      "splitter1": Number.isFinite(v.s1) && v.s1 >= 0,
      "splitter2": Number.isFinite(v.s2) && v.s2 >= 0,
      "splitter3": Number.isFinite(v.s3) && v.s3 >= 0,
      "otherLoss": Number.isFinite(v.other) && v.other >= 0
    };
    Object.keys(map).forEach((id) => {
      if (!map[id]) {
        const f = $(id) && $(id).closest(".f");
        if (f) f.classList.add("has-error");
      }
    });
  }

  function reset() {
    setMode("verify");
    applyPreset("gpon-c");
    flash($("resetBtn"), "Reset done");
  }

  function flash(el, msg) {
    if (!el) return;
    const prev = el.getAttribute("data-label") || el.textContent;
    if (!el.getAttribute("data-label")) el.setAttribute("data-label", prev);
    el.textContent = msg;
    clearTimeout(el.__flashT);
    el.__flashT = setTimeout(() => {
      el.textContent = el.getAttribute("data-label") || prev;
    }, 1400);
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }
    try {
      const a = document.createElement("textarea");
      a.value = text;
      a.setAttribute("readonly", "");
      a.style.position = "fixed";
      a.style.left = "-9999px";
      document.body.appendChild(a);
      a.select();
      const ok = document.execCommand("copy");
      a.remove();
      return ok;
    } catch (_) {
      return false;
    }
  }

  function buildReport() {
    if (!last) calc();
    if (!last) return null;
    const r = last;
    return [
      T.reportTitle,
      T.reportMode + (r.mode === "distance" ? T.reportModeDistance : T.reportModeVerify),
      T.reportStatus + statusMeta(r.st).label,
      T.reportClass + fmt(r.standard) + " dB",
      T.reportPhysical + fmt(r.physical) + " dB",
      T.reportDesign + fmt(r.design) + " dB",
      T.reportRemain + fmt(r.remain) + " dB",
      T.reportRx + fmt(r.rx) + T.reportRxJoin + fmt(r.rxMax) + " dBm",
      T.reportSens + fmt(r.sensM) + " dB",
      T.reportOver + fmt(r.overM) + " dB",
      T.reportMax + fmt(r.maxD) + " km",
      T.reportWave + r.wave + " nm"
    ].join("\n");
  }

  async function shareInputs() {
    const v = readValues();
    const q = new URLSearchParams({
      preview: "fieldbook-v3c",
      mode: activeMode,
      tx: v.tx,
      txMax: v.txMax,
      sens: v.sens,
      over: v.over,
      penalty: v.penalty,
      margin: v.margin,
      d: v.d,
      a: v.a,
      sc: v.sc,
      sl: v.sl,
      cc: v.cc,
      cl: v.cl,
      s1: v.s1,
      s2: v.s2,
      s3: v.s3,
      other: v.other,
      wave: $("wavelength").value
    });
    const url = location.pathname + "?" + q.toString() + "#result";
    const absolute = location.origin + url;
    const btn = $("btn-share");
    history.replaceState(null, "", url);
    const ok = await copyText(absolute);
    if (ok) flash(btn, "Link copied");
    else flash(btn, "URL updated — copy address bar");
  }

  
  function renderHistory() {
    const list = $("history-list");
    if (!list) return;
    const h = loadHistory();
    if (!h.length) {
      list.innerHTML = '<p class="history-hint">' + T.emptyHist + '</p>';
      return;
    }
    list.innerHTML = h
      .map((row, idx) => {
        const when = row.savedAt ? new Date(row.savedAt).toLocaleString() : "";
        const title = (row.project || "Untitled").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
        const st = statusMeta(row.st || "pass").label;
        return (
          '<button type="button" class="history-item" data-history-idx="' +
          idx +
          '" role="listitem">' +
          "<div><b>" +
          title +
          "</b><span>" +
          st +
          " · remain " +
          fmt(row.remain) +
          " dB · Rx " +
          fmt(row.rx) +
          " dBm</span></div>" +
          '<div class="history-meta">' +
          when +
          "</div></button>"
        );
      })
      .join("");
  }

  function restoreHistory(idx) {
    const h = loadHistory();
    const row = h[idx];
    if (!row) return;
    setFields({
      project: row.project || "Untitled project",
      tx: row.tx,
      txMax: row.txMax,
      sens: row.sens,
      over: row.over,
      penalty: row.penalty,
      margin: row.margin,
      wave: row.wave || "1490",
      d: row.d,
      a: row.a,
      sc: row.sc,
      sl: row.sl,
      cc: row.cc,
      cl: row.cl,
      s1: row.s1,
      s2: row.s2,
      s3: row.s3,
      other: row.other
    });
    setPresetUI("custom");
    calc();
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveRecord(btn) {
    if (!last) calc();
    if (!last) {
      flash(btn, T.fixFirst);
      return;
    }
    const v = readValues();
    const row = Object.assign({}, last, { project: v.project, savedAt: new Date().toISOString() });
    const h = loadHistory();
    h.unshift(row);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 12)));
    renderHistory();
    flash(btn, T.recordSaved);
  }

  function exportCsv(btn) {
    if (!last) calc();
    if (!last) {
      flash(btn, T.fixFirst);
      return;
    }
    const r = last;
    const values = [
      r.project || (($("projectName") && $("projectName").value) || ""),
      r.mode,
      r.tx,
      r.txMax,
      r.sens,
      r.over,
      r.penalty,
      r.margin,
      r.d,
      r.a,
      r.wave,
      Number(r.standard).toFixed(2),
      Number(r.physical).toFixed(2),
      Number(r.design).toFixed(2),
      Number(r.remain).toFixed(2),
      Number(r.rx).toFixed(2),
      Number(r.rxMax).toFixed(2),
      Number(r.sensM).toFixed(2),
      Number(r.overM).toFixed(2),
      Number(r.maxD).toFixed(2),
      statusMeta(r.st).label
    ];
    const rows = [[T.csvField, T.csvValue]].concat(T.csvNames.map((name, i) => [name, values[i]]));
    const text =
      "\uFEFF" +
      rows
        .map((row) => row.map((x) => '"' + String(x).replaceAll('"', '""') + '"').join(","))
        .join("\n");
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "optical_power_budget_report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    flash(btn, T.csv);
  }

  async function copyResult(btn) {
    const t = buildReport();
    if (!t) {
      flash(btn, T.fixFirst);
      return;
    }
    const ok = await copyText(t);
    flash(btn, ok ? T.copied : T.copyFailed);
  }

  function loadFromQuery() {
    const q = new URLSearchParams(location.search);
    if (![...q.keys()].length) return false;
    const pick = (k, id) => {
      if (q.has(k) && $(id)) $(id).value = q.get(k);
    };
    applying = true;
    pick("tx", "txPower");
    pick("txMax", "txMaxPower");
    pick("sens", "rxSensitivity");
    pick("over", "rxOverload");
    pick("penalty", "opticalPenalty");
    pick("margin", "engineeringMargin");
    pick("d", "distance");
    pick("a", "attenuation");
    pick("sc", "spliceCount");
    pick("sl", "spliceLoss");
    pick("cc", "connectorCount");
    pick("cl", "connectorLoss");
    pick("s1", "splitter1");
    pick("s2", "splitter2");
    pick("s3", "splitter3");
    pick("other", "otherLoss");
    pick("wave", "wavelength");
    applying = false;
    setPresetUI("custom");
    if (q.get("mode") === "distance") {
      activeMode = "distance";
      document.querySelectorAll(".tabs [data-mode]").forEach((el) => {
        const on = el.getAttribute("data-mode") === "distance";
        el.classList.toggle("on", on);
        el.setAttribute("aria-selected", on ? "true" : "false");
      });
      const help = $("mode-help");
      if (help) help.textContent = MODE_HELP.distance;
      document.body.dataset.opbMode = "distance";
    }
    return true;
  }

  function onWaveChange() {
    const w = $("wavelength").value;
    if (ATT[w] != null) $("attenuation").value = ATT[w];
    markCustomIfEdited();
    calc();
  }

  function bind() {
    document.querySelectorAll("[data-preset]").forEach((el) => {
      el.addEventListener("click", () => applyPreset(el.getAttribute("data-preset")));
      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          applyPreset(el.getAttribute("data-preset"));
        }
      });
    });

    document.querySelectorAll(".tabs [data-mode]").forEach((el) => {
      el.addEventListener("click", () => setMode(el.getAttribute("data-mode")));
    });

    const ids = [
      "txPower", "txMaxPower", "rxSensitivity", "rxOverload", "opticalPenalty", "engineeringMargin",
      "distance", "attenuation", "spliceCount", "spliceLoss", "connectorCount", "connectorLoss", "splitter1", "splitter2", "splitter3", "otherLoss"
    ];
    ids.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => {
        markCustomIfEdited();
        invalidate();
        clearTimeout(window.__opbT);
        window.__opbT = setTimeout(calc, 150);
      });
      el.addEventListener("change", () => {
        markCustomIfEdited();
        calc();
      });
    });
    $("wavelength").addEventListener("change", onWaveChange);
    const proj = $("projectName");
    if (proj) {
      proj.addEventListener("input", () => {
        invalidate();
        clearTimeout(window.__opbT);
        window.__opbT = setTimeout(calc, 150);
      });
    }

    $("calculateBtn").addEventListener("click", calc);
    $("resetBtn").addEventListener("click", reset);
    $("btn-share").addEventListener("click", shareInputs);

    const clearH = $("btn-clear-history");
    if (clearH) clearH.addEventListener("click", () => {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
    });
    const histList = $("history-list");
    if (histList) histList.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-history-idx]");
      if (!btn) return;
      restoreHistory(Number(btn.getAttribute("data-history-idx")));
    });
    renderHistory();

    document.querySelectorAll("[data-ro-act]").forEach((el) => {
      el.addEventListener("click", () => {
        const act = el.getAttribute("data-ro-act");
        if (act === "copy") copyResult(el);
        else if (act === "save") saveRecord(el);
        else if (act === "csv") exportCsv(el);
        else if (act === "print") window.print();
      });
    });

    if (!loadFromQuery()) applyPreset("gpon-c");
    else calc();

    syncExplainFolds();
    bindExplainAnchors();

    bindTocScrollSpy();
    foldWorkflowExtras();
    if (window.matchMedia) {
      const mq = window.matchMedia("(min-width: 769px)");
      const onChange = () => syncExplainFolds();
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }


  function openExplainTarget(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    if (el.matches("details.fb-fold")) {
      el.open = true;
      el.dataset.userToggled = "1";
    }
    const details = el.closest && el.closest("details.fb-fold");
    if (details) {
      details.open = true;
      details.dataset.userToggled = "1";
    }
    // Hash navigation: open fold then scroll (Gate3 #component-check)
    const target = details || el;
    requestAnimationFrame(() => {
      try {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (_) {
        target.scrollIntoView(true);
      }
    });
  }



  function foldWorkflowExtras() {
    const graph = document.getElementById("nel-tool-graph");
    if (!graph || graph.querySelector("details.nel-wf-fold")) return;
    const sub = graph.querySelector("h3.nel-tool-graph-subtitle");
    const related = graph.querySelector(".nel-tool-graph-related");
    const mem = graph.querySelector(".nel-workflow-memberships");
    if (!sub || !related) return;
    const details = document.createElement("details");
    details.className = "nel-wf-fold";
    const sum = document.createElement("summary");
    sum.textContent =
      LOCALE === "zh" ? "展开完整流程" : LOCALE === "es" ? "Mostrar flujo completo" : "Show full workflow";
    const wrap = document.createElement("div");
    wrap.className = "nel-wf-extra";
    const parent = sub.parentNode;
    wrap.appendChild(sub);
    wrap.appendChild(related);
    if (mem) wrap.appendChild(mem);
    details.appendChild(sum);
    details.appendChild(wrap);
    parent.appendChild(details);
  }

  function bindTocScrollSpy() {
    const toc = document.querySelector("nav.toc");
    if (!toc) return;
    const links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;
    const items = links.map(function (a) {
      const href = a.getAttribute("href") || "";
      if (!/^#[A-Za-z][\w:-]*$/.test(href)) return null;
      const id = href.slice(1);
      const el = document.getElementById(id);
      return el ? { id: id, el: el, a: a } : null;
    }).filter(Boolean);
    if (!items.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        const on = (a.getAttribute("href") || "") === "#" + id;
        a.classList.toggle("on", on);
        if (on) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    }

    function currentId() {
      // Match sticky header + TOC top offset (~90–110px)
      const probe = window.scrollY + 120;
      let active = items[0].id;
      for (let i = 0; i < items.length; i++) {
        const top = items[i].el.getBoundingClientRect().top + window.scrollY;
        if (top <= probe + 1) active = items[i].id;
      }
      // Near page bottom: force last section
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 8) {
        active = items[items.length - 1].id;
      }
      return active;
    }

    let ticking = false;
    function update() {
      ticking = false;
      setActive(currentId());
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    links.forEach(function (a) {
      a.addEventListener("click", function () {
        const href = a.getAttribute("href") || "";
        if (href.charAt(0) === "#") setActive(href.slice(1));
      });
    });
    // Initial + after fold open/layout
    update();
    setTimeout(update, 100);
    setTimeout(update, 400);
  }

  function bindExplainAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      if (a.dataset.explainBound) return;
      const href = a.getAttribute("href") || "";
      if (!/^#[A-Za-z][\w:-]*$/.test(href)) return;
      a.dataset.explainBound = "1";
      a.addEventListener("click", () => {
        setTimeout(() => openExplainTarget(href.slice(1)), 0);
      });
    });
    if (location.hash && /^#[A-Za-z][\w:-]*$/.test(location.hash)) {
      // Delay so layout/CSS (incl. mobile collapsed folds) settle
      setTimeout(() => openExplainTarget(location.hash.slice(1)), 50);
    }
    window.addEventListener("hashchange", () => {
      if (location.hash) openExplainTarget(location.hash.slice(1));
    });
  }

  function syncExplainFolds() {
    const desktop = window.matchMedia ? window.matchMedia("(min-width: 769px)").matches : true;
    document.querySelectorAll("details.fb-fold").forEach((el) => {
      el.classList.toggle("fb-desktop-open", desktop);
      if (desktop) {
        el.open = true;
      } else if (el.dataset.userToggled !== "1") {
        el.open = false;
      }
      if (el.dataset.foldBound) return;
      el.dataset.foldBound = "1";
      el.addEventListener("toggle", () => {
        const isDesktop = window.matchMedia ? window.matchMedia("(min-width: 769px)").matches : true;
        if (!isDesktop) el.dataset.userToggled = "1";
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
