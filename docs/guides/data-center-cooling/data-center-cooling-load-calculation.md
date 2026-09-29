# Data Center Cooling Load Calculation — Engineering Reference

## Core equations

```text
Base sensible load (kW)
  = IT + UPS loss + PDU loss + lighting + people + envelope + other sensible heat

Design load (kW) = Base sensible load × (1 + engineering margin)
Running units = ceil(Design load ÷ Unit sensible capacity)
Installed N+1 units = Running units + 1
```

Use the unit's **sensible capacity at the design condition**, not only its nominal total-cooling rating.

## 120 kW worked check

```text
Base = 120 + 6 + 3 + 2 + (4 × 0.12) + 5 + 2
     = 138.48 kW
Design = 138.48 × 1.15 = 159.25 kW
Tons = 159.25 ÷ 3.51685 = 45.3 RT
```

With 50 kW sensible-capacity units, four units must run and five are recommended for N+1. After one unit is unavailable, 200 kW remains, so the example passes the capacity check.

## Review checklist

- Define the cooling boundary before adding losses.
- Separate measured IT demand from nameplate capacity.
- Include a heat source only where it is released.
- Document the reason for the engineering margin.
- Check manufacturer sensible capacity at actual conditions.
- Verify power, controls, airflow and heat rejection under N+1.

## Live resources

- [Full calculation guide](https://netengineerlab.com/guides/data-center-cooling-load-calculation/)
- [Cooling load calculator](https://netengineerlab.com/tools/data-center-cooling-load-calculator/)
- [Topic hub](https://netengineerlab.com/topics/data-center-cooling-capacity/)

## References

- [ASHRAE Datacom Series](https://www.ashrae.org/technical-resources/bookstore/datacom-series)
- [Schneider Electric — Calculating Total Cooling Requirements](https://www.se.com/us/en/download/document/SPD_NRAN-5TE6HE_EN/)
