# Switch Oversubscription Ratio — Engineering Cheat Sheet

## Definition

Switch oversubscription compares aggregate downstream interface capacity with aggregate uplink capacity.

```text
Oversubscription Ratio
= Total Downlink Capacity / Total Uplink Capacity
```

For identical interfaces:

```text
Downlink Capacity = Downlink Port Count × Port Speed
Uplink Capacity   = Active Uplink Count × Uplink Speed
```

## 48 × 1G + 2 × 10G Example

```text
Downlink = 48 × 1 Gbps = 48 Gbps
Uplink   = 2 × 10 Gbps = 20 Gbps

Ratio = 48 / 20 = 2.4:1
```

The theoretical line-rate oversubscription is **2.4:1**.

This does not automatically mean the uplink is congested. Actual suitability depends on traffic demand, peak utilization, LAG distribution, redundancy, and growth.

## Common 48-Port Examples

| Access | Uplink | Aggregate Uplink | Ratio |
|---|---:|---:|---:|
| 48 × 1G | 1 × 10G | 10 Gbps | 4.8:1 |
| 48 × 1G | 2 × 10G | 20 Gbps | 2.4:1 |
| 48 × 1G | 4 × 10G | 40 Gbps | 1.2:1 |
| 48 × 1G | 2 × 25G | 50 Gbps | 0.96:1 |

## N-1 Check

If a 48 × 1G access switch uses two 10G uplinks:

```text
Normal:
48 / 20 = 2.4:1

One uplink fails:
48 / 10 = 4.8:1
```

Always compare normal and required failure states before approving the design.

## Practical Demand Example

Assume:

```text
Active ports: 40
Port speed: 1 Gbps
Busy-hour utilization: 25%
```

Estimated busy-hour demand:

```text
40 × 1 × 0.25 = 10 Gbps
```

With 2 × 10G uplinks:

```text
Normal capacity = 20 Gbps
Modeled headroom = 10 Gbps
```

If one uplink fails:

```text
N-1 capacity = 10 Gbps
```

The design has no modeled headroom at that utilization level.

## LAG Note

A 2 × 10G LAG can provide **20 Gbps aggregate capacity**, but an individual flow normally hashes to a member link rather than using the full aggregate bandwidth.

Check:
- hashing policy
- number of flows
- traffic symmetry
- member failure behavior

## Engineering Checklist

Before approving an uplink:

- [ ] Calculate installed downlink capacity
- [ ] Calculate active downlink capacity
- [ ] Measure busy-hour utilization
- [ ] Calculate aggregate active uplink capacity
- [ ] Calculate theoretical oversubscription
- [ ] Check LAG behavior
- [ ] Recalculate N-1
- [ ] Add growth headroom
- [ ] Compare realistic upgrade options

## Live Resources

- Full Guide: https://netengineerlab.com/guides/switch-oversubscription-ratio/
- Calculator: https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/
- 48-Port Worked Example: https://netengineerlab.com/guides/48-port-switch-oversubscription/

## References

- Cisco Campus LAN and Wireless LAN design guidance
- IEEE 802.1AX — Link Aggregation
- RFC 7424 — Link Aggregation Group Resiliency
