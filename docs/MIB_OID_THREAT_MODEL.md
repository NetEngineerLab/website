# MIB/OID Explorer 精简 V1 威胁模型

状态：`VALIDATOR PASS`（独立审计通过；尚未授权采集或公开）
版本：`1.0.0`
日期：2026-09-07
适用范围：精简 V1 的 10 个候选来源审核、8 个获批 IETF MIB、隔离解析、静态索引、双语页面、PWA 与撤回流程。

## 安全目标与边界

安全目标按优先级为：不发布未获许可或无法追溯的数据；不让 MIB 文本、解析器或依赖在构建环境执行代码或越权读取；不让解析结果、人工内容、搜索索引或缓存改变标准事实；发生许可/runtime 撤回时阻止旧 snapshot 重放；不泄露联系人、凭据、构建机路径和部署密钥。

V1 没有用户上传、在线解析、API、数据库、账户、厂商 MIB、AI 输入或自动增量采集。浏览器只读取构建时产生的同源静态数据；用户搜索词只在本地处理，不写日志、不发送到后端或 AI。任何新增网络入口都必须另开威胁模型，不能沿用本文批准。

## 资产与信任边界

关键资产：不可变 source/acquisition/license records，审核后的原始字节与范围，parser lock/runtime provenance/approval，规范 parsed facts 与裁决，双语 editorial，publication snapshot，Page Registry/搜索索引/Service Worker 清单，CI 与部署凭据，以及只含必要事实的审计记录。

```text
官方 HTTPS 来源
  → [B1 预授权与隔离 acquisition]
  → [B2 私有 staging / 只读输入]
  → [B3 无网络、非 root、受限 OCI parser]
  → [B4 Adapter + JSON Schema + deterministic validator]
  → [B5 effective license/runtime/adjudication/editorial heads]
  → [B6 content-addressed publication snapshot]
  → [B7 static generator + Page Registry + SW manifest]
  → Cloudflare Pages / 浏览器本地搜索
```

每跨越一个边界都必须重新验证目标类型、完整 ID/hash、允许状态和资源限制；上游“已验证”不能替代下游复验。原始 MIB、parser stdout、parsed facts、editorial 和 HTML 是不同信任级别，不得直接互相替代。

威胁主体包括：被攻陷或配置错误的官方/镜像来源、供应链维护者或包仓库、恶意或畸形 MIB 字节、低权限仓库贡献者、被攻陷的 CI runner、错误操作的审核/发布人员、恶意网页访问者，以及重放旧构建或旧缓存的部署路径。

## 风险等级

- `BLOCKER`：可导致未授权公开、代码执行、凭据泄露、事实静默篡改或撤回绕过；控制与故障测试未通过时禁止 V1 发布。
- `HIGH`：可导致构建逃逸、持久内容注入、大规模错误数据、拒绝服务或不可审计发布；必须在实现阶段关闭。
- `MEDIUM`：影响可用性、搜索质量或审计效率，且已有确定性回退；必须有 owner、测试或显式接受记录。

## 威胁、控制与验证证据

