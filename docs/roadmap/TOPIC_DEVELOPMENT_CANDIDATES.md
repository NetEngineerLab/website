<!-- 待办视图：38 项；完整原表保存在 TOPIC_DEVELOPMENT_BACKLOG.json。 -->
# 专题开发候选清单：40 个可跟踪工作包

更新时间：2026-10-11。状态：规划候选；清单独立审计 PASS（不代表专题开发或发布验收），见 [审计证据](evidence/TOPIC_DEVELOPMENT_CANDIDATES_AUDIT_2026-10-11.md)。

现有专题清单已经存在于 [专题总览](../NETENGINEERLAB_TOPIC_HUB_LIST.md)。本文件扩充开发容量，不替代内容注册表，也不表示批准发布 40 个独立专题 URL。实际采用少量父 Hub，加指南、案例、故障路径和治理工作包；子专题边界待审，重叠项允许合并，不以数量要求生成薄页。建议 slug 是规划标识，只有标注“Hub”的条目才可能建立专题入口；子项优先放进父 Hub 或现有内容体系，不自动产生路由。

依据：[V2.0 规范](../NETENGINEERLAB_TOPIC_HUB_V2.0_SPEC.md)、[工具注册表](../../src/registry/tool-registry.json)、[工作流注册表](../../src/registry/workflow-registry.json)、[内容注册表](../../website/data/content-registry.json)。基线：工具注册表有 40 个 active 工具；工作流有 12 项；内容注册表目前只有 8 项 tool、5 项 tutorial、3 项 case，工具存在不代表指南、案例、规范来源和专题归属已经齐备。下表 ID 为真实工具 ID；所有未注明现存的交付物均为待建设或待盘点，不承诺已有。

负责人：本清单编制由当前实现 Agent（topic_list；继承主任务配置，工具未返回可核实的模型 ID）负责；工程任务尚未分配开发人员，优先建议主力工程模型 GPT-6.1-sol 实施、轻量模型 GPT-6-luna 做批量资源核对。独立审计由未参与编制的 Agent topic_audit 完成并通过；不能把候选条目或建议模型视为已经实施。

输入是本文件列出的真实工具、现有 Hub 和注册关系；输出是每行交付物；依赖是每行工具与缺失资产。工作包共同验收 G：任务路径有实际资源支撑；资产归属与返回链接一致；公式、单位、假设和依据可追溯；适用路由、语言元数据、链接、移动/桌面和键盘检查均通过并保存证据。缺资源明确保留待建设状态，不能作为可用入口。未运行或失败的必要检查不得标记完成。文档类子项执行内容、计算样例及链接核验；未发布的内部规划不要求网站视觉验收。

优先级 P0 为先决治理或首批开发，P1 为随后实施，P2 为边界/价值审查后实施。每行是一个独立可验收工作包，检查对象与交付物明确；共享父 Hub 的条目不等于独立发布专题。

## 第一组：首批治理与成熟专题（01—05）

| ID | 专题名 / 建议 slug / 形态 | 优先级 | 现状与依赖 | 工程任务与交付物 | 验收标准 |
|---|---|---|---|---|---|
| TD-03 | 通信电源与能源规划升级 / telecom-power-energy / 现有 Hub | P0 | Foundation；telecom-rectifier-dc-power-sizing、48v-battery-runtime、generator-fuel-runtime-calculator、telecom-solar-battery-sizing-calculator | 增补任务分流、推荐顺序、异常路径和资源归属，交付 Hub 增量及现场案例 | 整流、电池、油机、光伏任务各有起点和校核；与 UPS Hub 边界清楚；G |
| TD-04 | 交换机超售比专题验收升级 / switch-oversubscription / 现有 Hub | P0 | 已有 Workflow 内容形态；switch-uplink-oversubscription-calculator；正式分级未验收 | 核对全部指南案例登记、N-1 路径和返回链接，交付修补与成熟度报告 | 48 口及故障案例可复算；Authority 只在证据达标后判定；G |
| TD-05 | 数据中心制冷专题验收升级 / data-center-cooling-capacity / 现有 Hub | P0 | 已有 Workflow 内容形态；data-center-cooling-load-calculator；需核对故障路径与语言互链 | 校核 N+1、冷吨、热负荷指南和资产清单，交付修补与验收报告 | 正常/单机故障样例可复算；首页范围与制冷主题一致；G |

