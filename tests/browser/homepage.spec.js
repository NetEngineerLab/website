import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.netengineerlab.com';

test.describe('NetEngineerLab 首页巡检', () => {

  test('首页可以正常打开', async ({ page }) => {

    const errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    await expect(page).toHaveTitle(/NetEngineerLab/i);

    expect(errors).toHaveLength(0);

  });


  test('首页 Logo 存在', async ({ page }) => {

    await page.goto(BASE_URL);

    const logo = page.locator('img');

    await expect(logo.first()).toBeVisible();

  });


  test('首页没有横向溢出', async ({ page }) => {

    await page.goto(BASE_URL);

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth >
             document.documentElement.clientWidth;
    });

    expect(overflow).toBe(false);

  });

});