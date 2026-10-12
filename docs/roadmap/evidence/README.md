# 单项验收证据

每个工具完成后在此保存 `TOOL-xxx.json`，引用实际准入审计、独立验收及测试日志。以下只描述格式，不提供虚构 PASS 或签署。状态在检查通过前写 `NOT_RUN`，不能调用 complete 完成归档。

```json
{
  "toolId": "TOOL-xxx",
  "implementationAgent": "实际实现 Agent ID",
  "reviewerAgent": "实际独立验收 Agent ID",
  "productionDeployment": false,
  "admission": {
    "status": "NOT_RUN",
    "reviewerAgent": "实际独立准入审核 Agent ID",
    "evidencePaths": ["docs/roadmap/evidence/TOOL-xxx-admission.md"]
  },
  "acceptance": {
    "status": "NOT_RUN",
    "reviewerAgent": "与顶层 reviewerAgent 相同的实际 ID",
    "evidencePaths": ["docs/roadmap/evidence/TOOL-xxx-acceptance.md"]
  },
  "tests": [
    {
      "command": "实际执行的必要验证命令",
      "status": "NOT_RUN",
      "evidencePath": "docs/roadmap/evidence/TOOL-xxx-test.txt"
    }
  ]
}
```

证据文件必须存在于本仓库且有实际内容，路径不能逃出仓库。准入与验收 reviewer 均不能是实现者。所有必要测试应列出，任何失败、跳过或未运行检查都不能以省略条目的方式规避。准入矩阵必须为 PASS，六项 Mandatory 和至少两项 Value 必须有 EVIDENCED 证据，六项问题指纹和 canonical_problem_id 不得留为 PENDING。audit_owner、audit_version 应填写实际负责人及版本；audit_notes 必须引用同一 admission.reviewerAgent 的独立审核签署和报告路径。脚本检查结构和引用，独立审核人检查内容与实际产物是否相符。
