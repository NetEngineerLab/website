# AUDIT 2 — NetEngineerLab Baseline Recovery V1

**Date:** 2026-09-10  
**Status:** PASS / ACCEPTED  
**Scope:** preserve current 32-tool feature baseline while restoring previously accepted historical controls.

## Recovery findings
The current #32 package preserved the newer tools but had regressed three previously accepted controls:

1. Workflow UI production audit and its dedicated cache-busted stylesheet path were absent.
2. Network Change Planner privacy-safe product analytics and its acceptance gate were absent.
3. MIB/OID governance documents remained, but no executable Phase-0 governance gate was wired into `verify` / `prepare:launch`.

Historical development and acceptance documents for Workflow UI and Product Analytics were also absent from the current package.

## Restored controls

- `website/assets/css/tool-workflow.css`
- hash-versioned Workflow CSS injection for every registered bilingual tool page
- `scripts/workflow-ui-production-audit.js`
- `npm run audit:workflow-ui`
- Network Change Planner analytics instrumentation
- `scripts/network-change-planner-analytics-acceptance.js`
- `npm run accept:v2.1-flagship-analytics`
- `scripts/mib-phase0-governance-gate.js`
- `npm run validate:mib-governance`
- historical Workflow UI and Product Analytics acceptance documents
- `scripts/audit2-baseline-recovery-v1.js`
- `npm run audit2:baseline-recovery-v1`

All restored gates are wired into `prepare:launch`, and `verify` remains an alias of `prepare:launch`.

## MIB/OID boundary
The recovered MIB gate does **not** claim MIB/OID Explorer is production-approved. It enforces the current Phase-0 boundary: governance documents must remain present and public MIB/OID fact routes or production tool registration must not appear before a separate release approval.

## Audit-2 defect handling
Two false-positive conditions were found while rebuilding the recovery gates:

- the first MIB gate expected an English `fail` marker in a predominantly Chinese threat model; this was corrected to semantic fail-closed topic matching without weakening controls;
- the first Audit-2 privacy scan treated normal business variables such as `configuration` / `mopMarkdown()` as analytics payload leakage; Audit-2 was corrected to independently execute the dedicated analytics privacy acceptance gate instead of duplicating it with a brittle regex.

No production gate was removed to obtain a green result.

## Final verification

`npm run verify` completed successfully from start to finish.

- Active tools: **32**
- Workflows: **8**
- Workflow coverage: **32/32**
- Bilingual tool navigation pages: **64**
- Public pages: **78**
- Sitemap / production routes: **76**
- Calculation engine suites: **32 PASS**
- Service Workers: **32 PASS**
- Local internal links: **3925 PASS**
- Workflow UI audit: **PASS (64 pages)**
- MIB/OID Phase-0 governance: **PASS**
- Network Change Planner analytics acceptance: **PASS**
- Architecture: **PASS / 0 errors / 0 warnings**
- i18n: **PASS**
- SEO / Schema / GEO: **PASS**
- Production Acceptance: **PASS / 0 errors / 0 warnings**
- Audit 2 Baseline Recovery: **PASS**

## Permanent non-regression rule
Future development MUST NOT delete, bypass, weaken, or silently replace an accepted gate. If legitimate product expansion makes an old invariant obsolete, update that invariant and document why; do not delete the gate merely to make CI pass.

## Final decision
**PASS / ACCEPTED.** The recovered project satisfies the target state:

> New tools preserved + historical functionality restored + historical gates restored + old and new tests passing together.
