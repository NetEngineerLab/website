# 自动审核与逐项开发流程

授权日期：2026-10-11。用户原话：“配置自动开发流程，自动审核后逐项开发，验收通过移出清单，暂不自动上线”。

## 授权与范围

用户已一次性授权从现有候选中自动选择、审核，通过准入后逐项本地开发、测试、独立验收和归档，无需每项重新请求开发许可。该授权不意味着 181 项已经通过准入，也不替代真实工程依据。历史“没有开发授权”的记载描述此前状态；本流程从授权日期起控制本队列，既有准入要求仍有效。

不执行 git push、PR 合并、Cloudflare/其他生产部署、生产发布或会触发上线的外部写入。自动流程默认不创建提交，保留本地可审阅的修改。不得覆盖现有未提交工作。MIB/OID 的具名许可、采集和再分发前置门禁继续适用；Reserved 域和冻结分类变更仍需原治理要求，不因本流程自动解锁。

## 文件与命令

| 文件 | 用途 |
| --- | --- |
| `PHASE0_AUDIT_MATRIX.csv` | 完整原始审计账本，保留全部记录和证据 |
| `DEVELOPMENT_QUEUE_STATE.json` | 已完成项状态，续跑与清单同步依据 |
| `DEVELOPMENT_CANDIDATES.md` / `.csv` | 待处理候选视图，已完成和重复项不再显示 |
| `DEVELOPMENT_COMPLETED.md` | 本地验收完成归档，不代表生产上线 |
| `tasks/TOOL-xxx.md` | 单项范围、负责人、依赖、进度、阻断与三次失败记录 |
| `evidence/TOOL-xxx.json` | 完成验收证据索引，引用实际日志和独立审计记录 |

从项目根目录运行：

```powershell
node scripts/development-queue.js status
node scripts/development-queue.js sync
node scripts/development-queue-test.js
node scripts/development-queue.js defer TOOL-xxx --reason "user-requested hold"
node scripts/development-queue.js resume TOOL-xxx
node scripts/development-queue.js block TOOL-xxx --reason "missing authoritative scope"
node scripts/development-queue.js unblock TOOL-xxx
node scripts/development-queue.js complete TOOL-xxx --evidence docs/roadmap/evidence/TOOL-xxx.json
```

`complete` 必须验证独立审核、测试及准入证据后才移出清单。原矩阵不删除，工具编号不重排。候选名称与所有原始 CSV 字段保留，Markdown 按主域分组显示。不得手工删除候选来绕过完成校验。状态文件与证据记录的写入不等同于自动证明工程正确，独立 Agent 必须检查实际实现和输出。

经用户明确要求暂缓的候选使用 `defer` 记录原因与时间，并从待开发视图和自动 `nextCandidate` 中排除；这不代表完成、重复或审核通过，原始矩阵保持不变。用户要求恢复时运行 `resume`，清单随即重新生成。

准入或依赖遇到问题且本轮无法解锁时，使用 `block` 记录原因和时间，并跳过该项继续检查下一候选；阻塞不代表完成、重复或审核通过，原始矩阵保持不变。解锁条件满足后使用 `unblock` 并重新进行准入审核。

## 单项执行循环

### 与专题队列共享实现锁（2026-10-11）

工具与专题队列在整个工作区最多同时实现一项。工具实现开始前运行 `node scripts/topic-development-queue.js acquire tools TOOL-xxx`；先核对 `docs/roadmap/DEVELOPMENT_ACTIVE_IMPLEMENTATION.json`、专题状态及仍运行的 Agent。只有成功获取归属后才能启动实现。恢复时同一归属可重入；不得释放其他任务的锁。工具完成或已保存阻断检查点且实现 Agent 停止后，运行 `node scripts/topic-development-queue.js release tools TOOL-xxx`。专题队列由 claim/block/complete 管理同一归属锁，详见 [专题流程](TOPIC_AUTO_DEVELOPMENT_WORKFLOW.md)。脚本暂缺或锁不一致时停止实现并诊断，不能绕过锁。

1. **选择候选**：先恢复 `tasks/` 中唯一进行中的任务，否则按 P1→P4、编号顺序选择依赖已满足的未决候选；该排序仅供审核选择，不能自动授予准入。将选择原因、负责人、输入输出、依赖与验收标准写入任务文件。
2. **完成准入**：总工核实六项问题指纹、现有工具覆盖及 40 个现有工具的完整映射对账（未关闭前先完成这项共享前置审核）、跨站边界、所有 Mandatory Gate 和至少两项 Value Gate，引用可复核的 Source / Method / Validation。由未参与编写该方案的独立审计 Agent 审查证据并签署；更新原矩阵后才允许进入唯一 `NEXT`。新增重复项只归入排除记录，增强已有工具必须另记升级范围，不能重新造工具。
3. **实现单项**：实现 Agent 读取适用 UI、共享核心、语言、注册表与项目基线，只实现任务已批准范围。单项进度必须持久化，依赖未满足或需用户提供来源的项登记 `BLOCKED` 和下一诊断动作；可以继续其他无依赖候选，不反复询问同一阻断。
4. **独立验收**：运行适用计算引擎、边界/故障、回归、双语浏览器和注册/导航等检查，再由未参与实现的 Agent 根据验收标准检查实际产物、Diff 和验证证据。失败则修复、复测、复审；必要检查未运行、失败或审计 Agent 不可用均不能完成。同一问题三次修复失败停止编辑并执行新的诊断，不做第四次猜测修复。
5. **归档并继续**：真实验收通过后写入证据索引，运行 `complete`，更新任务为本地验收完成、清理当前 `NEXT` 并更新开发日志；下一候选仍从准入开始。只从待开发视图移出，保留原审计账本、完成历史及证据。

## 人员与模型

总工负责范围、架构、疑难问题和最终验收；主力工程模型负责实现；独立 Agent 负责准入与实现审计，审计人员身份必须记录且不能伪造。使用当前会话可用模型并记录实际模型名；需要显式分配时，总工优先 `gpt-6-astra`，实现与审计使用 `gpt-6.1-sol`，可验证的机械整理使用 `gpt-6-luna`。模型不可用时如实记录并用实际可用模型；独立审计不可用时保持待审，不能由实现 Agent 自签。任何阶段同时最多处理一个实现任务，分工的 Agent 可以并行做互不冲突的检查。

## 续跑与报告

自动任务每 30 分钟唤醒当前聊天，读取本流程、当前状态和任务记录后续跑；一次唤醒可以完成一个阶段，不要求在 30 分钟内完成整个工具。已有运行中的实现或审计 Agent 时继续协调，不能重复启动同项。电脑与应用须保持运行；额度、工具或模型不可用时保留检查点，下次恢复，不承诺无人值守永久运行。

没有可执行候选时报告阻断汇总并停止重复扫描；全部候选处理完或用户要求暂停时停用该自动任务。没有新结果时保持安静，仅在单项完成、实质失败或需要用户补充资料时通知。
