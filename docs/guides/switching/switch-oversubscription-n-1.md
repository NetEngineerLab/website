# Switch Oversubscription Under N-1 Failure

## Formula

Normal state:

```text
Oversubscription = Downlink Capacity / Normal Uplink Capacity
```

N-1 state:

```text
N-1 Oversubscription = Downlink Capacity / Surviving Uplink Capacity
```

## 48 × 1G + 2 × 10G Example

```text
Downlink = 48 Gbps

Normal uplink = 20 Gbps
Normal ratio  = 48 / 20 = 2.4:1

N-1 uplink = 10 Gbps
N-1 ratio  = 48 / 10 = 4.8:1
```

## Traffic-Demand Check

Assume:

```text
40 active ports
1 Gbps each
30% busy-hour utilization
```

Modeled demand:

```text
40 × 1 × 0.30 = 12 Gbps
```

Capacity result:

```text
Normal headroom = 20 - 12 = +8 Gbps
N-1 headroom    = 10 - 12 = -2 Gbps
```

The design passes normal-state capacity but fails the modeled N-1 demand.

## LAG Examples

| Uplink Design | Normal Capacity | N-1 Capacity | 48×1G N-1 Ratio |
|---|---:|---:|---:|
| 2×10G | 20 Gbps | 10 Gbps | 4.8:1 |
| 4×10G | 40 Gbps | 30 Gbps | 1.6:1 |
| 2×25G | 50 Gbps | 25 Gbps | 1.92:1 |

## N-1 Checklist

- [ ] Define the single failure being modeled
- [ ] Calculate surviving uplink capacity
- [ ] Measure busy-hour demand
- [ ] Compare demand vs surviving capacity
- [ ] Check LAG behavior
- [ ] Add future traffic growth
- [ ] Decide whether temporary congestion is acceptable
- [ ] Compare upgrade options if needed

## Live Resources

- Guide: https://netengineerlab.com/guides/switch-oversubscription-n-1/
- Topic Hub: https://netengineerlab.com/topics/switch-oversubscription/
- Calculator: https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/
