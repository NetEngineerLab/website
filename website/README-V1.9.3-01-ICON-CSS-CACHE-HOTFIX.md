# NetEngineerLab V1.9.3-01 Icon CSS Cache Hotfix

This hotfix corrects a cache-version mismatch introduced in V1.9.3. The HTML
contained the new inline SVG action icons, while the stylesheet URL retained
the previous cache key. Browsers could therefore render the new SVG markup
with stale CSS, producing oversized black shapes and leaving the old stretched
card layout in place.

Changes are limited to the fiber-loss tool stylesheet, its English and Chinese
HTML entry pages, and the release version metadata. Calculator behavior and
search configuration are unchanged.
