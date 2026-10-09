<!-- Draft only. Proposed /guides/lacp-member-congestion/. Source check: 2026-10-09. Independent content audit accepted (CONTENT PASS WITH P1; see audit.md); publication gates remain open. -->
# Why Is One LACP Link Congested While the Other Is Idle?

One congested LACP member can coexist with spare capacity in the bundle because aggregate capacity does not describe where individual flows go. Start by checking that both members actually forward, then compare member rates, drops, queues and flow distribution in the same direction and time window. A few large flows can concentrate demand on one member while the bundle average remains comfortable. The useful question is whether the bottleneck comes from member eligibility, traffic placement, or insufficient capacity after a failure. The worked example below separates those questions and gives you a repeatable way to collect evidence before changing the network.

## LACP membership and traffic distribution are separate checks

Treat successful aggregation as the start of troubleshooting. Check the operational member set at both ends; a cable being up does not establish that it carries ordinary data in the bundle. Then inspect the transmitting device's distribution policy. The reverse direction needs its own inspection.

Hash-based forwarding maps multiple flows to member links, and different flow rates can produce imbalance. This is a mechanism described in the informational [RFC 7424, section 3](https://datatracker.ietf.org/doc/html/rfc7424#section-3), not a promise that a particular switch supports automatic rebalancing.

A single throughput test with one connection cannot demonstrate how a production traffic mix will use the whole bundle. For conventional per-flow forwarding, increasing the number of physical members does not automatically increase that connection's throughput. Platform features and traffic classification vary; record what the actual device uses.

## A 70% bundle can hide a congested member

This is a synthetic, sustained, one-direction example. Four independent flows offer 6, 5, 2 and 1 Gbps of estimated on-wire demand. Endpoints and upstream paths can source these rates; they are not 1 Gbps access ports. Assume two forwarding 10 Gbps members and the following assignment:

| Member | Assigned flows | Offered demand | Demand / line rate |
|---|---|---:|---:|
| A | 6 + 5 Gbps | 11 Gbps | 110% |
| B | 2 + 1 Gbps | 3 Gbps | 30% |
| Bundle | All four | 14 Gbps | 70% of 20 Gbps |

Eleven Gbps is demand aimed at A, not a claim that its 10 Gbps interface transmits at 110%. Persistent excess must accumulate, be dropped, or induce application backoff. Delivered rates can therefore be lower than the offered estimates. Real loss depends on buffering, scheduling, timing and transport response; this table predicts none of those quantities.

Member B is lightly loaded in this example, rather than literally idle. A counter reading near zero deserves an additional membership and policy check. Balanced flow counts are also insufficient: two flows on each member still produce 11 versus 3 Gbps. Moving the 5 Gbps flow to B would produce 6 versus 8 Gbps, but that arithmetic is an illustration, not an available switch command or a guaranteed hash outcome.

The [oversubscription ratio guide](https://netengineerlab.com/guides/switch-oversubscription-ratio/) explains installed line-rate capacity. Keep that metric separate from the measured demand and member assignment used here.

## Collect evidence in five steps

1. **Record the active forwarding set.** Save member state, negotiated speed, partner identity, and relevant configuration from both ends. Investigate suspended, standby, individual, or incompatible members before attributing unevenness to hashing. Use the device's documented commands; on the referenced Cisco family, `show etherchannel summary` is an example inspection entry point. [Cisco EtherChannel guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/etherchannel/etherchannel-configuration-guide/m_ethernetchannel.html).
2. **Measure member rates over matching intervals.** Record transmit and receive byte deltas independently, with timestamps and counter units. Compute rate as `8 × delta_bytes / delta_seconds`. Handle resets and wraparound; retain the sampling interval. Avoid adding transmit and receive rates and dividing by one direction's 20 Gbps capacity.
3. **Correlate congestion evidence.** Collect egress drops, queue occupancy or supported watermarks, and application symptoms during the same interval. Errors or optical alarms point to a different investigation. A five-minute average alone can miss short overload; use supported finer telemetry without assuming that one-second polling captures every burst.
4. **Identify dominant traffic and hash inputs.** Use flow telemetry or an approved packet sample to list endpoints, protocols, ports, direction and estimated rates. Check whether tunnels hide useful inner fields from this platform. Document observation limits; sampled flow records are estimates and may miss brief traffic.
5. **Reproduce with a controlled workload.** Compare a single connection with multiple independent connections while watching both members. Preserve endpoints, direction and duration between trials. Test an intended change in a lab or maintenance window, then compare member drops and application completion time against the baseline.

## Choose a change that matches the evidence

If a member is not forwarding, repair the eligibility issue first. If both forward but several large flows collide, evaluate the supported distribution inputs against the actual traffic diversity. Changing a global policy can affect other bundles and move existing traffic; prepare a rollback and watch for ordering-sensitive applications. “Use more hash fields” is a hypothesis to test, not a universal fix.

Workload scheduling or rate limiting can reduce coincident demand. Additional application connections may expose more diversity when the application supports them, although they can still collide. More members may improve aggregate placement without fixing a flow larger than one member. Faster members address that particular limit more directly, subject to switch, peer, optics and topology support.

Use the [bandwidth calculator](https://netengineerlab.com/tools/bandwidth-calculator/) to compare a transfer window with sustained rate. For hardware changes, check the [SFP/QSFP compatibility tool](https://netengineerlab.com/tools/sfp-qsfp-compatibility-calculator/) and manufacturer support before purchase. Track future demand with the [network capacity forecast planner](https://netengineerlab.com/tools/network-capacity-forecast-planner/); it does not validate hash distribution.

## Reproduce the aggregate capacity check

The calculator models aggregate demand. [Calculate aggregate uplink demand and compare N and N-1 capacity](https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/) with this complete input set:

```text
Active access ports = 14; Access port speed = 1000 Mbps
Average busy-hour utilization = 100%; Concurrent active ports = 100%
Protocol / burst allowance = 0%; Speed per uplink = 10000 Mbps
Active forwarding uplinks = 2; Target uplink utilization = 80%
Peak active ports = 14; Growth = 0%; Burst allowance = 0%
Failed uplinks (N-1) = 1
```

The 14-port input is an equivalent demand proxy, not the topology of the four high-rate flows. It produces 14 Gbps demand, 20 Gbps aggregate capacity, 16 Gbps target usable capacity, 2 Gbps target headroom, 70% demand utilization and a displayed 0.7:1 line-rate ratio. Eighty percent is this example's planning target, not a standard.

Set all engineering fields explicitly: current UI defaults otherwise add peak ports, growth and burst allowance. The baseline capacity status is `pass`, while the engine's overall risk is `high` because N-1 fails. Neither status validates member balance. The calculator does not simulate hash assignments, member queues or packet loss. With rates already estimated on wire, leave extra protocol allowance at zero to avoid counting the same overhead twice.

## N-1 can fail even after imbalance is fixed

If one 10 Gbps member remains forwarding, unchanged offered demand is `14 / 10 = 140%`; at the example's 80% target, usable capacity is 8 Gbps and target headroom is −6 Gbps. This is a capacity scenario, not a failover guarantee. Check minimum-member requirements and the actual surviving path. Cisco's documented min-links feature can make a port-channel inactive below its required member count. [Cisco EtherChannel guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/etherchannel/etherchannel-configuration-guide/m_ethernetchannel.html).

The [N-1 guide](https://netengineerlab.com/guides/switch-oversubscription-n-1/) develops failure sizing. For access-switch planning, use the separate [48-port 2×10G guide](https://netengineerlab.com/guides/48-port-switch-2x10g-enough/); its access topology differs from this server-flow example. The [switch oversubscription hub](https://netengineerlab.com/topics/switch-oversubscription/) connects the planning sequence.

## FAQ

**Does LACP guarantee equal bandwidth per member?** No. Verify operational membership and observed distribution; equal link speeds do not establish equal demand.

**Can one flow use the full 20 Gbps?** Do not assume so with conventional per-flow distribution. Check the platform's forwarding behavior and any explicitly supported alternatives.

**Is 70% utilization safe?** A bundle average cannot answer that. Inspect the busiest member, queue drops, bursts and failure requirements.

**Will changing the hash fix this?** It may change placement. Confirm that the chosen fields vary in the real workload, and measure the result.

**Should I add another 10 Gbps member?** Compare placement, the largest flow and N-1 demand first. Aggregate expansion and faster members solve different constraints.

Save a same-window snapshot of both members, reproduce the aggregate inputs, and attach the busiest-member and N-1 results to your change review. That evidence makes the capacity decision reviewable.
