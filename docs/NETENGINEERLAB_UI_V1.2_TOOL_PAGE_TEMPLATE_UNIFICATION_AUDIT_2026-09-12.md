# NetEngineerLab UI V1.2 Tool Page Template Unification Audit

**Version:** UI V1.2  
**Date:** 2026-09-12  
**Scope:** 35 active tools / 80 localized Tool Detail pages

## 1. Why V1.2 was required

UI V1.1 removed legacy CSS width/footer/card overrides, but the HTML source still contained several generations of Tool Detail templates. This produced visibly different Hero proportions, workspace geometry and content hierarchy even though every page loaded the same shared shell.

## 2. Pre-migration inventory

| Structure generation | Pages |
| --- | ---: |
| Standard V1.1 input/result template | 23 |
| Legacy `wrap/grid` template | 22 |
| Transitional grid template | 21 |
| Nested-Hero template | 6 |
| Specialized workspace template | 8 |
| **Total** | **80** |

The problem was therefore not two isolated pages. Five historical structures were simultaneously present.

## 3. V1.2 canonical page contract

Every Tool Detail page now exposes the same platform-level structure:

```text
Shared Header
→ Return to Tools / Breadcrumb
→ Hero (.nel-tool-hero)
→ Main Workspace (.nel-tool-main)
   → Primary Workspace (.nel-tool-primary-grid)
      or explicitly specialized workspace
→ Methodology / FAQ / Related Tools
→ Shared Footer
```

Complex engineering tools such as ACL Generator, Network Change Planner, IPv6/NAT Planner and Wi-Fi Planner retain their internal workflow UI, but they no longer use a different outer page template.

## 4. Source migration completed

- Added `data-nel-template="tool-detail-v1.2"` to all 80 Tool Detail pages.
- Added `.nel-tool-detail-page` to the page body.
- Standardized every Hero with `.nel-tool-hero`.
- Moved all 6 nested Hero pages out of `<main>` so the visual hierarchy is identical.
- Added `.nel-tool-main` to all 80 main workspaces.
- Added `.nel-tool-primary-grid`, `.nel-tool-input`, `.nel-tool-result` semantic hooks to calculator workspaces while preserving existing calculator IDs and JS selectors.
- Preserved specialized internal layouts but marked the V1.2 platform shell explicitly.
- Added `.nel-tool-supporting-section` to supporting engineering content where applicable.
- Standardized Hero maximum heading size and width to prevent isolated Chinese titles from wrapping as a single orphan character.
- Added a reusable V1.2 automated template audit.

## 5. Release gate

Run:

```bash
npm run audit:ui-v1.2
```

The gate checks all existing localized Tool Detail pages for shared Header, return navigation, external Hero, canonical Main, primary workspace hook, shared Footer and final layout CSS.

`prepare:launch` now includes this gate. A future page that reintroduces an old template cannot pass the normal launch process.
