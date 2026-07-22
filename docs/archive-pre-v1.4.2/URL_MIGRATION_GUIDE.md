# URL migration guide

The V1.4.1 structure changes the public URLs:

```text
/en/                         -> /
/en/about.html               -> /about.html
/tools/en/                   -> /tools/
/tools/<slug>/en/            -> /tools/<slug>/
/                            -> /zh/          (old Chinese home)
/tools/                      -> /tools/zh/    (old Chinese tool directory)
/tools/<slug>/               -> /tools/<slug>/zh/ (old Chinese tool page)
```

Because the old English and Chinese URLs overlap after the swap, server-side redirects must be planned before replacing a live indexed site. For a site that has not been indexed yet, deploy V1.4.1 directly.

For Cloudflare Pages or Netlify, configure exact redirects before wildcard redirects. GitHub Pages does not provide native HTTP 301 rules.
