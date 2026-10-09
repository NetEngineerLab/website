# Discussion draft: equal flow counts, unequal LAG demand

Draft only, 2026-10-09. Independent content audit accepted (CONTENT PASS WITH P1; see audit.md); publication gates remain open. Proposed audiences: r/networking for professional operational discussion; r/homelab only if the author has a relevant lab test and current rules allow it. Community eligibility is unverified: official rule pages returned a login shell during this task. Read current rules before posting. Prefer an appropriate existing troubleshooting conversation when one is available; no actual thread has been selected or contacted.

## Ready-to-review post body

**Title: How do you verify LAG member imbalance when the bundle average looks fine?**

I'm working through a synthetic capacity example and would like to compare diagnostic methods, especially where member telemetry is limited.

Assume four independent flows offering 6, 5, 2 and 1 Gbps in one direction, with endpoints able to source those rates. Two 10 Gbps forwarding members carry them as follows:

```text
A: 6 + 5 = 11 Gbps offered demand
B: 2 + 1 = 3 Gbps offered demand
Bundle: 14 / 20 = 70%
```

Two flows per member looks balanced by count, but A has more offered demand than it can transmit. The 11 Gbps is not an interface counter claiming to exceed line rate. Delivered throughput can fall after drops and transport backoff.

My diagnostic sequence would be:

1. Verify both members are bundled and forwarding at both ends.
2. Compare per-member transmit/receive byte deltas over the same intervals.
3. Correlate the hot member with queue/drop counters and application symptoms.
4. Identify dominant flows and the transmitting switch's effective hash inputs.
5. Test a controlled change while keeping a rollback and checking the reverse direction separately.

Moving the 5 Gbps flow would make the hypothetical split 6/8, but it may not be possible to request that exact mapping on the device. Adding members is also different from increasing per-member speed. If only one 10 Gbps link survives, unchanged demand becomes140%, assuming min-links and the topology let the bundle keep forwarding.

What evidence do you use to distinguish hash concentration from short bursts or a non-forwarding member? If you have a case to share, the platform/release, sampling interval, number of major flows, and whether loss changed after the intervention would make it easier to compare. Sanitized descriptions are sufficient.

## Optional reply if someone requests the calculation

Use only if affiliation is accurate and community rules permit the link:

“Disclosure: I work on NetEngineerLab. I can share the self-contained member-capacity note here; its mapping is explicit rather than a vendor hash emulator. For aggregate capacity only, our [switch uplink calculator](https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/) reproduces14/20 and the failure case. It does not simulate member placement or drops.”

Do not add a promotional link to the default post, invent a first-hand incident, claim community endorsement, or cross-post identical text across unrelated communities. If affiliation cannot be truthfully stated as written, replace it with the author's exact relationship before posting.
