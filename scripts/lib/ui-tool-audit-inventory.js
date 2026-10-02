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
const localeCount = tool => ['en', 'zh', 'es'].filter(locale => tool.translations?.[locale]).length;
const pageCount = activeTools.reduce((count, tool) => count + localeCount(tool), 0);
if (activeTools.length < 35 || pageCount < 80) {
  throw new Error(`UI audit baseline cannot shrink below 35 tools and 80 locale pages; registry has ${activeTools.length} tools and ${pageCount} pages`);
}

module.exports = {
  activeToolCount: activeTools.length,
  pageCount,
  ordinaryPageCount: activeTools.reduce((count, tool) => count + (complexTools.has(tool.id) ? 0 : localeCount(tool)), 0),
  complexTools
};
