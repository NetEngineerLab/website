# MIB/OID Explorer 内部数据字典

状态：`FROZEN FOR LEAN V1`（2 号验证官 PASS）  
Schema version：`1.0.0-draft`  
冻结日期：2026-09-05

## 适用边界

本字典定义离线解析原型的内部事实模型，不是数据库迁移、公开 API 或网页 Schema。所有输入必须先通过 `MIB_OID_SOURCE_LICENSE_LEDGER.md`，解析运行时必须通过 `MIB_OID_PARSER_DEPLOYMENT_ADR.md`。搜索索引、页面 JSON-LD 和双语内容都是投影，不得反向成为事实源。

## 事实层级

| 层级 | 可写主体 | 内容 | 更新规则 |
|---|---|---|---|
| `source` | 许可与采集流水线 | 官方来源、许可、原始字节哈希、原始字段和位置 | acquisition 不可变；变更产生新记录 |
| `parsed` | 已批准解析器与 Adapter | AST 派生的模块、符号、OID、类型、访问、状态、依赖和 diagnostics | 绑定输入哈希与运行时 digest；重新解析产生新 parse run |
| `adjudicated` | 具名人工审核者 | 多解析器差异、重复 OID、别名、许可和发布裁决 | 追加不可变裁决，不改写 source/parsed |
| `editorial` | 内容负责人 | 中英文工程解释、示例、限制和搜索意图 | 版本化、可撤回；不得覆盖标准字段 |
| `publication` | 确定性发布器 | 某次获批事实与内容版本的不可变集合 | 由 snapshot 引用；搜索与网页仅从 snapshot 生成 |

## 标识符与规范值

- 所有实体含 `schemaVersion`。内部 ID 使用 ASCII 小写前缀加完整 64 位十六进制 SHA-256；canonical key 与 hash algorithm/version 必须同时保存，ID 与重新计算结果不一致时构建失败。
- `moduleFamilyId` 的 canonical key 是 `{authorityNamespace}\u0000{moduleNameExact}`。镜像来源不得创建新的 module family；authority 必须指向定义该模块的标准组织或厂商，而不是下载站。
- `moduleRevisionId` 的 canonical key 是 `{moduleFamilyId}\u0000{revisionIdentity}`。没有合法 LAST-UPDATED/REVISION 的模块使用 `revisionIdentity: "undated:" + artifactContentSha256`，不得伪造日期。
- `moduleArtifactId` 的 canonical key 是 `{sourceRangeIdentityHash}\u0000{artifactContentSha256}`；artifact 在解析前即可固定到 acquisition 的一个确切字节范围，不依赖尚未解析出的 module/revision。相同逻辑 revision 的不同 artifact content hash 由 parse result 关联后标记 drift conflict，不得静默选择较新采集项。
- `moduleParseResultId` 的 canonical key 是 `{moduleArtifactId}\u0000{parseRunId}`；同一 source artifact 被不同 parser/adapter 解析时生成不同结果，禁止覆盖。
- `symbolDefinitionId` 的 canonical key 是 `{moduleParseResultId}\u0000{symbolNameExact}\u0000{definitionKind}`。
- `oidKey` 是无前导点的规范十进制 dotted string，例如 `1.3.6.1.2.1.1.3`；OID 不使用 JavaScript Number 存储。
- locale 只能来自全站 locale registry；Phase 0 editorial 只允许 active 的 `en`、`zh`，展示语言标签仍由 locale 配置映射。

OID 每个 arc 必须为无符号十进制、除 `0` 外无前导零、范围 `0..4294967295`，层级不超过 128；首 arc 仅 `0..2`，首 arc 小于 2 时第二 arc 仅 `0..39`。实例后缀与对象定义 OID 分开建模，禁止把轮询实例误当 Schema 节点。

### 顶层实体 ID 表

