# Content brief: LACP member congestion

Status: drafted 2026-10-09; independent content audit accepted (CONTENT PASS WITH P1; see audit.md); publication gates remain open; no live publishing authorized by this pack.

## Editorial decision

Create **Why Is One LACP Link Congested While the Other Is Idle?** as an engineering troubleshooting tutorial. Primary value is a reproducible member-level diagnosis; secondary value is relevant organic discovery and qualified calculator use. Avoid generic ratio explanations already owned by existing guides.

| Candidate | Reader problem | Distinct value | Decision |
|---|---|---|---|
| Why is one LACP link congested while the other is idle? | Bundle average looks healthy but applications stall | Offered-demand example, evidence collection, hash decision, N-1 | Selected |
| Is 2×10G enough for 48 gigabit ports? | Upgrade sizing | Existing guide already owns this | Reject duplicate |
| What is an acceptable oversubscription ratio? | General planning | Existing ratio guide already owns this | Reject duplicate |
| Does LACP double a single TCP flow? | Speed expectation | Useful FAQ but narrower diagnostic value | Supporting section |

Persona: campus/data-center network engineer investigating backup, replication, or server traffic; operator has access to member counters and flow telemetry but needs a defensible change decision. The example uses server endpoints capable of more than 10 Gbps, not four 1 Gbps access clients.

Intent: informational troubleshooting first; practical evaluation second. Searcher needs to explain uneven LAG bandwidth, distinguish imbalance from member failure, and decide whether changing hash inputs, rescheduling workload, or increasing link speed addresses the bottleneck.

## Search hypotheses, not measured metrics

| Required field | Selection |
|---|---|
| Primary Keyword | LACP uneven traffic |
| Secondary Keywords | one LACP link congested; LACP hash imbalance; EtherChannel load balancing; LAG aggregate bandwidth vs single flow; LACP N-1 capacity |
| Search Intent | Informational troubleshooting, followed by engineering evaluation |
| Target User | Network engineer investigating member congestion and preparing a change review |
| Target Country / Language | US, UK and global English; Chinese adaptation for Mandarin-speaking engineers |
| Difficulty Judgment | Qualitative medium for focused symptoms; medium/high for broad vendor terms; no measured SEO score |
| Commercial Intent | Low direct purchase intent; indirect evaluation of capacity or faster hardware after diagnosis; no product sales claim |
| Related Tool | Switch Uplink Bandwidth & Oversubscription Calculator |
| Related Topic Hub | Switch Oversubscription |

| Cluster | Phrases | Role | Qualitative competition hypothesis |
|---|---|---|---|
| Symptom | one LACP link congested, LACP uneven traffic, one port-channel member idle | Main intent | Medium: vendor docs and community discussions; long-tail diagnosis may be less crowded |
| Mechanism | LACP hash imbalance, EtherChannel load balancing, elephant flows LAG | Explain cause | Medium/high for broad vendor terms |
| Capacity | 2x10G LACP congestion, LAG aggregate bandwidth vs single flow | Worked example | Medium; overlap with sizing content requires precise scope |
| Failure | LACP N-1 capacity, port-channel min-links | Safety check | Medium; device-specific searches are strongly served by vendor docs |
| Chinese | 链路聚合单口拥塞, LACP负载不均衡, 聚合口总带宽够但丢包 | WeChat/Zhihu discovery | Unmeasured; engineer wording preferred over keyword repetition |

Target: US and UK engineers plus global English-speaking operators; Chinese channels address Mandarin-speaking operations teams. No geography-specific hardware claim. No search-volume, CPC, ranking, or difficulty score is asserted. Obtain Search Console query impressions after publication; paid SEO metrics are not available in this task.

Title: **Why Is One LACP Link Congested While the Other Is Idle?**

Meta description: **Diagnose uneven LACP traffic with member counters, a 2×10G example, hash checks and N-1 capacity. Separate aggregate headroom from actual forwarding.**

Proposed slug: `/guides/lacp-member-congestion/`

Proposed canonical: `https://netengineerlab.com/guides/lacp-member-congestion/` (new draft URL; not claimed live). If a Chinese site version is later created, give it its own canonical and valid language alternates; WeChat/Zhihu posts do not create a site route automatically.

Structure: answer opening → LACP/control versus forwarding → four-flow example → five-step evidence workflow → intervention decision → exact aggregate tool inputs → N-1 caveat → five-question FAQ → evidence-based CTA.

Index gate: recommendation is **eligible after implementation and independent review**, not “already indexed.” Verify distinct diagnostic value, cited scope, crawlable 200 page, self canonical, correct navigation/language metadata, readable tables, working links, and no accidental draft indexing. Engineering quality and publication authorization remain required. This pack creates Markdown drafts only.

## Acceptance criteria and ownership

| Work | Owner | Input | Output | Dependency | Checkable acceptance |
|---|---|---|---|---|---|
| Content implementation | Content author agent | Local tool, existing guides, primary sources | Seven channel files plus README/evidence | Technical facts | Correct arithmetic; article 1100–1500 words; substantive Chinese rewrite; explicit limits |
| Verification | Coordinating agent | Drafts, actual engine, URLs | Verification evidence | Drafts | Execute code; confirm tool results/links; count X characters |
| Independent audit | Agent uninvolved in authorship | Actual files and evidence | Audit findings | Both above | No unresolved material error before completion claim |

Next editorial action: inspect the member-assignment table in `website-article.md` before approving a publishing implementation.
