(function () {
  "use strict";

  const path = location.pathname.replace(/\/+$/, "");
  const parts = path.split("/").filter(Boolean);
  const toolIndex = parts.indexOf("tools");
  const slug = toolIndex >= 0 ? parts[toolIndex + 1] : "";
  const zh = document.documentElement.lang.toLowerCase().startsWith("zh");
  const es = document.documentElement.lang.toLowerCase().startsWith("es");
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
        calculate: "计算",
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
    : es ? {
        skip: "Ir a la calculadora", start: "Empezar a calcular", calculate: "Calcular",
        reset: "Restablecer", save: "Guardar resultado", export: "Exportar CSV",
        print: "Imprimir / PDF", history: "Historial de cálculos", clear: "Borrar historial",
        empty: "No hay resultados guardados", saved: "Resultado guardado", exported: "CSV exportado",
        footer: "Herramientas profesionales para ingeniería de redes y telecomunicaciones."
      } : {
        skip: "Skip to calculator",
        start: "Start calculating",
        calculate: "Calculate",
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
    // Registered controllers render and invalidate their own complete result.
    // Do not overwrite their localized invalid state with the legacy fallback.
    if (window.NELToolInputController?.managesValidation === true) return;
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
      time.textContent = new Date(entry.time).toLocaleString(zh ? "zh-CN" : es ? "es" : "en-US");
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

  // Native history titles are project names, not numeric output or status badges.
  function initializeNativeHistoryRoles() {
    const history = document.getElementById("historyList");
    if (!history || !document.body.classList.contains("nel-tool-v3")) return;
    const apply = () => {
      history.querySelectorAll("article").forEach(entry => {
        entry.classList.add("nel-history-record");
        const title = entry.querySelector("h3,strong,b");
        title?.classList.add("nel-history-title");
        const date = title?.nextElementSibling;
        if (date) date.classList.add("nel-history-date");
        entry.querySelectorAll("p,span,small,b,strong").forEach(node => {
          if (node !== title && node !== date && !title?.contains(node) && !date?.contains(node)) node.classList.add("nel-history-summary");
        });
        const actionSelectors = slug === "48v-battery-runtime" ? "button[data-history]" : ["ipv6-nat-planner", "wifi-coverage-capacity-planner"].includes(slug) ? "button[data-load],button[data-delete]" : "";
        if (actionSelectors) entry.querySelectorAll(actionSelectors).forEach(button => button.classList.add("btn", "btn-ghost", "btn-sm"));
      });
    };
    apply();
    new MutationObserver(apply).observe(history, { childList: true, subtree: true });
  }

  function initializeShell() {
    initializeNativeHistoryRoles();
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
    const parentLive = status?.parentElement?.closest('[aria-live="polite"], [aria-live="assertive"], [role="status"], [role="alert"], [role="log"]');
    if (status && !status.hasAttribute("aria-live") && !parentLive) status.setAttribute("aria-live", "polite");

    if (!main || (!enhancedTools.has(slug) && !window.NELToolInputController)) return;
    const enhanceActions = enhancedTools.has(slug);

    const header = document.querySelector(".site-header");
    // Shared header template is the only source of the calculator CTA.
    const headerStart = header?.querySelector(".site-shell-context-action a[href^='#']");
    if (headerStart && main.id) headerStart.href = `#${main.id}`;

    const controls = [...main.querySelectorAll("input, select, textarea")];
    // Domain apps own validation and async/debounced result generations. Let
    // them invalidate immediately, before their ordinary input handlers run.
    const controller = window.NELToolInputController;
    const controllerNodes = value => {
      const resolved = typeof value === "function" ? value() : value;
      if (!resolved) return [];
      if (typeof resolved === "string") return [...main.querySelectorAll(resolved)];
      if (resolved instanceof Element) return [resolved];
      return [...resolved].filter(node => node instanceof Element && main.contains(node));
    };
    controls.forEach((control) => {
      ["input", "change"].forEach((eventName) => {
        control.addEventListener(eventName, () => setTimeout(() => { clearStaleResult(); syncControllerActions(); }, 0));
      });
    });
    const defaults = controls.map((control) => ({
      control,
      value: control.value,
      checked: control.checked,
      selectedIndex: control.selectedIndex
    }));

    const actions = main.querySelector(".actions, .action-row, .export-actions, .result-actions");
    const activeControllerInputs = (scope = controller) => controllerNodes(scope?.inputControls || controller?.inputControls || "input,select,textarea").filter(control =>
      !control.disabled && !["hidden", "file"].includes(control.type) && !control.closest("[hidden]") &&
      visible(control) && (typeof control.checkVisibility !== "function" || control.checkVisibility()));
    const validationControllerInputs = (scope = controller) => [...new Set([...activeControllerInputs(scope),
      ...controllerNodes(scope?.validationInputs).filter(control => !control.disabled && !["hidden", "file"].includes(control.type))])];
    const nativeControlValid = (control, scope = controller) => {
      const validity = control.validity;
      if (controllerNodes(scope?.requiredInputs).includes(control) && String(control.value).trim() === "") return false;
      // An omitted step has an implicit browser step=1 that many legacy
      // engineering engines do not impose. Authored step constraints count;
      // any engine-compatible exception must name its exact control.
      const stepException = controllerNodes(scope?.allowStepMismatchInputs).includes(control);
      return !validity || (!control.hasAttribute("step") || !validity.stepMismatch || stepException) &&
        !["badInput", "rangeUnderflow", "rangeOverflow", "valueMissing", "typeMismatch", "patternMismatch", "customError"].some(key => validity[key]);
    };
    const nativeControllerValid = (scope = controller) => validationControllerInputs(scope).every(control => nativeControlValid(control, scope));
    const controllerScopes = () => Array.isArray(controller?.workflows) && controller.workflows.length ? controller.workflows : [controller];
    const scopeValid = scope => (typeof scope?.isValid !== "function" || scope.isValid()) && nativeControllerValid(scope);
    const controllerValid = () => controllerScopes().some(scopeValid);
    const controllerInputSignatures = new WeakMap();
    const controllerInputSignature = control => control.matches("input[type=checkbox],input[type=radio]") ? JSON.stringify([control.value, control.checked]) : control.tagName === "SELECT" && control.multiple ? JSON.stringify([...control.selectedOptions].map(option => option.value)) : String(control.value);
    const nativeAriaOwners = new WeakMap();
    const nativeAriaTracked = new Set();
    const forgetDomainAriaChanges = (records, ownTarget) => {
      for (const record of records) if (record.target !== ownTarget) {
        nativeAriaOwners.delete(record.target);nativeAriaTracked.delete(record.target);
      }
    };
    const nativeAriaChanges = new MutationObserver(records => forgetDomainAriaChanges(records));
    if (controller) nativeAriaChanges.observe(main, { attributes: true, subtree: true, attributeFilter: ["aria-invalid"] });
    let controllerNote;
    const syncControllerActions = () => {
      if (typeof controller?.isValid !== "function") return;
      forgetDomainAriaChanges(nativeAriaChanges.takeRecords());
      for (const control of nativeAriaTracked) if (!main.contains(control)) { nativeAriaTracked.delete(control);nativeAriaOwners.delete(control); }
      // Dynamic domain fields can reuse the same authored input wrapper as the
      // source migration. This adds component classes, never a second wrapper.
      controllerNodes(controller.inputControls || "input,select,textarea").forEach(control => {
        const supported = control.tagName === "SELECT" ? !control.multiple && control.size <= 1 : control.tagName === "INPUT" && !["checkbox", "radio", "range", "file", "hidden", "color", "button", "submit", "reset", "image"].includes(control.type);
        const wrapper = supported && control.closest(".input-wrap");
        if (wrapper && wrapper.querySelectorAll("input,select,textarea").length <= 2) {
          wrapper.classList.add("inp");
          if (control.tagName === "SELECT") wrapper.classList.add("sel");
        }
      });
      controllerNodes(controller.inputControls || "input,select,textarea").forEach(control => controllerInputSignatures.set(control, controllerInputSignature(control)));
      const valid = controllerValid();
      for (const scope of controllerScopes()) {
        const workflowValid = scopeValid(scope);
        const resultActions = [...controllerNodes(scope.resultActions),
          ...(!controller.workflows ? actions?.querySelectorAll('[data-nel-action="save"], [data-nel-action="export"]') || [] : [])];
        resultActions.forEach(control => {
          // Only style precisely declared result actions; gate semantics remain unchanged.
          if (control.tagName === "BUTTON" && !control.closest(".ro-acts") && !control.classList.contains("btn-primary")) control.classList.add("btn", "btn-ghost");
          if ("disabled" in control) control.disabled = !workflowValid;
          else if (workflowValid) control.removeAttribute("aria-disabled");
          else control.setAttribute("aria-disabled", "true");
        });
        if (!workflowValid) {
          // A value slot is a leaf, not its label/unit container. Do not destroy
          // nested fixed IDs if an app accidentally declares a composite node.
          controllerNodes(scope.resultValues).forEach(node => { if (!node.childElementCount || (node.hasAttribute("data-nel-readout-number") && !node.querySelector("[id]") && node.querySelector("[data-nel-readout-unit]"))) node.textContent = "—"; });
          controllerNodes(scope.resultDetails).forEach(node => { node.replaceChildren(); });
          controllerNodes(scope.resultMeters).forEach(node => { node.style.width = "0%"; });
          controllerNodes(scope.resultStatus).forEach(node => {
            node.classList.remove("st-pass", "st-marginal", "st-fail");
            node.classList.add("status", "st-fail");
            if (!node.querySelector("[id]")) node.textContent = zh ? "输入无效" : es ? "Entrada no válida" : "Invalid input";
          });
        }
      }
      // Explicit scalar/readout roles are source-reviewed per tool, including dynamic IDs.
      const readoutRoles = JSON.parse(decodeURIComponent(main.dataset.nelReadoutRoles || "%7B%7D"));
      for (const [role, ids] of Object.entries(readoutRoles)) for (const id of ids) {
        const node = document.getElementById(id);
        if (node && main.contains(node)) node.dataset.nelReadoutRole = role;
      }
      // Source-reviewed generated output roles retain their domain composition.
      const professionalOutputs = JSON.parse(decodeURIComponent(main.dataset.nelProfessionalOutputs || "%7B%7D"));
      for (const selector of professionalOutputs.regions || []) main.querySelectorAll(selector).forEach(node => { node.classList.add("nel-tool-result"); node.setAttribute("data-nel-result-region", ""); });
      for (const selector of professionalOutputs.groups || []) main.querySelectorAll(selector).forEach(node => { node.classList.add("grp"); node.setAttribute("data-nel-group-surface", ""); });
      for (const [role, selectors] of Object.entries(professionalOutputs.roles || {})) for (const selector of selectors) main.querySelectorAll(selector).forEach(node => {
        if (role === "groupHeading") node.dataset.nelHeadingRole = "result-group";
        else node.dataset.nelReadoutRole = role;
      });
      // Authored supporting values adopt canonical OPB group/row ownership.
      // The generator declares applicable selectors; identifier workbenches opt out.
      if (valid && main.dataset.nelReadoutRows) main.querySelectorAll(decodeURIComponent(main.dataset.nelReadoutRows)).forEach(row => {
        if (!row.closest(".nel-tool-result, .readout") || row.closest(".below") || row.hasAttribute("data-nel-group-surface")) return;
        row.classList.add("row");
        row.parentElement.classList.add("grp");
      });
      main.querySelectorAll(".status.st-pass,.status.st-marginal,.status.st-fail").forEach(node => node.setAttribute("data-nel-health-status", ""));
      const statusStates = controllerNodes(controller.resultStatus).flatMap(node => [...node.classList]);
      const readoutState = !valid ? "invalid" : statusStates.includes("st-fail") ? "failed" : statusStates.includes("st-marginal") ? "warning" : statusStates.includes("st-pass") ? "healthy" : "neutral";
      main.dataset.nelReadoutState = readoutState;
      // Explicitly marked numeric headline slots retain their original report text.
      // Units are presentation-only children with no IDs, recreated after every render.
      if (valid) main.querySelectorAll('[data-nel-readout-number="1"]').forEach(node => {
        if (node.querySelector("[id]")) return;
        const text = node.textContent;
        const parts = text.match(/^([+\-−]?(?:\d[\d.,]*|\.\d+)(?:e[+\-]?\d+)?)(.*)$/i);
        if (!parts || !/^\s*[A-Za-zµμ%小时天日]/.test(parts[2])) return;
        const unit = document.createElement("small");
        unit.setAttribute("data-nel-readout-unit", "");
        unit.textContent = parts[2];
        node.replaceChildren(document.createTextNode(parts[1]), unit);
      });
      // Native-only constraint failures need field-level accessible feedback too.
      // Preserve domain-owned aria-invalid; restore only markers this shell added.
      const nativeInvalidControls = new Set();
      const applicableControls = new Set();
      for (const scope of controllerScopes()) for (const control of validationControllerInputs(scope)) {
        applicableControls.add(control);
        if (!nativeControlValid(control, scope)) nativeInvalidControls.add(control);
      }
      const ariaControls = new Set([...controllerNodes(controller.inputControls || "input,select,textarea"), ...applicableControls, ...nativeAriaTracked]);
      for (const control of ariaControls) {
        if (nativeInvalidControls.has(control)) {
          if (control.getAttribute("aria-invalid") !== "true") {
            nativeAriaOwners.set(control, control.getAttribute("aria-invalid"));nativeAriaTracked.add(control);
            control.setAttribute("aria-invalid", "true");
            forgetDomainAriaChanges(nativeAriaChanges.takeRecords(), control);
          }
        } else if (nativeAriaOwners.has(control)) {
          const previous = nativeAriaOwners.get(control);nativeAriaOwners.delete(control);nativeAriaTracked.delete(control);
          if (control.getAttribute("aria-invalid") === "true") {
            if (previous === null) control.removeAttribute("aria-invalid");else control.setAttribute("aria-invalid", previous);
            forgetDomainAriaChanges(nativeAriaChanges.takeRecords(), control);
          }
        }
      }
      const nativeInvalid = !nativeControllerValid();
      const domainMessage = controllerNodes(controller.validation).some(node => !node.hidden && visible(node) && node.textContent.trim());
      if (!valid && (nativeInvalid || !domainMessage) && !controllerNote) {
        controllerNote = document.createElement("p");
        controllerNote.className = "form-error nel-tool-validation";
        controllerNote.setAttribute("role", "alert");
        (main.querySelector(".nel-tool-input, .input-panel, .input-card, .config-panel") || main).appendChild(controllerNote);
      }
      if (controllerNote) {
        controllerNote.textContent = zh ? "请检查输入值及允许范围。" : es ? "Revise los valores y los intervalos permitidos." : "Check the input values and allowed ranges.";
        if (nativeInvalidControls.size) controllerNote.textContent += " " + [...nativeInvalidControls].map(labelFor).join(", ");
        controllerNote.hidden = valid || (!nativeInvalid && domainMessage);
      }
      return valid;
    };
    if (controller) {
      // Apps can finish their first calculation before this deferred shell is
      // ready. Initial sync below covers it; later results call this same hook.
      controller.sync = syncControllerActions;
      ["input", "change"].forEach(eventName => main.addEventListener(eventName, event => {
        const control = event.target;
        if (!(control instanceof Element) || !control.matches("input,select,textarea") ||
          control.disabled || ["hidden", "file"].includes(control.type) ||
          control.closest("[hidden]") || (typeof control.checkVisibility === "function" && !control.checkVisibility())) return;
        if (controller.inputControls && !controllerNodes(controller.inputControls).includes(control)) return;
        const signature = controllerInputSignature(control);
        if (controllerInputSignatures.get(control) !== signature) {
          for (const scope of controllerScopes()) {
            if (!controllerNodes(scope.inputControls || controller.inputControls || "input,select,textarea").includes(control)) continue;
            const invalidate = scope.invalidate || controller.invalidate;
            if (typeof invalidate === "function") invalidate.call(scope.invalidate ? scope : controller);
          }
        }
        syncControllerActions();
        setTimeout(syncControllerActions, 0);
      }, { capture: true }));
      main.addEventListener("click", event => {
        const actionScope = controllerScopes().find(scope => controllerNodes(scope.resultActions).some(node => node === event.target || node.contains(event.target)));
        if (actionScope && !scopeValid(actionScope)) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }, { capture: true });
    }
    const focusCalculationError = () => {
      if (controllerValid()) return;
      const rendered = element => visible(element) && element.getClientRects().length > 0 &&
        (typeof element.checkVisibility !== "function" || element.checkVisibility());
      const inputRoot = main.querySelector(".nel-tool-input, .input-card, .input-panel, .config-panel") || main;
      const invalid = activeControllerInputs().filter(control => inputRoot.contains(control)).find(control =>
        !control.disabled && control.type !== "hidden" && rendered(control) &&
        (!nativeControlValid(control) || control.getAttribute("aria-invalid") === "true"));
      if (invalid) { invalid.focus(); return; }
      const summary = [...controllerNodes(controller?.validation), ...main.querySelectorAll('#error, .error, [role="alert"]')].find(element =>
        rendered(element) && element.textContent.trim());
      if (!summary) return;
      if (!summary.hasAttribute("tabindex")) {
        summary.setAttribute("tabindex", "-1");
        summary.addEventListener("blur", () => { if (summary.getAttribute("tabindex") === "-1") summary.removeAttribute("tabindex"); }, { once: true });
      }
      summary.focus();
    };
    const nativeCalculate = main.querySelector(controller?.calculateSelector || '#calculateBtn, #calculate, [data-nel-action="calculate"], [data-action="calculate"], [id$="Calculate"]');
    if (nativeCalculate && typeof controller?.calculate === "function") {
      nativeCalculate.addEventListener("click", () => setTimeout(() => {
        syncControllerActions();
        focusCalculationError();
      }, 0));
    }
    if (actions) {
      if (typeof controller?.calculate === "function" && !nativeCalculate) {
        const calculate = button(text.calculate, "calculate", "btn btn-primary");
        calculate.addEventListener("click", () => { controller.calculate(); syncControllerActions(); focusCalculationError(); });
        actions.prepend(calculate);
      }
      if (enhanceActions) {
      let printButton = main.querySelector("#print, #printBtn, [data-action='print'], [data-nel-action='print']");
      if (!printButton) {
        printButton = button(text.print, "print");
        printButton.addEventListener("click", () => window.print());
        actions.appendChild(printButton);
      }
      const nativeReset = main.querySelector(controller?.resetSelector || '#resetBtn, #reset, [data-nel-action="reset"], [data-action="reset"]');
      const nativeSave = main.querySelector(controller?.saveSelector || '#saveBtn, #save, [data-nel-action="save"], [data-action="save"]');
      const reset = nativeReset || button(text.reset, "reset");
      if (typeof controller?.calculate === "function") reset.className = "btn btn-ghost";
      const save = nativeSave || button(text.save, "save");
      const existingExport = main.querySelector("#csv, #csvBtn, #exportBtn, [data-action='export'], [data-nel-action='export']");
      const exportButton = existingExport ? null : button(text.export, "export");
      const actionReference = printButton?.parentElement === actions ? printButton : null;
      if (!nativeReset) actions.insertBefore(reset, actionReference);
      if (!nativeSave) actions.insertBefore(save, actionReference);
      if (exportButton) actions.insertBefore(exportButton, actionReference);

      if (!nativeReset) reset.addEventListener("click", () => {
        defaults.forEach(({ control, value, checked, selectedIndex }) => {
          control.value = value;
          control.checked = checked;
          if (control.tagName === "SELECT") control.selectedIndex = selectedIndex;
          control.dispatchEvent(new Event("input", { bubbles: true }));
          control.dispatchEvent(new Event("change", { bubbles: true }));
        });
        syncControllerActions();
      });
      if (!nativeSave) save.addEventListener("click", () => {
        if (!controllerValid()) return;
        const entries = readHistory();
        entries.unshift(snapshot());
        writeHistory(entries);
        renderHistory();
        announce(text.saved);
      });
      if (exportButton) exportButton.addEventListener("click", () => { if (controllerValid()) exportCsv(); });
      syncControllerActions();
      }
    }
    syncControllerActions();

    const inputCard = main.querySelector(".input-card, .input-panel, .config-panel") || main.firstElementChild;
    if (enhanceActions && inputCard && !main.querySelector(controller?.historySelector || '.nel-history, #history, #historyList, #historySection')) {
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

    const registerWorker = controller?.registerServiceWorker !== false && (document.body.dataset.nelOfflineWorker === "1" || controller?.registerServiceWorker === true || enhancedTools.has(slug));
    if (registerWorker && "serviceWorker" in navigator && !document.querySelector('script[src*="/js/pwa.js"],script[src^="js/pwa.js"],script[src^="../js/pwa.js"]')) {
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
