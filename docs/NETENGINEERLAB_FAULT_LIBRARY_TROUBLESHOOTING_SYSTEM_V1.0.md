# NetEngineerLab Fault Library & Troubleshooting System V1.0

**状态：PLANNED（产品与工程规范；尚未实现）**  
**版本：V1.0**  
**范围：定义后续产品与内容建设的边界、数据结构和阶段门禁，不代表已上线或已经拥有真实案例。**

## 1. 产品定位

Fault Library & Troubleshooting System 是 NetEngineerLab 的故障排查系统，不是故障文章集合。它把用户观察到的症状关联到可采集证据、逐步缩小范围的决策路径、适用工具、诊断结论、处置与验证：

`Symptom → Evidence → Decision Path → Tool → Diagnosis → Action → Verification`

导航职责固定为：Learn 教原理；Troubleshoot 帮助解决问题；Tools 计算或验证；Topic Hub 聚合相关资源。避免复制课程内容；故障页面链接到原理、工具和专题。

## 2. 信息架构与入口

首要入口是**按症状查找**，因为用户通常知道现象而非故障名。首批症状分类可包括 ONU 掉线/弱光、端口反复 Up/Down、Ping 丢包、时延高、CPU 高、路由缺失、OSPF 邻居不上、BGP 路由消失、链路利用率高。症状再映射到协议、设备类型、网络层级和故障域。

规划中的模块为 Symptoms、Fault Library、Decision Trees、Real Cases、Labs、My Diagnosis。具体导航和交互待产品设计及技术审计后确定；此文档不宣称这些模块已存在。

## 3. 资产类型及最小 Schema

通用故障模式、排障指南与真实案例必须分开呈现，并使用 `asset_type` 标识：

| 类型 | 用途 | 真实性要求 |
|---|---|---|
| `fault_pattern` | 可复用的典型故障模式（如 ONU RX Power Too Low） | 明确是工程模式，不伪装成实测案例 |
| `troubleshooting_guide` | 针对问题的通用、可执行排查流程 | 标注适用范围、前置条件和依据 |
| `real_case` | 真实事件的匿名化记录 | 来源可追溯且有人工审核；无证据不得标为真实 |

每个资产至少记录：`fault_id`、`title`、`asset_type`、`domain`、`technology`、`device_type`、`symptoms`、`severity`、`typical_causes`、`required_evidence`、`decision_steps`、`related_tools`、`root_cause`（可未知）、`fix`、`verification`、`prevention`、`source`、`confidence`、`status`。案例还须记录 `observed_data`、`expected_data`、`difference`、`diagnostic_signal`、范围与时间信息（经脱敏）、推断及排除理由。

字段允许显式标记未知/不适用，不可为填满模板而编造数据。每条结论应区分观测、预期、差异、推断和确认结果。来源、单位、设备/软件版本及采样条件在适用时一并记录。

## 4. Evidence 与 Decision Path

排障内容应建立可复核证据链，说明每一步检查什么、为什么、观察结果如何改变下一步，以及哪些证据支持/排除候选原因。标准流程优先从影响范围和共同变化入手，再比较同类对象，检查物理层、配置、协议状态，最后使用适配的计算或诊断工具。实际顺序可按技术域调整，必须注明前置条件和停止/升级条件；不得把相关性直接写成根因。

例如“同一 PON 下多个 ONU 同时弱光”只能先支持缩小到共用支路的假设；需记录同 OLT 其他 PON 口、同 PON 其他支路等对照证据，并以 OTDR 或现场检查等结果确认，不能由示例自动断言已发现故障点。

高频且分支明确的场景可做故障树，例如 Packet Loss 按全网/单 VLAN/单用户影响范围分流，再检查上联/CPU、VLAN/Trunk/STP 或物理链路/CPE/接入。简单故障用线性步骤即可；不为了形式给每个条目强加树。

## 5. 工具集成

工具必须参与适用场景的诊断，而非仅作页面链接；集成时说明输入、单位、假设、输出及其在决策中的作用。候选映射包括：

- PON/光功率：ONU RX Power、Optical Power Budget、Splitter Loss、OTDR 类工具。
- 链路拥塞：Link Capacity、Oversubscription、N-1 Capacity 类工具。
- 可用率/SLA：Availability、MTTR、SLA 类工具。

以上是需求映射，不表示仓库已存在或这些名称均对应已验收工具。落地前须盘点现有工具及能力；没有可靠工具时标出人工测量或待补能力，不伪称集成。工具结果只支持相应判断，不替代现场测量和工程确认。

## 6. 可信度、来源与隐私

来源类型使用明确枚举：`verified_real_case`、`engineering_pattern`、`vendor_reference`、`standard_based`、`community_example`、`ai_generated_draft`。另设 `confidence: high | medium | low`，并记录判断依据、审核人/日期与来源引用。来源类别描述证据性质，confidence 描述对当前结论的把握；二者不可混为一谈。

AI 生成草稿不得直接晋升为已验证案例；真实案例必须经人工核实来源、证据和脱敏后才能发布。案例应移除客户姓名、电话、精确地址、公网敏感 IP、账号、密码、SNMP community、VPN 凭证和内部登录信息；只保留解释故障必要的拓扑关系、设备类别、指标变化和过程。发布前执行脱敏复核，并控制原始材料访问与留存。

## 7. 首发范围与内容质量门槛

V1 优先三个域：PON/Optical、Switching/Ethernet、IP/Connectivity。推荐规划目标为 30 个高质量 Fault Pattern、15 个有证据的匿名真实案例、10 个 Troubleshooting Guide、5 个交互式故障树；这是目标，不是已完成数量或发布承诺。先保证质量和工具闭环，再扩展 Transmission、Data Center、Power 等领域。

每个发布资产须通过：字段完整性；症状可检索；步骤有顺序和理由；证据与推断分开；工具映射经过能力核实；来源与可信度明确；案例脱敏通过；处置后验证可执行。真实案例缺证据时可作为未验证线索隔离，不能计入已验证案例。

## 8. AI 使用边界

未来 AI 可依据已审核资产匹配相似症状、询问缺失信息、建议下一项低风险证据采集，并解释候选路径与来源。输出须显示依据、置信程度、不确定项及适用范围；不得把模式匹配当作根因确认，不得编造测量结果、案例或工具能力。任何涉及变更、停机、凭证或安全影响的动作必须由工程人员判断并遵循变更流程。AI 产出仅能作为草稿，经人工审核后才能进入知识库。

## 9. 阶段门禁

1. **产品门禁**：症状入口、三类资产边界、首发域、导航职责和指标经产品评审确认。
2. **数据/技术门禁**：Schema、来源/版本、检索与发布状态、脱敏和审计字段经技术审计；盘点实际工具映射与维护方式。
3. **内容试点门禁**：先选少量代表性条目；独立复核证据、决策步骤、工具输出、隐私与事实依据，并记录问题和修订。
4. **发布门禁**：必要验证通过，真实案例来源和脱敏审核完成，搜索/链接/移动端与可访问性检查通过，明确回滚和内容维护责任后，才可逐步上线。

任一门禁未通过，不扩大内容规模、不将草稿标为已验证、不发布未经核实的功能承诺。本文仅作为 PLANNED 设计输入，实施前还须完成技术审计与仓库现状核对。
