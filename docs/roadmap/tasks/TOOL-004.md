# TOOL-004 — Access Switch Uplink Bandwidth Planner

- **阶段 / 状态：** ADMISSION / BLOCKED
- **选择原因：** P1 队列中的下一项；用户明确要求审核 TOOL-004。
- **负责人：** `/root`（总工）；独立审查者 `/root/tool002_admission`。
- **当前候选定义：** 仅有标题 `Access Switch Uplink Bandwidth Planner`、Ethernet / Switching 领域和 `PLAN` 标签。问题定义、输入、输出、核心逻辑、目标用户、canonical ID 和各 Gate 均为 `PENDING`。
- **疑似映射：** `switch-uplink-oversubscription-calculator`；crosswalk 仍为 `HYPOTHESIS / UNREVIEWED`。
- **现有工具覆盖：** 上联计算器包含忙时利用率、并发、协议余量、目标利用率、所需上联数、容量余量和 N-1 场景，确有规划功能重叠。其测试通过，但这只验证现有工具，不构成 TOOL-004 原始范围证据。
- **独立审查：** BLOCKED。标题与现有实现不足以证明候选定义相同，也不足以判定不同。独立审查者拒绝签署重复排除。
- **依赖：** TOOL-004 权威问题定义；另有未关闭的 40 项共享 crosswalk 前置，关闭前不得进行其他候选实现准入。
- **验收标准：** 获得权威范围后，核对六项问题指纹、现有工具覆盖、Mandatory Gates、至少两项 Value Gates、跨站边界和 Source / Method / Validation；由独立审查者签署 PASS 后，才可排除重复或准入实现。
- **实现 / 验证：** 未实现新页面。运行 `node website/tools/switch-uplink-oversubscription-calculator/docs/engine-test.js` → `Switch uplink oversubscription engine tests: PASS`。
- **下一诊断动作：** 提供 TOOL-004 的权威问题定义、输入、输出和核心逻辑，或提供可信源文件路径；保持矩阵、crosswalk 和候选视图不变。
- **部署：** 未部署；未 push、未合并。
- **证据：** [独立审核检查点](../evidence/TOOL-004-admission-blocked-2026-10-12.md)
