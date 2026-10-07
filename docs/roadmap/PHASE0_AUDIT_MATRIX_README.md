# Phase 0 Audit Matrix

This directory contains the Phase 0 reconciliation ledger for the 200 Tools Master Roadmap.

- `PHASE0_AUDIT_MATRIX.csv`: exactly 200 roadmap rows (`TOOL-001`…`TOOL-200`). `existing_tool_id` is populated only for confirmed mappings; `candidate_existing_tool_ids` may contain lightweight hypotheses. `canonical_problem_id` remains `PENDING` until a problem fingerprint is approved.
- `PHASE0_EXISTING_TOOL_CROSSWALK.csv`: exactly 40 active registry rows. `candidate_roadmap_ids` may contain lightweight hypotheses; `mapping_status=CONFIRMED` requires evidence and sign-off.

`candidate_roadmap_ids` is a semicolon-separated multi-mapping field; each ID must be checked against its own matrix row. One existing tool may cover multiple roadmap candidates, and a candidate may not be treated as confirmed unless its matrix row has the corresponding evidence and decision.

`overlap_decision` allowed values: `UNREVIEWED`, `KEEP`, `MERGE`, `REJECT_DUPLICATE`, `NO_OVERLAP`. `gate_status` allowed values: `NOT_STARTED`, `BLOCKED`, `FAIL`, `PASS`; `PASS` requires evidence and reviewer sign-off.

`MERGE` and `REJECT_DUPLICATE` decisions must name the survivor or rejected target in `audit_notes` using `target_roadmap_id=` and/or `target_canonical_problem_id=`; an unqualified decision is invalid. The crosswalk `mapping_status` values are `UNMAPPED`, `HYPOTHESIS`, `CONFIRMED`, and `NO_ROADMAP_MATCH`; `CONFIRMED` requires the same evidence and sign-off rules as a matrix mapping.

The six fingerprint fields are problem, inputs, outputs, core logic, target user, and primary domain (the latter is supplied from the roadmap and must still be checked). Mandatory gate fields are explicit in the CSV: problem definition, inputs/outputs, core logic, source, method, and validation. Six value-evidence fields are provided; at least two must be evidenced before admission. `cross_site_decision` remains pending until network-specific boundary review. No status is inferred from roadmap phase, priority, maturity, Reserved, or Radar state.

## Lightweight active-tool mapping (2026-10-07)
The crosswalk covers all 40 active registry tools. Candidate IDs are hypotheses from registry metadata unless confirmed in the matrix. Nineteen roadmap entries are now confirmed as `REJECT_DUPLICATE` and remain excluded from new development; the remaining hypotheses do not establish duplicate status or admission. Confidence is recorded in audit notes. `NO_ROADMAP_MATCH` records no sufficiently close candidate.

confidence column: HIGH/MEDIUM/LOW/NO_MATCH; lightweight confidence is provisional and requires deep review for confirmation.

## Execution rule after Phase 0
Continue deep audit only for unresolved rows marked `HYPOTHESIS`, `UNREVIEWED`, or `PENDING`. A roadmap row may enter `NEXT`/`READY` only after reconciliation, all Mandatory Gates, and at least two Value Gates pass with reviewer evidence; roadmap phase or priority alone is not authorization.

Rows mapped to an existing tool (`REJECT_DUPLICATE`) are excluded from standalone development. Any enhancement is an upgrade task on the existing tool and must retain `existing_tool_id`, `canonical_problem_id`, existing Source/Method/Validation evidence, a bounded upgrade scope, and explicit regression validation. Do not create a separate roadmap tool for an already covered problem.
