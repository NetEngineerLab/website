# 40-row existing-tool crosswalk audit checkpoint

**Date:** 2026-10-12  
**Result:** The inventory pass covered all 40 active tools, but the shared mapping reconciliation is **not closed**. Seventeen rows have existing confirmed mappings; twenty-two hypothesis rows were reviewed and remain unresolved because the linked roadmap candidates lack authoritative problem fingerprints. The TOOL-004 row remains untouched under the user's earlier explicit hold. No mapping was promoted by inference and no candidate was admitted.

## Rule applied

The crosswalk's candidate links are hypotheses until compared against each candidate's authoritative problem, inputs, outputs, core logic, target user, and primary domain. The repository's `PHASE0_AUDIT_MATRIX_README.md` also requires evidence and reviewer sign-off for `CONFIRMED`, `KEEP`, `MERGE`, `REJECT_DUPLICATE`, and `NO_OVERLAP`. A title, an existing implementation's behavior, or `mapping_confidence=NO_MATCH` cannot fill missing candidate scope. `TOOL-004` remains on hold; TOOL-082/083 remain user-deferred.

## All 40 rows

| Existing tool | Candidate link(s) | Ledger status | Audit disposition |
| --- | --- | --- | --- |
| `fiber-loss` | TOOL-067 | HYPOTHESIS / UNREVIEWED | Existing fiber-loss formulas are inspectable; TOOL-067 fingerprint is PENDING. Keep open. |
| `optical-power-budget` | TOOL-054 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `pon-splitter-loss` | TOOL-056 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `onu-rx-power` | TOOL-063 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `pon-distance` | TOOL-064 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `otdr-event` | TOOL-067/068/069 | HYPOTHESIS / UNREVIEWED | OTDR diagnosis has possible loss/margin output overlap; all three candidate fingerprints are PENDING. Keep open. |
| `mtu-calculator` | TOOL-001/013 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusions and existing survivor. |
| `subnet-calculator` | TOOL-017 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `bandwidth-calculator` | TOOL-035 | HYPOTHESIS / UNREVIEWED | Generic rate/capacity calculations are evidenced; WAN-specific candidate scope is PENDING. Keep open. |
| `48v-battery-runtime` | TOOL-181 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `ipv6-nat-planner` | TOOL-018 | HYPOTHESIS / UNREVIEWED | Existing prefix-planning behavior is evidenced; candidate fingerprint is PENDING. Keep open. |
| `wifi-coverage-capacity-planner` | TOOL-082/083 | HYPOTHESIS / UNREVIEWED | Existing Wi-Fi coverage/capacity scope is evidenced; cellular candidate definitions are PENDING and remain user-deferred. Keep open. |
| `poe-power-budget-calculator` | TOOL-002 | CONFIRMED / KEEP | User-confirmed PoE count/ports/power scope is covered; independent duplicate decision is recorded. |
| `sfp-qsfp-compatibility-calculator` | TOOL-067/068/069 | HYPOTHESIS / UNREVIEWED | Module compatibility includes some loss/margin calculations; candidate boundaries are PENDING. Keep open. |
| `wireless-link-budget-calculator` | TOOL-080/081 | HYPOTHESIS / UNREVIEWED | Existing wireless link-budget behavior is inspectable; the two candidate fingerprints are PENDING. Keep open. |
| `poe-voltage-drop-calculator` | TOOL-002 | HYPOTHESIS / UNREVIEWED | It calculates cable electrical drop; TOOL-002's confirmed scope is device count, ports, and power with a scalar cable-loss allowance. No duplicate decision is supported. Keep open pending explicit boundary sign-off. |
| `network-rack-power-cooling-calculator` | TOOL-186 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `vlan-ip-capacity-planner` | TOOL-008/020 | HYPOTHESIS / UNREVIEWED | Existing VLAN/IP capacity functions are evidenced; both candidate fingerprints are PENDING. Keep open. |
| `switch-uplink-oversubscription-calculator` | TOOL-004 | HYPOTHESIS / UNREVIEWED | Explicitly not functionally reviewed under the user's prior hold. Do not close this row without resolving that hold and obtaining TOOL-004 scope. |
| `dns-ttl-propagation-calculator` | TOOL-045 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `acl-generator-validator` | TOOL-149/164 | HYPOTHESIS / UNREVIEWED | Generator and validator capabilities are evidenced; candidate vendor/rule/conflict definitions are PENDING. Keep open. |
| `network-change-planner-mop-generator` | TOOL-152 | HYPOTHESIS / UNREVIEWED | Existing LAG/VLAN change workflow is evidenced; TOOL-152's precheck boundary is PENDING. Keep open. |
| `pue-data-center-energy-efficiency` | TOOL-177 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `telecom-solar-battery-sizing-calculator` | TOOL-181 | HYPOTHESIS / UNREVIEWED | Existing solar/battery sizing is evidenced; TOOL-181 scope is PENDING and another existing tool is already recorded as survivor. Keep open. |
| `generator-fuel-runtime-calculator` | TOOL-184 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `telecom-rectifier-dc-power-sizing` | TOOL-182 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `telecom-ac-dc-breaker-sizing` | TOOL-182 | HYPOTHESIS / UNREVIEWED | Existing breaker, conductor, drop, fault and N-1 checks are evidenced; TOOL-182 boundaries are PENDING. Keep open. |
| `ups-capacity-battery-runtime-calculator` | TOOL-179/180 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusions and existing survivor. |
| `data-center-cooling-load-calculator` | TOOL-185 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `dc-plant-efficiency-load-sharing` | TOOL-182/183 | HYPOTHESIS / UNREVIEWED | Measured load-sharing/efficiency and redundancy behavior is evidenced; candidate definitions are PENDING. Keep open. |
| `data-center-airflow-containment-planner` | TOOL-185 | HYPOTHESIS / UNREVIEWED | Airflow/containment behavior is evidenced; TOOL-185 boundary is PENDING. Keep open. |
| `generator-ups-transfer-ride-through-planner` | TOOL-184/180 | HYPOTHESIS / UNREVIEWED | Combined transfer and ride-through behavior is evidenced; candidate definitions are PENDING. Keep open. |
| `transmission-ring-optimization-risk-analyzer` | TOOL-077/078 | HYPOTHESIS / UNREVIEWED | Ring failure/load analysis is evidenced; capacity/protection candidate definitions are PENDING. Keep open. |
| `olt-dual-uplink-transport-mse-planner` | TOOL-061/060 | HYPOTHESIS / UNREVIEWED | OLT traffic, dual uplinks, transport channels and MSE ports are evidenced; candidate boundaries are PENDING. Keep open. |
| `data-center-network-convergence-fabric-capacity-planner` | TOOL-104/100 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusions and existing survivor. |
| `network-risk-hidden-hazard-assessment-generator` | TOOL-175 | HYPOTHESIS / UNREVIEWED | Existing facility/operational risk coverage is evidenced; attack-surface candidate scope is PENDING. Keep open. |
| `odf-odn-resource-planner` | TOOL-062/065 | HYPOTHESIS / UNREVIEWED | Existing PON/ODF resource and loss-check behavior is evidenced; candidate definitions are PENDING. Keep open. |
| `ospf-cost-calculator` | TOOL-021 | CONFIRMED / KEEP | Candidate ledger confirms duplicate exclusion and existing survivor. |
| `network-capacity-forecast-planner` | TOOL-162 | HYPOTHESIS / UNREVIEWED | Existing utilization/growth forecasting is evidenced; TOOL-162's distinct scope is PENDING. Keep open. |
| `engineering-report-batch-export-center` | TOOL-152/163 | HYPOTHESIS / UNREVIEWED | Existing report/MOP/export and provenance outputs are evidenced; precheck/RCA candidate boundaries are PENDING. Keep open. |

