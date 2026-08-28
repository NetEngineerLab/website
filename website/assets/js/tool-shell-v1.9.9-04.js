(function () {
  "use strict";

  const path = location.pathname.replace(/\/+$/, "");
  const parts = path.split("/").filter(Boolean);
  const toolIndex = parts.indexOf("tools");
  const slug = toolIndex >= 0 ? parts[toolIndex + 1] : "";
  const zh = document.documentElement.lang.toLowerCase().startsWith("zh");
  const enhancedTools = new Set([
    "wireless-link-budget-calculator",
    "poe-voltage-drop-calculator",
    "network-rack-power-cooling-calculator",
    "poe-power-budget-calculator",
    "sfp-qsfp-compatibility-calculator",
    "vlan-ip-capacity-planner",
    "switch-uplink-oversubscription-calculator",
    "dns-ttl-propagation-calculator"
  ]);

  const text = zh
    ? {
        skip: "跳到计算器",
        start: "开始计算",
        reset: "重置参数",
        save: "保存记录",
        export: "导出 CSV",
        print: "打印 / PDF",
        history: "计算记录",
        clear: "清空记录",
        empty: "暂无保存记录",
        saved: "结果已保存",
        exported: "CSV 已导出",
        footer: "面向通信与网络工程师的专业在线工具平台。"
      }
    : {
        skip: "Skip to calculator",
        start: "Start calculating",
        reset: "Reset inputs",
        save: "Save result",
        export: "Export CSV",
        print: "Print / PDF",
        history: "Calculation history",
        clear: "Clear history",
        empty: "No saved results",
        saved: "Result saved",
        exported: "CSV exported",
        footer: "Professional online tools for telecom and network engineers."
      };

  function button(label, action, className) {
    const el = document.createElement("button");
    el.type = "button";
    el.textContent = label;
    el.dataset.nelAction = action;
    if (className) el.className = className;
    return el;
  }

  function visible(element) {
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function labelFor(control) {
    if (control.id) {
      const explicit = document.querySelector(`label[for="${CSS.escape(control.id)}"]`);
      if (explicit) return explicit.textContent.trim();
    }
    const field = control.closest(".field, .form-group, .control-group");
    const label = field && field.querySelector("label");
    return label ? label.textContent.trim() : control.name || control.id || "Input";
  }

  function inputRows() {
    return [...document.querySelectorAll("main input, main select, main textarea")]
      .filter((control) => visible(control) && control.type !== "file")
      .map((control) => [labelFor(control), control.type === "checkbox" ? String(control.checked) : control.value]);
  }

  function resultRows() {
    const rows = [];
    document.querySelectorAll(".metric, .result-item, .result-row").forEach((item) => {
      if (!visible(item)) return;
      const label = item.querySelector("small, .label, dt")?.textContent.trim();
      const value = item.querySelector("strong, .value, dd")?.textContent.trim();
      if (label && value && value !== "—") rows.push([label, value]);
    });
    if (!rows.length && window.lastResult && typeof window.lastResult === "object") {
      Object.entries(window.lastResult).forEach(([key, value]) => {
        if (["ok", "warnings", "error"].includes(key)) return;
        if (["string", "number", "boolean"].includes(typeof value)) rows.push([key, String(value)]);
      });
    }
    return rows;
  }

  function clearStaleResult() {
    const error = document.querySelector(".error:not([hidden]), [id='error']:not([hidden])");
    if (!error || !visible(error)) return;
    window.lastResult = null;
    document.querySelectorAll(".metric, .result-item, .result-row").forEach((item) => {
      const value = item.querySelector("span[id], .value, dd, output");
      if (value) value.textContent = "—";
      else {
        const strong = item.querySelector("strong");
        if (strong && !strong.querySelector("[id]")) strong.textContent = "—";
      }
    });
    const status = document.querySelector("#status, .badge");
    if (status) {
      status.textContent = "—";
      status.classList.remove("pass", "warning", "fail", "excellent", "good", "marginal");
    }
    const headline = document.querySelector("#headline");
    if (headline) headline.textContent = "—";
    const warnings = document.querySelector("#warnings");
    if (warnings) warnings.replaceChildren();
  }

  function snapshot() {
    return {
      time: new Date().toISOString(),
      title: document.querySelector("h1")?.textContent.trim() || document.title,
      inputs: inputRows(),
      results: resultRows()
    };
  }

  function csvCell(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const data = snapshot();
    const rows = [
      ["NetEngineerLab", data.title],
      [zh ? "导出时间" : "Exported at", data.time],
      [],
      [zh ? "输入参数" : "Inputs", zh ? "数值" : "Value"],
      ...data.inputs,
      [],
      [zh ? "计算结果" : "Results", zh ? "数值" : "Value"],
      ...data.results
    ];
    const csv = "\ufeff" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug || "netengineerlab"}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(text.exported);
  }

  const historyKey = `nel:tool-history:${slug}:${zh ? "zh" : "en"}`;

  function readHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(historyKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function writeHistory(entries) {
    try {
      localStorage.setItem(historyKey, JSON.stringify(entries.slice(0, 10)));
    } catch (_) {
      /* Storage can be unavailable in private browsing. */
    }
  }

  let historyList;
  let historySummary;

  function renderHistory() {
    if (!historyList || !historySummary) return;
    const entries = readHistory();
    historySummary.textContent = `${text.history} (${entries.length})`;
    historyList.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.textContent = text.empty;
      historyList.appendChild(empty);
      return;
    }
    entries.forEach((entry) => {
      const article = document.createElement("article");
      const time = document.createElement("time");
      time.dateTime = entry.time;
      time.textContent = new Date(entry.time).toLocaleString(zh ? "zh-CN" : "en-US");
      const value = document.createElement("p");
      value.textContent = (entry.results || []).slice(0, 4).map((row) => `${row[0]}: ${row[1]}`).join(" · ");
      article.append(time, value);
      historyList.appendChild(article);
    });
  }

  let announcer;
  function announce(message) {
    if (!announcer) {
      announcer = document.createElement("p");
      announcer.className = "nel-announcer";
      announcer.setAttribute("role", "status");
      announcer.setAttribute("aria-live", "polite");
      document.body.appendChild(announcer);
    }
    announcer.textContent = message;
  }

  function initializeShell() {
    const main = document.querySelector("main");
    if (main && !main.id) main.id = "calculator";

    if (!document.querySelector(".skip-link") && main) {
      const skip = document.createElement("a");
      skip.className = "skip-link";
      skip.href = `#${main.id}`;
      skip.textContent = text.skip;
      document.body.prepend(skip);
    }

    document.querySelectorAll("button:not([type])").forEach((el) => { el.type = "button"; });
    const error = document.querySelector(".error, [id='error']");
    if (error) {
      error.setAttribute("role", "alert");
      error.setAttribute("aria-live", "polite");
    }
    const status = document.querySelector("#status, [role='status']");
    if (status && !status.hasAttribute("aria-live")) status.setAttribute("aria-live", "polite");

    if (!(enhancedTools.has(slug) && main)) return;

    const header = document.querySelector(".site-header");
    const existingStart = header?.querySelector(".start-btn, .site-shell-context-action a[href^='#']");
    if (header && !existingStart) {
      const start = document.createElement("a");
      start.className = "start-btn";
      start.href = `#${main.id}`;
      start.textContent = text.start;
      header.appendChild(start);
    }

    const controls = [...main.querySelectorAll("input, select, textarea")];
    controls.forEach((control) => {
      ["input", "change"].forEach((eventName) => {
        control.addEventListener(eventName, () => setTimeout(clearStaleResult, 0));
      });
    });
    const defaults = controls.map((control) => ({
      control,
      value: control.value,
      checked: control.checked,
      selectedIndex: control.selectedIndex
    }));

    const actions = main.querySelector(".actions, .action-row, .export-actions, .result-actions");
    if (actions) {
      let printButton = actions.querySelector("#print, #printBtn, [data-action='print'], [data-nel-action='print']");
      if (!printButton) {
        printButton = button(text.print, "print");
        printButton.addEventListener("click", () => window.print());
        actions.appendChild(printButton);
      }
      if (printButton) printButton.textContent = text.print;

      const reset = button(text.reset, "reset");
      const save = button(text.save, "save");
      const existingExport = actions.querySelector("#csv, #csvBtn, #exportBtn, [data-action='export']");
      const exportButton = existingExport ? null : button(text.export, "export");
      if (printButton) actions.insertBefore(reset, printButton);
      else actions.appendChild(reset);
      actions.insertBefore(save, printButton || null);
      if (exportButton) actions.insertBefore(exportButton, printButton || null);

      reset.addEventListener("click", () => {
        defaults.forEach(({ control, value, checked, selectedIndex }) => {
          control.value = value;
          control.checked = checked;
          if (control.tagName === "SELECT") control.selectedIndex = selectedIndex;
          control.dispatchEvent(new Event("input", { bubbles: true }));
          control.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      save.addEventListener("click", () => {
        const entries = readHistory();
        entries.unshift(snapshot());
        writeHistory(entries);
        renderHistory();
        announce(text.saved);
      });
      if (exportButton) exportButton.addEventListener("click", exportCsv);
    }

    const inputCard = main.querySelector(".input-card, .input-panel, .config-panel") || main.firstElementChild;
    if (inputCard && !inputCard.querySelector(".nel-history")) {
      const details = document.createElement("details");
      details.className = "nel-history";
      historySummary = document.createElement("summary");
      historyList = document.createElement("div");
      historyList.className = "nel-history-list";
      const clear = button(text.clear, "clear-history");
      clear.addEventListener("click", () => {
        writeHistory([]);
        renderHistory();
      });
      details.append(historySummary, historyList, clear);
      inputCard.appendChild(details);
      renderHistory();
    }

    if ("serviceWorker" in navigator && !document.querySelector('script[src*="/js/pwa.js"],script[src^="js/pwa.js"],script[src^="../js/pwa.js"]')) {
      const swUrl = /\/zh\/?$/.test(location.pathname) ? "../sw.js" : "sw.js";
      addEventListener("load", () => navigator.serviceWorker.register(swUrl).catch(() => {}), { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeShell, { once: true });
  } else {
    initializeShell();
  }
})();
