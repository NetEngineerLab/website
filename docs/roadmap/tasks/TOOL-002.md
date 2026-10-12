# TOOL-002 — Switch Port Capacity Calculator

- **阶段 / 状态：** ADMISSION / EXCLUDED_DUPLICATE（不再是待实现项）
- **负责人：** `/root`（总工）；实际模型标识未记录。
- **独立审查：** `/root/tool002_admission` 对 PoE 重复排除签署 PASS；此结论不代表新工具准入、实现验收或部署批准。
- **输入：** 用户确认的 TOOL-002 范围；矩阵和 crosswalk 当前行；`website/tools/poe-power-budget-calculator/` 页面、引擎和现有测试。
- **输出：** 账本记录 `TOOL-002` 与现有 `poe-power-budget-calculator` 为同一 PoE 设备数量、端口和功率容量问题；新候选按重复排除，现有工具保留为唯一实现。
- **依赖：** 该映射已独立复核；40 项共享交叉表其余未决条目仍需逐项审计，未关闭前不得开始其他候选实现。
- **验收标准：** TOOL-002 矩阵为 `REJECT_DUPLICATE / FAIL` 且含完整问题指纹和 Mandatory/Value 证据；PoE crosswalk 为 `CONFIRMED / KEEP` 且引用独立签署；候选视图移除 TOOL-002，但不写入开发完成状态。
- **处理结果：** 用户明确选择 PoE 设备数量、端口和功率范围，并接受与现有 PoE 工具重复或合并。现有工具页面、引擎和测试覆盖该范围；独立审核确认按重复项排除有证据支持。
- **实现 / 测试：** 未实现新页面；现有引擎测试 `node website/tools/poe-power-budget-calculator/docs/engine-test.js` 通过。没有部署。
- **后续动作：** 保留此检查点及证据作为排除历史；继续处理其他未决交叉表映射。若以后提出超出当前 PoE 工具的能力，再建立现有工具升级任务。
- **失败计数：** 0 次实现修复；审核提案按独立审查意见修订后通过。
- **证据：** [PoE 功能对照](../evidence/TOOL-002-poe-overlap-review-2026-10-11.md)；[独立签署的重复排除决定](../evidence/TOOL-002-poe-duplicate-decision-2026-10-11.md)


