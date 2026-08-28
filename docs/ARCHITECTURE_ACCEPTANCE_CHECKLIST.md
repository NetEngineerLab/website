# NetEngineerLab Architecture Acceptance Checklist

Date: 2026-08-28

## Repository and configuration

- [ ] Architecture instructions are tracked by Git. (Pending commit; no commit was authorized.)
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
