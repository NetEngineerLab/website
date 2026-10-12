# TOOL-002 ↔ PoE Power Budget Calculator — independently reviewed duplicate decision

**Date:** 2026-10-11  
**Prepared by:** `/root`  
**Independent reviewer:** `/root/tool002_admission` — PASS for this mapping decision only; no implementation admission  
**Decision:** Approved duplicate exclusion for TOOL-002. The matrix, crosswalk, duplicate archive, and pending-candidate view have been updated. This is not implementation admission or completion of an existing tool.

## Authoritative scope confirmation

The user confirmed the candidate scope in this conversation: **“PoE 设备容量：只计算 PoE 设备数量、端口和功率；与现有 PoE 工具重复或合并”** (PoE device capacity: calculate only powered-device count, ports, and power; duplicate or merge with the existing PoE tool).

This resolves the prior ambiguity in the TOOL-002 title. No new general Ethernet port inventory or uplink-capacity scope is included.

## Existing implementation coverage

The existing `poe-power-budget-calculator` covers the confirmed scope:

- `website/tools/poe-power-budget-calculator/index.html:71-82` describes PoE switch sizing and provides inputs for PoE-capable ports, powered-device count, maximum watts per device, PoE standard, cable loss, and headroom.
- `website/tools/poe-power-budget-calculator/index.html:83-91` explains the port-count limit and PoE device planning constraints.
- `website/tools/poe-power-budget-calculator/js/engine.js:5-38` defines the per-standard power limits, computes source watts and required budget, checks device count against PoE ports, and limits supported devices by both available ports and watts.
- `website/tools/poe-power-budget-calculator/docs/engine-test.js` covers a passing design, port over-capacity, per-port standard failure, and power-budget failure. The test command passed during this review: `node website/tools/poe-power-budget-calculator/docs/engine-test.js` → `PASS: PoE power budget engine`.

The candidate's confirmed scope is therefore fully covered by the active existing calculator. Its existing page is the survivor; no upgrade scope has been identified.

## Applied TOOL-002 matrix row

The following values were applied after independent review passed:

| Field | Proposed value |
|---|---|
| `existing_tool_id` | `poe-power-budget-calculator` |
| `candidate_existing_tool_ids` | empty |
| `canonical_problem_id` | `CP-POE-SWITCH-CAPACITY-001` |
| `problem_statement` | Determine whether a deployment of PoE powered devices fits the available PoE-capable switch ports, total PoE power budget, and per-port PoE standard limits. |
| `primary_domain` | `Ethernet / Switching` (existing candidate classification retained) |
| `inputs` | PoE-capable port count; switch PoE budget; powered-device count; maximum watts per device; per-port PoE standard; estimated cable-loss percentage; engineering headroom percentage. |
| `outputs` | Device load and source watts per device; required switch budget; remaining budget and utilization; maximum supported device count; port, budget, and per-port-standard checks; overall status. |
| `core_logic` | Adjust PD demand by cable-loss allowance; multiply by device count; add headroom; compare with total budget, compare device count with PoE ports, compare per-device demand with selected standard; maximum supported count is bounded by both port count and available budget. |
| `target_user` | Network engineers sizing PoE switches for powered devices such as cameras, wireless access points, phones, and access-control equipment. |
| `overlap_decision` / `gate_status` | `REJECT_DUPLICATE` / `FAIL`; FAIL means the standalone candidate is rejected because the existing tool covers its confirmed scope. |
| `problem_is_defined` | `EVIDENCED: User scope confirmation in this conversation (2026-10-11); existing page defines PoE switch sizing for powered devices (index.html:71, 88-91).` |
| `inputs_outputs_are_explicit` | `EVIDENCED: index.html:76-85 lists budget, PoE ports, device count, device watts, PoE standard, cable loss, headroom, and result metrics.` |
| `core_logic_is_defined` | `EVIDENCED: js/engine.js:15-38 computes source/load watts, budget, port and standard checks, maximum supported devices, and status.` |
| `source_is_verifiable` | `EVIDENCED: index.html:89-93 links IEEE 802.3at/802.3bt, Ethernet Alliance, Cisco PoE configuration, and Fluke cabling references; candidate scope is user-confirmed.` |
| `method_is_verifiable` | `EVIDENCED: js/engine.js:23-33 exposes the deterministic formulas and comparison rules; docs/engine-test.js covers representative boundaries.` |
| `validation_is_verifiable` | `EVIDENCED: node website/tools/poe-power-budget-calculator/docs/engine-test.js → PASS: PoE power budget engine (covers pass, port overflow, per-port-standard failure, and budget failure).` |
| `cross_site_decision` | `NETWORK_SPECIFIC_CONFIRMED` |
| `value_user_need_evidence` | `EVIDENCED: User explicitly selected PoE device count/ports/power scope; existing page addresses “How many PoE cameras can my switch support?” (index.html:91-92).` |
| `value_engineering_value_evidence` | `EVIDENCED: Existing page explains the separate port-count, total power-budget, and per-port-standard constraints that determine whether devices can be supported (index.html:88-91).` |
| `audit_owner` / `audit_version` | `/root` / `2026-10-11` |
| `mapping_confidence` | `HIGH` |
| `audit_notes` | `User confirmed the candidate is limited to PoE device count, ports, and power; existing PoE tool is survivor. target_roadmap_id=TOOL-002; survivor_existing_tool_id=poe-power-budget-calculator; independent_reviewer=/root/tool002_admission; evidence=docs/roadmap/evidence/TOOL-002-poe-duplicate-decision-2026-10-11.md. Gate FAIL is intentional for the rejected standalone duplicate.` |

