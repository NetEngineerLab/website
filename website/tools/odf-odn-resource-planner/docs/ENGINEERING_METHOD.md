# ODF / ODN resource planning method

## Scope

This planner converts an ONU target into PON ports, splitter quantities, feeder/distribution/drop core capacity, ODF ports and splice-tray capacity. It compares A/B/C resource plans and uses a deterministic worst-path loss check only as a design gate. It does not replace the existing detailed fibre-loss, optical-budget, OTDR or ONU diagnostic tools.

## Resource equations

- `effective ONU per port = min(total split ratio, operator cap)`
- `PON ports = ceil(target ONU / effective ONU per port)`
- Splitter counts recurse by stage: level 1 = PON ports; level 2 = PON ports × r1; level 3 = PON ports × r1 × r2.
- `planned cores = ceil(working cores / (1 - reserve rate))`
- Planned cores are rounded up into one or more standard cable sizes: 4, 6, 8, 12, 24, 36, 48, 72, 96, 144 and 288 cores. Values above one cable are explicitly represented as a multi-cable combination.
- `resource gap = max(0, required - existing)`.

The 3 dB warning boundary is a NetEngineerLab planning threshold, not a mandatory value from the referenced Recommendations. Optical interface values and component loss must be verified against the selected equipment and passive-component datasheets.

## Status and recommendation

Invalid or missing topology/capacity inputs are `INCONCLUSIVE`. Capacity, cable-selection, maximum ODN loss or reach failures are `FAIL`. Feasible plans with less than the configured reserve, cable utilization above 90%, or optical headroom below 3 dB are `WARNING`; otherwise they are `PASS`. The recommendation orders status first, then resource gap, overbuild, optical headroom and PON-port demand. An inconclusive plan cannot be recommended.

## Deliverable boundary

The BOM is a planning quantity. It excludes surveyed route length, cable purchase allowance, closures by construction method, vendor part numbers, labour and pricing. ODF, tray and closure capacities are user or vendor inputs, not universal ITU values.

## Official reference points

- [ITU-T G.984.2](https://www.itu.int/rec/T-REC-G.984.2/en), GPON PMD requirements.
- [ITU-T G.9807.1](https://www.itu.int/rec/T-REC-G.9807.1/en), XGS-PON.
- [ITU-T G.652](https://www.itu.int/rec/T-REC-G.652/en), single-mode fibre.
- [ITU-T G.657](https://www.itu.int/rec/T-REC-G.657/en), bend-insensitive single-mode fibre.
- [ITU-T G.671](https://www.itu.int/rec/T-REC-G.671/en), passive optical components.

Reviewed: 2026-09-30.
