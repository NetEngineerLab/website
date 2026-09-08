# 首选 8 个 RFC 的许可证据矩阵

状态：`LOCAL PASS（官方证据矩阵；未生成 acquisition/review）`  
审核日期：2026-09-09  
适用范围：MIB/OID Explorer 精简 V1；本文件不是法律意见。

## 证据边界

本矩阵只记录 RFC Editor 与 IETF Trust 的公开政策证据，不读取或复制 RFC 中的 MIB 正文，不生成内容哈希，不作最终 redistribution `approved` 决定。IETF Trust 页面明确：代码组件使用适用发布日期的法律条款；2008-11-10 前的文档仍受当时政策约束，不能用当前 TLP 追溯替代。代码组件列表包含 MIB modules，但每个文件仍须核对限制性 legend、Pre-5378 状态和完整版权声明。

## 逐文件证据入口

| 模块 | RFC 发布月份 | 官方 RFC | 官方身份/许可证据 | 适用政策线索 | 当前决定 |
|---|---|---|---|---|---|
| `SNMPv2-SMI` | 1999-04 | [RFC 2578](https://www.rfc-editor.org/rfc/rfc2578.html) | RFC Editor 文档页与版权声明；IETF Trust 历史 TLP 需按 pre-existing 规则匹配 | RFC 2026/3978 等历史政策路径待 source record 固化 | `PENDING_RECORD` |
| `SNMPv2-TC` | 1999-04 | [RFC 2579](https://www.rfc-editor.org/rfc/rfc2579.html) | RFC Editor 文档页与版权声明 | 同上；不得直接套用 TLP 5.0 | `PENDING_RECORD` |
| `SNMPv2-CONF` | 1999-04 | [RFC 2580](https://www.rfc-editor.org/rfc/rfc2580.html) | RFC Editor 文档页与版权声明 | 同上；逐文件核对代码组件范围 | `PENDING_RECORD` |
| `SNMPv2-MIB` | 2002-12 | [RFC 3418](https://www.rfc-editor.org/rfc/rfc3418.html) | RFC Editor 文档页、IETF stream 和模块版权声明 | 2008-11-10 前文档，须保留历史许可与 Pre-5378 判断 | `PENDING_RECORD` |
| `SNMP-FRAMEWORK-MIB` | 2002-12 | [RFC 3411](https://www.rfc-editor.org/rfc/rfc3411.html) | RFC Editor 文档页、IETF stream 和模块/架构版权声明 | 同上；模块代码与正文许可范围分开记录 | `PENDING_RECORD` |
| `INET-ADDRESS-MIB` | 2005-02 | [RFC 4001](https://www.rfc-editor.org/rfc/rfc4001.html) | RFC Editor 文档页、SMIv2 textual convention 模块和版权声明 | 2005-03 至 2008-11 的 Code Component 历史政策路径需核对 | `PENDING_RECORD` |
| `TCP-MIB` | 2005-03 | [RFC 4022](https://www.rfc-editor.org/rfc/rfc4022.html) | RFC Editor 文档页、MIB 模块、SMIv2 依赖和 Full Copyright Statement | 2005-03 至 2008-11 的 Code Component 历史政策路径需核对 | `PENDING_RECORD` |
| `UDP-MIB` | 2005-06 | [RFC 4113](https://www.rfc-editor.org/rfc/rfc4113.html) | RFC Editor 文档页、模块 DESCRIPTION 中的 RFC 4113 版权提示 | 2005-03 至 2008-11 的 Code Component 历史政策路径需核对 | `PENDING_RECORD` |

## 政策证据

- [IETF Trust TLP archive](https://trustee.ietf.org/documents/trust-legal-provisions/) 列出历史 Code Components 1.0、2.0、3.0 的生效与替换日期；source record 必须按 RFC 发布日期选择，而不是引用当前页面版本。
- [IETF Trust TLP 5.0](https://trustee.ietf.org/documents/trust-legal-provisions/tlp-5/) 明确 pre-existing IETF Documents 继续适用发布时有效的版权政策，并说明代码组件的 Revised BSD 条款和 Pre-5378 限制。
- [IETF Trust FAQ](https://trustee.ietf.org/documents/trust-legal-provisions/copyright-policy-and-tlp-faq/) 说明 2005-03 至 2008-11 发布的 IETF 文档代码组件适用当时的代码许可路径，也说明 Pre-5378 material 需要单独判断。

## 进入 source record 的待核字段

每个模块仍需在实际 acquisition 后逐项写入：`documentStream`、`publicationDate` 精度、适用 TLP 文件及 SHA-256、完整 copyright notice、restriction legend、Pre-5378 状态、source/acquisition/review 链、IMPORTS 闭合、内容 SHA-256、责任审核人和 `redistributionDecision`。任一字段未知时保持 `PENDING_RECORD`，不得进入 parser lock、Fixture 或公开 snapshot。