| ID | 风险 | 等级 | 必须控制 | 最小验证证据 |
|---|---|---|---|---|
| `TM-SRC-01` | DNS rebinding、代理、重定向、镜像或上游替换返回错误 MIB/内网内容 | `BLOCKER` | acquisition 保存有序 `networkHops[]`；每跳独立 preauthorization、URL、DNS 答案、socket peer、status、Location 与 header evidence；只接受公共可路由原生 IPv4/IPv6，映射地址还原，transition/NAT64 拒绝；连接固定批准 IP，TLS 验证原 hostname | 私有/保留/metadata、映射绕过、peer 不在集合、DNS 漂移、缺跳/乱序、Location/final URL 不符、代理、非白名单 host/端口均失败 |
| `TM-SRC-02` | HTTP 解压、编码或换行转换造成“审核字节”和“解析字节”不同 | `BLOCKER` | acquisition 明确记录 Content-Encoding 且只接受 identity；hash 对应直接进入 staging 的响应实体字节；Phase 0 禁 BOM/转码/换行改写 | gzip、BOM、CRLF、非法 UTF-8、代理改写样例证明 range/hash 始终定位同一字节 |
| `TM-SRC-03` | 同一 RFC 含多个模块导致 artifact 身份碰撞或切片越界 | `HIGH` | artifact ID 固定 `sourceRangeIdentityHash + artifactContentSha256`；半开范围必须在 acquisition 长度内；切片 hash 重算 | 同一 acquisition 两段、重叠段、空段、越界段、整文件段故障测试 |
| `TM-SRC-04` | 来源慢连接、巨型/framing 冲突 header 或无限流耗尽 runner | `HIGH` | Phase 0 固定 HTTP/1.1；header/连接/首字节/总时长/1 MiB 上限；拒绝重复/冲突 Content-Length、TE+CL、非 chunked transfer coding、chunk extension/trailer 和声明/实收长度不符；写前流式计数与失败清理 | slowloris、超长 header、重复 CL、TE+CL、坏 chunk、extension/trailer、伪造长度、chunked 超限、挂起测试均失败且无残留 |
| `TM-EXT-01` | 从 RFC 正文手工复制、去页眉或拼接 MIB 时篡改字节、丢失来源映射或注入内容 | `BLOCKER` | 优先选择许可 approved 的官方机器可读模块；否则先单独冻结确定性 extraction profile、ordered source ranges、输出 hash 和逐段 provenance，更新数据字典后再实现；禁止人工复制、AI 清洗和无版本 regex | 含页眉/分页/多个模块/相似 BEGIN-END/截断范围样例；相同输入重复提取 byte-identical，任一输出段可回溯原始范围 |
| `TM-LIC-01` | pending/rejected/withdrawn 许可或旧 approved review 被回选 | `BLOCKER` | review 按 acquisition/scope 单链；snapshot 固定唯一 effective head；生成、部署、激活、回滚与索引构建都重验 | approved→withdrawn、分叉、跨 scope、断链、旧 snapshot 重放全部被阻断并触发下线 |
| `TM-SUP-01` | PyPI wheel、传递依赖、基础镜像、Net-SNMP 或 GitHub Action 被替换 | `BLOCKER` | parser 供应链使用精确版本/URL/完整 hash/repository digest/离线闭包/SBOM/approval；所有 MIB acquisition、parse、build、verify、publish 调用的 GitHub Actions 只允许审核清单内 owner/repo 并固定完整 commit SHA，升级经独立 PR 复核 | 未锁依赖、tag-only 镜像、SBOM/hash/平台不符、Action `@vN`/branch/短 SHA、清单外 Action 均阻断 |
| `TM-SUP-02` | 已撤回 runtime approval 仍被旧 parse/snapshot 使用 | `BLOCKER` | runtime scope 规范化为 digest/linux/amd64；approval 单链；snapshot 固定 effective head；激活与回滚重验 | approved→withdrawn、等价 scope 拼写、运行时报告不符、旧 snapshot 回放均失败 |
| `TM-ISO-01` | MIB 利用 parser 漏洞执行代码、联网或读取宿主敏感文件 | `BLOCKER` | 无网络、只读 root/input、非 root、cap-drop、no-new-privileges、无 Docker socket/凭据/HOME；独立 tmpfs；只读 regular-file staging | canary DNS/HTTP、路径遍历、symlink/hardlink、`/proc`/HOME/secret 读取与写 root 测试均失败 |
| `TM-DOS-01` | 深层 ASN.1、IMPORT 环、超长文本、OID 或输出耗尽 CPU/内存/磁盘 | `HIGH` | ADR 的文件/批次/AST/深度/文本/OID/CPU/memory/PID/tmpfs/stdout/stderr 上限；宿主 watchdog；失败不发布部分输出 | 每个上限的边界与超限测试；TERM/KILL/OOM 后临时文件清理且无 partial result |
| `TM-PAR-01` | relaxed/错误恢复或 parser drift 静默产生错误事实 | `BLOCKER` | strict-only 可发布；未分类 diagnostic、未解析 IMPORT、未知 kind 均失败；相同输入重复构建；第二实现只提供差异证据，不投票 | strict/relaxed、同 runtime 不同 payload、双 parser 差异、输入顺序变化测试 |
| `TM-PAR-02` | IMPORT 路径穿越、远程 borrowing、系统 MIB 污染闭包 | `BLOCKER` | manifest 只含规范 artifact IDs；完整闭包；禁 borrowing/网络；Net-SNMP `-C/-M/-m` 与清空环境；文件名不来自输入路径 | `../`、绝对路径、URL import、缺失/额外依赖、系统 MIB 可见性测试全部失败 |
| `TM-DAT-01` | canonicalization 差异、hash 自引用、ID 碰撞或名称混淆 | `HIGH` | NFC、严格 UTF-8、JCS 或固定 NUL preimage、完整 SHA-256、重算验证；exact name 与 search name 分离；OID 用十进制字符串 | 属性/输入顺序、Unicode 等价/混淆、null/omit、负零、大整数、NUL 与伪造 ID 测试 |
| `TM-DAT-02` | 重复 OID、alias、revision 或人工解释覆盖标准事实 | `BLOCKER` | 多 binding 默认冲突；approved-alias 需完整语义指纹与 effective 裁决；editorial 不得写标准字段；每 family 单 revision | 冲突 OID、假 alias、旧裁决回选、editorial 越权字段、双 revision snapshot 均失败 |
| `TM-PRV-01` | CONTACT-INFO、日志、路径或 Fixture 泄露个人信息/密钥 | `BLOCKER` | 公开模型默认排除联系人字段；日志只记分类/hash；不保存绝对路径、环境、原始 stderr 或 secret；Fixture 只用保留地址与占位凭据 | email/phone/address/community/API key/本机路径种子不得出现在生成目录、日志或 snapshot |
| `TM-XSS-01` | DESCRIPTION、名字、搜索词或 editorial 注入 HTML/JSON-LD/script | `BLOCKER` | 所有 source/parsed/editorial 均视为不可信；HTML text/attribute/JSON context 分别编码；禁止 `innerHTML` 拼接、`eval`、`Function` 和事件属性；URL 使用明确协议/host allowlist | `</script>`、引号、实体、双向控制符、`javascript:`、SVG/onerror 与 JSON-LD 逃逸测试，浏览器中不得执行 |
| `TM-WEB-01` | 缺失或错误 CSP 让单点注入扩大 | `HIGH` | MIB 页面发布前给出与现有站点兼容的 CSP 方案并做全站回归；优先外部内容哈希脚本，禁 `object-src`，限制 `base-uri`/`frame-ancestors`；不得在本批直接修改生产 header | Chrome/Edge 与移动端页面、GA4、PWA、离线、现有 22 工具回归通过，CSP 无未审计 violation |
| `TM-SEO-01` | 恶意或错误事实进入 title、canonical、hreflang、JSON-LD 或海量薄页 | `HIGH` | URL 只由规范 ID/slug resolver 生成；Page Registry 是唯一发布事实；只有 approved snapshot 与独立内容页 index；JSON-LD 与可见文本同源 | 路径注入、重复 canonical、跨语言错配、孤页、薄页、withdrawn 页 Sitemap 残留均失败 |
| `TM-SW-01` | Service Worker、浏览器或 CDN 缓存继续提供已撤回 snapshot | `BLOCKER` | MIB 页面/snapshot/index/object data 禁止进入 SW cache 和通用 `/assets/*`；使用专属路径并返回 `Cache-Control: no-store, max-age=0`；撤回部署删除旧对象并执行 Cloudflare purge；共享 shell 不含 MIB 事实 | 扫描 SW/路径/header；离线只显示占位页；撤回后从浏览器和线上多次请求旧页面/旧 shard 均不得返回旧事实 |
| `TM-CI-01` | PR、可移动 Action 或 parser 作业窃取 GitHub/Cloudflare 凭据并发布 | `BLOCKER` | 不可信输入作业无 secrets、无 deploy 权限、无 Docker socket；解析与发布分离；protected main/environment；Action 完整 SHA allowlist；产物晋级只接受已验证 snapshot | fork/PR canary 无 secrets；Action tag 注入失败；解析 job 不能调用 deploy；篡改 artifact/approval 时发布 job 失败 |
| `TM-DEP-01` | 并发/历史 Pages 或 Worker 部署、公开 preview URL、手工 rollback 重放已撤回事实 | `BLOCKER` | 唯一串行 controller；protected monotonic security tag；独立 Advanced Worker 短 lease 默认拒绝；WAF 第二阻断通道；Pages previews Access；Pages/Worker/route/binding 权限分离并验证固定版本 | 删除旧撤回、并发 M0/M1、main 前进、Worker/Pages 历史 rollback、Worker route/key 篡改、匿名 preview、lease/KV/WAF 故障均不能长期公开旧事实 |
| `TM-OPS-01` | 操作员误发布、回滚到已撤回数据或删除审计证据 | `HIGH` | 实现提交与日志提交分离可追溯；2 号验证官 PASS；部署前重新验 heads/hash/commit；历史记录 append-only；回滚也走完整门禁 | 模拟旧 snapshot 回滚、缺日志提交、错误 commit、撤回后再部署均被阻断 |

