# Baseline

- Repository: `NetEngineerLab/website`
- Audited `main`: `1c849433e568548c6a7b42d5be4cc4603845caae`
- Commit subject: Make the visible tool title the only page heading.
- Cloud clone of `origin/main` was clean before this branch.
- Windows `D:\NetEngineerLab-V173-GitHub` was not mounted. This run cannot prove the dirty state of that directory.
- Production `https://netengineerlab.com/` was not deployed and was not modified.
- Open pull requests left untouched: #61 fiber latency, #59 chromatic dispersion, #52 tool-detail audit, #49 UI unification docs.

Active registry tools: 47. Supplemental tools outside the registry: 5. Active workflow registry entries: 16. Historical candidate rows in `docs/roadmap/DEVELOPMENT_CANDIDATES.csv`: 156.

The 16 registry workflows are navigation step lists in `src/registry/workflow-registry.json` and `website/data/tool-graph.json`. They do not share one project context. The old queue file `docs/roadmap/DEVELOPMENT_QUEUE_STATE.json` was read and not rewritten. Its completed list is empty, three entries are deferred, and twenty entries are blocked.
