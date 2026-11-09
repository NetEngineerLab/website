from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    page=b.new_page(viewport={"width":1440,"height":1000})
    page.goto("http://127.0.0.1:4173/tools/bandwidth-calculator/?v=opb3e3x", wait_until="networkidle")
    page.locator("#calculateBtn").click(); page.wait_for_timeout(400)
    info=page.evaluate("""() => {
      const el = document.querySelector('#transferHeadline');
      const cs = getComputedStyle(el);
      const kids = [...el.childNodes].map(n => {
        if(n.nodeType===3) return {type:'text', text:n.textContent, };
        if(n.nodeType===1){
          const c=getComputedStyle(n);
          return {type:'el', tag:n.tagName, class:n.className, text:n.textContent, fontSize:c.fontSize, fontWeight:c.fontWeight, color:c.color, display:c.display};
        }
        return null;
      });
      const r=el.getBoundingClientRect();
      return {html:el.innerHTML, text:el.innerText, fontSize:cs.fontSize, lineHeight:cs.lineHeight, height:r.height, width:r.width, kids};
    }""")
    print(json.dumps(info, indent=2, ensure_ascii=False))
    # also gap visual between actions and formula with bounding boxes relative
    gap=page.evaluate("""() => {
      const a=document.querySelector('.input-actions');
      const f=document.querySelector('.formula-block');
      const ar=a.getBoundingClientRect(), fr=f.getBoundingClientRect();
      // sample a point between them for background
      return {aBottom:ar.bottom, fTop:fr.top, gap:fr.top-ar.bottom, aHeight:ar.height, panelPad: getComputedStyle(document.querySelector('.input-panel')).padding};
    }""")
    print('gapinfo', gap)
    b.close()