## 发布、撤回与应急状态机

只有同时满足以下条件才允许从 `candidate` 进入 `active`：snapshot hash/commit 可重算；所有固定 license/runtime/editorial/adjudication heads 仍是唯一 effective approved；Page Registry、搜索、Sitemap、PWA 清单来自同一 snapshot；`npm run verify` 与独立浏览器验收通过；2 号验证官给出 PASS。

“当前有效状态”由 protected `origin/main` 最新 commit 与独立的 protected monotonic security tag 共同决定，不是待部署 commit 自带的 ledger。main 必须禁止 force-push/删除并要求门禁；`mib-security/vNNNNNNNN` signed annotated tags 使用固定 8 位十进制连续 epoch，只能由 release controller 创建，ruleset 禁止任何人更新/删除或复用 epoch。

`security-state/1.0.0` manifest 存放于 tag 所指 commit 的 `security/mib-security/vNNNNNNNN.json`，字段封闭为 `schemaVersion`、`epoch`、`previousTag|null`、`previousManifestSha256|null`、`entries[]`、`manifestSha256`。所有字符串先 NFC，entries 按 `{targetType,targetId}` 的 UTF-8 bytes 排序去重，再使用 RFC 8785 JCS；`manifestSha256` 对删除自身后的完整 UTF-8 JCS bytes 计算。entry 是 `{targetType,targetId,targetHash}`，覆盖生成 snapshot 前已存在的全部 source/acquisition/license/runtime/parsed/adjudication/editorial 记录。`targetHash` 统一对目标完整存储记录先删除该 Schema 明确列出的派生 ID/hash 字段、NFC + RFC 8785 JCS 后计算；字段型实体原 ID 仍按其 NUL preimage，security targetHash 只作为完整记录防改写 hash。snapshot 后引用 tag/hash且不进入 manifest，避免哈希环。

