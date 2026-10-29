const $ = (id) => document.getElementById(id);
const locale = (document.documentElement.dataset.nelLocale || document.documentElement.lang || "en").toLowerCase();
const currentLang = locale.startsWith("zh") ? "zh" : locale.startsWith("es") ? "es" : "en";

const copy = {
  en: {
    validation: "Check the inputs. Distance must be greater than 0, route factor at least 1, group index from 1.0 to 1.6, and line rate greater than 0.",
    copied: "Copied",
    copyFailed: "Copy failed",
    saved: "Saved",
    csv: "CSV exported",
    linkCopied: "Link copied",
    linkManual: "URL updated — copy the address bar",
    noHistory: "No saved calculations yet. Calculate and click “Save”.",
    confirmClear: "Clear all saved history?",
    fiber: "Fiber",
    vacuum: "Vacuum / free-space laser",
    microwave: "Microwave / radio in air",
    hollow: "Hollow-core fiber",
    copper: "Copper twisted pair",
    project: "Project",
    oneWay: "One-way",
    rtt: "RTT",
    propagation: "Propagation",
    equipment: "Equipment",
    serialization: "Serialization",
    csvField: "Field",
    csvValue: "Value",
    csvUnit: "Unit",
    csvNames: ["Project", "Route distance", "Distance unit", "Route factor", "Group index preset", "Group index n_g", "Active devices", "Delay per device", "Packet size", "Line rate", "Store-and-forward hops", "Fiber length", "Propagation", "Equipment", "Serialization", "One-way latency", "Round-trip time", "Propagation per km", "Speed in fiber", "Fraction of c", "Delay versus vacuum", "Fiber", "Vacuum / free-space laser", "Microwave / radio in air", "Hollow-core fiber", "Copper twisted pair (NVP 0.70)", "Copper twisted pair (NVP 0.65)"]
  },
  zh: {
    validation: "请检查输入：距离必须大于 0，路由系数至少为 1，群折射率在 1.0 到 1.6 之间，线路速率必须大于 0。",
    copied: "已复制",
    copyFailed: "复制失败",
    saved: "已保存",
    csv: "CSV 已导出",
    linkCopied: "链接已复制",
    linkManual: "地址已更新，请复制地址栏",
    noHistory: "暂无计算记录。完成计算后点击“保存”。",
    confirmClear: "确定清空全部历史记录吗？",
    fiber: "光纤",
    vacuum: "真空 / 自由空间激光",
    microwave: "空气中的微波 / 无线",
    hollow: "空芯光纤",
    copper: "铜双绞线",
    project: "工程",
    oneWay: "单向",
    rtt: "往返 RTT",
    propagation: "传播时延",
    equipment: "设备时延",
    serialization: "串行化时延",
    csvField: "字段",
    csvValue: "数值",
    csvUnit: "单位",
    csvNames: ["项目", "路由距离", "距离单位", "路由系数", "群折射率预设", "群折射率 n_g", "路径中的有源设备", "单台时延", "报文长度", "线路速率", "存储转发跳数", "纤长", "传播时延", "设备时延", "串行化时延", "单向时延", "往返时间", "每公里传播时延", "光纤中的速度", "相对光速", "相对真空的时延增幅", "光纤", "真空 / 自由空间激光", "空气中的微波 / 无线", "空芯光纤", "铜双绞线（NVP 0.70）", "铜双绞线（NVP 0.65）"]
  },
  es: {
    validation: "Revise los datos. La distancia debe ser mayor que 0, el factor de ruta al menos 1, el índice de grupo entre 1.0 y 1.6, y la velocidad de línea mayor que 0.",
    copied: "Copiado",
    copyFailed: "Error al copiar",
    saved: "Guardado",
    csv: "CSV exportado",
    linkCopied: "Enlace copiado",
    linkManual: "URL actualizada — copie la barra de direcciones",
    noHistory: "Aún no hay cálculos guardados. Calcule y pulse “Guardar”.",
    confirmClear: "¿Borrar todo el historial guardado?",
    fiber: "Fibra",
    vacuum: "Vacío / láser en espacio libre",
    microwave: "Microondas / radio en aire",
    hollow: "Fibra de núcleo hueco",
    copper: "Par trenzado de cobre",
    project: "Proyecto",
    oneWay: "Ida",
    rtt: "RTT",
    propagation: "Propagación",
    equipment: "Equipos",
    serialization: "Serialización",
    csvField: "Campo",
    csvValue: "Valor",
    csvUnit: "Unidad",
    csvNames: ["Proyecto", "Distancia de ruta", "Unidad de distancia", "Factor de ruta", "Preajuste del índice de grupo", "Índice de grupo n_g", "Dispositivos activos", "Retardo por dispositivo", "Tamaño de paquete", "Velocidad de línea", "Saltos de almacenamiento y reenvío", "Longitud de fibra", "Propagación", "Equipos", "Serialización", "Latencia de ida", "Tiempo de ida y vuelta", "Propagación por km", "Velocidad en la fibra", "Fracción de c", "Retardo frente al vacío", "Fibra", "Vacío / láser en espacio libre", "Microondas / radio en aire", "Fibra de núcleo hueco", "Par trenzado de cobre (NVP 0,70)", "Par trenzado de cobre (NVP 0,65)"]
  }
};

