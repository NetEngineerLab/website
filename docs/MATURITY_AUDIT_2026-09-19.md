# NetEngineerLab 全工具深度成熟度审计（2026-09-19）

## 审计维度

对 35 个现有工具逐一检查：计算模型深度、工程场景/基线、Before/After、风险分析、冗余/故障校验、专业报告输出、边界输入与现有引擎测试。现有 10 个代表性低成熟度工具的引擎测试均通过，但“测试通过”只证明当前公式回归，不等于生产级工程成熟。

## Top 10 升级排序

|顺序|优先级|工具（原 URL）|成熟度缺口|首要升级验收|
|---:|:---:|---|---|---|
|1|P0|Telecom AC/DC Power Capacity & Breaker Sizing（`telecom-ac-dc-breaker-sizing`）|仅瞬时 AC/DC 电流与下一标准空开；无场景/Before-After、故障电流/导线载流量/压降/选择性、冗余校验、工程报告|基线/增长/保守 + N-1 配电场景；AC/DC 设计电流链路；降额/压降/保护校核；风险分级；JSON/CSV/打印报告|
|2|P0|Generator Fuel Consumption & Backup Runtime（`generator-fuel-runtime-calculator`）|有厂家曲线插值但无多场景与风险评级；无多油机故障/轮换/补给约束；无 Before-After|基线/负载增长/保守及补油中断情景；N+1 油机、油箱可用量、补给窗口、低负载湿堆风险；保障台账报告|
|3|P0|Telecom Rectifier & DC Power Sizing（`telecom-rectifier-dc-power-sizing`）|有 N+1/N+2，但只单次输入；缺场景比较、Before-After、模块/机框上限与环境降额、专业报告|负载增长/回充峰值/模块故障场景；N-1/N-2 逐态校核；机框容量与环境降额；方案差异报告|
|4|P0|Switch Uplink Capacity & Oversubscription（`switch-uplink-oversubscription-calculator`）|只有平均需求公式；无峰值/时间序列、链路故障后容量、突发缓存风险与 Before-After|业务峰值/增长/故障场景；链路 N-1、峰值利用率、拥塞风险；升级前后容量和端口 BOM|
|5|P1|DNS TTL Propagation（`dns-ttl-propagation-calculator`）|单一 TTL 传播估算；无多解析器/负缓存/权威切换风险、变更前后计划|解析器群体与负缓存场景；变更窗口风险、Before-After 查询量与稳定时间；变更报告|
|6|P1|VLAN & IP Capacity（`vlan-ip-capacity-planner`）|仅地址数量与 VLAN 切分；无 DHCP/保留/网关、VRF/故障域和增长场景|基线/增长/保守地址池；保留/网关/DHCP 安全余量；故障域与扩容前后方案、CIDR/VLAN 计划导出|
|7|P1|Wireless Link Budget（`wireless-link-budget-calculator`）|有 FSPL/Fresnel/淡入余量但无可用性、雨衰、极化/对准、设备冗余与 Before-After|目标可用性/雨衰/杂波场景；链路 N-1/保护链路；升级前后预算、风险与勘测清单|
|8|P1|PON Splitter Loss（`pon-splitter-loss`）|有预算和状态但无多场景、维护/老化/温度风险、保护链路冗余|分光/距离/老化/温度场景；维护余量与保护 PON 校核；Before-After 光预算与 OTDR 验收表|
|9|P1|PON Maximum Distance（`pon-distance`）|主要是最大距离计算；缺场景、冗余、链路老化/维修风险与专业设计输出|分光比/距离/老化/温度场景；保护链路/双上联约束；前后方案和施工验收报告|
|10|P1|PoE Voltage Drop（`poe-voltage-drop-calculator`）|稳态压降模型；无启动浪涌/分类、电源预算冗余、端口故障与 Before-After|802.3af/at/bt 启动/分类场景；PSE 端口预算与 N-1；线规/线对改造前后、压降风险报告|

## P0 第 1 项实施边界

原 URL 保持不变：`/tools/telecom-ac-dc-breaker-sizing/` 与 `/tools/telecom-ac-dc-breaker-sizing/zh/`。只升级工程计算模型和输出，不增加工具数量，不做纯视觉改版。验收必须包含：

1. 输入有限值/物理范围和明确错误，不静默把 Infinity/NaN 当默认值。
2. 基线、增长、保守、N-1 配电/降额场景，并输出 Before/After 差异。
3. 保护工程提示：持续负载、导线载流量、压降、短路/分断能力、选择性均以待核验风险输出，不冒充最终选型。
4. JSON 工程报告、CSV 物料/校核清单、打印版；英文/中文同一 URL 结构。
5. 原有引擎测试 + 新场景/边界测试 + 浏览器 EN/ZH + 独立 2 号审计。
