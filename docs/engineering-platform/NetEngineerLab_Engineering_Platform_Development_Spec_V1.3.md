# NetEngineerLab Engineering Platform — Product & Engineering Development Specification V1.3

> 状态：DRAFT / Phase 0 / 待2号产品审计、3号技术交叉审计、4号总工冻结  
> 适用项目：NetEngineerLab / Network Topology Designer  
> 原则：节约模式、Local-first、工程可验证、内容与工具复用、不得越Gate

## 0. 执行摘要

将 NetEngineerLab 从网络计算器集合扩展为“网络工程设计、计算、验证与知识平台”。核心交互产品为 **Network Topology Designer**，配套五类内容资产：**Network Diagrams、Engineering Case Studies、Equipment & Tools Guides、Network Test Plans、Network Troubleshooting Cases**。与现有 Tools、Learning、Topic Hub、SEO、Formula/Rule/Source Registry 集成，禁止重复建设CMS或计算引擎。

**本次授权仅限 Phase 0 / Gate 0：架构核查、技术可行性验证、数据契约、产品规范、样板规划与审计材料。不得开发完整编辑器、批量生成页面、上线部署、进入Phase 1。**

## 1. 产品目标与边界

### 1.1 目标用户
- 运营商PON/FTTH、OLT、IP城域网、BNG/BRAS、PE、OTN/DWDM、骨干与云网工程师；
- 企业园区、数据中心、网络安全、网络运维与测试验收工程师；
- 需要可复算拓扑设计、N-1容量分析、工程案例与测试记录的团队。

### 1.2 核心差异化
1. **绘图即建模**：图形仅是工程模型的视图，端口、链路、聚合与故障域可验证。
2. **计算即证据**：复用现有计算引擎，输出假设、规则版本、输入快照和警告。
3. **案例即模板**：工程案例关联可编辑模板、拓扑图、配置指南、测试与验收。
4. **运营商级内容**：覆盖PON、城域网、传输、云网、动力环境，不局限小企业。
5. **安全发布**：运营商真实拓扑须经授权与敏感性审查。

### 1.3 明确不做（Phase 0及首批Gate禁止）
支付/订阅、AI生成、多人实时协作、网络自动发现、生产设备连接与配置下发、运营商高级协议仿真、真实生产网自动采集、后端数据库、重复CMS、未经批准的依赖升级或架构重构。

## 2. 六大产品模块及复用关系

| 模块 | 主要能力 | 数据关联 | Phase 0交付 |
|---|---|---|---|
| Topology Designer | 节点/端口/链路编辑、场景、分析、报告 | TopologyDocument、NetworkModel | 技术选型与数据契约 |
| Network Diagrams | SVG/PNG标准拓扑图例 | Diagram ID、Template ID | 10类设备图形规范 |
| Engineering Case Studies | 需求→拓扑→计算→配置→测试→验收 | Case ID与资源引用 | 120案例路线图、2样板规格 |
| Equipment & Tools Guides | 设备配置、仪表与软件操作 | Guide ID、平台/版本 | Schema与首批10篇计划 |
| Network Test Plans | 测试步骤、判定、记录与回退 | Test Plan ID、Scenario ID | Schema与首批10套计划 |
| Troubleshooting Cases | 现象、证据、定位、根因、恢复 | Incident Case ID、故障域 | Schema与首批5个规划 |

复用现有 Tools、Learning、Topic Hub、SEO 和公共UI。稳定ID+版本+关系引用，不复制公式或文章正文。Topic Hub应聚合相关工具、课程、案例、图例、指南、测试、故障和可公开GitHub资源，并在新增内容后自动更新。

## 3. 信息架构与路由

推荐导航：`Tools | Topics | Learning | Engineering Cases | Topology Designer | Resources`；Resources内包含 Diagrams、Equipment Guides、Test Plans、Troubleshooting。移动端采用分组折叠导航。

建议路由（必须先核对现有路由，冲突则提出迁移方案，不能直接改线上URL）：

```text
/topology-designer/
/topology-designer/templates/
/topology-designer/editor/
/topology-designer/analysis/
/topology-designer/report/
/engineering-cases/
/engineering-cases/[slug]/
/network-diagrams/
/network-diagrams/[slug]/
/equipment-guides/
/equipment-guides/[slug]/
/network-test-plans/
/network-test-plans/[slug]/
/troubleshooting-cases/
/troubleshooting-cases/[slug]/
```