const text = copy[currentLang];
const SHARE_KEYS = ["project", "distance", "unit", "factor", "ng", "preset", "devices", "delay", "bytes", "rate", "hops"];
let lastResult = null;

function numberValue(id){
  return Number.parseFloat($(id).value);
}

function integerValue(id){
  return Number.parseInt($(id).value, 10);
}

function readRaw(){
  return {
    projectName: $("projectName").value,
    distance: $("distance").value,
    distanceUnit: $("distanceUnit").value,
    routeFactor: $("routeFactor").value,
    groupIndexPreset: $("groupIndexPreset").value,
    groupIndex: $("groupIndex").value,
    equipmentCount: $("equipmentCount").value,
    equipmentDelay: $("equipmentDelay").value,
    packetSize: $("packetSize").value,
    linkRate: $("linkRate").value,
    serializationHops: $("serializationHops").value
  };
}

function readInputs(){
  return {
    projectName: $("projectName").value.trim() || "Untitled",
    distance: numberValue("distance"),
    distanceUnit: $("distanceUnit").value,
    routeFactor: numberValue("routeFactor"),
    groupIndex: numberValue("groupIndex"),
    equipmentCount: integerValue("equipmentCount"),
    equipmentDelay: numberValue("equipmentDelay"),
    packetSize: numberValue("packetSize"),
    linkRate: numberValue("linkRate"),
    serializationHops: integerValue("serializationHops")
  };
}

function optionText(id){
  const field = $(id);
  const option = field && field.options ? field.options[field.selectedIndex] : null;
  return option ? option.text : "";
}

