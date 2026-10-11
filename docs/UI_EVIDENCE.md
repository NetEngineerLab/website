# UI Evidence — Golden Pages

## Scope

Evidence covers the shared shell, homepage, switch-oversubscription topic hub, subnet calculator, and subnet guide article. This validates the first Golden UI slice only; the remaining website families have not been migrated and the result must not be described as a completed site-wide redesign.

## Screenshots

First-viewport screenshots were captured at 320, 375, 390, 768, and 1440 CSS pixels for every Golden route. On the 390px runs, the mobile menu was opened and asserted to expose at least three links. The homepage methods panel has a separate scrolled screenshot. PNGs and raw viewport measurements are in `artifacts/ui-evidence/`.

| Route | Viewports | Overflow | Shared design token |
|---|---|---|---|
| `/` | 320, 375, 390, 768, 1440 | None | Loaded |
| `/topics/switch-oversubscription/` | 320, 375, 390, 768, 1440 | None | Loaded |
| `/tools/subnet-calculator/` | 320, 375, 390, 768, 1440 | None | Loaded |
| `/guides/subnet-calculator-guide/` | 320, 375, 390, 768, 1440 | None | Loaded |

`measurements.jsonl` contains `scrollWidth`, viewport width, token presence, and actual `.site-shell-header-inner` / `.site-shell-footer-inner` bounding boxes. All 20 route/viewport pairs have no horizontal overflow; header and footer inner left/right edges match exactly in every pair. After the gutter fix, all four routes use 292/347/362/740/1392px widths at 320/375/390/768/1440px. Four mobile navigation screenshots cover each representative page family.

## Validation

- `npm run build:i18n`: PASS (66 route groups, 177 localized pages; tool navigation integration PASS for 80 pages).
- `npx playwright test tests/browser/accessibility.spec.js --project=chrome-desktop`: PASS (2 tests).
- `npx playwright test tests/browser/homepage.spec.js --project=chrome-desktop`: PASS (12 tests on final run; an earlier transient Chromium startup failure did not reproduce).
- `npx playwright test tests/browser/tools.spec.js --project=chrome-desktop -g 'subnet-calculator'`: PASS (English and Chinese calculator behavior and canonical checks, 2 tests).
- Screenshot measurements: PASS for 20 route/viewport combinations with no horizontal overflow and shared token availability.
- Mobile nav: PASS for all four Golden families at 390px; `aria-expanded=true` and at least three visible navigation links after opening.
- Home module rendering: PASS. The page content is present and visible in the browser. The blank evidence came from the capture script issuing scrolls against `scroll-behavior:smooth` without waiting for the animation, so screenshots sampled an intermediate scroll position; Cookie Preferences could also cover the section. The capture now disables smooth scrolling, settles at each target, and dismisses the consent dialog. `home-1440-methods.png` shows the category labels/counts, both method cards, and the complete Trust overview and guide cards.

## Guide family migration

- 30 article routes checked: 16 English and 14 Chinese.
- Responsive checks: 150 route/viewport combinations across 320, 375, 390, 768, and 1440px; zero overflow or header/footer alignment failures.
- All routes loaded the shared guide stylesheet and design tokens, exposed article headings and visible breadcrumb navigation (two ancestor links plus the current-page label), and retained structured Article/WebPage data. The two LACP locale pages have no canonical link or BreadcrumbList JSON-LD; this preexisting metadata gap was recorded and left untouched to keep this migration within UI scope.
- The `generator-fuel-runtime-planning` article variant now uses the shared readable article frame, localized visible breadcrumb, and one primary calculator CTA style. Technical copy and JSON-LD were preserved.
- English/Chinese breadcrumb and calculator-link smoke checks: PASS at 320px; both CTA links resolve to the correctly localized calculator route.
- Evidence: `guide-family-results.json`, `guide-en-320.png`, `guide-en-768.png`, `guide-en-1440.png`, `guide-generator-en-1440.png`, `guide-generator-en-cta.png`, and Chinese equivalents.
- `npx playwright test tests/browser/accessibility.spec.js --project=chrome-desktop`: PASS (2 tests) after the guide changes.

## Topic Hub family migration