## 第二组：光网络工程子任务（06—10）

| ID | 专题名 / 建议 slug / 形态 | 优先级 | 现状与依赖 | 工程任务与交付物 | 验收标准 |
|---|---|---|---|---|---|
| TD-06 | 光链路预算与距离 / optical-link-budget-reach / TD-02 子路径 | P1 | optical-power-budget、fiber-loss、pon-distance；设计工作流现存，专题化案例待补 | 制作损耗→余量→最大距离的设计指南和两组预算案例 | 明确发射/接收限值、工程余量与距离假设；两例可复算；G |
| TD-07 | 分光级联设计 / pon-split-planning / TD-02 子指南 | P1 | pon-splitter-loss、optical-power-budget；设备等级资料需盘点 | 编制一级/二级分光对比案例与选择表 | 同用户规模比较损耗和余量；厂商参数标注出处；G |
| TD-08 | ONU 收光与 OTDR 故障隔离 / optical-fault-isolation / TD-02 子路径 | P1 | onu-rx-power、otdr-event、fiber-loss；optical-troubleshooting 已注册 | 编制从异常收光到事件定位的决策树、故障案例与复测记录模板 | 至少覆盖高损耗、连接异常及无法单凭工具定因的分支；G |
| TD-09 | ODF/ODN 资源与扩容 / odf-odn-resource-planning / TD-02 子指南 | P1 | odf-odn-resource-planner、pon-splitter-loss；现场台账案例待补 | 编制资源盘点、端口预留和扩容案例及台账模板 | 纤芯/端口数量守恒；预留与实际可用资源分列；G |
| TD-10 | 光模块与链路兼容性 / optical-module-compatibility / TD-02 关联指南 | P2 | sfp-qsfp-compatibility-calculator、optical-power-budget；厂商兼容矩阵待核实 | 编制速率、波长、接口、距离、厂商限制的核对清单与误配案例 | 不把理论参数匹配等同厂商认证；案例包含明确拒绝条件；G |

## 第三组：电源与保障子任务（11—15）

| ID | 专题名 / 建议 slug / 形态 | 优先级 | 现状与依赖 | 工程任务与交付物 | 验收标准 |
|---|---|---|---|---|---|
| TD-11 | 整流模块容量、均流与 N+1 / rectifier-capacity-redundancy / TD-03 子指南 | P1 | telecom-rectifier-dc-power-sizing、dc-plant-efficiency-load-sharing；设备降额资料待补 | 编制正常/模块退出容量及均流效率案例和配置检查表 | 负载、充电需求、降额及 N+1 假设明确；故障后容量、模块均流与效率可复算；G |
| TD-12 | -48V 电池后备时间 / telecom-battery-runtime / TD-03 子指南 | P1 | 48v-battery-runtime；电池曲线与温度/老化数据待盘点 | 编制不同后备目标的案例和现场容量复核表 | 区分估算与实测放电能力，单位与老化假设可追溯；G |
| TD-13 | 油机应急续航与补给 / generator-runtime-refueling / TD-03 子路径 | P1 | generator-fuel-runtime-calculator；现场补给与负载资料待补 | 编制耗油、可用油量、续航和补给时间轴案例 | 不将总油箱容积当可用油量；时间轴校核供电缺口；G |
| TD-14 | 通信光伏与储能 / telecom-solar-storage / TD-03 子指南 | P2 | telecom-solar-battery-sizing-calculator、48v-battery-runtime；地区辐照及自治天数来源待补 | 编制低日照条件容量案例与输入资料清单 | 辐照来源、损耗、自治天数明确；恶劣条件复算；G |
| TD-15 | AC/DC 配电与保护边界 / telecom-power-distribution / TD-03 子指南 | P1 | telecom-ac-dc-breaker-sizing；保护配合与本地规范资产待核实 | 编制容量计算流程、保护配置复核表和适用边界指南 | 不由计算器单独批准施工；短路/保护配合缺数据时明确终止判断；G |

