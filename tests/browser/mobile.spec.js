import { test, expect, devices } from '@playwright/test';


const BASE_URL = 'https://www.netengineerlab.com';


test.use({
  ...devices['iPhone 13']
});


test.describe('NetEngineerLab 移动端巡检', () => {


  test('iPhone 页面不能横向溢出', async ({ page }) => {

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });


    const overflow = await page.evaluate(() => {

      return document.documentElement.scrollWidth >
             document.documentElement.clientWidth;

    });


    expect(overflow).toBe(false);

  });



  test('移动端 Logo 正常显示', async ({ page }) => {


    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });


    const logo = page.locator('img').first();


    await expect(logo).toBeVisible();


    const size = await logo.boundingBox();


    expect(size.width).toBeLessThan(300);


  });



  test('移动端页面没有 JavaScript 错误', async ({ page }) => {


    const errors = [];


    page.on('console', msg => {

      if(msg.type() === 'error') {

        errors.push(msg.text());

      }

    });


    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });


    expect(errors).toHaveLength(0);


  });


});