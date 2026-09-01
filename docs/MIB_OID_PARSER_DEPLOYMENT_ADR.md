# ADR — MIB/OID 解析器与原型部署边界

状态：`PROPOSED — IMPLEMENTATION BLOCKED UNTIL LOCK MANIFESTS EXIST`  
日期：2026-09-02  
依赖门禁：`docs/MIB_OID_SOURCE_LICENSE_LEDGER.md`

## 决策

Phase 0 选择 `pysmi==2.0.0` 作为主解析器候选，在固定哈希、无网络、只读输入、受限 OCI 容器中评估；选择 Net-SNMP `snmptranslate` 作为独立交叉验证器候选，不作为规范数据生成器。

V1 标准 MIB 原型采用构建时离线解析、确定性规范化 JSON、静态分片索引与客户端精确搜索。当前不引入在线解析 API、PostgreSQL、Meilisearch 或 Elasticsearch，也不允许用户上传。该决策不授权导入任何 MIB；输入必须先通过来源许可台账的三阶段审核。

## 官方证据快照

| 候选 | 证据 | 结论 |
|---|---|---|
| PySMI 2.0.0 | [PyPI 项目页](https://pypi.org/project/pysmi/) 显示 2026-04-26 发布、Python >=3.10、BSD-2-Clause、SMIv1/SMIv2/JSON；wheel SHA-256 为 `b5f11cbfa303a325eaaa5e00f9d76aadb63b12c35b2297bde5c4978e9ca06a52` | 进入隔离原型；PyPI 显示该构件未使用 Trusted Publishing，所以必须同时固定版本、文件 URL 和 SHA-256，禁止范围版本 |
| PySMI 远程 source/borrowing | [PySMI 文档](https://docs.lextudio.com/pysmi/) 说明解析失败时可从配置源 borrowing，且公共 MIB 档案不保证一致性或可靠性 | 全部禁用；只允许读取预先审核并挂载的本地文件 |
| Net-SNMP | [Net-SNMP 官方下载页](https://www.net-snmp.org/download/) 提供受支持发布与签名密钥；[官方 snmptranslate 手册](https://www.net-snmp.org/docs/man/snmptranslate.html) 定义数字/符号 OID、详情和 tree 输出及 `-m`/`-M` MIB 范围参数 | 仅作第二实现交叉检查；具体版本、平台构件、许可证与完整哈希在 lock manifest 前保持阻断，输出不能直接入库 |

正式安装前必须重新核对 PyPI 文件哈希和 BSD-2-Clause LICENSE；哈希不一致、构件撤回或上游所有权异常时阻断。不得使用 `pysmi-lextudio` 旧包名替代，也不得自动升级到 2.x 后续版本。

只锁 PySMI wheel 不构成可安装状态。PySMI 2.0.0 声明的开放范围运行依赖至少包括 `Jinja2>=3.1.3`、`lark>=1.1.9` 和 `requests>=2.26.0`，还会形成 MarkupSafe、certifi、charset-normalizer、idna、urllib3 等传递闭包。实现采用无循环的四阶段供应链：

1. `parser-build-inputs.lock.json`：Python 实现/版本、OCI 基础镜像 repository digest、Dockerfile SHA-256、每个直接与传递 wheel 的精确版本/URL/SHA-256/license/dependency edge，以及 Net-SNMP 精确 source URL/签名或 SHA-256/构建选项/运行库许可证。
2. 仅凭已验证的输入锁与本地 wheelhouse/source cache 执行无网络离线构建；Python 安装强制 `--no-index`、`--require-hashes` 和完整闭包。此阶段允许创建“候选镜像”，但禁止运行 MIB 解析。
3. 构建后生成 `parser-runtime.provenance.json`：候选镜像 repository digest、目标 OS/architecture、完整 SBOM 及其 SHA-256、构建日志 SHA-256、输入锁 SHA-256、工具版本和许可证集合。
4. 独立验证者从输入锁复建或核对镜像/SBOM/许可证；通过后签发引用 provenance hash 的 immutable approval。只有获得 approval 的镜像 digest 才能运行解析作业。

任一范围依赖、平台包漂移、未哈希文件、镜像 tag（无 digest）、未知许可证或 lock/provenance 与实物不一致都必须阻断。本文不伪造尚未选择的依赖版本或镜像 digest；输入锁验证前不得构建，provenance approval 前不得运行解析。

## 为什么不是其他方案

- 从零实现 ASN.1/SMIv1/SMIv2：拒绝。语法、方言、IMPORTS 和错误恢复复杂，风险与产品价值不匹配。
- Net-SNMP 作为主解析器：暂不采用。它有原生动态依赖、平台差异和面向 SNMP 工具链的输出；适合作为差异检测，而不是唯一事实生成器。
- 直接使用 PySMI 公共 MIB 档案：拒绝。上游明确不保证档案一致性或可靠性，且档案内每个文件的再分发许可未统一证明。
- 在线 API + 数据库：Phase 0/V1 原型拒绝。当前语料规模可静态生成，在线服务会提前增加认证、滥用、备份、成本和运维面。

## 隔离执行契约

解析作业只能在 approval 指定 digest 且具备 OCI/Docker 的 CI 或发布环境运行；本机没有兼容运行时不得以非隔离模式降级。等价 Docker 参数基线为：`--network none --read-only --user 65532:65532 --cap-drop ALL --security-opt no-new-privileges --cpus 1.0 --memory 512m --memory-swap 512m --pids-limit 64 --tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m`。不得挂载 Docker socket、仓库凭据、Git 配置、SSH、用户目录或生产部署令牌。

宿主先把审核通过的内容按字节复制到新建的私有 staging 目录：源和目标都用不跟随链接的方式打开，源必须是 regular file；目标以 exclusive create 写入，文件名来自 manifest 的安全 ID 而非源路径。复制后要求目标 link count 为 1、逐文件 SHA-256 与 manifest 相等，再把文件设为 0444、目录设为只读，最后以 Docker `readonly` bind 挂载到 `/input`。容器启动后在解析前再次检查 `/input` realpath、regular file、link count、文件数、字节数和 SHA-256；任一变化即失败。解析命令只能按 manifest 打开数据，禁止执行输入路径。

初始硬限制如下，任何超限均生成确定性失败记录，禁止部分成功冒充完整结果：

| 限制 | Phase 0 值 |
|---|---:|
| 单文件原始大小 | 1 MiB |
| 单批文件数 / 总原始大小 | 32 / 8 MiB |
| IMPORT 递归深度 | 32 |
| 单模块 AST 节点 | 250,000 |
| 单 DESCRIPTION UTF-8 长度 | 64 KiB |
| 数字 OID 子标识层级 | 128 |
| 单模块 / 单批 wall time | 10 s / 60 s |
| 容器内存 / PID | 512 MiB / 64 |
| CPU quota / tmpfs | 1.0 CPU / 64 MiB，swap disabled |
| 单批规范化 stdout / stderr | 16 MiB / 1 MiB |

宿主 Node orchestrator 是 wall-time watchdog：每个模块启动独立 worker，10 秒发 TERM，2 秒宽限后发 KILL；整批 60 秒执行相同 TERM/KILL 流程。容器协议规定 stdout 只能包含一个 UTF-8 canonical JSON 产物，日志只能写 stderr。宿主逐 chunk 计数，在写入私有 exclusive-create 临时文件前检查累计 stdout 是否超过 16 MiB、stderr 是否超过 1 MiB；将超限 chunk 写盘前即 TERM/KILL。只有退出码 0、stdout 完整 UTF-8/JSON/Schema/结构/哈希验证和 stderr 分类全部通过后，宿主才以原子 rename 发布临时产物。任何终止或验证失败都销毁容器并删除临时文件，禁止保留部分输出。

失败记录拆成两层：参与 Golden/hash 比较的 canonical failure facts 只含排序后的 error code、limit name、observed class、input hash、parser/runtime version 与 diagnostics hash，不含时间；audit envelope 单独记录 startedAt/endedAt、exit code、signal、timedOut、oomKilled、stdout/stderr SHA-256 和 cleanup result，不参与确定性比较。容器运行时负责 memory、CPU、PID、swap 和 tmpfs 最终边界。被 kill、OOM、timeout、异常退出、stderr 含未分类错误或依赖未闭包都视为失败。

两种解析器环境统一固定 `LANG=C.UTF-8`、`LC_ALL=C.UTF-8`、`TZ=UTC`、`PYTHONUTF8=1`、`PYTHONHASHSEED=0`，输入仅接受 UTF-8 或 manifest 明示且可确定转换的编码。Net-SNMP 必须使用 `-C` 禁止默认配置、`-M` 指向唯一只读 Fixture 目录、`-m` 列出 manifest 依赖闭包，并清空/覆盖 `MIBDIRS`、`MIBS`、`SNMPCONFPATH` 与隔离 HOME；禁止读取系统 MIB 和用户配置。

## 解析模式

1. 默认只运行 canonical SMIv1 或 SMIv2 严格语法，方言由 Fixture manifest 明确指定并经模块内容验证，禁止运行时猜测后静默切换。
2. 严格解析失败时只记录 diagnostics，不自动 borrowing，不联网，不自动切换 relaxed。
3. relaxed 模式只能由 Fixture manifest 显式允许，结果永久标记 `parseMode: relaxed` 和 `publishable: false`；人工审核只能追加引用该结果哈希的不可变 adjudication record，禁止原地翻转或改写解析结果。
4. 未解析 IMPORT、重复 symbol/OID、OID 环、冲突 revision、非法 access/status、未知语法和截断输入必须失败关闭，不得丢弃后继续发布。

## 规范输出边界

PySMI AST/JSON 是解析器证据，不是公开 Schema。Adapter 只能把已解析事实映射为版本化内部 IR，至少分离：

- `sourceFacts`：来源、许可 review ID、输入 SHA-256、模块名、原始 revision、原始字段及位置。
- `parsedFacts`：规范数字 OID、syntax、access、status、INDEX、units、imports、notifications、父子关系和 parser diagnostics。
- `editorialContent`：中英文工程解释、示例和场景；不得覆盖 source/parsed facts。

所有数组排序、日期精度、Unicode normalization、数字字符串和 null 语义必须在 Adapter 契约中固定。输出不得包含采集机器绝对路径、当前时间、随机 ID 或非确定性遍历顺序。

## Golden Fixture 契约

每个成功 Fixture 必须绑定：许可 review ID、输入 SHA-256、解析器包与 wheel SHA-256、parse mode、依赖闭包、期望 diagnostics、规范 JSON 和规范 JSON SHA-256。每个失败 Fixture 必须是自行构造的最小文本，并声明唯一主要失败原因。

门禁至少覆盖 SMIv1、SMIv2、MODULE-IDENTITY、OBJECT-TYPE、TEXTUAL-CONVENTION、MODULE-COMPLIANCE、NOTIFICATION-TYPE、表与 INDEX、Counter64、IMPORT 闭包、重复 OID、循环依赖、截断、编码异常和全部资源上限。相同输入连续运行两次的字节输出必须一致；输入顺序改变不得改变规范结果。

主解析器与交叉验证器至少比较 module name、numeric OID、syntax family、access/status、INDEX 和 notification members。差异不采用“多数票”，而是进入人工 adjudication；未裁决对象不可公开。

## 静态部署边界

原型只生成内部测试产物，不进入 `website/`。V1 发布前另开 ADR 决定公开 Schema、URL 和索引分片。满足以下任一条件时重新评估 API/PostgreSQL/专用搜索，不自动迁移：

- 已审核模块超过 10,000 或对象超过 500,000；
- 压缩静态索引超过 25 MiB；
- 确定性全量构建超过 10 分钟；
- 基准设备上客户端查询 P95 超过 150 ms；
- 增量更新、关系查询或运营审核无法用静态构建可靠完成。

即使触发阈值，也必须通过新 ADR、成本/备份/迁移/回滚和 Cloudflare 兼容性评估；不得在前端直接暴露数据库。

## 实施前门禁

1. 2 号验证官确认本 ADR 的依赖、供应链、隔离、失败关闭和确定性边界。
2. 完成 build-input lock、离线候选构建、runtime provenance/SBOM 与独立 approval 四阶段；仅有 PySMI 主 wheel 哈希或候选镜像不算通过。
3. 先完成数据字典与威胁模型，再编写容器、Adapter 或 Fixture。
4. 实现批次必须增加故障注入测试；未运行完整 `npm run verify` 不得推送生产相关变更。
