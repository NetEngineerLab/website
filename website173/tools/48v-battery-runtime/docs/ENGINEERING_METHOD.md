# Engineering method

## Scope

This calculator estimates runtime and preliminary capacity for stationary -48 V telecom DC systems.

## Core relationships

- Nominal string voltage = nominal cell voltage × cells in series
- Design load = base load × (1 + design margin)
- Battery-side power = design load ÷ DC path efficiency
- Average current = battery-side power ÷ average discharge voltage
- Simplified runtime = corrected Ah ÷ average current

Corrected Ah applies editable usable-depth, ageing, temperature and manufacturer-curve factors.

## Peukert estimate

For a capacity rating of C Ah over H hours:

```text
I_rated = C / H
t_full = H × (I_rated / I_actual)^k
t_corrected = t_full × usable factors
```

For constant-power ICT loads, the calculator uses current at the average discharge voltage. This is an approximation, not a replacement for manufacturer constant-power discharge tables.

## Important boundary

No AC power factor is used. The battery supplies a DC bus during an outage. The DC path efficiency input represents cabling, distribution and conversion losses.

## Final design review

Verify:

- measured site load and load growth
- manufacturer discharge table at selected end voltage
- temperature correction
- ageing/end-of-life criterion
- current sharing and protection of parallel strings
- cable voltage drop and low-voltage disconnect
- lithium BMS limits where applicable
