# NetEngineerLab Learning Center — 课程地图与实施规范 V1.2

状态：候选冻结，等待总工审查
范围：课程总目录、Phase A 首批课程、Course 001 样板及后续教程开发门禁

> 本文保留用户提供的 77 门课程规划，并将下一步教程建设限定为 Learning System 基础架构与 Course 001。暂不扩展账号、付费、社区或 AI 导师。

可以。按刚刚冻结候选的 **NetEngineerLab Learning System V1.2** 思路，我建议不要只做 10 来门课，而是先规划成一套完整的 **网络工程学习课程地图**。课程可以很多，但开发必须分阶段，先做最能和现有工具、专题、SEO形成闭环的课程。

# NetEngineerLab Learning Center — 全部课程规划 V1.0

| ID | 课程 | 主要内容 | 级别 | 优先级 |
|---|---|---|---|---|
| **光网络 / PON** |||||
| C001 | **PON Optical Engineering** | GPON/ODN、光预算、ONU RX、设计、排障、优化 | 基础→高级 | **P0** |
| C002 | Fiber Optics Fundamentals | 光纤原理、波长、衰耗、dB/dBm、连接器、熔接 | 入门 | P0 |
| C003 | Optical Power & Link Budget | TX/RX、损耗、Margin、链路预算 | 实操 | P0 |
| C004 | PON Splitter Design | 1:2～1:128、多级分光、损耗与设计权衡 | 工程 | P0 |
| C005 | ONU RX Power Troubleshooting | 弱光、过强光、异常波动、故障定位 | 运维 | P0 |
| C006 | OTDR Engineering | OTDR原理、事件、反射、衰耗、故障距离判断 | 运维/高级 | P1 |
| C007 | ODN Design & Optimization | ODN拓扑、光交、分纤、覆盖、优化 | 工程 | P1 |
| C008 | GPON / XGS-PON Engineering | GPON与XGS-PON设计、演进、兼容、容量 | 高级 | P1 |
| **交换与园区网络** |||||
| C009 | **Ethernet Switching Fundamentals** | MAC、VLAN、Trunk、STP、二层转发 | 入门 | **P0** |
| C010 | Switch Capacity Planning | 端口容量、上联容量、吞吐、流量模型 | 工程 | P0 |
| C011 | Switch Oversubscription Engineering | 超售比、48口交换机、上联设计 | 工程 | **P0** |
| C012 | N-1 Switch Capacity Design | 上联故障、N-1容量、冗余设计 | 高级 | P0 |
| C013 | VLAN & Trunk Engineering | VLAN规划、Trunk、QinQ、典型案例 | 实操 | P1 |
| C014 | STP / RSTP / MSTP Engineering | 环路、根桥、收敛、故障排查 | 运维 | P1 |
| C015 | LACP & Link Aggregation | Eth-Trunk/LAG、负载分担、成员故障 | 工程 | P1 |
| **IP网络** |||||
| C016 | **IPv4 Subnetting Engineering** | CIDR、子网、地址规划、VLSM | 基础→实操 | **P0** |
| C017 | IPv6 Fundamentals & Planning | IPv6地址、前缀、地址规划 | 基础 | P1 |
| C018 | IP Address Planning Workshop | 企业/园区/运营商地址规划完整案例 | Workshop | P1 |
| C019 | Routing Fundamentals | 静态路由、最长匹配、ECMP、默认路由 | 入门 | P1 |
| C020 | OSPF Engineering | Area、Cost、邻居、路由设计、故障定位 | 工程 | P1 |
| C021 | BGP Engineering Fundamentals | ASN、邻居、路由策略、Path Selection | 工程 | P2 |
| C022 | Routing Troubleshooting | 路由缺失、环路、黑洞、非对称路由 | 运维 | P2 |
| **OLT / 宽带接入** |||||
| C023 | OLT Fundamentals | OLT、PON口、上联、业务模型 | 入门 | P0 |
| C024 | OLT Capacity Planning | 用户数、PON口、并发、上联容量 | 工程 | P0 |
| C025 | OLT Uplink Design | 10G/25G/100G、超售、扩容 | 工程 | P1 |
| C026 | OLT Dual-Uplink & Resilience | 双上联、保护、N-1、故障场景 | 高级 | P1 |
| C027 | Broadband Access Capacity | 用户带宽、并发率、忙时流量、容量预测 | 工程 | P1 |
| **数据中心网络** |||||
| C028 | **Data Center Networking Fundamentals** | ToR、Leaf、Spine、东西向流量 | 基础 | **P0** |
| C029 | Leaf-Spine Design | Leaf/Spine数量、带宽、拓扑 | 工程 | P0 |
| C030 | Data Center Oversubscription | Server→Leaf→Spine超售设计 | 工程 | P0 |
| C031 | Spine Capacity Planning | Spine数量、端口、400G/100G设计 | 高级 | P1 |
| C032 | Rack Network Capacity | 机架服务器、端口密度、上联设计 | 实操 | P1 |
| C033 | Data Center N-1 Network Design | Leaf/Spine故障、容量与可靠性 | 高级 | P1 |
| **传输与承载网络** |||||
| C034 | Transmission Network Fundamentals | 环网、链路、保护、容量 | 基础 | P1 |
| C035 | Transmission Ring Capacity | 环网容量、业务分布、瓶颈链路 | 工程 | P1 |
| C036 | N-1 Transmission Ring Analysis | 单链路故障后的流量转移与过载 | 高级 | P1 |
| C037 | Transmission Ring Optimization | 环优化、扩容点、业务重路由 | 高级 | P2 |
| C038 | Link Capacity & Bandwidth Planning | 链路利用率、扩容阈值、容量预测 | 工程 | P1 |
| **网络可靠性 / SLA** |||||
| C039 | **Network Availability Fundamentals** | 99.9/99.99、停机时间、可用率 | 基础 | **P0** |
| C040 | SLA Engineering | SLA、可用率、故障时长、服务目标 | 工程 | P0 |
| C041 | MTBF & MTTR Engineering | MTBF、MTTR、可靠性计算 | 工程 | P1 |
| C042 | Redundancy & Availability Design | 单点、双路由、N+1、2N | 高级 | P1 |
| C043 | N-1 Reliability Workshop | N-1故障场景综合设计 | Workshop | P1 |
| C044 | Network Resilience Engineering | 容灾、故障域、恢复策略 | 高级 | P2 |
| **网络运维** |||||
| C045 | **Network Operations Fundamentals** | 巡检、告警、变更、故障、闭环 | 入门 | **P0** |
| C046 | Network Change Management | 变更设计、风险、窗口、回退 | 实操 | P0 |
| C047 | Network Incident Management | 故障发现、分级、定位、恢复 | 运维 | P0 |
| C048 | Root Cause Analysis | RCA、5 Why、故障树、证据链 | 运维 | P1 |
| C049 | Network Postmortem Engineering | 故障复盘、时间线、整改 | 实操 | P1 |
| C050 | Network Maintenance Planning | 维护窗口、影响评估、业务保护 | 工程 | P1 |
| **网络故障诊断** |||||
| C051 | Network Troubleshooting Methodology | 分层定位、排除法、证据驱动 | 基础→高级 | P0 |
| C052 | Layer 1 Troubleshooting | 光、电、端口、误码、链路 | 运维 | P0 |
| C053 | Layer 2 Troubleshooting | VLAN、MAC、环路、LACP | 运维 | P1 |
| C054 | Layer 3 Troubleshooting | IP、ARP、路由、MTU | 运维 | P1 |
| C055 | Packet Loss & Latency Analysis | 丢包、时延、抖动、路径 | 运维 | P1 |
| C056 | DNS / HTTP / TLS Troubleshooting | DNS、TLS、HTTP连通性 | 运维 | P1 |
| **数据中心电源与能源** |||||
| C057 | **Data Center Power Fundamentals** | kW、kVA、PF、IT负载 | 基础 | P0 |
| C058 | PUE Engineering | PUE计算、优化、能效分析 | 工程 | P0 |
| C059 | UPS Capacity Planning | UPS容量、负载率、冗余 | 工程 | P0 |
| C060 | UPS Battery Runtime | 电池容量、运行时间、老化 | 实操 | P0 |
| C061 | Rack Power Density | 单柜功率、配电、容量 | 工程 | P1 |
| C062 | Generator Capacity Planning | 油机容量、启动负载、冗余 | 工程 | P1 |
| C063 | Data Center Cooling Basics | 热负荷、制冷量、功率 | 基础 | P1 |
| C064 | Data Center Energy Optimization | PUE、冷却、负载、节能 | 高级 | P2 |
| **工程设计方法** |||||
| C065 | Engineering Calculation Fundamentals | 单位、精度、Margin、假设 | 入门 | P0 |
| C066 | Engineering Margin & Safety Factors | 设计余量、边界、风险 | 工程 | P1 |
| C067 | Capacity Planning Methodology | 当前容量、增长预测、扩容点 | 工程 | P1 |
| C068 | Engineering Trade-off Analysis | 成本、容量、可靠性、性能 | 高级 | P1 |
| C069 | Engineering Design Review | 如何审查网络设计方案 | 高级 | P2 |
| **大型综合 Workshop** |||||
| C070 | GPON Network Design Workshop | 完整设计一个GPON网络 | Workshop | P0 |
| C071 | 48-Port Switch Design Workshop | 完成48口交换机上联设计 | Workshop | P0 |
| C072 | Data Center Leaf-Spine Workshop | 完成一个Leaf-Spine网络设计 | Workshop | P1 |
| C073 | OLT Capacity Workshop | 完成OLT容量与双上联设计 | Workshop | P1 |
| C074 | Transmission Ring Workshop | 完成传输环容量与N-1设计 | Workshop | P2 |
| C075 | Network Availability Workshop | 完成高可用网络方案 | Workshop | P1 |
| C076 | Incident Troubleshooting Workshop | 从告警到RCA完整排障 | Workshop | P1 |
| C077 | Data Center Power Workshop | 完成UPS/PUE/机架负载方案 | Workshop | P1 |

