from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1440,"height":1200})
    page.goto("http://127.0.0.1:4173/tools/bandwidth-calculator/?v=opb3e2b", wait_until="networkidle")
    page.wait_for_timeout(500)
    info = page.evaluate("""() => {
      const calc = document.querySelector('#calculateBtn');
      const reset = document.querySelector('#resetBtn');
      const actions = document.querySelector('.input-actions');
      const formula = document.querySelector('.input-panel .formula-block');
      const big = document.querySelector('#transferHeadline');
      const box = el => {
        if(!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height,
          display:cs.display, visibility:cs.visibility, opacity:cs.opacity,
          color:cs.color, background:cs.backgroundColor, fontSize:cs.fontSize,
          flex:cs.flex, gridColumn:cs.gridColumn, minHeight:cs.minHeight,
          text: (el.innerText||'').slice(0,80)
        };
      };
      // force calculate
      if(calc) calc.click();
      return {
        actions: box(actions),
        calc: box(calc),
        reset: box(reset),
        formula: box(formula),
        big: box(big),
        actionsCS: actions ? {
          display:getComputedStyle(actions).display,
          gridTemplateColumns:getComputedStyle(actions).gridTemplateColumns,
          justifyContent:getComputedStyle(actions).justifyContent,
          gap:getComputedStyle(actions).gap,
          width:getComputedStyle(actions).width,
        } : null,
        gap: (formula && actions) ? (formula.getBoundingClientRect().top - actions.getBoundingClientRect().bottom) : null,
      };
    }""")
    print(json.dumps(info, indent=2))
    browser.close()
