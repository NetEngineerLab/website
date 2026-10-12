# TOOL-002 ↔ PoE Power Budget Calculator — evidence comparison

**Date:** 2026-10-11  
**Author:** `/root` (queue coordinator; no implementation performed)  
**Independent reviewer:** `/root/tool002_admission` — PASS for this comparison report only; not an admission approval  
**Decision status:** Preliminary comparison only; no mapping or admission sign-off

## Candidate evidence

The TOOL-002 row in `docs/roadmap/PHASE0_AUDIT_MATRIX.csv` contains the title **Switch Port Capacity Calculator**, domain **Ethernet / Switching**, and the candidate existing tool `poe-power-budget-calculator`. Its problem statement, inputs, outputs, core logic, target user, canonical problem ID, gates, and cross-site decision remain `PENDING`. The crosswalk row is therefore correctly still `HYPOTHESIS / UNREVIEWED`.

The candidate title alone does not establish whether the intended problem is general switch-port inventory and expansion planning, PoE-powered endpoint capacity, or both.

## Existing PoE tool evidence

The live source is `website/tools/poe-power-budget-calculator/`:

- The page describes sizing PoE switches for cameras, access points, phones, and access-control devices. Inputs include PoE-capable ports, powered-device count, device watts, PoE standard, cable-loss allowance, and engineering headroom (`index.html`, lines 71–82).
- The page says port count is a hard limit even when watts remain and checks total watts, available ports, and per-port power class (`index.html`, lines 83–91).
- The engine computes `portPass = count <= ports`; separately checks the required switch budget and selected per-port standard; and limits maximum supported devices by both ports and power budget (`js/engine.js`, lines 15–38).
- The existing local test passes: `node website/tools/poe-power-budget-calculator/docs/engine-test.js` → `PASS: PoE power budget engine`.

## Comparison

| Capability | Existing PoE tool | TOOL-002 evidence available now |
|---|---|---|
| Count endpoint devices against a port limit | Yes, for powered devices and PoE-capable ports | Title mentions port capacity; detailed scope absent |
| Total PoE watts, cable-loss allowance, engineering headroom | Yes | Not specified |
| Per-port PoE standards and device power class | Yes | Not specified |
| General physical switch-port inventory, port-speed/media mix, spare-port targets, or number of switches required | Not evidenced by this PoE tool's current inputs or engine | Not specified for TOOL-002 |
| Uplink traffic capacity or oversubscription | Not evidenced by the PoE engine | Not specified; separate roadmap candidates exist for uplink planning |

## Preliminary finding

The existing PoE tool definitely checks powered-device count against PoE-capable ports. The TOOL-002 title mentions port capacity, so the pair has a **plausible overlap suggested by naming only**. Because TOOL-002's problem statement, inputs, outputs, and core logic are all `PENDING`, the current evidence does not confirm that TOOL-002 includes the same device-count check. The PoE tool is otherwise a power-and-standard sizing tool; its current source does not establish general access-port inventory planning.

The evidence does **not** establish whether TOOL-002 is a duplicate, a distinct general port-planning problem, or a broader tool that would subsume PoE planning. Keep `mapping_status=HYPOTHESIS`, `overlap_decision=UNREVIEWED`, and all admission fields unchanged. Do not create or modify a tool page from this comparison.

## Scope needed to finish this pair

An authoritative TOOL-002 definition must specify whether it plans:

1. General switch-port demand (such as endpoint counts by port type/speed, switch quantity, and spare capacity), with PoE power sizing explicitly out of scope; or
2. PoE-powered endpoint capacity and power budget, which is already substantially covered by the existing PoE tool; or
3. Both, with a clearly bounded additional capability beyond the existing PoE tool.

After scope is sourced, compare the six-part problem fingerprint and evidence, update the ledger only if justified, and obtain independent review. This item remains subject to the shared 40-tool crosswalk prerequisite.