tag annotation message 固定为单行 RFC 8785 JCS：`{schemaVersion,tagName,targetCommit,manifestPath,manifestSha256,signerKeyId}`，不得加入时间或自由文本；tag object 再由 release controller 的固定 SSH signing key 签名。允许 signer 公钥指纹保存在受保护 GitHub Environment/Ruleset 配置而非待部署仓库，由 controller 和独立验证 job 双方读取并验证 tag object 签名、annotation、target 与 manifest。密钥轮换必须由当前 key 与新 key 对同一 rotation statement 双签，经双人批准后更新环境 allowlist；旧 key 撤销后不得签发新 epoch，历史签名仍由归档公钥验证。签名、环境 trust anchor 或 GitHub ruleset 读取失败即阻断。

首个 tag 必须为 `v00000001`，previous 两字段必须为 null；之后 epoch 必须严格加一且 previous 精确引用前一 tag/hash。tag 创建失败时不得生成 snapshot 或上传。tag 已创建但后续 snapshot/上传/激活失败时，该 epoch 作为未激活但有效的 append-only 安全状态保留、禁止删除或复用；下一次从它继续加一并保持 entries 超集，entries 可以完全相等或追加但不能减少/改写。删除、同 ID 改 hash、缺 epoch、分叉或 manifest/tag 签名不符均失败。