所有 preimage 先按字段顺序以 UTF-8 编码并用 NUL 分隔，再使用实体前缀加完整 SHA-256。任何字段本身含 NUL 时拒绝。`oid_node` 以规范 `oidKey` 作为天然主键；`source_license_review_ref`、`sourceRange`、INDEX component、notification member、raw ref 和 audit envelope ref 是嵌入值/外部引用，不生成本系统顶层 ID。

| 实体 / 前缀 | Canonical preimage |
|---|---|
| module family / `mibmod-` | `authorityNamespace, moduleNameExact` |
| module revision / `mibrev-` | `moduleFamilyId, revisionIdentity` |
| module artifact / `mibart-` | `sourceRangeIdentityHash, artifactContentSha256` |
| parse run / `parserun-` | `runtimeApprovalId, inputManifestSha256, parserName, parserVersion, adapterVersion, parseMode, canonicalPayloadOrFailureSha256` |
| module parse result / `mibparse-` | `moduleArtifactId, parseRunId` |
| symbol definition / `mibsym-` | `moduleParseResultId, symbolNameExact, definitionKind` |
| OID binding / `oidbind-` | `oidKey, symbolDefinitionId, bindingRole` |
| vendor / `vendor-` | `vendorAuthorityNamespace, vendorAuthorityIdentifier` |
| vendor support fact / `vsupport-` | RFC 8785 canonical record bytes excluding `vendorModuleSupportId`；包含 supportStatus、完整 source license review ref、sourceRange identity、reviewedAt 及全部语义字段 |
| editorial version / `editorial-` | `subjectType, subjectId, locale, contentSha256` |
| adjudication / `adjudication-` | RFC 8785 canonical record bytes excluding `adjudicationId` and `recordSha256`; `recordSha256` 与 ID hash 使用同一组 bytes |
| publication snapshot / `snapshot-` | `schemaVersion, manifestSha256` |

`canonicalPayloadOrFailureSha256` 在生成任何实体 ID 前，对 parser/adapter 的无 ID 语义 payload 或 canonical failure facts 计算，因此不存在 parseRunId ↔ moduleParseResultId 循环。`parseRunId` 随后确定，audit envelope 不参与 ID。重复执行产生相同规范结果时 ID 相同；同一输入/运行时出现不同 payload hash 时保留两个 parse run 并生成 parser-drift 阻断冲突。`vendorAuthorityIdentifier` 必须是获批 IANA PEN 或人工裁决的稳定官方标识，不能直接用可变展示名称或抓取域名。

`sourceRangeIdentityHash` 仅对 `{acquisitionId, contentSha256, byteStart, byteEnd}` 的 RFC 8785 bytes 计算；line/column 只显示，不参与身份。`editorial.contentSha256` 对排除 `editorialVersionId` 与 `contentSha256` 后的完整内容记录计算。`publication.manifestSha256` 只对 `publication_snapshot` 封闭字段集中排除 `snapshotId` 与 `manifestSha256` 后的完整 manifest 计算，再生成 snapshot ID；运行时间、宿主、日志和 audit envelope 不允许进入 snapshot。所有 content-addressed 记录必须通过“删除派生 ID/hash 字段 → canonicalize → hash → 回填 → 重算验证”的统一流程，禁止字段自引用。

Phase 0 acquisition 必须是严格 UTF-8 且不含 BOM；非法序列、BOM 和其他编码在解析前失败，不生成转码副本。所有 `sourceRange` 使用 `{acquisitionId, contentSha256, byteStart, byteEnd, lineStart, columnStart, lineEnd, columnEnd}`，范围直接对应 acquisition 原始字节的半开区间 `[byteStart, byteEnd)`；CRLF/LF 不预先改写。行列均为 1-based，行以原始 LF 分隔，CR 属前一行内容，column 按解码后的 Unicode scalar value 计数；它们只用于显示，不参与 ID 或 identity hash，定位以字节为准。`descriptionRawRef`、`referenceRawRef` 等 raw ref 只能引用隔离 source blob 与 range，不复制大段原文到 parsed 层。所有 `*Ref` 必须携带目标类型和完整 ID，禁止只凭名称模糊解析。