## 总体规模

第一版课程总规划：

> **77 门 Course / Workshop**

但这里千万不要理解成“马上开发77门”。

我建议分成三个阶段：

**Phase A — 核心课程，约15门。**  
先围绕你已经有工具、已经有SEO表现的领域：

> PON、光功率、交换机超售、IP子网、OLT容量、数据中心网络、可用率、UPS/PUE、基础排障。

**Phase B — 专业深化，约30门。**  
增加 OSPF、BGP、OTDR、Leaf-Spine、传输环、可靠性、事故管理等。

**Phase C — 高级工程体系。**  
增加 Optimization、N-1、Architecture、Trade-off 和大型 Workshop。

最重要的是：

> **77门课不是77篇文章。**

一门真正的 Course 可以拥有：

```text
Course
├─ 3–6 Modules
├─ 8–20 Lessons
├─ Exercises
├─ Cases
├─ Deep Dives
├─ Troubleshooting Labs
└─ Final Workshop
```

因此长期真正的学习内容可能达到 **500～1000 个 Lesson / Lab / Case**，但用户看到的是一个结构清晰的工程课程体系，而不是500篇散乱SEO文章。

我建议现在 **4号总工不要冻结77门全部开发**，而是冻结：

> **课程总目录77门 + Phase A首批15门 + Course 001作为首个完整样板。**