release controller 在部署开始、上传前、生产激活前和激活后分别获取远端最新 main 与全部 security tags。通过验证后、生产激活前先原子创建下一个 protected security tag；snapshot 固定该 tag 与 manifest hash。生产只允许激活该 tag 指向的 main commit，禁止直接重部署历史 commit；功能回滚必须在最新 main 之上创建 forward-revert commit，并继续包含上一 epoch 的全部安全记录。

MIB 上线前必须停用会自动把 Git commit 提升到生产的路径，改由一个持有生产权限的 release controller 串行处理；同一时间只能有一个 production candidate，其他部署无生产权限。自定义域名必须预先建立覆盖 `/mib/*`、`/oid/*`、`/mib-data/*` 的默认阻断 edge gate，并保留 WAF kill switch 作为第二通道。

主 edge gate 固定为独立于 Pages deployment 的 Cloudflare Advanced Worker + KV，不允许使用随 Pages 历史版本回滚的 Pages Function。Worker 只通过固定 service binding 读取当前静态 Pages assets，不提供产品 API、不保存用户输入。其 route 精确覆盖生产域名 `/mib/*`、`/oid/*`、`/mib-data/*`。`edge-gate/1.0.0` 封闭记录保存 Worker script SHA-256、Cloudflare version ID、完整 route patterns、KV namespace ID、asset binding target、verify-key ID/fingerprint；数组排序后 NFC + RFC 8785 JCS，完整记录存放在 `security/edge-gate/<sha256>.json`，其 hash 作为 `edge-gate` entry 进入最新 security-state manifest。controller 每次续租前必须从 Cloudflare API 读取实际状态、构造同一规范记录并重算匹配，任一漂移就拒绝 lease并启用 WAF。

lease 字段封闭为 `schemaVersion`、`securityEpochTag`、`securityStateSha256`、`snapshotId`、`notBefore`、`expiresAt`、`signerKeyId`、`signature`。时间严格为 UTC 秒精度 RFC 3339 `YYYY-MM-DDTHH:MM:SSZ`，无小数；`expiresAt > notBefore` 且差值最多 900 秒。除 signature 外执行 NFC + RFC 8785 JCS；签名固定 ECDSA P-256 + SHA-256，signature 为 64-byte `r||s` 的无 padding base64url。受保护 Cloudflare secret binding 保存完整 DER SPKI 公钥 base64、算法、key ID 及其 SHA-256 fingerprint，Worker 先校验完整 key/fingerprint 再验签；binding 不能由站点 commit 或 release controller 修改，并与 tag signer 分离。轮换要求旧/新 key 对 rotation statement 双签与双人批准。

Worker 每个请求使用 Cloudflare 本地可信时间重新验证 lease；controller 将 notBefore 设置为签发时间减 5 秒，Worker 对 expiresAt 不给予正向宽限并严格要求 `now < expiresAt`。KV key 的原生 expiration 必须等于 expiresAt epoch seconds；禁止内存、Cache API 或自定义缓存把 lease 保留到签名到期之后。KV 可能返回旧值时仍逐请求验证该值自身的签名与期限，因此一致性延迟不能延长旧 lease。KV 读取失败、缺失、过期、key/签名/hash/snapshot/Worker version 不符时返回不含 MIB 事实的 `503 no-store`。controller 每 5 分钟只有在 remote main、最新 security tag、effective heads、edge Worker 固定状态和线上 snapshot 全部通过时才能续租。

每次发布的第一动作仍是启用并确认 WAF kill switch，随后才允许上传和激活；激活后写入新 lease并验证 edge gate，最后才关闭 WAF。任一步失败时 WAF 保持启用；稳定运行期间即使 WAF 启用 API 失败，短 lease 仍会到期默认阻断。controller token 只允许读取/提升 Pages deployment、写唯一 lease KV key 和切换固定 WAF rule，不含 Worker script/version/route/binding 修改或 rollback 权限；这些权限仅属于独立 security-admin break-glass 角色并要求双人限时审批。edge Worker 只有读该 key 与静态 asset service binding 权限。edge lease 是撤回安全控制面例外，不得扩展成查询、上传、账户、日志采集或数据 API；未单独实现和验证前 V1 保持不公开。

