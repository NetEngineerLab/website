# Publication and measurement plan

Draft plan dated 2026-10-09; independent content audit accepted (CONTENT PASS WITH P1; see audit.md); publication gates remain open. No live site change, social post, message or community submission has been made. Dates below assume an approved launch on 2026-10-12; shift the schedule if the publication gate remains open.

## Internal link map

| Destination | Article placement | Contextual anchor and reader action |
|---|---|---|
| [Primary: switch uplink calculator](https://netengineerlab.com/tools/switch-uplink-oversubscription-calculator/) | Exact aggregate input section | “switch uplink calculator”: reproduce 14G normal/N-1; preserve limits on member simulation |
| [Related: bandwidth calculator](https://netengineerlab.com/tools/bandwidth-calculator/) | Intervention paragraph on backup windows | “bandwidth calculator”: compare required sustained rate with transfer window |
| [Related: network capacity forecast planner](https://netengineerlab.com/tools/network-capacity-forecast-planner/) | Growth planning sentence | “network capacity forecast planner”: separate future aggregate demand from hash behavior |
| [Related: SFP/QSFP compatibility calculator](https://netengineerlab.com/tools/sfp-qsfp-compatibility-calculator/) | Faster member intervention | “SFP/QSFP compatibility tool”: check proposed hardware conditions and manufacturer support |
| [Hub: switch oversubscription](https://netengineerlab.com/topics/switch-oversubscription/) | After normal/N-1 interpretation | “switch oversubscription hub”: navigate the capacity planning sequence |
| [Tutorial: oversubscription ratio](https://netengineerlab.com/guides/switch-oversubscription-ratio/) | After member example | “oversubscription ratio guide”: distinguish installed line rate from traffic demand |
| [Tutorial: is 2×10G enough for 48 ports?](https://netengineerlab.com/guides/48-port-switch-2x10g-enough/) | Access sizing cross-reference | “48-port 2×10G guide”: compare a different access topology without reusing server assumptions |
| [Tutorial: N-1](https://netengineerlab.com/guides/switch-oversubscription-n-1/) | Failure section | “N-1 guide”: work through surviving capacity and operational conditions |

Inbound editorial proposals after launch: add one contextual link from the hub's LAG discussion and from existing guides' LAG caveats to the member diagnosis. Use a sentence explaining when the diagnosis helps. These are review proposals; no existing pages have been edited.

Primary CTA: **Save a same-window snapshot of both members, reproduce the aggregate inputs, and attach busiest-member and N-1 results to the change review.** Conversion is a technically useful calculation and evidence capture, not an arbitrary pageview. The detailed link plan above is production guidance; do not append it as a promotional block to public articles.

## Channel roles and publication gates

| Channel | Deliverable | Native value | Gate |
|---|---|---|---|
| Website | `website-article.md` | Complete diagnostic reference | Approved implementation, audit, canonical/200/mobile/link checks |
| GitHub | `github-engineering-note.md` | Runnable explicit assignment audit and formulas | Reviewed note in verified existing repository; execute Python; do not invent published permalink |
| Reddit | `reddit-discussion.md` | Specific technical exchange, no default marketing link | Read current rules; relevant audience/thread; truthful affiliation for optional link |
| LinkedIn / X | `social-posts.md` | Concise member-vs-bundle lesson | Confirm destination and character count; use existing tool URL until article exists |
| WeChat / Zhihu | `chinese-article.md` | Independent Chinese operations explanation | Human channel review, permitted formatting/external-link path, truthful author context |

Keep promotional material below 10% of each substantive article/note. Provide the useful method before a tool mention. Do not open accounts, publish posts or send messages as part of executing this draft plan.

## Seven-day sequence

Times are **editorial hypotheses to test**, not verified audience best times. Shanghai is UTC+8. For these October dates, ET means EDT (UTC−4). These conversions do not imply that US/UK readers share an ideal posting window.

| Day/date | Suggested Shanghai / ET | One action | Acceptance / measure |
|---|---|---|---|
| 1 / Mon Oct 12 | 21:00 / 09:00 ET | Publish approved website article | 200, canonical, readable member table, all 8 internal links checked; record baseline metrics |
| 2 / Tue Oct 13 | 21:00 / 09:00 ET | Publish reviewed GitHub technical note | Python output correct; content useful without link click; capture actual permalink |
| 3 / Wed Oct 14 | 21:00 / 09:00 ET | Publish LinkedIn post | Existing destination works; monitor substantive comments and qualified visits |
| 4 / Thu Oct 15 | 21:00 / 09:00 ET | Publish primary X post | Complete text ≤280 literal characters; track tagged destination visits |
| 5 / Fri Oct 16 | 20:30 / 08:30 ET | Publish Chinese WeChat article | Verify preview/table, approved reading link, no invented incident |
| 6 / Sat Oct 17 | 20:30 / 08:30 ET | Publish Chinese Zhihu adaptation | Answer question directly; verify current link rules and readable formulas |
| 7 / Sun Oct 18 | 21:00 / 09:00 ET | Review launch evidence and questions | Count useful comments, tool opens and calculation signals; select one correction/update if evidence warrants |

Reddit has no timed broadcast slot: post or reply only when a relevant technical discussion and current rules make the contribution appropriate. Verify rules at publication, since the task's web read could not retrieve their contents. A community discussion that needs no website click is a useful outcome. Do not fabricate an active thread or use unrelated threads for distribution.

Optional tracking labels, only where links are permitted: `utm_source=linkedin|x|github|wechat|zhihu`, `utm_medium=social|referral`, `utm_campaign=lacp_member_congestion_202610`. Apply actual analytics conventions when implementation is approved. Keep canonical free of tracking parameters. Default Reddit post has no link or campaign tag.

## Thirty-day follow-through

| Checkpoint from Oct 12 launch | One action | Decision evidence |
|---|---|---|
| Day 7 / Oct 18 | Review initial acquisition and questions | Impressions and clicks if available, referral visits, useful technical responses; unavailable data stays unavailable |
| Day 14 / Oct 25 | Update the weakest evidenced explanation | Search Console query wording, repeated reader confusion, observed drop-off; avoid changing claims on anecdotes alone |
| Day 21 / Nov 1 | Compare channel-specific qualified use | Tool openings and documented calculation/copy signals only if instrumentation exists; separate bots/internal traffic where possible |
| Day 28 / Nov 8 | Recheck source scope and internal destinations | Link responses, relevant vendor-document changes, unresolved corrections |
| Day 30 / Nov 10 | Decide maintain, revise or discontinue promotion | Evidence of reader usefulness, organic discovery and calculations; no predeclared traffic or ranking threshold |

Suggested review window: 21:00 Shanghai; 09:00 ET for Oct 18/25, 08:00 ET for Nov 1/8/10 after the US daylight-time transition. Confirm timezone settings when scheduling. No automation has been created.

Measurement definitions: qualified visit is a human session reaching the engineering method or tool intentionally, where measurable; calculator engagement needs an actual existing event, not an inferred pageview. Inspect current analytics before promising a funnel. Record numerator, denominator, date range and exclusions for conversion rates. Zero data is not proof of zero demand. Search indexing and rankings are neither guaranteed nor immediate.

Update examples: add a device-specific verification note only after supported behavior is documented; clarify offered versus delivered rate if readers misread 110%; expand tunnel-field caveats only with a scoped source. Preserve the main troubleshooting intent instead of expanding into general switch-buying advice.

Next action for the publishing owner: review the exact 12-field calculator input block against `engine-reference.json` before scheduling Day 1.