## 核心实体

### `source_license_review_ref`

只引用许可台账，不复制或弱化结论：`reviewId`、`acquisitionId`、`sourceId`、`reviewScope`、`redistributionDecision`、`reviewedAt`、`recordHash`。进入 parse manifest 时必须解析该 `{acquisitionId, reviewScope}` 的 supersession chain，引用唯一 effective head；只有 head decision 为 `approved` 且 ID/hash 重算一致才可解析。

### `parse_run`

字段：`parseRunId`、`inputManifestSha256`、`runtimeApprovalId`、`runtimeImageDigest`、`parserName`、`parserVersion`、`adapterVersion`、`parseMode`、`canonicalPayloadOrFailureSha256`、`canonicalFailureFacts|null`、`status`。audit envelope 作为外部追加记录引用 `parseRunId`，parse run 不保存可增长的 envelope 数组。

`status` 仅 `succeeded|failed`；`parseMode` 仅 `strict-smiv1|strict-smiv2|relaxed`。relaxed parse run 永久不可直接发布。时间戳只存在 audit envelope，不进入规范输出哈希。

### `mib_module_family`

字段：`moduleFamilyId`、`authorityNamespace`、`moduleNameExact`、`moduleNameSearch`、`sourceType`。`moduleNameExact` 必须保留大小写；`moduleNameSearch` 仅供搜索，不能用于 JOIN 或唯一性判断。

### `mib_module_revision`

字段：`moduleRevisionId`、`moduleFamilyId`、`revisionIdentity`、`revisionDate`。它只保存稳定逻辑身份，不列 artifact、不保存选择状态；关联通过 module parse result 的反向引用派生，选择只存在 adjudication 与 snapshot。

`revisionIdentity` 算法固定如下：SMI ExtUTCTime 先严格验证世纪、月、日、时、分和尾随 `Z`，再规范为分钟精度 `YYYY-MM-DDTHH:MMZ`。恰有一个 MODULE-IDENTITY 且 LAST-UPDATED 合法时，使用 `last-updated:<normalized-time>`；LAST-UPDATED 必须不早于其最新合法 REVISION。无 MODULE-IDENTITY 时，只有 manifest 指定并由 parser 识别的模块级 revision 元数据才可使用 `revision:<normalized-time>`，取合法日期最大值并保留全部原始项。多个 MODULE-IDENTITY、非法/重复冲突日期、LAST-UPDATED 与 REVISION 不一致都生成阻断冲突；没有任何可用 revision 元数据时使用 `undated:<contentSha256>`。不得用采集时间、文件 mtime 或抓取顺序推断 revision。

### `mib_module_artifact`

字段：`moduleArtifactId`、`acquisitionId`、`licenseReviewAtIngestRef`、`sourceRangeIdentityHash`、`artifactContentSha256`、`sourceRange`。它表示固定到一次 acquisition 的确切半开字节范围、经许可审核后的不可变 source bytes，不保存 parser 字段或预先猜测 module/revision。顶层 `acquisitionId` 必须等于 sourceRange 内的 acquisitionId；`sourceRangeIdentityHash` 必须按本字典重算一致；`artifactContentSha256` 必须等于原 acquisition bytes 的 `[byteStart, byteEnd)` 切片哈希；整文件 artifact 使用 `[0, contentBytes)`。`licenseReviewAtIngestRef` 仅证明当时准入，不能证明当前仍可发布；snapshot 必须重新解析 acquisition 的 effective review。parse result 将 artifact 关联到 revision；相同 revision、相同 artifact hash 的不同 acquisition/range 是独立 provenance artifact，不构成 drift，出现不同 artifact hash 时才产生阻断 conflict。

