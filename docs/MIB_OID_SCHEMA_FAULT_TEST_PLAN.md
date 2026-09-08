# MIB/OID 来源记录 Schema 与故障测试设计

状态：`LOCAL PASS（设计完成；未生成真实记录）`  
设计日期：2026-09-08  
前置条件：候选来源审核与首选 8 个来源记录清单均已 `VALIDATOR PASS`。

## 设计边界

本批只定义四类来源记录的 JSON Schema 约束、跨记录不变量和失败关闭测试。Schema 不包含任何真实 URL 响应、内容哈希、许可结论或 MIB 字节；测试只使用本地最小合成 JSON，禁止网络读取、MIB 下载、解析器运行和公开页面生成。

## Schema 契约

所有记录使用 `source-ledger/1.0.0`，顶层 `additionalProperties=false`，字符串先做 Unicode NFC，随后按 RFC 8785 JCS 规范化。所有哈希为 64 位小写 SHA-256；所有 ID 必须由对应的完整记录哈希重算。

| 记录 | 必填身份字段 | 关键业务字段 | 哈希 preimage 删除字段 |
|---|---|---|---|
| Source | `schemaVersion`、`sourceId`、`sourceKey`、`recordHash` | authority namespace/base URLs、policy class、evidence URLs、handling rule | `sourceId`、`recordHash` |
| Preauthorization | `schemaVersion`、`preauthorizationId`、`recordHash`、`sourceId` | requested URL、document ID、allowed action、policy snapshot/evidence、reviewer、approvedAt | `preauthorizationId`、`recordHash` |
| Acquisition | `schemaVersion`、`acquisitionId`、`recordHash`、`preauthorizationId`、`sourceId` | final URL、network hops、status、content type/encoding/framing、bytes、content SHA-256 | `acquisitionId`、`recordHash` |
| Redistribution review | `schemaVersion`、`reviewId`、`recordHash`、`acquisitionId`、`sourceId` | scope、supersedes、document/stream/date、TLP evidence、copyright/legend、Pre-5378、decision | `reviewId`、`recordHash` |

## 跨记录不变量

1. Source 必须先存在且是当前唯一 source record；后续三类记录的 `sourceId` 必须逐字节相同。
2. Preauthorization 的 URL 必须精确匹配请求目标；Acquisition 第一跳的 preauthorization ID 必须等于顶层 ID。
3. Acquisition 的 hops 从 1 连续递增；最终 URL、状态、framing、长度和实体哈希必须相互一致。
4. 每个 `{acquisitionId, reviewScope}` 只有一个 `supersedesReviewId=null` 的 root；后续 review 只能指向同一 acquisition/source/scope，当前有效 leaf 必须唯一。
5. `redistributionDecision` 只有 `pending|approved|rejected|withdrawn`；只有唯一有效 leaf 为 `approved` 且许可字段全部已知时才可进入 snapshot。
6. 任一 Schema 校验失败、哈希重算失败、ID 链断裂、数组未排序或未知字段出现，流水线必须失败关闭并拒绝后续记录。

## 故障测试矩阵

| 编号 | 注入故障 | 预期结果 |
|---:|---|---|
| F-01 | 缺少必填 `schemaVersion` | Schema 拒绝，不能生成 ID |
| F-02 | 增加未知字段 | `additionalProperties=false` 拒绝 |
| F-03 | `recordHash` 大小写错误或长度不足 | 哈希格式/重算失败 |
| F-04 | ID 使用截断哈希 | ID 与重算值不一致，失败关闭 |
| F-05 | source 与 preauthorization 的 `sourceId` 不同 | 链路断裂，拒绝 acquisition |
| F-06 | requested URL 与第一跳 request URL 不同 | 预授权精确匹配失败 |
| F-07 | hops 从 0 开始、跳号或重复 | 网络链顺序校验失败 |
| F-08 | 同时出现 Transfer-Encoding 与 Content-Length | framing 失败关闭 |
| F-09 | 实收字节数与 declared/content SHA-256 不一致 | acquisition 无效并删除 staging |
| F-10 | review 跨 acquisition/source/scope 引用或形成环 | effective-head 计算失败 |
| F-11 | 同一 scope 出现两个 root 或两个有效 leaf | review 链不唯一，禁止发布 |
| F-12 | decision 为 `approved` 但 legend/TLP/Pre-5378 为 unknown | 许可门禁失败，保持不可发布 |
| F-13 | Unicode 未 NFC 或数组未按 Schema key 排序 | JCS preimage 不稳定，哈希校验失败 |
| F-14 | decision 为 `pending/rejected/withdrawn` 仍尝试进入 snapshot | snapshot 准入失败 |

## 验收标准

- 四类记录的必填字段、枚举、哈希删除字段和跨记录不变量与来源台账及清单一致。
- F-01 至 F-14 每个故障均有唯一失败原因，不能通过降级、忽略字段或自动改写绕过。
- 设计文档本身不产生真实 source/acquisition/review 记录，不引入 MIB 字节、解析器、Schema 文件、Adapter、Fixture、索引或公开路由。
- 独立审计通过后，下一批才可把这份设计转成机器可执行 JSON Schema 和纯本地故障测试；仍需先完成逐文件许可记录，才允许任何网络 acquisition。
