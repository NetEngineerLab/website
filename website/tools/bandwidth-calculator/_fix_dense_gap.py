from pathlib import Path
import re

css_path = Path("css/style.css")
css = css_path.read_text(encoding="utf-8")

# Remove stretch-to-bottom gap: formula should sit dense under Calculate/Reset
# Update both earlier opb3c rule and opb3e rule
css = css.replace(
    ".workspace > .input-panel > .formula-block{\n  margin-top: auto;\n  padding-top: 14px;\n}",
    ".workspace > .input-panel > .formula-block{\n  margin-top: 14px;\n  padding-top: 0;\n}",
)
css = css.replace(
    ".workspace > .input-panel > .formula-block{\n  margin-top:auto;\n  padding-top:14px;\n}",
    ".workspace > .input-panel > .formula-block{\n  margin-top:14px;\n  padding-top:0;\n}",
)

# Also stop forcing input-panel to height:100% stretch that creates empty white
# Keep flex column but allow natural height; result panel can still stretch visually via grid align-items:start
css = re.sub(
    r"(\.workspace > \.input-panel,\s*\.workspace > \.result-panel\{)([\s\S]*?)(\})",
    lambda m: m.group(0),  # leave for now; handle in opb3e block
    css,
    count=1,
)

# Strengthen opb3e block: dense left column, no auto-push gap
if "opb3e-dense" not in css:
    css = css.rstrip() + "\n" + r'''
/* === 20261105-opb3e-dense: fill left white gap — formula directly under actions === */
.workspace{
  align-items: start !important;
}
.workspace > .input-panel,
.workspace > .result-panel{
  height: auto !important;
  min-height: 0 !important;
}
.workspace > .input-panel{
  display: flex !important;
  flex-direction: column !important;
  gap: 0 !important;
}
.workspace > .input-panel > .formula-block{
  margin-top: 14px !important;
  padding-top: 0 !important;
  margin-bottom: 0 !important;
}
.workspace > .input-panel .input-actions{
  margin-bottom: 0 !important;
}
.workspace > .input-panel .formula-note{
  margin-top: 10px !important;
}
'''

css_path.write_text(css, encoding="utf-8", newline="\n")
print("CSS dense fix applied")

# Verify HTML still has correct structure
for label, p in [("en","index.html"),("zh","zh/index.html"),("es","es/index.html")]:
    t = Path(p).read_text(encoding="utf-8")
    ok = (
        'class="workspace"' in t
        and t.find("formula-block") < t.find("result-panel")
        and t.find("input-panel") < t.find("result-panel")
        and "opb3e" in t
    )
    print(label, "structure_ok" if ok else "STRUCTURE BAD", "cache", "opb3e" in t)
