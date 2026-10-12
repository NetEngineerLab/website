# Ethernet Cable PoE Voltage Drop Calculator — crosswalk review checkpoint

**Date:** 2026-10-12  
**Primary reviewer:** `/root`  
**Independent reviewer:** `/root/tool002_admission`  
**Disposition:** The prior `NO_ROADMAP_MATCH` is not verifiable. Reclassify to `HYPOTHESIS / UNREVIEWED` for TOOL-002 only; no confirmed mapping or duplicate decision.

## Existing tool scope

The active tool models one-way cable length, PSE voltage, PD load, AWG, pair count, temperature, connector resistance, and efficiency. It calculates loop resistance, current, cable voltage drop, remote voltage, and I²R loss, then checks startup voltage, PoE class/PSE budget, and N-1 behavior. Validation passed: `node website/tools/poe-voltage-drop-calculator/docs/engine-test.js` → `PoE voltage drop engine tests: PASS`.

## Candidate comparison

The only clearly adjacent roadmap candidate is TOOL-002, whose user-confirmed scope is powered-device count, PoE ports, and total/per-port power capacity. Its existing calculator has an estimated cable-loss percentage input but does not calculate length/AWG/temperature-based loop resistance, cable current, remote voltage, or voltage drop. Related broader power candidates have PENDING scopes and cannot be used to infer a match.

The independent reviewer concluded that proximity to TOOL-002 is enough to keep a hypothesis but not enough to confirm a mapping or call the tools wholly unrelated. Do not expand TOOL-002 beyond its confirmed scope and do not infer a duplicate.

## Applied ledger update

The crosswalk now lists TOOL-002 with `mapping_status=HYPOTHESIS`, `overlap_decision=UNREVIEWED`, and `gate_status=NOT_STARTED`. The matrix was not changed. Resolve the row only after authoritative candidate scope establishes whether the PoE capacity problem includes engineering voltage-drop calculations.
