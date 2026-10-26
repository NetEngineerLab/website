/* Fieldbook OPB v3c preview UI — binds form to opb-engine-copy.js. Preview only. */
(function () {
  "use strict";
  const eng = window.NELOpticalPowerBudgetEngine;
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
    custom: "Custom values — edit any field. Confirm against equipment datasheets before design sign-off.",
    "gpon-c": "GPON C+ reference: Tx min <b>+3 dBm</b>, sensitivity <b>−30 dBm</b>, overload <b>−8 dBm</b>, path penalty <b>1 dB</b>, class budget <b>32 dB</b>. Confirm against the datasheet.",
    "gpon-b": "GPON B+ reference: Tx min <b>+1.5 dBm</b>, sensitivity <b>−27 dBm</b>, overload <b>−8 dBm</b>, path penalty <b>0.5 dB</b>, class budget <b>28 dB</b>. Confirm against the datasheet.",
    epon: "EPON reference planning window. Confirm OLT/ONU datasheet before design sign-off.",
    datacenter: "Short-reach data-center style window (planning demo). Confirm transceiver datasheet."
  };
  const MODE_HELP = {
    verify: "Verify whether an existing link meets the equipment power budget.",
    distance: "Estimate maximum fiber distance from equipment budget and fixed losses."
  };
  const HISTORY_KEY = "nel-fieldbook-opb-v3c-history";

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

  function int(id) {
    const v = num(id);
    return Number.isFinite(v) ? Math.trunc(v) : NaN;
  }

  function readValues() {
    return {
      tx: num("f-tx"),
      txMax: num("f-txMax"),
      sens: num("f-sens"),
      over: num("f-over"),
      penalty: num("f-penalty"),
      d: num("f-d"),
      a: num("f-a"),
      sc: int("f-sc"),
      sl: num("f-sl"),
      cc: int("f-cc"),
      cl: num("f-cl"),
      s1: num("f-s1"),
      s2: num("f-s2"),
      s3: num("f-s3"),
      other: num("f-other"),
      margin: num("f-margin")
    };
  }

  function setFields(p) {
    applying = true;
    $("f-tx").value = p.tx;
    $("f-txMax").value = p.txMax;
    $("f-sens").value = p.sens;
    $("f-over").value = p.over;
    $("f-penalty").value = p.penalty;
    $("f-margin").value = p.margin;
    $("f-wave").value = p.wave;
    $("f-d").value = p.d;
    $("f-a").value = p.a;
    $("f-sc").value = p.sc;
    $("f-sl").value = p.sl;
    $("f-cc").value = p.cc;
    $("f-cl").value = p.cl;
    $("f-s1").value = String(p.s1);
    $("f-s2").value = String(p.s2);
    $("f-s3").value = String(p.s3);
    $("f-other").value = p.other;
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
    if (desc) desc.innerHTML = DESC[key] || DESC.custom;
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
    if (st === "healthy") return { cls: "st-pass", label: "Pass", icon: "✓" };
    if (st === "warning") return { cls: "st-marginal", label: "Marginal", icon: "!" };
    if (st === "failed") return { cls: "st-fail", label: "Fail", icon: "✕" };
    return { cls: "st-fail", label: "Invalid", icon: "?" };
  }

  function tightest(remain, sensM, overM) {
    const rows = [
      { key: "remain", label: "Remaining vs class budget", value: remain },
      { key: "sens", label: "Receiver sensitivity margin", value: sensM },
      { key: "over", label: "Overload margin", value: overM }
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
    const meta = statusMeta("failed");
    document.querySelectorAll("[data-status]").forEach((el) => {
      el.className = "status " + meta.cls;
      el.textContent = meta.label;
    });
    setHTML("ro-reason", "<b>Check inputs.</b> " + msg);
    setText("ro-main-lbl", "Cannot compute");
    setHTML("ro-main-big", "—<small>dB</small>");
    setText("ro-main-eqn", "");
    if ($("ro-meter-bar")) $("ro-meter-bar").style.width = "0%";
    setText("ro-meter-left", "—");
    setText("ro-meter-right", "—");
    ["ro-rx", "ro-physical", "ro-design", "ro-sensM", "ro-overM", "ro-ck-remain", "ro-ck-sens", "ro-ck-over"].forEach((id) => setText(id, "—"));
    setText("mbar-val", "—");
  }

  function calc() {
    clearErrors();
    const v = readValues();
    const result = eng.calculate(v);
    if (!result.ok) {
      showInvalid("Counts must be non-negative integers; losses/distance finite and ≥ 0; attenuation > 0; Tx max ≥ Tx min; overload above sensitivity.");
      markFieldErrors(v);
      return null;
    }
    const { standard, physical, design, remain, rx, sensM, overM, fiber, splice, conn, split, st, usage, maxD } = result;
    last = Object.assign({ wave: $("f-wave").value, mode: activeMode }, v, result);
    const meta = statusMeta(st);
    const tight = tightest(remain, sensM, overM);
    const tone =
      st === "healthy" ? "#059669" : st === "warning" ? "#B45309" : "#DC2626";

    document.querySelectorAll("[data-status]").forEach((el) => {
      el.className = "status " + meta.cls;
      el.innerHTML = '<span class="st-ico" aria-hidden="true">' + meta.icon + "</span> " + meta.label;
    });

    const reasonLead =
      st === "healthy"
        ? "All three checks ≥ 3 dB."
        : st === "warning"
          ? "At least one check is between 0 and 3 dB."
          : "At least one check is below 0 dB.";

    if (activeMode === "distance") {
      setHTML(
        "ro-reason",
        "<b>" +
          reasonLead +
          "</b> Estimated maximum reach is " +
          fmt(maxD) +
          " km for the current fixed losses and margins."
      );
      setText("ro-main-lbl", "Estimated maximum distance");
      setHTML("ro-main-big", fmt(maxD) + "<small>km</small>");
      $("ro-main-big").style.color = tone;
      setText(
        "ro-main-eqn",
        "= (class " +
          fmt(standard) +
          " − margin " +
          fmt(v.margin) +
          " − fixed " +
          fmt(result.fixed) +
          ") / attenuation " +
          fmt(v.a) +
          " · entered distance " +
          fmt(v.d) +
          " km"
      );
      setText("mbar-val", fmt(maxD) + " km");
    } else {
      setHTML(
        "ro-reason",
        "<b>" +
          reasonLead +
          "</b> Tightest is " +
          tight.label.toLowerCase() +
          " at " +
          fmt(tight.value) +
          " dB."
      );
      setText("ro-main-lbl", "Tightest margin · " + tight.label);
      setHTML("ro-main-big", fmt(tight.value) + "<small>dB</small>");
      $("ro-main-big").style.color = tone;
      setText(
        "ro-main-eqn",
        "= class " +
          fmt(standard) +
          " − design " +
          fmt(design) +
          " · remain " +
          fmt(remain) +
          " · sens " +
          fmt(sensM) +
          " · overload " +
          fmt(overM)
      );
      setText("mbar-val", fmt(tight.value) + " dB");
    }

    const u = Math.max(0, Math.min(130, usage));
    $("ro-meter-bar").style.width = Math.min(100, u) + "%";
    setText("ro-meter-left", "Budget used " + Math.round(u) + "%");
    setText("ro-meter-right", fmt(design) + " / " + fmt(standard) + " dB");

    setHTML("ro-rx", fmt(rx) + "<small>dBm</small>");
    setHTML("ro-physical", fmt(physical) + "<small>dB</small>");
    setHTML("ro-design", fmt(design) + "<small>dB</small>");
    setText("ro-rx-eqn", "= Tx min " + fmt(v.tx) + " − physical " + fmt(physical));
    setText("ro-physical-eqn", "fiber + splices + connectors + splitters + other");
    setText(
      "ro-design-eqn",
      "= physical " + fmt(physical) + " + margin " + fmt(v.margin) + " (penalty is taken off the budget)"
    );

    setHTML("ro-sensM", fmt(sensM) + "<small>dB</small>");
    setHTML("ro-overM", fmt(overM) + "<small>dB</small>");
    setText("ro-sensM-eqn", "= Rx " + fmt(rx) + " − sensitivity " + fmt(v.sens));
    setText(
      "ro-overM-eqn",
      "= overload " + fmt(v.over) + " − (Tx max " + fmt(v.txMax) + " − physical)"
    );

    setText("ro-ck-remain", fmt(remain) + " dB");
    setText("ro-ck-sens", fmt(sensM) + " dB");
    setText("ro-ck-over", fmt(overM) + " dB");

    const maxPart = Math.max(fiber, splice, conn, split, 0.001);
    setBar("wf-fiber", fiber, maxPart, "Fiber " + fmt(v.d, 2) + " km × " + fmt(v.a));
    setBar("wf-split", split, maxPart, "Splitters");
    setBar("wf-conn", conn, maxPart, "Connectors " + v.cc + " × " + fmt(v.cl));
    setBar("wf-splice", splice, maxPart, "Splices " + v.sc + " × " + fmt(v.sl));

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
    const box = $("form-error");
    if (box) {
      box.hidden = true;
      box.textContent = "";
    }
  }

  function markFieldErrors(v) {
    const box = $("form-error");
    if (box) {
      box.hidden = false;
      box.textContent =
        "Invalid input: check non-negative losses, integer splice/connector counts, Tx max ≥ Tx min, and overload above sensitivity.";
    }
    const map = {
      "f-tx": Number.isFinite(v.tx),
      "f-txMax": Number.isFinite(v.txMax) && v.txMax >= v.tx,
      "f-sens": Number.isFinite(v.sens),
      "f-over": Number.isFinite(v.over) && v.over > v.sens,
      "f-penalty": Number.isFinite(v.penalty) && v.penalty >= 0,
      "f-margin": Number.isFinite(v.margin) && v.margin >= 0,
      "f-d": Number.isFinite(v.d) && v.d >= 0,
      "f-a": Number.isFinite(v.a) && v.a > 0,
      "f-sc": Number.isSafeInteger(v.sc) && v.sc >= 0,
      "f-sl": Number.isFinite(v.sl) && v.sl >= 0,
      "f-cc": Number.isSafeInteger(v.cc) && v.cc >= 0,
      "f-cl": Number.isFinite(v.cl) && v.cl >= 0,
      "f-s1": Number.isFinite(v.s1) && v.s1 >= 0,
      "f-s2": Number.isFinite(v.s2) && v.s2 >= 0,
      "f-s3": Number.isFinite(v.s3) && v.s3 >= 0,
      "f-other": Number.isFinite(v.other) && v.other >= 0
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
    flash($("btn-reset"), "Reset done");
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
      "NetEngineerLab — Optical Power Budget Calculator",
      "Mode: " + (r.mode === "distance" ? "Maximum distance estimation" : "Link budget verification"),
      "Status: " + statusMeta(r.st).label,
      "Class budget: " + fmt(r.standard) + " dB",
      "Physical loss: " + fmt(r.physical) + " dB",
      "Design loss: " + fmt(r.design) + " dB",
      "Remaining: " + fmt(r.remain) + " dB",
      "Est. Rx: " + fmt(r.rx) + " to " + fmt(r.rxMax) + " dBm",
      "Sensitivity margin: " + fmt(r.sensM) + " dB",
      "Overload margin: " + fmt(r.overM) + " dB",
      "Estimated maximum distance: " + fmt(r.maxD) + " km",
      "Wavelength: " + r.wave + " nm"
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
      wave: $("f-wave").value
    });
    const url = location.pathname + "?" + q.toString() + "#result";
    const absolute = location.origin + url;
    const btn = $("btn-share");
    history.replaceState(null, "", url);
    const ok = await copyText(absolute);
    if (ok) flash(btn, "Link copied");
    else flash(btn, "URL updated — copy address bar");
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
      flash(btn, "Fix inputs first");
      return;
    }
    const row = Object.assign({}, last, { savedAt: new Date().toISOString() });
    const h = loadHistory();
    h.unshift(row);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 12)));
    flash(btn, "Record saved");
  }

  function exportCsv(btn) {
    if (!last) calc();
    if (!last) {
      flash(btn, "Fix inputs first");
      return;
    }
    const r = last;
    const rows = [
      ["Field", "Value"],
      ["Mode", r.mode],
      ["Minimum Tx Power dBm", r.tx],
      ["Maximum Tx Power dBm", r.txMax],
      ["Receiver Sensitivity dBm", r.sens],
      ["Overload Threshold dBm", r.over],
      ["Optical Path Penalty dB", r.penalty],
      ["Engineering Margin dB", r.margin],
      ["Fiber Distance km", r.d],
      ["Fiber Attenuation dB/km", r.a],
      ["Wavelength nm", r.wave],
      ["Standard ODN Budget dB", Number(r.standard).toFixed(2)],
      ["Physical Loss dB", Number(r.physical).toFixed(2)],
      ["Design Loss dB", Number(r.design).toFixed(2)],
      ["Remaining Budget dB", Number(r.remain).toFixed(2)],
      ["Estimated Minimum RX dBm", Number(r.rx).toFixed(2)],
      ["Estimated Maximum RX dBm", Number(r.rxMax).toFixed(2)],
      ["Sensitivity Margin dB", Number(r.sensM).toFixed(2)],
      ["Overload Margin dB", Number(r.overM).toFixed(2)],
      ["Maximum Distance km", Number(r.maxD).toFixed(2)],
      ["Status", statusMeta(r.st).label]
    ];
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
    flash(btn, "CSV exported");
  }

  async function copyResult(btn) {
    const t = buildReport();
    if (!t) {
      flash(btn, "Fix inputs first");
      return;
    }
    const ok = await copyText(t);
    flash(btn, ok ? "Copied" : "Copy failed");
  }

  function loadFromQuery() {
    const q = new URLSearchParams(location.search);
    if (![...q.keys()].length) return false;
    const pick = (k, id) => {
      if (q.has(k) && $(id)) $(id).value = q.get(k);
    };
    applying = true;
    pick("tx", "f-tx");
    pick("txMax", "f-txMax");
    pick("sens", "f-sens");
    pick("over", "f-over");
    pick("penalty", "f-penalty");
    pick("margin", "f-margin");
    pick("d", "f-d");
    pick("a", "f-a");
    pick("sc", "f-sc");
    pick("sl", "f-sl");
    pick("cc", "f-cc");
    pick("cl", "f-cl");
    pick("s1", "f-s1");
    pick("s2", "f-s2");
    pick("s3", "f-s3");
    pick("other", "f-other");
    pick("wave", "f-wave");
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
    const w = $("f-wave").value;
    if (ATT[w] != null) $("f-a").value = ATT[w];
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
      "f-tx", "f-txMax", "f-sens", "f-over", "f-penalty", "f-margin",
      "f-d", "f-a", "f-sc", "f-sl", "f-cc", "f-cl", "f-s1", "f-s2", "f-s3", "f-other"
    ];
    ids.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => {
        markCustomIfEdited();
        clearTimeout(window.__opbT);
        window.__opbT = setTimeout(calc, 120);
      });
      el.addEventListener("change", () => {
        markCustomIfEdited();
        calc();
      });
    });
    $("f-wave").addEventListener("change", onWaveChange);

    $("btn-calc").addEventListener("click", calc);
    $("btn-reset").addEventListener("click", reset);
    $("btn-share").addEventListener("click", shareInputs);

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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