### `module_parse_result`

字段：`moduleParseResultId`、`moduleArtifactId`、`parseRunId`、`moduleRevisionId`、`languageDialect`、`moduleIdentitySymbolRef`、`lastUpdatedRaw`、`lastUpdatedParsed`、`revisions[]`、`organizationRaw`、`contactInfoPolicy`、`descriptionRawRef`、`importRecords[]`、`symbolDefinitionIds[]`、`semanticOutputSha256`、`parseEligible`。

`parseEligible` 只由本次不可变解析结果内生计算：必须 strict、parse run succeeded、Schema 合法、所有本次引用与 IMPORT 已解析且没有未分类 diagnostics；不读取未来 artifact、许可、runtime approval、裁决或展示政策。最终 publishability 不存入 parsed record，而由 snapshot validator 根据当前 effective license/runtime reviews、完整 artifact/parser/OID conflicts 与 adjudication 集合重新计算。snapshot 选择 `moduleParseResultId`，从而同时固定 source artifact、解析出的 revision 与 parser/adapter 结果。

`lastUpdatedParsed` 与每个 revision 使用 `{value, precision, valid}`，只有源文本提供的精度可以保留。`contactInfoPolicy` 默认 `excluded-personal-data`；公开模型不得保存个人邮箱、电话或地址。原始 DESCRIPTION 可保存在许可允许的隔离 source 层，公开 parsed 投影只保留审核过的字段。

### `mib_import`

作为 `module_parse_result.importRecords[]` 的嵌入值，字段：`fromModuleNameExact`、`symbolsExact[]`、`sourceRange`、`resolvedModuleParseResultId`、`resolutionStatus`。`resolutionStatus` 仅 `resolved|missing|ambiguous|cycle`；非 resolved 状态使模块不可发布。原始顺序保留作证据，规范依赖集合按 module name 与 symbol 排序。

### `mib_symbol_definition`

所有定义的公共字段：`symbolDefinitionId`、`moduleParseResultId`、`symbolNameExact`、`definitionKind`、`sourceRange`、`oidKey|null`、`statusDialect|null`、`statusRaw|null`、`statusNormalized|null`、`descriptionRawRef`、`referenceRawRef`、`parseDiagnostics[]`。

`definitionKind` 至少支持 `module-identity|object-identity|object-type|notification-type|trap-type|textual-convention|object-group|notification-group|module-compliance|agent-capabilities|type-assignment|value-assignment`。未知 kind 不得被丢弃；parse run 必须失败或由新版 Schema 明确接纳。

STATUS 三字段必须全为 null 或全为非 null。普通 type/value assignment、SMIv1 TRAP-TYPE 及规范未定义 STATUS 的 kind 使用 null；要求 STATUS 的 kind 缺失时失败。`statusDialect` 非空时仅 `smiv1|smiv2`：SMIv1 只允许 `mandatory|optional|obsolete`，SMIv2 只允许 `current|deprecated|obsolete`，禁止跨 dialect 猜测映射。每个 `definitionKind × languageDialect` 的 required/not-applicable 矩阵必须进入 JSON Schema 与故障测试。

### `mib_object`

以 `symbolDefinitionId` 一对一扩展 symbol：`syntaxRaw`、`syntaxFamily`、`textualConventionRef`、`constraints`、`unitsRaw`、`accessDialect`、`accessRaw`、`accessNormalized`、`indexComponents[]`、`augmentsRef`、`defValRaw`。

