# MIB/OID 来源与许可台账（Phase 0）

状态：`FROZEN FOR PROTOTYPE`  
证据复核日期：2026-09-01  
适用范围：MIB/OID Explorer Phase 0；本文件不是法律意见。

## 决策结论

1. Phase 0 不批量下载、镜像或公开任何 MIB 文件。
2. IANA 协议注册表数据可以作为 OID/PEN 元数据源；仍须保存来源 URL、抓取时间和内容哈希。
3. IETF MIB 模块是 Code Component，但每个候选模块必须按其 RFC 日期、文档流、版权声明和限制性 legend 单独审核；通过审核后才可进入原型语料，并保留适用的 Revised BSD 通知与 RFC 归属。
4. Cisco MIB 在官方仓库可公开访问不等于本站获得再分发授权；在找到覆盖目标文件的明确许可前，只保存模块名、版本、哈希、产品支持关系和官方链接，不镜像正文。
5. PySMI 可以进入隔离解析器原型评估；PySMI 的公共 MIB 聚合档案不作为许可或权威来源。

## 许可状态枚举

| 状态 | 允许动作 | 禁止动作 |
|---|---|---|
| `ALLOW_REGISTRY_DATA` | 导入结构化注册表事实并注明来源 | 把链接的 RFC 或第三方材料一并视为 CC0 |
| `CONDITIONAL_CODE_COMPONENT` | 完成逐文件审核后提取、解析和按适用通知再分发 | 依据“IETF 来源”进行批量默认放行 |
| `METADATA_LINK_ONLY` | 保存元数据、哈希、官方 URL 和本地解析测试结果 | 保存或公开原始文件、可还原正文或本站下载 |
| `BLOCKED_UNVERIFIED` | 仅记录待核验事项 | 导入、解析后发布或向用户提供下载 |

未知、冲突或缺失许可必须失败关闭为 `BLOCKED_UNVERIFIED`，不得由抓取器自动降级为可发布。

## 官方来源台账

