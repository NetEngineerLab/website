# MIB/OID 候选来源审核（10 选 8）

状态：`VALIDATOR PASS（候选集合已闭合；逐文件 source_license_record 尚未生成）`  
审核日期：2026-09-08  
适用范围：MIB/OID Explorer 精简 V1；本文件不是法律意见。

## 审核边界

本批只核对 RFC Editor、IANA 和 IETF Trust 的官方页面、文档身份、模块用途、IMPORTS 依赖和许可审核入口。不下载、镜像或提交任何 MIB 文件，不把浏览器读取结果当成 acquisition，也不提前生成内容哈希、redistribution review 或公开页面。

`VALIDATOR PASS` 只表示候选集合和依赖关系已完成文档级审核；它不等于逐文件许可 `approved`，也不授权采集或公开。每个最终进入 V1 的模块仍必须生成完整的 `source_license_record`，核对发布日期适用的 TLP、版权声明、限制性 legend、Pre-5378 状态、IMPORTS 闭合和有效 review head。

## 官方证据矩阵

| 候选模块 | 官方证据 | 模块/用途核对 | 依赖关系 | 集合决定 |
|---|---|---|---|---|
| `SNMPv2-SMI` | [RFC 2578](https://www.rfc-editor.org/rfc/rfc2578.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc2578/) | SMIv2 基础语法、类型和宏，是其余标准 MIB 的根依赖之一 | 无本批模块依赖 | 首选 8；逐文件许可记录必需 |
| `SNMPv2-TC` | [RFC 2579](https://www.rfc-editor.org/rfc/rfc2579.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc2579/) | `TEXTUAL-CONVENTION`、显示提示和通用文本约定 | `SNMPv2-SMI` | 首选 8；逐文件许可记录必需 |
| `SNMPv2-CONF` | [RFC 2580](https://www.rfc-editor.org/rfc/rfc2580.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc2580/) | `MODULE-COMPLIANCE`、`OBJECT-GROUP` 和通知组约定 | `SNMPv2-SMI`、`SNMPv2-TC` | 首选 8；逐文件许可记录必需 |
| `SNMPv2-MIB` | [RFC 3418](https://www.rfc-editor.org/rfc/rfc3418.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc3418/) | SNMP 标准对象、通知和 `snmpTraps` 等基础对象 | `SNMPv2-SMI`、`SNMPv2-TC`、`SNMPv2-CONF` | 首选 8；逐文件许可记录必需 |
| `INET-ADDRESS-MIB` | [RFC 4001](https://www.rfc-editor.org/rfc/rfc4001.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc4001/) | IPv4/IPv6 通用 `InetAddressType`、`InetAddress` 等 textual conventions | `SNMPv2-SMI`、`SNMPv2-TC` | 首选 8；TCP/UDP 的依赖闭合点 |
| `TCP-MIB` | [RFC 4022](https://www.rfc-editor.org/rfc/rfc4022.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc4022/) | IP 版本无关 TCP 管理对象；官方页面明确其 SMIv2 依赖 | `SNMPv2-SMI`、`SNMPv2-TC`、`SNMPv2-CONF`、`SNMPv2-MIB`、`INET-ADDRESS-MIB` | 首选 8；逐文件许可记录必需 |
| `UDP-MIB` | [RFC 4113](https://www.rfc-editor.org/rfc/rfc4113.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc4113/) | UDP 管理对象、端点表和高容量计数器；模块描述含 RFC 4113 版权归属提示 | `SNMPv2-SMI`、`SNMPv2-TC`、`SNMPv2-CONF`、`SNMPv2-MIB`、`INET-ADDRESS-MIB` | 首选 8；逐文件许可记录必需 |
| `SNMP-FRAMEWORK-MIB` | [RFC 3411](https://www.rfc-editor.org/rfc/rfc3411.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc3411/) | SNMP 架构、引擎对象和框架约束；官方页面标明 IETF stream 与更新关系 | `SNMPv2-SMI`、`SNMPv2-TC`、`SNMPv2-CONF`、`SNMPv2-MIB` | 首选 8；逐文件许可记录必需 |
| `IF-MIB` | [RFC 2863](https://www.rfc-editor.org/rfc/rfc2863.html)；[RFC 信息页](https://www.rfc-editor.org/info/rfc2863/) | 接口表、索引、Counter32/64 和通知；官方模块 IMPORTS `IANAifType` | `SNMPv2-SMI`、`SNMPv2-TC`、`SNMPv2-CONF`、`SNMPv2-MIB`、`IANAifType-MIB` | 备选；仅在首选集合无法闭合时替换 |
| `IANAifType-MIB` | [IANA maintained MIBs](https://www.iana.org/assignments/mib-modules)；[IANA ifType registry](https://www.iana.org/assignments/ianaiftype-mib/)；[IANA licensing terms](https://www.iana.org/help/licensing-terms) | IANA 维护的接口类型 textual convention；IANA 页面引用 RFC 2863/RFC 8892 | `IANAifType-MIB` 是 `IF-MIB` 的依赖；不属于首选 8 | 备选；按 `ALLOW_REGISTRY_DATA` 与 MIB 模块边界分别审核 |

## 10 选 8 的闭合集合

本轮选定的首选闭合集合为：

`SNMPv2-SMI` → `SNMPv2-TC` → `SNMPv2-CONF` → `SNMPv2-MIB` → `INET-ADDRESS-MIB` → `TCP-MIB` → `UDP-MIB` → `SNMP-FRAMEWORK-MIB`。

该集合避开 `IF-MIB` 对 `IANAifType-MIB` 的额外依赖，同时覆盖 SMI 基础、文本约定、合规宏、标准对象、IPv4/IPv6 地址约定、TCP/UDP 表和 SNMP 框架对象。`IF-MIB` 与 `IANAifType-MIB` 保留为替代候选，不能因为 IANA 注册表适用 CC0 就自动把 RFC 2863 正文或 MIB 模块视为 CC0。

## 进入下一门禁的条件

1. 为首选 8 个模块分别生成不可变 source record、preauthorization、acquisition 和 redistribution review；记录发布日期对应的 TLP 版本、版权声明、限制性 legend、Pre-5378 状态和来源哈希。
2. 读取到的模块必须逐项核对 IMPORTS；任一缺失、冲突、未授权或 review head 不是 `approved`，立即从公开集合移除，并从 10 个候选中选择仍保持 8 个且依赖闭合的替代集合。
3. 在上述记录全部通过独立审计前，不得下载到仓库、提交 Fixture、安装解析器、生成 Schema/Adapter 或创建公开 MIB/OID 页面。

## 证据限制

RFC Editor 页面显示文档身份、发布日期、stream、模块内容和版权声明；IANA 页面显示当前维护的 `IANAifType-MIB` 及协议注册表许可。它们不能替代针对实际 acquisition 字节的哈希、TLP 版本匹配、逐文件 source record 或 redistribution review。后续若官方页面、RFC 更新或许可证据变化，必须生成新记录并保留本次审核历史。
