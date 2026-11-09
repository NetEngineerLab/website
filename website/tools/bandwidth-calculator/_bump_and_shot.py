from pathlib import Path
from playwright.sync_api import sync_playwright

for p in [Path("index.html"), Path("zh/index.html"), Path("es/index.html")]:
    t = p.read_text(encoding="utf-8")
    t2 = t.replace("?v=20261105-opb3e", "?v=20261105-opb3e2")
    if t2 == t:
        print(p, "NO cache bump found")
    else:
        p.write_text(t2, encoding="utf-8", newline="\n")
        print(p, "cache -> opb3e2")

out = Path("_opb3e_desktop.png")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1440,"height":1100})
    page.goto("http://127.0.0.1:4173/tools/bandwidth-calculator/?v=opb3e2", wait_until="networkidle", timeout=45000)
    page.locator("#calculateBtn").click()
    page.wait_for_timeout(400)
    # crop workspace area
    page.locator(".workspace").screenshot(path=str(out))
    browser.close()
print("screenshot", out, "size", out.stat().st_size)
