const CONFIG = {
 "engineGlobal": "NELStpPathCostEngine",
 "historyKey": "stpPathCostHistory",
 "track": "stp_path_cost_calculate",
 "hasStatus": true,
 "projectDefault": {
  "en": "Distribution redundancy check",
  "zh": "汇聚层冗余检查",
  "es": "Revisión de redundancia de distribución"
 },
 "inputs": [
  {
   "id": "method",
   "type": "select",
   "numeric": false,
   "default": "long"
  },
  {
   "id": "pathA",
   "type": "text",
   "numeric": false,
   "default": "10000, 10000"
  },
  {
   "id": "pathB",
   "type": "text",
   "numeric": false,
   "default": "1000"
  }
 ],
 "presets": [],
 "modes": [],
 "outputs": [
  "totalA",
  "totalB",
  "costsA",
  "costsB",
  "difference",
  "winnerText"
 ],
 "text": {
  "en": {
   "validation": "Check the highlighted inputs: values must be numbers within the allowed range.",
   "copied": "Result copied",
   "saved": "Record saved",
   "noHistory": "No saved calculations yet. Calculate and click “Save record”.",
   "confirmClear": "Clear all saved history?",
   "project": "Project",
   "toolName": "STP Path Cost Calculator",
   "status": {
    "healthy": "✓ Path selected",
    "warning": "! Equal cost",
    "failed": "✕"
   },
   "outputLabels": [
    [
     "totalA",
     "Path A root path cost"
    ],
    [
     "totalB",
     "Path B root path cost"
    ],
    [
     "costsA",
     "Path A port costs"
    ],
    [
     "costsB",
     "Path B port costs"
    ],
    [
     "difference",
     "Cost difference"
    ],
    [
     "winnerText",
     "Preferred path"
    ]
   ],
   "winner": {
    "A": "Path A",
    "B": "Path B",
    "tie": "Tie – bridge ID decides"
   },
   "errors": {
    "short-undefined": "The short method only defines 4, 10, 16, 100, 1000 and 10000 Mbps. Switch to the long method for other speeds."
   }
  },
  "zh": {
   "validation": "请检查标出的输入：数值必须在允许范围内。",
   "copied": "结果已复制",
   "saved": "记录已保存",
   "noHistory": "暂无计算记录。完成计算后点击“保存记录”。",
   "confirmClear": "确定清空全部历史记录吗？",
   "project": "工程",
   "toolName": "STP 路径开销计算器",
   "status": {
    "healthy": "✓ 已确定路径",
    "warning": "! 开销相同",
    "failed": "✕"
   },
   "outputLabels": [
    [
     "totalA",
     "路径 A 根路径开销"
    ],
    [
     "totalB",
     "路径 B 根路径开销"
    ],
    [
     "costsA",
     "路径 A 端口开销"
    ],
    [
     "costsB",
     "路径 B 端口开销"
    ],
    [
     "difference",
     "开销差值"
    ],
    [
     "winnerText",
     "优选路径"
    ]
   ],
   "winner": {
    "A": "路径 A",
    "B": "路径 B",
    "tie": "相同——由网桥 ID 决定"
   },
   "errors": {
    "short-undefined": "短开销仅定义 4、10、16、100、1000、10000 Mbps，其他速率请改用长开销。"
   }
  },
  "es": {
   "validation": "Revise los datos marcados: deben ser números dentro del rango permitido.",
   "copied": "Resultado copiado",
   "saved": "Registro guardado",
   "noHistory": "Aún no hay cálculos guardados. Calcule y pulse “Guardar registro”.",
   "confirmClear": "¿Borrar todo el historial guardado?",
   "project": "Proyecto",
   "toolName": "Calculadora de coste de ruta STP",
   "status": {
    "healthy": "✓ Ruta seleccionada",
    "warning": "! Coste igual",
    "failed": "✕"
   },
   "outputLabels": [
    [
     "totalA",
     "Coste de ruta raíz A"
    ],
    [
     "totalB",
     "Coste de ruta raíz B"
    ],
    [
     "costsA",
     "Costes de puerto A"
    ],
    [
     "costsB",
     "Costes de puerto B"
    ],
    [
     "difference",
     "Diferencia de coste"
    ],
    [
     "winnerText",
     "Ruta preferida"
    ]
   ],
   "winner": {
    "A": "Ruta A",
    "B": "Ruta B",
    "tie": "Empate: decide el ID de puente"
   },
   "errors": {
    "short-undefined": "El método corto solo define 4, 10, 16, 100, 1000 y 10000 Mbps. Use el método largo para otras velocidades."
   }
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

function markInvalid(invalid){
  for (const field of CONFIG.inputs){
    const node = $(field.id);
    if (!node || field.type === "select") continue;
    node.setAttribute("aria-invalid", invalid ? "true" : "false");
  }
}

function calculate(){
  const values = readInputs();
  const result = engine.calculate(values);
  if (!result.ok){
    clearResults();
    markInvalid(true);
    $("validationMessage").textContent = (result.error && text.errors && text.errors[result.error]) || text.validation;
    return;
  }
  markInvalid(false);
  $("validationMessage").textContent = "";
  const display = {...result.display};
  if (result.winner && text.winner) display.winnerText = text.winner[result.winner];
  lastResult = {projectName: ($("projectName").value || "").trim() || "Untitled", display, timestamp: new Date().toISOString()};
  for (const id of CONFIG.outputs) setText(id, display[id] ?? "—");
  if (CONFIG.hasStatus) setStatus(result.status);
  if (typeof window.nelTrack === "function") window.nelTrack(CONFIG.track, {status: result.status || "ok"});
}

function applyPresets(){
  for (const preset of CONFIG.presets){
    const select = $(preset.select), target = $(preset.target);
    if (!select || !target) continue;
    if (select.value === "custom"){ target.readOnly = false; continue; }
    target.value = select.value;
    target.readOnly = true;
  }
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
  $(preset.target).addEventListener("input", () => { $(preset.select).value = "custom"; $(preset.target).readOnly = false; });
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
