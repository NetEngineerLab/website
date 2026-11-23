# GATE5 security header audit

Audit only. No security header was added, removed or enforced. Cloudflare was not changed. This is not a release candidate for header enforcement.

## What production sends

Checked with `curl -sI https://netengineerlab.com/` on 2026-11-23.

| Header | State |
|---|---|
| Content-Security-Policy | Absent |
| Content-Security-Policy-Report-Only | Present. `default-src 'self'`. Scripts allow self, unsafe-inline, Cloudflare Insights, Google Tag Manager, AdSense. Styles allow self, unsafe-inline, `fonts.googleapis.com`. Fonts allow self, data, `fonts.gstatic.com`. Connect allows self, Cloudflare Insights, Google Analytics, Tag Manager, DoubleClick, AdSense. Frames allow self, googlesyndication, doubleclick, google.com. `object-src 'none'`. `base-uri 'self'`. `frame-ancestors 'self'`. |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` |
| Cross-Origin-Opener-Policy | Absent |
| Trusted Types / Require-Trusted-Types-For | Absent |

The same report-only policy is in `website/_headers`. `vercel.json` does not send CSP or HSTS. Pages is the live host.

## Report-only before enforcement

Enforcement is not proposed in this change. A future enforcing policy needs a report endpoint and a review of violations from real Chrome traffic, including:

- GA4 (`googletagmanager.com`, `google-analytics.com`)
- AdSense (`pagead2.googlesyndication.com`, doubleclick frames)
- Cloudflare Insights beacon and `cdn-cgi/rum`
- Google Fonts on tool, guide and document pages (the three homepages no longer request them)
- Inline JSON-LD and the cookie banner's `innerHTML`

`script-src` still needs `'unsafe-inline'` until those inline scripts move to hashes or nonces. Turning the report-only policy into an enforced policy without that review would break ads, analytics or fonts.

## COOP

No `window.open` usage was found under `website/assets/js`. AdSense frames are cross-origin. `same-origin` COOP can break popup and OAuth flows those frames use. No COOP header is recommended until a page that needs it is identified. Do not set COOP to satisfy a Lighthouse checkbox.

## Trusted Types

`cookie-consent.js` assigns `innerHTML` for the banner. `site.js` assigns `innerHTML` for the tool grid. An enforcing Trusted Types policy would block both. Do not enable `require-trusted-types-for 'script'` in this release.

## HSTS

`includeSubDomains` is already in production with a one-year max-age. This audit did not inventory every DNS name in the zone, so it does not add `preload` and does not newly enable `includeSubDomains`. Removing the live `includeSubDomains` flag was also out of scope: that is a production security change and belongs in its own release, after a subdomain review.

## Homepage font change and CSP

Self-hosted fonts use `font-src 'self'`, which the report-only policy already allows. The homepage no longer needs `fonts.googleapis.com` or `fonts.gstatic.com`. Other pages still do, so those hosts stay in the report-only policy.
