# Evidence and verification ledger

Collected 2026-10-09. Author self-review is not independent audit. Status: **CONTENT PASS WITH P1**, established by the [independent audit](audit.md). Content checks passed; publication and website implementation gates remain open.

## Source ledger

| Source | Checked fact and scope | What it does not establish |
|---|---|---|
| [RFC 7424, section 3](https://datatracker.ietf.org/doc/html/rfc7424#section-3), opened with web tool on 2026-10-09 | Informational RFC discusses hash-based member mapping and imbalance when flow rates differ | Standard-mandated equal utilization; availability of any particular rebalancing feature |
| [Cisco EtherChannel guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/etherchannel/etherchannel-configuration-guide/m_ethernetchannel.html), opened 2026-10-09 | For the documented Catalyst 9000/IOS XE 17 scope: documented distribution configuration, monitoring commands and min-links behavior | Commands/features identical across vendors, models or releases |
| `website/tools/switch-uplink-oversubscription-calculator/js/engine.js` | Actual demand formula, normal/engineering scenarios, status, risk and N-1 | Member hashing, queues, physical topology, real loss or latency |
| `website/tools/switch-uplink-oversubscription-calculator/js/app.js` and `index.html` | Actual inputs; dynamic default peak 48/growth 20/burst 15/failed 1; headline uses baseline status; separate N-1 display | `js/ui.js` exists; headline automatically means overall design healthy |
| Existing switching guides and local generated pages | Ratio,48-port and N-1 guides already cover broad sizing; member evidence workflow provides distinct value | Live new article exists; all older references are correct |

External source-derived summaries are deliberately short, scoped and paraphrased; no long quotation is used. Original arithmetic, diagnostic suggestions and editorial hypotheses form the substance. RFC 7424's exact title is *Mechanisms for Optimizing Link Aggregation Group (LAG) and Equal-Cost Multipath (ECMP) Component Link Utilization in Networks*; an existing local document's shorthand “Resiliency” is not reused as its title.

## Claims and assumptions

| Claim | Evidence / assumption |
|---|---|
| 14/20=70%; A 11/10=110%; B 3/10=30% | Synthetic explicit mapping 6+5→A and 2+1→B; own arithmetic |
| Alternative 6/8 meets 10G limits | Hypothetical comparison only; not a guaranteed hardware hash outcome |
| N-1 demand 140%; target headroom −6 | 14G demand, one 10G remains forwarding, chosen 80% target; min-links caveat separate |
| Rates refer to one direction | Sustained matching window; endpoints support more than 10G; on-wire demand estimates, not observed transmitted 11G |
| 80% example target | Author's demonstration policy, not normative safety threshold |
| Proxy 14×1G reproduces demand | Equivalent aggregate proxy; not the physical topology of the four flows |
| Allowances 0 | Rates already estimated on wire; avoids double counting; growth/burst not asserted absent in production |

## Reproducible calculator record

Use `engine-reference.json`, supplied by the coordinating agent from an actual Node engine run. Complete inputs: ports 14, portMbps 1000, util 100, concurrency 100, overhead 0, uplinkMbps 10000, uplinks 2, target 80, peakPorts 14, growthPct 0, burstPct 0, failedUplinks 1 and engineering=true.

Normal expected output: demand 14 Gbps, uplink 20 Gbps, safe 16 Gbps, spare 2 Gbps, demandUtil 70%, oversubscription 0.7:1, requiredUplinks 2, baseline status pass. N-1 expected: demand 14, uplink 10, safe 8, spare −6, demandUtil 140%, status fail. Overall engine risk high; checks.n1 false. A baseline pass does not approve the overall design.

Root reported all eight existing internal destinations have local index files and returned HTTP 200 via PowerShell HEAD on 2026-10-09. The web tool's hub-open error was tool-specific; availability was checked separately. New proposed article canonical has not been created or checked live. Verified repository remote reported by coordinator: `https://github.com/NetEngineerLab/website.git`; no public technical note permalink is invented.

## Completed independent verification

1. The reviewer inspected every artifact against the brief's acceptance criteria.
2. The unchanged Python block exited 0 with all normal, alternative and N-1 assertions passing.
3. The actual Node engine inputs and full result exactly matched `engine-reference.json`.
4. Eight destinations independently had local files and returned HTTP 200 to HEAD.
5. Counts passed: opening 101 words; article 1,385 whitespace words excluding comments/link targets; X posts 229/248 characters including URLs/newlines. Schedule timezone conversions also passed.

## Remaining P1 release gates

Website implementation is not complete. The proposed route still needs rendered-page, canonical, language/navigation, mobile/table, HTTP and crawl/index checks. Contextual inbound links from the hub/guides remain proposals. Read current Reddit and other channel rules, verify truthful author context and previews before an authorized post. Inspect available analytics and calculation events before reporting conversions. These are publication gates, not unresolved material content errors.

Reddit official rules could not be read through the available web result, which exposed a login shell. Community posting eligibility remains unverified. Search-volume data, live analytics and ranking outcomes were not obtained; scheduling is a hypothesis. No posts, replies, PRs, website changes or automations were made by the content author.

Next action: review the accepted member-assignment table before authorizing the website implementation.