Cloudflare Pages 静态部署不承担局部 quarantine，威胁模型不再假设它能只切换 Page Family。Cloudflare 生产提升 token 仅授予 controller，日常人员和解析 job 无权限；break-glass 必须双人批准、限时凭据和审计。测试必须覆盖安全记录删除/改写、并发 M0/M1、激活窗口撤回、WAF API 失败时保持阻断，以及“旧 commit + 旧 snapshot + 旧 approved 图”整体重放。

自定义生产域名是唯一公开入口。项目根 `pages.dev`、branch alias、commit/unique deployment URL 和历史成功 deployment 在发布任何 MIB 事实前必须由 Cloudflare Access 统一 deny-by-default，仅允许具名发布/验证人员；`noindex` 不能替代访问控制。withdrawal 时删除可删除的旧 deployment 并 purge，但即使平台保留历史部署，匿名请求仍必须被 Access 拒绝。Dashboard/API 的手工 rollback/promotion 权限仅限 break-glass 角色，且仍须由 controller 对当前 main 与 effective heads 复验。

任一 head 撤回、来源/hash 冲突、供应链告警或内容注入证据出现时，状态立即转为 `quarantined`：在 protected main 追加撤回记录并触发唯一 release controller，停止新部署与历史回滚，受影响页面变为 `noindex`、410 或同语种安全 redirect，从 Sitemap、搜索索引、Service Worker/precache 移除，删除旧 shard/对象并执行 Cloudflare URL/tag purge。MIB 事实路径必须使用专属 `no-store` header，禁止继承 `/assets/*` 的长缓存策略；直接请求已删除的旧内容寻址 URL 必须返回不含事实的 404/410 与 `no-store`。所有 pages.dev/历史部署继续由 Access 阻断。历史 snapshot、review 和 audit envelope 保留但不得继续服务原文。应急演练目标是在确认事件后 60 分钟内完成阻断、替代部署、缓存验证和记录；无法完成时保持相关 Page Family 下线。

恢复只能生成引用新 effective heads 的新 snapshot，并重新执行全部发布门禁；禁止原地把旧 snapshot 的 `validationResult` 改回 releasable。

## 实现前额外硬阻断

当前数据字典只允许一个 artifact 精确对应 acquisition 的连续 byte range，不授权对 RFC 正文执行去页眉、重排、拼接或字符清洗。候选来源审核必须同时确认是否存在许可 approved 的官方机器可读模块；若不存在，先新增 extraction ADR 与 Schema，定义内容寻址的 extraction profile、ordered source ranges、允许的有限操作、输出 hash、输出到输入的 provenance 和隔离资源上限，并再次由 2 号验证官 PASS。该问题关闭前，即使 RFC 许可 approved，也不得手工生成 parser Fixture 或输入文件。

由于静态离线缓存不能在断网客户端可靠接收撤回通知，精简 V1 明确不缓存 MIB 事实数据。MIB 页面离线时只显示通用离线页；恢复联网后必须从已重新验证的当前部署读取。不得把“PWA 可安装”误写成“MIB 数据离线可用”。

现有工作流仍存在 `actions/*@vN` 可移动引用；本文不把它误记为已修复。在任何 MIB acquisition/parser/snapshot/publish workflow 合并前，必须把其完整调用链上的 GitHub Actions 固定到审核过的 40 位 commit SHA，并在同一行注释经核对的 release；新增确定性 allowlist 检查。该迁移作为实现前 `BLOCKER` 小批次执行，不授权顺手改写无关工作流。

## 实现前故障测试清单

1. 供应链与来源：重定向、内容编码、hash 替换、未锁依赖、错误 digest/SBOM、runtime 撤回。
2. 隔离与资源：网络 canary、secret/path canary、symlink/hardlink/路径穿越、CPU/memory/PID/tmpfs/stdout/stderr 全部边界。
3. 数据完整性：ID/hash 重算、Unicode/JCS/NUL、sourceRange、OID arc、IMPORT 环/缺失、revision/OID/alias 冲突和输入顺序。
4. Web 与隐私：多上下文 XSS payload、URL/JSON-LD 注入、联系人/secret 扫描、Page Registry/SEO、CSP 兼容回归。
5. 发布与删除：旧 snapshot 重放、许可/runtime/editorial/adjudication 撤回、CDN/SW cache 清除、noindex/410/redirect 与审计保留。

