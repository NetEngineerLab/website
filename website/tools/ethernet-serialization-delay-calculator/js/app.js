const CONFIG = {
 "engineGlobal": "NELEthernetSerializationEngine",
 "historyKey": "ethernetSerializationHistory",
 "track": "ethernet_serialization_calculate",
 "hasStatus": false,
 "projectDefault": {
  "en": "Access to core path",
  "zh": "接入到核心路径",
  "es": "Ruta de acceso a núcleo"
 },
 "inputs": [
  {
   "id": "frameBytes",
   "type": "int",
   "numeric": false,
   "default": 1518
  },
  {
   "id": "ratePreset",
   "type": "select",
   "numeric": false,
   "default": "10"
  },
  {
   "id": "rateGbps",
   "type": "number",
   "numeric": false,
   "default": 10
  },
  {
   "id": "hops",
   "type": "int",
   "numeric": false,
   "default": 3
  }
 ],
 "presets": [
  {
   "select": "ratePreset",
   "target": "rateGbps"
  }
 ],
 "modes": [],
 "outputs": [
  "perHop",
  "totalDelay",
  "wireTime",
  "wireBytes",
  "frameRate",
  "l2Throughput",
  "efficiency"
 ],
 "text": {
  "en": {
   "validation": "Check the highlighted inputs: values must be numbers within the allowed range.",
   "validationField": "Check {fields}: enter a number within the allowed range.",
   "listSeparator": ", ",
   "fieldLabels": {
    "frameBytes": "Frame size (incl. FCS)",
    "ratePreset": "Line rate preset",
    "rateGbps": "Line rate",
    "hops": "Store-and-forward hops"
   },
   "notes": {},
   "copied": "Result copied",
   "saved": "Record saved",
   "noHistory": "No saved calculations yet. Calculate and click “Save record”.",
   "confirmClear": "Clear all saved history?",
   "project": "Project",
   "toolName": "Ethernet Serialization Delay Calculator",
   "status": {
    "healthy": "✓ Within limit",
    "warning": "! Near limit",
    "failed": "✕ Exceeds limit"
   },
   "outputLabels": [
    [
     "perHop",
     "Serialization delay per hop"
    ],
    [
     "totalDelay",
     "Total over all hops"
    ],
    [
     "wireTime",
     "Wire time incl. preamble + IFG"
    ],
    [
     "wireBytes",
     "Bytes on the wire per frame"
    ],
    [
     "frameRate",
     "Maximum frame rate"
    ],
    [
     "l2Throughput",
     "L2 throughput at line rate"
    ],
    [
     "efficiency",
     "L2 efficiency"
    ]
   ]
  },
  "zh": {
   "validation": "请检查标出的输入：数值必须在允许范围内。",
   "validationField": "请检查{fields}：需要填写允许范围内的数值。",
   "listSeparator": "、",
   "fieldLabels": {
    "frameBytes": "帧长（含 FCS）",
    "ratePreset": "线路速率预设",
    "rateGbps": "线路速率",
    "hops": "存储转发跳数"
   },
   "notes": {},
   "copied": "结果已复制",
   "saved": "记录已保存",
   "noHistory": "暂无计算记录。完成计算后点击“保存记录”。",
   "confirmClear": "确定清空全部历史记录吗？",
   "project": "工程",
   "toolName": "以太网串行化时延计算器",
   "status": {
    "healthy": "✓ 满足要求",
    "warning": "! 接近上限",
    "failed": "✕ 超出上限"
   },
   "outputLabels": [
    [
     "perHop",
     "单跳串行化时延"
    ],
    [
     "totalDelay",
     "全部跳数合计"
    ],
    [
     "wireTime",
     "含前导码与帧间隙的线路时间"
    ],
    [
     "wireBytes",
     "每帧线路字节数"
    ],
    [
     "frameRate",
     "最大帧速率"
    ],
    [
     "l2Throughput",
     "线速时二层吞吐"
    ],
    [
     "efficiency",
     "二层效率"
    ]
   ]
  },
  "es": {
   "validation": "Revise los datos marcados: deben ser números dentro del rango permitido.",
   "validationField": "Revise {fields}: introduzca un número dentro del rango permitido.",
   "listSeparator": ", ",
   "fieldLabels": {
    "frameBytes": "Tamaño de trama (con FCS)",
    "ratePreset": "Velocidad predefinida",
    "rateGbps": "Velocidad de línea",
    "hops": "Saltos store-and-forward"
   },
   "notes": {},
   "copied": "Resultado copiado",
   "saved": "Registro guardado",
   "noHistory": "Aún no hay cálculos guardados. Calcule y pulse “Guardar registro”.",
   "confirmClear": "¿Borrar todo el historial guardado?",
   "project": "Proyecto",
   "toolName": "Calculadora de retardo de serialización Ethernet",
   "status": {
    "healthy": "✓ Dentro del límite",
    "warning": "! Cerca del límite",
    "failed": "✕ Supera el límite"
   },
   "outputLabels": [
    [
     "perHop",
     "Serialización por salto"
    ],
    [
     "totalDelay",
     "Total en todos los saltos"
    ],
    [
     "wireTime",
     "Tiempo en línea con preámbulo + IFG"
    ],
    [
     "wireBytes",
     "Bytes en línea por trama"
    ],
    [
     "frameRate",
     "Tasa máxima de tramas"
    ],
    [
     "l2Throughput",
     "Caudal L2 a velocidad de línea"
    ],
    [
     "efficiency",
     "Eficiencia L2"
    ]
   ]
  }
 }
};
const $ = (id) => document.getElementById(id);
const locale = (document.documentElement.dataset.nelLocale || document.documentElement.lang || "en").toLowerCase();
const currentLang = locale.startsWith("zh") ? "zh" : locale.startsWith("es") ? "es" : "en";
const text = CONFIG.text[currentLang];
const engine = window[CONFIG.engineGlobal];
let lastResult = null;

