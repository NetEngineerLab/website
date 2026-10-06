# Network Capacity Forecast Planner V1.0 — Engineering Method

The planner starts from measured installed capacity and busy-hour utilization, applies an annual compound growth rate, and optionally adds a peak factor for burst or percentile headroom.

- Current demand = installed capacity × utilization.
- Current peak demand = current demand × (1 + peak factor).
- Expansion threshold = installed capacity × target utilization.
- Time to threshold = `ln(threshold / current peak) / ln(1 + annual growth)` when growth is positive and the threshold is not already reached.
- Required horizon capacity = projected peak demand ÷ target utilization.

This is a planning screen, not a traffic simulator. Validate the assumptions against monthly P95/P99 telemetry, queue drops, link diversity, hardware limits and procurement lead time before approving an expansion.
