# UI Migration Plan

## Stage 1 — Audit and freeze requirements

Capture the P0/P1/P2 findings in `UI_AUDIT.md`; freeze tokens and component rules in `DESIGN_SYSTEM.md` and `UI_COMPONENT_SPEC.md` before broad migration.

## Stage 2 — Golden pages

1. Shared Header/Footer and navigation on every Golden route.
2. Homepage `/`.
3. Topic hub `/topics/switch-oversubscription/`.
4. Calculator `/tools/subnet-calculator/`.
5. Screenshot article `/guides/subnet-calculator-guide/` as the content-page reference required by this request.

Verify the shared shell and desktop/mobile behavior before moving to additional page families. The extra article reference does not expand scope into engine, formula, or SEO changes.

## Stage 3 — Acceptance and freeze

Run desktop, tablet, and mobile screenshots at 1440, 768, 390, 375, and 320px. Check alignment, overflow, nav interactions, primary CTAs, calculator behavior, focus, and representative result/error states. Store evidence in `UI_EVIDENCE.md`. Freeze the shared token and component files only after review passes.

Golden UI status: PASS for the shared shell, homepage, switch-oversubscription topic hub, subnet calculator, and subnet guide reference. The shared shell and component rules are frozen for incremental page-family migration. This is not a site-wide freeze; unresolved site-wide P1s remain listed in `UI_EVIDENCE.md`.

## Stage 4 — Incremental migration

Migrate one family at a time: guide articles, topic hubs, tool pages, then secondary directory/marketing pages. For each family, update its source/template and shared stylesheet, rebuild generated pages, compare against the Golden screenshot, and run that family’s existing tests before proceeding. Do not rewrite all HTML files directly.

Progress: **Guide article family PASS WITH P1** — 16 English and 14 Chinese routes use the shared article presentation; all 150 measurements across 320, 375, 390, 768, and 1440px passed. The multilingual generator now supplies shared Header/Footer on shell-less Guide inputs and preserves the complete generated shell on rebuild. A content-first generator guide uses the shared frame and localized breadcrumb/CTA components. Two LACP locale pages already lack a canonical link and BreadcrumbList JSON-LD; their existing Article/WebPage graph and OG metadata were preserved without SEO edits.

**Topic Hub family PASS WITH P1** — the 3 registered topic routes in English and Chinese (6 pages) use the shared Topic Hub stylesheet, tokenized content frame, and localized return breadcrumbs. All 30 measurements at 320, 375, 390, 768, and 1440px passed; the build is idempotent. Unregistered `pon-optical` and `switching-oversubscription` pages and the incomplete `data-center-capacity` fragment remain outside this batch.

**Tool family PASS WITH P1** — all 40 active tools (120 localized pages) use the shared tool detail template, including the previously legacy OSPF calculator. The shared Tool Hero now uses a restrained white surface, fine border, and compact mobile typography; long-title 320px Hero height is 425px, with calculator inputs visible from y=630. 80 Chrome Desktop browser tests passed for English/Chinese tools, including result calculations and report-center sample import. OSPF engine test and two OSPF calculator browser tests passed. Independent visual review covered Tool Hero representatives at 320/390/1440px and OSPF en/zh at the same widths. The full build is idempotent across all 120 Tool HTML pages. OSPF Spanish retains preexisting broken local JS/CSS paths and mixed/garbled copy; this remains P1 and was not repaired in this UI-only batch. The repository's legacy static audits still fail on baseline inventory drift (39/117 expected vs 40/120 actual) and unrelated tool path/tag issues. Next family: secondary directory/marketing pages.

## Article publishing workflow

For each existing original article: preserve its technical claims; add a small number of contextual internal links; choose one primary tool CTA and avoid repeated competing CTAs; prepare locale/platform adaptations; draft a publishing recommendation; and make a separate promotion plan for owned channels. Keep technical article body useful on its own and preserve existing canonical/schema structure.

## Rollback boundary

Keep each family change confined to its source/template and shared CSS. If a Golden page fails width, navigation, accessibility, or calculator checks, revert that family before migrating another. Existing user changes in the shared workspace must be preserved.
