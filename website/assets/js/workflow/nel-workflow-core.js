(function(root, factory){
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NELWorkflow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(){
  "use strict";

  const PROJECT_SCHEMA = "nel-project-context/1";
  const RUN_SCHEMA = "nel-workflow-run/1";
  const RESULT_SCHEMA = "nel-tool-result/1";
  const STORE_SCHEMA = "nel-project-store/1";

  function isPlainObject(value){
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function toolResult(spec){
    const errors = Array.isArray(spec.errors) ? spec.errors.slice() : [];
    const ok = spec.ok !== false && errors.length === 0;
    return {
      schemaVersion: RESULT_SCHEMA,
      ok,
      toolId: spec.toolId,
      calculationVersion: spec.calculationVersion || "existing-engine",
      status: spec.status || (ok ? "success" : "failed"),
      units: spec.units || {},
      keyResults: spec.keyResults || [],
      assumptions: spec.assumptions || [],
      warnings: spec.warnings || [],
      errors,
      evidence: spec.evidence || [],
      inputs: spec.inputs,
      outputs: spec.outputs == null ? null : spec.outputs,
      source: spec.source || "user-project"
    };
  }

  function createProject(fields){
    if (!isPlainObject(fields)) return { ok: false, error: "project-context-invalid" };
    const context = {
      schemaVersion: PROJECT_SCHEMA,
      id: String(fields.id || ""),
      name: String(fields.name || "").trim(),
      scenario: String(fields.scenario || "").trim(),
      equipmentClass: String(fields.equipmentClass || "").trim(),
      vendor: String(fields.vendor || "").trim(),
      parameters: isPlainObject(fields.parameters) ? clone(fields.parameters) : null,
      units: isPlainObject(fields.units) ? clone(fields.units) : {},
      assumptions: Array.isArray(fields.assumptions) ? fields.assumptions.slice() : [],
      inputSource: String(fields.inputSource || "user"),
      updatedAt: fields.updatedAt || null,
      locks: isPlainObject(fields.locks) ? clone(fields.locks) : {}
    };
    if (!context.id || !context.name || !context.parameters) return { ok: false, error: "project-context-invalid" };
    return { ok: true, context };
  }

  function proposeParameter(context, field, value, proposal){
    if (!isPlainObject(context) || !isPlainObject(context.parameters) || !isPlainObject(proposal)) {
      return { ok: false, error: "proposal-invalid" };
    }
    const source = proposal.source || "derived";
    const lockedByUser = context.locks[field] === "user";
    if (lockedByUser && source !== "user" && proposal.confirm !== true) {
      return { ok: false, error: "user-input-protected", field, previous: context.parameters[field] };
    }
    const next = clone(context);
    next.parameters[field] = value;
    next.locks[field] = source === "user" ? "user" : "derived";
    next.updatedAt = proposal.updatedAt || next.updatedAt;
    next.assumptions = next.assumptions.concat(proposal.note ? [proposal.note] : []);
    return { ok: true, context: next };
  }

  function skippedResult(step, reason){
    return toolResult({
      ok: true,
      toolId: step.toolId,
      status: "not-run",
      errors: [],
      warnings: [reason],
      inputs: null,
      outputs: null,
      assumptions: ["This step did not run because an earlier required step stopped the workflow."]
    });
  }

  function executeSteps(definition, context, startIndex, kept){
    const steps = [];
    let abort = null;
    for (let index = 0; index < definition.steps.length; index += 1) {
      const step = definition.steps[index];
      if (index < startIndex) {
        steps.push(kept[index]);
        continue;
      }
      if (abort) {
        steps.push({ stepId: step.id, toolRun: skippedResult(step, abort.code) });
        continue;
      }
      let toolRun;
      try {
        toolRun = step.run(context);
      } catch (error) {
        toolRun = toolResult({
          ok: false,
          toolId: step.toolId,
          status: "failed",
          errors: [error && error.message ? error.message : "step-threw"],
          inputs: null
        });
      }
      if (!toolRun || toolRun.schemaVersion !== RESULT_SCHEMA) {
        toolRun = toolResult({ ok: false, toolId: step.toolId, status: "failed", errors: ["tool-result-invalid"], inputs: null });
      }
      steps.push({ stepId: step.id, toolRun });
      if (step.required !== false && toolRun.ok === false) {
        abort = { stepId: step.id, code: toolRun.errors[0] || toolRun.status || "step-failed" };
      }
    }
    const ran = steps.filter(item => item.toolRun.status !== "not-run");
    return {
      schemaVersion: RUN_SCHEMA,
      id: definition.runId || `run-${Date.now()}`,
      workflowId: definition.id,
      projectId: context.id,
      startedAt: definition.startedAt || new Date().toISOString(),
      status: abort ? "aborted" : "complete",
      steps,
      abort,
      summary: {
        stepCount: steps.length,
        ran: ran.length,
        failed: steps.filter(item => item.toolRun.ok === false).length,
        unknown: steps.filter(item => item.toolRun.status === "UNKNOWN").length
      }
    };
  }

  function runWorkflow(definition, context){
    if (!definition || !Array.isArray(definition.steps) || !context || context.schemaVersion !== PROJECT_SCHEMA) {
      return { ok: false, error: "workflow-input-invalid" };
    }
    return { ok: true, run: executeSteps(definition, context, 0, []) };
  }

  function rerunFrom(definition, context, previousRun, fromStepId){
    if (!previousRun || previousRun.schemaVersion !== RUN_SCHEMA) return { ok: false, error: "previous-run-invalid" };
    const index = definition.steps.findIndex(step => step.id === fromStepId);
    if (index < 0) return { ok: false, error: "step-not-found" };
    if (!previousRun.steps || previousRun.steps.length !== definition.steps.length) return { ok: false, error: "previous-run-invalid" };
    for (let cursor = 0; cursor < index; cursor += 1) {
      const prior = previousRun.steps[cursor];
      if (!prior || prior.toolRun.status === "not-run" || prior.toolRun.ok === false) {
        return { ok: false, error: "cannot-resume", stepId: definition.steps[cursor].id };
      }
      const fresh = definition.steps[cursor].run(context);
      if (JSON.stringify(fresh.inputs) !== JSON.stringify(prior.toolRun.inputs)) {
        return { ok: false, error: "upstream-inputs-changed", stepId: definition.steps[cursor].id };
      }
    }
    return { ok: true, run: executeSteps(definition, context, index, previousRun.steps) };
  }

  function createMemoryStorage(initial){
    let value = initial == null ? null : String(initial);
    return {
      read(){ return value; },
      write(next){ value = String(next); }
    };
  }

  function emptyStore(){
    return { schemaVersion: STORE_SCHEMA, projects: [] };
  }

  function loadStore(raw){
    if (raw == null || raw === "") return { ok: true, store: emptyStore() };
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return { ok: false, error: "store-corrupt" }; }
    if (!parsed || parsed.schemaVersion !== STORE_SCHEMA || !Array.isArray(parsed.projects)) {
      return { ok: false, error: "store-schema-invalid" };
    }
    return { ok: true, store: parsed };
  }

  function createProjectStore(storage){
    function read(){
      return loadStore(storage.read());
    }
    function write(store){
      storage.write(JSON.stringify(store));
      return store;
    }
    return {
      read,
      save(project, run){
        const loaded = read();
        if (!loaded.ok) return loaded;
        if (!project || project.schemaVersion !== PROJECT_SCHEMA) return { ok: false, error: "project-context-invalid" };
        const store = loaded.store;
        const savedAt = new Date().toISOString();
        const version = { savedAt, context: clone(project), runId: run ? run.id : null };
        const existing = store.projects.find(item => item.id === project.id);
        if (existing) {
          existing.name = project.name;
          existing.savedAt = savedAt;
          existing.context = clone(project);
          existing.lastRun = run ? clone(run) : existing.lastRun || null;
          existing.versions = [version].concat(existing.versions || []).slice(0, 20);
        } else {
          store.projects.unshift({
            id: project.id,
            name: project.name,
            savedAt,
            context: clone(project),
            lastRun: run ? clone(run) : null,
            versions: [version]
          });
        }
        write(store);
        return { ok: true, savedAt, store };
      },
      restore(projectId){
        const loaded = read();
        if (!loaded.ok) return loaded;
        const project = loaded.store.projects.find(item => item.id === projectId);
        if (!project) return { ok: false, error: "project-not-found" };
        return { ok: true, project: clone(project.context), run: project.lastRun ? clone(project.lastRun) : null, versions: clone(project.versions || []) };
      },
      exportDocument(){
        const loaded = read();
        if (!loaded.ok) return loaded;
        return { ok: true, json: JSON.stringify(loaded.store) };
      },
      importDocument(json){
        const loaded = loadStore(json);
        if (!loaded.ok) return loaded;
        write(loaded.store);
        return { ok: true, store: loaded.store };
      }
    };
  }

  function reportRecords(run){
    return run.steps
      .filter(step => step.toolRun && step.toolRun.status !== "not-run")
      .map(step => ({
        id: step.stepId,
        tool: step.toolRun.toolId,
        status: step.toolRun.status,
        generatedAt: run.startedAt,
        sourceUrl: "",
        inputs: step.toolRun.inputs,
        result: {
          status: step.toolRun.status,
          keyResults: step.toolRun.keyResults,
          assumptions: step.toolRun.assumptions,
          warnings: step.toolRun.warnings,
          errors: step.toolRun.errors,
          outputs: step.toolRun.outputs
        }
      }));
  }

  return {
    PROJECT_SCHEMA,
    RUN_SCHEMA,
    RESULT_SCHEMA,
    STORE_SCHEMA,
    toolResult,
    createProject,
    proposeParameter,
    runWorkflow,
    rerunFrom,
    createMemoryStorage,
    createProjectStore,
    reportRecords
  };
});
