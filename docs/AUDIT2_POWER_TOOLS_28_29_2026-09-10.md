# AUDIT 2 — Power Tools #28 / #29

**Date:** 2026-09-10  
**Scope:** UPS Capacity & Battery Backup Runtime Calculator; Data Center Cooling Load & Precision AC Capacity Calculator  
**Final status:** PASS / ACCEPTED

## Delivered

- Tool #28 `ups-capacity-battery-runtime-calculator`
- Tool #29 `data-center-cooling-load-calculator`
- New workflow: `data-center-critical-power-cooling`
- Updated `docs/TELECOM_POWER_ENERGY_ROADMAP_V2.1.md`
- Added engine tests and Audit 2 gate to `prepare:launch`

## Audit findings and corrections

1. **Site-shell integration defect** — the first page implementation omitted the production footer shell required by the multilingual builder. Both English and Chinese pages were corrected to use the standard generated site shell contract.
2. **SEO/GEO intent registration defect** — the two new active tools were not initially registered in `intentByTool`. Both were added as `sizing` intent so Page Registry and SEO/GEO coverage use canonical search intent metadata.
3. **Dependency environment** — the extracted test environment did not contain local `acorn`. The project lockfile requires Acorn 8.15.0; the exact installed version was restored for the test run before executing the complete production gate.

## Engineering checks

### UPS
- kW and kVA limits both evaluated
- engineering headroom applied
- modular N / N+1 / N+2 sizing
- one-module and two-module failure state available
- battery energy derated by DOD, efficiency, aging and temperature factors
- runtime and target-Ah planning
- bypass current estimate
- explicit boundary: final runtime must use manufacturer discharge/runtime curve

### Cooling
- IT sensible heat
- UPS/PDU losses inside conditioned space
- lighting, people, envelope and other sensible load
- engineering headroom
- precision AC unit sizing with N / N+1 / N+2
- one-unit-failure capacity check
- kW, BTU/h and refrigeration-ton conversion
- airflow estimate from sensible load and delta-T
- explicit boundary: latent load/psychrometric and manufacturer performance selection remain outside V1

## Final production gate

`npm run prepare:launch` — PASS

- Active tools: 29
- Active workflows: 8
- Workflow coverage: 29/29
- Tool navigation pages: 58
- Public pages: 72
- Sitemap URLs: 70
- Calculation engine suites: 29 PASS
- Service Workers: 29 PASS
- Internal links: 3633 PASS
- Architecture: 0 errors / 0 warnings
- i18n: PASS
- SEO / Schema / GEO: PASS
- Production Acceptance: PASS

## Decision

**PASS / ACCEPTED.** Tools #28 and #29 may enter the production baseline.