function readInputs(){
  const values = {};
  for (const field of CONFIG.inputs){
    const node = $(field.id);
    if (!node) continue;
    if (field.type === "int") values[field.id] = /^\s*-?\d+\s*$/.test(node.value) ? Number.parseInt(node.value, 10) : Number.NaN;
    else if (field.type === "number") values[field.id] = node.value.trim() === "" ? Number.NaN : Number(node.value);
    else if (field.type === "select" && field.numeric) values[field.id] = Number(node.value);
    else values[field.id] = node.value;
  }
  return values;
}

function setText(id, value){
  const node = $(id);
  if (node) node.textContent = value;
}

function setStatus(status){
  const card = $("summaryCard");
  if (card) card.className = `summary-card ${status || "healthy"}`;
  const badge = $("healthBadge");
  if (badge) badge.textContent = status ? text.status[status] : "—";
}

function clearResults(){
  lastResult = null;
  for (const id of CONFIG.outputs) setText(id, "—");
  const badge = $("healthBadge");
  if (badge) badge.textContent = "—";
  const card = $("summaryCard");
  if (card) card.className = "summary-card";
}

function markInvalid(ids){
  for (const field of CONFIG.inputs){
    const node = $(field.id);
    if (!node || field.type === "select") continue;
    node.setAttribute("aria-invalid", ids.includes(field.id) ? "true" : "false");
  }
}

// Find which visible fields make the input invalid: a field is to blame when
// putting its default value back makes the engine accept the input.
function invalidFields(values){
  const ids = [];
  for (const field of CONFIG.inputs){
    if (field.type !== "number" && field.type !== "int" && field.type !== "text") continue;
    const node = $(field.id);
    if (!node) continue;
    const wrap = node.closest(".field");
    if (wrap && wrap.hidden) continue;
    const value = values[field.id];
    const blank = field.type === "text" ? String(value).trim() === "" : !Number.isFinite(value);
    const fallback = field.type === "text" ? field.default : Number(field.default);
    if (blank || engine.calculate({...values, [field.id]: fallback}).ok) ids.push(field.id);
  }
  return ids;
}

function validationText(ids){
  if (!ids.length) return text.validation;
  const names = ids.map((id) => `“${text.fieldLabels[id] || id}”`).join(text.listSeparator);
  return text.validationField.replace("{fields}", names);
}

function displayValue(value){
  if (typeof value === "string" && value.startsWith("@")) return (text.notes && text.notes[value.slice(1)]) || "—";
  return value;
}

function calculate(){
  const values = readInputs();
  const result = engine.calculate(values);
  if (!result.ok){
    clearResults();
    const custom = result.error && text.errors && text.errors[result.error];
    const ids = custom ? [] : invalidFields(values);
    markInvalid(ids);
    $("validationMessage").textContent = custom || validationText(ids);
    return;
  }
  markInvalid([]);
  $("validationMessage").textContent = "";
  const display = {};
  for (const [key, value] of Object.entries(result.display)) display[key] = displayValue(value);
  if (result.winner && text.winner) display.winnerText = text.winner[result.winner];
  lastResult = {projectName: ($("projectName").value || "").trim() || "Untitled", display, timestamp: new Date().toISOString()};
  for (const id of CONFIG.outputs) setText(id, display[id] ?? "—");
  if (CONFIG.hasStatus) setStatus(result.status);
  if (typeof window.nelTrack === "function") window.nelTrack(CONFIG.track, {status: result.status || "ok"});
}