`syntaxFamily` 使用版本化枚举，不可识别时为失败而不是 `string` 回退。`constraints` 只能使用版本化的 range/size/enumeration/bits 结构，不保存或执行表达式。`accessNormalized` 的联合枚举为 `not-accessible|accessible-for-notify|read-only|read-write|read-create|write-only`，同时保留 SMIv1 `ACCESS` 或 SMIv2 `MAX-ACCESS` 的 dialect 与 raw value。INDEX 顺序具有语义，元素包含 `position`、`symbolRef`、`implied`；引用必须唯一解析。`IMPLIED` 只能出现在 INDEX 最后一个元素，且解析后的基础类型必须是允许省略长度的可变长 OCTET STRING 或 OBJECT IDENTIFIER，固定长度或其他类型失败。AUGMENTS 与 INDEX 不得同时存在；AUGMENTS 目标必须唯一解析为 conceptual row，当前 row 继承目标的完整有序 INDEX 语义，目标不是 row、悬空或形成环时失败。

### `mib_notification`

扩展 symbol：`notificationDialect`、`enterpriseOidKey|null`、`genericTrap|null`、`specificTrap|null`、`memberSymbolRefs[]`。成员顺序保留；每个成员必须解析为允许出现在通知中的对象。SMIv1 TRAP-TYPE 与 SMIv2 NOTIFICATION-TYPE 不通过猜测互相改写。

### `oid_node` 与 `oid_binding`

`oid_node` 使用一个仅内部存在的虚拟根：`{oidKey:"", parentOidKey:null, arc:null, depth:0, virtual:true}`，不进入搜索或网页。真实顶层 `0`、`1`、`2` 是虚拟根的三个子节点、depth 为 1；其他节点 parent 必须存在，depth 等于 arc 数量，且 `oidKey == parentOidKey + "." + arc`（parent 为虚拟根时无前导点）。

`oid_binding` 只保存稳定事实：`oidBindingId`、`oidKey`、`symbolDefinitionId`、`bindingRole`。任一 OID 出现多个 binding 时默认是阻断 conflict，不区分 authority 或 revision。binding 不保存后写 adjudication 或展示 rank；裁决通过 `subjectRefs[]` 反向引用 binding，展示排序只存在带版本的 publication projection。只有不可变 adjudication 引用逐字段语义等价证据并明确决定 `approved-alias` 后，才能作为合法 alias；不等价、证据不足或未裁决均不可发布。

alias 的 `semanticFingerprint` 按 definition kind 计算，至少覆盖 kind、numeric OID、syntax family、textual convention target、constraints、units、access dialect/value、status dialect/value、INDEX/IMPLIED、AUGMENTS、DEFVAL、notification enterprise/trap/member 及所有 definition-specific 规范字段；symbol name、DESCRIPTION/REFERENCE 文本、source range、authority 和 provenance 不参与等价指纹。只有 fingerprint 完全相等且人工证据确认是别名时才可 `approved-alias`；不同 kind 或任一语义字段不同即不可作为 alias。

### `vendor` 与 `vendor_module_support`

`vendor` 只存 `vendorId`、`vendorAuthorityNamespace`、`vendorAuthorityIdentifier`、规范组织名、IANA PEN（如已验证）和官方来源。PEN 联系人/邮箱不进入模型。

`vendor_module_support` 字段：`vendorModuleSupportId`、`vendorId`、`moduleFamilyId`、`productFamilyExact`、`osFamilyExact`、`versionConstraintRaw`、`supportStatus`、`sourceLicenseReviewRef`、`sourceRange`、`reviewedAt`。ID 对除自身外的完整语义记录计算，因此 unknown/official、不同 review 或复核日期必为不同记录，禁止原地升级。只有厂商官方支持列表能产生 `official`；无法证明的关系为 `unknown`，禁止依据企业 OID 或模块名推断设备兼容性。

### `editorial_content_version`

字段：`editorialVersionId`、`editorialSeriesId`、`supersedesEditorialVersionId|null`、`subjectType`、`subjectId`、`locale`、`title`、`directAnswer`、`engineeringMeaning`、`collectionExample`、`limitations[]`、`sourceRefs[]`、`searchIntent`、`longTailQuestions[]`、`owner`、`reviewedAt`、`status`、`contentSha256`。

