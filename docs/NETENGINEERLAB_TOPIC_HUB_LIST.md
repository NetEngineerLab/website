# NetEngineerLab 专题列表

更新时间：2026-10-11

开发候选入口：[40 个专题开发工作包](roadmap/TOPIC_DEVELOPMENT_CANDIDATES.md)。清单包含主专题建设、现有专题升级及专题内指南/案例任务；40 项不等于 40 个独立发布页面，具体边界与资产验收按清单执行。

本清单同时覆盖已上线专题、已有底座但尚未完成专题化的主题，以及计划建设的新专题。`Workflow`、`Foundation`、`Candidate`、`Planned` 表示规划状态，不替代专题正式验收。

| 专题 | 规范路径 | 当前状态 | 说明 | 下一步 |
|---|---|---|---|---|
| 交换机超售比与上联容量 | [`/topics/switch-oversubscription/`](../website/topics/switch-oversubscription/index.html) · [`/zh/topics/switch-oversubscription/`](../website/zh/topics/switch-oversubscription/index.html) | Workflow 内容形态 | 当前最成熟；含主指南、计算器、48 口案例、N-1、GitHub 资源和推荐顺序 | 运行统一验收，补齐资产登记后评估 Authority |
| 数据中心制冷负荷与精密空调容量 | [`/topics/data-center-cooling-capacity/`](../website/topics/data-center-cooling-capacity/index.html) · [`/zh/topics/data-center-cooling-capacity/`](../website/zh/topics/data-center-cooling-capacity/index.html) | Workflow 内容形态 | 含制冷计算器、主指南、N+1、冷吨、热负荷和 GitHub 资料 | 核对故障路径、语言互链和资源清单 |
| 通信电源与能源规划 | [`/topics/telecom-power-energy/`](../website/topics/telecom-power-energy/index.html) · [`/zh/topics/telecom-power-energy/`](../website/zh/topics/telecom-power-energy/index.html) | Foundation | 含整流器、电池、油机和太阳能工具及部分指南 | 补任务分流、推荐顺序、案例、故障路径和 GitHub 资源 |
| PON / 光网络 | [`/topics/pon-optical/`](../website/topics/pon-optical/index.html) | Candidate / 早期 stub | 现有页面为简略聚合页；PON、光功率预算、光纤损耗、ONU RX、OTDR 等资产尚未统一聚合 | 优先建设 `/topics/pon-optical-network/` 或确定规范 slug，并建立中英文工作流 Hub |
| 数据中心容量 | [`/topics/data-center-capacity/`](../website/topics/data-center-capacity/index.html) | Candidate / 重复主题待裁定 | 与数据中心制冷专题范围重叠，当前为简略生成页 | 核查索引、反向链接和边界后合并或重定向 |
| Switching & Oversubscription（旧 stub） | [`/topics/switching-oversubscription/`](../website/topics/switching-oversubscription/index.html) | Candidate / 重复主题待裁定 | 与交换机超售比专题意图重复，当前为简略生成页 | 统一到 `switch-oversubscription`，再决定重定向或保留独立边界 |
| 光网络故障隔离 | 待定：建议并入 `/topics/pon-optical-network/` | Planned / 已有工具底座 | 连接 ONU 收光、OTDR 事件、光功率预算和链路损耗诊断 | 在 PON / 光网络 Hub 中先建立故障路径，再决定是否拆成独立专题 |
| 数据中心电源、UPS 与能源效率 | 待定：建议 `/topics/data-center-power-ups/` | Planned / 部分资产已上线 | 连接 UPS、PUE、蓄电池、负载和故障后的供电能力 | 盘点现有电源工具，与制冷容量专题划清边界后建设 Hub |
| 网络可用性与可靠性 | 待定：建议 `/topics/network-availability-reliability/` | Planned | 覆盖可用性计算、冗余设计、故障域、N-1 和恢复目标 | 先定义指标、故障模型和案例，再选择现有工具或新增工具 |
| OLT 与接入容量规划 | 待定：建议 `/topics/olt-access-capacity/` | Planned / 部分资产已上线 | 覆盖 OLT 上联、PON 端口、用户规模和增长容量 | 盘点 OLT/接入工具，建立设计—计算—扩容路径 |
| 传输环网与链路韧性 | 待定：建议 `/topics/transport-ring-resilience/` | Planned / 部分资产已上线 | 覆盖环网容量、链路中断、保护倒换和剩余容量 | 盘点传输与环网工具，补故障场景和工程案例 |
| IP 与子网规划 | 待定：建议 `/topics/ip-subnet-planning/` | Planned / 部分资产已上线 | 覆盖 CIDR、地址规划、可用主机、VLAN/ACL 边界和变更校核 | 以子网计算器和指南为起点，补地址方案案例与校验流程 |
| Wi‑Fi 覆盖与容量规划 | 待定：建议 `/topics/wifi-coverage-capacity/` | Planned / 部分资产已上线 | 覆盖 AP 数量、覆盖、客户端容量、信道复用和部署校验 | 盘点无线工具，补现场勘测、干扰和漫游边界说明 |

## 已确认的专题入口

- 正式生产型专题：交换机超售比与上联容量、数据中心制冷负荷与精密空调容量。
- 已发布但内容较薄：通信电源与能源规划。
- 优先补齐：PON / 光网络。
- 需要治理的早期或重复页面：数据中心容量、Switching & Oversubscription。
- 规划建设：光网络故障隔离、数据中心电源/UPS、网络可用性与可靠性、OLT/接入容量、传输环网与韧性、IP/子网规划、Wi‑Fi 覆盖与容量规划。

## 推荐建设顺序

1. 先治理重复和 stub URL，确定规范路径。
2. 建设 PON / 光网络专题 Hub，并纳入光网络故障隔离工作流。
3. 补齐通信电源与能源规划专题，明确其与数据中心电源/UPS 专题的边界。
4. 对交换机和数据中心制冷专题执行统一验收，评估升级为 Authority。
5. 依次规划网络可用性、OLT/接入容量、传输环网、IP/子网和 Wi‑Fi 专题。

## 维护规则

新增、改名、迁移或退役工具、指南、案例和 GitHub 资料时，同一变更必须同步更新本清单、对应 Topic Hub、内容注册关系、首页入口和 sitemap（按变更类型适用）。
