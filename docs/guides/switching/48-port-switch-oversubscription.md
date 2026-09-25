# 48-Port Switch Oversubscription — Worked Examples

This reference focuses on one common design question:

> How much uplink capacity does a 48-port access switch need?

## 48 × 1G + 2 × 10G

```text
Downlink = 48 × 1 Gbps = 48 Gbps
Uplink   = 2 × 10 Gbps = 20 Gbps

Oversubscription = 48 / 20 = 2.4:1
```

## 48 × 1G + 4 × 10G

```text
Downlink = 48 Gbps
Uplink   = 40 Gbps

Oversubscription = 48 / 40 = 1.2:1
```

## 48 × 1G + 2 × 25G

```text
Downlink = 48 Gbps
Uplink   = 50 Gbps

Oversubscription = 48 / 50 = 0.96:1
```

## N-1 Example

For the 2 × 10G design:

```text
Normal capacity = 20 Gbps
Normal ratio    = 2.4:1

After one uplink failure:
Remaining capacity = 10 Gbps
N-1 ratio          = 4.8:1
```

The N-1 state is often more important than the normal-state ratio when the network has availability requirements.

## Current Traffic vs Installed Capacity

If only 32 ports are connected:

```text
32 × 1 Gbps / 20 Gbps = 1.6:1
```

Use:
- all 48 ports for maximum installed capacity and growth planning;
- active ports plus measured utilization for operational capacity planning.

## Multigig Example

48 × 2.5G access:

```text
Downlink = 48 × 2.5 = 120 Gbps
```

With 2 × 25G uplinks:

```text
Uplink = 50 Gbps
Ratio  = 120 / 50 = 2.4:1
```

Do not assume a design sized for 1G access remains adequate after migrating to 2.5G/5G/10G access ports.

## Quick Decision Checklist

- [ ] What is the maximum downlink capacity?
- [ ] How many ports are actually active?
- [ ] What is measured busy-hour utilization?
- [ ] Are uplinks in a LAG?
- [ ] Can one uplink fail?
- [ ] What is the N-1 demand/capacity result?
- [ ] What traffic growth is expected?
- [ ] Is 10G, 25G, 40G, or 100G the realistic next step?

## Live Resources

- Full worked guide: https://netengineerlab.com/guides/48-port-switch-oversubscription/
- Oversubscription fundamentals: https://netengineerlab.com/guides/switch-oversubscription-ratio/
- Calculator: https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/

## References

- Cisco Campus LAN and Wireless LAN design guidance
- IEEE 802.1AX — Link Aggregation
- RFC 7424 — Link Aggregation Group Resiliency