## 第四组：数据中心供电与环境（16—20）

| ID | 专题名 / 建议 slug / 形态 | 优先级 | 现状与依赖 | 工程任务与交付物 | 验收标准 |
|---|---|---|---|---|---|
| TD-16 | 数据中心电源与 UPS / data-center-power-ups / Hub | P1 | ups-capacity-battery-runtime-calculator、generator-ups-transfer-ride-through-planner；Hub 未建设 | 建设选型→后备→切换→故障能力的英中 Hub 和主案例 | 与 TD-03 直流通信电源划分边界；kW/kVA/PF 及后备假设明确；G |
| TD-17 | 油机 UPS 切换穿越 / generator-ups-transfer / TD-16 子案例 | P1 | generator-ups-transfer-ride-through-planner；实际切换/启动曲线需提供 | 编制启动失败、切换延迟场景和保障时间轴 | 故障时间轴与可用后备时间一致；工具无法验证的现场动作标明；G |
| TD-18 | 气流组织与冷热通道 / data-center-airflow-containment / TD-05 子指南 | P1 | data-center-airflow-containment-planner、data-center-cooling-load-calculator | 编制热量与风量联算案例、现场测量表和通道改造指南 | 不以额定制冷量替代气流验证；热点与旁路风路径明确；G |
| TD-19 | PUE 与能源基线 / data-center-energy-baseline / TD-16 关联指南 | P2 | pue-data-center-energy-efficiency；分项计量与统计周期资料待补 | 编制同周期能耗案例和能源指标台账 | 明确计量边界、周期及缺数处理；不把 PUE 视为可靠性指标；G |
| TD-20 | 机柜功耗与容量校核 / network-rack-capacity / TD-05/16 共用案例 | P1 | network-rack-power-cooling-calculator、ups-capacity-battery-runtime-calculator | 编制机柜设备清单→功耗→供电→制冷约束案例 | 每项功率来源可查；同时校核电力与热约束，不新增重复 capacity stub；G |

## 第五组：接入与传输容量（21—25）

| ID | 专题名 / 建议 slug / 形态 | 优先级 | 现状与依赖 | 工程任务与交付物 | 验收标准 |
|---|---|---|---|---|---|
| TD-21 | OLT 与接入容量规划 / olt-access-capacity / Hub | P1 | olt-dual-uplink-transport-mse-planner、network-capacity-forecast-planner；Hub 待建 | 建设用户增长→上联→波道/MSE→扩容路径及方案案例 | 双上联正常/故障容量分别校核；与 PON 物理预算边界清楚；G |
| TD-22 | 传输环网与链路韧性 / transport-ring-resilience / Hub | P1 | transmission-ring-optimization-risk-analyzer；拓扑与保护参数样例待补 | 编制环网 Hub、断链案例和风险检查表 | 正常、断链及保护失败场景有剩余容量证据；G |
| TD-23 | 上联扩容与业务峰值 / access-uplink-growth / TD-21 子指南 | P1 | olt-dual-uplink-transport-mse-planner、bandwidth-calculator | 编制峰值并发假设、链路容量与扩容触发案例 | 不将标称用户带宽简单累加为峰值；并发假设可替换并复算；G |
| TD-24 | 容量增长预测 / network-capacity-forecast / TD-21/04 共用指南 | P2 | network-capacity-forecast-planner；真实时序和预测误差资料待补 | 编制趋势、阈值、建设提前量样例与数据模板 | 缺失/异常样本处理明确；预测结果标注范围和不确定性；G |
| TD-25 | 数据中心 Fabric 容量 / data-center-fabric-capacity / 候选 Hub | P2 | data-center-network-convergence-fabric-capacity-planner、switch-uplink-oversubscription-calculator | 先审与 TD-04 边界，交付叶脊容量/故障案例与 Hub 或合并决策 | Fabric 任务有独立输入输出才拆 Hub；链路退出后的收敛比复算；G |

