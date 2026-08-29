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

### 2026-08-29 — 无线链路预算计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/wireless-link-budget-calculator/` 中英文版本。
- 完成内容：补充 2.4/5/6/11/24/60 GHz 点对点链路的可靠性、目标调制、气候、多径、雨衰、氧气吸收、法规与现场勘测长尾场景；增加 5 组双语 FAQ 和 FAQPage；引用 ITU-R P.525、P.530、P.676 与 P.526。
- 关键边界：FSPL 仅描述无遮挡自由空间；附加损耗是手动合并值；10/20 dB 是规划筛选门槛而非可用率保证；60% 菲涅耳净空只检查所填位置；EIRP 结果不是法规合规结论；接收灵敏度应匹配目标调制、带宽和吞吐量。
- 自动化：浏览器内容合约覆盖 5 个 FAQ、4 个完整 ITU URL 与可见 FAQ/Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2581 个链接、0 errors、0 warnings；无线链路引擎 PASS；Chrome/Edge 双语多视口 8/8 PASS。
- 独立验证：2 号验证官最终 `PASS`；独立 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，`git diff --check` PASS。
- 实现提交：`566af0906d5d82b450debd934820bd43e6a3e918`。
- 线上验收：提交 `1a2a6ebd0122fe283bc41eebb124e85fb5475f13` 对应 Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；缓存绕过检查确认英中内容已部署；生产 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，HTTP 200、5 个 FAQ、4 个 ITU 来源、FAQ 展开、计算结果、响应式溢出与运行时错误检查全部通过。

### 2026-08-29 — PoE 压降计算器正确性修复与 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/poe-voltage-drop-calculator/` 中英文版本；计算引擎与测试同步更新。
- 完成内容：补充摄像头、无线 AP、PTZ、门禁与大功率 PD 的线径、通道长度、接触电阻、线束温升和启动长尾场景；增加 5 组双语 FAQ 和 FAQPage；引用 IEEE 802.3bt、Ethernet Alliance 与 Fluke Networks。
- 正确性修复：线损比例分母由“设备有效负载 + 线损”改为“远端 PoE 输入功率 + 线损”，与源端功率一致；为 10%/20% 状态门槛加入 `1e-9` 浮点容差，修复理论恰好 20% 被误判失败的问题。
- 关键边界：设备功率指 PD 转换器后的有效直流负载；若输入已在 PD 网口测得应使用 100% 效率；四线对模型假设理想均流，不模拟直流电阻不平衡；线缆温度不等于环境温度；稳态压降通过不能证明检测、分类、浪涌或设备启动成功。
- 自动化：新增精确 1Ω 回路的独立能量守恒测试，验证 `50V × 5A = 225W + 25W`，并覆盖 10%、刚超 10%、20%、刚超 20% 四个状态边界；浏览器内容合约覆盖 5 个 FAQ、4 个完整来源 URL 与可见 FAQ/Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2573 个链接、0 errors、0 warnings；PoE 引擎 PASS；Chrome/Edge 双语多视口 8/8 PASS。
- 独立验证：2 号验证官首轮因状态边界测试不足判定 `FAIL`；补齐测试并修复浮点边界后最终 `PASS`，独立 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，`git diff --check` PASS。
- 实现提交：`536887355926adda4408f99ce48516e3bd0257a1`。
- 线上验收：提交 `01ed48f3707021325a684065ca33e43664b39912` 对应 Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；缓存绕过检查确认英中内容与引擎已部署；生产 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，HTTP 200、5 个 FAQ、4 个权威来源、FAQ 展开、无溢出与无运行时错误；线上 1Ω 边界输入确认 10% 为通过、刚超 20% 为不通过。

### 2026-08-29 — 网络机柜功耗与制冷计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/network-rack-power-cooling-calculator/` 中英文版本。
- 完成内容：增加交换机机柜、边缘计算机柜、通信机房和小型数据中心长尾场景；解释连接功率、实际 IT 负载、设计 kW、VA、单相/三相电流、BTU/h、冷吨、COP、PUE 与成本范围；增加 5 组双语 FAQ 和 FAQPage；引用 ASHRAE、NIST、美国能源部和 The Green Grid。
- 关键边界：冗余百分比只是乘法规划余量，不代表 N+1、2N 或 A/B 故障转移设计；三相公式假设负载平衡并输入线电压；80% 是工具规划门槛而非通用电气规范；月耗电与电费只含实际 IT 负载，不含制冷、UPS/PDU 损耗和其他设施能耗。
- 自动化：浏览器内容合约覆盖 5 个 FAQ、4 个完整权威来源 URL，以及可见 FAQ 与 Schema 的逐字一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2565 个链接、0 errors、0 warnings；机柜功耗与制冷引擎 PASS；Chrome/Edge 双语多视口定向测试 8/8 PASS。
- 独立验证：2 号验证官最终 `PASS`；独立 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，`git diff --check` PASS。
- 实现提交：`369512864ffd32636e101a6c8a28ff560bc404ef`。
- 线上验收：提交 `f587c3610029a4706a64112272a3c4777c2a05a6` 对应 Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；缓存绕过检查确认正式站英中内容已部署；生产 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，HTTP 200、5 个 FAQ、4 个权威来源、FAQ 展开、计算结果、响应式溢出与控制台错误检查全部通过。

### 2026-08-29 — 交换机上联带宽与超售比计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/switch-uplink-oversubscription-calculator/` 中英文版本。
- 完成内容：增加线速超售比与忙时需求区别、园区接入与服务器场景、正常与故障拓扑重算、5 组双语 FAQ 和 FAQPage；引用 IEEE 802.1AX、IETF RFC 7424 及 Cisco Campus LAN and Wireless LAN Design Guide。
- 关键边界：只统计实际参与转发且可被流量利用的上联；备用或阻塞链路不计入当前容量；LAG 汇总容量不代表单流带宽，哈希和流量组合会影响成员链路均衡。
- 自动化：浏览器内容合约改用完整来源 URL，并覆盖该工具的 5 个 FAQ、3 个权威来源和可见 FAQ 与 Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2557 个链接、0 errors、0 warnings；交换机上联引擎 PASS；Edge 双语 × 桌面/Android/iPhone 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`46ae1145c02dc6c133fd41e87add3d40b12c0d08`。
- 线上验收：提交 `da3d73438d5f20262fea1a24d8dd547f798b3af2` 对应 Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；正式站点已出现中英文新内容；生产 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，5 个 FAQ、3 个权威来源、计算结果、响应式溢出与控制台错误检查全部通过。

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

1. 全站 SEO/GEO 覆盖盘点：按搜索意图、内容深度、FAQ/Schema、来源质量与长尾场景建立下一轮优先级清单。

任何新发现的 P0/P1 稳定性或正确性问题，优先级高于上述 SEO/GEO 队列，并必须在本文件说明插队原因。
