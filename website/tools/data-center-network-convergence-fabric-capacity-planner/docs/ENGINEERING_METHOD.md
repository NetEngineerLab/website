# Data Center Network Convergence & Fabric Capacity Planner V1.0 — Engineering Method

Version: V1.0  
Modified: 2026-09-11 23:25 +08:00

## Core model
- IT line rate = edge nodes × ports per edge × port speed
- Busy-hour demand = line rate × utilization × concurrency × (1 + allowance)
- East-west demand = busy-hour demand × east-west share
- North-south demand = busy-hour demand − east-west demand
- Cross-edge east-west = east-west demand × cross-edge share
- Fabric transit load = north-south demand + 2 × cross-edge east-west
- Upper-layer transit load = north-south demand + 2 × cross-edge east-west × upper-layer share
- Fabric capacity = edge nodes × uplinks per edge × uplink speed
- Upper-layer capacity = middle nodes × upper links per middle node × upper link speed
- Egress capacity = egress links × egress link speed
- N-1 capacity = normal capacity × surviving middle nodes / installed middle nodes
- Growth demand = current demand × (1 + annual growth)^years

The factor of two on cross-edge east-west traffic counts source and destination fabric-facing link traversals. This is a port-capacity screening approximation, not a packet-level simulator.

## Assumptions
Traffic is reasonably balanced across ECMP/LAG paths and surviving middle-layer nodes. The planner does not model elephant-flow hash collisions, switch ASIC limits, queueing, microbursts, control-plane convergence or cabling diversity. Validate production designs with P95/P99 telemetry, flow data, queue drops and failure testing.
