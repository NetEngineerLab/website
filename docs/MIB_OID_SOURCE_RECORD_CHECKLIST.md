# MIB/OID 首选 8 个模块来源记录清单

状态：`LOCAL PASS（模板与门禁设计；尚未执行网络采集）`  
审核日期：2026-09-08  
前置条件：`MIB_OID_SOURCE_CANDIDATE_REVIEW.md` 已 `VALIDATOR PASS`。

## 目的与禁止事项

本清单把首选 8 个模块的来源审核拆成可逐项验收的记录任务。它只定义字段、顺序和失败关闭规则，不创建虚拟 ID、时间、哈希、响应头或许可证结论。

在每个模块的预授权记录通过前，禁止发起网络读取；在 acquisition 和 redistribution review 均通过前，禁止把内容放入仓库、Fixture、解析器输入、索引或公开页面。IANA 注册表的 `ALLOW_REGISTRY_DATA` 只适用于注册表事实，不能替代 RFC/MIB 模块的逐文件审核。

## 统一记录链

每个模块必须形成唯一链：

`source-ledger-source/1.0.0` → `source-ledger/1.0.0 preauthorization` → `source-ledger/1.0.0 acquisition` → `source-ledger/1.0.0 redistribution review`

每一环都保留前一环的 ID，source 内容变化生成新的 source ID；不得复用旧 acquisition、跨模块复用 source ID 或用当前 TLP 页面替代发布日期适用的历史 TLP。`recordHash` 只对实际存在且经 RFC 8785 JCS 规范化的记录计算，禁止预填。

## 首选 8 个模块任务表

| 顺序 | 模块 | 官方请求 URL | 依赖前置 | 必须核对的模块事实 | 当前状态 |
|---:|---|---|---|---|---|
| 1 | `SNMPv2-SMI` | `https://www.rfc-editor.org/rfc/rfc2578.txt` | 无 | MODULE-IDENTITY、SMIv2 基础宏/类型、版权与限制声明 | `PENDING_RECORD` |
| 2 | `SNMPv2-TC` | `https://www.rfc-editor.org/rfc/rfc2579.txt` | `SNMPv2-SMI` | TEXTUAL-CONVENTION、DISPLAY-HINT、IMPORTS | `PENDING_RECORD` |
| 3 | `SNMPv2-CONF` | `https://www.rfc-editor.org/rfc/rfc2580.txt` | `SNMPv2-SMI`、`SNMPv2-TC` | MODULE-COMPLIANCE、OBJECT-GROUP、通知组和 IMPORTS | `PENDING_RECORD` |
| 4 | `SNMPv2-MIB` | `https://www.rfc-editor.org/rfc/rfc3418.txt` | 1–3 | 标准对象/通知、模块修订、版权与限制声明 | `PENDING_RECORD` |
| 5 | `INET-ADDRESS-MIB` | `https://www.rfc-editor.org/rfc/rfc4001.txt` | 1–2 | InetAddressType/InetAddress、地址长度约束、IMPORTS | `PENDING_RECORD` |
| 6 | `TCP-MIB` | `https://www.rfc-editor.org/rfc/rfc4022.txt` | 1–5 | TCP 表、废弃对象、地址约定、IMPORTS | `PENDING_RECORD` |
| 7 | `UDP-MIB` | `https://www.rfc-editor.org/rfc/rfc4113.txt` | 1–5 | UDP 端点表、高容量计数器、版权提示、IMPORTS | `PENDING_RECORD` |
| 8 | `SNMP-FRAMEWORK-MIB` | `https://www.rfc-editor.org/rfc/rfc3411.txt` | 1–4 | 引擎对象、OBJECT-IDENTITY、更新关系、IMPORTS | `PENDING_RECORD` |

请求 URL 必须与预授权逐字节一致；如官方页面重定向，必须按来源台账记录每一跳并重新校验主机、协议、预授权和最终 URL。

## 四类记录的验收字段

### Source record