## 第六组：企业 IP 与变更（26—30）

| ID | 专题名 / 建议 slug / 形态 | 优先级 | 现状与依赖 | 工程任务与交付物 | 验收标准 |
|---|---|---|---|---|---|
| TD-26 | IP 与子网规划 / ip-subnet-planning / Hub | P1 | subnet-calculator、vlan-ip-capacity-planner、ipv6-nat-planner；enterprise-lan-ip-planning 已注册 | 建设地址需求→划分→预留→冲突校核 Hub 与企业案例 | 地址重叠、边界、主机容量与增长余量可检查；G |
| TD-27 | VLAN 地址容量与隔离 / vlan-ip-segmentation / TD-26 子指南 | P1 | vlan-ip-capacity-planner、acl-generator-validator | 编制 VLAN/子网分配表与跨区访问矩阵案例 | 地址充足与访问隔离分别验收；明确 ACL 不能由 VLAN 编号推导；G |
| TD-28 | IPv6 与 NAT 迁移 / ipv6-nat-migration / TD-26 子路径 | P2 | ipv6-nat-planner、subnet-calculator；设备支持矩阵待补 | 编制双栈迁移方案、测试表及回退条件 | 地址方案、应用可达性、设备约束与回退前提明确；G |
| TD-29 | MTU/MSS 与封装排障 / mtu-mss-troubleshooting / TD-26 关联指南 | P1 | mtu-calculator；抓包与路径验证案例待补 | 编制隧道开销样例及大包异常定位流程 | 逐层开销与实际路径 MTU 区分；覆盖 ICMP 受限及复测步骤；G |
| TD-30 | OSPF Cost 与路由变更 / ospf-path-planning / 网络变更子指南 | P2 | ospf-cost-calculator、network-change-planner-mop-generator；拓扑/厂商默认值资料待补 | 编制链路 Cost 表、路径比较与变更校核案例 | 参考带宽、接口带宽、手工覆盖明确；故障后路径有验证证据；G |

## 第七组：无线与 PoE 部署（31—35）

| ID | 专题名 / 建议 slug / 形态 | 优先级 | 现状与依赖 | 工程任务与交付物 | 验收标准 |
|---|---|---|---|---|---|
| TD-31 | Wi-Fi 覆盖与容量规划 / wifi-coverage-capacity / Hub | P1 | wifi-coverage-capacity-planner、wireless-link-budget-calculator；wireless-access-deployment 已注册 | 建设覆盖→容量→信道→勘测复核 Hub 与部署案例 | 覆盖与容量分别验算；干扰/漫游边界与勘测要求明确；G |
| TD-32 | 无线链路预算与现场验证 / wireless-link-budget-validation / TD-31 子指南 | P2 | wireless-link-budget-calculator；天线、监管限制和现场损耗依据待补 | 编制预算表、障碍假设与实测对照案例 | 理论预算不等同覆盖保证；限值来源及测量条件明确；G |
| TD-33 | PoE 供电与布线规划 / poe-power-cabling / 候选 Hub | P1 | poe-power-budget-calculator、poe-voltage-drop-calculator；poe-rack-power-design 已注册 | 建设设备需求→交换机预算→压降→验收案例；先与 TD-31/20 审边界 | 独立工程任务不足则合入父 Hub；总功率与末端电压同时校核；G |
| TD-34 | PoE 端口与整机功率 / poe-port-power-budget / TD-33 子指南 | P1 | poe-power-budget-calculator；设备档位与整机供电规格待补 | 编制混合终端的功率分配和启动峰值检查表 | 端口限值、整机预算、预留与同时启动假设分列；G |
| TD-35 | PoE 压降与远端故障 / poe-voltage-drop-diagnosis / TD-33 子路径 | P1 | poe-voltage-drop-calculator；线材/温度/连接器测量资料待补 | 编制长线供电失败案例和现场复测流程 | 长度、线径、负载与温度输入明确；区分预算不足与压降原因；G |

