'use strict';

const activeTools = require('../../src/registry/tool-registry.json').filter(tool => tool.status === 'active');
const complexTools = new Set([
  'acl-generator-validator',
  'ipv6-nat-planner',
  'network-change-planner-mop-generator',
  'wifi-coverage-capacity-planner',
  'network-risk-hidden-hazard-assessment-generator',
  'odf-odn-resource-planner'
]);
const localeCount = tool => ['en', 'zh', 'es'].filter(locale => {
  const rel = locale === 'en' ? 'index.html' : `${locale}/index.html`;
  return tool.translations?.[locale] && require('fs').existsSync(require('path').join(__dirname, '..', '..', 'website', 'tools', tool.id, rel));
}).length;
const supplemental = require('./supplemental-tool-slugs');
const auditableTools = activeTools.filter(tool => !supplemental.has(tool.id) && localeCount(tool) > 0);
const auditableIds = new Set(auditableTools.map(tool => tool.id));
const pageCount = auditableTools.reduce((count, tool) => count + localeCount(tool), 0);
const ordinaryPageCount = auditableTools.reduce((count, tool) => count + (complexTools.has(tool.id) ? 0 : localeCount(tool)), 0);
if (auditableTools.length < 35 || pageCount < 80) {
  throw new Error(`UI audit baseline cannot shrink below 35 tools and 80 locale pages; registry has ${auditableTools.length} tools and ${pageCount} pages`);
}
function skip(name) {
  return name === 'zh' || name === 'es' || supplemental.has(name) || !auditableIds.has(name);
}

module.exports = {
  // Counts follow the active registry and the locale files on disk.
  // Hubs and supplemental planners are not tool-detail pages.
  activeToolCount: auditableTools.length,
  pageCount,
  ordinaryPageCount,
  complexTools,
  auditableIds,
  skip
};
