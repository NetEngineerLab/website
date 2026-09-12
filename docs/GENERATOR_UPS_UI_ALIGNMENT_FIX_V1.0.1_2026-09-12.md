# Generator + UPS Transfer & Ride-Through Planner UI Alignment Fix V1.0.1

- Version: V1.0.1
- Modified: 2026-09-12
- Scope: English and Simplified Chinese tool pages

## Fixes

1. Added a visible return/breadcrumb navigation above the tool hero.
2. Removed the nested-width mismatch that made the hero narrower than the calculator region.
3. Unified breadcrumb, hero, calculator and supporting sections to the same 1400px desktop baseline.
4. Restored the desktop two-column calculator layout and sticky result panel.
5. Kept tablet/mobile single-column responsive behavior.
6. Updated the page CSS cache-busting hash so the deployed site does not reuse the old stylesheet.

## Validation

- Generator + UPS ride-through engine: PASS
- Power tool #32 Audit 2: PASS
- Page Registry contract: PASS
- Tool navigation contract: PASS
