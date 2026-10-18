# SEO Top 30 Execution Plan V1

状态：`CURRENT`（2026-10-18）。fiber latency 计算器已建成（PR #2）。下列 Gate 文字保留为 2026-10-13 计划，不再表示 fiber latency 缺失。

## Gate SEO-0（当前）

- 固定30词到真实URL；UNKNOWN保留UNKNOWN。
- 用户确认P0主URL后，冻结修改清单。

## Gate SEO-1（获确认后）

1. 优化 `pon-splitter-loss`：标题/H1/描述保持现有有效词，补公式、单位、级联案例、GPON/XGS-PON适用范围、FAQ及PON hub/光预算/fiber-loss双向内链。
2. 优化 `switch-uplink-oversubscription-calculator`：加入4台48口1G、两台汇聚、双10G/25G、堆叠链路、正常与N-1容量、理论接入总带宽与忙时负载、LAG/MLAG/独立上联边界。
3. 优化 `optical-power-budget`：明确Tx、Rx sensitivity、overload、fiber、splitter、connector/splice、margin及GPON/XGS-PON示例来源。
4. 优化 `fiber-loss`：定义通用链路损耗意图，补dB/km、连接器/熔接、案例和与PON预算的链接。
5. 优化 `topics/pon-optical`：作为PON calculator hub，链接上述工具与教程。

## Gate SEO-2

P0测试PASS后，复用现有工具处理P1/P2；缺失页面保持BLOCKED，不新建重复计算器。

## Gate SEO-3/4

运行项目已配置的SEO、结构化数据、构建和工具回归检查；未配置项记录NOT CONFIGURED。发布后第7/14/28天记录 impressions、clicks、CTR、position、indexing，不把波动直接归因于优化。
