# NetEngineerLab Baseline Recovery V1

**Date:** 2026-09-10  
**Status:** recovery implementation  
**Current feature baseline:** Power Tool #32 package (32 active tools)

## Objective
Preserve all newly added tools while restoring previously accepted capabilities and gates that regressed during later development.

## Restored controls
1. Workflow UI production asset, hash injection, cache/precache participation and `audit:workflow-ui`.
2. Network Change Planner privacy-safe product analytics funnel and `accept:v2.1-flagship-analytics`.
3. MIB/OID Phase-0 governance gate based on the surviving license ledger, parser ADR, data dictionary, threat model and development plan.
4. Historical acceptance documentation for Workflow UI and Product Analytics.
5. Independent `audit2:baseline-recovery-v1` gate.

## Non-regression rule
Future feature/tool work must not delete, skip, weaken or silently replace an accepted gate. If a gate becomes structurally obsolete because the product legitimately expands, update its invariant and record the reason; do not remove it merely to make CI green.

## MIB boundary
This recovery does **not** claim that MIB/OID Explorer is production-approved. The restored Phase-0 gate verifies governance artifacts and fails if public MIB fact routes or production registration appear before a separate release approval.

## Final acceptance result
`npm run verify` completed PASS on 2026-09-10 with 32 active tools, 8 workflows, 78 public pages, 76 production routes, 32 engine suites, 32 Service Workers and 3925 internal-link checks. Audit 2 status: PASS / ACCEPTED.
## UI non-regression baseline (2026-09-12)
All new or materially refactored public pages must comply with `docs/NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.1.md`. Shared Header/Footer, tool return navigation, canonical page alignment, responsive behavior and card/form conventions are now part of the non-regression baseline. A feature is not accepted when calculation logic passes but the public page breaks the shared UI contract.

