# NetEngineerLab Architecture Acceptance Checklist

Date: 2026-08-28

## Repository and configuration

- [x] Architecture instructions are tracked by Git.
- [x] Root `VERSION` is the release-version source.
- [x] Generated version fields are synchronized.
- [x] Active tool counts are configuration-driven.
- [x] Active locale counts are configuration-driven.
- [x] Route counts are configuration-driven.

## Tool structure

- [x] Every active tool has `index.html`.
- [x] Every active tool has `js/app.js`.
- [x] Every active tool has `js/engine.js`.
- [x] Every active tool has `js/pwa.js`.
- [x] Every active tool has `manifest.webmanifest`.
- [x] Every active tool has `sw.js`.
- [x] Existing public tool URLs are unchanged.

## Calculation engines

- [x] Engine modules do not depend on the DOM.
- [x] Every active engine has deterministic tests.
- [x] Existing calculation fixtures produce unchanged results.
- [x] Invalid and boundary inputs are covered.

## HTML and SEO

- [x] Every public page has a unique Title.
- [x] Every public page has a unique Description.
- [x] Every public page has the correct Canonical.
- [x] Localized pairs have `en`, `zh-CN`, and `x-default` links.
- [x] Structured data parses successfully.
- [x] Offline and 404 pages use `noindex,follow`.
- [x] Offline and 404 pages are excluded from Sitemap.
- [x] Internal links and anchors pass validation.
- [x] Sitemap exactly matches base routes and all active tool/locale routes (52 URLs).

## Shared site shell

- [x] Every public page uses the generated Header and Footer markers.
- [x] English and Chinese Header/Footer templates are the only shell markup sources.
- [x] Every public page loads the shared design tokens and site-shell stylesheet.
- [x] All 54 public pages share one normalized Header DOM and one normalized Footer DOM.
- [x] Desktop computed Header/Footer shell signatures are consistent.
- [x] Mobile computed Header/Footer shell signatures are consistent.
- [x] Mobile navigation opens, closes, and exposes the correct expanded state.

## PWA

- [x] Every active tool registers its Service Worker.
- [x] Every Manifest parses and uses the correct scope.
- [x] Shared cached assets use current content hashes.
- [x] Service Worker scripts are served with revalidation.
- [x] Offline fallback works for every tool.
- [x] Cache updates do not strand users on old assets.

## Browser and responsive behavior

- [x] Chrome desktop smoke test passes.
- [x] Edge desktop smoke test passes.
- [x] Android-sized viewport smoke test passes.
- [x] iPhone-sized viewport smoke test passes.
- [x] No tested page has horizontal overflow.
- [x] No tested page has blocking JavaScript errors.

## Build and release

- [x] `npm run build` passes.
- [x] `npm run validate:i18n` passes.
- [x] Architecture validation passes.
- [x] Calculation-engine tests pass.
- [x] Local production acceptance passes.
- [x] Lighthouse policy checks pass.
- [x] `npm run verify` passes.
- [x] Release manifest matches the final site tree.