| Source key | 权威来源 | 证据与许可 | 当前状态 | NetEngineerLab 处理规则 |
|---|---|---|---|---|
| `iana-protocol-registries` | [IANA Protocol Registries](https://www.iana.org/protocols) 与 [PEN Registry](https://www.iana.org/assignments/enterprise-numbers/) | [IANA Licensing Terms](https://www.iana.org/help/licensing-terms) 明确协议注册表适用 CC0 1.0，但不影响 data-protection rights；链接出去的 RFC 不在该声明范围 | `ALLOW_REGISTRY_DATA` | 只导入 PEN number、organization name、registry description/reference 等必要非个人事实；Contact、Email 及其他可识别个人字段默认丢弃，除非另行通过隐私目的、最小化、保留期与删除流程审核；保存 registry、record key、source URL、retrievedAt、SHA-256；不把 RFC 正文继承为 CC0 |
| `ietf-rfc-code-components` | [RFC Editor](https://www.rfc-editor.org/) 与 [IETF Trust TLP Archive](https://trustee.ietf.org/documents/trust-legal-provisions/) | 适用于文档发布当日的 TLP 将机器处理代码组件按 Revised BSD 许可；[Code Components 列表](https://trustee.ietf.org/documents/trust-legal-provisions/code-components-list-3/) 包含 MIB modules；TLP 同时要求关注文档日期、Alternate Stream、限制性 legend 与 Pre-5378 material | `CONDITIONAL_CODE_COMPONENT` | 每个 RFC/MIB 独立生成许可记录；必须按发布日期选择当时有效的 TLP，不得用当前 TLP 追溯替代；记录 RFC、stream、copyright notice、legend、license version、attribution；任一字段未知则不发布 |
| `cisco-official-mibs` | [Cisco cisco-mibs](https://github.com/cisco/cisco-mibs) 与 [Cisco SNMP FAQ](https://www.cisco.com/c/en/us/support/docs/ip/simple-network-management-protocol-snmp/9226-mibs-9226.html) | Cisco 确认 GitHub 仓库是官方公共 MIB 来源；仓库根目录未提供覆盖全部内容的明确开源许可证，样例模块包含 Cisco copyright / all rights reserved | `METADATA_LINK_ONLY` | V1.1 门禁前仅存模块名、官方路径、commit SHA、文件 SHA-256、修订日期、产品 support-list 关系；禁止本站镜像和下载按钮 |
| `pysmi-parser` | [PySMI documentation](https://docs.lextudio.com/pysmi/) | 软件为 BSD-2-Clause，支持 SMIv1、SMIv2、IMPORTS、AST 与 JSON 转换；官方文档明确其公共 MIB 档案一致性和可靠性不受保证 | 软件：候选；档案：`BLOCKED_UNVERIFIED` | 仅把固定版本 PySMI 放入隔离、无网络、有限资源的解析器评估；禁用自动 borrowing/远程 source；聚合档案不得进入许可语料 |

## 标准原型语料候选清单

以下只是 10 个代表性审核对象，不表示已经获准导入。先覆盖 SMI 基础、依赖、表、计数器、通知和 legacy copyright 差异；每项必须完成 `source_license_record` 后才能复制到测试 Fixture。

| Module | RFC | 代表性 | 当前决定 |
|---|---:|---|---|
| `SNMPv2-SMI` | 2578 | MODULE-IDENTITY、OBJECT-TYPE、基础类型 | `PENDING_PER_RFC_AUDIT` |
| `SNMPv2-TC` | 2579 | TEXTUAL-CONVENTION、DISPLAY-HINT | `PENDING_PER_RFC_AUDIT` |
| `SNMPv2-CONF` | 2580 | MODULE-COMPLIANCE、OBJECT-GROUP | `PENDING_PER_RFC_AUDIT` |
| `SNMPv2-MIB` | 3418 | 标准对象、通知、旧版权声明 | `PENDING_PER_RFC_AUDIT` |
| `INET-ADDRESS-MIB` | 4001 | TCP/UDP 地址与端口 textual conventions | `PENDING_PER_RFC_AUDIT` |
| `TCP-MIB` | 4022 | InetAddress textual conventions、废弃对象 | `PENDING_PER_RFC_AUDIT` |
| `UDP-MIB` | 4113 | 多索引表、IPv4/IPv6 地址 | `PENDING_PER_RFC_AUDIT` |
| `SNMP-FRAMEWORK-MIB` | 3411 | OBJECT-IDENTITY、引擎对象与约束 | `PENDING_PER_RFC_AUDIT` |
| `IF-MIB` | 2863 | 表、索引、Counter32/64、依赖 | `PENDING_PER_RFC_AUDIT` |
| `IANAifType-MIB` | IANA registry | IF-MIB 的 IANA 类型依赖；按 IANA registry 许可审核 | `PENDING_PER_SOURCE_AUDIT` |

失败样例必须由 NetEngineerLab 自行构造最小文本，不从许可未知厂商文件复制：缺失 IMPORT、循环 IMPORT、重复 OID、非法子标识、截断声明、超深 AST、超长 DESCRIPTION、SMIv1/SMIv2 混用及编码异常。

## 三阶段强制记录

首次网络读取前只要求不可变的“许可预授权”；取得响应后写 acquisition/hash 记录；最后由人工写 redistribution review。三类记录以 ID 串联，不覆盖历史记录，也不得预填尚未发生的采集时间或内容哈希。

三类记录统一使用 Schema `source-ledger/1.0.0` 和 RFC 8785 JCS。先对所有字符串执行 Unicode NFC；preauthorization 只删除 `preauthorizationId` 与 `recordHash`，acquisition 只删除 `acquisitionId` 与 `recordHash`，review 只删除 `reviewId` 与 `recordHash`，引用 ID 必须保留在 preimage 中。对剩余完整记录计算 SHA-256；`recordHash` 保存完整 64 位小写十六进制，ID 分别为 `pa-`、`acq-`、`review-` 加同一个完整 hash。数组必须按 Schema 指定 key 排序，日期/时间使用示例中的固定 ISO 格式；未知字段、短 hash、ID/hash 重算不一致均失败。`sourceId` 必须精确引用下一段定义的不可变 source record。

“官方来源台账”的 Source key 只供人阅读，不作为引用 ID。每个可引用 source 必须先形成 `source-ledger-source/1.0.0` 封闭记录：`schemaVersion`、`sourceId`、`sourceKey`、`authorityNamespace`、`authorityBaseUrls[]`、`policyClass`、`evidenceUrls[]`、`handlingRule`、`recordHash`。URL 数组去重排序；删除 `sourceId` 与 `recordHash` 后执行 NFC + RFC 8785 JCS + SHA-256，`sourceId` 为 `source-` 加完整 hash，`recordHash` 为同一 hash。source 内容变化生成新 sourceId，旧记录保留。preauthorization 必须引用该不可变 sourceId；acquisition 的 sourceId 必须与其 preauthorization 完全相同，review 的 sourceId 又必须与其 acquisition 完全相同，任一不一致均失败。

### 1. 许可预授权（网络读取前）

```json
{
  "schemaVersion": "source-ledger/1.0.0",
  "preauthorizationId": "pa-<64 lowercase hex>",
  "recordHash": "<64 lowercase hex>",
  "sourceId": "source-<64 lowercase hex for ietf-rfc-code-components record>",
  "requestedSourceUrl": "https://www.rfc-editor.org/rfc/rfc6933.txt",
  "expectedDocumentId": "RFC 6933",
  "allowedAction": "acquire-for-license-review-only",
  "policySnapshot": "ietf-publication-date-policy",
  "policyEvidenceUrl": "https://trustee.ietf.org/documents/trust-legal-provisions/",
  "approvedBy": "<accountable reviewer>",
  "approvedAt": "2026-09-01"
}
```

### 2. Acquisition（成功读取后）

```json
{
  "schemaVersion": "source-ledger/1.0.0",
  "acquisitionId": "acq-<64 lowercase hex>",
  "recordHash": "<64 lowercase hex>",
  "preauthorizationId": "pa-<64 lowercase hex>",
  "sourceId": "source-<same 64 lowercase hex as preauthorization>",
  "finalSourceUrl": "https://www.rfc-editor.org/rfc/rfc6933.txt",
  "retrievedAt": "2026-09-01T00:00:00Z",
  "contentSha256": "<64 lowercase hex>",
  "contentBytes": "<positive integer measured from response body>",
  "httpStatus": 200,
  "responseContentType": "text/plain"
}
```

### 3. Redistribution review（人工审核后）

```json
{
  "schemaVersion": "source-ledger/1.0.0",
  "reviewId": "review-<64 lowercase hex>",
  "recordHash": "<64 lowercase hex>",
  "acquisitionId": "acq-<64 lowercase hex>",
  "sourceId": "source-<same 64 lowercase hex as acquisition>",
  "reviewScope": "public-static-derived-data-and-approved-code-components",
  "supersedesReviewId": null,
  "documentId": "RFC 6933",
  "documentStream": "IETF",
  "publicationDate": { "value": "2013-05", "precision": "month" },
  "licenseStatus": "conditional-code-component",
  "applicableTlpVersion": "4.0",
  "licenseEvidenceUrl": "https://trustee.ietf.org/wp-content/uploads/IETF-TLP-4.pdf",
  "licenseEvidenceSha256": "<64 lowercase hex of the reviewed TLP 4.0 file>",
  "copyrightNotice": "<exact notice or immutable extracted notice id>",
  "restrictionLegend": "none|6.c.i|6.c.ii|6.c.iii|unknown",
  "pre5378Status": "absent|present|unknown",
  "attribution": "Derived from IETF RFC 6933; preserve the approved license notice.",
  "redistributionDecision": "pending",
  "reviewedBy": "<accountable reviewer>",
  "reviewedAt": "2026-09-01"
}
```

RFC 6933 的官方发布日期精度是月份，因此记录为 `2013-05` / `month`，禁止虚构具体日。`applicableTlpVersion` 必须由 publication date 与 IETF Trust archive 匹配；RFC 6933 使用 [2009-12-28 生效的 TLP 4.0 固定文件](https://trustee.ietf.org/wp-content/uploads/IETF-TLP-4.pdf)，不得引用 2015-03-25 才生效的 TLP 5.0。证据 URL 与 SHA-256 必须共同保存，避免汇总页变化后无法复核。`restrictionLegend` 或 `pre5378Status` 为 `unknown`、`documentStream` 不是已确认适用 Code Component 授权的 stream，或 review 尚未 `approved` 时，公开流水线必须拒绝。

`redistributionDecision` 只能是 `pending|approved|rejected|withdrawn`。`pending`、`rejected` 和 `withdrawn` 均不可进入公开 snapshot；`withdrawn` 专用于撤回先前批准，`rejected` 表示当前证据明确不允许目标用途。

`retrievedAt` 是采集事实，`reviewedAt` 是许可判断事实，两者不得互相替代。许可判断改变时生成新 review，不覆盖 acquisition 或历史决定。

每个 `{acquisitionId, reviewScope}` 必须恰有一个 `supersedesReviewId:null` 的 root；后续 review 必须指向同一 acquisition、source 和 scope 的当前唯一 head。有效决定只取唯一 leaf；多个 root/leaf、跨 acquisition/source/scope 指向、环、断链或缺失记录全部失败关闭。新的 `withdrawn` 或 `rejected` review 一旦成为 head，即覆盖旧 approved 对未来发布的效力，但不改写旧记录或历史 snapshot；任何新 snapshot 必须重新解析 effective head，禁止只信 artifact 准入时的 approved review。

## 采集与发布门禁

采集器必须先读取有效的 preauthorization，且请求 URL 与 `requestedSourceUrl` 精确匹配，才允许一次网络读取。默认禁用自动重定向；若业务上必须跟随，每一跳都必须是 HTTPS、命中该 source 的主机白名单、不得包含凭据、不得使用非默认端口，并在读取下一跳前获得独立 preauthorization；最终 URL 必须写入 acquisition。响应只能进入隔离暂存区并立即形成 acquisition/hash 记录。没有人工 redistribution review 或决定不是 `approved` 时，内容不得离开隔离区。解析器无网络、只读输入、独立临时输出，并施加文件大小、模块数、IMPORT 深度、AST 节点数、CPU 时间和内存上限。

只有 `ALLOW_REGISTRY_DATA` 或已完成逐文件审核的 `CONDITIONAL_CODE_COMPONENT` 可以生成公开数据。`METADATA_LINK_ONLY` 只能生成不可还原原文的元数据页，并把下载动作指向官方来源。删除或许可撤回时，按稳定 Page Family ID 执行 `noindex`、`gone` 或同语种 redirect，且保留审计记录。

## 下一门禁

在任何 MIB Fixture、解析代码或数据库迁移进入仓库前，必须完成：

1. 为上述 10 个候选逐项填写许可记录并选出 8–10 个通过项；若不足 8 个，必须先经相同来源与许可审核扩充候选清单，不得降低门禁。
2. 通过解析器 ADR，明确固定版本、关闭网络 borrowing、资源限制与 Golden Fixture 格式。
3. 通过数据字典和威胁模型，明确原始事实、解析事实与工程解释的隔离。
4. 由 2 号验证官复核本台账；失败时不得进入 V1.0。