Value gates do not authorize a rejected duplicate for development. For traceability, the existing page provides user-need evidence (`index.html:91-92`, common camera sizing FAQ) and engineering-value evidence (`index.html:88-91`, separate port, watt-budget, per-port-standard and headroom constraints). Leave unrelated value fields `PENDING`.

## Applied existing-tool crosswalk row

Applied values: `mapping_status=CONFIRMED`, `canonical_problem_id=CP-POE-SWITCH-CAPACITY-001`, `overlap_decision=KEEP`, `gate_status=NOT_STARTED`, `audit_owner=/root`, `audit_version=2026-10-11`, and `confidence=HIGH`. The existing tool remains the survivor. The crosswalk gate remains `NOT_STARTED`; this mapping decision does not certify every engineering gate of the existing tool.

## Independent reviewer sign-off

`/root/tool002_admission` independently reviewed this proposal and signed **PASS** for the TOOL-002 ↔ `poe-power-budget-calculator` duplicate decision only. The user-confirmed PoE scope matches the active page, engine, and passing test; the proposed matrix evidence and `REJECT_DUPLICATE / FAIL` decision plus `CONFIRMED / KEEP` survivor mapping follow the Phase 0 ledger rules. This sign-off does not close the other 39 crosswalk rows, grant implementation admission, or authorize deployment.

> I (`/root/tool002_admission`) independently reviewed the TOOL-002 PoE duplicate-exclusion proposal. The user-confirmed scope matches the existing PoE page, engine, and test; the proposed TOOL-002 fingerprint and Mandatory/Value evidence, `REJECT_DUPLICATE / FAIL`, and PoE survivor mapping are supported and follow the Phase 0 ledger rules. This sign-off covers only this mapping decision; it does not complete the other 39 crosswalk rows, authorize implementation, or authorize deployment.

The reviewer and this report path are recorded in both ledgers. TOOL-002 is archived in `REJECTED_DUPLICATES_ARCHIVE.md` and removed from the pending candidate view by the queue sync. The implementation completion command was not used for this rejected duplicate.

## Boundaries

This proposal does not approve or modify the existing PoE tool, does not complete the other 39 crosswalk mappings, does not admit any new implementation, and does not authorize deployment. The shared 40-tool reconciliation remains open after this one row is resolved.

