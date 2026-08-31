const {test,expect}=require("@playwright/test");

for(const locale of ["en","zh"]){
  test(`PON splitter power window and stale-result guard ${locale}`,async({page})=>{
    const errors=[];
    page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`/tools/pon-splitter-loss/${locale==="zh"?"zh/":""}`,{waitUntil:"networkidle"});

    await page.locator("#txPower").fill("-20");
    await page.locator("#txMaxPower").fill("-20");
    await page.locator("#rxSensitivity").fill("-30");
    await page.locator("#rxOverload").fill("-8");
    await page.locator("#distance").fill("0");
    await page.locator("#spliceCount").fill("0");
    await page.locator("#connectorCount").fill("0");
    await page.locator("#splitter1").selectOption("0");
    await page.locator("#splitter2").selectOption("0");
    await page.locator("#splitter3").selectOption("0");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"✓ 健康":"✓ Healthy");

    const projectName=`Splitter boundary ${locale}`;
    const disabledImmediately=await page.evaluate(name=>{
      const input=document.getElementById("projectName");
      input.value=name;
      input.dispatchEvent(new Event("input",{bubbles:true}));
      return document.getElementById("saveBtn").disabled;
    },projectName);
    expect(disabledImmediately).toBe(true);
    await expect(page.locator("#saveBtn")).toBeEnabled();
    await page.locator("#saveBtn").click();
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("ponSplitterHistory"))[0].project)).toBe(projectName);
    await page.evaluate(()=>localStorage.removeItem("ponSplitterHistory"));

    await page.locator("#txMaxPower").fill("7");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"✕ 超限":"✕ Failed");
    await expect(page.locator("#rxPower")).toHaveText("-20.00 to 7.00");

    await page.locator("#spliceCount").fill("1.5");
    await expect(page.locator("#saveBtn")).toBeDisabled();
    await expect(page.locator("#csvBtn")).toBeDisabled();
    await page.evaluate(()=>{
      document.getElementById("saveBtn").click();
      document.getElementById("csvBtn").click();
    });
    expect(await page.evaluate(()=>localStorage.getItem("ponSplitterHistory"))).toBeNull();
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"输入无效":"Invalid input");
    await expect(page.locator("#remaining")).toHaveText("—");
    await expect(page.locator("#rxPower")).toHaveText("—");
    expect(errors).toEqual([]);
  });
}
