# TOOL-004 — admission review checkpoint

**Date:** 2026-10-12  
**Prepared by:** `/root`  
**Independent reviewer:** `/root/tool002_admission` — BLOCKED; insufficient candidate-side scope to sign duplicate or distinct-problem decision  
**Decision:** Keep TOOL-004 in the queue as `HYPOTHESIS / UNREVIEWED`. Do not change its matrix or crosswalk decision.

## Candidate evidence

The TOOL-004 matrix row provides only the title **Access Switch Uplink Bandwidth Planner**, primary domain **Ethernet / Switching**, and lifecycle tag `PLAN`. The problem statement, inputs, outputs, core logic, target user, canonical problem ID, Mandatory Gates, Value evidence, and cross-site decision are `PENDING`. `ROADMAP.md` states that the companion NetEngineerLab 200 Tools Master Roadmap V1.0 is `DRAFT FOR AUDIT / NOT FROZEN`; repository search found no authoritative TOOL-004 definition beyond the matrix title and metadata.

## Existing-tool evidence

The hypothesized existing tool, `switch-uplink-oversubscription-calculator`, has access-port and uplink rates/counts plus demand-planning inputs including utilization, concurrency, overhead, target utilization, burst/growth, and failure conditions. It calculates demand and safe capacity, required uplinks, headroom, and normal/peak/conservative/N-1 scenarios (`website/tools/switch-uplink-oversubscription-calculator/index.html:52`; `website/tools/switch-uplink-oversubscription-calculator/js/engine.js:2`). The existing engine test passed: `node website/tools/switch-uplink-oversubscription-calculator/docs/engine-test.js` → `Switch uplink oversubscription engine tests: PASS`.

This is a meaningful overlap hypothesis, but the existing tool's implementation cannot be used to fill in the missing candidate definition. The title does not establish whether TOOL-004's planner covers the same inputs and outputs, a broader multi-switch design, or a distinct planning problem.

## Independent reviewer decision

`/root/tool002_admission` reviewed the matrix, crosswalk, roadmap status, existing page, engine, and validation evidence. The reviewer concluded **BLOCKED**: the available evidence supports possible overlap but not a duplicate determination or a distinct-problem determination. The reviewer declines to sign `REJECT_DUPLICATE` and confirms the crosswalk must remain `HYPOTHESIS / UNREVIEWED`.

## Required next action and limits

Obtain an authoritative TOOL-004 problem definition specifying inputs, outputs, and core logic, then perform a fresh independent comparison. Until then, retain TOOL-004 in the candidate view, keep its matrix fields pending, and do not implement or deploy it. The shared 40-tool crosswalk prerequisite also remains open for candidate implementation admission.
