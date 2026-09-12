# NetEngineerLab UI Design System Audit & Remediation V1.0.1

**Date:** 2026-09-12  
**Baseline:** `NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.0.md`  
**Scope:** all generated public pages, all tool detail pages, shared shell, mobile geometry and build-time enforcement.

## 1. Audit findings before remediation

The V1.0 standard existed, but the implementation still had several structural gaps:

1. **Canonical width was not actually single-source.** `design-tokens.css` defined 1400px, while `tool-layout.css` still used 1380px and legacy `mobile-branding.css` still defined 1320px. This allowed newer and older pages to align differently.
2. **Nested Hero double-gutter defect.** `tool-design-system.css` applied `calc(100% - 48px)` to a Hero even when the Hero was already inside a canonical-width `<main>`. That makes the Hero 48px narrower than the workspace beneath it.
3. **Return navigation was not build-enforced.** A scan of direct English tool pages found 10 tool pages without a consistent visible Back-to-Tools/Breadcrumb pattern. Individual pages could therefore ship without a return path.
4. **UI compliance CSS was not guaranteed to load last.** Some pages contained `tool-layout.css`, some did not, and tool-local CSS could override the shared geometry after the design-system CSS.
5. **Mobile shell rules were duplicated.** The old `tool-layout.css` also controlled header navigation and could conflict with the newer `site-shell.css` hamburger/menu behavior.
6. **Legacy page-local width declarations remain.** Several calculator stylesheets still declare 1180/1200/1360/1380/1740px widths. They are safe only if a final shared compliance layer wins.
7. **There was no automated UI gate.** Existing launch gates tested routing, SEO, engines and multilingual output, but did not fail a build when a Tool Detail page lost its breadcrumb or shared layout CSS.

## 2. Remediation applied

### P0 — one canonical page width

- `--nel-content-max` remains the source of truth at **1400px**.
- `tool-layout.css` now derives from `var(--nel-content-max, 1400px)`.
- legacy `mobile-branding.css` no longer resets the global width to 1320px.

### P0 — nested Hero alignment

Nested Hero sections now use `width: 100%` inside the canonical `<main>` container. The outer viewport gutter is applied only once.

### P0 — mandatory Tool Return Navigation

`build-multilingual.js` now injects/normalizes a static, localized tool return navigation for every Tool Detail page:

- English: `← Back to Tools`
- Simplified Chinese: `← 返回工具中心`
- Spanish: `← Volver a herramientas`

The current tool name is included as the breadcrumb current item. This is static HTML and does not depend on JavaScript.

### P0 — shared UI layer always wins

`build-multilingual.js` now guarantees `assets/css/tool-layout.css` is inserted **after tool-local stylesheets** on every tool page. This is the final geometry/responsive compliance layer.

### P1 — header/mobile responsibility separation

Header/footer and hamburger behavior belong only to `site-shell.css`. `tool-layout.css` no longer contains a second mobile navigation system.

### P1 — responsive safety

The final tool layout layer now standardizes:

- 24px desktop gutter
- 20px tablet gutter
- 16px mobile gutter
- 14px narrow-mobile gutter
- one-column `nel-tool-grid` at <=1100px
- sticky result panels disabled at tablet/mobile widths
- responsive image/table containment
- 44px mobile return-navigation target

### P1 — automated release gate

Added:

```text
npm run audit:ui
```

The audit checks generated public pages and fails on structural UI violations including missing shared header/footer, missing viewport, missing Tool Design System CSS, missing final Tool Layout CSS and missing return navigation. Advisory legacy CSS drift is reported as warnings.

`prepare:launch` now runs `audit:ui` automatically.

## 3. Acceptance rule

From this remediation forward, a calculator is not considered complete when only the engine works. A Tool Detail page must also pass the UI Design System audit before release.

## 4. Final audit result

After remediation and a full multilingual rebuild:

- Public pages checked: **101**
- Tool Detail pages checked: **80** (EN + ZH + currently published ES pages)
- Structural UI errors: **0**
- Legacy CSS advisory warnings: **43**
- UI Design System gate: **PASS**

The 43 warnings are legacy page-local CSS declarations (old max-width/footer rules). They no longer control the final public geometry because `tool-layout.css` is now a mandatory final compliance layer and `site-shell.css` retains Header/Footer authority. They are tracked as refactoring debt rather than release blockers to avoid destabilizing individual calculator internals in a single global migration.

## 5. Regression verification

Passed after the UI remediation:

- `npm run build:i18n`
- `npm run audit:ui`
- `npm run validate:i18n`
- `npm run test:page-registry`
- `npm run test:tool-navigation`
- `npm run audit:launch`
- `npm run audit:seo-geo`
- `npm run test:seo-schema`
- `npm run test:seo-geo`
- Generator + UPS engine test
- Power Tool #32 audit
- Data Center Network Convergence & Fabric Capacity Planner engine test

During regression, the SEO/GEO coverage test still expected the pre-Spanish search-intent shape. The fixture was updated to include the active Spanish `cálculo` intent label; the SEO/GEO test now passes.

## 6. Remaining technical debt

The next UI cleanup batch should remove obsolete local width/footer declarations tool by tool after visual comparison, rather than deleting them globally. The release surface is now structurally protected, so this cleanup can be incremental without allowing future pages to drift again.
