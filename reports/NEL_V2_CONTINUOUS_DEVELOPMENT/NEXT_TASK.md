# Next task

Do not start WF-02 in the same change.

Next task: independent review of WF-01.

Reviewer inputs:

- `website/assets/js/workflow/nel-workflow-core.js`
- `website/assets/js/workflow/ftth-pon-v1.js`
- `website/workflows/ftth-pon/`
- `tests/ftth-pon-workflow-v1.test.js`
- `reports/NEL_V2_CONTINUOUS_DEVELOPMENT/BROWSER_QA_REPORT.md`

The reviewer must not be the implementing agent. If the review is PASS, the next build task is WF-02 IP planning on the same project store, using the existing subnet, VLAN, OSPF, route summary, bandwidth and uplink engines. If the review finds a unit or lock defect, fix WF-01 before any second workflow.

Still out of scope until a separate authorization: payment, accounts, cloud sync, device command execution, sitemap inclusion, and Chinese/Spanish workflow pages.