`editorialSeriesId` 是 `editorialseries-` 加 `{subjectType, subjectId, locale}` RFC 8785 JCS bytes 的完整 SHA-256。每个 series 恰有一个 root，后续版本只能 supersede 当前唯一 head；多个 root/leaf、跨 series、环、断链或缺失均失败。`status` 仅 `draft|reviewed|approved|withdrawn`，snapshot 只能引用唯一 effective head 且其 status 必须为 approved；旧 approved 被 supersede 或 withdrawn 后不得进入新 snapshot。不得在 editorial 层保存替代数字 OID、syntax、access、status、INDEX 或 revision 的字段。SNMP 示例不得包含真实 community、用户名、地址或凭据；默认使用文档保留地址和占位 secret。

### `adjudication_record`

字段：`adjudicationId`、`adjudicationScopeId`、`subjectRefs[]`、`issueType`、`observations[]`、`decision`、`rationale`、`evidenceRefs[]`、`reviewer`、`reviewedAt`、`supersedes|null`、`recordSha256`。`adjudicationScopeId` 是 `adjudicationscope-` 加 `{issueType, subjectRefs}` RFC 8785 JCS bytes 的完整 SHA-256，其中 `subjectRefs` 按 `{targetType, targetId}` 排序并去重。每个 scope 恰有一个 root，后续裁决只能 supersede 当前唯一 head；多个 root/leaf、跨 scope、环、断链或缺失均失败。`decision` 的基线枚举为 `approved|approved-alias|selected|rejected|withdrawn`，各 `issueType` 必须由 Schema 收窄允许值。记录不可修改，snapshot 只能引用每个所需 scope 的唯一 effective head，且有效决定必须为该 issue type 的批准/选择类；被 supersede 或 withdrawn/rejected 的旧裁决不得进入新 snapshot。裁决不能把许可 rejected/unknown 改成 approved，也不能修改原始解析事实。

### `publication_snapshot`

字段封闭为：`snapshotId`、`schemaVersion`、`sourceCommitAlgorithm`、`createdFromCommit`、`moduleParseResultIds[]`、`effectiveLicenseReviewIds[]`、`effectiveRuntimeApprovalIds[]`、`vendorModuleSupportIds[]`、`adjudicationIds[]`、`editorialVersionIds[]`、`aliasDisplayPolicyVersion`、`aliasSelections[]`、`generatorVersion`、`validationResult`、`manifestSha256`；不得包含其他运行元数据。所有成员/head ID 数组按完整 ID 排序并去重；`aliasSelections[]` 按唯一 `oidKey` 升序排列，每项引用 effective approved adjudication，内部 binding IDs 按该 snapshot 固定的展示政策有序且不得重复。每个选中 artifact acquisition 和 parse run runtime scope 必须分别恰好映射到数组中的一个 effective head，不得有多余 head。每个 `moduleFamilyId` 必须选择且仅选择一个 `moduleRevisionId/moduleParseResultId`，并递归包含该结果精确引用的完整 IMPORT parse-result 闭包；同一逻辑 revision 也只能选择一个获批 parse result。`validationResult` 只能是 `releasable`，且由 validator 在固定的所有 effective license/runtime heads approved、strict parse succeeded、parser/artifact/OID 冲突已由 effective 裁决解决、vendor support 当前许可有效、editorial effective head approved 时写入；任一条件失败就不生成 snapshot。

`sourceCommitAlgorithm` 只能是仓库实际使用的 `sha1|sha256`，`createdFromCommit` 必须是相应长度的完整小写 Git commit object ID，且只能指向 snapshot 生成开始前已经存在并作为全部生成输入的提交。它不得指向包含该 snapshot 文件的提交，也不得在生成后回填，因此不存在 commit ↔ snapshot 自引用。