页面：平台首页（产品价值与模板入口）、编辑器（左设备库/中画布/右属性/底验证）、模板库（场景分类）、分析页（计算与风险）、报告页（假设与可复核结果）、五类内容索引与详情页。首版移动端优先浏览/只读与轻量编辑，不承诺复杂全功能绘图。

## 4. 技术架构与依赖评估

### 4.1 待验证候选
- `@xyflow/react`（React Flow）：交互画布、节点/边与视图层；**不能**作为永久工程数据格式。
- `elkjs`（ELK.js）：自动布局，仅在适用规模及预算内启用；布局结果不改变工程连接语义。
- `zustand`：编辑器临时状态、撤销重做、选择状态；工程文档持久化独立。
- Next.js + TypeScript：保持现有版本与Client Component边界。

Gate 0须通过项目实际 `package.json`/lockfile核实版本、React/Next兼容、许可证与传递依赖、包大小、SSR风险、维护状况、安全告警。不能把未经检查的许可证或兼容性写为PASS。允许隔离技术PoC，不污染生产依赖；记录替代方案及移除步骤。

### 4.2 分层
1. Presentation：Editor、Canvas Adapter、表单、模板和报告。
2. Domain：TopologyDocument、NetworkModel、ScenarioModel、EngineeringResult。
3. Validation：Schema校验、引用完整性、端口与聚合规则。
4. Engine Adapter：对接既有计算器及Formula/Rule/Source Registry。
5. Persistence：本地JSON导入导出、版本迁移、Reopen→Verify。
6. Content Registry：Case、Diagram、Guide、Test、Incident、Topic关系。

所有工程逻辑必须与React Flow/Next.js解耦，可在无浏览器的单元测试中执行。

## 5. 核心数据契约（设计目标）

### 5.1 TopologyDocument
`documentId, schemaVersion, title, metadata, networkModelRef|networkModel, scenarioRefs, layout, resourceRefs, createdAt, updatedAt`。持久化文件使用规范化JSON，禁止保存运行时React对象、函数、密钥、私有拓扑原始数据至遥测。

### 5.2 NetworkModel
- `devices[]`：`id, type, role, label, capabilities, failureDomainIds, ports[]`；
- `ports[]`：`id, deviceId, medium, nominalSpeedBps, adminState, attributes`；
- `links[]`：`id, endpointA:{deviceId,portId}, endpointB:{deviceId,portId}, medium, capacityBps, state, aggregationGroupId?, failureDomainIds[]`；
- `aggregationGroups[]`：`id, memberLinkIds, protocol, supportedTopology, trafficAssumptions`；
- `failureDomains[]`：`id, kind, memberRefs, dependencies`；
- `logicalServices[]`（可选扩展）：业务路径/流量需求，不与物理链路混淆。

速度内部统一以bps表达；显示单位仅为UI。链路端点必须引用存在的设备与端口；重复ID、悬空引用、非法容量、同端口冲突、错误聚合关系按明确规则拒绝。

### 5.3 ScenarioModel
`scenarioId, networkModelVersion, kind:NORMAL|LINK_FAILURE|DEVICE_FAILURE|N_MINUS_ONE, disabledResourceIds, demandAssumptions, protocolAssumptions, expectedProtection, limitations`。N-1需定义故障对象和业务连续性判据，不假设双上联自动无损切换。

### 5.4 EngineeringResult
`resultId, engineId, engineVersion, ruleIds, sourceIds, topologyHash, scenarioHash, inputSnapshot, output, units, assumptions, warnings, unsupportedFeatures, verificationStatus, computedAt`。禁止输出缺乏规则依据的“安全/可靠”绝对结论。

### 5.5 版本与迁移
明确`schemaVersion`及受支持迁移链；旧版迁移须纯函数、确定性、可测试；不支持的未来版本拒绝并给出用户可读原因。规范化序列化与hash用于Reopen→Verify，允许排除非工程性的UI布局字段，但规则须文档化。

## 6. 10类设备图形与5套模板

### 6.1 设备类别
N01 Router/PE/BNG；N02 Ethernet Switch；N03 OLT；N04 ONU/ONT；N05 Optical Splitter；N06 OTN/DWDM Node；N07 Firewall；N08 Server；N09 ODF；N10 Cloud/WAN。每类定义SVG图标、端口类型、角色、属性、校验规则、可访问文本。厂商特性通过版本化capability profiles扩展，不假设通用支持。

