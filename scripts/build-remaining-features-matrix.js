#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const tools = read("src/registry/tool-registry.json");
const workflows = read("src/registry/workflow-registry.json");
const queue = read("docs/roadmap/DEVELOPMENT_QUEUE_STATE.json");
const supplemental = [...require("./lib/supplemental-tool-slugs")];
const candidates = fs.readFileSync(path.join(root, "docs/roadmap/DEVELOPMENT_CANDIDATES.csv"), "utf8").trim().split(/\r?\n/).slice(1);

function csvParse(line){
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { cells.push(cell); cell = ""; }
    else cell += char;
  }
  cells.push(cell);
  return cells;
}

const activeIds = new Set(tools.map(tool => tool.id));
const names = tools.map(tool => ({
  id: tool.id,
  name: String(tool.translations?.en?.name || tool.id).toLowerCase()
}));
function norm(value){
  return String(value || "").toLowerCase().replace(/calculator|planner|explorer|estimator|generator|analyzer|checker/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
const queueState = new Map();
for (const item of queue.blocked || []) queueState.set(item.id, { status: "BLOCKED", reason: item.reason, at: item.blockedAt });
for (const item of queue.deferred || []) queueState.set(item.id, { status: "DEFERRED", reason: item.reason, at: item.deferredAt });
for (const item of queue.completed || []) queueState.set(item.id, { status: "DONE", reason: item.reason || "", at: item.completedAt || "" });

const candidateRows = candidates.map(line => {
  const cells = csvParse(line);
  const [id, name, , , domain, , phase, priority, , roadmapStatus, existing, , , , , , , , overlap, gate] = cells;
  const queued = queueState.get(id);
  const mappedLive = existing && activeIds.has(existing);
  const normalized = norm(name);
  const nameHit = names.find(tool => {
    const toolName = norm(tool.name);
    return Boolean(normalized) && toolName === normalized;
  });
  let verdict = "UNRESOLVED_CANDIDATE";
  if (queued?.status === "DEFERRED") verdict = "DEFERRED_KEEP";
  else if (queued?.status === "BLOCKED") verdict = "BLOCKED_KEEP";
  else if (overlap === "REJECT_DUPLICATE" || mappedLive) verdict = "DUPLICATE_OR_LIVE_TOOL";
  else if (nameHit) verdict = "LIVE_NAME_MATCH";
  return {
    featureId: id,
    name,
    domain,
    phase,
    priority,
    roadmapStatus,
    existingToolId: existing || "",
    overlapDecision: overlap,
    gateStatus: gate,
    queueStatus: queued?.status || "NOT_IN_QUEUE",
    queueReason: queued?.reason || "",
    queueTimestamp: queued?.at || "",
    nameMatchToolId: verdict === "LIVE_NAME_MATCH" ? nameHit.id : "",
    duplicate: verdict !== "UNRESOLVED_CANDIDATE",
    verdict,
    worthBuildingAsNewTool: verdict === "UNRESOLVED_CANDIDATE"
  };
});

const workflowCapability = {
  "optical-link-design": "navigation",
  "optical-troubleshooting": "navigation",
  "enterprise-lan-ip-planning": "navigation",
  "poe-rack-power-design": "navigation",
  "wireless-access-deployment": "navigation",
  "network-change-automation": "navigation-plus-separate-change-engines",
  "telecom-power-energy": "navigation",
  "data-center-critical-power-cooling": "navigation",
  "access-transport-optimization": "navigation",
  "data-center-network-fabric-planning": "navigation",
  "network-risk-remediation": "navigation",
  "engineering-deliverable-assembly": "navigation-plus-manual-report-import",
  "fiber-latency-planning": "navigation",
  "optical-dispersion-planning": "navigation",
  "layer2-path-design": "navigation",
  "ai-training-fabric-planning": "navigation"
};

const features = [
  {
    featureId: "GATE1-SHARED-WORKFLOW",
    name: "Shared project context, tool result, workflow run and local project store",
    value: "Lets later workflows pass parameters without a second registry or a production database.",
    evidence: ["website/assets/js/workflow/nel-workflow-core.js", "tests/ftth-pon-workflow-v1.test.js"],
    entry: "/workflows/ftth-pon/",
    tools: [],
    duplicate: false,
    dependency: "Existing tool engines and Engineering Report Center remain the calculation and report authorities.",
    allowedModules: ["website/assets/js/workflow/", "website/workflows/", "tests/ftth-pon-workflow-v1.test.js"],
    status: "IMPLEMENTED_LOCAL",
    priority: "P0",
    tests: ["node tests/ftth-pon-workflow-v1.test.js"],
    audit: "UNREVIEWED"
  },
  {
    featureId: "WF-01",
    name: "FTTH/PON engineering workflow V1",
    value: "One optical project can calculate, recalculate, save, restore and report without retyping the same loss and power values.",
    evidence: ["website/assets/js/workflow/ftth-pon-v1.js", "website/workflows/ftth-pon/index.html"],
    entry: "/workflows/ftth-pon/",
    tools: ["fiber-loss", "pon-splitter-loss", "optical-power-budget", "pon-distance", "odf-odn-resource-planner", "onu-rx-power", "engineering-report-batch-export-center"],
    duplicate: false,
    dependency: "GATE1. Does not replace the optical-link-design registry navigation.",
    allowedModules: ["website/assets/js/workflow/ftth-pon-v1.js", "website/workflows/ftth-pon/"],
    status: "IMPLEMENTED_LOCAL",
    priority: "P0",
    tests: ["node tests/ftth-pon-workflow-v1.test.js"],
    audit: "UNREVIEWED"
  },
  ["WF-02", "IP planning workflow", "Address, VLAN, OSPF, summary, bandwidth and uplink checks in one project.", "NOT_STARTED"],
  ["WF-03", "Fault diagnosis workflow", "Symptoms to evidence to a deterministic finding, or UNKNOWN.", "NOT_STARTED"],
  ["WF-04", "Network change workflow product surface", "Offline change planning across ACL, interface/VLAN and the existing change engines.", "PARTIAL_ENGINES_ONLY"],
  ["WF-05", "Telecom power workflow", "Load, battery runtime and N+1 risk in one project report.", "NOT_STARTED"],
  ["WF-06", "Data center workflow", "Network, power, cooling and N-1 capacity in one project report.", "NOT_STARTED"],
  ["GATE3-CHANGEOPS-V2", "Auditable offline change workflow", "Running config through rollback report, with unsupported semantics marked.", "PARTIAL_ENGINES_ONLY"],
  ["GATE4-INTELLIGENCE", "Deterministic network diagnosis", "PON, Ethernet and IP evidence paths. AI cannot change findings.", "NOT_STARTED"],
  ["GATE5-PROJECT-WORKSPACE", "Device library, topology and multi-run workspace", "Local project model beyond a single FTTH workflow.", "PARTIAL_LOCAL_STORE"],
  ["GATE6-PRO", "Pro feature flags and entitlement boundaries", "No payment, account or cloud storage in this slice.", "NOT_STARTED"]
].map(item => Array.isArray(item) ? {
  featureId: item[0], name: item[1], value: item[2], evidence: [], entry: "", tools: [], duplicate: false,
  dependency: "WF-01 local acceptance and an independent audit before the next workflow starts.",
  allowedModules: [], status: item[3], priority: "P1", tests: [], audit: "UNREVIEWED"
} : item);

const matrix = {
  schemaVersion: 1,
  baseline: {
    repository: "NetEngineerLab/website",
    auditedSha: "1c849433e568548c6a7b42d5be4cc4603845caae",
    localPathChecked: "cloud clone of origin/main; Windows D:\\NetEngineerLab-V173-GitHub was not mounted",
    activeTools: tools.length,
    supplementalTools: supplemental,
    activeWorkflows: workflows.length,
    candidates: candidateRows.length
  },
  tools: tools.map(tool => ({
    featureId: tool.id,
    name: tool.translations?.en?.name || tool.id,
    status: "DONE",
    evidence: [`website/tools/${tool.id}/`, `src/registry/tool-registry.json`],
    domain: tool.domain,
    duplicate: false,
    audit: "Existing active registry tool. This audit did not re-sign its historical acceptance."
  })),
  supplemental: supplemental.map(id => ({
    featureId: id,
    name: id,
    status: "DONE_OUTSIDE_REGISTRY",
    evidence: [`website/tools/${id}/`, "scripts/lib/supplemental-tool-slugs.js"],
    duplicate: false,
    audit: "Published outside the 47-tool registry. Not reopened as a new tool."
  })),
  workflows: workflows.map(workflow => ({
    featureId: workflow.id,
    name: workflow.translations?.en?.name || workflow.id,
    status: workflow.id === "optical-link-design" ? "NAVIGATION_PLUS_WF01_LOCAL" : "NAVIGATION_ONLY",
    capability: workflowCapability[workflow.id] || "navigation",
    steps: (workflow.steps || []).map(step => step.toolId),
    parameterSharing: workflow.id === "optical-link-design" ? "WF-01 local project only" : "none",
    persistence: "per-tool browser history where that tool already implemented it; not a shared project",
    report: workflow.id === "engineering-deliverable-assembly" ? "manual import through engineering-report-batch-export-center" : "none",
    evidence: ["src/registry/workflow-registry.json", "website/data/tool-graph.json"]
  })),
  candidates: candidateRows,
  features,
  queuePreserved: queue,
  openPullRequests: [
    { number: 61, head: "cursor/fiber-latency-opb-gaps-71ef", risk: "Do not edit fiber-latency while this PR is open." },
    { number: 59, head: "cursor/chromatic-dispersion-opb-v3-1d77", risk: "Do not edit chromatic dispersion while this PR is open." },
    { number: 52, head: "feature/tool-detail-v3-batch-00-audit", risk: "Documentation audit. No tool migration in this slice." },
    { number: 49, head: "docs/nel-ui-unification-v1-phase0-1", risk: "Documentation audit. No UI unification in this slice." }
  ],
  reused: {
    sharedCore: "website/assets/js/shared-core/canonical-config-model.js is for configuration state, not optical projects. Workflow context is a separate local model.",
    schema: "src/registry/workflow-registry.json remains the navigation registry.",
    validator: "Each existing optical engine keeps its own validator. WF-01 rejects non-finite and unsupported splitter values before calling them.",
    parser: "website/assets/js/domains/running-config and interface-vlan parsers exist for ChangeOps and were not extended.",
    rules: "website/assets/js/rules-engine is present and was not used to invent optical findings.",
    vendorRenderer: "Five vendor renderers exist and were not expanded.",
    exporter: "Engineering Report Center createBundle/toMarkdown is the report exporter.",
    reportCenter: "website/tools/engineering-report-batch-export-center/js/engine.js"
  }
};

const outDir = path.join(root, "docs/roadmap");
fs.writeFileSync(path.join(outDir, "NEL_V2_REMAINING_FEATURES_MATRIX.json"), JSON.stringify(matrix, null, 2));

const counts = candidateRows.reduce((bag, row) => { bag[row.verdict] = (bag[row.verdict] || 0) + 1; return bag; }, {});
const lines = [];
lines.push("# NetEngineerLab V2 remaining features");
lines.push("");
lines.push(`Audited GitHub main \`${matrix.baseline.auditedSha}\`. Active tools: ${tools.length}. Supplemental tools: ${supplemental.length}. Active workflows: ${workflows.length}. Historical candidates: ${candidateRows.length}.`);
lines.push("");
lines.push("Windows `D:\\NetEngineerLab-V173-GitHub` was not available in this environment, so this ledger cannot claim that a local dirty tree was preserved there. The cloud clone of `main` was clean at the audited SHA.");
lines.push("");
lines.push("## What is already real");
lines.push("");
lines.push("All 47 registry tools are `active` and have a `website/tools/<id>/` page. The five supplemental tools are `ip-camera-network-planner`, `application-bandwidth-analyzer`, `data-center-architecture-decision-workshop`, `network-asset-lifecycle-tracker` and `oob-network-design-planner`. They stay outside the registry.");
lines.push("");
lines.push("The 16 workflow registry entries are step lists. Tool pages expose previous and next links through `website/data/tool-graph.json`. That is navigation. It does not share project parameters, rerun a chain, or store one project report. Tool pages that save history use their own `localStorage` keys.");
lines.push("");
lines.push("`network-change-automation` points at ACL and the change planner. Separate ChangeOps engines already exist under `website/assets/js/domains/`, but they are not a six-step product workflow and they do not execute device commands from this site.");
lines.push("");
lines.push("## Candidate dedup");
lines.push("");
lines.push("The old queue file was read and not rewritten. BLOCKED and DEFERRED reasons remain in `docs/roadmap/DEVELOPMENT_QUEUE_STATE.json` and are copied into the JSON ledger under `queuePreserved`.");
lines.push("");
lines.push(`Deferred: ${(queue.deferred || []).map(item => item.id).join(", ") || "none"}.`);
lines.push(`Blocked: ${(queue.blocked || []).map(item => item.id).join(", ") || "none"}.`);
lines.push("Completed queue entries: none.");
lines.push("");
lines.push("| Verdict | Count | Meaning |");
lines.push("| --- | ---: | --- |");
for (const [key, value] of Object.entries(counts)) lines.push(`| ${key} | ${value} | ${key === "UNRESOLVED_CANDIDATE" ? "No live-tool name or id match; still not admission" : "Do not open a new tool for this row"} |`);
lines.push("");
lines.push("A live name match is not a new PASS. It only stops the same shipped calculator from being queued again. Unresolved rows stay unapproved.");
lines.push("");
lines.push("## Open pull requests kept untouched");
lines.push("");
for (const pr of matrix.openPullRequests) lines.push(`- #${pr.number} \`${pr.head}\`: ${pr.risk}`);
lines.push("");
lines.push("## Feature ledger");
lines.push("");
lines.push("| ID | Status | Audit | Value |");
lines.push("| --- | --- | --- | --- |");
for (const feature of features) lines.push(`| ${feature.featureId} | ${feature.status} | ${feature.audit} | ${feature.value} |`);
lines.push("");
lines.push("WF-01 is local implementation evidence only. The developing agent does not sign an independent PASS.");
lines.push("");
lines.push("Full rows, including all 156 candidates and the preserved queue text, are in `NEL_V2_REMAINING_FEATURES_MATRIX.json`.");
fs.writeFileSync(path.join(outDir, "NEL_V2_REMAINING_FEATURES_MATRIX.md"), lines.join("\n") + "\n");
console.log(JSON.stringify({ candidates: candidateRows.length, counts, features: features.length }, null, 2));
