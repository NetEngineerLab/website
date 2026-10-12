# TOOL-036 — Branch WAN Capacity Planner

- **阶段 / 状态：** ADMISSION / BLOCKED
- **负责人：** `/root`（总工）；准入与实现尚未开始。
- **优先级 / 队列：** P1；因准入证据不足而阻塞，队列应自动跳过。
- **候选定义：** `docs/roadmap/PHASE0_AUDIT_MATRIX.csv` 中 problem_statement、inputs、outputs、core_logic、target_user 均为 `PENDING`；Source/Method/Validation 等准入门禁也未完成。
- **现有工具映射：** 矩阵中的 `existing_tool_id` 与 `candidate_existing_tool_ids` 为空，`mapping_confidence=NO_MATCH`；这些字段不能替代候选问题范围及验证依据，也不代表准入通过。
- **共享依赖：** 40 个现有工具的交叉表审核尚未关闭；工作流要求先完成此共享前置审核。
- **阻塞原因：** 缺少 TOOL-036 权威问题指纹、来源与验证依据；目前无法建立可审核的需求范围，故不得实现。
- **下一诊断动作：** 获取 TOOL-036 的权威范围（problem、inputs、outputs、core logic、target user、Source/Method/Validation），关闭共享前置审核后重新执行准入。
- **实现 / 部署：** 未开始；未修改工具页面或计算引擎；未上线、未 push、未合并。
- **验收标准：** 独立准入审核有证据签署且矩阵门禁通过后才可实现；实现后适用测试及独立验收均 PASS，方可从待开发视图移入完成记录。