### 6.2 模板
- TMP-001：四台48口接入交换机、双汇聚、双10G/25G；可分析超售比、上联名义容量、定义明确的N-1。
- TMP-002：OLT双上联+ODN+ONU；上联容量与光预算分离，PON侧保护不等于上联保护。
- TMP-003：BNG/PE双归属；首期仅拓扑/故障域结构分析，不模拟协议收敛。
- TMP-004：OTN/DWDM环网；首期仅连接/保护关系描述，不宣称波道级或保护倒换仿真。
- TMP-005：Leaf–Spine；按链路与业务假设计算容量及超售比。

每个模板含 `templateId, schemaVersion, sourceType, nodes, links, assumptions, supportedAnalyses, unsupportedAnalyses, relatedCaseIds, reviewStatus`。

## 7. 工程引擎集成

### 7.1 Phase 1/2接口规划（Phase 0只设计）
```ts
interface EngineeringEngine<I, O> {
  id: string;
  version: string;
  validate(input: unknown): ValidationResult<I>;
  calculate(input: I): EngineeringResult<O>;
}

interface TopologyAnalysisRequest {
  network: NetworkModel;
  scenario: ScenarioModel;
  demand?: TrafficDemandModel;
}
```

目标分析：`uplinkCapacity`、`oversubscription`、`nMinusOne`、`singlePointOfFailureScreening`。须记录输入、规则ID、来源ID、单位与版本。优先复用已有引擎；若现有引擎不支持所需模型，标记GAP，不擅自重写。

### 7.2 工程规则
- 端口线速不等于实测吞吐；链路聚合总速率不等于单流可用带宽。
- 双归属不等于自动实现保护；协议、哈希、故障域和设备能力需显式假设。
- 超售比须说明分子（接入名义容量或预估需求）及分母（有效上联容量）。
- N-1仅在定义故障集合、剩余连通性、负载与恢复假设后计算；不等同于完整协议仿真。
- 单点风险筛查为静态拓扑风险提示，不替代真实运维验证。
- 光预算、OTN波长、PON保护等高级分析未经独立验证不得输出模拟结论。

## 8. 工程案例与内容资产

### 8.1 120个长期案例分布
运营商70：PON/FTTH 20、IP城域网15、OTN/DWDM15、骨干与云网10、机房动力10。其他50：企业园区15、数据中心15、网络安全10、性能与故障诊断10。仅作为路线图容量，逐个审查需求与去重。

### 8.2 两个首发样板
**CASE-E001**：192-Port Access Network with Dual 10G/25G Uplinks。4×48×1G=192Gbps名义接入，双10G超售比9.6:1、双25G为3.84:1；单上联故障名义剩余10G/25G，须明确实际转发/聚合条件。提供逻辑、物理、故障三类拓扑、计算、设备教程、iPerf3与N-1测试、验收模板。

**CASE-T001**：OLT Dual Uplink Design and N-1 Failure Validation。覆盖双汇聚、OLT、ODN、ONU、上联容量、PON光预算、上联故障测试；区分OLT上联冗余和PON Type B/C保护。不得展示未经授权的生产网拓扑。

### 8.3 设备指南首批10篇
Cisco Interface Diagnostics、Cisco EtherChannel/LACP、Huawei Eth-Trunk、H3C Link Aggregation、OLT Optical Power Inspection、iPerf3、Wireshark、Nmap授权扫描、OTDR/光功率计、SNMP/Telemetry。厂商CLI须注明平台/版本，禁止杜撰命令。

### 8.4 测试方案首批10套
上联带宽、N-1切换、LACP、堆叠、VLAN隔离、GPON光功率、OTDR、iPerf3 TCP/UDP、PoE容量、WAN切换。均包含目的、环境、拓扑、前提、步骤、预期、实测记录、验收判定、回退及安全限制。

### 8.5 故障案例首批5个
PON口大面积中断、FTTH末梢光衰、OLT上联故障、OTN环网断纤、机房整流模块故障。记录影响、告警证据、故障树、根因、恢复、预防、复测；现场数据与重构示例严格区分。

### 8.6 内容契约
所有内容有稳定ID、Slug、Version、Status、Audience、Difficulty、SourceType、ReviewStatus、RelatedTools/Topics/Cases/Diagrams/Guides/Tests/Incidents。内容更新触发Topic Hub聚合，避免手工重复维护。