snapshot 的 `releasable` 只表示生成时通过，不是永久激活权。生成、部署、生产激活、回滚和每次构建公开索引时，都必须重新解析 license/runtime supersession 图，确认 snapshot 固定的每个 head 仍是其 scope 唯一 effective approved head；不得用 snapshot 内的旧 `validationResult` 代替检查。任一 head 被 supersede、withdrawn/rejected、分叉、缺失或 hash 失配时，snapshot 立即只能作为历史审计对象，禁止继续部署或服务；受影响 Page Family 执行 `noindex|gone|same-locale redirect`，并从 sitemap、搜索索引、service worker 和 precache 清单移除。回滚只能选择当前重新验证通过的旧 snapshot，runtime withdrawal 与 license withdrawal 使用相同下线门禁。

## 跨实体不变量

1. 任一公开字段必须沿 `snapshot → entity → parseRun/effective runtime approval/effective license review → acquisition hash` 回溯；断链即失败。
2. source、parsed、adjudication、editorial 记录不可原地修改；撤销通过新记录和新 snapshot 表达。
3. module name、symbol name、OID、revision、syntax、access、status、INDEX、notification member 不得由 AI 或 editorial 生成、修复或覆盖。
4. unresolved import、未分类 diagnostic、relaxed-only 结果、OID 结构错误、悬空引用、未裁决冲突、许可非 approved 均不可发布。
5. 每个 acquisition 的许可 reviews 形成不可变单链：新 review 必须 `supersedesReviewId` 指向当前唯一 head 且 scope/acquisition 相同；无 head、多个 leaf、跨 acquisition、环或断链均失败。effective decision 是唯一 leaf 的 decision；withdrawn/rejected leaf 立即使所有引用该 acquisition 的新 snapshot 失败，并从后续 snapshot 排除对应实体。受影响 Page Family 交给 Page Registry 的 `noindex|gone|same-locale redirect` 流程；历史审计记录保留但不公开原文。
6. adjudication 与 editorial 各自按稳定 scope/series 形成单链；新 snapshot 只接受唯一 effective head，禁止回选被 supersede 的历史 approved 记录。

## 确定性序列化

规范对象先按 Schema 对每个字符串执行 Unicode NFC，并拒绝 lone surrogate；可选字段由 Schema 明确规定“必须出现且为 null”或“必须省略”，禁止两种形式混用，禁止 `undefined`、NaN、Infinity 和负零。随后严格采用 RFC 8785 JSON Canonicalization Scheme（JCS）：无无关空白、无末尾换行、属性按 JCS UTF-16 code unit 规则排序、字符串与数字按 JCS/ECMAScript 规则序列化；`/` 不额外转义，非 ASCII 保持 JCS 形式。业务大整数、decimal 和 OID arc 必须在进入 JCS 前转成 Schema 规定的规范十进制字符串。集合数组按本字典指定 key 排序，INDEX、revision history、notification members 等有语义顺序的数组保留 position。规范产物禁止绝对路径、当前时间、随机 ID、宿主名称和未排序 diagnostics；Golden 必须比较明确的期望 UTF-8 bytes 与 SHA-256，而不只比较解析后的对象。

搜索索引只复制 snapshot 中获批字段，并保存 `snapshotId` 与源实体 ID。索引命中不能证明兼容性、许可或正确性；页面读取索引后仍必须能定位规范实体和来源链。

## 数据字典验收门禁

1. 为所有实体建立 JSON Schema 后，加入未知字段、断链、ID 碰撞、OID 边界、alias/conflict、IMPORT、INDEX/AUGMENTS、许可撤回和 editorial 越权故障测试。
2. 同一 Fixture 两次生成字节完全一致；输入文件顺序变化不改变 snapshot manifest。
3. 至少一个合法 alias 与一个冲突重复 OID 样例，证明系统不会静默覆盖。
4. 威胁模型必须覆盖供应链、解析器、资源耗尽、内容注入、隐私、发布与删除链路；通过前不得实现 Schema 或 Adapter。
