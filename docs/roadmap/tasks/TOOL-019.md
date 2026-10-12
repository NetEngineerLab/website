# TOOL-019 — VLSM Address Planner

- **阶段 / 状态：** ADMISSION / BLOCKED
- **负责人：** `/root`（总工）；实现与准入尚未开始。
- **现有工具线索：** `subnet-calculator` 页面和引擎已有 VLSM 分配，按需求排序、前缀计算和网络边界对齐。
- **阻塞原因：** TOOL-019 的 problem_statement、inputs、outputs、core_logic、target_user 与 Mandatory Gates 均为 `PENDING`。仅凭候选标题和现有功能无法签署重复或独立范围。
- **下一诊断动作：** 获取 TOOL-019 权威范围、输入输出、分配规则和 Source/Method/Validation；由独立审计比较现有 subnet calculator 后再准入。
- **实现：** 未开始；没有修改现有子网工具或创建新页面。
- **队列行为：** 阻塞后自动跳过，按优先级继续下一候选。
- **证据来源：** `docs/roadmap/PHASE0_AUDIT_MATRIX.csv` TOOL-019 行；`website/tools/subnet-calculator/index.html` VLSM methodology；`website/tools/subnet-calculator/js/engine.js` VLSM allocation logic。
