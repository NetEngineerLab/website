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
const auditableTools = activeTools.filter(tool => localeCount(tool) > 0);
const pageCount = auditableTools.reduce((count, tool) => count + localeCount(tool), 0);
if (activeTools.length < 35 || pageCount < 80) {
  throw new Error(`UI audit baseline cannot shrink below 35 tools and 80 locale pages; registry has ${activeTools.length} tools and ${pageCount} pages`);
}

module.exports = {
  // The source-convergence audit covers rendered detail pages, including
  // legacy locale variants that are not represented in the registry's
  // translation count. Keep these baselines aligned with the filesystem
  // inventory used by the audit itself.
  activeToolCount: 39,
  pageCount: 117,
  ordinaryPageCount: 99,
  complexTools
};
