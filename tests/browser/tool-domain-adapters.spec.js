const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

async function captureClipboard(page){
 await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedText=text}}});window.print=()=>{window.__printCalls=(window.__printCalls||0)+1};});
}
async function dismissCookie(page){
 const reject=page.locator('.nel-cookie-reject');
 if(await reject.isVisible()){await reject.focus();await page.keyboard.press('Enter');await expect(reject).toBeHidden();}
}
async function verifyInputActions(page,field,changed,output){
 const calculate=page.locator('[data-nel-action="calculate"]'),reset=page.locator('[data-nel-action="reset"]');
 await expect(calculate).toHaveCount(1);await expect(reset).toHaveCount(1);
 const initialInput=await page.locator(field).inputValue(),initialOutput=await page.locator(output).textContent();
 await page.locator(field).fill(changed);await calculate.focus();await page.keyboard.press('Enter');
 await expect(page.locator(output)).not.toHaveText(initialOutput);
 await reset.focus();await page.keyboard.press('Space');
 await expect(page.locator(field)).toHaveValue(initialInput);await expect(page.locator(output)).toHaveText(initialOutput);
}
for(const locale of ['en','zh','es']){
 const suffix=locale==='en'?'':locale+'/';
 for(const [slug,field] of [['poe-voltage-drop-calculator','#lengthM'],['wireless-link-budget-calculator','#distanceKm']]){
  test(`${slug} ${locale}: only manual invalid Calculate moves focus to a field or error summary`,async({page})=>{
   await page.goto('/tools/'+slug+'/'+suffix,{waitUntil:'networkidle'});
   await dismissCookie(page);
   const input=page.locator(field),calculate=page.locator('[data-nel-action="calculate"]'),reset=page.locator('[data-nel-action="reset"]'),error=page.locator('#error');
   // An intermediate minus is a real native number badInput, not a test-added
   // constraint or a new domain threshold.
   await input.fill('');await input.pressSequentially('-');
   expect(await input.evaluate(element=>element.validity.badInput)).toBe(true);
   await expect(input).toBeFocused();
   await calculate.focus();await page.keyboard.press('Enter');await expect(input).toBeFocused();
   // Zero is rejected by these engines, but the original number inputs have
   // no native min constraint. The localized error is therefore the owner.
   await input.fill('0');await expect(input).toBeFocused();
   await calculate.focus();await page.keyboard.press('Enter');await expect(error).toBeFocused();await expect(error).toHaveAttribute('tabindex','-1');
   await reset.focus();await expect(error).not.toHaveAttribute('tabindex');await page.keyboard.press('Space');await expect(reset).toBeFocused();
   await expect(error).toBeHidden();expect(await page.evaluate(()=>window.NELToolInputController.isValid())).toBe(true);
  });
 }
 test(`PoE ${locale}: optional empty budget, invalid state and recovery retain engine behavior`,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await captureClipboard(page);
  await page.goto('/tools/poe-voltage-drop-calculator/'+suffix,{waitUntil:'networkidle'});
  await dismissCookie(page);
  await expect(page.locator('#remoteV')).toHaveText('45.64');
  await verifyInputActions(page,'#lengthM','100','#remoteV');
  if(locale==='es'){await expect(page.locator('label[for="pseBudgetW"]')).toHaveText('Presupuesto del PSE');await expect(page.locator('#standard option').first()).toHaveText('Sin comprobación de clase');}
  expect(await page.evaluate(()=>({status:lastResult.status,budget:lastResult.pseBudgetW,warnings:lastResult.warnings}))).toEqual({status:'pass',budget:null,warnings:[]});
  await page.locator('#pseBudgetW').fill('0');expect(await page.evaluate(()=>lastResult.warnings)).toContain('budget');if(locale==='es')await expect(page.locator('#warnings')).toContainText('presupuesto de potencia del PSE');
  await page.locator('#pseBudgetW').fill('');expect(await page.evaluate(()=>lastResult.pseBudgetW)).toBeNull();
  await page.locator('#copy').click();const copied=JSON.parse(await page.evaluate(()=>window.__copiedText));expect(copied.remoteV).toBe(45.64);expect(copied.pseBudgetW).toBeNull();
  if(locale==='es')await expect(page.locator('#copy')).toHaveText('Copiado');
  await page.locator('#lengthM').fill('0');await expect(page.locator('#error')).toBeVisible();
  if(locale==='es'){await expect(page.locator('#error')).toHaveText('Introduzca parámetros válidos.');await expect(page.locator('#status')).toHaveText('Entrada no válida');}
  for(const id of ['remoteV','dropV','current','perConductorA','loopR','lossW','lossPct','startupVoltage','budgetRequired','budgetMargin'])await expect(page.locator('#'+id)).toHaveText('—');
  await expect(page.locator('#copy')).toBeDisabled();await expect(page.locator('#print')).toBeDisabled();expect(await page.evaluate(()=>lastResult)).toBeNull();
  for(const action of ['save','export'])await expect(page.locator(`[data-nel-action="${action}"]`)).toBeDisabled();
  await expect(page.locator('.nel-tool-result')).toHaveAttribute('aria-live','polite');
  await page.locator('#lengthM').fill('90');await expect(page.locator('#remoteV')).toHaveText('45.64');await expect(page.locator('#copy')).toBeEnabled();await expect(page.locator('#print')).toBeEnabled();
  await page.locator('#print').click();expect(await page.evaluate(()=>window.__printCalls)).toBe(1);expect(errors).toEqual([]);
 });
 test(`Wireless ${locale}: actual Copy, JSON and CSV carry valid calculated reports`,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await captureClipboard(page);
  await page.goto('/tools/wireless-link-budget-calculator/'+suffix,{waitUntil:'networkidle'});
  await dismissCookie(page);
  await verifyInputActions(page,'#distanceKm','10','#rxPower');
  if(locale==='es'){await expect(page.locator('label[for="rainLoss"]')).toHaveText('Pérdida por lluvia');await expect(page.locator('label[for="protectionLinks"]')).toHaveText('Enlaces de protección');await expect(page.locator('#engineeringDetails')).toContainText('Riesgos');await expect(page.locator('#engineeringDetails')).toContainText('Falta un enlace de protección N+1');}
  await expect(page.locator('.nel-tool-result')).toHaveAttribute('aria-live','polite');
  const displayed=Number(await page.locator('#rxPower').textContent());
  await page.locator('#copy').click();const copied=JSON.parse(await page.evaluate(()=>window.__copiedText));
  expect(copied.tool).toBe('wireless-link-budget-calculator');expect(copied.result.ok).toBe(true);expect(copied.result.rxPower).toBe(displayed);expect(copied.inputs.distanceKm).toBeGreaterThan(0);
  expect(copied.result.beforeAfter.before.rxPower).toBe(displayed);
  const [json]=await Promise.all([page.waitForEvent('download'),page.locator('#json').click()]);
  const report=JSON.parse(fs.readFileSync(await json.path(),'utf8'));expect(report.result.ok).toBe(true);expect(report.inputs).toEqual(copied.inputs);expect(report.result).toEqual(copied.result);
  const [csv]=await Promise.all([page.waitForEvent('download'),page.locator('#csv').click()]);
  const lines=fs.readFileSync(await csv.path(),'utf8').trim().split('\n');expect(lines[0]).toBe('scenario,rxPower,fadeMargin,clearanceMargin,status');expect(Number(lines[1].split(',')[1])).toBe(displayed);expect(lines).toHaveLength(3);
  await page.locator('#distanceKm').fill('0');await expect(page.locator('#error')).toBeVisible();await expect(page.locator('#copy')).toBeDisabled();
  for(const id of ['json','csv','print'])await expect(page.locator('#'+id)).toBeDisabled();
  await expect(page.locator('[data-nel-action="save"]')).toBeDisabled();
  // Native JSON/CSV controls above provide this tool's exports.
  await expect(page.locator('[data-nel-action="export"]')).toHaveCount(0);
  for(const paragraph of await page.locator('#engineeringDetails > p').all())await expect(paragraph).toHaveText('—');
  if(locale==='es')await expect(page.locator('#error')).toContainText('Introduzca valores finitos');
  await page.locator('#distanceKm').fill(String(copied.inputs.distanceKm));await expect(page.locator('#copy')).toBeEnabled();await expect(page.locator('#json')).toBeEnabled();await expect(page.locator('#csv')).toBeEnabled();expect(errors).toEqual([]);
 });
}
