# OSPF Cost Calculator — Engineering Method

## Formula

For each active interface, calculated OSPF cost equals reference bandwidth divided by interface bandwidth. Both values are expressed in Mbps. The result is rounded using the selected mode (ceil, floor, or round) and bounded to the OSPF metric range 1–65535. Path cost is the sum of active interface costs. Paths sharing the lowest total cost are reported as ECMP candidates.

## Inputs and boundaries

- The default reference bandwidth is 100,000 Mbps (100 Gbps).
- Reference bandwidth and interface bandwidth must be finite numeric values greater than zero; numeric strings are rejected.
- Disabled interfaces are excluded from path totals.
- A manual metric override must be an integer from 1 through 65,535 and is flagged for engineering review.
- The calculator does not infer vendor-specific interface defaults, areas, redistribution, administrative distance, or adjacency state.

## Interpretation

Use the result to compare paths consistently after setting the same reference bandwidth across all participating routers. Review unequal costs, manual overrides, and missing ECMP paths before a production change. Confirm the effective metric and route selection on the target vendor.

## Sources

- RFC 2328, OSPF Version 2: https://www.rfc-editor.org/rfc/rfc2328
- Cisco OSPF cost calculation: https://www.cisco.com/c/en/us/support/docs/ip/ospf/13684-26.html
- FRRouting OSPF documentation: https://docs.frrouting.org/en/latest/ospfd.html
