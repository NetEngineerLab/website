const {test,expect}=require("@playwright/test");

for(const locale of ["en","zh"]){
  test(`Switch uplink loss and recovery ${locale}`,async({page})=>{
    const errors=[];
    page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`/tools/switch-uplink-oversubscription-calculator/${locale==="zh"?"zh/":""}`,{waitUntil:"networkidle"});
    await page.locator("#uplinks").fill("1");
    await page.locator("#failedUplinks").fill("1");
    await expect(page.locator("#scenario")).toContainText(locale==="zh"?"无可用上联":"No available uplinks");
    const failed=await page.evaluate(()=>window.lastResult.scenarios.nMinus1);
    expect(failed).toMatchObject({activeUplinks:0,capacityState:"unavailable",demandUtil:null,oversubscription:null,status:"fail"});
    expect(failed.warnings).toContain("noAvailableUplinks");
    await expect(page.locator("#oversubscription")).toHaveText(/^[0-9.,]+:1$/);
    await page.locator("#uplinks").fill("2");
    await expect(page.locator("#scenario")).not.toContainText(locale==="zh"?"无可用上联":"No available uplinks");
    const recovered=await page.evaluate(()=>window.lastResult.scenarios.nMinus1);
    expect(recovered.activeUplinks).toBe(1);
    expect(recovered.capacityState).toBe("available");
    expect(Number.isFinite(recovered.demandUtil)).toBe(true);
    expect(recovered.oversubscription).toMatch(/^[0-9.]+:1$/);
    await expect(page.locator("#oversubscription")).toHaveText(/^[0-9.,]+:1$/);
    expect(await page.locator(".result-panel").innerText()).not.toMatch(/Infinity|NaN/);
    expect(errors).toEqual([]);
  });
}
