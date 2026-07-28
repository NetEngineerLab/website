import { test, expect } from '@playwright/test';


const BASE_URL = 'https://www.netengineerlab.com';


// 核心工具页面列表
const tools = [

  {
    name: 'MTU测试计算器',
    url: '/tools/mtu-calculator'
  },

  {
    name: '光纤链路损耗计算器',
    url: '/tools/optical-power-budget'
  },

  {
    name: 'IPv6地址规划计算器',
    url: '/tools/ipv6-nat-planner/'
  },

  {
    name: 'UPS电池续航计算器',
    url: '/tools/48v-battery-runtime/'
  }

];



test.describe('NetEngineerLab 工具页面巡检', () => {



  for (const tool of tools) {


    test(`${tool.name} 页面正常`, async ({ page }) => {


      const errors = [];


      page.on('console', msg => {


        if (msg.type() === 'error') {

          errors.push(msg.text());

        }

      });



      const response = await page.goto(
        BASE_URL + tool.url,
        {
          waitUntil: 'networkidle'
        }
      );



      // 页面状态检查

      expect(response.status()).toBe(200);



      // 标题检查

      const title = await page.title();

      expect(title.length).toBeGreaterThan(0);



      // 页面内容检查

      const bodyText = await page.locator('body').innerText();


      expect(bodyText.length).toBeGreaterThan(100);



      // JS错误检查

      expect(errors).toHaveLength(0);


    });


  }



});