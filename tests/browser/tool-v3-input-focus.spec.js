const {test,expect}=require("@playwright/test");

for(const slug of ["poe-voltage-drop-calculator","wireless-link-budget-calculator"]){
 for(const locale of ["en","zh","es"]){
  test(`${slug} ${locale}: keyboard input focus has a visible focus owner`,async({page})=>{
   await page.goto(`/tools/${slug}/${locale==="en"?"":locale+"/"}`,{waitUntil:"networkidle"});
   const reject=page.locator(".nel-cookie-reject");
   if(await reject.isVisible()){await reject.focus();await page.keyboard.press("Enter");await expect(reject).toBeHidden();}
   const input=page.locator("main .input-wrap input:not([type=hidden]):not([disabled])").first();
   await expect(input).toBeVisible();
   const ownerStyle=()=>input.evaluate(el=>{
    const owner=el.closest(".input-wrap, .inp")||el,s=getComputedStyle(owner),r=owner.getBoundingClientRect();
    return {outline:s.outlineStyle,width:parseFloat(s.outlineWidth),shadow:s.boxShadow,visible:r.width>0&&r.height>0&&s.visibility!=="hidden",focused:document.activeElement===el};
   });
   for(const width of [390,1280]){
    await page.setViewportSize({width,height:900});
    await input.evaluate(el=>el.blur());
    const before=await ownerStyle();
    // Enter keyboard modality, then return to the actual input via Tab.
    await input.focus();await page.keyboard.press("Tab");await page.keyboard.press("Shift+Tab");
    await expect(input).toBeFocused();
    const after=await ownerStyle();
    expect(after.visible).toBe(true);
    const outline=after.outline!=="none"&&after.width>=2;
    const changedRing=after.shadow!=="none"&&after.shadow!==before.shadow;
    expect(outline||changedRing,`${slug}/${locale} ${width}px must paint a focus indicator on input or wrapper`).toBe(true);
   }
  });
 }
}