function syncPresetCards(){
  const preset = $("groupIndexPreset");
  if (!preset) return;
  const value = preset.value;
  document.querySelectorAll("[data-preset]").forEach((btn) => {
    const on = btn.getAttribute("data-preset") === value;
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function applyGroupPreset(){
  const preset = $("groupIndexPreset").value;
  const field = $("groupIndex");
  field.readOnly = false;
  if (preset !== "custom") field.value = preset;
  syncPresetCards();
}

function markGroupCustom(){
  const preset = $("groupIndexPreset");
  if (preset.value !== "custom") preset.value = "custom";
  $("groupIndex").readOnly = false;
  syncPresetCards();
}

function setValidation(message){
  const node = $("validationMessage");
  if (!node) return;
  node.textContent = message || "";
  node.hidden = !message;
}

function setMbar(oneWay, rtt){
  setText("mbar-val", oneWay);
  setText("mbar-rtt", rtt ? `${text.rtt} ${rtt}` : `${text.rtt} —`);
}

function setText(id, value){
  const node = $(id);
  if (node) node.textContent = value;
}

function setExportEnabled(on){
  document.querySelectorAll("[data-ro-act=\"copy\"], [data-ro-act=\"save\"], [data-ro-act=\"csv\"]").forEach((el) => {
    el.disabled = !on;
    el.setAttribute("aria-disabled", on ? "false" : "true");
  });
}

function renderComparison(result){
  const rows = comparisonRows(result);
  $("comparisonBody").innerHTML = rows.map((row) => `<tr><td>${row.label}</td><td>${row.value}</td></tr>`).join("");
}

function formatUsPerKm(us, digits){
  const value = (Math.round((us + Number.EPSILON) * 10 ** digits) / 10 ** digits).toFixed(digits);
  return `${value} µs/km`;
}

function comparisonRows(result){
  return [
    [text.fiber, result.usPerKm, 4],
    [text.vacuum, result.vacuumUsPerKm, 3],
    [text.microwave, result.microwaveUsPerKm, 3],
    [text.hollow, result.hollowCoreUsPerKm, 3],
    [`${text.copper} (NVP 0.70)`, result.copperNvp70UsPerKm, 2],
    [`${text.copper} (NVP 0.65)`, result.copperNvp65UsPerKm, 2]
  ].map(([label, us, digits]) => ({ label, value: formatUsPerKm(us, digits), unit: "µs/km" }));
}

const RESULT_IDS = ["oneWay","rtt","fiberLength","propagation","equipment","serialization","usPerKm","speed","fractionC","versusVacuum"];
const INPUT_IDS = ["distance","routeFactor","groupIndex","equipmentCount","equipmentDelay","packetSize","linkRate","serializationHops"];

function markInvalidFields(values){
  const checks = {
    distance: Number.isFinite(values.distance) && values.distance > 0,
    routeFactor: Number.isFinite(values.routeFactor) && values.routeFactor >= 1,
    groupIndex: Number.isFinite(values.groupIndex) && values.groupIndex >= 1 && values.groupIndex <= 1.6,
    equipmentCount: Number.isSafeInteger(values.equipmentCount) && values.equipmentCount >= 0,
    equipmentDelay: Number.isFinite(values.equipmentDelay) && values.equipmentDelay >= 0,
    packetSize: Number.isFinite(values.packetSize) && values.packetSize >= 0,
    linkRate: Number.isFinite(values.linkRate) && values.linkRate > 0,
    serializationHops: Number.isSafeInteger(values.serializationHops) && values.serializationHops >= 0
  };
  for (const id of INPUT_IDS){
    const field = $(id);
    if (!field) continue;
    const invalid = checks[id] === false;
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
    field.style.outline = invalid ? "2px solid #b42318" : "";
  }
}

function clearResults(){
  lastResult = null;
  for (const id of RESULT_IDS) setText(id, "—");
  setMbar("—", "");
  const body = $("comparisonBody");
  if (body) body.replaceChildren();
  setExportEnabled(false);
}

function calculate(){
  const values = readInputs();
  const result = window.NELFiberLatencyEngine.calculate(values);
  if (!result.ok){
    clearResults();
    markInvalidFields(values);
    setValidation(text.validation);
    return;
  }
  markInvalidFields(values);
  setValidation("");
  lastResult = {...values, ...result, raw: readRaw(), presetLabel: optionText("groupIndexPreset"), timestamp: new Date().toISOString()};
  setText("oneWay", result.oneWayText);
  setText("rtt", result.rttText);
  setText("fiberLength", `${result.fiberKm.toFixed(3)} km`);
  setText("propagation", result.propagationText);
  setText("equipment", result.equipmentText);
  setText("serialization", result.serializationText);
  setText("usPerKm", `${result.usPerKm.toFixed(4)} µs/km`);
  setText("speed", `${Math.round(result.speedKmS).toLocaleString(currentLang === "zh" ? "zh-CN" : currentLang === "es" ? "es" : "en-US")} km/s`);
  setText("fractionC", `${result.fractionOfC.toFixed(3)} c`);
  setText("versusVacuum", `${result.percentVsVacuum.toFixed(1)}%`);
  setMbar(result.oneWayText, result.rttText);
  renderComparison(result);
  setExportEnabled(true);
  if (typeof window.nelTrack === "function"){
    window.nelTrack("fiber_latency_calculate", {
      one_way_us: Number(result.oneWayUs.toFixed(2)),
      rtt_us: Number(result.rttUs.toFixed(2))
    });
  }
}

function scheduleCalculate(){
  setExportEnabled(false);
  clearTimeout(window.__fiberLatencyTimer);
  window.__fiberLatencyTimer = setTimeout(calculate, 180);
}

function resetForm(){
  $("projectName").value = currentLang === "zh" ? "DCI 光纤链路" : currentLang === "es" ? "Enlace de fibra DCI" : "DCI Fiber Link";
  $("distance").value = 100;
  $("distanceUnit").value = "km";
  $("routeFactor").value = "1.0";
  $("groupIndexPreset").value = "1.468";
  applyGroupPreset();
  $("equipmentCount").value = 0;
  $("equipmentDelay").value = 0;
  $("packetSize").value = 1500;
  $("linkRate").value = 10;
  $("serializationHops").value = 1;
  calculate();
}

function buildResultText(){
  const r = lastResult;
  if (!r) return "";
  return [
    "NetEngineerLab - Fiber Latency Calculator",
    `${text.project}: ${r.projectName}`,
    `${text.oneWay}: ${r.oneWayText}`,
    `${text.rtt}: ${r.rttText}`,
    `${text.propagation}: ${r.propagationText}`,
    `${text.equipment}: ${r.equipmentText}`,
    `${text.serialization}: ${r.serializationText}`
  ].join("\n");
}

async function copyText(value){
  if (navigator.clipboard && navigator.clipboard.writeText){
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      /* fall through */
    }
  }
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function temporaryButtonMessage(button, message){
  if (!button) return;
  if (!button.dataset.label) button.dataset.label = button.textContent;
  button.textContent = message;
  clearTimeout(button.__flashT);
  button.__flashT = setTimeout(() => { button.textContent = button.dataset.label; }, 1400);
}

async function copyResult(){
  if (!lastResult || $("copyBtn").disabled) return;
  const ok = await copyText(buildResultText());
  temporaryButtonMessage($("copyBtn"), ok ? text.copied : text.copyFailed);
}

function historyKey(){
  return "fiberLatencyHistory";
}

function getHistory(){
  try {
    return JSON.parse(localStorage.getItem(historyKey()) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(){
  if (!lastResult || $("saveBtn").disabled) return;
  const history = getHistory();
  history.unshift(lastResult);
  localStorage.setItem(historyKey(), JSON.stringify(history.slice(0, 12)));
  renderHistory();
  temporaryButtonMessage($("saveBtn"), text.saved);
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function renderHistory(){
  const history = getHistory();
  const container = $("historyList");
  if (!history.length){
    container.innerHTML = `<div class="history-empty">${text.noHistory}</div>`;
    return;
  }
  const localeName = currentLang === "zh" ? "zh-CN" : currentLang === "es" ? "es" : "en-US";
  container.innerHTML = history.slice(0, 6).map((item, index) => {
    const date = new Date(item.timestamp);
    return `<button type="button" class="history-item" data-history-idx="${index}">
      <div><b>${escapeHtml(item.projectName || "")}</b><span>${text.oneWay}: ${escapeHtml(item.oneWayText || "")} · ${text.rtt}: ${escapeHtml(item.rttText || "")}</span></div>
      <div class="history-meta">${escapeHtml(date.toLocaleString(localeName))}</div>
    </button>`;
  }).join("");
}

function restoreRecord(item){
  if (!item) return;
  const raw = item.raw || {};
  $("projectName").value = raw.projectName != null ? raw.projectName : (item.projectName || "");
  $("distance").value = raw.distance != null ? raw.distance : item.distance;
  $("distanceUnit").value = raw.distanceUnit || item.distanceUnit || "km";
  $("routeFactor").value = raw.routeFactor != null ? raw.routeFactor : item.routeFactor;
  $("groupIndex").value = raw.groupIndex != null ? raw.groupIndex : item.groupIndex;
  const preset = raw.groupIndexPreset || item.groupIndexPreset || "custom";
  const known = [...$("groupIndexPreset").options].some((option) => option.value === preset);
  $("groupIndexPreset").value = known && (preset === "custom" || Number(preset) === Number($("groupIndex").value)) ? preset : "custom";
  if ($("groupIndexPreset").value !== "custom" && Number($("groupIndexPreset").value) === Number($("groupIndex").value)){
    $("groupIndex").value = $("groupIndexPreset").value;
  }
  syncPresetCards();
  $("equipmentCount").value = raw.equipmentCount != null ? raw.equipmentCount : item.equipmentCount;
  $("equipmentDelay").value = raw.equipmentDelay != null ? raw.equipmentDelay : item.equipmentDelay;
  $("packetSize").value = raw.packetSize != null ? raw.packetSize : item.packetSize;
  $("linkRate").value = raw.linkRate != null ? raw.linkRate : item.linkRate;
  $("serializationHops").value = raw.serializationHops != null ? raw.serializationHops : item.serializationHops;
  calculate();
}

function clearHistory(){
  if (confirm(text.confirmClear)){
    localStorage.removeItem(historyKey());
    renderHistory();
  }
}

function csvCell(value){
  return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
}

function unitFromDelay(label){
  if (typeof label !== "string") return "";
  if (label.endsWith(" µs")) return "µs";
  if (label.endsWith(" ms")) return "ms";
  return "";
}

function exportCsv(){
  if (!lastResult || $("csvBtn").disabled) return;
  const r = lastResult;
  const raw = r.raw || {};
  const comparison = comparisonRows(r);
  const values = [
    [raw.projectName != null ? raw.projectName : r.projectName, ""],
    [raw.distance != null ? raw.distance : r.distance, raw.distanceUnit || r.distanceUnit || ""],
    [raw.distanceUnit || r.distanceUnit, ""],
    [raw.routeFactor != null ? raw.routeFactor : r.routeFactor, ""],
    [r.presetLabel || raw.groupIndexPreset || "", ""],
    [raw.groupIndex != null ? raw.groupIndex : r.groupIndex, ""],
    [raw.equipmentCount != null ? raw.equipmentCount : r.equipmentCount, ""],
    [raw.equipmentDelay != null ? raw.equipmentDelay : r.equipmentDelay, "µs"],
    [raw.packetSize != null ? raw.packetSize : r.packetSize, "B"],
    [raw.linkRate != null ? raw.linkRate : r.linkRate, "Gbps"],
    [raw.serializationHops != null ? raw.serializationHops : r.serializationHops, ""],
    [`${r.fiberKm.toFixed(3)}`, "km"],
    [r.propagationText, unitFromDelay(r.propagationText)],
    [r.equipmentText, unitFromDelay(r.equipmentText)],
    [r.serializationText, unitFromDelay(r.serializationText)],
    [r.oneWayText, unitFromDelay(r.oneWayText)],
    [r.rttText, unitFromDelay(r.rttText)],
    [`${r.usPerKm.toFixed(4)}`, "µs/km"],
    [`${Math.round(r.speedKmS)}`, "km/s"],
    [`${r.fractionOfC.toFixed(3)}`, "c"],
    [`${r.percentVsVacuum.toFixed(1)}`, "%"]
  ];
  for (const row of comparison) values.push([row.value, row.unit]);
  const rows = [[text.csvField, text.csvValue, text.csvUnit]].concat(text.csvNames.map((name, index) => [name, values[index][0], values[index][1]]));
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "fiber_latency_report.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  temporaryButtonMessage($("csvBtn"), text.csv);
}

async function shareInputs(){
  const raw = readRaw();
  const q = new URLSearchParams({
    project: raw.projectName,
    distance: raw.distance,
    unit: raw.distanceUnit,
    factor: raw.routeFactor,
    ng: raw.groupIndex,
    preset: raw.groupIndexPreset,
    devices: raw.equipmentCount,
    delay: raw.equipmentDelay,
    bytes: raw.packetSize,
    rate: raw.linkRate,
    hops: raw.serializationHops
  });
  const url = `${location.pathname}?${q.toString()}#result`;
  history.replaceState(null, "", url);
  const ok = await copyText(location.origin + url);
  temporaryButtonMessage($("btn-share"), ok ? text.linkCopied : text.linkManual);
}

function hasPreset(value){
  return [...$("groupIndexPreset").options].some((option) => option.value === value);
}

function loadFromQuery(){
  const q = new URLSearchParams(location.search);
  if (!SHARE_KEYS.some((key) => q.has(key))) return false;
  if (q.has("project")) $("projectName").value = q.get("project");
  if (q.has("distance")) $("distance").value = q.get("distance");
  if (q.has("unit") && ["km", "mi", "m"].includes(q.get("unit"))) $("distanceUnit").value = q.get("unit");
  if (q.has("factor")) $("routeFactor").value = q.get("factor");
  if (q.has("preset")) $("groupIndexPreset").value = hasPreset(q.get("preset")) ? q.get("preset") : "custom";
  if (q.has("ng")) $("groupIndex").value = q.get("ng");
  const preset = $("groupIndexPreset").value;
  if (preset !== "custom" && q.has("ng") && Number(preset) !== Number(q.get("ng"))){
    $("groupIndexPreset").value = "custom";
  } else if (preset !== "custom" && !q.has("ng")){
    $("groupIndex").value = preset;
  }
  $("groupIndex").readOnly = false;
  syncPresetCards();
  if (q.has("devices")) $("equipmentCount").value = q.get("devices");
  if (q.has("delay")) $("equipmentDelay").value = q.get("delay");
  if (q.has("bytes")) $("packetSize").value = q.get("bytes");
  if (q.has("rate")) $("linkRate").value = q.get("rate");
  if (q.has("hops")) $("serializationHops").value = q.get("hops");
  return true;
}

$("groupIndexPreset").addEventListener("change", () => { applyGroupPreset(); calculate(); });
$("groupIndex").addEventListener("input", () => { markGroupCustom(); scheduleCalculate(); });
$("groupIndex").addEventListener("change", calculate);
document.querySelectorAll("[data-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    $("groupIndexPreset").value = btn.getAttribute("data-preset");
    applyGroupPreset();
    calculate();
  });
});
$("calculateBtn").addEventListener("click", calculate);
$("resetBtn").addEventListener("click", resetForm);
$("copyBtn").addEventListener("click", copyResult);
$("saveBtn").addEventListener("click", saveHistory);
$("csvBtn").addEventListener("click", exportCsv);
$("printBtn").addEventListener("click", () => window.print());
$("clearHistoryBtn").addEventListener("click", clearHistory);
$("btn-share").addEventListener("click", shareInputs);
$("historyList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-history-idx]");
  if (!button) return;
  restoreRecord(getHistory()[Number(button.getAttribute("data-history-idx"))]);
});
["projectName","distance","distanceUnit","routeFactor","equipmentCount","equipmentDelay","packetSize","linkRate","serializationHops"].forEach((id) => {
  $(id).addEventListener("input", scheduleCalculate);
  $(id).addEventListener("change", calculate);
});

setExportEnabled(false);
if (!loadFromQuery()) applyGroupPreset();
calculate();
renderHistory();

window.NELFiberLatency = { csvCell };
