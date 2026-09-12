# NetEngineerLab UI V1.2.2 — True Tool Page Template Migration

**Date:** 2026-09-12  
**Scope:** 35 active tools / 80 localized Tool Detail pages  
**Status:** PASS

## Why V1.2.2 was necessary

The previous V1.2 audit was too permissive. It proved that every Tool Detail page had shared Header, breadcrumb, Hero hooks, Main hooks and Footer, but it did **not** prove that legacy HTML wrappers had actually been removed. Pages such as `telecom-solar-battery-sizing-calculator` still used the historical `wrap > grid > panel` structure and therefore remained visually different from the PON reference page.

V1.2.2 corrects the audit contract and performs a real source migration rather than adding semantic classes to old markup.

## Migration performed

- Migrated all 80 Tool Detail pages to `data-nel-template="tool-detail-v1.2.2"`.
- Canonical standard calculator hierarchy is now:
  - Shared Header
  - Return/Breadcrumb navigation
  - `.nel-tool-hero`
  - `main.tool-shell.nel-tool-main.nel-tool-grid.nel-tool-primary-grid`
  - direct `.nel-tool-input.card`
  - direct `.nel-tool-result.card`
  - supporting sections outside the primary workspace
  - Shared Footer
- Removed the historical extra `grid`, `tool-layout` and `layout` wrapper from normal calculator pages.
- Removed legacy main identities (`wrap`, `workspace`, `shell`, `calculator-shell`) from the 72 standard calculator pages.
- Kept 8 complex tools as `nel-tool-specialized`; their internal engineering workspace is intentionally preserved while their outer platform template is unified.
- Added generated canonical card headers only where a historical page did not already have a Section Title.
- Moved 18 historical supporting sections out of the primary calculator workspace.
- Added a final V1.2.2 platform visual layer for Hero, primary cards, spacing, responsive behavior and nested legacy subsections.

## Audit contract strengthened

`npm run audit:ui-v1.2` now fails if:

- `tool-detail-v1.2.2` is missing;
- Hero is nested inside Main;
- a normal calculator Main is not `tool-shell + nel-tool-main + nel-tool-grid`;
- a legacy `grid/tool-layout/layout` wrapper is still directly nested under Main;
- a normal calculator retains a legacy main identity;
- canonical input/result cards are missing;
- Header, return navigation, Hero, Main and Footer are out of order;
- duplicate Header CTA is present.

## Final evidence

- Active tools: **35**
- Tool Detail pages: **80**
- Standard grid pages: **72**
- Specialized complex pages: **8**
- Supporting sections physically moved: **18**
- UI V1.2.2 template audit: **PASS / 0 errors**
- UI Design System source audit: **PASS / 0 errors / 0 warnings**
- Multilingual validation: **PASS**
- Page Registry: **PASS**
- Workflow Registry: **PASS**
- Tool Navigation: **PASS**
- Launch Audit: **PASS**
- SEO/GEO Audit: **PASS**
- Schema traversal: **PASS**
- Telecom Solar engine: **PASS**
- PUE engine: **PASS**
- Generator + UPS engine: **PASS**
- SFP/QSFP engine: **PASS**
- Data Center Fabric engine: **PASS**

## Release rule

A future Tool Detail page is not considered migrated merely because it contains V1.2 classes. The source HTML must satisfy the V1.2.2 canonical hierarchy and the strict audit must pass.
