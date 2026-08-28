# NetEngineerLab Architecture Migration Plan

Version: 1.0
Date: 2026-08-27

## Goal

Bring the existing NetEngineerLab site into compliance with `.github/copilot-instructions.md` without changing public URLs, calculation formulas, or existing user-facing functionality.

## Current baseline

- 20 active tools
- 54 localized public HTML pages
- English and Simplified Chinese active
- Static output in `website/`
- Cloudflare Pages production deployment with Vercel compatibility
- Node.js build and validation scripts

## Migration phases

### Phase 1 — Architecture design closure

- Define configuration and version sources.
- Define source and generated file boundaries.
- Define public-page and system-page SEO rules.
- Define tool module responsibilities.
- Define measurable acceptance gates.

Exit criterion: architecture rules and checklist are complete and internally consistent.

### Phase 2 — Validation baseline

- Remove hard-coded tool counts.
- Align release versions.
- Add a structural validator for every active tool.
- Make validation output describe its actual coverage.

Exit criterion: the validation system accurately reports current failures and no longer fails because of stale assumptions.

### Phase 3 — PWA and system pages

- Add missing `pwa.js` modules.
- Confirm every tool registers its Service Worker.
- Synchronize shared hashed assets in Service Worker caches.
- Add viewport and `noindex,follow` to Offline pages.

Exit criterion: every active tool has working registration, manifest, Service Worker, and offline fallback.

### Phase 4 — Calculation-engine separation

- Move calculation logic out of legacy `app.js` files.
- Keep DOM and interaction logic in `app.js`.
- Add deterministic tests before and after each migration.

Target tools:

- `fiber-loss`
- `onu-rx-power`
- `optical-power-budget`
- `pon-distance`
- `pon-splitter-loss`

Exit criterion: all active tools have independent, testable engines and preserved results.

### Phase 5 — SEO, browser tests, and final acceptance

- Add missing `x-default` and social metadata.
- Activate desktop and mobile browser smoke tests.
- Ensure all 20 engines have automated coverage.
- Run build, local acceptance, browser tests, and Lighthouse policy checks.

Exit criterion: `npm run verify` passes and all items in `ARCHITECTURE_ACCEPTANCE_CHECKLIST.md` are complete.

## Non-negotiable constraints

- Do not change existing public URLs.
- Do not delete tools or supported languages.
- Do not alter formulas without dedicated engineering review.
- Do not publish a batch that fails acceptance.
- Do not mix unrelated visual redesign work into the migration.

## Rollback strategy

Each phase is implemented in small commits. A failed phase is reverted independently without reverting previously accepted phases.
