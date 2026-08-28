const {test,expect}=require("@playwright/test");

function captureRuntimeErrors(page){
  const errors=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(`console: ${message.text()}`)});
  page.on("pageerror",error=>errors.push(`page: ${error.message}`));
  return errors;
}

test.describe("homepage",()=>{
  for(const route of ["/","/zh/"]){
    test(`${route} renders without runtime or overflow errors`,async({page})=>{
      const errors=captureRuntimeErrors(page);
      const response=await page.goto(route,{waitUntil:"networkidle"});
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/NetEngineerLab/i);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("main").first()).toBeVisible();
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
      expect(overflow).toBe(false);
      expect(errors).toEqual([]);
    });
  }
});
