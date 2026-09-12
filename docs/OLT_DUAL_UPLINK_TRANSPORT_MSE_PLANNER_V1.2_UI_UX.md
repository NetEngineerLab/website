# OLT Dual-Uplink Transport MSE Planner V1.2 UI/UX Upgrade

- Version: V1.2
- Modified: 2026-09-12 00:20 (+08:00)
- Scope: `/tools/olt-dual-uplink-transport-mse-planner/`
- Baseline: V1.1 hero readability fix

## Goal
Turn the page from a dense calculator form into a clearer engineering planning workspace while preserving the existing calculation engine, canonical URL, SEO metadata, registry identity and workflow links.

## V1.2 changes

### Hero
- Keeps the shorter V1.1 title and further refines desktop/mobile sizing.
- Reduces vertical footprint and whitespace.
- Adds four concise capability badges: N-1, channel sizing, MSE resources and path diversity.

### Input hierarchy
- Reorganizes the existing fields into four engineering groups:
  1. OLT & traffic
  2. Transport channels
  3. MSE resources
  4. Path diversity
- Keeps every existing input ID and calculation contract unchanged.
- Adds concise group explanations and clearer unit treatment.
- Expands the path-diversity controls with physical meaning for each checkbox.

### Desktop layout
- Introduces a true two-column engineering workspace on desktop.
- Keeps the result panel visible with sticky positioning while the input side scrolls.
- Stacks to a single column at tablet/mobile breakpoints.

### Result hierarchy
- Adds a failure-state-first result summary.
- Keeps all original output IDs used by the app/engine.
- Adds visual utilization bars for transport channels and MSE ports.
- Displays the configured planning-limit marker on each utilization bar.
- Separates protection checks from warnings/advice.
- Localizes risk labels and all protection-check labels in Chinese.

### Accessibility / resilience
- Adds `for`/`id` associations to fields.
- Adds `aria-live` to status/result messages.
- Keeps responsive layouts down to 320 px width.
- No calculation formulas were changed.

## Verification
- `node --check js/app.js` — PASS
- `node --check js/engine.js` — PASS
- OLT transport/MSE engine tests — PASS
- Transport Tools 33–34 Audit 2 — PASS
- Multilingual validation — PASS
- Tool navigation contract — PASS
- HTML duplicate-ID / required-ID audit — PASS

## Non-goals
- No modification to the underlying capacity formula.
- No change to Tool Registry ID or canonical URL.
- No vendor-specific OTN/MSE hardware assumptions added in this UI release.