## 9. 数据安全与运营商案例发布

三种来源：`REFERENCE_DESIGN`（公开规范）、`RECONSTRUCTED_CASE`（脱敏重构的教学场景）、`VERIFIED_FIELD_CASE`（取得明确授权的现场案例）。对现场拓扑实行来源、授权范围、脱敏、安全复核、发布审批记录。不得公开真实管理IP、设备命名、端口映射、敏感机房位置、客户信息、真实业务路径及可重构生产网络的组合信息。未授权时仅能创作抽象参考设计，不能简单替换IP后公开原拓扑。上传的拓扑默认仅在本地处理，未经明确同意不上传服务器。

## 10. JSON导入导出与Reopen→Verify

- 严格Schema、文件大小、节点/边数量、字符串长度、嵌套深度、数值范围与引用完整性限制；
- 拒绝未知危险字段、原型污染键、恶意SVG/HTML、脚本URL、外部资源自动加载；
- 导入先解析→校验→迁移→规范化→关系验证→预览→确认，不在导入阶段执行外部命令；
- 导出含schemaVersion、engineVersion、rule/source refs、hash与生成时间；
- Reopen→Verify：重载→重新校验→相同规则版本重算→比较确定性结果/容差→报告PASS/DIFF/UNSUPPORTED；
- Golden Fixtures覆盖有效、边界、损坏、恶意、旧版、未来版本及SI/US等价（若适用）。

## 11. UI/UX与可访问性

编辑器：左侧设备库、中央画布、右侧属性、顶部保存/导入/导出/分析、底部验证与结果；模板库按运营商/企业/数据中心及难度分类；分析页分开显示理论结果、风险、假设与不支持项；报告页支持可追溯工程摘要。键盘添加/选择/删除、焦点顺序、文本版设备连接清单、错误定位、非颜色唯一提示。移动端优先只读浏览与参数查看；完整复杂编辑以桌面端为主要目标。

## 12. 性能预算与验证方法（Phase 0建议值，待PoC校准）

| 指标 | 初始建议门槛 | 测量方式 |
|---|---|---|
| 模板首屏 | P75 LCP ≤2.5s（目标环境） | Lighthouse/Playwright记录设备网络条件 |
| 100节点/150链路 | 拖动交互P95 ≤100ms响应 | 指定桌面浏览器性能脚本 |
| 自动布局 | 100节点/150链路 ≤3s | 固定fixture计时 |
| JSON导入 | ≤2MB，≤500节点，≤1000链路 | 边界与拒绝测试 |
| 工程计算 | 100节点/150链路 P95 ≤500ms（静态分析） | 固定fixture重复运行 |
| 移动端 | 375px无关键内容溢出 | Playwright Mobile Chrome/Safari |

以上是**待验证预算，不是已达成性能**；PoC报告需说明测试设备、浏览器、样本、结果与调整建议。性能不满足时优先限制规模/惰性加载，不牺牲计算正确性。

## 13. 测试计划

1. Contract：Schema、ID唯一性、引用、端口/介质/速率、聚合关系、故障域。
2. Engine：独立Golden Fixtures、单位、极值、非法输入、N-1与正常场景对照、确定性。
3. Import/Export：Round-trip、迁移、hash、Reopen→Verify、损坏/恶意文件。
4. UI：编辑/撤销重做/选择/属性修改/键盘/a11y/多端布局。
5. Security：XSS、SVG注入、原型污染、外部资源、文件膨胀、隐私遥测白名单。
6. Performance：固定拓扑规模、内存、布局、交互响应与计算时间。
7. Regression：现有Tools、Topic Hub、Learning、SEO及冻结引擎不退化。
8. Content：工程审核、来源版本、厂商命令、脱敏授权、链接完整性、薄内容检查。

测试结果必须标注PASS/FAIL/BLOCKED/NOT CONFIGURED；不得将未执行项目写为PASS。

## 14. 分阶段Roadmap与Gate

| 阶段 | 主要交付 | 准入/退出 |
|---|---|---|
| Phase 0 / Gate 0 | 产品/技术/数据契约/样板/PoC/审计 | 2号产品→3号技术→4号总工冻结，P0=0 |
| Phase 1 / Gate 1 | 纯前端编辑器骨架、10类设备、JSON | Contract/安全/基础交互PASS |
| Phase 2 / Gate 2 | 5模板、上联/超售/N-1/SPOF接口 | 独立工程Golden Fixtures PASS |
| Phase 3 / Gate 3 | CASE-E001、CASE-T001与资源关联 | 工程内容、拓扑与计算复核PASS |
| Phase 4 / Gate 4 | 图例/教程/测试/故障案例首批资源、报告 | 下载、关联、Reopen→Verify PASS |
| Phase 5 / Gate 5 | SEO、性能、移动端、可访问性、上线 | 生产安全、隐私、回归和发布审核PASS |

