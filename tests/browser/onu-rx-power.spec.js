const {test,expect}=require("@playwright/test");
const fs=require("fs");

for(const locale of ["en","zh"]){
  test(`ONU RX thresholds and stale-result guard ${locale}`,async({page})=>{
    const errors=[];
    page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`/tools/onu-rx-power/${locale==="zh"?"zh/":""}`,{waitUntil:"networkidle"});

    await page.locator("#measuredRx").fill("-24");
    await page.locator("#rxSensitivity").fill("-27");
    await page.locator("#rxOverload").fill("-8");
    await page.locator("#noSignalThreshold").fill("-40");
    await page.locator("#warningMargin").fill("3");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"✓ 正常":"✓ Normal");

    const projectName=`ONU boundary ${locale}`;
    const disabledImmediately=await page.evaluate(name=>{
      const input=document.getElementById("projectName");
      input.value=name;
      input.dispatchEvent(new Event("input",{bubbles:true}));
      return document.getElementById("saveBtn").disabled;
    },projectName);
    expect(disabledImmediately).toBe(true);
    await expect(page.locator("#saveBtn")).toBeEnabled();
    await page.locator("#saveBtn").click();
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("onuRxDiagnosisHistory"))[0].project)).toBe(projectName);
    await page.evaluate(()=>localStorage.removeItem("onuRxDiagnosisHistory"));

    await page.locator("#measuredRx").fill("-7.9");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"⚡ 光功率过高":"⚡ Optical overload");

    await page.locator("#measuredRx").fill("-24");
    await page.locator("#spliceCount").fill("1.5");
    await page.locator('.mode-tab[data-mode="measured"]').click();
    await expect(page.locator("#modelResults")).toHaveClass(/hidden/);
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"✓ 正常":"✓ Normal");
    const quickReport=await page.evaluate(()=>report());
    expect(quickReport).not.toContain("Expected RX");
    expect(quickReport).not.toContain("理论接收功率");
    const downloadPromise=page.waitForEvent("download");
    await page.locator("#csvBtn").click();
    const download=await downloadPromise;
    const csvText=fs.readFileSync(await download.path(),"utf8");
    expect(csvText).not.toContain("Expected RX dBm");
    expect(csvText).not.toContain("Inferred excess loss dB");

    await page.locator('.mode-tab[data-mode="model"]').click();
    await page.locator("#measuredRx").fill("");
    await page.locator('.mode-tab[data-mode="measured"]').click();
    await expect(page.locator("#modelResults")).toHaveClass(/hidden/);
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"输入无效":"Invalid input");
    await page.locator("#measuredRx").fill("-24");
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"✓ 正常":"✓ Normal");

    await page.locator('.mode-tab[data-mode="model"]').click();
    await expect(page.locator("#saveBtn")).toBeDisabled();
    await expect(page.locator("#csvBtn")).toBeDisabled();
    await page.evaluate(()=>{
      document.getElementById("saveBtn").click();
      document.getElementById("csvBtn").click();
    });
    expect(await page.evaluate(()=>localStorage.getItem("onuRxDiagnosisHistory"))).toBeNull();
    await expect(page.locator("#healthBadge")).toHaveText(locale==="zh"?"输入无效":"Invalid input");
    await expect(page.locator("#measuredResult")).toHaveText("—");
    await expect(page.locator("#expectedRx")).toHaveText("—");
    expect(errors).toEqual([]);
  });
}
