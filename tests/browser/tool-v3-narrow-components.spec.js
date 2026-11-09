const {test,expect}=require("@playwright/test");

for(const slug of ["ipv6-nat-planner","wifi-coverage-capacity-planner","otdr-event"]){
 for(const locale of ["en","zh","es"]){
  test(`${slug} ${locale}: narrow tabs and result actions stay inside their component`,async({page})=>{
   await page.goto(`/tools/${slug}/${locale==="en"?"":locale+"/"}`,{waitUntil:"networkidle"});
   for(const width of [320,375]){
    await page.setViewportSize({width,height:900});
    const geometry=await page.evaluate(()=>{
     const issues=[];
     for(const container of document.querySelectorAll("main .tabs, main .ro-acts")){
      const bounds=container.getBoundingClientRect();if(!bounds.width||!bounds.height)continue;
      for(const button of container.querySelectorAll(":scope > button")){
       const rect=button.getBoundingClientRect();
       if(rect.left<bounds.left-1||rect.right>bounds.right+1||rect.bottom>bounds.bottom+1)issues.push(button.id||button.textContent.trim());
       if(button.scrollWidth>button.clientWidth+1)issues.push("clipped text: "+button.textContent.trim());
      }
     }
     return {issues,overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    expect(geometry,`${slug}/${locale} at ${width}px`).toEqual({issues:[],overflow:false});
    const tabs=page.locator("main .tabs > button");
    if(await tabs.count()){
     const last=tabs.last();await last.click();
     await expect(last).toHaveClass(/active/);
     await last.focus();await page.keyboard.press("Enter");
     await expect(last).toHaveClass(/active/);
    }
   }
  });
 }
}
