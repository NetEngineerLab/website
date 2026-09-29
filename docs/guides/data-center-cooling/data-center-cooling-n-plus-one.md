# Data Center Cooling N+1 — Engineering Check

## Capacity test

```text
Required running units = ceil(Design load ÷ Unit sensible capacity)
N+1 installed units = Required running units + 1
Failure capacity = (Installed units − 1) × Unit sensible capacity
PASS when Failure capacity ≥ Design load
```

For a 159.25 kW design load with 50 kW units, four units must run. Five installed units provide N+1; after one outage, four units provide 200 kW.

## N+1 is more than unit count

Confirm that the failure state retains electrical supply, controls, pumps or condensers, piping, airflow paths and heat rejection. A common upstream component can invalidate an otherwise correct unit-count calculation.

## Live resources

- [Cooling N+1 guide](https://netengineerlab.com/guides/data-center-cooling-n-plus-one/)
- [Cooling load calculator](https://netengineerlab.com/tools/data-center-cooling-load-calculator/)
- [Topic hub](https://netengineerlab.com/topics/data-center-cooling-capacity/)

## References

- [ASHRAE Datacom Series](https://www.ashrae.org/technical-resources/bookstore/datacom-series)
- [Schneider Electric — Calculating Total Cooling Requirements](https://www.se.com/us/en/download/document/SPD_NRAN-5TE6HE_EN/)
