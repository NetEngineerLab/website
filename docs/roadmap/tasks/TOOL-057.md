# TOOL-057 — PON Split Ratio Planner

- **阶段 / 状态：** ADMISSION / BLOCKED
- **负责人：** `/root`（总工）；准入与实现尚未开始。
- **优先级 / 队列：** P1；因准入证据不足而阻塞，队列应自动跳过。
- **候选定义：** `docs/roadmap/PHASE0_AUDIT_MATRIX.csv` 中 problem_statement、inputs、outputs、core_logic、target_user 均为 `PENDING`；Mandatory Gates 未完成。
- **现有工具映射：** 映射到 `pon-splitter-loss`，但候选行仍为 `UNREVIEWED`。不得仅凭标题或现有工具判断重复或独立。
- **共享依赖：** 40 个现有工具的交叉表审核尚未关闭；工作流要求先完成此共享前置审核。
- **阻塞原因：** 缺少 TOOL-057 权威问题指纹、来源与验证依据，且与现有 PON splitter-loss 工具的范围关系尚未审定。
- **下一诊断动作：** 获取 TOOL-057 权威范围与 Source/Method/Validation，完成共享前置审核及独立范围比较后重新执行准入。
- **实现 / 部署：** 未开始；未修改工具页面或计算引擎；未上线、未 push、未合并。
- **验收标准：** 独立准入审核有证据签署且矩阵门禁通过后才可实现；实现后适用测试及独立验收均 PASS，方可从待开发视图移入完成记录。
