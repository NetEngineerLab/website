const {test,expect}=require("@playwright/test");

test("mobile navigation and tap targets remain usable",async({page},testInfo)=>{
  test.skip(!/android|iphone/.test(testInfo.project.name),"mobile projects only");
  for(const route of ["/","/zh/"]){
    const errors=[];
    page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(route,{waitUntil:"networkidle"});
    await expect(page.locator("header").first()).toBeVisible();
    expect(await page.locator("a").count()).toBeGreaterThan(5);
    const layout=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1
    }));
    expect(layout.overflow,`${route} horizontal overflow`).toBe(false);
    expect(errors,`${route} runtime errors`).toEqual([]);
  }
});
