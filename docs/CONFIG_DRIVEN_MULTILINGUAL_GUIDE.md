# V1.7 配置驱动多语言使用指南

## 一、唯一配置源

### 语言配置

编辑：

```text
website/data/locales.json
```

每种语言必须包含：

- `id`：内部语言标识
- `folder`：URL目录
- `catalogKey`：工具目录翻译键
- `htmlLang`：HTML `lang`
- `hreflang`：Google语言标记
- `status`：`active`或`planned`
- `direction`：`ltr`或`rtl`
- `ui`：打开工具、开发中、语言菜单等公共文案

### 工具目录翻译

编辑：

```text
website/data/tools-catalog.json
```

每个工具的`translations`必须包含所有已启用语言。例如：

```json
{
  "translations": {
    "en": {},
    "zh": {},
    "es": {}
  }
}
```

### Sitemap路由

编辑：

```text
website/data/sitemap-routes.json
```

这里只维护逻辑路由，不重复填写每种语言URL。构建脚本会根据已启用语言和实际存在页面自动展开。

## 二、目录规则

```text
英文首页                 /
中文首页                 /zh/
西班牙语首页             /es/

英文工具中心             /tools/
中文工具中心             /tools/zh/
西班牙语工具中心         /tools/es/

英文工具                 /tools/<slug>/
中文工具                 /tools/<slug>/zh/
西班牙语工具             /tools/<slug>/es/
```

日语目录使用`jp`，但HTML和hreflang使用`ja`。

## 三、新增语言流程

以西班牙语为例：

```text
npm run scaffold:locale -- --locale es
```

该命令创建草稿页面，并自动执行一次构建。草稿状态下：

- 页面带`noindex,follow`
- 不进入Sitemap
- 不生成公开hreflang
- 不出现在语言菜单
- 工具目录暂时回退英文卡片文案

完成全部翻译并补齐`tools-catalog.json`后，把：

```json
"status": "planned"
```

改成：

```json
"status": "active"
```

然后执行：

```text
npm run build:i18n
npm run validate:i18n
```

只有验证结果为`PASS`时才上传网站。

## 四、自动生成内容

`build-multilingual.js`会处理：

- HTML语言和文字方向
- Canonical
- Hreflang
- x-default
- 语言菜单
- 内部导航语言路径
- Sitemap
- Manifest
- Service Worker语言缓存
- `locales.js`
- `tools-catalog.js`

不要手工编辑生成后的`locales.js`和`tools-catalog.js`。

## 五、上线前检查

执行：

```text
npm run validate:i18n
```

验证包括：

- 已启用语言页面是否齐全
- 工具翻译是否齐全
- HTML `lang`与`dir`
- Canonical与Hreflang
- x-default
- 语言菜单
- Sitemap
- Manifest
- JavaScript语法
- 遗留旧`/en/`路径

详细结果保存在：

```text
docs/MULTILINGUAL_VALIDATION_REPORT.json
```
