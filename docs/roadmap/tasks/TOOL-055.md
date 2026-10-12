# TOOL-055 — XGS-PON Optical Power Budget Calculator

- **阶段 / 状态：** ADMISSION / BLOCKED
- **负责人：** `/root`（总工）；准入与实现尚未开始。
- **优先级 / 队列：** P1；因准入证据不足而阻塞，队列应自动跳过。
- **候选定义：** `docs/roadmap/PHASE0_AUDIT_MATRIX.csv` 中 problem_statement、inputs、outputs、core_logic、target_user 均为 `PENDING`；Mandatory Gates 未完成。
- **现有工具映射：** `docs/roadmap/PHASE0_EXISTING_TOOL_CROSSWALK.csv` 已确认 `optical-power-budget → TOOL-054` 并保留现有工具；TOOL-055 的矩阵 `candidate_existing_tool_ids` 关联仍为轻量假设，TOOL-055 是否重复或独立尚未审核。不得把 TOOL-054 的已确认映射当作 TOOL-055 的结论。
- **共享依赖：** 40 个现有工具的交叉表审核尚未关闭；工作流要求先完成此共享前置审核。
- **阻塞原因：** TOOL-055 的权威问题指纹和门禁证据缺失；与现有光功率预算工具的候选范围关系尚未独立判定。
- **下一诊断动作：** 获取 TOOL-055 权威范围与 Source/Method/Validation，完成共享前置审核及独立范围比较后重新执行准入。
- **实现 / 部署：** 未开始；未修改工具页面或计算引擎；未上线、未 push、未合并。
- **验收标准：** 独立准入审核有证据签署且矩阵门禁通过后才可实现；实现后适用测试及独立验收均 PASS，方可从待开发视图移入完成记录。
