# NetEngineerLab 已开发记录

本文件是项目“已经完成什么、验证到什么程度、下一步做什么”的唯一持续记录。
历史版本专项文档继续保留，但后续开发不得只写零散 README 或依赖聊天记录。

## 记录规则

每个生产批次必须按以下顺序处理：

1. 明确目标、文件、影响范围与风险。
2. 完成修改及本地测试。
3. 由 2 号验证官独立复核；未获得 `PASS` 不得继续发布。
4. 提交实现，取得不可变的 Git commit SHA。
5. 在本文件登记日期、范围、关键决策、测试、验证结论、实现提交和线上验收。
6. 提交本记录，并与实现提交一起推送。

记录状态只使用：`LOCAL PASS`、`VALIDATOR PASS`、`ONLINE PASS`。没有证据时不得提前登记为完成。

## 已完成批次

### 2026-08-29 — 交换机上联带宽与超售比计算器 SEO/GEO 内容

- 状态：`VALIDATOR PASS`
- 页面：`website/tools/switch-uplink-oversubscription-calculator/` 中英文版本。
- 完成内容：增加线速超售比与忙时需求区别、园区接入与服务器场景、正常与故障拓扑重算、5 组双语 FAQ 和 FAQPage；引用 IEEE 802.1AX、IETF RFC 7424 及 Cisco Campus LAN and Wireless LAN Design Guide。
- 关键边界：只统计实际参与转发且可被流量利用的上联；备用或阻塞链路不计入当前容量；LAG 汇总容量不代表单流带宽，哈希和流量组合会影响成员链路均衡。
- 自动化：浏览器内容合约改用完整来源 URL，并覆盖该工具的 5 个 FAQ、3 个权威来源和可见 FAQ 与 Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2557 个链接、0 errors、0 warnings；交换机上联引擎 PASS；Edge 双语 × 桌面/Android/iPhone 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`46ae1145c02dc6c133fd41e87add3d40b12c0d08`。
- 线上验收：待推送后补录；未完成前不得改为 `ONLINE PASS`。

### 2026-08-29 — DNS TTL 传播计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/dns-ttl-propagation-calculator/` 中英文版本。
- 完成内容：增加 DNS 迁移流程、正向/否定缓存、serve-stale、TTL 与查询负载边界、5 组双语 FAQ 和 FAQPage；引用 RFC 1035、2308、8767、9199。
- 关键边界：正 TTL 的理论刷新率使用 `86400 / TTL`；TTL 为 0 时页面明确为不可跨事务缓存，工具的 86400/日仅是每秒一次的建模上限，实际流量取决于查询率。
- 自动化：浏览器内容合约覆盖 5 个 FAQ、4 个 RFC 链接以及可见 FAQ 与 Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2551 个链接、0 errors、0 warnings；Edge 双语 × 桌面/Android/iPhone 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`fce678f7d97ef3a02c8e8a5bdc04bf95205c96be`。
- 线上验收：Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；生产 Edge 6/6 PASS。

### 2026-08-29 — VLAN/IP 容量规划器 SEO/GEO 内容与 FAQ 门禁

- 状态：`ONLINE PASS`
- 页面：`website/tools/vlan-ip-capacity-planner/` 中英文版本。
- 完成内容：增加办公网/园区网场景、容量与增长边界、RFC 1918/3021/4632 依据、5 组双语 FAQ 和 FAQPage。
- 关键边界：前缀按计算所得每 VLAN 实际需求选择，不把“每 VLAN 目标主机数”误写成固定前缀容量。
- 自动化：SEO 审计要求标记的可见 FAQ 与 FAQPage 数量、问答集合和类型完全一致；递归识别 `@graph` 内嵌 Schema；新增嵌套 FAQPage 故障注入测试并纳入 `npm run verify`。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2543 个链接、0 errors、0 warnings；Edge 双语 × 桌面/Android/iPhone 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`ceb3d0498d339680bb0b913e4c7c8ee257f99778`。
- 线上验收：四条 GitHub 生产工作流全部成功；生产 Edge 6/6 PASS。

### 2026-08-29 — GA4 正式站监控配置驱动修复

- 状态：`ONLINE PASS`
- 完成内容：GA4 在线监控从 `website/data/site-config.json` 读取正式域名与 Measurement ID，保留环境变量覆盖；拒绝不安全或非根路径 origin；增加成功、重定向、禁用、错误 ID、重复保护等回归测试。
- 本地验证：`npm run verify` PASS，0 errors、0 warnings。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`9db3922d79b99bab38e5b2ef9ab5d91b154d3d8f`。
- 线上验收：GA4、Quality、Online、Performance 四条工作流全部成功。

### 2026-08-29 — Wi-Fi 覆盖与容量规划器无障碍修复

- 状态：`ONLINE PASS`
- 完成内容：修复 Tab 的 ARIA 角色与关联、键盘导航、颜色对比、本地资源哈希和 Service Worker 精确缓存匹配。
- 本地验证：Lighthouse Accessibility 从 0.87 提升到 1.00；浏览器测试 136 passed、2 skipped，定向测试 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`ddcab10dd9dbe0e992559017996daed3527e3bb5`。
- 线上验收：Quality、Online、Performance 工作流成功。

## 下一步队列

按“小批次、验证通过后再继续”的顺序执行：

1. 网络机柜功耗与制冷计算器：补充容量、冗余、环境与散热长尾场景。
2. PoE 压降计算器：补充线径、距离、温升和终端启动场景。
3. 无线链路预算计算器：补充可靠性、法规、气候和现场勘测边界。

任何新发现的 P0/P1 稳定性或正确性问题，优先级高于上述 SEO/GEO 队列，并必须在本文件说明插队原因。
