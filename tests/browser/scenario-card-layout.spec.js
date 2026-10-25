const {test,expect}=require("@playwright/test");
// Hotfix 2026-10-20: scenario card text must not overlap or overflow its card.
const PAGES=["fiber-loss","subnet-calculator","poe-power-budget-calculator"];
for(const slug of PAGES)for(const folder of ["","zh/","es/"])for(const vp of [{width:1366,height:900},{width:390,height:844}]){
  test(`${slug} ${folder||"en/"} scenario cards do not overlap at ${vp.width}px`,async({page})=>{
    await page.setViewportSize(vp);
    await page.goto(`/tools/${slug}/${folder}`,{waitUntil:"networkidle"});
    await page.locator("#scenarios").scrollIntoViewIfNeeded();
    const problems=await page.evaluate(()=>{
      const out=[];const cards=[...document.querySelectorAll(".nel-scenario-card")];
      if(cards.length<2)out.push("fewer than 2 cards");
      const R=e=>e.getBoundingClientRect();
      const inter=(a,b)=>a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1;
      cards.forEach((c,i)=>{const cr=R(c);
        cards.slice(i+1).forEach((d,j)=>{if(inter(cr,R(d)))out.push(`card ${i} overlaps card ${i+j+1}`);});
        const kids=[...c.querySelectorAll("h3,p,strong,a")].filter(k=>R(k).width>0);
        for(const k of kids){const r=R(k);if(r.left<cr.left-1||r.right>cr.right+1||r.bottom>cr.bottom+1)out.push(`card ${i} ${k.tagName} outside card`);}
        const blocks=[...c.querySelectorAll(":scope h3, :scope p")];
        for(let a=0;a<blocks.length;a++)for(let b=a+1;b<blocks.length;b++)if(inter(R(blocks[a]),R(blocks[b])))out.push(`card ${i} text blocks ${a}/${b} overlap`);
      });
      return out;});
    expect(problems).toEqual([]);
  });
}
