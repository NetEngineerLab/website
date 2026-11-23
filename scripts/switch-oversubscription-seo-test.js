'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
let failed = 0;
const check = (name, ok, detail) => {
  if (!ok) {
    failed++;
    console.error('FAIL', name, detail || '');
  } else console.log('PASS', name);
};

const enginePath = 'website/tools/switch-uplink-oversubscription-calculator/js/engine.js';
const engineHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, enginePath))).digest('hex');
check('frozen switch engine hash', engineHash === '1f9256e50195541323f7321f828266e2e762ee52a89b5016843640c49a2210e4', engineHash);
const Engine = require(path.join(root, enginePath));
const line = input => Engine.calculate({util: 100, concurrency: 100, overhead: 0, target: 70, ...input});
const defaults = Engine.calculate({ports: 48, portMbps: 1000, util: 20, concurrency: 60, overhead: 20, uplinkMbps: 10000, uplinks: 2, target: 70});
check('default form', defaults.ok && defaults.offeredGbps === 48 && defaults.demandGbps === 6.91 && defaults.uplinkGbps === 20 && defaults.oversubscription === '2.4:1' && defaults.demandUtil === 34.6 && defaults.safeGbps === 14 && defaults.spareGbps === 7.09 && defaults.status === 'pass');
check('48x1 2x10', line({ports: 48, portMbps: 1000, uplinkMbps: 10000, uplinks: 2}).oversubscription === '2.4:1');
check('48x1 3x10', line({ports: 48, portMbps: 1000, uplinkMbps: 10000, uplinks: 3}).oversubscription === '1.6:1');
check('48x1 1x10', line({ports: 48, portMbps: 1000, uplinkMbps: 10000, uplinks: 1}).oversubscription === '4.8:1');
check('48x1 2x25 display', line({ports: 48, portMbps: 1000, uplinkMbps: 25000, uplinks: 2}).oversubscription === '1:1');
check('48x1 1x25 display', line({ports: 48, portMbps: 1000, uplinkMbps: 25000, uplinks: 1}).oversubscription === '1.9:1');
check('48x1 1x100 display', line({ports: 48, portMbps: 1000, uplinkMbps: 100000, uplinks: 1}).oversubscription === '0.5:1');
check('1:1', line({ports: 48, portMbps: 10000, uplinkMbps: 40000, uplinks: 12}).oversubscription === '1:1');
check('2:1', line({ports: 48, portMbps: 10000, uplinkMbps: 40000, uplinks: 6}).oversubscription === '2:1');
check('4:1', line({ports: 48, portMbps: 10000, uplinkMbps: 40000, uplinks: 3}).oversubscription === '4:1');
check('8:1', line({ports: 48, portMbps: 10000, uplinkMbps: 10000, uplinks: 6}).oversubscription === '8:1');
check('48x10 4x100', line({ports: 48, portMbps: 10000, uplinkMbps: 100000, uplinks: 4}).oversubscription === '1.2:1');

const families = [
  {
    route: 'guides/switch-oversubscription-ratio/',
    files: {
      en: 'website/guides/switch-oversubscription-ratio/index.html',
      zh: 'website/zh/guides/switch-oversubscription-ratio/index.html',
      es: 'website/es/guides/switch-oversubscription-ratio/index.html'
    },
    markers: {
      en: ['1:1', '2:1', '4:1', '8:1', '2.4:1', '0.96:1', '1.6:1', '6.91', 'Full-duplex', 'not measured congestion'],
      zh: ['1:1', '2:1', '4:1', '8:1', '2.4:1', '0.96:1', '1.6:1', '6.91', '全双工', '不是拥塞'],
      es: ['1:1', '2:1', '4:1', '8:1', '2.4:1', '0.96:1', '1.6:1', '6.91', 'full duplex', 'no es congestión']
    }
  },
  {
    route: 'guides/switch-oversubscription-n-1/',
    files: {
      en: 'website/guides/switch-oversubscription-n-1/index.html',
      zh: 'website/zh/guides/switch-oversubscription-n-1/index.html',
      es: 'website/es/guides/switch-oversubscription-n-1/index.html'
    },
    markers: {
      en: ['1.6:1', '2.4:1', '10 Gbps', 'N+1', 'standby'],
      zh: ['1.6:1', '2.4:1', '10 Gbps', 'N+1', '备用'],
      es: ['1.6:1', '2.4:1', '10 Gbps', 'N+1', 'espera']
    }
  },
  {
    route: 'guides/lacp-member-congestion/',
    files: {
      en: 'website/guides/lacp-member-congestion/index.html',
      zh: 'website/zh/guides/lacp-member-congestion/index.html',
      es: 'website/es/guides/lacp-member-congestion/index.html'
    },
    markers: {
      en: ['RFC 7424', 'one flow', 'member A', '20 Gbps', 'not standardized'],
      zh: ['RFC 7424', '一条流', '成员 A', '20 Gbps', '没有规定'],
      es: ['RFC 7424', 'un flujo', 'miembro A', '20 Gbps', 'no está normalizado']
    }
  },
  {
    route: 'guides/10g-vs-25g-uplinks/',
    files: {
      en: 'website/guides/10g-vs-25g-uplinks/index.html',
      zh: 'website/zh/guides/10g-vs-25g-uplinks/index.html',
      es: 'website/es/guides/10g-vs-25g-uplinks/index.html'
    },
    markers: {
      en: ['1×40G', '1×100G', '0.48:1', '1.2:1', 'not measured congestion'],
      zh: ['1×40G', '1×100G', '0.48:1', '1.2:1', '不是实测拥塞'],
      es: ['1×40G', '1×100G', '0.48:1', '1.2:1', 'no es congestión']
    }
  },
  {
    route: 'topics/switch-oversubscription/',
    files: {
      en: 'website/topics/switch-oversubscription/index.html',
      zh: 'website/zh/topics/switch-oversubscription/index.html',
      es: 'website/es/topics/switch-oversubscription/index.html'
    },
    markers: {
      en: ['2.4:1', '+7 Gbps', '−3 Gbps', '1:1', 'LACP', 'denominator'],
      zh: ['2.4:1', '1:1', 'LACP', '分母'],
      es: ['2.4:1', '+7 Gbps', '−3 Gbps', '1:1', 'LACP', 'denominador']
    }
  },
  {
    route: 'tools/switch-uplink-oversubscription-calculator/',
    files: {
      en: 'website/tools/switch-uplink-oversubscription-calculator/index.html',
      zh: 'website/tools/switch-uplink-oversubscription-calculator/zh/index.html',
      es: 'website/tools/switch-uplink-oversubscription-calculator/es/index.html'
    },
    markers: {
      en: ['6.91', '2.4:1', '1:1', '8:1', '0.96:1', '1.6:1', 'Full duplex', 'not measured congestion'],
      zh: ['6.91', '2.4:1', '1:1', '8:1', '0.96:1', '1.6:1', '全双工', '不是实测拥塞'],
      es: ['6.91', '2.4:1', '1:1', '8:1', '0.96:1', '1.6:1', 'dúplex completo', 'no es congestión']
    }
  }
];

