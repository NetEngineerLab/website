# NetEngineerLab UI Audit

## Scope and method

Read-only baseline review of the shared header/navigation, homepage, topic hub, calculator, article page, result panels, footer, mobile navigation, and visible empty/error/loading states. Representative routes are `/`, `/topics/switch-oversubscription/`, `/tools/subnet-calculator/`, and `/guides/subnet-calculator-guide/`. Measurements were taken at 320, 375, 390, 768, and 1440 CSS pixels. No engine, formula, API, or SEO schema changes are in scope.

Priority meanings: **P0** blocks a consistent or usable page shell; **P1** creates material inconsistency or friction; **P2** is a polish or coverage gap.

Finding headings show current status. “Resolved in Golden” applies only to the Golden routes; “Open” findings remain migration blockers for the wider site.

## Findings

### P0 — Guide pages lose the shared content-width token — RESOLVED IN GOLDEN

Baseline: guide pages lacked `design-tokens.css`, so the header's content-width token was undefined and the article header stretched edge to edge. The multilingual build now injects tokens and shared shell CSS; screenshots confirm matching header/footer inner boundaries on all Golden viewports.

### P0 — One Topic route is not using the product shell — OPEN

`website/topics/data-center-capacity/index.html` is a bare, narrow HTML fragment without viewport metadata or the shared header/footer. Its topic lists are empty. It does not match the complete topic pattern used by `switch-oversubscription` and `data-center-cooling-capacity`. Keep this route out of the Golden set until its source/registry ownership is established; do not fill its empty content with invented claims.

### P1 — Header and footer widths diverge across page families — RESOLVED IN GOLDEN

Baseline: header and footer widths diverged by route because of page-specific overrides and inconsistent gutters. Golden routes now share the same desktop/mobile content gutters; all 20 measured route/viewports align exactly.

### P1 — CSS ownership and tokens are split — OPEN OUTSIDE GOLDEN

`site.css`, `design-tokens.css`, `site-shell.css`, `guide.css`, `home-redesign.css`, `home-mobile-layout.css`, `home-v2.css`, `tool-design-system.css`, and `tool-layout.css` overlap in typography, color, widths, shadows, and breakpoints. `design-tokens.css` and `tool-design-system.css` both define `--nel-*` values. Homepage, guide/topic, and calculator pages load different subsets and orders, so one component can render differently by page family.

### P1 — Article return navigation is incomplete — RESOLVED IN GOLDEN

Baseline: “Guides” was plain text in the article breadcrumb and article widths used separate values. The Golden article now links Guides to the homepage section and uses the shared shell and content tokens.

### P1 — Article content modules are inconsistent — OPEN FOR MIGRATION

Across 15 guide routes, only 8 have a related-tool CTA, 12 have a related-links block and table of contents, and 11 have an in-article CTA. The subnet guide already has contextual tool links and a primary CTA; preserve these while standardizing their presentation. Article title sizing in the screenshot takes three lines and dominates the first viewport.

### P2 — State components are not a shared visual family

Calculator pages contain error, no-result, and status messages, and the shared runtime includes live announcements. There is no common CSS contract for empty, loading, warning, and error states across page families. Audit states on representative pages before extending the component layer.

### P2 — Shadow and gradient use exceed the requested restraint

The guide/topic CTA panels and some homepage cards use gradients and shadows while the rest of the site uses flat surfaces and borders. Keep emphasis through hierarchy, spacing, and a single brand accent; reserve elevation for overlays and transient controls.

## Golden baseline

| Page | Baseline evidence |
|---|---|
| Shared shell | Same header/footer templates exist, but inner widths diverge by route and one guide family lacks its required token stylesheet. |
| Homepage | Content order is usable; the home header override is 1180px against a 1392px footer at desktop. |
| Topic hub | Complete switch-oversubscription hub uses the guide CSS family and a 1392px shell at 1440px. |
| Calculator | Subnet calculator uses the shared tool design system, a two-column desktop layout, and a single-column mobile layout. |
| Article | Screenshot route has a 980px body shell, a three-line oversized title, a working calculator CTA, internal links, and a non-clickable Guides breadcrumb. |

## Verification limits

The width and overflow review covers the four Golden routes and 28 Guide routes at the five requested widths. A representative tool runtime test is required after tool styling changes. Empty/error/loading visual state coverage is partial until each representative tool state can be triggered in-browser. Editorial CTA/link coverage across the full Guide library remains inconsistent and is tracked as an open migration item.
