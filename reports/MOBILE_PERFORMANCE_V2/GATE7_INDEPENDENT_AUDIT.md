# GATE7 review

This review is a second pass over the diff and the lab evidence in this same change. It is not a separate human auditor.

## Checklist

1. Performance. Mobile lab FCP/LCP moved from 1.56 s to 1.05 s. Desktop stayed at performance 100, with LCP 0.71 s to 0.56 s. The mechanism matches the trace: the Google Fonts CSS hop is gone and five stylesheets are one file. Pass for the lab target. Production is not redeployed, so the live PSI number is still the baseline.
2. Visual. Production 390px and 1440px screenshots and the after screenshots show the same header, hero, search, chips and cookie dialog. Desktop hero SVG is still the right-hand illustration. Pass.
3. Flash. Homepage CSS is one blocking bundle that contains the previous rules, so the first paint is not waiting on a late stylesheet swap of the shell. `font-display: swap` can still swap Geist in after fallback. That is the same policy the Google stylesheet used. CLS stayed 0. Pass with that residual swap.
4. Languages. EN, ZH and ES homepages each load the bundle. ZH screenshot shows Chinese copy and a Chinese cookie dialog. ES preloads latin-ext. Layout check passed on all three. Pass.
5. Tools. No tool page, catalog entry or `llms.txt` destination was removed. Category coverage passed. Pass for inventory. Not a statement that all 47 calculators were clicked.
6. Calculators. Subnet and optical-power-budget engine tests passed. Homepage search still resolves a catalog id to the tool URL. Pass for those paths.
7. Cookie consent. Script unchanged. Decline still persists `false` and closes the dialog. Pass.
8. Cache. Only versioned font filenames are immutable for a year. Unversioned `/assets/*` stay at one day. Homepage HTML still revalidates. The bundle query is `v=20261123-mpv2b`. Fonts are served from `/fonts/`, outside the one-day `/assets/*` rule. Pass, with the operational rule that a font file must be renamed when its bytes change.
9. SEO and links. Canonical and hreflang tags on the homepage were not edited. `llms.txt` links resolve locally. SEO lab score stayed 100. Pass.
10. Security. No enforcing header was added. Report-only CSP, live HSTS with `includeSubDomains`, and the absence of COOP and Trusted Types are documented in GATE5. Pass for “do not set a header just to clear an audit”.

## Residual risks

- Localhost Lighthouse is not the post-deploy PageSpeed number.
- CrUX remains UNKNOWN.
- `npm test` still fails on an unrelated service-worker precache assertion.
- Tool pages still block on Google Fonts.
- `home-bundle.css` must be regenerated when any of its six sources change.

## Verdict

PASS WITH FINDINGS
