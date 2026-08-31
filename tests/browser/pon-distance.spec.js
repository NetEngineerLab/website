const {test,expect}=require("@playwright/test");

for(const locale of ["en","zh"]){
  test(`PON distance boundaries and stale-result guard ${locale}`,async({page})=>{
    const errors=[];page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});page.on("pageerror",e=>errors.push(e.message));
    await page.goto(`/tools/pon-distance/${locale==="zh"?"zh/":""}`,{waitUntil:"networkidle"});
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"✓ 满足设计":"✓ Design passes");
    await page.locator("#plannedDistance").fill("1000");await page.locator("#calculateBtn").click();
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"✕ 预算不足":"✕ Insufficient budget");
    await page.locator("#spliceCount").fill("1.5");
    await expect(page.locator("#saveBtn")).toBeDisabled();await expect(page.locator("#csvBtn")).toBeDisabled();
    await expect(page.locator("#effectiveMax")).toHaveText("—");
    expect(errors).toEqual([]);
  });
}
