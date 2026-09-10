# Generator Fuel Consumption & Runtime Calculator — Engineering Method

Version: V1.0
Modified: 2026-09-10

## Scope
Preliminary telecom generator fuel and outage-autonomy planning from a user-entered manufacturer fuel curve. The tool does not claim a universal diesel consumption curve.

## Method
1. Convert kVA to kW only when kW is not supplied: `rated kW = kVA × power factor`.
2. Interpolate fuel flow linearly between user-entered 0/25/50/75/100% load points.
3. Sum each operating period: `fuel = interpolated L/h × hours`.
4. Usable tank fuel deducts reserve percentage and explicitly unusable fuel.
5. Runtime uses the weighted average profile fuel rate.
6. Target fuel repeats the entered profile in sequence for the requested outage duration.
7. Battery-first assistance is an energy-equivalent estimate only: `usable battery kWh × efficiency / average load kW`.

## Boundaries
Final engineering approval must use the exact generator manufacturer's fuel-consumption table, site altitude/temperature derating, fuel return arrangement, tank usable volume, maintenance constraints and local fuel-storage rules. Long-duration low-load operation requires manufacturer review.
