const {test,expect}=require("@playwright/test");

for(const locale of ["en","zh"]){
  test(`SFP QSFP directional optical budget ${locale}`,async({page})=>{
    const errors=[];
    page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`/tools/sfp-qsfp-compatibility-calculator/${locale==="zh"?"zh/":""}`,{waitUntil:"networkidle"});
    await expect(page.locator("#status")).toHaveText(locale==="zh"?"通过":"Compatible");

    await page.locator("#distance").fill("0");
    await page.locator("#connectors").fill("0");
    await page.locator("#splices").fill("0");
    await page.locator("#aTxMax").fill("2");
    await page.locator("#calculate").click();
    await expect(page.locator("#status")).toHaveText(locale==="zh"?"不兼容":"Not compatible");
    await expect(page.locator("#checks")).toContainText("A→B -1.50 dB");

    await page.locator("#preset").selectOption("10glr");
    await page.locator("#bRx").fill("-10");
    await page.locator("#calculate").click();
    await expect(page.locator("#status")).toHaveText(locale==="zh"?"不兼容":"Not compatible");
    await expect(page.locator("#checks")).toContainText("A→B -4.00 dB");

    await page.locator("#preset").selectOption("10glr");
    await page.locator("#aTx").fill("");
    await page.locator("#calculate").click();
    await expect(page.locator("#status")).toHaveText(locale==="zh"?"不兼容":"Not compatible");
    await expect(page.locator("#checks")).toContainText(locale==="zh"?"输入有效性":"Input validity");

    await page.locator("#preset").selectOption("10glr");
    await page.locator("#aTxMax").fill("-9");
    await page.locator("#calculate").click();
    await expect(page.locator("#status")).toHaveText(locale==="zh"?"不兼容":"Not compatible");
    await expect(page.locator("#checks")).toContainText(locale==="zh"?"光功率范围":"Optical power range");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1)).toBe(false);
    expect(errors).toEqual([]);
  });
}
