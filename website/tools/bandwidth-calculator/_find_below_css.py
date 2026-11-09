from pathlib import Path
import re

roots = [
    Path(r"D:\NetEngineerLab-V173-GitHub\website\tools\optical-power-budget\css"),
    Path(r"D:\NetEngineerLab-V173-GitHub\website\assets\css"),
    Path(r"D:\NetEngineerLab-V173-GitHub\website\tools\bandwidth-calculator\css"),
]

patterns = [".below", "nav.toc", ".prose", "nel-opb-v3", "nel-tool-v3"]

for root in roots:
    if not root.exists():
        print("MISSING", root)
        continue
    for f in sorted(root.glob("*.css")):
        text = f.read_text(encoding="utf-8", errors="replace")
        hits = []
        # find rule blocks mentioning .below
        for m in re.finditer(r"[^{}]*\.below[^{}]*\{[^}]*\}", text):
            hits.append(m.group(0).strip()[:500])
        for m in re.finditer(r"[^{}]*nav\.toc[^{}]*\{[^}]*\}", text):
            s = m.group(0).strip()
            if "below" in s or "sticky" in s or "grid" in s or "flex" in s:
                hits.append(s[:500])
        if hits:
            print("FILE", f)
            for h in hits[:30]:
                print("---")
                print(h)
            print("====")
