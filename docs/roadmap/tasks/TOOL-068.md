# TOOL-068 — Connector / Splice Loss Budget Calculator

- **阶段 / 状态：** ADMISSION / BLOCKED
- **负责人：** `/root`（总工）；准入与实现尚未开始。
- **优先级 / 队列：** P1；因准入证据不足而阻塞，队列应自动跳过。
- **候选定义：** `docs/roadmap/PHASE0_AUDIT_MATRIX.csv` 中 problem_statement、inputs、outputs、core_logic、target_user 均为 `PENDING`；Mandatory Gates 未完成。
- **未决映射：** `otdr-event` 与 `sfp-qsfp-compatibility-calculator` 对 TOOL-068 有部分功能重叠线索，但对应候选范围仍缺失；交叉表保持 `HYPOTHESIS / UNREVIEWED`，不得认定重复或独立。
- **共享依赖：** 40 个现有工具的交叉表审核尚未关闭；工作流要求先完成此共享前置审核。
- **阻塞原因：** 缺少 TOOL-068 权威问题指纹、来源与验证依据；无法根据现有工具局部功能确定候选边界。
- **下一诊断动作：** 获取 TOOL-068 的权威范围与 Source/Method/Validation，关闭共享交叉表前置审核后进行独立范围比较并重新执行准入。
- **实现 / 部署：** 未开始；未修改工具页面或计算引擎；未上线、未 push、未合并。
- **验收标准：** 独立准入审核有证据签署且矩阵门禁通过后才可实现；实现后适用测试及独立验收均 PASS，方可从待开发视图移入完成记录。
