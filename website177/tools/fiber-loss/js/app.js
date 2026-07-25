const $ = (id) => document.getElementById(id);

const attenuationMap = {
  "1310": 0.35,
  "1490": 0.30,
  "1550": 0.20
};

const presets = {
  custom: null,
  "gpon-b": {
    budget: 28,
    txPower: 3,
    rxThreshold: -27,
    engineeringMargin: 3
  },
  "gpon-c": {
    budget: 32,
    txPower: 3,
    rxThreshold: -30,
    engineeringMargin: 3
  },
  epon: {
    budget: 30,
    txPower: 3,
    rxThreshold: -27,
    engineeringMargin: 3
  },
  datacenter: {
    budget: 6,
    txPower: -1,
    rxThreshold: -7,
    engineeringMargin: 1.5
  }
};

const translations = {
  zh: {
    brandSubtitle:"网络工程师智能工具平台",navHome:"首页",navCalculator:"计算器",navMethodology:"计算方法",
    navHistory:"历史记录",startCalc:"开始计算",eyebrow:"光通信工程工具",heroTitle:"光纤链路损耗计算器",
    heroCopy:"计算光纤、熔接点、连接器、分光器及其他无源器件造成的链路损耗，同时评估工程余量、接收光功率和链路健康状态。",
    badge1:"实时计算",badge2:"双语界面",badge3:"工程诊断",badge4:"结果导出",linkParams:"链路参数",
    linkParamsHint:"输入实际工程参数，系统将自动计算链路损耗。",scenarioPreset:"工程场景预设",
    presetCustom:"自定义",presetDataCenter:"数据中心短距链路",projectName:"工程名称",distance:"传输距离",
    wavelength:"工作波长",customWavelength:"自定义衰减",attenuation:"光纤衰减系数",spliceCount:"熔接点数量",
    spliceLoss:"单个熔接损耗",connectorCount:"连接器数量",connectorLoss:"单个连接器损耗",
    splitter1:"一级分光器",splitter2:"二级分光器",none:"无",otherLoss:"其他无源损耗",
    engineeringMargin:"工程余量",availableBudget:"可用光功率预算",txPower:"发送光功率",
    rxThreshold:"接收灵敏度门限",pcs:"个",calculateLink:"计算链路",reset:"重置",
    calculationResult:"计算结果",resultHint:"设计损耗包含工程余量；物理损耗不包含工程余量。",
    totalDesignLoss:"总设计损耗",fiberLoss:"光纤损耗",spliceTotal:"熔接损耗",
    connectorTotal:"连接器损耗",splitterOtherLoss:"分光及其他损耗",transmitter:"发送端",
    receiver:"接收端",physicalLoss:"物理链路损耗",budgetRemaining:"剩余预算",
    estimatedRxPower:"预计接收光功率",rxMargin:"接收门限余量",engineeringConclusion:"工程结论",
    copyResult:"复制结果",saveHistory:"保存记录",printReport:"打印 / 导出 PDF",
    projectRecords:"工程记录",historyTitle:"最近计算记录",clearHistory:"清空记录",
    methodTag:"计算方法",methodTitle:"计算方法与工程说明",formulaPhysical:"物理链路损耗",
    formulaPhysicalText:"光纤长度 × 衰减系数 + 熔接损耗 + 连接器损耗 + 分光器损耗 + 其他无源损耗。",
    formulaDesign:"总设计损耗",formulaDesignText:"物理链路损耗 + 工程余量。",
    formulaPower:"接收光功率",formulaPowerText:"发送光功率 − 物理链路损耗。",
    healthRule:"健康状态规则",healthRuleText:"剩余预算 ≥ 3 dB：健康；0–3 dB：风险；小于 0 dB：超限。",
    importantNote:"重要说明",importantNoteText:"默认衰减和分光器损耗属于常用工程参考值。正式设计应以设备规格书、企业标准和现场测试数据为准。",
    footerText:"面向通信与网络工程师的专业在线工具平台。",
    healthy:"✓ 健康",warning:"⚠ 风险",failed:"✕ 超限",
    diagnosisHealthy:"链路预算充足，接收光功率高于门限，当前设计健康。",
    diagnosisWarning:"链路可用，但工程余量偏小。建议检查分光级数、连接器数量及未来老化余量。",
    diagnosisFailed:"链路预算超限或接收功率低于门限。建议检查分光器级联、接头污染、弯曲损耗、熔接质量和传输距离。",
    validation:"请检查输入值：所有损耗、数量和距离必须为有效数字，且不能为负数。",
    copied:"结果已复制",saved:"记录已保存",noHistory:"暂无计算记录。完成计算后点击“保存记录”。",
    confirmClear:"确定清空全部历史记录吗？"
  },
  en: {
    brandSubtitle:"Network Engineering Intelligence Platform",navHome:"Home",navCalculator:"Calculator",navMethodology:"Methodology",
    navHistory:"History",startCalc:"Start calculating",eyebrow:"OPTICAL ENGINEERING TOOL",heroTitle:"Fiber Loss Calculator",
    heroCopy:"Calculate total optical loss from fiber, splices, connectors, splitters and passive components, then evaluate engineering margin, receive power and link health.",
    badge1:"Real-time",badge2:"Bilingual",badge3:"Diagnosis",badge4:"Export results",linkParams:"Link parameters",
    linkParamsHint:"Enter real engineering parameters to calculate the link loss.",scenarioPreset:"Scenario preset",
    presetCustom:"Custom",presetDataCenter:"Data center short-reach",projectName:"Project name",distance:"Transmission distance",
    wavelength:"Wavelength",customWavelength:"Custom attenuation",attenuation:"Fiber attenuation",spliceCount:"Number of splices",
    spliceLoss:"Loss per splice",connectorCount:"Number of connectors",connectorLoss:"Loss per connector",
    splitter1:"Primary splitter",splitter2:"Secondary splitter",none:"None",otherLoss:"Other passive loss",
    engineeringMargin:"Engineering margin",availableBudget:"Available optical budget",txPower:"Transmit power",
    rxThreshold:"Receiver sensitivity",pcs:"pcs",calculateLink:"Calculate link",reset:"Reset",
    calculationResult:"Calculation result",resultHint:"Design loss includes engineering margin; physical loss excludes it.",
    totalDesignLoss:"Total design loss",fiberLoss:"Fiber loss",spliceTotal:"Splice loss",
    connectorTotal:"Connector loss",splitterOtherLoss:"Splitter & other loss",transmitter:"Transmitter",
    receiver:"Receiver",physicalLoss:"Physical link loss",budgetRemaining:"Budget remaining",
    estimatedRxPower:"Estimated receive power",rxMargin:"Receiver margin",engineeringConclusion:"Engineering conclusion",
    copyResult:"Copy result",saveHistory:"Save record",printReport:"Print / Export PDF",
    projectRecords:"PROJECT RECORDS",historyTitle:"Recent calculations",clearHistory:"Clear history",
    methodTag:"METHODOLOGY",methodTitle:"Methodology and engineering notes",formulaPhysical:"Physical link loss",
    formulaPhysicalText:"Fiber length × attenuation + splice loss + connector loss + splitter loss + other passive loss.",
    formulaDesign:"Total design loss",formulaDesignText:"Physical link loss + engineering margin.",
    formulaPower:"Receive power",formulaPowerText:"Transmit power − physical link loss.",
    healthRule:"Health rules",healthRuleText:"Remaining ≥ 3 dB: healthy; 0–3 dB: caution; below 0 dB: failed.",
    importantNote:"Important note",importantNoteText:"Default attenuation and splitter values are common engineering references. Final designs should follow device specifications, enterprise standards and field measurements.",
    footerText:"Professional online tools for telecom and network engineers.",
    healthy:"✓ Healthy",warning:"⚠ Caution",failed:"✕ Failed",
    diagnosisHealthy:"The optical budget is sufficient and receive power remains above the threshold.",
    diagnosisWarning:"The link is usable but has limited engineering margin. Review splitter stages, connector count and ageing allowance.",
    diagnosisFailed:"Budget is exceeded or receive power is below the threshold. Check splitter cascade, connector contamination, bending loss, splice quality and distance.",
    validation:"Please check the inputs. Distances, counts and losses must be valid non-negative numbers.",
    copied:"Result copied",saved:"Record saved",noHistory:"No saved calculations yet. Calculate and click “Save record”.",
    confirmClear:"Clear all saved history?"
  }
};

