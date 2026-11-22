# Ten engineering tools, 2026-11-19

Status: **not mergeable**. This branch is a draft because the default-branch gates are already red, and adding these pages creates one new contract failure that this branch does not edit.

- Base: `1c849433e568548c6a7b42d5be4cc4603845caae` (`main` at the time of the branch).
- Branch: `cursor/ten-engineering-tools-89ec`.
- Catalog: 47 active tools before, 57 after. Orders 48–57.
- Parallel work: PR 65 (`cursor/gate-build-contract-281f`) was read only. It was not checked out, pushed, cherry-picked, or rebased. No old engine, old assertion, threshold, or shared stylesheet was changed.
- Local preview used for the browser run: `http://127.0.0.1:4173`. No Cloudflare deploy and no public preview was created.

## Inventory on the base

The catalog source is `src/registry/tool-registry.json`. It had 47 active tools, highest order 47, from `fiber-loss` through `route-summarization-calculator`.

Published routes also include tools that are not in that catalog: `ip-camera-network-planner`, `application-bandwidth-analyzer`, `data-center-architecture-decision-workshop`, `network-asset-lifecycle-tracker`, `oob-network-design-planner`, plus the hubs `pon-fiber-calculators`, `switching-bandwidth-calculators`, and `datacenter-power-calculators`.

Open pull requests seen before implementation, and left untouched:

- #65 gate failures on `cursor/gate-build-contract-281f`
- #61 fiber-latency gaps
- #59 chromatic-dispersion V3
- #52 docs audit
- #49 UI unification docs

`docs/roadmap/DEVELOPMENT_CANDIDATES.md` lists candidates as not started. None of those candidates was split into these ten tools. VXLAN/MTU-adjacent, STP, serialization, and all-reduce were skipped because a tool for that job already exists or the candidate is not a separate numeric model.

## The ten tools

Each page is EN `/tools/<id>/`, ZH `/tools/<id>/zh/`, ES `/tools/<id>/es/`. Results are engineering approximations, not a measurement guarantee.

| Tool | Value | Independent numeric case |
| --- | --- | --- |
| ITU DWDM grid | Frequency and vacuum wavelength from the G.694.1 anchor | n = 0, anchor 193.1 THz, spacing 100 GHz → 193.1 THz and 299792.458/193.1 nm |
| EDFA ASE / OSNR | ASE and OSNR from gain, noise factor, frequency, bandwidth, and identical spans | `P_ASE = N·F·h·f·(G−1)·B`, `OSNR = P_ch/P_ASE`, with the exact Planck constant. The page default (0 dBm, 20 dB gain, 5 dB NF, 193.1 THz, 12.5 GHz, 1 span) shows 33.0042 dB |
| Ethernet line coding | Payload rate to line rate for published 802.3 ratios | 10 Gbit/s × 66/64 = 10.3125 Gbit/s |
| Mathis TCP ceiling | Loss-based congestion-avoidance ceiling and optional BDP | MSS 1460 bytes, RTT 40 ms, p = 0.0001 → 29.2 Mbit/s |
| M/M/1 delay | Utilization, wait, sojourn, and queue length | 800/s arrival and 1000/s service → ρ = 0.8, sojourn 5 ms, wait 4 ms |
| Path availability | Series or parallel independent blocks, or MTBF/(MTBF+MTTR) | Two independent 0.999 blocks in parallel → 0.999999. The page default is MTBF 8760 h and MTTR 4 h → 8760/8764 |
| DC feeder drop | Copper feeder resistance and voltage drop | 1 A, 58 m, 1 mm², one conductor, 20 °C, ρ = 1/58 Ω·mm²/m → 1 Ω and 1 V |
| Pathway fill | Cross-section fill after the circle constant cancels | Three 20 mm cables in a 100 mm pathway → 12%. The optional limit is a planning assumption, not a code table |
| Copper propagation delay | Delay from length and a user-entered velocity factor | 100 m at VF = 1 → 100/299792458 s. The page default VF 0.65 shows 513.1755 ns |
| Shannon AWGN capacity | `C = B log2(1+S/N)` | 20 MHz at 20 dB (linear ratio 100) → 20e6 × log2(101) bit/s, shown as 133.16423 Mbit/s |

Not duplicates of fiber loss, optical power budget, chromatic dispersion, PMD, fiber latency, serialization delay, bandwidth/file-transfer time, PoE drop, wireless link budget, or the qualitative network-risk page. Presets of one model were not split into separate tools.

Public sources linked on the pages include ITU-T G.694.1, BIPM and NIST constants (c and h), RP Photonics amplifier noise, IEEE 802.3, Mathis et al. ACM CCR 1997 (DOI 10.1145/263932.264023), RFC 6349, RFC 879, the M/M/1 and Kendall references, NIST/SEMATECH availability material, IEC Electropedia availability, IEC 60028, the international inch and foot, and Shannon 1948. The copper temperature coefficient is an editable assumption, not a cable rating. No equipment datasheet was invented.

