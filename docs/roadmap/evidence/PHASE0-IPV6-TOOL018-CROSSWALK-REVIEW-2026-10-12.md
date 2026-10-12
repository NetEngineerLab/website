# Phase 0 crosswalk review — IPv6 & NAT Planning Calculator

**Date:** 2026-10-12  
**Existing tool:** `ipv6-nat-planner`  
**Candidate:** TOOL-018, IPv6 Prefix Planner  
**Decision:** Retain `HYPOTHESIS / UNREVIEWED`; do not confirm mapping or duplication.

## Source

- `docs/roadmap/PHASE0_AUDIT_MATRIX.csv`, TOOL-018: title is IPv6 Prefix Planner, but the problem statement, inputs, outputs, core logic, target user, and evidence gates remain `PENDING`.
- `website/tools/ipv6-nat-planner/index.html`: describes IPv6 prefix planning alongside NAT44, CGNAT, NAT64, and DNS64 functions.
- `website/tools/ipv6-nat-planner/js/engine.js`: includes `planIPv6`, which plans child prefixes and address ranges, in addition to separate NAT calculations.
- `website/tools/ipv6-nat-planner/docs/engine-test.js`: contains IPv6 prefix planning cases as well as NAT capacity and NAT64 cases. This file was inspected, not run in this review.

## Method

Compared the roadmap candidate title and available domain metadata with the existing page, engine exports, and test cases. The existing tool has clear functional adjacency to prefix planning, while its broader IPv6/NAT scope does not establish the intended boundary of TOOL-018. Missing candidate requirements were not inferred from the existing implementation.

## Validation and conclusion

The evidence supports retaining TOOL-018 as a plausible mapping hypothesis. Because the authoritative candidate fingerprint is absent, it does not establish whether TOOL-018 is a standalone duplicate, a narrower prefix-planning task, or a distinct design problem. No code or calculation behavior changed; no tests were run for this static mapping review.

The crosswalk remains `candidate_roadmap_ids=TOOL-018`, `mapping_status=HYPOTHESIS`, `overlap_decision=UNREVIEWED`, `canonical_problem_id=PENDING`, and `gate_status=NOT_STARTED`. The shared 40-tool reconciliation remains open.
