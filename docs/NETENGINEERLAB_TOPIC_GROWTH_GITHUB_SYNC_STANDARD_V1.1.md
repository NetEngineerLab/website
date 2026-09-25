# NetEngineerLab Topic Growth & GitHub Sync Development Standard V1.0

## 1. Purpose

This document freezes the standard workflow for turning a NetEngineerLab engineering tool into a complete search, content, and GitHub growth asset.

A topic is not considered complete when the calculator or planner works. A complete topic must include:

1. Deep engineering tool
2. Pillar Guide
3. Problem Pages
4. Internal links
5. Search metadata
6. Sitemap registration
7. GitHub engineering guide
8. Community distribution assets
9. Post-launch indexing and performance review

The objective is to make every engineering tool solve a real user problem and also create a durable search and reference asset.

---

## 2. Standard Topic Package

Each topic should contain:

### Product
- 1 deep engineering tool
- clear input guidance
- engineering assumptions
- normal-state calculation
- N-1 / failure-state calculation when relevant
- risk or capacity interpretation
- actionable recommendation

### Website content
- 1 Topic Hub for each core topic
- 1 Pillar Guide
- 3–5 Problem Pages
- examples based on realistic engineering scenarios
- FAQ
- strong internal links between Topic Hub, Tool, Pillar Guide, and Problem Pages

### GitHub content
- 1 engineering cheat sheet for the topic
- additional focused example documents when they provide independent value
- links back to the live calculator and canonical NetEngineerLab Guide
- references to authoritative standards/vendor documentation where appropriate

GitHub documents must not be verbatim copies of website articles.

---

## 3. Directory Standard

Website:

```text
website/
├─ tools/
│  └─ <tool-slug>/
├─ topics/
│  └─ <topic-slug>/
├─ guides/
│  ├─ <pillar-guide-slug>/
│  └─ <problem-page-slug>/
└─ zh/
   ├─ topics/
   │  └─ <topic-slug>/
   └─ guides/
      ├─ <pillar-guide-slug>/
      └─ <problem-page-slug>/
```

Project documentation / GitHub reference content:

```text
docs/
├─ NETENGINEERLAB_TOPIC_GROWTH_GITHUB_SYNC_STANDARD_V1.0.md
└─ guides/
   └─ <topic>/
      ├─ <pillar-guide>.md
      └─ <focused-example>.md
```

---

## 4. SEO / Search Requirements

Every indexable Guide must include:

- unique Title
- unique Meta Description
- one H1
- canonical URL
- reciprocal hreflang for supported language pairs
- Article or appropriate structured data
- meaningful internal links
- inclusion in sitemap metadata
- readable mobile layout
- original engineering value

Avoid creating multiple pages that answer the same search intent with only minor wording differences.

---

## 5. Content Quality Standard

Every engineering article should answer the main query early.

Recommended structure:

1. Quick answer
2. Formula or design rule
3. Worked example
4. Engineering interpretation
5. Failure / N-1 case where relevant
6. Real traffic or utilization case
7. Design checklist
8. Tool CTA
9. FAQ
10. Related guides

The article should not merely define a term. It should help the engineer make a decision.

---

## 6. GitHub Sync Standard

For every completed topic:

### GitHub document must:
- be written as an engineering reference / cheat sheet
- use concise Markdown
- contain formulas and worked examples
- link to the canonical NetEngineerLab Guide
- link to the corresponding live calculator
- avoid duplicating the full website article
- include a short References section

### Recommended GitHub structure

```text
docs/guides/switching/
├─ switch-oversubscription-ratio.md
└─ 48-port-switch-oversubscription.md
```

Website is the canonical long-form SEO asset.
GitHub is the concise technical-reference asset.

---


## 7. Topic Hub Aggregation Rule

Every core topic must have a dedicated **Topic Hub** page.

Recommended routes:

```text
/topics/<topic-slug>/
/zh/topics/<topic-slug>/
```