## 第八组：可靠性、变更与交付（36—40）

| ID | 专题名 / 建议 slug / 形态 | 优先级 | 现状与依赖 | 工程任务与交付物 | 验收标准 |
|---|---|---|---|---|---|
| TD-36 | 网络可用性与可靠性 / network-availability-reliability / 候选 Hub | P2 | network-risk-hidden-hazard-assessment-generator；专用可用性/MTBF/MTTR 工具及故障数据未发现 | 先定义故障域和指标，交付模型说明、串并联案例与拆分/合并决策 | 独立故障假设、相关失效和指标边界明确；缺工具不伪造入口；G |
| TD-37 | 网络隐患评估与整改 / network-risk-remediation / 候选 Hub | P1 | network-risk-hidden-hazard-assessment-generator；同名工作流已注册 | 编制风险发现→分级→整改→复验路径与报告案例 | 风险等级有依据；每项整改有责任、验证条件和关闭证据；G |
| TD-38 | 网络变更与 ACL 验证 / network-change-validation / 候选 Hub | P1 | network-change-planner-mop-generator、acl-generator-validator；network-change-automation 已注册 | 编制访问矩阵→规则验证→MOP→回退流程及失败案例 | 覆盖允许/拒绝样例、顺序冲突、回退触发和复验；厂商语法边界明确；G |
| TD-39 | DNS TTL 与变更窗口 / dns-ttl-change-window / TD-38 子指南 | P2 | dns-ttl-propagation-calculator；解析器缓存与实测样例待补 | 编制预降 TTL、切换、观测和回退时间轴案例 | 区分权威记录 TTL 与实际缓存行为；不承诺全球同步刷新；G |
| TD-40 | 工程报告与批量交付 / engineering-report-delivery / 横向工作流 | P1 | engineering-report-batch-export-center；engineering-deliverable-assembly 已注册 | 关联首批专题结果，交付报告模板、输入快照与批量导出校核清单 | 报告保留输入、单位、方法、限制和复核日期；批量文件与原结果一致；G |

## 推荐前五项与依赖顺序

1. TD-01：交付规范 URL 决策表，解除重复 stub 与迁移不确定性。
2. TD-02：在规范路径确认后建设 PON 设计/排障双路径，利用现有丰富工具与工作流。
3. TD-03：把通信电源 Foundation 补到可验收的工作流形态。
4. TD-04：为现有交换机专题补登记及证据，避免未经验证直接升级 Authority。
5. TD-05：为现有制冷专题完成故障、语言和范围核对。

TD-02 依赖 TD-01 对 PON slug 的决策，TD-04/05 的路由处理依赖 TD-01 对旧 stub 的决策。各组子项依赖父 Hub 的边界与资产清单；可以先写内部案例，不抢先发布子 Hub。TD-40 优先接首批已验收成果。后续实施应更新本清单负责人、状态和证据位置；当前 40 项均未因本清单而变成已完成工程。

清单验收只检查：TD-01—TD-40 连续、无重复工作包 ID；每项具备名称/slug、优先级、真实依赖或缺口、交付物和验收标准；旧 stub 不作为新增独立专题计数；工程实施与独立审计分离。正式审计结论在独立记录中保存，本文件不自行宣告通过。


