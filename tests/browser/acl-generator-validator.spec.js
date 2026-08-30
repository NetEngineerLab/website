const {test,expect}=require("@playwright/test");

function runtimeErrors(page){const errors=[];page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});page.on("pageerror",error=>errors.push(error.message));return errors}

for(const locale of ["en","zh"]){
  test(`ACL generator validator ${locale}`,async({page})=>{
    const errors=runtimeErrors(page),route=`/tools/acl-generator-validator/${locale==="zh"?"zh/":""}`;
    await page.goto(route,{waitUntil:"networkidle"});
    await page.locator("#validate").click();await expect(page.locator("#score")).toHaveText("100");await expect(page.locator("#coverage")).toContainText(locale==="zh"?"已解析 2 条规则":"Parsed 2 rule");
    await page.locator("#configuration").fill("ip access-list extended BROAD\n 10 permit ip any any\nexit\n");await page.locator("#validate").click();await expect(page.locator(".finding")).toContainText("ACL-001");await expect(page.locator("#score")).not.toHaveText("100");
    await page.locator("#targetVendor").selectOption("juniper-junos");await page.locator("#convert").click();await expect(page.locator("#generatedOutput")).toContainText("set firewall family inet filter BROAD");
    await page.locator("#build").click();await expect(page.locator("#generatedOutput")).toContainText("set firewall family inet filter EDGE-IN");
    await page.locator("#configuration").fill("ip access-list extended PARTIAL\n 10 permit tcp any any eq 443\n unsupported <script>window.__aclPwned=true</script>\nexit\n");await page.locator("#validate").click();await expect(page.locator("#coverage")).toContainText(locale==="zh"?"1 行语法不受支持":"1 unsupported line");expect(await page.evaluate(()=>window.__aclPwned===true)).toBe(false);
    await page.locator("#configuration").fill("<script>window.__aclPwned=true</script>");await page.locator("#validate").click();await expect(page.locator("#statusPanel")).toHaveAttribute("data-tone","error");await expect(page.locator("#score")).toHaveText("—");await expect(page.locator(".finding")).toHaveCount(0);await expect(page.locator("#generatedOutput")).toContainText(locale==="zh"?"当前没有":"No current");expect(await page.evaluate(()=>window.__aclPwned===true)).toBe(false);
    expect((await page.locator("#statusPanel").innerText()).trim()).not.toMatch(/^(?:PASS|FAIL|通过|失败)$/i);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1)).toBe(false);expect(errors).toEqual([]);
  });
}
