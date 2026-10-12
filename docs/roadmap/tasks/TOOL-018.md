# TOOL-018 — IPv6 Prefix Planner

- **阶段 / 状态：** ADMISSION / BLOCKED
- **负责人：** `/root`（总工）；实现与准入尚未开始。
- **已有审核：** 2026-10-12 独立交叉表审核确认现有 `ipv6-nat-planner` 包含 IPv6 子前缀规划功能；但 TOOL-018 的 problem/input/output/core_logic/target_user 与准入门禁仍为 `PENDING`，不能确定重复或独立范围。
- **阻塞原因：** 缺少 TOOL-018 权威问题指纹；共享 40 工具交叉表也未关闭。
- **下一诊断动作：** 获取候选的权威范围和 Source/Method/Validation；满足后 `unblock` 并由独立审核者重新签准入。
- **实现：** 未开始；没有修改现有 IPv6 工具或创建新页面。
- **队列行为：** 阻塞后自动跳过，继续选择优先级排序的下一候选。
- **证据：** [交叉表审核](../evidence/PHASE0-IPV6-TOOL018-CROSSWALK-REVIEW-2026-10-12.md)。