- `schemaVersion`、`sourceId`、`sourceKey`、`authorityNamespace`、`authorityBaseUrls[]`、`policyClass`、`evidenceUrls[]`、`handlingRule`、`recordHash`。
- `evidenceUrls[]` 至少覆盖 RFC Editor 文档页、适用 IETF Trust TLP 证据页；数组去重并排序。
- `policyClass` 必须来自来源台账枚举；RFC MIB 只能进入 `CONDITIONAL_CODE_COMPONENT` 审核路径。
- 删除 `sourceId` 和 `recordHash` 后执行 Unicode NFC + RFC 8785 JCS + SHA-256；`sourceId` 和 `recordHash` 必须由同一完整 64 位小写哈希重算得到。

### Preauthorization

- `schemaVersion`、`preauthorizationId`、`recordHash`、`sourceId`、精确 `requestedSourceUrl`、`expectedDocumentId`、`allowedAction=acquire-for-license-review-only`、policy snapshot、policy evidence URL、责任审核人和审核时间。
- 预授权只允许一次受控读取，不得预填 acquisition ID、响应哈希或内容哈希。
- 请求前重新确认 source ID 仍是当前唯一 source record，官方页面没有发生需要新 source ID 的策略变化。
- 删除 `preauthorizationId` 和 `recordHash` 后执行 Unicode NFC + RFC 8785 JCS + SHA-256；ID 和 `recordHash` 必须由同一完整哈希重算得到，并保留 `sourceId`。

### Acquisition

- `schemaVersion`、`acquisitionId`、`recordHash`、`preauthorizationId`、`sourceId`、最终 URL、每跳 DNS/peer/HTTP 证据、原始响应头哈希、状态码、内容类型、identity 编码、完整 framing、实收字节数和 SHA-256。
- 对 RFC 文本只允许官方 RFC Editor 来源；代理、透明解压、重复或冲突 Content-Length、缺失长度、超限或非 UTF-8 均失败关闭。
- acquisition 只能进入隔离 staging；任何失败都删除临时字节，不形成可供解析器读取的输入。
- 删除 `acquisitionId` 和 `recordHash` 后执行 Unicode NFC + RFC 8785 JCS + SHA-256；ID 和 `recordHash` 必须由同一完整哈希重算得到，并且 `preauthorizationId`、`sourceId` 与前一环逐字节一致。

### Redistribution review

- `schemaVersion`、`reviewId`、`recordHash`、`acquisitionId`、`sourceId`、`reviewScope`、`supersedesReviewId`、逐文件 RFC、IETF stream、发布日期精度、适用 TLP 版本及证据哈希、版权声明、限制性 legend、Pre-5378 状态、归属文本和审查范围。
- `redistributionDecision` 初始只能是 `pending`；只有人工确认 IMPORTS 闭合、source/acquisition 链完整且所有许可字段已知后才能改为 `approved`。
- `pending`、`rejected`、`withdrawn` 都禁止进入公开 snapshot；任何许可变化生成新 review，不覆盖历史记录。
- 删除 `reviewId` 和 `recordHash` 后执行 Unicode NFC + RFC 8785 JCS + SHA-256；ID 和 `recordHash` 必须由同一完整哈希重算得到。`supersedesReviewId` 只能指向同一 acquisition/source/scope 的当前 review，root 必须为 `null` 且每条链只能有一个有效 leaf。

## 失败关闭与审计交付

任一模块出现未知许可字段、TLP 不匹配、URL 漂移、来源哈希缺失、IMPORTS 未闭合、记录 ID/hash 不一致或 review head 不唯一，整项保持 `PENDING_RECORD`，并从首选公开集合移除。不能用 IF-MIB 或 IANAifType-MIB 自动补位，除非重新执行候选集合审核并保持 8 个依赖闭合模块。

本清单完成后，下一门禁是独立审计字段覆盖和失败关闭测试；通过前不得写入真实记录、下载 MIB、安装/运行解析器或创建 Schema/Adapter。
