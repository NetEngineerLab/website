# TOOL-003 ↔ Switch Uplink Oversubscription Calculator — reviewed duplicate decision

**Decision date:** 2026-10-12  
**Prepared by:** `/root`  
**Independent reviewer:** `/root/tool002_admission` — PASS for this candidate-specific duplicate decision  
**Scope:** TOOL-003 only. TOOL-004 remains a separate unresolved candidate.  
**Disposition:** `REJECT_DUPLICATE / FAIL`; remove TOOL-003 from the new-tool development queue. No implementation or deployment is authorized or required for this duplicate.

## User-confirmed candidate definition

The user directed the review to use this definition: calculate access-port aggregate line rate divided by active-uplink aggregate capacity; inputs are access-port count and speed plus active-uplink count and speed; outputs are the two aggregate capacities and the N:1 ratio. This settles the candidate scope for this decision.

## Existing-tool coverage and validation

- The active `switch-uplink-oversubscription-calculator` page accepts access-port count and speed, active forwarding uplink count and speed, and presents aggregate offered line rate, uplink capacity, and oversubscription ratio (`website/tools/switch-uplink-oversubscription-calculator/index.html:52`).
- The engine computes `ports × portMbps ÷ (active uplinks × uplinkMbps)` and formats the ratio as `N:1` (`website/tools/switch-uplink-oversubscription-calculator/js/engine.js:2-3`).
- The existing test verifies 48 × 1 Gbps access capacity divided by two 10 Gbps active uplinks gives 48 Gbps, 20 Gbps, and `2.4:1`. Validation passed: `node website/tools/switch-uplink-oversubscription-calculator/docs/engine-test.js` → `Switch uplink oversubscription engine tests: PASS`.
- The page cites the Cisco Campus LAN/WLAN Design Guide as calculating oversubscription from actual access-port speeds and active uplinks. IEEE 802.1AX and RFC 7424 are only cited for aggregation and flow-distribution context; they are not represented as defining the ratio.

## Applied TOOL-003 decision

The audit matrix now records canonical problem `CP-SWITCH-UPLINK-OVERSUBSCRIPTION-001`, the confirmed problem fingerprint, six Mandatory Gate evidence fields, two Value Gate evidence fields, and `REJECT_DUPLICATE / FAIL`. The existing calculator is the survivor. FAIL here rejects a new standalone duplicate; it does not indicate a failure of the existing calculator.

The duplicate archive now includes TOOL-003 and the generated pending-candidate view removes it. It is not counted as an implemented completion.

## Crosswalk boundary

The same existing-tool crosswalk row also listed TOOL-004. Its `candidate_roadmap_ids` now retains only TOOL-004, while the row remains `HYPOTHESIS / UNREVIEWED`; TOOL-003's decision does not confirm or reject TOOL-004. The shared 40-tool reconciliation is still open and remains required before other candidate implementation admission.

## Independent reviewer sign-off

`/root/tool002_admission` independently reviewed the user-confirmed definition against the matrix, crosswalk, existing page, engine, references, and passing test. The reviewer signed **PASS** for the TOOL-003 duplicate exclusion only. This sign-off does not close the shared crosswalk, admit another candidate, or authorize deployment.