const registry = JSON.parse(read('website/data/sitemap-routes.json'));
const redirects = read('website/_redirects');
check('legacy topic redirect kept', redirects.includes('/topics/switching-oversubscription/ /topics/switch-oversubscription/ 301'));

const urls = [];
for (const family of families) {
  const record = family.route.startsWith('tools/') ? null : registry.routes.find(item => item.route === family.route);
  for (const [locale, file] of Object.entries(family.files)) {
    const html = read(file);
    check(file + ' one h1', (html.match(/<h1[\s>]/g) || []).length === 1);
    for (const marker of family.markers[locale]) check(file + ' ' + marker, html.includes(marker));
    const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
    const descriptionTag = (html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i) || [])[0] || '';
    const description = (descriptionTag.match(/\bcontent=(["'])([\s\S]*?)\1/i) || [])[2];
    if (record) {
      check(file + ' registry title', record.translations[locale] && record.translations[locale].title === title, title);
      check(file + ' registry description', record.translations[locale] && record.translations[locale].description === description);
    }
    const prefix = locale === 'en' ? '' : locale + '/';
    const publicPath = family.route.startsWith('tools/')
      ? (locale === 'en' ? `/tools/switch-uplink-oversubscription-calculator/` : `/tools/switch-uplink-oversubscription-calculator/${locale}/`)
      : `/${prefix}${family.route}`;
    urls.push(publicPath);
    check(file + ' canonical', html.includes(`rel="canonical" href="https://netengineerlab.com${publicPath}"`));
    for (const alt of ['en', 'zh-CN', 'es', 'x-default']) check(file + ' hreflang ' + alt, html.includes(`hreflang="${alt}"`));
  }
  const texts = Object.values(family.files).map(read);
  check(family.route + ' links ratio', texts.every(html => html.includes('switch-oversubscription-ratio/')));
  check(family.route + ' links n-1', texts.every(html => html.includes('switch-oversubscription-n-1/')));
  check(family.route + ' links lacp', texts.every(html => html.includes('lacp-member-congestion/')));
  check(family.route + ' links 10g', texts.every(html => html.includes('10g-vs-25g-uplinks/')));
  check(family.route + ' links topic', texts.every(html => html.includes('topics/switch-oversubscription/')));
  check(family.route + ' links tool', texts.every(html => html.includes('switch-uplink-oversubscription-calculator/')));
}

function listen() {
  const types = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json'};
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath;
    const file = path.normalize(path.join(root, 'website', rel));
    if (!file.startsWith(path.join(root, 'website'))) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, {'content-type': types[path.extname(file)] || 'application/octet-stream'});
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function layout() {
  const server = await listen();
  const {port} = server.address();
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();
  try {
    for (const width of [375, 1024]) {
      await page.setViewportSize({width, height: 900});
      for (const route of urls) {
        const response = await page.goto(`http://127.0.0.1:${port}${route}`, {waitUntil: 'domcontentloaded'});
        check(width + ' ' + route + ' status', response && response.status() === 200, String(response && response.status()));
        const info = await page.evaluate(() => {
          const article = document.querySelector('article');
          const aside = document.querySelector('aside.guide-related-side, aside.guide-toc');
          const style = aside ? getComputedStyle(aside) : null;
          return {
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            article: article ? Math.round(article.getBoundingClientRect().top) : null,
            aside: aside && style && style.display !== 'none' ? Math.round(aside.getBoundingClientRect().top) : null
          };
        });
        check(width + ' ' + route + ' overflow', info.overflow <= 1, String(info.overflow));
        if (width === 375 && info.article !== null && info.aside !== null) {
          check('375 sidebar after article ' + route, info.aside >= info.article, `${info.aside} vs ${info.article}`);
        }
      }
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

layout().then(() => {
  if (failed) {
    console.error(failed + ' failed');
    process.exit(1);
  }
  console.log('PASS switch oversubscription seo');
}).catch(error => {
  console.error(error);
  process.exit(1);
});
