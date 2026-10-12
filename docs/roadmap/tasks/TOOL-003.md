# TOOL-003 — Switch Oversubscription Ratio Calculator

- **阶段 / 状态：** ADMISSION / EXCLUDED_DUPLICATE
- **选择原因：** P1 候选；用户明确指定 TOOL-003 按其给定定义审核。
- **负责人：** `/root`（总工）；独立审查者 `/root/tool002_admission`。
- **用户确认范围：** 接入端口总线速 ÷ 活跃上联总容量；输入为接入端口数量/速率、活跃上联数量/速率；输出为接入总线速、上联总容量及 N:1 比值。
- **对照工具：** `switch-uplink-oversubscription-calculator`。
- **独立审查：** PASS。现有页面、引擎公式及测试完整覆盖用户确认范围，支持 `REJECT_DUPLICATE / FAIL`。
- **处置：** TOOL-003 已列入重复归档并从待开发视图移除，不计入已实现完成数。现有工具保留为唯一实现；未对其作任何改动。
- **依赖边界：** Crosswalk 同一行的 TOOL-004 仍未决，故该行继续为 `HYPOTHESIS / UNREVIEWED`。40 项共享 crosswalk 仍未关闭，其他候选实现准入需等待该前置完成。
- **实现 / 测试：** 未实现新页面。既有引擎测试通过：`node website/tools/switch-uplink-oversubscription-calculator/docs/engine-test.js` → `Switch uplink oversubscription engine tests: PASS`。
- **部署：** 未部署；未 push、未合并。
- **证据：** [独立签署的重复决定](../evidence/TOOL-003-uplink-oversubscription-duplicate-2026-10-11.md)
