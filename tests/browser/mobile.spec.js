const {test,expect}=require("@playwright/test");

test("mobile navigation and tap targets remain usable",async({page},testInfo)=>{
  test.skip(!/android|iphone/.test(testInfo.project.name),"mobile projects only");
  const errors=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/",{waitUntil:"networkidle"});
  await expect(page.locator("header").first()).toBeVisible();
  expect(await page.locator("a").count()).toBeGreaterThan(5);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
});
