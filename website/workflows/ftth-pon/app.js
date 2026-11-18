(function(){
  "use strict";

  const wf = window.NELFtthPonWorkflow;
  const coreApi = window.NELWorkflow;
  const fields = [
    ["distanceKm", "number"], ["attenuationDbPerKm", "number"], ["spliceCount", "number"], ["spliceLossDb", "number"],
    ["connectorCount", "number"], ["connectorLossDb", "number"], ["splitter1Db", "number"], ["splitter2Db", "number"],
    ["splitter3Db", "number"], ["otherLossDb", "number"], ["marginDb", "number"], ["penaltyDb", "number"],
    ["txMinDbm", "number"], ["txMaxDbm", "number"], ["rxSensitivityDbm", "number"], ["rxOverloadDbm", "number"],
    ["systemReachKm", "number"], ["maxOdnLossDb", "number"], ["targetOnu", "number"], ["stages", "number"],
    ["ratio1", "number"], ["ratio2", "number"], ["ratio3", "number"], ["operatorCap", "number"],
    ["protectionFactor", "number"], ["reservePct", "number"], ["maxCableCores", "number"],
    ["odfTrayCapacity", "number"], ["spliceTrayCapacity", "number"], ["existingOdfPorts", "number"],
    ["existingOdfTrays", "number"], ["existingSpliceTrays", "number"], ["existingFeederCores", "number"],
    ["existingDistributionCores", "number"], ["warningMarginDb", "number"], ["noSignalDbm", "number"]
  ];
  const state = { context: null, run: null };
  const store = coreApi.createProjectStore({
    read(){ try { return localStorage.getItem("nel.ftth.project.v1"); } catch { return null; } },
    write(value){ localStorage.setItem("nel.ftth.project.v1", value); }
  });

  function $(id){ return document.getElementById(id); }
  function note(message, bad){
    const node = $("wf-feedback");
    node.textContent = message;
    node.dataset.state = bad ? "bad" : "ok";
  }
  function numberOrNull(id){
    const raw = $(id).value.trim();
    if (raw === "") return null;
    return Number(raw);
  }
  function readParameters(base){
    const parameters = Object.assign({}, base);
    for (const [id] of fields) parameters[id] = Number($(id).value);
    parameters.measuredRxDbm = numberOrNull("measuredRxDbm");
    parameters.includeStage3InDistanceOther = $("includeStage3InDistanceOther").checked;
    parameters.sameBothDirections = $("sameBothDirections").checked;
    return parameters;
  }
  function writeParameters(parameters){
    for (const [id] of fields) $(id).value = String(parameters[id]);
    $("measuredRxDbm").value = parameters.measuredRxDbm == null ? "" : String(parameters.measuredRxDbm);
    $("includeStage3InDistanceOther").checked = parameters.includeStage3InDistanceOther === true;
    $("sameBothDirections").checked = parameters.sameBothDirections === true;
  }
  function readProject(){
    const base = state.context ? state.context.parameters : wf.exampleProject().parameters;
    return wf.create({
      id: $("projectId").value.trim(),
      name: $("projectName").value.trim(),
      scenario: $("scenario").value.trim(),
      equipmentClass: $("equipmentClass").value.trim(),
      vendor: $("vendor").value.trim(),
      inputSource: "workflow-form",
      parameters: readParameters(base),
      units: wf.UNITS,
      assumptions: wf.exampleProject().assumptions,
      locks: state.context ? state.context.locks : wf.exampleProject().locks,
      updatedAt: new Date().toISOString()
    });
  }
  function render(run){
    const body = $("wf-steps");
    body.replaceChildren();
    for (const step of run.steps) {
      const row = document.createElement("article");
      row.className = "wf-step";
      const title = document.createElement("h3");
      title.textContent = step.toolRun.toolId;
      const status = document.createElement("p");
      status.textContent = step.toolRun.status;
      const list = document.createElement("ul");
      for (const result of step.toolRun.keyResults || []) {
        const item = document.createElement("li");
        item.textContent = `${result.name}: ${result.value == null ? "UNKNOWN" : result.value} ${result.unit || ""}`.trim();
        list.append(item);
      }
      for (const warning of step.toolRun.warnings || []) {
        const item = document.createElement("li");
        item.textContent = warning;
        list.append(item);
      }
      for (const error of step.toolRun.errors || []) {
        const item = document.createElement("li");
        item.textContent = error;
        list.append(item);
      }
      const again = document.createElement("button");
      again.type = "button";
      again.textContent = "Recalculate from here";
      again.addEventListener("click", () => recalculate(step.stepId));
      row.append(title, status, list, again);
      body.append(row);
    }
    const report = wf.buildReport(state.context, run, { owner: $("vendor").value.trim() });
    $("wf-report").value = report.ok ? report.markdown : report.error;
  }
  function calculate(){
    const created = readProject();
    if (!created.ok) { note(created.errors.join(", "), true); return; }
    state.context = created.context;
    const result = wf.run(state.context, { runId: `run-${Date.now()}` });
    if (!result.ok) { note(result.errors.join(", "), true); return; }
    state.run = result.run;
    render(result.run);
    note(result.run.status === "complete" ? "Chain calculated from the current project inputs." : `Chain stopped: ${result.run.abort.code}`);
  }
  function recalculate(fromStepId){
    const created = readProject();
    if (!created.ok) { note(created.errors.join(", "), true); return; }
    if (!state.run) { calculate(); return; }
    state.context = created.context;
    const result = wf.rerun(state.context, state.run, fromStepId);
    if (!result.ok) { note(`${result.error}. Run the full chain so earlier results match the current inputs.`, true); return; }
    state.run = result.run;
    render(result.run);
    note(`Recalculated from ${fromStepId}. Earlier steps were kept because their inputs still match.`);
  }
  function loadExample(){
    const example = wf.exampleProject();
    $("projectId").value = example.id;
    $("projectName").value = example.name;
    $("scenario").value = example.scenario;
    $("equipmentClass").value = example.equipmentClass;
    $("vendor").value = example.vendor;
    writeParameters(example.parameters);
    state.context = null;
    state.run = null;
    $("wf-steps").replaceChildren();
    $("wf-report").value = "";
    note("Example loaded. Calculate to run the optical chain.");
  }
  function saveProject(){
    const created = readProject();
    if (!created.ok) { note(created.errors.join(", "), true); return; }
    state.context = created.context;
    const saved = store.save(state.context, state.run);
    note(saved.ok ? `Saved in this browser at ${saved.savedAt}.` : saved.error, !saved.ok);
  }
  function restoreProject(){
    const restored = store.restore($("projectId").value.trim());
    if (!restored.ok) { note(restored.error, true); return; }
    const projectState = restored.project;
    $("projectName").value = projectState.name;
    $("scenario").value = projectState.scenario;
    $("equipmentClass").value = projectState.equipmentClass;
    $("vendor").value = projectState.vendor;
    writeParameters(projectState.parameters);
    state.context = projectState;
    state.run = restored.run;
    if (restored.run) render(restored.run);
    note(`Restored ${restored.versions.length} local version(s). Review the inputs, then calculate again.`);
  }
  function exportProject(){
    const exported = store.exportDocument();
    if (!exported.ok) { note(exported.error, true); return; }
    download("ftth-pon-project.json", exported.json, "application/json");
  }
  function importProject(file){
    const reader = new FileReader();
    reader.onload = () => {
      const imported = store.importDocument(String(reader.result || ""));
      note(imported.ok ? "Import stored locally. Enter the project id and restore it." : imported.error, !imported.ok);
    };
    reader.readAsText(file);
  }
  function download(name, content, type){
    const link = document.createElement("a");
    const url = URL.createObjectURL(new Blob([content], { type }));
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $("wf-example").addEventListener("click", loadExample);
  $("wf-calculate").addEventListener("click", calculate);
  $("wf-save").addEventListener("click", saveProject);
  $("wf-restore").addEventListener("click", restoreProject);
  $("wf-export").addEventListener("click", exportProject);
  $("wf-import").addEventListener("change", event => {
    const file = event.target.files && event.target.files[0];
    if (file) importProject(file);
  });
  $("wf-report-download").addEventListener("click", () => {
    if ($("wf-report").value) download("ftth-pon-report.md", $("wf-report").value, "text/markdown");
  });
  loadExample();
})();