let currentLang = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh";
let lastResult = null;

const numericIds = [
  "distance","attenuation","spliceCount","spliceLoss","connectorCount",
  "connectorLoss","splitter1","splitter2","otherLoss","engineeringMargin",
  "availableBudget","txPower","rxThreshold"
];

function numberValue(id){
  return Number.parseFloat($(id).value);
}

function updateAttenuation(){
  const wave = $("wavelength").value;
  if (attenuationMap[wave] !== undefined){
    $("attenuation").value = attenuationMap[wave].toFixed(2);
    $("attenuation").readOnly = true;
  } else {
    $("attenuation").readOnly = false;
  }
}

function applyPreset(){
  const preset = presets[$("preset").value];
  if (!preset) return;
  $("availableBudget").value = preset.budget;
  $("txPower").value = preset.txPower;
  $("rxThreshold").value = preset.rxThreshold;
  $("engineeringMargin").value = preset.engineeringMargin;
  calculate();
}

function validate(values){
  // Transmit power and receiver threshold are valid dBm values and may be negative.
  // Distance, counts, loss coefficients, margins and budgets must be non-negative.
  const nonNegativeKeys = [
    "distance", "attenuation", "spliceCount", "spliceLoss",
    "connectorCount", "connectorLoss", "splitter1", "splitter2",
    "otherLoss", "engineeringMargin", "availableBudget"
  ];

  const nonNegativeValuesAreValid = nonNegativeKeys.every((key) =>
    Number.isFinite(values[key]) && values[key] >= 0
  );

  return nonNegativeValuesAreValid
    && Number.isFinite(values.txPower)
    && Number.isFinite(values.rxThreshold);
}