Each `docs/engine-test.js` recomputes the formula in its own `reference()` and checks a normal case, a changed input, an invalid list, a unit conversion, and a finite boundary. That reference is not the engine under test.

## What was registered, and what was frozen

New math lives only in each new `website/tools/<id>/js/engine.js`. `reports/new-ten-tools-20261119/engine-hashes-before.json` records SHA-256 of the 51 engines that already existed. `node scripts/new-ten-tools-20261119-test.js` checks those hashes and then runs the ten new engine tests. Result: 51 unchanged, 10 PASS.

Shared registration is limited to appending registry and workflow entries, search intents, the generated catalog and tool graph, the catalog script hash on the six pages that already referenced it, tool-count and category-count text, the tools-directory cards and ItemList, and sitemap URLs. `integrate-tool-navigation` and the full i18n rebuild were not run. Header and footer markup was copied from the current route-summarization shell. Tool layout is in each tool's `css/style.css`.

## Browser verification

Command:

`npx playwright test tests/browser/new-ten-tools-20261119.spec.js --project=chrome-desktop`

Playwright 1.62.1 from the existing lock. Chromium 151.0.7922.34 was downloaded for that locked version because this machine had no Playwright browser cache. `package-lock.json` was not changed.

Result: **120/120 PASS** (10 tools × en/zh/es × 1440×900, 1280×800, 390×844, and 320×740).

On every row the test loaded the page, read a real initial number, edited the probed input and saw the primary number change, reset back to the initial number, entered an invalid value and saw an error with the previous number cleared to an em dash, reset again, loaded the example, and downloaded a CSV that contained the numeric result. It also checked keyboard focus, the orange result color `#E8590C` (`rgb(232, 89, 12)`) at font-weight 400, a visible contents list, no same-origin failed resource, no console error, and no document-level horizontal overflow. English also opened the language menu and followed the Chinese URL. Home shows tool count 57 and optical count 9. The tools directory links all ten ids. The sitemap contains all 30 locale URLs.

Machine-readable rows: `browser-results.json`. Screenshots: `screenshots/<tool>-<locale>-<viewport>.png` (120 files). Full-page captures also show the site's sticky header and cookie banner; a separate DOM measurement at 1440×900 put the header bottom at 107 px and the result top at 385 px, so they do not overlap in the layout. At 390×844 the Shannon input panel starts at y 373 and the result panel at y 1208.

## Commands on this branch

| Command | Result | Class |
| --- | --- | --- |
| `node scripts/new-ten-tools-20261119-test.js` | PASS | new tools |
| Playwright command above | PASS, 1 passed (2.6m) | new tools |
| `node scripts/page-registry-contract-test.js` | PASS, 94 families, 253 localized pages, sitemap exact | registration |
| `node scripts/expected-sitemap-test.js` | PASS, 267 URLs | registration |
| `node scripts/category-coverage-check.js` | PASS | registration. On the base this failed because the home category markers were 0. They now match the 57-tool catalog. The checker was not weakened. |
| `node scripts/tool-navigation-contract-test.js` | FAIL | inherited: `route-summarization-calculator` en/zh still has a legacy related section |
| `node scripts/ui-trust-contract-test.js` | FAIL | inherited: `website/terms/index.html` has no tool-count marker. That marker is part of PR 65 and was not added here. After both land, the terms marker has to be 57, not 47. |
| `node scripts/engineering-rules-runtime-test.js` | FAIL | inherited: missing `route-summarization-calculator/sw.js` |
| `node scripts/architecture-validate.js` | FAIL | inherited: route-summarization missing app.js, pwa.js, manifest, and sw.js; fiber-link-budget guide header. No new architecture error. |
| `node scripts/tool-detail-v3-contract-test.js` | FAIL `185 !== 155` | **new.** 155 + 30 locale pages = 185. The structural loop for the new pages completed before this count assertion. The assertion in `scripts/tool-detail-v3-contract-test.js` was not changed. On the base the same file printed 155 and then failed on the sfp-qsfp precache check, so that older failure is currently hidden behind the count. |

Raw logs: `baseline-main.txt` (commands run on the base before these tools existed) and `commands-after.txt`.

## Parent coordination before merge

1. Allow the V3 page-count assertion to move from 155 to 185, and re-check the sfp-qsfp precache failure that the count currently hides.
2. When PR 65 adds the terms tool-count marker, set it to the catalog size after both changes (57 if this branch is the other delta).
3. Expect overlap on `website/sitemap.xml`, `website/index.html`, and `website/tools/index.html` if PR 65 also edits those files. This branch only changes counts, cards, ItemList, catalog hash, and appended sitemap URLs.
