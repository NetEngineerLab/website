# Data Center Airflow / Containment Planner — Engineering Method

Version: V2.1 Power Tool #31  
Modified: 2026-09-10

## Scope
This planner converts sensible IT heat and a measured/planned supply-to-return temperature difference into a first-order airflow requirement using Q = rho × cp × volumetric-flow × ΔT. It then adjusts supply airflow for user-entered bypass fraction, estimates a simple mixed inlet temperature from recirculation, and checks installed CRAH/CRAC airflow and sensible-capacity redundancy.

## Important boundaries
- The containment index `(1-bypass) × (1-recirculation)` is a NetEngineerLab planning indicator, not an ASHRAE-standard metric.
- Recirculation and bypass should be measured or estimated from site observations / CFD / commissioning data. The tool does not infer them from containment type.
- Final cooling design must use manufacturer sensible-capacity and fan-curve data at actual entering conditions, altitude and control mode.
- This is a sensible-heat airflow planner, not CFD and not a psychrometric latent-load model.