function calculate(){
  const values = {
    distance:numberValue("distance"),
    attenuation:numberValue("attenuation"),
    spliceCount:numberValue("spliceCount"),
    spliceLoss:numberValue("spliceLoss"),
    connectorCount:numberValue("connectorCount"),
    connectorLoss:numberValue("connectorLoss"),
    splitter1:numberValue("splitter1"),
    splitter2:numberValue("splitter2"),
    otherLoss:numberValue("otherLoss"),
    engineeringMargin:numberValue("engineeringMargin"),
    availableBudget:numberValue("availableBudget"),
    txPower:numberValue("txPower"),
    rxThreshold:numberValue("rxThreshold")
  };

  if (!validate(values)){
    $("validationMessage").textContent = translations[currentLang].validation;
    return;
  }
  $("validationMessage").textContent = "";

  const fiberLoss = values.distance * values.attenuation;
  const spliceTotal = values.spliceCount * values.spliceLoss;
  const connectorTotal = values.connectorCount * values.connectorLoss;
  const splitterOtherTotal = values.splitter1 + values.splitter2 + values.otherLoss;
  const physicalLoss = fiberLoss + spliceTotal + connectorTotal + splitterOtherTotal;
  const designLoss = physicalLoss + values.engineeringMargin;
  const budgetRemaining = values.availableBudget - designLoss;
  const estimatedRxPower = values.txPower - physicalLoss;
  const rxMargin = estimatedRxPower - values.rxThreshold;

  let status = "healthy";
  if (budgetRemaining < 0 || rxMargin < 0) status = "failed";
  else if (budgetRemaining < 3 || rxMargin < 3) status = "warning";

  lastResult = {
    projectName:$("projectName").value.trim() || "Untitled",
    timestamp:new Date().toISOString(),
    wavelength:$("wavelength").value,
    ...values,
    fiberLoss,spliceTotal,connectorTotal,splitterOtherTotal,
    physicalLoss,designLoss,budgetRemaining,estimatedRxPower,rxMargin,status
  };

  $("fiberLoss").textContent = fiberLoss.toFixed(2);
  $("spliceTotal").textContent = spliceTotal.toFixed(2);
  $("connectorTotal").textContent = connectorTotal.toFixed(2);
  $("splitterOtherTotal").textContent = splitterOtherTotal.toFixed(2);
  $("fiberLossDiagram").textContent = fiberLoss.toFixed(2) + " dB";
  $("spliceLossDiagram").textContent = spliceTotal.toFixed(2) + " dB";
  $("connectorLossDiagram").textContent = connectorTotal.toFixed(2) + " dB";
  $("physicalLoss").textContent = physicalLoss.toFixed(2);
  $("designLoss").textContent = designLoss.toFixed(2);
  $("budgetRemaining").textContent = budgetRemaining.toFixed(2);
  $("estimatedRxPower").textContent = estimatedRxPower.toFixed(2);
  $("rxMargin").textContent = rxMargin.toFixed(2);

  const summary = $("summaryCard");
  const diagnosis = $("diagnosisBox");
  const badge = $("healthBadge");
  const remainingText = $("budgetRemainingText");
  summary.className = "summary-card " + status;
  diagnosis.className = "diagnosis-box " + status;
  remainingText.className = budgetRemaining >= 3 ? "positive" : budgetRemaining >= 0 ? "caution" : "negative";

  badge.textContent = translations[currentLang][status];
  $("diagnosisText").textContent = translations[currentLang]["diagnosis" + status[0].toUpperCase() + status.slice(1)];
  if (typeof window.nelTrack === "function") {
    window.nelTrack("fiber_calculate", {
      status,
      wavelength: String(lastResult.wavelength),
      design_loss: Number(designLoss.toFixed(2)),
      budget_remaining: Number(budgetRemaining.toFixed(2))
    });
  }
}

