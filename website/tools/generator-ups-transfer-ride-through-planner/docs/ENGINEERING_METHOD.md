# Generator + UPS Transfer & Ride-Through Planner — Engineering Method

Version: V2.1-Power-Tool-32  
Modified: 2026-09-10

## Scope
This planner checks two independent constraints: (1) UPS ride-through time from utility failure until generator-backed supply is stable, and (2) UPS/generator power capacity under redundancy and step-load margin.

## Timing model
Transfer window = detection + start delay + crank attempts + retry intervals + warm-up + ATS transfer + post-transfer stabilization. Required UPS ride-through adds a user-defined reserve.

## Capacity model
UPS must carry the critical kW load. Generator usable capacity is reduced by unavailable/reserved units and a configurable usable-rating factor, then compared with critical load multiplied by a step-load factor.

## Safety boundary
This is a planning model, not a commissioning substitute. Actual UPS battery runtime must come from vendor curves or measured data at the real load. Generator transient response, UPS input compatibility, ATS/STS logic, protection coordination, neutral/earthing and site start tests remain mandatory.
