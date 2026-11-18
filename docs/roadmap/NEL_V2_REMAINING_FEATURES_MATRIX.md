# NetEngineerLab V2 remaining features

Audited GitHub main `1c849433e568548c6a7b42d5be4cc4603845caae`. Active tools: 47. Supplemental tools: 5. Active workflows: 16. Historical candidates: 156.

Windows `D:\NetEngineerLab-V173-GitHub` was not available in this environment, so this ledger cannot claim that a local dirty tree was preserved there. The cloud clone of `main` was clean at the audited SHA.

## What is already real

All 47 registry tools are `active` and have a `website/tools/<id>/` page. The five supplemental tools are `ip-camera-network-planner`, `application-bandwidth-analyzer`, `data-center-architecture-decision-workshop`, `network-asset-lifecycle-tracker` and `oob-network-design-planner`. They stay outside the registry.

The 16 workflow registry entries are step lists. Tool pages expose previous and next links through `website/data/tool-graph.json`. That is navigation. It does not share project parameters, rerun a chain, or store one project report. Tool pages that save history use their own `localStorage` keys.

`network-change-automation` points at ACL and the change planner. Separate ChangeOps engines already exist under `website/assets/js/domains/`, but they are not a six-step product workflow and they do not execute device commands from this site.

## Candidate dedup

The old queue file was read and not rewritten. BLOCKED and DEFERRED reasons remain in `docs/roadmap/DEVELOPMENT_QUEUE_STATE.json` and are copied into the JSON ledger under `queuePreserved`.

Deferred: TOOL-004, TOOL-082, TOOL-083.
Blocked: TOOL-005, TOOL-018, TOOL-019, TOOL-020, TOOL-035, TOOL-036, TOOL-037, TOOL-046, TOOL-055, TOOL-057, TOOL-067, TOOL-068, TOOL-069, TOOL-070, TOOL-080, TOOL-081, TOOL-092, TOOL-093, TOOL-101, TOOL-102.
Completed queue entries: none.

| Verdict | Count | Meaning |
| --- | ---: | --- |
| UNRESOLVED_CANDIDATE | 151 | No live-tool name or id match; still not admission |
| LIVE_NAME_MATCH | 5 | Do not open a new tool for this row |

A live name match is not a new PASS. It only stops the same shipped calculator from being queued again. Unresolved rows stay unapproved.

## Open pull requests kept untouched

- #61 `cursor/fiber-latency-opb-gaps-71ef`: Do not edit fiber-latency while this PR is open.
- #59 `cursor/chromatic-dispersion-opb-v3-1d77`: Do not edit chromatic dispersion while this PR is open.
- #52 `feature/tool-detail-v3-batch-00-audit`: Documentation audit. No tool migration in this slice.
- #49 `docs/nel-ui-unification-v1-phase0-1`: Documentation audit. No UI unification in this slice.

## Feature ledger

| ID | Status | Audit | Value |
| --- | --- | --- | --- |
| GATE1-SHARED-WORKFLOW | IMPLEMENTED_LOCAL | UNREVIEWED | Lets later workflows pass parameters without a second registry or a production database. |
| WF-01 | IMPLEMENTED_LOCAL | UNREVIEWED | One optical project can calculate, recalculate, save, restore and report without retyping the same loss and power values. |
| WF-02 | NOT_STARTED | UNREVIEWED | Address, VLAN, OSPF, summary, bandwidth and uplink checks in one project. |
| WF-03 | NOT_STARTED | UNREVIEWED | Symptoms to evidence to a deterministic finding, or UNKNOWN. |
| WF-04 | PARTIAL_ENGINES_ONLY | UNREVIEWED | Offline change planning across ACL, interface/VLAN and the existing change engines. |
| WF-05 | NOT_STARTED | UNREVIEWED | Load, battery runtime and N+1 risk in one project report. |
| WF-06 | NOT_STARTED | UNREVIEWED | Network, power, cooling and N-1 capacity in one project report. |
| GATE3-CHANGEOPS-V2 | PARTIAL_ENGINES_ONLY | UNREVIEWED | Running config through rollback report, with unsupported semantics marked. |
| GATE4-INTELLIGENCE | NOT_STARTED | UNREVIEWED | PON, Ethernet and IP evidence paths. AI cannot change findings. |
| GATE5-PROJECT-WORKSPACE | PARTIAL_LOCAL_STORE | UNREVIEWED | Local project model beyond a single FTTH workflow. |
| GATE6-PRO | NOT_STARTED | UNREVIEWED | No payment, account or cloud storage in this slice. |

WF-01 is local implementation evidence only. The developing agent does not sign an independent PASS.

Full rows, including all 156 candidates and the preserved queue text, are in `NEL_V2_REMAINING_FEATURES_MATRIX.json`.
