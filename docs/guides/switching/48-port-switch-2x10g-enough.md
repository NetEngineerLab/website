# Is 2×10G Enough for a 48-Port Gigabit Switch?

## Quick Answer

For 48 × 1G access ports with 2 × 10G uplinks:

```text
Downlink = 48 Gbps
Uplink   = 20 Gbps
Ratio    = 2.4:1
```

2×10G may be enough for many access networks, but the final decision should be based on busy-hour traffic and N-1 requirements.

## Practical Example

Assume:

```text
40 active ports
1 Gbps each
25% busy-hour utilization
```

Estimated demand:

```text
40 × 1 × 0.25 = 10 Gbps
```

Normal uplink capacity:

```text
2 × 10G = 20 Gbps
```

Modeled headroom:

```text
20 - 10 = 10 Gbps
```

## N-1 Check

After one uplink fails:

```text
Remaining capacity = 10 Gbps
Theoretical ratio  = 48 / 10 = 4.8:1
```

If busy-hour demand is above 10 Gbps, the failure state can become capacity-constrained.

## When 2×10G Is More Likely to Be Enough

- normal user-access traffic
- low simultaneous utilization
- moderate growth
- no strict full-load N-1 requirement

## When to Consider More Uplink Capacity

- backups and replication
- high-throughput wireless aggregation
- server/storage traffic
- multigig access
- rapid growth
- strict N-1 capacity requirements

## Upgrade Comparison

| Uplink | Aggregate | 48×1G Ratio |
|---|---:|---:|
| 2×10G | 20 Gbps | 2.4:1 |
| 4×10G | 40 Gbps | 1.2:1 |
| 2×25G | 50 Gbps | 0.96:1 |

## Live Resources

- Problem Page: https://netengineerlab.com/guides/48-port-switch-2x10g-enough/
- Topic Hub: https://netengineerlab.com/topics/switch-oversubscription/
- Calculator: https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/