每项测试必须有唯一 fixture ID、预期失败码、实际证据和 owner；仅验证“命令退出非零”不足以证明正确控制生效。故障注入不得使用许可未知的真实厂商 MIB，也不得把 canary secret 写入可提交文件。

## 责任分离与审计

- 来源审核者签发 preauthorization/review，不批准自己无法复核的许可证据。
- runtime 审核者核对 lock、provenance、SBOM、digest 和平台，不由 parser 输出自行批准。
- Adapter/Schema 实现者不能通过 editorial 或 adjudication 改写 parser 原始事实。
- 发布者只能选择 validator 生成的 snapshot，不能手工编辑索引、HTML 或 SW 清单绕过失败。
- 2 号验证官只读复核文档、测试证据、工作树与发布结果；发现 P1/P2 时停止下一阶段。

审计记录必须包含规范 ID、完整 hash、Git commit、tool/runtime version、decision、reviewer 和时间，但不得包含 MIB CONTACT-INFO、原始 secret、绝对路径或整段 stderr。时间只进入 audit envelope，不参与确定性事实 hash，除非对应 Schema 明确把它定义为审核事实。

## 已知剩余风险

即使所有门禁通过，仍可能存在官方 RFC/MIB 自身错误、两个解析器共享理解偏差、人工许可判断错误、浏览器/解析器未知漏洞，以及静态站撤回到缓存清除之间的短暂窗口。这些风险不能用“已验证”宣传消除；页面必须展示来源、revision、限制和复核日期，解析器/依赖安全公告需进入维护队列，撤回流程需定期演练。

全站当前没有在本批内新增 CSP；这是实现 MIB 页面前的 `HIGH` 门禁，不授权直接修改生产 `_headers`。必须先形成兼容方案并验证现有 22 个工具、GA4、PWA 和离线功能，再单独实施。

## 威胁模型验收门禁

## 本地验证记录

本轮完成了文档级一致性复核，未下载 MIB、安装解析器、创建 Schema/Adapter、修改生产页面或增加公开路由。

| 检查项 | 结果 | 证据 |
|---|---|---|
| 数据字典、来源台账、解析器 ADR 与威胁模型的 source/acquisition/artifact/runtime/snapshot 术语一致 | `PASS` | 四份文档逐项核对；未发现同名字段的不同语义 |
| 22 个现有工具、Cloudflare Pages 和现行 GitHub 门禁不被 MIB 方案隐式改写 | `PASS` | MIB 产物限定在内部测试边界；明确禁止进入 `website/`、通用 assets 与现有 Service Worker |
| BLOCKER/HIGH 风险均有控制和最小验证证据 | `PASS` | 22 个威胁条目逐项具备控制与故障测试要求；未发现空白证据列 |
| 许可、runtime、事实层、撤回和缓存之间不存在回退绕过 | `PASS` | 发布/撤回状态机、effective head、security tag、edge gate 和 no-store 边界已交叉核对 |
| 实现前硬阻断仍然有效 | `PASS` | 明确禁止 Schema、Adapter、parser lock、MIB acquisition 和公开页面，直至 2 号验证官复核通过 |

独立审计结论为 `VALIDATOR PASS`。该结论只覆盖威胁模型文档门禁，不代表来源许可、parser lock、MIB 采集、解析或公开页面已经获批。

1. 数据字典、来源台账、解析器 ADR 与本文不存在字段、状态或撤回语义冲突。
2. 每个 `BLOCKER/HIGH` 风险都有可自动化的失败测试或明确的发布/应急人工证据。
3. 2 号验证官确认不存在可绕过 license/runtime head、隔离、事实层或撤回流程的 P1/P2。
4. 本文通过并写入 `docs/DEVELOPMENT_LOG.md` 前，不得实现 JSON Schema、Adapter、parser lock、MIB acquisition 或公开页面。