The Topic Hub is the canonical aggregation page for the topic and must collect all relevant resources belonging to that topic.

A Topic Hub must include, when available:

- Pillar Guide
- all active Problem Pages
- the related engineering Tool / Calculator / Planner
- worked examples
- failure / N-1 design content
- GitHub engineering guides
- GitHub focused-example documents
- other directly relevant topic resources

### Mandatory Rule

> **Every Topic Hub must aggregate all website content and GitHub technical resources for that topic, and the Topic Hub must be updated whenever a new article, guide, tool, example, or GitHub document is added.**

The Topic Hub must not become stale.

Whenever any topic asset is created, renamed, moved, deprecated, or withdrawn, the Topic Hub must be reviewed and updated in the same change set.

### GitHub Link Rule

Website Topic Hub pages must link to the real published GitHub URL, not to a local repository path such as:

```text
docs/guides/switching/example.md
```

Use the public repository URL after the document is published, for example:

```text
https://github.com/<owner>/<repo>/blob/main/docs/guides/switching/example.md
```

If the GitHub document has not yet been published, the Topic Hub may omit the external link until the repository URL exists.

### Topic Hub Structure

Recommended content order:

```text
Topic Overview
├─ Start Here
│  └─ Pillar Guide
├─ Calculate / Plan
│  └─ Engineering Tool
├─ Common Scenarios
│  └─ Problem Pages / Worked Examples
├─ Failure & Resilience
│  └─ N-1 / Risk / Recovery Guides
├─ Engineering Resources
│  └─ GitHub Guides
└─ Related Topics
```

The Topic Hub exists to help both users and search engines understand the full topic structure. It must not be treated as a thin link directory; it should contain a concise topic overview, recommended reading order, and clear user journey.


## 8. Internal Linking Rule

A completed topic should normally include:

```text
Pillar Guide
   ↕
Problem Pages
   ↕
Engineering Tool
```

Each important page must not become an orphan page.

Cross-site links to other owned sites are allowed only when:
- the destination directly helps the user complete the next task;
- the topic is strongly relevant;
- the anchor text is natural;
- the link is not inserted only for SEO manipulation.

Do not create sitewide footer link networks across the future site portfolio.

---

## 9. Topic Release Gate

A topic can be marked RELEASE READY only after:

- [ ] Tool Engineering PASS
- [ ] Tool UX PASS
- [ ] Pillar Guide PASS
- [ ] Problem Pages PASS
- [ ] English/Chinese route policy PASS
- [ ] Canonical PASS
- [ ] hreflang PASS
- [ ] Structured Data PASS
- [ ] Internal Links PASS
- [ ] Sitemap PASS
- [ ] GitHub Guide PASS
- [ ] GitHub focused examples PASS where required
- [ ] Topic Hub exists for the core topic
- [ ] Topic Hub aggregates all active website topic assets
- [ ] Topic Hub links to published GitHub technical resources
- [ ] Topic Hub updated in the same change set when topic assets change
- [ ] Mobile PASS
- [ ] Lighthouse / performance gate PASS
- [ ] GSC indexing submitted / monitored

---

## 10. Topic 01 Reference Implementation

Topic:

**Switch Oversubscription & Uplink Capacity**

Current website assets:

- `/guides/switch-oversubscription-ratio/`
- `/guides/48-port-switch-oversubscription/`
- `/tools/switch-uplink-oversubscription-calculator/`

Chinese routes:

- `/zh/guides/switch-oversubscription-ratio/`
- `/zh/guides/48-port-switch-oversubscription/`
- `/tools/switch-uplink-oversubscription-calculator/zh/`

GitHub/reference assets:

- `docs/guides/switching/switch-oversubscription-ratio.md`
- `docs/guides/switching/48-port-switch-oversubscription.md`

This topic is the template for subsequent NetEngineerLab topic clusters.
