const $ = (id) => document.getElementById(id);
const locale = (document.documentElement.dataset.nelLocale || document.documentElement.lang || "en").toLowerCase();
const currentLang = locale.startsWith("zh") ? "zh" : locale.startsWith("es") ? "es" : "en";

const copy = {
  en: {
    validation: "Check the inputs. Distance must be greater than 0, route factor at least 1, group index from 1.0 to 1.6, and line rate greater than 0.",
    copied: "Result copied",
    saved: "Record saved",
    noHistory: "No saved calculations yet. Calculate and click “Save record”.",
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
    serialization: "Serialization"
  },
  zh: {
    validation: "请检查输入：距离必须大于 0，路由系数至少为 1，群折射率在 1.0 到 1.6 之间，线路速率必须大于 0。",
    copied: "结果已复制",
    saved: "记录已保存",
    noHistory: "暂无计算记录。完成计算后点击“保存记录”。",
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
    serialization: "串行化时延"
  },
  es: {
    validation: "Revise los datos. La distancia debe ser mayor que 0, el factor de ruta al menos 1, el índice de grupo entre 1.0 y 1.6, y la velocidad de línea mayor que 0.",
    copied: "Resultado copiado",
    saved: "Registro guardado",
    noHistory: "Aún no hay cálculos guardados. Calcule y pulse “Guardar registro”.",
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
    serialization: "Serialización"
  }
};

const text = copy[currentLang];
let lastResult = null;

function numberValue(id){
  return Number.parseFloat($(id).value);
}

function integerValue(id){
  return Number.parseInt($(id).value, 10);
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
  if (preset === "custom"){
    field.readOnly = false;
  } else {
    field.value = preset;
    field.readOnly = true;
  }
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

function renderComparison(result){
  const rows = [
    [text.fiber, result.usPerKm, 4],
    [text.vacuum, result.vacuumUsPerKm, 3],
    [text.microwave, result.microwaveUsPerKm, 3],
    [text.hollow, result.hollowCoreUsPerKm, 3],
    [`${text.copper} (NVP 0.70)`, result.copperNvp70UsPerKm, 2],
    [`${text.copper} (NVP 0.65)`, result.copperNvp65UsPerKm, 2]
  ];
  $("comparisonBody").innerHTML = rows.map(([label, us, digits]) => {
    const value = (Math.round((us + Number.EPSILON) * 10 ** digits) / 10 ** digits).toFixed(digits);
    return `<tr><td>${label}</td><td>${value} µs/km</td></tr>`;
  }).join("");
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
  lastResult = {...values, ...result, timestamp: new Date().toISOString()};
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
  if (typeof window.nelTrack === "function"){
    window.nelTrack("fiber_latency_calculate", {
      one_way_us: Number(result.oneWayUs.toFixed(2)),
      rtt_us: Number(result.rttUs.toFixed(2))
    });
  }
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
  if (!lastResult) calculate();
  const r = lastResult;
  if (!r) return text.validation;
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

async function copyResult(){
  const value = buildResultText();
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  temporaryButtonMessage($("copyBtn"), text.copied);
}

function temporaryButtonMessage(button, message){
  const old = button.innerHTML;
  button.textContent = message;
  setTimeout(() => { button.innerHTML = old; }, 1400);
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
  if (!lastResult) calculate();
  if (!lastResult) return;
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
  container.innerHTML = history.slice(0, 6).map((item) => {
    const date = new Date(item.timestamp);
    return `<article class="history-item">
      <h3>${escapeHtml(item.projectName || "")}</h3>
      <p>${date.toLocaleString(localeName)}</p>
      <p>${text.oneWay}: <strong>${escapeHtml(item.oneWayText || "")}</strong></p>
      <p>${text.rtt}: ${escapeHtml(item.rttText || "")}</p>
    </article>`;
  }).join("");
}

function clearHistory(){
  if (confirm(text.confirmClear)){
    localStorage.removeItem(historyKey());
    renderHistory();
  }
}

$("groupIndexPreset").addEventListener("change", () => { applyGroupPreset(); calculate(); });
$("groupIndex").addEventListener("input", () => { $("groupIndexPreset").value = "custom"; $("groupIndex").readOnly = false; syncPresetCards(); });
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
$("printBtn").addEventListener("click", () => window.print());
$("clearHistoryBtn").addEventListener("click", clearHistory);
["distance","distanceUnit","routeFactor","equipmentCount","equipmentDelay","packetSize","linkRate","serializationHops"].forEach((id) => {
  $(id).addEventListener("input", () => {
    clearTimeout(window.__fiberLatencyTimer);
    window.__fiberLatencyTimer = setTimeout(calculate, 180);
  });
  $(id).addEventListener("change", calculate);
});

applyGroupPreset();
calculate();
renderHistory();