- 6 registered routes checked: 3 English and 3 Chinese pages.
- Responsive checks: 30 route/viewport combinations across 320, 375, 390, 768, and 1440px; zero overflow or header/footer alignment failures.
- All 6 pages load the shared Topic Hub stylesheet and Design System font/color/width tokens. Breadcrumbs expose Home → Topics → current page; Home returns to the localized homepage and Topics returns to its `#topics` section.
- Canonical links and existing JSON-LD payloads remain present and unchanged by the second build. Route and schema fingerprints are recorded in `topic-family-results.json`.
- `npm run build:i18n`: PASS; a second build left all 6 active Topic Hub HTML files unchanged by SHA-256.
- `node artifacts/ui-evidence/audit-topics.cjs`: PASS (6 routes, 30 viewports, zero UI failures).
- Screenshots cover all six routes at desktop and mobile widths, plus the full five-width set for the switch-oversubscription Golden route in both locales; see `topic-*-*.png`.
- `pon-optical` and `switching-oversubscription` are unregistered topic directories. `data-center-capacity` remains an incomplete bare fragment. They were not modified or counted in this batch.
- `node artifacts/ui-evidence/audit-guides.cjs`: PASS (30 routes, 150 viewports, zero UI failures). The shell-less LACP pages now receive the real shared Footer; long capacity examples remain contained on mobile.
- Repeated `npm run build:i18n`: PASS; SHA-256 comparison across all 30 Guide HTML files reported no changes on the second build.

## Tool family migration

- 40 active tools / 120 localized detail pages now use the shared Tool Detail V1.3.1 template. The outlier OSPF calculator was brought into the common Hero, input/result grid and supporting-method frame in English, Chinese, and Spanish; the engine and application scripts were unchanged.
- Shared Tool Hero uses a restrained white surface, thin border and no shadow. Text contrast measured above 6:1. Independent visual review covered fiber-loss, data-center-cooling-load-calculator and transmission-ring-optimization-risk-analyzer at 320, 390 and 1440px. The longest mobile example is 425px tall at 320px; calculator inputs begin at y=630, with no horizontal overflow or browser errors.
- Tool browser suite: `npx playwright test tests/browser/tools.spec.js --project=chrome-desktop` — 80 passed. The suite now tests OSPF result output, capacity forecast headline, and the report-center sample import/export state rather than asserting that each non-calculator tool declares a calculator result selector.
- OSPF targeted checks: Chrome Desktop English/Chinese calculations 2 passed; `npm run test:ospf-cost` PASS; global accessibility spec 2 passed. Independent audit confirmed unchanged OSPF control ids, canonical URLs, all three JSON-LD payloads per locale, and engine/app JS hashes. Screenshots: `tool-final-audit-*.png` and `ospf-review-{en,zh}-{1440,390,320}.png`.
- `npm run build:i18n`: PASS (66 route groups, 177 localized pages, Tool navigation 80 pages); a second full build left all 120 Tool HTML files unchanged by SHA-256. Running `node scripts/build-multilingual.js` by itself is not the complete build sequence; the following Tool navigation integration stage is required before checking idempotence.
- **P1, preexisting and outside the UI migration:** the Spanish OSPF calculator references local CSS/JS paths that do not resolve from `/es/`, so its calculation results remain empty; its Spanish page also contains mixed-language and corrupted text. The migration preserved its content and logic. The global legacy UI audits also remain failing because their inventory expects 39 tools / 117 pages while the current catalog contains 40 / 120, plus unrelated preexisting route/tag checks. Do not report this batch as a site-wide PASS.

## Known limitations

- `website/topics/data-center-capacity/index.html` is an incomplete bare fragment without the shared shell or topic content. It remains unresolved because its content ownership is unknown.
- The unregistered `pon-optical` and `switching-oversubscription` topic directories do not participate in the multilingual route build and remain outside the Topic Hub batch.
- Other page families still use multiple overlapping CSS systems. The shared shell and Guide article presentation are frozen for incremental migration; the full UI system is not frozen site-wide.
- Loading, empty, and error visual states have not all been captured across tools.
- The homepage category, method, and Trust content is visually confirmed in stable viewport screenshots. No blank placeholder modules remain in the Golden homepage evidence.
- Editorial CTA/link coverage remains uneven across the larger guide library; this UI migration standardized presentation where components exist and did not add or rewrite technical article claims.

## Current acceptance

**PASS WITH P1** for the migrated Guide and registered Topic Hub families. Guide: 30 routes and 150 responsive measurements pass. Topic Hubs: 6 registered routes and 30 responsive measurements pass. Two LACP locale pages retain their preexisting canonical/BreadcrumbList metadata gap; unregistered Topic Hub directories and incomplete `data-center-capacity` remain outside this batch. The scoped Golden UI set remains PASS. The shared shell, Guide and Topic Hub presentation, homepage, switch-oversubscription topic hub, subnet calculator, and subnet guide reference are frozen for incremental migration only. **Not a site-wide UI/UX completion:** unreviewed page families, uneven editorial CTA/link coverage, and broad empty/loading/error-state coverage remain P1 work before a global PASS.
