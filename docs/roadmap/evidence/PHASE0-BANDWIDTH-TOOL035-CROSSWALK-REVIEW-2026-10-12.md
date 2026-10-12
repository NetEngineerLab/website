# Phase 0 crosswalk review — Bandwidth & Transfer Time Calculator

**Date:** 2026-10-12  
**Existing tool:** `bandwidth-calculator`  
**Candidate:** TOOL-035, WAN Bandwidth Sizing Calculator  
**Decision:** Retain `HYPOTHESIS / UNREVIEWED`; do not confirm mapping or duplication.

## Source

- `docs/roadmap/PHASE0_AUDIT_MATRIX.csv`, TOOL-035: candidate title and domain are WAN / SD-WAN / SASE, while problem statement, inputs, outputs, core logic, target user, and evidence gates remain `PENDING`.
- `website/tools/bandwidth-calculator/index.html`: describes bandwidth, transfer time, required link rate, concurrent-user capacity, and data-volume calculations; FAQ says it is not a traffic-engineering model and calls out QoS, traffic distribution, and peak-hour behavior as needing validation.
- `website/tools/bandwidth-calculator/js/engine.js`: exposes deterministic transfer-time, required-bandwidth, concurrent-capacity, and data-volume calculations using link rate, utilization/efficiency, burst, target users, file size and transfer settings.
- `website/tools/bandwidth-calculator/docs/engine-test.js`: existing tests cover representative transfer-time, required-rate, concurrent-user and data-volume calculations.

## Method

Compared the candidate’s available roadmap metadata with the existing page, engine functions, FAQ boundary, and local engine test. The review does not treat the existing implementation as a substitute for missing TOOL-035 requirements. The functions suggest possible overlap with generic required-rate and concurrent-capacity calculations, while the candidate title implies a WAN-specific scope that has not been defined.

## Validation and conclusion

The source artifacts establish what the existing tool calculates, but the roadmap candidate does not specify its problem fingerprint. Without authoritative TOOL-035 inputs, outputs, and core logic, it is not possible to determine whether it is a duplicate, a WAN-specific extension, or an independent task. No implementation or calculation behavior changed, so no tests were run for this static mapping review; the existing engine test file was inspected as validation evidence only.

The crosswalk remains `candidate_roadmap_ids=TOOL-035`, `mapping_status=HYPOTHESIS`, `overlap_decision=UNREVIEWED`, `canonical_problem_id=PENDING`, and `gate_status=NOT_STARTED`. The shared 40-tool reconciliation remains open.
