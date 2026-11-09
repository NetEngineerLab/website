# NEL Tool-Detail V3 三语结构基准（OPB）

- **生效日期：** 2026-10-29
- **状态：** 权威基准（authoritative baseline）。此后所有 NEL tool-detail V3 的 structural remigrate、验收（acceptance）与生产修复（production fixes）一律以本文为准。
- **现场核对：** 2026-10-29 对下列三条生产 URL 的 HTML 与 `fb-v3.css` / `fb-v3-prod.css` 做只读检查。缓存参数（`?v=`）是部署指纹，不构成结构合同，不必逐字复制。

本文只约束 DOM / skeleton / SEO / interaction。Optical Power Budget 的公式、FAQ 文案、输入字段、workflow 卡片目标与 `data-primary-workflow` 属于该工具自身内容，不得抄到无关工具。

## 本轮用户确认记录（2026-10-29）

用户本轮再次明确：唯一三语参照为下列 EN / ZH / ES 三条 OPB 生产 URL，修改和检查必须严格对照目标页的**同 locale 生产参照**。本文件清单用于执行检查；如清单或其他文档与对应生产参照冲突，以同 locale 生产参照为准，并据实记录差异。与此冲突的旧模板、旧参照和历史默认入口失效，不得继续作为 tool-detail V3 的验收依据。

初始确认阶段仅记录参照与执行边界，当时尚未重新全面验证 DOM、样式、SEO 或交互细节，因此该阶段记录不代表迁移已执行或目标页已验收。后续生产三语 12 次交互复验及 148 页本地验证的进度、证据和最终状态以 [OPB V3 迁移进度](OPB_V3_MIGRATION_PROGRESS.md) 为准，不得仅凭初始确认或本条记录宣称最终 PASS。用户已明确授权：对本地所有尚未完成 OPB V3 迁移工具的现有 EN / ZH / ES 页面进行迁移，已完整迁移者保留；不自动提交、push 或部署。

### 本轮折叠合同复核与纠正（2026-10-29）

复核证据为 `artifacts/opb-v3-validation/production-reference/{en,zh,es}.html` 三语生产 HTML 留档，以及 `website/tools/optical-power-budget/js/app-v3.js` 的 `syncExplainFolds()`（1087 行起）及其初始化、`matchMedia` 断点变化调用。三语 HTML 均只有 `about-scope`、`methodology`、`status-rules`、`component-check` 四块使用 `details.fb-fold`。FAQ 为普通 `div.blk.faq`，内部单条问答才是 `details`；history、references、content-review 为普通 `section.blk`，pon-toolkit 为普通 `section.content-section.nel-tool-supporting-section`，workflow 为普通 section。

旧条款「Folds 默认折叠」把静态 HTML 无 `open` 误当作运行时状态，现予纠正：脚本在宽度 >=769px 时设置 `open=true` 并添加 `fb-desktop-open`，<=768px 时默认收起、移除该 class，并保留已记录的用户切换状态；resize 会重新同步。不得把 FAQ、参考资料或其他普通内容块一律改为外层 fold，也不得据静态 HTML 推断桌面运行时默认收起。本次证据核对不等于已完成所有目标页的浏览器交互验收。

独立审计的生产交互实证见 `artifacts/opb-v3-audit/production-interaction.json`：EN / ZH / ES 分别在 390、768、769、1280px 执行，共 12 次。桌面点击 summary 后 `open` 可变为 false，但 `fb-desktop-open` 对正文的 CSS 强制显示仍生效，正文矩形仍可见；再次点击恢复 `open=true`。移动端没有该强制显示 class，折叠时正文隐藏。验收必须区分 DOM 的 `open` 状态与正文实际可见性，不得要求桌面关闭必隐藏正文；这些生产实证不代表所有迁移目标已验收。

## 三语基准页面

以下三条生产页是**唯一**的三语基准参考页。检查标准与修改标准必须严格按本文件的 locale 对照表、检查清单与修改步骤执行。不得另立 locale，不得改用 design preview 或 Fieldbook skin 作为权威。