function resetForm(){
  $("preset").value = "custom";
  $("projectName").value = "FTTH Optical Link";
  $("distance").value = 20;
  $("wavelength").value = 1550;
  updateAttenuation();
  $("spliceCount").value = 6;
  $("spliceLoss").value = 0.10;
  $("connectorCount").value = 4;
  $("connectorLoss").value = 0.30;
  $("splitter1").value = 0;
  $("splitter2").value = 0;
  $("otherLoss").value = 0;
  $("engineeringMargin").value = 3;
  $("availableBudget").value = 28;
  $("txPower").value = 3;
  $("rxThreshold").value = -27;
  calculate();
}

function buildResultText(){
  if (!lastResult) calculate();
  const r = lastResult;
  if (!r) return translations[currentLang].validation;
  return [
    "NetEngineerLab - Fiber Loss Calculator",
    `${currentLang === "zh" ? "工程" : "Project"}: ${r.projectName}`,
    `${currentLang === "zh" ? "物理链路损耗" : "Physical loss"}: ${r.physicalLoss.toFixed(2)} dB`,
    `${currentLang === "zh" ? "总设计损耗" : "Design loss"}: ${r.designLoss.toFixed(2)} dB`,
    `${currentLang === "zh" ? "剩余预算" : "Budget remaining"}: ${r.budgetRemaining.toFixed(2)} dB`,
    `${currentLang === "zh" ? "预计接收光功率" : "Estimated receive power"}: ${r.estimatedRxPower.toFixed(2)} dBm`,
    `${currentLang === "zh" ? "接收门限余量" : "Receiver margin"}: ${r.rxMargin.toFixed(2)} dB`,
    `${currentLang === "zh" ? "状态" : "Status"}: ${translations[currentLang][r.status]}`
  ].join("\n");
}

async function copyResult(){
  const text = buildResultText();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  temporaryButtonMessage($("copyBtn"), translations[currentLang].copied);
  if (typeof window.nelTrack === "function") window.nelTrack("fiber_copy_result");
}

function temporaryButtonMessage(button, message){
  const old = button.innerHTML;
  button.textContent = message;
  setTimeout(() => button.innerHTML = old, 1400);
}

function getHistory(){
  try {
    return JSON.parse(localStorage.getItem("fiberLossHistory") || "[]");
  } catch {
    return [];
  }
}

function saveHistory(){
  if (!lastResult) calculate();
  if (!lastResult) return;
  const history = getHistory();
  history.unshift(lastResult);
  localStorage.setItem("fiberLossHistory", JSON.stringify(history.slice(0, 12)));
  renderHistory();
  temporaryButtonMessage($("saveBtn"), translations[currentLang].saved);
  if (typeof window.nelTrack === "function") window.nelTrack("fiber_save_history");
}

function renderHistory(){
  const history = getHistory();
  const container = $("historyList");
  if (!history.length){
    container.innerHTML = `<div class="history-empty">${translations[currentLang].noHistory}</div>`;
    return;
  }
  container.innerHTML = history.slice(0,6).map((item) => {
    const date = new Date(item.timestamp);
    return `<article class="history-item">
      <h3>${escapeHtml(item.projectName)}</h3>
      <p>${date.toLocaleString(currentLang === "zh" ? "zh-CN" : "en-US")}</p>
      <p>${currentLang === "zh" ? "总设计损耗" : "Design loss"}: <strong>${item.designLoss.toFixed(2)} dB</strong></p>
      <p>${currentLang === "zh" ? "剩余预算" : "Remaining"}: ${item.budgetRemaining.toFixed(2)} dB</p>
      <p>${translations[currentLang][item.status]}</p>
    </article>`;
  }).join("");
}

function escapeHtml(text){
  return String(text).replace(/[&<>"']/g, (ch) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function clearHistory(){
  if (confirm(translations[currentLang].confirmClear)){
    localStorage.removeItem("fiberLossHistory");
    renderHistory();
  }
}

function setLanguage(lang){
  currentLang = lang;
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  $("langToggle").textContent = lang === "zh" ? "English" : "中文";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[lang][key] !== undefined) element.textContent = translations[lang][key];
  });
  if (lastResult) calculate();
  renderHistory();
}

$("wavelength").addEventListener("change", () => { updateAttenuation(); calculate(); });
$("preset").addEventListener("change", applyPreset);
$("calculateBtn").addEventListener("click", calculate);
$("resetBtn").addEventListener("click", resetForm);
$("copyBtn").addEventListener("click", copyResult);
$("saveBtn").addEventListener("click", saveHistory);
$("printBtn").addEventListener("click", () => { if (typeof window.nelTrack === "function") window.nelTrack("fiber_print_report"); window.print(); });
$("clearHistoryBtn").addEventListener("click", clearHistory);

numericIds.forEach((id) => $(id).addEventListener("input", () => {
  clearTimeout(window.__fiberCalcTimer);
  window.__fiberCalcTimer = setTimeout(calculate, 180);
}));

updateAttenuation();
setLanguage(currentLang);
calculate();
renderHistory();
