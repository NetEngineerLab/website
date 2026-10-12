# 专题自动开发工作流

配置验收：2026-10-11 独立审计 [PASS](evidence/TOPIC_AUTO_DEVELOPMENT_WORKFLOW_AUDIT_2026-10-11.md)，专题队列 19 项检查和工具队列回归通过。当前聊天自动任务 `netengineerlab-2` 已启用，每 30 分钟续跑；已回读确认 ACTIVE。工具自动任务同步使用共享实现锁。初始状态 40 待审、0 完成，下一审核项 TD-01。仅配置通过，不代表专题工程已完成。

用户授权本地逐项自动审核、开发及独立验收；暂不自动上线。禁止自动 git commit、push、merge、deploy 或触发发布。40 项初始均待准入审核，不将清单编制审计作为工程准入或完成验收。

## 分工与输入输出

| 负责人 | 输入 | 输出 | 依赖 | 验收 |
|---|---|---|---|---|
| 总工（最高能力模型） | 原表、仓库约束、状态与用户授权 | 边界、必要检查、任务选择 | 工作区/运行 Agent 盘点 | 单一任务、无覆盖用户更改 |
| 实现 Agent（GPT-6.1-sol） | 独立准入 PASS、任务交付物与依赖 | 本地实际产物、检查日志、检查点 | 共享实现锁和父任务验收 | 必要检查全部 PASS |
| 独立审计 Agent（GPT-6.1-sol，未参与实现） | 实际产物、源资料、日志与哈希 | 准入/验收证据 | 可检查实际文件 | 独立审查全部验收标准 PASS |
| 批量核对 Agent（GPT-6-luna，适用时） | 资源列表 | 资产核对报告 | 总工指派 | 不替代独立审计 |

模型或 Agent 不可用须报告，不声称已经分工或审计。总工不兼任实现与最终独立审核。每轮仅处理一个专题，失败未验收时不得移出。

## 每轮执行

1. 读取 `node scripts/topic-development-queue.js status`、原表 JSON、仓库 AGENTS.md、git status 和当前运行 Agent；存在活跃实现先恢复检查点，保护原有脏文件，不 reset/clean/stash 用户更改。
2. 对 next 项安排独立准入：核实重叠、真实资产、缺口、父任务、交付物和适用验收，保存证据；缺资料用 block 记录具体原因。
3. 用 `claim TD-01 docs/roadmap/evidence/TD-01-admission.json` 原子占用队列，交给实现 Agent 本地开发；准入 JSON 的 artifacts 可绑定计划文件，完工证据必须绑定全部实际交付物。
4. 执行必要检查并保存非空日志，独立审计 Agent 重新查看实际产物、计算样例、链接和适用网站检查；失败返回实现修复，同一位置连续三次失败必须新诊断再修。
5. 独立验收全部 PASS 后用 `complete TD-01 docs/roadmap/evidence/TD-01-acceptance.json` 归档；只有成功 complete 才从待办表行移出。保留原表、证据和完成记录，下轮再选下一项。

状态保存 active admission 文件哈希、实现者、开始时间和恢复检查点；中断后 `status` 读取并续做 active，禁止重复 claim。`block ID 原因` 释放持久锁，保留阻塞记录和检查点；修复阻塞后重新准入 claim。默认必要检查 content/calculation/links；Hub 另需 routes/languages/desktop-mobile/keyboard。原表 G 与每行实际验收条件同样必须检查，脚本列举不能替代人工审计。

## 共享实现锁

工具与专题自动任务共用 `docs/roadmap/DEVELOPMENT_ACTIVE_IMPLEMENTATION.json` 持久锁。工具任务必须在实现前执行 `node scripts/topic-development-queue.js acquire tools TOOL-ID`，完成或明确停止后 `release tools TOOL-ID`；专题 claim 自动获取，complete/block 自动释放。短时状态变更共用 `DEVELOPMENT_IMPLEMENTATION.lock` 排他锁。专题也拒绝工具状态中可识别 active/inProgress/currentTask/running 标记。获取失败本轮退出或恢复自己的任务；不得删除另一个运行任务的锁。崩溃残留短锁需总工核实 PID、运行 Agent 和工作区后人工修复；不自动抢锁。此约定必须同时写入旧工具自动化提示。

## 证据 JSON 契约

```json
{
  "topicId": "TD-01",
  "planAuthorAgent": "实际方案作者 Agent ID",
  "evidenceHashes": {"docs/roadmap/evidence/TD-01-admission.md":"准入证据 SHA256","docs/roadmap/evidence/TD-01-acceptance.md":"验收证据 SHA256"},
  "implementationAgent": "实际实现 Agent ID",
  "reviewerAgent": "实际独立审核 Agent ID",
  "productionDeployment": false,
  "admission": {"status":"PASS","reviewerAgent":"实际独立审核 Agent ID","evidencePaths":["docs/roadmap/evidence/TD-01-admission.md"]},
  "acceptance": {"status":"PASS","reviewerAgent":"实际独立审核 Agent ID","evidencePaths":["docs/roadmap/evidence/TD-01-acceptance.md"]},
  "artifacts": [{"path":"实际交付物的仓库相对路径","sha256":"文件当前 SHA256"}],
  "checks": [{"id":"content","status":"PASS","command":"实际运行命令或实际浏览器检查步骤","evidencePath":"实际日志路径","sha256":"日志当前 SHA256"}]
}
```

admission 和 acceptance 的 reviewerAgent 与顶层 reviewerAgent 一致，且与实现者及 planAuthorAgent 不同。审计证据文件也必须通过 evidenceHashes 绑定当前 SHA256。所有路径为仓库内非空文件，拒绝目录穿越和指向仓库外的链接；实际交付物和检查日志的哈希必须相符。补齐全部 requiredChecks，每条真实执行 PASS，不能用占位字符串或自行声明代替。准入文件在 claim 后不得修改；完成另建验收 JSON。脚本只校验记录、身份与文件一致性，独立 Agent 负责确认日志及 PASS 的真实性和产物覆盖。

`TOPIC_DEVELOPMENT_BACKLOG.json` 永久保留最初 40 行全部字段和 Markdown；`TOPIC_DEVELOPMENT_CANDIDATES.md` 是可重建待办视图，`TOPIC_DEVELOPMENT_COMPLETED.md` 为本地已验收记录。视图中原始规划段落作为原表上下文保留，实时数目以顶层注释和 status 为准。

验证：`node scripts/topic-development-queue-test.js` 使用隔离临时目录验证失败拒绝、缺证据、自审、过期产物/日志、依赖、共享互斥和成功幂等归档，不修改真实任务为完成。


完成时自动将验收 JSON、全部交付物、审计证据和检查日志复制到 evidence/topic-snapshots/ID；历史记录校验这些不可变快照与 SHA256，允许后续专题合法修改共享 Hub 文件。损坏快照或手写缺证据完成记录会拒绝 sync/status。待审任务可直接 block ID 原因，无需伪造准入；next 跳过 blocked，直到明确新资料后重新准入。共享锁同时检查 docs/roadmap/tasks/*.md 中 IMPLEMENTING 标记，工具获取自己的同名任务锁允许恢复。