- EN：https://netengineerlab.com/tools/optical-power-budget/
- ZH：https://netengineerlab.com/tools/optical-power-budget/zh/
- ES：https://netengineerlab.com/tools/optical-power-budget/es/

| Locale | `html lang` | `data-nel-locale` | Canonical（self） |
| --- | --- | --- | --- |
| EN | `en` | `en` | `https://netengineerlab.com/tools/optical-power-budget/` |
| ZH | `zh-CN` | `zh` | `https://netengineerlab.com/tools/optical-power-budget/zh/` |
| ES | `es` | `es` | `https://netengineerlab.com/tools/optical-power-budget/es/` |

三条页面的 `hreflang` 集合相同：

- `hreflang="en"` → `https://netengineerlab.com/tools/optical-power-budget/`
- `hreflang="zh-CN"` → `https://netengineerlab.com/tools/optical-power-budget/zh/`
- `hreflang="es"` → `https://netengineerlab.com/tools/optical-power-budget/es/`
- `hreflang="x-default"` → `https://netengineerlab.com/tools/optical-power-budget/`

允许的 locale 只有上述 EN / ZH（`zh-CN`，路径 `zh/`）/ ES。禁止发明额外 locale 或额外 hreflang。

## 检查标准

对照**同 locale** 的 OPB 基准页逐项检查目标工具。标签文案可以随 locale 翻译；锚点 `id` 与骨架 class 必须对齐。

### 页面壳

- [ ] `body` 同时带有工具自身的 detail class、`has-mbar`、`v3`。OPB 现场为 `class="nel-tool-detail-page nel-opb-v3 has-mbar v3"`（并带 `data-nel-template="tool-detail-v1.3.1"`）。验收 OPB 时必须看到 `nel-opb-v3`、`has-mbar`、`v3`。迁移其他工具时保留该工具自己的 detail class，并同样带上 `has-mbar` 与 `v3`；不要把 `nel-opb-v3` 印到无关工具上。
- [ ] `<meta name="theme-color" content="#176ff2">`。
- [ ] Hero：`<section class="hero nel-tool-hero" aria-hidden="true">`。
- [ ] 样式表包含 `fb-v3.css` 与 `fb-v3-prod.css`。`fieldbook.css` 不得作为 primary shell（三条基准页均未引用 `fieldbook.css`）。现场另有 `fb.css`，它不是权威皮肤；design preview 与 Fieldbook skin 都不得当作验收依据。
- [ ] 计算引擎 `js/engine.js` 保持未改。结构回迁、验收与生产修复都不得改 engine。

### SEO

- [ ] 生产页 `meta name="robots"` 为 `index,follow`（现场完整值为 `index,follow,max-image-preview:large,max-snippet:-1`）。
- [ ] Preview（`*.pages.dev`）的 noindex 保持原样。`functions/_middleware.js` 会在 preview 把 robots 收成 noindex，并保留 `X-Robots-Tag: noindex`。不要为了“跟生产一致”去掉 preview noindex，也不要把生产改成 noindex。
- [ ] `link rel="canonical"` 指向该 locale 自己的 URL。
- [ ] `hreflang` 齐全且互指：`en`、`zh-CN`、`es`、`x-default`（`x-default` 指向 EN）。三语页面这一组 URL 必须一致。

### 骨架与交互

