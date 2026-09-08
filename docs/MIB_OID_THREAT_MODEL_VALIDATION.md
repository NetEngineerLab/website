# MIB/OID Explorer 精简 V1 威胁模型验证记录

日期：2026-09-07
状态：`VALIDATOR PASS`（独立审计通过；尚未授权采集或公开）
适用范围：`docs/MIB_OID_THREAT_MODEL.md` 1.0.0、`docs/MIB_OID_DATA_DICTIONARY.md`、`docs/MIB_OID_SOURCE_LICENSE_LEDGER.md`、`docs/MIB_OID_PARSER_DEPLOYMENT_ADR.md`

## 验证结果

本轮只做文档和仓库边界验证，不进行网络采集，不安装解析器，不生成 MIB 产物，不修改 `website/`。

| 编号 | 检查 | 结果 |
|---|---|---|
| V-01 | source → acquisition → byte range → artifact → parse result → revision 身份链无环 | PASS |
| V-02 | license/runtime/editorial/adjudication 使用 effective-head，撤回后不能回选旧 head | PASS |
| V-03 | 解析器固定版本、依赖、镜像、SBOM、approval 的顺序与 ADR 一致 | PASS |
| V-04 | 无网络、只读输入、非 root、资源上限、超时和原子输出边界一致 | PASS |
| V-05 | strict-only 发布、IMPORT 闭包、OID 冲突、编码、canonicalization 和确定性输出边界一致 | PASS |
| V-06 | source/parsed/editorial 分层、XSS 编码、联系人和路径隐私边界一致 | PASS |
| V-07 | Page Registry、SEO、Service Worker、no-store、Cloudflare edge gate 和撤回状态机一致 | PASS |
| V-08 | 实现前阻断仍生效：不得创建 Schema/Adapter、parser lock、MIB acquisition 或公开页面 | PASS |

## 证据与限制

- 威胁模型包含 22 个 `BLOCKER`/`HIGH` 条目，每项都有控制要求和最小故障验证证据。
- 当前仓库没有 MIB 数据、解析器镜像、输入锁、Schema、Adapter 或 MIB 页面；因此本记录不能替代后续实现阶段的故障注入测试。
- 独立审计 Agent 已复核威胁条目、六份规范文档、工作树和本记录，并确认没有 P1/P2 阻断；本结论不替代后续来源许可和解析器门禁。

## 下一步

下一步先审核 10 个候选来源并选出 8 个许可 approved 且 IMPORT 闭合的集合，再进入 JSON Schema/故障测试和 parser build-input lock；在这些门禁完成前不允许采集或公开 MIB。
