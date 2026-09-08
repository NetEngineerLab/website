# MIB/OID parser build-input lock 设计

状态：`LOCAL PASS（设计完成；尚未生成真实 lock）`  
设计日期：2026-09-08  
前置条件：来源记录 Schema 与 F-01 至 F-14 故障执行器均已 `VALIDATOR PASS`。

## 目标

把解析器构建输入固定为可审计的 8 个来源记录和有限运行时依赖。lock 只允许引用已通过逐文件 redistribution review 的 acquisition；没有真实 source/acquisition/review 时不得生成 lock 文件。

## Lock 内容

未来的 `parser-build-input/1.0.0` 必须包含固定 allowlist 和以下字段。allowlist 只能是这 8 个模块，禁止用 IF-MIB、IANAifType-MIB 或其他候选替换：

`SNMPv2-SMI`、`SNMPv2-TC`、`SNMPv2-CONF`、`SNMPv2-MIB`、`INET-ADDRESS-MIB`、`TCP-MIB`、`UDP-MIB`、`SNMP-FRAMEWORK-MIB`。

字段要求：

- `schemaVersion`、`lockId`、`createdAt`、`createdBy`、`sourceSnapshotId`。
- 首选 8 个模块的有序条目：`moduleName`、`documentId`、`sourceId`、`acquisitionId`、`reviewId`、`contentSha256`、`contentBytes`、`importNames[]`。
- 解析器运行时：`runtimeApprovalId`、`runtimeImageDigest`、`provenanceSha256`、`sbomSha256`、固定包名/版本、完整依赖树哈希、Node 版本、OS/架构、资源限制、网络开关和临时目录策略。
- `goldenFixturePolicy`：只允许人工构造的最小失败样例和已批准的标准模块输入；每个 Fixture 绑定来源、解析器版本和测试期望。
- `lockHash`：删除 `lockId`、`createdAt` 和 `lockHash` 后执行 NFC + RFC 8785 JCS + SHA-256；任何字段变化必须生成新 lock。

## 构建前门禁

1. 8 个模块的 source、preauthorization、acquisition、review 链均存在且 ID 逐字节一致。
2. 每个 review 的 effective head 唯一且 `redistributionDecision=approved`；`pending/rejected/withdrawn` 立即失败关闭。
3. acquisition 的 content SHA-256、字节数、最终 URL、HTTP framing 和响应头证据可重算；解析器只读隔离 staging。
4. 运行时依赖来自锁定包管理器清单，网络访问开关为关闭；解析器不得自动 borrowing、远程 IMPORT 或读取工作区外文件。
5. `runtimeApprovalId` 必须指向唯一有效的 runtime approval effective-head；approval 必须绑定 `runtimeImageDigest`、`provenanceSha256`、`sbomSha256`，并在构建、部署、激活、回滚前重新检查未撤回。
6. 资源限制固定：输入总大小、模块数、IMPORT 深度、AST 节点数、CPU 时间、内存、输出字节和临时目录容量；任一超限清理输出并失败关闭。

## 确定性与回滚

- 同一 lock 在相同运行时必须产生 byte-identical parse result、OID tree、IMPORT graph 和错误位置；时间、随机数、机器路径和环境变量不得进入结果。
- lock 变更、parser 版本变更、运行时 provenance/SBOM/image digest 变更、runtime approval 撤回或任一来源 review 撤回，都必须创建新 lock 并使旧 lock 失效；旧结果保留审计但不得继续发布。
- 构建、部署、激活、回滚和索引生成阶段都重新验证 lock hash、source/review effective head 和 runtime provenance，不能只信构建产物内的准入标记。

## 当前禁止动作

本设计阶段不生成真实 lock、不执行网络 acquisition、不安装或运行 parser、不写入 MIB 字节、不生成 Golden Fixture、索引、Schema/Adapter 或公开页面。只有首选 8 个逐文件 review 全部 `approved`，并经独立审计确认后，才可把本设计转成机器可执行 lock Schema 和 runtime approval 测试。
