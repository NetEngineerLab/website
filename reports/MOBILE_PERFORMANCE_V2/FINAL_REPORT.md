# Mobile Performance V2.0 final report

Verdict: **PASS WITH FINDINGS**

Date: 2026-11-23, Asia/Shanghai. Branch: `cursor/mobile-performance-v2-4364`. Base: `main` at `58b7185958af1798247c1ee1c8a2547bd21e12fd`. Not merged. Not deployed. Cloudflare was not changed.

## What changed

The mobile lab LCP is the hero text, not the SVG. It was waiting on a render-blocking Google Fonts stylesheet plus five same-origin stylesheets. The three homepages now self-host Geist (weights 400–700, latin and latin-ext) and load those rules as one `home-bundle.css`. The desktop LCP image has its real 540×500 box and `fetchpriority="high"`. Contrast pairs that failed 4.5:1 were darkened without changing the primary button blue. `llms.txt` now uses real Markdown links to the same tools, topics and guides.

Cookie consent, the tool catalog, tool-page fonts, and security headers were measured and left in place. The reasons are in GATE1 and GATE5.

## Lab comparison

Lighthouse 13.6.0, three-run median. PSI API returned 429, so this is the same engine rather than the PageSpeed product UI. CrUX: UNKNOWN.

| | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---:|---:|---:|---:|
| Performance | 99 | 100 | 100 | 100 |
| Accessibility | 96 | 100 | 96 | 100 |
| Best practices | 100 | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 | 100 |
| Agentic browsing | 2/3 | 3/3 | 2/3 | 3/3 |
| FCP | 1.56 s | 1.05 s | 0.46 s | 0.28 s |
| LCP | 1.56 s | 1.05 s | 0.71 s | 0.56 s |
| Speed Index | 1.56 s | 1.05 s | 0.46 s | 0.28 s |
| TBT | 0 ms | 0 ms | 0 ms | 0 ms |
| CLS | ~0 | 0 | ~0 | 0 |

“After” is localhost with the new files. “Before” is production. The acceptance targets for the lab run are met. The live site still serves the before build until this branch is deployed by a person.

The Cloudflare Pages branch preview confirmed the same result on the CDN: mobile performance 100, FCP/LCP 0.94 s, accessibility 100, agentic browsing 3/3. Preview SEO is 69 only because Pages sends `noindex` on `*.pages.dev`. Production does not. Details are in GATE6.

## Findings that keep this from a clean PASS

- The Pages preview was measured. Production `netengineerlab.com` was not, because this change does not deploy production.
- Field Core Web Vitals are UNKNOWN.
- The production build now stays clean. `build:i18n` refreshes the site-shell hash on generated pages and service workers, keeps the three homepages on `home-bundle.css`, and writes `llms.txt` with Markdown links. A second build leaves the worktree unchanged. The tool-detail V3 contract, including the SFP/QSFP precache, passes on that tree.
- Not every calculator was exercised in a browser. Subnet and optical budget engines passed. Category coverage passed.
- `/assets/*` remains a one-day cache. Only the new font files are immutable for a year.
- HSTS `includeSubDomains` is already live. Preload was not added. CSP stays report-only.

## Rollback

Revert the branch. The homepages return to the Google Fonts tags and the six stylesheets. `website/_headers` loses only the `/fonts/*` block. `llms.txt` can be restored from `main`. No Cloudflare purge rule was created. After deploy, HTML revalidates immediately (`max-age=0`). Font files are new URLs, so they do not collide with an old cache entry. The bundle URL is `home-bundle.css?v=20261123-mpv2b`.

## Evidence

- `GATE0_BASELINE.md` through `GATE7_INDEPENDENT_AUDIT.md`
- `lighthouse/baseline/` production JSON
- `lighthouse/after/` localhost JSON
- `screens/` production and after screenshots
