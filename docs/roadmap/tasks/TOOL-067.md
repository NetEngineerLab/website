# TOOL-067 — Fiber Link Loss Calculator

- **阶段 / 状态：** ADMISSION / BLOCKED
- **负责人：** `/root`（总工）；准入与实现尚未开始。
- **优先级 / 队列：** P1；因准入证据不足而阻塞，队列应自动跳过。
- **候选定义：** `docs/roadmap/PHASE0_AUDIT_MATRIX.csv` 中 problem_statement、inputs、outputs、core_logic、target_user 均为 `PENDING`；Mandatory Gates 未完成。
- **未决映射：** `fiber-loss`、`otdr-event`、`sfp-qsfp-compatibility-calculator` 对该候选存在 `HYPOTHESIS / UNREVIEWED` 关系。独立复核确认现有工具有部分损耗/光裕量功能，但候选范围缺失，不能确定重复或独立。
- **共享依赖：** 40 个现有工具的交叉表审核尚未关闭；工作流要求先完成此共享前置审核。
- **阻塞原因：** 缺少 TOOL-067 权威问题指纹及来源/验证依据，多个交叉表映射尚未签署。
- **下一诊断动作：** 获取 TOOL-067 的权威范围与 Source/Method/Validation，关闭共享交叉表前置审核后，独立比较并重新执行准入。
- **实现 / 部署：** 未开始；未修改工具页面或计算引擎；未上线、未 push、未合并。
- **验收标准：** 独立准入审核有证据签署且矩阵门禁通过后才可实现；实现后适用测试及独立验收均 PASS，方可从待开发视图移入完成记录。