## Findings

- Inventory count: 40 rows = 17 `CONFIRMED` + 23 `HYPOTHESIS`; no `UNMAPPED` or `NO_ROADMAP_MATCH` rows.
- For each candidate linked from the 17 confirmed rows, the matrix points back to the same existing tool and records `REJECT_DUPLICATE`; the crosswalk's `canonical_problem_id` identifies its primary retained problem. A few existing tools support multiple distinct canonical problems, so a secondary candidate's canonical ID can differ from that primary crosswalk field. This audit did not re-run each tool's engineering tests.
- The 23 hypotheses expand to 31 distinct candidate IDs. Repository scope review found 30 candidate definitions incomplete across problem, inputs, outputs, or core logic; TOOL-002 is defined and already resolved as a duplicate. Candidate definitions are still required to decide most overlapping hypotheses.
- Twenty-two hypothesis rows were checked row by row against the available existing-tool evidence and candidate-definition completeness in this pass; none received a signed mapping decision. TOOL-004 remains explicitly unreviewed. Thus the shared reconciliation is still open and **no other candidate can enter admission or implementation**.
- TOOL-055 clarification: the crosswalk's confirmed mapping is `optical-power-budget → TOOL-054`; TOOL-055's candidate association and overlap decision remain unreviewed.
- No crosswalk or master-matrix row was changed in this audit. The earlier task records for TOOL-036/037/046/070 were corrected to use actual matrix field names; TOOL-055 was clarified to distinguish the TOOL-054 mapping from TOOL-055's unresolved association.

## Independent review

Pending: an agent that did not prepare this report must check all 40 row counts, the 17/23 breakdown, the 22 reviewed hypothesis dispositions, the TOOL-004 hold, and the cited ledger consistency before this checkpoint is accepted.

## Next evidence needed

1. Authoritative problem fingerprints and source/method/validation for the unresolved linked candidates (especially the 30 incomplete definitions).
2. A decision from the user on whether the explicit TOOL-004 hold remains in force under the new request to close all 40 rows.
3. Independent review after candidate definitions are supplied; only then can the crosswalk rows be changed to signed mapping conclusions and the shared prerequisite closed.
