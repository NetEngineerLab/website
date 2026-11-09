from playwright.sync_api import sync_playwright
import json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    page=b.new_page(viewport={"width":1440,"height":1200})
    page.goto("http://127.0.0.1:4173/tools/optical-power-budget/?v=x", wait_until="domcontentloaded")
    page.wait_for_timeout(500)
    d=page.evaluate("""() => {
      const main=document.querySelector('#calculator')||document.querySelector('main');
      const cs=getComputedStyle(main);
      return {
        mainCls: main.className,
        display: cs.display,
        grid: cs.gridTemplateColumns,
        gap: cs.gap,
        w: main.getBoundingClientRect().width,
        kids: [...main.children].map(el=>{
          const r=el.getBoundingClientRect(); const s=getComputedStyle(el);
          return {cls:(el.className||'').toString().slice(0,50), w:+r.width.toFixed(1), l:+r.left.toFixed(1),
            gridCol:s.gridColumn, gridRow:s.gridRow, order:s.order};
        })
      };
    }""")
    print(json.dumps(d, ensure_ascii=False, indent=2))
    b.close()
