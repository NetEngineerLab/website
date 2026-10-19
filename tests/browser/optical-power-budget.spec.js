const {test,expect}=require("@playwright/test");

const LABEL={
  en:{healthy:"✓ Healthy",failed:"✕ Failed",invalid:"Invalid input"},
  zh:{healthy:"✓ 健康",failed:"✕ 超限",invalid:"输入无效"},
  es:{healthy:"✓ Correcto",failed:"✕ No cumple",invalid:"Entrada no válida"}
};
for(const locale of ["en","zh","es"]){
  test(`optical power budget minimum/maximum transmit boundary ${locale}`,async({page})=>{
    const errors=[];
    page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`/tools/optical-power-budget/${locale==="en"?"":locale+"/"}`,{waitUntil:"networkidle"});

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
    await expect(page.locator("#healthBadge")).toHaveText(LABEL[locale].healthy);

    const projectName=`Boundary project ${locale}`;
    const disabledImmediately=await page.evaluate(name=>{
      const input=document.getElementById("projectName");
      input.value=name;
      input.dispatchEvent(new Event("input",{bubbles:true}));
      return document.getElementById("saveBtn").disabled;
    },projectName);
    expect(disabledImmediately).toBe(true);
    await expect(page.locator("#saveBtn")).toBeEnabled();
    await page.locator("#saveBtn").click();
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("opticalBudgetHistory"))[0].project)).toBe(projectName);
    await page.evaluate(()=>localStorage.removeItem("opticalBudgetHistory"));

    await page.locator("#txMaxPower").fill("7");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#healthBadge")).toHaveText(LABEL[locale].failed);
    await expect(page.locator("#estimatedRx")).toHaveText("-20.00 to 7.00");

    await page.locator("#spliceCount").fill("1.5");
    await expect(page.locator("#saveBtn")).toBeDisabled();
    await expect(page.locator("#csvBtn")).toBeDisabled();
    await page.evaluate(()=>{
      document.getElementById("saveBtn").click();
      document.getElementById("csvBtn").click();
    });
    expect(await page.evaluate(()=>localStorage.getItem("opticalBudgetHistory"))).toBeNull();
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#validation")).not.toBeEmpty();
    await expect(page.locator("#healthBadge")).toHaveText(LABEL[locale].invalid);
    await expect(page.locator("#remainingBudget")).toHaveText("—");
    await expect(page.locator("#estimatedRx")).toHaveText("—");
    await expect(page.locator("#copyBtn")).toBeDisabled();
    await expect(page.locator("#saveBtn")).toBeDisabled();
    await expect(page.locator("#csvBtn")).toBeDisabled();
    expect(await page.evaluate(()=>localStorage.getItem("opticalBudgetHistory"))).toBeNull();
    expect(errors).toEqual([]);
  });
}

for(const locale of ["en","zh","es"]){
  test(`optical power budget presets come from the standards file ${locale}`,async({page})=>{
    await page.goto(`/tools/optical-power-budget/${locale==="en"?"":locale+"/"}`,{waitUntil:"networkidle"});
    await expect(page.locator("#attenuation")).toHaveValue("0.25");
    await expect(page.locator("#maxDistance")).toHaveText("20.00");
    await expect(page.locator("#reachNote")).toContainText("24.80");
    await page.locator("#preset").selectOption("datacenter");
    await expect(page.locator("#connectorCount")).toHaveValue("2");
    await expect(page.locator("#spliceCount")).toHaveValue("0");
    await expect(page.locator("#remainingBudget")).toHaveText("3.50");
    await expect(page.locator("#estimatedRx")).toHaveText("-10.40 to -1.70");
    await expect(page.locator("#maxDistance")).toHaveText("10.00");
    await page.locator("#preset").selectOption("epon");
    await expect(page.locator("#standardOdnBudget")).toHaveText("24.00");
    await expect(page.locator("#remainingBudget")).toHaveText("2.90");
  });
}
