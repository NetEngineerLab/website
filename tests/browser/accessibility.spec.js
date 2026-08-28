const fs=require("fs");
const path=require("path");
const {test,expect}=require("@playwright/test");

const root=path.resolve(__dirname,"../..");
const sitemap=fs.readFileSync(path.join(root,"website","sitemap.xml"),"utf8");
const routes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>new URL(match[1]).pathname);

test("all indexed pages expose a complete accessibility structure",async({page})=>{
  for(const route of routes){
    await page.goto(route,{waitUntil:"domcontentloaded"});
    const issues=await page.evaluate(()=>{
      const problems=[];
      const ids=[...document.querySelectorAll("[id]")].map(node=>node.id).filter(Boolean);
      const duplicateIds=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
      if(duplicateIds.length)problems.push(`duplicate ids: ${duplicateIds.join(", ")}`);
      if(!document.documentElement.lang)problems.push("html lang missing");
      if(document.querySelectorAll("main").length!==1)problems.push(`main count ${document.querySelectorAll("main").length}`);
      if(document.querySelectorAll("h1").length!==1)problems.push(`h1 count ${document.querySelectorAll("h1").length}`);
      document.querySelectorAll("img").forEach((img,index)=>{
        if(!img.hasAttribute("alt"))problems.push(`image ${index+1} alt missing`);
      });
      document.querySelectorAll("input,select,textarea").forEach(control=>{
        if(control.type==="hidden"||control.hidden)return;
        if(!control.labels?.length&&!control.getAttribute("aria-label")&&!control.getAttribute("aria-labelledby")){
          problems.push(`unlabelled control ${control.id||control.name||control.tagName}`);
        }
      });
      document.querySelectorAll("button,a[href]").forEach(control=>{
        const name=(control.getAttribute("aria-label")||control.getAttribute("title")||control.textContent||"").trim();
        const imageAlt=control.querySelector("img")?.alt?.trim()||"";
        if(!name&&!imageAlt)problems.push(`unnamed ${control.tagName.toLowerCase()} ${control.className||""}`);
      });
      return problems;
    });
    expect(issues,`${route}\n${issues.join("\n")}`).toEqual([]);
  }
});
