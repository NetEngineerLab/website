# NetEngineerLab Telecom Power & Energy Roadmap V2.1

**Modified:** 2026-09-10

## Product principle
Deep engineering first, breadth second. Every tool must expose assumptions, edge conditions, warnings, bilingual routes, workflow context, tests and production acceptance.

## Delivered tools
1. Network Rack Power & Cooling Calculator
2. -48V Telecom Battery Runtime Calculator
3. Generator Fuel Consumption & Runtime Calculator
4. Telecom Solar Power & Battery Sizing Calculator
5. PUE & Data Center Energy Efficiency Analyzer
6. **Telecom Rectifier & DC Power System Sizing Calculator — Tool #26**
7. **Telecom AC/DC Power Capacity & Breaker Sizing Calculator — Tool #27**
8. **UPS Capacity & Battery Backup Runtime Calculator — Tool #28**
9. **Data Center Cooling Load & Precision AC Capacity Calculator — Tool #29**
10. **DC Plant Efficiency & Rectifier Load-Sharing Analyzer — Tool #30**
11. **Data Center Airflow & Hot-Aisle Containment Planner — Tool #31**

## Tool #26 engineering scope
- DC load + battery recharge peak
- Rectifier module sizing
- N / N+1 / N+2 redundancy
- One-module and two-module failure check
- Expansion margin
- Rectifier efficiency and estimated AC input demand
- Existing installed module adequacy

## Tool #27 engineering scope
- Single-phase and three-phase AC operating current
- Power factor and conversion efficiency
- Engineering headroom and combined derating
- Planning breaker candidate from standard current steps
- Optional DC branch design current
- Explicit warning that final protection/conductor selection requires code, fault-level and selectivity review

## Next planned tools
### Tool #28 — UPS Capacity & Battery Backup Runtime Calculator — DELIVERED
Deep scope: kW/kVA, PF, UPS efficiency, N/N+1/N+2 modular sizing, battery strings, autonomy, DC bus, recharge, aging/temperature margin, bypass and one-module-failure checks.

### Tool #29 — Data Center Cooling Load & Precision AC Capacity Calculator — DELIVERED
Deep scope: IT heat, UPS/PDU losses, people/lighting/envelope allowance, sensible load, engineering margin, kW-to-BTU/h and refrigeration-ton conversions, airflow estimate and N/N+1/N+2 planning.

### Tool #30 — DC Plant Efficiency & Rectifier Load-Sharing Analyzer — DELIVERED
Deep scope: per-module measured current, mean-current deviation, load-sharing spread, module loading, N/N+1/N+2 resilience, measured AC-to-DC efficiency, conversion loss, suspected low-output module screening and target online-module planning.

### Next candidates
- Tool #31 — Data Center Airflow / Hot-Aisle Containment Planner — DELIVERED
- Tool #32 — Generator + UPS Transfer & Ride-Through Planner — DELIVERED

## Workflow target
Rack/site load → AC/DC distribution → Rectifier sizing → DC plant load-sharing/efficiency diagnosis → Battery → Generator → Solar/storage → Facility efficiency.


## Data Center Critical Power & Cooling Workflow
Rack IT load → UPS capacity & battery autonomy → Precision cooling sizing → Airflow / aisle containment → PUE / energy-efficiency analysis.


### Tool #31 engineering scope — DELIVERED
- Rack-based or direct total IT heat input
- Supply/return temperature delta and first-order sensible airflow calculation
- Bypass-air correction and hot-air recirculation screening
- Estimated rack-inlet mixing temperature
- CRAH/CRAC airflow and sensible-capacity dual constraint
- N/N+1/N+2 unit planning and one-unit-out resilience
- Per-rack effective airflow and installed airflow/cooling margins
- Explicit boundary: planning model, not CFD or psychrometric latent-load design


### Tool #32 engineering scope — DELIVERED
- Critical-load UPS kW adequacy
- UPS autonomy at actual critical load and initial battery SOC
- Utility-failure detection, generator start delay, crank attempts and retry intervals
- Generator warm-up, ATS transfer and post-transfer stabilization timeline
- User-defined ride-through reserve and latest safe transfer time
- Generator N/N+1-style available-unit check and usable-rating derating
- Step-load margin screening and generator load percentage
- Explicit boundary: planning model, not ATS/UPS/generator commissioning acceptance
