# UI V1.3 五页面现场诊断

根据现场截图，对 5 个代表页面的差异诊断如下：

1. Data Center Fabric：Hero 深色但与平台参考页的边距、渐变和导航节奏不同。
2. SFP/QSFP：Hero 结构较接近新版，但历史 CTA/本地 Hero 样式曾造成重复和视觉分叉。
3. OLT Dual Uplink：长中文标题换行方式与 Hero 内容宽度和字号未统一。
4. Transmission Ring：历史 `.tool-hero` / 本地 Hero 规则与共享设计层冲突，出现浅底 + 白字的明显错误视觉。
5. Network Change Planner & MOP Generator：视觉层次、Hero、返回导航、步骤导引、状态提示、卡片节奏最完整，选为 V1.3 参考页。

V1.3 已把 1-4 的平台外壳收敛到第 5 页的视觉语言，同时不复制第 5 页特有的业务步骤内容。
