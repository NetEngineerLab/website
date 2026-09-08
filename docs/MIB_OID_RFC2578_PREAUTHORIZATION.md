# RFC 2578 许可预授权草案

状态：`DRAFT — NOT AUTHORIZED FOR NETWORK ACQUISITION`
记录类型：`source-ledger/1.0.0 preauthorization`
适用对象：RFC 2578 / `SNMPv2-SMI`

## 边界

本文件只定义 RFC 2578 首次网络读取前的预授权字段和值域，不是可执行的预授权记录。它不创建 `sourceId`、`preauthorizationId` 或 `recordHash`，不授权下载、复制、解析或公开 RFC/MIB 正文。

[RFC Editor 官方 HTML 页](https://www.rfc-editor.org/rfc/rfc2578.html)确认文档身份为 RFC 2578、Standards Track、发布时间为 1999-04。实际受控读取的唯一请求目标固定为 RFC Editor 官方纯文本 URL；HTML 页面只用于人工核对文档身份，不得替代预授权中的请求 URL。

## 字段草案

| 字段 | RFC 2578 草案值或要求 | 失败关闭规则 |
|---|---|---|
| `schemaVersion` | 必须精确为 `source-ledger/1.0.0` | 缺失、大小写变化或版本不一致时拒绝预授权 |
| `preauthorizationId` | 留空；只能在全部字段经审核后，按 NFC + RFC 8785 JCS + SHA-256 规则生成 | 不得使用示例、短哈希、随机值或人工填写值发起请求 |
| `recordHash` | 留空；必须与最终 `preauthorizationId` 使用同一完整 64 位小写 SHA-256 | 未重算、长度错误或与 ID 不一致时拒绝预授权 |
| `sourceId` | 留空；必须引用已通过审核且当前有效的 `ietf-rfc-code-components` 不可变 `source-ledger-source/1.0.0` 记录 | source record 缺失、失效、内容变化、哈希不一致或引用其他来源时拒绝预授权 |
| `requestedSourceUrl` | 必须逐字节等于 `https://www.rfc-editor.org/rfc/rfc2578.txt` | URL 规范化后才相等、协议/主机/路径/大小写不同、含查询参数或 fragment 时均拒绝；重定向不得沿用本记录 |
| `expectedDocumentId` | 必须精确为 `RFC 2578` | 响应身份无法证明为 RFC 2578 或与该值不一致时不得形成 acquisition |
| `allowedAction` | 必须精确为 `acquire-for-license-review-only` | 任何解析、Fixture、镜像、再分发、公开、索引或下载用途均超出授权 |
| `policySnapshot` | 必须精确为 `ietf-publication-date-policy` | 不得写当前 TLP 版本或把尚未完成的历史政策匹配表述为已确认结论 |
| `policyEvidenceUrl` | 必须精确为 `https://trustee.ietf.org/documents/trust-legal-provisions/` | URL 缺失、改用非 IETF Trust 来源或证据页不可复核时拒绝预授权 |
| `approvedBy` | 留空待具名责任审核人填写；必须是可追责的人或受控审核身份，不得使用角色占位符 | 空值、`TBD`、匿名、机器人自批或无法关联审核记录时拒绝预授权 |
| `approvedAt` | 留空待批准当日填写；格式必须为真实日历日期 `YYYY-MM-DD` | 不得预填未来日期、用采集时间代替、使用时间戳或虚构日期 |

字段集合必须封闭为上表 11 项，不得加入 acquisition ID、响应状态、响应头、采集时间、内容长度、内容 SHA-256、许可结论或 redistribution decision。生成 ID/hash 时只删除 `preauthorizationId` 与 `recordHash`，`sourceId` 和全部其余字段必须保留在 canonical preimage 中。

## 审核与执行条件

1. 责任审核人先确认不可变 source record 的 authority、base URL、policy class、证据 URL 和 handling rule 均覆盖 RFC Editor 与 IETF Code Component 审核路径。
2. 责任审核人按 RFC 2578 的 1999-04 发布月份核对历史政策路径；本草案不把当前 TLP 追溯应用于该文档，也不提前作 redistribution `approved` 判断。
3. 审核通过后填写真实 `approvedBy` 与 `approvedAt`，再按来源台账规则生成完整 `preauthorizationId` 和 `recordHash`；生成前本文件不能被采集器接受。
4. 本预授权只允许对精确 `requestedSourceUrl` 发起一次受控读取。失败、超时或 URL 漂移后不得自动重试，必须形成新的预授权审核。
5. 如响应发生重定向，当前预授权只能覆盖第一跳；下一跳必须重新执行主机、协议、DNS/peer 和独立 preauthorization 审核。

## 失败关闭结论

当前草案缺少已审核的真实 `sourceId`、具名 `approvedBy`、真实 `approvedAt`、`preauthorizationId` 和 `recordHash`，因此状态必须保持 `DRAFT — NOT AUTHORIZED FOR NETWORK ACQUISITION`。在这些字段完成并经独立审计 PASS 前，不得访问 `.txt` 请求 URL，不得生成 acquisition，不得保存 RFC/MIB 字节，也不得把 RFC 2578 放入 parser lock、Fixture、索引或公开页面。
