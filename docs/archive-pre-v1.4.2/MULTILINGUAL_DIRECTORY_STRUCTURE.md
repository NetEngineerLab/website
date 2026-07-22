# NetEngineerLab multilingual directory structure V1.4.1

## Production rule

English is the default language and does not use a language directory.

```text
website/
├─ index.html                 # English home
├─ about.html                 # English
├─ tools/index.html           # English tool directory
├─ zh/index.html              # Chinese home
├─ zh/about.html              # Chinese
├─ tools/zh/index.html        # Chinese tool directory
├─ tools/<slug>/index.html    # English tool
└─ tools/<slug>/zh/index.html # Chinese tool
```

## Future Japanese structure

The requested public directory is `jp`, while the HTML language and hreflang code must use the standards-based value `ja`.

```text
website/jp/index.html
website/tools/jp/index.html
website/tools/<slug>/jp/index.html
```

Use:

```html
<html lang="ja">
<link rel="alternate" hreflang="ja" href="https://netengineerlab.com/jp/">
```

`data/locales.js` already reserves the `jp` directory and maps it to catalog key `ja`.

## SEO rule

- English canonical: `/...`
- Chinese canonical: `/zh/...` or `/tools/<slug>/zh/`
- `x-default` always points to English.
- Do not publish `jp` hreflang until Japanese content is complete.