// Picking a preset fills the field; the field stays editable.
function applyPresets(){
  for (const preset of CONFIG.presets){
    const select = $(preset.select), target = $(preset.target);
    if (!select || !target) continue;
    target.readOnly = false;
    if (select.value !== "custom") target.value = select.value;
  }
}

// Typing a value selects the matching preset, or Custom when none matches.
function syncPresetFromTarget(preset){
  const select = $(preset.select), target = $(preset.target);
  const typed = Number(target.value);
  const match = target.value.trim() !== "" && Number.isFinite(typed)
    ? [...select.options].find((option) => option.value !== "custom" && Number(option.value) === typed)
    : null;
  select.value = match ? match.value : "custom";
}

function applyModes(){
  for (const mode of CONFIG.modes){
    const select = $(mode.select);
    if (!select) continue;
    for (const [value, ids] of Object.entries(mode.fields)){
      for (const id of ids){
        const node = $(id);
        if (!node) continue;
        const wrap = node.closest(".field");
        if (wrap) wrap.hidden = select.value !== value;
      }
    }
  }
}

function resetForm(){
  $("projectName").value = CONFIG.projectDefault[currentLang];
  for (const field of CONFIG.inputs){
    const node = $(field.id);
    if (node) node.value = field.default;
  }
  applyPresets();
  applyModes();
  calculate();
}

function buildResultText(){
  if (!lastResult) calculate();
  if (!lastResult) return text.validation;
  const lines = [`NetEngineerLab - ${text.toolName}`, `${text.project}: ${lastResult.projectName}`];
  for (const [id, label] of text.outputLabels) lines.push(`${label}: ${lastResult.display[id] ?? "—"}`);
  return lines.join("\n");
}

function temporaryButtonMessage(button, message){
  const old = button.innerHTML;
  button.textContent = message;
  setTimeout(() => { button.innerHTML = old; }, 1400);
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

function getHistory(){
  try { return JSON.parse(localStorage.getItem(CONFIG.historyKey) || "[]"); } catch { return []; }
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}

function renderHistory(){
  const history = getHistory();
  const container = $("historyList");
  if (!history.length){
    container.innerHTML = `<div class="history-empty">${text.noHistory}</div>`;
    return;
  }
  const localeName = currentLang === "zh" ? "zh-CN" : currentLang === "es" ? "es" : "en-US";
  const [firstId, firstLabel] = text.outputLabels[0];
  const [secondId, secondLabel] = text.outputLabels[1];
  container.innerHTML = history.slice(0, 6).map((item) => `<article class="history-item">
      <h3>${escapeHtml(item.projectName || "")}</h3>
      <p>${new Date(item.timestamp).toLocaleString(localeName)}</p>
      <p>${escapeHtml(firstLabel)}: <strong>${escapeHtml(item.display?.[firstId] ?? "")}</strong></p>
      <p>${escapeHtml(secondLabel)}: ${escapeHtml(item.display?.[secondId] ?? "")}</p>
    </article>`).join("");
}

function saveHistory(){
  if (!lastResult) calculate();
  if (!lastResult) return;
  const history = getHistory();
  history.unshift(lastResult);
  localStorage.setItem(CONFIG.historyKey, JSON.stringify(history.slice(0, 12)));
  renderHistory();
  temporaryButtonMessage($("saveBtn"), text.saved);
}

function clearHistory(){
  if (confirm(text.confirmClear)){
    localStorage.removeItem(CONFIG.historyKey);
    renderHistory();
  }
}

for (const preset of CONFIG.presets){
  $(preset.select).addEventListener("change", () => { applyPresets(); calculate(); });
  $(preset.target).addEventListener("input", () => syncPresetFromTarget(preset));
}
for (const mode of CONFIG.modes){
  $(mode.select).addEventListener("change", () => { applyModes(); calculate(); });
}
$("calculateBtn").addEventListener("click", calculate);
$("resetBtn").addEventListener("click", resetForm);
$("copyBtn").addEventListener("click", copyResult);
$("saveBtn").addEventListener("click", saveHistory);
$("printBtn").addEventListener("click", () => window.print());
$("clearHistoryBtn").addEventListener("click", clearHistory);
for (const field of CONFIG.inputs){
  const node = $(field.id);
  if (!node) continue;
  node.addEventListener("input", () => {
    clearTimeout(window.__nelToolTimer);
    window.__nelToolTimer = setTimeout(calculate, 180);
  });
  node.addEventListener("change", calculate);
}

applyPresets();
applyModes();
calculate();
renderHistory();
