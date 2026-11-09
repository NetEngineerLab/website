from pathlib import Path
css_path = Path("css/style.css")
css = css_path.read_text(encoding="utf-8")
block = r'''
/* === 20261105-opb3e4: primary result unit inline (no hero digit line-break) === */
body.nel-tool-v3 #calculator .summary-card .big > small,
body.nel-tool-v3 #calculator .ro-main .big > small,
body.nel-tool-v3 #calculator #transferHeadline > small,
body.nel-tool-v3 #calculator #requiredHeadline > small,
body.nel-tool-v3 #calculator #capacityHeadline > small,
body.nel-tool-v3 #calculator #volumeHeadline > small{
  display: inline !important;
  font-size: 0.72em !important;
  font-weight: 650 !important;
  color: #5b6b7c !important;
  margin-left: 0.2em;
  white-space: normal !important;
}
body.nel-tool-v3 #calculator .summary-card strong.big,
body.nel-tool-v3 #calculator .ro-main .big,
body.nel-tool-v3 #calculator #transferHeadline,
body.nel-tool-v3 #calculator #requiredHeadline,
body.nel-tool-v3 #calculator #capacityHeadline,
body.nel-tool-v3 #calculator #volumeHeadline{
  font-size: clamp(20px, 1.7vw, 24px) !important;
  line-height: 1.3 !important;
  white-space: normal !important;
}
'''
if "20261105-opb3e4" in css:
    css = css[:css.find("/* === 20261105-opb3e4:")].rstrip() + "\n"
css = css.rstrip() + "\n" + block + "\n"
css_path.write_text(css, encoding="utf-8", newline="\n")
for p in [Path("index.html"), Path("zh/index.html"), Path("es/index.html")]:
    t = p.read_text(encoding="utf-8")
    for old in ["opb3e3","opb3e2","opb3e"]:
        t = t.replace(f"?v=20261105-{old}", "?v=20261105-opb3e4")
    p.write_text(t, encoding="utf-8", newline="\n")
    print(p.name if p.name else p, "opb3e4" in t)
print("done")
