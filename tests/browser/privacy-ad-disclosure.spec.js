const {test,expect}=require("@playwright/test");
// AdSense readiness: advertising disclosure on the privacy pages, en/zh/es.
for(const path of ["/privacy/","/zh/privacy/","/es/privacy/"]){
  test(`${path} has the advertising disclosure and keeps GA4/local data text`,async({page})=>{
    await page.goto(path,{waitUntil:"domcontentloaded"});
    const s=page.locator("#advertising + p");
    await expect(page.locator("#advertising")).toBeVisible();
    await expect(page.locator('main a[href="https://adssettings.google.com"]')).toHaveCount(1);
    await expect(page.locator('main a[href="https://www.aboutads.info"]')).toHaveCount(1);
    await expect(s).toContainText("Google");
    await expect(page.locator("main")).toContainText("Google Analytics 4");
    await expect(page.locator("main [data-nel-cookie-settings]")).toHaveCount(1);
  });
}
