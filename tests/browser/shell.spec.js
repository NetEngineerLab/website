const fs=require("fs");
const path=require("path");
const {test,expect}=require("@playwright/test");

const root=path.resolve(__dirname,"../..");
const sitemap=fs.readFileSync(path.join(root,"website","sitemap.xml"),"utf8");
const indexedRoutes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>new URL(match[1]).pathname);
const routes=[...indexedRoutes,"/404.html","/zh/404.html"];

function isMobileProject(name){return /android|iphone/.test(name)}

function compareWithTolerance(expected,actual,pathName="signature",issues=[]){
  if(typeof expected==="number"&&typeof actual==="number"){
    if(!Number.isFinite(expected)||!Number.isFinite(actual)||Math.abs(expected-actual)>1){
      issues.push(`${pathName}: expected ${expected}, received ${actual}`);
    }
    return issues;
  }
  if(Array.isArray(expected)&&Array.isArray(actual)){
    if(expected.length!==actual.length)issues.push(`${pathName}: array length ${expected.length} != ${actual.length}`);
    for(let index=0;index<Math.min(expected.length,actual.length);index++){
      compareWithTolerance(expected[index],actual[index],`${pathName}[${index}]`,issues);
    }
    return issues;
  }
  if(expected&&actual&&typeof expected==="object"&&typeof actual==="object"){
    const expectedKeys=Object.keys(expected).sort();
    const actualKeys=Object.keys(actual).sort();
    if(JSON.stringify(expectedKeys)!==JSON.stringify(actualKeys))issues.push(`${pathName}: keys differ`);
    for(const key of expectedKeys.filter(key=>Object.hasOwn(actual,key))){
      compareWithTolerance(expected[key],actual[key],`${pathName}.${key}`,issues);
    }
    return issues;
  }
  if(expected!==actual)issues.push(`${pathName}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  return issues;
}

test("all public pages use one computed Header and Footer shell",async({page},testInfo)=>{
  const mobile=isMobileProject(testInfo.project.name);
  await page.setViewportSize(mobile?{width:390,height:844}:{width:1440,height:900});
  expect(await page.evaluate(()=>window.devicePixelRatio),"device pixel ratio").toBe(1);
  const signatures=[];
  for(const route of routes){
    const response=await page.goto(route,{waitUntil:"domcontentloaded"});
    expect(response?.status(),route).toBe(200);
    await expect(page.locator(".site-shell-header"),route).toBeVisible();
    const signature=await page.evaluate(()=>{
      const header=document.querySelector(".site-shell-header");
      const footer=document.querySelector(".site-shell-footer");
      const logo=header.querySelector(".site-shell-brand img");
      const nav=header.querySelector(".site-shell-nav");
      const footerInner=footer.querySelector(".site-shell-footer-inner");
      const style=element=>getComputedStyle(element);
      const h=style(header),f=style(footer),n=style(nav),fi=style(footerInner);
      return{
        header:{
          position:h.position,
          height:header.getBoundingClientRect().height,
          minHeight:parseFloat(h.minHeight),
          padding:[h.paddingTop,h.paddingRight,h.paddingBottom,h.paddingLeft].map(value=>parseFloat(value)),
          background:h.backgroundColor,
          borderBottom:[parseFloat(h.borderBottomWidth),h.borderBottomStyle,h.borderBottomColor],
          logo:[logo.getBoundingClientRect().width,logo.getBoundingClientRect().height],
          navDisplay:n.display
        },
        footer:{
          display:f.display,
          padding:[f.paddingTop,f.paddingRight,f.paddingBottom,f.paddingLeft].map(value=>parseFloat(value)),
          background:f.backgroundColor,
          innerDisplay:fi.display,
          innerGridFlow:fi.gridAutoFlow,
          innerGridColumns:fi.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
          innerFlexDirection:fi.flexDirection,
          innerJustifyItems:fi.justifyItems,
          innerMaxWidth:parseFloat(fi.maxWidth),
          innerWidth:footerInner.getBoundingClientRect().width
        }
      };
    });
    signatures.push({route,signature});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    expect(overflow,`${route} horizontal overflow`).toBe(false);
  }
  const expected=signatures[0].signature;
  const mismatches=signatures.map(item=>({route:item.route,issues:compareWithTolerance(expected,item.signature)})).filter(item=>item.issues.length);
  expect(mismatches,JSON.stringify(mismatches,null,2)).toEqual([]);
});

test("mobile shell navigation opens and closes",async({page},testInfo)=>{
  test.skip(!isMobileProject(testInfo.project.name),"mobile projects only");
  await page.setViewportSize({width:390,height:844});
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const header=page.locator(".site-shell-header");
  const toggle=page.locator(".site-shell-menu-toggle");
  const nav=page.locator(".site-shell-nav");
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(nav).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded","true");
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(header).toHaveAttribute("data-nav-open","false");
});
