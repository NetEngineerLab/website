// Every published tool page, in every locale, must load without uncaught
// script errors, missing same-origin assets or NaN/[object …] output. This is
// the guard for translated element ids and locale-specific asset paths.
const fs=require("fs");
const path=require("path");
const {test,expect}=require("@playwright/test");

const toolsRoot=path.resolve(__dirname,"../../website/tools");
const pages=[];
for(const slug of fs.readdirSync(toolsRoot).sort()){
 const dir=path.join(toolsRoot,slug);
 if(!fs.existsSync(path.join(dir,"index.html"))||slug==="zh"||slug==="es")continue;
 const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
 if(!/<main\b/i.test(html))continue;
 pages.push(`/tools/${slug}/`);
 for(const locale of ["zh","es"])if(fs.existsSync(path.join(dir,locale,"index.html")))pages.push(`/tools/${slug}/${locale}/`);
}

test.describe("locale tool pages load cleanly",()=>{
 test.beforeEach(async({page},testInfo)=>{
  test.skip(testInfo.project.name!=="chrome-desktop","one desktop project covers the full page sweep");
  await page.addInitScript(()=>{try{localStorage.setItem("nel_cookie_consent_v1","false")}catch{}});
 });
 test("covers every tool page",async({},testInfo)=>{
  test.skip(testInfo.project.name!=="chrome-desktop");
  expect(pages.length).toBeGreaterThanOrEqual(120);
 });
 for(const url of pages){
  test(`${url} has no page errors`,async({page,baseURL})=>{
   const errors=[];
   const failed=[];
   page.on("pageerror",error=>errors.push(error.message));
   page.on("response",response=>{
    const target=response.url();
    if(target.startsWith(baseURL)&&response.status()>=400)failed.push(`${response.status()} ${target.slice(baseURL.length)}`);
   });
   await page.goto(url,{waitUntil:"load"});
   await page.waitForTimeout(400);
   const text=await page.locator("main").first().innerText();
   expect(errors,`uncaught errors on ${url}`).toEqual([]);
   expect(failed,`failed same-origin requests on ${url}`).toEqual([]);
   expect(text,`NaN or object output on ${url}`).not.toMatch(/\bNaN\b|\[object [A-Za-z]+\]/);
   const expected=url.includes("/zh/")?"zh":url.includes("/es/")?"es":"en";
   expect((await page.evaluate(()=>document.documentElement.lang)).toLowerCase().startsWith(expected),`html lang on ${url}`).toBe(true);
  });
 }
});
