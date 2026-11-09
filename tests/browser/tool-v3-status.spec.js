const {test,expect}=require('@playwright/test');
const properties=['background-color','color','border-top-width','border-top-style','border-top-color','font-family','font-size','font-weight','line-height','padding-top','padding-right','padding-bottom','padding-left','border-radius'];
const profile=locator=>locator.evaluate((element,properties)=>{const style=getComputedStyle(element);return Object.fromEntries(properties.map(property=>[property,style.getPropertyValue(property)]));},properties);

for(const slug of ['poe-voltage-drop-calculator','wireless-link-budget-calculator'])for(const locale of ['en','zh','es']){
 test(`${slug} ${locale}: domain status classes use production status tokens and recover from invalid`,async({page})=>{
  const suffix=locale==='en'?'':locale+'/';
  const dismissCookie=async()=>{const reject=page.locator('.nel-cookie-reject');if(await reject.isVisible())await reject.click();};
  await page.goto('/tools/optical-power-budget/'+suffix,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await dismissCookie();
  const reference={};
  for(const [state,value,canonical]of [['pass',3,'st-pass'],['warning',4,'st-marginal'],['fail',40,'st-fail']]){
   await page.locator('#engineeringMargin').fill(String(value));await expect(page.locator('#healthBadge')).toHaveClass(new RegExp('\\b'+canonical+'\\b'));
   reference[state]=await profile(page.locator('#healthBadge'));
  }
  await page.goto('/tools/'+slug+'/'+suffix,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await dismissCookie();
  const badge=page.locator('#status');
  const fill=async(id,value)=>{const input=page.locator('#'+id);if(await input.evaluate(node=>node.tagName==='SELECT'))await input.selectOption(String(value));else await input.fill(String(value));};
  const states=slug.startsWith('poe')?[['pass','pass'],['warning','warning'],['fail','fail'],['invalid','fail'],['pass','pass']]:[['pass','good'],['excellent','excellent'],['warning','marginal'],['fail','fail'],['invalid','fail'],['pass','good']];
  for(const [state,domain]of states){
   if(slug.startsWith('poe')){
    const values=state==='pass'?{lengthM:90,sourceV:48,loadW:12,tempC:30,minV:44}:{lengthM:100,sourceV:50,loadW:30,tempC:20,minV:state==='warning'?42:44};
    for(const [id,value]of Object.entries({...values,awg:24,pairs:2,contactOhm:.2,efficiency:90,pseBudgetW:''}))await fill(id,value);
    if(state==='invalid')await fill('lengthM',0);
   }else await fill('distanceKm',{pass:5,excellent:1,warning:20,fail:100,invalid:0}[state]);
   await expect(badge).toHaveClass(new RegExp('\\bstatus\\b'));await expect(badge).toHaveClass(new RegExp('\\bbadge\\b'));await expect(badge).toHaveClass(new RegExp('\\b'+domain+'\\b'));
   expect(await profile(badge),slug+'/'+locale+'/'+state).toEqual(reference[state==='invalid'?'fail':state==='excellent'?'pass':state]);
   expect(await page.evaluate(()=>window.lastResult?.ok??false)).toBe(state!=='invalid');
  }
 });
}