### Gate 0必须交付的主文档
- `PRODUCT_SPEC_V1.0.md`
- `TECH_ARCHITECTURE_V1.0.md`
- `TOPOLOGY_DATA_CONTRACT_V1.0.md`
- `ENGINE_INTEGRATION_SPEC_V1.0.md`
- `UI_UX_SPEC_V1.0.md`
- `TEST_PLAN_V1.0.md`
- `RELEASE_GATES.md`
- `ROADMAP.md`（子目录规划；项目根ROADMAP只做增量更新）

### Gate 0扩展文档
`CONTENT_ARCHITECTURE_V1.0.md`、`NETWORK_DIAGRAM_SPEC_V1.0.md`、`ENGINEERING_CASE_SPEC_V1.0.md`、`EQUIPMENT_GUIDE_SPEC_V1.0.md`、`NETWORK_TEST_PLAN_SPEC_V1.0.md`、`TROUBLESHOOTING_CASE_SPEC_V1.0.md`、`CASE_120_MASTER_ROADMAP.md`、`SECURITY_PUBLICATION_POLICY_V1.0.md`、`PHASE0_FEASIBILITY_REPORT.md`。

## 15. 审计角色及冻结要求

**2号产品审计**：用户、差异化、MVP边界、五类内容与编辑器协同、SEO、商业化、120案例去重、过度设计。  
**3号技术交叉审计**：版本与许可证、数据契约、引擎复用、计算边界、JSON安全、隐私、性能、无障碍、测试可重复、运营商敏感拓扑。  
**4号总工冻结**：范围、数据模型、规则版本、10类设备、5模板、2样板、预算、Gate准入与阻断项。  

未通过审计前状态为`DRAFT`，不得自称FROZEN或PASS。所有P0必须关闭；P1需逐项记录处置与明确是否阻断。

## 16. Phase 0实施顺序与交付报告

1. `git status --short`、`git diff --stat`，检查项目摘要及直接相关目录。
2. 定点识别现有引擎、Registry、导出契约与Next/React版本；不做全仓扫描。
3. 隔离验证候选依赖的兼容性、许可证、包体积、SSR与100节点布局；不污染主线。
4. 完成主文档、扩展文档、案例与模板规格。
5. 输出风险矩阵（严重度、概率、证据、缓解、负责人）、阻断项、依赖影响、工作量区间和Phase 1建议。
6. 交2号、3号审计；修订后由4号冻结。停止，不自动进入Phase 1。

### 初始工作量估算（仅规划，须依据实际代码与PoC修正）
- Phase 0文档、技术PoC与审计：约5–10人日；
- Phase 1编辑器与基础数据：约15–30人日；
- Phase 2引擎适配与5模板：约15–30人日；
- Phase 3两个高质量案例：约10–20人日；
- Phase 4内容关联/报告：约10–25人日；
- Phase 5质量与上线：约8–15人日。

这些不是承诺工期，受现有引擎成熟度、图形库适配、内容审计与人员配置影响。

## 17. Codex直接执行指令

> 【NetEngineerLab / Engineering Platform V1.3】，节约模式，执行Phase 0 / Gate 0。首先定点检查AI_PROJECT_CONTEXT.md、ROADMAP.md、Git Diff、相关引擎与Registry。根据本规范完成8份主文档、9份扩展文档、React Flow/ELK.js/Zustand版本与许可证PoC、10类设备及5模板模型、120案例路线图、CASE-E001和CASE-T001规格、风险矩阵、依赖影响与工时评估。所有结论必须标注已验证/待验证，禁止伪造测试结果。只允许隔离技术原型，禁止开发完整平台或进入Phase 1。完成后输出Gate 0报告，提交2号产品审计、3号技术交叉审计、4号总工冻结；未冻结前停止。

---

**状态声明：** 本文件是基于讨论形成的完整开发规范草案，尚未读取本地项目代码、核验实际依赖版本、执行PoC或获得审计批准。
