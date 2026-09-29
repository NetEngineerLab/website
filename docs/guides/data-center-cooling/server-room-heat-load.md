# Server Room Heat Load — Boundary Checklist

## Heat inventory

```text
Qbase = QIT + QUPS + QPDU + Qlighting + Qpeople + Qenvelope + Qother
Qdesign = Qbase × (1 + margin)
```

Before calculating, draw the conditioned-space boundary. Add a loss only when its heat is released inside that boundary. This avoids both omitted heat and double counting.

## Inputs to verify

- IT power: measured credible peak or justified deployment forecast.
- UPS/PDU losses: conversion loss at expected load, not equipment rating.
- Lighting and people: actual operating assumptions.
- Envelope and infiltration: site and construction dependent.
- Other loads: batteries, transformers and auxiliary equipment when applicable.
- Margin: documented uncertainty and growth, not an arbitrary percentage.

## Live resources

- [Server-room heat-load guide](https://netengineerlab.com/guides/server-room-heat-load-calculation/)
- [Cooling load calculator](https://netengineerlab.com/tools/data-center-cooling-load-calculator/)
- [Topic hub](https://netengineerlab.com/topics/data-center-cooling-capacity/)

## References

- [ASHRAE Datacom Series](https://www.ashrae.org/technical-resources/bookstore/datacom-series)
- [Schneider Electric — Calculating Total Cooling Requirements](https://www.se.com/us/en/download/document/SPD_NRAN-5TE6HE_EN/)