- [ ] 存在 `.below`、`.toc`（现场为 `<div class="below"><nav class="toc">`）以及 `.fb-fold*`（`.fb-fold`、`.fb-fold-sum`、`.fb-fold-title`、`.fb-fold-body`；fold 根节点为 `<details class="fb-fold blk">`）。
- [ ] 语义 fold 仅用于适用的 `#about-scope`、`#methodology`、`#status-rules`、`#component-check`。其他工具没有对应领域内容时不得造块。FAQ 保持普通块和内部单条问答 `details`；history、references、content-review、pon-toolkit 与 workflow 保持普通块，不增加 `details.fb-fold` 外壳。
- [ ] TOC 锚点跨 locale 对齐。三条基准页的 TOC `href` 顺序与 id 相同，仅可见文字不同：

  | 锚点 | EN | ZH | ES |
  | --- | --- | --- | --- |
  | `#about-scope` | About & applicability | 关于与适用范围 | Acerca de y aplicabilidad |
  | `#methodology` | How it’s calculated | 计算方法 | Cómo se calcula |
  | `#status-rules` | Status rules | 状态规则 | Reglas de estado |
  | `#component-check` | Component check | 分项核对 | Comprobación de componentes |
  | `#faq` | FAQ | 问答 | Preguntas frecuentes |
  | `#history` | Recent calculations | 最近计算 | Cálculos recientes |
  | `#references` | Official references | 官方依据 | Referencias oficiales |
  | `#content-review` | Content review | 内容复核 | Revisión de contenido |
  | `#pon-toolkit` | PON toolkit | PON 工具组 | Kit PON |
  | `#nel-tool-graph` | Engineering workflow | 工程工作流 | Flujo de ingeniería |

  其他工具对齐的是**同一套锚点 id 与 TOC 顺序**（该工具若无对应内容块，不得为了凑 OPB 而发明 OPB 专有段落）。可见标题随 locale 翻译，id 不翻译、不改名。
- [ ] `#nel-tool-graph` workflow 存在：`<section class="content-section nel-tool-graph" id="nel-tool-graph" aria-labelledby="nel-tool-graph-title">`，且 TOC 链到该 id。对齐的是该 section 骨架，不是 OPB 的 Optical Link Design 卡片、相关工具链接或 `data-tool-id`。
- [ ] Mobile TOC 隐藏：`fb-v3.css` 中 mobile-first 为 `body.v3 .below > .toc { display: none }`；`@media (max-width: 768px)` 为 `display: none !important`；`@media (min-width: 961px)` 才 `display: block`（sticky）。
- [ ] Fold 运行时与生产参照对齐：>=769px 默认展开并带 `fb-desktop-open`；<=768px 默认收起，可通过 summary 切换并保留用户状态；resize 后按生产脚本规则同步。静态 HTML 无 `open` 不能替代运行时验收。分别验证桌面初始展开、移动初始收起、用户切换及断点往返；不得锁死 summary 或强制覆盖用户的移动端选择。
- [ ] 桌面 summary 点击可切换 `open`，但 `fb-desktop-open` 的 CSS 仍强制显示正文；不能把桌面 `open=false` 当作正文必须隐藏的合同。移动端折叠则应实际隐藏正文，展开后可见。按上述 12 次生产实证分别核对状态与可见性。

### 明确禁止

- 不要把 OPB 的公式、FAQ、输入字段、分光器/余量文案或 workflow 目标抄到无关工具。只对齐 DOM、skeleton、SEO 与 interaction。
- 不要用 design preview 或 Fieldbook skin 当权威；不要引入 `fieldbook.css` 作为 primary shell。
- 不要发明 EN / ZH / ES 以外的 locale。
- 不要修改 `engine.js`。

## 修改标准

只改目标工具。基准页本身不是修改对象，除非任务明确授权修复 OPB。

1. 打开与目标 locale 对应的 OPB 基准 URL（EN、ZH 或 ES，见「三语基准页面」）。
2. 打开目标工具的**同一 locale** 页面（本地或待修生产页）。不要用另一语种的 OPB 去改这一语种。
3. 按「检查标准」逐项 diff：body class、`theme-color`、hero `aria-hidden`、`fb-v3.css` / `fb-v3-prod.css`、生产 robots、preview noindex、canonical、hreflang、`.below` / `.toc` / `.fb-fold*`、TOC 锚点、`#nel-tool-graph`、mobile TOC、四类语义 fold 与其他普通块边界、fold 桌面展开 / 移动收起及用户切换 / resize、locale 集合、`engine.js` 未改。
4. 只修目标工具上偏离基准的结构 / SEO / interaction。不复制 OPB 领域内容。
5. 跑该工具的 contract 测试与 engine 测试，确认 engine 行为未被结构改动带偏，且 `engine.js` 无 diff。
6. 通过 Quality Gate 后再考虑合并。
7. 仅在获得明确授权时 squash-merge。未授权则停在 PR，不合并、不部署。
