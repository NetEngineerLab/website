# Social drafts

Draft only, 2026-10-09; independent content audit accepted (CONTENT PASS WITH P1; see audit.md); publication gates remain open. Link below is the existing calculator. The proposed article URL must not be shared until its page is published and checked.

## LinkedIn

Two 10 Gbps LACP members can have spare aggregate capacity while one member is overloaded.

Consider a synthetic one-direction workload with four independent flows: 6, 5, 2 and 1 Gbps. Endpoints can source those rates. If 6+5 lands on member A and 2+1 on B:

```text
Bundle offered demand: 14/20 = 70%
Member A offered demand: 11/10 = 110%
Member B offered demand: 3/10 = 30%
```

The 110% describes offered demand, not transmitted throughput. Two flows per member is equal by count and unequal by bandwidth.

Before changing the hash, I would verify member forwarding state, compare direction-specific counters over matching intervals, and correlate the hot member with queue drops and application symptoms. Then inspect the real traffic fields the platform uses and test one controlled intervention.

The failure check matters too: 14 Gbps on one surviving 10 Gbps member is 140%, assuming the bundle remains operational. An aggregate baseline pass is only one part of design approval.

[Calculate aggregate uplink demand and compare N and N-1 capacity](https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/). The calculator does not simulate member hashing or drops. What telemetry has given you the clearest evidence of member imbalance?

## X: primary post

```text
2x10G LACP, 14G offered: 70% aggregate. Flows 6+5 on A, 2+1 on B: A has 11G demand on 10G. Check member drops and forwarding state. Aggregate model only:
https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/
```

## X: independent follow-up

```text
LAG capacity checks need two views: busiest member and surviving capacity. 14G offered on one surviving 10G member = 140%, if min-links permits forwarding. Aggregate check:
https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/
```

Character limits apply to complete code-block text, including literal URL and newline; verify before publishing. No invented results, fabricated customer story, mandatory hashtags, or claim that a single flow gains aggregate bandwidth.
