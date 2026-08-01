const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const origin = 'https://netengineerlab.com';
const skippedDirectories = new Set(['assets', 'data', 'scripts', '.well-known', 'integration']);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).split(path.sep);
    if (entry.isDirectory()) {
      return skippedDirectories.has(entry.name) ? [] : walk(absolute);
    }
    return entry.isFile() && entry.name === 'index.html' ? [absolute] : [];
  });
}

function routeFromFile(file) {
  const directory = path.relative(root, path.dirname(file)).split(path.sep).join('/');
  return directory ? `/${directory}/` : '/';
}

function pairForRoute(route) {
  if (route === '/') return { en: '/', zh: '/zh/' };
  if (route === '/zh/') return { en: '/', zh: '/zh/' };
  if (route === '/tools/') return { en: '/tools/', zh: '/tools/zh/' };
  if (route === '/tools/zh/') return { en: '/tools/', zh: '/tools/zh/' };
  if (route.startsWith('/zh/')) return { en: route.replace(/^\/zh/, ''), zh: route };
  if (route.startsWith('/tools/') && route.endsWith('/zh/')) {
    return { en: route.replace(/\/zh\/$/, '/'), zh: route };
  }
  if (route.startsWith('/tools/')) {
    return { en: route, zh: route.replace(/\/$/, '/zh/') };
  }
  return { en: route, zh: `/zh${route}` };
}

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const routes = [...new Set(walk(root).map(routeFromFile))].sort((a, b) => {
  if (a === '/') return -1;
  if (b === '/') return 1;
  return a.localeCompare(b);
});
const routeSet = new Set(routes);

for (const route of routes) {
  const pair = pairForRoute(route);
  if (!routeSet.has(pair.en) || !routeSet.has(pair.zh)) {
    throw new Error(`Missing bilingual route pair for ${route}: ${pair.en}, ${pair.zh}`);
  }
}

const entries = routes.map((route) => {
  const pair = pairForRoute(route);
  const loc = `${origin}${route}`;
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${origin}${pair.en}`)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeXml(`${origin}${pair.zh}`)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${origin}${pair.en}`)}"/>`,
    '  </url>'
  ].join('\n');
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...entries,
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(root, 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap.xml with ${routes.length} bilingual URLs.`);
