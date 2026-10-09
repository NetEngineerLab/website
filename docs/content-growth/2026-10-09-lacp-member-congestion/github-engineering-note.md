# Audit offered demand per LAG member before approving bundle capacity

Draft technical note for the existing `NetEngineerLab/website` repository. Suggested publication is a reviewed Markdown note or discussion, not a claim that a public issue or post already exists. Checked 2026-10-09; independent content audit accepted (CONTENT PASS WITH P1; see audit.md); publication gates remain open.

## Model and method

Use one direction and one measurement window. Let `r_i` be the estimated on-wire offered rate of flow i, `a_i` its observed or hypothetical member assignment, and `c_j` the line rate of member j.

```text
D = sum(r_i)
C = sum(c_j for forwarding members j)
bundle demand fraction = D / C
member demand L_j = sum(r_i where a_i == j)
member demand fraction = L_j / c_j
target headroom = target_fraction * C - D
N-1 demand fraction = D / surviving_forwarding_capacity
```

These are capacity comparisons. A fraction above 1 describes offered overload, not transmitted speed. Byte-counter throughput after drops or TCP backoff is delivered traffic and may understate offered demand. Estimate demand with aligned sender evidence and network observations; do not invent absent flow measurements.

Example assumptions: four independent flows at 6, 5, 2 and 1 Gbps; server endpoints and paths support the individual rates; two active 10 Gbps members; fixed member assignment over a sustained interval. Assign 6+5 to A and 2+1 to B. D=14 and C=20, so aggregate demand is 70%, but A receives 11/10=110% offered demand. This is original synthetic arithmetic, not production telemetry.

Hash-based placement can produce imbalance with uneven flow rates. [RFC 7424, section 3](https://datatracker.ietf.org/doc/html/rfc7424#section-3). Do not interpret the informational RFC as a vendor feature guarantee.

## Executable miniature audit

Save the following as `member_capacity_audit.py` and run `python member_capacity_audit.py` with Python 3. It uses only the standard library. The mapping is supplied explicitly; it is **not** a reproduction of an ASIC hash. Assertions catch a changed example or arithmetic error.

```python
from collections import defaultdict

flows_gbps = {"backup_1": 6, "backup_2": 5, "replica": 2, "other": 1}
members_gbps = {"A": 10, "B": 10}
assignment = {"backup_1": "A", "backup_2": "A", "replica": "B", "other": "B"}
target = 0.80  # example policy, not a universal engineering threshold

def audit(mapping, active_members):
    if set(mapping) != set(flows_gbps):
        raise ValueError("Every flow must have exactly one explicit assignment")
    loads = defaultdict(float)
    for flow, member in mapping.items():
        if member not in active_members:
            raise ValueError("Assignment names a non-forwarding member")
        loads[member] += flows_gbps[flow]
    demand = sum(flows_gbps.values())
    capacity = sum(active_members.values())
    if capacity <= 0:
        raise ValueError("No forwarding capacity; utilization is undefined")
    print(f"bundle: {demand:g}/{capacity:g} Gbps = {demand/capacity:.0%}")
    for member, rate in active_members.items():
        load = loads[member]
        flag = "OFFERED OVERLOAD" if load > rate else "within line rate"
        print(f"{member}: {load:g}/{rate:g} Gbps = {load/rate:.0%}; {flag}")
    print(f"target headroom: {target*capacity-demand:g} Gbps")
    return dict(loads), demand, capacity

print("Normal supplied assignment")
loads, demand, capacity = audit(assignment, members_gbps)
assert loads == {"A": 11.0, "B": 3.0}
assert demand == 14 and capacity == 20
assert target * capacity - demand == 2

print("\nHypothetical alternative assignment")
alternative = dict(assignment, backup_2="B")
alt_loads, _, _ = audit(alternative, members_gbps)
assert alt_loads == {"A": 6.0, "B": 8.0}

print("\nN-1: assume A alone remains forwarding")
surviving_assignment = {flow: "A" for flow in flows_gbps}
n1_loads, n1_demand, n1_capacity = audit(surviving_assignment, {"A": 10})
assert n1_loads == {"A": 14.0}
assert n1_demand / n1_capacity == 1.4
assert target * n1_capacity - n1_demand == -6
```

Expected results: normal bundle 70%, A 110%, B 30%, target headroom +2 Gbps; alternative A 60%, B 80%; N-1 bundle/member 140%, target headroom −6 Gbps. Alternative placement is a comparison, not an asserted attainable hash setting. N-1 assumes one member keeps forwarding; check min-links, convergence, and topology independently. The referenced Cisco implementation documents that min-links can deactivate an undersized bundle. [Cisco EtherChannel guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/etherchannel/etherchannel-configuration-guide/m_ethernetchannel.html).

## Evidence to attach to a change review

1. Record both ends' member state and configured distribution inputs.
2. Export per-member direction-specific byte deltas and queue/drop evidence with matching timestamps.
3. Map dominant observed flows to members or explicitly mark the mapping unknown.
4. Compare the existing workload with a controlled alternative and its rollback criteria.
5. Recalculate surviving capacity only for a topology that can actually forward.

Bounds: no packet-level simulation, latency prediction, loss-rate prediction, statistical collision probability, or hardware hash emulator. No automatic traffic rebalancing is implemented. Averages do not establish burst safety. Measurements of payload goodput require a documented wire-rate conversion; measurements already including the relevant overhead must not receive it twice.

Optional aggregate cross-check: the [switch uplink tool](https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/) accepts a 14×1000 Mbps demand proxy with utilization/concurrency 100%, overhead 0%, 2×10000 Mbps, target 80%, peakPorts 14, growth 0%, burst 0% and failedUplinks 1. It reproduces aggregate headroom and N-1 but does not model this assignment. The note and executable audit remain useful without opening that link.