然后所有后续课程都复制 Course 001 的课程工程标准。

## 下一步：增加教程的实施顺序

1. 先完成 Gate L0：建立 Course Registry、Lesson Schema、版本字段、标准来源字段、先修关系和课程状态。
2. 冻结 Course 001 — PON Optical Engineering 的模块、学习目标、练习、工具深链和 Final Workshop。
3. 先开发 Course 001 的最小可用样板：Fundamentals → Calculation → Engineering Design → Troubleshooting → Advanced → Final Workshop。
4. 为每个 Lesson 配置 Check、Exercise 或 Challenge，并加入错误反馈、完成状态和 LocalStorage 进度保存。
5. 将 Course 001 与 PON / 光网络 Topic Hub、光功率预算、PON 分光损耗、ONU RX Power、OTDR 工具互链，验证工具预填参数。
6. 通过 Gate L1～L6 后，再复制样板开发 Phase A 其余课程；不得先批量生成 77 门空壳课程。

## Phase A 首批课程范围

Phase A 约 15 门，优先选择已有工具、专题和搜索资产支撑的方向：

- C001 PON Optical Engineering
- C002 Fiber Optics Fundamentals
- C003 Optical Power & Link Budget
- C004 PON Splitter Design
- C005 ONU RX Power Troubleshooting
- C010 Switch Capacity Planning
- C011 Switch Oversubscription Engineering
- C016 IPv4 Subnetting Engineering
- C024 OLT Capacity Planning
- C028 Data Center Networking Fundamentals
- C039 Network Availability Fundamentals
- C051 Network Troubleshooting Methodology
- C057 Data Center Power Fundamentals
- C058 PUE Engineering
- C059 UPS Capacity Planning

## 冻结边界

- 77 门课程是长期课程地图，不是立即开发清单。
- Course 001 是首个完整课程样板，先验证系统模型和发布门禁。
- Phase A 课程只有在 Course 001 通过审查后才进入逐门设计。
- 每门课程必须能连接 Topic Hub、Learn 页面和工程工具；没有实际工具或内容证据的课程保持 Planned。
- 课程内容应以工程任务和可验证能力为中心，不把 SEO 文章直接当作课程。
